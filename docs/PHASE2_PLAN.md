# Phase 2: Module Implementation - Detailed Plan

**Start Date:** 2025-11-25
**Duration:** 5 days (Week 2)
**Status:** IN PROGRESS

---

## Executive Summary

Phase 2 transforms plugins into proper modules with:
- Module base class with lifecycle hooks
- Dependency resolution system
- UI controller extraction (remove inline onclick)
- Event delegation system
- Asset manifest implementation

---

## Goals & Success Criteria

### Primary Goals
1. ✅ Convert plugins to proper module architecture
2. ✅ Extract all UI controller logic from templates
3. ✅ Implement event delegation (no more inline onclick)
4. ✅ Create asset manifest system for dynamic discovery
5. ✅ Add module dependency resolution

### Success Criteria
- [ ] All modules extend ModuleBase class
- [ ] Zero inline event handlers in templates
- [ ] Event delegation working for all UI interactions
- [ ] Assets loaded dynamically from manifests
- [ ] Module dependencies automatically resolved
- [ ] All modules < 300 lines per file
- [ ] Comprehensive error handling
- [ ] 100% working functionality

---

## Architecture Overview

### Module Structure

```
modules/
├── base/
│   ├── module-base.js          # Base class for all modules
│   └── ui-controller-base.js   # Base class for UI controllers
│
├── ground/
│   ├── ground.module.js        # Main module
│   ├── ground.controller.js    # UI controller
│   ├── ground.config.js        # Default config
│   └── ground.presets.json     # Rotation presets
│
├── lighting/
│   ├── lighting.module.js
│   ├── lighting.controller.js
│   ├── lighting.config.js
│   └── lighting.presets.json
│
├── camera/
│   ├── camera.module.js
│   ├── camera.controller.js
│   └── camera.presets.json
│
├── material/
│   ├── material.module.js
│   ├── material.controller.js
│   └── material.gallery.js
│
└── sky/
    ├── sky.module.js
    ├── sky.controller.js
    └── sky.presets.json
```

### Event Delegation System

```javascript
// OLD: Inline onclick
<button onclick="setGroundRotation(45)">Rotate</button>

// NEW: Event delegation
<button data-action="ground:rotate" data-value="45">Rotate</button>

// Controller handles via delegation
controller.on('ground:rotate', (e) => {
    const value = e.target.dataset.value;
    this.module.setRotation(value);
});
```

---

## Implementation Tasks

### Day 1-2: Core Module System

#### Task 1.1: Create Module Base Class
**File:** `modules/base/module-base.js`

**Requirements:**
- Lifecycle hooks: init(), start(), stop(), dispose()
- Dependency declaration
- Event system integration
- Configuration management
- State management
- Error handling

**Interface:**
```javascript
class ModuleBase {
    constructor(options)
    get name()
    get version()
    get dependencies()

    async init(engine, config)
    async start()
    async stop()
    dispose()

    getState()
    setState(state)

    on(event, handler)
    emit(event, data)
}
```

#### Task 1.2: Create UI Controller Base Class
**File:** `modules/base/ui-controller-base.js`

**Requirements:**
- Event delegation system
- Template binding
- Data attribute handling
- Form management
- Validation
- Error display

**Interface:**
```javascript
class UIControllerBase {
    constructor(module, container)

    attachEventListeners()
    detachEventListeners()

    on(action, handler)
    emit(action, data)

    updateUI(state)
    validate(data)
    showError(message)
}
```

#### Task 1.3: Implement Dependency Resolution
**File:** `core/dependency-resolver.js`

**Requirements:**
- Topological sorting
- Circular dependency detection
- Missing dependency error handling
- Load order optimization

**Algorithm:**
```javascript
class DependencyResolver {
    resolve(modules) {
        // 1. Build dependency graph
        // 2. Detect cycles
        // 3. Topological sort
        // 4. Return ordered list
    }
}
```

#### Task 1.4: Update Legozo Loader
**File:** `core/legozo-loader.js`

**Changes:**
- Use DependencyResolver
- Load modules in dependency order
- Handle module initialization failures
- Support hot module reload (future)

---

### Day 3: Convert Plugins to Modules

#### Task 2.1: Convert GroundPlugin
**Files:**
- `modules/ground/ground.module.js`
- `modules/ground/ground.controller.js`
- `modules/ground/ground.config.js`
- `modules/ground/ground.presets.json`

**Module Responsibilities:**
- Wrap existing GroundPlugin
- Expose clean API
- Manage ground state
- Handle rotation, edge behaviors
- Integration with controller

**Controller Responsibilities:**
- Handle UI interactions
- Update ground settings
- Display current state
- Validation

**Extraction Map:**
```
From phase3-full-demo.html:
- setGroundRotationPreset() → controller.setRotationPreset()
- setCustomGroundRotation() → controller.setCustomRotation()
- toggleInfiniteTerrain() → controller.toggleInfiniteTerrain()
- setEdgeBehavior() → controller.setEdgeBehavior()
```

