# Code Tags Reference

## Overview

This document defines the **hierarchical code tagging system** used throughout the 3D engine codebase. Tags enable:

- ✅ **Quick navigation** - Find all code related to a feature with search
- ✅ **Impact analysis** - Know what breaks when you change something
- ✅ **Code isolation** - Each feature's code in one place, tagged everywhere it touches
- ✅ **Dependency tracking** - See relationships between systems
- ✅ **Maintainability** - Easy refactoring with clear boundaries

---

## Tag Naming Convention

### Format
```
[SYSTEM.SUBSYSTEM.DETAIL]
```

**Examples:**
- `[CAM.1]` - Camera initialization
- `[CAM.1.1]` - Universal camera creation
- `[CAM.2 -> MOV.1]` - Camera switching impacts movement
- `[COL.3 | PHY.2]` - Code used by both collision and physics

### Tag Types

#### 1. Primary Tags
**Format:** `[SYSTEM.N]`
- Main feature/system identifier
- Always at the start of relevant code blocks
- Example: `[CAM.1]` Camera initialization

#### 2. Sub-tags
**Format:** `[SYSTEM.N.N]`
- Specific implementation detail
- Child of a primary tag
- Example: `[CAM.1.1]` Universal camera creation (child of CAM.1)

#### 3. Cross-Reference Tags
**Format:** `[SYSTEM1.N -> SYSTEM2.N]`
- Shows one system affecting another
- Use `->` for "impacts" or "depends on"
- Example: `[CAM.1 -> COL.2]` Camera init impacts collision setup

#### 4. Shared Tags
**Format:** `[SYSTEM1.N | SYSTEM2.N]`
- Code used by multiple systems
- Use `|` for "shared by" or "used by both"
- Example: `[COL.3 | PHY.2]` Code used by both collision and physics

#### 5. Impact Tags
**Format:** `[!SYSTEM.N]`
- Warning: changing this affects other systems
- Use `!` prefix for critical/fragile code
- Example: `[!EVT.1]` Event emitter - changes break many plugins

---

## Master Tag List

### Core Engine Tags (ENG)

| Tag | Description | Location | Impacts |
|-----|-------------|----------|---------|
| **ENG.1** | Engine initialization | BabylonEngine.constructor() | All plugins |
| **ENG.1.1** | Canvas setup | BabylonEngine.constructor() | Rendering |
| **ENG.1.2** | Babylon.js engine creation | BabylonEngine.constructor() | Scene, render loop |
| **ENG.1.3** | Scene creation | BabylonEngine.constructor() | All 3D objects |
| **ENG.2** | Plugin registration | BabylonEngine.registerPlugin() | Plugin lifecycle |
| **ENG.2.1** | Plugin validation | BabylonEngine.registerPlugin() | Error handling |
| **ENG.2.2** | Plugin initialization | BabylonEngine.registerPlugin() | Plugin.init() |
| **ENG.3** | Engine start/stop | BabylonEngine.start/stop() | Render loop, plugins |
| **ENG.3.1** | Render loop start | BabylonEngine.start() | All rendering |
| **ENG.3.2** | Window resize handling | BabylonEngine.start() | Canvas, camera |
| **ENG.4** | Engine cleanup/disposal | BabylonEngine.dispose() | Memory leaks |

**Critical Code:** `[!ENG.1.3]` Scene creation - all plugins depend on this

---

### Plugin System Tags (PLG)

| Tag | Description | Location | Impacts |
|-----|-------------|----------|---------|
| **PLG.1** | Plugin base class | Plugin.js | All plugins inherit |
| **PLG.1.1** | Plugin constructor | Plugin.constructor() | Plugin options |
| **PLG.1.2** | Plugin init lifecycle | Plugin.init() | Scene/events access |
| **PLG.1.3** | Plugin start lifecycle | Plugin.start() | Plugin activation |
| **PLG.1.4** | Plugin enable/disable | Plugin.enable/disable() | Feature toggling |
| **PLG.1.5** | Plugin disposal | Plugin.dispose() | Cleanup |
| **PLG.2** | Plugin event subscriptions | Plugin.subscriptions | Event system |
| **PLG.3** | Plugin options/config | Plugin.options | Configuration |

