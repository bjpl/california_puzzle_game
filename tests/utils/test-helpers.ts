import { vi } from 'vitest';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Custom render function with common providers
export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withRouter?: boolean;
  withDndProvider?: boolean;
  initialState?: any;
}

export const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  const {
    withRouter = false,
    withDndProvider = false,
    initialState,
    ...renderOptions
  } = options;

  let Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <>{children}</>
  );

  // Add providers as needed
  if (withDndProvider) {
    const MockDndProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <div data-testid="dnd-provider">{children}</div>
    );
    Wrapper = MockDndProvider;
  }

  if (withRouter) {
    const MockRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <div data-testid="router-provider">{children}</div>
    );
    const PreviousWrapper = Wrapper;
    Wrapper = ({ children }) => (
      <MockRouter>
        <PreviousWrapper>{children}</PreviousWrapper>
      </MockRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Test data generators
export const generateMockCounty = (overrides: Partial<any> = {}) => ({
  id: 'test-county',
  name: 'Test County',
  population: 1000000,
  area: 1000,
  coordinates: { lat: 34.0522, lng: -118.2437 },
  region: 'Test Region',
  established: 1850,
  countyFIPS: '06999',
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [-118.6, 34.0],
      [-118.0, 34.0],
      [-118.0, 34.5],
      [-118.6, 34.5],
      [-118.6, 34.0]
    ]]
  },
  ...overrides,
});

export const generateMockCounties = (count: number): any[] => {
  return Array.from({ length: count }, (_, index) =>
    generateMockCounty({
      id: `county-${index}`,
      name: `County ${index}`,
      population: 500000 + index * 100000,
      countyFIPS: `06${index.toString().padStart(3, '0')}`,
    })
  );
};

export const generateMockGameState = (overrides: Partial<any> = {}) => ({
  mode: 'practice',
  difficulty: 'medium',
  isGameStarted: false,
  isGamePaused: false,
  isGameCompleted: false,
  score: 0,
  correctAnswers: 0,
  totalQuestions: 0,
  mistakes: 0,
  hintsUsed: 0,
  maxHints: 3,
  timeElapsed: 0,
  timeLimit: null,
  availableCounties: [],
  placedCounties: [],
  currentCounty: null,
  selectedCounty: null,
  highlightedCounty: null,
  streak: 0,
  bestStreak: 0,
  showHints: true,
  showLabels: false,
  soundEnabled: true,
  ...overrides,
});

// Event simulation helpers
export const simulateDragAndDrop = async (
  user: ReturnType<typeof userEvent.setup>,
  source: Element,
  target: Element
) => {
  await user.pointer([
    { target: source, keys: '[MouseLeft>]' },
    { target: target },
    { keys: '[/MouseLeft]' },
  ]);
};

export const simulateKeyboardDragAndDrop = async (
  user: ReturnType<typeof userEvent.setup>,
  source: Element,
  target: Element
) => {
  source.focus();
  await user.keyboard(' '); // Select
  target.focus();
  await user.keyboard('{Enter}'); // Place
};

// Performance testing helpers
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

export const waitForStableRender = async (element: Element, timeout = 1000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Render did not stabilize')), timeout);

    let lastChangeTime = Date.now();

    const observer = new MutationObserver(() => {
      lastChangeTime = Date.now();
    });

    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    const checkStability = () => {
      if (Date.now() - lastChangeTime > 100) {
        clearTimeout(timer);
        observer.disconnect();
        resolve();
      } else {
        setTimeout(checkStability, 50);
      }
    };

    setTimeout(checkStability, 100);
  });
};

// Accessibility testing helpers
export const getFocusableElements = (container: Element): Element[] => {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter((element) => {
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
};

export const testTabOrder = async (
  user: ReturnType<typeof userEvent.setup>,
  expectedOrder: string[]
): Promise<boolean> => {
  for (let i = 0; i < expectedOrder.length; i++) {
    await user.tab();
    const focused = document.activeElement;
    const testId = focused?.getAttribute('data-testid');

    if (testId !== expectedOrder[i]) {
      console.warn(`Expected ${expectedOrder[i]}, got ${testId} at position ${i}`);
      return false;
    }
  }
  return true;
};

// Mock functions and utilities
export const createMockGeolocation = () => ({
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
});

export const createMockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });
  return mockIntersectionObserver;
};

export const createMockResizeObserver = () => {
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });
  return mockResizeObserver;
};

// Data validation helpers
export const validateCountyData = (county: any): string[] => {
  const errors: string[] = [];

  if (!county.id || typeof county.id !== 'string') {
    errors.push('County must have a valid id');
  }

  if (!county.name || typeof county.name !== 'string') {
    errors.push('County must have a valid name');
  }

  if (typeof county.population !== 'number' || county.population < 0) {
    errors.push('County must have a valid population');
  }

  if (typeof county.area !== 'number' || county.area <= 0) {
    errors.push('County must have a valid area');
  }

  if (!county.coordinates ||
      typeof county.coordinates.lat !== 'number' ||
      typeof county.coordinates.lng !== 'number') {
    errors.push('County must have valid coordinates');
  }

  if (!county.geometry || county.geometry.type !== 'Polygon') {
    errors.push('County must have valid polygon geometry');
  }

  return errors;
};

export const validateGameState = (state: any): string[] => {
  const errors: string[] = [];

  if (!['practice', 'timed', 'challenge', 'learn'].includes(state.mode)) {
    errors.push('Invalid game mode');
  }

  if (!['easy', 'medium', 'hard'].includes(state.difficulty)) {
    errors.push('Invalid difficulty level');
  }

  if (typeof state.score !== 'number' || state.score < 0) {
    errors.push('Score must be a non-negative number');
  }

  if (state.correctAnswers > state.totalQuestions) {
    errors.push('Correct answers cannot exceed total questions');
  }

  if (state.hintsUsed > state.maxHints) {
    errors.push('Hints used cannot exceed max hints');
  }

  return errors;
};

// Test environment setup
export const setupTestEnvironment = () => {
  // Mock global objects that might not exist in test environment
  if (!global.IntersectionObserver) {
    global.IntersectionObserver = createMockIntersectionObserver();
  }

  if (!global.ResizeObserver) {
    global.ResizeObserver = createMockResizeObserver();
  }

  if (!navigator.geolocation) {
    Object.defineProperty(navigator, 'geolocation', {
      value: createMockGeolocation(),
      configurable: true,
    });
  }

  // Mock performance API if not available
  if (!global.performance.mark) {
    global.performance.mark = vi.fn();
  }

  if (!global.performance.measure) {
    global.performance.measure = vi.fn();
  }
};

// Cleanup helpers
export const cleanupTestEnvironment = () => {
  // Clear all mocks
  vi.clearAllMocks();

  // Clear any timers
  vi.clearAllTimers();

  // Clean up DOM
  document.body.innerHTML = '';

  // Reset focus
  if (document.activeElement && document.activeElement !== document.body) {
    (document.activeElement as HTMLElement).blur();
  }
};

// Re-export commonly used testing utilities
export * from '@testing-library/react';
export * from '@testing-library/user-event';
export { userEvent };

// Re-export custom render as default render
export { customRender as render };