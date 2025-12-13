# Shared Components

Utility components used across multiple features.

## Structure

```
shared/
├── effects/           - Visual effects (hover, transitions)
├── settings/          - Settings UI components
├── RegionsPanel.tsx   - Region filtering and coloring
```

## Components

### RegionsPanel

Allows users to:

- Toggle region color overlay on the map
- Filter counties by California regions
- Visual legend for regions

### effects/

- `HoverEffects.tsx` - Reusable hover animations and transitions
- `PageTransition.tsx` - Smooth page/view transitions

### settings/

- `SoundSettings.tsx` - Audio control panel
- `Statistics.tsx` - Game statistics display
- `ReturnToGameBanner.tsx` - Quick navigation back to active game

## Usage

```tsx
import RegionsPanel from '@/components/shared/RegionsPanel';
import { HoverEffects } from '@/components/shared/effects/HoverEffects';

function MapView() {
  return (
    <>
      <RegionsPanel />
      <HoverEffects />
    </>
  );
}
```
