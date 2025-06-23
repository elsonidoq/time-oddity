# Time Oddity MVP: Detailed Task Breakdown

## Overview

This document breaks down each phase of the MVP development into granular, testable tasks. Each task is designed to be completed independently by an engineering LLM, with clear start/end points and focused on a single concern.

## Development Workflow

### Branch Management
Each phase will be developed on its own branch and merged into main upon completion:

1. **Phase 1**: `feature/phase-1-foundation`
2. **Phase 2**: `feature/phase-2-player-movement`
3. **Phase 3**: `feature/phase-3-gameplay-mechanics`
4. **Phase 4**: `feature/phase-4-level-design`
5. **Phase 5**: `feature/phase-5-polish`

### Task Completion Tracking
- Mark each task as completed by changing `- [ ]` to `- [x]` when finished
- Add completion date and any notes after each completed task
- Example: `- [x] Task completed on 2024-01-15 - Added error handling for edge cases`

### Phase Completion Checklist
Before merging each phase branch:
- [ ] All tasks in the phase are marked as completed
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Performance is acceptable
- [ ] Code follows established patterns
- [ ] Assets are properly integrated

---

## Phase 3: Core Gameplay Mechanics

**Branch**: `feature/phase-3-gameplay-mechanics`

**CRITICAL IMPLEMENTATION REQUIREMENT**: Before implementing any task in this phase, you MUST read the comprehensive documentation file `agent_docs/comprehensive_documentation.md`. This document contains detailed implementation patterns, architectural decisions, and code examples for all systems in this phase. Pay special attention to:
- Section 7.1: The Time Control System (for TimeManager, TemporalState, and rewind mechanics)
- Section 7.2: Platformer Character Controller (for state machine patterns)
- Section 2: High-Performance Animation with GSAP (for visual effects)
- Section 3: Advanced Audio Management with Howler.js (for audio integration)

**TDD REQUIREMENT**: All tasks in this phase follow Test-Driven Development (TDD). You MUST:
1. Write comprehensive unit tests FIRST
2. Run tests to confirm they fail (Red phase)
3. Implement the minimum functionality to make tests pass (Green phase)
4. Refactor and bugfix until all tests pass (Refactor phase)
5. Only mark task as complete when ALL tests pass

### Task 3.1: Create TimeManager Class
**Objective**: Implement the core time manipulation system
**IMPLEMENTATION REFERENCE**: See Section 7.1 "The Time Control System: A Deep Dive" in `agent_docs/comprehensive_documentation.md`.
**TDD APPROACH**:
1.  FIRST: Write unit tests for TimeManager class.
2.  SECOND: Create `client/src/systems/TimeManager.js` to make tests pass.
- **Expected output**: The `TimeManager.js` class file is created in `client/src/systems/`. All associated tests pass. There is no visible change in the game.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.
- [x] Completed on 2024-06-11 - Created TimeManager class and initial tests.

### Task 3.2: Create TemporalState Object
**Objective**: Define the data structure for recorded states
**IMPLEMENTATION REFERENCE**: See Section 7.1 "The `TemporalState` Object" table in `agent_docs/comprehensive_documentation.md`.
**TDD APPROACH**:
1.  FIRST: Write unit tests for TemporalState.
2.  SECOND: Create `client/src/systems/TemporalState.js` to make tests pass.
- **Expected output**: The `TemporalState.js` class file is created in `client/src/systems/`. All associated tests pass. This is a data structure with no visible game change.
- **After completion**: Mark task as completed only after ALL project tests pass.
- [x] Completed on 2024-06-11 - Created TemporalState data class and tests.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 3.3: Implement State Recording for Player
**Objective**: Record player states over time
**IMPLEMENTATION REFERENCE**: See Section 7.1 "The `TimeManager` and Recording Logic" in `agent_docs/comprehensive_documentation.md`.
**TDD APPROACH**:
1.  FIRST: Write tests to verify player state is recorded.
2.  SECOND: Update TimeManager to record states from the player object.
- **Expected output**: The TimeManager should now be recording the player's state. This can be verified by adding a temporary console log in the `TimeManager` to show the state buffer growing as the player moves.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.
- [x] Completed on 2024-06-11 - Implemented player state recording in TimeManager.

