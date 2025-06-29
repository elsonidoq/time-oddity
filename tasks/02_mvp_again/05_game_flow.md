## Game Flow – Phase 05

---

### Task 05.01.1 – Introduce `GoalTile` Entity

#### Objective
Create a reusable, physics-enabled `GoalTile` entity that represents the level-exit tile, configured with a specific tileKey for its visual representation.

#### Task ID
05.01.1

#### Pre-Implementation Analysis
• **Documentation Dependencies**  
  – invariants.md §13 (Level / Platform Geometry) and §10 (CollisionManager Expectations)  
  – testing_best_practices.md «State-Based Testing», «Centralised Mock Architecture»  
  – comprehensive_documentation.md §1.3 (Asset and Sprite Management)  
• **State & Invariant Impact**  
  – No new global states; entity follows existing `Entity` base contract.  
  – Time-reversal compatibility handled by default `TemporalState` recording.  

#### Implementation Plan
• **Create** `client/src/entities/GoalTile.js` (extends `Entity`, static body, `setAllowGravity(false)`).  
• **Modify** `client/src/scenes/BootScene.js` to preload goal tile textures based on tileKey configuration.  
• **Modify** `client/src/systems/SceneFactory.js` to expose a `createGoalTile(x,y,tileKey)` helper returning a pooled `GoalTile` with the specified texture.  
• **Ensure** GoalTile constructor accepts tileKey parameter and sets the appropriate texture using `this.setTexture(tileKey)`.

#### Testing Strategy
• **New test** `tests/unit/goal-tile.test.js` verifying:  
  1. Sprite is added to physics group **after** physics configuration (see invariants.md §13).  
  2. Body is immovable & gravity-disabled.  
  3. `GoalTile` registers with `TimeManager`.  
  4. GoalTile renders with the correct texture based on tileKey parameter.
• Use `phaserSceneMock` + fake timers.

#### Task Breakdown & Acceptance Criteria
- [x] Entity file created, exports class `GoalTile` with tileKey constructor parameter.  
- [x] BootScene loads goal tile textures (support multiple tileKeys as needed).  
- [x] SceneFactory can spawn goal tiles with specified tileKey.  
- [x] GoalTile renders the correct texture when instantiated.
- [x] Unit tests above are green.

#### Expected Output
`npm test goal-tile` passes; game can render a static goal sprite with the configured texture in debug scene.

#### Risk Assessment
Low – isolated entity, no side-effects.

#### Definition of Done
- [ ] All acceptance criteria satisfied & CI green.  
- [ ] No regressions; linter clean.

---

### Task 05.01.2 – Integrate `GoalTile` Into Level Data & SceneFactory

#### Objective
Allow JSON level files to define goal-tile coordinates and tileKey, spawning them automatically with the correct visual representation.

#### Task ID
05.01.2

#### Pre-Implementation Analysis
• Docs: invariants.md §3 (Scene Lifecycle), §13 (Platform Geometry).  
• No new invariants.  

#### Implementation Plan
• **Modify** level JSON schema: add optional `goal: { x, y, tileKey }` where tileKey specifies the texture to load and render.  
• **Modify** `SceneFactory.loadLevel(config)` to read `goal` node and call `createGoalTile(x,y,tileKey)`.  
• **Add** fallback: if tileKey absent, factory warns via `console.warn` and uses default texture.  
• **Ensure** BootScene preloads all potential goal tile textures referenced in level configurations.

#### Testing Strategy
• **Integration test** `tests/integration/scene-factory-goal-tile.test.js` loading minimal level with goal → asserts:  
  – GoalTile instance exists in scene, and is using the corresponding tileKey texture.  
  – Coordinates match JSON.  
  – Texture is correctly applied to the sprite.
  – No errors when `goal` omitted.
  – Fallback behavior works when tileKey is missing.

#### Task Breakdown & Acceptance Criteria
- [x] JSON schema updated in sample `test-level.json` with tileKey field.  
- [x] SceneFactory spawns GoalTile with specified tileKey.  
- [x] GoalTile renders the correct texture from tileKey.
- [x] Integration tests pass.

