# 3D Engine with Plugin Architecture

A modular, extensible 3D engine built on Babylon.js with an intelligent plugin system and code tagging for maximum maintainability.

## 🎯 Project Status

**Current Phase:** Phase 0 - Core Architecture ✅ COMPLETE

## 🏗️ Architecture

### Core Components

- **BabylonEngine** `[ENG.*]` - Core orchestrator, manages plugins and render loop
- **Plugin** `[PLG.*]` - Base class for all plugins (template method pattern)
- **EventEmitter** `[EVT.*]` - Pub/sub system for inter-plugin communication
- **ConfigLoader** `[CFG.*]` - Configuration loading and validation

### Design Philosophy

1. **Modular Plugin System** - Every feature is a plugin
2. **Event-Driven Communication** - Plugins communicate via events, not direct calls
3. **Configuration-Driven** - All settings in JSON, no hardcoding
4. **Intelligent Code Tags** - Every piece of code tagged for easy navigation and impact analysis

## 📁 Project Structure

```
3d-cms/
├── src/
│   ├── core/               # Core engine files
│   │   ├── BabylonEngine.js   [ENG.*]
│   │   ├── Plugin.js          [PLG.*]
│   │   └── EventEmitter.js    [EVT.*]
│   ├── config/             # Configuration system
│   │   └── ConfigLoader.js    [CFG.*]
│   ├── plugins/            # Plugin implementations (Phase 1+)
│   ├── movement/           # Movement modes (Phase 1+)
│   └── utils/              # Utility functions (Phase 1+)
├── config/
│   └── engine-config.json  # Default configuration
├── examples/
│   └── phase0-core-test.html  # Core architecture test
├── workshop/               # Development documentation
│   ├── readme.md              # Workshop overview
│   ├── analysis.md            # Code analysis
│   ├── foundation-plan.md     # 3D foundation plan
│   ├── code-tags.md          # Tag reference
│   ├── directory-tree.md      # File structure
│   └── coding-standards.md    # How to use tags
└── README.md              # This file
```

## 🚀 Quick Start

### Phase 0 Test (Core Architecture)

Open `examples/phase0-core-test.html` in a browser to see the core system in action:

- ✅ Engine initialization
- ✅ Plugin registration and lifecycle
- ✅ Event-based communication
- ✅ Configuration loading
- ✅ Render loop

### Using the Engine

```javascript
import BabylonEngine from './src/core/BabylonEngine.js';
import Plugin from './src/core/Plugin.js';

// Create custom plugin
class MyPlugin extends Plugin {
    start() {
        super.start();
        // Your plugin logic here
        console.log('My plugin started!');

        // Access scene
        const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {}, this.scene);

        // Emit events
        this.events.emit('myplugin:ready', { message: 'Hello!' });
    }
}

// Initialize engine
const config = { /* your config */ };
const canvas = document.getElementById('renderCanvas');
const engine = new BabylonEngine(canvas, config);

// Register plugins
engine.registerPlugin('myPlugin', new MyPlugin());

// Start engine
engine.start();
```

## 🏷️ Code Tag System

Every piece of code is tagged for easy navigation and maintainability:

### Tag Types

| Type | Format | Example | Purpose |
|------|--------|---------|---------|
| Primary | `[SYSTEM.N]` | `[CAM.1]` | Main feature identifier |
| Sub-tag | `[SYSTEM.N.N]` | `[CAM.1.1]` | Specific implementation |
| Cross-ref | `[A -> B]` | `[CAM.1 -> COL.2]` | Dependency |
| Shared | `[A \| B]` | `[CAM.2 \| MOV.3]` | Used by multiple |
| Critical | `[!SYSTEM]` | `[!ENG.1.3]` | Warning - affects many |

### Finding Code

```bash
# Find all camera code
grep -r "\[CAM\." src/

# Find what depends on camera
grep -r "-> CAM\." src/

# Find critical code
grep -r "\[!" src/
```

### Tag Categories

- **ENG** - Engine core
- **PLG** - Plugin system
- **EVT** - Event system
- **CFG** - Configuration
- **CAM** - Camera (Phase 1)
- **COL** - Collision (Phase 1)
- **MOV** - Movement (Phase 1)
- **GRV** - Gravity (Phase 1)
- **LGT** - Lighting (Phase 2)
- **SHD** - Shadows (Phase 2)
- **GRD** - Ground/Terrain (Phase 2)
- **MAT** - Materials (Phase 2)

See `workshop/code-tags.md` for complete tag reference.

## 📖 Documentation

### For Developers

- **workshop/code-tags.md** - Complete tag reference (200+ tags)
- **workshop/directory-tree.md** - File structure with tags
- **workshop/coding-standards.md** - How to write code with tags

