# Phase 4: Increase Test Coverage & Robustness

This plan addresses the most critical coverage gaps and test fragility in the Time Oddity codebase, following project invariants and best practices. Each task is atomic, focused, and testable - designed for single-session completion by an engineering LLM.

---

## Task 1.1: Create Centralized Phaser Key Mock ✅

### Task Title
Create Centralized Phaser Key Mock for Input Testing

### Objective
Create a single, reusable mock for Phaser keyboard input that can be used across all input-related tests.

### Task Reference
Foundation for Task 1.2 and all subsequent input testing tasks.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §2.2 (Mocking GSAP/Phaser)
- [ ] **invariants.md sections to verify**: §4 (Input Mapping)
- [ ] **small_comprehensive_documentation.md sections to reference**: §8.2 (Mocking External Libraries)

### Implementation Plan
- **Create**: `tests/mocks/phaserKeyMock.js` - A single mock object that simulates Phaser keyboard input
- **Modify**: None
- **Delete**: None

### Centralized Key Mock Interface Specification

**File**: `tests/mocks/phaserKeyMock.js`

**Exports**: 
- `createPhaserKeyMock()` - Factory function that returns a fresh key mock instance
- `PhaserKeyMock` - Class for creating key mock instances

**Key Mock Instance Interface**:
```javascript
{
  // Key state properties (boolean)
  isDown: boolean,      // Key is currently held down
  isUp: boolean,        // Key is currently released
  justDown: boolean,    // Key was just pressed this frame
  justUp: boolean,      // Key was just released this frame
  
  // Key identification
  keyCode: string,      // The key code (e.g., 'A', 'LEFT', 'SPACE')
  
  // Control methods for tests
  setDown(): void,      // Set key to pressed state
  setUp(): void,        // Set key to released state
  setJustDown(): void,  // Set justDown to true for one frame
  setJustUp(): void,    // Set justUp to true for one frame
  reset(): void,        // Reset all states to default (isUp: true, others: false)
  
  // Frame management
  update(): void        // Called each frame to reset justDown/justUp
}
```

**Required Keys to Mock**:
- `LEFT`, `RIGHT`, `UP`, `DOWN` (Arrow keys)
- `A`, `D`, `W`, `S` (WASD keys)
- `SPACE` (Spacebar)
- `SHIFT` (Shift key)
- `R` (R key)
- `E` (E key)
- `P` (P key)

**Usage Example**:
```javascript
const keyMock = createPhaserKeyMock('A');
keyMock.setDown();
expect(keyMock.isDown).toBe(true);
expect(keyMock.isUp).toBe(false);
```

### Task Breakdown & Acceptance Criteria
- [ ] Create `tests/mocks/phaserKeyMock.js` with the specified interface
- [ ] Implement all required key state properties (isDown, isUp, justDown, justUp)
- [ ] Implement all control methods (setDown, setUp, setJustDown, setJustUp, reset, update)
- [ ] Support all required keys (LEFT, RIGHT, UP, DOWN, A, D, W, S, SPACE, SHIFT, R, E, P)
- [ ] Export both factory function and class
- [ ] Mock is properly documented with JSDoc comments
- [ ] Mock can be easily controlled in tests as shown in usage example

### Expected Output
A single file `tests/mocks/phaserKeyMock.js` that provides a complete mock for Phaser keyboard input with the specified interface.

### Definition of Done
- [ ] File created and exports usable mock with specified interface
- [ ] All required keys are mocked with correct properties and methods
- [ ] Mock can be controlled programmatically in tests
- [ ] Mock includes proper documentation
- [ ] No existing tests broken

---

## Task 1.2: Create Centralized Scene Mock ✅

### Task Title
Create Centralized Scene Mock for Scene Testing

### Objective
Create a single, reusable mock for Phaser scenes that can be used across all scene-related tests.

### Task Reference
Foundation for Task 1.3 and all subsequent scene testing tasks.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §2.2 (Mocking GSAP/Phaser)
- [ ] **invariants.md sections to verify**: §3 (Scene Lifecycle)
- [ ] **small_comprehensive_documentation.md sections to reference**: §8.2 (Mocking External Libraries)

### Implementation Plan
- **Create**: `tests/mocks/phaserSceneMock.js` - A single mock object that simulates Phaser scene functionality
- **Modify**: None
- **Delete**: None

### Centralized Scene Mock Interface Specification

**File**: `tests/mocks/phaserSceneMock.js`

**Exports**:
- `createPhaserSceneMock(sceneKey?: string)` - Factory function that returns a fresh scene mock instance
- `PhaserSceneMock` - Class for creating scene mock instances

**Scene Mock Instance Interface**:
```javascript
{
  // Scene identification
  key: string,          // Scene key (e.g., 'GameScene', 'MenuScene')
  
  // Time system
  time: {
    now: number,        // Current timestamp (milliseconds)
    add: jest.fn()      // Mock for time.add()
  },
  
  // Input system
  input: {
    keyboard: {
      addKey: jest.fn((keyCode) => PhaserKeyMock)  // Returns key mock for given keyCode
    }
  },
  
  // Physics system
  physics: {
    add: {
      sprite: jest.fn((x, y, texture) => GameObjectMock),
      existing: jest.fn((obj) => void),
      group: jest.fn(() => GroupMock),
      collider: jest.fn((obj1, obj2, callback) => void),
      overlap: jest.fn((obj1, obj2, callback) => void)
    },
    world: {
      gravity: { x: number, y: number },
      bounds: { setTo: jest.fn() }
    }
  },
  
  // Graphics/UI system
  add: {
    sprite: jest.fn((x, y, texture) => GameObjectMock),
    graphics: jest.fn(() => GraphicsMock),
    text: jest.fn((x, y, text, style) => TextMock),
    bitmapText: jest.fn((x, y, font, text) => TextMock),
    group: jest.fn(() => GroupMock),
    existing: jest.fn((obj) => void),
    particles: jest.fn(() => ParticlesMock)
  },
  
  // Event system
  events: {
    emit: jest.fn((eventName, ...args) => void),
    on: jest.fn((eventName, callback) => void),
    off: jest.fn((eventName, callback) => void)
  },
  
  // Scene management
  scene: {
    pause: jest.fn((sceneKey) => void),
    resume: jest.fn((sceneKey) => void),
    launch: jest.fn((sceneKey, data) => void),
    stop: jest.fn((sceneKey) => void)
  },
  
  // Camera system
  cameras: {
    main: {
      setBounds: jest.fn((x, y, width, height) => void),
      setZoom: jest.fn((zoom) => void)
    }
  },
  
  // System events
  sys: {
    events: {
      on: jest.fn((eventName, callback) => void),
      off: jest.fn((eventName, callback) => void)
    }
  },
  
  // Control methods for tests
  setTime(now: number): void,           // Set current time
  advanceTime(delta: number): void,     // Advance time by delta
  resetMocks(): void,                   // Reset all jest mocks
  getEmittedEvents(): Array<{event: string, args: Array}>  // Get emitted events for testing
}
```

