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

## Phase 1: Foundation & Core Setup

**Branch**: `feature/phase-1-foundation`

### Task 1.1: Initialize Node.js Project
**Objective**: Set up the basic Node.js project structure
- Create `package.json` with basic project metadata
- Initialize git repository
- Create `.gitignore` file for Node.js projects
- Create basic project directory structure (client/, server/, shared/)
- **Test**: Run `npm install` and verify no errors
- [x] Task 1.1: Initialize Node.js Project - Completed on 2024-07-29

### Task 1.2: Set Up Vite Build Pipeline
**Objective**: Configure Vite for development and building
- Install Vite as dev dependency
- Create `vite.config.js` with basic configuration
- Add build scripts to package.json
- Create `public/index.html` with game container div
- **Test**: Run `npm run dev` and see Vite server start successfully
- [x] Task 1.2: Set Up Vite Build Pipeline - Completed on 2024-07-29

### Task 1.3: Install and Configure Phaser 3.90.0
**Objective**: Set up Phaser as the game engine
- Install Phaser 3.90.0 as dependency
- Create `client/src/main.js` as entry point
- Configure basic Phaser game config object
- Disable Phaser's audio system (`audio: { noAudio: true }`)
- **Test**: Game canvas appears in browser without errors
- [x] Task 1.3: Install and Configure Phaser 3.90.0 - Completed on 2024-07-29

### Task 1.4: Install GSAP for Animations
**Objective**: Set up GSAP for advanced animations
- Install GSAP as dependency
- Create `client/src/systems/AnimationManager.js`
- Set up basic GSAP configuration
- **Test**: GSAP can be imported and used
- [x] Task 1.4: Install GSAP for Animations - Completed on 2024-07-29

### Task 1.5: Create BaseScene Abstract Class
**Objective**: Establish the foundation for all game scenes
- Create `client/src/scenes/BaseScene.js`
- Extend `Phaser.Scene`
- Add common scene lifecycle methods (init, preload, create, update)
- Add common utility methods for scene management
- **Test**: BaseScene can be imported and extended without errors
- [x] Task 1.5: Create BaseScene Abstract Class - Completed on 2024-07-29

### Task 1.6: Implement BootScene
**Objective**: Create the initial loading scene
- Create `client/src/scenes/BootScene.js` extending BaseScene
- Add loading bar display
- Add basic asset preloading (placeholder for now)
- Add scene transition to MenuScene
- **Test**: BootScene loads and transitions to MenuScene
- [x] Task 1.6: Implement BootScene - Completed on 2024-07-29

### Task 1.7: Implement MenuScene
**Objective**: Create the main menu interface
- Create `client/src/scenes/MenuScene.js` extending BaseScene
- Add title text "Time Oddity"
- Add "Start Game" button
- Add button click handler to transition to GameScene
- **Test**: Menu displays and clicking "Start Game" transitions to GameScene
- [x] Task 1.7: Implement MenuScene - Completed on 2024-07-29

### Task 1.8: Implement Basic GameScene
**Objective**: Create the main gameplay scene structure
- Create `client/src/scenes/GameScene.js` extending BaseScene
- Add basic scene setup with placeholder content
- Add "Back to Menu" button for testing
- **Test**: GameScene loads and "Back to Menu" button works
- [x] Task 1.8: Implement Basic GameScene - Completed on 2024-07-29

### Task 1.9: Set Up Scene Management
**Objective**: Configure scene transitions and management
- Update main.js to register all scenes
- Set BootScene as the starting scene
- Configure scene transitions with fade effects
- **Test**: All scene transitions work smoothly
- [x] Task 1.9: Set Up Scene Management - Completed on 2024-07-29

### Task 1.10: Load Kenney Character Spritesheet
**Objective**: Integrate the main character assets
- Copy Kenney character spritesheet to `client/src/assets/sprites/`
- Load spritesheet in BootScene preload method
- Create basic character animations (idle, walk, jump, fall)
- **Test**: Character spritesheet loads without errors
- [x] Task 1.10: Load Kenney Character Spritesheet - Completed on 2024-07-29

### Task 1.11: Load Kenney Tile Assets
**Objective**: Integrate tile assets for level building
- Copy Kenney tile spritesheets to `client/src/assets/sprites/`
- Load tile spritesheets in BootScene preload method
- Create basic tile animations if needed
- **Test**: Tile spritesheets load without errors
- [x] Task 1.11: Load Kenney Tile Assets - Completed on 2024-07-29

### Task 1.12: Load Kenney Enemy Assets
**Objective**: Integrate enemy assets
- Copy Kenney enemy spritesheets to `client/src/assets/sprites/`
- Load enemy spritesheets in BootScene preload method
- Create basic enemy animations
- **Test**: Enemy spritesheets load without errors
- [x] Task 1.12: Load Kenney Enemy Assets - Completed on 2024-07-29

### Task 1.13: Configure Arcade Physics
**Objective**: Set up the physics system
- Enable Arcade Physics in game config
- Set gravity to { y: 980 }
- Configure physics debug (disabled by default)
- **Test**: Physics system is active (can be verified in console)
- [x] Task 1.13: Configure Arcade Physics - Completed on 2024-07-29

### Task 1.14: Create Basic Platform Group
**Objective**: Set up collision detection foundation
- Create static physics group in GameScene
- Add a simple ground platform
- Configure collision bounds
- **Test**: Platform group is created and visible
- [x] Task 1.14: Create Basic Platform Group - Completed on 2024-07-29

### Task 1.15: Set Up World Boundaries
**Objective**: Prevent objects from leaving the game world
- Configure world bounds in GameScene
- Set up camera bounds
- **Test**: Objects cannot move outside the game area
- [x] Task 1.15: Set Up World Boundaries - Completed on 2024-07-29

### Task 1.16: Create Object Pool System
**Objective**: Set up performance optimization foundation
- Create `client/src/systems/ObjectPool.js`
- Add basic object pooling methods (get, release, reset)
- Add pool management for common objects
- **Test**: ObjectPool can create and recycle objects
- [x] Task 1.16: Create Object Pool System - Completed on 2024-07-29

**Phase 1 Completion**: Merge `feature/phase-1-foundation` into `main`

---

## Phase 2: Player Character & Basic Movement

**Branch**: `feature/phase-2-player-movement`

### Task 2.1: Create Entity Base Class
**Objective**: Establish base class for all game entities
- Create `client/src/entities/Entity.js`
- Extend Phaser.GameObjects.Sprite
- Add common entity properties (health, active state)
- Add common entity methods (takeDamage, destroy)
- **Test**: Entity class can be instantiated without errors
- [x] Task 2.1: Create Entity Base Class - Completed on 2024-07-29

### Task 2.2: Create Player Class
**Objective**: Create the main player character class
- Create `client/src/entities/Player.js` extending Entity
- Add player-specific properties (speed, jumpPower)
- Add basic constructor with sprite setup
- **Test**: Player instance can be created without errors
- [x] Task 2.2: Create Player Class - Completed on 2024-07-29

### Task 2.3: Add Player to GameScene
**Objective**: Integrate player into the game world
- Create player instance in GameScene create method
- Position player at starting location
- Add player to scene's display list
- **Test**: Player sprite appears in game world
- [x] Task 2.3: Add Player to GameScene - Completed on 2024-07-29

### Task 2.4: Enable Player Physics
**Objective**: Add physics body to player
- Enable physics body on player sprite
- Set collision bounds
- Configure physics properties (bounce, friction)
- **Test**: Player has physics body (can be verified in debug mode)
- [x] Task 2.4: Enable Player Physics - Completed on 2024-07-29

