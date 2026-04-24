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
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor"/>
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
