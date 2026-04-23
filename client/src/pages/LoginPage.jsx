/**
 * LoginPage Component
 * Split-layout login page with medical green left panel and clean form on right.
 * Handles input validation, sanitization, and API communication.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { sanitizeInput, isEmpty } from '../utils/sanitize';
import ThemeToggle from '../components/ThemeToggle';

/** SVG eye icon for showing password */
function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** SVG eye-off icon for hiding password */
function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    </svg>
  );
}

/** Small medical cross icon for branding */
function MedicalIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.9 }}>
      <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();

  // Form state
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error state
  const [userIdError, setUserIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // Refs
  const userIdRef = useRef(null);

  // Auto-focus User ID input on mount
  useEffect(() => {
    userIdRef.current?.focus();
  }, []);

  // Load remembered user ID
  useEffect(() => {
    const remembered = localStorage.getItem('lok-seva-remembered-user');
    if (remembered) {
      setUserId(remembered);
      setRememberMe(true);
    }
  }, []);

  /** Clear field-level errors on input change */
  const handleUserIdChange = useCallback((e) => {
    setUserId(e.target.value);
    if (userIdError) setUserIdError('');
    if (generalError) setGeneralError('');
  }, [userIdError, generalError]);

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError('');
    if (generalError) setGeneralError('');
  }, [passwordError, generalError]);

  /** Validate form inputs before submission */
  const validateForm = useCallback(() => {
    let valid = true;

    if (isEmpty(userId)) {
      setUserIdError('User ID is required.');
      valid = false;
    }

    if (isEmpty(password)) {
      setPasswordError('Password is required.');
      valid = false;
    }

    return valid;
  }, [userId, password]);

  /** Handle form submission */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Clear previous errors
    setGeneralError('');
    setUserIdError('');
    setPasswordError('');

    // Validate
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const sanitizedUserId = sanitizeInput(userId);

      const response = await api.post('/auth/login', {
        userId: sanitizedUserId,
        password, // Password sent as-is (bcrypt handles comparison server-side)
      });

      // Handle "Remember Me"
      if (rememberMe) {
        localStorage.setItem('lok-seva-remembered-user', sanitizedUserId);
      } else {
        localStorage.removeItem('lok-seva-remembered-user');
      }

      // Navigate to dashboard on success
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed. Please try again.';
      setGeneralError(message);

      // 1-second delay before re-enabling the form (basic frontend rate limit)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, password, rememberMe, validateForm, navigate]);

  /** Prevent paste on password field */
  const handlePasswordPaste = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <div style={styles.container}>
      {/* ===== LEFT PANEL ===== */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <MedicalIcon />
          <h1 style={styles.storeName}>Lok Seva Medical Store</h1>
          <p style={styles.subtitle}>Secure Access Panel</p>
        </div>

        {/* Subtle decorative element — radial gradient overlay */}
        <div style={styles.leftOverlay} />
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div style={styles.rightPanel}>
        {/* Theme toggle — top right */}
        <div style={styles.themeToggleWrapper}>
          <ThemeToggle />
        </div>

        {/* Login Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Sign In</h2>
            <p style={styles.cardSubtitle}>Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} noValidate style={styles.form}>
            {/* General error message */}
            {generalError && (
              <div id="login-error" style={styles.generalError} role="alert">
                {generalError}
              </div>
            )}

            {/* User ID */}
            <div style={styles.fieldGroup}>
              <label htmlFor="userId" style={styles.label}>User ID</label>
              <input
                ref={userIdRef}
                id="userId"
                type="text"
                value={userId}
                onChange={handleUserIdChange}
                placeholder="Enter your User ID"
                autoComplete="username"
                spellCheck={false}
                disabled={isSubmitting}
                style={{
                  ...styles.input,
                  ...(userIdError ? styles.inputError : {}),
                }}
              />
              {userIdError && <span style={styles.fieldError}>{userIdError}</span>}
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  onPaste={handlePasswordPaste}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  style={{
                    ...styles.input,
                    ...styles.passwordInput,
                    ...(passwordError ? styles.inputError : {}),
                  }}
                />
                <button
                  id="toggle-password"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={styles.eyeButton}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {passwordError && <span style={styles.fieldError}>{passwordError}</span>}
            </div>

            {/* Remember Me */}
            <div style={styles.rememberRow}>
              <label htmlFor="rememberMe" style={styles.rememberLabel}>
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={styles.checkbox}
                />
                <span>Remember me</span>
              </label>
            </div>

            {/* Submit */}
            <button
              id="login-button"
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.submitButton,
                ...(isSubmitting ? styles.submitButtonDisabled : {}),
              }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Styles (inline for performance — no separate CSS file needed)
// ============================================================

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
  },

  // ----- Left Panel -----
  leftPanel: {
    position: 'relative',
    width: '40%',
    backgroundColor: 'var(--color-panel-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // Hide on mobile
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  leftContent: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    color: 'var(--color-panel-text)',
    padding: '40px',
  },
  storeName: {
    fontSize: '28px',
    fontWeight: 700,
    marginTop: '16px',
    color: 'var(--color-panel-text)',
    letterSpacing: '-0.5px',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '14px',
    marginTop: '8px',
    color: 'var(--color-panel-subtitle)',
    fontWeight: 400,
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  leftOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.05) 0%, transparent 60%)',
    zIndex: 1,
  },

  // ----- Right Panel -----
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-bg)',
    position: 'relative',
    padding: '24px',
  },
  themeToggleWrapper: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    zIndex: 10,
  },

  // ----- Card -----
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '4px',
    padding: '40px 32px',
  },
  cardHeader: {
    marginBottom: '28px',
  },
  cardTitle: {
    fontSize: '22px',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: '4px',
  },
  cardSubtitle: {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
  },

  // ----- Form -----
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.15s ease',
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: 'var(--color-error)',
  },
  passwordWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: '44px',
  },
  eyeButton: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-muted)',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldError: {
    fontSize: '12px',
    color: 'var(--color-error)',
    marginTop: '2px',
  },
  generalError: {
    fontSize: '13px',
    color: 'var(--color-error)',
    backgroundColor: 'var(--color-error-bg)',
    padding: '10px 12px',
    borderRadius: '4px',
    border: '1px solid var(--color-error)',
  },
  rememberRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '-4px',
  },
  rememberLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkbox: {
    width: '15px',
    height: '15px',
    accentColor: 'var(--color-primary)',
    cursor: 'pointer',
  },
  submitButton: {
    width: '100%',
    padding: '11px 16px',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    backgroundColor: 'var(--color-primary)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    marginTop: '4px',
  },
  submitButtonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
};
