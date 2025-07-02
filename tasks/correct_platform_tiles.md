# Platform Tile Rendering Refactor: Implementation Plan

## 🎯 Objective
Refactor the platform rendering logic to correctly apply tile assets based on platform size (single-block vs. multi-block) using the proper tile naming convention. **Backward compatibility is not required; all upgraded objects must use the new tilePrefix format.**

## 📋 Current State Analysis

### Current Implementation Issues
1. **Single Tile Usage**: All platforms use the same tile (`${tileKey}.png`) regardless of size or position
2. **Missing Visual Distinction**: Multi-block platforms don't visually indicate their structure (left/middle/right tiles)
3. **Inconsistent Naming**: Current implementation doesn't leverage the available tile variants

### Available Tile Assets (from `available_tiles.md`)
- **Block Tiles**: `terrain_grass_block_center`, `terrain_grass_block_left`, `terrain_grass_block_right`
- **Horizontal Tiles**: `terrain_grass_horizontal_left`, `terrain_grass_horizontal_middle`, `terrain_grass_horizontal_right`

### Target Naming Convention
- **Single-block platform**: Use `${tilePrefix}.png` (e.g., `terrain_grass_block_center`)
- **Multi-block platform**: 
  - Left tile: `${tilePrefix}_left.png` (e.g., `terrain_grass_block_left`)
  - Middle tiles: `${tilePrefix}_middle.png` (e.g., `terrain_grass_block_center`)
  - Right tile: `${tilePrefix}_right.png` (e.g., `terrain_grass_block_right`)

## 🛠️ Implementation Plan

### Phase 1: Core Tile Selection Logic (Foundation)

#### Task 1.1: Create Tile Selection Utility
**Objective**: Implement a utility function that determines the correct tile key based on platform position and size.

**Files to Modify**:
- **Create**: `client/src/systems/TileSelector.js` - New utility class for tile selection logic

**Implementation Details**:
- Create `TileSelector` class with static methods for tile selection
- Implement `getTileKey(tilePrefix, position, totalTiles, tileIndex)` method
- Support both block-style (`_left`, `_center`, `_right`) and horizontal-style (`_left`, `_middle`, `_right`) naming
- Handle edge cases (single tile, two tiles, many tiles)

**Testing Strategy**:
- Unit tests for all tile selection scenarios
- Edge case testing (single tile, two tiles, many tiles)
- Validation of tile key generation for different tile prefixes

**Acceptance Criteria**:
- [x] `TileSelector` class created with proper tile selection logic
- [x] Unit tests pass for all tile selection scenarios
- [x] Handles both block and horizontal tile naming conventions
- [x] Returns valid tile keys for all position/size combinations

**User Feedback**:
- [x] After implementation, request user feedback to verify the utility covers all required scenarios.

---

#### Task 1.2: Update SceneFactory Platform Creation Methods
**Objective**: Integrate tile selection logic into SceneFactory platform creation methods.

**Files to Modify**:
- **Modify**: `client/src/systems/SceneFactory.js` - Update platform creation methods
- **Modify**: `client/src/config/test-level.json` - Update to use `tilePrefix` for all upgraded platforms (ground, floating, moving)

**Implementation Details**:
- Import and use `TileSelector` in platform creation methods
- Update `createGroundPlatform()` to use proper horizontal tiles and require `tilePrefix` in config
- Update `createFloatingPlatform()` to use proper block tiles and require `tilePrefix` in config
- Update `createMovingPlatform()` to use proper block tiles and require `tilePrefix` in config
- Remove support for old `tileKey` format for upgraded objects
- Maintain format for objects not part of this task

**Testing Strategy**:
- Integration tests for all platform creation methods
- Verify correct tile keys are used for different platform sizes
- Ensure only upgraded objects use the new format

**Acceptance Criteria**:
- [x] Ground, floating, and moving platforms use `tilePrefix` and correct tile variants
- [x] Single-tile platforms use center/middle tiles
- [x] All existing tests for upgraded objects pass
- [x] Non-upgraded objects retain their format

**User Feedback**:
- [x] After implementation, request user feedback to check the integration and test-level.json changes.

---

### Phase 2: MovingPlatform Integration

#### Task 2.1: Update MovingPlatform Tile Rendering
**Objective**: Update MovingPlatform to use proper tile selection for multi-sprite platforms.

**Files to Modify**:
- **Modify**: `client/src/entities/MovingPlatform.js` - Update sprite creation logic
- **Modify**: `client/src/config/test-level.json` - Update to use `tilePrefix` for all moving platforms

**Implementation Details**:
- Import and use `TileSelector` in MovingPlatform constructor
- Update sprite creation loop to use proper tile keys
- Require `tilePrefix` in config for moving platforms
- Remove support for old `tileKey` format for moving platforms
- Maintain format for objects not part of this task

**Testing Strategy**:
- Unit tests for MovingPlatform tile rendering
- Integration tests for multi-sprite moving platforms
- Verify time reversal compatibility is maintained

