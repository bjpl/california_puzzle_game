import { useState, useCallback, useRef } from 'react';
import { Position, CountyPiece } from '@/types';

interface DragState {
  isDragging: boolean;
  draggedItem: CountyPiece | null;
  startPosition: Position;
  currentPosition: Position;
  offset: Position;
  dragStartTime: number;
}

interface DragCallbacks {
  onDragStart?: (item: CountyPiece, position: Position) => void;
  onDragMove?: (item: CountyPiece, position: Position) => void;
  onDragEnd?: (item: CountyPiece, position: Position, dragDuration: number) => void;
  onDrop?: (item: CountyPiece, position: Position, dragDuration: number) => void;
}

interface DragConstraints {
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  snapToGrid?: {
    size: number;
    enabled: boolean;
  };
  lockAxis?: 'x' | 'y' | null;
}

interface UseDragAndDropReturn {
  dragState: DragState;
  handlers: {
    onPointerDown: (event: React.PointerEvent, item: CountyPiece) => void;
    onPointerMove: (event: React.PointerEvent) => void;
    onPointerUp: (event: React.PointerEvent) => void;
  };
  isDragging: boolean;
  draggedItem: CountyPiece | null;
  dragPosition: Position;
}

export const useDragAndDrop = (
  callbacks: DragCallbacks = {},
  constraints: DragConstraints = {}
): UseDragAndDropReturn => {
  const { onDragStart, onDragMove, onDragEnd, onDrop } = callbacks;
  const { bounds, snapToGrid, lockAxis } = constraints;

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    dragStartTime: 0
  });

  const dragElementRef = useRef<HTMLElement | null>(null);

  // Utility function to apply constraints
  const applyConstraints = useCallback((position: Position): Position => {
    let constrainedPosition = { ...position };

    // Apply axis lock
    if (lockAxis === 'x') {
      constrainedPosition.y = dragState.startPosition.y;
    } else if (lockAxis === 'y') {
      constrainedPosition.x = dragState.startPosition.x;
    }

    // Apply bounds constraint
    if (bounds) {
      constrainedPosition.x = Math.max(
        bounds.x,
        Math.min(constrainedPosition.x, bounds.x + bounds.width)
      );
      constrainedPosition.y = Math.max(
        bounds.y,
        Math.min(constrainedPosition.y, bounds.y + bounds.height)
      );
    }

    // Apply snap to grid
    if (snapToGrid?.enabled && snapToGrid.size > 0) {
      constrainedPosition.x = Math.round(constrainedPosition.x / snapToGrid.size) * snapToGrid.size;
      constrainedPosition.y = Math.round(constrainedPosition.y / snapToGrid.size) * snapToGrid.size;
    }

    return constrainedPosition;
  }, [bounds, snapToGrid, lockAxis, dragState.startPosition]);

  // Handle pointer down (start drag)
  const handlePointerDown = useCallback((event: React.PointerEvent, item: CountyPiece) => {
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

    const newDragState: DragState = {
      isDragging: true,
      draggedItem: item,
      startPosition,
      currentPosition: startPosition,
      offset,
      dragStartTime: Date.now()
    };

    setDragState(newDragState);

    // Store reference to drag element for pointer capture
    dragElementRef.current = event.target as HTMLElement;

    // Capture pointer to receive events even when outside element
    dragElementRef.current.setPointerCapture(event.pointerId);

    // Add global styles for dragging
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';

    // Call onDragStart callback
    if (onDragStart) {
      onDragStart(item, startPosition);
    }
  }, [onDragStart]);

  // Handle pointer move (drag)
  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!dragState.isDragging || !dragState.draggedItem) return;

    const currentPosition = {
      x: event.clientX,
      y: event.clientY
    };

    const constrainedPosition = applyConstraints(currentPosition);

    setDragState(prev => ({
      ...prev,
      currentPosition: constrainedPosition
    }));

    // Call onDragMove callback
    if (onDragMove) {
      onDragMove(dragState.draggedItem, constrainedPosition);
    }
  }, [dragState.isDragging, dragState.draggedItem, onDragMove, applyConstraints]);

  // Handle pointer up (end drag)
  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    if (!dragState.isDragging || !dragState.draggedItem) return;

    const finalPosition = {
      x: event.clientX - dragState.offset.x,
      y: event.clientY - dragState.offset.y
    };

    const constrainedFinalPosition = applyConstraints(finalPosition);
    const dragDuration = Date.now() - dragState.dragStartTime;

    // Release pointer capture
    if (dragElementRef.current) {
      dragElementRef.current.releasePointerCapture(event.pointerId);
    }

    // Reset global styles
    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    // Call callbacks
    if (onDragEnd) {
      onDragEnd(dragState.draggedItem, constrainedFinalPosition, dragDuration);
    }

    if (onDrop) {
      onDrop(dragState.draggedItem, constrainedFinalPosition, dragDuration);
    }

    // Reset drag state
    setDragState({
      isDragging: false,
      draggedItem: null,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      dragStartTime: 0
    });

    dragElementRef.current = null;
  }, [dragState, onDragEnd, onDrop, applyConstraints]);

  // Calculate drag position for rendering
  const dragPosition: Position = dragState.isDragging
    ? {
        x: dragState.currentPosition.x - dragState.offset.x,
        y: dragState.currentPosition.y - dragState.offset.y
      }
    : { x: 0, y: 0 };

  return {
    dragState,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp
    },
    isDragging: dragState.isDragging,
    draggedItem: dragState.draggedItem,
    dragPosition
  };
};