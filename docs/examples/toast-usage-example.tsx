/**
 * Toast Usage Examples
 *
 * This file demonstrates how to use the new toast notification system
 * in various game scenarios.
 *
 * Location: /docs/examples/toast-usage-example.tsx
 */

import React from 'react';
import { useToast } from '@/hooks/useToast';
import { TOAST_MESSAGES, BUTTON_LABELS, formatMessage } from '@/constants/content';
import { Button } from '@/components/ui/Button';

/**
 * Example 1: Basic Toast Usage in Game Component
 */
export function GameActionsExample() {
  const toast = useToast();

  const handleCorrectPlacement = () => {
    // Show success toast when county is placed correctly
    toast.success(TOAST_MESSAGES.COUNTY_PLACED);
    // Plays for 3 seconds, auto-dismisses
  };

  const handleIncorrectPlacement = () => {
    // Show error toast when placement is wrong
    toast.error(TOAST_MESSAGES.COUNTY_INCORRECT);
    // Plays for 5 seconds (errors stay longer)
  };

  const handleHintUsed = () => {
    // Show info toast when hint is revealed
    toast.info(TOAST_MESSAGES.HINT_USED);
  };

  const handleLowHints = (remainingHints: number) => {
    // Show warning toast with dynamic count
    const message = formatMessage(TOAST_MESSAGES.LOW_HINTS, {
      count: remainingHints,
    });
    toast.warning(message);
    // Result: "Only 2 hints remaining."
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleCorrectPlacement}>
        {BUTTON_LABELS.SUBMIT_GUESS}
      </Button>
      <Button onClick={handleIncorrectPlacement} variant="danger">
        Simulate Error
      </Button>
      <Button onClick={handleHintUsed} variant="secondary">
        {BUTTON_LABELS.SHOW_HINT}
      </Button>
      <Button onClick={() => handleLowHints(2)} variant="warning">
        Simulate Low Hints
      </Button>
    </div>
  );
}

/**
 * Example 2: Custom Toast Configuration
 */
export function CustomToastExample() {
  const toast = useToast();

  const handleQuickNotification = () => {
    // Custom duration: 2 seconds instead of default 3
    toast.success('Quick save!', { duration: 2000 });
  };

  const handlePersistentNotification = () => {
    // Non-dismissible toast (user must wait for auto-dismiss)
    toast.info('Loading...', { dismissible: false });
  };

  const handleInfiniteNotification = () => {
    // Toast that stays until manually dismissed
    toast.warning('Important: Please review settings.', {
      duration: Infinity,
      dismissible: true,
    });
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleQuickNotification}>Quick Toast (2s)</Button>
      <Button onClick={handlePersistentNotification}>
        Non-Dismissible Toast
      </Button>
      <Button onClick={handleInfiniteNotification}>Persistent Toast</Button>
    </div>
  );
}

/**
 * Example 3: Integration with Game Context
 */
export function GameContextIntegrationExample() {
  const toast = useToast();

  // In your actual game component, you might have:
  const handleCountyPlacement = (isCorrect: boolean, countyName: string) => {
    if (isCorrect) {
      toast.success(`Perfect! ${countyName} placed correctly.`);
      // Play success sound, update score, etc.
    } else {
      toast.error(`${countyName} is not in the right location. Try again!`);
      // Play error sound, increment mistakes, etc.
    }
  };

  const handleGameComplete = (score: number, time: string) => {
    toast.success(
      `${TOAST_MESSAGES.GAME_COMPLETED} Score: ${score} | Time: ${time}`,
      { duration: 10000 } // Stay longer for game completion
    );
  };

  const handleConnectionError = () => {
    toast.error(TOAST_MESSAGES.CONNECTION_ERROR, {
      duration: 8000, // Longer duration for critical errors
    });
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => handleCountyPlacement(true, 'Los Angeles County')}>
        Correct Placement
      </Button>
      <Button onClick={() => handleCountyPlacement(false, 'San Diego County')}>
        Incorrect Placement
      </Button>
      <Button onClick={() => handleGameComplete(1500, '8:45')}>
        Complete Game
      </Button>
      <Button onClick={handleConnectionError} variant="danger">
        Connection Error
      </Button>
    </div>
  );
}

/**
 * Example 4: Replace alert() with Toast
 */
