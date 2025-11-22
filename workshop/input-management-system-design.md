# Input Management System - Comprehensive Architecture Design
## Revolutionary User Interaction Framework for 3D CMS

**Status:** 🎯 CRITICAL FOUNDATION
**Priority:** 🔴 HIGHEST - This solves recurring interaction bugs
**Philosophy:** "One System to Rule All Input"

---

## Executive Summary

### The Problem

**Current State - Broken Architecture:**
```javascript
// Three conflicting input systems fighting for control:
camera.attachControl(canvas);              // Babylon's keyboard + mouse
clickToMove.activate(camera, scene);       // Manual click-to-move
interactionPlugin.registerObservers();     // Object interaction

// Result: They step on each other
// - Keyboard stops working
// - Mouse clicks work once then stop
// - No coordination, no priorities
// - Cannot switch between modes (View/Edit/VR/AR)
```

**Root Cause:**
- **No central coordinator** - Each system adds its own event listeners
- **No priority system** - First-come-first-served, causes conflicts
- **No state machine** - Cannot switch modes cleanly
- **Hard to extend** - Adding VR/AR/gestures would multiply conflicts
- **No abstraction** - Tied to specific keys/buttons, not rebindable

**Impact:**
- ❌ Recurring bugs (keyboard breaks, mouse breaks)
- ❌ Cannot add new input modes without breaking existing
- ❌ Poor user experience (inconsistent controls)
- ❌ Impossible to support VR/AR/Touch with current architecture

### The Solution

**Unified Input Management System** inspired by:
- ✅ **Game Engines:** Unity Input System, Unreal Enhanced Input
- ✅ **Modern Web:** Pointer Events API, Intersection Observer
- ✅ **Mobile UX:** iOS/Android gesture recognizers
- ✅ **Accessibility:** WCAG keyboard navigation, screen readers
- ✅ **VR/XR:** WebXR input profiles, natural mapping
- ✅ **Best Practices:** Google Maps, Figma, Miro, Blender web demos

**Core Principles:**

1. **Single Source of Truth** - One InputManager coordinates everything
2. **Context-Aware** - Different modes (View/Edit/VR) have different inputs
3. **Priority-Based** - UI blocks 3D, modals block everything
4. **Abstract Actions** - "Move Forward" not "W key" (rebindable)
5. **Multi-Device Native** - Desktop/Mobile/VR/AR all first-class
6. **Gesture-Rich** - Swipe, pinch, long-press, double-tap
7. **Accessibility First** - Keyboard-only, screen reader, alternatives
8. **Conflict-Free** - System prevents input conflicts automatically

---

## Part 1: Architecture Overview

### 1.1 System Layers

```
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│  (Plugins request actions: "moveForward", "selectObject")│
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│                   InputManager                           │
│  • Routes input to active context                        │
│  • Handles priorities and conflicts                      │
│  • Manages context switching                             │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│                 Input Contexts                           │
│  ViewMode │ EditMode │ VRMode │ ARMode │ BrowseMode │...│
│  (Each context defines what inputs mean in that mode)    │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│                 Input Actions                            │
│  Abstract actions: moveForward, select, grab, zoom,...   │
│  (Not tied to hardware - platform independent)           │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│                Input Bindings                            │
│  Maps hardware input to actions:                         │
│  • moveForward = W key │ Left stick up │ VR joystick │...│
│  • select = Click │ Tap │ VR trigger │ Voice "select"│...│
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│               Input Sources                              │
│  Keyboard │ Mouse │ Touch │ Gamepad │ VR │ AR │ Voice   │
│  (Hardware-specific listeners)                           │
└──────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

**Input Event Flow:**
```
1. User presses W key
   ↓
2. KeyboardSource detects "KeyW" down
   ↓
3. InputManager checks current context (ViewMode)
   ↓
4. ViewMode has binding: "KeyW" → "moveForward" action
   ↓
5. InputManager emits "moveForward" action
   ↓
6. Camera controller listening for "moveForward"
   ↓
7. Camera moves forward

// If UI is focused:
1. User presses W key
   ↓
2. KeyboardSource detects "KeyW"
   ↓
3. InputManager sees UI has priority
   ↓
4. Types "w" in text field (3D actions blocked)
```

**Context Switching:**
```
1. User presses E key (toggle edit mode)
   ↓
2. InputManager.setContext('edit')
   ↓
3. Deactivates ViewMode bindings
   ↓
4. Activates EditMode bindings
   ↓
5. Same hardware inputs now mean different things:
   - Click = Select object (was: click-to-move)
   - W = Move camera (same)
   - G = Grab object (was: nothing)
```

---

## Part 2: Core Components

### 2.1 InputManager (Central Coordinator)

**Responsibilities:**
- Single global instance (singleton)
- Manages all input sources
- Routes input to active context
- Handles priority and blocking
- Emits abstract actions
- Provides query API (isActionPressed, getActionValue)

**API:**

```javascript
class InputManager extends EventEmitter {
    /**
     * Initialize input system
     * @param {Scene} scene - Babylon.js scene
     * @param {HTMLCanvasElement} canvas - Render canvas
     */
    constructor(scene, canvas) {
        super();

        this.scene = scene;
        this.canvas = canvas;

        // Input sources (hardware)
        this.sources = new Map();
        this.sources.set('keyboard', new KeyboardSource(this));
        this.sources.set('mouse', new MouseSource(this));
        this.sources.set('touch', new TouchSource(this));
        this.sources.set('gamepad', new GamepadSource(this));
        this.sources.set('vr', new VRSource(this));

        // Contexts (modes)
        this.contexts = new Map();
        this.activeContext = null;

        // Priority layers
        this.layers = [
            { name: 'modal', active: false, blocking: true },
            { name: 'ui', active: false, blocking: true },
            { name: '3d', active: true, blocking: false }
        ];

        // Actions state (for querying)
        this.actionStates = new Map();

        // Gesture recognizers
        this.gestures = new GestureManager(this);

        console.log('[INPUT] InputManager initialized');
    }

