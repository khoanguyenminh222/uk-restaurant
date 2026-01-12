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
 * Automatically adds Authorization header, handles token refresh, and handles 401/403 errors
 */
export async function adminFetch(url, options = {}) {
    let token = getAdminToken();

    // If no token, logout and redirect
    if (!token) {
        handleUnauthorized();
        throw new Error('No authentication token found');
    }

    // Check if token is near expiry (less than 2 hours left)
    // We refresh early to ensure a smooth experience
    if (isTokenNearExpiry(token)) {
        try {
            const newToken = await refreshAdminToken();
            if (newToken) {
                token = newToken;
            }
        } catch (error) {
            console.error('Failed to refresh token:', error);
            // If refresh fails but we still have a token, we can try to proceed
            // but if it was 401, the main fetch will catch it anyway
        }
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
 * Check if a JWT token is near its expiration time (less than 2 hours)
 */
function isTokenNearExpiry(token) {
    try {
        // Simple JWT decode (payload is the second part)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        if (!payload.exp) return false;

        const now = Math.floor(Date.now() / 1000);
        const timeLeft = payload.exp - now;

        // Refresh if less than 2 hours (7200 seconds) left
        return timeLeft < 7200;
    } catch (e) {
        return false;
    }
}

/**
 * Call the refresh API to get a new token
 */
async function refreshAdminToken() {
    const token = getAdminToken();
    if (!token) return null;

    try {
        const response = await fetch('/api/admin/refresh', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success && result.token) {
                // Save the new token
                localStorage.setItem('admin_token', result.token);
                console.log('Admin token refreshed successfully');
                return result.token;
            }
        }
        return null;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
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
