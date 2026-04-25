/**
 * MedicinesPage Component
 * Full CRUD interface for managing medicine inventory.
 */

import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import DatePicker from '../components/DatePicker';

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

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// ============================================================
// Mock Data
// ============================================================
const MOCK_MEDICINES = [
  { _id: '1', name: 'Amoxicillin 500mg', batch: 'AMX-2023', expiryDate: '2026-04-28', stock: 45, price: 120.00, category: 'Antibiotic' },
  { _id: '2', name: 'Paracetamol 650mg', batch: 'PCM-109', expiryDate: '2026-04-30', stock: 120, price: 35.00, category: 'Analgesic' },
  { _id: '3', name: 'Cetirizine 10mg', batch: 'CET-88', expiryDate: '2026-05-01', stock: 30, price: 45.50, category: 'Antihistamine' },
  { _id: '4', name: 'Azithromycin 250mg', batch: 'AZ-44', expiryDate: '2025-11-15', stock: 1, price: 210.00, category: 'Antibiotic' },
  { _id: '5', name: 'Ibuprofen 400mg', batch: 'IBU-99', expiryDate: '2027-02-10', stock: 0, price: 60.00, category: 'NSAID' },
];

// ============================================================
// Component
// ============================================================
export default function MedicinesPage() {
  const { user } = useOutletContext();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    batch: '',
    expiryDate: '',
    stock: '',
    price: '',
    category: ''
  });

  // Load medicines (Mock)
  const loadMedicines = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setMedicines([...MOCK_MEDICINES]);
      setLoading(false);
    }, 400); // Simulate network delay
  }, []);

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  // Open modal for add
  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      name: '', batch: '', expiryDate: '', stock: '', price: '', category: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleEditClick = (medicine) => {
    setEditingId(medicine._id);
    setFormData({
      name: medicine.name,
      batch: medicine.batch,
      expiryDate: medicine.expiryDate,
      stock: medicine.stock,
      price: medicine.price,
      category: medicine.category
    });
    setIsModalOpen(true);
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setMedicines(prev => prev.map(m => m._id === editingId ? { ...formData, _id: editingId, stock: Number(formData.stock), price: Number(formData.price) } : m));
    } else {
      setMedicines(prev => [{ ...formData, _id: Date.now().toString(), stock: Number(formData.stock), price: Number(formData.price) }, ...prev]);
    }
    setIsModalOpen(false);
  };

  // Delete medicine
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      setMedicines(prev => prev.filter(m => m._id !== id));
    }
  };

  // Filter medicines
  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.batch.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="si-page">
      {/* Header */}
      <div className="si-page-header">
        <div>
          <h2 className="si-page-title">Medicines Master</h2>
          <p className="si-page-subtitle">Manage your medicine inventory, pricing, and stock</p>
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
            placeholder="Search medicines by name, batch, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="si-card si-table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="si-table">
            <thead>
              <tr>
                <th className="si-th">Medicine Name</th>
                <th className="si-th" style={{ textAlign: 'center' }}>Category</th>
                <th className="si-th" style={{ textAlign: 'center' }}>Batch No.</th>
                <th className="si-th" style={{ textAlign: 'center' }}>Expiry Date</th>
                <th className="si-th" style={{ textAlign: 'center' }}>Price (₹)</th>
                <th className="si-th" style={{ textAlign: 'center' }}>Stock</th>
                <th className="si-th" style={{ width: '180px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="si-empty-row">Loading medicines...</td>
                </tr>
              ) : filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan="7" className="si-empty-row">No medicines found.</td>
                </tr>
              ) : (
                filteredMedicines.map((medicine) => (
                  <tr key={medicine._id} className="si-table-row">
                    <td className="si-td font-medium">{medicine.name}</td>
                    <td className="si-td text-muted" style={{ textAlign: 'center' }}>{medicine.category}</td>
                    <td className="si-td" style={{ textAlign: 'center' }}>{medicine.batch}</td>
                    <td className="si-td" style={{ textAlign: 'center', color: new Date(medicine.expiryDate) < new Date() ? 'var(--color-danger)' : 'var(--color-text)' }}>
                      {medicine.expiryDate}
                    </td>
                    <td className="si-td font-medium" style={{ textAlign: 'center' }}>₹{Number(medicine.price).toFixed(2)}</td>
                    <td className="si-td" style={{ textAlign: 'center' }}>
                      <span className={`pt-badge ${medicine.stock <= 5 ? 'pt-badge-inactive' : ''}`} style={medicine.stock <= 5 ? { backgroundColor: 'var(--color-danger)', color: '#fff' } : {}}>
                        {medicine.stock}
                      </span>
                    </td>
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="pt-modal-overlay">
          <div className="pt-modal" style={{ maxWidth: '500px' }}>
            <div className="pt-modal-header">
              <h3>{editingId ? 'Edit Medicine' : 'Add New Medicine'}</h3>
              <button className="pt-modal-close" onClick={() => setIsModalOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="pt-modal-body">
              <div className="si-field-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="si-field">
                  <label className="si-label">Medicine Name *</label>
                  <input
                    required
                    className="si-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="si-field">
                  <label className="si-label">Category</label>
                  <input
                    className="si-input"
                    placeholder="e.g. Antibiotic"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  />
                </div>
              </div>

              <div className="si-field-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="si-field">
                  <label className="si-label">Batch No. *</label>
                  <input
                    required
                    className="si-input"
                    value={formData.batch}
                    onChange={(e) => setFormData({...formData, batch: e.target.value})}
                  />
                </div>
                <div className="si-field">
                  <label className="si-label">Expiry Date *</label>
                  <DatePicker
                    mode="date"
                    className="si-input"
                    placeholder="Select expiry date"
                    value={formData.expiryDate}
                    onChange={(val) => setFormData({...formData, expiryDate: val})}
                  />
                </div>
              </div>

              <div className="si-field-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="si-field">
                  <label className="si-label">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="si-input"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div className="si-field">
                  <label className="si-label">Current Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="si-input"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-modal-footer">
                <button type="button" className="si-btn si-btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="si-btn si-btn-primary">
                  {editingId ? 'Update Medicine' : 'Save Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
