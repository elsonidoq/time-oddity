## Task 02.01.1 – Player Damage Reception (Core Logic)

### Objective
Introduce a robust `takeDamage(amount)` method on `Player` that decrements health, clamps at **0**, and triggers optional hit-feedback without any UI concerns.

### Task ID:
Task 02.01.1

### Pre-Implementation Analysis
- [ ] **invariants.md sections to review**: §6 *Player Invariants*, §18.2 *Entity Base State*
- [ ] **testing_best_practices.md sections to apply**: *State-Based Testing*, *Centralized Mock Architecture*
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.2 *Platformer Character Controller*, §14.2 *Component Architecture*

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: `Player.health`, `Player.maxHealth`, Time Reversal recording of `health`
- [ ] **New states/invariants to create**: None
- [ ] **Time reversal compatibility**: Health already recorded in base Entity state; no additional work required.

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `client/src/entities/Player.js` – add `takeDamage(amount)` which:
  1. Subtracts `amount` from `this.health`.
  2. Clamps result between `0` and `this.maxHealth`.
  3. Emits `'playerDamaged'` via `this.scene.events` (depth: see §16 Runtime Event Names).
  4. Optionally triggers placeholder hit flash (toggle `visible` briefly).

#### Integration Points
- **Systems affected**: Any future UI listeners (handled in next task)
- **State machines**: None
- **External libraries**: None

### Testing Strategy
- **Test files to create**: `tests/unit/player-damage.test.js`
- **Key test cases**:
  1. Health reduces by exact damage amount.
  2. Health never drops below 0.
  3. Event `'playerDamaged'` emitted once per call.
- **Mock requirements**: Use existing `phaserSceneMock` & `eventEmitterMock`.

### Task Breakdown & Acceptance Criteria
- [x] Implement `takeDamage(amount)` with clamping.
- [x] Emit `'playerDamaged'` event.
- [x] Unit tests outlined above pass.

### Expected Output
`Player.takeDamage` works; tests green.

### Risk Assessment
- **Complexity**: Low – isolated method.
- **Dependencies**: None.
- **Fallback plan**: Revert to previous `Player.js` version if tests fail.

### Definition of Done
- [x] All acceptance criteria met
- [x] All project tests pass
- [x] No new linter/type errors
- [x] No invariant violations

---

## Task 02.01.2 – Display Player Health in UIScene

### Objective
Render the player's current health in `UIScene` using the Phaser registry so HUD updates automatically.

### Task ID:
Task 02.01.2

### Pre-Implementation Analysis
- [ ] **invariants.md sections to review**: §3 *Scene Lifecycle*, §16 *Runtime Event Names*
- [ ] **testing_best_practices.md sections to apply**: *Centralized Mock Architecture*, *State-Based Testing*
- [ ] **small_comprehensive_documentation.md sections to reference**: §14.2 *Component Architecture (UIScene)*

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: Phaser registry keys unrelated to health
- [ ] **New states/invariants to create**: `registry.get('playerHealth')` must be kept in sync
- [ ] **Time reversal compatibility**: Display only – no state recorded

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `client/src/scenes/UIScene.js` – on `create()`, add bitmap text or bar that reads `this.registry.get('playerHealth')` and listens to `'playerDamaged'` event to update.

#### Integration Points
- **Systems affected**: Event bus (`Scene.events`)
- **External libraries**: None

### Testing Strategy
- **Test files to create**: `tests/unit/ui-scene-health-display.test.js`
- **Key test cases**:
  1. Health text initially matches registry value.
  2. Upon `'playerDamaged'` event with updated registry, display updates.
- **Mock requirements**: Use `phaserSceneMock`.

### Task Breakdown & Acceptance Criteria
- [x] Add health text/bar to `UIScene`.
- [x] Subscribe to `'playerDamaged'` and update display.
- [x] Unit tests pass.

### Expected Output
HUD visually reflects health changes; tests green.

### Risk Assessment
- **Complexity**: Low
- **Dependencies**: Requires Task 02.01.1 event emission
- **Fallback plan**: Hide health display until bugs fixed.

### Definition of Done
- [x] Acceptance criteria met & tests pass
- [x] No regressions in UI

---

## Task 02.02 – Apply Collision Damage to Player

### Objective
Extend `CollisionManager.setupPlayerEnemyCollision()` so that touching an enemy inflicts damage via `player.takeDamage(enemy.damage)` **before** emitting `'playerEnemyCollision'`.

### Task ID:
Task 02.02

