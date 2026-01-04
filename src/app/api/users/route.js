import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';

/**
 * GET /api/users
 * Lấy danh sách users (admin only)
 * Query params:
 *   - role (optional) - filter theo role
 *   - search (optional) - search theo tên, phone, email
 *   - page (optional) - số trang
 *   - limit (optional) - số lượng/trang
 *   - sort (optional) - sort field
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Build query - include all users (including soft-deleted) for admin view
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sortObj = {};
    sortObj[sort] = sortOrder === 'asc' ? 1 : -1;

    // Get total count
    const total = await db.collection('users').countDocuments(query);

    // Get users
    const users = await db
      .collection('users')
      .find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Remove password from response
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    // Get order counts for each user
    const userIds = users.map(u => u.user_id);
    const orderCounts = await db
      .collection('orders')
      .aggregate([
        { $match: { user_id: { $in: userIds } } },
        { $group: { _id: '$user_id', count: { $sum: 1 }, totalSpent: { $sum: '$total_price' } } },
      ])
      .toArray();

    const orderCountMap = {};
    orderCounts.forEach(oc => {
      orderCountMap[oc._id] = { count: oc.count, totalSpent: oc.totalSpent || 0 };
    });

    // Add order stats to users
    const usersWithStats = usersWithoutPassword.map(user => ({
      ...user,
      order_count: orderCountMap[user.user_id]?.count || 0,
      total_spent: orderCountMap[user.user_id]?.totalSpent || 0,
    }));

    return NextResponse.json(
      {
        success: true,
        data: usersWithStats,
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
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy danh sách người dùng' },
      { status: 500 }
    );
  }
}

