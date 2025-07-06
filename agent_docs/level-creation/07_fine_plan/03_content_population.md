# Phase 3: Content Population
# Fine-Grained Implementation Plan

> **Objective**: Implement decorative tile system, strategic coin distribution, and intelligent enemy placement  
> **Tasks**: CG-06.1 through CG-08.4  
> **Expected Duration**: 3-4 days

---

## Task CG-06.1: Tile Neighbor Analysis System

### Objective
Implement the "tile autopsy" system that analyzes wall tile neighbors to determine appropriate decorative tile selection.

### Task ID: CG-06.1

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **01_blueprint.md sections to review**: "§5.2 Decorative Tile Generation", "Tile Autopsy Logic"
- [ ] **level-format.md sections to reference**: "§5 Decorative Platforms"
- [ ] **available_tiles.md sections to reference**: Decorative tile naming conventions

#### State & Invariant Impact Assessment
- [ ] **New states to create**: Tile autopsy state, neighbor analysis state
- [ ] **Existing states to preserve**: Cave wall structure
- [ ] **Time reversal compatibility**: Decorative tiles are non-interactive background elements

### Implementation Plan

#### Files/Classes to Change
- **Create**: `server/level-generation/src/tile-autopsy.js`
- **Modify**: `server/level-generation/index.js` (add tile analysis)
- **Delete**: N/A

#### Integration Points
- **Systems affected**: Decorative tile placement, visual cave structure
- **State machines**: Tile autopsy analysis state
- **External libraries**: None (custom neighbor analysis)

#### Testing Strategy
- **Test files to create/update**: `server/level-generation/test/tile-autopsy.test.js`
- **Key test cases**: Corner detection, edge detection, center detection, boundary handling
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] **Implement 8-directional neighbor analysis**: Create function to analyze all 8 neighboring tiles
- [ ] **Add corner detection logic**: Identify inner and outer corners with proper suffix assignment
- [ ] **Create edge detection system**: Detect edges and assign appropriate directional suffixes
- [ ] **Add center tile identification**: Identify center tiles surrounded by walls

### Expected Output
- Functional tile neighbor analysis system
- Accurate corner and edge detection
- Proper tile suffix assignment based on context
- Comprehensive boundary condition handling

### Risk Assessment
- **Potential complexity**: Proper handling of all neighbor combinations
- **Dependencies**: Cave grid structure and tile naming conventions
- **Fallback plan**: Use simple center tile assignment if complex analysis fails

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Neighbor analysis correctly identifies all tile types
- [ ] Tile suffix assignment is accurate
- [ ] All autopsy tests pass
- [ ] Code reviewed and approved
- [ ] **Document tile autopsy interface in level_creation_interfaces_and_invariants.md**
- [ ] No incorrect tile type assignments

---

## Task CG-06.2: Decorative Tile Object Generation

### Objective
Implement decorative tile object generation system that creates non-collidable visual elements from wall tiles.

### Task ID: CG-06.2

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **01_blueprint.md sections to review**: "§5.2 Decorative Tile Generation"
- [ ] **level-format.md sections to reference**: "§5 Decorative Platforms"
- [ ] **available_tiles.md sections to reference**: Complete tile prefix list

#### State & Invariant Impact Assessment
- [ ] **New states to create**: Decorative tile generation state, depth management
- [ ] **Existing states to preserve**: Cave wall structure, tile autopsy results
- [ ] **Time reversal compatibility**: Decorative tiles are static background elements

### Implementation Plan

#### Files/Classes to Change
- **Create**: `server/level-generation/src/decorative-generation.js`
- **Modify**: `server/level-generation/src/json-export.js` (add decorative integration)
- **Delete**: N/A

#### Integration Points
- **Systems affected**: Decorative tile placement, JSON export
- **State machines**: Decorative generation state
- **External libraries**: None

#### Testing Strategy
- **Test files to create/update**: `server/level-generation/test/decorative-generation.test.js`
- **Key test cases**: Tile object creation, depth assignment, coordinate conversion, prefix validation
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] **Implement decorative object creation**: Generate decorative platform objects from wall tiles
- [ ] **Add depth assignment**: Assign appropriate negative depth values for background rendering
- [ ] **Create coordinate conversion**: Convert grid coordinates to pixel coordinates for decorative tiles
- [ ] **Add tile prefix validation**: Ensure all tile prefixes exist in available tiles

### Expected Output
- Functional decorative tile object generation
- Proper depth ordering for background rendering
- Accurate coordinate conversion
- Tile prefix validation system

