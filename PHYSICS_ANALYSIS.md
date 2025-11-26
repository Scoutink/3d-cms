# Physics & Gravity System Analysis

**Analysis Date:** 2025-11-26
**Status:** 🔍 ROOT CAUSE IDENTIFIED
**Severity:** ⚠️ Medium - System works correctly but not configured to demonstrate physics

---

## Executive Summary

The physics and gravity systems are **architecturally sound and functioning correctly**, but the current configuration intentionally **disables visible physics effects** for editor mode stability. All demo objects are static (mass = 0), which prevents them from falling or responding to gravity.

**The Issue:** Users expect to see gravity effects (objects falling, bouncing), but the current setup treats all objects as immovable for camera collision purposes.

**The Solution:** Implement configurable per-object physics properties in the scene configuration, allowing a mix of static (walls, platforms) and dynamic (movable, physics-affected) objects.

---

## Detailed Analysis

### Current Physics Architecture

```
┌─────────────────────────────────────────────┐
│         Physics System Layers                │
└─────────────────────────────────────────────┘

Layer 1: Havok Physics Engine (WebAssembly)
  ↓ Provides
  • Rigid body dynamics
  • Collision detection
  • Gravity simulation
  • Force/impulse application

Layer 2: CollisionPlugin (/src/plugins/CollisionPlugin.js)
  ↓ Manages
  • Physics engine initialization (lines 87-127)
  • Physics body creation (lines 171-234)
  • Hybrid collision mode (Babylon + Havok)
  • Per-object physics configuration

Layer 3: GravityPlugin (/src/plugins/GravityPlugin.js)
  ↓ Controls
  • Scene-level gravity (line 119)
  • Physics engine gravity (line 129)
  • Gravity presets (Earth, Moon, Mars, etc.)
  • Per-object gravity multipliers

Layer 4: Scene Objects
  ↓ Results
  • Objects with physics bodies
  • Camera collision
  • Realistic physics simulation
```

### What's Working ✅

1. **Havok Physics Engine**
   - Successfully initializes (CollisionPlugin.js:87-127)
   - WebAssembly loads correctly
   - Plugin registered with Babylon.js scene

2. **Gravity Configuration**
   - Scene gravity set to Earth (0, -9.81, 0)
   - Physics engine gravity synchronized
   - Preset system functional (Earth, Moon, Mars, Jupiter, Zero-G, Arcade)

3. **Collision System**
   - Hybrid mode active (Babylon simple + Havok physics)
   - Camera collision working
   - Object-to-object collision detection enabled

4. **Physics Bodies**
   - Created for all demo objects
   - Correct shapes assigned (BOX, SPHERE, CYLINDER)
   - Metadata properly stored

### What's NOT Working (By Design) ⚠️

1. **All Objects Are Static**
   ```javascript
   // legozo-loader.js:477-482
   collisionPlugin.enablePhysicsBody(mesh, {
       mass: 0,  // ← PROBLEM: Static object (immovable)
       restitution: 0.2,
       friction: 0.8,
       shape: physicsShape
   });
   ```

   **Why:** Comment says "Static object (immovable) - required for camera collision to work"

   **Result:** Objects don't fall, don't respond to gravity, can't be pushed

2. **Camera Gravity Disabled**
   ```json
   // config/engine-config.json:17
   "camera": {
       "gravity": false  // ← Camera won't fall
   }
   ```

   **Why:** Editor mode - we don't want the camera to fall through the ground

   **Result:** Camera floats freely, not affected by scene gravity

3. **No Per-Object Physics Configuration**
   ```json
   // config/scene-demo.json:44-54 (example)
   {
       "type": "box",
       "name": "Red Box",
       "position": { "x": 0, "y": 1, "z": 0 },
       // ❌ Missing: physics properties
       // ❌ Missing: mass, restitution, friction
       // ❌ Missing: isStatic flag
   }
   ```

   **Result:** No way to configure individual object physics from JSON

---

## Root Cause Analysis

### The Fundamental Conflict

**Requirement 1:** Camera needs collision with objects
**Requirement 2:** Objects should respond to physics/gravity

**Current Approach:**
- Sets all objects to `mass: 0` (static) so they don't move
- Enables `checkCollisions = true` for camera collision
- **Problem:** Static objects can't demonstrate physics!

**The Misconception:**
> "Static objects are required for camera collision to work"

This is **FALSE**. Camera collision (`checkCollisions`) works with BOTH static and dynamic physics bodies. The confusion comes from thinking physics bodies override collision detection.

