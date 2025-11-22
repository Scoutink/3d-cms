# INP Phase 1: Core Foundation - Detailed Execution Plan
## Input Management System - Week 1 Implementation

**Status:** 🚀 ACTIVE EXECUTION
**Priority:** 🔴 CRITICAL - Foundation for all future work
**Duration:** 7 days
**Quality Target:** Zero bugs, 100% functional, production-ready

---

## Execution Philosophy

**Quality First:**
- Every component reviewed before moving to next
- Test each piece in isolation before integration
- No shortcuts, no "we'll fix it later"
- Code must be self-documenting and clear

**Systematic Approach:**
- Build bottom-up: Sources → Manager → Contexts
- Test each layer before adding next
- Integration happens only after all pieces work independently
- Continuous validation at each step

---

## Day 1: InputManager Core (Foundation)

### Task 1.1: Create Directory Structure
**Duration:** 15 minutes
**Files to create:**
```
/src/input/
  InputManager.js
  /sources/
    InputSource.js (base class)
    KeyboardSource.js
    MouseSource.js
    TouchSource.js
    GamepadSource.js
    VRSource.js
  /contexts/
    InputContext.js (base class)
    ViewModeContext.js
    EditModeContext.js
  /gestures/
    GestureManager.js
  /utils/
    InputEvent.js
    InputAction.js
```

**Quality Gate:**
- [ ] All directories created
- [ ] Structure matches design document
- [ ] README.md created in /src/input/ explaining architecture

### Task 1.2: Create InputManager Core (500 lines)
**Duration:** 4-5 hours

**Implementation Steps:**

**Step 1: Basic structure**
```javascript
import EventEmitter from '../core/EventEmitter.js';

export default class InputManager extends EventEmitter {
    constructor(scene, canvas) {
        super();

        // [INP.1.1] Core properties
        this.scene = scene;
        this.canvas = canvas;

        // [INP.1.2] Input sources
        this.sources = new Map();

        // [INP.1.3] Contexts (modes)
        this.contexts = new Map();
        this.activeContext = null;

        // [INP.1.4] Priority layers
        this.layers = [
            { name: 'modal', active: false, blocking: true, priority: 100 },
            { name: 'ui', active: false, blocking: true, priority: 50 },
            { name: '3d', active: true, blocking: false, priority: 0 }
        ];

        // [INP.1.5] Action states (for queries)
        this.actionStates = new Map();

        // [INP.1.6] Filters configuration
        this.filters = {
            deadZone: 0.1,
            smoothing: 0.2
        };

        // [INP.1.7] Debug mode
        this.debug = false;

        console.log('[INP.1] InputManager initialized');
    }
}
```

**Quality Check:**
- [ ] EventEmitter imported correctly
- [ ] All properties initialized
- [ ] Console log appears
- [ ] No errors in browser

**Step 2: Context registration**
```javascript
    /**
     * [INP.1] Register a context (mode)
     * @param {string} name - Context name
     * @param {InputContext} context - Context instance
     */
    registerContext(name, context) {
        if (this.contexts.has(name)) {
            console.warn(`[INP.1] Context '${name}' already registered, replacing`);
        }

        this.contexts.set(name, context);
        context.inputManager = this; // Give context reference to manager

        console.log(`[INP.1] Context registered: ${name}`);
    }
```

**Quality Check:**
- [ ] Can register contexts
- [ ] Warning on duplicate
- [ ] Context gets reference to manager

**Step 3: Context switching**
```javascript
    /**
     * [INP.1] Switch to different context
     * @param {string} contextName - Name of context
     */
    setContext(contextName) {
        const newContext = this.contexts.get(contextName);

        if (!newContext) {
            console.error(`[INP.1] Context not found: ${contextName}`);
            return false;
        }

        // [INP.1.1] Deactivate old context
        if (this.activeContext) {
            this.activeContext.deactivate();

            if (this.debug) {
                console.log(`[INP.1] Deactivated context: ${this.activeContext.name}`);
            }
        }

        // [INP.1.2] Activate new context
        const previousContext = this.activeContext;
        this.activeContext = newContext;
        this.activeContext.activate();

        // [INP.1.3] Emit context change event
        this.emit('context:changed', {
            from: previousContext?.name || null,
            to: contextName
        });

        console.log(`[INP.1] Context switched to: ${contextName}`);
        return true;
    }
```

