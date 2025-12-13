/**
 * useToast Hook - Convenience API for Toast Notifications
 *
 * Purpose: Provide simple, typed API for showing toast notifications
 * Features: Type-specific methods, automatic duration assignment
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success('County placed correctly!');
 *   toast.error('Oops! Try again.');
 *   toast.info('Hint: Look for coastal counties.');
 *   toast.warning('Only 2 hints remaining.');
 *
 * Last updated: 2025-11-19
 */

import { useToastStore, TOAST_DURATIONS, type ToastType } from '../stores/toastStore';

export interface ToastOptions {
  duration?: number;
  dismissible?: boolean;
}

/**
 * Toast Hook
 *
 * CONCEPT: Simplified API for common toast patterns
 * WHY: Reduce boilerplate, ensure consistency
 * PATTERN: Closure over store methods with type-specific defaults
 */
export function useToast() {
  const addToast = useToastStore((state) => state.addToast);

  /**
   * Show toast notification
   *
   * CONCEPT: Generic toast with type parameter
   * WHY: Support all toast types with single method
   * PATTERN: Factory function with type discrimination
   */
  const show = (type: ToastType, message: string, options: ToastOptions = {}) => {
    addToast({
      type,
      message,
      duration: options.duration ?? TOAST_DURATIONS[type],
      dismissible: options.dismissible ?? true,
    });
  };

  return {
    /**
     * Show success toast (green)
     * Duration: 3 seconds
     * Use for: Successful actions, confirmations
     */
    success: (message: string, options?: ToastOptions) => show('success', message, options),

    /**
     * Show error toast (red)
     * Duration: 5 seconds (longer for errors)
     * Use for: Failed actions, validation errors
     */
    error: (message: string, options?: ToastOptions) => show('error', message, options),

    /**
     * Show info toast (blue)
     * Duration: 3 seconds
     * Use for: Informational messages, hints
     */
    info: (message: string, options?: ToastOptions) => show('info', message, options),

    /**
     * Show warning toast (yellow/amber)
     * Duration: 4 seconds
     * Use for: Warnings, cautionary messages
     */
    warning: (message: string, options?: ToastOptions) => show('warning', message, options),

    /**
     * Generic show method for custom configuration
     */
    show,
  };
}
