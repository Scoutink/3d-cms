# Phase 3 Testing Guide
## Advanced Features Validation

**Version:** 1.0
**Date:** 2025-11-20
**Phase:** 3 (Advanced Features)
**Status:** Complete - Ready for Testing

---

## Overview

This guide provides comprehensive testing procedures for all Phase 3 plugins:
- **AssetPlugin**: Dynamic asset loading and management
- **InteractionPlugin**: Advanced object interactions
- **UIPlugin**: In-engine UI system
- **PerformancePlugin**: Performance monitoring and optimization

**Testing Environment:**
- **VPS URL**: https://legozo.com/3d/
- **Demo Files**:
  - `examples/phase3-asset-demo.html` - Asset loading demo
  - `examples/phase3-full-demo.html` - Full integration demo
- **Browser**: Chrome/Firefox/Edge (latest versions)
- **Device**: Desktop + Mobile (optional)

---

## Pre-Testing Checklist

Before starting tests, verify:

- [ ] All files uploaded to VPS (use Plesk UI)
- [ ] Files unzipped in correct subdirectory
- [ ] Browser console open (F12) for debugging
- [ ] Network tab open to monitor asset loading
- [ ] FPS counter visible in browser
- [ ] No previous errors in console before test starts

---

## Test Suite 1: AssetPlugin

### Test 1.1: Model Loading (Basic)
**File**: `examples/phase3-asset-demo.html`

**Steps:**
1. Open demo in browser
2. Wait for scene to initialize
3. Observe loading screen with progress bar

**Expected Results:**
- ✅ Loading screen appears immediately
- ✅ Progress bar animates from 0% to 100%
- ✅ Loading screen fades out when complete
- ✅ Scene visible with ground and demo objects
- ✅ Console shows: `[AST] Model loaded: demoObject`

**Failure Signs:**
- ❌ "Failed to load model" in console
- ❌ Progress bar stuck at certain percentage
- ❌ Loading screen never disappears
- ❌ 404 errors in Network tab

---

### Test 1.2: Asset Registry
**File**: `examples/phase3-asset-demo.html`

**Steps:**
1. Open browser console
2. Type: `window.assetPlugin.listAssets()`
3. Verify output

**Expected Results:**
```javascript
// Console output should include:
{
  'obj0': { type: 'model', meshes: [...], materials: [...] },
  'obj1': { type: 'model', meshes: [...], materials: [...] },
  // ... more objects
}
```

**Verification:**
- ✅ All 6 demo objects listed
- ✅ Each has type: 'model'
- ✅ Meshes array not empty
- ✅ No undefined or null values

---

### Test 1.3: Asset Disposal
**File**: `examples/phase3-asset-demo.html`

**Steps:**
1. Open browser console
2. Count initial meshes: `scene.meshes.length`
3. Dispose asset: `window.assetPlugin.disposeAsset('obj0')`
4. Count meshes again: `scene.meshes.length`

**Expected Results:**
- ✅ First object disappears from scene
- ✅ Mesh count decreases by at least 1
- ✅ Console shows: `[AST] Asset disposed: obj0`
- ✅ No errors thrown

**Failure Signs:**
- ❌ Object still visible
- ❌ Mesh count unchanged
- ❌ "Cannot dispose undefined" error

---

## Test Suite 2: InteractionPlugin

### Test 2.1: Hover Detection
**File**: `examples/phase3-full-demo.html`

**Steps:**
1. Open demo
2. Wait for objects to load
3. Move mouse over each object (without clicking)
4. Move mouse away from objects

**Expected Results:**
- ✅ Object scales up by 10% on hover (visual feedback)
- ✅ Tooltip appears above object showing name and instructions
- ✅ Object returns to normal scale when mouse exits
- ✅ Tooltip disappears when mouse exits
- ✅ Console shows: `[INT.1] Hover enter: obj0`, `[INT.1] Hover exit: obj0`

**Failure Signs:**
- ❌ No visual feedback on hover
- ❌ Tooltip doesn't appear
- ❌ Object stays scaled after mouse exit
- ❌ Hover not detected on some objects

---

