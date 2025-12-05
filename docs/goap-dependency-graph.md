# GOAP DEPENDENCY GRAPH

## Action Dependencies and Parallel Execution

**Visual representation of all 50 actions and their dependencies**

---

## LEGEND

```
→ : Sequential dependency (must complete before)
═ : Parallel execution possible
├─: Branches (parallel streams)
└─: End of branch
[P1]: Priority level
{2h}: Estimated time
```

---

## COMPLETE DEPENDENCY GRAPH

```
START
  │
  ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: TEST STABILIZATION                                │
│ Critical Path: 2 hours                                      │
└─────────────────────────────────────────────────────────────┘
  │
  ├─ [P0] Action 1: fix_export_data_test {1.5h} ──────────┐
  │                                                        │
  ▼                                                        │
  └─ [P0] Action 2: commit_test_fixes {0.5h} ─────────────┤
                                                           │
┌──────────────────────────────────────────────────────────┤
│ PHASE 2: DOMAIN STORE CREATION                          │
│ Critical Path: 9 hours (3 parallel streams)             │
└──────────────────────────────────────────────────────────┘
  │
  ├─ STREAM A: Session & Coordination ─────────────────────┐
  │  │                                                      │
  │  ├─ [P1] Action 3: create_session_store {3h} ─────────┤
  │  │                                                      │
  │  └─ [P1] Action 10: add_coordinator_session {0.5h} ───┤
  │                                                         │
  ├─ STREAM B: County & Spaced Repetition ─────────────────┤
  │  │                                                      │
  │  ├─ [P1] Action 4: create_county_progress_store {3h} ─┤
  │  │                                                      │
  │  ├─ [P1] Action 5: create_spaced_repetition_store {4h}┤
  │  │                                                      │
  │  ├─ [P1] Action 11: add_coordinator_county {0.5h} ────┤
  │  │                                                      │
  │  └─ [P1] Action 12: add_coordinator_spaced_rep {0.5h} ┤
  │                                                         │
  └─ STREAM C: Progress, Goals, Stats, Settings ───────────┤
     │                                                      │
     ├─ [P1] Action 6: create_progress_store {2.5h} ──────┤
     │                                                      │
     ├─ [P1] Action 7: create_goals_store {3h} ───────────┤
     │                                                      │
     ├─ [P1] Action 8: create_statistics_store {3h} ──────┤
     │                                                      │
     ├─ [P1] Action 9: create_settings_store {2h} ────────┤
     │                                                      │
     ├─ [P1] Action 13: add_coordinator_progress {0.5h} ──┤
     │                                                      │
     ├─ [P1] Action 14: add_coordinator_goals {0.5h} ─────┤
     │                                                      │
     ├─ [P1] Action 15: add_coordinator_stats {0.5h} ─────┤
     │                                                      │
     └─ [P1] Action 16: add_coordinator_settings {0.5h} ──┤
                                                           │
┌──────────────────────────────────────────────────────────┤
│ PHASE 3: STUDY STORE REFACTORING                        │
│ Critical Path: 11 hours (3 parallel streams)            │
└──────────────────────────────────────────────────────────┘
  │
  ├─ STREAM A: Facade & Migration ─────────────────────────┐
  │  │                                                      │
  │  ├─ [P0] Action 17: create_study_store_facade {5h} ───┤
  │  │                                                      │
  │  ├─ [P1] Action 18: migrate_session_methods {2.5h} ───┤
  │  │                                                      │
  │  ├─ [P1] Action 19: migrate_county_methods {2.5h} ────┤
  │  │                                                      │
  │  ├─ [P1] Action 20: migrate_spaced_rep_methods {2.5h} ┤
  │  │                                                      │
  │  ├─ [P1] Action 21: migrate_progress_methods {2h} ────┤
  │  │                                                      │
  │  ├─ [P1] Action 22: migrate_goals_methods {2h} ───────┤
  │  │                                                      │
  │  ├─ [P1] Action 23: migrate_stats_methods {2h} ───────┤
  │  │                                                      │
  │  ├─ [P1] Action 24: migrate_settings_methods {2h} ────┤
  │  │                                                      │
  │  └─ [P1] Action 26: delete_old_study_store {1h} ──────┤
  │                                                         │
  ├─ STREAM B: Animation Extraction ────────────────────────┤
  │  │                                                      │
  │  ├─ [P2] Action 27: extract_animation_hooks {4.5h} ───┤
  │  │                                                      │
  │  └─ [P2] Action 28: extract_animation_components {4h} ┤
  │                                                         │
  └─ STREAM C: GameContainer Refactor ──────────────────────┤
     │                                                      │
     └─ [P2] Action 29: refactor_game_container {4.5h} ───┤
                                                           │
┌──────────────────────────────────────────────────────────┤
│ PHASE 4: COMPONENT MIGRATION                            │
│ Critical Path: 14 hours (5 parallel streams)            │
└──────────────────────────────────────────────────────────┘
  │
  ├─ STREAM A: Remove getState Calls ──────────────────────┐
  │  │                                                      │
  │  ├─ [P2] Action 30: remove_getstate_batch_1 {3h} ─────┤
  │  │                                                      │
  │  ├─ [P2] Action 31: remove_getstate_batch_2 {3h} ─────┤
  │  │                                                      │
  │  ├─ [P2] Action 32: remove_getstate_batch_3 {3h} ─────┤
  │  │                                                      │
  │  └─ [P2] Action 33: remove_getstate_batch_4 {3h} ─────┤
  │                                                         │
  ├─ STREAM B: Tier 1 Components ──────────────────────────┤
  │  │                                                      │
  │  └─ [P2] Action 34: migrate_tier1_batch_1 {5h} ───────┤
  │                                                         │
  ├─ STREAM C: Tier 2 Components ──────────────────────────┤
  │  │                                                      │
  │  ├─ [P3] Action 41: migrate_tier2_batch_1 {4.5h} ─────┤
  │  │                                                      │
  │  ├─ [P3] Action 42: migrate_tier2_batch_2 {4.5h} ─────┤
  │  │                                                      │
  │  └─ [P3] Action 43: migrate_tier2_batch_3 {4.5h} ─────┤
  │                                                         │
  ├─ STREAM D: Tier 3 Components ──────────────────────────┤
  │  │                                                      │
  │  ├─ [P3] Action 45: migrate_tier3_utility {6.5h} ─────┤
  │  │                                                      │
  │  └─ [P3] Action 46: migrate_remaining_edge {4h} ──────┤
  │                                                         │
  └─ STREAM E: Integration Tests ──────────────────────────┤
     │                                                      │
     ├─ [P3] Action 47: add_store_integration_tests {5h} ─┤
     │                                                      │
     └─ [P3] Action 48: add_component_integration {4.5h} ─┤
                                                           │
┌──────────────────────────────────────────────────────────┤
│ FINALIZATION                                             │
│ Critical Path: 7 hours (sequential)                     │
└──────────────────────────────────────────────────────────┘
  │
  ├─ [P0] Action 49: final_cleanup_validation {6h} ────────┤
  │                                                         │
  └─ [P4] Action 50: create_rollback_safety {1h} ──────────┤
                                                            │
                                                            ▼
                                                          END
```

