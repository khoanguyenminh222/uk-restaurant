/**
 * Food Model
 * Schema cho món ăn
 */
export const FoodSchema = {
  id: Number, // unique
  name: String, // required
  category_id: Number, // required - tham chiếu đến Category.id
  price: Number, // required - giá tiền
  image: String, // optional - URL hình ảnh
  description: String, // optional - mô tả món
  is_available: Boolean, // optional - món còn bán không (default: true)
  // Badge settings (optional) - Kết hợp Tự động + Thủ công
  manual_badge: {
    threshold_id: String, // optional - Reference đến PopularConfig._id (dùng badge từ ngưỡng có sẵn)
    label: String, // optional - Tên badge tùy chỉnh (nếu không dùng threshold_id)
    icon: String, // optional - Icon emoji tùy chỉnh (nếu không dùng threshold_id)
    color: String, // optional - Mã màu hex tùy chỉnh (nếu không dùng threshold_id)
  },
  use_auto_badge: Boolean, // optional - Có dùng hệ thống tự động không (default: true)
  created_at: Date,
  updated_at: Date,
};

/**
 * Validate food data
 */
export function validateFood(data) {
  const errors = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Tên món là bắt buộc');
  }
  
  if (data.category_id === undefined || typeof data.category_id !== 'number') {
    errors.push('Danh mục là bắt buộc');
  }
  
  if (data.price === undefined || typeof data.price !== 'number' || data.price < 0) {
    errors.push('Giá phải là số và >= 0');
  }
  
  if (data.id !== undefined && typeof data.id !== 'number') {
    errors.push('ID phải là số');
  }
  
  // Validate manual_badge if provided
  if (data.manual_badge !== undefined && data.manual_badge !== null) {
    if (typeof data.manual_badge !== 'object') {
      errors.push('manual_badge phải là object');
    } else {
      // If threshold_id is provided, label/icon/color are optional
      // If threshold_id is not provided, label/icon/color are required
      if (!data.manual_badge.threshold_id) {
        if (!data.manual_badge.label || typeof data.manual_badge.label !== 'string' || data.manual_badge.label.trim().length === 0) {
          errors.push('Label là bắt buộc nếu không có threshold_id');
        }
        if (!data.manual_badge.icon || typeof data.manual_badge.icon !== 'string' || data.manual_badge.icon.trim().length === 0) {
          errors.push('Icon là bắt buộc nếu không có threshold_id');
        }
        if (!data.manual_badge.color || typeof data.manual_badge.color !== 'string') {
          errors.push('Color là bắt buộc nếu không có threshold_id');
        } else {
          const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
          if (!hexColorRegex.test(data.manual_badge.color)) {
            errors.push('Color phải là mã màu hex hợp lệ (ví dụ: #FF0000)');
          }
        }
      }
    }
  }
  
  // Validate use_auto_badge if provided
  if (data.use_auto_badge !== undefined && typeof data.use_auto_badge !== 'boolean') {
    errors.push('use_auto_badge phải là boolean');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

