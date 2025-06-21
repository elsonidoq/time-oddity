# Phase 2 – Granular Task List (Pause Mechanic)

This list is designed for an engineering LLM to execute one task at a time. Each task is atomic, testable, and focuses on a single concern, ensuring alignment with the project's architecture and script.

---

### 🧠 Part 1: State Management Setup

1.  **DONE: Create the global state file.**
    -   **Action:** Create a new file at `src/state/store.js`.
    -   **Content:** Initialize it with an empty, exported object: `export const store = {};`.
    -   **Test:** The file exists and can be imported in another file without error.

2.  **DONE: Define pause-related state properties.**
    -   **Action:** In `src/state/store.js`, add `isPaused` (boolean, `false`), `pauseCooldown` (number, `5000`), and `lastPauseTimestamp` (number, `0`) to the `store` object.
    -   **Test:** In the browser's developer console, import `store` and verify the properties and their default values are accessible.

---

### ⏱️ Part 2: Core Pause System

3.  **DONE: Create the `TimeManager` system file.**
    -   **Action:** Create a new file at `src/systems/TimeManager.js`.
    -   **Content:** Define and export an empty `TimeManager` class: `export default class TimeManager {}`.
    -   **Test:** The file exists and the class can be imported.

4.  **DONE: Instantiate `TimeManager` in the main game scene.**
    -   **Action:** In `Act1Scene.js`, import `TimeManager` and create a new instance in the `create()` method: `this.timeManager = new TimeManager(this);`.
    -   **Test:** The game runs, and logging `this.timeManager` in the `create()` method of `Act1Scene.js` shows a `TimeManager` object.

5.  **DONE: Implement the `togglePause` method.**
    -   **Action:** In `TimeManager.js`, add a method `togglePause()`. It should import the `store` and flip the boolean value of `store.isPaused`. Add `console.log(store.isPaused);` inside.
    -   **Test:** Calling `this.timeManager.togglePause()` from the browser console correctly logs `true`, then `false` on a subsequent call.

6.  **DONE: Bind the 'P' key to the pause system.**
    -   **Action:** In `Act1Scene.js`'s `create()` method, add a keyboard listener for the 'P' key. On keydown, it should call `this.timeManager.togglePause()`.
    -   **Test:** Running the game and pressing the 'P' key produces the `true`/`false` console log from the previous step.

7.  **DONE: Add cooldown logic to `togglePause`.**
    -   **Action:** In `TimeManager.js`, modify `togglePause()` to only execute if `Date.now() - store.lastPauseTimestamp > store.pauseCooldown`. If it does, update `store.lastPauseTimestamp = Date.now()`.
    -   **Test:** Pressing 'P' repeatedly only logs the `true`/`false` message once every 5 seconds.

---

### 👾 Part 3: Pausing a Game Object

8.  **DONE: Create the `SecondHander` enemy class.**
    -   **Action:** Create a new file: `src/objects/SecondHander.js`.
    -   **Content:** Define a class `SecondHander` that extends `Phaser.GameObjects.Rectangle`. The constructor should call `super()` and set a size (e.g., 20x60) and color (e.g., purple `0x8e44ad`).
    -   **Test:** The class can be imported into `Act1Scene.js` without error.

9.  **DONE: Add a `SecondHander` instance to the scene.**
    -   **Action:** In `Act1Scene.js`, import `SecondHander` and instantiate it in `create()` at position (400, 300). Store it as `this.secondHander`.
    -   **Test:** A purple rectangle appears in the scene.

10. **DONE: Enable physics for the `SecondHander`.**
    -   **Action:** In `Act1Scene.js`, enable physics for the new object (`this.physics.add.existing(this.secondHander);`) and make it collide with the `platforms` group (`this.physics.add.collider(this.secondHander, this.platforms);`).
    -   **Test:** The enemy now falls and lands on a platform instead of passing through it.

11. **DONE: Implement basic `SecondHander` movement.**
    -   **Action:** In `SecondHander.js`, add an `update()` method that sets a constant horizontal velocity: `this.body.setVelocityX(100);`. In `Act1Scene.js`'s `update()` loop, call `this.secondHander.update();`.
    -   **Test:** The enemy begins moving horizontally as soon as the scene starts.

12. **DONE: Make the `SecondHander` respect the pause state.**
    -   **Action:** In `SecondHander.js`'s `update()` method, import the `store`. Wrap the movement logic in `if (!store.isPaused)`. If paused, explicitly set velocity to zero: `this.body.setVelocityX(0);`.
    -   **Test:** Pressing 'P' stops the enemy's movement completely. Pressing it again (after cooldown) resumes its movement.

---

### 📊 Part 4: UI Feedback

13. **DONE: Create the `ClockHUD` scene file.**
    -   **Action:** Create a new file: `src/ui/ClockHUD.js`.
    -   **Content:** Define and export a class `ClockHUD` extending `Phaser.Scene` with the scene key `'ClockHUD'`.
    -   **Test:** The file and class exist and can be imported into `main.js`.

14. **DONE: Register and launch the `ClockHUD` scene.**
    -   **Action:** In `src/client/js/main.js`, import and add `ClockHUD` to the `scene` array in the game config. In `Act1Scene.js`'s `create()` method, launch it: `this.scene.launch('ClockHUD');`.
    -   **Test:** The game runs with no errors, which confirms the scene was registered and launched successfully.

15. **DONE: Draw the static cooldown timer background.**
    -   **Action:** In `ClockHUD.js`'s `create()` method, draw a `Phaser.GameObjects.Arc` in the top-right corner. Make it a complete, filled, dark grey circle. This is the timer's backing.
    -   **Test:** A static grey circle is visible in the corner of the screen during gameplay.

16. **DONE: Draw the animated cooldown timer foreground.**
    -   **Action:** In `ClockHUD.js`'s `create()` method, draw a second, slightly smaller `Arc` directly on top of the first one. Make it a different color (e.g., light blue). This will be the animated "pie" indicator.
    -   **Test:** The blue circle appears on top of the grey one.

17. **DONE: Animate the cooldown timer.**
    -   **Action:** In `ClockHUD.js`, create an `update()` method. Import the `store`. Calculate cooldown progress (`(Date.now() - store.lastPauseTimestamp) / store.pauseCooldown`) and set the blue arc's `angle` property to `360 * progress`, capped between 0 and 360.
    -   **Test:** After pressing 'P', the blue arc animates from a sliver back to a full circle over 5 seconds.

18. **DONE: Add visual feedback to the player for pause activation.**
    -   **Action:** In `Act1Scene.js`, find the 'P' key listener. Inside the cooldown check, add a tween that makes `this.tess` flash alpha for a split second (e.g., `this.tweens.add({ targets: this.tess, alpha: 0.5, duration: 100, yoyo: true });`).
    -   **Test:** Tess flashes only when the pause is successfully triggered (i.e., not during the cooldown period).

---

### ✅ Part 5: Validation

19. **DONE: Playtest the complete mechanic.**
    -   **Action:** Run the game and start Act 1.
    -   **Test:**
        1. The `SecondHander` enemy moves correctly.
        2. Pressing 'P' makes Tess flash, stops the enemy, and starts the UI clock animation.
        3. Pressing 'P' during the cooldown period does nothing.
        4. When the UI clock is full, pressing 'P' works again, and the enemy unpauses.
    -   **Deliverable:** The pause mechanic is fully functional with all intended feedback systems working in concert.