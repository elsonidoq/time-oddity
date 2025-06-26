# Project Invariants Catalogue

> **Purpose**  
> This document enumerates **non-negotiable assumptions** ("invariants") that the existing Time Oddity codebase depends on.  
> Any change that violates one of these rules will very likely break runtime behaviour **and/or** the extensive Jest test-suite.  Whenever you add a new feature, please revisit this list and update it if you intentionally need to relax or extend an invariant.

---

## 1. Global Architecture
1. **Client is authoritative for rendering only** – all gameplay logic runs inside Phaser scenes; audio is handled exclusively by Howler.js (Phaser audio _must stay disabled_, see §2).  
2. **Directory contract** – paths used by `BootScene` to load Kenney assets (e.g. `/src/assets/sprites/…`) **MUST remain valid**.
3. **Scene key naming** is relied on by tests & runtime-navigation: `BootScene`, `MenuScene`, `GameScene`.  Do **NOT** rename without refactoring all references.

---

## 2. Phaser `Game` Configuration (client/src/game.js)
| Property | Expected Value | Why it must not change |
|----------|----------------|------------------------|
| `type` | `Phaser.AUTO` | WebGL first with Canvas fallback. |
| `width` | **1280** | Camera & UI positions assume this width. |
| `height` | **720** | Same as above for vertical placement. |
| `physics.default` | `'arcade'` | All entities extend `Phaser.Physics.Arcade.Sprite`. |
| `physics.arcade.gravity.y` | **980** | Hard-coded in several state files (`jumpPower`, Enemy physics). |
| `audio.noAudio` | **true** | Prevents Phaser's audio engine so Howler.js can be sole provider. Changing this will double-play or break audio tests. |

---

## 3. Scene Lifecycle
1. **Boot → Menu → Game** – `BootScene` must finish loading atlases before any other scene is started.
2. `GameScene` creates physics groups **platforms, players, enemies, coins** – their existence is assumed by many systems (`CollisionManager`, `ChronoPulse`).
3. `GameScene` registers a single `Player` instance in `this.players`. Multiple players are *not* yet supported.
4. **Platform Creation**: `GameScene` uses `PlatformFactory` to create `Platform` class instances instead of hardcoded sprites. All platforms are registered with `TimeManager` for time reversal compatibility.

---

## 4. Input Mapping (systems/InputManager.js)
| Action | Keys |
|--------|------|
| Move Left | ← or **A** |
| Move Right | → or **D** |
| Jump / Up | ↑, **W**, or **SPACE** |
| Dash | **SHIFT** (JustDown is used for dash trigger) |
| Rewind | **R** (While held) |
| Chrono-Pulse | **E** (JustDown) |
| Pause | **P** (JustDown) |

If you change key bindings ensure **all getters** in `InputManager` continue to return correct booleans because they are queried **each frame in every state**.

---

## 5. State Machine Contract (systems/StateMachine.js)
1. Every state object **must expose `enter()`, `execute(time,delta)`, and `exit()`**. Absence silently breaks transitions.
2. Calling `setState(name)` **always** triggers `currentState.exit()` _before_ the new state's `enter()`.

---

## 6. Player Invariants (entities/Player.js + states)
1. `this.isDashing` is **true only** between `DashState.enter()` and its own `exit` path. Other states check this flag to disable conflicting movement.
2. Dash timing variables:
   * `dashDuration` = **120 ms**  
   * `dashCooldown` = **1000 ms** (cool-down)  
   * `dashTimer` stores _absolute_ time when the next dash becomes legal.  
3. While dashing **gravity is disabled** (`body.setAllowGravity(false)`) and horizontal velocity follows a quadratic easing curve – do **NOT** clamp or overwrite `body.velocity.x` elsewhere during dash.
4. Body size/offset: width × 0.5, height × 0.7; origin is always (0.5, 1). Many collision expectations use these proportions.

---

