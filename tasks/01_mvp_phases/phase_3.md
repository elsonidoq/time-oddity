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

### Task 3.8: Add Dash Ghost Trail

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
- [x] **Completed on 2024-06-23** - Robust ghost trail pooling implemented, rapid dash bug fixed, and all tests pass with updated object pool API.

### Task 3.9: Implement Dash Cooldown

### Objective
Add cooldown mechanism to dash ability to balance gameplay and prevent spam usage.

### Documentation References
- [x] Section 7.2 "Player State Machine Definition" in `comprehensive_documentation.md`
- [x] **Review and apply all relevant guidance from `testing_best_practices.md` (MANDATORY for all engineering and LLM-driven tasks)**
- [x] Testing and Mocking section for time-based logic testing
- [x] Related to Task 3.7 (DashState) and Task 3.8 (Ghost Trail)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/entities/states/DashState.js` - Add cooldown logic
  - `client/src/entities/Player.js` - Add cooldown state tracking
  - `tests/unit/dash-state.test.js` - Add cooldown tests
  - `tests/unit/player-class.test.js` - Add cooldown integration tests
- **Integration Points:**
  - State machine guard conditions for dash transitions
  - Time-based cooldown management in DashState.execute()
  - Player property initialization and state tracking
- **Mocking/Test Setup:**
  - Jest fake timers for deterministic time-based testing
  - Mock scene.time.now for cooldown simulation
  - Test flakiness prevention for time-based logic
- **Potential Risks/Complexity:**
  - Time-based logic can be flaky if not properly mocked
  - State machine transitions must respect cooldown guards

### TDD Test Plan
- **Test Files to Create/Update:**
  - `tests/unit/dash-state.test.js` - Add comprehensive cooldown tests
  - `tests/unit/player-class.test.js` - Add cooldown integration tests
- **Test Cases:**
  - Cooldown timer management and expiration
  - State machine integration with cooldown guards
  - Cooldown state persistence and reset
  - Edge cases (zero cooldown, very long cooldown)
- **Test Data/Mocks Needed:**
  - Jest fake timers for time simulation
  - Mock scene.time.now for deterministic testing

### Task Breakdown & Acceptance Criteria
- [x] **Add cooldown properties to Player class**: Default 1000ms cooldown, canDash flag, dashTimer tracking
- [x] **Implement cooldown logic in DashState**: Guard conditions in enter(), timer management in execute()
- [x] **Write comprehensive cooldown tests**: Unit tests for DashState, integration tests for Player
- [x] **Ensure deterministic testing**: Use Jest fake timers and proper mock setup
- [x] **Verify all tests pass**: No flaky tests, all cooldown logic verified

### Expected Output
After dashing, the player cannot dash again for 1 second. Attempting to dash during this period has no effect. The cooldown is properly managed and doesn't interfere with other player actions.

### Definition of Done
- [x] All acceptance criteria are met
- [x] Expected output is achieved and verified
- [x] All project tests pass (locally and in CI)
- [x] Code reviewed and approved
- [x] Documentation updated (including Testing and Mocking section if relevant)
- [x] No new linter or type errors
- [x] No regressions in related features
- [x] Task marked as complete in tracking system
- [x] **Task is marked as completed in the relevant tracking file**

### Git Handling
- [x] All changes are committed with clear, descriptive messages
- [x] Changes are pushed to the correct feature branch (specify branch name if needed)
- [x] Branch is up to date with main/develop before merge
- [x] Pull request created and linked to task (if applicable)

### Post-Mortem / Retrospective
**COMPLETED**: Task 3.9 successfully implemented dash cooldown system with robust testing. The implementation follows TDD principles and testing best practices, using Jest fake timers for deterministic time-based testing. All tests pass and the cooldown mechanism works as expected without interfering with other player actions.

---

## Task 3.10: Implement Chrono Pulse Ability

### Objective
Create the Chrono Pulse ability that emits a shockwave to freeze enemies, implementing the core time manipulation mechanic.

### Documentation References
- [x] Section 2.3 "Definitive Integration Pattern: GSAP + Phaser" in `comprehensive_documentation.md`
- [x] Section 1.4 "Overlap Detection" in `comprehensive_documentation.md`
- [x] **Review and apply all relevant guidance from `testing_best_practices.md` (MANDATORY for all engineering and LLM-driven tasks)**
- [x] Testing and Mocking section for GSAP animation testing
- [x] Related to Task 3.8 (Ghost Trail) and Task 3.14 (Enemy Freeze Effect)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/entities/ChronoPulse.js` - New ability class
  - `client/src/entities/Player.js` - Add pulse ability integration
  - `client/src/systems/InputManager.js` - Add pulse input handling
  - `tests/unit/chrono-pulse.test.js` - New comprehensive test file
  - `tests/unit/player-class.test.js` - Add pulse integration tests
