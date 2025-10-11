/**
 * Mock Sync Client for Testing
 *
 * Provides comprehensive mocks for Supabase sync operations
 * Used by: All sync-related tests
 */

import { vi } from 'vitest';
import type {
  GameSettings,
  GameStats,
  Achievement,
  SyncMetadata,
  SyncError,
} from '@/services/supabase/types';

/**
 * Mock sync operation result
 */
export interface MockSyncResult<T = unknown> {
  data: T | null;
  error: SyncError | null;
  synced: boolean;
  timestamp: string;
}

/**
 * Mock sync queue item
 */
export interface MockSyncQueueItem {
  id: string;
  type: 'settings' | 'stats' | 'achievement';
  operation: 'insert' | 'update' | 'delete';
  data: unknown;
  timestamp: string;
  retryCount: number;
  priority: number;
}

/**
 * Mock conflict data
 */
export interface MockConflict<T = unknown> {
  local: T;
  remote: T;
  field: string;
  localTimestamp: string;
  remoteTimestamp: string;
}

/**
 * Creates mock game settings
 */
export const createMockGameSettings = (overrides?: Partial<GameSettings>): GameSettings => ({
  id: 'settings-123',
  user_id: 'user-123',
  difficulty: 'medium',
  region: 'all',
  show_hints: true,
  enable_timer: true,
  animations_enabled: true,
  sound_settings: {
    masterVolume: 0.8,
    effectsVolume: 0.7,
    musicVolume: 0.6,
    muted: false,
  },
  hint_settings: {
    maxHintsPerLevel: 3,
    hintCooldownMs: 5000,
  },
  theme: 'light',
  language: 'en',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
  ...overrides,
});

/**
 * Creates mock game stats
 */
export const createMockGameStats = (overrides?: Partial<GameStats>): GameStats => ({
  id: 'stats-123',
  user_id: 'user-123',
  total_games_played: 10,
  total_score: 5000,
  best_score: 1200,
  average_accuracy: 85.5,
  total_play_time: 3600,
  favorite_difficulty: 'medium',
  favorite_region: 'all',
  counties_learned: ['Los Angeles', 'San Francisco', 'San Diego'],
  perfect_placements: 5,
  longest_streak: 15,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
  ...overrides,
});

/**
 * Creates mock achievement
 */
