# Phase 2: Entity Placement & Basic Export
# Fine-Grained Implementation Plan

> **Objective**: Implement player/goal placement with pathfinding validation and create basic JSON export functionality  
> **Tasks**: CG-04.1 through CG-05.4  
> **Expected Duration**: 2-3 days

---

## Task CG-04.1: A* Pathfinding Integration

### Objective
Integrate the pathfinding library with ndarray grids to enable A* pathfinding for cave level solvability validation.

### Task ID: CG-04.1

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **01_blueprint.md sections to review**: "§3.6 Ensuring Level Solvability", "§IV.4 Package: pathfinding"
- [ ] **testing_best_practices.md sections to apply**: "§1.1 TDD for Core Systems"
- [ ] **level-format.md sections to reference**: "§2.1 Player Spawn", "§3.1 Goal Tile"

#### State & Invariant Impact Assessment
- [ ] **New states to create**: Pathfinding grid state, A* search state
- [ ] **Existing states to preserve**: Cave grid structure
- [ ] **Time reversal compatibility**: N/A (generation-time validation)

### Implementation Plan

#### Files/Classes to Change
- **Create**: `server/level-generation/src/pathfinding.js`
- **Modify**: `server/level-generation/index.js` (add pathfinding integration)
- **Delete**: N/A

#### Integration Points
- **Systems affected**: Level solvability validation, reachability analysis
- **State machines**: Pathfinding validation state
- **External libraries**: `pathfinding`

#### Testing Strategy
- **Test files to create/update**: `server/level-generation/test/pathfinding.test.js`
- **Key test cases**: Simple paths, complex paths, no path scenarios, grid conversion
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] **Implement grid conversion**: Create function to convert ndarray to pathfinding grid format
- [ ] **Add A* wrapper**: Create wrapper function for A* pathfinding with proper grid cloning
- [ ] **Create path validation**: Implement function to validate path existence between two points
- [ ] **Add distance calculation**: Create functions for Euclidean and Manhattan distance calculations

### Expected Output
- Functional A* pathfinding integration
- Grid conversion utilities
- Path validation system
- Distance calculation utilities

### Risk Assessment
- **Potential complexity**: Proper grid format conversion and memory management
- **Dependencies**: pathfinding library behavior
- **Fallback plan**: Use simple BFS if A* integration fails

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Pathfinding accurately finds paths in cave structures
- [ ] Grid conversion works correctly
- [ ] All pathfinding tests pass
- [ ] Code reviewed and approved
- [ ] **Document pathfinding interface in level_creation_interfaces_and_invariants.md**
- [ ] No memory leaks in pathfinding operations

---

## Task CG-04.2: Player Spawn Placement

### Objective
Implement player spawn placement system that selects safe, valid spawn locations within the main cave region.

### Task ID: CG-04.2

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **01_blueprint.md sections to review**: "§3.5 Player Start & Goal"
- [ ] **level-format.md sections to reference**: "§2.1 Player Spawn"
- [ ] **_00_v1_functional_requirements.md sections to reference**: "Player spawns over the floor"

#### State & Invariant Impact Assessment
- [ ] **New states to create**: Player spawn placement state, spawn validation
- [ ] **Existing states to preserve**: Cave structure, region identification
- [ ] **Time reversal compatibility**: N/A (generation-time placement)

### Implementation Plan

#### Files/Classes to Change
- **Create**: `server/level-generation/src/spawn-placement.js`
- **Modify**: `server/level-generation/index.js` (add spawn placement)
- **Delete**: N/A

#### Integration Points
- **Systems affected**: Player spawn positioning, level initialization
- **State machines**: Spawn placement state
- **External libraries**: `seedrandom` (via PRNG wrapper)

