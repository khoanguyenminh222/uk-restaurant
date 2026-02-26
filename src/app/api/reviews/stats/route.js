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
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const rating = searchParams.get('rating');
    const visible = searchParams.get('visible');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Build common filter
    const statsBaseQuery = {};
    if (rating && rating !== 'all') statsBaseQuery.rating = parseInt(rating);
    if (visible !== null && visible !== 'all') statsBaseQuery.is_visible = visible === 'true';
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      statsBaseQuery.$or = [
        { customer_name: searchRegex },
        { comment: searchRegex },
        { customer_phone: searchRegex },
        { customer_email: searchRegex },
      ];
    }
    if (dateFrom || dateTo) {
      statsBaseQuery.created_at = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        statsBaseQuery.created_at.$gte = fromDate;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        statsBaseQuery.created_at.$lte = toDate;
      }
    }

    // Lấy tất cả reviews đã được duyệt để tính stats (within filter)
    const approvedQuery = { ...statsBaseQuery, is_approved: { $ne: false } };
    const approvedReviews = await db
      .collection('reviews')
      .find(approvedQuery)
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

      const totalApproved = await db.collection('reviews').countDocuments(approvedQuery);
      const totalPending = await db.collection('reviews').countDocuments({ ...statsBaseQuery, is_approved: false });
      const totalReviews = totalApproved + totalPending;

      return NextResponse.json({
        success: true,
        data: {
          ...stats,
          verifiedCustomers: totalReviews > 0 ? Math.round((totalApproved / totalReviews) * 100) : 0,
          totalApproved,
          totalPending,
          totalAllReviews: totalReviews,
          configMode: isAutoStats ? 'Auto' : 'Manual'
        },
      }, { status: 200 });
    }

    // Nếu là Public User
    if (isAutoStats) {
      // Nếu cấu hình Auto: Trả về Real Stats
      const stats = calculateReviewStats(approvedReviews);

      // Calculate real verified percentage (Approved / Total Submission)
      const totalReviewsCount = await db.collection('reviews').countDocuments({});
      const totalApprovedCount = approvedReviews.length;
      const verifiedPercentage = totalReviewsCount > 0
        ? Math.round((totalApprovedCount / totalReviewsCount) * 100)
        : 0;

      return NextResponse.json({
        success: true,
        data: {
          ...stats,
          verifiedCustomers: verifiedPercentage
        },
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

