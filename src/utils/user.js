/**
 * User Utilities
 * Quản lý thông tin user với localStorage (optional login)
 */

const USER_STORAGE_KEY = 'uk-restaurant-user';

/**
 * Lấy thông tin user từ localStorage
 */
export function getUser() {
  if (typeof window === 'undefined') return null;
  
  try {
    const user = localStorage.getItem(USER_STORAGE_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Lưu thông tin user vào localStorage
 */
export function saveUser(user) {
  if (typeof window === 'undefined') return;
  
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('userUpdated'));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('userUpdated'));
    }
  } catch (error) {
    console.error('Error saving user:', error);
  }
}

/**
 * Xóa thông tin user (logout)
 */
export function clearUser() {
  saveUser(null);
}

/**
 * Kiểm tra user đã đăng nhập chưa
 */
export function isLoggedIn() {
  return getUser() !== null;
}

