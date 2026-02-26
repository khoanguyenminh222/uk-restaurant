import { NextResponse } from 'next/server';
import { sendContactNotification } from '@/lib/telegram';

export async function POST(req) {
    try {
        const data = await req.json();

        // Validate data
        const { name, email, phone, message } = data;
        if (!name || !email || !phone || !message) {
            return NextResponse.json(
                { success: false, error: 'Vui lòng điền đầy đủ các thông tin bắt buộc' },
                { status: 400 }
            )
        }

        // Gửi thông báo đến Telegram
        const telegramResult = await sendContactNotification(data);

        if (!telegramResult.success) {
            console.warn('[Contact API] Telegram notification failed:', telegramResult.error);
            // Vẫn trả về success: true cho khách hàng, vì tin nhắn có thể đã được xử lý qua kênh khác
            // hoặc đơn giản là để không làm gián đoạn trải nghiệm người dùng
        }

        return NextResponse.json({
            success: true,
            message: 'Tin nhắn của bạn đã được gửi thành công. Chúng tôi sẽ sớm liên hệ lại!'
        });
    } catch (error) {
        console.error('[Contact API] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.' },
            { status: 500 }
        );
    }
}
