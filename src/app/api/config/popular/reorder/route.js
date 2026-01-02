import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

/**
 * PUT /api/config/popular/reorder
 * Sắp xếp lại thứ tự ngưỡng (admin only)
 * Body: { thresholdIds: ["id1", "id2", "id3"] } - thứ tự mới
 */
export async function PUT(request) {
  try {
    // TODO: Thêm admin authentication check
    // const user = await getUserFromRequest(request);
    // if (!user || !(await isAdmin(user.user_id))) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const body = await request.json();
    const { thresholdIds } = body;

    if (!Array.isArray(thresholdIds) || thresholdIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'thresholdIds phải là mảng không rỗng' },
        { status: 400 }
      );
    }

    // Validate tất cả IDs
    const invalidIds = thresholdIds.filter(id => !ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Có ID không hợp lệ', invalidIds },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    // Cập nhật order cho từng ngưỡng
    const updatePromises = thresholdIds.map((id, index) => {
      return db
        .collection('popularConfig')
        .updateOne(
          { _id: new ObjectId(id) },
          { $set: { order: index + 1, updated_at: new Date() } }
        );
    });

    await Promise.all(updatePromises);

    return NextResponse.json(
      {
        success: true,
        message: 'Sắp xếp lại thứ tự thành công',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error reordering popular config:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi sắp xếp lại thứ tự' },
      { status: 500 }
    );
  }
}