#### Testing Strategy
- **Test files to create/update**: `server/level-generation/test/spawn-placement.test.js`
- **Key test cases**: Valid spawn locations, spawn safety validation, deterministic placement
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] **Implement spawn candidate identification**: Find all valid floor tiles in main region
- [ ] **Add spawn safety validation**: Ensure spawn locations have adequate clearance
- [ ] **Create deterministic selection**: Use seeded PRNG for consistent spawn placement
- [ ] **Add spawn coordinate conversion**: Convert grid coordinates to pixel coordinates

### Expected Output
- Functional player spawn placement system
- Safety validation for spawn locations
- Deterministic spawn selection
- Coordinate conversion utilities

### Risk Assessment
- **Potential complexity**: Ensuring spawn safety and accessibility
- **Dependencies**: Region detection and cave structure
- **Fallback plan**: Use simple center-of-mass spawn if safety validation fails

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Player spawn is always in safe, accessible location
- [ ] Spawn placement is deterministic
- [ ] All spawn tests pass
- [ ] Code reviewed and approved
- [ ] **Document spawn placement interface in level_creation_interfaces_and_invariants.md**
- [ ] No unsafe spawn locations

---

## Task CG-04.3: Goal Placement with Distance Validation

### Objective
Implement goal placement system that ensures minimum distance from player spawn and validates reachability.

### Task ID: CG-04.3

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **01_blueprint.md sections to review**: "§3.5 Player Start & Goal"
- [ ] **level-format.md sections to reference**: "§3.1 Goal Tile"
- [ ] **_00_v1_functional_requirements.md sections to reference**: "Goal is reachable from player spawn position"

#### State & Invariant Impact Assessment
- [ ] **New states to create**: Goal placement state, distance validation
- [ ] **Existing states to preserve**: Cave structure, player spawn location
- [ ] **Time reversal compatibility**: N/A (generation-time placement)

### Implementation Plan

#### Files/Classes to Change
- **Create**: `server/level-generation/src/goal-placement.js`
- **Modify**: `server/level-generation/src/spawn-placement.js` (add goal integration)
- **Delete**: N/A

#### Integration Points
- **Systems affected**: Goal positioning, level completion validation
- **State machines**: Goal placement state
- **External libraries**: `seedrandom` (via PRNG wrapper)

#### Testing Strategy
- **Test files to create/update**: `server/level-generation/test/goal-placement.test.js`
- **Key test cases**: Minimum distance validation, reachability validation, deterministic placement
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] **Implement goal candidate identification**: Find valid floor tiles meeting distance requirements
- [ ] **Add distance validation**: Ensure goal is minimum distance from spawn
- [ ] **Create reachability validation**: Verify goal is reachable from spawn using pathfinding
- [ ] **Add fallback goal selection**: Select farthest reachable point if no minimum distance candidates

### Expected Output
- Functional goal placement system
- Distance and reachability validation
- Fallback goal selection strategy
- Deterministic goal placement

### Risk Assessment
- **Potential complexity**: Balancing distance requirements with reachability
- **Dependencies**: Player spawn placement and pathfinding integration
- **Fallback plan**: Use largest distance available if minimum distance unreachable

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Goal is always reachable from spawn
- [ ] Distance requirements are met when possible
- [ ] All goal tests pass
- [ ] Code reviewed and approved
- [ ] **Document goal placement interface in level_creation_interfaces_and_invariants.md**
- [ ] No unreachable goals

---

## Task CG-04.4: Level Solvability Validation

### Objective
Implement comprehensive level solvability validation ensuring player can reach goal through A* pathfinding verification.

### Task ID: CG-04.4

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **01_blueprint.md sections to review**: "§3.6 Ensuring Level Solvability"
- [ ] **_00_v1_functional_requirements.md sections to reference**: "Goal is reachable from player spawn position"
- [ ] **testing_best_practices.md sections to apply**: "§1.1 TDD for Core Systems"

#### State & Invariant Impact Assessment
- [ ] **New states to create**: Solvability validation state, path verification
- [ ] **Existing states to preserve**: Cave structure, spawn/goal placement
- [ ] **Time reversal compatibility**: N/A (generation-time validation)

