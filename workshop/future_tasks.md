# Future Tasks & Development Roadmap

## Overview

This document outlines the prioritized development roadmap for transforming the current 3D prototype into a production-ready WordPress 3D CMS plugin. Tasks are organized by priority, estimated complexity, and dependencies.

---

## Priority Legend
- 🔴 **Critical** - Blockers for MVP release
- 🟠 **High** - Important features for usability
- 🟡 **Medium** - Nice-to-have enhancements
- 🟢 **Low** - Future optimizations and polish

## Complexity Scale
- ⚡ **Simple** (1-3 days)
- ⚡⚡ **Moderate** (4-7 days)
- ⚡⚡⚡ **Complex** (1-2 weeks)
- ⚡⚡⚡⚡ **Very Complex** (2-4 weeks)

---

## Phase 0: Code Cleanup & Preparation
*Estimated Duration: 1 week*

### 🔴 Critical Issues to Fix

#### 1. Remove Duplicate Object Count Updates
- **File:** scene.js:161 and index.php:185-189
- **Issue:** Object count updated in two places (render loop + setInterval)
- **Solution:** Remove setInterval from index.php, keep render loop update only
- **Priority:** 🔴 Critical
- **Complexity:** ⚡ Simple (30 minutes)

#### 2. Implement Missing Q/E Key Controls
- **File:** scene.js:10-22
- **Issue:** Controls panel (index.php:168-169) documents Q/E for up/down, but not implemented
- **Solution:**
  ```javascript
  camera.keysUp.push(81);    // Q key - pan up
  camera.keysDown.push(69);  // E key - pan down
  // Note: May conflict with default Q/E for roll - need custom handler
  ```
- **Priority:** 🔴 Critical
- **Complexity:** ⚡ Simple (1-2 hours)

#### 3. Fix Inline Event Handler Security Risk
- **File:** scene.js:131
- **Issue:** `onclick='document.getElementById("contextMenu").style.display="none"'` vulnerable to XSS
- **Solution:**
  ```javascript
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.addEventListener('click', () => {
      menuDiv.style.display = 'none';
  });
  menuDiv.appendChild(closeBtn);
  ```
- **Priority:** 🔴 Critical
- **Complexity:** ⚡ Simple (1 hour)

#### 4. Add Error Handling for Scene Initialization
- **File:** scene.js:170
- **Issue:** `createScene()` called without error handling
- **Solution:**
  ```javascript
  createScene().catch(err => {
      console.error('Scene initialization failed:', err);
      document.getElementById("loadingStatus").innerText = 'Failed to load scene';
      document.getElementById("loadingScreen").style.background = '#ff0000';
  });
  ```
- **Priority:** 🔴 Critical
- **Complexity:** ⚡ Simple (30 minutes)

### 🟠 High Priority Improvements

#### 5. Modularize scene.js
- **Issue:** Monolithic 171-line function, hard to maintain
- **Solution:** Split into modules:
  - `CameraController.js` - Camera setup and controls (lines 10-22)
  - `EnvironmentManager.js` - Skybox, ground, lighting (lines 24-46)
  - `PhysicsManager.js` - Havok initialization and bodies (lines 48-67)
  - `InteractionHandler.js` - Click-to-move, context menu (lines 69-156)
  - `SceneManager.js` - Main orchestrator
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡ Moderate (2-3 days)

#### 6. Remove Unused Libraries
- **File:** index.php:10-11
- **Issue:** babylonjs.loaders.min.js and babylon.gui.min.js included but unused
- **Solution:** Comment out or remove until needed
- **Priority:** 🟠 High
- **Complexity:** ⚡ Simple (15 minutes)

#### 7. Add Canvas Existence Check
- **File:** scene.js:1
- **Issue:** No validation that canvas exists before engine creation
- **Solution:**
  ```javascript
  const canvas = document.getElementById('renderCanvas');
  if (!canvas) {
      console.error('Canvas element not found');
      return;
  }
  ```
