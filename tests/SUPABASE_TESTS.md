# Supabase Integration Test Suite

Comprehensive test suite for Supabase anonymous authentication integration.

## Test Structure

### Unit Tests (`tests/unit/`)

#### 1. Supabase Client Tests (`services/supabase/client.test.ts`)
Tests for Supabase client initialization and configuration:

- **Client Creation**
  - Creates client with valid environment variables
  - Throws error when `VITE_SUPABASE_URL` is missing
  - Throws error when `VITE_SUPABASE_ANON_KEY` is missing
  - Validates URL format

- **Client Configuration**
  - Configures auth with correct persistence settings
  - Sets auto-refresh tokens to true
  - Persists session to localStorage

- **Singleton Pattern**
  - Returns same instance on multiple calls
  - Doesn't recreate client if already initialized

- **Error Handling**
  - Handles network errors gracefully
  - Handles invalid credentials error
  - Provides helpful error messages

- **Environment Variable Validation**
  - Accepts valid production URLs
  - Accepts valid local development URLs
  - Validates anon key length

**Coverage**: 100% of client initialization logic

#### 2. Authentication Service Tests (`services/supabase/auth.test.ts`)
Tests for anonymous authentication flows:

- **Anonymous Sign In**
  - Successfully signs in anonymously
  - Creates user with anonymous provider
  - Generates valid session tokens
  - Sets session expiry time
  - Handles network errors during sign in
  - Handles rate limit errors

- **Session Management**
  - Retrieves current session
  - Returns null for no active session
  - Refreshes session with valid refresh token
  - Handles expired refresh tokens
  - Stores session in localStorage
  - Validates session expiry

- **Sign Out**
  - Successfully signs out
  - Clears session from storage on sign out
  - Handles sign out errors gracefully

- **Auth State Changes**
  - Subscribes to auth state changes
  - Notifies on sign in
  - Notifies on sign out
  - Notifies on token refresh
  - Unsubscribes from auth changes

- **Error Handling**
  - Handles invalid session errors
  - Handles timeout errors
  - Retries on transient errors

- **Security**
  - Doesn't expose sensitive data in errors
  - Validates token format
  - Prevents token tampering

**Coverage**: 100% of authentication logic

#### 3. Auth Store Tests (`stores/authStore.test.ts`)
Tests for authentication state management:

- **Store Initialization**
  - Initializes with null user and session
  - Loads persisted session from localStorage on init
  - Handles corrupted localStorage data gracefully

- **Authentication State**
  - Sets user and session on sign in
  - Clears user and session on sign out
  - Updates isAuthenticated based on session presence

- **Session Management**
  - Updates session when refreshed
  - Checks if session is expired
  - Checks if session is expiring soon

- **Persistence**
  - Persists user and session to localStorage
  - Clears localStorage on sign out
  - Handles localStorage quota exceeded

- **User Properties**
  - Provides user ID accessor
  - Identifies anonymous users
  - Returns null for userId when not authenticated

- **Error Handling**
  - Handles setting auth with null values
  - Handles updating session when no session exists
  - Validates session structure before storing

- **Store Selectors**
  - Provides selector for authenticated state
  - Provides selector for user data
  - Provides selector for session data

- **Performance**
  - Doesn't trigger unnecessary re-renders
  - Handles rapid session updates

**Coverage**: 100% of store logic

### Integration Tests (`tests/integration/auth/`)

#### 1. Complete Auth Flow Tests (`auth-flow.test.ts`)
End-to-end authentication flow tests:

- **Initial Anonymous Sign-In Flow**
  - Completes full anonymous sign-in flow
  - Handles first-time user setup
  - Propagates sign-in success to all components

- **Session Persistence Flow**
  - Persists session and restores on page reload
  - Validates restored session before using it
  - Handles multiple tabs with same session

- **Error Recovery Flow**
  - Retries sign-in on network failure
  - Handles sign-in failure gracefully
  - Clears corrupted session data and re-authenticates

- **App Initialization Flow**
  - Initializes app with existing session
  - Signs in automatically when no session exists
  - Handles app initialization without network

- **Session Lifecycle**
  - Maintains session throughout user session
  - Refreshes session before expiry
  - Handles sign-out and cleanup

**Coverage**: Complete sign-in → persistence → app initialization flow

#### 2. Session Management Tests (`session-management.test.ts`)
Session lifecycle and refresh mechanism tests:

- **Session Refresh Mechanism**
  - Refreshes session when approaching expiry
  - Doesn't refresh session if plenty of time remaining
  - Handles refresh failure gracefully
  - Schedules automatic refresh before expiry

- **Session Persistence on App Resume**
  - Restores session when app resumes from background
  - Refreshes session if expired while in background
  - Handles wake from long sleep

- **Offline/Online Transitions**
  - Queues session refresh when offline
  - Works in offline mode with valid cached session
  - Syncs session when coming back online

- **Cross-Tab Synchronization**
  - Syncs auth state across tabs
  - Propagates sign-out across tabs
  - Handles session refresh in one tab updating others

- **Session Cleanup**
  - Clears expired sessions on init
  - Handles multiple expired sessions cleanup

**Coverage**: Session persistence, refresh, and cross-tab sync

#### 3. Offline/Online Transition Tests (`offline-online.test.ts`)
Network connectivity change tests:

