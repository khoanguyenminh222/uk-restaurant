/**
 * PopularConfig Model
 * Schema cho cấu hình ngưỡng món nổi bật
 * Mỗi ngưỡng là 1 document riêng trong collection popularConfig
 */

/**
 * Schema cho PopularConfig (mỗi ngưỡng là 1 document)
 */
export const PopularConfigSchema = {
  label: String,        // Tên hiển thị (ví dụ: "Bán chạy", "Nổi bật", "Phổ biến")
  value: Number,        // Số lượng tối thiểu để đạt ngưỡng (>= 1)
  icon: String,         // Icon emoji (ví dụ: "🔥", "⭐", "⚡", "🏆", "👑", "💎", ...)
  color: String,        // Mã màu hex (ví dụ: "#FF0000", "#0066FF", "#8000FF", ...)
  order: Number,        // Thứ tự hiển thị (1 = cao nhất)
  created_at: Date,
  updated_at: Date,
};

/**
 * Validate threshold data (single threshold)
 */
export function validateThreshold(data) {
  const errors = [];
  
  if (!data.label || typeof data.label !== 'string' || data.label.trim().length === 0) {
    errors.push('Label là bắt buộc');
  }
  
  if (typeof data.value !== 'number' || data.value < 1 || !Number.isInteger(data.value)) {
    errors.push('Value phải là số nguyên >= 1');
  }
  
  if (!data.icon || typeof data.icon !== 'string' || data.icon.trim().length === 0) {
    errors.push('Icon là bắt buộc');
  }
  
  // Validate color hex format
  if (!data.color || typeof data.color !== 'string') {
    errors.push('Color là bắt buộc');
  } else {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(data.color)) {
      errors.push('Color phải là mã màu hex hợp lệ (ví dụ: #FF0000)');
    }
  }
  
  if (data.order !== undefined && (typeof data.order !== 'number' || data.order < 1 || !Number.isInteger(data.order))) {
    errors.push('Order phải là số nguyên >= 1');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

