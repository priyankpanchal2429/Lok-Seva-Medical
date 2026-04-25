/**
 * Medicine Model
 * Master inventory for medicines, auto-updated by invoices.
 */
const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  stockQty: { type: Number, default: 0, min: 0 },
  mrp: { type: Number, default: 0, min: 0 },
  purchasePrice: { type: Number, default: 0, min: 0 },
  batchNo: { type: String, default: '', trim: true },
  expiry: { type: String, default: '' },
}, { timestamps: true });

// Create a text index on name for fast searching
medicineSchema.index({ name: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);
