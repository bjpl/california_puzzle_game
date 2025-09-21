import React, { useState, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import {
  CountyPiece,
  Position,
  CountyTrayProps,
  DifficultyLevel
} from '@/types';

interface DragState {
  isDragging: boolean;
  draggedCounty: CountyPiece | null;
  startPosition: Position;
  currentPosition: Position;
  offset: Position;
}

const CountyTray: React.FC<CountyTrayProps> = ({
  counties,
  onCountyDrag,
  onCountyDragEnd,
  difficulty
}) => {
  const trayRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedCounty: null,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 }
  });

  // Calculate grid layout for county pieces
  const getGridLayout = () => {
    const containerWidth = 280; // Fixed tray width
    const pieceSize = getPieceSize();
    const padding = 8;
    const cols = Math.floor((containerWidth - padding) / (pieceSize + padding));

    return {
      cols,
      pieceSize,
      padding
    };
  };

  // Get piece size based on difficulty and number of counties
  const getPieceSize = () => {
    const baseSize = 60;
    const difficultyMultiplier = {
      [DifficultyLevel.EASY]: 1.2,
      [DifficultyLevel.MEDIUM]: 1.0,
      [DifficultyLevel.HARD]: 0.8,
      [DifficultyLevel.EXPERT]: 0.6
    }[difficulty];

    // Adjust for number of counties
    const countAdjustment = counties.length > 20 ? 0.8 : 1.0;

    return Math.round(baseSize * difficultyMultiplier * countAdjustment);
  };

  // Get rotation for expert mode
  const getRandomRotation = (county: CountyPiece): number => {
    if (difficulty !== DifficultyLevel.EXPERT) return 0;

    // Use county ID as seed for consistent rotation
    const seed = county.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (seed % 4) * 90; // 0, 90, 180, or 270 degrees
  };

  // Calculate position in grid
  const getGridPosition = (index: number) => {
    const { cols, pieceSize, padding } = getGridLayout();
    const row = Math.floor(index / cols);
    const col = index % cols;

    return {
      x: col * (pieceSize + padding) + padding,
      y: row * (pieceSize + padding) + padding
    };
  };

  // Handle mouse/touch events for dragging
  const handlePointerDown = useCallback((event: React.PointerEvent, county: CountyPiece) => {
    event.preventDefault();

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const startPosition = {
      x: event.clientX,
      y: event.clientY
    };

    const offset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    setDragState({
      isDragging: true,
      draggedCounty: county,
      startPosition,
      currentPosition: startPosition,
      offset
    });

    onCountyDrag(county);

    // Capture pointer to handle drag outside element
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }, [onCountyDrag]);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!dragState.isDragging || !dragState.draggedCounty) return;

    const currentPosition = {
      x: event.clientX,
      y: event.clientY
    };

    setDragState(prev => ({
      ...prev,
      currentPosition
    }));
  }, [dragState.isDragging, dragState.draggedCounty]);

  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    if (!dragState.isDragging || !dragState.draggedCounty) return;

    const finalPosition = {
      x: event.clientX - dragState.offset.x,
      y: event.clientY - dragState.offset.y
    };

    onCountyDragEnd(dragState.draggedCounty, finalPosition);

    setDragState({
      isDragging: false,
      draggedCounty: null,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      offset: { x: 0, y: 0 }
    });

    // Release pointer capture
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  }, [dragState, onCountyDragEnd]);

  // Render individual county piece
  const renderCountyPiece = (county: CountyPiece, index: number) => {
    const { pieceSize } = getGridLayout();
    const position = getGridPosition(index);
    const rotation = getRandomRotation(county);
    const isDragged = dragState.draggedCounty?.id === county.id;

    // Calculate drag position
    const dragPosition = isDragged ? {
      x: dragState.currentPosition.x - dragState.offset.x,
      y: dragState.currentPosition.y - dragState.offset.y
    } : position;

    return (
      <div
        key={county.id}
        className={`county-piece county-${county.id} ${isDragged ? 'dragging' : ''}`}
        style={{
          position: 'absolute',
          left: dragPosition.x,
          top: dragPosition.y,
          width: pieceSize,
          height: pieceSize,
          transform: `rotate(${rotation}deg)`,
          cursor: isDragged ? 'grabbing' : 'grab',
          zIndex: isDragged ? 1000 : 1,
          transition: isDragged ? 'none' : 'transform 0.2s ease',
          border: '2px solid #374151',
          borderRadius: '8px',
          backgroundColor: getCountyColor(county),
          backgroundImage: getCountyPattern(county),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${Math.max(8, pieceSize / 8)}px`,
          fontWeight: 'bold',
          color: 'white',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          userSelect: 'none',
          touchAction: 'none',
          boxShadow: isDragged
            ? '0 10px 30px rgba(0,0,0,0.3)'
            : '0 2px 8px rgba(0,0,0,0.1)'
        }}
        onPointerDown={(e) => handlePointerDown(e, county)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        title={`${county.name} County`}
      >
        {/* County identifier */}
        <div className="county-label">
          {getDifficultyLabel(county)}
        </div>

        {/* Difficulty indicator */}
        <div
          className="difficulty-indicator"
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getDifficultyColor(county.difficulty)
          }}
        />
      </div>
    );
  };

  // Get county color based on region
  const getCountyColor = (county: CountyPiece): string => {
    const colors = {
      bay_area: '#3b82f6',    // Blue
      southern: '#f59e0b',    // Amber
      northern: '#10b981',    // Emerald
      central: '#8b5cf6',     // Violet
      central_valley: '#f97316', // Orange
      coastal: '#06b6d4',     // Cyan
      inland: '#84cc16'       // Lime
    };

    return colors[county.region as keyof typeof colors] || '#6b7280';
  };

  // Get background pattern for texture
  const getCountyPattern = (county: CountyPiece): string => {
    if (difficulty === DifficultyLevel.EXPERT) {
      return 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%)';
    }
    return 'none';
  };

  // Get label text based on difficulty
  const getDifficultyLabel = (county: CountyPiece): string => {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return county.name.substring(0, 4);
      case DifficultyLevel.MEDIUM:
        return county.name.substring(0, 3);
      case DifficultyLevel.HARD:
        return county.name.substring(0, 2);
      case DifficultyLevel.EXPERT:
        return '?';
      default:
        return county.name.substring(0, 3);
    }
  };

  // Get difficulty indicator color
  const getDifficultyColor = (difficultyLevel: DifficultyLevel): string => {
    const colors = {
      [DifficultyLevel.EASY]: '#10b981',
      [DifficultyLevel.MEDIUM]: '#f59e0b',
      [DifficultyLevel.HARD]: '#f97316',
      [DifficultyLevel.EXPERT]: '#ef4444'
    };
    return colors[difficultyLevel];
  };

  // Calculate tray height based on content
  const getTrayHeight = () => {
    const { cols, pieceSize, padding } = getGridLayout();
    const rows = Math.ceil(counties.length / cols);
    return rows * (pieceSize + padding) + padding;
  };

  return (
    <div className="county-tray">
      {/* Header */}
      <div className="tray-header" style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        borderRadius: '8px 8px 0 0'
      }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#374151' }}>
          County Pieces
        </h3>
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
          {counties.length} counties • {difficulty} mode
        </div>
      </div>

      {/* County pieces container */}
      <div
        ref={trayRef}
        className="tray-content"
        style={{
          position: 'relative',
          width: '280px',
          height: `${getTrayHeight()}px`,
          backgroundColor: '#ffffff',
          borderRadius: '0 0 8px 8px',
          border: '1px solid #e5e7eb',
          borderTop: 'none',
          overflow: 'hidden'
        }}
      >
        {counties.map((county, index) => renderCountyPiece(county, index))}

        {/* Empty state */}
        {counties.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '14px'
          }}>
            <div>🎉</div>
            <div>All pieces placed!</div>
          </div>
        )}

        {/* Drag preview */}
        {dragState.isDragging && dragState.draggedCounty && (
          <div
            className="drag-preview"
            style={{
              position: 'fixed',
              left: dragState.currentPosition.x - dragState.offset.x,
              top: dragState.currentPosition.y - dragState.offset.y,
              width: getPieceSize(),
              height: getPieceSize(),
              backgroundColor: getCountyColor(dragState.draggedCounty),
              border: '2px solid #374151',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              pointerEvents: 'none',
              zIndex: 2000,
              opacity: 0.8,
              transform: `rotate(${getRandomRotation(dragState.draggedCounty)}deg)`,
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}
          >
            {getDifficultyLabel(dragState.draggedCounty)}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="tray-instructions" style={{
        padding: '8px 12px',
        fontSize: '11px',
        color: '#6b7280',
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        borderRadius: '0 0 8px 8px'
      }}>
        Drag county pieces to their correct locations on the map
      </div>
    </div>
  );
};

export default CountyTray;