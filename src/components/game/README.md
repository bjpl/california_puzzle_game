# Game Components

Core game functionality including UI, state management, game modes, and completion screens.

## Components

### Main Game Components

#### GameContainer.tsx
Main game orchestration component. Manages game state, county selection, drag-and-drop, scoring, and game flow.

**Key Features:**
- DndContext integration for drag-and-drop
- Sound effect management
- Study mode integration
- Game state transitions

**Usage:**
```typescript
import GameContainer from '@/components/game/GameContainer';

<GameContainer />
```

#### GameHeader.tsx
Top bar displaying game progress, statistics, and controls.

**Displays:**
- Score and mistakes
- Timer (starts on first move)
- Progress bar
- Control buttons (sound, pause, reset, study mode, hints)

**Usage:**
```typescript
import GameHeader from '@/components/game/GameHeader';

<GameHeader />
```

#### GameComplete.tsx
Victory screen shown when all counties are placed.

**Features:**
- Final score and statistics
- Performance grading (Perfect, Excellent, Good, Complete)
- Play again / Main menu buttons
- Share achievement options

**Usage:**
```typescript
import GameComplete from '@/components/game/GameComplete';

<GameComplete />
```

### Additional Game Components

#### GameModeSelector.tsx
Allows players to choose between different game modes.

#### CaliforniaGameContainer.tsx
Alternative game container with different features.

#### CaliforniaGameWithHints.tsx
Game variant with enhanced hint system.

#### EnhancedGameContainer.tsx
Extended game container with additional features.

## Architecture

### State Management
Game components use the `GameContext` (Zustand-based) for shared state:

```typescript
import { useGame } from '@/context/GameContext';

const {
  isGameStarted,
  isGameComplete,
  startGame,
  resetGame,
  selectCounty,
  placeCounty,
  currentCounty,
  counties,
  placedCounties,
  score,
  mistakes,
  hints,
  timerState
} = useGame();
```

### Game Flow
1. **Pre-Game**: Welcome screen with "Begin Exploration" and "Study Mode" buttons
2. **Playing**: Main game with map, county tray, header, and regions panel
3. **Complete**: Victory screen with statistics and options to replay

### Drag-and-Drop Integration
Uses `@dnd-kit/core` for county placement:

```typescript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 8 }
  })
);

<DndContext
  sensors={sensors}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
>
  {/* Game content */}
</DndContext>
```

### Sound System
Integrated with `simpleSoundManager` for audio feedback:
- **Pickup**: County selection
- **Correct**: Successful placement
- **Incorrect**: Wrong placement
- **Hover**: Hint button
- **Win**: Game completion

### Timer Behavior
- Timer starts on **first county placement** (not at game start)
- Pauses when study mode is opened
- Resumes when study mode closes
- Displays "Ready" state before first move

## Components Directory Structure

```
game/
├── GameContainer.tsx              - Main game orchestration
├── GameHeader.tsx                 - Top bar with controls
├── GameComplete.tsx               - Victory screen
├── GameModeSelector.tsx           - Mode selection
├── CaliforniaGameContainer.tsx    - Alternative container
├── CaliforniaGameWithHints.tsx    - Hint-enhanced variant
├── EnhancedGameContainer.tsx      - Extended features
├── index.ts                       - Barrel export
└── README.md                      - This file
```

## Integration Points

### With Other Components
- **CountyTray** (`/county`): Provides draggable county pills
- **CaliforniaMapSimple** (`/map`): Interactive map for county placement
- **RegionsPanel** (`/regions`): Region filtering and colors
- **EnhancedStudyMode** (`/study-new`): Learning mode
- **HintModal** (`/modals`): Contextual hints
- **UI Components** (`/ui`): Button, Card, Badge, Progress, etc.

### With Context/State
- **GameContext**: Primary state management
- **Sound Manager**: Audio feedback
- **Achievement System**: Track milestones
- **Hint System**: Progressive hints

## Props & Interfaces

### GameContainer
```typescript
// Currently no props - uses GameContext
export default function GameContainer(): JSX.Element
```

### GameHeader
```typescript
// Currently no props - uses GameContext
export default function GameHeader(): JSX.Element
```

### GameComplete
```typescript
// Currently no props - uses GameContext
export default function GameComplete(): JSX.Element
```

## Usage Examples

### Basic Game Setup
```typescript
import { GameProvider } from '@/context/GameContext';
import GameContainer from '@/components/game/GameContainer';

function App() {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
}
```

### Accessing Game State
```typescript
import { useGame } from '@/context/GameContext';

function CustomComponent() {
  const { score, placedCounties, isGameComplete } = useGame();

  return (
    <div>
      Score: {score} | Placed: {placedCounties.size}
    </div>
  );
}
```

## Performance Grading

The `GameComplete` component calculates grades based on mistakes:
- **Perfect** (🏆): 0 mistakes
- **Excellent** (⭐): 1-3 mistakes
- **Good Job** (👍): 4-6 mistakes
- **Complete** (✅): 7+ mistakes

## Known Issues & Improvements

See [Tech Debt Cleanup Report](../../docs/TECH_DEBT_CLEANUP_REPORT.md) for:
- Timer state management improvements
- Sound initialization on first interaction
- Study mode portal rendering
- Drag overlay styling

## Planned Features

- [ ] Multiple difficulty levels
- [ ] Timed challenge mode
- [ ] Achievement notifications in-game
- [ ] Multiplayer support
- [ ] Custom region challenges
- [ ] Leaderboards

## Testing

### Unit Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import GameContainer from './GameContainer';
import { GameProvider } from '@/context/GameContext';

test('renders welcome screen initially', () => {
  render(
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
  expect(screen.getByText('California Counties Explorer')).toBeInTheDocument();
});

test('starts game when Begin Exploration is clicked', () => {
  render(
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
  fireEvent.click(screen.getByText('Begin Exploration'));
  expect(screen.getByText('California Counties Puzzle')).toBeInTheDocument();
});
```

## Accessibility

- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Descriptive labels on all buttons
- **Keyboard Navigation**: Tab through controls, Enter to activate
- **Focus Management**: Visible focus indicators
- **Screen Reader Support**: Announces game state changes

## Related Documentation

- [Game State Architecture](../../docs/GAME_STATE.md)
- [Achievement System](../../docs/ACHIEVEMENTS.md)
- [Sound System](../../docs/SOUND_SYSTEM.md)
- [UI Components](../ui/README.md)
- [County Components](../county/README.md)
- [Map Components](../map/README.md)

---

For the overall component architecture, see [Component Architecture](../README.md)
