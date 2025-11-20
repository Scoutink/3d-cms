# Coding Standards & Tag Usage Guide

## Overview

This document defines **how to write code** with the intelligent tagging system. Follow these standards to maintain:

- ✅ **Consistency** - All code follows same patterns
- ✅ **Discoverability** - Easy to find related code
- ✅ **Impact awareness** - Know what breaks when you change code
- ✅ **Maintainability** - One feature = one place in code

---

## Core Principles

### Principle 1: One Feature, One Place
**Each feature's code should be centralized in ONE location**

❌ **Bad - Scattered Code:**
```javascript
// CameraPlugin.js
createCamera(type) {
    if (type === 'universal') {
        // Some camera code here
    }
}

// MovementPlugin.js
update() {
    if (camera.type === 'universal') {
        // More camera-specific code here  ⬅️ Camera logic in movement file!
    }
}
```

✅ **Good - Centralized Code:**
```javascript
// CameraPlugin.js
// [CAM.1] All camera creation logic in one place
createCamera(type) {
    if (type === 'universal') {
        // ALL camera code here
        return this._createUniversalCamera();
    }
}

// [CAM.1.1] Universal camera - all logic centralized
_createUniversalCamera() {
    // Complete implementation
    // Movement plugin just uses camera, doesn't know its internals
}
```

---

### Principle 2: Tag Everything That Crosses Boundaries
**When your code affects or is affected by another system, TAG IT**

❌ **Bad - No Cross-Reference:**
```javascript
// CollisionPlugin.js
enablePhysicsBody(mesh) {
    // Uses physics but doesn't document it
    const aggregate = new PhysicsAggregate(mesh);
}
```

✅ **Good - Tagged Cross-Reference:**
```javascript
// CollisionPlugin.js
// [COL.3] Physics body creation
// [COL.3 -> PHY.2] Creates Havok physics aggregate
// [COL.3 -> GRV.4] Physics body affected by gravity system
enablePhysicsBody(mesh) {
    const aggregate = new PhysicsAggregate(mesh);
}
```

---

### Principle 3: Critical Code Needs Warnings
**If changing code breaks multiple systems, mark it CRITICAL**

❌ **Bad - No Warning:**
```javascript
// EventEmitter.js
emit(event, payload) {
    // No indication this is critical
    this.listeners[event]?.forEach(handler => handler(payload));
}
```

✅ **Good - Critical Warning:**
```javascript
// EventEmitter.js
// [!EVT.1.2] CRITICAL: Event emission - all plugin communication depends on this
// Changes here affect: CameraPlugin, MovementPlugin, CollisionPlugin, etc.
// DO NOT modify without testing all plugins
emit(event, payload) {
    this.listeners[event]?.forEach(handler => handler(payload));
}
```

---

## Tag Placement Rules

### Rule 1: Tag at Function/Method Level

**Primary tags go above function definitions**

```javascript
class CameraPlugin extends Plugin {
    // [CAM.1] Camera creation system
    // [CAM.1 -> COL.2] Camera setup may enable collision
    // [CAM.1 -> GRV.3] Camera may use scene gravity
    createCamera(type, name, config) {
        // Function body
    }

    // [CAM.2] Camera switching system
    // [!CAM.2] CRITICAL: Affects rendering, movement, controls
    setActiveCamera(name, transitionTime = 0) {
        // Function body
    }
}
```

---

### Rule 2: Sub-Tags for Code Blocks

**Sub-tags for specific implementations within functions**

```javascript
// [CAM.1] Camera creation
createCamera(type, name, config) {
    let camera;

    // [CAM.1.1] Universal camera creation
    // [CAM.1.1 -> MOV.4] Supports keyboard movement
    if (type === 'universal') {
        camera = new BABYLON.UniversalCamera(name, position, this.scene);

        // [CAM.3.1] Keyboard controls setup
        // [CAM.3.1 -> MOV.4.1] May conflict with MovementPlugin keys
        camera.keysUp.push(87);    // W
        camera.keysDown.push(83);  // S

        // [CAM.5] Camera collision setup
        if (config.collision) {
            // [CAM.5.1] Collision ellipsoid
            // [CAM.5.1 -> COL.2.1] Uses Babylon simple collision
            camera.checkCollisions = true;
            camera.ellipsoid = new BABYLON.Vector3(1, 1.5, 1);
        }
    }

    // [CAM.1.2] ArcRotate camera creation
    else if (type === 'arcRotate') {
        camera = new BABYLON.ArcRotateCamera(name, alpha, beta, radius, target, this.scene);
    }

    // [CAM.3.2] Attach controls to canvas
    // [CAM.3.2 -> ENG.1.1] Requires canvas from engine
    camera.attachControl(this.canvas, true);

    return camera;
}
```

