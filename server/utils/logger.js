/**
 * Logger Utility
 * Structured logging for authentication events.
 * Format: [TIMESTAMP] EVENT user=ID ip=ADDRESS
 */

/**
 * Formats a timestamp for log output.
 * @returns {string} ISO-like formatted timestamp
 */
function getTimestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Log an authentication event.
 * @param {'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'AUTH_CHECK' | 'RATE_LIMIT_BLOCKED'} event
 * @param {object} details - { userId, ip, message }
 */
function logAuthEvent(event, { userId = 'unknown', ip = 'unknown', message = '' } = {}) {
  const timestamp = getTimestamp();
  const logLine = `[${timestamp}] ${event} user=${userId} ip=${ip}${message ? ` | ${message}` : ''}`;

  // Color-coded console output for dev readability
  switch (event) {
    case 'LOGIN_SUCCESS':
    case 'AUTH_CHECK':
      console.log(`\x1b[32m${logLine}\x1b[0m`); // Green
      break;
    case 'LOGIN_FAILED':
    case 'RATE_LIMIT_BLOCKED':
      console.log(`\x1b[31m${logLine}\x1b[0m`); // Red
      break;
    case 'LOGOUT':
      console.log(`\x1b[33m${logLine}\x1b[0m`); // Yellow
      break;
    default:
      console.log(logLine);
  }
}

module.exports = { logAuthEvent };
