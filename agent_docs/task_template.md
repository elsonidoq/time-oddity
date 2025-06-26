# Task Template: Time Oddity Development

> **Copy this template for each new task. Fill in all sections.**
> **Use the reusable_task_prompt_template.md for execution workflow.**

---

## Task Title
_A concise, descriptive title for the task._

## Objective
_What is the goal? What feature, fix, or improvement is being delivered?_

## Task Reference
_Reference to the specific task (e.g., "Task 4.15 of phase_4.md")_

## Pre-Implementation Analysis

### Documentation Dependencies
- [ ] **invariants.md sections to review**: _List specific sections (e.g., "§17 State Structures", "§8 Enemy/Freeze Contract")_
- [ ] **testing_best_practices.md sections to apply**: _List relevant testing strategies (e.g., "GSAP Mocking", "State-Based Testing")_
- [ ] **small_comprehensive_documentation.md sections to reference**: _List technical implementation details (e.g., "§7.1 Time Control System", "§2.1 Core API")_

### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: _List all existing state structures that must remain unchanged_
- [ ] **New states/invariants to create**: _If applicable, describe new state structures or invariants_
- [ ] **Time reversal compatibility**: _Confirm how new objects will handle state recording/restoration_

## Implementation Plan

### Files/Classes to Change
- **Create**: _List new files to be created_
- **Modify**: _List existing files to be modified_
- **Delete**: _List files to be removed (if any)_

### Integration Points
- **Systems affected**: _List game systems that will be impacted_
- **State machines**: _List any state machines that need updates_
- **External libraries**: _List any third-party libraries that will be used_

### Testing Strategy
- **Test files to create/update**: _List all test files_
- **Key test cases**: _Describe main test scenarios and edge cases_
- **Mock requirements**: _List any new mocks or test utilities needed_

## Task Breakdown & Acceptance Criteria
- [ ] _Atomic sub-task 1_: _Description and acceptance criteria_
- [ ] _Atomic sub-task 2_: _Description and acceptance criteria_
- [ ] **Invariant Documentation**: _If new invariants were created or existing ones modified, document them in invariants.md_
  - [ ] New invariants are added to the appropriate section with clear explanation
  - [ ] Modified invariants include explanation of why the change is safe
  - [ ] All new state structures are documented in §17 State Structures & Time Reversal Contracts
  - [ ] Any new event names are added to §15 Runtime Event Names
  - [ ] Any new asset/animation keys are added to §14 Asset & Animation Keys
  - [ ] Any new testing assumptions are added to §13 Testing Assumptions
- [ ] ...

## Expected Output
_Describe the observable deliverable or change that should result from this task (e.g., new feature visible in-game, passing tests, console output, etc.)._

## Risk Assessment
- **Potential complexity**: _Identify areas that might cause test breakage or architectural issues_
- **Dependencies**: _List any external dependencies or assumptions_
- **Fallback plan**: _Describe what to do if the primary approach fails_

## Definition of Done
- [ ] All acceptance criteria are met
- [ ] Expected output is achieved and verified
- [ ] All project tests pass (locally and in CI)
- [ ] Code reviewed and approved
- [ ] **invariants.md updated if new states/invariants were created**
  - [ ] New invariants documented with clear rationale
  - [ ] Modified invariants include explanation of safety
  - [ ] All state structures properly documented in §17
  - [ ] Any new contracts or assumptions added to relevant sections
- [ ] No new linter or type errors
- [ ] No regressions in related features
- [ ] Task marked as complete in tracking system

## Post-Mortem / Retrospective (fill in if needed)
- _If this task caused test breakage, required significant rework, or revealed process gaps, document what happened and how to avoid it in the future._

--- 