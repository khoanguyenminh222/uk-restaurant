import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * PUT /api/reviews/[id]
 * Cập nhật đánh giá (admin only)
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // TODO: Thêm admin authentication check

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const updateData = {
      updated_at: new Date(),
    };

    // Chỉ cho phép cập nhật các field được phép
    if (body.is_approved !== undefined) {
      updateData.is_approved = body.is_approved;
      // Nếu chưa được duyệt, tự động tắt hiển thị
      if (body.is_approved === false) {
        updateData.is_visible = false;
      }
    }
    if (body.is_visible !== undefined) {
      // Chỉ cho phép set is_visible = true nếu đã được duyệt
      if (body.is_visible === true) {
        // Kiểm tra review hiện tại có được duyệt không
        const currentReview = await db.collection('reviews').findOne({ _id: new ObjectId(id) });
        if (currentReview && currentReview.is_approved === false) {
          return NextResponse.json(
            { success: false, error: 'Không thể hiển thị review chưa được duyệt. Vui lòng duyệt review trước.' },
            { status: 400 }
          );
        }
      }
      updateData.is_visible = body.is_visible;
    }
    if (body.avatar !== undefined) {
      updateData.avatar = body.avatar;
    }
    if (body.color !== undefined) {
      updateData.color = body.color;
    }
    if (body.borderColor !== undefined) {
      updateData.borderColor = body.borderColor;
    }
    // Không cho phép sửa: customer_name, rating, comment

    const result = await db
      .collection('reviews')
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đánh giá' },
        { status: 404 }
      );
    }

    const updatedReview = await db
      .collection('reviews')
      .findOne({ _id: new ObjectId(id) });

    return NextResponse.json(
      {
        success: true,
        message: 'Cập nhật đánh giá thành công',
        data: { ...updatedReview, _id: updatedReview._id.toString() },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật đánh giá' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[id]
 * Xóa đánh giá (admin only)
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // TODO: Thêm admin authentication check

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const result = await db
      .collection('reviews')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đánh giá' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Xóa đánh giá thành công',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa đánh giá' },
      { status: 500 }
    );
  }
}