## 7. TimeManager Rewind System
1. A snapshot is recorded **every 50 ms** (`recordInterval`). Lowering increases memory; increasing breaks smooth rewind tests.
2. Any object registered with `TimeManager` must either:
   * implement `getStateForRecording()` **and** `setStateFromRecording(state)`, **or**  
   * expose **at minimum**: `x`, `y`, `body.velocity.{x,y}`, `anims.currentAnim.key`, `active`, `visible`.
3. During rewind `body.setAllowGravity(false)` is called – objects should not immediately re-enable gravity on their own.
4. Visual rewind overlay is created with depth **1000**; adding UI above this depth will hide it.
5. **Pause recording functionality**: `pauseRecording()` and `resumeRecording()` methods control whether state snapshots are recorded. When paused, the rewind buffer is preserved but no new states are added.

---

## 8. Enemy / Freeze Contract
1. All enemies extend `Enemy` which assumes:
   * property `isFrozen` boolean
   * method `freeze(duration)` **must** set `isFrozen` and stop motion/animation.
   * method `unfreeze()` re-enables behaviour.
2. `ChronoPulse` relies on `scene.enemies` being a **Phaser Group** whose children implement `freeze()`.

---

## 9. ChronoPulse Ability
1. `activate()` fails and returns **false** if cooldown not elapsed (cooldown default 3 s). Do **NOT** call twice inside the same frame.
2. Visual shock-wave uses a `graphics` object whose **initial radius is 20 px**; animation scales to `range / 20`.
3. Ability sets `this.isActive = true` only for visual duration; business-logic must not key off this flag after `duration` expires.

---

## 10. CollisionManager Expectations
1. All colliders are created **once** during `GameScene.create()`; re-creating colliders each frame will leak handlers.
2. `setupPlayerEnemyCollision()` emits `'playerEnemyCollision'` event on the **scene** event-emitter. Listeners rely on this exact event name.
3. **Platform Collisions**: Platforms are `Platform` class instances that implement time reversal contracts (`getStateForRecording()` and `setStateFromRecording()`). Collision detection works with both static and moving platforms.

---

## 11. ObjectPool Contract
1. The supplied `group` **must** be a `Phaser.GameObjects.Group` – pools do **not** create a group themselves.
2. All pooled objects must implement `setActive(bool)` and `setVisible(bool)` (standard for Sprites).
3. `release(object)` only toggles active/visible – it does **not** reset other state. Factory should handle that in `get()` if needed.

---

## 12. Level / Platform Geometry
1. Ground top pixel-row sits at **y = 656** in 720 p canvas; camera bounds & player spawn rely on this magic number.
2. Platform configuration is handled by `Platform.configurePlatform()` method within the `Platform` class. The `isFullBlock` parameter sets hit-box to full sprite when `true`; altering this function may break jump/fall tests.
3. **Platform Registration**: All platforms created by `GameScene` must be registered with `TimeManager` for time reversal compatibility.

---

## 13. Testing Assumptions
1. Jest tests rely on public method names staying **exactly the same** (e.g., `Player.simulateDashStateExecute()`).
2. Mocks replace external libraries (`phaser`, `gsap`, `howler`) – ensure new code paths do **not** require un-mocked APIs during test runs.
3. Platform tests require physics body mocking – ensure `scene.physics.add.existing()` assigns a mock body with required methods.
4. PlatformFactory tests validate configuration parameters – ensure all required and optional parameters are tested.
5. Platform state recording tests verify custom state structure beyond base TemporalState.

---

## 14. Asset & Animation Keys
The following **key strings** are hard-coded across boot loaders, entity classes and tests. Changing any of them requires updating all call-sites **and** the asset pipeline.

| Purpose | Key / Filename | Where referenced |
|---------|----------------|------------------|
| Character atlas | `characters` | `BootScene`, `Player`, unit tests |
| Tile atlas | `tiles` | `BootScene`, `GameScene.configurePlatform`, `Coin` |
| Enemy atlas | `enemies` | `BootScene`, `LoopHound`, enemy tests |
| Player animations | `player-idle`, `player-walk`, `player-jump`, `player-fall` | All player state files |
| Coin spin animation | `coin_spin` | `Coin` entity, overlap handler tests |
| Enemy walk/fly anims | `slime-walk`, `fly-fly`, `mouse-walk` | Enemy AI, BootScene |
| ChronoPulse placeholder texture | `'placeholder'` | `ChronoPulse` constructor |

