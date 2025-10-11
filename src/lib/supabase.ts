/**
 * Supabase Client Configuration
 *
 * Purpose: Initialize and export Supabase client instance
 * Features: Type-safe client, environment variable validation
 *
 * Usage:
 *   import { supabase } from '@/lib/supabase';
 *   const { data, error } = await supabase.auth.signInAnonymously();
 *
 * Last updated: 2025-10-11
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
// Logger removed - using console directly for Supabase client

/**
 * Database schema type definition
 *
 * CONCEPT: Type-safe database operations
 * WHY: Catch schema errors at compile time
 * PATTERN: TypeScript interface for Supabase tables
 */
export interface Database {
  public: {
    Tables: {
      game_sessions: {
        Row: {
          id: string;
          user_id: string;
          score: number;
          difficulty: string;
          region: string;
          completed_at: string;
          time_elapsed: number;
          accuracy: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['game_sessions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['game_sessions']['Insert']>;
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          total_score: number;
          total_games: number;
          best_score: number;
          achievements: string[];
          updated_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_progress']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['user_progress']['Insert']>;
      };
    };
  };
}

/**
 * Get environment variable with validation
 *
 * CONCEPT: Safe environment variable access
 * WHY: Fail fast if required config is missing
 * PATTERN: Runtime validation with TypeScript
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] || defaultValue;

  if (!value) {
    const errorMsg = `Missing required environment variable: ${key}`;
    console.error('[Supabase]', errorMsg);
    throw new Error(errorMsg);
  }

  return value;
}

/**
 * Supabase configuration
 *
 * CONCEPT: Centralized config with validation
 * WHY: Single source of truth for Supabase settings
 * PATTERN: Config object with runtime checks
 */
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

/**
 * Create typed Supabase client
 *
 * CONCEPT: Type-safe database client
 * WHY: Autocomplete and type checking for all queries
 * PATTERN: Generic client with custom database schema
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      // Enable anonymous sign-in
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // We're not using OAuth flows
      storage: window.localStorage, // Persist session in localStorage
      storageKey: 'california-puzzle-auth-token',
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'california-puzzle-game@1.0.0',
      },
    },
  }
);

/**
 * Check if Supabase is properly configured
 *
 * CONCEPT: Configuration health check
 * WHY: Detect misconfiguration early
 * PATTERN: Async validation with error handling
 */
export async function checkSupabaseHealth(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.getSession();

    if (error) {
      console.error('[Supabase] Health check failed:', error);
      return false;
    }

    console.info('[Supabase] Health check passed');
    return true;
  } catch (error) {
    console.error('[Supabase] Health check exception:', error);
    return false;
  }
}

/**
 * Log current Supabase configuration (safe for production)
 *
 * CONCEPT: Debug helper with security
 * WHY: Help troubleshoot config issues without exposing secrets
 * PATTERN: Masked logging
 */
export function logSupabaseConfig(): void {
  console.info('[Supabase] Configuration:', {
    url: supabaseUrl,
    anonKey: supabaseAnonKey.substring(0, 20) + '...',
    autoRefresh: true,
    persistSession: true,
  });
}

// Initialize health check in development
if (import.meta.env.DEV) {
  checkSupabaseHealth().then((healthy) => {
    if (healthy) {
      console.info('[Supabase] Client initialized successfully');
      logSupabaseConfig();
    } else {
      console.warn('[Supabase] Client initialization with warnings');
    }
  });
}