**Required GameObject Mocks**:
```javascript
// GameObjectMock interface
{
  x: number,
  y: number,
  active: boolean,
  visible: boolean,
  alpha: number,
  scale: number,
  flipX: boolean,
  texture: { key: string },
  body: BodyMock,
  anims: AnimationsMock,
  setOrigin: jest.fn(() => this),
  setDepth: jest.fn(() => this),
  setPosition: jest.fn(() => this),
  setTexture: jest.fn(() => this),
  setFlipX: jest.fn(() => this),
  setAlpha: jest.fn(() => this),
  setScale: jest.fn(() => this),
  setActive: jest.fn(() => this),
  setVisible: jest.fn(() => this),
  play: jest.fn(() => this),
  destroy: jest.fn()
}
```

**Usage Example**:
```javascript
const sceneMock = createPhaserSceneMock('GameScene');
sceneMock.setTime(1000);
const keyMock = sceneMock.input.keyboard.addKey('A');
keyMock.setDown();
sceneMock.events.emit('gamePaused');
expect(sceneMock.getEmittedEvents()).toContainEqual({event: 'gamePaused', args: []});
```

### Task Breakdown & Acceptance Criteria
- [ ] Create `tests/mocks/phaserSceneMock.js` with the specified interface
- [ ] Implement all required scene properties (time, input, physics, add, events, scene, cameras, sys)
- [ ] Implement all control methods (setTime, advanceTime, resetMocks, getEmittedEvents)
- [ ] Include GameObjectMock with all required properties and methods
- [ ] Export both factory function and class
- [ ] Mock is properly documented with JSDoc comments
- [ ] Mock can be easily controlled in tests as shown in usage example

### Expected Output
A single file `tests/mocks/phaserSceneMock.js` that provides a complete mock for Phaser scenes with the specified interface.

### Definition of Done
- [ ] File created and exports usable mock with specified interface
- [ ] All required scene properties are mocked with correct behavior
- [ ] Mock can be controlled programmatically in tests
- [ ] Mock includes proper documentation
- [ ] No existing tests broken

---

## Task 1.3: Create Centralized Event Emitter Mock ✅

### Task Title
Create Centralized Event Emitter Mock for Event Testing

### Objective
Create a single, reusable mock for Phaser event emitters that can be used across all event-related tests.

### Task Reference
Foundation for Task 1.4 and all subsequent event testing tasks.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §2.2 (Mocking GSAP/Phaser)
- [ ] **invariants.md sections to verify**: §15 (Runtime Event Names)
- [ ] **small_comprehensive_documentation.md sections to reference**: §8.2 (Mocking External Libraries)

### Implementation Plan
- **Create**: `tests/mocks/eventEmitterMock.js` - A single mock object that simulates Phaser event emitter functionality
- **Modify**: None
- **Delete**: None

### Centralized Event Emitter Mock Interface Specification

**File**: `tests/mocks/eventEmitterMock.js`

**Exports**:
- `createEventEmitterMock()` - Factory function that returns a fresh event emitter mock instance
- `EventEmitterMock` - Class for creating event emitter mock instances

**Event Emitter Mock Instance Interface**:
```javascript
{
  // Event registration
  on: jest.fn((eventName: string, callback: Function) => void),
  off: jest.fn((eventName: string, callback: Function) => void),
  once: jest.fn((eventName: string, callback: Function) => void),
  
  // Event emission
  emit: jest.fn((eventName: string, ...args: any[]) => void),
  
  // Event removal
  removeAllListeners: jest.fn((eventName?: string) => void),
  
  // Control methods for tests
  resetMocks(): void,                                    // Reset all jest mocks
  getEmittedEvents(): Array<{event: string, args: Array, timestamp: number}>,
  getRegisteredListeners(eventName?: string): Array<Function>,
  clearEmittedEvents(): void,                           // Clear emitted events history
  clearRegisteredListeners(): void,                     // Clear registered listeners
  
  // Event history inspection
  wasEventEmitted(eventName: string): boolean,
  getEventEmitCount(eventName: string): number,
  getLastEmittedEvent(eventName: string): {event: string, args: Array, timestamp: number} | null,
  
  // Listener inspection
  getListenerCount(eventName: string): number,
  hasListener(eventName: string, callback?: Function): boolean
}
```

**Required Event Names to Support**:
- `gamePaused` - Game pause event
- `gameResumed` - Game resume event
- `playerEnemyCollision` - Player-enemy collision event
- `shutdown` - Scene shutdown event
- `playerDeath` - Player death event
- `levelComplete` - Level completion event
- `rewindStart` - Time rewind start event
- `rewindEnd` - Time rewind end event

