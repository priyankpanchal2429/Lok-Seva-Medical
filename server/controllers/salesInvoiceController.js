/**
 * salesInvoiceController
 * CRUD handlers for Sales Invoice records.
 */
const SalesInvoice = require('../models/SalesInvoice');
const Medicine = require('../models/Medicine');

// @desc  Get all sales invoices (newest first)
// @route GET /api/sales-invoices
const getSalesInvoices = async (req, res) => {
  try {
    const invoices = await SalesInvoice.find({}).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get single sales invoice by ID
// @route GET /api/sales-invoices/:id
const getSalesInvoiceById = async (req, res) => {
  try {
    const invoice = await SalesInvoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Create a new sales invoice
// @route POST /api/sales-invoices
const createSalesInvoice = async (req, res) => {
  try {
    const invoice = await SalesInvoice.create(req.body);

    if (invoice.status === 'saved' && invoice.items && invoice.items.length > 0) {
      for (const item of invoice.items) {
        if (!item.name) continue;
        await Medicine.findOneAndUpdate(
          { name: item.name },
          { $inc: { stockQty: -(item.qty || 0) } }
        );
      }
    }

    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc  Update a sales invoice
// @route PUT /api/sales-invoices/:id
const updateSalesInvoice = async (req, res) => {
  try {
    const invoice = await SalesInvoice.findByIdAndUpdate(
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

// @desc  Delete a sales invoice
// @route DELETE /api/sales-invoices/:id
const deleteSalesInvoice = async (req, res) => {
  try {
    const invoice = await SalesInvoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    if (invoice.status === 'saved' && invoice.items && invoice.items.length > 0) {
      for (const item of invoice.items) {
        if (!item.name) continue;
        await Medicine.findOneAndUpdate(
          { name: item.name },
          { $inc: { stockQty: item.qty || 0 } }
        );
      }
    }

    await invoice.deleteOne();
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getSalesInvoices,
  getSalesInvoiceById,
  createSalesInvoice,
  updateSalesInvoice,
  deleteSalesInvoice,
};
