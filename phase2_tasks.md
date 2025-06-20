# ✅ Phase 2: Core Mechanics in Code – Step-by-Step Plan

Each task below isolates one concern and is meant to be testable immediately in-browser.

---

## 🎮 Player Movement: Left and Right

### Task 1: Add `move(dir)` method to the `Player` class ✅ COMPLETED
- **Start:** Player only has `show()`
- **End:** `move(dir)` modifies `this.pos.x` by ±speed

### Task 2: Declare a movement constant `PLAYER_SPEED` in `player.js` ✅ COMPLETED
- **Start:** Speed is hardcoded or missing
- **End:** `const PLAYER_SPEED = 5;` exists near top of file

### Task 3: Define `keyPressed()` in `sketch.js` ✅ COMPLETED
- **Start:** `keyPressed()` is undefined
- **End:** Function exists and logs pressed key to console

### Task 4: Inside `keyPressed()`, handle `'ArrowLeft'` and `'ArrowRight'` ✅ COMPLETED
- **Start:** Function does not act on keys
- **End:** Calls `player.move(-1)` or `player.move(1)` correctly

### Task 5: Test: Player rectangle moves left/right with arrow keys ✅ COMPLETED
- **Start:** Player is static
- **End:** Arrow keys visibly shift player rectangle horizontally

---

## 🪂 Gravity and Vertical Physics

### Task 6: Add `this.velocity` and `this.gravity` vectors to `Player` constructor ✅ COMPLETED
- **Start:** Player has only `this.pos`
- **End:** Adds `this.velocity = createVector(0, 0)` and `this.gravity = createVector(0, 0.5)`

### Task 7: Add an `update()` method to `Player` ✅ COMPLETED
- **Start:** Method doesn't exist
- **End:** Adds gravity to velocity, and velocity to position each frame

### Task 8: Call `player.update()` inside `draw()` before `player.show()` ✅ COMPLETED
- **Start:** Update not called
- **End:** Player is affected by gravity (falls down continuously)

### Task 9: Test: Player rectangle continuously falls when game starts ✅ COMPLETED
- **Start:** Player is static
- **End:** Player falls toward bottom of canvas each frame

---

## 🦘 Jumping

### Task 10: Add `isOnGround` property or logic to `Player` class ✅ COMPLETED
- **Start:** Jumping is unrestricted
- **End:** A simple ground check is used to enable jumping only when on "floor"

### Task 11: Add jump handling to `keyPressed()` ✅ COMPLETED
- **Start:** Only horizontal keys handled
- **End:** If `key === 'ArrowUp'` and player is on ground → apply upward velocity

### Task 12: Test: Player can jump once from bottom (but not mid-air) ✅ COMPLETED
- **Start:** No jumping occurs
- **End:** Player jumps with ↑ and falls back due to gravity

---

## 🧱 Platform Class and Collision

### Task 13: Create new file `platform.js` ✅ COMPLETED
- **Start:** File doesn't exist
- **End:** `platform.js` exists and is linked in `index.html`

### Task 14: Define `Platform` class with position and size ✅ COMPLETED
- **Start:** Class is empty
- **End:** Constructor sets `this.pos` and `this.size`

### Task 15: Add `show()` method to draw the platform as a rectangle ✅ COMPLETED
- **Start:** Platform has no visual output
- **End:** `rect()` draws it at `this.pos` with `this.size`

### Task 16: In `sketch.js`, create a `platforms` array ✅ COMPLETED
- **Start:** Platforms not instantiated
- **End:** `platforms = [ new Platform(x, y, w, h), ... ]` exists globally

### Task 17: In `draw()`, call `show()` on each platform ✅ COMPLETED
- **Start:** Platforms not rendered
- **End:** Visible platforms appear on screen

### Task 18: Add basic vertical collision detection inside `Player.update()` ✅ COMPLETED
- **Start:** Player falls through platforms
- **End:** If falling and touches top of platform, vertical velocity stops and player lands

### Task 19: Clamp player position so they sit exactly on top of the platform ✅ COMPLETED
- **Start:** Player may sink or jitter
- **End:** Player y-position is adjusted precisely to platform top

### Task 20: Test: Player can land on and stay on top of platform ✅ COMPLETED
- **Start:** Player falls forever
- **End:** Player stops falling when standing on a platform

### Task 21: Test: Player can jump from ground to reach platforms ✅ COMPLETED
- **Start:** Platforms are unreachable
- **End:** Player can successfully jump from ground level to land on platforms

### Task 22: Add `keyIsDown()` checks in `draw()` for continuous movement ✅ COMPLETED
- **Start:** Player only moves once per key press
- **End:** `keyIsDown(LEFT_ARROW)` and `keyIsDown(RIGHT_ARROW)` called in `draw()`

### Task 23: Move horizontal movement logic from `keyPressed()` to `draw()` ✅ COMPLETED
- **Start:** Movement only in `keyPressed()`
- **End:** `player.move()` calls moved to `draw()` loop for smooth movement

### Task 24: Test: Player moves continuously while arrow keys are held down ✅ COMPLETED
- **Start:** Player moves only once per key press
- **End:** Player moves smoothly and continuously while keys are pressed

---

## 📏 Platform Height Adjustment

### Task 25: Lower platform positions to be more accessible ✅ COMPLETED
- **Start:** Platforms are too high to reach
- **End:** Platforms positioned at y-coordinates that allow player to jump to them

### Task 26: Test: Player can jump from ground to reach platforms
- **Start:** Platforms are unreachable
- **End:** Player can successfully jump from ground level to land on platforms

### Task 27: Test: Player can now jump from ground and land on the first platform ✅ COMPLETED
- **Start:** Player cannot reach the first platform from the ground
- **End:** Player can successfully jump from ground level and land on the first platform

---

## 🦅 Jump Height Adjustment

### Task 28: Increase the player's jump velocity in `keyPressed()` ✅ COMPLETED
- **Start:** Player's jump is too low to reach the first platform
- **End:** The value assigned to `player.velocity.y` when jumping is more negative (e.g., `-15`)

---

## 🛑 Platform Collision Robustness

### Task 29: Refine collision logic in `Player.update()` to prevent passing through platforms ✅ COMPLETED
- **Start:** Player sometimes passes through platforms when landing
- **End:** Collision detection checks both current and next position, and only allows landing if the player is above and moving downward

### Task 30: Adjust player position and velocity to clamp exactly on top of the platform ✅ COMPLETED
- **Start:** Player may sink into or jitter through the platform
- **End:** Player's y-position is set to the platform top and vertical velocity is set to zero upon landing

### Task 31: Test: Player reliably lands and stays on top of platforms without passing through ✅ COMPLETED
- **Start:** Player can pass through platforms
- **End:** Player always lands and remains on top of platforms when falling onto them

---

## 🧪 End of Phase 2 Check

By completing all 31 tasks:
- The player can move horizontally and jump
- Gravity pulls the player down
- Platforms exist and prevent falling through
- Player can land on platforms and jump from them
- Player moves continuously while keys are held down
- Platforms are positioned at reachable heights

---

```bash
🌐 Test: Open `index.html` in a browser
🧪 Expected:
- Player falls due to gravity
- Arrow keys move player left/right continuously
- Up arrow makes player jump if on platform
- Player lands correctly on platform(s)
- Player can reach all platforms by jumping from ground
```

Let me know if you want Phase 3 structured like this next (2D arrays, enemies, collectibles).

---

```bash
🌐 Test: Open `