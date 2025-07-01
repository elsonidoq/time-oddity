# Task Plan: Level & Visual Design Configuration

> **Addresses Functional Gap**: 🎨 Level & Visual Design Configuration
> **Goal**: Make backgrounds configurable via JSON level files to enable richer and more diverse level design

---

## Task 03.01.1 – Add Background Schema Documentation to Level Format ✅ DONE

### Objective
Add background configuration schema documentation to level-format.md without any implementation changes.

### Task ID
03.01.1

### Pre-Implementation Analysis

#### Documentation Dependencies
- [x] **invariants.md sections to review**: §15 Asset & Animation Keys (background sprite keys), §1 Global Architecture (directory contracts), §2 Phaser Game Configuration (asset loading)
- [x] **testing_best_practices.md sections to apply**: "State-Based Testing", "Documentation-First Approach"
- [x] **small_comprehensive_documentation.md sections to reference**: §1.1 Project & Game Configuration (asset loading paths)

#### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: All existing asset loading contracts, background sprite keys from BootScene
- [x] **New states/invariants to create**: Background JSON schema specification, background asset key validation rules
- [x] **Time reversal compatibility**: N/A – documentation only

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `agent_docs/level-creation/level-format.md` – add background configuration schema section

#### Integration Points
- **Systems affected**: None (documentation only)
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create**: None (documentation task)
- **Key test cases**: Schema validation will be tested in implementation tasks
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [x] Add "Background Objects" section to level-format.md after "Enemy Objects" section
- [x] Document background layer schema with type, spriteKey, depth, x, y, width, height fields
- [x] Document parallax layer schema with scrollSpeed field
- [x] Document background animation schema with animationType, duration, ease fields
- [x] Include example JSON snippets for simple and complex background configurations
- [x] Reference available background sprite keys from BootScene atlas loading

### Expected Output
Complete background configuration schema documented in level-format.md with examples and validation rules.

### Risk Assessment
- **Potential complexity**: Low – documentation only
- **Dependencies**: Available background sprite assets from Kenney pack
- **Fallback plan**: N/A – documentation task

### Definition of Done
- [x] Background schema section added to level-format.md
- [x] Schema includes all required fields and validation rules
- [x] Examples provided for simple and complex configurations
- [x] Documentation reviewed for clarity and completeness
- [x] Task marked complete

---

## Task 03.01.2 – Create Background Factory Method (TDD) ✅ DONE

### Objective
Create SceneFactory.createBackgroundsFromConfig() method using TDD approach, starting with failing tests.

### Task ID
03.01.2

### Pre-Implementation Analysis

#### Documentation Dependencies
- [x] **invariants.md sections to review**: §15 Asset & Animation Keys (background sprite keys), §3 Scene Lifecycle (background creation timing), §13 Platform Geometry (depth ordering)
- [x] **testing_best_practices.md sections to apply**: "TDD Red-Green-Refactor", "Unit Testing", "Phaser Mocking Strategies"
- [x] **small_comprehensive_documentation.md sections to reference**: §1.2 Scene System (add.tileSprite usage), §8.2 Mocking External Libraries

#### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: BootScene background atlas loading, existing depth ordering with platforms/entities
- [x] **New states/invariants to create**: Background factory pattern in SceneFactory, background configuration validation
- [x] **Time reversal compatibility**: Backgrounds don't participate in time mechanics (static visual elements)

### Implementation Plan

#### Files/Classes to Change
- **Create**: `tests/unit/scene-factory-background-creation.test.js`
- **Modify**: `client/src/systems/SceneFactory.js` – add createBackgroundsFromConfig method

#### Integration Points
- **Systems affected**: SceneFactory, background rendering system
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create**: `scene-factory-background-creation.test.js`
- **Key test cases**:
  1. Single background layer creation with valid config
  2. Multiple background layers with correct depth ordering
  3. Background positioning and sizing validation
  4. Invalid background config handling (missing spriteKey, invalid coordinates)
  5. Empty background array handling
- **Mock requirements**: Use existing PhaserSceneMock.add.tileSprite

