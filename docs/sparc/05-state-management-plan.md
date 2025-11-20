# SPARC Specification: State Management Consolidation Plan

**Priority:** MEDIUM (6/10 ROI)
**Effort:** 3 hours
**Target:** Eliminate state duplication, unified Zustand architecture

---

## 1. SPECIFICATION PHASE

### 1.1 Requirements

#### Primary Requirements

1. **Document State Duplication Issue** (Technical Debt)
   - Identify all instances of duplicate state (React Context + Zustand)
   - Map data flow for each state variable
   - Document current issues caused by duplication
   - Create visual diagrams of state architecture

2. **Create Migration Plan** (Phased Approach)
   - Define migration strategy (Context → Zustand)
   - Prioritize state by risk and impact
   - Create rollback plan for each phase
   - Define success criteria for each migration step

3. **Add JSDoc Warnings** (Prevent Further Duplication)
   - Add deprecation warnings to Context files
   - Document preferred state management pattern
   - Add linter rules to prevent new Context usage
   - Create migration guide for developers

4. **Plan Phased Migration** (Risk Mitigation)
   - Phase 1: Low-risk state (UI state)
   - Phase 2: Medium-risk state (game progress)
   - Phase 3: High-risk state (core game logic)
   - Each phase with comprehensive testing

#### Non-Functional Requirements

- **Zero Breaking Changes:** Migration must be transparent to users
- **Backward Compatibility:** Components work during migration
- **Testability:** Each phase fully tested before proceeding
- **Rollback Safety:** Easy revert for any phase
- **Performance:** No performance degradation during migration

### 1.2 Success Criteria

#### Acceptance Tests

1. **State Duplication Documented**
   ```
   GIVEN: Current codebase
   WHEN: State management analysis complete
   THEN: All duplicate state variables documented
   AND: Data flow diagrams created
   AND: Issue impact assessed
   ```

2. **Migration Plan Created**
   ```
   GIVEN: Migration plan document
   WHEN: Reviewed by development team
   THEN: Clear steps for each phase defined
   AND: Success criteria for each phase documented
   AND: Rollback procedures documented
   ```

3. **Warnings Added**
   ```
   GIVEN: GameContext.tsx file
   WHEN: Developer imports from GameContext
   THEN: IDE shows deprecation warning
   AND: Warning directs to Zustand store
   ```

4. **Migration Feasibility Validated**
   ```
   GIVEN: Proof-of-concept migration (one state variable)
   WHEN: Tests run
   THEN: All tests pass
   AND: No performance regression
   AND: No functional regression
   ```

#### Validation Criteria

- **Documentation:** Complete state duplication audit
- **Migration Plan:** Stakeholder-approved phased approach
- **Developer Experience:** Clear deprecation warnings in IDE
- **Risk Assessment:** All risks identified and mitigated

### 1.3 Edge Cases

1. **Components Using Both Context and Zustand**
   - Identify components with dual dependencies
   - Plan gradual migration strategy
   - Ensure no temporary state loss

2. **State Synchronization Issues**
   - Document current sync bugs
   - Prove migration eliminates issues
   - Add tests to prevent regression

3. **Performance During Migration**
   - Monitor bundle size changes
   - Ensure no memory leaks during dual-state period
   - Optimize Zustand selectors for performance

4. **Third-Party Dependencies**
   - Identify libraries depending on Context
   - Plan compatibility updates
   - Test integration after migration

---

## 2. PSEUDOCODE PHASE

### 2.1 State Duplication Analysis Algorithm