### Task 2.5: Create StateMachine Class
**Objective**: Implement state management system
- Create `client/src/systems/StateMachine.js`
- Add state management methods (changeState, getCurrentState)
- Add state transition validation
- **Test**: StateMachine can be instantiated and states can be changed
- [x] Task 2.5: Create StateMachine Class - Completed on 2024-07-29

### Task 2.6: Create IdleState Class
**Objective**: Implement player idle state
- Create `client/src/states/IdleState.js`
- Add enter, execute, and exit methods
- Set up idle animation
- Handle input detection for state transitions
- **Test**: Player enters idle state and plays idle animation
- [x] Task 2.6: Create IdleState Class - Completed on 2024-07-29

### Task 2.7: Create RunState Class
**Objective**: Implement player running state
- Create `client/src/states/RunState.js`
- Add enter, execute, and exit methods
- Set up run animation
- Handle horizontal movement
- **Test**: Player enters run state and moves horizontally
- [x] Task 2.7: Create RunState Class - Completed on 2024-07-29

### Task 2.8: Create JumpState Class
**Objective**: Implement player jumping state
- Create `client/src/states/JumpState.js`
- Add enter, execute, and exit methods
- Set up jump animation
- Apply upward velocity
- **Test**: Player enters jump state and moves upward
- [x] Task 2.8: Create JumpState Class - Completed on 2024-07-29

### Task 2.9: Create FallState Class
**Objective**: Implement player falling state
- Create `client/src/states/FallState.js`
- Add enter, execute, and exit methods
- Set up fall animation
- Handle gravity application
- **Test**: Player enters fall state and falls with gravity
- [x] Task 2.9: Create FallState Class - Completed on 2024-07-29

### Task 2.10: Connect StateMachine to Player
**Objective**: Integrate state machine with player
- Add StateMachine instance to Player class
- Initialize with IdleState
- Update player update method to call current state
- **Test**: Player starts in idle state and can transition between states
- [x] Task 2.10: Connect StateMachine to Player - Completed on 2024-07-29

### Task 2.11: Create InputManager Class
**Objective**: Centralize input handling
- Create `client/src/systems/InputManager.js`
- Add keyboard input detection
- Add input state tracking
- Add input validation methods
- **Test**: InputManager can detect key presses and releases
- [x] Task 2.11: Create InputManager Class - Completed on 2024-07-29

### Task 2.12: Add Keyboard Controls
**Objective**: Implement basic keyboard input
- Set up arrow key detection
- Set up WASD key detection
- Add input debouncing
- **Test**: Keyboard input is detected and tracked correctly
- [x] Task 2.12: Add Keyboard Controls - Completed on 2024-07-29

### Task 2.13: Connect Input to Player Movement
**Objective**: Link input to player actions
- Update Player class to use InputManager
- Handle left/right movement input
- Handle jump input
- **Test**: Player responds to keyboard input
- [x] Task 2.13: Connect Input to Player Movement - Completed on 2024-07-29

### Task 2.14: Implement Variable Jump Height
**Objective**: Add responsive jumping mechanics
- Track jump key hold duration
- Adjust jump velocity based on hold time
- Set maximum jump height
- **Test**: Jump height varies based on key hold duration
- [x] Task 2.14: Implement Variable Jump Height - Completed on 2024-07-29

### Task 2.15: Create CollisionManager Class
**Objective**: Centralize collision detection
- Create `client/src/systems/CollisionManager.js`
- Add collision group management
- Add collision callback system
- Add collision filtering
- **Test**: CollisionManager can be instantiated and manages collisions
- [x] Task 2.15: Create CollisionManager Class - Completed on 2024-07-29

### Task 2.16: Add Player-Platform Collision
**Objective**: Enable player to stand on platforms
- Set up collision between player and platform group using CollisionManager
- Handle collision callbacks
- Ensure player stops falling when landing
- **Test**: Player can land and stand on platforms
- [x] Task 2.16: Add Player-Platform Collision - Completed on 2024-07-29

### Task 2.17: Create Basic Test Level
**Objective**: Build a simple level for testing
- Create multiple platforms at different heights
- Add ground level
- Position platforms for basic platforming
- **Test**: Level is playable with basic movement
- [x] Task 2.17: Create Basic Test Level - Completed on 2024-07-29

### Task 2.18: Add Collectible Coins
**Objective**: Create basic collectibles for testing
- Create `client/src/entities/collectibles/Coin.js`
- Add coin sprites to level
- Set up coin-player collision
- Add coin collection feedback
- **Test**: Player can collect coins and see feedback
- [x] Task 2.18: Add Collectible Coins - Completed on 2024-07-29

**Phase 2 Completion**: Merge `feature/phase-2-player-movement` into `main`

---

## Phase 2.5: Unit Testing & Validation

**Branch**: `feature/phase-2-5-unit-testing`

**IMPORTANT**: All tests in this phase MUST pass before proceeding to the next task. If tests fail, you MUST fix all bugs and ensure tests pass before moving forward.

### Task 2.5.1: Set Up Testing Framework
**Objective**: Configure testing environment for the project
- Install Jest testing framework
- Configure Jest for Phaser.js testing
- Set up test directory structure
- Create test utilities and mocks
- **REQUIRED**: Run `npm test` and verify Jest can execute basic tests
- **CRITICAL**: If tests fail, fix all issues before proceeding
- [x] Task 2.5.1: Set Up Testing Framework - Completed on 2024-07-29 - Jest, jsdom, config, and test utilities/mocks created and verified

### Task 2.5.2: Test Entity Base Class
**Objective**: Validate Entity class functionality
- Create comprehensive unit tests for Entity class
- Test Entity instantiation with valid parameters
- Test Entity health management (takeDamage, heal)
- Test Entity lifecycle methods (destroy, activate, deactivate)
- Test Entity physics body setup
- **REQUIRED**: Run tests and verify all Entity tests pass
- **CRITICAL**: If any Entity tests fail, fix the Entity class until all tests pass
- [x] Task 2.5.2: Test Entity Base Class - Completed on 2024-07-29 - All comprehensive unit tests for Entity class passing

### Task 2.5.3: Test Player Class
**Objective**: Validate Player class functionality
- Create comprehensive unit tests for Player class
- Test Player instantiation and initialization
- Test Player physics properties (speed, jumpPower, gravity)
- Test Player state machine integration
- Test Player input manager integration
- **REQUIRED**: Run tests and verify all Player tests pass
- **CRITICAL**: If any Player tests fail, fix the Player class until all tests pass
- [x] Task 2.5.3: Test Player Class - Completed on 2024-07-29 - All comprehensive unit tests for Player class passing

### Task 2.5.4: Test StateMachine System
**Objective**: Validate state management functionality
- Create comprehensive unit tests for StateMachine
- Test StateMachine instantiation and state registration
- Test state transitions (valid and invalid)
- Test state lifecycle methods (enter, execute, exit)
- Test state data passing between transitions
- **REQUIRED**: Run tests and verify all StateMachine tests pass
- **CRITICAL**: If any StateMachine tests fail, fix the StateMachine until all tests pass
- [x] Task 2.5.4: Test StateMachine System - Completed on 2024-07-29 - All comprehensive unit tests for StateMachine system passing

