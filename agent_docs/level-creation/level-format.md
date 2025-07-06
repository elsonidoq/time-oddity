# Time Oddity Level JSON Format

This document defines the **canonical JSON schema** for describing a level in Time Oddity.  It aggregates the implicit contracts found in the production code (`SceneFactory`, `GameScene`, entity classes) and codifies them into a single reference that tests and future tools can rely on.

> **IMPORTANT:**
> • All sprite `frame`/`tilePrefix` strings **must** come from the master list in `agent_docs/level-creation/available_tiles.md`.  Adding new artwork? – update that file **and** extend the test-suite before using the new key here.  
> • Any change to this document is a **breaking-contract change** – run the full test-suite before merging.

---

## 1. Top-Level Shape

```jsonc
{
  "playerSpawn":         { /* PlayerSpawnConfig       */ },
  "goal":                { /* GoalConfig             */ },
  "platforms":           [ /* Array<PlatformConfig>   */ ],
  "coins":               [ /* Array<CoinConfig>       */ ],
  "enemies":             [ /* Array<EnemyConfig>      */ ],
  "backgrounds":         [ /* Array<BackgroundConfig> */ ],
  "decorativePlatforms": [ /* Array<DecorativeConfig> */ ],
  "map_matrix":          [ /* Array<Array<TileDict>>  */ ]
}
```
Every field is **optional** – `SceneFactory` and `GameScene` fall back to sensible defaults when fields are missing.

---

## 2. Player Spawn Configuration

### 2.1 Player Spawn (`playerSpawn`)
Configures the player's starting position in the level.

Field            | Type    | Required | Description
-----------------|---------|----------|------------
`x`              | number  | yes      | Player spawn X position in pixels.
`y`              | number  | yes      | Player spawn Y position in pixels.

**Fallback Behavior**: If `playerSpawn` is not provided, the player spawns just above the lowest ground platform, or at default coordinates (100, 400) if no platforms exist.

```jsonc
{
  "playerSpawn": { "x": 200, "y": 870 }
}
```

---

## 3. Goal Configuration

### 3.1 Goal Tile (`goal`)
Configures the level exit/goal tile that triggers level completion.

Field            | Type    | Required | Description
-----------------|---------|----------|------------
`x`              | number  | yes      | Goal tile X position in pixels.
`y`              | number  | yes      | Goal tile Y position in pixels.
`tileKey`        | string  | yes      | Tile sprite frame name from the `tiles` atlas.
`isFullBlock`    | boolean | no (true)| Hit-box mode – `true` ⇒ use full sprite bounds.

**Available Goal Tile Keys**: Any valid tile frame from the `tiles` atlas, commonly `sign_exit`, `block_coin`, etc.

```jsonc
{
  "goal": {
    "x": 4000,
    "y": 850,
    "tileKey": "sign_exit",
    "isFullBlock": true
  }
}
```

---

## 4. Platform Objects

### 4.1 Tile Prefix System

Platforms now use a **tile prefix system** that automatically selects appropriate tile variants based on platform size and position. This system provides visual distinction for multi-tile platforms and ensures consistent tile selection.

**Tile Prefix Field:**
Field            | Type    | Required | Description
-----------------|---------|----------|------------
`tilePrefix`     | string  | yes      | Base tile prefix for automatic tile selection (e.g., 'terrain_grass_block')

**Automatic Tile Selection Behavior:**
- **Single Tile (width ≤ 64px)**: Uses the base prefix directly (e.g., `terrain_grass_block`)
- **Two Tiles**: Uses `_left` and `_right` suffixes
- **Three+ Tiles**: Uses `_left`, `_center`/`_middle`, and `_right` suffixes

**Naming Conventions:**
- **Block-style prefixes** (containing `_block`): Use `_left`, `_center`, `_right`
- **Horizontal-style prefixes**: Use `_left`, `_middle`, `_right`

**Examples:**
- **Single tile**: `terrain_grass_block` → `terrain_grass_block`
- **Multi-tile**: `terrain_grass_block` → `terrain_grass_block_left`, `terrain_grass_block_center`, `terrain_grass_block_right`
- **Single tile**: `terrain_grass_horizontal` → `terrain_grass_horizontal`
- **Multi-tile**: `terrain_grass_horizontal` → `terrain_grass_horizontal_left`, `terrain_grass_horizontal_middle`, `terrain_grass_horizontal_right`


