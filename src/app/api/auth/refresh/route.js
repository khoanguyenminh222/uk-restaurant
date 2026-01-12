import { NextResponse } from 'next/server';
import { getUserFromToken, signJWT } from '@/lib/auth';

/**
 * POST /api/auth/refresh
 * Refresh user JWT token
 */
export async function POST(request) {
    try {
        const user = await getUserFromToken(request);

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' },
                { status: 401 }
            );
        }

        // Generate a new token for the same user
        const newToken = await signJWT({
            user_id: user.user_id,
            phone: user.phone,
            role: user.role
        });

        return NextResponse.json({
            success: true,
            token: newToken,
            message: 'Token đã được làm mới'
        });
    } catch (error) {
        console.error('Error refreshing user token:', error);
        return NextResponse.json(
            { success: false, error: 'Lỗi khi làm mới token' },
            { status: 500 }
        );
    }
}
