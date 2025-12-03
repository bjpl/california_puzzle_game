# GOAP Plan: CI/CD Lint Fix Swarm

**Generated:** 2025-12-03T03:34:00Z
**Swarm ID:** swarm_1764732757384_s3rj78ku6
**Planner:** GOAP Agent (Claude Sonnet 4.5)

## Executive Summary

**Current State:** 60+ ESLint errors blocking CI/CD pipeline
**Goal State:** 0 errors, CI/CD passes, functionality maintained
**Total Cost:** 14 action points
**Estimated Time:** 55 minutes with parallel execution
**Risk Level:** Low-Medium

## State Space

### Initial State
```json
{
  "typescript_compiles": true,
  "lint_errors": 60,
  "ci_cd_blocked": true,
  "tests_pass": "unknown",
  "localStorage_errors": 16,
  "any_type_errors": 20,
  "console_errors": 10,
  "unused_var_errors": 7,
  "unused_disable_errors": 1
}
```

### Goal State
```json
{
  "lint_errors": 0,
  "ci_cd_blocked": false,
  "typescript_compiles": true,
  "tests_pass": true,
  "code_quality_maintained": true
}
```

## Action Definitions

### Action 1: Fix localStorage Errors
- **ID:** `FIX_LOCALSTORAGE`
- **Type:** Deterministic Code Fix
- **Preconditions:** `files_readable AND zustand_stores_exist`
- **Effects:**
  - `localStorage_errors: 16 → 0`
  - `state_management_improved: true`
- **Files Affected:** 6
  - `src/hooks/useInstallPrompt.ts` (2 errors)
  - `src/services/analytics.ts` (2 errors)
  - `src/utils/accessibility.tsx` (2 errors)
  - `tests/integration/auth/auth-flow.test.ts` (10 errors)
- **Tools:** [grep, edit, ast_parser]
- **Execution Mode:** Hybrid (pattern detection + LLM context)
- **Cost:** 3
- **Estimated Time:** 15-20 minutes
- **Parallelizable:** Yes (files independent)

### Action 2: Fix @typescript-eslint/no-explicit-any
- **ID:** `FIX_ANY_TYPES`
- **Type:** Type Safety Enhancement
- **Preconditions:** `typescript_compiles AND type_definitions_available`
- **Effects:**
  - `any_type_errors: 20 → 0`
  - `type_safety_improved: true`
- **Files Affected:** 8
  - `src/hooks/useInstallPrompt.ts` (2 errors)
  - `src/hooks/usePerformanceMonitoring.ts` (1 error)
  - `src/hooks/useViewportGeodata.ts` (2 errors)
  - `src/lib/conflictResolver.ts` (8 errors - COMPLEX)
  - `src/services/analytics.ts` (4 errors)
  - `src/utils/performance.ts` (5 errors)
  - `src/utils/performanceBudget.ts` (1 error)
  - `src/utils/webVitalsEnhanced.ts` (1 error)
- **Tools:** [typescript_analyzer, edit]
- **Execution Mode:** Hybrid (type inference + manual types)
- **Cost:** 4
- **Estimated Time:** 25-30 minutes
- **Parallelizable:** Partially (some type dependencies)
- **Sub-actions:**
  - `2a`: Fix utilities (parallel)
  - `2b`: Fix hooks (may depend on 2a types)
  - `2c`: Fix conflictResolver.ts (complex, sequential)

### Action 3: Fix no-console Errors
- **ID:** `FIX_CONSOLE`
- **Type:** Logging Standardization
- **Preconditions:** `logger_utility_exists`
- **Effects:**
  - `console_errors: 10 → 0`
  - `logging_centralized: true`
- **Files Affected:** 6
  - `src/lib/supabase.ts` (3 errors)
  - `src/services/supabase/client.ts` (2 errors)
  - `src/stores/storeCoordinator.ts` (2 errors)
  - `src/utils/logger.ts` (2 errors)
  - `src/utils/performanceBudget.ts` (1 error)
  - `src/utils/webVitalsEnhanced.ts` (2 errors)
- **Tools:** [grep, edit]
- **Execution Mode:** Code (pattern replacement)
- **Cost:** 2
- **Estimated Time:** 10-15 minutes
- **Parallelizable:** Yes (files independent)

### Action 4: Fix Unused Variables
- **ID:** `FIX_UNUSED_VARS`
- **Type:** Code Cleanup
- **Preconditions:** `test_file_readable`
- **Effects:**
  - `unused_var_errors: 7 → 0`
  - `code_cleaned: true`
- **Files Affected:** 1
  - `tests/accessibility/accessibility-aaa.test.ts` (7 errors)
- **Tools:** [edit]
- **Execution Mode:** Code (remove/prefix with _)
- **Cost:** 1
- **Estimated Time:** 5 minutes
- **Parallelizable:** Yes

