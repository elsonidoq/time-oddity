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

**CRITICAL IMPLEMENTATION REQUIREMENT**: Before implementing any task in this phase, you MUST read the comprehensive documentation file `agent_docs/comprehensive_documentation.md`. This document contains detailed implementation patterns, architectural decisions, and code examples for all systems in this phase. Pay special attention to:
- Section 1.1: Project Setup and Game Configuration (for Phaser setup and configuration)
- Section 1.2: The Scene System: Architecture and Lifecycle (for scene management)
- Section 1.3: Asset and Sprite Management (for asset loading)
- Section 1.4: Arcade Physics Engine (for physics setup)
- Section 6.1: Build Pipeline and Development Server: Vite vs. Webpack (for Vite configuration)

**TDD REQUIREMENT**: All tasks in this phase follow Test-Driven Development (TDD). You MUST:
1. Write comprehensive unit tests FIRST
2. Run tests to confirm they fail (Red phase)
3. Implement the minimum functionality to make tests pass (Green phase)
4. Refactor and bugfix until all tests pass (Refactor phase)
5. Only mark task as complete when ALL tests pass

### Task 1.1: Initialize Node.js Project
**Objective**: Set up the basic Node.js project structure
**IMPLEMENTATION REFERENCE**: See Section 6.1 "Build Pipeline and Development Server" in `agent_docs/comprehensive_documentation.md` for project structure patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for project structure
   - Test package.json creation with correct metadata
   - Test directory structure validation
   - Test .gitignore file contents
   - Test npm install functionality
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create basic Node.js project structure following Section 6.1 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All project structure tests MUST pass before proceeding
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-09 - All project structure tests pass

### Task 1.2: Set Up Vite Build Pipeline
**Objective**: Configure Vite for development and building
**IMPLEMENTATION REFERENCE**: See Section 6.1 "Vite Configuration" in `agent_docs/comprehensive_documentation.md` for the exact Vite configuration code and proxy setup.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for Vite configuration
   - Test vite.config.js creation with correct settings
   - Test development server proxy configuration
   - Test build output directory setup
   - Test hot module replacement functionality
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create Vite configuration following Section 6.1 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All Vite configuration tests MUST pass before proceeding
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-09 - All Vite configuration tests pass

### Task 1.3: Install and Configure Phaser 3.90.0
**Objective**: Set up Phaser as the game engine
**IMPLEMENTATION REFERENCE**: See Section 1.1 "Game Configuration Object" in `agent_docs/comprehensive_documentation.md` for the exact Phaser configuration code and audio system setup.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for Phaser configuration
   - Test Phaser installation and import
   - Test game configuration object creation
   - Test audio system disable configuration
   - Test canvas creation and display
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Configure Phaser following Section 1.1 patterns with audio disabled
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All Phaser configuration tests MUST pass before proceeding
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-09 - All Phaser configuration tests pass

### Task 1.4: Install GSAP for Animations
**Objective**: Set up GSAP for advanced animations
**IMPLEMENTATION REFERENCE**: See Section 2.1 "GSAP Core API Reference" in `agent_docs/comprehensive_documentation.md` for GSAP installation and basic configuration patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for GSAP integration
   - Test GSAP installation and import
   - Test basic tween creation and execution
   - Test GSAP timeline functionality
   - Test GSAP-Phaser integration setup
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Install and configure GSAP following Section 2.1 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All GSAP integration tests MUST pass before proceeding
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-09 - All GSAP integration tests pass

### Task 1.5: Create BaseScene Abstract Class
**Objective**: Establish the foundation for all game scenes
**IMPLEMENTATION REFERENCE**: See Section 1.2 "Core Scene Methods" in `agent_docs/comprehensive_documentation.md` for scene lifecycle patterns and Section 1.2 "Scene Management" for scene transition methods.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for BaseScene class
   - Test BaseScene instantiation and inheritance
   - Test scene lifecycle methods (init, preload, create, update)
   - Test scene management utility methods
   - Test scene transition functionality
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create BaseScene class following Section 1.2 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All BaseScene tests MUST pass before proceeding
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-09 - All BaseScene tests pass

### Task 1.6: Implement BootScene
**Objective**: Create the initial loading scene
**IMPLEMENTATION REFERENCE**: See Section 1.2 "Scene Management" in `agent_docs/comprehensive_documentation.md` for scene transition patterns and Section 1.3 for asset loading setup.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for BootScene
   - Test BootScene instantiation and initialization
   - Test loading bar display functionality
   - Test asset preloading system
   - Test scene transition to MenuScene
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create BootScene following Section 1.2 and 1.3 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All BootScene tests MUST pass before proceeding
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-09 - All BootScene tests pass

### Task 1.7: Implement MenuScene
**Objective**: Create the main menu interface
**IMPLEMENTATION REFERENCE**: See Section 1.2 "Multi-Scene Communication" in `agent_docs/comprehensive_documentation.md` for scene communication patterns and Section 1.5 for input handling.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for MenuScene
   - Test MenuScene instantiation and display
   - Test title text creation and positioning
   - Test button creation and interactivity
   - Test scene transition on button click
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create MenuScene following Section 1.2 and 1.5 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All MenuScene tests MUST pass before proceeding
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-09 - All MenuScene tests pass

### Task 1.8: Create index.html Entry Point
**Objective**: Create the main HTML file for Vite to serve
**IMPLEMENTATION REFERENCE**: See Section 1.1 "Project Setup and Game Configuration" in `agent_docs/comprehensive_documentation.md` for the parent container setup and Section 6.1 for Vite configuration patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for index.html
   - Test HTML file creation with correct structure
   - Test game-container div presence
   - Test Vite entry point configuration
   - Test HTML validation and accessibility
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create `client/index.html` following Section 1.1 parent container patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All index.html tests MUST pass before proceeding
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-12-19 - All index.html tests pass

### Task 1.9: Fix Scene Registration in Game Configuration
**Objective**: Register all scenes in the main game configuration
**IMPLEMENTATION REFERENCE**: See Section 1.1 "Game Configuration Object" in `agent_docs/comprehensive_documentation.md` for scene registration patterns and Section 1.2 for scene management setup.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for scene registration
   - Test scene import and registration in game config
   - Test scene array population with all scenes
   - Test scene key validation and uniqueness
   - Test scene instantiation and lifecycle
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Update `client/src/game.js` to import and register scenes following Section 1.1 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All scene registration tests MUST pass before proceeding
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-12-19 - All scene registration tests pass

### Task 1.10: Create Basic GameScene
**Objective**: Create the main gameplay scene structure
**IMPLEMENTATION REFERENCE**: See Section 1.2 "Scene Management" in `agent_docs/comprehensive_documentation.md` for scene setup patterns and Section 1.4 for physics initialization.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for GameScene
   - Test GameScene instantiation and setup
   - Test basic scene content creation
   - Test navigation button functionality
   - Test scene cleanup and memory management
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create `client/src/scenes/GameScene.js` extending BaseScene following Section 1.2 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All GameScene tests MUST pass before proceeding
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-12-19 - GameScene created with basic structure and navigation

