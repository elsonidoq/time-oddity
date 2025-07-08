## 3. Analysis and Validation Interfaces

### 3.1 RegionDetector Interface

**File**: `src/analysis/RegionDetector.js`

**Purpose**: Implements flood-fill region detection for cave analysis.

**Static Methods**:
```javascript
detectRegions(grid: ndarray): {labelGrid: ndarray, regionData: Object}
toAsciiArt(labelGrid: ndarray): string
```

**Return Interface**:
```javascript
{
  labelGrid: ndarray,           // Grid with region labels
  regionData: {                 // Region metadata
    [label: number]: {
      area: number,
      bounds: {lo: Array, hi: Array}
    }
  }
}
```

**Invariants**:
- **REGION-1**: All floor tiles are labeled (0 = unlabeled floor)
- **REGION-2**: Wall tiles remain value 1
- **REGION-3**: Region labels start from 2
- **REGION-4**: Connected regions share same label
- **REGION-5**: Region data contains accurate metadata

**Error Conditions**:
- Invalid grid input
- Memory allocation failures
- Flood-fill algorithm failures

### 3.2 CorridorCarver Interface

**File**: `src/analysis/CorridorCarver.js`

**Purpose**: Implements corridor carving to connect disconnected regions.

**Constructor**:
```javascript
constructor(config?: Object)
```

**Public Methods**:
```javascript
carveCorridors(grid: ndarray, regionData: Object, config?: Object): ndarray
findOptimalPath(start: {x: number, y: number}, end: {x: number, y: number}, grid: ndarray): Array<{x: number, y: number}>
validateConnections(grid: ndarray, regionData: Object): boolean
```

**Configuration Interface**:
```javascript
{
  maxCorridorWidth?: number,    // Maximum corridor width
  pathfindingAlgorithm?: string, // Pathfinding method
  visualImpactWeight?: number   // Visual impact consideration
}
```

**Invariants**:
- **CORRIDOR-1**: Corridors connect all major regions
- **CORRIDOR-2**: Corridor width is within bounds
- **CORRIDOR-3**: Paths are optimal (shortest distance)
- **CORRIDOR-4**: Visual impact is minimized
- **CORRIDOR-5**: Original cave structure is preserved

**Error Conditions**:
- No valid path between regions
- Invalid region data
- Pathfinding algorithm failures

### 3.3 ParameterValidator Interface

**File**: `src/validation/ParameterValidator.js`

**Purpose**: Validates all input parameters against the Python specification.

**Constructor**:
```javascript
constructor()
```

**Public Methods**:
```javascript
validateSeed(seed: any): void
validateWidth(width: any): void
validateHeight(height: any): void
validateInitialWallRatio(ratio: any): void
validateSimulationSteps(steps: any): void
validateBirthThreshold(threshold: any): void
validateSurvivalThreshold(threshold: any): void
validateMinRoomSize(size: any): void
validateMinStartGoalDistance(distance: any): void
validateCoinCount(count: any): void
validateEnemyCount(count: any): void
validateAll(config: Object): void
getDefaultConfig(): Object
validateAndMergeDefaults(config: Object): Object
```

**Validation Rules**:
```javascript
{
  seed: { type: 'string', required: true },
  width: { type: 'number', min: 50, max: 200, required: true },
  height: { type: 'number', min: 30, max: 120, required: true },
  initialWallRatio: { type: 'number', min: 0.4, max: 0.55, required: true },
  simulationSteps: { type: 'number', min: 3, max: 6, required: true },
  birthThreshold: { type: 'number', min: 4, max: 6, required: true },
  survivalThreshold: { type: 'number', min: 2, max: 4, required: true },
  minRoomSize: { type: 'number', min: 20, max: 100, required: true },
  minStartGoalDistance: { type: 'number', min: 30, max: 100, required: true },
  coinCount: { type: 'number', min: 10, max: 30, required: true },
  enemyCount: { type: 'number', min: 3, max: 10, required: true }
}
```

**Invariants**:
- **PARAM-1**: All parameters are validated before use
- **PARAM-2**: Error messages are clear and actionable
- **PARAM-3**: Default values are safe and reasonable
- **PARAM-4**: Validation is consistent across all methods

**Error Conditions**:
- Invalid parameter types
- Parameter values outside valid ranges
- Missing required parameters

### 3.4 CaveQualityValidator Interface

**File**: `src/validation/CaveQualityValidator.js`

**Purpose**: Implements comprehensive cave quality validation.

**Constructor**:
```javascript
constructor(thresholds?: Object)
```

