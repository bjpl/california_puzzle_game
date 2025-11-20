/**
 * Security Hooks for React Components
 *
 * Purpose: Provide security utilities as React hooks
 * Features:
 * - Input sanitization
 * - Rate limiting
 * - XSS detection
 * - Security event logging
 *
 * Last updated: 2025-11-03
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  sanitizeInput,
  sanitizeHtml,
  sanitizeUrl,
  containsXSS,
  RateLimiter,
  securityLogger,
  type SecurityEvent,
} from '../config/security';

// ============================================
// Input Sanitization Hook
// ============================================

interface UseSanitizedInputOptions {
  maxLength?: number;
  allowHtml?: boolean;
  onXSSDetected?: (input: string) => void;
}

/**
 * Hook for sanitizing user input in real-time
 * @param initialValue - Initial input value
 * @param options - Sanitization options
 */
export function useSanitizedInput(
  initialValue: string = '',
  options: UseSanitizedInputOptions = {}
) {
  const { maxLength = 1000, allowHtml = false, onXSSDetected } = options;
  const [value, setValue] = useState(sanitizeInput(initialValue));
  const [isXSSDetected, setIsXSSDetected] = useState(false);

  const handleChange = useCallback(
    (newValue: string) => {
      // Check for XSS
      const hasXSS = containsXSS(newValue);
      setIsXSSDetected(hasXSS);

      if (hasXSS) {
        securityLogger.log('xss_attempt', 'XSS detected in user input', { input: newValue });
        onXSSDetected?.(newValue);
      }

      // Sanitize based on options
      let sanitized = allowHtml ? sanitizeHtml(newValue) : sanitizeInput(newValue);

      // Apply max length
      if (maxLength && sanitized.length > maxLength) {
        sanitized = sanitized.slice(0, maxLength);
      }

      setValue(sanitized);
    },
    [maxLength, allowHtml, onXSSDetected]
  );

  return {
    value,
    setValue: handleChange,
    isXSSDetected,
    sanitizedValue: value,
  };
}

// ============================================
// Rate Limiting Hook
// ============================================

interface UseRateLimitOptions {
  maxRequests: number;
  windowMs: number;
  key?: string;
  onRateLimitExceeded?: () => void;
}

/**
 * Hook for rate limiting actions
 * @param options - Rate limit configuration
 */
export function useRateLimit(options: UseRateLimitOptions) {
  const { maxRequests, windowMs, key = 'default', onRateLimitExceeded } = options;
  const rateLimiterRef = useRef(new RateLimiter({ maxRequests, windowMs }));
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [remaining, setRemaining] = useState(maxRequests);
  const [resetTime, setResetTime] = useState(0);

  const checkRateLimit = useCallback(() => {
    const limiter = rateLimiterRef.current;
    const allowed = limiter.isAllowed(key);

    if (!allowed) {
      setIsRateLimited(true);
      onRateLimitExceeded?.();
      securityLogger.log('rate_limit', 'Rate limit exceeded', { key });
    }

    setRemaining(limiter.getRemaining(key));
    setResetTime(limiter.getResetTime(key));

    return allowed;
  }, [key, onRateLimitExceeded]);

  const reset = useCallback(() => {
    rateLimiterRef.current.clear(key);
    setIsRateLimited(false);
    setRemaining(maxRequests);
    setResetTime(0);
  }, [key, maxRequests]);

  // Auto-reset when time expires
  useEffect(() => {
    if (resetTime > 0) {
      const timer = setTimeout(() => {
        setIsRateLimited(false);
        setRemaining(maxRequests);
        setResetTime(0);
      }, resetTime);

      return () => clearTimeout(timer);
    }
  }, [resetTime, maxRequests]);

  return {
    checkRateLimit,
    isRateLimited,
    remaining,
    resetTime,
    reset,
  };
}

// ============================================
// Security Event Monitoring Hook
// ============================================

/**
 * Hook for monitoring security events
 */
export function useSecurityEvents() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);

  useEffect(() => {
    // Initial load
    setEvents(securityLogger.getEvents());

    // Poll for updates (simple implementation)
    const interval = setInterval(() => {
      setEvents(securityLogger.getEvents());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const clearEvents = useCallback(() => {
    securityLogger.clearEvents();
    setEvents([]);
  }, []);

  return {
    events,
    clearEvents,
    hasEvents: events.length > 0,
  };
}

// ============================================
// URL Validation Hook
// ============================================

interface UseSecureUrlOptions {
  onInvalidUrl?: (url: string) => void;
}

/**
 * Hook for validating and sanitizing URLs
 * @param initialUrl - Initial URL value
 * @param options - Validation options
 */
export function useSecureUrl(initialUrl: string = '', options: UseSecureUrlOptions = {}) {
  const { onInvalidUrl } = options;
  const [url, setUrl] = useState(sanitizeUrl(initialUrl));
  const [isValid, setIsValid] = useState(true);

  const handleChange = useCallback(
    (newUrl: string) => {
      const sanitized = sanitizeUrl(newUrl);
      setUrl(sanitized);

      const valid = sanitized === newUrl && sanitized.length > 0;
      setIsValid(valid);

      if (!valid && newUrl.length > 0) {
        onInvalidUrl?.(newUrl);
        securityLogger.log('suspicious_activity', 'Invalid URL detected', { url: newUrl });
      }
    },
    [onInvalidUrl]
  );

  return {
    url,
    setUrl: handleChange,
    isValid,
    sanitizedUrl: url,
  };
}

// ============================================
// CSRF Token Hook
// ============================================

/**
 * Hook for generating and validating CSRF tokens
 */
export function useCSRFToken() {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    // Generate token on mount
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const newToken = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    setToken(newToken);
  }, []);

  const validateToken = useCallback(
    (submittedToken: string): boolean => {
      return submittedToken === token;
    },
    [token]
  );

  const regenerate = useCallback(() => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const newToken = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    setToken(newToken);
  }, []);

  return {
    token,
    validateToken,
    regenerate,
  };
}