### Test 2.2: Click Selection
**File**: `examples/phase3-full-demo.html`

**Steps:**
1. Click on first object (box)
2. Observe visual changes
3. Check HUD "Selected" counter
4. Click on ground (empty space)
5. Verify deselection

**Expected Results:**
- ✅ Object gets emissive glow (selection highlight)
- ✅ HUD "Selected" count changes to 1
- ✅ Console shows: `[INT.3] Selected: obj0`
- ✅ Clicking ground deselects object
- ✅ Emissive glow removed
- ✅ HUD "Selected" count returns to 0

**Failure Signs:**
- ❌ No visual selection feedback
- ❌ HUD counter not updating
- ❌ Cannot deselect by clicking ground

---

### Test 2.3: Multi-Selection (Ctrl+Click)
**File**: `examples/phase3-full-demo.html`

**Steps:**
1. Click first object (box)
2. Hold Ctrl and click second object (sphere)
3. Hold Ctrl and click third object (cylinder)
4. Check HUD "Selected" counter
5. Click ground without Ctrl

**Expected Results:**
- ✅ All 3 objects have selection glow
- ✅ HUD shows "Selected: 3"
- ✅ Console shows 3 selection messages
- ✅ Clicking ground deselects all
- ✅ All glows removed

**Failure Signs:**
- ❌ Ctrl+click replaces selection instead of adding
- ❌ Counter doesn't increment correctly
- ❌ Cannot deselect all at once

---

### Test 2.4: Drag and Drop
**File**: `examples/phase3-full-demo.html`

**Steps:**
1. Click and hold on first object
2. Move mouse while holding button down
3. Release mouse button
4. Verify object follows cursor on ground plane

**Expected Results:**
- ✅ Object follows mouse cursor smoothly
- ✅ Object constrained to ground plane (Y position constant)
- ✅ Object position updates in real-time
- ✅ Console shows: `[INT.2] Drag start: obj0`, `[INT.2] Drag end: obj0`
- ✅ Object remains selected after drag

**Failure Signs:**
- ❌ Object doesn't move
- ❌ Object flies off into space (not constrained to ground)
- ❌ Stuttering or lag during drag
- ❌ Object snaps back to original position

---

### Test 2.5: Double-Click Handler
**File**: Test with custom code or modified demo

**Steps:**
1. Open browser console
2. Register double-click handler:
```javascript
const plugin = window.engine.getPlugin('interaction');
const mesh = scene.getMeshByName('obj0');
plugin.makeClickable(mesh, {
    onDoubleClick: () => console.log('DOUBLE CLICKED!')
});
```
3. Double-click the object quickly

**Expected Results:**
- ✅ Console shows: `DOUBLE CLICKED!`
- ✅ Event fires only once per double-click
- ✅ Single clicks don't trigger double-click handler

---

## Test Suite 3: UIPlugin

### Test 3.1: HUD System
**File**: `examples/phase3-full-demo.html`

**Steps:**
1. Open demo
2. Observe top-left corner of screen
3. Verify HUD elements are visible and updating

**Expected Results:**
- ✅ HUD visible in top-left corner
- ✅ Shows: FPS, Objects count, Selected count, Quality tier
- ✅ FPS updates every frame (smooth animation)
- ✅ Text is readable (good contrast against background)
- ✅ HUD doesn't block interactions with 3D scene

**Failure Signs:**
- ❌ HUD not visible
- ❌ Text overlaps or unreadable
- ❌ HUD values not updating
- ❌ HUD blocks clicks to 3D objects

---

### Test 3.2: Tooltips (Mesh-Linked)
**File**: `examples/phase3-full-demo.html`

**Steps:**
1. Hover over any object
2. Rotate camera while hovering
3. Move object (drag) while tooltip visible
4. Observe tooltip behavior

**Expected Results:**
- ✅ Tooltip appears above object (50px offset)
- ✅ Tooltip follows object during camera rotation
- ✅ Tooltip follows object during drag
- ✅ Tooltip shows correct object name and instructions
- ✅ Tooltip disappears on hover exit

**Failure Signs:**
- ❌ Tooltip doesn't follow object
- ❌ Tooltip positioned incorrectly
- ❌ Wrong text displayed
- ❌ Tooltip doesn't hide on exit

