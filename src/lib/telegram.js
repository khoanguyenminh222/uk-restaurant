/**
 * Telegram Bot Utility
 * Gửi thông báo đến Telegram group/channel
 */

/**
 * Lấy Telegram config từ database hoặc environment variables
 * @returns {Promise<object>} Telegram config object
 */
async function getTelegramConfig() {
  try {
    const { getTelegramConfig: getTelegramConfigFromDB } = await import('@/lib/restaurantConfig');
    const telegramConfig = await getTelegramConfigFromDB();

    // Ưu tiên database, fallback về env
    return {
      enabled: telegramConfig?.enabled !== false, // Default: true
      bot_token: telegramConfig?.bot_token || process.env.TELEGRAM_BOT_TOKEN || '',
      chat_id: telegramConfig?.chat_id || process.env.TELEGRAM_CHAT_ID || '',
    };
  } catch (error) {
    console.error('Error getting Telegram config:', error);
    // Fallback về env
    return {
      enabled: process.env.TELEGRAM_ENABLED !== 'false',
      bot_token: process.env.TELEGRAM_BOT_TOKEN || '',
      chat_id: process.env.TELEGRAM_CHAT_ID || '',
    };
  }
}

/**
 * Gửi tin nhắn đến Telegram
 * @param {string} message - Nội dung tin nhắn
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendTelegramNotification(message) {
  try {
    const config = await getTelegramConfig();

    // Kiểm tra có bật Telegram không
    if (!config.enabled) {
      //console.log('[Telegram] Notifications are disabled');
      return { success: false, error: 'Telegram notifications are disabled' };
    }

    // Kiểm tra có token và chat_id không
    if (!config.bot_token || !config.chat_id) {
      //console.log('[Telegram] Missing bot_token or chat_id');
      return { success: false, error: 'Telegram bot_token or chat_id is missing' };
    }

    // Gửi tin nhắn đến Telegram
    const url = `https://api.telegram.org/bot${config.bot_token}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.chat_id,
        text: message,
        parse_mode: 'HTML', // Sử dụng HTML để format text
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      const errorMsg = data.description || 'Failed to send Telegram message';
      console.error('[Telegram] Error sending message:', errorMsg);
      return { success: false, error: errorMsg };
    }

    //console.log('[Telegram] Message sent successfully:', data.result.message_id);
    return { success: true, messageId: data.result.message_id };
  } catch (error) {
    console.error('[Telegram] Error sending notification:', error);
    // Không throw error để không crash app
    return { success: false, error: error.message || 'Failed to send Telegram notification' };
  }
}

/**
 * Format message cho đơn hàng mới
 * @param {object} order - Order object từ database
 * @returns {string} Formatted message
 */
export function formatNewOrderMessage(order) {
  const orderId = order.order_id || 'N/A';
  const customerName = order.customer_name || 'N/A';
  const customerPhone = order.customer_phone || 'N/A';
  const customerAddress = order.customer_address || 'Tại quán';

  // Format danh sách món
  let itemsText = '';
  if (order.items && Array.isArray(order.items) && order.items.length > 0) {
    // Đơn nhiều món
    itemsText = order.items.map(item => {
      const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price || 0);
      const total = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.price || 0) * (item.quantity || 1));
      return `• <b>${item.name || 'N/A'}</b> x${item.quantity || 1} - ${total}`;
    }).join('\n');
  } else {
    itemsText = '• Không có thông tin sản phẩm';
  }

  const totalPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_price || 0);

  // Format thời gian
  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    : new Date().toLocaleString('vi-VN');

  // Format admin panel URL (nếu có)
  const adminUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders?order_id=${orderId}`
    : '';

  // Format ghi chú từ khách hàng (nếu có)
  const notesText = order.notes && order.notes.trim()
    ? `\n<b>Ghi chú:</b> ${order.notes.trim()}`
    : '';

  const message = `📌 [<b>Mới</b>]

<b>Mã đơn:</b> <code>${orderId}</code>
<b>Khách hàng:</b> ${customerName}
<b>SĐT:</b> <a href="tel:${customerPhone}">${customerPhone}</a>
<b>Địa chỉ:</b> ${customerAddress}

🍽️ <b>Đơn hàng:</b>
${itemsText}

