/**
 * Dashboard Routes
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getOutstanding } = require('../controllers/dashboardController');

router.get('/outstanding', authMiddleware, getOutstanding);

module.exports = router;
