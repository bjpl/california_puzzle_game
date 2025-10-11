# Gesture Customization Guide

This guide explains how to customize gesture controls for your personal preferences and accessibility needs.

---

## 📋 Quick Start

### Accessing Gesture Settings
1. Tap **Menu (☰)** in top-right corner
2. Select **"Settings"**
3. Navigate to **"Gesture Controls"**
4. Customize your preferences
5. Tap **"Save Changes"**

Settings are automatically saved and will persist across sessions.

---

## 🎯 Basic Gesture Toggles

### Two-Finger Rotation
**What it does:** Allows you to rotate the map by twisting two fingers

**When to enable:**
- ✅ You want to view counties from different angles
- ✅ You're comfortable with multi-touch gestures
- ✅ Your device has good touch response

**When to disable:**
- ❌ You find rotation disorienting
- ❌ Accidental rotations are frustrating
- ❌ You prefer static map orientation

**Default:** Enabled

### Pinch to Zoom
**What it does:** Zoom in/out by pinching two fingers together or apart

**When to enable:**
- ✅ You need to see small counties better
- ✅ You want quick zoom control
- ✅ Standard gesture expected on mobile

**When to disable:**
- ❌ You prefer button-based zoom
- ❌ Accidental zooming is annoying
- ❌ Accessibility needs require different control

**Default:** Enabled

---

## 💪 Power User Gestures

### Three-Finger Swipe
**What it does:** Quick actions using three fingers

**Swipe Directions:**
- **Left:** Undo last placement
- **Right:** Redo last undo
- **Up:** Reset game
- **Down:** Show hint

**When to enable:**
- ✅ You want fastest possible controls
- ✅ You're experienced with mobile gestures
- ✅ You play frequently

**When to disable:**
- ❌ Three-finger gestures feel awkward
- ❌ Accidental triggers are common
- ❌ You prefer button controls

**Default:** Enabled

**Pro Tip:** Practice three-finger swipes in tutorial mode first!

### Double-Tap
**What it does:** Quickly zoom to a county by double-tapping

**Behavior:**
- First double-tap: Zoom in and center on county
- Second double-tap: Zoom out to normal view

**When to enable:**
- ✅ You want quick focus on specific counties
- ✅ You're comfortable with double-tap timing
- ✅ You frequently examine county details

**When to disable:**
- ❌ Accidental double-taps are frequent
- ❌ You prefer manual zoom control
- ❌ Timing feels inconsistent

**Default:** Enabled

**Timing:** 300ms between taps (adjustable in Advanced Settings)

### Long Press
**What it does:** Shows county information popup when you press and hold

**When to enable:**
- ✅ You want to learn county facts
- ✅ Educational context is important
- ✅ You don't mind brief holds

**When to disable:**
- ❌ Accidental triggers during drag
- ❌ You prefer separate info button
- ❌ Long holds feel slow

**Default:** Enabled

**Duration:** 500ms hold time (adjustable in Advanced Settings)

---

## 🔧 Zoom Configuration

### Minimum Zoom Level
**Range:** 0.5x to 1.5x
**Default:** 1.0x (normal size)

**Recommendations:**
- **0.5x:** Good for overview of entire state
- **0.75x:** Balanced view with some detail
- **1.0x:** Default, shows most counties clearly
- **1.25x:** Slightly zoomed, good for smaller counties
- **1.5x:** Maximum zoom out (not recommended)

**Use Case:**
- Set lower (0.5x-0.75x) if you want to see entire map
- Set higher (1.25x-1.5x) if you have good eyesight

### Maximum Zoom Level
**Range:** 2.0x to 5.0x
**Default:** 3.0x

**Recommendations:**
- **2.0x:** Conservative zoom, less pixelation
- **3.0x:** Balanced, good for most users
- **4.0x:** High zoom, good for accessibility
- **5.0x:** Maximum zoom, may be pixelated

**Use Case:**
- Set lower (2.0x-3.0x) for cleaner visuals
- Set higher (4.0x-5.0x) for visual impairments

---

