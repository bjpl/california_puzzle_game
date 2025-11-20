# SPARC Specification: Content Standardization

**Priority:** MEDIUM (7/10 ROI)
**Effort:** 4 hours
**Target:** 100% content consistency across application

---

## 1. SPECIFICATION PHASE

### 1.1 Requirements

#### Primary Requirements

1. **Create Content Constants File** (DRY Principle)
   - Centralize all user-facing strings
   - Prevent hardcoded text duplication
   - Enable easy content updates and i18n preparation
   - Type-safe content access with TypeScript

2. **Standardize Button Labels** (UX Consistency)
   - Use action-oriented verbs ("Place County" not "Submit")
   - Consistent terminology (always "County" not "Region")
   - Appropriate tone for educational context
   - Clear, concise labels (max 3-4 words)

3. **Fix Terminology Inconsistencies** (Brand Coherence)
   - Standardize feature names across UI
   - Consistent capitalization (Title Case for features)
   - Remove ambiguous terms
   - Create glossary for future development

4. **Shorten Mobile Instructions** (Mobile UX)
   - Reduce instruction text by 30-40%
   - Use progressive disclosure for details
   - Bullet points instead of paragraphs
   - Mobile-first writing (scannable, concise)

5. **Improve Error Message Tone** (User Experience)
   - Friendly, encouraging tone (not blaming)
   - Actionable guidance ("Try..." not "Error:")
   - Consistent error format across application
   - Appropriate severity levels

#### Non-Functional Requirements

- **Maintainability:** Single source of truth for all content
- **Type Safety:** TypeScript types for content keys
- **i18n Ready:** Structure supports future localization
- **Performance:** No runtime overhead (constants only)
- **Testability:** Content can be easily tested and validated

### 1.2 Success Criteria

#### Acceptance Tests

1. **Content Constants Coverage**
   ```
   GIVEN: Application codebase
   WHEN: Search for hardcoded user-facing strings
   THEN: 95%+ of strings are imported from constants
   AND: Remaining 5% are dynamic/generated content
   ```

2. **Button Label Consistency**
   ```
   GIVEN: All buttons in application
   WHEN: Review button labels
   THEN: All labels use action verbs
   AND: No duplicate labels for different actions
   AND: No ambiguous labels
   ```

3. **Mobile Instruction Length**
   ```
   GIVEN: Mobile instructions modal
   WHEN: Measured character count
   THEN: Instructions < 500 characters (down from 800+)
   AND: Key points highlighted with bullets
   ```

4. **Error Message Quality**
   ```
   GIVEN: Any error scenario
   WHEN: Error message is displayed
   THEN: Message is encouraging and actionable
   AND: No technical jargon or blame language
   ```

#### Validation Criteria

- **Consistency Audit:** 100% pass rate on terminology checklist
- **Content Review:** Stakeholder approval of all user-facing text
- **User Testing:** 90%+ users understand instructions
- **Accessibility:** All content passes plain language guidelines (8th grade reading level)

### 1.3 Edge Cases

1. **Dynamic Content**
   - County names remain dynamic (from data)
   - Score/statistics remain calculated
   - Timestamps remain dynamic

2. **Error Messages with Variables**
   - Template strings support dynamic values
   - Example: "You placed {countyName} incorrectly. Try again!"

3. **Pluralization**
   - Content constants support singular/plural forms
   - Example: "1 county remaining" vs "3 counties remaining"

4. **Abbreviations on Small Screens**
   - Some labels abbreviate on mobile
   - Full labels in tooltips/aria-labels

---

## 2. PSEUDOCODE PHASE

### 2.1 Content Constants Structure

