# Directory Tree with Code Tags

## Overview

This document shows the complete file structure of the 3D engine codebase with **code tags present in each file**. Use this as a navigation map to understand:

- 📁 Where each system's code lives
- 🏷️ What tags are in each file
- 🔗 How files relate to each other via tags
- 🎯 Where to find specific functionality

**Legend:**
- `[TAG]` - Primary tags (main features in file)
- `[TAG.N]` - Sub-tags (specific implementations)
- `[TAG1 -> TAG2]` - Cross-reference tags (dependencies)
- `[!TAG]` - Critical tags (changes affect many systems)

---

## Directory Structure

```
3d-cms/
├── index.html                          # [ENG] Main entry point
├── src/                                # Source code
│   ├── core/                           # Core engine systems
│   │   ├── BabylonEngine.js           # [ENG.*] [!ENG.1.3] [PLG.2]
│   │   ├── Plugin.js                  # [!PLG.1.*] [EVT.2]
│   │   └── EventEmitter.js            # [!EVT.1.*]
│   │
│   ├── config/                         # Configuration system
│   │   ├── ConfigLoader.js            # [!CFG.1.*]
│   │   ├── defaults.json              # [CFG.1.2]
│   │   └── schema.json                # [CFG.1.1]
│   │
│   ├── plugins/                        # All plugin implementations
│   │   ├── CameraPlugin.js            # [CAM.*] [CAM->COL] [CAM->GRV]
│   │   ├── CollisionPlugin.js         # [COL.*] [COL->PHY] [!COL.1]
│   │   ├── GravityPlugin.js           # [GRV.*] [GRV->CAM] [GRV->PHY]
│   │   ├── MovementPlugin.js          # [MOV.*] [MOV->CAM] [MOV->EVT]
│   │   ├── LightingPlugin.js          # [LGT.*] [LGT->SHD]
│   │   ├── ShadowPlugin.js            # [SHD.*] [SHD->LGT] [SHD->PRF]
│   │   ├── GroundPlugin.js            # [GRD.*] [GRD->COL] [GRD->MAT]
│   │   ├── MaterialPlugin.js          # [MAT.*] [MAT->AST]
│   │   ├── AssetPlugin.js             # [AST.*]
│   │   ├── InteractionPlugin.js       # [INT.*] [INT->COL] [INT->UI]
│   │   ├── UIPlugin.js                # [UI.*]
│   │   └── PerformancePlugin.js       # [PRF.*] [!PRF.1] [PRF->SHD]
│   │
│   ├── movement/                       # Movement mode implementations
│   │   ├── KeyboardMovement.js        # [MOV.4.*] [MOV.4->CAM]
│   │   ├── ClickToMoveMovement.js     # [MOV.5.*] [MOV.5->INT]
│   │   ├── GamepadMovement.js         # [MOV.6.*]
│   │   └── TouchMovement.js           # [MOV.7.*]
│   │
│   ├── utils/                          # Utility functions
│   │   ├── Vector3Utils.js            # [UTL.1] [CAM|MOV|COL]
│   │   ├── MeshUtils.js               # [UTL.2] [GRD|COL|MAT]
│   │   └── ColorUtils.js              # [UTL.3] [LGT|MAT|UI]
│   │
│   └── index.js                        # [ENG] Main export
│
├── assets/                             # Static assets
│   ├── textures/                       # [AST.1.1]
│   │   ├── defaults/
│   │   │   ├── dirt.jpg               # [GRD.4.1]
│   │   │   ├── grass.jpg              # [GRD.4.1]
│   │   │   └── rock.jpg               # [GRD.4.1]
│   │   └── normals/
│   │       └── dirt_normal.jpg        # [GRD.4.2] [MAT.2.2]
│   │
│   └── models/                         # [AST.1.2]
│       └── (empty for now)
│
├── config/                             # Configuration files
│   ├── presets/                        # System presets
│   │   ├── camera-presets.json        # [CAM.1] [CFG.2]
│   │   ├── lighting-presets.json      # [LGT.4] [CFG.2]
│   │   └── material-presets.json      # [MAT.4] [CFG.2]
│   └── engine-config.json             # [CFG.1] Main config
│
├── tests/                              # Unit tests
│   ├── unit/
│   │   ├── BabylonEngine.test.js      # [ENG.*] [TEST]
│   │   ├── CameraPlugin.test.js       # [CAM.*] [TEST]
│   │   ├── CollisionPlugin.test.js    # [COL.*] [TEST]
│   │   └── ...
│   └── integration/
│       ├── camera-collision.test.js   # [CAM->COL] [TEST]
│       ├── gravity-physics.test.js    # [GRV->PHY] [TEST]
│       └── ...
│
├── examples/                           # Example scenes
│   ├── basic-scene.html               # [ENG] [CAM] [GRD] [LGT]
│   ├── physics-demo.html              # [PHY] [COL] [GRV]
│   └── lighting-demo.html             # [LGT] [SHD] [MAT]
│
├── docs/                               # Documentation
│   ├── api/                            # API reference
│   │   ├── BabylonEngine.md           # [ENG.*]
│   │   ├── CameraPlugin.md            # [CAM.*]
│   │   └── ...
│   └── guides/                         # Tutorials
│       ├── getting-started.md         # [ENG] [CAM] [GRD]
│       └── creating-plugins.md        # [PLG.*]
│
└── workshop/                           # Development workspace
    ├── analysis.md                     # Code analysis
    ├── mappings.md                     # WordPress integration
    ├── future_tasks.md                 # Development roadmap
    ├── foundation-plan.md              # Foundation optimization
    ├── code-tags.md                    # This reference ⭐
    └── directory-tree.md               # You are here ⭐
```