### Task Breakdown & Acceptance Criteria
- [x] Write failing test for single background layer creation
- [x] Write failing test for multiple background layers with depth ordering
- [x] Write failing test for background positioning and sizing
- [x] Write failing tests for invalid configuration handling
- [x] Implement createBackgroundsFromConfig() method to make tests pass
- [x] Refactor method for clarity and error handling

### Expected Output
SceneFactory.createBackgroundsFromConfig() method that creates backgrounds from JSON config with full test coverage.

### Risk Assessment
- **Potential complexity**: Low – follows existing SceneFactory patterns
- **Dependencies**: Task 03.01.1 completion, existing Phaser mocking infrastructure
- **Fallback plan**: Create minimal implementation if complex features prove difficult

### Definition of Done
- [x] All tests pass (Red-Green-Refactor cycle complete)
- [x] Method handles valid and invalid configurations gracefully
- [x] Depth ordering working correctly
- [x] Error handling for missing or invalid sprite keys
- [x] Code coverage for all test cases

---

## Task 03.01.3 – Integrate Background Factory with Scene Loading ✅ DONE

### Objective
Integrate background factory method with SceneFactory.loadConfiguration() to ensure backgrounds are created during level loading.

### Task ID
03.01.3

### Pre-Implementation Analysis

#### Documentation Dependencies
- [x] **invariants.md sections to review**: §3 Scene Lifecycle (scene creation order), §15 Asset & Animation Keys (background atlas availability)
- [x] **testing_best_practices.md sections to apply**: "Integration Tests", "State-Based Testing"
- [x] **small_comprehensive_documentation.md sections to reference**: Level loading patterns in SceneFactory

#### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: SceneFactory.loadConfiguration() behavior, existing platform/coin/enemy creation flow
- [x] **New states/invariants to create**: Background section in level configuration, background validation in loadConfiguration
- [x] **Time reversal compatibility**: Unchanged – backgrounds don't participate in time mechanics

### Implementation Plan

#### Files/Classes to Change
- **Create**: `tests/integration/scene-factory-background-integration.test.js`
- **Modify**: `client/src/systems/SceneFactory.js` – integrate background creation with configuration loading

#### Integration Points
- **Systems affected**: SceneFactory configuration loading, level validation
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create**: `scene-factory-background-integration.test.js`
- **Key test cases**:
  1. Level config with backgrounds section loads correctly
  2. Level config without backgrounds section handles gracefully
  3. Background creation called automatically during level loading
  4. Background validation errors handled properly
  5. Integration with existing platform/coin/enemy creation
- **Mock requirements**: SceneFactory mock, level configuration mocks

### Task Breakdown & Acceptance Criteria
- [x] Add background validation to SceneFactory.loadConfiguration()
- [x] Create integration test for background loading with level config
- [x] Ensure backgrounds are validated during configuration loading
- [x] Test backward compatibility with configs without background section
- [x] Integration test with complete level configuration including backgrounds

### Expected Output
SceneFactory automatically validates and prepares background configurations during level loading.

### Risk Assessment
- **Potential complexity**: Low – follows existing validation patterns
- **Dependencies**: Tasks 03.01.1 and 03.01.2 completion
- **Fallback plan**: Add background validation as separate step if integration proves complex

### Definition of Done
- [x] Background section validation added to loadConfiguration()
- [x] Integration tests pass
- [x] Backward compatibility maintained
- [x] No breaking changes to existing SceneFactory API
- [x] Error handling for invalid background configurations

---

## Task 03.02.1 – Remove Hardcoded Background Creation (TDD) ✅ DONE

### Objective
Remove hardcoded background creation from GameScene.createParallaxBackground() and replace with SceneFactory call, using TDD approach.

### Task ID
03.02.1

### Pre-Implementation Analysis

#### Documentation Dependencies
- [x] **invariants.md sections to review**: §3 Scene Lifecycle (GameScene.create() order), §2 Phaser Game Configuration (camera bounds interaction), §16 Runtime Event Names (scene communication)
- [x] **testing_best_practices.md sections to apply**: "TDD Red-Green-Refactor", "Integration Tests", "State-Based Testing"
- [x] **small_comprehensive_documentation.md sections to reference**: §1.2 Scene System (GameScene lifecycle), §1.6 Cameras and visual effects

#### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: Parallax scrolling calculation in GameScene.update(), background depth layering (-2, -1), camera integration
- [x] **New states/invariants to create**: SceneFactory background creation call in GameScene.create()
- [x] **Time reversal compatibility**: Unchanged – backgrounds remain static during gameplay

### Implementation Plan

#### Files/Classes to Change
- **Create**: `tests/integration/game-scene-background-factory.test.js`
- **Modify**: `client/src/scenes/GameScene.js` – replace createParallaxBackground with factory call

#### Integration Points
- **Systems affected**: GameScene background initialization, parallax scrolling in update()
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create**: `game-scene-background-factory.test.js`
- **Key test cases**:
  1. GameScene calls SceneFactory.createBackgroundsFromConfig() instead of hardcoded creation
  2. Background references preserved for parallax calculation
  3. Depth ordering maintained (-2 for sky, -1 for hills)
  4. Fallback to hardcoded creation if factory fails
  5. No breaking changes to existing parallax behavior
- **Mock requirements**: GameScene mock, SceneFactory mock with createBackgroundsFromConfig

### Task Breakdown & Acceptance Criteria
- [x] Write failing test for SceneFactory background creation call
- [x] Write failing test for background reference preservation
- [x] Replace hardcoded createParallaxBackground() with factory call
- [x] Preserve background references for parallax scrolling
- [x] Add fallback to hardcoded creation for error handling
- [x] Ensure depth ordering remains consistent

### Expected Output
GameScene creates backgrounds via SceneFactory instead of hardcoded method while preserving all parallax behavior.

### Risk Assessment
- **Potential complexity**: Medium – need to preserve parallax calculation references
- **Dependencies**: Tasks 03.01.1-03.01.3 completion, existing parallax logic
- **Fallback plan**: Keep hardcoded method as backup if factory integration fails

### Definition of Done
- [x] Hardcoded background creation removed from GameScene
- [x] SceneFactory background creation integrated
- [x] Parallax scrolling behavior preserved
- [x] Background depth ordering maintained
- [x] All integration tests pass

---

## Task 03.02.2 – Update Level Configurations with Background Data ✅ DONE

### Objective
Add background configurations to existing level JSON files to demonstrate the new background system.

### Task ID
03.02.2

### Pre-Implementation Analysis

#### Documentation Dependencies
- [x] **invariants.md sections to review**: §15 Asset & Animation Keys (available background sprites), directory contracts
- [x] **level-creation/available_tiles.md sections to reference**: Background sprite catalog and keys
- [x] **level-format.md sections to reference**: Background configuration schema from Task 03.01.1

#### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: Level playability, existing platform/coin/enemy configurations
- [x] **New states/invariants to create**: Background configurations for test-level.json and other levels
- [x] **Time reversal compatibility**: Unchanged – backgrounds don't participate in time mechanics

### Implementation Plan

#### Files/Classes to Change
- **Create**: `tests/integration/level-background-configs.test.js`
- **Modify**: `client/src/config/test-level.json` – add background configuration
- **Modify**: `client/src/config/adventure-level.json` – add background configuration (if exists)

#### Integration Points
- **Systems affected**: Level loading system, background rendering
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create**: `level-background-configs.test.js`
- **Key test cases**:
  1. test-level.json loads with correct background configuration
  2. Background sprites match available asset keys
  3. Background depth ordering prevents gameplay interference
  4. Level visual hierarchy maintained (platforms visible above backgrounds)
  5. No performance degradation with background configurations
- **Mock requirements**: Level loading mocks, SceneFactory mocks

### Task Breakdown & Acceptance Criteria
- [x] Add background section to test-level.json with sky and hills layers
- [x] Validate background sprite keys match available assets
- [x] Ensure background depth values don't interfere with gameplay elements
- [x] Test level loading with new background configurations
- [x] Verify visual hierarchy maintains gameplay clarity

### Expected Output
Level JSON files contain background configurations that demonstrate rich, layered backgrounds without affecting gameplay.

### Risk Assessment
- **Potential complexity**: Low – primarily configuration and validation
- **Dependencies**: Task 03.01.1 schema documentation, available background assets
- **Fallback plan**: Use simpler single-layer backgrounds if complex configs cause issues