### Task 3.4: Add Rewind Trigger
**Objective**: Enable time rewind activation
**IMPLEMENTATION REFERENCE**: See Section 7.1 "Rewind Activation" in `agent_docs/comprehensive_documentation.md`.
**TDD APPROACH**:
1.  FIRST: Write tests for the rewind trigger.
2.  SECOND: Update `InputManager` and `TimeManager` to handle the rewind input.
- **Expected output**: Pressing the 'R' key toggles the rewind mode in the `TimeManager`. This can be verified by logging the state change to the console. The game world will not visually rewind yet.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.
- [x] Completed on 2024-06-11 - Added rewind trigger on 'R' key press.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 3.5: Implement Basic Rewind for Player
**Objective**: Apply recorded states to player
**IMPLEMENTATION REFERENCE**: See Section 7.1 "Rewind Activation" code example in `agent_docs/comprehensive_documentation.md`.
**TDD APPROACH**:
1.  FIRST: Write tests to verify player state is restored from buffer.
2.  SECOND: Update `TimeManager` to apply stored states back to the player.
- **Expected output**: While holding the 'R' key, the player character visibly moves backward along their recent path. Releasing the key returns normal control to the player.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.
- [x] Completed on 2024-06-11 - Implemented smooth time-based rewind with interpolation for natural playback speed.

### Task 3.6: Add Rewind Visual Effects
**Objective**: Enhance rewind with visual feedback
**IMPLEMENTATION REFERENCE**: See Section 2 "High-Performance Animation with GSAP" in `agent_docs/comprehensive_documentation.md`.
**TDD APPROACH**:
1.  FIRST: Write tests for visual effect activation.
2.  SECOND: Use GSAP in `GameScene` or `TimeManager` to apply a visual effect during rewind.
- **Expected output**: When the rewind is active, the screen should have a distinct visual effect (e.g., a color tint or shader effect) to give feedback to the player.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.
- [x] Completed on 2024-06-12 - Rewind visual effect implemented and validated in-game. (Tests require further work, see 3.6.bis)

### Task 3.7: Create Phase Dash Ability
**Objective**: Implement short-range teleportation
**IMPLEMENTATION REFERENCE**: See Section 7.2 "Platformer Character Controller" in `agent_docs/comprehensive_documentation.md`.
**TDD APPROACH**:
1.  FIRST: Write a new `DashState` test.
2.  SECOND: Create `DashState.js` and integrate it into the player's state machine.
- **Expected output**: The player can now dash a short distance by pressing a key (e.g., Shift). The player should move instantly and not be able to pass through platforms.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.
- [x] Completed on 2024-06-12 - Dash ability implemented, tested, and integrated. All tests pass. Awaiting in-game validation.

---

## Task 3.8: Add Dash Ghost Trail

### Objective
Create visual trail effect for dash ability using GSAP animations to enhance player feedback and visual appeal.

