import { vi } from 'vitest';

// Mock react-dnd hooks and components
export const mockUseDrag = vi.fn().mockImplementation(() => [
  { isDragging: false },
  vi.fn(), // drag ref
  vi.fn(), // preview ref
]);

export const mockUseDrop = vi.fn().mockImplementation(() => [
  {
    isOver: false,
    canDrop: true,
    item: null
  },
  vi.fn(), // drop ref
]);

export const mockDndProvider = vi.fn().mockImplementation(({ children }) => children);

export const mockHTML5Backend = vi.fn();

// Mock the entire react-dnd module
vi.mock('react-dnd', () => ({
  useDrag: mockUseDrag,
  useDrop: mockUseDrop,
  DndProvider: mockDndProvider,
}));

vi.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: mockHTML5Backend,
}));

// Mock @dnd-kit if it's being used instead
export const mockDndKitUseDraggable = vi.fn().mockImplementation(() => ({
  attributes: {},
  listeners: {},
  setNodeRef: vi.fn(),
  transform: null,
  isDragging: false,
}));

export const mockDndKitUseDroppable = vi.fn().mockImplementation(() => ({
  setNodeRef: vi.fn(),
  isOver: false,
  active: null,
}));

export const mockDndKitContext = vi.fn().mockImplementation(({ children }) => children);

export const mockDndKitSensor = vi.fn();
export const mockDndKitPointerSensor = vi.fn();
export const mockDndKitKeyboardSensor = vi.fn();

vi.mock('@dnd-kit/core', () => ({
  DndContext: mockDndKitContext,
  useDraggable: mockDndKitUseDraggable,
  useDroppable: mockDndKitUseDroppable,
  useSensor: mockDndKitSensor,
  useSensors: vi.fn().mockReturnValue([]),
  PointerSensor: mockDndKitPointerSensor,
  KeyboardSensor: mockDndKitKeyboardSensor,
  DragOverlay: vi.fn().mockImplementation(({ children }) => children),
  closestCenter: vi.fn(),
  closestCorners: vi.fn(),
  rectIntersection: vi.fn(),
  getFirstCollision: vi.fn(),
  pointerWithin: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: vi.fn().mockImplementation(({ children }) => children),
  useSortable: vi.fn().mockImplementation(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
  horizontalListSortingStrategy: vi.fn(),
  rectSortingStrategy: vi.fn(),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn().mockReturnValue(''),
    },
  },
}));