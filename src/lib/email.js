/**
 * Email Utility
 * Gửi email verification và reset password
 */

import nodemailer from 'nodemailer';
import { getRestaurantName, getSlogan, getEmailConfig } from '@/lib/restaurantConfig';

/**
 * Tạo transporter cho nodemailer
 * Sử dụng Gmail SMTP hoặc environment variables
 */
async function createTransporter() {
  // Lấy email config từ database
  const emailConfig = await getEmailConfig();
  
  // Ưu tiên database, fallback về env nếu database không có giá trị
  const senderEmail = emailConfig?.sender_email || process.env.EMAIL_USER;
  const senderPassword = emailConfig?.sender_password || process.env.EMAIL_PASSWORD;
  
  if (!senderEmail || !senderPassword) {
    const missingFields = [];
    if (!senderEmail) missingFields.push('sender_email');
    if (!senderPassword) missingFields.push('sender_password');
    
    throw new Error(
      `Email configuration is missing: ${missingFields.join(', ')}. ` +
      `Please configure email settings in Admin > Notification Config or set environment variables (EMAIL_USER, EMAIL_PASSWORD).`
    );
  }
  
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: senderEmail,
      pass: senderPassword,
    },
  });

  return transporter;
}

/**
 * Gửi email verification code cho đặt hàng (không cần name)
 * @param {string} email - Email address
 * @param {string} code - Verification code
 * @param {string|null} name - User name (optional)
 * @param {number} expiresInMinutes - Thời gian hết hạn (phút), mặc định 10 phút
 */
