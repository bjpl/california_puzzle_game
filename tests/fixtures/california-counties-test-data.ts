// Test fixture data for California counties
export const MOCK_CALIFORNIA_COUNTIES = [
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    population: 10014009,
    area: 4751,
    coordinates: { lat: 34.0522, lng: -118.2437 },
    region: 'Southern California',
    established: 1850,
    countyFIPS: '06037',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-118.6, 34.0],
        [-118.0, 34.0],
        [-118.0, 34.5],
        [-118.6, 34.5],
        [-118.6, 34.0]
      ]]
    }
  },
  {
    id: 'san-diego',
    name: 'San Diego',
    population: 3338330,
    area: 4526,
    coordinates: { lat: 32.7157, lng: -117.1611 },
    region: 'Southern California',
    established: 1850,
    countyFIPS: '06073',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-117.5, 32.5],
        [-116.9, 32.5],
        [-116.9, 33.0],
        [-117.5, 33.0],
        [-117.5, 32.5]
      ]]
    }
  },
  {
    id: 'orange',
    name: 'Orange',
    population: 3186989,
    area: 948,
    coordinates: { lat: 33.7175, lng: -117.8311 },
    region: 'Southern California',
    established: 1889,
    countyFIPS: '06059',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-118.0, 33.6],
        [-117.4, 33.6],
        [-117.4, 34.0],
        [-118.0, 34.0],
        [-118.0, 33.6]
      ]]
    }
  },
  {
    id: 'riverside',
    name: 'Riverside',
    population: 2418185,
    area: 7208,
    coordinates: { lat: 33.7206, lng: -115.8372 },
    region: 'Inland Empire',
    established: 1893,
    countyFIPS: '06065',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-117.0, 33.4],
        [-114.5, 33.4],
        [-114.5, 34.0],
        [-117.0, 34.0],
        [-117.0, 33.4]
      ]]
    }
  },
  {
    id: 'san-bernardino',
    name: 'San Bernardino',
    population: 2181654,
    area: 20105,
    coordinates: { lat: 34.8761, lng: -116.1056 },
    region: 'Inland Empire',
    established: 1853,
    countyFIPS: '06071',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-118.0, 34.0],
        [-114.0, 34.0],
        [-114.0, 36.0],
        [-118.0, 36.0],
        [-118.0, 34.0]
      ]]
    }
  },
  {
    id: 'santa-clara',
    name: 'Santa Clara',
    population: 1936259,
    area: 1291,
    coordinates: { lat: 37.3541, lng: -121.9552 },
    region: 'Bay Area',
    established: 1850,
    countyFIPS: '06085',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-122.2, 37.0],
        [-121.2, 37.0],
        [-121.2, 37.7],
        [-122.2, 37.7],
        [-122.2, 37.0]
      ]]
    }
  },
  {
    id: 'alameda',
    name: 'Alameda',
    population: 1682353,
    area: 739,
    coordinates: { lat: 37.6017, lng: -121.7195 },
    region: 'Bay Area',
    established: 1853,
    countyFIPS: '06001',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-122.4, 37.4],
        [-121.4, 37.4],
        [-121.4, 37.9],
        [-122.4, 37.9],
        [-122.4, 37.4]
      ]]
    }
  },
  {
    id: 'sacramento',
    name: 'Sacramento',
    population: 1585055,
    area: 966,
    coordinates: { lat: 38.4747, lng: -121.3542 },
    region: 'Central Valley',
    established: 1850,
    countyFIPS: '06067',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-121.8, 38.2],
        [-120.8, 38.2],
        [-120.8, 38.8],
        [-121.8, 38.8],
        [-121.8, 38.2]
      ]]
    }
  },
  {
    id: 'contra-costa',
    name: 'Contra Costa',
    population: 1165927,
    area: 720,
    coordinates: { lat: 37.9161, lng: -121.7195 },
    region: 'Bay Area',
    established: 1850,
    countyFIPS: '06013',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-122.5, 37.7],
        [-121.5, 37.7],
        [-121.5, 38.2],
        [-122.5, 38.2],
        [-122.5, 37.7]
      ]]
    }
  },
  {
    id: 'fresno',
    name: 'Fresno',
    population: 1008654,
    area: 5958,
    coordinates: { lat: 36.7378, lng: -119.7871 },
    region: 'Central Valley',
    established: 1856,
    countyFIPS: '06019',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-120.5, 36.0],
        [-118.8, 36.0],
        [-118.8, 37.5],
        [-120.5, 37.5],
        [-120.5, 36.0]
      ]]
    }
  }
];

export const MOCK_GAME_STATE = {
  mode: 'practice' as const,
  score: 0,
  correctAnswers: 0,
  totalQuestions: 0,
  timeElapsed: 0,
  difficulty: 'medium' as const,
  currentCounty: null as string | null,
  placedCounties: [] as string[],
  availableCounties: MOCK_CALIFORNIA_COUNTIES.map(county => county.id),
  isGameStarted: false,
  isGameCompleted: false,
  mistakes: 0,
  hints: 3,
  maxHints: 3,
};

export const MOCK_MAP_DIMENSIONS = {
  width: 800,
  height: 600,
  viewBox: {
    x: 0,
    y: 0,
    width: 800,
    height: 600
  },
  projection: {
    scale: 3000,
    center: [-119.4179, 36.7783],
    translate: [400, 300]
  }
};

export const MOCK_DRAG_EVENTS = {
  dragStart: {
    type: 'dragstart',
    dataTransfer: {
      setData: vi.fn(),
      getData: vi.fn(),
      effectAllowed: 'move'
    }
  },
  dragOver: {
    type: 'dragover',
    preventDefault: vi.fn(),
    dataTransfer: {
      dropEffect: 'move'
    }
  },
  drop: {
    type: 'drop',
    preventDefault: vi.fn(),
    dataTransfer: {
      getData: vi.fn().mockReturnValue('los-angeles')
    }
  }
};

export const MOCK_SCORING_CONFIG = {
  baseScore: 100,
  timeBonus: 50,
  accuracyBonus: 25,
  hintsUsedPenalty: 10,
  mistakesPenalty: 15,
  perfectGameBonus: 200,
  difficultyMultipliers: {
    easy: 0.8,
    medium: 1.0,
    hard: 1.3
  }
};

export const MOCK_PERFORMANCE_METRICS = {
  renderTime: 16.67, // 60fps target
  memoryUsage: {
    usedJSHeapSize: 10485760, // 10MB
    totalJSHeapSize: 20971520, // 20MB
    jsHeapSizeLimit: 4294967296 // 4GB
  },
  fps: 60,
  drawCalls: 58,
  nodeCount: 150
};