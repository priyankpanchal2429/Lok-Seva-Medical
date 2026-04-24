/**
 * ProtectedRoute Component
 * Wraps routes that require authentication.
 * Redirects to /login if user is not authenticated.
 * Shows nothing while auth check is in flight.
 */

import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { checkAuth } from '../utils/auth';

export default function ProtectedRoute({ children, onAuthResolved }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'authenticated' | 'unauthenticated'
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      console.log('[DEBUG] Verifying session...');
      const authUser = await checkAuth();
      console.log('[DEBUG] Session verification result:', authUser ? `User ${authUser.id}` : 'No user found');

      if (cancelled) return;

      if (authUser) {
        setUser(authUser);
        setStatus('authenticated');
        onAuthResolved?.(authUser);
      } else {
        setStatus('unauthenticated');
      }
    }

    verify();

    return () => {
      cancelled = true;
    };
  }, [onAuthResolved]);

  // Show nothing while checking — prevents flash of content
  if (status === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: 'var(--color-text-muted)',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
        }}
      >
        Verifying session...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  // Render protected content
  return typeof children === 'function' ? children(user) : children;
}
