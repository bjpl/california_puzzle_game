/**
 * Security Configuration Module
 *
 * Purpose: Centralized security configuration for the application
 * Features:
 * - Environment variable validation
 * - Security headers configuration
 * - CORS settings
 * - Content Security Policy
 * - Input sanitization
 * - Rate limiting configuration
 *
 * Last updated: 2025-11-03
 */

// ============================================
// Environment Variable Validation
// ============================================

interface EnvConfig {
  supabase: {
    url: string | null;
    anonKey: string | null;
    syncEnabled: boolean;
    realtimeEnabled: boolean;
  };
  analytics: {
    domain: string | null;
    apiHost: string | null;
    devAnalytics: boolean;
  };
  sentry: {
    dsn: string | null;
    devErrorReporting: boolean;
  };
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Validates and parses environment variables
 * @returns Validated environment configuration
 */
export function validateEnvConfig(): EnvConfig {
  const config: EnvConfig = {
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL || null,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || null,
      syncEnabled: import.meta.env.VITE_SUPABASE_SYNC_ENABLED !== 'false',
      realtimeEnabled: import.meta.env.VITE_SUPABASE_REALTIME_ENABLED === 'true',
    },
    analytics: {
      domain: import.meta.env.VITE_ANALYTICS_DOMAIN || null,
      apiHost: import.meta.env.VITE_ANALYTICS_API_HOST || 'https://plausible.io',
      devAnalytics: import.meta.env.VITE_DEV_ANALYTICS === 'true',
    },
    sentry: {
      dsn: import.meta.env.VITE_SENTRY_DSN || null,
      devErrorReporting: import.meta.env.VITE_DEV_ERROR_REPORTING === 'true',
    },
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  };

  // Validate critical environment variables
  if (config.supabase.url && !isValidUrl(config.supabase.url)) {
    console.error('Invalid VITE_SUPABASE_URL:', config.supabase.url);
    config.supabase.url = null;
  }

  if (config.supabase.anonKey && !isValidJWT(config.supabase.anonKey)) {
    console.error('Invalid VITE_SUPABASE_ANON_KEY format');
    config.supabase.anonKey = null;
  }

  // Warn if production mode without required configs
  if (config.isProduction) {
    if (!config.supabase.url || !config.supabase.anonKey) {
      console.warn('Production mode: Supabase not configured. Cloud sync will be disabled.');
    }
  }

  return config;
}

/**
 * Check if environment is properly configured
 */
export function isEnvConfigured(): boolean {
  const config = validateEnvConfig();
  return !!(config.supabase.url && config.supabase.anonKey);
}

// ============================================
// Security Headers Configuration
// ============================================

/**
 * Security headers to be set on responses
 * Note: Some headers are set in index.html CSP meta tag
 */
export const SECURITY_HEADERS = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Enable XSS filter in older browsers
  'X-XSS-Protection': '1; mode=block',

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy (feature policy)
  'Permissions-Policy': [
    'accelerometer=()',
    'camera=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=()',
    'usb=()',
  ].join(', '),
};

/**
 * Content Security Policy (CSP) configuration
 * Primary CSP is set in index.html, this is for reference/documentation
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"], // unsafe-inline needed for Vite dev
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https://*.supabase.co'],
  'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

// ============================================
// CORS Configuration
// ============================================

/**
 * CORS settings for API requests
 */
