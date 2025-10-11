# Mobile Features Guide

Welcome to the California Counties Puzzle Game mobile experience! This guide covers all mobile-specific features and controls.

---

## 🎮 Gesture Controls

### Basic Gestures

#### Single Tap
**Action:** Select a county from the tray
- Tap any county badge in the bottom tray
- Selected county will be highlighted with a blue ring
- Use hint button or drag to map to place

#### Drag and Drop
**Action:** Place a county on the map
1. Tap and hold a county badge
2. Drag it to the correct location on the map
3. Release to place
4. Visual feedback confirms correct/incorrect placement

### Advanced Gestures

#### Pinch to Zoom
**Action:** Zoom in/out on the map
- Place two fingers on the map
- Pinch together to zoom out
- Spread apart to zoom in
- Default range: 1x to 3x zoom

#### Two-Finger Rotation
**Action:** Rotate the map view
- Place two fingers on the map
- Rotate clockwise or counter-clockwise
- Useful for viewing county shapes from different angles

#### Two-Finger Pan
**Action:** Move the map around
- Place two fingers on the map
- Drag to pan in any direction
- Useful when zoomed in

#### Double Tap
**Action:** Quick zoom to selected county
- Quickly tap twice on any county
- Map auto-zooms and centers on that county
- Tap again to zoom out

#### Long Press
**Action:** View county information
- Press and hold on any placed county
- Info popup appears with county details
- Release or tap elsewhere to close

#### Three-Finger Swipe
**Action:** Quick actions
- **Swipe Left:** Undo last placement
- **Swipe Right:** Redo last undo
- **Swipe Up:** Reset current game
- **Swipe Down:** Show hint

---

## ⚙️ Customizing Gestures

### Accessing Settings
1. Tap the menu icon (☰) in top-right
2. Select "Gesture Settings"
3. Customize your preferences

### Available Options

#### Enable/Disable Gestures
Toggle any gesture on or off:
- ✅ Two-Finger Rotation
- ✅ Pinch to Zoom
- ✅ Three-Finger Swipe
- ✅ Double-Tap
- ✅ Long Press

#### Zoom Range
- **Minimum Zoom:** 0.5x - 1.5x (default: 1x)
- **Maximum Zoom:** 2x - 5x (default: 3x)

#### Sensitivity
- **Rotation Threshold:** 1° - 15° (default: 5°)
  - Lower = more sensitive
  - Higher = less sensitive
- **Long Press Delay:** 300ms - 1000ms (default: 500ms)
  - How long to hold before triggering

### Saving Preferences
- Settings are automatically saved
- Preferences persist across sessions
- Use "Reset to Defaults" to restore original settings

---

## 🎤 Voice Commands

### Enabling Voice Control
1. Open Settings menu
2. Enable "Voice Commands"
3. Grant microphone permission when prompted
4. Look for microphone icon in top bar

### Supported Commands

#### Game Actions
- **"Drop county"** or **"Place county"** - Place selected county
- **"Show hint"** or **"Hint"** - Get a hint
- **"Undo"** or **"Go back"** - Undo last move
- **"Reset"** or **"Start over"** - Reset puzzle
- **"Help"** or **"Instructions"** - Show help

#### Map Control
- **"Zoom in"** or **"Bigger"** - Zoom in on map
- **"Zoom out"** or **"Smaller"** - Zoom out
- **"Settings"** or **"Options"** - Open settings menu

### Voice Command Tips
- Speak clearly and at normal pace
- Commands work in English (US) by default
- Microphone must be enabled in browser settings
- Background noise may affect recognition
- Confidence threshold: 70% (adjustable in settings)

### Troubleshooting Voice
If voice commands aren't working:
1. Check microphone permission in browser
2. Test microphone in another app
3. Try speaking more clearly
4. Check for background noise
5. Restart voice control in settings

---

## ♿ Accessibility Features

### High Contrast Mode
**For users with visual impairments**

#### Enabling High Contrast
1. Open Settings menu
2. Select "Accessibility"
3. Toggle "High Contrast Mode"
4. Or use system preference (auto-detected)

#### High Contrast Features
- **7:1 contrast ratio** (WCAG AAA compliant)
- Black text on white background
- Bold borders (3px minimum)
- High-visibility focus indicators
- Color-blind friendly palette

