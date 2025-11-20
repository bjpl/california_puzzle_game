/**
 * ToastContainer Component - Toast Stack Manager
 *
 * Purpose: Render and position all active toast notifications
 * Features: Fixed positioning, responsive, stacking animation
 *
 * Layout: Top-right corner, vertical stack
 * Responsive: Adjusts for mobile viewports
 *
 * Last updated: 2025-11-19
 */

import React from 'react';
import { useToastStore } from '../../stores/toastStore';
import { Toast } from './Toast';

/**
 * ToastContainer Component
 *
 * CONCEPT: Fixed-position container for toast stack
 * WHY: Consistent positioning without disrupting layout
 * PATTERN: Portal-like fixed positioning with z-index management
 */
export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} />
        </div>
      ))}
    </div>
  );
};

/**
 * Add slide-in animation to globals.css
 *
 * Note: The following animation should be added to globals.css:
 *
 * @keyframes slide-in-right {
 *   from {
 *     opacity: 0;
 *     transform: translateX(100%);
 *   }
 *   to {
 *     opacity: 1;
 *     transform: translateX(0);
 *   }
 * }
 *
 * .animate-slide-in-right {
 *   animation: slide-in-right 0.2s ease-out;
 * }
 *
 * @media (prefers-reduced-motion: reduce) {
 *   .animate-slide-in-right {
 *     animation: none;
 *   }
 * }
 */
