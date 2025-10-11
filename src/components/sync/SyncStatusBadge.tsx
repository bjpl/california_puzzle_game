/**
 * Sync Status Badge Component
 *
 * Purpose: Compact badge-style sync status indicator
 * Features: Minimal design, tooltip, click to open details
 *
 * Usage:
 *   import { SyncStatusBadge } from '@/components/sync/SyncStatusBadge';
 *   <SyncStatusBadge />
 *
 * This is a lighter-weight alternative to SyncStatusIndicator
 * for use in constrained spaces like headers or toolbars.
 *
 * Last updated: 2025-10-11
 */

import React, { useState, useEffect } from 'react';
import { syncManager, SyncStatus } from '@/lib/syncManager';
import { Badge } from '@/components/ui/Badge';

interface SyncStatusBadgeProps {
  /** Show badge only when sync is active (hide when idle) */
  hideWhenIdle?: boolean;
  /** Custom className */
  className?: string;
  /** Click handler (optional, overrides default behavior) */
  onClick?: () => void;
}

/**
 * Sync Status Badge Component
 *
 * CONCEPT: Minimal sync status display
 * WHY: Space-constrained UI areas need compact indicators
 * PATTERN: Badge wrapper with status mapping
 */
export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  hideWhenIdle = false,
  className = '',
  onClick,
}) => {
  const [status, setStatus] = useState<SyncStatus>(syncManager.getStatus());

  useEffect(() => {
    const unsubscribe = syncManager.on((event) => {
      if (event.type === 'status-changed' && event.status) {
        setStatus(event.status);
      }
    });

    return () => unsubscribe();
  }, []);

  // Hide badge if idle and hideWhenIdle is true
  if (hideWhenIdle && status === SyncStatus.IDLE) {
    return null;
  }

  // Map sync status to badge variant
  const getVariant = (): 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
      case SyncStatus.IDLE:
        return 'success';
      case SyncStatus.SYNCING:
        return 'info';
      case SyncStatus.OFFLINE:
        return 'warning';
      case SyncStatus.ERROR:
        return 'danger';
      default:
        return 'info';
    }
  };

  const getLabel = (): string => {
    switch (status) {
      case SyncStatus.IDLE:
        return 'Synced';
      case SyncStatus.SYNCING:
        return 'Syncing...';
      case SyncStatus.OFFLINE:
        return 'Offline';
      case SyncStatus.ERROR:
        return 'Sync Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <Badge
      variant={getVariant()}
      size="small"
      dot={status === SyncStatus.SYNCING}
      className={className}
      onClick={onClick}
    >
      {getLabel()}
    </Badge>
  );
};

export default SyncStatusBadge;
