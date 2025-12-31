import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/**
 * GET /api/admin/admins
 * Lấy danh sách tất cả admin (super admin only)
 */
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    // TODO: Check super admin authentication

    // Get all admins and super admins
    const admins = await db
      .collection('users')
      .find({
        role: { $in: ['admin', 'super_admin'] }
      })
      .sort({ created_at: -1 })
      .toArray();

    // Remove password from response
    const adminsWithoutPassword = admins.map((admin) => {
      const { password, verification_code, verification_code_expires, ...adminWithoutPassword } = admin;
      return adminWithoutPassword;
    });

    return NextResponse.json(
      { success: true, data: adminsWithoutPassword },
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