#### Expected Output
`npm test scene-factory-goal-tile` green; running game shows goal tile loaded via config with correct texture.

#### Risk Assessment
Medium – touches SceneFactory; ensure no ordering regression with platform config (§13.3).

#### Definition of Done
See acceptance criteria; full suite green.

---

### Task 05.01.3 – Detect Goal Overlap & Emit `levelCompleted`

#### Objective
End the level when the player overlaps any active `GoalTile`.

#### Task ID
05.01.3

#### Pre-Implementation Analysis
• Docs: invariants.md §16 (Runtime Event Names) – we will append new event `levelCompleted`.  
• Update invariants.md in same PR to record the new constant.

#### Implementation Plan
• **Modify** `client/src/scenes/GameScene.js`  
  1. Add Arcade overlap between `this.players` and `this.goalTiles`.  
  2. In callback, pause physics (`this.physics.world.pause()`), emit `this.events.emit('levelCompleted')`.  

#### Testing Strategy
• **Integration test** `tests/integration/level-complete-event.test.js`  
  – Mocks Scene, places player at goal tile, runs `update()`, asserts event emitted once & physics paused.

#### Task Breakdown & Acceptance Criteria
- [x] Overlap sets up in `create()`.  
- [x] Callback dispatches event & pauses world.  
- [x] Integration test passes.

#### Expected Output
Game pauses and logs `levelCompleted` when touching goal.

#### Risk Assessment
Medium – must not break rewind or pause menu; ensure unique event name.

#### Definition of Done
All tests green; invariants.md updated.

---

### Task 05.02.1 – Display Level-Complete Overlay in UIScene

#### Objective
Show a centred panel saying "Level Complete" when `levelCompleted` is emitted.

#### Task ID
05.02.1

#### Pre-Implementation Analysis
• Docs: invariants.md §3 (Scene Lifecycle), §17 (Testing & Mock Integration).  
• No new state structures.

#### Implementation Plan
• **Modify** `client/src/scenes/UIScene.js`  
  – Listen to global event emitter (`this.scene.get('GameScene').events`) for `levelCompleted`.  
  – Create text/image panel at depth 1002 (above rewind overlay §7.1).  
  – Pause its tweens if any.

#### Testing Strategy
• **Unit test** `tests/unit/ui-scene-level-complete.test.js`  
  – Emits fake event, asserts panel visible.

#### Task Breakdown & Acceptance Criteria
- [x] Panel appears only after event.  
- [x] Depth above 1000.  
- [x] Unit test green.

#### Expected Output
Overlay visible when level ends.

#### Risk Assessment
Low.

#### Definition of Done
Criteria met; lint clean.

---

### Task 05.02.2 – Return to Menu on SPACE after Level Complete

#### Objective
Allow player to press SPACE to transition back to `MenuScene` after overlay appears.

#### Task ID
05.02.2

#### Pre-Implementation Analysis
• Docs: invariants.md §3 (Scene Lifecycle), §4 (Input Mapping – Pause key is P, we will **not** reuse).  

#### Implementation Plan
• In `UIScene`, when overlay active, listen for `InputManager.isJumpPressed()` (SPACE) **JustDown**.  
• On press:  
  1. Stop `GameScene`, start `MenuScene`.  
  2. Clear overlay & listeners.

#### Testing Strategy
• **Unit test** `tests/unit/ui-scene-level-complete-input.test.js`  
  – Simulate event then SPACE key; assert `this.scene.start` called with `'MenuScene'`.

#### Task Breakdown & Acceptance Criteria
- [x] Key press transitions scenes.  
- [x] Overlay cleaned up.  
- [x] Tests pass.

#### Expected Output
After finishing level, pressing SPACE returns to main menu.

#### Risk Assessment
Low.

#### Definition of Done
Full CI green; manual smoke-test passes.

---

// End of Phase 05 tasks 
