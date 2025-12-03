# Game Store Refactoring Architecture Documentation

**Project:** California Puzzle Game
**Phase:** Architecture Design
**Status:** Ready for Implementation
**Created:** December 2, 2025

---

## Overview

This directory contains the complete architectural design for refactoring the monolithic `gameStore.ts` (880 lines) into 7 specialized domain stores. The refactoring improves maintainability, testability, and developer experience while maintaining backward compatibility.

---

## Documentation Structure

### 📄 Core Documents

1. **[game-store-refactoring-architecture.md](./game-store-refactoring-architecture.md)**
   - **Purpose:** Complete architectural specification
   - **Audience:** Architects, senior developers, reviewers
   - **Contents:**
     - Executive summary
     - Store architecture breakdown
     - Detailed store specifications with TypeScript types
     - Inter-store communication patterns
     - Migration strategy (4 phases)
     - File structure
     - Testing strategy
     - Success metrics

2. **[store-dependency-diagram.md](./store-dependency-diagram.md)**
   - **Purpose:** Visual representation of store relationships
   - **Audience:** All developers
   - **Contents:**
     - Dependency graph (ASCII art)
     - Event flow diagrams
     - Data flow patterns
     - Store size comparison
     - Circular dependency prevention
     - Performance characteristics

3. **[implementation-guide.md](./implementation-guide.md)**
   - **Purpose:** Step-by-step implementation instructions
   - **Audience:** Implementing developers
   - **Contents:**
     - Infrastructure setup
     - Event bus implementation with code
     - Store templates with complete examples
     - Testing templates
     - Migration checklist

---

## Quick Start

### For Architects & Reviewers

1. Start with **game-store-refactoring-architecture.md** for the complete design
2. Review **store-dependency-diagram.md** for visual understanding
3. Check success metrics and risk mitigations

### For Implementing Developers

1. Read **implementation-guide.md** for step-by-step instructions
2. Reference **store-dependency-diagram.md** for event flow
3. Use provided code templates as starting points

### For Code Reviewers

1. Check **store-dependency-diagram.md** for dependency rules
2. Verify implementations against **game-store-refactoring-architecture.md** specs
3. Use migration checklist in **implementation-guide.md**

---

## Architecture Summary

### Problem Statement

Current `gameStore.ts`:
- 880 lines, 73 methods
- 11 intermingled concerns
- High cognitive complexity
- Difficult to test in isolation
- Poor TypeScript intellisense

### Solution

Refactor into 7 domain stores:

| Store | Size | Responsibility | Dependencies |
|-------|------|----------------|--------------|
| **coreGameStore** | ~150 lines | Game lifecycle, mode, timer | None |
| **countyPlacementStore** | ~180 lines | County placement validation | coreGameStore (read-only) |
| **scoringStore** | ~140 lines | Score calculation, streaks | Events only |
| **achievementStore** | ~160 lines | Achievement tracking | Events only |
| **hintStore** | ~200 lines | Hint system, struggle analysis | Events only |
| **statisticsStore** | ~120 lines | Stats aggregation | Events only |
| **gameSettingsStore** | ~130 lines | Settings, sound, gestures | None |

### Key Architectural Decisions

1. **Event-Driven Communication**
   - Stores communicate via event bus (pub/sub pattern)
   - Avoids circular dependencies
   - Enables loose coupling

2. **Read-Only Cross-Store Access**
   - Use `getState()` for one-time reads
   - No reactive subscriptions across stores
   - Prevents implicit coupling

3. **Backward Compatibility Layer**
   - Composite hook maintains old API
   - Gradual migration strategy
   - Zero breaking changes

4. **Single Responsibility**
   - Each store manages one domain
   - Clear boundaries
   - Independent testing

---

## Implementation Timeline

### Week 1: Infrastructure + Core Stores
- [ ] Setup directory structure
- [ ] Implement event bus
- [ ] Create shared types and constants
- [ ] Implement coreGameStore
- [ ] Implement gameSettingsStore

### Week 2: Dependent Stores
- [ ] Implement countyPlacementStore
- [ ] Implement scoringStore
- [ ] Implement achievementStore
- [ ] Implement hintStore
- [ ] Implement statisticsStore

### Week 3: Integration + Testing
- [ ] Create compatibility layer
- [ ] Integration tests
- [ ] Performance profiling
- [ ] Component migration begins

### Week 4: Migration + Cleanup
- [ ] Complete component migration
- [ ] Remove old gameStore.ts
- [ ] Final testing
- [ ] Documentation update

---

## Design Principles

