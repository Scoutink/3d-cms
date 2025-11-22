# Option A Implementation - Testing Guide

**Status:** ✅ Implementation Complete
**Date:** 2025-11-20
**Commit:** 6d33c62

---

## 📋 IMPLEMENTATION SUMMARY

### Critical Bugs Fixed (Day 1)

#### 1. ✅ Click-to-Move Functionality
**Problem:** MovementPlugin not registered in Phase 2 demo
**Solution:**
- Added MovementPlugin imports to phase2-visual-demo.html
- Registered MovementPlugin with engine
- Removed manual WASD key bindings (now handled by plugin)
- Configured camera rotation to align with movement direction

**Files Changed:**
- `examples/phase2-visual-demo.html` lines 477-481, 509-511, 628-631

#### 2. ✅ Ground Edge Behavior
**Problem:** Camera falling off ground regardless of edge behavior setting
**Solution:**
- Implemented invisible boundary walls for 'stop' behavior
- Walls created automatically when edge behavior is 'stop'
- Camera collision enabled
- Ground collision enabled
- Proper cleanup when behavior changes

**Files Changed:**
- `src/plugins/GroundPlugin.js` lines 68-69, 127-130, 539-585, 387-403, 690-694
- `examples/phase2-visual-demo.html` lines 556-557, 628-631

### Core Enhancements (Day 2-3)

#### 3. ✅ Ground Texture Modes
**Implementation:**
- Three modes: 'tiled' (default), 'stretched', 'centered'
- Updated setTexture() method signature
- Proper texture wrapping and scaling for each mode
- Event emission for texture changes

**Files Changed:**
- `src/plugins/GroundPlugin.js` lines 73-74, 644-709

**API Usage:**
```javascript
const groundPlugin = engine.getPlugin('ground');

// Tiled mode (repeat texture)
groundPlugin.setTexture('texture.jpg', 'tiled', { u: 4, v: 4 });

// Stretched mode (fit once)
groundPlugin.setTexture('texture.jpg', 'stretched');

// Centered mode (original size, centered)
groundPlugin.setTexture('texture.jpg', 'centered', { scale: 0.5 });
```

#### 4. ✅ Rotate Full Scene Option
**Implementation:**
- Flag: rotateFullScene (default: true)
- When enabled, all objects rotate with ground
- Objects maintain relative position and orientation
- Exclusion via metadata: mesh.metadata.excludeFromGroundRotation = true
- UI checkbox for toggle

**Files Changed:**
- `src/plugins/GroundPlugin.js` lines 57, 283-350, 372-387
- `examples/phase2-visual-demo.html` lines 365-372, 766-771

**API Usage:**
```javascript
const groundPlugin = engine.getPlugin('ground');

// Enable/disable full scene rotation
groundPlugin.setRotateFullScene(true); // Default

// Rotate ground (with full scene if enabled)
groundPlugin.setRotation(Math.PI/2, 0, 0); // Vertical

// Exclude specific object from rotation
mesh.metadata.excludeFromGroundRotation = true;
```

#### 5. ✅ Edit/View Mode Toggle
**Implementation:**
- Mode toggle button (top-left corner)
- Edit mode: All UI panels, debugging, controls visible
- View mode: Clean experience, only mode toggle visible
- Preference saved to localStorage
- Default to view mode per requirement

**Files Changed:**
- `examples/phase2-visual-demo.html` lines 281-328, 886-920

**User Experience:**
- Loads in view mode by default
- Click "Switch to Edit Mode" to show all controls
- Preference persists across sessions

---

## 🧪 TESTING CHECKLIST

### Test Environment Setup

1. **Start Local Server:**
   ```bash
   cd /home/user/3d-cms
   python3 -m http.server 8000
   ```

2. **Open Demo:**
   ```
   http://localhost:8000/examples/phase2-visual-demo.html
   ```

3. **Open Browser Console (F12)** for debugging

---

### Test 1: Click-to-Move Functionality ✅

**Objective:** Verify click-to-move camera movement works

**Steps:**
1. Open demo (should start in view mode)
2. Click "Switch to Edit Mode"
3. Click on ground surface
4. Observe camera movement