### 4.2 Common Fields
Field            | Type    | Required | Description
-----------------|---------|----------|------------
`type`           | string  | yes      | Discriminator – see sub-types below.
`x`, `y`         | number  | yes      | World-space coordinates (**pixels**).
`tilePrefix`     | string  | yes      | Base tile prefix for automatic tile selection.
`isFullBlock`    | boolean | no (false)| Hit-box mode – `true` ⇒ use full sprite bounds.

### 4.3 Ground Platform (`type: "ground"`)
Additional field | Type   | Description
-----------------|--------|------------
`width`          | number | Horizontal span in **pixels**.  Internally subdivided into 64 px tiles.

**Tile Selection:** Ground platforms use horizontal-style naming (`_left`, `_middle`, `_right`).

```jsonc
{
  "type": "ground",
  "x": 0,
  "y": 2900,
  "width": 6000,
  "tilePrefix": "terrain_grass_horizontal",
  "isFullBlock": true
}
```

**Multi-tile Example (3+ tiles):**
```jsonc
{
  "type": "ground",
  "x": 0,
  "y": 2900,
  "width": 192,  // 3 tiles (64px each)
  "tilePrefix": "terrain_grass_horizontal",
  "isFullBlock": true
}
// Results in: terrain_grass_horizontal_left, terrain_grass_horizontal_middle, terrain_grass_horizontal_right
```

**Single-tile Example:**
```jsonc
{
  "type": "ground",
  "x": 0,
  "y": 2900,
  "width": 64,  // 1 tile
  "tilePrefix": "terrain_grass_horizontal",
  "isFullBlock": true
}
// Results in: terrain_grass_horizontal (single tile)
```

### 4.4 Floating Platform (`type: "floating"`)
Field     | Type   | Description
----------|--------|------------
`width`   | number | Optional span in pixels (default 64).  Tiles are placed left→right.

**Tile Selection:** Floating platforms use block-style naming (`_left`, `_center`, `_right`).

```jsonc
{ "type": "floating", "x": 700, "y": 2350, "width": 250, "tilePrefix": "terrain_grass_block", "isFullBlock": true }
```

**Single-tile Example (default):**
```jsonc
{ "type": "floating", "x": 700, "y": 2350, "tilePrefix": "terrain_grass_block", "isFullBlock": true }
// Results in: terrain_grass_block (single tile)
```

**Multi-tile Example (3 tiles):**
```jsonc
{ "type": "floating", "x": 700, "y": 2350, "width": 192, "tilePrefix": "terrain_grass_block", "isFullBlock": true }
// Results in: terrain_grass_block_left, terrain_grass_block_center, terrain_grass_block_right
```

**Two-tile Example:**
```jsonc
{ "type": "floating", "x": 700, "y": 2350, "width": 128, "tilePrefix": "terrain_grass_block", "isFullBlock": true }
// Results in: terrain_grass_block_left, terrain_grass_block_right
```

### 4.5 Moving Platform (`type: "moving"`)
Inherits all **Common Fields** plus:

Field        | Type   | Required | Description
-------------|--------|----------|------------
`width`      | number | no       | Pixels – identical semantics to floating platforms.
`movement`   | object | yes      | Movement descriptor (see below).

**Tile Selection:** Moving platforms use block-style naming (`_left`, `_center`, `_right`), identical to floating platforms.

#### Movement Descriptor
Key          | Type    | Required | Description
-------------|---------|----------|------------
`type`       | string  | yes      | `"linear"` (currently supported).
`startX/Y`   | number  | yes      | Start position.
`endX/Y`     | number  | yes      | End position.
`speed`      | number  | yes      | Pixels/second (validated 0 < speed ≤ 200).
`mode`       | string  | no       | `"loop"` or `"bounce"` (default).
`autoStart`  | boolean | no       | Begin moving immediately (default `true`).

Example:
```jsonc
{
  "type": "moving",
  "x": 3200,
  "y": 1850,
  "tilePrefix": "terrain_grass_block",
  "movement": {
    "type": "linear",
    "startX": 3200,
    "startY": 1850,
    "endX": 3200,
    "endY": 1100,
    "speed": 50,
    "mode": "bounce",
    "autoStart": true
  }
}
```