---

### Rule 3: Tag Shared Utilities

**Use `|` for code used by multiple systems**

```javascript
// utils/Vector3Utils.js

// [UTL.1] Vector3 utilities
// [CAM.2 | MOV.3 | COL.4] Used by camera, movement, and collision
class Vector3Utils {
    // [UTL.1.1] Distance calculation
    // [CAM.2.2 | MOV.5.3] Used by camera transitions and click-to-move
    static distance(v1, v2) {
        return BABYLON.Vector3.Distance(v1, v2);
    }

    // [UTL.1.2] Direction vector
    // [MOV.3.1 | MOV.5.3] Used by movement calculations
    static direction(from, to) {
        return to.subtract(from).normalize();
    }
}
```

---

### Rule 4: Event Tags

**Tag event listeners and emitters**

```javascript
// CameraPlugin.js

// [CAM.1] Camera creation
createCamera(type, name, config) {
    // ... create camera ...

    // [EVT.2] Emit camera created event
    // [CAM.1 -> MOV.1] MovementPlugin listens for this
    this.events.emit('camera:created', { name, type, camera });

    return camera;
}

// MovementPlugin.js

// [MOV.1] Movement initialization
start() {
    // [EVT.2] Listen for camera events
    // [MOV.1 -> CAM.1] Needs camera to be created first
    this.events.on('camera:created', this.onCameraCreated.bind(this));
}

// [MOV.1.2] Handle camera creation
// [MOV.1.2 -> CAM.1] Triggered by camera plugin
onCameraCreated({ camera }) {
    this.camera = camera;
}
```

---

## Tag Hierarchy Examples

### Example 1: Camera System (CAM)

```
CAM                     # Camera system (root)
├── CAM.1              # Camera creation
│   ├── CAM.1.1       # UniversalCamera creation
│   ├── CAM.1.2       # ArcRotateCamera creation
│   ├── CAM.1.3       # FreeCamera creation
│   └── CAM.1.4       # FollowCamera creation
├── CAM.2              # Camera switching
│   ├── CAM.2.1       # Instant switch
│   └── CAM.2.2       # Smooth transition
├── CAM.3              # Camera controls
│   ├── CAM.3.1       # Keyboard controls
│   ├── CAM.3.2       # Mouse controls
│   └── CAM.3.3       # Touch controls
├── CAM.4              # Camera state
└── CAM.5              # Camera collision
    ├── CAM.5.1       # Collision ellipsoid
    └── CAM.5.2       # Gravity application
```

**Code Example:**
```javascript
class CameraPlugin extends Plugin {
    // [CAM.1] Camera creation (parent tag)
    createCamera(type, name, config) {
        // [CAM.1.1] Child tag for specific implementation
        if (type === 'universal') {
            return this._createUniversalCamera(name, config);
        }
    }

    // [CAM.1.1] Universal camera (sub-feature)
    // [CAM.1.1 -> MOV.4] Supports keyboard movement
    _createUniversalCamera(name, config) {
        const camera = new BABYLON.UniversalCamera(name, position, this.scene);

        // [CAM.5] Camera collision (sibling feature)
        if (config.collision) {
            // [CAM.5.1] Collision ellipsoid (child of CAM.5)
            camera.ellipsoid = new BABYLON.Vector3(1, 1.5, 1);

            // [CAM.5.2] Gravity application (sibling of CAM.5.1)
            camera.applyGravity = config.gravity || false;
        }

        return camera;
    }
}
```

---

## Cross-Reference Tag Patterns

### Pattern 1: Dependency (A needs B)

**Format:** `[A -> B]` means "A depends on B"

```javascript
// MovementPlugin.js

// [MOV.1] Movement initialization
// [MOV.1 -> CAM.1] Depends on camera existing
start() {
    // Can't start movement without a camera
    const camera = this.scene.activeCamera;
    if (!camera) {
        throw new Error('Camera required for movement');
    }
}
```

### Pattern 2: Impact (A affects B)

**Format:** `[A -> B]` means "A impacts B"

