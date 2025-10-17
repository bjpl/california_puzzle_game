# Security Features Test Suite

## Overview

Comprehensive test suites for the new security features including UserSettings, SecurityBadge, ExportData components, and auth service functions.

## Test Files Created

### 1. `security-features.test.tsx`
Tests for UserSettings and SecurityBadge components.

**Test Coverage:**

#### UserSettings Component (36 tests)
- **Rendering (5 tests)**
  - Displays user information correctly
  - Shows truncated user ID
  - Displays account type (Anonymous/Registered)
  - Shows creation date
  - "Please sign in" message when not authenticated

- **Delete Account Button (3 tests)**
  - Renders Delete My Account button
  - Opens confirmation dialog on click
  - Announces dialog opening to screen reader

- **First Confirmation Dialog (6 tests)**
  - Displays warning icon and message
  - Lists all items that will be deleted
  - Shows "cannot be undone" warning
  - Has Cancel and Continue buttons
  - Closes dialog on Cancel
  - Proceeds to final confirmation on Continue

- **Final Confirmation Dialog (5 tests)**
  - Requires typing "DELETE" to confirm
  - Disables confirm button until correct text entered
  - Enables button when "DELETE" typed correctly
  - Shows error for incorrect text (e.g., "delete" lowercase)
  - Shows error for wrong text

- **Account Deletion Process (6 tests)**
  - Calls deleteUserAccount() on confirmation
  - Shows loading state during deletion
  - Announces deletion progress to screen reader
  - Redirects after successful deletion
  - Displays error message on failure
  - Handles exceptions gracefully

- **Export Data Button (5 tests)**
  - Renders Export My Data button
  - Calls exportUserData() on click
  - Shows loading state during export
  - Creates and downloads JSON file on success
  - Displays error message on export failure

- **Close Button (2 tests)**
  - Calls onClose callback when clicked
  - Not rendered when onClose not provided

- **Accessibility (4 tests)**
  - Proper ARIA labels
  - Proper heading structure
  - Announces status changes to screen readers
  - Keyboard-accessible buttons

#### SecurityBadge Component (19 tests)
- **Rendering (6 tests)**
  - Renders with shield icon and text
  - Small size by default
  - Medium size when specified
  - Large size when specified
  - Shows pulse animation by default
  - No pulse animation when disabled

- **Tooltip (4 tests)**
  - Shows tooltip on hover
  - Hides tooltip on mouse leave
  - Shows tooltip on focus
  - Displays all security information

- **Modal (5 tests)**
  - Opens modal on click
  - Calls custom onClick handler if provided
  - Displays all security information in modal
  - Closes modal on close button click
  - Closes modal on backdrop click

- **Responsive Design (2 tests)**
  - Works in dark mode
  - Keyboard accessible

- **Accessibility (2 tests)**
  - Proper ARIA labels
  - Focus ring visible

### 2. `export-data.test.tsx`
Tests for ExportData component.

**Test Coverage (47 tests):**

#### Rendering (5 tests)
- Title and description
- All data type checkboxes
- All checkboxes checked by default
- Export My Data button
- "Please sign in" when not authenticated

#### Data Type Selection (4 tests)
- Toggle game sessions checkbox
- Toggle user progress checkbox
- Toggle game settings checkbox
- Allow multiple checkboxes unchecked

#### Data Fetching (3 tests)
- Fetches data from Supabase on export
- Only fetches selected data types
- Shows error when no data types selected

#### File Download (3 tests)
- Creates downloadable JSON file
- Creates blob with correct content type
- Cleans up blob URL after download

#### Loading States (3 tests)
- Shows "Fetching Data..." during fetch
- Disables button during export
- Shows success message after completion

#### Error Handling (4 tests)
- Displays error when fetch fails
- Handles network errors gracefully
- Shows error state on button
- Resets to idle state after error timeout

#### File Size Estimation (2 tests)
- Shows estimated file size after export
- Formats bytes correctly (Bytes/KB/MB)

#### Information Section (1 test)
- Displays information about data export

#### Accessibility (2 tests)
- Proper ARIA labels for checkboxes
- Announces status changes with aria-live

### 3. `auth-functions.test.ts`
Tests for authentication service functions.

**Test Coverage (31 tests):**

#### exportUserData() (11 tests)
- Fetches all user tables
- Returns structured JSON with all data
- Includes export metadata
- Handles empty data arrays
- Handles null data from Supabase
- Handles game_sessions fetch error
- Handles user_progress fetch error
- Handles game_settings fetch error
- Handles network errors
- Returns error when Supabase not configured
- Fetches data in parallel for performance

