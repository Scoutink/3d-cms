/**
 * @file physics.controller.js
 * @description Physics UI Controller - Handles physics panel interactions
 *
 * This controller manages the physics control panel UI including:
 * - Gravity preset switching
 * - Custom gravity values
 * - Collision mode selection
 * - Camera physics toggles
 * - Debug visualization controls
 *
 * Follows the modular architecture pattern used by GroundController
 *
 * @author Development Team
 * @created 2025-11-25
 */

import UIControllerBase from '../../ui/UIControllerBase.js';

class PhysicsController extends UIControllerBase {
    constructor(physicsModule) {
        super();

        this.physicsModule = physicsModule;
        this.scene = physicsModule.scene;
        this.config = physicsModule.config;

        // UI state
        this.panelElement = null;
        this.customGravityVisible = false;

        this.init();
    }

    /**
     * Initialize controller
     */
    init() {
        // Find physics panel element
        this.panelElement = document.getElementById('physicsPanel');

        if (!this.panelElement) {
            console.warn('[PhysicsController] Physics panel not found in DOM');
            return;
        }

        // Setup event listeners
        this.setupEventListeners();

        // Update UI to match current state
        this.updateUI();

        console.log('[PhysicsController] Initialized');
    }

    /**
     * Define action handlers for data-action attributes
     * @returns {Object} Action handlers
     */
    getActions() {
        return {
            // Physics toggle
            'physics:toggle:enabled': (e) => this.togglePhysics(e.target.checked),

            // Gravity presets
            'physics:gravity:preset': (e, data) => this.setGravityPreset(data.value),
            'physics:gravity:y:increase': (e, data) => this.adjustGravityY(parseFloat(data.step)),
            'physics:gravity:y:decrease': (e, data) => this.adjustGravityY(-parseFloat(data.step)),

            // Collision mode
            'physics:collision:mode': (e) => this.setCollisionMode(e.target.value),

            // Camera physics
            'physics:camera:collision': (e) => this.toggleCameraCollision(e.target.checked),
            'physics:camera:gravity': (e) => this.toggleCameraGravity(e.target.checked),
            'physics:camera:height': (e, data) => this.setCameraHeight(parseFloat(data.value)),

            // Debug
            'physics:debug:colliders': (e) => this.toggleDebugColliders(e.target.checked),
            'physics:debug:forces': (e) => this.toggleDebugForces(e.target.checked),

            // Panel controls
            'physics:panel:collapse': (e) => this.togglePanelCollapse()
        };
    }

    // ==================== PHYSICS CONTROLS ====================

    /**
     * Toggle physics on/off
     * @param {boolean} enabled
     */
    togglePhysics(enabled) {
        this.physicsModule.togglePhysics(enabled);
        this.showSuccess(`Physics: ${enabled ? 'ON' : 'OFF'}`);
    }

    /**
     * Set gravity preset
     * @param {string} preset - Preset name
     */
    setGravityPreset(preset) {
        this.physicsModule.setGravityPreset(preset);

        // Update UI - highlight active button
        this.updateGravityButtons(preset);

        // Show/hide custom gravity controls
        const customDiv = document.getElementById('customGravityControls');
        if (customDiv) {
            customDiv.style.display = preset === 'custom' ? 'block' : 'none';
            this.customGravityVisible = preset === 'custom';
        }

        this.showSuccess(`Gravity: ${preset}`);
    }

    /**
     * Adjust custom gravity Y value
     * @param {number} delta - Amount to change
     */
    adjustGravityY(delta) {
        const input = document.getElementById('gravityYValue');
        if (!input) return;

        const current = parseFloat(input.value) || -9.81;
        const newValue = current + delta;

        input.value = newValue.toFixed(2);

        // Apply custom gravity
        this.physicsModule.setCustomGravity(0, newValue, 0);

        // Update preset buttons
        this.updateGravityButtons('custom');
    }

    /**
     * Set collision mode
     * @param {string} mode - 'hybrid', 'physics', or 'babylon'
     */
    setCollisionMode(mode) {
        this.physicsModule.setCollisionMode(mode);
        this.showSuccess(`Collision Mode: ${mode}`);
    }

    // ==================== CAMERA CONTROLS ====================