### Definition of Done
- [x] test-level.json contains rich background configuration
- [x] Background configurations validated against schema
- [x] Level loading tests pass with new configurations
- [x] Visual hierarchy preserved (gameplay elements visible)
- [x] No performance regressions

---

## Task 03.03.1 – Add Parallax Layer Support (TDD)

### Objective
Extend background factory to support multiple parallax layers with configurable scroll speeds using TDD.

### Task ID
03.03.1

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: §2 Phaser Game Configuration (camera interaction), performance constraints
- [ ] **testing_best_practices.md sections to apply**: "TDD Red-Green-Refactor", "Performance Testing"
- [ ] **small_comprehensive_documentation.md sections to reference**: §1.6 Cameras and visual effects, parallax implementation patterns

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: Current parallax calculation in GameScene.update(), camera follow behavior
- [ ] **New states/invariants to create**: Multi-layer parallax calculation, configurable scroll speeds
- [ ] **Time reversal compatibility**: Unchanged – parallax calculation doesn't participate in time mechanics

### Implementation Plan

#### Files/Classes to Change
- **Create**: `tests/unit/scene-factory-parallax-layers.test.js`
- **Modify**: `client/src/systems/SceneFactory.js` – extend background creation for parallax layers
- **Modify**: `client/src/scenes/GameScene.js` – update parallax calculation for multiple layers

#### Integration Points
- **Systems affected**: Background factory, GameScene parallax calculation, camera system
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create**: `scene-factory-parallax-layers.test.js`
- **Key test cases**:
  1. Multiple parallax layers with different scroll speeds
  2. Parallax calculation for each layer based on player movement
  3. Layer depth ordering with parallax support
  4. Performance validation with multiple parallax layers
  5. Default scroll speed handling for layers without parallax config
- **Mock requirements**: Background layer mocks, player movement mocks

### Task Breakdown & Acceptance Criteria
- [ ] Write failing test for multiple parallax layers with different speeds
- [ ] Write failing test for parallax calculation based on player movement
- [ ] Extend SceneFactory to create parallax-enabled background layers
- [ ] Update GameScene parallax calculation to handle multiple layers
- [ ] Optimize performance for multiple background layers
- [ ] Add configurable scroll speeds to background schema

### Expected Output
Multiple parallax background layers with configurable scroll speeds that enhance visual depth without impacting performance.

### Risk Assessment
- **Potential complexity**: Medium – parallax calculation for multiple layers can be complex
- **Dependencies**: Tasks 03.01.x and 03.02.x completion, existing parallax logic
- **Fallback plan**: Limit to 2-3 parallax layers if performance issues arise

### Definition of Done
- [ ] Multiple parallax layers supported in SceneFactory
- [ ] GameScene parallax calculation updated for multiple layers
- [ ] Performance benchmarks within acceptable ranges
- [ ] All TDD tests pass
- [ ] Configurable scroll speeds working correctly

---

## Task 03.03.2 – Add Background Animation Support with GSAP

### Objective
Add GSAP-based background animation support to the background system using TDD approach.

### Task ID
03.03.2

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: GSAP integration patterns, performance constraints
- [ ] **testing_best_practices.md sections to apply**: "TDD Red-Green-Refactor", "GSAP Mocking Strategy", "Module Mocking"
- [ ] **small_comprehensive_documentation.md sections to reference**: §2 GSAP Animation integration, §8.2 Mocking External Libraries

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: GSAP timeline management, existing animation system
- [ ] **New states/invariants to create**: Background animation state, GSAP timeline for backgrounds
- [ ] **Time reversal compatibility**: Background animations should pause during time rewind

### Implementation Plan

#### Files/Classes to Change
- **Create**: `tests/unit/scene-factory-background-animations.test.js`
- **Modify**: `client/src/systems/SceneFactory.js` – add background animation creation
- **Create**: Background animation configuration helpers

#### Integration Points
- **Systems affected**: GSAP animation system, background rendering, TimeManager (for pause behavior)
- **State machines**: None
- **External libraries**: GSAP