---

## File-by-File Tag Breakdown

### Core Files

#### `index.html`
**Purpose:** Main HTML entry point, loads engine and config

**Tags:**
- `[ENG]` - Engine initialization
- `[ENG.1.1]` - Canvas element setup
- `[UI.2]` - DOM UI elements (loading screen, status panel)
- `[CFG.1]` - Load configuration

**Dependencies:**
- Babylon.js CDN scripts
- src/index.js

**Code Sections:**
```html
<!-- [ENG.1.1] Canvas element for rendering -->
<canvas id="renderCanvas"></canvas>

<!-- [UI.2] Loading screen UI -->
<div id="loadingScreen">...</div>

<!-- [UI.4] Status panel -->
<div id="statusPanel">...</div>

<script>
// [CFG.1] Load configuration
const config = { ... };

// [ENG.1] Initialize engine
const engine = new BabylonEngine(canvas, config);

// [PLG.2] Register plugins
engine.registerPlugin('camera', new CameraPlugin());
// ...

// [ENG.3.1] Start engine
engine.start();
</script>
```

---

#### `src/core/BabylonEngine.js`
**Purpose:** Core engine orchestrator, plugin manager

**Tags:**
- `[!ENG.1]` - Engine initialization (CRITICAL)
- `[ENG.1.1]` - Canvas setup
- `[!ENG.1.2]` - Babylon.js engine creation
- `[!ENG.1.3]` - Scene creation (all plugins depend on this)
- `[ENG.2]` - Plugin registration system
- `[ENG.2.1]` - Plugin validation
- `[ENG.2.2]` - Plugin initialization
- `[ENG.3]` - Engine start/stop
- `[ENG.3.1]` - Render loop
- `[ENG.3.2]` - Window resize handling
- `[ENG.4]` - Engine disposal
- `[PLG.2]` - Plugin management
- `[EVT.2]` - Event emission

**Cross-References:**
- `[ENG.1.3 -> PLG.1.2]` - Scene passed to all plugins
- `[ENG.3.1 -> PRF.1]` - Render loop monitored by performance
- `[ENG.2.2 -> PLG.1.2]` - Calls plugin.init()

**Key Methods:**
```javascript
class BabylonEngine {
    // [ENG.1] Constructor - engine initialization
    // [!ENG.1.3] Creates scene used by all plugins
    constructor(canvas, config) { ... }

    // [ENG.2] Plugin registration
    // [PLG.2] Manages plugin lifecycle
    registerPlugin(name, plugin) { ... }

    // [ENG.2.1] Get plugin by name
    getPlugin(name) { ... }

    // [ENG.3] Start engine
    // [ENG.3.1] Start render loop
    // [ENG.3.2] Handle window resize
    start() { ... }

    // [ENG.3] Stop engine
    stop() { ... }

    // [ENG.4] Cleanup and disposal
    dispose() { ... }
}
```

**Lines of Code:** ~150-200
**Complexity:** Medium
**Critical:** ⚠️ Yes - All plugins depend on this

---

#### `src/core/Plugin.js`
**Purpose:** Base class for all plugins

