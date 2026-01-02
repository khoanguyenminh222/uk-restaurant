import { NextResponse } from 'next/server';

/**
 * GET /api/config/spam
 * Lấy config cho spam/email verification (public, không cần auth)
 */
export async function GET(request) {
  try {
    const config = {
      verified_session_ttl: parseInt(process.env.SPAM_VERIFIED_SESSION_TTL || '1800'), // seconds
      verification_code_ttl: parseInt(process.env.SPAM_VERIFICATION_CODE_TTL || '600'), // seconds
      max_send_code_per_hour: parseInt(process.env.SPAM_MAX_SEND_CODE_PER_HOUR || '5'),
      max_verify_attempts: parseInt(process.env.SPAM_MAX_VERIFY_ATTEMPTS || '5'),
      max_orders_per_30min: parseInt(process.env.SPAM_MAX_ORDERS_PER_30MIN || '5'),
    };

    return NextResponse.json(
      {
        success: true,
        data: config,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error getting spam config:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy config' },
      { status: 500 }
    );
  }
}