- **Priority:** 🟠 High
- **Complexity:** ⚡ Simple (30 minutes)

#### 8. Throttle DOM Updates in Render Loop
- **File:** scene.js:158-163
- **Issue:** FPS and object count updated 60 times per second (DOM thrashing)
- **Solution:**
  ```javascript
  let lastUpdate = 0;
  engine.runRenderLoop(() => {
      scene.render();

      const now = performance.now();
      if (now - lastUpdate > 1000) { // Update once per second
          document.getElementById("fps").innerText = `FPS: ${engine.getFps().toFixed(0)}`;
          document.getElementById("objects").innerText = `Objects: ${scene.meshes.length}`;
          lastUpdate = now;
      }
  });
  ```
- **Priority:** 🟠 High
- **Complexity:** ⚡ Simple (1 hour)

### 🟡 Medium Priority Enhancements

#### 9. Cancel Previous Animation on New Click
- **File:** scene.js:83-85
- **Issue:** Multiple clicks create overlapping animations
- **Solution:**
  ```javascript
  let currentAnimation = null;

  if (currentAnimation) {
      currentAnimation.stop();
  }

  currentAnimation = BABYLON.Animation.CreateAndStartAnimation(...);
  ```
- **Priority:** 🟡 Medium
- **Complexity:** ⚡ Simple (1-2 hours)

#### 10. Format Position Coordinates in Context Menu
- **File:** scene.js:130
- **Issue:** Position.toString() can be very long (many decimals)
- **Solution:**
  ```javascript
  const formatPos = (vec) => `(${vec.x.toFixed(2)}, ${vec.y.toFixed(2)}, ${vec.z.toFixed(2)})`;
  const pickedPoint = pick?.pickedPoint ? formatPos(pick.pickedPoint) : "unknown";
  ```
- **Priority:** 🟡 Medium
- **Complexity:** ⚡ Simple (30 minutes)

#### 11. Close Context Menu on Outside Click
- **File:** scene.js:105-156
- **Issue:** Menu only closes via button, not by clicking outside
- **Solution:**
  ```javascript
  document.addEventListener('click', (e) => {
      if (!menuDiv.contains(e.target)) {
          menuDiv.style.display = 'none';
      }
  });
  ```
- **Priority:** 🟡 Medium
- **Complexity:** ⚡ Simple (1 hour)

#### 12. Add Code Comments and Documentation
- **File:** scene.js, index.php
- **Issue:** Code-to-comment ratio of 55:1 (very poor)
- **Solution:** Add JSDoc comments for functions, inline comments for complex logic
- **Priority:** 🟡 Medium
- **Complexity:** ⚡⚡ Moderate (1 day)

---

## Phase 1: WordPress Plugin Foundation
*Estimated Duration: 2-3 weeks*

### 🔴 Critical Plugin Setup

#### 13. Create Plugin Directory Structure
- **Tasks:**
  - Set up folder hierarchy (see mappings.md)
  - Create main plugin file with headers
  - Add activation/deactivation hooks
  - Set up autoloader for classes
- **Priority:** 🔴 Critical
- **Complexity:** ⚡ Simple (1 day)
- **Files to Create:**
  ```
  babylon-3d-cms.php
  includes/class-activator.php
  includes/class-deactivator.php
  includes/class-autoloader.php
  uninstall.php
  ```

#### 14. Register Custom Post Type: babylon_scene
- **Tasks:**
  - Register CPT with proper arguments
  - Add custom capabilities
  - Enable REST API support
  - Create taxonomy for scene categories
- **Priority:** 🔴 Critical
- **Complexity:** ⚡ Simple (2-3 hours)
- **Reference:** mappings.md line 54-72

#### 15. Design Post Meta Schema
- **Tasks:**
  - Define all meta fields for scene configuration
  - Create helper functions for getting/setting meta
  - Add default values for new scenes
  - Implement validation functions