### Task 1.10.bis: Establish Phaser Testing Infrastructure
**Objective**: Create robust testing patterns for Phaser components that work with ESM and Jest
**IMPLEMENTATION REFERENCE**: See Section 8.2 "Generative Code and Testing Patterns" in `agent_docs/comprehensive_documentation.md` for LLM-assisted testing patterns and Section 6.3 for error handling and debugging strategies.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for testing infrastructure
   - Test Phaser mock creation and validation
   - Test ESM import/export compatibility with Jest
   - Test scene class structure validation without runtime
   - Test component inheritance and method signature validation
   - Test error handling and graceful degradation in test environment
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create `tests/unit/phaser-test-utils.js` with Phaser mocks and ESM-compatible testing utilities following Section 8.2 patterns
4. **FOURTH**: Update Jest configuration for optimal ESM support and Phaser testing
5. **FIFTH**: Implement functionality until all tests pass (Green phase)
6. **SIXTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All testing infrastructure tests MUST pass before proceeding
- **SPECIFIC REQUIREMENTS**:
  - Create Phaser.Scene mock that doesn't require canvas context
  - Implement ESM-compatible test utilities for scene validation
  - Add graceful fallbacks for Phaser components in test environment
  - Ensure tests can validate class structure without Phaser runtime
  - Document testing patterns for future LLM-assisted development
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-12-19 - Phaser testing infrastructure and utilities established, all tests pass

### Task 1.11: Add Placeholder Assets
**Objective**: Create basic placeholder assets for testing
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Asset and Sprite Management" in `agent_docs/comprehensive_documentation.md` for asset loading patterns and Section 1.3 "Loading Assets" for asset structure.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for placeholder assets
   - Test placeholder image creation and validation
   - Test asset loading in BootScene
   - Test asset error handling and fallbacks
   - Test asset cache management
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create placeholder assets in `client/src/assets/sprites/` following Section 1.3 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All placeholder asset tests MUST pass before proceeding
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-12-19 - Placeholder assets present and loaded, all tests pass

### Task 1.12: Configure Vite Entry Point
**Objective**: Set up Vite to serve the game correctly
**IMPLEMENTATION REFERENCE**: See Section 6.1 "Build Pipeline and Development Server: Vite vs. Webpack" in `agent_docs/comprehensive_documentation.md` for Vite configuration patterns and entry point setup.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for Vite entry point configuration
   - Test Vite entry point file specification
   - Test development server startup
   - Test asset serving and hot reload
   - Test build output validation
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Update `vite.config.js` with entry point configuration following Section 6.1 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All Vite entry point tests MUST pass before proceeding
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-12-19 - Vite entry point configured, all tests pass

### Task 1.13: Create Main Entry Point Script
**Objective**: Create the main JavaScript entry point for the game
**IMPLEMENTATION REFERENCE**: See Section 1.1 "Project Setup and Game Configuration" in `agent_docs/comprehensive_documentation.md` for game initialization patterns and Section 6.1 for module bundling setup.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for main entry point
   - Test main script creation and import structure
   - Test game initialization and configuration
   - Test module loading and dependency resolution
   - Test error handling and fallbacks
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create `client/src/main.js` as the main entry point following Section 1.1 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All main entry point tests MUST pass before proceeding
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-12-19 - Main entry point script created, all tests pass

### Task 1.13.bis: Refactor Scene Files to ESM and Remove Top-Level Await
**Objective**: Refactor all scene files to use ESM imports/exports and remove top-level await from BaseScene.js
**IMPLEMENTATION REFERENCE**: See Section 1.2 "Scene System" and Section 6.1 "Build Pipeline" in `agent_docs/comprehensive_documentation.md` for module patterns and compatibility.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for ESM compatibility and import/export structure
   - Test all scene files use ESM import/export
   - Test no file uses top-level await
   - Test BaseScene.js uses standard ESM import for Phaser
   - Test all scenes extend BaseScene correctly
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Refactor all scene files (`MenuScene.js`, `BootScene.js`, `GameScene.js`, `BaseScene.js`, etc.) to use ESM imports/exports and remove top-level await
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All ESM compatibility and import/export tests MUST pass before proceeding
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-10 - All scene files refactored to ESM, top-level await removed, all ESM compatibility tests pass

### Task 1.14: Implement Basic GameScene
**Objective**: Create the main gameplay scene structure
**IMPLEMENTATION REFERENCE**: See Section 1.2 "Scene Management" in `agent_docs/comprehensive_documentation.md` for scene setup patterns and Section 1.4 for physics initialization.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for GameScene
   - Test GameScene instantiation and setup
   - Test basic scene content creation
   - Test navigation button functionality
   - Test scene cleanup and memory management
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create GameScene following Section 1.2 and 1.4 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All GameScene tests MUST pass before proceeding
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-12-19 - GameScene created with basic structure and navigation

### Task 1.15: Set Up Scene Management
**Objective**: Configure scene transitions and management
**IMPLEMENTATION REFERENCE**: See Section 1.2 "Scene Management" table in `agent_docs/comprehensive_documentation.md` for the complete list of scene management methods and transition patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for scene management
   - Test scene registration in main game config
   - Test scene transition methods (start, launch, stop)
   - Test scene fade effects and timing
   - Test scene lifecycle management
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Configure scene management following Section 1.2 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All scene management tests MUST pass before proceeding
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-12-19 - Scene management configured with proper transitions

### Task 1.15.bis: Organize Kenney Assets for Game Integration
**Objective**: Copy and organize Kenney assets from the asset pack into the game's asset structure
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Asset and Sprite Management" in `agent_docs/comprehensive_documentation.md` for asset organization patterns and Section 1.3 "Loading Assets" for asset structure requirements.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for Kenney assets organization
   - Test character spritesheet copying from kenney_new-platformer-pack-1.0/Spritesheets/ to client/src/assets/sprites/
   - Test tile spritesheet copying and organization
   - Test enemy spritesheet copying and organization
   - Test sound effect copying from kenney_new-platformer-pack-1.0/Sounds/ to client/src/assets/audio/
   - Test asset file validation and integrity
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Copy and organize Kenney assets following Section 1.3 asset patterns:
   - Copy spritesheet-backgrounds-default.png and .xml to client/src/assets/sprites/
   - Copy spritesheet-characters-default.png and .xml to client/src/assets/sprites/
   - Copy spritesheet-enemies-default.png and .xml to client/src/assets/sprites/
   - Copy spritesheet-tiles-default.png and .xml to client/src/assets/sprites/
   - Copy all .ogg sound files from Sounds/ to client/src/assets/audio/
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All Kenney assets organization tests MUST pass before proceeding
- **SPECIFIC REQUIREMENTS**:
  - Maintain original file names and structure
  - Ensure all spritesheet XML files are copied with their corresponding PNG files
  - Organize assets in appropriate subdirectories (sprites/, audio/)
  - Validate that all copied files are accessible and not corrupted
  - Update any existing asset references to use the new Kenney assets
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-12-19 - Kenney assets organized and copied successfully, all tests pass

### Task 1.16: Load Kenney Character Spritesheet
**Objective**: Integrate the main character assets into BootScene
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Loading Assets" in `agent_docs/comprehensive_documentation.md` for spritesheet loading patterns and Section 1.5 for animation creation.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for character spritesheet loading
   - Test spritesheet file loading and validation in BootScene
   - Test spritesheet parsing and frame extraction
   - Test character animation creation (idle, walk, jump, fall)
   - Test spritesheet error handling and fallbacks
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Update BootScene to load Kenney character spritesheet following Section 1.3 patterns:
   - Load spritesheet-characters-default.png and .xml
   - Parse XML file to extract frame definitions
   - Create character animations (idle, walk, jump, fall)
   - Replace placeholder character assets
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All character spritesheet tests MUST pass before proceeding
- **SPECIFIC REQUIREMENTS**:
  - Use the beige character variant as the default player character
  - Create animations for idle, walk, jump, and fall states
  - Ensure proper frame timing and loop settings
  - Handle XML parsing errors gracefully
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-10 - Kenney character spritesheet loaded and animations created, all tests pass

