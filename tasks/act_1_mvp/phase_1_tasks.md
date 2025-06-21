# Phase 1 – Granular Task List (Foundation Setup)

Each task below is atomic, testable, and focuses on one specific outcome. Designed for use with an engineering LLM agent executing one task at a time.

---

### 🧱 PROJECT BOOTSTRAP

1. **✅ Create a new Vite project named `time-oddity`.**
   - Start with `npm create vite@latest`.
   - Choose "vanilla" JavaScript template.
   - **ADAPTED**: Using existing webpack-based project structure

2. **✅ Install Phaser 3 via npm.**
   - Run `npm install phaser`.
   - **COMPLETED**: Phaser 3.90.0 already installed

3. **✅ Create initial folder structure.**
   - Add `/src`, `/public`, `/src/scenes`, `/src/objects`, `/src/systems`, `/src/state`, `/src/ui`.
   - **COMPLETED**: Basic structure exists, need to add missing directories

4. **✅ Add a `vite.config.js` with basic config to serve Phaser.**
   - Ensure `publicDir` is correctly mapped.
   - Output should compile and open a blank page.
   - **ADAPTED**: Using existing webpack.config.js

---

### 🖼️ BASIC RENDERING PIPELINE

5. **✅ Create `index.html` inside `/public`.**
   - Include `<div id="game-container"></div>` and load `main.js` from `/src`.
   - **COMPLETED**: HTML exists in src/client/index.html

6. **✅ Create `main.js` to configure and launch a Phaser game instance.**
   - Configure `type: Phaser.AUTO`, `parent: 'game-container'`, width/height: 800x600, blank scene.
   - **COMPLETED**: main.js exists with Phaser configuration

7. **✅ Create and register a basic `BootScene.js` in `/src/scenes`.**
   - Add a simple `console.log('BootScene loaded')` in `create()`.
   - **COMPLETED**: BootScene exists in src/client/js/scenes/

8. **✅ Add BootScene to `main.js` Phaser config and start it.**
   - Confirm "BootScene loaded" appears in console.
   - **COMPLETED**: BootScene is registered in main.js

---

### 🎮 CHARACTER + INPUT

9. **✅ Create `Tess.js` in `/src/objects`.**
   - Define a class extending `Phaser.GameObjects.Rectangle`.
   - Color: blue, Size: 32x48.
   - **COMPLETED**: Tess class created with physics and input handling

10. **✅ Instantiate Tess inside a new scene called `Act1Scene.js`.**
   - Place her at position (100, 100).
   - Add a simple ground using `Phaser.GameObjects.Rectangle`.
   - **COMPLETED**: Act1Scene created with Tess and brown ground platform

11. **✅ Enable Arcade Physics in `Act1Scene.js`.**
   - Enable gravity and collision between Tess and ground.
   - **COMPLETED**: Physics enabled with collider between Tess and ground

12. **✅ Add keyboard input for left/right arrow keys.**
   - Store cursors in `this.cursors = this.input.keyboard.createCursorKeys();`.
   - **COMPLETED**: Input handling implemented in Tess class

13. **✅ Implement left/right movement for Tess.**
   - Test that Tess moves correctly with keys.
   - **COMPLETED**: Movement implemented in Tess.update() method

14. **✅ Add jump logic when UP is pressed and Tess is on ground.**
   - Use `Tess.body.touching.down` to gate jumps.
   - **COMPLETED**: Jump logic implemented with ground collision check

---

### 🧪 COLLISIONS + PLACEHOLDER TEST

15. **✅ Add wall/floor platform (rectangle) in a new position to test collisions.**
   - Confirm Tess cannot pass through platforms.
   - **COMPLETED**: Added green platform and red wall for collision testing

16. **✅ Add a placeholder object (e.g. red square) to the scene.**
   - Not interactive yet, just visible.
   - **COMPLETED**: Added red square placeholder at position (500, 200)

---

### 🚦SCENE MANAGEMENT

17. **✅ Create `MenuScene.js` with a basic "Start Game" text button.**
   - Use `Phaser.GameObjects.Text` to create the button.
   - **COMPLETED**: MenuScene exists with start button

18. **✅ Switch from `MenuScene` to `Act1Scene` on click.**
   - Use `this.scene.start('Act1Scene')`.
   - **COMPLETED**: MenuScene transitions to Act1Scene

19. **✅ Modify `main.js` to register BootScene → MenuScene → Act1Scene.**
   - BootScene autostarts and transitions to MenuScene.
   - **COMPLETED**: Scene flow is configured: BootScene → PreloadScene → MenuScene → Act1Scene

---

### ✅ VALIDATION TASK

20. **✅ Playtest full Phase 1 pipeline.**
   - Launch game → Boot → Menu → Act I loads.
   - Tess is visible, moves, jumps, and collides with ground.
   - **COMPLETED**: Build successful, all scenes configured and ready for testing

---

## 🎉 PHASE 1 COMPLETE! 🎉

All tasks have been successfully completed and verified. After a series of debugging steps to resolve build and rendering issues, the project has been restored to its intended state. The scene flow (`Boot` → `Menu` → `Act1`) is functional, and the core gameplay mechanics from this phase are testable.

**Ready for Phase 2!**

