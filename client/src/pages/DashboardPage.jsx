/**
 * DashboardPage Component
 * Post-login dashboard with store branding, financial year selector, and a user profile sidebar.
 */

import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { performLogout } from '../utils/auth';
import ThemeToggle from '../components/ThemeToggle';

// --- SVGs ---
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
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

export default function DashboardPage({ user }) {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [financialYear, setFinancialYear] = useState(() => {
    return localStorage.getItem('lok-seva-fy') || '2026-27';
  });

  useEffect(() => {
    localStorage.setItem('lok-seva-fy', financialYear);
  }, [financialYear]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  const handleLogout = useCallback(async () => {
    await performLogout();
    navigate('/login', { replace: true });
  }, [navigate]);

  const displayName = user?.name || 'User';
  
  // Calculate Role
  const getRole = (id) => {
    if (!id) return 'Pharmacist';
    const lowerId = id.toLowerCase();
    if (lowerId === 'priyank001') return 'Super Admin';
    if (lowerId === 'staff001') return 'Medical Staff';
    return 'Pharmacist';
  };
  const role = getRole(user?.id);

  return (
    <div style={styles.container}>
      {/* ===== Top Bar ===== */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.headerLeft}>
            <h1 style={styles.storeName}>Lok Seva Medical Store</h1>
          </div>
          <div style={styles.headerRight}>
            {/* Financial Year Selector */}
            <div className="fy-selector-container">
              <span className="fy-label">F.Y.</span>
              <select 
                className="fy-select"
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
              >
                <option value="2026-27">2026-2027</option>
                <option value="2025-26">2025-2026</option>
                <option value="2024-25">2024-2025</option>
                <option value="2023-24">2023-2024</option>
              </select>
            </div>

            <ThemeToggle />
            
            {/* User Profile Button */}
            <button 
              className="user-header-btn" 
              onClick={() => setIsSidebarOpen(true)}
              style={styles.userHeaderBtn}
            >
              <div style={styles.userAvatarSmall}>
                <UserAvatarIcon />
              </div>
              <span style={styles.userHeaderName}>{displayName}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== Main Content ===== */}
      <main style={styles.main}>
        <div style={styles.mainInner}>
          <div style={styles.welcomeCard}>
            <p style={styles.greeting}>Welcome,</p>
            <h2 style={styles.userName}>{displayName}</h2>
            <p style={styles.userIdText}>ID: {user?.id}</p>
          </div>
        </div>
      </main>

      {/* ===== Sidebar Drawer ===== */}
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
          <h3 className="sidebar-name">{displayName}</h3>
          <span className="sidebar-role-badge">{role}</span>
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

// ============================================================
// Styles
// ============================================================

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative', // for backdrop
  },

  // ----- Header -----
  header: {
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  headerInner: {
    width: '100%',
    maxWidth: '1770px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  storeName: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--color-primary)',
    letterSpacing: '-0.3px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  
  // ----- User Button -----
  userHeaderBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: '1px solid var(--color-border)',
    padding: '4px 12px 4px 4px',
    borderRadius: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: 'var(--color-bg)',
  },
  userAvatarSmall: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userHeaderName: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--color-text)',
  },

  // ----- Main -----
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    width: '100%',
  },
  mainInner: {
    width: '100%',
    maxWidth: '1770px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeCard: {
    textAlign: 'center',
    padding: '48px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '4px',
    minWidth: '300px',
  },
  greeting: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    marginBottom: '4px',
  },
  userName: {
    fontSize: '32px',
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: '8px',
  },
  userIdText: {
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    fontFamily: 'monospace',
  },
};
