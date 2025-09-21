# Colombia Puzzle Game Features Blueprint
## Comprehensive Implementation Guide for California Game

This document provides a detailed analysis of the Colombia puzzle game implementation patterns that can be adapted for the California game.

---

## 🎓 Study Mode Implementation

### Overview
The Colombia game features a sophisticated Study Mode that goes far beyond simple flashcards, implementing a progressive learning flow with smart recommendations.

### Core Components

#### 1. **StudyMode.tsx** - Main Study Interface
- **Multi-view Learning**: Cards, Grid, and Interactive Map views
- **Smart Flow Progression**: Explore → Focus → Quiz → Ready phases
- **Adaptive Recommendations**: Suggests game modes based on study progress
- **Progress Tracking**: Visual milestones and completion indicators

```typescript
interface StudyFlowState {
  phase: 'explore' | 'focus' | 'quiz' | 'ready';
  studiedDepartments: Set<string>;
  focusedRegion: string | null;
  quizCorrect: number;
  quizTotal: number;
}
```

#### 2. **StudyModeMap.tsx** - Interactive Map Component
- **Zoom & Pan Controls**: Mouse wheel zoom, drag panning
- **Visual Feedback**: Color-coded regions, studied indicators
- **Department Clustering**: Approximate positions with clear visual hierarchy
- **Interactive Elements**: Click handlers, hover states, tooltips

#### 3. **useStudyMode.ts** - Study Logic Hook
- **Spaced Repetition Algorithm**: SM-2 algorithm implementation
- **Card Management**: Progressive difficulty, timing intervals
- **Progress Persistence**: localStorage integration
- **Session Analytics**: Performance tracking

### Key Features for California Game

#### Smart Recommendations Engine
```typescript
const getRecommendedMode = (studiedCounties: Set<string>, allCounties: County[]): GameModeConfig => {
  // Analyze study progress by region
  // Find regions with >50% completion
  // Recommend appropriate difficulty level
}
```

#### Memory Aid System
- **Visual Associations**: Shape-based memory techniques
- **Geographic Tricks**: Location-based mnemonics
- **Cultural Facts**: Memorable historical/cultural connections
- **Rhymes & Wordplay**: Audio-based memory devices

#### Progressive Learning Flow
1. **Explore Phase**: Browse all counties/regions freely
2. **Focus Phase**: Concentrate on specific regions
3. **Quiz Phase**: Quick knowledge checks
4. **Ready Phase**: Transition to full game

---

## 🔊 Sound System Architecture

### Overview
Sophisticated Web Audio API implementation with procedural sound generation and comprehensive sound management.

### Core Implementation

#### **soundManager.ts** - Centralized Audio System
- **Web Audio API**: Modern browser audio with full control
- **Procedural Generation**: Creates sounds using oscillators
- **Sound Types**: 9 distinct sound effects for different actions
- **Performance Optimized**: Lazy loading, audio context management

### Sound Categories & Usage

#### Game Feedback Sounds
```typescript
type SoundType =
  | 'correct'    // C5 sine wave - positive feedback
  | 'incorrect'  // A3 sawtooth - negative feedback
  | 'pickup'     // A4 triangle - interaction start
  | 'drop'       // F4 sine - interaction end
  | 'win'        // C major chord - completion
  | 'hint'       // A5 sine - help provided
  | 'tick'       // White noise click - UI interaction
  | 'levelUp'    // Ascending sequence - progression
  | 'star'       // B5 triangle - achievement
```

#### Key Features
- **Dynamic Volume Control**: Master volume with per-sound adjustment
- **Audio Context Management**: Handles browser autoplay policies
- **Settings Persistence**: localStorage integration
- **Accessibility**: Can be disabled for hearing accessibility

### Implementation for California Game
- Adapt sound types for California-specific actions
- Add ambient sounds for different regions (beach, mountains, desert)
- Implement voice pronunciation for county names
- Add cultural sound elements (Gold Rush audio, Hollywood sounds)

---

## 🎨 Visual Feedback System

### Overview
Rich animation and visual feedback system providing immediate user response to all interactions.

### Core Components

#### **PlacementFeedback.tsx** - Immediate Visual Response
```typescript
interface PlacementFeedbackProps {
  show: boolean;
  isCorrect: boolean;
  departmentName?: string;
  position?: { x: number; y: number };
}
```

#### Key Features
- **Position-Based**: Appears exactly where user dropped item
- **Animated Feedback**: Bounce and pulse animations
- **Color-Coded**: Green for correct, red for incorrect
- **Ripple Effects**: Expanding circle animation
- **Auto-Dismissal**: 2-second display duration

#### **DragOverlay.tsx** - Drag Preview
- **Visual Consistency**: Matches original element styling
- **Enhanced Appearance**: Scaled and with shadow effects
- **Region Color Coding**: Maintains visual relationships
- **Smooth Transitions**: CSS transform animations

### Animation Patterns

#### CSS Classes Used
```css
.animate-bounce     /* Feedback appearance */
.animate-pulse      /* Attention drawing */
.animate-ping       /* Ripple effects */
.transform scale-*  /* Size changes */
.transition-all     /* Smooth transitions */
```

