import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { validateThreshold } from '@/lib/models/PopularConfig';

/**
 * GET /api/config/popular
 * Lấy danh sách ngưỡng (public)
 * Trả về array các ngưỡng, sắp xếp theo order (tăng dần) hoặc value (giảm dần)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'order'; // 'order' hoặc 'value'

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Lấy tất cả ngưỡng
    let thresholds = await db
      .collection('popularConfig')
      .find({})
      .toArray();

    // Sort theo order (tăng dần) hoặc value (giảm dần)
    if (sortBy === 'value') {
      thresholds.sort((a, b) => b.value - a.value);
    } else {
      thresholds.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    return NextResponse.json(
      {
        success: true,
        data: thresholds,
        count: thresholds.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching popular config:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy cấu hình ngưỡng' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/config/popular
 * Thêm ngưỡng mới (admin only)
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

    const body = await request.json();
    const { label, value, icon, color, order } = body;

    // Validate
    const validation = validateThreshold({ label, value, icon, color, order });
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu không hợp lệ', errors: validation.errors },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Tự động gán order nếu không có
    let finalOrder = order;
    if (!finalOrder) {
      const maxOrder = await db
        .collection('popularConfig')
        .findOne({}, { sort: { order: -1 } });
      finalOrder = maxOrder ? (maxOrder.order || 0) + 1 : 1;
    }

    // Tạo document mới
    const newThreshold = {
      label: label.trim(),
      value: parseInt(value),
      icon: icon.trim(),
      color: color.trim(),
      order: finalOrder,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await db.collection('popularConfig').insertOne(newThreshold);

    return NextResponse.json(
      {
        success: true,
        message: 'Thêm ngưỡng thành công',
        data: { ...newThreshold, _id: result.insertedId },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating popular config:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tạo ngưỡng' },
      { status: 500 }
    );
  }
}