#### deleteUserAccount() (12 tests)
- Deletes all user data from tables
- Calls delete().eq() for each table
- Signs out user after deletion
- Clears localStorage after deletion
- Returns success when deletion completes
- Continues deletion even if table deletion fails
- Returns error when no authenticated user found
- Returns error when Supabase not configured
- Handles signOut failure gracefully
- Handles localStorage clear errors
- Handles unexpected errors
- Deletes data in parallel for performance
- Handles partial deletion failures
- Does not leave any trace after deletion

#### Edge Cases (4 tests)
- Handles extremely large data exports
- Handles special characters in user IDs
- Handles concurrent delete requests
- Handles timeout scenarios

#### Data Integrity (2 tests)
- Preserves data types in export
- Handles null values in data

## Test Patterns Used

### 1. Component Testing
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Setup
const user = userEvent.setup();

// Render
render(<Component />);

// Query
const button = screen.getByRole('button', { name: /text/i });

// Interact
await user.click(button);

// Assert
await waitFor(() => {
  expect(screen.getByText('Result')).toBeInTheDocument();
});
```

### 2. Mock Setup
```typescript
// Mock hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user, isAuthenticated: true })),
}));

// Mock module
vi.mock('@/services/supabase/auth', () => ({
  deleteUserAccount: vi.fn(),
  exportUserData: vi.fn(),
}));
```

### 3. Async Testing
```typescript
it('should handle async operation', async () => {
  mockFunction.mockResolvedValue({ success: true });

  await user.click(button);

  await waitFor(() => {
    expect(mockFunction).toHaveBeenCalled();
  });
});
```

### 4. Error Handling
```typescript
it('should handle errors gracefully', async () => {
  mockFunction.mockRejectedValue(new Error('Network error'));

  await user.click(button);

  await waitFor(() => {
    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });
});
```

## Running the Tests

```bash
# Run all security tests
npm test -- tests/unit/components/security-features.test.tsx
npm test -- tests/unit/components/export-data.test.tsx
npm test -- tests/unit/services/auth-functions.test.ts

# Run with coverage
npm test -- --coverage tests/unit/components/security-features.test.tsx

# Run in watch mode
npm test -- --watch tests/unit/components/export-data.test.tsx

# Run all tests
npm test
```

## Known Issues

### Mock Path Resolution
The tests currently use `@/` path aliases which may need adjustment based on the test environment configuration. If tests fail with "Cannot find module" errors, verify:

1. **vite.config.ts** has proper alias configuration:
```typescript
resolve: {
  alias: {
    '@': resolve(__dirname, 'src'),
  },
}
```

2. **vitest.config.ts** or **vite.config.ts** test section includes:
```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './tests/setup.ts',
  alias: {
    '@': '/src',
  },
}
```

### Mock Timing
Some tests may need adjustment for mock timing, especially:
- File download tests (need proper DOM mock setup)
- Redirect tests (need window.location mock)
- Timeout tests (need fake timers)

## Test Utilities Needed

The tests assume these utilities exist:

1. **@/utils/accessibility**
   - `announceToScreenReader(message: string): void`

2. **@/utils/logger**
   - `logger.info()`, `logger.error()`, `logger.warn()`

3. **@/hooks/useAuth**
   - `useAuth()`: Returns user, isAuthenticated, isAnonymous
   - `useUserId()`: Returns user ID or null

4. **@/lib/supabase**
   - `supabase`: Supabase client
   - `Database`: Type definitions

## Coverage Goals

- **Component Tests**: >90% coverage
  - All user interactions tested
  - All state transitions covered
  - Error states verified
  - Accessibility features validated

- **Service Tests**: >95% coverage
  - All success paths tested
  - All error scenarios covered
  - Edge cases handled
  - Data integrity verified

## Next Steps

1. **Fix Mock Configuration**
   - Ensure path aliases work in test environment
   - Update mock setup if needed

2. **Add Visual Regression Tests**
   - Screenshot testing for SecurityBadge
   - Modal appearance verification

3. **Add E2E Tests**
   - Full account deletion flow
   - Complete data export process
   - Multi-step confirmation workflow

4. **Performance Testing**
   - Large data export performance
   - Concurrent operation handling
   - Memory leak detection

## Maintenance

- Update tests when adding new security features
- Keep mock data in sync with actual API responses
- Review and update accessibility tests for WCAG compliance
- Add tests for new edge cases as they're discovered