    /**
     * Register a context (mode)
     * @param {string} name - Context name (e.g., 'view', 'edit', 'vr')
     * @param {InputContext} context - Context configuration
     */
    registerContext(name, context) {
        this.contexts.set(name, context);
        console.log(`[INPUT] Context registered: ${name}`);
    }

    /**
     * Switch to a different context
     * @param {string} contextName - Name of context to activate
     */
    setContext(contextName) {
        const newContext = this.contexts.get(contextName);
        if (!newContext) {
            console.error(`[INPUT] Context not found: ${contextName}`);
            return;
        }

        // Deactivate old context
        if (this.activeContext) {
            this.activeContext.deactivate();
        }

        // Activate new context
        this.activeContext = newContext;
        this.activeContext.activate();

        this.emit('context:changed', {
            from: this.activeContext?.name,
            to: contextName
        });

        console.log(`[INPUT] Context switched to: ${contextName}`);
    }

    /**
     * Handle raw input from source
     * @param {string} sourceName - Source that generated input
     * @param {InputEvent} event - Raw input event
     */
    handleInput(sourceName, event) {
        // Check if input is blocked by higher priority layer
        if (this.isBlocked(event)) {
            return;
        }

        // Route to active context
        if (this.activeContext) {
            const action = this.activeContext.mapInputToAction(event);
            if (action) {
                this.triggerAction(action);
            }
        }
    }

    /**
     * Check if input is blocked by a higher priority layer
     */
    isBlocked(event) {
        // UI elements like textfields should block 3D input
        if (document.activeElement.tagName === 'INPUT' ||
            document.activeElement.tagName === 'TEXTAREA') {
            return true;
        }

        // Modal dialogs block everything
        for (const layer of this.layers) {
            if (layer.active && layer.blocking) {
                return true;
            }
        }

        return false;
    }

    /**
     * Trigger an abstract action
     * @param {InputAction} action - Action to trigger
     */
    triggerAction(action) {
        // Update action state
        this.actionStates.set(action.name, action);

        // Emit event for listeners
        this.emit(`action:${action.name}`, action);
        this.emit('action', action);

        // Process through filters (dead zone, smoothing, etc.)
        if (action.value !== undefined) {
            action.value = this.applyFilters(action);
        }

        console.log(`[INPUT] Action triggered: ${action.name}`, action);
    }

    /**
     * Query if an action is currently pressed/active
     * @param {string} actionName - Name of action
     * @returns {boolean}
     */
    isActionPressed(actionName) {
        const action = this.actionStates.get(actionName);
        return action?.state === 'pressed' || action?.state === 'held';
    }

    /**
     * Get current value of an action (for analog inputs)
     * @param {string} actionName - Name of action
     * @returns {number|Vector2|null}
     */
    getActionValue(actionName) {
        const action = this.actionStates.get(actionName);
        return action?.value ?? null;
    }

    /**
     * Enable pointer lock (for FPS-style camera control)
     */
    enablePointerLock() {
        this.canvas.requestPointerLock();
    }

    /**
     * Disable pointer lock
     */
    disablePointerLock() {
        document.exitPointerLock();
    }

    /**
     * Set priority layer active/inactive
     * @param {string} layerName - Layer name ('modal', 'ui', '3d')
     * @param {boolean} active - Active state
     */
    setLayerActive(layerName, active) {
        const layer = this.layers.find(l => l.name === layerName);
        if (layer) {
            layer.active = active;
        }
    }

    /**
     * Apply processing filters to action value
     */
    applyFilters(action) {
        let value = action.value;

        // Dead zone (ignore small inputs)
        if (action.filters?.deadZone) {
            if (Math.abs(value) < action.filters.deadZone) {
                value = 0;
            }
        }

        // Smoothing (lerp towards target)
        if (action.filters?.smoothing) {
            const prev = this.actionStates.get(action.name)?.value ?? 0;
            value = prev + (value - prev) * action.filters.smoothing;
        }

        // Acceleration curve
        if (action.filters?.curve) {
            value = action.filters.curve(value);
        }

        return value;
    }

    /**
     * Cleanup and dispose
     */
    dispose() {
        // Dispose all sources
        for (const source of this.sources.values()) {
            source.dispose();
        }

        // Deactivate context
        if (this.activeContext) {
            this.activeContext.deactivate();
        }

        console.log('[INPUT] InputManager disposed');
    }
}
```

### 2.2 InputContext (Modes)

**Purpose:** Define what inputs mean in different scenarios

**Examples:**

```javascript
/**
 * ViewMode - Just looking around, minimal interaction
 */
class ViewModeContext extends InputContext {
    constructor() {
        super('view');

        this.bindings = [
            // Camera movement
            { input: 'KeyW', action: 'moveForward' },
            { input: 'KeyS', action: 'moveBackward' },
            { input: 'KeyA', action: 'moveLeft' },
            { input: 'KeyD', action: 'moveRight' },
            { input: 'Space', action: 'moveUp' },
            { input: 'ShiftLeft', action: 'moveDown' },

            // Camera rotation
            { input: 'MouseMove', action: 'lookAround' },
            { input: 'TouchPan', action: 'lookAround' },

            // Click to move
            { input: 'LeftClick', action: 'walkTo', condition: 'clickGround' },

            // Zoom
            { input: 'MouseWheel', action: 'zoom' },
            { input: 'TouchPinch', action: 'zoom' },

            // Mode switching
            { input: 'KeyE', action: 'toggleEditMode' }
        ];
    }
}

/**
 * EditMode - Full editing controls
 */