export function AlertReplacementExample() {
  const toast = useToast();

  // ❌ OLD WAY (Don't use this):
  const oldConfirmation = () => {
    alert('Settings saved!'); // Blocks UI, not stylable, poor UX
  };

  // ✅ NEW WAY (Use this):
  const newConfirmation = () => {
    toast.success(TOAST_MESSAGES.SETTINGS_SAVED); // Non-blocking, beautiful, accessible
  };

  // ❌ OLD WAY:
  const oldError = () => {
    alert('Error: Failed to save!'); // Scary, no context
  };

  // ✅ NEW WAY:
  const newError = () => {
    toast.error(TOAST_MESSAGES.SAVE_FAILED); // Clear, contextual, helpful
  };

  return (
    <div className="space-y-4">
      <div className="space-x-4">
        <Button onClick={oldConfirmation} variant="outline">
          Old Alert (Bad)
        </Button>
        <Button onClick={newConfirmation} variant="success">
          New Toast (Good)
        </Button>
      </div>
      <div className="space-x-4">
        <Button onClick={oldError} variant="outline">
          Old Error Alert
        </Button>
        <Button onClick={newError} variant="danger">
          New Error Toast
        </Button>
      </div>
    </div>
  );
}

/**
 * Example 5: Progressive Feedback with Toasts
 */
export function ProgressiveFeedbackExample() {
  const toast = useToast();

  const handleMultiStepAction = async () => {
    // Step 1: Show info toast
    toast.info('Saving progress...');

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 2: Show success toast
    toast.success('Progress saved successfully!');

    // Step 3: Show warning if quota is near limit
    const storageUsed = 85; // percentage
    if (storageUsed > 80) {
      toast.warning(
        `Storage ${storageUsed}% full. Consider clearing old data.`,
        { duration: 6000 }
      );
    }
  };

  const handleBatchOperation = async () => {
    const counties = ['Los Angeles', 'San Francisco', 'San Diego'];

    for (const county of counties) {
      toast.info(`Processing ${county}...`, { duration: 1500 });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    toast.success('All counties processed!');
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleMultiStepAction}>Multi-Step Action</Button>
      <Button onClick={handleBatchOperation}>Batch Operation</Button>
    </div>
  );
}

/**
 * Example 6: Accessibility-First Toast Usage
 */
export function AccessibilityExample() {
  const toast = useToast();

  // Critical errors use assertive ARIA live region
  const handleCriticalError = () => {
    toast.error('Critical: Session expired. Please log in again.');
    // Screen reader will interrupt to announce this immediately
  };

  // Informational messages use polite ARIA live region
  const handleInfoMessage = () => {
    toast.info('Tip: Use keyboard shortcuts for faster gameplay.');
    // Screen reader will announce this when user is idle
  };

  // Keyboard-dismissible toasts
  const handleDismissibleToast = () => {
    toast.warning('Press Escape to dismiss this notification.');
    // Users can press Esc key to dismiss any toast
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleCriticalError} variant="danger">
        Critical Error (Assertive)
      </Button>
      <Button onClick={handleInfoMessage} variant="secondary">
        Info Message (Polite)
      </Button>
      <Button onClick={handleDismissibleToast} variant="warning">
        Keyboard Dismissible
      </Button>
    </div>
  );
}

/**
 * Example 7: Testing Toasts in Development
 */
export function ToastTestingPanel() {
  const toast = useToast();

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-6">
      <h2 className="text-2xl font-bold">Toast Testing Panel</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Success Toasts</h3>
          <Button
            onClick={() => toast.success('County placed!')}
            variant="success"
            size="small"
          >
            Success Short
          </Button>
          <Button
            onClick={() =>
              toast.success(
                'Very long success message that should wrap properly in the toast container without breaking layout.'
              )
            }
            variant="success"
            size="small"
          >
            Success Long
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Error Toasts</h3>
          <Button
            onClick={() => toast.error('Try again!')}
            variant="danger"
            size="small"
          >
            Error Short
          </Button>
          <Button
            onClick={() =>
              toast.error(
                'A detailed error message explaining what went wrong and how to fix it.'
              )
            }
            variant="danger"
            size="small"
          >
            Error Long
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Info Toasts</h3>
          <Button
            onClick={() => toast.info('Hint revealed!')}
            variant="secondary"
            size="small"
          >
            Info Short
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Warning Toasts</h3>
          <Button
            onClick={() => toast.warning('2 hints left!')}
            variant="warning"
            size="small"
          >
            Warning Short
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Queue Testing (Max 3 Toasts)</h3>
        <Button
          onClick={() => {
            toast.info('Toast 1');
            toast.success('Toast 2');
            toast.warning('Toast 3');
            toast.error('Toast 4 (should remove Toast 1)');
          }}
          variant="primary"
        >
          Spam 4 Toasts (Test Queue)
        </Button>
      </div>
    </div>
  );
}
