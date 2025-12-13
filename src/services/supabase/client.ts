/**
 * Supabase Client Initialization
 *
 * PATTERN: Singleton with lazy initialization
 * WHY: Prevents initialization if env vars missing, reduces bundle impact
 * SECURITY: Environment variables, no hardcoded credentials
 * PROGRESSIVE ENHANCEMENT: Returns null if not configured, app works without Supabase
 *
 * @module services/supabase/client
 * @see docs/architecture/SUPABASE_INTEGRATION_ARCHITECTURE.md
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { logger } from '../../utils/logger';

/**
 * Singleton instance of Supabase client
 * Initialized lazily on first access
 */
let supabaseClient: SupabaseClient<Database> | null = null;

/**
 * Configuration options for Supabase client
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  options?: {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
    };
    global?: {
      headers?: Record<string, string>;
    };
  };
}

/**
 * Gets or creates the Supabase client instance
 *
 * This function implements lazy initialization to avoid creating a client
 * when Supabase is not configured. It gracefully returns null if environment
 * variables are missing, allowing the app to work in offline-only mode.
 *
 * @returns {SupabaseClient<Database> | null} Supabase client instance or null if not configured
 *
 * @example
 * ```typescript
 * const supabase = getSupabaseClient();
 * if (supabase) {
 *   // Supabase is configured, use it
 *   const { data, error } = await supabase.from('profiles').select();
 * } else {
 *   // Fall back to localStorage-only mode
 * }
 * ```
 */
export function getSupabaseClient(): SupabaseClient<Database> | null {
  // Return existing instance if available
  if (supabaseClient) {
    return supabaseClient;
  }

  // Check for required environment variables
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (import.meta.env.DEV) {
      logger.info(
        '[Supabase] Not configured - running in offline mode. ' +
          'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable sync.'
      );
    }
    return null;
  }

  try {
    // Create client with PWA-optimized settings
    supabaseClient = createClient<Database>(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // PWA doesn't need URL-based auth
        storage: window.localStorage, // Explicit localStorage for session persistence
      },
      global: {
        headers: {
          'X-App-Version': import.meta.env.VITE_APP_VERSION || '1.0.0',
          'X-Client-Type': 'pwa',
        },
      },
      realtime: {
        // Disable realtime by default for performance
        // Can be enabled per-feature as needed
        params: {
          eventsPerSecond: 2,
        },
      },
    });

    if (import.meta.env.DEV) {
      logger.info('[Supabase] Client initialized successfully', {
        url: url.replace(/https?:\/\//, '').split('.')[0] + '.supabase.co',
        hasAuth: true,
      });
    }

    return supabaseClient;
  } catch (error) {
    logger.error('[Supabase] Failed to initialize client:', error);
    return null;
  }
}

/**
 * Checks if Supabase is configured
 *
 * Useful for conditional UI elements or feature flags based on
 * whether cloud sync is available.
 *
 * @returns {boolean} True if Supabase environment variables are present
 *
 * @example
 * ```typescript
 * if (isSupabaseConfigured()) {
 *   return <CloudSyncButton />;
 * }
 * ```
 */
export function isSupabaseConfigured(): boolean {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

/**
 * Checks if sync is enabled
 *
 * Sync can be disabled via environment variable even if Supabase is configured.
 * This is useful for testing or gradual rollout.
 *
 * @returns {boolean} True if sync should be active
 */
export function isSyncEnabled(): boolean {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const syncEnabled = import.meta.env.VITE_SUPABASE_SYNC_ENABLED;

  // Default to true if not specified
  if (syncEnabled === undefined) {
    return true;
  }

  return syncEnabled === 'true' || syncEnabled === true;
}

/**
 * Gets the configured sync interval
 *
 * @returns {number} Sync interval in milliseconds (default: 30000 = 30 seconds)
 */
export function getSyncInterval(): number {
  const interval = import.meta.env.VITE_SUPABASE_SYNC_INTERVAL;

  if (interval && !isNaN(Number(interval))) {
    return Number(interval);
  }

  return 30000; // Default 30 seconds
}

/**
 * Resets the Supabase client instance
 *
 * Useful for testing or when signing out to ensure a fresh client
 * is created on next access.
 *
 * @internal
 */
export function resetSupabaseClient(): void {
  supabaseClient = null;
}