class EditModeContext extends InputContext {
    constructor() {
        super('edit');

        this.bindings = [
            // Camera (same as View)
            { input: 'KeyW', action: 'moveForward' },
            { input: 'KeyS', action: 'moveBackward' },
            { input: 'KeyA', action: 'moveLeft' },
            { input: 'KeyD', action: 'moveRight' },

            // Object interaction
            { input: 'LeftClick', action: 'selectObject', condition: 'clickMesh' },
            { input: 'LeftClick', action: 'deselectAll', condition: 'clickGround' },
            { input: 'KeyG', action: 'grabObject', condition: 'hasSelection' },
            { input: 'KeyR', action: 'rotateObject', condition: 'hasSelection' },
            { input: 'KeyS', action: 'scaleObject', condition: 'hasSelection' },
            { input: 'Delete', action: 'deleteObject', condition: 'hasSelection' },
            { input: 'KeyD', action: 'duplicateObject', condition: 'hasSelection', modifier: 'Ctrl' },

            // Undo/Redo
            { input: 'KeyZ', action: 'undo', modifier: 'Ctrl' },
            { input: 'KeyY', action: 'redo', modifier: 'Ctrl' },

            // Mode switching
            { input: 'KeyE', action: 'toggleEditMode' }
        ];
    }
}

/**
 * VRMode - VR controller inputs
 */
class VRModeContext extends InputContext {
    constructor() {
        super('vr');

        this.bindings = [
            // Movement (thumbstick)
            { input: 'VR_LeftThumbstick', action: 'move' },
            { input: 'VR_RightThumbstick', action: 'turn' },

            // Interaction
            { input: 'VR_RightTrigger', action: 'selectObject' },
            { input: 'VR_RightGrip', action: 'grabObject' },

            // Teleportation
            { input: 'VR_LeftTrigger', action: 'teleportAim' },
            { input: 'VR_LeftTrigger_Released', action: 'teleportConfirm' },

            // UI
            { input: 'VR_LeftMenu', action: 'openMenu' },
            { input: 'VR_RightMenu', action: 'openInspector' }
        ];
    }
}

/**
 * BrowseMode - Scroll-based navigation like a webpage
 */
class BrowseModeContext extends InputContext {
    constructor() {
        super('browse');

        this.bindings = [
            // Scroll to move
            { input: 'MouseWheel', action: 'scroll' },
            { input: 'TouchSwipe', action: 'scroll' },

            // Click to focus
            { input: 'LeftClick', action: 'focusObject' },

            // Keyboard navigation
            { input: 'ArrowDown', action: 'scrollDown' },
            { input: 'ArrowUp', action: 'scrollUp' },
            { input: 'Space', action: 'pageDown' },
            { input: 'ShiftLeft+Space', action: 'pageUp' }
        ];
    }
}

/**
 * TouchMode - Mobile-optimized gestures
 */
class TouchModeContext extends InputContext {
    constructor() {
        super('touch');

        this.bindings = [
            // Single touch - look around
            { input: 'TouchPan', action: 'lookAround' },

            // Tap to walk
            { input: 'Tap', action: 'walkTo', condition: 'tapGround' },

            // Tap object to select
            { input: 'Tap', action: 'selectObject', condition: 'tapMesh' },

            // Two-finger gestures
            { input: 'TouchPinch', action: 'zoom' },
            { input: 'TouchRotate', action: 'rotateCamera' },
            { input: 'TwoFingerSwipe', action: 'pan' },

            // Long press for context menu
            { input: 'LongPress', action: 'showContextMenu' },

            // Double tap for quick action
            { input: 'DoubleTap', action: 'focusObject', condition: 'tapMesh' },
            { input: 'DoubleTap', action: 'resetCamera', condition: 'tapGround' }
        ];
    }
}
```

**Base Class:**

```javascript
class InputContext {
    constructor(name) {
        this.name = name;
        this.bindings = [];
        this.active = false;
        this.observers = [];
    }

    /**
     * Activate this context
     */
    activate() {
        this.active = true;
        // Register all bindings with InputManager
        console.log(`[INPUT] Context activated: ${this.name}`);
    }

    /**
     * Deactivate this context
     */
    deactivate() {
        this.active = false;
        // Unregister bindings
        console.log(`[INPUT] Context deactivated: ${this.name}`);
    }

    /**
     * Map hardware input to action
     * @param {InputEvent} event - Raw input event
     * @returns {InputAction|null}
     */
    mapInputToAction(event) {
        // Find matching binding
        for (const binding of this.bindings) {
            if (this.matchesBinding(event, binding)) {
                return {
                    name: binding.action,
                    value: event.value,
                    state: event.state,
                    source: event.source
                };
            }
        }
        return null;
    }

    /**
     * Check if event matches binding
     */
    matchesBinding(event, binding) {
        // Check input matches
        if (event.input !== binding.input) {
            return false;
        }

        // Check modifiers (Ctrl, Shift, Alt)
        if (binding.modifier && !event.modifiers[binding.modifier]) {
            return false;
        }

        // Check conditions (e.g., 'hasSelection', 'clickGround')
        if (binding.condition && !this.checkCondition(binding.condition, event)) {
            return false;
        }

        return true;
    }

    /**
     * Check if condition is met
     */
    checkCondition(condition, event) {
        switch (condition) {
            case 'clickGround':
                return event.hitInfo?.pickedMesh?.name === 'ground';
            case 'clickMesh':
                return event.hitInfo?.pickedMesh &&
                       event.hitInfo.pickedMesh.name !== 'ground';
            case 'hasSelection':
                return window.selectedObjects?.length > 0;
            default:
                return true;
        }
    }
}
```

### 2.3 Input Sources (Hardware)

**Purpose:** Listen to hardware events and convert to standard format

```javascript
/**
 * KeyboardSource - Handle keyboard input
 */
class KeyboardSource {
    constructor(inputManager) {
        this.inputManager = inputManager;
        this.pressedKeys = new Set();

        // Register event listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));

        console.log('[INPUT] KeyboardSource initialized');
    }

    handleKeyDown(e) {
        // Prevent default for game controls, allow for UI
        if (!this.isUIElement(e.target)) {
            e.preventDefault();
        }

        // Track pressed state
        this.pressedKeys.add(e.code);

        // Send to InputManager
        this.inputManager.handleInput('keyboard', {
            source: 'keyboard',
            input: e.code,  // 'KeyW', 'KeyA', etc.
            state: 'pressed',
            modifiers: {
                Ctrl: e.ctrlKey,
                Shift: e.shiftKey,
                Alt: e.altKey
            },
            originalEvent: e
        });
    }

