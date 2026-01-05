import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { sendCancelledOrderNotification } from '@/lib/telegram';
import { getAdminFromToken } from '@/lib/auth';
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
 * Cập nhật đơn hàng (admin only - update status và thông tin)
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Lấy thông tin admin từ request (nếu có)
    let adminInfo = null;
    try {
      adminInfo = await getAdminFromToken(request);
    } catch (adminError) {
      console.error('Error getting admin info:', adminError);
      // Continue without admin info
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

    if (body.status) {
      updateData.status = body.status;
      
      // Add to status_history if exists
      if (!order.status_history) {
        updateData.status_history = [];
      } else {
        updateData.status_history = [...order.status_history];
      }
      updateData.status_history.push({
        status: body.status,
        changed_at: new Date(),
        changed_by: body.changed_by || 'admin',
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

    // Update order
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

    // Get updated order
    const updatedOrder = await db.collection('orders').findOne({ order_id: id });

    // Send Telegram notification if order is cancelled (fire and forget)
    if (body.status === 'cancelled') {
      try {
        let cancelledBy = body.changed_by || 'admin';
        
        // Nếu là admin/manager/super_admin và có thông tin admin, sử dụng tên admin
        if ((cancelledBy === 'admin' || cancelledBy === 'manager' || cancelledBy === 'super_admin') && adminInfo) {
          cancelledBy = adminInfo.name || adminInfo.phone || cancelledBy;
        }
        
        const reason = body.cancel_reason || body.admin_notes || body.notes || updatedOrder.cancel_reason || '';
        await sendCancelledOrderNotification(updatedOrder, cancelledBy, reason, adminInfo);
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

    // Soft delete: set status to deleted
    const result = await db.collection('orders').updateOne(
      { order_id: id },
      { 
        $set: { 
          status: 'deleted',
          updated_at: new Date(),
        } 
      }
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

