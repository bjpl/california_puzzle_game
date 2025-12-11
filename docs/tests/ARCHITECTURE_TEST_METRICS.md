# Store Architecture Test Metrics & Success Criteria

**Document Type:** Test Metrics Dashboard
**Date:** December 10, 2025
**Author:** QA Specialist Agent
**Purpose:** Define measurable success criteria for store architecture testing

---

## Test Coverage Targets

### Domain Store Coverage Goals

| Store                     | LOC  | Target Coverage | Estimated Tests | Priority |
| ------------------------- | ---- | --------------- | --------------- | -------- |
| **sessionStore**          | 80   | 90%+            | 30-40           | CRITICAL |
| **countyProgressStore**   | 100  | 90%+            | 35-45           | CRITICAL |
| **spacedRepetitionStore** | 120  | 85%+            | 40-50           | HIGH     |
| **progressStore**         | 90   | 85%+            | 25-35           | HIGH     |
| **goalsStore**            | 110  | 80%+            | 30-40           | MEDIUM   |
| **statisticsStore**       | 100  | 80%+            | 25-30           | MEDIUM   |
| **studySettingsStore**    | 60   | 75%+            | 15-20           | LOW      |
| **storeCoordinator**      | 600+ | 95%+ ✅         | MAINTAIN        | MAINTAIN |

**Total New Tests Required:** 200-260 unit tests

### Coverage Breakdown

```
Target Coverage by Type:
├─ Lines: 85%+
├─ Branches: 80%+
├─ Functions: 85%+
└─ Statements: 85%+
```

---

## Performance Benchmarks

### Event Propagation Latency

| Metric           | Target | Measurement Method  |
| ---------------- | ------ | ------------------- |
| **p50 (median)** | <5ms   | `performance.now()` |
| **p95**          | <10ms  | `performance.now()` |
| **p99**          | <25ms  | `performance.now()` |
| **max**          | <100ms | `performance.now()` |

### Memory Usage

| Scenario                 | Target             | Measurement Method               |
| ------------------------ | ------------------ | -------------------------------- |
| **1,000 events**         | <5MB growth        | `process.memoryUsage().heapUsed` |
| **10,000 events**        | <20MB growth       | `process.memoryUsage().heapUsed` |
| **Subscription cleanup** | Return to baseline | `global.gc()` + measure          |

### Subscription Overhead

| Operation                      | Target | Measurement Method  |
| ------------------------------ | ------ | ------------------- |
| **100 subscriptions**          | <50ms  | `performance.now()` |
| **1,000 subscriptions**        | <500ms | `performance.now()` |
| **Publish to 100 subscribers** | <20ms  | `performance.now()` |

### Bundle Size Impact

| Component              | Current | Target        | Impact       |
| ---------------------- | ------- | ------------- | ------------ |
| **Domain Stores (7)**  | TBD     | <30KB gzipped | Minimal      |
| **StoreCoordinator**   | TBD     | <10KB gzipped | Minimal      |
| **Total Architecture** | TBD     | <40KB gzipped | <5% increase |

---

## Test Quality Metrics

### Test Reliability

| Metric                 | Target | Current | Status     |
| ---------------------- | ------ | ------- | ---------- |
| **Flaky Test Rate**    | <1%    | TBD     | 🟡 MEASURE |
| **Test Pass Rate**     | 100%   | TBD     | 🟡 MEASURE |
| **Consecutive Passes** | 3x     | TBD     | 🟡 MEASURE |

### Test Execution Time

| Test Type             | Target | Current  | Status     |
| --------------------- | ------ | -------- | ---------- |
| **Unit Tests**        | <30s   | TBD      | 🟡 MEASURE |
| **Integration Tests** | <2min  | ~2min ✅ | 🟢 GOOD    |
| **Performance Tests** | <1min  | N/A      | 🔴 MISSING |
| **Full Suite**        | <5min  | ~5min ✅ | 🟢 GOOD    |

### Test Organization

| Metric              | Target   | Current      | Status        |
| ------------------- | -------- | ------------ | ------------- |
| **Tests per File**  | 20-50    | ~30 avg ✅   | 🟢 GOOD       |
| **Max File Size**   | <800 LOC | 1,200 LOC ⚠️ | 🟡 ACCEPTABLE |
| **Test Categories** | 5+       | 5 ✅         | 🟢 GOOD       |

---

## Test Coverage Dashboard

### Current Coverage (Baseline)

```
Overall Coverage: TBD (run npm run test:coverage)
├─ Stores: TBD
│  ├─ Domain Stores (7): 0% ❌
│  ├─ Legacy Stores: 85-90% ✅
│  └─ StoreCoordinator: 95%+ ✅
├─ Components: 80-85% ✅
├─ Hooks: 95%+ ✅
├─ Services: 85-90% ✅
└─ Utils: 75-80% ✅
```

### Target Coverage (Post-Implementation)

```
Overall Coverage: 85%+
├─ Stores: 90%+
│  ├─ Domain Stores (7): 85-90% ✅
│  ├─ Legacy Stores: 85-90% ✅
│  └─ StoreCoordinator: 95%+ ✅
├─ Components: 80-85% ✅
├─ Hooks: 95%+ ✅
├─ Services: 85-90% ✅
└─ Utils: 75-80% ✅
```

---

## Success Criteria Checklist

### Phase 1: Critical Path Tests ✅

