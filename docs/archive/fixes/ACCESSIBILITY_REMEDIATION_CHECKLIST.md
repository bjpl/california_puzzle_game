# Accessibility Remediation Checklist

**Priority**: CRITICAL
**Estimated Effort**: 10-14 hours
**Current AAA Score**: 22% (2/9 criteria)
**Target AAA Score**: 80%+ (7/9 criteria)

---

## Priority 1: Critical Fixes (4-6 hours)

### 1. Add Semantic HTML Structure (1 hour)

**File**: `/src/App.tsx`

- [ ] Add `<header role="banner">` wrapper
- [ ] Add `<h1 className="sr-only">California Counties Puzzle Game</h1>`
- [ ] Add skip link: `<a href="#main" className="sr-only focus:not-sr-only">Skip to main content</a>`
- [ ] Wrap GameContainer in `<main role="main" id="main">`
- [ ] Wrap UpdateToast/FeedbackWidget in `<aside role="complementary">`
- [ ] Wrap CookieConsent in `<footer role="contentinfo">`

**Success Criteria**: Screen readers can navigate by landmarks

---

### 2. Add Missing ARIA Labels (2 hours)

#### CountyCard.tsx

**File**: `/src/components/county/CountyCard.tsx`

- [ ] Line 97-100: Add `aria-label="Difficulty {index + 1} of 5"` to each Star
- [ ] Line 84: Add `aria-describedby="county-{id}-details"` to image

```tsx
{difficultyStars.map((filled, index) => (
  <Star
    key={index}
    aria-label={`Difficulty ${index + 1} of 5`}
    className={...}
  />
))}
```

#### GameHeader.tsx

**File**: `/src/components/game/GameHeader.tsx`

- [ ] Line 43-50: Add aria-label to sound toggle button
- [ ] Line 52-58: Add aria-label to pause/play button
- [ ] Line 60-88: Add aria-label to hint button
- [ ] Line 96-99: Add aria-label to game logo

```tsx
<button
  onClick={toggleSound}
  aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
  className="touch-target..."
>
  {soundEnabled ? <VolumeUp /> : <VolumeOff />}
</button>
```

#### All Interactive Components

- [ ] Audit all `<button>` elements for aria-labels
- [ ] Audit all icon-only controls
- [ ] Add aria-live regions for score updates

---

### 3. Implement Focus Management (2 hours)

**New File**: `/src/hooks/useFocusManagement.ts`

```tsx
import { useEffect, useRef } from 'react';

export function useFocusManagement() {
  const previousFocus = useRef<HTMLElement | null>(null);

  const saveFocus = () => {
    previousFocus.current = document.activeElement as HTMLElement;
  };

  const restoreFocus = () => {
    previousFocus.current?.focus();
    previousFocus.current = null;
  };

  const trapFocus = (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    firstFocusable?.focus();

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  };

  return { saveFocus, restoreFocus, trapFocus };
}
```

**Apply to**:

- [ ] `/src/components/county/CountyDetailsModal.tsx`
- [ ] `/src/components/game/modals/HintModal.tsx`
- [ ] `/src/components/game/modals/EducationalContentModal.tsx`

---

### 4. Connect Voice Control (1 hour)

**File**: `/src/components/shared/settings/AccessibilityPanel.tsx`

- [ ] Import `useGame` hook: `import { useGame } from '@/context/GameContext';`
- [ ] Replace console.log with actual functions (lines 36-45):

```tsx
const { dropCurrentCounty, zoomIn, zoomOut, resetGame, useHint, undoLastPlacement } = useGame();

const voiceCommands = createGameVoiceCommands(
  dropCurrentCounty,
  zoomIn,
  zoomOut,
  resetGame,
  useHint,
  undoLastPlacement,
  () => console.log('Settings'), // Keep as-is (no game action)
  () => console.log('Help') // Keep as-is (no game action)
);
```

**Test**:

- [ ] Enable voice control in settings
- [ ] Say "drop county" and verify county is placed
- [ ] Say "zoom in" and verify map zooms

---

## Priority 2: Enhanced Features (3-4 hours)

### 5. Apply High Contrast Mode (2 hours)

**New File**: `/src/styles/high-contrast.css`

