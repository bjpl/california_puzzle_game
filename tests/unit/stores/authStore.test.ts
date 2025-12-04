/**
 * Auth Store Unit Tests
 *
 * Purpose: Test authentication state management
 * Coverage: Store initialization, auth operations, error handling
 *
 * Last updated: 2025-10-11
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAuthStore, setupAuthListeners } from '../../../src/stores/authStore';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// Mock Supabase client
vi.mock('../../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signInAnonymously: vi.fn(),
      signOut: vi.fn(),
      refreshSession: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
  checkSupabaseHealth: vi.fn(),
}));

// Mock logger - all exported loggers
vi.mock('../../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  },
  mapLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  },
  gameLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  },
  studyLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  },
  soundLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  },
  storageLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  },
  achievementLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  },
}));

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: false,
      error: null,
      initialized: false,
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.initialized).toBe(false);
    });

    it('should have all required actions', () => {
      const state = useAuthStore.getState();

      expect(state.signInAnonymously).toBeDefined();
      expect(state.signOut).toBeDefined();
      expect(state.refreshSession).toBeDefined();
      expect(state.initialize).toBeDefined();
      expect(state.clearError).toBeDefined();
      expect(state.setLoading).toBeDefined();
    });
  });

  describe('Sign In Anonymously', () => {
    it('should sign in anonymously successfully', async () => {
      const mockUser: Partial<User> = {
        id: 'test-user-id',
        is_anonymous: true,
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };

      const mockSession: Partial<Session> = {
        access_token: 'test-token',
        refresh_token: 'test-refresh-token',
        user: mockUser as User,
      };

      const { supabase } = await import('../../../src/lib/supabase');
      vi.mocked(supabase.auth.signInAnonymously).mockResolvedValueOnce({
        data: {
          user: mockUser as User,
          session: mockSession as Session,
        },
        error: null,
      });

      const { signInAnonymously } = useAuthStore.getState();

      await signInAnonymously();

      const state = useAuthStore.getState();

      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.initialized).toBe(true);
    });
  });

  describe('Sign Out', () => {
    it('should sign out successfully', async () => {
      // Set up authenticated state
      useAuthStore.setState({
        user: { id: 'test-user' } as User,
        session: { access_token: 'token' } as Session,
      });

      const { supabase } = await import('../../../src/lib/supabase');
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
        error: null,
      });

      const { signOut } = useAuthStore.getState();

      await signOut();

      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Helper Actions', () => {
    it('should clear error', () => {
      useAuthStore.setState({
        error: { message: 'Test error' } as AuthError,
      });

      const { clearError } = useAuthStore.getState();

      clearError();

      const state = useAuthStore.getState();

      expect(state.error).toBeNull();
    });

    it('should set loading state', () => {
      const { setLoading } = useAuthStore.getState();

      setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);

      setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('Auth Listeners', () => {
    it('should set up auth state change listeners', async () => {
      const { supabase } = await import('../../../src/lib/supabase');

      setupAuthListeners();

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });
});
