# 3D Foundation Optimization & Plugin Architecture Plan

## Overview

This document outlines the strategy for building a rock-solid, highly optimized 3D foundation with a modular plugin architecture. We will **ignore CMS integration** and focus entirely on:

1. **Perfecting core 3D systems** (ground, collision, camera, movement, gravity, lighting, shadows)
2. **Building a plugin architecture** that scales as 3D functionality grows
3. **Creating extension points** for future features without breaking existing code

**Philosophy:** Build the engine first, build it right, build it modular. CMS comes later.

---

## Current State Analysis

### What Currently Works ✅

1. **Basic Scene Rendering**
   - Babylon.js engine initialized
   - 60 FPS rendering loop
   - Responsive canvas

2. **Simple Camera**
   - UniversalCamera with WASD controls
   - Mouse look
   - Basic collision detection

3. **Ground/Environment**
   - 100x100 unit ground plane
   - Textured with dirt.jpg (40x40 tiling)
   - Skybox (150 units)

4. **Physics (Havok)**
   - Loading and initialization works
   - Dynamic box with gravity
   - Static ground collision

5. **Basic Lighting**
   - Single hemispheric light
   - No shadows

6. **Interaction**
   - Click-to-move camera
   - Context menu on right-click
   - Touch controls

### Critical Problems to Fix 🔴

1. **Dual Collision Systems**
   - Camera uses Babylon collision detection
   - Objects use Havok physics
   - Inconsistent and confusing
   - **Decision needed:** Unify or keep separate?

2. **Gravity Inconsistency**
   - Camera gravity: -0.2 (floaty, arcade feel)
   - Physics gravity: -9.81 (realistic)
   - Feels disconnected and inconsistent

3. **No Shadows**
   - Scene looks flat and unrealistic
   - Depth perception poor
   - No DirectionalLight for shadow casting

4. **Monolithic Code**
   - Everything in one 171-line function
   - No modularity or reusability
   - Hard to test or extend
   - No plugin system

5. **Poor Lighting**
   - Single hemispheric light
   - No directional, point, or spot lights
   - No control over lighting scenarios

6. **Basic Materials**
   - Only StandardMaterial used
   - No PBR (physically based rendering)
   - Textures limited to diffuse only
   - No normal maps, roughness, metallic

7. **Performance Not Optimized**
   - DOM updates every frame (60 FPS)
   - No LOD system
   - No occlusion culling
   - No texture optimization

8. **No Configuration System**
   - All values hardcoded
   - Can't change settings without editing code
   - No presets or profiles

---

## Core 3D Systems to Perfect

### System Priority Matrix

| System | Current State | Priority | Complexity | Time Estimate |
|--------|--------------|----------|------------|---------------|
| **Camera System** | Basic (UniversalCamera only) | P0 🔴 | High | 1 week |
| **Collision System** | Inconsistent (dual systems) | P0 🔴 | Medium | 3 days |
| **Movement System** | Basic WASD, click-to-move | P0 🔴 | Medium | 4 days |
| **Gravity System** | Inconsistent values | P0 🔴 | Low | 1 day |
| **Lighting System** | Poor (1 hemispheric) | P1 🟠 | Medium | 1 week |
| **Shadow System** | Not implemented | P1 🟠 | Medium | 3 days |
| **Ground/Terrain** | Basic (flat plane) | P1 🟠 | High | 1 week |
| **Material System** | Basic (StandardMaterial) | P1 🟠 | Medium | 4 days |
| **Physics System** | Works (Havok loaded) | P2 🟡 | Low | 2 days |
| **Interaction System** | Works (click, context menu) | P2 🟡 | Low | 2 days |
| **Performance System** | Not optimized | P2 🟡 | High | 1 week |
| **Asset System** | Hardcoded paths | P2 🟡 | Medium | 3 days |

**Total Estimated Time (All Systems):** 6-8 weeks

---

## Plugin Architecture Design

### Core Philosophy

Every major 3D system should be a **plugin** that:
- Has a clear, single responsibility
- Exposes a clean public API
- Communicates via events (publish/subscribe)
- Can be enabled/disabled independently
- Can be configured without code changes
- Can be hot-reloaded during development

### Architecture Pattern: Plugin System

```javascript
// Core Engine (minimal, just orchestrates plugins)
class BabylonEngine {
    constructor(canvas, config = {}) {
        this.canvas = canvas;
        this.config = config;
        this.plugins = new Map();
        this.events = new EventEmitter();

        // Create Babylon engine
        this.engine = new BABYLON.Engine(canvas, true, config.engineOptions);
        this.scene = new BABYLON.Scene(this.engine);

        // Expose scene globally for plugins
        window.__babylonScene = this.scene;
    }

    // Register a plugin
    registerPlugin(name, plugin) {
        if (this.plugins.has(name)) {
            throw new Error(`Plugin ${name} already registered`);
        }

        this.plugins.set(name, plugin);
        plugin.init(this.scene, this.events, this.config);

        this.events.emit('plugin:registered', { name, plugin });
    }

    // Get a plugin by name
    getPlugin(name) {
        return this.plugins.get(name);
    }

    // Start the engine
    start() {
        // Initialize all plugins in dependency order
        for (const [name, plugin] of this.plugins) {
            if (plugin.start) {
                plugin.start();
            }
        }

        // Start render loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
            this.events.emit('render:frame');
        });

        // Handle resize
        window.addEventListener('resize', () => {
            this.engine.resize();
            this.events.emit('window:resize');
        });

        this.events.emit('engine:started');
    }

    // Stop the engine
    stop() {
        this.engine.stopRenderLoop();
        this.events.emit('engine:stopped');
    }
}
```