```typescript
// Script: analyze-state-duplication.ts

interface StateVariable {
  name: string;
  type: string;
  sources: ('context' | 'zustand')[];
  components: string[];
  updateFrequency: 'high' | 'medium' | 'low';
  risk: 'critical' | 'high' | 'medium' | 'low';
}

function analyzeStateDuplication(): StateVariable[] {
  // 1. Parse GameContext.tsx
  const contextState = parseContextFile('src/context/GameContext.tsx');

  // 2. Parse gameStore.ts
  const zustandState = parseZustandStore('src/stores/gameStore.ts');

  // 3. Find duplicates
  const duplicates: StateVariable[] = [];

  contextState.forEach(contextVar => {
    const zustandMatch = zustandState.find(z => z.name === contextVar.name);

    if (zustandMatch) {
      duplicates.push({
        name: contextVar.name,
        type: contextVar.type,
        sources: ['context', 'zustand'],
        components: findComponentsUsingState(contextVar.name),
        updateFrequency: analyzeUpdateFrequency(contextVar.name),
        risk: assessMigrationRisk(contextVar.name),
      });
    }
  });

  // 4. Generate report
  return duplicates;
}

// Risk assessment
function assessMigrationRisk(stateName: string): 'critical' | 'high' | 'medium' | 'low' {
  const criticalState = ['currentCounty', 'gameMode', 'isGameActive'];
  const highRiskState = ['score', 'hintsRemaining', 'placedCounties'];
  const mediumRiskState = ['selectedCounty', 'hoveredCounty'];

  if (criticalState.includes(stateName)) return 'critical';
  if (highRiskState.includes(stateName)) return 'high';
  if (mediumRiskState.includes(stateName)) return 'medium';
  return 'low';
}
```

### 2.2 Migration Strategy Algorithm

```typescript
// Migration phases
const MIGRATION_PHASES = {
  PHASE_1: {
    name: 'UI State Migration',
    duration: '1 hour',
    risk: 'low',
    states: [
      'hoveredCounty',
      'selectedCounty',
      'showInstructions',
      'showSettings',
    ],
    components: ['GameMap', 'GameHeader', 'SettingsModal'],
  },

  PHASE_2: {
    name: 'Game Progress Migration',
    duration: '1 hour',
    risk: 'medium',
    states: [
      'score',
      'hintsRemaining',
      'placedCounties',
      'incorrectAttempts',
    ],
    components: ['CaliforniaGameContainer', 'ScoreDisplay', 'HintButton'],
  },

  PHASE_3: {
    name: 'Core Game Logic Migration',
    duration: '1 hour',
    risk: 'high',
    states: [
      'currentCounty',
      'gameMode',
      'isGameActive',
      'gameState',
    ],
    components: ['CaliforniaGameContainer', 'GameEngine'],
  },
};

// Migration execution
function migratePhase(phase: MigrationPhase) {
  // 1. Create feature flag for gradual rollout
  enableFeatureFlag(`migration-${phase.name}`);

  // 2. Update components to use Zustand instead of Context
  phase.components.forEach(component => {
    updateComponentStateSource(component, 'context' → 'zustand');
  });

  // 3. Run comprehensive tests
  const testResults = runTests(phase.components);
  if (!testResults.allPassed) {
    rollbackPhase(phase);
    return { success: false, error: testResults.errors };
  }

  // 4. Monitor performance
  const perfMetrics = measurePerformance(phase.components);
  if (perfMetrics.hasRegression) {
    rollbackPhase(phase);
    return { success: false, error: 'Performance regression' };
  }

  // 5. Mark phase complete
  return { success: true };
}
```

### 2.3 Deprecation Warning System

```typescript
// context/GameContext.tsx - Add deprecation warnings

/**
 * @deprecated This Context is being phased out in favor of Zustand.
 * Please use `import { useGameStore } from '@/stores/gameStore'` instead.
 *
 * Migration guide: /docs/architecture/STATE_MANAGEMENT_MIGRATION.md
 *
 * @example
 * // ❌ Old (deprecated)
 * const { currentCounty } = useGameContext();
 *
 * // ✅ New (recommended)
 * const currentCounty = useGameStore(state => state.currentCounty);
 */
export const GameContext = createContext<GameContextType | null>(null);

/**
 * @deprecated Use Zustand store instead. See migration guide.
 */
export function useGameContext() {
  console.warn(
    '⚠️  useGameContext is deprecated. Migrate to useGameStore. ' +
    'See /docs/architecture/STATE_MANAGEMENT_MIGRATION.md'
  );

  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within GameProvider');
  }
  return context;
}
```

### 2.4 Zustand Store Consolidation

