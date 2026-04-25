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
const patientRoutes = require('./routes/patientRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const salesInvoiceRoutes = require('./routes/salesInvoiceRoutes');
const purchaseInvoiceRoutes = require('./routes/purchaseInvoiceRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const { globalLimiter } = require('./middleware/rateLimiter');


const app = express();

// Trust proxy for production (needed for secure cookies on Render/Heroku)
if (config.isProduction) {
  app.set('trust proxy', 1);
}

// Connect to MongoDB
const maskedUri = config.mongodbUri.replace(/:([^@]+)@/, ':****@').slice(-15);
mongoose.connect(config.mongodbUri, { dbName: 'loksevamedical' })
  .then(() => console.log(`✅ Connected to MongoDB (Ending in: ...${maskedUri})`))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ============================================================
// Security Middleware
// ============================================================

// Helmet — sets various HTTP security headers
app.use(helmet());

// CORS — Allow all origins temporarily for debugging cross-domain issues
app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200, 
}));

// Rate limiting — global
app.use(globalLimiter);

// ============================================================
// Parsing Middleware
// ============================================================

app.use(express.json({ limit: '500kb' })); // Increased limit for invoice payloads
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



// ============================================================
// Routes
// ============================================================

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/sales-invoices', salesInvoiceRoutes);
app.use('/api/purchase-invoices', purchaseInvoiceRoutes);
app.use('/api/medicines', medicineRoutes);

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