- **Priority:** 🔴 Critical
- **Complexity:** ⚡⚡ Moderate (2 days)
- **Reference:** mappings.md line 76-138

### 🟠 High Priority Plugin Features

#### 16. Create REST API Endpoints
- **Endpoints to Build:**
  - `GET /wp-json/babylon-3d-cms/v1/scene/{id}` - Get scene data
  - `POST /wp-json/babylon-3d-cms/v1/scene/{id}` - Update scene
  - `DELETE /wp-json/babylon-3d-cms/v1/scene/{id}` - Delete scene
  - `GET /wp-json/babylon-3d-cms/v1/scenes` - List all scenes
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡ Moderate (3-4 days)
- **Reference:** mappings.md line 271-313

#### 17. Build Scene Loader JavaScript Module
- **Tasks:**
  - Fetch scene data from REST API
  - Parse JSON configuration
  - Dynamically create Babylon.js scene from data
  - Replace hardcoded scene.js
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡⚡ Complex (1 week)
- **Output:** `public/assets/js/scene-loader.js`

#### 18. Implement Shortcode Handler
- **Tasks:**
  - Register `[babylon_scene id="123"]` shortcode
  - Enqueue necessary scripts/styles
  - Render canvas and UI elements
  - Pass scene ID to JavaScript loader
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡ Moderate (2-3 days)
- **Reference:** mappings.md line 222-246

#### 19. Create Basic Admin Settings Page
- **Tasks:**
  - Add options page under Settings menu
  - Settings: Default physics engine, CDN choice, performance mode
  - Save settings to wp_options table
  - Provide helpful documentation
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡ Moderate (2-3 days)
- **Reference:** mappings.md line 373-412

---

## Phase 2: Admin Interface & Scene Editor
*Estimated Duration: 3-4 weeks*

### 🔴 Critical Admin Features

#### 20. Build Scene Editor Metabox
- **Tasks:**
  - Create metabox with tabbed interface
  - Tabs: Camera, Environment, Objects, Physics, Interactions, UI
  - Live preview canvas in metabox
  - Save button with AJAX
- **Priority:** 🔴 Critical
- **Complexity:** ⚡⚡⚡⚡ Very Complex (2-3 weeks)
- **Reference:** mappings.md line 315-371

#### 21. Implement Camera Settings Panel
- **Fields:**
  - Camera type (Universal, ArcRotate, Free, Follow)
  - Starting position (X, Y, Z)
  - Speed and sensitivity
  - Collision ellipsoid dimensions
- **Priority:** 🔴 Critical
- **Complexity:** ⚡⚡ Moderate (2-3 days)

#### 22. Build Environment Settings Panel
- **Fields:**
  - Skybox enabled/disabled, size, color
  - Ground size, material, texture selector
  - Fog enabled, color, density
  - Background color
- **Priority:** 🔴 Critical
- **Complexity:** ⚡⚡ Moderate (3-4 days)

#### 23. Create Object Manager Interface
- **Features:**
  - List of objects in scene
  - Add new object (dropdown: box, sphere, cylinder, custom model)
  - Edit object properties (position, rotation, scale, material)
  - Delete object
  - Drag-and-drop reordering
- **Priority:** 🔴 Critical
- **Complexity:** ⚡⚡⚡ Complex (1-2 weeks)

### 🟠 High Priority Admin Enhancements

#### 24. Integrate Media Library for Textures
- **Tasks:**
  - Add "Select Texture" buttons for each material property
  - Open WordPress media library modal
  - Save attachment ID to post meta
  - Display texture preview in admin
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡ Moderate (2-3 days)
- **Reference:** mappings.md line 475-518

#### 25. Add 3D Model Upload Support
- **Tasks:**
  - Allow glTF, GLB, OBJ, FBX, STL file types
  - Parse model metadata (vertex count, size, etc.)
  - Create custom media library column for 3D assets
  - Validate file size and format
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡⚡ Complex (4-5 days)
- **Reference:** mappings.md line 417-473

