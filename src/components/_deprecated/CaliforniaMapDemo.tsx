/**
 * California Map Demo Component
 * Demonstrates integration of map utilities with React and D3
 */

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import useCaliforniaMap from '../hooks/useCaliforniaMap';

interface CaliforniaMapDemoProps {
  width?: number;
  height?: number;
  className?: string;
}

const CaliforniaMapDemo: React.FC<CaliforniaMapDemoProps> = ({
  width = 1024,
  height = 768,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const {
    mapState,
    mapUtils,
    collisionDetector,
    loadDetailLevel,
    switchProjection,
    zoomToCounty,
    zoomToFitAll,
    getCountyAtPoint,
    getOptimalDetailLevel
  } = useCaliforniaMap({
    width,
    height,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    initialProjection: 'albers',
    preloadLevels: ['ultra-low', 'low', 'medium']
  });

  // Initialize D3 visualization
  useEffect(() => {
    if (!svgRef.current || !mapUtils || !mapState.geoData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Create main group for counties
    const g = svg.append('g').attr('class', 'counties');

    // Set up zoom behavior
    const zoomBehavior = mapUtils.setupZoomBehavior(svg, (transform) => {
      g.attr('transform', transform.toString());
      setZoomLevel(transform.k);

      // Auto-switch detail level based on zoom
      const optimalLevel = getOptimalDetailLevel(transform.k);
      if (optimalLevel !== mapState.currentDetailLevel) {
        loadDetailLevel(optimalLevel).catch(console.error);
      }
    });

    // Initial zoom to fit all counties
    const initialTransform = zoomToFitAll(0.1);
    if (initialTransform) {
      svg.transition()
        .duration(750)
        .call(zoomBehavior.transform, initialTransform);
    }

    // Draw counties
    g.selectAll('path')
      .data(mapState.geoData)
      .enter()
      .append('path')
      .attr('d', mapUtils.path!)
      .attr('fill', (d: any) => selectedCounty === d.properties.GEOID ? '#ff6b6b' : '#69b3a2')
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .attr('class', 'county')
      .style('cursor', 'pointer')
      .on('click', (event, d: any) => {
        setSelectedCounty(d.properties.GEOID);

        // Zoom to clicked county
        const transform = zoomToCounty(d.properties.GEOID);
        if (transform) {
          svg.transition()
            .duration(750)
            .call(zoomBehavior.transform, transform);
        }
      })
      .on('mouseover', function(event, d: any) {
        d3.select(this)
          .attr('fill', selectedCounty === d.properties.GEOID ? '#ff5252' : '#4ecdc4');

        // Show tooltip (you can enhance this)
        console.log(`Hovered: ${d.properties.NAME} County`);
      })
      .on('mouseout', function(event, d: any) {
        d3.select(this)
          .attr('fill', selectedCounty === d.properties.GEOID ? '#ff6b6b' : '#69b3a2');
      });

  }, [mapUtils, mapState.geoData, selectedCounty]);

  // Update colors when selection changes
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('.county')
      .attr('fill', (d: any) => selectedCounty === d.properties.GEOID ? '#ff6b6b' : '#69b3a2');

  }, [selectedCounty]);

  const handleProjectionChange = (projection: 'albers' | 'mercator' | 'lambert') => {
    switchProjection(projection);

    // Re-render with new projection
    if (svgRef.current && mapUtils && mapState.geoData) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('.county')
        .attr('d', mapUtils.path!);
    }
  };

  const handleDetailLevelChange = (level: 'ultra-low' | 'low' | 'medium' | 'high') => {
    loadDetailLevel(level).catch(console.error);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !mapUtils) return;

    const svg = d3.select(svgRef.current);
    const zoomBehavior = d3.zoom();
    const transform = zoomToFitAll(0.1);

    if (transform) {
      svg.transition()
        .duration(750)
        .call(zoomBehavior.transform as any, transform);
    }
  };

  return (
    <div className={`california-map-demo ${className}`}>
      <div className="map-controls mb-4 flex flex-wrap gap-4">
        <div className="projection-controls">
          <label className="block text-sm font-medium mb-1">Projection:</label>
          <select
            className="border rounded px-2 py-1"
            onChange={(e) => handleProjectionChange(e.target.value as any)}
            defaultValue="albers"
          >
            <option value="albers">Albers (California optimized)</option>
            <option value="mercator">Mercator (Web standard)</option>
            <option value="lambert">Lambert (Shape preserving)</option>
          </select>
        </div>

        <div className="detail-controls">
          <label className="block text-sm font-medium mb-1">Detail Level:</label>
          <select
            className="border rounded px-2 py-1"
            value={mapState.currentDetailLevel}
            onChange={(e) => handleDetailLevelChange(e.target.value as any)}
          >
            <option value="ultra-low">Ultra Low (Overview)</option>
            <option value="low">Low (Navigation)</option>
            <option value="medium">Medium (Selection)</option>
            <option value="high">High (Detailed)</option>
          </select>
        </div>

        <button
          className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleResetZoom}
        >
          Reset Zoom
        </button>
      </div>

      <div className="map-info mb-2 text-sm text-gray-600">
        <span>Zoom: {zoomLevel.toFixed(2)}x</span>
        {mapState.isLoading && <span className="ml-4">Loading...</span>}
        {mapState.error && <span className="ml-4 text-red-600">Error: {mapState.error}</span>}
        {selectedCounty && (
          <span className="ml-4">
            Selected: {mapState.counties.find(c => c.id === selectedCounty)?.name} County
          </span>
        )}
      </div>

      <div className="map-container border border-gray-300 rounded">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="california-map"
          style={{ background: '#f8f9fa' }}
        >
          {mapState.isLoading && (
            <text
              x={width / 2}
              y={height / 2}
              textAnchor="middle"
              className="loading-text"
              fill="#666"
            >
              Loading California map data...
            </text>
          )}
        </svg>
      </div>

      <div className="map-stats mt-4 text-xs text-gray-500">
        <div>Counties loaded: {mapState.counties.length}</div>
        <div>Current detail: {mapState.currentDetailLevel}</div>
        <div>Optimal for zoom: {getOptimalDetailLevel(zoomLevel)}</div>
      </div>
    </div>
  );
};

export default CaliforniaMapDemo;