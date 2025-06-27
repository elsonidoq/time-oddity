## Task 01.01 – Extend Floating Platform Width Support

### Objective
Enable creation of floating platforms with arbitrary widths greater than one tile, removing the current single-block limitation.

### Task Reference
Functional Gap 1 – Core Platforming

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md**: §13 Level / Platform Geometry – especially ordering requirements; §12 Moving Platform Invariants for future compatibility
- [ ] **testing_best_practices.md**: "Decoupled Architecture Testing", "State-Based Testing"
- [ ] **small_comprehensive_documentation.md**: §1.3 Asset and Sprite Management, §14.1 Directory Structure

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: Platform hit-box sizing contract; TimeManager recording for MovingPlatform (not affected)
- [ ] **New states/invariants**: None – platform geometry remains per-tile.
- [ ] **Time reversal compatibility**: Unchanged – floating platforms are static.

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `agent_docs/invariants.md` (update example width wording only if needed)
- **Modify**: `client/src/systems/SceneFactory.js` – createFloatingPlatform → iterate over `width` param
- **Modify**: Level config JSON(s) in `client/src/config/` – add `width` where appropriate
- **Create**: `tests/unit/scene-factory-floating-platform-width.test.js`

#### Integration Points
- **Systems affected**: SceneFactory only
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create**: `scene-factory-floating-platform-width.test.js`
- **Key test cases**:
  1. Config with width 192 creates exactly 3 child sprites
  2. Missing width falls back to 64 (single tile)
- **Mock requirements**: Use existing PhaserSceneMock

### Task Breakdown & Acceptance Criteria
- [ ] Update config schema documentation inside SceneFactory JSDoc to mention `width`
- [ ] Extend `createFloatingPlatform` to loop tiles based on `width`, honoring invariant ordering (§13.3)
- [ ] Maintain previous single-tile behaviour when `width` absent
- [ ] Add/adjust level JSON to showcase a 3-tile platform
- [ ] Green unit test proving multi-tile creation

### Expected Output
`npm test` passes; new unit spec proves floating platform width logic; game still loads level with new wider platform visible.

### Risk Assessment
- **Potential complexity**: Low – mirrors existing ground logic. Ensure platforms added to group before `configurePlatform()` per invariant.
- **Dependencies**: None
- **Fallback plan**: Re-enable single-block mode by omitting `width` if regression detected.

### Definition of Done
- [ ] All acceptance criteria satisfied
- [ ] All project tests green (CI)
- [ ] No linter/type errors
- [ ] No new invariants introduced
- [ ] Task marked complete

---

## Task 01.02 – Add Integration Test & Visual Verification for Multi-Width Platforms

### Objective
Validate the in-game behaviour of wider floating platforms via an integration test using PhaserSceneMock and ensure no regressions in collision or hit-box sizing.

### Task Reference
Follows Task 01.01

### Pre-Implementation Analysis
- **Docs**: Same as 01.01 plus testing_best_practices.md → "Integration Tests"
- **State Impact**: None

### Implementation Plan
- **Create**: `tests/integration/floating-platform-width-integration.test.js`
- **Modify**: Jest setup if additional mock data needed

### Testing Strategy
- Spin up SceneFactory with a test config containing a 3-tile floating platform
- Assert:
  1. `platforms.getChildren().length === 3`
  2. Each child has correct x-offset (0,64,128)
  3. Player can stand & collide across full span (simulate collision)

### Acceptance Criteria
- [ ] Test fails before Task 01.01 implementation, passes after
- [ ] No other tests fail

---

## Task 01.03 – Documentation & Cleanup

### Objective
Update developer docs and clean redundant hard-coded ground logic no longer required after width generalisation.

### Plan
- **Modify**: `agent_docs/small_comprehensive_documentation.md` – mention new `width` param
- **Prune**: Obsolete comments in GameScene.createPlatformsHardcoded noting single-block limitation
- **Acceptance**: Docs updated; `npm test` green

---

## Task 01.04 – Extend Moving Platform Width Support

### Objective
Enable moving platforms to support arbitrary widths greater than one tile, maintaining movement patterns across the full platform span.

### Task Reference
Functional Gap 1 – Core Platforming (Moving Platform Extension)

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md**: §12 Moving Platform Invariants (player carrying, time reversal); §13.3 Platform Configuration Ordering
- [ ] **testing_best_practices.md**: "State-Based Testing", "Integration Tests"
- [ ] **small_comprehensive_documentation.md**: §14.2 Component Architecture (MovingPlatform)

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: MovingPlatform state recording/restoration; player carrying mechanics; movement path calculations
- [ ] **New states/invariants**: Movement coordinates must be calculated per-tile – each tile's start/end positions offset by tile width to maintain platform cohesion; when platform changes direction, all tiles must change direction simultaneously to maintain platform integrity
- [ ] **Time reversal compatibility**: Unchanged – state recording already handles position arrays

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `client/src/systems/SceneFactory.js` – createMovingPlatform → iterate over `width` param
- **Modify**: `client/src/entities/MovingPlatform.js` – handle multiple child sprites for movement
- **Create**: `tests/unit/moving-platform-width.test.js`

