# California Counties Puzzle - Testing Suite

This comprehensive testing suite ensures the reliability, performance, and accessibility of the California Counties Puzzle game.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Categories](#test-categories)
- [Writing Tests](#writing-tests)
- [Performance Benchmarks](#performance-benchmarks)
- [Accessibility Testing](#accessibility-testing)
- [Best Practices](#best-practices)

## Overview

The testing suite covers:

- **Unit Tests**: Individual components and functions
- **Integration Tests**: Full game flow and component interactions
- **Accessibility Tests**: Keyboard navigation and screen reader compatibility
- **Performance Tests**: Rendering benchmarks and memory usage
- **Data Integrity Tests**: Geographic data validation

## Test Structure

```
tests/
├── setup.ts                 # Global test setup
├── a11y-setup.ts            # Accessibility test setup
├── fixtures/                # Test data and mocks
│   ├── index.ts
│   └── california-counties-test-data.ts
├── mocks/                   # Mock implementations
│   ├── d3-mocks.ts
│   └── react-dnd-mocks.ts
├── unit/                    # Unit tests
│   ├── components/
│   ├── data/
│   ├── game/
│   └── state/
├── integration/             # Integration tests
│   └── full-game-flow.test.tsx
├── accessibility/           # Accessibility tests
│   ├── keyboard-navigation.test.tsx
│   └── screen-reader-compatibility.test.tsx
├── performance/             # Performance tests
│   ├── rendering-benchmarks.test.ts
│   └── memory-usage.test.ts
└── utils/                   # Test utilities
    └── test-helpers.ts
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Specific Test Categories

```bash
# Run accessibility tests
npm run test:accessibility

# Run integration tests
npm run test:integration

# Run performance tests
npm run test:performance
```

### Coverage Thresholds

The project maintains high coverage standards:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Test Categories

### Unit Tests

#### Data Integrity Tests
- County data structure validation
- Geographic coordinate verification
- FIPS code validation
- Geometry validation

#### Component Tests
- Map rendering accuracy
- Drag-and-drop mechanics
- County selection and placement
- Game controls functionality

#### Game Logic Tests
- Scoring algorithms
- State management
- Timer functionality
- Hint system

### Integration Tests

#### Full Game Flow
- Complete gameplay scenarios
- Multi-mode transitions
- Error handling
- Game completion

### Accessibility Tests

#### Keyboard Navigation
- Tab order validation
- Arrow key navigation
- Enter/Space key interactions
- Escape key functionality

#### Screen Reader Compatibility
- ARIA labels and descriptions
- Live regions for announcements
- Semantic structure
- Focus management

### Performance Tests

#### Rendering Benchmarks
- Component render times
- Frame rate monitoring
- Large dataset handling
- Animation performance

#### Memory Usage
- Memory leak detection
- Component lifecycle monitoring
- Large dataset efficiency
- Garbage collection validation

## Writing Tests

### Test Structure

Follow this structure for consistent tests:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Feature Group', () => {
    it('should behave correctly', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<ComponentName />);

      // Assert
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
```

### Using Test Helpers

```typescript
import { customRender, generateMockCounties } from '../utils/test-helpers';

// Use custom render with providers
customRender(<Component />, {
  withRouter: true,
  withDndProvider: true,
});

// Generate test data
const mockCounties = generateMockCounties(5);
```

### Mock Usage

```typescript
// Import mocks
import '../mocks/d3-mocks';
import '../mocks/react-dnd-mocks';

// Use mock data
import { MOCK_CALIFORNIA_COUNTIES } from '../fixtures';
```

## Performance Benchmarks

### Render Time Targets

- **Initial Render**: < 100ms
- **State Updates**: < 16ms (60fps)
- **Large Datasets**: < 500ms

### Memory Usage Targets

- **Normal Operation**: < 50MB
- **Large Datasets**: < 100MB
- **Memory Leaks**: < 1MB growth per operation

### Example Performance Test

```typescript
it('should render within performance targets', async () => {
  const start = performance.now();

  render(<MapComponent counties={largeDataset} />);

  const end = performance.now();
  expect(end - start).toBeLessThan(100);
});
```

## Accessibility Testing

### Keyboard Navigation Tests

```typescript
it('should support keyboard navigation', async () => {
  const user = userEvent.setup();
  render(<GameComponent />);

  // Test tab order
  await user.tab();
  expect(screen.getByTestId('first-focusable')).toHaveFocus();

  // Test arrow key navigation
  await user.keyboard('{ArrowDown}');
  expect(screen.getByTestId('next-item')).toHaveFocus();
});
```

### Screen Reader Tests

```typescript
it('should announce state changes', async () => {
  render(<GameComponent />);

  // Trigger state change
  await user.click(screen.getByRole('button'));

  // Check live region
  await waitFor(() => {
    const liveRegion = screen.getByTestId('announcements');
    expect(liveRegion).toHaveTextContent(/County selected/);
  });
});
```

### Axe Integration

```typescript
import { axe } from '../a11y-setup';

it('should pass axe accessibility tests', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Best Practices

### Test Organization

1. **Group Related Tests**: Use `describe` blocks to organize related functionality
2. **Clear Test Names**: Use descriptive test names that explain the expected behavior
3. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification phases

### Mock Management

1. **Minimal Mocking**: Only mock what's necessary for the test
2. **Consistent Mocks**: Use shared mock implementations across tests
3. **Clear Cleanup**: Always clean up mocks in `beforeEach` or `afterEach`

### Performance Testing

1. **Realistic Data**: Use realistic data sizes for performance tests
2. **Multiple Runs**: Average results across multiple test runs
3. **Environment Consistency**: Run performance tests in consistent environments

### Accessibility Testing

1. **Real User Scenarios**: Test actual user workflows, not just technical compliance
2. **Multiple Input Methods**: Test both mouse and keyboard interactions
3. **Screen Reader Testing**: Verify actual screen reader announcements

### Coverage Goals

1. **Focus on Critical Paths**: Prioritize testing of critical user journeys
2. **Edge Cases**: Test error conditions and boundary cases
3. **Integration Points**: Ensure component interactions are well tested

## Debugging Tests

### Common Issues

1. **Async Operations**: Use `waitFor` for async state changes
2. **Mock Timing**: Ensure mocks are set up before components render
3. **DOM Cleanup**: Use proper cleanup to avoid test interference

### Debug Tools

```typescript
// Debug rendered output
screen.debug();

// Find elements
screen.logTestingPlaygroundURL();

// Check queries
screen.getByRole('button', { name: /submit/i });
```

## CI/CD Integration

Tests are automatically run on:

- **Pull Requests**: Full test suite with coverage reporting
- **Main Branch**: Performance regression detection
- **Releases**: Complete test suite including accessibility audits

### Coverage Reports

Coverage reports are generated and uploaded to track:

- Line coverage trends
- Branch coverage
- Function coverage
- File-by-file breakdown

## Contributing

When adding new features:

1. **Write Tests First**: Use TDD approach when possible
2. **Maintain Coverage**: Ensure new code meets coverage thresholds
3. **Update Documentation**: Update test documentation for new patterns
4. **Performance Impact**: Consider performance implications of new features

For questions or issues with the testing suite, please refer to the project maintainers or create an issue in the repository.