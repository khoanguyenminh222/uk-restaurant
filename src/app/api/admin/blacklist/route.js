import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { validateSpamBlacklist } from '@/lib/models/SpamBlacklist';
import { getAdminFromToken } from '@/lib/auth';

/**
 * GET /api/admin/blacklist
 * Lấy danh sách email blacklist (admin only)
 */
export async function GET(request) {
  try {
    // Check admin authentication
    const admin = await getAdminFromToken(request);
    if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const reason = searchParams.get('reason');
    const isPermanent = searchParams.get('is_permanent');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    const query = {};

    // Search by email
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    // Filter by reason
    if (reason) {
      query.reason = reason;
    }

    // Filter by is_permanent
    if (isPermanent !== null && isPermanent !== undefined) {
      query.is_permanent = isPermanent === 'true';
    }

    // Get total count
    const total = await db.collection('spamBlacklist').countDocuments(query);

    // Get blacklist entries with pagination
    const blacklist = await db
      .collection('spamBlacklist')
      .find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json(
      {
        success: true,
        data: blacklist,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching blacklist:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy danh sách blacklist' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/blacklist
 * Thêm email vào blacklist (admin only)
 */
export async function POST(request) {
  try {
    // Check admin authentication
    const admin = await getAdminFromToken(request);
    if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    // Validate input
    const validation = validateSpamBlacklist(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    const now = new Date();
    const normalizedEmail = body.email.toLowerCase().trim();

    // Check if already exists
    const existing = await db.collection('spamBlacklist').findOne({
      email: normalizedEmail,
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email này đã có trong blacklist' },
        { status: 400 }
      );
    }

    // Create blacklist entry
    const blacklistEntry = {
      email: normalizedEmail,
      blocked_until: body.blocked_until ? new Date(body.blocked_until) : null,
      is_permanent: body.is_permanent || false,
      reason: body.reason || 'manual_block',
      created_at: now,
      updated_at: now,
      created_by: admin.admin_id || admin.user_id,
      admin_notes: body.admin_notes || null,
    };

    const result = await db.collection('spamBlacklist').insertOne(blacklistEntry);

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: result.insertedId,
          ...blacklistEntry,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding to blacklist:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi thêm vào blacklist' },
      { status: 500 }
    );
  }
}

