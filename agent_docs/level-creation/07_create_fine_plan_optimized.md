# 🎯 Objective

You are a **technical leader LLM**. Your task is to transform a **coarse-grained implementation plan** described in @06_bis_revisited_coarse_plan.md into a **fine-grained, executable plan** suitable for an engineer LLM to implement sequentially with minimal risk and maximum clarity.

## ✅ Plan Requirements

Your output must adhere to the following principles:

1. **Goal-Driven**  
   - Every task must contribute directly to achieving the product outcomes described in `@_00_v1_functional_requirements.md`.

2. **Atomic and Self-Contained**  
   - Each task must:
     - Address a single concern
     - Have a clear start and end
     - Be executable in isolation
     - Be understandable and actionable by another Engineer LLM **without further clarification**

3. **Functional Validation at Every Step**:
   - The plan must support **incremental development**, meaning each step should preserve or improve functional correctness.
   - Each task must preserve or enhance the system’s functional integrity.
   - After each task is completed, there must be a **clear, defined way to validate its functionality** through test cases AND observable game behavior if aplicable, or any evidence to the user to verify the correctness of what was coded.


4. **Mandatory Documentation**  
   - Every task must explicitly update:
     - `agent_docs/level_creation_interfaces_and_invariants.md`
   - Documentation must cover:
     - Design decisions
     - Modified or introduced interfaces
     - Invariants maintained

5. **Executing the whole plan achieves the functionality specified in @_00_v1_functional_requirements.md **

## Coarsed-grained plan audit

### Critical issues found
#### 1. Missing Python Specification Integration

Issue: The plan mentions cave_generation.py as a specification but doesn't explicitly include tasks to analyze and integrate this Python reference implementation.

Impact: Without proper analysis of the existing Python code, the Node.js implementation may deviate from proven algorithms.

Required Action: Add a dedicated task (CG-00) to analyze the Python specification and extract the exact algorithms.

#### 2. Incomplete Tile System Validation

Issue: While Task 6 covers decorative tiles, the plan doesn't explicitly address the tile suffix validation requirements from functional requirement #7:
-   Edges use tiles with _left or  _right suffix
-   Corners use tiles with _bottom_left, _bottom_right,  _top_left or  _top_right suffix
-   Center tiles use  _center suffix

Impact: Generated levels may have incorrect visual appearance.

Required Action: Enhance Task 6 with explicit tile suffix validation and testing.

#### 3. Missing Collision Detection in Coin Placement

Issue: Task 7 mentions collision detection but doesn't explicitly validate against functional requirement #4: "All coins and the goal are not placed inside another colliding block (ground, floating platform, moving platforms)"

Impact: Coins could be placed inside platforms, making them uncollectible.

Required Action: Add explicit collision validation in Task 7.

#### 4. Incomplete Platform Physics Validation

Issue: Task 9 covers floating platforms but doesn't explicitly address the physics constraints mentioned in the blueprint (jump height, distance validation).

Impact: Generated platforms may be unreachable or create impossible jumps.

Required Action: Add comprehensive physics validation in Task 9.

#### 5. Missing Visual Output Requirements

Issue: The plan mentions "visual output" but doesn't specify what format or how it integrates with the game's visual system.

Impact: Generated levels may not render correctly in the game.

Required Action: Define specific visual output requirements and validation.

#### 6. Incomplete Error Recovery Mechanisms

Issue: While the plan mentions fallback mechanisms, it doesn't specify what happens when generation fails completely.

Impact: System may crash or produce invalid levels under edge cases.

Required Action: Add comprehensive error recovery and regeneration logic.

### 🔧 Architectural Concerns

#### 7. Missing Performance Validation

Issue: The plan sets a 10-second limit but doesn't specify how to measure or validate performance across different grid sizes.

Impact: Performance issues may not be detected until late in development.

Required Action: Add performance benchmarking and validation tasks.

#### 8. Incomplete Integration Testing Strategy

Issue: Task 11 mentions game engine integration but doesn't specify how to test the generated levels in the actual game environment.

Impact: Generated levels may not work correctly in the game.

Required Action: Define specific game integration testing procedures.

### 📋 Missing Documentation Requirements

#### 9. Incomplete Interface Documentation

Issue: While the plan requires updating level_creation_interfaces_and_invariants.md, it doesn't specify what interfaces need to be documented.

Impact: Future developers may not understand the system architecture.

Required Action: Define specific interface documentation requirements.

## 📚 Prerequisite Reading (MANDATORY)

Before beginning, review the following files:

- `@01_blueprint.md`: System architecture for procedural level generation
- `@testing_best_practices.md`: Guidelines for test-driven, LLM-assisted development
- `@level-format.md`: Level data structure specification
- `@available_tiles.md`: Constraints for visual and functional tile usage
- `@task_template.md`: Required format for task descriptions

## 🛠️ Task Instructions

### 1. Completing
- Improve the coarse-grained plan by addressing all issues identified in the audit
- The improved plan MUST comply with all described requirements
- Write the new coarse-grained plan in `agent_docs/level-creation/06_bis2_revisited_coarse_plan.md`

### 2. Grouping
- Divide tasks in `@06_bis2_revisited_coarse_plan.md` into **3 to 5 logical phases**
- Each phase must be written to a separate file:
  - `agent_docs/level-creation/07_fine_plan/{phase_number}_{phase_name}.md`

### 3. Decomposition
- Within each phase, break down coarse tasks into fine-grained subtasks
- Use a hierarchical dot notation (e.g., `CG-09.1`, `CG-09.2`, etc.)

Each fine-grained task must:
- Follow the exact format defined in `@task_template.md`
- Be extremely small, focused, and testable
- Include:
  - **Implementation guidelines**, emphasizing clean design principles
  - **Testing instructions**, covering test cases and observable behavior
  - **Documentation update instructions**, including what to record and why

### 3. Output
- Final plan must reside in:
  - `agent_docs/level-creation/07_fine_plan/`
- Each phase should be in its own file (e.g., `01_setup.md`, `02_tile_logic.md`, etc.)

Your plan will serve as the definitive roadmap for the implementation LLM. **Precision, clarity, and structure are critical.**