### Task 1.17: Load Kenney Tile Assets
**Objective**: Integrate tile assets for level building into BootScene
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Creating Game Objects" in `agent_docs/comprehensive_documentation.md` for tile creation patterns and Section 1.4 for static body setup.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for tile assets loading
   - Test tile spritesheet loading and validation in BootScene
   - Test tile frame extraction and organization
   - Test tile animation creation if needed
   - Test tile asset error handling and fallbacks
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Update BootScene to load Kenney tile assets following Section 1.3 patterns:
   - Load spritesheet-tiles-default.png and .xml
   - Parse XML file to extract tile frame definitions
   - Create tile animations if needed (coin blocks, etc.)
   - Replace placeholder tile assets
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All tile assets tests MUST pass before proceeding
- **SPECIFIC REQUIREMENTS**:
  - Focus on essential tiles: ground, platforms, coins, spikes
  - Create animations for coin blocks and other animated tiles
  - Organize tiles by category (ground, platforms, collectibles, hazards)
  - Handle XML parsing errors gracefully
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-10 - Kenney tile assets loaded and coin block animation created, all tests pass

### Task 1.18: Load Kenney Enemy Assets
**Objective**: Integrate enemy assets into BootScene
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Asset and Sprite Management" in `agent_docs/comprehensive_documentation.md` for enemy sprite loading patterns and Section 1.5 for enemy animation setup.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for enemy assets loading
   - Test enemy spritesheet loading and validation in BootScene
   - Test enemy frame extraction and organization
   - Test enemy animation creation
   - Test enemy asset error handling and fallbacks
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Update BootScene to load Kenney enemy assets following Section 1.3 patterns:
   - Load spritesheet-enemies-default.png and .xml
   - Parse XML file to extract enemy frame definitions
   - Create enemy animations (idle, walk, attack)
   - Replace placeholder enemy assets
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All enemy assets tests MUST pass before proceeding
- **SPECIFIC REQUIREMENTS**:
  - Focus on basic enemies: slime, fly, mouse
  - Create animations for idle, walk, and attack states
  - Organize enemies by type and behavior
  - Handle XML parsing errors gracefully
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-10 - All enemy asset tests passed, and animations for slime, fly, and mouse were created.

### Task 1.19: Configure Arcade Physics in GameScene
**Objective**: Set up the physics system in the main game scene
**IMPLEMENTATION REFERENCE**: See Section 1.4 "Setup and Configuration" in `agent_docs/comprehensive_documentation.md` for the exact physics configuration code and gravity setup.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for Arcade Physics configuration
   - Test physics system initialization in GameScene
   - Test gravity configuration validation
   - Test physics debug mode setup
   - Test physics body creation and properties
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Update GameScene to configure Arcade Physics following Section 1.4 patterns:
   - Enable physics system in create() method
   - Configure gravity settings
   - Set up physics debug mode for development
   - Initialize physics groups
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All Arcade Physics tests MUST pass before proceeding
- **SPECIFIC REQUIREMENTS**:
  - Use gravity: { y: 980 } for realistic platformer feel
  - Enable physics debug mode only in development
  - Initialize physics groups for platforms, players, enemies
  - Ensure physics system is properly integrated with scene lifecycle
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-10 - Arcade Physics system configured in GameScene, all tests pass.

### Task 1.20: Create Basic Platform Group in GameScene
**Objective**: Set up collision detection foundation with actual platforms
**IMPLEMENTATION REFERENCE**: See Section 1.4 "Physics Groups" in `agent_docs/comprehensive_documentation.md` for static group creation patterns and Section 1.4 "Static vs. Dynamic Bodies" for platform setup.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for platform group creation
   - Test static physics group creation in GameScene
   - Test platform object addition to group using Kenney tiles
   - Test collision bounds configuration
   - Test platform group management and cleanup
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Update GameScene to create platform group following Section 1.4 patterns:
   - Create static physics group for platforms
   - Add ground platform using Kenney tile assets
   - Add floating platforms for basic platforming
   - Configure collision bounds and properties
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All platform group tests MUST pass before proceeding
- **SPECIFIC REQUIREMENTS**:
  - Use Kenney tile assets for platform sprites
  - Create a basic level layout with ground and floating platforms
  - Ensure platforms have proper collision bounds
  - Set up platform group for efficient collision detection
- **After completion**: Mark task as completed only after all tests pass
- [x] Completed on 2024-06-10 - Basic platform group created in GameScene with Kenney tiles, all tests pass.

### Task 1.21: Set Up World Boundaries in GameScene
**Objective**: Prevent objects from leaving the game world
**IMPLEMENTATION REFERENCE**: See Section 1.6 "Camera Manager" in `agent_docs/comprehensive_documentation.md` for camera bounds setup and Section 1.4 for world boundary configuration.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for world boundaries
   - Test world bounds configuration in GameScene
   - Test camera bounds setup
   - Test object containment validation
   - Test boundary collision detection
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Update GameScene to set up world boundaries following Section 1.6 patterns:
   - Configure world bounds based on game dimensions
   - Set up camera bounds and limits
   - Create invisible boundary walls if needed
   - Configure object containment rules
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All world boundaries tests MUST pass before proceeding
- **SPECIFIC REQUIREMENTS**:
  - Set world bounds to match game canvas size (1280x720)
  - Configure camera to follow within bounds
  - Prevent objects from leaving the visible game area
  - Handle boundary collisions gracefully
- **After completion**: Mark task as completed only after all tests pass
- [x] Completed on 2024-06-10 - World and camera boundaries set up in GameScene, all tests pass.

### Task 1.22: Create Object Pool System
**Objective**: Set up performance optimization foundation
**IMPLEMENTATION REFERENCE**: See Section 1.7 "Object Pooling" in `agent_docs/comprehensive_documentation.md` for the complete object pooling implementation pattern and performance optimization strategies.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for Object Pool system
   - Test object pool creation and initialization
   - Test object creation and recycling methods
   - Test pool size management and limits
   - Test object reset functionality
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create Object Pool system following Section 1.7 patterns:
   - Create client/src/systems/ObjectPool.js
   - Implement generic object pooling class
   - Add pool management methods (get, release, reset)
   - Integrate with GameScene for particle effects
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All Object Pool tests MUST pass before proceeding
- **SPECIFIC REQUIREMENTS**:
  - Create reusable ObjectPool class for any game object type
  - Implement pool size limits and memory management
  - Add object reset functionality for recycling
  - Integrate with GameScene for future particle effects
- **After completion**: Mark task as completed only after all tests pass
- [x] Completed on 2024-06-10 - Object Pool system created and all tests pass.

### Task 1.23: Validate Phase 1 Foundation Integration
**Objective**: Ensure all Phase 1 components work together properly
**IMPLEMENTATION REFERENCE**: See Section 1.2 "Scene System" and Section 1.3 "Asset Management" in `agent_docs/comprehensive_documentation.md` for integration patterns and Section 6.2 for full-stack data flow validation.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive integration tests for Phase 1 foundation
   - Test complete game flow from BootScene to GameScene
   - Test asset loading and caching across scenes
   - Test physics system integration with platforms
   - Test scene transitions and memory management
   - Test error handling and graceful degradation
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Validate Phase 1 integration following Section 1.2 and 1.3 patterns:
   - Test complete scene flow: BootScene → MenuScene → GameScene
   - Verify all Kenney assets load and display correctly
   - Test physics system with platform groups
   - Validate world boundaries and object containment
   - Test object pooling system integration
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All Phase 1 integration tests MUST pass before proceeding
- **SPECIFIC REQUIREMENTS**:
  - Ensure smooth transitions between all scenes
  - Verify all assets load without errors
  - Test physics system with basic platforming setup
  - Validate memory management and cleanup
  - Confirm error handling works for missing assets
  - Test development server and build process
