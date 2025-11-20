# 🎮 3D CMS Control Scheme Analysis & Proposal

**Date:** 2025-11-20
**Status:** 🔍 UNDER REVIEW

---

## 📊 Industry Standards Analysis

### **Blender (3D Editor)**
- **Middle Mouse + Drag** → Rotate camera
- **Shift + Middle Mouse + Drag** → Pan camera
- **Scroll Wheel** → Zoom
- **Left Click** → Select object
- **Right Click** → Context menu
- **Alt + Left Mouse + Drag** → Rotate camera (laptop alternative)

### **Unity (Game Editor)**
- **Right Mouse + Drag** → Rotate camera (FPS-style look)
- **Middle Mouse + Drag** → Pan camera
- **Scroll Wheel** → Zoom
- **Left Click** → Select object
- **Alt + Left Mouse + Drag** → Orbit camera around selection

### **Unreal Engine (Game Editor)**
- **Right Mouse + Drag** → FPS-style camera rotation
- **Middle Mouse + Drag** → Pan camera
- **Left Click** → Select object
- **Scroll Wheel** → Zoom

### **Google Maps / Earth (Viewer)**
- **Left Click + Drag** → Pan/rotate view
- **Scroll Wheel** → Zoom
- **Right Click** → Context menu

---

## 🎯 User Requirements (3D CMS)

### **View Mode** (Exploring/Viewing)
**Purpose:** Navigate and explore the 3D scene
**Users:** Content viewers, clients, visitors

**Primary Actions:**
1. **Look around** (rotate camera)
2. **Move to locations** (walk/teleport)
3. **Zoom in/out**
4. **Select objects to view info**

### **Edit Mode** (Creating/Editing)
**Purpose:** Create and modify 3D content
**Users:** Designers, content creators, administrators

**Primary Actions:**
1. **Select objects**
2. **Move/rotate/scale objects**
3. **Access editing tools** (context menu)
4. **Navigate while editing**

---

## 🤔 Current Implementation Issues

### **Current Controls:**
- **Right Click + Drag** → Rotate camera
- **Left Click on Ground** → Walk to location
- **Left Click on Object** → Select object
- **Mouse Wheel** → Zoom

### **Problems:**
1. ❌ **Right-click for camera** conflicts with **right-click for context menu**
2. ❌ **No middle mouse button support** (most professional 3D tools use this)
3. ❌ **Laptop users** have no easy camera rotation
4. ❌ **Touch screen equivalents** not well defined
5. ❌ **Edit mode** needs right-click for context menu on objects

---

## ✅ PROPOSED OPTIMAL CONTROL SCHEME

### 🖱️ **MOUSE CONTROLS**

#### **View Mode** (Exploring)

| Input | Action | Purpose | Priority |
|-------|--------|---------|----------|
| **Middle Mouse + Drag** | Rotate Camera | Standard 3D editor behavior | Primary |
| **Alt + Left Click + Drag** | Rotate Camera | Laptop alternative (no middle button) | Primary |
| **Left Click on Ground** | Walk To | Click-to-move navigation | Primary |
| **Left Click on Object** | View Info/Inspect | See object details | Primary |
| **Mouse Wheel** | Zoom In/Out | Get closer/farther | Primary |
| **WASD / Arrows** | Move Camera | Keyboard navigation | Primary |
| **Space** | Move Up | Vertical movement | Secondary |
| **Shift** | Move Down | Vertical movement | Secondary |
| **Right Click** | *(Reserved)* | Future: Quick actions menu | Future |

#### **Edit Mode** (Creating/Editing)

| Input | Action | Purpose | Priority |
|-------|--------|---------|----------|
| **Middle Mouse + Drag** | Rotate Camera | Standard 3D editor behavior | Primary |
| **Alt + Left Click + Drag** | Rotate Camera | Laptop alternative | Primary |
| **Left Click on Object** | Select Object | Select for editing | Primary |
| **Left Click + Drag on Object** | Move Object | Drag selected object | Primary |
| **Left Click on Ground** | Deselect All | Clear selection | Primary |
| **Right Click on Object** | Context Menu | Edit options (delete, duplicate, etc.) | Primary |
| **Right Click on Ground** | Scene Context Menu | Add object, settings, etc. | Primary |
| **Mouse Wheel** | Zoom In/Out | Get closer/farther | Primary |
| **Ctrl + Left Click on Object** | Multi-Select | Select multiple objects | Secondary |
| **G Key** | Grab/Move | Enter move mode | Secondary |
| **R Key** | Rotate | Enter rotate mode | Secondary |
| **S Key** | Scale | Enter scale mode | Secondary |

### 📱 **TOUCH CONTROLS**

#### **View Mode**

| Input | Action | Mouse Equivalent |
|-------|--------|------------------|
| **One Finger Pan** | Rotate Camera | Middle Mouse + Drag |
| **Tap on Ground** | Walk To | Left Click on Ground |
| **Tap on Object** | View Info | Left Click on Object |
| **Two Finger Pinch** | Zoom | Mouse Wheel |
| **Two Finger Pan** | Pan Camera | Shift + Middle Mouse |
| **Long Press** | *(Reserved)* | Right Click |

#### **Edit Mode**

| Input | Action | Mouse Equivalent |
|-------|--------|------------------|
| **One Finger Pan** | Rotate Camera | Middle Mouse + Drag |
| **Tap on Object** | Select Object | Left Click on Object |
| **Tap + Drag on Object** | Move Object | Left Click + Drag |
| **Tap on Ground** | Deselect All | Left Click on Ground |
| **Long Press on Object** | Context Menu | Right Click on Object |
| **Two Finger Pinch** | Zoom | Mouse Wheel |
| **Two Finger Pan** | Pan Camera | Shift + Middle Mouse |

