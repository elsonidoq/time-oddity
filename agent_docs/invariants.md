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

## 12. Level / Platform Geometry
1. Ground top pixel-row sits at **y = 656** in 720 p canvas; camera bounds & player spawn rely on this magic number.
2. `configurePlatform(platform, isFullBlock)` sets hit-box to full sprite when `isFullBlock` is `true`; altering this function may break jump/fall tests.

---

## 13. Testing Assumptions
1. Jest tests rely on public method names staying **exactly the same** (e.g., `Player.simulateDashStateExecute()`).
2. Mocks replace external libraries (`phaser`, `gsap`, `howler`) – ensure new code paths do **not** require un-mocked APIs during test runs.

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

---

## 15. Runtime Event Names
Several systems communicate via the Phaser event-emitter. These string constants are implicitly coupled to tests and other listeners:

| Emitter | Event Name | Emitted From | Expected Listeners |
|---------|------------|--------------|-------------------|
| Scene.events | `playerEnemyCollision` | `CollisionManager.setupPlayerEnemyCollision` | Combat handler in `GameScene`, tests |
| Scene.events | `enemyFrozen` / `enemyUnfrozen` | `Enemy.freeze()` / `Enemy.unfreeze()` | Visual/audio feedback to be implemented, tests |

Do **not** rename these events without refactoring every `scene.events.on(...)` subscription and the test-suite.

---

## 16. Testing & Mock Integration
1. **Global mocks** for `phaser`, `gsap`, `howler`, and `matter-js` live in `tests/__mocks__` and **must stay in sync** with any new API surface you introduce.
2. Tests rely on `globalThis.createMockGameObject` to satisfy `ObjectPool` when a Phaser `Group` is absent; keep that hook or extend the mock accordingly.
3. When adding new external libraries, provide a Jest manual mock in `tests/mocks/` or tests will fail in CI.

---

### How to update this document
* When you purposefully change an invariant, **edit this file in the same pull-request** and explain why the change is safe.  
* Run `npm test` locally – a large portion of the suite guards against these invariants implicitly.

---

_This file lives in `agent_docs/invariants.md` so that LLM-powered tools can index it quickly alongside other architectural docs._ 