    handleKeyUp(e) {
        this.pressedKeys.delete(e.code);

        this.inputManager.handleInput('keyboard', {
            source: 'keyboard',
            input: e.code,
            state: 'released',
            modifiers: {
                Ctrl: e.ctrlKey,
                Shift: e.shiftKey,
                Alt: e.altKey
            },
            originalEvent: e
        });
    }

    isUIElement(element) {
        const uiTags = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'];
        return uiTags.includes(element.tagName);
    }

    dispose() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }
}

/**
 * MouseSource - Handle mouse input
 */
class MouseSource {
    constructor(inputManager) {
        this.inputManager = inputManager;
        this.scene = inputManager.scene;
        this.canvas = inputManager.canvas;

        // State
        this.position = { x: 0, y: 0 };
        this.deltaPosition = { x: 0, y: 0 };
        this.buttons = new Set();

        // Register Babylon.js observer
        this.observer = this.scene.onPointerObservable.add(
            this.handlePointer.bind(this)
        );

        // Mouse move
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));

        // Mouse wheel
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));

        console.log('[INPUT] MouseSource initialized');
    }

    handlePointer(pointerInfo) {
        const type = pointerInfo.type;
        const event = pointerInfo.event;

        switch (type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                this.handlePointerDown(pointerInfo);
                break;
            case BABYLON.PointerEventTypes.POINTERUP:
                this.handlePointerUp(pointerInfo);
                break;
            case BABYLON.PointerEventTypes.POINTERMOVE:
                this.handlePointerMove(pointerInfo);
                break;
        }
    }

    handlePointerDown(pointerInfo) {
        const button = pointerInfo.event.button;
        const buttonName = this.getButtonName(button);

        this.buttons.add(buttonName);

        // Perform raycast to get 3D hit info
        const pickInfo = this.scene.pick(
            this.scene.pointerX,
            this.scene.pointerY
        );

        this.inputManager.handleInput('mouse', {
            source: 'mouse',
            input: buttonName,  // 'LeftClick', 'RightClick', 'MiddleClick'
            state: 'pressed',
            position: {
                x: this.scene.pointerX,
                y: this.scene.pointerY
            },
            hitInfo: {
                hit: pickInfo.hit,
                pickedMesh: pickInfo.pickedMesh,
                pickedPoint: pickInfo.pickedPoint,
                distance: pickInfo.distance
            },
            originalEvent: pointerInfo.event
        });
    }

    handlePointerUp(pointerInfo) {
        const button = pointerInfo.event.button;
        const buttonName = this.getButtonName(button);

        this.buttons.delete(buttonName);

        this.inputManager.handleInput('mouse', {
            source: 'mouse',
            input: buttonName,
            state: 'released',
            position: {
                x: this.scene.pointerX,
                y: this.scene.pointerY
            },
            originalEvent: pointerInfo.event
        });
    }

    handleMouseMove(event) {
        // Calculate delta
        this.deltaPosition.x = event.movementX;
        this.deltaPosition.y = event.movementY;

        this.inputManager.handleInput('mouse', {
            source: 'mouse',
            input: 'MouseMove',
            state: 'moved',
            position: { x: event.clientX, y: event.clientY },
            delta: { ...this.deltaPosition },
            originalEvent: event
        });
    }

    handleWheel(event) {
        event.preventDefault();

        this.inputManager.handleInput('mouse', {
            source: 'mouse',
            input: 'MouseWheel',
            state: 'scrolled',
            value: event.deltaY,
            originalEvent: event
        });
    }

    getButtonName(button) {
        switch (button) {
            case 0: return 'LeftClick';
            case 1: return 'MiddleClick';
            case 2: return 'RightClick';
            default: return `Button${button}`;
        }
    }

    dispose() {
        this.scene.onPointerObservable.remove(this.observer);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('wheel', this.handleWheel);
    }
}

/**
 * TouchSource - Handle touch/gesture input
 */
