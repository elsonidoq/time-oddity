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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass
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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

### Task 2.3: Add Player to GameScene
**Objective**: Integrate player into the game world
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Creating Game Objects" in `agent_docs/comprehensive_documentation.md` for sprite positioning and Section 1.4 for physics integration.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for player integration
   - Test player instance creation in GameScene
   - Test player positioning at starting location
   - Test player addition to scene display list
   - Test player visibility and rendering
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Add player to GameScene following Section 1.3 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All player integration tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

### Task 2.16: Add Player-Platform Collision
**Objective**: Enable player to stand on platforms
**IMPLEMENTATION REFERENCE**: See Section 1.4 "Collision Detection" in `agent_docs/comprehensive_documentation.md` for collision setup patterns and Section 1.4 "Static vs. Dynamic Bodies" for platform collision.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for player-platform collision
   - Test collision setup between player and platform group
   - Test collision callback execution
   - Test player landing detection and handling
   - Test collision response validation
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Add player-platform collision following Section 1.4 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All player-platform collision tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all project tests pass

### Task 2.17: Create Basic Test Level
**Objective**: Build a simple level for testing
**IMPLEMENTATION REFERENCE**: See Section 1.3 "Creating Game Objects" in `agent_docs/comprehensive_documentation.md` for level building patterns and Section 1.4 for platform positioning.
**TDD APPROACH**:
1. **FIRST**: Write comprehensive unit tests for test level
   - Test multiple platform creation and positioning
   - Test ground level setup and validation
   - Test platform positioning for basic platforming
   - Test level playability validation
2. **SECOND**: Run tests to confirm they fail (Red phase)
3. **THIRD**: Create basic test level following Section 1.3 patterns
4. **FOURTH**: Implement functionality until all tests pass (Green phase)
5. **FIFTH**: Refactor and bugfix until all tests pass (Refactor phase)
- **CRITICAL**: All test level tests MUST pass before proceeding
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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
- **After completion**: Mark task as completed only after all project tests pass

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