💰 <b>Tổng tiền:</b> <b>${totalPrice}</b>${notesText}
⏰ <b>Thời gian:</b> ${orderDate}${adminUrl ? `\n\n🔗 <a href="${adminUrl}">Xem chi tiết</a>` : ''}`;

  return message;
}

/**
 * Format message cho đơn bị hủy
 * @param {object} order - Order object từ database
 * @param {string} cancelledBy - Người hủy: 'customer' hoặc tên admin
 * @param {string} reason - Lý do hủy (optional)
 * @param {object} adminInfo - Thông tin admin (optional) - chỉ dùng khi cancelledBy là admin
 * @returns {string} Formatted message
 */
export function formatCancelledOrderMessage(order, cancelledBy = 'admin', reason = '', adminInfo = null) {
  const orderId = order.order_id || 'N/A';
  const customerName = order.customer_name || 'N/A';
  const customerPhone = order.customer_phone || 'N/A';
  const totalPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_price || 0);

  // Format thời gian
  const cancelledDate = new Date().toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Xác định người hủy và hiển thị thông tin
  let cancelledByText = '';
  if (cancelledBy === 'customer') {
    cancelledByText = 'Khách hàng';
  } else {
    // Nếu là admin/manager/super_admin, hiển thị tên và role nếu có
    if (adminInfo && adminInfo.name) {
      // Xác định role label
      let roleLabel = 'Admin';
      if (adminInfo.role === 'super_admin') {
        roleLabel = 'Super Admin';
      } else if (adminInfo.role === 'manager') {
        roleLabel = 'Manager';
      } else if (adminInfo.role === 'admin') {
        roleLabel = 'Admin';
      }

      cancelledByText = `${roleLabel}: ${adminInfo.name}`;
      if (adminInfo.phone) {
        cancelledByText += ` (${adminInfo.phone})`;
      }
    } else if (cancelledBy && cancelledBy !== 'admin' && cancelledBy !== 'manager' && cancelledBy !== 'super_admin') {
      // Nếu cancelledBy là tên (không phải role string)
      cancelledByText = `Admin: ${cancelledBy}`;
    } else {
      // Fallback: hiển thị role
      if (cancelledBy === 'super_admin') {
        cancelledByText = 'Super Admin';
      } else if (cancelledBy === 'manager') {
        cancelledByText = 'Manager';
      } else {
        cancelledByText = 'Admin';
      }
    }
  }

  const message = `❌ [<b>HỦY</b>]

<b>Mã đơn:</b> <code>${orderId}</code>
<b>Khách hàng:</b> ${customerName}
<b>SĐT:</b> <a href="tel:${customerPhone}">${customerPhone}</a>
💰 <b>Tổng tiền:</b> ${totalPrice}
⏰ <b>Thời gian hủy:</b> ${cancelledDate}
<b>Người hủy:</b> ${cancelledByText}${reason ? `\n📝 <b>Lý do:</b> ${reason}` : ''}`;

  return message;
}

/**
 * Gửi thông báo đơn hàng mới đến Telegram
 * @param {object} order - Order object từ database
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendNewOrderNotification(order) {
  try {
    const message = formatNewOrderMessage(order);
    return await sendTelegramNotification(message);
  } catch (error) {
    console.error('[Telegram] Error sending new order notification:', error);
    return { success: false, error: error.message || 'Failed to send new order notification' };
  }
}

/**
 * Gửi thông báo đơn hàng bị hủy đến Telegram
 * @param {object} order - Order object từ database
 * @param {string} cancelledBy - Người hủy: 'customer' hoặc tên admin
 * @param {string} reason - Lý do hủy (optional)
 * @param {object} adminInfo - Thông tin admin (optional) - chỉ dùng khi cancelledBy là admin
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendCancelledOrderNotification(order, cancelledBy = 'admin', reason = '', adminInfo = null) {
  try {
    const message = formatCancelledOrderMessage(order, cancelledBy, reason, adminInfo);
    return await sendTelegramNotification(message);
  } catch (error) {
    console.error('[Telegram] Error sending cancelled order notification:', error);
    return { success: false, error: error.message || 'Failed to send cancelled order notification' };
  }
}

/**
 * Gửi tin nhắn test đến Telegram
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendTestTelegramMessage() {
  try {
    const testMessage = `🧪 <b>THÔNG BÁO THỬ NGHIỆM</b>

✅ Hệ thống Telegram của bạn đã được cấu hình thành công!

⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })}

Bạn sẽ nhận được thông báo khi có đơn hàng mới hoặc đơn hàng bị hủy.`;

    return await sendTelegramNotification(testMessage);
  } catch (error) {
    console.error('[Telegram] Error sending test message:', error);
    return { success: false, error: error.message || 'Failed to send test message' };
  }
}

/**
 * Format message cho đơn hàng bị xóa
 * @param {object} order - Order object từ database
 * @param {string} deletedBy - Người xóa
 * @param {object} adminInfo - Thông tin admin (optional)
 * @returns {string} Formatted message
 */
export function formatDeletedOrderMessage(order, deletedBy = 'admin', adminInfo = null) {
  const orderId = order.order_id || 'N/A';
  const customerName = order.customer_name || 'N/A';
  const customerPhone = order.customer_phone || 'N/A';
  const totalPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_price || 0);

  // Format thời gian
  const deletedDate = new Date().toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Xác định người xóa
  let deletedByText = '';
  if (adminInfo && adminInfo.name) {
    let roleLabel = 'Admin';
    if (adminInfo.role === 'super_admin') roleLabel = 'Super Admin';
    else if (adminInfo.role === 'manager') roleLabel = 'Manager';

    deletedByText = `${roleLabel}: ${adminInfo.name}`;
    if (adminInfo.phone) deletedByText += ` (${adminInfo.phone})`;
  } else {
    deletedByText = deletedBy || 'Admin';
  }

  const message = `🗑️ [<b>XÓA</b>]

