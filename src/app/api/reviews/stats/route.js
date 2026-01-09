import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { calculateReviewStats } from '@/lib/models/Review';

/**
 * GET /api/reviews/stats
 * Lấy thống kê đánh giá (public)
 */
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Lấy tất cả reviews đã được duyệt
    const reviews = await db
      .collection('reviews')
      .find({ is_approved: { $ne: false } })
      .toArray();

    const stats = calculateReviewStats(reviews);

    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy thống kê đánh giá' },
      { status: 500 }
    );
  }
}

