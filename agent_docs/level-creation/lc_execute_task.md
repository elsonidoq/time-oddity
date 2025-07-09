## Context Setup
You are working on the Time Oddity project, a Phaser 3-based platformer game with time manipulation mechanics. The project follows strict architectural patterns and testing methodologies.

## Required Documentation Review
Before beginning any task, you MUST review these documents:


1. **@_00_v1_functional_requirements.md**: Contains the functional requirements for the cave generation algorithm. all non-negotiable architectural assumptions, state structures, and contracts that must be preserved. Must make sure that no other thing breaks 
2. **@testing_best_practices.md @server_testing_patterns.md @test_examples.md @testing_antipatterns.md ** - Defines TDD/BDD methodologies, testing strategies, and LLM-assisted development workflows  
3. **@level-format.md**: Contains documentation of the structure that a JSON describing a level must have 
4. **@04_comprehensive_documentation.md** - Provides comprehensive documentation for level creation specific tech stack
5. ** @/interfaces_and_invariants    ** - Provides all invariants, and interfaces that must be considered for level creation. Update this document as you implement everything. Use @index.md as the table of contents


## Task Assignment
- Read all documentation.
- Read the task CG-04.10 described in @03_entity_placement_and_validation.md .
- Make sure to think the proper abstraction to solve the task.
- Ask the user for clarification if there is any ambiguity or you consider the task specification to be incomplete. 
- Write down a plan to implement it. Identify new states, invariants that need preservation.
- Follow a STRICT TDD approach and implement your plan to execute the task CG-04.10 described in @03_entity_placement_and_validation.md .  IMPLEMENT THE WHOLE TASK WITHOUT USER INPUT
- Modify the script `generate-70x70-level-with-json.js` to use this coin placement algoritm
- After finishing a task, double check the task definition of done to make sure you actually finished.

## Critical Requirements

### Testing Requirements
- **Follow TDD methodology strictly** as defined in  @testing_best_practices.md 
- **AVOID NESTED LOOPS SCANING THE LEVEL PIXEL BY PIXEL**. Doing that is painfully slow
- **Unit tests must be fast and isolated** (use proper mocking strategies)
- **Integration tests for component interactions** where appropriate
- **All tests must pass before considering task complete**
- **All tests must RUN FAST by design, avoid of large loops**

### Architectural Compliance
- **Maintain decoupled architecture** (logic separated from engine dependencies)
- **Follow established patterns** from @04_comprehensive_documentation.md 
- **Maintain documentation updated**
- **Preserve existing event contracts** and runtime event names
- **Ensure compatibility with existing mocks and test utilities**

## Error Handling
- If tests fail after 3 retry attempts, stop and request clarification
- If state/invariant conflicts arise, document the issue and seek guidance
- If architectural patterns are unclear, reference the documentation before proceeding