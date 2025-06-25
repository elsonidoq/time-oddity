# Phase 4 Detailed Task Specifications (Level Design & Progression)

> This document replaces the brief checklist in `phase_4.md` and provides **fully-fleshed, template-based tasks** that an engineer LLM can execute sequentially without ambiguity.  Each task uses the structure defined in `agent_docs/task_template.md`.

---

## Task 4.2 — Add Health Bar to UI

### Task Title
Add Health Bar to `UIScene`

### Objective
Visually display the player's current health in the HUD.

### Pre-Implementation Analysis

#### Documentation Dependencies
- [x] **invariants.md**: §6 Player Invariants, §7 TimeManager Rewind System (no changes expected)
- [x] **testing_best_practices.md**: _"State-Based Testing", "Phaser Mocking"_
- [x] **small_comprehensive_documentation.md**: §7.3 UI/HUD Architecture

#### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: `Player.health` & `Player.maxHealth` (see invariants §6)
- [x] **New states/invariants to create**: None (visual only)
- [x] **Time reversal compatibility**: Read-only display; no state recorded.

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `client/src/scenes/UIScene.js` (render bar + update logic)
- **Modify**: `tests/unit/ui-scene.test.js` (expand assertions)

#### Integration Points
- **Systems affected**: None; purely UI
- **State machines**: N/A
- **External libraries**: Phaser Graphics API only

#### Testing Strategy
- **Tests to update**: `tests/unit/ui-scene.test.js`
- **Key cases**:
  1. Health bar Graphics object is created in `create()`.
  2. Calling `scene.update()` after mutating a mock `player.health` redraws the bar with correct width (use Jest fake Graphics mock).
- **Mocks needed**: Reuse existing Phaser mocks.

### Task Breakdown & Acceptance Criteria
- [x] Draw a red background bar (fixed 200 × 20 px) at 
  `(20,20)` in `create()`.
- [x] In `update()`, listen for `this.registry.get('playerHealth')` or event `healthChanged` and scale a green overlay proportionally.
- [x] All new/updated tests pass.

### Expected Output
Running the game shows a red bar with a green fill reflecting current health; unit tests pass.

### Risk Assessment
- **Complexity**: Low (graphics only)
- **Dependencies**: Player health events/registry; ensure they exist.
- **Fallback**: If events unavailable, poll `scene.registry` each frame.

### Definition of Done
- [x] Acceptance criteria met & verified visually
- [x] Jest suite green
- [x] No invariant breaks (run linter + tests)

---

## Task 4.3 — Add Ability Cooldown Indicators

### Task Title
Display Dash & Chrono Pulse cooldowns in HUD

### Objective
Provide visual feedback for ability availability via icons/text that grey out while on cooldown.

### Pre-Implementation Analysis

#### Documentation Dependencies
- [x] **invariants.md**: §5 State Machine Contract (cooldown vars), §9 ChronoPulse Ability
- [x] **small_comprehensive_documentation.md**: §7.3 UI/HUD Architecture

#### State & Invariant Impact Assessment
- [x] Existing states: `Player.dashTimer`, `ChronoPulse.lastActivationTime`
- [x] New invariant: _None; display only._

### Implementation Plan

- **Modify**: `client/src/scenes/UIScene.js` (add two icons + cooldown tint logic)
- **Modify**: `tests/unit/ui-scene.test.js` (new tests)

### Integration Points
- Query `scene.time.now` vs. timers to compute remaining cooldown.

### Testing Strategy
- Mock `scene.time.now` to simulate cooldown expiration.

### Task Breakdown & Acceptance Criteria
- [x] Add two 24×24 px images or text placeholders labelled **Dash** & **Pulse**.
- [x] Tint icons grey when ability is unavailable (cooldown > 0).
- [x] Unit tests verify tint/alpha values at two timestamps (inside & outside cooldown).

### Expected Output
Icons visually indicate cooldown; tests pass.

### Definition of Done
- [x] Acceptance criteria met & verified visually
- [x] Jest suite green
- [x] No invariant breaks (run linter + tests)

---

## Task 4.4: Add Pause Menu Functionality

**Objective**: Implement pause/resume functionality with overlay menu

**Priority**: High  
**Estimated Effort**: 2-3 hours  
**Status**: ✅ **COMPLETED**

**Description**: 
Add pause functionality that freezes game state and displays an overlay menu with resume option. This should pause TimeManager recording and provide visual feedback.

**Acceptance Criteria**:
- ✅ **P key pauses/resumes the game**
- ✅ **Pause overlay appears with semi-transparent background**  
- ✅ **Resume button or P key resumes gameplay**
- ✅ **TimeManager recording is paused during pause state**
- ✅ **Game state is properly frozen (no updates during pause)**

**Technical Requirements**:
- ✅ **Add P key to InputManager with isPauseJustPressed getter**
- ✅ **Extend GameScene to handle pause input and scene management**
- ✅ **Extend UIScene to show pause overlay when launched with pause flag**
- ✅ **Add pauseRecording/resumeRecording methods to TimeManager**
- ✅ **Emit gamePaused/gameResumed events for system coordination**

**Files to Modify**:
- ✅ `client/src/systems/InputManager.js` - Add pause key support
- ✅ `client/src/scenes/GameScene.js` - Add pause logic to update loop
- ✅ `client/src/scenes/UIScene.js` - Add pause menu overlay
- ✅ `client/src/systems/TimeManager.js` - Add pause recording functionality

**Testing Strategy**:
- ✅ **Unit tests for InputManager pause key functionality**
- ✅ **Unit tests for GameScene pause logic**  
- ✅ **Unit tests for UIScene pause menu display**
- ✅ **Integration tests for pause/resume flow**
- ✅ **Tests for TimeManager pause recording**

**Definition of Done**:
- ✅ **All acceptance criteria met**
- ✅ **Code follows project patterns and style**
- ✅ **Comprehensive test coverage (unit + integration)**
- ✅ **No regressions in existing functionality**
- ✅ **Documentation updated (if new invariants created)**
- ✅ **Manual testing completed**

**Dependencies**: 
- Tasks 4.2, 4.3 (UI system foundation)

**Notes**:
- Pause should freeze all game objects but maintain UI responsiveness
- Consider visual feedback for pause state (overlay tint, pause icon)
- Ensure pause state doesn't interfere with time rewind mechanics

---

## Task 4.5 — Set Up Howler.js Audio Manager

### Task Title
Create global `AudioManager` singleton

### Objective
Centralize audio loading & playback using Howler.js.

### Pre-Implementation Analysis

#### Documentation Dependencies
- [x] **invariants.md**: §2 Game Config audio.noAudio == true
- [x] **small_comprehensive_documentation.md**: §3 Advanced Audio

#### State & Invariant Impact Assessment
- [ ] **New state**: `AudioManager` global volumes (bgmVolume, sfxVolume)
- [ ] **New invariant**: AudioManager must be initialized exactly once before any sound play.

### Implementation Plan

- **Create**: `