#### Timing Constants
```typescript
const TIMING = {
  FEEDBACK_DURATION_MS: 2000,
  ANIMATION_DURATION_MS: 500,
  HINT_DURATION_MS: 5000,
  FLASH_DURATION_MS: 3000
}
```

### California Game Adaptations
- **Geographic Theming**: Use California-specific colors (gold, blue, green)
- **Cultural Elements**: Incorporate California symbols (bear, poppy, star)
- **Regional Animations**: Different effects for different regions
- **Achievement Celebrations**: Special animations for milestones

---

## 🎮 Game Modes & Difficulty System

### Overview
Flexible game mode system supporting multiple play styles and progressive difficulty.

### Core Structure

#### **GameModeSelector.tsx** - Mode Selection Interface
```typescript
interface GameModeConfig {
  type: 'full' | 'region' | 'study';
  selectedRegions?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}
```

### Available Game Modes

#### 1. **Full Country Mode**
- All 33 departments at once
- Maximum challenge
- Complete geographic coverage

#### 2. **Regional Mode**
- Select specific regions
- Progressive difficulty
- Focused learning approach

#### 3. **Study Mode**
- Educational first approach
- Integrated learning tools
- Guided experience

### Difficulty Progression System

#### Region Difficulty Mapping
```typescript
const REGIONS = [
  { id: 'Insular', departments: 1, difficulty: 'Fácil' },
  { id: 'Pacífica', departments: 4, difficulty: 'Fácil' },
  { id: 'Orinoquía', departments: 4, difficulty: 'Medio' },
  { id: 'Amazonía', departments: 6, difficulty: 'Medio' },
  { id: 'Caribe', departments: 8, difficulty: 'Difícil' },
  { id: 'Andina', departments: 10, difficulty: 'Experto' }
];
```

#### Unlock System
- **Progressive Unlocking**: Star-based progression
- **Free Practice**: All regions available for study
- **Achievement Tracking**: Stars earned per region

### California Game Adaptations

#### California Regions by Difficulty
1. **Desert** (Easy): 4 counties - Imperial, Inyo, Mono, San Bernardino
2. **Central Coast** (Easy): 6 counties - Monterey, San Luis Obispo, Santa Barbara, Ventura, Santa Cruz, San Benito
3. **Central Valley** (Medium): 12 counties - Fresno, Kern, Kings, Madera, Merced, San Joaquin, Stanislaus, Tulare, etc.
4. **North Coast** (Medium): 8 counties - Mendocino, Humboldt, Del Norte, Lake, Napa, Sonoma, Marin, Solano
5. **Sierra Nevada** (Hard): 10 counties - Alpine, Amador, Calaveras, El Dorado, Mariposa, Nevada, Placer, Sierra, Tuolumne, Plumas
6. **Bay Area** (Expert): 9 counties - Alameda, Contra Costa, Marin, Napa, San Francisco, San Mateo, Santa Clara, Solano, Sonoma
7. **Greater LA** (Expert): 5 counties - Los Angeles, Orange, Riverside, San Bernardino, Ventura

---

## 💡 Hint System Implementation

### Overview
Sophisticated progressive hint system with multiple levels and smart cost management.

### Core Architecture

#### **useProgressiveHints.ts** - Hint Logic Hook
```typescript
type HintLevel = 'region' | 'letter' | 'flash' | null;

const HINT_COSTS = {
  region: 10,   // Show region highlight
  letter: 20,   // Show first letter
  flash: 50     // Show exact location
};
```

### Hint Progression System

#### Level 1: Region Hint (10 points)
- Highlights the correct region on map
- Provides regional context
- Visual guidance without giving away answer

#### Level 2: Letter Hint (20 points)
- Shows first letter of county name
- Combines with region highlighting
- Significant guidance while maintaining challenge

#### Level 3: Flash Hint (50 points)
- Briefly highlights exact location
- Maximum help available
- High cost reflects major assistance

### Smart Hint Features

#### **HintModal.tsx** - Contextual Help System
- **Adaptive Content**: Different hints based on geography
- **Progressive Disclosure**: Reveals information gradually
- **Cultural Context**: Includes local landmarks and history
- **Visual Design**: Themed modals with region colors

#### Geographic Intelligence
```typescript
const geographicHints: Record<string, {
  neighbors?: string[];
  position?: string;
  landmark?: string;
  size?: string;
}> = {
  // Detailed geographic relationships for each county
}
```

#### Hint Categories
1. **Coastal Counties**: Emphasize coastline and water access
2. **Border Counties**: Highlight international/state boundaries
3. **Small Counties**: Focus on size comparison
4. **Large Counties**: Emphasize area and geographic features
5. **Special Cases**: Unique characteristics (islands, capitals)

### California Game Hint Adaptations

#### Geographic Categories for California
1. **Coastal Counties**: Emphasize Pacific Ocean access
2. **Desert Counties**: Highlight desert characteristics
3. **Mountain Counties**: Focus on Sierra Nevada/other ranges
4. **Valley Counties**: Central Valley agricultural emphasis
5. **Urban Counties**: Major metropolitan areas
6. **Border Counties**: Mexico, Nevada, Oregon, Arizona borders

