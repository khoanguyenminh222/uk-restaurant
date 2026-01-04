/**
 * Authentication Middleware
 * Helper functions để check authentication và authorization
 */

/**
 * Check if user is authenticated (có token/session)
 */
export function isAuthenticated(request) {
  // TODO: Implement JWT token check hoặc session check
  // Tạm thời return true nếu có admin_logged_in trong localStorage (client-side)
  // Hoặc check từ cookies/headers (server-side)
  return true;
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId) {
  if (!userId) return false;
  
  try {
    const { default: clientPromise, getDatabaseName } = await import('@/lib/mongodb');
    const client = await clientPromise;
    const db = client.db(getDatabaseName());
    const user = await db.collection('users').findOne({ user_id: userId });
    
    if (!user) return false;
    
    return user.role === 'admin' || user.role === 'super_admin';
  } catch (error) {
    console.error('Error checking admin:', error);
    return false;
  }
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(userId) {
  if (!userId) return false;
  
  try {
    const { default: clientPromise, getDatabaseName } = await import('@/lib/mongodb');
    const client = await clientPromise;
    const db = client.db(getDatabaseName());
    const user = await db.collection('users').findOne({ user_id: userId });
    
    if (!user) return false;
    
    return user.role === 'super_admin';
  } catch (error) {
    console.error('Error checking super admin:', error);
    return false;
  }
}

/**
 * Get user from request (JWT token hoặc session)
 */
export async function getUserFromRequest(request) {
  // TODO: Implement JWT token parsing hoặc session check
  // Tạm thời return null
  return null;
}