### Action 5: Fix Unused eslint-disable
- **ID:** `FIX_UNUSED_DISABLE`
- **Type:** ESLint Directive Cleanup
- **Preconditions:** `file_readable`
- **Effects:**
  - `unused_disable_errors: 1 → 0`
- **Files Affected:** 1
  - `src/hooks/useViewportGeodata.ts` (1 error)
- **Tools:** [edit]
- **Execution Mode:** Code (remove directive)
- **Cost:** 1
- **Estimated Time:** 2 minutes
- **Parallelizable:** Yes

### Action 6: Run Full Lint Validation
- **ID:** `VALIDATE_LINT`
- **Type:** Verification
- **Preconditions:** `all_fixes_applied`
- **Effects:**
  - `lint_errors_verified: 0`
  - `ci_cd_blocked: false`
- **Tools:** [bash]
- **Execution Mode:** Code (`npm run lint`)
- **Cost:** 1
- **Estimated Time:** 3-5 minutes
- **Parallelizable:** No (must be last)

### Action 7: Run Test Suite
- **ID:** `VALIDATE_TESTS`
- **Type:** Regression Testing
- **Preconditions:** `lint_passes AND all_fixes_applied`
- **Effects:**
  - `tests_pass: true`
  - `functionality_maintained: true`
- **Tools:** [bash]
- **Execution Mode:** Code (`npm test`)
- **Cost:** 2
- **Estimated Time:** 5-10 minutes
- **Parallelizable:** No (must be after fixes)

## Optimal Execution Plan (A* Path)

### Phase 1: Parallel Quick Wins
**Cost:** 4 | **Time:** ~15 minutes | **Errors Fixed:** 18

**Execute Concurrently:**
```
Action 4: FIX_UNUSED_VARS (1 file, 7 errors)
Action 5: FIX_UNUSED_DISABLE (1 file, 1 error)
Action 3: FIX_CONSOLE (6 files, 10 errors)
```

**Rationale:** Independent actions with no shared state. Maximum parallelization for quick visible progress.

**Agent Assignment:**
- Quick Fix Agent → Handles all three actions
- Low risk of breaking changes
- Simple pattern-based fixes

### Phase 2: Parallel Complex Fixes
**Cost:** 7 | **Time:** ~30 minutes | **Errors Fixed:** 36

**Execute Concurrently (with sub-coordination):**
```
Action 1: FIX_LOCALSTORAGE (6 files, 16 errors)
  ├─ useInstallPrompt.ts
  ├─ analytics.ts
  ├─ accessibility.tsx
  └─ auth-flow.test.ts

Action 2: FIX_ANY_TYPES (8 files, 20 errors)
  ├─ Sub-action 2a: Fix utilities (parallel)
  │   ├─ performance.ts (5 errors)
  │   ├─ performanceBudget.ts (1 error)
  │   └─ webVitalsEnhanced.ts (1 error)
  ├─ Sub-action 2b: Fix hooks (may depend on 2a)
  │   ├─ useInstallPrompt.ts (2 errors)
  │   ├─ usePerformanceMonitoring.ts (1 error)
  │   └─ useViewportGeodata.ts (2 errors)
  └─ Sub-action 2c: Fix conflict resolver (complex)
      └─ conflictResolver.ts (8 errors - sequential handling)
```

**Rationale:**
- localStorage fixes are independent per file
- Simple any-type fixes can run in parallel
- Complex type fixes in conflictResolver.ts handled with care

**Agent Assignment:**
- State Management Agent → Action 1 (localStorage → Zustand)
- Type Safety Agent → Action 2 (any types, TypeScript expertise)
- Agents coordinate via memory for shared type definitions

### Phase 3: Validation
**Cost:** 3 | **Time:** ~10 minutes | **Errors Fixed:** 0 (verification)

**Execute Sequentially:**
```
Action 6: VALIDATE_LINT
  ↓ (if pass)
Action 7: VALIDATE_TESTS
```

**Rationale:** Must verify all fixes work before declaring goal achieved.

**Agent Assignment:**
- Validation Agent → Both actions
- Reports results and triggers replan if needed

## Dependency Graph

```
                    START
                      |
        +-------------+-------------+
        |             |             |
    Action 4      Action 5      Action 3
  (unused vars) (eslint-disable) (console)
        |             |             |
        +-------------+-------------+
                      |
              Phase 1 Complete
                      |
        +-------------+-------------+
        |                           |
    Action 1                    Action 2
  (localStorage)              (any types)
        |                       /   |   \
        |                     2a   2b   2c
        |                  (utils)(hooks)(resolver)
        |                           |
        +-------------+-------------+
                      |
              Phase 2 Complete
                      |
                  Action 6
                  (lint)
                      |
              (if lint passes)
                      |
                  Action 7
                  (tests)
                      |
                   SUCCESS
```

