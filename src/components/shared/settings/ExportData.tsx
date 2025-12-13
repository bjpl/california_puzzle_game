/**
 * ExportData Component
 *
 * Purpose: Export all user data to a JSON file for data portability and transparency
 * Features:
 * - Fetches data from Supabase (game_sessions, user_progress, game_settings)
 * - Downloads formatted JSON with metadata
 * - Loading states, error handling, and success feedback
 * - File size preview and data type selection
 * - Full accessibility support
 *
 * Last updated: 2025-10-16
 */

import React, { useState } from 'react';
import { supabase, Database } from '@/lib/supabase';
import { useUserId } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { logger } from '@/utils/logger';

/**
 * Export data structure with metadata
 */
interface ExportData {
  metadata: {
    export_date: string;
    user_id: string;
    version: string;
    app_name: string;
  };
  game_sessions?: Database['public']['Tables']['game_sessions']['Row'][];
  user_progress?: Database['public']['Tables']['user_progress']['Row'][];
  game_settings?: Database['public']['Tables']['game_settings']['Row'][];
}

/**
 * Data type selection options
 */
interface DataTypeSelection {
  gameSessions: boolean;
  userProgress: boolean;
  gameSettings: boolean;
}

/**
 * Component state types
 */
type ExportState = 'idle' | 'fetching' | 'downloading' | 'success' | 'error';

