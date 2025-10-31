let canvas = document.getElementById('renderCanvas');
let engine = new BABYLON.Engine(canvas, true);
document.getElementById("engineVersion").innerText = `Babylon Version: ${BABYLON.Engine.Version}`;

let createScene = async function () {
    let scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);
    scene.collisionsEnabled = true;

    let camera = new BABYLON.UniversalCamera("PlayerCamera", new BABYLON.Vector3(0, 2, -10), scene);
    camera.attachControl(canvas, true);
    camera.applyGravity = true;
    camera.checkCollisions = true;
    camera.speed = 0.5;
    camera.ellipsoid = new BABYLON.Vector3(1, 1.5, 1);

    scene.gravity = new BABYLON.Vector3(0, -0.2, 0);
    camera.keysUp.push(87);
    camera.keysDown.push(83);
    camera.keysLeft.push(65);
    camera.keysRight.push(68);
    camera.angularSensibility = 3000;

    new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);

    let env = scene.createDefaultEnvironment({
        createSkybox: true,
        skyboxSize: 150,
        groundSize: 100
    });
    env.setMainColor(new BABYLON.Color3(0.2, 0.4, 0.6));

    if (env.ground) {
        env.ground.checkCollisions = true;
        env.ground.isPickable = true;
        env.ground.name = "terrain";

        let groundMat = new BABYLON.StandardMaterial("groundMat", scene);
        let textureURL = "dirt.jpg";
        let tex = new BABYLON.Texture(textureURL, scene);
        tex.uScale = 40;
        tex.vScale = 40;
        groundMat.diffuseTexture = tex;
        groundMat.specularColor = BABYLON.Color3.Black();
        env.ground.material = groundMat;
    }

    try {
        const havok = await HavokPhysics();
        const plugin = new BABYLON.HavokPlugin(true, havok);
        scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), plugin);
        document.getElementById("physicsStatus").innerText = "Physics: Havok enabled";

        if (env.ground) {
            new BABYLON.PhysicsAggregate(env.ground, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, scene);
        }

        let box = BABYLON.MeshBuilder.CreateBox("box", { size: 2 }, scene);
        box.position = new BABYLON.Vector3(0, 10, 0);
        box.isPickable = true;
        box.name = "cube";
        new BABYLON.PhysicsAggregate(box, BABYLON.PhysicsShapeType.BOX, { mass: 1 }, scene);
        box.checkCollisions = true;
    } catch (err) {
        console.error("Havok load error:", err);
        document.getElementById("physicsStatus").innerText = "Physics: FAILED to load";
    }

    // Click-to-move camera (left click only)
    let lastClick = 0;
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
            const evt = pointerInfo.event;
            if (evt.button === 0) { // left click only
                let pick = pointerInfo.pickInfo;
                if (pick && pick.hit && pick.pickedPoint) {
                    let now = performance.now();
                    let fast = now - lastClick < 400;
                    lastClick = now;

                    let moveTarget = pick.pickedPoint.clone();
                    moveTarget.y = camera.position.y;
                    BABYLON.Animation.CreateAndStartAnimation("camMove", camera, "position", 60, 60,
                        camera.position, moveTarget, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
                        new BABYLON.QuadraticEase());

                    // Sniper marker
                    let disc = BABYLON.MeshBuilder.CreateDisc("marker", { radius: 0.5 }, scene);
                    disc.position = pick.pickedPoint.clone();
                    disc.rotation.x = Math.PI / 2;
                    disc.material = new BABYLON.StandardMaterial("markerMat", scene);
                    disc.material.diffuseColor = BABYLON.Color3.Red();
                    disc.isPickable = false;
                    setTimeout(() => disc.dispose(), 1000);

                    if (fast) {
                        camera.speed = 1.5;
                        setTimeout(() => camera.speed = 0.5, 1000);
                    }
                }
            }
        }
    });

    // Right-click / touch-based context menu
    let menuDiv = document.createElement("div");
    menuDiv.id = "contextMenu";
    Object.assign(menuDiv.style, {
        position: "absolute",
        display: "none",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "6px",
        zIndex: 9999,
        minWidth: "160px"
    });
    document.body.appendChild(menuDiv);

    const showMenu = (x, y, pick) => {
        menuDiv.style.left = `${x}px`;
        menuDiv.style.top = `${y}px`;
        menuDiv.style.display = "block";
        const clickedName = pick?.pickedMesh?.name || "unknown";
        const pickedPoint = pick?.pickedPoint ? pick.pickedPoint.toString() : "unknown";
        const color = clickedName === "cube" ? "red" : "white";
        menuDiv.style.color = color;
        menuDiv.innerHTML = `<div style="color:${color}">Context Menu</div>
            <div>Object: ${clickedName}</div>
            <div>Position: ${pickedPoint}</div>
            <button onclick='document.getElementById("contextMenu").style.display="none"'>Close</button>`;
    };

    canvas.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const pick = scene.pick(e.clientX, e.clientY);
        showMenu(e.clientX, e.clientY, pick);
    });

    let touchHold = false;
    let touchPoint = null;

    canvas.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
            touchHold = true;
            touchPoint = e.touches[0];
        } else if (e.touches.length === 2 && touchHold) {
            const pick = scene.pick(e.touches[1].clientX, e.touches[1].clientY);
            showMenu(e.touches[1].clientX, e.touches[1].clientY, pick);
            touchHold = false;
        }
    });

    canvas.addEventListener("touchend", () => {
        touchHold = false;
    });

    engine.runRenderLoop(() => {
        scene.render();
        document.getElementById("fps").innerText = `FPS: ${engine.getFps().toFixed(0)}`;
        document.getElementById("objects").innerText = `Objects: ${scene.meshes.length}`;
        window.scene = scene;
    });

    window.addEventListener("resize", () => engine.resize());
    document.getElementById("loadingScreen").classList.add("hidden");
    console.log("Scene created and rendering");
};

createScene();