## Replan Triggers (OODA Loop)

### Observe → Orient → Decide → Act

**Trigger 1: Lint Errors Remain After Phase 2**
- **Observe:** `npm run lint` shows non-zero errors
- **Orient:** Analyze new error types/locations
- **Decide:** Add new actions for remaining errors
- **Act:** Execute additional fix actions, re-validate

**Trigger 2: Tests Fail After Fixes**
- **Observe:** `npm test` fails
- **Orient:** Identify which fix broke functionality
- **Decide:** Rollback specific fix OR fix breakage
- **Act:** Apply corrective action, re-run tests

**Trigger 3: Type Fixes Introduce TypeScript Errors**
- **Observe:** `npm run typecheck` fails
- **Orient:** Identify missing/incorrect type definitions
- **Decide:** Add type definition action
- **Act:** Create proper types, re-validate

**Trigger 4: Circular Type Dependencies**
- **Observe:** Types depend on each other (conflictResolver.ts)
- **Orient:** Map dependency chain
- **Decide:** Switch to sequential execution for type fixes
- **Act:** Execute Action 2 sub-actions sequentially

**Trigger 5: Agent Execution Failure**
- **Observe:** Agent reports error/timeout
- **Orient:** Check error logs, resource constraints
- **Decide:** Retry OR reassign to different agent
- **Act:** Execute with adjusted parameters

## Success Criteria

### Primary Goals (MUST achieve)
- [ ] ESLint errors: 60+ → 0
- [ ] `npm run lint` exits with code 0
- [ ] CI/CD pipeline unblocked

### Secondary Goals (SHOULD achieve)
- [ ] `npm test` passes (no regressions)
- [ ] `npm run typecheck` passes
- [ ] Code quality maintained/improved

### Validation Checklist
- [ ] All 6 file categories addressed
- [ ] No new TypeScript errors introduced
- [ ] State management properly migrated
- [ ] Logging standardized via logger utility
- [ ] Type safety improved (no any types)
- [ ] Test coverage maintained

## Cost-Benefit Analysis

### Total Cost: 14 Action Points
- Phase 1: 4 points (Quick wins)
- Phase 2: 7 points (Complex fixes)
- Phase 3: 3 points (Validation)

### Total Time: ~55 Minutes
- Phase 1: 15 minutes (parallel)
- Phase 2: 30 minutes (parallel with coordination)
- Phase 3: 10 minutes (sequential)

### Time Savings from Parallelization
- Sequential execution: ~80 minutes
- Parallel execution: ~55 minutes
- **Savings: 25 minutes (31% faster)**

### Risk Assessment

**Low Risk (Actions 3, 4, 5):**
- Simple pattern replacements
- No logic changes
- Easy to verify

**Medium Risk (Action 1):**
- Requires understanding state stores
- Logic migration (localStorage → Zustand)
- Test adjustments needed

**Medium-High Risk (Action 2):**
- Type inference may be incorrect
- conflictResolver.ts is complex (8 errors)
- May introduce new TypeScript errors
- Requires careful type definition

### Mitigation Strategies
1. **Incremental validation:** Lint after each phase
2. **Test coverage:** Run tests after all fixes
3. **Version control:** Commit after each successful phase
4. **Rollback plan:** Use git to revert if needed
5. **Type validation:** Run typecheck alongside lint

## Execution Commands

### Phase 1 Execution
```bash
# Quick Fix Agent spawned via Claude Code Task tool
# Handles Actions 3, 4, 5 in parallel
```

### Phase 2 Execution
```bash
# State Management Agent spawned via Task tool
# Type Safety Agent spawned via Task tool
# Parallel execution with memory coordination
```

### Phase 3 Execution
```bash
# Validation Agent
npm run lint          # Action 6
npm test              # Action 7 (if lint passes)
```

## Memory Coordination Keys

- `swarm/goap/plan` - This plan document
- `swarm/quick-fix/status` - Phase 1 agent status
- `swarm/state-mgmt/status` - Action 1 status
- `swarm/type-safety/status` - Action 2 status
- `swarm/validation/results` - Phase 3 results
- `swarm/types/shared` - Shared type definitions
- `swarm/replanning/trigger` - Replan signals

## Success Metrics

### Performance Metrics
- Actions completed: 0/7
- Errors fixed: 0/60
- Time elapsed: 0/55 minutes
- Cost consumed: 0/14 points

### Quality Metrics
- Lint errors: 60 → ?
- Test pass rate: unknown → 100%
- TypeScript errors: 0 → 0 (maintain)
- Code coverage: maintain/improve

---

**Plan Status:** Ready for execution
**Next Action:** Initialize swarm agents via Claude Code Task tool
**Estimated Completion:** 2025-12-03T04:29:00Z (55 minutes from start)
