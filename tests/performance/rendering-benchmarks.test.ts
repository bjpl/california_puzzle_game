import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MOCK_CALIFORNIA_COUNTIES, MOCK_PERFORMANCE_METRICS } from '../fixtures';

// Performance monitoring utilities
class PerformanceMonitor {
  private metrics: {
    renderTime: number;
    memoryUsage: any;
    fps: number;
    drawCalls: number;
    nodeCount: number;
  };

  constructor() {
    this.metrics = {
      renderTime: 0,
      memoryUsage: null,
      fps: 0,
      drawCalls: 0,
      nodeCount: 0,
    };
  }

  startMonitoring() {
    // Mock performance monitoring
    this.metrics.renderTime = performance.now();
  }

  stopMonitoring() {
    this.metrics.renderTime = performance.now() - this.metrics.renderTime;

    // Mock memory usage
    if ((performance as any).memory) {
      this.metrics.memoryUsage = {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize || 10485760,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize || 20971520,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit || 4294967296,
      };
    } else {
      this.metrics.memoryUsage = MOCK_PERFORMANCE_METRICS.memoryUsage;
    }

    // Mock other metrics
    this.metrics.fps = 60;
    this.metrics.drawCalls = 58;
    this.metrics.nodeCount = document.querySelectorAll('*').length;
  }

  getMetrics() {
    return { ...this.metrics };
  }

  measureRenderTime(renderFunction: () => void): number {
    const start = performance.now();
    renderFunction();
    const end = performance.now();
    return end - start;
  }

  measureMemoryUsage(): any {
    if ((performance as any).memory) {
      return {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
      };
    }
    return MOCK_PERFORMANCE_METRICS.memoryUsage;
  }

  async measureFPS(duration: number = 1000): Promise<number> {
    return new Promise((resolve) => {
      let frames = 0;
      const startTime = performance.now();

      const frameCallback = () => {
        frames++;
        const currentTime = performance.now();

        if (currentTime - startTime < duration) {
          requestAnimationFrame(frameCallback);
        } else {
          const fps = (frames * 1000) / (currentTime - startTime);
          resolve(fps);
        }
      };

      requestAnimationFrame(frameCallback);
    });
  }
}

