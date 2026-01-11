/**
 * Admin Authentication Utilities
 * Handles JWT token storage, retrieval, and authenticated API calls
 */

/**
 * Save admin session data and token to localStorage
 */
export function saveAdminSession(adminData, token) {
    if (typeof window === 'undefined') return;

    localStorage.setItem('admin_data', JSON.stringify(adminData));
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_logged_in', 'true');
}

/**
 * Get admin token from localStorage
 */
export function getAdminToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token');
}

/**
 * Get admin data from localStorage
 */
export function getAdminData() {
    if (typeof window === 'undefined') return null;

    const data = localStorage.getItem('admin_data');
    return data ? JSON.parse(data) : null;
}

/**
 * Clear admin session (logout)
 */
export function clearAdminSession() {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('admin_data');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_logged_in');
}

/**
 * Check if admin is logged in
 */
export function isAdminLoggedIn() {
    if (typeof window === 'undefined') return false;

    const token = getAdminToken();
    const loggedIn = localStorage.getItem('admin_logged_in');

    return !!(token && loggedIn === 'true');
}

/**
 * Authenticated fetch wrapper
 * Automatically adds Authorization header and handles 401/403 errors
 */
export async function adminFetch(url, options = {}) {
    const token = getAdminToken();

    // If no token, logout and redirect
    if (!token) {
        handleUnauthorized();
        throw new Error('No authentication token found');
    }

    // Add Authorization header
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
    };

    // Make the request
    const response = await fetch(url, {
        ...options,
        headers,
    });

    // Handle authentication errors
    if (response.status === 401) {
        handleUnauthorized();
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    }

    return response;
}

/**
 * Handle unauthorized access - logout and redirect to login
 */
function handleUnauthorized() {
    if (typeof window === 'undefined') return;

    clearAdminSession();
    localStorage.setItem('admin_logout_success_message', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    window.location.href = '/admin';
}