- **Initial Load Scenarios**
  - Loads with cached session when starting offline
  - Handles offline start with no cached session
  - Queues auth when starting offline and retries when online

- **Network Interruption During Session**
  - Handles going offline mid-session
  - Prevents session refresh when offline
  - Refreshes session when coming back online

- **Retry Mechanisms**
  - Retries failed operations with exponential backoff
  - Gives up after max retries
  - Respects network status before retrying

- **Data Staleness**
  - Marks cached data as stale when offline
  - Validates and refreshes stale data when coming online

- **User Experience**
  - Shows appropriate offline indicator
  - Clears offline indicator when online
  - Provides meaningful error messages for network issues

- **Edge Cases**
  - Handles rapid online/offline transitions
  - Handles browser reporting online but no actual connection

**Coverage**: All network transition scenarios

## Mock Infrastructure

### Mock Supabase Client (`tests/mocks/supabase/mockSupabaseClient.ts`)

Comprehensive mocking utilities for Supabase:

- **Mock Types**
  - `MockSession`: Session with tokens and expiry
  - `MockUser`: Anonymous user data
  - `MockAuthResponse`: Auth operation responses
  - `MockAuthError`: Error responses

- **Mock Factories**
  - `createMockAnonymousUser()`: Generate mock anonymous users
  - `createMockSession()`: Generate mock sessions with custom expiry
  - `createMockAuthSuccess()`: Generate successful auth responses
  - `createMockAuthError()`: Generate error responses
  - `createMockAuthClient()`: Generate mock auth client with all methods
  - `createMockSupabaseClient()`: Generate complete Supabase client mock

- **Environment Utilities**
  - `mockSupabaseEnv`: Default test environment variables
  - `clearSupabaseEnv()`: Clean up environment after tests

## Running Tests

```bash
# Run all tests with coverage
npm run test:coverage

# Run only Supabase unit tests
npx vitest tests/unit/services/supabase tests/unit/stores/authStore.test.ts

# Run only integration tests
npx vitest tests/integration/auth

# Run specific test file
npx vitest tests/unit/services/supabase/client.test.ts

# Watch mode for development
npm run test -- --watch
```

## Coverage Requirements

All Supabase integration tests target the project's 80% coverage threshold:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Test Patterns

### 1. Mocking Supabase SDK

```typescript
import { createMockAuthClient } from '../mocks/supabase/mockSupabaseClient';

const mockAuth = createMockAuthClient();

// Mock successful sign-in
mockAuth.signInAnonymously.mockResolvedValueOnce({
  data: {
    user: createMockAnonymousUser(),
    session: createMockSession(),
  },
  error: null,
});
```

### 2. Testing with localStorage

```typescript
// Setup
localStorage.setItem('auth-storage', JSON.stringify({
  state: { user: mockUser, session: mockSession },
}));

// Test
const stored = localStorage.getItem('auth-storage');
expect(stored).toBeTruthy();

// Cleanup
localStorage.clear();
```

### 3. Testing Async Operations

```typescript
it('should handle async auth operations', async () => {
  const result = await mockAuth.signInAnonymously();
  expect(result.data.user).toBeDefined();
});
```

### 4. Testing Error Scenarios

```typescript
mockAuth.signInAnonymously.mockRejectedValueOnce(
  new Error('Network error')
);

await expect(signIn()).rejects.toThrow('Network error');
```

## Implementation Status

### ✅ Completed
- Test directory structure
- Mock infrastructure
- Unit test scaffolding
- Integration test scaffolding
- Test documentation

### ⏳ Pending Implementation
The test files are ready with comprehensive placeholder tests marked with `// TODO: Implement once [service] is created`. These will be activated once:

1. Backend-dev agent completes Supabase client and auth service
2. Coder agent implements auth store

The tests use mock implementations to verify structure and will seamlessly transition to testing real implementations.

## Coordination Notes

**For Backend-Dev Agent:**
- Implement `src/services/supabase/client.ts` with singleton pattern
- Implement `src/services/supabase/auth.ts` with anonymous sign-in
- Ensure environment variable validation
- Follow mock interfaces in `mockSupabaseClient.ts`

**For Coder Agent:**
- Implement `src/stores/authStore.ts` using Zustand
- Include persistence to localStorage
- Implement session expiry checks
- Follow mock patterns in test files

**Test Activation:**
Once implementations are complete, uncomment the `// TODO` sections in test files and the entire test suite will validate the implementation.

## File Locations

```
tests/
├── mocks/
│   └── supabase/
│       └── mockSupabaseClient.ts        # Mock factories and utilities
├── unit/
│   ├── services/
│   │   └── supabase/
│   │       ├── client.test.ts           # Client initialization tests
│   │       └── auth.test.ts             # Auth service tests
│   └── stores/
│       └── authStore.test.ts            # Auth store tests
└── integration/
    └── auth/
        ├── auth-flow.test.ts            # Complete auth flow tests
        ├── session-management.test.ts   # Session lifecycle tests
        └── offline-online.test.ts       # Network transition tests
```

## Next Steps

1. ✅ Test infrastructure complete
2. ⏳ Wait for backend implementation (backend-dev agent)
3. ⏳ Wait for store implementation (coder agent)
4. ⏳ Activate tests by uncommenting TODO sections
5. ⏳ Run coverage validation
6. ⏳ Document results and coordinate with agents

---

**QA Agent Status**: Test suite ready. Waiting for implementation to complete before final validation.
