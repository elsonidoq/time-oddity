# Time Oddity – MVP Plan (Act I, No Music, Placeholder Art)

## 🎯 MVP Scope

- **Playable Act I ("The Pause")**
- **Basic character control and physics**
- **Pause mechanic implemented**
- **Enemies and platforms with geometric placeholders**
- **HUD displaying cooldowns**
- **All assets and code structured for replacement**
- **No music or animations yet, but hooks exist for them**

---

## 🧩 Phase 1 – Foundation Setup

**Goal:** Boot the game, render a placeholder scene, and control a test character.

### Tasks:
1. **Initialize Project**
   - Set up `vite`, `phaser`, and basic `vite.config.js`.
   - Folder structure scaffolded as per architecture.

2. **Create Entry Files**
   - `index.html` with canvas mount.
   - `main.js` to boot Phaser with config.

3. **BootScene and MenuScene**
   - `BootScene.js` for loading placeholder assets.
   - `MenuScene.js` showing a static “Start Game” button (use `Phaser.GameObjects.Text`).

4. **Placeholder Tess Setup**
   - `Tess.js`: render a blue rectangle using `Phaser.GameObjects.Rectangle`.
   - Add simple left/right/jump controls using `cursor keys`.

5. **Basic Scene Template**
   - `Act1Scene.js` with a test platform (grey rectangle), gravity, and player collision.

✅ **Deliverable:** A square "Tess" runs and jumps on rectangles.

---

## 🧩 Phase 2 – Implement Pause Mechanic

**Goal:** Add time pause feature and visual feedback using placeholders.

### Tasks:
1. **Pause Logic in TimeManager**
   - Detect key (e.g. SPACEBAR) and trigger freeze effect on enemies and hazards.
   - Implement cooldown logic in `store.js`.

2. **Apply Pause to Entities**
   - Modify enemy update loops to respect a `paused` flag.
   - Introduce visual placeholder feedback (e.g., a white outline glow on paused objects).

3. **Cooldown System**
   - `ClockHUD.js`: Draw a circular timer using `Phaser.GameObjects.Arc`.
   - Sync cooldown values to `state/store.js`.

4. **UI Feedback**
   - Flash Tess with a color tint or scale when Pause is triggered.

✅ **Deliverable:** Pause mechanic works on hazards and cooldown is displayed.

---

## 🧩 Phase 3 – Act I Level Mechanics

**Goal:** Create Act I level layout and basic hazards with placeholder assets.

### Tasks:
1. **Level Layout**
   - Add static platforms (rectangles).
   - Add falling debris platforms (red rectangles that fall unless paused).

2. **Hazards**
   - Implement **Second Handers** as clock-hand-shaped red lines rotating on pivots.
   - On pause, stop their rotation and use them as bridges.

3. **Checkpoint & Goal**
   - Implement a simple level goal (e.g., green square).
   - Respawn on failure.

4. **Camera Follow**
   - Basic camera logic to follow Tess smoothly across the scene.

✅ **Deliverable:** A complete level with Pause-interactive hazards and clear win condition.

---

## 🧩 Phase 4 – Modular Object + System Hooks

**Goal:** Ensure all placeholder systems are abstracted to enable future replacement with real assets.

### Tasks:
1. **Object Factory Wrappers**
   - All enemies, Tess, platforms use constructors that can swap out shapes for sprites later (via a config object).

2. **Animation Hooks**
   - `AnimationSystem.js`: placeholder GSAP timelines triggered on actions, e.g., pulse on Pause.
   - No actual animations yet, but the infrastructure is built.

3. **Asset Injection Points**
   - Designate placeholder art IDs to be replaced later.
   - Document which shapes will be replaced by which sprite types (in comments or config).

4. **Central Scene Switcher**
   - Modularize transitions between scenes (e.g., `SceneRouter.js`) so cutscenes or transitions can be added later without refactor.

✅ **Deliverable:** System modularity and placeholder-ready structure complete for future content drop-in.

---

## 🧩 Phase 5 – Final Polish + QA

**Goal:** Finalize polish for MVP, fix bugs, and prepare for asset swap.

### Tasks:
1. **Debug & Polish**
   - Playtest and fine-tune player movement and jump arcs.
   - Tune Pause duration and cooldown balance for feel.

2. **Fallbacks for Missing Features**
   - No music: add toggles in AudioManager to simulate layering off.
   - No art: clearly label placeholder shapes via comments or overlays (e.g., "Second Hander").

3. **Responsive Controls**
   - Add touch/mobile input support via `InputHandler.js`.

4. **Basic Save Stub**
   - Implement a savepoint API route (`POST /save`) in `routes.js`.
   - No actual data persistence yet; dummy response only.

5. **README + Replacement Instructions**
   - Document all placeholder files and what to replace later.

✅ **Deliverable:** MVP of *Time Oddity: Act I* running smoothly with geometric placeholders and full extensibility.

---

## ✅ Summary Checklist

| Feature                      | Implemented in MVP |
|-----------------------------|---------------------|
| Act I Scene                 | ✅                  |
| Tess (Placeholder)         | ✅                  |
| Pause Mechanic             | ✅                  |
| Second Handers             | ✅                  |
| Falling Debris             | ✅                  |
| HUD                        | ✅                  |
| Scene Structure            | ✅                  |
| Placeholder Graphics       | ✅                  |
| Modular Asset Design       | ✅                  |
| No Music (but hook ready)  | ✅                  |

---

Let me know if you'd like this plan transformed into issue tickets for GitHub or Asana, or if you want a Phase 6 to include Echo scaffolding for future dev.
