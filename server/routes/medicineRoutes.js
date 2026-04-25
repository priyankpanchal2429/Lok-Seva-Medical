const express = require('express');
const router = express.Router();
const { getMedicines } = require('../controllers/medicineController');
const authMiddleware = require('../middleware/authMiddleware');

router.route('/').get(authMiddleware, getMedicines);

module.exports = router;
