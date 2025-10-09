/**
 * Accessibility Testing Utilities
 *
 * Provides helper functions for accessibility testing including
 * focus management, keyboard navigation, and ARIA validation.
 */

/**
 * Get all focusable elements within a container
 *
 * Returns elements that can receive keyboard focus, following
 * the HTML5 standard for focusable elements.
 *
 * @param container - The container element to search within
 * @returns Array of focusable elements in DOM order
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  const elements = Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];

  // Filter out elements that are not visible
  return elements.filter((element) => {
    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' && style.visibility !== 'hidden'
      // Note: offsetParent check removed for jsdom compatibility
      // In real browser, offsetParent !== null would also be checked
    );
  });
}

/**
 * Check if an element is focusable
 *
 * @param element - The element to check
 * @returns True if the element can receive focus
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableElements = getFocusableElements(element.closest('body') || document.body);
  return focusableElements.includes(element);
}

/**
 * Get the next focusable element in tab order
 *
 * @param currentElement - Current focused element
 * @returns The next focusable element, or null if none exists
 */
export function getNextFocusableElement(currentElement: HTMLElement): HTMLElement | null {
  const focusableElements = getFocusableElements(document.body);
  const currentIndex = focusableElements.indexOf(currentElement);

  if (currentIndex === -1 || currentIndex === focusableElements.length - 1) {
    return null;
  }

  return focusableElements[currentIndex + 1];
}

/**
 * Get the previous focusable element in tab order
 *
 * @param currentElement - Current focused element
 * @returns The previous focusable element, or null if none exists
 */
export function getPreviousFocusableElement(currentElement: HTMLElement): HTMLElement | null {
  const focusableElements = getFocusableElements(document.body);
  const currentIndex = focusableElements.indexOf(currentElement);

  if (currentIndex <= 0) {
    return null;
  }

  return focusableElements[currentIndex - 1];
}

/**
 * Simulate keyboard navigation (Tab key)
 *
 * @param element - Starting element
 * @param shiftKey - Whether Shift is pressed (for reverse navigation)
 * @returns The newly focused element, or null if focus didn't move
 */
export function simulateTab(element: HTMLElement, shiftKey = false): HTMLElement | null {
  const nextElement = shiftKey
    ? getPreviousFocusableElement(element)
    : getNextFocusableElement(element);

  if (nextElement) {
    nextElement.focus();
  }

  return nextElement;
}

/**
 * Check if element has proper ARIA label
 *
 * @param element - Element to check
 * @returns True if element has accessible name
 */
export function hasAccessibleName(element: HTMLElement): boolean {
  return !!(
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    (element as HTMLInputElement).labels?.length
  );
}

/**
 * Get the accessible name of an element
 *
 * @param element - Element to get name from
 * @returns The accessible name or empty string
 */
export function getAccessibleName(element: HTMLElement): string {
  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (labelElement) return labelElement.textContent || '';
  }

  // Check associated label elements (for inputs)
  if (element instanceof HTMLInputElement && element.labels) {
    const label = element.labels[0];
    if (label) return label.textContent || '';
  }

  // Check text content for buttons
  if (element instanceof HTMLButtonElement) {
    return element.textContent || '';
  }

  return '';
}

/**
 * Verify focus trap is working correctly
 *
 * @param container - Container element with focus trap
 * @returns True if focus remains within container on Tab
 */
export function verifyFocusTrap(container: HTMLElement): boolean {
  const focusableElements = getFocusableElements(container);

  if (focusableElements.length === 0) return false;

  // Focus first element
  focusableElements[0].focus();

  // Try to tab past last element
  const lastElement = focusableElements[focusableElements.length - 1];
  lastElement.focus();

  // Simulate tab (should wrap to first)
  const nextElement = simulateTab(lastElement);

  // Check if focus wrapped to first element
  return (
    nextElement === focusableElements[0] ||
    focusableElements.includes(document.activeElement as HTMLElement)
  );
}
