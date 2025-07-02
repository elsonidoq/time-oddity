# Task 04: Simplified Map View (T Key Functionality)

> **Implement in-game map overlay accessible via T key showing player position, platforms, and collectibles**

---

## Task Title
Simplified Map View with T Key Toggle

## Objective
Create an in-game map overlay that displays the current level layout with player position, platforms, and coins. The map should be toggleable via the T key and provide spatial awareness to help players navigate complex levels.

## Task ID: 
Task 04.01 - 04.09

## Pre-Implementation Analysis

### Documentation Dependencies
- [x] **invariants.md sections to review**: 
  - §4 "Input Mapping" (T key addition patterns)
  - §3 "Scene Lifecycle" (UIScene integration)
  - §13 "Level/Platform Geometry" (depth management - TimeManager uses depth 1000)
  - §16 "Runtime Event Names" (scene communication)
  - §17 "Testing Assumptions" (centralized mocking)
- [x] **testing_best_practices.md sections to apply**: 
  - §1.1 "TDD Red-Green-Refactor cycle"
  - §2.3 "Centralized Mock Architecture" (phaserKeyMock, phaserSceneMock)
  - §3.1 "TDD-as-Prompting Technique"
  - §8.4 "Test Architecture and Utilities"
- [x] **small_comprehensive_documentation.md sections to reference**: 
  - §7.3 "UI/HUD Architecture" (parallel UIScene patterns)
  - §14.2 "Component Architecture" (depth management)
  - §1.3 "Asset and Sprite Management" (graphics creation)

### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: 
  - InputManager key mapping patterns (§4 invariants.md)
  - UIScene overlay depth management (depth > 1000 for overlays)
  - Scene communication via events (§16 invariants.md)
- [x] **New states/invariants to create**: 
  - Map visibility state (boolean toggle)
  - Map coordinate transformation state (world-to-map scaling)
  - **UI Depth Invariant**: Map overlay must use depth 1001 (above TimeManager rewind overlay at 1000)
- [x] **Time reversal compatibility**: Map is UI-only, no TimeManager registration required

### Architecture Requirements
- **Input Pattern**: Follow existing InputManager patterns (constructor key registration + getters)
- **UI Pattern**: Follow UIScene overlay pattern (depth management, toggle visibility)
- **Testing Pattern**: Use centralized mocks (phaserKeyMock, phaserSceneMock)
- **Coordinate Transform**: Implement deterministic world-to-map transformation
- **Performance**: Update player position only, platforms/coins static after initial render

## Implementation Plan

### Files/Classes to Change
- **Create**: 
  - `client/src/ui/MapOverlay.js` (pure logic map rendering component)
  - `tests/unit/map-overlay.test.js`
  - `tests/unit/input-manager-t-key.test.js`
  - `tests/unit/ui-scene-map-integration.test.js`
- **Modify**: 
  - `client/src/systems/InputManager.js` (add T key following existing patterns)
  - `client/src/scenes/UIScene.js` (integrate map overlay following overlay patterns)
  - `client/src/scenes/GameScene.js` (provide level data access method)
- **Delete**: None

### Integration Points
- **Systems affected**: InputManager (new key), UIScene (new overlay), GameScene (data access)
- **State machines**: No state machine changes required
- **External libraries**: Phaser Graphics API for map rendering
- **Depth Management**: Map overlay at depth 1001 (above TimeManager rewind at 1000)

### Testing Strategy
- **TDD Approach**: Write failing tests first, implement minimal code to pass
- **Mock Requirements**: Use centralized phaserKeyMock and phaserSceneMock
- **Test Distribution**: Each subtask includes its own test requirements
- **Performance Testing**: Verify no frame rate impact during real-time updates

## Task Breakdown & Acceptance Criteria

### Task 04.01: Add T Key Support to InputManager (TDD) ✅ COMPLETED
**TDD Red Phase**: Write failing tests for T key functionality
- [x] Create `tests/unit/input-manager-t-key.test.js`
- [x] Write failing test for T key registration in constructor
- [x] Write failing test for `isMapTogglePressed` getter 
- [x] Write failing test for `isMapToggleJustPressed` getter
- [x] Verify tests fail (red phase)

**TDD Green Phase**: Implement minimal T key support
- [x] Add `this.t = scene.input.keyboard.addKey('T')` to InputManager constructor
- [x] Add `get isMapTogglePressed() { return this.t.isDown; }` getter
- [x] Add `get isMapToggleJustPressed() { return PhaserLib.Input.Keyboard.JustDown(this.t); }` getter
- [x] Verify tests pass (green phase)

**TDD Refactor Phase**: Clean up and optimize
- [x] Ensure T key follows same patterns as existing keys (P, E, R)
- [x] Add JSDoc comments consistent with existing getters
- [x] All tests still pass

