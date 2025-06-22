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

### Task 2.12: Add Keyboard Controls
**Objective**: Implement basic keyboard input
- Set up arrow key detection
- Set up WASD key detection
- Add input debouncing
- **Test**: Keyboard input is detected and tracked correctly

### Task 2.13: Connect Input to Player Movement
**Objective**: Link input to player actions
- Update Player class to use InputManager
- Handle left/right movement input
- Handle jump input
- **Test**: Player responds to keyboard input

### Task 2.14: Implement Variable Jump Height
**Objective**: Add responsive jumping mechanics
- Track jump key hold duration
- Adjust jump velocity based on hold time
- Set maximum jump height
- **Test**: Jump height varies based on key hold duration

### Task 2.15: Create CollisionManager Class
**Objective**: Centralize collision detection
- Create `client/src/systems/CollisionManager.js`
- Add collision group management
- Add collision callback system
- Add collision filtering
- **Test**: CollisionManager can be instantiated and manages collisions

### Task 2.16: Add Player-Platform Collision
**Objective**: Enable player to stand on platforms
- Set up collision between player and platform group using CollisionManager
- Handle collision callbacks
- Ensure player stops falling when landing
- **Test**: Player can land and stand on platforms

### Task 2.17: Create Basic Test Level
**Objective**: Build a simple level for testing
- Create multiple platforms at different heights
- Add ground level
- Position platforms for basic platforming
- **Test**: Level is playable with basic movement

### Task 2.18: Add Collectible Coins
**Objective**: Create basic collectibles for testing
- Create `client/src/entities/collectibles/Coin.js`
- Add coin sprites to level
- Set up coin-player collision
- Add coin collection feedback
- **Test**: Player can collect coins and see feedback

**Phase 2 Completion**: Merge `feature/phase-2-player-movement` into `main`

---

## Phase 3: Core Gameplay Mechanics

**Branch**: `feature/phase-3-gameplay-mechanics`

### Task 3.1: Create TimeManager Class
**Objective**: Implement the core time manipulation system
- Create `client/src/systems/TimeManager.js`
- Add time recording functionality
- Add rewind state management
- Add object registration system
- **Test**: TimeManager can be instantiated and manages time state

### Task 3.2: Create TemporalState Object
**Objective**: Define the data structure for recorded states
- Create `client/src/systems/TemporalState.js`
- Define state properties (position, velocity, rotation, etc.)
- Add state creation methods
- Add state application methods
- **Test**: TemporalState can store and restore object states

### Task 3.3: Implement State Recording for Player
**Objective**: Record player states over time
- Add recording loop to TimeManager
- Record player state at fixed intervals
- Store states in circular buffer
- **Test**: Player states are recorded and stored correctly

### Task 3.4: Add Rewind Trigger
**Objective**: Enable time rewind activation
- Add keyboard trigger for rewind (R key)
- Add rewind state management
- Add visual feedback for rewind activation
- **Test**: Pressing R activates rewind mode

### Task 3.5: Implement Basic Rewind for Player
**Objective**: Apply recorded states to player
- Pop recorded states from buffer
- Apply state to player position and velocity
- Handle rewind completion
- **Test**: Player position and movement are rewound correctly

### Task 3.6: Add Rewind Visual Effects
**Objective**: Enhance rewind with visual feedback
- Add screen tint during rewind
- Add particle effects around player
- Add camera shake effect
- **Test**: Rewind has clear visual feedback

### Task 3.7: Create Phase Dash Ability
**Objective**: Implement short-range teleportation
- Add dash input detection (Space key)
- Calculate dash direction and distance
- Implement instant position change
- **Test**: Player can dash in movement direction

### Task 3.8: Add Dash Ghost Trail
**Objective**: Create visual trail effect for dash
- Use GSAP to create fade-out trail
- Create multiple trail segments
- Animate trail opacity and scale
- **Test**: Dash creates visible ghost trail effect

### Task 3.9: Implement Dash Cooldown
**Objective**: Balance dash ability with cooldown
- Add cooldown timer to dash
- Add visual cooldown indicator
- Prevent dash during cooldown
- **Test**: Dash has cooldown and cannot be spammed