### Task 2.5.5: Test InputManager System
**Objective**: Validate input handling functionality
- Create comprehensive unit tests for InputManager
- Test keyboard input detection (arrows, WASD, space)
- Test input state tracking (isDown, isUp, JustDown)
- Test input validation and edge cases
- Test input manager integration with player
- **REQUIRED**: Run tests and verify all InputManager tests pass
- **CRITICAL**: If any InputManager tests fail, fix the InputManager until all tests pass
- **After completion**: Mark task as completed only after all InputManager tests pass
- [x] Task 2.5.5: Test InputManager System - Completed on 2024-07-29 - All comprehensive unit tests for InputManager system passing

### Task 2.5.6: Test CollisionManager System
**Objective**: Validate collision detection functionality
- Create comprehensive unit tests for CollisionManager
- Test collider creation between objects
- Test overlap detection setup
- Test collision callback execution
- Test collision filtering and groups
- **REQUIRED**: Run tests and verify all CollisionManager tests pass
- **CRITICAL**: If any CollisionManager tests fail, fix the CollisionManager until all tests pass
- **After completion**: Mark task as completed only after all CollisionManager tests pass
- [x] Task 2.5.6: Test CollisionManager System - Completed on 2024-07-29 - All comprehensive unit tests for CollisionManager system passing

### Task 2.5.7: Test Scene Management
**Objective**: Validate scene system functionality
- Create comprehensive unit tests for scene system
- Test BaseScene lifecycle methods
- Test scene transitions (BootScene → MenuScene → GameScene)
- Test scene cleanup and memory management
- Test scene-specific functionality
- **REQUIRED**: Run tests and verify all scene tests pass
- **CRITICAL**: If any scene tests fail, fix the scene classes until all tests pass
- **After completion**: Mark task as completed only after all scene tests pass
- [x] Task 2.5.7: Test Scene Management - Completed on 2024-07-29 - All comprehensive unit tests for scene system passing

### Task 2.5.8: Test Asset Loading System
**Objective**: Validate asset management functionality
- Create comprehensive unit tests for asset loading
- Test spritesheet loading and parsing
- Test animation creation from spritesheets
- Test asset preloading in BootScene
- Test asset error handling
- **REQUIRED**: Run tests and verify all asset loading tests pass
- **CRITICAL**: If any asset loading tests fail, fix the asset system until all tests pass
- **After completion**: Mark task as completed only after all asset loading tests pass
- [x] Task 2.5.8: Test Asset Loading System - Completed on 2024-07-29 - All comprehensive unit tests for asset loading system passing

### Task 2.5.9: Test Physics System
**Objective**: Validate physics functionality
- Create comprehensive unit tests for physics system
- Test gravity application to objects
- Test collision detection between objects
- Test world boundaries enforcement
- Test physics body properties and constraints
- **REQUIRED**: Run tests and verify all physics tests pass
- **CRITICAL**: If any physics tests fail, fix the physics configuration until all tests pass
- **After completion**: Mark task as completed only after all physics tests pass
- [x] Task 2.5.9: Test Physics System - Completed on 2024-07-29 - All comprehensive unit tests for physics system passing

### Task 2.5.10: Test Collectible System
**Objective**: Validate collectible functionality
- Create comprehensive unit tests for collectible system
- Test Coin instantiation and properties
- Test coin-player collision detection
- Test coin collection callback execution
- Test coin destruction after collection
- **REQUIRED**: Run tests and verify all collectible tests pass
- **CRITICAL**: If any collectible tests fail, fix the collectible system until all tests pass
- **After completion**: Mark task as completed only after all collectible tests pass
- [x] Task 2.5.10: Test Collectible System - Completed on 2024-07-29 - All comprehensive unit tests for collectible system passing

### Task 2.5.11: Test Animation System
**Objective**: Validate animation functionality
- Create comprehensive unit tests for animation system
- Test GSAP integration and basic animations
- Test character animation playback (idle, walk, jump, fall)
- Test animation state management
- Test animation performance and memory usage
- **REQUIRED**: Run tests and verify all animation tests pass
- **CRITICAL**: If any animation tests fail, fix the animation system until all tests pass
- **After completion**: Mark task as completed only after all animation tests pass

### Task 2.5.12: Test Object Pool System
**Objective**: Validate object pooling functionality
- Create comprehensive unit tests for ObjectPool
- Test object creation and recycling
- Test pool size management
- Test object reset functionality
- Test memory usage optimization
- **REQUIRED**: Run tests and verify all ObjectPool tests pass
- **CRITICAL**: If any ObjectPool tests fail, fix the ObjectPool until all tests pass
- **After completion**: Mark task as completed only after all ObjectPool tests pass

### Task 2.5.13: Test Integration Testing
**Objective**: Validate complete system integration
- Create comprehensive integration tests
- Test complete player movement flow (input → state → physics → collision)
- Test scene transition flow (boot → menu → game)
- Test asset loading and game initialization
- Test error handling and recovery
- **REQUIRED**: Run integration tests and verify all tests pass
- **CRITICAL**: If any integration tests fail, fix the integration issues until all tests pass
- **After completion**: Mark task as completed only after all integration tests pass

### Task 2.5.14: Performance Testing
**Objective**: Validate system performance
- Create comprehensive performance tests
- Test frame rate consistency during gameplay
- Test memory usage over time
- Test collision detection performance
- Test animation system performance
- **REQUIRED**: Run performance tests and verify all tests pass
- **CRITICAL**: If any performance tests fail, optimize the system until all tests pass
- **After completion**: Mark task as completed only after all performance tests pass

