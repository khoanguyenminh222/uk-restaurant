import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/**
 * GET /api/users/:id
 * Lấy thông tin chi tiết user (admin only)
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    const user = await db.collection('users').findOne({ 
      $or: [
        { user_id: id },
        { _id: id }
      ],
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
    const { id } = await params;
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    // Find user
    const user = await db.collection('users').findOne({ 
      $or: [
        { user_id: id },
        { _id: id }
      ],
      is_deleted: { $ne: true }
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

    // Only super_admin can change role
    if (body.role !== undefined) {
      // TODO: Check if current user is super_admin
      // For now, allow role update
      if (['user', 'admin', 'super_admin'].includes(body.role)) {
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
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    // Find user
    const user = await db.collection('users').findOne({ 
      $or: [
        { user_id: id },
        { _id: id }
      ],
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

