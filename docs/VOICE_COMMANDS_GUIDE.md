# Voice Commands Guide

Control the California Counties Puzzle Game entirely with your voice using the Web Speech API. This guide covers setup, commands, and troubleshooting.

---

## 🎤 Quick Start

### Enabling Voice Control
1. Open **Settings** menu
2. Navigate to **"Voice Control"**
3. Toggle **"Enable Voice Commands"** to ON
4. Grant microphone permission when prompted
5. Look for 🎤 icon in top bar (green = active)

### Your First Command
1. Say: **"Show hint"**
2. Game responds with a hint
3. Microphone icon pulses during recognition
4. Command confirmation appears briefly

**That's it!** You're ready to play hands-free.

---

## 📋 Complete Command Reference

### Game Actions

#### Place County
**Commands:**
- "Drop county"
- "Place county"
- "Drop"
- "Place"

**What it does:**
- Places currently selected county on map
- Equivalent to tapping the hint location
- Requires a county to be selected first

**Example Usage:**
1. Say "Select Los Angeles"
2. Say "Drop county"
3. County is placed in correct location

#### Show Hint
**Commands:**
- "Show hint"
- "Hint"
- "Help me"
- "Clue"

**What it does:**
- Displays hint for selected county
- Shows county outline on map
- Highlights correct placement location

**Example Usage:**
Say "Show hint" when stuck on a county

#### Undo Last Move
**Commands:**
- "Undo"
- "Go back"
- "Revert"
- "Undo last"

**What it does:**
- Removes last placed county
- Returns county to tray
- Can undo multiple moves sequentially

**Example Usage:**
Say "Undo" to fix a mistake

#### Reset Game
**Commands:**
- "Reset"
- "Restart"
- "Start over"
- "Clear"

**What it does:**
- Removes all placed counties
- Returns all counties to tray
- Keeps same difficulty/region selection
- Resets timer (if applicable)

**Example Usage:**
Say "Reset" to start fresh

### Map Controls

#### Zoom In
**Commands:**
- "Zoom in"
- "Zoom"
- "Enlarge"
- "Bigger"

**What it does:**
- Increases map zoom by 25%
- Respects maximum zoom setting
- Centers on current view

**Example Usage:**
Say "Zoom in" to see small counties better

#### Zoom Out
**Commands:**
- "Zoom out"
- "Unzoom"
- "Smaller"
- "Shrink"

**What it does:**
- Decreases map zoom by 25%
- Respects minimum zoom setting
- Provides better overview

**Example Usage:**
Say "Zoom out" to see entire map

### Menu Navigation

#### Open Settings
**Commands:**
- "Settings"
- "Options"
- "Preferences"
- "Configure"

**What it does:**
- Opens settings menu
- Voice control remains active
- Use voice to navigate settings

**Example Usage:**
Say "Settings" to adjust preferences

#### Show Help
**Commands:**
- "Help"
- "Instructions"
- "How to play"
- "Tutorial"

**What it does:**
- Opens help documentation
- Shows game instructions
- Displays command reference

**Example Usage:**
Say "Help" to learn game mechanics

---

## 🎯 Advanced Usage

### County Selection (Coming Soon)
**Future Commands:**
- "Select [County Name]"
- "Next county"
- "Previous county"
- "Show [County Name]"

**Example:**
- "Select Los Angeles"
- "Show Sacramento"
- "Next county"

**Status:** Planned for v2.1

### Chaining Commands
Say multiple commands in sequence:

**Example 1:**
- "Show hint"
- (wait for hint to display)
- "Drop county"

**Example 2:**
- "Zoom in"
- (wait for zoom)
- "Show hint"
- (wait for hint)
- "Drop county"

**Pro Tip:** Wait for each command to complete before saying the next one.

### Command Variations
Most commands accept multiple phrasings:

**To undo:**
- "Undo" (fastest)
- "Go back" (natural)
- "Undo last" (explicit)
- "Revert" (formal)

**To zoom:**
- "Zoom in" (standard)
- "Bigger" (casual)
- "Enlarge" (formal)

---

## ⚙️ Configuration

### Accessing Voice Settings
1. Open **Settings**
2. Select **"Voice Control"**
3. Customize preferences

### Available Options

#### Language
**Default:** English (US)
**Options:** en-US, en-GB, en-AU

**When to change:**
- You speak with different English accent
- Better recognition in your region

#### Confidence Threshold
**Range:** 50% - 90%
**Default:** 70%

**What it means:**
- How confident the system must be before executing
- Lower = more permissive, may misfire
- Higher = more strict, may miss commands

**Recommendations:**
- **50%-60%:** Noisy environment, casual use
- **70%-80%:** Default, balanced
- **80%-90%:** Quiet environment, precision needed

#### Continuous Listening
**Default:** Enabled

**Enabled:**
- Always listening for commands
- No need to press button
- Fastest interaction

**Disabled:**
- Must press microphone button
- Speak command
- Press button again to stop
- Better for privacy

#### Interim Results
**Default:** Disabled

**Enabled:**
- Shows partial recognition in real-time
- See what system is hearing
- Helpful for debugging

**Disabled:**
- Only shows final result
- Cleaner interface
- Less distracting

---

## 🔧 Troubleshooting

### Commands Not Recognized

#### Check Microphone Permission
1. Open browser settings
2. Navigate to site permissions
3. Verify microphone is allowed
4. Refresh page if needed

**Chrome:**
`Settings > Privacy > Site Settings > Microphone`

**Safari:**
`Settings > Safari > [Website] > Microphone`

**Firefox:**
`Settings > Privacy & Security > Permissions > Microphone`

