import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/**
 * GET /api/admin/admins/:id
 * Lấy thông tin chi tiết admin (super admin only)
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    const admin = await db.collection('users').findOne({ 
      $or: [
        { user_id: id },
        { _id: id }
      ],
      role: { $in: ['admin', 'super_admin'] },
      is_deleted: { $ne: true }
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy admin' },
        { status: 404 }
      );
    }

    // Remove password
    const { password, verification_code, verification_code_expires, ...adminWithoutPassword } = admin;

    return NextResponse.json(
      { success: true, data: adminWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy thông tin admin' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/admins/:id
 * Cập nhật thông tin admin (super admin only)
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    // Find admin
    const admin = await db.collection('users').findOne({ 
      $or: [
        { user_id: id },
        { _id: id }
      ],
      role: { $in: ['admin', 'super_admin'] },
      is_deleted: { $ne: true }
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy admin' },
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
        const existingAdmin = await db.collection('users').findOne({
          email: body.email.trim().toLowerCase(),
          _id: { $ne: admin._id },
          is_deleted: { $ne: true }
        });
        if (existingAdmin) {
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
      if (['admin', 'super_admin'].includes(body.role)) {
        updateData.role = body.role;
      }
    }

    // Update admin
    const result = await db.collection('users').updateOne(
      { _id: admin._id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy admin' },
        { status: 404 }
      );
    }

    // Get updated admin
    const updatedAdmin = await db.collection('users').findOne({ _id: admin._id });
    const { password, verification_code, verification_code_expires, ...adminWithoutPassword } = updatedAdmin;

    return NextResponse.json(
      { success: true, data: adminWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật admin' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/admins/:id
 * Xóa admin (super admin only - soft delete)
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    // Find admin
    const admin = await db.collection('users').findOne({ 
      $or: [
        { user_id: id },
        { _id: id }
      ],
      role: { $in: ['admin', 'super_admin'] },
      is_deleted: { $ne: true }
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy admin' },
        { status: 404 }
      );
    }

    // Prevent deleting super_admin (optional - can be removed if needed)
    if (admin.role === 'super_admin') {
      // Check if there are other super_admins
      const otherSuperAdmins = await db.collection('users').countDocuments({
        role: 'super_admin',
        _id: { $ne: admin._id },
        is_deleted: { $ne: true }
      });

      if (otherSuperAdmins === 0) {
        return NextResponse.json(
          { success: false, error: 'Không thể xóa super admin cuối cùng' },
          { status: 400 }
        );
      }
    }

    // Soft delete: set is_deleted = true
    const result = await db.collection('users').updateOne(
      { _id: admin._id },
      { 
        $set: { 
          is_deleted: true,
          updated_at: new Date(),
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy admin' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Đã xóa admin' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa admin' },
      { status: 500 }
    );
  }
}