### Task 3.10: Create Chrono Pulse Ability
**Objective**: Implement time freeze shockwave
- Add pulse input detection (E key)
- Create circular shockwave effect
- Add freeze duration timer
- **Test**: Chrono pulse creates shockwave effect

### Task 3.11: Add Enemy Freeze Effect
**Objective**: Make enemies freeze when hit by pulse
- Create freeze state for enemies
- Add freeze visual effect
- Implement freeze duration
- **Test**: Enemies freeze when hit by chrono pulse

### Task 3.12: Create Enemy Base Class
**Objective**: Establish foundation for all enemies
- Create `client/src/entities/Enemy.js` extending Entity
- Add enemy-specific properties (damage, speed)
- Add basic AI movement
- **Test**: Enemy class can be instantiated and moves

### Task 3.13: Implement LoopHound Enemy
**Objective**: Create the first enemy type
- Create `client/src/entities/enemies/LoopHound.js` extending Enemy
- Use Kenney enemy sprites
- Add basic patrol AI
- **Test**: LoopHound moves and patrols correctly

### Task 3.14: Add Enemy-Player Collision
**Objective**: Enable combat between player and enemies
- Set up collision detection using CollisionManager
- Handle player damage on collision
- Add invincibility frames
- **Test**: Player takes damage when touching enemies

### Task 3.15: Implement Enemy Respawn
**Objective**: Make enemies respawn after defeat
- Add respawn timer to enemies
- Reset enemy position and state
- Add respawn visual effect
- **Test**: Enemies respawn after being defeated

### Task 3.16: Implement State Recording for Enemies
**Objective**: Record enemy states for rewind
- Register enemies with TimeManager
- Record enemy states at fixed intervals
- Apply rewind to enemy positions and states
- **Test**: Enemies are rewound along with player

**Phase 3 Completion**: Merge `feature/phase-3-gameplay-mechanics` into `main`

---

## Phase 4: Level Design & Progression

**Branch**: `feature/phase-4-level-design`

### Task 4.1: Create Level Data Structure
**Objective**: Define level data format
- Create level JSON structure
- Define platform positions and types
- Define enemy spawn points
- Define collectible positions
- **Test**: Level data can be parsed and loaded

### Task 4.2: Implement Level Loading System
**Objective**: Create modular level loading
- Create level loader utility
- Load level data from JSON files
- Create platforms from level data
- **Test**: Levels can be loaded from data files

### Task 4.3: Design Level 1
**Objective**: Create the first tutorial level
- Design simple platforming layout
- Add basic collectibles
- Include one enemy encounter
- **Test**: Level 1 is playable and teaches basic mechanics

### Task 4.4: Design Level 2
**Objective**: Create second level with increased difficulty
- Add more complex platforming
- Include multiple enemies
- Add time shard collectibles
- **Test**: Level 2 provides increased challenge

### Task 4.5: Design Level 3
**Objective**: Create third level with time mechanics focus
- Add paradox zone
- Include time-based puzzles
- Require use of time abilities
- **Test**: Level 3 showcases time manipulation mechanics

### Task 4.6: Create TimeShard Collectible
**Objective**: Implement the main collectible system
- Create `client/src/entities/collectibles/TimeShard.js`
- Add shard collection mechanics
- Add collection visual/audio feedback
- **Test**: Time shards can be collected with feedback

### Task 4.7: Add Shard Counter to UI
**Objective**: Display collected shards to player
- Create shard counter display
- Update counter on collection
- Add counter to game HUD
- **Test**: Shard counter updates when collecting shards

### Task 4.8: Implement Shard-Based Progression
**Objective**: Use shards to unlock content
- Add shard requirements for level completion
- Track total shards collected
- Add progression feedback
- **Test**: Level completion requires sufficient shards

### Task 4.9: Create Paradox Zone Detection
**Objective**: Identify when player enters paradox zones
- Add zone boundary detection
- Create zone entry/exit events
- Add zone visual indicators
- **Test**: Paradox zones are detected when entered

### Task 4.10: Implement Reverse Gravity Rule
**Objective**: Create first paradox zone effect
- Add gravity inversion in paradox zones
- Update player physics in zones
- Add zone exit gravity restoration
- **Test**: Gravity reverses when entering paradox zones