### Documentation References
- [x] Section 2.3 "Definitive Integration Pattern: GSAP + Phaser" in `comprehensive_documentation.md`
- [x] Section 2.4 "Game-Specific Use Cases for 'Time Oddity'" in `comprehensive_documentation.md`
- [x] Testing and Mocking section for GSAP mocking patterns
- [x] Related to Task 3.7 (DashState implementation)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/entities/states/DashState.js` - Add ghost trail creation logic
  - `client/src/systems/ObjectPool.js` - Extend for ghost sprite pooling
  - `tests/unit/dash-state.test.js` - Add ghost trail tests
- **Integration Points:**
  - GSAP animation system for trail effects
  - ObjectPool system for performance optimization
  - Player state machine (DashState)
- **Mocking/Test Setup:**
  - GSAP mock for animation testing
  - Phaser mock for sprite creation
  - Fake timers for animation timing
- **Potential Risks/Complexity:**
  - Memory leaks from unmanaged ghost sprites
  - Performance impact of multiple animated sprites
  - Animation timing synchronization

### TDD Test Plan
- **Test Files to Create/Update:**
  - `tests/unit/dash-state.test.js` - Add ghost trail tests
  - `tests/unit/object-pool.test.js` - Test ghost sprite pooling
- **Test Cases:**
  - Ghost sprites are created when dash starts
  - Ghost sprites fade out over time
  - Ghost sprites are properly recycled via object pool
  - Multiple dashes don't create memory leaks
  - Ghost sprites use correct player sprite texture
- **Test Data/Mocks Needed:**
  - GSAP mock with timeline support
  - Mock sprite objects for ghost trails
  - Fake timers for animation timing

### Task Breakdown & Acceptance Criteria
- [ ] **3.8.1**: Create ghost sprite factory function with proper texture copying
- [ ] **3.8.2**: Implement ghost trail creation in DashState.enter() method
- [ ] **3.8.3**: Add GSAP fade-out animation for ghost sprites
- [ ] **3.8.4**: Integrate with ObjectPool for ghost sprite recycling
- [ ] **3.8.5**: Add cleanup logic to prevent memory leaks

### Expected Output
When the player dashes, a trail of 3-5 semi-transparent "ghost" sprites appears behind them, each fading out over 0.5 seconds. The effect is smooth and doesn't impact performance.

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Ghost trail effect is visible and smooth in-game
- [ ] All project tests pass (locally and in CI)
- [ ] No memory leaks detected (ghost sprites properly recycled)
- [ ] Performance impact is minimal (<5ms per dash)
- [ ] Code follows established patterns and documentation
- [ ] Task marked as complete in tracking system

### Git Handling
- [ ] All changes committed with clear, descriptive messages
- [ ] Changes pushed to `feature/phase-3-gameplay-mechanics` branch
- [ ] Branch is up to date with main before merge

---

## Task 3.9: Implement Dash Cooldown

### Objective
Add cooldown mechanism to dash ability to balance gameplay and prevent spam usage.

### Documentation References
- [x] Section 7.2 "Player State Machine Definition" in `comprehensive_documentation.md`
- [x] Testing and Mocking section for time-based logic testing
- [x] Related to Task 3.7 (DashState) and Task 3.8 (Ghost Trail)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/entities/states/DashState.js` - Add cooldown logic
  - `client/src/entities/Player.js` - Add cooldown state tracking
  - `tests/unit/dash-state.test.js` - Add cooldown tests
- **Integration Points:**
  - Player state machine transitions
  - Input handling system
  - Time-based cooldown system
- **Mocking/Test Setup:**
  - Fake timers for cooldown testing
  - Mock input system for key press simulation
  - State machine mock for transition testing
- **Potential Risks/Complexity:**
  - State machine transition conflicts
  - Input buffering during cooldown
  - Visual feedback for cooldown state

### TDD Test Plan
- **Test Files to Create/Update:**
  - `tests/unit/dash-state.test.js` - Add cooldown tests
  - `tests/unit/player-class.test.js` - Test cooldown integration
- **Test Cases:**
  - Dash cannot be triggered during cooldown period
  - Cooldown timer resets after full duration
  - Multiple dash attempts during cooldown are ignored
  - Cooldown state is properly tracked in player
  - State machine transitions respect cooldown
- **Test Data/Mocks Needed:**
  - Fake timers for deterministic timing
  - Mock input keys for dash trigger
  - Mock state machine for transition testing

### Task Breakdown & Acceptance Criteria
- [ ] **3.9.1**: Add cooldown property to Player class (default 1 second)
- [ ] **3.9.2**: Implement cooldown check in DashState.enter() method
- [ ] **3.9.3**: Add cooldown timer management in Player class
- [ ] **3.9.4**: Prevent dash input processing during cooldown
- [ ] **3.9.5**: Add visual feedback for cooldown state (optional)

### Expected Output
After dashing, the player cannot dash again for 1 second. Attempting to dash during this period has no effect. The cooldown is properly managed and doesn't interfere with other player actions.

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Cooldown prevents dash spam in-game
- [ ] All project tests pass (locally and in CI)
- [ ] Cooldown timing is accurate and consistent
- [ ] No interference with other player abilities
- [ ] Code follows established patterns and documentation
- [ ] Task marked as complete in tracking system

