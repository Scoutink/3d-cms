/**
 * Legozo Module Loader v2.0
 * Orchestrates loading and initialization of the modular 3D CMS
 *
 * Phase 2 Updates:
 * - Uses new Module system (ModuleBase)
 * - Uses DependencyResolver for load order
 * - Instantiates UI controllers
 * - Proper module lifecycle management
 *
 * Architecture:
 *   1. Load configuration
 *   2. Load CSS styles
 *   3. Load HTML templates
 *   4. Initialize core engine
 *   5. Load modules (using imports)
 *   6. Resolve dependencies
 *   7. Initialize modules in order
 *   8. Initialize controllers
 *   9. Start modules
 *   10. Create demo objects
 */

import BabylonEngine from '../src/core/BabylonEngine.js';
import ConfigLoader from '../src/config/ConfigLoader.js';
import TemplateLoader from '../ui/template-loader.js';
import DependencyResolver from './dependency-resolver.js';

export class LegozoLoader {
    constructor() {
        this.config = null;
        this.engine = null;
        this.modules = new Map(); // name → module instance
        this.controllers = new Map(); // name → controller instance
        this.templates = new TemplateLoader();
        this.resolver = new DependencyResolver();
    }

    /**
     * Initialize the Legozo system
     * @param {string} configPath - Path to scene configuration JSON
     * @returns {Promise<void>}
     */
    async init(configPath) {
        console.log('[Legozo] Initializing v2.0 (Module System)...');

        try {
            // 1. Load configuration
            await this.loadConfiguration(configPath);

            // 2. Load CSS styles
            await this.loadStyles();

            // 3. Load HTML templates
            await this.loadTemplates();

            // 4. Initialize core engine
            await this.initializeEngine();

            // 5. Load module classes
            await this.loadModules();

            console.log('[Legozo] Initialization complete');
        } catch (error) {
            console.error('[Legozo] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Start the scene
     * @returns {Promise<void>}
     */
    async start() {
        console.log('[Legozo] Starting...');

        try {
            // 6. Resolve module dependencies
            await this.resolveDependencies();

            // 7. Initialize modules (in dependency order)
            await this.initializeModules();

            // 8. Start engine (this starts old plugins too)
            await this.engine.start();

            // 9. Start modules
            await this.startModules();

            // 10. Initialize controllers
            await this.initializeControllers();

            // 11. Create demo objects
            if (this.config.demoObjects) {
                await this.createDemoObjects();
            }

            // 12. Hide loading screen
            this.hideLoadingScreen();

            console.log('[Legozo] Started successfully');
            console.log('[Legozo] Active modules:', Array.from(this.modules.keys()).join(', '));

        } catch (error) {
            console.error('[Legozo] Start failed:', error);
            throw error;
        }
    }

    /**
     * Load configuration
     * @param {string} configPath
     * @returns {Promise<void>}
     */
    async loadConfiguration(configPath) {
        this.updateLoading(10, 'Loading configuration...');

        // Load both engine config and scene config
        // Paths are relative to index.html, not this file
        const engineConfig = await ConfigLoader.load('./config/engine-config.json');
        const sceneConfig = await ConfigLoader.load(configPath);

        // Merge configurations
        this.config = {
            ...engineConfig,
            ...sceneConfig
        };

        console.log('[Legozo] Configuration loaded');
    }

    /**
     * Load CSS styles
     * @returns {Promise<void>}
     */
    async loadStyles() {
        this.updateLoading(20, 'Loading styles...');

        // Create link element for main stylesheet
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = './ui/styles/main.css';
        document.head.appendChild(link);

        // Wait for stylesheet to load
        await new Promise((resolve, reject) => {
            link.onload = resolve;
            link.onerror = reject;
        });

        console.log('[Legozo] Styles loaded');
    }

    /**
     * Load HTML templates
     * @returns {Promise<void>}
     */
    async loadTemplates() {
        this.updateLoading(30, 'Loading UI templates...');

        const templateList = this.config.ui?.templates || [
            'loading-screen',
            'properties-panel',
            'mode-toggle',
            'control-panel'
        ];

        await this.templates.loadMultiple(templateList);

        console.log('[Legozo] Templates loaded');
    }

    /**
     * Initialize Babylon engine
     * @returns {Promise<void>}
     */
    async initializeEngine() {
        this.updateLoading(40, 'Creating engine...');

        const canvas = document.getElementById('renderCanvas');
        if (!canvas) {
            throw new Error('Canvas element #renderCanvas not found');
        }

        this.engine = new BabylonEngine(canvas, this.config);
        window.engine = this.engine; // Global reference for debugging

        console.log('[Legozo] Engine initialized');
    }

    /**
     * Load module classes
     * @returns {Promise<void>}
     */
    async loadModules() {
        this.updateLoading(50, 'Loading modules...');

        const moduleNames = this.config.modules || [];

        // Module imports (new module classes)
        const imports = {
            'ground': () => import('../modules/ground/ground.module.js'),
            'physics': () => import('../modules/physics/physics.module.js'),
            // Old plugins (will be converted gradually)
            'camera': () => import('../src/plugins/CameraPlugin.js'),
            'movement': () => import('../src/plugins/MovementPlugin.js'),
            'collision': () => import('../src/plugins/CollisionPlugin.js'),
            'gravity': () => import('../src/plugins/GravityPlugin.js'),
            'lighting': () => import('../src/plugins/LightingPlugin.js'),
            'shadow': () => import('../src/plugins/ShadowPlugin.js'),
            'material': () => import('../src/plugins/MaterialPlugin.js'),
            'sky': () => import('../src/plugins/SkyPlugin.js'),
            'asset': () => import('../src/plugins/AssetPlugin.js'),
            'interaction': () => import('../src/plugins/InteractionPlugin.js'),
            'ui': () => import('../src/plugins/UIPlugin.js'),
            'performance': () => import('../src/plugins/PerformancePlugin.js'),
            'gizmo': () => import('../src/plugins/GizmoPlugin.js'),
            'properties': () => import('../src/plugins/PropertiesPlugin.js')
        };

        // Load each module
        for (const name of moduleNames) {
            if (imports[name]) {
                try {
                    const module = await imports[name]();
                    const ModuleClass = module.default || module.GroundModule;

                    // Check if it's a new-style module (extends ModuleBase)
                    if (ModuleClass.prototype && ModuleClass.prototype._onInit !== undefined) {
                        // New module system
                        const instance = new ModuleClass();
                        this.modules.set(name, instance);
                        console.log(`[Legozo] Loaded NEW module: ${name} v${instance.version}`);
                    } else {
                        // Old plugin system (register directly)
                        const plugin = new ModuleClass();
                        this.engine.registerPlugin(name, plugin);
                        console.log(`[Legozo] Loaded OLD plugin: ${name}`);
                    }
                } catch (error) {
                    console.error(`[Legozo] Failed to load ${name}:`, error);
                }
            } else {
                console.warn(`[Legozo] Unknown module: ${name}`);
            }
        }

        console.log(`[Legozo] Loaded ${this.modules.size} new modules`);
    }

    /**
     * Resolve module dependencies
     * @returns {Promise<void>}
     */
    async resolveDependencies() {
        if (this.modules.size === 0) {
            console.log('[Legozo] No modules to resolve');
            return;
        }

        this.updateLoading(55, 'Resolving dependencies...');

        try {
            const moduleArray = Array.from(this.modules.values());
            const sorted = this.resolver.resolve(moduleArray);

            // Update modules map with sorted order
            const sortedModules = new Map();
            for (const module of sorted) {
                sortedModules.set(module.name, module);
            }
            this.modules = sortedModules;

            console.log('[Legozo] Dependency order:', sorted.map(m => m.name).join(' → '));

            // Visualize dependency graph (for debugging)
            if (this.config.debug) {
                console.log(this.resolver.visualize(moduleArray));
            }

        } catch (error) {
            console.error('[Legozo] Dependency resolution failed:', error);
            throw error;
        }
    }

    /**
     * Initialize all modules (in dependency order)
     * @returns {Promise<void>}
     */
    async initializeModules() {
        this.updateLoading(60, 'Initializing modules...');

        for (const [name, module] of this.modules.entries()) {
            try {
                await module.init(this.engine, this.config);
                console.log(`[Legozo] Initialized: ${name}`);
            } catch (error) {
                console.error(`[Legozo] Failed to initialize ${name}:`, error);
                throw error;
            }
        }

        console.log('[Legozo] All modules initialized');
    }

    /**
     * Start all modules
     * @returns {Promise<void>}
     */
    async startModules() {
        this.updateLoading(70, 'Starting modules...');

        for (const [name, module] of this.modules.entries()) {
            try {
                await module.start();
                console.log(`[Legozo] Started: ${name}`);
            } catch (error) {
                console.error(`[Legozo] Failed to start ${name}:`, error);
                // Don't throw - allow other modules to start
            }
        }

        console.log('[Legozo] All modules started');
    }

    /**
     * Initialize UI controllers
     * @returns {Promise<void>}
     */
    async initializeControllers() {
        this.updateLoading(75, 'Initializing controllers...');

        // Controller imports
        const controllerImports = {
            'ground': () => import('../modules/ground/ground.controller.js')
        };

        for (const [name, module] of this.modules.entries()) {
            if (controllerImports[name]) {
                try {
                    const controllerModule = await controllerImports[name]();
                    const ControllerClass = controllerModule.default || controllerModule.GroundController;

                    // Find container for this controller
                    const container = document.querySelector('.control-panel');
                    if (!container) {
                        console.warn(`[Legozo] No container found for ${name} controller`);
                        continue;
                    }

                    // Instantiate controller
                    const controller = new ControllerClass(module);
                    controller.setContainer(container);

                    // Initialize controller
                    await controller.init();

                    // Link controller to module
                    module.setController(controller);

                    this.controllers.set(name, controller);
                    console.log(`[Legozo] Initialized ${name} controller`);

                } catch (error) {
                    console.error(`[Legozo] Failed to initialize ${name} controller:`, error);
                }
            }
        }

        console.log(`[Legozo] Initialized ${this.controllers.size} controllers`);
    }

    /**
     * Create demo objects from configuration
     * @returns {Promise<void>}
     */
    async createDemoObjects() {
        this.updateLoading(80, 'Creating scene objects...');

        const objects = this.config.demoObjects || [];
        const scene = this.engine.scene;

        for (const objConfig of objects) {
            let mesh = null;

            // Create mesh based on type
            switch (objConfig.type) {
                case 'box':
                    mesh = BABYLON.MeshBuilder.CreateBox(objConfig.name, {
                        size: objConfig.size || 1
                    }, scene);
                    break;
                case 'sphere':
                    mesh = BABYLON.MeshBuilder.CreateSphere(objConfig.name, {
                        diameter: objConfig.diameter || 1
                    }, scene);
                    break;
                case 'cylinder':
                    mesh = BABYLON.MeshBuilder.CreateCylinder(objConfig.name, {
                        height: objConfig.height || 2,
                        diameter: objConfig.diameter || 1
                    }, scene);
                    break;
                case 'torus':
                    mesh = BABYLON.MeshBuilder.CreateTorus(objConfig.name, {
                        diameter: objConfig.diameter || 2,
                        thickness: objConfig.thickness || 0.5
                    }, scene);
                    break;
                case 'plane':
                    mesh = BABYLON.MeshBuilder.CreatePlane(objConfig.name, {
                        width: objConfig.width || 2,
                        height: objConfig.height || 2
                    }, scene);
                    break;
            }

            if (mesh && objConfig.position) {
                mesh.position.x = objConfig.position.x || 0;
                mesh.position.y = objConfig.position.y || 0;
                mesh.position.z = objConfig.position.z || 0;
            }

            if (mesh && objConfig.rotation) {
                mesh.rotation.x = objConfig.rotation.x || 0;
                mesh.rotation.y = objConfig.rotation.y || 0;
                mesh.rotation.z = objConfig.rotation.z || 0;
            }

            if (mesh && objConfig.material) {
                const mat = new BABYLON.StandardMaterial(objConfig.name + '_mat', scene);
                if (objConfig.material.diffuseColor) {
                    mat.diffuseColor = new BABYLON.Color3(
                        objConfig.material.diffuseColor.r || 0,
                        objConfig.material.diffuseColor.g || 0,
                        objConfig.material.diffuseColor.b || 0
                    );
                }
                mesh.material = mat;
            }

            // Register mesh with InteractionPlugin for clicking and selection
            if (mesh) {
                const interactionPlugin = this.engine.plugins.get('interaction');
                const propertiesPlugin = this.engine.plugins.get('properties');
                const collisionPlugin = this.engine.plugins.get('collision');

                // Enable collision on objects
                if (collisionPlugin) {
                    // Enable simple collision for camera
                    collisionPlugin.enableSimpleCollision(mesh, {
                        checkCollisions: true,
                        pickable: true
                    });

                    // Enable physics body if physics is enabled
                    if (collisionPlugin.physicsEnabled) {
                        // Determine correct physics shape based on mesh type
                        let physicsShape = BABYLON.PhysicsShapeType.BOX;
                        switch (objConfig.type) {
                            case 'sphere':
                                physicsShape = BABYLON.PhysicsShapeType.SPHERE;
                                break;
                            case 'cylinder':
                                physicsShape = BABYLON.PhysicsShapeType.CYLINDER;
                                break;
                            case 'box':
                            case 'plane':
                            case 'torus':
                            default:
                                physicsShape = BABYLON.PhysicsShapeType.BOX;
                                break;
                        }

                        try {
                            collisionPlugin.enablePhysicsBody(mesh, {
                                mass: 0,  // Static object (immovable) - required for camera collision to work
                                restitution: 0.2,  // Low bounce for static objects
                                friction: 0.8,  // High friction
                                shape: physicsShape
                            });

                            // CRITICAL: Ensure checkCollisions stays enabled for camera collision
                            // Physics bodies can override this, so we explicitly set it again
                            mesh.checkCollisions = true;

                            console.log(`[Legozo] Enabled physics on: ${mesh.name} (${objConfig.type}, STATIC)`);
                        } catch (error) {
                            console.warn(`[Legozo] Failed to enable physics on ${mesh.name}:`, error);
                        }
                    }

                    console.log(`[Legozo] Enabled collision on: ${mesh.name}`);
                }

                if (interactionPlugin) {
                    // Make mesh hoverable (highlight on hover)
                    interactionPlugin.makeHoverable(mesh, {
                        onHoverEnter: () => {
                            console.log(`[Legozo] Hovering over: ${mesh.name}`);
                        },
                        onHoverExit: () => {
                            console.log(`[Legozo] Hover exit: ${mesh.name}`);
                        }
                    });

                    // Register click handler (show properties on click)
                    interactionPlugin.onClick(mesh, (clickedMesh, event) => {
                        console.log(`[Legozo] Clicked: ${clickedMesh.name}`);
                        if (propertiesPlugin && propertiesPlugin.showProperties) {
                            propertiesPlugin.showProperties(clickedMesh);
                        }
                    });

                    // Make mesh selectable (can be selected/deselected)
                    interactionPlugin.makeSelectable(mesh);

                    // Make mesh draggable (can be moved with mouse)
                    interactionPlugin.makeDraggable(mesh, {
                        dragPlaneNormal: new BABYLON.Vector3(0, 1, 0) // Drag on XZ plane (Y-up)
                    });

                    console.log(`[Legozo] Registered ${mesh.name} with InteractionPlugin`);
                }
            }
        }

        console.log(`[Legozo] Created ${objects.length} demo objects`);
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        this.updateLoading(100, 'Complete!');

        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
        }, 500);
    }

    /**
     * Update loading progress
     * @param {number} percent - Progress percentage (0-100)
     * @param {string} text - Loading text
     */
    updateLoading(percent, text) {
        const loadingBar = document.getElementById('loadingBar');
        const loadingText = document.getElementById('loadingText');

        if (loadingBar) {
            loadingBar.style.width = `${percent}%`;
        }

        if (loadingText) {
            loadingText.textContent = text;
        }

        console.log(`[Legozo] ${percent}% - ${text}`);
    }

    /**
     * Get loaded module
     * @param {string} name - Module name
     * @returns {Object|null}
     */
    getModule(name) {
        return this.modules.get(name) || null;
    }

    /**
     * Get controller
     * @param {string} name - Controller name
     * @returns {Object|null}
     */
    getController(name) {
        return this.controllers.get(name) || null;
    }

    /**
     * Dispose and cleanup
     */
    dispose() {
        // Dispose controllers
        for (const controller of this.controllers.values()) {
            controller.dispose();
        }

        // Dispose modules
        for (const module of this.modules.values()) {
            module.dispose();
        }

        // Dispose engine
        if (this.engine) {
            this.engine.dispose();
        }

        this.modules.clear();
        this.controllers.clear();
        this.templates.clearCache();

        console.log('[Legozo] Disposed');
    }
}

export default LegozoLoader;
