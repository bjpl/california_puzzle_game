# Game Store Dependency Diagram

**Project:** California Puzzle Game
**Date:** December 2, 2025

## Visual Dependency Graph

```
                    ┌─────────────────────────────────┐
                    │      Game Event Bus             │
                    │  (Event-Driven Communication)   │
                    └─────────────────────────────────┘
                                   ▲
                                   │
                                   │ Publishes/Subscribes
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        │                          │                          │
┌───────▼──────────┐    ┌──────────▼─────────┐    ┌─────────▼──────────┐
│  coreGameStore   │    │ gameSettingsStore  │    │  statisticsStore   │
│                  │    │                    │    │                    │
│ - Game lifecycle │    │ - Settings         │    │ - Stats tracking   │
│ - Mode selection │    │ - Sound            │    │ - Personal bests   │
│ - Timer          │    │ - Gestures         │    │ - Play time        │
│                  │    │                    │    │                    │
│ Dependencies: 0  │    │ Dependencies: 0    │    │ Dependencies: 0*   │
└──────┬───────────┘    └────────────────────┘    └────────────────────┘
       │
       │ Provides: difficulty, mode, isGameActive
       │
       ▼
┌──────────────────────────┐
│  countyPlacementStore    │
│                          │
│ - Place/remove counties  │
│ - Accuracy calculation   │
│ - Position tracking      │
│                          │
│ Dependencies: 1          │
│ - Reads: coreGameStore   │
└──────┬───────────────────┘
       │
       │ Emits: COUNTY_PLACED event
       │
       ▼
┌──────┴────────────────────────────┬─────────────────┬────────────────┐
│                                   │                 │                │
▼                                   ▼                 ▼                ▼
┌────────────────┐      ┌──────────────────┐  ┌─────────────┐  ┌──────────────┐
│  scoringStore  │      │ achievementStore │  │  hintStore  │  │ statistics   │
│                │      │                  │  │             │  │ Store (cont) │
│ - Score calc   │      │ - Check unlocks  │  │ - Struggle  │  │              │
│ - Streak       │      │ - Progress track │  │   analysis  │  │ - Aggregates │
│ - Multipliers  │      │                  │  │ - Auto-hint │  │              │
│                │      │                  │  │             │  │              │
│ Dependencies:1*│      │ Dependencies: 4* │  │ Depends: 1* │  │ Depends: 3*  │
└────────────────┘      └──────────────────┘  └─────────────┘  └──────────────┘

* = Event-based dependencies (loose coupling via event bus)
```

## Dependency Table

| Store | Direct Dependencies | Event Dependencies | Events Published | Events Subscribed |
|-------|--------------------|--------------------|------------------|-------------------|
| **coreGameStore** | None | None | GAME_START, GAME_END, GAME_PAUSE, GAME_RESUME | None |
| **countyPlacementStore** | coreGameStore (getState) | None | COUNTY_PLACED, COUNTY_REMOVED | GAME_START (reset) |
| **scoringStore** | None | COUNTY_PLACED | SCORE_UPDATED, STREAK_UPDATED | COUNTY_PLACED, HINT_USED |
| **achievementStore** | None | Multiple | ACHIEVEMENT_UNLOCKED | COUNTY_PLACED, GAME_END, STREAK_UPDATED |
| **hintStore** | None | COUNTY_PLACED | HINT_USED, HINT_SUGGESTED | COUNTY_PLACED, GAME_START |
| **statisticsStore** | None | Multiple | None (passive) | GAME_END, COUNTY_PLACED |
| **gameSettingsStore** | None | None | SETTINGS_CHANGED | None |

## Event Flow Diagram

```
┌─────────────┐
│ User Action │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Component calls     │
│ placeCounty()       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────┐
│ countyPlacementStore        │
│ 1. Calculate accuracy       │
│ 2. Update placed counties   │
│ 3. Emit COUNTY_PLACED event │
└──────┬──────────────────────┘
       │
       │ Event Bus propagates event
       │
       ├────────────────┬────────────────┬───────────────┐
       ▼                ▼                ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌─────────────┐ ┌─────────────┐
│ scoringStore │ │ achievement  │ │  hintStore  │ │ statistics  │
│              │ │ Store        │ │             │ │ Store       │
│ calculates   │ │ checks       │ │ analyzes    │ │ updates     │
│ score        │ │ conditions   │ │ struggle    │ │ stats       │
└──────┬───────┘ └──────┬───────┘ └─────┬───────┘ └─────┬───────┘
       │                │                │               │
       │ SCORE_UPDATED  │ ACHIEVEMENT_   │ HINT_        │ (silent)
       │                │ UNLOCKED       │ SUGGESTED    │
       ▼                ▼                ▼               ▼
┌──────────────────────────────────────────────────────────┐
│                    UI Updates                            │
│  - Score display   - Achievement toast  - Hint icon      │
└──────────────────────────────────────────────────────────┘
```

## Data Flow Patterns

### Pattern 1: Game Initialization

