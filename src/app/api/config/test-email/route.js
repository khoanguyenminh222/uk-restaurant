export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/email';
import { getEmailConfig } from '@/lib/restaurantConfig';
import { getAdminFromToken } from '@/lib/auth';

export async function POST(req) {
  try {
    // Check admin authentication
    const admin = await getAdminFromToken(req);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { recipient_email } = await req.json();

    // Validate recipient email
    if (!recipient_email || !recipient_email.includes('@')) {
      return NextResponse.json(
        { error: 'Email người nhận không hợp lệ' },
        { status: 400 }
      );
    }

    // Check if email configuration exists
    const emailConfig = await getEmailConfig();

    // Check database config first, then env variables
    // Note: Password can contain spaces (e.g., Gmail App Password: "xxxx xxxx xxxx xxxx")
    const hasSenderEmail = emailConfig?.sender_email || process.env.EMAIL_USER;
    const hasSenderPassword = emailConfig?.sender_password || process.env.EMAIL_PASSWORD;

    if (!hasSenderEmail || !hasSenderPassword) {
      const missingFields = [];
      if (!hasSenderEmail) missingFields.push('Email gửi');
      if (!hasSenderPassword) missingFields.push('Mật khẩu');

      return NextResponse.json(
        {
          error: `Vui lòng cấu hình ${missingFields.join(' và ')} trước khi gửi email thử nghiệm. ` +
            `Bạn có thể cấu hình trong Admin > Notification Config hoặc set environment variables.`
        },
        { status: 400 }
      );
    }

    // Send test email
    await sendTestEmail(recipient_email);

    return NextResponse.json({
      success: true,
      message: 'Email thử nghiệm đã được gửi thành công!'
    });
  } catch (error) {
    console.error('Error sending test email:', error);

    // Provide more specific error messages
    let errorMessage = error.message || 'Không thể gửi email thử nghiệm';

    if (error.message && error.message.includes('credentials')) {
      errorMessage = 'Thông tin đăng nhập email không hợp lệ. Vui lòng kiểm tra lại email và mật khẩu.';
    } else if (error.message && error.message.includes('authentication')) {
      errorMessage = 'Xác thực email thất bại. Nếu dùng Gmail, vui lòng dùng App Password thay vì mật khẩu thường.';
    } else if (error.message && error.message.includes('ECONNREFUSED')) {
      errorMessage = 'Không thể kết nối đến máy chủ email. Vui lòng kiểm tra kết nối mạng.';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