**Phase 2.5 Completion**: Merge `feature/phase-2-5-unit-testing` into `main`

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
**IMPLEMENTATION REFERENCE**: See Section 7.1 "The Time Control System: A Deep Dive" in `agent_docs/comprehensive_documentation.md` for detailed architectural patterns and the `TemporalState` object definition.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for TimeManager class
   - Test instantiation with valid parameters
   - Test time recording functionality
   - Test rewind state management
   - Test object registration system
   - Test edge cases and error conditions
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create `client/src/systems/TimeManager.js` with minimum implementation following the patterns in Section 7.1
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All TimeManager tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 3.2: Create TemporalState Object
**Objective**: Define the data structure for recorded states
**IMPLEMENTATION REFERENCE**: See Section 7.1 "The `TemporalState` Object" table in `agent_docs/comprehensive_documentation.md` for the exact property definitions and rationale.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for TemporalState
   - Test state creation with various object properties
   - Test state serialization and deserialization
   - Test state application to objects
   - Test state validation and error handling
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create `client/src/systems/TemporalState.js` with minimum implementation using the exact property structure from Section 7.1
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All TemporalState tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 3.3: Implement State Recording for Player
**Objective**: Record player states over time
**IMPLEMENTATION REFERENCE**: See Section 7.1 "The `TimeManager` and Recording Logic" in `agent_docs/comprehensive_documentation.md` for the circular buffer implementation and recording loop patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for player state recording
   - Test recording loop functionality
   - Test state storage at fixed intervals
   - Test circular buffer management
   - Test memory usage and performance
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement recording loop in TimeManager following the patterns in Section 7.1
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All state recording tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 3.4: Add Rewind Trigger
**Objective**: Enable time rewind activation
**IMPLEMENTATION REFERENCE**: See Section 7.1 "Rewind Activation" in `agent_docs/comprehensive_documentation.md` for the rewind state management patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for rewind trigger
   - Test keyboard input detection (R key)
   - Test rewind state management
   - Test visual feedback activation
   - Test rewind trigger validation
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement rewind trigger functionality following Section 7.1 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All rewind trigger tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 3.5: Implement Basic Rewind for Player
**Objective**: Apply recorded states to player
**IMPLEMENTATION REFERENCE**: See Section 7.1 "Rewind Activation" code example in `agent_docs/comprehensive_documentation.md` for the exact state application logic.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for player rewind
   - Test state retrieval from buffer
   - Test state application to player position and velocity
   - Test rewind completion handling
   - Test rewind edge cases and errors
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement rewind functionality for player using the code patterns from Section 7.1
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All player rewind tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 3.6: Add Rewind Visual Effects
**Objective**: Enhance rewind with visual feedback
**IMPLEMENTATION REFERENCE**: See Section 2 "High-Performance Animation with GSAP" in `agent_docs/comprehensive_documentation.md` for GSAP integration patterns and Section 2.3 for Phaser+GSAP integration.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for rewind visual effects
   - Test screen tint application during rewind
   - Test particle effect creation and management
   - Test camera shake effect implementation
   - Test visual effect cleanup
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement rewind visual effects using GSAP patterns from Section 2
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All rewind visual effect tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 3.7: Create Phase Dash Ability
**Objective**: Implement short-range teleportation
**IMPLEMENTATION REFERENCE**: See Section 7.2 "Platformer Character Controller" in `agent_docs/comprehensive_documentation.md` for state machine patterns and Section 2 for GSAP animation integration.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for dash ability
   - Test dash input detection (Space key)
   - Test dash direction and distance calculation
   - Test instant position change implementation
   - Test dash validation and constraints
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement dash ability functionality following state machine patterns from Section 7.2
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All dash ability tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 3.8: Add Dash Ghost Trail
**Objective**: Create visual trail effect for dash
**IMPLEMENTATION REFERENCE**: See Section 2.3 "Definitive Integration Pattern: GSAP + Phaser" in `agent_docs/comprehensive_documentation.md` for the exact GSAP-Phaser integration code.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for dash ghost trail
   - Test GSAP trail creation and animation
   - Test multiple trail segment management
   - Test trail opacity and scale animation
   - Test trail cleanup and memory management
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement dash ghost trail using GSAP following Section 2.3 integration patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All dash ghost trail tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 3.9: Implement Dash Cooldown
**Objective**: Balance dash ability with cooldown
**IMPLEMENTATION REFERENCE**: See Section 7.2 "Player State Machine Definition" table in `agent_docs/comprehensive_documentation.md` for state transition patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for dash cooldown
   - Test cooldown timer implementation
   - Test visual cooldown indicator
   - Test dash prevention during cooldown
   - Test cooldown reset and management
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement dash cooldown system following state machine patterns from Section 7.2
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All dash cooldown tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 3.10: Create Chrono Pulse Ability
**Objective**: Implement time freeze shockwave
**IMPLEMENTATION REFERENCE**: See Section 2.4 "Game-Specific Use Cases for 'Time Oddity'" in `agent_docs/comprehensive_documentation.md` for time-based effects patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for chrono pulse
   - Test pulse input detection (E key)
   - Test circular shockwave effect creation
   - Test freeze duration timer management
   - Test pulse range and effect validation
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement chrono pulse ability following time-based effects patterns from Section 2.4
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All chrono pulse tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 3.11: Add Enemy Freeze Effect
**Objective**: Make enemies freeze when hit by pulse
**IMPLEMENTATION REFERENCE**: See Section 2.4 "Time Freeze" patterns in `agent_docs/comprehensive_documentation.md` for GSAP timeline pause functionality.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for enemy freeze effect
   - Test freeze state creation and management
   - Test freeze visual effect implementation
   - Test freeze duration handling
   - Test freeze state transitions
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement enemy freeze effect system using GSAP timeline patterns from Section 2.4
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All enemy freeze effect tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 3.12: Create Enemy Base Class
**Objective**: Establish foundation for all enemies
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Asset and Sprite Management" in `agent_docs/comprehensive_documentation.md` for entity creation patterns and Section 1.4 for physics integration.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for Enemy base class
   - Test Enemy instantiation and initialization
   - Test enemy-specific properties (damage, speed)
   - Test basic AI movement implementation
   - Test enemy lifecycle and state management
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create `client/src/entities/Enemy.js` extending Entity following patterns from Section 1.3
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All Enemy base class tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 3.13: Implement LoopHound Enemy
**Objective**: Create the first enemy type
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Creating Game Objects" in `agent_docs/comprehensive_documentation.md` for sprite creation and Section 1.4 for physics body setup.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for LoopHound enemy
   - Test LoopHound instantiation and properties
   - Test Kenney enemy sprite integration
   - Test basic patrol AI behavior
   - Test LoopHound-specific functionality
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create `client/src/entities/enemies/LoopHound.js` extending Enemy following Section 1.3 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All LoopHound tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 3.14: Add Enemy-Player Collision
**Objective**: Enable combat between player and enemies
**IMPLEMENTATION REFERENCE**: See Section 1.4 "Collision Detection" in `agent_docs/comprehensive_documentation.md` for collision setup patterns and Section 1.4 "Physics Groups" for efficient collision management.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for enemy-player collision
   - Test collision detection setup using CollisionManager
   - Test player damage handling on collision
   - Test invincibility frames implementation
   - Test collision response and feedback
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement enemy-player collision system following Section 1.4 collision patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All enemy-player collision tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 3.15: Implement Enemy Respawn
**Objective**: Make enemies respawn after defeat
**IMPLEMENTATION REFERENCE**: See Section 1.7 "Object Pooling" in `agent_docs/comprehensive_documentation.md` for object lifecycle management patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for enemy respawn
   - Test respawn timer implementation
   - Test enemy position and state reset
   - Test respawn visual effect creation
   - Test respawn validation and constraints
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement enemy respawn system following object pooling patterns from Section 1.7
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All enemy respawn tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 3.16: Implement State Recording for Enemies
**Objective**: Record enemy states for rewind
**IMPLEMENTATION REFERENCE**: See Section 7.1 "Handling Object Lifecycle: The 'Echo' System" in `agent_docs/comprehensive_documentation.md` for the soft-destroy pattern and object lifecycle management.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for enemy state recording
   - Test enemy registration with TimeManager
   - Test enemy state recording at fixed intervals
   - Test rewind application to enemy positions and states
   - Test enemy state synchronization with player
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement enemy state recording system following the Echo System patterns from Section 7.1
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All enemy state recording tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

**Phase 3 Completion**: Merge `feature/phase-3-gameplay-mechanics` into `main`

---

## Phase 4: Level Design & Progression

**Branch**: `feature/phase-4-level-design`

**CRITICAL IMPLEMENTATION REQUIREMENT**: Before implementing any task in this phase, you MUST read the comprehensive documentation file `agent_docs/comprehensive_documentation.md`. This document contains detailed implementation patterns, architectural decisions, and code examples for all systems in this phase. Pay special attention to:
- Section 7.3: UI/HUD Architecture and Implementation (for UIScene, HUD state updates, and responsive layout)
- Section 3: Advanced Audio Management with Howler.js (for audio system integration)
- Section 1.3: Asset and Sprite Management (for level loading and asset integration)
- Section 1.7: Advanced Topics & Best Practices (for performance optimization and mobile responsiveness)

**TDD REQUIREMENT**: All tasks in this phase follow Test-Driven Development (TDD). You MUST:
1. Write comprehensive unit tests FIRST
2. Run tests to confirm they fail (Red phase)
3. Implement the minimum functionality to make tests pass (Green phase)
4. Refactor and bugfix until all tests pass (Refactor phase)
5. Only mark task as complete when ALL tests pass

