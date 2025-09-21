import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MOCK_CALIFORNIA_COUNTIES, MOCK_MAP_DIMENSIONS } from '../../fixtures';
import '../../mocks/d3-mocks';

// Mock California Map Component
const MockCaliforniaMap = React.forwardRef<SVGSVGElement, {
  counties: typeof MOCK_CALIFORNIA_COUNTIES;
  dimensions: typeof MOCK_MAP_DIMENSIONS;
  onCountyClick?: (countyId: string) => void;
  onCountyHover?: (countyId: string | null) => void;
  selectedCounty?: string | null;
  highlightedCounty?: string | null;
  placedCounties?: string[];
  isInteractive?: boolean;
}>(({
  counties,
  dimensions,
  onCountyClick,
  onCountyHover,
  selectedCounty,
  highlightedCounty,
  placedCounties = [],
  isInteractive = true
}, ref) => {
  return (
    <svg
      ref={ref}
      width={dimensions.width}
      height={dimensions.height}
      viewBox={`${dimensions.viewBox.x} ${dimensions.viewBox.y} ${dimensions.viewBox.width} ${dimensions.viewBox.height}`}
      data-testid="california-map"
      role="img"
      aria-label="California Counties Map"
    >
      <g data-testid="counties-group">
        {counties.map((county) => (
          <g
            key={county.id}
            data-testid={`county-${county.id}`}
            data-county-id={county.id}
            className={`county ${selectedCounty === county.id ? 'selected' : ''} ${
              highlightedCounty === county.id ? 'highlighted' : ''
            } ${placedCounties.includes(county.id) ? 'placed' : ''}`}
          >
            <path
              d={`M ${county.geometry.coordinates[0].map(coord => coord.join(',')).join(' L ')} Z`}
              fill={placedCounties.includes(county.id) ? '#4ade80' : '#e5e7eb'}
              stroke="#374151"
              strokeWidth="1"
              onClick={isInteractive ? () => onCountyClick?.(county.id) : undefined}
              onMouseEnter={isInteractive ? () => onCountyHover?.(county.id) : undefined}
              onMouseLeave={isInteractive ? () => onCountyHover?.(null) : undefined}
              style={{ cursor: isInteractive ? 'pointer' : 'default' }}
              role="button"
              tabIndex={isInteractive ? 0 : -1}
              aria-label={`${county.name} County`}
              aria-pressed={selectedCounty === county.id}
            />
            <text
              x={county.coordinates.lng}
              y={county.coordinates.lat}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fill="#374151"
              pointerEvents="none"
              data-testid={`county-label-${county.id}`}
            >
              {county.name}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
});

MockCaliforniaMap.displayName = 'MockCaliforniaMap';

describe('Map Rendering', () => {
  const defaultProps = {
    counties: MOCK_CALIFORNIA_COUNTIES,
    dimensions: MOCK_MAP_DIMENSIONS,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the map container', () => {
      render(<MockCaliforniaMap {...defaultProps} />);

      const mapElement = screen.getByTestId('california-map');
      expect(mapElement).toBeInTheDocument();
      expect(mapElement.tagName).toBe('svg');
    });

    it('should set correct dimensions', () => {
      render(<MockCaliforniaMap {...defaultProps} />);

      const mapElement = screen.getByTestId('california-map');
      expect(mapElement).toHaveAttribute('width', String(MOCK_MAP_DIMENSIONS.width));
      expect(mapElement).toHaveAttribute('height', String(MOCK_MAP_DIMENSIONS.height));
    });

    it('should set correct viewBox', () => {
      render(<MockCaliforniaMap {...defaultProps} />);

      const mapElement = screen.getByTestId('california-map');
      const expectedViewBox = `${MOCK_MAP_DIMENSIONS.viewBox.x} ${MOCK_MAP_DIMENSIONS.viewBox.y} ${MOCK_MAP_DIMENSIONS.viewBox.width} ${MOCK_MAP_DIMENSIONS.viewBox.height}`;
      expect(mapElement).toHaveAttribute('viewBox', expectedViewBox);
    });

    it('should have proper accessibility attributes', () => {
      render(<MockCaliforniaMap {...defaultProps} />);

      const mapElement = screen.getByTestId('california-map');
      expect(mapElement).toHaveAttribute('role', 'img');
      expect(mapElement).toHaveAttribute('aria-label', 'California Counties Map');
    });
  });

  describe('County Rendering', () => {
    it('should render all counties', () => {
      render(<MockCaliforniaMap {...defaultProps} />);

      MOCK_CALIFORNIA_COUNTIES.forEach((county) => {
        const countyElement = screen.getByTestId(`county-${county.id}`);
        expect(countyElement).toBeInTheDocument();
      });
    });

    it('should render county paths with correct structure', () => {
      render(<MockCaliforniaMap {...defaultProps} />);

      MOCK_CALIFORNIA_COUNTIES.forEach((county) => {
        const countyGroup = screen.getByTestId(`county-${county.id}`);
        const path = countyGroup.querySelector('path');
        expect(path).toBeInTheDocument();
        expect(path).toHaveAttribute('d');
        expect(path).toHaveAttribute('fill');
        expect(path).toHaveAttribute('stroke');
      });
    });

    it('should render county labels', () => {
      render(<MockCaliforniaMap {...defaultProps} />);

      MOCK_CALIFORNIA_COUNTIES.forEach((county) => {
        const label = screen.getByTestId(`county-label-${county.id}`);
        expect(label).toBeInTheDocument();
        expect(label).toHaveTextContent(county.name);
      });
    });

    it('should set county data attributes', () => {
      render(<MockCaliforniaMap {...defaultProps} />);

      MOCK_CALIFORNIA_COUNTIES.forEach((county) => {
        const countyGroup = screen.getByTestId(`county-${county.id}`);
        expect(countyGroup).toHaveAttribute('data-county-id', county.id);
      });
    });
  });

  describe('Interactive States', () => {
    it('should handle selected county styling', () => {
      const selectedCounty = 'los-angeles';
      render(<MockCaliforniaMap {...defaultProps} selectedCounty={selectedCounty} />);

      const losAngelesCounty = screen.getByTestId(`county-${selectedCounty}`);
      expect(losAngelesCounty).toHaveClass('selected');

      // Other counties should not be selected
      const otherCounty = screen.getByTestId('county-san-diego');
      expect(otherCounty).not.toHaveClass('selected');
    });

    it('should handle highlighted county styling', () => {
      const highlightedCounty = 'san-diego';
      render(<MockCaliforniaMap {...defaultProps} highlightedCounty={highlightedCounty} />);

      const sanDiegoCounty = screen.getByTestId(`county-${highlightedCounty}`);
      expect(sanDiegoCounty).toHaveClass('highlighted');
    });

    it('should handle placed counties styling', () => {
      const placedCounties = ['los-angeles', 'san-diego'];
      render(<MockCaliforniaMap {...defaultProps} placedCounties={placedCounties} />);

      placedCounties.forEach(countyId => {
        const county = screen.getByTestId(`county-${countyId}`);
        expect(county).toHaveClass('placed');

        const path = county.querySelector('path');
        expect(path).toHaveAttribute('fill', '#4ade80');
      });
    });

    it('should disable interactivity when isInteractive is false', () => {
      render(<MockCaliforniaMap {...defaultProps} isInteractive={false} />);

      MOCK_CALIFORNIA_COUNTIES.forEach((county) => {
        const countyGroup = screen.getByTestId(`county-${county.id}`);
        const path = countyGroup.querySelector('path');
        expect(path).toHaveAttribute('tabIndex', '-1');
        expect(path).toHaveStyle('cursor: default');
      });
    });
  });

  describe('Event Handling', () => {
    it('should call onCountyClick when county is clicked', async () => {
      const onCountyClick = vi.fn();
      render(<MockCaliforniaMap {...defaultProps} onCountyClick={onCountyClick} />);

      const losAngelesCounty = screen.getByTestId('county-los-angeles');
      const path = losAngelesCounty.querySelector('path');

      if (path) {
        path.click();
        expect(onCountyClick).toHaveBeenCalledWith('los-angeles');
      }
    });

    it('should call onCountyHover when mouse enters/leaves county', async () => {
      const onCountyHover = vi.fn();
      render(<MockCaliforniaMap {...defaultProps} onCountyHover={onCountyHover} />);

      const losAngelesCounty = screen.getByTestId('county-los-angeles');
      const path = losAngelesCounty.querySelector('path');

      if (path) {
        // Mouse enter
        path.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        expect(onCountyHover).toHaveBeenCalledWith('los-angeles');

        // Mouse leave
        path.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        expect(onCountyHover).toHaveBeenCalledWith(null);
      }
    });

    it('should not call event handlers when isInteractive is false', () => {
      const onCountyClick = vi.fn();
      const onCountyHover = vi.fn();

      render(
        <MockCaliforniaMap
          {...defaultProps}
          isInteractive={false}
          onCountyClick={onCountyClick}
          onCountyHover={onCountyHover}
        />
      );

      const losAngelesCounty = screen.getByTestId('county-los-angeles');
      const path = losAngelesCounty.querySelector('path');

      if (path) {
        path.click();
        path.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

        expect(onCountyClick).not.toHaveBeenCalled();
        expect(onCountyHover).not.toHaveBeenCalled();
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for counties', () => {
      render(<MockCaliforniaMap {...defaultProps} />);

      MOCK_CALIFORNIA_COUNTIES.forEach((county) => {
        const countyGroup = screen.getByTestId(`county-${county.id}`);
        const path = countyGroup.querySelector('path');

        expect(path).toHaveAttribute('role', 'button');
        expect(path).toHaveAttribute('aria-label', `${county.name} County`);
        expect(path).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should indicate selected state with aria-pressed', () => {
      const selectedCounty = 'los-angeles';
      render(<MockCaliforniaMap {...defaultProps} selectedCounty={selectedCounty} />);

      const losAngelesCounty = screen.getByTestId(`county-${selectedCounty}`);
      const path = losAngelesCounty.querySelector('path');
      expect(path).toHaveAttribute('aria-pressed', 'true');

      // Other counties should have aria-pressed false
      const otherCounty = screen.getByTestId('county-san-diego');
      const otherPath = otherCounty.querySelector('path');
      expect(otherPath).toHaveAttribute('aria-pressed', 'false');
    });

    it('should prevent text selection on labels', () => {
      render(<MockCaliforniaMap {...defaultProps} />);

      MOCK_CALIFORNIA_COUNTIES.forEach((county) => {
        const label = screen.getByTestId(`county-label-${county.id}`);
        expect(label).toHaveAttribute('pointerEvents', 'none');
      });
    });
  });

  describe('Performance Considerations', () => {
    it('should render within reasonable time', async () => {
      const startTime = performance.now();
      render(<MockCaliforniaMap {...defaultProps} />);
      const endTime = performance.now();

      // Should render in under 100ms for mock component
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle large county datasets', () => {
      const largeCountySet = Array.from({ length: 100 }, (_, i) => ({
        ...MOCK_CALIFORNIA_COUNTIES[0],
        id: `county-${i}`,
        name: `County ${i}`,
      }));

      expect(() => {
        render(<MockCaliforniaMap {...defaultProps} counties={largeCountySet} />);
      }).not.toThrow();
    });
  });
});