**Critical Code:** `[!PLG.1.2]` Plugin init - changes affect all plugins

---

### Event System Tags (EVT)

| Tag | Description | Location | Impacts |
|-----|-------------|----------|---------|
| **EVT.1** | Event emitter core | EventEmitter.js | All plugin communication |
| **EVT.1.1** | Event registration (on) | EventEmitter.on() | Subscribers |
| **EVT.1.2** | Event emission (emit) | EventEmitter.emit() | Handlers |
| **EVT.1.3** | Event unregistration (off) | EventEmitter.off() | Memory leaks |
| **EVT.2** | Event naming conventions | EventEmitter.js | Event discovery |
| **EVT.3** | Event payload structure | EventEmitter.js | Event handlers |

**Critical Code:** `[!EVT.1]` Event emitter - entire plugin system depends on this

**Event Naming Standard:**
- Format: `system:action:detail`
- Examples:
  - `camera:created` - Camera plugin emits when camera created
  - `collision:enabled` - Collision plugin emits when enabled
  - `render:frame` - Engine emits every frame
  - `plugin:registered` - Engine emits when plugin registered

---

### Configuration System Tags (CFG)

| Tag | Description | Location | Impacts |
|-----|-------------|----------|---------|
| **CFG.1** | Config loading | ConfigLoader.js | All plugins |
| **CFG.1.1** | Config validation | ConfigLoader.validate() | Error handling |
| **CFG.1.2** | Config defaults | ConfigLoader.defaults | Fallback values |
| **CFG.2** | Config access | Plugin.config | Plugin settings |
| **CFG.3** | Runtime config changes | Various | Live updates |
| **CFG.4** | Config persistence | localStorage/JSON | State saving |

**Critical Code:** `[!CFG.1]` Config loading - all plugins read config

---

### Camera System Tags (CAM)

| Tag | Description | Location | Impacts |
|-----|-------------|----------|---------|
| **CAM.1** | Camera creation | CameraPlugin.createCamera() | Scene, controls |
| **CAM.1.1** | UniversalCamera creation | CameraPlugin.createCamera('universal') | Movement, collision |
| **CAM.1.2** | ArcRotateCamera creation | CameraPlugin.createCamera('arcRotate') | Orbit controls |
| **CAM.1.3** | FreeCamera creation | CameraPlugin.createCamera('free') | Physics camera |
| **CAM.1.4** | FollowCamera creation | CameraPlugin.createCamera('follow') | Target tracking |
| **CAM.2** | Camera switching | CameraPlugin.setActiveCamera() | Active camera, controls |
| **CAM.2.1** | Instant camera switch | CameraPlugin.setActiveCamera(name, 0) | No transition |
| **CAM.2.2** | Smooth camera transition | CameraPlugin.transitionToCamera() | Animation |
| **CAM.3** | Camera controls setup | CameraPlugin.createCamera() | Input handling |
| **CAM.3.1** | Keyboard controls | Camera.keysUp/Down/Left/Right | Movement |
| **CAM.3.2** | Mouse controls | Camera.attachControl() | Look rotation |
| **CAM.3.3** | Touch controls | Camera.touchAngularSensibility | Mobile |
| **CAM.4** | Camera state management | CameraPlugin.saveState/restoreState() | Snapshots |
| **CAM.5** | Camera collision setup | Camera.checkCollisions | Collision system |
| **CAM.5.1** | Collision ellipsoid | Camera.ellipsoid | Collision shape |
| **CAM.5.2** | Gravity application | Camera.applyGravity | Gravity system |

**Cross-References:**
- `[CAM.1 -> COL.2]` - Camera creation impacts collision setup
- `[CAM.3.1 -> MOV.1]` - Camera controls may conflict with movement system
- `[CAM.5 -> COL.1]` - Camera collision uses collision system
- `[CAM.5.2 -> GRV.1]` - Camera gravity uses gravity system

**Critical Code:** `[!CAM.2]` Camera switching - affects rendering, controls, movement

---

### Collision System Tags (COL)

