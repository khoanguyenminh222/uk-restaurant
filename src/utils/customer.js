/**
 * Customer Info Utilities
 * Lưu thông tin khách hàng vào localStorage để auto-fill form đặt món
 */

import { getStorageKey, STORAGE_KEYS } from './storage';

const CUSTOMER_STORAGE_KEY = getStorageKey(STORAGE_KEYS.CUSTOMER);

/**
 * Lấy thông tin khách hàng từ localStorage
 */
export function getCustomerInfo() {
  if (typeof window === 'undefined') return null;
  
  try {
    const customer = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    return customer ? JSON.parse(customer) : null;
  } catch (error) {
    console.error('Error getting customer info:', error);
    return null;
  }
}

/**
 * Lưu thông tin khách hàng vào localStorage
 */
export function saveCustomerInfo(customer) {
  if (typeof window === 'undefined') return;
  
  try {
    if (customer) {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
    } else {
      localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error saving customer info:', error);
  }
}

/**
 * Xóa thông tin khách hàng khỏi localStorage
 */
export function clearCustomerInfo() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing customer info:', error);
  }
}