```css
/* High Contrast Mode Styles */
.high-contrast-mode {
  /* Buttons */
  button,
  .touch-target {
    background: var(--hc-background);
    color: var(--hc-foreground);
    border: var(--hc-border-width, 3px) solid var(--hc-border);
  }

  button:hover {
    background: var(--hc-foreground);
    color: var(--hc-background);
  }

  /* Cards */
  .county-card,
  .card {
    background: var(--hc-background);
    color: var(--hc-foreground);
    border: var(--hc-border-width, 3px) solid var(--hc-border);
  }

  /* Focus indicators */
  *:focus-visible {
    outline: var(--hc-focus-width, 4px) solid var(--hc-focus);
    outline-offset: 2px;
  }

  /* Remove decorative elements */
  .decorative-gradient,
  .decorative-shadow,
  .hover-effect {
    background: none !important;
    box-shadow: none !important;
  }
}
```

**Import in**: `/src/App.tsx`

- [ ] Add `import './styles/high-contrast.css';` at top

**Apply to components**:

- [ ] CountyCard.tsx - Add high-contrast-aware classes
- [ ] GameHeader.tsx - Add high-contrast-aware classes
- [ ] All button components

---

### 6. Apply Touch Target Sizes (1 hour)

**New File**: `/src/styles/touch-targets.css`

```css
/* Touch Target Utility Classes */
.touch-target {
  min-width: var(--touch-target-min, 44px);
  min-height: var(--touch-target-min, 44px);
  padding: var(--touch-target-padding, 12px);
  font-size: var(--touch-target-font-size, 1rem);
}

.touch-target-large {
  min-width: 52px;
  min-height: 52px;
  padding: 16px;
  font-size: 1.125rem;
}

.touch-target-xl {
  min-width: 64px;
  min-height: 64px;
  padding: 20px;
  font-size: 1.25rem;
}
```

**Apply to**:

- [ ] All `<button>` elements
- [ ] All `<a>` elements with role="button"
- [ ] Interactive icons

---

### 7. Implement Reduced Motion (1 hour)

**New File**: `/src/hooks/useReducedMotion.ts`

```tsx
import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return reducedMotion;
}
```

**Apply to animated components**:

- [ ] CountyCard.tsx - Conditionally apply transitions
- [ ] CountyFormationAnimation.tsx - Disable animations when reduced motion
- [ ] All components with `transition-*` classes

```tsx
import { useReducedMotion } from '@/hooks/useReducedMotion';

const reducedMotion = useReducedMotion();

className={clsx(
  !reducedMotion && 'transition-all duration-300',
  'other-classes'
)}
```

---

## Priority 3: Testing & Validation (2-3 hours)

### 8. Fix Test Suite (1 hour)

**File**: `/vitest.config.ts`

- [ ] Increase test timeout to 10000ms
- [ ] Add proper test environment setup
- [ ] Run tests: `npm test -- tests/accessibility/accessibility-aaa.test.ts`
- [ ] Fix any failures

---

### 9. Manual Testing (2 hours)

#### Screen Reader Testing

- [ ] Install NVDA (Windows) or enable VoiceOver (Mac)
- [ ] Navigate entire game with screen reader
- [ ] Verify all interactive elements are announced
- [ ] Verify game state changes are announced

#### Keyboard Navigation

- [ ] Navigate entire game using only Tab/Shift+Tab
- [ ] Verify all functionality accessible via keyboard
- [ ] Verify focus indicators visible in all themes
- [ ] Test modal focus trapping

#### Mobile Testing

- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Verify touch target sizes (44px+ on all buttons)
- [ ] Test pinch-to-zoom enabled
- [ ] Test landscape and portrait orientations

#### Voice Control

- [ ] Enable voice control in settings
- [ ] Test all voice commands
- [ ] Verify commands execute correctly

---

## Verification Checklist

Before marking as complete:

- [ ] All WCAG Level A criteria pass
- [ ] All WCAG Level AA criteria pass
- [ ] At least 7/9 WCAG Level AAA criteria pass
- [ ] axe DevTools reports 0 violations
- [ ] Manual screen reader test completed
- [ ] Manual keyboard navigation test completed
- [ ] Manual mobile device test completed
- [ ] Voice control functional test completed

---

## Success Metrics

**Before**:

- Level A: 44% (4/9)
- Level AA: 60% (3/5)
- Level AAA: 22% (2/9)

**After**:

- Level A: 100% (9/9) ✅
- Level AA: 100% (5/5) ✅
- Level AAA: 80%+ (7/9) ✅

---

## Resources

- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **axe DevTools**: https://www.deque.com/axe/devtools/
- **NVDA Screen Reader**: https://www.nvaccess.org/download/
- **Testing Guide**: `/docs/MOBILE_FEATURES_GUIDE.md` (accessibility section)

---

**Last Updated**: 2025-10-11
**Owner**: Development Team
**Reviewer**: Accessibility Specialist Agent
