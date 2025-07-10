# Task: Remove Hardcoded Level Creation Logic

## Task Title
Remove all hardcoded level creation methods from GameScene.js and ensure full JSON-based level definition

## Objective
Eliminate all hardcoded level creation logic (e.g., `createCoinsHardcoded`, `createPlatformsHardcoded`, `createParallaxBackgroundHardcoded`) from GameScene.js. The entire level must be defined via JSON configuration. Delete related functions, tests, and documentation references.

## Task ID: 05.01

## Pre-Implementation Analysis

### Documentation Dependencies
- [ ] **invariants.md sections to review**: "§13 Level/Platform Geometry", "§3 Scene Lifecycle", "§17 Testing Assumptions"
- [ ] **testing_best_practices.md sections to apply**: "Level 1: Unit Tests", "Level 2: Integration Tests", "State-Based Testing"
- [ ] **comprehensive_documentation.md sections to reference**: "§7.3 UI/HUD Architecture", "§1.2 The Scene System"

### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: All existing level loading behavior, fallback mechanisms, SceneFactory integration
- [ ] **New states/invariants to create**: None - removing functionality, not adding
- [ ] **Time reversal compatibility**: No impact - removal of hardcoded creation doesn't affect time reversal system
- [ ] **Invariant validation**: Ensure Scene lifecycle and platform geometry contracts remain intact

## Implementation Plan

### Files/Classes to Change
- **Create**: None
- **Modify**: 
  - `client/src/scenes/GameScene.js` (remove hardcoded methods)
  - Integration test files that may reference hardcoded methods
- **Delete**: 
  - `createCoinsHardcoded()` method
  - `createPlatformsHardcoded()` method  
  - `createParallaxBackgroundHardcoded()` method
  - Any associated test files testing these hardcoded methods

### Integration Points
- **Systems affected**: Level loading, fallback mechanisms, SceneFactory integration
- **State machines**: None directly affected
- **External libraries**: None

### Testing Strategy
- **Test files to create/update**: 
  - Update `tests/integration/game-scene-*.test.js` files
  - Update any unit tests that reference hardcoded methods
- **Key test cases**: 
  - Verify SceneFactory handles empty configurations gracefully
  - Ensure error handling when no configuration is provided
  - Test that all level elements are created via JSON configuration only
- **Mock requirements**: 
  - Mock SceneFactory for testing error scenarios
  - Mock level configurations for edge cases

## Task Breakdown & Acceptance Criteria

### Task 05.01.1: Identify and Document All Hardcoded Method Dependencies
- [ ] **Audit GameScene.js**: List all calls to hardcoded methods (`createCoinsHardcoded`, `createPlatformsHardcoded`, `createParallaxBackgroundHardcoded`)
- [ ] **Document fallback logic**: Identify where these methods are used as fallbacks
- [ ] **Test coverage analysis**: Find all tests that reference these hardcoded methods
- [ ] **Acceptance**: Complete inventory of hardcoded methods and their usage

### Task 05.01.2: Update SceneFactory Error Handling
- [ ] **Enhance SceneFactory validation**: Ensure graceful handling of missing configurations
- [ ] **Add comprehensive logging**: Log warnings when configurations are missing instead of falling back to hardcoded
- [ ] **Error messages**: Provide clear error messages when required configurations are missing
- [ ] **Acceptance**: SceneFactory handles missing configurations without falling back to hardcoded methods

### Task 05.01.3: Remove createCoinsHardcoded Method
- [ ] **Remove method**: Delete `createCoinsHardcoded()` method from GameScene.js
- [ ] **Remove fallback calls**: Remove all calls to `createCoinsHardcoded()` from `createCoinsWithFactory()`
- [ ] **Update error handling**: Ensure proper error when no coin configuration exists
- [ ] **Acceptance**: Method removed, no references remain, graceful error handling implemented

### Task 05.01.4: Remove createPlatformsHardcoded Method
- [ ] **Remove method**: Delete `createPlatformsHardcoded()` method from GameScene.js
- [ ] **Remove fallback calls**: Remove all calls to `createPlatformsHardcoded()` from `createPlatformsWithFactory()`
- [ ] **Update error handling**: Ensure proper error when no platform configuration exists
- [ ] **Acceptance**: Method removed, no references remain, graceful error handling implemented

### Task 05.01.5: Remove createParallaxBackgroundHardcoded Method
- [ ] **Remove method**: Delete `createParallaxBackgroundHardcoded()` method from GameScene.js
- [ ] **Remove fallback calls**: Remove all calls to `createParallaxBackgroundHardcoded()` from `createBackgroundsWithFactory()`
- [ ] **Update error handling**: Ensure proper error when no background configuration exists
- [ ] **Acceptance**: Method removed, no references remain, graceful error handling implemented

### Task 05.01.6: Update Tests and Remove Hardcoded Test References
- [ ] **Remove hardcoded method tests**: Delete any unit tests specifically testing hardcoded methods
- [ ] **Update integration tests**: Modify integration tests to use JSON configurations exclusively
- [ ] **Add missing configuration tests**: Create tests for scenarios where configurations are missing
- [ ] **Acceptance**: All tests pass, no references to hardcoded methods in test suite

### Task 05.01.7: Validate JSON-Only Level Creation
- [ ] **Test complete levels**: Verify all existing level configurations work without hardcoded fallbacks
- [ ] **Test empty configurations**: Ensure graceful handling of missing configuration sections
- [ ] **Test error scenarios**: Verify proper error messages when required configurations are missing
- [ ] **Acceptance**: All levels can be created exclusively through JSON configuration

## Expected Output
- GameScene.js no longer contains hardcoded level creation methods
- All level creation is driven by JSON configuration only
- Clear error messages when configurations are missing (no silent fallbacks)
- All existing tests pass with updated JSON-only approach
- No references to hardcoded methods in codebase or tests

## Risk Assessment
- **Potential complexity**: Some integration tests may fail if they depend on hardcoded methods
- **Dependencies**: SceneFactory must handle all configuration scenarios gracefully
- **Fallback plan**: If SceneFactory has gaps, enhance it rather than restore hardcoded methods

## Definition of Done
- [ ] All acceptance criteria are met
- [ ] Expected output is achieved and verified
- [ ] All project tests pass (locally and in CI)
- [ ] Code reviewed and approved
- [ ] **invariants.md updated if new states/invariants were created**
- [ ] No new linter or type errors
- [ ] No regressions in related features
- [ ] Task marked as complete in tracking system

## Post-Mortem / Retrospective (fill in if needed)
- _If this task caused test breakage, required significant rework, or revealed process gaps, document what happened and how to avoid it in the future._ 