# Task Plan: Level & Visual Design Configuration

> **Addresses Functional Gap**: 🎨 Level & Visual Design Configuration
> **Goal**: Make backgrounds configurable via JSON level files to enable richer and more diverse level design

---

## Task 03.01 – Extend Level JSON Schema for Background Configuration

### Objective
Add background configuration support to the level JSON format, enabling specification of background sprites and layers via level files.

### Task ID
03.01

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: §15 Asset & Animation Keys, §3 Scene Lifecycle, §1 Global Architecture
- [ ] **testing_best_practices.md sections to apply**: "State-Based Testing", "Decoupled Architecture Testing"
- [ ] **level-format.md sections to reference**: JSON schema extension patterns, asset loading constraints

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: Background texture loading, parallax calculation, depth layering
- [ ] **New states/invariants to create**: Background JSON schema validation, configurable background creation
- [ ] **Time reversal compatibility**: Unchanged – backgrounds are static visual elements

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `agent_docs/level-creation/level-format.md` – add background configuration schema
- **Modify**: `client/src/systems/SceneFactory.js` – add createBackgroundsFromConfig method
- **Modify**: Level JSON configs in `client/src/config/` – add background configurations
- **Create**: `tests/unit/scene-factory-background-config.test.js`

#### Integration Points
- **Systems affected**: SceneFactory, background rendering system, asset loading
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create**: `scene-factory-background-config.test.js`
- **Key test cases**:
  1. Valid background config creates backgrounds with correct sprites
  2. Multiple background layers created with proper depth ordering
  3. Missing background section creates default backgrounds (graceful fallback)
  4. Invalid background sprite keys handled gracefully
  5. Background depth values validated and applied correctly
- **Mock requirements**: Use existing PhaserSceneMock, background texture mocks

### Task Breakdown & Acceptance Criteria
- [ ] Extend level-format.md with background configuration schema documentation
- [ ] Add `createBackgroundsFromConfig()` method to SceneFactory class
- [ ] Support multiple background layers with configurable sprites and depths
- [ ] Maintain compatibility with existing hardcoded background creation
- [ ] Green unit test proving background factory creation from JSON config

### Expected Output
Level JSON files can specify background configurations; SceneFactory creates backgrounds from configuration; existing default backgrounds preserved as fallback.

### Risk Assessment
- **Potential complexity**: Low – follows established SceneFactory patterns for other game objects
- **Dependencies**: Existing background sprite assets, SceneFactory architecture
- **Fallback plan**: Preserve hardcoded background creation if JSON parsing fails

### Definition of Done
- [ ] All acceptance criteria met
- [ ] All project tests pass (locally and in CI)
- [ ] No linter or type errors
- [ ] Background JSON schema documented in level-format.md
- [ ] Task marked complete

---

## Task 03.02 – Replace Hardcoded Background Creation with Factory Pattern

### Objective
Remove hardcoded background creation from GameScene.createParallaxBackground() and replace with JSON-driven background creation via SceneFactory.

### Task ID
03.02

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: §3 Scene Lifecycle, §1 Global Architecture
- [ ] **testing_best_practices.md sections to apply**: "Integration Tests", "State-Based Testing"
- [ ] **comprehensive_documentation.md sections to reference**: §1.6 Camera Systems and visual effects

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: Parallax scrolling calculation, background depth layering, camera integration
- [ ] **New states/invariants to create**: None – moving existing logic to JSON-driven approach
- [ ] **Time reversal compatibility**: Unchanged – backgrounds don't participate in time mechanics

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `client/src/scenes/GameScene.js` – replace createParallaxBackground with factory call
- **Modify**: Level config JSONs – add background configurations to replace hardcoded backgrounds
- **Create**: `tests/integration/game-scene-background-json-integration.test.js`

#### Integration Points
- **Systems affected**: GameScene background initialization, parallax scrolling system
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create**: `game-scene-background-json-integration.test.js`
- **Key test cases**:
  1. GameScene creates backgrounds from JSON configuration (not hardcoded)
  2. Parallax scrolling still works with JSON-configured backgrounds
  3. Background depth layering preserved
  4. Camera integration maintained (backgrounds scroll correctly)
  5. Default backgrounds created when JSON config has empty background array
- **Mock requirements**: GameScene mock, SceneFactory mock, camera mock

### Task Breakdown & Acceptance Criteria
- [ ] Remove hardcoded background creation from GameScene.createParallaxBackground()
- [ ] Add SceneFactory.createBackgroundsFromConfig() call to GameScene
- [ ] Update test-level.json and other configs with background configurations
- [ ] Ensure parallax scrolling behavior preserved
- [ ] Maintain camera bounds and background scaling logic

### Expected Output
GameScene loads backgrounds from JSON configuration instead of hardcoded creation; visual behavior identical; parallax effects preserved.

### Risk Assessment
- **Potential complexity**: Medium – need to preserve parallax calculations and camera integration
- **Dependencies**: Task 03.01 completion, existing parallax scrolling logic
- **Fallback plan**: Keep hardcoded background creation as fallback if JSON parsing fails

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Hardcoded background creation removed from GameScene
- [ ] JSON-driven background creation working correctly
- [ ] Parallax scrolling and camera integration preserved
- [ ] All project tests pass

---

## Task 03.03 – Implement Advanced Background Features

### Objective
Add support for advanced background features including multiple parallax layers, background animations, and scrolling speeds via JSON configuration.

