# ✅ Phase 1: Environment & First Render – Step-by-Step Plan

Each task below is atomic, testable, and focused on a single responsibility.

---

## 🧱 Setup the Project Environment

### Task 1: Create the base project folder ✅ COMPLETED
- **Start:** No folder exists
- **End:** Folder `chrono-quest/` is created and empty

### Task 2: Create the three initial files ✅ COMPLETED
- **Start:** Empty `chrono-quest/`
- **End:** Files `index.html`, `style.css`, and `sketch.js` exist

### Task 3: Add HTML boilerplate to `index.html` ✅ COMPLETED
- **Start:** `index.html` is empty
- **End:** File includes basic HTML structure with `<head>` and `<body>`

### Task 4: Link `style.css` and `sketch.js` in `index.html` ✅ COMPLETED
- **Start:** HTML file has structure
- **End:** `<link>` to CSS and `<script>` to JS are correctly inserted

### Task 5: Add CDN for p5.js in `index.html` ✅ COMPLETED
- **Start:** External libraries are not loaded
- **End:** p5.js is linked via CDN before `sketch.js` script

---

## 🔧 Build the First Render

### Task 6: Define `setup()` and `draw()` functions in `sketch.js` ✅ COMPLETED
- **Start:** `sketch.js` is empty
- **End:** Functions `setup()` and `draw()` exist and are syntactically correct

### Task 7: In `setup()`, create a canvas of size 800x600 ✅ COMPLETED
- **Start:** `setup()` exists but is empty
- **End:** `createCanvas(800, 600)` is correctly called inside `setup()`

### Task 8: In `draw()`, set background color to black ✅ COMPLETED
- **Start:** `draw()` exists but is empty
- **End:** `background(0)` is present and called on each frame

### Task 9: Open the `index.html` in a browser ✅ COMPLETED
- **Start:** HTML + JS are ready
- **End:** A black canvas of 800x600 renders on screen

---

## 👤 Build the Player Class

### Task 10: Create a new file `player.js` ✅ COMPLETED
- **Start:** File does not exist
- **End:** `player.js` file is created in root directory

### Task 11: Link `player.js` in `index.html` ✅ COMPLETED
- **Start:** File is created but not loaded
- **End:** `<script src="player.js">` is added below `sketch.js`

### Task 12: Define a `Player` class with a constructor ✅ COMPLETED
- **Start:** `player.js` is empty
- **End:** Class `Player` has a constructor with position and size properties

### Task 13: Add a `show()` method to the `Player` class ✅ COMPLETED
- **Start:** Class exists
- **End:** Method draws a rectangle at `this.pos` of `this.size`

### Task 14: In `sketch.js`, create a global `player` variable ✅ COMPLETED
- **Start:** Variable does not exist
- **End:** `let player;` is declared at the top of `sketch.js`

### Task 15: Instantiate `player` in `setup()` ✅ COMPLETED
- **Start:** Variable exists
- **End:** `player = new Player(x, y);` is called inside `setup()`

### Task 16: Call `player.show()` inside `draw()` ✅ COMPLETED
- **Start:** Player exists but isn't drawn
- **End:** `player.show()` is called in `draw()` and renders on canvas

---

## ✅ End of Phase 1 Check

By completing all 16 steps:
- The game environment is functional and browser-based
- A canvas is rendered using p5.js
- A placeholder player (rectangle) appears on screen and updates each frame

---

```bash
🌐 Test: Open `index.html` in a browser
🧪 Expected: Black screen with white square rendered at the initial player position
```

Let me know if you'd like a JSON or YAML version of this task list for automation.
