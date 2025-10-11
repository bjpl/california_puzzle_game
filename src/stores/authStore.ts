/**
 * Authentication Store - Zustand State Management
 *
 * Purpose: Manage user authentication state with Supabase
 * Features: Anonymous sign-in, session persistence, auto-refresh
 *
 * Usage:
 *   const { user, session, signInAnonymously, signOut } = useAuthStore();
 *
 * Last updated: 2025-10-11
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { syncManager } from '../lib/syncManager';
import { storeIntegration } from '../lib/storeIntegration';
import type { AuthStore, AuthState } from '../types/auth';
import type { AuthError } from '@supabase/supabase-js';

/**
 * Initial auth state
 *
 * CONCEPT: Clean slate before initialization
 * WHY: Predictable starting state
 * PATTERN: Default state object
 */
const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: false,
  error: null,
  initialized: false,
};

/**
 * Auth Store with Zustand
 *
 * CONCEPT: Global authentication state with persistence
 * WHY: Share auth state across app, survive page reloads
 * PATTERN: Zustand store with devtools and persist middleware
 *
 * Follows exact pattern from gameStore.ts and studyStore.ts
 */
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...initialState,

        /**
         * Sign in anonymously
         *
         * CONCEPT: Create guest session without credentials
         * WHY: Allow gameplay without registration
         * PATTERN: Async action with error handling
         *
         * @example
         * await signInAnonymously();
         * if (!error) { // user is signed in }
         */
        signInAnonymously: async () => {
          logger.info('[Auth] Starting anonymous sign-in...');

          set({ isLoading: true, error: null });

          try {
            const { data, error } = await supabase.auth.signInAnonymously();

            if (error) {
              logger.error('[Auth] Anonymous sign-in failed:', error);
              set({
                error: error as AuthError,
                isLoading: false,
              });
              return;
            }

            logger.info('[Auth] Anonymous sign-in successful:', {
              userId: data.user?.id,
              isAnonymous: data.user?.is_anonymous,
            });

            set({
              user: data.user,
              session: data.session,
              error: null,
              isLoading: false,
              initialized: true,
            });

            // Initialize sync manager and store integration after successful authentication
            if (data.user?.id) {
              try {
                await syncManager.initialize(data.user.id);
                await storeIntegration.initialize(data.user.id);
                logger.info('[Auth] Sync manager and store integration initialized for user:', data.user.id);
              } catch (syncError) {
                logger.error('[Auth] Failed to initialize sync:', syncError);
                // Don't fail auth if sync initialization fails
              }
            }
          } catch (error) {
            logger.error('[Auth] Anonymous sign-in exception:', error);
            set({
              error: error as AuthError,
              isLoading: false,
            });
          }
        },

        /**
         * Sign out current user
         *
         * CONCEPT: Clear session and reset state
         * WHY: Allow users to disconnect
         * PATTERN: Async action with cleanup
         *
         * @example
         * await signOut();
         * // user and session are now null
         */
        signOut: async () => {
          logger.info('[Auth] Signing out...');

          set({ isLoading: true, error: null });

          try {
            const { error } = await supabase.auth.signOut();

            if (error) {
              logger.error('[Auth] Sign-out failed:', error);
              set({
                error: error as AuthError,
                isLoading: false,
              });
              return;
            }

            logger.info('[Auth] Sign-out successful');

            // Shutdown store integration and sync manager before clearing auth state
            try {
              await storeIntegration.shutdown();
              await syncManager.shutdown();
              logger.info('[Auth] Store integration and sync manager shut down');
            } catch (syncError) {
              logger.error('[Auth] Failed to shutdown sync:', syncError);
              // Continue with sign-out even if sync shutdown fails
            }

            set({
              user: null,
              session: null,
              error: null,
              isLoading: false,
            });
          } catch (error) {
            logger.error('[Auth] Sign-out exception:', error);
            set({
              error: error as AuthError,
              isLoading: false,
            });
          }
        },

        /**
         * Refresh current session
         *
         * CONCEPT: Renew access token without re-authentication
         * WHY: Keep session alive, get updated user data
         * PATTERN: Token refresh flow
         *
         * @example
         * await refreshSession();
         * // session token is renewed
         */
        refreshSession: async () => {
          logger.info('[Auth] Refreshing session...');

          const currentSession = get().session;
          if (!currentSession) {
            logger.warn('[Auth] No session to refresh');
            return;
          }

          set({ isLoading: true, error: null });

          try {
            const { data, error } = await supabase.auth.refreshSession();

            if (error) {
              logger.error('[Auth] Session refresh failed:', error);
              set({
                error: error as AuthError,
                isLoading: false,
              });
              return;
            }

            logger.info('[Auth] Session refreshed successfully');

            set({
              user: data.user,
              session: data.session,
              error: null,
              isLoading: false,
            });
          } catch (error) {
            logger.error('[Auth] Session refresh exception:', error);
            set({
              error: error as AuthError,
              isLoading: false,
            });
          }
        },

        /**
         * Initialize auth from storage
         *
         * CONCEPT: Restore session on app load
         * WHY: Seamless auth state across page reloads
         * PATTERN: Initialization with fallback
         *
         * @example
         * await initialize();
         * if (user) { // session restored }
         * else { // auto sign-in anonymously }
         */
        initialize: async () => {
          if (get().initialized) {
            logger.warn('[Auth] Already initialized, skipping');
            return;
          }

          logger.info('[Auth] Initializing auth system...');

          set({ isLoading: true, error: null });

          try {
            // Try to get existing session from storage
            const { data, error } = await supabase.auth.getSession();

            if (error) {
              logger.error('[Auth] Failed to get session:', error);
              // Don't set error - this is expected for first-time users
            }

            if (data.session) {
              logger.info('[Auth] Restored session from storage:', {
                userId: data.session.user.id,
                isAnonymous: data.session.user.is_anonymous,
              });

              set({
                user: data.session.user,
                session: data.session,
                isLoading: false,
                initialized: true,
              });

              // Initialize sync manager and store integration for restored session
              if (data.session.user.id) {
                try {
                  await syncManager.initialize(data.session.user.id);
                  await storeIntegration.initialize(data.session.user.id);
                  logger.info('[Auth] Sync and store integration initialized for restored session:', data.session.user.id);
                } catch (syncError) {
                  logger.error('[Auth] Failed to initialize sync for restored session:', syncError);
                  // Don't fail auth if sync initialization fails
                }
              }
            } else {
              logger.info('[Auth] No existing session, signing in anonymously...');

              // No session - sign in anonymously
              set({ isLoading: false, initialized: true });
              await get().signInAnonymously();
            }
          } catch (error) {
            logger.error('[Auth] Initialization exception:', error);
            set({
              error: error as AuthError,
              isLoading: false,
              initialized: true,
            });
          }
        },

        /**
         * Clear error state
         *
         * CONCEPT: Reset error after user handles it
         * WHY: Clean up error state for next operation
         * PATTERN: Simple state mutation
         *
         * @example
         * clearError();
         * // error is now null
         */
        clearError: () => {
          set({ error: null });
        },

        /**
         * Set loading state manually
         *
         * CONCEPT: Manual loading control for UI
         * WHY: Show loading state during custom operations
         * PATTERN: Loading state setter
         *
         * @example
         * setLoading(true);
         * // show loading spinner
         */
        setLoading: (isLoading: boolean) => {
          set({ isLoading });
        },
      }),
      {
        name: 'california-puzzle-auth', // localStorage key
        // Only persist user and session, not loading/error states
        partialize: (state) => ({
          user: state.user,
          session: state.session,
          initialized: state.initialized,
        }),
        // Handle rehydration from storage
        onRehydrateStorage: () => (state) => {
          if (state) {
            logger.info('[Auth] Hydrated from localStorage:', {
              hasUser: !!state.user,
              hasSession: !!state.session,
              initialized: state.initialized,
            });
          }
        },
      }
    ),
    { name: 'CaliforniaPuzzleAuth' } // DevTools name
  )
);