```typescript
// constants/content.ts

// Organized by feature/component
export const CONTENT = {
  // Common UI elements
  COMMON: {
    BUTTONS: {
      CLOSE: 'Close',
      CANCEL: 'Cancel',
      CONFIRM: 'Confirm',
      SAVE: 'Save',
      BACK: 'Back',
      NEXT: 'Next',
      CONTINUE: 'Continue',
    },
    LABELS: {
      LOADING: 'Loading...',
      SAVING: 'Saving...',
      SUCCESS: 'Success!',
      ERROR: 'Error',
    }
  },

  // Game-specific content
  GAME: {
    TITLE: 'California Counties Puzzle',
    SUBTITLE: 'Learn geography through interactive play',

    BUTTONS: {
      START: 'Start Game',
      RESTART: 'Restart',
      QUIT: 'Quit Game',
      PLACE_COUNTY: 'Place County',
      HINT: 'Get Hint',
      SKIP: 'Skip County',
    },

    INSTRUCTIONS: {
      TITLE: 'How to Play',
      STEPS: [
        'Drag counties to their correct locations',
        'Use hints if you need help',
        'Complete all 58 counties to win!',
      ],
      MOBILE_STEPS: [
        'Tap a county, then tap its location',
        'Use hints for help',
        'Complete all 58 counties!',
      ],
    },

    MESSAGES: {
      CORRECT_PLACEMENT: 'Excellent! County placed correctly.',
      INCORRECT_PLACEMENT: 'Not quite right. Give it another try!',
      HINT_USED: 'Hint revealed! The county is highlighted.',
      GAME_COMPLETE: 'Congratulations! You completed the puzzle!',
      NO_HINTS_LEFT: 'No hints remaining. You can do it!',
    },

    ERRORS: {
      LOAD_FAILED: 'Unable to load game data. Please refresh the page.',
      SAVE_FAILED: 'Could not save your progress. Please try again.',
      NETWORK_ERROR: 'Connection lost. Check your internet and try again.',
    }
  },

  // Educational content
  EDUCATION: {
    MODAL_TITLE: 'About {countyName} County',
    LEARN_MORE: 'Learn More',
    FUN_FACTS: 'Fun Facts',
    DEMOGRAPHICS: 'Demographics',
    GEOGRAPHY: 'Geography',
  },

  // Accessibility
  ARIA: {
    CLOSE_DIALOG: 'Close dialog',
    OPEN_MENU: 'Open menu',
    COUNTY_DETAILS: 'View details for {countyName} County',
    SKIP_TO_MAIN: 'Skip to main content',
    GAME_STATUS: '{correct} of {total} counties placed correctly',
  }
} as const;

// Type-safe accessor
export type ContentKey = typeof CONTENT;
```

### 2.2 Content Migration Algorithm

```typescript
// Script: migrate-content.ts
import { Project, SyntaxKind } from 'ts-morph';

function migrateHardcodedStrings() {
  const project = new Project();
  const sourceFiles = project.addSourceFilesAtPaths('src/**/*.{ts,tsx}');

  const stringLiterals: Map<string, string[]> = new Map();

  // 1. Find all hardcoded strings in JSX
  sourceFiles.forEach(sourceFile => {
    const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement);

    jsxElements.forEach(element => {
      const text = element.getText();

      // Match button labels, headings, paragraphs
      if (isUserFacingText(text)) {
        const location = `${sourceFile.getFilePath()}:${element.getStartLineNumber()}`;
        stringLiterals.set(text, [...(stringLiterals.get(text) || []), location]);
      }
    });
  });

  // 2. Generate constants from duplicates
  const duplicates = Array.from(stringLiterals.entries())
    .filter(([_, locations]) => locations.length > 1);

  // 3. Suggest replacements
  duplicates.forEach(([text, locations]) => {
    const constantName = generateConstantName(text);
    console.log(`Found duplicate: "${text}"`);
    console.log(`Suggested constant: CONTENT.${constantName}`);
    console.log(`Locations: ${locations.join(', ')}`);
  });
}

function isUserFacingText(text: string): boolean {
  // Heuristics:
  // - Inside <button>, <h1-h6>, <p>, <span> with text content
  // - Not code or data (e.g., classNames, IDs)
  // - Length > 2 characters
  // - Contains alphabetic characters
  return /[a-zA-Z]{2,}/.test(text) && !text.includes('className') && !text.includes('data-');
}
```

### 2.3 Error Message Transformation

```typescript
// Before: Technical, blaming tone
"Error: County placement failed. Invalid coordinates."

// After: Friendly, actionable tone
"Oops! That spot didn't work. Try placing the county a bit higher."

// Error message generator
function createErrorMessage(
  type: 'placement' | 'network' | 'save',
  context?: string
): string {
  const templates = {
    placement: "Not quite right. Give it another try!",
    network: "Connection lost. Check your internet and try again.",
    save: "Could not save your progress. Please try again.",
  };

  return templates[type];
}
```

### 2.4 Mobile Instruction Optimization

```typescript
// Before: Desktop-focused, verbose (820 characters)
const DESKTOP_INSTRUCTIONS = `
Welcome to the California Counties Puzzle!

