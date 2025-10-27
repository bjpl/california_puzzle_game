/**
 * Sync Manager - Central Synchronization Coordinator
 *
 * Purpose: Orchestrate data synchronization between local state and Supabase
 * Features: Offline queue, conflict resolution, real-time updates
 *
 * Usage:
 *   import { syncManager } from '@/lib/syncManager';
 *   await syncManager.initialize();
 *   await syncManager.syncAll();
 *
 * Last updated: 2025-10-11
 */

import { supabase } from './supabase';
import { logger } from '../utils/logger';
import { syncQueue, SyncOperation } from './syncQueue';
import { conflictResolver, ConflictResolution } from './conflictResolver';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Sync status for UI feedback
 *
 * CONCEPT: Track synchronization state
 * WHY: Provide user feedback on sync status
 * PATTERN: Enum for type-safe status values
 */
export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  ERROR = 'error',
  OFFLINE = 'offline',
}

/**
 * Sync event types for listeners
 *
 * CONCEPT: Event-driven sync notifications
 * WHY: Allow components to react to sync events
 * PATTERN: Event emitter pattern
 */
export type SyncEventType = 'status-changed' | 'sync-complete' | 'sync-error' | 'conflict-detected';

export interface SyncEvent {
  type: SyncEventType;
  status?: SyncStatus;
  error?: Error;
  operation?: SyncOperation;
  resolution?: ConflictResolution;
}

type SyncEventListener = (event: SyncEvent) => void;

/**
 * Sync Manager Class
 *
 * CONCEPT: Singleton manager for all sync operations
 * WHY: Centralized control, prevent duplicate syncs
 * PATTERN: Singleton with event emitter
 */
class SyncManager {
  private status: SyncStatus = SyncStatus.IDLE;
  private listeners: SyncEventListener[] = [];
  private channels: Map<string, RealtimeChannel> = new Map();
  private syncInProgress = false;
  private userId: string | null = null;

  /**
   * Initialize sync manager
   *
   * CONCEPT: Setup sync infrastructure
   * WHY: Prepare for synchronization operations
   * PATTERN: Async initialization
   */
  async initialize(userId: string): Promise<void> {
    logger.info('[SyncManager] Initializing...', { userId });

    this.userId = userId;
    this.setStatus(SyncStatus.IDLE);

    // Initialize sync queue
    await syncQueue.initialize(userId);

    // Process any pending operations from previous session
    await this.processPendingOperations();

    // Setup online/offline detection
    this.setupNetworkListeners();

    logger.info('[SyncManager] Initialized successfully');
  }

  /**
   * Shutdown sync manager
   *
   * CONCEPT: Clean up resources
   * WHY: Prevent memory leaks
   * PATTERN: Cleanup method
   */
  async shutdown(): Promise<void> {
    logger.info('[SyncManager] Shutting down...');

    // Unsubscribe from all channels
    for (const [table, channel] of this.channels) {
      await supabase.removeChannel(channel);
      logger.info('[SyncManager] Unsubscribed from:', table);
    }

    this.channels.clear();
    this.listeners = [];
    this.userId = null;

    logger.info('[SyncManager] Shutdown complete');
  }