### Task 4.1: Create Level Data Structure
**Objective**: Define level data format
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Asset and Sprite Management" in `agent_docs/comprehensive_documentation.md` for asset loading patterns and JSON structure validation.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for level data structure
   - Test JSON structure validation
   - Test platform position and type parsing
   - Test enemy spawn point validation
   - Test collectible position parsing
   - Test data structure error handling
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create level data structure definition following Section 1.3 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All level data structure tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.2: Implement Level Loading System
**Objective**: Create modular level loading
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Loading Assets" in `agent_docs/comprehensive_documentation.md` for asset loading patterns and Section 1.4 for physics group creation.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for level loading system
   - Test level loader utility creation
   - Test JSON file loading and parsing
   - Test platform creation from level data
   - Test level validation and error handling
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create level loader utility following Section 1.3 asset loading patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All level loading tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.3: Design Level 1
**Objective**: Create the first tutorial level
**IMPLEMENTATION REFERENCE**: See Section 1.4 "Physics Groups" in `agent_docs/comprehensive_documentation.md` for platform creation and Section 1.3 for sprite placement patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for Level 1
   - Test level layout validation
   - Test basic collectible placement
   - Test enemy encounter setup
   - Test tutorial mechanics integration
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Design and implement Level 1 following Section 1.4 physics group patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All Level 1 tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.4: Design Level 2
**Objective**: Create second level with increased difficulty
**IMPLEMENTATION REFERENCE**: See Section 1.4 "Static vs. Dynamic Bodies" in `agent_docs/comprehensive_documentation.md` for enemy placement and Section 1.3 for complex sprite management.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for Level 2
   - Test complex platforming layout validation
   - Test multiple enemy placement and behavior
   - Test time shard collectible integration
   - Test difficulty progression validation
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Design and implement Level 2 following Section 1.4 physics patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All Level 2 tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.5: Design Level 3
**Objective**: Create third level with time mechanics focus
**IMPLEMENTATION REFERENCE**: See Section 7.1 "The Time Control System" in `agent_docs/comprehensive_documentation.md` for paradox zone implementation and Section 2.4 for time-based effects.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for Level 3
   - Test paradox zone integration
   - Test time-based puzzle validation
   - Test time ability requirement enforcement
   - Test time mechanics showcase validation
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Design and implement Level 3 following Section 7.1 time control patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All Level 3 tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.6: Create TimeShard Collectible
**Objective**: Implement the main collectible system
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Creating Game Objects" in `agent_docs/comprehensive_documentation.md` for collectible creation and Section 1.4 for overlap detection patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for TimeShard collectible
   - Test TimeShard instantiation and properties
   - Test shard collection mechanics validation
   - Test collection visual/audio feedback
   - Test TimeShard lifecycle management
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create `client/src/entities/collectibles/TimeShard.js` following Section 1.3 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All TimeShard tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.7: Add Shard Counter to UI
**Objective**: Display collected shards to player
**IMPLEMENTATION REFERENCE**: See Section 7.3 "HUD State Updates via Event Emitter" in `agent_docs/comprehensive_documentation.md` for UI update patterns and event-driven communication.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for shard counter UI
   - Test shard counter display creation
   - Test counter update on collection
   - Test HUD integration validation
   - Test counter persistence and state management
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement shard counter UI system following Section 7.3 event emitter patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All shard counter UI tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.8: Implement Shard-Based Progression
**Objective**: Use shards to unlock content
**IMPLEMENTATION REFERENCE**: See Section 7.3 "Decoupled UI Scene" in `agent_docs/comprehensive_documentation.md` for UI scene architecture and Section 1.2 for scene management patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for shard-based progression
   - Test shard requirement validation for level completion
   - Test total shard tracking and persistence
   - Test progression feedback system
   - Test progression state management
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement shard-based progression system following Section 7.3 UI patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All shard-based progression tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.9: Create Paradox Zone Detection
**Objective**: Identify when player enters paradox zones
**IMPLEMENTATION REFERENCE**: See Section 1.4 "Collision Detection" in `agent_docs/comprehensive_documentation.md` for overlap detection and Section 7.1 for time manipulation zone patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for paradox zone detection
   - Test zone boundary detection accuracy
   - Test zone entry/exit event triggering
   - Test zone visual indicator management
   - Test zone state validation
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement paradox zone detection system following Section 1.4 overlap patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All paradox zone detection tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.10: Implement Reverse Gravity Rule
**Objective**: Create first paradox zone effect
**IMPLEMENTATION REFERENCE**: See Section 1.4 "Physics Bodies" in `agent_docs/comprehensive_documentation.md` for physics body manipulation and Section 7.1 for time effect patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for reverse gravity rule
   - Test gravity inversion in paradox zones
   - Test player physics update in zones
   - Test zone exit gravity restoration
   - Test gravity transition smoothness
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement reverse gravity rule system following Section 1.4 physics patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All reverse gravity rule tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.11: Add Paradox Zone Visual Effects
**Objective**: Make paradox zones visually distinct
**IMPLEMENTATION REFERENCE**: See Section 2.4 "Game-Specific Use Cases for 'Time Oddity'" in `agent_docs/comprehensive_documentation.md` for time-based visual effects and Section 2.3 for GSAP-Phaser integration.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for paradox zone visual effects
   - Test zone boundary effect creation
   - Test screen distortion effect implementation
   - Test particle effect management in zones
   - Test visual effect cleanup and performance
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement paradox zone visual effects using Section 2.4 GSAP patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All paradox zone visual effect tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.12: Create UIScene Class
**Objective**: Separate UI from game logic
**IMPLEMENTATION REFERENCE**: See Section 7.3 "Decoupled UI Scene" in `agent_docs/comprehensive_documentation.md` for the complete UIScene architecture and implementation patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for UIScene class
   - Test UIScene instantiation and lifecycle
   - Test UI camera and display setup
   - Test UIScene-GameScene integration
   - Test UI state management
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create `client/src/scenes/UIScene.js` extending BaseScene following Section 7.3 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All UIScene tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.13: Add Health Bar to UI
**Objective**: Display player health
**IMPLEMENTATION REFERENCE**: See Section 7.3 "HUD State Updates via Event Emitter" in `agent_docs/comprehensive_documentation.md` for the exact event-driven UI update pattern and code examples.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for health bar UI
   - Test health bar visual element creation
   - Test health bar update based on player state
   - Test health bar animation system
   - Test health bar state synchronization
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement health bar UI system following Section 7.3 event emitter patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All health bar UI tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.14: Add Ability Cooldown Indicators
**Objective**: Show ability availability
**IMPLEMENTATION REFERENCE**: See Section 7.3 "Interactive Menus and Responsive Layout" in `agent_docs/comprehensive_documentation.md` for UI element positioning and Section 1.7 for responsive design patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for ability cooldown indicators
   - Test cooldown indicator creation for dash and pulse
   - Test indicator update based on cooldown state
   - Test visual feedback for ready abilities
   - Test cooldown indicator synchronization
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement ability cooldown indicator system following Section 7.3 UI patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All ability cooldown indicator tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.15: Create Pause Menu
**Objective**: Allow game pausing
**IMPLEMENTATION REFERENCE**: See Section 1.2 "Scene Management" in `agent_docs/comprehensive_documentation.md` for scene pausing patterns and Section 7.3 for UI scene integration.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for pause menu
   - Test pause button functionality (P key)
   - Test pause menu overlay creation
   - Test resume and quit option handling
   - Test pause state management
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement pause menu system following Section 1.2 scene management patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All pause menu tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.16: Set Up Howler.js Audio Manager
**Objective**: Initialize audio system
**IMPLEMENTATION REFERENCE**: See Section 3.1 "Core API and Configuration" in `agent_docs/comprehensive_documentation.md` for Howler.js setup and Section 3.2 for AudioManager implementation patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for Howler.js audio manager
   - Test Howler.js dependency installation
   - Test audio context and controls setup
   - Test AudioManager instantiation
   - Test audio system initialization
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Install Howler.js and create `client/src/systems/AudioManager.js` following Section 3.2 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All audio manager tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.17: Load Kenney Sound Effects
**Objective**: Integrate audio assets
**IMPLEMENTATION REFERENCE**: See Section 3.2 "Audio Sprites for Efficiency" in `agent_docs/comprehensive_documentation.md` for audio sprite implementation and Section 3.2 "Global Audio Manager" for loading patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for Kenney sound effects
   - Test sound file copying to assets
   - Test sound effect loading in AudioManager
   - Test sound effect method creation
   - Test sound effect validation
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Copy Kenney sound files and implement loading following Section 3.2 audio sprite patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All sound effect loading tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.18: Add Basic Sound Effects
**Objective**: Connect sounds to game actions
**IMPLEMENTATION REFERENCE**: See Section 3.3 "Integration with Phaser" in `agent_docs/comprehensive_documentation.md` for the exact integration patterns and collision callback examples.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for basic sound effects
   - Test jump sound effect triggering
   - Test coin collection sound integration
   - Test dash sound effect implementation
   - Test sound effect synchronization
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement basic sound effect connections following Section 3.3 integration patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All basic sound effect tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.19: Implement Background Music
**Objective**: Add ambient music
**IMPLEMENTATION REFERENCE**: See Section 3.2 "Layer Management" in `agent_docs/comprehensive_documentation.md` for background music management and Section 3.3 for music controls.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for background music
   - Test background music track loading
   - Test music controls (play, pause, volume)
   - Test music looping functionality
   - Test music state management
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement background music system following Section 3.2 layer management patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All background music tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.20: Add Audio Controls
**Objective**: Allow player to control audio
**IMPLEMENTATION REFERENCE**: See Section 3.2 "Global Audio Manager" in `agent_docs/comprehensive_documentation.md` for volume control patterns and Section 7.3 for UI integration.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for audio controls
   - Test volume controls in pause menu
   - Test mute/unmute functionality
   - Test audio preference saving
   - Test audio control persistence
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement audio control system following Section 3.2 global audio patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All audio control tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.21: Implement Level Completion Detection
**Objective**: Detect when player completes a level
**IMPLEMENTATION REFERENCE**: See Section 1.4 "Collision Detection" in `agent_docs/comprehensive_documentation.md` for trigger zone creation and Section 1.2 for scene transition patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for level completion detection
   - Test level completion trigger zone creation
   - Test completion criteria validation (shards, objectives)
   - Test level completion event triggering
   - Test completion state management
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement level completion detection system following Section 1.4 overlap patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All level completion detection tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 4.22: Create Level Transition System
**Objective**: Handle transitions between levels
**IMPLEMENTATION REFERENCE**: See Section 1.2 "Scene Management" in `agent_docs/comprehensive_documentation.md` for scene transition patterns and Section 1.6 for camera fade effects.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for level transition system
   - Test level completion screen creation
   - Test next level loading implementation
   - Test level selection logic validation
   - Test transition state management
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement level transition system following Section 1.2 scene management patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All level transition tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

