# Time Oddity MVP: Phased Development Plan

## Overview

This document outlines a phased approach to building the minimum viable product (MVP) for "Time Oddity." The plan prioritizes core gameplay mechanics and minimum playability while leveraging the Kenney platformer assets. Each phase builds upon the previous one, ensuring a solid foundation for the full game.

## Phase 1: Foundation & Core Setup (Week 1)

### Objective
Establish the basic project structure, development environment, and core game engine setup.

### Deliverables
- [ ] **Project Structure Setup**
  - Initialize Node.js project with proper package.json
  - Set up Vite build pipeline with development server
  - Configure Phaser 3.90.0 as the game engine
  - Disable Phaser's audio system (will use Howler.js)
  - Set up basic HTML template with game container

- [ ] **Core Scene Architecture**
  - Create `BaseScene` abstract class
  - Implement `BootScene` for asset loading
  - Implement `MenuScene` for game start
  - Implement basic `GameScene` structure
  - Set up scene management and transitions

- [ ] **Asset Integration**
  - Load and configure Kenney platformer spritesheets
  - Set up texture atlases for characters, tiles, and enemies
  - Configure sprite animations (idle, walk, jump, fall)
  - Load basic tilemap assets for level creation

- [ ] **Basic Physics Setup**
  - Configure Arcade Physics with gravity
  - Set up collision detection system
  - Create basic platform groups
  - Implement world boundaries

### Success Criteria
- Game loads and displays a functional menu
- Scene transitions work smoothly
- Assets load without errors
- Basic physics system is functional

---

## Phase 2: Player Character & Basic Movement (Week 2)

### Objective
Implement the core player character (Echo) with basic platformer movement mechanics.

### Deliverables
- [ ] **Player Character Implementation**
  - Create `Player` class extending `Entity`
  - Implement basic sprite with Kenney character assets
  - Set up physics body with proper collision bounds
  - Configure character animations (idle, walk, jump, fall)

- [ ] **State Machine System**
  - Create `StateMachine` class
  - Implement player states: `IdleState`, `RunState`, `JumpState`, `FallState`
  - Set up state transitions based on input and physics
  - Ensure smooth state changes with proper animations

- [ ] **Input System**
  - Implement `InputManager` class
  - Set up keyboard controls (arrow keys/WASD)
  - Handle basic movement (left/right)
  - Implement jumping with variable height
  - Add basic input validation and debouncing

- [ ] **Basic Level Design**
  - Create simple test level using Kenney tile assets
  - Implement basic platforms and ground
  - Add some collectible coins for testing
  - Ensure proper collision detection

### Success Criteria
- Player character moves smoothly with animations
- Jumping feels responsive and has variable height
- Character states transition correctly
- Basic level is playable with collision detection

---

## Phase 3: Core Gameplay Mechanics (Week 3)

### Objective
Implement the signature time manipulation mechanics that define Time Oddity.

### Deliverables
- [ ] **Time Manager System**
  - Create `TimeManager` class for time manipulation
  - Implement `TemporalState` object for recording game state
  - Set up circular buffer for storing historical states
  - Create registration system for rewindable objects

- [ ] **Time Rewind Mechanic**
  - Implement basic rewind functionality (keyboard trigger)
  - Record player position and velocity over time
  - Apply rewind effect to player character
  - Add visual feedback during rewind (particle effects, screen effects)

- [ ] **Phase Dash Ability**
  - Implement short-range teleportation
  - Add ghost trail effect using GSAP
  - Create dash cooldown system
  - Add visual and audio feedback

- [ ] **Chrono Pulse Ability**
  - Implement time freeze shockwave
  - Add visual effect for frozen enemies/objects
  - Create 1.5-second freeze duration
  - Add cooldown management

- [ ] **Basic Enemy Implementation**
  - Create `Enemy` base class
  - Implement `LoopHound` enemy with basic AI
  - Add enemy-player collision detection
  - Implement enemy respawn system

### Success Criteria
- Time rewind works smoothly with visual feedback
- Phase dash provides tactical movement options
- Chrono pulse freezes enemies effectively
- Basic enemy encounters are functional

---

## Phase 4: Level Design & Progression (Week 4)

### Objective
Create engaging levels that showcase the time mechanics and provide clear progression.

