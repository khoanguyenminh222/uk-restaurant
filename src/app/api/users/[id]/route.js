import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { getAdminFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/**
 * Helper to safely convert string to ObjectId if valid
 */
function toObjectId(id) {
  try {
    return new ObjectId(id);
  } catch (e) {
    return null;
  }
}

/**
 * GET /api/users/:id
 * Lấy thông tin chi tiết user (admin only)
 */
export async function GET(request, { params }) {
  try {
    // Check admin authentication
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const user = await db.collection('users').findOne({
      $or: [
        { user_id: id },
        { _id: id },
        { _id: toObjectId(id) }
      ].filter(item => item._id !== null),
      is_deleted: { $ne: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    // Remove password
    const { password, verification_code, verification_code_expires, ...userWithoutPassword } = user;

    // Get order stats
    const orderStats = await db
      .collection('orders')
      .aggregate([
        { $match: { user_id: user.user_id } },
        { $group: { _id: '$user_id', count: { $sum: 1 }, totalSpent: { $sum: '$total_price' } } },
      ])
      .toArray();

    const stats = orderStats[0] || { count: 0, totalSpent: 0 };

    return NextResponse.json(
      {
        success: true,
        data: {
          ...userWithoutPassword,
          order_count: stats.count,
          total_spent: stats.totalSpent || 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy thông tin người dùng' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/:id
 * Cập nhật thông tin user (admin only)
 */
export async function PUT(request, { params }) {
  try {
    // Check admin authentication
    const adminInfo = await getAdminFromToken(request);
    if (!adminInfo) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Find user (including soft-deleted for admin to restore)
    const user = await db.collection('users').findOne({
      $or: [
        { user_id: id },
        { _id: id },
        { _id: toObjectId(id) }
      ].filter(item => item._id !== null)
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {
      updated_at: new Date(),
    };

    // Allow restoring deleted users
    if (body.is_deleted !== undefined) {
      updateData.is_deleted = body.is_deleted === true;
    }

    // Only allow updating specific fields
    if (body.name !== undefined) {
      updateData.name = body.name.trim();
    }

    if (body.email !== undefined) {
      // Check email unique if provided
      if (body.email && body.email.trim()) {
        const existingUser = await db.collection('users').findOne({
          email: body.email.trim().toLowerCase(),
          _id: { $ne: user._id },
          is_deleted: { $ne: true }
        });
        if (existingUser) {
          return NextResponse.json(
            { success: false, error: 'Email đã được sử dụng' },
            { status: 400 }
          );
        }
        updateData.email = body.email.trim().toLowerCase();
      } else {
        updateData.email = null;
      }
    }

    if (body.address !== undefined) {
      updateData.address = body.address.trim() || null;
    }

    // Only authorized roles can change role to a DIFFERENT value
    if (body.role !== undefined) {
      if (body.role !== user.role) {
        const isAdmin = adminInfo.role === 'admin';
        const isSuperAdmin = adminInfo.role === 'super_admin';

        // Check permission:
        // - Admin can promote to user, manager, admin
        // - Super Admin can promote to any role including super_admin
        if (body.role === 'super_admin' && !isSuperAdmin) {
          return NextResponse.json(
            { success: false, error: 'Chỉ Super Admin mới có quyền cấp quyền Super Admin' },
            { status: 403 }
          );
        }

        if (!isAdmin && !isSuperAdmin) {
          return NextResponse.json(
            { success: false, error: 'Bạn không có quyền thay đổi vai trò' },
            { status: 403 }
          );
        }
      }
      if (['user', 'manager', 'admin', 'super_admin'].includes(body.role)) {
        updateData.role = body.role;
      }
    }

    // Update user
    const result = await db.collection('users').updateOne(
      { _id: user._id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    // Get updated user
    const updatedUser = await db.collection('users').findOne({ _id: user._id });
    const { password, verification_code, verification_code_expires, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(
      { success: true, data: userWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật người dùng' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/:id
 * Xóa user (admin only - soft delete)
 */
export async function DELETE(request, { params }) {
  try {
    // Check admin authentication
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Find user
    const user = await db.collection('users').findOne({
      $or: [
        { user_id: id },
        { _id: id },
        { _id: toObjectId(id) }
      ].filter(item => item._id !== null),
      is_deleted: { $ne: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    // Check if user has orders
    const orderCount = await db.collection('orders').countDocuments({ user_id: user.user_id });

    // Soft delete: set is_deleted = true
    const result = await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          is_deleted: true,
          updated_at: new Date(),
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Đã xóa người dùng',
        has_orders: orderCount > 0,
        order_count: orderCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa người dùng' },
      { status: 500 }
    );
  }
}