---

## CRITICAL PATH ANALYSIS

### Longest Sequential Chain (32.5 hours)

```
Action 1 (1.5h)
  → Action 2 (0.5h)
    → Action 3 (3h)
      → Action 17 (5h)
        → Action 18 (2.5h)
          → Action 30 (3h)
            → Action 34 (5h)
              → Action 47 (5h)
                → Action 49 (6h)
                  → Action 50 (1h)
```

### With Parallelization (43 hours total)

- Phase 1: 2h (sequential)
- Phase 2: 9h (3 parallel streams, longest is Stream C)
- Phase 3: 11h (3 parallel streams, longest is Stream A)
- Phase 4: 14h (5 parallel streams, longest is Stream A)
- Finalization: 7h (sequential)

---

## DEPENDENCY MATRIX

| Action | Depends On | Enables | Parallel With           |
| ------ | ---------- | ------- | ----------------------- |
| 1      | -          | 2       | -                       |
| 2      | 1          | 3-9     | -                       |
| 3      | 2          | 10, 17  | 4-9                     |
| 4      | 2          | 11, 17  | 3, 5-9                  |
| 5      | 2          | 12, 17  | 3-4, 6-9                |
| 6      | 2          | 13, 17  | 3-5, 7-9                |
| 7      | 2          | 14, 17  | 3-6, 8-9                |
| 8      | 2          | 15, 17  | 3-7, 9                  |
| 9      | 2          | 16, 17  | 3-8                     |
| 10     | 3          | 17      | 11-16                   |
| 11     | 4          | 17      | 10, 12-16               |
| 12     | 5          | 17      | 10-11, 13-16            |
| 13     | 6          | 17      | 10-12, 14-16            |
| 14     | 7          | 17      | 10-13, 15-16            |
| 15     | 8          | 17      | 10-14, 16               |
| 16     | 9          | 17      | 10-15                   |
| 17     | 3-16       | 18-29   | -                       |
| 18     | 17         | 26, 30  | 19-25, 27-29            |
| 19     | 17         | 26, 30  | 18, 20-25, 27-29        |
| 20     | 17         | 26, 30  | 18-19, 21-25, 27-29     |
| 21     | 17         | 26, 30  | 18-20, 22-25, 27-29     |
| 22     | 17         | 26, 30  | 18-21, 23-25, 27-29     |
| 23     | 17         | 26, 30  | 18-22, 24-25, 27-29     |
| 24     | 17         | 26, 30  | 18-23, 25, 27-29        |
| 25     | 17         | 26, 30  | 18-24, 27-29            |
| 26     | 18-25      | 30      | 27-29                   |
| 27     | 17         | 30      | 18-26, 28-29            |
| 28     | 27         | 30      | 18-26, 29               |
| 29     | 17         | 30      | 18-28                   |
| 30     | 17-29      | 34      | 31-33, 41-48            |
| 31     | 17-29      | 34      | 30, 32-33, 41-48        |
| 32     | 17-29      | 34      | 30-31, 33, 41-48        |
| 33     | 17-29      | 34      | 30-32, 41-48            |
| 34     | 30-33      | 47      | 41-46                   |
| 41     | 17-29      | -       | 30-34, 42-48            |
| 42     | 17-29      | -       | 30-34, 41, 43-48        |
| 43     | 17-29      | -       | 30-34, 41-42, 44-48     |
| 45     | 17-29      | -       | 30-34, 41-43, 46-48     |
| 46     | 17-29      | -       | 30-34, 41-43, 45, 47-48 |
| 47     | 34         | 49      | 30-33, 41-46, 48        |
| 48     | 34         | 49      | 30-33, 41-47            |
| 49     | 30-48      | 50      | -                       |
| 50     | 49         | -       | -                       |

