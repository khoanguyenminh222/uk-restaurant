import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/**
 * GET /api/categories/:id
 * Lấy danh mục theo ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db('uk-restaurant');
    
    const category = await db
      .collection('categories')
      .findOne({ id: parseInt(id) });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy danh mục' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: category },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy danh mục' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/categories/:id
 * Cập nhật danh mục (Admin only)
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
        { success: false, error: 'Tên danh mục không hợp lệ' },
        { status: 400 }
      );
    }

    // Update timestamps
    body.updated_at = new Date();

    const result = await db
      .collection('categories')
      .updateOne(
        { id: parseInt(id) },
        { $set: body }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy danh mục' },
        { status: 404 }
      );
    }

    const updatedCategory = await db
      .collection('categories')
      .findOne({ id: parseInt(id) });

    return NextResponse.json(
      { success: true, data: updatedCategory },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật danh mục' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/:id
 * Xóa danh mục (Admin only)
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    // TODO: Add admin authentication check

    // Kiểm tra xem danh mục có món ăn không
    const foodCount = await db
      .collection('food')
      .countDocuments({ category_id: parseInt(id) });

    if (foodCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Không thể xóa danh mục. Có ${foodCount} món ăn đang thuộc danh mục này. Vui lòng chuyển hoặc xóa các món ăn trước.` 
        },
        { status: 400 }
      );
    }

    const result = await db
      .collection('categories')
      .deleteOne({ id: parseInt(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy danh mục' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Đã xóa danh mục thành công' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa danh mục' },
      { status: 500 }
    );
  }
}