#### Test Microphone
1. Open device settings
2. Go to sound/microphone settings
3. Speak and verify input meter moves
4. Try recording and playback

If microphone doesn't work in device settings, it's a hardware issue.

#### Check Background Noise
- Move to quieter location
- Reduce TV/music volume
- Close windows if outside noise
- Use headset microphone

#### Speak Clearly
- Normal conversational pace
- Clear enunciation
- Avoid trailing off
- Face the device

#### Check Command Accuracy
- Say exact command from list
- Avoid extra words ("Please show hint" won't work)
- Use aliases if main command fails

### Low Confidence Errors

**Error Message:** "Low confidence (XX%). Please try again."

**Causes:**
- Background noise
- Unclear pronunciation
- Microphone quality
- Multiple people speaking

**Solutions:**
1. Lower confidence threshold in settings
2. Reduce background noise
3. Speak more clearly
4. Use better microphone

### Microphone Not Available

**Error Message:** "Microphone not available"

**Causes:**
- No microphone connected
- Microphone in use by another app
- Browser permission denied
- Hardware malfunction

**Solutions:**
1. Connect external microphone
2. Close other apps using microphone
3. Grant permission in browser
4. Test microphone in device settings

### Commands Execute Wrong Action

**Causes:**
- Similar-sounding commands
- Partial match triggered
- Low confidence threshold

**Solutions:**
1. Use more distinct commands
2. Increase confidence threshold
3. Speak more clearly
4. Add pause before/after command

---

## 🌍 Supported Languages

### Current Support
- **English (US)** - en-US (fully supported)

### Coming Soon
- English (UK) - en-GB
- English (Australia) - en-AU
- Spanish (US) - es-US
- Spanish (MX) - es-MX

### Future Roadmap
- French (FR) - fr-FR
- German - de-DE
- Portuguese (BR) - pt-BR
- Mandarin - zh-CN

**Note:** Command recognition quality depends on browser's speech recognition engine.

---

## ♿ Accessibility Features

### For Users with Motor Impairments
Voice control allows complete game control without touch/mouse:
- No need for precise finger movements
- No dragging required
- Eliminates accidental touches
- Reduces physical strain

### For Users with Visual Impairments
Combine voice control with screen reader:
- Voice commands trigger actions
- Screen reader announces results
- Audio feedback confirms commands
- No visual requirements

### For Users with Cognitive Impairments
Simplified command structure:
- One or two word commands
- Natural language phrases
- Multiple ways to say same thing
- Consistent command patterns

---

## 🎮 Best Practices

### Optimal Setup
1. **Quiet environment** - Minimal background noise
2. **Good microphone** - Built-in or external headset
3. **Clear speech** - Normal pace, good enunciation
4. **Proper distance** - 6-12 inches from microphone
5. **Stable connection** - Voice processing requires internet

### Playing Efficiently
1. **Plan moves** - Think before speaking
2. **Wait for confirmation** - Let command complete
3. **Use shorter commands** - "Hint" vs "Show hint"
4. **Learn aliases** - Multiple ways to say same thing
5. **Combine with touch** - Use best input for each action

### Privacy Considerations
- Voice commands are processed by browser
- Audio sent to speech recognition service
- No audio is stored permanently
- Disable when not needed
- Use push-to-talk if concerned

---

## 📊 Browser Compatibility

### Fully Supported
- ✅ **Chrome 80+** (Desktop & Mobile)
- ✅ **Edge 80+** (Desktop & Mobile)
- ✅ **Safari 14.1+** (Desktop & iOS)

### Partial Support
- ⚠️ **Firefox** - Requires manual enable in about:config
- ⚠️ **Samsung Internet** - May require permissions update

### Not Supported
- ❌ **Internet Explorer** - No Web Speech API support
- ❌ **Older browsers** - Update to latest version

### Testing Your Browser
1. Visit: [Web Speech API Demo](https://mdn.github.io/web-speech-api/speech-recognition/)
2. Grant microphone permission
3. Speak a test phrase
4. If text appears, voice control will work

---

## 🔐 Privacy & Security

### What Data Is Collected
- **Audio samples** - Sent to speech recognition service
- **Transcribed text** - Used for command matching
- **Command success rate** - Anonymous analytics

### What Is NOT Collected
- **Audio recordings** - Not stored permanently
- **Personal information** - No user identification
- **Gameplay data** - Commands don't track progress

### Data Processing
1. Audio captured by browser
2. Sent to speech recognition API (Google/Apple)
3. Text returned to browser
4. Command matched locally
5. Audio discarded

### Opting Out
- Disable voice control in settings
- Deny microphone permission
- No voice data is collected when disabled

---

## 💡 Pro Tips

1. **Practice common commands** - Muscle memory for voice
2. **Use in combination** - Voice for actions, touch for selection
3. **Create mental shortcuts** - Know which commands are fastest
4. **Adjust for environment** - Different settings for different places
5. **Keep backup** - Touch controls always available

---

## 🆘 Getting Help

### In-App Help
- Say **"Help"** for command list
- Tap 🎤 icon for status
- Check ⚙️ settings for configuration

### Online Resources
- **FAQ:** californiacounties.game/voice-faq
- **Tutorial Video:** californiacounties.game/voice-tutorial
- **Support:** support@californiacounties.game

### Community
- **Discord:** discord.gg/california-counties
- **Reddit:** r/CaliforniaCountiesGame
- **Forums:** forum.californiacounties.game

---

**Version:** 2.0.0
**Last Updated:** October 11, 2025
**Powered By:** Web Speech API
