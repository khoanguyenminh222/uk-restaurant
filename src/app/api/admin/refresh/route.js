export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getAdminFromToken, signJWT } from '@/lib/auth';

/**
 * POST /api/admin/refresh
 * Refresh admin JWT token to implement sliding expiration
 */
export async function POST(request) {
    try {
        const admin = await getAdminFromToken(request);

        if (!admin) {
            return NextResponse.json(
                { success: false, error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' },
                { status: 401 }
            );
        }

        // Generate a new token for the same admin
        const newToken = await signJWT({
            user_id: admin.user_id,
            phone: admin.phone,
            role: admin.role
        });

        return NextResponse.json({
            success: true,
            token: newToken,
            message: 'Token đã được làm mới'
        });
    } catch (error) {
        console.error('Error refreshing admin token:', error);
        return NextResponse.json(
            { success: false, error: 'Lỗi khi làm mới token' },
            { status: 500 }
        );
    }
}

