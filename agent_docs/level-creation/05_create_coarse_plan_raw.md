# 🎯 Objective

You are a **technical leader LLM**. Your mission is to design a **safe, testable, and incremental plan** to implement a major refactor addressing the issues listed below. These changes are necessary to reach MVP. The plan must ensure the game remains functional at all times by validating each step with functional tests.

# Product requirements

We want to build a level generation algorithm for cave like biomas. In these levels there will be enemies, coins and a goal position that the player must reach in order to finish the game.

## Overall algorithm structure

1. **Cave Generation**  
   - Generate base layout with cellular automata → flood-fill and connect regions → smooth edges  
   - The file @cave_generation.py contains a python working code that must be used as specification. Each pixel represents a tile 
   - *Pitfall*: Running CA or smoothing too much can collapse meaningful structures–limit iteration counts

2. **Player Start & Goal Placement**  
   - Select start and goal in distinct, reachable regions  
   - *Best Practice*: Validate reachability with BFS/A* before placement to avoid unreachable goals

3. **Initial Coin Distribution**  
   - Scatter coins evenly on reachable floor areas  
   - *Pitfall*: Over-dispersing leads to “quiet” zones. Use density thresholds to avoid sparse placement

4. **Reachability-Based Platform Placement**  
   - Analyze reachability constraints (e.g., jump height) from start to coins/goal  
   - Insert platforms only where needed to restore access  
   - *Best Practice*: Generate only necessary platforms—excess leads to visual clutter

5. **Decorative Coin Clusters on Platforms**  
   - Optionally add a few extra coins to platform surfaces  
   - Helps add reward for using the platforms

6. **Enemy and Obstacle Placement**  
   - Place enemies near high-reward areas and chokepoints  
   - *Best Practice*: Tune enemy density based on difficulty to avoid overwhelming or trivial paths

7. **Validation & Iteration**  
   - Verify all coins and goal are reachable after platform/enemy placement  
   - Adjust or regenerate, avoid “procedural oatmeal” (repetitive empty zones)

8. **Thematic Decoration & Biome Tagging**  
   - Tag distinct areas (e.g., cavern, corridor) for contextual decorations  
   - Helps break visual monotony and support designers

9. **Export & Integration**  
   - Package the final map (tiles, objects, metadata) in JSON or engine-specific format  
   - Include metadata for coins, platforms, enemies, difficulty level


## Functional requirements

1. Player spawns over the floor
2. Goal is reachable from player spawn position
3. All coins are collectible
4. All coins and the goal are not placed inside another colliding block (ground, floating platform, moving platforms)
5. Floating and moving platforms are used to make sure the game is playable
6. Tiles are coherently used maintaining a visual consistency in the game
7. Tiles are correctly used so that edges and corners. 
   - Edges use tiles with _left or _right suffix
   - Corners use tiles with _bottom_left, _bottom_right, _top_left or top_right suffix
   - Center tiles use _center suffix
8. All decorative tiles are properly over the ground (no floating decorative tiles)

# 📚 Mandatory Reading Before Planning

Before writing any tasks, you MUST study these documents:

1. **@01_blueprint.md ** - This file contains a comprehensive technical blueprint for implementing a parametric procedural cave generation system in Node.js, including a detailed 9-step pipeline architecture, technology stack documentation (ndarray, seedrandom, flood-fill, pathfinding), and JSON output formatting specifications for generating game levels.
2. **@testing_best_practices.md ** - Defines TDD/BDD methodologies, testing strategies, and LLM-assisted development workflows  
3. ** @level-format.md  **: Contains documentation of the structure that a JSON describing a level must have 
4. ** @available_tiles.md **: Contains the list of available tiles
5. ** @task_template.md ** : Tasks are expected to follow this format


# 🛠️ What You Must Do

For each functional gap listed above:
1. Break down the product requirements into a list of **modular and incremental list of functional tasks**. The tasks must follow the template described in @coarse_task_template.md
2. Review those tasks, the documentation and make sure those steps actually solves the product requirements. You can ask for user input for additional context to complete this step.
3. Write that plan into `agent_docs/level-creation/06_coarse_plan.md`

# ✅ Task Execution Rules

The plan must be at a very early stage be user verifiable, and continue being user verifiable after every task. 
That means you have to plan in a way the user can either load a JSON in the game or see, if it is too early in the development, the user has to see evidence after each task

# 🧠 Before You Begin

Do NOT generate the plan until you:

- Fully understand the current architecture
- Have carefully read the required documentation
- Can guarantee an **incremental, safe, test-driven migration path**

Only then, begin generating the task plan.