### Task 4.11: Add Paradox Zone Visual Effects
**Objective**: Make paradox zones visually distinct
- Add zone boundary effects
- Add screen distortion effects
- Add particle effects in zones
- **Test**: Paradox zones have clear visual indicators

### Task 4.12: Create UIScene Class
**Objective**: Separate UI from game logic
- Create `client/src/scenes/UIScene.js` extending BaseScene
- Launch UIScene alongside GameScene
- Set up UI camera and display
- **Test**: UIScene loads and displays over GameScene

### Task 4.13: Add Health Bar to UI
**Objective**: Display player health
- Create health bar visual element
- Update health bar based on player state
- Add health bar animations
- **Test**: Health bar displays and updates correctly

### Task 4.14: Add Ability Cooldown Indicators
**Objective**: Show ability availability
- Create cooldown indicators for dash and pulse
- Update indicators based on cooldown state
- Add visual feedback for ready abilities
- **Test**: Cooldown indicators show ability availability

### Task 4.15: Create Pause Menu
**Objective**: Allow game pausing
- Add pause button (P key)
- Create pause menu overlay
- Add resume and quit options
- **Test**: Game can be paused and resumed

### Task 4.16: Set Up Howler.js Audio Manager
**Objective**: Initialize audio system
- Install Howler.js dependency
- Create `client/src/systems/AudioManager.js`
- Set up audio context and controls
- **Test**: AudioManager can be instantiated

### Task 4.17: Load Kenney Sound Effects
**Objective**: Integrate audio assets
- Copy Kenney sound files to assets
- Load sound effects in AudioManager
- Create sound effect methods
- **Test**: Sound effects can be played

### Task 4.18: Add Basic Sound Effects
**Objective**: Connect sounds to game actions
- Add jump sound effect
- Add coin collection sound
- Add dash sound effect
- **Test**: Sound effects play on appropriate actions

### Task 4.19: Implement Background Music
**Objective**: Add ambient music
- Load background music track
- Add music controls (play, pause, volume)
- Loop background music
- **Test**: Background music plays and loops

### Task 4.20: Add Audio Controls
**Objective**: Allow player to control audio
- Add volume controls to pause menu
- Add mute/unmute functionality
- Save audio preferences
- **Test**: Audio controls work and persist

### Task 4.21: Implement Level Completion Detection
**Objective**: Detect when player completes a level
- Add level completion trigger zones
- Check completion criteria (shards, objectives)
- Trigger level completion events
- **Test**: Level completion is detected correctly

### Task 4.22: Create Level Transition System
**Objective**: Handle transitions between levels
- Add level completion screen
- Implement next level loading
- Add level selection logic
- **Test**: Transitions between levels work smoothly

**Phase 4 Completion**: Merge `feature/phase-4-level-design` into `main`

---

## Phase 5: Polish & MVP Completion

**Branch**: `feature/phase-5-polish`

### Task 5.1: Add Particle Effects for Dash
**Objective**: Enhance dash visual feedback
- Create particle system for dash ability
- Add particle emission on dash
- Configure particle properties (speed, lifetime, color)
- **Test**: Dash creates particle effects

### Task 5.2: Add Particle Effects for Chrono Pulse
**Objective**: Enhance chrono pulse visual feedback
- Create particle system for chrono pulse
- Add particle emission on pulse activation
- Configure shockwave particle properties
- **Test**: Chrono pulse creates particle effects

### Task 5.3: Add Particle Effects for Rewind
**Objective**: Enhance rewind visual feedback
- Create particle system for rewind
- Add particle emission during rewind
- Configure time distortion particle properties
- **Test**: Rewind creates particle effects

### Task 5.4: Implement Screen Shake on Damage
**Objective**: Add impact feedback for player damage
- Add screen shake when player takes damage
- Configure shake intensity and duration
- Add shake to camera system
- **Test**: Screen shakes when player is damaged

### Task 5.5: Implement Screen Shake on Enemy Defeat
**Objective**: Add impact feedback for enemy defeat
- Add screen shake when enemies are defeated
- Configure shake intensity and duration
- **Test**: Screen shakes when enemies are defeated

### Task 5.6: Implement Screen Shake on Level Completion
**Objective**: Add celebration feedback
- Add screen shake when level is completed
- Configure celebration shake properties
- **Test**: Screen shakes when level is completed

