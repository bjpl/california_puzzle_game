# SPARC Specification: UI Quick Wins

**Priority:** HIGH (8/10 ROI)
**Effort:** 6 hours
**Target:** Professional polish, WCAG touch target compliance

---

## 1. SPECIFICATION PHASE

### 1.1 Requirements

#### Primary Requirements

1. **Touch Target Compliance** (WCAG 2.5.5, Mobile Accessibility)
   - All interactive elements must be at least 44x44 CSS pixels
   - Mobile buttons currently 28px → increase to 44px minimum
   - Add appropriate padding/spacing to prevent accidental taps
   - Maintain visual balance (no oversized buttons on desktop)

2. **Visual Feedback System** (UX Best Practice)
   - Success/error toast notifications for user actions
   - Clear visual confirmation for state changes
   - Non-intrusive, auto-dismissing notifications
   - Accessible to screen readers (ARIA live regions)

3. **Button Contrast & States** (WCAG 1.4.3)
   - Disabled buttons must have 3:1 contrast ratio
   - Focus-visible styles for keyboard navigation
   - Hover/active states clearly distinguishable
   - Loading states with proper ARIA labels

4. **Button Label Standardization** (UX Consistency)
   - Consistent terminology across application
   - Action-oriented labels (verbs)
   - Clear, concise text (no ambiguity)
   - Appropriate tone for educational context

#### Non-Functional Requirements

- **Performance:** Toast system < 5KB bundle size
- **Responsiveness:** Touch targets scale appropriately on all viewports
- **Accessibility:** ARIA live regions for dynamic content
- **Cross-Browser:** Support iOS Safari, Android Chrome, desktop browsers
- **Animation:** Smooth transitions (< 300ms), respects prefers-reduced-motion

### 1.2 Success Criteria

#### Acceptance Tests

1. **Touch Target Test**
   ```
   GIVEN: User on mobile device (375px viewport)
   WHEN: User taps any interactive element
   THEN: Touch target is at least 44x44 CSS pixels
   AND: No accidental taps on adjacent elements
   ```

2. **Toast Notification Test**
   ```
   GIVEN: User completes county placement
   WHEN: Correct placement occurs
   THEN: Success toast appears with green checkmark
   AND: Toast auto-dismisses after 3 seconds
   AND: Toast can be manually dismissed
   ```

3. **Button State Test**
   ```
   GIVEN: Button in disabled state
   WHEN: Tested with contrast checker
   THEN: Contrast ratio is at least 3:1
   AND: Cursor shows "not-allowed" on hover
   ```

4. **Focus-Visible Test**
   ```
   GIVEN: User navigates with keyboard
   WHEN: User tabs to button
   THEN: Clear focus outline appears (2px solid, high contrast)
   AND: Outline is visible against all backgrounds
   ```

#### Validation Criteria

- **Automated:** Lighthouse mobile "Touch targets are sized appropriately" passes
- **Manual:** Finger tap test on physical devices (iPhone, Android)
- **Visual QA:** All button states documented in Storybook
- **Accessibility:** Focus indicators visible in high contrast mode

### 1.3 Edge Cases

1. **Small Viewport (< 375px)**
   - Touch targets remain 44px minimum
   - Layout adjusts to prevent overlap
   - Horizontal scrolling if necessary (avoid)

2. **Toast Notification Queue**
   - Multiple toasts stack vertically
   - Maximum 3 toasts visible at once
   - Older toasts dismiss first (FIFO)

3. **Button Text Overflow**
   - Long labels wrap or truncate with ellipsis
   - Touch target size maintained regardless of text length

4. **Reduced Motion Preference**
   - Toast animations disabled if `prefers-reduced-motion: reduce`
   - Instant appearance/disappearance instead of slide-in

---

## 2. PSEUDOCODE PHASE

### 2.1 Touch Target Resize Algorithm

