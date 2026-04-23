/**
 * Input Sanitization Utility
 * Prevents XSS by escaping dangerous HTML characters.
 */

/**
 * Sanitize a string input by trimming whitespace and escaping HTML entities.
 * @param {string} input - Raw user input
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Check if an input is empty after trimming.
 * @param {string} value
 * @returns {boolean}
 */
export function isEmpty(value) {
  return !value || value.trim().length === 0;
}