class TouchSource {
    constructor(inputManager) {
        this.inputManager = inputManager;
        this.canvas = inputManager.canvas;

        // Touch state
        this.touches = new Map();

        // Register listeners
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        this.canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this));

        console.log('[INPUT] TouchSource initialized');
    }

    handleTouchStart(event) {
        event.preventDefault();

        for (const touch of event.changedTouches) {
            this.touches.set(touch.identifier, {
                id: touch.identifier,
                startX: touch.clientX,
                startY: touch.clientY,
                currentX: touch.clientX,
                currentY: touch.clientY,
                startTime: Date.now()
            });
        }

        // Single tap
        if (event.touches.length === 1) {
            this.inputManager.handleInput('touch', {
                source: 'touch',
                input: 'TouchStart',
                state: 'started',
                position: {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                },
                touchCount: 1,
                originalEvent: event
            });
        }

        // Multi-touch
        if (event.touches.length === 2) {
            this.startPinch(event.touches);
        }
    }

    handleTouchMove(event) {
        event.preventDefault();

        // Update touch positions
        for (const touch of event.changedTouches) {
            const tracked = this.touches.get(touch.identifier);
            if (tracked) {
                tracked.currentX = touch.clientX;
                tracked.currentY = touch.clientY;
            }
        }

        // Single finger - pan
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const tracked = this.touches.get(touch.identifier);

            this.inputManager.handleInput('touch', {
                source: 'touch',
                input: 'TouchPan',
                state: 'moved',
                position: { x: touch.clientX, y: touch.clientY },
                delta: {
                    x: touch.clientX - tracked.startX,
                    y: touch.clientY - tracked.startY
                },
                originalEvent: event
            });
        }

        // Two fingers - pinch/rotate
        if (event.touches.length === 2) {
            this.handlePinch(event.touches);
        }
    }

    handleTouchEnd(event) {
        for (const touch of event.changedTouches) {
            const tracked = this.touches.get(touch.identifier);
            if (!tracked) continue;

            const duration = Date.now() - tracked.startTime;
            const distance = Math.hypot(
                touch.clientX - tracked.startX,
                touch.clientY - tracked.startY
            );

            // Tap (short touch, minimal movement)
            if (duration < 200 && distance < 10) {
                this.inputManager.handleInput('touch', {
                    source: 'touch',
                    input: 'Tap',
                    state: 'completed',
                    position: { x: touch.clientX, y: touch.clientY },
                    originalEvent: event
                });
            }

            // Long press
            if (duration > 500 && distance < 10) {
                this.inputManager.handleInput('touch', {
                    source: 'touch',
                    input: 'LongPress',
                    state: 'completed',
                    position: { x: touch.clientX, y: touch.clientY },
                    originalEvent: event
                });
            }

            // Swipe (fast movement)
            if (duration < 300 && distance > 50) {
                const angle = Math.atan2(
                    touch.clientY - tracked.startY,
                    touch.clientX - tracked.startX
                );

                this.inputManager.handleInput('touch', {
                    source: 'touch',
                    input: 'TouchSwipe',
                    state: 'completed',
                    direction: this.getSwipeDirection(angle),
                    distance: distance,
                    originalEvent: event
                });
            }

            this.touches.delete(touch.identifier);
        }
    }

    startPinch(touches) {
        const distance = Math.hypot(
            touches[1].clientX - touches[0].clientX,
            touches[1].clientY - touches[0].clientY
        );

        this.pinchStart = distance;
    }

    handlePinch(touches) {
        const distance = Math.hypot(
            touches[1].clientX - touches[0].clientX,
            touches[1].clientY - touches[0].clientY
        );

        const scale = distance / this.pinchStart;

        this.inputManager.handleInput('touch', {
            source: 'touch',
            input: 'TouchPinch',
            state: 'changed',
            value: scale,
            originalEvent: event
        });
    }

    getSwipeDirection(angle) {
        const degrees = angle * 180 / Math.PI;
        if (degrees > -45 && degrees <= 45) return 'right';
        if (degrees > 45 && degrees <= 135) return 'down';
        if (degrees > 135 || degrees <= -135) return 'left';
        return 'up';
    }

    dispose() {
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        this.canvas.removeEventListener('touchcancel', this.handleTouchEnd);
    }
}

/**
 * GamepadSource - Handle gamepad input
 */
class GamepadSource {
    constructor(inputManager) {
        this.inputManager = inputManager;
        this.gamepads = new Map();
        this.pollInterval = null;

        window.addEventListener('gamepadconnected', this.handleConnect.bind(this));
        window.addEventListener('gamepaddisconnected', this.handleDisconnect.bind(this));

        // Start polling
        this.startPolling();

        console.log('[INPUT] GamepadSource initialized');
    }

    handleConnect(event) {
        console.log(`[INPUT] Gamepad connected: ${event.gamepad.id}`);
        this.gamepads.set(event.gamepad.index, event.gamepad);
    }

    handleDisconnect(event) {
        console.log(`[INPUT] Gamepad disconnected: ${event.gamepad.id}`);
        this.gamepads.delete(event.gamepad.index);
    }

    startPolling() {
        this.pollInterval = setInterval(() => {
            const gamepads = navigator.getGamepads();

            for (const gamepad of gamepads) {
                if (!gamepad) continue;

                // Axes (thumbsticks)
                if (Math.abs(gamepad.axes[0]) > 0.1 || Math.abs(gamepad.axes[1]) > 0.1) {
                    this.inputManager.handleInput('gamepad', {
                        source: 'gamepad',
                        input: 'Gamepad_LeftStick',
                        state: 'moved',
                        value: {
                            x: gamepad.axes[0],
                            y: gamepad.axes[1]
                        }
                    });
                }

                if (Math.abs(gamepad.axes[2]) > 0.1 || Math.abs(gamepad.axes[3]) > 0.1) {
                    this.inputManager.handleInput('gamepad', {
                        source: 'gamepad',
                        input: 'Gamepad_RightStick',
                        state: 'moved',
                        value: {
                            x: gamepad.axes[2],
                            y: gamepad.axes[3]
                        }
                    });
                }

                // Buttons
                gamepad.buttons.forEach((button, index) => {
                    if (button.pressed) {
                        this.inputManager.handleInput('gamepad', {
                            source: 'gamepad',
                            input: `Gamepad_Button${index}`,
                            state: 'pressed',
                            value: button.value
                        });
                    }
                });
            }
        }, 16); // ~60 FPS polling
    }

    dispose() {
        clearInterval(this.pollInterval);
        window.removeEventListener('gamepadconnected', this.handleConnect);
        window.removeEventListener('gamepaddisconnected', this.handleDisconnect);
    }
}

/**
 * VRSource - Handle WebXR VR controller input
 */
class VRSource {
    constructor(inputManager) {
        this.inputManager = inputManager;
        this.scene = inputManager.scene;
        this.xr = null;

        console.log('[INPUT] VRSource initialized (waiting for VR session)');
    }

    async enableVR() {
        this.xr = await this.scene.createDefaultXRExperienceAsync();

        // Listen to controller events
        this.xr.input.onControllerAddedObservable.add((controller) => {
            console.log(`[INPUT] VR Controller added: ${controller.inputSource.handedness}`);

            // Trigger button
            controller.onMotionControllerInitObservable.add((motionController) => {
                const triggerComponent = motionController.getComponent('xr-standard-trigger');
                if (triggerComponent) {
                    triggerComponent.onButtonStateChangedObservable.add((component) => {
                        const hand = controller.inputSource.handedness;

                        this.inputManager.handleInput('vr', {
                            source: 'vr',
                            input: `VR_${hand}Trigger`,
                            state: component.pressed ? 'pressed' : 'released',
                            value: component.value
                        });
                    });
                }

                // Grip button
                const gripComponent = motionController.getComponent('xr-standard-squeeze');
                if (gripComponent) {
                    gripComponent.onButtonStateChangedObservable.add((component) => {
                        const hand = controller.inputSource.handedness;

                        this.inputManager.handleInput('vr', {
                            source: 'vr',
                            input: `VR_${hand}Grip`,
                            state: component.pressed ? 'pressed' : 'released',
                            value: component.value
                        });
                    });
                }

                // Thumbstick
                const thumbstickComponent = motionController.getComponent('xr-standard-thumbstick');
                if (thumbstickComponent) {
                    thumbstickComponent.onAxisValueChangedObservable.add((values) => {
                        const hand = controller.inputSource.handedness;

                        this.inputManager.handleInput('vr', {
                            source: 'vr',
                            input: `VR_${hand}Thumbstick`,
                            state: 'moved',
                            value: { x: values.x, y: values.y }
                        });
                    });
                }
            });
        });
    }

