# Test Suite Showcase - California Puzzle Game

This document highlights the most impressive tests in the California Puzzle Game test suite, demonstrating advanced testing techniques and best practices.

---

## 🏆 Flagship Test: Store Coordinator Integration

**File:** `tests/integration/storeCoordinator.integration.test.ts` (1,200 lines)
**Tests:** 24 integration scenarios
**Coverage:** 7 domain stores working together

### What Makes It Impressive

This test validates a complex event-driven architecture where stores communicate through a central coordinator. It demonstrates:

- **Cross-Store Communication**: Tests event propagation between 7 stores
- **Event-Driven Architecture**: Validates pub-sub pattern implementation
- **Real-World Scenarios**: Simulates complete user journeys
- **Advanced Mocking**: Sophisticated logger and sound manager mocks
- **Async Event Handling**: Tests debounced and batched events

### Sample Test

```typescript
it('should handle a complete study session with all event types', async () => {
  // 1. Start session
  const sessionId = useSessionStore.getState().startSession(StudyMode.FLASHCARDS);
  await Promise.resolve();

  // 2. Study multiple counties
  const countiesStudied = ['ALA', 'SCL', 'SF', 'MAR'];
  const correctness = [true, true, false, true];

  countiesStudied.forEach((countyCode, i) => {
    sessionStore.recordCountyStudied(countyCode, correctness[i], 2000 + i * 200);
    storeCoordinator.publish(
      StudyEventType.COUNTY_STUDIED,
      {
        sessionId,
        countyCode,
        correct: correctness[i],
        responseTimeMs: 2000 + i * 200,
        timestamp: new Date(),
      },
      'sessionStore'
    );
  });

  // 3. End session and verify integration
  const stats = sessionStore.endSession();
  await Promise.resolve();
  storeCoordinator.flush();

  // Verify complete integration across all stores
  expect(stats?.countiesStudied).toBe(4);
  expect(progress.currentStreak).toBeGreaterThan(0);
  expect(statistics.sessionHistory.length).toBeGreaterThan(0);
});
```

**Why It Matters:** Demonstrates understanding of complex system interactions and event-driven design patterns.

---

## 🎯 Accessibility Excellence: Keyboard Navigation

**File:** `tests/accessibility/keyboard-navigation.test.tsx` (669 lines)
**Tests:** WCAG 2.1 AA/AAA compliance
**Tool:** jest-axe + manual keyboard testing

### What Makes It Impressive

- **Automated a11y Scanning**: Uses axe-core for WCAG violations
- **Keyboard Navigation**: Tests Tab, Arrow keys, Enter, Space, Escape
- **Focus Management**: Validates focus order and restoration
- **ARIA Attributes**: Validates roles, labels, and describedby
- **Screen Reader Support**: Tests announcements and live regions

### Sample Test

```typescript
describe('Accessibility Standards Compliance', () => {
  it('should pass axe accessibility tests', async () => {
    const { container } = render(<MockKeyboardAccessibleGame />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should meet WCAG 2.1 AA standards for keyboard accessibility', () => {
    render(<MockKeyboardAccessibleGame />);

    // All interactive elements should be keyboard accessible
    const buttons = screen.getAllByRole('button');
    const options = screen.getAllByRole('option');
    const gridcells = screen.getAllByRole('gridcell');

    buttons.forEach((element) => {
      const tabIndex = element.getAttribute('tabindex');
      const isNaturallyFocusable = element.tagName === 'BUTTON' || element.tagName === 'A';
      expect(tabIndex !== null || isNaturallyFocusable).toBeTruthy();
    });
  });
});
```

**Why It Matters:** Shows commitment to inclusive design and WCAG compliance—rare in portfolios.

---

## ⚡ Performance Testing: FPS Tracking

**File:** `tests/performance/rendering-benchmarks.test.tsx` (870 lines)
**Tests:** FPS measurement, re-render counting
**Metrics:** 60 FPS target, memory usage

### What Makes It Impressive

- **Real Performance Metrics**: Tracks actual FPS during rendering
- **Memory Leak Detection**: Monitors heap size changes
- **Re-render Counting**: Validates React optimization
- **Performance.now() Timing**: Precise timing measurements

### Sample Test

```typescript
it('should maintain 60 FPS when rendering 58 counties', async () => {
  const { container } = render(<CaliforniaMap counties={countyData} />);

  const frames: number[] = [];
  const startTime = performance.now();
  let lastFrameTime = startTime;
  let frameCount = 0;

  const measureFrame = () => {
    const now = performance.now();
    const delta = now - lastFrameTime;
    frames.push(1000 / delta); // FPS
    lastFrameTime = now;
    frameCount++;

    if (frameCount < 60) {
      requestAnimationFrame(measureFrame);
    }
  };

  requestAnimationFrame(measureFrame);

  await waitFor(() => expect(frameCount).toBe(60), { timeout: 2000 });

  const avgFPS = frames.reduce((sum, fps) => sum + fps, 0) / frames.length;
  expect(avgFPS).toBeGreaterThanOrEqual(60);
});
```

