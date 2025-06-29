# Time Oddity Level JSON Format

This document defines the **canonical JSON schema** for describing a level in Time Oddity.  It aggregates the implicit contracts found in the production code (`SceneFactory`, `GameScene`, entity classes) and codifies them into a single reference that tests and future tools can rely on.

> **IMPORTANT:**
> • All sprite `frame`/`tileKey` strings **must** come from the master list in `agent_docs/level-creation/available_tiles.md`.  Adding new artwork? – update that file **and** extend the test-suite before using the new key here.  
> • Any change to this document is a **breaking-contract change** – run the full test-suite before merging.

---

## 1. Top-Level Shape

```jsonc
{
  "platforms": [ /* Array<PlatformConfig> */ ],
  "coins":     [ /* Array<CoinConfig>     */ ]
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

## 4. Example Level Snippet (from `test-level.json`)
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
  ]
}
```

---

## 5. Extensibility Rules
1. **New object types** must implement their own creation function in `SceneFactory` and be listed here.
2. Tests must cover:
   * JSON validation logic.
   * Physics configuration order (see `invariants.md`).
3. Keep this document and `available_tiles.md` in sync with assets and entity code. 