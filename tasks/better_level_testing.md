# Task Template: Time Oddity Development

> **Copy this template for each new task. Fill in all sections.**
> **Use the reusable_task_prompt_template.md for execution workflow.**

---

## Task Title
Level Generation Testing: Avoid phaserMock Anti-Pattern

## Objective
Create comprehensive documentation to guide engineer LLMs in designing tests for level generation that avoid the phaserMock ES/CommonJS problem. The goal is to establish clear boundaries and patterns for server-side level generation testing that never imports client-side game engine mocks.

## Task ID: 
Task 4.16

## Pre-Implementation Analysis

### Documentation Dependencies
- [x] **invariants.md sections to review**: §7 System Invariants, §8 Contracts, §9 Implementation Lessons Learned
- [x] **testing_best_practices.md sections to apply**: "Decoupling Core Logic from Game Engine", "State-Based Testing", "Centralized Mock Architecture"
- [x] **small_comprehensive_documentation.md sections to reference**: §4.1 "From Abstract Grid to Concrete Game Objects", §6.1 "Foundational Testing"

### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: All existing level generation test infrastructure in `server/level-generation/tests/`
- [x] **New states/invariants to create**: Test isolation invariants, mock dependency boundaries, server-side testing patterns
- [x] **Time reversal compatibility**: Level generation tests should focus on data processing, not game engine state

## Implementation Plan

### Integration Points
- **Systems affected**: `server/level-generation/tests/`, `agent_docs/level-creation/`
- **State machines**: None - level generation is stateless data processing
- **External libraries**: ndarray, seedrandom, flood-fill, pathfinding (scientific JS ecosystem only)

## Expected Output
Create documentation that prevents engineer LLMs from importing phaserMock in level generation tests by:

1. **Create `agent_docs/level-creation/testing_antipatterns.md`**:
   - Document the phaserMock ES/CommonJS problem
   - Establish "NEVER import phaserMock" rule for server-side tests
   - Define clear boundaries between client and server testing domains

2. **Create `agent_docs/level-creation/server_testing_patterns.md`**:
   - Document proper test utilities from `server/level-generation/tests/setup.js`
   - Provide patterns for creating mock grids, RNG, pathfinding grids
   - Establish test isolation principles for data processing components

3. **Update `agent_docs/level-creation/interfaces_and_invariants/index.md`**:
   - Add references to new testing documentation
   - Ensure clear separation between client and server testing concerns

4. **Create `agent_docs/level-creation/test_examples.md`**:
   - Provide concrete examples of proper level generation tests
   - Show how to test each pipeline step without phaserMock
   - Demonstrate integration testing patterns for the full pipeline

## Key Principles to Enforce

### ❌ NEVER DO (Anti-Patterns)
- Import phaserMock in server-side level generation tests
- Use client-side game engine mocks for data processing tests
- Mix ESM and CommonJS patterns in test files
- Test level generation with game engine dependencies

### ✅ ALWAYS DO (Best Practices)
- Use existing test utilities from `server/level-generation/tests/setup.js`
- Create mock ndarray grids for testing data processing
- Use deterministic RandomGenerator instances for reproducible tests
- Test level generation as pure data transformation pipeline
- Maintain clear separation between client and server testing domains

## Success Criteria
- Engineer LLMs can create level generation tests without importing phaserMock
- Clear documentation prevents future phaserMock anti-patterns
- Server-side testing follows scientific JS ecosystem patterns
- Test isolation and determinism are maintained
- Documentation is integrated into existing agent_docs structure 