### Deliverables
- [ ] **Level Design System**
  - Create modular level building system
  - Design 3-5 distinct levels with increasing complexity
  - Implement level loading and transitions
  - Add level completion detection

- [ ] **Time Shard Collection**
  - Implement `TimeShard` collectible class
  - Add collection mechanics with visual/audio feedback
  - Create shard counter in UI
  - Implement shard-based progression system

- [ ] **Paradox Zone Implementation**
  - Create basic paradox zone detection
  - Implement one time rule (e.g., reverse gravity)
  - Add visual indicators for paradox zones
  - Create zone entry/exit effects

- [ ] **Basic UI System**
  - Create `UIScene` for HUD overlay
  - Implement health bar display
  - Add time shard counter
  - Create ability cooldown indicators
  - Add basic pause menu

- [ ] **Audio Integration**
  - Set up Howler.js audio manager
  - Add basic sound effects (jump, collect, dash)
  - Implement background music system
  - Add audio controls and volume management

### Success Criteria
- Multiple levels provide varied gameplay experiences
- Time shards create clear progression goals
- Paradox zones add strategic depth
- UI provides clear feedback to player
- Audio enhances the gaming experience

---

## Phase 5: Polish & MVP Completion (Week 5)

### Objective
Polish the core experience and ensure the MVP is fully playable and engaging.

### Deliverables
- [ ] **Visual Polish**
  - Implement particle effects for abilities
  - Add screen shake and camera effects
  - Create smooth transitions between scenes
  - Add visual feedback for all player actions

- [ ] **Game Balance & Feel**
  - Tune player movement and physics
  - Balance enemy difficulty and placement
  - Adjust time rewind duration and cooldowns
  - Fine-tune ability cooldowns and effects

- [ ] **Level Completion & Restart**
  - Implement game over screen
  - Add restart functionality
  - Create level completion celebrations
  - Add basic scoring system

- [ ] **Performance Optimization**
  - Implement object pooling for frequently created objects
  - Optimize asset loading and memory usage
  - Ensure consistent 60 FPS performance
  - Add basic performance monitoring

- [ ] **Bug Fixes & Testing**
  - Fix any critical gameplay bugs
  - Test on different screen sizes
  - Ensure smooth performance on target devices
  - Validate all core mechanics work as intended

### Success Criteria
- Game feels polished and responsive
- All core mechanics work reliably
- Performance is consistent across devices
- MVP provides 10-15 minutes of engaging gameplay

---

## Technical Implementation Notes

### Asset Usage Strategy
- **Characters**: Use Kenney's character sprites for Echo (beige character as default)
- **Tiles**: Leverage Kenney's tile sets for level construction
- **Enemies**: Use Kenney's enemy sprites for LoopHounds and other enemies
- **UI**: Create simple UI elements using Kenney's HUD assets
- **Audio**: Use Kenney's sound effects for basic interactions

### Architecture Compliance
- Follow the modular scene architecture from the documentation
- Implement the state machine pattern for player control
- Use the event-driven communication system between scenes
- Maintain separation between game logic and UI
- Follow the time management patterns for rewind mechanics

### Development Priorities
1. **Core Gameplay First**: Focus on making the basic platformer feel good before adding time mechanics
2. **Iterative Development**: Build and test each phase thoroughly before moving to the next
3. **Asset Integration**: Use Kenney assets as-is initially, optimize later if needed
4. **Performance**: Monitor performance from the start, especially with time rewind mechanics

### Success Metrics
- **Playability**: Player can complete all levels without game-breaking bugs
- **Engagement**: Core mechanics feel satisfying and encourage experimentation
- **Performance**: Consistent 60 FPS on target devices
- **Polish**: Visual and audio feedback enhances the experience
- **Foundation**: Codebase is clean and extensible for future development

---

## Post-MVP Considerations

After completing the MVP, the following features can be added in future phases:
- Additional paradox zone types and time rules
- More complex enemy AI and boss encounters
- Expanded level design with multiple paths
- Memory reconstruction system
- Multiplayer functionality
- Advanced visual effects and shaders
- Mobile touch controls
- Save/load system
- Achievement system

This phased approach ensures a solid foundation while delivering a playable, engaging experience that showcases the unique time manipulation mechanics of Time Oddity. 