```javascript
// GravityPlugin.js

// [GRV.1.2] Set gravity value
// [GRV.3 -> CAM.5.2] Impacts camera gravity
// [GRV.4 -> PHY.3] Impacts physics bodies
setGravity(gravity) {
    // Changes here affect both camera and physics
    this.scene.gravity = new BABYLON.Vector3(gravity.x, gravity.y, gravity.z);
    this.scene.getPhysicsEngine()?.setGravity(gravity);
}
```

### Pattern 3: Bidirectional (A ↔ B)

**Use two arrows for mutual dependencies**

```javascript
// CameraPlugin.js

// [CAM.1] Camera creation
// [CAM.1 -> MOV.1] Camera enables movement
// [CAM.1 <- MOV.3] Movement updates camera position
createCamera(type) {
    // Camera created, movement can start
    // But movement will update this camera's position
}
```

### Pattern 4: Chain (A → B → C)

**Document dependency chains**

```javascript
// CollisionPlugin.js

// [COL.1.2] Initialize physics
// [COL.1.2 -> PHY.1] Loads Havok engine
// [PHY.1 -> GRV.4] Physics uses gravity
// Full chain: COL.1.2 -> PHY.1 -> GRV.4
async initPhysics() {
    // Collision init triggers physics, which uses gravity
    await this.loadHavok();
}
```

---

## Critical Code Tags

### When to Use `[!TAG]`

Use critical tag `!` when:
1. ✅ Code is called by 3+ other systems
2. ✅ Changes break multiple features
3. ✅ Code runs every frame (performance critical)
4. ✅ Code handles global state
5. ✅ Code is part of initialization sequence

```javascript
// EventEmitter.js

// [!EVT.1] CRITICAL: Event emitter core
// Used by: ALL plugins (10+ systems)
// Impact: Breaking this breaks ALL plugin communication
// Performance: Runs on every event emission
class EventEmitter {
    // [!EVT.1.2] CRITICAL: Event emission
    // Called hundreds of times per second
    // DO NOT add console.log or heavy operations here
    emit(event, payload) {
        this.listeners[event]?.forEach(handler => handler(payload));
    }
}
```

```javascript
// BabylonEngine.js

// [!ENG.1.3] CRITICAL: Scene creation
// Used by: ALL plugins (receive scene reference)
// Impact: All plugins depend on this existing
// Timing: Must complete before plugin initialization
constructor(canvas, config) {
    this.scene = new BABYLON.Scene(this.engine);
    window.__babylonScene = this.scene;  // Global access
}
```

```javascript
// PerformancePlugin.js

// [!PRF.1] CRITICAL: Performance monitoring
// Runs: Every frame (60 FPS)
// Impact: Frame budget, all rendering performance
// WARNING: Heavy operations here cause FPS drops
update() {
    const fps = this.engine.getFps();
    // Keep this lightweight!
}
```

---

## Event Naming Standards

### Format: `system:action:detail`

**Examples:**
- `camera:created` - Camera plugin emits when camera created
- `camera:changed` - Camera plugin emits when active camera switches
- `collision:enabled` - Collision plugin emits when enabled
- `render:frame` - Engine emits every frame
- `movement:mode:changed` - Movement plugin emits on mode change
- `lighting:shadow:requested` - Lighting plugin requests shadow

### Event Tag Pattern

```javascript
// Emitter side
// [EVT.2] Emit event
// [SYSTEM.N] Specific action being announced
this.events.emit('system:action:detail', { payload });

// Listener side
// [EVT.2] Listen for event
// [SYSTEM.N -> OTHER.N] Dependency on other system
this.events.on('system:action:detail', this.handleEvent.bind(this));
```

**Full Example:**

```javascript
// LightingPlugin.js

// [LGT.2.2] Create directional light
createDirectionalLight(name, config) {
    const light = new BABYLON.DirectionalLight(name, direction, this.scene);

    // [EVT.2] Request shadow creation
    // [LGT.2.2 -> SHD.1] Shadow plugin listens for this
    if (config.shadows) {
        this.events.emit('lighting:shadow:requested', { light, name });
    }

    return light;
}

// ShadowPlugin.js

// [SHD.1.1] Initialize shadow system
start() {
    // [EVT.2] Listen for shadow requests
    // [SHD.1.1 -> LGT.2.2] Triggered by lighting plugin
    this.events.on('lighting:shadow:requested', this.createShadowGenerator.bind(this));
}

// [SHD.2] Create shadow generator
// [SHD.2 -> LGT.2.2] Handles event from lighting
createShadowGenerator({ light, name }) {
    const generator = new BABYLON.ShadowGenerator(1024, light);
    this.shadowGenerators.set(name, generator);
}
```

