import '@testing-library/jest-dom';
import { vi } from 'vitest';

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
  value: vi.fn().mockImplementation(query => ({
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

// Mock performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn().mockReturnValue(Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn().mockReturnValue([]),
    getEntriesByType: vi.fn().mockReturnValue([]),
  },
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});