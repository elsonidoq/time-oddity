## Task 03.01 – Follow Player with Main Camera

### Objective
Activate basic camera tracking of the player with world-bounds clamping.

### Task Reference
Functional Gap 3 – Camera System

### Pre-Implementation Analysis
- Docs: invariants.md §3 Scene Lifecycle, §2 Phaser Config (width/height constants)
- small_comprehensive_documentation.md §1.6 Cameras

### Implementation
- Modify `client/src/scenes/GameScene.js` → in `create()`, after player created, call `this.cameras.main.startFollow(this.player, true, 0.1, 0.1)`; set deadzone to keep player near center.
- Add optional `cameraFollow` boolean to level config for future.

### Tests
- Unit test using PhaserSceneMock verifying `startFollow` called with player.

---

## Task 03.02 – Smooth Camera Lerp & Tests

Objective: Refine camera movement with lerp factors, verify via unit test that camera scroll updates towards player position across `update` cycles (mocking delta).

Plan:
- Expose constants in GameScene for lerp values (0.1 default) to support tuning.
- Integration test runs 3 update ticks and asserts camera scroll.x approaches player.x.

Definition of Done: Both tests pass; manual run shows camera following player across level. 