### Implementation Plan

#### Files/Classes to Change
- **Create**: `server/level-generation/src/solvability.js`
- **Modify**: `server/level-generation/index.js` (add solvability validation)
- **Delete**: N/A

#### Integration Points
- **Systems affected**: Level validation, generation quality assurance
- **State machines**: Solvability validation state
- **External libraries**: `pathfinding` (via pathfinding wrapper)

#### Testing Strategy
- **Test files to create/update**: `server/level-generation/test/solvability.test.js`
- **Key test cases**: Solvable levels, unsolvable levels, complex paths, edge cases
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] **Implement path verification**: Create function to verify A* path exists from spawn to goal
- [ ] **Add path quality assessment**: Analyze path characteristics (length, complexity, etc.)
- [ ] **Create solvability reporting**: Generate detailed reports on level solvability
- [ ] **Add regeneration triggers**: Identify when level should be regenerated due to solvability issues

### Expected Output
- Comprehensive solvability validation system
- Path quality assessment metrics
- Detailed solvability reporting
- Regeneration triggers for unsolvable levels

### Risk Assessment
- **Potential complexity**: Handling edge cases in pathfinding validation
- **Dependencies**: A* pathfinding integration and spawn/goal placement
- **Fallback plan**: Use simple connectivity check if A* validation fails

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Solvability validation correctly identifies solvable/unsolvable levels
- [ ] Path quality metrics are meaningful
- [ ] All solvability tests pass
- [ ] Code reviewed and approved
- [ ] **Document solvability interface in level_creation_interfaces_and_invariants.md**
- [ ] No false positives/negatives in solvability detection

---

## Task CG-05.1: Platform Generation from Grid

### Objective
Implement platform generation system that converts cave floor tiles into game platform objects using run-length encoding.

### Task ID: CG-05.1

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **01_blueprint.md sections to review**: "§5.1 Platform Generation", "§5.1.1 Run-Length Encoding"
- [ ] **level-format.md sections to review**: "§4 Platform Objects", "§4.3 Ground Platform"
- [ ] **available_tiles.md sections to reference**: Terrain tile prefixes

#### State & Invariant Impact Assessment
- [ ] **New states to create**: Platform generation state, run-length encoding state
- [ ] **Existing states to preserve**: Cave grid structure
- [ ] **Time reversal compatibility**: Generated platforms must follow platform physics rules

### Implementation Plan

#### Files/Classes to Change
- **Create**: `server/level-generation/src/platform-generation.js`
- **Modify**: `server/level-generation/index.js` (add platform generation)
- **Delete**: N/A

#### Integration Points
- **Systems affected**: JSON export, platform object creation
- **State machines**: Platform generation state
- **External libraries**: None (custom algorithm)

#### Testing Strategy
- **Test files to create/update**: `server/level-generation/test/platform-generation.test.js`
- **Key test cases**: Single platforms, multiple platforms, edge cases, coordinate conversion
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] **Implement run-length encoding**: Create algorithm to group contiguous floor tiles
- [ ] **Add platform object creation**: Generate platform objects with proper properties
- [ ] **Create coordinate conversion**: Convert grid coordinates to pixel coordinates (64px tiles)
- [ ] **Add tile prefix assignment**: Assign appropriate tile prefixes based on biome

### Expected Output
- Functional platform generation from cave grids
- Run-length encoding for contiguous tiles
- Proper coordinate conversion
- Platform objects conforming to level format

### Risk Assessment
- **Potential complexity**: Proper run-length encoding and edge case handling
- **Dependencies**: Cave grid structure and tile naming conventions
- **Fallback plan**: Use individual tile platforms if run-length encoding fails

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Platform generation creates valid platform objects
- [ ] Coordinate conversion is accurate
- [ ] All platform tests pass
- [ ] Code reviewed and approved
- [ ] **Document platform generation interface in level_creation_interfaces_and_invariants.md**
- [ ] No incorrect platform placement

