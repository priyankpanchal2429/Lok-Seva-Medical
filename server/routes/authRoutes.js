/**
 * Auth Routes
 * Defines authentication endpoints for login, logout, and session check.
 */

const express = require('express');
const router = express.Router();

const { login, logout, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/login — Authenticate user (rate limited)
router.post('/login', loginLimiter, login);

// POST /api/auth/logout — Clear session (requires auth)
router.post('/logout', authMiddleware, logout);

// GET /api/auth/me — Check current session (requires auth)
router.get('/me', authMiddleware, getMe);

module.exports = router;