### Git Handling
- [ ] All changes committed with clear, descriptive messages
- [ ] Changes pushed to `feature/phase-3-gameplay-mechanics` branch
- [ ] Branch is up to date with main before merge

---

## Task 3.10: Create Chrono Pulse Ability

### Objective
Implement time freeze shockwave ability that creates a visual effect expanding from the player's position.

### Documentation References
- [x] Section 2.4 "Game-Specific Use Cases for 'Time Oddity'" in `comprehensive_documentation.md`
- [x] Section 2.3 "Definitive Integration Pattern: GSAP + Phaser" in `comprehensive_documentation.md`
- [x] Testing and Mocking section for GSAP and Phaser mocking
- [x] Related to Task 3.14 (Enemy Freeze Effect)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/entities/ChronoPulse.js` - New class for pulse ability
  - `client/src/entities/Player.js` - Add pulse trigger and cooldown
  - `client/src/scenes/GameScene.js` - Add pulse to scene management
  - `tests/unit/chrono-pulse.test.js` - New test file
- **Integration Points:**
  - GSAP animation system for shockwave effect
  - Player input system for 'E' key trigger
  - GameScene for pulse lifecycle management
- **Mocking/Test Setup:**
  - GSAP mock for timeline animations
  - Phaser mock for sprite and graphics creation
  - Mock input system for key press simulation
- **Potential Risks/Complexity:**
  - Complex GSAP timeline choreography
  - Performance impact of multiple pulse effects
  - Visual effect synchronization

### TDD Test Plan
- **Test Files to Create/Update:**
  - `tests/unit/chrono-pulse.test.js` - New comprehensive test file
  - `tests/unit/player-class.test.js` - Add pulse trigger tests
- **Test Cases:**
  - ChronoPulse creates expanding shockwave effect
  - Pulse effect has proper duration and timing
  - Pulse is triggered by 'E' key press
  - Pulse has appropriate cooldown period
  - Pulse effect is properly cleaned up after completion
  - Multiple pulses can be queued but not spammed
- **Test Data/Mocks Needed:**
  - GSAP mock with timeline and tween support
  - Mock graphics object for shockwave visualization
  - Fake timers for effect timing
  - Mock input system for key simulation

### Task Breakdown & Acceptance Criteria
- [ ] **3.10.1**: Create ChronoPulse class with basic structure
- [ ] **3.10.2**: Implement shockwave visual effect using GSAP
- [ ] **3.10.3**: Add 'E' key trigger in Player class
- [ ] **3.10.4**: Integrate pulse with GameScene lifecycle
- [ ] **3.10.5**: Add cooldown mechanism for pulse ability

### Expected Output
Pressing 'E' creates a visible shockwave effect that expands from the player's position over 1 second. The effect is smooth and visually appealing, with proper cleanup after completion.

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Chrono Pulse effect is visible and smooth in-game
- [ ] All project tests pass (locally and in CI)
- [ ] Effect timing and visual quality meet standards
- [ ] No performance impact from pulse effects
- [ ] Code follows established patterns and documentation
- [ ] Task marked as complete in tracking system

### Git Handling
- [ ] All changes committed with clear, descriptive messages
- [ ] Changes pushed to `feature/phase-3-gameplay-mechanics` branch
- [ ] Branch is up to date with main before merge

---

## Task 3.11: Create Enemy Base Class

### Objective
Establish foundation for all enemy types with common functionality and state management.

### Documentation References
- [x] Section 1.3 "Asset and Sprite Management" in `comprehensive_documentation.md`
- [x] Section 1.4 "Arcade Physics Engine" in `comprehensive_documentation.md`
- [x] Testing and Mocking section for Phaser mocking patterns
- [x] Related to Task 3.12 (LoopHound Enemy)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/entities/Enemy.js` - New base class
  - `client/src/entities/Entity.js` - Extend base Entity class
  - `tests/unit/enemy-base-class.test.js` - New test file
