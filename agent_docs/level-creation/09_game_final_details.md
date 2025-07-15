# Game Final Details: Fine-Grained Implementation Plan

## 🎯 Objective
Implement comprehensive game mechanics including player damage immunity, death system, time reversal enhancements, and tile rendering fixes. This plan provides atomic, testable tasks for sequential implementation with minimal risk.

## 📋 Requirements Summary
1. **Player Damage Immunity**: 2-second invulnerability period with blinking visual effect
2. **Death System**: Game Over overlay when health reaches 0
3. **Time Reversal Compatibility**: Health and death must be affected by rewind
4. **Enhanced Time Reversal**: Red overlay instead of blue, with additional visual/sound effects
5. **Tile Rendering Fix**: Tiles only render correctly at zoom = 1, fix transparency and glitches

---

## Task 1: Implement Player Damage Immunity System

### Task 1.1: Add Player Invulnerability State Management

**Objective**: Implement a 2-second invulnerability period after taking damage with proper state management.

**Task ID**: Task 1.1

**Pre-Implementation Analysis**:
- [x] **invariants.md sections to review**: §6 Player Invariants, §18.3 Player State
- [x] **testing_best_practices.md sections to apply**: State-Based Testing, TDD/BDD methodologies
- [x] **small_comprehensive_documentation.md sections to reference**: §7.2 Platformer Character Controller

**State & Invariant Impact Assessment**:
- [x] **Existing states to preserve**: Player health, dash timing, state machine
- [x] **New states/invariants to create**: `isInvulnerable`, `invulnerabilityTimer`, `invulnerabilityDuration`
- [x] **Time reversal compatibility**: Invulnerability state must be recorded by TimeManager

**Implementation Plan**:

**Files/Classes to Change**:
- **Modify**: `client/src/entities/Player.js` - Add invulnerability properties and logic
- **Create**: `tests/unit/player-invulnerability.test.js` - Unit tests for invulnerability system

**Integration Points**:
- **Systems affected**: Player damage system, TimeManager state recording
- **State machines**: Player state machine (invulnerability state)
- **External libraries**: None

**Testing Strategy**:
- **Test files to create/update**: `tests/unit/player-invulnerability.test.js`
- **Key test cases**:
  1. Player becomes invulnerable for 2 seconds after taking damage
  2. Invulnerability prevents additional damage during immunity period
  3. Invulnerability expires after 2 seconds
  4. Time reversal preserves invulnerability state
- **Mock requirements**: Use existing `phaserSceneMock` with time mocking

**Task Breakdown & Acceptance Criteria**:
- [x] Add invulnerability properties to Player constructor
- [x] Implement `isInvulnerable` getter method
- [x] Modify `takeDamage()` to set invulnerability state
- [x] Add invulnerability timer update in Player.update()
- [x] Create comprehensive unit tests
- [x] Verify TimeManager state recording includes invulnerability

**Expected Output**: Player becomes invulnerable for 2 seconds after taking damage, preventing additional damage during this period.

**Risk Assessment**:
- **Potential complexity**: Low - straightforward state management
- **Dependencies**: Existing Player damage system
- **Fallback plan**: Revert to original damage system if issues arise

**Definition of Done**:
- [x] All acceptance criteria are met
- [x] Expected output is achieved and verified
- [x] All project tests pass (locally and in CI)
- [x] Code reviewed and approved
- [x] **invariants.md updated with new invulnerability state**
- [x] No new linter or type errors
- [x] No regressions in related features

---

### Task 1.2: Implement Blinking Visual Effect During Invulnerability

**Objective**: Add a blinking visual effect that clearly indicates the player is invulnerable.

**Task ID**: Task 1.2

**Pre-Implementation Analysis**:
- [x] **invariants.md sections to review**: §15 Asset & Animation Keys, §16 Runtime Event Names
- [x] **testing_best_practices.md sections to apply**: GSAP Mocking, Visual Effect Testing
- [x] **small_comprehensive_documentation.md sections to reference**: §2.1 GSAP Core API

**State & Invariant Impact Assessment**:
- [x] **Existing states to preserve**: Player visibility, animation states
- [x] **New states/invariants to create**: Blinking animation timeline, visual effect state
- [x] **Time reversal compatibility**: Blinking effect must be paused during rewind

**Implementation Plan**:

**Files/Classes to Change**:
- **Modify**: `client/src/entities/Player.js` - Add blinking effect logic
- **Create**: `tests/unit/player-blink-effect.test.js` - Unit tests for visual effects

**Integration Points**:
- **Systems affected**: Player visual system, GSAP animation
- **State machines**: None
- **External libraries**: GSAP for animation timeline

**Testing Strategy**:
- **Test files to create/update**: `tests/unit/player-blink-effect.test.js`
- **Key test cases**:
  1. Blinking effect starts when invulnerability begins
  2. Blinking effect stops when invulnerability ends
  3. Blinking effect pauses during time rewind
  4. Visual effect is properly cleaned up
- **Mock requirements**: GSAP mock for timeline testing

**Task Breakdown & Acceptance Criteria**:
- [x] Add blinking animation timeline property to Player
- [x] Implement `startBlinkingEffect()` method
- [x] Implement `stopBlinkingEffect()` method
- [x] Integrate blinking with invulnerability state changes
- [x] Add rewind compatibility (pause effect during rewind)
- [x] Create comprehensive unit tests
- [x] Add cleanup in Player.destroy()

**Expected Output**: Player sprite blinks visibly during the 2-second invulnerability period, providing clear visual feedback.

