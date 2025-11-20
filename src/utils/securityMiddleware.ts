/**
 * Security Middleware for Supabase Integration
 *
 * Purpose: Add security layers to Supabase operations
 * Features:
 * - Request validation
 * - Rate limiting
 * - Input sanitization
 * - Error handling
 * - Security logging
 *
 * Last updated: 2025-11-03
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  sanitizeInput,
  apiRateLimiter,
  authRateLimiter,
  syncRateLimiter,
  securityLogger,
  containsXSS,
} from '../config/security';

// ============================================
// Request Validation
// ============================================

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: unknown;
}

/**
 * Validates and sanitizes data before database operations
 */
export function validateDatabaseInput(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    // Check for suspicious keys
    if (key.startsWith('_') || key.includes('__proto__')) {
      errors.push(`Invalid key: ${key}`);
      continue;
    }

    // Sanitize string values
    if (typeof value === 'string') {
      if (containsXSS(value)) {
        errors.push(`XSS detected in field: ${key}`);
        securityLogger.log('xss_attempt', `XSS in database input: ${key}`, { value });
        sanitizedData[key] = sanitizeInput(value);
      } else {
        sanitizedData[key] = sanitizeInput(value);
      }
    } else if (typeof value === 'number') {
      // Validate numbers
      if (!Number.isFinite(value)) {
        errors.push(`Invalid number in field: ${key}`);
        continue;
      }
      sanitizedData[key] = value;
    } else if (typeof value === 'boolean') {
      sanitizedData[key] = value;
    } else if (value === null) {
      sanitizedData[key] = null;
    } else if (typeof value === 'object') {
      // Recursively validate nested objects
      const nested = validateDatabaseInput(value as Record<string, unknown>);
      if (!nested.isValid) {
        errors.push(...nested.errors);
      }
      sanitizedData[key] = nested.sanitizedData;
    } else {
      // Unknown type
      errors.push(`Unsupported type in field: ${key}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData,
  };
}

// ============================================
// Rate-Limited Supabase Client Wrapper
// ============================================

/**
 * Wraps Supabase client with rate limiting
 */
export class SecureSupabaseClient {
  constructor(private client: SupabaseClient) {}

  /**
   * Execute a database query with rate limiting and validation
   */
  async secureQuery<T>(
    operation: 'select' | 'insert' | 'update' | 'delete',
    table: string,
    data?: Record<string, unknown>,
    options?: {
      rateLimitKey?: string;
      bypassValidation?: boolean;
    }
  ): Promise<{ data: T | null; error: Error | null }> {
    const rateLimitKey = options?.rateLimitKey || `${operation}:${table}`;

    // Check rate limit
    if (!apiRateLimiter.isAllowed(rateLimitKey)) {
      securityLogger.log('rate_limit', 'Database operation rate limited', {
        operation,
        table,
        rateLimitKey,
      });
      return {
        data: null,
        error: new Error('Rate limit exceeded. Please try again later.'),
      };
    }

    // Validate input data if provided
    if (data && !options?.bypassValidation) {
      const validation = validateDatabaseInput(data);
      if (!validation.isValid) {
        securityLogger.log('suspicious_activity', 'Invalid database input', {
          operation,
          table,
          errors: validation.errors,
        });
        return {
          data: null,
          error: new Error(`Validation failed: ${validation.errors.join(', ')}`),
        };
      }
      data = validation.sanitizedData as Record<string, unknown>;
    }

    // Execute operation
    try {
      let query;
      switch (operation) {
        case 'select':
          query = this.client.from(table).select();
          break;
        case 'insert':
          query = this.client.from(table).insert(data!);
          break;
        case 'update':
          query = this.client.from(table).update(data!);
          break;
        case 'delete':
          query = this.client.from(table).delete();
          break;
      }

      const result = await query;
      return result as { data: T | null; error: Error | null };
    } catch (error) {
      securityLogger.log('suspicious_activity', 'Database operation failed', {
        operation,
        table,
        error,
      });
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  /**
   * Secure authentication operations
   */
  async secureAuth(
    operation: 'signIn' | 'signUp' | 'signOut',
    credentials?: { email?: string; password?: string }
  ): Promise<{ data: unknown; error: Error | null }> {
    const rateLimitKey = `auth:${operation}`;

    // Check auth rate limit (more restrictive)
    if (!authRateLimiter.isAllowed(rateLimitKey)) {
      securityLogger.log('rate_limit', 'Auth operation rate limited', { operation });
      return {
        data: null,
        error: new Error('Too many authentication attempts. Please try again later.'),
      };
    }

    // Validate credentials
    if (credentials) {
      if (credentials.email) {
        credentials.email = sanitizeInput(credentials.email);
      }
      // Never log passwords
    }

    try {
      switch (operation) {
        case 'signIn': {
          if (!credentials?.email || !credentials?.password) {
            return {
              data: null,
              error: new Error('Email and password are required'),
            };
          }
          const signInResult = await this.client.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });
          if (signInResult.error) {
            securityLogger.log('auth_failure', `Auth ${operation} failed`, {
              operation,
              error: signInResult.error.message,
            });
          }
          return {
            data: signInResult.data,
            error: signInResult.error,
          };
        }
        case 'signUp': {
          if (!credentials?.email || !credentials?.password) {
            return {
              data: null,
              error: new Error('Email and password are required'),
            };
          }
          const signUpResult = await this.client.auth.signUp({
            email: credentials.email,
            password: credentials.password,
          });
          if (signUpResult.error) {
            securityLogger.log('auth_failure', `Auth ${operation} failed`, {
              operation,
              error: signUpResult.error.message,
            });
          }
          return {
            data: signUpResult.data,
            error: signUpResult.error,
          };
        }
        case 'signOut': {
          const signOutResult = await this.client.auth.signOut();
          if (signOutResult.error) {
            securityLogger.log('auth_failure', `Auth ${operation} failed`, {
              operation,
              error: signOutResult.error.message,
            });
          }
          return {
            data: null,
            error: signOutResult.error,
          };
        }
      }
    } catch (error) {
      securityLogger.log('auth_failure', `Auth ${operation} exception`, { operation, error });
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Authentication failed'),
      };
    }
  }

  /**
   * Get the underlying Supabase client (use with caution)
   */
  getClient(): SupabaseClient {
    return this.client;
  }
}

// ============================================
// Request Interceptors
// ============================================

/**
 * Intercepts and validates Supabase requests
 */
export function createRequestInterceptor() {
  return {
    /**
     * Before request hook
     */
    beforeRequest: (
      operation: string,
      table: string,
      data?: unknown
    ): { allowed: boolean; error?: string } => {
      // Check for suspicious patterns
      if (table.includes('..') || table.includes('/')) {
        securityLogger.log('suspicious_activity', 'Suspicious table name', { table, operation });
        return { allowed: false, error: 'Invalid table name' };
      }

      // Validate data
      if (data && typeof data === 'object') {
        const validation = validateDatabaseInput(data as Record<string, unknown>);
        if (!validation.isValid) {
          return { allowed: false, error: validation.errors.join(', ') };
        }
      }

      return { allowed: true };
    },

    /**
     * After request hook
     */
    afterRequest: (
      operation: string,
      table: string,
      result: { data: unknown; error: Error | null }
    ): void => {
      // Log errors
      if (result.error) {
        securityLogger.log('suspicious_activity', 'Request failed', {
          operation,
          table,
          error: result.error.message,
        });
      }
    },
  };
}

// ============================================
// Sync Security
// ============================================

/**
 * Secures data synchronization operations
 */
export class SyncSecurityManager {
  private lastSyncTime = 0;
  private syncInProgress = false;

  /**
   * Check if sync is allowed
   */
  canSync(userId: string): { allowed: boolean; reason?: string } {
    // Check rate limit
    if (!syncRateLimiter.isAllowed(userId)) {
      return { allowed: false, reason: 'Sync rate limit exceeded' };
    }

    // Prevent concurrent syncs
    if (this.syncInProgress) {
      return { allowed: false, reason: 'Sync already in progress' };
    }

    // Minimum time between syncs
    const minInterval = 5000; // 5 seconds
    const timeSinceLastSync = Date.now() - this.lastSyncTime;
    if (timeSinceLastSync < minInterval) {
      return { allowed: false, reason: 'Sync too frequent' };
    }

    return { allowed: true };
  }

  /**
   * Start sync operation
   */
  startSync(): void {
    this.syncInProgress = true;
    this.lastSyncTime = Date.now();
  }

  /**
   * Complete sync operation
   */
  completeSync(): void {
    this.syncInProgress = false;
  }

  /**
   * Validate sync data
   */
  validateSyncData(data: unknown): ValidationResult {
    if (typeof data !== 'object' || data === null) {
      return {
        isValid: false,
        errors: ['Sync data must be an object'],
      };
    }

    return validateDatabaseInput(data as Record<string, unknown>);
  }
}

// ============================================
// Error Sanitization
// ============================================

/**
 * Sanitizes error messages to prevent information leakage
 */
export function sanitizeError(error: Error): Error {
  // Don't expose internal error details in production
  if (import.meta.env.PROD) {
    // Generic error messages
    if (error.message.includes('RLS') || error.message.includes('policy')) {
      return new Error('Access denied');
    }
    if (error.message.includes('unique')) {
      return new Error('Resource already exists');
    }
    if (error.message.includes('foreign key')) {
      return new Error('Invalid reference');
    }
    // Generic fallback
    return new Error('An error occurred');
  }

  // In development, return original error
  return error;
}

// ============================================
// Exports
// ============================================

export default {
  validateDatabaseInput,
  SecureSupabaseClient,
  createRequestInterceptor,
  SyncSecurityManager,
  sanitizeError,
};
