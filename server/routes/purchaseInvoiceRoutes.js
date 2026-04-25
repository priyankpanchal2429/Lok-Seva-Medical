/**
 * Purchase Invoice Routes
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getPurchaseInvoices,
  getPurchaseInvoiceById,
  createPurchaseInvoice,
  updatePurchaseInvoice,
  deletePurchaseInvoice,
} = require('../controllers/purchaseInvoiceController');

router.route('/')
  .get(protect, getPurchaseInvoices)
  .post(protect, createPurchaseInvoice);

router.route('/:id')
  .get(protect, getPurchaseInvoiceById)
  .put(protect, updatePurchaseInvoice)
  .delete(protect, deletePurchaseInvoice);

module.exports = router;
