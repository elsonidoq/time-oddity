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
5. **Invulnerability contract:** After taking damage, the player becomes invulnerable for `invulnerabilityDuration` ms (default 2000ms). During this period, further damage is ignored and the timer is reset on each new damage attempt. Invulnerability state (`isInvulnerable`, `invulnerabilityTimer`) is recorded/restored by TimeManager for rewind compatibility.

---

## 7. TimeManager Rewind System
1. A snapshot is recorded **every 50 ms** (`recordInterval`). Lowering increases memory; increasing breaks smooth rewind tests.
2. Any object registered with `TimeManager` must either:
   * implement `getStateForRecording()` **and** `setStateFromRecording(state)`, **or**  
   * expose **at minimum**: `x`, `y`, `body.velocity.{x,y}`, `anims.currentAnim.key`, `active`, `visible`.
3. During rewind `body.setAllowGravity(false)` is called – objects should not immediately re-enable gravity on their own.
4. Visual rewind overlay is created with depth **1000** and uses a red color (0xff0000) for both the overlay and camera tint during rewind; adding UI above this depth will hide it.
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
1. Floor is at y=0; positive y is down. All platform and entity y-coordinates are measured from the top of the scene (0) downwards.
2. Player spawn is configurable per-level via a top-level `playerSpawn` object in the level JSON. If not present, the player spawns just above the lowest ground platform.
3. Scene height and width are inferred from the platform configuration: width is the maximum (x + width) of any platform, height is the maximum y of any platform. No hardcoded scene dimensions or magic numbers for ground/floor are allowed.
4. All previous references to y=656 as ground/floor are obsolete and must not be used in new code or tests.

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
| Scene.events | `levelCompleted` | `GameScene` (on player-goal overlap) | UIScene, tests (level-complete overlay) |

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
this.dashDuration = 240           // Dash duration in ms (doubled from 120ms)
this.dashSpeed = 1000             // Dash velocity
this.dashTimer = 0                // Absolute time when dash becomes available
this.canDash = true               // Whether dash is currently allowed
this.isDashing = false            // Whether currently dashing

// Invulnerability System
this.isInvulnerable = false       // Whether player is currently invulnerable
this.invulnerabilityTimer = 0     // Timestamp when invulnerability expires
this.invulnerabilityDuration = 2000 // Duration of invulnerability in ms

// State Machine
this.stateMachine                 // Current state: 'idle'|'run'|'jump'|'fall'|'dash'
this._wasRewinding = false        // Previous rewind state for transition handling

