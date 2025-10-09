# Testing Guide: PWA & Dark Mode

**Created:** 2025-10-09
**Status:** Phase 3 (PWA + Dark Mode) Implementation Complete
**Ready for Testing:** ✅

## Overview

This guide helps you test the newly implemented **Progressive Web App (PWA)** features and **Dark Mode** functionality. Both features are production-ready and available after building the app.

---

## 🚀 Quick Start

### Build Production Bundle

```bash
npm run build
```

### Serve Production Build

```bash
npm run preview
```

The app will be available at `http://localhost:4173` (or the port shown in terminal).

---

## 🎨 Testing Dark Mode

### Feature Summary

- **3 Theme Modes:** Light, Dark, System (auto-detects OS preference)
- **Theme Toggle:** Moon/Sun icon button in GameHeader
- **Persistence:** Theme preference saved in localStorage
- **Smooth Transitions:** 200ms color transitions
- **WCAG AA Compliant:** 4.5:1+ contrast ratios

### Test Cases

#### TC-DM-001: Manual Theme Switching

**Steps:**

1. Open the app in browser
2. Locate the theme toggle button (Moon/Sun icon) in the top-right corner of the GameHeader
3. Click the theme toggle button

**Expected Results:**

- ✅ Theme switches between Light and Dark modes
- ✅ Icon changes: Sun (light mode) ↔ Moon (dark mode)
- ✅ Background color changes smoothly (200ms transition)
- ✅ Text remains readable (high contrast)
- ✅ All UI elements update appropriately

**Visual Checks:**

