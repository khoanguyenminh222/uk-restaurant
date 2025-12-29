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
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

