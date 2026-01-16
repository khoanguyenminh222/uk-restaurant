export const runtime = 'edge';

import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { getAdminFromToken } from '@/lib/auth';

/**
 * GET /api/config/popular/settings
 * Lấy cài đặt hiển thị giá trị (public)
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Lấy settings document
    const settings = await db
      .collection('popularConfig')
      .findOne({ type: 'settings' });

    // Default: show_value = true
    const showValue = settings?.show_value !== false;

    return NextResponse.json(
      {
        success: true,
        data: {
          show_value: showValue,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching popular config settings:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy cài đặt' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/config/popular/settings
 * Cập nhật cài đặt hiển thị giá trị (admin only)
 */
export async function PUT(request) {
  try {
    // Check admin authentication
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { show_value } = body;

    if (typeof show_value !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'show_value phải là boolean' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Tìm hoặc tạo settings document
    const settings = await db
      .collection('popularConfig')
      .findOne({ type: 'settings' });

    if (settings) {
      // Cập nhật
      await db
        .collection('popularConfig')
        .updateOne(
          { type: 'settings' },
          {
            $set: {
              show_value,
              updated_at: new Date(),
            },
          }
        );
    } else {
      // Tạo mới
      await db.collection('popularConfig').insertOne({
        type: 'settings',
        show_value,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Cập nhật cài đặt thành công',
        data: { show_value },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating popular config settings:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật cài đặt' },
      { status: 500 }
    );
  }
}