export const createMockAchievement = (overrides?: Partial<Achievement>): Achievement => ({
  id: 'achievement-123',
  user_id: 'user-123',
  achievement_id: 'first_perfect',
  progress: 100,
  is_unlocked: true,
  unlocked_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

/**
 * Creates mock sync metadata
 */
export const createMockSyncMetadata = (overrides?: Partial<SyncMetadata>): SyncMetadata => ({
  lastSyncAt: new Date().toISOString(),
  syncVersion: 1,
  pendingChanges: 0,
  syncErrors: [],
  ...overrides,
});

/**
 * Creates mock sync error
 */
export const createMockSyncError = (
  table: string,
  operation: 'insert' | 'update' | 'delete',
  error: string
): SyncError => ({
  table,
  operation,
  error,
  timestamp: new Date().toISOString(),
  retryCount: 0,
});

/**
 * Creates mock sync result
 */
export const createMockSyncResult = <T>(
  data: T,
  synced = true,
  error: SyncError | null = null
): MockSyncResult<T> => ({
  data,
  error,
  synced,
  timestamp: new Date().toISOString(),
});

/**
 * Creates mock sync queue item
 */
export const createMockSyncQueueItem = (
  overrides?: Partial<MockSyncQueueItem>
): MockSyncQueueItem => ({
  id: `queue-${Date.now()}-${Math.random()}`,
  type: 'settings',
  operation: 'update',
  data: {},
  timestamp: new Date().toISOString(),
  retryCount: 0,
  priority: 1,
  ...overrides,
});

/**
 * Creates mock conflict
 */
export const createMockConflict = <T>(
  local: T,
  remote: T,
  field: string
): MockConflict<T> => ({
  local,
  remote,
  field,
  localTimestamp: new Date(Date.now() - 1000).toISOString(),
  remoteTimestamp: new Date().toISOString(),
});

/**
 * Mock Sync Manager
 */
export const createMockSyncManager = () => ({
  initialize: vi.fn().mockResolvedValue({ success: true }),
  sync: vi.fn().mockResolvedValue(createMockSyncResult(createMockSyncMetadata())),
  syncSettings: vi.fn().mockResolvedValue(createMockSyncResult(createMockGameSettings())),
  syncStats: vi.fn().mockResolvedValue(createMockSyncResult(createMockGameStats())),
  syncAchievements: vi.fn().mockResolvedValue(createMockSyncResult([createMockAchievement()])),
  getStatus: vi.fn().mockReturnValue({
    syncing: false,
    lastSync: new Date().toISOString(),
    pendingChanges: 0,
    errors: [],
  }),
  reset: vi.fn().mockResolvedValue({ success: true }),
});

/**
 * Mock Sync Queue
 */
export const createMockSyncQueue = () => ({
  enqueue: vi.fn().mockResolvedValue({ queued: true }),
  dequeue: vi.fn().mockReturnValue(createMockSyncQueueItem()),
  peek: vi.fn().mockReturnValue(createMockSyncQueueItem()),
  clear: vi.fn(),
  getSize: vi.fn().mockReturnValue(0),
  isEmpty: vi.fn().mockReturnValue(true),
  process: vi.fn().mockResolvedValue({ processed: 1, failed: 0 }),
  getItems: vi.fn().mockReturnValue([]),
  getPendingCount: vi.fn().mockReturnValue(0),
});

/**
 * Mock Conflict Resolver
 */
export const createMockConflictResolver = () => ({
  resolve: vi.fn().mockResolvedValue({ resolved: true, data: {} }),
  detectConflicts: vi.fn().mockReturnValue([]),
  applyStrategy: vi.fn().mockReturnValue({}),
  resolveByTimestamp: vi.fn().mockReturnValue({}),
  resolveByVersion: vi.fn().mockReturnValue({}),
  resolveByMerge: vi.fn().mockReturnValue({}),
  getStrategy: vi.fn().mockReturnValue('timestamp'),
  setStrategy: vi.fn(),
});

/**
 * Mock Supabase sync operations
 */
export const createMockSupabaseSyncClient = () => ({
  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: table === 'game_settings'
        ? createMockGameSettings()
        : table === 'game_stats'
        ? createMockGameStats()
        : createMockAchievement(),
      error: null,
    }),
    then: vi.fn().mockResolvedValue({
      data: [],
      error: null,
    }),
  })),
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockResolvedValue({ status: 'SUBSCRIBED' }),
    unsubscribe: vi.fn().mockResolvedValue({ status: 'UNSUBSCRIBED' }),
  })),
  removeChannel: vi.fn().mockResolvedValue({ status: 'ok' }),
});

/**
 * Network simulation utilities
 */
export const simulateNetworkDelay = (ms = 100): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const simulateNetworkError = (): Promise<never> => {
  return Promise.reject(new Error('Network request failed'));
};

export const simulateRateLimitError = (): Promise<never> => {
  const error = new Error('Rate limit exceeded');
  (error as any).status = 429;
  return Promise.reject(error);
};

/**
 * Online/Offline simulation
 */
export const simulateOffline = () => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: false,
  });
  window.dispatchEvent(new Event('offline'));
};

export const simulateOnline = () => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true,
  });
  window.dispatchEvent(new Event('online'));
};

/**
 * Storage utilities for testing
 */
export const mockLocalStorage = () => {
  const storage: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    }),
    key: vi.fn((index: number) => Object.keys(storage)[index] || null),
    get length() {
      return Object.keys(storage).length;
    },
  };
};
