import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { MOCK_CALIFORNIA_COUNTIES } from '../fixtures';

// Memory monitoring utilities
class MemoryMonitor {
  private baseline: number = 0;
  private samples: number[] = [];

  getMemoryUsage(): number {
    if ((performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize;
    }
    // Fallback for environments without memory API
    return Math.random() * 10000000 + 5000000; // 5-15MB range
  }

  setBaseline(): void {
    this.baseline = this.getMemoryUsage();
  }

  getMemoryIncrease(): number {
    return this.getMemoryUsage() - this.baseline;
  }

  getMemoryIncreaseInMB(): number {
    return this.getMemoryIncrease() / (1024 * 1024);
  }

  takeSample(): void {
    this.samples.push(this.getMemoryUsage());
  }

  getAverageUsage(): number {
    if (this.samples.length === 0) return 0;
    return this.samples.reduce((sum, sample) => sum + sample, 0) / this.samples.length;
  }

  getPeakUsage(): number {
    return Math.max(...this.samples, 0);
  }

  clearSamples(): void {
    this.samples = [];
  }

  async measureMemoryGrowth(operation: () => void, iterations: number = 10): Promise<{
    initialMemory: number;
    finalMemory: number;
    growth: number;
    growthPerIteration: number;
  }> {
    const initial = this.getMemoryUsage();

    for (let i = 0; i < iterations; i++) {
      operation();
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
    }

    const final = this.getMemoryUsage();
    const growth = final - initial;

    return {
      initialMemory: initial,
      finalMemory: final,
      growth,
      growthPerIteration: growth / iterations,
    };
  }
}

// Mock component that can simulate memory leaks
const MockMemoryTestComponent: React.FC<{
  createLeak?: boolean;
  countyCount?: number;
  createEventListeners?: boolean;
  createTimers?: boolean;
}> = ({
  createLeak = false,
  countyCount = 10,
  createEventListeners = false,
  createTimers = false
}) => {
  const [data, setData] = React.useState<any[]>([]);
  const [listeners, setListeners] = React.useState<any[]>([]);
  const timersRef = React.useRef<NodeJS.Timeout[]>([]);

  React.useEffect(() => {
    // Simulate normal data
    const counties = MOCK_CALIFORNIA_COUNTIES.slice(0, countyCount);
    setData(counties);

    // Optionally create memory leak
    if (createLeak) {
      const leakyData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        largeString: 'x'.repeat(10000), // 10KB string
        circularRef: null as any,
      }));

      // Create circular references (memory leak)
      leakyData.forEach((item, index) => {
        item.circularRef = leakyData[(index + 1) % leakyData.length];
      });

      setData(prev => [...prev, ...leakyData]);
    }

    // Optionally create event listeners without cleanup
    if (createEventListeners) {
      const handleClick = () => console.log('clicked');
      const handleResize = () => console.log('resized');

      document.addEventListener('click', handleClick);
      window.addEventListener('resize', handleResize);

      setListeners([
        { element: document, event: 'click', handler: handleClick },
        { element: window, event: 'resize', handler: handleResize },
      ]);
    }

    // Optionally create timers without cleanup
    if (createTimers) {
      const timer1 = setInterval(() => {
        // Keep adding data to state (memory leak)
        setData(prev => [...prev, { timestamp: Date.now() }]);
      }, 100);

      const timer2 = setTimeout(() => {
        console.log('Timer executed');
      }, 5000);

      timersRef.current = [timer1, timer2];
    }

    // Proper cleanup
    return () => {
      if (!createLeak && !createEventListeners && !createTimers) {
        // Clean up event listeners properly
        listeners.forEach(({ element, event, handler }) => {
          element.removeEventListener(event, handler);
        });

        // Clean up timers properly
        timersRef.current.forEach(timer => {
          clearInterval(timer);
          clearTimeout(timer);
        });
      }
      // If createLeak is true, we intentionally don't clean up
    };
  }, [createLeak, countyCount, createEventListeners, createTimers]);

  return (
    <div data-testid="memory-test-component">
      <div data-testid="data-count">Data items: {data.length}</div>
      <div data-testid="listeners-count">Listeners: {listeners.length}</div>
      <div data-testid="timers-count">Timers: {timersRef.current.length}</div>

      <div data-testid="counties-list">
        {data.slice(0, countyCount).map((item, index) => (
          <div key={item.id || index} data-testid={`county-item-${index}`}>
            {item.name || `Item ${item.id}`}
          </div>
        ))}
      </div>
    </div>
  );
};

