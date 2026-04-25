/**
 * Sales Invoice Routes
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getSalesInvoices,
  getSalesInvoiceById,
  createSalesInvoice,
  updateSalesInvoice,
  deleteSalesInvoice,
} = require('../controllers/salesInvoiceController');

router.route('/')
  .get(protect, getSalesInvoices)
  .post(protect, createSalesInvoice);

router.route('/:id')
  .get(protect, getSalesInvoiceById)
  .put(protect, updateSalesInvoice)
  .delete(protect, deleteSalesInvoice);

module.exports = router;
