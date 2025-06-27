PLATFORM REFACTOR
# 🎯 Objective

You are to act as a **technical leader LLM**. Your task is to create a detailed, incremental refactoring plan to replace hardcoded platform sprites with a scalable, configurable **Platform abstraction**.

# 📚 Required Documentation Review (MANDATORY)

Before starting, **you MUST carefully read** the following files:

1. `@invariants.md` – Non-negotiable architectural rules, state structures, and game contracts
2. `@testing_best_practices.md` – Testing strategy and LLM-assisted workflows (TDD/BDD guidelines)
3. `@small_comprehensive_documentation.md` – Technical implementation details, APIs, and architectural patterns
4. `@task_template.md` – Format to follow for each individual task

# 🛠️ Task

Based on the steps provided, you will generate a task using @task_template as template

## ✅ The task must:
- Be **extremely small** and **testable**
- Have a **clear start and end**
- Address only **one concern**
- Follow the format in `@task_template.md`
- Be written to the file: `tasks/platform_class.md`

## 🔄 Execution Constraints

- After completing each task, the LLM will:
  1. Mark the task as completed
  2. Run all functional tests to confirm no regressions
  3. Only then proceed to the next task

- If any new invariant is introduced during implementation, it must be appended to `@invariants.md`

# 🧠 Think Before You Plan

Do not generate the plan until you:
- Understand the current architecture from documentation
- Have defined a proper `Platform` interface abstraction
- Have ensured the migration path is safe, incremental, and testable
