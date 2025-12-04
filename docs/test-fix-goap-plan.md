# GOAP Plan: Fix ~140 Component Test Failures

**Created**: 2025-12-04
**Total Failures**: 140 tests across 9 test files
**Current Pass Rate**: 91% (1372/1512 tests passing)
**Target**: 100% (1512/1512 tests passing)

## Executive Summary

The test failures fall into **7 distinct categories** with clear root causes and dependencies. This GOAP plan provides a systematic approach to achieve 100% test coverage through incremental milestones with measurable success criteria.

## Failure Analysis by Category

### Category 1: Module Resolution Issues (62 tests - 44%)

**Root Cause**: Missing module aliases for Supabase imports
**Affected Files**:

- `tests/unit/components/export-data.test.tsx` (27 tests)
- `tests/unit/components/security-features.test.tsx` (35 tests)

**Error Pattern**:

```
Error: Cannot find module '@/lib/supabase'
Error: Cannot find module '@/services/supabase/auth'
Error: Cannot find module '@/services/supabase/client'
```

### Category 2: Hook Constructor Issues (30+ tests - 21%)

**Root Cause**: AdaptiveGeodataLoader not being mocked as constructor
**Affected Files**:

- `tests/unit/hooks/usePinchZoom.test.ts` (30+ tests)

**Error Pattern**:

```typescript
TypeError: () => { const instance = { load: vi.fn()... } is not a constructor
// Location: src/mobile/hooks/usePinchZoom.ts:129:58
```

### Category 3: Device Detection Logic (5 tests - 4%)

**Root Cause**: Test assertions don't match actual device detection logic
**Affected Files**:

- `tests/unit/hooks/useDeviceInfo.test.ts` (5 tests)

**Error Patterns**:

- Expected undefined for device type, got 'medium-phone'
- Expected true for portrait orientation, got false
- Expected orientation updates not triggering

### Category 4: Gesture Recognition Callbacks (2 tests - 1%)

**Root Cause**: Callback invocation not properly detected in test environment
**Affected Files**:

- `tests/unit/hooks/useGestureRecognition.test.ts` (2 tests)

**Error Pattern**:

```
AssertionError: expected "vi.fn()" to be called at least once
```

### Category 5: WebKit API Mocking (1 test - <1%)

**Root Cause**: WebKit-prefixed vibrate API not properly mocked
**Affected Files**:

- `tests/unit/hooks/useHaptic.test.ts` (1 test)

### Category 6: Accessibility Testing Setup (1 test - <1%)

**Root Cause**: toHaveNoViolations matcher not properly configured
**Affected Files**:

- `tests/accessibility/accessibility-aaa.test.ts` (1 test)

**Error Pattern**:

```
TypeError: Cannot convert undefined or null to object
Location: expect.extend(toHaveNoViolations);
```

### Category 7: JSDOM Storage API (3+ tests - 2%)

**Root Cause**: StorageEvent construction incompatible with JSDOM
**Affected Files**:

- `tests/integration/sync/edgeCases.test.ts` (3+ tests)

**Error Pattern**:

```
TypeError: Failed to construct 'StorageEvent': parameter 2 has member
'storageArea' that is not of type 'Storage'.
```

---

## GOAP Planning Structure

### Current State Analysis

```typescript
const currentState: TestState = {
  totalTests: 1512,
  passingTests: 1372,
  failingTests: 140,
  coverage: 91,
  failureCategories: 7,
  blockedBy: [
    'module_resolution',
    'mock_constructors',
    'device_detection_logic',
    'callback_detection',
    'webkit_api_mocking',
    'accessibility_setup',
    'jsdom_storage_api',
  ],
};
```

### Goal State

```typescript
const goalState: TestState = {
  totalTests: 1512,
  passingTests: 1512,
  failingTests: 0,
  coverage: 100,
  failureCategories: 0,
  blockedBy: [],
};
```

---

## GOAP Milestones with Dependencies

### Milestone 1: Fix Module Resolution Issues

