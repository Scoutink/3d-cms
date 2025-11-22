# Phase 2: Visual Enhancement - Implementation Plan

**Tags:** `[GRD.*]`, `[LGT.*]`, `[SHD.*]`, `[MAT.*]`

**Duration:** Weeks 4-5 (2 weeks)

**Status:** Planning → Implementation

**Last Updated:** 2025-11-20

---

## Overview

Phase 2 focuses on visual enhancement systems that make the 3D scenes look professional and provide creative control. This phase builds on the solid foundation from Phase 0 (Core) and Phase 1 (Foundation).

**Key Principle:** Default settings + Runtime flexibility + Per-object overrides

---

## Phase 2 Plugins

### 1. GroundPlugin `[GRD.*]`

**Priority:** High (User-requested features)
**Complexity:** Medium
**Lines:** ~400-500

#### Features:

##### A. Ground Creation `[GRD.1]`
- Multiple ground types:
  - Plane (simple, fast)
  - Grid (for editor visualization)
  - Heightmap (terrain from image)
  - Procedural (noise-based terrain) - *Future*

##### B. Ground Sizing `[GRD.2]`
- **Fixed mode** `[GRD.2.1]`: Specific dimensions (50x50, 100x200, etc.)
- **Device-relative mode** `[GRD.2.4]`: Size based on viewport (2x screen width)
- *Procedural mode* `[GRD.2.2]`: Infinite generation - *Phase 3*
- *Hybrid mode* `[GRD.2.3]`: One fixed, one procedural - *Phase 3*

##### C. Ground Rotation/Tilt `[GRD.3]` **USER REQUIREMENT!**
- X-axis rotation (horizontal tilt)
- Z-axis rotation (vertical tilt)
- Combined (diagonal tilt)
- **Use case:** 3D website replacements
- Presets: horizontal, vertical, diagonal45

##### D. Camera Edge Behavior `[GRD.4]` **USER REQUIREMENT!**
- **Stop at edge** `[GRD.4.1]`: Camera blocked at boundaries
- **Teleport to start** `[GRD.4.2]`: Return to origin
- **Wrap around** `[GRD.4.3]`: Pac-Man style
- **Custom trigger** `[GRD.4.4]`: Event-based user control

##### E. Ground Materials `[GRD.5]`
- Texture support
- Tiling controls
- Color overrides
- Integration with MaterialPlugin

#### Methods:
```javascript
// [GRD.1] Creation
createGround(type, options)  // 'plane', 'grid', 'heightmap'
getGround()

// [GRD.2] Sizing
setSizeMode(mode, options)   // 'fixed', 'relative'
getSize()
updateSize(width, height)

// [GRD.3] Rotation (USER REQUIREMENT!)
setRotation(x, y, z)
useRotationPreset(preset)    // 'horizontal', 'vertical', 'diagonal45'
getRotation()

// [GRD.4] Edge behavior (USER REQUIREMENT!)
setEdgeBehavior(behavior, options)  // 'stop', 'teleport', 'wrap', 'custom'
checkCameraEdge(camera)

// [GRD.5] Materials
setMaterial(material)
setTexture(url, tiling)
setColor(color)

// [GRD.6] Collision
enableCollision()
disableCollision()

// [GRD] Utility
dispose()
reset()
```

#### Configuration:
```json
{
  "ground": {
    "enabled": true,
    "type": "plane",
    "sizeMode": "fixed",
    "width": 100,
    "height": 100,
    "rotation": {
      "x": 0,
      "y": 0,
      "z": 0
    },
    "edgeBehavior": "stop",
    "material": {
      "color": "#8B7355",
      "texture": null,
      "tiling": { "u": 1, "v": 1 }
    },
    "collision": true,
    "physics": {
      "mass": 0,
      "friction": 0.8
    }
  }
}
```

---

### 2. LightingPlugin `[LGT.*]`

**Priority:** High
**Complexity:** Medium
**Lines:** ~350-400

#### Features:

##### A. Light Types `[LGT.1]`
- Hemisphere light (ambient, soft)
- Directional light (sun/moon)
- Point light (lamp, torch)
- Spot light (flashlight, stage light)

##### B. Light Presets `[LGT.2]`
- **Day**: Bright hemisphere + strong directional
- **Night**: Dark hemisphere + dim directional (moon)
- **Indoor**: Multiple point lights
- **Dramatic**: High contrast, focused spots
- **Sunset**: Warm colors, low angle
- **Studio**: Even, neutral lighting

##### C. Runtime Control `[LGT.3]` **USER REQUIREMENT!**
- Change light positions (sun/moon movement)
- Adjust intensity
- Change colors
- Enable/disable lights
- **Future:** External API integration (weather, time, location)

##### D. Per-Light Properties `[LGT.4]`
- Individual light control
- Shadow casting per light
- Range/falloff settings

