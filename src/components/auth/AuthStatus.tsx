/**
 * AuthStatus Component - Connection Status Indicator
 *
 * Purpose: Display real-time sync and connection status
 * Features: Color-coded status dots, tooltips, connection details
 *
 * Usage:
 *   <AuthStatus />
 *
 * Last updated: 2025-12-30
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './AuthStatus.css';

type ConnectionStatus = 'connected' | 'syncing' | 'offline';

/**
 * AuthStatus Component
 *
 * CONCEPT: Visual indicator for authentication and sync status
 * WHY: Provide instant feedback on connection health
 * PATTERN: Status dot with tooltip and icon
 *
 * @example
 * ```tsx
 * <AuthStatus />
 * ```
 */
export const AuthStatus: React.FC = () => {
  const { isAuthenticated, session, isLoading } = useAuth();
  const [status, setStatus] = useState<ConnectionStatus>('offline');
  const [showTooltip, setShowTooltip] = useState(false);

  /**
   * Determine connection status
   *
   * CONCEPT: Map auth state to visual status
   * WHY: Provide clear feedback on connection health
   * PATTERN: Computed status from multiple signals
   */
  useEffect(() => {
    if (isLoading) {
      setStatus('syncing');
    } else if (isAuthenticated && session) {
      setStatus('connected');
    } else {
      setStatus('offline');
    }
  }, [isAuthenticated, session, isLoading]);

  /**
   * Get status configuration
   *
   * CONCEPT: Map status to visual properties
   * WHY: Centralize status presentation logic
   * PATTERN: Configuration object
   */
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          label: 'Connected',
          description: 'Your session is active and syncing',
          icon: <Wifi size={16} />,
          dotClass: 'ca-auth-status__dot--connected',
        };
      case 'syncing':
        return {
          label: 'Syncing',
          description: 'Connecting to server...',
          icon: <RefreshCw size={16} className="ca-auth-status__icon--spinning" />,
          dotClass: 'ca-auth-status__dot--syncing',
        };
      case 'offline':
        return {
          label: 'Offline',
          description: 'Not connected. Sign in to sync your progress.',
          icon: <WifiOff size={16} />,
          dotClass: 'ca-auth-status__dot--offline',
        };
    }
  };

  const config = getStatusConfig();

  /**
   * Format session expiry time
   *
   * CONCEPT: Show when session expires
   * WHY: Inform users about session lifetime
   * PATTERN: Date formatting with locale support
   */
  const getExpiryInfo = (): string | null => {
    if (!session?.expires_at) return null;

    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `Expires in ${diffHours}h ${diffMinutes}m`;
    } else if (diffMinutes > 0) {
      return `Expires in ${diffMinutes}m`;
    } else {
      return 'Expiring soon';
    }
  };

  const expiryInfo = getExpiryInfo();

  return (
    <div
      className="ca-auth-status"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      role="status"
      aria-label={`Connection status: ${config.label}`}
      tabIndex={0}
    >
      {/* Status Indicator */}
      <div className="ca-auth-status__indicator">
        <span className={`ca-auth-status__dot ${config.dotClass}`} />
        {config.icon}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="ca-auth-status__tooltip" role="tooltip">
          <div className="ca-auth-status__tooltip-header">
            <span className={`ca-auth-status__tooltip-dot ${config.dotClass}`} />
            <span className="ca-auth-status__tooltip-label">{config.label}</span>
          </div>
          <p className="ca-auth-status__tooltip-description">{config.description}</p>
          {expiryInfo && status === 'connected' && (
            <p className="ca-auth-status__tooltip-expiry">{expiryInfo}</p>
          )}
        </div>
      )}
    </div>
  );
};
