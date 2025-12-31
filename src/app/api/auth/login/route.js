import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/login
 * Đăng nhập user
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('uk-restaurant');

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

    // Check password
    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Số điện thoại hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.email_verified) {
      // Return user info (without password) for verification screen
      const { password, verification_code, verification_code_expires, ...userWithoutPassword } = user;
      return NextResponse.json(
        { 
          success: false, 
          error: 'Vui lòng xác thực email trước khi đăng nhập. Kiểm tra email của bạn để lấy mã xác thực.',
          email_not_verified: true,
          email: user.email,
          user: userWithoutPassword // Include user info for verification screen
        },
        { status: 403 }
      );
    }

    // Update last_login
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { last_login: new Date() } }
    );

    // Return user without password
    const { password, verification_code, verification_code_expires, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        data: {
          ...userWithoutPassword,
          role: user.role || 'user', // Include role in response
        },
        email_verified: user.email_verified || false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi đăng nhập. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