### Plugin Interface (Base Class)

```javascript
class Plugin {
    constructor(options = {}) {
        this.options = options;
        this.scene = null;
        this.events = null;
        this.config = null;
        this.enabled = true;
    }

    // Called when plugin is registered
    init(scene, events, config) {
        this.scene = scene;
        this.events = events;
        this.config = config;

        // Subscribe to events
        if (this.subscriptions) {
            for (const [event, handler] of Object.entries(this.subscriptions)) {
                this.events.on(event, handler.bind(this));
            }
        }
    }

    // Called when engine starts
    start() {
        // Override in subclass
    }

    // Called when plugin is disabled
    disable() {
        this.enabled = false;
    }

    // Called when plugin is enabled
    enable() {
        this.enabled = true;
    }

    // Cleanup
    dispose() {
        // Unsubscribe from events
        if (this.subscriptions) {
            for (const [event, handler] of Object.entries(this.subscriptions)) {
                this.events.off(event, handler.bind(this));
            }
        }
    }
}
```

---

## System-by-System Optimization Plan

### 1. Camera System Plugin 🔴 P0

**Current Issues:**
- Only UniversalCamera available
- No camera presets
- Hardcoded sensitivity and speed
- No smooth camera transitions

**Optimization Goals:**
- Support multiple camera types (Universal, ArcRotate, Free, Follow)
- Camera manager with easy switching
- Configurable presets (FPS, Orbit, Fly, Drive)
- Smooth transitions between cameras
- Save/restore camera state

**Implementation:**

```javascript
class CameraPlugin extends Plugin {
    constructor(options = {}) {
        super(options);
        this.cameras = new Map();
        this.activeCamera = null;
        this.defaultType = options.defaultType || 'universal';
    }

    start() {
        // Create default camera based on config
        this.createCamera(this.defaultType, 'main', this.config.camera || {});
        this.setActiveCamera('main');
    }

    // Create a new camera
    createCamera(type, name, config) {
        let camera;

        switch(type) {
            case 'universal':
                camera = new BABYLON.UniversalCamera(name,
                    new BABYLON.Vector3(config.x || 0, config.y || 2, config.z || -10),
                    this.scene);
                camera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
                camera.speed = config.speed || 0.5;
                camera.angularSensibility = config.sensitivity || 3000;

                if (config.collision) {
                    camera.checkCollisions = true;
                    camera.applyGravity = config.gravity || false;
                    camera.ellipsoid = new BABYLON.Vector3(
                        config.ellipsoid?.x || 1,
                        config.ellipsoid?.y || 1.5,
                        config.ellipsoid?.z || 1
                    );
                }

                // Add WASD keys
                camera.keysUp.push(87);    // W
                camera.keysDown.push(83);  // S
                camera.keysLeft.push(65);  // A
                camera.keysRight.push(68); // D
                break;

            case 'arcRotate':
                camera = new BABYLON.ArcRotateCamera(name,
                    config.alpha || Math.PI / 2,
                    config.beta || Math.PI / 4,
                    config.radius || 10,
                    new BABYLON.Vector3(config.targetX || 0, config.targetY || 0, config.targetZ || 0),
                    this.scene);
                camera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
                camera.lowerRadiusLimit = config.minZoom || 2;
                camera.upperRadiusLimit = config.maxZoom || 50;
                break;

            case 'free':
                camera = new BABYLON.FreeCamera(name,
                    new BABYLON.Vector3(config.x || 0, config.y || 2, config.z || -10),
                    this.scene);
                camera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
                break;

            case 'follow':
                // Requires target mesh
                if (!config.target) {
                    throw new Error('FollowCamera requires a target mesh');
                }
                camera = new BABYLON.FollowCamera(name,
                    new BABYLON.Vector3(config.x || 0, config.y || 10, config.z || -10),
                    this.scene);
                camera.lockedTarget = config.target;
                camera.radius = config.radius || 10;
                camera.heightOffset = config.heightOffset || 5;
                camera.rotationOffset = config.rotationOffset || 0;
                break;
        }

        this.cameras.set(name, { camera, type, config });
        this.events.emit('camera:created', { name, type });

        return camera;
    }

    // Switch active camera
    setActiveCamera(name, transitionTime = 0) {
        const cameraData = this.cameras.get(name);
        if (!cameraData) {
            throw new Error(`Camera ${name} not found`);
        }

        if (transitionTime > 0 && this.activeCamera) {
            // Smooth transition
            this.transitionToCamera(cameraData.camera, transitionTime);
        } else {
            this.scene.activeCamera = cameraData.camera;
            this.activeCamera = name;
            this.events.emit('camera:changed', { name, camera: cameraData.camera });
        }
    }

    // Smooth camera transition
    transitionToCamera(targetCamera, duration) {
        const currentCamera = this.scene.activeCamera;

        // Animate position
        BABYLON.Animation.CreateAndStartAnimation(
            'cameraTransition',
            currentCamera,
            'position',
            60,
            duration * 60,
            currentCamera.position,
            targetCamera.position,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
            new BABYLON.CubicEase()
        );

        // Switch camera after transition
        setTimeout(() => {
            this.scene.activeCamera = targetCamera;
            this.events.emit('camera:transitioned', { camera: targetCamera });
        }, duration * 1000);
    }

    // Get current camera
    getActiveCamera() {
        return this.cameras.get(this.activeCamera);
    }

    // Save camera state
    saveState(name) {
        const camera = this.scene.activeCamera;
        return {
            position: camera.position.clone(),
            rotation: camera.rotation?.clone(),
            target: camera.target?.clone()
        };
    }

    // Restore camera state
    restoreState(state) {
        const camera = this.scene.activeCamera;
        camera.position = state.position;
        if (state.rotation) camera.rotation = state.rotation;
        if (state.target) camera.target = state.target;
    }
}
```