| Tag | Description | Location | Impacts |
|-----|-------------|----------|---------|
| **COL.1** | Collision system init | CollisionPlugin.start() | Scene collision flag |
| **COL.1.1** | Babylon collision enable | scene.collisionsEnabled | Simple collision |
| **COL.1.2** | Physics collision init | CollisionPlugin.initPhysics() | Havok plugin |
| **COL.2** | Simple collision setup | CollisionPlugin.enableSimpleCollision() | Mesh collision |
| **COL.2.1** | Collision check flag | mesh.checkCollisions | Collision detection |
| **COL.2.2** | Pickable flag | mesh.isPickable | Raycasting |
| **COL.2.3** | MoveWithCollisions flag | mesh.moveWithCollisions | Movement collision |
| **COL.3** | Physics body setup | CollisionPlugin.enablePhysicsBody() | Havok aggregate |
| **COL.3.1** | Physics shape selection | PhysicsShapeType.BOX/SPHERE | Collision geometry |
| **COL.3.2** | Mass configuration | aggregate options.mass | Static vs dynamic |
| **COL.3.3** | Restitution (bounciness) | aggregate options.restitution | Physics response |
| **COL.3.4** | Friction configuration | aggregate options.friction | Sliding |
| **COL.4** | Auto collision detection | CollisionPlugin.autoEnableCollision() | Smart setup |
| **COL.4.1** | Static mesh detection | mesh.name includes 'ground' | Ground detection |
| **COL.4.2** | Dynamic mesh detection | hint === 'dynamic' | Object detection |
| **COL.5** | Collision mode management | CollisionPlugin.mode | Babylon/Physics/Hybrid |

**Cross-References:**
- `[COL.1.2 -> PHY.1]` - Collision init requires physics plugin
- `[COL.2 -> CAM.5]` - Simple collision used by camera
- `[COL.3 -> PHY.2]` - Physics bodies use physics engine
- `[COL.4 -> GRD.2]` - Auto-detection recognizes ground meshes

**Critical Code:** `[!COL.1]` Collision system init - must run before mesh creation

---

### Movement System Tags (MOV)

| Tag | Description | Location | Impacts |
|-----|-------------|----------|---------|
| **MOV.1** | Movement system init | MovementPlugin.start() | Movement modes |
| **MOV.1.1** | Movement mode registration | MovementPlugin.registerMode() | Available modes |
| **MOV.1.2** | Default mode activation | MovementPlugin.setMode() | Initial controls |
| **MOV.2** | Movement mode switching | MovementPlugin.setMode() | Active mode |
| **MOV.2.1** | Mode deactivation | mode.deactivate() | Cleanup old mode |
| **MOV.2.2** | Mode activation | mode.activate() | Setup new mode |
| **MOV.3** | Movement update loop | MovementPlugin.update() | Every frame |
| **MOV.3.1** | Velocity calculation | mode.getVelocity() | Target velocity |
| **MOV.3.2** | Velocity smoothing | Vector3.Lerp() | Acceleration |
| **MOV.3.3** | Position update | camera.position.addInPlace() | Camera movement |
| **MOV.4** | Keyboard movement mode | KeyboardMovement.js | WASD controls |
| **MOV.4.1** | Key binding config | KeyboardMovement.keys | Customizable keys |
| **MOV.4.2** | Key state tracking | KeyboardMovement.keysPressed | Active keys |
| **MOV.4.3** | Velocity from keys | KeyboardMovement.getVelocity() | Direction vector |
| **MOV.5** | Click-to-move mode | ClickToMoveMovement.js | Mouse navigation |
| **MOV.5.1** | Click detection | scene.onPointerObservable | Pick point |
| **MOV.5.2** | Target position | ClickToMoveMovement.target | Move destination |
| **MOV.5.3** | Move to target | ClickToMoveMovement.getVelocity() | Direction |

**Cross-References:**
- `[MOV.1.2 -> CAM.1]` - Movement mode requires active camera
- `[MOV.3 -> EVT.2]` - Movement emits 'render:frame' event
- `[MOV.3.3 -> CAM.2]` - Movement updates camera position
- `[MOV.4.3 -> CAM.3.1]` - May conflict with camera's built-in keys

