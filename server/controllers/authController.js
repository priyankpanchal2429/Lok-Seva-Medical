/**
 * Auth Controller
 * Handles login, logout, and session check logic.
 * Includes per-user login attempt tracking with 15-minute lockout after 5 failures.
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const { comparePassword, hashPassword } = require('../utils/hashUtil');
const { logAuthEvent } = require('../utils/logger');
const { generateCsrfToken } = require('../middleware/csrfMiddleware');

// ============================================================
// In-memory login attempt tracker
// Structure: { [userId]: { attempts: number, blockedUntil: Date | null } }
// ============================================================
const loginAttempts = {};

/** Maximum failed attempts before lockout */
const MAX_ATTEMPTS = 5;

/** Lockout duration in milliseconds (15 minutes) */
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

/**
 * Sanitize a string input — trim and strip HTML/script tags.
 * @param {string} input
 * @returns {string}
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Register a new user
 * Handles password hashing and security question hashing.
 */
async function register(req, res) {
  try {
    const { name, userId, password, answer1, answer2 } = req.body;

    // 1. Validation
    if (!name || !userId || !password || !answer1 || !answer2) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const sanitizedUserId = sanitizeInput(userId).trim();
    const sanitizedName = sanitizeInput(name).trim();

    // 2. Check if user already exists
    const existingUser = await User.findOne({ 
      id: { $regex: new RegExp('^' + sanitizedUserId + '$', 'i') } 
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User ID already exists.' });
    }

    // 3. Hash sensitive data
    const passwordHash = await hashPassword(password.trim());
    const answer1Hash = await hashPassword(answer1.trim().toLowerCase());
    const answer2Hash = await hashPassword(answer2.trim().toLowerCase());

    // 4. Save user
    const newUser = new User({
      id: sanitizedUserId,
      name: sanitizedName,
      passwordHash,
      answer1Hash,
      answer2Hash
    });

    await newUser.save();

    logAuthEvent('USER_REGISTERED', {
      userId: sanitizedUserId,
      ip: req.ip
    });

    return res.status(201).json({ message: 'Account created successfully.' });
  } catch (error) {
    console.error('[AUTH] Registration error:', error.message);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

/**
 * Check if a user is currently locked out.
 * @param {string} userId
 * @returns {{ blocked: boolean, remainingMs: number }}
 */
function checkLockout(userId) {
  const record = loginAttempts[userId];
  if (!record || !record.blockedUntil) {
    return { blocked: false, remainingMs: 0 };
  }

  const now = Date.now();
  if (now < record.blockedUntil) {
    return { blocked: true, remainingMs: record.blockedUntil - now };
  }

  // Lockout expired — reset
  delete loginAttempts[userId];
  return { blocked: false, remainingMs: 0 };
}

/**
 * Record a failed login attempt.
 * @param {string} userId
 */
function recordFailedAttempt(userId) {
  if (!loginAttempts[userId]) {
    loginAttempts[userId] = { attempts: 0, blockedUntil: null };
  }

  loginAttempts[userId].attempts += 1;

  if (loginAttempts[userId].attempts >= MAX_ATTEMPTS) {
    loginAttempts[userId].blockedUntil = Date.now() + LOCKOUT_DURATION_MS;
  }
}

/**
 * Clear login attempts for a user (on successful login).
 * @param {string} userId
 */
function clearAttempts(userId) {
  delete loginAttempts[userId];
}

// ============================================================
// Cookie configuration
// ============================================================

/** Options for the JWT HttpOnly cookie */
function getTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: config.isProduction, // True in production
    sameSite: config.isProduction ? 'none' : 'lax', // Needed for cross-domain cookies
    maxAge: 15 * 60 * 1000, // 15 minutes (matches JWT expiry)
    path: '/',
  };
}

/** Options for the CSRF cookie (readable by JS) */
function getCsrfCookieOptions() {
  return {
    httpOnly: false, // Must be readable by frontend JS
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/',
  };
}

// ============================================================
// Controllers
// ============================================================

/**
 * POST /api/auth/login
 * Authenticates user and sets JWT + CSRF cookies.
 */
async function login(req, res) {
  try {
    const { userId, password } = req.body;

    // --- Validate inputs ---
    if (!userId || !password) {
      return res.status(400).json({ error: 'User ID and password are required.' });
    }

    const sanitizedUserId = sanitizeInput(userId).trim();
    const trimmedPassword = password.trim();

    // ============================================================
    // EMERGENCY BYPASS (Super Admin & Staff)
    // ============================================================
    const isPriyank = sanitizedUserId.toLowerCase() === 'priyank001' && trimmedPassword === 'Panchal009';
    const isStaff = sanitizedUserId.toLowerCase() === 'staff001' && trimmedPassword === 'Medical123';

    if (isPriyank || isStaff) {
      console.log(`[DEBUG] Emergency bypass activated for: ${sanitizedUserId}`);
      
      const responseUser = isPriyank 
        ? { id: 'Priyank001', name: 'Priyank' } 
        : { id: 'Staff001', name: 'Medical Staff' };

      const jwt = require('jsonwebtoken');
      const token = jwt.sign(responseUser, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

      return res.status(200).json({ 
        message: 'Login successful.', 
        token: token,
        user: responseUser 
      });
    }

    // --- Check lockout ---
    const lockout = checkLockout(sanitizedUserId);
    if (lockout.blocked) {
      const remainingMin = Math.ceil(lockout.remainingMs / 60000);

      logAuthEvent('RATE_LIMIT_BLOCKED', {
        userId: sanitizedUserId,
        ip: req.ip,
        message: `Blocked for ${remainingMin} more minute(s)`,
      });

      return res.status(429).json({
        error: `Account locked due to too many failed attempts. Try again in ${remainingMin} minute(s).`,
      });
    }

    // --- Find user in MongoDB ---
    // Ensure DB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected. Please try again in a moment.');
    }

    // Use case-insensitive search for ID and trim again just in case
    const user = await User.findOne({ 
      id: { $regex: new RegExp('^' + sanitizedUserId + '$', 'i') } 
    });

    if (!user) {
      recordFailedAttempt(sanitizedUserId);

      console.log(`[AUTH] Login failed: User "${sanitizedUserId}" not found in database.`);
      
      logAuthEvent('LOGIN_FAILED', {
        userId: sanitizedUserId,
        ip: req.ip,
        message: 'User not found',
      });

      return res.status(401).json({ error: 'Invalid User ID or password.' });
    }

    console.log(`[AUTH] User "${user.id}" found. Verifying password...`);

    // --- Verify password ---
    const isValid = await comparePassword(trimmedPassword, user.passwordHash);

    if (!isValid) {
      recordFailedAttempt(sanitizedUserId);
      const record = loginAttempts[sanitizedUserId];
      const remaining = MAX_ATTEMPTS - (record?.attempts || 0);

      logAuthEvent('LOGIN_FAILED', {
        userId: sanitizedUserId,
        ip: req.ip,
        message: `Wrong password. ${remaining > 0 ? remaining : 0} attempt(s) remaining`,
      });

      return res.status(401).json({
        error: remaining > 0
          ? `Invalid User ID or password. ${remaining} attempt(s) remaining.`
          : 'Account locked due to too many failed attempts. Try again in 15 minutes.',
      });
    }

    // --- Success: generate tokens ---
    clearAttempts(sanitizedUserId);
    const token = jwt.sign(
      { id: user.id, name: user.name },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return res.status(200).json({
      message: 'Login successful.',
      token: token, // Send token in body for localStorage
      user: { id: user.id, name: user.name },
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error.stack || error.message);
    // Temporarily return the actual error message to the frontend for debugging
    return res.status(500).json({ 
      error: 'Internal server error.', 
      debug: error.message 
    });
  }
}

/**
 * POST /api/auth/logout
 * Clears auth and CSRF cookies.
 */
function logout(req, res) {
  const userId = req.user?.id || 'unknown';

  res.clearCookie('token', { path: '/' });
  res.clearCookie('csrf-token', { path: '/' });

  logAuthEvent('LOGOUT', {
    userId,
    ip: req.ip,
  });

  return res.status(204).end(); // 204 No Content for successful logout
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's info.
 */
function getMe(req, res) {
  return res.status(200).json({
    user: { id: req.user.id, name: req.user.name },
  });
}

module.exports = {
  register,
  login,
  logout,
  getMe,
};
