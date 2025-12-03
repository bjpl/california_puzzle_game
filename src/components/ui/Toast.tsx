/**
 * Toast Component - Individual Notification
 *
 * Purpose: Display single toast notification with type-based styling
 * Features: Auto-dismiss, manual dismiss, ARIA live regions, animations
 *
 * Accessibility:
 * - ARIA live regions (polite/assertive based on type)
 * - Keyboard dismissible
 * - High contrast support
 * - Respects prefers-reduced-motion
 *
 * Last updated: 2025-11-19
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useToastStore, type Toast as ToastData } from '../../stores/toastStore';

interface ToastProps {
  toast: ToastData;
}

/**
 * Get icon for toast type
 *
 * CONCEPT: Visual type discrimination
 * WHY: Immediate recognition of message severity
 * PATTERN: SVG icons with consistent sizing
 */
function getToastIcon(type: ToastData['type']) {
  const iconClasses = 'w-5 h-5 flex-shrink-0';

  switch (type) {
    case 'success':
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'error':
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'warning':
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'info':
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
}

/**
 * Get styling classes for toast type
 *
 * CONCEPT: Type-based color scheme
 * WHY: Visual consistency with design system
 * PATTERN: TailwindCSS utility classes
 */
function getToastStyles(type: ToastData['type']) {
  switch (type) {
    case 'success':
      return 'bg-green-500 text-white dark:bg-green-600';
    case 'error':
      return 'bg-red-500 text-white dark:bg-red-600';
    case 'warning':
      return 'bg-amber-500 text-gray-900 dark:bg-amber-600 dark:text-white';
    case 'info':
      return 'bg-blue-500 text-white dark:bg-blue-600';
  }
}

/**
 * Toast Component
 *
 * CONCEPT: Accessible, animated notification card
 * WHY: Provide user feedback without disrupting workflow
 * PATTERN: ARIA live region with slide-in animation
 */
export const Toast: React.FC<ToastProps> = ({ toast }) => {
  const removeToast = useToastStore((state) => state.removeToast);
  const [isExiting, setIsExiting] = useState(false);

  // Handle exit animation before removal - memoized for deps
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    // Wait for animation to complete before removing
    setTimeout(() => {
      removeToast(toast.id);
    }, 200);
  }, [removeToast, toast.id]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && toast.dismissible) {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toast.dismissible, handleDismiss]);

  return (
    <div
      role="status"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`
        flex items-center gap-3 p-4 rounded-lg shadow-lg
        min-w-[320px] max-w-md
        transition-all duration-200 ease-out
        ${getToastStyles(toast.type)}
        ${
          isExiting
            ? 'opacity-0 translate-x-full'
            : 'opacity-100 translate-x-0 animate-slide-in-right'
        }
      `}
    >
      {/* Icon */}
      {getToastIcon(toast.type)}

      {/* Message */}
      <span className="flex-1 text-sm font-medium leading-snug">
        {toast.message}
      </span>

      {/* Dismiss Button */}
      {toast.dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 hover:opacity-80 transition-opacity p-1 rounded focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Dismiss notification"
          title="Dismiss (Esc)"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