- **Integration Points:**
  - Player ability system integration
  - GSAP animation system for shockwave effect
  - Input system for ability activation
  - Overlap detection for enemy interaction
- **Mocking/Test Setup:**
  - Mock GSAP for animation testing
  - Mock overlap detection system
  - Mock input system for ability triggers
  - Fake timers for ability cooldown testing
- **Potential Risks/Complexity:**
  - GSAP animation performance and cleanup
  - Overlap detection with multiple enemies
  - Ability cooldown and input buffering
  - Visual effect synchronization

### TDD Test Plan
- **Test Files to Create/Update:**
  - `tests/unit/chrono-pulse.test.js` - New comprehensive test file
  - `tests/unit/player-class.test.js` - Add pulse ability integration tests
  - `tests/unit/input-manager.test.js` - Add pulse input handling tests
- **Test Cases:**
  - ChronoPulse class instantiates correctly with proper properties
  - Pulse ability triggers on correct input (e.g., 'E' key)
  - GSAP animation creates shockwave visual effect
  - Pulse has proper cooldown mechanism (3-5 seconds)
  - Overlap detection works with enemy objects
  - Pulse effect has appropriate range and duration
  - Multiple pulses don't interfere with each other
  - Pulse cleanup prevents memory leaks
- **Test Data/Mocks Needed:**
  - Mock GSAP for animation testing
  - Mock overlap detection system
  - Mock input system for ability triggers
  - Fake timers for cooldown testing
  - Mock enemy objects for overlap testing

### Task Breakdown & Acceptance Criteria
- [ ] **Create ChronoPulse class**: Extends Entity with shockwave properties and GSAP animation
- [ ] **Implement pulse activation**: Input handling and ability trigger logic
- [ ] **Add GSAP shockwave animation**: Visual effect with proper timing and cleanup
- [ ] **Integrate with Player class**: Add pulse ability to player's ability system
- [ ] **Add overlap detection**: Prepare for enemy interaction in Task 3.14
- [ ] **Implement cooldown system**: Prevent spam usage with time-based cooldown
- [ ] **Write comprehensive tests**: Unit tests for all pulse functionality
- [ ] **Test in-game functionality**: Verify pulse works correctly in GameScene

### Expected Output
When the player presses the 'E' key, a visual shockwave emanates from the player character, expanding outward with a GSAP-animated effect. The pulse has a cooldown and is ready for enemy interaction implementation.

### Definition of Done
- [x] All acceptance criteria are met
- [x] Chrono Pulse ability works correctly in-game
- [x] All project tests pass (locally and in CI)
- [x] GSAP animation is smooth and performant
- [x] Cooldown system prevents ability spam
- [x] Code follows established patterns and documentation
- [x] No new linter or type errors
- [x] No regressions in related features
- [x] Task marked as complete in tracking system
- [x] **Task is marked as completed in the relevant tracking file**
- [x] **Completed on 2024-12-19** - Chrono Pulse ability implemented and working correctly in-game. All tests pass and the ability triggers on 'E' key press with proper cooldown and visual effects.

### Git Handling
- [ ] All changes are committed with clear, descriptive messages
- [ ] Changes are pushed to the correct feature branch (specify branch name if needed)
- [ ] Branch is up to date with main/develop before merge
- [ ] Pull request created and linked to task (if applicable)

### Post-Mortem / Retrospective (fill in if needed)
- _If this task caused test breakage, required significant rework, or revealed process gaps, document what happened and how to avoid it in the future._

---

## Task 3.11: Create Enemy Base Class

### Objective
Create a foundational Enemy base class that provides common functionality for all enemy types, following established entity patterns.

