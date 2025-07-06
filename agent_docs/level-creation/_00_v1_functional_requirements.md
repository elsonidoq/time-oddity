# Objective

We want to build a level generation algorithm for cave like biomas. In these levels there will be enemies, coins and a goal position that the player must reach in order to finish the game.

# Overall algorithm structure

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


# Functional requirements

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