---

## Configuration Tags

### Tag Config Access Points

```javascript
// CameraPlugin.js

// [CAM.1] Camera creation
// [CAM.1 -> CFG.2] Reads camera config
createCamera(type, name, config) {
    // [CFG.2] Access camera configuration
    const cameraConfig = this.config.camera || {};

    // [CAM.1.1] Use config values
    const position = new BABYLON.Vector3(
        config.x || cameraConfig.x || 0,
        config.y || cameraConfig.y || 2,
        config.z || cameraConfig.z || -10
    );
}
```

### Tag Config Validation

```javascript
// ConfigLoader.js

// [CFG.1.1] Validate configuration
// [CFG.1.1 -> schema.json] Uses JSON schema
static validate(config) {
    // [CFG.1.1] Check required fields
    if (!config.camera) {
        throw new Error('[CFG.1.1] Camera config required');
    }

    // [CFG.1.1 -> CAM.1] Validate camera config
    if (config.camera.speed < 0) {
        throw new Error('[CFG.1.1] Camera speed must be positive');
    }
}
```

---

## Comment Structure

### Multi-Line Comment Template

```javascript
// [PRIMARY.TAG] Brief description (one line)
// [CROSS-REF -> OTHER.TAG] Dependency or impact
// Additional context if needed
// WARNING/NOTE: Special considerations
functionName() {
    // Implementation
}
```

### Full Example

```javascript
// [COL.3] Enable physics body for mesh
// [COL.3 -> PHY.2] Creates Havok physics aggregate
// [COL.3 -> GRV.4] Body affected by gravity system
// WARNING: Must call after physics engine initialized
// NOTE: Mass 0 = static, Mass > 0 = dynamic
enablePhysicsBody(mesh, options = {}) {
    // [COL.3.1] Select collision shape
    const shape = options.shape || BABYLON.PhysicsShapeType.BOX;

    // [COL.3.2] Set mass (0 = static, >0 = dynamic)
    // [COL.3.2 -> GRD.2] Ground should have mass 0
    const mass = options.mass !== undefined ? options.mass : 1;

    // [COL.3.3] Restitution (bounciness: 0-1)
    const restitution = options.restitution || 0.5;

    // [COL.3.4] Friction (sliding resistance: 0-1)
    const friction = options.friction || 0.5;

    // [PHY.2] Create physics aggregate
    const aggregate = new BABYLON.PhysicsAggregate(
        mesh,
        shape,
        { mass, restitution, friction },
        this.scene
    );

    // [EVT.2] Emit physics enabled event
    this.events.emit('collision:physics:enabled', { mesh, aggregate });

    return aggregate;
}
```

---

## File Header Template

Every file should start with a header:

```javascript
/**
 * @file CameraPlugin.js
 * @description Camera management system - creation, switching, transitions
 *
 * @tags [CAM.*] All camera-related tags
 * @primary-tags [CAM.1] Creation, [CAM.2] Switching, [CAM.3] Controls
 * @critical-tags [!CAM.2] Camera switching affects many systems
 *
 * @dependencies
 *   - [CAM -> COL] Collision system for camera collision
 *   - [CAM -> GRV] Gravity system for camera gravity
 *   - [CAM -> MOV] Movement system uses camera
 *
 * @affects
 *   - MovementPlugin (camera position)
 *   - CollisionPlugin (camera collision)
 *   - Rendering (active camera)
 *
 * @events
 *   - Emits: camera:created, camera:changed
 *   - Listens: (none)
 *
 * @author Development Team
 * @created 2025-10-31
 */

import Plugin from '../core/Plugin.js';

// [CAM] Camera plugin implementation
class CameraPlugin extends Plugin {
    // ... implementation
}

export default CameraPlugin;
```

---

## Search & Find Guide

### Find All Code for a Feature

```bash
# Find all camera-related code
grep -r "\[CAM\." src/

# Find specific sub-feature
grep -r "\[CAM\.1\]" src/

# Find with context (3 lines before/after)
grep -r -C 3 "\[CAM\.1\]" src/
```

### Find What Depends on a System

```bash
# Find what depends on camera
grep -r "-> CAM\." src/

# Results show all cross-references to camera
```

