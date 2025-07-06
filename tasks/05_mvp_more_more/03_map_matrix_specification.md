# Task: Add Map Matrix Specification to Level Format

## Task Title
Update level format to support `"map_matrix"` for 2D tile-based level definition

## Objective
Add support for `"map_matrix"` in the level format - a 2D array (NxM) of tile dictionaries where each entry includes `"tileKey"` (matching valid tiles from available_tiles.md) and `"type"` (either "ground" or "decorative"). Use existing ground and decorative tile handling as reference.

## Task ID: 05.03

## Pre-Implementation Analysis

### Documentation Dependencies
- [ ] **invariants.md sections to review**: "§13 Level/Platform Geometry", "§3 Scene Lifecycle"
- [ ] **testing_best_practices.md sections to apply**: "Level 2: Integration Tests", "State-Based Testing"
- [ ] **level-format.md sections to reference**: "§4 Platform Objects", "§5 Decorative Platforms"
- [ ] **available_tiles.md**: Complete tile reference for tileKey validation

### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: All current platform and decorative platform behavior
- [ ] **New states/invariants to create**: Map matrix parsing logic, tile validation rules
- [ ] **Time reversal compatibility**: Ground platforms participate in physics, decoratives don't (preserved)
- [ ] **Invariant validation**: Must maintain platform physics and decorative rendering contracts

## Implementation Plan

### Files/Classes to Change
- **Create**: None initially
- **Modify**: 
  - `agent_docs/level-creation/level-format.md` (add map_matrix specification)
  - `client/src/systems/SceneFactory.js` (add map_matrix parsing)
  - Level configuration validation logic
  - Integration tests for map_matrix functionality
- **Delete**: None

### Integration Points
- **Systems affected**: Level loading, SceneFactory, platform creation, decorative rendering
- **State machines**: None directly affected
- **External libraries**: None

### Testing Strategy
- **Test files to create/update**: 
  - `tests/integration/scene-factory-map-matrix.test.js`
  - `tests/unit/level-config-map-matrix-validation.test.js`
  - Sample level configurations with map_matrix
- **Key test cases**: 
  - Parse 2D matrix into ground and decorative platforms
  - Validate tileKey against available_tiles.md
  - Handle mixed matrix with ground and decorative types
  - Error handling for invalid tileKey or type values
- **Mock requirements**: 
  - Mock SceneFactory for matrix parsing tests
  - Mock platform creation for integration tests

## Task Breakdown & Acceptance Criteria

### Task 05.03.1: Define Map Matrix Format Specification
- [ ] **Document matrix structure**: Define 2D array format with tile dictionaries
- [ ] **Define tile dictionary schema**: Specify required tileKey and type fields
- [ ] **Document coordinate system**: Define how matrix[row][col] maps to world coordinates
- [ ] **Add to level-format.md**: Include complete specification with examples
- [ ] **Acceptance**: Level format documentation includes complete map_matrix specification

### Task 05.03.2: Add Map Matrix Validation Logic
- [ ] **Create validation function**: Validate matrix structure and tile dictionaries
- [ ] **Validate tileKey values**: Check against available_tiles.md reference
- [ ] **Validate type values**: Ensure only "ground" or "decorative" types
- [ ] **Add error reporting**: Provide clear error messages for invalid configurations
- [ ] **Acceptance**: Robust validation prevents invalid map_matrix configurations

### Task 05.03.3: Implement Map Matrix Parsing in SceneFactory
- [ ] **Add matrix parsing method**: Create method to parse 2D matrix into platform objects
- [ ] **Calculate world positions**: Convert matrix coordinates to world pixel positions
- [ ] **Separate ground and decorative**: Route to appropriate creation methods based on type
- [ ] **Integration with existing code**: Use current platform and decorative creation logic
- [ ] **Acceptance**: SceneFactory can parse map_matrix and create appropriate game objects

### Task 05.03.4: Add Map Matrix Support to Level Loading
- [ ] **Detect map_matrix configuration**: Check for map_matrix in level configuration
- [ ] **Priority handling**: Define precedence between map_matrix and individual platform arrays
- [ ] **Fallback behavior**: Maintain compatibility with existing level format
- [ ] **Error handling**: Graceful degradation when map_matrix parsing fails
- [ ] **Acceptance**: Level loading supports both map_matrix and traditional platform definitions

### Task 05.03.5: Create Integration Tests for Map Matrix
- [ ] **Test basic matrix parsing**: Simple 2x2 matrix with ground and decorative tiles
- [ ] **Test large matrix**: Complex level defined entirely through map_matrix
- [ ] **Test mixed configurations**: Level with both map_matrix and individual platforms
- [ ] **Test error scenarios**: Invalid tileKey, invalid type, malformed matrix
- [ ] **Test files must be easy to load from GameScene**: They must be placed into the path `client/src/config`
- [ ] **Acceptance**: Comprehensive test coverage validates map_matrix functionality

### Task 05.03.6: Update Documentation and Examples
- [ ] **Add example configurations**: Include sample levels using map_matrix
- [ ] **Document best practices**: When to use map_matrix vs individual platform definitions
- [ ] **Update level-format.md**: Complete specification with coordinate system explanation
- [ ] **Create migration guide**: How to convert existing levels to map_matrix format
- [ ] **Acceptance**: Complete documentation supports map_matrix adoption

## Expected Output
- Level format supports `"map_matrix"` 2D array specification
- Each matrix entry contains `{"tileKey": "valid_tile", "type": "ground|decorative"}`
- SceneFactory parses map_matrix into appropriate ground/decorative platforms
- Maintains full backward compatibility with existing level format
- Complete documentation and examples for map_matrix usage
- Robust validation prevents invalid tile configurations

## Risk Assessment
- **Potential complexity**: Coordinate system mapping and tile validation complexity
- **Dependencies**: Must validate against available_tiles.md and maintain tile contracts
- **Fallback plan**: Map_matrix is additive feature - can be disabled if issues arise

## Definition of Done
- [ ] All acceptance criteria are met
- [ ] Expected output is achieved and verified
- [ ] All project tests pass (locally and in CI)
- [ ] Code reviewed and approved
- [ ] **level-format.md updated with map_matrix specification**
- [ ] No new linter or type errors
- [ ] No regressions in related features
- [ ] Task marked as complete in tracking system

## Post-Mortem / Retrospective (fill in if needed)
- _If this task caused test breakage, required significant rework, or revealed process gaps, document what happened and how to avoid it in the future._ 