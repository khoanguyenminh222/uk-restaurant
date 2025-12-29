import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/**
 * GET /api/food
 * Lấy danh sách món ăn
 * Query params: category_id (optional)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');

    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    const query = {};
    if (categoryId) {
      query.category_id = parseInt(categoryId);
    }

    const food = await db
      .collection('food')
      .find(query)
      .sort({ id: 1 })
      .toArray();

    return NextResponse.json(
      { success: true, data: food },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching food:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy danh sách món ăn' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/food
 * Tạo món ăn mới (Admin only)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    // TODO: Add admin authentication check

    // Validate
    if (!body.name || !body.category_id || body.price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Tên món, danh mục và giá là bắt buộc' },
        { status: 400 }
      );
    }

    // Generate ID if not provided
    if (!body.id) {
      const lastFood = await db
        .collection('food')
        .findOne({}, { sort: { id: -1 } });
      body.id = lastFood ? lastFood.id + 1 : 1;
    }

    // Set defaults
    if (body.is_available === undefined) {
      body.is_available = true;
    }

    // Set timestamps
    body.created_at = new Date();
    body.updated_at = new Date();

    const result = await db.collection('food').insertOne(body);

    return NextResponse.json(
      { success: true, data: { _id: result.insertedId, ...body } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating food:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tạo món ăn' },
      { status: 500 }
    );
  }
}