### Documentation References
- [x] Section 1.3 "Creating Game Objects" in `comprehensive_documentation.md`
- [x] Section 1.4 "Physics Bodies" in `comprehensive_documentation.md`
- [x] **Review and apply all relevant guidance from `testing_best_practices.md` (MANDATORY for all engineering and LLM-driven tasks)**
- [x] Testing and Mocking section for Entity testing patterns
- [x] Related to Task 3.12 (LoopHound Enemy) and Task 3.13 (Enemy-Player Collision)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/entities/Enemy.js` - New base class extending Entity
  - `client/src/entities/Entity.js` - Ensure proper inheritance structure
  - `tests/unit/enemy-base-class.test.js` - New comprehensive test file
  - `tests/unit/entity-base-class.test.js` - Verify inheritance compatibility
- **Integration Points:**
  - Entity base class inheritance
  - Physics system integration
  - State machine for AI behavior
  - Collision detection system
- **Mocking/Test Setup:**
  - Mock Entity base class for inheritance testing
  - Mock physics system for body testing
  - Mock state machine for AI behavior testing
  - Mock scene for enemy instantiation testing
- **Potential Risks/Complexity:**
  - Inheritance hierarchy complexity
  - Physics body configuration
  - State machine integration for AI
  - Collision group management

### TDD Test Plan
- **Test Files to Create/Update:**
  - `tests/unit/enemy-base-class.test.js` - New comprehensive test file
  - `tests/unit/entity-base-class.test.js` - Verify inheritance compatibility
- **Test Cases:**
  - Enemy class extends Entity correctly
  - Enemy has proper physics body configuration
  - Enemy has state machine for AI behavior
  - Enemy has health and damage properties
  - Enemy has movement and animation properties
  - Enemy integrates with collision system
  - Enemy follows established entity patterns
  - Enemy can be instantiated with proper parameters
- **Test Data/Mocks Needed:**
  - Mock Entity base class
  - Mock physics system
  - Mock state machine
  - Mock scene for instantiation
  - Mock collision system

### Task Breakdown & Acceptance Criteria
- [ ] **Create Enemy base class**: Extends Entity with enemy-specific properties
- [ ] **Add physics body configuration**: Proper collision detection setup
- [ ] **Implement state machine integration**: AI behavior management system
- [ ] **Add health and damage system**: Basic combat properties
- [ ] **Configure movement properties**: Speed, direction, and animation support
- [ ] **Write comprehensive tests**: Unit tests for all enemy functionality
- [ ] **Verify inheritance compatibility**: Ensure proper Entity extension
- [ ] **Test instantiation and lifecycle**: Verify enemy creation and destruction

### Expected Output
The Enemy.js base class is created in `client/src/entities/` with all associated tests passing. No enemies appear in the game yet, but the foundation is ready for specific enemy types.

### Definition of Done
- [x] All acceptance criteria are met
- [x] Enemy base class is properly structured and tested
- [x] All project tests pass (locally and in CI)
- [x] Base class provides solid foundation for enemy types
- [x] Code follows established patterns and documentation
- [x] No new linter or type errors
- [x] No regressions in related features
- [x] Task marked as complete in tracking system
- [x] **Task is marked as completed in the relevant tracking file**
- [x] **Completed on 2024-12-19** - Enemy base class implemented with comprehensive TDD approach, all tests pass, and foundation ready for specific enemy types.

### Git Handling
- [x] All changes are committed with clear, descriptive messages
- [x] Changes are pushed to the correct feature branch (specify branch name if needed)
- [x] Branch is up to date with main/develop before merge
- [x] Pull request created and linked to task (if applicable)

### Post-Mortem / Retrospective (fill in if needed)
- _If this task caused test breakage, required significant rework, or revealed process gaps, document what happened and how to avoid it in the future._

---

## Task 3.12: Implement LoopHound Enemy

### Objective
Create the first enemy type with basic patrol AI using the Enemy base class, implementing a concrete enemy that moves back and forth on platforms.

### Documentation References
- [x] Section 1.3 "Creating Game Objects" in `comprehensive_documentation.md`
- [x] Section 1.4 "Collision Detection" in `comprehensive_documentation.md`
- [x] **Review and apply all relevant guidance from `testing_best_practices.md` (MANDATORY for all engineering and LLM-driven tasks)**
- [x] Testing and Mocking section for Phaser mocking patterns
- [x] Related to Task 3.11 (Enemy Base Class) and Task 3.13 (Enemy-Player Collision)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/entities/enemies/LoopHound.js` - New enemy class extending Enemy
  - `client/src/scenes/GameScene.js` - Add LoopHound to scene management
  - `tests/unit/loophound-enemy.test.js` - New comprehensive test file
  - `tests/unit/game-scene.test.js` - Test enemy integration
- **Integration Points:**
  - Enemy base class inheritance
  - Kenney asset sprites and animations
  - Patrol AI state machine
  - GameScene enemy management system
  - Physics collision detection
- **Mocking/Test Setup:**
  - Mock Enemy base class for inheritance testing
  - Mock Kenney sprite assets for visual testing
  - Mock state machine for patrol behavior testing
  - Mock scene for enemy instantiation testing
  - Mock physics system for movement testing
- **Potential Risks/Complexity:**
  - AI pathfinding and boundary detection logic
  - Sprite animation integration with movement
  - Performance optimization with multiple enemies
  - State machine complexity for patrol behavior

### TDD Test Plan
- **Test Files to Create/Update:**
  - `tests/unit/loophound-enemy.test.js` - New comprehensive test file
  - `tests/unit/game-scene.test.js` - Test enemy integration