#### Testing Strategy
- **Test files to create**: `scene-factory-background-animations.test.js`
- **Key test cases**:
  1. Background animations created with GSAP timelines
  2. Animation configuration validation (duration, ease, repeat)
  3. GSAP timeline creation and control
  4. Background animation performance with multiple layers
  5. Animation pause/resume capability for time rewind integration
- **Mock requirements**: GSAP timeline mock, animation configuration mocks

### Task Breakdown & Acceptance Criteria
- [ ] Write failing test for GSAP background animation creation
- [ ] Write failing test for animation configuration validation
- [ ] Implement background animation creation in SceneFactory
- [ ] Add GSAP timeline management for background animations
- [ ] Create animation configuration schema (duration, ease, repeat)
- [ ] Add pause/resume capability for TimeManager integration

### Expected Output
Background animations powered by GSAP with timeline control and time rewind compatibility.

### Risk Assessment
- **Potential complexity**: Medium – GSAP integration and timeline management
- **Dependencies**: GSAP library, existing animation infrastructure
- **Fallback plan**: Disable background animations if performance issues arise

### Definition of Done
- [ ] Background animations working with GSAP timelines
- [ ] Animation configuration schema implemented
- [ ] Timeline pause/resume functionality working
- [ ] Performance validation completed
- [ ] All TDD tests pass

---

## Task 03.03.3 – Integrate Background Animations with TimeManager

### Objective
Ensure background animations pause during time rewind and resume properly when rewind ends.

### Task ID
03.03.3

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: §7 TimeManager Rewind System, §16 Runtime Event Names (scene events)
- [ ] **testing_best_practices.md sections to apply**: "Integration Tests", "State-Based Testing"
- [ ] **small_comprehensive_documentation.md sections to reference**: TimeManager integration patterns

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: TimeManager rewind behavior, existing pause/resume mechanics
- [ ] **New states/invariants to create**: Background animation pause state during rewind
- [ ] **Time reversal compatibility**: Background animations must pause during rewind and resume afterward

### Implementation Plan

#### Files/Classes to Change
- **Create**: `tests/integration/background-animation-time-rewind.test.js`
- **Modify**: `client/src/systems/TimeManager.js` – add background animation pause/resume
- **Modify**: `client/src/systems/SceneFactory.js` – register background animations with TimeManager

#### Integration Points
- **Systems affected**: TimeManager, background animation system, scene event system
- **State machines**: None
- **External libraries**: GSAP (for timeline pause/resume)

#### Testing Strategy
- **Test files to create**: `background-animation-time-rewind.test.js`
- **Key test cases**:
  1. Background animations pause when rewind starts
  2. Background animations resume when rewind ends
  3. Animation state preserved during rewind (position, progress)
  4. Multiple background animations handled correctly
  5. No animation conflicts during rewind/resume cycle
- **Mock requirements**: TimeManager mock, GSAP timeline mock, background animation mocks

### Task Breakdown & Acceptance Criteria
- [ ] Add background animation registration to TimeManager
- [ ] Implement pause behavior for background animations during rewind
- [ ] Implement resume behavior for background animations after rewind
- [ ] Preserve animation state during rewind (position, progress)
- [ ] Test integration with existing time rewind mechanics
- [ ] Ensure no conflicts with other time-sensitive systems

### Expected Output
Background animations that properly pause during time rewind and resume seamlessly when rewind ends.

### Risk Assessment
- **Potential complexity**: Medium – integration with TimeManager and GSAP timeline state
- **Dependencies**: Tasks 03.03.1-03.03.2 completion, TimeManager pause/resume system
- **Fallback plan**: Disable animation pause if integration proves too complex

### Definition of Done
- [ ] Background animations pause during time rewind
- [ ] Background animations resume after rewind ends
- [ ] Animation state properly preserved
- [ ] Integration tests pass
- [ ] No conflicts with existing time mechanics

---

## Decorative Platform Interface Design

The new decorative platform system enables background level design using existing tiles from the available asset catalog. This approach is much simpler than complex background layers while providing rich visual design capabilities.

### Interface Specification

**Decorative Platform Type**: `"decorative"`

**Key Features**:
- **No collision detection**: Players and enemies pass through decorative platforms
- **Multi-tile support**: Uses existing width parameter and tilePrefix system
- **Background depth rendering**: Renders behind gameplay elements
- **Existing tile compatibility**: Uses all tiles from `available_tiles.md`
- **JSON configurable**: Follows existing platform configuration patterns