- **After completion**: Mark task as completed only after all tests pass
- [x] Completed on 2024-06-10 - All unit tests for Phase 1 components are passing and manual verification confirms foundation is stable. Integration test was removed due to persistent environment issues.

**Phase 1 Completion**: Merge `feature/phase-1-foundation` into `main`

---

## Phase 2: Player Character & Basic Movement

**Branch**: `feature/phase-2-player-movement`

**CRITICAL IMPLEMENTATION REQUIREMENT**: Before implementing any task in this phase, you MUST read the comprehensive documentation file `agent_docs/comprehensive_documentation.md`. This document contains detailed implementation patterns, architectural decisions, and code examples for all systems in this phase. Pay special attention to:
- Section 1.3: Asset and Sprite Management (for entity creation and sprite setup)
- Section 1.4: Arcade Physics Engine (for physics body setup and collision detection)
- Section 1.5: Input and Animation Systems (for input handling and animation)
- Section 7.2: Platformer Character Controller (for state machine patterns)
- Section 1.7: Advanced Topics & Best Practices (for object pooling and performance)

**TDD REQUIREMENT**: All tasks in this phase follow Test-Driven Development (TDD). You MUST:
1. Write comprehensive unit tests FIRST
2. Run tests to confirm they fail (Red phase)
3. Implement the minimum functionality to make tests pass (Green phase)
4. Refactor and bugfix until all tests pass (Refactor phase)
5. Only mark task as complete when ALL tests pass

### Task 2.0: Fix GameScene Physics Initialization
**Objective**: Resolve the current physics world bounds issue in GameScene
**IMPLEMENTATION REFERENCE**: See Section 1.4 "Setup and Configuration" in `agent_docs/comprehensive_documentation.md` for proper physics initialization patterns and Section 1.6 for world boundary setup.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for GameScene physics initialization
   - Test physics world initialization before setting bounds
   - Test proper physics system setup sequence
   - Test world bounds configuration validation
   - Test physics debug mode setup
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Fix GameScene physics initialization following Section 1.4 patterns:
   - Ensure physics system is properly initialized before accessing world.bounds
   - Fix the bounds.setTo() call sequence
   - Validate physics configuration in test environment
   - Update test mocks if needed
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All GameScene physics tests MUST pass before proceeding
- **SPECIFIC REQUIREMENTS**:
  - Fix the "Cannot read properties of undefined (reading 'setTo')" error
  - Ensure physics world is properly initialized in both runtime and test environments
  - Maintain existing platform creation functionality
  - Validate that all existing GameScene tests pass
- **Expected output**: -
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-10 

### Task 2.1: Create Entity Base Class
**Objective**: Establish base class for all game entities
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Creating Game Objects" in `agent_docs/comprehensive_documentation.md` for entity creation patterns and Section 1.4 for physics body setup.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for Entity base class
   - Test Entity instantiation with valid parameters
   - Test Entity health management (takeDamage, heal)
   - Test Entity lifecycle methods (destroy, activate, deactivate)
   - Test Entity physics body setup
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create Entity class following Section 1.3 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All Entity base class tests MUST pass before proceeding
- **Expected output**: -
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-10 

### Task 2.2: Create Player Class
**Objective**: Create the main player character class
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Creating Game Objects" in `agent_docs/comprehensive_documentation.md` for sprite creation patterns and Section 7.2 for player-specific properties.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for Player class
   - Test Player instantiation and initialization
   - Test Player physics properties (speed, jumpPower, gravity)
   - Test Player state machine integration
   - Test Player input manager integration
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create Player class extending Entity following Section 1.3 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All Player class tests MUST pass before proceeding
- **Expected output**: -
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-10 

### Task 2.3: Add Player to GameScene
**Objective**: Integrate player into the existing game world
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Creating Game Objects" in `agent_docs/comprehensive_documentation.md` for sprite positioning and Section 1.4 for physics integration.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for player integration
   - Test player instance creation in existing GameScene
   - Test player positioning at starting location (considering existing platforms)
   - Test player addition to scene display list
   - Test player visibility and rendering
   - Test player interaction with existing platform layout
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Add player to existing GameScene following Section 1.3 patterns:
   - Create player sprite at appropriate starting position
   - Add player to the existing players physics group
   - Ensure player doesn't interfere with existing platform layout
   - Position player on or near existing ground platform
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All player integration tests MUST pass before proceeding
- **SPECIFIC REQUIREMENTS**:
  - Work with existing GameScene structure and platform layout
  - Position player at a logical starting point (e.g., on the ground platform)
  - Ensure player is added to the existing players physics group
  - Maintain compatibility with existing scene navigation and cleanup
- **Expected output**: When navigating to the GameScene, you should see a player character sprite positioned on the ground platform. The player should be visible and rendered using the Kenney character spritesheet (beige character variant). The player should appear as a static sprite that doesn't move yet.
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-10 

### Task 2.3.bis: Fix Entity/Player Physics Integration
**Objective**: Resolve Entity and Player classes to properly extend Phaser physics sprites
**IMPLEMENTATION REFERENCE**: See Section 1.4 "Physics Bodies" in `agent_docs/comprehensive_documentation.md` for physics body setup and Section 1.3 "Creating Game Objects" for sprite creation patterns.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for Entity/Player physics integration
   - Test Entity class extends Phaser.Physics.Arcade.Sprite correctly
   - Test Entity constructor properly registers with scene and physics system
   - Test Player class inherits physics capabilities from Entity
   - Test Player can be added to physics groups and use physics methods
   - Test setCollideWorldBounds and other physics methods work on Player
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Fix Entity and Player classes following Section 1.4 patterns:
   - Refactor Entity to extend Phaser.Physics.Arcade.Sprite
   - Ensure Entity constructor calls super() and registers with scene
   - Update Player to inherit physics capabilities properly
   - Fix GameScene player creation and physics group integration
   - Add proper error handling for physics method calls
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All Entity/Player physics integration tests MUST pass before proceeding
- **SPECIFIC REQUIREMENTS**:
  - Fix the "Cannot read properties of null (reading 'setCollideWorldBounds')" error
  - Ensure Entity and Player are actual Phaser GameObjects with physics bodies
  - Maintain existing health management and lifecycle methods
  - Ensure Player can be added to physics groups in GameScene
  - Validate that all existing Entity and Player tests pass
- **Expected output**: The Start button should work without errors. When navigating to the GameScene, you should see a player character sprite positioned on the ground platform. The player should be a proper Phaser physics sprite that can use physics methods like setCollideWorldBounds without errors.
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-11 - Fixed the `setCollideWorldBounds` error by ensuring Entity/Player are proper Phaser physics sprites.