**Acceptance**: T key input properly captured via InputManager API following existing patterns

### Task 04.02: Create MapOverlay Core Structure (TDD) ✅ COMPLETED
**TDD Red Phase**: Write failing tests for MapOverlay class
- [x] Create `tests/unit/map-overlay.test.js`
- [x] Write failing test for MapOverlay constructor with scene parameter
- [x] Write failing test for `create()` method creating graphics object
- [x] Write failing test for `destroy()` method cleanup
- [x] Write failing test for `setVisible(boolean)` method
- [x] Verify tests fail (red phase)

**TDD Green Phase**: Implement minimal MapOverlay class
- [x] Create `client/src/ui/MapOverlay.js` with class structure
- [x] Implement constructor accepting scene parameter
- [x] Implement `create()` method creating graphics object at depth 1001
- [x] Implement `destroy()` method for cleanup
- [x] Implement `setVisible(boolean)` method
- [x] Verify tests pass (green phase)

**TDD Refactor Phase**: Optimize structure
- [x] Add proper error handling for missing scene
- [x] Add JSDoc documentation
- [x] All tests still pass

**Acceptance**: MapOverlay class properly structured with lifecycle methods

### Task 04.03: Implement Coordinate Transformation (TDD) ✅ COMPLETED
**TDD Red Phase**: Write failing tests for coordinate math
- [x] Add to `tests/unit/map-overlay.test.js`
- [x] Write failing test for `calculateMapScale(levelWidth, levelHeight)` method
- [x] Write failing test for `worldToMapCoords(worldX, worldY)` method
- [x] Write failing test for scale calculations with different level sizes
- [x] Verify tests fail (red phase)

**TDD Green Phase**: Implement coordinate transformation
- [x] Add `calculateMapScale()` method with deterministic scaling
- [x] Add `worldToMapCoords()` method for position conversion
- [x] Handle edge cases (zero dimensions, negative coordinates)
- [x] Verify tests pass (green phase)

**TDD Refactor Phase**: Optimize calculations
- [x] Cache scale calculations to avoid repeated computation
- [x] Add boundary checking for map coordinates
- [x] All tests still pass

**Acceptance**: Accurate coordinate transformation between game world and map view

### Task 04.04: Render Static Level Elements (TDD) ✅ COMPLETED
**TDD Red Phase**: Write failing tests for platform/coin rendering
- [x] Add to `tests/unit/map-overlay.test.js`
- [x] Write failing test for `renderPlatforms(platformData)` method
- [x] Write failing test for `renderCoins(coinData)` method
- [x] Write failing test for graphics calls (fillRect, fillCircle)
- [x] Verify tests fail (red phase)

**TDD Green Phase**: Implement static element rendering
- [x] Add `renderPlatforms()` method drawing rectangles for platforms
- [x] Add `renderCoins()` method drawing circles for coins
- [x] Use Phaser Graphics API consistently
- [x] Verify tests pass (green phase)

**TDD Refactor Phase**: Optimize rendering
- [x] Use object pooling for graphics if needed
- [x] Consistent styling (colors, sizes)
- [x] All tests still pass

**Acceptance**: Platforms and coins rendered accurately on map as geometric shapes

### Task 04.05: Add Player Position Marker (TDD) ✅ COMPLETED
**TDD Red Phase**: Write failing tests for player marker
- [x] Add to `tests/unit/map-overlay.test.js`
- [x] Write failing test for `renderPlayerMarker(playerX, playerY)` method
- [x] Write failing test for `updatePlayerPosition(playerX, playerY)` method
- [x] Write failing test for distinct player marker styling
- [x] Verify tests fail (red phase)

**TDD Green Phase**: Implement player marker
- [x] Add `renderPlayerMarker()` method with distinct visual style
- [x] Add `updatePlayerPosition()` method for real-time updates
- [x] Clear previous marker before drawing new one
- [x] Verify tests pass (green phase)

**TDD Refactor Phase**: Optimize marker updates
- [x] Minimize graphics operations for smooth updates
- [x] Ensure marker is visually distinct from other elements
- [x] All tests still pass

**Acceptance**: Player position marker updates in real-time with distinct styling

### Task 04.06: Integrate Map with UIScene (TDD) ✅ COMPLETED
**TDD Red Phase**: Write failing tests for UIScene integration
- [x] Create `tests/unit/ui-scene-map-integration.test.js`
- [x] Write failing test for map creation in UIScene.create()
- [x] Write failing test for map toggle logic in UIScene.update()
- [x] Write failing test for T key handling using InputManager
- [x] Verify tests fail (red phase)