**Risk Assessment**:
- **Potential complexity**: Medium - GSAP integration and visual effects
- **Dependencies**: Task 1.1 completion, GSAP library
- **Fallback plan**: Use simple tint alternation if GSAP fails

**Definition of Done**:
- [x] All acceptance criteria are met
- [x] Expected output is achieved and verified
- [x] All project tests pass (locally and in CI)
- [x] Code reviewed and approved
- [x] **invariants.md updated with blinking effect state**
- [x] No new linter or type errors
- [x] No regressions in related features

---

## Task 2: Implement Player Death and Game Over System

### Task 2.1: Create Game Over Scene

**Objective**: Create a dedicated Game Over scene that appears when the player dies.

**Task ID**: Task 2.1

**Pre-Implementation Analysis**:
- [x] **invariants.md sections to review**: §3 Scene Lifecycle, §16 Runtime Event Names
- [x] **testing_best_practices.md sections to apply**: Scene Testing, Event-Driven Architecture
- [x] **small_comprehensive_documentation.md sections to reference**: §1.2 Scene System

**State & Invariant Impact Assessment**:
- [x] **Existing states to preserve**: Scene navigation, event emission patterns
- [x] **New states/invariants to create**: GameOverScene, death event handling
- [x] **Time reversal compatibility**: Game Over scene must be dismissed during rewind

**Implementation Plan**:

**Files/Classes to Change**:
- **Create**: `client/src/scenes/GameOverScene.js` - New Game Over scene
- **Modify**: `client/src/game.js` - Add GameOverScene to scene list
- **Create**: `tests/unit/game-over-scene.test.js` - Unit tests for Game Over scene

**Integration Points**:
- **Systems affected**: Scene management, event system
- **State machines**: None
- **External libraries**: None

**Testing Strategy**:
- **Test files to create/update**: `tests/unit/game-over-scene.test.js`
- **Key test cases**:
  1. Game Over scene displays when player dies
  2. Restart button returns to GameScene
  3. Menu button returns to MenuScene
  4. Scene properly handles input events
- **Mock requirements**: Use existing `phaserSceneMock`

**Task Breakdown & Acceptance Criteria**:
- [x] Create GameOverScene class extending BaseScene
- [x] Implement scene lifecycle methods (create, update, shutdown)
- [x] Add restart and menu buttons with proper event handling
- [x] Add scene to game configuration
- [x] Create comprehensive unit tests
- [x] Add proper scene cleanup and resource management

**Expected Output**: A functional Game Over scene that appears when the player dies, with options to restart or return to menu.

**Risk Assessment**:
- **Potential complexity**: Low - standard scene creation
- **Dependencies**: Existing scene system
- **Fallback plan**: Use UIScene overlay if dedicated scene fails

**Definition of Done**:
- [x] All acceptance criteria are met
- [x] Expected output is achieved and verified
- [x] All project tests pass (locally and in CI)
- [x] Code reviewed and approved
- [x] **invariants.md updated with GameOverScene**
- [x] No new linter or type errors
- [x] No regressions in related features

---

### Task 2.2: Implement Player Death Event Handling

**Objective**: Connect player death to Game Over scene transition.

**Task ID**: Task 2.2

**Pre-Implementation Analysis**:
- [x] **invariants.md sections to review**: §16 Runtime Event Names, §6 Player Invariants
- [x] **testing_best_practices.md sections to apply**: Event-Driven Testing, Integration Testing
- [x] **small_comprehensive_documentation.md sections to reference**: §1.2 Scene Management

**State & Invariant Impact Assessment**:
- [x] **Existing states to preserve**: Player death event emission, scene state
- [x] **New states/invariants to create**: Death event handling, scene transition logic
- [x] **Time reversal compatibility**: Death state must be reversible

**Implementation Plan**:

**Files/Classes to Change**:
- **Modify**: `client/src/scenes/GameScene.js` - Add death event listener
- **Modify**: `client/src/entities/Player.js` - Ensure death event emission
- **Create**: `tests/integration/player-death-integration.test.js` - Integration tests

**Integration Points**:
- **Systems affected**: GameScene, Player, event system
- **State machines**: None
- **External libraries**: None

**Testing Strategy**:
- **Test files to create/update**: `tests/integration/player-death-integration.test.js`
- **Key test cases**:
  1. Player death event triggers Game Over scene
  2. Death event includes proper player reference
  3. Scene transition preserves game state
  4. Death event is emitted only once per death
- **Mock requirements**: Use existing scene and event mocks

**Task Breakdown & Acceptance Criteria**:
- [ ] Add death event listener in GameScene
- [ ] Implement scene transition logic
- [ ] Ensure proper event data structure
- [ ] Add death state tracking to prevent multiple transitions
- [ ] Create comprehensive integration tests
- [ ] Add proper cleanup and state reset

**Expected Output**: When player health reaches 0, Game Over scene appears automatically.

**Risk Assessment**:
- **Potential complexity**: Low - event handling
- [ ] **Dependencies**: Task 2.1 completion
- **Fallback plan**: Use console logging if event system fails

**Definition of Done**:
- [ ] All acceptance criteria are met
- [ ] Expected output is achieved and verified
- [ ] All project tests pass (locally and in CI)
- [ ] Code reviewed and approved
- [ ] **invariants.md updated with death event handling**
- [ ] No new linter or type errors
- [ ] No regressions in related features

---

## Task 3: Implement Time Reversal Compatibility for Health and Death

