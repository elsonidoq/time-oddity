# 🎯 Objective

You are to act as a **technical leader LLM**.  Your task convert a coarse grained plan into a fine grained plan, allowing an engineer LLM can sequentially execute atomic tasks with low risk of breaking things

## ✅ Requirements for the Plan

Your output must ensure the following:

1. **Goal-Oriented**: The plan must clearly lead to the fulfillment of the product objective described in @_00_v1_functional_requirements.md
2. **Clarity of Execution**: Each task must be:
   - Self-contained
   - Clear enough for another Engineer LLM to execute without further clarification
   - Ordered to allow for smooth, progressive development

3. **Functional Validation at Every Step**:
   - The plan must support **incremental development**, meaning each step should preserve or improve functional correctness.
   - After each task is completed, there must be a **clear, defined way to validate its functionality** through test cases AND observable game behavior if aplicable, or any evidence to the user to verify the correctness of what was coded.

4. **Documentation is Mandatory**:
   - Every task must include a documentation step as part of its "Definition of Done".
   - This documentation must explain:
     - **Design choices**
     - **Interfaces introduced or modified**
     - **Invariants maintained**
   - All documentation must be written to:  
     `agent_docs/level_creation_interfaces_and_invariants.md`

Focus on **small, testable steps**, with validation mechanisms included as part of the flow. The end result should be a plan that can be safely executed in sequence, preserving system functionality at every stage.


# 📚 Required Documentation Review (MANDATORY)

Before starting, **you MUST carefully read** the following files:

- `@01_blueprint.md `: Full architecture for procedural level generation
- `@testing_best_practices.md`: Guidelines for test-driven and LLM-assisted workflows
- `@level-format.md`: Format specification for generated levels
- `@available_tiles.md`: List of usable tiles and their visual constraints
- `@task_template.md `: Standard format for task definitions

# 🛠️ Task

## Groups
- Group the tasks in @06_coarse_plan.md into 3 to 5 phases. 
- Each phase will be written in a separate file inside the directory `agent_docs/level-creation/07_fine_plan`

## Break down

Split each coarse task into fine grained tasks using a dot namespace (e.g. CG-09.1, CG-09.2, etc)

Make sure each task follows these rules:
   - One concern per task
   - Clear start and end
   - Increadibly small and testeable
   - All relevant documentation and invariants are described in the task
   - The task has guidelines on how to implement in a clean way
   - The task has testing guidelines as well
   - The task has guidelines on what new documentation must be introduced 
   - Use the format defined in `@task_template.md`


Finally, place the tasks in the folder  `agent_docs/level-creation/07_fine_plan`.
Use different files for different phases (e.g.  `agent_docs/level-creation/07_fine_plan/01_setup.md`)