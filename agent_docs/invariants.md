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

---

## 11. ObjectPool Contract
1. The supplied `group` **must** be a `Phaser.GameObjects.Group` – pools do **not** create a group themselves.
2. All pooled objects must implement `setActive(bool)` and `setVisible(bool)` (standard for Sprites).
3. `release(object)` only toggles active/visible – it does **not** reset other state. Factory should handle that in `get()` if needed.

---

## 12. Moving Platform Invariants
- MovingPlatform must implement custom getStateForRecording/setStateFromRecording for perfect time reversal.
- Movement must be deterministic and restored exactly during rewind (position, movement state, path progress, timing).
- Player-carrying logic: platforms must track previous position, detect player standing, and apply movement delta after platform update.
- During rewind, collision states and platform-rider relationships must be preserved.
- SceneFactory must add moving platforms to the group before configuration.
- TimeManager must register moving platforms and call their custom state methods.
- CollisionManager must support enhanced collision for moving platforms and preserve state during rewind.

---

## 13. Level / Platform Geometry
1. Ground top pixel-row sits at **y = 656** in 720 p canvas; camera bounds & player spawn rely on this magic number.
2. `configurePlatform(platform, isFullBlock)` sets hit-box to full sprite when `isFullBlock` is `true`; altering this function may break jump/fall tests.
3. **Platform Configuration Ordering (CRITICAL)**: Platforms (including MovingPlatform instances) **MUST** be added to their physics group **BEFORE** calling `configurePlatform()` or any other physics configuration methods. Configuring platforms before adding them to the group causes the configuration to be lost when the group processes the platform. This ordering requirement applies to:
   - `configurePlatform()` calls
   - `setImmovable()`, `setAllowGravity()`, `setFriction()` physics body methods
   - Any custom physics configuration in platform constructors
   - Movement initialization that depends on physics body state

   **Correct Order**: `new Platform()` → `group.add(platform)` → `configurePlatform(platform)` → `platform.initializeMovement()`
   
   **Incorrect Order**: `new Platform()` → `configurePlatform(platform)` → `group.add(platform)` ← **Configuration gets lost**

4. **Moving Platform Player Carrying (CRITICAL)**: Phaser's Arcade Physics does **NOT** automatically carry objects on moving platforms. Moving platforms must implement manual player carrying logic:
   - **Movement Tracking**: Platforms must track `previousX` and `previousY` positions for delta calculation
   - **Collision Detection**: Use `playerBody.touching.down && platformBody.touching.up` to detect when player is standing on platform
   - **Delta Application**: Calculate movement delta (`current - previous`) and apply it to player position
   - **Update Timing**: Player carrying must happen **AFTER** platform movement in the update loop
   - **GameScene Integration**: GameScene must call `platform.carryPlayerIfStanding(player.body)` for each MovingPlatform instance

   **Required Methods**:
   - `updatePreviousPosition()` - Called after movement to store current position as previous
   - `isPlayerStandingOnTop(playerBody)` - Detects player-platform contact
   - `carryPlayerIfStanding(playerBody)` - Applies platform movement delta to player

   **GameScene Update Order**: `platform.update()` → `platform.updatePreviousPosition()` → `platform.carryPlayerIfStanding(player.body)`

5. **Coin Physics Configuration (CRITICAL)**: Coins must follow the same physics configuration order as platforms to prevent gravity from affecting them. The proper sequence is:
   - Create physics sprite: `this.scene.physics.add.sprite(x, y, texture)`
   - Set parentCoin reference: `sprite.parentCoin = this`
   - Add to physics group: `this.scene.coins.add(sprite)` 
   - **THEN** configure physics: `sprite.body.setAllowGravity(false)`
   
   **Incorrect Order**: Configure physics → Add to group ← **Configuration gets lost, coins fall**
   **Correct Order**: Create sprite → Add to group → Configure physics ← **Configuration preserved**

6. **Coin Registry Time Reversal (CRITICAL)**: The `coinsCollected` registry value is recorded in TimeManager snapshots and restored during time reversal to ensure the HUD always matches the actual world state. This ensures consistency between the number of coins visible in the scene and the registry counter.

---

## 14. Testing Assumptions
1. Jest tests rely on public method names staying **exactly the same** (e.g., `Player.simulateDashStateExecute()`).
2. Mocks replace external libraries (`phaser`, `gsap`, `howler`) – ensure new code paths do **not** require un-mocked APIs during test runs.

---

## 15. Asset & Animation Keys
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

---

## 16. Runtime Event Names
Several systems communicate via the Phaser event-emitter. These string constants are implicitly coupled to tests and other listeners:

| Emitter | Event Name | Emitted From | Expected Listeners |
|---------|------------|--------------|-------------------|
| Scene.events | `playerEnemyCollision` | `CollisionManager.setupPlayerEnemyCollision` | Combat handler in `GameScene`, tests |
| Scene.events | `enemyFrozen` / `enemyUnfrozen` | `Enemy.freeze()` / `Enemy.unfreeze()` | Visual/audio feedback to be implemented, tests |
| Scene.events | `gamePaused` | `GameScene.update()` when pause triggered | UI feedback systems, tests |
| Scene.events | `gameResumed` | `UIScene.resumeGame()` when resume triggered | Game state restoration systems, tests |

Do **not** rename these events without refactoring every `scene.events.on(...)` subscription and the test-suite.

---

## 17. Testing & Mock Integration
1. **Global mocks** for `phaser`, `gsap`, `howler`, and `matter-js` live in `tests/__mocks__` and **must stay in sync** with any new API surface you introduce.
2. Tests rely on `globalThis.createMockGameObject` to satisfy `ObjectPool` when a Phaser `Group` is absent; keep that hook or extend the mock accordingly.
3. When adding new external libraries, provide a Jest manual mock in `tests/mocks/` or tests will fail in CI.
4. **Centralized Phaser mocks** – `phaserKeyMock.js`, `phaserSceneMock.js`, and `eventEmitterMock.js` are the **single source of truth** for keyboard, scene, and event-emitter fakes.  All test files **must import these factories instead of rolling their own**.  Any change to production APIs that touches Phaser internals **requires** the corresponding mock be extended _before_ new tests are written.

---

## 18. State Structures & Time Reversal Contracts

### 18.1 Base TemporalState (systems/TemporalState.js)
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

### 18.2 Entity Base State (entities/Entity.js)
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

### 18.3 Player State (entities/Player.js)
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

### 18.4 Enemy State (entities/Enemy.js)
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

### 18.5 LoopHound Extended State (entities/enemies/LoopHound.js)
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

### 18.6 ChronoPulse State (entities/ChronoPulse.js)
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

### 18.7 TimeManager State (systems/TimeManager.js)
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

### 18.8 State Recording Contracts

#### Objects with Custom Recording
- **LoopHound**: Implements `getStateForRecording()` and `setStateFromRecording()`
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

[Moving Platform Invariants migrated from moving_platform_architecture.md]

- MovingPlatform must implement custom getStateForRecording/setStateFromRecording for perfect time reversal.
- Movement must be deterministic and restored exactly during rewind (position, movement state, path progress, timing).
- Player-carrying logic: platforms must track previous position, detect player standing, and apply movement delta after platform update.
- During rewind, collision states and platform-rider relationships must be preserved.
- SceneFactory must add moving platforms to the group before configuration.
- TimeManager must register moving platforms and call their custom state methods.
- CollisionManager must support enhanced collision for moving platforms and preserve state during rewind. 