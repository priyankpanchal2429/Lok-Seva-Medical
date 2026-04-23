/**
 * Lok Seva Medical Store — Express Server
 * Entry point for the backend API.
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');

const config = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const { globalLimiter } = require('./middleware/rateLimiter');
const { csrfMiddleware } = require('./middleware/csrfMiddleware');

const app = express();

// Trust proxy for production (needed for secure cookies on Render/Heroku)
if (config.isProduction) {
  app.set('trust proxy', 1);
}

// Connect to MongoDB
mongoose.connect(config.mongodbUri)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ============================================================
// Security Middleware
// ============================================================

// Helmet — sets various HTTP security headers
app.use(helmet());

// CORS — allow frontend origin with credentials
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));

// Rate limiting — global
app.use(globalLimiter);

// ============================================================
// Parsing Middleware
// ============================================================

app.use(express.json({ limit: '1kb' })); // Small payload limit for login
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ============================================================
// Logging
// ============================================================

if (config.nodeEnv !== 'test') {
  app.use(morgan('short'));
}

// ============================================================
// CSRF Protection
// ============================================================

app.use(csrfMiddleware);

// ============================================================
// Routes
// ============================================================

app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================
// 404 Handler
// ============================================================

app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// ============================================================
// Global Error Handler
// ============================================================

app.use((err, _req, res, _next) => {
  console.error('[SERVER] Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

// ============================================================
// Start Server
// ============================================================

app.listen(config.port, () => {
  console.log(`\n🏥 Lok Seva Medical Store — Server`);
  console.log(`   Environment : ${config.nodeEnv}`);
  console.log(`   Port        : ${config.port}`);
  console.log(`   Client URL  : ${config.clientUrl}\n`);
});

module.exports = app;
