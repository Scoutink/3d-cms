# Ground System Requirements & Future Enhancements

**Tags:** `[GRD.*]`, `[UI.*]`, `[INT.*]`

**Status:** Requirements documented for Phase 2+ implementation

**Last Updated:** 2025-11-20

---

## Overview

This document captures user requirements for the ground system and future UI/menu enhancements. These requirements will be implemented in Phase 2 (Ground basics) and expanded in later phases (Advanced features).

---

## Ground System Requirements `[GRD.*]`

### 1. Ground Rotation and Tilt `[GRD.3]`

**Priority:** High
**Phase:** 2 (Basics), 3 (Advanced controls)

#### Requirements:
- **Default State:** Horizontal ground (current implementation)
- **Rotation Axes:**
  - Horizontal tilt (X-axis rotation)
  - Vertical tilt (Z-axis rotation)
  - Diagonal tilt (Combined X+Z rotations)
- **Use Case:** 3D website replacements
  - Example: Tilted ground as "scrolling page"
  - Example: Vertical ground as "wall" for vertical layouts
  - Example: Diagonal for artistic/architectural presentations

#### Implementation Notes:
```javascript
// [GRD.3] Ground rotation properties
groundPlugin.setRotation({
  x: 0,    // Horizontal tilt (radians)
  y: 0,    // Spin rotation (radians)
  z: 0     // Vertical tilt (radians)
});

// Presets for common use cases
groundPlugin.useRotationPreset('horizontal');  // Default
groundPlugin.useRotationPreset('vertical');    // Wall-like
groundPlugin.useRotationPreset('diagonal45');  // 45° tilt
```

#### Configuration:
```json
{
  "ground": {
    "rotation": {
      "x": 0,
      "y": 0,
      "z": 0,
      "presets": {
        "horizontal": { "x": 0, "y": 0, "z": 0 },
        "vertical": { "x": 1.5708, "y": 0, "z": 0 },
        "diagonal45": { "x": 0.7854, "y": 0, "z": 0.7854 }
      }
    }
  }
}
```

---

### 2. Ground Size Modes `[GRD.2]`

**Priority:** High
**Phase:** 2 (Basics), 3 (Procedural)

#### A. Fixed Length/Width Mode `[GRD.2.1]`
- Ground has specific dimensions (e.g., 50x50, 100x200)
- Boundaries are enforced
- Camera behavior at edges (see below)

#### B. Procedural Mode `[GRD.2.2]`
- Ground generates/extends as camera moves
- Infinite world feel
- Performance-optimized chunking

#### C. Hybrid Mode `[GRD.2.3]`
- **Fix one dimension, procedural on the other**
- Example: Fixed width (50), infinite length
- Use case: Linear experiences (racing game, story path)

#### D. Device-Relative Mode `[GRD.2.4]`
- Ground size relative to screen/viewport
- Example: "Ground width = 2x viewport width"
- Responsive 3D experiences
- Mobile-friendly scaling

#### Implementation:
```javascript
// [GRD.2.1] Fixed mode
groundPlugin.setSizeMode('fixed', {
  width: 100,
  height: 100
});

// [GRD.2.2] Procedural mode
groundPlugin.setSizeMode('procedural', {
  chunkSize: 50,
  visibleChunks: 9, // 3x3 grid around camera
  generationDistance: 100
});

// [GRD.2.3] Hybrid mode
groundPlugin.setSizeMode('hybrid', {
  widthMode: 'fixed',
  widthValue: 50,
  lengthMode: 'procedural'
});

// [GRD.2.4] Device-relative mode
groundPlugin.setSizeMode('relative', {
  widthMultiplier: 2.0,  // 2x viewport width
  heightMultiplier: 3.0  // 3x viewport height
});
```

---

### 3. Camera Edge Behavior (Non-Procedural Grounds) `[GRD.4]`

**Priority:** Medium
**Phase:** 2 (Basics)

When camera reaches ground edge in fixed/hybrid modes:

#### Option A: Stop at Edge `[GRD.4.1]`
- Camera cannot move beyond ground boundaries
- Collision-like behavior
- Use case: Bounded experiences (rooms, arenas)

#### Option B: Teleport to Start `[GRD.4.2]`
- Camera wraps around to starting position
- Loop-like behavior
- Use case: Endless runners, cyclical experiences

#### Option C: Wrap Around `[GRD.4.3]`
- Camera appears on opposite edge (Pac-Man style)
- Use case: Toroidal worlds, special effects

#### Option D: Custom Trigger `[GRD.4.4]`
- Fire event, let user handle behavior
- Maximum flexibility

#### Implementation:
```javascript
// [GRD.4] Set edge behavior
groundPlugin.setEdgeBehavior('stop');      // Default
groundPlugin.setEdgeBehavior('teleport', {
  returnPosition: { x: 0, y: 2, z: 0 }
});
groundPlugin.setEdgeBehavior('wrap');
groundPlugin.setEdgeBehavior('custom', (camera, edge) => {
  // User-defined behavior
  console.log('Camera hit edge:', edge);
});

// [GRD.4] Edge detection events
events.on('ground:edge:reached', (data) => {
  // data.edge: 'north', 'south', 'east', 'west'
  // data.position: camera position at edge
});
```

---

## Future UI/Menu System `[UI.*]`

**Priority:** Low (After Phase 2 complete)
**Phase:** 4+

### 1. Scene Editing Mode vs Browsing Mode `[UI.1]`

#### Editing Mode `[UI.1.1]`
- Full controls for scene manipulation
- Object property panels
- Real-time adjustments
- Visual gizmos (move, rotate, scale)
- Like Unity/Unreal editor

#### Browsing Mode `[UI.1.2]`
- User-facing, simplified controls
- Hidden editor UI
- Experience the scene as end-user
- Performance optimized

#### Mode Switching:
```javascript
// [UI.1] Mode management
uiPlugin.setMode('editing');  // Full editor
uiPlugin.setMode('browsing'); // User experience
uiPlugin.setMode('preview');  // Testing user view
```

---

### 2. Object Property Menus `[UI.2]`

**Requirements:** Access to all plugin-defined properties with UI

#### Property Panel System:
- **Select object** → Show property panel
- **Grouped by plugin/system:**
  - Physics (mass, friction, restitution)
  - Gravity (multiplier, zones)
  - Collision (enabled, shape, properties)
  - Materials (color, texture, PBR settings)
  - Transform (position, rotation, scale)
  - Custom metadata

#### Example UI:
```
┌─ Object: Balloon ─────────────┐
│                                │
│ Transform                      │
│   Position: (-5, 3, 0)         │
│   Rotation: (0, 0, 0)          │
│   Scale: (1, 1, 1)             │
│                                │
│ Physics                        │
│   Mass: 0.5 kg                 │
│   Restitution: 0.8            │
│   Friction: 0.1                │
│                                │
│ Gravity                        │
│   Multiplier: -0.3  [Anti-g!]  │
│   In Zone: None                │
│                                │
│ Material                       │
│   Type: Standard               │
│   Color: #FF3333               │
│   Emissive: #330000            │
│                                │
│ Custom Properties              │
│   + Add Property               │
│                                │
└────────────────────────────────┘
```

#### Implementation Pattern:
```javascript
// [UI.2] Property panel system
const propertyPanel = uiPlugin.createPropertyPanel(object);

// [UI.2.1] Each plugin can register property sections
gravityPlugin.registerPropertySection({
  name: 'Gravity',
  properties: [
    {
      key: 'gravityMultiplier',
      label: 'Multiplier',
      type: 'number',
      min: -2.0,
      max: 2.0,
      step: 0.1
    }
  ],
  onUpdate: (object, key, value) => {
    gravityPlugin.setObjectGravityMultiplier(object, value);
  }
});
```

---

### 3. Scene Property Menus `[UI.3]`

