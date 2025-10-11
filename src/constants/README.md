# Application Constants

Centralized configuration for all magic numbers and hardcoded values in the California Counties Puzzle game.

## Overview

This directory contains all application constants organized by domain. Using constants instead of magic numbers provides:

- **Single source of truth** for configuration
- **Easier game balance tuning** without hunting through code
- **Better testability** (can override constants in tests)
- **Type-safe configuration** with TypeScript
- **Self-documenting code** with descriptive constant names

## Files

### game.ts
Game mechanics, scoring, and difficulty settings:
- Map rendering dimensions and viewbox
- Timer configuration and thresholds
- Scoring system and point values
- Difficulty settings (easy/medium/hard)
- Hint system configuration
- Formation animation parameters
- County identification and drag-drop settings

**Key Constants:**
- `GAME_CONFIG.MAP_WIDTH` / `MAP_HEIGHT` - Map dimensions
- `GAME_CONFIG.TOTAL_COUNTIES` - Total California counties (58)
- `GAME_CONFIG.DRAG_ACTIVATION_DISTANCE` - Minimum pixels to trigger drag
- `GAME_GRADES` - Grade thresholds and display settings

### study.ts
Study mode configuration and spaced repetition:
- Session defaults and auto-save intervals
- Progress and mastery thresholds
- Spaced repetition (SM-2 algorithm) parameters
- Study mode card counts
- Achievement streak thresholds

**Key Constants:**
- `STUDY_CONFIG.AUTO_SAVE_INTERVAL` - Auto-save frequency (30s)
- `STUDY_CONFIG.MASTERED_THRESHOLD` - 90% accuracy to master
- `STUDY_CONFIG.SR_*` - Spaced repetition intervals

### regions.ts
California region definitions and colors:
- Region name constants
- Region color mappings (hex colors)
- County counts per region
- Total regions count

**Key Constants:**
- `CALIFORNIA_REGIONS` - Standard region names
- `REGION_COLORS` - Hex color for each region
- `REGION_COUNTY_COUNTS` - Counties per region

### ui.ts
UI/UX timing, animations, and visual constants:
- Animation durations and transitions
- Sound effect volumes
- Component sizing (county tray, progress bars)
- Formation animation timings
- Zoom and pan controls
- Typography sizes
- California map projection bounds
- County fill colors and stroke colors
- Opacity values for different states

**Key Constants:**
- `UI_CONFIG.TOAST_DURATION` - Toast notification display time
- `UI_CONFIG.ZOOM_MIN` / `ZOOM_MAX` - Zoom limits
- `COUNTY_FILL_COLORS` - County visual states
- `OPACITY_VALUES` - Visual feedback opacity levels

### achievements.ts
Achievement definitions and point values:
- Achievement point values
- Leaderboard configuration
- Achievement tier thresholds (Bronze/Silver/Gold/Platinum)
- Completion thresholds

**Key Constants:**
- `ACHIEVEMENT_POINTS` - Points for each achievement type
- `ACHIEVEMENT_TIERS` - Tier colors and minimum points
- `LEADERBOARD_CONFIG.MAX_ENTRIES` - Top 100 scores kept

### index.ts
Barrel export file for convenient imports.

## Usage

### Import specific constants:
```typescript
import { GAME_CONFIG, REGION_COLORS } from '@/constants';

const mapScale = GAME_CONFIG.MAP_SCALE;
const northColor = REGION_COLORS['Northern California'];
```

### Import from specific file:
```typescript
import { STUDY_CONFIG } from '@/constants/study';
import { UI_CONFIG, COUNTY_FILL_COLORS } from '@/constants/ui';
```

### Import all (not recommended - larger bundle):
```typescript
import * as Constants from '@/constants';

const totalCounties = Constants.GAME_CONFIG.TOTAL_COUNTIES;
```

## Adding New Constants

1. **Determine the appropriate file** based on the domain (game, study, regions, UI, achievements)
2. **Add to the relevant constant object** with a descriptive name
3. **Update this README** with the new constant
4. **Export from index.ts** if it's a commonly used constant
5. **Replace magic numbers** in code with the new constant
6. **Run tests** to verify nothing broke

### Example:
```typescript
// In src/constants/game.ts
export const GAME_CONFIG = {
  // ... existing constants
  NEW_FEATURE_THRESHOLD: 50, // Add your new constant
} as const;

// In your component
import { GAME_CONFIG } from '@/constants';

if (score > GAME_CONFIG.NEW_FEATURE_THRESHOLD) {
  // Use the constant instead of magic number
}
```

## Benefits of This Approach

### 1. Easy Game Balance Tuning
Change values in one place to tune difficulty:
```typescript
// Want to make hints more available?
MAX_HINTS_PER_GAME: 5, // Was 3

// Want stricter "excellent" grade?
MISTAKE_THRESHOLD_EXCELLENT: 2, // Was 3
```

### 2. Better Testing
Override constants in tests:
```typescript
// Mock constants for testing
jest.mock('@/constants', () => ({
  GAME_CONFIG: {
    ...jest.requireActual('@/constants').GAME_CONFIG,
    TOTAL_COUNTIES: 5, // Test with fewer counties
  }
}));
```

### 3. Type Safety
TypeScript ensures you use valid constant names:
```typescript
// ✅ TypeScript knows this is valid
const zoom = GAME_CONFIG.ZOOM_MAX;

// ❌ TypeScript error - typo caught
const zoom = GAME_CONFIG.ZOOM_MAXIUM;
```

### 4. Self-Documenting Code
```typescript
// ❌ What does 520 mean?
<div style={{ height: '520px' }}>

// ✅ Ah, it's the game container height!
<div style={{ height: `${GAME_CONFIG.GAME_CONTAINER_HEIGHT}px` }}>
```

## Migration Summary

This constants directory was created in Phase 3 of code organization to eliminate magic numbers throughout the codebase.

**Files Updated:**
- `GameContainer.tsx` - Drag distance, container height
- `CaliforniaMapFixed.tsx` - Map dimensions, colors, projection bounds
- `CountyFormationAnimation.tsx` - Formation years, animation timings, zoom controls
- `GameComplete.tsx` - Grade thresholds
- `GameHeader.tsx` - Hint levels, sound volumes

**Magic Numbers Replaced:** 50+

**Build Status:** ✅ Passing (verified after migration)

## Maintenance

- **Review quarterly** - Remove unused constants
- **Document changes** - Update README when adding constants
- **Keep organized** - Don't let files grow too large (split if needed)
- **Semantic naming** - Use clear, descriptive names
- **Group related** - Keep similar constants together
