# 🎯 Objective

You are a **technical leader LLM**. Your responsibility is to create a **high-level, incremental implementation plan** to evolve the level generation system described below into a functional, testable MVP. This plan will be used by human engineers and LLMs to coordinate development work across systems.

# 📜 Scope

Your plan must address two dimensions:

1. **Product Requirements**  
   Define the logic, features, and visual consistency of procedurally generated cave-like levels with player, enemies, coins, and a goal.

2. **Functional Requirements**  
   Ensure technical correctness, playability, asset usage compliance, and step-by-step verifiability.

Each requirement must be fulfilled **incrementally**, with clear milestones that maintain system integrity and offer visual or testable outputs after each step.

# 📦 Provided Context

The level generator uses a 2D grid (1 px = 1 tile) and is initially implemented in `@cave_generation.py `. The goal is to extend it into a full-featured level builder with enemies, items, platforms, and correct tile semantics.

## Product Requirements

1. **Cave Generation Pipeline**  
   - Use cellular automata → region linking → smoothing
   - Code in `@cave_generation.py` serves as the specification

2. **Player Start and Goal Placement**  
   - Must be reachable (use BFS or A*)

3. **Initial Coin Distribution**  
   - Disperse coins across reachable floor areas with density control

4. **Reachability-Based Platform Placement**  
   - Dynamically insert floating platforms to restore lost access

5. **Decorative Coin Clusters**  
   - Add bonus coins to platform surfaces

6. **Enemy and Obstacle Placement**  
   - Place enemies near high-reward paths and chokepoints

7. **Validation Loop**  
   - Ensure all items/goals remain reachable

8. **Biome Decoration and Tagging**  
   - Tag regions (e.g. cavern, tunnel) to support theming

9. **Export and Integration**  
   - Output a level JSON with full metadata

## Functional Requirements

1. Player always spawns on ground  
2. Goal is reachable from player  
3. All coins are collectible  
4. No overlaps between coins/goals and solid tiles  
5. Platforms are used to ensure reachability  
6. Tile usage is visually coherent  
7. Correct use of `_center`, `_left`, `_right`, `_top_left`, etc. suffixes  
8. Decorative tiles do not float
8. Decorative tiles placed over a ground block

# 📚 Mandatory Reading Before Planning

You must study the following documents:

- `@01_blueprint.md `: Full architecture for procedural level generation
- `@testing_best_practices.md`: Guidelines for test-driven and LLM-assisted workflows
- `@level-format.md`: Format specification for generated levels
- `@available_tiles.md`: List of usable tiles and their visual constraints
- `@coarse_task_template.md `: Standard format for task definitions

# 🧠 Your Output

Once you fully understand the problem space:

1. Break down the full scope into a list of **coarse-grained, incremental tasks** that can be independently developed and verified.
2. Ensure each task:
   - Builds on previous work
   - Leaves the game functional and testable
   - Produces a verifiable output (visually or via test and providing the user with evidence)
3. Use the template defined in `@coarse_task_template.md `
4. Output the final task list into:  
   `agent_docs/level-creation/06_coarse_plan.md`

# ⚠️ Execution Rules

- Do **not** generate any tasks until you’ve parsed all provided documentation.
- Your plan must account for architectural dependencies and developer roles.
- It must be possible to **visually or functionally verify progress after each step**.
- Favor safety and testability above all.

Only begin planning when you have high confidence in the system’s current state and its evolution path.