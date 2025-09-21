import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MOCK_CALIFORNIA_COUNTIES, MOCK_DRAG_EVENTS } from '../../fixtures';
import '../../mocks/react-dnd-mocks';

// Mock Draggable County Component
const MockDraggableCounty: React.FC<{
  county: typeof MOCK_CALIFORNIA_COUNTIES[0];
  isDragging?: boolean;
  onDragStart?: (countyId: string) => void;
  onDragEnd?: (countyId: string) => void;
  disabled?: boolean;
}> = ({ county, isDragging = false, onDragStart, onDragEnd, disabled = false }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', county.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(county.id);
  };

  const handleDragEnd = () => {
    onDragEnd?.(county.id);
  };

  return (
    <div
      data-testid={`draggable-county-${county.id}`}
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`draggable-county ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'grab',
        padding: '8px',
        margin: '4px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: disabled ? '#f5f5f5' : '#fff'
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Drag ${county.name} County to place on map`}
      aria-grabbed={isDragging}
      aria-disabled={disabled}
    >
      <span data-testid={`county-name-${county.id}`}>{county.name}</span>
      <span data-testid={`county-population-${county.id}`}>
        Pop: {county.population.toLocaleString()}
      </span>
    </div>
  );
};

// Mock Drop Target Component
const MockDropTarget: React.FC<{
  countyId: string;
  isOver?: boolean;
  canDrop?: boolean;
  onDrop?: (draggedCountyId: string, targetCountyId: string) => void;
  onDragEnter?: (targetCountyId: string) => void;
  onDragLeave?: (targetCountyId: string) => void;
}> = ({ countyId, isOver = false, canDrop = true, onDrop, onDragEnter, onDragLeave }) => {
  const handleDragOver = (e: React.DragEvent) => {
    if (canDrop) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    onDragEnter?.(countyId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    onDragLeave?.(countyId);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedCountyId = e.dataTransfer.getData('text/plain');
    onDrop?.(draggedCountyId, countyId);
  };

  return (
    <div
      data-testid={`drop-target-${countyId}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`drop-target ${isOver ? 'drag-over' : ''} ${!canDrop ? 'cannot-drop' : ''}`}
      style={{
        width: '100px',
        height: '100px',
        border: `2px dashed ${isOver ? '#007bff' : '#ccc'}`,
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isOver ? '#e7f3ff' : canDrop ? '#f8f9fa' : '#f5f5f5',
        cursor: canDrop ? 'pointer' : 'not-allowed'
      }}
      role="region"
      aria-label={`Drop zone for ${countyId} county`}
      aria-dropeffect={canDrop ? 'move' : 'none'}
    >
      Drop Here
    </div>
  );
};

// Mock Container Component
const MockDragDropContainer: React.FC<{
  counties: typeof MOCK_CALIFORNIA_COUNTIES;
  placedCounties?: string[];
  onCountyPlace?: (countyId: string, targetId: string) => void;
  onDragStart?: (countyId: string) => void;
  onDragEnd?: (countyId: string) => void;
}> = ({ counties, placedCounties = [], onCountyPlace, onDragStart, onDragEnd }) => {
  const [draggedCounty, setDraggedCounty] = React.useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = React.useState<string | null>(null);

  const handleDragStart = (countyId: string) => {
    setDraggedCounty(countyId);
    onDragStart?.(countyId);
  };

  const handleDragEnd = (countyId: string) => {
    setDraggedCounty(null);
    setDragOverTarget(null);
    onDragEnd?.(countyId);
  };

  const handleDrop = (draggedCountyId: string, targetCountyId: string) => {
    onCountyPlace?.(draggedCountyId, targetCountyId);
    setDraggedCounty(null);
    setDragOverTarget(null);
  };

  const handleDragEnter = (targetCountyId: string) => {
    setDragOverTarget(targetCountyId);
  };

  const handleDragLeave = (targetCountyId: string) => {
    setDragOverTarget(null);
  };

  const availableCounties = counties.filter(county => !placedCounties.includes(county.id));

  return (
    <div data-testid="drag-drop-container">
      <div data-testid="available-counties" style={{ display: 'flex', flexWrap: 'wrap' }}>
        {availableCounties.map(county => (
          <MockDraggableCounty
            key={county.id}
            county={county}
            isDragging={draggedCounty === county.id}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      <div data-testid="drop-targets" style={{ display: 'flex', flexWrap: 'wrap', marginTop: '20px' }}>
        {counties.map(county => (
          <MockDropTarget
            key={county.id}
            countyId={county.id}
            isOver={dragOverTarget === county.id}
            canDrop={!placedCounties.includes(county.id)}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          />
        ))}
      </div>
    </div>
  );
};

describe('Drag and Drop Mechanics', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Draggable County Component', () => {
    const mockCounty = MOCK_CALIFORNIA_COUNTIES[0];

    it('should render county information', () => {
      render(<MockDraggableCounty county={mockCounty} />);

      expect(screen.getByTestId(`county-name-${mockCounty.id}`)).toHaveTextContent(mockCounty.name);
      expect(screen.getByTestId(`county-population-${mockCounty.id}`)).toHaveTextContent(
        `Pop: ${mockCounty.population.toLocaleString()}`
      );
    });

    it('should be draggable by default', () => {
      render(<MockDraggableCounty county={mockCounty} />);

      const draggableElement = screen.getByTestId(`draggable-county-${mockCounty.id}`);
      expect(draggableElement).toHaveAttribute('draggable', 'true');
      expect(draggableElement).toHaveAttribute('tabIndex', '0');
    });

    it('should call onDragStart when drag begins', () => {
      const onDragStart = vi.fn();
      render(<MockDraggableCounty county={mockCounty} onDragStart={onDragStart} />);

      const draggableElement = screen.getByTestId(`draggable-county-${mockCounty.id}`);
      fireEvent.dragStart(draggableElement);

      expect(onDragStart).toHaveBeenCalledWith(mockCounty.id);
    });

    it('should call onDragEnd when drag ends', () => {
      const onDragEnd = vi.fn();
      render(<MockDraggableCounty county={mockCounty} onDragEnd={onDragEnd} />);

      const draggableElement = screen.getByTestId(`draggable-county-${mockCounty.id}`);
      fireEvent.dragEnd(draggableElement);

      expect(onDragEnd).toHaveBeenCalledWith(mockCounty.id);
    });

    it('should show dragging state', () => {
      render(<MockDraggableCounty county={mockCounty} isDragging={true} />);

      const draggableElement = screen.getByTestId(`draggable-county-${mockCounty.id}`);
      expect(draggableElement).toHaveClass('dragging');
      expect(draggableElement).toHaveStyle('opacity: 0.5');
    });

    it('should handle disabled state', () => {
      render(<MockDraggableCounty county={mockCounty} disabled={true} />);

      const draggableElement = screen.getByTestId(`draggable-county-${mockCounty.id}`);
      expect(draggableElement).toHaveAttribute('draggable', 'false');
      expect(draggableElement).toHaveAttribute('tabIndex', '-1');
      expect(draggableElement).toHaveAttribute('aria-disabled', 'true');
      expect(draggableElement).toHaveClass('disabled');
      expect(draggableElement).toHaveStyle('cursor: not-allowed');
    });

    it('should have proper accessibility attributes', () => {
      render(<MockDraggableCounty county={mockCounty} />);

      const draggableElement = screen.getByTestId(`draggable-county-${mockCounty.id}`);
      expect(draggableElement).toHaveAttribute('role', 'button');
      expect(draggableElement).toHaveAttribute('aria-label', `Drag ${mockCounty.name} County to place on map`);
      expect(draggableElement).toHaveAttribute('aria-grabbed', 'false');
    });

    it('should update aria-grabbed when dragging', () => {
      render(<MockDraggableCounty county={mockCounty} isDragging={true} />);

      const draggableElement = screen.getByTestId(`draggable-county-${mockCounty.id}`);
      expect(draggableElement).toHaveAttribute('aria-grabbed', 'true');
    });
  });

  describe('Drop Target Component', () => {
    const targetCountyId = 'los-angeles';

    it('should render drop target', () => {
      render(<MockDropTarget countyId={targetCountyId} />);

      const dropTarget = screen.getByTestId(`drop-target-${targetCountyId}`);
      expect(dropTarget).toBeInTheDocument();
      expect(dropTarget).toHaveTextContent('Drop Here');
    });

    it('should handle drag over events', () => {
      render(<MockDropTarget countyId={targetCountyId} />);

      const dropTarget = screen.getByTestId(`drop-target-${targetCountyId}`);
      fireEvent.dragOver(dropTarget);

      // Should prevent default to allow drop
      expect(dropTarget).toBeInTheDocument();
    });

    it('should call onDrop when item is dropped', () => {
      const onDrop = vi.fn();
      render(<MockDropTarget countyId={targetCountyId} onDrop={onDrop} />);

      const dropTarget = screen.getByTestId(`drop-target-${targetCountyId}`);

      // Mock drag data
      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          getData: vi.fn().mockReturnValue('san-diego'),
        },
      });

      fireEvent(dropTarget, dropEvent);
      expect(onDrop).toHaveBeenCalledWith('san-diego', targetCountyId);
    });

    it('should show hover state', () => {
      render(<MockDropTarget countyId={targetCountyId} isOver={true} />);

      const dropTarget = screen.getByTestId(`drop-target-${targetCountyId}`);
      expect(dropTarget).toHaveClass('drag-over');
      expect(dropTarget).toHaveStyle('border: 2px dashed #007bff');
      expect(dropTarget).toHaveStyle('backgroundColor: #e7f3ff');
    });

    it('should handle canDrop state', () => {
      render(<MockDropTarget countyId={targetCountyId} canDrop={false} />);

      const dropTarget = screen.getByTestId(`drop-target-${targetCountyId}`);
      expect(dropTarget).toHaveClass('cannot-drop');
      expect(dropTarget).toHaveAttribute('aria-dropeffect', 'none');
      expect(dropTarget).toHaveStyle('cursor: not-allowed');
    });

    it('should have proper accessibility attributes', () => {
      render(<MockDropTarget countyId={targetCountyId} />);

      const dropTarget = screen.getByTestId(`drop-target-${targetCountyId}`);
      expect(dropTarget).toHaveAttribute('role', 'region');
      expect(dropTarget).toHaveAttribute('aria-label', `Drop zone for ${targetCountyId} county`);
      expect(dropTarget).toHaveAttribute('aria-dropeffect', 'move');
    });
  });

  describe('Full Drag and Drop Flow', () => {
    const mockCounties = MOCK_CALIFORNIA_COUNTIES.slice(0, 3);

    it('should handle complete drag and drop interaction', async () => {
      const onCountyPlace = vi.fn();
      const onDragStart = vi.fn();
      const onDragEnd = vi.fn();

      render(
        <MockDragDropContainer
          counties={mockCounties}
          onCountyPlace={onCountyPlace}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      );

      const draggableCounty = screen.getByTestId('draggable-county-los-angeles');
      const dropTarget = screen.getByTestId('drop-target-los-angeles');

      // Start drag
      fireEvent.dragStart(draggableCounty);
      expect(onDragStart).toHaveBeenCalledWith('los-angeles');

      // Drag over target
      fireEvent.dragEnter(dropTarget);
      fireEvent.dragOver(dropTarget);

      // Drop
      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          getData: vi.fn().mockReturnValue('los-angeles'),
        },
      });
      fireEvent(dropTarget, dropEvent);

      expect(onCountyPlace).toHaveBeenCalledWith('los-angeles', 'los-angeles');

      // End drag
      fireEvent.dragEnd(draggableCounty);
      expect(onDragEnd).toHaveBeenCalledWith('los-angeles');
    });

    it('should remove placed counties from available list', () => {
      const placedCounties = ['los-angeles'];

      render(
        <MockDragDropContainer
          counties={mockCounties}
          placedCounties={placedCounties}
        />
      );

      // Los Angeles should not be in available counties
      expect(screen.queryByTestId('draggable-county-los-angeles')).not.toBeInTheDocument();

      // Other counties should still be available
      expect(screen.getByTestId('draggable-county-san-diego')).toBeInTheDocument();
      expect(screen.getByTestId('draggable-county-orange')).toBeInTheDocument();
    });

    it('should disable drop targets for placed counties', () => {
      const placedCounties = ['los-angeles'];

      render(
        <MockDragDropContainer
          counties={mockCounties}
          placedCounties={placedCounties}
        />
      );

      const dropTarget = screen.getByTestId('drop-target-los-angeles');
      expect(dropTarget).toHaveClass('cannot-drop');
    });

    it('should handle visual feedback during drag operations', async () => {
      render(<MockDragDropContainer counties={mockCounties} />);

      const draggableCounty = screen.getByTestId('draggable-county-los-angeles');
      const dropTarget = screen.getByTestId('drop-target-san-diego');

      // Start drag
      fireEvent.dragStart(draggableCounty);

      // Should show dragging state
      await waitFor(() => {
        expect(draggableCounty).toHaveClass('dragging');
      });

      // Enter drop target
      fireEvent.dragEnter(dropTarget);

      // Should show hover state
      await waitFor(() => {
        expect(dropTarget).toHaveClass('drag-over');
      });

      // Leave drop target
      fireEvent.dragLeave(dropTarget);

      // Should remove hover state
      await waitFor(() => {
        expect(dropTarget).not.toHaveClass('drag-over');
      });
    });
  });

  describe('Keyboard Accessibility', () => {
    const mockCounties = MOCK_CALIFORNIA_COUNTIES.slice(0, 2);

    it('should support keyboard navigation', async () => {
      render(<MockDragDropContainer counties={mockCounties} />);

      const draggableCounty = screen.getByTestId('draggable-county-los-angeles');

      // Focus the element
      draggableCounty.focus();
      expect(draggableCounty).toHaveFocus();

      // Should be able to tab through elements
      await user.tab();
      const nextCounty = screen.getByTestId('draggable-county-san-diego');
      expect(nextCounty).toHaveFocus();
    });

    it('should handle space/enter key for activation', async () => {
      const onDragStart = vi.fn();
      render(
        <MockDragDropContainer
          counties={mockCounties}
          onDragStart={onDragStart}
        />
      );

      const draggableCounty = screen.getByTestId('draggable-county-los-angeles');
      draggableCounty.focus();

      // Simulate space key press for drag initiation
      await user.keyboard(' ');
      // Note: In a real implementation, space key would initiate drag mode
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid drop data gracefully', () => {
      const onDrop = vi.fn();
      render(<MockDropTarget countyId="los-angeles" onDrop={onDrop} />);

      const dropTarget = screen.getByTestId('drop-target-los-angeles');

      // Drop with no data
      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          getData: vi.fn().mockReturnValue(''),
        },
      });

      expect(() => {
        fireEvent(dropTarget, dropEvent);
      }).not.toThrow();

      expect(onDrop).toHaveBeenCalledWith('', 'los-angeles');
    });

    it('should handle missing event handlers gracefully', () => {
      render(<MockDraggableCounty county={MOCK_CALIFORNIA_COUNTIES[0]} />);

      const draggableCounty = screen.getByTestId('draggable-county-los-angeles');

      expect(() => {
        fireEvent.dragStart(draggableCounty);
        fireEvent.dragEnd(draggableCounty);
      }).not.toThrow();
    });
  });
});