BootScene **must** define every animation before any other scene starts; otherwise runtime will throw `Animation not found` errors.

### 14.1 PlatformFactory Configuration Requirements
The `PlatformFactory.createPlatform(config)` method requires specific configuration parameters:

**Required Parameters:**
- `x: number` - Horizontal position
- `y: number` - Vertical position  
- `frameKey: string` - Frame key from the tiles atlas

**Optional Parameters (with defaults):**
- `width: number = 64` - Platform width
- `height: number = 64` - Platform height
- `textureKey: string = 'tiles'` - Atlas key
- `isFullBlock: boolean = false` - Whether to use full sprite hitbox
- `platformType: string = 'static'` - Platform type: 'static'|'moving'|'breakable'|'bouncy'|'conveyor'
- `movementConfig: Object = null` - Movement configuration for moving platforms
- `properties: Object = {}` - Additional platform properties

**Movement Configuration (for moving platforms):**
```javascript
{
  path: Array<{x: number, y: number}>, // Movement path points (minimum 2)
  speed: number,                        // Movement speed (positive)
  loop: boolean,                        // Whether to loop the path
  pingPong: boolean,                    // Whether to reverse at endpoints
  startDelay: number                    // Initial delay before movement
}
```

**Validation Rules:**
- All required parameters must be present and of correct type
- Moving platforms require valid movementConfig with at least 2 path points
- Movement speed must be positive
- Loop and pingPong flags must be boolean values

---

## 15. Runtime Event Names
Several systems communicate via the Phaser event-emitter. These string constants are implicitly coupled to tests and other listeners:

| Emitter | Event Name | Emitted From | Expected Listeners |
|---------|------------|--------------|-------------------|
| Scene.events | `playerEnemyCollision` | `CollisionManager.setupPlayerEnemyCollision` | Combat handler in `GameScene`, tests |
| Scene.events | `enemyFrozen` / `enemyUnfrozen` | `Enemy.freeze()` / `Enemy.unfreeze()` | Visual/audio feedback to be implemented, tests |
| Scene.events | `gamePaused` | `GameScene.update()` when pause triggered | UI feedback systems, tests |
| Scene.events | `gameResumed` | `UIScene.resumeGame()` when resume triggered | Game state restoration systems, tests |

Do **not** rename these events without refactoring every `scene.events.on(...)` subscription and the test-suite.

---

## 16. Testing & Mock Integration
1. **Global mocks** for `phaser`, `gsap`, `howler`, and `matter-js` live in `tests/__mocks__` and **must stay in sync** with any new API surface you introduce.
2. Tests rely on `globalThis.createMockGameObject` to satisfy `ObjectPool` when a Phaser `Group` is absent; keep that hook or extend the mock accordingly.
3. When adding new external libraries, provide a Jest manual mock in `tests/mocks/` or tests will fail in CI.
4. **Centralized Phaser mocks** – `phaserKeyMock.js`, `phaserSceneMock.js`, and `eventEmitterMock.js` are the **single source of truth** for keyboard, scene, and event-emitter fakes.  All test files **must import these factories instead of rolling their own**.  Any change to production APIs that touches Phaser internals **requires** the corresponding mock be extended _before_ new tests are written.

---

## 17. State Structures & Time Reversal Contracts

### 17.1 Base TemporalState (systems/TemporalState.js)
The minimal state shape that **all** objects must expose for TimeManager recording:

```javascript
{
  x: number,           // Horizontal position
  y: number,           // Vertical position  
  velocityX: number,   // Horizontal velocity
  velocityY: number,   // Vertical velocity
  animation: string,   // Current animation key (or null)
  isAlive: boolean,    // Phaser's active flag
  isVisible: boolean   // Visibility flag
}
```

**Usage**: TimeManager creates this automatically for objects without custom recording methods.

### 17.2 Entity Base State (entities/Entity.js)
All entities inherit these properties from `Phaser.Physics.Arcade.Sprite` + custom fields:

