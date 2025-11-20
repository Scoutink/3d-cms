# 🧪 Simplified Control Scheme - Testing Guide

**Date:** 2025-11-20
**Commit:** `041cda8`
**Status:** ✅ IMPLEMENTED - READY FOR TESTING

---

## 🎯 What Changed

### **NEW SIMPLIFIED CONTROLS:**

```
✅ Left Click (no drag)     = Select Object / Walk to Location
✅ Left Click + Drag         = Rotate Camera
✅ Right Click               = (Reserved for Context Menu - future)
✅ Mouse Wheel               = Zoom
✅ WASD/Arrows              = Move Camera
```

### **SMART DETECTION:**
- **5 pixel threshold** = Ignores hand shake
- **300ms window** = Double-click detection
- **500ms threshold** = Hold/long-press detection

---

## 🧪 TESTING CHECKLIST

### **Test 1: Single Click on Object** ⬜
**Expected:** Should select object (NOT rotate camera)

**Steps:**
1. Open `examples/phase3-full-demo.html`
2. Click "Start Demo"
3. **Left-click on a colored object** (box, sphere, etc.)
4. Object should highlight/select
5. Camera should NOT rotate

**Console Log:**
```
[INP.3] Button pressed: LeftClick
[INP.3] LeftClick released - was a CLICK
```

---

### **Test 2: Single Click on Ground** ⬜
**Expected:** Should walk to that location (NOT rotate camera)

**Steps:**
1. **Left-click on the ground**
2. Camera should walk to that position
3. Camera should NOT rotate

**Console Log:**
```
[INP.3] Button pressed: LeftClick
[INP.3] LeftClick released - was a CLICK
[INP.1] Walking to: ...
```

---

### **Test 3: Click + Drag (Rotate Camera)** ⬜
**Expected:** Camera rotates smoothly

**Steps:**
1. **Left-click on canvas and hold**
2. **Drag mouse** (move more than 5 pixels)
3. Camera should start rotating
4. Release mouse button
5. Camera rotation should stop

**Console Log:**
```
[INP.3] Button pressed: LeftClick
[INP.3] Drag started - distance: X.X px
[INP.3] MouseMove with button held: LeftClick | Delta: ...
[INP.3] LeftClick released - was a DRAG
```

---

### **Test 4: Tiny Hand Shake (Should Still Be Click)** ⬜
**Expected:** Small movements ignored, treated as click

**Steps:**
1. **Left-click on object**
2. **Move mouse slightly** while clicking (< 5 pixels)
3. Object should still select
4. Camera should NOT rotate

**Console Log:**
```
[INP.3] Button pressed: LeftClick
(no "Drag started" message - movement ignored)
[INP.3] LeftClick released - was a CLICK
```

---

### **Test 5: Double-Click Detection** ⬜
**Expected:** Console shows double-click detected

**Steps:**
1. **Double-click on any object** (two quick clicks)
2. Should detect double-click

**Console Log:**
```
[INP.3] Button pressed: LeftClick
[INP.3] LeftClick released - was a CLICK
[INP.3] Button pressed: LeftClick
[INP.3] Double-click detected: LeftClick | Time between clicks: XXX ms
```

---

### **Test 6: Click and Hold (Long Press)** ⬜
**Expected:** Detects hold after 500ms

**Steps:**
1. **Left-click and hold** for more than 500ms
2. Don't move mouse (stay still)
3. Should detect hold

**Console Log:**
```
[INP.3] Button pressed: LeftClick
(wait 500ms)
[INP.3] Hold detected: LeftClick
[INP.3] LeftClick released - was a CLICK
```

---

### **Test 7: Drag Threshold Precision** ⬜
**Expected:** Exactly 5 pixels triggers drag

**Steps:**
1. Left-click and drag exactly 4 pixels → Should be click
2. Left-click and drag 6 pixels → Should start drag
3. Left-click and drag 10+ pixels → Should definitely be drag

**Console Log:**
```
4 pixels: No "Drag started" message
6 pixels: "Drag started - distance: 6.X px"
10 pixels: "Drag started - distance: 10.X px"
```

---

### **Test 8: Camera Rotation Smoothness** ⬜
**Expected:** Smooth camera rotation during drag

**Steps:**
1. Left-click + drag slowly
2. Camera should rotate smoothly
3. No lag or jitter
4. Release mouse
5. Camera should stop immediately

---

### **Test 9: Multi-Object Workflow** ⬜
**Expected:** Can select, then rotate camera, then select again

**Steps:**
1. **Click object 1** (select)
2. **Click + drag** (rotate camera)
3. **Click object 2** (select)
4. **Click ground** (walk there)
5. All should work without conflicts

---

### **Test 10: Context Menu Doesn't Appear** ⬜
**Expected:** Right-click does nothing (reserved for future)

**Steps:**
1. **Right-click** on canvas
2. No context menu should appear
3. (Feature reserved for future context menu implementation)

**Console Log:**
```
(Context menu prevented - no browser menu)
```

---

## 🎯 THRESHOLDS IMPLEMENTED

| Detection | Threshold | Purpose |
|-----------|-----------|---------|
| **Drag Start** | 5 pixels | Ignore hand shake |
| **Double-Click** | 300ms | Time window between clicks |
| **Hold/Long Press** | 500ms | Long press detection |

---

## 📊 Expected Behavior Summary

### **Single Click:**
- Move < 5 pixels
- Duration < 500ms
- Result: Select/Walk action

### **Double-Click:**
- Two clicks within 300ms
- Each click moves < 5 pixels
- Result: Double-click event

### **Drag:**
- Move >= 5 pixels
- Result: Camera rotation

### **Hold:**
- No movement
- Duration >= 500ms
- Result: Hold event

---

## 🐛 What to Look For

### **✅ GOOD SIGNS:**
- Single clicks work reliably
- Camera rotates only when dragging
- No accidental rotations from shaky hands
- Smooth camera rotation
- Console logs match expected behavior

### **❌ BAD SIGNS:**
- Single click rotates camera (threshold too low)
- Can't select objects (threshold too high)
- Camera doesn't rotate when dragging
- Jittery or laggy rotation
- Console shows wrong event types

---

## 📝 REPORTING ISSUES

If you find issues, please note:

1. **Which test failed?** (Test number)
2. **What happened?** (Actual behavior)
3. **Console logs?** (Copy/paste)
4. **Can you reproduce it?** (Every time / sometimes / once)

---

## 🔧 ADJUSTING THRESHOLDS

If needed, we can tune these values:

```javascript
// In MouseSource.js constructor:
this.dragThreshold = 5;         // Increase if too sensitive
this.doubleClickWindow = 300;   // Increase for slower clicks
this.holdThreshold = 500;       // Decrease for faster hold
```

**Current values are industry standard, but we can adjust based on your feedback!**

---

## ✅ COMPLETION CRITERIA

Day 5 testing complete when:
- ✅ All 10 tests pass
- ✅ Controls feel natural and responsive
- ✅ No accidental camera rotations
- ✅ No failures selecting objects
- ✅ Console logs show correct detection
- ✅ You're happy with the control scheme!

---

## 🚀 AFTER TESTING

**If all tests pass:**
1. I'll remove debug console logs
2. Add final documentation
3. Create control scheme reference guide
4. Move to Day 6 (edge cases and polish)

**If issues found:**
1. Report which tests failed
2. I'll investigate and fix immediately
3. Re-test until perfect

---

**Please test all 10 scenarios and let me know the results!** 🎮

Open your browser console (F12) to see debug logs!
