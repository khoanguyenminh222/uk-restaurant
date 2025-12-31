/**
 * Banner Model
 * Schema cho banner hero
 */
export const BannerSchema = {
  id: Number, // unique
  title: String, // optional - tiêu đề banner
  image: String, // required - URL hình ảnh
  description: String, // optional - mô tả
  link: String, // optional - link khi click vào banner
  order: Number, // để sắp xếp thứ tự hiển thị
  is_active: Boolean, // optional - banner có đang active không (default: true)
  created_at: Date,
  updated_at: Date,
};

/**
 * Validate banner data
 */
export function validateBanner(data) {
  const errors = [];
  
  if (!data.image || typeof data.image !== 'string' || data.image.trim().length === 0) {
    errors.push('Hình ảnh banner là bắt buộc');
  }
  
  if (data.id !== undefined && typeof data.id !== 'number') {
    errors.push('ID phải là số');
  }
  
  if (data.order !== undefined && typeof data.order !== 'number') {
    errors.push('Order phải là số');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

