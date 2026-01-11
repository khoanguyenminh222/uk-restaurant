import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { calculateReviewStats } from '@/lib/models/Review';

/**
 * GET /api/reviews/stats
 * Lấy thống kê đánh giá (public)
 * Trả về stats từ TẤT CẢ reviews trong database (không phân trang)
 */
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Lấy tất cả reviews đã được duyệt để tính stats
    const approvedReviews = await db
      .collection('reviews')
      .find({ is_approved: { $ne: false } })
      .toArray();

    const stats = calculateReviewStats(approvedReviews);

    // Thêm thông tin về tổng số reviews đã duyệt và chờ duyệt từ toàn bộ database
    const totalApproved = await db.collection('reviews').countDocuments({ is_approved: { $ne: false } });
    const totalPending = await db.collection('reviews').countDocuments({ is_approved: false });
    const totalReviews = await db.collection('reviews').countDocuments({});

    return NextResponse.json(
      {
        success: true,
        data: {
          ...stats,
          totalApproved, // Tổng số reviews đã duyệt
          totalPending,  // Tổng số reviews chờ duyệt
          totalAllReviews: totalReviews, // Tổng số tất cả reviews
        },
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