```typescript
// Component
useEffect(() => {
  startGame(); // coreGameStore
}, []);

// coreGameStore publishes GAME_START event
publishGameEvent('GAME_START', { difficulty, region });

// Other stores react:
// - countyPlacementStore: initializes counties
// - hintStore: resets hint system
// - scoringStore: resets score
// - statisticsStore: increments game count
```

### Pattern 2: County Placement

```typescript
// Component
const handleDrop = (county, position) => {
  const result = placeCounty(county, position); // countyPlacementStore
  // result contains accuracy, isCorrect, etc.
};

// countyPlacementStore
placeCounty(county, position) {
  // 1. Reads difficulty from coreGameStore (getState, no subscription)
  const { difficulty, currentMode } = useCoreGameStore.getState();

  // 2. Calculates accuracy
  const result = calculateAccuracy(...);

  // 3. Updates own state
  set({ placedCounties: [...], remainingCounties: [...] });

  // 4. Publishes event (fire and forget)
  publishGameEvent('COUNTY_PLACED', result);

  return result;
}

// Other stores react independently:
// - scoringStore: calculates and adds score
// - achievementStore: checks unlock conditions
// - hintStore: analyzes player struggle
// - statisticsStore: updates accuracy average
```

### Pattern 3: Cross-Store Queries

```typescript
// achievementStore checking "Bay Area Master" achievement
checkAchievements() {
  // Read state without creating reactive dependencies
  const { difficulty, selectedRegion } = useCoreGameStore.getState();
  const { remainingCounties } = useCountyPlacementStore.getState();
  const { streak } = useScoringStore.getState();

  // Use data for achievement conditions
  if (difficulty === DifficultyLevel.EXPERT &&
      selectedRegion === CaliforniaRegion.BAY_AREA &&
      remainingCounties.length === 0) {
    unlockAchievement('bay_area_master');
  }
}
```

## Store Size Comparison

```
Before Refactoring:
┌──────────────────────────────┐
│     gameStore.ts             │
│     880 lines                │
│     73 methods               │
│     11 concerns              │
└──────────────────────────────┘

After Refactoring:
┌───────────────┬───────────────┬───────────────┬───────────────┐
│ coreGameStore │countyPlacement│ scoringStore  │ achievement   │
│   ~150 lines  │  Store        │   ~140 lines  │ Store         │
│   12 methods  │  ~180 lines   │   8 methods   │  ~160 lines   │
│   3 concerns  │   10 methods  │   2 concerns  │   9 methods   │
│               │   2 concerns  │               │   2 concerns  │
└───────────────┴───────────────┴───────────────┴───────────────┘

┌───────────────┬───────────────┬───────────────┐
│  hintStore    │ statisticsStore│gameSettings  │
│  ~200 lines   │  ~120 lines   │ Store        │
│  15 methods   │  10 methods   │ ~130 lines   │
│  1 concern    │  1 concern    │ 13 methods   │
│               │               │ 2 concerns   │
└───────────────┴───────────────┴───────────────┘

Total: ~1080 lines (20% increase for structure)
Average per store: ~154 lines (82% reduction per file)
```

## Circular Dependency Prevention

### ✅ Allowed Patterns

```typescript
// Pattern 1: Read-only access via getState()
const otherStoreData = useOtherStore.getState();

// Pattern 2: Event subscription (loose coupling)
subscribeToGameEvent('EVENT', (data) => { ... });

// Pattern 3: One-way dependency (A depends on B, B never depends on A)
coreGameStore → countyPlacementStore ✓
```

### ❌ Forbidden Patterns

```typescript
// NEVER: Reactive subscriptions across stores
const Component = () => {
  const coreState = useCoreGameStore();
  const placementState = useCountyPlacementStore();
  // This creates implicit coupling
};

// NEVER: Circular imports
// storeA imports storeB, storeB imports storeA

// NEVER: Stores calling other stores' actions directly
scoringStore.updateScore() // called from achievementStore ❌
```

## Performance Characteristics

| Operation | Before (Monolithic) | After (Domain Stores) |
|-----------|--------------------|-----------------------|
| Component re-render on score change | All subscribed components | Only scoring components |
| Component re-render on settings change | All subscribed components | Only settings components |
| Store initialization | 1 large store | 7 small stores (parallelizable) |
| Event propagation | N/A | ~1-2ms per event |
| Memory footprint | ~1MB | ~1.1MB (10% overhead) |

## Migration Safety Checklist

- [ ] All stores have unit tests
- [ ] Integration tests verify event flow
- [ ] Compatibility layer maintains old API
- [ ] No circular dependencies (ESLint check)
- [ ] All TypeScript errors resolved
- [ ] Performance profiling shows no regression
- [ ] Documentation updated
- [ ] Migration guide created
- [ ] Team review completed
- [ ] Gradual rollout plan ready

---

**Next Steps:**
1. Review dependency graph with team
2. Identify any missed dependencies
3. Validate event flow patterns
4. Begin implementation of Phase 1
