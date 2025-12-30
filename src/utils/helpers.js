/**
 * Helper Utilities
 */

/**
 * Format số tiền thành định dạng VNĐ
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Smooth scroll to element
 */
export function scrollToElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  // Format: 0xxx xxx xxx
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  return phone;
}