**Multi-tile Moving Platform Example:**
```jsonc
{
  "type": "moving",
  "x": 3200,
  "y": 1850,
  "width": 192,  // 3 tiles
  "tilePrefix": "terrain_grass_block",
  "movement": {
    "type": "linear",
    "startX": 3200,
    "startY": 1850,
    "endX": 3200,
    "endY": 1100,
    "speed": 50,
    "mode": "bounce",
    "autoStart": true
  }
}
// Results in: terrain_grass_block_left, terrain_grass_block_center, terrain_grass_block_right
```

**Single-tile Moving Platform Example:**
```jsonc
{
  "type": "moving",
  "x": 3200,
  "y": 1850,
  "tilePrefix": "terrain_grass_block",
  "movement": {
    "type": "linear",
    "startX": 3200,
    "startY": 1850,
    "endX": 3200,
    "endY": 1100,
    "speed": 50,
    "mode": "bounce",
    "autoStart": true
  }
}
// Results in: terrain_grass_block (single tile)
```

---

## 5. Decorative Platforms

Decorative platforms are **non-interactive background elements** that provide visual design without affecting gameplay. They are configured in a separate top-level `decorativePlatforms` array.

### 5.1 Decorative Platform Configuration

Field            | Type    | Required | Description
-----------------|---------|----------|------------
`type`           | string  | yes      | Always `"decorative"`.
`x`, `y`         | number  | yes      | World-space coordinates (**pixels**).
`tilePrefix`     | string  | yes      | Base tile prefix for automatic tile selection.
`width`          | number  | no (64)  | Optional span in pixels (default 64). Tiles are placed left→right.
`depth`          | number  | yes      | Z-index for rendering order. **Must be negative** for background rendering.

**Tile Selection**: Decorative platforms use block-style naming (`_left`, `_center`, `_right`), identical to floating platforms.

**Rendering Behavior**:
- **No collision detection**: Players and enemies pass through decorative platforms
- **Background depth rendering**: Uses negative depth values to render behind gameplay elements
- **Visual only**: No physics body creation (performance efficient)
- **Time reversal compatible**: Static elements that don't participate in time mechanics

**Depth Ordering Guidelines**:
- **Background Elements**: depth -1.0 to -0.1 (render behind gameplay)
- **Gameplay Elements**: depth 0 and above (platforms, enemies, player)
- **Recommended**: Use depth -0.5 for most decorative platforms

**Available Tile Prefixes** (from `available_tiles.md`):
- **Terrain Blocks**: `terrain_grass_block`, `terrain_dirt_block`, `terrain_stone_block`, `terrain_sand_block`, `terrain_snow_block`, `terrain_purple_block`
- **Decorative Elements**: `bush`, `cactus`, `mushroom_brown`, `mushroom_red`, `rock`, `hill`, `hill_top`
- **Architecture**: `brick_brown`, `brick_grey`, `bricks_brown`, `bricks_grey`, `bridge`, `bridge_logs`
- **Nature**: `grass`, `grass_purple`, `snow`, `water`, `water_top`, `lava`, `lava_top`

**Single-tile Example (default):**
```jsonc
{
  "type": "decorative",
  "x": 100,
  "y": 200,
  "tilePrefix": "terrain_grass_block",
  "depth": -0.5
}
// Results in: terrain_grass_block (single tile)
```

**Multi-tile Example (3 tiles):**
```jsonc
{
  "type": "decorative",
  "x": 100,
  "y": 200,
  "width": 192,
  "tilePrefix": "terrain_grass_block",
  "depth": -0.5
}
// Results in: terrain_grass_block_left, terrain_grass_block_center, terrain_grass_block_right
```

**Two-tile Example:**
```jsonc
{
  "type": "decorative",
  "x": 100,
  "y": 200,
  "width": 128,
  "tilePrefix": "terrain_grass_block",
  "depth": -0.5
}
// Results in: terrain_grass_block_left, terrain_grass_block_right
```

**Decorative Element Example:**
```jsonc
{
  "type": "decorative",
  "x": 300,
  "y": 150,
  "tilePrefix": "bush",
  "depth": -0.3
}
// Results in: bush (single decorative element)
```

**Validation Rules**:
- `tilePrefix`: Must be a valid tile prefix from `available_tiles.md`
- `depth`: Must be negative for background rendering (< 0)
- `width`: Must be positive and divisible by 64 (tile size)
- `x`, `y`: Must be valid world coordinates
- **No collision**: Decorative platforms never create physics bodies

