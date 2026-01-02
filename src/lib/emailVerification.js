/**
 * Email Verification Utility
 * Generate và verify mã xác thực email
 */

import cache from './cache';
import { checkBlacklist } from './blacklist';
import { sendVerificationEmail as sendEmail } from './email';

// Config từ environment variables
const MAX_SEND_CODE_PER_HOUR = parseInt(process.env.SPAM_MAX_SEND_CODE_PER_HOUR || '5');
const VERIFICATION_CODE_TTL = parseInt(process.env.SPAM_VERIFICATION_CODE_TTL || '600'); // 10 phút
const VERIFIED_SESSION_TTL = parseInt(process.env.SPAM_VERIFIED_SESSION_TTL || '1800'); // 30 phút
const MAX_VERIFY_ATTEMPTS = parseInt(process.env.SPAM_MAX_VERIFY_ATTEMPTS || '5');

/**
 * Generate 6-digit verification code
 */
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification code to email
 * @param {string} email - Email address
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendVerificationCode(email) {
  if (!email) {
    return { success: false, error: 'Email là bắt buộc' };
  }

  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();

  // Check blacklist
  const blacklistCheck = await checkBlacklist(normalizedEmail);
  if (blacklistCheck.isBlocked) {
    return {
      success: false,
      error: 'Email này đã bị chặn. Vui lòng liên hệ hỗ trợ.',
    };
  }

  // Check rate limit (5 lần/giờ)
  const sendCodeKey = `send_code_count:${normalizedEmail}:1hour`;
  const sendCount = cache.increment(sendCodeKey, 15 * 60); // TTL: 15 phút

  if (sendCount > MAX_SEND_CODE_PER_HOUR) {
    return {
      success: false,
      error: `Bạn đã gửi quá nhiều mã. Vui lòng thử lại sau 15 phút.`,
    };
  }

  // Generate code
  const code = generateVerificationCode();

  // Save to cache
  const verificationKey = `email_verification:${normalizedEmail}`;
  cache.set(verificationKey, {
    code,
    expiresAt: Date.now() + VERIFICATION_CODE_TTL * 1000,
    attempts: 0,
  }, VERIFICATION_CODE_TTL);

  // Send email (không cần name cho đặt hàng)
  try {
    await sendEmail(normalizedEmail, code);
  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      error: 'Không thể gửi email. Vui lòng thử lại sau.',
    };
  }

  return {
    success: true,
    message: 'Mã xác thực đã được gửi đến email của bạn.',
    expiresIn: VERIFICATION_CODE_TTL, // seconds
  };
}

/**
 * Verify email code
 * @param {string} email - Email address
 * @param {string} code - Verification code
 * @returns {Promise<{success: boolean, error?: string, verified?: boolean}>}
 */
export async function verifyEmailCode(email, code) {
  if (!email || !code) {
    return { success: false, error: 'Email và mã xác thực là bắt buộc' };
  }

  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();

  // Get verification data from cache
  const verificationKey = `email_verification:${normalizedEmail}`;
  const verificationData = cache.get(verificationKey);

  if (!verificationData) {
    return {
      success: false,
      error: 'Mã xác thực không tồn tại hoặc đã hết hạn. Vui lòng gửi lại mã.',
    };
  }

  // Check attempts
  if (verificationData.attempts >= MAX_VERIFY_ATTEMPTS) {
    cache.delete(verificationKey);
    return {
      success: false,
      error: 'Bạn đã thử quá nhiều lần. Vui lòng gửi lại mã mới.',
    };
  }

  // Verify code
  if (verificationData.code !== code) {
    // Increment attempts
    const updatedData = {
      ...verificationData,
      attempts: verificationData.attempts + 1,
    };
    cache.set(verificationKey, updatedData, VERIFICATION_CODE_TTL);

    const remainingAttempts = MAX_VERIFY_ATTEMPTS - updatedData.attempts;
    return {
      success: false,
      error: `Mã xác thực không đúng. Còn ${remainingAttempts} lần thử.`,
    };
  }

  // Code is correct - mark email as verified
  const verifiedKey = `email_verified:${normalizedEmail}`;
  cache.set(verifiedKey, {
    verified: true,
    verifiedAt: new Date(),
  }, VERIFIED_SESSION_TTL);

  // Delete verification code
  cache.delete(verificationKey);

  return {
    success: true,
    verified: true,
    message: 'Email đã được xác thực thành công.',
  };
}

/**
 * Check if email is verified
 * @param {string} email - Email address
 * @returns {boolean}
 */
export function isEmailVerified(email) {
  if (!email) {
    return false;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const verifiedKey = `email_verified:${normalizedEmail}`;
  const verifiedData = cache.get(verifiedKey);

  return verifiedData && verifiedData.verified === true;
}

