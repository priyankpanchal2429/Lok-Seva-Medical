/**
 * Hash Utility
 * Wrappers around bcrypt for password hashing and comparison.
 */

const bcrypt = require('bcryptjs');

/** Number of salt rounds for bcrypt hashing */
const SALT_ROUNDS = 10;

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
  console.log('[DEBUG] Comparing passwords...');
  const match = await bcrypt.compare(plainPassword, hashedPassword);
  console.log('[DEBUG] Match result:', match);
  return match;
}

module.exports = { hashPassword, comparePassword };