### Risk Assessment
- **Potential complexity**: Proper depth management and coordinate conversion
- **Dependencies**: Tile autopsy system and available tile prefixes
- **Fallback plan**: Use simple decorative placement if complex generation fails

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Decorative tiles render correctly in background
- [ ] Depth ordering is appropriate
- [ ] All decorative tests pass
- [ ] Code reviewed and approved
- [ ] **Document decorative generation interface in level_creation_interfaces_and_invariants.md**
- [ ] No rendering order issues

---

## Task CG-06.3: Biome-Aware Tile Selection

### Objective
Implement biome-aware tile selection system that chooses appropriate tile themes based on cave characteristics.

### Task ID: CG-06.3

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **01_blueprint.md sections to review**: "§5.2 Decorative Tile Generation"
- [ ] **available_tiles.md sections to reference**: All terrain tile families
- [ ] **level-format.md sections to reference**: "§5 Decorative Platforms"

#### State & Invariant Impact Assessment
- [ ] **New states to create**: Biome selection state, theme consistency
- [ ] **Existing states to preserve**: Cave structure, decorative tile placement
- [ ] **Time reversal compatibility**: Biome selection is static for level generation

### Implementation Plan

#### Files/Classes to Change
- **Create**: `server/level-generation/src/biome-selection.js`
- **Modify**: `server/level-generation/src/decorative-generation.js` (add biome integration)
- **Delete**: N/A

#### Integration Points
- **Systems affected**: Tile theme selection, visual consistency
- **State machines**: Biome selection state
- **External libraries**: `seedrandom` (via PRNG wrapper)

#### Testing Strategy
- **Test files to create/update**: `server/level-generation/test/biome-selection.test.js`
- **Key test cases**: Biome selection logic, theme consistency, deterministic selection
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] **Implement biome selection algorithm**: Choose biome based on cave characteristics
- [ ] **Add theme consistency**: Ensure all tiles use consistent theme throughout level
- [ ] **Create biome-specific tile mapping**: Map generic tile types to biome-specific prefixes
- [ ] **Add deterministic theme selection**: Use seeded PRNG for consistent biome selection

### Expected Output
- Functional biome-aware tile selection
- Consistent theme throughout level
- Deterministic biome selection
- Comprehensive tile mapping system

### Risk Assessment
- **Potential complexity**: Maintaining theme consistency across all tile types
- **Dependencies**: Available tile prefixes and cave structure analysis
- **Fallback plan**: Use default grass theme if biome selection fails

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Biome selection produces visually consistent levels
- [ ] Theme consistency is maintained throughout
- [ ] All biome tests pass
- [ ] Code reviewed and approved
- [ ] **Document biome selection interface in level_creation_interfaces_and_invariants.md**
- [ ] No theme inconsistencies

---

## Task CG-06.4: Decorative Tile Validation

### Objective
Implement validation system for decorative tiles to ensure visual coherence and proper placement.

### Task ID: CG-06.4

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **01_blueprint.md sections to review**: "§5.2 Decorative Tile Generation"
- [ ] **_00_v1_functional_requirements.md sections to reference**: "All decorative tiles are properly over the ground"
- [ ] **testing_best_practices.md sections to apply**: "§1.1 TDD for Core Systems"

#### State & Invariant Impact Assessment
- [ ] **New states to create**: Decorative validation state, placement verification
- [ ] **Existing states to preserve**: Cave structure, decorative tile placement
- [ ] **Time reversal compatibility**: Decorative validation is generation-time only

### Implementation Plan

#### Files/Classes to Change
- **Create**: `server/level-generation/src/decorative-validation.js`
- **Modify**: `server/level-generation/src/decorative-generation.js` (add validation)
- **Delete**: N/A

#### Integration Points
- **Systems affected**: Decorative tile quality assurance
- **State machines**: Decorative validation state
- **External libraries**: None

#### Testing Strategy
- **Test files to create/update**: `server/level-generation/test/decorative-validation.test.js`
- **Key test cases**: Placement validation, floating tile detection, visual coherence
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] **Implement placement validation**: Verify decorative tiles are properly positioned
- [ ] **Add floating tile detection**: Identify and fix floating decorative elements
- [ ] **Create visual coherence checking**: Ensure decorative tiles form coherent visual patterns
- [ ] **Add validation reporting**: Generate reports on decorative tile quality

### Expected Output
- Comprehensive decorative tile validation
- Floating tile detection and correction
- Visual coherence verification
- Detailed validation reporting

