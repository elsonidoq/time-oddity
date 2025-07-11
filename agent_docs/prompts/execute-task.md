## Context Setup
You are working on the Time Oddity project, a Phaser 3-based platformer game with time manipulation mechanics. The project follows strict architectural patterns and testing methodologies.

## Required Documentation Review
Before beginning any task, you MUST review these documents:


1. ** @invariants.md **: Contains all non-negotiable architectural assumptions, state structures, and contracts that must be preserved. Must make sure that no other thing breaks 
2. **@testing_best_practices.md ** - Defines TDD/BDD methodologies, testing strategies, and LLM-assisted development workflows  
3. **@small_comprehensive_documentation.md ** - Provides technical implementation details, API references, and architectural patterns
4. ** @level-format.md  **: Contains documentation of the structure that a JSON describing a level must have 

## Task Assignment
- Read all documentation
- Read the task 1.1 of @09_game_final_details.md 
- Make sure to think the proper abstraction before implementing it
- Write down a plan to implement it. Identify new states, invariants that need preservation
- Follow a STRICT TDD approach and implement your plan to execute the task 1.1 of @09_game_final_details.md. Follow testing best practices from @testing_best_practices.md, use centralized mocks
- After finishing a task, double check the task description to make sure you actually finished

Follow the rule @task-execution.mdc 
## Critical Requirements

### Testing Requirements
- **Follow TDD methodology strictly** as defined in  @testing_best_practices.md 
- **Unit tests must be fast and isolated** (use proper mocking strategies)
- **Integration tests for component interactions** where appropriate
- **All tests must pass before considering task complete**
- **All tests must RUN FAST by design, avoid of large loops**

### Architectural Compliance
- **Maintain decoupled architecture** (logic separated from engine dependencies)
- **Follow established patterns** from  @small_comprehensive_documentation.md 
- **Preserve existing event contracts** and runtime event names
- **Ensure compatibility with existing mocks and test utilities**

## Error Handling
- If tests fail after 3 retry attempts, stop and request clarification
- If state/invariant conflicts arise, document the issue and seek guidance
- If architectural patterns are unclear, reference the documentation before proceeding