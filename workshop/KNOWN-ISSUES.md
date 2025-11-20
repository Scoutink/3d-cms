# 🐛 Known Issues - 3D CMS

**Last Updated:** 2025-11-20

---

## 🔴 Critical Issues

None.

---

## 🟡 Medium Priority Issues

### 1. Camera Penetrates Ground When Looking Down

**Status:** 🔍 IDENTIFIED - NOT YET FIXED
**Priority:** Medium
**Category:** Physics/Collision
**Affected Component:** Camera collision detection

**Description:**
When the camera is pointed downward and the user moves with keyboard controls (WASD), the camera can penetrate through the ground mesh.

**Reproduction Steps:**
1. Open `examples/phase3-full-demo.html`
2. Hold right-click and drag down to point camera toward ground
3. Press W/A/S/D to move the camera
4. Observe camera goes below ground level

**Expected Behavior:**
- Camera should collide with ground and not penetrate
- Camera should slide along ground surface when moving downward

**Root Cause:**
Not an input issue - this is a **collision detection** problem in the camera physics setup.

**Current Camera Settings** (from demo):
```javascript
camera.checkCollisions = true;
camera.applyGravity = true;
camera.ellipsoid = new BABYLON.Vector3(1, 1.5, 1);
```

**Possible Fixes:**
1. Adjust camera ellipsoid size (make taller/wider)
2. Add ground collision flags: `ground.checkCollisions = true`
3. Adjust camera.minZ or camera collision response
4. Add manual Y-position clamping (minimum height above ground)
5. Use a different camera type (ArcRotateCamera with limits)

**Recommended Fix:**
Add ground collision detection and Y-position clamping:
```javascript
ground.checkCollisions = true;

// In render loop or camera update:
if (camera.position.y < minHeight) {
    camera.position.y = minHeight;
}
```

**When to Fix:**
- **After** Day 7 of INP Phase 1 completion
- **Before** Phase 3.5 (Edit/View mode restoration)
- Can be deferred to Phase 4 (Infinite Terrain) if needed

**Related Files:**
- `examples/phase3-full-demo.html` (line 428-430)
- Camera setup in demo scenes

**Notes:**
- This is a **physics/collision** issue, NOT an input system bug
- The InputManager is working correctly
- The issue existed before InputManager integration
- Does not block Day 5 testing

---

## 🟢 Low Priority Issues

None.

---

## ✅ Resolved Issues

### 1. ~~Mouse Look Without Click~~ - FIXED

**Date Fixed:** 2025-11-20
**Commit:** TBD

**Original Issue:**
Camera rotated when just moving mouse, even without clicking. Camera also rotated when moving cursor to browser menu.

**Fix Applied:**
1. Updated `MouseSource.handleMouseMove()` to only send events when a button is held
2. Added `heldButton` property to mouse move events
3. Added `rightClickHeld`, `leftClickHeld`, `middleClickHeld` conditions to InputContext
4. Updated ViewModeContext and EditModeContext to require `rightClickHeld` condition for lookAround action

**Result:**
- ✅ Camera now only rotates when right-click is held and dragged
- ✅ Mouse cursor can move freely without affecting camera
- ✅ Standard 3D editor behavior (Blender, Unity, Unreal)

**Files Modified:**
- `src/input/sources/MouseSource.js`
- `src/input/contexts/InputContext.js`
- `src/input/contexts/ViewModeContext.js`
- `src/input/contexts/EditModeContext.js`

---

### 2. ~~InputSource Constructor Parameters~~ - FIXED

**Date Fixed:** 2025-11-20
**Commit:** `1ee8bc8`

**Original Issue:**
```
TypeError: Cannot read properties of undefined (reading 'addEventListener')
```

**Root Cause:**
BabylonEngine was passing wrong parameters to InputSource constructors:
- MouseSource expected 3 params but only got 2
- TouchSource expected canvas but got scene

**Fix Applied:**
```javascript
// Before (WRONG)
const mouseSource = new MouseSource(this.inputManager, this.scene);
const touchSource = new TouchSource(this.inputManager, this.scene);

// After (CORRECT)
const mouseSource = new MouseSource(this.inputManager, this.scene, this.canvas);
const touchSource = new TouchSource(this.inputManager, this.canvas);
```

---

## 📋 Issue Tracking

**Total Issues:** 1 open, 2 resolved
**Critical:** 0
**Medium:** 1
**Low:** 0

---

*This document tracks all known issues in the 3D CMS project.*
*Updated after each testing phase and code review.*