**Usage Example**:
```javascript
const emitterMock = createEventEmitterMock();
const callback = jest.fn();

emitterMock.on('gamePaused', callback);
emitterMock.emit('gamePaused', { reason: 'user' });

expect(emitterMock.wasEventEmitted('gamePaused')).toBe(true);
expect(emitterMock.getEventEmitCount('gamePaused')).toBe(1);
expect(emitterMock.getLastEmittedEvent('gamePaused')).toEqual({
  event: 'gamePaused',
  args: [{ reason: 'user' }],
  timestamp: expect.any(Number)
});
expect(callback).toHaveBeenCalledWith({ reason: 'user' });
```

### Task Breakdown & Acceptance Criteria
- [ ] Create `tests/mocks/eventEmitterMock.js` with the specified interface
- [ ] Implement all required event emitter methods (on, off, once, emit, removeAllListeners)
- [ ] Implement all control methods (resetMocks, getEmittedEvents, getRegisteredListeners, etc.)
- [ ] Implement all inspection methods (wasEventEmitted, getEventEmitCount, getLastEmittedEvent, etc.)
- [ ] Support all required event names
- [ ] Export both factory function and class
- [ ] Mock is properly documented with JSDoc comments
- [ ] Mock can be easily controlled and inspected in tests as shown in usage example

### Expected Output
A single file `tests/mocks/eventEmitterMock.js` that provides a complete mock for Phaser event emitters with the specified interface.

### Definition of Done
- [ ] File created and exports usable mock with specified interface
- [ ] All required event emitter methods are mocked with correct behavior
- [ ] Mock can be controlled and inspected programmatically in tests
- [ ] Mock includes proper documentation
- [ ] No existing tests broken

---

## Task 2.1: Test InputManager isLeftPressed Getter ✅

### Task Title
Test InputManager isLeftPressed Getter with Centralized Mocks

### Objective
Write comprehensive unit tests for the `isLeftPressed` getter in InputManager using the new centralized mocks.

### Task Reference
First behavioral test for InputManager.js using Task 1.1 mocks.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §4 (Input Mapping)
- [ ] **small_comprehensive_documentation.md sections to reference**: §1.5 (Input Handling)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/input-manager.test.js` - Add tests for `isLeftPressed` getter
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Import and use the centralized Phaser key mock from Task 1.1
- [ ] Test `isLeftPressed` returns `true` when LEFT arrow is pressed
- [ ] Test `isLeftPressed` returns `true` when A key is pressed
- [ ] Test `isLeftPressed` returns `false` when neither key is pressed
- [ ] Test `isLeftPressed` returns `false` when only RIGHT arrow is pressed
- [ ] All tests pass and provide good coverage for this specific getter

### Expected Output
Enhanced `tests/unit/input-manager.test.js` with comprehensive tests for the `isLeftPressed` getter.

### Definition of Done
- [ ] All tests for `isLeftPressed` pass
- [ ] Tests use centralized mocks from Task 1.1
- [ ] Tests cover all key combinations (LEFT, A)
- [ ] No existing tests broken

---

## Task 2.2: Test InputManager isRightPressed Getter ✅

### Task Title
Test InputManager isRightPressed Getter with Centralized Mocks

### Objective
Write comprehensive unit tests for the `isRightPressed` getter in InputManager using the new centralized mocks.

### Task Reference
Second behavioral test for InputManager.js using Task 1.1 mocks.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §4 (Input Mapping)
- [ ] **small_comprehensive_documentation.md sections to reference**: §1.5 (Input Handling)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/input-manager.test.js` - Add tests for `isRightPressed` getter
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Use the centralized Phaser key mock from Task 1.1
- [ ] Test `isRightPressed` returns `true` when RIGHT arrow is pressed
- [ ] Test `isRightPressed` returns `true` when D key is pressed
- [ ] Test `isRightPressed` returns `false` when neither key is pressed
- [ ] Test `isRightPressed` returns `false` when only LEFT arrow is pressed
- [ ] All tests pass and provide good coverage for this specific getter

### Expected Output
Enhanced `tests/unit/input-manager.test.js` with comprehensive tests for the `isRightPressed` getter.

### Definition of Done
- [ ] All tests for `isRightPressed` pass
- [ ] Tests use centralized mocks from Task 1.1
- [ ] Tests cover all key combinations (RIGHT, D)
- [ ] No existing tests broken

---

## Task 2.3: Test InputManager isJumpPressed Getter ✅

### Task Title
Test InputManager isJumpPressed Getter with Centralized Mocks

### Objective
Write comprehensive unit tests for the `isJumpPressed` getter in InputManager using the new centralized mocks.

### Task Reference
Third behavioral test for InputManager.js using Task 1.1 mocks.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §4 (Input Mapping)
- [ ] **small_comprehensive_documentation.md sections to reference**: §1.5 (Input Handling)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/input-manager.test.js` - Add tests for `isJumpPressed` getter
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Use the centralized Phaser key mock from Task 1.1
- [ ] Test `isJumpPressed` returns `true` when UP arrow is pressed
- [ ] Test `isJumpPressed` returns `true` when W key is pressed
- [ ] Test `isJumpPressed` returns `true` when SPACE is pressed
- [ ] Test `isJumpPressed` returns `false` when none of the keys are pressed
- [ ] All tests pass and provide good coverage for this specific getter

### Expected Output
Enhanced `tests/unit/input-manager.test.js` with comprehensive tests for the `isJumpPressed` getter.

### Definition of Done
- [ ] All tests for `isJumpPressed` pass
- [ ] Tests use centralized mocks from Task 1.1
- [ ] Tests cover all key combinations (UP, W, SPACE)
- [ ] No existing tests broken

---

## Task 2.4: Test InputManager isDashPressed Getter ✅

### Task Title
Test InputManager isDashPressed Getter with Centralized Mocks

### Objective
Write comprehensive unit tests for the `isDashPressed` getter in InputManager using the new centralized mocks.

### Task Reference
Fourth behavioral test for InputManager.js using Task 1.1 mocks.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §4 (Input Mapping)
- [ ] **small_comprehensive_documentation.md sections to reference**: §1.5 (Input Handling)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/input-manager.test.js` - Add tests for `isDashPressed` getter
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Use the centralized Phaser key mock from Task 1.1
- [ ] Test `isDashPressed` returns `true` when SHIFT is just pressed (justDown)
- [ ] Test `isDashPressed` returns `false` when SHIFT is held down (not justDown)
- [ ] Test `isDashPressed` returns `false` when SHIFT is not pressed
- [ ] All tests pass and provide good coverage for this specific getter