**Quality Check:**
- [ ] Context switching works
- [ ] Old context deactivated
- [ ] New context activated
- [ ] Event emitted correctly
- [ ] Returns boolean success

**Step 4: Input handling core**
```javascript
    /**
     * [INP.1] Handle raw input from source
     * @param {string} sourceName - Source that generated input
     * @param {Object} event - Raw input event
     */
    handleInput(sourceName, event) {
        // [INP.1.1] Debug logging
        if (this.debug) {
            console.log(`[INP.1] Input from ${sourceName}:`, event.input, event.state);
        }

        // [INP.1.2] Check if input blocked by higher priority layer
        if (this.isBlocked(event)) {
            if (this.debug) {
                console.log(`[INP.1] Input blocked by priority layer`);
            }
            return;
        }

        // [INP.1.3] Route to active context
        if (!this.activeContext) {
            console.warn('[INP.1] No active context, input ignored');
            return;
        }

        const action = this.activeContext.mapInputToAction(event);

        if (action) {
            this.triggerAction(action);
        }
    }
```

**Quality Check:**
- [ ] Input routing works
- [ ] Debug logging functional
- [ ] Blocking check happens
- [ ] Context mapping called

**Step 5: Blocking logic**
```javascript
    /**
     * [INP.1] Check if input is blocked
     * @param {Object} event - Input event
     * @returns {boolean}
     */
    isBlocked(event) {
        // [INP.1.1] UI elements block 3D input
        const activeElement = document.activeElement;
        if (activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.tagName === 'SELECT' ||
            activeElement.contentEditable === 'true'
        )) {
            return true;
        }

        // [INP.1.2] Check priority layers (sorted high to low)
        const sortedLayers = [...this.layers].sort((a, b) => b.priority - a.priority);

        for (const layer of sortedLayers) {
            if (layer.active && layer.blocking) {
                // This layer is active and blocking lower layers
                if (this.debug) {
                    console.log(`[INP.1] Input blocked by layer: ${layer.name}`);
                }
                return true;
            }
        }

        return false;
    }
```

**Quality Check:**
- [ ] UI elements block correctly
- [ ] Text inputs block 3D actions
- [ ] Layer priority works
- [ ] Debug logging shows blocking

**Step 6: Action triggering**
```javascript
    /**
     * [INP.1] Trigger an abstract action
     * @param {Object} action - Action to trigger
     */
    triggerAction(action) {
        // [INP.1.1] Apply filters (dead zone, smoothing, etc.)
        if (action.value !== undefined) {
            action.value = this.applyFilters(action);
        }

        // [INP.1.2] Update action state
        this.actionStates.set(action.name, {
            ...action,
            timestamp: Date.now()
        });

        // [INP.1.3] Emit specific action event
        this.emit(`action:${action.name}`, action);

        // [INP.1.4] Emit general action event
        this.emit('action', action);

        // [INP.1.5] Debug logging
        if (this.debug) {
            console.log(`[INP.1] Action triggered: ${action.name}`, action);
        }
    }
```

**Quality Check:**
- [ ] Actions trigger correctly
- [ ] State updated
- [ ] Events emitted
- [ ] Filters applied

**Step 7: Filter application**
```javascript
    /**
     * [INP.1] Apply processing filters to action value
     * @param {Object} action - Action with value to filter
     * @returns {*} Filtered value
     */
    applyFilters(action) {
        let value = action.value;

        // [INP.1.1] Dead zone (ignore small inputs)
        if (typeof value === 'number') {
            if (Math.abs(value) < this.filters.deadZone) {
                return 0;
            }
        }

        // [INP.1.2] Smoothing (for analog inputs)
        if (action.filters?.smoothing) {
            const prevState = this.actionStates.get(action.name);
            if (prevState && prevState.value !== undefined) {
                const prev = prevState.value;
                const smoothFactor = action.filters.smoothing;
                value = prev + (value - prev) * smoothFactor;
            }
        }

        // [INP.1.3] Custom curve (acceleration/deceleration)
        if (action.filters?.curve && typeof action.filters.curve === 'function') {
            value = action.filters.curve(value);
        }

        return value;
    }
```

