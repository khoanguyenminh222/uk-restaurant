import { NextResponse } from 'next/server';
import { sendTestTelegramMessage } from '@/lib/telegram';
import { getTelegramConfig } from '@/lib/restaurantConfig';

export async function POST(req) {
  try {
    // Check if Telegram configuration exists
    const telegramConfig = await getTelegramConfig();
    
    // Check database config first, then env variables
    const hasBotToken = telegramConfig?.bot_token || process.env.TELEGRAM_BOT_TOKEN;
    const hasChatId = telegramConfig?.chat_id || process.env.TELEGRAM_CHAT_ID;
    
    if (!hasBotToken || !hasChatId) {
      return NextResponse.json(
        { 
          error: 'Vui lòng cấu hình Bot Token và Chat ID trước khi gửi thông báo thử nghiệm. ' +
                 'Bạn có thể cấu hình trong Admin > Notification Config hoặc set environment variables.'
        },
        { status: 400 }
      );
    }

    // Send test Telegram message
    const result = await sendTestTelegramMessage();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Không thể gửi thông báo Telegram thử nghiệm' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Thông báo Telegram thử nghiệm đã được gửi thành công!',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Error sending test Telegram message:', error);
    
    // Provide more specific error messages
    let errorMessage = error.message || 'Không thể gửi thông báo Telegram thử nghiệm';
    
    if (error.message && error.message.includes('Unauthorized')) {
      errorMessage = 'Bot Token không hợp lệ. Vui lòng kiểm tra lại Bot Token.';
    } else if (error.message && error.message.includes('chat not found')) {
      errorMessage = 'Chat ID không hợp lệ hoặc bot chưa được thêm vào group/channel. Vui lòng kiểm tra lại Chat ID và đảm bảo bot đã được thêm vào group/channel.';
    } else if (error.message && error.message.includes('Bad Request')) {
      errorMessage = 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại Bot Token và Chat ID.';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

