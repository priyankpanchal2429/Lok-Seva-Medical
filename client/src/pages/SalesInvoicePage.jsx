/**
 * SalesInvoicePage Component
 * Comprehensive Point-of-Sale invoice interface for pharmacy billing.
 * Allows adding medicines, calculating taxes, discounts, and printing invoices.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import DatePicker from '../components/DatePicker';
import SalesInvoiceHistoryPage from './SalesInvoiceHistoryPage';

// ============================================================
// SVG Icons
// ============================================================

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
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

const PrinterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);

const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const ClearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// ============================================================
// Utility: Generate Invoice Number
// ============================================================
const generateInvoiceNumber = () => {
  const now = new Date();
  const datePart = now.toISOString().slice(2, 10).replace(/-/g, '');
  const randomPart = Math.floor(Math.random() * 9000 + 1000);
  return `INV-${datePart}-${randomPart}`;
};

// ============================================================
// Component
// ============================================================
export default function SalesInvoicePage() {
  const { user } = useOutletContext();
  const searchInputRef = useRef(null);

  // Tab state: 'history' is the default view; 'create' shows the form
  const [activeTab, setActiveTab] = useState('history');

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Invoice metadata
  const [invoiceNumber] = useState(generateInvoiceNumber);
  const [invoiceDate] = useState(() => new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }));

  // Patient info
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [phoneWarning, setPhoneWarning] = useState('');
  const [doctorName, setDoctorName] = useState('');

  // Patient Search State
  const [allPatients, setAllPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showPatientResults, setShowPatientResults] = useState(false);
  const patientSearchRef = useRef(null);

  // Load patients for search
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await fetch('/api/patients', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('lok-seva-token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAllPatients(data);
        }
      } catch (err) {
        console.error('Error fetching patients for search:', err);
      }
    };
    loadPatients();
  }, []);

  // Handle click outside patient search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (patientSearchRef.current && !patientSearchRef.current.contains(event.target)) {
        setShowPatientResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** Handle Patient Search as user types */
  const handlePatientSearch = (value) => {
    setPatientName(value);
    if (value.trim().length > 0) {
      const filtered = allPatients.filter(p => 
        p.fullName.toLowerCase().includes(value.toLowerCase()) || 
        p.phoneNumber.includes(value)
      );
      setFilteredPatients(filtered);
      setShowPatientResults(true);
    } else {
      setShowPatientResults(false);
    }
  };

  /** Select patient from search results */
  const selectPatient = (patient) => {
    setPatientName(patient.fullName);
    setPatientAge(patient.age || '');
    setPatientPhone(patient.phoneNumber || '');
    setPatientAddress(patient.fullAddress || '');
    setPhoneWarning('');
    setShowPatientResults(false);
  };

  /** Only allow digits in phone field, show warning otherwise */
  const handlePhoneChange = useCallback((e) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, '');
    if (raw !== digitsOnly) {
      setPhoneWarning('Only numbers are allowed');
    } else {
      setPhoneWarning('');
    }
    setPatientPhone(digitsOnly);
  }, []);

  // Medicine search
  const [searchQuery, setSearchQuery] = useState('');

  // Invoice line items
  const [items, setItems] = useState([]);

  // Discount
  const [discountPercent, setDiscountPercent] = useState(0);

  // ---- Item Management ----

  /** Add a blank item row */
  const handleAddItem = useCallback(() => {
    setItems(prev => [...prev, {
      id: Date.now(),
      name: '',
      batchNo: '',
      expiry: '',
      qty: 1,
      unitPrice: 0,
    }]);
    // Auto-focus search after adding
    setTimeout(() => searchInputRef.current?.focus(), 50);
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
    setPatientName('');
    setPatientAge('');
    setPatientPhone('');
    setPatientAddress('');
    setDoctorName('');
    setDiscountPercent(0);
    setSearchQuery('');
  }, []);

  // ---- Calculations ----
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
  const cgst = subtotal * 0.06;  // 6% CGST
  const sgst = subtotal * 0.06;  // 6% SGST
  const taxTotal = cgst + sgst;
  const discountAmount = subtotal * (discountPercent / 100);
  const grandTotal = subtotal + taxTotal - discountAmount;

  /** Build the payload object to send to the API */
  const buildPayload = useCallback((status) => ({
    invoiceNumber,
    invoiceDate,
    patientName,
    patientAge,
    patientPhone,
    patientAddress,
    doctorName,
    items: items.map(({ id, ...rest }) => rest), // strip client-only id
    subtotal,
    cgst,
    sgst,
    discountPercent,
    discountAmount,
    grandTotal,
    status,
    createdBy: user?.name || '',
  }), [invoiceNumber, invoiceDate, patientName, patientAge, patientPhone,
       patientAddress, doctorName, items, subtotal, cgst, sgst,
       discountPercent, discountAmount, grandTotal, user]);

  /** Save to API with given status, optional callback on success */
  const saveInvoice = useCallback(async (status, onSuccess) => {
    if (items.length === 0) {
      setSaveError('Please add at least one item before saving.');
      return;
    }
    setSaveError('');
    setIsSaving(true);
    try {
      const res = await fetch('/api/sales-invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('lok-seva-token')}`,
        },
        body: JSON.stringify(buildPayload(status)),
      });
      if (!res.ok) throw new Error('Failed to save invoice');
      if (onSuccess) onSuccess();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  }, [items, buildPayload]);

  const handleSaveDraft = useCallback(() => {
    saveInvoice('draft', () => setActiveTab('history'));
  }, [saveInvoice]);

  const handleSaveAndPrint = useCallback(() => {
    saveInvoice('saved', () => {
      window.print();
      setActiveTab('history');
    });
  }, [saveInvoice]);

  return (
    <div className="si-page">
      {/* ===== Page Header ===== */}
      <div className="si-page-header">
        <div>
          <h2 className="si-page-title">Sales Invoice</h2>
          <p className="si-page-subtitle">
            {activeTab === 'history' ? 'All saved and draft invoices' : 'Create a new billing invoice'}
          </p>
        </div>
        <div className="si-header-actions">
          {activeTab === 'history' ? (
            /* History view — single Add New button */
            <button className="si-btn si-btn-primary" onClick={() => setActiveTab('create')}>
              + Add New Invoice
            </button>
          ) : (
            /* Create form — action buttons + Back */
            <>
              {saveError && <span style={{ fontSize: '13px', color: 'var(--color-danger)' }}>{saveError}</span>}
              <button className="si-btn si-btn-outline" onClick={() => setActiveTab('history')} disabled={isSaving}>
                ← Back
              </button>
              <button className="si-btn si-btn-outline" onClick={handleClearInvoice} disabled={isSaving}>
                <ClearIcon /><span>Clear</span>
              </button>
              <button className="si-btn si-btn-secondary" onClick={handleSaveDraft} disabled={isSaving}>
                <SaveIcon /><span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
              </button>
              <button className="si-btn si-btn-primary" onClick={handleSaveAndPrint} disabled={isSaving}>
                <PrinterIcon /><span>{isSaving ? 'Saving...' : 'Save & Print'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ===== History View ===== */}
      {activeTab === 'history' && (
        <SalesInvoiceHistoryPage embedded onNewInvoice={() => setActiveTab('create')} />
      )}

      {/* ===== Create Invoice Form ===== */}
      {activeTab === 'create' && <>

      {/* ===== Invoice Meta + Patient Info ===== */}
      <div className="si-meta-row">
        {/* Invoice Info Card */}
        <div className="si-card si-invoice-info">
          <h3 className="si-card-title">Invoice Details</h3>
          <div className="si-field-row">
            <div className="si-field">
              <label className="si-label">Invoice No.</label>
              <input className="si-input" type="text" value={invoiceNumber} readOnly />
            </div>
            <div className="si-field">
              <label className="si-label">Date</label>
              <input className="si-input" type="text" value={invoiceDate} readOnly />
            </div>
            <div className="si-field">
              <label className="si-label">Billed By</label>
              <input className="si-input" type="text" value={user?.name || 'Staff'} readOnly />
            </div>
          </div>
        </div>

        {/* Patient Info Card */}
        <div className="si-card si-patient-info">
          <h3 className="si-card-title">Patient Details</h3>
          <div className="si-field-grid">
            <div className="si-field si-pos-relative" ref={patientSearchRef}>
              <label className="si-label">Patient Name</label>
              <input
                id="patient-name"
                className="si-input"
                type="text"
                placeholder="Search or enter name"
                value={patientName}
                onChange={(e) => handlePatientSearch(e.target.value)}
                autoComplete="off"
              />
              {showPatientResults && filteredPatients.length > 0 && (
                <div className="si-search-results">
                  {filteredPatients.map(p => (
                    <div 
                      key={p._id} 
                      className="si-search-item"
                      onClick={() => selectPatient(p)}
                    >
                      <div className="si-search-item-name">{p.fullName}</div>
                      <div className="si-search-item-meta">{p.phoneNumber} • {p.age} Yrs</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="si-field">
              <label className="si-label">Age</label>
              <input
                className="si-input"
                type="number"
                placeholder="Yrs"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
              />
            </div>
            <div className="si-field">
              <label className="si-label">Phone Number</label>
              <input
                id="patient-phone"
                className={`si-input ${phoneWarning ? 'si-input-warn' : ''}`}
                type="tel"
                placeholder="Phone"
                value={patientPhone}
                onChange={handlePhoneChange}
                maxLength={10}
              />
              {phoneWarning && <span className="si-field-warning">{phoneWarning}</span>}
            </div>
            <div className="si-field">
              <label className="si-label">Prescribing Doctor</label>
              <input
                id="doctor-name"
                className="si-input"
                type="text"
                placeholder="Dr."
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
              />
            </div>
          </div>
          <div className="si-field mt-12">
            <label className="si-label">Full Address</label>
            <input
              className="si-input"
              type="text"
              placeholder="Enter full address"
              value={patientAddress}
              onChange={(e) => setPatientAddress(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ===== Medicine Search + Add ===== */}
      <div className="si-card si-search-section">
        <div className="si-search-bar">
          <SearchIcon />
          <input
            ref={searchInputRef}
            id="medicine-search"
            className="si-search-input"
            type="text"
            placeholder="Search medicine by name, batch, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="si-btn si-btn-primary si-add-btn" onClick={handleAddItem}>
          <PlusIcon />
          <span>Add Item</span>
        </button>
      </div>

      {/* ===== Invoice Table ===== */}
      <div className="si-card si-table-card">
        <table className="si-table">
          <thead>
            <tr>
              <th className="si-th si-align-center" style={{ width: '40px' }}>#</th>
              <th className="si-th si-align-left">Medicine Name</th>
              <th className="si-th si-align-center" style={{ width: '180px' }}>Batch No.</th>
              <th className="si-th si-align-center" style={{ width: '180px' }}>Expiry</th>
              <th className="si-th si-align-center" style={{ width: '100px' }}>Qty</th>
              <th className="si-th si-align-center" style={{ width: '140px' }}>Unit Price (₹)</th>
              <th className="si-th si-align-right" style={{ width: '110px' }}>Total (₹)</th>
              <th className="si-th si-align-center" style={{ width: '190px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="8" className="si-empty-row">
                  <p>No items added yet.</p>
                  <p className="si-empty-hint">Click "Add Item" or search for medicines above.</p>
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
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                    />
                  </td>
                  <td className="si-td si-align-right si-td-total">
                    ₹{(item.qty * item.unitPrice).toFixed(2)}
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
          <div className="si-summary-line si-summary-discount">
            <span>Discount</span>
            <div className="si-discount-input-group">
              <input
                id="discount-percent"
                className="si-discount-input"
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
              />
              <span className="si-discount-symbol">%</span>
              <span className="si-discount-amount">- ₹{discountAmount.toFixed(2)}</span>
            </div>
          </div>
          <div className="si-summary-divider"></div>
          <div className="si-summary-line si-summary-grand">
            <span>Grand Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
      </>}
    </div>
  );
}