### Expected Output
Enhanced `tests/unit/input-manager.test.js` with comprehensive tests for the `isDashPressed` getter.

### Definition of Done
- [ ] All tests for `isDashPressed` pass
- [ ] Tests use centralized mocks from Task 1.1
- [ ] Tests cover justDown vs isDown behavior for SHIFT
- [ ] No existing tests broken

---

## Task 2.5: Test InputManager isRewindPressed Getter ✅

### Task Title
Test InputManager isRewindPressed Getter with Centralized Mocks

### Objective
Write comprehensive unit tests for the `isRewindPressed` getter in InputManager using the new centralized mocks.

### Task Reference
Fifth behavioral test for InputManager.js using Task 1.1 mocks.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §4 (Input Mapping)
- [ ] **small_comprehensive_documentation.md sections to reference**: §1.5 (Input Handling)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/input-manager.test.js` - Add tests for `isRewindPressed` getter
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Use the centralized Phaser key mock from Task 1.1
- [ ] Test `isRewindPressed` returns `true` when R is pressed (isDown)
- [ ] Test `isRewindPressed` returns `false` when R is not pressed
- [ ] Test `isRewindPressed` returns `false` when other keys are pressed
- [ ] All tests pass and provide good coverage for this specific getter

### Expected Output
Enhanced `tests/unit/input-manager.test.js` with comprehensive tests for the `isRewindPressed` getter.

### Definition of Done
- [ ] All tests for `isRewindPressed` pass
- [ ] Tests use centralized mocks from Task 1.1
- [ ] Tests cover isDown behavior for R key
- [ ] No existing tests broken

---

## Task 2.6: Test InputManager isChronoPulsePressed Getter ✅

### Task Title
Test InputManager isChronoPulsePressed Getter with Centralized Mocks

### Objective
Write comprehensive unit tests for the `isChronoPulsePressed` getter in InputManager using the new centralized mocks.

### Task Reference
Sixth behavioral test for InputManager.js using Task 1.1 mocks.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §4 (Input Mapping)
- [ ] **small_comprehensive_documentation.md sections to reference**: §1.5 (Input Handling)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/input-manager.test.js` - Add tests for `isChronoPulsePressed` getter
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Use the centralized Phaser key mock from Task 1.1
- [ ] Test `isChronoPulsePressed` returns `true` when E is just pressed (justDown)
- [ ] Test `isChronoPulsePressed` returns `false` when E is held down (not justDown)
- [ ] Test `isChronoPulsePressed` returns `false` when E is not pressed
- [ ] All tests pass and provide good coverage for this specific getter

### Expected Output
Enhanced `tests/unit/input-manager.test.js` with comprehensive tests for the `isChronoPulsePressed` getter.

### Definition of Done
- [ ] All tests for `isChronoPulsePressed` pass
- [ ] Tests use centralized mocks from Task 1.1
- [ ] Tests cover justDown vs isDown behavior for E key
- [ ] No existing tests broken

---

## Task 2.7: Test InputManager isPausePressed Getter ✅

### Task Title
Test InputManager isPausePressed Getter with Centralized Mocks

### Objective
Write comprehensive unit tests for the `isPausePressed` getter in InputManager using the new centralized mocks.

### Task Reference
Seventh behavioral test for InputManager.js using Task 1.1 mocks.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §4 (Input Mapping)
- [ ] **small_comprehensive_documentation.md sections to reference**: §1.5 (Input Handling)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/input-manager.test.js` - Add tests for `isPausePressed` getter
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Use the centralized Phaser key mock from Task 1.1
- [ ] Test `isPausePressed` returns `true` when P is just pressed (justDown)
- [ ] Test `isPausePressed` returns `false` when P is held down (not justDown)
- [ ] Test `isPausePressed` returns `false` when P is not pressed
- [ ] All tests pass and provide good coverage for this specific getter

### Expected Output
Enhanced `tests/unit/input-manager.test.js` with comprehensive tests for the `isPausePressed` getter.

### Definition of Done
- [ ] All tests for `isPausePressed` pass
- [ ] Tests use centralized mocks from Task 1.1
- [ ] Tests cover justDown vs isDown behavior for P key
- [ ] No existing tests broken

---

## Task 3.1: Refactor IdleState Tests to Use Real InputManager

### Task Title
Refactor IdleState Tests to Use Real InputManager Mock

### Objective
Replace ad-hoc input mocks in IdleState tests with the real InputManager using centralized mocks.

### Task Reference
First state machine test refactor using Tasks 1.1 and 2.x mocks.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §2.1 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §5 (State Machine Contract)
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.2 (Platformer Character Controller)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/idle-state.test.js` - Replace input mocks with real InputManager
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Import InputManager and use centralized mocks from Tasks 1.1 and 2.x
- [ ] Replace any ad-hoc input mocks with real InputManager instance
- [ ] Ensure all existing IdleState tests still pass
- [ ] Verify state transitions work correctly with real InputManager
- [ ] No existing test functionality is lost

### Expected Output
Enhanced `tests/unit/idle-state.test.js` that uses real InputManager with centralized mocks.

### Definition of Done
- [ ] All IdleState tests pass
- [ ] Tests use real InputManager with centralized mocks
- [ ] No ad-hoc input mocks remain in the file
- [ ] All existing test functionality preserved

---

## Task 3.2: Refactor RunState Tests to Use Real InputManager

### Task Title
Refactor RunState Tests to Use Real InputManager Mock

### Objective
Replace ad-hoc input mocks in RunState tests with the real InputManager using centralized mocks.