### Task 5.7: Add Camera Zoom Effects
**Objective**: Enhance visual presentation
- Add camera zoom on important events
- Configure zoom timing and intensity
- Add smooth zoom transitions
- **Test**: Camera zooms appropriately on events

### Task 5.8: Add Camera Pan Effects
**Objective**: Enhance visual presentation
- Add camera pan to follow important objects
- Configure pan speed and boundaries
- Add smooth pan transitions
- **Test**: Camera pans smoothly to follow objects

### Task 5.9: Add Camera Fade Transitions
**Objective**: Enhance scene transitions
- Add fade in/out effects between scenes
- Configure fade timing and color
- Add smooth fade transitions
- **Test**: Scene transitions use fade effects

### Task 5.10: Tune Player Movement Speed
**Objective**: Optimize player feel
- Adjust player horizontal movement speed
- Test different speed values
- Find optimal speed for responsiveness
- **Test**: Player movement speed feels responsive

### Task 5.11: Tune Player Jump Height
**Objective**: Optimize jump feel
- Adjust player jump velocity
- Test different jump heights
- Find optimal jump height for platforming
- **Test**: Jump height feels appropriate for platforming

### Task 5.12: Tune Dash Distance and Cooldown
**Objective**: Balance dash ability
- Adjust dash distance for tactical use
- Adjust dash cooldown for balance
- Test different values for fun factor
- **Test**: Dash feels balanced and tactical

### Task 5.13: Balance Enemy Speed and Damage
**Objective**: Create fair challenge
- Adjust enemy movement speed
- Adjust enemy damage values
- Test different values for appropriate difficulty
- **Test**: Enemies provide fair challenge

### Task 5.14: Balance Enemy Spawn Rates
**Objective**: Create appropriate enemy density
- Adjust enemy spawn timing
- Test different spawn rates
- Find optimal density for gameplay
- **Test**: Enemy density feels appropriate

### Task 5.15: Tune Enemy AI Behavior
**Objective**: Create engaging enemy behavior
- Adjust enemy patrol patterns
- Adjust enemy detection ranges
- Test different AI parameters
- **Test**: Enemy AI feels engaging

### Task 5.16: Tune Rewind Duration and Cooldown
**Objective**: Balance time rewind
- Adjust rewind duration (how far back)
- Adjust rewind cooldown
- Test different values for balance
- **Test**: Rewind feels balanced and strategic

### Task 5.17: Tune Chrono Pulse Range and Duration
**Objective**: Balance chrono pulse ability
- Adjust pulse range and freeze duration
- Adjust pulse cooldown
- Test different values for effectiveness
- **Test**: Chrono pulse feels balanced and useful

### Task 5.18: Tune Paradox Zone Effects
**Objective**: Balance paradox zone mechanics
- Adjust gravity reversal strength
- Adjust zone size and placement
- Test different effect intensities
- **Test**: Paradox zones feel balanced and interesting

### Task 5.19: Create Game Over Scene
**Objective**: Handle player death
- Create `client/src/scenes/GameOverScene.js`
- Display final score and stats
- Add restart and menu buttons
- **Test**: Game over scene appears on player death

### Task 5.20: Add Restart Functionality
**Objective**: Allow quick restart
- Add restart button to game over scene
- Reset player state and position
- Reset level state
- **Test**: Game can be restarted quickly

### Task 5.21: Create Level Completion Scene
**Objective**: Celebrate level completion
- Create level completion screen
- Display level stats and score
- Add next level transition
- **Test**: Level completion is celebrated appropriately

### Task 5.22: Implement Basic Scoring System
**Objective**: Add score tracking
- Create scoring system class
- Award points for collectibles
- Award points for speed completion
- **Test**: Score is calculated and displayed correctly

### Task 5.23: Add Object Pooling for Dash Particles
**Objective**: Optimize dash particle performance
- Create particle object pool for dash
- Reuse particle objects
- Limit active dash particle count
- **Test**: Dash particles don't impact performance

### Task 5.24: Add Object Pooling for Pulse Particles
**Objective**: Optimize pulse particle performance
- Create particle object pool for chrono pulse
- Reuse particle objects
- Limit active pulse particle count
- **Test**: Pulse particles don't impact performance

