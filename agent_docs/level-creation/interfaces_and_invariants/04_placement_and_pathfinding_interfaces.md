## 4. Placement and Pathfinding Interfaces

### 4.1 PathfindingIntegration Interface

**File**: `src/pathfinding/PathfindingIntegration.js`

**Purpose**: Provides A* pathfinding integration with ndarray grids.

**Constructor**:
```javascript
constructor(config?: Object)
```

**Configuration Interface**:
```javascript
{
  allowDiagonal?: boolean,      // Allow diagonal movement
  dontCrossCorners?: boolean    // Don't allow cutting corners
}
```

**Public Methods**:
```javascript
convertNdarrayToPathfindingGrid(grid: ndarray): PF.Grid
findPath(grid: ndarray, start: {x: number, y: number}, end: {x: number, y: number}): Array<Array<number>>
isReachable(grid: ndarray, start: {x: number, y: number}, end: {x: number, y: number}): boolean
validatePath(grid: ndarray, path: Array<Array<number>>, start: {x: number, y: number}, end: {x: number, y: number}): boolean
```

**Invariants**:
- **PATH-1**: Grid conversion preserves walkability
- **PATH-2**: Paths are optimal (shortest distance)
- **PATH-3**: Grid cloning prevents state mutation
- **PATH-4**: Path validation ensures correctness
- **PATH-5**: Reachability testing is accurate

**Error Conditions**:
- Invalid coordinates
- Grid conversion failures
- Pathfinding algorithm failures
- Memory allocation failures

### 4.2 PlayerSpawnPlacer Interface

**File**: `src/placement/PlayerSpawnPlacer.js`

**Purpose**: Implements player spawn placement with safety validation and left-side constraint.

**Constructor**:
```javascript
constructor(config?: Object)
```

**Configuration Interface**:
```javascript
{
  maxAttempts?: number,         // Maximum placement attempts
  safetyRadius?: number,         // Safety radius for landing zone
  leftSideBoundary?: number      // Left-side boundary as fraction of grid width (0.0-1.0)
}
```

**Public Methods**:
```javascript
validateConfig(config: Object): void
isWallTile(grid: ndarray, x: number, y: number): boolean
hasSafeLandingZone(grid: ndarray, x: number, y: number, safetyRadius: number): boolean
isValidSpawnPosition(grid: ndarray, x: number, y: number): boolean
findValidSpawnPositions(grid: ndarray): Array<{x: number, y: number}>
placeSpawn(grid: ndarray, rng: RandomGenerator): {success: boolean, position?: {x: number, y: number}, error?: string, fallbackUsed?: boolean, warning?: string}
placeSpawnWithConfig(grid: ndarray, rng: RandomGenerator, config: Object): {success: boolean, position?: {x: number, y: number}, error?: string, fallbackUsed?: boolean, warning?: string}
getSpawnStatistics(grid: ndarray): Object
```

**Invariants**:
- **SPAWN-1**: Player always spawns on a floor tile (value 0)
- **SPAWN-2**: There must be a wall tile (value 1) directly below the spawn (x, y+1)
- **SPAWN-3**: Safe landing zones prevent impossible spawns
- **SPAWN-4**: Multiple attempts handle edge cases
- **SPAWN-5**: Spawn positions are reachable
- **SPAWN-6**: This placement rule is a non-negotiable architectural invariant per functional requirements
- **SPAWN-7**: Player spawn is constrained to left side of map by default (leftSideBoundary: 0.25)
- **SPAWN-8**: Fallback mechanism ensures spawn placement even when left-side constraint fails

**Error Conditions**:
- No valid spawn positions
- Invalid grid input
- Invalid RNG instance
- Configuration errors
- Invalid leftSideBoundary values (must be between 0 and 1)

### 4.3 GoalPlacer Interface

**File**: `src/placement/GoalPlacer.js`

**Purpose**: Implements goal placement with comprehensive reachability validation, distance constraints, and placement optimization.

**Constructor**:
```javascript
constructor(config?: Object)
```

**Configuration Interface**:
```javascript
{
  minDistance?: number,      // Minimum distance from player spawn (default: 10)
  maxAttempts?: number,      // Maximum placement attempts (default: 100)
  visibilityRadius?: number, // Visibility radius for goal validation (default: 3)
  rightSideBoundary?: number // Right-side boundary as fraction of grid width (0.0-1.0, default: undefined; if set, goal is placed in rightmost fraction)
}
```

**Public Methods**:
```javascript
validateConfig(config: Object): void
calculateDistance(point1: {x: number, y: number}, point2: {x: number, y: number}): number
isValidGoalPosition(grid: ndarray, position: {x: number, y: number}, playerSpawn: {x: number, y: number}): boolean
isCurrentlyUnreachable(grid: ndarray, playerSpawn: {x: number, y: number}, goal: {x: number, y: number}): boolean
findValidGoalPositions(grid: ndarray, playerSpawn: {x: number, y: number}): Array<{x: number, y: number}>
optimizeGoalPlacement(validPositions: Array<{x: number, y: number}>, playerSpawn: {x: number, y: number}): {x: number, y: number} | null
validateGoalVisibility(grid: ndarray, goal: {x: number, y: number}): boolean
placeGoal(grid: ndarray, playerSpawn: {x: number, y: number}, rng: RandomGenerator): {success: boolean, position: {x: number, y: number} | null, ...}
placeGoalWithConfig(grid: ndarray, playerSpawn: {x: number, y: number}, rng: RandomGenerator, config: Object): {success: boolean, position: {x: number, y: number} | null, ...}
getGoalStatistics(grid: ndarray, playerSpawn: {x: number, y: number}): Object
```