### Task Reference
Second state machine test refactor using Tasks 1.1 and 2.x mocks.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §2.1 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §5 (State Machine Contract)
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.2 (Platformer Character Controller)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/run-state.test.js` - Replace input mocks with real InputManager
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Import InputManager and use centralized mocks from Tasks 1.1 and 2.x
- [ ] Replace any ad-hoc input mocks with real InputManager instance
- [ ] Ensure all existing RunState tests still pass
- [ ] Verify state transitions work correctly with real InputManager
- [ ] No existing test functionality is lost

### Expected Output
Enhanced `tests/unit/run-state.test.js` that uses real InputManager with centralized mocks.

### Definition of Done
- [ ] All RunState tests pass
- [ ] Tests use real InputManager with centralized mocks
- [ ] No ad-hoc input mocks remain in the file
- [ ] All existing test functionality preserved

---

## Task 4.1: Test TimeManager Pause Recording Functionality

### Task Title
Test TimeManager Pause Recording Functionality

### Objective
Write unit tests for the `pauseRecording()` and `resumeRecording()` methods in TimeManager.

### Task Reference
First TimeManager edge case test using Task 1.2 mocks.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §7 (TimeManager Rewind System)
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.1 (Time Control System)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/time-manager.test.js` - Add tests for pause/resume recording
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Use centralized scene mock from Task 1.2
- [ ] Test `pauseRecording()` stops new state snapshots from being recorded
- [ ] Test `resumeRecording()` resumes state snapshot recording
- [ ] Test that existing buffer is preserved when paused
- [ ] Test that new states are not added while paused
- [ ] All tests pass and provide good coverage for pause/resume functionality

### Expected Output
Enhanced `tests/unit/time-manager.test.js` with comprehensive tests for pause/resume recording.

### Definition of Done
- [ ] All pause/resume recording tests pass
- [ ] Tests use centralized mocks from Task 1.2
- [ ] Tests verify buffer preservation and recording control
- [ ] No existing tests broken

---

## Task 5.1: Test GameScene Pause Event Emission

### Task Title
Test GameScene Pause Event Emission

### Objective
Write integration tests for GameScene's pause event emission using centralized mocks.

### Task Reference
First GameScene integration test using Tasks 1.2 and 1.3 mocks.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §3 (Scene Lifecycle), §15 (Runtime Event Names)
- [ ] **small_comprehensive_documentation.md sections to reference**: §1.2 (Scene System)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/game-scene.test.js` - Add tests for pause event emission
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Use centralized scene and event emitter mocks from Tasks 1.2 and 1.3
- [ ] Test that `gamePaused` event is emitted when pause is triggered
- [ ] Test that `gameResumed` event is emitted when resume is triggered
- [ ] Test that events are emitted with correct parameters
- [ ] All tests pass and provide good coverage for pause event emission

### Expected Output
Enhanced `tests/unit/game-scene.test.js` with comprehensive tests for pause event emission.

### Definition of Done
- [ ] All pause event emission tests pass
- [ ] Tests use centralized mocks from Tasks 1.2 and 1.3
- [ ] Tests verify correct event emission and parameters
- [ ] No existing tests broken

---

## Task 6.1: Test ChronoPulse Cooldown Edge Cases

### Task Title
Test ChronoPulse Cooldown Edge Cases

### Objective
Write edge case tests for ChronoPulse cooldown functionality to prevent regressions.

### Task Reference
First invariant hotspot test using Task 1.2 mocks.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §9 (ChronoPulse Ability)
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.1 (Time Control System)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/chrono-pulse.test.js` - Add edge case tests for cooldown
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Use centralized scene mock from Task 1.2
- [ ] Test that `activate()` returns `false` when cooldown not elapsed
- [ ] Test that `activate()` returns `true` when cooldown has elapsed
- [ ] Test that calling `activate()` twice in same frame returns `false` for second call
- [ ] Test cooldown timing with different time intervals
- [ ] All tests pass and provide good coverage for cooldown edge cases

### Expected Output
Enhanced `tests/unit/chrono-pulse.test.js` with comprehensive edge case tests for cooldown.

### Definition of Done
- [ ] All cooldown edge case tests pass
- [ ] Tests use centralized mocks from Task 1.2
- [ ] Tests verify cooldown behavior and timing
- [ ] No existing tests broken

---

## Task 6.2: Test Coin Edge Cases

### Task Title
Test Coin Edge Cases (Double Collection, Collection During Rewind)

### Objective
Write edge case tests for Coin collection behavior to prevent regressions.

### Task Reference
Second invariant hotspot test using Task 1.2 mocks.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §10 (Collectible Behavior)
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.3 (Collectibles System)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/coin.test.js` - Add edge case tests for collection behavior
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Use centralized scene mock from Task 1.2
- [ ] Test that coin cannot be collected twice
- [ ] Test that coin collection is ignored during rewind
- [ ] Test that coin state is properly reset after rewind
- [ ] All tests pass and provide good coverage for collection edge cases

### Expected Output
Enhanced `tests/unit/coin.test.js` with comprehensive edge case tests for collection behavior.

### Definition of Done
- [ ] All collection edge case tests pass
- [ ] Tests use centralized mocks from Task 1.2
- [ ] Tests verify double collection and rewind behavior
- [ ] No existing tests broken

---

## TimeManager Comprehensive Test Coverage Tasks

### Task 8.1: Test TimeManager Constructor with Mock Scene

### Task Title
Test TimeManager Constructor with Mock Scene Parameter

### Objective
Test the TimeManager constructor's mock scene functionality and initialization.

### Task Reference
Foundation for all TimeManager test coverage improvements.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §7 (TimeManager Rewind System)
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.1 (Time Control System)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/time-manager.test.js` - Add constructor tests
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Test constructor with mockScene parameter
- [ ] Test constructor without mockScene parameter
- [ ] Test all initial property values (stateBuffer, isRewinding, managedObjects, etc.)
- [ ] Test recordInterval default value (50ms)
- [ ] Test isRecordingPaused initial state
- [ ] All tests pass