### Task 3.1: Ensure Health State is Time Reversal Compatible

**Objective**: Verify that player health changes are properly recorded and restored by TimeManager.

**Task ID**: Task 3.1

**Pre-Implementation Analysis**:
- [x] **invariants.md sections to review**: §7 TimeManager Rewind System, §18.3 Player State
- [x] **testing_best_practices.md sections to apply**: Time-Based Testing, State Recording Testing
- [x] **small_comprehensive_documentation.md sections to reference**: §7.1 Time Control System

**State & Invariant Impact Assessment**:
- [x] **Existing states to preserve**: TimeManager recording system, Player health state
- [x] **New states/invariants to create**: None (health already recorded)
- [x] **Time reversal compatibility**: Health must be restored correctly during rewind

**Implementation Plan**:

**Files/Classes to Change**:
- **Modify**: `tests/unit/time-manager-health.test.js` - Add health-specific tests
- **Modify**: `client/src/entities/Player.js` - Ensure health is in TemporalState
- **Create**: `tests/integration/health-time-reversal.test.js` - Integration tests

**Integration Points**:
- **Systems affected**: TimeManager, Player health system
- **State machines**: None
- **External libraries**: None

**Testing Strategy**:
- **Test files to create/update**: `tests/unit/time-manager-health.test.js`, `tests/integration/health-time-reversal.test.js`
- **Key test cases**:
  1. Player health is recorded in TimeManager state buffer
  2. Health is restored correctly during rewind
  3. Health changes are interpolated smoothly
  4. Death state is reversible through rewind
- **Mock requirements**: Use existing TimeManager mocks with health state

**Task Breakdown & Acceptance Criteria**:
- [x] Verify health is included in Player's TemporalState
- [x] Add health-specific TimeManager tests
- [x] Test health restoration during rewind
- [x] Test death reversal through rewind
- [x] Create comprehensive integration tests
- [x] Verify smooth health interpolation

**Expected Output**: Player health and death state are properly recorded and restored during time reversal.

**Risk Assessment**:
- **Potential complexity**: Low - health already recorded
- **Dependencies**: Existing TimeManager system
- **Fallback plan**: Manual health restoration if automatic fails

**Definition of Done**:
- [x] All acceptance criteria are met
- [x] Expected output is achieved and verified
- [x] All project tests pass (locally and in CI)
- [x] Code reviewed and approved
- [x] **invariants.md updated if health recording changes**
- [x] No new linter or type errors
- [x] No regressions in related features

---

### Task 3.2: Implement Death State Time Reversal

**Objective**: Ensure that player death and Game Over scene are properly handled during time reversal.

**Task ID**: Task 3.2

**Pre-Implementation Analysis**:
- [x] **invariants.md sections to review**: §7 TimeManager Rewind System, §3 Scene Lifecycle
- [x] **testing_best_practices.md sections to apply**: Scene Testing, Time-Based Testing
- [x] **small_comprehensive_documentation.md sections to reference**: §1.2 Scene Management

**State & Invariant Impact Assessment**:
- [x] **Existing states to preserve**: Scene state, TimeManager recording
- [x] **New states/invariants to create**: Death scene transition handling
- [x] **Time reversal compatibility**: Game Over scene must be dismissed during rewind

**Implementation Plan**:

**Files/Classes to Change**:
- **Modify**: `client/src/scenes/GameScene.js` - Add rewind death handling
- **Modify**: `client/src/scenes/GameOverScene.js` - Add rewind compatibility
- **Create**: `tests/integration/death-time-reversal.test.js` - Integration tests

**Integration Points**:
- **Systems affected**: GameScene, GameOverScene, TimeManager
- **State machines**: None
- **External libraries**: None

**Testing Strategy**:
- **Test files to create/update**: `tests/integration/death-time-reversal.test.js`
- **Key test cases**:
  1. Game Over scene is dismissed when rewinding past death
  2. Player health is restored when rewinding past death
  3. Death event is not re-emitted during rewind
  4. Scene transitions are handled smoothly
- **Mock requirements**: Use existing scene and TimeManager mocks

**Task Breakdown & Acceptance Criteria**:
- [ ] Add death state tracking in GameScene
- [ ] Implement Game Over scene dismissal during rewind
- [ ] Add health restoration logic during rewind
- [ ] Prevent death event re-emission during rewind
- [ ] Create comprehensive integration tests
- [ ] Add proper state cleanup

**Expected Output**: When rewinding past the point of death, Game Over scene disappears and player health is restored.

**Risk Assessment**:
- **Potential complexity**: Medium - scene state management
- **Dependencies**: Tasks 2.1, 2.2, 3.1 completion
- **Fallback plan**: Manual scene management if automatic fails

**Definition of Done**:
- [ ] All acceptance criteria are met
- [ ] Expected output is achieved and verified
- [ ] All project tests pass (locally and in CI)
- [ ] Code reviewed and approved
- [ ] **invariants.md updated with death reversal handling**
- [ ] No new linter or type errors
- [ ] No regressions in related features

---

### Task 3.3: Fix Death State Time Reversal Implementation Issues

**Objective**: Resolve all remaining implementation issues in death time reversal system to ensure proper Game Over scene dismissal, death event suppression, and state recording consistency.

**Task ID**: Task 3.3

**Pre-Implementation Analysis**:
- [x] **invariants.md sections to review**: §7 TimeManager Rewind System, §3 Scene Lifecycle, §6 Player Invariants, §18.3 Player State
- [x] **testing_best_practices.md sections to apply**: State-Based Testing, Time-Based Testing, Event-Driven Testing
- [x] **small_comprehensive_documentation.md sections to reference**: §1.2 Scene Management, §7.1 Time Control System

