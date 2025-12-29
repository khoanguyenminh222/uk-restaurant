import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/**
 * GET /api/categories
 * Lấy danh sách tất cả danh mục
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('uk-restaurant');
    const categories = await db
      .collection('categories')
      .find({})
      .sort({ order: 1 })
      .toArray();

    return NextResponse.json(
      { success: true, data: categories },
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
    const db = client.db('uk-restaurant');

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

