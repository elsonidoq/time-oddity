# Phase 06 – Audio Integration

> **Milestone Goal:** Add foundational audio functionality (music, SFX, mute toggle) using Howler.js while respecting all project invariants and testing standards.

---

## Task 06.01 – Background Music Loop

### Objective
Play looping background music in `GameScene` via a new `AudioManager` singleton backed by Howler.js.

### Task ID
06.01

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md**: §2 *Phaser Game Configuration* ( `audio.noAudio` must remain `true` ), §15 *Asset & Animation Keys* (music file path)
- [ ] **testing_best_practices.md**: *State-Based Testing* and *Centralized Mock Architecture* (extend `howlerMock`)
- [ ] **comprehensive_documentation.md**: §3.3 *Integration with Phaser* (Howler pattern)

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: Global mute state (none yet), Scene lifecycle order (Boot → Menu → Game)
- [ ] **New states/invariants**: `AudioManager.isMuted` boolean; music must pause during rewind (§7 TimeManager visual overlay depth unaffected)
- [ ] **Time reversal compatibility**: Music is non-diegetic; no interaction with TimeManager buffer.

### Implementation Plan

#### Files / Classes to Change
- **Create**: `client/src/systems/AudioManager.js`
- **Modify**: `client/src/scenes/GameScene.js` (instantiate manager in `create()`), Jest `howlerMock.js`

#### Integration Points
- Systems affected: GameScene lifecycle, future UI volume controls
- External libraries: `howler@^2.2.3` (already installed)

#### Testing Strategy
- **New test**: `tests/unit/audio-background-music.test.js`
  - Assert `Howl` instantiated with `{ loop: true, volume: 0.8 }`
  - Verify `audioManager.playMusic()` called during `GameScene.create()`
- **Mock requirements**: Extend `tests/__mocks__/howlerMock.js` with spies for `play`, `stop`, and constructor.

### Task Breakdown & Acceptance Criteria
- [ ] 06.01.1  Create `AudioManager` class exposing `playMusic(key)`, `stopMusic()`, `isMuted`.
- [ ] 06.01.2  Pre-load placeholder music (`sfx_magic.ogg`) in `GameScene.preload()`.
- [ ] 06.01.3  Instantiate manager in `GameScene.create()` and start loop.
- [ ] 06.01.4  Unit test passes with mocks; no regressions.

### Expected Output
Background music plays on game start, loops seamlessly, and Jest suite passes.

### Risk Assessment
- **Complexity**: Low – isolated system.
- **Dependencies**: Requires Howler mock extension.
- **Fallback**: If music file missing, log warning but do not crash.

### Definition of Done
Checklist per template plus CI green.

---

## Task 06.02 – Core Sound Effects (Jump, Coin, Damage)

### Objective
Trigger three core SFX via `AudioManager` when game events occur.

### Task ID
06.02

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md**: §16 *Runtime Event Names* (`playerEnemyCollision`, `levelCompleted` etc.)
- [ ] **testing_best_practices.md**: *Centralized Mock Architecture* (reuse `howlerMock` spies)
- [ ] **comprehensive_documentation.md**: §3.3 Howler integration pattern

#### State & Invariant Impact Assessment
- [ ] **Existing states**: None altered
- [ ] **New states**: Sound key registry inside `AudioManager`
- [ ] **Time reversal compatibility**: SFX are fire-and-forget; no buffer interaction

### Implementation Plan

#### Files / Classes to Change
- **Modify**: `AudioManager.js` (add `playSfx(key)`); `Player.js`, `Coin.js`, `Player.takeDamage()` implementation
- **Modify**: `howlerMock.js` to capture `play` calls

#### Integration Points
- Player state machine (`JumpState.enter()`)
- Coin collection callback in `CollisionManager` or `Coin.collect()`
- Damage handler `Player.takeDamage()`

#### Testing Strategy
- **New tests**: `tests/unit/audio-sfx.test.js`
  - Spy on `AudioManager.playSfx` for each action
  - Ensure correct sound key passed (`jump`, `coin`, `playerHurt`)

### Task Breakdown & Acceptance Criteria
- [ ] 06.02.1  Register SFX in `AudioManager` with pre-loaded sprites or individual files.
- [ ] 06.02.2  Invoke `playSfx('jump')` in `JumpState.enter()`.
- [ ] 06.02.3  Invoke `playSfx('coin')` upon coin collection.
- [ ] 06.02.4  Invoke `playSfx('playerHurt')` inside `Player.takeDamage()`.
- [ ] 06.02.5  All unit tests pass; no unrelated test failures.

### Expected Output
Appropriate SFX play during gameplay actions without latency; tests green.

### Risk Assessment
- **Potential complexity**: Minimal; ensure coin physics order (§13.5) unaffected.
- **Dependencies**: Relies on Task 06.01's `AudioManager`.

### Definition of Done
All acceptance criteria met; no test regressions.

---

## Task 06.03 – Master Mute Toggle via 'M' Key & UI Button

### Objective
Allow players to mute/unmute all game audio using the 'M' key and a HUD button.

### Task ID
06.03

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md**: §4 *Input Mapping* (add 'M' key without conflicting actions)
- [ ] **testing_best_practices.md**: *InputManager getters* & mock keys
- [ ] **comprehensive_documentation.md**: §1.5 Input Handling, §3.3 Howler integration

#### State & Invariant Impact Assessment
- [ ] **Existing states**: Input mappings must stay deterministic
- [ ] **New states/invariants**: `AudioManager.isMuted` flag must control Howler global mute
- [ ] **Time reversal compatibility**: N/A

### Implementation Plan

#### Files / Classes to Change
- **Modify**: `InputManager.js` (add `isMutePressed()` based on 'M')
- **Modify**: `AudioManager.js` (add `toggleMute()` that proxies to `Howler.mute()`)
- **Modify**: `UIScene.js` (add mute button with `setInteractive()`)
- **Modify**: Jest mocks for keyboard key 'M'

#### Integration Points
- Game loop: `GameScene.update()` listens for `isMutePressed()` and calls `AudioManager.toggleMute()`
- HUD: UIScene button emits `toggleMuteRequest` event; GameScene or a central mediator invokes manager

#### Testing Strategy
- **New tests**: `tests/unit/audio-mute-toggle.test.js`
  - Simulate key press via `phaserKeyMock`
  - Assert `Howler.mute(true/false)` called
  - Verify HUD button emits correct event

### Task Breakdown & Acceptance Criteria
- [ ] 06.03.1  Extend `InputManager` with mute key support and unit tests.
- [ ] 06.03.2  Implement `AudioManager.toggleMute()` and integrate with `Howler.mute()`.
- [ ] 06.03.3  Add interactive mute button to `UIScene` with visual on/off state.
- [ ] 06.03.4  Wire event flow and update existing tests; all pass.

### Expected Output
Pressing 'M' or clicking HUD button toggles all audio; visual state reflects mute status; tests pass.

### Risk Assessment
- **Complexity**: Moderate UI work; ensure button respects responsive layout (§1.7)
- **Dependencies**: Requires AudioManager from 06.01
- **Fallback**: If Howler not ready, toggle logs warning.

### Definition of Done
All acceptance criteria satisfied; CI green; no regressions. 