**Public Methods**:
```javascript
getThresholds(): Object
validateThresholds(thresholds: Object): void
calculateFloorRatio(grid: ndarray): number
countConnectedFloorTiles(grid: ndarray): number
floodFill(grid: ndarray, startX: number, startY: number, visited: Set, targetValue?: number): number
countIsolatedRegions(grid: ndarray): number
calculateAverageRegionSize(grid: ndarray): number
countWallIslands(grid: ndarray): number
calculateQualityMetrics(grid: ndarray): Object
calculateQualityScore(grid: ndarray): number
validateCave(grid: ndarray): {valid: boolean, issues: Array<string>}
getPerformanceStats(): Object
generateQualityReport(grid: ndarray): string
generateAsciiVisualization(grid: ndarray): string
```

**Quality Metrics Interface**:
```javascript
{
  floorRatio: number,
  connectedFloorTiles: number,
  isolatedRegions: number,
  averageRegionSize: number,
  wallIslands: number,
  qualityScore: number
}
```

**Invariants**:
- **QUALITY-1**: Quality metrics are consistent and repeatable
- **QUALITY-2**: Validation prevents poor cave generation
- **QUALITY-3**: Performance stats track validation efficiency
- **QUALITY-4**: Reports provide actionable feedback

**Error Conditions**:
- Invalid grid input
- Memory allocation failures
- Algorithm failures

### 3.5 ConnectivityValidator Interface

**File**: `src/validation/ConnectivityValidator.js`

**Purpose**: Implements connectivity validation with fallback mechanisms.

**Constructor**:
```javascript
constructor(config?: Object)
```

**Public Methods**:
```javascript
validateConnectivity(grid: ndarray, startPos: {x: number, y: number}, goalPos: {x: number, y: number}): {connected: boolean, path?: Array}
findDisconnectedRegions(grid: ndarray): Array<Object>
attemptConnection(grid: ndarray, regionA: Object, regionB: Object): {success: boolean, path?: Array}
validateAllConnections(grid: ndarray, regions: Array<Object>): {valid: boolean, issues: Array<string>}
generateFallbackConnections(grid: ndarray, disconnectedRegions: Array<Object>): ndarray
```

**Invariants**:
- **CONNECT-1**: All major regions are connected
- **CONNECT-2**: Fallback mechanisms handle failures
- **CONNECT-3**: Connection attempts are optimized
- **CONNECT-4**: Validation prevents unsolvable levels

**Error Conditions**:
- No valid connections possible
- Pathfinding algorithm failures
- Memory allocation failures

### 3.6 SolvabilityTester Interface

**File**: `src/validation/SolvabilityTester.js`

**Purpose**: Implements comprehensive solvability testing with multiple verification methods and fallback mechanisms.

**Constructor**:
```javascript
constructor(config?: Object)
```

**Configuration Interface**:
```javascript
{
  maxPathfindingAttempts?: number,    // Maximum attempts per method
  fallbackMethods?: Array<string>,    // Array of fallback method names
  performanceThreshold?: number,       // Performance threshold in milliseconds
  enableDetailedReporting?: boolean   // Enable detailed reporting
}
```

**Public Methods**:
```javascript
validateSolvability(grid: ndarray, startPos: {x: number, y: number}, goalPos: {x: number, y: number}): Object
```

**Return Interface**:
```javascript
{
  valid: boolean,                     // Whether level is solvable
  path: Array<Array<number>>,        // Path from start to goal
  verificationMethods: Array<string>, // Methods used for verification
  fallbackUsed: boolean,             // Whether fallback methods were used
  fallbackAttempts: number,          // Number of fallback attempts
  pathValidated: boolean,            // Whether path was validated
  pathAnalysis: Object,              // Path analysis results
  performanceStats: Object,          // Performance statistics
  issues: Array<string>,             // Issues found during validation
  report: Object,                    // Detailed validation report
  errorHandled: boolean,             // Whether errors were handled
  allMethodsFailed: boolean          // Whether all methods failed
}
```

**Path Analysis Interface**:
```javascript
{
  pathLength: number,                // Number of steps in path
  distance: number,                  // Euclidean distance
  complexity: number,                // Path complexity score
  directionChanges: number,          // Number of direction changes
  efficiency: number                 // Path efficiency score
}
```

**Performance Statistics Interface**:
```javascript
{
  executionTime: number,             // Total execution time
  methodsUsed: Array<string>,        // Methods that were used
  memoryUsage: number,               // Memory usage in bytes
  methodTimings: Object,             // Timing for each method
  performanceWarning?: string        // Performance warning if applicable
}
```

**Detailed Report Interface**:
```javascript
{
  summary: {                         // Summary information
    valid: boolean,
    methodsUsed: Array<string>,
    fallbackUsed: boolean,
    pathLength: number
  },
  details: {                         // Detailed information
    gridSize: string,
    startPosition: Object,
    goalPosition: Object,
    pathAnalysis: Object
  },
  issues: Array<string>,             // Issues found
  recommendations: Array<string>,    // Recommendations
  performance: {                     // Performance information
    insights: Object
  }
}
```