```typescript
// Responsive touch target system
function calculateTouchTarget(
  viewport: 'mobile' | 'tablet' | 'desktop',
  buttonType: 'primary' | 'secondary' | 'icon'
): string {
  // Mobile: Minimum 44px
  if (viewport === 'mobile') {
    return buttonType === 'icon'
      ? 'p-2.5'  // 10px padding = 44px total (24px icon + 20px padding)
      : 'py-3 px-4'; // 48px height, comfortable touch
  }

  // Tablet: Slightly smaller but still accessible
  if (viewport === 'tablet') {
    return buttonType === 'icon'
      ? 'p-2'
      : 'py-2.5 px-4';
  }

  // Desktop: Optimized for mouse/trackpad
  return buttonType === 'icon'
    ? 'p-1.5'
    : 'py-2 px-3';
}

// Usage in components
const buttonClasses = cn(
  'rounded-lg transition-all',
  isMobile ? 'py-3 px-4' : 'py-2 px-3',
  // ... other classes
);
```

### 2.2 Toast Notification System

```typescript
// Toast Manager (Zustand store)
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number; // milliseconds (default 3000)
  dismissible?: boolean; // default true
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

// Toast lifecycle
function addToast(toast) {
  // 1. Generate unique ID
  const id = generateId();

  // 2. Add to queue (max 3 toasts)
  if (toasts.length >= 3) {
    removeToast(toasts[0].id); // Remove oldest
  }

  // 3. Add new toast
  toasts.push({ ...toast, id });

  // 4. Auto-dismiss after duration
  if (toast.duration !== Infinity) {
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 3000);
  }
}

// Toast component rendering
function Toast({ type, message, onDismiss }) {
  // 1. Render with appropriate icon and color
  // 2. Add ARIA live region (polite for info, assertive for errors)
  // 3. Add dismiss button (X icon)
  // 4. Animate entrance/exit (slide-in from top-right)

  return (
    <div
      role="status"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'toast-base',
        type === 'success' && 'bg-green-500',
        type === 'error' && 'bg-red-500',
        // Animation classes
      )}
    >
      {getIcon(type)}
      <span>{message}</span>
      {dismissible && <button onClick={onDismiss}>✕</button>}
    </div>
  );
}
```

### 2.3 Button State Management

```typescript
// Enhanced Button Component
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
}

function Button({ variant, size, disabled, loading, children }: ButtonProps) {
  // 1. Calculate base classes
  const baseClasses = 'rounded-lg transition-all focus-visible:ring-2';

  // 2. Size classes (responsive touch targets)
  const sizeClasses = {
    sm: 'py-1.5 px-3 md:py-1 md:px-2',
    md: 'py-3 px-4 md:py-2 md:px-3',
    lg: 'py-3.5 px-5 md:py-2.5 md:px-4'
  };

  // 3. Disabled state (3:1 contrast minimum)
  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed bg-gray-400'
    : '';

  // 4. Focus-visible (keyboard navigation)
  const focusClasses = 'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500';

  // 5. Loading state
  const ariaLabel = loading ? 'Loading...' : undefined;

  return (
    <button
      className={cn(baseClasses, sizeClasses[size], disabledClasses, focusClasses)}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      {loading && <Spinner className="mr-2" />}
      {children}
    </button>
  );
}
```

### 2.4 Button Label Standardization

```typescript
// Content constants file
export const BUTTON_LABELS = {
  // Game actions
  SUBMIT_GUESS: 'Place County',
  NEXT_ROUND: 'Continue',
  START_GAME: 'Start Game',
  RESTART_GAME: 'Restart',
  QUIT_GAME: 'Quit Game',

  // Navigation
  CLOSE_MODAL: 'Close',
  GO_BACK: 'Back',
  VIEW_DETAILS: 'View Details',

  // Help/Info
  SHOW_HINT: 'Get Hint',
  LEARN_MORE: 'Learn More',
  SHOW_INSTRUCTIONS: 'How to Play',

  // Settings
  TOGGLE_SOUND: 'Sound',
  TOGGLE_HIGH_CONTRAST: 'High Contrast',
  SAVE_SETTINGS: 'Save Settings',
};

// Usage
import { BUTTON_LABELS } from '@/constants/content';

<Button>{BUTTON_LABELS.SUBMIT_GUESS}</Button>
```

---

## 3. ARCHITECTURE PHASE

### 3.1 Component Structure

