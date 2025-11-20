/**
 * @file Plugin.js
 * @description Base class for all plugins (foundation for plugin system)
 *
 * @tags [PLG.*] All plugin system tags
 * @primary-tags [!PLG.1] Plugin base class (CRITICAL - all plugins inherit)
 * @critical-tags [!PLG.1.2] Plugin init affects all plugins
 *
 * @dependencies
 *   - [PLG -> EVT] EventEmitter for communication
 *   - [PLG -> ENG] BabylonEngine passes scene reference
 *   - [PLG -> CFG] ConfigLoader provides configuration
 *
 * @affects All plugin implementations
 *
 * @events
 *   - Subscribes: Defined by child plugins
 *   - Emits: plugin:enabled, plugin:disabled, plugin:disposed
 *
 * @author Development Team
 * @created 2025-10-31
 */

// [!PLG.1] CRITICAL: Plugin base class
// Used by: ALL plugins (inheritance hierarchy root)
// Impact: Changes here affect all plugin implementations
// Pattern: Template Method pattern (lifecycle hooks)
class Plugin {
    // [PLG.1.1] Plugin constructor
    // [PLG.3] Store plugin options/configuration
    constructor(options = {}) {
        // [PLG.3] Plugin-specific options
        this.options = options;

        // [PLG.1.2] Will be set during init()
        this.scene = null;
        this.events = null;
        this.config = null;
        this.inputManager = null;

        // [PLG.1.4] Enable/disable state
        this.enabled = true;

        // [PLG.1] Plugin metadata
        this.name = this.constructor.name;
        this.initialized = false;
        this.started = false;
    }

    // [!PLG.1.2] CRITICAL: Plugin initialization lifecycle hook
    // [PLG.1.2 -> ENG.1.3] Receives scene from BabylonEngine
    // [PLG.1.2 -> EVT.1] Receives event emitter
    // [PLG.1.2 -> CFG.1] Receives configuration
    // [PLG.1.2 -> INP.1] Receives InputManager for listening to actions
    // Called by: BabylonEngine.registerPlugin()
    // Timing: Before start(), after engine creates scene
    init(scene, events, config, inputManager) {
        if (this.initialized) {
            console.warn(`[PLG.1.2] Plugin ${this.name} already initialized`);
            return;
        }

        // [PLG.1.2] Store references from engine
        this.scene = scene;
        this.events = events;
        this.config = config;
        this.inputManager = inputManager;

        // [PLG.2] Subscribe to events if defined in child class
        // [PLG.2] Child classes can define subscriptions object
        // Example: subscriptions = { 'camera:created': this.onCameraCreated }
        if (this.subscriptions) {
            Object.entries(this.subscriptions).forEach(([event, handler]) => {
                // [EVT.1.1] Register event listener
                this.events.on(event, handler.bind(this));
            });
        }

        this.initialized = true;

        // [EVT.2] Emit plugin initialized event
        this.events.emit('plugin:initialized', {
            name: this.name,
            plugin: this
        });
    }

    // [PLG.1.3] Plugin start lifecycle hook
    // Called by: BabylonEngine.start()
    // Override in child class for plugin-specific initialization
    // Timing: After all plugins initialized, before render loop starts
    start() {
        if (this.started) {
            console.warn(`[PLG.1.3] Plugin ${this.name} already started`);
            return;
        }

        // [PLG.1.3] Override this in child plugins
        // Example: CameraPlugin creates default camera here

        this.started = true;

        // [EVT.2] Emit plugin started event
        this.events.emit('plugin:started', {
            name: this.name,
            plugin: this
        });
    }

    // [PLG.1.4] Enable plugin
    // [PLG.1.4] Allows runtime toggling of features
    enable() {
        if (this.enabled) {
            return;
        }

        this.enabled = true;

        // [EVT.2] Emit plugin enabled event
        this.events.emit('plugin:enabled', {
            name: this.name,
            plugin: this
        });
    }

    // [PLG.1.4] Disable plugin
    // [PLG.1.4] Temporarily deactivate without disposing
    disable() {
        if (!this.enabled) {
            return;
        }

        this.enabled = false;

        // [EVT.2] Emit plugin disabled event
        this.events.emit('plugin:disabled', {
            name: this.name,
            plugin: this
        });
    }

    // [PLG.1.5] Plugin disposal/cleanup
    // [PLG.1.5 -> EVT.1.3] Unsubscribe from all events
    // Called when: Plugin removed or engine destroyed
    dispose() {
        // [PLG.2] Unsubscribe from events
        if (this.subscriptions && this.events) {
            Object.entries(this.subscriptions).forEach(([event, handler]) => {
                // [EVT.1.3] Unregister event listener
                this.events.off(event, handler.bind(this));
            });
        }

        // [EVT.2] Emit plugin disposed event
        if (this.events) {
            this.events.emit('plugin:disposed', {
                name: this.name,
                plugin: this
            });
        }

        // [PLG.1.5] Clear references
        this.scene = null;
        this.events = null;
        this.config = null;
        this.inputManager = null;
        this.initialized = false;
        this.started = false;
    }

    // [PLG.1] Get plugin name
    getName() {
        return this.name;
    }

    // [PLG.1] Check if plugin is enabled
    isEnabled() {
        return this.enabled;
    }

    // [PLG.1] Check if plugin is initialized
    isInitialized() {
        return this.initialized;
    }

    // [PLG.1] Check if plugin is started
    isStarted() {
        return this.started;
    }
}

// [PLG.1] Export for use by plugin implementations
export default Plugin;