- Light Mode: White background (#ffffff), dark text (#111827), blue primary (#3b82f6)
- Dark Mode: Near-black background (#121212), light text (#f9fafb), desaturated blue (#60a5fa)

#### TC-DM-002: Theme Dropdown Menu

**Steps:**

1. Click and hold on the theme toggle button (or click on dropdown variant if using `ThemeToggle` instead of `SimpleThemeToggle`)
2. Observe the dropdown menu

**Expected Results:**

- ✅ Dropdown shows 3 options: Light, Dark, System
- ✅ Current selection is highlighted with checkmark
- ✅ Clicking an option changes the theme immediately
- ✅ Dropdown closes after selection

#### TC-DM-003: System Theme Sync

**Steps:**

1. Select "System" theme mode
2. Change your operating system's theme preference:
   - **Windows:** Settings → Personalization → Colors → "Choose your color"
   - **macOS:** System Preferences → General → Appearance
   - **Linux:** Varies by desktop environment (usually in Settings/Appearance)

**Expected Results:**

- ✅ App theme updates automatically when OS theme changes
- ✅ No page refresh required
- ✅ Theme persists across browser sessions

#### TC-DM-004: Theme Persistence

**Steps:**

1. Select "Dark" theme
2. Refresh the page (F5 or Ctrl+R)
3. Close the browser tab
4. Reopen the app in a new tab

**Expected Results:**

- ✅ Dark theme remains active after refresh
- ✅ Dark theme remains active after closing/reopening
- ✅ No flash of light theme on page load (FOUC prevention)

#### TC-DM-005: Accessibility

**Steps:**

1. Use keyboard navigation:
   - Press `Tab` to focus the theme toggle button
   - Press `Enter` or `Space` to toggle theme
2. Use a screen reader (NVDA, JAWS, VoiceOver)

**Expected Results:**

- ✅ Theme toggle button is keyboard accessible
- ✅ Focus outline is visible (2px blue)
- ✅ ARIA labels announce current theme state
- ✅ Screen reader announces "Toggle theme to [light/dark] mode"

#### TC-DM-006: Mobile Dark Mode

**Steps:**

1. Open app on mobile device (or use browser DevTools device emulation)
2. Toggle dark mode

**Expected Results:**

- ✅ Theme toggle button is touch-friendly (44x44px minimum)
- ✅ Dark mode reduces screen brightness noticeably
- ✅ On OLED devices, dark mode should save battery (visible in battery stats after 30min use)

---

## 📱 Testing Progressive Web App (PWA)

### Feature Summary

- **Offline Gameplay:** Works without internet after initial load
- **Installable:** Add to home screen on iOS/Android
- **Service Worker:** Smart caching with 3-tier strategy
- **Auto-Updates:** Checks for updates hourly, notifies user

### Test Cases

#### TC-PWA-001: Service Worker Registration

**Steps:**

1. Build and serve production bundle: `npm run build && npm run preview`
2. Open browser DevTools (F12)
3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Check **Service Workers** section

**Expected Results:**

- ✅ Service Worker status: "activated and running"
- ✅ Scope: `/california_puzzle_game/`
- ✅ Script: `/california_puzzle_game/sw.js`

#### TC-PWA-002: Offline Functionality

**Steps:**

1. Load the app with internet connected
2. Wait for Service Worker to activate (check DevTools)
3. Open DevTools → Network tab
4. Check "Offline" checkbox (or throttle to "Offline")
5. Refresh the page (F5)

**Expected Results:**

- ✅ App loads successfully while offline
- ✅ County data (ultra-low and low GeoJSON) is cached
- ✅ No network errors in console
- ✅ Game is fully playable offline

**Cached Assets Check:**

- Open DevTools → Application → Cache Storage
- Should see 3 caches:
  - `ca-puzzle-v1` (app shell + essential geodata ~3MB)
  - `ca-geodata-v1` (detailed geodata)
  - `ca-runtime-v1` (runtime assets)

#### TC-PWA-003: Android Chrome Installation

**Prerequisites:** Android device with Chrome, or Chrome DevTools device emulation

**Steps:**

1. Open app in Chrome on Android
2. Wait for install prompt to appear (banner at bottom)
3. Tap "Install" or "Add to Home Screen"

**Expected Results:**

- ✅ Install prompt appears within 5-10 seconds
- ✅ App icon appears on home screen
- ✅ Opening from home screen shows splash screen
- ✅ App runs in standalone mode (no browser UI)

**Manual Installation (if prompt doesn't appear):**

1. Tap Chrome menu (⋮)
2. Select "Add to Home screen"
3. Confirm installation

#### TC-PWA-004: iOS Safari Installation

**Prerequisites:** iOS device (iPhone/iPad) with Safari

**Steps:**

1. Open app in Safari on iOS
2. Tap the Share button (square with arrow)
3. Scroll and tap "Add to Home Screen"
4. Tap "Add" to confirm

**Expected Results:**

- ✅ App icon appears on iOS home screen
- ✅ Custom app name: "CA Puzzle"
- ✅ Opening from home screen hides Safari UI
- ✅ App runs in standalone mode with custom theme color

**Note:** iOS Safari does NOT show automatic install prompts. Manual "Add to Home Screen" is required.

#### TC-PWA-005: Manifest Validation

**Steps:**

1. Open DevTools → Application tab
2. Click "Manifest" in the left sidebar

**Expected Results:**

- ✅ Manifest loaded successfully
- ✅ App name: "California Counties Puzzle"
- ✅ Short name: "CA Puzzle"
- ✅ Start URL: `/california_puzzle_game/`
- ✅ Display: standalone
- ✅ Theme color: #1e40af (light mode) or #121212 (dark mode)
- ✅ Icons present: SVG + PNG (192x192, 512x512)
- ✅ Screenshots present (desktop + mobile)

#### TC-PWA-006: Service Worker Caching Strategy

**Steps:**

1. Open DevTools → Network tab
2. Reload page with Service Worker active
3. Look at the "Size" column for resources

**Expected Results:**

- ✅ Most resources show "(ServiceWorker)" or "(disk cache)"
- ✅ `ca-counties-ultra-low.geojson` cached (467KB)
- ✅ `ca-counties-low.geojson` cached (2.2MB)
- ✅ CSS/JS bundles cached
- ✅ Icons/images cached

**Cache Breakdown:**

- **Pre-cached on install:** App shell + ultra-low + low geodata (~3MB)
- **Cached on-demand:** Medium/high geodata (~5-8MB)
- **Network-first:** Census data (always fresh when online)

#### TC-PWA-007: Update Notification

**Steps:**

1. Deploy new version of app (increment version in `sw.js`)
2. Reload the page
3. Wait for update notification

**Expected Results:**

- ✅ Custom event `swUpdateAvailable` fires
- ✅ User sees notification: "A new version is available. Refresh to update."
- ✅ Clicking "Refresh" activates new Service Worker
- ✅ Page reloads with updated version

**Manual Testing:**

1. Edit `public/sw.js` line 10: Change `CACHE_VERSION = 'v1'` to `'v2'`
2. Rebuild: `npm run build`
3. Reload app in browser
4. Check console for "[SW] Update found, installing new version..."

#### TC-PWA-008: Standalone Mode Detection

**Steps:**

1. Open app in browser (not installed)
2. Check console: `isStandalone()`
3. Install app (TC-PWA-003 or TC-PWA-004)
4. Open installed app
5. Check console again: `isStandalone()`

**Expected Results:**

- ✅ Browser: `isStandalone() === false`
- ✅ Installed app: `isStandalone() === true`

---

## 🔬 Advanced Testing

### Performance Testing

#### Load Time (Offline)

1. Enable Service Worker caching
2. Go offline
3. Measure page load time (DevTools → Network → disable cache off → reload)

**Expected:** < 1 second for cached content

#### Dark Mode Battery Impact (OLED Devices)

1. Open app on OLED smartphone (Samsung, iPhone 12+, etc.)
2. Set to 100% brightness
3. Use app for 30 minutes in Light mode
4. Note battery percentage
5. Charge to 100%, repeat test in Dark mode

**Expected:** 40-60% battery savings in Dark mode (OLED-specific)

### Accessibility Testing

#### Contrast Ratios

1. Open browser DevTools
2. Inspect text elements
3. Check contrast ratio in DevTools (Chrome shows WCAG compliance)

**Expected:** All text meets WCAG AA (4.5:1+)

#### Keyboard Navigation

1. Use only keyboard (Tab, Enter, Escape)
2. Navigate entire UI

**Expected:** All interactive elements accessible

#### Screen Reader

1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate app by headings and landmarks

**Expected:** Semantic HTML structure, clear labels

---

## 🐛 Known Issues

### Service Worker

- **Issue:** Service Worker not updating on dev server
- **Workaround:** Use `npm run build && npm run preview` for testing SW
- **Reason:** Vite dev server doesn't serve Service Workers properly

### iOS Safari

- **Issue:** No automatic install prompt
- **Expected:** This is iOS behavior, not a bug
- **Solution:** Users must manually "Add to Home Screen"

### Dark Mode Flash

- **Issue:** Brief flash of light theme on initial load
- **Status:** Fixed with synchronous theme initialization
- **Test:** Hard refresh (Ctrl+Shift+R) should NOT show flash

---

## 📊 Test Results Template

Copy this template to track your testing:

```markdown
## Test Session: [Date]

### Dark Mode

- [ ] TC-DM-001: Manual Theme Switching
- [ ] TC-DM-002: Theme Dropdown Menu
- [ ] TC-DM-003: System Theme Sync
- [ ] TC-DM-004: Theme Persistence
- [ ] TC-DM-005: Accessibility
- [ ] TC-DM-006: Mobile Dark Mode

### PWA

- [ ] TC-PWA-001: Service Worker Registration
- [ ] TC-PWA-002: Offline Functionality
- [ ] TC-PWA-003: Android Chrome Installation
- [ ] TC-PWA-004: iOS Safari Installation
- [ ] TC-PWA-005: Manifest Validation
- [ ] TC-PWA-006: Caching Strategy
- [ ] TC-PWA-007: Update Notification
- [ ] TC-PWA-008: Standalone Mode Detection

### Issues Found

- None / [List issues]

### Notes

- [Add any observations]
```

---

## 🔗 Resources

**Documentation:**

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MDN: prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)

**Tools:**

- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - PWA audit
- [PWA Builder](https://www.pwabuilder.com/) - Manifest/SW validation
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - WCAG compliance

**Browser DevTools:**

- Chrome: DevTools → Application tab
- Firefox: DevTools → Storage tab → Service Workers
- Safari: Develop → Show Web Inspector → Storage

---

## ✅ Acceptance Criteria

### Dark Mode

- ✅ Theme toggle visible and functional
- ✅ All 3 modes work (Light, Dark, System)
- ✅ Theme persists across sessions
- ✅ No FOUC (flash of unstyled content)
- ✅ WCAG AA contrast compliance
- ✅ Smooth transitions (200ms)

### PWA

- ✅ Service Worker registers successfully
- ✅ App works offline with cached geodata
- ✅ Installable on Android Chrome
- ✅ Installable on iOS Safari (manual)
- ✅ Manifest valid and complete
- ✅ Update notifications functional
- ✅ Standalone mode detection works

---

## 🚀 Next Steps

After completing testing:

1. **Document Results** - Fill out test results template
2. **Report Issues** - Create GitHub issues for any bugs found
3. **Update README** - Add PWA installation instructions
4. **Deploy** - Push to GitHub Pages for public testing
5. **Monitor** - Track Service Worker registration in production

---

**Last Updated:** 2025-10-09
**Version:** Phase 3 - PWA + Dark Mode Complete
**Testers:** Ready for community testing
