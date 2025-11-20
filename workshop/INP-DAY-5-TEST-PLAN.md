# 🧪 INP Phase 1 - Day 5 Test Plan

**Date:** 2025-11-20
**Objective:** Comprehensive testing of InputManager integration
**Status:** 🔄 IN PROGRESS

---

## 📋 Test Categories

### 1. Input Source Tests
- [ ] Keyboard input detection
- [ ] Mouse input detection
- [ ] Touch input detection (simulated)
- [ ] Input source enable/disable
- [ ] Input source disposal

### 2. Input Context Tests
- [ ] ViewModeContext bindings
- [ ] EditModeContext bindings
- [ ] Context activation/deactivation
- [ ] Context switching (View ↔ Edit)
- [ ] Invalid context handling

### 3. Action Mapping Tests
- [ ] Keyboard → Action mapping
- [ ] Mouse → Action mapping
- [ ] Touch → Action mapping
- [ ] Modifier keys (Ctrl, Shift, Alt)
- [ ] Condition checking (clickGround, clickMesh, hasSelection)

### 4. Priority & Blocking Tests
- [ ] UI layer blocks 3D layer
- [ ] Modal layer blocks UI layer
- [ ] UI element detection (inputs, textareas)
- [ ] isBlocked() function accuracy

### 5. Action Query API Tests
- [ ] isActionPressed() accuracy
- [ ] getActionValue() for analog inputs
- [ ] Action state persistence
- [ ] Action state clearing

### 6. Filter System Tests
- [ ] Dead zone filtering
- [ ] Smoothing filter
- [ ] Custom curve filters
- [ ] Filter combinations

### 7. Event System Tests
- [ ] action:* events fire correctly
- [ ] context:changed events
- [ ] layer:changed events
- [ ] Event handler cleanup

### 8. Performance Tests
- [ ] Input lag measurement
- [ ] Frame rate stability (target: 60 FPS)
- [ ] Memory leak detection
- [ ] CPU usage monitoring

### 9. Integration Tests
- [ ] Camera movement (WASD/Arrows)
- [ ] Camera rotation (Mouse look)
- [ ] Click-to-move functionality
- [ ] Zoom (Mouse wheel)
- [ ] Multi-input scenarios (keyboard + mouse)

### 10. Edge Cases
- [ ] Rapid context switching
- [ ] Simultaneous key presses
- [ ] Browser tab focus/blur
- [ ] Window resize during input
- [ ] Dispose during active input

---

## 🎯 Test Execution Strategy

### Phase 1: Automated Unit Tests (2-3 hours)
Create automated tests for:
- InputManager core functions
- Input source standardization
- Context mapping logic
- Action query API
- Filter system

### Phase 2: Manual Integration Tests (1-2 hours)
Test in browser:
- Camera controls feel smooth
- Click-to-move works accurately
- UI elements don't trigger game controls
- Mode switching is seamless
- Performance is stable

### Phase 3: Edge Case Testing (1 hour)
Test unusual scenarios:
- Rapid mode switching
- Holding many keys simultaneously
- Focus/blur while holding keys
- Dispose while input active

---

## ✅ Success Criteria

All tests must pass with:
- **0 errors** in console
- **60 FPS** maintained during input
- **< 16ms** input lag
- **No memory leaks** detected
- **100% action accuracy** (right action for right input)

---

## 📊 Test Results

### Unit Tests
- Total: TBD
- Passed: 0
- Failed: 0
- Coverage: 0%

### Integration Tests
- Total: TBD
- Passed: 0
- Failed: 0

### Performance Metrics
- FPS: Not measured
- Input Lag: Not measured
- Memory Usage: Not measured

---

## 🐛 Issues Found

None yet.

---

## 📝 Notes

- Tests should be automated where possible
- Manual tests documented with screenshots
- Performance measured with browser DevTools
- All issues logged with reproduction steps

---

*Test plan created: 2025-11-20*
*Branch: claude/analyze-repo-workshop-setup-011CUfCp7Hi83Lwu2v7Kq7h5*