---

## 6. Map Matrix Objects

The `map_matrix` provides an alternative 2D tile-based approach to level definition, allowing for grid-based level design with automatic coordinate calculation.

### 6.1 Map Matrix Structure (`map_matrix`)

The `map_matrix` is a 2D array where each entry contains a tile dictionary with tile and type information.

**Matrix Structure:**
```jsonc
[
  [
    { "tileKey": "terrain_grass_block", "type": "ground" },
    { "tileKey": "bush", "type": "decorative" }
  ],
  [
    { "tileKey": "terrain_grass_block", "type": "ground" },
    { "tileKey": "rock", "type": "decorative" }
  ]
]
```

**Tile Dictionary Fields:**
Field            | Type    | Required | Description
-----------------|---------|----------|------------
`tileKey`        | string  | yes      | Tile sprite frame name from the `tiles` atlas (must be valid from `available_tiles.md`).
`type`           | string  | yes      | Platform type: `"ground"` or `"decorative"`.

**Coordinate System:**
- **Matrix Position**: `matrix[row][col]` maps to world position `(col * 64, row * 64)`
- **Tile Size**: Each matrix cell represents a 64x64 pixel tile
- **Origin**: Matrix position (0,0) maps to world position (0,0)
- **Y-Axis**: Matrix rows increase downward (positive Y in world coordinates)

**Coordinate Mapping Examples:**
- `matrix[0][0]` → world position (0, 0)
- `matrix[0][1]` → world position (64, 0)
- `matrix[1][0]` → world position (0, 64)
- `matrix[1][1]` → world position (64, 64)

**Platform Type Behavior:**
- **`"ground"`**: Creates physics-enabled platform tiles that participate in collision detection and time reversal
- **`"decorative"`**: Creates visual-only background tiles with no collision detection (depth -0.5)

**Validation Rules:**
- `map_matrix`: Must be a 2D array (array of arrays)
- `tileKey`: Must be a valid tile key from `available_tiles.md`
- `type`: Must be either `"ground"` or `"decorative"`
- **Empty Matrix**: Empty array `[]` is valid and creates no tiles
- **Row Consistency**: All rows should have the same number of columns for consistent level width

**Example Map Matrix Level:**
```jsonc
{
  "playerSpawn": { "x": 200, "y": 870 },
  "goal": {
    "x": 4000,
    "y": 850,
    "tileKey": "sign_exit",
    "isFullBlock": true
  },
  "map_matrix": [
    [
      { "tileKey": "terrain_grass_block", "type": "ground" },
      { "tileKey": "terrain_grass_block", "type": "ground" },
      { "tileKey": "bush", "type": "decorative" }
    ],
    [
      { "tileKey": "terrain_grass_block", "type": "ground" },
      { "tileKey": "terrain_grass_block", "type": "ground" },
      { "tileKey": "rock", "type": "decorative" }
    ]
  ]
}
```

**Resulting World Positions:**
- `matrix[0][0]` → ground tile at (0, 0)
- `matrix[0][1]` → ground tile at (64, 0)
- `matrix[0][2]` → decorative bush at (128, 0)
- `matrix[1][0]` → ground tile at (0, 64)
- `matrix[1][1]` → ground tile at (64, 64)
- `matrix[1][2]` → decorative rock at (128, 64)

**Integration with Existing Format:**
- `map_matrix` can be used alongside traditional platform definitions
- When both `map_matrix` and `platforms` arrays are present, both are processed
- `map_matrix` provides a grid-based alternative to individual platform positioning
- Maintains full backward compatibility with existing level format

---

## 7. Collectible Objects

### 7.1 Coin (`type: "coin"`)
Field            | Type    | Required | Description
-----------------|---------|----------|------------
`type`           | string  | yes      | Always `"coin"`.
`x`, `y`         | number  | yes      | World position.
`properties`     | object  | no       | Arbitrary metadata.
`properties.value`| number | no (100) | Score value displayed in HUD.

`Coin` spawns with texture `"coin_spin"` and animation `coin_spin`.  Physics body has gravity disabled **after** being added to the `coins` group (see §13.5 in `invariants.md`).

```jsonc
{
  "type": "coin",
  "x": 500,
  "y": 850,
  "properties": { "value": 100 }
}
```

