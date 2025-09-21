import { vi } from 'vitest';

// Mock D3 geo projection functions
export const mockGeoProjection = vi.fn().mockImplementation(() => ({
  scale: vi.fn().mockReturnThis(),
  center: vi.fn().mockReturnThis(),
  translate: vi.fn().mockReturnThis(),
  precision: vi.fn().mockReturnThis(),
  clipExtent: vi.fn().mockReturnThis(),
  rotate: vi.fn().mockReturnThis(),
  invert: vi.fn().mockReturnValue([0, 0]),
  stream: vi.fn(),
}));

export const mockGeoPath = vi.fn().mockImplementation(() => ({
  projection: vi.fn().mockReturnThis(),
  pointRadius: vi.fn().mockReturnThis(),
  context: vi.fn().mockReturnThis(),
  bounds: vi.fn().mockReturnValue([[0, 0], [100, 100]]),
  centroid: vi.fn().mockReturnValue([50, 50]),
  area: vi.fn().mockReturnValue(1000),
  measure: vi.fn().mockReturnValue(100),
}));

export const mockD3Selection = {
  select: vi.fn().mockReturnThis(),
  selectAll: vi.fn().mockReturnThis(),
  append: vi.fn().mockReturnThis(),
  attr: vi.fn().mockReturnThis(),
  style: vi.fn().mockReturnThis(),
  text: vi.fn().mockReturnThis(),
  html: vi.fn().mockReturnThis(),
  classed: vi.fn().mockReturnThis(),
  data: vi.fn().mockReturnThis(),
  enter: vi.fn().mockReturnThis(),
  exit: vi.fn().mockReturnThis(),
  remove: vi.fn().mockReturnThis(),
  merge: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  call: vi.fn().mockReturnThis(),
  transition: vi.fn().mockReturnThis(),
  duration: vi.fn().mockReturnThis(),
  ease: vi.fn().mockReturnThis(),
  node: vi.fn().mockReturnValue({
    getBoundingClientRect: () => ({ x: 0, y: 0, width: 100, height: 100 }),
    getBBox: () => ({ x: 0, y: 0, width: 100, height: 100 }),
  }),
  nodes: vi.fn().mockReturnValue([]),
  empty: vi.fn().mockReturnValue(false),
  size: vi.fn().mockReturnValue(1),
  each: vi.fn().mockReturnThis(),
  filter: vi.fn().mockReturnThis(),
  sort: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  raise: vi.fn().mockReturnThis(),
  lower: vi.fn().mockReturnThis(),
};

export const mockD3Drag = vi.fn().mockImplementation(() => ({
  on: vi.fn().mockReturnThis(),
  filter: vi.fn().mockReturnThis(),
  container: vi.fn().mockReturnThis(),
  subject: vi.fn().mockReturnThis(),
  clickDistance: vi.fn().mockReturnThis(),
}));

export const mockD3Zoom = vi.fn().mockImplementation(() => ({
  on: vi.fn().mockReturnThis(),
  filter: vi.fn().mockReturnThis(),
  touchable: vi.fn().mockReturnThis(),
  wheelDelta: vi.fn().mockReturnThis(),
  clickDistance: vi.fn().mockReturnThis(),
  scaleExtent: vi.fn().mockReturnThis(),
  translateExtent: vi.fn().mockReturnThis(),
  constrain: vi.fn().mockReturnThis(),
  duration: vi.fn().mockReturnThis(),
  interpolate: vi.fn().mockReturnThis(),
  transform: vi.fn(),
  scaleTo: vi.fn(),
  scaleBy: vi.fn(),
  translateTo: vi.fn(),
  translateBy: vi.fn(),
}));

// Mock D3 modules
vi.mock('d3-selection', () => ({
  select: vi.fn().mockReturnValue(mockD3Selection),
  selectAll: vi.fn().mockReturnValue(mockD3Selection),
  pointer: vi.fn().mockReturnValue([0, 0]),
  pointers: vi.fn().mockReturnValue([[0, 0]]),
}));

vi.mock('d3-geo', () => ({
  geoMercator: vi.fn().mockImplementation(mockGeoProjection),
  geoAlbersUsa: vi.fn().mockImplementation(mockGeoProjection),
  geoPath: vi.fn().mockImplementation(mockGeoPath),
  geoCentroid: vi.fn().mockReturnValue([0, 0]),
  geoBounds: vi.fn().mockReturnValue([[0, 0], [100, 100]]),
  geoArea: vi.fn().mockReturnValue(1000),
  geoLength: vi.fn().mockReturnValue(100),
  geoDistance: vi.fn().mockReturnValue(50),
  geoContains: vi.fn().mockReturnValue(true),
  geoInterpolate: vi.fn().mockReturnValue(vi.fn()),
}));

vi.mock('d3-drag', () => ({
  drag: vi.fn().mockImplementation(mockD3Drag),
}));

vi.mock('d3-zoom', () => ({
  zoom: vi.fn().mockImplementation(mockD3Zoom),
  zoomIdentity: {
    x: 0,
    y: 0,
    k: 1,
    apply: vi.fn(),
    applyX: vi.fn(),
    applyY: vi.fn(),
    invert: vi.fn(),
    invertX: vi.fn(),
    invertY: vi.fn(),
    rescaleX: vi.fn(),
    rescaleY: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    toString: vi.fn(),
  },
  zoomTransform: vi.fn().mockReturnValue({
    x: 0,
    y: 0,
    k: 1,
    apply: vi.fn(),
    applyX: vi.fn(),
    applyY: vi.fn(),
    invert: vi.fn(),
    invertX: vi.fn(),
    invertY: vi.fn(),
    rescaleX: vi.fn(),
    rescaleY: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    toString: vi.fn(),
  }),
}));

vi.mock('d3', () => ({
  ...vi.importActual('d3-selection'),
  ...vi.importActual('d3-geo'),
  ...vi.importActual('d3-drag'),
  ...vi.importActual('d3-zoom'),
  scaleLinear: vi.fn().mockImplementation(() => ({
    domain: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    nice: vi.fn().mockReturnThis(),
    clamp: vi.fn().mockReturnThis(),
    invert: vi.fn().mockReturnValue(0),
    copy: vi.fn().mockReturnThis(),
    ticks: vi.fn().mockReturnValue([0, 1, 2, 3, 4, 5]),
    tickFormat: vi.fn().mockReturnValue(vi.fn()),
  })),
  scaleOrdinal: vi.fn().mockImplementation(() => ({
    domain: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    copy: vi.fn().mockReturnThis(),
  })),
  interpolate: vi.fn().mockReturnValue(vi.fn()),
  timer: vi.fn().mockImplementation((callback) => {
    const timerObj = {
      restart: vi.fn(),
      stop: vi.fn(),
    };
    // Simulate timer execution
    setTimeout(callback, 0);
    return timerObj;
  }),
  transition: vi.fn().mockReturnValue(mockD3Selection),
}));