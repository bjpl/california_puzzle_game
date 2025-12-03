# ADR: Game Store Refactoring to Domain Stores

**Status:** Proposed
**Date:** December 2, 2025
**Decision Makers:** Architecture Team
**Consulted:** Development Team
**Informed:** All stakeholders

---

## Context and Problem Statement

The current `gameStore.ts` has grown to 880 lines with 73 methods managing 11 different concerns. This monolithic structure creates several problems:

1. **High Cognitive Load**: Developers must understand entire 880-line file to make changes
2. **Testing Complexity**: Cannot test individual concerns in isolation
3. **Type Safety Issues**: Single large type makes IDE autocomplete slow and imprecise
4. **Maintenance Burden**: Changes to one concern risk affecting others
5. **Onboarding Difficulty**: New developers struggle to understand the architecture
6. **Performance Concerns**: Components re-render unnecessarily due to broad state subscriptions

**Question:** How should we refactor the game store to improve maintainability while maintaining backward compatibility?

---

## Decision Drivers

### Must Have
- ✅ Maintain backward compatibility (existing code continues to work)
- ✅ Reduce file size to manageable chunks (~150 lines per file)
- ✅ Enable independent testing of each domain
- ✅ Eliminate circular dependencies
- ✅ Zero runtime performance regression

### Should Have
- 🎯 Improve developer experience (better autocomplete, faster navigation)
- 🎯 Clear separation of concerns
- 🎯 Event-driven architecture for decoupling
- 🎯 Comprehensive documentation and migration guide

### Nice to Have
- 💡 Performance improvements from targeted re-renders
- 💡 Easier to add new features
- 💡 Better code organization for future developers

---

## Considered Options

### Option 1: Do Nothing (Status Quo)
**Description:** Keep the monolithic gameStore.ts as-is.

**Pros:**
- No migration effort
- No risk of breaking changes
- Familiar to current team

**Cons:**
- Cognitive load continues to increase
- Testing remains complex
- New developers struggle
- Technical debt accumulates
- IDE performance degraded

**Decision:** ❌ Rejected - Technical debt is unsustainable

---

### Option 2: Split into Simple Files
**Description:** Split gameStore.ts into multiple files but keep them tightly coupled.

```
gameStore/
  ├── lifecycle.ts    (imports scoring, achievements)
  ├── scoring.ts      (imports lifecycle)
  ├── achievements.ts (imports scoring, lifecycle)
  └── ...
```

**Pros:**
- Simpler than event-driven approach
- Smaller files

**Cons:**
- ❌ Creates circular dependencies
- ❌ Still tightly coupled
- ❌ Difficult to test in isolation
- ❌ Doesn't solve re-render issues

**Decision:** ❌ Rejected - Doesn't address root coupling issues

---

### Option 3: Redux-Style Architecture
**Description:** Use Redux with separate reducers and actions.

**Pros:**
- Industry standard pattern
- Clear unidirectional data flow
- Strong tooling support

**Cons:**
- ❌ Major rewrite required
- ❌ Breaks existing Zustand patterns
- ❌ More boilerplate
- ❌ Different mental model from rest of codebase
- ❌ Requires retraining team

**Decision:** ❌ Rejected - Too disruptive, inconsistent with existing patterns

---

### Option 4: Domain Stores with Event Bus (Recommended)
**Description:** Refactor into 7 domain stores communicating via event bus.

```
game/
  ├── coreGameStore.ts          (lifecycle, mode, timer)
  ├── countyPlacementStore.ts   (placement validation)
  ├── scoringStore.ts           (score, streaks)
  ├── achievementStore.ts       (achievements)
  ├── hintStore.ts              (hints, struggle analysis)
  ├── statisticsStore.ts        (stats)
  ├── gameSettingsStore.ts      (settings, sound, gestures)
  ├── gameEventBus.ts           (pub/sub communication)
  └── index.ts                  (compatibility layer)
```

**Pros:**
- ✅ Clear separation of concerns (SRP)
- ✅ No circular dependencies (event-driven)
- ✅ Independent testing
- ✅ Backward compatibility (compatibility layer)
- ✅ Gradual migration path
- ✅ Consistent with existing Zustand patterns
- ✅ Improved IDE performance
- ✅ Better re-render optimization

**Cons:**
- ⚠️ Event bus adds minimal overhead (~1-2ms)
- ⚠️ Requires learning event-driven patterns
- ⚠️ More files to manage (7 vs 1)

**Decision:** ✅ **SELECTED** - Best balance of benefits and costs

---

## Decision

**We will adopt Option 4: Domain Stores with Event Bus**

### Rationale

1. **Separation of Concerns**: Each store manages one domain (~150 lines)
2. **Loose Coupling**: Event bus eliminates circular dependencies
3. **Testability**: Can test each store in isolation
4. **Backward Compatibility**: Compatibility layer maintains existing API
5. **Gradual Migration**: Can migrate components over time
6. **Consistent Patterns**: Uses existing Zustand + middleware approach
7. **Performance**: Better re-render optimization from targeted subscriptions

---