```javascript
// From Phaser.Physics.Arcade.Sprite
this.x, this.y                    // Position
this.body.velocity.x/y            // Physics velocity
this.active                       // Phaser's active flag
this.visible                      // Visibility
this.anims.currentAnim.key        // Current animation

// Custom Entity properties  
this.health                       // Current health (0-100)
this.maxHealth                    // Maximum health
this.isActive                     // Custom active flag (used by ChronoPulse)
```

**Time Reversal**: `isActive` is synced with `active` during state restoration.

### 17.3 Player State (entities/Player.js)
Extends Entity with player-specific state:

```javascript
// Movement & Physics
this.speed = 200                  // Horizontal movement speed
this.jumpPower = 800              // Jump velocity
this.gravity = 980                // Gravity constant

// Combat
this.attackPower = 20             // Damage dealt to enemies

// Dash System (critical for time reversal)
this.dashCooldown = 1000          // Cooldown in ms
this.dashDuration = 120           // Dash duration in ms  
this.dashSpeed = 1000             // Dash velocity
this.dashTimer = 0                // Absolute time when dash becomes available
this.canDash = true               // Whether dash is currently allowed
this.isDashing = false            // Whether currently dashing

// State Machine
this.stateMachine                 // Current state: 'idle'|'run'|'jump'|'fall'|'dash'
this._wasRewinding = false        // Previous rewind state for transition handling

// Abilities
this.chronoPulse                  // ChronoPulse instance
this.ghostPool                    // ObjectPool for dash trail effects
```

**Time Reversal**: Dash timing variables (`dashTimer`, `canDash`) are **not** recorded by TimeManager – they are recalculated from `scene.time.now` during state restoration.

### 17.4 Enemy State (entities/Enemy.js)
Extends Entity with AI behavior state:

```javascript
// Health & Combat
this.maxHealth = 100              // Maximum health
this.health                       // Current health  
this.damage = 20                  // Damage dealt to player
this.speed = 100                  // Movement speed
this.moveSpeed = this.speed       // Current movement speed

// Movement & AI
this.direction = 1                // 1 = right, -1 = left
this.stateMachine                 // AI state machine

// Freeze System (critical for ChronoPulse)
this.isFrozen = false             // Whether currently frozen
this._frozenUntil = null          // Timestamp when freeze expires
this._freezeTimer = null          // Internal timer reference
```

**Time Reversal**: Freeze timers are checked against `scene.time.now` during `update()` – they automatically expire and unfreeze enemies.

### 17.5 LoopHound Extended State (entities/enemies/LoopHound.js)
Extends Enemy with patrol-specific state:

```javascript
// Patrol Behavior
this.patrolDistance = 200         // Patrol range
this.patrolStartX = x             // Left boundary
this.patrolEndX = x + 200         // Right boundary
this.spawnX = x                   // Respawn position
this.spawnY = y                   // Respawn position

// Custom State Recording (implements getStateForRecording/setStateFromRecording)
{
  // Standard TemporalState fields
  x, y, velocityX, velocityY, animation, active, visible,
  
  // Extended fields
  health,                         // Current health
  bodyEnable,                     // Physics body enabled state
  direction,                      // Movement direction
  isFrozen,                       // Freeze state
  patrolStartX, patrolEndX,       // Patrol boundaries
  state                          // State machine current state
}
```

**Time Reversal**: LoopHound's custom recording preserves patrol boundaries and AI state that the base TemporalState would lose.

### 17.6 ChronoPulse State (entities/ChronoPulse.js)
Extends Entity with ability-specific state:

```javascript
// Configuration
this.cooldown = 3000              // Cooldown in ms
this.range = 150                  // Effect range in pixels
this.duration = 1000              // Effect duration in ms

// Runtime State
this.lastActivationTime = 0       // Timestamp of last activation
this.animationTimeline = null     // GSAP timeline reference
this.shockwaveGraphics = null     // Visual effect graphics object
this.gsapLib                      // GSAP library reference
```

