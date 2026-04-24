const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');
const authMiddleware = require('../middleware/authMiddleware');

router.route('/')
  .get(authMiddleware, getSuppliers)
  .post(authMiddleware, createSupplier);

router.route('/:id')
  .put(authMiddleware, updateSupplier)
  .delete(authMiddleware, deleteSupplier);

module.exports = router;
