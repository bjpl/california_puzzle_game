/**
 * Conflict Resolver - Handle Data Sync Conflicts
 *
 * Purpose: Resolve conflicts when local and server data differ
 * Features: Multiple resolution strategies, timestamps, user preferences
 *
 * Usage:
 *   import { conflictResolver } from '@/lib/conflictResolver';
 *   const resolution = await conflictResolver.resolve(conflict);
 *
 * Last updated: 2025-10-11
 */

import { logger } from '../utils/logger';

/**
 * Conflict resolution strategies
 *
 * CONCEPT: Different ways to handle conflicts
 * WHY: Flexible conflict handling based on data type
 * PATTERN: Strategy pattern
 */
export type ConflictStrategy =
  | 'client-wins' // Use local data
  | 'server-wins' // Use server data
  | 'merge' // Combine both
  | 'newest' // Use most recent timestamp
  | 'manual'; // Require user decision

/**
 * Conflict data structure
 *
 * CONCEPT: Complete conflict context
 * WHY: All info needed for resolution
 * PATTERN: Data transfer object
 */
export interface Conflict {
  table: string;
  recordId: string;
  localData: Record<string, unknown>;
  serverData: Record<string, unknown>;
  previousData?: Record<string, unknown>; // Last known synchronized state
}

/**
 * Conflict resolution result
 *
 * CONCEPT: Resolution decision and data
 * WHY: Return both strategy used and resolved data
 * PATTERN: Result object
 */
export interface ConflictResolution {
  strategy: ConflictStrategy;
  resolvedData: Record<string, unknown>;
  conflicts: string[]; // List of conflicting fields
  requiresUserAction: boolean;
}

/**
 * Conflict Resolver Class
 *
 * CONCEPT: Smart conflict resolution engine
 * WHY: Automatic and manual conflict handling
 * PATTERN: Strategy pattern with heuristics
 */
class ConflictResolver {
  /**
   * Resolve a data conflict
   *
   * CONCEPT: Apply resolution strategy
   * WHY: Determine which data to keep
   * PATTERN: Strategy selection and execution
   */
  async resolve(conflict: Conflict): Promise<ConflictResolution> {
    logger.info('[ConflictResolver] Resolving conflict:', {
      table: conflict.table,
      recordId: conflict.recordId,
    });

    // Detect conflicting fields
    const conflicts = this.detectConflicts(conflict.localData, conflict.serverData);

    if (conflicts.length === 0) {
      logger.info('[ConflictResolver] No conflicts detected');
      return {
        strategy: 'client-wins',
        resolvedData: conflict.localData,
        conflicts: [],
        requiresUserAction: false,
      };
    }

    logger.info('[ConflictResolver] Conflicts detected:', conflicts);

    // Choose resolution strategy based on table and data type
    const strategy = this.chooseStrategy(conflict);

    // Apply strategy
    switch (strategy) {
      case 'client-wins':
        return this.resolveClientWins(conflict, conflicts);

      case 'server-wins':
        return this.resolveServerWins(conflict, conflicts);

      case 'newest':
        return this.resolveNewest(conflict, conflicts);

      case 'merge':
        return this.resolveMerge(conflict, conflicts);

      case 'manual':
        return this.resolveManual(conflict, conflicts);

      default:
        logger.warn('[ConflictResolver] Unknown strategy, defaulting to server-wins');
        return this.resolveServerWins(conflict, conflicts);
    }
  }

  /**
   * Detect conflicting fields
   *
   * CONCEPT: Compare data to find differences
   * WHY: Know which fields conflict
   * PATTERN: Deep comparison
   */
  private detectConflicts(local: Record<string, unknown>, server: Record<string, unknown>): string[] {
    const conflicts: string[] = [];
    const allKeys = new Set([...Object.keys(local), ...Object.keys(server)]);

    for (const key of allKeys) {
      // Skip metadata fields
      if (key === 'id' || key === 'created_at' || key === 'user_id') {
        continue;
      }

      const localValue = local[key];
      const serverValue = server[key];

      // Deep comparison for objects and arrays
      if (JSON.stringify(localValue) !== JSON.stringify(serverValue)) {
        conflicts.push(key);
      }
    }

    return conflicts;
  }

  /**
   * Choose resolution strategy
   *
   * CONCEPT: Smart strategy selection
   * WHY: Different data types need different strategies
   * PATTERN: Heuristic-based decision
   */
  private chooseStrategy(conflict: Conflict): ConflictStrategy {
    const { table, localData, serverData } = conflict;

    // For game stats, use merge strategy
    if (table === 'user_progress') {
      return 'merge';
    }

    // For settings, prefer newest based on timestamp
    if (table === 'game_settings' || table === 'user_settings') {
      return 'newest';
    }

    // For game sessions, server always wins (historical data)
    if (table === 'game_sessions') {
      return 'server-wins';
    }

    // Check if we have timestamp information
    const localTimestamp = this.getTimestamp(localData);
    const serverTimestamp = this.getTimestamp(serverData);

    if (localTimestamp && serverTimestamp) {
      return 'newest';
    }

    // Default to server-wins for safety
    return 'server-wins';
  }

