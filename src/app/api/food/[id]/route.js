import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { validateFood } from '@/lib/models/Food';
import { ObjectId } from 'mongodb';

/**
 * GET /api/food/:id
 * Lấy món ăn theo ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(getDatabaseName());
    
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
    const db = client.db(getDatabaseName());

    // TODO: Add admin authentication check

    // Get existing food to merge with update data
    const existingFood = await db
      .collection('food')
      .findOne({ id: parseInt(id) });

    if (!existingFood) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy món ăn' },
        { status: 404 }
      );
    }

    // Merge existing data with update data
    const mergedData = { ...existingFood, ...body };

    // Validate using Food model
    const validation = validateFood(mergedData);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu không hợp lệ', errors: validation.errors },
        { status: 400 }
      );
    }

    // Validate manual_badge.threshold_id if provided
    if (body.manual_badge && body.manual_badge.threshold_id) {
      const threshold = await db
        .collection('popularConfig')
        .findOne({ _id: new ObjectId(body.manual_badge.threshold_id) });
      
      if (!threshold) {
        return NextResponse.json(
          { success: false, error: 'Ngưỡng không tồn tại' },
          { status: 400 }
        );
      }
    }

    // If manual_badge is explicitly set to null, remove it
    if (body.manual_badge === null) {
      body.manual_badge = null;
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
    const db = client.db(getDatabaseName());

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

