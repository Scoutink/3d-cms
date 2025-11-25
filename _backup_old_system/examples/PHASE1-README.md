# Phase 1: Foundation Demo

**Tags:** `[DEMO]`, `[GRV]`, `[CAM]`, `[COL]`, `[MOV]`

## Overview

This demo showcases the complete Phase 1 foundation systems with full runtime flexibility. It demonstrates the plugin architecture, configuration-driven behavior, and per-object property overrides that are core to the 3D CMS architecture.

## Features Demonstrated

### 🌍 Gravity System `[GRV.*]`

- **Scene-Level Gravity Presets**
  - Earth (9.81 m/s²)
  - Moon (1.62 m/s²)
  - Mars (3.71 m/s²)
  - Jupiter (24.79 m/s²)
  - Zero-G (0 m/s²)
  - Arcade (0.2 m/s²)

- **Per-Object Gravity Multipliers** `[GRV.5]`
  - **Anti-Gravity Balloon Example** (User's specific requirement!)
    - Scene gravity: 9.81 m/s² (Earth)
    - Balloon multiplier: -0.3
    - Effective gravity: 9.81 × (-0.3) = **balloon floats up!**
  - Adjustable anti-gravity slider
  - Spawn multiple balloons with custom gravity

- **Runtime Flexibility**
  - Switch gravity presets anytime
  - Per-object multipliers work with any scene gravity
  - Ready for gravity zones (future)

### 📷 Camera System `[CAM.*]`

- **Multiple Camera Types** `[CAM.1]`
  - Universal Camera (first-person)
  - ArcRotate Camera (orbit view)
  - Top-Down Camera (bird's eye view)

- **Runtime Camera Control** `[CAM.2]`, `[CAM.4]`
  - Smooth transitions between cameras (1 second animations)
  - Runtime position changes with easing
  - Focus actions (balloon, cube)
  - Save/restore camera states

- **Extensibility Examples**
  - Camera rotation via actions (demonstrated with focus buttons)
  - Ready for zone triggers
  - Ready for external API control (weather, time of day)

### 💥 Collision & Physics System `[COL.*]`

- **Hybrid Collision Mode** `[COL.1]`
  - Babylon simple collision (camera)
  - Havok physics (dynamic objects)
  - Best of both worlds

- **Per-Object Physics Properties** `[COL.3]`
  - **Balloon**: Light (0.5kg), bouncy (0.8), slippery (0.1)
  - **Cube**: Heavy (5kg), less bouncy (0.3), normal friction (0.5)
  - **Bouncy Ball**: Medium (2kg), super bouncy (0.95), low friction (0.2)
  - **Heavy Box**: Very heavy (10kg), barely bounces (0.1), high friction (0.8)

- **Runtime Flexibility** `[COL.5]`
  - Spawn objects at runtime
  - Each object has custom properties
  - Physics properties changeable on the fly

### 🎮 Movement System `[MOV.*]`

- **Multiple Movement Modes** `[MOV.1]`, `[MOV.2]`
  - **Keyboard Mode** `[MOV.4]`
    - WASD + Arrow keys
    - Q/E for vertical movement
    - Camera-relative movement
  - **Click-to-Move Mode** `[MOV.5]`
    - Point and click navigation
    - Visual markers at click points
    - Double-click for speed boost
    - Height-locked movement

- **Runtime Control** `[MOV.3]`
  - Switch modes anytime
  - Adjustable speed multiplier (0.1x - 2.0x)
  - Adjustable acceleration (0.05 - 1.0)
  - Smooth velocity transitions

## Controls

### Keyboard (Keyboard Mode)
- **WASD** or **Arrow Keys**: Move horizontally
- **Q**: Move up
- **E**: Move down
- **Mouse**: Look around

### Mouse (Click-to-Move Mode)
- **Left Click**: Set move target
- **Double Click**: Speed boost
- **Mouse**: Look around (still works)

### UI Controls
All controls available in the right panel for runtime changes.

## Technical Highlights

### Plugin Architecture `[PLG.*]`

```javascript
// All systems are plugins
engine.registerPlugin('gravity', new GravityPlugin());
engine.registerPlugin('camera', new CameraPlugin());
engine.registerPlugin('collision', new CollisionPlugin());
engine.registerPlugin('movement', new MovementPlugin());
```

### Event-Driven Communication `[EVT.*]`

```javascript
// Plugins communicate via events
events.on('gravity:changed', (data) => { /* ... */ });
events.on('camera:changed', (data) => { /* ... */ });
events.on('movement:mode:changed', (data) => { /* ... */ });
```

### Configuration-Driven `[CFG.*]`

```javascript
// All defaults from config
const config = await ConfigLoader.load('engine-config.json');

// Runtime overrides available
gravityPlugin.setGravity({ y: -1.62 }); // Moon gravity
cameraPlugin.moveCameraTo(position, 1.0); // Smooth move
```

### Per-Object Metadata `[GRV.5]`, `[COL.5]`

```javascript
// Each object can have custom properties
mesh.metadata.gravityMultiplier = -0.3; // Anti-gravity!
mesh.metadata.physicsSettings = {
  mass: 0.5,
  restitution: 0.8,
  friction: 0.1
};
```

## Code Examples from Demo

### Anti-Gravity Balloon (User's Example!)

```javascript
// [!GRV.5] ANTI-GRAVITY! (User's specific example)
// Scene gravity is 9.81, balloon has -0.3 multiplier = floats up!
const balloon = BABYLON.MeshBuilder.CreateSphere('balloon', { diameter: 2 }, scene);
balloon.position = new BABYLON.Vector3(-5, 3, 0);

// Enable physics
collisionPlugin.enablePhysicsBody(balloon, {
  shape: BABYLON.PhysicsShapeType.SPHERE,
  mass: 0.5, // Light
  restitution: 0.8, // Bouncy
  friction: 0.1 // Slippery
});

// Apply anti-gravity multiplier
gravityPlugin.setObjectGravityMultiplier(balloon, -0.3);
// Result: balloon floats upward instead of falling!
```

### Runtime Camera Transition

```javascript
// [CAM.2] Smooth camera transitions
cameraPlugin.setActiveCamera('orbit', 1.0); // 1 second transition

// [CAM.4] Move camera to focus on object
const targetPos = balloon.position.add(new BABYLON.Vector3(0, 2, 8));
cameraPlugin.moveCameraTo(targetPos, 1.5); // 1.5 second animation
```

### Runtime Movement Mode Switch

```javascript
// [MOV.2] Switch movement modes
movementPlugin.setMode('keyboard'); // WASD controls
movementPlugin.setMode('clickToMove'); // Click to move

// [MOV.3] Adjust speed at runtime
movementPlugin.setGlobalSpeedMultiplier(2.0); // 2x speed boost
```

### Runtime Gravity Change

```javascript
// [GRV.1.2] Change scene gravity
gravityPlugin.usePreset('moon'); // Low gravity

// [GRV.5] Per-object gravity overrides
gravityPlugin.setObjectGravityMultiplier(balloon, -0.3); // Floats
gravityPlugin.setObjectGravityMultiplier(rock, 2.0); // Falls faster
```

## Future Extensibility Demonstrated

This demo shows how the system is ready for future features:

### Gravity Zones `[GRV.6]`
- `createGravityZone(zoneMesh, gravity)` method ready
- Future: Walk into water = reduced gravity
- Future: Walk into storm = increased gravity

### Camera Actions `[CAM.4]`
- Runtime position/rotation changes demonstrated
- Ready for: Zone triggers (auto-rotate on enter)
- Ready for: External APIs (sun position, weather)
- Ready for: Cutscenes (predefined camera paths)

### Movement Zones `[MOV.6]`
- `createMovementZone(zoneMesh, restrictions)` method ready
- Future: No-fly zones
- Future: Slow-motion areas
- Future: Underwater movement

### Collision Triggers `[COL.6]`
- `createTriggerZone(mesh, onEnter, onExit)` method ready
- Future: Teleport zones
- Future: Damage zones
- Future: Event triggers

## Running the Demo

### Option 1: Direct File
1. Open `phase1-foundation-demo.html` in a modern browser
2. Allow WebGL and WASM
3. Use controls in right panel to test features

### Option 2: Local Server (Recommended)
```bash
# From project root
python -m http.server 8000
# or
npx http-server -p 8000

# Then open: http://localhost:8000/examples/phase1-foundation-demo.html
```

## Browser Requirements

- Modern browser with WebGL 2.0 support
- WASM support (for Havok physics)
- ES6 modules support
- Recommended: Chrome 90+, Firefox 88+, Safari 14+

## Performance Notes

- **FPS Target**: 60 FPS
- **Physics Update**: Havok runs physics at fixed timestep
- **Event Throttling**: Movement events throttled to ~6/sec (not every frame)
- **Render Loop**: Efficient, emits performance data each frame

## What's Next?

**Phase 2: Visual Enhancement** (Weeks 4-5)
- LightingPlugin (all light types + presets + runtime control)
- ShadowPlugin (quality levels, soft shadows, runtime toggle)
- GroundPlugin (plane, heightmap, procedural generation)
- MaterialPlugin (Standard + PBR materials)

**Phase 3+: Advanced Features** (Weeks 6-8)
- AssetPlugin (model loading, caching)
- InteractionPlugin (picking, hovering, dragging)
- UIPlugin (HUD, menus, tooltips)
- PerformancePlugin (monitoring, optimization)

## Key Takeaways

✅ **Default Settings Everywhere**: All plugins have sensible defaults from config
✅ **Runtime Flexibility**: Every property changeable during execution
✅ **Per-Object Overrides**: Each object can have custom properties (balloon example!)
✅ **Future-Ready**: Hooks for zones, triggers, external APIs
✅ **Plugin Architecture**: Modular, extensible, maintainable
✅ **Event-Driven**: Loose coupling between systems
✅ **Configuration-Driven**: JSON config with runtime overrides

This demo perfectly demonstrates the user's requirements:
- ✅ "Default settings for camera, collision, gravity, movement"
- ✅ "Anti-gravity value per object (balloon example: scene 10, balloon -3)"
- ✅ "Camera rotation via actions/zones (focus buttons demonstrate)"
- ✅ "Dynamic light position (architecture ready for external APIs)"
- ✅ "Keep features open for future evolution while perfecting basics"

---

**Built with:** Babylon.js 6+, Havok Physics, ES6 Modules
**Phase:** 1 (Foundation Systems)
**Status:** ✅ Complete and tested
