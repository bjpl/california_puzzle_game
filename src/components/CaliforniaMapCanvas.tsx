import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import {
  County,
  CountyPiece,
  Position,
  CaliforniaMapCanvasProps,
  DifficultyLevel,
  DropZone
} from '@/types';
import { CALIFORNIA_CENTER, CALIFORNIA_PROJECTION_CONFIG } from '@/utils/californiaData';
import { getSvgTextFill } from '@/utils/colorContrast';

interface MapCanvasState {
  projection: d3.GeoProjection | null;
  path: d3.GeoPath | null;
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null;
  zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null;
}

const CaliforniaMapCanvas: React.FC<CaliforniaMapCanvasProps> = ({
  width,
  height,
  counties,
  placedCounties,
  onCountyDrop,
  showHints,
  difficulty
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mapState, setMapState] = useState<MapCanvasState>({
    projection: null,
    path: null,
    svg: null,
    zoom: null
  });
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);

  // Initialize D3 projection and path generator
  const initializeMap = useCallback(() => {
    if (!svgRef.current) return;

    // Create California-specific Mercator projection
    const projection = d3.geoMercator()
      .center(CALIFORNIA_CENTER)
      .scale(CALIFORNIA_PROJECTION_CONFIG.scale)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Create SVG selection
    const svg = d3.select(svgRef.current);

    // Clear previous content
    svg.selectAll('*').remove();

    // Create main group for map elements
    const mapGroup = svg.append('g').attr('class', 'map-group');

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 8])
      .on('zoom', (event) => {
        mapGroup.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Set up drag behavior for county pieces
    const drag = d3.drag<SVGGElement, CountyPiece>()
      .on('start', function(event, d) {
        d3.select(this).raise().classed('dragging', true);
      })
      .on('drag', function(event, d) {
        const [x, y] = d3.pointer(event, svg.node());
        d3.select(this).attr('transform', `translate(${x},${y})`);
      })
      .on('end', function(event, d) {
        d3.select(this).classed('dragging', false);
        const [x, y] = d3.pointer(event, svg.node());

        // Check if dropped in valid zone
        const dropZone = findDropZone({ x, y });
        if (dropZone && dropZone.targetCounty.id === d.id) {
          onCountyDrop(d, { x, y });
        }
      });

    setMapState({ projection, path, svg, zoom });

    // Generate drop zones based on counties
    const zones: DropZone[] = counties.map(county => {
      const centroid = projection(county.centroid);
      const tolerance = getDifficultyTolerance(difficulty);

      return {
        id: county.id,
        bounds: new DOMRect(
          centroid![0] - tolerance,
          centroid![1] - tolerance,
          tolerance * 2,
          tolerance * 2
        ),
        targetCounty: county,
        tolerance,
        isActive: true
      };
    });

    setDropZones(zones);
  }, [width, height, counties, difficulty, onCountyDrop]);

  // Helper function to determine tolerance based on difficulty
  const getDifficultyTolerance = (difficulty: DifficultyLevel): number => {
    switch (difficulty) {
      case DifficultyLevel.EASY: return 80;
      case DifficultyLevel.MEDIUM: return 60;
      case DifficultyLevel.HARD: return 40;
      case DifficultyLevel.EXPERT: return 25;
      default: return 60;
    }
  };

  // Find drop zone at position
  const findDropZone = (position: Position): DropZone | null => {
    return dropZones.find(zone =>
      position.x >= zone.bounds.left &&
      position.x <= zone.bounds.right &&
      position.y >= zone.bounds.top &&
      position.y <= zone.bounds.bottom
    ) || null;
  };

  // Draw county outlines
  const drawCountyOutlines = useCallback(() => {
    if (!mapState.svg || !mapState.path) return;

    const mapGroup = mapState.svg.select('.map-group');

    // Remove existing outlines
    mapGroup.selectAll('.county-outline').remove();

    // Draw county boundaries
    counties.forEach(county => {
      if (!county.geometry) return;

      const outline = mapGroup
        .append('path')
        .datum(county)
        .attr('class', `county-outline county-${county.id}`)
        .attr('d', mapState.path)
        .attr('fill', 'none')
        .attr('stroke', getOutlineColor(county))
        .attr('stroke-width', getOutlineWidth(county))
        .attr('stroke-dasharray', getOutlineDashArray(county))
        .style('opacity', getOutlineOpacity(county));

      // Add hover effects for hints
      if (showHints) {
        outline
          .on('mouseover', () => setHoveredCounty(county.id))
          .on('mouseout', () => setHoveredCounty(null))
          .style('cursor', 'help');
      }
    });
  }, [mapState, counties, showHints]);

  // Get outline styling based on county state and difficulty
  const getOutlineColor = (county: County): string => {
    const isPlaced = placedCounties.some(p => p.id === county.id);
    const isHovered = hoveredCounty === county.id;

    if (isPlaced) return '#4ade80'; // Green for placed
    if (isHovered && showHints) return '#f59e0b'; // Amber for hovered hint
    if (showHints) return '#6b7280'; // Gray for hints

    switch (difficulty) {
      case DifficultyLevel.EASY: return '#9ca3af';
      case DifficultyLevel.MEDIUM: return '#6b7280';
      case DifficultyLevel.HARD: return '#4b5563';
      case DifficultyLevel.EXPERT: return 'transparent';
      default: return '#6b7280';
    }
  };

  const getOutlineWidth = (county: County): number => {
    const isPlaced = placedCounties.some(p => p.id === county.id);
    const isHovered = hoveredCounty === county.id;

    if (isPlaced) return 3;
    if (isHovered) return 2;

    switch (difficulty) {
      case DifficultyLevel.EASY: return 2;
      case DifficultyLevel.MEDIUM: return 1.5;
      case DifficultyLevel.HARD: return 1;
      case DifficultyLevel.EXPERT: return 0;
      default: return 1.5;
    }
  };

  const getOutlineDashArray = (county: County): string => {
    const isPlaced = placedCounties.some(p => p.id === county.id);

    if (isPlaced) return 'none';

    switch (difficulty) {
      case DifficultyLevel.EASY: return 'none';
      case DifficultyLevel.MEDIUM: return '5,3';
      case DifficultyLevel.HARD: return '3,3';
      case DifficultyLevel.EXPERT: return 'none';
      default: return '5,3';
    }
  };

  const getOutlineOpacity = (county: County): number => {
    const isPlaced = placedCounties.some(p => p.id === county.id);
    const isHovered = hoveredCounty === county.id;

    if (isPlaced) return 1;
    if (isHovered) return 0.8;

    switch (difficulty) {
      case DifficultyLevel.EASY: return 0.7;
      case DifficultyLevel.MEDIUM: return 0.5;
      case DifficultyLevel.HARD: return 0.3;
      case DifficultyLevel.EXPERT: return 0;
      default: return 0.5;
    }
  };

  // Draw placed county pieces
  const drawPlacedCounties = useCallback(() => {
    if (!mapState.svg || !mapState.path) return;

    const mapGroup = mapState.svg.select('.map-group');

    // Remove existing placed counties and their labels
    mapGroup.selectAll('.placed-county').remove();
    mapGroup.selectAll('.placed-county-label').remove();

    // Draw placed counties
    placedCounties.forEach(county => {
      if (!county.geometry) return;

      const fillColor = getPlacedCountyFill(county);

      const placedElement = mapGroup
        .append('path')
        .datum(county)
        .attr('class', `placed-county placed-${county.id}`)
        .attr('d', mapState.path)
        .attr('fill', fillColor)
        .attr('stroke', '#059669')
        .attr('stroke-width', 2)
        .style('opacity', 0.8)
        .attr('transform', `translate(${county.currentPosition.x}, ${county.currentPosition.y}) scale(${county.scale}) rotate(${county.rotation})`);

      // Add placement accuracy indicator
      const accuracy = calculatePlacementAccuracy(county);
      if (accuracy < 1.0) {
        // Add visual indicator for imperfect placement
        placedElement
          .attr('stroke', accuracy > 0.8 ? '#f59e0b' : '#ef4444')
          .attr('stroke-width', 3);
      }

      // Add county name label AFTER the shape (renders on top)
      if (mapState.projection && county.centroid) {
        const centroid = mapState.projection(county.centroid);

        if (centroid) {
          const textColor = getSvgTextFill(fillColor);

          mapGroup
            .append('text')
            .attr('class', `placed-county-label label-${county.id}`)
            .attr('x', centroid[0])
            .attr('y', centroid[1])
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '14')
            .attr('font-weight', 'bold')
            .attr('fill', textColor)
            .attr('pointer-events', 'none')
            .attr('transform', `translate(${county.currentPosition.x}, ${county.currentPosition.y}) scale(${county.scale}) rotate(${county.rotation})`)
            .style('text-shadow', textColor === '#ffffff' ? '1px 1px 2px rgba(0,0,0,0.7)' : '1px 1px 2px rgba(255,255,255,0.7)')
            .text(county.name);
        }
      }
    });
  }, [mapState, placedCounties]);

  // Calculate placement accuracy based on position
  const calculatePlacementAccuracy = (county: CountyPiece): number => {
    if (!mapState.projection) return 0;

    const targetPosition = mapState.projection(county.centroid);
    if (!targetPosition) return 0;

    const distance = Math.sqrt(
      Math.pow(targetPosition[0] - county.currentPosition.x, 2) +
      Math.pow(targetPosition[1] - county.currentPosition.y, 2)
    );

    const tolerance = getDifficultyTolerance(difficulty);
    return Math.max(0, 1 - (distance / tolerance));
  };

  // Get fill color for placed counties based on accuracy
  const getPlacedCountyFill = (county: CountyPiece): string => {
    const accuracy = calculatePlacementAccuracy(county);

    if (accuracy >= 0.95) return '#10b981'; // Perfect - emerald
    if (accuracy >= 0.8) return '#f59e0b'; // Good - amber
    if (accuracy >= 0.6) return '#f97316'; // OK - orange
    return '#ef4444'; // Poor - red
  };

  // Draw drop zone indicators
  const drawDropZones = useCallback(() => {
    if (!mapState.svg || !showHints || difficulty === DifficultyLevel.EXPERT) return;

    const mapGroup = mapState.svg.select('.map-group');

    // Remove existing drop zones
    mapGroup.selectAll('.drop-zone').remove();

    // Draw drop zone circles
    dropZones.forEach(zone => {
      const isPlaced = placedCounties.some(p => p.id === zone.targetCounty.id);
      if (isPlaced) return;

      mapGroup
        .append('circle')
        .attr('class', `drop-zone zone-${zone.id}`)
        .attr('cx', zone.bounds.x + zone.bounds.width / 2)
        .attr('cy', zone.bounds.y + zone.bounds.height / 2)
        .attr('r', zone.tolerance)
        .attr('fill', 'rgba(59, 130, 246, 0.1)')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '5,5')
        .style('pointer-events', 'none');
    });
  }, [mapState, dropZones, placedCounties, showHints, difficulty]);

  // Initialize map on mount and dependency changes
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Update drawings when state changes
  useEffect(() => {
    drawCountyOutlines();
  }, [drawCountyOutlines]);

  useEffect(() => {
    drawPlacedCounties();
  }, [drawPlacedCounties]);

  useEffect(() => {
    drawDropZones();
  }, [drawDropZones]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapState.svg && mapState.projection) {
        mapState.projection.translate([width / 2, height / 2]);
        drawCountyOutlines();
        drawPlacedCounties();
        drawDropZones();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mapState, width, height, drawCountyOutlines, drawPlacedCounties, drawDropZones]);

  return (
    <div className="california-map-canvas">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="map-svg"
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          cursor: 'move'
        }}
      >
        {/* Background pattern for California */}
        <defs>
          <pattern id="californiaPattern" patternUnits="userSpaceOnUse" width="20" height="20">
            <rect width="20" height="20" fill="#f8fafc"/>
            <circle cx="10" cy="10" r="1" fill="#e2e8f0"/>
          </pattern>
        </defs>

        {/* Tooltip for hovered counties */}
        {hoveredCounty && showHints && (
          <g className="county-tooltip">
            <text
              x="10"
              y="30"
              fill={getSvgTextFill('#f0f9ff')} // Match the background gradient
              fontSize="14"
              fontWeight="bold"
            >
              {counties.find(c => c.id === hoveredCounty)?.name || ''}
            </text>
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="map-legend" style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '12px',
        backdropFilter: 'blur(4px)'
      }}>
        <div style={{ color: '#10b981' }}>● Perfect placement</div>
        <div style={{ color: '#f59e0b' }}>● Good placement</div>
        <div style={{ color: '#ef4444' }}>● Needs adjustment</div>
        {showHints && (
          <div style={{ color: '#6b7280' }}>- - - Target zones</div>
        )}
      </div>

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontFamily: 'monospace'
        }}>
          Counties: {counties.length} | Placed: {placedCounties.length} |
          Zones: {dropZones.length} | Difficulty: {difficulty}
        </div>
      )}
    </div>
  );
};

export default CaliforniaMapCanvas;