### Find Critical Code

```bash
# Find all critical code
grep -r "\[!" src/

# Find critical code in specific system
grep -r "\[!CAM" src/
```

### Find Shared Code

```bash
# Find code used by multiple systems
grep -r " | " src/

# Results show utilities and shared functions
```

---

## Code Review Checklist

Before submitting code for review:

### ✅ Tag Completeness
- [ ] All functions have primary tags
- [ ] All code blocks have sub-tags
- [ ] All cross-system calls have cross-reference tags
- [ ] All critical code has `!` warning tags
- [ ] All shared code has `|` tags

### ✅ Tag Accuracy
- [ ] Tags match code-tags.md reference
- [ ] Tag hierarchy is correct (CAM.1 > CAM.1.1 > CAM.1.1.1)
- [ ] Cross-references are accurate
- [ ] Event names follow `system:action:detail` format

### ✅ Documentation
- [ ] File header includes tag summary
- [ ] Comments explain WHY, not just WHAT
- [ ] Critical code has warnings
- [ ] Dependencies are documented

### ✅ Code Organization
- [ ] Feature code centralized in one place
- [ ] No scattered logic across multiple files
- [ ] Clear separation of concerns
- [ ] Utilities properly shared

---

## Bad vs Good Examples

### Example 1: Gravity Implementation

❌ **Bad - Scattered, Inconsistent:**

```javascript
// CameraPlugin.js
createCamera(type) {
    const camera = new BABYLON.UniversalCamera();
    camera.applyGravity = true;
    this.scene.gravity = new BABYLON.Vector3(0, -0.2, 0);  // Hardcoded!
}

// CollisionPlugin.js (different file)
initPhysics() {
    this.scene.enablePhysics(
        new BABYLON.Vector3(0, -9.81, 0)  // Different value! No tags!
    );
}
```

✅ **Good - Centralized, Tagged:**

```javascript
// GravityPlugin.js (one place for all gravity)

// [GRV.1] Gravity system initialization
// [!GRV.3] CRITICAL: Scene gravity affects camera
// [!GRV.4] CRITICAL: Physics gravity affects bodies
start() {
    const preset = this.config.gravity?.preset || 'earth';
    this.setPreset(preset);
}

// [GRV.2] Gravity presets
presets = {
    earth: { x: 0, y: -9.81, z: 0 },
    moon: { x: 0, y: -1.62, z: 0 },
    arcade: { x: 0, y: -0.2, z: 0 }
};

// [GRV.1.2] Set gravity (centralized control)
// [GRV.3 -> CAM.5.2] Updates camera gravity
// [GRV.4 -> PHY.3] Updates physics gravity
setGravity(gravity) {
    this.current = gravity;

    // Camera gravity
    this.scene.gravity = new BABYLON.Vector3(gravity.x, gravity.y, gravity.z);

    // Physics gravity
    if (this.scene.getPhysicsEngine()) {
        this.scene.getPhysicsEngine().setGravity(
            new BABYLON.Vector3(gravity.x, gravity.y, gravity.z)
        );
    }

    // [EVT.2] Notify other systems
    this.events.emit('gravity:changed', { gravity });
}
```

**Benefits:**
- ✅ One place to change gravity (GravityPlugin)
- ✅ Consistent values (no hardcoding)
- ✅ Clear tags show what's affected
- ✅ Easy to find all gravity code (search `[GRV`)

---

### Example 2: Cross-System Integration

❌ **Bad - Hidden Dependencies:**

```javascript
// GroundPlugin.js
createGround() {
    const ground = BABYLON.MeshBuilder.CreateGround('ground', {}, this.scene);
    ground.checkCollisions = true;  // No tag showing this uses collision
    ground.isPickable = true;        // No tag showing this affects movement
    ground.receiveShadows = true;    // No tag showing this affects shadows
}
```

✅ **Good - Documented Dependencies:**

