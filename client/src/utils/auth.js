/**
 * Auth Utility
 * Helpers for checking authentication state via the server.
 * Auth tokens are stored in HttpOnly cookies — no localStorage token management.
 */

import api from './api';

/**
 * Check if the current user is authenticated.
 * Calls GET /api/auth/me and returns user data or null.
 * @returns {Promise<{ id: string, name: string } | null>}
 */
export async function checkAuth() {
  try {
    const response = await api.get('/auth/me');
    return response.data.user;
  } catch {
    return null;
  }
}

/**
 * Log the user out by clearing the token and calling the server.
 * @returns {Promise<boolean>} True if logout was successful
 */
export async function performLogout() {
  try {
    localStorage.removeItem('lok-seva-token');
    await api.post('/auth/logout');
    return true;
  } catch {
    // Even if API fails, clear token locally and redirect to login
    localStorage.removeItem('lok-seva-token');
    return false;
  }
}