```typescript
// stores/gameStore.ts - Unified state structure

interface GameStore {
  // ===== GAME STATE =====
  // Core game logic
  gameMode: 'easy' | 'medium' | 'hard';
  isGameActive: boolean;
  currentCounty: County | null;
  gameState: 'idle' | 'playing' | 'paused' | 'completed';

  // Progress tracking
  score: number;
  hintsRemaining: number;
  placedCounties: Set<string>;
  incorrectAttempts: Map<string, number>;

  // ===== UI STATE =====
  // Interactive elements
  selectedCounty: County | null;
  hoveredCounty: County | null;
  showInstructions: boolean;
  showSettings: boolean;

  // ===== ACTIONS =====
  // Game actions
  startGame: (mode: GameMode) => void;
  resetGame: () => void;
  placeCounty: (countyId: string, coordinates: Coordinates) => void;
  useHint: () => void;

  // UI actions
  setSelectedCounty: (county: County | null) => void;
  setHoveredCounty: (county: County | null) => void;
  toggleInstructions: () => void;
  toggleSettings: () => void;
}

// Create unified store
export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameMode: 'medium',
  isGameActive: false,
  currentCounty: null,
  gameState: 'idle',
  score: 0,
  hintsRemaining: 3,
  placedCounties: new Set(),
  incorrectAttempts: new Map(),
  selectedCounty: null,
  hoveredCounty: null,
  showInstructions: false,
  showSettings: false,

  // Actions
  startGame: (mode) => set({ gameMode: mode, isGameActive: true, gameState: 'playing' }),
  resetGame: () => set({
    score: 0,
    hintsRemaining: 3,
    placedCounties: new Set(),
    incorrectAttempts: new Map(),
    gameState: 'idle',
    isGameActive: false,
  }),
  // ... other actions
}));
```

---

## 3. ARCHITECTURE PHASE

### 3.1 Current Architecture (Problem)

```
Component Tree
├── App
│   └── GameProvider (Context)
│       ├── CaliforniaGameContainer
│       │   ├── Uses: useGameContext() ❌
│       │   └── Uses: useGameStore() ❌ (DUPLICATE!)
│       ├── GameMap
│       │   ├── Uses: useGameContext() ❌
│       │   └── Uses: useGameStore() ❌ (DUPLICATE!)
│       └── GameHeader
│           └── Uses: useGameStore() ✅ (only Zustand)

ISSUE: Same state in two places causes sync bugs!
```

### 3.2 Target Architecture (Solution)

```
Component Tree
├── App
│   ├── CaliforniaGameContainer
│   │   └── Uses: useGameStore() ✅ (Zustand only)
│   ├── GameMap
│   │   └── Uses: useGameStore() ✅ (Zustand only)
│   └── GameHeader
│       └── Uses: useGameStore() ✅ (Zustand only)

BENEFIT: Single source of truth, no sync issues!
```

### 3.3 File Structure Changes

```
/src
├── context/
│   └── GameContext.tsx                 [DEPRECATE → DELETE in final phase]
├── stores/
│   ├── gameStore.ts                    [CONSOLIDATE - Unified store]
│   ├── uiStore.ts                      [OPTIONAL - Separate UI state]
│   └── persistenceStore.ts             [OPTIONAL - LocalStorage sync]
├── docs/
│   └── architecture/
│       ├── STATE_MANAGEMENT_MIGRATION.md  [NEW - Migration guide]
│       └── STATE_ARCHITECTURE.md          [NEW - Architecture decisions]
├── components/
│   ├── game/
│   │   ├── CaliforniaGameContainer.tsx [MIGRATE - Context → Zustand]
│   │   ├── GameMap.tsx                 [MIGRATE - Context → Zustand]
│   │   └── GameHeader.tsx              [✅ Already using Zustand]
└── tests/
    └── migration/
        └── state-migration.test.ts     [NEW - Migration validation tests]
```

### 3.4 Migration Phases Detail

#### Phase 1: UI State (Low Risk) - 1 hour

**States to migrate:**
- `selectedCounty`
- `hoveredCounty`
- `showInstructions`
- `showSettings`
- `highContrastMode`

**Components affected:**
- `GameMap.tsx` (7 files)
- `SettingsModal.tsx`
- `InstructionsModal.tsx`

**Migration steps:**
```typescript
// Before: GameMap.tsx
const { selectedCounty, setSelectedCounty } = useGameContext();

// After: GameMap.tsx
const selectedCounty = useGameStore(state => state.selectedCounty);
const setSelectedCounty = useGameStore(state => state.setSelectedCounty);
```

**Testing:**
- User interaction tests (click, hover)
- Modal open/close tests
- State persistence tests

**Rollback plan:**
- Revert component changes
- Re-enable Context provider
- No data loss (UI state only)

---

#### Phase 2: Game Progress (Medium Risk) - 1 hour

