# Legozo 3D CMS - Software Architecture Document

**Version:** 1.0
**Date:** 2025-11-25
**Status:** APPROVED - Implementation Ready

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Problems](#current-problems)
3. [Architecture Vision](#architecture-vision)
4. [Core Principles](#core-principles)
5. [System Architecture](#system-architecture)
6. [Module Organization](#module-organization)
7. [Folder Structure](#folder-structure)
8. [Loading Strategy](#loading-strategy)
9. [WordPress Integration](#wordpress-integration)
10. [Asset Management](#asset-management)
11. [Configuration Management](#configuration-management)
12. [Performance Optimization](#performance-optimization)
13. [Migration Strategy](#migration-strategy)
14. [Implementation Roadmap](#implementation-roadmap)

---

## 1. Executive Summary

### Problem Statement
The current implementation has **1,921 lines in a single HTML file** (phase3-full-demo.html), mixing:
- UI templates (600+ lines)
- CSS styles (500+ lines)
- Configuration (200+ lines)
- Scene setup logic (300+ lines)
- Demo object creation (200+ lines)
- Event handlers (300+ lines)

This monolithic structure is:
- ❌ **Not scalable** - Hard to add features without breaking existing code
- ❌ **Not maintainable** - Changes in one area affect unrelated areas
- ❌ **Not testable** - Cannot unit test individual components
- ❌ **Not WordPress-ready** - Cannot integrate as a lightweight page template
- ❌ **Not performant** - Loads everything upfront, no lazy loading
- ❌ **Not extensible** - Cannot add/remove features dynamically

### Solution: LEGO Architecture

Transform the codebase into a **modular, plugin-based "LEGO" system** where:
- ✅ **Each feature is a separate, self-contained module**
- ✅ **Modules load on-demand**, not upfront
- ✅ **Main page is < 100 lines**, just assembles pieces
- ✅ **Assets load dynamically** from folders
- ✅ **Configuration is external**, not hardcoded
- ✅ **WordPress-ready** as a lightweight template
- ✅ **Easy to extend** - add new LEGOs without touching core

---

## 2. Current Problems

### 2.1 Monolithic HTML File

**Current:** `phase3-full-demo.html` = 1,921 lines

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        /* 500 lines of CSS */
    </style>
</head>
<body>
    <!-- 600 lines of UI markup -->

    <script>
        // 200 lines of config
        const config = { camera: {...}, ground: {...}, ... };

        // 300 lines of setup
        async function init() { ... }
        async function setupScene() { ... }
        async function createDemoObjects() { ... }

        // 300 lines of UI handlers
        function setupUI() { ... }
        function setupEventListeners() { ... }
    </script>
</body>
</html>
```

**Problems:**
- Cannot reuse code across pages
- Cannot test functions in isolation
- Hard to find/modify specific features
- Changes risk breaking unrelated features
- Cannot lazy-load unused features
- Not suitable for WordPress integration

### 2.2 Hardcoded Assets

**Current:** Texture paths hardcoded in HTML:

```javascript
// ❌ Bad: Hardcoded in main file
materialPlugin.createMaterial('dirt', {
    diffuseTexture: '../dirt.jpg',  // Hardcoded path
    bumpTexture: '../dirt_normal.jpg'
});
```

**Problems:**
- Cannot add textures without editing code
- No way to list available textures
- Cannot support user-uploaded assets
- Asset management scattered across files

### 2.3 Inline Configuration

**Current:** Configuration mixed with code:

```javascript
// ❌ Bad: Config mixed with logic
const groundPlugin = new GroundPlugin({
    width: 50,
    height: 50,
    type: 'plane',
    rotation: { x: 0, y: 0, z: 0 },
    texture: 'dirt.jpg',
    // ... 50 more lines
});
```

**Problems:**
- Cannot change settings without editing code
- No UI for non-developers to customize
- Settings not persisted
- Duplicated across demo files

### 2.4 UI in Main File

**Current:** 600+ lines of UI markup in HTML:

```html
<!-- ❌ Bad: UI markup in demo file -->
<div id="editControls">
    <div class="control-section">
        <h3>Ground Settings</h3>
        <label>Width: <input type="number" value="50"></label>
        <!-- ... 50 more input fields -->
    </div>
    <!-- ... 10 more sections -->
</div>
```

**Problems:**
- UI changes require editing main file
- Cannot reuse UI components
- Hard to maintain consistent styling
- Mixing presentation with logic

---

## 3. Architecture Vision

### The LEGO Metaphor

Think of **Legozo** as a box of LEGO pieces:

1. **Base Plate** = Empty HTML template (WordPress page)
2. **LEGO Bricks** = Modules (ground, lighting, objects, UI)
3. **Instruction Manual** = Configuration files
4. **Building Process** = Module loader assembles scene

```
┌─────────────────────────────────────────────┐
│         Legozo 3D CMS Architecture          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  WordPress Page Template (index.html)       │ ◄── Empty base plate
│  - Canvas element                           │     (~50 lines)
│  - Module loader script                     │
│  - Config reference                         │
└─────────────────────────────────────────────┘
                    ▼
        ┌───────────────────────┐
        │   Module Loader       │ ◄── Assembler
        │   (legozo-loader.js)  │     (~100 lines)
        └───────────────────────┘
                    ▼
    ┌───────────┬───────────┬───────────┐
    │ Config    │  Assets   │  Modules  │ ◄── LEGO pieces
    │ .json     │  /textures│  /plugins │     (load on demand)
    └───────────┴───────────┴───────────┘
                    ▼
        ┌───────────────────────┐
        │   3D Scene Rendered   │ ◄── Final build
        └───────────────────────┘
```

### Key Architectural Goals

1. **Lightweight Landing Page**
   - Main HTML < 100 lines
   - No inline CSS/JS
   - Just canvas + loader

2. **On-Demand Module Loading**
   - Load only what's needed
   - Progressive enhancement
   - Lazy loading for performance

3. **Dynamic Asset Discovery**
   - Assets in folders, not code
   - Auto-discover textures/models
   - Support user uploads

4. **External Configuration**
   - Settings in JSON files
   - UI-editable configs
   - Persistent storage

5. **WordPress-Ready**
   - Single PHP template file
   - Minimal dependencies
   - Standard WP integration

---

## 4. Core Principles

### 4.1 Separation of Concerns

Each type of code lives in its own file/folder:

| Concern | Location | Example |
|---------|----------|---------|
| **Structure** | HTML template | `index.html` |
| **Presentation** | CSS modules | `ui/styles/panel.css` |
| **Behavior** | JS modules | `modules/ground-controls.js` |
| **Configuration** | JSON files | `config/scene.json` |
| **Assets** | Asset folders | `assets/textures/dirt.jpg` |

### 4.2 Single Responsibility

Each module does ONE thing well:

```javascript
// ✅ Good: Module has single responsibility
// modules/ground-controls.js
export class GroundControls {
    // ONLY handles ground UI controls
    // Does NOT handle rendering, events, or other features

    constructor(groundPlugin) { }

    createUI() { }        // Create ground control UI
    updateUI() { }        // Update UI from ground state
    handleInput() { }     // Handle user input
}
```

### 4.3 Dependency Injection

Modules receive dependencies, don't create them:

```javascript
// ❌ Bad: Module creates dependencies
class GroundControls {
    constructor() {
        this.groundPlugin = new GroundPlugin(); // Tightly coupled!
    }
}

// ✅ Good: Dependencies injected
class GroundControls {
    constructor(groundPlugin) {           // Injected
        this.groundPlugin = groundPlugin;  // Loosely coupled
    }
}
```

### 4.4 Convention over Configuration

Use sensible defaults, minimize required config:

```javascript
// ❌ Bad: Everything must be configured
const ground = new GroundModule({
    width: 50,                    // Required
    height: 50,                   // Required
    subdivisions: 10,             // Required
    material: {...},              // Required
    collision: {...},             // Required
    // ... 20 more required fields
});

// ✅ Good: Sensible defaults, minimal config
const ground = new GroundModule();  // Works with defaults

// Optional: Override only what you need
ground.configure({ width: 100 });   // Change one thing
```

### 4.5 Progressive Enhancement

Core features work without extras:

```javascript
// Core engine loads first (required)
await loadCore();

// Optional enhancements load after
if (config.shadows.enabled) {
    await loadModule('shadows');  // Load only if needed
}

if (config.physics.enabled) {
    await loadModule('physics');  // Load only if needed
}
```

---

## 5. System Architecture

### 5.1 Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                     │
│  - HTML Templates                                       │
│  - CSS Modules                                          │
│  - UI Components                                        │
└─────────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                      │
│  - Module Loader                                        │
│  - Scene Orchestrator                                   │
│  - Event Bus                                            │
└─────────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    DOMAIN LAYER                         │
│  - Core Plugins (Ground, Lighting, Camera, etc.)       │
│  - Feature Modules (Controls, Presets, Interactions)   │
│  - Business Logic                                       │
└─────────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│                INFRASTRUCTURE LAYER                     │
│  - BabylonEngine (Core)                                 │
│  - Config Loader                                        │
│  - Asset Loader                                         │
│  - Storage (localStorage/API)                           │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Module Lifecycle

```
┌────────────┐
│  REGISTER  │ ◄── Module announces itself
└──────┬─────┘
       ▼
┌────────────┐
│   LOAD     │ ◄── Load module file (if needed)
└──────┬─────┘
       ▼
┌────────────┐
│ INITIALIZE │ ◄── Setup module state
└──────┬─────┘
       ▼
┌────────────┐
│   START    │ ◄── Begin module functionality
└──────┬─────┘
       ▼
┌────────────┐
│  RUNNING   │ ◄── Normal operation
└──────┬─────┘
       ▼
┌────────────┐
│   STOP     │ ◄── Pause module (optional)
└──────┬─────┘
       ▼
┌────────────┐
│  DISPOSE   │ ◄── Cleanup and destroy
└────────────┘
```

### 5.3 Event-Driven Communication

Modules communicate via events, not direct calls:

```javascript
// ❌ Bad: Direct coupling
class GroundControls {
    handleRotation() {
        groundPlugin.setRotation(45);         // Direct call
        shadowPlugin.updateShadows();         // Knows about shadows
        cameraPlugin.adjustViewport();        // Knows about camera
    }
}

// ✅ Good: Event-driven
class GroundControls {
    handleRotation() {
        groundPlugin.setRotation(45);
        // Emit event - other modules listen if interested
        events.emit('ground:rotated', { angle: 45 });
    }
}

// Other modules listen independently
shadowPlugin.on('ground:rotated', () => this.updateShadows());
cameraPlugin.on('ground:rotated', () => this.adjustViewport());
```

---

## 6. Module Organization

### 6.1 Module Types

#### A. Core Modules (Always Loaded)
Required for basic functionality:

- **BabylonEngine** - Core 3D engine
- **ConfigLoader** - Load configuration
- **EventEmitter** - Event system
- **AssetLoader** - Load assets

#### B. Foundation Plugins (Loaded on Demand)
Basic scene features:

- **GroundPlugin** - Ground/terrain
- **CameraPlugin** - Camera management
- **LightingPlugin** - Lights
- **SkyPlugin** - Sky/environment

#### C. Enhancement Plugins (Optional)
Advanced features:

- **ShadowPlugin** - Shadow casting
- **MaterialPlugin** - Materials/textures
- **PhysicsPlugin** - Physics simulation
- **InteractionPlugin** - Object selection/dragging

#### D. UI Modules (Lazy Loaded)
User interface components:

- **ControlPanels** - Edit mode UI
- **PropertyPanels** - Object properties
- **Toolbars** - Action buttons
- **Modals** - Dialogs

#### E. Feature Modules (Lazy Loaded)
Specialized functionality:

- **ObjectLibrary** - Predefined 3D objects
- **TextureGallery** - Texture browser
- **PresetManager** - Scene presets
- **Exporter** - Export scene data

### 6.2 Module Structure

Each module follows this structure:

```
modules/ground/
├── ground.module.js         # Main module class
├── ground.config.js         # Default configuration
├── ground.ui.js             # UI components (if any)
├── ground.styles.css        # Styles (if any)
├── ground.presets.json      # Presets (if any)
├── ground.test.js           # Unit tests
└── README.md                # Module documentation
```

Example module:

```javascript
// modules/ground/ground.module.js

export class GroundModule {
    constructor() {
        this.name = 'ground';
        this.version = '1.0.0';
        this.dependencies = ['camera', 'lighting']; // What this needs
    }

    // Called by loader after dependencies ready
    async initialize(engine, config) {
        this.engine = engine;
        this.config = config;

        // Initialize plugin
        this.plugin = new GroundPlugin(config.ground);
        await this.plugin.init(engine.scene, engine.events, config);
    }

    // Called when module should start working
    async start() {
        await this.plugin.start();

        // Load UI if in edit mode
        if (this.config.mode === 'edit') {
            await this.loadUI();
        }
    }

    // Lazy load UI only when needed
    async loadUI() {
        const { GroundUI } = await import('./ground.ui.js');
        this.ui = new GroundUI(this.plugin);
        this.ui.attach(document.getElementById('controlsContainer'));
    }

    // Cleanup
    dispose() {
        this.ui?.dispose();
        this.plugin?.dispose();
    }
}
```

---

## 7. Folder Structure

### 7.1 New Folder Organization

```
legozo/
├── index.html                      # ◄ Main entry (< 100 lines)
├── index.php                       # ◄ WordPress template (< 150 lines)
│
├── core/                           # Core engine (always loaded)
│   ├── legozo-loader.js           # Module loader
│   ├── babylon-engine.js          # Babylon wrapper
│   ├── config-loader.js           # Config system
│   ├── asset-loader.js            # Asset system
│   ├── event-bus.js               # Event system
│   └── plugin-base.js             # Plugin base class
│
├── modules/                        # Feature modules (load on demand)
│   ├── ground/
│   │   ├── ground.module.js
│   │   ├── ground.config.js
│   │   ├── ground.ui.js
│   │   ├── ground.styles.css
│   │   └── ground.presets.json
│   │
│   ├── lighting/
│   │   ├── lighting.module.js
│   │   ├── lighting.config.js
│   │   ├── lighting.ui.js
│   │   ├── lighting.styles.css
│   │   └── lighting.presets.json
│   │
│   ├── camera/
│   │   ├── camera.module.js
│   │   ├── camera.config.js
│   │   └── camera.presets.json
│   │
│   ├── shadows/
│   ├── materials/
│   ├── physics/
│   ├── interaction/
│   └── sky/
│
├── ui/                             # UI components (lazy loaded)
│   ├── components/
│   │   ├── panel.js               # Reusable panel component
│   │   ├── slider.js              # Reusable slider component
│   │   ├── dropdown.js            # Reusable dropdown component
│   │   └── button.js              # Reusable button component
│   │
│   ├── panels/
│   │   ├── edit-controls.js       # Edit mode control panel
│   │   ├── properties.js          # Object properties panel
│   │   ├── toolbar.js             # Toolbar
│   │   └── status.js              # Status panel
│   │
│   ├── styles/
│   │   ├── base.css               # Base styles
│   │   ├── panels.css             # Panel styles
│   │   ├── controls.css           # Control styles
│   │   └── themes/                # Color themes
│   │       ├── default.css
│   │       ├── dark.css
│   │       └── light.css
│   │
│   └── templates/
│       ├── panel.html             # Panel HTML template
│       ├── slider.html            # Slider HTML template
│       └── dropdown.html          # Dropdown HTML template
│
├── assets/                         # Static assets (dynamically loaded)
│   ├── textures/
│   │   ├── ground/
│   │   │   ├── dirt.jpg
│   │   │   ├── grass.jpg
│   │   │   ├── rock.jpg
│   │   │   └── manifest.json      # ◄ Texture catalog
│   │   │
│   │   ├── walls/
│   │   ├── objects/
│   │   └── skyboxes/
│   │
│   ├── models/
│   │   ├── primitives/
│   │   │   └── manifest.json
│   │   ├── furniture/
│   │   └── decorations/
│   │
│   └── icons/
│       ├── ui/
│       └── tools/
│
├── config/                         # Configuration files
│   ├── default.json               # Default settings
│   ├── presets/
│   │   ├── scenes/
│   │   │   ├── empty-scene.json
│   │   │   ├── basic-room.json
│   │   │   └── outdoor-scene.json
│   │   │
│   │   ├── lighting/
│   │   │   ├── day.json
│   │   │   ├── night.json
│   │   │   └── studio.json
│   │   │
│   │   └── camera/
│   │       ├── first-person.json
│   │       ├── third-person.json
│   │       └── orbit.json
│   │
│   └── schema.json                # Config validation schema
│
├── plugins/                        # Babylon plugins (kept separate)
│   ├── GroundPlugin.js
│   ├── LightingPlugin.js
│   ├── CameraPlugin.js
│   └── ...
│
├── lib/                            # Third-party libraries
│   ├── babylon/                   # Babylon.js (local copy optional)
│   └── other-libs/
│
├── examples/                       # Example scenes
│   ├── basic-scene.html
│   ├── physics-demo.html
│   └── vr-demo.html
│
├── docs/                           # Documentation
│   ├── API.md
│   ├── MODULES.md
│   ├── WORDPRESS_INTEGRATION.md
│   └── SOFTWARE_ARCHITECTURE.md   # ◄ This document
│
└── tests/                          # Tests
    ├── unit/
    ├── integration/
    └── e2e/
```

### 7.2 File Size Guidelines

| File Type | Max Size | Reason |
|-----------|----------|--------|
| Main HTML | 100 lines | Minimal bootstrap only |
| Module | 300 lines | Single responsibility |
| UI Component | 200 lines | Reusable, focused |
| Config File | No limit | Data, not code |
| CSS File | 300 lines | Per component |

If a file exceeds limits, split it:

```
❌ ground.module.js (800 lines)

✅ ground/
   ├── ground.module.js (150 lines)    # Core module
   ├── ground.terrain.js (200 lines)   # Terrain generation
   ├── ground.rotation.js (150 lines)  # Rotation logic
   └── ground.edges.js (200 lines)     # Edge behaviors
```

---

## 8. Loading Strategy

### 8.1 Bootstrap Process

```javascript
// index.html (< 100 lines total)
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Legozo 3D CMS</title>
    <link rel="stylesheet" href="ui/styles/base.css">
</head>
<body>
    <!-- Just canvas, nothing else -->
    <canvas id="renderCanvas"></canvas>

    <!-- Minimal loader -->
    <script type="module">
        import { LegozoLoader } from './core/legozo-loader.js';

        // Load and start
        const legozo = new LegozoLoader();
        await legozo.loadConfig('./config/default.json');
        await legozo.start();
    </script>
</body>
</html>
```

### 8.2 Module Loader

```javascript
// core/legozo-loader.js

export class LegozoLoader {
    constructor() {
        this.modules = new Map();
        this.config = null;
    }

    async loadConfig(path) {
        const response = await fetch(path);
        this.config = await response.json();
    }

    async start() {
        // 1. Load core (required)
        await this.loadCore();

        // 2. Load modules specified in config
        const modules = this.config.modules || [];
        await this.loadModules(modules);

        // 3. Initialize in dependency order
        await this.initializeModules();

        // 4. Start all modules
        await this.startModules();

        // 5. Load UI (if edit mode)
        if (this.config.mode === 'edit') {
            await this.loadUI();
        }
    }

    async loadCore() {
        // Load core engine files
        const { BabylonEngine } = await import('./babylon-engine.js');
        const { ConfigLoader } = await import('./config-loader.js');
        const { AssetLoader } = await import('./asset-loader.js');

        // Initialize core
        this.engine = new BabylonEngine(this.canvas, this.config);
        this.assets = new AssetLoader(this.config.assets);
    }

    async loadModules(moduleNames) {
        // Load modules in parallel
        const promises = moduleNames.map(async (name) => {
            const path = `./modules/${name}/${name}.module.js`;
            const module = await import(path);

            // Instantiate module
            const ModuleClass = module[this.capitalizeFirst(name) + 'Module'];
            const instance = new ModuleClass();

            this.modules.set(name, instance);
        });

        await Promise.all(promises);
    }

    async initializeModules() {
        // Topologically sort by dependencies
        const sorted = this.sortByDependencies(this.modules);

        // Initialize in order
        for (const module of sorted) {
            await module.initialize(this.engine, this.config);
        }
    }

    async startModules() {
        for (const module of this.modules.values()) {
            await module.start();
        }
    }

    async loadUI() {
        // Lazy load UI components
        const { EditorUI } = await import('./ui/panels/edit-controls.js');
        this.ui = new EditorUI(this.engine, this.modules);
        await this.ui.initialize();
    }
}
```

### 8.3 Configuration-Driven Loading

```json
// config/default.json
{
  "mode": "edit",
  "canvas": "renderCanvas",

  "modules": [
    "ground",
    "camera",
    "lighting",
    "sky"
  ],

  "optionalModules": {
    "shadows": { "enabled": true },
    "physics": { "enabled": false },
    "vr": { "enabled": false }
  },

  "ground": {
    "width": 50,
    "height": 50,
    "type": "plane"
  },

  "lighting": {
    "preset": "day"
  }
}
```

Modules load based on config:

```javascript
// Only load enabled optional modules
for (const [name, opts] of Object.entries(config.optionalModules)) {
    if (opts.enabled) {
        await loader.loadModule(name);
    }
}
```

---

## 9. WordPress Integration

### 9.1 WordPress Template File

```php
<?php
/**
 * Template Name: Legozo 3D Scene
 * Description: 3D scene page template for WordPress
 */

get_header();
?>

<div id="legozo-container" class="legozo-page">
    <!-- 3D Canvas -->
    <canvas id="renderCanvas"></canvas>

    <!-- Loading Screen -->
    <div id="loadingScreen" class="legozo-loading">
        <div class="loading-spinner"></div>
        <p>Loading 3D Scene...</p>
    </div>
</div>

<!-- Legozo Core -->
<script type="module">
    import { LegozoLoader } from '<?php echo get_template_directory_uri(); ?>/legozo/core/legozo-loader.js';

    const legozo = new LegozoLoader();

    // Load config from WordPress
    const config = <?php echo json_encode(get_post_meta(get_the_ID(), 'legozo_config', true)); ?>;

    legozo.loadConfigObject(config);
    await legozo.start();
</script>

<?php get_footer(); ?>
```

### 9.2 WordPress Meta Box for Config

```php
// Save scene configuration in post meta
function legozo_save_scene_config($post_id) {
    if (isset($_POST['legozo_config'])) {
        $config = json_decode(stripslashes($_POST['legozo_config']), true);
        update_post_meta($post_id, 'legozo_config', $config);
    }
}
add_action('save_post', 'legozo_save_scene_config');
```

### 9.3 WordPress Admin Integration

```php
// Add Legozo settings to WordPress admin
function legozo_add_admin_menu() {
    add_menu_page(
        'Legozo Settings',
        'Legozo 3D',
        'manage_options',
        'legozo-settings',
        'legozo_settings_page',
        'dashicons-welcome-view-site'
    );
}
add_action('admin_menu', 'legozo_add_admin_menu');
```

---

## 10. Asset Management

### 10.1 Asset Manifest System

Instead of hardcoding asset paths, use manifest files:

```json
// assets/textures/ground/manifest.json
{
  "name": "Ground Textures",
  "category": "ground",
  "textures": [
    {
      "id": "dirt_01",
      "name": "Dirt",
      "diffuse": "dirt.jpg",
      "normal": "dirt_normal.jpg",
      "preview": "dirt_preview.jpg",
      "tiling": 4
    },
    {
      "id": "grass_01",
      "name": "Grass",
      "diffuse": "grass.jpg",
      "normal": "grass_normal.jpg",
      "preview": "grass_preview.jpg",
      "tiling": 8
    }
  ]
}
```

### 10.2 Asset Loader

```javascript
// core/asset-loader.js

export class AssetLoader {
    constructor(basePath) {
        this.basePath = basePath;
        this.catalogs = new Map();
    }

    // Load asset catalog
    async loadCatalog(category) {
        const path = `${this.basePath}/${category}/manifest.json`;
        const response = await fetch(path);
        const catalog = await response.json();
        this.catalogs.set(category, catalog);
        return catalog;
    }

    // Get all textures in category
    async getTextures(category) {
        if (!this.catalogs.has(category)) {
            await this.loadCatalog(category);
        }
        return this.catalogs.get(category).textures;
    }

    // Get texture by ID
    async getTexture(category, id) {
        const textures = await this.getTextures(category);
        return textures.find(t => t.id === id);
    }

    // Get full path for asset
    getAssetPath(category, filename) {
        return `${this.basePath}/${category}/${filename}`;
    }
}
```

### 10.3 Usage in Modules

```javascript
// modules/ground/ground.module.js

class GroundModule {
    async loadTextures() {
        // Get available ground textures from asset system
        const textures = await this.assets.getTextures('ground');

        // Display in UI for user to choose
        this.ui.showTextureGallery(textures);
    }

    async applyTexture(textureId) {
        // Get texture info from catalog
        const texture = await this.assets.getTexture('ground', textureId);

        // Load texture files
        const diffusePath = this.assets.getAssetPath('ground', texture.diffuse);
        const normalPath = this.assets.getAssetPath('ground', texture.normal);

        // Apply to ground
        this.plugin.applyTexture(diffusePath, normalPath, texture.tiling);
    }
}
```

---

## 11. Configuration Management

### 11.1 Configuration Hierarchy

```
Default Config              User Config              Runtime Config
(default.json)         +    (saved scenes)      +    (live changes)
      ▼                            ▼                        ▼
┌────────────────┐        ┌────────────────┐      ┌────────────────┐
│ System defaults│   +    │ User overrides │  +   │ Session changes│
│ - Basic setup  │        │ - Custom values│      │ - Temp tweaks  │
│ - Presets      │        │ - Preferences  │      │ - Not saved    │
└────────────────┘        └────────────────┘      └────────────────┘
                                   ▼
                          ┌────────────────────┐
                          │   Merged Config    │
                          │   (final values)   │
                          └────────────────────┘
```

### 11.2 Config Merging

```javascript
// core/config-loader.js

export class ConfigLoader {
    async load(defaultPath, userPath = null) {
        // 1. Load defaults
        const defaults = await this.loadJSON(defaultPath);

        // 2. Load user config (if exists)
        let user = {};
        if (userPath) {
            user = await this.loadJSON(userPath);
        }

        // 3. Merge (user overrides defaults)
        const merged = this.deepMerge(defaults, user);

        return merged;
    }

    deepMerge(target, source) {
        const output = { ...target };

        for (const key in source) {
            if (source[key] instanceof Object && key in target) {
                output[key] = this.deepMerge(target[key], source[key]);
            } else {
                output[key] = source[key];
            }
        }

        return output;
    }

    // Save config
    async save(config, path) {
        // Save to localStorage (browser)
        localStorage.setItem('legozo_config', JSON.stringify(config));

        // Or save to server (WordPress)
        if (window.wp) {
            await wp.api.posts().create({
                meta: { legozo_config: config }
            });
        }
    }
}
```

---

## 12. Performance Optimization

### 12.1 Lazy Loading Strategy

```javascript
// Load modules in stages for optimal performance

// Stage 1: Critical path (< 100ms)
await loadCore();              // ~50ms
await loadConfig();            // ~10ms
await createScene();           // ~30ms

// Stage 2: Essential features (< 500ms)
await loadModule('ground');    // ~100ms
await loadModule('camera');    // ~80ms
await loadModule('lighting');  // ~120ms

// Stage 3: Enhancements (background)
setTimeout(async () => {
    await loadModule('shadows');     // ~200ms
    await loadModule('materials');   // ~150ms
}, 1000);

// Stage 4: UI (when idle)
requestIdleCallback(async () => {
    await loadUI();                  // ~300ms
});
```

### 12.2 Code Splitting

```javascript
// Split large modules into chunks

// ground.module.js (entry point)
export class GroundModule {
    async applyRotation(angle) {
        // Lazy load rotation logic only when needed
        if (!this.rotationLogic) {
            const { GroundRotation } = await import('./ground.rotation.js');
            this.rotationLogic = new GroundRotation(this.plugin);
        }

        this.rotationLogic.apply(angle);
    }
}
```

### 12.3 Asset Optimization

```javascript
// Progressive asset loading

// 1. Load low-res preview first
const preview = await loadTexture('dirt_preview.jpg');  // 50KB
ground.applyTexture(preview);

// 2. Load full texture when ready
const full = await loadTexture('dirt.jpg');             // 2MB
ground.applyTexture(full);
```

---

## 13. Migration Strategy

### 13.1 Migration Phases

#### Phase 1: Extract UI (Week 1)
- Move CSS from HTML → `ui/styles/`
- Move HTML templates → `ui/templates/`
- Create UI components → `ui/components/`
- **Goal:** Separate presentation from logic

#### Phase 2: Extract Configuration (Week 1)
- Move hardcoded config → `config/default.json`
- Create presets → `config/presets/`
- Implement ConfigLoader
- **Goal:** External configuration

#### Phase 3: Create Module System (Week 2)
- Implement LegozoLoader
- Create module base class
- Migrate plugins to modules
- **Goal:** Modular architecture

#### Phase 4: Asset Management (Week 2)
- Move assets to folders
- Create manifest files
- Implement AssetLoader
- **Goal:** Dynamic asset loading

#### Phase 5: WordPress Integration (Week 3)
- Create PHP template
- Implement admin interface
- Test integration
- **Goal:** WordPress-ready

#### Phase 6: Optimization (Week 3)
- Implement lazy loading
- Code splitting
- Performance testing
- **Goal:** Fast loading

### 13.2 Migration Checklist

- [ ] **Extract all inline CSS** → CSS modules
- [ ] **Extract all HTML UI** → UI components
- [ ] **Extract all configuration** → JSON files
- [ ] **Create module loader** → LegozoLoader
- [ ] **Convert plugins to modules** → Module classes
- [ ] **Implement asset system** → AssetLoader + manifests
- [ ] **Create WordPress template** → index.php
- [ ] **Implement lazy loading** → Progressive enhancement
- [ ] **Write tests** → Unit + integration tests
- [ ] **Document API** → Module documentation

---

## 14. Implementation Roadmap

### Week 1: Foundation Refactoring
**Days 1-2: UI Extraction**
- Extract CSS to modules
- Extract HTML templates
- Create UI component system
- Test UI independently

**Days 3-4: Configuration**
- Create config schema
- Extract all settings to JSON
- Implement ConfigLoader
- Test config merging

**Day 5: Module System Design**
- Design module API
- Create module base class
- Design dependency system
- Document module lifecycle

### Week 2: Module Implementation
**Days 1-2: Core Modules**
- Convert GroundPlugin → GroundModule
- Convert LightingPlugin → LightingModule
- Convert CameraPlugin → CameraModule
- Test module loading

**Days 3-4: Asset System**
- Create AssetLoader
- Generate asset manifests
- Migrate texture loading
- Test dynamic asset discovery

**Day 5: Module Loader**
- Implement LegozoLoader
- Implement dependency resolution
- Implement lazy loading
- Test module lifecycle

### Week 3: Integration & Polish
**Days 1-2: WordPress Template**
- Create index.php template
- Create admin meta boxes
- Test WordPress integration
- Document WP setup

**Days 3-4: Optimization**
- Implement code splitting
- Add lazy loading
- Optimize asset loading
- Performance testing

**Day 5: Documentation & Testing**
- Write module documentation
- Create migration guide
- End-to-end testing
- Release v1.0

---

## 15. Success Criteria

### Technical Metrics
- ✅ Main HTML < 100 lines
- ✅ Module files < 300 lines each
- ✅ Initial load < 500ms
- ✅ Full scene load < 2s
- ✅ WordPress integration working
- ✅ Asset discovery automatic
- ✅ Config externalized
- ✅ 80%+ test coverage

### User Experience
- ✅ Fast page load
- ✅ Smooth interactions
- ✅ Easy to customize
- ✅ Works in WordPress
- ✅ Mobile-friendly

### Developer Experience
- ✅ Easy to add modules
- ✅ Clear documentation
- ✅ Good error messages
- ✅ Debuggable code
- ✅ Testable components

---

## 16. Conclusion

This architecture transforms Legozo from a **monolithic prototype** into a **production-ready, modular 3D CMS platform**.

### Key Benefits

1. **Lightweight** - Main page < 100 lines, loads fast
2. **Modular** - Each feature is independent LEGO piece
3. **Scalable** - Easy to add new features without breaking existing ones
4. **WordPress-Ready** - Simple PHP template integration
5. **Maintainable** - Small, focused files, easy to understand
6. **Performant** - Lazy loading, code splitting, optimized assets
7. **Extensible** - Plugin system for custom features
8. **Testable** - Unit tests for every module

### Next Steps

1. Review and approve this architecture document
2. Begin Phase 1 migration (UI extraction)
3. Iteratively implement remaining phases
4. Test and refine as we go

**This is the foundation for a professional, scalable 3D web platform. Let's build it right from the ground up.**

---

**Document Status:** ✅ APPROVED - Ready for implementation
**Approval Date:** 2025-11-25
**Next Review:** After Phase 1 completion
