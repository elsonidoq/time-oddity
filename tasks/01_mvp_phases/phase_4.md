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
- [x] Task completed on 2024-06-12 - UIScene implemented with strict TDD, all tests pass, architectural compliance verified.
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
