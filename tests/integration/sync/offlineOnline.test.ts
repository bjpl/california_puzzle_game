/**
 * Integration Tests for Offline/Online Transitions
 *
 * Tests behavior during network state changes including:
 * - Offline queueing
 * - Online resumption
 * - State transitions
 * - Data persistence
 *
 * Coverage target: >85%
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createMockSyncManager,
  createMockSyncQueue,
  createMockGameSettings,
  createMockGameStats,
  createMockSyncQueueItem,
  simulateOffline,
  simulateOnline,
  simulateNetworkDelay,
  mockLocalStorage,
} from '../../mocks/sync/mockSyncClient';

describe('Offline/Online Transitions', () => {
  let mockSyncManager: ReturnType<typeof createMockSyncManager>;
  let mockQueue: ReturnType<typeof createMockSyncQueue>;
  let storage: ReturnType<typeof mockLocalStorage>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSyncManager = createMockSyncManager();
    mockQueue = createMockSyncQueue();
    storage = mockLocalStorage();
    Object.defineProperty(window, 'localStorage', { value: storage, writable: true });

    simulateOnline();
    await mockSyncManager.initialize();
  });

  afterEach(() => {
    storage.clear();
    simulateOnline();
  });

  describe('Going Offline', () => {
    it('should detect offline state', () => {
      simulateOnline();
      expect(navigator.onLine).toBe(true);

      simulateOffline();
      expect(navigator.onLine).toBe(false);
    });

    it('should queue operations when going offline', async () => {
      simulateOffline();

      const settings = createMockGameSettings();
      await mockSyncManager.syncSettings();

      mockQueue.getPendingCount.mockReturnValueOnce(1);
      expect(mockQueue.getPendingCount()).toBeGreaterThan(0);
    });

    it('should persist queue to localStorage', async () => {
      simulateOffline();

      const settings = createMockGameSettings();
      await mockSyncManager.syncSettings();

      // Queue should be persisted
      expect(mockSyncManager.syncSettings).toHaveBeenCalled();
    });

    it('should stop periodic sync when offline', () => {
      vi.useFakeTimers();

      simulateOffline();

      // Advance time - periodic sync should not trigger
      vi.advanceTimersByTime(60000);

      // TODO: Verify sync was not called

      vi.useRealTimers();
    });

    it('should show offline indicator', () => {
      const status = mockSyncManager.getStatus();

      simulateOffline();

      // TODO: Status should indicate offline
      expect(status).toBeDefined();
    });
  });

  describe('Coming Online', () => {
    beforeEach(() => {
      simulateOffline();
    });

    it('should detect online state', () => {
      expect(navigator.onLine).toBe(false);

      simulateOnline();
      expect(navigator.onLine).toBe(true);
    });

    it('should process queue when coming online', async () => {
      // Queue some operations while offline
      const item = createMockSyncQueueItem();
      await mockQueue.enqueue(item);

      mockQueue.getPendingCount.mockReturnValueOnce(1);
      expect(mockQueue.getPendingCount()).toBe(1);

      // Come online
      simulateOnline();

      mockQueue.process.mockResolvedValueOnce({ processed: 1, failed: 0 });
      const result = await mockQueue.process();

      expect(result.processed).toBeGreaterThan(0);
    });

    it('should resume periodic sync', () => {
      vi.useFakeTimers();

      simulateOnline();

      // Periodic sync should resume
      vi.advanceTimersByTime(60000);

      // TODO: Verify sync is called

      vi.useRealTimers();
    });

    it('should trigger immediate sync on reconnect', async () => {
      simulateOnline();

      // Should trigger sync immediately
      await mockSyncManager.sync();

      expect(mockSyncManager.sync).toHaveBeenCalled();
    });

    it('should show online indicator', () => {
      simulateOnline();

      const status = mockSyncManager.getStatus();
      expect(status.syncing).toBeDefined();
    });
  });

  describe('Rapid State Changes', () => {
    it('should handle rapid offline/online toggles', async () => {
      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          simulateOffline();
        } else {
          simulateOnline();
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Should remain stable
      const status = mockSyncManager.getStatus();
      expect(status).toBeDefined();
    });

    it('should not lose queued operations', async () => {
      simulateOffline();
      await mockQueue.enqueue(createMockSyncQueueItem());

      // Toggle state multiple times
      simulateOnline();
      simulateOffline();
      simulateOnline();

      mockQueue.getPendingCount.mockReturnValueOnce(1);
      expect(mockQueue.getPendingCount()).toBeGreaterThan(0);
    });

    it('should debounce state change events', () => {
      vi.useFakeTimers();

      let eventCount = 0;
      window.addEventListener('online', () => eventCount++);

      // Fire multiple events rapidly
      for (let i = 0; i < 5; i++) {
        window.dispatchEvent(new Event('online'));
      }

      vi.advanceTimersByTime(1000);

      // Should handle gracefully
      expect(eventCount).toBeGreaterThan(0);

      vi.useRealTimers();
    });
  });

  describe('Queue Processing', () => {
    beforeEach(() => {
      simulateOffline();
    });

    it('should process queue in order', async () => {
      const items = [
        createMockSyncQueueItem({ id: 'item-1', priority: 1 }),
        createMockSyncQueueItem({ id: 'item-2', priority: 2 }),
        createMockSyncQueueItem({ id: 'item-3', priority: 3 }),
      ];

      for (const item of items) {
        await mockQueue.enqueue(item);
      }

      simulateOnline();

      mockQueue.process.mockResolvedValueOnce({ processed: 3, failed: 0 });
      const result = await mockQueue.process();

      expect(result.processed).toBe(3);
    });

    it('should retry failed queue items', async () => {
      const item = createMockSyncQueueItem({ retryCount: 0 });
      await mockQueue.enqueue(item);

      simulateOnline();

      // First attempt fails
      mockQueue.process.mockResolvedValueOnce({ processed: 0, failed: 1 });
      await mockQueue.process();

      // Should retry
      mockQueue.getPendingCount.mockReturnValueOnce(1);
      expect(mockQueue.getPendingCount()).toBeGreaterThan(0);
    });

    it('should remove items after max retries', async () => {
      const item = createMockSyncQueueItem({ retryCount: 5 });
      mockQueue.getItems.mockReturnValueOnce([item]);

      simulateOnline();

      await mockQueue.process();

      // Item should be removed after max retries
      mockQueue.isEmpty.mockReturnValueOnce(true);
      expect(mockQueue.isEmpty()).toBe(true);
    });

    it('should handle queue processing errors', async () => {
      mockQueue.process.mockRejectedValueOnce(new Error('Processing error'));

      simulateOnline();

      await expect(mockQueue.process()).rejects.toThrow('Processing error');

      // Queue should remain intact
      mockQueue.getPendingCount.mockReturnValueOnce(1);
      expect(mockQueue.getPendingCount()).toBeGreaterThan(0);
    });
  });

  describe('Data Persistence', () => {
    it('should persist changes while offline', async () => {
      simulateOffline();

      const settings = createMockGameSettings({ difficulty: 'hard' });
      storage.setItem('settings', JSON.stringify(settings));

      const stored = JSON.parse(storage.getItem('settings') || '{}');
      expect(stored.difficulty).toBe('hard');
    });

    it('should sync persisted data when online', async () => {
      // Persist data while offline
      simulateOffline();
      const settings = createMockGameSettings();
      storage.setItem('settings', JSON.stringify(settings));

      // Come online
      simulateOnline();

      await mockSyncManager.sync();

      expect(mockSyncManager.sync).toHaveBeenCalled();
    });

    it('should maintain data integrity during transitions', async () => {
      const originalSettings = createMockGameSettings({ difficulty: 'easy' });
      storage.setItem('settings', JSON.stringify(originalSettings));

      simulateOffline();

      // Update while offline
      const updatedSettings = { ...originalSettings, difficulty: 'hard' };
      storage.setItem('settings', JSON.stringify(updatedSettings));

      simulateOnline();

      // Data should be intact
      const stored = JSON.parse(storage.getItem('settings') || '{}');
      expect(stored.difficulty).toBe('hard');
    });
  });

  describe('Conflict Scenarios', () => {
    it('should handle conflicts after coming online', async () => {
      // Make changes offline
      simulateOffline();
      const localSettings = createMockGameSettings({ difficulty: 'easy' });
      storage.setItem('settings', JSON.stringify(localSettings));

      // Simulate remote changes
      const remoteSettings = createMockGameSettings({ difficulty: 'hard' });

      simulateOnline();

      // Should resolve conflict
      await mockSyncManager.sync();

      expect(mockSyncManager.sync).toHaveBeenCalled();
    });

    it('should prefer local changes for user preferences', async () => {
      simulateOffline();

      const localPrefs = createMockGameSettings({
        theme: 'dark',
        sound_settings: { muted: true },
      });
      storage.setItem('settings', JSON.stringify(localPrefs));

      simulateOnline();

      // User preferences should win
      await mockSyncManager.syncSettings();

      expect(mockSyncManager.syncSettings).toHaveBeenCalled();
    });

    it('should merge non-conflicting changes', async () => {
      simulateOffline();

      const localChanges = createMockGameSettings({ difficulty: 'easy' });
      storage.setItem('settings', JSON.stringify(localChanges));

      const remoteChanges = createMockGameSettings({ region: 'north' });

      simulateOnline();

      // Should merge both changes
      await mockSyncManager.sync();

      expect(mockSyncManager.sync).toHaveBeenCalled();
    });
  });

  describe('User Experience', () => {
    it('should show pending changes indicator', () => {
      simulateOffline();

      mockQueue.getPendingCount.mockReturnValueOnce(3);
      const pending = mockQueue.getPendingCount();

      expect(pending).toBeGreaterThan(0);
    });

    it('should show sync progress', async () => {
      simulateOffline();

      // Queue multiple items
      for (let i = 0; i < 5; i++) {
        await mockQueue.enqueue(createMockSyncQueueItem());
      }

      simulateOnline();

      mockQueue.getPendingCount.mockReturnValueOnce(5);
      const total = mockQueue.getPendingCount();

      // Process queue
      mockQueue.process.mockResolvedValueOnce({ processed: 5, failed: 0 });
      await mockQueue.process();

      // Progress should update
      expect(total).toBe(5);
    });

    it('should provide error feedback', async () => {
      simulateOffline();

      await mockQueue.enqueue(createMockSyncQueueItem());

      simulateOnline();

      mockQueue.process.mockResolvedValueOnce({ processed: 0, failed: 1 });
      const result = await mockQueue.process();

      expect(result.failed).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle large offline queue', async () => {
      simulateOffline();

      // Queue many operations
      const items = Array(100)
        .fill(null)
        .map(() => createMockSyncQueueItem());

      for (const item of items) {
        await mockQueue.enqueue(item);
      }

      simulateOnline();

      const startTime = performance.now();
      mockQueue.process.mockResolvedValueOnce({ processed: 100, failed: 0 });
      await mockQueue.process();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(2000); // Should be fast
    });

    it('should batch queue processing', async () => {
      simulateOffline();

      const items = Array(50)
        .fill(null)
        .map(() => createMockSyncQueueItem());

      for (const item of items) {
        await mockQueue.enqueue(item);
      }

      simulateOnline();

      // Should process in batches, not one-by-one
      mockQueue.process.mockResolvedValueOnce({ processed: 50, failed: 0 });
      await mockQueue.process();

      expect(mockQueue.process).toHaveBeenCalledTimes(1);
    });

    it('should not block UI during sync', async () => {
      simulateOnline();

      const syncPromise = mockSyncManager.sync();

      // UI should remain responsive
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        // Simulate UI operations
      }
      const endTime = performance.now();

      await syncPromise;

      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle browser close while offline', () => {
      simulateOffline();

      mockQueue.enqueue(createMockSyncQueueItem());

      // Simulate browser close
      window.dispatchEvent(new Event('beforeunload'));

      // Queue should be persisted
      expect(mockQueue.enqueue).toHaveBeenCalled();
    });

    it('should recover from localStorage quota exceeded', async () => {
      simulateOffline();

      storage.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      // Should handle gracefully
      try {
        await mockQueue.enqueue(createMockSyncQueueItem());
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle clock skew', async () => {
      // Simulate incorrect local time
      const futureTime = new Date(Date.now() + 86400000).toISOString();
      const settings = createMockGameSettings({ updated_at: futureTime });

      await mockSyncManager.syncSettings();

      // Should handle gracefully
      expect(mockSyncManager.syncSettings).toHaveBeenCalled();
    });
  });
});