#### Methods:
```javascript
// [LGT.1] Light creation
createLight(type, name, options)  // 'hemisphere', 'directional', 'point', 'spot'
getLight(name)
getAllLights()
deleteLight(name)

// [LGT.2] Presets
usePreset(preset)  // 'day', 'night', 'indoor', 'dramatic', 'sunset', 'studio'
addPreset(name, config)

// [LGT.3] Runtime control (USER REQUIREMENT!)
setLightPosition(name, position)  // For directional sun movement
setLightIntensity(name, intensity)
setLightColor(name, color)
enableLight(name)
disableLight(name)

// [LGT.4] Per-light properties
setLightProperty(name, property, value)
setLightRange(name, range)  // Point/spot lights

// [LGT] Utility
reset()
dispose()
```

---

### 3. ShadowPlugin `[SHD.*]`

**Priority:** Medium
**Complexity:** Medium
**Lines:** ~300-350

#### Features:

##### A. Shadow Generators `[SHD.1]`
- Create shadow generators for lights
- Manage shadow maps
- Performance optimization

##### B. Shadow Quality `[SHD.2]`
- Low (512x512, fast)
- Medium (1024x1024, balanced)
- High (2048x2048, quality)
- Ultra (4096x4096, slow)

##### C. Shadow Types `[SHD.3]`
- Hard shadows (fast, sharp edges)
- Soft shadows (PCF, blurred edges)
- Advanced (contact-hardening shadows)

##### D. Per-Object Control `[SHD.4]`
- Cast shadows (object creates shadows)
- Receive shadows (object displays shadows)
- Both, neither, or one

##### E. Runtime Control `[SHD.5]`
- Enable/disable shadows globally
- Per-light shadow control
- Quality switching

#### Methods:
```javascript
// [SHD.1] Shadow generators
createShadowGenerator(lightName, options)
getShadowGenerator(lightName)

// [SHD.2] Quality
setQuality(quality)  // 'low', 'medium', 'high', 'ultra'
getQuality()

// [SHD.3] Shadow type
setShadowType(type)  // 'hard', 'soft', 'advanced'

// [SHD.4] Per-object control
enableCastShadows(mesh)
disableCastShadows(mesh)
enableReceiveShadows(mesh)
disableReceiveShadows(mesh)

// [SHD.5] Runtime control
enableShadows()
disableShadows()
setShadowsForLight(lightName, enabled)

// [SHD] Utility
reset()
dispose()
```

---

### 4. MaterialPlugin `[MAT.*]`

**Priority:** Medium
**Complexity:** Medium-High
**Lines:** ~450-500

#### Features:

##### A. Material Types `[MAT.1]`
- Standard material (diffuse, specular, emissive)
- PBR material (physically-based rendering)
- Custom materials (future)

##### B. Material Properties `[MAT.2]`
- Colors (diffuse, specular, emissive, ambient)
- Textures (diffuse, normal, specular maps)
- Opacity/transparency
- Reflection/refraction

##### C. PBR Properties `[MAT.3]`
- Albedo (base color)
- Metallic
- Roughness
- Normal maps
- Environment maps

##### D. Material Library `[MAT.4]`
- Pre-built materials (wood, metal, glass, plastic, etc.)
- Save custom materials
- Load materials from library

##### E. Runtime Control `[MAT.5]`
- Change any material property
- Swap materials on objects
- Animate properties (color fade, opacity change)

#### Methods:
```javascript
// [MAT.1] Material creation
createStandardMaterial(name, options)
createPBRMaterial(name, options)
getMaterial(name)
deleteMaterial(name)

// [MAT.2] Standard material properties
setDiffuseColor(material, color)
setSpecularColor(material, color)
setEmissiveColor(material, color)
setTexture(material, type, url)  // type: 'diffuse', 'normal', 'specular'
setOpacity(material, alpha)

// [MAT.3] PBR material properties
setAlbedoColor(material, color)
setMetallic(material, value)
setRoughness(material, value)
setPBRTexture(material, type, url)

// [MAT.4] Material library
addPreset(name, material)
usePreset(name)  // Returns material
getPresets()

// [MAT.5] Runtime control
applyMaterial(mesh, material)
animateMaterialProperty(material, property, targetValue, duration)

// [MAT] Utility
cloneMaterial(material, newName)
reset()
dispose()
```

---

## Implementation Order

### Week 4: Ground & Lighting

**Days 1-2: GroundPlugin** (High priority, user requirements)
1. Basic ground creation (plane, grid)
2. Ground rotation/tilt system `[GRD.3]` **USER REQ**
3. Fixed size mode `[GRD.2.1]`
4. Device-relative size mode `[GRD.2.4]`
5. Edge detection/behavior `[GRD.4]` **USER REQ**
6. Basic materials

**Days 3-4: LightingPlugin**
1. Light type creation (all 4 types)
2. Light presets (6 presets)
3. Runtime light control `[LGT.3]`
4. Per-light properties
5. Integration with existing scenes

**Day 5: Integration & Testing**
1. Test ground rotation (3D website use case)
2. Test edge behaviors
3. Test lighting presets
4. Fix bugs, optimize

### Week 5: Shadows & Materials

