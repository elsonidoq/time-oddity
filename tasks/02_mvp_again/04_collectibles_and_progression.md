## Task 04.01.1 – Add Custom State Recording to Coin Entity

### Objective
Implement `getStateForRecording()` and `setStateFromRecording()` methods in the Coin class to track collection state for time reversal compatibility.

### Task ID:
Task 04.01.1

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: §18.2 Entity Base State, §18.8 State Recording Contracts
- [ ] **testing_best_practices.md sections to apply**: "State-Based Testing", "TDD Methodology"
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.1 Time Control System
- [ ] **comprehensive_documentation.md sections to reference**: §7.1.3 Custom State Recording Implementation, §7.1.4 State Recording Contracts

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: `TemporalState` contract for default recording
- [ ] **New states/invariants to create**: Coin must track `isCollected` boolean state
- [ ] **Time reversal compatibility**: Collection state must be recorded and restored during rewind

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `client/src/entities/Coin.js` - Add state recording methods and `isCollected` property

#### Integration Points
- **Systems affected**: TimeManager (custom state recording)
- **State machines**: None
- **External libraries**: None

### Testing Strategy
- **Test files to create/update**: `tests/unit/coin.test.js`
- **Key test cases**:
  1. `getStateForRecording()` returns object with `isCollected` property
  2. `setStateFromRecording()` restores `isCollected` state correctly
  3. Default state is `isCollected: false`
- **Mock requirements**: Reuse existing `phaserSceneMock.js`

### Task Breakdown & Acceptance Criteria
- [x] Add `isCollected` property initialized to `false`
- [x] Implement `getStateForRecording()` returning `{ isCollected: this.isCollected }`
- [x] Implement `setStateFromRecording(state)` setting `this.isCollected = state.isCollected`
- [x] Unit tests pass for state recording methods

### Expected Output
Coin entity with proper state recording methods that preserve collection state during time reversal.

### Risk Assessment
- **Potential complexity**: Low - simple state tracking
- **Dependencies**: TimeManager supports custom recording
- **Fallback plan**: If custom recording fails, fall back to default TemporalState

### Definition of Done
- [x] State recording methods implemented correctly
- [x] Unit tests pass
- [x] No linter/type errors

**TASK COMPLETED** ✅

---

## Task 04.01.2 – Implement Coin Collection Logic

### Objective
Add `collect()` method to Coin class that deactivates the coin, increments global counter, and plays pickup sound effect.

### Task ID:
Task 04.01.2

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: §15 Asset & Animation Keys
- [ ] **testing_best_practices.md sections to apply**: "State-Based Testing", "Centralized Mock Architecture"
- [ ] **small_comprehensive_documentation.md sections to reference**: §1.3 Asset Loading
- [ ] **comprehensive_documentation.md sections to reference**: §1.3.2 Sound Effect Asset Management, §1.3.3 Audio System Integration

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: Registry contract for `coinsCollected`
- [ ] **New states/invariants to create**: Coin `isCollected` state changes to `true`
- [ ] **Time reversal compatibility**: Collection state handled by Task 04.01.1

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `client/src/entities/Coin.js` - Add `collect()` method

#### Integration Points
- **Systems affected**: GameScene registry, Howler.js for SFX
- **State machines**: None
- **External libraries**: Howler.js for pickup SFX

### Testing Strategy
- **Test files to update**: `tests/unit/coin.test.js`
- **Key test cases**:
  1. `collect()` sets `isCollected = true`
  2. `collect()` increments `scene.registry.get('coinsCollected')`
  3. `collect()` plays pickup SFX
  4. `collect()` deactivates sprite (sets visible to false)
- **Mock requirements**: Reuse existing `phaserSceneMock.js` & Howler mocks

### Task Breakdown & Acceptance Criteria
- [x] Implement `collect()` method
- [x] Set `isCollected = true`
- [x] Increment registry counter
- [x] Play pickup SFX
- [x] Deactivate sprite
- [x] Unit tests pass

### Expected Output
Coin collection method that properly updates state and provides feedback.

