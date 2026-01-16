export const runtime = 'edge';

import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { defaultLandingConfig } from '@/lib/models/LandingConfig';

/**
 * POST /api/config/landing/reset
 * Reset về mặc định (admin only)
 * Xóa document hiện tại và tạo lại với default values
 */
export async function POST(request) {
  try {
    // TODO: Thêm admin authentication check
    // const user = await getUserFromRequest(request);
    // if (!user || !(await isAdmin(user.user_id))) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const now = new Date();

    // Xóa document hiện tại (nếu có)
    await db.collection('landingConfig').deleteOne({ config_type: 'landing' });

    // Tạo lại với default values
    const resetConfig = {
      ...defaultLandingConfig,
      created_at: now,
      updated_at: now,
    };

    const result = await db.collection('landingConfig').insertOne(resetConfig);

    return NextResponse.json(
      {
        success: true,
        message: 'Đã reset về mặc định',
        data: { ...resetConfig, _id: result.insertedId.toString() },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resetting landing config:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi reset cấu hình landing page' },
      { status: 500 }
    );
  }
}