### For Planning

- **workshop/analysis.md** - Deep code analysis of original prototype
- **workshop/foundation-plan.md** - 8-phase development roadmap
- **workshop/future_tasks.md** - 65+ prioritized tasks

## 🎯 Development Roadmap

### ✅ Phase 0: Core Architecture (Week 1) - COMPLETE

- [x] BabylonEngine core orchestrator
- [x] Plugin base class with lifecycle hooks
- [x] EventEmitter for plugin communication
- [x] ConfigLoader for configuration management
- [x] Basic example demonstrating system

### 🔄 Phase 1: Foundation Systems (Weeks 2-3) - NEXT

- [ ] CameraPlugin (Universal, ArcRotate, Free, Follow cameras)
- [ ] CollisionPlugin (Babylon + Havok hybrid)
- [ ] GravityPlugin (Earth/Moon/Mars/ZeroG presets)
- [ ] MovementPlugin (Keyboard, Click-to-move modes)

### 🔮 Phase 2: Visual Enhancement (Weeks 4-5)

- [ ] LightingPlugin (All light types + presets)
- [ ] ShadowPlugin (Quality levels, soft shadows)
- [ ] GroundPlugin (Plane, heightmap, procedural)
- [ ] MaterialPlugin (Standard + PBR materials)

### 🔮 Phase 3-4: Advanced Features (Weeks 6-8)

- [ ] AssetPlugin (Model/texture loading)
- [ ] InteractionPlugin (Click, hover, drag)
- [ ] UIPlugin (Babylon.GUI integration)
- [ ] PerformancePlugin (Optimizer, LOD, culling)

## 🔧 Configuration

Default configuration in `config/engine-config.json`:

```json
{
  "camera": {
    "defaultType": "universal",
    "position": { "x": 0, "y": 2, "z": -10 },
    "speed": 0.5
  },
  "gravity": {
    "preset": "earth"
  },
  "lighting": {
    "preset": "day"
  },
  "shadows": {
    "enabled": true,
    "quality": "medium"
  }
}
```

## 🧪 Testing Phase 0

1. Open `examples/phase0-core-test.html` in browser
2. Check console for:
   - ✅ Engine initialization
   - ✅ Plugin registration
   - ✅ Event emissions
   - ✅ Render loop start
3. Check status panel shows:
   - ✅ Engine Status: Running
   - ✅ Plugins Registered: 1
   - ✅ Events Emitted: 5+
   - ✅ FPS: ~60
   - ✅ Render Loop: Active
4. Should see:
   - Rotating sphere above ground plane
   - Hemispheric lighting
   - ArcRotate camera controls (click + drag)

## 📊 Project Statistics

**Phase 0 Complete:**
- **Core Files:** 4 (BabylonEngine, Plugin, EventEmitter, ConfigLoader)
- **Lines of Code:** ~500
- **Events:** 6 core events (engine:initialized, plugin:registered, etc.)
- **Configuration Options:** 50+
- **Documentation:** 200KB in workshop/

**Upcoming Phase 1:**
- **Plugins to Build:** 4 (Camera, Collision, Gravity, Movement)
- **Estimated Lines:** ~1,000
- **Time Estimate:** 2-3 weeks

## 🎓 Key Concepts

### Plugin Lifecycle

1. **Constructor** - Plugin created with options
2. **init(scene, events, config)** - Receives references from engine
3. **start()** - Plugin initialization logic runs
4. **Runtime** - Plugin responds to events
5. **dispose()** - Cleanup when removed

### Event-Driven Architecture

Plugins don't call each other directly. They emit events:

```javascript
// CameraPlugin emits
this.events.emit('camera:created', { camera });

// MovementPlugin listens
this.events.on('camera:created', ({ camera }) => {
    this.camera = camera;
});
```

### Configuration-Driven

All behavior controlled via config:

```javascript
const config = {
    camera: { defaultType: 'arcRotate' },
    gravity: { preset: 'moon' },
    lighting: { preset: 'night' }
};
```

## 🤝 Contributing

### Before Coding

1. Read `workshop/coding-standards.md`
2. Review tag system in `workshop/code-tags.md`
3. Check `workshop/directory-tree.md` for where code goes

### Code Review Checklist

- [ ] All functions have primary tags
- [ ] Cross-system calls have `->` references
- [ ] Critical code has `!` warnings
- [ ] Events follow `system:action:detail` naming
- [ ] Config values not hardcoded
- [ ] One feature = one place (not scattered)

## 📝 License

TBD

## 👥 Team

Development Team

---

**Status:** Phase 0 Complete ✅ | Next: Phase 1 Foundation Systems 🚀

**Last Updated:** 2025-10-31
