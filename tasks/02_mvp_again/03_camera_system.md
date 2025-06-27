# Camera System – Phase 03 Tasks

> **This document supersedes the previous draft.** Each task below follows the official Time Oddity `task_template.md` and can be executed by an engineer LLM in strict sequence.

---

## Task Title
Enable Main Camera Follow

## Objective
Activate the main camera so it follows the single `Player` instance during gameplay while respecting world-bounds clamping.

## Task ID:
Task 03.01 – **COMPLETED**

## Pre-Implementation Analysis

### Documentation Dependencies
- [x] **invariants.md sections to review**: §2 *Phaser Config* (width/height constants), §3 *Scene Lifecycle* (single‐player assumption)
- [x] **testing_best_practices.md sections to apply**: *PhaserSceneMock* usage, *Unit vs Integration* strategy (Test Pyramid)
- [x] **small_comprehensive_documentation.md sections to reference**: §1.6 *Cameras*

### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: `this.cameras.main` must remain the single active camera; width/height constants (1280×720)
- [x] **New states/invariants to create**: None
- [x] **Time reversal compatibility**: No interaction with TimeManager – safe

## Implementation Plan

### Files/Classes to Change
- **Modify**: `client/src/scenes/GameScene.js` – inside `create()` after player creation
- **Create**: `tests/unit/camera-follow.test.js`

### Integration Points
- **Systems affected**: Rendering Camera; `GameScene` only
- **State machines**: None
- **External libraries**: Existing Phaser mocks only

### Testing Strategy
- **Test files to create/update**: `tests/unit/camera-follow.test.js`
- **Key test cases**:
  1. `startFollow` is called once with the scene's `player` sprite and correct parameters
  2. `setBounds` is called to establish world boundaries
  3. Camera follow is properly initialized after player creation
- **Mock requirements**: Use `phaserSceneMock.js` to simulate camera API (`startFollow`, `setDeadzone`, `setBounds`)

## Task Breakdown & Acceptance Criteria
- [x] *Set world bounds first*: Call `this.cameras.main.setBounds(0, 0, worldWidth, worldHeight)` before follow setup
- [x] *Add camera follow*: Call `this.cameras.main.startFollow(this.player, true, 0.1, 0.1)` immediately after player creation
- [x] *Add dead-zone*: `this.cameras.main.setDeadzone(this.sys.game.config.width * 0.3, this.sys.game.config.height * 0.25)`
- [x] *Verify camera state*: Ensure `this.cameras.main.followOffset` is set to center the player
- [x] *Unit tests pass*: The new Jest spec spies on `startFollow`, `setDeadzone`, and `setBounds` with correct arguments

## Expected Output
- Player remains centred while moving; screen scrolls when player approaches edges
- Camera smoothly follows player within world bounds
- `npm test` shows the new spec green with no regressions

## Risk Assessment
- **Potential complexity**: Medium; camera setup requires proper order (bounds → follow → deadzone)
- **Dependencies**: Accurate mocks for `Phaser.Cameras.Scene2D.Camera` functions and world bounds
- **Common issues**: Camera not following often due to missing world bounds or incorrect follow target
- **Fallback plan**: If follow causes jitter, verify world bounds are set and player sprite exists before follow setup

## Definition of Done
- [x] All acceptance criteria met & unit tests pass
- [x] Camera follows player smoothly in manual testing
- [x] CI suite green
- [x] No linter/type errors
- [x] Task marked complete

---

## Task Title
Expose Camera Lerp & Dead-Zone Constants

## Objective
Refactor camera follow parameters (lerpX, lerpY, deadZoneX, deadZoneY) into easily tunable constants and ensure smooth movement.

## Task ID:
Task 03.02 – **COMPLETED**

## Pre-Implementation Analysis

### Documentation Dependencies
- [x] **invariants.md sections to review**: §2 *Phaser Config*, §3 *Scene Lifecycle*
- [x] **testing_best_practices.md sections to apply**: *Refactor under Green*, *Integration Tests*
- [x] **small_comprehensive_documentation.md sections to reference**: §1.6 *Cameras*

### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: Camera follow behaviour from Task 03.01
- [x] **New states/invariants to create**: Introduce `CAMERA_LERP_X/Y` & `CAMERA_DEADZONE_X/Y` constants in `GameScene` (static or top-module constants)
- [x] **Time reversal compatibility**: Irrelevant

## Implementation Plan