#### 26. Build Physics Settings Panel
- **Fields:**
  - Enable/disable physics
  - Physics engine selection (Havok, Cannon, Ammo)
  - Gravity vector (X, Y, Z)
  - Collision detection enabled
- **Priority:** 🟠 High
- **Complexity:** ⚡ Simple (1 day)

#### 27. Create Lighting Manager
- **Features:**
  - List of lights in scene
  - Add light (Hemispheric, Directional, Point, Spot)
  - Edit light properties (position, direction, intensity, color)
  - Shadow casting options
  - Delete light
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡ Moderate (3-4 days)

---

## Phase 3: Gutenberg Block Integration
*Estimated Duration: 1-2 weeks*

### 🔴 Critical Block Features

#### 28. Create Babylon Scene Block
- **Tasks:**
  - Register block with block.json
  - Build edit.js (React component)
  - Build save.js (render function)
  - Add block styles
  - Support align (wide, full)
- **Priority:** 🔴 Critical
- **Complexity:** ⚡⚡⚡ Complex (1 week)
- **Reference:** mappings.md line 148-219

#### 29. Add Block Inspector Controls
- **Controls:**
  - Scene selector (dropdown of available scenes)
  - Width and height inputs
  - Show/hide controls toggle
  - Auto-play toggle
- **Priority:** 🔴 Critical
- **Complexity:** ⚡⚡ Moderate (2-3 days)

#### 30. Implement Block Preview
- **Tasks:**
  - Show live scene preview in editor
  - Use iframe or inline canvas
  - Update preview when settings change
  - Handle block validation
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡ Moderate (2-3 days)

---

## Phase 4: Advanced Babylon.js Features
*Estimated Duration: 4-6 weeks*

### 🟠 High Priority Babylon.js Enhancements

#### 31. Implement PBR Materials
- **Tasks:**
  - Replace StandardMaterial with PBRMaterial
  - Add metallic/roughness workflow
  - Environment map support
  - Admin UI for PBR properties
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡⚡ Complex (1 week)
- **Reference:** mappings.md line 526-532

#### 32. Add Model Loading (glTF/GLB)
- **Tasks:**
  - Integrate Babylon loaders (currently unused)
  - Load models from media library
  - Asset container management
  - Progress indicators
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡⚡ Complex (1 week)
- **Reference:** mappings.md line 540-546

#### 33. Implement Shadow System
- **Tasks:**
  - Add DirectionalLight with shadows
  - Shadow generator configuration
  - Soft shadows and blur settings
  - Admin UI for shadow properties
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡ Moderate (3-4 days)
- **Reference:** mappings.md line 534-538

#### 34. Build Animation System
- **Tasks:**
  - Animation groups from imported models
  - Timeline editor for animations
  - Play/pause/loop controls
  - Animation blending
- **Priority:** 🟡 Medium
- **Complexity:** ⚡⚡⚡⚡ Very Complex (2-3 weeks)
- **Reference:** mappings.md line 548-553

### 🟡 Medium Priority Advanced Features

#### 35. Add Post-Processing Effects
- **Effects to Add:**
  - Bloom, glow, god rays
  - Depth of field
  - Color correction
  - Motion blur
  - SSAO (Screen Space Ambient Occlusion)
- **Priority:** 🟡 Medium
- **Complexity:** ⚡⚡⚡ Complex (1-2 weeks)
- **Reference:** mappings.md line 562-567

#### 36. Implement Particle Systems
- **Tasks:**
  - GPU particle support
  - Particle emitter objects
  - Presets (fire, smoke, rain, snow)
  - Custom particle textures
- **Priority:** 🟡 Medium
- **Complexity:** ⚡⚡⚡ Complex (1 week)
- **Reference:** mappings.md line 569-574

