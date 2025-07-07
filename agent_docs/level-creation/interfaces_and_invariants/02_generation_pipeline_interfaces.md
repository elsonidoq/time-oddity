
## 2. Generation Pipeline Interfaces

### 2.1 GridSeeder Interface

**File**: `src/generation/GridSeeder.js`

**Purpose**: Implements initial grid seeding algorithm for cellular automata processing.

**Constructor**:
```javascript
constructor()
```

**Public Methods**:
```javascript
validateConfig(config: Object): void
seedGrid(config: Object, rng: RandomGenerator): ndarray
getWallRatio(grid: ndarray): number
toAsciiArt(grid: ndarray): string
```

**Configuration Interface**:
```javascript
{
  width: number,           // Grid width (positive)
  height: number,          // Grid height (positive)
  initialWallRatio: number // Wall ratio [0.0, 1.0]
}
```

**Invariants**:
- **SEED-1**: Same config + seed produces identical grid
- **SEED-2**: Wall ratio is within specified bounds
- **SEED-3**: Grid dimensions match config exactly
- **SEED-4**: All tiles are either 0 (floor) or 1 (wall)

**Error Conditions**:
- Missing required config parameters
- Invalid dimensions (non-positive)
- Invalid wall ratio (outside [0, 1])
- Invalid RNG instance

### 2.2 CellularAutomata Interface

**File**: `src/generation/CellularAutomata.js`

**Purpose**: Implements cellular automata simulation for cave formation.

**Constructor**:
```javascript
constructor()
```

**Public Methods**:
```javascript
validateConfig(config: Object): void
countNeighbors(grid: ndarray, x: number, y: number): number
applyRules(grid: ndarray, x: number, y: number, birthThreshold: number, survivalThreshold: number): number
simulate(grid: ndarray, config: Object, progressCallback?: Function): ndarray
simulateWithSmoothing(grid: ndarray, config: Object, progressCallback?: Function): ndarray
microSmooth(grid: ndarray, passes?: number): ndarray
toAsciiArt(grid: ndarray): string
```

**Configuration Interface**:
```javascript
{
  simulationSteps: number,     // Iteration count [0, ∞)
  birthThreshold: number,      // Birth rule [0, 8]
  survivalThreshold: number,   // Survival rule [0, 8]
  smoothingPasses?: number     // Optional smoothing [0, ∞)
}
```

**Invariants**:
- **CA-1**: Double-buffering prevents race conditions
- **CA-2**: Neighbor counting handles boundaries correctly
- **CA-3**: Rules are applied consistently across grid
- **CA-4**: Progress callback called for each iteration
- **CA-5**: Smoothing preserves cave structure integrity

**Error Conditions**:
- Invalid config parameters
- Invalid grid dimensions
- Invalid neighbor coordinates
- Invalid threshold values

---