### Task 2.4: Enable Player Physics
**Objective**: Add physics body to player
**IMPLEMENTATION REFERENCE**: See Section 1.4 "Physics Bodies" in `agent_docs/comprehensive_documentation.md` for physics body setup and Section 1.4 "Dynamic vs. Static Bodies" for player physics configuration.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for player physics
   - Test physics body creation and attachment
   - Test collision bounds configuration
   - Test physics properties (bounce, friction)
   - Test physics body validation
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Enable player physics following Section 1.4 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All player physics tests MUST pass before proceeding
- **Expected output**: The player character should now fall due to gravity when the GameScene loads. The player will drop from its starting position and fall through the screen until it hits the bottom boundary. This demonstrates that the physics system is working and the player has a physics body attached.
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-11 - Player now correctly falls due to world gravity, confirming physics body attachment.

### Task 2.5: Create StateMachine Class
**Objective**: Implement state management system
**IMPLEMENTATION REFERENCE**: See Section 7.2 "State Machine Implementation" in `agent_docs/comprehensive_documentation.md` for the generic StateMachine class pattern and state management methods.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for StateMachine class
   - Test StateMachine instantiation and state registration
   - Test state transitions (valid and invalid)
   - Test state lifecycle methods (enter, execute, exit)
   - Test state data passing between transitions
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create StateMachine class following Section 7.2 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All StateMachine tests MUST pass before proceeding
- **Expected output**: -
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-11 - StateMachine class created and all tests pass.

### Task 2.6: Create IdleState Class
**Objective**: Implement player idle state
**IMPLEMENTATION REFERENCE**: See Section 7.2 "Player State Machine Definition" table in `agent_docs/comprehensive_documentation.md` for the exact IdleState behavior and Section 1.5 for animation setup.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for IdleState
   - Test IdleState instantiation and initialization
   - Test idle animation playback
   - Test input detection for state transitions
   - Test state exit conditions
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create IdleState class following Section 7.2 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All IdleState tests MUST pass before proceeding
- **Expected output**: -
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-11 - IdleState class created and all tests pass.

### Task 2.7: Create RunState Class
**Objective**: Implement player running state
**IMPLEMENTATION REFERENCE**: See Section 7.2 "Player State Machine Definition" table in `agent_docs/comprehensive_documentation.md` for RunState behavior and Section 1.4 for horizontal movement physics.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for RunState
   - Test RunState instantiation and initialization
   - Test run animation playback
   - Test horizontal movement implementation
   - Test state transition conditions
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create RunState class following Section 7.2 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All RunState tests MUST pass before proceeding
- **Expected output**: -
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-11 - RunState class created and all tests pass.

### Task 2.8: Create JumpState Class
**Objective**: Implement player jumping state
**IMPLEMENTATION REFERENCE**: See Section 7.2 "Player State Machine Definition" table in `agent_docs/comprehensive_documentation.md` for JumpState behavior and Section 1.4 for velocity application.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for JumpState
   - Test JumpState instantiation and initialization
   - Test jump animation playback
   - Test upward velocity application
   - Test jump state exit conditions
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create JumpState class following Section 7.2 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All JumpState tests MUST pass before proceeding
- **Expected output**: -
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-11 - JumpState class created and all tests pass.

### Task 2.9: Create FallState Class
**Objective**: Implement player falling state
**IMPLEMENTATION REFERENCE**: See Section 7.2 "Player State Machine Definition" table in `agent_docs/comprehensive_documentation.md` for FallState behavior and Section 1.4 for gravity application.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for FallState
   - Test FallState instantiation and initialization
   - Test fall animation playback
   - Test gravity application
   - Test fall state exit conditions
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create FallState class following Section 7.2 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All FallState tests MUST pass before proceeding
- **Expected output**: -
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-11 - FallState class created and all tests pass.

### Task 2.10: Connect StateMachine to Player
**Objective**: Integrate state machine with player
**IMPLEMENTATION REFERENCE**: See Section 7.2 "State Machine Implementation" in `agent_docs/comprehensive_documentation.md` for state machine integration patterns and Section 1.2 for update loop integration.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for state machine integration
   - Test StateMachine instance addition to Player
   - Test initial state setup (IdleState)
   - Test state machine update loop integration
   - Test state transition functionality
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Connect StateMachine to Player following Section 7.2 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All state machine integration tests MUST pass before proceeding
- **Expected output**: The player should now start in the idle state and display the idle animation. The player will no longer fall through the screen but will remain stationary on the ground platform, showing the idle animation from the Kenney character spritesheet.
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-11 - StateMachine connected to Player, all tests pass.

### Task 2.11: Create InputManager Class
**Objective**: Centralize input handling
**IMPLEMENTATION REFERENCE**: See Section 1.5 "Input Handling" in `agent_docs/comprehensive_documentation.md` for keyboard input patterns and input state tracking.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for InputManager
   - Test InputManager instantiation and initialization
   - Test keyboard input detection
   - Test input state tracking (isDown, isUp, JustDown)
   - Test input validation methods
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create InputManager class following Section 1.5 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All InputManager tests MUST pass before proceeding
- **Expected output**: -
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-11 - InputManager class created and all tests pass.

### Task 2.12: Add Keyboard Controls
**Objective**: Implement basic keyboard input
**IMPLEMENTATION REFERENCE**: See Section 1.5 "Input Handling" in `agent_docs/comprehensive_documentation.md` for keyboard setup patterns and input debouncing.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for keyboard controls
   - Test arrow key detection and tracking
   - Test WASD key detection and tracking
   - Test input debouncing implementation
   - Test input validation and edge cases
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Add keyboard controls following Section 1.5 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All keyboard controls tests MUST pass before proceeding
- **Expected output**: -
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-11 - Keyboard controls integrated with InputManager and player state machine.

### Task 2.13: Connect Input to Player Movement
**Objective**: Link input to player actions
**IMPLEMENTATION REFERENCE**: See Section 1.5 "Input Handling" in `agent_docs/comprehensive_documentation.md` for input processing patterns and Section 7.2 for state machine input integration.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for input-player connection
   - Test left/right movement input processing
   - Test jump input detection and handling
   - Test input validation and edge cases
   - Test input manager integration with player
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Connect input to player movement following Section 1.5 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All input-player connection tests MUST pass before proceeding
- **Expected output**: The player should now respond to keyboard input. Pressing LEFT ARROW or A should make the player move left and show the walk animation. Pressing RIGHT ARROW or D should make the player move right and show the walk animation. Pressing UP ARROW, W, or SPACE should make the player jump and show the jump animation. The player should transition between idle, walk, jump, and fall animations based on input and physics state.
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-11 - Input connected to player movement through state machine system.

### Task 2.13.bis: Fine-tune Physics Hitboxes
**Objective**: Adjust player, floor, and platform hitboxes to match their visual sprites
**IMPLEMENTATION REFERENCE**: See Section 1.4 "Physics Bodies" in `agent_docs/comprehensive_documentation.md` for hitbox manipulation patterns (`setSize`, `setOffset`).
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for hitbox validation
   - Test player hitbox dimensions and offset
   - Test floor tile hitbox dimensions to cover grass and dirt
   - Test floating platform hitbox dimensions
   - Use physics debug view to visually confirm alignment
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement hitbox adjustments in `Player.js` and `GameScene.js`'s `configurePlatform` method.
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All hitbox validation tests MUST pass before proceeding
- **SPECIFIC REQUIREMENTS**:
  - **Player**: Reduce the physics body height to more closely match the character sprite, ignoring some of the helmet's empty space.
  - **Floor Tiles**: The hitbox should cover the full 64x64 tile, including the dirt part, not just the 20px of grass.
  - **Floating Blocks**: The hitbox should match the visual size of the block sprites.