In this educational game, you'll learn about California's 58 counties by
placing them on a map. Here's how to play:

1. On the left side, you'll see a list of counties that need to be placed.
2. Click on a county to select it, then click on the map where you think
   it belongs.
3. If you're correct, the county will snap into place! If not, you'll get
   feedback and can try again.
4. Use the hint button if you're stuck - it will highlight the correct
   region for the selected county.
5. Try to complete the puzzle with as few hints as possible to maximize
   your score!

Have fun learning about California's diverse counties!
`;

// After: Mobile-first, scannable (380 characters)
const MOBILE_INSTRUCTIONS = {
  title: 'How to Play',
  steps: [
    '📍 Tap a county, then tap its location on the map',
    '💡 Use hints if you need help',
    '🎯 Complete all 58 counties to win!',
    '⭐ Fewer hints = higher score'
  ],
  expandable: {
    label: 'Learn More',
    content: 'Discover California geography by placing counties...'
  }
};

// Adaptive rendering
function Instructions() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return isMobile ? (
    <MobileInstructions {...MOBILE_INSTRUCTIONS} />
  ) : (
    <DesktopInstructions {...DESKTOP_INSTRUCTIONS} />
  );
}
```

---

## 3. ARCHITECTURE PHASE

### 3.1 File Structure

```
/src
├── constants/
│   ├── content.ts              [NEW - All user-facing text]
│   ├── glossary.ts             [NEW - Terminology definitions]
│   └── errorMessages.ts        [NEW - Error message templates]
├── components/
│   ├── game/
│   │   ├── MobileGameInstructions.tsx  [MODIFY]
│   │   └── GameMessages.tsx            [MODIFY]
│   ├── shared/
│   │   └── ErrorBoundary.tsx           [MODIFY]
│   └── ui/
│       └── Button.tsx                  [MODIFY]
├── hooks/
│   └── useContent.ts           [NEW - Content accessor hook]
├── utils/
│   └── formatContent.ts        [NEW - String formatting utilities]
└── scripts/
    └── validate-content.ts     [NEW - Content validation]
```

### 3.2 Content Constants Organization

```typescript
// constants/content.ts (Detailed structure)

export const CONTENT = {
  // 1. Common/shared content (buttons, labels, states)
  COMMON: {
    ACTIONS: {
      CLOSE: 'Close',
      CANCEL: 'Cancel',
      SAVE: 'Save',
      DELETE: 'Delete',
      EDIT: 'Edit',
    },
    STATES: {
      LOADING: 'Loading...',
      SAVING: 'Saving...',
      SUCCESS: 'Success!',
      ERROR: 'Error',
    }
  },

  // 2. Game-specific content
  GAME: {
    TITLE: 'California Counties Puzzle',
    ACTIONS: {
      START: 'Start Game',
      RESTART: 'Restart',
      PLACE_COUNTY: 'Place County',
      HINT: 'Get Hint',
    },
    MESSAGES: { /* ... */ },
    INSTRUCTIONS: { /* ... */ },
  },

  // 3. Educational content
  EDUCATION: {
    COUNTY_DETAILS: {
      TITLE: 'About {countyName} County',
      TABS: {
        OVERVIEW: 'Overview',
        FACTS: 'Fun Facts',
        DEMOGRAPHICS: 'Demographics',
        GEOGRAPHY: 'Geography',
      }
    }
  },

  // 4. Error messages (organized by severity)
  ERRORS: {
    CRITICAL: {
      LOAD_FAILED: 'Unable to load game. Please refresh the page.',
      DATA_CORRUPT: 'Game data is corrupted. Please clear cache and reload.',
    },
    RECOVERABLE: {
      SAVE_FAILED: 'Could not save progress. Try again in a moment.',
      NETWORK: 'Connection lost. Check your internet and retry.',
    },
    INFO: {
      NO_HINTS: 'No hints remaining. You can do it!',
      ALREADY_PLACED: 'This county is already placed correctly.',
    }
  },

  // 5. Accessibility (ARIA labels, screen reader text)
  ARIA: {
    CLOSE_DIALOG: 'Close dialog',
    OPEN_MENU: 'Open menu',
    GAME_STATUS: '{correct} of {total} counties placed',
  }
} as const;

// Typed helper for template strings
export function formatContent(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] || '');
}
```

### 3.3 Content Access Patterns

