## Context Setup
You are working on the Time Oddity project, a Phaser 3-based platformer game with time manipulation mechanics. The project follows strict architectural patterns and testing methodologies.

## Required Documentation Review
Before beginning any task, you MUST review these documents:


1. **@testing_best_practices.md @server_testing_patterns.md @test_examples.md @testing_antipatterns.md ** - Defines TDD/BDD methodologies, testing strategies, and LLM-assisted development workflows  
2. **@level-format.md**: Contains documentation of the structure that a JSON describing a level must have 
3. **@04_comprehensive_documentation.md** - Provides comprehensive documentation for level creation specific tech stack
4. ** @/interfaces_and_invariants    ** - Provides all invariants, and interfaces that must be considered for level creation. Update this document as you implement everything. Use @index.md as the table of contents


## Task Assignment
### Algorithm
Create a new function `_fillWithGraphNoise` that will do as follows:

function _fillWithGraphNoise(grid, corridor_height, corridor_threshold, non_corridor_threshold, rng):

// Part 1: build a threshold matrix
thresholds = initialize a matrix, same shape as grid filled with the value non_corridor_threshold
N_REGIONS = Select a random number, can either be 2,3,4 or 5.
MAIN_POINTS = Select N_REGIONS points scattered across the level, prioritize points near edges

For each point P in MAIN_POINTS
   - K = random either 1 or 2
   - CLOSEST = Select the K points from MAIN_POINTS that are closest using euclidean distance
   - Interpolate a region between P and each of the CLOSEST points using the segment equation `P*alpha + Q*(1-alpha)` for P, P + <0, 1>, ..., P + <0, corridor_height>
   - AFFECTED_TILES = Using both floor and roof functions get all affected tiles (indices for the thresholds matrix)
   - thresholds[AFFECTED_TILES] = corridor_threshold 
 each point of the 

// Part 2: sample initial walls

for i in 0...level height // matrix rows
    for j in 0...level width // matrix columns

        grid[i, j] = random uniform(0, 1) > thresholds[i, j]

return grid


### Class implementation

- Create a new class called GraphGridSeeder
- The class must receive parameters corridor_height, corridor_threshold, non_corridor_threshold 
- Use GridSeeder as reference to implement all methods, so GraphGridSeeder is a drop-in replacement of GridSeeder

### Instructions
- Read all relevant documentation.
- Read with the algorithm described in the task requirements
- Think the proper abstractions to implement the algorithm
- Ask the user for clarification if there is any ambiguity or you consider the task specification to be incomplete. 
- Write down a plan to implement it. Identify new states, invariants that need preservation. 
- Follow a STRICT TDD approach and implement your plan to execute the task.  DO THE WHOLE IMPLEMENTATION WITHOUT USER INPUT
- Modify the script `generate-70x70-level-with-json.js` to use GraphGridSeeder
- Run the script to make sure it works 

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