#### Task 2.2: Convert LightingPlugin
**Files:**
- `modules/lighting/lighting.module.js`
- `modules/lighting/lighting.controller.js`
- `modules/lighting/lighting.presets.json`

**Extraction Map:**
```
From phase3-full-demo.html:
- setLightingPreset() → controller.setPreset()
- adjustLightIntensity() → controller.setIntensity()
- toggleLighting() → controller.toggle()
```

#### Task 2.3: Convert CameraPlugin
**Files:**
- `modules/camera/camera.module.js`
- `modules/camera/camera.controller.js`
- `modules/camera/camera.presets.json`

**Extraction Map:**
```
From phase3-full-demo.html:
- setCameraPreset() → controller.setPreset()
- adjustCameraSpeed() → controller.setSpeed()
- resetCamera() → controller.reset()
```

---

### Day 4: UI Controller Extraction

#### Task 3.1: Extract Shadow Controls
**File:** `modules/shadow/shadow.controller.js`

**Functions to extract:**
- toggleShadows()
- setShadowQuality()
- adjustShadowIntensity()

#### Task 3.2: Extract Sky Controls
**File:** `modules/sky/sky.controller.js`

**Functions to extract:**
- setSkyPreset()
- toggleFog()
- adjustFogDensity()

#### Task 3.3: Extract Material Gallery
**File:** `modules/material/material.gallery.js`

**Functions to extract:**
- setMaterialPreset()
- showMaterialGallery()
- applyMaterialToSelected()

#### Task 3.4: Create Event Delegation System
**File:** `ui/event-delegator.js`

**Requirements:**
- Central event delegation
- Action-based routing
- Data attribute parsing
- Error handling
- Performance optimization

**Usage:**
```javascript
const delegator = new EventDelegator();

// Register action handlers
delegator.register('ground:rotate', (e, data) => {
    groundController.setRotation(data.value);
});

// Auto-parse data attributes
<button data-action="ground:rotate" data-value="45">
```

#### Task 3.5: Update Templates
**Files:** All `ui/templates/*.html`

**Changes:**
- Replace all `onclick="func()"` with `data-action="module:action"`
- Add `data-*` attributes for parameters
- Remove inline JavaScript
- Add semantic action names

**Example:**
```html
<!-- OLD -->
<button onclick="setGroundRotationPreset('horizontal')">
    Horizontal
</button>

<!-- NEW -->
<button data-action="ground:preset" data-preset="horizontal">
    Horizontal
</button>
```

---

### Day 5: Asset Manifest System

#### Task 4.1: Create Asset Manifest Structure
**Files:**
- `assets/textures/ground/manifest.json`
- `assets/textures/walls/manifest.json`
- `assets/models/primitives/manifest.json`

**Manifest Schema:**
```json
{
  "name": "Ground Textures",
  "category": "ground",
  "version": "1.0",
  "assets": [
    {
      "id": "dirt_01",
      "name": "Dirt",
      "type": "texture",
      "files": {
        "diffuse": "dirt.jpg",
        "normal": "dirt_normal.jpg",
        "preview": "dirt_preview.jpg"
      },
      "properties": {
        "tiling": 4,
        "metallic": 0.1,
        "roughness": 0.8
      },
      "tags": ["natural", "ground", "brown"]
    }
  ]
}
```

#### Task 4.2: Implement Asset Loader
**File:** `core/asset-loader.js`

**Requirements:**
- Load manifests
- Cache assets
- Preview generation
- Category filtering
- Search/filter by tags
- Lazy loading

**API:**
```javascript
const loader = new AssetLoader();

// Load category manifest
await loader.loadCatalog('ground');

// Get all textures
const textures = await loader.getAssets('ground', 'texture');

// Search by tag
const natural = await loader.searchByTag('natural');

// Get asset URL
const url = loader.getAssetURL('ground', 'dirt_01', 'diffuse');
```

#### Task 4.3: Update Material Module
**File:** `modules/material/material.module.js`

**Changes:**
- Use AssetLoader instead of hardcoded paths
- Dynamic texture discovery
- Preview generation
- Gallery population

#### Task 4.4: Create Asset Browser UI
**File:** `ui/components/asset-browser.js`

**Requirements:**
- Grid view of assets
- Search/filter UI
- Preview images
- Click to apply
- Category tabs
- Tag filtering

---

## Testing Strategy

### Unit Tests
- [ ] ModuleBase lifecycle
- [ ] UIControllerBase event delegation
- [ ] DependencyResolver algorithm
- [ ] AssetLoader manifest parsing
- [ ] Event delegation routing

### Integration Tests
- [ ] Module loading order
- [ ] Module communication via events
- [ ] UI controller → Module interaction
- [ ] Asset loading and application
- [ ] Error handling cascade

