/**
 * Hash Utility
 * Wrappers around bcrypt for password hashing and comparison.
 */

const bcrypt = require('bcrypt');

/** Number of salt rounds for bcrypt hashing */
const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password.
 * @param {string} plainPassword
 * @returns {Promise<string>} bcrypt hash
 */
async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = { hashPassword, comparePassword };