#### 37. Add Scene Optimizer
- **Tasks:**
  - Auto-detect device capabilities
  - Dynamic quality scaling
  - LOD (Level of Detail) system
  - Texture compression
- **Priority:** 🟡 Medium
- **Complexity:** ⚡⚡⚡ Complex (1 week)
- **Reference:** mappings.md line 555-560

#### 38. Build GUI System Integration
- **Tasks:**
  - Use Babylon.GUI for in-scene UI
  - Replace DOM-based status panel
  - 3D text labels
  - Interactive buttons in scene
- **Priority:** 🟡 Medium
- **Complexity:** ⚡⚡⚡ Complex (1 week)
- **Reference:** mappings.md line 584-589

---

## Phase 5: Performance & Optimization
*Estimated Duration: 2-3 weeks*

### 🟠 High Priority Optimizations

#### 39. Implement Asset Caching
- **Tasks:**
  - Cache scene JSON data (wp_cache)
  - Browser localStorage for scene configs
  - Service worker for offline support
  - CDN integration for assets
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡⚡ Complex (1 week)
- **Reference:** mappings.md line 706-717

#### 40. Add Lazy Loading for Babylon.js
- **Tasks:**
  - Load Babylon.js modules on-demand
  - Only load physics if scene uses it
  - Dynamic import() for ES modules
  - Reduce initial page load time
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡ Moderate (2-3 days)
- **Reference:** mappings.md line 684-693

#### 41. Implement Responsive Quality Settings
- **Tasks:**
  - Detect mobile vs desktop
  - Hardware concurrency check
  - Adjust rendering quality
  - Hardware scaling level
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡ Moderate (2-3 days)
- **Reference:** mappings.md line 719-731

#### 42. Optimize Render Loop
- **Tasks:**
  - Throttle DOM updates (already in Phase 0)
  - Use requestAnimationFrame properly
  - Pause rendering when tab not visible
  - Memory leak prevention
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡ Moderate (2-3 days)

### 🟡 Medium Priority Performance

#### 43. Add Occlusion Culling
- **Tasks:**
  - Frustum culling (default in Babylon)
  - Occlusion queries for large scenes
  - Distance-based culling
  - Admin toggle for culling
- **Priority:** 🟡 Medium
- **Complexity:** ⚡⚡⚡ Complex (4-5 days)

#### 44. Implement Texture Optimization
- **Tasks:**
  - Automatic WebP/AVIF conversion
  - Texture atlasing for materials
  - Mipmaps and compression (DXT, ETC)
  - Lazy load textures
- **Priority:** 🟡 Medium
- **Complexity:** ⚡⚡⚡ Complex (1 week)

---

## Phase 6: Security & Testing
*Estimated Duration: 2-3 weeks*

### 🔴 Critical Security Tasks

#### 45. Input Validation & Sanitization
- **Tasks:**
  - Sanitize all scene configuration inputs
  - Validate numeric ranges (position, scale, etc.)
  - Escape output in templates
  - SQL injection prevention
- **Priority:** 🔴 Critical
- **Complexity:** ⚡⚡ Moderate (3-4 days)
- **Reference:** mappings.md line 733-748

#### 46. Add CSRF Protection
- **Tasks:**
  - Nonce verification for AJAX requests
  - Nonce in forms
  - REST API nonce handling
  - Validate nonces before saving
- **Priority:** 🔴 Critical
- **Complexity:** ⚡ Simple (1-2 days)
- **Reference:** mappings.md line 759-767

#### 47. Implement User Capability Checks
- **Tasks:**
  - Check current_user_can() before operations
  - Add custom capabilities for scene management
  - Role-based access control
  - Prevent unauthorized scene edits
- **Priority:** 🔴 Critical
- **Complexity:** ⚡⚡ Moderate (2-3 days)

#### 48. Asset Validation
- **Tasks:**
  - Validate 3D model file types
  - File size limits (max 50MB)
  - Malicious file detection
  - Safe file handling
