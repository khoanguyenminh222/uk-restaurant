import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { calculateReviewStats } from '@/lib/models/Review';
import { getAdminFromToken } from '@/lib/auth';

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

    // Check if user is admin
    const admin = await getAdminFromToken(request);

    // Lấy config để kiểm tra chế độ hiển thị (Auto/Manual)
    const configDoc = await db.collection('landingConfig').findOne({ config_type: 'landing' });
    const testimonialsConfig = configDoc?.testimonials || {};
    const isAutoStats = testimonialsConfig.auto_calculate_stats;

    // Nếu là Admin: Luôn thấy Real Stats + Internal Stats
    if (admin) {
      const stats = calculateReviewStats(approvedReviews);

      const totalApproved = await db.collection('reviews').countDocuments({ is_approved: { $ne: false } });
      const totalPending = await db.collection('reviews').countDocuments({ is_approved: false });
      const totalReviews = await db.collection('reviews').countDocuments({});

      return NextResponse.json({
        success: true,
        data: {
          ...stats,
          totalApproved,
          totalPending,
          totalAllReviews: totalReviews,
          // Debug info for admin
          configMode: isAutoStats ? 'Auto' : 'Manual'
        },
      }, { status: 200 });
    }

    // Nếu là Public User
    if (isAutoStats) {
      // Nếu cấu hình Auto: Trả về Real Stats
      const stats = calculateReviewStats(approvedReviews);
      return NextResponse.json({
        success: true,
        data: stats,
      }, { status: 200 });
    } else {
      // Nếu cấu hình Manual: Trả về Manual Stats từ Config
      const trustStats = testimonialsConfig.trustStats || {
        averageRating: 5,
        totalReviews: 100,
        verifiedCustomers: 100,
      };

      return NextResponse.json({
        success: true,
        data: {
          averageRating: trustStats.averageRating || 5,
          totalReviews: trustStats.totalReviews || 100,
          verifiedCustomers: trustStats.verifiedCustomers || 100,
          // Hide ratingDistribution for manual stats to avoid calculating real data
          ratingDistribution: null
        },
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy thống kê đánh giá' },
      { status: 500 }
    );
  }
}

