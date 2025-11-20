/**
 * @file GroundPlugin.js
 * @description Ground/terrain system with rotation, sizing, and edge behaviors
 *
 * @tags [GRD.*] Ground system
 * @primary-tags [GRD] Ground plugin
 *
 * @dependencies
 *   - [GRD -> PLG] Extends Plugin base class
 *   - [GRD -> CFG] Uses configuration
 *   - [GRD -> EVT] Emits ground events
 *   - [GRD -> MAT] Works with MaterialPlugin
 *   - [GRD -> COL] Collision detection
 *
 * @affects
 *   - [GRD -> CAM] Ground rotation affects camera orientation
 *   - [GRD -> MOV] Edge behavior affects movement
 *   - [GRD -> PHY] Ground physics properties
 *
 * @features
 *   - Ground types: plane, grid, heightmap
 *   - Rotation/tilt (USER REQ: 3D website use case!)
 *   - Size modes: fixed, device-relative
 *   - Edge behaviors: stop, teleport, wrap, custom
 *   - Material support
 *   - Collision and physics
 *
 * @user-requirements
 *   1. Ground rotation/tilt for 3D websites
 *   2. Fixed and procedural sizing (procedural in Phase 3)
 *   3. Device-relative sizing
 *   4. Edge behaviors (stop, teleport)
 *
 * @author Development Team
 * @created 2025-11-20
 */

import Plugin from '../core/Plugin.js';

// [GRD] Ground plugin
// [GRD] USER REQUIREMENT: Rotation for 3D websites, edge behaviors
class GroundPlugin extends Plugin {
    constructor() {
        super('ground');

        // [GRD.1] Ground mesh
        this.ground = null;

        // [GRD.2] Size configuration
        this.sizeMode = 'fixed';
        this.width = 100;
        this.height = 100;

        // [GRD.3] Rotation configuration
        // USER REQUIREMENT: For 3D websites (vertical/tilted layouts)
        this.rotation = { x: 0, y: 0, z: 0 };
        this.rotationPresets = {
            horizontal: { x: 0, y: 0, z: 0 },              // Default
            vertical: { x: Math.PI / 2, y: 0, z: 0 },      // Wall-like
            diagonal45: { x: Math.PI / 4, y: 0, z: Math.PI / 4 }  // 45° tilt
        };

        // [GRD.4] Edge behavior configuration
        // USER REQUIREMENT: Camera behavior at ground edges
        this.edgeBehavior = 'stop';  // 'stop', 'teleport', 'wrap', 'custom'
        this.edgeCallback = null;
        this.teleportPosition = { x: 0, y: 2, z: 0 };

        // [GRD.5] Material configuration
        this.material = null;

        // [GRD] Type
        this.groundType = 'plane';

        // [GRD] State
        this.collisionEnabled = true;
        this.physicsEnabled = false;

        console.log('[GRD] GroundPlugin initialized');
    }

    // [PLG.1.2] Initialize plugin
    init(scene, events, config) {
        super.init(scene, events, config);

        // [CFG.2] Load ground configuration
        const groundConfig = config.ground || {};

        this.groundType = groundConfig.type || 'plane';
        this.sizeMode = groundConfig.sizeMode || 'fixed';
        this.width = groundConfig.width || 100;
        this.height = groundConfig.height || 100;
        this.rotation = groundConfig.rotation || { x: 0, y: 0, z: 0 };
        this.edgeBehavior = groundConfig.edgeBehavior || 'stop';
        this.collisionEnabled = groundConfig.collision !== false;

        // [GRD.4.2] Teleport position
        if (groundConfig.teleportPosition) {
            this.teleportPosition = groundConfig.teleportPosition;
        }

        console.log('[GRD] Ground configuration loaded');
    }

    // [PLG.2.1] Start plugin
    start() {
        // [GRD.1] Create ground
        this.createGround(this.groundType);

        // [GRD.3] Apply rotation if specified
        if (this.rotation.x !== 0 || this.rotation.y !== 0 || this.rotation.z !== 0) {
            this.setRotation(this.rotation.x, this.rotation.y, this.rotation.z);
        }

        // [GRD.2.4] Handle device-relative sizing
        if (this.sizeMode === 'relative') {
            this.updateDeviceRelativeSize();

            // [GRD.2.4] Listen for window resize
            window.addEventListener('resize', this.updateDeviceRelativeSize.bind(this));
        }

        // [GRD.4] Start edge detection if needed
        if (this.sizeMode === 'fixed' && this.edgeBehavior !== 'none') {
            this.startEdgeDetection();
        }

        // [EVT.2] Emit ground ready event
        this.events.emit('ground:ready', {
            type: this.groundType,
            size: { width: this.width, height: this.height },
            rotation: this.rotation
        });

        console.log('[GRD] GroundPlugin started');
    }

