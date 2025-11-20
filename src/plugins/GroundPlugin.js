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
        this.rotateFullScene = true; // USER REQUIREMENT: Rotate all objects with ground
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
        this.edgeDetectionObserver = null;
        this.boundaryWalls = null; // Invisible walls for 'stop' behavior

        // [GRD.5] Material configuration
        this.material = null;
        this.textureMode = 'tiled'; // 'tiled', 'stretched', 'centered'
        this.textureOptions = {};

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

            // [GRD.4.5] Create invisible boundary walls for 'stop' behavior
            if (this.edgeBehavior === 'stop') {
                this.createBoundaryWalls();
            }
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
    setRotation(x, y, z, rotateFullScene = this.rotateFullScene) {
        if (!this.ground) {
            console.warn('[GRD.3] No ground to rotate');
            return;
        }

        const oldRotation = { ...this.rotation };
        this.rotation = { x, y, z };

        this.ground.rotation.x = x;
        this.ground.rotation.y = y;
        this.ground.rotation.z = z;

        // [GRD.3.1] Rotate full scene if enabled
        // USER REQUIREMENT: All objects maintain relative position to ground
        if (rotateFullScene) {
            this.rotateSceneObjects(oldRotation, this.rotation);
        }

        // [EVT.2] Emit rotation changed event
        this.events.emit('ground:rotation:changed', {
            rotation: this.rotation,
            ground: this.ground,
            fullScene: rotateFullScene
        });

        console.log(`[GRD.3] Ground rotation set: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}) ${rotateFullScene ? '(full scene)' : ''}`);
    }

    // [GRD.3.1] Rotate all scene objects to maintain relative position to ground
    // USER REQUIREMENT: When ground rotates, objects follow
    rotateSceneObjects(oldRotation, newRotation) {
        if (!this.scene) return;

        // Calculate rotation delta
        const deltaX = newRotation.x - oldRotation.x;
        const deltaY = newRotation.y - oldRotation.y;
        const deltaZ = newRotation.z - oldRotation.z;

        // Get all meshes except ground, camera, and boundary walls
        const objectsToRotate = this.scene.meshes.filter(mesh => {
            if (!mesh) return false;
            if (mesh === this.ground) return false;
            if (mesh.name === 'camera') return false;
            if (mesh.name.startsWith('boundaryWall_')) return false;
            if (mesh.metadata?.excludeFromGroundRotation) return false;
            return true;
        });

        objectsToRotate.forEach(mesh => {
            // Store original position relative to ground
            const relativePos = mesh.position.clone();

            // Create rotation transformation around ground center
            const rotationMatrix = BABYLON.Matrix.RotationYawPitchRoll(deltaY, deltaX, deltaZ);

            // Apply rotation to position (rotate around origin)
            const newPos = BABYLON.Vector3.TransformCoordinates(relativePos, rotationMatrix);
            mesh.position = newPos;

            // Rotate the object itself to maintain orientation relative to ground
            mesh.rotation.x += deltaX;
            mesh.rotation.y += deltaY;
            mesh.rotation.z += deltaZ;
        });

        console.log(`[GRD.3.1] Rotated ${objectsToRotate.length} scene objects with ground`);
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

    // [GRD.3.2] Set rotate full scene option
    // USER REQUIREMENT: Toggle whether ground rotation affects all objects
    setRotateFullScene(enabled) {
        this.rotateFullScene = enabled;
        console.log(`[GRD.3.2] Rotate full scene: ${enabled ? 'enabled' : 'disabled'}`);

        // [EVT.2] Emit setting changed event
        this.events.emit('ground:rotate_full_scene:changed', {
            enabled
        });
    }

    // [GRD.3.2] Get rotate full scene setting
    getRotateFullScene() {
        return this.rotateFullScene;
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

        // Dispose existing boundary walls if switching away from 'stop'
        if (behavior !== 'stop' && this.boundaryWalls) {
            this.boundaryWalls.forEach(wall => wall.dispose());
            this.boundaryWalls = null;
        }

        // Start/stop edge detection
        if (behavior !== 'none' && this.sizeMode === 'fixed') {
            this.startEdgeDetection();

            // Create boundary walls for 'stop' behavior
            if (behavior === 'stop') {
                this.createBoundaryWalls();
            }
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

    // [GRD.4.5] Create invisible boundary walls
    // Prevents camera from falling off ground edges
    createBoundaryWalls() {
        if (this.boundaryWalls) {
            // Already created, dispose old walls
            this.boundaryWalls.forEach(wall => wall.dispose());
        }

        this.boundaryWalls = [];

        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        const wallHeight = 20; // Tall enough to block camera
        const wallThickness = 0.1; // Very thin

        // Create 4 walls (north, south, east, west)
        const wallConfigs = [
            { name: 'north', width: this.width, height: wallHeight, depth: wallThickness, x: 0, y: wallHeight/2, z: halfHeight },
            { name: 'south', width: this.width, height: wallHeight, depth: wallThickness, x: 0, y: wallHeight/2, z: -halfHeight },
            { name: 'east', width: wallThickness, height: wallHeight, depth: this.height, x: halfWidth, y: wallHeight/2, z: 0 },
            { name: 'west', width: wallThickness, height: wallHeight, depth: this.height, x: -halfWidth, y: wallHeight/2, z: 0 }
        ];

        wallConfigs.forEach(config => {
            const wall = BABYLON.MeshBuilder.CreateBox(
                `boundaryWall_${config.name}`,
                {
                    width: config.width,
                    height: config.height,
                    depth: config.depth
                },
                this.scene
            );

            wall.position.x = config.x;
            wall.position.y = config.y;
            wall.position.z = config.z;

            // Make wall invisible but still collidable
            wall.isVisible = false;
            wall.checkCollisions = true;

            this.boundaryWalls.push(wall);
        });

        console.log('[GRD.4.5] Boundary walls created (invisible)');
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

    // [GRD.5] Set ground texture with mode
    // USER REQUIREMENT: Tiled (default), stretched, or centered texture modes
    // @param {string} url - Texture URL
    // @param {string} mode - 'tiled', 'stretched', or 'centered'
    // @param {object} options - Mode-specific options (e.g., tiling for 'tiled' mode)
    setTexture(url, mode = 'tiled', options = {}) {
        if (!this.ground || !this.ground.material) {
            console.warn('[GRD.5] No ground or material to set texture');
            return;
        }

        const material = this.ground.material;
        const texture = new BABYLON.Texture(url, this.scene);

        switch (mode) {
            case 'tiled':
                // [GRD.5.1] Tiled mode - repeat texture
                const tilingU = options.u || options.tiling?.u || 1;
                const tilingV = options.v || options.tiling?.v || 1;
                texture.uScale = tilingU;
                texture.vScale = tilingV;
                texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
                texture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
                break;

            case 'stretched':
                // [GRD.5.2] Stretched mode - fit texture to ground size once
                texture.uScale = 1;
                texture.vScale = 1;
                texture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
                texture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
                break;

            case 'centered':
                // [GRD.5.3] Centered mode - show texture at original size in center
                // Calculate scale based on ground size vs texture size
                const groundSize = Math.max(this.width, this.height);
                const centerScale = options.scale || 1; // Allow manual scaling
                texture.uScale = centerScale;
                texture.vScale = centerScale;
                texture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
                texture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
                // Center the texture using uOffset/vOffset
                texture.uOffset = (1 - texture.uScale) / 2;
                texture.vOffset = (1 - texture.vScale) / 2;
                break;

            default:
                console.warn(`[GRD.5] Unknown texture mode: ${mode}, using tiled`);
                texture.uScale = 1;
                texture.vScale = 1;
        }

        material.diffuseTexture = texture;
        this.textureMode = mode;
        this.textureOptions = options;

        console.log(`[GRD.5] Ground texture applied: ${mode} mode`);

        // [EVT.2] Emit texture changed event
        this.events.emit('ground:texture:changed', {
            url,
            mode,
            options
        });
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

        // Dispose boundary walls
        if (this.boundaryWalls) {
            this.boundaryWalls.forEach(wall => wall.dispose());
            this.boundaryWalls = null;
        }

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
