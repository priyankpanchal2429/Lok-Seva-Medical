/**
 * Auth Middleware
 * Verifies JWT from HttpOnly cookie and attaches user to request.
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { logAuthEvent } = require('../utils/logger');

/**
 * Middleware to protect routes requiring authentication.
 * Reads JWT from the 'token' cookie, verifies it, and sets req.user.
 */
function authMiddleware(req, res, next) {
  // Extract token from Authorization header or cookies
  let token = req.cookies?.token;
  
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = { id: decoded.id, name: decoded.name };

    logAuthEvent('AUTH_CHECK', {
      userId: decoded.id,
      ip: req.ip,
      message: 'Token verified',
    });

    next();
  } catch (error) {
    // Clear invalid/expired token
    res.clearCookie('token');
    res.clearCookie('csrf-token');

    const errorMessage = error.name === 'TokenExpiredError'
      ? 'Session expired. Please log in again.'
      : 'Invalid session. Please log in again.';

    return res.status(401).json({ error: errorMessage });
  }
}

module.exports = authMiddleware;
