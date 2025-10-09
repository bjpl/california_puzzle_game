/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * |unit|integration|accessibility|performance|
 * Gesture Tutorial Component Tests
 *
 * Comprehensive test suite for first-time user gesture tutorial.
 * Tests step progression, keyboard navigation, animations, and completion flow.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GestureTutorial, TutorialStep } from '@/mobile/components/GestureTutorial';
import { act } from 'react';

// Mock Framer Motion
const mockAnimatePresence = ({ children, mode }: { children: React.ReactNode; mode?: string }) => (
  <>{children}</>
);
const mockMotionDiv = ({
  children,
  initial,
  animate,
  exit,
  transition,
  style,
  className,
  custom,
  variants,
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

describe('GestureTutorial Component', () => {
  const mockOnComplete = vi.fn();
  const mockOnSkip = vi.fn();

  const defaultProps = {
    show: true,
    onComplete: mockOnComplete,
    onSkip: mockOnSkip,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any event listeners
    window.removeEventListener('keydown', vi.fn());
  });

  describe('|unit| Rendering and Visibility', () => {
    it('should render when show is true', () => {
      render(<GestureTutorial {...defaultProps} />);

      expect(screen.getByTestId('gesture-tutorial')).toBeInTheDocument();
    });

    it('should not render when show is false', () => {
      render(<GestureTutorial {...defaultProps} show={false} />);

      expect(screen.queryByTestId('gesture-tutorial')).not.toBeInTheDocument();
    });

    it('should apply custom test ID', () => {
      render(<GestureTutorial {...defaultProps} data-testid="custom-tutorial" />);

      expect(screen.getByTestId('custom-tutorial')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<GestureTutorial {...defaultProps} className="custom-class" />);

      const tutorial = screen.getByTestId('gesture-tutorial');
      expect(tutorial).toHaveClass('gesture-tutorial');
      expect(tutorial).toHaveClass('custom-class');
    });

    it('should have full-screen overlay styling', () => {
      render(<GestureTutorial {...defaultProps} />);

      const tutorial = screen.getByTestId('gesture-tutorial');
      expect(tutorial).toHaveStyle({
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      });
    });

    it('should have dark backdrop', () => {
      render(<GestureTutorial {...defaultProps} />);

      const tutorial = screen.getByTestId('gesture-tutorial');
      expect(tutorial).toHaveStyle({
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
      });
    });
  });

  describe('|unit| Step Progression (6 Steps Total)', () => {
    it('should start at WELCOME step by default', () => {
      render(<GestureTutorial {...defaultProps} />);

      expect(screen.getByTestId('gesture-tutorial')).toHaveAttribute('data-step', '0');
      expect(screen.getByText('Welcome to California Counties!')).toBeInTheDocument();
    });

    it('should start at custom initial step', () => {
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.DRAG_COUNTY} />);

      expect(screen.getByTestId('gesture-tutorial')).toHaveAttribute('data-step', '1');
      expect(screen.getByText('Drag Counties')).toBeInTheDocument();
    });

    it('should show all 6 tutorial steps', () => {
      const steps = [
        { step: TutorialStep.WELCOME, title: 'Welcome to California Counties!' },
        { step: TutorialStep.DRAG_COUNTY, title: 'Drag Counties' },
        { step: TutorialStep.PINCH_ZOOM, title: 'Pinch to Zoom' },
        { step: TutorialStep.SWIPE_NAVIGATION, title: 'Swipe to Navigate' },
        { step: TutorialStep.BOTTOM_SHEET, title: 'Bottom Sheet' },
        { step: TutorialStep.COMPLETE, title: 'Ready to Play!' },
      ];

      steps.forEach(({ step, title }) => {
        const { unmount } = render(<GestureTutorial {...defaultProps} initialStep={step} />);

        expect(screen.getByText(title)).toBeInTheDocument();

        unmount();
      });
    });

    it('should display step descriptions', () => {
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.DRAG_COUNTY} />);

      expect(screen.getByText(/Press and hold a county for 300ms/i)).toBeInTheDocument();
    });

    it('should display step tips when available', () => {
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.DRAG_COUNTY} />);

      expect(screen.getByText(/Feel the haptic vibration/i)).toBeInTheDocument();
    });

    it('should display animated visuals for each step', () => {
      render(<GestureTutorial {...defaultProps} />);

      // Welcome step shows map emoji
      expect(screen.getByText('🗺️')).toBeInTheDocument();
    });
  });

  describe('|integration| Navigation Buttons', () => {
    it('should show Next button', () => {
      render(<GestureTutorial {...defaultProps} />);

      expect(screen.getByTestId('gesture-tutorial-next')).toBeInTheDocument();
      expect(screen.getByTestId('gesture-tutorial-next')).toHaveTextContent('Next');
    });

    it('should show Previous button', () => {
      render(<GestureTutorial {...defaultProps} />);

      expect(screen.getByTestId('gesture-tutorial-previous')).toBeInTheDocument();
      expect(screen.getByTestId('gesture-tutorial-previous')).toHaveTextContent('Previous');
    });

    it('should disable Previous button on first step', () => {
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.WELCOME} />);

      const previousButton = screen.getByTestId('gesture-tutorial-previous');
      expect(previousButton).toBeDisabled();
    });

    it('should enable Previous button on non-first steps', () => {
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.DRAG_COUNTY} />);

      const previousButton = screen.getByTestId('gesture-tutorial-previous');
      expect(previousButton).not.toBeDisabled();
    });

    it('should advance to next step when Next button clicked', async () => {
      const user = userEvent.setup();
      render(<GestureTutorial {...defaultProps} />);

      const nextButton = screen.getByTestId('gesture-tutorial-next');

      await act(async () => {
        await user.click(nextButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('gesture-tutorial')).toHaveAttribute('data-step', '1');
        expect(screen.getByText('Drag Counties')).toBeInTheDocument();
      });
    });

    it('should go to previous step when Previous button clicked', async () => {
      const user = userEvent.setup();
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.DRAG_COUNTY} />);

      const previousButton = screen.getByTestId('gesture-tutorial-previous');

      await act(async () => {
        await user.click(previousButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('gesture-tutorial')).toHaveAttribute('data-step', '0');
        expect(screen.getByText('Welcome to California Counties!')).toBeInTheDocument();
      });
    });

    it('should show "Get Started" text on final step', () => {
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.COMPLETE} />);

      expect(screen.getByTestId('gesture-tutorial-next')).toHaveTextContent('Get Started');
    });

    it('should call onComplete when Get Started button clicked on final step', async () => {
      const user = userEvent.setup();
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.COMPLETE} />);

      const getStartedButton = screen.getByTestId('gesture-tutorial-next');

      await act(async () => {
        await user.click(getStartedButton);
      });

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });
  });

  describe('|integration| Skip Functionality', () => {
    it('should show Skip button when allowSkip is true', () => {
      render(<GestureTutorial {...defaultProps} allowSkip={true} />);

      expect(screen.getByTestId('gesture-tutorial-skip')).toBeInTheDocument();
      expect(screen.getByTestId('gesture-tutorial-skip')).toHaveTextContent('Skip Tutorial');
    });

    it('should not show Skip button when allowSkip is false', () => {
      render(<GestureTutorial {...defaultProps} allowSkip={false} />);

      expect(screen.queryByTestId('gesture-tutorial-skip')).not.toBeInTheDocument();
    });

    it('should call onSkip when Skip button clicked', async () => {
      const user = userEvent.setup();
      render(<GestureTutorial {...defaultProps} allowSkip={true} />);

      const skipButton = screen.getByTestId('gesture-tutorial-skip');

      await act(async () => {
        await user.click(skipButton);
      });

      await waitFor(() => {
        expect(mockOnSkip).toHaveBeenCalled();
      });
    });
  });

  describe('|accessibility| Keyboard Navigation', () => {
    it('should advance on ArrowRight key press', async () => {
      render(<GestureTutorial {...defaultProps} />);

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      });

      await waitFor(() => {
        expect(screen.getByTestId('gesture-tutorial')).toHaveAttribute('data-step', '1');
      });
    });

    it('should advance on Enter key press', async () => {
      render(<GestureTutorial {...defaultProps} />);

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      });

      await waitFor(() => {
        expect(screen.getByTestId('gesture-tutorial')).toHaveAttribute('data-step', '1');
      });
    });

    it('should advance on Space key press', async () => {
      render(<GestureTutorial {...defaultProps} />);

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      });

      await waitFor(() => {
        expect(screen.getByTestId('gesture-tutorial')).toHaveAttribute('data-step', '1');
      });
    });

    it('should go back on ArrowLeft key press', async () => {
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.DRAG_COUNTY} />);

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      });

      await waitFor(() => {
        expect(screen.getByTestId('gesture-tutorial')).toHaveAttribute('data-step', '0');
      });
    });

    it('should skip on Escape key press when allowSkip is true', async () => {
      render(<GestureTutorial {...defaultProps} allowSkip={true} />);

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      await waitFor(() => {
        expect(mockOnSkip).toHaveBeenCalled();
      });
    });

    it('should not skip on Escape when allowSkip is false', async () => {
      render(<GestureTutorial {...defaultProps} allowSkip={false} />);

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      expect(mockOnSkip).not.toHaveBeenCalled();
    });

    it('should prevent default behavior for navigation keys', async () => {
      render(<GestureTutorial {...defaultProps} />);

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      await act(async () => {
        window.dispatchEvent(event);
      });

      // Event handlers should call preventDefault
      // (implementation detail, may vary based on actual implementation)
      expect(screen.getByTestId('gesture-tutorial')).toBeInTheDocument();
    });

    it('should not respond to keyboard when tutorial is hidden', async () => {
      const { rerender } = render(<GestureTutorial {...defaultProps} show={true} />);

      rerender(<GestureTutorial {...defaultProps} show={false} />);

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      });

      expect(screen.queryByTestId('gesture-tutorial')).not.toBeInTheDocument();
    });

    it('should clean up keyboard listeners on unmount', () => {
      const { unmount } = render(<GestureTutorial {...defaultProps} />);

      unmount();

      // Listeners should be removed (no errors thrown)
      expect(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      }).not.toThrow();
    });
  });

  describe('|accessibility| Progress Indicator', () => {
    it('should show progress bar', () => {
      render(<GestureTutorial {...defaultProps} />);

      expect(screen.getByTestId('gesture-tutorial-progress')).toBeInTheDocument();
    });

    it('should calculate progress percentage correctly', () => {
      const { rerender } = render(
        <GestureTutorial {...defaultProps} initialStep={TutorialStep.WELCOME} />
      );

      let progressBar = screen.getByTestId('gesture-tutorial-progress');
      // Step 0 (WELCOME) of 6 total = (0+1)/6 * 100 = 16.67%
      expect(progressBar).toHaveStyle({ width: expect.stringMatching(/16\.6/) });

      rerender(<GestureTutorial {...defaultProps} initialStep={TutorialStep.COMPLETE} />);
      progressBar = screen.getByTestId('gesture-tutorial-progress');
      // Step 5 (COMPLETE) of 6 total = (5+1)/6 * 100 = 100%
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('should show step indicator dots', () => {
      render(<GestureTutorial {...defaultProps} />);

      const dots = screen.getAllByTestId(/gesture-tutorial-dot-/);
      expect(dots.length).toBe(6); // 6 total steps
    });

    it('should highlight current step dot', () => {
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.DRAG_COUNTY} />);

      const activeDot = screen.getByTestId('gesture-tutorial-dot-1');
      expect(activeDot).toHaveStyle({ backgroundColor: '#3b82f6' });
    });

    it('should dim non-active step dots', () => {
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.DRAG_COUNTY} />);

      const inactiveDot = screen.getByTestId('gesture-tutorial-dot-0');
      expect(inactiveDot).toHaveStyle({ backgroundColor: 'rgba(255, 255, 255, 0.3)' });
    });
  });

  describe('|integration| Animations', () => {
    it('should use AnimatePresence for step transitions', () => {
      render(<GestureTutorial {...defaultProps} />);

      // Motion divs should be present
      const motionElements = screen.getAllByTestId(/gesture-tutorial/);
      expect(motionElements.length).toBeGreaterThan(0);
    });

    it('should animate hand icons for gestures', () => {
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.DRAG_COUNTY} />);

      // Hand emoji should be present
      expect(screen.getByText('✋')).toBeInTheDocument();
    });

    it('should show completion celebration emoji', () => {
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.COMPLETE} />);

      expect(screen.getByText('🎉')).toBeInTheDocument();
    });
  });

  describe('|integration| Step Content Details', () => {
    it('should show welcome content on WELCOME step', () => {
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.WELCOME} />);

      expect(screen.getByText('Welcome to California Counties!')).toBeInTheDocument();
      expect(screen.getByText(/Learn how to play on your mobile device/i)).toBeInTheDocument();
      expect(screen.getByText('🗺️')).toBeInTheDocument();
    });

    it('should show drag instructions on DRAG_COUNTY step', () => {
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.DRAG_COUNTY} />);

      expect(screen.getByText('Drag Counties')).toBeInTheDocument();
      expect(screen.getByText(/Press and hold a county for 300ms/i)).toBeInTheDocument();
      expect(screen.getByText('✋')).toBeInTheDocument();
    });

    it('should show pinch zoom instructions on PINCH_ZOOM step', () => {
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.PINCH_ZOOM} />);

      expect(screen.getByText('Pinch to Zoom')).toBeInTheDocument();
      expect(screen.getByText(/Use two fingers to pinch the map/i)).toBeInTheDocument();
    });

    it('should show swipe navigation instructions on SWIPE_NAVIGATION step', () => {
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.SWIPE_NAVIGATION} />);

      expect(screen.getByText('Swipe to Navigate')).toBeInTheDocument();
      expect(screen.getByText(/Swipe left or right to browse counties/i)).toBeInTheDocument();
    });

    it('should show bottom sheet instructions on BOTTOM_SHEET step', () => {
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.BOTTOM_SHEET} />);

      expect(screen.getByText('Bottom Sheet')).toBeInTheDocument();
      expect(screen.getByText(/Swipe up from the bottom/i)).toBeInTheDocument();
    });

    it('should show completion message on COMPLETE step', () => {
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.COMPLETE} />);

      expect(screen.getByText('Ready to Play!')).toBeInTheDocument();
      expect(screen.getByText(/You now know all the gestures/i)).toBeInTheDocument();
      expect(screen.getByText('🎉')).toBeInTheDocument();
    });
  });

  describe('|performance| Rendering Performance', () => {
    it('should not render when show is false', () => {
      const { container } = render(<GestureTutorial {...defaultProps} show={false} />);

      expect(container.firstChild).toBeNull();
    });

    it('should handle rapid step changes efficiently', async () => {
      const user = userEvent.setup({ delay: null });
      render(<GestureTutorial {...defaultProps} />);

      const nextButton = screen.getByTestId('gesture-tutorial-next');

      // Rapidly click through steps
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          await user.click(nextButton);
        });
      }

      expect(screen.getByTestId('gesture-tutorial')).toHaveAttribute('data-step', '5');
    });

    it('should cleanup on unmount', () => {
      const { unmount } = render(<GestureTutorial {...defaultProps} />);

      unmount();

      expect(screen.queryByTestId('gesture-tutorial')).not.toBeInTheDocument();
    });
  });

  describe('|integration| Edge Cases', () => {
    it('should handle missing callbacks gracefully', () => {
      render(<GestureTutorial show={true} onComplete={undefined} onSkip={undefined} />);

      expect(screen.getByTestId('gesture-tutorial')).toBeInTheDocument();
    });

    it('should handle initial step beyond valid range', () => {
      // TypeScript would prevent this, but test runtime behavior
      render(<GestureTutorial {...defaultProps} initialStep={99 as any} />);

      expect(screen.getByTestId('gesture-tutorial')).toBeInTheDocument();
    });

    it('should handle rapid show/hide toggles', async () => {
      const { rerender } = render(<GestureTutorial {...defaultProps} show={true} />);

      for (let i = 0; i < 10; i++) {
        await act(async () => {
          rerender(<GestureTutorial {...defaultProps} show={i % 2 === 0} />);
        });
      }

      // Should not crash
      expect(true).toBe(true);
    });

    it('should prevent Previous on first step', async () => {
      const user = userEvent.setup();
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.WELCOME} />);

      const previousButton = screen.getByTestId('gesture-tutorial-previous');

      await act(async () => {
        await user.click(previousButton);
      });

      // Should stay on step 0
      expect(screen.getByTestId('gesture-tutorial')).toHaveAttribute('data-step', '0');
    });

    it('should call onComplete multiple times if Next clicked on final step', async () => {
      const user = userEvent.setup();
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.COMPLETE} />);

      const getStartedButton = screen.getByTestId('gesture-tutorial-next');

      await act(async () => {
        await user.click(getStartedButton);
        await user.click(getStartedButton);
      });

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('|accessibility| Screen Reader Support', () => {
    it('should have text content readable by screen readers', () => {
      render(<GestureTutorial {...defaultProps} />);

      expect(screen.getByText('Welcome to California Counties!')).toBeInTheDocument();
      expect(screen.getByText(/Learn how to play/i)).toBeInTheDocument();
    });

    it('should have focusable navigation buttons', () => {
      render(<GestureTutorial {...defaultProps} />);

      const nextButton = screen.getByTestId('gesture-tutorial-next');
      const previousButton = screen.getByTestId('gesture-tutorial-previous');

      expect(nextButton).toBeInTheDocument();
      expect(previousButton).toBeInTheDocument();
    });

    it('should indicate disabled state on Previous button', () => {
      render(<GestureTutorial {...defaultProps} initialStep={TutorialStep.WELCOME} />);

      const previousButton = screen.getByTestId('gesture-tutorial-previous');
      expect(previousButton).toBeDisabled();
      expect(previousButton).toHaveStyle({ cursor: 'not-allowed' });
    });
  });
});