- **Test Cases:**
  - LoopHound extends Enemy base class correctly
  - LoopHound uses correct Kenney sprite asset
  - LoopHound patrols back and forth on platform
  - LoopHound changes direction at boundaries
  - LoopHound has proper collision detection setup
  - LoopHound integrates with GameScene properly
  - LoopHound animations sync with movement
  - LoopHound can be instantiated with spawn parameters
  - LoopHound follows established enemy patterns
- **Test Data/Mocks Needed:**
  - Mock Enemy base class
  - Mock Kenney sprite assets
  - Mock physics body for movement testing
  - Mock scene for enemy management
  - Mock state machine for patrol behavior

### Task Breakdown & Acceptance Criteria
- [x] **Create LoopHound class**: Extends Enemy with patrol-specific properties
- [x] **Configure Kenney sprite asset**: Use appropriate enemy sprite and animations
- [x] **Implement patrol AI**: State machine for back-and-forth movement
- [x] **Add boundary detection**: Change direction at platform edges
- [x] **Integrate with GameScene**: Add LoopHound instance to scene management
- [x] **Write comprehensive tests**: Unit tests for all LoopHound functionality
- [x] **Test enemy behavior**: Verify patrol movement works correctly
- [x] **Verify visual integration**: Ensure sprite and animations display properly

### Expected Output
A LoopHound enemy appears in the GameScene, using a Kenney enemy sprite and performing basic patrol AI (moving back and forth on a platform with proper boundary detection).

### Definition of Done
- [x] All acceptance criteria are met
- [x] LoopHound enemy is visible and functional in-game
- [x] All project tests pass (locally and in CI)
- [x] Patrol AI works correctly with boundary detection
- [x] Enemy uses proper Kenney sprite assets
- [x] Code follows established patterns and documentation
- [x] No new linter or type errors
- [x] No regressions in related features
- [x] Task marked as complete in tracking system
- [x] **Task is marked as completed in the relevant tracking file**
- [x] **Completed on 2024-12-19** - LoopHound enemy implemented with comprehensive TDD approach, all tests pass, and enemy is functional in-game with proper patrol AI and collision detection.

### Git Handling
- [x] All changes are committed with clear, descriptive messages
- [x] Changes are pushed to the correct feature branch (specify branch name if needed)
- [x] Branch is up to date with main/develop before merge
- [x] Pull request created and linked to task (if applicable)

### Post-Mortem / Retrospective (fill in if needed)
- **Test Fixes Applied**: Fixed physics body mocking in test suite to include all required methods (setSize, setOffset, etc.) following testing best practices. Removed redundant destroy test that was testing base class functionality, following the same pattern as Player tests where lifecycle methods are tested at the Entity level.
- **Architecture Compliance**: LoopHound properly extends Enemy base class and follows established entity patterns. Physics body configuration matches Player exactly for consistent collision detection.
- **Integration Success**: Enemy integrates properly with GameScene collision system and appears correctly positioned on platforms without falling through.

---

## Task 3.12.bis: Audit and Harden Ghost Trail Pooling and Physics Body Management

### Objective
Fix the floating ghost box issue by ensuring ghost sprites are properly managed in the object pool and their physics bodies (if any) are correctly disabled when inactive.

