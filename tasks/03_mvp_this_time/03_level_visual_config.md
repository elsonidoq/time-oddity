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

## Task 03.04.1 – Create Background Asset Catalog

### Objective
Document available background assets and create design guidelines for background configuration.

### Task ID
03.04.1

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: §15 Asset & Animation Keys (background atlas loading)
- [ ] **available_tiles.md sections to reference**: Asset organization patterns
- [ ] Kenney background spritesheet XML files for asset inventory

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: BootScene background atlas loading
- [ ] **New states/invariants to create**: Background asset catalog, design guidelines
- [ ] **Time reversal compatibility**: N/A – documentation task

### Implementation Plan

#### Files/Classes to Change
- **Create**: `agent_docs/level-creation/background-design-guidelines.md`
- **Modify**: `agent_docs/level-creation/available_tiles.md` – add background asset section

#### Integration Points
- **Systems affected**: None (documentation only)
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create**: None (documentation task)
- **Key test cases**: Asset validation will be tested in implementation tasks
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] Catalog all available background sprites from Kenney spritesheet
- [ ] Create background design guidelines document
- [ ] Document best practices for background layer composition
- [ ] Create visual hierarchy guidelines (backgrounds vs gameplay elements)
- [ ] Document performance considerations for multiple background layers
- [ ] Add background asset section to available_tiles.md

### Expected Output
Complete catalog of available background assets with design guidelines for level creators.

### Risk Assessment
- **Potential complexity**: Low – documentation and asset inventory
- **Dependencies**: Kenney background assets, existing asset organization
- **Fallback plan**: N/A – documentation task

### Definition of Done
- [ ] Background asset catalog complete
- [ ] Design guidelines documented
- [ ] Performance guidelines included
- [ ] Visual hierarchy best practices documented
- [ ] Integration with existing documentation structure

---

## Task 03.04.2 – Update All Level Configurations with Rich Backgrounds

### Objective
Update all existing level JSON files with appropriate background configurations using the new background system.

### Task ID
03.04.2

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **level-format.md sections to reference**: Background configuration schema
- [ ] **background-design-guidelines.md sections to reference**: Design guidelines from Task 03.04.1
- [ ] **available_tiles.md sections to reference**: Background asset catalog

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: Level playability, existing gameplay elements visibility
- [ ] **New states/invariants to create**: Themed background configurations for each level
- [ ] **Time reversal compatibility**: Unchanged – backgrounds remain static during gameplay

### Implementation Plan

#### Files/Classes to Change
- **Create**: `tests/integration/all-level-backgrounds.test.js`
- **Modify**: `client/src/config/test-level.json` – rich background configuration
- **Modify**: `client/src/config/adventure-level.json` – themed background configuration
- **Modify**: `client/src/config/complex-level.json` – advanced background features
- **Create**: New sample level configs showcasing different background themes

#### Integration Points
- **Systems affected**: Level loading system, all level configurations
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create**: `all-level-backgrounds.test.js`
- **Key test cases**:
  1. All level files load successfully with background configurations
  2. Background themes appropriate for each level type
  3. No visual conflicts between backgrounds and gameplay elements
  4. Performance acceptable across all level configurations
  5. Background configurations validate against schema
- **Mock requirements**: Level loading mocks, performance measurement mocks

### Task Breakdown & Acceptance Criteria
- [ ] Add appropriate background themes to test-level.json (grassland theme)
- [ ] Add adventure-themed backgrounds to adventure-level.json
- [ ] Add complex multi-layer backgrounds to complex-level.json
- [ ] Create sample levels showcasing different background themes (desert, cave, industrial)
- [ ] Validate all configurations against background schema
- [ ] Performance test all level configurations

### Expected Output
All level configurations have rich, thematically appropriate backgrounds that enhance visual appeal without affecting gameplay.

### Risk Assessment
- **Potential complexity**: Medium – need to balance visual appeal with performance
- **Dependencies**: Tasks 03.01.x-03.04.1 completion, all previous background system work
- **Fallback plan**: Use simpler background configurations if performance issues arise