**Phase 4 Completion**: Merge `feature/phase-4-level-design` into `main`

---

## Phase 5: Polish & MVP Completion

**Branch**: `feature/phase-5-polish`

**CRITICAL IMPLEMENTATION REQUIREMENT**: Before implementing any task in this phase, you MUST read the comprehensive documentation file `agent_docs/comprehensive_documentation.md`. This document contains detailed implementation patterns, architectural decisions, and code examples for all systems in this phase. Pay special attention to:
- Section 1.6: Camera Systems, Particles, and Effects (for visual effects and camera manipulation)
- Section 1.7: Advanced Topics & Best Practices (for performance optimization, memory management, and mobile responsiveness)
- Section 2: High-Performance Animation with GSAP (for particle effects and animations)
- Section 6: Full-Stack Architecture and Development Tooling (for error handling and production deployment)

**TDD REQUIREMENT**: All tasks in this phase follow Test-Driven Development (TDD). You MUST:
1. Write comprehensive unit tests FIRST
2. Run tests to confirm they fail (Red phase)
3. Implement the minimum functionality to make tests pass (Green phase)
4. Refactor and bugfix until all tests pass (Refactor phase)
5. Only mark task as complete when ALL tests pass

### Task 5.1: Add Particle Effects for Dash
**Objective**: Enhance dash visual feedback
**IMPLEMENTATION REFERENCE**: See Section 1.6 "Particle Emitters" in `agent_docs/comprehensive_documentation.md` for particle system creation and Section 2.4 for GSAP particle animation patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for dash particle effects
   - Test particle system creation for dash ability
   - Test particle emission on dash activation
   - Test particle properties validation (speed, lifetime, color)
   - Test particle cleanup and memory management
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement dash particle effects system following Section 1.6 particle patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All dash particle effect tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.2: Add Particle Effects for Chrono Pulse
**Objective**: Enhance chrono pulse visual feedback
**IMPLEMENTATION REFERENCE**: See Section 1.6 "Particle Emitters" in `agent_docs/comprehensive_documentation.md` for explosion patterns and Section 2.4 for time-based particle effects.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for chrono pulse particle effects
   - Test particle system creation for chrono pulse
   - Test particle emission on pulse activation
   - Test shockwave particle properties validation
   - Test particle effect synchronization
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement chrono pulse particle effects using Section 1.6 explosion patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All chrono pulse particle effect tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.3: Add Particle Effects for Rewind
**Objective**: Enhance rewind visual feedback
**IMPLEMENTATION REFERENCE**: See Section 2.4 "Time-Based Effects" in `agent_docs/comprehensive_documentation.md` for time distortion effects and Section 1.6 for particle system management.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for rewind particle effects
   - Test particle system creation for rewind
   - Test particle emission during rewind
   - Test time distortion particle properties validation
   - Test particle effect timing and cleanup
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement rewind particle effects using Section 2.4 time-based patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All rewind particle effect tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.4: Implement Screen Shake on Damage
**Objective**: Add impact feedback for player damage
**IMPLEMENTATION REFERENCE**: See Section 1.6 "Camera Manager" in `agent_docs/comprehensive_documentation.md` for camera shake effects and Section 2.3 for GSAP-Phaser integration.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for screen shake on damage
   - Test screen shake activation when player takes damage
   - Test shake intensity and duration configuration
   - Test camera shake system integration
   - Test shake effect cleanup and performance
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement screen shake on damage system following Section 1.6 camera patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All screen shake on damage tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.5: Implement Screen Shake on Enemy Defeat
**Objective**: Add impact feedback for enemy defeat
**IMPLEMENTATION REFERENCE**: See Section 1.6 "Camera Manager" in `agent_docs/comprehensive_documentation.md` for camera effects and Section 1.4 for enemy defeat detection patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for screen shake on enemy defeat
   - Test screen shake activation when enemies are defeated
   - Test shake intensity and duration configuration
   - Test enemy defeat detection and shake triggering
   - Test shake effect synchronization
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement screen shake on enemy defeat system following Section 1.6 camera patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All screen shake on enemy defeat tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.6: Implement Screen Shake on Level Completion
**Objective**: Add celebration feedback
**IMPLEMENTATION REFERENCE**: See Section 1.6 "Camera Manager" in `agent_docs/comprehensive_documentation.md` for camera effects and Section 1.2 for level completion detection patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for screen shake on level completion
   - Test screen shake activation when level is completed
   - Test celebration shake properties configuration
   - Test level completion detection and shake triggering
   - Test celebration effect timing and cleanup
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement screen shake on level completion system following Section 1.6 camera patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All screen shake on level completion tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.7: Add Camera Zoom Effects
**Objective**: Enhance visual presentation
**IMPLEMENTATION REFERENCE**: See Section 1.6 "Camera Manager" in `agent_docs/comprehensive_documentation.md` for camera zoom effects and Section 2.3 for GSAP-Phaser integration.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for camera zoom effects
   - Test camera zoom activation on important events
   - Test zoom timing and intensity configuration
   - Test smooth zoom transition implementation
   - Test zoom effect cleanup and performance
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement camera zoom effects system following Section 1.6 camera patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All camera zoom effect tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.8: Add Camera Pan Effects
**Objective**: Enhance visual presentation
**IMPLEMENTATION REFERENCE**: See Section 1.6 "Camera Manager" in `agent_docs/comprehensive_documentation.md` for camera pan effects and Section 1.6 "startFollow" for camera following patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for camera pan effects
   - Test camera pan to follow important objects
   - Test pan speed and boundaries configuration
   - Test smooth pan transition implementation
   - Test pan effect synchronization and cleanup
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement camera pan effects system following Section 1.6 camera patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All camera pan effect tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.9: Add Camera Fade Transitions
**Objective**: Enhance scene transitions
**IMPLEMENTATION REFERENCE**: See Section 1.6 "Camera Manager" in `agent_docs/comprehensive_documentation.md` for camera fade effects and Section 1.2 for scene transition patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for camera fade transitions
   - Test fade in/out effects between scenes
   - Test fade timing and color configuration
   - Test smooth fade transition implementation
   - Test fade effect cleanup and performance
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement camera fade transitions system following Section 1.6 camera patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All camera fade transition tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.10: Tune Player Movement Speed
**Objective**: Optimize player feel
**IMPLEMENTATION REFERENCE**: See Section 1.4 "Physics Bodies" in `agent_docs/comprehensive_documentation.md` for velocity control and Section 7.2 for player state machine tuning.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for player movement speed tuning
   - Test player horizontal movement speed adjustment
   - Test different speed value validation
   - Test optimal speed for responsiveness
   - Test speed change impact on gameplay
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement player movement speed tuning system following Section 1.4 physics patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All player movement speed tuning tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.11: Tune Player Jump Height
**Objective**: Optimize jump feel
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for player jump height tuning
   - Test player jump velocity adjustment
   - Test different jump height values
   - Test optimal jump height for platforming
   - Test jump height change impact on gameplay
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement player jump height tuning system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All player jump height tuning tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.12: Tune Dash Distance and Cooldown
**Objective**: Balance dash ability
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for dash distance and cooldown tuning
   - Test dash distance adjustment for tactical use
   - Test dash cooldown adjustment for balance
   - Test different values for fun factor
   - Test dash tuning impact on gameplay
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement dash distance and cooldown tuning system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All dash distance and cooldown tuning tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.13: Balance Enemy Speed and Damage
**Objective**: Create fair challenge
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for enemy speed and damage tuning
   - Test enemy movement speed adjustment
   - Test enemy damage values
   - Test different values for appropriate difficulty
   - Test enemy tuning impact on gameplay
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement enemy speed and damage tuning system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All enemy speed and damage tuning tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.14: Balance Enemy Spawn Rates
**Objective**: Create appropriate enemy density
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for enemy spawn rate tuning
   - Test enemy spawn timing adjustment
   - Test different spawn rates
   - Test optimal density for gameplay
   - Test spawn rate change impact on gameplay
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement enemy spawn rate tuning system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All enemy spawn rate tuning tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.15: Tune Enemy AI Behavior
**Objective**: Create engaging enemy behavior
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for enemy AI behavior tuning
   - Test enemy patrol pattern adjustment
   - Test enemy detection range adjustment
   - Test different AI parameters
   - Test enemy tuning impact on gameplay
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement enemy AI behavior tuning system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All enemy AI behavior tuning tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.16: Tune Rewind Duration and Cooldown
**Objective**: Balance time rewind
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for rewind duration and cooldown tuning
   - Test rewind duration adjustment
   - Test rewind cooldown adjustment
   - Test different values for balance
   - Test rewind tuning impact on gameplay
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement rewind duration and cooldown tuning system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All rewind duration and cooldown tuning tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.17: Tune Chrono Pulse Range and Duration
**Objective**: Balance chrono pulse ability
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for chrono pulse range and duration tuning
   - Test pulse range adjustment
   - Test pulse freeze duration adjustment
   - Test different values for effectiveness
   - Test chrono pulse tuning impact on gameplay
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement chrono pulse range and duration tuning system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All chrono pulse range and duration tuning tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.18: Tune Paradox Zone Effects
**Objective**: Balance paradox zone mechanics
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for paradox zone effect tuning
   - Test gravity reversal strength adjustment
   - Test zone size and placement adjustment
   - Test different effect intensities
   - Test paradox zone tuning impact on gameplay
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement paradox zone effect tuning system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All paradox zone effect tuning tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.19: Create Game Over Scene
**Objective**: Handle player death
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for game over scene
   - Test game over scene creation
   - Test final score display
   - Test restart and menu button functionality
   - Test game over state management
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement game over scene system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All game over scene tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.20: Add Restart Functionality
**Objective**: Allow quick restart
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for restart functionality
   - Test restart button functionality
   - Test player state reset
   - Test level state reset
   - Test restart validation and constraints
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement restart functionality
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All restart functionality tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.21: Create Level Completion Scene
**Objective**: Celebrate level completion
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for level completion scene
   - Test level completion scene creation
   - Test level stats display
   - Test next level transition
   - Test level completion effect synchronization
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement level completion scene system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All level completion scene tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.22: Implement Basic Scoring System
**Objective**: Add score tracking
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for scoring system
   - Test scoring system creation
   - Test point awarding for collectibles
   - Test point awarding for speed completion
   - Test score display and persistence
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement scoring system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All scoring system tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.23: Add Object Pooling for Dash Particles
**Objective**: Optimize dash particle performance
**IMPLEMENTATION REFERENCE**: See Section 1.7 "Object Pooling" in `agent_docs/comprehensive_documentation.md` for the complete object pooling implementation pattern and performance optimization strategies.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for dash particle object pooling
   - Test particle object pool creation
   - Test object creation and recycling
   - Test pool size management
   - Test object reset functionality
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement dash particle object pooling system following Section 1.7 object pooling patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All dash particle object pooling tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.24: Add Object Pooling for Pulse Particles
**Objective**: Optimize pulse particle performance
**IMPLEMENTATION REFERENCE**: See Section 1.7 "Object Pooling" in `agent_docs/comprehensive_documentation.md` for object pooling patterns and Section 1.6 for particle system management.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for pulse particle object pooling
   - Test particle object pool creation
   - Test object creation and recycling
   - Test pool size management
   - Test object reset functionality
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement pulse particle object pooling system following Section 1.7 object pooling patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All pulse particle object pooling tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.25: Add Object Pooling for Rewind Particles
**Objective**: Optimize rewind particle performance
**IMPLEMENTATION REFERENCE**: See Section 1.7 "Object Pooling" in `agent_docs/comprehensive_documentation.md` for object pooling patterns and Section 2.4 for time-based particle effects.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for rewind particle object pooling
   - Test particle object pool creation
   - Test object creation and recycling
   - Test pool size management
   - Test object reset functionality
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement rewind particle object pooling system following Section 1.7 object pooling patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All rewind particle object pooling tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.26: Optimize Asset Loading
**Objective**: Improve load times
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Asset and Sprite Management" in `agent_docs/comprehensive_documentation.md` for asset loading optimization and Section 1.7 for performance tuning strategies.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for asset loading optimization
   - Test asset preloading implementation
   - Test loading progress indicator creation
   - Test asset file size optimization
   - Test load time reduction impact
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement asset loading optimization system following Section 1.3 asset patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All asset loading optimization tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.27: Add FPS Counter
**Objective**: Track game performance
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for FPS counter
   - Test FPS display creation
   - Test FPS update in real-time
   - Test FPS display in development mode
   - Test FPS synchronization with game
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement FPS counter system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All FPS counter tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.28: Add Memory Usage Monitoring
**Objective**: Track memory performance
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for memory usage monitoring
   - Test memory usage display creation
   - Test memory allocation monitoring
   - Test memory usage in development mode
   - Test memory usage impact on gameplay
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement memory usage monitoring system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All memory usage monitoring tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.29: Add Render Call Monitoring
**Objective**: Track rendering performance
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for render call monitoring
   - Test render call counter creation
   - Test draw calls per frame monitoring
   - Test render stats display in development mode
   - Test render call optimization impact
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement render call monitoring system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All render call monitoring tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.30: Test on Different Screen Sizes
**Objective**: Ensure responsive design
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for responsive design
   - Test game functionality on various resolutions
   - Test UI scaling
   - Test gameplay on different aspect ratios
   - Test responsive design impact on gameplay
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement responsive design system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All responsive design tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.31: Fix Critical Gameplay Bugs
**Objective**: Ensure stability
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for critical gameplay bugs
   - Test movement bugs
   - Test collision detection issues
   - Test state transition bugs
   - Test error handling
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement critical gameplay bug fixes
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All critical gameplay bug tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.32: Optimize Render Performance
**Objective**: Ensure smooth gameplay
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for render performance optimization
   - Test sprite rendering optimization
   - Test unnecessary draw calls reduction
   - Test sprite batching implementation
   - Test render performance impact on gameplay
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement render performance optimization system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All render performance optimization tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.33: Reduce Memory Usage
**Objective**: Optimize memory efficiency
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for memory usage optimization
   - Test object cleanup implementation
   - Test asset memory footprint reduction
   - Test data structure optimization
   - Test memory usage impact on gameplay
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement memory usage optimization system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All memory usage optimization tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.34: Ensure Consistent 60 FPS
**Objective**: Maintain smooth performance
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for consistent frame timing
   - Test frame rate consistency during gameplay
   - Test frame timing profiling
   - Test target device frame rate validation
   - Test performance bottleneck identification
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement consistent frame timing system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All consistent frame timing tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.35: Validate All Player Abilities
**Objective**: Ensure all features work
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for player ability validation
   - Test dash ability functionality
   - Test chrono pulse functionality
   - Test rewind functionality
   - Test all player abilities
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement ability validation system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All player ability tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.36: Validate Time Mechanics
**Objective**: Ensure time systems work
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for time mechanics validation
   - Test rewind mechanics
   - Test paradox zone effects
   - Test time shard collection
   - Test time mechanics integration
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement time mechanics validation system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All time mechanics tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.37: Validate Level Progression
**Objective**: Ensure progression works
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for level progression validation
   - Test level completion detection
   - Test level transitions
   - Test shard-based progression
   - Test progression mechanics integration
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement level progression validation system
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All level progression tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.38: Create Final MVP Demo Level
**Objective**: Showcase all features
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for MVP demo level validation
   - Test MVP demo level design
   - Test mechanics showcase
   - Test feature integration
   - Test gameplay duration
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Design and implement MVP demo level
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All MVP demo level tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.39: Add Error Handling to Critical Systems
**Objective**: Ensure robust error handling
**IMPLEMENTATION REFERENCE**: See Section 6.3 "Global Error Handling and Logging" in `agent_docs/comprehensive_documentation.md` for comprehensive error handling patterns and Section 1.7 for system robustness strategies.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for error handling
   - Test try-catch block implementation
   - Test error handling in TimeManager
   - Test error handling in InputManager
   - Test error handling in CollisionManager
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement error handling system following Section 6.3 error handling patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All error handling tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.40: Add Error Logging System
**Objective**: Track and log errors
**IMPLEMENTATION REFERENCE**: See Section 6.3 "Centralized Logging" in `agent_docs/comprehensive_documentation.md` for logging system implementation and Section 6.4 for production deployment logging.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for error logging
   - Test error logging utility creation
   - Test error logging to console
   - Test error logging to file
   - Test error reporting system
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement error logging system following Section 6.3 logging patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All error logging tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.41: Add Graceful Degradation
**Objective**: Handle system failures
**IMPLEMENTATION REFERENCE**: See Section 6.3 "Global Error Handling and Logging" in `agent_docs/comprehensive_documentation.md` for graceful degradation patterns and Section 1.7 for fallback strategies.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for graceful degradation
   - Test fallback for missing assets
   - Test fallback for failed systems
   - Test error recovery
   - Test system degradation handling
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement graceful degradation system following Section 6.3 degradation patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All graceful degradation tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

