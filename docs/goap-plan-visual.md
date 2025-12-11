# GOAP Action Plan - Phase 5: Store Migration Completion

## Executive Summary

**Objective**: Complete migration from studyStore facade to domain stores
**Estimated Time**: 12 hours of work (8 hours calendar time with parallelization)
**Risk Level**: Low
**Expected Outcome**: Architecture Grade A, Production Ready

---

## Current State → Goal State

```
┌─────────────────────────────────────────────────────────────────┐
│ CURRENT STATE (World State)                                    │
├─────────────────────────────────────────────────────────────────┤
│ ✅ 7 Game Domain Stores (countyPlacement, scoring, etc.)       │
│ ✅ 7 Study Domain Stores (session, progress, etc.)             │
│ ✅ StoreCoordinator wired with event bus                       │
│ ✅ Facade pattern implemented (studyStore.ts)                  │
│ ✅ 475 tests passing                                           │
│ ✅ 85% test coverage                                           │
│ ⚠️  3 components still use facade                              │
│ ❌ Facade not removed                                          │
│ ❌ Integration tests incomplete                                │
│ ❌ Performance not validated                                   │
│ ❌ Docs not updated                                            │
│                                                                 │
│ Architecture Grade: B+                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    [GOAP Planning Process]
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ GOAL STATE                                                      │
├─────────────────────────────────────────────────────────────────┤
│ ✅ All components use domain stores directly                   │
│ ✅ Facade removed (studyStore.ts deleted)                      │
│ ✅ Integration tests complete                                  │
│ ✅ E2E tests for study workflows                               │
│ ✅ Performance validated                                       │
│ ✅ Documentation updated                                       │
│ ✅ 90%+ test coverage                                          │
│ ✅ Production ready                                            │
│                                                                 │
│ Architecture Grade: A                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## GOAP Action Sequence (6 Waves)

### Wave 1: Analysis & Foundation (Parallel, 2 hours)

```
┌──────────────────────┐         ┌─────────────────────────┐
│ Analyze Consumers    │         │ Add Integration Tests   │
│                      │         │                         │
│ • Grep all imports   │         │ • Test coordinator      │
│ • Map dependencies   │    +    │ • Test event bus        │
│ • Document scope     │         │ • Test subscriptions    │
│                      │         │                         │
│ Cost: 1 | 0.5 hours  │         │ Cost: 4 | 2 hours       │
└──────────────────────┘         └─────────────────────────┘
```

**Deliverables**:

- Migration scope document
- Integration test suite for storeCoordinator

**Success Criteria**:

- All facade consumers identified (expected: 3)
- Coordinator tests pass
- No regressions in existing tests

---

### Wave 2: Component Migration (Parallel, 1.5 hours)

```
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│ Migrate Component 1  │   │ Migrate Component 2  │   │ Migrate Component 3  │
│                      │   │                      │   │                      │
│ storeIntegration.ts  │   │ useStudyNavigation   │   │ studyStore cleanup   │
│                      │   │                      │   │                      │
│ Cost: 3 | 1.5 hrs    │ + │ Cost: 3 | 1.5 hrs    │ + │ Cost: 3 | 1.5 hrs    │
└──────────────────────┘   └──────────────────────┘   └──────────────────────┘
```

**Migration Pattern**:

```typescript
// BEFORE (Facade)
import { useStudyStore } from '@/stores/studyStore';
const progress = useStudyStore((state) => state.progress);

