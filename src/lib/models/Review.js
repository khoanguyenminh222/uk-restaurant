/**
 * Review Model
 * Schema cho đánh giá từ khách hàng
 */

export const ReviewSchema = {
  customer_name: String, // required - Tên khách hàng
  customer_phone: String, // optional - Số điện thoại
  customer_email: String, // optional - Email
  rating: Number, // required - Điểm đánh giá từ 1-5
  comment: String, // optional - Bình luận
  order_id: String, // optional - ID đơn hàng (nếu đánh giá sau khi đặt hàng)
  is_approved: Boolean, // optional - Đã được admin duyệt chưa (default: false) - Chỉ hiển thị khi đã duyệt
  avatar: String, // optional - Emoji hoặc URL avatar
  color: String, // optional - Màu cho card (from-blue-500/20 to-blue-600/10)
  borderColor: String, // optional - Màu border (border-blue-500/30)
  created_at: Date,
  updated_at: Date,
};

/**
 * Validate review data
 */
export function validateReview(data) {
  const errors = [];

  if (!data.customer_name || typeof data.customer_name !== 'string' || data.customer_name.trim().length === 0) {
    errors.push('Customer name là bắt buộc');
  } else if (data.customer_name.length > 100) {
    errors.push('Customer name không được vượt quá 100 ký tự');
  }

  if (data.customer_phone && typeof data.customer_phone === 'string' && data.customer_phone.length > 20) {
    errors.push('Customer phone không được vượt quá 20 ký tự');
  }

  if (data.customer_email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customer_email)) {
      errors.push('Customer email không hợp lệ');
    } else if (data.customer_email.length > 100) {
      errors.push('Customer email không được vượt quá 100 ký tự');
    }
  }

  if (data.rating === undefined || data.rating === null) {
    errors.push('Rating là bắt buộc');
  } else {
    const rating = parseInt(data.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      errors.push('Rating phải là số từ 1 đến 5');
    }
  }

  if (data.comment && data.comment.length > 500) {
    errors.push('Comment không được vượt quá 500 ký tự');
  }

  if (data.avatar && data.avatar.length > 10) {
    errors.push('Avatar không được vượt quá 10 ký tự');
  }

  if (data.color && data.color.length > 100) {
    errors.push('Color không được vượt quá 100 ký tự');
  }

  if (data.borderColor && data.borderColor.length > 100) {
    errors.push('BorderColor không được vượt quá 100 ký tự');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate review statistics
 */
export function calculateReviewStats(reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      verifiedCustomers: 0,
      ratingDistribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    };
  }

  // Chỉ tính các review đã được duyệt
  const approvedReviews = reviews.filter(r => r.is_approved !== false);
  const totalReviews = approvedReviews.length;
  
  if (totalReviews === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      verifiedCustomers: 0,
      ratingDistribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    };
  }

  const totalRating = approvedReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  const averageRating = totalRating / totalReviews;
  
  // verifiedCustomers = 100% vì tất cả review đã duyệt đều được coi là verified
  const verifiedCustomers = 100;

  const ratingDistribution = {
    5: approvedReviews.filter(r => r.rating === 5).length,
    4: approvedReviews.filter(r => r.rating === 4).length,
    3: approvedReviews.filter(r => r.rating === 3).length,
    2: approvedReviews.filter(r => r.rating === 2).length,
    1: approvedReviews.filter(r => r.rating === 1).length,
  };

  return {
    averageRating: Math.round(averageRating * 10) / 10, // Làm tròn 1 chữ số thập phân
    totalReviews,
    verifiedCustomers,
    ratingDistribution,
  };
}

