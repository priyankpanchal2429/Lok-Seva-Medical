/**
 * MedicinesPage Component
 * Full CRUD interface for managing medicine inventory.
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

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
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// ============================================================
// API Calls
// ============================================================
const fetchMedicines = async () => {
  const { data } = await api.get('/medicines');
  return data;
};

const createMedicine = async (payload) => {
  const { data } = await api.post('/medicines', payload);
  return data;
};

const updateMedicine = async (id, payload) => {
  const { data } = await api.put(`/medicines/${id}`, payload);
  return data;
};

const deleteMedicine = async (id) => {
  const { data } = await api.delete(`/medicines/${id}`);
  return data;
};

// ============================================================
// Component
// ============================================================
export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    stockQty: '',
    mrp: '',
    purchasePrice: '',
    batchNo: '',
    expiry: ''
  });

  // Load medicines
  const loadMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMedicines();
      setMedicines(data);
    } catch (err) {
      console.error(err);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadMedicines(), 0);
    return () => clearTimeout(timer);
  }, [loadMedicines]);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open modal for add
  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      name: '', category: '', stockQty: '', mrp: '', purchasePrice: '', batchNo: '', expiry: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleEditClick = (medicine) => {
    setEditingId(medicine._id);
    setFormData({
      name: medicine.name,
      category: medicine.category || '',
      stockQty: medicine.stockQty || 0,
      mrp: medicine.mrp || 0,
      purchasePrice: medicine.purchasePrice || 0,
      batchNo: medicine.batchNo || '',
      expiry: medicine.expiry || ''
    });
    setIsModalOpen(true);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (editingId) {
        await updateMedicine(editingId, payload);
      } else {
        await createMedicine(payload);
      }
      setIsModalOpen(false);
      loadMedicines();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert(msg);
    }
  };

  // Delete medicine
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await deleteMedicine(id);
        loadMedicines();
      } catch (err) {
        const msg = err.response?.data?.error || err.response?.data?.message || err.message;
        alert(msg);
      }
    }
  };

  // Filter medicines
  const filteredMedicines = medicines.filter(m => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.batchNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="si-page">
      {/* Header */}
      <div className="si-page-header">
        <div>
          <h2 className="si-page-title">Medicine Master</h2>
          <p className="si-page-subtitle">View and manage global medicine inventory</p>
        </div>
        <div className="si-header-actions">
          <button className="si-btn si-btn-primary" onClick={handleAddClick}>
            <PlusIcon />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="si-card si-search-section">
        <div className="si-search-bar">
          <SearchIcon />
          <input
            className="si-search-input"
            type="text"
            placeholder="Search medicines by name or batch no..."
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
              <th className="si-th">Medicine Name</th>
              <th className="si-th">Category</th>
              <th className="si-th">Stock Qty</th>
              <th className="si-th">MRP (₹)</th>
              <th className="si-th">Purchase Price (₹)</th>
              <th className="si-th">Batch No</th>
              <th className="si-th">Expiry</th>
              <th className="si-th" style={{ width: '180px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="si-empty-row">Loading medicines...</td>
              </tr>
            ) : filteredMedicines.length === 0 ? (
              <tr>
                <td colSpan="8" className="si-empty-row">No medicines found.</td>
              </tr>
            ) : (
              filteredMedicines.map((medicine) => (
                <tr key={medicine._id} className="si-table-row">
                  <td className="si-td font-medium">{medicine.name}</td>
                  <td className="si-td">{medicine.category || '-'}</td>
                  <td className="si-td">
                    <span className={`pt-badge ${medicine.stockQty <= 5 ? 'pt-badge-inactive' : ''}`} style={medicine.stockQty <= 5 ? { backgroundColor: 'var(--color-danger)', color: '#fff' } : {}}>
                      {medicine.stockQty}
                    </span>
                  </td>
                  <td className="si-td">₹{medicine.mrp}</td>
                  <td className="si-td">₹{medicine.purchasePrice}</td>
                  <td className="si-td">{medicine.batchNo || '-'}</td>
                  <td className="si-td">{medicine.expiry || '-'}</td>
                  <td className="si-td">
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button className="si-btn si-btn-outline si-btn-sm" onClick={() => handleEditClick(medicine)}>
                        <EditIcon />
                        <span>Edit</span>
                      </button>
                      <button className="si-btn si-btn-danger-outline si-btn-sm" onClick={() => handleDelete(medicine._id)}>
                        <TrashIcon />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="pt-modal-overlay">
          <div className="pt-modal" style={{ maxWidth: '600px' }}>
            <div className="pt-modal-header">
              <h3 className="pt-modal-title">{editingId ? 'Edit Medicine' : 'Add New Medicine'}</h3>
              <button className="pt-modal-close" onClick={() => setIsModalOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="pt-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="si-field">
                  <label className="si-label">Medicine Name *</label>
                  <input
                    className="si-input"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="si-field">
                  <label className="si-label">Category</label>
                  <input
                    className="si-input"
                    type="text"
                    name="category"
                    placeholder="e.g. Antibiotic"
                    value={formData.category}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="si-field">
                  <label className="si-label">Stock Qty</label>
                  <input
                    className="si-input"
                    type="number"
                    name="stockQty"
                    value={formData.stockQty}
                    onChange={handleChange}
                  />
                </div>
                <div className="si-field">
                  <label className="si-label">MRP (₹)</label>
                  <input
                    className="si-input"
                    type="number"
                    name="mrp"
                    step="0.01"
                    value={formData.mrp}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="si-field">
                  <label className="si-label">Purchase Price (₹)</label>
                  <input
                    className="si-input"
                    type="number"
                    name="purchasePrice"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                  />
                </div>
                <div className="si-field">
                  <label className="si-label">Batch No</label>
                  <input
                    className="si-input"
                    type="text"
                    name="batchNo"
                    value={formData.batchNo}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="si-field">
                <label className="si-label">Expiry (MM/YYYY)</label>
                <input
                  className="si-input"
                  type="text"
                  name="expiry"
                  placeholder="e.g. 12/2026"
                  value={formData.expiry}
                  onChange={handleChange}
                />
              </div>

              <div className="pt-modal-footer">
                <button type="button" className="si-btn si-btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="si-btn si-btn-primary">
                  {editingId ? 'Save Changes' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