**States to migrate:**
- `score`
- `hintsRemaining`
- `placedCounties`
- `incorrectAttempts`
- `completedCounties`

**Components affected:**
- `CaliforniaGameContainer.tsx`
- `ScoreDisplay.tsx`
- `HintButton.tsx`
- `ProgressTracker.tsx`

**Migration steps:**
```typescript
// Before: CaliforniaGameContainer.tsx
const { score, hintsRemaining, updateScore } = useGameContext();

// After: CaliforniaGameContainer.tsx
const score = useGameStore(state => state.score);
const hintsRemaining = useGameStore(state => state.hintsRemaining);
const updateScore = useGameStore(state => state.updateScore);
```

**Testing:**
- Score calculation tests
- Hint usage tests
- Progress persistence tests
- Multi-session tests (localStorage)

**Rollback plan:**
- Revert component changes
- Restore Context provider
- Backup/restore user progress from localStorage

---

#### Phase 3: Core Game Logic (High Risk) - 1 hour

**States to migrate:**
- `currentCounty`
- `gameMode`
- `isGameActive`
- `gameState`
- `difficulty`

**Components affected:**
- `CaliforniaGameContainer.tsx` (main game logic)
- `GameEngine.tsx`
- `CountyPlacementHandler.tsx`

**Migration steps:**
```typescript
// Before: CaliforniaGameContainer.tsx
const {
  currentCounty,
  gameMode,
  isGameActive,
  startGame,
  endGame
} = useGameContext();

// After: CaliforniaGameContainer.tsx
const currentCounty = useGameStore(state => state.currentCounty);
const gameMode = useGameStore(state => state.gameMode);
const isGameActive = useGameStore(state => state.isGameActive);
const startGame = useGameStore(state => state.startGame);
const endGame = useGameStore(state => state.endGame);
```

**Testing:**
- Full game flow tests (start → play → complete)
- County placement tests
- Game mode switching tests
- Edge case tests (rapid actions, concurrent updates)

**Rollback plan:**
- Immediate revert capability
- Full backup of game state
- Notify users of temporary maintenance if needed

---

### 3.5 Data Flow Comparison

#### Before (Dual State)

```
User Action
    ↓
Component calls Context setter
    ↓
Context state updates
    ↓
Component re-renders (Context consumers)
    ↓
⚠️ BUG: Zustand state NOT updated
    ↓
⚠️ Components using Zustand have stale state
```

#### After (Unified Zustand)

```
User Action
    ↓
Component calls Zustand setter
    ↓
Zustand state updates
    ↓
All subscribed components re-render
    ↓
✅ Single source of truth, no sync issues
```

---

## 4. REFINEMENT PLAN (TDD APPROACH)

### 4.1 Documentation Phase (1 hour)

#### Step 1: State Duplication Audit (30 minutes)

**Create: `/docs/architecture/STATE_DUPLICATION_AUDIT.md`**

```markdown
# State Duplication Audit

## Executive Summary
- **Duplicate state variables:** 12
- **Components affected:** 15
- **Estimated sync bugs:** 3-5 potential issues
- **Migration effort:** 3 hours (phased approach)

## Duplicate State Variables

### Critical (Core Game Logic)
1. **currentCounty**
   - Context: `GameContext.currentCounty`
   - Zustand: `useGameStore.currentCounty`
   - Components: CaliforniaGameContainer, GameMap, CountyCard
   - Risk: HIGH (affects core gameplay)

2. **gameMode**
   - Context: `GameContext.gameMode`
   - Zustand: `useGameStore.difficulty`
   - Components: CaliforniaGameContainer, SettingsModal
   - Risk: HIGH (mode switching bugs)

[... continue for all 12 variables]

## Data Flow Diagrams

[Include Mermaid diagrams showing current vs. target architecture]

## Recommended Migration Order
1. Phase 1: UI state (low risk)
2. Phase 2: Game progress (medium risk)
3. Phase 3: Core logic (high risk)
```

#### Step 2: Migration Guide (30 minutes)

**Create: `/docs/architecture/STATE_MANAGEMENT_MIGRATION.md`**