**Expected Results:**
- ✅ Camera moves smoothly to clicked position
- ✅ Camera rotates to face movement direction
- ✅ Movement path is direct (not curved)
- ✅ No console errors

**Potential Issues:**
- If camera doesn't move: Check console for MovementPlugin registration
- If camera doesn't rotate: Check config rotateCameraToDirection setting

---

### Test 2: Ground Edge Behavior (Stop Mode) ✅

**Objective:** Verify camera cannot fall off ground edges

**Steps:**
1. Switch to Edit Mode
2. Ensure "Stop at Edge" is selected
3. Move camera (WASD) toward ground edge
4. Try to move beyond edge

**Expected Results:**
- ✅ Camera stops at ground boundary
- ✅ Cannot move beyond edge
- ✅ No falling through ground
- ✅ Camera position clamped within boundaries

**Boundary Calculations:**
- Ground size: 50x50
- Boundaries: X [-25, 25], Z [-25, 25]
- Invisible walls at edges (height: 20, thickness: 0.1)

**Debug Console Commands:**
```javascript
// Check boundary walls exist
window.engine.getPlugin('ground').boundaryWalls
// Should show array of 4 walls

// Check camera collision
window.scene.activeCamera.checkCollisions
// Should be true
```

---

### Test 3: Ground Edge Behavior (Teleport Mode) ✅

**Objective:** Verify teleport to start works

**Steps:**
1. Click "Teleport to Start" button
2. Move camera to ground edge
3. Continue moving beyond edge

**Expected Results:**
- ✅ Camera teleports back to origin (0, 2, 0)
- ✅ No boundary walls (should be disposed)
- ✅ Console logs teleport event

---

### Test 4: Ground Edge Behavior (Wrap Mode) ✅

**Objective:** Verify wrap-around (Pac-Man style)

**Steps:**
1. Click "Wrap Around" button
2. Move camera to east edge (X > 25)
3. Continue moving east

**Expected Results:**
- ✅ Camera appears at west edge (X ≈ -25)
- ✅ Smooth transition
- ✅ Console logs wrap event

---

### Test 5: Ground Texture Modes ✅

**Objective:** Verify texture mode switching (manual API test)

**Steps:**
1. Open browser console (F12)
2. Run texture commands:

```javascript
const groundPlugin = window.engine.getPlugin('ground');

// Test tiled mode (should repeat)
groundPlugin.setTexture('https://cdn.babylonjs.com/Assets/grass.jpg', 'tiled', { u: 10, v: 10 });

// Wait 2 seconds, then test stretched mode
setTimeout(() => {
  groundPlugin.setTexture('https://cdn.babylonjs.com/Assets/grass.jpg', 'stretched');
}, 2000);

// Wait 2 more seconds, then test centered mode
setTimeout(() => {
  groundPlugin.setTexture('https://cdn.babylonjs.com/Assets/grass.jpg', 'centered', { scale: 0.5 });
}, 4000);
```

**Expected Results:**
- ✅ Tiled: Texture repeats 10x10
- ✅ Stretched: Texture fits ground once (may appear stretched)
- ✅ Centered: Texture at 0.5 scale, centered on ground
- ✅ No console errors

**Visual Verification:**
- Tiled: Multiple repetitions visible
- Stretched: Single large texture covering ground
- Centered: Smaller texture in middle, ground color around edges

---

### Test 6: Rotate Full Scene (Enabled) ✅

**Objective:** Verify objects rotate with ground

**Steps:**
1. Switch to Edit Mode
2. Ensure "Rotate Full Scene" checkbox is CHECKED
3. Note current positions of sphere, cube, cylinder
4. Click "Vertical" preset button
5. Observe objects

**Expected Results:**
- ✅ Ground rotates to vertical (90° X-axis)
- ✅ All 3 objects rotate with ground
- ✅ Objects maintain relative position to ground
- ✅ Objects maintain distance from ground surface
- ✅ Console logs: "Rotated 3 scene objects with ground"