### Risk Assessment
- **Potential complexity**: Defining appropriate visual coherence rules
- **Dependencies**: Decorative tile generation and cave structure
- **Fallback plan**: Use basic placement validation if complex coherence checking fails

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Decorative validation prevents visual issues
- [ ] No floating or misplaced decorative tiles
- [ ] All decorative validation tests pass
- [ ] Code reviewed and approved
- [ ] **Document decorative validation interface in level_creation_interfaces_and_invariants.md**
- [ ] No visual coherence issues

---

## Task CG-07.1: Coin Distribution Strategy

### Objective
Implement strategic coin distribution system that places coins in interesting locations to encourage exploration.

### Task ID: CG-07.1

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **01_blueprint.md sections to review**: "§3.7 Strategic Coin Placement"
- [ ] **level-format.md sections to reference**: "§7 Collectible Objects"
- [ ] **_00_v1_functional_requirements.md sections to reference**: "All coins are collectible"

#### State & Invariant Impact Assessment
- [ ] **New states to create**: Coin distribution state, placement strategy
- [ ] **Existing states to preserve**: Cave structure, entity placement
- [ ] **Time reversal compatibility**: Coins must follow time reversal mechanics

### Implementation Plan

#### Files/Classes to Change
- **Create**: `server/level-generation/src/coin-distribution.js`
- **Modify**: `server/level-generation/index.js` (add coin distribution)
- **Delete**: N/A

#### Integration Points
- **Systems affected**: Coin placement, exploration encouragement
- **State machines**: Coin distribution state
- **External libraries**: `seedrandom` (via PRNG wrapper)

#### Testing Strategy
- **Test files to create/update**: `server/level-generation/test/coin-distribution.test.js`
- **Key test cases**: Distribution strategies, density control, placement validation
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] **Implement distribution strategies**: Create multiple coin placement strategies (even, clustered, path-based)
- [ ] **Add density control**: Ensure appropriate coin density across cave areas
- [ ] **Create dead-end detection**: Identify dead-end areas for strategic coin placement
- [ ] **Add placement validation**: Verify coins are placed in accessible locations

### Expected Output
- Strategic coin distribution system
- Multiple placement strategies
- Density control mechanisms
- Dead-end detection for interesting placement

### Risk Assessment
- **Potential complexity**: Balancing different distribution strategies
- **Dependencies**: Cave structure analysis and reachability validation
- **Fallback plan**: Use simple even distribution if strategic placement fails

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Coin distribution encourages exploration
- [ ] Density control prevents over/under-population
- [ ] All coin distribution tests pass
- [ ] Code reviewed and approved
- [ ] **Document coin distribution interface in level_creation_interfaces_and_invariants.md**
- [ ] No inaccessible coin placement

---

## Task CG-07.2: Coin Reachability Validation

### Objective
Implement comprehensive coin reachability validation ensuring all placed coins are collectible by the player.

### Task ID: CG-07.2

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **01_blueprint.md sections to review**: "§3.7 Strategic Coin Placement"
- [ ] **_00_v1_functional_requirements.md sections to reference**: "All coins are collectible"
- [ ] **testing_best_practices.md sections to apply**: "§1.1 TDD for Core Systems"

#### State & Invariant Impact Assessment
- [ ] **New states to create**: Coin reachability state, validation results
- [ ] **Existing states to preserve**: Cave structure, coin placement
- [ ] **Time reversal compatibility**: Reachability validation is generation-time only

### Implementation Plan

#### Files/Classes to Change
- **Create**: `server/level-generation/src/coin-reachability.js`
- **Modify**: `server/level-generation/src/coin-distribution.js` (add reachability validation)
- **Delete**: N/A

#### Integration Points
- **Systems affected**: Coin placement validation, pathfinding
- **State machines**: Reachability validation state
- **External libraries**: `pathfinding` (via pathfinding wrapper)

#### Testing Strategy
- **Test files to create/update**: `server/level-generation/test/coin-reachability.test.js`
- **Key test cases**: Reachable coins, unreachable coins, path validation, repositioning
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] **Implement reachability checking**: Verify pathfinding from spawn to each coin
- [ ] **Add batch validation**: Efficiently validate multiple coins simultaneously
- [ ] **Create repositioning logic**: Move unreachable coins to reachable locations
- [ ] **Add reachability reporting**: Generate detailed reachability reports

### Expected Output
- Comprehensive coin reachability validation
- Efficient batch validation system
- Automatic repositioning for unreachable coins
- Detailed reachability reporting

