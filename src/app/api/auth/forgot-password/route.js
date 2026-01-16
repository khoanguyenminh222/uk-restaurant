export const runtime = 'edge';

import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { sendResetPasswordEmail } from '@/lib/email';
import crypto from 'crypto';

/**
 * POST /api/auth/forgot-password
 * Gửi email reset password
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Số điện thoại là bắt buộc' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Find user by phone
    const user = await db.collection('users').findOne({ phone });
    if (!user) {
      // Không tiết lộ thông tin user không tồn tại vì lý do bảo mật
      return NextResponse.json(
        {
          success: true,
          message: 'Nếu số điện thoại tồn tại, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu.',
        },
        { status: 200 }
      );
    }
    // Check if user has an email
    if (!user.email) {
      return NextResponse.json(
        { success: false, error: 'Số điện thoại này không có email liên kết. Vui lòng liên hệ hỗ trợ để được trợ giúp.' },
        { status: 400 }
      );
    }

    // Check if email is verified
    if (!user.email_verified) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng xác thực email trước khi đặt lại mật khẩu.' },
        { status: 400 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with reset token
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          reset_token: resetToken,
          reset_token_expires: resetTokenExpires,
        },
      }
    );

    // Send reset password email
    // Reset token expires in 15 minutes (from resetTokenExpires)
    const expiresInMinutes = 15;
    const emailResult = await sendResetPasswordEmail(
      user.email,
      user.name,
      resetToken,
      expiresInMinutes
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: 'Please configure email settings in Admin > Notification Config or set environment variables (EMAIL_USER, EMAIL_PASSWORD).' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Đã gửi email hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}


