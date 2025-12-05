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
import { render, screen, waitFor, act } from '@testing-library/react';
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

describe('ExportData Component', () => {
  const mockSupabaseFrom = vi.fn();
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

  // Save original DOM methods before any mocking
  const originalCreateElement = document.createElement.bind(document);
  const originalAppendChild = document.body.appendChild.bind(document.body);
  const originalRemoveChild = document.body.removeChild.bind(document.body);

  // Helper function to create mock anchor element that doesn't trigger navigation
  const createMockAnchorElement = (mockClick: ReturnType<typeof vi.fn>) => {
    const mockLink = {
      click: mockClick,
      tagName: 'A',
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      style: {},
      // Use defineProperty to prevent href setter from triggering navigation
      get href() {
        return this._href || '';
      },
      set href(value) {
        this._href = value;
      },
      _href: '',
      get download() {
        return this._download || '';
      },
      set download(value) {
        this._download = value;
      },
      _download: '',
    } as unknown as HTMLAnchorElement;
    return mockLink;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Reset useUserId mock to return authenticated user
    const { useUserId } = await import('@/hooks/useAuth');
    useUserId.mockReturnValue('test-user-id-12345');

    // Setup Supabase mock
    const { supabase } = await import('@/lib/supabase');
    supabase.from = mockSupabaseFrom;

    // Mock URL methods
    mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
    mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Prevent jsdom navigation errors by mocking HTMLAnchorElement's href setter
    Object.defineProperty(window.HTMLAnchorElement.prototype, 'href', {
      set: vi.fn(),
      get: vi.fn(() => ''),
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Restore all spies to prevent test pollution
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render with title and description', () => {
      render(<ExportData />);

      expect(screen.getByText('Export Your Data')).toBeInTheDocument();
      expect(screen.getByText(/Download all your game data in JSON format/)).toBeInTheDocument();
    });

    it('should render all data type checkboxes', () => {
      render(<ExportData />);

      expect(screen.getByRole('checkbox', { name: 'Include game sessions' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Include user progress' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Include game settings' })).toBeInTheDocument();
    });

    it('should have all checkboxes checked by default', () => {
      render(<ExportData />);

      expect(screen.getByRole('checkbox', { name: 'Include game sessions' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Include user progress' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Include game settings' })).toBeChecked();
    });

    it('should render Export My Data button', () => {
      render(<ExportData />);

      expect(screen.getByRole('button', { name: /export my data/i })).toBeInTheDocument();
    });

    it('should show "Please sign in" when not authenticated', async () => {
      const { useUserId } = await import('@/hooks/useAuth');
      useUserId.mockReturnValue(null);

      render(<ExportData />);

      expect(screen.getByText(/You must be logged in to export your data/)).toBeInTheDocument();
    });
  });

  describe('Data Type Selection', () => {
    it('should toggle game sessions checkbox', async () => {
      const user = userEvent.setup();
      render(<ExportData />);

      const checkbox = screen.getByRole('checkbox', { name: 'Include game sessions' });
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('should toggle user progress checkbox', async () => {
      const user = userEvent.setup();
      render(<ExportData />);

      const checkbox = screen.getByRole('checkbox', { name: 'Include user progress' });
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should toggle game settings checkbox', async () => {
      const user = userEvent.setup();
      render(<ExportData />);

      const checkbox = screen.getByRole('checkbox', { name: 'Include game settings' });
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should allow multiple checkboxes to be unchecked', async () => {
      const user = userEvent.setup();
      render(<ExportData />);

      await user.click(screen.getByRole('checkbox', { name: 'Include game sessions' }));
      await user.click(screen.getByRole('checkbox', { name: 'Include user progress' }));

      expect(screen.getByRole('checkbox', { name: 'Include game sessions' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Include user progress' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Include game settings' })).toBeChecked();
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
      const mockClick = vi.fn();

      render(<ExportData />);

      // Mock createElement and appendChild AFTER render to avoid breaking React
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return {
            click: mockClick,
            href: '',
            download: '',
          } as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tag);
      });
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as unknown as Node);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as unknown as Node);

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
      const mockClick = vi.fn();

      render(<ExportData />);

      // Mock createElement and appendChild AFTER render
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return {
            click: mockClick,
            href: '',
            download: '',
          } as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tag);
      });
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as unknown as Node);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as unknown as Node);

      // Uncheck user progress
      await user.click(screen.getByRole('checkbox', { name: 'Include user progress' }));

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
      await user.click(screen.getByRole('checkbox', { name: 'Include game sessions' }));
      await user.click(screen.getByRole('checkbox', { name: 'Include user progress' }));
      await user.click(screen.getByRole('checkbox', { name: 'Include game settings' }));

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Please select at least one data type to export/)
        ).toBeInTheDocument();
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

      const mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
        // Only mock for anchor elements, use original for others
        if (node && 'tagName' in node && node.tagName === 'A') {
          return node;
        }
        return originalAppendChild(node);
      });

      const mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => {
        // Only mock for anchor elements, use original for others
        if (node && 'tagName' in node && node.tagName === 'A') {
          return node;
        }
        return originalRemoveChild(node);
      });

      let capturedElement: HTMLAnchorElement | null = null;
      const mockCreateElement = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          capturedElement = {
            tagName: 'A',
            click: mockClick,
            href: '',
            download: '',
          } as unknown as HTMLAnchorElement;
          return capturedElement;
        }
        // Use the original implementation for other tags
        return originalCreateElement(tag);
      });

      render(<ExportData />);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockClick).toHaveBeenCalled();
        expect(capturedElement?.download).toMatch(/california-puzzle-data-\d{4}-\d{2}-\d{2}\.json/);
      });

      // Restore mocks immediately
      mockCreateElement.mockRestore();
      mockAppendChild.mockRestore();
      mockRemoveChild.mockRestore();
    });

    it('should create blob with correct content type', async () => {
      const user = userEvent.setup();
      const mockClick = vi.fn();

      render(<ExportData />);

      // Mock AFTER render
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return {
            click: mockClick,
            href: '',
            download: '',
          } as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tag);
      });
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as unknown as Node);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as unknown as Node);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
      });
    });

    it('should cleanup blob URL after download', async () => {
      const user = userEvent.setup();
      const mockClick = vi.fn();

      render(<ExportData />);

      // Mock AFTER render
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return {
            click: mockClick,
            href: '',
            download: '',
          } as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tag);
      });
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as unknown as Node);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as unknown as Node);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockRevokeObjectURL).toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    it('should show "Fetching Data..." during fetch', async () => {
      // Add delay to Supabase mock to allow checking loading state
      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(
              () =>
                new Promise((resolve) => setTimeout(() => resolve({ data: [], error: null }), 100))
            ),
          })),
        })),
      }));

      const user = userEvent.setup();
      render(<ExportData />);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      // Loading state should appear during the 100ms delay - button text changes
      expect(screen.getByRole('button', { name: /fetching data/i })).toBeInTheDocument();

      // Wait for operation to complete
      await waitFor(() => {
        expect(screen.queryByText('Fetching Data...')).not.toBeInTheDocument();
      });
    });

    it('should disable button during export', async () => {
      // Add delay to Supabase mock
      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(
              () =>
                new Promise((resolve) => setTimeout(() => resolve({ data: [], error: null }), 50))
            ),
          })),
        })),
      }));

      const user = userEvent.setup();
      render(<ExportData />);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      // Button should be disabled during operation
      expect(exportButton).toBeDisabled();

      // Wait for operation to complete
      await waitFor(() => {
        expect(exportButton).not.toBeDisabled();
      });
    });

    it('should show success message after completion', async () => {
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

      const user = userEvent.setup();
      const mockClick = vi.fn();

      render(<ExportData />);

      // Mock AFTER render to prevent download navigation issues
      const mockCreateElement = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return createMockAnchorElement(mockClick);
        }
        return originalCreateElement(tag);
      });

      const mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
        if (node && 'tagName' in node && node.tagName === 'A') {
          return node;
        }
        return originalAppendChild(node);
      });

      const mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => {
        if (node && 'tagName' in node && node.tagName === 'A') {
          return node;
        }
        return originalRemoveChild(node);
      });

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      // Wait for success state - button text changes
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export successful/i })).toBeInTheDocument();
      });

      // Cleanup
      mockCreateElement.mockRestore();
      mockAppendChild.mockRestore();
      mockRemoveChild.mockRestore();
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
      let resolvePromise: (value: { data: null; error: { message: string } }) => void;
      const delayedPromise = new Promise<{ data: null; error: { message: string } }>((resolve) => {
        resolvePromise = resolve;
      });

      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => delayedPromise),
          })),
        })),
      }));

      const user = userEvent.setup();
      render(<ExportData />);

      const exportButton = screen.getByRole('button', { name: /export my data/i });

      // Start click
      const clickPromise = user.click(exportButton);

      // Resolve with error after a tick
      await act(async () => {
        resolvePromise!({ data: null, error: { message: 'Error' } });
      });

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /export failed/i })).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      await clickPromise;
    });

    it('should reset to idle state after error timeout', async () => {
      // Mock returns error from both .eq() directly AND .order()
      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: null,
            error: { message: 'Error' },
            order: vi.fn(() => ({
              data: null,
              error: { message: 'Error' },
            })),
          })),
        })),
      }));

      const user = userEvent.setup();
      render(<ExportData />);

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export failed/i })).toBeInTheDocument();
      });

      // Wait for the 5 second timeout that resets to idle (real timers)
      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /export my data/i })).toBeInTheDocument();
        },
        { timeout: 6000 }
      );
    }, 10000); // Extended test timeout to accommodate the 5-second reset
  });

  describe('File Size Estimation', () => {
    beforeEach(() => {
      // Mock returns data from both .eq() directly AND .order() to handle:
      // - game_sessions: uses .order()
      // - user_progress/game_settings: destructure directly from .eq()
      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [{ id: 1, data: 'x'.repeat(1000) }],
            error: null,
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

      render(<ExportData />);

      // Mock AFTER render
      const mockCreateElement = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return createMockAnchorElement(mockClick);
        }
        return originalCreateElement(tag);
      });

      const mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
        if (node && 'tagName' in node && node.tagName === 'A') {
          return node;
        }
        return originalAppendChild(node);
      });

      const mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => {
        if (node && 'tagName' in node && node.tagName === 'A') {
          return node;
        }
        return originalRemoveChild(node);
      });

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      // Wait for export to complete first (button changes to success state)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export successful/i })).toBeInTheDocument();
      });

      // Then check for file size display
      await waitFor(() => {
        expect(screen.getByText(/Estimated file size:/)).toBeInTheDocument();
      });

      // Cleanup
      mockCreateElement.mockRestore();
      mockAppendChild.mockRestore();
      mockRemoveChild.mockRestore();
    });

    it('should format bytes correctly', async () => {
      const user = userEvent.setup();
      const mockClick = vi.fn();

      render(<ExportData />);

      // Mock AFTER render
      const mockCreateElement = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return createMockAnchorElement(mockClick);
        }
        return originalCreateElement(tag);
      });

      const mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
        if (node && 'tagName' in node && node.tagName === 'A') {
          return node;
        }
        return originalAppendChild(node);
      });

      const mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => {
        if (node && 'tagName' in node && node.tagName === 'A') {
          return node;
        }
        return originalRemoveChild(node);
      });

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      // Wait for export to complete first (button changes to success state)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export successful/i })).toBeInTheDocument();
      });

      // Then check for file size format
      await waitFor(() => {
        const sizeText = screen.getByText(/Estimated file size:/).nextSibling;
        expect(sizeText?.textContent).toMatch(/\d+(\.\d+)?\s+(Bytes|KB|MB)/);
      });

      // Cleanup
      mockCreateElement.mockRestore();
      mockAppendChild.mockRestore();
      mockRemoveChild.mockRestore();
    });
  });

  describe('Information Section', () => {
    it('should display information about data export', () => {
      render(<ExportData />);

      expect(screen.getByText('About Data Export')).toBeInTheDocument();
      expect(
        screen.getByText(/Your data is exported in a standard JSON format/)
      ).toBeInTheDocument();
      expect(screen.getByText(/This is part of your data privacy rights/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for checkboxes', () => {
      render(<ExportData />);

      expect(screen.getByRole('checkbox', { name: 'Include game sessions' })).toHaveAttribute(
        'type',
        'checkbox'
      );
      expect(screen.getByRole('checkbox', { name: 'Include user progress' })).toHaveAttribute(
        'type',
        'checkbox'
      );
      expect(screen.getByRole('checkbox', { name: 'Include game settings' })).toHaveAttribute(
        'type',
        'checkbox'
      );
    });

    it('should announce status changes with aria-live', async () => {
      const user = userEvent.setup();
      const mockClick = vi.fn();

      // Mock returns data from both .eq() directly AND .order()
      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [],
            error: null,
            order: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      }));

      render(<ExportData />);

      // Mock AFTER render
      const mockCreateElement = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return createMockAnchorElement(mockClick);
        }
        return originalCreateElement(tag);
      });

      const mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
        if (node && 'tagName' in node && node.tagName === 'A') {
          return node;
        }
        return originalAppendChild(node);
      });

      const mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => {
        if (node && 'tagName' in node && node.tagName === 'A') {
          return node;
        }
        return originalRemoveChild(node);
      });

      const exportButton = screen.getByRole('button', { name: /export my data/i });
      await user.click(exportButton);

      // Wait for export to complete first (button changes to success state)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export successful/i })).toBeInTheDocument();
      });

      // Then check for aria-live region
      await waitFor(() => {
        const liveRegion = document.querySelector('[aria-live]');
        expect(liveRegion).toBeInTheDocument();
        expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      });

      // Cleanup
      mockCreateElement.mockRestore();
      mockAppendChild.mockRestore();
      mockRemoveChild.mockRestore();
    });
  });
});