**Critical Code:** `[!MOV.3]` Movement update - runs every frame, affects performance

---

### Gravity System Tags (GRV)

| Tag | Description | Location | Impacts |
|-----|-------------|----------|---------|
| **GRV.1** | Gravity system init | GravityPlugin.start() | Scene/physics gravity |
| **GRV.1.1** | Preset selection | GravityPlugin.setPreset() | Gravity value |
| **GRV.1.2** | Custom gravity | GravityPlugin.setGravity() | Custom value |
| **GRV.2** | Gravity presets | GravityPlugin.presets | Earth/Moon/Mars/etc |
| **GRV.2.1** | Earth gravity preset | presets.earth | -9.81 m/s² |
| **GRV.2.2** | Moon gravity preset | presets.moon | -1.62 m/s² |
| **GRV.2.3** | Zero-G preset | presets.zeroG | 0 m/s² |
| **GRV.2.4** | Arcade preset | presets.arcade | -0.2 m/s² (floaty) |
| **GRV.3** | Scene gravity update | scene.gravity = Vector3 | Camera gravity |
| **GRV.4** | Physics gravity update | physicsEngine.setGravity() | Physics bodies |
| **GRV.5** | Gravity enable/disable | GravityPlugin.enable/disable() | Toggle gravity |

**Cross-References:**
- `[GRV.3 -> CAM.5.2]` - Scene gravity affects camera
- `[GRV.4 -> PHY.1]` - Physics gravity affects rigid bodies
- `[GRV.1 -> COL.1.2]` - Gravity requires physics init

**Critical Code:** `[!GRV.1]` Gravity init - must match camera and physics settings

---

### Physics System Tags (PHY)

| Tag | Description | Location | Impacts |
|-----|-------------|----------|---------|
| **PHY.1** | Physics engine init | CollisionPlugin.initPhysics() | Havok loading |
| **PHY.1.1** | Havok WASM loading | await HavokPhysics() | Async load |
| **PHY.1.2** | Havok plugin creation | new BABYLON.HavokPlugin() | Physics engine |
| **PHY.1.3** | Scene physics enable | scene.enablePhysics() | Physics active |
| **PHY.2** | Physics body creation | new PhysicsAggregate() | Rigid bodies |
| **PHY.2.1** | Shape type selection | PhysicsShapeType | Collision shape |
| **PHY.2.2** | Mass assignment | options.mass | Static/dynamic |
| **PHY.2.3** | Physics material | options.restitution/friction | Surface props |
| **PHY.3** | Physics gravity config | scene.enablePhysics(gravity) | Gravity vector |
| **PHY.4** | Physics error handling | try/catch physics init | Fallback |

**Cross-References:**
- `[PHY.1 -> COL.1.2]` - Physics init called by collision plugin
- `[PHY.2 -> COL.3]` - Physics bodies created by collision system
- `[PHY.3 -> GRV.4]` - Gravity applied to physics engine

**Critical Code:** `[!PHY.1.1]` Havok loading - async, can fail

---

### Lighting System Tags (LGT)

| Tag | Description | Location | Impacts |
|-----|-------------|----------|---------|
| **LGT.1** | Lighting system init | LightingPlugin.start() | Default lights |
| **LGT.1.1** | Preset loading | LightingPlugin.applyPreset() | Light config |
| **LGT.1.2** | Custom lights loading | LightingPlugin.createLight() | Individual lights |
| **LGT.2** | Light creation | LightingPlugin.createLight() | Scene lighting |
| **LGT.2.1** | Hemispheric light | new BABYLON.HemisphericLight() | Ambient lighting |
| **LGT.2.2** | Directional light | new BABYLON.DirectionalLight() | Sun/shadows |
| **LGT.2.3** | Point light | new BABYLON.PointLight() | Local lighting |
| **LGT.2.4** | Spot light | new BABYLON.SpotLight() | Focused beam |
| **LGT.3** | Light properties | light.intensity/diffuse/specular | Light appearance |
| **LGT.4** | Lighting presets | LightingPlugin.presets | Day/Night/Studio |
| **LGT.4.1** | Day preset | presets.day | Bright outdoor |
| **LGT.4.2** | Night preset | presets.night | Dark ambient |
| **LGT.4.3** | Studio preset | presets.studio | 3-point lighting |
| **LGT.5** | Light management | add/remove/clear lights | Light lifecycle |
| **LGT.6** | Light animation | LightingPlugin.animateIntensity() | Dynamic lighting |

