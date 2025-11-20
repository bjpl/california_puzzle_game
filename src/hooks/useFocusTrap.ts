/**
 * Focus Trap Hook for Modal Accessibility
 *
 * Implements WCAG 2.1 Level AA compliance for modal dialogs:
 * - 2.1.1 Keyboard: All functionality available via keyboard
 * - 2.4.3 Focus Order: Logical tab order within modal
 * - 4.1.2 Name, Role, Value: Proper ARIA attributes
 *
 * Features:
 * - Traps focus within modal when open
 * - Restores focus to trigger element when closed
 * - Handles Tab, Shift+Tab, and Escape keys
 * - Finds all focusable elements dynamically
 */

import { useEffect, useRef, RefObject } from 'react';

// Focusable element selectors per WCAG guidelines
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

interface UseFocusTrapOptions {
  /** Whether the modal/dialog is open */
  isOpen: boolean;
  /** Ref to the dialog container element */
  dialogRef: RefObject<HTMLElement>;
  /** Optional callback when Escape key is pressed */
  onEscape?: () => void;
  /** Whether to auto-focus first element (default: true) */
  autoFocus?: boolean;
}

/**
 * Hook to trap focus within a modal dialog for accessibility
 *
 * @param options - Configuration options
 * @example
 * ```tsx
 * const dialogRef = useRef<HTMLDivElement>(null);
 * useFocusTrap({
 *   isOpen: isModalOpen,
 *   dialogRef,
 *   onEscape: handleClose,
 * });
 *
 * return (
 *   <div ref={dialogRef} role="dialog" aria-modal="true">
 *     // Modal content
 *   </div>
 * );
 * ```
 */
export function useFocusTrap({
  isOpen,
  dialogRef,
  onEscape,
  autoFocus = true,
}: UseFocusTrapOptions): void {
  // Store the element that triggered the modal
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Get all focusable elements within the dialog
  const getFocusableElements = (): HTMLElement[] => {
    if (!dialogRef.current) return [];

    const elements = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    );

    // Filter out elements that are not visible or have negative tabindex
    return elements.filter((el) => {
      const style = window.getComputedStyle(el);
      const isVisible = style.display !== 'none' && style.visibility !== 'hidden';
      const tabIndex = parseInt(el.getAttribute('tabindex') || '0', 10);
      return isVisible && tabIndex >= 0;
    });
  };

  // Handle keyboard events for focus trapping
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    // Store the currently focused element to restore later
    returnFocusRef.current = document.activeElement as HTMLElement;

    // Focus the first focusable element or the dialog itself
    if (autoFocus) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else if (dialogRef.current) {
        // If no focusable elements, focus the dialog itself
        dialogRef.current.setAttribute('tabindex', '-1');
        dialogRef.current.focus();
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key
      if (event.key === 'Escape') {
        if (onEscape) {
          event.preventDefault();
          event.stopPropagation();
          onEscape();
        }
        return;
      }

      // Only handle Tab key
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();

      // If no focusable elements, prevent default to trap focus
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // Shift + Tab: Moving backwards
      if (event.shiftKey) {
        if (activeElement === firstElement || !dialogRef.current?.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }
      }
      // Tab: Moving forwards
      else {
        if (activeElement === lastElement || !dialogRef.current?.contains(activeElement)) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Add event listener to document (capture phase for priority)
    document.addEventListener('keydown', handleKeyDown, true);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);

      // Restore focus to the element that opened the modal
      if (returnFocusRef.current) {
        // Small delay to ensure modal is closed before focusing
        setTimeout(() => {
          returnFocusRef.current?.focus();
        }, 10);
      }
    };
  }, [isOpen, dialogRef, onEscape, autoFocus]);

  // Announce modal open/close to screen readers
  useEffect(() => {
    if (!isOpen) return;

    // Announce to screen readers that dialog is open
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = 'Dialog opened';

    document.body.appendChild(announcement);

    // Remove announcement after it's been read
    const timeoutId = setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    };
  }, [isOpen]);
}
