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

### 1.3 VisualizationUtils Interface

**File**: `src/core/VisualizationUtils.js`

**Purpose**: Provides global visualization utilities for ASCII art generation and debugging.

**Static Methods**:
```javascript
toAsciiArt(grid: ndarray, options?: Object): string
```

**Parameters**:
- `grid`: The grid to visualize (ndarray)
- `options`: Optional overlays object with properties:
  - `reachableTiles`: Array of {x, y} positions to mark as 'X'
  - `platforms`: Array of {x, y} positions to mark as 'l'
  - `coins`: Array of {x, y} positions to mark as 'C'
  - `enemies`: Array of {x, y} positions to mark as 'E'
  - `player`: {x, y} position to mark as 'P'
  - `goal`: {x, y} position to mark as 'G'

**Character Mapping**:
- `#`: Wall tiles (value = 1)
- `l`: Platform tiles (walls with platform overlay)
- `.`: Floor tiles (value = 0)
- `P`: Player position (highest priority)
- `G`: Goal position
- `E`: Enemy position
- `C`: Coin position
- `X`: Reachable tile (lowest priority)

**Invariants**:
- **VIZ-UTILS-1**: ASCII art accurately represents grid structure
- **VIZ-UTILS-2**: Overlay priority is consistent: P > G > E > C > l > X
- **VIZ-UTILS-3**: Platforms can be placed on walls, other overlays cannot
- **VIZ-UTILS-4**: Output is human-readable with proper line breaks
- **VIZ-UTILS-5**: Performance scales linearly with grid size

**Error Conditions**:
- Null/undefined grid input
- Overlay placement on wall tiles (except platforms)
- Invalid coordinate values (negative or out of bounds)
- Memory allocation failures for large grids

**Contracts**:
- Grid must be a valid ndarray with shape [width, height]
- All overlay coordinates must be within grid bounds
- Platform overlays are the only overlays allowed on wall tiles
- Output string contains newline-separated rows matching grid dimensions

---

### 1.3 LevelJSONExporter Interface

**File**: `src/export/LevelJSONExporter.js`

**Purpose**: Exports complete level data to the canonical Time Oddity JSON format, ensuring all components and tile keys are correctly assembled for engine and test compatibility.

**Static Methods**:
```javascript
exportLevel(levelData: Object): Object // Exports level data to JSON-compliant object
generateTileKey(grid: Object, x: number, y: number, biome: string): string // Generates tile key based on neighbor analysis
generateMapMatrix(grid: Object, biome: string): Array // Generates map matrix with proper tile entries for all positions
convertPlatformsToJSON(platforms: Array, tileSize: number, biome: string, platformShape: string): Array
convertCoinsToJSON(coins: Array, tileSize: number): Array
convertEnemiesToJSON(enemies: Array, tileSize: number): Array
generateBackgrounds(config: Object): Array
selectRandomBiome(): string
selectRandomPlatformShape(): string
```

**Invariants**:
- All exported coordinates are converted from grid coordinates to pixel coordinates using tileSize
- Tile keys are generated based on neighbor analysis for wall tiles (value === 1)
- **Wall tiles (value === 1) use "ground" type** (solid, colliding, physics-enabled)
- **Floor tiles (value === 0) use "decorative" type** (visual-only, no collision, depth -0.5)
- Map matrix contains valid tile entries for all positions (no sparse matrices)
- Background layers provide visual depth with negative depth values
- All required level components are included in export

**Error Conditions**:
- Invalid grid dimensions or coordinates
- Missing required level components
- Invalid biome or platform shape values
- Grid access out of bounds

**Contracts**:
- Input levelData must contain: grid, startPos, goalPos, coins, enemies, platforms, config
- Output JSON must conform to level format specification
- All tile keys must be valid according to available tiles list
- Map matrix must be complete 2D array with no null values
- Tile types must be either "ground" or "decorative" as per level format specification

---

### 1.4 JSONSchemaValidator Interface

**File**: `src/validation/JSONSchemaValidator.js`

**Purpose**: Validates exported level JSON against the canonical schema, ensuring 100% compliance with the Time Oddity format and providing detailed error reporting for all fields and subcomponents.

**Static Methods**:
```javascript
validateLevelJSON(levelJSON: Object): { isValid: boolean, errors: Array<string> }
validateTileKey(tileKey: string): { isValid: boolean, error: string|null }
validateEnemyConfiguration(enemy: Object): { isValid: boolean, errors: Array<string> }
validateBackgroundConfiguration(background: Object): { isValid: boolean, errors: Array<string> }
// ...plus internal helpers for platforms, coins, map_matrix, etc.
```

**Invariants**:
- **SCHEMA-1**: All required fields and subfields are validated for type, range, and allowed values
- **SCHEMA-2**: All tile keys, background keys, and enemy types are checked against master lists
- **SCHEMA-3**: All coordinates are non-negative and within plausible bounds
- **SCHEMA-4**: All errors are reported with field context for debugging

**Error Conditions**:
- Missing required fields (e.g., playerSpawn, goal)
- Invalid tileKey, spriteKey, or enemy configuration
- Out-of-bounds or negative coordinates
- Malformed arrays or map_matrix

---

**Export/Validation Contract**:
- The output of `LevelJSONExporter.exportLevel()` is guaranteed to be accepted by `JSONSchemaValidator.validateLevelJSON()` if all input data is valid and contracts are followed.
- Any changes to the JSON format or schema must be reflected in both the exporter and validator, and covered by tests.
- The exported JSON is the single source of truth for engine loading, test snapshots, and integration validation.