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

**Purpose**: Implements player spawn placement with safety validation.

**Constructor**:
```javascript
constructor(config?: Object)
```

**Configuration Interface**:
```javascript
{
  maxAttempts?: number,     // Maximum placement attempts
  safetyRadius?: number      // Safety radius for landing zone
}
```

**Public Methods**:
```javascript
validateConfig(config: Object): void
isWallTile(grid: ndarray, x: number, y: number): boolean
hasSafeLandingZone(grid: ndarray, x: number, y: number, safetyRadius: number): boolean
isValidSpawnPosition(grid: ndarray, x: number, y: number): boolean
findValidSpawnPositions(grid: ndarray): Array<{x: number, y: number}>
placeSpawn(grid: ndarray, rng: RandomGenerator): {success: boolean, position?: {x: number, y: number}, error?: string}
placeSpawnWithConfig(grid: ndarray, rng: RandomGenerator, config: Object): {success: boolean, position?: {x: number, y: number}, error?: string}
getSpawnStatistics(grid: ndarray): Object
```

**Invariants**:
- **SPAWN-1**: Player always spawns on a floor tile (value 0)
- **SPAWN-2**: There must be a wall tile (value 1) directly below the spawn (x, y+1)
- **SPAWN-3**: Safe landing zones prevent impossible spawns
- **SPAWN-4**: Multiple attempts handle edge cases
- **SPAWN-5**: Spawn positions are reachable
- **SPAWN-6**: This placement rule is a non-negotiable architectural invariant per functional requirements

**Error Conditions**:
- No valid spawn positions
- Invalid grid input
- Invalid RNG instance
- Configuration errors

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
  visibilityRadius?: number  // Visibility radius for goal validation (default: 3)
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

**Error Conditions**:
- Invalid configuration parameters (non-positive values)
- Null or undefined grid or player spawn
- Out-of-bounds coordinates
- No valid goal positions found

---