- **Integration Points:**
  - Entity base class inheritance
  - Phaser physics system
  - State machine for enemy AI
- **Mocking/Test Setup:**
  - Phaser mock for sprite and physics
  - Mock state machine for AI behavior
  - Mock scene for enemy creation
- **Potential Risks/Complexity:**
  - Complex inheritance hierarchy
  - Physics body management
  - State machine integration

### TDD Test Plan
- **Test Files to Create/Update:**
  - `tests/unit/enemy-base-class.test.js` - New comprehensive test file
  - `tests/unit/entity-base-class.test.js` - Test inheritance
- **Test Cases:**
  - Enemy extends Entity base class correctly
  - Enemy has physics body with proper configuration
  - Enemy can be positioned and moved
  - Enemy has health and damage properties
  - Enemy can be destroyed and respawned
  - Enemy integrates with state machine for AI
- **Test Data/Mocks Needed:**
  - Mock Entity base class
  - Mock physics body with velocity and position
  - Mock state machine for AI behavior
  - Mock scene for enemy creation

### Task Breakdown & Acceptance Criteria
- [ ] **3.11.1**: Create Enemy class extending Entity
- [ ] **3.11.2**: Add physics body configuration
- [ ] **3.11.3**: Implement health and damage system
- [ ] **3.11.4**: Add state machine integration for AI
- [ ] **3.11.5**: Implement destroy and respawn methods

### Expected Output
The Enemy.js base class is created in `client/src/entities/` with all associated tests passing. No enemies appear in the game yet, but the foundation is ready for specific enemy types.

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Enemy base class is properly structured and tested
- [ ] All project tests pass (locally and in CI)
- [ ] Base class provides solid foundation for enemy types
- [ ] Code follows established patterns and documentation
- [ ] Task marked as complete in tracking system

### Git Handling
- [ ] All changes committed with clear, descriptive messages
- [ ] Changes pushed to `feature/phase-3-gameplay-mechanics` branch
- [ ] Branch is up to date with main before merge

---

## Task 3.12: Implement LoopHound Enemy

### Objective
Create the first enemy type with basic patrol AI using the Enemy base class.

### Documentation References
- [x] Section 1.3 "Creating Game Objects" in `comprehensive_documentation.md`
- [x] Section 1.4 "Collision Detection" in `comprehensive_documentation.md`
- [x] Testing and Mocking section for Phaser mocking patterns
- [x] Related to Task 3.11 (Enemy Base Class) and Task 3.13 (Enemy-Player Collision)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/entities/enemies/LoopHound.js` - New enemy class
  - `client/src/scenes/GameScene.js` - Add LoopHound to scene
  - `tests/unit/loophound-enemy.test.js` - New test file
- **Integration Points:**
  - Enemy base class inheritance
  - Kenney asset sprites
  - Patrol AI state machine
  - GameScene enemy management
- **Mocking/Test Setup:**
  - Mock Enemy base class
  - Mock Kenney sprite assets
  - Mock state machine for patrol behavior
  - Mock scene for enemy instantiation
- **Potential Risks/Complexity:**
  - AI pathfinding and boundary detection
  - Sprite animation integration
  - Performance with multiple enemies

### TDD Test Plan
- **Test Files to Create/Update:**
  - `tests/unit/loophound-enemy.test.js` - New comprehensive test file
  - `tests/unit/game-scene.test.js` - Test enemy integration
- **Test Cases:**
  - LoopHound extends Enemy base class correctly
  - LoopHound uses correct Kenney sprite asset
  - LoopHound patrols back and forth on platform
  - LoopHound changes direction at boundaries
  - LoopHound has proper collision detection
  - LoopHound integrates with GameScene properly
- **Test Data/Mocks Needed:**
  - Mock Enemy base class
  - Mock Kenney sprite assets
  - Mock physics body for movement testing
  - Mock scene for enemy management

### Task Breakdown & Acceptance Criteria
- [ ] **3.12.1**: Create LoopHound class extending Enemy
- [ ] **3.12.2**: Configure Kenney sprite asset and animations
- [ ] **3.12.3**: Implement patrol AI with boundary detection
- [ ] **3.12.4**: Add LoopHound instance to GameScene
- [ ] **3.12.5**: Test enemy behavior in-game

### Expected Output
A LoopHound enemy appears in the GameScene, using a Kenney enemy sprite and performing basic patrol AI (moving back and forth on a platform with proper boundary detection).

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] LoopHound enemy is visible and functional in-game
- [ ] All project tests pass (locally and in CI)
- [ ] Patrol AI works correctly with boundary detection
- [ ] Enemy uses proper Kenney sprite assets
- [ ] Code follows established patterns and documentation
- [ ] Task marked as complete in tracking system

### Git Handling
- [ ] All changes committed with clear, descriptive messages
- [ ] Changes pushed to `feature/phase-3-gameplay-mechanics` branch
- [ ] Branch is up to date with main before merge

---

## Task 3.13: Add Enemy-Player Collision

### Objective
Enable collision detection between player and enemies to establish combat system foundation.

### Documentation References
- [x] Section 1.4 "Collision Detection" in `comprehensive_documentation.md`
- [x] Section 1.4 "Physics Groups" in `comprehensive_documentation.md`
- [x] Testing and Mocking section for collision testing
- [x] Related to Task 3.12 (LoopHound Enemy) and Task 3.14 (Enemy Freeze Effect)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/systems/CollisionManager.js` - Add enemy-player collider
  - `client/src/scenes/GameScene.js` - Configure collision groups
  - `tests/unit/collision-manager.test.js` - Add collision tests