### Risk Assessment
- **Potential complexity**: Efficient pathfinding for multiple coins
- **Dependencies**: Pathfinding integration and coin placement
- **Fallback plan**: Use simplified reachability checks if complex validation fails

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] All coins are guaranteed reachable
- [ ] Validation is efficient for multiple coins
- [ ] All reachability tests pass
- [ ] Code reviewed and approved
- [ ] **Document coin reachability interface in level_creation_interfaces_and_invariants.md**
- [ ] No unreachable coins in generated levels

---

## Task CG-07.3: Coin Clustering and Rewards

### Objective
Implement coin clustering system that creates interesting reward patterns and encourages strategic player movement.

### Task ID: CG-07.3

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **01_blueprint.md sections to review**: "§3.7 Strategic Coin Placement"
- [ ] **_00_v1_functional_requirements.md sections to reference**: "Decorative Coin Clusters on Platforms"
- [ ] **level-format.md sections to reference**: "§7 Collectible Objects"

#### State & Invariant Impact Assessment
- [ ] **New states to create**: Coin clustering state, reward pattern state
- [ ] **Existing states to preserve**: Cave structure, coin distribution
- [ ] **Time reversal compatibility**: Coin clusters must follow time reversal mechanics

### Implementation Plan

#### Files/Classes to Change
- **Create**: `server/level-generation/src/coin-clustering.js`
- **Modify**: `server/level-generation/src/coin-distribution.js` (add clustering)
- **Delete**: N/A

#### Integration Points
- **Systems affected**: Coin placement patterns, reward distribution
- **State machines**: Coin clustering state
- **External libraries**: `seedrandom` (via PRNG wrapper)

#### Testing Strategy
- **Test files to create/update**: `server/level-generation/test/coin-clustering.test.js`
- **Key test cases**: Cluster formation, reward density, pattern validation
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] **Implement clustering algorithms**: Create multiple coin clustering patterns
- [ ] **Add reward density control**: Ensure appropriate reward distribution
- [ ] **Create cluster validation**: Verify clusters are accessible and interesting
- [ ] **Add pattern variety**: Implement different clustering patterns for variety

### Expected Output
- Functional coin clustering system
- Multiple clustering patterns
- Reward density control
- Cluster accessibility validation

### Risk Assessment
- **Potential complexity**: Balancing clustering with accessibility
- **Dependencies**: Coin distribution and reachability validation
- **Fallback plan**: Use simple clustering if complex patterns fail

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Coin clusters create interesting reward patterns
- [ ] Clustering maintains accessibility
- [ ] All clustering tests pass
- [ ] Code reviewed and approved
- [ ] **Document coin clustering interface in level_creation_interfaces_and_invariants.md**
- [ ] No inaccessible or poorly distributed clusters

---

## Task CG-08.1: Enemy Placement Candidate Identification

### Objective
Implement system to identify strategic enemy placement candidates including choke points and high-reward areas.

### Task ID: CG-08.1

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **01_blueprint.md sections to review**: "§3.8 Intelligent Enemy Placement"
- [ ] **level-format.md sections to reference**: "§8 Enemy Objects", "§8.2 LoopHound Enemy"
- [ ] **_00_v1_functional_requirements.md sections to reference**: "Enemy and Obstacle Placement"

#### State & Invariant Impact Assessment
- [ ] **New states to create**: Enemy placement candidate state, strategic analysis
- [ ] **Existing states to preserve**: Cave structure, coin placement
- [ ] **Time reversal compatibility**: Enemies must follow Enemy/Freeze Contract

### Implementation Plan

#### Files/Classes to Change
- **Create**: `server/level-generation/src/enemy-placement.js`
- **Modify**: `server/level-generation/index.js` (add enemy placement)
- **Delete**: N/A

#### Integration Points
- **Systems affected**: Enemy placement, strategic positioning
- **State machines**: Enemy placement state
- **External libraries**: `seedrandom` (via PRNG wrapper)

#### Testing Strategy
- **Test files to create/update**: `server/level-generation/test/enemy-placement.test.js`
- **Key test cases**: Candidate identification, choke point detection, strategic positioning
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] **Implement choke point detection**: Identify narrow passages suitable for enemy placement
- [ ] **Add high-reward area identification**: Find areas with coin clusters or strategic importance
- [ ] **Create enemy type selection**: Choose appropriate enemy types for different locations
- [ ] **Add patrol area calculation**: Calculate appropriate patrol areas for enemies

