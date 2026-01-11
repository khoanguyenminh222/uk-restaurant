import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { getAdminFromToken } from '@/lib/auth';

/**
 * GET /api/banners/:id
 * Lấy banner theo ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const banner = await db
      .collection('banners')
      .findOne({ id: parseInt(id) });

    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy banner' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: banner },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching banner:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy banner' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/banners/:id
 * Cập nhật banner (Admin only)
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Check admin authentication
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate
    if (body.image !== undefined && (!body.image || typeof body.image !== 'string' || body.image.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Hình ảnh banner không hợp lệ' },
        { status: 400 }
      );
    }

    // Update timestamps
    body.updated_at = new Date();

    const result = await db
      .collection('banners')
      .updateOne(
        { id: parseInt(id) },
        { $set: body }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy banner' },
        { status: 404 }
      );
    }

    const updatedBanner = await db
      .collection('banners')
      .findOne({ id: parseInt(id) });

    return NextResponse.json(
      { success: true, data: updatedBanner },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật banner' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/banners/:id
 * Xóa banner (Admin only)
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Check admin authentication
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await db
      .collection('banners')
      .deleteOne({ id: parseInt(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy banner' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Đã xóa banner thành công' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa banner' },
      { status: 500 }
    );
  }
}

