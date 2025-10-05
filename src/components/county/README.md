# County Components

County-specific UI components including the drag-and-drop tray, individual county pills, and information panels.

## Components

### CountyTray.tsx
Main container for draggable county items. Source for drag-and-drop operations.

**Features:**
- Displays all unplaced counties
- Scrollable list
- Drag-and-drop source
- Visual feedback on selection
- County count display

**Usage:**
```typescript
import CountyTray from '@/components/county/CountyTray';

<CountyTray />
```

**Architecture:**
- Uses GameContext for county state
- Integrates with DndKit for drag operations
- Automatically filters out placed counties
- Responsive design with scroll

### CountyPill.tsx
Individual draggable county item.

**Features:**
- Compact county representation
- Drag handle
- Hover effects
- Sound feedback on interaction
- Visual state changes (selected, dragging)

**Usage:**
```typescript
import CountyPill from '@/components/county/CountyPill';

<CountyPill
  county={county}
  isSelected={selectedId === county.id}
  onSelect={() => handleSelect(county.id)}
/>
```

**Props:**
```typescript
interface CountyPillProps {
  county: County;
  isSelected?: boolean;
  onSelect?: () => void;
  draggable?: boolean;
}
```

**States:**
- **Default**: Gray background, subtle border
- **Hover**: Yellow tint, raised shadow
- **Selected**: Yellow background, bold text
- **Dragging**: Semi-transparent, cursor changes

### CountyInfoPanel.tsx
Detailed information panel for selected county.

**Features:**
- County name and region
- Population and area statistics
- Founded date and county seat
- Historical facts
- Geographic context
- Related counties

**Usage:**
```typescript
import CountyInfoPanel from '@/components/county/CountyInfoPanel';

<CountyInfoPanel
  county={selectedCounty}
  onClose={() => setSelectedCounty(null)}
/>
```

**Props:**
```typescript
interface CountyInfoPanelProps {
  county: County;
  onClose?: () => void;
  showRelated?: boolean;
}
```

## Data Structure

### County Interface
```typescript
interface County {
  id: string;
  name: string;
  region: string;
  population?: number;
  area?: number; // square miles
  founded?: number; // year
  seat?: string; // county seat city
  facts?: string[];
  neighbors?: string[]; // neighboring county IDs
}
```

### Example County
```typescript
const alamedaCounty: County = {
  id: 'alameda',
  name: 'Alameda',
  region: 'bay-area',
  population: 1671329,
  area: 739,
  founded: 1853,
  seat: 'Oakland',
  facts: [
    'Home to the University of California, Berkeley',
    'Contains the cities of Oakland, Berkeley, and Fremont'
  ],
  neighbors: ['contra-costa', 'santa-clara', 'san-joaquin']
};
```

## Drag-and-Drop Behavior

### DndKit Integration
County components use DndKit for drag-and-drop:

```typescript
import { useDraggable } from '@dnd-kit/core';

function DraggableCountyPill({ county }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: county.id,
  });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      {county.name}
    </div>
  );
}
```

### Drag Flow
1. **Drag Start**: County selected, sound plays, overlay created
2. **Dragging**: Visual feedback on map, cursor changes
3. **Drag End**:
   - Dropped on map: Placement attempt
   - Dropped elsewhere: Return to tray
   - Sound plays (correct/incorrect)

### Visual Feedback
```typescript
const getDragStyle = (isDragging: boolean) => ({
  opacity: isDragging ? 0.5 : 1,
  cursor: isDragging ? 'grabbing' : 'grab',
  transform: isDragging ? 'scale(1.05)' : 'scale(1)',
});
```

## Sound Effects

County interactions trigger sound effects:

```typescript
import { useSoundEffect } from '@/utils/simpleSoundManager';

const sound = useSoundEffect();

const handleCountySelect = (county: County) => {
  sound.playSound('pickup', 0.3);
  selectCounty(county);
};
```

### Sound Types
- **Pickup**: County selected from tray
- **Correct**: Successfully placed
- **Incorrect**: Incorrectly placed
- **Hover**: Mouse over county

## Styling

