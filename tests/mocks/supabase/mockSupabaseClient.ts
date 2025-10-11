/**
 * Mock Supabase Client for Testing
 *
 * Provides a comprehensive mock of the Supabase client for unit and integration tests
 */

import { vi } from 'vitest';

export interface MockSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: string;
  user: MockUser;
}

export interface MockUser {
  id: string;
  aud: string;
  role: string;
  email?: string;
  phone?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata: {
    provider: string;
    [key: string]: unknown;
  };
  user_metadata: Record<string, unknown>;
  identities?: unknown[];
  created_at: string;
  updated_at?: string;
}

export interface MockAuthResponse {
  data: {
    user: MockUser | null;
    session: MockSession | null;
  };
  error: MockAuthError | null;
}

export interface MockAuthError {
  message: string;
  status?: number;
  name?: string;
}

/**
 * Creates a mock anonymous user
 */
export const createMockAnonymousUser = (overrides?: Partial<MockUser>): MockUser => ({
  id: overrides?.id || 'anon-user-123',
  aud: 'authenticated',
  role: 'authenticated',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {
    provider: 'anonymous',
    ...(overrides?.app_metadata || {}),
  },
  user_metadata: overrides?.user_metadata || {},
  created_at: overrides?.created_at || new Date().toISOString(),
  updated_at: overrides?.updated_at || new Date().toISOString(),
  ...overrides,
});

/**
 * Creates a mock session
 */
export const createMockSession = (user?: MockUser, overrides?: Partial<MockSession>): MockSession => {
  const mockUser = user || createMockAnonymousUser();
  const now = Math.floor(Date.now() / 1000);

  return {
    access_token: overrides?.access_token || 'mock-access-token-' + Math.random().toString(36),
    refresh_token: overrides?.refresh_token || 'mock-refresh-token-' + Math.random().toString(36),
    expires_at: overrides?.expires_at || now + 3600,
    expires_in: overrides?.expires_in || 3600,
    token_type: 'bearer',
    user: mockUser,
    ...overrides,
  };
};

/**
 * Creates a successful auth response
 */
export const createMockAuthSuccess = (user?: MockUser, session?: MockSession): MockAuthResponse => ({
  data: {
    user: user || createMockAnonymousUser(),
    session: session || createMockSession(user),
  },
  error: null,
});

/**
 * Creates an error auth response
 */
export const createMockAuthError = (message: string, status = 400): MockAuthResponse => ({
  data: {
    user: null,
    session: null,
  },
  error: {
    message,
    status,
    name: 'AuthError',
  },
});

/**
 * Mock Supabase Auth Client
 */
export const createMockAuthClient = () => ({
  signInAnonymously: vi.fn().mockResolvedValue(createMockAuthSuccess()),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  getSession: vi.fn().mockResolvedValue({
    data: { session: createMockSession() },
    error: null,
  }),
  getUser: vi.fn().mockResolvedValue({
    data: { user: createMockAnonymousUser() },
    error: null,
  }),
  refreshSession: vi.fn().mockResolvedValue(createMockAuthSuccess()),
  onAuthStateChange: vi.fn((callback) => {
    // Return subscription object
    return {
      data: {
        subscription: {
          id: 'mock-subscription-id',
          unsubscribe: vi.fn(),
        },
      },
    };
  }),
  setSession: vi.fn().mockResolvedValue(createMockAuthSuccess()),
});

/**
 * Mock Supabase Client
 */
export const createMockSupabaseClient = () => ({
  auth: createMockAuthClient(),
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
});

/**
 * Mock environment variables
 */
export const mockSupabaseEnv = {
  VITE_SUPABASE_URL: 'https://mock-project.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'mock-anon-key-' + 'a'.repeat(100),
};

/**
 * Clear environment variables
 */
export const clearSupabaseEnv = () => {
  delete import.meta.env.VITE_SUPABASE_URL;
  delete import.meta.env.VITE_SUPABASE_ANON_KEY;
};