**Priority**: CRITICAL (blocks 62 tests - 44% of failures)
**Estimated Time**: 30 minutes
**Dependencies**: None

**Preconditions**:

- Vitest configuration accessible
- TypeScript path aliases defined
- Module structure documented

**Actions**:

1. Update vitest config to include module aliases for:
   - `@/lib/supabase` → `src/lib/supabase`
   - `@/services/supabase/*` → `src/services/supabase/*`
2. Verify imports resolve correctly in test files
3. Run affected tests to confirm resolution

**Success Criteria**:

- ✅ All `@/lib/supabase` imports resolve
- ✅ All `@/services/supabase/*` imports resolve
- ✅ 62 tests pass (export-data.test.tsx + security-features.test.tsx)
- ✅ No module resolution errors in test output

**Deliverables**:

- Updated vitest configuration
- Test run showing 62 additional passing tests
- Documentation of module alias patterns

**Risk Assessment**:

- **Technical Risk**: LOW (standard vitest configuration)
- **Timeline Risk**: LOW (well-defined problem)
- **Dependencies**: NONE

---

### Milestone 2: Fix AdaptiveGeodataLoader Constructor Issue

**Priority**: HIGH (blocks 30+ tests - 21% of failures)
**Estimated Time**: 45 minutes
**Dependencies**: None

**Preconditions**:

- usePinchZoom hook source code accessible
- Test mocking patterns established
- AdaptiveGeodataLoader interface documented

**Actions**:

1. Update mock to return proper class constructor:
   ```typescript
   vi.mock('../utils/progressiveGeodata', () => ({
     AdaptiveGeodataLoader: vi.fn().mockImplementation(() => ({
       load: vi.fn().mockResolvedValue({}),
       preloadNextLevel: vi.fn().mockResolvedValue({}),
       getCurrentLevel: vi.fn().mockReturnValue('medium'),
       // ... other methods
     })),
     GeodetaLevel: {
       /* enum mock */
     },
   }));
   ```
2. Verify constructor is properly instantiated in hook
3. Test all pinch zoom scenarios

**Success Criteria**:

- ✅ AdaptiveGeodataLoader instantiates without errors
- ✅ All usePinchZoom tests pass (30+ tests)
- ✅ No constructor-related errors in test output
- ✅ Mock properly tracks method calls

**Deliverables**:

- Updated test mocking for AdaptiveGeodataLoader
- Test run showing 30+ additional passing tests
- Reusable mock pattern documentation

**Risk Assessment**:

- **Technical Risk**: MEDIUM (requires understanding mock constructors)
- **Timeline Risk**: LOW (isolated to one hook)
- **Dependencies**: NONE

---

### Milestone 3: Fix Device Detection Logic Tests

**Priority**: MEDIUM (blocks 5 tests - 4% of failures)
**Estimated Time**: 30 minutes
**Dependencies**: None

**Preconditions**:

- useDeviceInfo hook source code accessible
- Device detection thresholds documented
- Test expectations aligned with actual logic

**Actions**:

1. Review actual device detection logic in useDeviceInfo
2. Update test expectations to match implementation:
   - Mobile phone detection thresholds
   - Tablet detection thresholds
   - Orientation calculation logic
3. Verify orientation change event handling
4. Test across different viewport sizes

**Success Criteria**:

- ✅ Device type detection tests pass (mobile/tablet)
- ✅ Orientation detection tests pass
- ✅ Orientation change events properly handled
- ✅ All 5 useDeviceInfo tests pass

**Deliverables**:

- Updated test assertions for device detection
- Test run showing 5 additional passing tests
- Documentation of detection thresholds

**Risk Assessment**:

- **Technical Risk**: LOW (test assertion updates)
- **Timeline Risk**: LOW (small number of tests)
- **Dependencies**: NONE

---

### Milestone 4: Fix Gesture Recognition Callback Detection

**Priority**: MEDIUM (blocks 2 tests - 1% of failures)
**Estimated Time**: 20 minutes
**Dependencies**: None

