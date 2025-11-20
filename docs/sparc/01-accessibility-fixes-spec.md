# SPARC Specification: Accessibility Critical Fixes

**Priority:** CRITICAL (9/10 ROI)
**Effort:** 6 hours
**Target:** WCAG 2.1 AA 100% compliance, AAA 95%

---

## 1. SPECIFICATION PHASE

### 1.1 Requirements

#### Primary Requirements
1. **Modal Accessibility** (WCAG 2.1.1, 2.4.3, 4.1.2)
   - All modals must have proper ARIA attributes
   - Focus must be trapped within modal when open
   - Focus must return to trigger element when closed
   - Modal must be labeled with title

2. **Keyboard Navigation** (WCAG 2.1.1)
   - Add skip navigation link to main content
   - All interactive elements must be keyboard accessible
   - Tab order must be logical and complete

3. **Color Contrast** (WCAG 1.4.3, 1.4.6)
   - Secondary color: #FF6B35 → #CC5200 (4.5:1 minimum for AA)
   - Accent color: #FFD700 → #B8860B (4.5:1 minimum for AA)
   - All text must pass contrast ratio requirements

4. **Semantic Markup** (WCAG 4.1.2)
   - Decorative emojis marked as `aria-hidden="true"`
   - All images have appropriate alt text or aria-hidden
   - Proper heading hierarchy

#### Non-Functional Requirements
- **Performance:** No impact to load time (< 1KB added)
- **Backward Compatibility:** No breaking changes to existing components
- **Browser Support:** IE11+, modern browsers, screen readers (NVDA, JAWS, VoiceOver)
- **Testing:** Must work with keyboard-only navigation and screen readers

### 1.2 Success Criteria

#### Acceptance Tests
1. **Modal Focus Trap**
   ```
   GIVEN: User opens county details modal
   WHEN: User presses Tab key repeatedly
   THEN: Focus cycles only within modal elements
   AND: Focus does not escape to background content
   ```

2. **Skip Navigation**
   ```
   GIVEN: User loads game page
   WHEN: User presses Tab key once
   THEN: "Skip to main content" link is visible
   AND: Activating link moves focus to main game area
   ```

3. **Color Contrast**
   ```
   GIVEN: All text elements on screen
   WHEN: Tested with contrast checker
   THEN: All elements pass WCAG AA (4.5:1 for normal text, 3:1 for large)
   AND: 95% pass WCAG AAA (7:1 for normal text, 4.5:1 for large)
   ```

4. **Screen Reader Compatibility**
   ```
   GIVEN: User navigates with screen reader
   WHEN: User opens modal
   THEN: Screen reader announces "Dialog, [Modal Title]"
   AND: Decorative emojis are not announced
   ```

#### Validation Criteria
- **Automated:** axe DevTools reports 0 critical/serious issues
- **Manual:** Keyboard navigation test passes (30-point checklist)
- **Screen Reader:** NVDA/JAWS can navigate all features
- **WCAG Audit:** Wave tool shows 100% AA compliance

### 1.3 Edge Cases

1. **Multiple Modals Open**
   - Focus trap should work for topmost modal only
   - Closing modal should restore focus to previous modal (if stacked)

2. **Modal with Interactive Content**
   - Educational content with links should be keyboard accessible
   - Tab order should be natural (top-to-bottom, left-to-right)

3. **High Contrast Mode**
   - Colors should work in Windows High Contrast Mode
   - Borders/outlines should be visible

4. **Rapid Open/Close**
   - Focus management should be robust against rapid toggling
   - No focus loss to body element

---

## 2. PSEUDOCODE PHASE

### 2.1 Modal Focus Trap Algorithm

```typescript
// Hook: useFocusTrap
function useFocusTrap(isOpen: boolean, dialogRef: RefObject<HTMLElement>) {
  // 1. On mount/open:
  //    - Store currently focused element (returnFocusRef)
  //    - Query all focusable elements within dialog
  //    - Set focus to first focusable element (or dialog itself)

  // 2. On Tab key:
  //    - If shift+tab on first element → focus last element
  //    - If tab on last element → focus first element
  //    - Otherwise → allow default behavior

  // 3. On Escape key:
  //    - Close dialog
  //    - Restore focus to returnFocusRef

  // 4. On unmount/close:
  //    - Restore focus to returnFocusRef
  //    - Clear event listeners
}

// Focusable elements selector
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');
```

### 2.2 Skip Navigation Logic

