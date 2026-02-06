import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './AuthModal.css';

type AuthMode = 'login' | 'signup' | 'reset';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" className="ca-auth-modal__google-icon">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    isLoading,
    error,
    clearError,
  } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Reset form state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMode('login');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setDisplayName('');
      setLocalError(null);
      setResetSent(false);
      setSignupSuccess(false);
      clearError();
      // Focus first input after animation
      setTimeout(() => firstInputRef.current?.focus(), 200);
    }
  }, [isOpen, clearError]);

  // Clear errors on mode switch
  useEffect(() => {
    setLocalError(null);
    setResetSent(false);
    setSignupSuccess(false);
    clearError();
  }, [mode, clearError]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    await signInWithGoogle();
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('Email is required');
      return;
    }
    if (!password) {
      setLocalError('Password is required');
      return;
    }

    await signInWithEmail(email.trim(), password);
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('Email is required');
      return;
    }
    if (!password) {
      setLocalError('Password is required');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    await signUpWithEmail(email.trim(), password, displayName.trim() || undefined);
    // Check if confirmation is needed (no session = confirmation required)
    setSignupSuccess(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('Email is required');
      return;
    }

    await resetPassword(email.trim());
    setResetSent(true);
  };

  const displayError = localError || (error?.message ?? null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="ca-auth-modal__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-label={
            mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Reset password'
          }
        >
          <motion.div
            className="ca-auth-modal"
            ref={modalRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="ca-auth-modal__header">
              <div className="ca-auth-modal__header-left">
                {mode === 'reset' && (
                  <button
                    className="ca-auth-modal__back-btn"
                    onClick={() => setMode('login')}
                    aria-label="Back to sign in"
                    type="button"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <h2 className="ca-auth-modal__title">
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'reset' && 'Reset Password'}
                </h2>
              </div>
              <button
                className="ca-auth-modal__close-btn"
                onClick={onClose}
                aria-label="Close"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="ca-auth-modal__body">
              {/* Signup success message */}
              {signupSuccess && mode === 'signup' && (
                <div className="ca-auth-modal__success">
                  <p>Check your email for a confirmation link to complete your registration.</p>
                  <button
                    className="ca-auth-modal__link"
                    onClick={() => {
                      setSignupSuccess(false);
                      setMode('login');
                    }}
                    type="button"
                  >
                    Back to sign in
                  </button>
                </div>
              )}

              {/* Reset success message */}
              {resetSent && mode === 'reset' && (
                <div className="ca-auth-modal__success">
                  <p>Password reset email sent. Check your inbox.</p>
                  <button
                    className="ca-auth-modal__link"
                    onClick={() => {
                      setResetSent(false);
                      setMode('login');
                    }}
                    type="button"
                  >
                    Back to sign in
                  </button>
                </div>
              )}

              {/* Forms (hidden when success messages shown) */}
              {!signupSuccess && !(resetSent && mode === 'reset') && (
                <>
                  {/* Google OAuth - shown for login and signup */}
                  {mode !== 'reset' && (
                    <>
                      <button
                        className="ca-auth-modal__google-btn"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        type="button"
                      >
                        <GoogleIcon />
                        <span>Continue with Google</span>
                      </button>

                      <div className="ca-auth-modal__divider">
                        <span className="ca-auth-modal__divider-line" />
                        <span className="ca-auth-modal__divider-text">or continue with email</span>
                        <span className="ca-auth-modal__divider-line" />
                      </div>
                    </>
                  )}

                  {/* Error display */}
                  {displayError && (
                    <div className="ca-auth-modal__error" role="alert">
                      {displayError}
                    </div>
                  )}

                  {/* Login Form */}
                  {mode === 'login' && (
                    <form onSubmit={handleEmailSignIn} className="ca-auth-modal__form">
                      <div className="ca-auth-modal__field">
                        <label htmlFor="auth-email" className="ca-auth-modal__label">
                          Email
                        </label>
                        <div className="ca-auth-modal__input-wrapper">
                          <Mail size={18} className="ca-auth-modal__input-icon" />
                          <input
                            ref={firstInputRef}
                            id="auth-email"
                            type="email"
                            className="ca-auth-modal__input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                          />
                        </div>
                      </div>

                      <div className="ca-auth-modal__field">
                        <label htmlFor="auth-password" className="ca-auth-modal__label">
                          Password
                        </label>
                        <div className="ca-auth-modal__input-wrapper">
                          <Lock size={18} className="ca-auth-modal__input-icon" />
                          <input
                            id="auth-password"
                            type="password"
                            className="ca-auth-modal__input"
                            placeholder="Your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="ca-auth-modal__forgot-link"
                        onClick={() => setMode('reset')}
                      >
                        Forgot password?
                      </button>

                      <button
                        type="submit"
                        className="ca-auth-modal__submit-btn"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 size={20} className="ca-auth-modal__spinner" />
                        ) : null}
                        <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
                      </button>

                      <p className="ca-auth-modal__switch-text">
                        Don&apos;t have an account?{' '}
                        <button
                          type="button"
                          className="ca-auth-modal__link"
                          onClick={() => setMode('signup')}
                        >
                          Sign up
                        </button>
                      </p>
                    </form>
                  )}

                  {/* Signup Form */}
                  {mode === 'signup' && (
                    <form onSubmit={handleEmailSignUp} className="ca-auth-modal__form">
                      <div className="ca-auth-modal__field">
                        <label htmlFor="auth-name" className="ca-auth-modal__label">
                          Display Name
                        </label>
                        <div className="ca-auth-modal__input-wrapper">
                          <User size={18} className="ca-auth-modal__input-icon" />
                          <input
                            ref={firstInputRef}
                            id="auth-name"
                            type="text"
                            className="ca-auth-modal__input"
                            placeholder="Your name (optional)"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            autoComplete="name"
                          />
                        </div>
                      </div>

                      <div className="ca-auth-modal__field">
                        <label htmlFor="auth-signup-email" className="ca-auth-modal__label">
                          Email
                        </label>
                        <div className="ca-auth-modal__input-wrapper">
                          <Mail size={18} className="ca-auth-modal__input-icon" />
                          <input
                            id="auth-signup-email"
                            type="email"
                            className="ca-auth-modal__input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                          />
                        </div>
                      </div>

                      <div className="ca-auth-modal__field">
                        <label htmlFor="auth-signup-password" className="ca-auth-modal__label">
                          Password
                        </label>
                        <div className="ca-auth-modal__input-wrapper">
                          <Lock size={18} className="ca-auth-modal__input-icon" />
                          <input
                            id="auth-signup-password"
                            type="password"
                            className="ca-auth-modal__input"
                            placeholder="Min 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            minLength={6}
                            required
                          />
                        </div>
                      </div>

                      <div className="ca-auth-modal__field">
                        <label htmlFor="auth-confirm-password" className="ca-auth-modal__label">
                          Confirm Password
                        </label>
                        <div className="ca-auth-modal__input-wrapper">
                          <Lock size={18} className="ca-auth-modal__input-icon" />
                          <input
                            id="auth-confirm-password"
                            type="password"
                            className="ca-auth-modal__input"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                            minLength={6}
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="ca-auth-modal__submit-btn"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 size={20} className="ca-auth-modal__spinner" />
                        ) : null}
                        <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
                      </button>

                      <p className="ca-auth-modal__switch-text">
                        Already have an account?{' '}
                        <button
                          type="button"
                          className="ca-auth-modal__link"
                          onClick={() => setMode('login')}
                        >
                          Sign in
                        </button>
                      </p>
                    </form>
                  )}

                  {/* Reset Password Form */}
                  {mode === 'reset' && (
                    <form onSubmit={handleResetPassword} className="ca-auth-modal__form">
                      <p className="ca-auth-modal__description">
                        Enter your email address and we&apos;ll send you a link to reset your
                        password.
                      </p>

                      <div className="ca-auth-modal__field">
                        <label htmlFor="auth-reset-email" className="ca-auth-modal__label">
                          Email
                        </label>
                        <div className="ca-auth-modal__input-wrapper">
                          <Mail size={18} className="ca-auth-modal__input-icon" />
                          <input
                            ref={firstInputRef}
                            id="auth-reset-email"
                            type="email"
                            className="ca-auth-modal__input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="ca-auth-modal__submit-btn"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 size={20} className="ca-auth-modal__spinner" />
                        ) : null}
                        <span>{isLoading ? 'Sending...' : 'Send Reset Link'}</span>
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