### Task 5.25: Add Object Pooling for Rewind Particles
**Objective**: Optimize rewind particle performance
- Create particle object pool for rewind
- Reuse particle objects
- Limit active rewind particle count
- **Test**: Rewind particles don't impact performance

### Task 5.26: Optimize Asset Loading
**Objective**: Improve load times
- Implement asset preloading
- Add loading progress indicators
- Optimize asset file sizes
- **Test**: Game loads quickly and smoothly

### Task 5.27: Add FPS Counter
**Objective**: Track game performance
- Add FPS display to UI
- Update FPS counter in real-time
- Display FPS in development mode
- **Test**: FPS counter displays correctly

### Task 5.28: Add Memory Usage Monitoring
**Objective**: Track memory performance
- Add memory usage display
- Monitor memory allocation
- Display memory in development mode
- **Test**: Memory monitoring displays correctly

### Task 5.29: Add Render Call Monitoring
**Objective**: Track rendering performance
- Add render call counter
- Monitor draw calls per frame
- Display render stats in development mode
- **Test**: Render monitoring displays correctly

### Task 5.30: Test on Different Screen Sizes
**Objective**: Ensure responsive design
- Test on various resolutions
- Verify UI scaling
- Check gameplay on different aspect ratios
- **Test**: Game works on different screen sizes

### Task 5.31: Fix Critical Gameplay Bugs
**Objective**: Ensure stability
- Identify and fix movement bugs
- Fix collision detection issues
- Fix state transition bugs
- **Test**: Game runs without critical errors

### Task 5.32: Optimize Render Performance
**Objective**: Ensure smooth gameplay
- Optimize sprite rendering
- Reduce unnecessary draw calls
- Implement sprite batching
- **Test**: Game maintains smooth performance

### Task 5.33: Reduce Memory Usage
**Objective**: Optimize memory efficiency
- Implement proper object cleanup
- Reduce asset memory footprint
- Optimize data structures
- **Test**: Memory usage is optimized

### Task 5.34: Ensure Consistent 60 FPS
**Objective**: Maintain smooth performance
- Profile and optimize bottlenecks
- Ensure consistent frame timing
- Test on target devices
- **Test**: Game maintains 60 FPS consistently

### Task 5.35: Validate All Player Abilities
**Objective**: Ensure all features work
- Test dash ability functionality
- Test chrono pulse functionality
- Test rewind functionality
- **Test**: All player abilities function correctly

### Task 5.36: Validate Time Mechanics
**Objective**: Ensure time systems work
- Test rewind mechanics
- Test paradox zone effects
- Test time shard collection
- **Test**: All time mechanics function correctly

### Task 5.37: Validate Level Progression
**Objective**: Ensure progression works
- Test level completion detection
- Test level transitions
- Test shard-based progression
- **Test**: Level progression works correctly

### Task 5.38: Create Final MVP Demo Level
**Objective**: Showcase all features
- Design comprehensive demo level
- Include all mechanics and features
- Ensure 10-15 minute gameplay
- **Test**: Demo level showcases MVP effectively

### Task 5.39: Add Error Handling to Critical Systems
**Objective**: Ensure robust error handling
- Add try-catch blocks to TimeManager
- Add error handling to InputManager
- Add error handling to CollisionManager
- **Test**: Game handles errors gracefully

### Task 5.40: Add Error Logging System
**Objective**: Track and log errors
- Create error logging utility
- Log errors to console and file
- Add error reporting system
- **Test**: Errors are properly logged

### Task 5.41: Add Graceful Degradation
**Objective**: Handle system failures
- Add fallback for missing assets
- Add fallback for failed systems
- Add graceful error recovery
- **Test**: Game degrades gracefully on failures

### Task 5.42: Test Complete Game Flow
**Objective**: Ensure end-to-end functionality
- Test complete game flow from menu to completion
- Verify all scene transitions work
- Test all input combinations
- **Test**: Complete game experience works end-to-end

### Task 5.43: Validate Scene Transitions
**Objective**: Ensure smooth scene flow
- Test all scene transitions
- Verify transition effects work
- Test transition timing
- **Test**: All scene transitions work smoothly

### Task 5.44: Test All Input Combinations
**Objective**: Ensure input reliability
- Test all keyboard input combinations
- Verify input priority and conflicts
- Test input during different states
- **Test**: All input combinations work correctly

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