### Expected Output
- Strategic enemy placement candidate system
- Choke point and high-reward area detection
- Enemy type selection logic
- Patrol area calculation

### Risk Assessment
- **Potential complexity**: Accurate identification of strategic locations
- **Dependencies**: Cave structure analysis and coin placement
- **Fallback plan**: Use simple random placement if strategic identification fails

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Enemy placement candidates are strategically interesting
- [ ] Choke point detection is accurate
- [ ] All enemy placement tests pass
- [ ] Code reviewed and approved
- [ ] **Document enemy placement interface in level_creation_interfaces_and_invariants.md**
- [ ] No poor strategic placement

---

## Task CG-08.2: Enemy Placement Validation Loop

### Objective
Implement validation feedback loop that ensures enemy placement doesn't break level solvability.

### Task ID: CG-08.2

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **01_blueprint.md sections to review**: "§3.8 Intelligent Enemy Placement", "Enemy Placement Feedback Loop"
- [ ] **_00_v1_functional_requirements.md sections to reference**: "Enemy and Obstacle Placement"
- [ ] **testing_best_practices.md sections to apply**: "§1.1 TDD for Core Systems"

#### State & Invariant Impact Assessment
- [ ] **New states to create**: Enemy validation state, solvability feedback
- [ ] **Existing states to preserve**: Cave structure, level solvability
- [ ] **Time reversal compatibility**: Enemy validation is generation-time only

### Implementation Plan

#### Files/Classes to Change
- **Create**: `server/level-generation/src/enemy-validation.js`
- **Modify**: `server/level-generation/src/enemy-placement.js` (add validation loop)
- **Delete**: N/A

#### Integration Points
- **Systems affected**: Enemy placement validation, level solvability
- **State machines**: Enemy validation state
- **External libraries**: `pathfinding` (via pathfinding wrapper)

#### Testing Strategy
- **Test files to create/update**: `server/level-generation/test/enemy-validation.test.js`
- **Key test cases**: Solvable placement, unsolvable placement, validation rollback
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] **Implement solvability checking**: Verify level remains solvable after enemy placement
- [ ] **Add placement rollback**: Remove enemy placement if solvability is compromised
- [ ] **Create validation feedback**: Provide feedback on why placement was rejected
- [ ] **Add iterative placement**: Try multiple placement options until valid configuration found

### Expected Output
- Comprehensive enemy placement validation
- Solvability preservation guarantees
- Placement rollback system
- Iterative placement optimization

### Risk Assessment
- **Potential complexity**: Balancing challenge with solvability
- **Dependencies**: Pathfinding validation and enemy placement candidates
- **Fallback plan**: Use conservative enemy placement if validation fails

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Enemy placement never breaks level solvability
- [ ] Validation feedback is informative
- [ ] All enemy validation tests pass
- [ ] Code reviewed and approved
- [ ] **Document enemy validation interface in level_creation_interfaces_and_invariants.md**
- [ ] No unsolvable levels due to enemy placement

---

## Task CG-08.3: Enemy Configuration Generation

### Objective
Implement enemy configuration generation system that creates appropriate enemy parameters for different cave contexts.

### Task ID: CG-08.3

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **level-format.md sections to review**: "§8.2 LoopHound Enemy" configuration
- [ ] **01_blueprint.md sections to review**: "§3.8 Intelligent Enemy Placement"
- [ ] **testing_best_practices.md sections to apply**: "§1.1 TDD for Core Systems"

#### State & Invariant Impact Assessment
- [ ] **New states to create**: Enemy configuration state, parameter generation
- [ ] **Existing states to preserve**: Enemy placement locations
- [ ] **Time reversal compatibility**: Enemy configurations must follow Enemy/Freeze Contract

### Implementation Plan

#### Files/Classes to Change
- **Create**: `server/level-generation/src/enemy-config.js`
- **Modify**: `server/level-generation/src/enemy-placement.js` (add configuration)
- **Delete**: N/A

#### Integration Points
- **Systems affected**: Enemy parameter generation, JSON export
- **State machines**: Enemy configuration state
- **External libraries**: `seedrandom` (via PRNG wrapper)

#### Testing Strategy
- **Test files to create/update**: `server/level-generation/test/enemy-config.test.js`
- **Key test cases**: Configuration generation, parameter validation, context appropriateness
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] **Implement LoopHound configuration**: Generate appropriate patrol distances and speeds
- [ ] **Add context-aware parameters**: Adjust enemy parameters based on cave area characteristics
- [ ] **Create parameter validation**: Ensure all enemy parameters are within valid ranges
- [ ] **Add configuration variety**: Generate varied enemy configurations for interest