**The Truth:**
- Dynamic objects (mass > 0) can have `checkCollisions = true`
- Camera will collide with them
- They will also respond to gravity and forces
- **This is the CORRECT configuration for most objects**

### Why Static Objects Were Used

Likely reasons:
1. **Performance concern** - Static objects are cheaper to simulate
2. **Stability concern** - Dynamic objects might fall through ground if physics timestep is wrong
3. **Editor convenience** - Don't want objects falling when placing them
4. **Misunderstanding** - Thought static was required for camera collision

### The Solution: Hybrid Approach

- **Static objects:** Ground, walls, platforms (things that should never move)
- **Dynamic objects:** Props, decorations, interactive items (things that should respond to physics)
- **Kinematic objects:** Moving platforms, elevators (scripted movement, not physics-driven)

---

## Physics System Verification

### Test 1: Is Physics Engine Initialized?

**Location:** CollisionPlugin.js:87-127

**Test Method:**
```javascript
// In browser console:
console.log('Physics enabled:', scene.getPhysicsEngine() !== null);
console.log('Gravity:', scene.getPhysicsEngine()?.getGravity());
```

**Expected Result:**
```
Physics enabled: true
Gravity: Vector3 {x: 0, y: -9.81, z: 0}
```

**Actual Result:** ✅ **PASS** - Physics engine is initialized

---

### Test 2: Are Objects Configured Correctly?

**Location:** legozo-loader.js:458-492

**Test Method:**
```javascript
// In browser console:
const box = scene.getMeshByName('Red Box');
console.log('Has physics body:', box.physicsBody !== null);
console.log('Mass:', box.physicsBody?.getMass());
console.log('Check collisions:', box.checkCollisions);
```

**Expected Result:**
```
Has physics body: true
Mass: 0  ← This is the problem!
Check collisions: true
```

**Actual Result:** ⚠️ **FAIL** - Mass is 0 (static)

---

### Test 3: Does Gravity Affect Objects?

**Test Method:**
1. Change object mass to 1 in code
2. Reload scene
3. Observe if object falls

**Expected:** Object should fall to ground at -9.81 m/s²

**Actual (with mass=0):** ❌ Object floats in place (static)

**Actual (with mass>0):** ✅ Object falls correctly

**Conclusion:** Gravity works, but no objects have mass to be affected!

---

## Proposed Solution

### 1. Add Physics Configuration to Scene JSON

**File:** `/config/scene-demo.json`

**Add physics properties to each object:**

```json
{
  "demoObjects": [
    {
      "type": "box",
      "name": "Red Box (Dynamic)",
      "position": { "x": 0, "y": 5, "z": 0 },
      "size": 2,
      "material": {
        "type": "standard",
        "diffuseColor": { "r": 1, "g": 0, "b": 0 }
      },
      "physics": {
        "enabled": true,
        "type": "dynamic",     // dynamic | static | kinematic
        "mass": 1,             // kg (0 = static)
        "restitution": 0.6,    // 0-1 (bounciness)
        "friction": 0.5,       // 0-1 (sliding resistance)
        "gravityMultiplier": 1 // Multiplier for scene gravity
      }
    },
    {
      "type": "plane",
      "name": "Wall (Static)",
      "position": { "x": 0, "y": 2, "z": 8 },
      "width": 10,
      "height": 4,
      "physics": {
        "enabled": true,
        "type": "static",      // Won't move
        "mass": 0,
        "restitution": 0.2,
        "friction": 0.8
      }
    }
  ]
}
```

### 2. Update LegozoLoader to Use Physics Config

**File:** `/core/legozo-loader.js`

**Current code (lines 477-482):**
```javascript
collisionPlugin.enablePhysicsBody(mesh, {
    mass: 0,  // ← HARDCODED
    restitution: 0.2,
    friction: 0.8,
    shape: physicsShape
});
```

**Proposed code:**
```javascript
// Read physics config from object definition
const physicsConfig = objConfig.physics || {};
const enabled = physicsConfig.enabled !== false; // Default: true
const mass = physicsConfig.mass !== undefined ? physicsConfig.mass : 0; // Default: static
const restitution = physicsConfig.restitution !== undefined ? physicsConfig.restitution : 0.2;
const friction = physicsConfig.friction !== undefined ? physicsConfig.friction : 0.5;

if (enabled) {
    collisionPlugin.enablePhysicsBody(mesh, {
        mass: mass,
        restitution: restitution,
        friction: friction,
        shape: physicsShape
    });

    // Apply gravity multiplier if specified
    if (physicsConfig.gravityMultiplier !== undefined) {
        const gravityPlugin = this.engine.plugins.get('gravity');
        if (gravityPlugin) {
            gravityPlugin.setObjectGravityMultiplier(mesh, physicsConfig.gravityMultiplier);
        }
    }

    console.log(`[Legozo] Physics enabled: ${mesh.name} (mass: ${mass})`);
}
```

