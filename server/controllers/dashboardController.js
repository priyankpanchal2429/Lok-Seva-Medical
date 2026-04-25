/**
 * dashboardController
 * Aggregation handlers for dashboard KPI data.
 */
const SalesInvoice = require('../models/SalesInvoice');
const PurchaseInvoice = require('../models/PurchaseInvoice');

/**
 * Categorise an invoice into an aging bucket based on its date.
 * @param {string} invoiceDate - "YYYY-MM-DD" format
 * @returns {'current'|'1-15'|'16-30'|'30+'} bucket key
 */
const getAgingBucket = (invoiceDate) => {
  const now = new Date();
  const invDate = new Date(invoiceDate + 'T00:00:00');
  const diffMs = now - invDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'current';
  if (diffDays <= 15) return '1-15';
  if (diffDays <= 30) return '16-30';
  return '30+';
};

// @desc  Get outstanding summary for dashboard
// @route GET /api/dashboard/outstanding
const getOutstanding = async (_req, res) => {
  try {
    // ---- Sales Outstanding (Receivables) ----
    // Since SalesInvoice has no amountPaid/balance fields,
    // grandTotal represents the full receivable amount.
    const salesInvoices = await SalesInvoice.find({ status: 'saved' })
      .select('grandTotal invoiceDate')
      .lean();

    const salesAging = { current: 0, '1-15': 0, '16-30': 0, '30+': 0 };
    let salesTotalOutstanding = 0;

    for (const inv of salesInvoices) {
      const amount = inv.grandTotal || 0;
      salesTotalOutstanding += amount;
      const bucket = getAgingBucket(inv.invoiceDate);
      salesAging[bucket] += amount;
    }

    // ---- Purchase Outstanding (Payables) ----
    // PurchaseInvoice has a `balance` field — only include where balance > 0.
    const purchaseInvoices = await PurchaseInvoice.find({
      status: 'saved',
      balance: { $gt: 0 },
    })
      .select('balance invoiceDate')
      .lean();

    const purchaseAging = { current: 0, '1-15': 0, '16-30': 0, '30+': 0 };
    let purchaseTotalOutstanding = 0;

    for (const inv of purchaseInvoices) {
      const amount = inv.balance || 0;
      purchaseTotalOutstanding += amount;
      const bucket = getAgingBucket(inv.invoiceDate);
      purchaseAging[bucket] += amount;
    }

    res.json({
      sales: {
        total: salesTotalOutstanding,
        aging: salesAging,
        invoiceCount: salesInvoices.length,
      },
      purchase: {
        total: purchaseTotalOutstanding,
        aging: purchaseAging,
        invoiceCount: purchaseInvoices.length,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getOutstanding };
