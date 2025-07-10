# 🎯 Objective

You are a **technical leader LLM**. Your task is to update and refine the **implementation plan** described in `@03_entity_placement_and_validation.md` to ensure it fully satisfies the functional requirements in `@_00_v1_functional_requirements.md`.

The revised plan must:
- Be **step-by-step**, enabling incremental development
- Include **floating and moving platform placement**
- Integrate seamlessly with subsequent stages in:
  - `@04_content_distribution_and_platforms.md`
  - `@05_integration_and_validation.md`

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

## 🔍 Plan Audit: Identified Gaps

The current implementation in `@03_entity_placement_and_validation.md` fails to meet reachability requirements because it lacks:

- **Floating platform placement logic**
- **Moving platform placement logic**
- **A reachability-aware platform insertion strategy**

You must add these missing components to ensure players can reach coins and the goal under the following physical constraints:

- Player jump height: **800 pixels (~12.5 tiles)**  
- Gravity: **980 pixels/sec²** (`@Player.js`)

Conceptual validation approach:

1. Place player and goal in distinct regions
2. Place all coins
3. Use A* with physics-aware constraints to build a reachability graph
4. Insert platforms where needed to ensure solvability:
   - Represent floating platforms as fixed horizontal segments
   - Represent moving platforms as regions swept by movement

---

## 📚 Prerequisite Reading

Before writing your updated plan, read:

- `@01_blueprint.md`: Architectural overview of procedural level generation
- `@testing_best_practices.md`: LLM-centric TDD methodology
- `@level-format.md`: Level data specification (including platform types)
- `@available_tiles.md`: Tile available tiles
- `@task_template.md`: Mandatory format for task descriptions
- `@level_creation_interfaces_and_invariants.md `: Documentation of what is already developed regarding level generation

---

## 🛠️ Task Instructions

IMPORTANT: After having executed the task that places the goal and before having executed the tasks implementing the platform placement logic, the goal WILL BE UNREACHABLE and that is expected until the platform placement algorithms are developed

### Step 1: Analyze
- Review all planning documents, especially `@03_entity_placement_and_validation.md`.
- Identify where to inject the new platform logic so that it fits logically and chronologically between existing phases.

### Step 2: Extend
- Modify `@03_entity_placement_and_validation.md` only.
- Integrate the missing platform placement logic.
- Ensure consistency with both preceding (`@02_...`) and following (`@04_...`, `@05_...`) stages.
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

- Only modify `@03_entity_placement_and_validation.md`
- Do not edit or summarize other files
- Use **precise, senior-level engineering language**

Your output will become the definitive roadmap for an engineer LLM. **Clarity, granularity, and functional safety are non-negotiable.**
