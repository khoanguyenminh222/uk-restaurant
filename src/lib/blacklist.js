/**
 * Blacklist Utility Functions
 * Check và quản lý email blacklist
 */

import clientPromise from '@/lib/mongodb';

/**
 * Check if email is blacklisted
 * @param {string} email - Email address
 * @returns {Promise<{isBlocked: boolean, reason?: string, blocked_until?: Date}>}
 */
export async function checkBlacklist(email) {
  if (!email) {
    return { isBlocked: false };
  }

  try {
    const client = await clientPromise;
    const db = client.db('uk-restaurant');
    const now = new Date();

    const blacklistEntry = await db.collection('spamBlacklist').findOne({
      email: email.toLowerCase().trim(),
      $or: [
        { is_permanent: true },
        { blocked_until: { $gt: now } },
      ],
    });

    if (blacklistEntry) {
      return {
        isBlocked: true,
        reason: blacklistEntry.reason,
        blocked_until: blacklistEntry.blocked_until,
        is_permanent: blacklistEntry.is_permanent,
      };
    }

    return { isBlocked: false };
  } catch (error) {
    console.error('Error checking blacklist:', error);
    // Nếu có lỗi, không block (fail open)
    return { isBlocked: false };
  }
}

/**
 * Auto blacklist email if exceeds threshold
 * @param {string} email - Email address
 * @param {string} reason - Reason for blacklisting
 * @param {number} blockDurationHours - Block duration in hours (default: 24)
 */
export async function autoBlacklistIfNeeded(email, reason = 'too_many_orders', blockDurationHours = 24) {
  if (!email) {
    return;
  }

  try {
    const client = await clientPromise;
    const db = client.db('uk-restaurant');
    const now = new Date();
    const blockedUntil = new Date(now.getTime() + blockDurationHours * 60 * 60 * 1000);
    const normalizedEmail = email.toLowerCase().trim();

    const result = await db.collection('spamBlacklist').updateOne(
      { email: normalizedEmail },
      {
        $setOnInsert: {
          email: normalizedEmail,
          is_permanent: false,
          created_at: now,
          created_by: 'system',
        },
        $set: {
          blocked_until: blockedUntil, // Update blocked_until mỗi lần auto blacklist
          updated_at: now,
          reason: reason, // Update reason mỗi lần auto blacklist
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error auto blacklisting email:', error);
  }
}

/**
 * Manually add email to blacklist (admin only)
 * @param {string} email - Email address
 * @param {string} reason - Reason for blacklisting
 * @param {Date|null} blockedUntil - Block until date (null = permanent)
 * @param {boolean} isPermanent - Is permanent block
 * @param {string} adminId - Admin ID who added
 * @param {string} adminNotes - Admin notes
 */
export async function addToBlacklist(email, reason, blockedUntil = null, isPermanent = false, adminId = null, adminNotes = null) {
  if (!email) {
    throw new Error('Email is required');
  }

  const client = await clientPromise;
  const db = client.db('uk-restaurant');
  const now = new Date();

  await db.collection('spamBlacklist').updateOne(
    { email: email.toLowerCase().trim() },
    {
      $setOnInsert: {
        email: email.toLowerCase().trim(),
        reason: reason,
        created_at: now,
        created_by: adminId || 'system',
      },
      $set: {
        blocked_until: blockedUntil,
        is_permanent: isPermanent,
        updated_at: now,
        admin_notes: adminNotes,
      },
    },
    { upsert: true }
  );
}

/**
 * Remove email from blacklist
 * @param {string} email - Email address
 */
export async function removeFromBlacklist(email) {
  if (!email) {
    throw new Error('Email is required');
  }

  const client = await clientPromise;
  const db = client.db('uk-restaurant');
  const normalizedEmail = email.toLowerCase().trim();

  await db.collection('spamBlacklist').deleteOne({
    email: normalizedEmail,
  });

  // Reset cache rate limit khi xóa blacklist
  // Import cache ở đây để tránh circular dependency
  const cache = (await import('./cache')).default;
  const ORDER_RATE_LIMIT_TTL = parseInt(process.env.SPAM_ORDER_RATE_LIMIT_TTL || '1800');
  
  // Xóa tất cả các cache keys liên quan đến email này
  // Cache key format: `order_count:${email}:${TTL}s`
  const rateLimitKey = `order_count:${normalizedEmail}:${ORDER_RATE_LIMIT_TTL}s`;
  cache.delete(rateLimitKey);
  
  console.log(`[Remove Blacklist] ✅ Đã xóa blacklist và reset cache rate limit cho email: ${normalizedEmail}`);
}