// Abilities
this.chronoPulse                  // ChronoPulse instance
this.ghostPool                    // ObjectPool for dash trail effects
```

**Time Reversal**: Dash timing variables (`dashTimer`, `canDash`) are **not** recorded by TimeManager – they are recalculated from `scene.time.now` during state restoration. Invulnerability state (`isInvulnerable`, `invulnerabilityTimer`) **is** recorded/restored by TimeManager for rewind compatibility.

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
this._rewindOverlay = null;        // Red overlay graphics object
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

## 19. Game Over Overlay Invariants

1. When the GameOverScene is launched (as an overlay using scene.launch), the following invariants apply:
   - The GameScene continues rendering and updating in the background, but all player input is disabled except for time reversal (rewind).
   - The player's InputManager exposes an `inputsDisabled` flag. When true, all movement, dash, jump, and Chrono Pulse inputs are ignored (getters return false), but `isRewindPressed` remains functional.
   - The GameOver overlay is always rendered above the level and UI overlays, with a depth of 1002.
   - When the overlay is closed (restart or return to menu), the `inputsDisabled` flag is reset to false, restoring normal input behavior.

2. The GameOverScene must never be started with `scene.start` (which would replace GameScene), but always with `scene.launch` (which overlays it).

---

## 20. Death Time Reversal System Invariants

### 20.1 Death Event Emission Contract
1. **Death event suppression during rewind**: The `playerDied` event must **never** be emitted while `TimeManager.isRewinding` is true. This prevents duplicate death events during time reversal.
2. **Single death event per death**: The `_deathEventEmitted` flag in Player prevents duplicate death events. This flag is reset only when health is restored above 0 via time reversal.
3. **Death event data structure**: The `playerDied` event must include `{ player: Player }` as the event data for proper scene handling.

### 20.2 GameScene Death State Tracking
1. **Death timestamp recording**: `_deathTimestamp` must be set to `this.time.now` when the `playerDied` event is received, regardless of rewind state.
2. **Game over trigger prevention**: `_gameOverTriggered` flag prevents multiple GameOverScene launches. This flag is reset when rewinding past death.
3. **Scene launch conditions**: GameOverScene is only launched if:
   - Not currently rewinding (`!this.timeManager?.isRewinding`)
   - Not already triggered (`!this._gameOverTriggered`)
   - GameOverScene is not already active (`!gameOverSceneInstance.gameOverActive`)

### 20.3 GameOverScene Overlay Contract
1. **Overlay depth**: GameOverScene overlay must be rendered at depth **1002** (above the rewind overlay at 1000).
2. **Input management**: During GameOverScene overlay, all player inputs except rewind must be disabled via `InputManager.inputsDisabled = true`.
3. **Scene dismissal methods**: GameOverScene must support both manual dismissal (`restartGame()`, `returnToMenu()`) and rewind dismissal (`handleRewindDismissal()`).
4. **Overlay cleanup**: The `gameOverOverlay` must be properly destroyed and set to null during dismissal to prevent memory leaks.

### 20.4 Time Reversal Death Handling
1. **Rewind death detection**: `handleRewindDeath()` must check if current rewind time is less than `_deathTimestamp` to detect when rewinding past death.
2. **State reset on rewind**: When rewinding past death, the following must be reset:
   - `_gameOverTriggered = false`
   - `_deathTimestamp = null`
   - `player._deathEventEmitted = false`
3. **Scene dismissal coordination**: GameOverScene must be dismissed via `handleRewindDismissal()` when rewinding past death.

### 20.5 Player Death State Recording
1. **Death event flag recording**: The `_deathEventEmitted` flag must be included in Player's `getStateForRecording()` and `setStateFromRecording()` for time reversal compatibility.
2. **Health restoration reset**: When health is restored above 0 via time reversal, `_deathEventEmitted` must be reset to `false` to allow future death events.
3. **Invulnerability compatibility**: Death state recording must preserve invulnerability state (`isInvulnerable`, `invulnerabilityTimer`) for proper time reversal.

### 20.6 InputManager Death Integration
1. **Input disabled flag**: `InputManager.inputsDisabled` must be set to `true` when GameOverScene is active, preventing all movement, dash, jump, and Chrono Pulse inputs.
2. **Rewind input preservation**: Even when `inputsDisabled` is true, `isRewindPressed` must remain functional to allow time reversal.
3. **Input restoration**: `inputsDisabled` must be reset to `false` when GameOverScene is dismissed (either manually or via rewind).

### 20.7 TimeManager Death State Compatibility
1. **Death state recording**: TimeManager must properly record and restore Player's death state, including `_deathEventEmitted` flag.
2. **Scene state coordination**: TimeManager must coordinate with GameScene's death tracking to ensure proper state restoration during rewind.
3. **Event suppression**: TimeManager's rewind state must be checked before any death-related events are emitted.

### 20.8 Death Time Reversal State Structures

#### 20.8.1 Player Death State Extensions
```javascript
// Additional properties in Player state recording
{
  // ... existing TemporalState fields ...
  _deathEventEmitted: boolean,    // Prevents duplicate death events
  isInvulnerable: boolean,        // Invulnerability state
  invulnerabilityTimer: number    // Invulnerability expiration time
}
```

#### 20.8.2 GameScene Death Tracking State
```javascript
// GameScene death state properties
{
  _gameOverTriggered: boolean,    // Prevents multiple GameOverScene launches
  _deathTimestamp: number|null    // Timestamp when player died
}
```

#### 20.8.3 GameOverScene Overlay State
```javascript
// GameOverScene overlay state
{
  gameOverActive: boolean,        // Whether overlay is currently active
  gameOverOverlay: Container|null, // Overlay graphics container
  player: Player|null             // Reference to player for input management
}
```

#### 20.8.4 InputManager Death Integration State
```javascript
// InputManager death integration
{
  inputsDisabled: boolean         // When true, all inputs except rewind are ignored
}
```

### 20.9 Death Time Reversal Testing Contracts
1. **Event emission testing**: Tests must verify that `playerDied` events are not emitted during rewind.
2. **Scene dismissal testing**: Tests must verify that GameOverScene is properly dismissed when rewinding past death.
3. **State restoration testing**: Tests must verify that death state is correctly recorded and restored by TimeManager.
4. **Input management testing**: Tests must verify that player inputs are properly disabled/enabled during death and rewind.
5. **Overlay cleanup testing**: Tests must verify that GameOverScene overlay is properly destroyed during dismissal.

### 20.10 Death Time Reversal Event Flow
1. **Death Event Flow**:
   - Player takes fatal damage → `takeDamage()` → `_deathEventEmitted = true` → `playerDied` event (if not rewinding)
   - GameScene receives `playerDied` → sets `_deathTimestamp` and `_gameOverTriggered` → launches GameOverScene
   - GameOverScene activates → disables player inputs → shows overlay

2. **Rewind Death Flow**:
   - TimeManager rewinds → `handleRewindDeath()` checks timestamp → dismisses GameOverScene
   - GameOverScene dismissed → restores player inputs → cleans up overlay
   - Player state restored → `_deathEventEmitted` reset if health > 0

3. **State Recording Flow**:
   - TimeManager records state → includes `_deathEventEmitted` flag
   - TimeManager restores state → resets `_deathEventEmitted` if health restored above 0

---

## 21. Time Reversal Audio Effects System Invariants

### 21.1 AudioManager Time Reversal State (systems/AudioManager.js)
The AudioManager extends its state to support time reversal sound effects:

```javascript
// Time Reversal Audio State
this._rewindStartSound = Howl|null    // Sound effect for rewind start
this._rewindEndSound = Howl|null      // Sound effect for rewind end  
this._isRewindAudioPlaying = boolean  // Prevents duplicate rewind audio
```

**Audio Effect Contracts**:
1. **Rewind start sound**: Plays when `TimeManager.toggleRewind(true)` is called
2. **Rewind end sound**: Plays when `TimeManager.toggleRewind(false)` is called
3. **Duplicate prevention**: `_isRewindAudioPlaying` flag prevents multiple simultaneous rewind audio
4. **Error handling**: All audio operations are wrapped in try-catch blocks for graceful failure
5. **Volume levels**: Rewind sounds use volume 0.7 for appropriate audio balance

### 21.2 TimeManager Audio Integration Contract
The TimeManager integrates with AudioManager for time reversal audio effects:

```javascript
// Audio integration in toggleRewind()
const audioManager = this.scene && this.scene.audioManager;