---

## Task CG-05.2: Basic JSON Export Structure

### Objective
Implement basic JSON export system that creates level JSON conforming to the Time Oddity level format specification.

### Task ID: CG-05.2

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **level-format.md sections to review**: "§1 Top-Level Shape", "§2 Player Spawn", "§3 Goal Configuration"
- [ ] **01_blueprint.md sections to review**: "§5.4 Final JSON Assembly"
- [ ] **testing_best_practices.md sections to apply**: "§1.1 TDD for Core Systems"

#### State & Invariant Impact Assessment
- [ ] **New states to create**: JSON export state, level object structure
- [ ] **Existing states to preserve**: All generated level components
- [ ] **Time reversal compatibility**: Exported level must be compatible with game systems

### Implementation Plan

#### Files/Classes to Change
- **Create**: `server/level-generation/src/json-export.js`
- **Modify**: `server/level-generation/index.js` (add JSON export)
- **Delete**: N/A

#### Integration Points
- **Systems affected**: Level serialization, file output
- **State machines**: JSON export state
- **External libraries**: JSON (native)

#### Testing Strategy
- **Test files to create/update**: `server/level-generation/test/json-export.test.js`
- **Key test cases**: Valid JSON structure, schema compliance, coordinate accuracy
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] **Create level object structure**: Build complete level object following format specification
- [ ] **Add component serialization**: Serialize all level components (spawn, goal, platforms)
- [ ] **Implement coordinate conversion**: Ensure all coordinates are in correct pixel format
- [ ] **Add JSON validation**: Validate exported JSON against level format schema

### Expected Output
- Functional JSON export system
- Complete level object structure
- Schema-compliant JSON output
- Coordinate conversion validation

### Risk Assessment
- **Potential complexity**: Ensuring schema compliance and coordinate accuracy
- **Dependencies**: All level generation components
- **Fallback plan**: Use simplified JSON structure if full schema compliance fails

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] JSON export produces valid level format
- [ ] All coordinates are accurate
- [ ] All JSON tests pass
- [ ] Code reviewed and approved
- [ ] **Document JSON export interface in level_creation_interfaces_and_invariants.md**
- [ ] No schema validation errors

---

## Task CG-05.3: Background Layer Generation

### Objective
Implement background layer generation system that creates atmospheric background elements for visual depth.

### Task ID: CG-05.3

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **level-format.md sections to review**: "§9 Background Objects", "§9.1 Background Layer"
- [ ] **01_blueprint.md sections to review**: "§5.3 Entity and Background Serialization"
- [ ] **testing_best_practices.md sections to apply**: "§1.1 TDD for Core Systems"

#### State & Invariant Impact Assessment
- [ ] **New states to create**: Background generation state, layer configuration
- [ ] **Existing states to preserve**: Cave structure, level dimensions
- [ ] **Time reversal compatibility**: Background layers are static elements

### Implementation Plan

#### Files/Classes to Change
- **Create**: `server/level-generation/src/background-generation.js`
- **Modify**: `server/level-generation/src/json-export.js` (add background integration)
- **Delete**: N/A

#### Integration Points
- **Systems affected**: Visual depth, JSON export
- **State machines**: Background generation state
- **External libraries**: None

#### Testing Strategy
- **Test files to create/update**: `server/level-generation/test/background-generation.test.js`
- **Key test cases**: Single layer, multiple layers, depth ordering, sprite key validation
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] **Implement layer generation**: Create background layers with proper positioning
- [ ] **Add depth ordering**: Ensure layers have correct depth values for rendering order
- [ ] **Create sprite key assignment**: Assign appropriate background sprite keys
- [ ] **Add parallax configuration**: Configure parallax scrolling speeds for depth effect

### Expected Output
- Functional background layer generation
- Proper depth ordering system
- Appropriate sprite key assignment
- Parallax scrolling configuration

