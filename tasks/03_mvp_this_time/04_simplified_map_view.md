# Task 04: Simplified Map View (T Key Functionality)

> **Implement in-game map overlay accessible via T key showing player position, platforms, and collectibles**

---

## Task Title
Simplified Map View with T Key Toggle

## Objective
Create an in-game map overlay that displays the current level layout with player position, platforms, and coins. The map should be toggleable via the T key and provide spatial awareness to help players navigate complex levels.

## Task ID: 
Task 04.01 - 04.05

## Pre-Implementation Analysis

### Documentation Dependencies
- [x] **invariants.md sections to review**: §1.5 "Input Handling" (key mapping patterns), §7.3 "UI/HUD Architecture" (overlay systems), §13 "Physics Configuration Order" (rendering depth)
- [x] **testing_best_practices.md sections to apply**: "UI Component Testing", "Input Event Testing", "Mock-Based Testing" 
- [x] **small_comprehensive_documentation.md sections to reference**: §7.3 "UI/HUD Architecture" (parallel UIScene patterns), §14.3 "State Management" (scene-specific state)

### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: InputManager key mappings, UIScene overlay systems, GameScene level data access
- [x] **New states/invariants to create**: Map visibility state, map rendering scale/position calculations
- [x] **Time reversal compatibility**: Map is UI-only, no time reversal implications

## Implementation Plan

### Files/Classes to Change
- **Create**: `client/src/ui/MapOverlay.js` (map rendering component)
- **Modify**: 
  - `client/src/systems/InputManager.js` (add T key support)
  - `client/src/scenes/UIScene.js` (integrate map overlay)
  - `client/src/scenes/GameScene.js` (provide level data access method)
- **Delete**: None

### Integration Points
- **Systems affected**: InputManager (new key), UIScene (new overlay), level data access
- **State machines**: No state machine changes required
- **External libraries**: Phaser Graphics API for map rendering

### Testing Strategy
- **Test files to create/update**: 
  - `tests/unit/input-manager-t-key.test.js`
  - `tests/unit/map-overlay.test.js`
  - `tests/unit/ui-scene-map-integration.test.js`
- **Key test cases**: T key registration, map toggle functionality, level data rendering, scale calculations
- **Mock requirements**: Phaser Graphics mock, scene data mocks, InputManager key mocks

## Task Breakdown & Acceptance Criteria

### Task 04.01: Add T Key Support to InputManager
- [x] Add T key registration to InputManager constructor
- [x] Create `isMapToggleJustPressed` getter method
- [x] Update InputManager tests to cover T key functionality
- **Acceptance**: T key input is properly captured and accessible via InputManager API

### Task 04.02: Create MapOverlay Component
- [x] Implement MapOverlay class with level data rendering
- [x] Add platform rendering as rectangles/dots
- [x] Add coin rendering as small circles
- [x] Add player position indicator as distinct marker
- [x] Implement scale calculation to fit level in overlay area
- **Acceptance**: MapOverlay can render basic level elements in a compact view

### Task 04.03: Integrate Map with UIScene
- [x] Add map overlay to UIScene create() method
- [x] Implement map toggle logic in UIScene update() method
- [x] Handle map visibility state management
- [x] Position map overlay appropriately (e.g., top-right corner)
- **Acceptance**: Map overlay appears/disappears correctly on T key press

### Task 04.04: Add Real-time Player Position Updates
- [x] Connect player position updates to map display
- [x] Update player marker position on map in real-time
- [x] Handle camera/viewport relationship for accurate positioning
- **Acceptance**: Player position on map accurately reflects game position

### Task 04.05: Polish and Testing
- [x] Add visual styling (background, borders, transparency)
- [x] Implement proper depth layering (above other UI elements)
- [x] Create comprehensive test coverage
- [x] Add map toggle indicator or help text
- **Acceptance**: Map is visually polished and all tests pass

## Expected Output
- Pressing T key toggles a mini-map overlay in the top-right corner
- Map shows level platforms as colored rectangles, coins as dots, player as distinct marker
- Player position updates in real-time as they move through the level
- Map is properly scaled to show entire level layout
- All existing functionality remains unchanged

## Risk Assessment
- **Potential complexity**: Coordinate transformation between game world and map view, performance impact of real-time updates
- **Dependencies**: Access to level configuration data, proper rendering depth management
- **Fallback plan**: If real-time updates cause performance issues, update map position only when static for 100ms

## Definition of Done
- [x] All acceptance criteria are met for tasks 04.01-04.05
- [x] T key toggles map overlay with no conflicts with existing keys
- [x] Map accurately displays platforms, coins, and player position
- [x] All project tests pass (locally and in CI)
- [x] No performance degradation during map usage
- [x] Code follows existing architectural patterns (UIScene overlay system)
- [x] No new linter or type errors
- [x] Map overlay integrates seamlessly with existing UI elements
- [x] Task marked as complete in tracking system

## Post-Mortem / Retrospective (fill in if needed)
- _To be filled if issues arise during implementation_

--- 