---

### Test 3.3: Performance Panel
**File**: `examples/phase3-full-demo.html`

**Steps:**
1. Click "Performance Metrics" button in welcome message
2. Observe panel contents
3. Interact with scene (move objects, rotate camera)
4. Verify metrics update

**Expected Results:**
- ✅ Panel appears in center of screen
- ✅ Shows current metrics: FPS, frame time, draw calls, vertices, faces
- ✅ Shows recommendations (if any)
- ✅ Metrics update in real-time
- ✅ Panel has close button

**Metrics to Verify:**
- FPS: Should be 30-60 on decent hardware
- Frame time: Should be 16-33ms
- Draw calls: Should be < 100
- Vertices: Depends on scene complexity
- Faces: Should be reasonable (< 100K)

**Failure Signs:**
- ❌ Panel doesn't appear
- ❌ Metrics show 0 or NaN
- ❌ Recommendations don't appear
- ❌ Cannot close panel

---

### Test 3.4: Buttons (Hover & Click)
**File**: `examples/phase3-full-demo.html`

**Steps:**
1. Locate "Enable Auto-Optimization" button in welcome message
2. Hover over button (don't click)
3. Click button
4. Observe behavior

**Expected Results:**
- ✅ Button background changes on hover (lighter color)
- ✅ Clicking button triggers action
- ✅ Console shows: `[PRF.3] Auto-optimization enabled`
- ✅ Button remains responsive after click

**Failure Signs:**
- ❌ No hover effect
- ❌ Click doesn't trigger action
- ❌ Button becomes unresponsive

---

## Test Suite 4: PerformancePlugin

### Test 4.1: Metrics Collection
**File**: `examples/phase3-full-demo.html`

**Steps:**
1. Open demo
2. Open browser console
3. Type: `window.performancePlugin.getMetrics()`
4. Verify output structure

**Expected Results:**
```javascript
{
  fps: 60,              // Current FPS
  frameTime: 16.67,     // Frame time in ms
  drawCalls: 15,        // Number of draw calls
  totalVertices: 5000,  // Total vertices in scene
  totalFaces: 2500,     // Total faces (triangles)
  textureCount: 8,      // Number of textures
  meshCount: 12         // Number of meshes
}
```

**Verification:**
- ✅ All properties present
- ✅ No NaN or undefined values
- ✅ FPS is reasonable (> 20)
- ✅ Values update on subsequent calls

---

### Test 4.2: FPS History & Averaging
**File**: `examples/phase3-full-demo.html`

**Steps:**
1. Open browser console
2. Type: `window.performancePlugin.getAverageFPS()`
3. Note the value
4. Create heavy load (rapidly drag/rotate for 5 seconds)
5. Check average FPS again

**Expected Results:**
- ✅ Initial average FPS: 55-60
- ✅ After load, average FPS decreases
- ✅ Average is smoother than instantaneous FPS
- ✅ Console shows rolling average calculation

**Calculation:**
- FPS history size: 60 frames (1 second at 60 FPS)
- Average = sum of last 60 FPS values / 60

---

### Test 4.3: Quality Tier System
**File**: `examples/phase3-full-demo.html`

**Steps:**
1. Open browser console
2. Check current tier: `window.performancePlugin.getQualityTier()`
3. Manually change tier: `window.performancePlugin.setQualityTier('low')`
4. Observe visual changes
5. Try all tiers: ultra → high → medium → low → potato

**Expected Results:**
- ✅ Initial tier: 'high'
- ✅ Setting 'low' reduces shadow quality
- ✅ HUD shows updated tier name
- ✅ Console shows: `[PRF.5] Quality tier changed: high → low`
- ✅ Visual difference between tiers is noticeable

**Quality Tier Settings:**
| Tier | Shadow Quality | Shadow Map | Max Lights | Antialiasing |
|------|----------------|------------|------------|--------------|
| Ultra | Ultra | 4096 | 8 | Yes |
| High | High | 2048 | 6 | Yes |
| Medium | Medium | 1024 | 4 | Yes |
| Low | Low | 512 | 2 | No |
| Potato | Off | 0 | 1 | No |

---

### Test 4.4: Auto-Optimization
**File**: `examples/phase3-full-demo.html`

**Steps:**
1. Click "Enable Auto-Optimization" button
2. Create artificial load (stress test):
```javascript
// In console:
for(let i = 0; i < 100; i++) {
    const box = BABYLON.MeshBuilder.CreateBox('stress' + i, {size: 2}, scene);
    box.position.x = Math.random() * 100 - 50;
    box.position.z = Math.random() * 100 - 50;
}
```
3. Wait 5-10 seconds
4. Observe FPS and quality tier changes

**Expected Results:**
- ✅ Console shows: `[PRF.3] Auto-optimization enabled (target: 30 FPS)`
- ✅ After stress test, FPS drops below 30
- ✅ Within 5 seconds, quality tier downgrades automatically
- ✅ Console shows: `[EVT.2] Event emitted: performance:fps:low`
- ✅ FPS stabilizes closer to target (30 FPS)
- ✅ HUD shows new quality tier

**Optimization Logic:**
- Check every 5 seconds
- If avg FPS < (target - 5): downgrade quality
- If avg FPS > (target + 10): upgrade quality (after 2min stability)
- If avg FPS < 15: emergency downgrade to 'potato'

**Failure Signs:**
- ❌ Quality never changes despite low FPS
- ❌ Optimization triggers too frequently (< 1 min apart)
- ❌ FPS doesn't improve after downgrade

---

### Test 4.5: Performance Recommendations
**File**: `examples/phase3-full-demo.html`

**Steps:**
1. Open browser console
2. Type: `window.performancePlugin.getRecommendations()`
3. Review recommendations

**Expected Results:**
Recommendations appear when:
- ✅ Draw calls > 100: Suggests mesh merging
- ✅ Total faces > 100K: Suggests LOD or simplification
- ✅ FPS < 30: Critical warning, suggests auto-optimization
- ✅ Texture count > 50: Suggests texture atlasing

**Example Output:**
```javascript
[
  {
    type: 'critical',
    message: 'Low FPS (24). Performance issues detected.',
    action: 'Enable auto-optimization or reduce quality'
  },
  {
    type: 'warning',
    message: 'High draw calls (120). Consider mesh merging.',
    action: 'Merge meshes or reduce object count'
  }
]
```

---

## Test Suite 5: Integration Testing

### Test 5.1: All Plugins Working Together
**File**: `examples/phase3-full-demo.html`

**Complete Workflow Test:**

1. **Load & Initialize**
   - Open demo
   - Wait for loading screen
   - Verify all 6 objects visible

2. **Asset Management**
   - Console: `window.assetPlugin.listAssets()`
   - Verify all 6 objects registered

3. **Interaction**
   - Hover over 3 different objects
   - Select 2 objects (Ctrl+click)
   - Drag 1 object to new position

4. **UI Response**
   - HUD updates selection count to 2
   - Tooltips follow objects during drag
   - FPS counter updates smoothly

5. **Performance Monitoring**
   - Open Performance Metrics panel
   - View current stats
   - Enable auto-optimization

**Success Criteria:**
- ✅ All steps complete without errors
- ✅ No console errors or warnings
- ✅ All plugins respond to events
- ✅ UI remains responsive throughout
- ✅ FPS remains > 25

---

### Test 5.2: Event Communication
**File**: `examples/phase3-full-demo.html`

**Steps:**
1. Open browser console
2. Monitor all plugin events:
```javascript
const events = window.engine.events;

events.on('asset:loaded', (data) => console.log('Asset loaded:', data));
events.on('interaction:selected', (data) => console.log('Selected:', data));
events.on('interaction:drag_start', (data) => console.log('Drag start:', data));
events.on('performance:quality:changed', (data) => console.log('Quality changed:', data));
```
3. Interact with scene
4. Verify events fire correctly

**Expected Results:**
- ✅ Events fire in correct order
- ✅ Event data contains expected properties
- ✅ Multiple plugins can listen to same event
- ✅ No event flooding (reasonable frequency)

---

### Test 5.3: Plugin Dependencies
**File**: Any demo file

**Dependency Chain:**
```
AssetPlugin (loads models)
    ↓
InteractionPlugin (makes them interactive)
    ↓
UIPlugin (adds tooltips)
    ↓
PerformancePlugin (monitors everything)
```

**Test Steps:**
1. Comment out AssetPlugin in demo
2. Reload page
3. Verify graceful degradation

**Expected Results:**
- ✅ InteractionPlugin doesn't crash (handles missing assets)
- ✅ UIPlugin still works (tooltips on manual objects)
- ✅ PerformancePlugin still monitors scene
- ✅ Console shows warnings (not errors)

---

## Test Suite 6: Edge Cases & Error Handling

### Test 6.1: Asset Loading Failure
**File**: Create test HTML with invalid asset URL

**Steps:**
1. Modify asset URL to non-existent file
2. Open demo
3. Observe error handling

**Expected Results:**
- ✅ Console error: `[AST.1] Failed to load model: 404`
- ✅ Loading screen shows error message
- ✅ Scene continues to work with available assets
- ✅ No complete crash

---

### Test 6.2: Interaction on Disposed Mesh
**File**: `examples/phase3-full-demo.html`

**Steps:**
1. Open console
2. Dispose an object: `window.assetPlugin.disposeAsset('obj0')`
3. Try to hover over that position
4. Try to click that position

**Expected Results:**
- ✅ No errors thrown
- ✅ Interaction gracefully fails
- ✅ Console shows: `[INT] Mesh not found or disposed`
- ✅ Other objects still interactive

---

### Test 6.3: Rapid Quality Tier Changes
**File**: `examples/phase3-full-demo.html`

**Steps:**
1. Open console
2. Rapidly change tiers:
```javascript
const plugin = window.performancePlugin;
plugin.setQualityTier('ultra');
plugin.setQualityTier('low');
plugin.setQualityTier('high');
plugin.setQualityTier('potato');
plugin.setQualityTier('medium');
```
3. Observe behavior

**Expected Results:**
- ✅ All changes apply successfully
- ✅ No visual glitches or crashes
- ✅ Final tier is 'medium'
- ✅ Events fire for each change

---

### Test 6.4: Memory Leak Check (Long-Running)
**File**: `examples/phase3-full-demo.html`

**Steps:**
1. Open demo
2. Open browser Memory Profiler (F12 → Memory)
3. Take heap snapshot
4. Interact with scene for 5 minutes:
   - Drag objects
   - Select/deselect
   - Rotate camera
   - Open/close panels
5. Take another heap snapshot
6. Compare memory usage

**Expected Results:**
- ✅ Memory usage stable or slight increase (< 50MB)
- ✅ No continuous growth (leak indicator)
- ✅ Detached DOM nodes < 100
- ✅ No retained event listeners

**Failure Signs:**
- ❌ Memory grows continuously (> 100MB increase)
- ❌ Hundreds of detached nodes
- ❌ Browser becomes sluggish over time

---

## Performance Benchmarks

### Minimum Requirements

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| FPS | 60 | 30-60 | < 30 |
| Frame Time | < 16.67ms | 16.67-33ms | > 33ms |
| Load Time | < 2s | 2-5s | > 5s |
| Draw Calls | < 50 | 50-100 | > 100 |
| Memory Usage | < 200MB | 200-500MB | > 500MB |

### Device-Specific Targets

**High-End Desktop** (RTX 3060+, i7+, 16GB RAM):
- FPS: 60 (locked)
- Quality: Ultra
- Load time: < 1s

**Mid-Range Desktop** (GTX 1060, i5, 8GB RAM):
- FPS: 45-60
- Quality: High/Medium
- Load time: 1-3s

**Low-End Laptop** (Integrated GPU, i3, 4GB RAM):
- FPS: 30-45
- Quality: Low
- Load time: 3-5s

**Mobile** (Modern smartphone):
- FPS: 30+
- Quality: Low/Potato
- Load time: 5-10s

---

## Acceptance Criteria Validation

### Phase 3 Requirements ✓

#### AssetPlugin Acceptance Criteria:
- ✅ [AST.1] Load GLTF/GLB models dynamically
- ✅ [AST.2] Load textures with progress callbacks
- ✅ [AST.3] Asset registry with get/list/dispose methods
- ✅ [AST.4] Batch preloading support
- ✅ [AST.5] Memory management (disposal)
- ✅ [AST.6] Events: asset:loaded, asset:progress, asset:error

#### InteractionPlugin Acceptance Criteria:
- ✅ [INT.1] Hover detection with enter/exit callbacks
- ✅ [INT.2] Drag & drop with plane constraints
- ✅ [INT.3] Selection system with visual feedback
- ✅ [INT.4] Click handlers (single, double, right-click)
- ✅ [INT.5] Multi-selection with Ctrl+click
- ✅ [INT.6] Events: interaction:hover, interaction:click, interaction:drag, interaction:selected

#### UIPlugin Acceptance Criteria:
- ✅ [UI.1] HUD system with text labels
- ✅ [UI.2] Buttons with hover and click handlers
- ✅ [UI.3] Panels with layouts (stack, grid)
- ✅ [UI.4] Tooltips linked to 3D meshes
- ✅ [UI.5] Progress bars with percentage display
- ✅ [UI.6] All UI non-blocking to 3D interactions

#### PerformancePlugin Acceptance Criteria:
- ✅ [PRF.1] Real-time FPS and metrics tracking
- ✅ [PRF.2] LOD (Level of Detail) system
- ✅ [PRF.3] Auto-optimization based on FPS targets
- ✅ [PRF.4] Quality tier management (5 tiers)
- ✅ [PRF.5] Performance recommendations
- ✅ [PRF.6] Events: performance:quality:changed, performance:fps:low

---

## Common Issues & Troubleshooting

### Issue 1: "Failed to initialize demo"
**Symptoms**: Error message in console, blank screen

**Possible Causes:**
1. Files not uploaded correctly to VPS
2. Wrong directory structure
3. CORS issues with assets

**Solutions:**
- Verify all files in correct locations
- Check browser console for 404 errors
- Ensure subdirectory matches URL path
- Check Plesk file permissions

---

### Issue 2: Click-to-move not working
**Symptoms**: Clicking ground does nothing

**Possible Causes:**
1. MovementPlugin mode not activated
2. Ground mesh not pickable
3. Boundary walls blocking raycasts

**Solutions:**
- Verify `ground.isPickable = true`
- Verify `wall.isPickable = false`
- Check MovementPlugin activation in demo
- See commit 453f563 for fix details

---

### Issue 3: Low FPS / Performance Issues
**Symptoms**: FPS < 30, stuttering, lag

**Possible Causes:**
1. Too many objects in scene
2. High shadow quality on low-end device
3. Large texture sizes
4. No optimization enabled

**Solutions:**
- Enable auto-optimization
- Manually set lower quality tier
- Reduce object count in demo
- Check device specifications

---

### Issue 4: Tooltips not appearing
**Symptoms**: Hover works but no tooltips

**Possible Causes:**
1. UIPlugin not initialized
2. Tooltips not linked to meshes
3. Z-index issues

**Solutions:**
- Verify UIPlugin in plugin list
- Check `linkWithMesh()` called correctly
- Inspect DOM for tooltip elements
- Check tooltip visibility in CSS

---

### Issue 5: Selection glow not visible
**Symptoms**: Objects select but no visual feedback

**Possible Causes:**
1. Material doesn't support emissive color
2. Emissive color too dark
3. Lights too bright (washing out glow)

**Solutions:**
- Use PBR materials (support emissive)
- Increase emissive intensity
- Adjust scene lighting
- Check material properties in console

---

## Regression Testing

After any bug fixes or changes, run this quick regression suite:

### Quick Smoke Test (5 minutes)

1. **Load Test**
   - Open `phase3-full-demo.html`
   - Wait for loading screen to complete
   - Verify 6 objects visible

2. **Interaction Test**
   - Hover 1 object (verify scaling)
   - Click 1 object (verify selection glow)
   - Drag 1 object (verify movement)

3. **UI Test**
   - Check HUD visible and updating
   - Hover object (verify tooltip)
   - Open performance panel

4. **Performance Test**
   - Check FPS > 25
   - Enable auto-optimization
   - Verify no console errors

**Pass Criteria**: All 4 tests complete without errors in < 5 minutes

---

## VPS-Specific Testing Notes

### Upload Checklist for VPS

1. **Files to Upload** (via Plesk UI):
   - All `/src` directory contents
   - All `/examples` directory contents
   - `/lib` directory (Babylon.js)
   - `/config` directory

2. **Directory Structure**:
```
/httpdocs/3d/
├── src/
│   ├── core/
│   ├── plugins/
│   └── ...
├── examples/
│   ├── phase3-full-demo.html
│   └── ...
├── lib/
└── config/
```

3. **File Permissions**:
   - HTML files: 644
   - JS files: 644
   - Directories: 755

4. **CORS Configuration**:
   - If using external assets, configure CORS headers
   - Add to `.htaccess` if needed

5. **Cache Busting**:
   - After updates, clear browser cache
   - Use Ctrl+Shift+R (hard refresh)
   - Or add query params: `?v=2`

---

## Test Results Template

Use this template to document test results:

```
## Test Session Report

**Date**: 2025-11-20
**Tester**: [Your Name]
**Environment**:
- URL: https://legozo.com/3d/examples/phase3-full-demo.html
- Browser: Chrome 120
- Device: Desktop (Windows 11)
- Screen Resolution: 1920x1080

### Test Results:

#### AssetPlugin:
- [✓] Test 1.1: Model Loading - PASS
- [✓] Test 1.2: Asset Registry - PASS
- [✓] Test 1.3: Asset Disposal - PASS

#### InteractionPlugin:
- [✓] Test 2.1: Hover Detection - PASS
- [✓] Test 2.2: Click Selection - PASS
- [✓] Test 2.3: Multi-Selection - PASS
- [✓] Test 2.4: Drag and Drop - PASS
- [✓] Test 2.5: Double-Click - PASS

#### UIPlugin:
- [✓] Test 3.1: HUD System - PASS
- [✓] Test 3.2: Tooltips - PASS
- [✓] Test 3.3: Performance Panel - PASS
- [✓] Test 3.4: Buttons - PASS

#### PerformancePlugin:
- [✓] Test 4.1: Metrics Collection - PASS
- [✓] Test 4.2: FPS Averaging - PASS
- [✓] Test 4.3: Quality Tiers - PASS
- [✓] Test 4.4: Auto-Optimization - PASS
- [✓] Test 4.5: Recommendations - PASS

#### Integration:
- [✓] Test 5.1: All Plugins Together - PASS
- [✓] Test 5.2: Event Communication - PASS
- [✓] Test 5.3: Plugin Dependencies - PASS

#### Performance:
- FPS: 58 (avg)
- Frame Time: 17.2ms
- Load Time: 1.8s
- Memory Usage: 185MB

### Issues Found:
1. [None / List any issues]

### Notes:
- All acceptance criteria met
- Phase 3 complete and ready for production
```

---

## Next Steps After Testing

Once all tests pass:

1. **Mark Phase 3 Complete**
   - Update foundation-plan.md
   - Move to Phase 4 planning

2. **Production Deployment**
   - Deploy to production VPS
   - Monitor for first 24 hours
   - Gather user feedback

3. **Performance Tuning**
   - Analyze real-world metrics
   - Adjust quality tier thresholds
   - Optimize based on user devices

4. **Documentation**
   - Create user guide
   - Write API reference
   - Record demo videos

---

## Conclusion

This testing guide covers all Phase 3 functionality. Complete all test suites to ensure the system meets requirements and is ready for production use.

**Estimated Testing Time:**
- Full suite: 2-3 hours
- Quick smoke test: 5 minutes
- Integration testing: 30 minutes
- Performance benchmarking: 1 hour

**Success Criteria:**
- ✅ All 50+ tests pass
- ✅ FPS > 30 on target hardware
- ✅ No console errors
- ✅ All acceptance criteria validated
- ✅ Clean memory profile (no leaks)

Good luck with testing! 🚀