- **Integration Points:**
  - CollisionManager system
  - Player and Enemy physics bodies
  - GameScene collision group management
- **Mocking/Test Setup:**
  - Mock physics bodies for collision simulation
  - Mock collision callback functions
  - Mock scene physics system
- **Potential Risks/Complexity:**
  - Collision callback performance
  - Multiple enemy collision handling
  - Collision group management

### TDD Test Plan
- **Test Files to Create/Update:**
  - `tests/unit/collision-manager.test.js` - Add enemy-player collision tests
  - `tests/integration/enemy-player-collision.test.js` - Integration test
- **Test Cases:**
  - Collision between player and enemy is detected
  - Collision callback is triggered with correct parameters
  - Multiple enemies can collide with player
  - Collision groups are properly configured
  - Collision detection is performant
- **Test Data/Mocks Needed:**
  - Mock player and enemy physics bodies
  - Mock collision callback functions
  - Mock scene physics system
  - Mock collision groups

### Task Breakdown & Acceptance Criteria
- [ ] **3.13.1**: Configure enemy physics group in GameScene
- [ ] **3.13.2**: Add player-enemy collider in CollisionManager
- [ ] **3.13.3**: Implement collision callback function
- [ ] **3.13.4**: Test collision detection in-game
- [ ] **3.13.5**: Add collision event logging for debugging

### Expected Output
When the player touches an enemy, a collision is registered and logged to the console. The collision system is properly configured and ready for damage/effect implementation.

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Enemy-player collisions are detected and logged
- [ ] All project tests pass (locally and in CI)
- [ ] Collision system is performant and reliable
- [ ] Code follows established patterns and documentation
- [ ] Task marked as complete in tracking system

### Git Handling
- [ ] All changes committed with clear, descriptive messages
- [ ] Changes pushed to `feature/phase-3-gameplay-mechanics` branch
- [ ] Branch is up to date with main before merge

---

## Task 3.14: Add Enemy Freeze Effect

### Objective
Make enemies freeze when hit by Chrono Pulse shockwave, implementing time manipulation mechanics.

