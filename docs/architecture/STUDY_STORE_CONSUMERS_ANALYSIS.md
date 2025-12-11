# studyStore Facade Consumer Analysis

**Analysis Date:** 2025-12-08
**Purpose:** Identify all files that import and use the studyStore facade to plan migration to domain stores

---

## Executive Summary

### Key Findings

- **Total Consumer Files:** 3 (excluding tests and documentation)
- **Component Consumers:** 0 ✅
- **Hook Consumers:** 1
- **Library/Integration Consumers:** 1
- **Test Files:** 1
- **Documentation References:** 3 (planning docs)

### Migration Status

🟢 **EXCELLENT POSITION** - Only 2 production files need migration

The codebase is in an excellent state for completing Phase 3. Zero React components directly depend on studyStore, which means the facade pattern is working as intended and migration risk is minimal.

---

## Detailed Consumer Analysis

### 1. Production Code Consumers (2 files)

#### 1.1 `src/lib/storeIntegration.ts`

**Type:** Integration/Infrastructure
**Priority:** MEDIUM
**Complexity:** LOW

**Usage Pattern:**

```typescript
import { useStudyStore } from '../stores/studyStore';

// In setupStudyStoreListeners():
let previousProgress = useStudyStore.getState().progress;
let wasStudySessionActive = useStudyStore.getState().isStudySessionActive;

const unsubscribeStudy = useStudyStore.subscribe((state) => {
  // Monitor progress changes
  if (JSON.stringify(state.progress) !== JSON.stringify(previousProgress)) {
    logger.info('[StoreIntegration] Study progress changed (sync pending Phase 3)');
    previousProgress = state.progress;
  }

  // Detect session end
  if (wasStudySessionActive && !state.isStudySessionActive) {
    logger.info('[StoreIntegration] Study session ended (sync pending Phase 3)');
  }
  wasStudySessionActive = state.isStudySessionActive;
});
```

**Methods/Properties Used:**

- `useStudyStore.getState()` - Static state access
- `.progress` - Progress tracking data
- `.isStudySessionActive` - Session lifecycle flag
- `useStudyStore.subscribe()` - State change listener

**Migration Path:**

```typescript
// Replace with:
import { useProgressStore } from '../stores/study/progressStore';
import { useSessionStore } from '../stores/study/sessionStore';

// Subscribe to domain stores directly
const unsubscribeProgress = useProgressStore.subscribe((state) => {
  // Monitor progress changes
});

const unsubscribeSession = useSessionStore.subscribe((state) => {
  if (wasActive && !state.isActive) {
    // Handle session end
  }
});
```

**Risk Assessment:** LOW

- No React component dependencies
- Clear 1:1 mapping to domain stores
- Already has placeholder comments for Phase 3
- Well-isolated integration logic

---

#### 1.2 `src/hooks/useStudyNavigation.ts`

**Type:** React Hook
**Priority:** MEDIUM
**Complexity:** LOW

**Usage Pattern:**

```typescript
import { useStudyStore } from '../stores/studyStore';

export const useStudyNavigation = ({...}) => {
  const {
    progress,              // From progressStore
    endStudySession,       // From sessionStore
    isStudySessionActive,  // From sessionStore
    currentSession         // From sessionStore
  } = useStudyStore();

  // Uses these for:
  // 1. Navigation guard (check if session active before nav)
  // 2. Study readiness calculation (progress.totalStudied)
  // 3. Game mode recommendations
  // 4. Keyboard shortcuts
  // 5. Auto-save on page unload
}
```

**Methods/Properties Used:**

- `progress` - Progress data
  - `.totalStudied` - Count of studied counties
- `endStudySession()` - Session lifecycle method
- `isStudySessionActive` - Session status flag
- `currentSession` - Active session data
  - `.mode` - Current study mode

**Migration Path:**

```typescript
// Replace with:
import { useProgressStore } from '@/stores/study/progressStore';
import { useSessionStore } from '@/stores/study/sessionStore';

export const useStudyNavigation = ({...}) => {
  const progress = useProgressStore((state) => state);
  const {
    isActive: isStudySessionActive,
    currentSession,
    endSession: endStudySession
  } = useSessionStore();

  // All logic remains identical
  // Just renamed endSession -> endStudySession for compatibility
}
```

**Risk Assessment:** LOW

- Clean dependency boundaries
- Simple state selection
- No complex derived state
- Easy to test