#### Cultural Hint Integration
- **Gold Rush History**: Historical significance
- **Hollywood & Entertainment**: Los Angeles area
- **Tech Industry**: Silicon Valley/Bay Area
- **Agriculture**: Central Valley farming
- **Wine Country**: Napa, Sonoma regions
- **National Parks**: Yosemite, Death Valley, etc.

---

## 🏗️ Architecture Patterns

### State Management with Zustand

#### **GameContext.tsx** - Centralized Game State
```typescript
interface GameState {
  departments: Department[];
  placedDepartments: Set<string>;
  currentDepartment: Department | null;
  gameMode: GameModeConfig;
  score: number;
  // ... other state properties
}
```

#### Key Patterns
- **Immutable Updates**: Proper state mutation patterns
- **Computed Properties**: Derived state calculations
- **Action Creators**: Consistent state modification methods
- **Type Safety**: Full TypeScript integration

### Data Architecture

#### **memoryAids.ts** - Learning Enhancement Data
```typescript
interface MemoryAid {
  mnemonic: string;           // Memory phrase/acronym
  visualAssociation: string;   // Visual memory cue
  geographicTrick: string;     // Location-based trick
  culturalFact: string;        // Cultural connection
  rhyme?: string;              // Optional rhyme
}
```

#### **regionColors.ts** - Consistent Visual Theming
- **Color Constants**: Centralized color management
- **Tailwind Classes**: Pre-built class combinations
- **Style Objects**: Complex styling patterns

### Component Patterns

#### Error Boundaries
- **ComponentErrorBoundary**: Isolated component protection
- **GameLogicErrorBoundary**: Game-specific error handling
- **MapErrorBoundary**: Map rendering protection

#### Modal Management
- **useModalManager**: Centralized modal state
- **Backdrop Handling**: Click-outside-to-close
- **Keyboard Navigation**: ESC key support

---

## 🎯 California Game Implementation Plan

### Phase 1: Core Infrastructure
1. **State Management**: Adapt Zustand store for California counties
2. **Data Structure**: Create California counties dataset
3. **Basic Game Loop**: Implement core drag-and-drop functionality
4. **Visual Framework**: Set up California-themed styling

### Phase 2: Study Mode
1. **Study Interface**: Adapt StudyMode component for California
2. **Memory Aids**: Create California-specific memory aids
3. **Interactive Map**: Build California county map component
4. **Progress Tracking**: Implement study progress system

### Phase 3: Audio & Visual Polish
1. **Sound System**: Integrate sound manager with California sounds
2. **Visual Feedback**: Implement placement feedback system
3. **Animations**: Add smooth transitions and hover effects
4. **Accessibility**: Ensure keyboard navigation and screen reader support

### Phase 4: Game Modes & Hints
1. **Mode Selection**: Implement region-based game modes
2. **Hint System**: Create progressive hint system for California
3. **Difficulty Progression**: Set up regional difficulty scaling
4. **Achievement System**: Track progress and unlock content

### Phase 5: Enhancement & Polish
1. **Cultural Integration**: Add California-specific cultural elements
2. **Performance Optimization**: Optimize for smooth gameplay
3. **Testing**: Comprehensive testing across all features
4. **Documentation**: User guides and developer documentation

---

## 📊 Technical Specifications

### Performance Requirements
- **Render Time**: <16ms for smooth 60fps animations
- **Audio Latency**: <50ms for responsive sound feedback
- **Memory Usage**: <100MB for full application
- **Load Time**: <3s for initial page load

### Browser Support
- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Support**: iOS 13+, Android 8+
- **Web Audio**: Required for sound features
- **Drag & Drop**: HTML5 drag and drop API

### Accessibility Standards
- **WCAG 2.1 AA**: Full compliance target
- **Keyboard Navigation**: Complete keyboard accessibility
- **Screen Readers**: ARIA labels and descriptions
- **Color Contrast**: 4.5:1 minimum ratio
- **Audio Controls**: Sound toggle and volume control

---

## 🚀 Getting Started

### Development Setup
1. Clone the California game repository
2. Install dependencies: `npm install`
3. Review this blueprint document
4. Start with Phase 1 implementation
5. Test each phase thoroughly before proceeding

### Key Files to Create/Modify
- `/src/components/StudyMode.tsx`
- `/src/components/StudyModeMap.tsx`
- `/src/services/soundManager.ts`
- `/src/components/PlacementFeedback.tsx`
- `/src/hooks/useProgressiveHints.ts`
- `/src/data/californiaMemoryAids.ts`
- `/src/constants/californiaRegions.ts`

### Testing Strategy
1. **Unit Tests**: Test individual components and hooks
2. **Integration Tests**: Test component interactions
3. **Accessibility Tests**: Screen reader and keyboard testing
4. **Performance Tests**: Animation and audio performance
5. **User Testing**: Educational effectiveness validation

This blueprint provides a comprehensive guide for implementing all the sophisticated features found in the Colombia puzzle game, adapted specifically for California counties. The modular architecture ensures maintainable, scalable code while providing an engaging and educational user experience.