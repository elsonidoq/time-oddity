# 🎯 Objective

You are to act as a **technical leader LLM**.  Your task is to revisit a plan your team created and make sure it can be followed without major problems

# 📚 Required Documentation Review (MANDATORY)

Before starting, **you MUST carefully read** the following files:

1. `@invariants.md` – Non-negotiable architectural rules, state structures, and game contracts
2. `@testing_best_practices.md` – Testing strategy and LLM-assisted workflows (TDD/BDD guidelines)
3. `@small_comprehensive_documentation.md` – Technical implementation details, APIs, and architectural patterns
4. `@task_template.md` – Format to follow for each individual task
5. `@level-format.md` - Provides details on the expected JSON format for a level
6. `@level_creation_comprehensive_docs.md` - Provides comprehensive documentation for level creation specific tech stack

# 🛠️ Task

Revisit the tasks in @02_enemy_interactions.md to make sure the plan indicates everything an engineer LLM needs to be aware to implement the task

1. Analyze current implementation and documentation to find gaps in the tasks
2. Make sure the tasks can be executed sequentially
3. Make sure each task follows these rules:
   - One concern per task
   - Increadibly small and testeable
   - All relevant documentation and invariants are described in the task
   - The task has guidelines on how to implement in a clean way
   - The task has testing guidelines as well
   - Clear start and end
   - Use the format defined in `@task_template.md`
4. If a task is not small, you can break it down. For instance if task 4.1 is big, we can create 4.1.1, 4.1.2 and 4.1.3




# 🎯 Objective

You are an **Engineer LLM acting as a Technical Leader**. Your task is to design a detailed, incremental execution plan to achieve a product goal. Your plan will be used by other Engineer LLMs to implement the solution.
Your team has already worked on this, but the plan is not finished yet. This is the work in progress:  @04_algorithmic_levels.md 
Add, remove or modify any task to accomplish this.

## ✅ Requirements for the Plan

Your output must ensure the following:

1. **Goal-Oriented**: The plan must clearly lead to the fulfillment of the product objective described in @04_algorithmic_levels.md 
2. **Clarity of Execution**: Each task must be:
   - Self-contained
   - Clear enough for another Engineer LLM to execute without further clarification
   - Ordered to allow for smooth, progressive development

3. **Functional Validation at Every Step**:
   - The plan must support **incremental development**, meaning each step should preserve or improve functional correctness.
   - After each task is completed, there must be a **clear, defined way to validate its functionality** (through test cases, observable game behavior, or metrics).

4. **Documentation is Mandatory**:
   - Every task must include a documentation step as part of its "Definition of Done".
   - This documentation must explain:
     - **Design choices**
     - **Interfaces introduced or modified**
     - **Invariants maintained**
   - All documentation must be written to:  
     `agent_docs/level_creation_interfaces_and_invariants.md`

Focus on **small, testable steps**, with validation mechanisms included as part of the flow. The end result should be a plan that can be safely executed in sequence, preserving system functionality at every stage.

# Level requirements

The goal is that to create cave like levels that are interesting and challenging. Since those are subjective concepts, we created an objective and easy to compute proxy: a percentage of the level surface must be occupied by the algorithm.

Accomplishing forces that the level is some sort of maze. 

The implementation foundation is solid, but the integration between components needs to be completed to ensure the level requirements are actually enforced during generation.

# 📚 Required Documentation Review (MANDATORY)

Before starting, **you MUST carefully read** the following files:

1. `@invariants.md` – Non-negotiable architectural rules, state structures, and game contracts
2. `@testing_best_practices.md` – Testing strategy and LLM-assisted workflows (TDD/BDD guidelines)
3. `@small_comprehensive_documentation.md` – Technical implementation details, APIs, and architectural patterns
4. `@task_template.md` – Format to follow for each individual task
5. `@level-format.md` - Provides details on the expected JSON format for a level
6. `@level_creation_comprehensive_docs.md` - Provides comprehensive documentation for level creation specific tech stack

# 🛠️ Task

Create a list of incremental conceptual tasks.
- Make an in-depth analysis to create a deep understanding of what is needed to create levels matching the requirements
- Break down that plan into conceptual and clear tasks that help you reason about the problem

After having identified a list of conceptual tasks into atomic tasks by following these rules

Tasks properties:
   - Can be executed sequentially
   - Use the format defined in `@task_template.md`
   - Solve only one concern
   - Are increadibly small and testeable
   - All relevant documentation and invariants are described in the task
   - Has guidelines on how to implement in a clean way
   - Has testing guidelines to make sure the implementation can be trusted
   - Have a clear start and end

Finally, place the tasks in the folder `tasks/cave`. 
Use different files for different phases (e.g. `tasks/cave/01_setup.md`)