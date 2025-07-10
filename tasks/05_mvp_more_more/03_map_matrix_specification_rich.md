# Task: Add Map Matrix Specification to Level Format

## Task Title
Update level format to support `"map_matrix"` for 2D tile-based level definition

## Objective
Add support for `"map_matrix"` in the level format - a 2D array (NxM) of tile dictionaries where each entry includes `"tileKey"` (matching valid tiles from available_tiles.md) and `"type"` (either "ground" or "decorative"). Use existing ground and decorative tile handling as reference.

## Task ID: 05.03

## Pre-Implementation Analysis

### Documentation Dependencies
- [x] **invariants.md sections to review**: "§13 Level/Platform Geometry", "§3 Scene Lifecycle", "§15 Asset & Animation Keys"
- [x] **testing_best_practices.md sections to apply**: "Level 2: Integration Tests", "State-Based Testing", "Centralized Mock Architecture"
- [x] **level-format.md sections to reference**: "§4 Platform Objects", "§5 Decorative Platforms", "§10 Extensibility Rules"
- [x] **available_tiles.md**: Complete tile reference for tileKey validation
- [x] **comprehensive_documentation.md sections to reference**: "§1.2 Scene System", "§6.1 Build Pipeline", "§7.1 Time Control System"

### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: All current platform and decorative platform behavior, SceneFactory configuration loading, TileSelector tile selection logic
- [x] **New states/invariants to create**: Map matrix parsing logic, tile validation rules, coordinate system mapping
- [x] **Time reversal compatibility**: Ground platforms participate in physics, decoratives don't (preserved)
- [x] **Invariant validation**: Must maintain platform physics and decorative rendering contracts, preserve existing SceneFactory API

## Implementation Plan

### Files/Classes to Change
- **Create**: 
  - `client/src/config/map-matrix-example.json` (sample configuration)
  - `tests/integration/scene-factory-map-matrix.test.js` (integration tests)
  - `tests/unit/map-matrix-validation.test.js` (validation unit tests)
- **Modify**: 
  - `agent_docs/level-creation/level-format.md` (add map_matrix specification)
  - `client/src/systems/SceneFactory.js` (add map_matrix parsing)
  - `client/src/systems/TileSelector.js` (extend for matrix coordinate mapping)
  - `client/src/scenes/GameScene.js` (integrate map_matrix loading)
- **Delete**: None

### Integration Points
- **Systems affected**: Level loading, SceneFactory, platform creation, decorative rendering, TileSelector
- **State machines**: None directly affected
- **External libraries**: None

### Testing Strategy
- **Test files to create/update**: 
  - `tests/integration/scene-factory-map-matrix.test.js`
  - `tests/unit/map-matrix-validation.test.js`
  - `tests/integration/game-scene-map-matrix.test.js`
  - Sample level configurations with map_matrix
- **Key test cases**: 
  - Parse 2D matrix into ground and decorative platforms
  - Validate tileKey against available_tiles.md
  - Handle mixed matrix with ground and decorative types
  - Error handling for invalid tileKey or type values
  - Coordinate system mapping accuracy
  - Backward compatibility with existing level format
- **Mock requirements**: 
  - Mock SceneFactory for matrix parsing tests
  - Mock platform creation for integration tests
  - Mock TileSelector for coordinate mapping tests

## Task Breakdown & Acceptance Criteria

### Task 05.03.1: Define Map Matrix Format Specification
- [x] **Document matrix structure**: Define 2D array format with tile dictionaries
- [x] **Define tile dictionary schema**: Specify required tileKey and type fields
- [x] **Document coordinate system**: Define how matrix[row][col] maps to world coordinates
- [x] **Add to level-format.md**: Include complete specification with examples
- [x] **Document tileKey validation**: Reference available_tiles.md for valid tile keys
- [x] **Document type validation**: Only "ground" or "decorative" types allowed
- [x] **Document coordinate mapping**: Matrix position to world pixel conversion
- [x] **Acceptance**: Level format documentation includes complete map_matrix specification with coordinate system