**Cross-References:**
- `[LGT.2.2 -> SHD.1]` - Directional lights cast shadows
- `[LGT.3 -> MAT.2]` - Light intensity affects material appearance

**Critical Code:** `[!LGT.1]` Lighting init - at least one light required for visibility

---

### Shadow System Tags (SHD)

| Tag | Description | Location | Impacts |
|-----|-------------|----------|---------|
| **SHD.1** | Shadow system init | ShadowPlugin.start() | Shadow generators |
| **SHD.1.1** | Shadow request listener | events.on('lighting:shadow:requested') | Auto-setup |
| **SHD.1.2** | Quality preset loading | ShadowPlugin.quality | Shadow resolution |
| **SHD.2** | Shadow generator creation | ShadowPlugin.createShadowGenerator() | Per light |
| **SHD.2.1** | Shadow map size | new ShadowGenerator(mapSize) | Resolution |
| **SHD.2.2** | Shadow blur | useBlurExponentialShadowMap | Soft shadows |
| **SHD.2.3** | Shadow filtering | filteringQuality | Shadow smoothness |
| **SHD.2.4** | Shadow bias | generator.bias | Shadow acne fix |
| **SHD.3** | Shadow caster setup | ShadowPlugin.addShadowCaster() | Meshes cast shadows |
| **SHD.4** | Shadow receiver setup | ShadowPlugin.enableShadowReceiver() | Meshes receive shadows |
| **SHD.5** | Shadow quality presets | ShadowPlugin.qualityPresets | Low/Med/High/Ultra |
| **SHD.6** | Shadow auto-setup | ShadowPlugin.autoSetup() | All meshes |

**Cross-References:**
- `[SHD.1.1 -> LGT.2.2]` - Shadows require directional/spot lights
- `[SHD.3 -> GRD.1]` - Ground receives shadows
- `[SHD.2.1 -> PRF.2]` - Shadow map size affects performance

**Critical Code:** `[!SHD.2]` Shadow generator - one per shadow-casting light

---

### Ground/Terrain System Tags (GRD)

| Tag | Description | Location | Impacts |
|-----|-------------|----------|---------|
| **GRD.1** | Ground system init | GroundPlugin.start() | Ground creation |
| **GRD.1.1** | Ground type selection | GroundPlugin.type | Plane/heightmap |
| **GRD.2** | Plane ground creation | GroundPlugin.createPlane() | Flat ground |
| **GRD.2.1** | Ground mesh creation | CreateGround() | Mesh geometry |
| **GRD.2.2** | Ground collision setup | ground.checkCollisions | Collision |
| **GRD.2.3** | Ground pickable | ground.isPickable | Raycasting |
| **GRD.3** | Heightmap ground | GroundPlugin.createHeightmap() | Terrain |
| **GRD.3.1** | Heightmap loading | CreateGroundFromHeightMap() | Image-based |
| **GRD.3.2** | Height range | minHeight/maxHeight | Terrain elevation |
| **GRD.4** | Ground material setup | GroundPlugin.applyMaterial() | Ground texture |
| **GRD.4.1** | Texture tiling | texture.uScale/vScale | Texture repeat |
| **GRD.4.2** | Normal map | material.bumpTexture | Surface detail |

**Cross-References:**
- `[GRD.2.2 -> COL.2]` - Ground uses simple collision
- `[GRD.4 -> MAT.1]` - Ground uses material system
- `[GRD.1 -> SHD.4]` - Ground receives shadows

**Critical Code:** `[!GRD.1]` Ground creation - camera/physics expect ground to exist

---

### Material System Tags (MAT)