### Documentation References
- [x] Section 2.4 "Time Freeze" patterns in `comprehensive_documentation.md`
- [x] Section 1.4 "Overlap Detection" in `comprehensive_documentation.md`
- [x] Testing and Mocking section for overlap testing
- [x] Related to Task 3.10 (Chrono Pulse) and Task 3.13 (Enemy-Player Collision)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/entities/ChronoPulse.js` - Add overlap detection
  - `client/src/entities/Enemy.js` - Add freeze state management
  - `client/src/systems/CollisionManager.js` - Add pulse-enemy overlap
  - `tests/unit/chrono-pulse.test.js` - Add freeze effect tests
- **Integration Points:**
  - ChronoPulse overlap detection
  - Enemy state management
  - Time-based freeze duration
- **Mocking/Test Setup:**
  - Mock overlap detection system
  - Mock enemy state management
  - Fake timers for freeze duration
- **Potential Risks/Complexity:**
  - Overlap detection performance
  - Freeze state synchronization
  - Multiple pulse effects coordination

### TDD Test Plan
- **Test Files to Create/Update:**
  - `tests/unit/chrono-pulse.test.js` - Add freeze effect tests
  - `tests/unit/enemy-base-class.test.js` - Add freeze state tests
- **Test Cases:**
  - Enemy freezes when pulse overlaps
  - Freeze effect has proper duration
  - Enemy movement and animations stop during freeze
  - Multiple enemies can be frozen simultaneously
  - Freeze effect properly expires after duration
  - Frozen enemies are immune to additional freezes
- **Test Data/Mocks Needed:**
  - Mock overlap detection system
  - Mock enemy state management
  - Fake timers for freeze duration testing
  - Mock animation system for freeze verification

### Task Breakdown & Acceptance Criteria
- [ ] **3.14.1**: Add overlap detection between ChronoPulse and enemies
- [ ] **3.14.2**: Implement freeze state in Enemy base class
- [ ] **3.14.3**: Add freeze duration timer management
- [ ] **3.14.4**: Stop enemy movement and animations during freeze
- [ ] **3.14.5**: Test freeze effect in-game

### Expected Output
When the player's Chrono Pulse shockwave overlaps with an enemy, the enemy's movement and animations freeze for a short duration (2-3 seconds), then resume normal behavior.

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Enemy freeze effect works correctly in-game
- [ ] All project tests pass (locally and in CI)
- [ ] Freeze duration and visual feedback are appropriate
- [ ] Code follows established patterns and documentation
- [ ] Task marked as complete in tracking system

### Git Handling
- [ ] All changes committed with clear, descriptive messages
- [ ] Changes pushed to `feature/phase-3-gameplay-mechanics` branch
- [ ] Branch is up to date with main before merge

---

## Task 3.15: Implement Enemy Respawn

### Objective
Make enemies respawn after defeat to maintain gameplay challenge and implement object lifecycle management.

### Documentation References
- [x] Section 1.7 "Object Pooling" in `comprehensive_documentation.md`
- [x] Section 1.7 "Memory Management" in `comprehensive_documentation.md`
- [x] Testing and Mocking section for lifecycle testing
- [x] Related to Task 3.11 (Enemy Base Class) and Task 3.16 (Enemy State Recording)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/entities/Enemy.js` - Add respawn logic
  - `client/src/systems/EnemyManager.js` - New manager class
  - `client/src/scenes/GameScene.js` - Integrate enemy manager
  - `tests/unit/enemy-manager.test.js` - New test file
- **Integration Points:**
  - Enemy lifecycle management
  - Object pooling system
  - Time-based respawn delays
- **Mocking/Test Setup:**
  - Mock object pooling system
  - Fake timers for respawn delays
  - Mock scene for enemy management
- **Potential Risks/Complexity:**
  - Memory management with respawning
  - Respawn timing coordination
  - Performance with many enemies

### TDD Test Plan
- [ ] **Test Files to Create/Update:**
  - `tests/unit/enemy-manager.test.js` - New comprehensive test file
  - `tests/unit/enemy-base-class.test.js` - Add respawn tests
- **Test Cases:**
  - Destroyed enemy respawns after delay
  - Enemy respawns at original spawn position
  - Multiple enemies can respawn independently
  - Respawn timing is configurable per enemy type
  - Respawned enemies have fresh state
  - Enemy manager handles multiple enemy types
- **Test Data/Mocks Needed:**
  - Mock object pooling system
  - Fake timers for respawn delay testing
  - Mock spawn positions and enemy types
  - Mock scene for enemy lifecycle management

