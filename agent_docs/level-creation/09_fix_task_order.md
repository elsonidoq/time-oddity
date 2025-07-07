# 🎯 Objective

You are a **technical leader LLM**. Your task is to update and refine the **implementation plan** described in `@03_entity_placement_and_validation.md`, @04_content_distribution_and_platforms.md and @05_integration_and_validation.md  to ensure it fully satisfies the functional requirements in `@_00_v1_functional_requirements.md`. 

Tasks CG-04.1, CG-04.2, CG-04.3, CG-04.4 and CG-04.5  @03_entity_placement_and_validation.md  have already been executed and are marked as done. 

Specifically: 
- Current plan creates platform placement algorithms BEFORE placing coins. 
- Coins must be placed before, because platforms are used to garantee that the coins are reachable. 
- Finally, enemies must be placed AFTER placing platforms, so we can place the enemy over a platform. In order to be able to place an enemy over a moving platform, consider the initial state in the system. In that initial snapshot, moving and floating platforms are indistinguishable. 


The revised plan must:
- Be **step-by-step**, enabling incremental development
- Include **floating and moving platform placement for coin reachability**

---

## ✅ Plan Design Principles

Each task in your output must adhere to these principles:

### 1. **Goal-Driven**
- Every step must contribute directly to the functional outcomes in `@_00_v1_functional_requirements.md`.

### 2. **Atomic & Isolated**
- Each task must:
  - Solve one specific problem
  - Have a clear start and end
  - Be executable independently
  - Require no external clarification

### 3. **Incrementally Validated**
- Each step must preserve or improve system correctness.
- Define **clear validation procedures**, including:
  - Test cases
  - Observable game behavior (if applicable)
  - Verifiable functional output

### 4. **Mandatory Documentation**
Every task must include explicit instructions to update:
- `agent_docs/level_creation_interfaces_and_invariants.md`

Document:
- Design rationale
- New or updated interfaces
- Invariants preserved or introduced

---

## 📚 Prerequisite Reading

Before writing your updated plan, read:

- `@01_blueprint.md`: Architectural overview of procedural level generation
- `@testing_best_practices.md`: LLM-centric TDD methodology
- `@level-format.md`: Level data specification (including platform types)
- `@available_tiles.md`: Tile available tiles
- `@task_template.md`: Mandatory format for task descriptions
- ` @/interfaces_and_invariants `: Documentation of what is already developed regarding level generation. Use @index.md to understand the contents of the folder

---
## Coarsed-grained tasks

Follow the following order to update the documents

### Phase 3: Entity Placement and Validation (REVISED SEQUENCE)

#### COMPLETED TASKS (Already Done):
- CG-04.1: A* Pathfinding Integration Implementation ✅
- CG-04.2: Player Spawn Placement with Safety Validation ✅  
- CG-04.3: Goal Placement with Reachability Validation ✅
- CG-04.4: Comprehensive Solvability Testing System ✅
- CG-04.5: Physics-Aware Reachability Analysis System ✅

#### NEW SEQUENCE - PHASE 3 CONTINUATION:

**CG-04.6: Strategic Coin Distribution Algorithm**
- Place coins in dead-ends, exploration areas, and strategic locations
- Ensure coins are placed BEFORE platforms (as platforms will make them reachable)

**CG-04.7: Coin Collision Detection and Validation**
- Prevent coin placement inside any colliding blocks
- Validate coin placement against existing cave structure

**CG-04.8: Coin Reachability Analysis (Pre-Platform)**
- Analyze which coins are currently unreachable from player spawn
- Identify gaps that require platform placement

**CG-04.9: Floating Platform Placement Algorithm**
- Place floating platforms to bridge unreachable coin areas
- Ensure all coins become reachable after platform placement

**CG-04.10: Moving Platform Placement Algorithm**
- Add moving platforms for dynamic access routes
- Enhance level complexity while maintaining reachability

**CG-04.11: Platform Integration and Final Reachability Validation**
- Validate that all coins are now reachable after platform placement
- Ensure goal is reachable with platform assistance

### Phase 4: Enemy Placement and Final Validation (REVISED SEQUENCE)

**CG-05.1: Enemy Placement Candidate Identification**
- Identify strategic positions for enemies AFTER platforms are placed
- Consider enemy placement on moving platforms

**CG-05.2: Enemy Patrol Path Validation**
- Validate enemy movement patterns work with placed platforms
- Ensure enemies can move on moving platforms

**CG-05.3: Solvability Preservation with Enemies**
- Ensure enemy placement doesn't break coin/goal reachability
- Validate complete level solvability with all entities

**CG-05.4: Final Comprehensive Validation**
- Validate all functional requirements are met
- Ensure complete level playability

## 🛠️ Task Instructions

### Step 1: Analyze
- Review all planning documents
- Identify in what order all tasks should be executed to avoid rewriting code, so that after each task the algorithm is closer to the what is required in @_00_v1_functional_requirements.md 

### Step 2: Write
- Modify `@03_entity_placement_and_validation.md`, and @04_content_distribution_and_platforms.md  only.
- Ensure the tasks can be sequentially executed

Make sure each task follows these rules:
   - One concern per task
   - Clear start and end
   - Increadibly small and testeable
   - All relevant documentation and invariants are described in the task
   - The task has guidelines on how to implement in a clean way
   - The task has testing guidelines as well
   - The task has guidelines on what new documentation must be introduced 
   - Use the format defined in `@task_template.md`

---

## 📤 Output Instructions

- Only modify `@03_entity_placement_and_validation.md` and ` @04_content_distribution_and_platforms.md `
- Do not edit or summarize other files
- Use **precise, senior-level engineering language**

Your output will become the definitive roadmap for an engineer LLM. **Clarity, granularity, and functional safety are non-negotiable.**