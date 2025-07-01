# Time Oddity Level JSON Format

This document defines the **canonical JSON schema** for describing a level in Time Oddity.  It aggregates the implicit contracts found in the production code (`SceneFactory`, `GameScene`, entity classes) and codifies them into a single reference that tests and future tools can rely on.

> **IMPORTANT:**
> • All sprite `frame`/`tileKey` strings **must** come from the master list in `agent_docs/level-creation/available_tiles.md`.  Adding new artwork? – update that file **and** extend the test-suite before using the new key here.  
> • Any change to this document is a **breaking-contract change** – run the full test-suite before merging.

---

## 1. Top-Level Shape

```jsonc
{
  "platforms":   [ /* Array<PlatformConfig>   */ ],
  "coins":       [ /* Array<CoinConfig>       */ ],
  "enemies":     [ /* Array<EnemyConfig>      */ ],
  "backgrounds": [ /* Array<BackgroundConfig> */ ]
}
```
Every field is **optional** – `SceneFactory` falls back to hard-coded layouts when an array is missing.

---

## 2. Platform Objects

### 2.1 Common Fields
Field            | Type    | Required | Description
-----------------|---------|----------|------------
`type`           | string  | yes      | Discriminator – see sub-types below.
`x`, `y`         | number  | yes      | World-space coordinates (**pixels**).
`tileKey`        | string  | yes      | Frame name from [`available_tiles.md`](available_tiles.md).
`isFullBlock`    | boolean | no (false)| Hit-box mode – `true` ⇒ use full sprite bounds.

### 2.2 Ground Platform (`type: "ground"`)
Additional field | Type   | Description
-----------------|--------|------------
`width`          | number | Horizontal span in **pixels**.  Internally subdivided into 64 px tiles.

```jsonc
{
  "type": "ground",
  "x": 0,
  "y": 2900,
  "width": 6000,
  "tileKey": "terrain_grass_horizontal_middle",
  "isFullBlock": true
}
```

### 2.3 Floating Platform (`type: "floating"`)
Field     | Type   | Description
----------|--------|------------
`width`   | number | Optional span in pixels (default 64).  Tiles are placed left→right.

```jsonc
{ "type": "floating", "x": 700, "y": 2350, "width": 250, "tileKey": "terrain_grass_block_center", "isFullBlock": true }
```

### 2.4 Moving Platform (`type: "moving"`)
Inherits all **Common Fields** plus:

Field        | Type   | Required | Description
-------------|--------|----------|------------
`width`      | number | no       | Pixels – identical semantics to floating platforms.
`movement`   | object | yes      | Movement descriptor (see below).

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
  "tileKey": "terrain_grass_block_center",
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

---

## 3. Collectible Objects

### 3.1 Coin (`type: "coin"`)
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

## 4. Enemy Objects

### 4.1 Common Enemy Fields
Field            | Type    | Required | Description
-----------------|---------|----------|------------
`type`           | string  | yes      | Enemy type discriminator – see sub-types below.
`x`, `y`         | number  | yes      | World-space spawn coordinates (**pixels**).
`texture`        | string  | no       | Texture atlas key (default: `"enemies"`).
`frame`          | string  | no       | Frame name or index (default: `"barnacle_attack_rest"`).

### 4.2 LoopHound Enemy (`type: "LoopHound"`)
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

## 5. Background Objects

Background layers provide visual depth and atmosphere to levels. Multiple layers can be configured with different depths, parallax scrolling speeds, and sprite assets from the `backgrounds` atlas.

### 5.1 Background Layer (`type: "layer"`)

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

### 5.2 Background Configuration Examples

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

## 6. Example Level Snippet (from `test-level.json`)
```jsonc
{
  "platforms": [
    { "type": "ground",   "x": 0,    "y": 2900, "width": 6000, "tileKey": "terrain_grass_horizontal_middle", "isFullBlock": true },
    { "type": "floating", "x": 700,  "y": 2350, "width": 250,  "tileKey": "terrain_grass_block_center",        "isFullBlock": true },
    { "type": "moving",   "x": 3200, "y": 1850, "tileKey": "terrain_grass_block_center", "movement": {
        "type": "linear", "startX": 3200, "startY": 1850, "endX": 3200, "endY": 1100, "speed": 50, "mode": "bounce", "autoStart": true }
    }
  ],
  "coins": [
    { "type": "coin", "x": 400, "y": 850, "properties": { "value": 100 } }
  ],
  "enemies": [
    { "type": "LoopHound", "x": 300, "y": 450, "patrolDistance": 150, "direction": 1, "speed": 80 },
    { "type": "LoopHound", "x": 800, "y": 350, "patrolDistance": 200, "direction": -1, "speed": 60 }
  ]
}
```

---

## 7. Extensibility Rules
1. **New object types** must implement their own creation function in `SceneFactory` and be listed here.
2. Tests must cover:
   * JSON validation logic.
   * Physics configuration order (see `invariants.md`).
3. Keep this document and `available_tiles.md` in sync with assets and entity code.
4. **Enemy types** must implement the Enemy/Freeze Contract (§8 in `invariants.md`).
5. **Custom state recording** is required for enemies with complex behavior (like LoopHound patrol patterns). 