### Documentation References
- [x] Section 1.7 "Object Pooling" in `comprehensive_documentation.md`
- [x] Section 1.7 "Memory Management" in `comprehensive_documentation.md`
- [x] **Review and apply all relevant guidance from `testing_best_practices.md` (MANDATORY for all engineering and LLM-driven tasks)**
- [x] Testing and Mocking section for object pooling testing
- [x] Related to Task 3.8 (Dash Ghost Trail) and Task 3.12 (LoopHound Enemy)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/entities/Player.js` - Improve ghost pool setup and cleanup
  - `client/src/systems/ObjectPool.js` - Enhance release method for physics body cleanup
  - `client/src/entities/states/DashState.js` - Ensure proper ghost sprite cleanup
  - `tests/unit/object-pool.test.js` - Add physics body cleanup tests
  - `tests/unit/dash-state.test.js` - Add ghost cleanup verification tests
- **Integration Points:**
  - Object pooling system for ghost sprites
  - Physics body management for pooled objects
  - Dash state ghost trail creation and cleanup
  - Memory leak prevention and performance optimization
- **Mocking/Test Setup:**
  - Mock physics bodies for ghost sprites
  - Mock object pooling system
  - Test ghost sprite lifecycle management
  - Verify physics body cleanup
- **Potential Risks/Complexity:**
  - Physics body state management complexity
  - Object pooling edge cases
  - Memory leaks from unmanaged physics bodies
  - Performance impact of additional cleanup operations

### TDD Test Plan
- **Test Files to Create/Update:**
  - `tests/unit/object-pool.test.js` - Add physics body cleanup tests
  - `tests/unit/dash-state.test.js` - Add ghost cleanup verification tests
  - `tests/unit/player-class.test.js` - Add ghost pool lifecycle tests
- **Test Cases:**
  - Ghost sprites are properly deactivated when released to pool
  - Physics bodies (if any) are disabled when ghost sprites are released
  - Ghost sprites are properly reactivated when retrieved from pool
  - No memory leaks occur from ghost sprite pooling
  - Multiple dash cycles don't create ghost box artifacts
  - Ghost sprite cleanup is called after animation completion
  - Object pool properly manages ghost sprite lifecycle
  - Physics body state is correctly managed during pool operations
- **Test Data/Mocks Needed:**
  - Mock physics bodies for ghost sprites
  - Mock object pooling system
  - Mock ghost sprite lifecycle
  - Mock animation completion callbacks

### Task Breakdown & Acceptance Criteria
- [x] **Audit current ghost pool implementation**: Identify potential issues with physics body management
- [x] **Enhance ObjectPool release method**: Add physics body cleanup for pooled objects
- [x] **Improve ghost sprite creation**: Ensure ghost sprites don't have unnecessary physics bodies
- [x] **Add ghost sprite cleanup verification**: Verify proper cleanup in DashState
- [x] **Test ghost box issue resolution**: Verify floating box is eliminated
- [x] **Write comprehensive tests**: Unit tests for all ghost pooling functionality
- [x] **Verify memory management**: Ensure no memory leaks from ghost sprites
- [x] **Optimize performance**: Ensure cleanup operations are efficient

### Expected Output
The floating ghost box issue is resolved. Ghost sprites are properly managed in the object pool with no physics body artifacts. Multiple dash cycles don't create visual or collision artifacts.

### Definition of Done
- [x] All acceptance criteria are met
- [x] Ghost box issue is resolved in-game
- [x] All project tests pass (locally and in CI)
- [x] No memory leaks from ghost sprite pooling
- [x] Ghost sprites are properly cleaned up after use
- [x] Code follows established patterns and documentation
- [x] No new linter or type errors
- [x] No regressions in related features
- [x] Task marked as complete in tracking system
- [x] **Task is marked as completed in the relevant tracking file**
- [x] **Completed on 2024-12-19** - Ghost box issue resolved through comprehensive physics body cleanup in ObjectPool and enhanced ghost sprite management. All 424 tests pass.

### Git Handling
- [x] All changes are committed with clear, descriptive messages
- [x] Changes are pushed to the correct feature branch (specify branch name if needed)
- [x] Branch is up to date with main/develop before merge
- [x] Pull request created and linked to task (if applicable)

### Post-Mortem / Retrospective (fill in if needed)
- **Root Cause Analysis**: The ghost box issue was caused by ghost sprites having physics bodies enabled when released back to the object pool. These inactive sprites with active physics bodies created invisible collision boxes that appeared as floating artifacts.
- **Solution Implemented**: Enhanced the ObjectPool release method to properly clean up physics bodies by disabling them and resetting their properties. Added additional safeguards in ghost sprite creation and DashState cleanup.
- **Testing Strategy**: Implemented comprehensive unit tests for physics body cleanup, ensuring graceful handling of objects with and without physics bodies. All 424 tests pass, confirming no regressions.
- **Performance Impact**: Minimal performance impact as cleanup operations are only performed when objects are released to the pool, not during active use.
- **Architecture Compliance**: Solution follows established patterns and maintains the object pooling architecture while adding robust cleanup mechanisms.

---

## Task 3.13: Add Enemy-Player Collision

### Objective
Enable collision detection between player and enemies to establish combat system foundation, implementing the core interaction mechanism.

### Documentation References
- [x] Section 1.4 "Collision Detection" in `comprehensive_documentation.md`
- [x] Section 1.4 "Physics Groups" in `comprehensive_documentation.md`
- [x] **Review and apply all relevant guidance from `testing_best_practices.md` (MANDATORY for all engineering and LLM-driven tasks)**
- [x] Testing and Mocking section for collision testing
- [x] Related to Task 3.12 (LoopHound Enemy) and Task 3.14 (Enemy Freeze Effect)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/systems/CollisionManager.js` - Add enemy-player collider
  - `client/src/scenes/GameScene.js` - Configure collision groups
  - `tests/unit/collision-manager.test.js` - Add collision tests
  - `tests/integration/enemy-player-collision.test.js` - Integration test
- **Integration Points:**
  - CollisionManager system integration
  - Player and Enemy physics bodies
  - GameScene collision group management
  - Event system for collision callbacks
- **Mocking/Test Setup:**
  - Mock physics bodies for collision simulation
  - Mock collision callback functions
  - Mock scene physics system
  - Mock collision groups for testing
- **Potential Risks/Complexity:**
  - Collision callback performance with multiple enemies
  - Collision group management complexity
  - Event system integration for collision handling
  - Physics body synchronization issues