export const ExportData: React.FC = () => {
  const userId = useUserId();
  const [state, setState] = useState<ExportState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [estimatedSize, setEstimatedSize] = useState<number>(0);
  const [dataTypes, setDataTypes] = useState<DataTypeSelection>({
    gameSessions: true,
    userProgress: true,
    gameSettings: true,
  });

  /**
   * Format bytes to human-readable string
   */
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  /**
   * Estimate file size based on data
   */
  const estimateFileSize = (data: ExportData): number => {
    const jsonString = JSON.stringify(data, null, 2);
    return new Blob([jsonString]).size;
  };

  /**
   * Toggle data type selection
   */
  const toggleDataType = (type: keyof DataTypeSelection) => {
    setDataTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  /**
   * Fetch all user data from Supabase
   */
  const fetchUserData = async (): Promise<ExportData> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    logger.info('[ExportData] Fetching user data...', { userId });

    const exportData: ExportData = {
      metadata: {
        export_date: new Date().toISOString(),
        user_id: userId,
        version: '1.0.0',
        app_name: 'California Puzzle Game',
      },
    };

    // Fetch game sessions
    if (dataTypes.gameSessions) {
      const { data: sessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (sessionsError) {
        logger.error('[ExportData] Failed to fetch game sessions', sessionsError);
        throw new Error(`Failed to fetch game sessions: ${sessionsError.message}`);
      }

      exportData.game_sessions = sessions || [];
      logger.info('[ExportData] Fetched game sessions', { count: sessions?.length ?? 0 });
    }

    // Fetch user progress
    if (dataTypes.userProgress) {
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) {
        logger.error('[ExportData] Failed to fetch user progress', progressError);
        throw new Error(`Failed to fetch user progress: ${progressError.message}`);
      }

      exportData.user_progress = progress || [];
      logger.info('[ExportData] Fetched user progress', { count: progress?.length ?? 0 });
    }

    // Fetch game settings
    if (dataTypes.gameSettings) {
      const { data: settings, error: settingsError } = await supabase
        .from('game_settings')
        .select('*')
        .eq('user_id', userId);

      if (settingsError) {
        logger.error('[ExportData] Failed to fetch game settings', settingsError);
        throw new Error(`Failed to fetch game settings: ${settingsError.message}`);
      }

      exportData.game_settings = settings || [];
      logger.info('[ExportData] Fetched game settings', { count: settings?.length ?? 0 });
    }

    return exportData;
  };

  /**
   * Download JSON file
   */
  const downloadJSON = (data: ExportData) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    link.href = url;
    link.download = `california-puzzle-data-${date}.json`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);

    logger.info('[ExportData] Data exported successfully', {
      filename: link.download,
      size: blob.size,
    });
  };

  /**
   * Handle export button click
   */
  const handleExport = async () => {
    if (!userId) {
      setError('You must be logged in to export data');
      setState('error');
      return;
    }

    // Check if at least one data type is selected
    if (!dataTypes.gameSessions && !dataTypes.userProgress && !dataTypes.gameSettings) {
      setError('Please select at least one data type to export');
      setState('error');
      return;
    }

    try {
      setState('fetching');
      setError(null);

      // Fetch data from Supabase
      const data = await fetchUserData();

      // Update estimated size
      const size = estimateFileSize(data);
      setEstimatedSize(size);

      setState('downloading');

      // Download JSON file
      downloadJSON(data);

      setState('success');

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setState('idle');
      }, 3000);
    } catch (err) {
      logger.error('[ExportData] Export failed', err);
      setError(err instanceof Error ? err.message : 'Failed to export data');
      setState('error');

      // Reset to idle after 5 seconds
      setTimeout(() => {
        setState('idle');
        setError(null);
      }, 5000);
    }
  };

  /**
   * Get button text based on state
   */
  const getButtonText = (): string => {
    switch (state) {
      case 'fetching':
        return 'Fetching Data...';
      case 'downloading':
        return 'Downloading...';
      case 'success':
        return 'Export Successful!';
      case 'error':
        return 'Export Failed';
      default:
        return 'Export My Data';
    }
  };

  /**
   * Get button variant based on state
   */
  const getButtonVariant = (): 'primary' | 'success' | 'danger' => {
    switch (state) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      default:
        return 'primary';
    }
  };

  /**
   * Check if user is authenticated
   */
  if (!userId) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Your Data</h3>
        <p className="text-gray-600 mb-4">You must be logged in to export your data.</p>
        <div className="text-sm text-gray-500">
          Please sign in to download your game progress, settings, and achievements.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Your Data</h3>
        <p className="text-sm text-gray-600">
          Download all your game data in JSON format. This includes your game sessions, progress,
          achievements, and settings.
        </p>
      </div>

      {/* Data Type Selection */}
      <div className="mb-6 space-y-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Select data to export:</h4>

        {/* Game Sessions */}
        <label className="flex items-start cursor-pointer group">
          <input
            type="checkbox"
            checked={dataTypes.gameSessions}
            onChange={() => toggleDataType('gameSessions')}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Include game sessions"
          />
          <div className="ml-3">
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              Game Sessions
            </span>
            <p className="text-xs text-gray-500">
              Your completed games with scores, times, and difficulty levels
            </p>
          </div>
        </label>

        {/* User Progress */}
        <label className="flex items-start cursor-pointer group">
          <input
            type="checkbox"
            checked={dataTypes.userProgress}
            onChange={() => toggleDataType('userProgress')}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Include user progress"
          />
          <div className="ml-3">
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              Progress & Achievements
            </span>
            <p className="text-xs text-gray-500">
              Total score, best scores, achievements, and overall progress
            </p>
          </div>
        </label>

        {/* Game Settings */}
        <label className="flex items-start cursor-pointer group">
          <input
            type="checkbox"
            checked={dataTypes.gameSettings}
            onChange={() => toggleDataType('gameSettings')}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Include game settings"
          />
          <div className="ml-3">
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              Game Settings
            </span>
            <p className="text-xs text-gray-500">
              Your preferences including difficulty, sound, hints, and accessibility settings
            </p>
          </div>
        </label>
      </div>

      {/* File Size Estimate */}
      {estimatedSize > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Estimated file size:</span>
            <span className="text-sm font-medium text-blue-600">{formatBytes(estimatedSize)}</span>
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="mb-4">
        <Button
          variant={getButtonVariant()}
          fullWidth
          loading={state === 'fetching' || state === 'downloading'}
          disabled={state === 'fetching' || state === 'downloading'}
          onClick={handleExport}
          icon={
            state === 'success' ? (
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : state === 'error' ? (
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
            ) : (
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            )
          }
          aria-label={getButtonText()}
        >
          {getButtonText()}
        </Button>
      </div>

      {/* Status Messages */}
      {state === 'success' && (
        <div
          className="p-4 bg-green-50 border border-green-200 rounded-lg"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-green-600 mt-0.5 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-green-800 mb-1">Export Successful!</h4>
              <p className="text-sm text-green-700">
                Your data has been downloaded successfully. The file is in JSON format and can be
                opened with any text editor.
              </p>
            </div>
          </div>
        </div>
      )}

      {state === 'error' && error && (
        <div
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-1">Export Failed</h4>
              <p className="text-sm text-red-700">{error}</p>
              <p className="text-xs text-red-600 mt-2">
                Please try again. If the problem persists, contact support.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Information */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">About Data Export</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Your data is exported in a standard JSON format</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>The file includes metadata with export date and user ID</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>This is part of your data privacy rights under GDPR/CCPA</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Files are generated on-demand and not stored on our servers</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