/**
 * Setup auth state listeners
 *
 * CONCEPT: React to Supabase auth events
 * WHY: Keep store in sync with Supabase auth state
 * PATTERN: Event listener registration
 *
 * This should be called once during app initialization
 */
export function setupAuthListeners(): void {
  logger.info('[Auth] Setting up auth state listeners...');

  supabase.auth.onAuthStateChange(async (event, session) => {
    logger.info('[Auth] Auth state changed:', event, {
      hasSession: !!session,
      userId: session?.user?.id,
    });

    const store = useAuthStore.getState();

    switch (event) {
      case 'SIGNED_IN':
      case 'TOKEN_REFRESHED':
      case 'USER_UPDATED':
        store.setLoading(false);
        useAuthStore.setState({
          user: session?.user ?? null,
          session: session,
          error: null,
        });

        // Initialize sync and store integration if user just signed in
        if (event === 'SIGNED_IN' && session?.user?.id) {
          try {
            await syncManager.initialize(session.user.id);
            await storeIntegration.initialize(session.user.id);
            logger.info('[Auth] Sync and store integration initialized on auth state change:', session.user.id);
          } catch (syncError) {
            logger.error('[Auth] Failed to initialize sync on auth state change:', syncError);
          }
        }
        break;

      case 'SIGNED_OUT':
        // Shutdown store integration and sync manager before clearing auth state
        try {
          await storeIntegration.shutdown();
          await syncManager.shutdown();
          logger.info('[Auth] Store integration and sync shut down on auth state change');
        } catch (syncError) {
          logger.error('[Auth] Failed to shutdown sync on auth state change:', syncError);
        }

        store.setLoading(false);
        useAuthStore.setState({
          user: null,
          session: null,
          error: null,
        });
        break;

      case 'PASSWORD_RECOVERY':
      case 'USER_DELETED':
        // Handle edge cases
        logger.warn('[Auth] Unhandled auth event:', event);
        break;
    }
  });

  logger.info('[Auth] Auth state listeners ready');
}

