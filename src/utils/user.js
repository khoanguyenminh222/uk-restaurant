/**
 * User Utilities
 * Quản lý thông tin user với localStorage (optional login)
 */

import { getStorageKey, STORAGE_KEYS } from './storage';
import { clearCustomerInfo } from './customer';
import { clearAdminSession } from '@/lib/adminAuth';

const USER_STORAGE_KEY = getStorageKey(STORAGE_KEYS.USER);

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
 * Cũng xóa customer info và verified emails
 */
export function clearUser() {
  saveUser(null);

  // Xóa customer info
  if (typeof window !== 'undefined') {
    try {
      clearCustomerInfo();
    } catch (error) {
      console.error('Error clearing customer info:', error);
    }

    // Xóa verified emails
    try {
      localStorage.removeItem('verified_emails');
      localStorage.removeItem('user_token'); // Ensure token is removed
    } catch (error) {
      console.error('Error clearing verified emails/token:', error);
    }
  }

  // Clear admin session as well
  clearAdminSession();
}

/**
 * Kiểm tra user đã đăng nhập chưa
 */
export function isLoggedIn() {
  return getUser() !== null;
}

