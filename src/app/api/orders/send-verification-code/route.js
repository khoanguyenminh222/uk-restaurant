import { NextResponse } from 'next/server';
import { sendVerificationCode } from '@/lib/emailVerification';

/**
 * POST /api/orders/send-verification-code
 * Gửi mã xác thực email cho đặt hàng
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email là bắt buộc' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    const result = await sendVerificationCode(email);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        expiresIn: result.expiresIn,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi gửi mã xác thực' },
      { status: 500 }
    );
  }
}