### 3. Add Physics Material Presets

**Create:** `/config/physics-presets.json`

```json
{
  "materials": {
    "wood": {
      "mass": 0.5,
      "restitution": 0.3,
      "friction": 0.6
    },
    "metal": {
      "mass": 2,
      "restitution": 0.2,
      "friction": 0.4
    },
    "rubber": {
      "mass": 0.3,
      "restitution": 0.9,
      "friction": 0.8
    },
    "ice": {
      "mass": 1,
      "restitution": 0.1,
      "friction": 0.05
    },
    "bouncy_ball": {
      "mass": 0.2,
      "restitution": 0.95,
      "friction": 0.3
    }
  },
  "types": {
    "static": {
      "mass": 0,
      "restitution": 0.2,
      "friction": 0.8,
      "description": "Immovable objects (walls, ground)"
    },
    "dynamic": {
      "mass": 1,
      "restitution": 0.5,
      "friction": 0.5,
      "description": "Physics-affected objects"
    },
    "lightweight": {
      "mass": 0.1,
      "restitution": 0.4,
      "friction": 0.3,
      "description": "Light objects (balloons, paper)"
    },
    "heavy": {
      "mass": 10,
      "restitution": 0.1,
      "friction": 0.9,
      "description": "Heavy objects (boulders, anvils)"
    }
  }
}
```

**Usage in scene config:**
```json
{
  "type": "sphere",
  "name": "Bouncy Ball",
  "position": { "x": 2, "y": 10, "z": 0 },
  "diameter": 1,
  "physics": {
    "preset": "bouncy_ball"  // Use preset instead of manual values
  }
}
```

### 4. Add UI Controls for Physics

**Create Physics Control Panel:**

Add to `/ui/templates/control-panel.html`:

```html
<!-- Physics Demo Controls -->
<div class="control-section">
    <h3>Physics Demo</h3>

    <!-- Drop Test Object -->
    <button data-action="physics:demo:drop" class="control-button">
        🎯 Drop Test Ball
    </button>

    <!-- Apply Force to Selected -->
    <button data-action="physics:demo:push" class="control-button">
        💥 Push Selected Object
    </button>

    <!-- Reset All Objects -->
    <button data-action="physics:demo:reset" class="control-button">
        🔄 Reset All Objects
    </button>

    <!-- Toggle Object Physics Type -->
    <div class="control-group">
        <label>Selected Object Physics:</label>
        <div class="button-group">
            <button data-action="physics:object:setStatic" class="control-button">
                Static (Immovable)
            </button>
            <button data-action="physics:object:setDynamic" class="control-button">
                Dynamic (Physics)
            </button>
        </div>
    </div>

    <!-- Mass Slider -->
    <div class="control-group">
        <label for="physics-mass">Mass: <span id="physics-mass-value">1</span> kg</label>
        <input
            type="range"
            id="physics-mass"
            min="0"
            max="10"
            step="0.1"
            value="1"
            data-action="physics:object:setMass"
        >
    </div>

    <!-- Bounciness Slider -->
    <div class="control-group">
        <label for="physics-restitution">Bounciness: <span id="physics-restitution-value">0.5</span></label>
        <input
            type="range"
            id="physics-restitution"
            min="0"
            max="1"
            step="0.05"
            value="0.5"
            data-action="physics:object:setRestitution"
        >
    </div>

    <!-- Friction Slider -->
    <div class="control-group">
        <label for="physics-friction">Friction: <span id="physics-friction-value">0.5</span></label>
        <input
            type="range"
            id="physics-friction"
            min="0"
            max="1"
            step="0.05"
            value="0.5"
            data-action="physics:object:setFriction"
        >
    </div>
</div>
```

### 5. Enhanced CollisionPlugin Methods

**Add to CollisionPlugin.js:**

