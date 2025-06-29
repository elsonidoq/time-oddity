## Task 04.01 – Implement Coin Collection System

### Objective
Create a complete coin collection system with state recording, collision detection, and registry tracking.

### Task ID:
Task 04.01

### Pre-Implementation Analysis

#### Documentation Dependencies
- [x] **invariants.md sections to review**: §18.2 Entity Base State, §18.8 State Recording Contracts
- [x] **testing_best_practices.md sections to apply**: "State-Based Testing", "TDD Methodology"
- [x] **small_comprehensive_documentation.md sections to reference**: §7.1 Time Control System
- [x] **comprehensive_documentation.md sections to reference**: §7.1.3 Custom State Recording Implementation, §7.1.4 State Recording Contracts

#### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: `TemporalState` contract for default recording
- [x] **New states/invariants to create**: Coin must track `isCollected` boolean state
- [x] **Time reversal compatibility**: Collection state must be recorded and restored during rewind

### Implementation Plan

#### Files/Classes to Change
- [x] **Modify**: `client/src/entities/Coin.js` - Add state recording methods and `isCollected` property

#### Integration Points
- [x] **Systems affected**: TimeManager (custom state recording)
- [x] **State machines**: None
- [x] **External libraries**: None

### Testing Strategy
- [x] **Test files to create/update**: `tests/unit/coin.test.js`
- [x] **Key test cases**:
  1. `getStateForRecording()` returns object with `isCollected` property
  2. `setStateFromRecording()` restores `isCollected` state correctly
  3. Default state is `isCollected: false`
- [x] **Mock requirements**: Reuse existing `phaserSceneMock.js`

### Task Breakdown & Acceptance Criteria
- [x] Add `isCollected` property initialized to `false`
- [x] Implement `getStateForRecording()` returning `{ isCollected: this.isCollected }`
- [x] Implement `setStateFromRecording(state)` setting `this.isCollected = state.isCollected`
- [x] Unit tests pass for state recording methods

### Expected Output
Coin entity with proper state recording methods that preserve collection state during time reversal.

### Risk Assessment
- [x] **Potential complexity**: Low - simple state tracking
- [x] **Dependencies**: TimeManager supports custom recording
- [x] **Fallback plan**: If custom recording fails, fall back to default TemporalState

### Definition of Done
- [x] State recording methods implemented correctly
- [x] Unit tests pass
- [x] No linter/type errors

**TASK COMPLETED** ✅

---

## Task 04.02 – Spawn Coins via SceneFactory & Level Config

### Objective
Enable level designers to place coins through JSON level config and have SceneFactory instantiate them.

### Task ID:
Task 04.02

### Pre-Implementation Analysis

#### Documentation Dependencies
- [x] **invariants.md sections to review**: §3 Scene Lifecycle, §13 Level / Platform Geometry
- [x] **testing_best_practices.md sections to apply**: "Integration Tests", "Centralized Mock Architecture"
- [x] **small_comprehensive_documentation.md sections to reference**: §1.1 Project & Game Configuration, §14.1 Directory Structure

#### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: SceneFactory contracts, registry keys
- [x] **New states/invariants to create**: Level JSON schema uses `type: "coin"`
- [x] **Time reversal compatibility**: Handled by TemporalState automatically

### Implementation Plan

#### Files/Classes to Change
- [x] **Modify**:
  - `client/src/systems/SceneFactory.js` – ensure `createCoin(config)` and routing from `createObject()`
  - `client/src/config/test-level.json` – add sample coin entry for manual testing

#### Integration Points
- [x] **Systems affected**: SceneFactory, CollisionManager (overlap setup already handles coins)

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
- [x] **Test files to update**: `tests/integration/scene-factory-integration.test.js`
- [x] **Key test cases**:
  1. SceneFactory instantiates correct number of coins from config
  2. Overlap with Player triggers `collect()` and increments registry

### Task Breakdown & Acceptance Criteria
- [x] 04.02.1 Ensure JSON schema & SceneFactory routing for coins
- [x] 04.02.2 Integration tests verify spawning & collection

### Expected Output
Coins appear in test level and can be collected; integration tests pass.

### Risk Assessment
- [x] **Potential complexity**: Low; SceneFactory pattern already supports coins
- [x] **Dependencies**: Task 04.01 completed

### Definition of Done
- [x] Acceptance criteria met, tests pass, docs updated

**TASK COMPLETED** ✅

---

## Task 04.03 – Display Coin Counter in `UIScene`

### Objective
Show current `coinsCollected` value in the HUD using the same text rendering approach as existing HUD elements (Dash/Pulse and Health indicators).

### Task ID:
Task 04.03

### Pre-Implementation Analysis

#### Documentation Dependencies
- [x] **invariants.md sections to review**: §3 Scene Lifecycle (parallel scenes), §16 Runtime Event Names
- [x] **testing_best_practices.md sections to apply**: "State-Based Testing", "UI Scene Testing"
- [x] **small_comprehensive_documentation.md sections to reference**: §1.6 Cameras & UI, §7.3 UI/HUD Architecture

#### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: UIScene HUD layout, registry usage
- [x] **New states/invariants to create**: None
- [x] **Time reversal compatibility**: Registry values are not rewound – acceptable per design

### Implementation Plan

#### Files/Classes to Change
- [x] **Modify**: `client/src/scenes/UIScene.js` – add BitmapText counter, update on `registry` events or polling

#### Integration Points
- [x] **Systems affected**: UIScene only (reads registry)

### Testing Strategy
- [x] **Test files to create/update**: `tests/unit/ui-scene-coin-counter.test.js`
- [x] **Key test cases**:
  1. UIScene creates counter text at expected coordinates
  2. Updating registry value updates text content

### Task Breakdown & Acceptance Criteria
- [x] 04.03.1 Add BitmapText creation in `create()`
- [x] 04.03.2 Subscribe to registry change event `changedata-coinsCollected`
- [x] 04.03.3 Unit tests verify behaviour

### Expected Output
HUD shows live coin count during gameplay.

### Risk Assessment
- [x] **Potential complexity**: Low

### Definition of Done
- [x] Acceptance criteria met, tests pass

**TASK COMPLETED** ✅

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