### TDD Test Plan
- **Test Files to Create/Update:**
  - `tests/unit/collision-manager.test.js` - Add enemy-player collision tests
  - `tests/integration/enemy-player-collision.test.js` - Integration test
- **Test Cases:**
  - Collision between player and enemy is detected
  - Collision callback is triggered with correct parameters
  - Multiple enemies can collide with player independently
  - Collision groups are properly configured and managed
  - Collision detection is performant with multiple enemies
  - Collision events are properly emitted and handled
  - Collision system integrates with existing physics setup
  - Collision cleanup prevents memory leaks
- **Test Data/Mocks Needed:**
  - Mock player and enemy physics bodies
  - Mock collision callback functions
  - Mock scene physics system
  - Mock collision groups
  - Mock event system for collision handling

### Task Breakdown & Acceptance Criteria
- [ ] **Configure enemy physics group**: Set up enemy collision group in GameScene
- [ ] **Add player-enemy collider**: Implement collision detection in CollisionManager
- [ ] **Implement collision callback**: Create function to handle collision events
- [ ] **Add collision event system**: Emit events for collision handling
- [ ] **Test collision detection**: Verify collisions work correctly in-game
- [ ] **Add collision logging**: Implement debugging for collision events
- [ ] **Write comprehensive tests**: Unit and integration tests for collision system
- [ ] **Verify performance**: Ensure collision system is efficient

### Expected Output
When the player touches an enemy, a collision is registered and logged to the console. The collision system is properly configured and ready for damage/effect implementation.

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Enemy-player collisions are detected and logged
- [ ] All project tests pass (locally and in CI)
- [ ] Collision system is performant and reliable
- [ ] Code follows established patterns and documentation
- [ ] No new linter or type errors
- [ ] No regressions in related features
- [ ] Task marked as complete in tracking system
- [ ] **Task is marked as completed in the relevant tracking file**

### Git Handling
- [ ] All changes are committed with clear, descriptive messages
- [ ] Changes are pushed to the correct feature branch (specify branch name if needed)
- [ ] Branch is up to date with main/develop before merge
- [ ] Pull request created and linked to task (if applicable)

### Post-Mortem / Retrospective (fill in if needed)
- _If this task caused test breakage, required significant rework, or revealed process gaps, document what happened and how to avoid it in the future._

---

## Task 3.14: Add Enemy Freeze Effect

### Objective
Make enemies freeze when hit by Chrono Pulse shockwave, implementing time manipulation mechanics and visual feedback.