  /**
   * Resolve using client data
   *
   * CONCEPT: Local changes override server
   * WHY: User's recent changes should be preserved
   * PATTERN: Simple resolution
   */
  private resolveClientWins(conflict: Conflict, conflicts: string[]): ConflictResolution {
    logger.info('[ConflictResolver] Client wins');

    return {
      strategy: 'client-wins',
      resolvedData: conflict.localData,
      conflicts,
      requiresUserAction: false,
    };
  }

  /**
   * Resolve using server data
   *
   * CONCEPT: Server data overrides local
   * WHY: Server is source of truth
   * PATTERN: Simple resolution
   */
  private resolveServerWins(conflict: Conflict, conflicts: string[]): ConflictResolution {
    logger.info('[ConflictResolver] Server wins');

    return {
      strategy: 'server-wins',
      resolvedData: conflict.serverData,
      conflicts,
      requiresUserAction: false,
    };
  }

  /**
   * Resolve using newest timestamp
   *
   * CONCEPT: Most recent change wins
   * WHY: Preserve latest user action
   * PATTERN: Timestamp comparison
   */
  private resolveNewest(conflict: Conflict, conflicts: string[]): ConflictResolution {
    const localTimestamp = this.getTimestamp(conflict.localData);
    const serverTimestamp = this.getTimestamp(conflict.serverData);

    if (!localTimestamp || !serverTimestamp) {
      logger.warn('[ConflictResolver] Missing timestamps, falling back to server-wins');
      return this.resolveServerWins(conflict, conflicts);
    }

    const useLocal = localTimestamp > serverTimestamp;

    logger.info('[ConflictResolver] Newest wins:', {
      winner: useLocal ? 'client' : 'server',
      localTimestamp,
      serverTimestamp,
    });

    return {
      strategy: 'newest',
      resolvedData: useLocal ? conflict.localData : conflict.serverData,
      conflicts,
      requiresUserAction: false,
    };
  }

  /**
   * Resolve by merging data
   *
   * CONCEPT: Combine local and server data
   * WHY: Preserve information from both sources
   * PATTERN: Smart merge with additive fields
   */
  private resolveMerge(conflict: Conflict, conflicts: string[]): ConflictResolution {
    logger.info('[ConflictResolver] Merging data');

    const merged: Record<string, unknown> = { ...conflict.serverData };

    // For numeric fields, use the maximum value
    for (const key of conflicts) {
      const localValue = conflict.localData[key];
      const serverValue = conflict.serverData[key];

      if (typeof localValue === 'number' && typeof serverValue === 'number') {
        merged[key] = Math.max(localValue, serverValue);
      } else if (Array.isArray(localValue) && Array.isArray(serverValue)) {
        // For arrays, merge unique values
        merged[key] = Array.from(new Set([...localValue, ...serverValue]));
      } else if (typeof localValue === 'object' && typeof serverValue === 'object') {
        // For objects, recursively merge
        merged[key] = { ...serverValue, ...localValue };
      } else {
        // For other types, prefer local (newest changes)
        merged[key] = localValue;
      }
    }

    return {
      strategy: 'merge',
      resolvedData: merged,
      conflicts,
      requiresUserAction: false,
    };
  }

  /**
   * Resolve manually (require user input)
   *
   * CONCEPT: Cannot auto-resolve
   * WHY: Critical data needs user decision
   * PATTERN: Deferred resolution
   */
  private resolveManual(conflict: Conflict, conflicts: string[]): ConflictResolution {
    logger.warn('[ConflictResolver] Manual resolution required');

    return {
      strategy: 'manual',
      resolvedData: conflict.serverData, // Temporary use server data
      conflicts,
      requiresUserAction: true,
    };
  }

  /**
   * Extract timestamp from data
   *
   * CONCEPT: Get modification time
   * WHY: Compare data freshness
   * PATTERN: Field lookup with fallback
   */
  private getTimestamp(data: Record<string, unknown>): number | null {
    // Try common timestamp fields
    const timestampFields = ['updated_at', 'modified_at', 'timestamp', 'last_modified'];

    for (const field of timestampFields) {
      const value = data[field];

      if (typeof value === 'number') {
        return value;
      }

      if (typeof value === 'string') {
        const timestamp = new Date(value).getTime();
        if (!isNaN(timestamp)) {
          return timestamp;
        }
      }
    }

    return null;
  }
}

// Export singleton instance
export const conflictResolver = new ConflictResolver();
