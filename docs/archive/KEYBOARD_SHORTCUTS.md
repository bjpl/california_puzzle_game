# Keyboard Shortcuts Guide

## California Counties Puzzle Game

This guide provides comprehensive keyboard navigation instructions for the California Counties Puzzle Game. All interactive elements are fully accessible via keyboard, meeting WCAG 2.1 AAA standards.

## Table of Contents

- [Global Navigation](#global-navigation)
- [Game Controls](#game-controls)
- [Map Navigation](#map-navigation)
- [Menu and Settings](#menu-and-settings)
- [Accessibility Features](#accessibility-features)
- [Screen Reader Support](#screen-reader-support)

## Global Navigation

### Essential Keys

| Key           | Action                               | Context             |
| ------------- | ------------------------------------ | ------------------- |
| `Tab`         | Move to next interactive element     | All screens         |
| `Shift + Tab` | Move to previous interactive element | All screens         |
| `Enter`       | Activate button or link              | All screens         |
| `Space`       | Activate button or toggle            | Buttons, checkboxes |
| `Escape`      | Close modal or cancel action         | Modals, dialogs     |
| `/`           | Focus search or quick access         | Main screens        |

### Skip Links

| Key                    | Action                        |
| ---------------------- | ----------------------------- |
| `Tab` (on page load)   | Reveals skip navigation links |
| `Enter` (on skip link) | Jumps to main content         |

## Game Controls

### County Selection and Placement

| Key               | Action                           |
| ----------------- | -------------------------------- |
| `Arrow Keys`      | Navigate through county list     |
| `Enter` / `Space` | Select county                    |
| `Arrow Keys`      | Move selected county on map      |
| `Enter`           | Place county at current position |
| `Escape`          | Deselect county                  |

### Game Actions

| Key                    | Action                  |
| ---------------------- | ----------------------- |
| `Ctrl + Z` / `Cmd + Z` | Undo last placement     |
| `Ctrl + Y` / `Cmd + Y` | Redo last undone action |
| `Ctrl + R` / `Cmd + R` | Reset current puzzle    |
| `H`                    | Show hint               |
| `?`                    | Show help/instructions  |
| `P`                    | Pause game              |
| `M`                    | Toggle sound/music      |

## Map Navigation

### Zoom Controls

| Key             | Action                   |
| --------------- | ------------------------ |
| `+` / `=`       | Zoom in                  |
| `-` / `_`       | Zoom out                 |
| `0`             | Reset zoom to 100%       |
| `Ctrl + Scroll` | Zoom in/out (with mouse) |

### Pan Controls

| Key            | Action               |
| -------------- | -------------------- |
| `Arrow Keys`   | Pan map in direction |
| `Home`         | Pan to top-left      |
| `End`          | Pan to bottom-right  |
| `Page Up`      | Pan up one screen    |
| `Page Down`    | Pan down one screen  |
| `Space + Drag` | Pan with mouse       |

### Region Selection

| Key | Action                     |
| --- | -------------------------- |
| `1` | Select Northern California |
| `2` | Select Central Valley      |
| `3` | Select Central Coast       |
| `4` | Select Southern California |
| `5` | Select All regions         |

## Menu and Settings

### Main Menu

| Key             | Action                  |
| --------------- | ----------------------- |
| `Arrow Up/Down` | Navigate menu items     |
| `Enter`         | Select menu item        |
| `Escape`        | Return to previous menu |

### Settings Panel

| Key          | Action                    |
| ------------ | ------------------------- |
| `Tab`        | Navigate settings options |
| `Space`      | Toggle switches           |
| `Arrow Keys` | Adjust sliders            |
| `Enter`      | Apply changes             |
| `Escape`     | Cancel and close          |

### Accessibility Settings

| Key              | Action                    |
| ---------------- | ------------------------- |
| `Ctrl + Alt + H` | Toggle high contrast mode |
| `Ctrl + Alt + V` | Toggle voice control      |
| `Ctrl + Alt + T` | Cycle touch target sizes  |
| `Ctrl + Alt + A` | Open accessibility panel  |

## Accessibility Features

### High Contrast Mode

- **Toggle:** `Ctrl + Alt + H`
- **Features:**
  - 7:1 contrast ratio (WCAG AAA)
  - Thicker borders (3-4px)
  - Simplified color palette
  - No decorative elements

### Touch Target Sizes

- **Cycle sizes:** `Ctrl + Alt + T`
- **Options:**
  - Default: 44x44px (WCAG AA)
  - Large: 52x52px (Enhanced)
  - Extra Large: 64x64px (AAA)

### Voice Control

- **Toggle:** `Ctrl + Alt + V`
- **Commands:**
  - "drop county" - Place selected county
  - "zoom in" / "zoom out"
  - "show hint"
  - "reset"
  - "undo"
  - "settings"
  - "help"

### Screen Reader Enhancements

- **Game state announcements:** Automatic
- **County placement feedback:** Immediate
- **Error messages:** Descriptive
- **Progress updates:** Real-time

## Screen Reader Support

### Tested Screen Readers

- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS, iOS)
- TalkBack (Android)
- Narrator (Windows)

### ARIA Labels

All interactive elements have descriptive ARIA labels:

- `aria-label`: Descriptive element names
- `aria-describedby`: Additional context
- `aria-live`: Dynamic content updates
- `role`: Semantic element roles

### Live Regions

The game uses ARIA live regions to announce:

- County placements (correct/incorrect)
- Game state changes (paused, completed)
- Achievement unlocks
- Error messages
- Hint information

## Advanced Keyboard Techniques

### Quick County Selection

| Key Combo  | Action             |
| ---------- | ------------------ |
| `Ctrl + F` | Open county search |
| Type name  | Filter counties    |
| `Enter`    | Select first match |

### Batch Operations

| Key Combo  | Action              |
| ---------- | ------------------- |
| `Ctrl + A` | Select all counties |
| `Ctrl + D` | Deselect all        |
| `Ctrl + I` | Invert selection    |

### Study Mode

| Key          | Action              |
| ------------ | ------------------- |
| `S`          | Enter study mode    |
| `Arrow Keys` | Browse counties     |
| `Enter`      | View county details |
| `Escape`     | Exit details        |
| `N`          | Next county         |
| `P`          | Previous county     |

## Modal and Dialog Navigation

### Focus Trapping

When a modal is open:

- `Tab` cycles through modal elements only
- `Shift + Tab` reverse cycles
- `Escape` closes modal
- Focus returns to trigger element

### Confirmation Dialogs

| Key            | Action                 |
| -------------- | ---------------------- |
| `Enter` / `Y`  | Confirm action         |
| `Escape` / `N` | Cancel action          |
| `Tab`          | Switch between buttons |

## Tips for Keyboard-Only Users

1. **Start with Skip Links**: Press `Tab` immediately after page load to access skip navigation
2. **Use Landmarks**: Screen readers can jump between main landmarks (header, nav, main, footer)
3. **Explore with Tab**: Press `Tab` to discover all interactive elements
4. **Check Focus Indicator**: All focused elements have visible outline (2-4px)
5. **Use Help Dialog**: Press `?` anytime to see available shortcuts
6. **Enable Voice Control**: Great alternative for complex actions
7. **Adjust Settings First**: Visit accessibility settings before starting game
8. **Practice Navigation**: Use study mode to learn keyboard controls

## Keyboard Shortcuts Cheat Sheet

### Essential (Learn These First)

```
Tab           - Navigate forward
Shift+Tab     - Navigate backward
Enter/Space   - Activate
Escape        - Close/Cancel
?             - Help
```

### Game Play

```
Arrow Keys    - Select/Move
Enter         - Place county
Ctrl+Z        - Undo
H             - Hint
P             - Pause
```

### Accessibility

```
Ctrl+Alt+H    - High contrast
Ctrl+Alt+V    - Voice control
Ctrl+Alt+T    - Touch target size
Ctrl+Alt+A    - Accessibility panel
```

## Browser Compatibility

### Fully Supported

- Chrome 90+ (Windows, macOS, Linux)
- Firefox 88+ (Windows, macOS, Linux)
- Safari 14+ (macOS, iOS)
- Edge 90+ (Windows, macOS)

### Partial Support

- Opera 76+ (most features)
- Samsung Internet 14+ (most features)

### Known Limitations

- Voice control requires Web Speech API support
- Some shortcuts may conflict with browser shortcuts
- Mobile browsers have limited keyboard support

## Troubleshooting

### Issue: Focus indicator not visible

**Solution:** Enable high contrast mode (`Ctrl+Alt+H`)

### Issue: Tab not working

**Solution:** Check if focus is trapped in modal. Press `Escape` to close.

### Issue: Keyboard shortcuts not working

**Solution:** Ensure focus is not in a text input field

### Issue: Screen reader not announcing

**Solution:** Check screen reader settings and enable announcements in accessibility panel

### Issue: Voice commands not recognized

**Solution:** Check microphone permissions and browser support

## Feedback and Support

If you encounter keyboard navigation issues or have suggestions:

- File an issue on GitHub
- Contact support: accessibility@california-puzzle.com
- View accessibility report: `/docs/ACCESSIBILITY_REPORT.md`

## WCAG 2.1 Compliance

This keyboard navigation implementation meets:

- ✅ WCAG 2.1 Level A
- ✅ WCAG 2.1 Level AA
- ✅ WCAG 2.1 Level AAA

**Success Criteria Met:**

- 2.1.1 Keyboard (Level A)
- 2.1.2 No Keyboard Trap (Level A)
- 2.1.3 Keyboard (No Exception) (Level AAA)
- 2.4.3 Focus Order (Level A)
- 2.4.7 Focus Visible (Level AA)

---

**Last Updated:** 2025-10-11
**Version:** 1.0.0
**Compliance Level:** WCAG 2.1 AAA
