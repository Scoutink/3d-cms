/**
 * MouseSource - Mouse input handler with Babylon.js integration
 *
 * @class MouseSource
 * @extends InputSource
 *
 * @description
 * Listens to mouse events and integrates with Babylon.js for 3D picking.
 *
 * Features:
 * - Click detection (left, right, middle buttons)
 * - Mouse movement with delta tracking
 * - Mouse wheel scrolling
 * - Raycast integration for 3D object picking
 * - Pointer lock support
 * - Button state tracking
 *
 * Input Formats:
 *
 * Click:
 * {
 *     source: 'mouse',
 *     input: 'LeftClick' | 'RightClick' | 'MiddleClick',
 *     state: 'pressed' | 'released',
 *     position: { x, y },
 *     hitInfo: { hit, pickedMesh, pickedPoint, distance },
 *     originalEvent: PointerEvent
 * }
 *
 * Move:
 * {
 *     source: 'mouse',
 *     input: 'MouseMove',
 *     state: 'moved',
 *     position: { x, y },
 *     delta: { x, y },
 *     originalEvent: MouseEvent
 * }
 *
 * Wheel:
 * {
 *     source: 'mouse',
 *     input: 'MouseWheel',
 *     state: 'scrolled',
 *     value: number (deltaY),
 *     originalEvent: WheelEvent
 * }
 *
 * @example
 * const mouseSource = new MouseSource(inputManager, scene, canvas);
 *
 * @tags [INP.3]
 * @version 1.0.0
 */

import InputSource from './InputSource.js';