**Preconditions**:

- useGestureRecognition hook source code accessible
- Callback invocation patterns documented
- Test event simulation working

**Actions**:

1. Review callback invocation logic in useGestureRecognition
2. Update test to properly simulate gesture conditions:
   - Rotation angle changes
   - Three-finger swipe detection
3. Ensure callbacks are invoked synchronously in tests
4. Add debug logging if needed

**Success Criteria**:

- ✅ Rotation callback properly detected
- ✅ Three-finger swipe callback properly detected
- ✅ Both useGestureRecognition tests pass
- ✅ Callback invocations properly tracked

**Deliverables**:

- Updated test event simulation
- Test run showing 2 additional passing tests
- Documentation of gesture callback patterns

**Risk Assessment**:

- **Technical Risk**: LOW (callback detection pattern)
- **Timeline Risk**: LOW (only 2 tests)
- **Dependencies**: NONE

---

### Milestone 5: Fix WebKit API Mocking

**Priority**: LOW (blocks 1 test - <1% of failures)
**Estimated Time**: 15 minutes
**Dependencies**: None

**Preconditions**:

- useHaptic hook source code accessible
- WebKit API documentation reviewed
- Mock setup patterns established

**Actions**:

1. Create proper mock for WebKit-prefixed vibrate API:
   ```typescript
   Object.defineProperty(navigator, 'webkitVibrate', {
     value: mockWebkitVibrate,
     writable: true,
     configurable: true,
   });
   ```
2. Ensure mock is called when WebKit API is used
3. Clean up mock after test

**Success Criteria**:

- ✅ WebKit vibrate API properly mocked
- ✅ Mock invocation properly detected
- ✅ useHaptic WebKit test passes
- ✅ No API compatibility errors

**Deliverables**:

- Updated WebKit API mock
- Test run showing 1 additional passing test
- Documentation of browser API mocking patterns

**Risk Assessment**:

- **Technical Risk**: LOW (simple mock setup)
- **Timeline Risk**: LOW (single test)
- **Dependencies**: NONE

---

### Milestone 6: Fix Accessibility Testing Setup

**Priority**: LOW (blocks 1 test - <1% of failures)
**Estimated Time**: 20 minutes
**Dependencies**: None

**Preconditions**:

- vitest-axe package properly installed
- toHaveNoViolations matcher available
- Accessibility test patterns documented

**Actions**:

1. Fix toHaveNoViolations matcher extension:
   ```typescript
   import { toHaveNoViolations } from 'jest-axe';
   expect.extend(toHaveNoViolations);
   ```
2. Ensure matcher is extended before tests run
3. Verify accessibility test utilities are properly imported
4. Test AAA compliance checks

**Success Criteria**:

- ✅ toHaveNoViolations matcher properly extended
- ✅ Accessibility AAA test passes
- ✅ No matcher extension errors
- ✅ Accessibility utilities functional

**Deliverables**:

- Fixed accessibility test setup
- Test run showing 1 additional passing test
- Documentation of accessibility testing patterns

**Risk Assessment**:

- **Technical Risk**: LOW (matcher configuration)
- **Timeline Risk**: LOW (single test file)
- **Dependencies**: NONE

---

### Milestone 7: Fix JSDOM Storage API Compatibility

**Priority**: MEDIUM (blocks 3+ tests - 2% of failures)
**Estimated Time**: 30 minutes
**Dependencies**: None

**Preconditions**:

- JSDOM version documented
- StorageEvent API requirements understood
- Mock patterns for storage events established

**Actions**:

1. Create proper JSDOM-compatible StorageEvent mock:
   ```typescript
   const createStorageEvent = (key: string, newValue: string) => {
     const event = new Event('storage');
     Object.defineProperties(event, {
       key: { value: key, enumerable: true },
       newValue: { value: newValue, enumerable: true },
       storageArea: { value: window.localStorage, enumerable: true },
     });
     return event;
   };
   ```
