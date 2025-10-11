/**
 * Supabase Anonymous Authentication Service
 *
 * PATTERN: Anonymous-first authentication with optional upgrade
 * WHY: No user registration required, privacy-friendly
 * SECURITY: Session tokens stored securely, auto-refresh
 * PROGRESSIVE: Works without auth, graceful degradation
 *
 * @module services/supabase/auth
 * @see docs/architecture/SUPABASE_INTEGRATION_ARCHITECTURE.md
 */

import { getSupabaseClient } from './client';
import type { Session, User, AuthError } from '@supabase/supabase-js';

/**
 * Authentication status information
 */
export interface AuthStatus {
  /** Whether user has a valid session */
  isAuthenticated: boolean;
  /** Whether user is anonymous (not registered) */
  isAnonymous: boolean;
  /** User ID if authenticated */
  userId: string | null;
  /** Error message if authentication failed */
  error?: string;
}

/**
 * Initializes authentication
 *
 * This function checks for an existing session and creates an anonymous
 * session if none exists. It's the main entry point for auth initialization.
 *
 * Flow:
 * 1. Check if Supabase is configured
 * 2. Check for existing session
 * 3. If no session, create anonymous user
 * 4. Return auth status
 *
 * @returns {Promise<AuthStatus>} Current authentication status
 *
 * @example
 * ```typescript
 * const authStatus = await initializeAuth();
 * if (authStatus.isAuthenticated) {
 *   console.log('User ID:', authStatus.userId);
 *   console.log('Anonymous:', authStatus.isAnonymous);
 * }
 * ```
 */
export async function initializeAuth(): Promise<AuthStatus> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      isAuthenticated: false,
      isAnonymous: false,
      userId: null,
    };
  }

  try {
    // Check for existing session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    if (session) {
      if (import.meta.env.DEV) {
        console.info('[Auth] Existing session found', {
          userId: session.user.id.substring(0, 8) + '...',
          isAnonymous: session.user.is_anonymous ?? true,
        });
      }

      return {
        isAuthenticated: true,
        isAnonymous: session.user.is_anonymous ?? true,
        userId: session.user.id,
      };
    }

    // No session - create anonymous user
    return await signInAnonymously();
  } catch (error) {
    console.error('[Auth] Authentication initialization failed:', error);
    return {
      isAuthenticated: false,
      isAnonymous: false,
      userId: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Signs in anonymously
 *
 * Creates a new anonymous user session. Anonymous users can use the app
 * without providing any personal information.
 *
 * @returns {Promise<AuthStatus>} Authentication status after sign-in
 *
 * @example
 * ```typescript
 * const result = await signInAnonymously();
 * if (result.isAuthenticated) {
 *   console.log('Anonymous user created:', result.userId);
 * }
 * ```
 */
export async function signInAnonymously(): Promise<AuthStatus> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      isAuthenticated: false,
      isAnonymous: false,
      userId: null,
      error: 'Supabase not configured',
    };
  }

  try {
    if (import.meta.env.DEV) {
      console.info('[Auth] Creating anonymous session...');
    }

    const { data, error } = await supabase.auth.signInAnonymously({
      options: {
        data: {
          app_name: 'California Puzzle Game',
          app_version: import.meta.env.VITE_APP_VERSION || '1.0.0',
          created_at: new Date().toISOString(),
          client_type: 'pwa',
        },
      },
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('Anonymous sign-in succeeded but no user returned');
    }

    if (import.meta.env.DEV) {
      console.info('[Auth] Anonymous session created', {
        userId: data.user.id.substring(0, 8) + '...',
      });
    }

    return {
      isAuthenticated: true,
      isAnonymous: true,
      userId: data.user.id,
    };
  } catch (error) {
    console.error('[Auth] Anonymous sign-in failed:', error);
    return {
      isAuthenticated: false,
      isAnonymous: false,
      userId: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Gets current session
 *
 * Retrieves the current authentication session if one exists.
 *
 * @returns {Promise<Session | null>} Current session or null if not authenticated
 */
export async function getSession(): Promise<Session | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return session;
  } catch (error) {
    console.error('[Auth] Failed to get session:', error);
    return null;
  }
}

/**
 * Gets current user
 *
 * Retrieves the current authenticated user if one exists.
 *
 * @returns {Promise<User | null>} Current user or null if not authenticated
 */
export async function getUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Signs out current user
 *
 * Ends the current session and clears stored credentials.
 * After signing out, the user can sign in again to create a new session.
 *
 * @returns {Promise<boolean>} True if sign-out successful, false otherwise
 *
 * @example
 * ```typescript
 * const success = await signOut();
 * if (success) {
 *   console.log('Signed out successfully');
 * }
 * ```
 */
export async function signOut(): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    if (import.meta.env.DEV) {
      console.info('[Auth] Signed out successfully');
    }

    return true;
  } catch (error) {
    console.error('[Auth] Sign out failed:', error);
    return false;
  }
}

/**
 * Callback type for auth state changes
 */
export type AuthStateChangeCallback = (authStatus: AuthStatus) => void;

/**
 * Subscribes to authentication state changes
 *
 * Registers a callback that will be called whenever the authentication
 * state changes (sign-in, sign-out, token refresh, etc.)
 *
 * @param {AuthStateChangeCallback} callback - Function to call on auth changes
 * @returns {() => void} Unsubscribe function to stop listening
 *
 * @example
 * ```typescript
 * const unsubscribe = onAuthStateChange((status) => {
 *   console.log('Auth changed:', status);
 *   if (status.isAuthenticated) {
 *     startSync();
 *   } else {
 *     stopSync();
 *   }
 * });
 *
 * // Later, stop listening
 * unsubscribe();
 * ```
 */
export function onAuthStateChange(callback: AuthStateChangeCallback): () => void {
  const supabase = getSupabaseClient();

  if (!supabase) {
    // Return no-op unsubscribe if Supabase not configured
    return () => {};
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback({
      isAuthenticated: !!session,
      isAnonymous: session?.user.is_anonymous ?? false,
      userId: session?.user.id ?? null,
    });
  });

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Refreshes the current session
 *
 * Manually triggers a session refresh. Normally this happens automatically,
 * but this can be useful for testing or forcing an immediate refresh.
 *
 * @returns {Promise<Session | null>} Refreshed session or null if failed
 */
export async function refreshSession(): Promise<Session | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();

    if (error) {
      throw error;
    }

    if (import.meta.env.DEV) {
      console.info('[Auth] Session refreshed');
    }

    return session;
  } catch (error) {
    console.error('[Auth] Session refresh failed:', error);
    return null;
  }
}

/**
 * Checks if current session is valid
 *
 * Validates the current session without triggering a refresh.
 *
 * @returns {Promise<boolean>} True if session is valid
 */
export async function isSessionValid(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

/**
 * Gets authentication error details
 *
 * Extracts useful error information from Supabase auth errors.
 *
 * @param {unknown} error - Error from Supabase auth operation
 * @returns {string} Human-readable error message
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!error) {
    return 'Unknown error';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'Authentication failed';
}