### Task Breakdown & Acceptance Criteria
- [ ] **3.15.1**: Create EnemyManager class for lifecycle management
- [ ] **3.15.2**: Add respawn logic to Enemy base class
- [ ] **3.15.3**: Implement configurable respawn delays
- [ ] **3.15.4**: Integrate with object pooling for performance
- [ ] **3.15.5**: Test respawn system in-game

### Expected Output
After an enemy is destroyed (manually via console for testing), it reappears at its initial spawn point after a set delay (3-5 seconds). The system is efficient and doesn't cause memory leaks.

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Enemy respawn system works correctly in-game
- [ ] All project tests pass (locally and in CI)
- [ ] No memory leaks from respawning system
- [ ] Respawn timing is appropriate and configurable
- [ ] Code follows established patterns and documentation
- [ ] Task marked as complete in tracking system

### Git Handling
- [ ] All changes committed with clear, descriptive messages
- [ ] Changes pushed to `feature/phase-3-gameplay-mechanics` branch
- [ ] Branch is up to date with main before merge

---

## Task 3.16: Implement State Recording for Enemies

### Objective
Record enemy states for time rewind system, enabling enemies to rewind along with the player.

### Documentation References
- [x] Section 7.1 "Handling Object Lifecycle: The 'Echo' System" in `comprehensive_documentation.md`
- [x] Section 7.1 "The TimeManager and Recording Logic" in `comprehensive_documentation.md`
- [x] Testing and Mocking section for TimeManager testing
- [x] Related to Task 3.3 (Player State Recording) and Task 3.15 (Enemy Respawn)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/systems/TimeManager.js` - Add enemy registration
  - `client/src/entities/Enemy.js` - Add state recording interface
  - `client/src/entities/enemies/LoopHound.js` - Implement state recording
  - `tests/unit/time-manager.test.js` - Add enemy recording tests
- **Integration Points:**
  - TimeManager recording system
  - Enemy state management
  - TemporalState object structure
- **Mocking/Test Setup:**
  - Mock TimeManager for recording tests
  - Mock enemy state objects
  - Fake timers for recording timing
- **Potential Risks/Complexity:**
  - Performance impact of recording multiple enemies
  - State synchronization during rewind
  - Memory usage with enemy state buffers

### TDD Test Plan
- **Test Files to Create/Update:**
  - `tests/unit/time-manager.test.js` - Add enemy recording tests
  - `tests/unit/enemy-base-class.test.js` - Add state recording tests
- **Test Cases:**
  - Enemy states are recorded in TimeManager buffer
  - Enemy states include position, velocity, and animation
  - Enemies rewind correctly with player
  - Multiple enemies can be recorded simultaneously
  - Enemy state recording doesn't impact performance
  - Rewound enemies maintain proper AI state
- **Test Data/Mocks Needed:**
  - Mock TimeManager with recording buffer
  - Mock enemy state objects
  - Fake timers for recording timing
  - Mock rewind system for testing

### Task Breakdown & Acceptance Criteria
- [ ] **3.16.1**: Add enemy registration to TimeManager
- [ ] **3.16.2**: Implement state recording interface in Enemy base class
- [ ] **3.16.3**: Add enemy state recording to TimeManager update loop
- [ ] **3.16.4**: Implement enemy state restoration during rewind
- [ ] **3.16.5**: Test enemy rewind in-game

### Expected Output
When the player rewinds time, any enemies on screen also rewind their position and state, moving backward along their patrol paths. The rewind is smooth and synchronized with the player's rewind.

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Enemy rewind works correctly in-game
- [ ] All project tests pass (locally and in CI)
- [ ] Enemy rewind is smooth and synchronized
- [ ] Performance impact is minimal
- [ ] Code follows established patterns and documentation
- [ ] Task marked as complete in tracking system

### Git Handling
- [ ] All changes committed with clear, descriptive messages
- [ ] Changes pushed to `feature/phase-3-gameplay-mechanics` branch
- [ ] Branch is up to date with main before merge

**Phase 3 Completion**: Merge `feature/phase-3-gameplay-mechanics` into `main`
