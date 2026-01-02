/**
 * Email Utility
 * Gửi email verification và reset password
 */

import nodemailer from 'nodemailer';

/**
 * Tạo transporter cho nodemailer
 * Sử dụng Gmail SMTP hoặc environment variables
 */
function createTransporter() {
  // Sử dụng Gmail với App Password hoặc OAuth2
  // Hoặc có thể dùng SendGrid, Resend, Mailgun, etc.
  
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // App Password cho Gmail
    },
  });

  return transporter;
}

/**
 * Gửi email verification code cho đặt hàng (không cần name)
 */
export async function sendVerificationEmail(email, code, name = null) {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"UK Restaurant" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Xác thực email - UK Restaurant',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #16a34a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">UK Restaurant</h1>
            <p style="color: #e5e7eb; margin: 5px 0 0 0;">Ăn no khỏi "bàn"</p>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Xác thực email của bạn</h2>
            ${name ? `<p style="color: #4b5563; line-height: 1.6;">
              Xin chào <strong>${name}</strong>,
            </p>` : ''}
            <p style="color: #4b5563; line-height: 1.6;">
              ${name ? 'Cảm ơn bạn đã đăng ký tài khoản tại UK Restaurant. Vui lòng sử dụng mã xác thực sau để hoàn tất đăng ký:' : 'Cảm ơn bạn đã đặt hàng tại UK Restaurant. Vui lòng sử dụng mã xác thực sau để xác nhận email của bạn:'}
            </p>
            <div style="background-color: #f3f4f6; border: 2px dashed #16a34a; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Mã xác thực của bạn:</p>
              <h1 style="color: #16a34a; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                ${code}
              </h1>
            </div>
            <p style="color: #4b5563; line-height: 1.6;">
              Mã này sẽ hết hạn sau <strong>10 phút</strong>. Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
            </p>
            <p style="color: #4b5563; line-height: 1.6; margin-top: 30px;">
              Trân trọng,<br>
              <strong>Đội ngũ UK Restaurant</strong>
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      `,
      text: `
        Xác thực email - UK Restaurant
        
        ${name ? `Xin chào ${name},` : ''}
        
        ${name ? 'Cảm ơn bạn đã đăng ký tài khoản tại UK Restaurant.' : 'Cảm ơn bạn đã đặt hàng tại UK Restaurant.'}
        Mã xác thực của bạn là: ${code}
        
        Mã này sẽ hết hạn sau 10 phút.
        
        Trân trọng,
        Đội ngũ UK Restaurant
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
 */
export async function sendResetPasswordEmail(email, name, resetToken) {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"UK Restaurant" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Đặt lại mật khẩu - UK Restaurant',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #16a34a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">UK Restaurant</h1>
            <p style="color: #e5e7eb; margin: 5px 0 0 0;">Ăn no khỏi "bàn"</p>
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
              Link này sẽ hết hạn sau <strong>30 phút</strong>. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
            </p>
            <p style="color: #4b5563; line-height: 1.6; margin-top: 30px;">
              Trân trọng,<br>
              <strong>Đội ngũ UK Restaurant</strong>
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      `,
      text: `
        Đặt lại mật khẩu - UK Restaurant
        
        Xin chào ${name},
        
        Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng truy cập link sau:
        ${resetUrl}
        
        Link này sẽ hết hạn sau 30 phút.
        
        Trân trọng,
        Đội ngũ UK Restaurant
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
    const transporter = createTransporter();

    // Format order items
    let itemsHtml = '';
    let itemsText = '';
    
    if (orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
      itemsHtml = orderData.items.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.tên_món}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.giá)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.giá * item.quantity)}</td>
        </tr>
      `).join('');
      
      itemsText = orderData.items.map(item => 
        `- ${item.tên_món} (x${item.quantity}): ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.giá * item.quantity)}`
      ).join('\n');
    } else if (orderData.tên_món) {
      const quantity = orderData.quantity || 1;
      const price = orderData.giá || 0;
      itemsHtml = `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${orderData.tên_món}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price * quantity)}</td>
        </tr>
      `;
      itemsText = `- ${orderData.tên_món} (x${quantity}): ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price * quantity)}`;
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
      from: `"UK Restaurant" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Xác nhận đơn hàng #${orderId} - UK Restaurant`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #16a34a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">UK Restaurant</h1>
            <p style="color: #e5e7eb; margin: 5px 0 0 0;">Ăn no khỏi "bàn"</p>
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
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #374151;">Món</th>
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
              <strong>Đội ngũ UK Restaurant</strong>
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      `,
      text: `
        Xác nhận đơn hàng - UK Restaurant
        
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
        Đội ngũ UK Restaurant
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

