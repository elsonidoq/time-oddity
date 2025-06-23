# Phase 3.bis: Refactor Test Suite for Best Practices

**Instructions:**
- Complete each task in the order listed below. Do not start a new task until the previous one is fully completed, committed, and all changes are stable.
- The test suite is currently not fully passing; this sequence is designed to systematically resolve all issues. After each task, ensure that no new test failures are introduced and that progress is made toward a fully passing suite. Only the final task requires all project tests to pass.
- Each task is self-contained and provides all necessary context for execution by an engineering LLM or developer.
- After each task, verify the project is stable before proceeding.

---

## Task 1: Centralize and Standardize Manual Mocks

**Start here.** This task must be completed before any others. Move all manual mocks for Phaser, GSAP, and Howler.js into the `tests/mocks/` directory, ensuring all test files import mocks from this central location. No other refactoring should be performed in this step.

### Objective
Move all manual mocks for Phaser, GSAP, and Howler.js into the `tests/mocks/` directory, ensuring all test files import mocks from this central location.

### Documentation References
- [ ] comprehensive_documentation.md: Testing and Mocking (Mocking External Libraries)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - Move or create `phaserMock.js`, `gsapMock.js`, `howlerMock.js` in `tests/mocks/`
  - Update test files to import from these mocks
- **Integration Points:**
  - All test files using external library mocks
- **Mocking/Test Setup:**
  - Ensure all mocks are up to date and cover required APIs
- **Potential Risks/Complexity:**
  - Risk of missing a test file using an old or inline mock

### TDD Test Plan
- **Test Files to Create/Update:**
  - All test files using external library mocks
- **Test Cases:**
  - Tests should pass using only the centralized mocks
- **Test Data/Mocks Needed:**
  - Centralized mocks in `tests/mocks/`

### Task Breakdown & Acceptance Criteria
- [ ] Move/create all manual mocks in `tests/mocks/`
- [ ] Update all test files to import mocks from this location
- [ ] Remove any duplicate or inline mocks

### Expected Output
All tests use centralized mocks from `tests/mocks/`. No duplicate or inline mocks remain.

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Expected output is achieved and verified
- [ ] No new test failures are introduced (existing failures may remain)
- [ ] Code reviewed and approved
- [ ] Documentation updated (if relevant)
- [ ] No new linter or type errors
- [ ] No regressions in related features
- [ ] Task marked as complete in tracking system

### Git Handling
- [ ] All changes are committed with clear, descriptive messages
- [ ] Changes are pushed to the correct feature branch
- [ ] Branch is up to date with main/develop before merge
- [ ] Pull request created and linked to task (if applicable)

### Post-Mortem / Retrospective (fill in if needed)
- _Document any issues with missing or incomplete mocks, and how to avoid them in the future._

---

## Task 2: Enforce Test Isolation and Resetting Mocks

**Prerequisite:** Task 1 must be fully completed and all changes must be stable before starting this task.

Ensure all tests reset mocks and state between runs to prevent test pollution and flaky results. Do not refactor test structure or imports in this step—focus only on isolation and resetting mocks.

### Objective
Ensure all tests reset mocks and state between runs to prevent test pollution and flaky results.

### Documentation References
- [ ] comprehensive_documentation.md: Testing and Mocking (Best Practices for Avoiding Flaky Tests)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - All test files
  - Global Jest setup file (e.g., `tests/setup.js`)
- **Integration Points:**
  - All test suites
- **Mocking/Test Setup:**
  - Use `jest.clearAllMocks()` in `afterEach` or global setup
- **Potential Risks/Complexity:**
  - Some tests may rely on shared state and need refactoring

### TDD Test Plan
- **Test Files to Create/Update:**
  - All test files
- **Test Cases:**
  - Tests remain reliable and deterministic after isolation improvements
- **Test Data/Mocks Needed:**
  - N/A

### Task Breakdown & Acceptance Criteria
- [ ] Add/reset mocks in global setup or in each test file
- [ ] Refactor tests that rely on shared state

### Expected Output
All tests are isolated, and no test result depends on the order of execution.

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Expected output is achieved and verified
- [ ] No new test failures are introduced (existing failures may remain)
- [ ] Code reviewed and approved
- [ ] Documentation updated (if relevant)
- [ ] No new linter or type errors
- [ ] No regressions in related features
- [ ] Task marked as complete in tracking system

### Git Handling
- [ ] All changes are committed with clear, descriptive messages
- [ ] Changes are pushed to the correct feature branch
- [ ] Branch is up to date with main/develop before merge
- [ ] Pull request created and linked to task (if applicable)

### Post-Mortem / Retrospective (fill in if needed)
- _Document any issues with test pollution or isolation, and how to avoid them in the future._

---

## Task 3: Remove Barrel File Imports from Tests

