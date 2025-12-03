# Manual Keyboard Navigation Test Checklist

**Date:** __________
**Tester:** __________
**Browser:** __________
**OS:** __________

---

## Skip Navigation

- [ ] Press Tab once on page load
- [ ] "Skip to main content" link is visible
- [ ] Link has high contrast (blue background, white text)
- [ ] Press Enter on skip link
- [ ] Focus moves to main game area
- [ ] Page scrolls smoothly to main content

**Status:** ❌ FAIL / ✅ PASS
**Notes:** _________________________________________________

---

## County Details Modal

### Opening Modal
- [ ] Click a county to open details modal
- [ ] Modal opens smoothly
- [ ] Focus moves to first interactive element

### Focus Trap
- [ ] Press Tab repeatedly
- [ ] Focus cycles: Close → Educational → Close
- [ ] Cannot tab out of modal to background
- [ ] Press Shift+Tab
- [ ] Focus cycles backwards correctly

### Escape Key
- [ ] Press Escape
- [ ] Modal closes immediately
- [ ] Focus returns to county that opened modal

**Status:** ❌ FAIL / ✅ PASS
**Notes:** _________________________________________________

---

## Educational Content Modal

### Opening Modal
- [ ] Open county details modal
- [ ] Click "View Educational Content" button
- [ ] Educational modal opens
- [ ] Focus moves to first tab

### Tab Navigation
- [ ] Press Tab to navigate tabs
- [ ] All tabs (Overview, History, Economy, Culture, Geography, Memory) are reachable
- [ ] Close button is reachable via Tab
- [ ] Tab content is keyboard accessible

### Focus Trap
- [ ] Cannot tab out of modal
- [ ] Shift+Tab works correctly
- [ ] Press Escape
- [ ] Modal closes, focus restored

**Status:** ❌ FAIL / ✅ PASS
**Notes:** _________________________________________________

---

## Hint Modal

### Opening Modal
- [ ] Click hint button during game
- [ ] Hint modal opens
- [ ] Focus moves to modal

### Focus Trap
- [ ] Tab through interactive elements
- [ ] Focus stays within modal
- [ ] Shift+Tab works correctly

### Close
- [ ] Press Escape
- [ ] Modal closes
- [ ] Focus returns to hint button
- [ ] Click "Got it!" button works

**Status:** ❌ FAIL / ✅ PASS
**Notes:** _________________________________________________

---

## Overall Assessment

**Total Tests:** 4
**Tests Passed:** ______
**Tests Failed:** ______

**Overall Status:** ❌ FAIL / ✅ PASS

**Recommendations:**
_________________________________________________
_________________________________________________
_________________________________________________

**Tester Signature:** __________
**Date:** __________
