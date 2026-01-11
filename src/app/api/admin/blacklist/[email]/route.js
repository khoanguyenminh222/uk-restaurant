import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { getAdminFromToken } from '@/lib/auth';
import cache from '@/lib/cache';

/**
 * PUT /api/admin/blacklist/[email]
 * Cập nhật blacklist entry (admin only)
 */
export async function PUT(request, { params }) {
  try {
    // Check admin authentication
    const admin = await getAdminFromToken(request);
    if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { email } = await params;
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const normalizedEmail = decodeURIComponent(email).toLowerCase().trim();
    const now = new Date();

    // Update blacklist entry
    const updateData = {
      updated_at: now,
    };

    if (body.blocked_until !== undefined) {
      updateData.blocked_until = body.blocked_until ? new Date(body.blocked_until) : null;
    }

    if (body.is_permanent !== undefined) {
      updateData.is_permanent = body.is_permanent;
    }

    if (body.reason !== undefined) {
      updateData.reason = body.reason;
    }

    if (body.admin_notes !== undefined) {
      updateData.admin_notes = body.admin_notes;
    }

    const result = await db.collection('spamBlacklist').updateOne(
      { email: normalizedEmail },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy email trong blacklist' },
        { status: 404 }
      );
    }

    const updated = await db.collection('spamBlacklist').findOne({
      email: normalizedEmail,
    });

    // Nếu unblock (blocked_until = null hoặc trong quá khứ, và is_permanent = false), reset cache rate limit
    const isUnblocked = updated &&
      !updated.is_permanent &&
      (!updated.blocked_until || new Date(updated.blocked_until) < new Date());

    if (isUnblocked) {
      const { getSpamConfig } = await import('@/lib/restaurantConfig');
      const spamConfig = await getSpamConfig();
      const ORDER_RATE_LIMIT_TTL = spamConfig.order_rate_limit_ttl || parseInt(process.env.SPAM_ORDER_RATE_LIMIT_TTL || '1800');
      const rateLimitKey = `order_count:${normalizedEmail}:${ORDER_RATE_LIMIT_TTL}s`;
      cache.delete(rateLimitKey);
      //console.log(`[Update Blacklist] ✅ Đã unblock và reset cache rate limit cho email: ${normalizedEmail}`);
    }

    return NextResponse.json(
      {
        success: true,
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating blacklist:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật blacklist' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/blacklist/[email]
 * Xóa email khỏi blacklist (admin only)
 */
export async function DELETE(request, { params }) {
  try {
    // Check admin authentication
    const admin = await getAdminFromToken(request);
    if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { email } = await params;
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const normalizedEmail = decodeURIComponent(email).toLowerCase().trim();

    const result = await db.collection('spamBlacklist').deleteOne({
      email: normalizedEmail,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy email trong blacklist' },
        { status: 404 }
      );
    }

    // Reset cache rate limit khi xóa blacklist
    const { getSpamConfig } = await import('@/lib/restaurantConfig');
    const spamConfig = await getSpamConfig();
    const ORDER_RATE_LIMIT_TTL = spamConfig.order_rate_limit_ttl || parseInt(process.env.SPAM_ORDER_RATE_LIMIT_TTL || '1800');
    const rateLimitKey = `order_count:${normalizedEmail}:${ORDER_RATE_LIMIT_TTL}s`;
    cache.delete(rateLimitKey);
    //console.log(`[Delete Blacklist] ✅ Đã xóa blacklist và reset cache rate limit cho email: ${normalizedEmail}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Đã xóa email khỏi blacklist',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting from blacklist:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa khỏi blacklist' },
      { status: 500 }
    );
  }
}