---

## 8. Enemy Objects

### 8.1 Common Enemy Fields
Field            | Type    | Required | Description
-----------------|---------|----------|------------
`type`           | string  | yes      | Enemy type discriminator – see sub-types below.
`x`, `y`         | number  | yes      | World-space spawn coordinates (**pixels**).
`texture`        | string  | no       | Texture atlas key (default: `"enemies"`).
`frame`          | string  | no       | Frame name or index (default: `"barnacle_attack_rest"`).

### 8.2 LoopHound Enemy (`type: "LoopHound"`)
A patrolling enemy that moves back and forth along a fixed horizontal path. Implements custom state recording for time reversal compatibility.

Field            | Type    | Required | Description
-----------------|---------|----------|------------
`type`           | string  | yes      | Always `"LoopHound"`.
`x`, `y`         | number  | yes      | Spawn position (y should be ground level).
`patrolDistance` | number  | no (200) | Horizontal patrol range in pixels (50-500).
`direction`      | number  | no (1)   | Initial patrol direction: `1` (right) or `-1` (left).
`speed`          | number  | no (80)  | Movement speed in pixels/second (10-200).
`texture`        | string  | no       | Texture atlas key (default: `"enemies"`).
`frame`          | string  | no       | Frame name (default: `"barnacle_attack_rest"`).

**Patrol Behavior**: The LoopHound patrols between `x` and `x + patrolDistance`, automatically reversing direction at boundaries.

**Time Reversal**: LoopHound implements custom state recording to preserve patrol boundaries, direction, and freeze state during time manipulation.

**Physics Configuration**: Follows §13 Physics Configuration Order - must be added to `enemies` group BEFORE physics configuration.

```jsonc
{
  "type": "LoopHound",
  "x": 300,
  "y": 450,
  "patrolDistance": 150,
  "direction": 1,
  "speed": 80
}
```

**Validation Rules**:
- `patrolDistance`: Must be between 50 and 500 pixels
- `direction`: Must be `1` (right) or `-1` (left)
- `speed`: Must be between 10 and 200 pixels/second
- `x`, `y`: Must be within level bounds
- `y`: Should be positioned on solid ground (platform level)

---

## 9. Background Objects

Background layers provide visual depth and atmosphere to levels. Multiple layers can be configured with different depths, parallax scrolling speeds, and sprite assets from the `backgrounds` atlas.

### 9.1 Background Layer (`type: "layer"`)

Field            | Type    | Required | Description
-----------------|---------|----------|------------
`type`           | string  | yes      | Always `"layer"` for background layers.
`x`, `y`         | number  | yes      | World-space coordinates (**pixels**) for layer positioning.
`width`, `height`| number  | yes      | Dimensions in **pixels** for tileSprite creation.
`spriteKey`      | string  | yes      | Background sprite frame name from `backgrounds` atlas.
`depth`          | number  | yes      | Z-index for layer ordering. Negative values (e.g., -2, -1) render behind gameplay elements.
`scrollSpeed`    | number  | no (0.0) | Parallax scrolling speed multiplier. 0.0 = static, 0.5 = half player speed, 1.0 = full player speed.

**Available Background Sprite Keys** (from `backgrounds` atlas):
- `background_solid_sky`, `background_solid_cloud`, `background_solid_dirt`, `background_solid_grass`, `background_solid_sand`
- `background_color_desert`, `background_color_hills`, `background_color_mushrooms`, `background_color_trees`  
- `background_fade_desert`, `background_fade_hills`, `background_fade_mushrooms`, `background_fade_trees`
- `background_clouds`

**Depth Ordering Guidelines:**
- **Far Background (Sky)**: depth -2, scrollSpeed 0.0 (static)
- **Mid Background (Hills/Clouds)**: depth -1, scrollSpeed 0.3-0.7 (slow parallax)
- **Gameplay Elements**: depth 0 and above (platforms, enemies, player)

```jsonc
{
  "type": "layer",
  "x": 640,
  "y": 360,
  "width": 1280,
  "height": 720,
  "spriteKey": "background_solid_sky",
  "depth": -2,
  "scrollSpeed": 0.0
}
```

### 9.2 Background Configuration Examples

