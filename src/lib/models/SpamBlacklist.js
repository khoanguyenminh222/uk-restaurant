/**
 * SpamBlacklist Model
 * Schema cho blacklist email chống spam
 */

export const SpamBlacklistSchema = {
  email: String, // required, unique, indexed
  blocked_until: Date, // optional - Thời điểm hết hạn (null = vĩnh viễn)
  is_permanent: Boolean, // default: false
  reason: String, // required
  created_at: Date,
  updated_at: Date,
  created_by: String, // optional - "system" hoặc admin_id
  admin_notes: String, // optional
};

/**
 * Validate spam blacklist data
 */
export function validateSpamBlacklist(data) {
  const errors = [];

  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email là bắt buộc');
  } else {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Email không hợp lệ');
    }
  }

  if (!data.reason || typeof data.reason !== 'string') {
    errors.push('Lý do blacklist là bắt buộc');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

