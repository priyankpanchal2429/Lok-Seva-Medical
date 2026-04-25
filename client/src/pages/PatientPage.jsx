/**
 * PatientPage Component
 * Full CRUD interface for managing patient records.
 */

import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
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
// API Calls
// ============================================================
const fetchPatients = async () => {
  const { data } = await api.get('/patients');
  return data;
};

const createPatient = async (payload) => {
  const { data } = await api.post('/patients', payload);
  return data;
};

const updatePatient = async (id, payload) => {
  const { data } = await api.put(`/patients/${id}`, payload);
  return data;
};

const deletePatient = async (id) => {
  const { data } = await api.delete(`/patients/${id}`);
  return data;
};

// ============================================================
// Component
// ============================================================
export default function PatientPage() {
  const { user } = useOutletContext();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    phoneNumber: '',
    gender: '',
    bloodGroup: '',
    fullAddress: '',
    currentMedicine: '',
    patientDisease: ''
  });
  const [phoneWarning, setPhoneWarning] = useState('');

  // Load patients
  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPatients();
      setPatients(data);
    } catch (err) {
      console.error(err);
      // Fallback/Demo data if backend not fully up
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Handle phone change
  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, '');
    if (raw !== digitsOnly) {
      setPhoneWarning('Only numbers are allowed');
    } else {
      setPhoneWarning('');
    }
    setFormData({ ...formData, phoneNumber: digitsOnly });
  };

  // Open modal for add
  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      fullName: '', age: '', phoneNumber: '', gender: '',
      bloodGroup: '', fullAddress: '', currentMedicine: '', patientDisease: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleEditClick = (patient) => {
    setEditingId(patient._id);
    setFormData({
      fullName: patient.fullName,
      age: patient.age,
      phoneNumber: patient.phoneNumber,
      gender: patient.gender || '',
      bloodGroup: patient.bloodGroup || '',
      fullAddress: patient.fullAddress || '',
      currentMedicine: patient.currentMedicine || '',
      patientDisease: patient.patientDisease || ''
    });
    setIsModalOpen(true);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePatient(editingId, formData);
      } else {
        await createPatient(formData);
      }
      setIsModalOpen(false);
      loadPatients();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert(msg);
    }
  };

  // Delete patient
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await deletePatient(id);
        loadPatients();
      } catch (err) {
        const msg = err.response?.data?.error || err.response?.data?.message || err.message;
        alert(msg);
      }
    }
  };

  // Filter patients
  const filteredPatients = patients.filter(p => 
    p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.phoneNumber?.includes(searchQuery)
  );

  return (
    <div className="si-page">
      {/* Header */}
      <div className="si-page-header">
        <div>
          <h2 className="si-page-title">Patient Management</h2>
          <p className="si-page-subtitle">View and manage patient records</p>
        </div>
        <div className="si-header-actions">
          <button className="si-btn si-btn-primary" onClick={handleAddClick}>
            <PlusIcon />
            <span>Add Patient</span>
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
            placeholder="Search patients by name or phone..."
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
              <th className="si-th">Full Name</th>
              <th className="si-th">Age</th>
              <th className="si-th">Phone</th>
              <th className="si-th">Address</th>
              <th className="si-th">Gender / Blood</th>
              <th className="si-th">Disease</th>
              <th className="si-th" style={{ width: '180px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="si-empty-row">Loading patients...</td>
              </tr>
            ) : filteredPatients.length === 0 ? (
              <tr>
                <td colSpan="7" className="si-empty-row">No patients found.</td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr key={patient._id} className="si-table-row">
                  <td className="si-td font-medium">{patient.fullName}</td>
                  <td className="si-td">{patient.age}</td>
                  <td className="si-td">{patient.phoneNumber}</td>
                  <td className="si-td text-muted" title={patient.fullAddress}>
                    {patient.fullAddress ? (patient.fullAddress.length > 30 ? patient.fullAddress.substring(0, 30) + '...' : patient.fullAddress) : '-'}
                  </td>
                  <td className="si-td">
                    {patient.gender && <span>{patient.gender} </span>}
                    {patient.bloodGroup && <span className="pt-badge">{patient.bloodGroup}</span>}
                  </td>
                  <td className="si-td text-muted">{patient.patientDisease || '-'}</td>
                  <td className="si-td">
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button className="si-btn si-btn-outline si-btn-sm" onClick={() => handleEditClick(patient)}>
                        <EditIcon />
                        <span>Edit</span>
                      </button>
                      <button className="si-btn si-btn-danger-outline si-btn-sm" onClick={() => handleDelete(patient._id)}>
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
          <div className="pt-modal">
            <div className="pt-modal-header">
              <h3>{editingId ? 'Edit Patient' : 'Add New Patient'}</h3>
              <button className="pt-modal-close" onClick={() => setIsModalOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="pt-modal-body">
              <div className="si-field-row">
                <div className="si-field" style={{ gridColumn: 'span 2' }}>
                  <label className="si-label">Full Name *</label>
                  <input
                    required
                    className="si-input"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div className="si-field">
                  <label className="si-label">Age *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="si-input"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                  />
                </div>
              </div>

              <div className="si-field-row">
                <div className="si-field">
                  <label className="si-label">Phone Number *</label>
                  <input
                    required
                    maxLength={10}
                    className={`si-input ${phoneWarning ? 'si-input-warn' : ''}`}
                    value={formData.phoneNumber}
                    onChange={handlePhoneChange}
                  />
                  {phoneWarning && <span className="si-field-warning">{phoneWarning}</span>}
                </div>
                <div className="si-field">
                  <label className="si-label">Gender</label>
                  <select 
                    className="si-input"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="si-field">
                  <label className="si-label">Blood Group</label>
                  <select 
                    className="si-input"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                  >
                    <option value="">Select...</option>
                    <option value="A+">A+</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B-">B-</option>
                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                    <option value="O+">O+</option><option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="si-field">
                <label className="si-label">Full Address</label>
                <textarea
                  className="si-input"
                  rows="2"
                  value={formData.fullAddress}
                  onChange={(e) => setFormData({...formData, fullAddress: e.target.value})}
                />
              </div>

              <div className="si-field-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="si-field">
                  <label className="si-label">Patient Disease</label>
                  <input
                    className="si-input"
                    value={formData.patientDisease}
                    onChange={(e) => setFormData({...formData, patientDisease: e.target.value})}
                  />
                </div>
                <div className="si-field">
                  <label className="si-label">Current Medicine</label>
                  <input
                    className="si-input"
                    value={formData.currentMedicine}
                    onChange={(e) => setFormData({...formData, currentMedicine: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-modal-footer">
                <button type="button" className="si-btn si-btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="si-btn si-btn-primary">
                  {editingId ? 'Update Patient' : 'Save Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