### 1. Single Responsibility Principle (SRP)
Each store has one clear responsibility and reason to change.

### 2. Dependency Inversion Principle (DIP)
Stores depend on abstractions (events) rather than concrete implementations.

### 3. Open/Closed Principle (OCP)
Stores are open for extension (new events) but closed for modification.

### 4. Interface Segregation Principle (ISP)
Components import only the stores they need, not a monolithic interface.

### 5. Event-Driven Architecture (EDA)
Decoupled communication through a centralized event bus.

---

## Store Communication Patterns

### ✅ Recommended Patterns

```typescript
// Pattern 1: Event-driven (preferred)
subscribeToGameEvent('COUNTY_PLACED', (result) => {
  // React to event
});

// Pattern 2: Read-only access
const { difficulty } = useCoreGameStore.getState();

// Pattern 3: One-way dependency
coreGameStore → countyPlacementStore ✓
```

### ❌ Anti-Patterns to Avoid

```typescript
// NEVER: Reactive subscriptions across stores
const coreState = useCoreGameStore();
const placementState = useCountyPlacementStore();

// NEVER: Direct action calls
scoringStore.updateScore(); // from achievementStore

// NEVER: Circular imports
storeA imports storeB, storeB imports storeA
```

---

## Testing Strategy

### Unit Tests (Per Store)
- Test state mutations
- Test action logic
- Mock event bus
- Isolated from other stores

### Integration Tests
- Test event flow
- Test cross-store interactions
- Verify data consistency
- End-to-end scenarios

### Performance Tests
- Measure event propagation time
- Monitor re-render counts
- Compare before/after metrics
- Memory profiling

---

## Success Metrics

### Quantitative
- [ ] Each store < 200 lines ✓
- [ ] No circular dependencies ✓
- [ ] 100% TypeScript type coverage ✓
- [ ] All existing tests pass ✓
- [ ] Event propagation < 2ms ✓

### Qualitative
- [ ] Improved developer experience ✓
- [ ] Clearer code organization ✓
- [ ] Easier to test in isolation ✓
- [ ] Better IDE autocomplete ✓
- [ ] Simplified onboarding ✓

---

## Migration Safety

### Backward Compatibility
- Old `useGameStore()` API still works
- Gradual component migration
- No breaking changes

### Rollback Plan
- Keep old gameStore.ts until fully migrated
- Feature flags for new stores
- Monitoring and alerting

### Validation
- Comprehensive test suite
- Performance benchmarks
- User acceptance testing

---

## FAQ

### Q: Why not just split into separate files?
**A:** Splitting without addressing communication patterns would lead to circular dependencies and tight coupling. This architecture uses events for decoupling.

### Q: Won't the event bus add overhead?
**A:** Minimal (~1-2ms per event). The benefits of loose coupling far outweigh the negligible performance cost.

### Q: How do we handle state that multiple stores need?
**A:** Use events for changes, `getState()` for reads. Shared state (userId) lives in coreGameStore.

### Q: What if a store needs data from multiple stores?
**A:** Subscribe to multiple events or read via `getState()`. Keep dependencies minimal.

### Q: How do we test cross-store interactions?
**A:** Integration tests that verify event flow and state consistency across stores.

---

## Related Documentation

- [../README.md](../README.md) - Main documentation index
- [../../README.md](../../README.md) - Project README
- [../api/](../api/) - API documentation
- [../../tests/](../../tests/) - Test suite

---

## Glossary

- **Store**: Zustand state container with actions
- **Domain Store**: Store responsible for one business domain
- **Event Bus**: Pub/sub system for decoupled communication
- **Compatibility Layer**: Wrapper maintaining old API
- **Migration**: Process of moving from old to new architecture

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-12-02 | 1.0 | Initial architecture design | Claude Code System Architect |

---

## Next Steps

1. **Review Phase** (1-2 days)
   - Team review of architecture
   - Feedback incorporation
   - Final approval

2. **Implementation Phase** (4 weeks)
   - Follow implementation guide
   - Weekly progress reviews
   - Continuous testing

3. **Migration Phase** (2 weeks)
   - Gradual component migration
   - Monitoring and validation
   - Documentation updates

4. **Cleanup Phase** (1 week)
   - Remove deprecated code
   - Final testing
   - Production deployment

---

## Contact & Support

- **Architecture Questions**: Review game-store-refactoring-architecture.md
- **Implementation Questions**: Check implementation-guide.md
- **Dependency Questions**: See store-dependency-diagram.md

---

**Status:** ✅ Architecture design complete, ready for review and implementation

**Last Updated:** December 2, 2025