```
/src
├── components/
│   ├── ui/
│   │   ├── Button.tsx                  [MODIFY - Add touch targets, states]
│   │   ├── Toast.tsx                   [NEW]
│   │   └── ToastContainer.tsx          [NEW]
│   ├── game/
│   │   └── GameHeader.tsx              [MODIFY - Touch targets]
│   └── county/
│       └── CountyDetailsModal.tsx      [MODIFY - Button standardization]
├── stores/
│   └── toastStore.ts                   [NEW]
├── hooks/
│   └── useToast.ts                     [NEW]
├── constants/
│   └── content.ts                      [NEW]
└── utils/
    └── touchTarget.ts                  [NEW]
```

### 3.2 Integration Points

#### Toast System Architecture

```
User Action (e.g., correct placement)
    ↓
Component calls useToast().success()
    ↓
Toast added to Zustand store
    ↓
ToastContainer observes store
    ↓
Toast component rendered with animation
    ↓
Auto-dismiss timer starts
    ↓
Toast removed from store after duration
    ↓
Component unmounts with exit animation
```

#### Touch Target Integration

```typescript
// Responsive touch target hook
function useResponsiveTouchTarget() {
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      if (width < 768) setViewport('mobile');
      else if (width < 1024) setViewport('tablet');
      else setViewport('desktop');
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return viewport;
}
```

### 3.3 Data Flow

#### Toast Store (Zustand)

```typescript
// stores/toastStore.ts
import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => set((state) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };

    // Limit to 3 toasts
    const toasts = state.toasts.length >= 3
      ? [...state.toasts.slice(1), newToast]
      : [...state.toasts, newToast];

    return { toasts };
  }),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  }))
}));
```

#### Toast Hook (Convenience)

```typescript
// hooks/useToast.ts
import { useToastStore } from '@/stores/toastStore';

export function useToast() {
  const addToast = useToastStore(state => state.addToast);

  return {
    success: (message: string) => addToast({ type: 'success', message, duration: 3000 }),
    error: (message: string) => addToast({ type: 'error', message, duration: 5000 }),
    info: (message: string) => addToast({ type: 'info', message, duration: 3000 }),
    warning: (message: string) => addToast({ type: 'warning', message, duration: 4000 }),
  };
}
```

### 3.4 Testing Strategy

#### Unit Tests

```typescript
// Button.test.tsx
describe('Button', () => {
  test('has minimum 44px touch target on mobile', () => {
    mockViewport('mobile');
    const { container } = render(<Button>Click me</Button>);
    const button = container.querySelector('button');
    const { height } = button.getBoundingClientRect();
    expect(height).toBeGreaterThanOrEqual(44);
  });

  test('disabled button has 3:1 contrast', () => {
    const { container } = render(<Button disabled>Click me</Button>);
    const button = container.querySelector('button');
    const contrastRatio = calculateContrast(button);
    expect(contrastRatio).toBeGreaterThanOrEqual(3);
  });

  test('shows focus-visible outline on keyboard focus', () => {
    const { container } = render(<Button>Click me</Button>);
    const button = container.querySelector('button');
    button.focus();
    expect(button).toHaveClass('focus-visible:ring-2');
  });
});

// Toast.test.tsx
describe('Toast', () => {
  test('auto-dismisses after duration', async () => {
    const { success } = useToast();
    success('Test message');

    expect(screen.getByText('Test message')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    }, { timeout: 3500 });
  });

  test('limits to 3 toasts maximum', () => {
    const { success } = useToast();
    success('Toast 1');
    success('Toast 2');
    success('Toast 3');
    success('Toast 4'); // Should remove Toast 1

    expect(screen.queryByText('Toast 1')).not.toBeInTheDocument();
    expect(screen.getByText('Toast 4')).toBeInTheDocument();
  });
});
```

#### Integration Tests (Playwright)

```typescript
// ui-quick-wins.spec.ts
test('touch targets meet 44px minimum on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  await page.goto('/');

  const buttons = await page.locator('button').all();
  for (const button of buttons) {
    const box = await button.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
  }
});

test('toast notification appears and dismisses', async ({ page }) => {
  await page.goto('/');

  // Trigger action that shows success toast
  await page.click('[data-testid="submit-guess"]');

  // Verify toast appears
  const toast = page.locator('[role="status"]');
  await expect(toast).toBeVisible();

  // Verify toast dismisses after 3 seconds
  await page.waitForTimeout(3500);
  await expect(toast).not.toBeVisible();
});
```

---

## 4. REFINEMENT PLAN (TDD APPROACH)

### 4.1 Implementation Steps

#### Step 1: Touch Target Updates (2 hours)