    dispose() {
        if (this.xr) {
            this.xr.dispose();
        }
    }
}
```

---

## Part 3: Advanced Features

### 3.1 Gesture Recognition

```javascript
class GestureManager {
    constructor(inputManager) {
        this.inputManager = inputManager;
        this.recognizers = [];

        // Register built-in recognizers
        this.registerRecognizer(new DoubleTapRecognizer());
        this.registerRecognizer(new LongPressRecognizer());
        this.registerRecognizer(new SwipeRecognizer());
        this.registerRecognizer(new PinchRecognizer());
        this.registerRecognizer(new RotateRecognizer());
    }

    registerRecognizer(recognizer) {
        this.recognizers.push(recognizer);
    }

    processInput(event) {
        for (const recognizer of this.recognizers) {
            const gesture = recognizer.recognize(event);
            if (gesture) {
                this.inputManager.triggerAction({
                    name: gesture.name,
                    value: gesture.value,
                    state: gesture.state
                });
            }
        }
    }
}

class DoubleTapRecognizer {
    constructor() {
        this.lastTapTime = 0;
        this.lastTapPosition = null;
        this.maxDelay = 300; // ms
        this.maxDistance = 20; // pixels
    }

    recognize(event) {
        if (event.input !== 'Tap') return null;

        const now = Date.now();
        const timeSinceLast = now - this.lastTapTime;

        if (timeSinceLast < this.maxDelay && this.lastTapPosition) {
            const distance = Math.hypot(
                event.position.x - this.lastTapPosition.x,
                event.position.y - this.lastTapPosition.y
            );

            if (distance < this.maxDistance) {
                this.lastTapTime = 0; // Reset
                return {
                    name: 'DoubleTap',
                    position: event.position,
                    state: 'completed'
                };
            }
        }

        this.lastTapTime = now;
        this.lastTapPosition = event.position;
        return null;
    }
}
```

### 3.2 Input Rebinding

```javascript
class InputBindingEditor {
    constructor(inputManager) {
        this.inputManager = inputManager;
        this.customBindings = new Map();
    }

    /**
     * Rebind an action to a different input
     * @param {string} contextName - Context to modify
     * @param {string} actionName - Action to rebind
     * @param {string} newInput - New input (e.g., 'KeyR' instead of 'KeyG')
     */
    rebindAction(contextName, actionName, newInput) {
        const context = this.inputManager.contexts.get(contextName);
        if (!context) {
            console.error(`Context not found: ${contextName}`);
            return;
        }

        // Find binding for this action
        const binding = context.bindings.find(b => b.action === actionName);
        if (!binding) {
            console.error(`Action not found: ${actionName}`);
            return;
        }

        // Update binding
        binding.input = newInput;

        // Save to localStorage
        this.saveCustomBindings();

        console.log(`[INPUT] Rebound ${actionName} to ${newInput} in ${contextName}`);
    }

    /**
     * Reset bindings to default
     */
    resetBindings(contextName) {
        const context = this.inputManager.contexts.get(contextName);
        if (context) {
            context.loadDefaultBindings();
        }

        this.customBindings.delete(contextName);
        this.saveCustomBindings();
    }

    saveCustomBindings() {
        localStorage.setItem('inputBindings', JSON.stringify(
            Array.from(this.customBindings.entries())
        ));
    }

    loadCustomBindings() {
        const saved = localStorage.getItem('inputBindings');
        if (saved) {
            this.customBindings = new Map(JSON.parse(saved));
            this.applyCustomBindings();
        }
    }
}
```

### 3.3 Accessibility Features

```javascript
class AccessibilityManager {
    constructor(inputManager) {
        this.inputManager = inputManager;

        // Keyboard-only navigation
        this.focusableObjects = [];
        this.currentFocusIndex = 0;

        // Screen reader announcements
        this.ariaLive = this.createAriaLiveRegion();

        // Alternative input methods
        this.voiceEnabled = false;
        this.eyeTrackingEnabled = false;
    }

    createAriaLiveRegion() {
        const div = document.createElement('div');
        div.setAttribute('aria-live', 'polite');
        div.setAttribute('aria-atomic', 'true');
        div.style.position = 'absolute';
        div.style.left = '-10000px';
        document.body.appendChild(div);
        return div;
    }

    announce(message) {
        this.ariaLive.textContent = message;
    }

    /**
     * Tab navigation through 3D objects
     */
    enableKeyboardNavigation() {
        this.inputManager.on('action:tabNext', () => {
            this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableObjects.length;
            this.focusObject(this.focusableObjects[this.currentFocusIndex]);
        });

        this.inputManager.on('action:tabPrev', () => {
            this.currentFocusIndex = (this.currentFocusIndex - 1 + this.focusableObjects.length) % this.focusableObjects.length;
            this.focusObject(this.focusableObjects[this.currentFocusIndex]);
        });
    }