**Tags:**
- `[!PLG.1]` - Plugin base class (CRITICAL - all plugins inherit)
- `[PLG.1.1]` - Plugin constructor
- `[PLG.1.2]` - Plugin init lifecycle
- `[PLG.1.3]` - Plugin start lifecycle
- `[PLG.1.4]` - Plugin enable/disable
- `[PLG.1.5]` - Plugin disposal
- `[PLG.2]` - Event subscriptions
- `[PLG.3]` - Plugin options/config
- `[EVT.2]` - Event handling

**Cross-References:**
- `[PLG.1.2 -> ENG.1.3]` - Receives scene from engine
- `[PLG.1.2 -> EVT.1]` - Receives event emitter
- `[PLG.1.2 -> CFG.1]` - Receives configuration

**Key Methods:**
```javascript
class Plugin {
    // [PLG.1.1] Constructor
    // [PLG.3] Store plugin options
    constructor(options = {}) { ... }

    // [!PLG.1.2] Initialization lifecycle hook
    // [PLG.1.2 -> ENG.1.3] Receives scene reference
    // [PLG.1.2 -> EVT.1] Receives event emitter
    // [PLG.1.2 -> CFG.1] Receives config
    init(scene, events, config) { ... }

    // [PLG.1.3] Start lifecycle hook
    // Override in subclass for plugin logic
    start() { ... }

    // [PLG.1.4] Enable/disable plugin
    enable() { ... }
    disable() { ... }

    // [PLG.1.5] Cleanup and disposal
    dispose() { ... }
}
```

**Lines of Code:** ~80-100
**Complexity:** Low
**Critical:** ⚠️ Yes - All plugins inherit from this

---

#### `src/core/EventEmitter.js`
**Purpose:** Pub/sub event system for plugin communication

**Tags:**
- `[!EVT.1]` - Event emitter core (CRITICAL - all plugins use this)
- `[EVT.1.1]` - Event registration (on/addEventListener)
- `[EVT.1.2]` - Event emission (emit)
- `[EVT.1.3]` - Event unregistration (off/removeEventListener)
- `[EVT.2]` - Event naming conventions
- `[EVT.3]` - Event payload structure

**Key Methods:**
```javascript
class EventEmitter {
    // [EVT.1.1] Register event listener
    on(event, handler) { ... }

    // [EVT.1.1] Register one-time event listener
    once(event, handler) { ... }

    // [EVT.1.3] Unregister event listener
    off(event, handler) { ... }

    // [!EVT.1.2] Emit event to all listeners
    // [EVT.3] Payload passed to handlers
    emit(event, payload) { ... }

    // Clear all listeners for an event
    clear(event) { ... }
}
```

**Lines of Code:** ~60-80
**Complexity:** Low
**Critical:** ⚠️ Yes - Plugin communication depends on this

---

### Configuration Files

#### `src/config/ConfigLoader.js`
**Purpose:** Load and validate configuration

**Tags:**
- `[!CFG.1]` - Config loading system
- `[CFG.1.1]` - Config validation against schema
- `[CFG.1.2]` - Default config values
- `[CFG.2]` - Config access methods
- `[CFG.3]` - Runtime config updates
- `[CFG.4]` - Config persistence (localStorage/file)

**Key Methods:**
```javascript
class ConfigLoader {
    // [CFG.1] Load config from file/object
    static load(source) { ... }

    // [CFG.1.1] Validate config against schema
    // [CFG.1.1 -> schema.json] Uses JSON schema
    static validate(config) { ... }

    // [CFG.1.2] Merge with defaults
    // [CFG.1.2 -> defaults.json] Uses default values
    static mergeDefaults(config) { ... }

    // [CFG.2] Get config value by path
    static get(path) { ... }

    // [CFG.3] Set config value at runtime
    static set(path, value) { ... }

    // [CFG.4] Save config to storage
    static save() { ... }
}
```

**Lines of Code:** ~100-120
**Complexity:** Medium

---

### Plugin Files

#### `src/plugins/CameraPlugin.js`
**Purpose:** Camera management - creation, switching, transitions

**Tags:**
- `[CAM.1]` - Camera creation
- `[CAM.1.1]` - UniversalCamera
- `[CAM.1.2]` - ArcRotateCamera
- `[CAM.1.3]` - FreeCamera
- `[CAM.1.4]` - FollowCamera
- `[CAM.2]` - Camera switching
- `[CAM.2.1]` - Instant switch
- `[CAM.2.2]` - Smooth transition
- `[CAM.3]` - Camera controls
- `[CAM.3.1]` - Keyboard controls
- `[CAM.3.2]` - Mouse controls
- `[CAM.3.3]` - Touch controls
- `[CAM.4]` - Camera state management
- `[CAM.5]` - Camera collision setup
- `[CAM.5.1]` - Collision ellipsoid
- `[CAM.5.2]` - Gravity application