- **Priority:** 🔴 Critical
- **Complexity:** ⚡⚡ Moderate (2-3 days)
- **Reference:** mappings.md line 769-789

### 🟠 High Priority Testing

#### 49. Cross-Browser Testing
- **Browsers:**
  - Chrome, Firefox, Safari, Edge
  - Mobile browsers (iOS Safari, Chrome Android)
  - WebGL support detection
  - Graceful degradation for old browsers
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡ Moderate (3-4 days)

#### 50. Mobile Performance Testing
- **Devices:**
  - iPhone (various models)
  - Android phones (high/mid/low end)
  - Tablets (iPad, Android tablets)
  - Touch control validation
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡ Moderate (3-4 days)

#### 51. Write Unit Tests
- **Coverage:**
  - PHP classes (PHPUnit)
  - JavaScript modules (Jest)
  - REST API endpoints
  - Scene serialization/deserialization
- **Priority:** 🟡 Medium
- **Complexity:** ⚡⚡⚡ Complex (1-2 weeks)

#### 52. Integration Testing
- **Tests:**
  - WordPress multisite compatibility
  - Theme conflicts
  - Plugin conflicts
  - Database migration
- **Priority:** 🟡 Medium
- **Complexity:** ⚡⚡ Moderate (3-4 days)

---

## Phase 7: Documentation & Release
*Estimated Duration: 2 weeks*

### 🔴 Critical Documentation

#### 53. Write User Documentation
- **Content:**
  - Installation guide
  - Scene creation tutorial
  - Block usage instructions
  - Shortcode reference
  - FAQ and troubleshooting
- **Priority:** 🔴 Critical
- **Complexity:** ⚡⚡ Moderate (3-4 days)

#### 54. Create Developer Documentation
- **Content:**
  - REST API reference
  - Hook and filter documentation
  - Custom scene loader examples
  - Extension development guide
  - Code architecture overview
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡⚡ Complex (1 week)

#### 55. Build Demo Site
- **Features:**
  - Multiple example scenes
  - Interactive tutorials
  - Video demonstrations
  - Live editor previews
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡ Moderate (3-4 days)

### 🟠 High Priority Release Tasks

#### 56. Prepare for WordPress.org Submission
- **Tasks:**
  - Create readme.txt (WordPress format)
  - Add screenshots
  - Write changelog
  - Ensure GPL compatibility
  - Code standards compliance (WPCS)
- **Priority:** 🟠 High
- **Complexity:** ⚡⚡ Moderate (2-3 days)

#### 57. Version 1.0 Release
- **Checklist:**
  - All critical features implemented
  - Security audit passed
  - Browser testing complete
  - Documentation finished
  - Plugin submitted to WordPress.org
- **Priority:** 🔴 Critical
- **Complexity:** ⚡ Simple (1 day)

---

## Phase 8: Advanced Features (Post-MVP)
*Estimated Duration: Ongoing*

### 🟡 Medium Priority Enhancements

#### 58. XR Support (VR/AR)
- **Tasks:**
  - WebXR API integration
  - VR headset support (Quest, Vive, etc.)
  - AR mode for mobile devices
  - Admin toggle for XR features
- **Priority:** 🟡 Medium
- **Complexity:** ⚡⚡⚡⚡ Very Complex (3-4 weeks)
- **Reference:** mappings.md line 576-582

#### 59. Node Material Editor
- **Tasks:**
  - Visual shader graph interface
  - Drag-and-drop node connections
  - Material preview
  - Save custom materials
- **Priority:** 🟡 Medium
- **Complexity:** ⚡⚡⚡⚡ Very Complex (4-6 weeks)
- **Reference:** mappings.md line 593-598

#### 60. Scene Versioning System
- **Tasks:**
  - Snapshot and restore functionality
  - Diff viewer for scene changes
  - Rollback to previous versions
  - Integration with WP revisions