    focusObject(mesh) {
        // Visual highlight
        mesh.renderOutline = true;
        mesh.outlineColor = new BABYLON.Color3(0, 1, 1);
        mesh.outlineWidth = 0.05;

        // Screen reader announcement
        this.announce(`Focused on ${mesh.name}`);

        // Camera look at
        // Optional: smoothly move camera to look at object
    }
}
```

---

## Part 4: Integration with Existing System

### 4.1 Migration Strategy

**Phase 1: Add InputManager alongside existing code** (No breaking changes)
```javascript
// Initialize InputManager
const inputManager = new InputManager(scene, canvas);

// Register contexts
inputManager.registerContext('view', new ViewModeContext());
inputManager.registerContext('edit', new EditModeContext());
inputManager.setContext('view');

// Existing camera.attachControl() still works
// InputManager adds new capabilities without breaking old code
```

**Phase 2: Migrate plugins to use InputManager**
```javascript
// OLD WAY (MovementPlugin):
scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
        // Handle click to move
    }
});

// NEW WAY:
inputManager.on('action:walkTo', (action) => {
    const targetPosition = action.hitInfo.pickedPoint;
    this.moveCamera(targetPosition);
});
```

**Phase 3: Remove old input handling**
```javascript
// Remove camera.attachControl()
// Remove manual pointer observers
// All input goes through InputManager
```

### 4.2 Plugin Integration

**Updated BabylonEngine.js:**

```javascript
class BabylonEngine {
    async init() {
        // ... existing init code

        // [INPUT] Initialize Input Management System
        this.inputManager = new InputManager(this.scene, this.canvas);

        // Register default contexts
        this.inputManager.registerContext('view', new ViewModeContext());
        this.inputManager.registerContext('edit', new EditModeContext());
        this.inputManager.registerContext('vr', new VRModeContext());

        // Start in view mode
        this.inputManager.setContext('view');

        // Make available to plugins
        this.inputManager.start();
    }

    registerPlugin(name, plugin) {
        // ... existing code

        // Pass inputManager to plugin
        plugin.inputManager = this.inputManager;
    }
}
```

**Updated MovementPlugin:**

```javascript
class MovementPlugin extends Plugin {
    async start() {
        // Subscribe to movement actions
        this.inputManager.on('action:moveForward', () => {
            this.camera.position.z += this.speed;
        });

        this.inputManager.on('action:moveBackward', () => {
            this.camera.position.z -= this.speed;
        });

        this.inputManager.on('action:walkTo', (action) => {
            if (action.hitInfo.hit) {
                this.walkToPosition(action.hitInfo.pickedPoint);
            }
        });

        // No more manual pointer observers!
    }
}
```

**Updated InteractionPlugin:**

```javascript
class InteractionPlugin extends Plugin {
    async start() {
        // Subscribe to interaction actions
        this.inputManager.on('action:selectObject', (action) => {
            if (action.hitInfo.pickedMesh) {
                this.selectMesh(action.hitInfo.pickedMesh);
            }
        });

        this.inputManager.on('action:deselectAll', () => {
            this.clearSelection();
        });

        this.inputManager.on('action:grabObject', () => {
            if (this.selectedMeshes.length > 0) {
                this.startDragging(this.selectedMeshes[0]);
            }
        });

        // Dragging still uses update loop
        this.inputManager.on('action:MouseMove', (action) => {
            if (this.dragging) {
                this.updateDragPosition(action.hitInfo.pickedPoint);
            }
        });
    }
}
```

### 4.3 Tag Integration

**Code Tags for Input System:**

```
[INP] - Input System General
[INP.1] - InputManager
[INP.2] - InputContext
[INP.3] - InputSource
[INP.4] - InputAction
[INP.5] - InputBinding
[INP.6] - GestureRecognizer
[INP.7] - Accessibility
```

**Usage in Code:**

```javascript
// [INP.1] Initialize InputManager
const inputManager = new InputManager(scene, canvas);

// [INP.2] Register contexts
inputManager.registerContext('view', new ViewModeContext());

// [INP.3] Keyboard source automatically initialized
// [INP.4] Listen for actions
inputManager.on('action:moveForward', handleMoveForward);

// [INP.5] Custom bindings
bindingEditor.rebindAction('edit', 'grab', 'KeyR');
```

---

## Part 5: Future Extensions

### 5.1 Voice Input (Future Phase)

```javascript
class VoiceSource {
    constructor(inputManager) {
        this.inputManager = inputManager;
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

        this.recognition.continuous = true;
        this.recognition.onresult = this.handleSpeech.bind(this);

        console.log('[INPUT] VoiceSource initialized');
    }

    handleSpeech(event) {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase();

        // Map voice commands to actions
        const voiceCommands = {
            'move forward': 'moveForward',
            'select': 'selectObject',
            'delete': 'deleteObject',
            'undo': 'undo',
            'save': 'save'
        };

        const action = voiceCommands[command];
        if (action) {
            this.inputManager.triggerAction({
                name: action,
                state: 'completed',
                source: 'voice'
            });
        }
    }
}
```

### 5.2 Eye Tracking (Future Phase)

```javascript
class EyeTrackingSource {
    constructor(inputManager) {
        this.inputManager = inputManager;
        // Integrate with WebGazer.js or hardware eye tracker
    }

