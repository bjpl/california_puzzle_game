# California Counties Puzzle - Component Structure

**Last Updated:** 2025-09-27
**Status:** ✅ Fully Reorganized (Feature-Based Architecture)

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Folder Structure](#folder-structure)
3. [Component Catalog](#component-catalog)
4. [Import Patterns](#import-patterns)
5. [Key Concepts](#key-concepts)

---

## 🏗️ Architecture Overview

The codebase follows a **feature-based** component architecture where components are organized by their functional domain rather than technical type. This improves:

- **Maintainability**: Related components are co-located
- **Discoverability**: Easy to find components by feature area
- **Scalability**: New features get their own folders
- **Import Clarity**: Barrel exports provide clean import paths

### Design Principles

1. **Feature Cohesion**: Components grouped by what they do, not what they are
2. **Single Responsibility**: Each component has one clear purpose
3. **Composition**: Complex UIs built from smaller, reusable pieces
4. **Type Safety**: TypeScript interfaces for all component props

---

## 📁 Folder Structure

```
src/components/
├── game/             # Core game containers and orchestration (7 files)
├── map/              # Map rendering and interaction (4 files)
├── county/           # County-specific components (9 files)
├── study-new/        # Study mode and learning features (3 files)
├── ui/               # Reusable UI elements (8 files)
├── gameplay/         # Game mechanics and systems (5 files)
├── achievements/     # Achievement display and notifications (3 files)
├── hints/            # Hint system and visual indicators (3 files)
├── regions/          # Region-based functionality (1 file)
├── modals/           # Modal dialogs (2 files)
├── effects/          # Visual effects and transitions (2 files)
├── settings/         # Settings, statistics, sound (3 files)
├── features/         # Future features (0 files currently)
└── _deprecated/      # Unused/old components (5 files)
```

**Total:** 51 active components organized across 13 feature folders

---

## 🗂️ Component Catalog

### 🎮 game/ - Core Game Components (7 files)

**Purpose:** Main game containers that orchestrate the entire game experience.

| Component                     | Lines | Purpose                                                                    | Key Dependencies                               |
| ----------------------------- | ----- | -------------------------------------------------------------------------- | ---------------------------------------------- |
| `GameContainer.tsx`           | 198   | **Main game orchestrator** - Handles drag-drop, game state, mode switching | DndContext, GameContext, SimpleSoundManager    |
| `EnhancedGameContainer.tsx`   | 406   | **Advanced game container** with mode selection and progression            | GameStore, DifficultySystem, ProgressionSystem |
| `CaliforniaGameContainer.tsx` | 629   | **Full-featured game** with region selection, pause, achievements          | MotionFramer, GameStore, CaliforniaMapCanvas   |
| `CaliforniaGameWithHints.tsx` | ~200  | Game container with integrated hint system                                 | HintSystem, HintVisualIndicators               |
| `GameHeader.tsx`              | ~150  | **Game header** with score, timer, settings                                | GameContext, SoundManager, HintModal           |
| `GameComplete.tsx`            | ~100  | **Victory screen** with grade calculation                                  | GameContext, SoundManager                      |
| `GameModeSelector.tsx`        | ~150  | **Mode selection UI** with categories and filters                          | GameModes config, ModeCard                     |

**Key Patterns:**

- Game containers use React Context (`GameContext`, `GameStore`) for state
- Sound feedback on all interactions via `simpleSoundManager`
- Drag-and-drop powered by `@dnd-kit/core`

---

### 🗺️ map/ - Map Components (4 files)

**Purpose:** Rendering and interaction with the California map.

| Component                 | Lines | Purpose                                           | Technology                  |
| ------------------------- | ----- | ------------------------------------------------- | --------------------------- |
| `CaliforniaMapFixed.tsx`  | ~400  | **Interactive SVG map** with droppable zones      | D3.js GeoJSON, DnD Kit      |
| `CaliforniaMapSimple.tsx` | ~800  | **Simplified map** with region colors, study mode | SVG paths, React hooks      |
| `CaliforniaMapCanvas.tsx` | ~500  | **Canvas-based map** for performance              | HTML5 Canvas, D3 projection |
| `StudyModeMap.tsx`        | ~400  | **Study-focused map** with county highlighting    | SVG, zoom/pan controls      |

**Key Features:**

- Real California county GeoJSON data
- Interactive hover states and tooltips
- Region-based color coding
- Zoom and pan controls
- Drop zones for drag-and-drop gameplay

---

### 🏛️ county/ - County Components (9 files)

**Purpose:** Components for displaying and interacting with individual counties.

| Component                      | Lines   | Purpose                                |
| ------------------------------ | ------- | -------------------------------------- |
| `CountyCard.tsx`               | ~150    | Compact card showing county info       |
| `CountyDetailsModal.tsx`       | ~300    | Detailed county information modal      |
| `CountyFormationAnimation.tsx` | **855** | **Animated county formation timeline** |
| `CountyList.tsx`               | ~200    | Filterable list of counties            |
| `CountyShapeDisplay.tsx`       | ~100    | Mini SVG visualization of county shape |
| `CountyTray.tsx`               | ~200    | Draggable county selection tray        |

**Data Sources:**

- `/data/californiaCountyBoundaries.ts` - GeoJSON shapes
- `/data/californiaCounties.ts` - County metadata
- `/data/countyEducation.ts` - Educational content
- `/data/countyEducationComplete.ts` - Comprehensive education data

---

### 📚 study-new/ - Study Mode Components (3 files)

**Purpose:** Educational study mode with multiple learning approaches.

| Component               | Lines     | Purpose                           | View Modes                              |
| ----------------------- | --------- | --------------------------------- | --------------------------------------- |
| `EnhancedStudyMode.tsx` | **1,637** | **Comprehensive study interface** | Explore, Quiz, Map, Timeline, Formation |
| `StudyMode.tsx`         | ~200      | Basic study mode component        | -                                       |
| `StudyModeCard.tsx`     | ~100      | Study session card display        | -                                       |

**EnhancedStudyMode Features:**

- **5 View Modes:**
  - `explore` - Browse counties with detailed info
  - `quiz` - Interactive quizzes with progress tracking
  - `map` - Visual map-based exploration
  - `timeline` - Historical timeline view
  - `formation` - Animated county formation history
- Progress tracking (studied, mastered, quizzes completed)
- LocalStorage persistence
- Quiz system with 10-question sessions
- Educational modals with tabs (overview, history, economy, culture, geography, memory)

**⚠️ Refactoring Candidate:** EnhancedStudyMode.tsx is very large (1,637 lines) and should be split into:

- View mode components (5 separate files)
- `useStudyProgress` hook
- `useQuizSystem` hook
- `StudyModeSidebar` component

---

### 🎨 ui/ - Reusable UI Components (8 files)

**Purpose:** Generic, reusable UI building blocks.

| Component               | Purpose                    | Usage                        |
| ----------------------- | -------------------------- | ---------------------------- |
| `CaliforniaButton.tsx`  | Themed button component    | Primary/secondary variants   |
| `Timer.tsx`             | Game timer display         | Shows MM:SS format           |
| `ScoreDisplay.tsx`      | Score visualization        | Points with animations       |
| `MultiplierDisplay.tsx` | Score multiplier indicator | Shows combo bonuses          |
| `ComboIndicator.tsx`    | Visual combo streak        | Animated streak counter      |
| `ProgressIndicator.tsx` | Progress bar               | Completion percentage        |
| `PlacementFeedback.tsx` | Placement result feedback  | Correct/incorrect animations |
| `PointsPopup.tsx`       | Floating points animation  | +50, +100, etc.              |

**Design System:**

- Uses `/styles/educational-design.css` for consistent theming
- California-themed colors (navy, forest, sand, clay)
- Clean, educational aesthetic (no flashy gradients)

---

### 🎯 gameplay/ - Game Mechanics (5 files)

**Purpose:** Core game systems and mechanics.

| Component               | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `DifficultySystem.tsx`  | Difficulty level management and settings |
| `ProgressionSystem.tsx` | Player progression and unlocks           |
| `RegionSelector.tsx`    | UI for selecting California regions      |
| `ModeCard.tsx`          | Game mode selection card                 |
| `DragDropPhysics.tsx`   | Physics for drag-and-drop interactions   |

**Game Mechanics:**

- Difficulty levels: Easy, Medium, Hard
- Region-based gameplay (Bay Area, Central Valley, etc.)
- Progressive unlocking system
- Score calculation and multipliers

---

### 🏆 achievements/ - Achievement System (3 files)

**Purpose:** Achievement tracking and display.

| Component                     | Purpose                          |
| ----------------------------- | -------------------------------- |
| `AchievementGallery.tsx`      | Grid display of all achievements |
| `AchievementNotification.tsx` | Toast notification for unlocks   |
| `AchievementBadge.tsx`        | Individual achievement badge     |

**Achievement System:**

- Rarity levels (Common, Rare, Epic, Legendary)
- Categories (Learning, Mastery, Speed, Accuracy)
- Progress tracking
- Unlock conditions

---

### 💡 hints/ - Hint System (3 files)

**Purpose:** Contextual hints and learning aids.

| Component                  | Purpose                        |
| -------------------------- | ------------------------------ |
| `HintSystem.tsx`           | Hint generation and management |
| `HintVisualIndicators.tsx` | Visual hints on map            |
| `HintModal.tsx`            | Detailed hint modal            |

**Hint Types:**

- Location hints (region, neighboring counties)
- Visual indicators (highlight, arrow, glow)
- Educational hints (facts, memory aids)
- Progressive hint system (more detailed over time)

---

### 🌎 regions/ - Region Components (1 file)

**Purpose:** California region management.

| Component          | Purpose                     |
| ------------------ | --------------------------- |
| `RegionsPanel.tsx` | Toggle region color overlay |

**Regions:**

- Bay Area
- Central Valley
- Southern California
- Northern California
- Central Coast
- Inland Empire
- Sierra Nevada

---

### 🔔 modals/ - Modal Dialogs (2 files)

**Purpose:** Full-screen or overlay modal dialogs.

| Component                     | Purpose                    |
| ----------------------------- | -------------------------- |
| `EducationalContentModal.tsx` | Educational content viewer |
| `HintModal.tsx`               | Hint information modal     |

Uses `createPortal` for proper z-index layering.

---

### ✨ effects/ - Visual Effects (2 files)

**Purpose:** Animations and visual enhancements.

| Component            | Purpose                    |
| -------------------- | -------------------------- |
| `HoverEffects.tsx`   | Hover state animations     |
| `PageTransition.tsx` | Page transition animations |

Uses Framer Motion for smooth animations.

---

### ⚙️ settings/ - Settings & Stats (3 files)

**Purpose:** Game settings, statistics, and preferences.

| Component                | Purpose                        |
| ------------------------ | ------------------------------ |
| `SoundSettings.tsx`      | Audio volume and mute controls |
| `Statistics.tsx`         | Player statistics dashboard    |
| `ReturnToGameBanner.tsx` | Resume game notification       |

**Settings Persisted:**

- Sound volume (master, effects, music)
- Game preferences
- Statistics and progress

---

### 🗑️ \_deprecated/ - Deprecated Components (5 files)

**Purpose:** Old/unused components kept for reference.

| Component                 | Status                         |
| ------------------------- | ------------------------------ |
| `CaliforniaMap.tsx`       | Replaced by CaliforniaMapFixed |
| `CaliforniaMapReal.tsx`   | Early prototype                |
| `CaliforniaMapDemo.tsx`   | Demo/test component            |
| `SimpleMapTest.tsx`       | Test component                 |
| `CaliforniaThemeDemo.tsx` | Theme showcase                 |

**⚠️ Action:** These files are safe to delete after final review.

---

## 📦 Import Patterns

### Barrel Exports

Every folder has an `index.ts` that exports all components:

```typescript
// src/components/game/index.ts
export { default as GameContainer } from './GameContainer';
export { default as GameHeader } from './GameHeader';
export { default as GameComplete } from './GameComplete';
// ... etc
```

### Usage

```typescript
// ✅ GOOD: Use barrel exports
import { GameContainer, GameHeader } from '@/components/game';

// ❌ AVOID: Direct imports (still works, but less clean)
import GameContainer from '@/components/game/GameContainer';
```

### Cross-Folder Imports

```typescript
// From game/ importing from map/
import { CaliforniaMapSimple } from '../map';

// From anywhere importing context
import { useGame } from '@/context/GameContext';
```

---

## 🔑 Key Concepts

### 1. Context-Based State Management

**GameContext** (`/context/GameContext.tsx`):

- Global game state
- County management
- Drag-drop state
- Timer state

**GameStore** (`/stores/gameStore.tsx`):

- Zustand-based store for complex state
- Game modes and progression
- Settings and preferences

### 2. Sound System

**SimpleSoundManager** (`/utils/simpleSoundManager.ts`):

- Web Audio API implementation
- Generated tones (no audio files needed)
- Sound types: `correct`, `incorrect`, `pickup`, `drop`, `win`, `hint`, `click`, `hover`, `achievement`

### 3. Data Layer

**California Data** (`/data/`):

- `californiaCounties.ts` - County metadata
- `californiaCountyBoundaries.ts` - GeoJSON shapes
- `countyEducation.ts` - Educational content
- `californiaQuizQuestions.ts` - Quiz questions
- `memoryAids.ts` - Learning mnemonics

### 4. Type System

**Types** (`/types/index.ts`):

- `County` - County data interface
- `GameSettings` - Game configuration
- `Achievement` - Achievement definition
- `DifficultyLevel` - enum
- `CaliforniaRegion` - enum

---

## 🚀 Future Improvements

### Recommended Refactorings

1. **EnhancedStudyMode.tsx** (1,637 lines)
   - Extract 5 view mode components
   - Create `useStudyProgress` hook
   - Create `useQuizSystem` hook
   - Extract sidebar and header components
   - **Target:** <300 lines per file

2. **CountyFormationAnimation.tsx** (855 lines)
   - Extract `FormationControls` component
   - Extract `FormationTimeline` component
   - Extract `FormationInfoPanel` component
   - Create `useFormationAnimation` hook
   - **Target:** <400 lines per file

3. **Create Shared Hooks**
   - `useCountyData` - Centralize county data access
   - `useProgress` - Progress tracking across components
   - `useAudio` - Simplified sound management

4. **Performance Optimizations**
   - Lazy load view modes in EnhancedStudyMode
   - Virtualize county lists
   - Optimize map rendering

---

## 📚 Related Documentation

- [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) - Component reorganization plan
- [CODEBASE_REVIEW.md](./CODEBASE_REVIEW.md) - Complete codebase analysis
- [README.md](../README.md) - Project overview
- [educational-design.css](../src/styles/educational-design.css) - Design system

---

## 📝 Component Lifecycle Diagram

```
User loads app
    ↓
App.tsx
    ↓
GameProvider (Context)
    ↓
GameContainer ← Main orchestrator
    ├→ GameHeader (score, timer, settings)
    ├→ RegionsPanel (optional region colors)
    ├→ DndContext (drag-drop)
    │   ├→ CountyTray (draggable counties)
    │   └→ CaliforniaMapSimple (drop zones)
    ├→ GameComplete (on finish)
    └→ EnhancedStudyMode (on study button)
        ├→ Explore View
        ├→ Quiz View
        ├→ Map View
        ├→ Timeline View
        └→ Formation View
```

---

**End of Component Structure Documentation**

_For questions or updates, refer to the main README or contact the development team._