**Fallback Methods**:
- `bfs`: Breadth-First Search
- `dfs`: Depth-First Search  
- `dijkstra`: Dijkstra's Algorithm

**Invariants**:
- **SOLVABILITY-1**: Multiple verification methods ensure robust testing
- **SOLVABILITY-2**: Fallback mechanisms handle primary method failures
- **SOLVABILITY-3**: Performance monitoring tracks testing efficiency
- **SOLVABILITY-4**: Detailed reporting provides actionable feedback
- **SOLVABILITY-5**: Error handling prevents system crashes
- **SOLVABILITY-6**: Path analysis validates solution quality
- **SOLVABILITY-7**: All methods use consistent coordinate validation

**Error Conditions**:
- Invalid grid input
- Invalid coordinate positions
- Pathfinding algorithm failures
- Memory allocation failures
- Performance threshold exceeded

### 3.7 PhysicsAwareReachabilityAnalyzer Interface

**File**: `src/analysis/PhysicsAwareReachabilityAnalyzer.js`

**Purpose**: Implements physics-aware reachability analysis with jump constraints, unreachable area detection, and platform placement planning. This system is CRITICAL for platform placement decisions and MUST be used to determine where platforms are needed.

**Constructor**:
```javascript
constructor(config?: Object)
```

**Configuration Interface**:
```javascript
{
  jumpHeight?: number,    // Player jump height in pixels (default: 800)
  gravity?: number        // Gravity in pixels/s² (default: 980)
}
```

**Public Methods**:
```javascript
calculateJumpDistance(): number
isReachableByJump(start: {x: number, y: number}, end: {x: number, y: number}, grid?: ndarray): boolean
detectUnreachableAreas(grid: ndarray): Array<{x: number, y: number}>
planPlatformPlacement(grid: ndarray, unreachableAreas: Array<{x: number, y: number}>): Array<Object>
validatePlatformPlacement(grid: ndarray, platform: Object): boolean
analyzeReachability(grid: ndarray): Object
detectReachablePositionsFromStartingPoint(grid: ndarray, playerPosition: {x: number, y: number}, maxMoves?: number): Array<{x: number, y: number}>
```

**CRITICAL METHOD: detectReachablePositionsFromStartingPoint**

This method is the PRIMARY tool for platform placement decisions. It analyzes all positions reachable from a starting point considering physics constraints.

**Parameters**:
- `grid: ndarray` - The cave grid to analyze
- `playerPosition: {x: number, y: number}` - Starting position for reachability analysis
- `maxMoves?: number` - Optional maximum moves to limit exploration (null = unlimited exploration)

**Return Value**:
```javascript
Array<{x: number, y: number}>  // All reachable positions from starting point
```

**Behavior**:
- When `maxMoves` is `null`: Explores ALL reachable positions without move count limits
- When `maxMoves` is a number: Limits exploration to positions reachable within that many moves
- Uses BFS with physics constraints (jump distance, gravity, solid ground requirements)
- Simulates falling after each move to find final landing positions
- Tracks visited positions to avoid infinite loops

**Platform Placement Usage**:
- MUST be called with `maxMoves = null` to find ALL unreachable areas
- Compare result with coin positions to identify coins that need platform access
- Use unreachable coin positions to determine optimal platform placement locations

**CRITICAL COORDINATE SYSTEM NOTES**:
- Grid coordinates use (x, y) where x is horizontal (columns) and y is vertical (rows)
- Grid is stored as ndarray with shape [width, height] where width = columns, height = rows
- IMPORTANT: When visualizing grids, they may appear transposed - verify coordinate interpretation
- Dead-end detection must check for floor tiles (value 0) with walls (value 1) on multiple sides
- Wall tiles (value 1) are NOT dead-ends - only floor tiles (value 0) can be dead-ends

**Platform Placement Interface**:
```javascript
{
  x: number,              // Platform x coordinate
  y: number,              // Platform y coordinate
  width: number,          // Platform width in tiles
  height: number,         // Platform height in tiles
  type: string,           // Platform type ('floating', 'moving')
  bridging: boolean,      // Whether platform bridges unreachable areas
  blocking: boolean       // Whether platform blocks movement
}
```

**Reachability Analysis Interface**:
```javascript
{
  reachableTiles: Array<{x: number, y: number}>,    // All reachable tiles
  unreachableAreas: Array<{x: number, y: number}>,  // Unreachable area coordinates
  platformSuggestions: Array<Object>,                // Platform placement suggestions
  jumpConstraints: {                                 // Jump constraint information
    maxJumpDistance: number,
    maxJumpHeight: number,
    physicsParameters: Object
  },
  analysisStats: {                                   // Analysis statistics
    totalTiles: number,
    reachableCount: number,
    unreachableCount: number,
    platformCount: number
  }
}
```