    handleGaze(gazeData) {
        // Convert gaze position to 3D ray
        // Perform selection/hover based on gaze

        this.inputManager.handleInput('eyetracking', {
            source: 'eyetracking',
            input: 'Gaze',
            state: 'looking',
            position: gazeData.position,
            duration: gazeData.duration
        });
    }
}
```

### 5.3 Spatial Computing (Apple Vision Pro, etc.)

```javascript
class SpatialComputingContext extends InputContext {
    constructor() {
        super('spatial');

        this.bindings = [
            // Hand gestures
            { input: 'Pinch', action: 'select' },
            { input: 'PinchDrag', action: 'grab' },
            { input: 'DoublePinch', action: 'confirm' },

            // Eye gaze + pinch
            { input: 'GazePinch', action: 'selectGazedObject' },

            // Hand tracking
            { input: 'HandOpen', action: 'release' },
            { input: 'HandClosed', action: 'grab' },
            { input: 'PointingGesture', action: 'indicate' },

            // Voice
            { input: 'VoiceCommand', action: 'executeCommand' }
        ];
    }
}
```

---

## Part 6: Implementation Roadmap

### Phase INP-1: Core Foundation (Week 1)
**Duration:** 5-7 days
**Priority:** 🔴 CRITICAL

**Tasks:**
1. **Create InputManager** (2 days)
   - Core class with event routing
   - Priority system
   - Context management
   - Action triggering

2. **Create Input Sources** (2 days)
   - KeyboardSource
   - MouseSource
   - TouchSource

3. **Create Basic Contexts** (1 day)
   - ViewModeContext
   - EditModeContext

4. **Integration** (1 day)
   - Add to BabylonEngine
   - Make available to plugins
   - Create demo

**Deliverables:**
- ✅ `/src/input/InputManager.js` (500+ lines)
- ✅ `/src/input/sources/KeyboardSource.js` (200 lines)
- ✅ `/src/input/sources/MouseSource.js` (300 lines)
- ✅ `/src/input/sources/TouchSource.js` (400 lines)
- ✅ `/src/input/contexts/ViewModeContext.js` (100 lines)
- ✅ `/src/input/contexts/EditModeContext.js` (150 lines)
- ✅ `examples/input-system-demo.html`

**Acceptance Criteria:**
- [ ] Keyboard controls work without breaking
- [ ] Mouse controls work without breaking
- [ ] Touch gestures recognized
- [ ] Can switch between View/Edit modes
- [ ] No conflicts between input sources
- [ ] All inputs go through InputManager

---

### Phase INP-2: Advanced Features (Week 2)
**Duration:** 5-7 days
**Priority:** 🟡 HIGH

**Tasks:**
1. **Gesture Recognition** (2 days)
   - DoubleTap, LongPress, Swipe
   - Pinch, Rotate
   - Custom gesture API

2. **Gamepad Support** (1 day)
   - GamepadSource
   - Console-style controls

3. **Input Rebinding** (1 day)
   - InputBindingEditor
   - UI for rebinding
   - Save/load bindings

4. **Accessibility** (1 day)
   - Keyboard-only navigation
   - Screen reader support
   - Alternative input methods

5. **Plugin Migration** (1 day)
   - Update MovementPlugin
   - Update InteractionPlugin
   - Remove old input handling

**Deliverables:**
- ✅ `/src/input/GestureManager.js`
- ✅ `/src/input/sources/GamepadSource.js`
- ✅ `/src/input/InputBindingEditor.js`
- ✅ `/src/input/AccessibilityManager.js`
- ✅ Updated MovementPlugin
- ✅ Updated InteractionPlugin

---

### Phase INP-3: VR/AR Support (Week 3)
**Duration:** 5-7 days
**Priority:** 🟢 MEDIUM

**Tasks:**
1. **VRSource** (2 days)
   - WebXR integration
   - Controller input
   - Trigger, grip, thumbstick

2. **VRModeContext** (1 day)
   - VR-specific bindings
   - Teleportation
   - Natural mapping

3. **ARModeContext** (1 day)
   - AR-specific bindings
   - Gesture recognition
   - Spatial awareness

4. **Testing** (1 day)
   - Test with Meta Quest
   - Test with AR devices

**Deliverables:**
- ✅ `/src/input/sources/VRSource.js`
- ✅ `/src/input/contexts/VRModeContext.js`
- ✅ `/src/input/contexts/ARModeContext.js`
- ✅ `examples/vr-demo.html`

---

### Phase INP-4: Polish & Documentation (Week 4)
**Duration:** 3-4 days
**Priority:** 🟢 MEDIUM

**Tasks:**
1. **Performance Optimization** (1 day)
   - Throttle hover checks
   - Object pooling
   - Reduce allocations

2. **Testing** (1 day)
   - Unit tests for InputManager
   - Integration tests
   - Cross-browser testing

3. **Documentation** (1 day)
   - Input system guide
   - API reference
   - Migration guide

4. **Examples** (1 day)
   - Complete demo with all features
   - Mobile-optimized demo
   - VR demo

**Deliverables:**
- ✅ `/docs/input-system-guide.md`
- ✅ `/docs/input-migration-guide.md`
- ✅ Test coverage > 80%
- ✅ Performance benchmarks

---

## Part 7: Success Metrics

### Technical Metrics
- **Zero Input Conflicts** - Keyboard and mouse never break
- **< 1ms Input Latency** - From hardware event to action trigger
- **Supports 10+ Input Devices** - Keyboard, mouse, touch, gamepad, VR, voice
- **100% Rebindable** - All actions can be rebound to different inputs
- **Accessibility Score: A** - Full keyboard navigation, screen reader support

### User Experience Metrics
- **One-Click Context Switching** - Toggle modes instantly
- **Native Feel on All Devices** - Desktop feels like desktop, mobile feels like mobile
- **Gesture Recognition Rate > 95%** - Tap, swipe, pinch all work reliably
- **Zero Learning Curve** - Controls feel intuitive immediately

### Developer Experience Metrics
- **< 5 Lines to Add Action** - Easy to extend
- **Type Safety** - Full TypeScript definitions
- **Hot-Reloadable** - Bindings update without restart
- **Self-Documenting** - Code explains itself

---

## Conclusion

This Input Management System solves the recurring input bugs by providing:

1. **Single Source of Truth** - InputManager coordinates ALL input
2. **Context Awareness** - Different modes have different controls
3. **Conflict Prevention** - Priority system prevents stepping on toes
4. **Future-Proof** - Easy to add VR, AR, voice, eye tracking
5. **Best-in-Class UX** - Smooth, responsive, intuitive on all devices

**This is the foundation that makes everything else possible.**

Without this, we'll keep fighting input bugs forever.
With this, we can focus on features knowing input "just works."

---

**Next Step:** Get user approval, then start Phase INP-1 (Core Foundation) immediately.

This is the most critical piece of infrastructure. Everything else depends on getting this right.

**Let's build it. 🚀**
