/**
 * CSRF Middleware
 * Implements the double-submit cookie pattern.
 *
 * How it works:
 * 1. On login, server sets a 'csrf-token' cookie (readable by JS, NOT HttpOnly).
 * 2. Frontend reads this cookie and sends its value as X-CSRF-Token header.
 * 3. This middleware compares the header value against the cookie value.
 *
 * This protects against CSRF because a malicious site cannot read our cookies
 * to construct the matching header.
 */

const crypto = require('crypto');

/**
 * Generate a random CSRF token.
 * @returns {string} 32-byte hex token
 */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Middleware to verify CSRF token on state-changing requests.
 * Skips GET, HEAD, OPTIONS requests.
 */
function csrfMiddleware(req, res, next) {
  // Skip safe HTTP methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Skip login route (no CSRF cookie exists yet before first login)
  if (req.originalUrl === '/api/auth/login' || req.originalUrl.startsWith('/api/auth/login?')) {
    return next();
  }

  const cookieToken = req.cookies?.['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'Invalid CSRF token. Please refresh and try again.' });
  }

  next();
}

module.exports = { generateCsrfToken, csrfMiddleware };
