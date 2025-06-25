# Reusable Task Execution Prompt Template

## Context Setup
You are working on the Time Oddity project, a Phaser 3-based platformer game with time manipulation mechanics. The project follows strict architectural patterns and testing methodologies.

## Required Documentation Review
Before beginning any task, you MUST review these documents:

1. **invariants.md** - Contains all non-negotiable architectural assumptions, state structures, and contracts that must be preserved
2. **testing_best_practices.md** - Defines TDD/BDD methodologies, testing strategies, and LLM-assisted development workflows  
3. **small_comprehensive_documentation.md** - Provides technical implementation details, API references, and architectural patterns

## Task Assignment
**Task Reference**: [INSERT TASK REFERENCE HERE - e.g., "Task 4.15 of phase_4.md"]

## Mandatory Workflow

### Phase 1: Documentation & Planning
1. **Review Documentation**: Thoroughly examine the three required documents listed above
2. **State & Invariant Analysis**: 
   - Identify all existing states and invariants that must be conserved
   - If creating new objects/states, plan how to document them in invariants.md
   - Ensure time reversal compatibility for any new entities
3. **Testing Strategy**: Plan test approach following TDD methodology from testing_best_practices.md

### Phase 2: Test-Driven Development (TDD)
Follow the strict TDD cycle:

1. **Red Phase**: Write failing tests that define the exact requirements
2. **Green Phase**: Implement minimal code to make tests pass
3. **Refactor Phase**: Clean up code while maintaining all tests green

### Phase 3: Implementation
1. **Pre-Implementation Design**: Document files to change, integration points, and potential risks
2. **Implementation**: Follow the planned approach, maintaining state/invariant compliance
3. **Testing**: Ensure all tests pass (new and existing)
4. **Documentation Update**: If new states/invariants were created, update invariants.md

### Phase 4: Validation & Completion
1. **Full Test Suite**: Run complete test suite to ensure no regressions
2. **State/Invariant Verification**: Confirm all existing contracts are preserved
3. **Documentation**: Update invariants.md if new states/invariants were added
4. **Code Review**: Ensure adherence to project standards and patterns

## Critical Requirements

### State & Invariant Conservation
- **ALL existing states and invariants must be conserved** unless explicitly creating new ones
- **New objects must implement appropriate state recording methods** or rely on base TemporalState
- **Any new states/invariants MUST be documented in invariants.md** following the established format
- **Time reversal compatibility is mandatory** for all new entities

### Testing Requirements
- **Follow TDD methodology strictly** as defined in testing_best_practices.md
- **Unit tests must be fast and isolated** (use proper mocking strategies)
- **Integration tests for component interactions** where appropriate
- **All tests must pass before considering task complete**

### Architectural Compliance
- **Maintain decoupled architecture** (logic separated from engine dependencies)
- **Follow established patterns** from small_comprehensive_documentation.md
- **Preserve existing event contracts** and runtime event names
- **Ensure compatibility with existing mocks and test utilities**

## Success Criteria
- [ ] All acceptance criteria met
- [ ] All tests pass (new and existing)
- [ ] No regressions in related features
- [ ] State/invariant compliance verified
- [ ] Documentation updated (invariants.md if applicable)
- [ ] Code follows project architectural patterns
- [ ] Task marked complete in tracking system

## Error Handling
- If tests fail after 3 retry attempts, stop and request clarification
- If state/invariant conflicts arise, document the issue and seek guidance
- If architectural patterns are unclear, reference the documentation before proceeding

---

**Note**: This template is designed to be reusable. Simply replace the task reference and follow the workflow. The three core documents (invariants.md, testing_best_practices.md, small_comprehensive_documentation.md) provide all necessary guidance for successful task completion. 