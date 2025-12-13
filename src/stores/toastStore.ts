/**
 * Toast Store - Notification State Management
 *
 * Purpose: Manage toast notifications with auto-dismiss and queue limiting
 * Features: Success/error/info/warning toasts, max 3 visible, ARIA support
 *
 * Usage:
 *   const { success, error } = useToast();
 *   success('County placed correctly!');
 *
 * Last updated: 2025-11-19
 */

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number; // milliseconds
  dismissible: boolean;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

/**
 * Toast Store with Zustand
 *
 * CONCEPT: Global toast notification state with automatic cleanup
 * WHY: Provide consistent user feedback across the application
 * PATTERN: Zustand store with FIFO queue and auto-dismiss
 */
export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  /**
   * Add toast to queue
   *
   * CONCEPT: Add notification with auto-dismiss timer
   * WHY: Provide immediate feedback without overwhelming user
   * PATTERN: FIFO queue with max 3 toasts, oldest removed first
   */
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { ...toast, id };

    set((state) => {
      // Limit to 3 toasts - remove oldest if at capacity
      const toasts =
        state.toasts.length >= 3
          ? [...state.toasts.slice(1), newToast]
          : [...state.toasts, newToast];

      return { toasts };
    });

    // Auto-dismiss after duration (if not Infinity)
    if (toast.duration !== Infinity && toast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, toast.duration);
    }
  },

  /**
   * Remove toast by ID
   *
   * CONCEPT: Remove specific toast from queue
   * WHY: Support manual dismissal and auto-dismiss cleanup
   * PATTERN: Filter by ID
   */
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  /**
   * Clear all toasts
   *
   * CONCEPT: Remove all toasts at once
   * WHY: Support emergency clear or navigation cleanup
   * PATTERN: Empty array assignment
   */
  clearAll: () => set({ toasts: [] }),
}));

/**
 * Default toast durations by type
 *
 * CONCEPT: Type-specific auto-dismiss timing
 * WHY: Match urgency to visibility duration
 * PATTERN: Constant configuration object
 */
export const TOAST_DURATIONS = {
  success: 3000, // 3 seconds - quick confirmation
  error: 5000, // 5 seconds - more time to read error
  info: 3000, // 3 seconds - informational
  warning: 4000, // 4 seconds - moderate urgency
} as const;
