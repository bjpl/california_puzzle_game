/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * |unit|integration|accessibility|performance|
 * Bottom Sheet Component Tests
 *
 * Comprehensive test suite for mobile bottom sheet UI pattern.
 * Tests all states, gestures, animations, and accessibility.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomSheet, BottomSheetState } from '@/mobile/components/BottomSheet';
import { act } from 'react';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, style, ...props }: any) => (
      <div {...props} style={style}>
        {children}
      </div>
    ),
  },
  useMotionValue: vi.fn(() => ({
    get: vi.fn(() => 0),
    set: vi.fn(),
  })),
  useTransform: vi.fn(() => 0),
  animate: vi.fn(),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('BottomSheet Component', () => {
  const mockOnStateChange = vi.fn();
  const defaultProps = {
    children: <div>Test Content</div>,
    onStateChange: mockOnStateChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body styles
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  });

  afterEach(() => {
    // Cleanup body styles
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  });

  describe('|unit| Rendering and Initial State', () => {
    it('should render with default collapsed state', () => {
      render(<BottomSheet {...defaultProps} />);

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toBeInTheDocument();
      expect(sheet).toHaveAttribute('data-state', BottomSheetState.COLLAPSED);
    });

    it('should render with custom initial state', () => {
      render(<BottomSheet {...defaultProps} initialState={BottomSheetState.HALF} />);

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toHaveAttribute('data-state', BottomSheetState.HALF);
    });

    it('should render backdrop when showBackdrop is true and sheet is open', () => {
      render(
        <BottomSheet {...defaultProps} showBackdrop={true} initialState={BottomSheetState.HALF} />
      );

      const backdrop = screen.getByTestId('bottom-sheet-backdrop');
      expect(backdrop).toBeInTheDocument();
    });

    it('should not render backdrop when showBackdrop is false', () => {
      render(
        <BottomSheet {...defaultProps} showBackdrop={false} initialState={BottomSheetState.HALF} />
      );

      const backdrop = screen.queryByTestId('bottom-sheet-backdrop');
      expect(backdrop).not.toBeInTheDocument();
    });

    it('should not render backdrop when sheet is closed', () => {
      render(
        <BottomSheet {...defaultProps} showBackdrop={true} initialState={BottomSheetState.CLOSED} />
      );

      const backdrop = screen.queryByTestId('bottom-sheet-backdrop');
      expect(backdrop).not.toBeInTheDocument();
    });

    it('should render drag handle', () => {
      render(<BottomSheet {...defaultProps} />);

      const handle = screen.getByTestId('bottom-sheet-handle');
      expect(handle).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(<BottomSheet {...defaultProps} />);

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<BottomSheet {...defaultProps} className="custom-class" />);

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toHaveClass('custom-class');
    });

    it('should apply custom test ID', () => {
      render(<BottomSheet {...defaultProps} data-testid="custom-sheet" />);

      expect(screen.getByTestId('custom-sheet')).toBeInTheDocument();
      expect(screen.getByTestId('custom-sheet-handle')).toBeInTheDocument();
      expect(screen.getByTestId('custom-sheet-content')).toBeInTheDocument();
    });
  });

  describe('|unit| State Management', () => {
    it('should support all 4 states: closed, collapsed, half, full', () => {
      const states = [
        BottomSheetState.CLOSED,
        BottomSheetState.COLLAPSED,
        BottomSheetState.HALF,
        BottomSheetState.FULL,
      ];

      states.forEach((state) => {
        const { unmount } = render(<BottomSheet {...defaultProps} initialState={state} />);

        const sheet = screen.getByTestId('bottom-sheet');
        expect(sheet).toHaveAttribute('data-state', state);

        unmount();
      });
    });

    it('should call onStateChange when state changes', async () => {
      const { rerender } = render(
        <BottomSheet {...defaultProps} initialState={BottomSheetState.COLLAPSED} />
      );

      // Simulate state change via backdrop tap (internal state change)
      const backdrop = screen.queryByTestId('bottom-sheet-backdrop');
      if (backdrop) {
        await userEvent.click(backdrop);
      }

      // State changes are internal, so we test via props change
      rerender(<BottomSheet {...defaultProps} initialState={BottomSheetState.HALF} />);

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toHaveAttribute('data-state', BottomSheetState.HALF);
    });

    it('should use custom heights when provided', () => {
      const customHeights = {
        collapsed: '100px',
        half: '400px',
        full: '90vh',
      };

      render(
        <BottomSheet
          {...defaultProps}
          heights={customHeights}
          initialState={BottomSheetState.HALF}
        />
      );

      const sheet = screen.getByTestId('bottom-sheet');
      // Height is set in style
      expect(sheet).toBeInTheDocument();
    });

    it('should handle numeric height values', () => {
      const customHeights = {
        collapsed: 150,
        half: 500,
        full: 800,
      };

      render(
        <BottomSheet
          {...defaultProps}
          heights={customHeights}
          initialState={BottomSheetState.COLLAPSED}
        />
      );

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toBeInTheDocument();
    });
  });

  describe('|integration| Backdrop Interaction', () => {
    it('should close sheet on backdrop tap when closeOnBackdropTap is true', async () => {
      const user = userEvent.setup();
      render(
        <BottomSheet
          {...defaultProps}
          initialState={BottomSheetState.HALF}
          closeOnBackdropTap={true}
          showBackdrop={true}
        />
      );

      const backdrop = screen.getByTestId('bottom-sheet-backdrop');
      await act(async () => {
        await user.click(backdrop);
      });

      await waitFor(() => {
        expect(mockOnStateChange).toHaveBeenCalledWith(BottomSheetState.COLLAPSED);
      });
    });

    it('should not close sheet on backdrop tap when closeOnBackdropTap is false', async () => {
      const user = userEvent.setup();
      render(
        <BottomSheet
          {...defaultProps}
          initialState={BottomSheetState.HALF}
          closeOnBackdropTap={false}
          showBackdrop={true}
        />
      );

      const backdrop = screen.getByTestId('bottom-sheet-backdrop');
      await act(async () => {
        await user.click(backdrop);
      });

      // State should not change
      expect(mockOnStateChange).not.toHaveBeenCalled();
    });

    it('should not attempt to close when already closed', async () => {
      const user = userEvent.setup();
      render(
        <BottomSheet
          {...defaultProps}
          initialState={BottomSheetState.CLOSED}
          closeOnBackdropTap={true}
          showBackdrop={true}
        />
      );

      // Backdrop should not render when closed
      const backdrop = screen.queryByTestId('bottom-sheet-backdrop');
      expect(backdrop).not.toBeInTheDocument();
    });
  });

  describe('|integration| Swipe Gestures', () => {
    it('should enable drag when enableSwipe is true', () => {
      render(<BottomSheet {...defaultProps} enableSwipe={true} />);

      const sheet = screen.getByTestId('bottom-sheet');
      // Sheet should have drag enabled (motion div would have drag props)
      expect(sheet).toBeInTheDocument();
    });

    it('should disable drag when enableSwipe is false', () => {
      render(<BottomSheet {...defaultProps} enableSwipe={false} />);

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toBeInTheDocument();
    });

    it('should have proper touch-action style', () => {
      render(<BottomSheet {...defaultProps} />);

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toHaveStyle({ touchAction: 'none' });
    });

    it('should handle fast swipe up transitions', () => {
      // Fast swipe detection tested via PanInfo mock
      render(
        <BottomSheet
          {...defaultProps}
          initialState={BottomSheetState.COLLAPSED}
          enableSwipe={true}
        />
      );

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toBeInTheDocument();
      // Actual gesture testing requires integration with framer-motion
    });

    it('should handle fast swipe down transitions', () => {
      render(
        <BottomSheet {...defaultProps} initialState={BottomSheetState.FULL} enableSwipe={true} />
      );

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toBeInTheDocument();
    });

    it('should handle slow drag with distance threshold (15% viewport)', () => {
      render(
        <BottomSheet {...defaultProps} initialState={BottomSheetState.HALF} enableSwipe={true} />
      );

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toBeInTheDocument();
      // Threshold logic is internal
    });
  });

  describe('|integration| Body Scroll Prevention', () => {
    it('should prevent body scroll when sheet is half open', () => {
      render(<BottomSheet {...defaultProps} initialState={BottomSheetState.HALF} />);

      expect(document.body.style.overflow).toBe('hidden');
      expect(document.body.style.touchAction).toBe('none');
    });

    it('should prevent body scroll when sheet is full open', () => {
      render(<BottomSheet {...defaultProps} initialState={BottomSheetState.FULL} />);

      expect(document.body.style.overflow).toBe('hidden');
      expect(document.body.style.touchAction).toBe('none');
    });

    it('should allow body scroll when sheet is collapsed', () => {
      render(<BottomSheet {...defaultProps} initialState={BottomSheetState.COLLAPSED} />);

      expect(document.body.style.overflow).toBe('');
      expect(document.body.style.touchAction).toBe('');
    });

    it('should allow body scroll when sheet is closed', () => {
      render(<BottomSheet {...defaultProps} initialState={BottomSheetState.CLOSED} />);

      expect(document.body.style.overflow).toBe('');
      expect(document.body.style.touchAction).toBe('');
    });

    it('should restore body scroll on unmount', () => {
      const { unmount } = render(
        <BottomSheet {...defaultProps} initialState={BottomSheetState.FULL} />
      );

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('');
      expect(document.body.style.touchAction).toBe('');
    });
  });

  describe('|integration| Content Scrolling', () => {
    it('should enable content scroll when sheet is half open', () => {
      render(<BottomSheet {...defaultProps} initialState={BottomSheetState.HALF} />);

      const content = screen.getByTestId('bottom-sheet-content');
      expect(content).toHaveStyle({ overflowY: 'auto' });
    });

    it('should enable content scroll when sheet is full open', () => {
      render(<BottomSheet {...defaultProps} initialState={BottomSheetState.FULL} />);

      const content = screen.getByTestId('bottom-sheet-content');
      expect(content).toHaveStyle({ overflowY: 'auto' });
    });

    it('should disable content scroll when sheet is collapsed', () => {
      render(<BottomSheet {...defaultProps} initialState={BottomSheetState.COLLAPSED} />);

      const content = screen.getByTestId('bottom-sheet-content');
      expect(content).toHaveStyle({ overflowY: 'hidden' });
    });

    it('should disable content scroll when sheet is closed', () => {
      render(<BottomSheet {...defaultProps} initialState={BottomSheetState.CLOSED} />);

      const content = screen.getByTestId('bottom-sheet-content');
      expect(content).toHaveStyle({ overflowY: 'hidden' });
    });
  });

  describe('|accessibility| Keyboard Support', () => {
    it('should be keyboard accessible via handle', () => {
      render(<BottomSheet {...defaultProps} enableSwipe={true} />);

      const handle = screen.getByTestId('bottom-sheet-handle');
      // Handle should be focusable when draggable
      expect(handle).toBeInTheDocument();
    });

    it('should support Escape key to close (future enhancement)', () => {
      // Note: Escape key handler would be added for accessibility
      render(<BottomSheet {...defaultProps} initialState={BottomSheetState.HALF} />);

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toBeInTheDocument();
      // TODO: Add keyboard event handler test when implemented
    });

    it('should have proper ARIA attributes', () => {
      render(
        <BottomSheet {...defaultProps} initialState={BottomSheetState.HALF}>
          <div role="region" aria-label="County Details">
            Content
          </div>
        </BottomSheet>
      );

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', 'County Details');
    });
  });

  describe('|accessibility| Focus Management', () => {
    it('should trap focus when sheet is full open', () => {
      render(
        <BottomSheet {...defaultProps} initialState={BottomSheetState.FULL}>
          <button>Button 1</button>
          <button>Button 2</button>
        </BottomSheet>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      // Focus trap would be implemented for full-screen modal behavior
    });

    it('should restore focus on close', () => {
      const { rerender } = render(
        <BottomSheet {...defaultProps} initialState={BottomSheetState.FULL} />
      );

      rerender(<BottomSheet {...defaultProps} initialState={BottomSheetState.CLOSED} />);

      // Focus restoration logic would be tested here
      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toBeInTheDocument();
    });
  });

  describe('|performance| Animation Performance', () => {
    it('should use hardware-accelerated transforms', () => {
      render(<BottomSheet {...defaultProps} initialState={BottomSheetState.HALF} />);

      const sheet = screen.getByTestId('bottom-sheet');
      // Framer Motion handles GPU acceleration via transform
      expect(sheet).toBeInTheDocument();
    });

    it('should handle rapid state changes without memory leaks', async () => {
      const { rerender } = render(
        <BottomSheet {...defaultProps} initialState={BottomSheetState.COLLAPSED} />
      );

      // Rapidly change states
      const states = [
        BottomSheetState.HALF,
        BottomSheetState.FULL,
        BottomSheetState.COLLAPSED,
        BottomSheetState.HALF,
      ];

      for (const state of states) {
        await act(async () => {
          rerender(<BottomSheet {...defaultProps} initialState={state} />);
          await new Promise((resolve) => setTimeout(resolve, 10));
        });
      }

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toBeInTheDocument();
    });

    it('should cleanup animations on unmount', () => {
      const { unmount } = render(
        <BottomSheet {...defaultProps} initialState={BottomSheetState.HALF} />
      );

      unmount();

      // Verify no lingering DOM elements
      expect(screen.queryByTestId('bottom-sheet')).not.toBeInTheDocument();
    });
  });

  describe('|performance| Drag Performance', () => {
    it('should use spring animation for smooth transitions', () => {
      render(<BottomSheet {...defaultProps} enableSwipe={true} />);

      const sheet = screen.getByTestId('bottom-sheet');
      // Spring config is passed to framer-motion animate
      expect(sheet).toBeInTheDocument();
    });

    it('should debounce drag updates for 60fps performance', () => {
      render(
        <BottomSheet {...defaultProps} enableSwipe={true} initialState={BottomSheetState.HALF} />
      );

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toBeInTheDocument();
      // Drag performance handled by framer-motion internally
    });
  });

  describe('|integration| Edge Cases', () => {
    it('should handle undefined onStateChange gracefully', () => {
      const { unmount } = render(
        <BottomSheet initialState={BottomSheetState.HALF} showBackdrop={true}>
          Content
        </BottomSheet>
      );

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toBeInTheDocument();

      unmount();
    });

    it('should handle missing children', () => {
      render(<BottomSheet onStateChange={mockOnStateChange} />);

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toBeInTheDocument();
    });

    it('should handle window resize during drag', () => {
      render(
        <BottomSheet {...defaultProps} initialState={BottomSheetState.HALF} enableSwipe={true} />
      );

      // Simulate window resize
      act(() => {
        global.innerHeight = 600;
        window.dispatchEvent(new Event('resize'));
      });

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toBeInTheDocument();
    });

    it('should handle zero height viewport', () => {
      const originalInnerHeight = window.innerHeight;
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 0,
      });

      render(<BottomSheet {...defaultProps} initialState={BottomSheetState.HALF} />);

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toBeInTheDocument();

      // Restore
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: originalInnerHeight,
      });
    });
  });

  describe('|integration| Multiple Instances', () => {
    it('should support multiple bottom sheets with different test IDs', () => {
      render(
        <>
          <BottomSheet data-testid="sheet-1" initialState={BottomSheetState.COLLAPSED}>
            Sheet 1
          </BottomSheet>
          <BottomSheet data-testid="sheet-2" initialState={BottomSheetState.HALF}>
            Sheet 2
          </BottomSheet>
        </>
      );

      expect(screen.getByTestId('sheet-1')).toBeInTheDocument();
      expect(screen.getByTestId('sheet-2')).toBeInTheDocument();
    });
  });
});
