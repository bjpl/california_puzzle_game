/**
 * Sync Status Indicator Component
 *
 * Purpose: Visual indicator showing data synchronization status
 * Features: Real-time status updates, tooltips, detailed modal
 *
 * Usage:
 *   import { SyncStatusIndicator } from '@/components/sync/SyncStatusIndicator';
 *   <SyncStatusIndicator />
 *
 * UI States:
 *   - Synced: Green check icon
 *   - Syncing: Spinning blue icon
 *   - Offline: Yellow warning icon
 *   - Error: Red X icon with error details
 *
 * Last updated: 2025-10-11
 */

import React, { useState, useEffect } from 'react';
import { syncManager, SyncStatus, SyncEvent } from '@/lib/syncManager';
import { syncQueue } from '@/lib/syncQueue';
import { logger } from '@/utils/logger';

/**
 * Sync status icon variants
 *
 * CONCEPT: Map status to visual representation
 * WHY: Clear visual feedback for users
 * PATTERN: Status-to-icon mapping
 */
interface SyncStatusConfig {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  tooltip: string;
}

const syncStatusConfigs: Record<SyncStatus, SyncStatusConfig> = {
  [SyncStatus.IDLE]: {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    label: 'Synced',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    tooltip: 'All changes synced',
  },
  [SyncStatus.SYNCING]: {
    icon: (
      <svg
        className="w-5 h-5 animate-spin"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    ),
    label: 'Syncing',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    tooltip: 'Syncing changes...',
  },
  [SyncStatus.OFFLINE]: {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    label: 'Offline',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    tooltip: 'You are offline. Changes will sync when online.',
  },
  [SyncStatus.ERROR]: {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    label: 'Error',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    tooltip: 'Sync error occurred. Click for details.',
  },
};

interface SyncStatusIndicatorProps {
  /** Show label text alongside icon */
  showLabel?: boolean;
  /** Compact mode (smaller size) */
  compact?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Sync Status Indicator Component
 *
 * CONCEPT: Real-time sync status display
 * WHY: User needs to know sync state
 * PATTERN: Observer pattern with React hooks
 */
export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  showLabel = false,
  compact = false,
  className = '',
}) => {
  const [status, setStatus] = useState<SyncStatus>(syncManager.getStatus());
  const [queueSize, setQueueSize] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  /**
   * Subscribe to sync manager events
   *
   * CONCEPT: React to sync state changes
   * WHY: Update UI when sync state changes
   * PATTERN: Effect hook with cleanup
   */
  useEffect(() => {
    const unsubscribe = syncManager.on((event: SyncEvent) => {
      logger.info('[SyncStatusIndicator] Sync event:', event);

      if (event.type === 'status-changed' && event.status) {
        setStatus(event.status);
      }

      if (event.type === 'sync-error' && event.error) {
        setLastError(event.error);
      }

      if (event.type === 'sync-complete') {
        setLastError(null);
      }

      // Update queue size
      updateQueueSize();
    });

    // Update queue size on mount
    updateQueueSize();

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Update pending operations count
   *
   * CONCEPT: Show how many operations are pending
   * WHY: User needs context about sync status
   * PATTERN: Async state update
   */
  const updateQueueSize = async () => {
    try {
      const size = await syncQueue.getQueueSize();
      setQueueSize(size);
    } catch (error) {
      logger.error('[SyncStatusIndicator] Failed to get queue size:', error);
    }
  };

  const config = syncStatusConfigs[status];
  const sizeClasses = compact ? 'p-1' : 'p-2';

  /**
   * Handle click to show details
   *
   * CONCEPT: Interactive status indicator
   * WHY: User may want more information
   * PATTERN: Event handler
   */
  const handleClick = () => {
    if (status === SyncStatus.ERROR || status === SyncStatus.OFFLINE || queueSize > 0) {
      setShowDetailsModal(true);
    }
  };

  return (
    <>
      <div className={`inline-flex items-center ${className}`}>
        <button
          type="button"
          onClick={handleClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          className={`
            relative flex items-center gap-2 rounded-lg transition-all
            ${sizeClasses} ${config.bgColor} ${config.color}
            hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2
            focus:ring-blue-500
          `}
          aria-label={`Sync status: ${config.label}`}
          aria-describedby={showTooltip ? 'sync-status-tooltip' : undefined}
        >
          {config.icon}
          {showLabel && <span className="text-sm font-medium mr-1">{config.label}</span>}
          {queueSize > 0 && (
            <span
              className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full"
              aria-label={`${queueSize} pending operations`}
            >
              {queueSize}
            </span>
          )}
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div
            id="sync-status-tooltip"
            role="tooltip"
            className="absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap"
            style={{
              top: '100%',
              marginTop: '0.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {config.tooltip}
            {queueSize > 0 && (
              <div className="text-xs text-gray-300 mt-1">
                {queueSize} operation{queueSize !== 1 ? 's' : ''} pending
              </div>
            )}
            <div
              className="absolute w-2 h-2 bg-gray-900 transform rotate-45"
              style={{
                top: '-4px',
                left: '50%',
                marginLeft: '-4px',
              }}
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <SyncDetailsModal
          status={status}
          queueSize={queueSize}
          lastError={lastError}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
};

/**
 * Sync Details Modal Component
 *
 * CONCEPT: Detailed sync information
 * WHY: Users need more context when issues occur
 * PATTERN: Modal dialog with accessibility
 */
interface SyncDetailsModalProps {
  status: SyncStatus;
  queueSize: number;
  lastError: Error | null;
  onClose: () => void;
}

const SyncDetailsModal: React.FC<SyncDetailsModalProps> = ({
  status,
  queueSize,
  lastError,
  onClose,
}) => {
  const config = syncStatusConfigs[status];

  /**
   * Handle manual sync
   *
   * CONCEPT: Allow user to trigger sync
   * WHY: User control over sync timing
   * PATTERN: Async action handler
   */
  const handleManualSync = async () => {
    try {
      await syncManager.syncAll();
      onClose();
    } catch (error) {
      logger.error('[SyncDetailsModal] Manual sync failed:', error);
    }
  };

  /**
   * Close modal on Escape key
   *
   * CONCEPT: Keyboard accessibility
   * WHY: Standard modal behavior
   * PATTERN: Keyboard event handler
   */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sync-details-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2
            id="sync-details-title"
            className="text-xl font-bold text-gray-900 flex items-center gap-2"
          >
            <span className={config.color}>{config.icon}</span>
            Sync Status
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Close dialog"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Status Info */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Current Status</h3>
            <div className={`flex items-center gap-2 p-3 rounded-lg ${config.bgColor}`}>
              <span className={config.color}>{config.label}</span>
            </div>
          </div>

          {queueSize > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Pending Operations</h3>
              <p className="text-sm text-gray-600">
                {queueSize} operation{queueSize !== 1 ? 's' : ''} waiting to sync
              </p>
            </div>
          )}

          {lastError && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Error Details</h3>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">{lastError.message}</p>
              </div>
            </div>
          )}

          {status === SyncStatus.OFFLINE && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                You are currently offline. Your changes are being saved locally and will sync
                automatically when you reconnect.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          {(status === SyncStatus.OFFLINE || status === SyncStatus.ERROR) && (
            <button
              type="button"
              onClick={handleManualSync}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Retry Sync
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncStatusIndicator;