**Quality Check:**
- [ ] Dead zone works
- [ ] Smoothing works
- [ ] Custom curves work
- [ ] No errors with undefined values

**Step 8: Query API**
```javascript
    /**
     * [INP.1] Query if action is currently pressed/active
     * @param {string} actionName - Name of action
     * @returns {boolean}
     */
    isActionPressed(actionName) {
        const action = this.actionStates.get(actionName);

        if (!action) {
            return false;
        }

        // Check if action is pressed or held
        return action.state === 'pressed' || action.state === 'held';
    }

    /**
     * [INP.1] Get current value of action (for analog)
     * @param {string} actionName - Name of action
     * @returns {*} Action value or null
     */
    getActionValue(actionName) {
        const action = this.actionStates.get(actionName);
        return action?.value ?? null;
    }

    /**
     * [INP.1] Get full action state
     * @param {string} actionName - Name of action
     * @returns {Object|null}
     */
    getActionState(actionName) {
        return this.actionStates.get(actionName) || null;
    }
```

**Quality Check:**
- [ ] isActionPressed works
- [ ] getActionValue works
- [ ] Returns correct values
- [ ] Handles missing actions gracefully

**Step 9: Layer management**
```javascript
    /**
     * [INP.1] Set priority layer active/inactive
     * @param {string} layerName - Layer name
     * @param {boolean} active - Active state
     */
    setLayerActive(layerName, active) {
        const layer = this.layers.find(l => l.name === layerName);

        if (!layer) {
            console.error(`[INP.1] Layer not found: ${layerName}`);
            return;
        }

        layer.active = active;

        this.emit('layer:changed', {
            layer: layerName,
            active: active
        });

        console.log(`[INP.1] Layer '${layerName}' set to: ${active}`);
    }
```

**Quality Check:**
- [ ] Layers can be toggled
- [ ] Event emitted
- [ ] Error on invalid layer

**Step 10: Disposal**
```javascript
    /**
     * [INP.1] Cleanup and dispose
     */
    dispose() {
        // [INP.1.1] Dispose all sources
        for (const [name, source] of this.sources.entries()) {
            if (source.dispose) {
                source.dispose();
                console.log(`[INP.1] Disposed source: ${name}`);
            }
        }
        this.sources.clear();

        // [INP.1.2] Deactivate context
        if (this.activeContext) {
            this.activeContext.deactivate();
            this.activeContext = null;
        }

        // [INP.1.3] Clear contexts
        this.contexts.clear();

        // [INP.1.4] Clear action states
        this.actionStates.clear();

        // [INP.1.5] Remove all event listeners
        this.removeAllListeners();

        console.log('[INP.1] InputManager disposed');
    }
```

**Quality Check:**
- [ ] All sources disposed
- [ ] Context deactivated
- [ ] Memory cleared
- [ ] No lingering listeners

### Task 1.3: Test InputManager Standalone
**Duration:** 1 hour

**Test File:** `/examples/tests/test-input-manager.html`

