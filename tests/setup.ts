import '@testing-library/jest-dom';
import { vi, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';

// Extend Vitest matchers with jest-axe
expect.extend(toHaveNoViolations);

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock SVGElement getBBox method
Object.defineProperty(SVGElement.prototype, 'getBBox', {
  writable: true,
  value: vi.fn().mockReturnValue({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  }),
});

// Mock SVGElement getComputedTextLength method
Object.defineProperty(SVGElement.prototype, 'getComputedTextLength', {
  writable: true,
  value: vi.fn().mockReturnValue(100),
});

// Mock HTMLCanvasElement getContext method
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn().mockReturnValue({
      data: new Uint8ClampedArray(4),
    }),
    putImageData: vi.fn(),
    createImageData: vi.fn().mockReturnValue({}),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 100 }),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock drag and drop API
Object.defineProperty(window, 'DataTransfer', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    effectAllowed: 'all',
    dropEffect: 'move',
    files: [],
    items: [],
    types: [],
    clearData: vi.fn(),
    getData: vi.fn(),
    setData: vi.fn(),
    setDragImage: vi.fn(),
  })),
});

// Mock performance API with memory property that simulates realistic memory changes
let mockNowValue = 0;
const mockMemoryBase = 10485760; // Start at 10MB
let mockMemoryIncrement = 0;
let mockMemoryCallCount = 0;

// Create memory object that returns dynamic values
const mockMemory = {
  get usedJSHeapSize() {
    // Increment memory slightly on each call to simulate allocation
    // This makes tests more predictable while still showing memory changes
    mockMemoryCallCount++;
    const incrementPerCall = 50000; // 50KB per call
    const totalIncrement = mockMemoryCallCount * incrementPerCall;
    return mockMemoryBase + mockMemoryIncrement + totalIncrement;
  },
  get totalJSHeapSize() {
    return Math.max(this.usedJSHeapSize * 1.5, 20971520);
  },
  get jsHeapSizeLimit() {
    return 4294967296; // 4GB
  },
};

Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => {
      mockNowValue += 16.67; // Simulate ~60fps timing
      return mockNowValue;
    }),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn().mockReturnValue([]),
    getEntriesByType: vi.fn().mockReturnValue([]),
    // Mock memory API (Chrome-specific, not available in jsdom)
    memory: mockMemory,
  },
});

// Mock requestAnimationFrame for FPS measurements
let rafId = 0;
const requestAnimationFrameMock = vi.fn((callback: FrameRequestCallback) => {
  const id = ++rafId;
  setTimeout(() => callback(performance.now()), 16); // Simulate 60fps
  return id;
});

const cancelAnimationFrameMock = vi.fn((_id: number) => {
  // Mock implementation
});

global.requestAnimationFrame = requestAnimationFrameMock;
global.cancelAnimationFrame = cancelAnimationFrameMock;

// Also add to window object for consistency
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: requestAnimationFrameMock,
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: cancelAnimationFrameMock,
});

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockNowValue = 0; // Reset performance.now() counter
  mockMemoryIncrement = 0; // Reset memory increment
  mockMemoryCallCount = 0; // Reset memory call counter
  rafId = 0; // Reset RAF counter
});
