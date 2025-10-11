/**
 * useSyncStatus Hook
 *
 * Purpose: React hook for sync status and queue management
 * Features: Real-time status updates, queue monitoring, manual sync
 *
 * Usage:
 *   import { useSyncStatus } from '@/components/sync/useSyncStatus';
 *   const { status, queueSize, isOnline, syncAll } = useSyncStatus();
 *
 * Last updated: 2025-10-11
 */

import { useState, useEffect, useCallback } from 'react';
import { syncManager, SyncStatus, SyncEvent } from '@/lib/syncManager';
import { syncQueue } from '@/lib/syncQueue';
import { logger } from '@/utils/logger';

/**
 * Sync status hook return type
 *
 * CONCEPT: Type-safe hook interface
 * WHY: Provide comprehensive sync state and actions
 * PATTERN: Custom React hook
 */
export interface UseSyncStatusReturn {
  /** Current sync status */
  status: SyncStatus;
  /** Number of pending operations */
  queueSize: number;
  /** Whether device is online */
  isOnline: boolean;
  /** Whether sync is currently in progress */
  isSyncing: boolean;
  /** Last error encountered */
  lastError: Error | null;
  /** Trigger manual sync */
  syncAll: () => Promise<void>;
  /** Clear any errors */
  clearError: () => void;
}

/**
 * Sync status hook
 *
 * CONCEPT: Encapsulate sync status logic in reusable hook
 * WHY: Simplify sync status integration in components
 * PATTERN: Custom React hook with state management
 */
export const useSyncStatus = (): UseSyncStatusReturn => {
  const [status, setStatus] = useState<SyncStatus>(syncManager.getStatus());
  const [queueSize, setQueueSize] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastError, setLastError] = useState<Error | null>(null);

  /**
   * Update queue size
   *
   * CONCEPT: Fetch current queue size
   * WHY: Keep UI in sync with queue state
   * PATTERN: Async state update
   */
  const updateQueueSize = useCallback(async () => {
    try {
      const size = await syncQueue.getQueueSize();
      setQueueSize(size);
    } catch (error) {
      logger.error('[useSyncStatus] Failed to get queue size:', error);
    }
  }, []);

  /**
   * Handle sync events
   *
   * CONCEPT: React to sync manager events
   * WHY: Update local state when sync state changes
   * PATTERN: Event handler
   */
  const handleSyncEvent = useCallback(
    (event: SyncEvent) => {
      logger.debug('[useSyncStatus] Sync event:', event);

      if (event.type === 'status-changed' && event.status) {
        setStatus(event.status);
      }

      if (event.type === 'sync-error' && event.error) {
        setLastError(event.error);
      }

      if (event.type === 'sync-complete') {
        setLastError(null);
      }

      // Update queue size on any event
      updateQueueSize();
    },
    [updateQueueSize]
  );

  /**
   * Subscribe to sync manager events
   *
   * CONCEPT: Set up event listeners
   * WHY: Keep hook state synchronized with sync manager
   * PATTERN: Effect hook with cleanup
   */
  useEffect(() => {
    const unsubscribe = syncManager.on(handleSyncEvent);

    // Initial queue size fetch
    updateQueueSize();

    return () => {
      unsubscribe();
    };
  }, [handleSyncEvent, updateQueueSize]);

  /**
   * Monitor online status
   *
   * CONCEPT: Track network connectivity
   * WHY: Update UI based on connection state
   * PATTERN: Browser event listeners
   */
  useEffect(() => {
    const handleOnline = () => {
      logger.info('[useSyncStatus] Network online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      logger.warn('[useSyncStatus] Network offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Trigger manual sync
   *
   * CONCEPT: Allow components to initiate sync
   * WHY: User-triggered sync operations
   * PATTERN: Async callback
   */
  const syncAll = useCallback(async () => {
    try {
      logger.info('[useSyncStatus] Manual sync triggered');
      await syncManager.syncAll();
    } catch (error) {
      logger.error('[useSyncStatus] Manual sync failed:', error);
      setLastError(error as Error);
      throw error;
    }
  }, []);

  /**
   * Clear error state
   *
   * CONCEPT: Reset error display
   * WHY: Allow user to dismiss errors
   * PATTERN: State reset callback
   */
  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  const isSyncing = status === SyncStatus.SYNCING;

  return {
    status,
    queueSize,
    isOnline,
    isSyncing,
    lastError,
    syncAll,
    clearError,
  };
};

export default useSyncStatus;
