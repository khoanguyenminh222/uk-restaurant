export const runtime = 'edge';

import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { getAdminFromToken } from '@/lib/auth';

/**
 * GET /api/banners
 * Lấy danh sách banner
 * Query params: 
 *   - is_active (optional) - filter theo trạng thái (true/false)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('is_active');

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const query = {};

    if (isActive !== null && isActive !== undefined) {
      if (isActive === 'true') {
        // Lấy banner active (is_active !== false, tức là true hoặc undefined/null)
        query.$or = [
          { is_active: true },
          { is_active: { $exists: false } },
          { is_active: null }
        ];
      } else if (isActive === 'false') {
        // Lấy banner không active
        query.is_active = false;
      }
      // Nếu isActive === 'all' hoặc giá trị khác, không filter (lấy tất cả)
    }
    // Nếu không có query param is_active, lấy tất cả banner (để admin panel hiển thị đầy đủ)

    // Get banners, sort by order
    const banners = await db
      .collection('banners')
      .find(query)
      .sort({ order: 1, created_at: -1 })
      .toArray();

    return NextResponse.json(
      {
        success: true,
        data: banners,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy danh sách banner' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/banners
 * Tạo banner mới (Admin only)
 */
export async function POST(request) {
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
    const { title, image, description, link, order, is_active } = body;

    // Validate required fields
    if (!image || typeof image !== 'string' || image.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Hình ảnh banner là bắt buộc' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Get next ID
    const lastBanner = await db
      .collection('banners')
      .findOne({}, { sort: { id: -1 } });
    const nextId = lastBanner ? lastBanner.id + 1 : 1;

    // Get next order if not provided
    const lastOrderBanner = await db
      .collection('banners')
      .findOne({}, { sort: { order: -1 } });
    const nextOrder = order !== undefined ? order : (lastOrderBanner ? lastOrderBanner.order + 1 : 1);

    const banner = {
      id: nextId,
      title: title || '',
      image: image.trim(),
      description: description || '',
      link: link || '',
      order: nextOrder,
      is_active: is_active !== undefined ? is_active : true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.collection('banners').insertOne(banner);

    return NextResponse.json(
      { success: true, data: banner },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tạo banner' },
      { status: 500 }
    );
  }
}