```typescript
// Hook: useContent (with i18n support)
import { CONTENT } from '@/constants/content';

export function useContent() {
  // Future: Add locale support
  // const locale = useLocale();

  return {
    get: (path: string) => {
      // Access nested content by dot notation
      // Example: get('GAME.ACTIONS.START') => 'Start Game'
      return getNestedValue(CONTENT, path);
    },
    format: (template: string, vars: Record<string, string>) => {
      return formatContent(template, vars);
    }
  };
}

// Usage in components
function GameButton() {
  const content = useContent();

  return (
    <Button>
      {content.get('GAME.ACTIONS.START')}
    </Button>
  );
}

// Or direct import (preferred for static content)
import { CONTENT } from '@/constants/content';

function GameButton() {
  return <Button>{CONTENT.GAME.ACTIONS.START}</Button>;
}
```

### 3.4 Migration Strategy

#### Phase 1: Audit & Catalog (1 hour)
1. Run automated script to find hardcoded strings
2. Categorize strings by component/feature
3. Identify duplicates and inconsistencies
4. Create comprehensive content inventory

#### Phase 2: Create Constants (1 hour)
1. Create `/src/constants/content.ts`
2. Organize content by feature hierarchy
3. Add TypeScript types for type safety
4. Document structure and usage

#### Phase 3: Component Migration (1.5 hours)
1. Start with high-impact components (buttons, modals)
2. Replace hardcoded strings with constant references
3. Test each component after migration
4. Ensure no regressions

#### Phase 4: Validation & QA (30 minutes)
1. Run content validation script
2. Visual QA of all components
3. Accessibility audit (screen reader testing)
4. User testing for clarity

### 3.5 Testing Strategy

#### Content Validation Tests

```typescript
// tests/content/validation.test.ts
import { CONTENT } from '@/constants/content';

describe('Content Constants', () => {
  test('no duplicate values', () => {
    const values = getAllValues(CONTENT);
    const duplicates = findDuplicates(values);
    expect(duplicates).toHaveLength(0);
  });

  test('all button labels use action verbs', () => {
    const buttonLabels = getAllButtonLabels(CONTENT);
    buttonLabels.forEach(label => {
      expect(startsWithActionVerb(label)).toBe(true);
    });
  });

  test('error messages are actionable', () => {
    const errors = getAllErrors(CONTENT);
    errors.forEach(error => {
      expect(isActionable(error)).toBe(true);
      expect(isEncouraging(error)).toBe(true);
    });
  });

  test('mobile instructions under 500 characters', () => {
    const mobileInstructions = CONTENT.GAME.INSTRUCTIONS.MOBILE_STEPS.join(' ');
    expect(mobileInstructions.length).toBeLessThan(500);
  });
});
```

#### Integration Tests

```typescript
// tests/e2e/content-consistency.spec.ts
test('all buttons use standardized labels', async ({ page }) => {
  await page.goto('/');

  const buttons = await page.locator('button').allTextContents();
  const allowedLabels = Object.values(CONTENT.COMMON.ACTIONS);

  buttons.forEach(text => {
    expect(allowedLabels).toContain(text);
  });
});
```

---

## 4. REFINEMENT PLAN (TDD APPROACH)

### 4.1 Implementation Steps

#### Step 1: Audit Hardcoded Strings (30 minutes)

```bash
# Find all hardcoded user-facing strings
grep -rn ">\s*[A-Z]" src/components --include="*.tsx" | \
  grep -v "className" | \
  grep -v "data-" > hardcoded-strings.txt

# Analyze results
# Expected: ~150-200 instances across 30-40 files
```

**Categorization:**
```
Buttons: 45 instances
Headings: 30 instances
Instructions: 15 instances
Error messages: 20 instances
Labels: 40 instances
Other: 50 instances
```

#### Step 2: Create Content Constants (1 hour)

**TDD Approach:**
```typescript
// RED: Write test first
test('CONTENT.GAME.ACTIONS.START is defined', () => {
  expect(CONTENT.GAME.ACTIONS.START).toBe('Start Game');
});

// GREEN: Implement constant
export const CONTENT = {
  GAME: {
    ACTIONS: {
      START: 'Start Game',
    }
  }
} as const;

// REFACTOR: Organize structure, add types
```