```markdown
# State Management Migration Guide

## Overview
This guide documents the migration from React Context to Zustand for state management.

## Why Migrate?

### Current Issues
1. **State Duplication:** Same state in Context + Zustand
2. **Sync Bugs:** Context updates don't propagate to Zustand
3. **Performance:** Unnecessary re-renders with Context
4. **Complexity:** Developers confused about which to use

### Benefits of Zustand
1. **Single Source of Truth:** No duplication
2. **Performance:** Optimized selectors, minimal re-renders
3. **DevTools:** Better debugging with Redux DevTools
4. **Simplicity:** Less boilerplate than Context

## Migration Steps

### For Developers

#### Before (Context)
```typescript
import { useGameContext } from '@/context/GameContext';

function MyComponent() {
  const { score, updateScore } = useGameContext();

  return <div>Score: {score}</div>;
}
```

#### After (Zustand)
```typescript
import { useGameStore } from '@/stores/gameStore';

function MyComponent() {
  const score = useGameStore(state => state.score);
  const updateScore = useGameStore(state => state.updateScore);

  return <div>Score: {score}</div>;
}
```

#### Optimization (Selector)
```typescript
// ✅ Optimized: Only re-renders when score changes
const score = useGameStore(state => state.score);

// ❌ Not optimized: Re-renders on ANY state change
const { score } = useGameStore();
```

## Testing Checklist
- [ ] Component renders correctly
- [ ] State updates propagate
- [ ] No performance regression
- [ ] No console warnings
- [ ] Tests pass
```

### 4.2 Implementation Phase (2 hours)

#### Step 1: Add Deprecation Warnings (15 minutes)

```typescript
// context/GameContext.tsx
/**
 * @deprecated Migrating to Zustand. Use `useGameStore` instead.
 * @see /docs/architecture/STATE_MANAGEMENT_MIGRATION.md
 */
export const GameContext = createContext<GameContextType | null>(null);

/**
 * @deprecated Use `import { useGameStore } from '@/stores/gameStore'` instead.
 */
export function useGameContext() {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '⚠️  useGameContext is deprecated!\n' +
      'Migrate to useGameStore: /docs/architecture/STATE_MANAGEMENT_MIGRATION.md'
    );
  }

  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within GameProvider');
  }
  return context;
}
```

#### Step 2: Consolidate Zustand Store (30 minutes)

```typescript
// stores/gameStore.ts - Unified store with all state

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface GameStore {
  // === GAME STATE ===
  gameMode: 'easy' | 'medium' | 'hard';
  isGameActive: boolean;
  currentCounty: County | null;
  gameState: 'idle' | 'playing' | 'paused' | 'completed';

  // === PROGRESS ===
  score: number;
  hintsRemaining: number;
  placedCounties: Set<string>;
  incorrectAttempts: Map<string, number>;

  // === UI STATE ===
  selectedCounty: County | null;
  hoveredCounty: County | null;
  showInstructions: boolean;
  showSettings: boolean;

  // === ACTIONS ===
  startGame: (mode: GameMode) => void;
  resetGame: () => void;
  placeCounty: (countyId: string) => boolean;
  useHint: () => void;
  setSelectedCounty: (county: County | null) => void;
  setHoveredCounty: (county: County | null) => void;
  toggleInstructions: () => void;
  toggleSettings: () => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        gameMode: 'medium',
        isGameActive: false,
        currentCounty: null,
        gameState: 'idle',
        score: 0,
        hintsRemaining: 3,
        placedCounties: new Set(),
        incorrectAttempts: new Map(),
        selectedCounty: null,
        hoveredCounty: null,
        showInstructions: false,
        showSettings: false,

        // Actions
        startGame: (mode) => set({
          gameMode: mode,
          isGameActive: true,
          gameState: 'playing',
          score: 0,
          hintsRemaining: mode === 'easy' ? 5 : mode === 'medium' ? 3 : 1,
        }),

        resetGame: () => set({
          score: 0,
          hintsRemaining: 3,
          placedCounties: new Set(),
          incorrectAttempts: new Map(),
          gameState: 'idle',
          isGameActive: false,
          currentCounty: null,
        }),

        placeCounty: (countyId) => {
          const { placedCounties } = get();
          const newPlaced = new Set(placedCounties);
          newPlaced.add(countyId);

          set({ placedCounties: newPlaced, score: get().score + 100 });
          return true;
        },

        useHint: () => {
          const { hintsRemaining } = get();
          if (hintsRemaining > 0) {
            set({ hintsRemaining: hintsRemaining - 1 });
          }
        },

        setSelectedCounty: (county) => set({ selectedCounty: county }),
        setHoveredCounty: (county) => set({ hoveredCounty: county }),
        toggleInstructions: () => set(state => ({ showInstructions: !state.showInstructions })),
        toggleSettings: () => set(state => ({ showSettings: !state.showSettings })),
      }),
      {
        name: 'california-game-storage',
        partialize: (state) => ({
          // Only persist game progress, not UI state
          score: state.score,
          placedCounties: state.placedCounties,
          gameMode: state.gameMode,
        }),
      }
    ),
    { name: 'GameStore' }
  )
);
```