export default class MouseSource extends InputSource {
    /**
     * [INP.3] Constructor - Initialize mouse listeners
     *
     * @param {InputManager} inputManager - Reference to InputManager
     * @param {BABYLON.Scene} scene - Babylon.js scene for raycasting
     * @param {HTMLCanvasElement} canvas - Render canvas
     */
    constructor(inputManager, scene, canvas) {
        super(inputManager, 'mouse');

        // [INP.3.1] Core references
        this.scene = scene;
        this.canvas = canvas;

        // [INP.3.2] Mouse state
        this.position = { x: 0, y: 0 };
        this.deltaPosition = { x: 0, y: 0 };
        this.buttons = new Set(); // Currently pressed buttons

        // [INP.3.3] Bind event handlers
        this.handlePointer = this.handlePointer.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleWheel = this.handleWheel.bind(this);

        // [INP.3.4] Register Babylon.js pointer observable
        if (this.scene) {
            this.pointerObserver = this.scene.onPointerObservable.add(
                this.handlePointer
            );
        }

        // [INP.3.5] Register DOM event listeners
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });

        console.log('[INP.3] MouseSource ready');
    }

    /**
     * [INP.3] Handle Babylon.js pointer events
     *
     * Babylon's pointer system gives us clicks and raycast results.
     *
     * @param {BABYLON.PointerInfo} pointerInfo - Babylon pointer info
     */
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
                // We handle movement via DOM mousemove for smoother tracking
                break;
        }
    }

    /**
     * [INP.3] Handle pointer down (mouse button press)
     *
     * @param {BABYLON.PointerInfo} pointerInfo - Babylon pointer info
     */
    handlePointerDown(pointerInfo) {
        const event = pointerInfo.event;
        const button = event.button;
        const buttonName = this.getButtonName(button);

        // [INP.3.1] Track button state
        this.buttons.add(buttonName);

        // [INP.3.2] Perform raycast to get 3D hit info
        const pickInfo = this.scene.pick(
            this.scene.pointerX,
            this.scene.pointerY
        );

        // [INP.3.3] Send to InputManager
        this.sendInput({
            source: 'mouse',
            input: buttonName,
            state: 'pressed',
            position: {
                x: this.scene.pointerX,
                y: this.scene.pointerY
            },
            hitInfo: {
                hit: pickInfo.hit,
                pickedMesh: pickInfo.pickedMesh,
                pickedPoint: pickInfo.pickedPoint,
                distance: pickInfo.distance,
                faceId: pickInfo.faceId,
                normal: pickInfo.getNormal ? pickInfo.getNormal() : null
            },
            originalEvent: event
        });
    }

    /**
     * [INP.3] Handle pointer up (mouse button release)
     *
     * @param {BABYLON.PointerInfo} pointerInfo - Babylon pointer info
     */
    handlePointerUp(pointerInfo) {
        const event = pointerInfo.event;
        const button = event.button;
        const buttonName = this.getButtonName(button);

        // [INP.3.1] Remove from button state
        this.buttons.delete(buttonName);

        // [INP.3.2] Send to InputManager
        this.sendInput({
            source: 'mouse',
            input: buttonName,
            state: 'released',
            position: {
                x: this.scene.pointerX,
                y: this.scene.pointerY
            },
            originalEvent: event
        });
    }

    /**
     * [INP.3] Handle mouse move
     *
     * Using DOM mousemove instead of Babylon's for smoother tracking.
     *
     * IMPORTANT: Only sends MouseMove when a mouse button is held.
     * This prevents unwanted camera rotation when just moving the cursor.
     *
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseMove(event) {
        // [INP.3.1] Update position
        const previousPosition = { ...this.position };
        this.position.x = event.clientX;
        this.position.y = event.clientY;

        // [INP.3.2] Calculate delta (movement since last frame)
        this.deltaPosition.x = event.movementX;
        this.deltaPosition.y = event.movementY;

        // [INP.3.3] Only send MouseMove if a button is held down
        // This enables click+drag behavior instead of free mouse look
        if (this.buttons.size === 0) {
            // No buttons pressed, don't send movement
            return;
        }

        // [INP.3.4] Determine which button is held
        // RightClick = camera rotation (standard 3D editor behavior)
        // LeftClick = selection/drag
        // MiddleClick = pan
        let heldButton = null;
        if (this.buttons.has('RightClick')) {
            heldButton = 'RightClick';
        } else if (this.buttons.has('MiddleClick')) {
            heldButton = 'MiddleClick';
        } else if (this.buttons.has('LeftClick')) {
            heldButton = 'LeftClick';
        }

        // [INP.3.5] Send to InputManager with button info
        this.sendInput({
            source: 'mouse',
            input: 'MouseMove',
            state: 'moved',
            position: { ...this.position },
            delta: { ...this.deltaPosition },
            previousPosition: previousPosition,
            heldButton: heldButton,  // Which button is held during movement
            originalEvent: event
        });
    }

    /**
     * [INP.3] Handle mouse wheel
     *
     * @param {WheelEvent} event - Wheel event
     */
    handleWheel(event) {
        // [INP.3.1] Prevent default (stop page scroll)
        event.preventDefault();

        // [INP.3.2] Send to InputManager
        // deltaY is positive when scrolling down, negative when up
        this.sendInput({
            source: 'mouse',
            input: 'MouseWheel',
            state: 'scrolled',
            value: event.deltaY,  // Amount scrolled
            delta: {
                x: event.deltaX,
                y: event.deltaY,
                z: event.deltaZ
            },
            mode: event.deltaMode,  // 0 = pixels, 1 = lines, 2 = pages
            originalEvent: event
        });
    }

    /**
     * [INP.3] Convert button number to name
     *
     * @param {number} button - Button number (0, 1, 2, ...)
     * @returns {string} Button name
     */
    getButtonName(button) {
        switch (button) {
            case 0: return 'LeftClick';
            case 1: return 'MiddleClick';
            case 2: return 'RightClick';
            case 3: return 'Button3';
            case 4: return 'Button4';
            default: return `Button${button}`;
        }
    }

    /**
     * [INP.3] Check if a button is currently pressed
     *
     * @param {string} buttonName - Button name ('LeftClick', etc.)
     * @returns {boolean}
     */
    isButtonPressed(buttonName) {
        return this.buttons.has(buttonName);
    }

    /**
     * [INP.3] Get all currently pressed buttons
     *
     * @returns {Set<string>}
     */
    getPressedButtons() {
        return new Set(this.buttons);
    }

    /**
     * [INP.3] Get current mouse position
     *
     * @returns {Object} Position { x, y }
     */
    getPosition() {
        return { ...this.position };
    }

    /**
     * [INP.3] Get last mouse delta
     *
     * @returns {Object} Delta { x, y }
     */
    getDelta() {
        return { ...this.deltaPosition };
    }

    /**
     * [INP.3] Request pointer lock (for FPS-style camera)
     *
     * @returns {Promise}
     */
    async requestPointerLock() {
        try {
            await this.canvas.requestPointerLock();
            console.log('[INP.3] Pointer lock acquired');
        } catch (e) {
            console.error('[INP.3] Pointer lock failed:', e);
        }
    }

    /**
     * [INP.3] Exit pointer lock
     */
    exitPointerLock() {
        if (document.pointerLockElement === this.canvas) {
            document.exitPointerLock();
            console.log('[INP.3] Pointer lock released');
        }
    }

    /**
     * [INP.3] Check if pointer is locked
     *
     * @returns {boolean}
     */
    isPointerLocked() {
        return document.pointerLockElement === this.canvas;
    }

    /**
     * [INP.3] Dispose and cleanup
     */
    dispose() {
        // [INP.3.1] Remove Babylon observer
        if (this.scene && this.pointerObserver) {
            this.scene.onPointerObservable.remove(this.pointerObserver);
            this.pointerObserver = null;
        }

        // [INP.3.2] Remove DOM event listeners
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('wheel', this.handleWheel);

        // [INP.3.3] Clear button state
        this.buttons.clear();

        // [INP.3.4] Exit pointer lock if active
        this.exitPointerLock();

        // [INP.3.5] Call parent dispose
        super.dispose();

        console.log('[INP.3] MouseSource disposed');
    }
}
