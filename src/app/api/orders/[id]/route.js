import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { sendCancelledOrderNotification } from '@/lib/telegram';
import { getAdminFromToken, getUserFromToken } from '@/lib/auth';
import { sendOrderStatusEmail } from '@/lib/email';

/**
 * GET /api/orders/:id
 * Lấy chi tiết đơn hàng theo ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const order = await db.collection('orders').findOne({ order_id: id });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: order },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy đơn hàng' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/orders/:id
 * Cập nhật đơn hàng (admin or owner only)
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check authentication (allow both admin and regular user)
    const requester = await getUserFromToken(request);
    if (!requester) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Find order
    const order = await db.collection('orders').findOne({ order_id: id });
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    // Permission check: admin or the order owner
    const isAdmin = ['admin', 'super_admin', 'manager'].includes(requester.role);
    const isOwner = order.user_id === requester.user_id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền cập nhật đơn hàng này' },
        { status: 403 }
      );
    }

    // If regular user, only allow cancelling pending orders
    if (!isAdmin && isOwner) {
      if (body.status !== 'cancelled') {
        return NextResponse.json(
          { success: false, error: 'Bạn chỉ có quyền hủy đơn hàng' },
          { status: 403 }
        );
      }
      if (order.status !== 'pending') {
        return NextResponse.json(
          { success: false, error: 'Chỉ có thể hủy đơn hàng đang chờ xử lý' },
          { status: 400 }
        );
      }
    }

    // Validate status transition
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: 'Status không hợp lệ' },
        { status: 400 }
      );
    }

    // Validate status transition rules
    if (body.status && order.status) {
      const currentStatus = order.status;
      const newStatus = body.status;

      // Cannot change from cancelled or completed
      if (currentStatus === 'cancelled' || currentStatus === 'completed') {
        return NextResponse.json(
          { success: false, error: `Không thể thay đổi status từ ${currentStatus}` },
          { status: 400 }
        );
      }

      // Cannot change to cancelled if already delivered
      if (newStatus === 'cancelled' && currentStatus === 'delivered') {
        return NextResponse.json(
          { success: false, error: 'Không thể hủy đơn đã giao' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      updated_at: new Date(),
    };

    // Track changes for change_history
    const changes = [];

    // Helper function to format value for display
    const formatValue = (value) => {
      if (value === null || value === undefined) return null;
      if (Array.isArray(value)) return JSON.stringify(value);
      if (typeof value === 'object') return JSON.stringify(value);
      return value;
    };

    // Helper function to compare and track changes
    const trackChange = (field, oldValue, newValue) => {
      const formattedOld = formatValue(oldValue);
      const formattedNew = formatValue(newValue);

      // Only track if values are different
      if (JSON.stringify(formattedOld) !== JSON.stringify(formattedNew)) {
        changes.push({
          field: field,
          old_value: formattedOld,
          new_value: formattedNew,
        });
      }
    };

    // Track changes for each field
    if (body.customer_name !== undefined && body.customer_name !== order.customer_name) {
      trackChange('customer_name', order.customer_name, body.customer_name);
    }

    if (body.customer_phone !== undefined && body.customer_phone !== order.customer_phone) {
      trackChange('customer_phone', order.customer_phone, body.customer_phone);
    }

    if (body.customer_address !== undefined && body.customer_address !== order.customer_address) {
      trackChange('customer_address', order.customer_address || '', body.customer_address || '');
    }

    if (body.total_price !== undefined && body.total_price !== order.total_price) {
      trackChange('total_price', order.total_price, body.total_price);
    }

    if (body.admin_notes !== undefined && body.admin_notes !== (order.admin_notes || '')) {
      trackChange('admin_notes', order.admin_notes || '', body.admin_notes || '');
    }

    // Track items changes (compare JSON strings)
    if (body.items !== undefined) {
      // Normalize old items
      const oldItems = order.items && Array.isArray(order.items) && order.items.length > 0
        ? JSON.stringify(order.items)
        : null;

      // Normalize new items
      const newItems = Array.isArray(body.items) && body.items.length > 0
        ? JSON.stringify(body.items)
        : null;

      if (oldItems !== newItems) {
        trackChange('items', order.items || null, body.items || null);
      }
    }

    // Track status change (will also be in status_history)
    if (body.status && body.status !== order.status) {
      trackChange('status', order.status, body.status);
    }

    if (body.status) {
      updateData.status = body.status;

      // Add to status_history if exists
      if (!order.status_history) {
        updateData.status_history = [];
      } else {
        updateData.status_history = [...order.status_history];
      }

      // Prepare changed_by_detail
      let changedByDetail = null;
      if (isAdmin) {
        // Admin/Manager/Super Admin
        changedByDetail = {
          type: 'admin',
          user_id: requester.user_id || requester._id?.toString() || '',
          name: requester.name || '',
          phone: requester.phone || '',
          email: requester.email || '',
          role: requester.role || 'admin',
        };
      } else if (isOwner) {
        // User (the owner themselves)
        changedByDetail = {
          type: 'user',
          user_id: requester.user_id || requester._id?.toString() || '',
          name: requester.name || '',
          phone: requester.phone || '',
          email: requester.email || '',
        };
      }

      // Fallback to system if no detail
      if (!changedByDetail) {
        changedByDetail = {
          type: body.changed_by || 'system',
        };
      }

      updateData.status_history.push({
        status: body.status,
        changed_at: new Date(),
        changed_by: body.changed_by || (isAdmin ? 'admin' : (isOwner ? 'user' : 'system')),
        changed_by_detail: changedByDetail,
      });
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    if (body.admin_notes !== undefined) {
      updateData.admin_notes = body.admin_notes;
    }

    // Lưu lý do hủy đơn hàng
    if (body.cancel_reason !== undefined) {
      updateData.cancel_reason = body.cancel_reason;
    }

    if (body.customer_name) {
      updateData.customer_name = body.customer_name;
    }

    if (body.customer_phone) {
      updateData.customer_phone = body.customer_phone;
    }

    if (body.customer_address !== undefined) {
      updateData.customer_address = body.customer_address;
    }

    // Update items
    if (body.items !== undefined) {
      if (Array.isArray(body.items) && body.items.length > 0) {
        updateData.items = body.items;
      } else {
        // Empty items array - keep existing items or set to empty
        updateData.items = [];
      }
    }

    // Update total_price
    if (body.total_price !== undefined) {
      updateData.total_price = parseFloat(body.total_price);
    }

    // Add to change_history if there are any changes
    if (changes.length > 0) {
      // Prepare changed_by_detail
      let changedByDetail = null;
      if (isAdmin) {
        changedByDetail = {
          type: 'admin',
          user_id: requester.user_id || requester._id?.toString() || '',
          name: requester.name || '',
          phone: requester.phone || '',
          email: requester.email || '',
          role: requester.role || 'admin',
        };
      } else if (isOwner) {
        changedByDetail = {
          type: 'user',
          user_id: requester.user_id || requester._id?.toString() || '',
          name: requester.name || '',
          phone: requester.phone || '',
          email: requester.email || '',
        };
      }

      if (!changedByDetail) {
        changedByDetail = {
          type: body.changed_by || (isAdmin ? 'admin' : (isOwner ? 'user' : 'system')),
        };
      }

      // Initialize change_history if not exists
      if (!order.change_history) {
        updateData.change_history = [];
      } else {
        updateData.change_history = [...order.change_history];
      }

      // Add new change entry
      updateData.change_history.push({
        changed_at: new Date(),
        changed_by: body.changed_by || (isAdmin ? 'admin' : (isOwner ? 'user' : 'system')),
        changed_by_detail: changedByDetail,
        changes: changes,
      });
    }

    // Remove undefined fields from updateData before $set
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updateOperation = { $set: updateData };

    const result = await db.collection('orders').updateOne(
      { order_id: id },
      updateOperation
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    // Get updated order
    const updatedOrder = await db.collection('orders').findOne({ order_id: id });

    // Send Telegram notification if order is cancelled (fire and forget)
    if (body.status === 'cancelled') {
      try {
        let cancelledBy = body.changed_by || (isAdmin ? 'admin' : (isOwner ? 'user' : 'system'));

        // Nếu là admin/manager/super_admin và có thông tin admin, sử dụng tên admin
        if (isAdmin && requester) {
          cancelledBy = requester.name || requester.phone || cancelledBy;
        } else if (isOwner && requester) {
          cancelledBy = requester.name || requester.phone || cancelledBy;
        }

        const reason = body.cancel_reason || body.admin_notes || body.notes || updatedOrder.cancel_reason || '';
        await sendCancelledOrderNotification(updatedOrder, cancelledBy, reason, isAdmin ? requester : null);
      } catch (telegramError) {
        console.error('Error sending Telegram notification for cancelled order:', telegramError);
        // Continue even if Telegram fails
      }
    }

    // Send email notification if status changed (fire and forget)
    if (body.status && body.status !== order.status) {
      try {
        await sendOrderStatusEmail(updatedOrder, body.status, order.status);
      } catch (emailError) {
        console.error('Error sending order status email:', emailError);
        // Continue even if email fails
      }
    }

    return NextResponse.json(
      { success: true, data: updatedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật đơn hàng' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders/:id
 * Xóa đơn hàng (admin only - soft delete)
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Get order before deleting
    const order = await db.collection('orders').findOne({ order_id: id });
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    // Soft delete: set status to deleted and add to status_history
    const updateData = {
      status: 'deleted',
      updated_at: new Date(),
    };

    // Get admin info for status_history
    const adminInfo = await getAdminFromToken(request);
    if (!adminInfo) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Add to status_history
    if (!order.status_history) {
      updateData.status_history = [];
    } else {
      updateData.status_history = [...order.status_history];
    }

    // Prepare changed_by_detail
    const changedByDetail = {
      type: 'admin',
      user_id: adminInfo.user_id || adminInfo._id?.toString() || '',
      name: adminInfo.name || '',
      phone: adminInfo.phone || '',
      email: adminInfo.email || '',
      role: adminInfo.role || 'admin',
    };

    updateData.status_history.push({
      status: 'deleted',
      changed_at: new Date(),
      changed_by: 'admin',
      changed_by_detail: changedByDetail,
    });

    const result = await db.collection('orders').updateOne(
      { order_id: id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Đã xóa đơn hàng' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa đơn hàng' },
      { status: 500 }
    );
  }
}