**Cross-References:**
- `[CAM.1 -> COL.2]` - Camera creation impacts collision
- `[CAM.3.1 -> MOV.4]` - Camera keys may conflict with movement
- `[CAM.5 -> COL.1]` - Camera uses collision system
- `[CAM.5.2 -> GRV.3]` - Camera uses scene gravity

**Key Methods:**
```javascript
class CameraPlugin extends Plugin {
    // [CAM.1] Create new camera
    // [CAM.1 -> COL.2] May setup collision
    // [CAM.1 -> GRV.3] May use gravity
    createCamera(type, name, config) { ... }

    // [CAM.2] Switch active camera
    // [!CAM.2] Affects rendering, controls, movement
    setActiveCamera(name, transitionTime) { ... }

    // [CAM.2.2] Smooth transition between cameras
    transitionToCamera(targetCamera, duration) { ... }

    // [CAM.4] Save camera state
    saveState(name) { ... }

    // [CAM.4] Restore camera state
    restoreState(state) { ... }
}
```

**Lines of Code:** ~300-400
**Complexity:** High
**Critical:** ⚠️ Yes - Many systems depend on camera

---

#### `src/plugins/CollisionPlugin.js`
**Purpose:** Unified collision system - Babylon simple + Havok physics

**Tags:**
- `[!COL.1]` - Collision initialization (must run before mesh creation)
- `[COL.1.1]` - Babylon collision enable
- `[COL.1.2]` - Physics collision init
- `[COL.2]` - Simple collision setup
- `[COL.2.1]` - checkCollisions flag
- `[COL.2.2]` - isPickable flag
- `[COL.2.3]` - moveWithCollisions flag
- `[COL.3]` - Physics body setup
- `[COL.3.1]` - Shape type selection
- `[COL.3.2]` - Mass configuration
- `[COL.3.3]` - Restitution
- `[COL.3.4]` - Friction
- `[COL.4]` - Auto collision detection
- `[COL.4.1]` - Static mesh detection
- `[COL.4.2]` - Dynamic mesh detection
- `[COL.5]` - Collision mode (babylon/physics/hybrid)

**Cross-References:**
- `[COL.1.1 -> CAM.5]` - Enables camera collision
- `[COL.1.2 -> PHY.1]` - Initializes physics engine
- `[COL.2 -> GRD.2.2]` - Used by ground collision
- `[COL.3 -> PHY.2]` - Creates physics bodies
- `[COL.4 -> GRD.1]` - Detects ground meshes

**Key Methods:**
```javascript
class CollisionPlugin extends Plugin {
    // [!COL.1] Initialize collision system
    // [COL.1.1] Enable scene collisions
    // [COL.1.2 -> PHY.1] Init physics if needed
    async start() { ... }

    // [COL.1.2] Initialize Havok physics
    // [COL.1.2 -> PHY.1.1] Async WASM loading
    // [COL.1.2 -> GRV.4] Sets physics gravity
    async initPhysics() { ... }

    // [COL.2] Enable simple Babylon collision
    // [COL.2 -> CAM.5.1] Used by camera
    enableSimpleCollision(mesh, options) { ... }

    // [COL.3] Enable physics body
    // [COL.3 -> PHY.2] Creates physics aggregate
    enablePhysicsBody(mesh, options) { ... }

    // [COL.4] Auto-detect best collision type
    // [COL.4.1] Detect static meshes
    // [COL.4.2] Detect dynamic meshes
    autoEnableCollision(mesh, hint) { ... }
}
```

**Lines of Code:** ~200-250
**Complexity:** High
**Critical:** ⚠️ Yes - Camera and physics depend on this

---

#### `src/plugins/GravityPlugin.js`
**Purpose:** Unified gravity system with presets

**Tags:**
- `[GRV.1]` - Gravity initialization
- `[GRV.1.1]` - Preset selection
- `[GRV.1.2]` - Custom gravity
- `[GRV.2]` - Gravity presets
- `[GRV.2.1]` - Earth preset (-9.81)
- `[GRV.2.2]` - Moon preset (-1.62)
- `[GRV.2.3]` - Zero-G preset (0)
- `[GRV.2.4]` - Arcade preset (-0.2)
- `[GRV.3]` - Scene gravity update (camera)
- `[GRV.4]` - Physics gravity update
- `[GRV.5]` - Gravity enable/disable

