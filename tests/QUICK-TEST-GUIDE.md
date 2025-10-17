# Quick Test Guide for Security Features

## 🎯 What Was Created

3 comprehensive test files with **133 total tests** covering all security features:

```
tests/
├── unit/
│   ├── components/
│   │   ├── security-features.test.tsx    (55 tests)
│   │   ├── export-data.test.tsx          (47 tests)
│   │   └── README-SECURITY-TESTS.md      (documentation)
│   └── services/
│       └── auth-functions.test.ts        (31 tests)
└── TEST-SUMMARY.md
```

## 🚀 Quick Start

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
# UserSettings & SecurityBadge
npm test tests/unit/components/security-features.test.tsx

# ExportData component
npm test tests/unit/components/export-data.test.tsx

# Auth service functions
npm test tests/unit/services/auth-functions.test.ts
```

### Run in Watch Mode
```bash
npm test -- --watch
```

### Run with Coverage
```bash
npm test -- --coverage
```

## 📋 Test Breakdown

### security-features.test.tsx (55 tests)

**UserSettings Component (36 tests)**
- 5 rendering tests
- 3 delete button tests
- 6 first confirmation dialog tests
- 5 final confirmation dialog tests
- 6 account deletion process tests
- 5 export data button tests
- 2 close button tests
- 4 accessibility tests

**SecurityBadge Component (19 tests)**
- 6 rendering tests (sizes, pulse animation)
- 4 tooltip tests (hover, focus, content)
- 5 modal tests (open, close, content)
- 2 responsive design tests
- 2 accessibility tests

### export-data.test.tsx (47 tests)

**ExportData Component**
- 5 rendering tests
- 4 data type selection tests
- 3 data fetching tests
- 3 file download tests
- 3 loading state tests
- 4 error handling tests
- 2 file size estimation tests
- 1 information section test
- 2 accessibility tests

### auth-functions.test.ts (31 tests)

**exportUserData() (11 tests)**
- Fetching all tables
- Structured JSON output
- Export metadata
- Error handling (network, Supabase errors)
- Edge cases (empty data, null values)
- Performance (parallel fetching)

**deleteUserAccount() (12 tests)**
- Deleting all user data
- Signing out user
- Clearing localStorage
- Error handling
- Partial failures
- Performance (parallel deletion)

**Edge Cases & Data Integrity (8 tests)**
- Large data exports
- Special characters
- Concurrent operations
- Timeout scenarios
- Data type preservation
- Null value handling

## ✅ What Each Test Validates

### UserSettings Tests
- ✅ Displays user info (ID, type, creation date)
- ✅ Opens delete confirmation dialog
- ✅ Requires typing "DELETE" exactly
- ✅ Shows loading states during operations
- ✅ Handles errors gracefully
- ✅ Announces to screen readers
- ✅ Redirects after successful deletion
- ✅ Exports data as JSON file
- ✅ Keyboard accessible

### SecurityBadge Tests
- ✅ Renders with shield icon
- ✅ Shows tooltip on hover
- ✅ Opens security information modal
- ✅ Supports multiple sizes (sm, md, lg)
- ✅ Pulse animation works
- ✅ Dark mode compatible
- ✅ Keyboard accessible
- ✅ Custom click handlers

### ExportData Tests
- ✅ Renders checkboxes for data types
- ✅ Fetches data from Supabase
- ✅ Creates downloadable JSON file
- ✅ Shows file size estimate
- ✅ Loading and success states
- ✅ Error handling and messages
- ✅ Validates at least one data type selected
- ✅ Accessible with ARIA labels

### Auth Functions Tests
- ✅ Fetches all user data tables
- ✅ Returns properly structured JSON
- ✅ Deletes all user data
- ✅ Signs out after deletion
- ✅ Clears localStorage
- ✅ Handles all error types
- ✅ Performs operations in parallel
- ✅ Handles edge cases

## 🔧 Troubleshooting

### Tests Fail with "Cannot find module"
The tests use `@/` path alias. If they fail:

1. Check `vite.config.ts` has proper alias:
```typescript
resolve: {
  alias: {
    '@': resolve(__dirname, 'src'),
  },
}
```

2. Check test setup includes alias resolution

### Mock-related Errors
Mocks are set up in `beforeEach` and cleared in `afterEach`. If you see stale mock data:
- Ensure `vi.clearAllMocks()` is called
- Check mock implementations are correct
- Verify mock return values match expected types

### Async Test Timeouts
Some tests use `waitFor()`. If they timeout:
- Check the condition in `waitFor()` is eventually true
- Increase timeout: `waitFor(() => {...}, { timeout: 5000 })`
- Check mock promises resolve/reject correctly

## 📊 Coverage Expectations

| Component/Service | Target Coverage | Tests |
|------------------|-----------------|-------|
| UserSettings     | >90%            | 36    |
| SecurityBadge    | >90%            | 19    |
| ExportData       | >90%            | 47    |
| exportUserData   | >95%            | 11    |
| deleteUserAccount| >95%            | 12    |

## 🎨 Test Patterns Used

### Component Testing
```typescript
it('should do something', async () => {
  const user = userEvent.setup();
  render(<Component />);
  
  const button = screen.getByRole('button');
  await user.click(button);
  
  await waitFor(() => {
    expect(screen.getByText('Result')).toBeInTheDocument();
  });
});
```

### Service Testing
```typescript
it('should call API', async () => {
  mockFunction.mockResolvedValue({ success: true });
  
  const result = await serviceFunction();
  
  expect(result.success).toBe(true);
  expect(mockFunction).toHaveBeenCalled();
});
```

### Error Testing
```typescript
it('should handle errors', async () => {
  mockFunction.mockRejectedValue(new Error('Failed'));
  
  const result = await serviceFunction();
  
  expect(result.success).toBe(false);
  expect(result.error).toContain('Failed');
});
```

## 📚 Resources

- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Docs](https://vitest.dev/)
- [User Event Docs](https://testing-library.com/docs/user-event/intro/)
- [ARIA Accessibility](https://www.w3.org/WAI/ARIA/apg/)

## 🎯 Next Actions

1. **Run the tests**: `npm test`
2. **Check coverage**: `npm test -- --coverage`
3. **Fix any failures** related to path aliases or mocks
4. **Review coverage report** to identify gaps
5. **Add E2E tests** for complete user flows
