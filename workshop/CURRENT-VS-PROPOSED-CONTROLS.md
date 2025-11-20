# 🎮 Current vs Proposed Controls - Side-by-Side Comparison

**Date:** 2025-11-20

---

## 📊 VIEW MODE CONTROLS

### Current Implementation

| Mouse Input | Action | Issue |
|------------|--------|-------|
| Right Click + Drag | Rotate Camera | ❌ Conflicts with context menu |
| Left Click on Ground | Walk To | ✅ Good |
| Left Click on Object | Select/Inspect | ✅ Good |
| Mouse Wheel | Zoom | ✅ Good |
| Middle Mouse | *(Not used)* | ❌ Missing standard control |

### Proposed Implementation

| Mouse Input | Action | Benefit |
|------------|--------|---------|
| **Middle Mouse + Drag** | **Rotate Camera** | ✅ Standard 3D editor behavior |
| **Alt + Left Click + Drag** | **Rotate Camera** | ✅ Laptop users without middle button |
| Left Click on Ground | Walk To | ✅ Same as before |
| Left Click on Object | Select/Inspect | ✅ Same as before |
| Mouse Wheel | Zoom | ✅ Same as before |
| Right Click | *(Reserved for future)* | ✅ Available for quick actions |

---

## 📊 EDIT MODE CONTROLS

### Current Implementation

