/**
 * SalesInvoiceHistoryPage
 * Lists all saved sales invoices with search, view/reprint, edit, and delete.
 */

import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../utils/api';

// ============================================================
// SVG Icons
// ============================================================
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
const PrintIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);
const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// ============================================================
// API Calls
// ============================================================
const fetchInvoices = async () => {
  const { data } = await api.get('/sales-invoices');
  return data;
};

const deleteInvoice = async (id) => {
  const { data } = await api.delete(`/sales-invoices/${id}`);
  return data;
};

// ============================================================
// Invoice Detail Modal (view + print)
// ============================================================
function InvoiceDetailModal({ invoice, onClose }) {
  if (!invoice) return null;

  const handlePrint = () => {
    // Build a clean printable window
    const win = window.open('', '_blank', 'width=800,height=600');
    win.document.write(`
      <html><head><title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 24px; color: #000; }
        h1 { font-size: 22px; text-align: center; margin-bottom: 4px; }
        .sub { text-align: center; font-size: 13px; margin-bottom: 20px; color: #555; }
        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .meta-box { border: 1px solid #ddd; border-radius: 6px; padding: 12px; }
        .meta-box strong { display: block; margin-bottom: 6px; font-size: 13px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 4px; }
        .meta-row { font-size: 13px; margin: 4px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { background: #f4f4f4; border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
        td { border: 1px solid #ddd; padding: 8px; font-size: 13px; }
        .totals { float: right; width: 280px; }
        .t-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
        .t-total { font-size: 16px; font-weight: bold; border-top: 2px solid #000; padding-top: 8px; margin-top: 4px; }
        @media print { button { display: none; } }
      </style></head><body>
      <h1>Lok Seva Medical Store</h1>
      <p class="sub">Sales Invoice</p>
      <div class="meta">
        <div class="meta-box">
          <strong>Invoice Details</strong>
          <div class="meta-row"><b>Invoice No:</b> ${invoice.invoiceNumber}</div>
          <div class="meta-row"><b>Date:</b> ${invoice.invoiceDate}</div>
          <div class="meta-row"><b>Billed By:</b> ${invoice.createdBy || '-'}</div>
        </div>
        <div class="meta-box">
          <strong>Patient Details</strong>
          <div class="meta-row"><b>Name:</b> ${invoice.patientName || '-'}</div>
          <div class="meta-row"><b>Age:</b> ${invoice.patientAge || '-'}</div>
          <div class="meta-row"><b>Phone:</b> ${invoice.patientPhone || '-'}</div>
          <div class="meta-row"><b>Doctor:</b> ${invoice.doctorName || '-'}</div>
        </div>
      </div>
      <table>
        <thead><tr><th>#</th><th>Medicine</th><th>Batch</th><th>Expiry</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
        <tbody>${invoice.items.map((item, i) => `
          <tr>
            <td>${i + 1}</td><td>${item.name}</td><td>${item.batchNo || '-'}</td>
            <td>${item.expiry || '-'}</td><td>${item.qty}</td>
            <td>₹${Number(item.unitPrice).toFixed(2)}</td>
            <td>₹${(item.qty * item.unitPrice).toFixed(2)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div class="totals">
        <div class="t-row"><span>Subtotal</span><span>₹${Number(invoice.subtotal).toFixed(2)}</span></div>
        <div class="t-row"><span>CGST (6%)</span><span>₹${Number(invoice.cgst).toFixed(2)}</span></div>
        <div class="t-row"><span>SGST (6%)</span><span>₹${Number(invoice.sgst).toFixed(2)}</span></div>
        <div class="t-row"><span>Discount</span><span>-₹${Number(invoice.discountAmount).toFixed(2)}</span></div>
        <div class="t-row t-total"><span>Grand Total</span><span>₹${Number(invoice.grandTotal).toFixed(2)}</span></div>
      </div>
      <script>window.onload = () => { window.print(); window.close(); }</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="pt-modal-overlay" onClick={onClose}>
      <div className="pt-modal" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
        <div className="pt-modal-header">
          <h3>Invoice — {invoice.invoiceNumber}</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="si-btn si-btn-primary si-btn-sm" onClick={handlePrint}>
              <PrintIcon /> <span>Print</span>
            </button>
            <button className="pt-modal-close" onClick={onClose}><CloseIcon /></button>
          </div>
        </div>
        <div className="pt-modal-body">
          {/* Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="si-card" style={{ padding: '16px' }}>
              <p className="si-card-title" style={{ marginBottom: '10px' }}>Invoice Details</p>
              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><span style={{ color: 'var(--color-text-muted)' }}>Invoice No: </span><b>{invoice.invoiceNumber}</b></div>
                <div><span style={{ color: 'var(--color-text-muted)' }}>Date: </span>{invoice.invoiceDate}</div>
                <div><span style={{ color: 'var(--color-text-muted)' }}>Billed By: </span>{invoice.createdBy || '-'}</div>
              </div>
            </div>
            <div className="si-card" style={{ padding: '16px' }}>
              <p className="si-card-title" style={{ marginBottom: '10px' }}>Patient Details</p>
              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><span style={{ color: 'var(--color-text-muted)' }}>Name: </span><b>{invoice.patientName || '-'}</b></div>
                <div><span style={{ color: 'var(--color-text-muted)' }}>Age: </span>{invoice.patientAge || '-'}</div>
                <div><span style={{ color: 'var(--color-text-muted)' }}>Phone: </span>{invoice.patientPhone || '-'}</div>
                <div><span style={{ color: 'var(--color-text-muted)' }}>Doctor: </span>{invoice.doctorName || '-'}</div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="si-card si-table-card" style={{ overflow: 'auto' }}>
            <table className="si-table">
              <thead>
                <tr>
                  <th className="si-th">#</th>
                  <th className="si-th">Medicine</th>
                  <th className="si-th" style={{ textAlign: 'center' }}>Batch</th>
                  <th className="si-th" style={{ textAlign: 'center' }}>Expiry</th>
                  <th className="si-th" style={{ textAlign: 'center' }}>Qty</th>
                  <th className="si-th" style={{ textAlign: 'right' }}>Unit Price</th>
                  <th className="si-th" style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} className="si-table-row">
                    <td className="si-td">{i + 1}</td>
                    <td className="si-td font-medium">{item.name}</td>
                    <td className="si-td" style={{ textAlign: 'center' }}>{item.batchNo || '-'}</td>
                    <td className="si-td" style={{ textAlign: 'center' }}>{item.expiry || '-'}</td>
                    <td className="si-td" style={{ textAlign: 'center' }}>{item.qty}</td>
                    <td className="si-td" style={{ textAlign: 'right' }}>₹{Number(item.unitPrice).toFixed(2)}</td>
                    <td className="si-td si-td-total" style={{ textAlign: 'right' }}>₹{(item.qty * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'Subtotal', value: invoice.subtotal },
                { label: 'CGST (6%)', value: invoice.cgst },
                { label: 'SGST (6%)', value: invoice.sgst },
                { label: `Discount (${invoice.discountPercent}%)`, value: -invoice.discountAmount },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  <span>{label}</span><span>₹{Number(value).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>
                <span>Grand Total</span><span>₹{Number(invoice.grandTotal).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================
export default function SalesInvoiceHistoryPage({ embedded = false, onNewInvoice, onEditInvoice }) {
  useOutletContext();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingInvoice, setViewingInvoice] = useState(null);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchInvoices();
      setInvoices(data);
    } catch (err) {
      console.error(err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadInvoices(), 0);
    return () => clearTimeout(timer);
  }, [loadInvoices]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this invoice?')) return;
    try {
      await deleteInvoice(id);
      setInvoices(prev => prev.filter(inv => inv._id !== id));
    } catch (err) {
      alert(err.message);
    }
  }, []);

  const filtered = invoices.filter(inv =>
    inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.patientPhone?.includes(searchQuery)
  );

  const content = (
    <>
      {/* Search */}
      <div className="si-card si-search-section">
        <div className="si-search-bar">
          <SearchIcon />
          <input
            className="si-search-input"
            type="text"
            placeholder="Search by invoice number, patient name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="si-card si-table-card">
        <table className="si-table">
          <thead>
            <tr>
              <th className="si-th">Invoice No.</th>
              <th className="si-th" style={{ textAlign: 'center' }}>Date</th>
              <th className="si-th">Patient Name</th>
              <th className="si-th" style={{ textAlign: 'center' }}>Phone</th>
              <th className="si-th" style={{ textAlign: 'center' }}>Items</th>
              <th className="si-th" style={{ textAlign: 'right' }}>Grand Total</th>
              <th className="si-th" style={{ textAlign: 'center' }}>Status</th>
              <th className="si-th" style={{ textAlign: 'center', width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="si-empty-row">Loading invoices...</td></tr>
            ) : error ? (
              <tr><td colSpan="8" className="si-empty-row" style={{ color: 'var(--color-danger)' }}>{error}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="8" className="si-empty-row">No invoices found.</td></tr>
            ) : (
              filtered.map(inv => (
                <tr key={inv._id} className="si-table-row">
                  <td className="si-td font-medium">{inv.invoiceNumber}</td>
                  <td className="si-td" style={{ textAlign: 'center' }}>{inv.invoiceDate}</td>
                  <td className="si-td">{inv.patientName || '-'}</td>
                  <td className="si-td" style={{ textAlign: 'center' }}>{inv.patientPhone || '-'}</td>
                  <td className="si-td" style={{ textAlign: 'center' }}>{inv.items?.length ?? 0}</td>
                  <td className="si-td si-td-total" style={{ textAlign: 'right' }}>₹{Number(inv.grandTotal).toFixed(2)}</td>
                  <td className="si-td" style={{ textAlign: 'center' }}>
                    <span className="pt-badge" style={inv.status === 'draft' ? { backgroundColor: 'var(--color-warning)', color: '#fff' } : {}}>
                      {inv.status === 'draft' ? 'Draft' : 'Saved'}
                    </span>
                  </td>
                  <td className="si-td">
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button className="si-btn si-btn-outline si-btn-sm" style={{ padding: '6px 12px' }} title="View & Print" onClick={() => setViewingInvoice(inv)}>
                        <EyeIcon /> <span>View</span>
                      </button>
                      <button className="si-btn si-btn-outline si-btn-sm" style={{ padding: '6px 12px' }} title="Edit" onClick={() => onEditInvoice ? onEditInvoice(inv) : null}>
                        <EditIcon /> <span>Edit</span>
                      </button>
                      <button className="si-btn si-btn-danger-outline si-btn-sm" style={{ padding: '6px 12px' }} title="Delete" onClick={() => handleDelete(inv._id)}>
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewingInvoice && (
        <InvoiceDetailModal invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />
      )}
    </>
  );

  // When embedded inside SalesInvoicePage tabs — skip the outer page wrapper
  if (embedded) return content;

  return (
    <div className="si-page">
      <div className="si-page-header">
        <div>
          <h2 className="si-page-title">Sales Invoice History</h2>
          <p className="si-page-subtitle">View, reprint, edit or delete past sales invoices</p>
        </div>
        <div className="si-header-actions">
          <button className="si-btn si-btn-primary" onClick={onNewInvoice}>
            + New Invoice
          </button>
        </div>
      </div>
      {content}
    </div>
  );
}