    /**
     * Toggle camera collision
     * @param {boolean} enabled
     */
    toggleCameraCollision(enabled) {
        const camera = this.scene.activeCamera;
        if (camera) {
            camera.checkCollisions = enabled;
            this.showSuccess(`Camera Collision: ${enabled ? 'ON' : 'OFF'}`);
        }
    }

    /**
     * Toggle camera gravity
     * @param {boolean} enabled
     */
    toggleCameraGravity(enabled) {
        const camera = this.scene.activeCamera;
        if (camera) {
            camera.applyGravity = enabled;
            this.showSuccess(`Camera Gravity: ${enabled ? 'ON' : 'OFF'}`);
        }
    }

    /**
     * Set camera height (ellipsoid Y)
     * @param {number} height
     */
    setCameraHeight(height) {
        const camera = this.scene.activeCamera;
        if (camera && camera.ellipsoid) {
            camera.ellipsoid.y = height;

            // Update display
            const display = document.getElementById('cameraHeightValue');
            if (display) {
                display.textContent = `${height.toFixed(1)}m`;
            }
        }
    }

    // ==================== DEBUG CONTROLS ====================

    /**
     * Toggle collision shape visualization
     * @param {boolean} enabled
     */
    toggleDebugColliders(enabled) {
        this.physicsModule.setDebugMode(enabled, this.debugForces);
        this.debugColliders = enabled;
        this.showSuccess(`Debug Colliders: ${enabled ? 'ON' : 'OFF'}`);
    }

    /**
     * Toggle force vector visualization
     * @param {boolean} enabled
     */
    toggleDebugForces(enabled) {
        this.physicsModule.setDebugMode(this.debugColliders, enabled);
        this.debugForces = enabled;
        this.showSuccess(`Debug Forces: ${enabled ? 'ON' : 'OFF'}`);
    }

    // ==================== UI UPDATES ====================

    /**
     * Update UI to match current physics state
     */
    updateUI() {
        const stats = this.physicsModule.getStats();

        // Update gravity preset buttons
        this.updateGravityButtons(stats.gravityPreset);

        // Update collision mode dropdown
        const collisionSelect = document.getElementById('collisionMode');
        if (collisionSelect) {
            collisionSelect.value = stats.collisionMode;
        }

        // Update camera settings
        const camera = this.scene.activeCamera;
        if (camera) {
            const collisionCheckbox = document.getElementById('cameraCollision');
            const gravityCheckbox = document.getElementById('cameraGravity');

            if (collisionCheckbox) {
                collisionCheckbox.checked = camera.checkCollisions || false;
            }

            if (gravityCheckbox) {
                gravityCheckbox.checked = camera.applyGravity || false;
            }

            if (camera.ellipsoid) {
                const heightSlider = document.getElementById('cameraHeight');
                const heightDisplay = document.getElementById('cameraHeightValue');

                if (heightSlider) {
                    heightSlider.value = camera.ellipsoid.y;
                }

                if (heightDisplay) {
                    heightDisplay.textContent = `${camera.ellipsoid.y.toFixed(1)}m`;
                }
            }
        }

        console.log('[PhysicsController] UI updated');
    }

    /**
     * Update gravity preset button states
     * @param {string} activePreset
     */
    updateGravityButtons(activePreset) {
        const buttons = this.panelElement.querySelectorAll('[data-action="physics:gravity:preset"]');

        buttons.forEach(button => {
            const preset = button.getAttribute('data-value');
            if (preset === activePreset) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    /**
     * Toggle panel collapse/expand
     */
    togglePanelCollapse() {
        if (!this.panelElement) return;

        const body = this.panelElement.querySelector('.panel-body');
        const button = this.panelElement.querySelector('.collapse-btn');

        if (body && button) {
            const isCollapsed = body.style.display === 'none';

            body.style.display = isCollapsed ? 'block' : 'none';
            button.textContent = isCollapsed ? '−' : '+';
        }
    }

    /**
     * Show success message
     * @param {string} message
     */
    showSuccess(message) {
        console.log(`[PhysicsController] ${message}`);

        // TODO: Show toast notification
        // For now, just log to console
    }

    /**
     * Show error message
     * @param {string} message
     */
    showError(message) {
        console.error(`[PhysicsController] ${message}`);

        // TODO: Show error notification
    }

    /**
     * Dispose controller
     */
    dispose() {
        console.log('[PhysicsController] Disposing...');

        super.dispose();
    }
}

export default PhysicsController;