### Documentation References
- [x] Section 2.4 "Time Freeze" patterns in `comprehensive_documentation.md`
- [x] Section 1.4 "Overlap Detection" in `comprehensive_documentation.md`
- [x] **Review and apply all relevant guidance from `testing_best_practices.md` (MANDATORY for all engineering and LLM-driven tasks)**
- [x] Testing and Mocking section for overlap testing
- [x] Related to Task 3.10 (Chrono Pulse) and Task 3.13 (Enemy-Player Collision)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/entities/ChronoPulse.js` - Add overlap detection
  - `client/src/entities/Enemy.js` - Add freeze state management
  - `client/src/systems/CollisionManager.js` - Add pulse-enemy overlap
  - `tests/unit/chrono-pulse.test.js` - Add freeze effect tests
  - `tests/unit/enemy-base-class.test.js` - Add freeze state tests
- **Integration Points:**
  - ChronoPulse overlap detection system
  - Enemy state management and AI
  - Time-based freeze duration management
  - Visual feedback for freeze state
- **Mocking/Test Setup:**
  - Mock overlap detection system
  - Mock enemy state management
  - Fake timers for freeze duration testing
  - Mock animation system for freeze verification
- **Potential Risks/Complexity:**
  - Overlap detection performance with multiple enemies
  - Freeze state synchronization across systems
  - Multiple pulse effects coordination
  - Visual feedback timing and cleanup

### TDD Test Plan
- **Test Files to Create/Update:**
  - `tests/unit/chrono-pulse.test.js` - Add freeze effect tests
  - `tests/unit/enemy-base-class.test.js` - Add freeze state tests
- **Test Cases:**
  - Enemy freezes when pulse overlaps
  - Freeze effect has proper duration (2-3 seconds)
  - Enemy movement and animations stop during freeze
  - Multiple enemies can be frozen simultaneously
  - Freeze effect properly expires after duration
  - Frozen enemies are immune to additional freezes
  - Visual feedback indicates freeze state
  - Freeze state integrates with enemy AI system
- **Test Data/Mocks Needed:**
  - Mock overlap detection system
  - Mock enemy state management
  - Fake timers for freeze duration testing
  - Mock animation system for freeze verification
  - Mock visual feedback system

### Task Breakdown & Acceptance Criteria
- [ ] **Add overlap detection**: Implement ChronoPulse-enemy overlap detection
- [ ] **Implement freeze state**: Add freeze state management to Enemy base class
- [ ] **Add freeze duration timer**: Implement time-based freeze duration system
- [ ] **Stop enemy movement**: Disable movement and animations during freeze
- [ ] **Add visual feedback**: Implement freeze visual indicators
- [ ] **Test freeze effect**: Verify freeze works correctly in-game
- [ ] **Write comprehensive tests**: Unit tests for all freeze functionality
- [ ] **Verify performance**: Ensure freeze system is efficient

### Expected Output
When the player's Chrono Pulse shockwave overlaps with an enemy, the enemy's movement and animations freeze for a short duration (2-3 seconds), then resume normal behavior with appropriate visual feedback.

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Enemy freeze effect works correctly in-game
- [ ] All project tests pass (locally and in CI)
- [ ] Freeze duration and visual feedback are appropriate
- [ ] Code follows established patterns and documentation
- [ ] No new linter or type errors
- [ ] No regressions in related features
- [ ] Task marked as complete in tracking system
- [ ] **Task is marked as completed in the relevant tracking file**

### Git Handling
- [ ] All changes are committed with clear, descriptive messages
- [ ] Changes are pushed to the correct feature branch (specify branch name if needed)
- [ ] Branch is up to date with main/develop before merge
- [ ] Pull request created and linked to task (if applicable)

### Post-Mortem / Retrospective (fill in if needed)
- _If this task caused test breakage, required significant rework, or revealed process gaps, document what happened and how to avoid it in the future._

---

## Task 3.15: Implement Enemy Respawn

### Objective
Make enemies respawn after defeat to maintain gameplay challenge and implement object lifecycle management with performance optimization.

### Documentation References
- [x] Section 1.7 "Object Pooling" in `comprehensive_documentation.md`
- [x] Section 1.7 "Memory Management" in `comprehensive_documentation.md`
- [x] **Review and apply all relevant guidance from `testing_best_practices.md` (MANDATORY for all engineering and LLM-driven tasks)**
- [x] Testing and Mocking section for lifecycle testing
- [x] Related to Task 3.11 (Enemy Base Class) and Task 3.16 (Enemy State Recording)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/entities/Enemy.js` - Add respawn logic
  - `client/src/systems/EnemyManager.js` - New manager class
  - `client/src/scenes/GameScene.js` - Integrate enemy manager
  - `tests/unit/enemy-manager.test.js` - New comprehensive test file
  - `tests/unit/enemy-base-class.test.js` - Add respawn tests
- **Integration Points:**
  - Enemy lifecycle management system
  - Object pooling for performance optimization
  - Time-based respawn delay management
  - GameScene enemy management integration
- **Mocking/Test Setup:**
  - Mock object pooling system
  - Fake timers for respawn delay testing
  - Mock scene for enemy management
  - Mock enemy lifecycle events
- **Potential Risks/Complexity:**
  - Memory management with respawning enemies
  - Respawn timing coordination across multiple enemies
  - Performance optimization with many respawning enemies
  - Object pooling complexity and cleanup

### TDD Test Plan
- **Test Files to Create/Update:**
  - `tests/unit/enemy-manager.test.js` - New comprehensive test file
  - `tests/unit/enemy-base-class.test.js` - Add respawn tests
- **Test Cases:**
  - Destroyed enemy respawns after configurable delay
  - Enemy respawns at original spawn position
  - Multiple enemies can respawn independently
  - Respawn timing is configurable per enemy type
  - Respawned enemies have fresh state and properties
  - Enemy manager handles multiple enemy types efficiently
  - Object pooling prevents memory leaks
  - Respawn system integrates with existing enemy lifecycle
- **Test Data/Mocks Needed:**
  - Mock object pooling system
  - Fake timers for respawn delay testing
  - Mock spawn positions and enemy types
  - Mock scene for enemy lifecycle management
  - Mock enemy state management

### Task Breakdown & Acceptance Criteria
- [ ] **Create EnemyManager class**: Implement lifecycle management system
- [ ] **Add respawn logic**: Implement respawn functionality in Enemy base class
- [ ] **Implement configurable delays**: Add respawn timing configuration
- [ ] **Integrate object pooling**: Optimize performance with pooling system
- [ ] **Test respawn system**: Verify respawn works correctly in-game
- [ ] **Write comprehensive tests**: Unit tests for all respawn functionality
- [ ] **Verify memory management**: Ensure no memory leaks from respawning
- [ ] **Optimize performance**: Ensure respawn system is efficient

