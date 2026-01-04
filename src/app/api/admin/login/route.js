import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

/**
 * POST /api/admin/login
 * Đăng nhập admin (chỉ cho phép admin và super_admin)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Validate input
    if (!body.phone || !body.password) {
      return NextResponse.json(
        { success: false, error: 'Số điện thoại và mật khẩu là bắt buộc' },
        { status: 400 }
      );
    }

    // Find user by phone (exclude soft-deleted users)
    const user = await db.collection('users').findOne({ 
      phone: body.phone,
      is_deleted: { $ne: true }
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Số điện thoại hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    // Check if account is deleted
    if (user.is_deleted) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản của bạn đã bị xóa. Vui lòng liên hệ quản trị viên.' },
        { status: 403 }
      );
    }

    // Check if user is admin or super_admin
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền truy cập trang admin' },
        { status: 403 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Số điện thoại hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    // Update last_login
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { last_login: new Date() } }
    );

    // Return admin user without password
    const { password, verification_code, verification_code_expires, ...adminWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        data: adminWithoutPassword,
        message: 'Đăng nhập thành công',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error logging in admin:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi đăng nhập. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