/**
 * Auto-refresh session on visibility change
 *
 * CONCEPT: Keep session fresh when user returns
 * WHY: Prevent stale tokens, better UX
 * PATTERN: Visibility API integration
 */
export function setupVisibilityRefresh(): void {
  logger.info('[Auth] Setting up visibility-based refresh...');

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      const store = useAuthStore.getState();

      if (store.session && store.initialized) {
        logger.info('[Auth] Page visible, refreshing session...');
        store.refreshSession();
      }
    }
  });

  logger.info('[Auth] Visibility refresh ready');
}

/**
 * Auto-refresh session on window focus
 *
 * CONCEPT: Keep session fresh when user returns to tab
 * WHY: Prevent stale tokens
 * PATTERN: Focus event integration
 */
export function setupFocusRefresh(): void {
  logger.info('[Auth] Setting up focus-based refresh...');

  window.addEventListener('focus', () => {
    const store = useAuthStore.getState();

    if (store.session && store.initialized) {
      logger.info('[Auth] Window focused, refreshing session...');
      store.refreshSession();
    }
  });

  logger.info('[Auth] Focus refresh ready');
}

/**
 * Export store selectors for performance
 *
 * CONCEPT: Granular state selection
 * WHY: Components only re-render when their slice changes
 * PATTERN: Selector functions (like themeStore)
 */
export const authSelectors = {
  user: (state: AuthStore) => state.user,
  session: (state: AuthStore) => state.session,
  isLoading: (state: AuthStore) => state.isLoading,
  error: (state: AuthStore) => state.error,
  initialized: (state: AuthStore) => state.initialized,
  isAuthenticated: (state: AuthStore) => !!state.user && !!state.session,
  isAnonymous: (state: AuthStore) => state.user?.is_anonymous ?? false,
};
