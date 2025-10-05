# Component Architecture

## Directory Structure

```
components/
├── ui/              - Design system components (Button, Card, Badge, Progress, Typography)
├── game/            - Game-specific components and features
├── map/             - California map rendering with D3.js
├── county/          - County-specific components (tray, pills, info)
├── study/           - Study mode features and learning tools
├── study-new/       - Enhanced study mode (v2)
├── achievements/    - Achievement tracking and notifications
├── hints/           - Hint system and visual indicators
├── modals/          - Modal dialogs and overlays
├── regions/         - Region-specific utilities and panels
├── settings/        - Application settings and preferences
├── effects/         - Visual effects and animations
├── features/        - Feature-specific components
├── gameplay/        - Core gameplay mechanics
└── _deprecated/     - Legacy components (do not use)
```

## Component Guidelines

### File Organization
- Each component in its own file using PascalCase (e.g., `GameContainer.tsx`)
- Co-locate tests: `Component.test.tsx`
- Co-locate styles: `Component.css` or use Tailwind classes
- Export from index files for clean imports

### Naming Conventions
- **Components**: PascalCase (e.g., `GameContainer`, `CountyTray`)
- **Utilities**: camelCase (e.g., `useGame`, `formatTime`)
- **Constants**: UPPER_CASE (e.g., `MAX_COUNTIES`, `DEFAULT_REGION`)
- **Types/Interfaces**: PascalCase with descriptive names (e.g., `GameContainerProps`, `County`)

### Import Aliases
Use path aliases for cleaner imports:

```typescript
// Preferred: Use alias imports
import { Button, Card } from '@/components/ui';
import { GameContainer } from '@/components/game';
import { useGame } from '@/context/GameContext';

// Avoid: Relative paths
import { Button } from '../../../components/ui/Button';
```

## Core Component Categories

### 1. UI Components (`/ui`)
Design system components following the style guide. See [ui/README.md](./ui/README.md) for details.
- Button, Card, Badge, Progress
- Typography (Heading, Text, Code, Label)
- Full TypeScript support with comprehensive props

### 2. Game Components (`/game`)
Main game orchestration and UI. See [game/README.md](./game/README.md) for details.
- GameContainer - Main game state and flow
- GameHeader - Progress, timer, controls
- GameComplete - Victory screen

### 3. Map Components (`/map`)
California map rendering using D3.js. See [map/README.md](./map/README.md) for details.
- CaliforniaMapFixed (SVG)
- CaliforniaMapCanvas (performance)
- StudyModeMap (interactive learning)

### 4. Study Components (`/study`)
Enhanced learning features. See [study/README.md](./study/README.md) for details.
- Multiple study modes (flashcards, grid, exploration)
- Progress tracking
- Spaced repetition

### 5. County Components (`/county`)
County-specific UI and interactions. See [county/README.md](./county/README.md) for details.
- CountyTray - Drag-and-drop source
- CountyPill - Individual county items
- CountyInfoPanel - Detailed county information

## Architecture Patterns

### State Management
- **Zustand Stores**: Game state, achievements, hints, study progress
- **React Context**: GameContext for shared game state
- **Local State**: Component-specific UI state with useState

### Component Patterns
1. **Container/Presentational**: Separate logic from presentation
2. **React Hooks**: Custom hooks for reusable logic (useGame, useSoundEffect)
3. **D3 + React**: React manages lifecycle, D3 handles calculations
4. **Portal Pattern**: Modals and overlays rendered at document.body

### Performance Considerations
- Canvas for >100 elements (better performance)
- SVG for interactive features (better accessibility)
- Memoization for expensive calculations
- useEffect cleanup for memory management

## Documentation
Each major folder has its own README with:
- Component listing and descriptions
- Usage examples
- Architecture notes
- Related documentation links

## Testing Guidelines

### Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { GameContainer } from './GameContainer';

test('starts game on button click', () => {
  render(<GameContainer />);
  const startButton = screen.getByText('Begin Exploration');
  fireEvent.click(startButton);
  expect(screen.getByText('California Counties Puzzle')).toBeInTheDocument();
});
```

### Testing Best Practices
- Test user interactions, not implementation
- Use semantic queries (getByRole, getByLabelText)
- Mock external dependencies (sound, timers)
- Test accessibility with ARIA attributes

## Accessibility

All components should follow accessibility guidelines:
- **Semantic HTML**: Use proper HTML5 elements
- **ARIA labels**: Descriptive labels for screen readers
- **Keyboard navigation**: Support Tab, Enter, Escape
- **Focus management**: Visible focus indicators
- **Color contrast**: WCAG AA compliance

## Code Style

### TypeScript
```typescript
// Always define prop interfaces
interface GameContainerProps {
  /** Initial difficulty level */
  initialDifficulty?: 'easy' | 'medium' | 'hard';
  /** Callback when game completes */
  onGameComplete?: (stats: GameStats) => void;
}

// Use descriptive type names
type GameState = 'idle' | 'playing' | 'paused' | 'complete';

// Export types alongside components
export type { GameContainerProps };
```

### JSDoc Comments
All public components and functions should have JSDoc comments:

```typescript
/**
 * GameContainer - Main game orchestration component
 *
 * Manages game state, county selection, scoring, and game flow.
 * Integrates map, header, county tray, and completion screens.
 *
 * @component
 * @example
 * ```tsx
 * <GameContainer
 *   initialDifficulty="medium"
 *   onGameComplete={handleComplete}
 * />
 * ```
 */
export function GameContainer({ initialDifficulty, onGameComplete }: GameContainerProps) {
  // ...
}
```

## Migration & Deprecation

### Deprecated Components
Components in `_deprecated/` are no longer maintained:
- **SimpleMapTest** - Use CaliforniaMapSimple instead
- Legacy components from previous iterations

### Migration Path
When deprecating a component:
1. Move to `_deprecated/` folder
2. Add deprecation notice in JSDoc
3. Update all imports to new component
4. Document migration in component README

## Related Documentation

### Design & Architecture
- [Design System Reference](../../docs/DESIGN_SYSTEM_REFERENCE.md)
- [Style Guide](../../docs/STYLE_GUIDE.html)
- [Architecture Overview](../../docs/ARCHITECTURE.md)

### Technical Documentation
- [Tech Debt Cleanup Report](../../docs/TECH_DEBT_CLEANUP_REPORT.md)
- [Integration Summary](../../INTEGRATION_SUMMARY.md)
- [README](../../README.md)

## Quick Reference

### Common Import Patterns
```typescript
// UI Components
import { Button, Card, Badge, Progress, Heading, Text } from '@/components/ui';

// Game Components
import { GameContainer, GameHeader, GameComplete } from '@/components/game';

// Map Components
import { CaliforniaMapSimple, StudyModeMap } from '@/components/map';

// Study Components
import { EnhancedStudyMode, StudyProgress } from '@/components/study-new';

// County Components
import { CountyTray, CountyPill } from '@/components/county';

// Context & Hooks
import { useGame } from '@/context/GameContext';
import { useSoundEffect } from '@/utils/simpleSoundManager';
```

### Component Checklist
When creating a new component:
- [ ] TypeScript interface for props
- [ ] JSDoc comments with @component tag
- [ ] Usage example in JSDoc
- [ ] Export from folder's index.ts
- [ ] Add to folder's README.md
- [ ] Include accessibility attributes
- [ ] Add basic tests
- [ ] Follow naming conventions

---

For specific component documentation, see the README files in each subdirectory.