### Risk Assessment
- **Potential complexity**: Low - straightforward collection logic
- **Dependencies**: Registry initialized, SFX asset loaded
- **Fallback plan**: If SFX fails, continue without sound

### Definition of Done
- [x] Collection method works correctly
- [x] Unit tests pass
- [x] No linter/type errors

**TASK COMPLETED** ✅

---

## Task 04.01.3 – Initialize Coin Registry Counter

### Objective
Setup `coinsCollected` registry value in GameScene to track global coin collection progress.

### Task ID:
Task 04.01.3

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: §3 Scene Lifecycle
- [ ] **testing_best_practices.md sections to apply**: "State-Based Testing"
- [ ] **small_comprehensive_documentation.md sections to reference**: §1.1 Project & Game Configuration
- [ ] **comprehensive_documentation.md sections to reference**: §3.1 Scene Lifecycle Management, §3.2 Registry System

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: Scene registry contract
- [ ] **New states/invariants to create**: `coinsCollected` registry key initialized to 0
- [ ] **Time reversal compatibility**: Registry state handled by TimeManager

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `client/src/scenes/GameScene.js` - Initialize registry counter in `create()`

#### Integration Points
- **Systems affected**: GameScene registry
- **State machines**: None
- **External libraries**: None

### Testing Strategy
- **Test files to update**: `tests/unit/game-scene.test.js`
- **Key test cases**:
  1. Registry `coinsCollected` initialized to 0 in `create()`
- **Mock requirements**: Reuse existing `phaserSceneMock.js`

### Task Breakdown & Acceptance Criteria
- [x] Add `this.registry.set('coinsCollected', 0)` in GameScene `create()`
- [x] Unit tests pass

### Expected Output
Global coin counter properly initialized and accessible.

### Risk Assessment
- **Potential complexity**: Very low - simple registry initialization
- **Dependencies**: None
- **Fallback plan**: None needed

### Definition of Done
- [x] Registry counter initialized
- [x] Unit tests pass
- [x] No linter/type errors

**TASK COMPLETED** ✅

---

## Task 04.01.4 – Setup Player-Coin Collision Detection

### Objective
Configure CollisionManager to detect player-coin overlaps and trigger collection.

### Task ID:
Task 04.01.4

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: §13.3 Physics Configuration Order
- [ ] **testing_best_practices.md sections to apply**: "Integration Tests"
- [ ] **small_comprehensive_documentation.md sections to reference**: §1.3 Creating Game Objects
- [ ] **comprehensive_documentation.md sections to reference**: §10.1 Collision System Architecture, §10.2 Collision Detection Setup

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: CollisionManager contracts
- [ ] **New states/invariants to create**: Player-coin overlap detection
- [ ] **Time reversal compatibility**: Handled by Coin state recording

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `client/src/systems/CollisionManager.js` - Add player-coin overlap detection

#### Integration Points
- **Systems affected**: CollisionManager, Player, Coin
- **State machines**: None
- **External libraries**: None

### Testing Strategy
- **Test files to update**: `tests/integration/collision-manager.integration.test.js`
- **Key test cases**:
  1. Player-coin overlap triggers `coin.collect()`
  2. Overlap detection properly configured
- **Mock requirements**: Reuse existing `phaserSceneMock.js`

### Task Breakdown & Acceptance Criteria
- [x] Add `this.physics.add.overlap(player, coins, (player, coin) => coin.collect())`
- [x] Integration tests pass

### Expected Output
Player can collect coins by overlapping with them.

### Risk Assessment
- **Potential complexity**: Low - standard overlap detection
- **Dependencies**: Player and coins exist in physics groups
- **Fallback plan**: None needed

### Definition of Done
- [x] Overlap detection configured
- [x] Integration tests pass
- [x] No linter/type errors

**TASK COMPLETED** ✅

---

## Task 04.01.5 – Verify Physics Configuration Order

### Objective
Ensure Coin physics configuration follows proper group → configure → register order as per invariants.

### Task ID:
Task 04.01.5

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: §13.3 Physics Configuration Order
- [ ] **testing_best_practices.md sections to apply**: "State-Based Testing"
- **Potential complexity**: Medium - custom state recording required for time reversal
- **Dependencies**: Coin asset exists, TimeManager supports custom recording
- **Critical concerns**: 
  - Physics configuration order must follow invariants (§13.3)
  - Time reversal state must be perfectly synchronized
  - Registry counter must be properly initialized

