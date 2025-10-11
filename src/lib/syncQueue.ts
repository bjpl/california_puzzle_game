/**
 * Sync Queue - Offline/Online Operation Management
 *
 * Purpose: Queue sync operations when offline, process when online
 * Features: Persistent queue, retry logic, operation ordering
 *
 * Usage:
 *   import { syncQueue } from '@/lib/syncQueue';
 *   await syncQueue.enqueue(operation);
 *   const pending = await syncQueue.getPending();
 *
 * Last updated: 2025-10-11
 */

import { logger } from '../utils/logger';

/**
 * Sync operation types
 *
 * CONCEPT: CRUD operations for database sync
 * WHY: Type-safe operation definitions
 * PATTERN: Discriminated union types
 */
export type SyncOperationType = 'insert' | 'update' | 'delete';

/**
 * Sync operation status
 *
 * CONCEPT: Track operation lifecycle
 * WHY: Know which operations need processing
 * PATTERN: State machine
 */
export type SyncOperationStatus = 'pending' | 'processing' | 'complete' | 'failed';

/**
 * Sync operation structure
 *
 * CONCEPT: Complete operation metadata
 * WHY: Track all info needed to execute operation
 * PATTERN: Data transfer object
 */
export interface SyncOperation {
  id: string;
  userId: string;
  type: SyncOperationType;
  table: string;
  recordId?: string;
  data: Record<string, any>;
  previousData?: Record<string, any>; // For conflict resolution
  status: SyncOperationStatus;
  retryCount: number;
  createdAt: number;
  processedAt?: number;
  error?: string;
}

/**
 * Sync Queue Class
 *
 * CONCEPT: Persistent operation queue using localStorage
 * WHY: Survive page reloads, enable offline support
 * PATTERN: Queue with localStorage persistence
 */
class SyncQueue {
  private readonly STORAGE_KEY = 'california-puzzle-sync-queue';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second
  private userId: string | null = null;

  /**
   * Initialize queue for user
   *
   * CONCEPT: Set up queue for current user
   * WHY: Scope operations to user
   * PATTERN: Initialization method
   */
  async initialize(userId: string): Promise<void> {
    logger.info('[SyncQueue] Initializing for user:', userId);
    this.userId = userId;

    // Clean up old failed operations
    await this.cleanupFailedOperations();
  }

  /**
   * Enqueue a sync operation
   *
   * CONCEPT: Add operation to queue
   * WHY: Defer operations when offline
   * PATTERN: Queue enqueue with persistence
   */
  async enqueue(
    operation: Omit<SyncOperation, 'id' | 'status' | 'retryCount' | 'createdAt'>
  ): Promise<string> {
    const id = this.generateId();
    const timestamp = Date.now();

    const queuedOperation: SyncOperation = {
      ...operation,
      id,
      status: 'pending',
      retryCount: 0,
      createdAt: timestamp,
    };

    logger.info('[SyncQueue] Enqueueing operation:', {
      id,
      type: operation.type,
      table: operation.table,
    });

    const queue = await this.loadQueue();
    queue.push(queuedOperation);
    await this.saveQueue(queue);

    return id;
  }

  /**
   * Get all pending operations
   *
   * CONCEPT: Retrieve operations to process
   * WHY: Process queue when online
   * PATTERN: Queue retrieval with filtering
   */
  async getPending(): Promise<SyncOperation[]> {
    const queue = await this.loadQueue();

    return queue
      .filter(
        (op) =>
          (op.status === 'pending' || op.status === 'failed') &&
          op.retryCount < this.MAX_RETRIES &&
          op.userId === this.userId
      )
      .sort((a, b) => a.createdAt - b.createdAt); // FIFO order
  }

  /**
   * Mark operation as processing
   *
   * CONCEPT: Update operation status
   * WHY: Prevent duplicate processing
   * PATTERN: Status update
   */
  async markProcessing(operationId: string): Promise<void> {
    logger.info('[SyncQueue] Marking as processing:', operationId);

    const queue = await this.loadQueue();
    const operation = queue.find((op) => op.id === operationId);

    if (!operation) {
      logger.warn('[SyncQueue] Operation not found:', operationId);
      return;
    }

    operation.status = 'processing';
    await this.saveQueue(queue);
  }

