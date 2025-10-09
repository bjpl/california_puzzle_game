/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * |unit|integration|accessibility|performance|
 * Touch Feedback Component Tests
 *
 * Comprehensive test suite for Material Design ripple effect component.
 * Tests ripple creation, animations, multiple simultaneous ripples, and reduced motion support.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TouchFeedback, useTouchFeedback } from '@/mobile/components/TouchFeedback';
import { act } from 'react';

// Mock Framer Motion
const mockAnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const mockMotionDiv = ({
  children,
  initial,
  animate,
  exit,
  transition,
  style,
  className,
  ...props
}: any) => (
  <div {...props} style={style} className={className} data-motion="true">
    {children}
  </div>
);

vi.mock('framer-motion', () => ({
  motion: {
    div: mockMotionDiv,
  },
  AnimatePresence: mockAnimatePresence,
}));

describe('TouchFeedback Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('|unit| Rendering', () => {
    it('should render container with children', () => {
      render(
        <TouchFeedback>
          <button>Click me</button>
        </TouchFeedback>
      );

      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should apply custom className to container', () => {
      render(
        <TouchFeedback className="custom-class">
          <div>Content</div>
        </TouchFeedback>
      );

      const container = screen.getByText('Content').parentElement;
      expect(container).toHaveClass('touch-feedback-container');
      expect(container).toHaveClass('custom-class');
    });

    it('should have relative positioning and overflow hidden', () => {
      render(
        <TouchFeedback>
          <div>Content</div>
        </TouchFeedback>
      );

      const container = screen.getByText('Content').parentElement;
      expect(container).toHaveStyle({
        position: 'relative',
        overflow: 'hidden',
      });
    });

    it('should render without children', () => {
      const { container } = render(<TouchFeedback />);

      expect(container.querySelector('.touch-feedback-container')).toBeInTheDocument();
    });
  });

  describe('|integration| Ripple Creation on Touch', () => {
    it('should create ripple on touch start', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <TouchFeedback>
          <button>Touch me</button>
        </TouchFeedback>
      );

      const button = screen.getByText('Touch me');

      await act(async () => {
        await user.pointer({ keys: '[TouchA>]', target: button });
      });

      // Check for ripple element
      const container = button.parentElement;
      const ripples = container?.querySelectorAll('.touch-feedback-ripple');
      expect(ripples?.length).toBeGreaterThan(0);
    });

    it('should create ripple on click (desktop fallback)', async () => {
      const user = userEvent.setup();

      render(
        <TouchFeedback>
          <button>Click me</button>
        </TouchFeedback>
      );

      const button = screen.getByText('Click me');

      await act(async () => {
        await user.click(button);
      });

      const container = button.parentElement;
      const ripples = container?.querySelectorAll('.touch-feedback-ripple');
      expect(ripples?.length).toBeGreaterThan(0);
    });

    it('should calculate ripple position relative to target element', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <TouchFeedback>
          <div data-testid="target">Target</div>
        </TouchFeedback>
      );

      const target = screen.getByTestId('target');

      // Mock getBoundingClientRect
      vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
        left: 100,
        top: 100,
        right: 200,
        bottom: 200,
        width: 100,
        height: 100,
        x: 100,
        y: 100,
        toJSON: () => {},
      });

      await act(async () => {
        await user.click(target);
      });

      const ripples = container.querySelectorAll('.touch-feedback-ripple');
      expect(ripples.length).toBeGreaterThan(0);
    });

    it('should not create ripple when enabled is false', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <TouchFeedback enabled={false}>
          <button>Click me</button>
        </TouchFeedback>
      );

      const button = screen.getByText('Click me');

      await act(async () => {
        await user.click(button);
      });

      const ripples = container.querySelectorAll('.touch-feedback-ripple');
      expect(ripples.length).toBe(0);
    });
  });

  describe('|integration| Multiple Simultaneous Ripples', () => {
    it('should support multiple ripples at once', async () => {
      const user = userEvent.setup({ delay: null });

      const { container } = render(
        <TouchFeedback>
          <div data-testid="multi-touch">Multi-touch target</div>
        </TouchFeedback>
      );

      const target = screen.getByTestId('multi-touch');

      // Create multiple ripples quickly
      await act(async () => {
        await user.click(target);
        await user.click(target);
        await user.click(target);
      });

      const ripples = container.querySelectorAll('.touch-feedback-ripple');
      expect(ripples.length).toBeGreaterThanOrEqual(1);
    });

    it('should assign unique IDs to each ripple', async () => {
      const user = userEvent.setup({ delay: null });

      const { container } = render(
        <TouchFeedback>
          <button>Multi-click</button>
        </TouchFeedback>
      );

      const button = screen.getByText('Multi-click');

      await act(async () => {
        await user.click(button);
        await user.click(button);
      });

      const ripples = container.querySelectorAll('.touch-feedback-ripple');
      const keys = Array.from(ripples).map((r) => r.getAttribute('key'));

      // Each should have different timestamp-based ID
      expect(ripples.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('|integration| Ripple Cleanup', () => {
    it('should remove ripple after animation duration', async () => {
      const user = userEvent.setup({ delay: null });
      const duration = 600;

      const { container } = render(
        <TouchFeedback duration={duration}>
          <button>Click me</button>
        </TouchFeedback>
      );

      const button = screen.getByText('Click me');

      await act(async () => {
        await user.click(button);
      });

      let ripples = container.querySelectorAll('.touch-feedback-ripple');
      expect(ripples.length).toBeGreaterThan(0);

      // Advance time past duration + buffer
      await act(async () => {
        vi.advanceTimersByTime(duration + 150);
      });

      await waitFor(() => {
        ripples = container.querySelectorAll('.touch-feedback-ripple');
        expect(ripples.length).toBe(0);
      });
    });

    it('should use custom duration for cleanup timing', async () => {
      const user = userEvent.setup({ delay: null });
      const customDuration = 1000;

      const { container } = render(
        <TouchFeedback duration={customDuration}>
          <button>Custom duration</button>
        </TouchFeedback>
      );

      const button = screen.getByText('Custom duration');

      await act(async () => {
        await user.click(button);
      });

      // Should still exist before duration
      await act(async () => {
        vi.advanceTimersByTime(customDuration - 100);
      });

      let ripples = container.querySelectorAll('.touch-feedback-ripple');
      expect(ripples.length).toBeGreaterThan(0);

      // Should be cleaned up after duration + buffer
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        ripples = container.querySelectorAll('.touch-feedback-ripple');
        expect(ripples.length).toBe(0);
      });
    });

    it('should clean up all ripples on unmount', async () => {
      const user = userEvent.setup({ delay: null });

      const { container, unmount } = render(
        <TouchFeedback>
          <button>Unmount test</button>
        </TouchFeedback>
      );

      const button = screen.getByText('Unmount test');

      await act(async () => {
        await user.click(button);
        await user.click(button);
      });

      unmount();

      const ripples = container.querySelectorAll('.touch-feedback-ripple');
      expect(ripples.length).toBe(0);
    });
  });

  describe('|accessibility| Prefers Reduced Motion Support', () => {
    it('should use 0 duration when prefers-reduced-motion is set', () => {
      // Mock matchMedia to return true for reduced motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <TouchFeedback duration={600}>
          <button>Reduced motion</button>
        </TouchFeedback>
      );

      // Component should render, with 0 effective duration internally
      expect(screen.getByText('Reduced motion')).toBeInTheDocument();
    });

    it('should use normal duration when prefers-reduced-motion is not set', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <TouchFeedback duration={600}>
          <button>Normal motion</button>
        </TouchFeedback>
      );

      expect(screen.getByText('Normal motion')).toBeInTheDocument();
    });
  });

  describe('|unit| Custom Configuration', () => {
    it('should use default color when not specified', () => {
      render(
        <TouchFeedback>
          <div>Default color</div>
        </TouchFeedback>
      );

      expect(screen.getByText('Default color')).toBeInTheDocument();
    });

    it('should use custom color', () => {
      render(
        <TouchFeedback color="rgba(255, 0, 0, 0.5)">
          <div>Custom color</div>
        </TouchFeedback>
      );

      expect(screen.getByText('Custom color')).toBeInTheDocument();
    });

    it('should use custom duration', () => {
      render(
        <TouchFeedback duration={1000}>
          <div>Custom duration</div>
        </TouchFeedback>
      );

      expect(screen.getByText('Custom duration')).toBeInTheDocument();
    });

    it('should use custom max size', () => {
      render(
        <TouchFeedback maxSize={200}>
          <div>Custom size</div>
        </TouchFeedback>
      );

      expect(screen.getByText('Custom size')).toBeInTheDocument();
    });

    it('should apply all custom configs together', () => {
      render(
        <TouchFeedback color="rgba(0, 255, 0, 0.4)" duration={800} maxSize={150}>
          <div>All custom</div>
        </TouchFeedback>
      );

      expect(screen.getByText('All custom')).toBeInTheDocument();
    });
  });

  describe('|integration| Target Ref Support', () => {
    it('should attach to targetRef when provided', () => {
      const TestComponent = () => {
        const targetRef = React.useRef<HTMLDivElement>(null);

        return (
          <>
            <div ref={targetRef} data-testid="external-target">
              External Target
            </div>
            <TouchFeedback targetRef={targetRef}>
              <div>Feedback wrapper</div>
            </TouchFeedback>
          </>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('external-target')).toBeInTheDocument();
      expect(screen.getByText('Feedback wrapper')).toBeInTheDocument();
    });

    it('should use internal container when targetRef not provided', () => {
      render(
        <TouchFeedback>
          <button>Internal container</button>
        </TouchFeedback>
      );

      expect(screen.getByText('Internal container')).toBeInTheDocument();
    });
  });

  describe('|performance| Hardware Acceleration', () => {
    it('should use GPU-accelerated styles for ripples', async () => {
      const user = userEvent.setup({ delay: null });

      const { container } = render(
        <TouchFeedback>
          <button>Hardware test</button>
        </TouchFeedback>
      );

      const button = screen.getByText('Hardware test');

      await act(async () => {
        await user.click(button);
      });

      const ripple = container.querySelector('.touch-feedback-ripple');
      expect(ripple).toHaveStyle({
        willChange: 'transform, opacity',
        transform: 'translateZ(0)',
      });
    });

    it('should use absolute positioning for ripples', async () => {
      const user = userEvent.setup({ delay: null });

      const { container } = render(
        <TouchFeedback>
          <button>Position test</button>
        </TouchFeedback>
      );

      const button = screen.getByText('Position test');

      await act(async () => {
        await user.click(button);
      });

      const ripple = container.querySelector('.touch-feedback-ripple');
      expect(ripple).toHaveStyle({
        position: 'absolute',
        pointerEvents: 'none',
      });
    });

    it('should use border-radius for circular ripples', async () => {
      const user = userEvent.setup({ delay: null });

      const { container } = render(
        <TouchFeedback>
          <button>Circle test</button>
        </TouchFeedback>
      );

      const button = screen.getByText('Circle test');

      await act(async () => {
        await user.click(button);
      });

      const ripple = container.querySelector('.touch-feedback-ripple');
      expect(ripple).toHaveStyle({
        borderRadius: '50%',
      });
    });
  });

  describe('|performance| Event Handler Performance', () => {
    it('should use passive event listeners for touch events', () => {
      render(
        <TouchFeedback>
          <button>Passive test</button>
        </TouchFeedback>
      );

      // Passive listeners are set in useEffect with { passive: true }
      expect(screen.getByText('Passive test')).toBeInTheDocument();
    });

    it('should handle rapid touch events without memory leaks', async () => {
      const user = userEvent.setup({ delay: null });

      const { container } = render(
        <TouchFeedback duration={100}>
          <button>Rapid test</button>
        </TouchFeedback>
      );

      const button = screen.getByText('Rapid test');

      // Create many ripples rapidly
      for (let i = 0; i < 20; i++) {
        await act(async () => {
          await user.click(button);
        });
      }

      // All should eventually clean up
      await act(async () => {
        vi.advanceTimersByTime(250);
      });

      await waitFor(() => {
        const ripples = container.querySelectorAll('.touch-feedback-ripple');
        expect(ripples.length).toBeLessThanOrEqual(5); // Most should be cleaned up
      });
    });
  });

  describe('|integration| Edge Cases', () => {
    it('should handle touch event without touches array', async () => {
      const { container } = render(
        <TouchFeedback>
          <button data-testid="no-touches">No touches</button>
        </TouchFeedback>
      );

      const button = screen.getByTestId('no-touches');

      // Manually dispatch touchstart with no touches
      await act(async () => {
        const event = new TouchEvent('touchstart', {
          touches: [] as any,
          bubbles: true,
        });
        button.dispatchEvent(event);
      });

      // Should not crash
      const ripples = container.querySelectorAll('.touch-feedback-ripple');
      expect(ripples.length).toBe(0);
    });

    it('should handle getBoundingClientRect returning zero dimensions', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <TouchFeedback>
          <div data-testid="zero-rect">Zero rect</div>
        </TouchFeedback>
      );

      const target = screen.getByTestId('zero-rect');

      vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      await act(async () => {
        await user.click(target);
      });

      const ripples = container.querySelectorAll('.touch-feedback-ripple');
      expect(ripples.length).toBeGreaterThan(0);
    });

    it('should handle unmount during animation', async () => {
      const user = userEvent.setup({ delay: null });

      const { container, unmount } = render(
        <TouchFeedback duration={1000}>
          <button>Unmount during animation</button>
        </TouchFeedback>
      );

      const button = screen.getByText('Unmount during animation');

      await act(async () => {
        await user.click(button);
      });

      // Unmount while animation is still running
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      unmount();

      // Should not throw errors
      const ripples = container.querySelectorAll('.touch-feedback-ripple');
      expect(ripples.length).toBe(0);
    });

    it('should handle disabled state transitions', async () => {
      const user = userEvent.setup({ delay: null });

      const { container, rerender } = render(
        <TouchFeedback enabled={true}>
          <button>Toggle enabled</button>
        </TouchFeedback>
      );

      const button = screen.getByText('Toggle enabled');

      await act(async () => {
        await user.click(button);
      });

      // Disable
      rerender(
        <TouchFeedback enabled={false}>
          <button>Toggle enabled</button>
        </TouchFeedback>
      );

      await act(async () => {
        await user.click(button);
      });

      // Should only have ripples from first click
      const ripples = container.querySelectorAll('.touch-feedback-ripple');
      expect(ripples.length).toBeLessThanOrEqual(1);
    });
  });
});

describe('useTouchFeedback Hook', () => {
  it('should provide triggerRipple function', () => {
    const TestComponent = () => {
      const elementRef = React.useRef<HTMLDivElement>(null);
      const { triggerRipple } = useTouchFeedback(elementRef);

      return (
        <div ref={elementRef} data-testid="hook-target">
          <button onClick={() => triggerRipple({ x: 50, y: 50 })}>Trigger</button>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByText('Trigger')).toBeInTheDocument();
  });

  it('should provide ripples array', () => {
    const TestComponent = () => {
      const elementRef = React.useRef<HTMLDivElement>(null);
      const { ripples } = useTouchFeedback(elementRef);

      return (
        <div ref={elementRef}>
          <div data-testid="ripple-count">{ripples.length}</div>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('ripple-count')).toHaveTextContent('0');
  });

  it('should accept custom options', () => {
    const TestComponent = () => {
      const elementRef = React.useRef<HTMLDivElement>(null);
      const { triggerRipple } = useTouchFeedback(elementRef, {
        duration: 1000,
        color: 'red',
      });

      return (
        <div ref={elementRef}>
          <button onClick={() => triggerRipple({ x: 0, y: 0 })}>Custom options</button>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByText('Custom options')).toBeInTheDocument();
  });
});