**Schema Example**:
```json
{
  "type": "decorative",
  "x": 100,
  "y": 200,
  "width": 192,  // optional, defaults to 64 (3 tiles × 64px)
  "tilePrefix": "terrain_grass_block",
  "depth": -0.5  // negative depth renders behind gameplay elements
}
```

**Rendering Behavior**:
- Single tile (width ≤ 64): Uses base tilePrefix directly
- Multi-tile: Uses `_left`, `_center`/`_middle`, `_right` suffixes (same as floating platforms)
- Depth ordering: Decorative platforms render behind all gameplay elements (platforms, enemies, player)

**Implementation Architecture**:
- Extends existing SceneFactory platform creation system
- No physics body creation (visual only)
- Uses existing tile selection logic from floating platforms
- Compatible with time reversal system (static elements)

---

## Task 03.04.1 – Add Decorative Platform Schema Documentation

### Objective
Add decorative platform type documentation to level-format.md to define the new non-interactive background tile system.

### Task ID
03.04.1

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: §13 Platform Geometry (depth ordering), §15 Asset & Animation Keys (tile atlas loading)
- [ ] **testing_best_practices.md sections to apply**: "Documentation-First Approach"
- [ ] **available_tiles.md sections to reference**: Complete tile catalog for decorative usage

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: All existing platform creation and tile selection logic
- [ ] **New states/invariants to create**: Decorative platform schema validation, depth ordering rules
- [ ] **Time reversal compatibility**: N/A – decorative platforms are static visual elements

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `agent_docs/level-creation/level-format.md` – add decorative platform section

#### Integration Points
- **Systems affected**: None (documentation only)
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create**: None (documentation task)
- **Key test cases**: Schema validation will be tested in implementation tasks
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [x] Add "Decorative Platform" section to level-format.md after "Moving Platform" section
- [x] Document decorative platform schema with all fields (type, x, y, width, tilePrefix, depth)
- [x] Document depth ordering rules for background rendering
- [x] Include example JSON snippets for single and multi-tile decorative platforms
- [x] Reference existing tile selection behavior from floating platforms
- [x] Document available tilePrefix options from available_tiles.md

### Expected Output
Complete decorative platform schema documented in level-format.md with examples and validation rules.

### Risk Assessment
- **Potential complexity**: Low – documentation only, follows existing patterns
- **Dependencies**: Existing tile selection system understanding
- **Fallback plan**: N/A – documentation task

### Definition of Done
- [x] Decorative platform schema section added to level-format.md
- [x] Schema includes all required fields and validation rules
- [x] Examples provided for single and multi-tile configurations
- [x] Depth ordering documented for visual hierarchy
- [x] Task marked complete

---

## Task 03.04.2 – Create Decorative Platform Factory Method (TDD)

### Objective
Create SceneFactory.createDecorativePlatformsFromConfig() method using TDD approach to handle non-interactive background tiles.

### Task ID
03.04.2

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: §13 Platform Geometry (tile selection patterns), §3 Scene Lifecycle (platform creation timing)
- [ ] **testing_best_practices.md sections to apply**: "TDD Red-Green-Refactor", "Unit Testing"
- [ ] **small_comprehensive_documentation.md sections to reference**: §1.2 Scene System (add.tileSprite usage)

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: Existing platform creation logic, tile selection system
- [ ] **New states/invariants to create**: Decorative platform creation pattern in SceneFactory
- [ ] **Time reversal compatibility**: Decorative platforms don't participate in time mechanics (static visual elements)

### Implementation Plan

#### Files/Classes to Change
- **Create**: `tests/unit/scene-factory-decorative-platforms.test.js`
- **Modify**: `client/src/systems/SceneFactory.js` – add createDecorativePlatformsFromConfig method

#### Integration Points
- **Systems affected**: SceneFactory, decorative platform rendering system
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create**: `scene-factory-decorative-platforms.test.js`
- **Key test cases**:
  1. Single decorative tile creation with valid config
  2. Multi-tile decorative platform with correct tile selection
  3. Depth ordering for background rendering (negative depth values)
  4. No physics body creation (visual only)
  5. Invalid decorative config handling
