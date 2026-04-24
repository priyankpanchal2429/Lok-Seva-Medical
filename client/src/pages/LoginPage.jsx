/**
 * LoginPage Component (Hybrid: Login + Register)
 * Handles both authentication and new account creation in one dynamic card.
 */

import { useState, useCallback, useRef, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { sanitizeInput, isEmpty } from '../utils/sanitize';
import ThemeToggle from '../components/ThemeToggle';

/** SVG eye icons */
const EyeIcon = memo(() => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
));
const EyeOffIcon = memo(() => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /></svg>
));
const MedicalIcon = memo(() => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.9 }}><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
));

export default function LoginPage() {
  const navigate = useNavigate();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState('login');

  // Form states
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    name: '',
    confirmPassword: '',
    answer1: '',
    answer2: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const userIdRef = useRef(null);

  // Auto-focus on mount
  useEffect(() => { userIdRef.current?.focus(); }, []);

  // Load remembered user
  useEffect(() => {
    const remembered = localStorage.getItem('lok-seva-remembered-user');
    if (remembered) {
      setFormData(prev => ({ ...prev, userId: remembered }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (status.message) setStatus({ type: '', message: '' });
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setStatus({ type: '', message: '' });
  };

  /** Handle Form Submission */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    const { userId, password, name, confirmPassword, answer1, answer2 } = formData;
    const sanitizedUserId = sanitizeInput(userId).trim();

    try {
      if (mode === 'login') {
        // LOGIN FLOW
        if (!userId || !password) {
          setStatus({ type: 'error', message: 'User ID and Password are required.' });
          setIsSubmitting(false);
          return;
        }

        const response = await api.post('/auth/login', { userId: sanitizedUserId, password });
        if (response.data.token) localStorage.setItem('lok-seva-token', response.data.token);
        
        if (rememberMe) localStorage.setItem('lok-seva-remembered-user', sanitizedUserId);
        else localStorage.removeItem('lok-seva-remembered-user');

        navigate('/dashboard', { replace: true });

      } else {
        // REGISTER FLOW
        if (!name || !userId || !password || !confirmPassword || !answer1 || !answer2) {
          setStatus({ type: 'error', message: 'All fields are required.' });
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setStatus({ type: 'error', message: 'Passwords do not match.' });
          setIsSubmitting(false);
          return;
        }

        const response = await api.post('/auth/register', {
          name: sanitizeInput(name),
          userId: sanitizedUserId,
          password,
          answer1: sanitizeInput(answer1),
          answer2: sanitizeInput(answer2),
        });

        setStatus({ type: 'success', message: response.data.message });
        setTimeout(() => switchMode('login'), 2000);
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Action failed. Please try again.';
      setStatus({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      {/* LEFT PANEL */}
      <div className="login-left-panel">
        <div style={styles.leftContent}>
          <MedicalIcon />
          <h1 style={styles.storeName}>Lok Seva Medical Store</h1>
          <p style={styles.subtitle}>Secure Access Panel</p>
        </div>
        <div style={styles.leftOverlay} />
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right-panel">
        <div style={styles.themeToggleWrapper}><ThemeToggle /></div>

        <div className="login-card">
          {/* TAB SELECTOR */}
          <div style={styles.tabWrapper}>
            <button 
              style={{ ...styles.tab, ...(mode === 'login' ? styles.activeTab : {}) }} 
              onClick={() => switchMode('login')}
            >
              Sign In
            </button>
            <button 
              style={{ ...styles.tab, ...(mode === 'register' ? styles.activeTab : {}) }} 
              onClick={() => switchMode('register')}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate style={styles.form}>
            <div className="error-container">
              {status.message && (
                <div style={{ ...styles.generalError, ...(status.type === 'success' ? styles.successBox : {}) }}>
                  {status.message}
                </div>
              )}
            </div>

            {mode === 'register' && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Full Name</label>
                <input name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Enter your full name" style={styles.input} />
              </div>
            )}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>User ID</label>
              <input ref={userIdRef} name="userId" type="text" value={formData.userId} onChange={handleChange} placeholder="Enter your User ID" style={styles.input} autoComplete="username" />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordWrapper}>
                <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="Enter your password" style={{ ...styles.input, ...styles.passwordInput }} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Confirm Password</label>
                  <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" style={styles.input} />
                </div>
                <div style={styles.securityDivider}>Security Questions</div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>What is your birth place?</label>
                  <input name="answer1" type="text" value={formData.answer1} onChange={handleChange} placeholder="Enter answer" style={styles.input} />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>What is your 1st vehicle?</label>
                  <input name="answer2" type="text" value={formData.answer2} onChange={handleChange} placeholder="Enter answer" style={styles.input} />
                </div>
              </>
            )}

            {mode === 'login' && (
              <div style={styles.rememberRow}>
                <label style={styles.rememberLabel}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={styles.checkbox} />
                  <span>Remember me</span>
                </label>
              </div>
            )}

            <button type="submit" style={styles.loginButton} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  leftContent: { position: 'relative', zIndex: 2, textAlign: 'center', color: 'var(--color-panel-text)', padding: '40px' },
  storeName: { fontSize: '28px', fontWeight: 700, marginTop: '16px', color: 'var(--color-panel-text)', letterSpacing: '-0.5px', lineHeight: 1.2 },
  subtitle: { fontSize: '14px', marginTop: '8px', color: 'var(--color-panel-subtitle)', fontWeight: 400, letterSpacing: '1px', textTransform: 'uppercase' },
  leftOverlay: { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.05) 0%, transparent 60%)', zIndex: 1 },
  themeToggleWrapper: { position: 'absolute', top: '20px', right: '20px', zIndex: 10 },
  tabWrapper: { display: 'flex', gap: '2px', marginBottom: '24px', backgroundColor: 'var(--color-bg)', padding: '4px', borderRadius: '8px' },
  tab: { flex: 1, padding: '10px', fontSize: '14px', fontWeight: 600, border: 'none', background: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', borderRadius: '6px', transition: 'all 0.2s' },
  activeTab: { backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)' },
  input: { width: '100%', padding: '10px 12px', fontSize: '14px', fontFamily: 'Inter, sans-serif', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '4px', outline: 'none', transition: 'border-color 0.15s ease', boxSizing: 'border-box' },
  passwordWrapper: { position: 'relative' },
  passwordInput: { paddingRight: '44px' },
  eyeButton: { position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  generalError: { fontSize: '13px', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px 12px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)' },
  successBox: { color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' },
  securityDivider: { fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '8px', paddingBottom: '4px', borderBottom: '1px solid var(--color-border)' },
  rememberRow: { display: 'flex', alignItems: 'center', marginTop: '-4px' },
  rememberLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)', cursor: 'pointer' },
  checkbox: { width: '15px', height: '15px', accentColor: 'var(--color-primary)', cursor: 'pointer' },
  loginButton: { width: '100%', padding: '12px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s ease', marginTop: '8px' },
};