```html
<!DOCTYPE DOCTYPE html>
<html>
<head>
    <title>InputManager Test</title>
</head>
<body>
    <h1>InputManager Core Test</h1>
    <div id="output"></div>

    <script type="module">
        import InputManager from '../../src/input/InputManager.js';

        const output = document.getElementById('output');

        function log(message) {
            const p = document.createElement('p');
            p.textContent = message;
            output.appendChild(p);
        }

        // Test 1: Initialization
        try {
            const manager = new InputManager(null, null);
            log('✅ Test 1: InputManager initialized');
        } catch (e) {
            log('❌ Test 1: ' + e.message);
        }

        // Test 2: Context registration
        // (Will implement after contexts are created)

        // Test 3: Layer management
        try {
            const manager = new InputManager(null, null);
            manager.setLayerActive('ui', true);
            manager.setLayerActive('ui', false);
            log('✅ Test 2: Layer management works');
        } catch (e) {
            log('❌ Test 2: ' + e.message);
        }

        // Test 4: Action state
        try {
            const manager = new InputManager(null, null);
            const pressed = manager.isActionPressed('test');
            if (pressed === false) {
                log('✅ Test 3: Action query works');
            } else {
                log('❌ Test 3: Unexpected result');
            }
        } catch (e) {
            log('❌ Test 3: ' + e.message);
        }

        log('Core tests complete. Check console for details.');
    </script>
</body>
</html>
```

**Quality Gate - Day 1:**
- [ ] All tests pass
- [ ] No console errors
- [ ] InputManager initializes correctly
- [ ] Layer management works
- [ ] Action queries work
- [ ] Code reviewed and clean

---

## Day 2: Input Sources (Hardware Listeners)

### Task 2.1: Create Base InputSource Class
**Duration:** 30 minutes

**File:** `/src/input/sources/InputSource.js`

```javascript
/**
 * Base class for all input sources
 */
export default class InputSource {
    constructor(inputManager) {
        this.inputManager = inputManager;
        this.enabled = true;
        this.name = 'base';
    }

    /**
     * Enable this input source
     */
    enable() {
        this.enabled = true;
        console.log(`[INP.3] ${this.name} enabled`);
    }

    /**
     * Disable this input source
     */
    disable() {
        this.enabled = false;
        console.log(`[INP.3] ${this.name} disabled`);
    }

    /**
     * Send input to manager
     * @param {Object} event - Standardized input event
     */
    sendInput(event) {
        if (!this.enabled) {
            return;
        }

        this.inputManager.handleInput(this.name, event);
    }

    /**
     * Dispose and cleanup
     */
    dispose() {
        this.enabled = false;
        console.log(`[INP.3] ${this.name} disposed`);
    }
}
```

**Quality Check:**
- [ ] Base class created
- [ ] Enable/disable works
- [ ] sendInput method correct
- [ ] Dispose method present

### Task 2.2: Implement KeyboardSource
**Duration:** 2 hours

**File:** `/src/input/sources/KeyboardSource.js`

*[Will continue with full implementation in next message to stay focused and systematic]*

