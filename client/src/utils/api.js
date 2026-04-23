/**
 * API Utility
 * Configured Axios instance with interceptors for auth handling.
 */

import axios from 'axios';

/** Axios instance with defaults for API communication */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Send cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Slightly longer timeout for production
});

/**
 * Request interceptor — attaches CSRF token from cookie.
 * Reads the csrf-token cookie and sends it as X-CSRF-Token header.
 */
api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrf-token');
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

/**
 * Response interceptor — handles 401 errors globally.
 * Redirects to login if session is expired or invalid.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Read a cookie value by name.
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null
 */
function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export default api;