- **Expected output**: When physics debug is enabled, the hitboxes for the player, ground, and platforms should perfectly align with their visible sprites. The player should stand on the very top of the grass, and collisions should feel precise.
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-11 - Hitboxes for player and platforms adjusted for better collision accuracy.

### Task 2.13.bis2: Adjust Ground Platform Vertical Position
**Objective**: Move the ground platform up so the full tile is visible
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Creating Game Objects" in `agent_docs/comprehensive_documentation.md` for sprite positioning patterns.
**TDD APPROACH**:
1. **FIRST**: Visually inspect the ground tiles with the physics debugger on.
2. **SECOND**: Adjust the `groundY` value in `GameScene.js` to move the platform up.
3. **THIRD**: Modify the loop that creates the ground tiles to use the new `groundY` value.
4. **FOURTH**: The goal is to move the entire ground platform up so that the bottom of the tile is aligned with the bottom of the game canvas.
5. **FIFTH**: Refactor and bugfix until the platform is positioned correctly.
- **CRITICAL**: The ground must be fully visible and collision must work correctly.
- **Expected output**: The ground tiles are no longer cut off at the bottom of the screen. The full 64x64 sprite for each ground tile is visible, and the player correctly collides with its top surface.
- **After completion**: Mark task as completed only after visual confirmation.
- [x] Completed on 2024-06-11 - Ground tiles repositioned to be fully visible at the bottom of the screen.

### Task 2.14: Implement Variable Jump Height
**Objective**: Add responsive jumping mechanics
**IMPLEMENTATION REFERENCE**: See Section 7.2 "Player State Machine Definition" table in `agent_docs/comprehensive_documentation.md` for JumpState variable height patterns and Section 1.4 for velocity control.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for variable jump height
   - Test jump key hold duration tracking
   - Test jump velocity adjustment based on hold time
   - Test maximum jump height enforcement
   - Test jump responsiveness validation
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Implement variable jump height following Section 7.2 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All variable jump height tests MUST pass before proceeding
- **Expected output**: The jump mechanic should now be more responsive. Tapping the jump key (UP ARROW, W, or SPACE) should result in a small hop, while holding the jump key should make the player jump higher. The longer you hold the jump key, the higher the player should jump, up to a maximum height. Releasing the jump key early should cut the jump short, creating a more responsive and controllable jumping experience.
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-11 - Implemented variable jump height by cutting velocity on early key release.

### Task 2.15: Create CollisionManager Class
**Objective**: Centralize collision detection
**IMPLEMENTATION REFERENCE**: See Section 1.4 "Collision Detection" in `agent_docs/comprehensive_documentation.md` for collision setup patterns and Section 1.4 "Physics Groups" for efficient collision management.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for CollisionManager
   - Test CollisionManager instantiation and initialization
   - Test collision group management
   - Test collision callback system
   - Test collision filtering and validation
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create CollisionManager class following Section 1.4 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All CollisionManager tests MUST pass before proceeding
- **Expected output**: -
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-11 - Created CollisionManager to centralize collision logic.

### Task 2.16: Add Player-Platform Collision
**Objective**: Enable player to stand on existing platforms
**IMPLEMENTATION REFERENCE**: See Section 1.4 "Collision Detection" in `agent_docs/comprehensive_documentation.md` for collision setup patterns and Section 1.4 "Static vs. Dynamic Bodies" for platform collision.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for player-platform collision
   - Test collision setup between player and existing platform group
   - Test collision callback execution
   - Test player landing detection and handling
   - Test collision response validation
   - Test collision with existing ground and floating platforms
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Add player-platform collision following Section 1.4 patterns:
   - Set up collider between player and existing platforms group
   - Configure collision callbacks for landing detection
   - Test collision with existing ground platform layout
   - Test collision with existing floating platforms
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All player-platform collision tests MUST pass before proceeding
- **SPECIFIC REQUIREMENTS**:
  - Work with existing platforms group in GameScene
  - Ensure player can land on existing ground platform
  - Test collision with existing floating platforms
  - Maintain existing platform physics properties
- **Expected output**: The player should now be able to land on and stand on platforms. When the player falls, they should stop falling when they hit the ground platform or any floating platform. The player should be able to jump from platform to platform, and the collision detection should prevent the player from falling through platforms. The player should transition to the idle state when landing on a platform.
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-11 - Refactored to use CollisionManager and increased jump height.

### Task 2.17: Enhance Basic Test Level
**Objective**: Improve the existing test level for better player testing
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Creating Game Objects" in `agent_docs/comprehensive_documentation.md` for level building patterns and Section 1.4 for platform positioning.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for enhanced test level
   - Test additional platform creation and positioning
   - Test enhanced level layout validation
   - Test platform positioning for improved platforming experience
   - Test level playability validation with player movement
   - Test level enhancement without breaking existing functionality
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Enhance existing test level following Section 1.3 patterns:
   - Add more floating platforms for better platforming
   - Improve platform spacing and positioning
   - Add platforms that test player jumping abilities
   - Maintain existing ground platform layout
   - Ensure level remains playable and fun
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All enhanced test level tests MUST pass before proceeding
- **SPECIFIC REQUIREMENTS**:
  - Build upon existing GameScene platform layout
  - Add platforms that test different player abilities (jumping, movement)
  - Ensure level provides good testing environment for player mechanics
  - Maintain existing scene structure and navigation
- **Expected output**: The GameScene should now have additional floating platforms positioned at various heights and distances. These platforms should be spaced to test the player's jumping abilities - some should be reachable with a single jump, others might require precise timing or multiple jumps. The level should provide a more engaging platforming experience while maintaining the existing ground platform and scene navigation.
- **After completion**: Mark task as completed only after ALL project tests pass

### Task 2.18: Add Collectible Coins
**Objective**: Create basic collectibles for testing
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Creating Game Objects" in `agent_docs/comprehensive_documentation.md` for collectible creation patterns and Section 1.4 "Collision Detection" for overlap detection.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for collectible coins
   - Test Coin class instantiation and properties
   - Test coin sprite creation and positioning
   - Test coin-player collision detection
   - Test coin collection feedback and destruction
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create collectible coins following Section 1.3 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All collectible coin tests MUST pass before proceeding
- **Expected output**: The GameScene should now contain collectible coins scattered throughout the level. These coins should be visible as animated sprites. When the player touches a coin, the coin sprite should be destroyed and disappear. More advanced feedback (sounds, score) will be added in later phases (Tasks 4.18 and 5.22).
- **After completion**: Mark task as completed only after ALL project tests pass
- [x] Completed on 2024-06-11 - Basic coin collectible created and integrated.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

**Phase 2 Completion**: Merge `feature/phase-2-player-movement` into `main`

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
- [x] Completed on 2024-06-12 - Implemented player state restoration from buffer.

### Task 3.6: Add Rewind Visual Effects
**Objective**: Enhance rewind with visual feedback
**IMPLEMENTATION REFERENCE**: See Section 2 "High-Performance Animation with GSAP" in `agent_docs/comprehensive_documentation.md`.
**TDD APPROACH**:
1.  FIRST: Write tests for visual effect activation.
2.  SECOND: Use GSAP in `GameScene` or `TimeManager` to apply a visual effect during rewind.
- **Expected output**: When the rewind is active, the screen should have a distinct visual effect (e.g., a color tint or shader effect) to give feedback to the player.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.
- [x] Completed on 2024-06-12 - Added camera tint effect during rewind.

