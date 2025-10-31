<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BabylonJS Terrain with Havok Physics - Enhanced Controls</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- BabylonJS Core -->
  <script src="https://cdn.babylonjs.com/babylon.js"></script>
  <script src="https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js"></script>
  <script src="https://cdn.babylonjs.com/gui/babylon.gui.min.js"></script>

  <!-- Havok Physics (WASM + JS) -->
  <script src="https://cdn.babylonjs.com/havok/HavokPhysics_umd.js"></script>

  <!-- Babylon GUI Styles and Responsive Layout -->
  <style>
    html, body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      width: 100%;
      height: 100%;
      font-family: 'Arial', sans-serif;
    }

    #renderCanvas {
      width: 100%;
      height: 100%;
      display: block;
      touch-action: none;
    }

    #loadingScreen {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      z-index: 10;
      transition: opacity 0.5s ease;
    }

    .hidden {
      opacity: 0;
      pointer-events: none;
    }

    #statusPanel {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 14px;
      z-index: 20;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }

    #statusPanel div {
      margin-bottom: 5px;
    }

    #statusPanel div:last-child {
      margin-bottom: 0;
    }

    #controlsPanel {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-size: 13px;
      z-index: 20;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      max-width: 280px;
    }

    #controlsPanel h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #4CAF50;
    }

    #controlsPanel table {
      width: 100%;
      border-collapse: collapse;
    }

    #controlsPanel td {
      padding: 4px 8px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    #controlsPanel td:first-child {
      font-weight: bold;
      color: #81C784;
      white-space: nowrap;
    }

    #controlsPanel .mouse-section {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid rgba(255,255,255,0.2);
    }

    .loader {
      border: 3px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top: 3px solid #4CAF50;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      #controlsPanel {
        display: none;
      }
      
      #statusPanel {
        font-size: 12px;
        padding: 10px;
      }
    }
  </style>
</head>
<body>
  <div id="loadingScreen">
    <div style="text-align: center;">
      <div class="loader"></div>
      <div id="loadingStatus" style="margin-top: 20px;">Loading 3D Scene...</div>
    </div>
  </div>

  <canvas id="renderCanvas"></canvas>

  <div id="statusPanel">
    <div id="engineVersion">Engine version loading...</div>
    <div id="physicsStatus">Physics status...</div>
    <div id="fps">FPS: --</div>
    <div id="objects">Objects: --</div>
  </div>

  <div id="controlsPanel">
    <h3>🎮 Controls</h3>
    <table>
      <tr><td>W / ↑</td><td>Pan forward</td></tr>
      <tr><td>S / ↓</td><td>Pan backward</td></tr>
      <tr><td>A / ←</td><td>Pan left</td></tr>
      <tr><td>D / →</td><td>Pan right</td></tr>
      <tr><td>Q</td><td>Pan up</td></tr>
      <tr><td>E</td><td>Pan down</td></tr>
    </table>
    <div class="mouse-section">
      <strong>🖱 Mouse Controls</strong><br>
      <small>
        • Left Button: Rotate view<br>
        • Middle Button: Pan camera<br>
        • Scroll Wheel: Zoom in/out
      </small>
    </div>
  </div>

  <!-- Your Scene Logic -->
  <script src="scene.js"></script>
  
  <script>
    // Update object count periodically
    setInterval(() => {
      if (window.scene) {
        document.getElementById("objects").innerText = `Objects: ${scene.meshes.length}`;
      }
    }, 1000);
  </script>
</body>
</html>