**Content Constants File:**
```typescript
// constants/content.ts
export const CONTENT = {
  COMMON: {
    ACTIONS: {
      CLOSE: 'Close',
      CANCEL: 'Cancel',
      CONFIRM: 'Confirm',
      SAVE: 'Save',
      BACK: 'Back',
      NEXT: 'Next',
    }
  },

  GAME: {
    TITLE: 'California Counties Puzzle',

    ACTIONS: {
      START_GAME: 'Start Game',
      RESTART: 'Restart',
      QUIT: 'Quit Game',
      PLACE_COUNTY: 'Place County',
      GET_HINT: 'Get Hint',
      SKIP_COUNTY: 'Skip County',
      VIEW_DETAILS: 'View Details',
    },

    INSTRUCTIONS: {
      TITLE: 'How to Play',
      DESKTOP: {
        INTRO: 'Learn California geography by placing all 58 counties on the map.',
        STEPS: [
          'Select a county from the list on the left',
          'Click on the map where you think it belongs',
          'Get instant feedback on your placement',
          'Use hints sparingly for a higher score',
        ],
      },
      MOBILE: {
        STEPS: [
          '📍 Tap a county, then tap its location',
          '💡 Use hints for help',
          '🎯 Complete all 58 counties!',
        ],
      }
    },

    MESSAGES: {
      PLACEMENT: {
        CORRECT: 'Excellent! County placed correctly.',
        INCORRECT: 'Not quite right. Give it another try!',
        CLOSE: 'So close! Adjust slightly.',
      },
      HINTS: {
        USED: 'Hint revealed! Look for the highlighted area.',
        NO_MORE: 'No hints remaining. You can do it!',
        AVAILABLE: '{count} hints remaining',
      },
      GAME_STATE: {
        COMPLETE: 'Congratulations! You completed the puzzle!',
        PROGRESS: '{correct} of {total} counties placed',
      }
    },

    ERRORS: {
      LOAD_GAME: 'Unable to load game. Please refresh the page.',
      SAVE_PROGRESS: 'Could not save your progress. Please try again.',
      NETWORK: 'Connection lost. Check your internet and retry.',
      COUNTY_DATA: 'County information unavailable. Try again later.',
    }
  },

  EDUCATION: {
    MODAL: {
      TITLE: 'About {countyName} County',
      TABS: {
        OVERVIEW: 'Overview',
        FACTS: 'Fun Facts',
        DEMOGRAPHICS: 'Demographics',
        GEOGRAPHY: 'Geography',
      },
      ACTIONS: {
        LEARN_MORE: 'Learn More',
        CLOSE: 'Close',
      }
    }
  },

  ARIA: {
    BUTTONS: {
      CLOSE_DIALOG: 'Close dialog',
      OPEN_MENU: 'Open menu',
      TOGGLE_SOUND: 'Toggle sound',
      VIEW_COUNTY: 'View details for {countyName} County',
    },
    STATUS: {
      GAME_PROGRESS: '{correct} of {total} counties placed correctly',
      LOADING: 'Loading game data',
      SAVING: 'Saving progress',
    },
    NAVIGATION: {
      SKIP_TO_MAIN: 'Skip to main content',
      SKIP_TO_MAP: 'Skip to map',
    }
  }
} as const;

// Helper for template strings
export function formatContent(template: string, vars: Record<string, any>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}

// Type-safe getter
export type ContentPath =
  | 'GAME.ACTIONS.START_GAME'
  | 'GAME.MESSAGES.PLACEMENT.CORRECT'
  | /* ... all other paths */;
```

#### Step 3: Migrate Components (1.5 hours)

**Priority Order:**
1. **High-traffic components** (GameHeader, CaliforniaGameContainer)
2. **Buttons** (all button components)
3. **Modals** (CountyDetailsModal, EducationalContentModal)
4. **Instructions** (MobileGameInstructions)
5. **Error messages** (ErrorBoundary, error states)

**Migration Example:**
```typescript
// Before: GameHeader.tsx
<button onClick={handleStart}>
  Start Game
</button>

<button onClick={handleRestart}>
  Restart
</button>

// After: GameHeader.tsx
import { CONTENT } from '@/constants/content';

<button onClick={handleStart}>
  {CONTENT.GAME.ACTIONS.START_GAME}
</button>

<button onClick={handleRestart}>
  {CONTENT.GAME.ACTIONS.RESTART}
</button>
```

**Template String Example:**
```typescript
// Before: CaliforniaGameContainer.tsx
setMessage(`You've placed ${correctCount} of ${totalCount} counties`);

