/**
 * User Authentication Utilities
 * Handles JWT token storage, retrieval, and authenticated API calls for regular users
 */

import { clearUser } from "@/utils/user";

/**
 * Get user token from localStorage
 */
export function getUserToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_token');
}

/**
 * Check if user is logged in
 */
export function isUserLoggedIn() {
    if (typeof window === 'undefined') return false;
    const token = getUserToken();
    return !!token;
}

/**
 * Authenticated fetch wrapper for users
 * Automatically adds Authorization header, handles token refresh, and handles 401 errors
 */
export async function userFetch(url, options = {}) {
    let token = getUserToken();

    // If no token, return 401-like error or throw
    if (!token) {
        handleUnauthorized();
        throw new Error('No authentication token found');
    }

    // Check if token is near expiry (less than 2 hours left)
    if (isTokenNearExpiry(token)) {
        try {
            const newToken = await refreshUserToken();
            if (newToken) {
                token = newToken;
            }
        } catch (error) {
            console.error('Failed to refresh token:', error);
            // Proceed with old token, if it fails backend will catch it
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
 * This logic is duplicated from adminAuth to avoid circular deps or complex refactoring right now
 */
function isTokenNearExpiry(token) {
    try {
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
async function refreshUserToken() {
    const token = getUserToken();
    if (!token) return null;

    try {
        const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success && result.token) {
                // Save the new token
                localStorage.setItem('user_token', result.token);
                // console.log('User token refreshed successfully');
                return result.token;
            }
        }
        return null;
    } catch (error) {
        // console.error('Error refreshing token:', error);
        return null;
    }
}

/**
 * Handle unauthorized access - clear session and reload/redirect
 */
function handleUnauthorized() {
    if (typeof window === 'undefined') return;

    // Clear user data
    clearUser();
    localStorage.removeItem('user_token');

    // Optional: save message
    localStorage.setItem('login_error', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');

    // Reload page to reflect logged out state
    window.location.reload();
}