**Implementation Guidelines:**
- Follow existing level-format.md structure and style
- Include comprehensive examples showing different matrix sizes
- Document coordinate system: matrix[0][0] = world position (0,0), each cell = 64x64 pixels
- Reference available_tiles.md for complete tile key validation
- Include error handling documentation for invalid configurations

**Testing Guidelines:**
- Create unit tests for coordinate mapping calculations
- Test matrix parsing with various sizes (1x1, 2x2, 10x10)
- Validate tileKey references against available_tiles.md
- Test type validation for ground/decorative only

**Documentation Requirements:**
- Update level-format.md with complete map_matrix section
- Include coordinate system explanation with visual examples
- Document tileKey validation rules and error messages
- Add migration guide from individual platform definitions

### Task 05.03.2: Add Map Matrix Validation Logic
- [x] **Create validation function**: Validate matrix structure and tile dictionaries
- [x] **Validate tileKey values**: Check against available_tiles.md reference
- [x] **Validate type values**: Ensure only "ground" or "decorative" types
- [x] **Add error reporting**: Provide clear error messages for invalid configurations
- [x] **Validate matrix dimensions**: Ensure 2D array structure is valid
- [x] **Validate coordinate bounds**: Check matrix size doesn't exceed reasonable limits
- [x] **Acceptance**: Robust validation prevents invalid map_matrix configurations

**Implementation Guidelines:**
- Create `validateMapMatrixConfiguration()` method in SceneFactory
- Import available_tiles.md data for tileKey validation
- Use descriptive error messages for each validation failure
- Follow existing validation patterns in SceneFactory
- Add validation to `loadConfiguration()` method

**Testing Guidelines:**
- Test all validation scenarios: invalid tileKey, invalid type, malformed matrix
- Test edge cases: empty matrix, single cell, very large matrix
- Test error message clarity and specificity
- Mock available_tiles.md data for comprehensive tileKey testing

**Documentation Requirements:**
- Document validation error codes and messages
- Add validation examples to level-format.md
- Document maximum matrix size limits and reasoning

### Task 05.03.3: Implement Map Matrix Parsing in SceneFactory
- [ ] **Add matrix parsing method**: Create method to parse 2D matrix into platform objects
- [ ] **Calculate world positions**: Convert matrix coordinates to world pixel positions
- [ ] **Separate ground and decorative**: Route to appropriate creation methods based on type
- [ ] **Integration with existing code**: Use current platform and decorative creation logic
- [ ] **Handle tile selection**: Use TileSelector for appropriate tile variants
- [ ] **Support multi-tile platforms**: Handle ground platforms that span multiple matrix cells
- [ ] **Acceptance**: SceneFactory can parse map_matrix and create appropriate game objects

**Implementation Guidelines:**
- Create `parseMapMatrix()` method in SceneFactory
- Use existing `createGroundPlatform()` and `createDecorativePlatform()` methods
- Implement coordinate mapping: matrix[row][col] → world(x, y)
- Handle tile selection using TileSelector.getTileKey()
- Support ground platform width calculation from matrix data
- Follow existing SceneFactory patterns and error handling

**Testing Guidelines:**
- Test coordinate mapping accuracy with known matrix positions
- Test tile selection for different matrix configurations
- Test integration with existing platform creation methods
- Test error handling for invalid matrix data
- Mock TileSelector for isolated testing

**Documentation Requirements:**
- Document coordinate mapping algorithm
- Add parsing examples to SceneFactory documentation
- Document integration points with existing platform creation

### Task 05.03.4: Extend TileSelector for Matrix Coordinate Mapping
- [ ] **Add matrix coordinate methods**: Create methods for matrix position to world coordinate conversion
- [ ] **Support matrix tile selection**: Extend getTileKey for matrix-based tile selection
- [ ] **Handle matrix boundaries**: Detect matrix edges for proper tile variant selection
- [ ] **Support ground platform width**: Calculate platform width from matrix data
- [ ] **Maintain backward compatibility**: Ensure existing TileSelector methods still work
- [ ] **Acceptance**: TileSelector supports matrix coordinate mapping and tile selection