---

### 2. Test Files (1 file)

#### 2.1 `tests/unit/stores/studyStore.test.ts`

**Type:** Unit Test
**Priority:** LOW
**Complexity:** LOW

**Usage Pattern:**

```typescript
import { useStudyStore } from '../../../src/stores/studyStore';

describe('studyStore - TODO implementations', () => {
  const store = useStudyStore.getState();

  // Tests facade methods:
  store.resetProgress();
  store.startStudySession('flashcards');
  store.markCountyAsStudied('county1', 'easy');
  store.endStudySession();
  store.getRegionProgress('Bay Area');
});
```

**Methods Used:**

- `resetProgress()` - Test setup
- `startStudySession()` - Session management
- `markCountyAsStudied()` - County tracking
- `endStudySession()` - Session cleanup
- `getRegionProgress()` - Derived data

**Migration Strategy:**
Either:

1. **Keep facade tests** - Test the facade continues to work as integration layer
2. **Migrate to domain tests** - Test domain stores directly and remove facade tests

**Recommendation:** Keep facade tests during Phase 3, remove in Phase 4 when facade is deprecated.

---

### 3. Non-Consumer References

#### 3.1 `src/stores/authStore.ts` (Line 44)

**Type:** Comment/Documentation
**Status:** Not a consumer

Contains only a comment:

```typescript
* Follows exact pattern from gameStore.ts and studyStore.ts
```

**Action Required:** Update comment in Phase 4 to reference domain stores pattern.

---

#### 3.2 Documentation Files (3 files)

**Type:** Planning Documents
**Status:** Not actual code consumers

- `docs/goap-execution-plan.md` - Contains GOAP migration plan
- `docs/goap-plan-visual.md` - Visual representation of plan
- `docs/goap-action-plan.md` - Action breakdown

**Action Required:** None - these document the migration plan itself.

---

## Migration Priority Matrix

### High Priority (Complete First) ✅

**NONE** - No high-priority consumers blocking other work

### Medium Priority (Phase 3 Target)

1. **`useStudyNavigation` hook** (1-2 hours)
   - Impact: Study mode navigation
   - Complexity: Low
   - Dependencies: None
   - Test Coverage: Add tests for domain store usage

2. **`storeIntegration` lib** (2-3 hours)
   - Impact: Supabase sync coordination
   - Complexity: Low
   - Dependencies: Already has Phase 3 placeholders
   - Test Coverage: Integration tests exist

### Low Priority (Phase 4 Cleanup)

1. **Test file migration** (1 hour)
   - Migrate or remove facade tests
   - Ensure domain store test coverage

2. **Comment updates** (15 minutes)
   - Update authStore.ts comment
   - Update any other architectural references

---

## Phase 3 Migration Plan

### Step 1: Migrate useStudyNavigation Hook

**Estimated Time:** 1-2 hours

```typescript
// Before (facade):
const { progress, endStudySession, isStudySessionActive, currentSession } = useStudyStore();

// After (domain stores):
const progress = useProgressStore((state) => ({
  totalStudied: state.totalStudied,
  totalCounties: state.totalCounties,
}));

const {
  isActive: isStudySessionActive,
  currentSession,
  endSession: endStudySession,
} = useSessionStore();
```

**Validation:**

- [ ] Hook exports unchanged
- [ ] All consuming components work
- [ ] Study readiness calculations correct
- [ ] Navigation guards function properly

---

### Step 2: Migrate storeIntegration Listeners

**Estimated Time:** 2-3 hours

```typescript
// Before (facade):
const unsubscribeStudy = useStudyStore.subscribe((state) => {
  if (JSON.stringify(state.progress) !== JSON.stringify(previousProgress)) {
    // sync logic
  }
});

// After (domain stores):
const unsubscribeProgress = useProgressStore.subscribe((state) => {
  // Direct progress monitoring
  // Implement Supabase sync here
});

const unsubscribeSession = useSessionStore.subscribe((state) => {
  if (wasActive && !state.isActive) {
    // Session end logic
    // Implement session recording here
  }
});
```

**Validation:**

- [ ] All sync events still fire
- [ ] Session recording works
- [ ] Progress tracking accurate
- [ ] No memory leaks from subscriptions

---

### Step 3: Update Tests

**Estimated Time:** 1 hour

Options:

1. Keep facade tests as integration tests
2. Migrate to domain store unit tests
3. Hybrid: Both facade integration + domain unit tests