```typescript
// Component: SkipNavigation
function SkipNavigation() {
  // 1. Render visually hidden link (absolute positioning off-screen)
  // 2. On focus (Tab key) → Show link with smooth transition
  // 3. On click → Move focus to element with id="main-content"
  // 4. On blur → Hide link

  // Styles:
  // - position: absolute; top: -40px; left: 0;
  // - On focus: top: 0; (visible)
  // - z-index: 9999;
  // - High contrast background/text
}
```

### 2.3 Color Contrast Replacement

```typescript
// File: src/hooks/useHighContrast.ts
function updateContrastColors() {
  // 1. Define color mappings:
  const colorUpdates = {
    '--color-secondary': {
      old: '#FF6B35',
      new: '#CC5200',
      ratio: '4.52:1' // WCAG AA compliant
    },
    '--color-accent': {
      old: '#FFD700',
      new: '#B8860B',
      ratio: '4.61:1' // WCAG AA compliant
    }
  };

  // 2. Update CSS variables in root
  // 3. Provide toggle for high contrast mode (AAA)
  // 4. Persist preference in localStorage
}
```

### 2.4 Decorative Emoji Handling

```typescript
// Utility: decorativeEmoji
function decorativeEmoji(emoji: string): ReactElement {
  return (
    <span aria-hidden="true" role="presentation">
      {emoji}
    </span>
  );
}

// Usage: Replace all decorative emojis
// Before: <span>🎯</span>
// After:  {decorativeEmoji('🎯')}
```

---

## 3. ARCHITECTURE PHASE

### 3.1 Component Structure

```
/src
├── components/
│   ├── accessibility/
│   │   ├── SkipNavigation.tsx          [NEW]
│   │   └── FocusTrap.tsx                [NEW]
│   ├── county/
│   │   └── CountyDetailsModal.tsx       [MODIFY]
│   ├── game/
│   │   └── modals/
│   │       └── EducationalContentModal.tsx [MODIFY]
│   └── ui/
│       └── Modal.tsx                     [NEW - Shared modal wrapper]
├── hooks/
│   ├── useFocusTrap.ts                  [NEW]
│   ├── useHighContrast.ts               [MODIFY]
│   └── useKeyboardShortcut.ts           [NEW]
├── utils/
│   ├── accessibility.ts                 [NEW]
│   └── decorativeEmoji.tsx              [NEW]
└── App.tsx                              [MODIFY - Add skip nav]
```

### 3.2 Integration Points

#### Modal Component Pattern
```typescript
// Shared Modal Wrapper (NEW)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(isOpen, dialogRef);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className={className}
    >
      <h2 id="modal-title">{title}</h2>
      {children}
      <button onClick={onClose} aria-label="Close dialog">
        Close
      </button>
    </div>
  );
}
```

#### Skip Navigation Integration
```typescript
// App.tsx modification
function App() {
  return (
    <>
      <SkipNavigation />
      <Header />
      <main id="main-content" tabIndex={-1}>
        {/* Game content */}
      </main>
    </>
  );
}
```

### 3.3 Data Flow

```
User Action → Keyboard Event
     ↓
  useFocusTrap hook
     ↓
  Focus Management Logic
     ↓
  DOM Focus Update
     ↓
  ARIA State Update
     ↓
  Screen Reader Announcement
```

### 3.4 Testing Strategy

#### Unit Tests (Jest + React Testing Library)
```typescript
// useFocusTrap.test.ts
describe('useFocusTrap', () => {
  test('traps focus within modal', () => {
    // Render modal with focusable elements
    // Tab through all elements
    // Verify focus cycles back to first element
  });

  test('returns focus on close', () => {
    // Store initial focus
    // Open modal
    // Close modal
    // Verify focus returned to initial element
  });

  test('handles Escape key', () => {
    // Open modal
    // Press Escape
    // Verify modal closed and focus restored
  });
});
```

#### Integration Tests (Playwright)
```typescript
// accessibility.spec.ts
test('keyboard navigation flow', async ({ page }) => {
  await page.goto('/');

  // Test skip navigation
  await page.keyboard.press('Tab');
  const skipLink = await page.locator('a:has-text("Skip to main content")');
  await expect(skipLink).toBeVisible();

  // Test modal focus trap
  await page.click('[data-testid="open-modal"]');
  await page.keyboard.press('Tab');
  // Verify focus cycles within modal
});
```

