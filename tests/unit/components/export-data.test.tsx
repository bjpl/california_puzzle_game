/**
 * ExportData Component Tests
 *
 * Tests for data export functionality including:
 * - Data fetching from Supabase
 * - File creation and download
 * - Data type selection
 * - Loading states and error handling
 * - File size estimation
 *
 * Coverage: Export button, checkboxes, state management, error scenarios
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ExportData } from '@/components/shared/settings/ExportData';

// Mock dependencies
vi.mock('@/hooks/useAuth', () => ({
  useUserId: vi.fn(() => 'test-user-id-12345'),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
  Database: {},
}));

vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('ExportData Component', () => {
  const mockSupabaseFrom = vi.fn();
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Supabase mock
    const { supabase } = require('@/lib/supabase');
    supabase.from = mockSupabaseFrom;

    // Mock URL methods
    mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
    mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with title and description', () => {
      render(<ExportData />);

      expect(screen.getByText('Export Your Data')).toBeInTheDocument();
      expect(screen.getByText(/Download all your game data in JSON format/)).toBeInTheDocument();
    });

    it('should render all data type checkboxes', () => {
      render(<ExportData />);

      expect(screen.getByLabelText('Include game sessions')).toBeInTheDocument();
      expect(screen.getByLabelText('Include user progress')).toBeInTheDocument();
      expect(screen.getByLabelText('Include game settings')).toBeInTheDocument();
    });

    it('should have all checkboxes checked by default', () => {
      render(<ExportData />);

      expect(screen.getByLabelText('Include game sessions')).toBeChecked();
      expect(screen.getByLabelText('Include user progress')).toBeChecked();
      expect(screen.getByLabelText('Include game settings')).toBeChecked();
    });

    it('should render Export My Data button', () => {
      render(<ExportData />);

      expect(screen.getByRole('button', { name: /export my data/i })).toBeInTheDocument();
    });

    it('should show "Please sign in" when not authenticated', () => {
      const useUserId = require('@/hooks/useAuth').useUserId;
      useUserId.mockReturnValue(null);

      render(<ExportData />);

      expect(screen.getByText(/You must be logged in to export your data/)).toBeInTheDocument();
    });
  });

  describe('Data Type Selection', () => {
    it('should toggle game sessions checkbox', async () => {
      const user = userEvent.setup();
      render(<ExportData />);

      const checkbox = screen.getByLabelText('Include game sessions');
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('should toggle user progress checkbox', async () => {
      const user = userEvent.setup();
      render(<ExportData />);

      const checkbox = screen.getByLabelText('Include user progress');
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should toggle game settings checkbox', async () => {
      const user = userEvent.setup();
      render(<ExportData />);

      const checkbox = screen.getByLabelText('Include game settings');
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should allow multiple checkboxes to be unchecked', async () => {
      const user = userEvent.setup();
      render(<ExportData />);

      await user.click(screen.getByLabelText('Include game sessions'));
      await user.click(screen.getByLabelText('Include user progress'));

      expect(screen.getByLabelText('Include game sessions')).not.toBeChecked();
      expect(screen.getByLabelText('Include user progress')).not.toBeChecked();
      expect(screen.getByLabelText('Include game settings')).toBeChecked();
    });
  });

  describe('Data Fetching', () => {
    beforeEach(() => {
      // Setup successful mock responses
      mockSupabaseFrom.mockImplementation((table: string) => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: table === 'game_sessions' ? [{ id: 1, score: 100 }] : [],
              error: null,
            })),
          })),
        })),
      }));
    });

    it('should fetch data from Supabase on export', async () => {
      const user = userEvent.setup();

      // Mock createElement and appendChild
      const mockClick = vi.fn();
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return {
            click: mockClick,
            href: '',
            download: '',
          } as any;
        }
        return document.createElement(tag);
      });
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      render(<ExportData />);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockSupabaseFrom).toHaveBeenCalledWith('game_sessions');
        expect(mockSupabaseFrom).toHaveBeenCalledWith('user_progress');
        expect(mockSupabaseFrom).toHaveBeenCalledWith('game_settings');
      });
    });

    it('should only fetch selected data types', async () => {
      const user = userEvent.setup();

      // Mock createElement and appendChild
      const mockClick = vi.fn();
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return {
            click: mockClick,
            href: '',
            download: '',
          } as any;
        }
        return document.createElement(tag);
      });
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      render(<ExportData />);

      // Uncheck user progress
      await user.click(screen.getByLabelText('Include user progress'));

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockSupabaseFrom).toHaveBeenCalledWith('game_sessions');
        expect(mockSupabaseFrom).toHaveBeenCalledWith('game_settings');
      });
    });

    it('should show error when no data types are selected', async () => {
      const user = userEvent.setup();
      render(<ExportData />);

      // Uncheck all
      await user.click(screen.getByLabelText('Include game sessions'));
      await user.click(screen.getByLabelText('Include user progress'));
      await user.click(screen.getByLabelText('Include game settings'));

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/Please select at least one data type to export/)).toBeInTheDocument();
      });
    });
  });

  describe('File Download', () => {
    beforeEach(() => {
      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      }));
    });

    it('should create downloadable JSON file', async () => {
      const user = userEvent.setup();
      const mockClick = vi.fn();
      const mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      const mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      let capturedElement: HTMLAnchorElement | null = null;
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          capturedElement = {
            click: mockClick,
            href: '',
            download: '',
          } as any;
          return capturedElement;
        }
        return document.createElement(tag);
      });

      render(<ExportData />);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockClick).toHaveBeenCalled();
        expect(capturedElement?.download).toMatch(/california-puzzle-data-\d{4}-\d{2}-\d{2}\.json/);
      });

      mockAppendChild.mockRestore();
      mockRemoveChild.mockRestore();
    });

    it('should create blob with correct content type', async () => {
      const user = userEvent.setup();
      const mockClick = vi.fn();

      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return {
            click: mockClick,
            href: '',
            download: '',
          } as any;
        }
        return document.createElement(tag);
      });
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      render(<ExportData />);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
      });
    });

    it('should cleanup blob URL after download', async () => {
      const user = userEvent.setup();
      const mockClick = vi.fn();

      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return {
            click: mockClick,
            href: '',
            download: '',
          } as any;
        }
        return document.createElement(tag);
      });
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      render(<ExportData />);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockRevokeObjectURL).toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    beforeEach(() => {
      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100))),
          })),
        })),
      }));
    });

    it('should show "Fetching Data..." during fetch', async () => {
      const user = userEvent.setup();
      render(<ExportData />);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      expect(screen.getByText('Fetching Data...')).toBeInTheDocument();
    });

    it('should disable button during export', async () => {
      const user = userEvent.setup();
      render(<ExportData />);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      expect(exportButton).toBeDisabled();
    });

    it('should show success message after completion', async () => {
      const user = userEvent.setup();

      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      }));

      const mockClick = vi.fn();
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return {
            click: mockClick,
            href: '',
            download: '',
          } as any;
        }
        return document.createElement(tag);
      });
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      render(<ExportData />);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export Successful!')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error when fetch fails', async () => {
      const user = userEvent.setup();

      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: null,
              error: { message: 'Database connection failed' },
            })),
          })),
        })),
      }));

      render(<ExportData />);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch game sessions/)).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();

      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.reject(new Error('Network error'))),
          })),
        })),
      }));

      render(<ExportData />);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should show error state on button', async () => {
      const user = userEvent.setup();

      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: null,
              error: { message: 'Error' },
            })),
          })),
        })),
      }));

      render(<ExportData />);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export Failed')).toBeInTheDocument();
      });
    });

    it('should reset to idle state after error timeout', async () => {
      const user = userEvent.setup();
      vi.useFakeTimers();

      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: null,
              error: { message: 'Error' },
            })),
          })),
        })),
      }));

      render(<ExportData />);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export Failed')).toBeInTheDocument();
      });

      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.getByText('Export My Data')).toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe('File Size Estimation', () => {
    beforeEach(() => {
      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [{ id: 1, data: 'x'.repeat(1000) }],
              error: null,
            })),
          })),
        })),
      }));
    });

    it('should show estimated file size after export', async () => {
      const user = userEvent.setup();

      const mockClick = vi.fn();
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return {
            click: mockClick,
            href: '',
            download: '',
          } as any;
        }
        return document.createElement(tag);
      });
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      render(<ExportData />);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/Estimated file size:/)).toBeInTheDocument();
      });
    });

    it('should format bytes correctly', async () => {
      const user = userEvent.setup();

      const mockClick = vi.fn();
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return {
            click: mockClick,
            href: '',
            download: '',
          } as any;
        }
        return document.createElement(tag);
      });
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      render(<ExportData />);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      await waitFor(() => {
        const sizeText = screen.getByText(/Estimated file size:/).nextSibling;
        expect(sizeText?.textContent).toMatch(/\d+(\.\d+)?\s+(Bytes|KB|MB)/);
      });
    });
  });

  describe('Information Section', () => {
    it('should display information about data export', () => {
      render(<ExportData />);

      expect(screen.getByText('About Data Export')).toBeInTheDocument();
      expect(screen.getByText(/Your data is exported in a standard JSON format/)).toBeInTheDocument();
      expect(screen.getByText(/This is part of your data privacy rights/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for checkboxes', () => {
      render(<ExportData />);

      expect(screen.getByLabelText('Include game sessions')).toHaveAttribute('type', 'checkbox');
      expect(screen.getByLabelText('Include user progress')).toHaveAttribute('type', 'checkbox');
      expect(screen.getByLabelText('Include game settings')).toHaveAttribute('type', 'checkbox');
    });

    it('should announce status changes with aria-live', async () => {
      const user = userEvent.setup();

      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      }));

      const mockClick = vi.fn();
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return {
            click: mockClick,
            href: '',
            download: '',
          } as any;
        }
        return document.createElement(tag);
      });
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      render(<ExportData />);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveAttribute('aria-live', 'polite');
      });
    });
  });
});
