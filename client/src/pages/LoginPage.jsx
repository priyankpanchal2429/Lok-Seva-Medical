/**
 * LoginPage Component
 * Split-layout login page with integrated Registration functionality.
 * Allows users to toggle between Sign In and Create Account modes.
 */

import { useState, useCallback, useRef, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { sanitizeInput, isEmpty } from '../utils/sanitize';
import ThemeToggle from '../components/ThemeToggle';

/** SVG icons and branding */
const EyeIcon = memo(() => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
));

const EyeOffIcon = memo(() => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
  </svg>
));

const MedicalIcon = memo(() => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.9 }}>
    <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
));

export default function LoginPage() {
  const navigate = useNavigate();

  // ----- UI State -----
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // ----- Form State -----
  const [formData, setFormData] = useState({
    name: '',
    userId: '',
    password: '',
    confirmPassword: '',
    answer1: '',
    answer2: '',
    rememberMe: false,
  });

  const userIdRef = useRef(null);

  // Auto-focus User ID on mount
  useEffect(() => { userIdRef.current?.focus(); }, []);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (status.message) setStatus({ type: '', message: '' });
  };

  /** Toggle between Login and Register */
  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
    setStatus({ type: '', message: '' });
  };

  /** Handle Form Submission */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    const sanitizedUserId = sanitizeInput(formData.userId).trim();

    try {
      if (mode === 'login') {
        // --- LOGIN FLOW ---
        const response = await api.post('/auth/login', {
          userId: sanitizedUserId,
          password: formData.password,
        });

        if (response.data.token) {
          localStorage.setItem('lok-seva-token', response.data.token);
        }

        if (formData.rememberMe) {
          localStorage.setItem('lok-seva-remembered-user', sanitizedUserId);
        } else {
          localStorage.removeItem('lok-seva-remembered-user');
        }

        navigate('/dashboard', { replace: true });
      } else {
        // --- REGISTER FLOW ---
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        const response = await api.post('/auth/register', {
          name: sanitizeInput(formData.name).trim(),
          userId: sanitizedUserId,
          password: formData.password,
          answer1: sanitizeInput(formData.answer1).trim(),
          answer2: sanitizeInput(formData.answer2).trim(),
        });

        setStatus({ type: 'success', message: response.data.message + ' Please sign in.' });
        setMode('login'); // Switch to login mode after success
      }
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Action failed.';
      setStatus({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      {/* ===== LEFT PANEL ===== */}
      <div className="login-left-panel">
        <div style={styles.leftContent}>
          <MedicalIcon />
          <h1 style={styles.storeName}>Lok Seva Medical Store</h1>
          <p style={styles.subtitle}>Secure Access Panel</p>
        </div>
        <div style={styles.leftOverlay} />
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div className="login-right-panel">
        <div style={styles.themeToggleWrapper}><ThemeToggle /></div>

        <div className="login-card">
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
            <p style={styles.cardSubtitle}>
              {mode === 'login' ? 'Enter your credentials' : 'Join our medical team'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Status Messages */}
            <div className="error-container">
              {status.message && (
                <div style={status.type === 'error' ? styles.generalError : styles.successBox}>
                  {status.message}
                </div>
              )}
            </div>

            {/* Registration Specific: Name */}
            {mode === 'register' && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  style={styles.input}
                  disabled={isSubmitting}
                />
              </div>
            )}

            {/* User ID */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>User ID</label>
              <input
                ref={userIdRef}
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="Enter User ID"
                style={styles.input}
                disabled={isSubmitting}
                autoComplete="username"
              />
            </div>

            {/* Password Row */}
            <div style={mode === 'register' ? styles.formRow : {}}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    style={{ ...styles.input, paddingRight: '40px' }}
                    disabled={isSubmitting}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter"
                    style={styles.input}
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>

            {/* Registration Specific: Security Questions */}
            {mode === 'register' && (
              <div style={styles.securitySection}>
                <p style={styles.sectionTitle}>Security Questions</p>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>What is your birth place?</label>
                  <input
                    type="text"
                    name="answer1"
                    value={formData.answer1}
                    onChange={handleChange}
                    placeholder="Enter answer"
                    style={styles.input}
                    disabled={isSubmitting}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>What is your 1st vehicle?</label>
                  <input
                    type="text"
                    name="answer2"
                    value={formData.answer2}
                    onChange={handleChange}
                    placeholder="Enter answer"
                    style={styles.input}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            {/* Login Specific: Remember Me */}
            {mode === 'login' && (
              <div style={styles.rememberRow}>
                <label style={styles.rememberLabel}>
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <span>Remember me</span>
                </label>
              </div>
            )}

            {/* Action Buttons */}
            <div style={styles.actions}>
              <button type="submit" style={styles.loginButton} disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
              
              <button type="button" onClick={toggleMode} style={styles.toggleButton}>
                {mode === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  leftContent: { zIndex: 2, textAlign: 'center', color: 'var(--color-panel-text)', padding: '40px' },
  storeName: { fontSize: '28px', fontWeight: 700, marginTop: '16px', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '14px', marginTop: '8px', color: 'var(--color-panel-subtitle)', letterSpacing: '1px', textTransform: 'uppercase' },
  leftOverlay: { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.05) 0%, transparent 60%)', zIndex: 1 },
  themeToggleWrapper: { position: 'absolute', top: '20px', right: '20px', zIndex: 10 },
  cardHeader: { marginBottom: '20px' },
  cardTitle: { fontSize: '22px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' },
  cardSubtitle: { fontSize: '13px', color: 'var(--color-text-muted)' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)' },
  input: { width: '100%', padding: '10px 12px', fontSize: '14px', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' },
  passwordWrapper: { position: 'relative' },
  eyeButton: { position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' },
  generalError: { fontSize: '13px', color: 'var(--color-error)', backgroundColor: 'var(--color-error-bg)', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--color-error)' },
  successBox: { fontSize: '13px', color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '10px 12px', borderRadius: '4px', border: '1px solid rgba(34, 197, 94, 0.2)' },
  rememberRow: { display: 'flex', alignItems: 'center' },
  rememberLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)', cursor: 'pointer' },
  checkbox: { width: '15px', height: '15px', accentColor: 'var(--color-primary)', cursor: 'pointer' },
  loginButton: { width: '100%', padding: '12px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' },
  toggleButton: { background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '13px', cursor: 'pointer', marginTop: '8px', width: '100%' },
  securitySection: { marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '12px' },
  sectionTitle: { fontSize: '14px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0px' },
};
