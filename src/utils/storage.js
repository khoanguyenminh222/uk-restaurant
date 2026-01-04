/**
 * Storage Utilities
 * Quản lý prefix cho localStorage keys để không hardcode tên cửa hàng
 */

/**
 * Lấy prefix cho localStorage keys
 * Có thể cấu hình qua env variable NEXT_PUBLIC_STORAGE_PREFIX
 * Nếu không có, mặc định là 'restaurant-app'
 * @returns {string} Prefix cho localStorage keys
 */
export function getStoragePrefix() {
  if (typeof window === 'undefined') {
    // Server-side: lấy từ env variable
    return process.env.NEXT_PUBLIC_STORAGE_PREFIX || 'restaurant-app';
  }
  
  // Client-side: lấy từ env variable hoặc cached value
  // Có thể mở rộng để fetch từ config API nếu cần
  return process.env.NEXT_PUBLIC_STORAGE_PREFIX || 'restaurant-app';
}

/**
 * Tạo localStorage key với prefix
 * @param {string} key - Key name (ví dụ: 'theme', 'customer', 'cart')
 * @returns {string} Full key với prefix (ví dụ: 'restaurant-app-theme')
 */
export function getStorageKey(key) {
  const prefix = getStoragePrefix();
  return `${prefix}-${key}`;
}

// Export các keys thường dùng
export const STORAGE_KEYS = {
  THEME: 'theme',
  CUSTOMER: 'customer',
  USER: 'user',
  CART: 'cart',
};

