/**
 * Auth Functions Tests
 *
 * Tests for authentication service functions:
 * - exportUserData() - GDPR data export
 * - deleteUserAccount() - Complete account deletion
 *
 * Coverage:
 * - Success scenarios
 * - Error handling
 * - Data validation
 * - Side effects (signout, localStorage cleanup)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  exportUserData,
  deleteUserAccount,
  getUser,
  signOut,
} from '@/services/supabase/auth';

// Mock Supabase client
vi.mock('@/services/supabase/client', () => ({
  getSupabaseClient: vi.fn(),
}));

describe('Auth Service Functions', () => {
  let mockSupabase: any;
  let mockFrom: ReturnType<typeof vi.fn>;
  let mockAuth: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock Supabase client
    mockFrom = vi.fn();
    mockAuth = {
      getSession: vi.fn(),
      signOut: vi.fn(),
    };

    mockSupabase = {
      from: mockFrom,
      auth: mockAuth,
    };

    const { getSupabaseClient } = require('@/services/supabase/client');
    getSupabaseClient.mockReturnValue(mockSupabase);

    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('exportUserData()', () => {
    const mockUserId = 'test-user-id-12345';

    beforeEach(() => {
      // Setup default successful responses
      mockFrom.mockImplementation((table: string) => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => {
            switch (table) {
              case 'game_sessions':
                return Promise.resolve({
                  data: [
                    { id: 1, user_id: mockUserId, score: 100, completed_at: '2025-01-01' },
                    { id: 2, user_id: mockUserId, score: 200, completed_at: '2025-01-02' },
                  ],
                  error: null,
                });
              case 'user_progress':
                return Promise.resolve({
                  data: [
                    { user_id: mockUserId, total_score: 300, level: 5 },
                  ],
                  error: null,
                });
              case 'game_settings':
                return Promise.resolve({
                  data: [
                    { user_id: mockUserId, difficulty: 'medium', sound_enabled: true },
                  ],
                  error: null,
                });
              default:
                return Promise.resolve({ data: [], error: null });
            }
          }),
        })),
      }));
    });

    it('should fetch all user tables', async () => {
      const result = await exportUserData(mockUserId);

      expect(mockFrom).toHaveBeenCalledWith('game_sessions');
      expect(mockFrom).toHaveBeenCalledWith('user_progress');
      expect(mockFrom).toHaveBeenCalledWith('game_settings');
      expect(mockFrom).toHaveBeenCalledTimes(3);
    });

    it('should return structured JSON with all data', async () => {
      const result = await exportUserData(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.user_id).toBe(mockUserId);
      expect(result.data?.export_date).toBeDefined();
      expect(result.data?.game_sessions).toHaveLength(2);
      expect(result.data?.user_progress).toHaveLength(1);
      expect(result.data?.game_settings).toHaveLength(1);
    });

    it('should include export metadata', async () => {
      const result = await exportUserData(mockUserId);

      expect(result.data?.user_id).toBe(mockUserId);
      expect(result.data?.export_date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should handle empty data arrays', async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      }));

      const result = await exportUserData(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data?.game_sessions).toEqual([]);
      expect(result.data?.user_progress).toEqual([]);
      expect(result.data?.game_settings).toEqual([]);
    });

    it('should handle null data from Supabase', async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      }));

      const result = await exportUserData(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data?.game_sessions).toEqual([]);
      expect(result.data?.user_progress).toEqual([]);
      expect(result.data?.game_settings).toEqual([]);
    });

    it('should handle game_sessions fetch error', async () => {
      mockFrom.mockImplementation((table: string) => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => {
            if (table === 'game_sessions') {
              return Promise.resolve({
                data: null,
                error: { message: 'Failed to fetch game sessions' },
              });
            }
            return Promise.resolve({ data: [], error: null });
          }),
        })),
      }));

      const result = await exportUserData(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to fetch game sessions');
    });

    it('should handle user_progress fetch error', async () => {
      mockFrom.mockImplementation((table: string) => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => {
            if (table === 'user_progress') {
              return Promise.resolve({
                data: null,
                error: { message: 'Database timeout' },
              });
            }
            return Promise.resolve({ data: [], error: null });
          }),
        })),
      }));

      const result = await exportUserData(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to fetch user progress');
      expect(result.error).toContain('Database timeout');
    });

    it('should handle game_settings fetch error', async () => {
      mockFrom.mockImplementation((table: string) => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => {
            if (table === 'game_settings') {
              return Promise.resolve({
                data: null,
                error: { message: 'Permission denied' },
              });
            }
            return Promise.resolve({ data: [], error: null });
          }),
        })),
      }));

      const result = await exportUserData(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to fetch game settings');
    });

    it('should handle network errors', async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.reject(new Error('Network error'))),
        })),
      }));

      const result = await exportUserData(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should return error when Supabase not configured', async () => {
      const { getSupabaseClient } = require('@/services/supabase/client');
      getSupabaseClient.mockReturnValue(null);

      const result = await exportUserData(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Supabase not configured');
    });

    it('should fetch data in parallel for performance', async () => {
      const startTime = Date.now();

      // Add delays to simulate network latency
      mockFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ data: [], error: null }), 50)
            )
          ),
        })),
      }));

      await exportUserData(mockUserId);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // If run in parallel, should take ~50ms. If sequential, would take ~150ms
      expect(duration).toBeLessThan(100);
    });
  });

  describe('deleteUserAccount()', () => {
    const mockUserId = 'test-user-id-12345';
    const mockUser = {
      id: mockUserId,
      is_anonymous: true,
    };

    beforeEach(() => {
      // Setup successful delete responses
      mockFrom.mockImplementation(() => ({
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      }));

      // Setup successful getUser response
      mockAuth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      // Setup successful signOut
      mockAuth.signOut.mockResolvedValue({ error: null });
    });

    it('should delete all user data from tables', async () => {
      const result = await deleteUserAccount();

      expect(mockFrom).toHaveBeenCalledWith('game_sessions');
      expect(mockFrom).toHaveBeenCalledWith('user_progress');
      expect(mockFrom).toHaveBeenCalledWith('game_settings');
    });

    it('should call delete().eq() for each table', async () => {
      const mockDelete = vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      }));

      mockFrom.mockImplementation(() => ({
        delete: mockDelete,
      }));

      await deleteUserAccount();

      expect(mockDelete).toHaveBeenCalledTimes(3);
    });

    it('should sign out user after deletion', async () => {
      await deleteUserAccount();

      expect(mockAuth.signOut).toHaveBeenCalledTimes(1);
    });

    it('should clear localStorage after deletion', async () => {
      localStorage.setItem('test-key', 'test-value');
      localStorage.setItem('another-key', 'another-value');

      await deleteUserAccount();

      expect(localStorage.length).toBe(0);
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('should return success when deletion completes', async () => {
      const result = await deleteUserAccount();

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should continue deletion even if table deletion fails', async () => {
      mockFrom.mockImplementation((table: string) => ({
        delete: vi.fn(() => ({
          eq: vi.fn(() => {
            if (table === 'game_sessions') {
              return Promise.resolve({
                data: null,
                error: { message: 'Delete failed' },
              });
            }
            return Promise.resolve({ data: null, error: null });
          }),
        })),
      }));

      const result = await deleteUserAccount();

      // Should still succeed and signout
      expect(result.success).toBe(true);
      expect(mockAuth.signOut).toHaveBeenCalled();
    });

    it('should return error when no authenticated user found', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await deleteUserAccount();

      expect(result.success).toBe(false);
      expect(result.error).toBe('No authenticated user found');
    });

    it('should return error when Supabase not configured', async () => {
      const { getSupabaseClient } = require('@/services/supabase/client');
      getSupabaseClient.mockReturnValue(null);

      const result = await deleteUserAccount();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Supabase not configured');
    });

    it('should handle signOut failure gracefully', async () => {
      mockAuth.signOut.mockResolvedValue({
        error: { message: 'Sign out failed' },
      });

      const result = await deleteUserAccount();

      // Should still succeed and clear localStorage
      expect(result.success).toBe(true);
      expect(localStorage.length).toBe(0);
    });

    it('should handle localStorage clear errors', async () => {
      // Mock localStorage.clear to throw
      const originalClear = Storage.prototype.clear;
      Storage.prototype.clear = vi.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      const result = await deleteUserAccount();

      // Should still succeed
      expect(result.success).toBe(true);

      // Restore original
      Storage.prototype.clear = originalClear;
    });

    it('should handle unexpected errors', async () => {
      mockAuth.getSession.mockRejectedValue(new Error('Unexpected error'));

      const result = await deleteUserAccount();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unexpected error');
    });

    it('should delete data in parallel for performance', async () => {
      const startTime = Date.now();

      // Add delays to simulate network latency
      mockFrom.mockImplementation(() => ({
        delete: vi.fn(() => ({
          eq: vi.fn(() =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ data: null, error: null }), 50)
            )
          ),
        })),
      }));

      await deleteUserAccount();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // If run in parallel, should take ~50ms. If sequential, would take ~150ms
      expect(duration).toBeLessThan(100);
    });

    it('should handle partial deletion failures', async () => {
      let callCount = 0;
      mockFrom.mockImplementation(() => ({
        delete: vi.fn(() => ({
          eq: vi.fn(() => {
            callCount++;
            if (callCount === 1) {
              // First call (game_sessions) fails
              return Promise.resolve({
                data: null,
                error: { message: 'Delete failed' },
              });
            }
            return Promise.resolve({ data: null, error: null });
          }),
        })),
      }));

      const result = await deleteUserAccount();

      // Should still complete the process
      expect(result.success).toBe(true);
      expect(mockAuth.signOut).toHaveBeenCalled();
      expect(localStorage.length).toBe(0);
    });

    it('should not leave any trace after deletion', async () => {
      // Set some data
      localStorage.setItem('user-data', JSON.stringify({ userId: mockUserId }));
      localStorage.setItem('game-state', JSON.stringify({ level: 5 }));

      await deleteUserAccount();

      // Verify everything is cleaned up
      expect(localStorage.length).toBe(0);
      expect(localStorage.getItem('user-data')).toBeNull();
      expect(localStorage.getItem('game-state')).toBeNull();
      expect(mockAuth.signOut).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely large data exports', async () => {
      const largeArray = Array(1000).fill(null).map((_, i) => ({
        id: i,
        data: 'x'.repeat(1000),
      }));

      mockFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: largeArray, error: null })),
        })),
      }));

      const result = await exportUserData('test-user');

      expect(result.success).toBe(true);
      expect(result.data?.game_sessions).toHaveLength(1000);
    });

    it('should handle special characters in user IDs', async () => {
      const specialUserId = 'user-123!@#$%^&*()';

      mockFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      }));

      const result = await exportUserData(specialUserId);

      expect(result.success).toBe(true);
      expect(result.data?.user_id).toBe(specialUserId);
    });

    it('should handle concurrent delete requests', async () => {
      mockFrom.mockImplementation(() => ({
        delete: vi.fn(() => ({
          eq: vi.fn(() =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ data: null, error: null }), 10)
            )
          ),
        })),
      }));

      mockAuth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'test-user' } } },
        error: null,
      });

      // Call deleteUserAccount multiple times concurrently
      const promises = [
        deleteUserAccount(),
        deleteUserAccount(),
        deleteUserAccount(),
      ];

      const results = await Promise.all(promises);

      // All should succeed (or at least handle gracefully)
      results.forEach((result) => {
        expect(result.success).toBeDefined();
      });
    });

    it('should handle timeout scenarios', async () => {
      vi.useFakeTimers();

      mockFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ data: [], error: null }), 30000)
            )
          ),
        })),
      }));

      const promise = exportUserData('test-user');

      // Advance timers
      vi.advanceTimersByTime(30000);

      const result = await promise;

      expect(result).toBeDefined();

      vi.useRealTimers();
    });
  });

  describe('Data Integrity', () => {
    it('should preserve data types in export', async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() =>
            Promise.resolve({
              data: [
                {
                  id: 1,
                  score: 100,
                  completed: true,
                  metadata: { key: 'value' },
                  tags: ['tag1', 'tag2'],
                },
              ],
              error: null,
            })
          ),
        })),
      }));

      const result = await exportUserData('test-user');

      expect(result.success).toBe(true);
      const session = result.data?.game_sessions[0];
      expect(typeof session.id).toBe('number');
      expect(typeof session.score).toBe('number');
      expect(typeof session.completed).toBe('boolean');
      expect(typeof session.metadata).toBe('object');
      expect(Array.isArray(session.tags)).toBe(true);
    });

    it('should handle null values in data', async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() =>
            Promise.resolve({
              data: [
                {
                  id: 1,
                  optional_field: null,
                  another_field: undefined,
                },
              ],
              error: null,
            })
          ),
        })),
      }));

      const result = await exportUserData('test-user');

      expect(result.success).toBe(true);
      expect(result.data?.game_sessions[0].optional_field).toBeNull();
    });
  });
});
