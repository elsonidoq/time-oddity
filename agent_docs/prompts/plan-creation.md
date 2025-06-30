# 🎯 Objective

You are a **technical leader LLM**. Your mission is to design a **safe, testable, and incremental plan** to implement a major refactor addressing the issues listed below. These changes are necessary to reach MVP. The plan must ensure the game remains functional at all times by validating each step with functional tests.

# 🧱 Functional gaps

## 🧠 Enemy Behavior & Rules
- Enemy positions must be **configurable via the JSON level file**.
- When the player touches a **LoopHound**, the player should **take damage**, but the **LoopHound must not** receive any.
- **LoopHounds can only be killed** if they are **frozen by the ChronoPulse**.

## 🎨 Level & Visual Design Configuration
- The **background** must be **configurable via the JSON level file**.
- The **JSON level file** must support specifying **background sprites** to allow for richer and more diverse level design.

## 🗺️ Simplified Map View
- When pressing the **`T` key**, a **simplified level map** must be displayed.
  - It should clearly indicate:
    - The **player's position**
    - The **locations of coins**
    - The **platform layout**, as described in the JSON

## 🛠️ Level Generation Algorithm (v1)
- Develop a script to **generate full, playable levels** procedurally.
  - Levels must include:
    - **Coherent background and platform layout**
    - **Strategically placed coins**
    - **Strategically placed enemies**
  - The script must support a `difficulty` parameter (1 = easy, 5 = hard) that affects level complexity and challenge.



# 📚 Mandatory Reading Before Planning

Before writing any tasks, you MUST study these documents:

- `@invariants.md`: core architecture and contracts
- `@testing_best_practices.md`: how to test (TDD/BDD, workflows)
- `@small_comprehensive_documentation.md`: implementation details and APIs
- `@task_template.md`: format for writing tasks

# 🛠️ What You Must Do

For each functional gap listed above:

1. Analyze current implementation and documentation to **identify the minimal set of changes** needed.
2. Create a **modular and incremental execution plan**.
3. Break each issue into a **series of tiny, testable tasks**, following these rules:

   - One concern per task
   - Clear start and end
   - Tasks must be independently verifiable
   - Use the format defined in `@task_template.md`

4. Place the generated tasks in a file within the folder: `tasks/03_mvp_this_time`

EACH FUNCTIONAL GAP MUST BE WRITTEN DOWN IN A DIFFERENT FILE

# ✅ Task Execution Rules

- After completing each task, the LLM must:
  1. Mark it as complete
  2. Run all functional tests to ensure no regressions
  3. Only then proceed to the next task

- If any **new invariant** is introduced, add it to `@invariants.md`

# 🧠 Before You Begin

Do NOT generate the plan until you:

- Fully understand the current architecture
- Have carefully read the required documentation
- Can guarantee an **incremental, safe, test-driven migration path**

Only then, begin generating the task plan.




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

You will generate a complete, incremental plan to:

1. **Design and introduce a `Platform` class** to abstract all platform logic
2. **Replace existing hardcoded platforms** with the new class (without changing game behavior)
3. **Add support for moving platforms**
4. **Enable level configuration via JSON**, including reading platform types and positions from file

## 🚦Plan Requirements

- The plan must be divided into **3 clear phases**:
  - **Phase 1**: Introduce `Platform` class and refactor existing static platforms. No new game functionality.
  - **Phase 2**: Add support for moving platforms.
  - **Phase 3**: Enable level creation from external JSON config.

- **Before planning** any task, you must perform a **deep design analysis** of the new `Platform` interface. Define a flexible and extensible structure (include composition, parameters, behaviors). This interface should be documented at the top of the plan.

## ✅ Each task in the plan must:
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

**Output only the file content for `tasks/platform_class.md`, starting with the Platform interface design.**



RAW

Role: Expert prompt engineer
Context: You want prompt an engineer LLM to act as a technical leader and create a plan to execute a task. It is a big refactor, so it is highly important that the plan is incremental and enables functional tests ensuring the game is still working during the execution
Task: Optimize the following prompt to be an effective instruction for an engineer LLM. Write the optimized prompt in plain text, with markdown syntax enclosed in triple backquotes

Prompt:
```
# Context: platforms are created using sprites. That is not scalable to create configurable levels

# Required Documentation Review
Before starting the plan, you MUST review these documents:

1. **@invariants.md ** - Contains all non-negotiable architectural assumptions, state structures, and contracts that must be preserved
2. **@testing_best_practices.md ** - Defines TDD/BDD methodologies, testing strategies, and LLM-assisted development workflows  
3. **@small_comprehensive_documentation.md ** - Provides technical implementation details, API references, and architectural patterns


# Task: Create a plan to refactor the code to include a Platform class that abstracts the concept of platforms.
Create two phases. Phase one must not introduce any new functionality to the game, must just create the platform class and integrate it with the game. The second phase must create a mooving platform and integrate it into the game. Finally, the third phase must ensure that creating a level is easy, reading platforms, types and positions from a json file

Use @task_template.md as a template for task creation.

Each task should:
- Be incredibly small + testable
- Have a clear start + end
- Focus on one concern
I’ll be passing this off to an engineering LLM that will be told to complete one task at a time in sequential order, allowing me to test in between.
After executing each task, an engineer LLM must mark the task as completed before proceeding to the next
If a task creates a new invariant, that must be documented in @invariants.md

Write the plan into the file `tasks/platform_class.md`

# Think before you plan
Before creating the plan, perform an in-depth analisis of the code and design an extensible Platform interface that can be used for the refactor. Document that platform interface in the plan itself