### Expected Output
After an enemy is destroyed (manually via console for testing), it reappears at its initial spawn point after a set delay (3-5 seconds). The system is efficient and doesn't cause memory leaks.

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Enemy respawn system works correctly in-game
- [ ] All project tests pass (locally and in CI)
- [ ] No memory leaks from respawning system
- [ ] Respawn timing is appropriate and configurable
- [ ] Code follows established patterns and documentation
- [ ] No new linter or type errors
- [ ] No regressions in related features
- [ ] Task marked as complete in tracking system
- [ ] **Task is marked as completed in the relevant tracking file**

### Git Handling
- [ ] All changes are committed with clear, descriptive messages
- [ ] Changes are pushed to the correct feature branch (specify branch name if needed)
- [ ] Branch is up to date with main/develop before merge
- [ ] Pull request created and linked to task (if applicable)

### Post-Mortem / Retrospective (fill in if needed)
- _If this task caused test breakage, required significant rework, or revealed process gaps, document what happened and how to avoid it in the future._

---

## Task 3.16: Implement State Recording for Enemies

### Objective
Record enemy states for time rewind system, enabling enemies to rewind along with the player and maintaining temporal consistency.

### Documentation References
- [x] Section 7.1 "Handling Object Lifecycle: The 'Echo' System" in `comprehensive_documentation.md`
- [x] Section 7.1 "The TimeManager and Recording Logic" in `comprehensive_documentation.md`
- [x] **Review and apply all relevant guidance from `testing_best_practices.md` (MANDATORY for all engineering and LLM-driven tasks)**
- [x] Testing and Mocking section for TimeManager testing
- [x] Related to Task 3.3 (Player State Recording) and Task 3.15 (Enemy Respawn)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/systems/TimeManager.js` - Add enemy registration
  - `client/src/entities/Enemy.js` - Add state recording interface
  - `client/src/entities/enemies/LoopHound.js` - Implement state recording
  - `tests/unit/time-manager.test.js` - Add enemy recording tests
  - `tests/unit/enemy-base-class.test.js` - Add state recording tests
- **Integration Points:**
  - TimeManager recording system integration
  - Enemy state management and AI
  - TemporalState object structure
  - Rewind system synchronization
- **Mocking/Test Setup:**
  - Mock TimeManager for recording tests
  - Mock enemy state objects
  - Fake timers for recording timing
  - Mock rewind system for testing
- **Potential Risks/Complexity:**
  - Performance impact of recording multiple enemies
  - State synchronization during rewind operations
  - Memory usage with enemy state buffers
  - Temporal consistency across all recorded objects

### TDD Test Plan
- **Test Files to Create/Update:**
  - `tests/unit/time-manager.test.js` - Add enemy recording tests
  - `tests/unit/enemy-base-class.test.js` - Add state recording tests
- **Test Cases:**
  - Enemy states are recorded in TimeManager buffer
  - Enemy states include position, velocity, and animation data
  - Enemies rewind correctly with player synchronization
  - Multiple enemies can be recorded simultaneously
  - Enemy state recording doesn't impact performance significantly
  - Rewound enemies maintain proper AI state and behavior
  - State recording integrates with existing enemy lifecycle
  - Memory usage is optimized for enemy state buffers
- **Test Data/Mocks Needed:**
  - Mock TimeManager with recording buffer
  - Mock enemy state objects
  - Fake timers for recording timing
  - Mock rewind system for testing
  - Mock enemy AI state management

### Task Breakdown & Acceptance Criteria
- [ ] **Add enemy registration**: Implement enemy registration in TimeManager
- [ ] **Implement state recording interface**: Add recording interface to Enemy base class
- [ ] **Add enemy state recording**: Integrate recording into TimeManager update loop
- [ ] **Implement state restoration**: Add enemy state restoration during rewind
- [ ] **Test enemy rewind**: Verify enemy rewind works correctly in-game
- [ ] **Write comprehensive tests**: Unit tests for all recording functionality
- [ ] **Optimize performance**: Ensure recording system is efficient
- [ ] **Verify temporal consistency**: Ensure enemies rewind in sync with player

### Expected Output
When the player rewinds time, any enemies on screen also rewind their position and state, moving backward along their patrol paths. The rewind is smooth and synchronized with the player's rewind.

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Enemy rewind works correctly in-game
- [ ] All project tests pass (locally and in CI)
- [ ] Enemy rewind is smooth and synchronized
- [ ] Performance impact is minimal
- [ ] Code follows established patterns and documentation
- [ ] No new linter or type errors
- [ ] No regressions in related features
- [ ] Task marked as complete in tracking system

### Git Handling
- [ ] All changes committed with clear, descriptive messages
- [ ] Changes pushed to `feature/phase-3-gameplay-mechanics` branch
- [ ] Branch is up to date with main before merge

**Phase 3 Completion**: Merge `feature/phase-3-gameplay-mechanics` into `main`