**Recommendation:** Keep facade tests temporarily, add domain tests, remove facade tests in Phase 4.

---

### Step 4: Final Validation

**Estimated Time:** 1 hour

- [ ] Run full test suite
- [ ] Test study mode end-to-end
- [ ] Verify Supabase sync
- [ ] Check session recording
- [ ] Validate progress calculations
- [ ] Test navigation guards
- [ ] Verify keyboard shortcuts

---

## Technical Debt & Cleanup Opportunities

### During Migration

1. **Type Safety Improvements**
   - Use discriminated unions for session modes
   - Strict null checks for optional session data
   - Proper typing for store subscriptions

2. **Performance Optimizations**
   - Use shallow comparison instead of JSON.stringify
   - Memoize derived calculations
   - Batch state updates where possible

3. **Error Handling**
   - Add try-catch around sync operations
   - Proper error boundaries for hooks
   - Logging for debugging

### Post-Migration (Phase 4)

1. **Deprecation Warnings**
   - Add console warnings when facade is used
   - Provide migration path in warnings
   - Set timeline for facade removal

2. **Documentation**
   - Update architecture diagrams
   - Document domain store patterns
   - Create migration guide for future features

3. **Final Cleanup**
   - Remove facade entirely
   - Update all references
   - Clean up unused types
   - Archive migration documentation

---

## Risk Assessment

### Overall Risk: 🟢 LOW

**Why Migration is Low-Risk:**

1. ✅ Only 2 production files depend on facade
2. ✅ No direct component dependencies
3. ✅ Clear 1:1 mapping to domain stores
4. ✅ Existing test coverage
5. ✅ Well-documented architecture
6. ✅ Phase 3 placeholders already in code

**Potential Risks:**

1. 🟡 State sync timing issues (mitigated by tests)
2. 🟡 Subscription cleanup (mitigated by existing pattern)
3. 🟢 Type mismatches (mitigated by TypeScript)
4. 🟢 Performance regression (mitigated by shallow comparison)

**Mitigation Strategies:**

- Incremental migration (one file at a time)
- Comprehensive testing at each step
- Feature flags for rollback capability
- Monitoring for performance impacts

---

## Success Metrics

### Phase 3 Completion Criteria

- [ ] Zero facade dependencies in production code
- [ ] All tests passing (0 failures)
- [ ] No TypeScript errors
- [ ] No runtime errors in study mode
- [ ] Supabase sync working correctly
- [ ] Session recording functional
- [ ] Navigation guards operational
- [ ] Performance maintained or improved

### Performance Targets

- Study mode load time: < 200ms (maintain current)
- Session state updates: < 50ms (improve from ~100ms)
- Memory usage: No increase (maintain current)
- Bundle size: -2KB (remove facade overhead)

---

## Timeline Estimate

### Conservative Estimate

- Hook migration: 2 hours
- Integration migration: 3 hours
- Testing & validation: 2 hours
- Documentation: 1 hour
- **Total: 8 hours (1 day)**

### Optimistic Estimate

- Hook migration: 1 hour
- Integration migration: 2 hours
- Testing & validation: 1 hour
- Documentation: 30 minutes
- **Total: 4.5 hours (half day)**

### Realistic Estimate

**6 hours** - Accounts for:

- Unexpected issues
- Additional testing
- Code review iterations
- Documentation updates

---

## Next Steps

1. **Immediate:**
   - Review this analysis with team
   - Confirm migration approach
   - Schedule Phase 3 work

2. **Before Starting:**
   - Create feature branch
   - Backup current state
   - Set up monitoring

3. **During Migration:**
   - Migrate one file at a time
   - Test after each change
   - Commit frequently

4. **After Completion:**
   - Full regression testing
   - Update architecture docs
   - Plan Phase 4 cleanup

---

## Conclusion

The studyStore facade has served its purpose excellently. With only 2 production consumers and zero direct component dependencies, the codebase is in an ideal state for completing Phase 3 migration. The facade pattern successfully isolated the domain store refactoring from the rest of the application.

**Recommendation:** Proceed with Phase 3 migration. The low number of consumers and clear migration paths make this a low-risk, high-value task that will complete the studyStore decomposition effort.

---

_Analysis completed by Research Agent_
_For questions or clarifications, reference GOAP plan in `docs/goap-execution-plan.md`_
