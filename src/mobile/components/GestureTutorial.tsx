/**
 * Gesture Tutorial Component
 *
 * First-time user tutorial for mobile touch gestures.
 * Shows animated demonstrations of drag, pinch, swipe interactions.
 *
 * @see docs/MOBILE_PRD.md - Phase 2: Gesture Tutorial
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOBILE_ANIMATIONS } from '../config/breakpoints';

/**
 * Tutorial steps
 */
// eslint-disable-next-line react-refresh/only-export-components
export enum TutorialStep {
  WELCOME = 0,
  DRAG_COUNTY = 1,
  PINCH_ZOOM = 2,
  SWIPE_NAVIGATION = 3,
  BOTTOM_SHEET = 4,
  COMPLETE = 5,
}

/**
 * Gesture tutorial props
 */
export interface GestureTutorialProps {
  /** Show tutorial (controlled) */
  show: boolean;

  /** Callback when tutorial completes */
  onComplete?: () => void;

  /** Callback when tutorial is skipped */
  onSkip?: () => void;

  /** Allow skipping tutorial */
  allowSkip?: boolean;

  /** Initial step (default: WELCOME) */
  initialStep?: TutorialStep;

  /** Custom className */
  className?: string;

  /** Test ID */
  'data-testid'?: string;
}

/**
 * Tutorial step content
 */
interface StepContent {
  title: string;
  description: string;
  animation: React.ReactNode;
  tip?: string;
}

/**
 * Animated hand icon for gesture demonstrations
 */
const AnimatedHand: React.FC<{ gesture: 'tap' | 'drag' | 'pinch' | 'swipe' }> = ({ gesture }) => {
  const animations = {
    tap: {
      scale: [1, 0.9, 1],
      transition: { duration: 0.6, repeat: Infinity, repeatDelay: 1 },
    },
    drag: {
      y: [0, -50, 0],
      transition: { duration: 2, repeat: Infinity, repeatDelay: 0.5 },
    },
    pinch: {
      scale: [1, 1.5, 1],
      transition: { duration: 2, repeat: Infinity, repeatDelay: 0.5 },
    },
    swipe: {
      x: [-50, 50, -50],
      transition: { duration: 2, repeat: Infinity, repeatDelay: 0.5 },
    },
  };

  return (
    <motion.div
      className="tutorial-hand"
      style={{
        width: 60,
        height: 60,
        borderRadius: '50%',
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
      }}
      animate={animations[gesture]}
    >
      ✋
    </motion.div>
  );
};

/**
 * Get step content
 */
function getStepContent(step: TutorialStep): StepContent {
  const steps: Record<TutorialStep, StepContent> = {
    [TutorialStep.WELCOME]: {
      title: 'Welcome to California Counties!',
      description: 'Learn how to play on your mobile device with touch gestures',
      animation: <div style={{ fontSize: 64 }}>🗺️</div>,
      tip: 'Swipe through this tutorial to learn the basics',
    },
    [TutorialStep.DRAG_COUNTY]: {
      title: 'Drag Counties',
      description: 'Press and hold a county for 300ms, then drag it to the map',
      animation: <AnimatedHand gesture="drag" />,
      tip: 'Feel the haptic vibration when you start dragging',
    },
    [TutorialStep.PINCH_ZOOM]: {
      title: 'Pinch to Zoom',
      description: 'Use two fingers to pinch the map and zoom in or out',
      animation: <AnimatedHand gesture="pinch" />,
      tip: 'The map will load higher quality data as you zoom in',
    },
    [TutorialStep.SWIPE_NAVIGATION]: {
      title: 'Swipe to Navigate',
      description: 'Swipe left or right to browse counties in study mode',
      animation: <AnimatedHand gesture="swipe" />,
      tip: 'Works just like popular card-based apps',
    },
    [TutorialStep.BOTTOM_SHEET]: {
      title: 'Bottom Sheet',
      description: 'Swipe up from the bottom to see more details',
      animation: <AnimatedHand gesture="swipe" />,
      tip: 'Tap the backdrop or swipe down to close',
    },
    [TutorialStep.COMPLETE]: {
      title: 'Ready to Play!',
      description: 'You now know all the gestures. Have fun learning California geography!',
      animation: <div style={{ fontSize: 64 }}>🎉</div>,
    },
  };

  return steps[step];
}