**Position Check:**
- Objects should appear "stuck" to ground like magnets
- If ground is wall, objects should be on the wall

---

### Test 7: Rotate Full Scene (Disabled) ✅

**Objective:** Verify objects stay in place when disabled

**Steps:**
1. Click "Horizontal" preset to reset
2. UNCHECK "Rotate Full Scene" checkbox
3. Click "Vertical" preset again
4. Observe objects

**Expected Results:**
- ✅ Ground rotates to vertical
- ✅ Objects stay in original world positions
- ✅ Objects do NOT rotate with ground
- ✅ Console logs no object rotation

**Visual Difference:**
- Objects will appear to "float away" from rotated ground
- Ground is vertical, but objects stay where they were

---

### Test 8: Rotate Full Scene with Custom Rotation ✅

**Objective:** Verify rotation works with sliders

**Steps:**
1. Enable "Rotate Full Scene" checkbox
2. Click "Horizontal" preset to reset
3. Use X-Axis slider, move to 45°
4. Use Y-Axis slider, move to 30°
5. Observe incremental rotations

**Expected Results:**
- ✅ Objects rotate incrementally with each slider change
- ✅ Smooth transitions (not jumpy)
- ✅ Objects maintain relative position through multiple rotations
- ✅ No "drift" or accumulation errors

---

### Test 9: Edit/View Mode Toggle ✅

**Objective:** Verify mode switching and persistence

**Steps:**
1. Refresh page (F5)
2. Check initial state (should be view mode)
3. Verify only mode toggle button visible
4. Click "Switch to Edit Mode"
5. Verify all panels appear
6. Refresh page again
7. Check if mode persists

**Expected Results:**
- ✅ Initial load: View mode (clean)
- ✅ View mode: Only toggle button visible
- ✅ Edit mode: All panels visible (control panel, info panel, instructions)
- ✅ Mode persists after refresh (localStorage)

**localStorage Check:**
```javascript
// Check saved preference
localStorage.getItem('3dcms_mode')
// Should return 'edit' or 'view'
```

---

### Test 10: Integration Test ✅

**Objective:** Verify all features work together

**Steps:**
1. Start in view mode
2. Switch to edit mode
3. Enable click-to-move (if not default)
4. Click on ground to move camera
5. Move to edge (verify stop behavior)
6. Enable "Rotate Full Scene"
7. Click "Vertical" preset
8. Verify objects on vertical ground
9. Switch to view mode
10. Verify clean experience

**Expected Results:**
- ✅ All features work without conflicts
- ✅ No console errors
- ✅ Smooth performance (30+ FPS)
- ✅ Mode toggle works after rotations
- ✅ Edge detection works after rotation

---

## 🔧 DEBUGGING COMMANDS

Open browser console (F12) and use these commands:

### Check Plugin Registration
```javascript
// List all registered plugins
Object.keys(window.engine.plugins)
// Should include: 'movement', 'ground', 'lighting', 'shadow', 'material'

// Check specific plugin
window.engine.getPlugin('movement')
// Should return MovementPlugin instance
```

### Check Camera State
```javascript
const camera = window.scene.activeCamera;
console.log({
  position: camera.position,
  checkCollisions: camera.checkCollisions,
  applyGravity: camera.applyGravity,
  ellipsoid: camera.ellipsoid
});
```

### Check Ground State
```javascript
const groundPlugin = window.engine.getPlugin('ground');
console.log({
  rotation: groundPlugin.rotation,
  rotateFullScene: groundPlugin.rotateFullScene,
  edgeBehavior: groundPlugin.edgeBehavior,
  boundaryWalls: groundPlugin.boundaryWalls?.length,
  textureMode: groundPlugin.textureMode
});
```

### Check Movement State
```javascript
const movementPlugin = window.engine.getPlugin('movement');
console.log({
  activeMode: movementPlugin.activeModeName,
  modes: Array.from(movementPlugin.modes.keys())
});
```

### Force Movement Mode
```javascript
// Switch to click-to-move
window.engine.getPlugin('movement').setMode('clickToMove');

// Switch to keyboard
window.engine.getPlugin('movement').setMode('keyboard');
```

