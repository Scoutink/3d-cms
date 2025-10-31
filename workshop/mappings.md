# WordPress & Babylon.js Integration Mappings

## Overview

This document maps the current 3D implementation to WordPress CMS architecture and identifies integration points for scaling the system into a full-featured 3D content management platform.

---

## Current State → WordPress Architecture Mapping

### 1. File Structure Transformation

#### Current Structure
```
3d-cms/
├── index.php      # Monolithic HTML/CSS/JS entry point
├── scene.js       # Scene logic and event handling
└── dirt.jpg       # Hardcoded texture asset
```

#### Proposed WordPress Plugin Structure
```
wp-content/plugins/babylon-3d-cms/
├── babylon-3d-cms.php                    # Main plugin file with headers
├── includes/
│   ├── class-scene-manager.php           # Scene CRUD operations
│   ├── class-asset-manager.php           # Media library integration
│   ├── class-physics-manager.php         # Physics configuration API
│   ├── class-camera-manager.php          # Camera presets and configs
│   └── class-ajax-handler.php            # AJAX endpoints for scene interaction
├── admin/
│   ├── class-admin-ui.php                # Settings pages
│   ├── class-metaboxes.php               # Scene editor metaboxes
│   ├── views/
│   │   ├── scene-editor.php              # Visual scene editor
│   │   └── settings-page.php             # Plugin settings
│   └── assets/
│       ├── css/admin-styles.css          # Admin UI styling
│       └── js/admin-scripts.js           # Admin UI interactions
├── public/
│   ├── class-shortcode-handler.php       # [babylon_scene id="123"] shortcode
│   ├── class-rest-api.php                # REST API endpoints
│   └── assets/
│       ├── js/
│       │   ├── scene-loader.js           # Dynamic scene loading (from scene.js)
│       │   ├── camera-controller.js      # Camera systems (extracted)
│       │   ├── physics-controller.js     # Physics setup (extracted)
│       │   └── interaction-handler.js    # Click, touch, context menu (extracted)
│       └── css/
│           └── scene-viewer.css          # Viewer UI styles (from index.php CSS)
├── blocks/
│   ├── babylon-scene/
│   │   ├── block.json                    # Gutenberg block definition
│   │   ├── edit.js                       # Block editor component
│   │   ├── save.js                       # Block save output
│   │   └── style.css                     # Block styling
│   └── scene-gallery/
│       └── ...                            # Gallery block for multiple scenes
├── templates/
│   ├── single-babylon_scene.php          # Custom post type template
│   └── scene-embed.php                   # Embeddable scene template
└── assets/
    └── textures/
        └── defaults/
            └── dirt.jpg                   # Default texture (moved)
```

**Mapping Rationale:**
- **index.php → public/assets/css/scene-viewer.css + templates/scene-embed.php**
  - Split HTML structure from styling from behavior
  - Template system allows theme overrides