### Expected Output
- Functional enemy configuration generation
- Context-aware parameter adjustment
- Parameter validation system
- Configuration variety for gameplay interest

### Risk Assessment
- **Potential complexity**: Balancing enemy parameters with cave context
- **Dependencies**: Enemy placement and cave structure analysis
- **Fallback plan**: Use default enemy configurations if context-aware generation fails

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Enemy configurations are appropriate for their contexts
- [ ] Parameter validation prevents invalid configurations
- [ ] All enemy configuration tests pass
- [ ] Code reviewed and approved
- [ ] **Document enemy configuration interface in level_creation_interfaces_and_invariants.md**
- [ ] No invalid enemy parameters

---

## Task CG-08.4: Enemy Density Control

### Objective
Implement enemy density control system that ensures appropriate challenge level without overwhelming the player.

### Task ID: CG-08.4

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **01_blueprint.md sections to review**: "§3.8 Intelligent Enemy Placement"
- [ ] **_00_v1_functional_requirements.md sections to reference**: "Enemy and Obstacle Placement"
- [ ] **testing_best_practices.md sections to apply**: "§1.1 TDD for Core Systems"

#### State & Invariant Impact Assessment
- [ ] **New states to create**: Enemy density state, challenge balancing
- [ ] **Existing states to preserve**: Cave structure, enemy placement
- [ ] **Time reversal compatibility**: Enemy density control is generation-time only

### Implementation Plan

#### Files/Classes to Change
- **Create**: `server/level-generation/src/enemy-density.js`
- **Modify**: `server/level-generation/src/enemy-placement.js` (add density control)
- **Delete**: N/A

#### Integration Points
- **Systems affected**: Enemy placement density, challenge balancing
- **State machines**: Enemy density state
- **External libraries**: None

#### Testing Strategy
- **Test files to create/update**: `server/level-generation/test/enemy-density.test.js`
- **Key test cases**: Density calculation, challenge balancing, area-based adjustment
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] **Implement density calculation**: Calculate appropriate enemy density based on cave size
- [ ] **Add challenge balancing**: Ensure enemy density provides appropriate challenge
- [ ] **Create area-based adjustment**: Adjust density based on different cave areas
- [ ] **Add density validation**: Verify enemy density meets design requirements

### Expected Output
- Functional enemy density control system
- Challenge-appropriate enemy distribution
- Area-based density adjustment
- Density validation and reporting

### Risk Assessment
- **Potential complexity**: Balancing challenge with playability
- **Dependencies**: Enemy placement and cave structure analysis
- **Fallback plan**: Use simple density rules if complex balancing fails

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Enemy density provides appropriate challenge
- [ ] Density varies appropriately across cave areas
- [ ] All density control tests pass
- [ ] Code reviewed and approved
- [ ] **Document enemy density interface in level_creation_interfaces_and_invariants.md**
- [ ] No overwhelming or trivial enemy density

---

## Phase 3 Success Criteria

### Functional Completeness
- [ ] Decorative tile system with context-aware placement
- [ ] Strategic coin distribution with reachability validation
- [ ] Intelligent enemy placement with solvability preservation
- [ ] Biome-aware tile selection for visual consistency
- [ ] Comprehensive validation for all content elements

### Visual Verification
- [ ] Decorative tiles create coherent cave structure
- [ ] Coin placement encourages exploration
- [ ] Enemy placement provides appropriate challenge
- [ ] Biome consistency throughout level
- [ ] No floating or misplaced decorative elements

### Test Coverage
- [ ] Unit tests for all tile analysis algorithms
- [ ] Integration tests for coin distribution and reachability
- [ ] Enemy placement validation tests
- [ ] Visual coherence verification tests
- [ ] Performance tests for content population

### Gameplay Quality
- [ ] Coins are strategically placed to encourage exploration
- [ ] Enemy placement provides challenge without breaking solvability
- [ ] Decorative elements enhance visual appeal
- [ ] Content density is appropriate for level size
- [ ] All functional requirements are met

### Performance
- [ ] Content population completes efficiently
- [ ] Reachability validation is performant
- [ ] Enemy placement validation doesn't cause delays
- [ ] Memory usage remains stable during content generation

This phase transforms basic cave levels into rich, engaging gameplay experiences with strategic content placement and visual polish. 