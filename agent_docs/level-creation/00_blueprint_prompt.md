# Role  
Expert game developer

# Context

You’ve developed a game with parameterizable levels and aim to implement an advanced level generation algorithm for cave-like biomes. These levels should include enemies, coins, and a goal that the player must reach to complete the level.

## Overall Algorithm Structure

1. **Cave Generation**  
   - Generate the initial layout using cellular automata → apply flood-fill to identify disconnected regions → connect them and smooth edges  
   - *Pitfall*: Overuse of CA iterations or excessive smoothing may destroy meaningful structures—set strict iteration limits.

2. **Player Start & Goal Placement**  
   - Choose distinct, reachable regions for the player spawn and goal.  
   - *Best Practice*: Use BFS or A* to confirm bidirectional reachability before finalizing positions to ensure the level is completable.

3. **Initial Coin Distribution**  
   - Evenly distribute coins across reachable floor tiles.  
   - *Pitfall*: Over-dispersal can create inactive or unrewarding zones. Use density thresholds to maintain gameplay engagement.

4. **Reachability-Based Platform Placement**  
   - Evaluate platform needs based on reachability constraints (e.g., max jump height, movement mechanics).  
   - Insert only essential platforms to enable traversal.  
   - *Best Practice*: Minimize platform clutter; prioritize readability and purpose.

5. **Decorative Coin Clusters on Platforms**  
   - Optionally place additional coins atop platforms as reward incentives.  
   - Enhances engagement with newly placed navigational elements.

6. **Enemy and Obstacle Placement**  
   - Position enemies near reward hotspots (e.g., coin clusters, chokepoints).  
   - *Best Practice*: Balance difficulty by adjusting enemy density and positioning to preserve challenge without overwhelming the player.

7. **Validation & Iteration**  
   - Ensure the goal and all coins are reachable post-placement.  
   - Iterate or regenerate layout as needed. Avoid procedural monotony (“procedural oatmeal”) by ensuring diverse, meaningful content in each section.

8. **Thematic Decoration & Biome Tagging**  
   - Tag specific regions (e.g., caverns, vertical shafts) for contextual decoration.  
   - Helps diversify visuals and supports thematic consistency.

9. **Export & Integration**  
   - Output the finalized level in JSON or engine-compatible format.  
   - Include metadata (coin positions, enemy types, platform paths, difficulty rating).

### Cave generation algorithm

Use this python working implementation as the reference specification.
In this algorithm, each pixel corresponds to a tile.  

```python
ESTA PEGADO ACA cave_generation.py
```

## Functional Requirements

1. Player spawns must be placed directly above valid floor tiles.  
2. The goal must be reachable from the player spawn.  
3. All coins must be collectible.  
4. Neither coins nor goals may be embedded inside collidable tiles (e.g., ground, platforms).  
5. Floating and moving platforms must ensure full level navigability.  
6. Tile usage must be visually coherent and context-appropriate.  
7. Tiles must be placed accurately:
   - Use `_left` or `_right` suffixes for edge tiles  
   - Use `_bottom_left`, `_bottom_right`, `_top_left`, or `_top_right` for corners  
   - Use `_center` for interior tiles  
8. Decorative tiles must be grounded—no floating decorations.  
9. The algorithm must be extensible to support new enemy types or tile sets.

ESTA PEGADO ACA ABAJO #level-format.md 


# Task

- Conduct an in-depth analysis to identify the most suitable Node.js packages for implementing the described algorithm.
- For each selected package, provide detailed documentation to guide an LLM engineer through the design, planning, and implementation process.
- Specify the exact version number for each package to eliminate version mismatch risks.
- Ensure that the algorithm’s output matches the format described in `level_format.md`.

# Expected Output

A detailed report organized into the following sections:

## Technology Stack  
List of all recommended Node.js packages with:
- Package name  
- Purpose and role within the level generation algorithm  
- Exact version to be used  

## Comprehensive Documentation  
For each package listed above, provide:
- Detailed functional overview and rationale for use  
- Design best practices specific to the package  
- Testing best practices for reliability and validation  
- Code snippets illustrating effective usage patterns  
- Notes on integration with the overall level generation algorithm