- **scene.js → public/assets/js/* (multiple files)**
  - Modularize monolithic code into logical controllers
  - Each module handles single responsibility
  - Easier testing and maintenance

- **dirt.jpg → assets/textures/defaults/**
  - Move to organized asset directory
  - Serve via WP media library eventually
  - Version control for default assets

---

### 2. Custom Post Type: `babylon_scene`

#### WordPress Post Type Registration
```php
register_post_type('babylon_scene', [
    'labels' => [
        'name' => '3D Scenes',
        'singular_name' => '3D Scene',
        'add_new' => 'Add New Scene',
        'edit_item' => 'Edit Scene',
    ],
    'public' => true,
    'has_archive' => true,
    'supports' => ['title', 'editor', 'thumbnail', 'revisions'],
    'show_in_rest' => true, // Gutenberg + REST API support
    'rewrite' => ['slug' => '3d-scenes'],
    'menu_icon' => 'dashicons-video-alt3',
]);
```

#### Post Meta Fields (Scene Configuration)
```php
// Camera settings (from scene.js lines 10-22)
'_scene_camera_position' => [
    'x' => 0,
    'y' => 2,
    'z' => -10
],
'_scene_camera_speed' => 0.5,
'_scene_camera_sensitivity' => 3000,
'_scene_camera_ellipsoid' => [
    'x' => 1,
    'y' => 1.5,
    'z' => 1
],

// Physics settings (from scene.js lines 48-67)
'_scene_physics_enabled' => true,
'_scene_physics_engine' => 'havok', // or 'cannon', 'ammo'
'_scene_physics_gravity' => [
    'x' => 0,
    'y' => -9.81,
    'z' => 0
],

// Environment settings (from scene.js lines 26-46)
'_scene_skybox_enabled' => true,
'_scene_skybox_size' => 150,
'_scene_ground_size' => 100,
'_scene_environment_color' => '#336699', // RGB(0.2, 0.4, 0.6)
'_scene_ground_texture' => 123, // WP Media Library attachment ID

// Lighting settings (from scene.js line 24)
'_scene_lights' => [
    [
        'type' => 'hemispheric',
        'direction' => ['x' => 0, 'y' => 1, 'z' => 0],
        'intensity' => 1.0
    ]
],

// Objects (from scene.js lines 58-63)
'_scene_objects' => [
    [
        'type' => 'box',
        'name' => 'cube',
        'size' => 2,
        'position' => ['x' => 0, 'y' => 10, 'z' => 0],
        'physics' => [
            'mass' => 1,
            'shape' => 'box'
        ],
        'material' => [
            'type' => 'standard',
            'color' => '#cccccc'
        ]
    ]
],

// Interaction settings (from scene.js lines 69-156)
'_scene_interactions' => [
    'click_to_move' => true,
    'double_click_speed_boost' => true,
    'context_menu' => true,
    'touch_controls' => true
],

// UI settings (from index.php lines 52-178)
'_scene_ui_status_panel' => true,
'_scene_ui_controls_panel' => true,
'_scene_ui_loading_screen' => true,
```

#### Taxonomy: Scene Categories
```php
register_taxonomy('scene_category', 'babylon_scene', [
    'labels' => [
        'name' => 'Scene Categories',
        'singular_name' => 'Scene Category',
    ],
    'hierarchical' => true,
    'show_in_rest' => true,
]);

// Example categories:
// - Architectural Visualization
// - Product Showcases
// - Interactive Tours
// - Game Prototypes
// - Educational Demos
```

---

### 3. Gutenberg Block Integration

#### Block Registration (blocks/babylon-scene/block.json)
```json
{
  "apiVersion": 2,
  "name": "babylon-3d-cms/scene-viewer",
  "title": "3D Scene Viewer",
  "category": "embed",
  "icon": "video-alt3",
  "description": "Embed an interactive 3D scene powered by Babylon.js",
  "keywords": ["3d", "babylon", "webgl", "interactive"],
  "attributes": {
    "sceneId": {
      "type": "number",
      "default": 0
    },
    "width": {
      "type": "string",
      "default": "100%"
    },
    "height": {
      "type": "string",
      "default": "600px"
    },
    "autoPlay": {
      "type": "boolean",
      "default": true
    },
    "showControls": {
      "type": "boolean",
      "default": true
    }
  },
  "supports": {
    "align": ["wide", "full"],
    "html": false
  }
}
```

#### Block Edit Component (React/JSX)
```jsx
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl, TextControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

export default function Edit({ attributes, setAttributes }) {
    const { sceneId, width, height, showControls } = attributes;

    // Fetch available scenes from REST API
    const scenes = useSelect((select) => {
        return select('core').getEntityRecords('postType', 'babylon_scene');
    });

    return (
        <>
            <InspectorControls>
                <PanelBody title="Scene Settings">
                    <SelectControl
                        label="Select 3D Scene"
                        value={sceneId}
                        options={[
                            { label: 'Choose a scene...', value: 0 },
                            ...scenes.map(scene => ({
                                label: scene.title.rendered,
                                value: scene.id
                            }))
                        ]}
                        onChange={(value) => setAttributes({ sceneId: parseInt(value) })}
                    />
                    <TextControl
                        label="Width"
                        value={width}
                        onChange={(value) => setAttributes({ width: value })}
                    />
                    <TextControl
                        label="Height"
                        value={height}
                        onChange={(value) => setAttributes({ height: value })}
                    />
                    <ToggleControl
                        label="Show Controls"
                        checked={showControls}
                        onChange={(value) => setAttributes({ showControls: value })}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...useBlockProps()}>
                {sceneId === 0 ? (
                    <div className="babylon-scene-placeholder">
                        <p>Select a 3D scene from the sidebar</p>
                    </div>
                ) : (
                    <iframe
                        src={`/wp-json/babylon-3d-cms/v1/scene/${sceneId}/preview`}
                        width={width}
                        height={height}
                        style={{ border: 'none' }}
                    />
                )}
            </div>
        </>
    );
}
```

#### Shortcode Handler
```php
class Shortcode_Handler {
    public function register() {
        add_shortcode('babylon_scene', [$this, 'render_scene']);
    }

    public function render_scene($atts) {
        $atts = shortcode_atts([
            'id' => 0,
            'width' => '100%',
            'height' => '600px',
            'controls' => 'true',
        ], $atts);

        if (!$atts['id']) {
            return '<p>Error: No scene ID provided</p>';
        }

        $scene = get_post($atts['id']);
        if (!$scene || $scene->post_type !== 'babylon_scene') {
            return '<p>Error: Scene not found</p>';
        }

        // Enqueue Babylon.js assets
        wp_enqueue_script('babylonjs-core');
        wp_enqueue_script('babylonjs-physics');
        wp_enqueue_script('babylon-scene-loader');

        // Render template
        ob_start();
        include plugin_dir_path(__FILE__) . '../templates/scene-embed.php';
        return ob_get_clean();
    }
}
```

---

### 4. REST API Endpoints

#### Scene Data Endpoint
```php
// GET /wp-json/babylon-3d-cms/v1/scene/{id}
register_rest_route('babylon-3d-cms/v1', '/scene/(?P<id>\d+)', [
    'methods' => 'GET',
    'callback' => 'get_scene_data',
    'permission_callback' => '__return_true',
    'args' => [
        'id' => [
            'validate_callback' => function($param) {
                return is_numeric($param);
            }
        ]
    ]
]);

function get_scene_data($request) {
    $scene_id = $request['id'];
    $scene = get_post($scene_id);

    if (!$scene || $scene->post_type !== 'babylon_scene') {
        return new WP_Error('not_found', 'Scene not found', ['status' => 404]);
    }

    // Compile all meta into JSON structure
    return [
        'id' => $scene_id,
        'title' => $scene->post_title,
        'camera' => get_post_meta($scene_id, '_scene_camera_position', true),
        'physics' => [
            'enabled' => get_post_meta($scene_id, '_scene_physics_enabled', true),
            'gravity' => get_post_meta($scene_id, '_scene_physics_gravity', true),
        ],
        'environment' => [
            'skybox_size' => get_post_meta($scene_id, '_scene_skybox_size', true),
            'ground_size' => get_post_meta($scene_id, '_scene_ground_size', true),
            'ground_texture' => wp_get_attachment_url(
                get_post_meta($scene_id, '_scene_ground_texture', true)
            ),
        ],
        'objects' => get_post_meta($scene_id, '_scene_objects', true),
        'lights' => get_post_meta($scene_id, '_scene_lights', true),
        'interactions' => get_post_meta($scene_id, '_scene_interactions', true),
    ];
}
```

#### Scene Update Endpoint (Authorized)
```php
// POST /wp-json/babylon-3d-cms/v1/scene/{id}
register_rest_route('babylon-3d-cms/v1', '/scene/(?P<id>\d+)', [
    'methods' => 'POST',
    'callback' => 'update_scene_data',
    'permission_callback' => function() {
        return current_user_can('edit_posts');
    },
]);

function update_scene_data($request) {
    $scene_id = $request['id'];
    $params = $request->get_json_params();

    // Validate scene exists
    $scene = get_post($scene_id);
    if (!$scene || $scene->post_type !== 'babylon_scene') {
        return new WP_Error('not_found', 'Scene not found', ['status' => 404]);
    }

    // Update meta fields
    if (isset($params['camera'])) {
        update_post_meta($scene_id, '_scene_camera_position', $params['camera']);
    }
    if (isset($params['objects'])) {
        update_post_meta($scene_id, '_scene_objects', $params['objects']);
    }
    // ... update other fields

    return ['success' => true, 'message' => 'Scene updated'];
}
```

---

### 5. Admin UI Integration

#### Scene Editor Metabox
```php
add_action('add_meta_boxes', function() {
    add_meta_box(
        'babylon_scene_editor',
        '3D Scene Configuration',
        'render_scene_editor_metabox',
        'babylon_scene',
        'normal',
        'high'
    );
});

function render_scene_editor_metabox($post) {
    // Get existing scene data
    $camera_pos = get_post_meta($post->ID, '_scene_camera_position', true);
    $objects = get_post_meta($post->ID, '_scene_objects', true);

    ?>
    <div id="babylon-scene-editor">
        <!-- Live 3D Preview Canvas -->
        <div class="scene-preview">
            <canvas id="editor-canvas"></canvas>
            <div class="preview-controls">
                <button id="reset-camera">Reset Camera</button>
                <button id="add-object">Add Object</button>
                <button id="save-scene">Save Changes</button>
            </div>
        </div>

        <!-- Scene Settings Panel -->
        <div class="scene-settings">
            <h3>Camera Settings</h3>
            <label>Position X: <input type="number" name="camera_x" value="<?= $camera_pos['x'] ?>" /></label>
            <label>Position Y: <input type="number" name="camera_y" value="<?= $camera_pos['y'] ?>" /></label>
            <label>Position Z: <input type="number" name="camera_z" value="<?= $camera_pos['z'] ?>" /></label>

            <h3>Physics Settings</h3>
            <label><input type="checkbox" name="physics_enabled" /> Enable Physics</label>

            <h3>Objects</h3>
            <div id="objects-list">
                <?php foreach ($objects as $obj): ?>
                    <div class="object-item">
                        <strong><?= esc_html($obj['name']) ?></strong>
                        <button class="edit-object">Edit</button>
                        <button class="delete-object">Delete</button>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
    <?php
}
```

#### Settings Page
```php
add_action('admin_menu', function() {
    add_options_page(
        'Babylon 3D CMS Settings',
        'Babylon 3D',
        'manage_options',
        'babylon-3d-settings',
        'render_settings_page'
    );
});

function render_settings_page() {
    ?>
    <div class="wrap">
        <h1>Babylon 3D CMS Settings</h1>
        <form method="post" action="options.php">
            <?php settings_fields('babylon_3d_settings'); ?>

            <table class="form-table">
                <tr>
                    <th>Default Physics Engine</th>
                    <td>
                        <select name="babylon_default_physics">
                            <option value="havok">Havok (Recommended)</option>
                            <option value="cannon">Cannon.js</option>
                            <option value="ammo">Ammo.js</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th>Asset CDN</th>
                    <td>
                        <label><input type="radio" name="babylon_cdn" value="babylonjs" checked /> Babylon.js CDN</label><br>
                        <label><input type="radio" name="babylon_cdn" value="local" /> Local Files</label><br>
                        <label><input type="radio" name="babylon_cdn" value="custom" /> Custom CDN</label>
                        <input type="text" name="babylon_custom_cdn" placeholder="https://..." />
                    </td>
                </tr>
                <tr>
                    <th>Performance Mode</th>
                    <td>
                        <label><input type="checkbox" name="babylon_optimize" /> Enable Scene Optimizer</label><br>
                        <label><input type="checkbox" name="babylon_lod" /> Enable LOD System</label><br>
                        <label><input type="checkbox" name="babylon_occlusion" /> Enable Occlusion Culling</label>
                    </td>
                </tr>
            </table>

            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}
```

---

### 6. Media Library Integration

#### Custom Upload Handler for 3D Assets
```php
// Allow additional MIME types for 3D models
add_filter('upload_mimes', function($mimes) {
    $mimes['gltf'] = 'model/gltf+json';
    $mimes['glb'] = 'model/gltf-binary';
    $mimes['obj'] = 'model/obj';
    $mimes['fbx'] = 'model/fbx';
    $mimes['stl'] = 'model/stl';
    return $mimes;
});

// Add custom metadata for 3D assets
add_filter('wp_generate_attachment_metadata', function($metadata, $attachment_id) {
    $file = get_attached_file($attachment_id);
    $ext = pathinfo($file, PATHINFO_EXTENSION);

    if (in_array($ext, ['gltf', 'glb', 'obj', 'fbx', 'stl'])) {
        // Parse 3D model metadata (vertices, triangles, size, etc.)
        $metadata['is_3d_model'] = true;
        $metadata['model_format'] = $ext;
        // Additional parsing logic here
    }

    return $metadata;
}, 10, 2);

// Custom media library column for 3D assets
add_filter('manage_media_columns', function($columns) {
    $columns['3d_model'] = '3D Model';
    return $columns;
});

add_action('manage_media_custom_column', function($column, $post_id) {
    if ($column === '3d_model') {
        $meta = wp_get_attachment_metadata($post_id);
        if (isset($meta['is_3d_model']) && $meta['is_3d_model']) {
            echo '✓ ' . strtoupper($meta['model_format']);
        }
    }
}, 10, 2);
```

#### Texture Selector Integration
```php
// Replace hardcoded "dirt.jpg" with media library picker (from scene.js line 39)
// In admin metabox:
?>
<div class="texture-selector">
    <label>Ground Texture:</label>
    <div class="texture-preview">
        <?php
        $texture_id = get_post_meta($post->ID, '_scene_ground_texture', true);
        if ($texture_id) {
            echo wp_get_attachment_image($texture_id, 'thumbnail');
        }
        ?>
    </div>
    <button class="select-texture" data-target="ground_texture">Select Texture</button>
    <input type="hidden" name="scene_ground_texture" value="<?= $texture_id ?>" />
</div>

<script>
jQuery('.select-texture').on('click', function(e) {
    e.preventDefault();
    const target = jQuery(this).data('target');

    const mediaUploader = wp.media({
        title: 'Select Ground Texture',
        button: { text: 'Use This Texture' },
        multiple: false,
        library: { type: 'image' }
    });

    mediaUploader.on('select', function() {
        const attachment = mediaUploader.state().get('selection').first().toJSON();
        jQuery(`input[name="scene_${target}"]`).val(attachment.id);
        jQuery('.texture-preview').html(`<img src="${attachment.url}" />`);
    });

    mediaUploader.open();
});
</script>
<?php
```

---

## Babylon.js Feature Expansion Mapping

### Current Implementation (15% of Babylon.js)
✅ **Implemented:**
- Scene creation and rendering
- Basic camera (UniversalCamera)
- Simple lighting (HemisphericLight)
- Primitive mesh creation (Box, Ground)
- StandardMaterial with textures
- Havok physics integration
- Basic collision detection
- PointerObservable events
- Animation API (CreateAndStartAnimation)

### Phase 1: Essential Features (Target: 35%)
🎯 **Priority Additions:**

1. **PBR Materials** (Physically Based Rendering)
   - Replace StandardMaterial with PBRMaterial
   - Add metallic/roughness workflows
   - Environment reflections and refractions
   - Map to WP: Material library custom post type

2. **Advanced Lighting**
   - DirectionalLight with shadow casting
   - PointLight and SpotLight
   - Shadow generators and soft shadows
   - Map to WP: Light presets in scene meta

3. **Model Loading**
   - glTF/GLB import (industry standard)
   - OBJ/FBX support for legacy models
   - Asset containers for efficient loading
   - Map to WP: Media library integration (already planned above)

4. **Animation System**
   - Animation groups from imported models
   - Skeletal animations for characters
   - Timeline-based animation editor
   - Map to WP: Animation sequences in post meta

5. **Scene Optimizer**
   - Automatic performance scaling
   - LOD (Level of Detail) management
   - Texture compression and atlasing
   - Map to WP: Plugin settings for performance tiers

### Phase 2: Advanced Features (Target: 60%)
🔧 **Secondary Additions:**

1. **Post-Processing Effects**
   - Bloom, glow, god rays
   - Depth of field, motion blur
   - Color correction, vignette
   - Map to WP: Effect presets in scene settings

2. **Particle Systems**
   - GPU particles for performance
   - Weather effects (rain, snow, fog)
   - Fire, smoke, magic effects
   - Map to WP: Particle emitter objects in scene

3. **Advanced Physics**
   - Joints and constraints
   - Ragdoll physics
   - Soft body simulation
   - Map to WP: Physics constraints in object meta

4. **XR Support**
   - WebXR API integration
   - VR headset support (Quest, Vive, etc.)
   - AR mode for mobile devices
   - Map to WP: XR toggle in scene settings

5. **GUI System**
   - 3D UI elements in scene space
   - HTML-CSS hybrid interfaces
   - Responsive layouts for mobile
   - Map to WP: GUI editor in admin metabox

### Phase 3: Professional Features (Target: 85%)
🚀 **Advanced Additions:**

1. **Node Materials**
   - Visual shader graph editor
   - Custom material creation without code
   - Material library and presets
   - Map to WP: Node material CPT + visual editor

2. **Compute Shaders**
   - GPU-accelerated simulations
   - Advanced particle effects
   - Procedural generation
   - Map to WP: Compute shader snippets library

3. **Scene Serialization**
   - Export/import scene as JSON
   - Version control for scenes
   - Snapshot and restore functionality
   - Map to WP: Scene revisions system

4. **Multiplayer Support**
   - Real-time collaboration (using Colyseus/Socket.io)
   - Synchronized object states
   - User presence indicators
   - Map to WP: User roles and permissions

5. **Advanced Cameras**
   - ArcRotateCamera for product showcases
   - FollowCamera for third-person views
   - Cinematic camera paths
   - Map to WP: Camera presets dropdown

---

## Data Flow Architecture

### Current: Hardcoded → Babylon.js
```
index.php (HTML)
    ↓
scene.js (hardcoded values)
    ↓
Babylon.js Scene
    ↓
WebGL Rendering
```

### Future: WordPress → REST API → Babylon.js
```
WordPress Admin
    ↓
Scene Editor (React)
    ↓
REST API (save scene config)
    ↓
Database (post meta)
    ↓
REST API (load scene config)
    ↓
Scene Loader (JavaScript)
    ↓
Babylon.js Scene (dynamic)
    ↓
WebGL Rendering
```

**Benefits:**
- Dynamic scene loading without code changes
- Version control via WordPress revisions
- User permissions and role management
- Media library for asset management
- Caching and optimization layers
- Multi-site support for scene libraries

---

## Asset Pipeline Transformation

### Current: Hardcoded Asset Loading
```javascript
// scene.js line 39-40
let textureURL = "dirt.jpg";
let tex = new BABYLON.Texture(textureURL, scene);
```

### Future: Dynamic Asset Loading via WP
```javascript
// Load scene configuration from REST API
fetch(`/wp-json/babylon-3d-cms/v1/scene/${sceneId}`)
    .then(response => response.json())
    .then(sceneData => {
        // Ground texture from media library
        const textureURL = sceneData.environment.ground_texture;
        const tex = new BABYLON.Texture(textureURL, scene);

        // 3D models from media library
        sceneData.objects.forEach(obj => {
            if (obj.model_url) {
                BABYLON.SceneLoader.ImportMesh(
                    "",
                    obj.model_url,
                    "",
                    scene,
                    (meshes) => {
                        meshes[0].position = new BABYLON.Vector3(
                            obj.position.x,
                            obj.position.y,
                            obj.position.z
                        );
                    }
                );
            }
        });
    });
```

**Advantages:**
- Assets versioned in media library
- CDN integration for fast delivery
- Image optimization (WebP, AVIF)
- Lazy loading and progressive enhancement
- Backup and restore via WP tools

---

## User Roles & Permissions Mapping

### WordPress Roles
1. **Administrator**
   - Full access to all scenes
   - Plugin settings configuration
   - Can delete and modify any scene

2. **Editor**
   - Create, edit, delete own and others' scenes
   - Access to scene editor
   - Cannot modify plugin settings

3. **Author**
   - Create and edit own scenes only
   - Limited to basic scene features
   - Cannot access advanced physics/effects

4. **Contributor**
   - Create scenes for review
   - Cannot publish scenes (pending review)
   - Read-only access to scene library

5. **Subscriber** (or Site Visitor)
   - View published scenes only
   - No backend access
   - Can interact with scenes on frontend

### Custom Capabilities
```php
add_action('init', function() {
    $role = get_role('editor');
    $role->add_cap('edit_babylon_scenes');
    $role->add_cap('delete_babylon_scenes');
    $role->add_cap('publish_babylon_scenes');
});
```

---

## Performance Optimization Mapping

### Current Performance Characteristics
- **Initial Load:** ~6.3 MB (CDN assets)
- **FPS:** 60 on desktop, varies on mobile
- **Object Count:** 3 meshes (ground, skybox, box)
- **Draw Calls:** ~3-5
- **Optimization:** None (raw rendering)

### Optimization Strategies for WP Integration

#### 1. Asset Loading Optimization
```javascript
// Lazy load Babylon.js modules
const loadBabylonCore = () => import('https://cdn.babylonjs.com/babylon.esm.js');
const loadBabylonPhysics = () => import('https://cdn.babylonjs.com/havok/HavokPhysics_esm.js');

// Only load physics if scene requires it
if (sceneData.physics.enabled) {
    await loadBabylonPhysics();
}
```

#### 2. Scene Optimizer Integration
```javascript
// Auto-optimize based on device capabilities
BABYLON.SceneOptimizer.OptimizeAsync(scene,
    BABYLON.SceneOptimizerOptions.ModerateDegradationAllowed(),
    () => {
        console.log('Scene optimized for device');
    },
    () => {
        console.log('Scene cannot be optimized further');
    }
);
```

#### 3. Caching Strategy
```php
// Cache scene JSON data
function get_scene_data_cached($scene_id) {
    $cache_key = "babylon_scene_{$scene_id}";
    $cached = wp_cache_get($cache_key);

    if ($cached === false) {
        $cached = compile_scene_data($scene_id); // expensive operation
        wp_cache_set($cache_key, $cached, '', 3600); // 1 hour cache
    }

    return $cached;
}
```

#### 4. Responsive Quality Settings
```javascript
// Adjust quality based on viewport size
const isMobile = window.innerWidth < 768;
const isLowEnd = navigator.hardwareConcurrency < 4;

scene.createDefaultEnvironment({
    skyboxSize: isMobile ? 100 : 150,
    groundSize: isMobile ? 50 : 100
});

engine.setHardwareScalingLevel(isLowEnd ? 2 : 1); // Render at 50% resolution on weak devices
```

---

## Security Considerations

### Input Validation
```php
// Sanitize scene configuration before saving
function sanitize_scene_config($config) {
    return [
        'camera' => [
            'x' => floatval($config['camera']['x']),
            'y' => floatval($config['camera']['y']),
            'z' => floatval($config['camera']['z']),
        ],
        'objects' => array_map(function($obj) {
            return [
                'type' => sanitize_text_field($obj['type']),
                'name' => sanitize_text_field($obj['name']),
                'position' => [
                    'x' => floatval($obj['position']['x']),
                    'y' => floatval($obj['position']['y']),
                    'z' => floatval($obj['position']['z']),
                ],
            ];
        }, $config['objects'])
    ];
}
```

### XSS Prevention
```php
// Escape output in templates (fixes context menu vulnerability from scene.js line 128)
<div>Object: <?= esc_html($clickedName) ?></div>
<div>Position: <?= esc_html($pickedPoint) ?></div>
```

### CSRF Protection
```php
// Add nonce to AJAX requests
wp_nonce_field('save_babylon_scene', 'babylon_scene_nonce');

// Verify nonce before saving
if (!wp_verify_nonce($_POST['babylon_scene_nonce'], 'save_babylon_scene')) {
    wp_die('Security check failed');
}
```

### Asset Validation
```php
// Validate 3D model files before importing
function validate_3d_model($file_path) {
    $allowed_types = ['gltf', 'glb', 'obj'];
    $ext = pathinfo($file_path, PATHINFO_EXTENSION);

    if (!in_array($ext, $allowed_types)) {
        return new WP_Error('invalid_model', 'Unsupported 3D model format');
    }

    // Check file size (max 50MB)
    if (filesize($file_path) > 50 * 1024 * 1024) {
        return new WP_Error('file_too_large', 'Model exceeds 50MB limit');
    }

    return true;
}
```

---

## Migration Path: Current → WordPress

### Step 1: Extract and Modularize
- [ ] Split scene.js into modules (camera, physics, interaction)
- [ ] Extract CSS from index.php to separate file
- [ ] Create template structure for scene viewer

### Step 2: Create Plugin Skeleton
- [ ] Set up WordPress plugin structure
- [ ] Register custom post type and taxonomies
- [ ] Create basic admin UI

### Step 3: Implement Data Layer
- [ ] Design post meta schema for scene configuration
- [ ] Create REST API endpoints
- [ ] Build scene serialization/deserialization logic

### Step 4: Build Admin Interface
- [ ] Scene editor metabox with live preview
- [ ] Settings page for plugin configuration
- [ ] Media library integration for assets

### Step 5: Create Frontend Components
- [ ] Gutenberg block for scene embedding
- [ ] Shortcode handler for legacy support
- [ ] Dynamic scene loader (replaces hardcoded scene.js)

### Step 6: Enhance Babylon.js Integration
- [ ] Add PBR materials support
- [ ] Implement model loading (glTF, OBJ)
- [ ] Add advanced lighting and shadows
- [ ] Integrate scene optimizer

### Step 7: Testing and Optimization
- [ ] Cross-browser testing
- [ ] Mobile performance optimization
- [ ] Load time improvements
- [ ] Security audit

### Step 8: Documentation and Release
- [ ] User documentation
- [ ] Developer API documentation
- [ ] Plugin submission to WordPress.org
- [ ] Marketing site and demos

---

## Conclusion

The current implementation provides a solid proof-of-concept for Babylon.js integration, but requires significant architectural changes for WordPress CMS compatibility. The mapping above provides a clear path from the current hardcoded structure to a flexible, database-driven, user-friendly WordPress plugin.

**Key Takeaways:**
1. Custom Post Type `babylon_scene` as the central data structure
2. REST API for dynamic scene loading and AJAX interactions
3. Gutenberg block + shortcode for flexible embedding
4. Media library integration for asset management
5. Admin metabox with live scene editor
6. Modular JavaScript architecture for maintainability
7. Security-first approach with proper sanitization and validation

**Estimated Development Time:** 8-12 weeks for full MVP implementation

**Next Steps:** See `future_tasks.md` for prioritized development roadmap.
