/**
 * App Component
 * Root component with React Router and inactivity-based auto-logout.
 * Uses MainLayout for nested page routing.
 */

import { useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SalesInvoicePage from './pages/SalesInvoicePage';
import PurchaseInvoicePage from './pages/PurchaseInvoicePage';
import PatientPage from './pages/PatientPage';
import SupplierPage from './pages/SupplierPage';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { performLogout } from './utils/auth';

/** Inactivity timeout in milliseconds (15 minutes) */
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

/** Events that count as user activity */
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'];

export default function App() {
  const timerRef = useRef(null);
  const isAuthenticatedRef = useRef(false);

  /**
   * Auto-logout after inactivity.
   * Only active when user is authenticated.
   */
  const resetInactivityTimer = useCallback(() => {
    if (!isAuthenticatedRef.current) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      await performLogout();
      window.location.href = '/login';
    }, INACTIVITY_TIMEOUT_MS);
  }, []);

  /** Called when ProtectedRoute confirms authentication */
  const handleAuthResolved = useCallback((user) => {
    if (user) {
      isAuthenticatedRef.current = true;
      resetInactivityTimer();
    }
  }, [resetInactivityTimer]);

  // Set up and tear down activity event listeners
  useEffect(() => {
    const handleActivity = () => resetInactivityTimer();

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resetInactivityTimer]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Login route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes with shared MainLayout */}
        <Route
          element={
            <ProtectedRoute onAuthResolved={handleAuthResolved}>
              {(user) => <MainLayout user={user} />}
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sales-invoice" element={<SalesInvoicePage />} />
          <Route path="/purchase-invoice" element={<PurchaseInvoicePage />} />
          <Route path="/patients" element={<PatientPage />} />
          <Route path="/suppliers" element={<SupplierPage />} />
        </Route>

        {/* Catch-all: redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