**Acceptance Criteria**:
- [x] Multi-sprite moving platforms use correct tile keys via `tilePrefix`
- [x] Single-sprite moving platforms use center tiles
- [x] All existing MovingPlatform functionality preserved
- [x] Time reversal compatibility maintained
- [x] Non-upgraded objects retain their format

**User Feedback**:
- [x] After implementation, request user feedback to check the integration and test-level.json changes.

---

### Phase 3: Configuration and Documentation Updates

#### Task 3.2: Update Level Format Documentation
**Objective**: Update documentation to reflect the new tile prefix system and removal of backward compatibility.

**Files to Modify**:
- **Modify**: `agent_docs/level-creation/level-format.md` - Update documentation
- **Modify**: `agent_docs/invariants.md` (if needed) - Update invariants for new format

**Implementation Details**:
- Add section explaining tile prefix system and new required format
- Update examples to use tile prefixes instead of specific tile keys
- Document the automatic tile selection behavior
- Provide examples of single vs multi-tile platform configurations
- Remove references to backward compatibility

**Testing Strategy**:
- Verify documentation examples are accurate
- Ensure documentation matches actual implementation
- Test that documented configurations work correctly

**Acceptance Criteria**:
- [x] Documentation clearly explains tile prefix system and new requirements
- [x] Examples use correct tile prefixes
- [x] Documentation matches actual implementation
- [x] All documented configurations work correctly

---

### Phase 4: Validation and Testing

#### Task 4.1: Comprehensive Integration Testing
**Objective**: Ensure all platform types render correctly with the new tile system.

**Files to Create/Modify**:
- **Create**: `tests/integration/platform-tile-rendering.test.js` - New integration tests

**Implementation Details**:
- Test all platform types (ground, floating, moving)
- Test single-tile and multi-tile scenarios
- Verify correct tile keys are used for each position
- Test edge cases (2 tiles, many tiles)

**Testing Strategy**:
- Integration tests covering all platform scenarios
- Visual verification of tile rendering
- Performance testing to ensure no regression

**Acceptance Criteria**:
- [x] All platform types render with correct tiles
- [x] Multi-tile platforms show proper left/middle/right structure
- [x] Single-tile platforms use center/middle tiles
- [x] No performance regression in platform rendering

**User Feedback**:
- [x] After implementation, request user feedback to check the integration test results.

---

#### Task 4.2: Visual Validation and Regression Testing
**Objective**: Ensure the visual appearance is correct and no regressions occur.

**Implementation Details**:
- Manual testing of all platform types in game
- Screenshot comparison with expected results
- Performance testing to ensure no rendering slowdown
- Cross-browser testing for consistency

**Testing Strategy**:
- Manual visual inspection of all platform types
- Automated screenshot comparison tests
- Performance benchmarking
- Browser compatibility testing

**Acceptance Criteria**:
- [ ] All platforms have correct visual appearance
- [ ] Multi-tile platforms show proper tile transitions
- [ ] No visual artifacts or rendering issues
- [ ] Performance remains acceptable
- [ ] Works correctly across different browsers

**User Feedback**:
- [ ] After implementation, request user feedback to check the visual results and performance.

---

## 🔄 Execution Order

1. **Task 1.1** - Create Tile Selection Utility (Foundation)
2. **Task 1.2** - Update SceneFactory Platform Creation Methods (and test-level.json for upgraded objects)
3. **Task 2.1** - Update MovingPlatform Tile Rendering (and test-level.json for moving platforms)
4. **Task 3.1** - Update Test Level Configuration (for all upgraded objects)
5. **Task 3.2** - Update Level Format Documentation (and invariants.md if needed)
6. **Task 4.1** - Comprehensive Integration Testing
7. **Task 4.2** - Visual Validation and Regression Testing

## 🎯 Success Criteria

- [ ] All platforms use correct tile variants based on size and position via tilePrefix
- [ ] Multi-block platforms visually indicate their structure
- [ ] Single-block platforms use appropriate center/middle tiles
- [ ] All existing functionality is preserved for upgraded objects
- [ ] Performance is maintained or improved
- [ ] Documentation is updated and accurate
- [ ] All tests pass (unit, integration, visual)
- [ ] User feedback is collected after each phase

## 🚨 Risk Mitigation

### Potential Risks
1. **Breaking Changes**: Modifying platform creation could break existing functionality for non-upgraded objects
2. **Performance Impact**: Additional tile selection logic could impact performance
3. **Visual Inconsistencies**: New tile system might create visual artifacts
4. **Configuration Compatibility**: Existing level configurations must be updated for upgraded objects

### Mitigation Strategies
1. **Incremental Implementation**: Each task is independently testable
2. **No Backward Compatibility**: All upgraded objects must use the new format
3. **Comprehensive Testing**: Extensive testing at each phase
4. **Performance Monitoring**: Monitor rendering performance throughout implementation
5. **Documentation Updates**: Keep documentation in sync with implementation

## 📝 Notes

- This implementation **removes backward compatibility** for upgraded objects; all must use the new tilePrefix format
- The tile selection logic is designed to be extensible for future tile types
- All changes are incremental and independently testable
- Performance impact should be minimal as tile selection is a simple string operation
- The implementation follows the existing architectural patterns in the codebase 