**State & Invariant Impact Assessment**:
- [x] **Existing states to preserve**: TimeManager recording system, Player death state, GameOverScene lifecycle
- [x] **New states/invariants to create**: Death timestamp tracking, rewind death handling, scene dismissal coordination
- [x] **Time reversal compatibility**: Death events must be suppressed during rewind, Game Over scene must be dismissed during rewind

**Implementation Plan**:

**Files/Classes to Change**:
- **Modify**: `client/src/scenes/GameScene.js` - Fix death event handling and scene dismissal
- **Modify**: `client/src/entities/Player.js` - Fix death event emission during rewind
- **Modify**: `client/src/scenes/GameOverScene.js` - Fix scene dismissal and overlay cleanup
- **Modify**: `client/src/systems/TimeManager.js` - Fix state recording for death state
- **Update**: `tests/integration/death-time-reversal.test.js` - Fix test expectations

**Integration Points**:
- **Systems affected**: GameScene, Player, GameOverScene, TimeManager, event system
- **State machines**: None
- **External libraries**: None

**Testing Strategy**:
- **Test files to create/update**: `tests/integration/death-time-reversal.test.js`
- **Key test cases**:
  1. Death timestamp is properly tracked when player dies
  2. Death events are suppressed during rewind
  3. Game Over scene is properly dismissed during rewind
  4. Health state is correctly recorded and restored
  5. Scene transitions are handled smoothly
- **Mock requirements**: Use existing scene and TimeManager mocks

**Task Breakdown & Acceptance Criteria**:

**Phase 1: Fix Death Event Emission (Critical)**
- [x] **Fix Player.takeDamage() death event emission**: Ensure death events are only emitted when not rewinding
- [x] **Add rewind state check**: Check `this.scene.timeManager?.isRewinding` before emitting death events
- [x] **Test death event suppression**: Verify no death events are emitted during rewind

**Phase 2: Fix Death Timestamp Tracking (Critical)**
- [x] **Fix GameScene death timestamp recording**: Ensure `_deathTimestamp` is set when player dies
- [x] **Add death event listener**: Listen for `playerDied` events and record timestamp
- [x] **Test timestamp tracking**: Verify death timestamp is recorded correctly

**Phase 3: Fix Game Over Scene Dismissal (Critical)**
- [x] **Fix GameScene.handleRewindDeath()**: Ensure GameOverScene is properly dismissed
- [x] **Add scene instance retrieval**: Get GameOverScene instance and call dismissal method
- [x] **Fix GameOverScene.handleRewindDismissal()**: Ensure proper cleanup and input restoration
- [x] **Test scene dismissal**: Verify GameOverScene is dismissed during rewind

**Phase 4: Fix State Recording Issues (Critical)**
- [x] **Fix TimeManager state recording**: Ensure `isAlive` flag is recorded correctly for dead players
- [x] **Fix Player.getStateForRecording()**: Ensure death state is properly recorded
- [x] **Test state recording**: Verify death state is recorded and restored correctly

**Phase 5: Fix Scene Transition Coordination (Important)**
- [x] **Fix GameOverScene overlay cleanup**: Ensure overlay is properly destroyed during dismissal
- [x] **Fix input restoration**: Ensure player inputs are restored when GameOverScene is dismissed
- [x] **Test scene coordination**: Verify smooth transitions between scenes

**Phase 6: Fix Test Expectations (Important)**
- [x] **Update test mocks**: Fix GameOverScene mock to properly simulate scene behavior
- [x] **Fix test assertions**: Update test expectations to match correct behavior
- [x] **Add edge case tests**: Test multiple rewind cycles and error conditions

**Expected Output**: All death time reversal integration tests pass, with proper Game Over scene dismissal, death event suppression during rewind, and correct state recording/restoration.

**Risk Assessment**:
- **Potential complexity**: High - involves coordination between multiple systems
- **Dependencies**: Tasks 2.1, 2.2, 3.1, 3.2 completion
- **Fallback plan**: Implement minimal working solution with manual scene management

**Definition of Done**:
- [x] All acceptance criteria are met
- [x] Expected output is achieved and verified
- [x] All project tests pass (locally and in CI)
- [x] Code reviewed and approved
- [x] **invariants.md updated with death reversal fixes**
- [x] No new linter or type errors
- [x] No regressions in related features

**Technical Implementation Details**:

**Issue 1: Death Event Still Emitted During Rewind**
- **Root Cause**: Player's `takeDamage()` method checks rewind state but the check is not working correctly
- **Solution**: Fix the rewind state check in Player.takeDamage() to properly detect rewind state
- **Code Location**: `client/src/entities/Player.js` line ~320

**Issue 2: Death Timestamp Not Set Correctly**
- **Root Cause**: GameScene is not properly listening for death events or recording timestamps
- **Solution**: Add death event listener in GameScene and record timestamp when death occurs
- **Code Location**: `client/src/scenes/GameScene.js` create() method

**Issue 3: Game Over Scene Not Dismissed**
- **Root Cause**: GameScene.handleRewindDeath() is not properly getting GameOverScene instance
- **Solution**: Use scene.get() to retrieve GameOverScene and call dismissal method
- **Code Location**: `client/src/scenes/GameScene.js` handleRewindDeath() method

