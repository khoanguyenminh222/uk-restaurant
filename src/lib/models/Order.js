/**
 * Order Model
 * Schema cho đơn hàng
 */
export const OrderSchema = {
  order_id: String, // unique - mã đơn hàng
  user_id: String, // optional - có thể null nếu không đăng nhập
  // Danh sách món ăn (luôn dùng array):
  items: [
    {
      food_id: Number, // ID món ăn
      name: String, // tên món
      price: Number, // giá món
      quantity: Number, // số lượng
      category_id: Number, // ID danh mục
      category_name: String, // tên danh mục
    },
  ],
  // Thông tin khách hàng (required):
  customer_name: String, // required
  customer_phone: String, // required
  customer_address: String, // optional
  // Thông tin đơn hàng:
  total_price: Number, // required - tổng tiền
  status: String, // required - pending, confirmed, preparing, ready, delivered, cancelled
  notes: String, // optional - ghi chú từ khách hàng khi đặt hàng (không thay đổi)
  admin_notes: String, // optional - ghi chú từ admin (riêng biệt với notes)
  discount_percent: Number, // optional - % giảm giá (0-100), mặc định 0
  original_price: Number, // optional - giá gốc trước khi giảm
  cancel_reason: String, // optional - lý do hủy đơn hàng (riêng biệt)
  status_history: [ // optional - lịch sử thay đổi trạng thái
    {
      status: String, // trạng thái mới
      changed_at: Date, // thời gian thay đổi
      changed_by: String, // người thay đổi (admin, user, system) - để tương thích
      changed_by_detail: { // chi tiết người thay đổi (optional)
        type: String, // 'admin', 'user', 'system'
        user_id: String, // ID của user/admin
        name: String, // tên
        phone: String, // số điện thoại
        email: String, // email
        role: String, // role (nếu là admin: admin, manager, super_admin)
      },
    },
  ],
  change_history: [ // optional - lịch sử thay đổi chi tiết (tất cả các trường)
    {
      changed_at: Date, // thời gian thay đổi
      changed_by: String, // người thay đổi (admin, user, system)
      changed_by_detail: { // chi tiết người thay đổi
        type: String, // 'admin', 'user', 'system'
        user_id: String, // ID của user/admin
        name: String, // tên
        phone: String, // số điện thoại
        email: String, // email
        role: String, // role (nếu là admin: admin, manager, super_admin)
      },
      changes: [ // danh sách các thay đổi
        {
          field: String, // tên trường thay đổi (customer_name, customer_phone, items, total_price, status, admin_notes, etc.)
          old_value: String | Number | Array | null, // giá trị cũ
          new_value: String | Number | Array | null, // giá trị mới
        },
      ],
    },
  ],
  created_by_admin: Boolean, // optional - true nếu do admin tạo manually
  created_by_admin_detail: { // optional - chi tiết admin tạo đơn
    user_id: String,
    name: String,
  },
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

  // Phải có items array với ít nhất 1 món
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('Đơn hàng phải có ít nhất 1 sản phẩm');
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

