# California Puzzle Game - Sound System Documentation

## Overview

The California Puzzle Game includes a comprehensive sound system with dynamic audio feedback, customizable volume controls, and Web Audio API fallbacks for when sound files are not available.

## Features

- **Dynamic Sound Effects**: Interactive audio feedback for all game actions
- **Background Music**: Optional ambient music with fade in/out capabilities
- **Volume Controls**: Separate controls for master, effects, and music volumes
- **Placeholder System**: Web Audio API tone generation when sound files are unavailable
- **Sound Caching**: Efficient loading and caching of audio resources
- **Responsive Integration**: Sounds integrated throughout the UI and game mechanics

## Sound Types and Triggers

### Game Interaction Sounds

| Sound Type | Trigger | Description | Placeholder Tone |
|------------|---------|-------------|------------------|
| `pickup` | Drag start | When player starts dragging a county | 440Hz sine wave, 0.2s |
| `correct` | Correct placement | When county is placed correctly | 660Hz square wave, 0.5s |
| `incorrect` | Wrong placement | When county is placed incorrectly | 220Hz sawtooth wave, 0.3s |
| `win` | Game completion | When all counties are placed | 880Hz triangle wave, 1.0s |
| `achievement` | Achievement unlock | When player unlocks an achievement | 1320Hz triangle wave, 0.8s |

### UI Interaction Sounds

| Sound Type | Trigger | Description | Placeholder Tone |
|------------|---------|-------------|------------------|
| `click` | Button click | All button interactions | 800Hz square wave, 0.1s |
| `hover` | Button hover | Mouse enter on interactive elements | 600Hz sine wave, 0.15s |

### Background Audio

| Sound Type | Trigger | Description | File Path |
|------------|---------|-------------|-----------|
| `background_music` | Game start/settings | Ambient background music | `/sounds/background.mp3` |

## File Structure

### Required Sound Files (Optional)

Place audio files in the `public/sounds/` directory:

```
public/
└── sounds/
    ├── pickup.mp3          # Drag start sound
    ├── correct.mp3         # Correct placement sound
    ├── incorrect.mp3       # Wrong placement sound
    ├── win.mp3             # Game completion sound
    ├── click.mp3           # Button click sound
    ├── hover.mp3           # Button hover sound
    ├── achievement.mp3     # Achievement unlock sound
    └── background.mp3      # Background music (optional)
```

### Supported Audio Formats

- **Primary**: MP3 (broad browser support)
- **Alternative**: OGG, WAV, AAC
- **Web Audio**: Generated tones (automatic fallback)

## Integration Points

### Game Container (`GameContainer.tsx`)

```typescript
// Drag start sound
const handleDragStart = (event: DragStartEvent) => {
  // ... drag logic
  playSound(SoundType.PICKUP);
};

// Placement feedback sounds
const handleDragEnd = (event: DragEndEvent) => {
  // ... placement logic
  if (isCorrect) {
    playSound(SoundType.CORRECT);
  } else {
    playSound(SoundType.INCORRECT);
  }
};
```

### UI Components (`CaliforniaButton.tsx`)

```typescript
// Button interaction sounds
const handleClick = (event) => {
  if (enableSounds && !disabled) {
    playSound(SoundType.CLICK);
  }
  onClick?.(event);
};

const handleMouseEnter = (event) => {
  if (enableSounds && !disabled) {
    playSound(SoundType.HOVER);
  }
  onMouseEnter?.(event);
};
```

### Game Store (`gameStore.ts`)

```typescript
// Achievement sounds
checkAchievements: (placement) => {
  // ... achievement logic
  if (shouldUnlock && !achievement.isUnlocked) {
    playSound(SoundType.ACHIEVEMENT);
  }
};
```

### Game Completion (`GameComplete.tsx`)

```typescript
// Win sound on component mount
useEffect(() => {
  playSound(SoundType.WIN);
}, []);
```

## Sound Manager API

### Core Functions

```typescript
import { playSound, SoundType, setVolume, toggleMute } from '../utils/soundManager';

// Play individual sounds
playSound(SoundType.PICKUP);
playSound(SoundType.CORRECT);

// Volume control
setVolume({
  master: 0.7,    // 0-1
  effects: 0.8,   // 0-1
  music: 0.5,     // 0-1
  muted: false
});

// Mute/unmute
toggleMute();
```

### Background Music

```typescript
import { startBackgroundMusic, stopBackgroundMusic } from '../utils/soundManager';

// Start background music
startBackgroundMusic();

// Stop background music
stopBackgroundMusic();
```

### Sound Settings Integration