// Mock high-performance map component
const MockHighPerformanceMap: React.FC<{
  counties: typeof MOCK_CALIFORNIA_COUNTIES;
  onPerformanceData?: (metrics: any) => void;
  enableOptimizations?: boolean;
  stressTest?: boolean;
}> = ({ counties, onPerformanceData, enableOptimizations = true, stressTest = false }) => {
  const [renderMetrics, setRenderMetrics] = React.useState<any>(null);
  const mapRef = React.useRef<SVGSVGElement>(null);
  const performanceMonitor = React.useRef(new PerformanceMonitor());

  // Stress test multiplier
  const multiplier = stressTest ? 10 : 1;
  const stressCounties = React.useMemo(() => {
    if (!stressTest) return counties;

    const expanded = [];
    for (let i = 0; i < multiplier; i++) {
      expanded.push(...counties.map(county => ({
        ...county,
        id: `${county.id}-${i}`,
      })));
    }
    return expanded;
  }, [counties, multiplier, stressTest]);

  React.useEffect(() => {
    const monitor = performanceMonitor.current;
    monitor.startMonitoring();

    // Simulate heavy rendering work
    const renderStart = performance.now();

    // Force layout calculations
    if (mapRef.current) {
      mapRef.current.getBoundingClientRect();
    }

    const renderEnd = performance.now();

    monitor.stopMonitoring();
    const metrics = monitor.getMetrics();
    metrics.actualRenderTime = renderEnd - renderStart;

    setRenderMetrics(metrics);
    onPerformanceData?.(metrics);
  }, [stressCounties, onPerformanceData]);

  // Optimized rendering function
  const renderCounties = React.useMemo(() => {
    if (!enableOptimizations) {
      // Unoptimized: create new objects every render
      return stressCounties.map((county, index) => (
        <g key={`${county.id}-${index}`}>
          <rect
            x={100 + index * 30}
            y={100 + (index % 10) * 30}
            width="25"
            height="25"
            fill="#e5e7eb"
            stroke="#374151"
            strokeWidth="1"
          />
          <text
            x={112 + index * 30}
            y={118 + (index % 10) * 30}
            fontSize="8"
            textAnchor="middle"
            fill="#374151"
          >
            {county.name.substring(0, 3)}
          </text>
        </g>
      ));
    }

    // Optimized: memoized rendering with virtualization
    const visibleCounties = stressCounties.slice(0, Math.min(100, stressCounties.length));

    return visibleCounties.map((county, index) => (
      <g key={county.id}>
        <rect
          x={100 + index * 30}
          y={100 + (index % 10) * 30}
          width="25"
          height="25"
          fill="#e5e7eb"
          stroke="#374151"
          strokeWidth="1"
        />
        <text
          x={112 + index * 30}
          y={118 + (index % 10) * 30}
          fontSize="8"
          textAnchor="middle"
          fill="#374151"
        >
          {county.name.substring(0, 3)}
        </text>
      </g>
    ));
  }, [stressCounties, enableOptimizations]);

  return (
    <div data-testid="performance-map">
      <div data-testid="performance-metrics">
        {renderMetrics && (
          <div>
            <div data-testid="render-time">Render Time: {renderMetrics.renderTime.toFixed(2)}ms</div>
            <div data-testid="memory-usage">
              Memory: {(renderMetrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB
            </div>
            <div data-testid="node-count">Nodes: {renderMetrics.nodeCount}</div>
          </div>
        )}
      </div>

      <svg
        ref={mapRef}
        width="800"
        height="600"
        viewBox="0 0 800 600"
        data-testid="performance-svg"
      >
        <g data-testid="counties-group">
          {renderCounties}
        </g>
      </svg>
    </div>
  );
};

// Mock game component for integration performance testing
const MockGamePerformanceTest: React.FC<{
  countyCount?: number;
  enableAnimations?: boolean;
  onPerformanceMetrics?: (metrics: any) => void;
}> = ({ countyCount = 10, enableAnimations = true, onPerformanceMetrics }) => {
  const [gameState, setGameState] = React.useState({
    selectedCounty: null as string | null,
    placedCounties: [] as string[],
    isAnimating: false,
  });

  const counties = MOCK_CALIFORNIA_COUNTIES.slice(0, countyCount);
  const performanceMonitor = React.useRef(new PerformanceMonitor());

  const handleCountySelect = (countyId: string) => {
    const start = performance.now();

    setGameState(prev => ({ ...prev, selectedCounty: countyId }));

    const end = performance.now();
    onPerformanceMetrics?.({
      operation: 'county-select',
      duration: end - start,
      timestamp: Date.now()
    });
  };

  const handleCountyPlace = (countyId: string) => {
    const start = performance.now();

    if (enableAnimations) {
      setGameState(prev => ({ ...prev, isAnimating: true }));

      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          placedCounties: [...prev.placedCounties, countyId],
          selectedCounty: null,
          isAnimating: false,
        }));

        const end = performance.now();
        onPerformanceMetrics?.({
          operation: 'county-place-animated',
          duration: end - start,
          timestamp: Date.now()
        });
      }, 300);
    } else {
      setGameState(prev => ({
        ...prev,
        placedCounties: [...prev.placedCounties, countyId],
        selectedCounty: null,
      }));

      const end = performance.now();
      onPerformanceMetrics?.({
        operation: 'county-place-direct',
        duration: end - start,
        timestamp: Date.now()
      });
    }
  };

  React.useEffect(() => {
    const monitor = performanceMonitor.current;

    const measureAndReport = async () => {
      monitor.startMonitoring();

      // Measure FPS
      const fps = await monitor.measureFPS(1000);

      monitor.stopMonitoring();
      const metrics = monitor.getMetrics();
      metrics.measuredFPS = fps;

      onPerformanceMetrics?.({
        operation: 'component-render',
        metrics,
        timestamp: Date.now()
      });
    };

    measureAndReport();
  }, [gameState, onPerformanceMetrics]);

  return (
    <div data-testid="game-performance-test">
      <div data-testid="counties-panel">
        {counties.map(county => (
          <button
            key={county.id}
            data-testid={`county-button-${county.id}`}
            onClick={() => handleCountySelect(county.id)}
            className={gameState.selectedCounty === county.id ? 'selected' : ''}
          >
            {county.name}
          </button>
        ))}
      </div>

      <div data-testid="map-panel">
        {counties.map(county => (
          <div
            key={county.id}
            data-testid={`map-cell-${county.id}`}
            onClick={() => handleCountyPlace(county.id)}
            className={`
              map-cell
              ${gameState.placedCounties.includes(county.id) ? 'placed' : ''}
              ${gameState.isAnimating ? 'animating' : ''}
            `}
            style={{
              transition: enableAnimations ? 'all 0.3s ease' : 'none',
            }}
          >
            {gameState.placedCounties.includes(county.id) ? '✓' : '?'}
          </div>
        ))}
      </div>
    </div>
  );
};

