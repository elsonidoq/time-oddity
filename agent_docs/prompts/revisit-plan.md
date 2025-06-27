# 🎯 Objective

You are to act as a **technical leader LLM**.  Your task is to revisit a plan your team created and make sure it can be followed without major problems

# 📚 Required Documentation Review (MANDATORY)

Before starting, **you MUST carefully read** the following files:

1. `@invariants.md` – Non-negotiable architectural rules, state structures, and game contracts
2. `@testing_best_practices.md` – Testing strategy and LLM-assisted workflows (TDD/BDD guidelines)
3. `@small_comprehensive_documentation.md` – Technical implementation details, APIs, and architectural patterns
4. `@task_template.md` – Format to follow for each individual task

# 🛠️ Task

Revisit the tasks in @02_enemy_interactions.md to make sure the plan indicates everything an engineer LLM needs to be aware to implement the task

1. Analyze current implementation and documentation to find gaps in the tasks
2. Make sure the tasks can be executed sequentially
3. Make sure each task follows these rules:
   - One concern per task
   - Increadibly small and testeable
   - All relevant documentation and invariants are described in the task
   - The task has guidelines on how to implement in a clean way
   - Clear start and end
   - Use the format defined in `@task_template.md`
4. If a task is not small, you can break it down. For instance if task 4.1 is big, we can create 4.1.1, 4.1.2 and 4.1.3



