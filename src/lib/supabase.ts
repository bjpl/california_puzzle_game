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
import { logger } from '../utils/logger';

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
      game_settings: {
        Row: {
          id: string;
          user_id: string;
          difficulty: string;
          region: string;
          show_hints: boolean;
          enable_timer: boolean;
          sound_enabled: boolean;
          animations_enabled: boolean;
          auto_advance: boolean;
          master_volume: number;
          effects_volume: number;
          music_volume: number;
          muted: boolean;
          enable_background_music: boolean;
          enable_click_sounds: boolean;
          enable_game_sounds: boolean;
          enable_achievement_sounds: boolean;
          max_hints_per_level: number;
          hint_cooldown_ms: number;
          score_penalty_per_hint: number;
          free_hints_allowed: number;
          auto_suggest_threshold: number;
          enable_visual_indicators: boolean;
          enable_educational_hints: boolean;
          updated_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['game_settings']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['game_settings']['Insert']>;
      };
    };
  };
}

/**
 * Get optional environment variable
 *
 * CONCEPT: Safe environment variable access
 * WHY: Supabase is optional - app works without it
 * PATTERN: Runtime validation with TypeScript
 */
function getEnvVar(key: string, defaultValue?: string): string | undefined {
  const value = import.meta.env[key] || defaultValue;
  return value || undefined;
}

/**
 * Check if Supabase is configured
 *
 * CONCEPT: Optional Supabase integration
 * WHY: App should work offline or without backend
 * PATTERN: Feature flag based on config
 */
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

/** Whether Supabase is properly configured */
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  logger.info('[Supabase] Not configured - running in offline/local mode');
}

/**
 * Create typed Supabase client
 *
 * CONCEPT: Type-safe database client
 * WHY: Autocomplete and type checking for all queries
 * PATTERN: Generic client with custom database schema
 *
 * Note: When not configured, uses placeholder URL/key.
 * All operations will fail gracefully - check isSupabaseConfigured first.
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      // Enable anonymous sign-in
      autoRefreshToken: isSupabaseConfigured,
      persistSession: isSupabaseConfigured,
      detectSessionInUrl: true, // Enable OAuth redirect handling
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
  if (!isSupabaseConfigured) {
    logger.info('[Supabase] Not configured - skipping health check');
    return false;
  }

  try {
    const { error } = await supabase.auth.getSession();

    if (error) {
      logger.error('[Supabase] Health check failed:', error);
      return false;
    }

    logger.info('[Supabase] Health check passed');
    return true;
  } catch (error) {
    logger.error('[Supabase] Health check exception:', error);
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
  logger.info('[Supabase] Configuration:', {
    configured: isSupabaseConfigured,
    url: supabaseUrl || '(not set)',
    anonKey: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : '(not set)',
    autoRefresh: isSupabaseConfigured,
    persistSession: isSupabaseConfigured,
  });
}

// Initialize health check in development
if (import.meta.env.DEV) {
  checkSupabaseHealth().then((healthy) => {
    if (healthy) {
      logger.info('[Supabase] Client initialized successfully');
      logSupabaseConfig();
    } else {
      logger.warn('[Supabase] Client initialization with warnings');
    }
  });
}