  /**
   * Sync all data types
   *
   * CONCEPT: Full synchronization of all data
   * WHY: Ensure data consistency across client and server
   * PATTERN: Sequential sync with error handling
   */
  async syncAll(): Promise<void> {
    if (this.syncInProgress) {
      logger.warn('[SyncManager] Sync already in progress');
      return;
    }

    if (!this.userId) {
      logger.error('[SyncManager] Cannot sync without user ID');
      return;
    }

    logger.info('[SyncManager] Starting full sync...');

    this.syncInProgress = true;
    this.setStatus(SyncStatus.SYNCING);

    try {
      // Process pending operations first
      await this.processPendingOperations();

      this.setStatus(SyncStatus.IDLE);
      this.emit({
        type: 'sync-complete',
        status: SyncStatus.IDLE,
      });

      logger.info('[SyncManager] Full sync complete');
    } catch (error) {
      logger.error('[SyncManager] Full sync failed:', error);
      this.setStatus(SyncStatus.ERROR);
      this.emit({
        type: 'sync-error',
        status: SyncStatus.ERROR,
        error: error as Error,
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Queue an operation for synchronization
   *
   * CONCEPT: Defer operations when offline
   * WHY: Support offline-first functionality
   * PATTERN: Queue pattern with retry logic
   */
  async queueOperation(
    operation: Omit<SyncOperation, 'id' | 'userId' | 'createdAt' | 'status' | 'retryCount'>
  ): Promise<void> {
    if (!this.userId) {
      logger.error('[SyncManager] Cannot queue operation without user ID');
      return;
    }

    logger.info('[SyncManager] Queueing operation:', operation.type);

    await syncQueue.enqueue({
      ...operation,
      userId: this.userId,
    });

    // Try to sync immediately if online
    if (navigator.onLine) {
      await this.processPendingOperations();
    }
  }

  /**
   * Subscribe to real-time updates for a table
   *
   * CONCEPT: Live data synchronization
   * WHY: Keep client data fresh without polling
   * PATTERN: Supabase real-time subscriptions
   */
  subscribeToTable(
    table: string,
    callback: (payload: { eventType: string; new?: unknown; old?: unknown }) => void | Promise<void>
  ): RealtimeChannel {
    if (this.channels.has(table)) {
      logger.warn('[SyncManager] Already subscribed to:', table);
      return this.channels.get(table)!;
    }

    logger.info('[SyncManager] Subscribing to:', table);

    const channel = supabase
      .channel(`sync:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: this.userId ? `user_id=eq.${this.userId}` : undefined,
        },
        async (payload) => {
          logger.info('[SyncManager] Real-time update:', {
            table,
            event: payload.eventType,
          });

          try {
            await callback(payload);
          } catch (error) {
            logger.error('[SyncManager] Callback error:', error);
          }
        }
      )
      .subscribe((status) => {
        logger.info('[SyncManager] Subscription status:', { table, status });
      });

    this.channels.set(table, channel);
    return channel;
  }

  /**
   * Unsubscribe from real-time updates
   *
   * CONCEPT: Stop listening to changes
   * WHY: Clean up when component unmounts
   * PATTERN: Cleanup method
   */
  async unsubscribeFromTable(table: string): Promise<void> {
    const channel = this.channels.get(table);

    if (!channel) {
      logger.warn('[SyncManager] Not subscribed to:', table);
      return;
    }

    logger.info('[SyncManager] Unsubscribing from:', table);

    await supabase.removeChannel(channel);
    this.channels.delete(table);
  }

  /**
   * Add event listener
   *
   * CONCEPT: Subscribe to sync events
   * WHY: Allow components to react to sync state changes
   * PATTERN: Event emitter
   */
  on(listener: SyncEventListener): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Get current sync status
   *
   * CONCEPT: Read current state
   * WHY: UI needs to display sync status
   * PATTERN: Getter method
   */
  getStatus(): SyncStatus {
    return this.status;
  }

  /**
   * Process pending operations from queue
   *
   * CONCEPT: Execute queued sync operations
   * WHY: Handle offline operations when back online
   * PATTERN: Queue processing with retry
   */
  private async processPendingOperations(): Promise<void> {
    const operations = await syncQueue.getPending();

    if (operations.length === 0) {
      logger.info('[SyncManager] No pending operations');
      return;
    }

    logger.info('[SyncManager] Processing pending operations:', operations.length);

    for (const operation of operations) {
      try {
        await this.executeOperation(operation);
        await syncQueue.markComplete(operation.id);
      } catch (error) {
        logger.error('[SyncManager] Operation failed:', {
          operation: operation.id,
          error,
        });

        await syncQueue.markFailed(operation.id, error as Error);
      }
    }
  }

  /**
   * Execute a single sync operation
   *
   * CONCEPT: Perform database operation
   * WHY: Apply local changes to server
   * PATTERN: CRUD with conflict detection
   */
  private async executeOperation(operation: SyncOperation): Promise<void> {
    logger.info('[SyncManager] Executing operation:', {
      type: operation.type,
      table: operation.table,
    });

    const { type, table, data, recordId } = operation;

    switch (type) {
      case 'insert': {
        // @ts-expect-error - Dynamic table name requires runtime type checking
        const { error } = await supabase.from(table).insert(data);

        if (error) {
          throw new Error(`Insert failed: ${error.message}`);
        }
        break;
      }

      case 'update': {
        if (!recordId) {
          throw new Error('Update requires recordId');
        }

        // Check for conflicts
        const { data: serverData, error: fetchError } = await supabase
          .from(table)
          .select('*')
          .eq('id', recordId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw new Error(`Fetch failed: ${fetchError.message}`);
        }

        // If server data exists and differs, resolve conflict
        if (serverData && operation.previousData) {
          const resolution = await conflictResolver.resolve({
            table,
            recordId,
            localData: data,
            serverData,
            previousData: operation.previousData,
          });

          this.emit({
            type: 'conflict-detected',
            operation,
            resolution,
          });

          if (resolution.strategy === 'server-wins') {
            logger.info('[SyncManager] Using server data due to conflict');
            return; // Don't update, server data is preferred
          }
        }

        // Dynamic table update - type safety handled at runtime
        const updateQuery = supabase
          .from(table)
          .update(data as never)
          .eq('id', recordId);
        const { error } = await updateQuery;

        if (error) {
          throw new Error(`Update failed: ${error.message}`);
        }
        break;
      }

      case 'delete': {
        if (!recordId) {
          throw new Error('Delete requires recordId');
        }

        const { error } = await supabase.from(table).delete().eq('id', recordId);

        if (error) {
          throw new Error(`Delete failed: ${error.message}`);
        }
        break;
      }

      default:
        throw new Error(`Unknown operation type: ${type}`);
    }

    logger.info('[SyncManager] Operation executed successfully');
  }

  /**
   * Setup network status listeners
   *
   * CONCEPT: Detect online/offline transitions
   * WHY: Trigger sync when connection restored
   * PATTERN: Browser online/offline events
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      logger.info('[SyncManager] Network online, syncing...');
      this.setStatus(SyncStatus.IDLE);
      this.processPendingOperations();
    });

    window.addEventListener('offline', () => {
      logger.warn('[SyncManager] Network offline');
      this.setStatus(SyncStatus.OFFLINE);
    });

    // Set initial status
    if (!navigator.onLine) {
      this.setStatus(SyncStatus.OFFLINE);
    }
  }

  /**
   * Set sync status and emit event
   *
   * CONCEPT: Update state and notify listeners
   * WHY: Keep UI in sync with sync state
   * PATTERN: Setter with side effects
   */
  private setStatus(status: SyncStatus): void {
    if (this.status === status) return;

    this.status = status;
    this.emit({
      type: 'status-changed',
      status,
    });
  }

  /**
   * Emit event to all listeners
   *
   * CONCEPT: Notify subscribers of events
   * WHY: Event-driven architecture
   * PATTERN: Event emitter
   */
  private emit(event: SyncEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        logger.error('[SyncManager] Listener error:', error);
      }
    });
  }
}

// Export singleton instance
export const syncManager = new SyncManager();