### CountyTray Styling
```css
.county-tray {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  max-height: 520px;
  overflow-y: auto;
}
```

### CountyPill Styling
```css
.county-pill {
  padding: 4px 8px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 11px;
  cursor: grab;
  transition: all 150ms ease;
}

.county-pill:hover {
  background: #fef3c7;
  border-color: #fbbf24;
  box-shadow: 0 2px 4px rgba(251, 191, 36, 0.2);
}

.county-pill.selected {
  background: #fbbf24;
  color: #78350f;
  font-weight: 600;
}
```

## Accessibility

### Keyboard Navigation
```typescript
<div
  role="button"
  tabIndex={0}
  onKeyPress={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleCountySelect(county);
    }
  }}
  aria-label={`Select ${county.name} county`}
>
  {county.name}
</div>
```

### Screen Reader Support
- Announce county name on selection
- Indicate draggable state
- Provide placement feedback

### Focus Management
- Visible focus indicators
- Logical tab order
- Focus trap in modals

## Performance

### Optimization Techniques
1. **Virtualization**: Large county lists use react-window
2. **Memoization**: County pills memoized to prevent re-renders
3. **Lazy Loading**: County details loaded on demand

```typescript
const MemoizedCountyPill = memo(CountyPill, (prev, next) =>
  prev.county.id === next.county.id &&
  prev.isSelected === next.isSelected
);
```

## Testing

### Unit Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import CountyPill from './CountyPill';

test('renders county name', () => {
  const county = { id: 'alameda', name: 'Alameda', region: 'bay-area' };
  render(<CountyPill county={county} />);
  expect(screen.getByText('Alameda')).toBeInTheDocument();
});

test('calls onSelect when clicked', () => {
  const handleSelect = jest.fn();
  const county = { id: 'alameda', name: 'Alameda', region: 'bay-area' };

  render(<CountyPill county={county} onSelect={handleSelect} />);
  fireEvent.click(screen.getByText('Alameda'));

  expect(handleSelect).toHaveBeenCalled();
});
```

### Drag Tests
```typescript
import { DndContext } from '@dnd-kit/core';

test('county can be dragged', () => {
  const handleDragEnd = jest.fn();

  render(
    <DndContext onDragEnd={handleDragEnd}>
      <CountyPill county={county} draggable />
    </DndContext>
  );

  // Simulate drag
  // ...

  expect(handleDragEnd).toHaveBeenCalled();
});
```

## Integration Points

### With Game Components
- **GameContainer**: Provides DndContext
- **GameHeader**: Displays county count
- **CaliforniaMapSimple**: Drop target for counties

### With State Management
- **GameContext**: Current county, placed counties
- **Sound Manager**: Audio feedback
- **Achievement System**: Track discovery milestones

## County Organization

### By Region
Counties are organized by California regions:
- **Bay Area**: 9 counties
- **Central Valley**: 18 counties
- **Southern California**: 10 counties
- **Northern California**: 15 counties
- **Central Coast**: 6 counties

### Sorting Options
```typescript
const sortCounties = (counties: County[], by: SortOption) => {
  switch (by) {
    case 'alphabetical':
      return [...counties].sort((a, b) => a.name.localeCompare(b.name));
    case 'population':
      return [...counties].sort((a, b) => (b.population || 0) - (a.population || 0));
    case 'area':
      return [...counties].sort((a, b) => (b.area || 0) - (a.area || 0));
    case 'region':
      return [...counties].sort((a, b) => a.region.localeCompare(b.region));
    default:
      return counties;
  }
};
```

## Related Components

- **GameContainer** (`/game`): Main game integration
- **CaliforniaMapSimple** (`/map`): Drop target
- **RegionsPanel** (`/regions`): Region filtering
- **UI Components** (`/ui`): Badge, Card for styling

## Related Documentation

- [County Data Structure](../../docs/COUNTY_DATA.md)
- [Drag-and-Drop System](../../docs/DRAG_DROP.md)
- [Sound Effects](../../docs/SOUND_EFFECTS.md)
- [Game Mechanics](../../docs/GAME_MECHANICS.md)

---

For the overall component architecture, see [Component Architecture](../README.md)