**Cross-References:**
- `[GRV.3 -> CAM.5.2]` - Scene gravity affects camera
- `[GRV.4 -> PHY.3]` - Physics gravity affects bodies
- `[GRV.1 -> COL.1.2]` - Gravity set during physics init

**Key Methods:**
```javascript
class GravityPlugin extends Plugin {
    // [GRV.1] Initialize gravity
    // [GRV.1.1] Load preset or custom
    start() { ... }

    // [GRV.1.1] Set gravity from preset
    // [GRV.2] Uses preset values
    setPreset(name) { ... }

    // [GRV.1.2] Set custom gravity value
    // [!GRV.3] Updates scene gravity (camera uses this)
    // [!GRV.4] Updates physics gravity (bodies use this)
    setGravity(gravity) { ... }

    // Get current gravity
    getGravity() { ... }

    // [GRV.5] Disable gravity (set to zero)
    disable() { ... }

    // [GRV.5] Enable gravity (restore preset)
    enable() { ... }
}
```

**Lines of Code:** ~100-120
**Complexity:** Low
**Critical:** ⚠️ Yes - Affects camera and physics feel

---

#### `src/plugins/MovementPlugin.js`
**Purpose:** Movement system with multiple modes (keyboard, click-to-move, etc.)

**Tags:**
- `[MOV.1]` - Movement system initialization
- `[MOV.1.1]` - Mode registration
- `[MOV.1.2]` - Default mode activation
- `[MOV.2]` - Movement mode switching
- `[MOV.2.1]` - Mode deactivation
- `[MOV.2.2]` - Mode activation
- `[!MOV.3]` - Movement update loop (every frame)
- `[MOV.3.1]` - Velocity calculation
- `[MOV.3.2]` - Velocity smoothing
- `[MOV.3.3]` - Position update

**Cross-References:**
- `[MOV.1.2 -> CAM.1]` - Requires active camera
- `[MOV.3 -> EVT.2]` - Subscribes to render:frame event
- `[MOV.3.3 -> CAM.2]` - Updates camera position

**Key Methods:**
```javascript
class MovementPlugin extends Plugin {
    // [MOV.1] Initialize movement system
    // [MOV.1.1] Register default modes
    // [MOV.1.2 -> CAM.1] Requires camera
    start() { ... }

    // [MOV.1.1] Register movement mode
    registerMode(name, mode) { ... }

    // [MOV.2] Switch movement mode
    // [MOV.2.1] Deactivate old mode
    // [MOV.2.2] Activate new mode
    setMode(name) { ... }

    // [!MOV.3] Update movement every frame
    // [MOV.3.1] Get velocity from active mode
    // [MOV.3.2] Smooth acceleration
    // [MOV.3.3 -> CAM.2] Update camera position
    update() { ... }
}
```

**Lines of Code:** ~150-180
**Complexity:** Medium

---

#### `src/plugins/LightingPlugin.js`
**Purpose:** Lighting system with all light types and presets

**Tags:**
- `[LGT.1]` - Lighting initialization
- `[LGT.1.1]` - Preset loading
- `[LGT.1.2]` - Custom lights loading
- `[LGT.2]` - Light creation
- `[LGT.2.1]` - HemisphericLight
- `[LGT.2.2]` - DirectionalLight
- `[LGT.2.3]` - PointLight
- `[LGT.2.4]` - SpotLight
- `[LGT.3]` - Light properties (intensity, color)
- `[LGT.4]` - Lighting presets
- `[LGT.4.1]` - Day preset
- `[LGT.4.2]` - Night preset
- `[LGT.4.3]` - Studio preset
- `[LGT.5]` - Light management
- `[LGT.6]` - Light animation

**Cross-References:**
- `[LGT.2.2 -> SHD.1]` - Directional lights can cast shadows
- `[LGT.3 -> MAT.3]` - Light intensity affects materials

**Key Methods:**
```javascript
class LightingPlugin extends Plugin {
    // [LGT.1] Initialize lighting
    // [LGT.1.1] Apply preset or
    // [LGT.1.2] Create custom lights
    start() { ... }

    // [LGT.2] Create light of specified type
    // [LGT.2.1-2.4] Support all Babylon light types
    createLight(type, name, config) { ... }

    // [LGT.4] Apply lighting preset
    // [LGT.4.1-4.3] Day/Night/Studio presets
    applyPreset(name) { ... }

    // [LGT.5] Get/remove/clear lights
    getLight(name) { ... }
    removeLight(name) { ... }
    clearAll() { ... }

    // [LGT.6] Animate light intensity
    animateIntensity(name, target, duration) { ... }
}
```