if (isRewinding) {
  // Play rewind start sound
  if (audioManager && typeof audioManager.playRewindStart === 'function') {
    try { audioManager.playRewindStart(); } catch (e) {}
  }
} else {
  // Play rewind end sound  
  if (audioManager && typeof audioManager.playRewindEnd === 'function') {
    try { audioManager.playRewindEnd(); } catch (e) {}
  }
}
```

**Audio Integration Rules**:
1. **Dynamic AudioManager access**: TimeManager always accesses `this.scene.audioManager` dynamically
2. **Method existence checks**: AudioManager methods are checked before calling to prevent errors
3. **Error isolation**: Audio errors are caught and ignored to prevent breaking time reversal
4. **Scene dependency**: Audio effects require scene to have audioManager property set

### 21.3 Time Reversal Audio Effect Contracts

#### 21.3.1 Audio Effect Timing
1. **Start sound trigger**: `playRewindStart()` is called exactly when `toggleRewind(true)` is called
2. **End sound trigger**: `playRewindEnd()` is called exactly when `toggleRewind(false)` is called
3. **No duplicate triggers**: Start sound is not called if already rewinding, end sound is not called if not rewinding
4. **Audio cleanup**: `stopRewindAudio()` is called automatically when rewind ends

#### 21.3.2 Audio Effect State Management
1. **Playing state tracking**: `_isRewindAudioPlaying` prevents multiple simultaneous rewind audio
2. **State reset**: Playing state is reset when rewind ends or audio is stopped
3. **Audio instance management**: Howl instances are created once in constructor, reused for all plays
4. **Error recovery**: Missing audio files or Howl errors do not break time reversal functionality

#### 21.3.3 Audio Effect Integration with Existing Systems
1. **Non-interference**: Time reversal audio does not interfere with background music or other SFX
2. **Mute compatibility**: Audio effects respect global mute state via Howler.mute()
3. **Scene lifecycle**: Audio effects work correctly during scene transitions and game pause/resume
4. **Performance**: Audio effects are lightweight and do not impact time reversal performance

### 21.4 Time Reversal Audio Testing Contracts
1. **Unit testing**: AudioManager methods must be tested for proper state management and error handling
2. **Integration testing**: TimeManager audio integration must be tested for proper method calls
3. **Mock requirements**: Howler.js must be mocked for all audio-related tests
4. **Error testing**: Tests must verify graceful handling of audio failures and missing files

### 21.5 Audio Effect File Requirements
1. **File paths**: Audio files must be located at `/src/assets/audio/sfx_rewind_start.ogg` and `/src/assets/audio/sfx_rewind_end.ogg`
2. **Format**: Audio files must be in OGG format for cross-browser compatibility
3. **Duration**: Audio files should be short (< 2 seconds) to avoid overlapping with gameplay
4. **Volume balance**: Audio files should be normalized to work with volume 0.7 setting

### 21.6 Time Reversal Audio State Structures

#### 21.6.1 AudioManager Time Reversal State Extensions
```javascript
// Additional properties in AudioManager for time reversal
{
  // ... existing AudioManager state ...
  _rewindStartSound: Howl|null,      // Time reversal start sound effect
  _rewindEndSound: Howl|null,        // Time reversal end sound effect
  _isRewindAudioPlaying: boolean     // Prevents duplicate rewind audio
}
```

#### 21.6.2 TimeManager Audio Integration State
```javascript
// TimeManager audio integration (no new properties, uses existing scene.audioManager)
{
  // No new properties - uses dynamic access to scene.audioManager
  // Audio integration is handled in toggleRewind() method
}
```

#### 21.6.3 Audio Effect Method Contracts
```javascript
// AudioManager time reversal methods
{
  playRewindStart(): void,           // Plays rewind start sound (if not already playing)
  playRewindEnd(): void,             // Plays rewind end sound and stops rewind audio
  stopRewindAudio(): void            // Stops any currently playing rewind audio
}
```

### 21.7 Time Reversal Audio Event Flow
1. **Rewind Start Flow**:
   - Player presses rewind key → `TimeManager.toggleRewind(true)` → `AudioManager.playRewindStart()` → Howl plays start sound
   - Audio state: `_isRewindAudioPlaying = true`

2. **Rewind End Flow**:
   - Player releases rewind key → `TimeManager.toggleRewind(false)` → `AudioManager.playRewindEnd()` → Howl plays end sound
   - Audio state: `_isRewindAudioPlaying = false`

3. **Error Handling Flow**:
   - Audio operation fails → try-catch catches error → time reversal continues unaffected
   - Missing audio file → Howl creation fails → audio effects disabled gracefully

4. **State Management Flow**:
   - Multiple rewind attempts → `_isRewindAudioPlaying` prevents duplicate audio
   - Audio cleanup → `stopRewindAudio()` resets playing state and stops Howl instances

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