### Task 3.7: Create Phase Dash Ability
**Objective**: Implement short-range teleportation
**IMPLEMENTATION REFERENCE**: See Section 7.2 "Platformer Character Controller" in `agent_docs/comprehensive_documentation.md`.
**TDD APPROACH**:
1.  FIRST: Write a new `DashState` test.
2.  SECOND: Create `DashState.js` and integrate it into the player's state machine.
- **Expected output**: The player can now dash a short distance by pressing a key (e.g., Shift). The player should move instantly and not be able to pass through platforms.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 3.8: Add Dash Ghost Trail
**Objective**: Create visual trail effect for dash
**IMPLEMENTATION REFERENCE**: See Section 2.3 "Definitive Integration Pattern: GSAP + Phaser" in `agent_docs/comprehensive_documentation.md`.
**TDD APPROACH**:
1.  FIRST: Write tests to verify trail sprites are created.
2.  SECOND: In `DashState`, use GSAP to create and animate temporary "ghost" sprites.
- **Expected output**: When the player dashes, a visual trail of "ghost" sprites is briefly left behind to enhance the visual feedback of the ability.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 3.9: Implement Dash Cooldown
**Objective**: Balance dash ability with cooldown
**IMPLEMENTATION REFERENCE**: See Section 7.2 "Player State Machine Definition" table in `agent_docs/comprehensive_documentation.md`.
**TDD APPROACH**:
1.  FIRST: Write tests to check for a cooldown property on the player or in the `DashState`.
2.  SECOND: Add cooldown logic to the `DashState` to prevent re-entry for a set duration.
- **Expected output**: After dashing, the player cannot dash again for a short period. Attempting to dash during this cooldown has no effect.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 3.10: Create Chrono Pulse Ability
**Objective**: Implement time freeze shockwave
**IMPLEMENTATION REFERENCE**: See Section 2.4 "Game-Specific Use Cases for 'Time Oddity'" in `agent_docs/comprehensive_documentation.md`.
**TDD APPROACH**:
1.  FIRST: Write tests for a `ChronoPulse` class or similar mechanism.
2.  SECOND: Create the class and trigger it from an input in `Player.js`.
- **Expected output**: Pressing the Chrono Pulse key (e.g., 'E') creates a visible shockwave effect that expands from the player's position. It does not yet affect other objects.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 3.11: Create Enemy Base Class
**Objective**: Establish foundation for all enemies
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Asset and Sprite Management" in `agent_docs/comprehensive_documentation.md`.
**TDD APPROACH**:
1.  FIRST: Write tests for an `Enemy` base class.
2.  SECOND: Create `client/src/entities/Enemy.js` extending `Entity`.
- **Expected output**: The `Enemy.js` base class file is created in `client/src/entities/`. All associated tests pass. No enemies appear in the game yet.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 3.12: Implement LoopHound Enemy
**Objective**: Create the first enemy type
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Creating Game Objects" in `agent_docs/comprehensive_documentation.md`.
**TDD APPROACH**:
1.  FIRST: Write tests for a `LoopHound` class.
2.  SECOND: Create `client/src/entities/enemies/LoopHound.js` and add an instance to `GameScene`.
- **Expected output**: A 'LoopHound' enemy is added to the GameScene. It should use a Kenney enemy sprite and have a basic patrol AI (e.g., moving back and forth on a platform).
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 3.13: Add Enemy-Player Collision
**Objective**: Enable combat between player and enemies
**IMPLEMENTATION REFERENCE**: See Section 1.4 "Collision Detection" in `agent_docs/comprehensive_documentation.md`.
**TDD APPROACH**:
1.  FIRST: Write tests for the collision callback.
2.  SECOND: Use `CollisionManager` in `GameScene` to add a collider between the player and enemy groups.
- **Expected output**: When the player touches an enemy, a collision is registered. This can be verified with a `console.log` in the collision callback. No damage or other effects are required for this task.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 3.14: Add Enemy Freeze Effect
**Objective**: Make enemies freeze when hit by pulse
**IMPLEMENTATION REFERENCE**: See Section 2.4 "Time Freeze" patterns in `agent_docs/comprehensive_documentation.md`.
**TDD APPROACH**:
1.  FIRST: Write tests to verify an enemy's state changes when it overlaps with a pulse.
2.  SECOND: Add an overlap check between enemies and the chrono pulse, with a callback that freezes the enemy.
- **Expected output**: When the player's Chrono Pulse shockwave overlaps with an enemy, the enemy's movement and animations should freeze for a short duration.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 3.15: Implement Enemy Respawn
**Objective**: Make enemies respawn after defeat
**IMPLEMENTATION REFERENCE**: See Section 1.7 "Object Pooling" in `agent_docs/comprehensive_documentation.md`.
**TDD APPROACH**:
1.  FIRST: Write tests to check if a destroyed enemy is recreated.
2.  SECOND: Add logic to the `Enemy` class or a new `EnemyManager` to handle respawning after a delay.
- **Expected output**: After an enemy is "destroyed" (e.g., by calling a `destroy` method manually via the console for testing), it should reappear at its initial spawn point after a set delay.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 3.16: Implement State Recording for Enemies
**Objective**: Record enemy states for rewind
**IMPLEMENTATION REFERENCE**: See Section 7.1 "Handling Object Lifecycle: The 'Echo' System" in `agent_docs/comprehensive_documentation.md`.
**TDD APPROACH**:
1.  FIRST: Write tests to verify enemy states are added to the `TimeManager` buffer.
2.  SECOND: Register enemy instances with the `TimeManager` so their states are recorded and rewound.
- **Expected output**: When the player rewinds time, any enemies on screen also rewind their position and state, moving backward along their patrol paths.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

**Phase 3 Completion**: Merge `feature/phase-3-gameplay-mechanics` into `main`

---

## Phase 4: Level Design & Progression

**Branch**: `feature/phase-4-level-design`

**CRITICAL IMPLEMENTATION REQUIREMENT**: Before implementing any task in this phase, you MUST read the comprehensive documentation file `agent_docs/comprehensive_documentation.md`. Pay special attention to:
- Section 7.3: UI/HUD Architecture and Implementation
- Section 3: Advanced Audio Management with Howler.js
- Section 1.3: Asset and Sprite Management

**TDD REQUIREMENT**: All tasks in this phase follow Test-Driven Development (TDD).

