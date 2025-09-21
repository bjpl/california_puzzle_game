# Sound System Integration Example

This document shows how to integrate the sound system into your California Puzzle Game components.

## Main App Integration

```typescript
// App.tsx or main application component
import React, { useEffect } from 'react';
import { useSound } from './hooks/useSound';
import { SoundSettings } from './components/SoundSettings';

function App() {
  const { initializeSound, isInitialized } = useSound({ autoInitialize: true });

  useEffect(() => {
    // Initialize sound system when app loads
    initializeSound();
  }, []);

  return (
    <div className="app">
      {/* Your game components */}
      <GameContainer />

      {/* Sound settings (can be in a modal or settings panel) */}
      <SoundSettings />
    </div>
  );
}
```

## Button Component Integration

```typescript
// Enhanced CaliforniaButton with sound hooks
import React from 'react';
import { useButtonSounds } from '../hooks/useSound';

export const CaliforniaButton: React.FC<CaliforniaButtonProps> = ({
  onClick,
  onMouseEnter,
  enableSounds = true,
  ...props
}) => {
  const { onClickSound, onHoverSound } = useButtonSounds();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (enableSounds) {
      onClickSound();
    }
    onClick?.(event);
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (enableSounds) {
      onHoverSound();
    }
    onMouseEnter?.(event);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </button>
  );
};
```

## Game Container Integration

```typescript
// GameContainer.tsx with sound integration
import React from 'react';
import { useGameSounds } from '../hooks/useSound';

export default function GameContainer() {
  const {
    playPickupSound,
    playCorrectSound,
    playIncorrectSound,
    playWinSound
  } = useGameSounds();

  const handleDragStart = (event: DragStartEvent) => {
    // Game logic...
    playPickupSound();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // Game logic...
    if (isCorrect) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
  };

  const handleGameComplete = () => {
    // Game completion logic...
    playWinSound();
  };

  // Rest of component...
}
```

## Settings Panel Integration

```typescript
// Settings panel with sound controls
import React, { useState } from 'react';
import { useSoundSettings } from '../hooks/useSound';
import { SoundSettings } from '../components/SoundSettings';

export const SettingsPanel: React.FC = () => {
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const { soundSettings, toggleMute } = useSoundSettings();

  return (
    <div className="settings-panel">
      <button onClick={toggleMute}>
        {soundSettings.muted ? '🔇 Unmute' : '🔊 Mute'}
      </button>

      <button onClick={() => setShowSoundSettings(true)}>
        Sound Settings
      </button>

      {showSoundSettings && (
        <SoundSettings onClose={() => setShowSoundSettings(false)} />
      )}
    </div>
  );
};
```

## Achievement System Integration

```typescript
// Achievement component with sound
import React, { useEffect } from 'react';
import { useGameSounds } from '../hooks/useSound';

export const AchievementBadge: React.FC<{ achievement: Achievement }> = ({
  achievement
}) => {
  const { playAchievementSound } = useGameSounds();

  useEffect(() => {
    if (achievement.isUnlocked && achievement.unlockedAt) {
      // Check if this was just unlocked (within last 2 seconds)
      const justUnlocked = Date.now() - achievement.unlockedAt.getTime() < 2000;
      if (justUnlocked) {
        playAchievementSound();
      }
    }
  }, [achievement.isUnlocked, achievement.unlockedAt, playAchievementSound]);

  return (
    <div className="achievement-badge">
      {/* Achievement UI */}
    </div>
  );
};
```

## Custom Sound Integration

```typescript
// Custom component with specific sound needs
import React from 'react';
import { useSound, SoundType } from '../hooks/useSound';

export const CustomComponent: React.FC = () => {
  const { playSound, soundSettings } = useSound();

  const handleSpecialAction = () => {
    // Play a specific sound for this action
    playSound(SoundType.ACHIEVEMENT);
  };

  const handleCustomVolumeChange = (volume: number) => {
    // Custom volume control
    updateSoundSettings({ masterVolume: volume });
  };

  return (
    <div>
      <button onClick={handleSpecialAction}>
        Special Action
      </button>

      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={soundSettings.masterVolume}
        onChange={(e) => handleCustomVolumeChange(parseFloat(e.target.value))}
      />
    </div>
  );
};
```

## Error Handling

```typescript
// Component with sound error handling
import React, { useEffect } from 'react';
import { useSound } from '../hooks/useSound';
import { checkAudioSupport } from '../utils/initializeSound';

export const AudioDebugPanel: React.FC = () => {
  const { isInitialized, soundSettings } = useSound();

  useEffect(() => {
    const audioSupport = checkAudioSupport();

    if (!audioSupport.webAudioAPI && !audioSupport.audioElement) {
      console.warn('No audio support detected');
    }

    audioSupport.recommendations.forEach(rec => {
      console.info('Audio recommendation:', rec);
    });
  }, []);

  return (
    <div className="audio-debug">
      <p>Sound System Status: {isInitialized ? '✅ Ready' : '⏳ Loading'}</p>
      <p>Muted: {soundSettings.muted ? 'Yes' : 'No'}</p>
      <p>Master Volume: {Math.round(soundSettings.masterVolume * 100)}%</p>
    </div>
  );
};
```

## Performance Tips

1. **Preload Sounds**: Call `preloadSounds()` during app initialization
2. **Lazy Loading**: Initialize sound system on first user interaction
3. **Memory Management**: Clean up sound resources on component unmount
4. **Conditional Loading**: Only load sound files when audio is enabled

```typescript
// Performance-optimized sound loading
import React, { useEffect, useState } from 'react';
import { preloadSounds } from '../utils/soundManager';

export const PerformantSoundLoader: React.FC = () => {
  const [soundsLoaded, setSoundsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSounds = async () => {
      try {
        await preloadSounds();
        if (mounted) {
          setSoundsLoaded(true);
        }
      } catch (error) {
        console.warn('Sound preloading failed:', error);
      }
    };

    // Only load sounds if user hasn't disabled them
    const gameSettings = useGameStore.getState().settings;
    if (gameSettings.soundEnabled) {
      loadSounds();
    }

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      {soundsLoaded ? '🔊 Sounds Ready' : '⏳ Loading Sounds...'}
    </div>
  );
};
```

## Testing

```typescript
// Test component for sound system
import React from 'react';
import { testAllSounds } from '../utils/initializeSound';
import { SoundType } from '../utils/soundManager';
import { useSound } from '../hooks/useSound';

export const SoundTestPanel: React.FC = () => {
  const { playSound } = useSound();

  const handleTestAllSounds = async () => {
    await testAllSounds();
  };

  const handleTestSpecificSound = (soundType: SoundType) => {
    playSound(soundType);
  };

  return (
    <div className="sound-test-panel">
      <h3>Sound System Test</h3>

      <button onClick={handleTestAllSounds}>
        Test All Sounds
      </button>

      <div className="sound-buttons">
        {Object.values(SoundType).map(soundType => (
          <button
            key={soundType}
            onClick={() => handleTestSpecificSound(soundType)}
          >
            {soundType}
          </button>
        ))}
      </div>
    </div>
  );
};
```

This integration example shows how to use the sound system throughout your application while maintaining clean separation of concerns and good performance practices.