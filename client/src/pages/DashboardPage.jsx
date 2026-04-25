/**
 * DashboardPage Component
 * Displays key metrics: Total Sales, Expiring Medicines, Low Stock.
 */

import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import DateRangePicker from '../components/DateRangePicker';

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
  
  const [data, setData] = useState(MOCK_DATA);
  const [lastUpdated, setLastUpdated] = useState('Just now');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '24-10-2025', end: '24-04-2026' });

  /** Simulate fetching fresh data from backend */
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API delay
    setTimeout(() => {
      setData({ ...MOCK_DATA }); // In a real app, this would be a fresh fetch
      setLastUpdated('Just now');
      setIsRefreshing(false);
    }, 800);
  };

  const handleApplyDateRange = (start, end) => {
    setDateRange({ start, end });
    setIsDatePickerOpen(false);
    handleRefresh(); // Refresh data for the new range
  };

  return (
    <div className="si-page">
      {/* Header */}
      <div className="si-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px' }}>
        <div>
          <h2 className="si-page-title">Dashboard</h2>
          <p className="si-page-subtitle">Welcome back, {user?.name || 'User'}. Here is your overview.</p>
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '4px' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Last Updated: {lastUpdated}
          </span>
          
          {/* Date Range Display - Using Standard App Button Style */}
          <button 
            className="si-btn si-btn-primary" 
            onClick={() => setIsDatePickerOpen(true)}
          >
            <span>{dateRange.start} To {dateRange.end}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>

          {/* Refresh Button - Using Standard App Button Style */}
          <button 
            className={`si-btn si-btn-primary ${isRefreshing ? 'si-btn-loading' : ''}`} 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            <svg 
              className={isRefreshing ? 'spin-animation' : ''} 
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '32px', marginBottom: '24px' }}>
        {/* Total Sales Card */}
        <div className="si-card" style={{ marginBottom: 0, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Sales</h3>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 204, 153, 0.1)', color: 'var(--color-primary)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3h12"></path>
                <path d="M6 8h12"></path>
                <path d="M6 13l8.5 8"></path>
                <path d="M6 8a6 6 0 0 0 9 0"></path>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text)', marginTop: '4px' }}>
            ₹ {data.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Current Financial Year</div>
        </div>

        {/* Expiring Medicines Card */}
        <div className="si-card" style={{ marginBottom: 0, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expiring in 7 Days</h3>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text)', marginTop: '4px' }}>
            {data.expiringMedicines.length} Items
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-warning)' }}>Requires attention</div>
        </div>

        {/* Low Stock Card */}
        <div className="si-card" style={{ marginBottom: 0, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Low Stock (Under 2)</h3>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text)', marginTop: '4px' }}>
            {data.lowStockMedicines.length} Items
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-danger)' }}>Needs reordering</div>
        </div>
      </div>

      {/* Data Tables */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
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
                  <th className="si-th" style={{ textAlign: 'center' }}>Batch No.</th>
                  <th className="si-th" style={{ textAlign: 'center' }}>Stock</th>
                  <th className="si-th" style={{ textAlign: 'center' }}>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {data.expiringMedicines.map(item => (
                  <tr key={item.id} className="si-table-row">
                    <td className="si-td font-medium">{item.name}</td>
                    <td className="si-td text-muted" style={{ textAlign: 'center' }}>{item.batch}</td>
                    <td className="si-td" style={{ textAlign: 'center' }}>{item.stock}</td>
                    <td className="si-td" style={{ textAlign: 'center', color: 'var(--color-warning)', fontWeight: 600 }}>{item.expiry}</td>
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
                  <th className="si-th" style={{ textAlign: 'center' }}>Batch No.</th>
                  <th className="si-th" style={{ textAlign: 'center' }}>Supplier</th>
                  <th className="si-th" style={{ textAlign: 'center' }}>Current Stock</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStockMedicines.map(item => (
                  <tr key={item.id} className="si-table-row">
                    <td className="si-td font-medium">{item.name}</td>
                    <td className="si-td text-muted" style={{ textAlign: 'center' }}>{item.batch}</td>
                    <td className="si-td text-muted" style={{ textAlign: 'center' }}>{item.supplier}</td>
                    <td className="si-td" style={{ textAlign: 'center' }}>
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

      {/* Date Range Picker Modal */}
      <DateRangePicker 
        isOpen={isDatePickerOpen} 
        onClose={() => setIsDatePickerOpen(false)} 
        onApply={handleApplyDateRange}
        initialRange={dateRange}
      />
    </div>
  );
}