**TDD Green Phase**: Implement UIScene integration
- [x] Add MapOverlay creation to UIScene.create() method
- [x] Add map toggle logic to UIScene.update() method
- [x] Position map overlay in top-right corner (x: 1050, y: 50)
- [x] Connect to InputManager T key events
- [x] Verify tests pass (green phase)

**TDD Refactor Phase**: Clean integration
- [x] Follow UIScene overlay patterns (similar to pause menu)
- [x] Proper error handling for missing InputManager
- [x] All tests still pass

**Acceptance**: Map overlay toggles correctly via T key within UIScene

### Task 04.07: Connect GameScene Data Access (TDD)
**TDD Red Phase**: Write failing tests for data access
- [ ] Add to `tests/unit/ui-scene-map-integration.test.js`
- [ ] Write failing test for GameScene level data access method
- [ ] Write failing test for platform data retrieval
- [ ] Write failing test for coin data retrieval
- [ ] Write failing test for player position access
- [ ] Verify tests fail (red phase)

**TDD Green Phase**: Implement data access
- [ ] Add `getLevelDataForMap()` method to GameScene
- [ ] Return platform positions, coin positions, level bounds
- [ ] Add `getPlayerPosition()` method to GameScene
- [ ] Connect UIScene to GameScene data via scene.get()
- [ ] Verify tests pass (green phase)

**TDD Refactor Phase**: Optimize data access
- [ ] Cache level data (platforms/coins don't change)
- [ ] Only update player position in real-time
- [ ] All tests still pass

**Acceptance**: Map accurately displays current level data from GameScene

### Task 04.08: Add Visual Styling and Polish (TDD)
**TDD Red Phase**: Write failing tests for visual styling
- [ ] Add to `tests/unit/map-overlay.test.js`
- [ ] Write failing test for map background styling
- [ ] Write failing test for border/frame rendering
- [ ] Write failing test for transparency/alpha settings
- [ ] Verify tests fail (red phase)

**TDD Green Phase**: Implement visual styling
- [ ] Add semi-transparent background (alpha 0.8)
- [ ] Add border frame around map area
- [ ] Use consistent color scheme (platforms: green, coins: yellow, player: blue)
- [ ] Set proper depth (1001) above TimeManager rewind overlay
- [ ] Verify tests pass (green phase)

**TDD Refactor Phase**: Polish visual appearance
- [ ] Consistent styling with existing UI elements
- [ ] Performance optimization for graphics operations
- [ ] All tests still pass

**Acceptance**: Map is visually polished with proper styling and depth layering

### Task 04.09: Performance Testing and Optimization (TDD)
**TDD Red Phase**: Write failing tests for performance requirements
- [ ] Add performance tests to verify no frame rate impact
- [ ] Write failing test for update frequency limits
- [ ] Write failing test for memory usage (no leaks)
- [ ] Verify tests fail (red phase)

**TDD Green Phase**: Implement performance optimizations
- [ ] Limit player position updates to 30fps max
- [ ] Implement proper cleanup in destroy() methods
- [ ] Verify tests pass (green phase)

**TDD Refactor Phase**: Final optimizations
- [ ] Profile and optimize graphics operations
- [ ] Ensure no memory leaks in toggle operations
- [ ] All tests still pass

**Acceptance**: Map overlay has no measurable performance impact on gameplay

## Expected Output
- Pressing T key toggles a mini-map overlay in the top-right corner (depth 1001)
- Map shows level platforms as green rectangles, coins as yellow dots, player as blue marker
- Player position updates in real-time (max 30fps) as they move through the level
- Map is properly scaled to show entire level layout with semi-transparent background
- All existing functionality remains unchanged
- Zero performance impact during map usage

## Risk Assessment
- **Potential complexity**: Coordinate transformation math, real-time update performance
- **Dependencies**: GameScene level data access, UIScene overlay integration, proper depth management
- **Fallback plan**: If real-time updates cause performance issues, update position only every 100ms

## Definition of Done
- [ ] All TDD red-green-refactor cycles completed for tasks 04.01-04.09
- [ ] T key toggles map overlay with no conflicts (verified via InputManager tests)
- [ ] Map accurately displays platforms, coins, and player position (verified via coordinate tests)
- [ ] Map overlay renders at depth 1001 (above TimeManager rewind overlay at 1000)
- [ ] All project tests pass (locally and in CI) including new test files
- [ ] Performance tests confirm no frame rate degradation
- [ ] Code follows existing architectural patterns (InputManager, UIScene overlay)
- [ ] No new linter or type errors
- [ ] Map overlay integrates seamlessly with existing UI elements
- [ ] invariants.md updated with new UI depth requirement (depth 1001 for map overlay)
- [ ] Task marked as complete in tracking system

## Post-Mortem / Retrospective (fill in if needed)
- _To be filled if issues arise during implementation_

--- 