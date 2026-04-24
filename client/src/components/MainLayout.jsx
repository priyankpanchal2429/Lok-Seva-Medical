/**
 * MainLayout Component
 * Shared layout wrapper with Top Header, Left Navigation, User Profile Sidebar,
 * and Financial Year selector. All authenticated pages render inside this layout.
 */

import { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { performLogout } from '../utils/auth';
import ThemeToggle from '../components/ThemeToggle';

// ============================================================
// SVG Icon Components
// ============================================================

const ChevronDownIcon = () => (
  <svg className="fy-trigger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const UserAvatarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor"/>
  </svg>
);

// Left Nav Icons
const DashboardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const SalesInvoiceIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

// ============================================================
// Navigation Items Configuration
// ============================================================
const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
  { key: 'sales-invoice', label: 'Sales Invoice', icon: SalesInvoiceIcon, path: '/sales-invoice' },
];

// ============================================================
// Financial Year Options
// ============================================================
const FY_OPTIONS = ['2026-2027', '2027-2028', '2028-2029', '2029-2030', '2030-2031', '2031-2032'];

// ============================================================
// Role Calculation Utility
// ============================================================
const getRole = (id) => {
  if (!id) return 'Pharmacist';
  const lowerId = id.toLowerCase();
  if (lowerId === 'priyank001') return 'Super Admin';
  if (lowerId === 'staff001') return 'Medical Staff';
  return 'Pharmacist';
};

// ============================================================
// Component
// ============================================================
export default function MainLayout({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFYDropdownOpen, setIsFYDropdownOpen] = useState(false);
  const fyDropdownRef = useRef(null);

  const [financialYear, setFinancialYear] = useState(() => {
    return localStorage.getItem('lok-seva-fy') || '2026-2027';
  });

  useEffect(() => {
    localStorage.setItem('lok-seva-fy', financialYear);
  }, [financialYear]);

  // Click outside to close FY dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fyDropdownRef.current && !fyDropdownRef.current.contains(event.target)) {
        setIsFYDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when profile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isSidebarOpen]);

  const handleLogout = useCallback(async () => {
    await performLogout();
    navigate('/login', { replace: true });
  }, [navigate]);

  const displayName = user?.name || 'User';
  const role = getRole(user?.id);

  return (
    <div className="layout-root">
      {/* ===== Top Header Bar ===== */}
      <header className="layout-header">
        <div className="layout-header-inner">
          <div className="layout-header-left">
            <h1 className="layout-store-name">Lok Seva Medical Store</h1>
          </div>
          <div className="layout-header-right">
            {/* Financial Year Dropdown */}
            <div className="fy-selector-container" ref={fyDropdownRef}>
              <button 
                className={`fy-trigger-btn ${isFYDropdownOpen ? 'open' : ''}`}
                onClick={() => setIsFYDropdownOpen(!isFYDropdownOpen)}
              >
                <span>F.Y. {financialYear}</span>
                <ChevronDownIcon />
              </button>
              {isFYDropdownOpen && (
                <div className="fy-dropdown-menu">
                  {FY_OPTIONS.map((year) => (
                    <button
                      key={year}
                      className={`fy-dropdown-item ${financialYear === year ? 'active' : ''}`}
                      onClick={() => {
                        setFinancialYear(year);
                        setIsFYDropdownOpen(false);
                      }}
                    >
                      F.Y. {year}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <ThemeToggle />

            {/* User Profile Trigger */}
            <button 
              className="user-header-btn" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <div className="user-avatar-small">
                <UserAvatarIcon />
              </div>
              <span className="user-header-name">{displayName}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== Body: Left Nav + Main Content ===== */}
      <div className="layout-body">
        {/* Left Navigation */}
        <nav className="layout-left-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`left-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                title={item.label}
              >
                <Icon />
                <span className="left-nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Page Content Area */}
        <main className="layout-main">
          <Outlet context={{ user, financialYear }} />
        </main>
      </div>

      {/* ===== User Profile Sidebar (Drawer) ===== */}
      <div 
        className={`sidebar-backdrop ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <div className={`sidebar-drawer ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Account</h2>
          <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        <div className="sidebar-profile">
          <div className="sidebar-avatar-large">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-profile-info">
            <h3 className="sidebar-name">{displayName}</h3>
            <span className="sidebar-role-badge">{role}</span>
          </div>
        </div>

        <div className="sidebar-menu">
          <button className="sidebar-menu-item">
            <SettingsIcon />
            <span>Settings</span>
          </button>
          <button className="sidebar-menu-item logout" onClick={handleLogout}>
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>

        <div className="sidebar-support">
          <h4 className="support-title">Quick Support</h4>
          <div className="support-card">
            <a 
              href="https://wa.me/919737889992" 
              target="_blank" 
              rel="noopener noreferrer"
              className="support-link"
            >
              <WhatsAppIcon />
              <span>+91 9737889992</span>
            </a>
            <p className="support-hours">10:00 AM - 6:00 PM Everyday</p>
          </div>
        </div>
      </div>
    </div>
  );
}
