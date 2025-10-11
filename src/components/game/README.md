# Game Components

All game-related components for the California Counties Puzzle game.

## Structure

```
game/
├── achievements/       - Achievement system (notifications, gallery)
├── hints/             - Hint system (visual indicators, hint modal)
├── modals/            - Game modals (educational content, hints)
├── GameContainer.tsx  - Main game orchestration and DnD context
├── GameHeader.tsx     - Game statistics and controls
├── GameComplete.tsx   - Victory screen
├── DifficultySystem.tsx - Difficulty settings management
├── ProgressionSystem.tsx - Player progression tracking
├── ModeCard.tsx       - Game mode selection card
└── RegionSelector.tsx - Region filtering UI
```

## Key Components

### GameContainer
Main orchestration component handling:
- Drag-and-drop context (DnDKit)
- Game state transitions
- Sound effect management
- Study mode integration

### GameHeader
Top navigation bar displaying:
- Score, mistakes, timer, progress
- Controls: Study mode, hints, sound, pause/resume, reset
- Progressive hint system (3 levels)

### GameComplete
Victory screen showing:
- Final statistics and performance
- Achievement unlocks
- Replay/new game options