- **Priority:** 🟡 Medium
- **Complexity:** ⚡⚡⚡ Complex (1-2 weeks)
- **Reference:** mappings.md line 606-611

#### 61. Multiplayer Support
- **Tasks:**
  - Real-time collaboration (Socket.io/Colyseus)
  - Synchronized object states
  - User presence indicators
  - User permissions and roles
- **Priority:** 🟢 Low
- **Complexity:** ⚡⚡⚡⚡ Very Complex (6-8 weeks)
- **Reference:** mappings.md line 613-619

### 🟢 Low Priority Polish

#### 62. Scene Templates Library
- **Tasks:**
  - Pre-built scene templates
  - One-click import
  - Community template sharing
  - Rating and review system
- **Priority:** 🟢 Low
- **Complexity:** ⚡⚡⚡ Complex (2-3 weeks)

#### 63. Analytics Integration
- **Tasks:**
  - Track scene views
  - Interaction heatmaps
  - Performance metrics
  - Google Analytics integration
- **Priority:** 🟢 Low
- **Complexity:** ⚡⚡ Moderate (1 week)

#### 64. Export Scene as Standalone
- **Tasks:**
  - Export scene as HTML file
  - Embed all assets
  - No WordPress dependencies
  - Share-able offline viewer
- **Priority:** 🟢 Low
- **Complexity:** ⚡⚡⚡ Complex (1-2 weeks)

#### 65. AI-Assisted Scene Generation
- **Tasks:**
  - Text-to-scene AI (prompt-based)
  - Procedural scene generation
  - AI-suggested lighting/materials
  - Integration with OpenAI/Claude API
- **Priority:** 🟢 Low (Future Vision)
- **Complexity:** ⚡⚡⚡⚡ Very Complex (2-3 months)

---

## Open Questions & Research Needed

### Technical Questions

1. **Physics Engine Choice:**
   - Should we support all three (Havok, Cannon, Ammo) or focus on Havok?
   - Havok requires WASM loading - performance impact?
   - Cannon is lighter but less accurate - acceptable trade-off?

2. **Asset Loading Strategy:**
   - How to handle large 3D models (100+ MB)?
   - Progressive loading vs full load?
   - Should we implement streaming for large scenes?

3. **Responsive Strategy:**
   - Separate scenes for mobile vs desktop?
   - Or auto-quality adjustment?
   - User override for quality settings?

4. **Versioning:**
   - How to handle Babylon.js updates?
   - Lock to specific version or always use latest?
   - Compatibility layer for old scenes?

### UX Questions

1. **Scene Editor Complexity:**
   - Beginner mode vs Advanced mode?
   - How much Babylon.js knowledge required?
   - Wizard-based setup for beginners?

2. **Control Customization:**
   - Should users customize control schemes?
   - Pre-defined presets (FPS, orbit, fly)?
   - Accessibility considerations (keyboard-only mode)?

3. **Mobile Experience:**
   - Touch controls sufficient?
   - Virtual joystick needed?
   - Gyroscope integration?

### Business Questions

1. **Licensing:**
   - Free vs Pro version?
   - What features in each tier?
   - Recurring revenue model?

2. **Support:**
   - Community forum?
   - Premium support for Pro users?
   - Documentation maintenance plan?

3. **Compatibility:**
   - Minimum WordPress version (5.9 for Gutenberg blocks)?
   - PHP version requirement (7.4+? 8.0+?)?
   - Browser compatibility matrix?

---

## Dependency Graph

```
Phase 0 (Cleanup)
    ↓
Phase 1 (Plugin Foundation)
    ├─→ Phase 2 (Admin Interface)
    │       ↓
    │   Phase 3 (Gutenberg Block)
    │
    └─→ Phase 4 (Babylon.js Features)
            ↓
        Phase 5 (Performance)
            ↓
        Phase 6 (Security & Testing)
            ↓
        Phase 7 (Documentation & Release)
            ↓
        Phase 8 (Advanced Features)
```