#### Integration Points
- **Systems affected**: SceneFactory, MovingPlatform, TimeManager (registration unchanged)
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create**: `moving-platform-width.test.js`
- **Key test cases**:
  1. **Constructor & Initialization Tests**
     - MovingPlatform with width 192 creates exactly 3 child sprites (192/64 = 3 tiles)
     - Each child sprite has correct x-offset: sprite[0] at baseX, sprite[1] at baseX+64, sprite[2] at baseX+128
     - All child sprites share same y-coordinate and movement parameters
     - Platform width property correctly stored and accessible

  2. **Movement Cohesion Tests**
     - All child sprites move in perfect sync during forward movement
     - All child sprites move in perfect sync during reverse movement  
     - No gaps appear between child sprites during movement (positions maintain 64px spacing)
     - No overlaps occur between child sprites during movement
     - Movement speed remains consistent across all child sprites

  3. **Direction Change Tests**
     - When platform reaches end point, ALL child sprites change direction simultaneously
     - When platform reaches start point, ALL child sprites change direction simultaneously
     - Bounce mode: all child sprites reverse direction at same frame
     - Loop mode: all child sprites wrap to start position simultaneously

  4. **Path Calculation Tests**
     - Each child sprite's movement path is correctly offset by tile width (64px) from adjacent tiles
     - Child sprite[0] moves from startX to endX
     - Child sprite[1] moves from startX+64 to endX+64  
     - Child sprite[2] moves from startX+128 to endX+128
     - All paths maintain parallel movement with consistent spacing

  5. **Time Reversal Integration Tests**
     - TimeManager.registerEntity called for each child sprite with unique IDs
     - State recording captures position arrays for all child sprites independently
     - Time reversal restores all child sprites to correct relative positions
     - Platform integrity preserved during rewind - no gaps or overlaps introduced
     - Movement state (direction, speed) restored consistently across all child sprites

  6. **Player Interaction Tests**
     - Player collision detection works across entire platform width (not just first tile)
     - Player can stand on any child sprite and be carried by platform movement
     - Player carrying mechanics function correctly when standing on any child sprite
     - Player velocity inheritance works consistently across all platform tiles
     - Player remains attached to platform during direction changes

  7. **Performance & Consistency Tests**
     - Movement speed and timing remain consistent regardless of platform width
     - Frame rate performance not degraded by multiple child sprites
     - Memory usage scales linearly with platform width
     - Update loop efficiency maintained across all child sprites

  8. **Configuration & Factory Tests**
     - SceneFactory correctly loads width parameter from JSON configuration
     - MovingPlatform creation respects width value from level config
     - Default width (64) creates single sprite when width not specified
     - Invalid width values (negative, zero, non-multiples of 64) handled gracefully
     - Width parameter properly passed through factory chain

  9. **Edge Case & Error Handling Tests**
     - Platform with width 64 (single tile) behaves identically to original implementation
     - Platform with maximum reasonable width (e.g., 1024px) functions correctly
     - Graceful handling of width values that don't divide evenly by 64
     - Error handling for missing or invalid width configuration
     - Memory cleanup when platform is destroyed

  10. **Integration State Machine Tests**
      - MovingPlatform state machine transitions work correctly with multiple sprites
      - All child sprites maintain consistent state during platform state changes
      - State recording/restoration works with TimeManager integration
      - Platform state changes (pause, resume, direction) apply to all child sprites
- **Mock requirements**: Use existing PhaserSceneMock + TimeManager mock

### Task Breakdown & Acceptance Criteria
- [ ] Extend `createMovingPlatform` to create multiple sprites based on `width` parameter
- [ ] Modify MovingPlatform to manage child sprites array and apply movement to all
- [ ] Ensure player carrying logic works with multi-sprite platforms
- [ ] Maintain time reversal compatibility for all child sprites
- [ ] Green unit test proving multi-sprite moving platform creation and movement

### Expected Output
`npm test` passes; moving platforms with width > 64 create multiple sprites that move as a unit; player carrying works across full width.

### Risk Assessment
- **Potential complexity**: Medium – need to coordinate movement across multiple sprites while preserving time reversal
- **Dependencies**: Existing MovingPlatform state recording system
- **Fallback plan**: Re-enable single-block mode by omitting `width` if regression detected

### Definition of Done
- [ ] All acceptance criteria satisfied
- [ ] All project tests green (CI)
- [ ] No linter/type errors
- [ ] No new invariants introduced
- [ ] Task marked complete

---

## Task 01.05 – Integration Test for Multi-Width Moving Platforms

### Objective
Validate that multi-width moving platforms work correctly in-game with player interaction and time reversal.

### Task Reference
Follows Task 01.04

### Pre-Implementation Analysis
- **Docs**: Same as 01.04 plus testing_best_practices.md → "Integration Tests"
- **State Impact**: None

### Implementation Plan
- **Create**: `tests/integration/moving-platform-width-integration.test.js`
- **Modify**: Jest setup if additional mock data needed

### Testing Strategy
- Create SceneFactory with test config containing a 3-tile moving platform
- Assert:
  1. `platforms.getChildren().length === 3` for the moving platform
  2. All child sprites move together in sync
  3. Player can stand on any part of the platform and be carried
  4. Time reversal restores all child sprite positions correctly

### Acceptance Criteria
- [ ] Test fails before Task 01.04 implementation, passes after
- [ ] No other tests fail
- [ ] Manual verification shows smooth movement across full platform width 