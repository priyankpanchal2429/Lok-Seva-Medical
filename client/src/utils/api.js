/**
 * API Utility
 * Configured Axios instance with interceptors for auth handling.
 */

import axios from 'axios';

/** Axios instance with defaults for API communication */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: false, // Using Authorization headers instead of cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds to accommodate Render free tier cold starts
});

/**
 * Request interceptor — attaches JWT token from localStorage.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lok-seva-token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
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

export default api;