---

## PARALLEL EXECUTION GANTT CHART

```
Hour  0  2  4  6  8  10 12 14 16 18 20 22 24 26 28 30 32 34 36 38 40 42
      │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │
┌─────┼──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┐
│ P1  │█████                                                             │ Actions 1-2
├─────┼──────────────────────────────────────────────────────────────────┤
│ P2  │     ████████████████████                                         │ Stream A
│     │     ████████████████████████                                     │ Stream B
│     │     ████████████████████████████████                             │ Stream C
├─────┼──────────────────────────────────────────────────────────────────┤
│ P3  │                             █████████████████████████            │ Stream A
│     │                             ████████████████████                 │ Stream B
│     │                             ████████████████                     │ Stream C
├─────┼──────────────────────────────────────────────────────────────────┤
│ P4  │                                                  ██████████████  │ Stream A
│     │                                                  ███████          │ Stream B
│     │                                                  ██████████████  │ Stream C
│     │                                                  █████████████   │ Stream D
│     │                                                  ████████████    │ Stream E
├─────┼──────────────────────────────────────────────────────────────────┤
│ FIN │                                                                ███│ Actions 49-50
└─────┴──────────────────────────────────────────────────────────────────┘
```

---

## RESOURCE ALLOCATION TIMELINE

```
Day 1 (8h): 3 Agents
├─ Agent 1: Action 1, 2, 3, 10 (Phase 1 + Stream A)
├─ Agent 2: Action 4, 5, 11, 12 (Stream B)
└─ Agent 3: Action 6, 7 (Stream C start)

Day 2 (8h): 3 Agents
├─ Agent 1: Action 17 start (Facade)
├─ Agent 2: Stream C continue (Actions 8, 9)
└─ Agent 3: Stream C coordinators (Actions 13-16)

Day 3 (8h): 3 Agents
├─ Agent 1: Action 17 complete, 18-20 (Facade + migrations)
├─ Agent 2: Action 27 (Animation hooks)
└─ Agent 3: Actions 21-23 (More migrations)

Day 4 (8h): 3 Agents
├─ Agent 1: Actions 24-26 (Final migrations + delete)
├─ Agent 2: Action 28 (Animation components)
└─ Agent 3: Action 29 (GameContainer)

Day 5 (8h): 5 Agents
├─ Agent 1: Actions 30-33 (getState removal)
├─ Agent 2: Action 34 (Tier 1 components)
├─ Agent 3: Actions 41-43 (Tier 2 components)
├─ Agent 4: Actions 45-46 (Tier 3 components)
└─ Agent 5: Actions 47-48 start (Integration tests)

Day 6 (7h): 2 Agents
├─ Agent 1 (Reviewer): Action 49 (Final cleanup)
└─ Agent 2 (Coder): Action 50 (Rollback safety)
```