| Tag | Description | Location | Impacts |
|-----|-------------|----------|---------|
| **MAT.1** | Material creation | MaterialPlugin.createMaterial() | Mesh appearance |
| **MAT.1.1** | StandardMaterial | new BABYLON.StandardMaterial() | Basic material |
| **MAT.1.2** | PBRMaterial | new BABYLON.PBRMaterial() | Realistic material |
| **MAT.2** | Texture loading | new BABYLON.Texture() | Material textures |
| **MAT.2.1** | Diffuse texture | material.diffuseTexture | Base color |
| **MAT.2.2** | Normal texture | material.bumpTexture | Surface bumps |
| **MAT.2.3** | Specular texture | material.specularTexture | Shininess |
| **MAT.2.4** | PBR textures | albedo/metallic/roughness | PBR workflow |
| **MAT.3** | Material properties | color/specular/emissive | Material look |
| **MAT.4** | Material presets | MaterialPlugin.presets | Common materials |

**Cross-References:**
- `[MAT.1 -> GRD.4]` - Ground uses material system
- `[MAT.2 -> AST.1]` - Textures loaded via asset system
- `[MAT.3 -> LGT.3]` - Materials react to lighting

---

### Asset System Tags (AST)

| Tag | Description | Location | Impacts |
|-----|-------------|----------|---------|
| **AST.1** | Asset loading | AssetPlugin.loadAsset() | Models/textures |
| **AST.1.1** | Texture loading | AssetPlugin.loadTexture() | Image files |
| **AST.1.2** | Model loading | AssetPlugin.loadModel() | GLTF/OBJ |
| **AST.2** | Asset caching | AssetPlugin.cache | Performance |
| **AST.3** | Asset disposal | AssetPlugin.disposeAsset() | Memory cleanup |
| **AST.4** | Loading progress | AssetPlugin.onProgress | UI feedback |

**Cross-References:**
- `[AST.1.1 -> MAT.2]` - Textures used by materials
- `[AST.2 -> PRF.3]` - Caching improves performance

---

### Interaction System Tags (INT)

| Tag | Description | Location | Impacts |
|-----|-------------|----------|---------|
| **INT.1** | Interaction init | InteractionPlugin.start() | Input handlers |
| **INT.2** | Click interaction | InteractionPlugin.onClick() | Mesh picking |
| **INT.3** | Hover interaction | InteractionPlugin.onHover() | Mesh highlighting |
| **INT.4** | Drag interaction | InteractionPlugin.onDrag() | Mesh movement |
| **INT.5** | Context menu | InteractionPlugin.showContextMenu() | Right-click |

**Cross-References:**
- `[INT.2 -> COL.2.2]` - Click requires mesh.isPickable
- `[INT.5 -> UI.2]` - Context menu is UI element

---

### User Interface Tags (UI)

| Tag | Description | Location | Impacts |
|-----|-------------|----------|---------|
| **UI.1** | UI system init | UIPlugin.start() | UI creation |
| **UI.2** | DOM UI elements | UIPlugin.createDOMElement() | HTML overlay |
| **UI.3** | Babylon.GUI elements | UIPlugin.createGUIElement() | 3D UI |
| **UI.4** | Status panel | UIPlugin.statusPanel | FPS/info display |
| **UI.5** | Controls panel | UIPlugin.controlsPanel | Help overlay |

---

### Performance System Tags (PRF)

| Tag | Description | Location | Impacts |
|-----|-------------|----------|---------|
| **PRF.1** | Performance monitoring | PerformancePlugin.monitor() | FPS tracking |
| **PRF.2** | Scene optimizer | PerformancePlugin.optimize() | Auto-quality |
| **PRF.3** | LOD system | PerformancePlugin.setupLOD() | Mesh detail |
| **PRF.4** | Occlusion culling | PerformancePlugin.setupCulling() | Hidden meshes |
| **PRF.5** | Throttled updates | PerformancePlugin.throttle() | DOM updates |

**Cross-References:**
- `[PRF.2 -> SHD.2.1]` - Optimizer adjusts shadow quality
- `[PRF.5 -> UI.4]` - Throttle status panel updates

**Critical Code:** `[!PRF.1]` Performance monitoring - affects frame budget

---

## Tag Usage Examples

### Example 1: Camera Creation Code

