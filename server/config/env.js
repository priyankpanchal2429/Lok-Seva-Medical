/**
 * Centralized Environment Configuration
 * Loads and validates all required environment variables.
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env file from server directory
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/** Required environment variable keys */
const REQUIRED_KEYS = [
  'PORT',
  'NODE_ENV',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'CSRF_SECRET',
  'CLIENT_URL',
  'MONGODB_URI',
];

// Validate all required keys exist
const missing = REQUIRED_KEYS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`[ENV] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

/** Typed configuration object */
const config = {
  port: parseInt(process.env.PORT, 10),
  nodeEnv: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === 'production',
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  csrf: {
    secret: process.env.CSRF_SECRET,
  },
  clientUrl: process.env.CLIENT_URL,
  mongodbUri: process.env.MONGODB_URI,
};

module.exports = config;