**Implementation Guidelines:**
- Add `getMatrixTileKey()` method to TileSelector
- Add `matrixToWorldCoordinates()` utility method
- Extend existing `getTileKey()` to handle matrix context
- Use 64x64 pixel tile size as constant
- Follow existing TileSelector patterns and error handling

**Testing Guidelines:**
- Test coordinate conversion accuracy
- Test tile selection for matrix boundaries
- Test backward compatibility with existing methods
- Test error handling for invalid matrix coordinates
- Mock matrix data for comprehensive testing

**Documentation Requirements:**
- Document matrix coordinate mapping algorithm
- Add examples to TileSelector documentation
- Document tile selection logic for matrix boundaries

### Task 05.03.5: Add Map Matrix Support to Level Loading
- [ ] **Detect map_matrix configuration**: Check for map_matrix in level configuration
- [ ] **Priority handling**: Define precedence between map_matrix and individual platform arrays
- [ ] **Fallback behavior**: Maintain compatibility with existing level format
- [ ] **Error handling**: Graceful degradation when map_matrix parsing fails
- [ ] **Integration with GameScene**: Update GameScene to handle map_matrix loading
- [ ] **Acceptance**: Level loading supports both map_matrix and traditional platform definitions

**Implementation Guidelines:**
- Modify `loadConfiguration()` to detect and validate map_matrix
- Implement precedence: map_matrix overrides individual platform arrays
- Add fallback to existing platform creation if map_matrix fails
- Update GameScene.create() to handle map_matrix loading
- Follow existing error handling patterns

**Testing Guidelines:**
- Test precedence between map_matrix and individual platforms
- Test fallback behavior when map_matrix is invalid
- Test integration with GameScene level loading
- Test error handling and graceful degradation
- Mock level configuration for comprehensive testing

**Documentation Requirements:**
- Document precedence rules in level-format.md
- Add integration examples to GameScene documentation
- Document fallback behavior and error handling

### Task 05.03.6: Create Integration Tests for Map Matrix
- [ ] **Test basic matrix parsing**: Simple 2x2 matrix with ground and decorative tiles
- [ ] **Test large matrix**: Complex level defined entirely through map_matrix
- [ ] **Test mixed configurations**: Level with both map_matrix and individual platforms
- [ ] **Test error scenarios**: Invalid tileKey, invalid type, malformed matrix
- [ ] **Test coordinate mapping**: Verify matrix positions map to correct world coordinates
- [ ] **Test files must be easy to load from GameScene**: They must be placed into the path `client/src/config`
- [ ] **Acceptance**: Comprehensive test coverage validates map_matrix functionality

**Implementation Guidelines:**
- Create `tests/integration/scene-factory-map-matrix.test.js`
- Create sample level configurations in `client/src/config/`
- Test all matrix parsing scenarios and edge cases
- Use existing test patterns and mock structures
- Follow integration testing best practices

**Testing Guidelines:**
- Test matrix parsing with various sizes and configurations
- Test coordinate mapping accuracy
- Test tile selection and platform creation
- Test error handling and validation
- Test integration with existing level loading
- Mock SceneFactory and TileSelector for isolated testing

**Documentation Requirements:**
- Document test scenarios and expected outcomes
- Add test examples to testing documentation
- Document integration test patterns for future features