**Lines of Code:** ~250-300
**Complexity:** Medium

---

#### `src/plugins/ShadowPlugin.js`
**Purpose:** Shadow system with quality levels

**Tags:**
- `[SHD.1]` - Shadow system initialization
- `[SHD.1.1]` - Shadow request listener
- `[SHD.1.2]` - Quality preset loading
- `[SHD.2]` - Shadow generator creation
- `[SHD.2.1]` - Shadow map size
- `[SHD.2.2]` - Shadow blur (soft shadows)
- `[SHD.2.3]` - Shadow filtering
- `[SHD.2.4]` - Shadow bias (acne fix)
- `[SHD.3]` - Shadow caster setup
- `[SHD.4]` - Shadow receiver setup
- `[SHD.5]` - Shadow quality presets
- `[SHD.6]` - Shadow auto-setup

**Cross-References:**
- `[SHD.1.1 -> LGT.2.2]` - Listens for DirectionalLight creation
- `[SHD.3 -> GRD.1]` - Ground can cast shadows
- `[SHD.4 -> GRD.2]` - Ground receives shadows
- `[SHD.2.1 -> PRF.2]` - Shadow map size affects performance

**Key Methods:**
```javascript
class ShadowPlugin extends Plugin {
    // [SHD.1] Initialize shadow system
    // [SHD.1.1 -> LGT.2.2] Listen for shadow-capable lights
    start() { ... }

    // [SHD.2] Create shadow generator for light
    // [SHD.2.1] Set map size based on quality
    // [SHD.2.2] Enable soft shadows if configured
    createShadowGenerator({ light, name }) { ... }

    // [SHD.3] Add mesh as shadow caster
    addShadowCaster(mesh, lightName) { ... }

    // [SHD.4] Enable mesh to receive shadows
    enableShadowReceiver(mesh) { ... }

    // [SHD.6] Auto-setup shadows for entire scene
    // [SHD.6 -> GRD.1] Ground auto-receives shadows
    autoSetup(options) { ... }

    // Change shadow quality
    setQuality(quality) { ... }
}
```

**Lines of Code:** ~180-220
**Complexity:** Medium

---

#### `src/plugins/GroundPlugin.js`
**Purpose:** Ground/terrain system

**Tags:**
- `[GRD.1]` - Ground initialization
- `[GRD.1.1]` - Ground type selection
- `[GRD.2]` - Plane ground
- `[GRD.2.1]` - Ground mesh creation
- `[GRD.2.2]` - Ground collision
- `[GRD.2.3]` - Ground pickable
- `[GRD.3]` - Heightmap ground
- `[GRD.3.1]` - Heightmap loading
- `[GRD.3.2]` - Height range
- `[GRD.4]` - Ground material
- `[GRD.4.1]` - Texture tiling
- `[GRD.4.2]` - Normal map

**Cross-References:**
- `[GRD.2.2 -> COL.2]` - Ground uses simple collision
- `[GRD.2.3 -> MOV.5.1]` - Ground must be pickable for click-to-move
- `[GRD.4 -> MAT.1]` - Ground uses material system
- `[GRD.1 -> SHD.4]` - Ground receives shadows

**Key Methods:**
```javascript
class GroundPlugin extends Plugin {
    // [GRD.1] Initialize ground
    // [GRD.1.1] Select ground type
    start() { ... }

    // [GRD.2] Create flat plane ground
    // [GRD.2.1] CreateGround mesh
    // [GRD.2.2 -> COL.2] Enable collision
    // [GRD.2.3 -> MOV.5] Make pickable
    createPlane(config) { ... }

    // [GRD.3] Create heightmap terrain
    // [GRD.3.1] Load heightmap image
    // [GRD.3.2] Configure elevation
    createHeightmap(config) { ... }

    // [GRD.4] Apply material to ground
    // [GRD.4.1] Texture with tiling
    // [GRD.4.2] Normal map for detail
    // [GRD.4 -> MAT.1] Uses material system
    applyMaterial(config) { ... }

    // Get ground reference
    getGround() { ... }
}
```

**Lines of Code:** ~150-200
**Complexity:** Medium

---

#### `src/plugins/MaterialPlugin.js`
**Purpose:** Material system - Standard and PBR

