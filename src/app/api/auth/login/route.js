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

    // Find user by phone
    const user = await db.collection('users').findOne({ phone: body.phone });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Số điện thoại hoặc mật khẩu không đúng' },
        { status: 401 }
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

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        data: userWithoutPassword,
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