- [ ] **sessionStore.test.ts** created (30-40 tests)
  - [ ] Session lifecycle tests (start, pause, resume, end)
  - [ ] Event publishing tests (SESSION_STARTED, SESSION_COMPLETED)
  - [ ] County recording tests
  - [ ] Coverage: 90%+

- [ ] **countyProgressStore.test.ts** created (35-45 tests)
  - [ ] Progress tracking tests
  - [ ] Mastery level calculation tests
  - [ ] Response time analytics tests
  - [ ] Event publishing tests (COUNTY_STUDIED, COUNTY_MASTERY_CHANGED)
  - [ ] Coverage: 90%+

- [ ] **Integration test enhancements**
  - [ ] Concurrent session test added
  - [ ] Event storm resilience test added
  - [ ] Error isolation test added

### Phase 2: Extended Coverage ✅

- [ ] **spacedRepetitionStore.test.ts** created (40-50 tests)
  - [ ] SM-2 algorithm tests
  - [ ] Review queue tests
  - [ ] Card scheduling tests
  - [ ] Coverage: 85%+

- [ ] **progressStore.test.ts** created (25-35 tests)
  - [ ] Progress aggregation tests
  - [ ] Streak tracking tests
  - [ ] Milestone detection tests
  - [ ] Coverage: 85%+

- [ ] **goalsStore.test.ts** created (30-40 tests)
  - [ ] Goal creation tests
  - [ ] Progress tracking tests
  - [ ] Completion detection tests
  - [ ] Coverage: 80%+

### Phase 3: Statistics & Performance ✅

- [ ] **statisticsStore.test.ts** created (25-30 tests)
  - [ ] Session statistics tests
  - [ ] Chart data generation tests
  - [ ] Achievement tracking tests
  - [ ] Coverage: 80%+

- [ ] **studySettingsStore.test.ts** created (15-20 tests)
  - [ ] Settings persistence tests
  - [ ] Validation tests
  - [ ] Coverage: 75%+

- [ ] **Performance benchmark suite** created
  - [ ] Event propagation latency tests (p95 <10ms)
  - [ ] Memory usage tests (<5MB growth)
  - [ ] Subscription overhead tests (<50ms)

### Phase 4: Migration & Documentation ✅

- [ ] **Migration tests** created
  - [ ] Data migration tests
  - [ ] Backward compatibility tests

- [ ] **Documentation** updated
  - [ ] TEST_SUITE_EVALUATION.md updated
  - [ ] Test execution guides created
  - [ ] Performance baselines documented

---

## Quality Gates

### Pre-Merge Quality Gate

**Must Pass ALL:**

1. ✅ All unit tests pass (0 failures)
2. ✅ All integration tests pass (0 failures)
3. ✅ Coverage targets met (85%+ overall)
4. ✅ No new flaky tests introduced
5. ✅ Code review approved

### Pre-Production Quality Gate

**Must Pass ALL:**

1. ✅ Full test suite passes 3 consecutive times
2. ✅ Performance benchmarks pass (latency <10ms p95)
3. ✅ Memory tests pass (<5MB growth)
4. ✅ E2E tests pass (if applicable)
5. ✅ Test documentation reviewed

---

## Measurement Commands

### Generate Coverage Report

```bash
npm run test:coverage
open coverage/index.html
```

### Run Specific Test Suites

```bash
# Domain store unit tests
npm test -- tests/unit/stores/study/

# Integration tests
npm test -- tests/integration/storeCoordinator.integration.test.ts

# Performance benchmarks
npm test -- tests/integration/architecture-performance.test.ts
```

### Check Test Execution Time

```bash
npm test -- --reporter=verbose
```

### Detect Flaky Tests

```bash
# Run full suite 10 times
for i in {1..10}; do npm test -- --run || echo "FAILED on run $i"; done
```

---

## Test Metrics Tracking Template

### Weekly Test Metrics Report

```markdown
## Week of [DATE]

### Coverage

- Overall: X%
- Domain Stores: X%
- StoreCoordinator: X%

### Test Count

- Total Tests: X
- New Tests This Week: X
- Tests Removed: X

### Test Quality

- Flaky Test Rate: X%
- Average Execution Time: Xs
- Performance Benchmarks: PASS/FAIL

### Issues

- Flaky Tests: [list]
- Slow Tests (>1s): [list]
- Failed Tests: [list]

### Actions

- [ ] Fix flaky tests
- [ ] Optimize slow tests
- [ ] Improve coverage in [area]
```

---

## Appendix: Calculation Methods

### Percentile Calculation

```typescript
function calculatePercentile(values: number[], percentile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}
```

### Memory Growth Calculation

```typescript
function measureMemoryGrowth(operation: () => void): number {
  const initial = process.memoryUsage().heapUsed;
  operation();
  global.gc?.(); // Force garbage collection
  const final = process.memoryUsage().heapUsed;
  return final - initial;
}
```

### Flaky Test Detection

```typescript
async function detectFlakyTests(testFile: string, runs: number = 10): Promise<string[]> {
  const results = new Map<string, number>(); // test name -> fail count

  for (let i = 0; i < runs; i++) {
    const result = await runTests(testFile);
    result.failures.forEach((test) => {
      results.set(test.name, (results.get(test.name) || 0) + 1);
    });
  }

  // Tests that fail sometimes but not always are flaky
  return Array.from(results.entries())
    .filter(([_, failCount]) => failCount > 0 && failCount < runs)
    .map(([name]) => name);
}
```

---

**Prepared By:** QA Specialist Agent
**Last Updated:** December 10, 2025
**Review Frequency:** Weekly during development, Monthly after stabilization