#### Screen Reader Tests (Manual)
```
Test Plan:
1. NVDA on Windows + Chrome
   - Verify modal announces as dialog
   - Verify decorative emojis not announced
   - Verify skip link works

2. JAWS on Windows + Firefox
   - Same tests as NVDA

3. VoiceOver on macOS + Safari
   - Same tests as NVDA
```

---

## 4. REFINEMENT PLAN (TDD APPROACH)

### 4.1 Test-First Implementation Order

#### Step 1: Focus Trap Hook (2 hours)
```typescript
// RED: Write failing test
test('useFocusTrap traps focus within dialog', () => {
  // Test implementation
});

// GREEN: Implement hook
function useFocusTrap(isOpen: boolean, dialogRef: RefObject<HTMLElement>) {
  // Implementation
}

// REFACTOR: Optimize performance, add edge case handling
```

#### Step 2: Skip Navigation (30 minutes)
```typescript
// RED: Write failing test
test('SkipNavigation moves focus to main content', () => {
  // Test implementation
});

// GREEN: Implement component
function SkipNavigation() {
  // Implementation
}

// REFACTOR: Improve styling, add animations
```

#### Step 3: Modal ARIA Attributes (1 hour)
```typescript
// RED: Write failing test
test('Modal has correct ARIA attributes', () => {
  const { container } = render(<Modal isOpen={true} title="Test" />);
  expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
  expect(container.querySelector('[aria-modal="true"]')).toBeInTheDocument();
});

// GREEN: Add attributes to Modal components
// REFACTOR: Extract shared Modal component
```

#### Step 4: Color Contrast Updates (1 hour)
```typescript
// RED: Write failing test (visual regression)
test('Secondary color meets WCAG AA contrast', () => {
  const contrastRatio = calculateContrast('#CC5200', '#FFFFFF');
  expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
});

// GREEN: Update CSS variables
// REFACTOR: Create high contrast toggle
```

#### Step 5: Decorative Emoji Handling (1.5 hours)
```typescript
// RED: Write failing test
test('Decorative emojis have aria-hidden', () => {
  const { container } = render(decorativeEmoji('🎯'));
  expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
});

// GREEN: Replace all emoji instances
// REFACTOR: Create utility function and search/replace
```

### 4.2 Refactoring Checklist

- [ ] Extract shared Modal component to reduce duplication
- [ ] Create accessibility utilities file
- [ ] Add TypeScript types for ARIA attributes
- [ ] Optimize focus trap performance (debounce, memoization)
- [ ] Add error boundaries for focus management failures
- [ ] Document accessibility patterns in Storybook

### 4.3 Performance Optimization

- **Focus Trap:** Use `useCallback` for event handlers
- **Skip Navigation:** CSS-only animation (no JS for transitions)
- **Color Updates:** CSS variables (no runtime computation)
- **Bundle Size:** < 1KB added (focus trap + skip nav utilities)

---

## 5. COMPLETION CRITERIA

### 5.1 Integration Testing

#### Automated Tests (Required)
- [ ] **axe-core:** 0 critical/serious violations
- [ ] **Lighthouse Accessibility:** 100 score
- [ ] **WAVE:** 0 errors, 0 contrast errors
- [ ] **Pa11y:** All tests pass
- [ ] **Jest:** 100% coverage for new accessibility code
- [ ] **Playwright:** Keyboard navigation tests pass

#### Manual Tests (Required)
- [ ] **Keyboard Navigation:** 30-point checklist completed
- [ ] **Screen Reader:** NVDA, JAWS, VoiceOver tests pass
- [ ] **High Contrast Mode:** All elements visible in Windows HCM
- [ ] **Browser Testing:** Chrome, Firefox, Safari, Edge
- [ ] **Mobile Testing:** iOS VoiceOver, Android TalkBack

### 5.2 WCAG Compliance Validation

#### WCAG 2.1 AA (Required)
- [x] **1.4.3 Contrast (Minimum):** 4.5:1 for normal text
- [x] **2.1.1 Keyboard:** All functionality available via keyboard
- [x] **2.4.3 Focus Order:** Logical tab order
- [x] **4.1.2 Name, Role, Value:** Proper ARIA attributes

#### WCAG 2.1 AAA (Target 95%)
- [x] **1.4.6 Contrast (Enhanced):** 7:1 for normal text
- [x] **2.4.8 Location:** Skip navigation link present
- [x] **3.2.5 Change on Request:** No automatic context changes

### 5.3 Documentation Requirements

