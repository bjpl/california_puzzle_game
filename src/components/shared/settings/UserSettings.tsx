/**
 * User Settings Component
 *
 * Provides user account management features including:
 * - Account deletion with two-step confirmation
 * - Data export (GDPR compliance)
 * - Account information display
 *
 * ACCESSIBILITY:
 * - WCAG 2.1 AAA compliant
 * - Touch-target sizes meet guidelines
 * - Proper ARIA labels and roles
 * - Keyboard navigation support
 * - Screen reader announcements
 *
 * SECURITY:
 * - Two-step confirmation for deletion
 * - Requires typing "DELETE" to confirm
 * - Clears all local storage on deletion
 * - Proper error handling and user feedback
 */

import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase as _supabase } from '../../../lib/supabase';
import { deleteUserAccount, exportUserData } from '../../../services/supabase/auth';
import { announceToScreenReader } from '../../../utils/accessibility';

interface UserSettingsProps {
  onClose?: () => void;
}

export const UserSettings: React.FC<UserSettingsProps> = ({ onClose }) => {
  const { user, isAuthenticated, isAnonymous } = useAuth();

  // State for delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // State for data export
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  /**
   * Handle account deletion with proper error handling and cleanup
   */
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm');
      announceToScreenReader('Confirmation text does not match. Please type DELETE exactly.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    announceToScreenReader('Deleting account. Please wait...');

    try {
      const result = await deleteUserAccount();

      if (result.success) {
        announceToScreenReader('Account deleted successfully. Redirecting to home page.');

        // Wait a moment for the announcement, then redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setDeleteError(result.error || 'Failed to delete account. Please try again.');
        announceToScreenReader(`Account deletion failed: ${result.error}`);
        setIsDeleting(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setDeleteError(errorMessage);
      announceToScreenReader(`Account deletion failed: ${errorMessage}`);
      setIsDeleting(false);
    }
  };

  /**
   * Handle data export with proper error handling
   */
  const handleExportData = async () => {
    if (!user?.id) {
      setExportError('No user ID found');
      return;
    }

    setIsExporting(true);
    setExportError(null);
    announceToScreenReader('Exporting your data. Please wait...');

    try {
      const result = await exportUserData(user.id);

      if (result.success && result.data) {
        // Create downloadable JSON file
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `california-puzzle-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        announceToScreenReader('Data exported successfully. Download started.');
      } else {
        setExportError(result.error || 'Failed to export data');
        announceToScreenReader(`Data export failed: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setExportError(errorMessage);
      announceToScreenReader(`Data export failed: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Open first confirmation dialog
   */
  const openDeleteDialog = () => {
    setShowDeleteDialog(true);
    setDeleteError(null);
    setDeleteConfirmText('');
    announceToScreenReader('Delete account dialog opened. This action is irreversible.');
  };

  /**
   * Close all dialogs and reset state
   */
  const closeDialogs = () => {
    setShowDeleteDialog(false);
    setShowFinalConfirmation(false);
    setDeleteConfirmText('');
    setDeleteError(null);
    announceToScreenReader('Delete account dialog closed.');
  };

  /**
   * Move to final confirmation step
   */
  const proceedToFinalConfirmation = () => {
    setShowFinalConfirmation(true);
    announceToScreenReader(
      'Final confirmation step. Please type DELETE to confirm account deletion.'
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="user-settings bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <p className="text-gray-600">Please sign in to manage your account settings.</p>
      </div>
    );
  }

  return (
    <div
      className="user-settings bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto"
      role="region"
      aria-label="User Account Settings"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="touch-target p-2 rounded-lg hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Close account settings"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Account Information */}
        <section aria-labelledby="account-info-heading">
          <h3 id="account-info-heading" className="text-lg font-semibold mb-4">
            Account Information
          </h3>
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">User ID:</span>
              <span className="font-mono text-sm">{user?.id?.substring(0, 16)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account Type:</span>
              <span className="font-medium">{isAnonymous ? 'Anonymous' : 'Registered'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>
        </section>

        {/* Data Export */}
        <section aria-labelledby="data-export-heading">
          <h3 id="data-export-heading" className="text-lg font-semibold mb-4">
            Data Export
          </h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">
              Download a copy of all your game data including sessions, progress, and settings. This
              complies with GDPR data portability requirements.
            </p>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="touch-target px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors font-medium"
              aria-label="Export all your data"
            >
              {isExporting ? 'Exporting...' : 'Export My Data'}
            </button>
            {exportError && (
              <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-400 rounded" role="alert">
                <p className="text-sm text-red-800">{exportError}</p>
              </div>
            )}
          </div>
        </section>

        {/* Danger Zone - Account Deletion */}
        <section aria-labelledby="danger-zone-heading">
          <h3 id="danger-zone-heading" className="text-lg font-semibold mb-4 text-red-600">
            Danger Zone
          </h3>
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">Delete Account</h4>
            <p className="text-sm text-red-800 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
              All game progress, settings, and session data will be permanently removed.
            </p>
            <button
              onClick={openDeleteDialog}
              disabled={isDeleting}
              className="touch-target px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors font-medium"
              aria-label="Delete my account permanently"
            >
              {isDeleting ? 'Deleting...' : 'Delete My Account'}
            </button>
          </div>
        </section>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {!showFinalConfirmation ? (
              // First Confirmation Step
              <>
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-red-600"
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
                  </div>
                  <div className="ml-3">
                    <h3 id="delete-dialog-title" className="text-lg font-semibold text-gray-900">
                      Delete Account?
                    </h3>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-3">This action will permanently delete:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
                    <li>All game progress and achievements</li>
                    <li>Game settings and preferences</li>
                    <li>Session history and statistics</li>
                    <li>Your user account</li>
                  </ul>
                  <p className="text-sm font-semibold text-red-600 mt-4">
                    This action cannot be undone.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeDialogs}
                    disabled={isDeleting}
                    className="touch-target px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-gray-500 transition-colors font-medium"
                    aria-label="Cancel account deletion"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={proceedToFinalConfirmation}
                    disabled={isDeleting}
                    className="touch-target px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 focus-visible:ring-2 focus-visible:ring-red-500 transition-colors font-medium"
                    aria-label="Proceed to final confirmation"
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              // Final Confirmation Step
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Final Confirmation</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    To confirm account deletion, please type <strong>DELETE</strong> (in capital
                    letters) in the field below:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => {
                      setDeleteConfirmText(e.target.value);
                      setDeleteError(null);
                    }}
                    disabled={isDeleting}
                    placeholder="Type DELETE"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500 disabled:opacity-50 font-mono"
                    aria-label="Type DELETE to confirm account deletion"
                    aria-describedby="delete-confirm-help"
                    autoFocus
                  />
                  <p id="delete-confirm-help" className="text-xs text-gray-500 mt-2">
                    This helps prevent accidental deletions
                  </p>
                </div>

                {deleteError && (
                  <div
                    className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded"
                    role="alert"
                  >
                    <p className="text-sm text-red-800">{deleteError}</p>
                  </div>
                )}

                {isDeleting && (
                  <div
                    className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded"
                    role="status"
                  >
                    <p className="text-sm text-blue-800 font-medium">
                      Deleting your account... Please wait.
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeDialogs}
                    disabled={isDeleting}
                    className="touch-target px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-gray-500 transition-colors font-medium"
                    aria-label="Cancel account deletion"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                    className="touch-target px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-red-500 transition-colors font-medium"
                    aria-label="Confirm and delete account"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
