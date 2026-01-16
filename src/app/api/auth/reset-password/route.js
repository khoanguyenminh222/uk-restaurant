export const runtime = 'edge';

import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/reset-password
 * Đặt lại mật khẩu với token
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token và mật khẩu mới là bắt buộc' },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Find user by reset token
    const user = await db.collection('users').findOne({
      reset_token: token,
      reset_token_expires: { $gt: new Date() }, // Token chưa hết hạn
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu lại.' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          reset_token: '',
          reset_token_expires: '',
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}