**Prerequisite:** Task 2 must be fully completed and all changes must be stable before starting this task.

Update all test files to use direct imports instead of barrel files (e.g., `index.js` re-exports), as per best practices. Do not move test files or refactor test structure in this step.

### Objective
Update all test files to use direct imports instead of barrel files (e.g., `index.js` re-exports), as per best practices.

### Documentation References
- [ ] comprehensive_documentation.md: Testing and Mocking (Avoid Barrel File Imports)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - All test files using barrel imports
- **Integration Points:**
  - All modules imported in tests
- **Mocking/Test Setup:**
  - N/A
- **Potential Risks/Complexity:**
  - Some imports may need to be updated in multiple places

### TDD Test Plan
- **Test Files to Create/Update:**
  - All test files using barrel imports
- **Test Cases:**
  - Tests pass with direct imports
- **Test Data/Mocks Needed:**
  - N/A

### Task Breakdown & Acceptance Criteria
- [ ] Identify and update all barrel imports in test files
- [ ] Ensure all imports are direct and explicit

### Expected Output
All test files use direct imports. No barrel file imports remain in tests.

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Expected output is achieved and verified
- [ ] No new test failures are introduced (existing failures may remain)
- [ ] Code reviewed and approved
- [ ] Documentation updated (if relevant)
- [ ] No new linter or type errors
- [ ] No regressions in related features
- [ ] Task marked as complete in tracking system

### Git Handling
- [ ] All changes are committed with clear, descriptive messages
- [ ] Changes are pushed to the correct feature branch
- [ ] Branch is up to date with main/develop before merge
- [ ] Pull request created and linked to task (if applicable)

### Post-Mortem / Retrospective (fill in if needed)
- _Document any issues with import paths or module resolution._

---

## Task 4: Refactor Test Structure for Co-Location and Clarity

**Prerequisite:** Task 3 must be fully completed and all changes must be stable before starting this task.

Ensure all test files are co-located with their source files (where possible), and that shared mocks/utilities remain in `tests/`. Do not change test logic or imports in this step.

### Objective
Ensure all test files are co-located with their source files (where possible), and that shared mocks/utilities remain in `tests/`.

### Documentation References
- [ ] comprehensive_documentation.md: Testing and Mocking (Recommended Directory Structure)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - Move test files as needed
- **Integration Points:**
  - Source and test directories
- **Mocking/Test Setup:**
  - N/A
- **Potential Risks/Complexity:**
  - May require updating test paths in CI/config

### TDD Test Plan
- **Test Files to Create/Update:**
  - All test files
- **Test Cases:**
  - Tests run and pass from new locations
- **Test Data/Mocks Needed:**
  - N/A

### Task Breakdown & Acceptance Criteria
- [ ] Move test files to be co-located with source (where appropriate)
- [ ] Ensure shared mocks/utilities remain in `tests/`
- [ ] Update any config/CI paths as needed

### Expected Output
Test files are co-located with their source files, and shared mocks/utilities are centralized.

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Expected output is achieved and verified
- [ ] No new test failures are introduced (existing failures may remain)
- [ ] Code reviewed and approved
- [ ] Documentation updated (if relevant)
- [ ] No new linter or type errors
- [ ] No regressions in related features
- [ ] Task marked as complete in tracking system

### Git Handling
- [ ] All changes are committed with clear, descriptive messages
- [ ] Changes are pushed to the correct feature branch
- [ ] Branch is up to date with main/develop before merge
- [ ] Pull request created and linked to task (if applicable)

### Post-Mortem / Retrospective (fill in if needed)
- _Document any issues with test file locations or config._

---

## Task 5: Add/Refactor Tests for Time-Based and Animation Features Using Fake Timers

**Prerequisite:** Task 4 must be fully completed and all changes must be stable before starting this task.

Ensure all tests for time-based logic (cooldowns, GSAP animations, etc.) use Jest fake timers for deterministic, fast, and reliable results. Do not refactor unrelated test logic in this step.

### Objective
Ensure all tests for time-based logic (cooldowns, GSAP animations, etc.) use Jest fake timers for deterministic, fast, and reliable results.

### Documentation References
- [ ] comprehensive_documentation.md: Testing and Mocking (Testing Time-Based Mechanics with Fake Timers)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - All tests for time-based features
- **Integration Points:**
  - Player, Dash, TimeManager, etc.
- **Mocking/Test Setup:**
  - Use `jest.useFakeTimers()` and `jest.advanceTimersByTime()`
- **Potential Risks/Complexity:**
  - Some tests may need significant refactoring

### TDD Test Plan
- **Test Files to Create/Update:**
  - All time-based feature tests
- **Test Cases:**
  - Tests for cooldowns, animation delays, etc., are deterministic and fast
- **Test Data/Mocks Needed:**
  - N/A