**Invariants**:
- **GOAL-1**: Goal placement ensures minimum distance from player spawn
- **GOAL-2**: Goal is always placed on a floor tile (value 0)
- **GOAL-3**: There must be a wall tile (value 1) directly below the goal (x, y+1)
- **GOAL-4**: Goal placement verifies current unreachability (expected until platform placement)
- **GOAL-5**: Goal placement optimizes for challenging but fair positioning
- **GOAL-6**: Goal placement validates goal visibility and accessibility
- **GOAL-7**: This placement rule is a non-negotiable architectural invariant per functional requirements
- **GOAL-8**: If rightSideBoundary is set, goal is always placed in the rightmost fraction of the map (e.g., right 25% if rightSideBoundary: 0.75)

**Error Conditions**:
- Invalid configuration parameters (non-positive values)
- Null or undefined grid or player spawn
- Out-of-bounds coordinates
- No valid goal positions found

### 4.4 Platform Placement System (PLANNED)

**Purpose**: Platform placement system that uses PhysicsAwareReachabilityAnalyzer to determine optimal platform locations for coin accessibility.

**CRITICAL DEPENDENCY**: Platform placement MUST use `PhysicsAwareReachabilityAnalyzer.detectReachablePositionsFromStartingPoint()` to determine where platforms are needed.

**Platform Placement Workflow**:
1. **Coin Placement First**: Place all coins in strategic locations (dead-ends, exploration areas)
2. **Reachability Analysis**: Use `detectReachablePositionsFromStartingPoint(playerSpawn, null)` to find ALL reachable areas
3. **Unreachable Coin Identification**: Compare coin positions with reachable areas to identify unreachable coins
4. **Platform Placement**: Place floating/moving platforms to bridge gaps to unreachable coins
5. **Final Validation**: Verify all coins are now reachable after platform placement

**Required Methods** (to be implemented):
```javascript
// Coin Distribution
placeCoinsInStrategicLocations(grid: ndarray, playerSpawn: {x: number, y: number}, coinCount: number): Array<{x: number, y: number}>

// Platform Placement
placeFloatingPlatforms(grid: ndarray, unreachableCoins: Array<{x: number, y: number}>, playerSpawn: {x: number, y: number}): Array<PlatformObject>
placeMovingPlatforms(grid: ndarray, remainingUnreachableCoins: Array<{x: number, y: number}>, playerSpawn: {x: number, y: number}): Array<PlatformObject>

// Validation
validateAllCoinsReachable(grid: ndarray, coins: Array<{x: number, y: number}>, playerSpawn: {x: number, y: number}): boolean
```

**Invariants**:
- **PLATFORM-1**: Coins must be placed BEFORE platforms
- **PLATFORM-2**: Platform placement MUST use reachability analysis to determine necessity
- **PLATFORM-3**: All coins must be reachable after platform placement
- **PLATFORM-4**: Goal must be reachable after platform placement
- **PLATFORM-5**: Platform placement must minimize visual impact while ensuring accessibility

**Error Conditions**:
- No valid platform positions found for unreachable coins
- Platform placement fails to make all coins reachable
- Goal remains unreachable after platform placement

## StrategicEnemyPlacer Interface (UPDATED)

### Overview
The `StrategicEnemyPlacer` is responsible for placing enemies in the level in a way that is both challenging and guarantees level solvability. It uses a combination of strategic analysis and spatial distribution to ensure fair and interesting enemy placement.

### Key Methods

- `placeEnemies(grid, playerPos, coins, goalPos, platforms, rng)`
  - **Description:** Places enemies using a two-step process:
    1. **Priority Sorting:** Candidates are first sorted by strategic type (chokePoint > strategic > patrol > platform).
    2. **Zone-Based Distribution:** After sorting, candidates are partitioned into three spatial zones (left, middle, right) based on their x-position relative to the level width. Enemies are then selected in a round-robin fashion from these zones, ensuring even coverage across the level. This replaces the previous approach, which sorted by distance from the player and could lead to clustering on one side.
    3. **Solvability and Distance Constraints:** Each candidate is checked for minimum distance from spawn/goal and for not breaking level solvability.
  - **Guarantees:**
    - Enemies are distributed across the entire level, not clustered on one side.
    - All placements respect minimum distance and solvability constraints.

- `sortCandidatesByPriority(candidates, playerPos, goalPos)`
  - **Description:** Sorts candidates by type priority, then by spatial zone (not by distance from player).

- `getLevelPosition(candidate, playerPos, goalPos)`
  - **Description:** Computes the candidate's zone for distribution (0 = left, 1 = middle, 2 = right).

### Invariants
- Enemy placement must never make the level unsolvable.
- Enemy distribution must be spatially even (across left, middle, right zones) for fairness and challenge.

### Implementation Notes
- The round-robin, zone-based selection is robust to candidate list order and guarantees coverage even if the candidate generator is biased.
- The number of enemies is capped by both density and maxEnemies config.

---
