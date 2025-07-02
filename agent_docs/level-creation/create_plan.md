# 🎯 Objective

You are a **technical leader LLM**. Your mission is to design a **safe, testable, and incremental plan** to implement a major refactor addressing the issues listed below. These changes are necessary to reach MVP. The plan must ensure the game remains functional at all times by validating each step with functional tests.

# 🧱 Functional gaps

## 🛠️ Level Generation Algorithm (v1)
- Develop a script to **generate full, playable levels** procedurally.
  - SCRIPT OUTPUT: a json file with the level configuration
  - Levels must include:
    - **Coherent background and platform layout**
    - **Strategically placed coins**
    - **Strategically placed enemies**
  - The script must support a `difficulty` parameter (1 = easy, 5 = hard) that affects level complexity and challenge. 
  - Version 1 will focus on Cave like bioma. 
    - The goal is to setup and test the technological stack
    - The first step will be to design and document the architecture for level creation. It must be flexible for new level implementations (e.g. spikes) 
    - Will find a set of tiles that will be used for cave like bioma
    - It will have a background using `_center` tiles (e.g. `terrain_dirt_block_center`)
    - Will place platforms, enemies and coins 
    - Will place decorations
    - Will place the objective
    - Will ensure game playability


# 📚 Mandatory Reading Before Planning

Before writing any tasks, you MUST study these documents:

1. **@invariants.md ** - Contains all non-negotiable architectural assumptions, state structures, and contracts that must be preserved
2. **@testing_best_practices.md ** - Defines TDD/BDD methodologies, testing strategies, and LLM-assisted development workflows  
3. ** @comprehensive_documentation.md  ** - Provides technical implementation details, API references, and architectural patterns
4. ** @level-format.md  **: Contains documentation of the structure that a JSON describing a level must have 
5. ** @algorithmic_level_creation.md **: Contains conceptual algorithms for automatic level generation
6. ** @level_generation_tech_stack.md **: Contains level generation specific Node.js packages
7. ** @available_tiles.md **: Contains the list of available tiles
7. ** @task_template.md ** : Tasks are expected to follow this format


# 🛠️ What You Must Do

For each functional gap listed above:

1. Analyze current implementation and documentation to **identify the minimal set of changes** needed.
2. Create a **modular and incremental execution plan**.
3. Break each issue into a **series of tiny, testable tasks**, following these rules:
   - One concern per task
   - Clear start and end
   - Tasks must be independently verifiable
   - Use the format defined in `@task_template.md`

4. Place the generated tasks in a file within the folder: `tasks/04_algorithmic_levels.md`

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

