import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { validateThreshold } from '@/lib/models/PopularConfig';

/**
 * PUT /api/config/popular/:id
 * Cập nhật ngưỡng (admin only)
 */
export async function PUT(request, { params }) {
  try {
    // TODO: Thêm admin authentication check
    // const user = await getUserFromRequest(request);
    // if (!user || !(await isAdmin(user.user_id))) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID không hợp lệ' },
        { status: 400 }
      );
    }

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

    // Kiểm tra ngưỡng có tồn tại không
    const existing = await db
      .collection('popularConfig')
      .findOne({ _id: new ObjectId(id) });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Ngưỡng không tồn tại' },
        { status: 404 }
      );
    }

    // Cập nhật
    const updateData = {
      label: label.trim(),
      value: parseInt(value),
      icon: icon.trim(),
      color: color.trim(),
      order: order ? parseInt(order) : existing.order,
      updated_at: new Date(),
    };

    const result = await db
      .collection('popularConfig')
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Ngưỡng không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Cập nhật ngưỡng thành công',
        data: { ...updateData, _id: id },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating popular config:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật ngưỡng' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/config/popular/:id
 * Xóa ngưỡng (admin only)
 */
export async function DELETE(request, { params }) {
  try {
    // TODO: Thêm admin authentication check
    // const user = await getUserFromRequest(request);
    // if (!user || !(await isAdmin(user.user_id))) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID không hợp lệ' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const result = await db
      .collection('popularConfig')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Ngưỡng không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Xóa ngưỡng thành công',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting popular config:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa ngưỡng' },
      { status: 500 }
    );
  }
}