// After: CaliforniaGameContainer.tsx
import { CONTENT, formatContent } from '@/constants/content';

setMessage(formatContent(
  CONTENT.GAME.MESSAGES.GAME_STATE.PROGRESS,
  { correct: correctCount, total: totalCount }
));
```

#### Step 4: Shorten Mobile Instructions (30 minutes)

```typescript
// components/game/MobileGameInstructions.tsx - Before
const INSTRUCTIONS = `
Welcome to the California Counties Puzzle! In this game, you'll place
all 58 counties on the map...
[~800 characters of text]
`;

// After
import { CONTENT } from '@/constants/content';

function MobileGameInstructions() {
  return (
    <div className="space-y-4">
      <h2>{CONTENT.GAME.INSTRUCTIONS.TITLE}</h2>
      <ul className="space-y-2">
        {CONTENT.GAME.INSTRUCTIONS.MOBILE.STEPS.map((step, i) => (
          <li key={i} className="flex items-start gap-2">
            {step}
          </li>
        ))}
      </ul>
      <details>
        <summary>{CONTENT.EDUCATION.MODAL.ACTIONS.LEARN_MORE}</summary>
        <p className="mt-2 text-sm text-gray-600">
          {CONTENT.GAME.INSTRUCTIONS.DESKTOP.INTRO}
        </p>
      </details>
    </div>
  );
}
```

#### Step 5: Improve Error Messages (30 minutes)

```typescript
// Before: ErrorBoundary.tsx
<div>
  <h2>Error: Something went wrong</h2>
  <p>The application encountered an error. Refresh to continue.</p>
</div>

// After: ErrorBoundary.tsx
import { CONTENT } from '@/constants/content';

<div className="error-container">
  <h2 className="text-xl font-semibold">
    {CONTENT.COMMON.STATES.ERROR}
  </h2>
  <p className="text-gray-600 mt-2">
    {CONTENT.GAME.ERRORS.LOAD_GAME}
  </p>
  <button onClick={handleRetry} className="mt-4">
    Try Again
  </button>
</div>
```

**Error Message Tone Guide:**
```typescript
// ❌ BAD: Technical, blaming
"Error 404: County data not found. Invalid request."

// ✅ GOOD: Friendly, actionable
"County information unavailable. Try again in a moment."

// ❌ BAD: Vague, unhelpful
"An error occurred."

// ✅ GOOD: Specific, helpful
"Could not save your progress. Check your connection and retry."

// ❌ BAD: Alarming
"FATAL ERROR: Game crashed!"

// ✅ GOOD: Calm, solution-oriented
"Game paused. Refresh the page to continue."
```

### 4.2 Validation & Testing

#### Automated Tests

```typescript
// tests/content/validation.test.ts
import { CONTENT, formatContent } from '@/constants/content';

