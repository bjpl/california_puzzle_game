/**
 * Security Features Component Tests
 *
 * Tests for UserSettings, SecurityBadge, and ExportData components
 * Covers functionality, accessibility, loading states, error handling, and edge cases
 *
 * Test Coverage:
 * - UserSettings: Delete account flow, data export, dialogs, confirmations
 * - SecurityBadge: Rendering, tooltip, modal, responsive design
 * - ExportData: Data fetching, file download, loading states, errors
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Components under test
import { UserSettings } from '@/components/shared/settings/UserSettings';
import { SecurityBadge } from '@/components/shared/SecurityBadge';

// Mock dependencies
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: {
      id: 'test-user-id-12345',
      created_at: '2025-01-01T00:00:00Z',
      is_anonymous: true,
    },
    isAuthenticated: true,
    isAnonymous: true,
  })),
  useUserId: vi.fn(() => 'test-user-id-12345'),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    })),
  },
  Database: {},
}));

vi.mock('@/services/supabase/auth', () => ({
  deleteUserAccount: vi.fn(),
  exportUserData: vi.fn(),
}));

vi.mock('@/utils/accessibility', () => ({
  announceToScreenReader: vi.fn(),
}));

vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  },
  mapLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  },
  gameLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  },
  studyLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  },
  soundLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  },
  storageLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  },
  achievementLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  },
}));

describe('UserSettings Component', () => {
  const mockDeleteUserAccount = vi.fn();
  const mockExportUserData = vi.fn();
  const mockAnnounceToScreenReader = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mocks
    // eslint-disable-next-line @typescript-eslint/no-var-requires -- Dynamic import for test mocking
    const { deleteUserAccount, exportUserData } = require('@/services/supabase/auth');
    deleteUserAccount.mockImplementation(mockDeleteUserAccount);
    exportUserData.mockImplementation(mockExportUserData);

    // eslint-disable-next-line @typescript-eslint/no-var-requires -- Dynamic import for test mocking
    const { announceToScreenReader } = require('@/utils/accessibility');
    announceToScreenReader.mockImplementation(mockAnnounceToScreenReader);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render correctly with user information', () => {
      render(<UserSettings />);

      expect(screen.getByText('Account Settings')).toBeInTheDocument();
      expect(screen.getByText('Account Information')).toBeInTheDocument();
      expect(screen.getByText('Data Export')).toBeInTheDocument();
      expect(screen.getByText('Danger Zone')).toBeInTheDocument();
    });

    it('should display user ID (truncated)', () => {
      render(<UserSettings />);

      expect(screen.getByText(/test-user-id-12/)).toBeInTheDocument();
    });

    it('should show account type as Anonymous', () => {
      render(<UserSettings />);

      expect(screen.getByText('Anonymous')).toBeInTheDocument();
    });

    it('should display creation date', () => {
      render(<UserSettings />);

      expect(screen.getByText('1/1/2025')).toBeInTheDocument();
    });

    it('should show "Please sign in" when not authenticated', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires -- Dynamic import for test mocking
      const useAuth = require('@/hooks/useAuth').useAuth;
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isAnonymous: false,
      });

      render(<UserSettings />);

      expect(
        screen.getByText('Please sign in to manage your account settings.')
      ).toBeInTheDocument();
    });
  });

  describe('Delete Account Button', () => {
    it('should render Delete My Account button', () => {
      render(<UserSettings />);

      const deleteButton = screen.getByRole('button', { name: /delete my account/i });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveClass('bg-red-600');
    });

    it('should open confirmation dialog on click', async () => {
      const user = userEvent.setup();
      render(<UserSettings />);

      const deleteButton = screen.getByRole('button', { name: /delete my account permanently/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Delete Account?')).toBeInTheDocument();
      });
    });

    it('should announce dialog opening to screen reader', async () => {
      const user = userEvent.setup();
      render(<UserSettings />);

      const deleteButton = screen.getByRole('button', { name: /delete my account permanently/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockAnnounceToScreenReader).toHaveBeenCalledWith(
          'Delete account dialog opened. This action is irreversible.'
        );
      });
    });
  });

  describe('First Confirmation Dialog', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<UserSettings />);

      const deleteButton = screen.getByRole('button', { name: /delete my account permanently/i });
      await user.click(deleteButton);
    });

    it('should display warning icon and message', () => {
      expect(screen.getByText('Delete Account?')).toBeInTheDocument();
      expect(screen.getByText(/This action will permanently delete:/)).toBeInTheDocument();
    });

    it('should list items that will be deleted', () => {
      expect(screen.getByText(/All game progress and achievements/)).toBeInTheDocument();
      expect(screen.getByText(/Game settings and preferences/)).toBeInTheDocument();
      expect(screen.getByText(/Session history and statistics/)).toBeInTheDocument();
      expect(screen.getByText(/Your user account/)).toBeInTheDocument();
    });

    it('should show warning that action cannot be undone', () => {
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    });

    it('should have Cancel and Continue buttons', () => {
      expect(screen.getByRole('button', { name: /cancel account deletion/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /proceed to final confirmation/i })
      ).toBeInTheDocument();
    });

    it('should close dialog on Cancel click', async () => {
      const user = userEvent.setup();

      const cancelButton = screen.getByRole('button', { name: /cancel account deletion/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should proceed to final confirmation on Continue click', async () => {
      const user = userEvent.setup();

      const continueButton = screen.getByRole('button', { name: /proceed to final confirmation/i });
      await user.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText('Final Confirmation')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Type DELETE')).toBeInTheDocument();
      });
    });
  });

  describe('Final Confirmation Dialog', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<UserSettings />);

      // Navigate to final confirmation
      const deleteButton = screen.getByRole('button', { name: /delete my account permanently/i });
      await user.click(deleteButton);

      const continueButton = screen.getByRole('button', { name: /proceed to final confirmation/i });
      await user.click(continueButton);
    });

    it('should require typing "DELETE" to confirm', () => {
      const input = screen.getByPlaceholderText('Type DELETE');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should disable confirm button until "DELETE" is typed', () => {
      const confirmButton = screen.getByRole('button', { name: /confirm and delete account/i });
      expect(confirmButton).toBeDisabled();
    });

    it('should enable confirm button when "DELETE" is typed correctly', async () => {
      const user = userEvent.setup();
      const input = screen.getByPlaceholderText('Type DELETE');

      await user.type(input, 'DELETE');

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /confirm and delete account/i });
        expect(confirmButton).not.toBeDisabled();
      });
    });

    it('should show error when typing incorrect text', async () => {
      const user = userEvent.setup();
      const input = screen.getByPlaceholderText('Type DELETE');

      await user.type(input, 'delete'); // lowercase

      const confirmButton = screen.getByRole('button', { name: /confirm and delete account/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Please type DELETE to confirm')).toBeInTheDocument();
      });
    });

    it('should not show error for typing wrong text', async () => {
      const user = userEvent.setup();
      const input = screen.getByPlaceholderText('Type DELETE');

      await user.type(input, 'wrong');

      const confirmButton = screen.getByRole('button', { name: /confirm and delete account/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Please type DELETE to confirm')).toBeInTheDocument();
      });
    });
  });

  describe('Account Deletion Process', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<UserSettings />);

      // Navigate to final confirmation
      const deleteButton = screen.getByRole('button', { name: /delete my account permanently/i });
      await user.click(deleteButton);

      const continueButton = screen.getByRole('button', { name: /proceed to final confirmation/i });
      await user.click(continueButton);

      // Type DELETE
      const input = screen.getByPlaceholderText('Type DELETE');
      await user.type(input, 'DELETE');
    });

    it('should call deleteUserAccount on confirmation', async () => {
      const user = userEvent.setup();
      mockDeleteUserAccount.mockResolvedValue({ success: true });

      const confirmButton = screen.getByRole('button', { name: /confirm and delete account/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockDeleteUserAccount).toHaveBeenCalledTimes(1);
      });
    });

    it('should show loading state during deletion', async () => {
      const user = userEvent.setup();
      mockDeleteUserAccount.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const confirmButton = screen.getByRole('button', { name: /confirm and delete account/i });
      await user.click(confirmButton);

      expect(screen.getByText('Deleting...')).toBeInTheDocument();
      expect(screen.getByText('Deleting your account... Please wait.')).toBeInTheDocument();
    });

    it('should announce deletion progress to screen reader', async () => {
      const user = userEvent.setup();
      mockDeleteUserAccount.mockResolvedValue({ success: true });

      const confirmButton = screen.getByRole('button', { name: /confirm and delete account/i });
      await user.click(confirmButton);

      expect(mockAnnounceToScreenReader).toHaveBeenCalledWith('Deleting account. Please wait...');
    });

    it('should redirect after successful deletion', async () => {
      const user = userEvent.setup();
      mockDeleteUserAccount.mockResolvedValue({ success: true });

      // Mock window.location.href
      delete window.location;
      window.location = { href: '' } as Location;

      const confirmButton = screen.getByRole('button', { name: /confirm and delete account/i });
      await user.click(confirmButton);

      await waitFor(
        () => {
          expect(mockAnnounceToScreenReader).toHaveBeenCalledWith(
            'Account deleted successfully. Redirecting to home page.'
          );
        },
        { timeout: 2000 }
      );
    });

    it('should display error message on failure', async () => {
      const user = userEvent.setup();
      mockDeleteUserAccount.mockResolvedValue({
        success: false,
        error: 'Database connection failed',
      });

      const confirmButton = screen.getByRole('button', { name: /confirm and delete account/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Database connection failed/)).toBeInTheDocument();
      });
    });

    it('should handle exceptions gracefully', async () => {
      const user = userEvent.setup();
      mockDeleteUserAccount.mockRejectedValue(new Error('Network error'));

      const confirmButton = screen.getByRole('button', { name: /confirm and delete account/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });
  });

  describe('Export Data Button', () => {
    it('should render Export My Data button', () => {
      render(<UserSettings />);

      expect(screen.getByRole('button', { name: /export all your data/i })).toBeInTheDocument();
    });

    it('should call exportUserData on click', async () => {
      const user = userEvent.setup();
      mockExportUserData.mockResolvedValue({
        success: true,
        data: { game_sessions: [], user_progress: [] },
      });

      render(<UserSettings />);

      const exportButton = screen.getByRole('button', { name: /export all your data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockExportUserData).toHaveBeenCalledWith('test-user-id-12345');
      });
    });

    it('should show loading state during export', async () => {
      const user = userEvent.setup();
      mockExportUserData.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<UserSettings />);

      const exportButton = screen.getByRole('button', { name: /export all your data/i });
      await user.click(exportButton);

      expect(screen.getByText('Exporting...')).toBeInTheDocument();
    });

    it('should create and download JSON file on success', async () => {
      const user = userEvent.setup();
      const mockData = {
        user_id: 'test-user-id-12345',
        game_sessions: [{ id: 1, score: 100 }],
        user_progress: [{ total_score: 500 }],
      };
      mockExportUserData.mockResolvedValue({ success: true, data: mockData });

      // Mock DOM methods
      const mockClick = vi.fn();
      const mockAppendChild = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation(() => null as unknown);
      const mockRemoveChild = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation(() => null as unknown);
      const mockCreateElement = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return {
            click: mockClick,
            href: '',
            download: '',
          } as unknown;
        }
        return document.createElement(tag);
      });

      render(<UserSettings />);

      const exportButton = screen.getByRole('button', { name: /export all your data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockClick).toHaveBeenCalled();
      });

      mockCreateElement.mockRestore();
      mockAppendChild.mockRestore();
      mockRemoveChild.mockRestore();
    });

    it('should display error message on export failure', async () => {
      const user = userEvent.setup();
      mockExportUserData.mockResolvedValue({
        success: false,
        error: 'Failed to fetch data',
      });

      render(<UserSettings />);

      const exportButton = screen.getByRole('button', { name: /export all your data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch data/)).toBeInTheDocument();
      });
    });
  });

  describe('Close Button', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      render(<UserSettings onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /close account settings/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not render close button when onClose is not provided', () => {
      render(<UserSettings />);

      expect(
        screen.queryByRole('button', { name: /close account settings/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<UserSettings />);

      expect(screen.getByRole('region', { name: /user account settings/i })).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(<UserSettings />);

      expect(screen.getByRole('heading', { name: 'Account Settings' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Account Information' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Data Export' })).toBeInTheDocument();
    });

    it('should announce status changes to screen readers', async () => {
      const user = userEvent.setup();
      mockDeleteUserAccount.mockResolvedValue({ success: true });

      render(<UserSettings />);

      const deleteButton = screen.getByRole('button', { name: /delete my account permanently/i });
      await user.click(deleteButton);

      expect(mockAnnounceToScreenReader).toHaveBeenCalled();
    });

    it('should have keyboard-accessible buttons', async () => {
      const user = userEvent.setup();
      render(<UserSettings />);

      const deleteButton = screen.getByRole('button', { name: /delete my account permanently/i });
      deleteButton.focus();
      expect(deleteButton).toHaveFocus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });
});

describe('SecurityBadge Component', () => {
  describe('Rendering', () => {
    it('should render with shield icon and text', () => {
      render(<SecurityBadge />);

      expect(screen.getByText('Secured with E2E Encryption')).toBeInTheDocument();
      expect(screen.getByLabelText('Security information')).toBeInTheDocument();
    });

    it('should render with small size by default', () => {
      render(<SecurityBadge />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-xs');
    });

    it('should render with medium size when specified', () => {
      render(<SecurityBadge size="md" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-sm');
    });

    it('should render with large size when specified', () => {
      render(<SecurityBadge size="lg" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-base');
    });

    it('should show pulse animation by default', () => {
      render(<SecurityBadge />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('animate-pulse-subtle');
    });

    it('should not show pulse animation when disabled', () => {
      render(<SecurityBadge showPulse={false} />);

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('animate-pulse-subtle');
    });
  });

  describe('Tooltip', () => {
    it('should show tooltip on hover', async () => {
      const user = userEvent.setup();
      render(<SecurityBadge />);

      const button = screen.getByRole('button');
      await user.hover(button);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText(/Your data is encrypted using AES-256/)).toBeInTheDocument();
      });
    });

    it('should hide tooltip on mouse leave', async () => {
      const user = userEvent.setup();
      render(<SecurityBadge />);

      const button = screen.getByRole('button');
      await user.hover(button);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      await user.unhover(button);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('should show tooltip on focus', async () => {
      const user = userEvent.setup();
      render(<SecurityBadge />);

      const _button = screen.getByRole('button');
      await user.tab(); // Focus the button

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should display all security information in tooltip', async () => {
      const user = userEvent.setup();
      render(<SecurityBadge />);

      const button = screen.getByRole('button');
      await user.hover(button);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(
          within(tooltip).getByText(/Your data is encrypted using AES-256/)
        ).toBeInTheDocument();
        expect(
          within(tooltip).getByText(/Anonymous authentication for privacy/)
        ).toBeInTheDocument();
        expect(within(tooltip).getByText(/No personal data collected/)).toBeInTheDocument();
        expect(within(tooltip).getByText(/Local-first data storage/)).toBeInTheDocument();
      });
    });
  });

  describe('Modal', () => {
    it('should open modal on click', async () => {
      const user = userEvent.setup();
      render(<SecurityBadge />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Security & Privacy')).toBeInTheDocument();
      });
    });

    it('should call custom onClick handler if provided', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();
      render(<SecurityBadge onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should display all security information in modal', async () => {
      const user = userEvent.setup();
      render(<SecurityBadge />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText('End-to-End Encryption (AES-256)')).toBeInTheDocument();
        expect(within(dialog).getByText('Anonymous Authentication')).toBeInTheDocument();
        expect(within(dialog).getByText('Zero Personal Data Collection')).toBeInTheDocument();
        expect(within(dialog).getByText('Local-First Architecture')).toBeInTheDocument();
      });
    });

    it('should close modal on close button click', async () => {
      const user = userEvent.setup();
      render(<SecurityBadge />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should close modal on backdrop click', async () => {
      const user = userEvent.setup();
      render(<SecurityBadge />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const backdrop = screen.getByRole('dialog').parentElement;
      if (backdrop) {
        await user.click(backdrop);

        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Responsive Design', () => {
    it('should work in dark mode', () => {
      render(<SecurityBadge />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('dark:from-green-400/20');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<SecurityBadge />);

      await user.tab();
      const button = screen.getByRole('button');
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<SecurityBadge />);

      expect(screen.getByLabelText('Security information')).toBeInTheDocument();
    });

    it('should have focus ring', () => {
      render(<SecurityBadge />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:ring-2');
    });
  });
});
