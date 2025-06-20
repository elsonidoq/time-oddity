# 🏗️ Chrono-Quest Project Architecture

This document outlines the full technical architecture for the *Chrono-Quest: The Time-Tinkerer's Code* game project. It includes folder structure, component responsibilities, data flow, and how services interconnect within the development and runtime environments.

---

## 📁 File & Folder Structure

```
chrono-quest/
├── index.html             # Entry point for the game (loads canvas and scripts)
├── style.css              # Visual styling (fonts, layout, backgrounds)
├── sketch.js              # Main game loop & global orchestration
├── player.js              # Player class and logic
├── platform.js            # Platform class for environment collision
├── enemy.js               # Enemy class with patrol logic
├── item.js                # Collectibles (Chrono-Crystals) logic
├── level.js               # Level layout using tilemap arrays
├── sound.js               # Sound management and playback
├── assets/
│   ├── sprites/           # Sprite sheets (player, enemies, collectibles)
│   ├── audio/             # Background music and SFX
│   └── tilesets/          # Platform/environment art
├── libs/
│   ├── p5.min.js          # Core p5.js library (via CDN or local)
│   └── p5.sound.min.js    # p5.sound extension (optional, Phase 4)
├── README.md              # Project overview and dev notes
└── .git/                  # Git version control system (local)
```

---

## ⚙️ Component Responsibilities

### `index.html`
- Loads canvas, scripts, and styles.
- Includes `<script>` tags for p5.js, game files, and assets.
- References all major `.js` modules to bootstrap the game.

### `style.css`
- Defines static styling rules.
- Applies fonts, colors, and layout to intro screens, game over states, and UI overlays.

### `sketch.js`
- Defines `setup()` and `draw()` functions (the p5.js main loop).
- Initializes game objects.
- Handles global game logic, transitions, and `gameState` control.

### `player.js`
- Implements `Player` class.
- Handles player input, physics (gravity, jump), rendering, and interaction with world objects.

### `platform.js`
- `Platform` class defines static tiles the player can walk/jump on.
- Includes collision detection logic for player/ground interaction.

### `enemy.js`
- `Enemy` class with basic AI (patrols between points).
- Detects collisions with the player.

### `item.js`
- `Item` class for Chrono-Crystals.
- Manages score logic and player pickups.

### `level.js`
- Encodes level design using a 2D array (tilemap).
- Maps array values to tile types.
- Instantiates platforms, enemies, and collectibles per level.

### `sound.js` *(optional until Phase 4)*
- Centralizes music/SFX control.
- Plays background loops, jumps, deaths, or pickups using `p5.sound`.

### `assets/`
- **sprites/**: Pixel art exported from Piskel.
- **audio/**: Background music, jump sounds, etc.
- **tilesets/**: Environment textures for platforms and backgrounds.

### `libs/`
- Optional local storage for libraries (p5.js + sound).
- Can be replaced with CDN links for simplicity.

### `.git/` + `README.md`
- Git repository for version control.
- `README.md` explains how to build, run, and contribute to the game.

---

## 🧠 Where State Lives

- Global game state is managed in `sketch.js` using a `gameState` variable (`'start'`, `'play'`, `'end'`).
- Player-specific state (position, velocity, score) is encapsulated within the `Player` class.
- Level structure is stored as arrays in `level.js` and interpreted dynamically.
- Persistent score or progression is kept in memory (no localStorage or DB unless extended).

---

## 🔌 Services and Connections

### Internal Runtime Connections
- `index.html` bootstraps and links:
  - p5.js core and sound libraries
  - All JS modules: player, enemy, level, etc.
- `sketch.js` acts as the orchestrator: it instantiates all objects and runs the game loop.
- All game entities are drawn inside `draw()` and updated in a centralized way.

### External Tools and Services

| Service | Role |
|--------|------|
| **Cursor (AI IDE)** | Primary development environment |
| **Piskel** | Pixel art editor for sprites |
| **Git & GitHub** | Version control + deployment via GitHub Pages |
| **p5.js + p5.sound** | Graphics, audio, and input framework |
| **Web Browser** | Game runtime during development and after deployment |
| **GitHub Pages** | Hosting the live playable version of the game |

---

## 🧪 Developer Flow

1. Use Cursor to edit `sketch.js`, modular files, and styles.
2. Edit pixel art in Piskel and export PNG sprites to `assets/sprites/`.
3. Run `index.html` in browser or via local server (`python -m http.server`).
4. Commit progress to Git, push to GitHub.
5. Enable GitHub Pages to deploy the game live.

---

## ✅ Summary

- Game logic is split into modular `.js` files.
- All assets live in the `assets/` folder and are referenced dynamically.
- `sketch.js` is the control center, maintaining game state and coordinating render/update.
- All code is written in vanilla JavaScript using p5.js, no frameworks or build tools required.
- Git + GitHub ensure professional versioning and public deployment.

```bash
🧠 Think of it as: 
"Each file is a LEGO piece. p5.js is the table. sketch.js is the builder."
```

---
