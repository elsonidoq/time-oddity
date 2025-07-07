# 🎯 Objective

You are a **technical leader LLM**. Your task is to adapt an **implementation plan** described in the files   @02_core_generation_and_analysis.md , @03_entity_placement_and_validation.md , @04_content_distribution_and_platforms.md and @05_integration_and_validation.md  to incorporate a feature. The new tasks must be suitable for an engineer LLM to implement sequentially with minimal risk and maximum clarity.

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

## Plan audit

The current plan does not make use of the floating and moving platforms to ensure the game is playable as stated in @_00_v1_functional_requirements.md

4. **Reachability-Based Platform Placement**  
   - Analyze reachability constraints (e.g., jump height) from start to coins/goal  
   - Insert platforms only where needed to restore access  
   - *Best Practice*: Generate only necessary platforms—excess leads to visual clutter

The file @level-format.md includes the capability of specifiying floating and moving platforms that can be used to make the game playable and ensure the coins are collectible and the goal is reachable as @_00_v1_functional_requirements.md states.

Thus, the plan lacks of: 
- Floating platform placement algorithm
- Moving platform placement algorithm
- Reachability-based platform insertion

In order to leverage the current cave representation, I propose the following conceptual way compute wether a cave with platforms is solvable:
1. Incorporate into the A* algorithm the fact that the player jumping power is 800 pixels (12,5 tiles) and gravity is 980 @Player.hs
2. Place the player and the goal (far from each other)
3. Place all the coins
4. Optimize platform to ensure the coins are collectible and the goal is reachable:
    - Build the reachability graph based on movement physics and places platforms only where necessary.
    - Represent floating platforms as segments of contiguous wall tiles in the cave
    - Represent moving platforms as a the region spanned by the platform in the whole movement


## 📚 Prerequisite Reading (MANDATORY)

Before beginning, review the following files:

- `@01_blueprint.md`: System architecture for procedural level generation
- `@testing_best_practices.md`: Guidelines for test-driven, LLM-assisted development
- `@level-format.md`: Level data structure specification
- `@available_tiles.md`: Constraints for visual and functional tile usage
- `@task_template.md`: Required format for task descriptions

## 🛠️ Task Instructions

### 1. Completing
- Analyze the whole plan written in the files  @02_core_generation_and_analysis.md , @03_entity_placement_and_validation.md , @04_content_distribution_and_platforms.md and @05_integration_and_validation.md 
- You will improve plan written in @03_entity_placement_and_validation.md by addressing all issues identified in the audit
- The improved plan MUST comply with all described requirements and be coherent with posterior phases ( @04_content_distribution_and_platforms.md and @05_integration_and_validation.md )

Each new task must: 
- Follow the exact format defined in `@task_template.md`
- Be extremely small, focused, and testable
- Include:
  - **Implementation guidelines**, emphasizing clean design principles
  - **Testing instructions**, covering test cases and observable behavior
  - **Documentation update instructions**, including what to record and why

### 3. Output
- ONLY EDIT @03_entity_placement_and_validation.md 

Your plan will serve as the definitive roadmap for the implementation LLM. **Precision, clarity, and structure are critical.**

