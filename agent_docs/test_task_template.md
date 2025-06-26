# Test Task Template: Time Oddity Testing & Quality Assurance

> **Copy this template for each new testing task. Fill in all sections.**
> **Use the reusable_task_prompt_template.md for execution workflow.**

---

## Task Title
_A concise, descriptive title for the testing task (e.g., "Add Unit Tests for ChronoPulse Freeze Mechanics")_

## Objective
_What is the testing goal? What feature, system, or code path is being tested? What quality assurance outcome is expected?_

## Task Reference
_Reference to the specific task (e.g., "Testing for Task 4.15 of phase_4.md", "Coverage improvement for InputManager.js")_

## Pre-Implementation Analysis

### Documentation Dependencies
- [ ] **testing_best_practices.md sections to apply**: _List specific testing strategies (e.g., "§2.2 GSAP Mocking", "§1.2 Test Pyramid", "§3.1 TDD-as-Prompting")_
- [ ] **invariants.md sections to verify**: _List invariants that must be preserved during testing (e.g., "§8 Enemy/Freeze Contract", "§17 State Structures")_
- [ ] **small_comprehensive_documentation.md sections to reference**: _List technical implementation details (e.g., "§7.1 Time Control System", "§8.2 Mocking External Libraries")_

### Testing Strategy Assessment
- [ ] **Test type classification**: _Specify test layer (Unit/Integration/E2E) and rationale_
- [ ] **Test pyramid compliance**: _Confirm this test contributes to the 70-20-10 distribution_
- [ ] **Mocking requirements**: _List external dependencies that need mocking (Phaser, GSAP, Howler.js, etc.)_
- [ ] **State management considerations**: _Identify state structures that need testing (TemporalState, Entity state, etc.)_

### Coverage & Quality Goals
- [ ] **Target coverage metrics**: _Specify statement, branch, function, and line coverage targets_
- [ ] **Critical paths to test**: _List high-risk code paths that must be verified_
- [ ] **Edge cases to cover**: _Identify boundary conditions, error states, and exceptional scenarios_
- [ ] **Performance considerations**: _Specify any performance testing requirements_

## Implementation Plan

### Test Files to Create/Modify
- **Create**: _List new test files to be created_
- **Modify**: _List existing test files to be updated_
- **Delete**: _List obsolete test files to be removed (if any)_

### Test Infrastructure Requirements
- **New mocks needed**: _List any new mock objects or test utilities required_
- **Test data setup**: _Describe test fixtures, factories, or data generators needed_
- **Environment configuration**: _Specify any test environment setup (JSDOM, fake timers, etc.)_

### Integration Points
- **Systems being tested**: _List game systems that are the focus of testing_
- **Dependencies to mock**: _List external libraries and services that need mocking_
- **State machines**: _List any state machines that need testing_

### Testing Strategy
- **Primary test approach**: _Specify TDD, BDD, or other testing methodology_
- **Key test scenarios**: _Describe main test cases and acceptance criteria_
- **Mock strategy**: _Detail how external dependencies will be mocked_

## Task Breakdown & Acceptance Criteria
- [ ] _Test setup and infrastructure_: _Create necessary mocks, fixtures, and test utilities_
- [ ] _Core functionality tests_: _Test main features and happy path scenarios_
- [ ] _Edge case tests_: _Test boundary conditions and error scenarios_
- [ ] _Integration tests_: _Test component interactions and system integration_
- [ ] _Performance tests_: _Test timing, memory usage, and performance characteristics_
- [ ] _State management tests_: _Test state recording, restoration, and time reversal_
- [ ] _Mock validation_: _Verify that mocks correctly simulate external dependencies_

## Expected Output
_Describe the observable deliverable or change that should result from this testing task (e.g., new test suite with X% coverage, passing integration tests, performance benchmarks, etc.)._

## Risk Assessment
- [ ] **Test fragility**: _Identify areas that might cause brittle or flaky tests_
- [ ] **Mock complexity**: _Assess complexity of required mocks and potential maintenance burden_
- [ ] **Performance impact**: _Evaluate impact of tests on CI/CD pipeline execution time_
- [ ] **Coverage gaps**: _Identify areas that might be difficult to test or have low coverage_

## Definition of Done
- [ ] All test cases are implemented and passing
- [ ] Target coverage metrics are achieved
- [ ] All project tests pass (locally and in CI)
- [ ] Test documentation is updated
- [ ] **invariants.md verified** - no new invariant violations introduced
- [ ] No new linter or type errors
- [ ] Test execution time is within acceptable limits
- [ ] Mock objects are properly documented and maintainable
- [ ] Test suite follows established patterns from testing_best_practices.md

## Testing Best Practices Compliance

### Test Pyramid Adherence
- [ ] **Unit tests (70-80%)**: _Confirm majority of tests are fast, isolated unit tests_
- [ ] **Integration tests (15-20%)**: _Verify component interaction tests are appropriately scoped_
- [ ] **E2E tests (5-10%)**: _Ensure high-level tests are minimal and focused on critical paths_

### TDD/BDD Implementation
- [ ] **Test-first approach**: _Tests written before implementation where applicable_
- [ ] **BDD scenarios**: _User-focused behavior descriptions for complex features_
- [ ] **Red-Green-Refactor cycle**: _Follow TDD methodology for new features_

### Mocking Strategy
- [ ] **External library mocking**: _Proper mocking of Phaser, GSAP, Howler.js, etc._
- [ ] **State-based testing**: _Test state changes rather than implementation details_
- [ ] **Mock maintenance**: _Mocks are documented and kept in sync with real APIs_

### Performance & Quality
- [ ] **Fast execution**: _Unit tests complete in <50ms, integration tests <100ms_
- [ ] **Isolation**: _Tests are independent and can run in any order_
- [ ] **Deterministic**: _Tests produce consistent results across runs_

## Post-Mortem / Retrospective (fill in if needed)
- _If this testing task revealed architectural issues, required significant rework, or uncovered process gaps, document what happened and how to avoid it in the future._

---

## Testing Task-Specific Guidelines

### For Unit Tests
- **Scope**: Test individual functions, methods, or classes in isolation
- **Mocks**: Mock all external dependencies (Phaser objects, GSAP, Howler.js)
- **Speed**: Should execute in milliseconds
- **Coverage**: Aim for 90%+ coverage of the specific unit

### For Integration Tests
- **Scope**: Test interactions between multiple components
- **Mocks**: Mock only external services, use real internal dependencies
- **Speed**: May take seconds to execute
- **Focus**: Verify component collaboration and data flow

### For E2E Tests
- **Scope**: Test complete user workflows or game features
- **Mocks**: Minimal mocking, test real system behavior
- **Speed**: May take minutes to execute
- **Purpose**: Verify critical user journeys work end-to-end

### For Performance Tests
- **Scope**: Test timing, memory usage, and scalability
- **Metrics**: Measure execution time, memory consumption, frame rate
- **Baselines**: Establish performance benchmarks for regression testing
- **Tools**: Use performance profiling tools and memory leak detection

### For State Management Tests
- **Scope**: Test state recording, restoration, and time reversal
- **TemporalState**: Verify proper state serialization/deserialization
- **Time reversal**: Test rewind/forward mechanics
- **Invariants**: Ensure state contracts are maintained

---

_This template ensures comprehensive testing coverage while maintaining the project's quality standards and architectural integrity._ 