/**
 * Gesture Tutorial Component
 *
 * Displays interactive tutorial for mobile gestures.
 * Shows on first app launch, can be replayed from settings.
 *
 * @example
 * ```tsx
 * <GestureTutorial
 *   show={isFirstTime}
 *   onComplete={() => {
 *     setIsFirstTime(false);
 *     localStorage.setItem('hasSeenTutorial', 'true');
 *   }}
 *   onSkip={() => setIsFirstTime(false)}
 *   allowSkip={true}
 * />
 * ```
 */
export const GestureTutorial: React.FC<GestureTutorialProps> = ({
  show,
  onComplete,
  onSkip,
  allowSkip = true,
  initialStep = TutorialStep.WELCOME,
  className = '',
  'data-testid': testId = 'gesture-tutorial',
}) => {
  const [currentStep, setCurrentStep] = useState<TutorialStep>(initialStep);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const content = getStepContent(currentStep);
  const totalSteps = Object.keys(TutorialStep).length / 2; // Enum has string and number keys
  const progress = ((currentStep + 1) / totalSteps) * 100;

  /**
   * Handle next step
   */
  const handleNext = () => {
    if (currentStep === TutorialStep.COMPLETE) {
      onComplete?.();
    } else {
      setDirection('forward');
      setCurrentStep((prev) => prev + 1);
    }
  };

  /**
   * Handle previous step
   */
  const handlePrevious = () => {
    if (currentStep > TutorialStep.WELCOME) {
      setDirection('backward');
      setCurrentStep((prev) => prev - 1);
    }
  };

  /**
   * Handle skip
   */
  const handleSkip = () => {
    onSkip?.();
  };

  /**
   * Handle keyboard navigation (for accessibility)
   */
  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'Escape':
          e.preventDefault();
          if (allowSkip) handleSkip();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, currentStep, allowSkip]); // eslint-disable-line react-hooks/exhaustive-deps

  // Animation variants for slide transitions
  const slideVariants = {
    enter: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`gesture-tutorial ${className}`}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            color: 'white',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: MOBILE_ANIMATIONS.NORMAL / 1000 }}
          data-testid={testId}
          data-step={currentStep}
        >
          {/* Skip button */}
          {allowSkip && (
            <button
              onClick={handleSkip}
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 14,
                cursor: 'pointer',
              }}
              data-testid={`${testId}-skip`}
            >
              Skip Tutorial
            </button>
          )}

          {/* Progress bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: 4,
              width: `${progress}%`,
              backgroundColor: '#3b82f6',
              transition: 'width 0.3s ease',
            }}
            data-testid={`${testId}-progress`}
          />

          {/* Content area */}
          <div
            style={{
              maxWidth: 400,
              width: '100%',
              textAlign: 'center',
            }}
          >
            {/* Animated content */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
              >
                {/* Animation visual */}
                <div
                  style={{
                    marginBottom: 32,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {content.animation}
                </div>

                {/* Title */}
                <h2
                  style={{
                    fontSize: 28,
                    fontWeight: 'bold',
                    marginBottom: 16,
                  }}
                >
                  {content.title}
                </h2>

                {/* Description */}
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: 1.6,
                    marginBottom: 16,
                    opacity: 0.9,
                  }}
                >
                  {content.description}
                </p>

                {/* Tip */}
                {content.tip && (
                  <p
                    style={{
                      fontSize: 14,
                      opacity: 0.7,
                      fontStyle: 'italic',
                    }}
                  >
                    💡 {content.tip}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: 24,
              right: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Previous button */}
            <button
              onClick={handlePrevious}
              disabled={currentStep === TutorialStep.WELCOME}
              style={{
                background:
                  currentStep === TutorialStep.WELCOME ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 8,
                fontSize: 16,
                cursor: currentStep === TutorialStep.WELCOME ? 'not-allowed' : 'pointer',
                opacity: currentStep === TutorialStep.WELCOME ? 0.3 : 1,
                minWidth: 100,
              }}
              data-testid={`${testId}-previous`}
            >
              Previous
            </button>

            {/* Step indicator dots */}
            <div style={{ display: 'flex', gap: 8 }}>
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: index === currentStep ? '#3b82f6' : 'rgba(255, 255, 255, 0.3)',
                    transition: 'background-color 0.3s ease',
                  }}
                  data-testid={`${testId}-dot-${index}`}
                />
              ))}
            </div>

            {/* Next/Complete button */}
            <button
              onClick={handleNext}
              style={{
                background: '#3b82f6',
                border: 'none',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer',
                minWidth: 100,
              }}
              data-testid={`${testId}-next`}
            >
              {currentStep === TutorialStep.COMPLETE ? 'Get Started' : 'Next'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GestureTutorial;
