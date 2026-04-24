/**
 * DashboardPage Component
 * Displays key metrics: Total Sales, Expiring Medicines, Low Stock.
 */

import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

// ============================================================
// SVG Icons
// ============================================================

const CurrencyRupeeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12"></path>
    <path d="M6 8h12"></path>
    <path d="M6 13l8.5 8"></path>
    <path d="M6 8a6 6 0 0 0 9 0"></path>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const PackageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

// ============================================================
// Mock Data (Replace with API fetch later)
// ============================================================

const MOCK_DATA = {
  totalSales: 124500.00,
  expiringMedicines: [
    { id: '1', name: 'Amoxicillin 500mg', batch: 'AMX-2023', expiry: '2026-04-28', stock: 45 },
    { id: '2', name: 'Paracetamol 650mg', batch: 'PCM-109', expiry: '2026-04-30', stock: 120 },
    { id: '3', name: 'Cetirizine 10mg', batch: 'CET-88', expiry: '2026-05-01', stock: 30 },
  ],
  lowStockMedicines: [
    { id: '4', name: 'Azithromycin 250mg', batch: 'AZ-44', stock: 1, supplier: 'PharmaCorp Inc.' },
    { id: '5', name: 'Ibuprofen 400mg', batch: 'IBU-99', stock: 0, supplier: 'MedLife Distributors' },
  ]
};

// ============================================================
// Component
// ============================================================

export default function DashboardPage() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  
  // Real implementation would use state and fetch from backend
  const [data] = useState(MOCK_DATA);

  return (
    <div className="si-page">
      {/* Header */}
      <div className="si-page-header">
        <div>
          <h2 className="si-page-title">Dashboard</h2>
          <p className="si-page-subtitle">Welcome back, {user?.name || 'User'}. Here is your overview.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Total Sales Card */}
        <div className="si-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)' }}>Total Sales</h3>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 204, 153, 0.1)', color: 'var(--color-primary)' }}>
              <CurrencyRupeeIcon />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text)', marginTop: '8px' }}>
            ₹ {data.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '13px', marginTop: 'auto', color: 'var(--color-text-muted)' }}>Current Financial Year</div>
        </div>

        {/* Expiring Medicines Card */}
        <div className="si-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)' }}>Expiring in 7 Days</h3>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
              <AlertTriangleIcon />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text)', marginTop: '8px' }}>
            {data.expiringMedicines.length} Items
          </div>
          <div style={{ fontSize: '13px', marginTop: 'auto', color: 'var(--color-warning)' }}>Requires immediate attention</div>
        </div>

        {/* Low Stock Card */}
        <div className="si-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)' }}>Low Stock (Under 2)</h3>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>
              <PackageIcon />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text)', marginTop: '8px' }}>
            {data.lowStockMedicines.length} Items
          </div>
          <div style={{ fontSize: '13px', marginTop: 'auto', color: 'var(--color-danger)' }}>Needs reordering</div>
        </div>
      </div>

      {/* Data Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Expiring Medicines Table */}
        <div className="si-card si-table-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)' }}>Expiring Medicines</h3>
            <button className="si-btn si-btn-outline si-btn-sm" onClick={() => navigate('/purchase-invoice')}>
              Review Stock
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="si-table">
              <thead>
                <tr>
                  <th className="si-th">Medicine Name</th>
                  <th className="si-th">Batch No.</th>
                  <th className="si-th">Stock</th>
                  <th className="si-th text-right">Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {data.expiringMedicines.map(item => (
                  <tr key={item.id} className="si-table-row">
                    <td className="si-td font-medium">{item.name}</td>
                    <td className="si-td text-muted">{item.batch}</td>
                    <td className="si-td">{item.stock}</td>
                    <td className="si-td text-right" style={{ color: 'var(--color-warning)', fontWeight: 600 }}>{item.expiry}</td>
                  </tr>
                ))}
                {data.expiringMedicines.length === 0 && (
                  <tr>
                    <td colSpan="4" className="si-empty-row">No medicines expiring soon.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Table */}
        <div className="si-card si-table-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)' }}>Low Stock Alert</h3>
            <button className="si-btn si-btn-outline si-btn-sm" onClick={() => navigate('/suppliers')}>
              Contact Suppliers
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="si-table">
              <thead>
                <tr>
                  <th className="si-th">Medicine Name</th>
                  <th className="si-th">Batch No.</th>
                  <th className="si-th">Supplier</th>
                  <th className="si-th text-right">Current Stock</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStockMedicines.map(item => (
                  <tr key={item.id} className="si-table-row">
                    <td className="si-td font-medium">{item.name}</td>
                    <td className="si-td text-muted">{item.batch}</td>
                    <td className="si-td text-muted">{item.supplier}</td>
                    <td className="si-td text-right">
                      <span className="pt-badge" style={{ backgroundColor: 'var(--color-danger)', color: '#fff' }}>
                        {item.stock} Left
                      </span>
                    </td>
                  </tr>
                ))}
                {data.lowStockMedicines.length === 0 && (
                  <tr>
                    <td colSpan="4" className="si-empty-row">Inventory levels are healthy.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
