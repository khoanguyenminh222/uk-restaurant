import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { validateReview, calculateReviewStats } from '@/lib/models/Review';

/**
 * GET /api/reviews
 * Lấy danh sách đánh giá
 * Query params:
 * - approved: true/false (lọc theo trạng thái duyệt)
 * - rating: 1-5 (lọc theo điểm đánh giá)
 * - search: tìm kiếm theo tên, comment, phone, email
 * - visible: true/false (lọc theo trạng thái hiển thị)
 * - date_from: YYYY-MM-DD (lọc từ ngày)
 * - date_to: YYYY-MM-DD (lọc đến ngày)
 * - limit: số lượng (default: 50)
 * - skip: bỏ qua (default: 0)
 * - all: true (cho phép admin lấy tất cả reviews)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const approved = searchParams.get('approved');
    const rating = searchParams.get('rating');
    const search = searchParams.get('search');
    const visible = searchParams.get('visible');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const query = {};
    const all = searchParams.get('all'); // Cho phép admin lấy tất cả reviews

    // Filter by approval status
    if (approved !== null) {
      query.is_approved = approved === 'true';
    }

    // Filter by rating
    if (rating && rating !== 'all') {
      query.rating = parseInt(rating);
    }

    // Filter by visibility
    if (visible !== null && visible !== 'all') {
      query.is_visible = visible === 'true';
    }

    // Search filter
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { customer_name: searchRegex },
        { comment: searchRegex },
        { customer_phone: searchRegex },
        { customer_email: searchRegex },
      ];
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      query.created_at = {};
      if (dateFrom) {
        // Từ đầu ngày (00:00:00)
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        query.created_at.$gte = fromDate;
      }
      if (dateTo) {
        // Đến cuối ngày (23:59:59)
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        query.created_at.$lte = toDate;
      }
    }

    // Nếu không có approved param và không phải all, chỉ lấy reviews đã được duyệt và visible (cho public)
    if (approved === null && all !== 'true') {
      query.is_approved = { $ne: false };
      query.is_visible = true; // Chỉ hiển thị reviews được đánh dấu visible
    }

    // Base query for stats calculations (ignores approval status to count both approved/pending)
    const statsBaseQuery = {};
    if (query.rating) statsBaseQuery.rating = query.rating;
    if (query.is_visible !== undefined) statsBaseQuery.is_visible = query.is_visible;
    if (query.$or) statsBaseQuery.$or = query.$or;
    if (query.created_at) statsBaseQuery.created_at = query.created_at;

    const reviews = await db
      .collection('reviews')
      .find(query)
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    const total = await db.collection('reviews').countDocuments(query);

    // Calculate stats based on filtered reviews
    const filteredApprovedQuery = { ...statsBaseQuery, is_approved: { $ne: false } };
    const filteredApprovedReviews = await db
      .collection('reviews')
      .find(filteredApprovedQuery)
      .toArray();

    const stats = calculateReviewStats(filteredApprovedReviews);
    const totalApproved = await db.collection('reviews').countDocuments(filteredApprovedQuery);
    const totalPending = await db.collection('reviews').countDocuments({ ...statsBaseQuery, is_approved: false });

    return NextResponse.json(
      {
        success: true,
        data: reviews.map(review => {
          // Nếu là admin (có param all=true), trả về đầy đủ
          if (all === 'true') {
            return {
              ...review,
              _id: review._id.toString(),
            };
          }

          // Nếu là public API, chỉ trả về các trường safe
          return {
            _id: review._id.toString(),
            customer_name: review.customer_name,
            rating: review.rating,
            comment: review.comment,
            created_at: review.created_at,
            avatar: review.avatar,
            color: review.color,
            borderColor: review.borderColor,
            // Trả về phone/email đã được che
            customer_phone: maskPhone(review.customer_phone),
            customer_email: maskEmail(review.customer_email),
            // Không trả về updated_at, is_approved, is_visible
          };
        }),
        // Chỉ trả về stats nếu là admin request (all=true)
        stats: all === 'true' ? {
          ...stats,
          totalApproved,
          totalPending,
          totalAllReviews: totalApproved + totalPending,
          totalFiltered: total,
        } : undefined,
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + limit < total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy danh sách đánh giá' },
      { status: 500 }
    );
  }
}

// Helper functions để che thông tin
function maskPhone(phone) {
  if (!phone || phone.length < 4) return '***';
  return phone.slice(0, 3) + '*'.repeat(phone.length - 6) + phone.slice(-3);
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return '***';
  const [name, domain] = email.split('@');
  if (name.length <= 3) {
    return name + '***@' + domain;
  }
  return name.slice(0, 3) + '***@' + domain;
}

/**
 * POST /api/reviews
 * Tạo đánh giá mới (public)
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const validation = validateReview(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu không hợp lệ', errors: validation.errors },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const now = new Date();
    const newReview = {
      customer_name: body.customer_name.trim(),
      customer_phone: body.customer_phone?.trim() || '',
      customer_email: body.customer_email?.trim() || '',
      rating: parseInt(body.rating),
      comment: body.comment?.trim() || '',
      order_id: body.order_id || '',
      is_approved: false, // Mặc định chưa duyệt, admin sẽ duyệt sau
      is_visible: false, // Mặc định không hiển thị, admin sẽ bật sau khi duyệt
      avatar: body.avatar || '👤',
      color: body.color || 'from-primary/20 to-primary-light/10',
      borderColor: body.borderColor || 'border-primary/30',
      created_at: now,
      updated_at: now,
    };

    const result = await db.collection('reviews').insertOne(newReview);

    return NextResponse.json(
      {
        success: true,
        message: 'Đánh giá đã được gửi. Cảm ơn bạn đã phản hồi!',
        data: { ...newReview, _id: result.insertedId.toString() },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tạo đánh giá' },
      { status: 500 }
    );
  }
}

