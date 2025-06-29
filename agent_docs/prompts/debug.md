# Context: 

# Required Documentation Review
Before beginning any task, you MUST review these documents:

1. **@invariants.md ** - Contains all non-negotiable architectural assumptions, state structures, and contracts that must be preserved
2. **@testing_best_practices.md ** - Defines TDD/BDD methodologies, testing strategies, and LLM-assisted development workflows  
3. **@small_comprehensive_documentation.md ** - Provides technical implementation details, API references, and architectural patterns


# Task Assignment:
- Perform an in-depth analysis to understand the root cause of the problem
- Write down a detailed and grounded plan 
- EXECUTE the plan following the TDD methodology strictl
Follow the rule @debugging.mdc 


## Critical Requirements

### Testing Requirements
- **Follow TDD methodology strictly** as defined in  @testing_best_practices.md 
- **Unit tests must be fast and isolated** (use proper mocking strategies)
- **Integration tests for component interactions** where appropriate
- **All tests must pass before considering task complete**

### Architectural Compliance
- **Maintain decoupled architecture** (logic separated from engine dependencies)
- **Follow established patterns** from  @small_comprehensive_documentation.md 
- **Preserve existing event contracts** and runtime event names
- **Ensure compatibility with existing mocks and test utilities**

## Error Handling
- If tests fail after 3 retry attempts, stop and request clarification
- If state/invariant conflicts arise, document the issue and seek guidance
- If architectural patterns are unclear, reference the documentation before proceeding