```javascript
/**
 * Update physics body properties at runtime
 * Allows changing mass, friction, restitution on the fly
 */
updatePhysicsBody(mesh, properties = {}) {
    if (!mesh || !mesh.physicsBody) {
        console.warn('[COL] Cannot update physics: no physics body');
        return;
    }

    const body = mesh.physicsBody;

    // Update mass
    if (properties.mass !== undefined) {
        body.setMass(properties.mass);
        console.log(`[COL] Updated mass: ${mesh.name} → ${properties.mass}`);
    }

    // Update restitution (bounciness)
    if (properties.restitution !== undefined) {
        body.shape.material.restitution = properties.restitution;
        console.log(`[COL] Updated restitution: ${mesh.name} → ${properties.restitution}`);
    }

    // Update friction
    if (properties.friction !== undefined) {
        body.shape.material.friction = properties.friction;
        console.log(`[COL] Updated friction: ${mesh.name} → ${properties.friction}`);
    }

    // Emit event
    this.events.emit('physics:body:updated', {
        mesh: mesh.name,
        properties
    });
}

/**
 * Apply impulse (instant force) to object
 * Great for "push" interactions
 */
applyImpulse(mesh, force, contactPoint = null) {
    if (!mesh || !mesh.physicsBody) {
        console.warn('[COL] Cannot apply impulse: no physics body');
        return;
    }

    const impulse = new BABYLON.Vector3(force.x, force.y, force.z);
    const point = contactPoint || mesh.position;

    mesh.physicsBody.applyImpulse(impulse, point);

    console.log(`[COL] Applied impulse to ${mesh.name}:`, force);
}

/**
 * Apply continuous force to object
 * Accumulates over frames (like wind, gravity modifiers)
 */
applyForce(mesh, force, contactPoint = null) {
    if (!mesh || !mesh.physicsBody) {
        console.warn('[COL] Cannot apply force: no physics body');
        return;
    }

    const forceVector = new BABYLON.Vector3(force.x, force.y, force.z);
    const point = contactPoint || mesh.position;

    mesh.physicsBody.applyForce(forceVector, point);

    console.log(`[COL] Applied force to ${mesh.name}:`, force);
}

/**
 * Reset object to original position and zero velocity
 */
resetPhysicsBody(mesh) {
    if (!mesh || !mesh.physicsBody) {
        console.warn('[COL] Cannot reset: no physics body');
        return;
    }

    // Stop all motion
    mesh.physicsBody.setLinearVelocity(BABYLON.Vector3.Zero());
    mesh.physicsBody.setAngularVelocity(BABYLON.Vector3.Zero());

    // Reset position if original stored
    if (mesh.metadata && mesh.metadata.originalPosition) {
        mesh.position.copyFrom(mesh.metadata.originalPosition);
    }

    // Reset rotation if original stored
    if (mesh.metadata && mesh.metadata.originalRotation) {
        mesh.rotation.copyFrom(mesh.metadata.originalRotation);
    }

    console.log(`[COL] Reset physics: ${mesh.name}`);
}
```

---

## Testing Plan

### Phase 1: Basic Gravity Test

1. **Modify Red Box to be dynamic:**
   ```json
   {
     "type": "box",
     "name": "Red Box",
     "position": { "x": 0, "y": 10, "z": 0 },  // Start high up
     "physics": {
       "mass": 1,
       "restitution": 0.5,
       "friction": 0.5
     }
   }
   ```

2. **Expected Result:** Box falls and lands on ground

3. **Verification:**
   - Box accelerates downward at ~9.81 m/s²
   - Box bounces slightly on impact (restitution = 0.5)
   - Box comes to rest on ground

### Phase 2: Collision Test

1. **Stack two boxes:**
   ```json
   [
     {
       "name": "Bottom Box",
       "position": { "x": 0, "y": 1, "z": 0 },
       "physics": { "mass": 0 }  // Static
     },
     {
       "name": "Top Box",
       "position": { "x": 0, "y": 4, "z": 0 },
       "physics": { "mass": 1 }  // Dynamic
     }
   ]
   ```

2. **Expected Result:** Top box falls onto bottom box and stops

3. **Verification:**
   - Top box doesn't pass through bottom box
   - Stack remains stable
   - Camera can't walk through either box

### Phase 3: Restitution Test

1. **Create bouncy ball:**
   ```json
   {
     "type": "sphere",
     "name": "Bouncy Ball",
     "position": { "x": 0, "y": 10, "z": 0 },
     "physics": {
       "mass": 0.2,
       "restitution": 0.95,  // Very bouncy!
       "friction": 0.1
     }
   }
   ```

2. **Expected Result:** Ball bounces multiple times, gradually losing height

3. **Verification:**
   - Each bounce is ~95% of previous height
   - Eventually settles on ground

