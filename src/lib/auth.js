/**
 * Authentication Utilities
 * Helper functions for admin authentication
 */

import clientPromise from '@/lib/mongodb';

/**
 * Get admin from request
 * Hệ thống sử dụng localStorage ở client-side, nên cần gửi admin phone trong request
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object|null>} Admin object or null
 */
export async function getAdminFromToken(request) {
  try {
    // Lấy admin phone từ header hoặc body
    // Client sẽ gửi admin phone trong header 'x-admin-phone' hoặc trong request body
    const adminPhone = request.headers.get('x-admin-phone');
    
    // Nếu không có trong header, thử lấy từ body (chỉ khi method là POST/PUT)
    let body = null;
    if (!adminPhone && (request.method === 'POST' || request.method === 'PUT')) {
      try {
        const clonedRequest = request.clone();
        body = await clonedRequest.json();
      } catch (e) {
        // Body không phải JSON hoặc đã được đọc
      }
    }
    
    const phone = adminPhone || body?.currentAdminPhone || body?.admin_phone;

    if (!phone) {
      return null;
    }

    // Tìm admin theo phone
    const client = await clientPromise;
    const db = client.db('uk-restaurant');
    
    const admin = await db.collection('users').findOne({
      phone: phone,
      role: { $in: ['admin', 'super_admin'] },
      is_deleted: { $ne: true }
    });

    if (!admin) {
      return null;
    }

    // Return admin without sensitive data
    const { password, verification_code, verification_code_expires, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  } catch (error) {
    console.error('Error getting admin from token:', error);
    return null;
  }
}

