import { SignJWT, jwtVerify } from 'jose';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'uk-restaurant-super-secret-key-12345'
);

/**
 * Sign a JWT token
 */
export async function signJWT(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

/**
 * Verify a JWT token
 */
export async function verifyJWT(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Get admin from request using JWT
 */
export async function getAdminFromToken(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);

    if (!payload || !payload.phone) {
      return null;
    }

    // Tìm admin theo phone từ payload
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const admin = await db.collection('users').findOne({
      phone: payload.phone,
      role: { $in: ['admin', 'super_admin', 'manager'] },
      is_deleted: { $ne: true }
    });

    if (!admin) {
      return null;
    }

    const { password, verification_code, verification_code_expires, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  } catch (error) {
    console.error('Error getting admin from token:', error);
    return null;
  }
}

