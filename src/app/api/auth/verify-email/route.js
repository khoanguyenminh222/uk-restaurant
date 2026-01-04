import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';

/**
 * POST /api/auth/verify-email
 * Xác thực email với verification code
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: 'Số điện thoại và mã xác thực là bắt buộc' },
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

    // Check verification code
    if (user.verification_code !== code) {
      return NextResponse.json(
        { success: false, error: 'Mã xác thực không đúng' },
        { status: 400 }
      );
    }

    // Check if code expired
    if (new Date() > new Date(user.verification_code_expires)) {
      return NextResponse.json(
        { success: false, error: 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới' },
        { status: 400 }
      );
    }

    // Update user: mark email as verified, remove verification code
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          email_verified: true,
          verification_code: null,
          verification_code_expires: null,
        },
      }
    );

    // Return user without password
    const { password, verification_code, verification_code_expires, ...userWithoutPassword } = {
      ...user,
      email_verified: true,
    };

    return NextResponse.json(
      {
        success: true,
        data: userWithoutPassword,
        message: 'Email đã được xác thực thành công',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xác thực email. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

