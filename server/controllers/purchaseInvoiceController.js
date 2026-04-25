/**
 * purchaseInvoiceController
 * CRUD handlers for Purchase Invoice records.
 */
const PurchaseInvoice = require('../models/PurchaseInvoice');

// @desc  Get all purchase invoices (newest first)
// @route GET /api/purchase-invoices
const getPurchaseInvoices = async (req, res) => {
  try {
    const invoices = await PurchaseInvoice.find({}).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get single purchase invoice by ID
// @route GET /api/purchase-invoices/:id
const getPurchaseInvoiceById = async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Create a new purchase invoice
// @route POST /api/purchase-invoices
const createPurchaseInvoice = async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.create(req.body);
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc  Update a purchase invoice
// @route PUT /api/purchase-invoices/:id
const updatePurchaseInvoice = async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc  Delete a purchase invoice
// @route DELETE /api/purchase-invoices/:id
const deletePurchaseInvoice = async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getPurchaseInvoices,
  getPurchaseInvoiceById,
  createPurchaseInvoice,
  updatePurchaseInvoice,
  deletePurchaseInvoice,
};