// AFTER (Domain Store)
import { useProgressStore } from '@/stores/study/progressStore';
const progress = useProgressStore((state) => state.totalStudied);
```

**Deliverables**:

- 3 components migrated to domain stores
- Updated imports
- Tests updated

**Success Criteria**:

- All component tests pass
- TypeScript compilation succeeds
- No runtime errors

---

### Wave 3: E2E Testing (Sequential, 3 hours)

```
┌────────────────────────────────────────────────────────────────┐
│ Add End-to-End Study Flow Tests                               │
│                                                                │
│ Test Scenarios:                                                │
│ 1. Complete Study Session Flow                                │
│    • Start session → Study counties → End session             │
│    • Verify progress updates across stores                    │
│                                                                │
│ 2. Spaced Repetition Integration                              │
│    • Study county → Check SM-2 calculation                    │
│    • Verify next review date                                  │
│                                                                │
│ 3. Achievement Integration                                     │
│    • Reach milestone → Trigger achievement                    │
│    • Verify statistics update                                 │
│                                                                │
│ 4. Goal Progress Tracking                                      │
│    • Set goal → Study counties → Check goal completion        │
│    • Verify event propagation                                 │
│                                                                │
│ Cost: 5 | 3 hours                                              │
└────────────────────────────────────────────────────────────────┘
```

**Deliverables**:

- 4+ E2E test scenarios
- Complete workflow coverage
- Event propagation verification

**Success Criteria**:

- All E2E tests pass
- Cross-store interactions verified
- No event loss or duplication

---

### Wave 4: Facade Removal (Sequential, 0.5 hours)

```
┌────────────────────────────────────────────────────────────────┐
│ Remove StudyStore Facade                                       │
│                                                                │
│ Actions:                                                       │
│ 1. Delete src/stores/studyStore.ts                            │
│ 2. Remove facade exports from src/stores/index.ts             │
│ 3. Update tests to use domain stores                          │
│ 4. Run full test suite                                        │
│ 5. TypeScript compilation check                               │
│                                                                │
│ Safety Checks:                                                 │
│ • Grep for any remaining 'useStudyStore' imports              │
│ • Verify no broken imports                                    │
│ • Ensure all tests still pass                                 │
│                                                                │
│ Cost: 2 | 0.5 hours                                            │
└────────────────────────────────────────────────────────────────┘
```

**Rollback Plan**: Git revert if any tests fail

**Deliverables**:

- studyStore.ts deleted
- Clean import structure
- All tests passing

---

### Wave 5: Validation & Docs (Parallel, 2 hours)

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│ Performance Benchmark       │         │ Update Documentation         │
│                             │         │                              │
│ • Store operation costs     │         │ • Architecture guide         │
│ • Re-render frequency       │    +    │ • Migration patterns         │
│ • Memory usage              │         │ • Store interaction diagram  │
│ • Event propagation delays  │         │ • API reference              │
│                             │         │                              │
│ Cost: 3 | 2 hours           │         │ Cost: 2 | 1.5 hours          │
└─────────────────────────────┘         └──────────────────────────────┘
```

**Benchmark Metrics**:

- Store action execution time
- Component re-render count
- Memory footprint
- Event bus throughput

**Documentation Sections**:

- Store architecture overview
- Domain store usage guide
- StoreCoordinator event patterns
- Migration guide for future refactors

**Deliverables**:

- Performance report
- Updated architecture docs

---

### Wave 6: Production Validation (Sequential, 0.5 hours)

```
┌────────────────────────────────────────────────────────────────┐
│ Production Readiness Validation                                │
│                                                                │
│ Checklist:                                                     │
│ ☑ All tests passing (475+)                                    │
│ ☑ Test coverage ≥ 85% (target: 90%)                          │
│ ☑ Documentation complete                                      │
│ ☑ Performance benchmarks documented                           │
│ ☑ No TypeScript errors                                        │
│ ☑ No ESLint warnings                                          │
│ ☑ Build succeeds                                              │
│ ☑ Architecture grade: A                                       │
│                                                                │
│ Cost: 1 | 0.5 hours                                            │
└────────────────────────────────────────────────────────────────┘
```

**Deliverables**:

- Production readiness certificate
- Architecture grade A

---

## Action Cost Analysis

| Action                 | Cost   | Duration  | Parallelizable  | Category         |
| ---------------------- | ------ | --------- | --------------- | ---------------- |
| analyze_consumers      | 1      | 0.5h      | ✅              | Analysis         |
| add_integration_tests  | 4      | 2h        | ✅              | Testing          |
| migrate_component (×3) | 9      | 4.5h      | ✅              | Migration        |
| add_e2e_tests          | 5      | 3h        | ❌              | Testing          |
| remove_facade          | 2      | 0.5h      | ❌              | Cleanup          |
| performance_benchmark  | 3      | 2h        | ✅              | Validation       |
| update_docs            | 2      | 1.5h      | ✅              | Documentation    |
| validate_production    | 1      | 0.5h      | ❌              | Validation       |
| **TOTAL**              | **27** | **14.5h** | **33% speedup** | **8 categories** |

**With Parallelization**: ~10 hours calendar time

---

## Parallel Execution Strategy

### Wave 1: Analysis Phase

```
Thread 1: analyze_consumers (0.5h)
Thread 2: add_integration_tests (2h)
─────────────────────────────────
Wall time: 2h (instead of 2.5h)
Speedup: 25%
```

### Wave 2: Migration Phase

```
Thread 1: migrate_component[1] (1.5h)
Thread 2: migrate_component[2] (1.5h)
Thread 3: migrate_component[3] (1.5h)
─────────────────────────────────────
Wall time: 1.5h (instead of 4.5h)
Speedup: 67%
```

### Wave 5: Validation Phase

```
Thread 1: performance_benchmark (2h)
Thread 2: update_docs (1.5h)
────────────────────────────────────
Wall time: 2h (instead of 3.5h)
Speedup: 43%
```

**Overall Speedup**: 33% → 10 hours instead of 14.5 hours

---

## Risk Assessment

### Low Risk ✅

- Component migration (established patterns)
- Integration tests (coordinator already tested)
- Documentation updates (no code changes)

### Medium Risk ⚠️