**Issue 4: TimeManager State Recording Issues**
- **Root Cause**: Player's `getStateForRecording()` is not properly recording death state
- **Solution**: Ensure `isAlive` flag reflects actual death state (health <= 0)
- **Code Location**: `client/src/entities/Player.js` getStateForRecording() method

**Issue 5: Test Mock Issues**
- **Root Cause**: Test mocks don't properly simulate scene behavior
- **Solution**: Update test mocks to properly simulate GameOverScene behavior
- **Code Location**: `tests/integration/death-time-reversal.test.js`

**Integration Points**:
1. **GameScene ↔ Player**: Death events and timestamp tracking
2. **GameScene ↔ GameOverScene**: Scene dismissal and state coordination
3. **GameScene ↔ TimeManager**: Death state recording and rewind handling
4. **Player ↔ TimeManager**: Health state recording and restoration

**Testing Strategy**:
- **Unit Tests**: Test individual components (Player.takeDamage, GameScene.handleRewindDeath)
- **Integration Tests**: Test full death → rewind → restoration flow
- **Edge Cases**: Test multiple rewind cycles, error conditions, scene transitions

**Success Criteria**:
1. **Death Event Suppression**: No death events emitted during rewind
2. **Scene Dismissal**: GameOverScene properly dismissed when rewinding past death
3. **State Recording**: Death state correctly recorded and restored by TimeManager
4. **Health Restoration**: Player health restored when rewinding past death
5. **Input Restoration**: Player inputs restored when GameOverScene dismissed
6. **Test Coverage**: All integration tests pass with proper behavior

---

## Task 4: Enhance Time Reversal Visual Effects

### Task 4.1: Change Time Reversal Overlay Color to Red

**Objective**: Modify the TimeManager visual effects to use red overlay instead of blue. Also it must cover the whole screen.

**Task ID**: Task 4.1

**Pre-Implementation Analysis**:
- [x] **invariants.md sections to review**: §7 TimeManager Rewind System, §18.7 TimeManager State
- [x] **testing_best_practices.md sections to apply**: Visual Effect Testing, GSAP Mocking
- [x] **small_comprehensive_documentation.md sections to reference**: §2.1 GSAP Core API

**State & Invariant Impact Assessment**:
- [x] **Existing states to preserve**: TimeManager visual effect system
- [x] **New states/invariants to create**: Red overlay color constants
- [x] **Time reversal compatibility**: Visual effects must work during rewind

**Implementation Plan**:

**Files/Classes to Change**:
- **Modify**: `client/src/systems/TimeManager.js` - Change overlay color to red
- **Modify**: `tests/unit/time-manager-visual-effects.test.js` - Update color tests
- **Create**: `tests/unit/time-manager-red-overlay.test.js` - Specific red overlay tests

**Integration Points**:
- **Systems affected**: TimeManager visual effects
- **State machines**: None
- **External libraries**: GSAP for animations

**Testing Strategy**:
- **Test files to create/update**: `tests/unit/time-manager-red-overlay.test.js`
- **Key test cases**:
  1. Overlay color is red (0xff0000) instead of blue
  2. Camera tint is red instead of blue
  3. Visual effects work correctly with red color
  4. Animation timing and alpha values remain the same
- **Mock requirements**: Use existing GSAP and scene mocks

**Task Breakdown & Acceptance Criteria**:
- [ ] Change overlay fillStyle color from blue to red
- [ ] Change camera tint color from blue to red
- [ ] Update all color constants in TimeManager
- [ ] Update unit tests to expect red colors
- [ ] Create comprehensive visual effect tests
- [ ] Verify animation timing remains unchanged

**Expected Output**: Time reversal now shows a red overlay instead of blue, maintaining the same visual effect style.

**Risk Assessment**:
- **Potential complexity**: Low - simple color change
- **Dependencies**: Existing TimeManager visual system
- **Fallback plan**: Revert to blue if red causes issues

**Definition of Done**:
- [ ] All acceptance criteria are met
- [ ] Expected output is achieved and verified
- [ ] All project tests pass (locally and in CI)
- [ ] Code reviewed and approved
- [ ] **invariants.md updated with red overlay color**
- [ ] No new linter or type errors
- [ ] No regressions in related features

---

### Task 4.2: Add Audio Effects for Time Reversal

**Objective**: Implement sound effects to enhance the time reversal experience.

**Task ID**: Task 4.2

**Pre-Implementation Analysis**:
- [x] **invariants.md sections to review**: §7 TimeManager Rewind System, §2 Phaser Game Configuration
- [x] **testing_best_practices.md sections to apply**: Audio Testing, Howler Mocking
- [x] **small_comprehensive_documentation.md sections to reference**: §3.1 Core Implementation, §4.1 Audio System

**State & Invariant Impact Assessment**:
- [x] **Existing states to preserve**: TimeManager visual system, audio system
- [x] **New states/invariants to create**: Time reversal sound effects
- [x] **Time reversal compatibility**: Audio effects must work during rewind

**Implementation Plan**:

**Files/Classes to Change**:
- **Modify**: `client/src/systems/AudioManager.js` - Add time reversal sound effects
- **Modify**: `client/src/systems/TimeManager.js` - Trigger audio cues on rewind start/end
- **Create**: `tests/unit/time-manager-audio-effects.test.js` - Audio effects tests

**Integration Points**:
- **Systems affected**: TimeManager, AudioManager
- **State machines**: None
- **External libraries**: Howler.js

