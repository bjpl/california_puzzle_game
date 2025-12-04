---
name: test-recovery-swarm
description: Systematic test failure recovery using GOAP planning and swarm coordination
version: 1.0.0
author: Claude Flow Swarm
tags: [testing, goap, swarm, recovery, vitest]
---

# Test Recovery Swarm Skill

Systematic approach to recovering from test failures using GOAP planning and multi-agent swarm coordination.

## When to Use

- Large number of test failures (50+)
- Need systematic categorization and prioritization
- Complex test dependencies
- Multiple failure root causes
- Want reusable documentation

## Methodology

### Phase 1: Analysis & Planning

1. **Categorize Failures** - Group tests by root cause
2. **GOAP Planning** - Create milestones with dependencies
3. **Prioritize** - Order by impact and risk
4. **Document** - Create execution plan

### Phase 2: Parallel Execution

1. **Spawn Agents** - Use Task tool for concurrent fixes
2. **Track Progress** - Update AgentDB and memory
3. **Test Incrementally** - Verify after each milestone
4. **Document Patterns** - Create reusable solutions

### Phase 3: Validation & Memory

1. **Full Test Suite** - Run complete validation
2. **Train Neural Patterns** - Learn from successes
3. **Create Skills** - Document reusable patterns
4. **Update Memory** - Store for future recovery

## Key Patterns

### 1. Module Resolution

```typescript
// ❌ Wrong - doesn't work with Vite
const { module } = require('@/lib/module');

// ✅ Right - async import for ESM
const { module } = await import('@/lib/module');
```

### 2. Constructor Mocking

```typescript
// ❌ Wrong - fails with 'new'
vi.mock('./class', () => ({ Class: vi.fn(() => ({...})) }));

// ✅ Right - ES6 class
vi.mock('./class', () => ({
  Class: class Class {
    method = vi.fn();
  }
}));
```

### 3. Document Mocking

```typescript
// Save original before mocking
const originalCreateElement = document.createElement.bind(document);

// Mock after component render
vi.spyOn(document, 'createElement').mockImplementation(...);

// Restore in afterEach
vi.restoreAllMocks();
```

### 4. JSDOM Storage Events

```typescript
// ❌ Wrong - JSDOM validation fails
new StorageEvent('storage', { storageArea: mockStorage });

// ✅ Right - bypass validation
const event = new StorageEvent('storage');
Object.defineProperty(event, 'storageArea', { value: mockStorage });
```

### 5. Accessibility Testing

```typescript
// Setup once in test setup
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

// Use in tests
const results = await axe(container);
expect(results).toHaveNoViolations();
```

## Tools Required

1. **Claude Flow** - Swarm orchestration
2. **AgentDB** - Progress tracking
3. **GOAP Planning** - Milestone management
4. **Neural Training** - Pattern learning
5. **Memory Tools** - Context persistence

## Success Metrics

- **Pass Rate**: Target 99%+ (accept 7 failures)
- **Documentation**: 1 doc per major pattern
- **Reusability**: Patterns work for future fixes
- **Speed**: Parallel execution via swarm
- **Learning**: Neural patterns trained

## Example Session

```bash
# 1. Initialize swarm
npx claude-flow@alpha swarm init --topology hierarchical --max-agents 10

# 2. Analyze failures
npm run test -- --run 2>&1 | grep "FAIL"

# 3. Create GOAP plan
# Document milestones with dependencies

# 4. Execute with agents
Task("Fix module resolution", "...", "coder")
Task("Fix constructor mocks", "...", "coder")
Task("Fix accessibility", "...", "coder")

# 5. Train patterns
npx claude-flow@alpha neural train --pattern test-fixes --data {...}

# 6. Store in memory
npx claude-flow@alpha memory store swarm/completion {...}
```

## Output Artifacts

1. **Test Fixes** - Code changes fixing failures
2. **Documentation** - Pattern guides (5-10 docs)
3. **GOAP Plan** - Milestone execution plan
4. **Skills** - Reusable test patterns
5. **Memory** - Context for future sessions
6. **Neural Patterns** - Trained models

## Lessons Learned

### What Works

- Parallel agent execution
- Systematic GOAP planning
- Immediate documentation
- Incremental testing
- Pattern reuse

### What to Avoid

- Sequential fixes
- Inline mocks
- Skipping docs
- Ignoring timing
- One-off solutions

## Related Skills

- `goap-planning` - Milestone planning
- `swarm-coordination` - Agent orchestration
- `neural-training` - Pattern learning
- `testing-patterns` - Test best practices

---

_Used in: California Puzzle Game test recovery (174 tests fixed)_  
_Success Rate: 99.55% (1549/1557 tests passing)_  
_Created: 2025-12-04_