```typescript
// Via Game Store
const { updateSoundSettings, toggleMute, startBackgroundMusic } = useGameStore();

// Update volume settings
updateSoundSettings({
  masterVolume: 0.8,
  effectsVolume: 0.9,
  enableBackgroundMusic: true
});

// Toggle mute
toggleMute();
```

## Configuration

### Default Settings

```typescript
const defaultSoundSettings = {
  masterVolume: 0.7,           // 70% master volume
  effectsVolume: 0.8,          // 80% effects volume
  musicVolume: 0.5,            // 50% music volume
  muted: false,                // Not muted by default
  enableBackgroundMusic: true, // Background music enabled
  enableClickSounds: true,     // UI click sounds enabled
  enableGameSounds: true,      // Game interaction sounds enabled
  enableAchievementSounds: true // Achievement sounds enabled
};
```

### Sound Configuration

Each sound type has configurable properties:

```typescript
const soundConfigs = {
  [SoundType.PICKUP]: {
    volume: 0.6,               // Base volume (0-1)
    loop: false,               // Don't loop
    placeholder: {
      frequency: 440,          // 440Hz tone
      duration: 0.2,           // 200ms duration
      waveType: 'sine'         // Sine wave
    }
  }
  // ... other sound configurations
};
```

## Performance Considerations

### Preloading

```typescript
import { preloadSounds } from '../utils/soundManager';

// Preload all sounds for better performance
useEffect(() => {
  preloadSounds();
}, []);
```

### Caching

- All sounds are automatically cached after first load
- Web Audio API tones are generated on-demand
- Failed file loads automatically fall back to generated tones

### Memory Management

```typescript
// Cleanup when component unmounts
useEffect(() => {
  return () => {
    soundManager.dispose();
  };
}, []);
```

## Browser Compatibility

### Web Audio API Support

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support (with user interaction requirement)
- **Edge**: Full support
- **Mobile**: Supported with interaction requirement

### Fallback Behavior

1. **First attempt**: Load audio file from `/sounds/` directory
2. **Fallback**: Generate tone using Web Audio API
3. **Final fallback**: Silent operation (no errors)

## Troubleshooting

### Common Issues

#### No Sound Playing

1. **Check browser permissions**: Some browsers require user interaction before audio
2. **Verify file paths**: Ensure sound files exist in `public/sounds/`
3. **Check volume settings**: Verify master/effects volume > 0 and not muted
4. **Browser console**: Look for audio loading errors

#### Choppy or Delayed Audio

1. **Preload sounds**: Call `preloadSounds()` during app initialization
2. **File format**: Use MP3 for better compression and compatibility
3. **File size**: Keep sound files under 500KB for responsiveness

#### Web Audio API Issues

1. **HTTPS required**: Web Audio API requires secure context in production
2. **User interaction**: Many browsers require user interaction before audio
3. **Context state**: Audio context may be suspended until user interaction

### Debug Mode

Enable debug logging in the sound manager:

```typescript
// Set to true for detailed console logging
const DEBUG_SOUND = true;
```

## Future Enhancements

### Planned Features

1. **Sound Themes**: Multiple audio theme packages
2. **Dynamic Music**: Music that responds to game state
3. **Spatial Audio**: 3D audio effects for county placement
4. **Voice Narration**: Optional county name pronunciation
5. **Sound Preferences**: Per-sound-type volume controls
6. **Audio Visualization**: Visual feedback for audio cues

### Sound Pack System

Future support for downloadable sound packs:

```typescript
interface SoundPack {
  id: string;
  name: string;
  description: string;
  files: Record<SoundType, string>;
  preview?: string;
}
```

## Testing

### Manual Testing Checklist

- [ ] Pickup sound on drag start
- [ ] Correct sound on successful placement
- [ ] Incorrect sound on wrong placement
- [ ] Win sound on game completion
- [ ] Achievement sound on unlock
- [ ] Click sounds on all buttons
- [ ] Hover sounds on button hover
- [ ] Volume controls affect all sounds
- [ ] Mute toggle works correctly
- [ ] Background music starts/stops appropriately
- [ ] Fallback tones work when files missing
- [ ] Settings persist across browser sessions

### Automated Testing

```typescript
// Example test for sound integration
describe('Sound System', () => {
  it('should play pickup sound on drag start', async () => {
    const playSound = jest.fn();
    // ... test implementation
    expect(playSound).toHaveBeenCalledWith(SoundType.PICKUP);
  });
});
```

---

*For technical support or questions about the sound system, refer to the main project documentation or open an issue in the project repository.*