**Testing Strategy**:
- **Test files to create/update**: `tests/unit/time-manager-audio-effects.test.js`
- **Key test cases**:
  1. Sound effects play during rewind activation
  2. Sound effects stop or fade out when rewind ends
  3. No duplicate or overlapping audio triggers
  4. Audio effects do not interfere with other game sounds
- **Mock requirements**: Use existing Howler mocks

**Task Breakdown & Acceptance Criteria**:
- [ ] Add time reversal sound effect asset(s) to AudioManager
- [ ] Trigger sound effect on rewind start in TimeManager
- [ ] Stop or fade out sound effect on rewind end
- [ ] Ensure audio does not overlap or repeat unnecessarily
- [ ] Create comprehensive unit tests for audio triggers

**Expected Output**: Time reversal now includes immersive sound effects, triggered at the correct moments, with no impact on gameplay or other audio.

**Risk Assessment**:
- **Potential complexity**: Low - audio system integration only
- **Dependencies**: Task 4.1 completion, Howler.js
- **Fallback plan**: Use a simple beep or placeholder sound if custom audio fails

**Definition of Done**:
- [ ] All acceptance criteria are met
- [ ] Expected output is achieved and verified
- [ ] All project tests pass (locally and in CI)
- [ ] Code reviewed and approved
- [ ] **invariants.md updated with audio effect details**
- [ ] No new linter or type errors
- [ ] No regressions in related features

---

## Task 5: Fix All Tile Rendering Issues with Pixel Art Mode

### Task 5.1: Enable Pixel Art Mode and Fix All Tile Rendering Issues

**Objective**: Enable pixel art mode in Phaser configuration to comprehensively fix all tile rendering issues while maintaining good level visibility.

**Task ID**: Task 5.1

**Pre-Implementation Analysis**:
- [x] **invariants.md sections to review**: §2 Phaser Game Configuration, §13 Level/Platform Geometry, §15 Asset & Animation Keys
- [x] **testing_best_practices.md sections to apply**: Visual Testing, Configuration Testing, Asset Testing
- [x] **small_comprehensive_documentation.md sections to reference**: §1.1 Project & Game Configuration, §1.3 Asset and Sprite Management

**State & Invariant Impact Assessment**:
- [x] **Existing states to preserve**: Camera system, tile rendering, current zoom level, coin entity, platform system
- [x] **New states/invariants to create**: Pixel art configuration, roundPixels setting
- [x] **Time reversal compatibility**: Camera zoom and tile positioning must be preserved during rewind

**Implementation Plan**:

**Files/Classes to Change**:
- **Modify**: `client/src/game.js` - Add pixel art configuration to Phaser config
- **Create**: `tests/unit/pixel-art-configuration.test.js` - Pixel art configuration tests
- **Create**: `tests/integration/tile-rendering-comprehensive.test.js` - Comprehensive tile rendering tests

**Integration Points**:
- **Systems affected**: Game configuration, tile rendering system, coin entity, SceneFactory, TileSelector
- **State machines**: None
- **External libraries**: None

**Testing Strategy**:
- **Test files to create/update**: `tests/unit/pixel-art-configuration.test.js`, `tests/integration/tile-rendering-comprehensive.test.js`
- **Key test cases**:
  1. Pixel art mode is enabled in game configuration
  2. roundPixels is set to true for crisp rendering
  3. All tiles render without transparency issues at current zoom (0.5)
  4. Coin tiles render with proper transparency (background visible, not opaque)
  5. No glitches or gaps between tile blocks
  6. Multi-tile platforms render seamlessly
  7. Camera zoom remains at 0.5 for good level visibility
  8. All rendering is preserved during time reversal
- **Mock requirements**: Use existing scene, camera, and entity mocks

**Task Breakdown & Acceptance Criteria**:
- [ ] Add `pixelArt: true` to Phaser game configuration
- [ ] Add `roundPixels: true` to Phaser game configuration
- [ ] Verify all tile types render correctly with pixel art mode
- [ ] Verify coin tiles render with proper transparency
- [ ] Verify no gaps or glitches between tile blocks
- [ ] Verify multi-tile platforms render seamlessly
- [ ] Ensure current zoom (0.5) is maintained for good visibility
- [ ] Test all rendering scenarios during time reversal
- [ ] Create comprehensive unit and integration tests
- [ ] Add visual regression tests if possible

**Expected Output**: All tile rendering issues are fixed with pixel art mode enabled, maintaining zoom = 0.5 for good level visibility. Coin tiles show proper transparency, no gaps between tile blocks, and seamless multi-tile platform rendering.

**Risk Assessment**:
- **Potential complexity**: Low - single configuration change that addresses all issues
- **Dependencies**: Existing camera, tile, and entity systems
- **Fallback plan**: Revert to current configuration if issues arise

**Definition of Done**:
- [ ] All acceptance criteria are met
- [ ] Expected output is achieved and verified
- [ ] All project tests pass (locally and in CI)
- [ ] Code reviewed and approved
- [ ] **invariants.md updated with pixel art configuration**
- [ ] No new linter or type errors
- [ ] No regressions in related features

---

## Implementation Order and Dependencies

### Phase 1: Core Systems (Tasks 1.1-1.2, 2.1-2.2)
- **Task 1.1**: Player invulnerability system (foundation)
- **Task 1.2**: Blinking visual effect (depends on 1.1)
- **Task 2.1**: Game Over scene (independent)
- **Task 2.2**: Death event handling (depends on 2.1)