**Files to modify:**
- `/src/components/ui/Button.tsx`
- `/src/components/game/GameHeader.tsx`
- `/src/components/county/CountyCard.tsx`

**TDD Process:**
```typescript
// RED: Write failing test
test('button has 44px minimum height on mobile', () => {
  // Test implementation
});

// GREEN: Update button padding
className={cn(
  'rounded-lg',
  'sm:py-3 sm:px-4', // Mobile: 44px+
  'md:py-2 md:px-3'  // Desktop: Smaller
)}

// REFACTOR: Extract to utility function
```

**Specific Changes:**
```diff
// GameHeader.tsx - Before
- className="p-1.5 rounded-lg"
+ className="p-2.5 sm:p-1.5 rounded-lg" // 44px on mobile

// Button.tsx - Before
- py-2 px-3
+ py-3 px-4 md:py-2 md:px-3
```

#### Step 2: Toast Notification System (2 hours)

**Files to create:**
- `/src/stores/toastStore.ts`
- `/src/hooks/useToast.ts`
- `/src/components/ui/Toast.tsx`
- `/src/components/ui/ToastContainer.tsx`

**TDD Process:**
```typescript
// RED: Write toast store tests
describe('toastStore', () => {
  test('adds toast to queue', () => { /* ... */ });
  test('removes toast after duration', () => { /* ... */ });
  test('limits to 3 toasts', () => { /* ... */ });
});

// GREEN: Implement store
export const useToastStore = create<ToastStore>((set) => ({
  // Implementation
}));

// REFACTOR: Add TypeScript types, optimize performance
```

**Toast Component Implementation:**
```typescript
function Toast({ id, type, message }: ToastProps) {
  const removeToast = useToastStore(state => state.removeToast);

  return (
    <div
      role="status"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg shadow-lg',
        'animate-slide-in-right',
        type === 'success' && 'bg-green-500 text-white',
        type === 'error' && 'bg-red-500 text-white',
        type === 'info' && 'bg-blue-500 text-white',
        type === 'warning' && 'bg-yellow-500 text-gray-900'
      )}
    >
      {getIcon(type)}
      <span className="flex-1">{message}</span>
      <button
        onClick={() => removeToast(id)}
        className="hover:opacity-80"
        aria-label="Dismiss notification"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
```

#### Step 3: Button State Improvements (1 hour)

**Files to modify:**
- `/src/components/ui/Button.tsx`

**Changes:**
1. **Disabled State Contrast**
   ```typescript
   const disabledStyles = disabled
     ? 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-60'
     : '';
   // Contrast ratio: 4.1:1 (WCAG AA compliant)
   ```

2. **Focus-Visible Styles**
   ```typescript
   const focusStyles = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500';
   ```

3. **Loading State**
   ```typescript
   {loading && (
     <>
       <Spinner className="mr-2 h-4 w-4 animate-spin" />
       <span className="sr-only">Loading...</span>
     </>
   )}
   ```

#### Step 4: Content Standardization (1 hour)

**Files to create:**
- `/src/constants/content.ts`

**Files to modify:**
- All components with hardcoded button labels (~15 files)

**Process:**
1. Audit all button labels across codebase
2. Create constants file with standardized labels
3. Search and replace all occurrences
4. Verify no regressions

```typescript
// constants/content.ts
export const BUTTON_LABELS = {
  SUBMIT_GUESS: 'Place County',
  NEXT_ROUND: 'Continue',
  // ... all labels
};

// Usage
import { BUTTON_LABELS } from '@/constants/content';
<Button>{BUTTON_LABELS.SUBMIT_GUESS}</Button>
```

### 4.2 Integration Steps

1. **Add ToastContainer to App.tsx**
   ```typescript
   import { ToastContainer } from '@/components/ui/ToastContainer';

   function App() {
     return (
       <>
         <Routes />
         <ToastContainer /> {/* Fixed position, top-right */}
       </>
     );
   }
   ```

2. **Replace alert() calls with toasts**
   ```typescript
   // Before
   alert('County placed correctly!');

   // After
   const { success } = useToast();
   success('County placed correctly!');
   ```

3. **Add success/error feedback to game actions**
   ```typescript
   // CaliforniaGameContainer.tsx
   const handlePlacement = () => {
     if (isCorrect) {
       toast.success('Excellent! County placed correctly.');
     } else {
       toast.error('Not quite right. Try again!');
     }
   };
   ```