### Task Breakdown & Acceptance Criteria
- [ ] Refactor/add tests to use fake timers for all time-based logic
- [ ] Remove any reliance on real timeouts/delays

### Expected Output
All time-based tests use fake timers and are deterministic.

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Expected output is achieved and verified
- [ ] No new test failures are introduced (existing failures may remain)
- [ ] Code reviewed and approved
- [ ] Documentation updated (if relevant)
- [ ] No new linter or type errors
- [ ] No regressions in related features
- [ ] Task marked as complete in tracking system

### Git Handling
- [ ] All changes are committed with clear, descriptive messages
- [ ] Changes are pushed to the correct feature branch
- [ ] Branch is up to date with main/develop before merge
- [ ] Pull request created and linked to task (if applicable)

### Post-Mortem / Retrospective (fill in if needed)
- _Document any issues with fake timers or time-based logic._

---

## Task 6: Document and Enforce New Testing Patterns

**Prerequisite:** Task 5 must be fully completed and all changes must be stable before starting this task.

Update documentation to reflect new testing patterns, and add comments/examples in test files as guidance for future contributors. This is the final step and should only be started after all previous tasks are complete and the test suite is stable.

### Objective
Update documentation to reflect new testing patterns, and add comments/examples in test files as guidance for future contributors.

### Documentation References
- [ ] comprehensive_documentation.md: Testing and Mocking (all sections)

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `comprehensive_documentation.md`, test files
- **Integration Points:**
  - All contributors
- **Mocking/Test Setup:**
  - N/A
- **Potential Risks/Complexity:**
  - N/A

### TDD Test Plan
- **Test Files to Create/Update:**
  - Documentation, test files
- **Test Cases:**
  - N/A
- **Test Data/Mocks Needed:**
  - N/A

### Task Breakdown & Acceptance Criteria
- [ ] Update documentation with new patterns and examples
- [ ] Add comments/examples in test files as needed

### Expected Output
Documentation and test files clearly reflect and explain new best practices.

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Expected output is achieved and verified
- [ ] All project tests pass (locally and in CI)
- [ ] Code reviewed and approved
- [ ] Documentation updated (if relevant)
- [ ] No new linter or type errors
- [ ] No regressions in related features
- [ ] Task marked as complete in tracking system

### Git Handling
- [ ] All changes are committed with clear, descriptive messages
- [ ] Changes are pushed to the correct feature branch
- [ ] Branch is up to date with main/develop before merge
- [ ] Pull request created and linked to task (if applicable)

### Post-Mortem / Retrospective (fill in if needed)
- _Document any issues with documentation or knowledge sharing._

--- 

## Task 7: Refactor Scene and Entity Constructors for Testability (Mock Injection)

### Objective
Refactor the constructors of `BaseScene`, `GameScene`, `Entity`, and `Player` to accept an optional `mockScene` parameter. Update all affected tests to pass the centralized mock scene from `tests/mocks/phaserMock.js`. This ensures all scene/physics references (including nested ones set in super() calls) are correctly mocked, fully resolving persistent errors like `this.scene.physics.add.collider is not a function` and enabling reliable, maintainable test execution.

