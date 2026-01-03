/**
 * Email Verification Utility
 * Generate và verify mã xác thực email
 */

import cache from './cache';
import { checkBlacklist } from './blacklist';
import { sendVerificationEmail as sendEmail } from './email';

// Config từ environment variables
const MAX_SEND_CODE = parseInt(process.env.SPAM_MAX_SEND_CODE || '5');
const VERIFICATION_CODE_TTL = parseInt(process.env.SPAM_VERIFICATION_CODE_TTL || '600'); // 10 phút
const VERIFIED_SESSION_TTL = parseInt(process.env.SPAM_VERIFIED_SESSION_TTL || '1800'); // 30 phút
const MAX_VERIFY_ATTEMPTS = parseInt(process.env.SPAM_MAX_VERIFY_ATTEMPTS || '5');
const SEND_CODE_RATE_LIMIT_TTL = parseInt(process.env.SPAM_SEND_CODE_RATE_LIMIT_TTL || '3600'); // Default: 1 giờ (có thể set 900 = 15 phút, 1800 = 30 phút, 7200 = 2 giờ, ...)

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

  // Check rate limit
  const sendCodeKey = `send_code_count:${normalizedEmail}:${SEND_CODE_RATE_LIMIT_TTL}s`;
  const sendCount = cache.increment(sendCodeKey, SEND_CODE_RATE_LIMIT_TTL);

  if (sendCount > MAX_SEND_CODE) {
    const waitMinutes = Math.ceil(SEND_CODE_RATE_LIMIT_TTL / 60);
    return {
      success: false,
      error: `Bạn đã gửi quá nhiều mã. Vui lòng thử lại sau ${waitMinutes} phút.`,
    };
  }

  // Generate code
  const code = generateVerificationCode();

  // Save to cache
  const verificationKey = `email_verification:${normalizedEmail}`;
  const expiresAt = Date.now() + VERIFICATION_CODE_TTL * 1000;
  const verificationData = {
    code,
    expiresAt,
    attempts: 0,
  };
  cache.set(verificationKey, verificationData, VERIFICATION_CODE_TTL);
  console.log(`[Send Verification Code] ✅ Saved code for email: ${normalizedEmail}, key: ${verificationKey}, expiresAt: ${new Date(expiresAt).toISOString()}, TTL: ${VERIFICATION_CODE_TTL}s`);
  
  // Verify that it was saved correctly
  const savedData = cache.get(verificationKey);
  if (savedData) {
    console.log(`[Send Verification Code] ✅ Verified cache save - code: ${savedData.code}, expiresAt: ${new Date(savedData.expiresAt).toISOString()}`);
  } else {
    console.error(`[Send Verification Code] ❌ Cache save failed - data not found immediately after save!`);
  }

  // Send email (không cần name cho đặt hàng)
  // Convert TTL từ giây sang phút (làm tròn lên)
  const expiresInMinutes = Math.ceil(VERIFICATION_CODE_TTL / 60);
  try {
    await sendEmail(normalizedEmail, code, null, expiresInMinutes);
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

  console.log(`[Verify Email] Key: ${verificationKey}, Email normalized: ${normalizedEmail}, Data:`, verificationData ? 'exists' : 'not found');
  
  // Debug: Check all cache keys that start with email_verification
  if (!verificationData) {
    try {
      const allKeys = cache.getAllKeys ? cache.getAllKeys() : [];
      const verificationKeys = allKeys.filter(key => key.startsWith('email_verification:'));
      console.log(`[Verify Email] 🔍 All verification keys in cache (${verificationKeys.length}):`, verificationKeys);
      if (verificationKeys.length > 0) {
        verificationKeys.forEach(key => {
          const data = cache.get(key);
          console.log(`[Verify Email] 🔍 Key: ${key}, Data:`, data ? { code: data.code, expiresAt: new Date(data.expiresAt).toISOString() } : 'not found');
        });
      } else {
        console.log(`[Verify Email] 🔍 No verification keys found in cache. Total cache keys: ${allKeys.length}`);
      }
    } catch (err) {
      console.error(`[Verify Email] 🔍 Error checking cache keys:`, err);
    }
  }

  if (!verificationData) {
    console.log(`[Verify Email] ❌ Verification data not found for email: ${normalizedEmail}`);
    return {
      success: false,
      error: 'Mã xác thực không tồn tại hoặc đã hết hạn. Vui lòng gửi lại mã.',
    };
  }

  // Check if code expired (check expiresAt in the data object)
  if (verificationData.expiresAt && verificationData.expiresAt < Date.now()) {
    console.log(`[Verify Email] ❌ Code expired for email: ${normalizedEmail}, expiresAt: ${new Date(verificationData.expiresAt).toISOString()}`);
    cache.delete(verificationKey);
    return {
      success: false,
      error: 'Mã xác thực đã hết hạn. Vui lòng gửi lại mã.',
    };
  }

  // Check attempts
  if (verificationData.attempts >= MAX_VERIFY_ATTEMPTS) {
    console.log(`[Verify Email] ❌ Too many attempts for email: ${normalizedEmail}, attempts: ${verificationData.attempts}`);
    cache.delete(verificationKey);
    return {
      success: false,
      error: 'Bạn đã thử quá nhiều lần. Vui lòng gửi lại mã mới.',
    };
  }

  // Verify code
  console.log(`[Verify Email] Comparing codes - Expected: ${verificationData.code}, Received: ${code}`);
  if (verificationData.code !== code) {
    // Increment attempts
    const updatedData = {
      ...verificationData,
      attempts: (verificationData.attempts || 0) + 1,
    };
    // Calculate remaining TTL based on expiresAt
    const remainingTTL = verificationData.expiresAt 
      ? Math.max(0, Math.floor((verificationData.expiresAt - Date.now()) / 1000))
      : VERIFICATION_CODE_TTL;
    cache.set(verificationKey, updatedData, remainingTTL);

    const remainingAttempts = MAX_VERIFY_ATTEMPTS - updatedData.attempts;
    console.log(`[Verify Email] ❌ Code mismatch for email: ${normalizedEmail}, attempts: ${updatedData.attempts}, remaining: ${remainingAttempts}`);
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