**Time Reversal**: ChronoPulse does **not** implement custom state recording – it relies on the base TemporalState. Cooldown timing is recalculated from `scene.time.now` during `canActivate()`.

### 17.7 Platform State (entities/Platform.js)
Extends Entity with platform-specific state:

```javascript
// Platform Configuration
this.width = 64                   // Platform width
this.height = 64                  // Platform height
this.textureKey = 'tiles'         // Atlas key
this.frameKey = 'terrain_grass_block_center' // Frame key from atlas
this.isFullBlock = false          // Whether to use full sprite hitbox
this.platformType = 'static'      // Type: 'static'|'moving'|'breakable'|'bouncy'|'conveyor'
this.movementConfig = null        // Movement configuration for moving platforms
this.properties = {}              // Additional platform properties

// Movement State (for moving platforms)
this.currentPathIndex = 0         // Current position in movement path
this.pathProgress = 0             // Progress along current path segment
this.isMoving = false             // Whether platform is currently moving

// Custom State Recording (implements getStateForRecording/setStateFromRecording)
{
  // Standard TemporalState fields
  x, y, velocityX, velocityY, animation, active, visible,
  
  // Platform-specific fields
  currentPathIndex,               // Movement path index
  pathProgress,                   // Path segment progress
  isMoving                        // Movement state
}
```

**Time Reversal**: Platform implements custom state recording to preserve movement state and path progress that the base TemporalState would lose.

**Platform Types**:
- **Static**: Standard immovable platform
- **Moving**: Platform that moves along a configurable path
- **Breakable**: Platform that can be destroyed (future implementation)
- **Bouncy**: Platform that bounces entities (future implementation)
- **Conveyor**: Platform that moves entities (future implementation)

### 17.8 TimeManager State (systems/TimeManager.js)
The central time reversal system state:

```javascript
// Core State
this.stateBuffer = []             // Array of recorded frames
this.isRewinding = false          // Whether currently rewinding
this.managedObjects = new Set()   // Objects being tracked
this.lastRecordTime = 0           // Timestamp of last recording
this.recordInterval = 50          // Recording frequency in ms
this.playbackTimestamp = 0        // Current playback position

// Visual Effects
this._rewindOverlay = null        // Blue overlay graphics object
this._rewindActive = false        // Whether visual effects are active
```

**State Buffer Structure**:
```javascript
[
  {
    timestamp: number,             // Absolute time of this frame
    states: [                      // Array of object states
      {
        target: GameObject,        // Reference to the object
        state: TemporalState       // State data (or custom object)
      }
    ]
  }
]
```

### 17.9 State Recording Contracts

#### Objects with Custom Recording
- **LoopHound**: Implements `getStateForRecording()` and `setStateFromRecording()`
- **Platform**: Implements `getStateForRecording()` and `setStateFromRecording()` for movement state
- **Future entities**: Should implement these methods if they have state beyond the base TemporalState

#### Objects with Default Recording  
- **Player**: Uses base TemporalState (dash timing recalculated)
- **Enemy**: Uses base TemporalState (freeze timing recalculated)  
- **ChronoPulse**: Uses base TemporalState (cooldown recalculated)
- **Coin**: Uses base TemporalState

#### State Restoration Rules
1. **Position & Velocity**: Always restored exactly
2. **Animation**: Restored if animation key exists
3. **Lifecycle Flags**: `active` and `visible` always restored
4. **Custom Flags**: `isActive` synced with `active` during restoration
5. **Timing Variables**: Recalculated from `scene.time.now` (not recorded)
6. **Physics Body**: `body.enable` restored for objects that track it

#### Testing Implications
- **Unit Tests**: Must mock `scene.time.now` to test timing-dependent logic
- **Integration Tests**: Must ensure state recording/restoration works correctly
- **Mock Objects**: Must implement the same state contracts as real objects

---

### How to update this document
* When you purposefully change an invariant, **edit this file in the same pull-request** and explain why the change is safe.  
* Run `npm test` locally – a large portion of the suite guards against these invariants implicitly.

---

_This file lives in `agent_docs/invariants.md` so that LLM-powered tools can index it quickly alongside other architectural docs._ 