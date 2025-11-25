/**
 * Legozo Module Loader
 * Orchestrates loading and initialization of the 3D CMS
 *
 * Architecture:
 *   1. Load configuration
 *   2. Load CSS styles
 *   3. Load HTML templates
 *   4. Initialize core engine
 *   5. Load and initialize modules
 *   6. Start the scene
 *
 * Usage:
 *   const legozo = new LegozoLoader();
 *   await legozo.init('./config/scene-demo.json');
 *   await legozo.start();
 */

import BabylonEngine from '../src/core/BabylonEngine.js';
import ConfigLoader from '../src/config/ConfigLoader.js';
import TemplateLoader from '../ui/template-loader.js';

export class LegozoLoader {
    constructor() {
        this.config = null;
        this.engine = null;
        this.modules = new Map();
        this.templates = new TemplateLoader();
        this.loadingCallbacks = [];
    }

    /**
     * Initialize the Legozo system
     * @param {string} configPath - Path to scene configuration JSON
     * @returns {Promise<void>}
     */
    async init(configPath) {
        console.log('[Legozo] Initializing...');

        try {
            // 1. Load configuration
            await this.loadConfiguration(configPath);

            // 2. Load CSS styles
            await this.loadStyles();

            // 3. Load HTML templates
            await this.loadTemplates();

            // 4. Initialize core engine
            await this.initializeEngine();

            // 5. Load modules
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
            // Initialize modules
            await this.initializeModules();

            // Start engine
            await this.engine.start();

            // Start modules
            await this.startModules();

            // Hide loading screen
            this.hideLoadingScreen();

            console.log('[Legozo] Started successfully');
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
        const engineConfig = await ConfigLoader.load('../config/engine-config.json');
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
     * Load plugin modules
     * @returns {Promise<void>}
     */
    async loadModules() {
        this.updateLoading(50, 'Loading modules...');

        const moduleNames = this.config.modules || [];

        // Import plugins dynamically
        const imports = {
            'ground': () => import('../src/plugins/GroundPlugin.js'),
            'lighting': () => import('../src/plugins/LightingPlugin.js'),
            'shadow': () => import('../src/plugins/ShadowPlugin.js'),
            'material': () => import('../src/plugins/MaterialPlugin.js'),
            'sky': () => import('../src/plugins/SkyPlugin.js'),
            'asset': () => import('../src/plugins/AssetPlugin.js'),
            'interaction': () => import('../src/plugins/InteractionPlugin.js'),
            'ui': () => import('../src/plugins/UIPlugin.js'),
            'performance': () => import('../src/plugins/PerformancePlugin.js'),
            'gizmo': () => import('../src/plugins/GizmoPlugin.js'),
            'properties': () => import('../src/plugins/PropertiesPlugin.js'),
            'infiniteGround': () => import('../src/plugins/InfiniteGroundPlugin.js')
        };

        // Load each module
        for (const name of moduleNames) {
            if (imports[name]) {
                const module = await imports[name]();
                const PluginClass = module.default;
                const plugin = new PluginClass();
                this.engine.registerPlugin(name, plugin);
                this.modules.set(name, plugin);
                console.log(`[Legozo] Loaded module: ${name}`);
            } else {
                console.warn(`[Legozo] Unknown module: ${name}`);
            }
        }

        console.log('[Legozo] Modules loaded');
    }

    /**
     * Initialize all modules
     * @returns {Promise<void>}
     */
    async initializeModules() {
        this.updateLoading(60, 'Initializing modules...');

        // Modules are initialized when registered, nothing more to do
        console.log('[Legozo] Modules initialized');
    }

    /**
     * Start all modules
     * @returns {Promise<void>}
     */
    async startModules() {
        this.updateLoading(70, 'Starting modules...');

        // Create demo objects if configured
        if (this.config.demoObjects) {
            await this.createDemoObjects();
        }

        console.log('[Legozo] Modules started');
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
     * Dispose and cleanup
     */
    dispose() {
        if (this.engine) {
            this.engine.dispose();
        }

        this.modules.clear();
        this.templates.clearCache();

        console.log('[Legozo] Disposed');
    }
}

export default LegozoLoader;