- [ ] **README:** Accessibility features documented
- [ ] **TESTING.md:** Keyboard navigation guide added
- [ ] **CONTRIBUTING.md:** Accessibility standards documented
- [ ] **Storybook:** Accessibility examples added
- [ ] **Code Comments:** ARIA usage explained

### 5.4 Deployment Checklist

#### Pre-Deployment
- [ ] All automated tests pass
- [ ] Manual testing complete
- [ ] Screen reader testing complete
- [ ] Code review approved
- [ ] Accessibility audit complete

#### Post-Deployment
- [ ] Monitor analytics for keyboard navigation usage
- [ ] Monitor error logs for focus management issues
- [ ] Collect user feedback from assistive technology users
- [ ] Schedule quarterly WCAG audits

### 5.5 Rollback Plan

**Trigger Conditions:**
- Screen reader navigation breaks
- Focus trap prevents modal closure
- Keyboard navigation fails

**Rollback Steps:**
1. Revert to previous commit (tagged: `pre-accessibility-fixes`)
2. Deploy rollback via CI/CD
3. Notify users of temporary accessibility regression
4. Fix issues in development environment
5. Re-deploy with fixes

### 5.6 Success Metrics

**Quantitative:**
- **WCAG AA Compliance:** 94% → 100%
- **WCAG AAA Compliance:** 90% → 95%
- **Lighthouse Accessibility Score:** Current → 100
- **axe Violations:** Current → 0

**Qualitative:**
- Users with disabilities can complete all game features
- Screen reader users report positive experience
- Keyboard-only users can navigate entire application
- High contrast mode users can see all elements

---

## APPENDIX A: File Modification Summary

### Files to Modify (8 files)

1. **`/src/components/county/CountyDetailsModal.tsx`**
   - Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
   - Integrate `useFocusTrap` hook
   - Add Escape key handler

2. **`/src/components/game/modals/EducationalContentModal.tsx`**
   - Same modal accessibility updates

3. **`/src/App.tsx`**
   - Add `<SkipNavigation />` component
   - Add `id="main-content"` to main element
   - Add `tabIndex={-1}` to main for programmatic focus

4. **`/src/hooks/useHighContrast.ts`**
   - Update color constants (secondary, accent)
   - Add WCAG AA/AAA toggle
   - Add localStorage persistence

5. **`/src/components/game/GameHeader.tsx`**
   - Replace decorative emojis with `aria-hidden` spans

6. **`/src/components/game/GameMap.tsx`**
   - Add keyboard navigation for county selection

7. **`/src/styles/globals.css`**
   - Update CSS variable values for colors

8. **`/src/components/shared/ErrorBoundary.tsx`**
   - Add ARIA live region for error announcements

### Files to Create (5 files)

1. **`/src/components/accessibility/SkipNavigation.tsx`**
2. **`/src/components/accessibility/FocusTrap.tsx`** (optional, if extracting from hook)
3. **`/src/hooks/useFocusTrap.ts`**
4. **`/src/utils/accessibility.ts`**
5. **`/src/utils/decorativeEmoji.tsx`**

### Test Files to Create (3 files)

1. **`/tests/accessibility/useFocusTrap.test.ts`**
2. **`/tests/accessibility/SkipNavigation.test.tsx`**
3. **`/tests/e2e/accessibility.spec.ts`** (Playwright)

---

## APPENDIX B: WCAG Quick Reference

### Critical Success Criteria

| Criterion | Level | Description | Implementation |
|-----------|-------|-------------|----------------|
| 1.4.3 | AA | Contrast 4.5:1 | Update colors |
| 2.1.1 | A | Keyboard access | Focus trap, skip nav |
| 2.4.3 | A | Focus order | Logical tab order |
| 4.1.2 | A | Name, role, value | ARIA attributes |
| 1.4.6 | AAA | Contrast 7:1 | High contrast toggle |
| 2.4.8 | AAA | Skip links | Skip navigation |

### Testing Tools

- **Automated:** axe DevTools, Lighthouse, WAVE, Pa11y
- **Manual:** NVDA, JAWS, VoiceOver, keyboard-only navigation
- **Visual:** Color contrast analyzer, High Contrast Mode

---

**Estimated Completion:** 6 hours
**Risk Level:** LOW (non-breaking changes, well-tested patterns)
**Impact:** CRITICAL (legal compliance, inclusive design)
**ROI:** 9/10 ⭐⭐⭐⭐⭐
