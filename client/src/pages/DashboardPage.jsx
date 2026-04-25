/**
 * DashboardPage Component
 * Displays key metrics: Sales Outstanding, Purchase Outstanding,
 * Expiring Medicines, Low Stock alerts.
 */

import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import api from '../utils/api';

// ============================================================
// SVG Icons
// ============================================================

const RefreshIcon = ({ spinning }) => (
  <svg
    className={spinning ? 'spin-animation' : ''}
    width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <polyline points="5 12 12 5 19 12"></polyline>
  </svg>
);

const ArrowDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
);

// ============================================================
// Outstanding Card Component
// ============================================================

/**
 * Renders a single outstanding card with aging breakdown and progress bar.
 * @param {object} props
 * @param {'sales'|'purchase'} props.type - Card type
 * @param {object} props.data - { total, aging: { current, '1-15', '16-30', '30+' }, invoiceCount }
 */
function OutstandingCard({ type, data }) {
  const isSales = type === 'sales';
  const title = isSales ? 'Sales Outstanding' : 'Purchase Outstanding';
  const subtitle = isSales ? 'Total Receivables' : 'Total Payables';
  const accentColor = isSales ? '#00cc99' : '#6366f1';
  const icon = isSales ? <ArrowDownIcon /> : <ArrowUpIcon />;

  const total = data?.total || 0;
  const aging = data?.aging || { current: 0, '1-15': 0, '16-30': 0, '30+': 0 };
  const invoiceCount = data?.invoiceCount || 0;

  // Aging bucket config
  const buckets = [
    { key: 'current', label: 'Current',     color: '#00cc99', sublabel: 'Not due'   },
    { key: '1-15',    label: '1-15 Days',   color: '#f59e0b', sublabel: 'Overdue'   },
    { key: '16-30',   label: '16-30 Days',  color: '#f97316', sublabel: 'Overdue'   },
    { key: '30+',     label: '30+ Days',    color: '#ef4444', sublabel: 'Overdue'   },
  ];

  // Calculate progress bar segment widths
  const segments = buckets.map(b => ({
    ...b,
    amount: aging[b.key] || 0,
    width: total > 0 ? ((aging[b.key] || 0) / total) * 100 : 0,
  }));

  return (
    <div className="db-outstanding-card">
      {/* Header */}
      <div className="db-outstanding-header">
        <div className="db-outstanding-title-row">
          <div className="db-outstanding-icon" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
            {icon}
          </div>
          <h3 className="db-outstanding-title">{title}</h3>
          <span className="db-outstanding-badge">{invoiceCount} invoices</span>
        </div>
      </div>

      {/* Total Amount */}
      <div className="db-outstanding-total">
        <span className="db-outstanding-total-label">{subtitle}</span>
        <span className="db-outstanding-total-amount" style={{ color: accentColor }}>
          ₹ {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="db-outstanding-bar-track">
        {segments.map(seg => (
          seg.width > 0 && (
            <div
              key={seg.key}
              className="db-outstanding-bar-segment"
              style={{ width: `${seg.width}%`, backgroundColor: seg.color }}
              title={`${seg.label}: ₹${seg.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            />
          )
        ))}
        {total === 0 && <div className="db-outstanding-bar-segment db-outstanding-bar-empty" />}
      </div>

      {/* Aging Breakdown */}
      <div className="db-outstanding-aging">
        {segments.map(seg => (
          <div key={seg.key} className="db-outstanding-aging-item">
            <div className="db-outstanding-aging-dot" style={{ backgroundColor: seg.color }} />
            <div className="db-outstanding-aging-info">
              <span className="db-outstanding-aging-amount">
                ₹ {seg.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="db-outstanding-aging-label">{seg.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Dashboard Component
// ============================================================

export default function DashboardPage() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  // Outstanding data
  const [outstandingData, setOutstandingData] = useState({
    sales: { total: 0, aging: { current: 0, '1-15': 0, '16-30': 0, '30+': 0 }, invoiceCount: 0 },
    purchase: { total: 0, aging: { current: 0, '1-15': 0, '16-30': 0, '30+': 0 }, invoiceCount: 0 },
  });

  // Medicine alerts
  const [expiringMedicines, setExpiringMedicines] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [fetchError, setFetchError] = useState('');

  /** Fetch all dashboard data */
  const fetchDashboard = useCallback(async () => {
    setFetchError('');

    // Fetch outstanding data
    try {
      const { data: outstanding } = await api.get('/dashboard/outstanding');
      setOutstandingData(outstanding);
    } catch (err) {
      console.error('Outstanding fetch error:', err);
      setFetchError('Could not load outstanding data. Server may need restart.');
    }

    // Fetch medicines for alerts (independent of outstanding)
    try {
      const { data: medicines } = await api.get('/medicines');

      // Expiring in 30 days
      const now = new Date();
      const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const expiring = medicines.filter(m => {
        if (!m.expiry) return false;
        const exp = new Date(m.expiry + '-01');
        return exp <= thirtyDaysLater && exp >= now;
      });
      setExpiringMedicines(expiring.slice(0, 10));

      // Low stock (qty <= 5)
      const lowStock = medicines.filter(m => (m.stockQty || 0) <= 5);
      setLowStockMedicines(lowStock.slice(0, 10));
    } catch (err) {
      console.error('Medicines fetch error:', err);
    }

    setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchDashboard(), 0);
    return () => clearTimeout(timer);
  }, [fetchDashboard]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboard();
  };

  if (isLoading) {
    return (
      <div className="si-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="db-loading-spinner" />
      </div>
    );
  }

  return (
    <div className="si-page">
      {/* ===== Header ===== */}
      <div className="si-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px' }}>
        <div>
          <h2 className="si-page-title">Dashboard</h2>
          <p className="si-page-subtitle">Welcome back, {user?.name || 'User'}. Here is your overview.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          {lastUpdated && (
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Updated {lastUpdated}
            </span>
          )}
          <button
            className={`si-btn si-btn-outline ${isRefreshing ? 'si-btn-loading' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshIcon spinning={isRefreshing} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
      {/* Error banner */}
      {fetchError && (
        <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '13px', fontWeight: 500 }}>
          ⚠️ {fetchError}
        </div>
      )}

      {/* ===== Outstanding Cards ===== */}
      <div className="db-outstanding-grid">
        <OutstandingCard type="sales" data={outstandingData.sales} />
        <OutstandingCard type="purchase" data={outstandingData.purchase} />
      </div>

      {/* ===== Alert Tables ===== */}
      <div className="db-tables-grid">

        {/* Expiring Medicines */}
        <div className="si-card si-table-card" style={{ marginBottom: 0 }}>
          <div className="db-table-header">
            <div>
              <h3 className="db-table-title">Expiring Soon</h3>
              <span className="db-table-subtitle">Medicines expiring within 30 days</span>
            </div>
            <button className="si-btn si-btn-outline si-btn-sm" onClick={() => navigate('/medicines')}>
              View All
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="si-table">
              <thead>
                <tr>
                  <th className="si-th">Medicine Name</th>
                  <th className="si-th" style={{ textAlign: 'center' }}>Batch</th>
                  <th className="si-th" style={{ textAlign: 'center' }}>Stock</th>
                  <th className="si-th" style={{ textAlign: 'center' }}>Expiry</th>
                </tr>
              </thead>
              <tbody>
                {expiringMedicines.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="si-empty-row">No medicines expiring soon. ✅</td>
                  </tr>
                ) : (
                  expiringMedicines.map(item => (
                    <tr key={item._id} className="si-table-row">
                      <td className="si-td" style={{ fontWeight: 600 }}>{item.name}</td>
                      <td className="si-td" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>{item.batchNo || '—'}</td>
                      <td className="si-td" style={{ textAlign: 'center' }}>{item.stockQty || 0}</td>
                      <td className="si-td" style={{ textAlign: 'center', color: 'var(--color-warning)', fontWeight: 600 }}>{item.expiry || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock */}
        <div className="si-card si-table-card" style={{ marginBottom: 0 }}>
          <div className="db-table-header">
            <div>
              <h3 className="db-table-title">Low Stock Alert</h3>
              <span className="db-table-subtitle">Items with 5 or fewer units remaining</span>
            </div>
            <button className="si-btn si-btn-outline si-btn-sm" onClick={() => navigate('/purchase-invoice')}>
              Reorder
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="si-table">
              <thead>
                <tr>
                  <th className="si-th">Medicine Name</th>
                  <th className="si-th" style={{ textAlign: 'center' }}>Category</th>
                  <th className="si-th" style={{ textAlign: 'center' }}>MRP</th>
                  <th className="si-th" style={{ textAlign: 'center' }}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockMedicines.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="si-empty-row">Inventory levels are healthy. ✅</td>
                  </tr>
                ) : (
                  lowStockMedicines.map(item => (
                    <tr key={item._id} className="si-table-row">
                      <td className="si-td" style={{ fontWeight: 600 }}>{item.name}</td>
                      <td className="si-td" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>{item.category || '—'}</td>
                      <td className="si-td" style={{ textAlign: 'center' }}>₹{item.mrp || 0}</td>
                      <td className="si-td" style={{ textAlign: 'center' }}>
                        <span className="db-stock-badge" data-level={item.stockQty === 0 ? 'zero' : 'low'}>
                          {item.stockQty === 0 ? 'Out of Stock' : `${item.stockQty} Left`}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