---

## 🔧 Implementation Changes Required

### **1. Change Camera Rotation Trigger**

**Current:**
```javascript
// Right Click + Drag = Rotate Camera
{
    input: 'MouseMove',
    action: 'lookAround',
    condition: 'rightClickHeld'
}
```

**Proposed:**
```javascript
// PRIMARY: Middle Mouse + Drag = Rotate Camera
{
    input: 'MouseMove',
    action: 'lookAround',
    condition: 'middleClickHeld'
}

// ALTERNATIVE: Alt + Left Click + Drag = Rotate Camera (laptop)
{
    input: 'MouseMove',
    action: 'lookAround',
    condition: 'leftClickHeld',
    modifier: 'Alt'
}
```

### **2. Reserve Right-Click for Context Menu**

**View Mode:**
- Right-click → Quick actions menu (future feature)
- For now, do nothing (reserve for future)

**Edit Mode:**
- Right-click on object → Context menu (delete, duplicate, properties, etc.)
- Right-click on ground → Scene menu (add object, settings, etc.)

### **3. Add Pan Camera**

**New action needed:**
```javascript
// Shift + Middle Mouse + Drag = Pan Camera
{
    input: 'MouseMove',
    action: 'panCamera',
    condition: 'middleClickHeld',
    modifier: 'Shift'
}
```

### **4. Touch Equivalents**

**Current touch gestures:**
- TouchPan → lookAround (one finger)
- TouchPinch → zoom (two finger pinch)
- Tap → walkTo (tap ground)
- LongPress → *(undefined)*

**Proposed touch gestures:**
- **One Finger Pan** → lookAround (rotate camera)
- **Two Finger Pan** → panCamera (move camera sideways)
- **Two Finger Pinch** → zoom
- **Tap on Ground** → walkTo
- **Tap on Object** → select/viewInfo
- **Long Press on Object** → contextMenu (Edit mode)

---

## 📋 Summary of Changes

### **What Changes:**
1. ✅ **Middle Mouse + Drag** → Rotate camera (primary method)
2. ✅ **Alt + Left Click + Drag** → Rotate camera (laptop alternative)
3. ✅ **Right Click** → Reserved for context menu (Edit mode)
4. ✅ **Shift + Middle Mouse** → Pan camera (new feature)
5. ✅ **Touch: One Finger Pan** → Rotate camera
6. ✅ **Touch: Two Finger Pan** → Pan camera
7. ✅ **Touch: Long Press** → Context menu (Edit mode)

### **What Stays the Same:**
- ✅ Left Click on Ground → Walk to location
- ✅ Left Click on Object → Select/interact
- ✅ Mouse Wheel → Zoom
- ✅ WASD/Arrows → Move camera
- ✅ Touch Pinch → Zoom

---

## 🎯 Benefits of Proposed Scheme

### **1. Industry Standard**
- ✅ Matches Blender, Unity, Unreal conventions
- ✅ Professional users feel at home
- ✅ Shorter learning curve

### **2. Laptop Friendly**
- ✅ Alt + Left Click works without middle button
- ✅ Trackpad users can rotate camera
- ✅ No middle button required

### **3. Context Menu Support**
- ✅ Right-click available for editing tools
- ✅ Can add object operations (delete, duplicate, etc.)
- ✅ Can add scene operations (add object, settings, etc.)

### **4. Touch Screen Optimized**
- ✅ All actions have touch equivalents
- ✅ Gestures match mobile conventions
- ✅ No conflicts between touch and mouse

### **5. Prevents Conflicts**
- ✅ Camera rotation doesn't conflict with context menu
- ✅ Left-click clearly for selection/movement
- ✅ Right-click clearly for editing options
- ✅ Middle-click clearly for camera control

---

## ❓ User Feedback Needed

**Questions for you:**

1. **Primary camera rotation method:**
   - [ ] Middle Mouse + Drag (standard 3D editors)
   - [ ] Alt + Left Click + Drag (laptop-friendly)
   - [ ] Both (recommended)

2. **Right-click behavior:**
   - [ ] Context menu in Edit mode only
   - [ ] Context menu in both modes
   - [ ] Different menus for View/Edit modes

3. **Pan camera feature:**
   - [ ] Add pan camera (Shift + Middle Mouse)?
   - [ ] Skip for now (can add later)?

4. **Touch controls:**
   - [ ] One finger pan = rotate camera
   - [ ] One finger pan = pan camera (like Google Maps)

---

## 🚀 Implementation Priority

### **Phase 1: Fix Core Navigation (Now)**
1. Change camera rotation to Middle Mouse + Drag
2. Add Alt + Left Click + Drag alternative
3. Reserve right-click for future context menu
4. Test on desktop and laptop

### **Phase 2: Add Context Menu (Later)**
1. Implement context menu UI
2. Add right-click object operations
3. Add right-click scene operations
4. Test in Edit mode

### **Phase 3: Enhance Touch (Later)**
1. Improve touch gesture recognition
2. Add two-finger pan for camera
3. Add long-press context menu
4. Test on tablet/mobile

---

## 📝 Decision Required

**Please confirm preferred control scheme before I implement changes.**

Which approach do you prefer?

**Option A: Standard 3D Editor** (Recommended)
- Middle Mouse + Drag = Camera Rotation
- Alt + Left Click + Drag = Camera Rotation (alternative)
- Right Click = Context Menu (Edit mode)

**Option B: Simplified**
- Left Click + Drag (anywhere) = Camera Rotation
- Left Click on Object = Select
- Right Click = Context Menu

**Option C: Custom**
- Tell me your preferred control scheme!

---

*Awaiting your feedback before implementing changes.*