## Implementation Strategy

### Phase 1: Infrastructure (Week 1)
- Create directory structure
- Implement event bus with pub/sub
- Create shared types and constants
- Write event bus tests

### Phase 2: Core Stores (Week 1-2)
- Implement stores with no dependencies first:
  - coreGameStore
  - gameSettingsStore
- Write unit tests for each

### Phase 3: Dependent Stores (Week 2)
- Implement stores that depend on core stores:
  - countyPlacementStore (reads from coreGameStore)
  - scoringStore (subscribes to COUNTY_PLACED)
  - achievementStore (subscribes to multiple events)
  - hintStore (subscribes to COUNTY_PLACED)
  - statisticsStore (subscribes to multiple events)
- Write unit tests for each

### Phase 4: Integration (Week 3)
- Create compatibility layer (`index.ts`)
- Write integration tests
- Performance profiling
- Documentation updates

### Phase 5: Migration (Week 3-4)
- Migrate components to new stores
- Update component tests
- Continuous validation

### Phase 6: Cleanup (Week 4)
- Remove old `gameStore.ts`
- Final testing
- Deploy to production

---

## Consequences

### Positive

1. **Maintainability**: Easier to understand and modify individual domains
2. **Testability**: Can test stores in isolation with focused tests
3. **Performance**: Better re-render optimization from targeted subscriptions
4. **Developer Experience**: Better IDE autocomplete, faster navigation
5. **Scalability**: Easy to add new features without touching existing stores
6. **Documentation**: Clear boundaries make documentation easier
7. **Onboarding**: New developers can understand one domain at a time

### Negative

1. **Learning Curve**: Team needs to learn event-driven patterns
2. **File Count**: More files to manage (7 stores vs 1)
3. **Event Overhead**: Minimal performance overhead (~1-2ms per event)
4. **Initial Effort**: ~4 weeks of implementation and migration work

### Neutral

1. **Code Volume**: Slightly more code due to structure (~20% increase)
2. **Complexity**: Different type of complexity (distributed vs centralized)

---

## Validation

### Success Metrics

**Quantitative:**
- [ ] Each store < 200 lines
- [ ] Zero circular dependencies
- [ ] 100% TypeScript type coverage
- [ ] All existing tests pass
- [ ] Event propagation < 2ms
- [ ] No runtime performance regression

**Qualitative:**
- [ ] Improved developer satisfaction (survey)
- [ ] Faster onboarding (time to first contribution)
- [ ] Easier code reviews (review time reduction)
- [ ] Better IDE performance (autocomplete speed)

### Rollback Plan

1. Keep old `gameStore.ts` until migration complete
2. Use feature flags to toggle between old/new stores
3. Monitor production metrics closely
4. Can revert compatibility layer if issues arise

---

## Compliance

### Architectural Principles

- ✅ **Single Responsibility Principle**: Each store has one responsibility
- ✅ **Open/Closed Principle**: Open for extension via events, closed for modification
- ✅ **Dependency Inversion**: Depend on abstractions (events) not concrete stores
- ✅ **Interface Segregation**: Components import only what they need
- ✅ **Event-Driven Architecture**: Decoupled communication via event bus

### Project Standards

- ✅ Uses existing Zustand + devtools + persist pattern
- ✅ Follows TypeScript strict mode
- ✅ Maintains backward compatibility
- ✅ Includes comprehensive tests
- ✅ Documented with JSDoc
- ✅ Follows existing naming conventions

---

## Related Documents

- [game-store-refactoring-architecture.md](./game-store-refactoring-architecture.md) - Complete specification
- [store-dependency-diagram.md](./store-dependency-diagram.md) - Visual diagrams
- [implementation-guide.md](./implementation-guide.md) - Step-by-step implementation

---

## Notes

### Alternative Approaches Considered

**MobX**: Too different from existing Zustand patterns, requires rewriting components.

**Recoil**: Too experimental, family-based approach doesn't fit our domain model.

**Context API**: Too much boilerplate, performance concerns with frequent updates.

**Jotai**: Atom-based approach doesn't match our domain boundaries.

### Lessons from Other Stores

This architecture follows successful patterns from:
- `studyStore.ts` (530 lines, well-organized, single domain)
- `authStore.ts` (470 lines, clear responsibility, event listeners)
- `themeStore.ts` (small, focused, no dependencies)

### Future Considerations

This architecture enables future enhancements:
- Real-time multiplayer (event bus already in place)
- Undo/redo (event history available)
- State persistence strategies per domain
- A/B testing of game mechanics
- Analytics event tracking

---

## Change History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-12-02 | 1.0 | Initial ADR | Claude Code System Architect |

---

## Status

**Current Status:** Proposed

**Next Steps:**
1. Team review and discussion
2. Incorporate feedback
3. Final approval
4. Begin implementation (Phase 1)

**Approval Required From:**
- [ ] Architecture Team Lead
- [ ] Tech Lead
- [ ] Senior Developers
- [ ] Product Owner (impact awareness)

---

**ADR Template Version:** 1.0
**Last Updated:** December 2, 2025