**Simple Single Layer Background:**
```jsonc
{
  "backgrounds": [
    {
      "type": "layer",
      "x": 640,
      "y": 360,
      "width": 1280,
      "height": 720,
      "spriteKey": "background_color_hills",
      "depth": -1,
      "scrollSpeed": 0.5
    }
  ]
}
```

**Multi-Layer Parallax Background:**
```jsonc
{
  "backgrounds": [
    {
      "type": "layer",
      "x": 640,
      "y": 360,
      "width": 1280,
      "height": 720,
      "spriteKey": "background_solid_sky",
      "depth": -2,
      "scrollSpeed": 0.0
    },
    {
      "type": "layer",
      "x": 640,
      "y": 360,
      "width": 1280,
      "height": 720,
      "spriteKey": "background_color_hills",
      "depth": -1,
      "scrollSpeed": 0.5
    }
  ]
}
```

**Validation Rules:**
- `spriteKey`: Must be a valid frame name from the `backgrounds` atlas
- `depth`: Must be negative for background layers (< 0)
- `scrollSpeed`: Must be between 0.0 and 1.0 (inclusive)
- `width`, `height`: Must be positive numbers
- `x`, `y`: Must be valid world coordinates
- **Layer Ordering**: Layers with lower depth values render behind layers with higher depth values

---

## 10. Complete Level Example (from `test-level.json`)

```jsonc
{
  "playerSpawn": { "x": 200, "y": 870 },
  "goal": {
    "x": 4000,
    "y": 850,
    "tileKey": "sign_exit",
    "isFullBlock": true
  },
  "platforms": [
    { "type": "ground",   "x": 0,    "y": 2900, "width": 6000, "tilePrefix": "terrain_grass_horizontal", "isFullBlock": true },
    { "type": "floating", "x": 700,  "y": 2350, "width": 250,  "tilePrefix": "terrain_grass_cloud",      "isFullBlock": true },
    { "type": "moving",   "x": 3200, "y": 1850, "tilePrefix": "terrain_grass_cloud", "movement": {
        "type": "linear", "startX": 3200, "startY": 1850, "endX": 3200, "endY": 1100, "speed": 50, "mode": "bounce", "autoStart": true }
    }
  ],
  "coins": [
    { "type": "coin", "x": 400, "y": 850, "properties": { "value": 100 } },
    { "type": "coin", "x": 500, "y": 850, "properties": { "value": 100 } }
  ],
  "enemies": [
    { "type": "LoopHound", "x": 300, "y": 2900, "patrolDistance": 150, "direction": 1, "speed": 80 },
    { "type": "LoopHound", "x": 800, "y": 2300, "patrolDistance": 200, "direction": -1, "speed": 60 }
  ],
  "backgrounds": [
    {
      "type": "layer",
      "x": 3200,
      "y": 1800,
      "width": 6400,
      "height": 3600,
      "spriteKey": "background_solid_sky",
      "depth": -2,
      "scrollSpeed": 0.0
    },
    {
      "type": "layer",
      "x": 3200,
      "y": 1800,
      "width": 6400,
      "height": 3600,
      "spriteKey": "background_color_hills",
      "depth": -1,
      "scrollSpeed": 0.5
    }
  ],
  "decorativePlatforms": [
    { "type": "decorative", "x": 310, "y": 850, "tilePrefix": "terrain_grass_block", "depth": -0.2 },
    { "type": "decorative", "x": 300, "y": 200, "width": 192, "tilePrefix": "terrain_stone_block", "depth": -0.6 },
    { "type": "decorative", "x": 600, "y": 250, "tilePrefix": "bush", "depth": -0.7 }
  ]
}
```

---

## 11. Extensibility Rules
1. **New object types** must implement their own creation function in `SceneFactory` and be listed here.
2. Tests must cover:
   * JSON validation logic.
   * Physics configuration order (see `invariants.md`).
3. Keep this document and `available_tiles.md` in sync with assets and entity code.
4. **Enemy types** must implement the Enemy/Freeze Contract (§8 in `invariants.md`).
5. **Custom state recording** is required for enemies with complex behavior (like LoopHound patrol patterns).
6. **Top-level fields** (`playerSpawn`, `goal`, `decorativePlatforms`) are parsed directly by `GameScene` and `SceneFactory`.
7. **Validation**: All configurations undergo validation during `SceneFactory.loadConfiguration()` – invalid configurations are rejected with detailed error messages.
