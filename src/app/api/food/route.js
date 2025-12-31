import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/**
 * GET /api/food
 * Lấy danh sách món ăn
 * Query params: 
 *   - category_id (optional) - filter theo category
 *   - search (optional) - search theo tên, description
 *   - is_available (optional) - filter theo trạng thái (true/false)
 *   - page (optional) - số trang
 *   - limit (optional) - số lượng/trang
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    const search = searchParams.get('search');
    const isAvailable = searchParams.get('is_available');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    const query = {};
    
    if (categoryId && categoryId !== 'all') {
      query.category_id = parseInt(categoryId);
    }

    if (isAvailable && isAvailable !== 'all') {
      query.is_available = isAvailable === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await db.collection('food').countDocuments(query);

    // Get food with pagination
    const food = await db
      .collection('food')
      .find(query)
      .sort({ id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json(
      { 
        success: true, 
        data: food,
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

