/**
 * Sync Status Integration Examples
 *
 * Purpose: Demonstrate how to integrate sync status components
 * These examples show real-world usage patterns
 *
 * Last updated: 2025-10-11
 */

import React from 'react';
import { SyncStatusIndicator, SyncStatusBadge, useSyncStatus } from '@/components/sync';

/**
 * Example 1: Header Integration (Desktop)
 *
 * CONCEPT: Prominent sync status in app header
 * WHY: Users always see sync status
 * PATTERN: Header with multiple status indicators
 */
export const HeaderWithSync: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-8 w-8" />
            <h1 className="text-xl font-bold text-gray-900">California Counties Puzzle</h1>
          </div>

          {/* Right side: sync status and other controls */}
          <div className="flex items-center gap-4">
            {/* Sync status with label */}
            <SyncStatusIndicator showLabel />

            {/* Other header items */}
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * Example 2: Mobile Header with Badge
 *
 * CONCEPT: Space-efficient sync indicator for mobile
 * WHY: Limited screen space on mobile
 * PATTERN: Compact badge in mobile header
 */
export const MobileHeaderWithSync: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">CA Counties</h1>

        <div className="flex items-center gap-2">
          {/* Compact badge that hides when synced */}
          <SyncStatusBadge hideWhenIdle />

          {/* Menu button */}
          <button className="p-2 text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

/**
 * Example 3: Settings Panel with Custom Hook
 *
 * CONCEPT: Detailed sync control in settings
 * WHY: Advanced users need manual control
 * PATTERN: Custom UI using useSyncStatus hook
 */
export const SettingsPanelWithSync: React.FC = () => {
  const { status, queueSize, isOnline, isSyncing, lastError, syncAll, clearError } =
    useSyncStatus();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      {/* Data Sync Section */}
      <section className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-800">Data Synchronization</h3>

        {/* Status display */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-700">Sync Status</p>
            <p className="text-sm text-gray-500">
              {isOnline ? 'Connected to cloud' : 'Working offline'}
            </p>
          </div>
          <SyncStatusIndicator />
        </div>

        {/* Pending operations */}
        {queueSize > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-medium text-blue-900">Pending Changes</p>
                <p className="text-sm text-blue-700">
                  {queueSize} operation{queueSize !== 1 ? 's' : ''} waiting to sync
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {lastError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-red-900">Sync Error</p>
                <p className="text-sm text-red-700 mt-1">{lastError.message}</p>
                <button
                  onClick={clearError}
                  className="text-sm text-red-600 underline mt-2 hover:text-red-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual sync button */}
        <button
          onClick={syncAll}
          disabled={isSyncing || !isOnline}
          className={`
            w-full py-3 px-4 rounded-lg font-medium transition-colors
            ${
              isSyncing || !isOnline
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }
          `}
        >
          {isSyncing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Syncing...
            </span>
          ) : !isOnline ? (
            'Cannot Sync (Offline)'
          ) : (
            'Sync Now'
          )}
        </button>

        {/* Info text */}
        <p className="text-xs text-gray-500 text-center">
          Your data is automatically synchronized when online. Changes made offline will sync when
          you reconnect.
        </p>
      </section>
    </div>
  );
};

/**
 * Example 4: Status Bar (Bottom of screen)
 *
 * CONCEPT: Persistent status bar for ongoing visibility
 * WHY: Alternative to header placement
 * PATTERN: Fixed position bar with conditional rendering
 */
export const StatusBarWithSync: React.FC = () => {
  const { status, queueSize } = useSyncStatus();

  // Only show status bar when not idle or when operations are pending
  const shouldShow = status !== 'idle' || queueSize > 0;

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center">
          <SyncStatusIndicator showLabel compact />
        </div>
      </div>
    </div>
  );
};

/**
 * Example 5: Responsive Layout Integration
 *
 * CONCEPT: Adaptive sync status display
 * WHY: Different optimal placement for different screen sizes
 * PATTERN: Responsive component with breakpoints
 */
export const ResponsiveLayoutWithSync: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Desktop header with full indicator */}
      <header className="hidden md:block bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">California Counties Puzzle</h1>
            <SyncStatusIndicator showLabel />
          </div>
        </div>
      </header>

      {/* Mobile header with compact badge */}
      <header className="md:hidden bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold">CA Counties</h1>
          <SyncStatusBadge hideWhenIdle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Mobile status bar (shows when needed) */}
      <StatusBarWithSync />
    </div>
  );
};

/**
 * Example 6: Toast/Notification Integration
 *
 * CONCEPT: Temporary notification for sync events
 * WHY: Non-intrusive status updates
 * PATTERN: Toast notification with auto-dismiss
 */
export const SyncToastExample: React.FC = () => {
  const { status, lastError } = useSyncStatus();
  const [showToast, setShowToast] = React.useState(false);

  React.useEffect(() => {
    // Show toast on error or when going offline
    if (status === 'error' || status === 'offline') {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!showToast) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <SyncStatusIndicator compact />
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {status === 'error' ? 'Sync Error' : 'You are Offline'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {lastError ? lastError.message : 'Your changes will sync when you reconnect.'}
            </p>
          </div>
          <button onClick={() => setShowToast(false)} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Export all examples
export default {
  HeaderWithSync,
  MobileHeaderWithSync,
  SettingsPanelWithSync,
  StatusBarWithSync,
  ResponsiveLayoutWithSync,
  SyncToastExample,
};