**Physics Parameters Interface**:
```javascript
{
  jumpHeight: number,     // Player jump height in pixels
  gravity: number,        // Gravity in pixels/s²
  tileSize: number,       // Tile size in pixels (default: 64)
  maxJumpDistance: number, // Maximum horizontal jump distance
  maxJumpHeight: number   // Maximum vertical jump height
}
```

**Invariants**:
- **PHYSICS-1**: Jump constraints accurately model player movement capabilities
- **PHYSICS-2**: Unreachable area detection identifies all areas beyond jump capabilities
- **PHYSICS-3**: Platform placement suggestions restore accessibility
- **PHYSICS-4**: Physics parameters are validated and consistent
- **PHYSICS-5**: Coordinate validation prevents out-of-bounds access
- **PHYSICS-6**: Performance optimization handles large cave systems
- **PHYSICS-7**: Platform validation ensures physics compliance

**Error Conditions**:
- Invalid physics parameters (negative values)
- Invalid grid input
- Out-of-bounds coordinates
- Memory allocation failures
- Algorithm failures

**Performance Characteristics**:
- Time Complexity: O(n²) for unreachable area detection
- Space Complexity: O(n) for BFS traversal
- Optimization: Jump window limiting for large grids

### 3.8 ReachableFrontierAnalyzer Interface

**File**: `src/analysis/ReachableFrontierAnalyzer.js`

**Purpose**: Implements reachable frontier analysis to identify reachable tiles with neighboring non-reachable floor tiles, which are optimal locations for platform placement. This system is CRITICAL for determining where platforms should be placed to expand reachability.

**Constructor**:
```javascript
constructor(config?: Object)
```

**Configuration Interface**:
```javascript
{
  jumpHeight?: number,    // Player jump height in pixels (default: 800)
  gravity?: number        // Gravity in pixels/s² (default: 980)
}
```

**Public Methods**:
```javascript
findReachableFrontier(playerPosition: {x: number, y: number}, grid: ndarray): Array<{x: number, y: number}>
```

**CRITICAL METHOD: findReachableFrontier**

This method identifies frontier tiles - reachable tiles that have at least one neighboring non-reachable floor tile. These tiles represent optimal locations for platform placement to expand reachability.

**Parameters**:
- `playerPosition: {x: number, y: number}` - Player position for distance calculations
- `grid: ndarray` - The cave grid to analyze

**Return Value**:
```javascript
Array<{x: number, y: number}>  // Array of frontier tile positions
```

**Algorithm**:
1. Get all reachable tiles from player position using PhysicsAwareReachabilityAnalyzer
2. For each reachable tile:
   - Get all neighboring tiles (4-directional: up, down, left, right)
   - Check if any neighbor is a non-reachable floor tile (value 0)
   - If at least one neighbor is a non-reachable floor tile, tile is a frontier tile

**Frontier Detection Logic**:
- A tile is a frontier tile if it has at least one neighboring non-reachable floor tile
- Only considers 4-directional neighbors (up, down, left, right)
- Only floor tiles (value 0) are considered as potential non-reachable neighbors
- Wall tiles (value 1) are not considered as non-reachable neighbors
- Player position can be included in frontier results if it meets the criteria

**Platform Placement Usage**:
- Frontier tiles represent optimal locations for platform placement
- Placing platforms at frontier locations maximizes reachability expansion
- Used by CriticalRingAnalyzer to identify platform placement candidates
- Integrates with strategic platform placement algorithms

**Performance Characteristics**:
- Time Complexity: O(n) where n is number of reachable tiles
- Space Complexity: O(n) for reachable tiles set
- Optimization: Efficient neighbor lookup using Set data structure

**Invariants**:
- **FRONTIER-1**: Frontier tiles are always reachable from player position
- **FRONTIER-2**: Frontier tiles have at least one neighboring non-reachable floor tile
- **FRONTIER-3**: Player position can be included in frontier results if it meets the criteria
- **FRONTIER-4**: Only floor tiles (value 0) are considered as potential non-reachable neighbors
- **FRONTIER-5**: Only 4-directional neighbors are considered
- **FRONTIER-6**: Frontier analysis is deterministic for given inputs

**Error Conditions**:
- Invalid player position (null, missing coordinates)
- Invalid grid input (null, undefined)
- Physics analyzer errors (propagated from PhysicsAwareReachabilityAnalyzer)

**Integration Points**:
- Uses PhysicsAwareReachabilityAnalyzer for reachability detection
- Used by CriticalRingAnalyzer for platform placement optimization
- Integrates with strategic platform placement algorithms
- Supports time reversal compatibility through physics-aware analysis

---
