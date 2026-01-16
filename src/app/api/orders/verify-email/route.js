export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { verifyEmailCode } from '@/lib/emailVerification';

/**
 * POST /api/orders/verify-email
 * Xác thực mã email cho đặt hàng
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email và mã xác thực là bắt buộc' },
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

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'Mã xác thực phải là 6 chữ số' },
        { status: 400 }
      );
    }

    const result = await verifyEmailCode(email, code);

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
        verified: result.verified,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xác thực email' },
      { status: 500 }
    );
  }
}


