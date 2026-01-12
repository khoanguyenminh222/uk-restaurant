import { SignJWT, jwtVerify } from 'jose';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'admin-super-secret-key-12345-@#$!^&'
);

/**
 * Sign a JWT token
 */
export async function signJWT(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('72h')
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

/**
 * Get user (any role) from request using JWT
 */
export async function getUserFromToken(request) {
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

    // Tìm user theo phone từ payload (bất kể role)
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const user = await db.collection('users').findOne({
      phone: payload.phone,
      is_deleted: { $ne: true }
    });

    if (!user) {
      return null;
    }

    const { password, verification_code, verification_code_expires, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}