**Implementation Checkpoints:**
1. Basic key down/up listeners ✓
2. Modifier key tracking (Ctrl, Shift, Alt) ✓
3. UI element detection (don't block typing) ✓
4. Key repeat handling ✓
5. Testing with actual keyboard ✓

### Task 2.3: Implement MouseSource
**Duration:** 3 hours

**Implementation Checkpoints:**
1. Babylon.js pointer observable integration ✓
2. Click detection (left, right, middle) ✓
3. Mouse move with delta tracking ✓
4. Mouse wheel handling ✓
5. Raycast integration for 3D picking ✓
6. Testing with actual mouse ✓

### Task 2.4: Implement TouchSource (Basic)
**Duration:** 2 hours

**Implementation Checkpoints:**
1. Touch start/move/end listeners ✓
2. Single touch tracking ✓
3. Multi-touch detection ✓
4. Basic tap recognition ✓
5. Testing on mobile or touch device ✓

**Quality Gate - Day 2:**
- [ ] All three sources implemented
- [ ] Each source tested independently
- [ ] No console errors
- [ ] All event types working
- [ ] Code reviewed and clean

---

## Day 3: Input Contexts (Modes)

### Task 3.1: Create Base InputContext Class
**Duration:** 1 hour

### Task 3.2: Implement ViewModeContext
**Duration:** 2 hours

**Bindings to implement:**
- WASD movement
- Mouse look
- Click-to-move
- Zoom (wheel)
- Mode toggle (E key)

### Task 3.3: Implement EditModeContext
**Duration:** 3 hours

**Bindings to implement:**
- Camera movement (same as View)
- Object selection (click)
- Deselect (click ground)
- Undo/Redo (Ctrl+Z/Y)
- Delete (Delete key)
- Mode toggle (E key)

**Quality Gate - Day 3:**
- [ ] Both contexts implemented
- [ ] Bindings configured
- [ ] Can switch between contexts
- [ ] All actions map correctly
- [ ] Code reviewed and clean

---

## Day 4: Integration with BabylonEngine

### Task 4.1: Update BabylonEngine.js
**Duration:** 2 hours

**Changes:**
1. Import InputManager
2. Create InputManager in init()
3. Register contexts
4. Set initial context
5. Make available to plugins

### Task 4.2: Create Test Demo
**Duration:** 3 hours

**File:** `/examples/inp-integration-demo.html`

**Features to test:**
- Keyboard movement
- Mouse look
- Click-to-move
- Switch View/Edit modes
- Action queries
- Event listening

### Task 4.3: Remove Old Input Handling
**Duration:** 2 hours

**Changes:**
- Remove camera.attachControl() from demos
- Update phase3-full-demo.html to use InputManager
- Test that nothing breaks

**Quality Gate - Day 4:**
- [ ] InputManager integrated
- [ ] Demo works perfectly
- [ ] Old input system removed
- [ ] No conflicts
- [ ] All features working

---

## Day 5-7: Testing, Debugging, Polish

### Day 5: Comprehensive Testing

**Test Scenarios:**
1. Keyboard-only navigation
2. Mouse-only navigation
3. Touch gestures
4. Mode switching
5. UI element interaction
6. Action queries
7. Event system
8. Performance (no lag)

### Day 6: Bug Fixes & Edge Cases

**Focus areas:**
- Rapid mode switching
- Simultaneous inputs
- Browser compatibility
- Memory leaks
- Event cleanup

### Day 7: Documentation & Review

**Deliverables:**
1. API documentation
2. Usage guide
3. Migration guide
4. Code review
5. Final testing

---

## Quality Gates Summary

### Day 1: InputManager Core
- [ ] All core methods implemented
- [ ] Standalone tests pass
- [ ] No console errors
- [ ] Code reviewed

### Day 2: Input Sources
- [ ] KeyboardSource works
- [ ] MouseSource works
- [ ] TouchSource works
- [ ] All tested independently

### Day 3: Input Contexts
- [ ] ViewModeContext complete
- [ ] EditModeContext complete
- [ ] Context switching works
- [ ] All bindings configured

### Day 4: Integration
- [ ] BabylonEngine updated
- [ ] Demo working perfectly
- [ ] Old system removed
- [ ] No regressions

### Day 5-7: Final Polish
- [ ] All tests pass
- [ ] No bugs found
- [ ] Documentation complete
- [ ] Code review approved
- [ ] Ready for production

---

## Success Criteria

**Functional Requirements:**
- ✅ Keyboard controls never break
- ✅ Mouse controls never break
- ✅ Touch gestures work
- ✅ Mode switching instant
- ✅ No input conflicts
- ✅ Query API works
- ✅ Events fire correctly

**Technical Requirements:**
- ✅ < 1ms input latency
- ✅ No memory leaks
- ✅ No console errors
- ✅ Clean, documented code
- ✅ All sources disposable

**Quality Requirements:**
- ✅ Code reviewed
- ✅ Tests pass
- ✅ Documentation complete
- ✅ Browser compatible
- ✅ Production ready

---

## Execution Status Tracker

**Day 1:** ⏳ Starting now
**Day 2:** ⏸️ Pending
**Day 3:** ⏸️ Pending
**Day 4:** ⏸️ Pending
**Day 5:** ⏸️ Pending
**Day 6:** ⏸️ Pending
**Day 7:** ⏸️ Pending

---

**LET'S BEGIN EXECUTION NOW.**

Starting with Day 1, Task 1.1: Directory structure creation.