2. Update edge case tests to use compatible event creation
3. Test multi-tab sync scenarios
4. Verify storage event propagation

**Success Criteria**:

- ✅ StorageEvent properly constructed in JSDOM
- ✅ Multi-tab sync tests pass
- ✅ Storage event handling verified
- ✅ All 3+ edge case tests pass

**Deliverables**:

- JSDOM-compatible StorageEvent creation utility
- Test run showing 3+ additional passing tests
- Documentation of storage event patterns

**Risk Assessment**:

- **Technical Risk**: MEDIUM (JSDOM API limitations)
- **Timeline Risk**: LOW (small number of tests)
- **Dependencies**: NONE

---

### Milestone 8: Create Reusable Test Patterns Skill

**Priority**: MEDIUM (improves future test development)
**Estimated Time**: 60 minutes
**Dependencies**: Milestones 1-7 completed

**Preconditions**:

- All test fixes validated
- Common patterns identified
- Skill documentation template available

**Actions**:

1. Extract common mock patterns:
   - Module resolution setup
   - Constructor mocking
   - Browser API mocking
   - JSDOM compatibility utilities
2. Create skill file with reusable patterns
3. Document usage examples
4. Add to project skills library

**Success Criteria**:

- ✅ Skill file created with all common patterns
- ✅ Usage examples documented
- ✅ Patterns tested with existing tests
- ✅ Skill integrated into project documentation

**Deliverables**:

- Reusable test patterns skill file
- Usage documentation
- Integration guide
- Pattern library reference

**Risk Assessment**:

- **Technical Risk**: LOW (documentation task)
- **Timeline Risk**: LOW (non-blocking)
- **Dependencies**: All previous milestones

---

### Milestone 9: Validation and Documentation

**Priority**: HIGH (ensures quality)
**Estimated Time**: 30 minutes
**Dependencies**: Milestones 1-8 completed

**Preconditions**:

- All test fixes implemented
- Test suite passing 100%
- Coverage reports generated

**Actions**:

1. Run full test suite to verify 100% pass rate
2. Generate coverage report
3. Update test documentation
4. Create summary of fixes and patterns
5. Document lessons learned

**Success Criteria**:

- ✅ 1512/1512 tests passing (100%)
- ✅ No test failures in any category
- ✅ Coverage maintained or improved
- ✅ Documentation complete

**Deliverables**:

- Test run report showing 100% pass rate
- Updated test documentation
- Summary of fixes document
- Lessons learned documentation

**Risk Assessment**:

- **Technical Risk**: LOW (validation task)
- **Timeline Risk**: LOW (final verification)
- **Dependencies**: All previous milestones

---

## Execution Strategy

### Optimal Execution Order (Based on Dependencies)

```
Phase 1: Independent Fixes (Parallel Execution Possible)
├── Milestone 1: Module Resolution (30 min) → 62 tests fixed
├── Milestone 2: Constructor Mocking (45 min) → 30+ tests fixed
├── Milestone 3: Device Detection (30 min) → 5 tests fixed
├── Milestone 4: Gesture Callbacks (20 min) → 2 tests fixed
├── Milestone 5: WebKit API (15 min) → 1 test fixed
├── Milestone 6: Accessibility (20 min) → 1 test fixed
└── Milestone 7: Storage API (30 min) → 3+ tests fixed

Phase 2: Pattern Creation (Sequential)
└── Milestone 8: Test Patterns Skill (60 min)

Phase 3: Validation (Sequential)
└── Milestone 9: Validation & Documentation (30 min)

Total Estimated Time: 4 hours 20 minutes
Parallel Execution Time: 2 hours 30 minutes (Phase 1)
```

### Risk Mitigation

1. **Module Resolution Issues**: Standard configuration - LOW RISK
2. **Constructor Mocking**: Requires understanding vitest mock patterns - MEDIUM RISK
3. **Device Detection**: Test assertion updates - LOW RISK
4. **Gesture Callbacks**: Event simulation complexity - LOW RISK
5. **WebKit API**: Browser API mocking - LOW RISK
6. **Accessibility**: Matcher configuration - LOW RISK
7. **Storage API**: JSDOM compatibility - MEDIUM RISK