### Files/Classes to Change
- **Modify**: `client/src/scenes/GameScene.js` – hoist magic numbers to constants and reference them in `startFollow` & `setDeadzone`.
- **Create**: `tests/integration/camera-lerp.integration.test.js`

### Integration Points
- **Systems affected**: Camera follow logic in `GameScene.update()` remains untouched; only parameterization.
- **External libraries**: None

### Testing Strategy
- **Test files to create/update**: `tests/integration/camera-lerp.integration.test.js`
- **Key test cases**:
  1. After three `update` ticks with mocked delta (16 ms), camera `scrollX` approaches `player.x` within 90 % of expected lerp result.
  2. Constants are exported or accessible for tuning (regression guard).
- **Mock requirements**: Extend `phaserSceneMock` camera with `scrollX/scrollY` and basic lerp simulation if absent.

## Task Breakdown & Acceptance Criteria
- [x] *Refactor constants*: Replace hard-coded `0.1` & dead-zone literals with `CAMERA_*` constants.
- [x] *Export for tests*: Ensure constants are exported or attached to `GameScene` for inspection.
- [x] *Integration spec*: Simulate player movement (`player.x += 400`) and verify camera scrolls toward it respecting `CAMERA_LERP_X`.

## Expected Output
- Developers can tune camera feel by editing a single constant section.
- Integration test demonstrates smoothing behaviour.

## Risk Assessment
- **Potential complexity**: Moderate – test must replicate Phaser lerp behaviour with mocks.
- **Dependencies**: Mock update extensions.
- **Fallback plan**: If mocks become heavy, downgrade to state-based test that spies on `camera.lerp` values instead of `scrollX` physics.

## Definition of Done
- [x] Constants extracted & referenced correctly.
- [x] Integration test passes and existing tests remain green.
- [x] No regressions or linter errors.

---

## Task Title
Optional `cameraFollow` Flag in Level Config

## Objective
Allow level designers to enable/disable automatic camera follow via a boolean `cameraFollow` property in level configuration JSON.

## Task ID:
Task 03.03

## Pre-Implementation Analysis

### Documentation Dependencies
- [ ] **invariants.md sections to review**: §3 *Scene Lifecycle* (single player group), §14 *Level / Platform Geometry* (config ordering rules)
- [ ] **testing_best_practices.md sections to apply**: *Config-Driven Features*, *State-Based Testing*
- [ ] **small_comprehensive_documentation.md sections to reference**: §14.1 *Directory Structure* (config folder)

### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: Camera follow behaviour when flag is `true` (default) – matches Tasks 03.01-03.02.
- [ ] **New states/invariants to create**: New optional property `cameraFollow` defaulting to `true`.
- [ ] **Time reversal compatibility**: None

## Implementation Plan

### Files/Classes to Change
- **Modify**:
  - `client/src/scenes/GameScene.js` – read `data.cameraFollow` or fallback to `true`.
  - `client/src/config/test-level.json` (and copies) – add explicit `"cameraFollow": true` field for clarity.
  - `systems/SceneFactory.js` (if it pipelines level data) – pass the flag through to `GameScene`.
- **Create**: `tests/unit/level-config-camera-flag.test.js`

### Integration Points
- **Systems affected**: Scene loading flow via `SceneFactory`.
- **External libraries**: None

### Testing Strategy
- **Test files to create/update**: `tests/unit/level-config-camera-flag.test.js`
- **Key test cases**:
  1. When `cameraFollow` is `false`, `startFollow` is **not** called.
  2. When omitted or `true`, behaviour matches Task 03.01.
- **Mock requirements**: PhaserSceneMock; JSON level config loaded via jest `mock`.

## Task Breakdown & Acceptance Criteria
- [ ] *Add flag to config schema* with default `true`.
- [ ] *Conditional startFollow*: Guard existing `startFollow` call behind flag.
- [ ] *Unit spec*: Assert both flag states.

## Expected Output
- Designers can disable camera follow for cut-scene or puzzle levels via config.
- Unit tests confirm flag behaviour.

## Risk Assessment
- **Potential complexity**: Low.
- **Dependencies**: `SceneFactory` correctly propagating level JSON to `GameScene`.
- **Fallback plan**: If `SceneFactory` layering is complex, temporarily pass flag via `GameScene.init(data)` argument until full pipeline is refactored.

## Definition of Done
- [ ] Flag respected in runtime.
- [ ] Tests green across both flag states.
- [ ] No linter errors; CI green. 