export async function sendVerificationEmail(email, code, name = null, expiresInMinutes = 10) {
  try {
    const transporter = await createTransporter();
    const restaurantName = await getRestaurantName();
    const slogan = await getSlogan();

    const mailOptions = {
      from: `"${restaurantName}" <${(await getEmailConfig()).sender_email}>`,
      to: email,
      subject: `Xác thực email - ${restaurantName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #16a34a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">${restaurantName}</h1>
            <p style="color: #e5e7eb; margin: 5px 0 0 0;">${slogan}</p>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Xác thực email của bạn</h2>
            ${name ? `<p style="color: #4b5563; line-height: 1.6;">
              Xin chào <strong>${name}</strong>,
            </p>` : ''}
            <p style="color: #4b5563; line-height: 1.6;">
              ${name ? `Cảm ơn bạn đã đăng ký tài khoản tại ${restaurantName}. Vui lòng sử dụng mã xác thực sau để hoàn tất đăng ký:` : `Cảm ơn bạn đã đặt hàng tại ${restaurantName}. Vui lòng sử dụng mã xác thực sau để xác nhận email của bạn:`}
            </p>
            <div style="background-color: #f3f4f6; border: 2px dashed #16a34a; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Mã xác thực của bạn:</p>
              <h1 style="color: #16a34a; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                ${code}
              </h1>
            </div>
            <p style="color: #4b5563; line-height: 1.6;">
              Mã này sẽ hết hạn sau <strong>${expiresInMinutes} phút</strong>. Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
            </p>
            <p style="color: #4b5563; line-height: 1.6; margin-top: 30px;">
              Trân trọng,<br>
              <strong>Đội ngũ ${restaurantName}</strong>
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      `,
      text: `
        Xác thực email - ${restaurantName}
        
        ${name ? `Xin chào ${name},` : ''}
        
        ${name ? `Cảm ơn bạn đã đăng ký tài khoản tại ${restaurantName}.` : `Cảm ơn bạn đã đặt hàng tại ${restaurantName}.`}
        Mã xác thực của bạn là: ${code}
        
        Mã này sẽ hết hạn sau ${expiresInMinutes} phút.
        
        Trân trọng,
        Đội ngũ ${restaurantName}
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Gửi email reset password
 * @param {string} email - Email address
 * @param {string} name - User name
 * @param {string} resetToken - Reset password token
 * @param {number} expiresInMinutes - Thời gian hết hạn (phút), mặc định 30 phút
 */
export async function sendResetPasswordEmail(email, name, resetToken, expiresInMinutes = 30) {
  try {
    const transporter = await createTransporter();
    const restaurantName = await getRestaurantName();
    const slogan = await getSlogan();
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"${restaurantName}" <${(await getEmailConfig()).sender_email}>`,
      to: email,
      subject: `Đặt lại mật khẩu - ${restaurantName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #16a34a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">${restaurantName}</h1>
            <p style="color: #e5e7eb; margin: 5px 0 0 0;">${slogan}</p>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Đặt lại mật khẩu</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Xin chào <strong>${name}</strong>,
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
              Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng click vào nút bên dưới để đặt lại mật khẩu:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Đặt lại mật khẩu
              </a>
            </div>
            <p style="color: #4b5563; line-height: 1.6; font-size: 14px;">
              Hoặc copy link sau vào trình duyệt:<br>
              <a href="${resetUrl}" style="color: #16a34a; word-break: break-all;">${resetUrl}</a>
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
              Link này sẽ hết hạn sau <strong>${expiresInMinutes} phút</strong>. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
            </p>
            <p style="color: #4b5563; line-height: 1.6; margin-top: 30px;">
              Trân trọng,<br>
              <strong>Đội ngũ ${restaurantName}</strong>
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      `,
      text: `
        Đặt lại mật khẩu - ${restaurantName}
        
        Xin chào ${name},
        
        Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng truy cập link sau:
        ${resetUrl}
        
        Link này sẽ hết hạn sau ${expiresInMinutes} phút.
        
        Trân trọng,
        Đội ngũ ${restaurantName}
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Reset password email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending reset password email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Gửi email xác nhận đơn hàng
 */
export async function sendOrderConfirmationEmail(email, name, orderId, trackOrderUrl, orderData) {
  try {
    const transporter = await createTransporter();
    const restaurantName = await getRestaurantName();
    const slogan = await getSlogan();

    // Format order items
    let itemsHtml = '';
    let itemsText = '';
    
    if (orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
      itemsHtml = orderData.items.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}</td>
        </tr>
      `).join('');
      
      itemsText = orderData.items.map(item => 
        `- ${item.name} (x${item.quantity}): ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}`
      ).join('\n');
    }

    const totalPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderData.total_price || 0);
    const orderDate = orderData.created_at 
      ? new Date(orderData.created_at).toLocaleString('vi-VN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : new Date().toLocaleString('vi-VN');

    const mailOptions = {
      from: `"${restaurantName}" <${(await getEmailConfig()).sender_email}>`,
      to: email,
      subject: `Xác nhận đơn hàng #${orderId} - ${restaurantName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #16a34a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">${restaurantName}</h1>
            <p style="color: #e5e7eb; margin: 5px 0 0 0;">${slogan}</p>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Cảm ơn bạn đã đặt hàng!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Xin chào <strong>${name}</strong>,
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
              Đơn hàng của bạn đã được tiếp nhận và đang được xử lý. Dưới đây là thông tin chi tiết:
            </p>
            
            <!-- Order ID -->
            <div style="background-color: #f3f4f6; border: 2px dashed #16a34a; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Mã đơn hàng của bạn:</p>
              <h1 style="color: #16a34a; font-size: 28px; letter-spacing: 2px; margin: 0; font-family: 'Courier New', monospace;">
                ${orderId}
              </h1>
            </div>

            <!-- Order Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1f2937; margin-bottom: 15px; font-size: 18px;">Thông tin đơn hàng</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #374151;">Sản phẩm</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb; color: #374151;">SL</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #374151;">Đơn giá</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #374151;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 15px 10px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb; color: #374151;">Tổng tiền:</td>
                    <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #16a34a; border-top: 2px solid #e5e7eb;">${totalPrice}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Customer Info -->
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #4b5563;"><strong>Ngày đặt:</strong> ${orderDate}</p>
              <p style="margin: 5px 0; color: #4b5563;"><strong>Địa chỉ giao hàng:</strong> ${orderData.customer_address || 'Tại quán'}</p>
              ${orderData.notes ? `<p style="margin: 5px 0; color: #4b5563;"><strong>Ghi chú:</strong> ${orderData.notes}</p>` : ''}
            </div>

            <!-- Track Order Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${trackOrderUrl}" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Theo dõi đơn hàng
              </a>
            </div>
            <p style="color: #4b5563; line-height: 1.6; font-size: 14px; text-align: center;">
              Hoặc copy link sau vào trình duyệt:<br>
              <a href="${trackOrderUrl}" style="color: #16a34a; word-break: break-all;">${trackOrderUrl}</a>
            </p>

            <p style="color: #4b5563; line-height: 1.6; margin-top: 30px;">
              Chúng tôi sẽ thông báo cho bạn khi đơn hàng được xác nhận và giao hàng. Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.
            </p>
            <p style="color: #4b5563; line-height: 1.6; margin-top: 30px;">
              Trân trọng,<br>
              <strong>Đội ngũ ${restaurantName}</strong>
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      `,
      text: `
        Xác nhận đơn hàng - ${restaurantName}
        
        Xin chào ${name},
        
        Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
        
        Mã đơn hàng: ${orderId}
        
        Chi tiết đơn hàng:
        ${itemsText}
        
        Tổng tiền: ${totalPrice}
        
        Ngày đặt: ${orderDate}
        Địa chỉ giao hàng: ${orderData.customer_address || 'Tại quán'}
        ${orderData.notes ? `Ghi chú: ${orderData.notes}` : ''}
        
        Theo dõi đơn hàng tại: ${trackOrderUrl}
        
        Chúng tôi sẽ thông báo cho bạn khi đơn hàng được xác nhận và giao hàng.
        
        Trân trọng,
        Đội ngũ ${restaurantName}
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Gửi email thử nghiệm để kiểm tra cấu hình
 * @param {string} email - Email address người nhận
 */
export async function sendTestEmail(email) {
  try {
    const transporter = await createTransporter();
    const restaurantName = await getRestaurantName();
    const slogan = await getSlogan();
    const emailConfig = await getEmailConfig();

    const mailOptions = {
      from: `"${restaurantName}" <${emailConfig.sender_email}>`,
      to: email,
      subject: `Email thử nghiệm - ${restaurantName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #16a34a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">${restaurantName}</h1>
            <p style="color: #e5e7eb; margin: 5px 0 0 0;">${slogan}</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #16a34a; margin-top: 0;">✅ Email thử nghiệm thành công!</h2>
            
            <p style="color: #374151; line-height: 1.6;">
              Xin chúc mừng! Hệ thống email của bạn đã được cấu hình thành công.
            </p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #16a34a; margin-top: 0; font-size: 16px;">Thông tin cấu hình:</h3>
              <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
                <li>Email gửi: <strong>${emailConfig.sender_email}</strong></li>
                <li>Tên người gửi: <strong>${restaurantName}</strong></li>
                <li>Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</li>
              </ul>
            </div>
            
            <p style="color: #374151; line-height: 1.6;">
              Email này được gửi từ hệ thống quản lý ${restaurantName}. Bạn có thể sử dụng cấu hình này để gửi các email sau:
            </p>
            
            <ul style="color: #6b7280; line-height: 1.6;">
              <li>Xác thực email đặt hàng</li>
              <li>Đặt lại mật khẩu</li>
              <li>Xác nhận đơn hàng</li>
              <li>Các thông báo khác từ hệ thống</li>
            </ul>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              Đây là email tự động từ hệ thống ${restaurantName}. Vui lòng không trả lời email này.
            </p>
          </div>
        </div>
      `,
      text: `
        ${restaurantName}
        ${slogan}
        
        ✅ Email thử nghiệm thành công!
        
        Xin chúc mừng! Hệ thống email của bạn đã được cấu hình thành công.
        
        Thông tin cấu hình:
        - Email gửi: ${emailConfig.sender_email}
        - Tên người gửi: ${restaurantName}
        - Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
        
        Email này được gửi từ hệ thống quản lý ${restaurantName}. Bạn có thể sử dụng cấu hình này để gửi các email sau:
        - Xác thực email đặt hàng
        - Đặt lại mật khẩu
        - Xác nhận đơn hàng
        - Các thông báo khác từ hệ thống
        
        Đây là email tự động từ hệ thống ${restaurantName}. Vui lòng không trả lời email này.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending test email:', error);
    throw new Error(error.message || 'Không thể gửi email thử nghiệm');
  }
}

/**
 * Format order items cho email
 * @param {object|array} items - Order items
 * @returns {object} {html, text}
 */
function formatOrderItemsForEmail(items) {
  let itemsHtml = '';
  let itemsText = '';
  
  if (!items) {
    return { html: '<p style="color: #6b7280;">Không có sản phẩm nào.</p>', text: 'Không có sản phẩm nào.' };
  }
  
  let itemsArray = [];
  if (Array.isArray(items)) {
    itemsArray = items;
  } else if (typeof items === 'object' && items.name) {
    itemsArray = [items];
  }
  
  if (itemsArray.length === 0) {
    return { html: '<p style="color: #6b7280;">Không có sản phẩm nào.</p>', text: 'Không có sản phẩm nào.' };
  }
  
  itemsHtml = itemsArray.map(item => {
    const quantity = item.quantity || 1;
    const price = item.price || 0;
    const totalItemPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price * quantity);
    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${totalItemPrice}</td>
      </tr>
    `;
  }).join('');
  
  itemsText = itemsArray.map(item => {
    const quantity = item.quantity || 1;
    const price = item.price || 0;
    const totalItemPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price * quantity);
    return `- ${item.name} (x${quantity}): ${totalItemPrice}`;
  }).join('\n');
  
  return { html: itemsHtml, text: itemsText };
}

/**
 * Status config với màu sắc & tên file icon PNG (tương ứng với STATUS_CONFIG trong admin)
 * Ảnh PNG đặt trong thư mục public:
 *  - public/clock.png (pending)
 *  - public/circle-check.png (confirmed)
 *  - public/package.png (preparing)
 *  - public/circle-check-big.png (ready)
 *  - public/truck.png (delivered)
 *  - public/circle-check.png (completed)
 *  - public/circle-x.png (cancelled)
 */
const STATUS_EMAIL_CONFIG = {
  pending: {
    label: 'Chờ xử lý',
    color: '#eab308', // yellow-500
    bgColor: '#fef9c3', // yellow-100
    iconName: 'clock',
  },
  confirmed: {
    label: 'Đã xác nhận',
    color: '#3b82f6', // blue-500
    bgColor: '#dbeafe', // blue-100
    iconName: 'circle-check',
  },
  preparing: {
    label: 'Đang chuẩn bị',
    color: '#f97316', // orange-500
    bgColor: '#fed7aa', // orange-100
    iconName: 'package',
  },
  ready: {
    label: 'Sẵn sàng',
    color: '#22c55e', // green-500
    bgColor: '#dcfce7', // green-100
    iconName: 'circle-check-big',
  },
  delivered: {
    label: 'Đã giao',
    color: '#10b981', // emerald-500
    bgColor: '#d1fae5', // emerald-100
    iconName: 'truck',
  },
  completed: {
    label: 'Hoàn thành',
    color: '#16a34a', // green-600
    bgColor: '#dcfce7', // green-100
    iconName: 'circle-check',
  },
  cancelled: {
    label: 'Đã hủy',
    color: '#ef4444', // red-500
    bgColor: '#fee2e2', // red-100
    iconName: 'circle-x',
  },
};

/**
 * Lấy subject và nội dung email theo status
 * @param {string} status - Order status
 * @param {string} orderId - Order ID
 * @param {string} restaurantName - Restaurant name
 * @returns {object} {subject, title, message, color, iconUrl, bgColor}
 */
function getStatusEmailContent(status, orderId, restaurantName) {
  const config = STATUS_EMAIL_CONFIG[status];
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    '';
  const iconUrl =
    baseUrl && config?.iconName
      ? `${baseUrl}/email-status/${config.iconName}.png`
      : '';
  
  if (!config) {
    return {
      subject: `Cập nhật đơn hàng #${orderId} - ${restaurantName}`,
      title: 'Cập nhật đơn hàng',
      message: 'Trạng thái đơn hàng của bạn đã được cập nhật.',
      color: '#6b7280',
      bgColor: '#f3f4f6',
      iconUrl: '',
      label: 'Cập nhật đơn hàng',
    };
  }
  
  const statusMessages = {
    confirmed: {
      subject: `Đơn hàng #${orderId} đã được xác nhận - ${restaurantName}`,
      title: 'Đơn hàng đã được xác nhận!',
      message: 'Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.',
    },
    preparing: {
      subject: `Đơn hàng #${orderId} đang được chuẩn bị - ${restaurantName}`,
      title: 'Đơn hàng đang được chuẩn bị!',
      message: 'Đơn hàng của bạn đang được chuẩn bị. Chúng tôi sẽ thông báo khi đơn hàng sẵn sàng.',
    },
    ready: {
      subject: `Đơn hàng #${orderId} đã sẵn sàng - ${restaurantName}`,
      title: 'Đơn hàng đã sẵn sàng!',
      message: 'Đơn hàng của bạn đã sẵn sàng. Vui lòng đến nhận hàng hoặc đợi shipper giao hàng.',
    },
    delivered: {
      subject: `Đơn hàng #${orderId} đã được giao - ${restaurantName}`,
      title: 'Đơn hàng đã được giao!',
      message: 'Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!',
    },
    completed: {
      subject: `Cảm ơn bạn đã đặt hàng tại ${restaurantName}`,
      title: 'Cảm ơn bạn đã đặt hàng!',
      message: 'Đơn hàng của bạn đã hoàn thành. Chúng tôi rất vui được phục vụ bạn và mong được gặp lại bạn lần sau!',
    },
    cancelled: {
      subject: `Đơn hàng #${orderId} đã bị hủy - ${restaurantName}`,
      title: 'Đơn hàng đã bị hủy',
      message: 'Rất tiếc, đơn hàng của bạn đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.',
    },
    pending: {
      subject: `Đơn hàng #${orderId} đang chờ xử lý - ${restaurantName}`,
      title: 'Đơn hàng đang chờ xử lý',
      message: 'Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý.',
    },
  };
  
  const message = statusMessages[status] || statusMessages.pending;
  
  return {
    ...message,
    color: config.color,
    bgColor: config.bgColor,
    iconUrl,
    label: config.label,
  };
}

