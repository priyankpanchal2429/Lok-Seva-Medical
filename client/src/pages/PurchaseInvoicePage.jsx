/**
 * PurchaseInvoicePage Component
 * Point-of-Sale style purchase interface.
 * Allows manually adding medicines or uploading an Excel file to automatically populate rows.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import DatePicker from '../components/DatePicker';
import * as XLSX from 'xlsx';
import api from '../utils/api';
import PurchaseInvoiceHistoryPage from './PurchaseInvoiceHistoryPage';

// ============================================================
// SVG Icons (reused from Sales Invoice pattern)
// ============================================================

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const ClearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

// ============================================================
// Component
// ============================================================
export default function PurchaseInvoicePage() {
  const { user } = useOutletContext();
  const fileInputRef = useRef(null);

  // Tab state: 'history' is the default view; 'create' shows the form
  const [activeTab, setActiveTab] = useState('history');

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);

  // Invoice Meta State
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierGst, setSupplierGst] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Items State
  const [items, setItems] = useState([]);
  
  // Totals State
  const [amountPaid, setAmountPaid] = useState(0);

  // ---- Calculations ----
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.purchasePrice), 0);
  const cgst = subtotal * 0.06;
  const sgst = subtotal * 0.06;
  const grandTotal = subtotal + cgst + sgst;
  const balance = grandTotal - amountPaid;

  // ---- Item Management ----

  /** Add a blank item row */
  const handleAddItem = useCallback(() => {
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      name: '',
      batchNo: '',
      expiry: '',
      qty: 1,
      purchasePrice: 0,
      mrp: 0,
    }]);
  }, []);

  /** Update a specific field on an item */
  const handleUpdateItem = useCallback((id, field, value) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  }, []);

  /** Remove an item by id */
  const handleRemoveItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  /** Clear entire invoice */
  const handleClearInvoice = useCallback(() => {
    setItems([]);
    setSupplierName('');
    setSupplierPhone('');
    setSupplierGst('');
    setInvoiceNumber('');
    setAmountPaid(0);
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setEditingInvoiceId(null);
  }, []);

  const handleEditPurchase = useCallback((invoice) => {
    setEditingInvoiceId(invoice._id);
    setInvoiceNumber(invoice.invoiceNumber || '');
    // Convert date if needed or use as is
    setInvoiceDate(invoice.invoiceDate || new Date().toISOString().split('T')[0]);
    setSupplierName(invoice.supplierName || '');
    setSupplierPhone(invoice.supplierPhone || '');
    setSupplierGst(invoice.supplierGst || '');
    setItems(invoice.items.map(i => ({ ...i, id: i.id || Date.now().toString() + Math.random() })));
    setAmountPaid(invoice.amountPaid || 0);
    setActiveTab('create');
  }, []);

  const medicineSearchRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [medicineResults, setMedicineResults] = useState([]);
  const [showMedicineResults, setShowMedicineResults] = useState(false);

  useEffect(() => {
    const fetchMeds = async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const { data } = await api.get(`/medicines?search=${searchQuery}`);
          setMedicineResults(data);
          setShowMedicineResults(true);
        } catch (err) {
          console.error(err);
        }
      } else {
        setMedicineResults([]);
        setShowMedicineResults(false);
      }
    };
    const delayDebounce = setTimeout(fetchMeds, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (medicineSearchRef.current && !medicineSearchRef.current.contains(event.target)) {
        setShowMedicineResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---- Excel File Upload ----

  /** Parse uploaded Excel/CSV and populate item rows */
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        
        // Assume first sheet is the relevant one
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert to JSON. Headers are assumed to be in row 1.
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Map Excel rows to our item structure.
        // Flexibly match common column names.
        const mappedItems = data.map((row, index) => {
          const name = row['Medicine Name'] || row['Item Name'] || row['Product'] || row['Name'] || '';
          const batchNo = row['Batch No'] || row['Batch'] || row['Batch Number'] || '';
          const expiry = row['Expiry'] || row['Exp Date'] || row['EXP'] || '';
          const qty = parseInt(row['Qty'] || row['Quantity'] || row['QTY']) || 1;
          const purchasePrice = parseFloat(row['Purchase Price'] || row['Price'] || row['Rate']) || 0;
          const mrp = parseFloat(row['MRP'] || row['Selling Price']) || 0;

          return {
            id: `excel-${Date.now()}-${index}`,
            name,
            batchNo: String(batchNo),
            expiry: String(expiry),
            qty,
            purchasePrice,
            mrp,
          };
        }).filter(item => item.name); // Filter out rows without a medicine name

        if (mappedItems.length > 0) {
          setItems(prev => [...prev, ...mappedItems]);
        } else {
          alert("Could not extract items. Please check if the Excel file has valid headers (e.g. 'Medicine Name', 'Qty', 'Purchase Price').");
        }
      } catch (error) {
        console.error("Error reading Excel file:", error);
        alert("Error parsing the file. Make sure it is a valid Excel file.");
      }
      // Reset input so the same file can be uploaded again if needed
      e.target.value = null;
    };
    reader.readAsBinaryString(file);
  }, []);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /** Save purchase invoice to API */
  const handleSavePurchase = useCallback(async () => {
    if (items.length === 0) {
      setSaveError('Please add at least one item before saving.');
      return;
    }
    setSaveError('');
    setIsSaving(true);
    try {
      const payload = {
        invoiceNumber,
        invoiceDate,
        supplierName,
        supplierPhone,
        supplierGst,
        items: items.map(item => {
          const copy = { ...item };
          delete copy.id;
          return copy;
        }),
        subtotal,
        cgst,
        sgst,
        grandTotal,
        amountPaid,
        balance,
        status: 'saved',
        receivedBy: user?.name || '',
      };
      
      if (editingInvoiceId) {
        await api.put(`/purchase-invoices/${editingInvoiceId}`, payload);
      } else {
        await api.post('/purchase-invoices', payload);
      }
      
      setItems([]);
      setSupplierName('');
      setSupplierPhone('');
      setSupplierGst('');
      setInvoiceNumber('');
      setAmountPaid(0);
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      setEditingInvoiceId(null);
      setActiveTab('history');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  }, [items, invoiceNumber, invoiceDate, supplierName, supplierPhone, supplierGst,
      subtotal, cgst, sgst, grandTotal, amountPaid, balance, user, editingInvoiceId]);

  return (
    <div className="si-page">
      {/* Hidden file input */}
      <input type="file" accept=".xlsx, .xls, .csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />

      {/* ===== Page Header ===== */}
      <div className="si-page-header">
        <div>
          <h2 className="si-page-title">Purchase Invoice</h2>
          <p className="si-page-subtitle">
            {activeTab === 'history' ? 'All saved purchase invoices' : 'Record incoming stock and supplier invoices'}
          </p>
        </div>
        <div className="si-header-actions">
          {activeTab === 'history' ? (
            <button className="si-btn si-btn-primary" onClick={() => { handleClearInvoice(); setActiveTab('create'); }}>
              + Add New Purchase
            </button>
          ) : (
            <>
              {saveError && <span style={{ fontSize: '13px', color: 'var(--color-danger)' }}>{saveError}</span>}
              <button className="si-btn si-btn-outline" onClick={() => setActiveTab('history')} disabled={isSaving}>
                ← Back
              </button>
              <button className="si-btn si-btn-outline" onClick={handleClearInvoice} disabled={isSaving}>
                <ClearIcon /><span>Clear</span>
              </button>
              <button className="si-btn si-btn-secondary" onClick={triggerFileInput} disabled={isSaving}>
                <UploadIcon /><span>Upload Excel</span>
              </button>
              <button className="si-btn si-btn-primary" onClick={handleSavePurchase} disabled={isSaving}>
                <SaveIcon /><span>{isSaving ? 'Saving...' : 'Save Purchase'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ===== History View ===== */}
      {activeTab === 'history' && (
        <PurchaseInvoiceHistoryPage 
          embedded 
          onNewPurchase={() => { handleClearInvoice(); setActiveTab('create'); }} 
          onEditPurchase={handleEditPurchase}
        />
      )}

      {/* ===== Create Form ===== */}
      {activeTab === 'create' && <>

      {/* ===== Supplier & Invoice Meta ===== */}
      <div className="si-meta-row">
        {/* Invoice Info Card */}
        <div className="si-card si-invoice-info">
          <h3 className="si-card-title">Invoice Details</h3>
          <div className="si-field-row">
            <div className="si-field">
              <label className="si-label">Invoice No.</label>
              <input
                className="si-input"
                type="text"
                placeholder="INV-XXXX"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
            <div className="si-field">
              <label className="si-label">Date</label>
              <DatePicker
                value={invoiceDate}
                onChange={(val) => setInvoiceDate(val)}
                mode="date"
                placeholder="Select date"
                className="si-input"
              />
            </div>
            <div className="si-field">
              <label className="si-label">Received By</label>
              <input className="si-input" type="text" value={user?.name || 'Staff'} readOnly />
            </div>
          </div>
        </div>

        {/* Supplier Info Card */}
        <div className="si-card si-patient-info">
          <h3 className="si-card-title">Supplier Details</h3>
          <div className="si-field-row">
            <div className="si-field">
              <label className="si-label">Supplier Name</label>
              <input
                className="si-input"
                type="text"
                placeholder="Enter distributor name"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
            </div>
            <div className="si-field">
              <label className="si-label">Contact Number</label>
              <input
                className="si-input"
                type="tel"
                placeholder="Phone"
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
                maxLength={10}
              />
            </div>
            <div className="si-field">
              <label className="si-label">GSTIN</label>
              <input
                className="si-input"
                type="text"
                placeholder="GST Number"
                value={supplierGst}
                onChange={(e) => setSupplierGst(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== Add Item Bar ===== */}
      <div className="si-card si-search-section">
        <div className="si-search-bar" ref={medicineSearchRef} style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)' }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            className="si-search-input"
            type="text"
            placeholder="Search medicine by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (medicineResults.length > 0) setShowMedicineResults(true); }}
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: 'var(--color-text)' }}
          />
          {showMedicineResults && medicineResults.length > 0 && (
            <div className="si-autocomplete-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '6px', maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginTop: '4px' }}>
              {medicineResults.map(med => (
                <div 
                  key={med._id} 
                  className="si-autocomplete-item" 
                  style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid var(--color-border)' }}
                  onClick={() => {
                    setItems(prev => [...prev, {
                      id: Date.now().toString(),
                      name: med.name,
                      batchNo: med.batchNo || '',
                      expiry: med.expiry || '',
                      qty: 1,
                      purchasePrice: med.purchasePrice || 0,
                      mrp: med.mrp || 0,
                    }]);
                    setSearchQuery('');
                    setShowMedicineResults(false);
                  }}
                >
                  <div style={{ fontWeight: '600', color: 'var(--color-text)' }}>{med.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', gap: '10px' }}>
                    <span>Stock: {med.stockQty}</span>
                    <span>Purchase: ₹{med.purchasePrice}</span>
                    <span>MRP: ₹{med.mrp}</span>
                    {med.batchNo && <span>Batch: {med.batchNo}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="si-btn si-btn-primary si-add-btn" onClick={handleAddItem}>
          <PlusIcon />
          <span>Add Custom Item</span>
        </button>
      </div>

      {/* ===== Invoice Table ===== */}
      <div className="si-card si-table-card">
        <table className="si-table">
          <thead>
            <tr>
              <th className="si-th si-align-center" style={{ width: '40px' }}>#</th>
              <th className="si-th si-align-left">Medicine Name</th>
              <th className="si-th si-align-center" style={{ width: '130px' }}>Batch No.</th>
              <th className="si-th si-align-center" style={{ width: '140px' }}>Expiry</th>
              <th className="si-th si-align-center" style={{ width: '80px' }}>Qty</th>
              <th className="si-th si-align-center" style={{ width: '130px' }}>Purchase Price</th>
              <th className="si-th si-align-center" style={{ width: '110px' }}>MRP</th>
              <th className="si-th si-align-right" style={{ width: '110px' }}>Total (₹)</th>
              <th className="si-th si-align-center" style={{ width: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="9" className="si-empty-row">
                  <p>No items added yet.</p>
                  <p className="si-empty-hint">Click "Add Item" or "Upload Excel" to begin.</p>
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id} className="si-table-row">
                  <td className="si-td si-align-center">{index + 1}</td>
                  <td className="si-td si-align-left">
                    <input
                      className="si-table-input"
                      type="text"
                      placeholder="Medicine name"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                    />
                  </td>
                  <td className="si-td si-align-center">
                    <input
                      className="si-table-input"
                      type="text"
                      placeholder="Batch"
                      value={item.batchNo}
                      onChange={(e) => handleUpdateItem(item.id, 'batchNo', e.target.value)}
                    />
                  </td>
                  <td className="si-td si-align-center">
                    <DatePicker
                      value={item.expiry}
                      onChange={(val) => handleUpdateItem(item.id, 'expiry', val)}
                      mode="month"
                      placeholder="MM/YYYY"
                      className="si-table-input"
                    />
                  </td>
                  <td className="si-td si-align-center">
                    <input
                      className="si-table-input"
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleUpdateItem(item.id, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                      onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                    />
                  </td>
                  <td className="si-td si-align-center">
                    <input
                      className="si-table-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.purchasePrice}
                      onChange={(e) => handleUpdateItem(item.id, 'purchasePrice', parseFloat(e.target.value) || 0)}
                      onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                    />
                  </td>
                  <td className="si-td si-align-center">
                    <input
                      className="si-table-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.mrp}
                      onChange={(e) => handleUpdateItem(item.id, 'mrp', parseFloat(e.target.value) || 0)}
                      onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                    />
                  </td>
                  <td className="si-td si-align-right si-td-total">
                    ₹{(item.qty * item.purchasePrice).toFixed(2)}
                  </td>
                  <td className="si-td si-align-center">
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        className="si-btn-outline si-btn-sm"
                        title="Edit item"
                        style={{ padding: '4px 6px', border: 'none', background: 'transparent' }}
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="si-delete-btn"
                        onClick={() => handleRemoveItem(item.id)}
                        title="Remove item"
                      >
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

      {/* ===== Summary / Totals ===== */}
      <div className="si-summary-row">
        <div className="si-summary-spacer"></div>
        <div className="si-card si-summary-card">
          <div className="si-summary-line">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="si-summary-line">
            <span>CGST (6%)</span>
            <span>₹{cgst.toFixed(2)}</span>
          </div>
          <div className="si-summary-line">
            <span>SGST (6%)</span>
            <span>₹{sgst.toFixed(2)}</span>
          </div>
          <div className="si-summary-divider"></div>
          <div className="si-summary-line si-summary-grand">
            <span>Grand Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>

          {/* Payment tracking (purchase-specific) */}
          <div className="si-summary-divider"></div>
          <div className="si-summary-line si-summary-payment">
            <span>Amount Paid</span>
            <div className="si-discount-input-group">
              <span className="si-discount-symbol">₹</span>
              <input
                className="si-discount-input"
                type="number"
                min="0"
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
              />
            </div>
          </div>
          <div className="si-summary-line si-summary-grand">
            <span>Balance Due</span>
            <span className={balance > 0 ? 'si-text-due' : ''}>₹{balance.toFixed(2)}</span>
          </div>
        </div>
      </div>
      </>}
    </div>
  );
}