### Phase 2: Time Reversal Compatibility (Tasks 3.1-3.2)
- **Task 3.1**: Health time reversal (depends on 1.1)
- **Task 3.2**: Death state time reversal (depends on 2.2, 3.1)

### Phase 3: Enhanced Visual Effects (Tasks 4.1-4.2)
- **Task 4.1**: Red overlay (independent)
- **Task 4.2**: Enhanced effects (depends on 4.1)

### Phase 4: Tile Rendering Fixes (Task 5.1)
- **Task 5.1**: Enable pixel art mode and fix all tile rendering issues (independent)

## Success Criteria

The implementation is successful when:
1. **Player damage immunity works correctly** with 2-second invulnerability and blinking effect
2. **Death system functions properly** with Game Over scene and restart/menu options
3. **Time reversal affects health and death** - rewinding past damage/death restores health and dismisses Game Over
4. **Enhanced time reversal effects** include red overlay and additional visual/sound effects
5. **Tile rendering is fixed** with pixel art mode enabled, maintaining zoom = 0.5 for good visibility while fixing transparency and gaps between blocks
6. **All tests pass** and no regressions are introduced
7. **Documentation is updated** in invariants.md to reflect new states and behaviors

## Risk Mitigation

- **Incremental implementation**: Each task can be implemented and tested independently
- **Comprehensive testing**: Each task includes unit and integration tests
- **Fallback plans**: Each task has defined fallback approaches if primary implementation fails
- **Documentation updates**: All changes are documented in invariants.md
- **Regression testing**: Full test suite runs after each task completion

This plan provides a clear, sequential path to implementing all required features while maintaining system stability and test coverage. 

---

## Task 6: Replace Camera Zoom with Centralized Sprite Scaling

### Task 6.1: Implement Centralized Sprite Scaling System

**Objective**: Replace the camera zoom system (`this.cameras.main.setZoom(0.25)`) with a centralized sprite scaling system that propagates a single scale value to all game entities, eliminating camera zoom glitches while maintaining the same visual appearance and gameplay functionality. 

**Architectural requirement**: The whole scale value of the level must be centralized and propagate through all the tiles, so that modifying the scale of the level is only modifying one number in the code.

**Task ID**: Task 6.1

**Pre-Implementation Analysis**:
- [x] **invariants.md sections to review**: §2 Phaser Game Configuration, §3 Scene Lifecycle, §6 Player Invariants, §13 Level/Platform Geometry, §15 Asset & Animation Keys, §18.3 Player State
- [x] **testing_best_practices.md sections to apply**: State-Based Testing, TDD/BDD methodologies, Visual Effect Testing
- [x] **small_comprehensive_documentation.md sections to reference**: §1.1 Project & Game Configuration, §1.3 Asset and Sprite Management, §1.4 Arcade Physics

**State & Invariant Impact Assessment**:
- [x] **Existing states to preserve**: Camera system (zoom = 1.0), physics collision detection, time reversal state recording, player movement and positioning, enemy behavior, coin collection mechanics
- [x] **New states/invariants to create**: Centralized scale configuration, scale propagation system, scale state recording for time reversal
- [x] **Time reversal compatibility**: Scale values must be recorded and restored by TimeManager for all scaled sprites

**Implementation Plan**:

**Files/Classes to Change**:
- **Create**: `client/src/config/GameConfig.js` - Centralized game configuration including scale
- **Modify**: `client/src/scenes/GameScene.js` - Remove camera zoom, use centralized scale
- **Modify**: `client/src/systems/SceneFactory.js` - Use centralized scale for all entity creation
- **Modify**: `client/src/entities/Player.js` - Use centralized scale from GameConfig
- **Modify**: `client/src/entities/Enemy.js` - Use centralized scale from GameConfig
- **Modify**: `client/src/entities/Coin.js` - Use centralized scale from GameConfig
- **Modify**: `client/src/entities/MovingPlatform.js` - Use centralized scale from GameConfig
- **Modify**: `client/src/entities/GoalTile.js` - Use centralized scale from GameConfig
- **Create**: `tests/unit/centralized-scaling-system.test.js` - Unit tests for centralized scaling system
- **Create**: `tests/integration/scaling-time-reversal.test.js` - Integration tests for scaling with time reversal

**Integration Points**:
- **Systems affected**: GameScene camera system, all entity creation systems, SceneFactory, TimeManager state recording, CollisionManager collision detection
- **State machines**: None
- **External libraries**: None

**Testing Strategy**:
- **Test files to create/update**: `tests/unit/centralized-scaling-system.test.js`, `tests/integration/scaling-time-reversal.test.js`, `tests/unit/camera-follow.test.js`
- **Key test cases**:
  1. Camera zoom is removed and set to 1.0
  2. Centralized scale configuration is properly defined and accessible
  3. All sprites are scaled using the centralized scale value
  4. Scale value can be modified in one place and propagates to all entities
  5. Collision detection works correctly with scaled sprites
  6. Time reversal preserves scale values for all sprites
  7. Player movement and positioning work correctly with scaled sprites
  8. Enemy behavior and AI work correctly with scaled sprites
  9. Coin collection mechanics work correctly with scaled sprites
  10. Platform collision and physics work correctly with scaled sprites
  11. Moving platforms work correctly with scaled sprites
  12. Goal tiles work correctly with scaled sprites
- **Mock requirements**: Use existing `phaserSceneMock`, `phaserKeyMock`, and entity mocks

**Task Breakdown & Acceptance Criteria**:

**Phase 1: Create Centralized Scale Configuration**
- [ ] Create `client/src/config/GameConfig.js` with centralized scale configuration
- [ ] Define `LEVEL_SCALE` constant (default: 0.25) as the single source of truth
- [ ] Export scale configuration for use across the application
- [ ] Create unit tests for GameConfig scale configuration

**Phase 2: Remove Camera Zoom and Set Camera to 1.0**
- [ ] Remove `this.cameras.main.setZoom(0.25)` from GameScene.js
- [ ] Ensure camera zoom is set to 1.0 (default)
- [ ] Update camera-related tests to expect zoom = 1.0
- [ ] Verify camera follow and bounds still work correctly

**Phase 3: Implement Centralized Scale Propagation**
- [ ] Modify SceneFactory to use centralized scale from GameConfig in ALL TILES
- [ ] Update Player constructor to use centralized scale
- [ ] Update Enemy constructor to use centralized scale
- [ ] Update Coin constructor to use centralized scale
- [ ] Update MovingPlatform constructor to use centralized scale
- [ ] Update GoalTile constructor to use centralized scale
- [ ] Ensure all platform sprites use centralized scale

**Phase 4: Update Time Reversal State Recording**
- [ ] Verify scale values are included in TemporalState recording
- [ ] Test scale restoration during time reversal
- [ ] Ensure all scaled sprites maintain scale during rewind
- [ ] Add scale-specific time reversal tests

**Phase 5: Update Collision Detection**
- [ ] Verify collision detection works with scaled sprites
- [ ] Test player-platform collision with scaled sprites
- [ ] Test player-enemy collision with scaled sprites
- [ ] Test player-coin collision with scaled sprites
- [ ] Test enemy-platform collision with scaled sprites

**Phase 6: Update Physics and Movement**
- [ ] Verify player movement works correctly with scaled sprites
- [ ] Test enemy AI behavior with scaled sprites
- [ ] Test moving platform behavior with scaled sprites
- [ ] Verify physics body scaling and collision bounds

**Phase 7: Comprehensive Testing**
- [ ] Create unit tests for centralized scaling system
- [ ] Create integration tests for scaling with time reversal
- [ ] Update existing camera and entity tests
- [ ] Test all gameplay scenarios with scaled sprites
- [ ] Test scale modification in one place propagates everywhere

**Expected Output**: All game objects appear at the same visual size as before (equivalent to 0.25 camera zoom) but are achieved through centralized sprite scaling instead of camera zoom, eliminating camera zoom glitches while maintaining all existing gameplay functionality. Modifying the scale value in one place (GameConfig.js) changes the scale of all game entities.

**Risk Assessment**:
- **Potential complexity**: Medium - affects multiple systems and requires careful coordination
- **Dependencies**: Existing entity creation systems, TimeManager, CollisionManager
- **Fallback plan**: Revert to camera zoom if centralized scaling causes issues

**Definition of Done**:
- [ ] All acceptance criteria are met
- [ ] Expected output is achieved and verified
- [ ] All project tests pass (locally and in CI)
- [ ] Code reviewed and approved
- [ ] **invariants.md updated with centralized scaling system**
- [ ] No new linter or type errors
- [ ] No regressions in related features
- [ ] Camera zoom glitches are eliminated
- [ ] All gameplay functionality preserved
- [ ] **Centralized scale requirement**: Modifying scale in one place (GameConfig.js) changes all entities

**Technical Implementation Details**:

**Centralized Scale Configuration**:
```javascript
// client/src/config/GameConfig.js
export const LEVEL_SCALE = 0.25; // Single source of truth for level scaling
export const GAME_CONFIG = {
  levelScale: LEVEL_SCALE,
  // Other game configuration...
};
```

**Scale Propagation Pattern**:
- All entity constructors import scale from GameConfig
- SceneFactory uses centralized scale for all sprite creation
- Scale value is applied consistently across all game entities
- Single point of modification for entire level scale

**Affected Entities**: Player, Enemy, Coin, Platform sprites, MovingPlatform, GoalTile
**State Recording**: Scale values must be included in TimeManager's TemporalState
**Collision Detection**: Physics bodies must be scaled proportionally
**Performance**: Individual scaling may have slight performance impact but eliminates camera zoom glitches

**Integration Points**:
1. **GameConfig ↔ All Entities**: Centralized scale configuration
2. **GameScene ↔ Camera**: Remove zoom, maintain follow and bounds
3. **SceneFactory ↔ Scale Propagation**: Apply centralized scale to all sprite creation
4. **TimeManager ↔ Scale State**: Include scale in state recording/restoration
5. **CollisionManager ↔ Scaled Bodies**: Ensure collision detection works with scaled sprites

**Testing Strategy**:
- **Unit Tests**: Test centralized scale configuration and propagation
- **Integration Tests**: Test full gameplay scenarios with scaled sprites
- **Visual Tests**: Verify visual appearance matches previous camera zoom
- **Performance Tests**: Ensure no significant performance degradation
- **Centralization Tests**: Verify scale modification in one place affects all entities

**Success Criteria**:
1. **Centralized Configuration**: Single scale value controls all entities
2. **Visual Consistency**: All sprites appear at the same size as before
3. **Functionality Preservation**: All gameplay mechanics work correctly
4. **Time Reversal Compatibility**: Scale values are preserved during rewind
5. **Collision Accuracy**: All collision detection works with scaled sprites
6. **Performance**: No significant performance impact
7. **Glitch Elimination**: Camera zoom glitches are completely eliminated
8. **Maintainability**: Scale can be modified in one place (GameConfig.js) 