- **Mock requirements**: Use existing PhaserSceneMock.add.tileSprite

### Task Breakdown & Acceptance Criteria
- [x] Write failing test for single decorative tile creation
- [x] Write failing test for multi-tile decorative platform with tile selection
- [x] Write failing test for depth ordering (negative depth values)
- [x] Write failing test for no physics body creation
- [x] Implement createDecorativePlatformsFromConfig() method to make tests pass
- [x] Ensure method reuses existing tile selection logic from floating platforms

### Expected Output
SceneFactory.createDecorativePlatformsFromConfig() method that creates visual-only background tiles with full test coverage.

### Risk Assessment
- **Potential complexity**: Low – reuses existing tile selection patterns
- **Dependencies**: Task 03.04.1 completion, existing tile selection system
- **Fallback plan**: Create minimal single-tile implementation if multi-tile proves complex

### Definition of Done
- [x] All tests pass (Red-Green-Refactor cycle complete)
- [x] Method handles valid and invalid configurations gracefully
- [x] Depth ordering working correctly for background rendering
- [x] No physics bodies created (visual only)
- [x] Code coverage for all test cases

---

## Task 03.04.3 – Integrate Decorative Platforms with Scene Loading

### Objective
Integrate decorative platform factory with SceneFactory.loadConfiguration() to ensure decorative platforms are created during level loading.

### Task ID
03.04.3

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: §3 Scene Lifecycle (scene creation order)
- [ ] **testing_best_practices.md sections to apply**: "Integration Tests"
- [ ] **small_comprehensive_documentation.md sections to reference**: Level loading patterns in SceneFactory

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: SceneFactory.loadConfiguration() behavior, existing platform creation flow
- [ ] **New states/invariants to create**: Decorative platforms section in level configuration validation
- [ ] **Time reversal compatibility**: Unchanged – decorative platforms don't participate in time mechanics

### Implementation Plan

#### Files/Classes to Change
- **Create**: `tests/integration/scene-factory-decorative-integration.test.js`
- **Modify**: `client/src/systems/SceneFactory.js` – integrate decorative platform creation with configuration loading

#### Integration Points
- **Systems affected**: SceneFactory configuration loading, level validation
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create**: `scene-factory-decorative-integration.test.js`
- **Key test cases**:
  1. Level config with decorative platforms section loads correctly
  2. Level config without decorative platforms section handles gracefully
  3. Decorative platform creation called automatically during level loading
  4. Decorative platform validation errors handled properly
  5. Integration with existing platform creation (ground, floating, moving)
- **Mock requirements**: SceneFactory mock, level configuration mocks

### Task Breakdown & Acceptance Criteria
- [x] Add decorative platform validation to SceneFactory.loadConfiguration()
- [x] Create integration test for decorative platform loading with level config
- [x] Ensure decorative platforms are validated during configuration loading
- [x] Test backward compatibility with configs without decorative platforms section
- [x] Integration test with complete level configuration including decorative platforms

### Expected Output
SceneFactory automatically validates and creates decorative platforms during level loading alongside other platform types.

### Risk Assessment
- **Potential complexity**: Low – follows existing platform creation patterns
- **Dependencies**: Tasks 03.04.1 and 03.04.2 completion
- **Fallback plan**: Add decorative platform validation as separate step if integration proves complex

### Definition of Done
- [x] Decorative platforms section validation added to loadConfiguration()
- [x] Integration tests pass
- [x] Backward compatibility maintained
- [x] No breaking changes to existing SceneFactory API
- [x] Error handling for invalid decorative platform configurations

---

## Task 03.04.4 – Update Level Configurations with Decorative Platforms

### Objective
Add decorative platform configurations to existing level JSON files to demonstrate the new background tile system.

### Task ID
03.04.4

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **level-format.md sections to reference**: Decorative platform configuration schema from Task 03.04.1
- [ ] **available_tiles.md sections to reference**: Complete tile catalog for decorative usage

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: Level playability, existing platform/coin/enemy configurations
- [ ] **New states/invariants to create**: Decorative platform configurations for test-level.json and other levels
- [ ] **Time reversal compatibility**: Unchanged – decorative platforms don't participate in time mechanics