### Task ID
03.03

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: §15 Asset & Animation Keys, camera and performance constraints
- [ ] **testing_best_practices.md sections to apply**: "Performance Testing", "Integration Tests"
- [ ] **comprehensive_documentation.md sections to reference**: §2 GSAP Animation integration

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: Camera follow behavior, performance characteristics
- [ ] **New states/invariants to create**: Background animation state, multi-layer parallax calculations
- [ ] **Time reversal compatibility**: Background animations should pause during rewind

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `client/src/systems/SceneFactory.js` – extend background creation with advanced features
- **Modify**: `client/src/scenes/GameScene.js` – update parallax calculation for multiple layers
- **Create**: `tests/unit/scene-factory-advanced-backgrounds.test.js`
- **Create**: `tests/integration/background-parallax-layers.test.js`

#### Integration Points
- **Systems affected**: Parallax scrolling, GSAP animations, TimeManager (for pause behavior)
- **State machines**: None
- **External libraries**: GSAP (for background animations)

#### Testing Strategy
- **Test files to create**: `scene-factory-advanced-backgrounds.test.js`, `background-parallax-layers.test.js`
- **Key test cases**:
  1. Multiple parallax layers with different scroll speeds
  2. Background animations created and controlled via GSAP
  3. Background animations pause during time rewind
  4. Performance maintained with multiple animated background layers
  5. Advanced background features gracefully degrade with fallbacks
- **Mock requirements**: GSAP mock, TimeManager mock, multiple background layer mocks

### Task Breakdown & Acceptance Criteria
- [ ] Support multiple parallax layers with configurable scroll speeds
- [ ] Add background animation support via GSAP integration
- [ ] Ensure background animations pause during time rewind
- [ ] Optimize performance for multiple background layers
- [ ] Comprehensive test coverage for advanced background features

### Expected Output
Rich, multi-layered backgrounds with animations; configurable parallax speeds; performance-optimized rendering; time rewind integration.

### Risk Assessment
- **Potential complexity**: High – multiple parallax layers and animations can impact performance
- **Dependencies**: GSAP integration, TimeManager pause behavior
- **Fallback plan**: Disable advanced features if performance drops below acceptable levels

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Advanced background features working correctly
- [ ] Performance benchmarks within acceptable ranges
- [ ] Time rewind integration working properly
- [ ] All project tests pass

---

## Task 03.04 – Update Level Configurations with Rich Backgrounds

### Objective
Update existing level JSON files with diverse background configurations to demonstrate the new background system capabilities.

### Task ID
03.04

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **available_tiles.md sections to reference**: Background sprite catalog
- [ ] **level-format.md sections to reference**: Final background configuration schema

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: Level playability, platform visibility, visual hierarchy
- [ ] **New states/invariants to create**: Level-specific background themes and visual identity
- [ ] **Time reversal compatibility**: Unchanged – backgrounds remain static during gameplay

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `client/src/config/test-level.json` – add rich background configuration
- **Modify**: `client/src/config/adventure-level.json` – add thematic background layers
- **Modify**: `client/src/config/complex-level.json` – add advanced background features
- **Create**: New sample level JSONs showcasing different background themes
- **Create**: `tests/integration/level-background-themes.test.js`

#### Integration Points
- **Systems affected**: Level loading system, visual theme consistency
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create**: `level-background-themes.test.js`
- **Key test cases**:
  1. Each level loads with correct background theme
  2. Background layers don't interfere with gameplay visibility
  3. Background themes enhance level atmosphere appropriately
  4. Performance remains stable across different background configurations
  5. Background configurations validate correctly
- **Mock requirements**: Level loading mocks, background rendering mocks

### Task Breakdown & Acceptance Criteria
- [ ] Update all existing level JSONs with appropriate background configurations
- [ ] Create diverse background themes (grassland, cave, desert, industrial, etc.)
- [ ] Ensure visual hierarchy maintains gameplay clarity
- [ ] Validate background performance across all level configurations
- [ ] Document background design best practices

### Expected Output
Visually rich and diverse levels with appropriate background themes; maintained gameplay clarity; performance-optimized configurations.

### Risk Assessment
- **Potential complexity**: Low – primarily content creation and configuration
- **Dependencies**: Tasks 03.01-03.03 completion, available background assets
- **Fallback plan**: Use simpler background configurations if performance issues arise

### Definition of Done
- [ ] All acceptance criteria met
- [ ] All levels have rich, appropriate background configurations
- [ ] Visual design enhances gameplay experience
- [ ] Performance validated across all configurations
- [ ] Background design guidelines documented

---

## Task 03.05 – Integration Test & Documentation Finalization

### Objective
Create comprehensive integration test for complete background system and finalize documentation for JSON-driven background configuration.

### Task ID
03.05

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **testing_best_practices.md sections to apply**: "Integration Tests", "Visual Regression Testing"
- [ ] **level-format.md sections to review**: Background schema completion

### Implementation Plan

#### Files/Classes to Change
- **Create**: `tests/integration/background-system-complete.test.js`
- **Modify**: `agent_docs/level-creation/level-format.md` – finalize background configuration documentation
- **Create**: Background design guidelines in documentation

#### Testing Strategy
- **Integration test coverage**:
  1. Complete background lifecycle: JSON config → loading → rendering → parallax → animations
  2. Multiple background layers with correct depth ordering
  3. Background performance with complex configurations
  4. Time rewind integration with background animations
  5. Visual regression testing for background rendering

### Task Breakdown & Acceptance Criteria
- [ ] Comprehensive integration test covering complete background system
- [ ] Documentation updated to reflect JSON-driven background system
- [ ] Background design guidelines created
- [ ] Performance benchmarks documented
- [ ] Visual regression test suite established

### Expected Output
Complete background system working end-to-end; comprehensive test coverage; complete documentation and design guidelines.

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Integration test passes and covers complete background system
- [ ] Documentation comprehensively covers background configuration
- [ ] Background design guidelines available for level creators
- [ ] Performance benchmarks documented and validated
- [ ] Task marked complete 