export const CORS_CONFIG = {
  allowedOrigins: [
    'https://california-puzzle.vercel.app',
    'https://bjpl.github.io',
    ...(import.meta.env.DEV ? ['http://localhost:3000', 'http://127.0.0.1:3000'] : []),
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// ============================================
// Input Sanitization
// ============================================

/**
 * Sanitizes user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Sanitizes HTML content - more aggressive
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') {
    return '';
  }

  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove objects
    .replace(/<embed\b[^<]*>/gi, '') // Remove embeds
    .trim();
}

/**
 * Validates and sanitizes URLs
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }

  // Only allow http and https protocols
  const match = url.match(/^(https?:\/\/)/i);
  if (!match) {
    return '';
  }

  try {
    const parsed = new URL(url);
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

// ============================================
// Rate Limiting
// ============================================

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitState {
  count: number;
  resetTime: number;
}

/**
 * Simple client-side rate limiter
 */
export class RateLimiter {
  private limits = new Map<string, RateLimitState>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }) {
    this.config = config;
  }

  /**
   * Check if request is allowed
   * @param key - Unique identifier for the rate limit (e.g., user ID, IP, action)
   * @returns true if request is allowed, false if rate limited
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const state = this.limits.get(key);

    if (!state || now >= state.resetTime) {
      // New window or expired window
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    if (state.count >= this.config.maxRequests) {
      // Rate limit exceeded
      return false;
    }

    // Increment count
    state.count++;
    return true;
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string): number {
    const now = Date.now();
    const state = this.limits.get(key);

    if (!state || now >= state.resetTime) {
      return this.config.maxRequests;
    }

    return Math.max(0, this.config.maxRequests - state.count);
  }

  /**
   * Get time until reset in milliseconds
   */
  getResetTime(key: string): number {
    const now = Date.now();
    const state = this.limits.get(key);

    if (!state || now >= state.resetTime) {
      return 0;
    }

    return state.resetTime - now;
  }

  /**
   * Clear rate limit for a key
   */
  clear(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.limits.clear();
  }
}

// ============================================
// Session Security
// ============================================

/**
 * Secure session token generation
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates session token format
 */
export function isValidSessionToken(token: string): boolean {
  if (typeof token !== 'string') {
    return false;
  }
  // Must be hexadecimal string of specific length
  return /^[a-f0-9]{64}$/.test(token);
}

// ============================================
// Utility Functions
// ============================================

/**
 * Validates URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Basic JWT format validation
 */
function isValidJWT(token: string): boolean {
  if (typeof token !== 'string') {
    return false;
  }
  // JWT has 3 parts separated by dots
  const parts = token.split('.');
  return parts.length === 3 && parts.every((part) => part.length > 0);
}

/**
 * Check if content contains potential XSS
 */
export function containsXSS(content: string): boolean {
  if (typeof content !== 'string') {
    return false;
  }

  const xssPatterns = [/<script/i, /<iframe/i, /javascript:/i, /on\w+\s*=/i, /<object/i, /<embed/i];

  return xssPatterns.some((pattern) => pattern.test(content));
}

// ============================================
// Export Singleton Instances
// ============================================

// Rate limiters for different operations
export const apiRateLimiter = new RateLimiter({ maxRequests: 60, windowMs: 60000 }); // 60 req/min
export const authRateLimiter = new RateLimiter({ maxRequests: 5, windowMs: 300000 }); // 5 req/5min
export const syncRateLimiter = new RateLimiter({ maxRequests: 10, windowMs: 30000 }); // 10 req/30sec

// Export validated config
export const securityConfig = validateEnvConfig();

// ============================================
// Security Audit Log
// ============================================

export interface SecurityEvent {
  type: 'xss_attempt' | 'rate_limit' | 'invalid_token' | 'auth_failure' | 'suspicious_activity';
  message: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Simple security event logger
 */
export class SecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 100;

  log(type: SecurityEvent['type'], message: string, metadata?: Record<string, unknown>): void {
    const event: SecurityEvent = {
      type,
      message,
      timestamp: Date.now(),
      metadata,
    };

    this.events.push(event);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (securityConfig.isDevelopment) {
      console.warn('[Security]', type, message, metadata);
    }
  }

  getEvents(): SecurityEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }
}

export const securityLogger = new SecurityLogger();

// ============================================
// Exports
// ============================================

export default {
  validateEnvConfig,
  isEnvConfigured,
  SECURITY_HEADERS,
  CSP_DIRECTIVES,
  CORS_CONFIG,
  sanitizeInput,
  sanitizeHtml,
  sanitizeUrl,
  RateLimiter,
  generateSecureToken,
  isValidSessionToken,
  containsXSS,
  apiRateLimiter,
  authRateLimiter,
  syncRateLimiter,
  securityConfig,
  SecurityLogger,
  securityLogger,
};
