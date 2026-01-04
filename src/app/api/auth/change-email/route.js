import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { sendVerificationEmail } from '@/lib/email';

/**
 * POST /api/auth/change-email
 * Đổi email và gửi lại mã xác thực
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { phone, newEmail } = body;

    if (!phone || !newEmail) {
      return NextResponse.json(
        { success: false, error: 'Số điện thoại và email mới là bắt buộc' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { success: false, error: 'Email không hợp lệ' },
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

    // Check if new email is already used by another user
    const existingEmail = await db.collection('users').findOne({ 
      email: newEmail.trim().toLowerCase(),
      phone: { $ne: phone } // Exclude current user
    });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email đã được sử dụng bởi tài khoản khác' },
        { status: 400 }
      );
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with new email and reset verification
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          email: newEmail.trim().toLowerCase(),
          email_verified: false,
          verification_code: verificationCode,
          verification_code_expires: verificationCodeExpires,
        },
      }
    );

    // Send verification email to new email
    // Verification code expires in 15 minutes (from verificationCodeExpires)
    const expiresInMinutes = 15;
    const emailResult = await sendVerificationEmail(
      newEmail.trim().toLowerCase(),
      verificationCode,
      user.name,
      expiresInMinutes
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: 'Không thể gửi email. Vui lòng thử lại sau.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Đã đổi email và gửi mã xác thực đến email mới',
        email: newEmail.trim().toLowerCase(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error changing email:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi đổi email. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