describe('Content Validation', () => {
  test('all button actions are action verbs', () => {
    const actions = Object.values(CONTENT.GAME.ACTIONS);
    const actionVerbs = ['Start', 'Restart', 'Place', 'Get', 'Skip', 'View'];

    actions.forEach(action => {
      const startsWithVerb = actionVerbs.some(verb => action.startsWith(verb));
      expect(startsWithVerb).toBe(true);
    });
  });

  test('mobile instructions are concise', () => {
    const mobileSteps = CONTENT.GAME.INSTRUCTIONS.MOBILE.STEPS;
    const totalLength = mobileSteps.join(' ').length;

    expect(totalLength).toBeLessThan(500);
  });

  test('error messages are encouraging', () => {
    const errors = Object.values(CONTENT.GAME.ERRORS);
    const discouragingWords = ['error', 'failed', 'wrong', 'fatal', 'crash'];

    errors.forEach(error => {
      const containsDiscouraging = discouragingWords.some(word =>
        error.toLowerCase().includes(word)
      );
      expect(containsDiscouraging).toBe(false);
    });
  });

  test('formatContent replaces variables', () => {
    const result = formatContent(
      CONTENT.GAME.MESSAGES.GAME_STATE.PROGRESS,
      { correct: 10, total: 58 }
    );
    expect(result).toBe('10 of 58 counties placed');
  });
});
```

#### Manual Checklist

- [ ] All buttons use constants
- [ ] All headings use constants
- [ ] All error messages use constants
- [ ] No hardcoded strings in JSX (except dynamic data)
- [ ] Mobile instructions < 500 characters
- [ ] Error messages are friendly and actionable
- [ ] Terminology is consistent (always "County", never "Region")

---

## 5. COMPLETION CRITERIA

### 5.1 Testing Checklist

#### Automated Tests
- [ ] Content validation tests pass
- [ ] No hardcoded strings detected (95%+ compliance)
- [ ] Template string formatting works correctly
- [ ] All constants are type-safe (TypeScript)

#### Manual QA
- [ ] Visual inspection of all components
- [ ] Mobile instructions are concise and scannable
- [ ] Error messages feel encouraging
- [ ] Button labels are clear and action-oriented
- [ ] Screen reader announces content correctly

### 5.2 Content Quality Metrics

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Hardcoded strings | 180+ | <10 | <10 ✅ |
| Mobile instruction length | 820 chars | 380 chars | <500 ✅ |
| Terminology consistency | 75% | 100% | 100% ✅ |
| Error message quality | 60% | 95% | 90%+ ✅ |

### 5.3 Validation Criteria

#### Content Consistency
- [ ] 100% of buttons use standardized labels
- [ ] 100% of error messages follow tone guidelines
- [ ] 95%+ of content uses constants (exceptions documented)
- [ ] 0 duplicate strings across components

#### Accessibility
- [ ] All ARIA labels use constants
- [ ] Content passes plain language test (8th grade reading level)
- [ ] Screen reader testing shows clear, consistent messaging

### 5.4 Documentation

- [ ] **Content constants documented** (JSDoc comments)
- [ ] **Glossary created** (terminology reference)
- [ ] **Contribution guide updated** (content standards)
- [ ] **i18n preparation documented** (future localization)

### 5.5 Deployment Checklist

#### Pre-Deployment
- [ ] All content tests pass
- [ ] Manual QA complete
- [ ] Stakeholder review approved
- [ ] No regressions in functionality

#### Post-Deployment
- [ ] Monitor user feedback on clarity
- [ ] Track error message occurrences
- [ ] Collect analytics on instruction completion rates

### 5.6 Success Metrics

**Quantitative:**
- Content consistency: 75% → 100%
- Mobile instruction length: -54%
- Content duplication: 180 instances → <10

**Qualitative:**
- Professional, consistent brand voice
- Clear, actionable messaging
- Improved user comprehension
- Better accessibility

---

## APPENDIX A: Content Constants Reference

### Quick Import Guide

```typescript
// Import entire content object
import { CONTENT } from '@/constants/content';

// Use in components
<button>{CONTENT.GAME.ACTIONS.START_GAME}</button>

// Template strings
import { formatContent } from '@/constants/content';

const message = formatContent(
  CONTENT.GAME.MESSAGES.GAME_STATE.PROGRESS,
  { correct: 10, total: 58 }
);
```

### Content Hierarchy

```
CONTENT
├── COMMON (shared across app)
│   ├── ACTIONS (buttons, links)
│   └── STATES (loading, success, error)
├── GAME (game-specific)
│   ├── TITLE, SUBTITLE
│   ├── ACTIONS (game buttons)
│   ├── INSTRUCTIONS (how to play)
│   ├── MESSAGES (feedback, progress)
│   └── ERRORS (game errors)
├── EDUCATION (educational content)
│   └── MODAL (county details)
└── ARIA (accessibility labels)
    ├── BUTTONS
    ├── STATUS
    └── NAVIGATION
```

---

## APPENDIX B: Migration Checklist

### Files to Create (3)
1. `/src/constants/content.ts`
2. `/src/constants/glossary.ts` (optional)
3. `/src/utils/formatContent.ts`

### Files to Modify (~20)
1. `/src/components/game/GameHeader.tsx`
2. `/src/components/game/CaliforniaGameContainer.tsx`
3. `/src/components/game/MobileGameInstructions.tsx`
4. `/src/components/game/GameMessages.tsx`
5. `/src/components/county/CountyDetailsModal.tsx`
6. `/src/components/shared/ErrorBoundary.tsx`
7. `/src/components/ui/Button.tsx`
8. All components with hardcoded strings (~15 more files)

### Validation Scripts
```bash
# Find remaining hardcoded strings
npm run validate:content

# Test content consistency
npm run test:content
```

---

**Estimated Completion:** 4 hours
**Risk Level:** LOW (no functional changes)
**Impact:** MEDIUM (UX polish, maintainability)
**ROI:** 7/10 ⭐⭐⭐⭐