### Success Metrics

| Metric             | Current | Target | Delta |
| ------------------ | ------- | ------ | ----- |
| Passing Tests      | 1372    | 1512   | +140  |
| Pass Rate          | 91%     | 100%   | +9%   |
| Failure Categories | 7       | 0      | -7    |
| Blocked Tests      | 140     | 0      | -140  |

---

## Memory and Tracking Integration

### Claude Flow Memory Storage

```bash
# Store plan in memory
npx claude-flow@alpha memory store \
  --namespace "goap-plans" \
  --key "test-fix-plan-2025-12-04" \
  --value "$(cat docs/test-fix-goap-plan.md)"

# Store progress tracking
npx claude-flow@alpha memory store \
  --namespace "test-progress" \
  --key "milestone-completion" \
  --value '{"completed": [], "in_progress": [], "pending": [1,2,3,4,5,6,7,8,9]}'
```

### AgentDB Integration

```typescript
// Track milestone dependencies in AgentDB
import { AgentDB } from 'agentdb';

const db = new AgentDB('test-fix-tracking');

// Store milestone dependency graph
await db.collection('milestones').add({
  milestone1: { dependencies: [], priority: 'CRITICAL', eta: '30min' },
  milestone2: { dependencies: [], priority: 'HIGH', eta: '45min' },
  milestone3: { dependencies: [], priority: 'MEDIUM', eta: '30min' },
  // ... etc
});

// Track progress
await db.collection('progress').add({
  timestamp: Date.now(),
  testsFixed: 0,
  milestonesComplete: 0,
  currentMilestone: 1,
});
```

---

## Reusable Skills

### Skill 1: Test Mock Constructor Pattern

```typescript
/**
 * Skill: Mock constructor pattern for class-based dependencies
 * Use when: Testing hooks that instantiate classes
 */
export const mockConstructorPattern = {
  name: 'mock-constructor',
  pattern: `
    vi.mock('./dependency', () => ({
      ClassName: vi.fn().mockImplementation(() => ({
        method1: vi.fn().mockResolvedValue(value),
        method2: vi.fn().mockReturnValue(value),
      }))
    }));
  `,
  usage: 'Apply to AdaptiveGeodataLoader and similar class mocks',
};
```

### Skill 2: JSDOM API Compatibility Pattern

```typescript
/**
 * Skill: JSDOM-compatible API mocking
 * Use when: Testing browser APIs in JSDOM environment
 */
export const jsdomCompatibilityPattern = {
  name: 'jsdom-api-compat',
  pattern: `
    Object.defineProperty(navigator, 'apiName', {
      value: mockFunction,
      writable: true,
      configurable: true
    });
  `,
  usage: 'Apply to WebKit APIs and storage events',
};
```

### Skill 3: Module Resolution Setup

```typescript
/**
 * Skill: Vitest module alias configuration
 * Use when: Setting up path aliases for tests
 */
export const moduleResolutionPattern = {
  name: 'vitest-module-aliases',
  pattern: `
    resolve: {
      alias: {
        '@/lib': path.resolve(__dirname, './src/lib'),
        '@/services': path.resolve(__dirname, './src/services'),
      }
    }
  `,
  usage: 'Apply to vitest.config.ts',
};
```

---

## Continuous Improvement

### Post-Implementation Review

- Document all patterns discovered
- Update testing guidelines
- Create test template library
- Share learnings with team
- Update CLAUDE.md with test best practices

### Future Enhancements

- Automated test pattern detection
- Pre-commit test validation
- Test coverage enforcement
- Performance regression testing
- Accessibility compliance automation

---

**Plan Status**: READY FOR EXECUTION
**Last Updated**: 2025-12-04
**Next Review**: After Milestone 3 completion