### Definition of Done
- [ ] All level files updated with background configurations
- [ ] Background themes appropriate for each level
- [ ] No gameplay visibility issues
- [ ] Performance validation completed
- [ ] All configurations validate against schema

---

## Task 03.05.1 – Create Comprehensive Background System Integration Test

### Objective
Create comprehensive integration test that validates the entire background system from JSON config loading to rendering.

### Task ID
03.05.1

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **testing_best_practices.md sections to apply**: "Integration Tests", "Visual Regression Testing", "Performance Testing"
- [ ] **invariants.md sections to review**: Complete background system contracts

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: All background system functionality
- [ ] **New states/invariants to create**: Complete background system validation
- [ ] **Time reversal compatibility**: Validate background animation pause/resume during rewind

### Implementation Plan

#### Files/Classes to Change
- **Create**: `tests/integration/background-system-complete.test.js`

#### Integration Points
- **Systems affected**: Complete background system (factory, rendering, animations, time rewind)
- **State machines**: None
- **External libraries**: GSAP (for animation testing)

#### Testing Strategy
- **Test files to create**: `background-system-complete.test.js`
- **Key test cases**:
  1. Complete background lifecycle: JSON config → loading → rendering → parallax → animations
  2. Multiple background layers with correct depth ordering
  3. Background performance with complex configurations
  4. Time rewind integration with background animations
  5. Error handling across the entire background system
- **Mock requirements**: Complete system mocks, performance measurement mocks

### Task Breakdown & Acceptance Criteria
- [ ] Test complete background creation pipeline from JSON to render
- [ ] Validate background depth ordering across complex scenarios
- [ ] Performance benchmark for maximum supported background complexity
- [ ] Time rewind integration test with animated backgrounds
- [ ] Error handling validation for all background system components
- [ ] Visual regression testing for background rendering

### Expected Output
Comprehensive integration test that validates the entire background system works correctly end-to-end.

### Risk Assessment
- **Potential complexity**: High – comprehensive integration testing is complex
- **Dependencies**: All previous background tasks completion
- **Fallback plan**: Break into smaller integration tests if comprehensive test proves too complex

### Definition of Done
- [ ] Complete background system integration test passes
- [ ] Performance benchmarks documented
- [ ] Error handling validated across all components
- [ ] Time rewind integration working correctly
- [ ] Visual regression testing established

---

## Task 03.05.2 – Finalize Background System Documentation

### Objective
Complete and finalize all documentation for the JSON-driven background system.

### Task ID
03.05.2

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] All previous task documentation updates
- [ ] **testing_best_practices.md sections to reference**: Documentation standards

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `agent_docs/level-creation/level-format.md` – finalize background documentation
- **Modify**: `agent_docs/level-creation/background-design-guidelines.md` – complete guidelines
- **Modify**: `agent_docs/small_comprehensive_documentation.md` – add background system reference

#### Testing Strategy
- **Test files to create**: None (documentation task)
- **Key test cases**: Documentation review and validation
- **Mock requirements**: None

### Task Breakdown & Acceptance Criteria
- [ ] Finalize background configuration schema in level-format.md
- [ ] Complete background design guidelines with examples
- [ ] Add background system section to small_comprehensive_documentation.md
- [ ] Create quick reference guide for background configuration
- [ ] Document performance guidelines and limitations
- [ ] Update any other documentation references to background system

### Expected Output
Complete, comprehensive documentation for the JSON-driven background system that enables level creators to use it effectively.

### Risk Assessment
- **Potential complexity**: Low – documentation consolidation and review
- **Dependencies**: All background system implementation completion
- **Fallback plan**: N/A – documentation task

### Definition of Done
- [ ] All background system documentation complete and accurate
- [ ] Quick reference guide created
- [ ] Performance guidelines documented
- [ ] Documentation integrated with existing docs
- [ ] Task marked complete 