**Critical Path:** Phase 0 → 1 → 2 → 6 → 7 (Minimum for MVP release)

**Parallel Development Opportunities:**
- Phase 3 (Block) can be developed alongside Phase 2 (Admin)
- Phase 4 (Babylon features) can start after Phase 1 completes
- Phase 5 (Performance) can happen throughout development

---

## Estimated Total Development Time

### MVP (Phases 0-3 + 6-7):
- **With 1 Developer:** 12-16 weeks (3-4 months)
- **With 2 Developers:** 8-10 weeks (2-2.5 months)
- **With 3+ Developers:** 6-8 weeks (1.5-2 months)

### Full Feature Set (Phases 0-7):
- **With 1 Developer:** 22-28 weeks (5-7 months)
- **With 2 Developers:** 14-18 weeks (3.5-4.5 months)
- **With 3+ Developers:** 10-14 weeks (2.5-3.5 months)

### Post-MVP Features (Phase 8):
- Ongoing development based on user feedback
- Estimated 1-2 features per month with dedicated team

---

## Success Metrics

### Technical Metrics
- [ ] Load time < 3 seconds on average connection
- [ ] 60 FPS on desktop, 30+ FPS on mobile
- [ ] Support for scenes with 100+ objects
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Mobile support (iOS, Android)

### User Metrics
- [ ] 100+ active installations in first 3 months
- [ ] 4+ star rating on WordPress.org
- [ ] 50+ community scenes created
- [ ] 1000+ documentation page views per month

### Business Metrics
- [ ] Plugin submitted to WordPress.org
- [ ] Featured on WordPress News or similar
- [ ] 5+ community contributions (code, docs, translations)
- [ ] Partnership with Babylon.js team?

---

## Risk Assessment

### High Risk Items
1. **Complexity Creep:** Feature scope too large, delays release
   - **Mitigation:** Strict MVP definition, phase-based development

2. **Babylon.js Updates:** Breaking changes in new versions
   - **Mitigation:** Lock to stable version, test before upgrading

3. **Performance Issues:** Large scenes slow on low-end devices
   - **Mitigation:** Scene optimizer, quality presets, device detection

4. **Security Vulnerabilities:** User-generated content risks (XSS, etc.)
   - **Mitigation:** Strict input validation, security audit before release

### Medium Risk Items
1. **Browser Compatibility:** WebGL not supported on all devices
   - **Mitigation:** Feature detection, graceful degradation, fallback message

2. **Asset Storage:** Large 3D models fill WordPress media library
   - **Mitigation:** File size limits, external storage option (S3, CDN)

3. **Learning Curve:** Too complex for average WordPress users
   - **Mitigation:** Comprehensive docs, video tutorials, templates

### Low Risk Items
1. **Plugin Conflicts:** Compatibility with other plugins
   - **Mitigation:** Namespacing, testing with popular plugins

2. **Theme Compatibility:** Styling conflicts with themes
   - **Mitigation:** Isolated styles, theme override templates

---

## Next Immediate Actions

### This Week (Days 1-7):
1. ✅ Complete workshop documentation (this file!)
2. ⬜ Fix duplicate object count updates (Task #1)
3. ⬜ Implement Q/E keys (Task #2)
4. ⬜ Fix inline event handler security (Task #3)
5. ⬜ Add error handling (Task #4)
6. ⬜ Start modularizing scene.js (Task #5)

### Next Week (Days 8-14):
1. ⬜ Complete scene.js modularization (Task #5)
2. ⬜ Remove unused libraries (Task #6)
3. ⬜ Throttle DOM updates (Task #8)
4. ⬜ Begin plugin directory structure (Task #13)
5. ⬜ Start CPT registration (Task #14)

### Month 1 Goal:
- Phase 0 complete (all cleanup tasks)
- Phase 1 started (plugin foundation in place)
- REST API skeleton built

**Let's build something amazing! 🚀**