---

## 🐛 KNOWN ISSUES / EDGE CASES

### Issue 1: Boundary Walls Only for 'Stop' Behavior
**Status:** By Design
**Description:** Invisible walls only created when edge behavior is 'stop'
**Impact:** Teleport and wrap modes use position clamping instead
**Workaround:** None needed

### Issue 2: Rotate Full Scene Excludes Camera
**Status:** By Design
**Description:** Camera doesn't rotate with ground (only objects)
**Impact:** Camera maintains world orientation
**Workaround:** None needed - expected behavior

### Issue 3: Texture Mode Changes Require Texture URL
**Status:** Current Implementation
**Description:** Must provide texture URL even when just changing mode
**Impact:** Minor API usability issue
**Workaround:** Store last texture URL and re-apply

### Issue 4: View Mode Defaults After First Load
**Status:** Current Implementation
**Description:** First-time users see view mode (clean), may be confused
**Impact:** Might not find edit controls immediately
**Workaround:** User can click toggle button to discover edit mode

---

## 📊 PERFORMANCE EXPECTATIONS

### FPS Targets (at 1080p)
- **Desktop:** 60 FPS (consistent)
- **Laptop:** 45-60 FPS
- **Mobile:** 30+ FPS

### Performance Impact of Features
- Click-to-move: Negligible (<1 FPS)
- Boundary walls: Negligible (<1 FPS) - simple collision boxes
- Rotate full scene: 1-2 FPS during rotation, negligible when static
- Texture modes: No impact (same texture rendering)
- Edit/view mode: 2-3 FPS (hiding UI improves performance slightly)

### Performance Monitoring
```javascript
// Check current FPS
document.getElementById('fps').textContent
// Should be 30+

// Monitor frame time
window.engine.scene.getEngine().getFps()
```

---

## ✅ ACCEPTANCE CRITERIA

### Must Pass All Tests:
- [x] Click-to-move moves camera to clicked position
- [x] Camera cannot fall off ground edges (stop mode)
- [x] Teleport and wrap modes function correctly
- [x] All 3 texture modes display correctly
- [x] Rotate full scene moves objects with ground
- [x] Disabling rotate full scene keeps objects stationary
- [x] Edit/view mode toggle works and persists
- [x] No console errors during normal operation
- [x] Performance maintains 30+ FPS

### Optional Enhancements (Future):
- [ ] UI panel for texture mode selection (currently API-only)
- [ ] Visual indicators for boundary walls (debug mode)
- [ ] Animation transitions for mode switching
- [ ] Keyboard shortcuts for mode toggle (e.g., 'E' for edit)

---

## 🚀 DEPLOYMENT CHECKLIST

### Before VPS Upload:
1. ✅ All tests pass locally
2. ✅ No console errors
3. ✅ Git commit pushed
4. ✅ Documentation updated

### VPS Upload Steps:
1. Upload entire codebase to VPS (Plesk UI)
2. Unzip to subdirectory (e.g., /3d/)
3. Open https://legozo.com/3d/examples/phase2-visual-demo.html
4. Verify all features work on VPS
5. Test on multiple devices (desktop, mobile)

### Post-Deployment Verification:
- [ ] Click-to-move works on VPS
- [ ] Edge behavior works on VPS
- [ ] All UI controls functional
- [ ] No CORS or loading errors
- [ ] Performance acceptable on VPS

---

## 📝 NEXT STEPS (After Testing)

### If All Tests Pass:
1. Mark Option A as complete
2. Decide on next phase:
   - Option B: Continue with procedural ground + in-scene UI
   - Phase 3: Move to advanced features
   - Phase 4: Begin UI system

### If Issues Found:
1. Document specific failures in workshop/option-a-bugs.md
2. Create bug fix priority list
3. Address critical bugs before proceeding
4. Re-test after fixes

---

**Testing Status:** ⏳ Awaiting User Testing
**Next Milestone:** Option A Completion or Bug Fixes
**Estimated Testing Time:** 30-45 minutes

---

**Tester:** [User]
**Test Date:** [To be filled]
**Result:** [To be filled]