### Risk Assessment
- **Potential complexity**: Proper depth ordering and sprite key management
- **Dependencies**: Level dimensions and sprite availability
- **Fallback plan**: Use simple single-layer background if complex layering fails

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Background layers provide appropriate visual depth
- [ ] Depth ordering is correct
- [ ] All background tests pass
- [ ] Code reviewed and approved
- [ ] **Document background generation interface in level_creation_interfaces_and_invariants.md**
- [ ] No rendering order issues

---

## Task CG-05.4: Complete Level Integration Test

### Objective
Create comprehensive integration test that validates the complete level generation pipeline from cave generation to JSON export.

### Task ID: CG-05.4

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **testing_best_practices.md sections to apply**: "§1.1 TDD for Core Systems", "§1.2 Test Automation Pyramid"
- [ ] **level-format.md sections to reference**: Complete format specification
- [ ] **_00_v1_functional_requirements.md sections to reference**: All functional requirements

#### State & Invariant Impact Assessment
- [ ] **New states to create**: Integration test state, end-to-end validation
- [ ] **Existing states to preserve**: All level generation components
- [ ] **Time reversal compatibility**: Generated levels must be fully game-compatible

### Implementation Plan

#### Files/Classes to Change
- **Create**: `server/level-generation/test/integration.test.js`
- **Modify**: `server/level-generation/index.js` (add integration entry point)
- **Delete**: N/A

#### Integration Points
- **Systems affected**: Complete level generation pipeline
- **State machines**: Integration test state
- **External libraries**: All previously integrated libraries

#### Testing Strategy
- **Test files to create/update**: `server/level-generation/test/integration.test.js`
- **Key test cases**: Complete level generation, schema validation, functional requirements
- **Mock requirements**: None (full integration test)

### Task Breakdown & Acceptance Criteria
- [ ] **Create end-to-end test**: Test complete pipeline from parameters to JSON output
- [ ] **Add schema validation**: Verify exported JSON fully complies with level format
- [ ] **Implement functional validation**: Test all functional requirements are met
- [ ] **Add performance testing**: Measure generation time and memory usage

### Expected Output
- Comprehensive integration test suite
- Complete pipeline validation
- Schema compliance verification
- Performance benchmarking

### Risk Assessment
- **Potential complexity**: Coordinating all pipeline components
- **Dependencies**: All previous implementation tasks
- **Fallback plan**: Use incremental integration if full pipeline fails

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Integration test validates complete pipeline
- [ ] All functional requirements are verified
- [ ] Performance metrics are within acceptable ranges
- [ ] Code reviewed and approved
- [ ] **Document integration interface in level_creation_interfaces_and_invariants.md**
- [ ] No pipeline integration issues

---

## Phase 2 Success Criteria

### Functional Completeness
- [ ] Player spawn placement with safety validation
- [ ] Goal placement with distance and reachability validation
- [ ] A* pathfinding integration and solvability validation
- [ ] Platform generation from cave grids
- [ ] Basic JSON export conforming to level format

### Visual Verification
- [ ] Generated levels load correctly in game engine
- [ ] Player spawn and goal positions are appropriate
- [ ] Platform objects are correctly positioned and sized
- [ ] Background layers provide proper visual depth

### Test Coverage
- [ ] Unit tests for all placement algorithms
- [ ] Integration tests for pathfinding validation
- [ ] Schema validation tests for JSON export
- [ ] End-to-end tests for complete pipeline

### Performance
- [ ] Level generation remains efficient with entity placement
- [ ] Pathfinding validation completes in reasonable time
- [ ] JSON export processes quickly
- [ ] Memory usage is stable throughout pipeline

### Compatibility
- [ ] Generated JSON is fully compatible with game engine
- [ ] All level format specifications are met
- [ ] Entity placement follows game physics requirements
- [ ] Background layers render correctly

This phase establishes the core level generation capability, producing playable levels with proper entity placement and solvability validation. 