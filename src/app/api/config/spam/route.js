export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getSpamConfig } from '@/lib/restaurantConfig';

/**
 * GET /api/config/spam
 * Lấy config cho spam/email verification (public, không cần auth)
 */
export async function GET(request) {
  try {
    // Lấy config từ database, fallback về env variables nếu không có
    const spamConfig = await getSpamConfig();

    const config = {
      verified_session_ttl: spamConfig.verified_session_ttl || parseInt(process.env.SPAM_VERIFIED_SESSION_TTL || '1800'),
      verification_code_ttl: spamConfig.verification_code_ttl || parseInt(process.env.SPAM_VERIFICATION_CODE_TTL || '600'),
      max_send_code: spamConfig.max_send_code || parseInt(process.env.SPAM_MAX_SEND_CODE || '5'),
      max_verify_attempts: spamConfig.max_verify_attempts || parseInt(process.env.SPAM_MAX_VERIFY_ATTEMPTS || '5'),
      send_code_rate_limit_ttl: spamConfig.send_code_rate_limit_ttl || parseInt(process.env.SPAM_SEND_CODE_RATE_LIMIT_TTL || '3600'),
      max_orders: spamConfig.max_orders || parseInt(process.env.SPAM_MAX_ORDERS || '5'),
      order_rate_limit_ttl: spamConfig.order_rate_limit_ttl || parseInt(process.env.SPAM_ORDER_RATE_LIMIT_TTL || '1800'),
      order_rate_limit_blacklist_hours: spamConfig.order_rate_limit_blacklist_hours || parseInt(process.env.SPAM_ORDER_RATE_LIMIT_BLACKLIST_HOURS || '24'),
      resend_code_cooldown: spamConfig.resend_code_cooldown || parseInt(process.env.SPAM_RESEND_CODE_COOLDOWN || '60'),
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