### Implementation Plan

#### Files/Classes to Change
- **Create**: `tests/integration/level-decorative-platforms.test.js`
- **Modify**: `client/src/config/test-level.json` – add decorative platform configuration
- **Modify**: `client/src/config/adventure-level.json` – add themed decorative elements (if exists)

#### Integration Points
- **Systems affected**: Level loading system, decorative platform rendering
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create**: `level-decorative-platforms.test.js`
- **Key test cases**:
  1. test-level.json loads with correct decorative platform configuration
  2. Decorative tile prefixes match available asset keys
  3. Decorative platforms render behind gameplay elements (depth ordering)
  4. No collision with player or enemies
  5. Visual hierarchy maintained (gameplay elements clearly visible)
- **Mock requirements**: Level loading mocks, depth ordering validation

### Task Breakdown & Acceptance Criteria
- [ ] Add decorative platforms section to test-level.json with various tile types
- [ ] Use different tilePrefix values to showcase tile variety (grass, stone, dirt themes)
- [ ] Include both single-tile and multi-tile decorative examples
- [ ] Ensure negative depth values for background rendering
- [ ] Test level loading with new decorative platform configurations
- [ ] Verify no collision between decorative platforms and gameplay elements

### Expected Output
Level JSON files contain decorative platform configurations that demonstrate rich background design using existing tiles without affecting gameplay.

### Risk Assessment
- **Potential complexity**: Low – primarily configuration and validation
- **Dependencies**: Tasks 03.04.1-03.04.3 completion, available tile assets
- **Fallback plan**: Use simple single-tile decorative platforms if complex configs cause issues

### Definition of Done
- [ ] test-level.json contains decorative platform configuration
- [ ] Decorative platforms validated against schema
- [ ] Level loading tests pass with new configurations
- [ ] Visual hierarchy preserved (gameplay elements clearly visible above decorative elements)
- [ ] No collision issues with gameplay elements

---

## Task 03.05.1 – Create Comprehensive Decorative Platform Integration Test

### Objective
Create comprehensive integration test that validates the entire decorative platform system from JSON config loading to rendering.

### Task ID
03.05.1

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **testing_best_practices.md sections to apply**: "Integration Tests", "Visual Hierarchy Testing"
- [ ] **invariants.md sections to review**: Complete decorative platform system contracts

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: All decorative platform system functionality
- [ ] **New states/invariants to create**: Complete decorative platform system validation
- [ ] **Time reversal compatibility**: Validate decorative platforms remain static during gameplay

### Implementation Plan

#### Files/Classes to Change
- **Create**: `tests/integration/decorative-platform-system-complete.test.js`

#### Integration Points
- **Systems affected**: Complete decorative platform system (factory, rendering, depth ordering)
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create**: `decorative-platform-system-complete.test.js`
- **Key test cases**:
  1. Complete decorative platform lifecycle: JSON config → loading → rendering
  2. Multi-tile decorative platforms with correct tile selection
  3. Depth ordering with gameplay elements (decorative platforms behind)
  4. No collision detection with player or enemies
  5. Visual hierarchy validation across complex level configurations
- **Mock requirements**: Complete system mocks, collision detection validation

### Task Breakdown & Acceptance Criteria
- [ ] Test complete decorative platform creation pipeline from JSON to render
- [ ] Validate tile selection for single and multi-tile decorative platforms
- [ ] Verify depth ordering ensures decorative platforms render behind gameplay elements
- [ ] Confirm no collision detection between decorative platforms and game entities
- [ ] Validate visual hierarchy with complex level configurations

### Expected Output
Comprehensive integration test that validates the entire decorative platform system works correctly end-to-end.

### Risk Assessment
- **Potential complexity**: Medium – comprehensive integration testing with visual validation
- **Dependencies**: All previous decorative platform tasks completion
- **Fallback plan**: Break into smaller integration tests if comprehensive test proves too complex

### Definition of Done
- [ ] Complete decorative platform system integration test passes
- [ ] Depth ordering validated across all scenarios
- [ ] No collision detection confirmed
- [ ] Visual hierarchy testing established
- [ ] Task marked complete 