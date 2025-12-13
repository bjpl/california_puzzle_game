# Sync Status UI Components

Comprehensive UI components for displaying data synchronization status to users.

## Components

### 1. SyncStatusIndicator

Full-featured sync status indicator with icon, tooltip, and detailed modal.

**Features:**

- Real-time status updates (synced, syncing, offline, error)
- Interactive tooltip on hover/focus
- Click to open detailed modal with error info
- Shows pending operations count as badge
- Manual sync trigger
- Fully accessible (ARIA labels, keyboard navigation)

**Usage:**

```tsx
import { SyncStatusIndicator } from '@/components/sync';

// Basic usage
<SyncStatusIndicator />

// With label
<SyncStatusIndicator showLabel />

// Compact mode
<SyncStatusIndicator compact />

// Custom styling
<SyncStatusIndicator className="ml-4" />
```

**Integration Examples:**

```tsx
// In a header component
import { SyncStatusIndicator } from '@/components/sync';

export const AppHeader = () => {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>California Counties Puzzle</h1>
      <div className="flex items-center gap-4">
        <SyncStatusIndicator showLabel />
        {/* other header items */}
      </div>
    </header>
  );
};
```

### 2. SyncStatusBadge

Minimal badge-style indicator for constrained spaces.

**Features:**

- Compact design
- Color-coded status
- Optional auto-hide when idle
- Click handler support

**Usage:**

```tsx
import { SyncStatusBadge } from '@/components/sync';

// Basic usage
<SyncStatusBadge />

// Hide when synced
<SyncStatusBadge hideWhenIdle />

// Custom click handler
<SyncStatusBadge onClick={() => console.log('clicked')} />
```

### 3. useSyncStatus Hook

React hook for custom sync status integrations.

**Features:**

- Real-time status updates
- Queue size monitoring
- Online/offline detection
- Manual sync trigger
- Error management

**Usage:**

```tsx
import { useSyncStatus } from '@/components/sync';

const MyComponent = () => {
  const { status, queueSize, isOnline, isSyncing, lastError, syncAll, clearError } =
    useSyncStatus();

  return (
    <div>
      <p>Status: {status}</p>
      <p>Pending: {queueSize}</p>
      <p>Online: {isOnline ? 'Yes' : 'No'}</p>
      {lastError && (
        <div className="error">
          {lastError.message}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
      <button onClick={syncAll} disabled={isSyncing}>
        Sync Now
      </button>
    </div>
  );
};
```

## UI States

### Synced (Idle)

- **Icon:** Green checkmark
- **Color:** Green
- **Meaning:** All changes synchronized
- **User Action:** None needed

### Syncing

- **Icon:** Blue spinning arrows
- **Color:** Blue
- **Meaning:** Currently syncing data
- **User Action:** Wait for completion

### Offline

- **Icon:** Yellow warning triangle
- **Color:** Yellow
- **Meaning:** Device offline, changes queued
- **User Action:** Reconnect to sync
- **Note:** Changes saved locally

### Error

- **Icon:** Red X
- **Color:** Red
- **Meaning:** Sync failed
- **User Action:** Click for details, retry sync
- **Details:** Error message shown in modal

## Integration Points

### Recommended Locations

1. **App Header** (Most visible)
   - Use `SyncStatusIndicator` with label
   - Good for desktop views

2. **Settings Panel**
   - Use `SyncStatusIndicator` with full details
   - Shows queue size and error info

3. **Mobile Header** (Space-constrained)
   - Use `SyncStatusBadge` compact mode
   - Auto-hide when idle

4. **Status Bar** (Bottom of screen)
   - Use `SyncStatusBadge` minimal
   - Show only during sync/errors

### Example: Full App Integration

```tsx
// src/components/layout/AppLayout.tsx
import { SyncStatusIndicator } from '@/components/sync';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with sync status */}
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">California Counties</h1>
          <div className="flex items-center gap-4">
            {/* Sync status in header */}
            <SyncStatusIndicator showLabel />
            {/* Other header items */}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto p-4">{children}</main>

      {/* Mobile-friendly status bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2">
        <div className="flex items-center justify-center">
          <SyncStatusIndicator compact />
        </div>
      </div>
    </div>
  );
};
```