**Configuration Example:**

```javascript
const config = {
    camera: {
        defaultType: 'universal',
        x: 0, y: 2, z: -10,
        speed: 0.5,
        sensitivity: 3000,
        collision: true,
        gravity: true,
        ellipsoid: { x: 1, y: 1.5, z: 1 }
    }
};
```

**Priority:** P0 Critical
**Time Estimate:** 1 week
**Dependencies:** None

---

### 2. Collision System Plugin 🔴 P0

**Current Issues:**
- Dual collision systems (Babylon simple + Havok physics)
- Camera uses Babylon collision, objects use Havok
- Inconsistent and confusing

**Decision Point:**
- **Option A:** Use Babylon collision for everything (simpler, faster, less realistic)
- **Option B:** Use Havok for everything (realistic, heavier, more complex)
- **Option C:** Keep dual system but make it explicit and configurable

**Recommendation:** **Option C** - Keep dual system for performance, but make it clear and controllable

**Why:**
- Camera doesn't need full physics simulation (overhead for simple collision)
- Dynamic objects benefit from realistic physics (falls, forces, constraints)
- Allows per-object performance tuning

**Implementation:**

```javascript
class CollisionPlugin extends Plugin {
    constructor(options = {}) {
        super(options);
        this.mode = options.mode || 'hybrid'; // 'babylon', 'physics', 'hybrid'
        this.physicsEnabled = false;
    }

    async start() {
        // Enable scene-level collision
        this.scene.collisionsEnabled = true;

        // Initialize physics if needed
        if (this.mode === 'physics' || this.mode === 'hybrid') {
            await this.initPhysics();
        }

        this.events.emit('collision:ready', { mode: this.mode });
    }

    async initPhysics() {
        try {
            const havok = await HavokPhysics();
            const plugin = new BABYLON.HavokPlugin(true, havok);

            const gravity = this.config.physics?.gravity || { x: 0, y: -9.81, z: 0 };
            this.scene.enablePhysics(
                new BABYLON.Vector3(gravity.x, gravity.y, gravity.z),
                plugin
            );

            this.physicsEnabled = true;
            this.events.emit('physics:enabled', { engine: 'havok' });
        } catch (err) {
            console.error('Physics initialization failed:', err);
            this.physicsEnabled = false;
            this.events.emit('physics:failed', { error: err });
        }
    }

    // Enable simple Babylon collision for a mesh
    enableSimpleCollision(mesh, options = {}) {
        mesh.checkCollisions = true;
        mesh.isPickable = options.pickable !== false;

        if (options.moveWithCollisions) {
            mesh.moveWithCollisions = true;
        }

        this.events.emit('collision:simple:enabled', { mesh });
    }

    // Enable physics body for a mesh
    enablePhysicsBody(mesh, options = {}) {
        if (!this.physicsEnabled) {
            throw new Error('Physics not enabled. Use mode: "physics" or "hybrid"');
        }

        const shape = options.shape || BABYLON.PhysicsShapeType.BOX;
        const mass = options.mass !== undefined ? options.mass : 1;
        const restitution = options.restitution || 0.5;
        const friction = options.friction || 0.5;

        const aggregate = new BABYLON.PhysicsAggregate(
            mesh,
            shape,
            { mass, restitution, friction },
            this.scene
        );

        this.events.emit('collision:physics:enabled', { mesh, aggregate });

        return aggregate;
    }

    // Auto-detect best collision type for mesh
    autoEnableCollision(mesh, hint = null) {
        // Static meshes (ground, walls) -> simple collision
        if (hint === 'static' || mesh.name.includes('ground') || mesh.name.includes('terrain')) {
            this.enableSimpleCollision(mesh);
            if (this.mode === 'physics' || this.mode === 'hybrid') {
                this.enablePhysicsBody(mesh, { mass: 0 }); // Static physics body
            }
        }
        // Dynamic meshes (boxes, characters) -> physics
        else if (this.mode === 'physics' || this.mode === 'hybrid') {
            this.enablePhysicsBody(mesh);
        }
        // Fallback to simple
        else {
            this.enableSimpleCollision(mesh);
        }
    }
}
```

**Configuration Example:**

```javascript
const config = {
    collision: {
        mode: 'hybrid', // 'babylon', 'physics', 'hybrid'
    },
    physics: {
        gravity: { x: 0, y: -9.81, z: 0 },
        engine: 'havok' // 'havok', 'cannon', 'ammo'
    }
};
```

**Priority:** P0 Critical
**Time Estimate:** 3 days
**Dependencies:** None

---

### 3. Movement System Plugin 🔴 P0

**Current Issues:**
- WASD movement hardcoded into camera
- Click-to-move system separate and disconnected
- No abstraction for different movement modes
- No velocity smoothing or acceleration

**Optimization Goals:**
- Separate movement logic from camera
- Support multiple movement modes (WASD, click-to-move, gamepad, touch)
- Smooth acceleration/deceleration
- Configurable speed limits and sensitivity
- Easy to extend with new movement types