**Days 1-2: ShadowPlugin**
1. Shadow generator creation
2. Quality levels (4 levels)
3. Shadow types (hard, soft, advanced)
4. Per-object shadow control
5. Performance optimization

**Days 3-4: MaterialPlugin**
1. Standard materials
2. PBR materials
3. Material library (10+ presets)
4. Texture loading
5. Runtime property changes

**Day 5: Phase 2 Demo & Documentation**
1. Create comprehensive Phase 2 demo
2. Update documentation
3. Test all features
4. Commit & push

---

## Phase 2 Demo Requirements

### Demo Scene:
- Rotated ground (demonstrate 3D website use case)
- Multiple lighting scenarios
- Objects with various materials (wood, metal, glass, plastic)
- Shadow quality comparison
- Edge behavior demonstration

### UI Controls:
- Ground rotation sliders (X, Z axes)
- Ground rotation presets (horizontal, vertical, diagonal)
- Ground size mode toggle (fixed, relative)
- Edge behavior selection
- Lighting preset buttons
- Light position controls (sun movement)
- Shadow quality toggle
- Shadow enable/disable
- Material switcher per object
- PBR property sliders (metallic, roughness)

---

## Testing Checklist

### Ground Testing `[GRD.*]`
- ✅ Horizontal ground (default)
- ✅ Vertical ground (wall-like) - **3D website use case**
- ✅ Diagonal ground (45°)
- ✅ Fixed size ground with edge stop
- ✅ Fixed size ground with teleport
- ✅ Device-relative sizing (responsive)
- ✅ Ground material changes
- ✅ Ground collision

### Lighting Testing `[LGT.*]`
- ✅ All 6 presets work
- ✅ Runtime light position changes (sun movement)
- ✅ Runtime intensity changes
- ✅ Runtime color changes
- ✅ Multiple lights simultaneously
- ✅ Per-light enable/disable

### Shadow Testing `[SHD.*]`
- ✅ All 4 quality levels
- ✅ Hard vs soft shadows
- ✅ Per-object cast/receive
- ✅ Runtime quality switching
- ✅ Performance acceptable

### Material Testing `[MAT.*]`
- ✅ Standard materials with colors
- ✅ PBR materials with metallic/roughness
- ✅ Texture loading
- ✅ Material library presets
- ✅ Runtime material swapping
- ✅ Opacity/transparency

---

## Code Standards

### Tagging:
- All code properly tagged: `[GRD.*]`, `[LGT.*]`, `[SHD.*]`, `[MAT.*]`
- Cross-references: `[GRD.3 -> CAM.4]` (ground rotation affects camera)
- Critical sections: `[!GRD.4]` (edge behavior)

### Architecture:
- All plugins extend `Plugin` base class
- Event-driven communication via `EventEmitter`
- Configuration-driven with runtime overrides
- Lifecycle: `init()` → `start()` → runtime methods → `dispose()`

### Performance:
- Lazy initialization (don't create until needed)
- Dispose unused resources
- Shadow map optimization
- Texture caching

---

## Future Enhancements (Phase 3+)

### Ground `[GRD.*]` - Phase 3
- Procedural ground generation `[GRD.2.2]`
- Hybrid size modes `[GRD.2.3]`
- Heightmap terrain
- Chunking system for infinite worlds
- LOD (Level of Detail) system

### Lighting `[LGT.*]` - Phase 3
- External API integration (weather, time, sun position)
- Light animations (flickering, pulsing)
- Volumetric lighting (god rays)
- Area lights

### Shadows `[SHD.*]` - Phase 3
- Cascaded shadow maps (CSM)
- Ray-traced shadows
- Ambient occlusion
- Screen-space shadows

### Materials `[MAT.*]` - Phase 3
- Custom shader materials
- Material node editor
- Texture atlasing
- Material animations

---

## Success Criteria

Phase 2 is complete when:

✅ **Ground System:**
- Ground rotation/tilt working (3D website use case)
- Fixed and device-relative sizing
- Edge behaviors functional (stop, teleport)
- Materials applied to ground

✅ **Lighting System:**
- All 6 presets implemented
- Runtime position/intensity/color changes
- Multiple lights simultaneously
- Integration with shadows

✅ **Shadow System:**
- 4 quality levels working
- Per-object cast/receive control
- Runtime enable/disable
- Acceptable performance

✅ **Material System:**
- Standard and PBR materials
- Material library with 10+ presets
- Texture loading
- Runtime material changes

✅ **Demo:**
- Interactive Phase 2 demo created
- All features demonstrated
- UI controls for all settings
- Documentation complete

✅ **Code Quality:**
- All code tagged properly
- Tests passing
- Performance optimized
- Committed and pushed

---

**Status:** Ready to begin implementation
**Next:** Start with GroundPlugin (user-requested features)
**Timeline:** 2 weeks (Days 1-10)

---

**Built with:** Babylon.js 6+, Havok Physics, ES6 Modules
**Architecture:** Plugin-based, Event-driven, Configuration-driven
**Principle:** Defaults + Runtime Flexibility + Per-Object Overrides