// ============================================
// Content Security Hook
// ============================================

interface UseSecureContentOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  onSecurityViolation?: (content: string, reason: string) => void;
}

/**
 * Hook for securing user-generated content
 */
export function useSecureContent(options: UseSecureContentOptions = {}) {
  const { onSecurityViolation } = options;

  const validateContent = useCallback(
    (content: string): { isValid: boolean; sanitized: string; violations: string[] } => {
      const violations: string[] = [];

      // Check for XSS
      if (containsXSS(content)) {
        violations.push('XSS patterns detected');
        securityLogger.log('xss_attempt', 'XSS in user content', { content });
      }

      // Check for scripts
      if (/<script/i.test(content)) {
        violations.push('Script tags not allowed');
      }

      // Check for iframes
      if (/<iframe/i.test(content)) {
        violations.push('Iframe tags not allowed');
      }

      // Sanitize content
      const sanitized = sanitizeHtml(content);

      if (violations.length > 0) {
        onSecurityViolation?.(content, violations.join(', '));
      }

      return {
        isValid: violations.length === 0,
        sanitized,
        violations,
      };
    },
    [onSecurityViolation]
  );

  return {
    validateContent,
  };
}

// ============================================
// Session Security Hook
// ============================================

interface UseSecureSessionOptions {
  sessionKey?: string;
  expiryMs?: number;
  onSessionExpired?: () => void;
}

/**
 * Hook for managing secure sessions
 */
export function useSecureSession(options: UseSecureSessionOptions = {}) {
  const { sessionKey = 'app_session', expiryMs = 24 * 60 * 60 * 1000, onSessionExpired } = options;
  const [isExpired, setIsExpired] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  useEffect(() => {
    // Check session on mount
    // eslint-disable-next-line no-restricted-globals -- Session management requires direct localStorage access
    const stored = localStorage.getItem(sessionKey);
    if (stored) {
      try {
        const { expires } = JSON.parse(stored);
        if (Date.now() > expires) {
          setIsExpired(true);
          // eslint-disable-next-line no-restricted-globals -- Session management requires direct localStorage access
          localStorage.removeItem(sessionKey);
          onSessionExpired?.();
        } else {
          setExpiresAt(expires);
        }
      } catch {
        // eslint-disable-next-line no-restricted-globals -- Session management requires direct localStorage access
        localStorage.removeItem(sessionKey);
      }
    }
  }, [sessionKey, onSessionExpired]);

  const createSession = useCallback(() => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    const expires = Date.now() + expiryMs;

    // eslint-disable-next-line no-restricted-globals -- Session management requires direct localStorage access
    localStorage.setItem(sessionKey, JSON.stringify({ token, expires }));
    setExpiresAt(expires);
    setIsExpired(false);

    return token;
  }, [sessionKey, expiryMs]);

  const destroySession = useCallback(() => {
    // eslint-disable-next-line no-restricted-globals -- Session management requires direct localStorage access
    localStorage.removeItem(sessionKey);
    setExpiresAt(null);
    setIsExpired(true);
  }, [sessionKey]);

  const refreshSession = useCallback(() => {
    // eslint-disable-next-line no-restricted-globals -- Session management requires direct localStorage access
    const stored = localStorage.getItem(sessionKey);
    if (stored) {
      try {
        const { token: existingToken } = JSON.parse(stored);
        const expires = Date.now() + expiryMs;
        // eslint-disable-next-line no-restricted-globals -- Session management requires direct localStorage access
        localStorage.setItem(sessionKey, JSON.stringify({ token: existingToken, expires }));
        setExpiresAt(expires);
      } catch {
        createSession();
      }
    } else {
      createSession();
    }
  }, [sessionKey, expiryMs, createSession]);

  return {
    isExpired,
    expiresAt,
    createSession,
    destroySession,
    refreshSession,
  };
}

// ============================================
// Exports
// ============================================

export default {
  useSanitizedInput,
  useRateLimit,
  useSecurityEvents,
  useSecureUrl,
  useCSRFToken,
  useSecureContent,
  useSecureSession,
};