**Implementation:**

```javascript
class MovementPlugin extends Plugin {
    constructor(options = {}) {
        super(options);
        this.modes = new Map();
        this.activeMode = null;
        this.velocity = BABYLON.Vector3.Zero();
        this.targetVelocity = BABYLON.Vector3.Zero();
        this.acceleration = options.acceleration || 0.1;
    }

    start() {
        // Register default movement modes
        this.registerMode('keyboard', new KeyboardMovement(this.config.movement?.keyboard));
        this.registerMode('clickToMove', new ClickToMoveMovement(this.scene, this.events));

        // Activate default mode
        const defaultMode = this.config.movement?.defaultMode || 'keyboard';
        this.setMode(defaultMode);

        // Update movement every frame
        this.events.on('render:frame', this.update.bind(this));
    }

    registerMode(name, mode) {
        this.modes.set(name, mode);
        this.events.emit('movement:mode:registered', { name });
    }

    setMode(name) {
        const mode = this.modes.get(name);
        if (!mode) {
            throw new Error(`Movement mode ${name} not found`);
        }

        // Deactivate old mode
        if (this.activeMode) {
            this.activeMode.deactivate();
        }

        // Activate new mode
        this.activeMode = mode;
        mode.activate(this.scene.activeCamera, this.scene);

        this.events.emit('movement:mode:changed', { mode: name });
    }

    update() {
        if (!this.activeMode || !this.activeMode.enabled) return;

        // Get target velocity from active mode
        this.targetVelocity = this.activeMode.getVelocity();

        // Smooth velocity (acceleration/deceleration)
        this.velocity = BABYLON.Vector3.Lerp(
            this.velocity,
            this.targetVelocity,
            this.acceleration
        );

        // Apply velocity to camera
        if (this.scene.activeCamera) {
            this.scene.activeCamera.position.addInPlace(this.velocity);
        }

        this.events.emit('movement:updated', { velocity: this.velocity });
    }
}

// Keyboard movement mode
class KeyboardMovement {
    constructor(config = {}) {
        this.speed = config.speed || 0.5;
        this.enabled = false;
        this.keys = {
            forward: [87, 38],  // W, Up Arrow
            backward: [83, 40], // S, Down Arrow
            left: [65, 37],     // A, Left Arrow
            right: [68, 39],    // D, Right Arrow
            up: [81],           // Q
            down: [69]          // E
        };
        this.keysPressed = new Set();
    }

    activate(camera, scene) {
        this.enabled = true;
        this.camera = camera;
        this.scene = scene;

        // Listen for key events
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    deactivate() {
        this.enabled = false;
        window.removeEventListener('keydown', this.onKeyDown.bind(this));
        window.removeEventListener('keyup', this.onKeyUp.bind(this));
        this.keysPressed.clear();
    }

    onKeyDown(e) {
        this.keysPressed.add(e.keyCode);
    }

    onKeyUp(e) {
        this.keysPressed.delete(e.keyCode);
    }

    getVelocity() {
        const velocity = BABYLON.Vector3.Zero();

        // Forward/backward
        if (this.isKeyPressed(this.keys.forward)) {
            velocity.z += this.speed;
        }
        if (this.isKeyPressed(this.keys.backward)) {
            velocity.z -= this.speed;
        }

        // Left/right
        if (this.isKeyPressed(this.keys.left)) {
            velocity.x -= this.speed;
        }
        if (this.isKeyPressed(this.keys.right)) {
            velocity.x += this.speed;
        }

        // Up/down
        if (this.isKeyPressed(this.keys.up)) {
            velocity.y += this.speed;
        }
        if (this.isKeyPressed(this.keys.down)) {
            velocity.y -= this.speed;
        }

        // Transform to camera space
        if (this.camera) {
            return BABYLON.Vector3.TransformCoordinates(
                velocity,
                this.camera.getWorldMatrix()
            ).subtract(this.camera.position);
        }

        return velocity;
    }

    isKeyPressed(keyCodes) {
        return keyCodes.some(code => this.keysPressed.has(code));
    }
}

// Click-to-move mode
class ClickToMoveMovement {
    constructor(scene, events) {
        this.scene = scene;
        this.events = events;
        this.enabled = false;
        this.target = null;
        this.speed = 0.1;
        this.threshold = 0.5; // Stop when within this distance
    }

    activate(camera, scene) {
        this.enabled = true;
        this.camera = camera;

        // Listen for clicks
        this.observer = scene.onPointerObservable.add(this.onClick.bind(this));
    }

    deactivate() {
        this.enabled = false;
        this.scene.onPointerObservable.remove(this.observer);
        this.target = null;
    }

    onClick(pointerInfo) {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
            const pick = pointerInfo.pickInfo;
            if (pick && pick.hit && pick.pickedPoint) {
                this.target = pick.pickedPoint.clone();
                this.target.y = this.camera.position.y; // Keep camera height

                this.events.emit('movement:target:set', { target: this.target });
            }
        }
    }

    getVelocity() {
        if (!this.target || !this.camera) {
            return BABYLON.Vector3.Zero();
        }

        // Direction to target
        const direction = this.target.subtract(this.camera.position);
        const distance = direction.length();

        // Stop if close enough
        if (distance < this.threshold) {
            this.target = null;
            this.events.emit('movement:target:reached');
            return BABYLON.Vector3.Zero();
        }

        // Move towards target
        direction.normalize();
        return direction.scale(this.speed);
    }
}
```

