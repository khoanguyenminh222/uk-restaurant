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
 * Gửi email verification code
 */
export async function sendVerificationEmail(email, name, code) {
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
            <p style="color: #4b5563; line-height: 1.6;">
              Xin chào <strong>${name}</strong>,
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
              Cảm ơn bạn đã đăng ký tài khoản tại UK Restaurant. Vui lòng sử dụng mã xác thực sau để hoàn tất đăng ký:
            </p>
            <div style="background-color: #f3f4f6; border: 2px dashed #16a34a; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Mã xác thực của bạn:</p>
              <h1 style="color: #16a34a; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                ${code}
              </h1>
            </div>
            <p style="color: #4b5563; line-height: 1.6;">
              Mã này sẽ hết hạn sau <strong>15 phút</strong>. Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
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
        
        Xin chào ${name},
        
        Cảm ơn bạn đã đăng ký tài khoản tại UK Restaurant. 
        Mã xác thực của bạn là: ${code}
        
        Mã này sẽ hết hạn sau 15 phút.
        
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

