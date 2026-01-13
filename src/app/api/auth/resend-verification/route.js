import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { sendVerificationEmail } from '@/lib/email';

/**
 * POST /api/auth/resend-verification
 * Gửi lại mã xác thực email
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
      return NextResponse.json(
        { success: false, error: 'Người dùng không tồn tại' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.email_verified) {
      return NextResponse.json(
        { success: false, error: 'Email đã được xác thực' },
        { status: 400 }
      );
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with new verification code
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          verification_code: verificationCode,
          verification_code_expires: verificationCodeExpires,
        },
      }
    );

    // Send verification email
    // Verification code expires in 15 minutes (from verificationCodeExpires)
    const expiresInMinutes = 15;
    const emailResult = await sendVerificationEmail(
      user.email,
      verificationCode,
      user.name,
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
        message: 'Đã gửi lại mã xác thực đến email của bạn',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resending verification:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi gửi lại mã xác thực. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