## 🎛️ Sensitivity Settings

### Rotation Threshold
**Range:** 1° to 15°
**Default:** 5°
**Unit:** Degrees of rotation before detection

**What it means:**
- **Lower (1°-3°):** Very sensitive, slight finger twists trigger rotation
- **Medium (4°-7°):** Balanced sensitivity
- **Higher (8°-15°):** Less sensitive, requires deliberate rotation

**Recommendations:**
- **1°-3°:** If you want precise rotation control
- **4°-7°:** Default, works for most users
- **8°-15°:** If accidental rotations are common

**Pro Tip:** If you're rotating accidentally while trying to zoom, increase this threshold!

### Pinch Threshold
**Range:** 0.01 to 0.20
**Default:** 0.05 (5% scale change)

**What it means:**
- How much pinch movement triggers zoom detection
- Lower = more sensitive, small pinches trigger zoom
- Higher = less sensitive, requires larger pinch gestures

**Recommendations:**
- **0.01-0.03:** Very sensitive, minimal pinch needed
- **0.04-0.08:** Default range, balanced
- **0.09-0.20:** Less sensitive, clear pinch required

### Long Press Delay
**Range:** 300ms to 1000ms
**Default:** 500ms

**What it means:**
- How long to hold finger before long-press triggers
- Shorter = faster trigger but more accidental
- Longer = intentional but feels slower

**Recommendations:**
- **300ms-400ms:** Quick trigger, for experienced users
- **500ms-600ms:** Default, balanced timing
- **700ms-1000ms:** Deliberate trigger, prevents accidents

**Accessibility:** Set higher (800ms+) if you have motor control difficulties

### Double-Tap Delay
**Range:** 200ms to 500ms
**Default:** 300ms

**What it means:**
- Maximum time between two taps to count as double-tap
- Shorter = must tap quickly
- Longer = more forgiving timing

**Recommendations:**
- **200ms-250ms:** Fast tapping, for experienced users
- **300ms-350ms:** Default, comfortable timing
- **400ms-500ms:** Slower tapping, accessibility-friendly

---

## 🌟 Preset Configurations

### Beginner
**Best for:** First-time users, casual players
```
Two-Finger Rotation: Disabled
Pinch to Zoom: Enabled
Three-Finger Swipe: Disabled
Double-Tap: Enabled
Long Press: Enabled
Min Zoom: 1.0x
Max Zoom: 2.5x
Rotation Threshold: 8°
Long Press Delay: 600ms
```

### Default
**Best for:** Most users, balanced experience
```
Two-Finger Rotation: Enabled
Pinch to Zoom: Enabled
Three-Finger Swipe: Enabled
Double-Tap: Enabled
Long Press: Enabled
Min Zoom: 1.0x
Max Zoom: 3.0x
Rotation Threshold: 5°
Long Press Delay: 500ms
```

### Power User
**Best for:** Experienced users, competitive play
```
Two-Finger Rotation: Enabled
Pinch to Zoom: Enabled
Three-Finger Swipe: Enabled
Double-Tap: Enabled
Long Press: Disabled
Min Zoom: 0.75x
Max Zoom: 4.0x
Rotation Threshold: 3°
Long Press Delay: 400ms
```

### Accessibility
**Best for:** Users with motor control difficulties
```
Two-Finger Rotation: Disabled
Pinch to Zoom: Enabled
Three-Finger Swipe: Disabled
Double-Tap: Disabled
Long Press: Enabled
Min Zoom: 1.0x
Max Zoom: 5.0x
Rotation Threshold: 10°
Long Press Delay: 800ms
```

To apply a preset:
1. Open Gesture Settings
2. Tap "Presets" button
3. Select desired preset
4. Tap "Apply"

---

## 🔍 Testing Your Settings

### Testing Rotation
1. Place two fingers on map
2. Twist clockwise/counter-clockwise
3. Observe rotation smoothness
4. Adjust threshold if needed

**Good Signs:**
- Smooth rotation follows fingers
- No jitter or jumping
- Stops cleanly when fingers stop