**Priority:** P0 Critical
**Time Estimate:** 4 days
**Dependencies:** CameraPlugin

---

### 4. Gravity System Plugin 🔴 P0

**Current Issues:**
- Two different gravity values (camera -0.2, physics -9.81)
- Inconsistent feel between camera movement and object physics
- No easy way to change gravity globally

**Optimization Goals:**
- Single source of truth for gravity
- Configurable gravity presets (Earth, Moon, Zero-G, Custom)
- Apply gravity consistently to camera and physics
- Easy to toggle gravity on/off

**Implementation:**

```javascript
class GravityPlugin extends Plugin {
    constructor(options = {}) {
        super(options);
        this.presets = {
            earth: { x: 0, y: -9.81, z: 0 },
            moon: { x: 0, y: -1.62, z: 0 },
            mars: { x: 0, y: -3.71, z: 0 },
            zeroG: { x: 0, y: 0, z: 0 },
            arcade: { x: 0, y: -0.2, z: 0 } // Floaty feel
        };
        this.current = null;
    }

    start() {
        const preset = this.config.gravity?.preset || 'earth';
        const custom = this.config.gravity?.custom;

        if (custom) {
            this.setGravity(custom);
        } else {
            this.setPreset(preset);
        }
    }

    setPreset(name) {
        const preset = this.presets[name];
        if (!preset) {
            throw new Error(`Gravity preset ${name} not found`);
        }

        this.setGravity(preset);
        this.events.emit('gravity:preset:changed', { preset: name });
    }

    setGravity(gravity) {
        this.current = gravity;

        // Update scene gravity (for cameras with applyGravity)
        this.scene.gravity = new BABYLON.Vector3(gravity.x, gravity.y, gravity.z);

        // Update physics gravity if enabled
        if (this.scene.getPhysicsEngine()) {
            this.scene.getPhysicsEngine().setGravity(
                new BABYLON.Vector3(gravity.x, gravity.y, gravity.z)
            );
        }

        this.events.emit('gravity:changed', { gravity });
    }

    getGravity() {
        return this.current;
    }

    disable() {
        this.setGravity({ x: 0, y: 0, z: 0 });
    }

    enable() {
        const preset = this.config.gravity?.preset || 'earth';
        this.setPreset(preset);
    }
}
```

**Configuration Example:**

```javascript
const config = {
    gravity: {
        preset: 'earth', // 'earth', 'moon', 'mars', 'zeroG', 'arcade'
        // OR custom:
        custom: { x: 0, y: -5.0, z: 0 }
    }
};
```

**Priority:** P0 Critical
**Time Estimate:** 1 day
**Dependencies:** CollisionPlugin (for physics gravity)

---

### 5. Lighting System Plugin 🟠 P1

**Current Issues:**
- Only one hemispheric light
- No directional, point, or spot lights
- No light management or presets
- No dynamic lighting

**Optimization Goals:**
- Support all Babylon.js light types
- Light manager with easy creation/removal
- Lighting presets (Day, Night, Indoor, Studio, etc.)
- Dynamic lighting (time of day, flickering, etc.)
- Light groups and scenes

**Implementation:**

```javascript
class LightingPlugin extends Plugin {
    constructor(options = {}) {
        super(options);
        this.lights = new Map();
        this.presets = {
            day: [
                { type: 'hemispheric', direction: [0, 1, 0], intensity: 0.8 },
                { type: 'directional', direction: [1, -1, -0.5], intensity: 0.6, shadows: true }
            ],
            night: [
                { type: 'hemispheric', direction: [0, 1, 0], intensity: 0.2 },
                { type: 'point', position: [0, 10, 0], intensity: 0.5, range: 50 }
            ],
            studio: [
                { type: 'directional', direction: [1, -1, 1], intensity: 0.7, shadows: true },
                { type: 'directional', direction: [-1, -1, -1], intensity: 0.3 },
                { type: 'hemispheric', direction: [0, 1, 0], intensity: 0.4 }
            ]
        };
    }

    start() {
        const preset = this.config.lighting?.preset;
        const lights = this.config.lighting?.lights;

        if (preset) {
            this.applyPreset(preset);
        } else if (lights) {
            lights.forEach((config, i) => {
                this.createLight(config.type, `light_${i}`, config);
            });
        } else {
            // Default: single hemispheric
            this.createLight('hemispheric', 'default', {
                direction: [0, 1, 0],
                intensity: 1.0
            });
        }
    }

    createLight(type, name, config) {
        let light;

        switch(type) {
            case 'hemispheric':
                light = new BABYLON.HemisphericLight(
                    name,
                    new BABYLON.Vector3(config.direction[0], config.direction[1], config.direction[2]),
                    this.scene
                );
                break;

            case 'directional':
                light = new BABYLON.DirectionalLight(
                    name,
                    new BABYLON.Vector3(config.direction[0], config.direction[1], config.direction[2]),
                    this.scene
                );

                if (config.position) {
                    light.position = new BABYLON.Vector3(config.position[0], config.position[1], config.position[2]);
                }

                // Shadow generator (handled by ShadowPlugin)
                if (config.shadows) {
                    this.events.emit('lighting:shadow:requested', { light, name });
                }
                break;

            case 'point':
                light = new BABYLON.PointLight(
                    name,
                    new BABYLON.Vector3(config.position[0], config.position[1], config.position[2]),
                    this.scene
                );

                if (config.range) {
                    light.range = config.range;
                }
                break;

            case 'spot':
                light = new BABYLON.SpotLight(
                    name,
                    new BABYLON.Vector3(config.position[0], config.position[1], config.position[2]),
                    new BABYLON.Vector3(config.direction[0], config.direction[1], config.direction[2]),
                    config.angle || Math.PI / 3,
                    config.exponent || 2,
                    this.scene
                );
                break;
        }

        // Common properties
        light.intensity = config.intensity || 1.0;

        if (config.diffuse) {
            light.diffuse = new BABYLON.Color3(config.diffuse[0], config.diffuse[1], config.diffuse[2]);
        }

        if (config.specular) {
            light.specular = new BABYLON.Color3(config.specular[0], config.specular[1], config.specular[2]);
        }

        this.lights.set(name, { light, type, config });
        this.events.emit('lighting:created', { name, type });

        return light;
    }

    applyPreset(name) {
        const preset = this.presets[name];
        if (!preset) {
            throw new Error(`Lighting preset ${name} not found`);
        }

        // Clear existing lights
        this.clearAll();

        // Create lights from preset
        preset.forEach((config, i) => {
            this.createLight(config.type, `${name}_${i}`, config);
        });

        this.events.emit('lighting:preset:applied', { preset: name });
    }

    getLight(name) {
        return this.lights.get(name);
    }

    removeLight(name) {
        const lightData = this.lights.get(name);
        if (lightData) {
            lightData.light.dispose();
            this.lights.delete(name);
            this.events.emit('lighting:removed', { name });
        }
    }

    clearAll() {
        for (const [name, data] of this.lights) {
            data.light.dispose();
        }
        this.lights.clear();
    }

    // Animate light intensity
    animateIntensity(name, targetIntensity, duration = 1.0) {
        const lightData = this.lights.get(name);
        if (!lightData) return;

        BABYLON.Animation.CreateAndStartAnimation(
            'lightFade',
            lightData.light,
            'intensity',
            60,
            duration * 60,
            lightData.light.intensity,
            targetIntensity,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
    }
}
```

