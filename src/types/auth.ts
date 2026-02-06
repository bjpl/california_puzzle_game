/**
 * Authentication Type Definitions
 *
 * Purpose: Type-safe authentication state and operations
 * Last updated: 2025-10-11
 */

import type { User, Session, AuthError } from '@supabase/supabase-js';

/**
 * Auth state interface
 *
 * CONCEPT: Complete authentication state
 * WHY: Track user session, loading, and errors
 * PATTERN: Zustand state shape
 */
export interface AuthState {
  // Current authenticated user (null if not signed in)
  user: User | null;

  // Active session with access token
  session: Session | null;

  // Loading state for async auth operations
  isLoading: boolean;

  // Error from last auth operation
  error: AuthError | null;

  // Whether auth has been initialized
  initialized: boolean;
}

/**
 * Auth actions interface
 *
 * CONCEPT: Type-safe auth operations
 * WHY: Enforce consistent action signatures
 * PATTERN: Action methods for state mutations
 */
export interface AuthActions {
  /**
   * Sign in anonymously
   *
   * CONCEPT: Create anonymous session for guest users
   * WHY: Allow gameplay without registration
   * PATTERN: Async action with error handling
   */
  signInAnonymously: () => Promise<void>;

  /**
   * Sign out current user
   *
   * CONCEPT: Clear session and user data
   * WHY: Allow users to log out
   * PATTERN: Async action with cleanup
   */
  signOut: () => Promise<void>;

  /**
   * Refresh current session
   *
   * CONCEPT: Renew access token
   * WHY: Keep session alive without re-authentication
   * PATTERN: Token refresh flow
   */
  refreshSession: () => Promise<void>;

  /**
   * Initialize auth from storage
   *
   * CONCEPT: Bootstrap auth state on app load
   * WHY: Restore session from localStorage
   * PATTERN: Initialization action
   */
  initialize: () => Promise<void>;

  /**
   * Clear error state
   *
   * CONCEPT: Reset error after user acknowledgment
   * WHY: Clean up error state for next operation
   * PATTERN: Simple state mutation
   */
  clearError: () => void;

  /**
   * Set loading state
   *
   * CONCEPT: Manual loading control
   * WHY: UI feedback during auth operations
   * PATTERN: Loading state setter
   */
  setLoading: (isLoading: boolean) => void;

  /**
   * Sign in with Google OAuth
   *
   * CONCEPT: OAuth provider authentication
   * WHY: Allow users to sign in with existing Google account
   * PATTERN: Async action with redirect flow
   */
  signInWithGoogle: () => Promise<void>;

  /**
   * Sign in with email and password
   *
   * CONCEPT: Credential-based authentication
   * WHY: Traditional sign-in for registered users
   * PATTERN: Async action with error handling
   */
  signInWithEmail: (email: string, password: string) => Promise<void>;

  /**
   * Sign up with email and password
   *
   * CONCEPT: New account registration
   * WHY: Allow users to create persistent accounts
   * PATTERN: Async action with optional metadata
   */
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;

  /**
   * Send password reset email
   *
   * CONCEPT: Self-service password recovery
   * WHY: Allow users to regain access to their accounts
   * PATTERN: Async action with email delivery
   */
  resetPassword: (email: string) => Promise<void>;
}

/**
 * Complete auth store interface
 *
 * CONCEPT: Combined state and actions
 * WHY: Single interface for store type
 * PATTERN: Zustand store shape
 */
export interface AuthStore extends AuthState, AuthActions {}

/**
 * Auth hook return type
 *
 * CONCEPT: Hook interface for components
 * WHY: Type-safe hook usage
 * PATTERN: React hook pattern
 */
export interface UseAuthReturn extends AuthStore {
  // Computed properties
  isAuthenticated: boolean;
  isAnonymous: boolean;
  provider: 'anonymous' | 'google' | 'email' | null;
}

/**
 * Auth event types
 *
 * CONCEPT: Type-safe event handling
 * WHY: Track auth state changes
 * PATTERN: Event listener pattern
 */
export type AuthEventType =
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY'
  | 'USER_DELETED';

/**
 * Auth event payload
 *
 * CONCEPT: Typed event data
 * WHY: Type-safe event handlers
 * PATTERN: Event payload interface
 */
export interface AuthEvent {
  type: AuthEventType;
  session: Session | null;
  user: User | null;
  timestamp: number;
}

/**
 * Auth configuration
 *
 * CONCEPT: Configurable auth behavior
 * WHY: Customize auth flow per environment
 * PATTERN: Configuration object
 */
export interface AuthConfig {
  // Auto sign-in anonymously on init
  autoSignInAnonymously: boolean;

  // Refresh session on window focus
  refreshOnFocus: boolean;

  // Refresh session on visibility change
  refreshOnVisibilityChange: boolean;

  // Session refresh interval (ms)
  refreshInterval: number;

  // Persist session to localStorage
  persistSession: boolean;

  // Storage key for session
  storageKey: string;
}

/**
 * Default auth configuration
 *
 * CONCEPT: Sensible defaults
 * WHY: Work out of the box
 * PATTERN: Default config export
 */
export const defaultAuthConfig: AuthConfig = {
  autoSignInAnonymously: true,
  refreshOnFocus: true,
  refreshOnVisibilityChange: true,
  refreshInterval: 5 * 60 * 1000, // 5 minutes
  persistSession: true,
  storageKey: 'california-puzzle-auth',
};
