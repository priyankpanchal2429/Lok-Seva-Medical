/**
 * Purchase Invoice Routes
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getPurchaseInvoices,
  getPurchaseInvoiceById,
  createPurchaseInvoice,
  updatePurchaseInvoice,
  deletePurchaseInvoice,
} = require('../controllers/purchaseInvoiceController');

router.route('/')
  .get(authMiddleware, getPurchaseInvoices)
  .post(authMiddleware, createPurchaseInvoice);

router.route('/:id')
  .get(authMiddleware, getPurchaseInvoiceById)
  .put(authMiddleware, updatePurchaseInvoice)
  .delete(authMiddleware, deletePurchaseInvoice);

module.exports = router;