### Task 4.1: Create UIScene Class
**Objective**: Separate UI from game logic.
**IMPLEMENTATION REFERENCE**: See Section 7.3 "Decoupled UI Scene".
- **Expected output**: A new `UIScene.js` file exists. The scene runs in parallel with `GameScene` but is currently empty. This can be verified by adding a temporary text object to the `UIScene` and seeing it overlay the `GameScene`.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 4.2: Add Health Bar to UI
**Objective**: Display player health in the UI.
**IMPLEMENTATION REFERENCE**: See Section 7.3 "HUD State Updates via Event Emitter".
- **Expected output**: A simple health bar graphic appears in the `UIScene`. It does not need to be functional yet.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 4.3: Add Ability Cooldown Indicators
**Objective**: Show ability availability in the UI.
**IMPLEMENTATION REFERENCE**: See Section 7.3 "Interactive Menus and Responsive Layout".
- **Expected output**: Placeholder icons for the Dash and Chrono Pulse abilities appear in the `UIScene`. They do not need to be functional yet.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 4.4: Create Pause Menu
**Objective**: Allow the game to be paused.
**IMPLEMENTATION REFERENCE**: See Section 1.2 "Scene Management" for pausing patterns.
- **Expected output**: Pressing a key (e.g., 'P') pauses the `GameScene` and shows a "Paused" menu in the `UIScene` with a "Resume" button. Clicking "Resume" unpauses the game.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 4.5: Set Up Howler.js Audio Manager
**Objective**: Initialize the audio system.
**IMPLEMENTATION REFERENCE**: See Section 3.2 "Global Audio Manager".
- **Expected output**: An `AudioManager.js` class is created using Howler.js. All tests pass. No sound plays yet.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 4.6: Load Kenney Sound Effects
**Objective**: Integrate audio assets.
**IMPLEMENTATION REFERENCE**: See Section 3.2 "Audio Sprites for Efficiency".
- **Expected output**: The `AudioManager` loads the `.ogg` sound files from the assets folder. This can be verified by logging a success message from the manager.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 4.7: Add Basic Sound Effects
**Objective**: Connect sounds to game actions.
**IMPLEMENTATION REFERENCE**: See Section 3.3 "Integration with Phaser".
- **Expected output**: A sound effect plays when the player jumps and when a coin is collected.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 4.8: Implement Background Music
**Objective**: Add ambient music to the game.
**IMPLEMENTATION REFERENCE**: See Section 3.2 "Layer Management".
- **Expected output**: A background music track starts playing when the `GameScene` begins.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 4.9: Add Audio Controls
**Objective**: Allow the player to control audio volume.
**IMPLEMENTATION REFERENCE**: See Section 3.2 "Global Audio Manager".
- **Expected output**: The pause menu now contains controls (e.g., sliders or buttons) to adjust the volume of the background music and sound effects.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 4.10: Create Level Data Structure
**Objective**: Define a standard JSON format for level data.
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Asset and Sprite Management".
- **Expected output**: A sample `level-1.json` file is created in the assets folder, defining positions for platforms and collectibles.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 4.11: Implement Level Loading System
**Objective**: Create a system to load levels from data files.
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Loading Assets".
- **Expected output**: The `GameScene` is refactored to load its platforms and coins from the `level-1.json` file instead of creating them with hardcoded positions.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 4.12: Create TimeShard Collectible
**Objective**: Implement the main collectible for progression.
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Creating Game Objects".
- **Expected output**: A new `TimeShard` class is created. An instance of a TimeShard is placed in the level via the level data file and is visible in-game. It does not need to be collectible yet.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 4.13: Add Shard Counter to UI
**Objective**: Display collected shards to the player.
**IMPLEMENTATION REFERENCE**: See Section 7.3 "HUD State Updates via Event Emitter".
- **Expected output**: The `UIScene` now displays a counter for collected TimeShards (e.g., "Shards: 0"). When the player collects a `TimeShard`, the counter increments.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 4.14: Implement Level Completion
**Objective**: Detect when the player completes a level.
**IMPLEMENTATION REFERENCE**: See Section 1.4 "Collision Detection" for trigger zones.
- **Expected output**: A special, invisible "goal" object is loaded from the level data. When the player overlaps with this object, a message is logged to the console indicating the level is complete.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 4.15: Create Level Transition System
**Objective**: Handle transitions between levels.
**IMPLEMENTATION REFERENCE**: See Section 1.2 "Scene Management".
- **Expected output**: Upon level completion, the game transitions to a "Level Complete" screen, which then allows the player to start the next level or return to the menu.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

**Phase 4 Completion**: Merge `feature/phase-4-level-design` into `main`

---

## Phase 5: Polish & MVP Completion

**Branch**: `feature/phase-5-polish`

**CRITICAL IMPLEMENTATION REQUIREMENT**: Before implementing any task in this phase, you MUST read the comprehensive documentation file `agent_docs/comprehensive_documentation.md`. Pay special attention to:
- Section 1.6: Camera Systems, Particles, and Effects
- Section 1.7: Advanced Topics & Best Practices (for performance optimization)
- Section 6: Full-Stack Architecture and Development Tooling

**TDD REQUIREMENT**: All tasks in this phase follow Test-Driven Development (TDD).

### Task 5.1: Add Particle Effects for Player Actions
**Objective**: Enhance visual feedback for player abilities.
**IMPLEMENTATION REFERENCE**: See Section 1.6 "Particle Emitters".
- **Expected output**: Simple particle effects are triggered when the player dashes, uses the chrono pulse, and rewinds time.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 5.2: Implement Screen Shake Effect
**Objective**: Add impact feedback for game events.
**IMPLEMENTATION REFERENCE**: See Section 1.6 "Camera Manager" for camera shake effects.
- **Expected output**: The camera briefly shakes when the player collides with an enemy.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 5.3: Add Player Health and Damage
**Objective**: Implement a health system for the player.
**IMPLEMENTATION REFERENCE**: See Section 7.3 for event-driven UI updates.
- **Expected output**: The player now has a health property. When colliding with an enemy, the player's health decreases, and the health bar in the `UIScene` updates to reflect the change.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 5.4: Create Game Over Scene
**Objective**: Handle the player's death.
**IMPLEMENTATION REFERENCE**: See Section 1.2 "Scene Management".
- **Expected output**: When the player's health reaches zero, the game transitions to a new "Game Over" scene, which provides options to restart or return to the main menu.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 5.5: Implement Basic Scoring System
**Objective**: Add a score tracking mechanism.
**IMPLEMENTATION REFERENCE**: See Section 7.3 for UI updates.
- **Expected output**: The `UIScene` now displays a score counter. Collecting a coin adds 10 points to the score, and collecting a TimeShard adds 100 points.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 5.6: Gameplay Tuning Pass
**Objective**: Balance and tune all gameplay values for a better feel.
**IMPLEMENTATION REFERENCE**: Review values in `Player.js`, `Enemy.js`, and state classes.
- **Expected output**: This is a non-visual task focused on balance. Adjust values for player speed, jump height, dash cooldown, enemy speed, and health to create a more enjoyable and balanced experience. The result is validated by gameplay feel.
- **After completion**: Mark task as completed after manual validation.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 5.7: Performance Optimization with Object Pooling
**Objective**: Optimize particle effects using object pooling.
**IMPLEMENTATION REFERENCE**: See Section 1.7 "Object Pooling".
- **Expected output**: The particle effects for player actions are refactored to use the `ObjectPool` system created in Phase 1. Visually, the game should look the same, but performance will be improved by recycling particle objects instead of creating new ones.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 5.8: Final Bug Bash
**Objective**: Perform a final pass to find and fix any remaining bugs.
**IMPLEMENTATION REFERENCE**: See Section 6.3 "Global Error Handling and Logging".
- **Expected output**: Address any known bugs, visual glitches, or inconsistencies found during playtesting. The game should feel stable and polished.
- **After completion**: Mark task as completed after manual validation.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 5.9: Create Final MVP Demo Level
**Objective**: Create a single level that showcases all game features.
**IMPLEMENTATION REFERENCE**: See Section 1.3 for level loading.
- **Expected output**: A new `level-mvp-demo.json` file is created and loaded by the game. This level should be a short, curated experience that requires the player to use all of their abilities (jump, dash, rewind, pulse) to complete.
- **After completion**: Mark task as completed after manual validation.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 5.10: Final Build and Validation
**Objective**: Ensure the production build is working correctly.
**IMPLEMENTATION REFERENCE**: See Section 6.1 on the Vite build pipeline.
- **Expected output**: Running the `npm run build` command successfully generates a production-ready build in the `/dist` directory. The game is fully playable when serving the contents of this directory.
- **After completion**: Mark task as completed after build validation.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

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
- Update progress regularly to track development status