**Priority:** P1 High
**Time Estimate:** 1 week
**Dependencies:** None

---

### 6. Shadow System Plugin 🟠 P1

**Current Issues:**
- No shadows implemented
- Scene looks flat
- Poor depth perception

**Optimization Goals:**
- Easy shadow setup for directional/spot/point lights
- Shadow quality presets (low, medium, high, ultra)
- Performance-aware (only shadow what's needed)
- Soft shadows with configurable blur

**Implementation:**

```javascript
class ShadowPlugin extends Plugin {
    constructor(options = {}) {
        super(options);
        this.shadowGenerators = new Map();
        this.qualityPresets = {
            low: { mapSize: 512, blur: 0 },
            medium: { mapSize: 1024, blur: 32 },
            high: { mapSize: 2048, blur: 64 },
            ultra: { mapSize: 4096, blur: 128 }
        };
    }

    start() {
        // Listen for shadow requests from lighting plugin
        this.events.on('lighting:shadow:requested', this.createShadowGenerator.bind(this));

        this.quality = this.config.shadows?.quality || 'medium';
    }

    createShadowGenerator(data) {
        const { light, name } = data;
        const quality = this.qualityPresets[this.quality];

        const shadowGenerator = new BABYLON.ShadowGenerator(quality.mapSize, light);

        // Enable soft shadows with blur
        if (quality.blur > 0) {
            shadowGenerator.useBlurExponentialShadowMap = true;
            shadowGenerator.blurScale = quality.blur;
        }

        // PCF filtering for smooth edges
        shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_HIGH;

        // Bias to prevent shadow acne
        shadowGenerator.bias = 0.00001;

        this.shadowGenerators.set(name, shadowGenerator);
        this.events.emit('shadow:created', { name, light });

        return shadowGenerator;
    }

    // Add mesh to shadow casters
    addShadowCaster(mesh, lightName = null) {
        if (lightName) {
            const generator = this.shadowGenerators.get(lightName);
            if (generator) {
                generator.addShadowCaster(mesh);
            }
        } else {
            // Add to all shadow generators
            for (const generator of this.shadowGenerators.values()) {
                generator.addShadowCaster(mesh);
            }
        }

        this.events.emit('shadow:caster:added', { mesh });
    }

    // Enable mesh to receive shadows
    enableShadowReceiver(mesh) {
        mesh.receiveShadows = true;
        this.events.emit('shadow:receiver:added', { mesh });
    }

    // Auto-setup shadows for scene
    autoSetup(options = {}) {
        const casters = options.casters || 'all'; // 'all', 'dynamic', 'static'
        const receivers = options.receivers || 'all';

        // Add shadow casters
        this.scene.meshes.forEach(mesh => {
            if (casters === 'all') {
                this.addShadowCaster(mesh);
            } else if (casters === 'dynamic' && mesh.physicsBody) {
                this.addShadowCaster(mesh);
            } else if (casters === 'static' && !mesh.physicsBody) {
                this.addShadowCaster(mesh);
            }
        });

        // Add shadow receivers
        this.scene.meshes.forEach(mesh => {
            if (receivers === 'all') {
                this.enableShadowReceiver(mesh);
            } else if (mesh.name.includes('ground') || mesh.name.includes('terrain')) {
                this.enableShadowReceiver(mesh);
            }
        });
    }

    setQuality(quality) {
        if (!this.qualityPresets[quality]) {
            throw new Error(`Shadow quality ${quality} not found`);
        }

        this.quality = quality;

        // Recreate shadow generators with new quality
        // (This would require re-registering lights, simplified here)
        this.events.emit('shadow:quality:changed', { quality });
    }
}
```

**Priority:** P1 High
**Time Estimate:** 3 days
**Dependencies:** LightingPlugin

---

### 7. Ground/Terrain System Plugin 🟠 P1

**Current Issues:**
- Only flat plane available
- No heightmap support
- No dynamic terrain
- Basic texture tiling

**Optimization Goals:**
- Support multiple ground types (plane, heightmap, procedural)
- Terrain LOD for large scenes
- Multiple texture layers (diffuse, normal, roughness)
- Dynamic terrain modification
- Terrain presets (grass, dirt, sand, rock, snow)

**Implementation:**

```javascript
class GroundPlugin extends Plugin {
    constructor(options = {}) {
        super(options);
        this.ground = null;
        this.type = 'plane'; // 'plane', 'heightmap', 'procedural'
    }

    start() {
        const type = this.config.ground?.type || 'plane';
        const config = this.config.ground || {};

        switch(type) {
            case 'plane':
                this.createPlane(config);
                break;
            case 'heightmap':
                this.createHeightmap(config);
                break;
            case 'procedural':
                this.createProcedural(config);
                break;
        }
    }

    createPlane(config) {
        const size = config.size || 100;

        this.ground = BABYLON.MeshBuilder.CreateGround('ground', {
            width: size,
            height: size,
            subdivisions: config.subdivisions || 32
        }, this.scene);

        this.ground.checkCollisions = true;
        this.ground.isPickable = true;

        // Apply material
        if (config.material) {
            this.applyMaterial(config.material);
        }

        // Emit for collision/shadow plugins
        this.events.emit('ground:created', { ground: this.ground, type: 'plane' });
    }

    createHeightmap(config) {
        if (!config.heightmapUrl) {
            throw new Error('Heightmap URL required for heightmap terrain');
        }

        this.ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap('ground',
            config.heightmapUrl,
            {
                width: config.size || 100,
                height: config.size || 100,
                subdivisions: config.subdivisions || 100,
                minHeight: config.minHeight || 0,
                maxHeight: config.maxHeight || 10
            },
            this.scene
        );

        this.ground.checkCollisions = true;
        this.ground.isPickable = true;

        if (config.material) {
            this.applyMaterial(config.material);
        }

        this.events.emit('ground:created', { ground: this.ground, type: 'heightmap' });
    }

    applyMaterial(config) {
        const material = new BABYLON.StandardMaterial('groundMaterial', this.scene);

        // Diffuse texture
        if (config.diffuse) {
            const texture = new BABYLON.Texture(config.diffuse, this.scene);
            texture.uScale = config.tiling?.u || 40;
            texture.vScale = config.tiling?.v || 40;
            material.diffuseTexture = texture;
        }

        // Normal map
        if (config.normal) {
            const normalTexture = new BABYLON.Texture(config.normal, this.scene);
            normalTexture.uScale = config.tiling?.u || 40;
            normalTexture.vScale = config.tiling?.v || 40;
            material.bumpTexture = normalTexture;
        }

        // Specular
        material.specularColor = config.specular
            ? new BABYLON.Color3(config.specular[0], config.specular[1], config.specular[2])
            : BABYLON.Color3.Black();

        this.ground.material = material;
    }

    getGround() {
        return this.ground;
    }
}
```

**Priority:** P1 High
**Time Estimate:** 1 week (basic), 2-3 weeks (with LOD and advanced features)
**Dependencies:** None

---

## Configuration System

All plugins are configured via a single JSON/JavaScript configuration object:

```javascript
const engineConfig = {
    // Camera configuration
    camera: {
        defaultType: 'universal',
        x: 0, y: 2, z: -10,
        speed: 0.5,
        sensitivity: 3000,
        collision: true,
        gravity: true,
        ellipsoid: { x: 1, y: 1.5, z: 1 }
    },

    // Collision configuration
    collision: {
        mode: 'hybrid' // 'babylon', 'physics', 'hybrid'
    },

    // Physics configuration
    physics: {
        gravity: { x: 0, y: -9.81, z: 0 },
        engine: 'havok'
    },

    // Gravity configuration
    gravity: {
        preset: 'earth' // 'earth', 'moon', 'mars', 'zeroG', 'arcade'
    },

    // Movement configuration
    movement: {
        defaultMode: 'keyboard', // 'keyboard', 'clickToMove'
        keyboard: {
            speed: 0.5
        }
    },

    // Lighting configuration
    lighting: {
        preset: 'day', // 'day', 'night', 'studio'
        // OR custom lights:
        lights: [
            { type: 'hemispheric', direction: [0, 1, 0], intensity: 0.8 },
            { type: 'directional', direction: [1, -1, -0.5], intensity: 0.6, shadows: true }
        ]
    },

    // Shadow configuration
    shadows: {
        enabled: true,
        quality: 'medium' // 'low', 'medium', 'high', 'ultra'
    },

    // Ground configuration
    ground: {
        type: 'plane', // 'plane', 'heightmap', 'procedural'
        size: 100,
        subdivisions: 32,
        material: {
            diffuse: 'dirt.jpg',
            tiling: { u: 40, v: 40 }
        }
    },

    // Engine options
    engineOptions: {
        antialias: true,
        preserveDrawingBuffer: true
    }
};
```

---

## Implementation Roadmap

### Phase 0: Core Architecture (Week 1)
**Goal:** Build plugin system foundation

- [ ] Create `BabylonEngine` class (core orchestrator)
- [ ] Create `Plugin` base class
- [ ] Implement event emitter system
- [ ] Create configuration loader
- [ ] Set up module structure

**Files:**
```
src/
├── core/
│   ├── BabylonEngine.js
│   ├── Plugin.js
│   └── EventEmitter.js
├── plugins/
│   └── (empty, will be filled in Phase 1)
└── config/
    └── ConfigLoader.js
```

**Success Criteria:**
- Can register and initialize plugins
- Events flow between plugins
- Configuration loads correctly

---

### Phase 1: Foundation Systems (Weeks 2-3)
**Goal:** Implement P0 critical systems

**Week 2:**
- [ ] Implement `CameraPlugin` (all camera types)
- [ ] Implement `CollisionPlugin` (hybrid mode)
- [ ] Implement `GravityPlugin` (presets)
- [ ] Test camera + collision + gravity integration

**Week 3:**
- [ ] Implement `MovementPlugin` (keyboard + click-to-move)
- [ ] Integrate movement with camera
- [ ] Fix all P0 issues from analysis (duplicate updates, etc.)
- [ ] Write unit tests for core systems

**Success Criteria:**
- Camera switches smoothly between types
- Collision works consistently
- Gravity unified across systems
- Movement feels smooth and responsive

---

### Phase 2: Visual Enhancement (Weeks 4-5)
**Goal:** Implement P1 visual systems

**Week 4:**
- [ ] Implement `LightingPlugin` (all light types + presets)
- [ ] Implement `ShadowPlugin` (shadow generators + quality levels)
- [ ] Integrate lighting + shadows
- [ ] Test performance with shadows enabled

**Week 5:**
- [ ] Implement `GroundPlugin` (plane + heightmap)
- [ ] Implement `MaterialPlugin` (StandardMaterial + PBR)
- [ ] Apply materials to ground
- [ ] Add normal maps and texture layers

**Success Criteria:**
- Lighting presets work (day, night, studio)
- Shadows render correctly
- Ground looks realistic with PBR materials
- Performance stays above 60 FPS

---

### Phase 3: Advanced Features (Weeks 6-7)
**Goal:** Implement P2 advanced systems

- [ ] Implement `AssetPlugin` (loader for models, textures)
- [ ] Implement `InteractionPlugin` (click, hover, drag)
- [ ] Implement `UIPlugin` (Babylon.GUI integration)
- [ ] Implement `PerformancePlugin` (optimizer, LOD, culling)

**Success Criteria:**
- Can load GLTF/GLB models
- UI overlay works (status panel, controls)
- Performance optimizer auto-adjusts quality
- Scene runs smoothly on mid-range devices

---

### Phase 4: Polish & Optimization (Week 8)
**Goal:** Optimize everything, fix bugs, write docs

- [ ] Performance profiling and optimization
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Write plugin API documentation
- [ ] Create example scenes
- [ ] Set up hot-reload for development

**Success Criteria:**
- 60 FPS on desktop, 30+ FPS on mobile
- Works in Chrome, Firefox, Safari, Edge
- Complete API documentation
- 5+ example scenes demonstrating features

---

## Example Usage: Putting It All Together

```javascript
// index.html - Simple setup

// 1. Create engine with config
const config = {
    camera: { defaultType: 'universal', y: 2, z: -10 },
    gravity: { preset: 'earth' },
    lighting: { preset: 'day' },
    shadows: { enabled: true, quality: 'medium' },
    ground: { type: 'plane', size: 100 }
};

const engine = new BabylonEngine(document.getElementById('renderCanvas'), config);

// 2. Register plugins
engine.registerPlugin('camera', new CameraPlugin());
engine.registerPlugin('collision', new CollisionPlugin());
engine.registerPlugin('gravity', new GravityPlugin());
engine.registerPlugin('movement', new MovementPlugin());
engine.registerPlugin('lighting', new LightingPlugin());
engine.registerPlugin('shadows', new ShadowPlugin());
engine.registerPlugin('ground', new GroundPlugin());

// 3. Start the engine
engine.start();

// 4. Interact with plugins
const cameraPlugin = engine.getPlugin('camera');
cameraPlugin.setActiveCamera('arcRotate'); // Switch to orbit camera

const lightingPlugin = engine.getPlugin('lighting');
lightingPlugin.applyPreset('night'); // Switch to night lighting

// 5. Listen to events
engine.events.on('camera:changed', ({ name }) => {
    console.log(`Camera changed to: ${name}`);
});
```

---

## Next Steps

1. **Review and Approve Plan**
   - Review this document
   - Provide feedback on priorities
   - Approve architecture direction

2. **Start Phase 0** (This Week)
   - Set up project structure
   - Create core `BabylonEngine` class
   - Implement `Plugin` base class
   - Build event system

3. **Phase 1** (Next 2 Weeks)
   - Implement Camera, Collision, Gravity, Movement plugins
   - Refactor existing scene.js into plugin architecture
   - Test integration

4. **Iterate and Improve**
   - Get feedback on each phase
   - Adjust priorities based on learnings
   - Add new plugins as needed

---

## Success Metrics

- **Code Quality:** Modular, testable, documented
- **Performance:** 60 FPS on desktop, 30+ FPS on mobile
- **Extensibility:** New plugins can be added in < 1 day
- **Developer Experience:** Hot-reload, clear APIs, good docs
- **Visual Quality:** Realistic lighting, shadows, materials

**Ready to build something awesome? Let's start with Phase 0!** 🚀