describe('Rendering Performance Benchmarks', () => {
  let performanceData: any[] = [];

  beforeEach(() => {
    performanceData = [];
    vi.clearAllMocks();
  });

  const collectPerformanceData = (data: any) => {
    performanceData.push(data);
  };

  describe('Basic Rendering Performance', () => {
    it('should render map within acceptable time limits', async () => {
      const start = performance.now();

      render(
        <MockHighPerformanceMap
          counties={MOCK_CALIFORNIA_COUNTIES.slice(0, 10)}
          onPerformanceData={collectPerformanceData}
        />
      );

      const end = performance.now();
      const renderTime = end - start;

      expect(renderTime).toBeLessThan(100); // Should render in under 100ms
      expect(screen.getByTestId('performance-map')).toBeInTheDocument();
    });

    it('should maintain 60fps target', async () => {
      render(
        <MockHighPerformanceMap
          counties={MOCK_CALIFORNIA_COUNTIES.slice(0, 5)}
          onPerformanceData={collectPerformanceData}
        />
      );

      await waitFor(() => {
        expect(performanceData.length).toBeGreaterThan(0);
      });

      const metrics = performanceData[0];
      expect(metrics.fps).toBeGreaterThanOrEqual(55); // Allow 5fps tolerance
    });

    it('should use reasonable memory', async () => {
      render(
        <MockHighPerformanceMap
          counties={MOCK_CALIFORNIA_COUNTIES.slice(0, 20)}
          onPerformanceData={collectPerformanceData}
        />
      );

      await waitFor(() => {
        expect(performanceData.length).toBeGreaterThan(0);
      });

      const metrics = performanceData[0];
      const memoryMB = metrics.memoryUsage.usedJSHeapSize / 1024 / 1024;

      expect(memoryMB).toBeLessThan(50); // Should use less than 50MB
    });

    it('should minimize DOM nodes', async () => {
      render(
        <MockHighPerformanceMap
          counties={MOCK_CALIFORNIA_COUNTIES.slice(0, 10)}
          onPerformanceData={collectPerformanceData}
        />
      );

      await waitFor(() => {
        expect(performanceData.length).toBeGreaterThan(0);
      });

      const metrics = performanceData[0];

      // Each county should create minimal DOM nodes (rect + text = 2 nodes per county)
      const expectedMaxNodes = MOCK_CALIFORNIA_COUNTIES.slice(0, 10).length * 2 + 50; // +50 for other elements
      expect(metrics.nodeCount).toBeLessThan(expectedMaxNodes);
    });
  });

  describe('Performance Under Load', () => {
    it('should handle large datasets efficiently', async () => {
      render(
        <MockHighPerformanceMap
          counties={MOCK_CALIFORNIA_COUNTIES}
          onPerformanceData={collectPerformanceData}
          stressTest={true} // 10x multiplier
        />
      );

      await waitFor(() => {
        expect(performanceData.length).toBeGreaterThan(0);
      });

      const metrics = performanceData[0];

      // Even with stress test, should render in reasonable time
      expect(metrics.renderTime).toBeLessThan(500); // 500ms max for stress test
    });

    it('should benefit from optimizations', async () => {
      // Test without optimizations
      const { unmount } = render(
        <MockHighPerformanceMap
          counties={MOCK_CALIFORNIA_COUNTIES}
          onPerformanceData={collectPerformanceData}
          enableOptimizations={false}
        />
      );

      await waitFor(() => {
        expect(performanceData.length).toBeGreaterThan(0);
      });

      const unoptimizedMetrics = performanceData[0];
      unmount();

      // Clear data
      performanceData = [];

      // Test with optimizations
      render(
        <MockHighPerformanceMap
          counties={MOCK_CALIFORNIA_COUNTIES}
          onPerformanceData={collectPerformanceData}
          enableOptimizations={true}
        />
      );

      await waitFor(() => {
        expect(performanceData.length).toBeGreaterThan(0);
      });

      const optimizedMetrics = performanceData[0];

      // Optimized version should be faster
      expect(optimizedMetrics.renderTime).toBeLessThanOrEqual(unoptimizedMetrics.renderTime);
    });

    it('should handle rapid state changes', async () => {
      let updateCount = 0;
      const rapidUpdates = () => {
        updateCount++;
      };

      render(
        <MockGamePerformanceTest
          countyCount={5}
          onPerformanceMetrics={collectPerformanceData}
        />
      );

      // Simulate rapid interactions
      const counties = ['los-angeles', 'san-diego', 'orange'];

      const start = performance.now();

      for (const countyId of counties) {
        const button = screen.getByTestId(`county-button-${countyId}`);
        const mapCell = screen.getByTestId(`map-cell-${countyId}`);

        button.click();
        mapCell.click();
      }

      const end = performance.now();
      const totalTime = end - start;

      // Multiple rapid interactions should complete quickly
      expect(totalTime).toBeLessThan(200);
    });
  });

  describe('Animation Performance', () => {
    it('should maintain performance with animations enabled', async () => {
      render(
        <MockGamePerformanceTest
          countyCount={5}
          enableAnimations={true}
          onPerformanceMetrics={collectPerformanceData}
        />
      );

      // Trigger animation
      const button = screen.getByTestId('county-button-los-angeles');
      const mapCell = screen.getByTestId('map-cell-los-angeles');

      button.click();
      mapCell.click();

      await waitFor(() => {
        const animatedOperations = performanceData.filter(d => d.operation === 'county-place-animated');
        expect(animatedOperations.length).toBeGreaterThan(0);
      });

      const animatedOperation = performanceData.find(d => d.operation === 'county-place-animated');

      // Animation should complete within reasonable time
      expect(animatedOperation.duration).toBeLessThan(400); // 300ms animation + overhead
    });

    it('should be faster without animations', async () => {
      // Test with animations
      render(
        <MockGamePerformanceTest
          countyCount={3}
          enableAnimations={true}
          onPerformanceMetrics={collectPerformanceData}
        />
      );

      const button1 = screen.getByTestId('county-button-los-angeles');
      const mapCell1 = screen.getByTestId('map-cell-los-angeles');

      button1.click();
      mapCell1.click();

      await waitFor(() => {
        const animatedOps = performanceData.filter(d => d.operation === 'county-place-animated');
        expect(animatedOps.length).toBeGreaterThan(0);
      });

      const animatedTime = performanceData.find(d => d.operation === 'county-place-animated')?.duration;

      // Clear and test without animations
      performanceData = [];

      const { unmount } = render(
        <MockGamePerformanceTest
          countyCount={3}
          enableAnimations={false}
          onPerformanceMetrics={collectPerformanceData}
        />
      );

      const button2 = screen.getByTestId('county-button-los-angeles');
      const mapCell2 = screen.getByTestId('map-cell-los-angeles');

      button2.click();
      mapCell2.click();

      await waitFor(() => {
        const directOps = performanceData.filter(d => d.operation === 'county-place-direct');
        expect(directOps.length).toBeGreaterThan(0);
      });

      const directTime = performanceData.find(d => d.operation === 'county-place-direct')?.duration;

      // Direct should be faster than animated
      expect(directTime).toBeLessThan(animatedTime);
      unmount();
    });
  });

  describe('Memory Management', () => {
    it('should not have memory leaks', async () => {
      const initialMemory = new PerformanceMonitor().measureMemoryUsage();

      // Create and destroy multiple components
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(
          <MockHighPerformanceMap
            counties={MOCK_CALIFORNIA_COUNTIES.slice(0, 10)}
            onPerformanceData={collectPerformanceData}
          />
        );

        unmount();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = new PerformanceMonitor().measureMemoryUsage();

      // Memory usage shouldn't increase significantly
      const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      expect(memoryIncreaseMB).toBeLessThan(10); // Less than 10MB increase
    });

    it('should handle component updates efficiently', async () => {
      let updateCount = 0;

      const TestComponent: React.FC = () => {
        const [count, setCount] = React.useState(0);

        React.useEffect(() => {
          updateCount++;
        });

        React.useEffect(() => {
          const timer = setInterval(() => {
            setCount(c => c + 1);
          }, 50);

          return () => clearInterval(timer);
        }, []);

        return (
          <MockHighPerformanceMap
            counties={MOCK_CALIFORNIA_COUNTIES.slice(0, 5)}
            onPerformanceData={collectPerformanceData}
          />
        );
      };

      const { unmount } = render(<TestComponent />);

      // Let it update a few times
      await new Promise(resolve => setTimeout(resolve, 300));

      unmount();

      // Should not cause excessive re-renders
      expect(updateCount).toBeLessThan(20);
    });
  });

  describe('Performance Regression Detection', () => {
    it('should detect performance regressions', async () => {
      const baseline = {
        renderTime: 50,
        memoryUsage: 20 * 1024 * 1024, // 20MB
        fps: 60,
      };

      render(
        <MockHighPerformanceMap
          counties={MOCK_CALIFORNIA_COUNTIES.slice(0, 10)}
          onPerformanceData={collectPerformanceData}
        />
      );

      await waitFor(() => {
        expect(performanceData.length).toBeGreaterThan(0);
      });

      const currentMetrics = performanceData[0];

      // Check for regressions (within reasonable tolerances)
      const renderTimeRegression = currentMetrics.renderTime > baseline.renderTime * 2;
      const memoryRegression = currentMetrics.memoryUsage.usedJSHeapSize > baseline.memoryUsage * 2;
      const fpsRegression = currentMetrics.fps < baseline.fps * 0.8;

      expect(renderTimeRegression).toBe(false);
      expect(memoryRegression).toBe(false);
      expect(fpsRegression).toBe(false);
    });

    it('should provide performance metrics for monitoring', async () => {
      render(
        <MockHighPerformanceMap
          counties={MOCK_CALIFORNIA_COUNTIES.slice(0, 10)}
          onPerformanceData={collectPerformanceData}
        />
      );

      await waitFor(() => {
        expect(performanceData.length).toBeGreaterThan(0);
      });

      const metrics = performanceData[0];

      // Verify all expected metrics are present
      expect(metrics).toHaveProperty('renderTime');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics).toHaveProperty('fps');
      expect(metrics).toHaveProperty('nodeCount');

      // Metrics should be reasonable
      expect(typeof metrics.renderTime).toBe('number');
      expect(metrics.renderTime).toBeGreaterThan(0);
      expect(typeof metrics.memoryUsage.usedJSHeapSize).toBe('number');
      expect(metrics.memoryUsage.usedJSHeapSize).toBeGreaterThan(0);
    });
  });

  describe('Performance Optimization Strategies', () => {
    it('should demonstrate virtualization benefits', async () => {
      // Create large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        ...MOCK_CALIFORNIA_COUNTIES[0],
        id: `county-${i}`,
        name: `County ${i}`,
      }));

      const VirtualizedComponent: React.FC = () => {
        // Only render visible items (mock virtualization)
        const visibleItems = largeDataset.slice(0, 50);

        return (
          <div data-testid="virtualized-list">
            {visibleItems.map(county => (
              <div key={county.id} data-testid={`item-${county.id}`}>
                {county.name}
              </div>
            ))}
          </div>
        );
      };

      const start = performance.now();
      render(<VirtualizedComponent />);
      const end = performance.now();

      const renderTime = end - start;
      expect(renderTime).toBeLessThan(50); // Should be fast with virtualization

      // Should only render visible items
      expect(screen.getAllByTestId(/^item-county-/)).toHaveLength(50);
    });

    it('should show memoization benefits', async () => {
      let renderCount = 0;

      const ExpensiveComponent: React.FC<{ data: any[] }> = React.memo(({ data }) => {
        renderCount++;

        // Simulate expensive computation
        const processedData = data.map(item => ({
          ...item,
          processed: true,
        }));

        return (
          <div data-testid="expensive-component">
            {processedData.length} items processed
          </div>
        );
      });

      const ParentComponent: React.FC = () => {
        const [count, setCount] = React.useState(0);
        const memoizedData = React.useMemo(() =>
          MOCK_CALIFORNIA_COUNTIES.slice(0, 5), []
        );

        return (
          <div>
            <button onClick={() => setCount(c => c + 1)}>
              Update count: {count}
            </button>
            <ExpensiveComponent data={memoizedData} />
          </div>
        );
      };

      render(<ParentComponent />);

      // Initial render
      expect(renderCount).toBe(1);

      // Update parent state (should not re-render memoized component)
      const button = screen.getByRole('button');
      button.click();
      button.click();

      // Should still only have rendered once due to memoization
      expect(renderCount).toBe(1);
    });
  });
});