### Expected Output
Enhanced TimeManager constructor tests with comprehensive initialization coverage.

### Definition of Done
- [ ] Constructor tests cover all initialization scenarios
- [ ] All initial property values verified
- [ ] Mock scene functionality tested
- [ ] Unit tests pass
- [ ] No existing tests broken

---

### Task 8.2: Test TimeManager handleRewind Method

### Task Title
Test TimeManager handleRewind Method Logic

### Objective
Test the handleRewind method's rewind logic and edge cases.

### Task Reference
Builds on Task 8.1 constructor tests.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §7 (TimeManager Rewind System)
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.1 (Time Control System)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/time-manager.test.js` - Add handleRewind tests
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Test handleRewind with insufficient buffer (less than 2 frames)
- [ ] Test handleRewind with sufficient buffer
- [ ] Test playbackTimestamp calculation
- [ ] Test frame interpolation logic
- [ ] Test rewind termination conditions
- [ ] All tests pass

### Expected Output
Comprehensive tests for handleRewind method covering all logic paths.

### Definition of Done
- [ ] handleRewind method fully tested
- [ ] All edge cases covered
- [ ] Frame interpolation verified
- [ ] Unit tests pass
- [ ] No existing tests broken

---

### Task 8.3: Test TimeManager handleRecord Method

### Task Title
Test TimeManager handleRecord Method Logic

### Objective
Test the handleRecord method's recording logic and timing.

### Task Reference
Builds on Task 8.2 handleRewind tests.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §7 (TimeManager Rewind System)
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.1 (Time Control System)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/time-manager.test.js` - Add handleRecord tests
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Test handleRecord with recording paused
- [ ] Test handleRecord timing intervals (50ms)
- [ ] Test state recording for objects with getStateForRecording
- [ ] Test state recording for objects without getStateForRecording
- [ ] Test lastRecordTime updates
- [ ] All tests pass

### Expected Output
Comprehensive tests for handleRecord method covering all recording scenarios.

### Definition of Done
- [ ] handleRecord method fully tested
- [ ] Recording timing verified
- [ ] State recording methods tested
- [ ] Unit tests pass
- [ ] No existing tests broken

---

### Task 8.4: Test TimeManager applyFrame Method

### Task Title
Test TimeManager applyFrame Method

### Objective
Test the applyFrame method's state application logic.

### Task Reference
Builds on Task 8.3 handleRecord tests.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §7 (TimeManager Rewind System)
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.1 (Time Control System)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/time-manager.test.js` - Add applyFrame tests
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Test applyFrame with single object state
- [ ] Test applyFrame with multiple object states
- [ ] Test applyFrame with objects using setStateFromRecording
- [ ] Test applyFrame with objects using default state application
- [ ] Test frame timestamp handling
- [ ] All tests pass

### Expected Output
Comprehensive tests for applyFrame method covering all state application scenarios.

### Definition of Done
- [ ] applyFrame method fully tested
- [ ] Multiple object handling verified
- [ ] State application methods tested
- [ ] Unit tests pass
- [ ] No existing tests broken

---

### Task 8.5: Test TimeManager interpolateFrame Method

### Task Title
Test TimeManager interpolateFrame Method

### Objective
Test the interpolateFrame method's interpolation logic.

### Task Reference
Builds on Task 8.4 applyFrame tests.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §7 (TimeManager Rewind System)
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.1 (Time Control System)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/time-manager.test.js` - Add interpolateFrame tests
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Test interpolateFrame with matching objects in both frames
- [ ] Test interpolateFrame with objects only in frameA
- [ ] Test interpolation factor (t) calculations
- [ ] Test interpolated state properties (x, y, velocityX, velocityY)
- [ ] Test state preservation for non-interpolated properties
- [ ] All tests pass

### Expected Output
Comprehensive tests for interpolateFrame method covering all interpolation scenarios.

### Definition of Done
- [ ] interpolateFrame method fully tested
- [ ] Interpolation calculations verified
- [ ] Object matching logic tested
- [ ] Unit tests pass
- [ ] No existing tests broken

---

### Task 8.6: Test TimeManager lerp and interpolateState Methods

### Task Title
Test TimeManager lerp and interpolateState Methods

### Objective
Test the mathematical interpolation methods used by TimeManager.

### Task Reference
Builds on Task 8.5 interpolateFrame tests.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §7 (TimeManager Rewind System)
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.1 (Time Control System)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/time-manager.test.js` - Add lerp and interpolateState tests
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Test lerp method with various interpolation factors
- [ ] Test lerp edge cases (t=0, t=1, t=0.5)
- [ ] Test interpolateState with different state objects
- [ ] Test interpolateState property preservation
- [ ] Test mathematical accuracy of interpolation
- [ ] All tests pass

### Expected Output
Comprehensive tests for mathematical interpolation methods.

### Definition of Done
- [ ] lerp method fully tested
- [ ] interpolateState method fully tested
- [ ] Mathematical accuracy verified
- [ ] Unit tests pass
- [ ] No existing tests broken

---

### Task 8.7: Test TimeManager applyState Method

### Task Title
Test TimeManager applyState Method

### Objective
Test the applyState method's state restoration logic.

### Task Reference
Builds on Task 8.6 interpolation tests.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §7 (TimeManager Rewind System)
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.1 (Time Control System)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/time-manager.test.js` - Add applyState tests
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Test applyState with objects using setStateFromRecording
- [ ] Test applyState with objects using default state application
- [ ] Test position restoration (x, y)
- [ ] Test velocity restoration (body.setVelocity)
- [ ] Test animation restoration (anims.play)
- [ ] Test active/visible state restoration
- [ ] Test isActive custom property handling
- [ ] All tests pass

### Expected Output
Comprehensive tests for applyState method covering all state restoration scenarios.

### Definition of Done
- [ ] applyState method fully tested
- [ ] All state restoration paths covered
- [ ] Custom property handling verified
- [ ] Unit tests pass
- [ ] No existing tests broken