```javascript
// [CAM.1] Camera creation system
// [CAM.1 -> COL.2] Camera setup impacts collision configuration
// [CAM.1 -> GRV.3] Camera may use scene gravity
createCamera(type, name, config) {
    let camera;

    // [CAM.1.1] Universal camera creation
    // [CAM.1.1 -> MOV.4] Universal camera supports keyboard movement
    if (type === 'universal') {
        camera = new BABYLON.UniversalCamera(
            name,
            new BABYLON.Vector3(config.x || 0, config.y || 2, config.z || -10),
            this.scene
        );

        // [CAM.3.1] Keyboard controls setup
        // [CAM.3.1 -> MOV.4.1] May conflict with MovementPlugin keyboard bindings
        camera.keysUp.push(87);    // W
        camera.keysDown.push(83);  // S
        camera.keysLeft.push(65);  // A
        camera.keysRight.push(68); // D

        // [CAM.5] Camera collision configuration
        if (config.collision) {
            // [CAM.5.1] Collision ellipsoid defines camera size
            // [CAM.5.1 -> COL.2.1] Uses Babylon simple collision
            camera.checkCollisions = true;
            camera.ellipsoid = new BABYLON.Vector3(
                config.ellipsoid?.x || 1,
                config.ellipsoid?.y || 1.5,
                config.ellipsoid?.z || 1
            );

            // [CAM.5.2] Gravity application to camera
            // [CAM.5.2 -> GRV.3] Uses scene.gravity value from GravityPlugin
            if (config.gravity) {
                camera.applyGravity = true;
            }
        }
    }

    // [CAM.3.2] Mouse controls attachment
    // [CAM.3.2 -> ENG.1.1] Requires canvas from engine
    camera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);

    // [EVT.2] Emit camera created event
    this.events.emit('camera:created', { name, type });

    return camera;
}
```

### Example 2: Collision Setup Code

```javascript
// [COL.1] Collision system initialization
// [!COL.1] CRITICAL: Must run before any mesh creation
async start() {
    // [COL.1.1] Enable Babylon simple collision for scene
    // [COL.1.1 -> CAM.5] Required for camera collision detection
    this.scene.collisionsEnabled = true;

    // [COL.1.2] Initialize physics engine if needed
    // [COL.1.2 -> PHY.1] Delegates to physics system
    // [COL.1.2 -> GRV.4] Physics uses gravity from GravityPlugin
    if (this.mode === 'physics' || this.mode === 'hybrid') {
        await this.initPhysics();
    }

    // [EVT.2] Emit collision ready event
    this.events.emit('collision:ready', { mode: this.mode });
}

// [COL.3] Physics body creation for mesh
// [COL.3 -> PHY.2] Creates Havok physics aggregate
enablePhysicsBody(mesh, options = {}) {
    // [COL.3 | PHY.1.3] Requires physics engine enabled
    if (!this.physicsEnabled) {
        throw new Error('Physics not enabled. Use mode: "physics" or "hybrid"');
    }

    // [COL.3.1] Select collision shape type
    const shape = options.shape || BABYLON.PhysicsShapeType.BOX;

    // [COL.3.2] Set mass (0 = static, >0 = dynamic)
    // [COL.3.2 -> GRD.2] Ground should have mass 0
    const mass = options.mass !== undefined ? options.mass : 1;

    // [COL.3.3] Restitution (bounciness)
    const restitution = options.restitution || 0.5;

    // [COL.3.4] Friction (sliding resistance)
    const friction = options.friction || 0.5;

    // [PHY.2] Create physics aggregate
    const aggregate = new BABYLON.PhysicsAggregate(
        mesh,
        shape,
        { mass, restitution, friction },
        this.scene
    );

    // [EVT.2] Emit physics body enabled
    this.events.emit('collision:physics:enabled', { mesh, aggregate });

    return aggregate;
}
```

### Example 3: Cross-System Integration