  /**
   * Mark operation as complete
   *
   * CONCEPT: Remove completed operation
   * WHY: Keep queue clean
   * PATTERN: Queue removal
   */
  async markComplete(operationId: string): Promise<void> {
    logger.info('[SyncQueue] Marking as complete:', operationId);

    const queue = await this.loadQueue();
    const operation = queue.find((op) => op.id === operationId);

    if (!operation) {
      logger.warn('[SyncQueue] Operation not found:', operationId);
      return;
    }

    operation.status = 'complete';
    operation.processedAt = Date.now();

    // Remove completed operations immediately
    const updatedQueue = queue.filter((op) => op.id !== operationId);
    await this.saveQueue(updatedQueue);
  }

  /**
   * Mark operation as failed
   *
   * CONCEPT: Track failed operations for retry
   * WHY: Implement retry logic
   * PATTERN: Failure handling with retry count
   */
  async markFailed(operationId: string, error: Error): Promise<void> {
    logger.error('[SyncQueue] Marking as failed:', {
      operationId,
      error: error.message,
    });

    const queue = await this.loadQueue();
    const operation = queue.find((op) => op.id === operationId);

    if (!operation) {
      logger.warn('[SyncQueue] Operation not found:', operationId);
      return;
    }

    operation.status = 'failed';
    operation.retryCount += 1;
    operation.error = error.message;

    // Remove if max retries exceeded
    if (operation.retryCount >= this.MAX_RETRIES) {
      logger.error('[SyncQueue] Max retries exceeded, removing:', operationId);
      const updatedQueue = queue.filter((op) => op.id !== operationId);
      await this.saveQueue(updatedQueue);
    } else {
      logger.info('[SyncQueue] Will retry operation:', {
        operationId,
        retryCount: operation.retryCount,
      });
      await this.saveQueue(queue);
    }
  }

  /**
   * Get queue size
   *
   * CONCEPT: Monitor queue length
   * WHY: UI feedback, performance monitoring
   * PATTERN: Getter method
   */
  async getQueueSize(): Promise<number> {
    const queue = await this.loadQueue();
    return queue.filter((op) => op.userId === this.userId).length;
  }

  /**
   * Clear all operations for user
   *
   * CONCEPT: Reset queue
   * WHY: Testing, manual cleanup
   * PATTERN: Clear method
   */
  async clear(): Promise<void> {
    logger.info('[SyncQueue] Clearing queue for user:', this.userId);

    const queue = await this.loadQueue();
    const updatedQueue = queue.filter((op) => op.userId !== this.userId);
    await this.saveQueue(updatedQueue);
  }

  /**
   * Load queue from localStorage
   *
   * CONCEPT: Read persisted queue
   * WHY: Restore queue state
   * PATTERN: Persistence layer
   */
  private async loadQueue(): Promise<SyncOperation[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);

      if (!stored) {
        return [];
      }

      return JSON.parse(stored) as SyncOperation[];
    } catch (error) {
      logger.error('[SyncQueue] Failed to load queue:', error);
      return [];
    }
  }

  /**
   * Save queue to localStorage
   *
   * CONCEPT: Persist queue state
   * WHY: Survive page reloads
   * PATTERN: Persistence layer
   */
  private async saveQueue(queue: SyncOperation[]): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      logger.error('[SyncQueue] Failed to save queue:', error);
      throw error;
    }
  }

  /**
   * Clean up old failed operations
   *
   * CONCEPT: Remove stale operations
   * WHY: Prevent queue bloat
   * PATTERN: Maintenance method
   */
  private async cleanupFailedOperations(): Promise<void> {
    const queue = await this.loadQueue();
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    const cleaned = queue.filter(
      (op) =>
        !(
          op.status === 'failed' &&
          op.retryCount >= this.MAX_RETRIES &&
          op.createdAt < oneDayAgo
        )
    );

    if (cleaned.length < queue.length) {
      logger.info('[SyncQueue] Cleaned up failed operations:', {
        removed: queue.length - cleaned.length,
      });
      await this.saveQueue(cleaned);
    }
  }

  /**
   * Generate unique operation ID
   *
   * CONCEPT: Create unique identifier
   * WHY: Track individual operations
   * PATTERN: UUID-like generation
   */
  private generateId(): string {
    return `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const syncQueue = new SyncQueue();