**Bad Signs:**
- Rotates when trying to zoom
- Jittery or jumping rotation
- Doesn't stop when fingers stop

**Fix:** Increase rotation threshold or disable rotation

### Testing Zoom
1. Place two fingers on map
2. Pinch together and apart
3. Check zoom responsiveness
4. Test minimum and maximum limits

**Good Signs:**
- Smooth zoom follows pinch
- Respects min/max limits
- No sudden jumps

**Bad Signs:**
- Zooms when trying to pan
- Jumpy or stuttering zoom
- Exceeds set limits

**Fix:** Adjust pinch threshold or zoom limits

### Testing Double-Tap
1. Quickly tap twice on a county
2. Observe zoom-in behavior
3. Double-tap again to zoom out
4. Check timing feels comfortable

**Good Signs:**
- Consistent double-tap detection
- Comfortable timing
- Smooth zoom animation

**Bad Signs:**
- Misses some double-taps
- Too fast or too slow
- Triggers accidentally

**Fix:** Adjust double-tap delay

### Testing Long Press
1. Press and hold on a county
2. Observe popup trigger timing
3. Check if it feels natural
4. Try dragging to verify no conflict

**Good Signs:**
- Predictable trigger time
- Doesn't interfere with drag
- Easy to cancel

**Bad Signs:**
- Triggers during drag
- Takes too long
- Hard to avoid

**Fix:** Adjust long press delay or disable

---

## 💡 Tips and Best Practices

### Finding Your Perfect Settings
1. **Start with defaults** - Get baseline experience
2. **Change one thing at a time** - Identify what works
3. **Test in real gameplay** - Not just in settings
4. **Adjust gradually** - Small increments (1-2 units)
5. **Give it time** - Try new settings for 10+ minutes

### Common Issues and Solutions

#### "I keep rotating when I try to zoom"
**Solution:** Increase rotation threshold to 8°-10°

#### "Double-tap never works"
**Solution:** Increase double-tap delay to 400ms-500ms

#### "Long press triggers when dragging"
**Solution:** Increase long press delay to 700ms+ or disable

#### "Three-finger swipe feels awkward"
**Solution:** Disable and use button controls instead

#### "Zoom is too sensitive"
**Solution:** Increase pinch threshold to 0.08-0.10

### Accessibility Considerations

#### For Visual Impairments
- Max zoom: 5.0x
- Disable rotation (can be disorienting)
- Enable high contrast mode
- Use voice commands

#### For Motor Control Difficulties
- Long press delay: 800ms-1000ms
- Double-tap delay: 400ms-500ms
- Rotation threshold: 10°+
- Disable three-finger gestures

#### For Cognitive Difficulties
- Use Beginner preset
- Disable advanced gestures
- Increase all delay times
- Enable visual feedback

---

## 🔄 Resetting to Defaults

### Full Reset
1. Open Gesture Settings
2. Tap "Reset to Defaults" button
3. Confirm reset
4. All settings return to default values

### What Gets Reset
- All gesture enable/disable states
- All threshold values
- All delay timings
- All zoom limits

### What Doesn't Get Reset
- High contrast preference
- Voice command preferences
- Sound/music settings
- Game progress and scores

---

## 📱 Device-Specific Recommendations

### iPhone
- Default settings work well
- Consider enabling rotation lock for stable play
- Use haptic feedback for better tactile response

### iPad
- Increase rotation threshold (larger touch area)
- Max zoom can be lower (larger screen)
- Three-finger gestures work very well

### Android Phones
- Default settings work well
- Some devices have higher touch latency (increase delays)
- Test double-tap timing on your specific device

### Android Tablets
- Similar to iPad recommendations
- Larger screen allows lower max zoom
- May need higher thresholds (less precise touch)

---

## 🆘 Support

Need help with gesture customization?
- Email: support@californiacounties.game
- FAQ: californiacounties.game/faq
- Video tutorials: californiacounties.game/tutorials

---

**Last Updated:** October 11, 2025
**Version:** 2.0.0