**Tags:**
- `[MAT.1]` - Material creation
- `[MAT.1.1]` - StandardMaterial
- `[MAT.1.2]` - PBRMaterial
- `[MAT.2]` - Texture loading
- `[MAT.2.1]` - Diffuse/albedo texture
- `[MAT.2.2]` - Normal texture
- `[MAT.2.3]` - Specular texture
- `[MAT.2.4]` - PBR textures (metallic, roughness)
- `[MAT.3]` - Material properties
- `[MAT.4]` - Material presets

**Cross-References:**
- `[MAT.1 -> GRD.4]` - Used by ground
- `[MAT.2 -> AST.1]` - Textures loaded via asset system
- `[MAT.3 -> LGT.3]` - Materials react to lighting

**Lines of Code:** ~200-250
**Complexity:** Medium

---

#### `src/plugins/PerformancePlugin.js`
**Purpose:** Performance monitoring and optimization

**Tags:**
- `[!PRF.1]` - Performance monitoring (affects frame budget)
- `[PRF.2]` - Scene optimizer
- `[PRF.3]` - LOD system
- `[PRF.4]` - Occlusion culling
- `[PRF.5]` - Throttled updates

**Cross-References:**
- `[PRF.2 -> SHD.2.1]` - Optimizer adjusts shadow quality
- `[PRF.5 -> UI.4]` - Throttle status panel updates
- `[PRF.1 -> ENG.3.1]` - Monitors render loop

**Lines of Code:** ~180-220
**Complexity:** High

---

### Movement Mode Files

#### `src/movement/KeyboardMovement.js`
**Purpose:** Keyboard-based movement (WASD + arrows)

**Tags:**
- `[MOV.4]` - Keyboard movement mode
- `[MOV.4.1]` - Key binding configuration
- `[MOV.4.2]` - Key state tracking
- `[MOV.4.3]` - Velocity from keys

**Cross-References:**
- `[MOV.4 -> CAM.3.1]` - May conflict with camera's built-in WASD
- `[MOV.4.3 -> CAM.1]` - Velocity in camera space

**Lines of Code:** ~100-120
**Complexity:** Low

---

#### `src/movement/ClickToMoveMovement.js`
**Purpose:** Click-to-move navigation

**Tags:**
- `[MOV.5]` - Click-to-move mode
- `[MOV.5.1]` - Click detection via raycast
- `[MOV.5.2]` - Target position
- `[MOV.5.3]` - Move to target

**Cross-References:**
- `[MOV.5.1 -> INT.2]` - Uses interaction system for picking
- `[MOV.5.1 -> GRD.2.3]` - Ground must be pickable

**Lines of Code:** ~80-100
**Complexity:** Low

---

## Tag Usage Matrix

### Which Files Use Which Tags

| Tag Category | Primary Files | Supporting Files |
|--------------|---------------|------------------|
| **ENG** | BabylonEngine.js, index.html | All plugins |
| **PLG** | Plugin.js | All plugin implementations |
| **EVT** | EventEmitter.js | BabylonEngine.js, all plugins |
| **CFG** | ConfigLoader.js, defaults.json, schema.json | All plugins |
| **CAM** | CameraPlugin.js | MovementPlugin.js, CollisionPlugin.js |
| **COL** | CollisionPlugin.js | CameraPlugin.js, GroundPlugin.js, all meshes |
| **MOV** | MovementPlugin.js, KeyboardMovement.js, ClickToMoveMovement.js | CameraPlugin.js |
| **GRV** | GravityPlugin.js | CameraPlugin.js, CollisionPlugin.js |
| **LGT** | LightingPlugin.js | ShadowPlugin.js, MaterialPlugin.js |
| **SHD** | ShadowPlugin.js | LightingPlugin.js, GroundPlugin.js |
| **GRD** | GroundPlugin.js | CollisionPlugin.js, MaterialPlugin.js |
| **MAT** | MaterialPlugin.js | GroundPlugin.js, AssetPlugin.js |
| **PRF** | PerformancePlugin.js | BabylonEngine.js, ShadowPlugin.js |

---

## Critical File Dependencies

### If You Change This File... These Files Are Affected

**BabylonEngine.js (`[!ENG.1.3]`)**
- ❗ **AFFECTS:** All plugin files (they all receive scene reference)
- ❗ **RISK:** High - Core engine, everything breaks if this fails

**Plugin.js (`[!PLG.1.2]`)**
- ❗ **AFFECTS:** All plugin implementations
- ❗ **RISK:** High - All plugins inherit from this

