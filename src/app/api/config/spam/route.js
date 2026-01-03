import { NextResponse } from 'next/server';

/**
 * GET /api/config/spam
 * Lấy config cho spam/email verification (public, không cần auth)
 */
export async function GET(request) {
  try {
    // Config từ environment variables (giống với src/lib/emailVerification.js)
    const MAX_SEND_CODE = parseInt(process.env.SPAM_MAX_SEND_CODE || '5');
    const VERIFICATION_CODE_TTL = parseInt(process.env.SPAM_VERIFICATION_CODE_TTL || '600'); // 10 phút
    const VERIFIED_SESSION_TTL = parseInt(process.env.SPAM_VERIFIED_SESSION_TTL || '1800'); // 30 phút
    const MAX_VERIFY_ATTEMPTS = parseInt(process.env.SPAM_MAX_VERIFY_ATTEMPTS || '5');
    const SEND_CODE_RATE_LIMIT_TTL = parseInt(process.env.SPAM_SEND_CODE_RATE_LIMIT_TTL || '3600'); // Default: 1 giờ (có thể set 900 = 15 phút, 1800 = 30 phút, 7200 = 2 giờ, ...)
    
    // Config cho order rate limiting
    const MAX_ORDERS = parseInt(process.env.SPAM_MAX_ORDERS || '5');
    const ORDER_RATE_LIMIT_TTL = parseInt(process.env.SPAM_ORDER_RATE_LIMIT_TTL || '1800'); // Default: 30 phút (có thể set 3600 = 1 giờ, 7200 = 2 giờ, ...)
    const ORDER_RATE_LIMIT_BLACKLIST_HOURS = parseInt(process.env.SPAM_ORDER_RATE_LIMIT_BLACKLIST_HOURS || '24'); // 24 giờ

    const config = {
      verified_session_ttl: VERIFIED_SESSION_TTL,
      verification_code_ttl: VERIFICATION_CODE_TTL,
      max_send_code: MAX_SEND_CODE,
      max_verify_attempts: MAX_VERIFY_ATTEMPTS,
      send_code_rate_limit_ttl: SEND_CODE_RATE_LIMIT_TTL,
      max_orders: MAX_ORDERS,
      order_rate_limit_ttl: ORDER_RATE_LIMIT_TTL,
      order_rate_limit_blacklist_hours: ORDER_RATE_LIMIT_BLACKLIST_HOURS,
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

