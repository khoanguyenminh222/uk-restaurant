/**
 * Category Model
 * Schema cho danh mục món ăn
 */
export const CategorySchema = {
  id: Number, // unique
  name: String, // required
  description: String, // optional
  order: Number, // để sắp xếp
  icon: String, // optional - icon name hoặc URL
  color: String, // optional - màu sắc cho danh mục
  created_at: Date,
  updated_at: Date,
};

/**
 * Validate category data
 */
export function validateCategory(data) {
  const errors = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Tên danh mục là bắt buộc');
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

