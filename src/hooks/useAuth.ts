/**
 * useAuth Hook - Convenient Auth Access for Components
 *
 * Purpose: Provide easy-to-use auth hook for React components
 * Features: Auto-initialization, computed properties, type-safe
 *
 * Usage:
 *   const { user, isAuthenticated, signInAnonymously, signOut } = useAuth();
 *
 * Last updated: 2025-10-11
 */

import { useEffect } from 'react';
import { useAuthStore, authSelectors } from '../stores/authStore';
import type { UseAuthReturn } from '../types/auth';
import { logger } from '../utils/logger';

/**
 * Auth Hook with auto-initialization
 *
 * CONCEPT: All-in-one hook for auth operations
 * WHY: Simple API for components
 * PATTERN: Custom React hook with store integration
 *
 * @example
 * function MyComponent() {
 *   const { user, isAuthenticated, signInAnonymously } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <button onClick={signInAnonymously}>Sign In</button>;
 *   }
 *
 *   return <div>Welcome, {user.id}!</div>;
 * }
 */
export function useAuth(): UseAuthReturn {
  // Subscribe to full auth state
  const store = useAuthStore();

  // Auto-initialize on first mount
  useEffect(() => {
    if (!store.initialized && !store.isLoading) {
      logger.info('[useAuth] Auto-initializing auth...');
      store.initialize();
    }
  }, [store.initialized, store.isLoading, store]);

  // Compute derived values
  const isAuthenticated = !!store.user && !!store.session;
  const isAnonymous = store.user?.is_anonymous ?? false;

  return {
    ...store,
    isAuthenticated,
    isAnonymous,
  };
}

/**
 * Hook: Use auth user only
 *
 * CONCEPT: Optimized selector for user data
 * WHY: Only re-render when user changes
 * PATTERN: Granular subscription
 *
 * @example
 * const user = useAuthUser();
 * if (user) { // render user data }
 */
export function useAuthUser() {
  return useAuthStore(authSelectors.user);
}

/**
 * Hook: Use auth session only
 *
 * CONCEPT: Optimized selector for session
 * WHY: Only re-render when session changes
 * PATTERN: Granular subscription
 *
 * @example
 * const session = useAuthSession();
 * const token = session?.access_token;
 */
export function useAuthSession() {
  return useAuthStore(authSelectors.session);
}

/**
 * Hook: Use authentication status only
 *
 * CONCEPT: Boolean authentication check
 * WHY: Only re-render on auth state change
 * PATTERN: Computed selector
 *
 * @example
 * const isAuthenticated = useIsAuthenticated();
 * if (!isAuthenticated) { return <Login />; }
 */
export function useIsAuthenticated() {
  return useAuthStore(authSelectors.isAuthenticated);
}

/**
 * Hook: Use anonymous status only
 *
 * CONCEPT: Check if user is anonymous
 * WHY: Show upgrade prompts for anonymous users
 * PATTERN: Computed selector
 *
 * @example
 * const isAnonymous = useIsAnonymous();
 * if (isAnonymous) { return <UpgradePrompt />; }
 */
export function useIsAnonymous() {
  return useAuthStore(authSelectors.isAnonymous);
}

/**
 * Hook: Use auth loading state only
 *
 * CONCEPT: Loading indicator subscription
 * WHY: Show spinners during auth operations
 * PATTERN: Granular subscription
 *
 * @example
 * const isLoading = useAuthLoading();
 * if (isLoading) { return <Spinner />; }
 */
export function useAuthLoading() {
  return useAuthStore(authSelectors.isLoading);
}

/**
 * Hook: Use auth error only
 *
 * CONCEPT: Error state subscription
 * WHY: Display auth errors to user
 * PATTERN: Granular subscription
 *
 * @example
 * const error = useAuthError();
 * if (error) { return <Alert>{error.message}</Alert>; }
 */
export function useAuthError() {
  return useAuthStore(authSelectors.error);
}

/**
 * Hook: Use auth actions only (no state)
 *
 * CONCEPT: Access actions without subscribing to state
 * WHY: Prevent unnecessary re-renders
 * PATTERN: Action-only hook (like themeStore)
 *
 * @example
 * const { signInAnonymously, signOut } = useAuthActions();
 * // Component won't re-render when user changes
 */
export function useAuthActions() {
  return useAuthStore((state) => ({
    signInAnonymously: state.signInAnonymously,
    signOut: state.signOut,
    refreshSession: state.refreshSession,
    initialize: state.initialize,
    clearError: state.clearError,
  }));
}

/**
 * Hook: Use user ID only
 *
 * CONCEPT: Get just the user ID
 * WHY: Common use case for linking data
 * PATTERN: Derived selector
 *
 * @example
 * const userId = useUserId();
 * // Save game data with userId
 */
export function useUserId(): string | null {
  return useAuthStore((state) => state.user?.id ?? null);
}
