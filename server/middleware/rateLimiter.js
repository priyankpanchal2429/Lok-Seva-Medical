/**
 * Rate Limiter Middleware
 * Global API rate limiting using express-rate-limit.
 * Login-specific per-user rate limiting is handled in authController.
 */

const rateLimit = require('express-rate-limit');

/**
 * Global rate limiter: 100 requests per 15 minutes per IP.
 * Applies to all API routes.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

/**
 * Login-specific rate limiter: 10 requests per 15 minutes per IP.
 * This is an additional layer on top of per-user blocking in the controller.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts from this IP. Please try again later.' },
});

module.exports = { globalLimiter, loginLimiter };