---

### Task 8.7.1: Fix PhaserSceneMock Game Config Structure

### Task Title
Fix PhaserSceneMock Game Config Structure for TimeManager Visual Effects

### Objective
Update the phaserSceneMock to include the proper game config structure that TimeManager's visual effects system expects.

### Task Reference
Critical fix for Task 8.8 gravity control tests to pass.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §2.2 (Mocking GSAP/Phaser)
- [ ] **invariants.md sections to verify**: §2 (Phaser Game Configuration)
- [ ] **small_comprehensive_documentation.md sections to reference**: §8.2 (Mocking External Libraries)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/mocks/phaserSceneMock.js` - Add game config structure
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Add `sys.game.config` structure to PhaserSceneMock constructor
- [ ] Set default width to 1280 and height to 720 (from invariants)
- [ ] Add camera tint methods (setTint, clearTint) to cameras.main
- [ ] Ensure graphics objects support setScrollFactor and setDepth
- [ ] Test that TimeManager visual effects can access game config
- [ ] All existing tests continue to pass
- [ ] Gravity control tests in Task 8.8 can now pass

### Expected Output
Updated phaserSceneMock with proper game config structure that supports TimeManager visual effects.

### Definition of Done
- [ ] phaserSceneMock includes sys.game.config with correct dimensions
- [ ] Camera mock includes tint methods
- [ ] Graphics mock includes scroll factor and depth methods
- [ ] All existing tests pass
- [ ] TimeManager visual effects can be tested properly

---

### Task 8.7.2: Add GSAP Mock for TimeManager Visual Effects

### Task Title
Add GSAP Mock for TimeManager Visual Effects Testing

### Objective
Create a proper GSAP mock that supports the visual effects methods used by TimeManager.

### Task Reference
Builds on Task 8.7.1 to complete visual effects testing support.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §2.2 (Mocking GSAP/Phaser)
- [ ] **invariants.md sections to verify**: §16 (Testing & Mock Integration)
- [ ] **small_comprehensive_documentation.md sections to reference**: §8.2 (Mocking External Libraries)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/__mocks__/gsap.js` - Enhance GSAP mock for visual effects
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Add `gsap.to()` method that returns a mock tween object
- [ ] Add `gsap.killTweensOf()` method
- [ ] Ensure mock tween objects support onComplete callbacks
- [ ] Test that TimeManager visual effects can use GSAP methods
- [ ] All existing GSAP-dependent tests continue to pass
- [ ] Visual effects tests can run without GSAP errors

### Expected Output
Enhanced GSAP mock that supports all methods used by TimeManager visual effects.

### Definition of Done
- [ ] GSAP mock includes all required methods for visual effects
- [ ] Mock tween objects support callback execution
- [ ] All existing tests pass
- [ ] TimeManager visual effects can be fully tested

---

### Task 8.7.3: Update TimeManager Tests to Use Fixed Mocks

### Task Title
Update TimeManager Tests to Use Fixed Scene and GSAP Mocks

### Objective
Update the TimeManager tests to properly use the fixed scene and GSAP mocks for comprehensive testing.

### Task Reference
Builds on Tasks 8.7.1 and 8.7.2 to complete the testing infrastructure.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §7 (TimeManager Rewind System)
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.1 (Time Control System)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/time-manager.test.js` - Update test setup to use fixed mocks
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Update beforeEach blocks to use enhanced scene mock
- [ ] Ensure all tests can access game config through scene.sys.game.config
- [ ] Test that visual effects methods can be called without errors
- [ ] Verify that gravity control tests work with proper scene structure
- [ ] All TimeManager tests pass with the new mock structure
- [ ] No test setup errors or missing property errors

### Expected Output
Updated TimeManager tests that work correctly with the fixed scene and GSAP mocks.

### Definition of Done
- [ ] All TimeManager tests use proper scene mock structure
- [ ] No missing property errors in tests
- [ ] Visual effects can be tested properly
- [ ] All tests pass consistently
- [ ] Test setup is clean and reliable

---

### Task 8.8: Test TimeManager toggleRewind Gravity Control

### Task Title
Test TimeManager toggleRewind Gravity Control

### Objective
Test the gravity control functionality during rewind toggle.

### Task Reference
Builds on Task 8.7 applyState tests.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §7 (TimeManager Rewind System)
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.1 (Time Control System)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/time-manager.test.js` - Add gravity control tests
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Test gravity disabled when rewind starts
- [ ] Test gravity enabled when rewind ends
- [ ] Test gravity control for objects with body
- [ ] Test gravity control for objects without body
- [ ] Test multiple managed objects gravity control
- [ ] All tests pass

### Expected Output
Comprehensive tests for gravity control during rewind operations.

### Definition of Done
- [ ] Gravity control fully tested
- [ ] All object types handled
- [ ] Multiple objects verified
- [ ] Unit tests pass
- [ ] No existing tests broken

---

### Task 8.9: Test TimeManager toggleRewind Buffer Management

### Task Title
Test TimeManager toggleRewind Buffer Management

### Objective
Test the state buffer management during rewind operations.

### Task Reference
Builds on Task 8.8 gravity control tests.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §7 (TimeManager Rewind System)
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.1 (Time Control System)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/time-manager.test.js` - Add buffer management tests
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Test playbackTimestamp initialization on rewind start
- [ ] Test buffer truncation on rewind end
- [ ] Test buffer preservation when no rewind occurs
- [ ] Test buffer handling with empty state
- [ ] Test buffer handling with single frame
- [ ] All tests pass

### Expected Output
Comprehensive tests for state buffer management during rewind.

### Definition of Done
- [ ] Buffer management fully tested
- [ ] All buffer operations verified
- [ ] Edge cases covered
- [ ] Unit tests pass
- [ ] No existing tests broken

---

### Task 8.10: Test TimeManager Visual Effects Integration

### Task Title
Test TimeManager Visual Effects Integration

### Objective
Test the integration between TimeManager and visual effects system.

### Task Reference
Builds on Task 8.9 buffer management tests.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §7 (TimeManager Rewind System)
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.1 (Time Control System)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/time-manager.test.js` - Add visual effects integration tests
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Test _activateRewindVisuals called during rewind start
- [ ] Test _deactivateRewindVisuals called during rewind end
- [ ] Test visual effects state tracking (_rewindActive)
- [ ] Test visual effects cleanup on destroy
- [ ] Test visual effects with missing scene components
- [ ] All tests pass