    // [GRD.1] Create ground mesh
    createGround(type = 'plane', options = {}) {
        // Dispose existing ground
        if (this.ground) {
            this.ground.dispose();
        }

        this.groundType = type;

        switch (type) {
            case 'plane':
                this.ground = this.createPlaneGround(options);
                break;

            case 'grid':
                this.ground = this.createGridGround(options);
                break;

            case 'heightmap':
                this.ground = this.createHeightmapGround(options);
                break;

            default:
                console.warn(`[GRD.1] Unknown ground type: ${type}, using plane`);
                this.ground = this.createPlaneGround(options);
        }

        // [GRD.1] Apply common settings
        this.ground.name = 'ground';
        this.ground.metadata = this.ground.metadata || {};
        this.ground.metadata.isGround = true;

        // [COL.2] Enable collision if configured
        if (this.collisionEnabled) {
            this.ground.checkCollisions = true;
            this.ground.isPickable = true;
        }

        // [EVT.2] Emit ground created event
        this.events.emit('ground:created', {
            type: this.groundType,
            ground: this.ground
        });

        console.log(`[GRD.1] Ground created: ${type}`);

        return this.ground;
    }

    // [GRD.1.1] Create plane ground
    createPlaneGround(options = {}) {
        const width = options.width || this.width;
        const height = options.height || this.height;
        const subdivisions = options.subdivisions || 32;

        const ground = BABYLON.MeshBuilder.CreateGround(
            'ground',
            {
                width: width,
                height: height,
                subdivisions: subdivisions
            },
            this.scene
        );

        // [GRD.5] Apply default material
        this.applyDefaultMaterial(ground);

        return ground;
    }

    // [GRD.1.2] Create grid ground (for editor visualization)
    createGridGround(options = {}) {
        const width = options.width || this.width;
        const height = options.height || this.height;
        const subdivisions = options.subdivisions || 20;

        const ground = BABYLON.MeshBuilder.CreateGround(
            'ground',
            {
                width: width,
                height: height,
                subdivisions: subdivisions
            },
            this.scene
        );

        // [GRD.5] Grid material
        const material = new BABYLON.StandardMaterial('gridMaterial', this.scene);
        material.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        material.wireframe = true;
        ground.material = material;

        return ground;
    }

    // [GRD.1.3] Create heightmap ground (terrain from image)
    createHeightmapGround(options = {}) {
        const width = options.width || this.width;
        const height = options.height || this.height;
        const subdivisions = options.subdivisions || 100;
        const minHeight = options.minHeight || 0;
        const maxHeight = options.maxHeight || 10;
        const url = options.url;

        if (!url) {
            console.error('[GRD.1.3] Heightmap URL required');
            return this.createPlaneGround(options);
        }

        const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
            'ground',
            url,
            {
                width: width,
                height: height,
                subdivisions: subdivisions,
                minHeight: minHeight,
                maxHeight: maxHeight,
                onReady: () => {
                    // [GRD.5] Apply default material
                    this.applyDefaultMaterial(ground);

                    // [EVT.2] Emit heightmap ready
                    this.events.emit('ground:heightmap:ready', { ground });
                }
            },
            this.scene
        );