### Documentation References
- [x] `comprehensive_documentation.md`: Testing and Mocking (Mocking External Libraries, Best Practices for Testability)
- [x] This task is created in response to persistent issues in phase 3.bis test refactor

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/scenes/BaseScene.js`
  - `client/src/scenes/GameScene.js`
  - `client/src/entities/Entity.js`
  - `client/src/entities/Player.js`
  - All affected test files (notably those instantiating scenes/entities directly)
- **Integration Points:**
  - Scene and entity instantiation in tests
  - All code paths that rely on `this.scene`, `this.physics`, etc.
- **Mocking/Test Setup:**
  - Centralized mock from `tests/mocks/phaserMock.js` will be passed as a constructor argument in tests
- **Potential Risks/Complexity:**
  - Refactoring constructors may require updating all instantiations in both source and test code
  - Risk of missing a test or code path that instantiates without the mock

### TDD Test Plan
- **Test Files to Create/Update:**
  - All test files that instantiate scenes/entities (e.g., `game-scene.test.js`, `game-scene-physics-fix.test.js`, `world-boundaries.test.js`, `player-statemachine-integration.test.js`)
- **Test Cases:**
  - All existing tests must pass with the new constructor signature
  - Edge case: instantiating without a mock should still work in production code
- **Test Data/Mocks Needed:**
  - Centralized mock scene from `tests/mocks/phaserMock.js`

### Task Breakdown & Acceptance Criteria
- [ ] Refactor constructors of `BaseScene`, `GameScene`, `Entity`, and `Player` to accept an optional `mockScene` parameter
- [ ] Update all affected test files to pass the mock scene when instantiating these classes
- [ ] Remove unnecessary patching of scene/physics references in test setup
- [ ] All tests pass with no persistent mocking errors

### Expected Output
- All tests pass reliably with no `this.scene.physics.add.collider is not a function` or similar errors
- All scene/entity instantiations in tests use the centralized mock
- No unnecessary patching or workarounds remain in test setup

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Expected output is achieved and verified
- [ ] All project tests pass (locally and in CI)
- [ ] Code reviewed and approved
- [ ] Documentation updated (including Testing and Mocking section if relevant)
- [ ] No new linter or type errors
- [ ] No regressions in related features
- [ ] Task marked as complete in tracking system
- [ ] **Task is marked as completed in the relevant tracking file (e.g., by updating the checkbox or adding a completion note in the phase/task file)**

### Git Handling
- [ ] All changes are committed with clear, descriptive messages
- [ ] Changes are pushed to the correct feature branch (specify branch name if needed)
- [ ] Branch is up to date with main/develop before merge
- [ ] Pull request created and linked to task (if applicable)

### Post-Mortem / Retrospective (fill in if needed)
- _If this task caused test breakage, required significant rework, or revealed process gaps, document what happened and how to avoid it in the future._

---

## Task 8: Fix Time Reversion Bug - Player Movement After Rewind

**Prerequisite:** Task 7 must be fully completed and all changes must be stable before starting this task.

### Objective
Fix the bug where the player starts walking after releasing the R key (time reversion) until an arrow key is pressed. The issue occurs because the player's state machine doesn't properly handle the transition from rewind mode back to normal gameplay.

### Documentation References
- [x] `comprehensive_documentation.md`: Section 7.1 "The Time Control System: A Deep Dive"
- [x] `comprehensive_documentation.md`: Section 7.2 "Player State Machine Definition"
- [x] This task addresses a regression introduced during the refactor in Task 7

### Pre-Implementation Design & Impact
- **Files/Classes to Change:**
  - `client/src/entities/Player.js` - Update the update method to properly handle post-rewind state transitions
  - `client/src/systems/TimeManager.js` - May need to add a callback or event when rewind ends
  - `client/src/entities/states/IdleState.js` - May need to ensure proper idle state handling
  - `client/src/entities/states/RunState.js` - May need to ensure proper run state handling
- **Integration Points:**
  - Player state machine transitions
  - TimeManager rewind state management
  - InputManager state detection
- **Mocking/Test Setup:**
  - Need to test rewind start/stop scenarios
  - Need to verify state machine transitions after rewind
- **Potential Risks/Complexity:**
  - Risk of breaking existing rewind functionality
  - Need to ensure state machine properly handles all edge cases

### TDD Test Plan
- **Test Files to Create/Update:**
  - `tests/unit/player-statemachine-integration.test.js` - Add tests for rewind state transitions
  - `tests/unit/time-manager.test.js` - Add tests for rewind end callbacks
  - `tests/unit/game-scene.test.js` - Add integration tests for rewind behavior
- **Test Cases:**
  - Player should transition to idle state when rewind ends and no movement keys are pressed
  - Player should transition to run state when rewind ends and movement keys are pressed
  - Player should not get stuck in walking state after rewind
  - Rewind should not interfere with normal state machine operation
- **Test Data/Mocks Needed:**
  - Mock input states for various scenarios
  - Mock time manager rewind states

### Task Breakdown & Acceptance Criteria
- [ ] Identify the root cause of the player movement bug after rewind
- [ ] Implement proper state machine update after rewind ends
- [ ] Add tests to verify the fix works correctly
- [ ] Ensure no regressions in existing rewind functionality
- [ ] Verify the player behaves correctly in all rewind scenarios

### Expected Output
- Player stops moving immediately when rewind ends and no movement keys are pressed
- Player moves correctly when rewind ends and movement keys are pressed
- No unintended movement occurs after rewind
- All existing rewind functionality continues to work correctly

### Definition of Done
- [ ] All acceptance criteria are met
- [ ] Expected output is achieved and verified
- [ ] All project tests pass (locally and in CI)
- [ ] Code reviewed and approved
- [ ] Documentation updated (if relevant)
- [ ] No new linter or type errors
- [ ] No regressions in related features
- [ ] Task marked as complete in tracking system
- [ ] **Task is marked as completed in the relevant tracking file (e.g., by updating the checkbox or adding a completion note in the phase/task file)**

### Git Handling
- [ ] All changes are committed with clear, descriptive messages
- [ ] Changes are pushed to the correct feature branch (specify branch name if needed)
- [ ] Branch is up to date with main/develop before merge
- [ ] Pull request created and linked to task (if applicable)

### Post-Mortem / Retrospective (fill in if needed)
- _If this task caused test breakage, required significant rework, or revealed process gaps, document what happened and how to avoid it in the future._

--- 