### Expected Output
Comprehensive tests for visual effects integration with TimeManager.

### Definition of Done
- [ ] Visual effects integration fully tested
- [ ] All visual effect methods verified
- [ ] Cleanup operations tested
- [ ] Unit tests pass
- [ ] No existing tests broken

---

### Task 8.11: Test TimeManager destroy Method

### Task Title
Test TimeManager destroy Method

### Objective
Test the TimeManager destroy method's cleanup functionality.

### Task Reference
Builds on Task 8.10 visual effects integration tests.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §7 (TimeManager Rewind System)
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.1 (Time Control System)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/time-manager.test.js` - Add destroy method tests
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Test destroy with active rewind overlay
- [ ] Test destroy without rewind overlay
- [ ] Test overlay destruction
- [ ] Test camera tint clearing
- [ ] Test multiple destroy calls
- [ ] All tests pass

### Expected Output
Comprehensive tests for TimeManager destroy method cleanup.

### Definition of Done
- [ ] destroy method fully tested
- [ ] All cleanup operations verified
- [ ] Multiple destroy calls handled
- [ ] Unit tests pass
- [ ] No existing tests broken

---

### Task 8.12: Test TimeManager Edge Cases and Error Handling

### Task Title
Test TimeManager Edge Cases and Error Handling

### Objective
Test TimeManager edge cases and error handling scenarios.

### Task Reference
Builds on Task 8.11 destroy method tests.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §1.2 (Test Pyramid), §2.2 (Mocking)
- [ ] **invariants.md sections to verify**: §7 (TimeManager Rewind System)
- [ ] **small_comprehensive_documentation.md sections to reference**: §7.1 (Time Control System)

### Implementation Plan
- **Create**: None
- **Modify**: `tests/unit/time-manager.test.js` - Add edge case tests
- **Delete**: None

### Task Breakdown & Acceptance Criteria
- [ ] Test rewind with no managed objects
- [ ] Test recording with no managed objects
- [ ] Test objects without required properties
- [ ] Test rapid rewind toggle calls
- [ ] Test extreme time values
- [ ] Test memory leak prevention
- [ ] All tests pass

### Expected Output
Comprehensive edge case and error handling tests for TimeManager.

### Definition of Done
- [ ] Edge cases fully tested
- [ ] Error handling verified
- [ ] Memory leak prevention tested
- [ ] Unit tests pass
- [ ] No existing tests broken

---

## Task 9.1: Document Centralized Mocks and Architectural Changes

### Task Title
Document Centralized Mocks and Architectural Changes in Project Documentation

### Objective
Document all centralized mocks created and architectural changes made during the test coverage improvement phase.

### Task Reference
Documentation task for all changes made in Tasks 1.1-8.5 and any architectural improvements.

### Pre-Implementation Analysis
- [ ] **testing_best_practices.md sections to apply**: §2.2 (Mocking GSAP/Phaser), §3.1 (LLM-Centric Workflow)
- [ ] **invariants.md sections to verify**: §16 (Testing & Mock Integration)
- [ ] **small_comprehensive_documentation.md sections to reference**: §8.2 (Mocking External Libraries)

### Implementation Plan
- **Create**: None
- **Modify**: 
  - `agent_docs/testing_best_practices.md` - Add centralized mock documentation
  - `agent_docs/invariants.md` - Update testing invariants if needed
- **Delete**: None

### Task Breakdown & Acceptance Criteria

#### 9.1.1 Document Centralized Mocks in testing_best_practices.md
- [ ] Add new section "§2.3 Centralized Mock Architecture" after §2.2
- [ ] Document the three centralized mocks created:
  - `tests/mocks/phaserKeyMock.js` - Phaser keyboard input mock
  - `tests/mocks/phaserSceneMock.js` - Phaser scene mock  
  - `tests/mocks/eventEmitterMock.js` - Event emitter mock
- [ ] Include interface specifications for each mock
- [ ] Document usage examples and best practices
- [ ] Explain the benefits of centralized mocks over ad-hoc mocking
- [ ] Add decision matrix for when to use each mock type

#### 9.1.2 Update Mock Integration Guidelines
- [ ] Update §2.2 to reference the new centralized mocks
- [ ] Add guidelines for extending centralized mocks
- [ ] Document the factory pattern used in mocks
- [ ] Add troubleshooting section for common mock issues

#### 9.1.3 Document Test Coverage Improvements
- [ ] Add section documenting the test coverage improvements made
- [ ] List all InputManager getter tests added (Tasks 2.1-2.7)
- [ ] Document state machine test refactoring (Tasks 3.1-3.2)
- [ ] Document TimeManager comprehensive testing (Tasks 8.1-8.5)
- [ ] Include coverage statistics and improvements

#### 9.1.4 Update Invariants if Needed
- [ ] Review all changes made during this session
- [ ] Update §16 (Testing & Mock Integration) if new patterns introduced
- [ ] Add any new testing invariants discovered
- [ ] Document the centralized mock architecture as a project invariant

### Expected Output
Enhanced documentation files with comprehensive coverage of all centralized mocks and architectural changes made during the test coverage improvement phase.

### Definition of Done
- [ ] testing_best_practices.md updated with centralized mock documentation
- [ ] Mock interface specifications documented
- [ ] Usage examples and best practices included
- [ ] Test coverage improvements documented
- [ ] Invariants.md updated if needed
- [ ] All documentation is clear and actionable for future development

---

_End of Phase 4 Test Coverage Plan - Atomic Tasks_ 