#### Step 3: Migrate Phase 1 - UI State (45 minutes)

```typescript
// Before: GameMap.tsx
import { useGameContext } from '@/context/GameContext';

function GameMap() {
  const { selectedCounty, hoveredCounty, setSelectedCounty, setHoveredCounty } = useGameContext();

  return (
    <svg>
      {/* Map rendering */}
    </svg>
  );
}

// After: GameMap.tsx
import { useGameStore } from '@/stores/gameStore';

function GameMap() {
  const selectedCounty = useGameStore(state => state.selectedCounty);
  const hoveredCounty = useGameStore(state => state.hoveredCounty);
  const setSelectedCounty = useGameStore(state => state.setSelectedCounty);
  const setHoveredCounty = useGameStore(state => state.setHoveredCounty);

  return (
    <svg>
      {/* Map rendering - no changes */}
    </svg>
  );
}
```

**Test after Phase 1:**
```typescript
// tests/migration/phase1.test.tsx
describe('Phase 1: UI State Migration', () => {
  test('county selection works with Zustand', () => {
    const { result } = renderHook(() => useGameStore());

    act(() => {
      result.current.setSelectedCounty({ id: 'los-angeles', name: 'Los Angeles' });
    });

    expect(result.current.selectedCounty?.id).toBe('los-angeles');
  });

  test('GameMap responds to Zustand state changes', () => {
    render(<GameMap />);

    act(() => {
      useGameStore.getState().setSelectedCounty({ id: 'los-angeles', name: 'Los Angeles' });
    });

    expect(screen.getByTestId('selected-county')).toHaveTextContent('Los Angeles');
  });
});
```

#### Step 4: Migrate Phase 2 & 3 (30 minutes each)

[Similar migration pattern for Phase 2 and Phase 3]

---

## 5. COMPLETION CRITERIA

### 5.1 Documentation Deliverables

- [ ] **State Duplication Audit** (`/docs/architecture/STATE_DUPLICATION_AUDIT.md`)
  - All duplicate states identified
  - Data flow diagrams created
  - Risk assessment complete

- [ ] **Migration Guide** (`/docs/architecture/STATE_MANAGEMENT_MIGRATION.md`)
  - Step-by-step migration instructions
  - Before/after code examples
  - Testing checklist

- [ ] **Architecture Decision Record** (`/docs/architecture/ADR-001-zustand-migration.md`)
  - Decision rationale
  - Alternatives considered
  - Migration timeline

### 5.2 Code Deliverables

- [ ] **JSDoc Warnings** in `GameContext.tsx`
  - Deprecation notices
  - Migration guide links
  - IDE warnings visible

- [ ] **Consolidated Zustand Store**
  - All state unified
  - Optimized selectors
  - DevTools integration

- [ ] **Proof-of-Concept Migration**
  - One component fully migrated
  - Tests passing
  - Performance validated

### 5.3 Testing Checklist

#### Automated Tests
- [ ] Phase 1 migration tests pass
- [ ] Phase 2 migration tests pass
- [ ] Phase 3 migration tests pass
- [ ] No regressions in existing tests
- [ ] Performance benchmarks stable

#### Manual Testing
- [ ] Game plays correctly after migration
- [ ] State persists across sessions
- [ ] No console warnings
- [ ] DevTools show correct state

### 5.4 Acceptance Criteria

**Phase 1 (Documentation):**
- ✅ State duplication audit complete
- ✅ Migration guide created
- ✅ JSDoc warnings added
- ✅ Architecture decision documented

**Phase 2 (Proof-of-Concept):**
- ✅ One component migrated successfully
- ✅ Tests pass
- ✅ No performance regression
- ✅ Rollback plan validated