### Definition of Done
- [x] All acceptance criteria met
- [x] Project tests pass
- [x] No linter/type errors
- [x] Time reversal properly restores coin collection state
- [x] Physics configuration follows proper ordering

**TASK COMPLETED** ✅

---

## Task 04.02 – Spawn Coins via SceneFactory & Level Config

### Objective
Enable level designers to place coins through JSON level config and have SceneFactory instantiate them.

### Task ID:
Task 04.02

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: §3 Scene Lifecycle, §13 Level / Platform Geometry
- [ ] **testing_best_practices.md sections to apply**: "Integration Tests", "Centralized Mock Architecture"
- [ ] **small_comprehensive_documentation.md sections to reference**: §1.1 Project & Game Configuration, §14.1 Directory Structure

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: SceneFactory contracts, registry keys
- [ ] **New states/invariants to create**: Level JSON schema uses `type: "coin"`
- [ ] **Time reversal compatibility**: Handled by TemporalState automatically

### Implementation Plan

#### Files/Classes to Change
- **Modify**:
  - `client/src/systems/SceneFactory.js` – ensure `createCoin(config)` and routing from `createObject()`
  - `client/src/config/test-level.json` – add sample coin entry for manual testing

#### Integration Points
- **Systems affected**: SceneFactory, CollisionManager (overlap setup already handles coins)

### Example JSON Configuration

#### Coin Object Schema
```json
{
  "type": "coin",
  "x": 400,
  "y": 300,
  "properties": {
    "value": 100
  }
}
```

#### Sample Level Configuration with Coins
```json
{
  "platforms": [
    {
      "type": "platform",
      "x": 400,
      "y": 500,
      "width": 200,
      "height": 32
    }
  ],
  "coins": [
    {
      "type": "coin",
      "x": 400,
      "y": 450,
      "properties": {
        "value": 100
      }
    },
    {
      "type": "coin", 
      "x": 500,
      "y": 450,
      "properties": {
        "value": 100
      }
    },
    {
      "type": "coin",
      "x": 600,
      "y": 350,
      "properties": {
        "value": 100
      }
    }
  ],
  "enemies": [
    {
      "type": "loophound",
      "x": 300,
      "y": 450
    }
  ]
}
```

### Testing Strategy
- **Test files to update**: `tests/integration/scene-factory-integration.test.js`
- **Key test cases**:
  1. SceneFactory instantiates correct number of coins from config
  2. Overlap with Player triggers `collect()` and increments registry

### Task Breakdown & Acceptance Criteria
- [ ] 04.02.1 Ensure JSON schema & SceneFactory routing for coins
- [ ] 04.02.2 Integration tests verify spawning & collection

### Expected Output
Coins appear in test level and can be collected; integration tests pass.

### Risk Assessment
- **Potential complexity**: Low; SceneFactory pattern already supports coins
- **Dependencies**: Task 04.01 completed

### Definition of Done
- [ ] Acceptance criteria met, tests pass, docs updated

---

## Task 04.03 – Display Coin Counter in `UIScene`

### Objective
Show current `coinsCollected` value in the HUD using BitmapText.

### Task ID:
Task 04.03

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: §3 Scene Lifecycle (parallel scenes), §16 Runtime Event Names
- [ ] **testing_best_practices.md sections to apply**: "State-Based Testing", "UI Scene Testing"
- [ ] **small_comprehensive_documentation.md sections to reference**: §1.6 Cameras & UI, §7.3 UI/HUD Architecture

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: UIScene HUD layout, registry usage
- [ ] **New states/invariants to create**: None
- [ ] **Time reversal compatibility**: Registry values are not rewound – acceptable per design

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `client/src/scenes/UIScene.js` – add BitmapText counter, update on `registry` events or polling

#### Integration Points
- **Systems affected**: UIScene only (reads registry)

### Testing Strategy
- **Test files to create/update**: `tests/unit/ui-scene-coin-counter.test.js`
- **Key test cases**:
  1. UIScene creates counter text at expected coordinates
  2. Updating registry value updates text content