### Example: Settings Panel Integration

```tsx
// src/components/settings/SettingsPanel.tsx
import { useSyncStatus } from '@/components/sync';

export const SettingsPanel = () => {
  const { status, queueSize, lastError, syncAll, clearError } = useSyncStatus();

  return (
    <div className="settings-panel">
      <h2>Settings</h2>

      {/* Sync section */}
      <section className="space-y-4">
        <h3 className="font-semibold">Data Sync</h3>

        <div className="flex items-center justify-between">
          <span>Status:</span>
          <SyncStatusIndicator showLabel />
        </div>

        {queueSize > 0 && (
          <div className="text-sm text-gray-600">{queueSize} operations pending</div>
        )}

        {lastError && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm text-red-800">{lastError.message}</p>
            <button onClick={clearError} className="text-xs text-red-600 underline mt-2">
              Dismiss
            </button>
          </div>
        )}

        <button
          onClick={syncAll}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sync Now
        </button>
      </section>
    </div>
  );
};
```

## Accessibility Features

All components follow WCAG 2.1 AA standards:

1. **Semantic HTML**
   - Proper button elements
   - Dialog roles for modals
   - Status role for indicators

2. **ARIA Labels**
   - `aria-label` for icon-only buttons
   - `aria-describedby` for tooltips
   - `aria-modal` for dialogs
   - `aria-live` regions for status changes

3. **Keyboard Navigation**
   - Tab to focus indicator
   - Enter/Space to open modal
   - Escape to close modal
   - Focus management in modal

4. **Visual Indicators**
   - Color + icon (not color alone)
   - Focus rings on interactive elements
   - Sufficient contrast ratios

5. **Screen Reader Support**
   - Descriptive labels
   - Status announcements
   - Error messages

## Styling

Components use Tailwind CSS and follow the existing design system:

- **Colors:** Semantic status colors (green, blue, yellow, red)
- **Spacing:** Consistent padding/margin
- **Typography:** System font stack
- **Animations:** Smooth transitions, spinning icon for syncing
- **Responsive:** Mobile-first approach

## Testing

### Manual Testing

1. **Online Sync**
   - Make changes while online
   - Verify "syncing" state appears
   - Verify "synced" state when complete

2. **Offline Queue**
   - Go offline
   - Make changes
   - Verify "offline" status
   - Verify queue count increases
   - Go online
   - Verify automatic sync

3. **Error Handling**
   - Trigger sync error
   - Verify error state displays
   - Click for details
   - Verify error message shown
   - Retry sync

4. **Accessibility**
   - Tab through components
   - Verify focus visible
   - Use screen reader
   - Verify announcements

### Unit Testing Example

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { syncManager, SyncStatus } from '@/lib/syncManager';

jest.mock('@/lib/syncManager');

describe('SyncStatusIndicator', () => {
  it('displays synced status', () => {
    (syncManager.getStatus as jest.Mock).mockReturnValue(SyncStatus.IDLE);
    render(<SyncStatusIndicator showLabel />);
    expect(screen.getByText('Synced')).toBeInTheDocument();
  });

  it('opens modal on click', () => {
    render(<SyncStatusIndicator />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('is keyboard accessible', () => {
    render(<SyncStatusIndicator />);
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
  });
});
```

## Performance

- **Lightweight:** Minimal bundle impact
- **Efficient:** Only re-renders on status change
- **Debounced:** Queue size updates throttled
- **Memoized:** Callbacks memoized to prevent unnecessary re-renders

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## Future Enhancements

- [ ] Sync progress percentage
- [ ] Sync history log
- [ ] Configurable auto-sync intervals
- [ ] Sync conflict resolution UI
- [ ] Data usage statistics
- [ ] Batch operation display

## Support

For issues or questions, see:

- Main README
- SyncManager documentation
- Component source code comments
