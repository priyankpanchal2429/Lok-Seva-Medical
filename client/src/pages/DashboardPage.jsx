/**
 * DashboardPage Component
 * Minimal post-login dashboard with store branding and logout.
 */

import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { performLogout } from '../utils/auth';
import ThemeToggle from '../components/ThemeToggle';

export default function DashboardPage({ user }) {
  const navigate = useNavigate();

  // ----- Financial Year State -----
  const [financialYear, setFinancialYear] = useState(() => {
    return localStorage.getItem('lok-seva-fy') || '2026-27';
  });

  useEffect(() => {
    localStorage.setItem('lok-seva-fy', financialYear);
  }, [financialYear]);

  /** Handle logout — clear session and redirect to login */
  const handleLogout = useCallback(async () => {
    await performLogout();
    navigate('/login', { replace: true });
  }, [navigate]);

  const displayName = user?.name || 'User';

  return (
    <div style={styles.container}>
      {/* ===== Top Bar ===== */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.storeName}>Lok Seva Medical Store</h1>
          
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
        </div>
        <div style={styles.headerRight}>
          <ThemeToggle />
          <button
            id="logout-button"
            type="button"
            onClick={handleLogout}
            style={styles.logoutButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-error)';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = 'var(--color-error)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-error)';
              e.currentTarget.style.borderColor = 'var(--color-error)';
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* ===== Main Content ===== */}
      <main style={styles.main}>
        <div style={styles.welcomeCard}>
          <p style={styles.greeting}>Welcome,</p>
          <h2 style={styles.userName}>{displayName}</h2>
          <p style={styles.userIdText}>ID: {user?.id}</p>
        </div>
      </main>
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
  },

  // ----- Header -----
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
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
    gap: '12px',
  },
  logoutButton: {
    padding: '7px 16px',
    fontSize: '13px',
    fontWeight: 500,
    fontFamily: 'Inter, sans-serif',
    backgroundColor: 'transparent',
    color: 'var(--color-error)',
    border: '1px solid var(--color-error)',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  // ----- Main -----
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
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