```javascript
// [GRD.1] Ground creation
// [GRD.1 -> COL.2] Ground requires collision setup
// [GRD.1 -> SHD.4] Ground should receive shadows
// [GRD.1 -> MAT.1] Ground needs material
createPlane(config) {
    const size = config.size || 100;

    // [GRD.2.1] Create ground mesh
    this.ground = BABYLON.MeshBuilder.CreateGround('ground', {
        width: size,
        height: size,
        subdivisions: config.subdivisions || 32
    }, this.scene);

    // [GRD.2.2] Enable collision detection
    // [GRD.2.2 -> COL.2.1] Uses Babylon simple collision
    // [GRD.2.2 -> CAM.5] Required for camera to walk on ground
    this.ground.checkCollisions = true;

    // [GRD.2.3] Make pickable for raycasting
    // [GRD.2.3 -> INT.2] Required for click-to-move
    // [GRD.2.3 -> MOV.5.1] Click-to-move picks ground
    this.ground.isPickable = true;

    // [GRD.4] Apply material to ground
    // [GRD.4 -> MAT.1] Uses material system
    if (config.material) {
        this.applyMaterial(config.material);
    }

    // [EVT.2] Emit ground created event
    // [EVT.2 -> COL.4] CollisionPlugin listens for auto-setup
    // [EVT.2 -> SHD.6] ShadowPlugin listens for auto-setup
    this.events.emit('ground:created', { ground: this.ground, type: 'plane' });
}
```

---

## Tag Search Guide

### Find All Code Related to a System

**Example: Find all camera-related code**
```bash
# Search for any camera tag
grep -r "\[CAM\." src/

# Search for specific camera feature
grep -r "\[CAM\.1\]" src/  # Camera initialization only
```

### Find Impact of Changing Code

**Example: What breaks if I change camera initialization?**
```bash
# Search for code that depends on CAM.1
grep -r "CAM\.1" src/ | grep "\->"

# Results:
# [CAM.1 -> COL.2]  - Collision setup depends on camera
# [MOV.1 -> CAM.1]  - Movement requires camera
```

### Find Shared Code

**Example: Find code used by multiple systems**
```bash
# Search for shared tags
grep -r "\|" src/

# Results:
# [COL.3 | PHY.2]  - Used by both collision and physics
```

### Find Critical Code

**Example: Find fragile code that affects many systems**
```bash
# Search for critical tags
grep -r "\[!" src/

# Results:
# [!ENG.1.3]  - Scene creation (all plugins depend on this)
# [!EVT.1]    - Event emitter (all plugin communication)
# [!COL.1]    - Collision init (must run first)
```

---

## Tag Maintenance Rules

### When to Add Tags

1. **At function/class definition** - Primary tag for what it does
2. **At code blocks** - Sub-tags for specific implementations
3. **At cross-system calls** - Cross-reference tags showing dependencies
4. **At critical code** - Warning tags with `!` prefix

### When to Update Tags

1. **Adding new feature** - Create new tag, document in this file
2. **Changing dependencies** - Update cross-reference tags
3. **Refactoring** - Keep tags aligned with new structure
4. **Removing code** - Remove tags from this reference doc

### Tag Review Checklist

Before committing code, verify:
- [ ] All new functions have primary tags
- [ ] All cross-system calls have cross-reference tags
- [ ] All critical code has warning tags
- [ ] All tags documented in this reference
- [ ] Tag numbering is sequential and logical

---

## Quick Reference: Common Tag Patterns

### Pattern 1: System Initialization
```javascript
// [SYSTEM.1] System initialization
// [!SYSTEM.1] CRITICAL: Must run before X
start() {
    // ... init code
    this.events.emit('system:ready');
}
```

### Pattern 2: Cross-System Dependency
```javascript
// [SYSTEM1.N] Feature in system 1
// [SYSTEM1.N -> SYSTEM2.N] Depends on system 2
function feature() {
    const dependency = this.getPlugin('system2').getSomething();
    // ... use dependency
}
```

### Pattern 3: Shared Code
```javascript
// [SYSTEM1.N | SYSTEM2.N] Used by both systems
// Changes here affect multiple systems
function sharedUtility() {
    // ... shared logic
}
```

### Pattern 4: Event Emission
```javascript
// [EVT.2] Emit event for system state change
// [SYSTEM.N] Specific system action
this.events.emit('system:action:detail', { data });
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-31 | Initial tag system design |

---

**Last Updated:** 2025-10-31
**Maintainer:** Development Team
**Review Frequency:** Monthly or on major refactors