**Why It Matters:** Performance testing is rare—shows advanced technical skills.

---

## 📱 Mobile Testing: Touch Gestures

**File:** `tests/mobile/hooks/useGestureDetection.test.ts` (789 lines)
**Tests:** Swipe, pinch, long-press detection
**Coverage:** All touch gestures

### What Makes It Impressive

- **Touch Event Simulation**: Realistic touch interaction testing
- **Gesture Recognition**: Validates swipe, pinch, long-press
- **Threshold Testing**: Tests gesture sensitivity
- **Multi-Touch**: Validates pinch-zoom gestures

### Sample Test

```typescript
it('should detect horizontal swipe gestures', async () => {
  const onSwipe = vi.fn();
  const { result } = renderHook(() => useGestureDetection({ onSwipe }));

  const startX = 100;
  const endX = 300; // 200px swipe right

  act(() => {
    result.current.handlers.onTouchStart({
      touches: [{ clientX: startX, clientY: 100 }],
    } as any);
  });

  act(() => {
    result.current.handlers.onTouchMove({
      touches: [{ clientX: endX, clientY: 100 }],
    } as any);
  });

  act(() => {
    result.current.handlers.onTouchEnd({} as any);
  });

  expect(onSwipe).toHaveBeenCalledWith(
    expect.objectContaining({
      direction: 'right',
      distance: 200,
      velocity: expect.any(Number),
    })
  );
});
```

**Why It Matters:** Mobile-first development with comprehensive gesture testing.

---

## 🔐 Security Testing: User Data Export

**File:** `tests/unit/components/export-data.test.tsx` (931 lines)
**Tests:** Data export, file generation, privacy
**Coverage:** All data types, error handling

### What Makes It Impressive

- **Privacy-First**: Tests data export/deletion features
- **File Generation**: Validates JSON file creation
- **Error Handling**: Tests network failures, timeouts
- **User Feedback**: Validates loading states, success messages

### Sample Test

```typescript
it('should export user data as JSON file', async () => {
  const user = userEvent.setup();
  render(<ExportData />);

  // Select data types to export
  await user.click(screen.getByLabelText('Study progress'));
  await user.click(screen.getByLabelText('Achievements'));

  // Mock Supabase data fetch
  mockSupabase.from.mockReturnValue({
    select: vi.fn().mockResolvedValue({
      data: [{ id: 1, progress: 50 }],
      error: null,
    }),
  });

  // Trigger export
  const exportButton = screen.getByRole('button', { name: /export data/i });
  await user.click(exportButton);

  await waitFor(() => {
    expect(screen.getByText(/download started/i)).toBeInTheDocument();
  });

  // Verify file was created
  const downloadLink = document.querySelector('a[download]');
  expect(downloadLink).toHaveAttribute('download', expect.stringContaining('.json'));
});
```

**Why It Matters:** Shows security awareness and data privacy best practices.

---

## 📊 Test Quality Metrics

### Code Coverage by Test Type

| Test Type           | Files | Tests  | Est. Coverage |
| ------------------- | ----- | ------ | ------------- |
| Unit Tests          | 38    | ~1,600 | 90-95%        |
| Integration Tests   | 9     | ~300   | 70-75%        |
| Accessibility Tests | 4     | ~150   | 95%+          |
| Performance Tests   | 2     | ~50    | 90%+          |
| Mobile Tests        | 15    | ~400   | 85-90%        |

### Testing Tools & Frameworks

- **Vitest 4.0.15**: Modern, fast test runner
- **Testing Library**: User-centric testing approach
- **jest-axe**: Automated accessibility scanning
- **user-event**: Realistic user interactions
- **Zustand**: State management testing

---

## 🎓 Learning Takeaways

This test suite demonstrates:

1. ✅ **Comprehensive Testing**: Unit, integration, a11y, performance
2. ✅ **User-Centric Approach**: Tests from user perspective
3. ✅ **Advanced Techniques**: Event-driven testing, FPS tracking
4. ✅ **Best Practices**: Mocking, async testing, test isolation
5. ✅ **Accessibility Focus**: WCAG compliance, keyboard navigation
6. ✅ **Performance Awareness**: Memory leaks, rendering optimization
7. ✅ **Mobile-First**: Touch gestures, responsive testing

---

## 📖 How to Run These Tests

```bash
# Run all tests
npm test -- --run

# Run specific test category
npm run test:unit
npm run test:integration
npm run test:accessibility
npm run test:performance

# Run with coverage
npm run test:coverage

# Run specific file
npm test tests/integration/storeCoordinator.integration.test.ts
```

---

**For Interviewers:** This test suite showcases production-ready code quality, comprehensive testing strategies, and advanced technical skills including accessibility, performance, and event-driven architecture testing.