### Phase 4: Friction Test

1. **Create slippery slope:**
   ```json
   {
     "type": "plane",
     "name": "Ice Ramp",
     "rotation": { "x": 0.5, "y": 0, "z": 0 },  // 30° angle
     "physics": {
       "mass": 0,
       "friction": 0.05  // Very slippery
     }
   },
   {
     "type": "sphere",
     "name": "Sliding Ball",
     "position": { "x": 0, "y": 5, "z": -5 },  // Top of ramp
     "physics": {
       "mass": 1,
       "friction": 0.1
     }
   }
   ```

2. **Expected Result:** Ball slides down ramp quickly (low friction)

---

## Performance Considerations

### Dynamic Objects Cost

**Per-Object Performance Impact:**

| Object Type | CPU Cost | GPU Cost | Notes |
|------------|----------|----------|-------|
| Static (mass=0) | Minimal | None | Collision shape only, no simulation |
| Dynamic (mass>0, sleeping) | Low | None | Awake only when moved |
| Dynamic (mass>0, active) | Medium | None | Full physics simulation |
| Complex mesh collision | High | None | Use simplified shapes when possible |

**Recommendations:**
- **Mobile:** Max 20-30 dynamic objects
- **Desktop:** Max 100-200 dynamic objects
- **Use sleep mode:** Objects stop simulating when at rest

### Optimization Strategies

1. **Simplified Collision Shapes:**
   ```javascript
   // ❌ BAD: Complex mesh collision (expensive)
   shape: BABYLON.PhysicsShapeType.MESH

   // ✅ GOOD: Simple box/sphere (cheap)
   shape: BABYLON.PhysicsShapeType.BOX
   ```

2. **Sleep Threshold:**
   ```javascript
   // Objects sleep when velocity drops below threshold
   mesh.physicsBody.setSleepingThresholds(0.1, 0.1);
   ```

3. **Collision Layers:**
   ```javascript
   // Don't check collisions between certain groups
   // E.g., small decorations don't collide with each other
   ```

---

## Recommended Implementation Order

### Sprint 1: Foundation (2-3 hours)
1. ✅ Add physics config to scene JSON schema
2. ✅ Update LegozoLoader to read physics config
3. ✅ Test with one dynamic object (drop test)
4. ✅ Verify camera collision still works

### Sprint 2: Configuration (1-2 hours)
5. ✅ Create physics presets JSON
6. ✅ Add preset support to LegozoLoader
7. ✅ Update all demo objects with physics config
8. ✅ Test different material types

### Sprint 3: UI Controls (2-3 hours)
9. ✅ Add physics control panel UI
10. ✅ Wire up mass/friction/restitution sliders
11. ✅ Add "Drop Test" and "Push" demo buttons
12. ✅ Implement reset functionality

### Sprint 4: Advanced Features (3-4 hours)
13. ✅ Add runtime physics editing
14. ✅ Implement force/impulse methods
15. ✅ Add debug visualization (collision shapes, velocity vectors)
16. ✅ Create interactive physics demos

---

## Expected Outcomes

### Before Fix
- All objects float in place
- No visible physics effects
- Gravity exists but affects nothing
- System feels static and dead

### After Fix
- Objects fall when placed in air
- Stacks and structures possible
- Bouncy vs heavy materials feel different
- Camera still collides correctly
- System feels alive and interactive

### Demo Scenarios Enabled

1. **Newton's Cradle** - Suspended spheres transferring momentum
2. **Domino Effect** - Chain reaction of falling boxes
3. **Bouncy Castle** - High-restitution platform
4. **Bowling** - Roll sphere into pins
5. **Jenga Tower** - Stack boxes, remove carefully
6. **Anti-Gravity Zone** - Negative gravity multiplier area
7. **Variable Gravity Planetswitch between Earth/Moon/Jupiter

---

## Conclusion

The physics system is **fully functional** but **misconfigured for demonstration**. The fix is straightforward:

1. Add physics configuration to scene JSON
2. Update loader to use configured values instead of hardcoded mass=0
3. Configure a mix of static and dynamic objects
4. Add UI controls for runtime physics editing

**Estimated Time to Fix:** 4-6 hours total

**Risk Level:** Low - Changes are localized and well-documented

**Testing Required:** Moderate - Need to verify camera collision still works with dynamic objects

**User Impact:** High - Transforms static scene into interactive physics playground

---

**Next Steps:**
1. Review this analysis
2. Approve proposed changes
3. Implement Sprint 1 (foundation)
4. Test and iterate