**EventEmitter.js (`[!EVT.1]`)**
- ❗ **AFFECTS:** All inter-plugin communication
- ❗ **RISK:** High - Plugins can't communicate without this

**CollisionPlugin.js (`[!COL.1]`)**
- ❗ **AFFECTS:** CameraPlugin, GroundPlugin, MovementPlugin
- ❗ **RISK:** Medium - Must initialize before meshes

**CameraPlugin.js (`[!CAM.2]`)**
- ❗ **AFFECTS:** MovementPlugin, rendering, all camera-dependent code
- ❗ **RISK:** Medium - Active camera must always exist

**PerformancePlugin.js (`[!PRF.1]`)**
- ❗ **AFFECTS:** Render loop performance, all optimizations
- ❗ **RISK:** Low - Can disable if needed

---

## Search Examples

### Find All Camera-Related Code
```bash
# Find all camera tags across codebase
grep -r "\[CAM\." src/

# Results:
# src/plugins/CameraPlugin.js: [CAM.1], [CAM.2], [CAM.3], etc.
# src/plugins/MovementPlugin.js: [MOV.3.3 -> CAM.2]
# src/plugins/CollisionPlugin.js: [COL.2 -> CAM.5]
```

### Find What Depends on Collision System
```bash
# Find all code that references collision
grep -r "-> COL\." src/

# Results:
# src/plugins/CameraPlugin.js: [CAM.5 -> COL.1]
# src/plugins/GroundPlugin.js: [GRD.2.2 -> COL.2]
```

### Find Critical Code to Avoid Breaking
```bash
# Find all critical tags
grep -r "\[!" src/

# Results:
# src/core/BabylonEngine.js: [!ENG.1.3]
# src/core/Plugin.js: [!PLG.1.2]
# src/core/EventEmitter.js: [!EVT.1]
# src/plugins/CollisionPlugin.js: [!COL.1]
```

---

## Quick Navigation Guide

### "I want to add a new camera type"
- **File:** `src/plugins/CameraPlugin.js`
- **Section:** `[CAM.1]` Camera creation
- **Method:** `createCamera()`
- **Add case for new type:** `[CAM.1.5]` NewCameraType

### "I want to change gravity values"
- **File:** `src/plugins/GravityPlugin.js`
- **Section:** `[GRV.2]` Gravity presets
- **Property:** `this.presets`
- **Impact:** `[GRV.3 -> CAM.5.2]` Camera, `[GRV.4 -> PHY.3]` Physics

### "I want to add a new movement mode"
- **File:** Create `src/movement/NewMovement.js`
- **Tags:** `[MOV.X]` where X is next number
- **Register in:** `src/plugins/MovementPlugin.js` → `[MOV.1.1]`

### "I want to change shadow quality"
- **File:** `src/plugins/ShadowPlugin.js`
- **Section:** `[SHD.5]` Quality presets
- **Property:** `this.qualityPresets`
- **Impact:** `[SHD.2.1 -> PRF.2]` Performance

### "I want to change ground texture"
- **File:** `src/plugins/GroundPlugin.js`
- **Section:** `[GRD.4]` Material application
- **Method:** `applyMaterial()`
- **Config:** `config/engine-config.json` → ground.material.diffuse

---

## File Size Estimates

| File | Lines of Code | Complexity | Priority |
|------|---------------|------------|----------|
| BabylonEngine.js | 150-200 | Medium | P0 |
| Plugin.js | 80-100 | Low | P0 |
| EventEmitter.js | 60-80 | Low | P0 |
| ConfigLoader.js | 100-120 | Medium | P0 |
| CameraPlugin.js | 300-400 | High | P0 |
| CollisionPlugin.js | 200-250 | High | P0 |
| GravityPlugin.js | 100-120 | Low | P0 |
| MovementPlugin.js | 150-180 | Medium | P0 |
| LightingPlugin.js | 250-300 | Medium | P1 |
| ShadowPlugin.js | 180-220 | Medium | P1 |
| GroundPlugin.js | 150-200 | Medium | P1 |
| MaterialPlugin.js | 200-250 | Medium | P1 |
| KeyboardMovement.js | 100-120 | Low | P0 |
| ClickToMoveMovement.js | 80-100 | Low | P0 |
| PerformancePlugin.js | 180-220 | High | P2 |

**Total Estimated Lines:** ~2,000-2,500 for core foundation

---

**Last Updated:** 2025-10-31
**Maintainer:** Development Team
**Usage:** Reference this when navigating codebase or planning changes