<b>Mã đơn:</b> <code>${orderId}</code>
<b>Khách hàng:</b> ${customerName}
<b>SĐT:</b> <a href="tel:${customerPhone}">${customerPhone}</a>
💰 <b>Tổng tiền:</b> ${totalPrice}
⏰ <b>Thời gian xóa:</b> ${deletedDate}
<b>Người thực hiện:</b> ${deletedByText}`;

  return message;
}

/**
 * Gửi thông báo đơn hàng bị xóa đến Telegram
 * @param {object} order - Order object từ database
 * @param {string} deletedBy - Người xóa
 * @param {object} adminInfo - Thông tin admin (optional)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendDeletedOrderNotification(order, deletedBy = 'admin', adminInfo = null) {
  try {
    const message = formatDeletedOrderMessage(order, deletedBy, adminInfo);
    return await sendTelegramNotification(message);
  } catch (error) {
    console.error('[Telegram] Error sending deleted order notification:', error);
    return { success: false, error: error.message || 'Failed to send deleted order notification' };
  }
}

/**
 * Format message cho tin nhắn liên hệ mới
 * @param {object} data - Dữ liệu từ form liên hệ
 * @returns {string} Formatted message
 */
export function formatContactMessage(data) {
  const name = data.name || 'N/A';
  const email = data.email || 'N/A';
  const phone = data.phone || 'N/A';
  const subject = data.subject || 'Không có chủ đề';
  const messageContent = data.message || 'Không có nội dung';

  // Format thời gian
  const date = new Date().toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const message = `📧 [<b>TIN NHẮN LIÊN HỆ</b>]

<b>Khách hàng:</b> ${name}
<b>Email:</b> ${email}
<b>SĐT:</b> <a href="tel:${phone.replace(/[^0-9]/g, '')}">${phone}</a>
<b>Chủ đề:</b> ${subject}

📝 <b>Nội dung:</b>
${messageContent}

⏰ <b>Thời gian:</b> ${date}`;

  return message;
}

/**
 * Gửi thông báo tin nhắn liên hệ mới đến Telegram
 * @param {object} data - Dữ liệu từ form liên hệ
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendContactNotification(data) {
  try {
    const message = formatContactMessage(data);
    return await sendTelegramNotification(message);
  } catch (error) {
    console.error('[Telegram] Error sending contact notification:', error);
    return { success: false, error: error.message || 'Failed to send contact notification' };
  }
}

/**
 * Format message cho đánh giá mới từ khách hàng
 * @param {object} review - Review object vừa được tạo
 * @returns {string} Formatted message
 */
export function formatNewReviewMessage(review) {
  const customerName = review.customer_name || 'Khách hàng';
  const rating = review.rating || 0;
  const comment = review.comment?.trim() || 'Không có bình luận';
  const customerPhone = review.customer_phone?.trim() || '';
  const customerEmail = review.customer_email?.trim() || '';
  const orderId = review.order_id?.trim() || '';

  // Stars display
  const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

  // Format date
  const date = new Date().toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Admin reviews URL
  const adminUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/admin/reviews`
    : '';

  // Optional fields
  const phoneText = customerPhone ? `\n<b>SĐT:</b> <a href="tel:${customerPhone}">${customerPhone}</a>` : '';
  const emailText = customerEmail ? `\n<b>Email:</b> ${customerEmail}` : '';
  const orderText = orderId ? `\n<b>Mã đơn:</b> <code>${orderId}</code>` : '';

  const message = `⭐ [<b>ĐÁNH GIÁ MỚI</b>]

<b>Khách hàng:</b> ${customerName}${phoneText}${emailText}${orderText}

${stars} <b>${rating}/5</b>

💬 <b>Bình luận:</b>
${comment}

⏰ <b>Thời gian:</b> ${date}
⚠️ Đánh giá cần được duyệt trước khi hiển thị.${adminUrl ? `\n\n🔗 <a href="${adminUrl}">Xem & duyệt đánh giá</a>` : ''}`;

  return message;
}

/**
 * Gửi thông báo đánh giá mới đến Telegram
 * @param {object} review - Review object vừa được tạo
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendNewReviewNotification(review) {
  try {
    const message = formatNewReviewMessage(review);
    return await sendTelegramNotification(message);
  } catch (error) {
    console.error('[Telegram] Error sending new review notification:', error);
    return { success: false, error: error.message || 'Failed to send new review notification' };
  }
}
