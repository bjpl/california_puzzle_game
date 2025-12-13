/**
 * Content Constants - Button Labels and UI Text
 *
 * Purpose: Centralize UI text for consistency and easy updates
 * Features: Action-oriented labels, clear terminology
 *
 * Usage:
 *   import { BUTTON_LABELS } from '@/constants/content';
 *   <Button>{BUTTON_LABELS.SUBMIT_GUESS}</Button>
 *
 * Last updated: 2025-11-19
 */

/**
 * Button Labels
 *
 * CONCEPT: Standardized, action-oriented button text
 * WHY: Ensure consistency across application, reduce ambiguity
 * PATTERN: Grouped by functional area
 */
export const BUTTON_LABELS = {
  // Game Actions
  SUBMIT_GUESS: 'Place County',
  NEXT_ROUND: 'Continue',
  START_GAME: 'Start Game',
  RESTART_GAME: 'Restart',
  PLAY_AGAIN: 'Play Again',
  QUIT_GAME: 'Quit Game',
  RESUME_GAME: 'Resume',
  PAUSE_GAME: 'Pause',

  // Navigation
  CLOSE: 'Close',
  CLOSE_MODAL: 'Close',
  GO_BACK: 'Back',
  VIEW_DETAILS: 'View Details',
  CONTINUE: 'Continue',
  CANCEL: 'Cancel',

  // Help & Information
  SHOW_HINT: 'Get Hint',
  USE_HINT: 'Use Hint',
  LEARN_MORE: 'Learn More',
  SHOW_INSTRUCTIONS: 'How to Play',
  OPEN_STUDY_MODE: 'Study Mode',

  // Settings & Preferences
  TOGGLE_SOUND: 'Sound',
  TOGGLE_MUTE: 'Mute',
  TOGGLE_UNMUTE: 'Unmute',
  TOGGLE_THEME: 'Toggle Theme',
  TOGGLE_HIGH_CONTRAST: 'High Contrast',
  SAVE_SETTINGS: 'Save Settings',
  OPEN_SETTINGS: 'Settings',

  // Forms & Actions
  SUBMIT: 'Submit',
  SAVE: 'Save',
  DELETE: 'Delete',
  CONFIRM: 'Confirm',
  EDIT: 'Edit',

  // Study Mode
  START_QUIZ: 'Start Quiz',
  NEXT_QUESTION: 'Next Question',
  VIEW_ANSWER: 'Show Answer',
  MARK_COMPLETE: 'Mark Complete',
} as const;

/**
 * Toast Messages
 *
 * CONCEPT: Predefined notification messages
 * WHY: Consistent user feedback language
 * PATTERN: Grouped by type and context
 */
export const TOAST_MESSAGES = {
  // Success
  COUNTY_PLACED: 'Excellent! County placed correctly.',
  GAME_COMPLETED: 'Congratulations! You completed the puzzle!',
  SETTINGS_SAVED: 'Settings saved successfully.',
  PROGRESS_SAVED: 'Progress saved.',

  // Errors
  COUNTY_INCORRECT: 'Not quite right. Try again!',
  GAME_ERROR: 'An error occurred. Please try again.',
  SAVE_FAILED: 'Failed to save. Please try again.',
  CONNECTION_ERROR: 'Connection lost. Changes may not be saved.',

  // Info
  HINT_USED: 'Hint revealed!',
  GAME_PAUSED: 'Game paused.',
  GAME_RESUMED: 'Game resumed.',
  TIMER_STARTED: 'Timer started!',

  // Warnings
  LOW_HINTS: 'Only {count} hints remaining.',
  UNSAVED_CHANGES: 'You have unsaved changes.',
  QUOTA_EXCEEDED: 'Storage quota exceeded.',
} as const;

/**
 * Helper function to replace placeholders in messages
 *
 * Usage:
 *   formatMessage(TOAST_MESSAGES.LOW_HINTS, { count: 2 })
 *   // Returns: "Only 2 hints remaining."
 */
export function formatMessage(
  template: string,
  replacements: Record<string, string | number>
): string {
  return Object.entries(replacements).reduce(
    (message, [key, value]) => message.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
    template
  );
}