### Task Breakdown & Acceptance Criteria
- [ ] 04.03.1 Add BitmapText creation in `create()`
- [ ] 04.03.2 Subscribe to registry change event `changedata-coinsCollected`
- [ ] 04.03.3 Unit tests verify behaviour

### Expected Output
HUD shows live coin count during gameplay.

### Risk Assessment
- **Potential complexity**: Low

### Definition of Done
- [ ] Acceptance criteria met, tests pass

---

## Task 04.04 – Implement Score Registry & Coin-Based Scoring

### Objective
Introduce a numeric `score` registry value and increment it by +100 each time a coin is collected.

### Task ID:
Task 04.04

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: §16 Runtime Event Names (for future score events), §18.2 Entity Base State (no changes)
- [ ] **testing_best_practices.md sections to apply**: "Unit Tests", "Fake Timers" (none needed but keep in mind)
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.1 Time Control System (registry is outside rewind)

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: Registry usage; ensure no side effects on rewind
- [ ] **New states/invariants to create**: `score` registry key default 0
- [ ] **Time reversal compatibility**: Score is not rewound by design

### Implementation Plan

#### Files/Classes to Change
- **Modify**:
  - `client/src/scenes/BootScene.js` – initialise `this.registry.set('score', 0)`
  - `client/src/entities/Coin.js` – in `collect()` add `registry.increment('score', 100)` helper logic

#### Integration Points
- **Systems affected**: Potential future hooks for enemy defeat (next task)

### Testing Strategy
- **Test files to create/update**: `tests/unit/score-registry.test.js`
- **Key test cases**:
  1. BootScene initialises `score` to 0
  2. Collecting coin increments score by 100

### Task Breakdown & Acceptance Criteria
- [ ] 04.04.1 BootScene registry init
- [ ] 04.04.2 Update Coin collect logic
- [ ] 04.04.3 Unit tests verify behaviour

### Expected Output
Score increases when coins are collected; all tests pass.

### Risk Assessment
- **Potential complexity**: Low

### Definition of Done
- [ ] Acceptance criteria met, tests pass

---

## Task 04.05 – Add Enemy Defeat Scoring (+250) & HUD Score Display

### Objective
Award +250 points when an enemy is defeated and display live score in the HUD.

### Task ID:
Task 04.05

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: §10 CollisionManager Expectations, §16 Runtime Event Names (`enemyDefeated`), §6 Player Invariants
- [ ] **testing_best_practices.md sections to apply**: "Integration Tests", "Event-Driven Testing"
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.3 UI/HUD Architecture, Enemy state docs

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: Enemy die() flow, event emission `enemyDefeated`
- [ ] **New states/invariants to create**: None
- [ ] **Time reversal compatibility**: Score not rewound; acceptable

### Implementation Plan

#### Files/Classes to Change
- **Modify**:
  - `client/src/entities/Enemy.js` – emit `'enemyDefeated'` (already exists per invariants) and increment registry `score` by 250 inside `die()`
  - `client/src/scenes/UIScene.js` – add BitmapText for score (re-use coin counter style)

#### Integration Points
- **Systems affected**: UIScene, Enemy entities

### Testing Strategy
- **Test files to create/update**:
  - `tests/unit/enemy-defeat-score.test.js`
  - `tests/unit/ui-scene-score-display.test.js`
- **Key test cases**:
  1. Enemy.die() adds 250 to score
  2. UIScene updates score text on registry change

### Task Breakdown & Acceptance Criteria
- [ ] 04.05.1 Update Enemy.die() score logic
- [ ] 04.05.2 Add score BitmapText in UIScene
- [ ] 04.05.3 Unit tests pass

### Expected Output
Defeating an enemy increases score and HUD reflects new total.

### Risk Assessment
- **Potential complexity**: Medium – ensure event emissions & registry updates do not break existing tests

### Definition of Done
- [ ] Acceptance criteria met, all project tests pass
- [ ] invariants.md updated if event names change (they shouldn't)

---

# End of Collectibles & Progression Plan (04.x) 