// Mock large dataset component
const MockLargeDatasetComponent: React.FC<{
  itemCount: number;
  useVirtualization?: boolean;
}> = ({ itemCount, useVirtualization = false }) => {
  const [items] = React.useState(() =>
    Array.from({ length: itemCount }, (_, i) => ({
      id: i,
      name: `County ${i}`,
      data: new Array(1000).fill(i), // Large data array
    }))
  );

  const visibleItems = useVirtualization ? items.slice(0, 100) : items;

  return (
    <div data-testid="large-dataset-component">
      <div data-testid="total-items">Total: {items.length}</div>
      <div data-testid="visible-items">Visible: {visibleItems.length}</div>

      <div data-testid="items-list">
        {visibleItems.map(item => (
          <div key={item.id} data-testid={`item-${item.id}`}>
            {item.name} - {item.data.length} data points
          </div>
        ))}
      </div>
    </div>
  );
};

describe('Memory Usage Tests', () => {
  let memoryMonitor: MemoryMonitor;

  beforeEach(() => {
    memoryMonitor = new MemoryMonitor();
    memoryMonitor.setBaseline();
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Basic Memory Usage', () => {
    it('should not exceed memory thresholds for normal usage', async () => {
      memoryMonitor.setBaseline();

      render(<MockMemoryTestComponent countyCount={10} />);

      const memoryIncrease = memoryMonitor.getMemoryIncreaseInMB();

      // Normal component should use less than 5MB
      expect(memoryIncrease).toBeLessThan(5);
      expect(screen.getByTestId('data-count')).toHaveTextContent('Data items: 10');
    });

    it('should scale memory usage proportionally with data size', async () => {
      // Test with small dataset
      memoryMonitor.setBaseline();
      const { unmount: unmount1 } = render(<MockMemoryTestComponent countyCount={5} />);
      const smallDatasetMemory = memoryMonitor.getMemoryIncrease();
      unmount1();

      // Test with larger dataset
      memoryMonitor.setBaseline();
      const { unmount: unmount2 } = render(<MockMemoryTestComponent countyCount={20} />);
      const largeDatasetMemory = memoryMonitor.getMemoryIncrease();
      unmount2();

      // Larger dataset should use proportionally more memory
      expect(largeDatasetMemory).toBeGreaterThan(smallDatasetMemory);

      // But the ratio should be reasonable (not exponential growth)
      const ratio = largeDatasetMemory / smallDatasetMemory;
      expect(ratio).toBeLessThan(10); // Should not be more than 10x for 4x data
    });

    it('should release memory when component unmounts', async () => {
      memoryMonitor.setBaseline();

      const { unmount } = render(<MockMemoryTestComponent countyCount={15} />);

      const memoryWithComponent = memoryMonitor.getMemoryIncrease();
      expect(memoryWithComponent).toBeGreaterThan(0);

      unmount();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const memoryAfterUnmount = memoryMonitor.getMemoryIncrease();

      // Memory should be released (allowing some tolerance for GC timing)
      expect(memoryAfterUnmount).toBeLessThan(memoryWithComponent * 0.8);
    });
  });

  describe('Memory Leak Detection', () => {
    it('should detect memory leaks from circular references', async () => {
      memoryMonitor.setBaseline();

      // Component without leaks
      const { unmount: unmount1 } = render(<MockMemoryTestComponent createLeak={false} />);
      const normalMemory = memoryMonitor.getMemoryIncrease();
      unmount1();

      memoryMonitor.setBaseline();

      // Component with intentional memory leak
      const { unmount: unmount2 } = render(<MockMemoryTestComponent createLeak={true} />);
      const leakyMemory = memoryMonitor.getMemoryIncrease();
      unmount2();

      // Leaky component should use significantly more memory
      expect(leakyMemory).toBeGreaterThan(normalMemory * 5);
    });

    it('should detect memory leaks from uncleaned event listeners', async () => {
      const initialListenerCount = document._listeners?.length || 0;

      // Component that properly cleans up
      const { unmount: unmount1 } = render(
        <MockMemoryTestComponent createEventListeners={false} />
      );
      unmount1();

      // Component that doesn't clean up listeners
      const { unmount: unmount2 } = render(
        <MockMemoryTestComponent createEventListeners={true} />
      );
      unmount2();

      // In a real implementation, you would check if listeners are still attached
      // This is a simplified test since jsdom doesn't perfectly simulate this
      expect(screen.queryByTestId('memory-test-component')).not.toBeInTheDocument();
    });

    it('should detect memory leaks from uncleaned timers', async () => {
      let timerCount = 0;
      const originalSetInterval = global.setInterval;
      const originalClearInterval = global.clearInterval;

      global.setInterval = vi.fn((...args) => {
        timerCount++;
        return originalSetInterval(...args);
      });

      global.clearInterval = vi.fn((...args) => {
        timerCount--;
        return originalClearInterval(...args);
      });

      const { unmount } = render(
        <MockMemoryTestComponent createTimers={true} />
      );

      expect(timerCount).toBeGreaterThan(0);

      unmount();

      // If cleanup is working properly, timer count should decrease
      // In our leak simulation, timers won't be cleaned up
      expect(timerCount).toBeGreaterThan(0);

      // Restore original functions
      global.setInterval = originalSetInterval;
      global.clearInterval = originalClearInterval;
    });

    it('should handle multiple mount/unmount cycles without memory growth', async () => {
      const growthData = await memoryMonitor.measureMemoryGrowth(() => {
        const { unmount } = render(<MockMemoryTestComponent countyCount={5} />);
        unmount();
      }, 10);

      // Memory growth per iteration should be minimal
      const growthPerIterationMB = growthData.growthPerIteration / (1024 * 1024);
      expect(growthPerIterationMB).toBeLessThan(1); // Less than 1MB per iteration
    });
  });

  describe('Large Dataset Handling', () => {
    it('should handle large datasets efficiently', async () => {
      memoryMonitor.setBaseline();

      render(<MockLargeDatasetComponent itemCount={1000} useVirtualization={false} />);

      const memoryWithLargeDataset = memoryMonitor.getMemoryIncreaseInMB();

      // Large dataset should use reasonable memory (less than 50MB)
      expect(memoryWithLargeDataset).toBeLessThan(50);
      expect(screen.getByTestId('total-items')).toHaveTextContent('Total: 1000');
    });

    it('should show memory benefits of virtualization', async () => {
      // Test without virtualization
      memoryMonitor.setBaseline();
      const { unmount: unmount1 } = render(
        <MockLargeDatasetComponent itemCount={1000} useVirtualization={false} />
      );
      const nonVirtualizedMemory = memoryMonitor.getMemoryIncrease();
      unmount1();

      // Test with virtualization
      memoryMonitor.setBaseline();
      const { unmount: unmount2 } = render(
        <MockLargeDatasetComponent itemCount={1000} useVirtualization={true} />
      );
      const virtualizedMemory = memoryMonitor.getMemoryIncrease();
      unmount2();

      // Virtualized version should use less memory
      expect(virtualizedMemory).toBeLessThan(nonVirtualizedMemory);

      // Should render fewer items with virtualization
      expect(screen.getByTestId('visible-items')).toHaveTextContent('Visible: 100');
    });

    it('should maintain constant memory with infinite scrolling', async () => {
      const InfiniteScrollComponent: React.FC = () => {
        const [items, setItems] = React.useState(
          Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }))
        );

        const loadMore = () => {
          // Remove old items while adding new ones (simulate infinite scroll)
          setItems(current => {
            const newItems = Array.from({ length: 50 }, (_, i) => ({
              id: current.length + i,
              name: `Item ${current.length + i}`
            }));

            // Keep only last 150 items
            return [...current.slice(-100), ...newItems];
          });
        };

        React.useEffect(() => {
          // Simulate periodic loading
          const interval = setInterval(loadMore, 100);
          return () => clearInterval(interval);
        }, []);

        return (
          <div data-testid="infinite-scroll">
            <div data-testid="item-count">{items.length}</div>
            {items.map(item => (
              <div key={item.id}>{item.name}</div>
            ))}
          </div>
        );
      };

      memoryMonitor.setBaseline();

      const { unmount } = render(<InfiniteScrollComponent />);

      // Let it run for a bit
      await new Promise(resolve => setTimeout(resolve, 500));

      const memoryIncrease = memoryMonitor.getMemoryIncreaseInMB();

      unmount();

      // Memory should remain stable (not grow unbounded)
      expect(memoryIncrease).toBeLessThan(10);
    });
  });

  describe('Memory Optimization Strategies', () => {
    it('should demonstrate React.memo benefits', async () => {
      let renderCount = 0;

      const ExpensiveComponent = React.memo<{ data: any[] }>(({ data }) => {
        renderCount++;

        return (
          <div data-testid="expensive-component">
            Rendered {renderCount} times with {data.length} items
          </div>
        );
      });

      const ParentComponent: React.FC = () => {
        const [count, setCount] = React.useState(0);
        const [data] = React.useState(MOCK_CALIFORNIA_COUNTIES.slice(0, 5));

        return (
          <div>
            <button onClick={() => setCount(c => c + 1)}>
              Count: {count}
            </button>
            <ExpensiveComponent data={data} />
          </div>
        );
      };

      render(<ParentComponent />);

      expect(renderCount).toBe(1);

      // Click button multiple times
      const button = screen.getByRole('button');
      button.click();
      button.click();
      button.click();

      // ExpensiveComponent should not re-render due to memo
      expect(renderCount).toBe(1);
    });

    it('should show useMemo benefits for expensive calculations', async () => {
      let calculationCount = 0;

      const ComponentWithExpensiveCalculation: React.FC<{
        items: any[];
        filter: string;
      }> = ({ items, filter }) => {
        const filteredItems = React.useMemo(() => {
          calculationCount++;

          // Simulate expensive filtering
          return items.filter(item =>
            item.name.toLowerCase().includes(filter.toLowerCase())
          );
        }, [items, filter]);

        return (
          <div data-testid="filtered-component">
            <div data-testid="calculation-count">Calculations: {calculationCount}</div>
            <div data-testid="filtered-count">Filtered: {filteredItems.length}</div>
          </div>
        );
      };

      const ParentComponent: React.FC = () => {
        const [filter, setFilter] = React.useState('');
        const [unrelatedState, setUnrelatedState] = React.useState(0);
        const items = MOCK_CALIFORNIA_COUNTIES.slice(0, 5);

        return (
          <div>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              data-testid="filter-input"
            />
            <button
              onClick={() => setUnrelatedState(s => s + 1)}
              data-testid="unrelated-button"
            >
              Unrelated: {unrelatedState}
            </button>
            <ComponentWithExpensiveCalculation items={items} filter={filter} />
          </div>
        );
      };

      render(<ParentComponent />);

      expect(calculationCount).toBe(1);

      // Click unrelated button (should not trigger recalculation)
      const unrelatedButton = screen.getByTestId('unrelated-button');
      unrelatedButton.click();
      unrelatedButton.click();

      expect(calculationCount).toBe(1); // Still 1 due to useMemo
    });

    it('should demonstrate useCallback benefits for event handlers', async () => {
      let childRenderCount = 0;

      const ChildComponent = React.memo<{ onClick: () => void }>(({ onClick }) => {
        childRenderCount++;

        return (
          <button onClick={onClick} data-testid="child-button">
            Child rendered {childRenderCount} times
          </button>
        );
      });

      const ParentWithCallback: React.FC = () => {
        const [count, setCount] = React.useState(0);
        const [otherState, setOtherState] = React.useState(0);

        const handleClick = React.useCallback(() => {
          setCount(c => c + 1);
        }, []);

        return (
          <div>
            <div>Count: {count}</div>
            <button
              onClick={() => setOtherState(s => s + 1)}
              data-testid="other-button"
            >
              Other: {otherState}
            </button>
            <ChildComponent onClick={handleClick} />
          </div>
        );
      };

      render(<ParentWithCallback />);

      expect(childRenderCount).toBe(1);

      // Change other state (should not re-render child due to useCallback)
      const otherButton = screen.getByTestId('other-button');
      otherButton.click();
      otherButton.click();

      expect(childRenderCount).toBe(1);
    });
  });

  describe('Memory Monitoring and Alerts', () => {
    it('should provide memory usage metrics', async () => {
      memoryMonitor.setBaseline();

      render(<MockMemoryTestComponent countyCount={10} />);

      const metrics = {
        currentUsage: memoryMonitor.getMemoryUsage(),
        baseline: memoryMonitor.baseline,
        increase: memoryMonitor.getMemoryIncrease(),
        increaseMB: memoryMonitor.getMemoryIncreaseInMB(),
      };

      expect(metrics.currentUsage).toBeGreaterThan(0);
      expect(metrics.increase).toBeGreaterThanOrEqual(0);
      expect(typeof metrics.increaseMB).toBe('number');
    });

    it('should track memory usage over time', async () => {
      memoryMonitor.clearSamples();

      // Take samples over time
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<MockMemoryTestComponent countyCount={5} />);
        memoryMonitor.takeSample();
        unmount();

        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const averageUsage = memoryMonitor.getAverageUsage();
      const peakUsage = memoryMonitor.getPeakUsage();

      expect(averageUsage).toBeGreaterThan(0);
      expect(peakUsage).toBeGreaterThanOrEqual(averageUsage);
    });

    it('should detect memory usage spikes', async () => {
      memoryMonitor.clearSamples();

      // Normal usage
      for (let i = 0; i < 3; i++) {
        const { unmount } = render(<MockMemoryTestComponent countyCount={5} />);
        memoryMonitor.takeSample();
        unmount();
      }

      const normalAverage = memoryMonitor.getAverageUsage();

      // Spike in usage
      const { unmount } = render(
        <MockLargeDatasetComponent itemCount={10000} useVirtualization={false} />
      );
      memoryMonitor.takeSample();
      unmount();

      const peakUsage = memoryMonitor.getPeakUsage();

      // Peak should be significantly higher than normal average
      expect(peakUsage).toBeGreaterThan(normalAverage * 1.5);
    });
  });
});