/**
 * Gửi email thông báo trạng thái đơn hàng
 * @param {object} order - Order object từ database
 * @param {string} newStatus - Status mới
 * @param {string} previousStatus - Status cũ (optional)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendOrderStatusEmail(order, newStatus, previousStatus = null) {
  try {
    // Lấy email config một lần
    const emailConfig = await getEmailConfig();
    
    // Kiểm tra xem có được phép gửi email cho status này không
    const emailNotifications = emailConfig.email_notifications || {};
    
    // Mặc định chỉ gửi cho confirmed, cancelled, delivered nếu không có config
    const defaultEnabled = {
      confirmed: true,
      cancelled: true,
      delivered: true,
    };
    
    const isEnabled = emailNotifications[newStatus] !== undefined 
      ? emailNotifications[newStatus] 
      : (defaultEnabled[newStatus] || false);
    
    if (!isEnabled) {
      console.log(`[Email] Email notification for status "${newStatus}" is disabled. Skipping.`);
      return { success: true, message: `Email notification for ${newStatus} is disabled` };
    }
    
    // Lấy email từ order hoặc từ user collection
    let customerEmail = order.customer_email;
    
    // Nếu không có email trong order, thử lấy từ user collection
    if (!customerEmail && order.user_id) {
      try {
        const clientPromise = (await import('@/lib/mongodb')).default;
        const { getDatabaseName } = await import('@/lib/mongodb');
        const client = await clientPromise;
        const db = client.db(getDatabaseName());
        
        const user = await db.collection('users').findOne({ user_id: order.user_id });
        if (user && user.email) {
          customerEmail = user.email;
        }
      } catch (userError) {
        console.error('[Email] Error fetching user email:', userError);
        // Continue without email
      }
    }
    
    // Chỉ gửi email nếu có email của khách hàng
    if (!customerEmail) {
      console.log('[Email] No customer email, skipping status email');
      return { success: true, message: 'No customer email' };
    }
    
    // Không gửi email nếu status không thay đổi
    if (previousStatus && previousStatus === newStatus) {
      console.log('[Email] Status unchanged, skipping email');
      return { success: true, message: 'Status unchanged' };
    }
    
    const transporter = await createTransporter();
    const restaurantName = await getRestaurantName();
    const slogan = await getSlogan();
    
    const orderId = order.order_id || 'N/A';
    const customerName = order.customer_name || 'Khách hàng';
    const statusContent = getStatusEmailContent(newStatus, orderId, restaurantName);
    
    // Format order items
    const { html: itemsHtml, text: itemsText } = formatOrderItemsForEmail(order.items || order);
    const totalPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_price || 0);
    
    // Format thời gian
    const updateDate = new Date().toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    // Track order URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const trackOrderUrl = `${baseUrl}/track-order?order_id=${orderId}`;
    
    // Lý do hủy (nếu có)
    const cancelReason = newStatus === 'cancelled' ? (order.admin_notes || order.notes || '') : '';
    
    const mailOptions = {
      from: `"${restaurantName}" <${emailConfig.sender_email}>`,
      to: customerEmail,
      subject: statusContent.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: ${statusContent.color}; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">${restaurantName}</h1>
            <p style="color: #e5e7eb; margin: 5px 0 0 0;">${slogan}</p>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background-color: ${statusContent.bgColor}; padding: 16px; border-radius: 50%; margin-bottom: 16px;">
                ${
                  statusContent.iconUrl
                    ? `<img src="${statusContent.iconUrl}" alt="${statusContent.label}" width="48" height="48" style="display:block; margin:0 auto;" />`
                    : `<span style="display:inline-flex; align-items:center; justify-content:center; width:48px; height:48px; color:${statusContent.color}; font-size:24px; font-weight:bold;">${(statusContent.label || '✓').charAt(0)}</span>`
                }
              </div>
              <h2 style="color: ${statusContent.color}; margin-top: 0; font-size: 24px; font-weight: bold;">${statusContent.title}</h2>
              <p style="color: #6b7280; margin-top: 8px; font-size: 14px;">${statusContent.label}</p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Xin chào <strong>${customerName}</strong>,
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
              ${statusContent.message}
            </p>
            
            <!-- Order ID -->
            <div style="background-color: #f3f4f6; border: 2px dashed ${statusContent.color}; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Mã đơn hàng:</p>
              <h1 style="color: ${statusContent.color}; font-size: 28px; letter-spacing: 2px; margin: 0; font-family: 'Courier New', monospace;">
                ${orderId}
              </h1>
            </div>
            
            ${newStatus !== 'cancelled' ? `
            <!-- Order Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1f2937; margin-bottom: 15px; font-size: 18px;">Thông tin đơn hàng</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #374151;">Sản phẩm</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb; color: #374151;">SL</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #374151;">Đơn giá</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #374151;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 15px 10px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb; color: #374151;">Tổng tiền:</td>
                    <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px; color: ${statusContent.color}; border-top: 2px solid #e5e7eb;">${totalPrice}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            ` : ''}
            
            ${cancelReason ? `
            <!-- Cancel Reason -->
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b;"><strong>Lý do hủy:</strong> ${cancelReason}</p>
            </div>
            ` : ''}
            
            <!-- Customer Info -->
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #4b5563;"><strong>Thời gian cập nhật:</strong> ${updateDate}</p>
              ${order.customer_address ? `<p style="margin: 5px 0; color: #4b5563;"><strong>Địa chỉ giao hàng:</strong> ${order.customer_address}</p>` : ''}
            </div>
            
            ${newStatus !== 'cancelled' ? `
            <!-- Track Order Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${trackOrderUrl}" style="display: inline-block; background-color: ${statusContent.color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Theo dõi đơn hàng
              </a>
            </div>
            <p style="color: #4b5563; line-height: 1.6; font-size: 14px; text-align: center;">
              Hoặc copy link sau vào trình duyệt:<br>
              <a href="${trackOrderUrl}" style="color: ${statusContent.color}; word-break: break-all;">${trackOrderUrl}</a>
            </p>
            ` : `
            <!-- Contact Info -->
            <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af;">
                Nếu có thắc mắc về việc hủy đơn hàng, vui lòng liên hệ với chúng tôi qua số điện thoại hoặc email.
              </p>
            </div>
            `}
            
            <p style="color: #4b5563; line-height: 1.6; margin-top: 30px;">
              Trân trọng,<br>
              <strong>Đội ngũ ${restaurantName}</strong>
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      `,
      text: `
        ${restaurantName}
        ${slogan}
        
        ${statusContent.title}
        
        Xin chào ${customerName},
        
        ${statusContent.message}
        
        Mã đơn hàng: ${orderId}
        
        ${newStatus !== 'cancelled' ? `
        Chi tiết đơn hàng:
        ${itemsText}
        
        Tổng tiền: ${totalPrice}
        ` : ''}
        
        ${cancelReason ? `Lý do hủy: ${cancelReason}` : ''}
        
        Thời gian cập nhật: ${updateDate}
        ${order.customer_address ? `Địa chỉ giao hàng: ${order.customer_address}` : ''}
        
        ${newStatus !== 'cancelled' ? `Theo dõi đơn hàng tại: ${trackOrderUrl}` : 'Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.'}
        
        Trân trọng,
        Đội ngũ ${restaurantName}
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Order status email sent (${newStatus}):`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email] Error sending order status email:', error);
    return { success: false, error: error.message };
  }
}