        return ground;
    }

    // [GRD.3] Set ground rotation
    // USER REQUIREMENT: For 3D website layouts (vertical/tilted grounds)
    setRotation(x, y, z) {
        if (!this.ground) {
            console.warn('[GRD.3] No ground to rotate');
            return;
        }

        this.rotation = { x, y, z };

        this.ground.rotation.x = x;
        this.ground.rotation.y = y;
        this.ground.rotation.z = z;

        // [EVT.2] Emit rotation changed event
        this.events.emit('ground:rotation:changed', {
            rotation: this.rotation,
            ground: this.ground
        });

        console.log(`[GRD.3] Ground rotation set: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);
    }

    // [GRD.3] Use rotation preset
    // USER REQUIREMENT: Quick presets for common use cases
    useRotationPreset(preset) {
        const rotation = this.rotationPresets[preset];

        if (!rotation) {
            console.warn(`[GRD.3] Unknown rotation preset: ${preset}`);
            return;
        }

        this.setRotation(rotation.x, rotation.y, rotation.z);

        console.log(`[GRD.3] Rotation preset applied: ${preset}`);
    }

    // [GRD.3] Get current rotation
    getRotation() {
        return { ...this.rotation };
    }

    // [GRD.2] Set size mode
    setSizeMode(mode, options = {}) {
        this.sizeMode = mode;

        switch (mode) {
            case 'fixed':
                this.width = options.width || this.width;
                this.height = options.height || this.height;
                break;

            case 'relative':
                // Device-relative sizing
                this.updateDeviceRelativeSize(options);
                break;

            default:
                console.warn(`[GRD.2] Unknown size mode: ${mode}`);
        }

        // Recreate ground with new size
        if (this.ground) {
            this.createGround(this.groundType);
            this.setRotation(this.rotation.x, this.rotation.y, this.rotation.z);
        }

        console.log(`[GRD.2] Size mode set: ${mode}`);
    }

    // [GRD.2.4] Update device-relative size
    updateDeviceRelativeSize(options = {}) {
        const widthMultiplier = options.widthMultiplier || 2.0;
        const heightMultiplier = options.heightMultiplier || 2.0;

        // Calculate based on viewport
        const canvas = this.scene.getEngine().getRenderingCanvas();
        const viewportWidth = canvas.clientWidth;
        const viewportHeight = canvas.clientHeight;

        this.width = (viewportWidth / 100) * widthMultiplier * 50;
        this.height = (viewportHeight / 100) * heightMultiplier * 50;

        console.log(`[GRD.2.4] Device-relative size: ${this.width.toFixed(0)} x ${this.height.toFixed(0)}`);
    }

    // [GRD.2] Get current size
    getSize() {
        return {
            width: this.width,
            height: this.height,
            mode: this.sizeMode
        };
    }

    // [GRD.4] Set edge behavior
    // USER REQUIREMENT: Camera behavior at ground edges
    setEdgeBehavior(behavior, options = {}) {
        this.edgeBehavior = behavior;

        if (behavior === 'teleport' && options.returnPosition) {
            this.teleportPosition = options.returnPosition;
        }

        if (behavior === 'custom' && options.callback) {
            this.edgeCallback = options.callback;
        }

        // Start/stop edge detection
        if (behavior !== 'none' && this.sizeMode === 'fixed') {
            this.startEdgeDetection();
        } else {
            this.stopEdgeDetection();
        }

        console.log(`[GRD.4] Edge behavior set: ${behavior}`);
    }

    // [GRD.4] Start edge detection
    startEdgeDetection() {
        if (this.edgeDetectionObserver) {
            return; // Already started
        }

        // [GRD.4] Check edges every frame
        this.edgeDetectionObserver = this.scene.onBeforeRenderObservable.add(() => {
            this.checkCameraEdge();
        });

        console.log('[GRD.4] Edge detection started');
    }

    // [GRD.4] Stop edge detection
    stopEdgeDetection() {
        if (this.edgeDetectionObserver) {
            this.scene.onBeforeRenderObservable.remove(this.edgeDetectionObserver);
            this.edgeDetectionObserver = null;
            console.log('[GRD.4] Edge detection stopped');
        }
    }

    // [GRD.4] Check if camera is at edge
    // USER REQUIREMENT: Handle camera reaching ground boundaries
    checkCameraEdge() {
        const camera = this.scene.activeCamera;
        if (!camera || this.sizeMode !== 'fixed') {
            return;
        }

        const pos = camera.position;
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        let edgeReached = null;

        // Check boundaries
        if (pos.x > halfWidth) edgeReached = 'east';
        else if (pos.x < -halfWidth) edgeReached = 'west';
        else if (pos.z > halfHeight) edgeReached = 'north';
        else if (pos.z < -halfHeight) edgeReached = 'south';

        if (edgeReached) {
            this.handleEdgeReached(camera, edgeReached);
        }
    }

    // [GRD.4] Handle edge reached
    handleEdgeReached(camera, edge) {
        // [EVT.2] Emit edge reached event
        this.events.emit('ground:edge:reached', {
            edge: edge,
            position: camera.position.clone()
        });

        switch (this.edgeBehavior) {
            case 'stop':
                // [GRD.4.1] Stop at edge (clamp position)
                this.stopCameraAtEdge(camera, edge);
                break;

            case 'teleport':
                // [GRD.4.2] Teleport back to start
                this.teleportCamera(camera);
                break;

            case 'wrap':
                // [GRD.4.3] Wrap to opposite edge (Pac-Man style)
                this.wrapCameraAround(camera, edge);
                break;

            case 'custom':
                // [GRD.4.4] Custom callback
                if (this.edgeCallback) {
                    this.edgeCallback(camera, edge);
                }
                break;
        }
    }

    // [GRD.4.1] Stop camera at edge
    stopCameraAtEdge(camera, edge) {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        const buffer = 0.5; // Small buffer to prevent jitter

        switch (edge) {
            case 'east':
                camera.position.x = halfWidth - buffer;
                break;
            case 'west':
                camera.position.x = -halfWidth + buffer;
                break;
            case 'north':
                camera.position.z = halfHeight - buffer;
                break;
            case 'south':
                camera.position.z = -halfHeight + buffer;
                break;
        }
    }

    // [GRD.4.2] Teleport camera to start
    teleportCamera(camera) {
        camera.position.x = this.teleportPosition.x;
        camera.position.y = this.teleportPosition.y;
        camera.position.z = this.teleportPosition.z;

        // [EVT.2] Emit teleport event
        this.events.emit('ground:camera:teleported', {
            position: camera.position.clone()
        });

        console.log('[GRD.4.2] Camera teleported to start');
    }

    // [GRD.4.3] Wrap camera to opposite edge
    wrapCameraAround(camera, edge) {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        switch (edge) {
            case 'east':
                camera.position.x = -halfWidth + 1;
                break;
            case 'west':
                camera.position.x = halfWidth - 1;
                break;
            case 'north':
                camera.position.z = -halfHeight + 1;
                break;
            case 'south':
                camera.position.z = halfHeight - 1;
                break;
        }

        // [EVT.2] Emit wrap event
        this.events.emit('ground:camera:wrapped', {
            edge: edge,
            position: camera.position.clone()
        });
    }

    // [GRD.5] Apply default material
    applyDefaultMaterial(mesh) {
        const material = new BABYLON.StandardMaterial('defaultGroundMaterial', this.scene);

        // [MAT.2] Default ground colors (brown/dirt)
        material.diffuseColor = new BABYLON.Color3(0.55, 0.45, 0.33);
        material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        material.specularPower = 16;

        mesh.material = material;
        this.material = material;
    }

    // [GRD.5] Set ground material
    setMaterial(material) {
        if (!this.ground) {
            console.warn('[GRD.5] No ground to apply material');
            return;
        }

        this.ground.material = material;
        this.material = material;

        console.log('[GRD.5] Ground material updated');
    }

    // [GRD.5] Set ground color
    setColor(color) {
        if (!this.ground || !this.ground.material) {
            console.warn('[GRD.5] No ground or material to set color');
            return;
        }

        const material = this.ground.material;

        if (color instanceof BABYLON.Color3) {
            material.diffuseColor = color;
        } else {
            material.diffuseColor = BABYLON.Color3.FromHexString(color);
        }

        console.log('[GRD.5] Ground color updated');
    }

    // [GRD.5] Set ground texture
    setTexture(url, tiling = { u: 1, v: 1 }) {
        if (!this.ground || !this.ground.material) {
            console.warn('[GRD.5] No ground or material to set texture');
            return;
        }

        const material = this.ground.material;

        material.diffuseTexture = new BABYLON.Texture(url, this.scene);
        material.diffuseTexture.uScale = tiling.u;
        material.diffuseTexture.vScale = tiling.v;

        console.log('[GRD.5] Ground texture applied');
    }

    // [GRD.6] Enable collision
    enableCollision() {
        if (!this.ground) return;

        this.ground.checkCollisions = true;
        this.ground.isPickable = true;
        this.collisionEnabled = true;

        console.log('[GRD.6] Ground collision enabled');
    }

    // [GRD.6] Disable collision
    disableCollision() {
        if (!this.ground) return;

        this.ground.checkCollisions = false;
        this.ground.isPickable = false;
        this.collisionEnabled = false;

        console.log('[GRD.6] Ground collision disabled');
    }

    // [GRD] Get ground mesh
    getGround() {
        return this.ground;
    }

    // [GRD] Reset to defaults
    reset() {
        this.setRotation(0, 0, 0);
        this.setSizeMode('fixed', { width: 100, height: 100 });
        this.setEdgeBehavior('stop');

        console.log('[GRD] Ground reset to defaults');
    }

    // [PLG.4] Dispose plugin
    dispose() {
        // Stop edge detection
        this.stopEdgeDetection();

        // Dispose ground
        if (this.ground) {
            this.ground.dispose();
            this.ground = null;
        }

        // Dispose material
        if (this.material) {
            this.material.dispose();
            this.material = null;
        }

        super.dispose();

        console.log('[GRD] GroundPlugin disposed');
    }
}

// [GRD] Export for registration with engine
export default GroundPlugin;