| Mouse Input | Action | Issue |
|------------|--------|-------|
| Right Click + Drag | Rotate Camera | ❌ Can't use for context menu! |
| Left Click on Object | Select Object | ✅ Good |
| Ctrl + Left Click | Multi-Select | ✅ Good |
| Left Click on Ground | Deselect All | ✅ Good |
| Mouse Wheel | Zoom | ✅ Good |
| Right Click on Object | *(Can't use - camera rotates!)* | ❌ No way to show context menu |

### Proposed Implementation

| Mouse Input | Action | Benefit |
|------------|--------|---------|
| **Middle Mouse + Drag** | **Rotate Camera** | ✅ Frees up right-click |
| **Alt + Left Click + Drag** | **Rotate Camera** | ✅ Laptop alternative |
| Left Click on Object | Select Object | ✅ Same as before |
| Ctrl + Left Click | Multi-Select | ✅ Same as before |
| Left Click on Ground | Deselect All | ✅ Same as before |
| **Right Click on Object** | **Context Menu** | ✅ Delete, duplicate, properties! |
| **Right Click on Ground** | **Scene Menu** | ✅ Add object, settings! |
| Mouse Wheel | Zoom | ✅ Same as before |

---

## 📱 TOUCH CONTROLS

### Current Implementation

| Touch Input | Action | Issue |
|------------|--------|-------|
| One Finger Pan | Rotate Camera | ⚠️ Works but could be better |
| Tap on Ground | Walk To | ✅ Good |
| Tap on Object | Select | ✅ Good |
| Two Finger Pinch | Zoom | ✅ Good |
| Long Press | *(Not defined)* | ❌ Wasted gesture |
| Two Finger Pan | *(Not defined)* | ❌ Missing pan camera |

### Proposed Implementation

| Touch Input | Action | Benefit |
|------------|--------|---------|
| One Finger Pan | Rotate Camera | ✅ Same as before |
| Tap on Ground | Walk To | ✅ Same as before |
| Tap on Object | Select | ✅ Same as before |
| Two Finger Pinch | Zoom | ✅ Same as before |
| **Long Press on Object** | **Context Menu** | ✅ Edit options on mobile! |
| **Two Finger Pan** | **Pan Camera** | ✅ Move camera sideways |

---

## 🎯 KEY DIFFERENCES

### What Changes:
1. **Camera Rotation:**
   - ❌ OLD: Right Click + Drag
   - ✅ NEW: Middle Mouse + Drag (primary)
   - ✅ NEW: Alt + Left Click + Drag (alternative)

2. **Right-Click:**
   - ❌ OLD: Rotates camera (blocks context menu)
   - ✅ NEW: Shows context menu (Edit mode)

3. **Touch Long Press:**
   - ❌ OLD: Does nothing
   - ✅ NEW: Shows context menu (Edit mode)

### What Stays the Same:
- ✅ Left Click on Ground → Walk to
- ✅ Left Click on Object → Select
- ✅ Mouse Wheel → Zoom
- ✅ WASD/Arrows → Move
- ✅ Touch Tap → Select/Walk
- ✅ Touch Pinch → Zoom

---

## 💡 WHY THIS MATTERS

### Problem with Current Controls:
```
User wants to edit an object in Edit Mode:
1. Right-click on object to see options
2. ❌ Camera rotates instead!
3. ❌ No way to access context menu
4. ❌ Must use keyboard shortcuts only
```

### Solution with Proposed Controls:
```
User wants to edit an object in Edit Mode:
1. Right-click on object
2. ✅ Context menu appears!
3. ✅ Options: Delete, Duplicate, Properties, etc.
4. ✅ User can edit intuitively

User wants to rotate camera:
1. Middle-click and drag
2. ✅ Camera rotates smoothly
3. ✅ No conflict with other actions
```

---

## 🖱️ LAPTOP USERS (No Middle Button)

### Current:
```
❌ Right-click + drag = Rotate camera
❌ But right-click also shows context menu (browser default)
❌ Conflict! User is confused.
```

### Proposed:
```
✅ Alt + Left-click + drag = Rotate camera
✅ Works perfectly on trackpad
✅ No middle button needed
✅ Standard in Blender and other tools
```

---

## 📊 CONTEXT MENU EXAMPLES

### Edit Mode - Right Click on Object:
```
┌─────────────────────┐
│ 🔵 Cube             │
├─────────────────────┤
│ ✂️  Delete          │
│ 📋 Duplicate        │
│ 📐 Properties       │
│ 🎨 Change Material  │
│ 🔒 Lock/Unlock      │
│ 👁️  Hide/Show       │
└─────────────────────┘
```

### Edit Mode - Right Click on Ground:
```
┌─────────────────────┐
│ ➕ Add Object       │
├─────────────────────┤
│ 📦 Cube             │
│ ⚪ Sphere           │
│ 🔶 Cylinder         │
│ ⭐ Light            │
│ 📷 Camera           │
│ ⚙️  Settings        │
└─────────────────────┘
```

---

## ✅ RECOMMENDED: Option A (Standard 3D Editor)

This is what professional 3D tools use:

| Action | Primary Method | Laptop Alternative |
|--------|---------------|-------------------|
| Rotate Camera | Middle Mouse + Drag | Alt + Left Click + Drag |
| Select Object | Left Click | Tap (touch) |
| Context Menu | Right Click | Long Press (touch) |
| Zoom | Mouse Wheel | Pinch (touch) |
| Pan Camera | Shift + Middle Mouse | Two Finger Pan (touch) |

**Benefits:**
- ✅ Industry standard (users know it already)
- ✅ Works on laptop (Alt + Left Click)
- ✅ Enables context menu for editing
- ✅ No conflicts between actions
- ✅ Touch equivalents for all actions

---

## 🚀 IMPLEMENTATION STEPS

If you approve, I will:

1. **Update MouseSource.js**
   - Change rotation trigger from Right-Click to Middle-Click
   - Keep right-click available for context menu
   - Add Alt + Left-Click alternative

2. **Update ViewModeContext.js**
   - Change lookAround binding to middleClickHeld
   - Add Alt + leftClickHeld alternative
   - Remove rightClickHeld

3. **Update EditModeContext.js**
   - Same camera rotation changes
   - Add right-click context menu actions (when ready)

4. **Test thoroughly**
   - Desktop with mouse (3-button)
   - Laptop with trackpad (no middle button)
   - Touch device (if available)

5. **Remove debug logs**
   - Clean up console.log statements

---

## ❓ YOUR DECISION NEEDED

**Please confirm:**

1. ✅ / ❌ Use Middle Mouse + Drag for camera rotation?
2. ✅ / ❌ Add Alt + Left Click + Drag as alternative?
3. ✅ / ❌ Reserve Right-Click for context menu (Edit mode)?
4. ✅ / ❌ Proceed with implementation?

**Or suggest your own control scheme!**

---

*Awaiting your confirmation to proceed with changes.*