**Phase 3 (Full Migration - Future):**
- ⏳ All components migrated
- ⏳ Context provider removed
- ⏳ 100% Zustand usage
- ⏳ Documentation updated

### 5.5 Success Metrics

| Metric | Before | After (Phase 1) | After (Full) |
|--------|--------|-----------------|--------------|
| State sources | 2 (Context + Zustand) | 2 (deprecated Context) | 1 (Zustand only) |
| Duplicate state | 12 variables | Documented | 0 |
| Developer confusion | High | Medium (warnings) | Low |
| Sync bugs | 3-5 potential | Documented | 0 |
| Bundle size | N/A | No change | -5KB (remove Context) |

### 5.6 Risk Mitigation

#### Identified Risks

1. **Risk:** Breaking changes during migration
   - **Mitigation:** Phased approach, comprehensive testing
   - **Rollback:** Revert commit, restore Context

2. **Risk:** State loss during migration
   - **Mitigation:** Persist state before migration, validate after
   - **Rollback:** Restore from localStorage backup

3. **Risk:** Performance degradation
   - **Mitigation:** Benchmark before/after, optimize selectors
   - **Rollback:** Revert if >10% performance drop

4. **Risk:** Developer adoption
   - **Mitigation:** Clear documentation, code examples, IDE warnings
   - **Rollback:** N/A (documentation only)

---

## APPENDIX A: State Duplication Inventory

### Duplicate State Variables (12 total)

| Variable | Context | Zustand | Components | Risk |
|----------|---------|---------|------------|------|
| `currentCounty` | ✓ | ✓ | 5 | CRITICAL |
| `gameMode` | ✓ | ✓ (as `difficulty`) | 3 | HIGH |
| `isGameActive` | ✓ | ✓ | 4 | HIGH |
| `score` | ✓ | ✓ | 3 | MEDIUM |
| `hintsRemaining` | ✓ | ✓ | 2 | MEDIUM |
| `placedCounties` | ✓ | ✓ | 4 | MEDIUM |
| `selectedCounty` | ✓ | ✓ | 3 | LOW |
| `hoveredCounty` | ✓ | ✓ | 2 | LOW |
| `showInstructions` | ✓ | ✓ | 2 | LOW |
| `showSettings` | ✓ | ✓ | 2 | LOW |
| `gameState` | ✓ | ✓ | 3 | HIGH |
| `incorrectAttempts` | ✓ | ✓ | 2 | MEDIUM |

---

## APPENDIX B: Migration Timeline

### Immediate (This Sprint)
- ✅ Document state duplication
- ✅ Create migration guide
- ✅ Add JSDoc warnings
- ✅ Proof-of-concept migration

### Short-Term (Next Sprint)
- ⏳ Migrate Phase 1 (UI state)
- ⏳ Migrate Phase 2 (Game progress)
- ⏳ Comprehensive testing

### Long-Term (Future Sprint)
- ⏳ Migrate Phase 3 (Core logic)
- ⏳ Remove GameContext entirely
- ⏳ Update all documentation

---

## APPENDIX C: Zustand Best Practices

### Selector Optimization

```typescript
// ❌ BAD: Re-renders on ANY state change
const { score, hintsRemaining, placedCounties } = useGameStore();

// ✅ GOOD: Only re-renders when score changes
const score = useGameStore(state => state.score);

// ✅ BETTER: Custom selector for multiple values
const gameProgress = useGameStore(state => ({
  score: state.score,
  hints: state.hintsRemaining,
}), shallow); // Use shallow comparison
```

### Action Patterns

```typescript
// ✅ Encapsulate logic in store actions
placeCounty: (countyId) => {
  const { placedCounties, score } = get();

  // Logic stays in store
  const newPlaced = new Set(placedCounties);
  newPlaced.add(countyId);
  const newScore = score + calculatePoints(countyId);

  set({ placedCounties: newPlaced, score: newScore });
},

// ❌ Avoid logic in components
// Component should just call: placeCounty(countyId)
```

---

**Estimated Completion:** 3 hours (Documentation + Planning)
**Full Migration:** 3 hours (Implementation - future work)
**Risk Level:** MEDIUM (phased approach reduces risk)
**Impact:** MEDIUM (architecture improvement, bug prevention)
**ROI:** 6/10 ⭐⭐⭐ (long-term maintainability benefit)
