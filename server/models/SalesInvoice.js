/**
 * SalesInvoice Model
 * Stores completed and draft sales billing invoices.
 */
const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  batchNo:    { type: String, default: '', trim: true },
  expiry:     { type: String, default: '' },
  qty:        { type: Number, required: true, min: 1 },
  unitPrice:  { type: Number, required: true, min: 0 },
}, { _id: false });

const salesInvoiceSchema = new mongoose.Schema({
  invoiceNumber:   { type: String, required: true, trim: true },
  invoiceDate:     { type: String, required: true },
  patientName:     { type: String, default: '', trim: true },
  patientAge:      { type: String, default: '' },
  patientPhone:    { type: String, default: '' },
  patientAddress:  { type: String, default: '' },
  doctorName:      { type: String, default: '', trim: true },
  items:           { type: [lineItemSchema], default: [] },
  subtotal:        { type: Number, required: true, default: 0 },
  cgst:            { type: Number, required: true, default: 0 },
  sgst:            { type: Number, required: true, default: 0 },
  discountPercent: { type: Number, default: 0 },
  discountAmount:  { type: Number, default: 0 },
  grandTotal:      { type: Number, required: true, default: 0 },
  status:          { type: String, enum: ['draft', 'saved'], default: 'saved' },
  createdBy:       { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('SalesInvoice', salesInvoiceSchema);
