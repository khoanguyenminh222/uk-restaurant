import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/**
 * GET /api/food/:id
 * Lấy món ăn theo ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = await await params;
    const client = await clientPromise;
    const db = client.db('uk-restaurant');
    
    const food = await db
      .collection('food')
      .findOne({ id: parseInt(id) });

    if (!food) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy món ăn' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: food },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching food:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy món ăn' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/food/:id
 * Cập nhật món ăn (Admin only)
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    // TODO: Add admin authentication check

    // Validate
    if (body.name !== undefined && (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Tên món không hợp lệ' },
        { status: 400 }
      );
    }

    if (body.price !== undefined && (typeof body.price !== 'number' || body.price < 0)) {
      return NextResponse.json(
        { success: false, error: 'Giá phải là số và >= 0' },
        { status: 400 }
      );
    }

    // Update timestamps
    body.updated_at = new Date();

    const result = await db
      .collection('food')
      .updateOne(
        { id: parseInt(id) },
        { $set: body }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy món ăn' },
        { status: 404 }
      );
    }

    const updatedFood = await db
      .collection('food')
      .findOne({ id: parseInt(id) });

    return NextResponse.json(
      { success: true, data: updatedFood },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating food:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật món ăn' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/food/:id
 * Xóa món ăn (Admin only)
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    // TODO: Add admin authentication check

    const result = await db
      .collection('food')
      .deleteOne({ id: parseInt(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy món ăn' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Đã xóa món ăn thành công' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting food:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa món ăn' },
      { status: 500 }
    );
  }
}

