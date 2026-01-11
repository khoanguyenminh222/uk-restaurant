import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { getAdminFromToken } from '@/lib/auth';

/**
 * GET /api/admin/admins
 * Lấy danh sách tất cả admin (super admin only)
 * Query params:
 *   - role (optional) - filter theo role (admin, super_admin, manager)
 *   - search (optional) - search theo tên, phone, email
 *   - page (optional) - số trang
 *   - limit (optional) - số lượng/trang
 */
export async function GET(request) {
  try {
    // Check admin authentication
    const admin = await getAdminFromToken(request);
    if (!admin || admin.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Chỉ Super Admin mới có quyền xem danh sách admin' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // TODO: Check super admin authentication

    // Build query
    const query = {
      role: { $in: ['admin', 'super_admin', 'manager'] },
      is_deleted: { $ne: true } // Exclude soft-deleted admins
    };

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

    // Get total count
    const total = await db.collection('users').countDocuments(query);

    // Get admins with pagination
    const admins = await db
      .collection('users')
      .find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Remove password from response
    const adminsWithoutPassword = admins.map((admin) => {
      const { password, verification_code, verification_code_expires, ...adminWithoutPassword } = admin;
      return adminWithoutPassword;
    });

    return NextResponse.json(
      {
        success: true,
        data: adminsWithoutPassword,
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
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy danh sách admin' },
      { status: 500 }
    );
  }
}

