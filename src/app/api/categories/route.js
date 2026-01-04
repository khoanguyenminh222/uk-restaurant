import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';

/**
 * GET /api/categories
 * Lấy danh sách tất cả danh mục
 * Query params:
 *   - search (optional) - search theo tên, description
 *   - page (optional) - số trang
 *   - limit (optional) - số lượng/trang
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await db.collection('categories').countDocuments(query);

    // Get categories with pagination
    const categories = await db
      .collection('categories')
      .find(query)
      .sort({ order: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json(
      { 
        success: true, 
        data: categories,
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
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy danh sách danh mục' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Tạo danh mục mới (Admin only)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // TODO: Add admin authentication check

    // Validate
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Tên danh mục là bắt buộc' },
        { status: 400 }
      );
    }

    // Generate ID if not provided
    if (!body.id) {
      const lastCategory = await db
        .collection('categories')
        .findOne({}, { sort: { id: -1 } });
      body.id = lastCategory ? lastCategory.id + 1 : 1;
    }

    // Set timestamps
    body.created_at = new Date();
    body.updated_at = new Date();

    const result = await db.collection('categories').insertOne(body);

    return NextResponse.json(
      { success: true, data: { _id: result.insertedId, ...body } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tạo danh mục' },
      { status: 500 }
    );
  }
}