```javascript
// GroundPlugin.js

// [GRD.2] Create plane ground
// [GRD.2.1] Mesh creation
// [GRD.2.2 -> COL.2] Enable collision detection
// [GRD.2.3 -> INT.2] Make pickable for interactions
// [GRD.2.3 -> MOV.5.1] Required for click-to-move
createGround() {
    // [GRD.2.1] Create ground mesh
    const ground = BABYLON.MeshBuilder.CreateGround('ground', {
        width: 100,
        height: 100
    }, this.scene);

    // [GRD.2.2] Enable collision
    // [GRD.2.2 -> COL.2.1] Uses Babylon simple collision
    // [GRD.2.2 -> CAM.5] Required for camera to walk on ground
    ground.checkCollisions = true;

    // [GRD.2.3] Make pickable for raycasting
    // [GRD.2.3 -> INT.2] Click detection needs this
    // [GRD.2.3 -> MOV.5.1] Click-to-move picks ground
    ground.isPickable = true;

    // [GRD.4] Enable shadow receiving
    // [GRD.4 -> SHD.4] Ground receives shadows from lights
    ground.receiveShadows = true;

    // [EVT.2] Emit ground created event
    // [EVT.2 -> COL.4] CollisionPlugin may auto-setup
    // [EVT.2 -> SHD.6] ShadowPlugin may auto-setup
    this.events.emit('ground:created', { ground, type: 'plane' });

    return ground;
}
```

**Benefits:**
- ✅ Clear what systems are affected
- ✅ Easy to find impact of changes
- ✅ Events allow other systems to react
- ✅ New developers understand dependencies

---

## Maintenance Rules

### Adding New Tags

1. **Check if tag exists** - Review code-tags.md
2. **Assign next number** - Follow hierarchical numbering
3. **Document in code-tags.md** - Add to master reference
4. **Update directory-tree.md** - Add to file's tag list
5. **Use consistently** - Tag everywhere the feature touches

**Example Process:**

```javascript
// Step 1: Need to add gamepad movement mode
// Step 2: Check code-tags.md - MOV.4 = keyboard, MOV.5 = click-to-move
// Step 3: Assign MOV.6 for gamepad
// Step 4: Document in code-tags.md

// code-tags.md:
// | **MOV.6** | Gamepad movement mode | GamepadMovement.js | Controls |
// | **MOV.6.1** | Gamepad detection | GamepadMovement.js | Input |
// | **MOV.6.2** | Stick input mapping | GamepadMovement.js | Controls |

// Step 5: Use in code
// GamepadMovement.js

// [MOV.6] Gamepad movement mode
// [MOV.6 -> CAM.1] Requires active camera
class GamepadMovement {
    // [MOV.6.1] Detect connected gamepads
    detectGamepads() { ... }

    // [MOV.6.2] Map stick input to velocity
    getVelocity() { ... }
}
```

### Updating Tags After Refactoring

1. **Search old tags** - Find all occurrences
2. **Update to new tags** - Change systematically
3. **Update documentation** - code-tags.md + directory-tree.md
4. **Test cross-references** - Ensure dependencies still valid
5. **Commit with clear message** - Explain tag changes

---

## Performance-Critical Tag Usage

### Mark Hot Paths

```javascript
// [!PRF.1] CRITICAL: Runs every frame (60 FPS)
// PERFORMANCE WARNING: Keep this lightweight
// Avoid: console.log, heavy calculations, DOM manipulation
engine.runRenderLoop(() => {
    // [ENG.3.1] Render loop
    scene.render();

    // [MOV.3] Movement update (runs every frame)
    // [!MOV.3] Keep lightweight - affects FPS
    movementPlugin.update();
});
```

### Document Optimization Decisions

```javascript
// [PRF.5] Throttle DOM updates
// [PRF.5 -> UI.4] Status panel updates
// PERFORMANCE: Update UI only once per second, not every frame
// Reduces DOM manipulation from 60 FPS to 1 FPS
let lastUpdate = 0;
const updateInterval = 1000; // ms

function updateUI() {
    const now = performance.now();
    if (now - lastUpdate > updateInterval) {
        document.getElementById('fps').textContent = `FPS: ${fps}`;
        lastUpdate = now;
    }
}
```

---

## Final Checklist

Before pushing code:

- [ ] All functions tagged with primary tags
- [ ] All code blocks tagged with sub-tags
- [ ] All cross-system calls tagged with `->` references
- [ ] All critical code tagged with `!`
- [ ] All shared code tagged with `|`
- [ ] All events follow `system:action:detail` naming
- [ ] File header includes tag summary
- [ ] Tags documented in code-tags.md
- [ ] File listed in directory-tree.md
- [ ] No scattered code (one feature = one place)
- [ ] No hidden dependencies (all tagged)

---

**Last Updated:** 2025-10-31
**Maintainer:** Development Team
**Review:** Before every commit