### Pre-Implementation Analysis
- [x] **invariants.md sections to review**: §10 *CollisionManager Expectations*, §6 *Player Invariants*
- [x] **testing_best_practices.md sections to apply**: *Integration Testing*, *Centralized Mock Architecture*
- [x] **small_comprehensive_documentation.md sections to reference**: §14.2 *Component Architecture*, §7.2 *Platformer Controller*

#### State & Invariant Impact Assessment
- [x] Preserve existing collider creation & event emission order.
- [x] No new invariants introduced.

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `client/src/entities/Enemy.js` – add `damage` property (default 10)
- **Modify**: `client/src/systems/CollisionManager.js` – within collision callback, call `player.takeDamage(enemy.damage)` then emit `'playerEnemyCollision'`.

#### Systems affected
- CollisionManager

### Testing Strategy
- **Test files to create**: `tests/integration/enemy-collision-player-damage.test.js`
- **Key cases**:
  1. Collision reduces player health by enemy.damage value.
  2. `'playerEnemyCollision'` still emitted.
- **Mock requirements**: `phaserSceneMock` for physics, keys.

### Task Breakdown & Acceptance Criteria
- [x] Add `damage` to Enemy with default.
- [x] Update collision callback.
- [x] Integration tests pass.

### Expected Output
Player loses health upon enemy collision; existing event unaffected.

### Risk Assessment
- **Complexity**: Medium – touches collision logic.
- **Dependencies**: Requires Task 02.01.1

### Definition of Done
- [x] All acceptance criteria & tests pass
- [x] No physics regressions

---

## Task 02.03.1 – Enemy Death Animation & Removal

### Objective
Implement graceful enemy death: play death animation/SFX, then remove enemy 300 ms later.

### Task ID:
Task 02.03.1

### Pre-Implementation Analysis
- [x] **invariants.md sections to review**: §8 *Enemy / Freeze Contract*, §18.4 *Enemy State*
- [x] **testing_best_practices.md sections to apply**: *State-Based Testing*
- [x] **small_comprehensive_documentation.md sections to reference**: §2.1 *GSAP Core API* (if using GSAP), §14.2 *Component Architecture*

#### State & Invariant Impact Assessment
- Preserve enemy object until `destroy()`; ensure TimeManager handles inactive objects.

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `client/src/entities/Enemy.js`
  1. Add `die()` method (or extend existing) to:
     - Play `'enemy-death'` animation (sprite-sheet assumed preloaded).
     - Play death SFX via AudioManager.
     - Call `this.scene.time.delayedCall(300, () => this.destroy())`.

### Testing Strategy
- **Test files to create**: `tests/unit/enemy-death.test.js`
- **Key cases**:
  1. `die()` sets `active` to false immediately.
  2. Schedules `destroy()` exactly once.
- **Mock requirements**: Fake `scene.time` using jest fake timers.

### Task Breakdown & Acceptance Criteria
- [x] Implement death sequence.
- [x] Unit tests pass.

### Expected Output
Enemy visually dies then disappears.

### Risk Assessment
- **Complexity**: Low.

### Definition of Done
- [x] Acceptance criteria met & tests green

---

## Task 02.03.2 – Emit enemyDefeated Event & Score Hook

### Objective
After an enemy dies, emit `'enemyDefeated'` on the scene event emitter to allow score systems to react.

### Task ID:
Task 02.03.2

### Pre-Implementation Analysis
- [x] **invariants.md sections to review**: §16 *Runtime Event Names*
- [x] **testing_best_practices.md sections to apply**: *Event-Driven Testing*

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `client/src/entities/Enemy.js` – within `die()` after playing animation, emit `'enemyDefeated'` **before** scheduling destroy.

### Testing Strategy
- **Test files to create**: `tests/unit/enemy-defeated-event.test.js`
- **Key cases**: Verify event emitted exactly once with enemy reference.

### Task Breakdown & Acceptance Criteria
- [x] Emit event.
- [x] Add unit test.

### Expected Output
Scene receives `'enemyDefeated'` with enemy data.

### Risk Assessment
Minimal.

### Definition of Done
- [x] Tests pass
- [x] No event name typos (see invariants §16)

---

## Definition of Done for Feature 02 – Enemy Interactions
- All 02.01.x, 02.02, 02.03.x tasks are complete and individually green.
- UIScene health HUD works in-game.
- Player health correctly decreases and clamps.
- Enemies die with feedback and emit `'enemyDefeated'`.
- Existing test suite remains green; coverage ≥ current baseline. 