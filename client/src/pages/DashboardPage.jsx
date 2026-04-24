/**
 * DashboardPage Component
 * Simple welcome view displayed inside the MainLayout.
 */

import { useOutletContext } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useOutletContext();
  const displayName = user?.name || 'User';

  return (
    <div style={styles.container}>
      <div style={styles.welcomeCard}>
        <p style={styles.greeting}>Welcome,</p>
        <h2 style={styles.userName}>{displayName}</h2>
        <p style={styles.userIdText}>ID: {user?.id}</p>
      </div>
    </div>
  );
}

// ============================================================
// Styles
// ============================================================

const styles = {
  container: {
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