- **Facade removal**: Breaking changes if consumers missed
  - **Mitigation**: Comprehensive grep analysis + TypeScript check
  - **Rollback**: Git revert (< 5 minutes)

### High Risk ❌

- None identified

---

## Success Criteria

### Must Have (MVP)

- [x] 7 game domain stores created
- [x] 7 study domain stores created
- [x] StoreCoordinator wired
- [ ] All 3 facade consumers migrated
- [ ] studyStore facade removed
- [ ] All tests passing (475+)
- [ ] Test coverage ≥ 85%

### Should Have (Quality)

- [x] Domain store unit tests
- [ ] Integration tests for coordinator
- [ ] E2E tests for study workflows
- [ ] Performance benchmarks
- [ ] Architecture documentation

### Nice to Have (Excellence)

- [ ] Migration guide for future refactors
- [ ] Store interaction diagram
- [ ] Performance optimization recommendations
- [ ] Architecture grade A

---

## Rollback Strategy

### Trigger Conditions

1. Test coverage drops below 75%
2. More than 10 tests failing
3. Critical production bugs discovered
4. Build failures after facade removal

### Rollback Steps

```bash
# 1. Revert facade removal
git revert HEAD~1

# 2. Restore component imports
git checkout HEAD~1 -- src/lib/storeIntegration.ts
git checkout HEAD~1 -- src/hooks/useStudyNavigation.ts

# 3. Re-run test suite
npm test

# 4. Verify build
npm run build

# Recovery time: < 1 hour
```

---

## Monitoring & Metrics

### During Execution

- **Test pass rate**: Monitor after each wave
- **Test coverage**: Track with vitest --coverage
- **TypeScript errors**: Run tsc --noEmit
- **Build status**: npm run build after major changes

### Post-Execution

- **Architecture grade**: Calculate based on metrics
- **Performance benchmarks**: Store operation costs
- **Code complexity**: Lines per store, cyclomatic complexity
- **Documentation completeness**: Sections covered

---

## Agent Coordination (Claude Code)

### Wave 1 (Parallel)

```javascript
// Single message - spawn 2 agents
Task('Analysis Agent', 'Grep all studyStore imports, map dependencies', 'code-analyzer');
Task('Testing Agent', 'Add integration tests for storeCoordinator', 'tester');
```

### Wave 2 (Parallel)

```javascript
// Single message - spawn 3 agents
Task('Migration Agent 1', 'Migrate src/lib/storeIntegration.ts', 'coder');
Task('Migration Agent 2', 'Migrate src/hooks/useStudyNavigation.ts', 'coder');
Task('Migration Agent 3', 'Clean up studyStore facade', 'coder');
```

### Wave 3-4 (Sequential)

```javascript
Task('E2E Agent', 'Add end-to-end study flow tests', 'tester');
// Wait for completion
Task('Cleanup Agent', 'Remove studyStore facade safely', 'coder');
```

### Wave 5 (Parallel)

```javascript
// Single message - spawn 2 agents
Task('Benchmark Agent', 'Run performance benchmarks', 'perf-analyzer');
Task('Docs Agent', 'Update architecture documentation', 'api-docs');
```

### Wave 6 (Sequential)

```javascript
Task('Validator Agent', 'Final production readiness check', 'production-validator');
```

---

## Expected Outcomes

### Technical

- ✅ Clean architecture (single responsibility per store)
- ✅ No circular dependencies
- ✅ Event-driven coordination
- ✅ 90%+ test coverage
- ✅ Production-ready codebase

### Quality

- ✅ Architecture Grade: A
- ✅ Maintainability: High
- ✅ Testability: Excellent
- ✅ Documentation: Complete

### Business Value

- ✅ Faster feature development (clear boundaries)
- ✅ Easier debugging (isolated concerns)
- ✅ Better performance (optimized re-renders)
- ✅ Reduced technical debt

---

## Heuristic Evaluation

**A\* Algorithm Metrics**:

- **g(n)**: Cost from start = 0 (we're at the start)
- **h(n)**: Estimated distance to goal = 6 waves
- **f(n)**: Total cost = g(n) + h(n) = 6

**Path Complexity**: Low
**Branching Factor**: 2.5 (some waves have multiple actions)
**Optimality**: This is the optimal path (minimal actions to reach goal)

**Why This Plan is Optimal**:

1. Maximizes parallelization (33% speedup)
2. Minimizes dependencies (most actions independent)
3. Low risk (established patterns, easy rollback)
4. Complete coverage (all requirements met)

---

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Execute Wave 1** (analysis & integration tests)
3. **Execute Wave 2** (component migrations)
4. **Continue through Wave 6** (validation)
5. **Celebrate** 🎉 (Architecture Grade A achieved!)

---

**Plan Version**: 1.0
**Created**: 2025-12-04
**Author**: GOAP Specialist
**Status**: Ready for Execution