### Task 5.42: Test Complete Game Flow
**Objective**: Ensure end-to-end functionality
**IMPLEMENTATION REFERENCE**: See Section 6.2 "Full-Stack Data Flow and State Management" in `agent_docs/comprehensive_documentation.md` for complete system integration patterns and Section 1.2 for scene flow management.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for complete game flow
   - Test game flow from menu to completion
   - Test all scene transitions
   - Test input combinations
   - Test error handling
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement complete game flow system following Section 6.2 data flow patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All complete game flow tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all tests pass

**Phase 5 Completion**: Merge `feature/phase-5-polish` into `main`

---

## Git Workflow Commands

### For Each Phase:

1. **Create Phase Branch**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/phase-X-[name]
   ```

2. **After Completing All Tasks in Phase**:
   ```bash
   git add .
   git commit -m "Complete Phase X: [Phase Name]"
   git push origin feature/phase-X-[name]
   ```

3. **Merge to Main**:
   ```bash
   git checkout main
   git merge feature/phase-X-[name]
   git push origin main
   ```

4. **Clean Up**:
   ```bash
   git branch -d feature/phase-X-[name]
   git push origin --delete feature/phase-X-[name]
   ```

---

## Testing Guidelines

### For Each Task:
1. **Verify the specific functionality** described in the task
2. **Test edge cases** and error conditions
3. **Ensure no regressions** in previously working features
4. **Check performance** impact of new features
5. **Validate against** the architectural patterns from documentation

### Success Criteria:
- Task functionality works as described
- No console errors or warnings
- Performance remains acceptable
- Code follows established patterns
- Assets are properly integrated

### Common Test Commands:
- `npm run dev` - Start development server
- `npm run build` - Test production build
- Browser dev tools - Check for errors and performance
- Manual gameplay testing - Verify mechanics work as expected

### Task Completion Tracking:
- Mark each task as completed by changing `- [ ]` to `- [x]`
- Add completion date and notes: `- [x] Completed on 2024-01-15 - Added error handling`
- Update progress regularly to track development status