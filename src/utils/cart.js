/**
 * Cart Utilities
 * Quản lý giỏ hàng với localStorage
 */

import { getStorageKey, STORAGE_KEYS } from './storage';

const CART_STORAGE_KEY = getStorageKey(STORAGE_KEYS.CART);

/**
 * Lấy giỏ hàng từ localStorage
 */
export function getCart() {
  if (typeof window === 'undefined') return [];
  
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error getting cart:', error);
    return [];
  }
}

/**
 * Lưu giỏ hàng vào localStorage
 */
export function saveCart(cart) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    // Dispatch event để các component khác có thể lắng nghe
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
}

/**
 * Thêm món vào giỏ hàng
 */
export function addToCart(item) {
  const cart = getCart();
  const existingItemIndex = cart.findIndex(
    (cartItem) => cartItem.id === item.id
  );

  if (existingItemIndex >= 0) {
    // Tăng số lượng nếu đã có
    cart[existingItemIndex].quantity += item.quantity || 1;
  } else {
    // Thêm mới
    cart.push({
      ...item,
      quantity: item.quantity || 1,
    });
  }

  saveCart(cart);
  return cart;
}

/**
 * Cập nhật số lượng món trong giỏ
 */
export function updateCartItem(itemId, quantity) {
  const cart = getCart();
  const itemIndex = cart.findIndex((item) => item.id === itemId);

  if (itemIndex >= 0) {
    if (quantity <= 0) {
      // Xóa nếu số lượng <= 0
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = quantity;
    }
    saveCart(cart);
  }

  return cart;
}

/**
 * Xóa món khỏi giỏ hàng
 */
export function removeFromCart(itemId) {
  const cart = getCart();
  const filteredCart = cart.filter((item) => item.id !== itemId);
  saveCart(filteredCart);
  return filteredCart;
}

/**
 * Xóa toàn bộ giỏ hàng
 */
export function clearCart() {
  saveCart([]);
  return [];
}

/**
 * Tính tổng số lượng món trong giỏ
 */
export function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.quantity || 0), 0);
}

/**
 * Tính tổng tiền giỏ hàng
 */
export function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => {
    return total + (item.price || 0) * (item.quantity || 0);
  }, 0);
}