### Task 05.03.7: Create Sample Level Configurations
- [ ] **Create basic matrix example**: Simple 3x3 matrix with mixed ground/decorative tiles
- [ ] **Create complex matrix example**: Large matrix at least 70x70 with varied tile types. It must enclose player position, goal, coins and other platforms. Add coins and other platforms, use `client/src/config/test-level.json` as example. Do a simple script to create the file
- [ ] **Create mixed configuration example**: Level with both map_matrix and individual platforms
- [ ] **Create error example**: Invalid matrix for testing error handling
- [ ] **Place in client/src/config/**: Ensure files are accessible to GameScene
- [ ] **Acceptance**: Sample configurations demonstrate map_matrix usage and testing

**Implementation Guidelines:**
- Create `client/src/config/map-matrix-basic.json`
- Create `client/src/config/map-matrix-complex.json`
- Create `client/src/config/map-matrix-mixed.json`
- Create `client/src/config/map-matrix-error.json`
- Follow existing level configuration patterns
- Include comprehensive comments and documentation

**Testing Guidelines:**
- Test loading each sample configuration
- Test coordinate mapping accuracy
- Test tile selection and platform creation
- Test error handling for invalid configurations
- Verify integration with GameScene loading

**Documentation Requirements:**
- Document each sample configuration purpose
- Add usage examples to level-format.md
- Document configuration patterns and best practices

### Task 05.03.8: Update Documentation and Examples
- [ ] **Add example configurations**: Include sample levels using map_matrix
- [ ] **Document best practices**: When to use map_matrix vs individual platform definitions
- [ ] **Update level-format.md**: Complete specification with coordinate system explanation
- [ ] **Create migration guide**: How to convert existing levels to map_matrix format
- [ ] **Update SceneFactory documentation**: Document new map_matrix methods
- [ ] **Acceptance**: Complete documentation supports map_matrix adoption

**Implementation Guidelines:**
- Update `agent_docs/level-creation/level-format.md`
- Add comprehensive examples and use cases
- Document coordinate system and mapping rules
- Create migration guide with step-by-step instructions
- Update SceneFactory JSDoc comments

**Testing Guidelines:**
- Verify documentation accuracy against implementation
- Test all documented examples
- Validate migration guide with real level conversions
- Test documentation completeness and clarity

**Documentation Requirements:**
- Complete level-format.md specification
- Migration guide with examples
- Best practices documentation
- Updated SceneFactory API documentation

## Expected Output
- Level format supports `"map_matrix"` 2D array specification
- Each matrix entry contains `{"tileKey": "valid_tile", "type": "ground|decorative"}`
- SceneFactory parses map_matrix into appropriate ground/decorative platforms
- Maintains full backward compatibility with existing level format
- Complete documentation and examples for map_matrix usage
- Robust validation prevents invalid tile configurations
- Comprehensive test coverage validates all functionality
- Sample level configurations demonstrate usage patterns

## Risk Assessment
- **Potential complexity**: Coordinate system mapping and tile validation complexity
- **Dependencies**: Must validate against available_tiles.md and maintain tile contracts
- **Integration risks**: Changes to SceneFactory could affect existing functionality
- **Performance risks**: Large matrices could impact loading performance
- **Fallback plan**: Map_matrix is additive feature - can be disabled if issues arise

## Definition of Done
- [ ] All acceptance criteria are met
- [ ] Expected output is achieved and verified
- [ ] All project tests pass (locally and in CI)
- [ ] Code reviewed and approved
- [ ] **level-format.md updated with map_matrix specification**
- [ ] **SceneFactory documentation updated with new methods**
- [ ] **Sample configurations created and tested**
- [ ] No new linter or type errors
- [ ] No regressions in related features
- [ ] Backward compatibility maintained
- [ ] Task marked as complete in tracking system

## Post-Mortem / Retrospective (fill in if needed)
- _If this task caused test breakage, required significant rework, or revealed process gaps, document what happened and how to avoid it in the future._

## Implementation Notes

### Coordinate System Mapping
The map matrix uses a 2D array where each cell represents a 64x64 pixel tile:
- `matrix[0][0]` = world position (0, 0)
- `matrix[row][col]` = world position (col * 64, row * 64)
- Matrix dimensions determine level size: width = cols * 64, height = rows * 64

### Tile Selection Logic
- Single tiles: Use base tileKey directly
- Multi-tile platforms: Use TileSelector.getTileKey() for appropriate variants
- Ground platforms: Support width calculation from matrix data
- Decorative platforms: Individual tiles with depth rendering

### Validation Rules
- tileKey must exist in available_tiles.md
- type must be "ground" or "decorative"
- Matrix must be 2D array with valid dimensions
- Maximum matrix size: 100x100 (performance limit)
- All matrix entries must have required fields

### Integration Points
- SceneFactory.loadConfiguration(): Add map_matrix validation
- SceneFactory.createPlatformsFromConfig(): Add map_matrix parsing
- TileSelector: Add matrix coordinate mapping methods
- GameScene.create(): Handle map_matrix loading
- Existing platform creation methods: Reused for actual object creation 