import { vi } from 'vitest';
import { configureAxe } from 'vitest-axe';

// Configure axe for accessibility testing
export const axe = configureAxe({
  rules: {
    // Disable rules that might be problematic in test environment
    'color-contrast': { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'region': { enabled: false },
    // Enable important accessibility rules
    'aria-allowed-attr': { enabled: true },
    'aria-hidden-focus': { enabled: true },
    'aria-input-field-name': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'button-name': { enabled: true },
    'focus-order-semantics': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'input-button-name': { enabled: true },
    'keyboard-event-handlers': { enabled: true },
    'label': { enabled: true },
    'link-name': { enabled: true },
    'list': { enabled: true },
    'listitem': { enabled: true },
    'tabindex': { enabled: true },
  },
});

// Mock screen reader announcements
global.mockScreenReaderAnnounce = vi.fn();

// Mock focus management
const originalFocus = HTMLElement.prototype.focus;
HTMLElement.prototype.focus = vi.fn().mockImplementation(function(this: HTMLElement) {
  // Call original focus for real behavior
  originalFocus.call(this);
  // Track focus for testing
  document.dispatchEvent(new CustomEvent('mockfocus', { detail: this }));
});

// Mock keyboard event simulation
export const simulateKeyDown = (element: Element, key: string, options: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', {
    key,
    code: key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  element.dispatchEvent(event);
  return event;
};

export const simulateKeyUp = (element: Element, key: string, options: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keyup', {
    key,
    code: key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  element.dispatchEvent(event);
  return event;
};

// Helper for testing focus trapping
export const getFocusableElements = (container: Element): Element[] => {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];

  return Array.from(container.querySelectorAll(focusableSelectors.join(', ')))
    .filter((element) => {
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
};

// Helper for testing aria-live announcements
export const waitForAnnouncement = (timeout = 1000): Promise<string> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('No announcement received within timeout'));
    }, timeout);

    const handler = (event: CustomEvent) => {
      clearTimeout(timer);
      document.removeEventListener('aria-live-announcement', handler as EventListener);
      resolve(event.detail.message);
    };

    document.addEventListener('aria-live-announcement', handler as EventListener);
  });
};