/**
 * OrderLog Model
 * Schema cho log lịch sử đơn hàng (append-only)
 */
export const OrderLogSchema = {
  order_id: String, // mã đơn hàng
  user_id: String, // optional - có thể null
  food_id: Number, // ID món ăn
  name: String, // tên món
  price: Number, // giá món
  quantity: Number, // số lượng
  category_id: Number, // ID danh mục
  category_name: String, // tên danh mục
  customer_name: String, // tên khách hàng
  customer_phone: String, // số điện thoại
  customer_address: String, // địa chỉ
  timestamp: Date, // thời gian log
};

/**
 * Validate order log data
 */
export function validateOrderLog(data) {
  const errors = [];
  
  if (!data.order_id || typeof data.order_id !== 'string') {
    errors.push('Order ID là bắt buộc');
  }
  
  if (data.food_id === undefined || typeof data.food_id !== 'number') {
    errors.push('Food ID là bắt buộc');
  }
  
  if (data.quantity === undefined || typeof data.quantity !== 'number' || data.quantity <= 0) {
    errors.push('Số lượng phải > 0');
  }
  
  if (!data.customer_name || typeof data.customer_name !== 'string') {
    errors.push('Tên khách hàng là bắt buộc');
  }
  
  if (!data.customer_phone || typeof data.customer_phone !== 'string') {
    errors.push('Số điện thoại là bắt buộc');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