---

## 5. COMPLETION CRITERIA

### 5.1 Testing Checklist

#### Automated Tests
- [ ] **Touch Target Tests:** All interactive elements ≥ 44px on mobile
- [ ] **Toast Tests:** Add, remove, limit, auto-dismiss
- [ ] **Button State Tests:** Disabled contrast, focus-visible, loading
- [ ] **Label Consistency Tests:** All labels use constants

#### Manual Tests
- [ ] **Physical Device Testing:**
  - [ ] iPhone SE (smallest modern iPhone)
  - [ ] Android phone (e.g., Pixel)
  - [ ] Tablet (iPad)
- [ ] **Accessibility Testing:**
  - [ ] Keyboard navigation to all buttons
  - [ ] Screen reader announces toasts
  - [ ] Focus indicators visible
- [ ] **Visual QA:**
  - [ ] All button states look professional
  - [ ] Toast animations smooth
  - [ ] No layout shifts

### 5.2 Validation Criteria

#### Lighthouse Audits
- [ ] "Touch targets are sized appropriately" passes
- [ ] Accessibility score: 100
- [ ] No regressions in performance

#### WCAG Compliance
- [ ] 2.5.5 Target Size: Pass (Level AAA)
- [ ] 1.4.3 Contrast: Pass for disabled buttons
- [ ] 2.4.7 Focus Visible: Pass for all interactive elements

#### User Testing
- [ ] Users can easily tap buttons on mobile
- [ ] Toast notifications feel responsive and helpful
- [ ] Button labels are clear and action-oriented

### 5.3 Performance Metrics

- **Bundle Size Impact:** < 5KB (Toast system)
- **Animation Performance:** 60fps on mobile devices
- **Time to Interactive:** No regression (< 50ms added)

### 5.4 Documentation

- [ ] **Storybook:** Toast component with all variants
- [ ] **Storybook:** Button states documented
- [ ] **README:** Toast usage examples
- [ ] **CONTRIBUTING:** Touch target guidelines

### 5.5 Deployment Checklist

#### Pre-Deployment
- [ ] All tests pass
- [ ] Visual regression tests pass
- [ ] Manual device testing complete
- [ ] Code review approved

#### Post-Deployment
- [ ] Monitor error logs for toast issues
- [ ] Collect analytics on toast usage
- [ ] Monitor mobile tap accuracy
- [ ] User feedback survey

### 5.6 Success Metrics

**Quantitative:**
- Touch target compliance: 100%
- Button label consistency: 100%
- Toast notification coverage: All user actions
- Mobile tap accuracy: +30% (fewer misclicks)

**Qualitative:**
- Professional, polished appearance
- Clear, immediate feedback
- Improved mobile UX
- Better accessibility

---

## APPENDIX A: Component API

### Toast Hook API

```typescript
const { success, error, info, warning } = useToast();

// Usage
success('County placed correctly!');
error('Oops! Try again.');
info('Hint: Look for coastal counties.');
warning('Only 2 hints remaining.');
```

### Toast Store API

```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration: number; // milliseconds
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}
```

### Button Component API

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  onClick?: () => void;
}
```

---

## APPENDIX B: File Modification List

### Files to Create (4)
1. `/src/stores/toastStore.ts`
2. `/src/hooks/useToast.ts`
3. `/src/components/ui/Toast.tsx`
4. `/src/components/ui/ToastContainer.tsx`

### Files to Modify (15+)
1. `/src/components/ui/Button.tsx` - Touch targets, states
2. `/src/components/game/GameHeader.tsx` - Touch targets
3. `/src/components/county/CountyCard.tsx` - Touch targets
4. `/src/components/game/CaliforniaGameContainer.tsx` - Toast integration
5. `/src/constants/content.ts` - Button labels (NEW file)
6. All components with buttons (~10 files) - Label standardization

### Test Files to Create (2)
1. `/tests/ui/Toast.test.tsx`
2. `/tests/ui/Button.test.tsx`

---

**Estimated Completion:** 6 hours
**Risk Level:** LOW
**Impact:** HIGH (immediate UX polish)
**ROI:** 8/10 ⭐⭐⭐⭐