#### Colors in High Contrast
- Background: White (#FFFFFF)
- Text: Black (#000000)
- Focus: Red (#FF0000)
- Error: Dark Red (#D00000)
- Success: Dark Green (#005A00)
- Warning: Dark Orange (#8B5A00)

### Screen Reader Support
- All interactive elements have ARIA labels
- Game state changes are announced
- County placements are announced
- Progress updates are announced

### Keyboard Navigation
- **Tab:** Navigate through controls
- **Enter:** Activate buttons
- **Arrow Keys:** Navigate county list
- **Escape:** Close modals
- **Space:** Select/deselect county

---

## 📱 Performance Features

### Optimizations for Mobile
The game automatically optimizes for your device:

#### Low-End Devices (≤2 CPU cores or ≤2GB RAM)
- Reduced animations
- Smaller render chunks (50 items)
- Simplified visual effects
- Lower texture quality
- Disabled advanced effects

#### High-End Devices (>2 CPU cores, >2GB RAM)
- Smooth 60 FPS animations
- Larger render chunks (100 items)
- Full visual effects
- High texture quality
- Advanced lighting effects

### Performance Monitoring
Enable in Developer Settings:
- **FPS Counter:** See real-time frame rate
- **Memory Usage:** Monitor RAM usage
- **Load Time:** Track loading performance
- **Device Info:** View hardware capabilities

### Battery Saving Mode
Enable in Settings to:
- Reduce animation complexity
- Lower frame rate target (30 FPS)
- Disable background effects
- Pause when app is backgrounded

---

## 💡 Tips for Best Mobile Experience

### General Tips
1. **Orient for comfort** - Game works in both portrait and landscape
2. **Zoom strategically** - Zoom in for small counties, out for overview
3. **Use gestures efficiently** - Combine pinch and pan for quick navigation
4. **Enable haptic feedback** - Get tactile feedback for actions
5. **Adjust brightness** - Use auto-brightness for outdoor play

### Performance Tips
1. **Close background apps** - Free up RAM for smooth gameplay
2. **Use WiFi when possible** - Faster loading of county data
3. **Clear cache periodically** - In Settings > Advanced
4. **Update browser regularly** - Get latest performance improvements
5. **Enable Performance Mode** - In Settings for older devices

### Accessibility Tips
1. **Use high contrast** - If you have difficulty seeing colors
2. **Enable voice commands** - If touch is difficult
3. **Increase text size** - In device accessibility settings
4. **Use guided access** - To prevent accidental touches (iOS)
5. **Enable TalkBack/VoiceOver** - For screen reader support

---

## 🔧 Troubleshooting

### Gestures Not Working
1. Check if gestures are enabled in Settings
2. Try recalibrating screen (device settings)
3. Clean screen - oils can affect touch detection
4. Remove screen protector if thick
5. Update browser to latest version

### Voice Commands Not Responding
1. Grant microphone permission
2. Check microphone not in use by other app
3. Test microphone in device settings
4. Reduce background noise
5. Restart voice control

### Performance Issues
1. Enable Performance Mode in Settings
2. Close background apps
3. Clear browser cache
4. Restart device
5. Update to latest browser version

### Map Not Responding
1. Try refreshing the page
2. Check internet connection
3. Clear browser cache
4. Disable browser extensions
5. Try different browser

---

## 📊 Supported Devices

### Minimum Requirements
- **iOS:** 13.0 or later (Safari 13+)
- **Android:** 8.0 Oreo or later (Chrome 80+)
- **Screen:** 320px minimum width
- **RAM:** 1GB minimum
- **Storage:** 50MB free space

### Recommended Specifications
- **iOS:** 15.0 or later
- **Android:** 11.0 or later
- **RAM:** 2GB or more
- **Storage:** 100MB free space
- **Connection:** WiFi or 4G/5G

### Tested Devices
- iPhone SE (2020) and newer
- iPhone 11, 12, 13, 14 series
- Samsung Galaxy S10 and newer
- Google Pixel 4 and newer
- iPad 7th generation and newer
- Android tablets with 10" screens

---

## 🆘 Need Help?

### In-App Help
- Tap "?" icon for tutorial
- Tap "i" for current mode instructions
- Long-press any element for tooltip

### External Resources
- Visit: californiacounties.game/help
- Email: support@californiacounties.game
- Report bugs: github.com/california-counties/issues

### Community
- Discord: discord.gg/california-counties
- Reddit: r/CaliforniaCountiesGame
- Twitter: @CACountiesGame

---

**Version:** 2.0.0
**Last Updated:** October 11, 2025
**Compatibility:** iOS 13+, Android 8+
