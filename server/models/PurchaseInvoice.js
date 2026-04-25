/**
 * PurchaseInvoice Model
 * Stores completed and draft purchase invoices from suppliers.
 */
const mongoose = require('mongoose');

const purchaseLineItemSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  batchNo:       { type: String, default: '', trim: true },
  expiry:        { type: String, default: '' },
  qty:           { type: Number, required: true, min: 1 },
  purchasePrice: { type: Number, required: true, min: 0 },
  mrp:           { type: Number, default: 0, min: 0 },
}, { _id: false });

const purchaseInvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, default: '', trim: true },
  invoiceDate:   { type: String, required: true },
  supplierName:  { type: String, default: '', trim: true },
  supplierPhone: { type: String, default: '' },
  supplierGst:   { type: String, default: '', trim: true },
  items:         { type: [purchaseLineItemSchema], default: [] },
  subtotal:      { type: Number, required: true, default: 0 },
  cgst:          { type: Number, required: true, default: 0 },
  sgst:          { type: Number, required: true, default: 0 },
  grandTotal:    { type: Number, required: true, default: 0 },
  amountPaid:    { type: Number, default: 0 },
  balance:       { type: Number, default: 0 },
  status:        { type: String, enum: ['draft', 'saved'], default: 'saved' },
  receivedBy:    { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('PurchaseInvoice', purchaseInvoiceSchema);
