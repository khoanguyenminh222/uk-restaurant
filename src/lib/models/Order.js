/**
 * Order Model
 * Schema cho đơn hàng
 */
export const OrderSchema = {
  order_id: String, // unique - mã đơn hàng
  user_id: String, // optional - có thể null nếu không đăng nhập
  // Nếu nhiều món (từ cart):
  items: [
    {
      món_id: Number,
      tên_món: String,
      giá: Number,
      quantity: Number,
      category_id: Number,
      category_name: String,
    },
  ],
  // Nếu 1 món (đặt ngay):
  món_id: Number, // optional - nếu items có thì không cần
  tên_món: String, // optional
  giá: Number, // optional
  quantity: Number, // optional
  category_id: Number, // optional
  category_name: String, // optional
  // Thông tin khách hàng (required):
  customer_name: String, // required
  customer_phone: String, // required
  customer_address: String, // optional
  // Thông tin đơn hàng:
  total_price: Number, // required - tổng tiền
  status: String, // required - pending, confirmed, preparing, ready, delivered, cancelled
  notes: String, // optional - ghi chú từ khách hàng khi đặt hàng (không thay đổi)
  admin_notes: String, // optional - ghi chú từ admin (riêng biệt với notes)
  cancel_reason: String, // optional - lý do hủy đơn hàng (riêng biệt)
  created_at: Date,
  updated_at: Date,
};

/**
 * Validate order data
 */
export function validateOrder(data) {
  const errors = [];
  
  if (!data.customer_name || typeof data.customer_name !== 'string' || data.customer_name.trim().length === 0) {
    errors.push('Tên khách hàng là bắt buộc');
  }
  
  if (!data.customer_phone || typeof data.customer_phone !== 'string' || data.customer_phone.trim().length === 0) {
    errors.push('Số điện thoại là bắt buộc');
  }
  
  // Validate phone format
  const phoneRegex = /^[0-9]{10,11}$/;
  if (data.customer_phone && !phoneRegex.test(data.customer_phone.replace(/\s+/g, ''))) {
    errors.push('Số điện thoại không hợp lệ');
  }
  
  // Phải có items hoặc món_id
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    if (!data.món_id) {
      errors.push('Đơn hàng phải có ít nhất 1 món');
    }
  }
  
  if (data.total_price === undefined || typeof data.total_price !== 'number' || data.total_price <= 0) {
    errors.push('Tổng tiền phải > 0');
  }
  
  if (!data.status || typeof data.status !== 'string') {
    errors.push('Trạng thái đơn hàng là bắt buộc');
  }
  
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push(`Trạng thái không hợp lệ. Phải là một trong: ${validStatuses.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

