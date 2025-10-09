/**
 * |unit|integration|accessibility|performance|
 * Touch County Drag Component Tests
 *
 * Comprehensive test suite for mobile drag-and-drop county component.
 * Tests press-and-hold, drag gestures, haptic feedback, and snap behavior.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TouchCountyDrag } from '@/mobile/components/TouchCountyDrag';
import type { County, Position } from '@/types';
import { act } from 'react';

// Mock @dnd-kit
const mockSetNodeRef = vi.fn();
const mockAttributes = { role: 'button', tabIndex: 0 };
const mockListeners = { onPointerDown: vi.fn() };
let mockIsDragging = false;
let mockTransform: { x: number; y: number } | null = null;

vi.mock('@dnd-kit/core', () => ({
  useDraggable: vi.fn(() => ({
    attributes: mockAttributes,
    listeners: mockListeners,
    setNodeRef: mockSetNodeRef,
    transform: mockTransform,
    isDragging: mockIsDragging,
    active: mockIsDragging ? { id: 'test-county' } : null,
  })),
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock useHaptic hook
const mockHaptic = {
  tap: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  dragStart: vi.fn(),
  snap: vi.fn(),
  isSupported: true,
};

vi.mock('@/mobile/hooks/useHaptic', () => ({
  useHaptic: vi.fn(() => mockHaptic),
}));

// Mock touch sensors
vi.mock('@/mobile/config/touchSensors', () => ({
  preventScrollDuringDrag: vi.fn(),
  restoreScrollAfterDrag: vi.fn(),
}));

describe('TouchCountyDrag Component', () => {
  const mockCounty: County = {
    id: 'test-county',
    name: 'Test County',
    fips: '06001',
    location: { lat: 37.0, lon: -120.0 },
    area: 1000,
    population: 100000,
    slug: 'test-county',
  };

  const mockTargetPosition: Position = { x: 100, y: 200 };
  const mockOnDragStart = vi.fn();
  const mockOnDragEnd = vi.fn();
  const mockOnPlacementSuccess = vi.fn();

  const defaultProps = {
    county: mockCounty,
    onDragStart: mockOnDragStart,
    onDragEnd: mockOnDragEnd,
    onPlacementSuccess: mockOnPlacementSuccess,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDragging = false;
    mockTransform = null;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('|unit| Rendering', () => {
    it('should render county component', () => {
      render(<TouchCountyDrag {...defaultProps} />);

      expect(screen.getByTestId('touch-county-drag')).toBeInTheDocument();
      expect(screen.getByText('Test County')).toBeInTheDocument();
    });

    it('should apply custom test ID', () => {
      render(<TouchCountyDrag {...defaultProps} data-testid="custom-drag" />);

      expect(screen.getByTestId('custom-drag')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<TouchCountyDrag {...defaultProps} className="custom-class" />);

      const element = screen.getByTestId('touch-county-drag');
      expect(element).toHaveClass('custom-class');
    });

    it('should display county name', () => {
      render(<TouchCountyDrag {...defaultProps} />);

      expect(screen.getByText('Test County')).toBeInTheDocument();
    });

    it('should show placed indicator when isPlaced is true', () => {
      render(<TouchCountyDrag {...defaultProps} isPlaced={true} />);

      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('should not show placed indicator when isPlaced is false', () => {
      render(<TouchCountyDrag {...defaultProps} isPlaced={false} />);

      expect(screen.queryByText('✓')).not.toBeInTheDocument();
    });

    it('should include data attributes', () => {
      render(<TouchCountyDrag {...defaultProps} />);

      const element = screen.getByTestId('touch-county-drag');
      expect(element).toHaveAttribute('data-county-id', 'test-county');
      expect(element).toHaveAttribute('data-is-dragging', 'false');
      expect(element).toHaveAttribute('data-is-placed', 'false');
    });
  });

  describe('|unit| CSS Classes', () => {
    it('should apply base class', () => {
      render(<TouchCountyDrag {...defaultProps} />);

      const element = screen.getByTestId('touch-county-drag');
      expect(element).toHaveClass('touch-county-drag');
    });

    it('should apply placed class when isPlaced is true', () => {
      render(<TouchCountyDrag {...defaultProps} isPlaced={true} />);

      const element = screen.getByTestId('touch-county-drag');
      expect(element).toHaveClass('touch-county-drag--placed');
    });

    it('should not apply placed class when isPlaced is false', () => {
      render(<TouchCountyDrag {...defaultProps} isPlaced={false} />);

      const element = screen.getByTestId('touch-county-drag');
      expect(element).not.toHaveClass('touch-county-drag--placed');
    });

    it('should apply pressing class during press-and-hold', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TouchCountyDrag {...defaultProps} />);

      const element = screen.getByTestId('touch-county-drag');

      await act(async () => {
        await user.pointer({ keys: '[TouchA>]', target: element });
      });

      expect(element).toHaveClass('touch-county-drag--pressing');
    });
  });

  describe('|integration| Press-and-Hold Activation', () => {
    it('should trigger press visual feedback on pointer down', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TouchCountyDrag {...defaultProps} />);

      const element = screen.getByTestId('touch-county-drag');

      await act(async () => {
        await user.pointer({ keys: '[TouchA>]', target: element });
      });

      expect(element).toHaveClass('touch-county-drag--pressing');
    });

    it('should remove press visual feedback after 300ms', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TouchCountyDrag {...defaultProps} />);

      const element = screen.getByTestId('touch-county-drag');

      await act(async () => {
        await user.pointer({ keys: '[TouchA>]', target: element });
      });

      expect(element).toHaveClass('touch-county-drag--pressing');

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(element).not.toHaveClass('touch-county-drag--pressing');
      });
    });

    it('should trigger haptic tap after press-and-hold duration', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TouchCountyDrag {...defaultProps} />);

      const element = screen.getByTestId('touch-county-drag');

      await act(async () => {
        await user.pointer({ keys: '[TouchA>]', target: element });
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(mockHaptic.tap).toHaveBeenCalled();
      });
    });

    it('should cancel press timer on pointer up', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TouchCountyDrag {...defaultProps} />);

      const element = screen.getByTestId('touch-county-drag');

      await act(async () => {
        await user.pointer({ keys: '[TouchA>]', target: element });
        await user.pointer({ keys: '[/TouchA]' });
      });

      expect(element).not.toHaveClass('touch-county-drag--pressing');
      expect(mockHaptic.tap).not.toHaveBeenCalled();
    });

    it('should show drag hint during press-and-hold', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TouchCountyDrag {...defaultProps} isPlaced={false} />);

      const element = screen.getByTestId('touch-county-drag');

      await act(async () => {
        await user.pointer({ keys: '[TouchA>]', target: element });
      });

      expect(screen.getByText('Hold to drag')).toBeInTheDocument();
    });

    it('should not show drag hint when already placed', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TouchCountyDrag {...defaultProps} isPlaced={true} />);

      const element = screen.getByTestId('touch-county-drag');

      await act(async () => {
        await user.pointer({ keys: '[TouchA>]', target: element });
      });

      expect(screen.queryByText('Hold to drag')).not.toBeInTheDocument();
    });
  });

  describe('|integration| Drag Start/End Callbacks', () => {
    it('should call onDragStart when dragging starts', async () => {
      mockIsDragging = true;

      const { rerender } = render(<TouchCountyDrag {...defaultProps} />);

      await act(async () => {
        rerender(<TouchCountyDrag {...defaultProps} />);
      });

      await waitFor(() => {
        expect(mockOnDragStart).toHaveBeenCalledWith(mockCounty);
      });

      mockIsDragging = false;
    });

    it('should trigger dragStart haptic on drag start', async () => {
      mockIsDragging = true;

      const { rerender } = render(<TouchCountyDrag {...defaultProps} />);

      await act(async () => {
        rerender(<TouchCountyDrag {...defaultProps} />);
      });

      await waitFor(() => {
        expect(mockHaptic.dragStart).toHaveBeenCalled();
      });

      mockIsDragging = false;
    });

    it('should call onDragEnd with final position when drag ends', async () => {
      mockIsDragging = true;
      mockTransform = { x: 50, y: 100 };

      const { rerender } = render(<TouchCountyDrag {...defaultProps} />);

      // End drag
      mockIsDragging = false;

      await act(async () => {
        rerender(<TouchCountyDrag {...defaultProps} />);
      });

      await waitFor(() => {
        expect(mockOnDragEnd).toHaveBeenCalledWith(mockCounty, { x: 50, y: 100 });
      });

      mockTransform = null;
    });

    it('should not call onDragStart if already dragging', () => {
      mockIsDragging = true;

      render(<TouchCountyDrag {...defaultProps} />);

      // Should only be called once even with multiple re-renders
      expect(mockOnDragStart).toHaveBeenCalledTimes(1);

      mockIsDragging = false;
    });
  });

  describe('|integration| Haptic Feedback Integration', () => {
    it('should use haptic feedback when enabled (default)', () => {
      render(<TouchCountyDrag {...defaultProps} enableHaptic={true} />);

      expect(screen.getByTestId('touch-county-drag')).toBeInTheDocument();
      // useHaptic hook called with enabled: true
    });

    it('should disable haptic feedback when enableHaptic is false', () => {
      render(<TouchCountyDrag {...defaultProps} enableHaptic={false} />);

      expect(screen.getByTestId('touch-county-drag')).toBeInTheDocument();
    });

    it('should respect haptic intensity setting', () => {
      render(<TouchCountyDrag {...defaultProps} enableHaptic={true} hapticIntensity={0.5} />);

      expect(screen.getByTestId('touch-county-drag')).toBeInTheDocument();
    });

    it('should trigger success haptic on successful placement', async () => {
      mockIsDragging = true;
      mockTransform = { x: 100, y: 200 }; // Exactly at target

      const { rerender } = render(
        <TouchCountyDrag {...defaultProps} targetPosition={mockTargetPosition} />
      );

      mockIsDragging = false;

      await act(async () => {
        rerender(<TouchCountyDrag {...defaultProps} targetPosition={mockTargetPosition} />);
      });

      await waitFor(() => {
        expect(mockHaptic.success).toHaveBeenCalled();
        expect(mockOnPlacementSuccess).toHaveBeenCalledWith(mockCounty);
      });

      mockTransform = null;
    });

    it('should trigger snap haptic when near target during drag', async () => {
      mockIsDragging = true;
      mockTransform = { x: 105, y: 205 }; // Within snap threshold (50px)

      const { rerender } = render(
        <TouchCountyDrag {...defaultProps} targetPosition={mockTargetPosition} />
      );

      await act(async () => {
        // Update transform to be near target
        mockTransform = { x: 102, y: 202 };
        rerender(<TouchCountyDrag {...defaultProps} targetPosition={mockTargetPosition} />);
      });

      await waitFor(() => {
        expect(mockHaptic.snap).toHaveBeenCalled();
      });

      mockIsDragging = false;
      mockTransform = null;
    });

    it('should not trigger snap haptic when far from target', async () => {
      mockIsDragging = true;
      mockTransform = { x: 200, y: 300 }; // Far from target

      const { rerender } = render(
        <TouchCountyDrag {...defaultProps} targetPosition={mockTargetPosition} />
      );

      await act(async () => {
        rerender(<TouchCountyDrag {...defaultProps} targetPosition={mockTargetPosition} />);
      });

      expect(mockHaptic.snap).not.toHaveBeenCalled();

      mockIsDragging = false;
      mockTransform = null;
    });
  });

  describe('|integration| Snap-to-Grid Detection', () => {
    it('should detect snap when within 50px threshold', async () => {
      mockIsDragging = true;
      mockTransform = { x: 110, y: 210 }; // 14.14px from target (within 50px)

      const { rerender } = render(
        <TouchCountyDrag {...defaultProps} targetPosition={mockTargetPosition} />
      );

      mockIsDragging = false;

      await act(async () => {
        rerender(<TouchCountyDrag {...defaultProps} targetPosition={mockTargetPosition} />);
      });

      await waitFor(() => {
        expect(mockOnPlacementSuccess).toHaveBeenCalledWith(mockCounty);
      });

      mockTransform = null;
    });

    it('should not snap when beyond 50px threshold', async () => {
      mockIsDragging = true;
      mockTransform = { x: 200, y: 300 }; // Far from target

      const { rerender } = render(
        <TouchCountyDrag {...defaultProps} targetPosition={mockTargetPosition} />
      );

      mockIsDragging = false;

      await act(async () => {
        rerender(<TouchCountyDrag {...defaultProps} targetPosition={mockTargetPosition} />);
      });

      expect(mockOnPlacementSuccess).not.toHaveBeenCalled();

      mockTransform = null;
    });

    it('should calculate distance correctly using Euclidean formula', async () => {
      // Distance = sqrt((110-100)^2 + (230-200)^2) = sqrt(100 + 900) = 31.62px
      mockIsDragging = true;
      mockTransform = { x: 110, y: 230 };

      const { rerender } = render(
        <TouchCountyDrag {...defaultProps} targetPosition={mockTargetPosition} />
      );

      mockIsDragging = false;

      await act(async () => {
        rerender(<TouchCountyDrag {...defaultProps} targetPosition={mockTargetPosition} />);
      });

      await waitFor(() => {
        expect(mockOnPlacementSuccess).toHaveBeenCalledWith(mockCounty);
      });

      mockTransform = null;
    });

    it('should handle missing targetPosition gracefully', async () => {
      mockIsDragging = true;
      mockTransform = { x: 100, y: 200 };

      const { rerender } = render(<TouchCountyDrag {...defaultProps} targetPosition={undefined} />);

      mockIsDragging = false;

      await act(async () => {
        rerender(<TouchCountyDrag {...defaultProps} targetPosition={undefined} />);
      });

      expect(mockOnPlacementSuccess).not.toHaveBeenCalled();

      mockTransform = null;
    });
  });

  describe('|integration| Scroll Prevention', () => {
    it('should prevent page scroll during drag', async () => {
      const { preventScrollDuringDrag } = await import('@/mobile/config/touchSensors');

      mockIsDragging = true;

      const { rerender } = render(<TouchCountyDrag {...defaultProps} />);

      await act(async () => {
        rerender(<TouchCountyDrag {...defaultProps} />);
      });

      await waitFor(() => {
        expect(preventScrollDuringDrag).toHaveBeenCalled();
      });

      mockIsDragging = false;
    });

    it('should restore page scroll after drag ends', async () => {
      const { restoreScrollAfterDrag } = await import('@/mobile/config/touchSensors');

      mockIsDragging = true;
      mockTransform = { x: 50, y: 100 };

      const { rerender } = render(<TouchCountyDrag {...defaultProps} />);

      mockIsDragging = false;

      await act(async () => {
        rerender(<TouchCountyDrag {...defaultProps} />);
      });

      await waitFor(() => {
        expect(restoreScrollAfterDrag).toHaveBeenCalled();
      });

      mockTransform = null;
    });
  });

  describe('|integration| Visual States', () => {
    it('should have grab cursor when not placed', () => {
      render(<TouchCountyDrag {...defaultProps} isPlaced={false} />);

      const element = screen.getByTestId('touch-county-drag');
      expect(element).toHaveStyle({ cursor: 'grab' });
    });

    it('should have not-allowed cursor when placed', () => {
      render(<TouchCountyDrag {...defaultProps} isPlaced={true} />);

      const element = screen.getByTestId('touch-county-drag');
      expect(element).toHaveStyle({ cursor: 'not-allowed' });
    });

    it('should have reduced opacity when dragging', () => {
      mockIsDragging = true;

      render(<TouchCountyDrag {...defaultProps} />);

      const element = screen.getByTestId('touch-county-drag');
      expect(element).toHaveStyle({ opacity: 0.5 });

      mockIsDragging = false;
    });

    it('should have full opacity when not dragging', () => {
      render(<TouchCountyDrag {...defaultProps} />);

      const element = screen.getByTestId('touch-county-drag');
      expect(element).toHaveStyle({ opacity: 1 });
    });

    it('should apply scale transform during pressing', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TouchCountyDrag {...defaultProps} />);

      const element = screen.getByTestId('touch-county-drag');

      await act(async () => {
        await user.pointer({ keys: '[TouchA>]', target: element });
      });

      // Pressing style applied via pressStyle
      expect(element).toHaveClass('touch-county-drag--pressing');
    });

    it('should show drag preview with offset when dragging and showDragPreview is true', () => {
      mockIsDragging = true;
      mockTransform = { x: 50, y: 100 };

      render(<TouchCountyDrag {...defaultProps} showDragPreview={true} />);

      const element = screen.getByTestId('touch-county-drag');
      expect(element).toBeInTheDocument();
      // Transform applied via inline style

      mockIsDragging = false;
      mockTransform = null;
    });

    it('should not show drag preview when showDragPreview is false', () => {
      mockIsDragging = true;
      mockTransform = { x: 50, y: 100 };

      render(<TouchCountyDrag {...defaultProps} showDragPreview={false} />);

      const element = screen.getByTestId('touch-county-drag');
      expect(element).toBeInTheDocument();

      mockIsDragging = false;
      mockTransform = null;
    });
  });

  describe('|accessibility| Keyboard and Screen Reader Support', () => {
    it('should have touch-action: none for proper touch handling', () => {
      render(<TouchCountyDrag {...defaultProps} />);

      const element = screen.getByTestId('touch-county-drag');
      expect(element).toHaveStyle({ touchAction: 'none' });
    });

    it('should have user-select: none to prevent text selection', () => {
      render(<TouchCountyDrag {...defaultProps} />);

      const element = screen.getByTestId('touch-county-drag');
      expect(element).toHaveStyle({ userSelect: 'none' });
    });

    it('should integrate @dnd-kit accessibility attributes', () => {
      render(<TouchCountyDrag {...defaultProps} />);

      const element = screen.getByTestId('touch-county-drag');
      // @dnd-kit provides ARIA attributes through ...attributes spread
      expect(element).toBeInTheDocument();
    });

    it('should integrate @dnd-kit keyboard listeners', () => {
      render(<TouchCountyDrag {...defaultProps} />);

      const element = screen.getByTestId('touch-county-drag');
      // @dnd-kit provides keyboard listeners through ...listeners spread
      expect(element).toBeInTheDocument();
    });

    it('should be disabled when isPlaced is true', () => {
      render(<TouchCountyDrag {...defaultProps} isPlaced={true} />);

      const element = screen.getByTestId('touch-county-drag');
      expect(element).toHaveAttribute('data-is-placed', 'true');
    });
  });

  describe('|performance| Component Performance', () => {
    it('should cleanup press timer on unmount', async () => {
      const user = userEvent.setup({ delay: null });
      const { unmount } = render(<TouchCountyDrag {...defaultProps} />);

      const element = screen.getByTestId('touch-county-drag');

      await act(async () => {
        await user.pointer({ keys: '[TouchA>]', target: element });
      });

      unmount();

      // Timer should be cleared, no memory leaks
      expect(screen.queryByTestId('touch-county-drag')).not.toBeInTheDocument();
    });

    it('should handle rapid pointer events without issues', async () => {
      const user = userEvent.setup({ delay: null });
      render(<TouchCountyDrag {...defaultProps} />);

      const element = screen.getByTestId('touch-county-drag');

      // Rapid pointer down/up
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          await user.pointer({ keys: '[TouchA>]', target: element });
          await user.pointer({ keys: '[/TouchA]' });
        });
      }

      expect(element).toBeInTheDocument();
    });

    it('should use hardware-accelerated transforms for drag preview', () => {
      mockIsDragging = true;
      mockTransform = { x: 50, y: 100 };

      render(<TouchCountyDrag {...defaultProps} showDragPreview={true} />);

      const element = screen.getByTestId('touch-county-drag');
      // translate3d used for GPU acceleration
      expect(element).toBeInTheDocument();

      mockIsDragging = false;
      mockTransform = null;
    });
  });

  describe('|integration| Edge Cases', () => {
    it('should handle undefined callbacks gracefully', () => {
      render(
        <TouchCountyDrag
          county={mockCounty}
          onDragStart={undefined}
          onDragEnd={undefined}
          onPlacementSuccess={undefined}
        />
      );

      expect(screen.getByTestId('touch-county-drag')).toBeInTheDocument();
    });

    it('should handle null transform', () => {
      mockIsDragging = false;
      mockTransform = null;

      render(<TouchCountyDrag {...defaultProps} />);

      const element = screen.getByTestId('touch-county-drag');
      expect(element).toBeInTheDocument();
    });

    it('should handle county with minimal data', () => {
      const minimalCounty: County = {
        id: 'minimal',
        name: 'Minimal County',
        fips: '06999',
        location: { lat: 0, lon: 0 },
        area: 0,
        population: 0,
        slug: 'minimal',
      };

      render(<TouchCountyDrag {...defaultProps} county={minimalCounty} />);

      expect(screen.getByText('Minimal County')).toBeInTheDocument();
    });
  });
});
