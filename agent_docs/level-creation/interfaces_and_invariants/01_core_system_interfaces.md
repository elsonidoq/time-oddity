## 1. Core System Interfaces

### 1.1 RandomGenerator Interface

**File**: `src/core/RandomGenerator.js`

**Purpose**: Provides deterministic pseudo-random number generation for the cave generation system.

**Constructor**:
```javascript
constructor(seed: string|number)
```

**Public Methods**:
```javascript
random(): number                    // Returns random number [0, 1)
randomInt(min: number, max: number): number
randomFloat(min: number, max: number): number
randomChoice(choices: Array): any
randomWeightedChoice(choices: Array, weights: Array<number>): any
reset(): void                       // Resets to initial state
getState(): Object                  // Returns current state
```

**Invariants**:
- **RNG-1**: Same seed always produces identical sequence
- **RNG-2**: All random numbers are in specified ranges
- **RNG-3**: No global state pollution (isolated instances)
- **RNG-4**: Thread-safe and deterministic across platforms

**Error Conditions**:
- Invalid seed (null, undefined, empty string)
- Invalid ranges (min > max)
- Empty choice arrays
- Negative weights in weighted choice

### 1.2 GridUtilities Interface

**File**: `src/core/GridUtilities.js`

**Purpose**: Provides efficient 2D grid operations using ndarray with memory management.

**Static Methods**:
```javascript
createGrid(width: number, height: number, initialValue?: number): ndarray
pixelToGrid(pixelX: number, pixelY: number, tileSize?: number): {x: number, y: number}
gridToPixel(gridX: number, gridY: number, tileSize?: number): {x: number, y: number}
isValidCoordinate(x: number, y: number, grid: ndarray): boolean
getSafe(grid: ndarray, x: number, y: number): number|undefined
setSafe(grid: ndarray, x: number, y: number, value: number): boolean
copyGrid(grid: ndarray): ndarray
createView(grid: ndarray, startX: number, startY: number, endX: number, endY: number): ndarray
fillGrid(grid: ndarray, value: number): void
fillGridRegion(grid: ndarray, startX: number, startY: number, endX: number, endY: number, value: number): void
countValue(grid: ndarray, value: number): number
findValuePositions(grid: ndarray, value: number): Array<{x: number, y: number}>
getGridDimensions(grid: ndarray): {width: number, height: number}
isEmpty(grid: ndarray): boolean
getMemoryUsage(grid: ndarray): {dataSize: number, totalSize: number}
```

**Invariants**:
- **GRID-1**: All grids use Uint8Array for memory efficiency
- **GRID-2**: Coordinate conversions are reversible
- **GRID-3**: Safe operations never throw on out-of-bounds access
- **GRID-4**: Views share underlying data (no copying)
- **GRID-5**: Copy operations create independent grids

**Error Conditions**:
- Invalid dimensions (non-positive)
- Invalid tile size (non-positive)
- Null/undefined grid parameters
- Invalid region bounds

---