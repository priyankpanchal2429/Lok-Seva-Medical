/**
 * Sales Invoice Routes
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getSalesInvoices,
  getSalesInvoiceById,
  createSalesInvoice,
  updateSalesInvoice,
  deleteSalesInvoice,
} = require('../controllers/salesInvoiceController');

router.route('/')
  .get(authMiddleware, getSalesInvoices)
  .post(authMiddleware, createSalesInvoice);

router.route('/:id')
  .get(authMiddleware, getSalesInvoiceById)
  .put(authMiddleware, updateSalesInvoice)
  .delete(authMiddleware, deleteSalesInvoice);

module.exports = router;
