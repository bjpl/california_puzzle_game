# Sound Files for California Puzzle Game

This folder should contain the following sound effect files:

## Required Sound Files

1. **pickup.mp3** - Sound when picking up/dragging a county
   - Suggested: Light "pop" or "click" sound
   - Duration: ~0.2 seconds

2. **correct.mp3** - Sound when placing a county correctly
   - Suggested: Positive chime or bell
   - Duration: ~0.5 seconds

3. **incorrect.mp3** - Sound when placing a county incorrectly
   - Suggested: Error buzz or low tone
   - Duration: ~0.3 seconds

4. **win.mp3** - Sound when completing the puzzle
   - Suggested: Victory fanfare or celebration sound
   - Duration: ~1-2 seconds

5. **click.mp3** - General UI click sound
   - Suggested: Soft click
   - Duration: ~0.1 seconds

6. **hover.mp3** - Sound when hovering over interactive elements
   - Suggested: Very soft whoosh or tick
   - Duration: ~0.1 seconds

7. **achievement.mp3** - Sound for unlocking achievements
   - Suggested: Reward chime
   - Duration: ~0.5 seconds

8. **background.mp3** - Optional background music
   - Suggested: Calm, educational music
   - Should loop seamlessly

## Fallback System

If these files are not present, the game will automatically use Web Audio API to generate placeholder tones:
- Pickup: 440Hz sine wave
- Correct: 660Hz square wave
- Incorrect: 220Hz sawtooth wave
- Win: 880Hz triangle wave
- Click: 330Hz sine wave
- Hover: 600Hz sine wave
- Achievement: 550Hz triangle wave

## Free Sound Resources

You can find free sound effects at:
- https://freesound.org
- https://opengameart.org
- https://zapsplat.com (free with account)
- https://freesoundslibrary.com

## File Format

All sound files should be:
- MP3 format for best compatibility
- Optimized for web (compressed)
- Normalized volume levels