**Global scene settings accessible via UI**

#### Scene Panel:
```
┌─ Scene Properties ────────────┐
│                                │
│ Gravity                        │
│   Preset: [Earth ▼]            │
│   Custom: (0, -9.81, 0)        │
│                                │
│ Ground                         │
│   Type: [Fixed ▼]              │
│   Size: 100 x 100              │
│   Rotation: (0, 0, 0)          │
│   Edge Behavior: [Stop ▼]     │
│                                │
│ Lighting                       │
│   Preset: [Day ▼]              │
│   Intensity: 0.8               │
│   Shadow Quality: [Medium ▼]   │
│                                │
│ Camera                         │
│   Default Type: [Universal ▼]  │
│   Speed: 0.5                   │
│   Sensitivity: 3000            │
│                                │
│ Movement                       │
│   Default Mode: [Keyboard ▼]   │
│   Speed: 0.5                   │
│   Acceleration: 0.1            │
│                                │
└────────────────────────────────┘
```

---

## Implementation Roadmap

### Phase 2: Ground Basics (Current)
- ✅ Basic ground creation (plane)
- ⏳ Ground rotation/tilt system `[GRD.3]`
- ⏳ Fixed size mode `[GRD.2.1]`
- ⏳ Edge detection/behavior `[GRD.4]`
- ⏳ Ground materials

### Phase 3: Advanced Ground (Weeks 6-7)
- Procedural ground generation `[GRD.2.2]`
- Hybrid size modes `[GRD.2.3]`
- Device-relative sizing `[GRD.2.4]`
- Heightmap terrain
- Chunking system for performance

### Phase 4: UI System (Week 8+)
- Mode system (editing vs browsing) `[UI.1]`
- Object property panels `[UI.2]`
- Scene property panels `[UI.3]`
- Visual gizmos (transform tools)
- Control presets/templates

### Phase 5: Advanced Controls (Future)
- Custom control schemes
- Touch/mobile controls
- VR/AR controls
- Gamepad support
- Accessibility options

---

## Key Design Principles

### 1. **Default + Runtime Flexibility**
- Sensible defaults from config
- All properties changeable at runtime
- No hardcoded values

### 2. **Layered Complexity**
- Simple by default
- Advanced features available when needed
- Progressive disclosure in UI

### 3. **Future-Ready Architecture**
- Hooks for features not yet implemented
- Event-driven for extensibility
- Plugin-based for modularity

### 4. **Configuration-Driven**
- JSON config for defaults
- Runtime API for changes
- UI reflects current state

---

## User Requirements Summary

✅ **Implemented:**
- Click-to-move camera direction alignment
- Basic ground system
- Plugin architecture ready for expansion

⏳ **Planned (Phase 2):**
- Ground rotation/tilt `[GRD.3]`
- Ground size modes `[GRD.2]`
- Camera edge behavior `[GRD.4]`
- Lighting system `[LGT.*]`
- Shadow system `[SHD.*]`
- Material system `[MAT.*]`

📋 **Future (Phase 4+):**
- Scene editing vs browsing modes `[UI.1]`
- Object property menus `[UI.2]`
- Scene property menus `[UI.3]`
- Procedural ground generation `[GRD.2.2]`
- Advanced control schemes

---

## Notes

- **3D Website Use Case:** Ground rotation/tilt is key feature
  - Allows traditional web layouts in 3D space
  - Vertical ground = wall-mounted content
  - Tilted ground = scrolling pages

- **Responsive 3D:** Device-relative sizing
  - Ground adapts to screen size
  - Mobile-friendly experiences
  - Consistent UX across devices

- **Editor Paradigm:** Editing vs Browsing modes
  - Editing mode for content creators
  - Browsing mode for end users
  - Clean separation of concerns

---

**Built with:** Babylon.js 6+, Havok Physics, ES6 Modules
**Documentation:** Living document, updated as features implemented
**Status:** Requirements captured, ready for Phase 2 implementation