---

## BLOCKING RELATIONSHIPS

### Phase 2 Blocks Phase 3

- **Reason**: Facade (Action 17) needs all 7 stores
- **Blocker**: Actions 3-9 must complete
- **Coordination**: Actions 10-16 must complete
- **Mitigation**: Parallelize all Phase 2 actions

### Phase 3 Blocks Phase 4

- **Reason**: Components need facade to migrate
- **Blocker**: Action 17 must complete
- **Migration**: Actions 18-26 can be incomplete
- **Mitigation**: Start Phase 4 when facade is ready

### Tier 1 Blocks Integration Tests

- **Reason**: Integration tests need core components migrated
- **Blocker**: Action 34 must complete
- **Coverage**: Tier 2 & 3 can be in progress
- **Mitigation**: Write tests during Tier 2 migration

---

## OPTIMIZATION OPPORTUNITIES

### Parallel Bottlenecks

1. **Phase 2 Stream C**: Longest at 9 hours
   - **Optimization**: Split into 2 sub-streams
   - **Impact**: Reduce to 6 hours
   - **New total**: 40 hours

2. **Phase 3 Stream A**: Longest at 10 hours
   - **Optimization**: Parallelize migrations more
   - **Impact**: Reduce to 7 hours
   - **New total**: 37 hours

3. **Phase 4 Stream A**: Longest at 12 hours
   - **Optimization**: More aggressive batching
   - **Impact**: Reduce to 9 hours
   - **New total**: 34 hours

### Aggressive Parallelization Target: 34 hours (5 days)

---

## INTER-PHASE DEPENDENCIES

```
Phase 1 ──────────────────────┐
                              ▼
Phase 2 ──────────────────────┐
  │                           ▼
  ├─ Stores ─────────┐        Phase 3
  │                  ▼          │
  └─ Coordinators ───┤          ├─ Facade ─────────┐
                     │          │                  ▼
                     └──────────┤                  Phase 4
                                ├─ Migrations ─────┐
                                │                  ▼
                                └─ Refactoring ────┤
                                                   │
                                                   ├─ getState ─────┐
                                                   │                ▼
                                                   ├─ Components ───┤
                                                   │                │
                                                   └─ Tests ────────┤
                                                                    │
                                                                    ▼
                                                                Finalization
```

---

## DEPENDENCY VALIDATION CHECKLIST

### Before Phase 2

- [ ] All tests passing (Action 1)
- [ ] Clean git state (Action 2)

### Before Phase 3

- [ ] All 7 stores created (Actions 3-9)
- [ ] All 23 coordinator subscriptions added (Actions 10-16)
- [ ] Store tests passing (100 new tests)

### Before Phase 4

- [ ] Facade created and tested (Action 17)
- [ ] Study store methods migrated (Actions 18-25)
- [ ] Code extractions complete (Actions 27-29)

### Before Finalization

- [ ] All getState calls removed (Actions 30-33)
- [ ] All 81 components migrated (Actions 34-46)
- [ ] Integration tests added (Actions 47-48)

---

_Generated by SPARC-GOAP Planner_
_Use for understanding action dependencies and parallel execution_