### Manual Tests
- [ ] All UI controls work without inline onclick
- [ ] Ground rotation presets
- [ ] Lighting presets
- [ ] Camera presets
- [ ] Material gallery
- [ ] Asset browser
- [ ] Event delegation performance
- [ ] Module hot reload

---

## Quality Standards

### Code Quality
- Maximum file size: 300 lines
- Maximum function size: 50 lines
- Maximum cyclomatic complexity: 10
- JSDoc comments required
- Error handling mandatory
- No console.log in production

### Module Standards
- Must extend ModuleBase
- Must declare dependencies
- Must handle errors gracefully
- Must emit lifecycle events
- Must support hot reload
- Must be testable in isolation

### Controller Standards
- Must extend UIControllerBase
- Must use event delegation only
- Must validate all inputs
- Must show user-friendly errors
- Must update UI on state change
- Must be reversible (undo/redo ready)

---

## File Organization

```
3d-cms/
├── modules/
│   ├── base/
│   │   ├── module-base.js          [NEW]
│   │   └── ui-controller-base.js   [NEW]
│   ├── ground/
│   │   ├── ground.module.js        [NEW]
│   │   ├── ground.controller.js    [NEW]
│   │   ├── ground.config.js        [NEW]
│   │   └── ground.presets.json     [NEW]
│   ├── lighting/
│   ├── camera/
│   ├── material/
│   ├── shadow/
│   └── sky/
│
├── core/
│   ├── legozo-loader.js            [UPDATE]
│   ├── dependency-resolver.js      [NEW]
│   └── asset-loader.js             [NEW]
│
├── ui/
│   ├── event-delegator.js          [NEW]
│   ├── components/
│   │   └── asset-browser.js        [NEW]
│   └── templates/
│       └── *.html                  [UPDATE - remove onclick]
│
├── assets/
│   └── textures/
│       └── ground/
│           ├── manifest.json       [NEW]
│           ├── dirt.jpg
│           └── dirt_preview.jpg    [NEW]
│
└── tests/
    ├── unit/
    │   ├── module-base.test.js     [NEW]
    │   ├── dependency-resolver.test.js [NEW]
    │   └── asset-loader.test.js    [NEW]
    └── integration/
        ├── module-loading.test.js  [NEW]
        └── ui-delegation.test.js   [NEW]
```

---

## Risk Assessment

### High Risk
- **Breaking existing functionality**
  - Mitigation: Keep old plugins working, gradual migration
  - Fallback: Feature flags for new modules

- **Circular dependencies**
  - Mitigation: DependencyResolver with cycle detection
  - Fallback: Manual dependency ordering

- **Event delegation performance**
  - Mitigation: Delegate at root, use event.target
  - Fallback: Direct event listeners if needed

### Medium Risk
- **Asset loading failures**
  - Mitigation: Fallback to hardcoded paths
  - Error handling: Show user-friendly messages

- **Module initialization failures**
  - Mitigation: Try-catch all module loading
  - Fallback: Graceful degradation

### Low Risk
- **Browser compatibility**
  - Mitigation: ES6+ features well-supported
  - Fallback: Babel transpilation if needed

---

## Migration Strategy

### Phase 2a: Infrastructure (Days 1-2)
1. Create ModuleBase class
2. Create UIControllerBase class
3. Create DependencyResolver
4. Update Legozo Loader
5. Test module loading

### Phase 2b: Module Conversion (Day 3)
1. Convert GroundPlugin → GroundModule
2. Convert LightingPlugin → LightingModule
3. Convert CameraPlugin → CameraModule
4. Test module functionality

### Phase 2c: UI Controllers (Day 4)
1. Extract all controller logic
2. Implement event delegation
3. Update all templates
4. Test all UI interactions

### Phase 2d: Asset System (Day 5)
1. Create asset manifests
2. Implement AssetLoader
3. Create asset browser
4. Test asset loading

---

## Success Metrics

### Quantitative
- [ ] Module files: 0 → 20+ modules
- [ ] Inline onclick: 50+ → 0
- [ ] Event delegation: 0% → 100%
- [ ] Asset manifests: 0 → 5+ categories
- [ ] Test coverage: 0% → 70%+

### Qualitative
- [ ] Code is more maintainable
- [ ] Easier to add new features
- [ ] Better error messages
- [ ] Faster development cycle
- [ ] More professional architecture

---

## Phase 2 Completion Criteria

- [x] All plugins converted to modules
- [ ] ModuleBase class created and tested
- [ ] UIControllerBase class created
- [ ] DependencyResolver working
- [ ] Zero inline event handlers
- [ ] Event delegation functional
- [ ] Asset manifest system working
- [ ] All UI controls working
- [ ] Documentation updated
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Committed and pushed

---

**Status:** Ready to implement
**Next Action:** Create ModuleBase class
