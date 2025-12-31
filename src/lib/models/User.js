/**
 * User Model
 * Schema cho người dùng (optional - không bắt buộc đăng nhập)
 */
export const UserSchema = {
  user_id: String, // unique - có thể là phone hoặc UUID
  phone: String, // unique - số điện thoại
  name: String, // required
  email: String, // required for registration, unique
  password: String, // required for registration (hashed)
  address: String, // optional
  email_verified: Boolean, // false by default
  verification_code: String, // 6-digit code
  verification_code_expires: Date, // expires in 15 minutes
  created_at: Date,
  last_login: Date,
};

/**
 * Validate user data
 */
export function validateUser(data) {
  const errors = [];
  
  if (!data.phone || typeof data.phone !== 'string' || data.phone.trim().length === 0) {
    errors.push('Số điện thoại là bắt buộc');
  }
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Tên là bắt buộc');
  }
  
  // Validate phone format (basic)
  const phoneRegex = /^[0-9]{10,11}$/;
  if (data.phone && !phoneRegex.test(data.phone.replace(/\s+/g, ''))) {
    errors.push('Số điện thoại không hợp lệ');
  }
  
  // Validate email if provided
  if (data.email && typeof data.email === 'string' && data.email.length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Email không hợp lệ');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate user registration data (includes password)
 */
export function validateUserRegistration(data) {
  const errors = [];
  
  // Validate required fields
  if (!data.phone || typeof data.phone !== 'string' || data.phone.trim().length === 0) {
    errors.push('Số điện thoại là bắt buộc');
  }
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Tên là bắt buộc');
  }
  
  if (!data.email || typeof data.email !== 'string' || data.email.trim().length === 0) {
    errors.push('Email là bắt buộc');
  }
  
  if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
    errors.push('Mật khẩu phải có ít nhất 6 ký tự');
  }
  
  // Validate phone format
  const phoneRegex = /^[0-9]{10,11}$/;
  if (data.phone && !phoneRegex.test(data.phone.replace(/\s+/g, ''))) {
    errors.push('Số điện thoại không hợp lệ');
  }
  
  // Validate email format
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Email không hợp lệ');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

