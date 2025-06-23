# The Time Oddity Project: A Comprehensive Full-Stack Development Guide

### **Introduction**

This document serves as the comprehensive technical reference guide for the "Time Oddity" project. It provides an exhaustive, expert-level analysis of the full technology stack, integration strategies, and game-specific implementation patterns. The guide is structured to be the single source of truth for the development team and is formatted to be highly compatible with AI-assisted development workflows, ensuring clarity, consistency, and efficiency throughout the project lifecycle.

----------

## **Section 1: Client-Side Foundation with Phaser 3 (v3.90.0)**

This section establishes the core architecture of the game client using the Phaser 3 framework. We will cover everything from initial setup to advanced performance optimization, providing a robust foundation for all client-side logic. The architectural decisions herein are deliberate; to compensate for known limitations in Phaser's native capabilities for animation and audio, this guide mandates the use of specialized libraries—GSAP and Howler.js, respectively—which will be detailed in subsequent sections. This approach ensures that the best tool is used for each specific job, leading to a more performant and maintainable final product.

### **1.1. Project Setup and Game Configuration**

The initial setup of a Phaser 3 project requires establishing the development environment, installing the framework, and creating the main game configuration object. This configuration is the central nervous system of the game client, defining its core properties and behaviors.

#### **Installation**

The project will utilize Node.js and its package manager, `npm`, for dependency management. The specified version of Phaser, v3.90.0 "Tsugumi", should be installed as a project dependency.

**Command:**

Bash

```
npm install phaser@v3.90.0

```

For rapid project scaffolding, Phaser provides an official command-line tool, the "Create Game App," which can generate a project template pre-configured with a modern bundler like Vite. This is the recommended starting point for new projects.

#### **Game Configuration Object (`Phaser.Game`)**

Every Phaser game begins with a configuration object passed to the `Phaser.Game` constructor. This object defines the global settings for the entire game instance.

JavaScript

```
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#000000',
    scene:,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 980 },
            debug: false
        }
    },
    audio: {
        noAudio: true // Important: Disables Phaser's audio system
    }
};

const game = new Phaser.Game(config);

```

**Key Configuration Properties:**

-   **`type`**: Determines the rendering context. `Phaser.AUTO` is the default and recommended setting, as it will attempt to use WebGL and fall back to Canvas if WebGL is unavailable. The performance implications of this choice are significant and will be discussed in the performance tuning section.
    
-   **`width` & `height`**: Defines the base resolution of the game canvas. These values establish the game's coordinate system.
    
-   **`parent`**: The `id` of the HTML `<div>` element where the game canvas will be injected into the DOM.
    
-   **`scene`**: An array of Scene classes or objects that will be registered with the Scene Manager. The first scene in the array is typically started automatically.
    
-   **`physics`**: Configures the physics engines. For this project, we will exclusively use the lightweight and performant `arcade` physics system. The `gravity` property sets a global gravity vector.
    
-   **`scale`**: Configures the Scale Manager, which handles how the game canvas is scaled and positioned within the browser window. This is critical for mobile responsiveness and will be detailed further in section 1.7.
    
-   **`audio`**: A critical setting for this project's architecture. `audio: { noAudio: true }` explicitly disables Phaser's built-in sound manager. This is a deliberate choice to prevent conflicts with Howler.js, which will serve as the sole audio engine for the project.
    

#### **Web Server Requirement**

Modern web browsers enforce strict security policies that restrict JavaScript's access to the local file system when a page is opened via the `file://` protocol. Because a game needs to load assets like images, audio, and JSON data, it must be served over the `http://` or `https://` protocol. Therefore, a local web server is a non-negotiable requirement for Phaser development. The development server provided by Vite (covered in Section 6) will fulfill this requirement, offering features like hot reloading for a superior development experience.

### **1.2. The Scene System: Architecture and Lifecycle**

Scenes are the most fundamental organizational unit in Phaser 3. Each scene is a self-contained module representing a distinct part of the game, such as a title screen, a game level, a pause menu, or a UI overlay. This modular design is a significant architectural improvement over previous versions of Phaser, as each scene encapsulates its own Display List, Camera Manager, Input Plugin, and update loop, preventing the global state conflicts that were common in earlier architectures.

#### **Core Scene Methods**

The behavior of a scene is defined by a set of lifecycle methods that Phaser calls at specific times. Understanding this lifecycle is essential for structuring all game logic.

-   **`init(data)`**: The first method called when a scene is started. It receives any data passed from the scene that initiated it. This method is ideal for resetting scene-specific variables and preparing the state before assets are loaded.
    
-   **`preload()`**: This method is called after `init()`. Its sole purpose is to load assets required for the scene using the Loader Plugin (`this.load`). Phaser will display a progress bar automatically while assets in this function are loading.
    
-   **`create(data)`**: This method is called once all assets in `preload()` have finished loading. It is the main setup function for the scene, where game objects are created and positioned, physics is configured, animations are defined, and event listeners are set up.
    
-   **`update(time, delta)`**: This is the core game loop, called on every frame (typically 60 times per second). All real-time game logic, such as checking for input, updating player positions, and running collision checks, resides here. `time` is the high-resolution timestamp for the current frame, and `delta` is the time in milliseconds since the last frame.
    

#### **Scene Management (`this.scene`)**

The Scene Plugin, accessible via `this.scene` from within any scene, is the API for controlling the flow between scenes. It operates on a queue, meaning calls are not immediate but are executed at the start of the next game step.

**Table: Key `Phaser.Scene` Management Methods**

Method

Parameters

Description

`start`

`(key: string, data?: object)`

Stops the current scene and starts the scene with the given key. Optional data can be passed to the new scene's `init` and `create` methods.

`stop`

`(key?: string)`

Shuts down the specified scene (or the current scene if no key is provided). This triggers the scene's `shutdown` event.

`launch`

`(key: string, data?: object)`

Starts the specified scene, running it in parallel with the current scene. This is the primary mechanism for creating UI overlays.

`pause`

`(key?: string)`

Pauses the specified scene's `update` loop but keeps it visible.

`resume`

`(key?: string)`

Resumes a paused scene.

`sleep`

`(key?: string)`

Pauses a scene's `update` loop and makes it invisible. Its state is preserved in memory.

`wake`

`(key?: string)`

Wakes a sleeping scene, making it visible and resuming its `update` loop.

Export to Sheets

#### **Multi-Scene Communication**

Effective communication between scenes is crucial for a well-structured game. Phaser provides three primary patterns for this :

1.  **Passing Data on Start/Launch**: The `data` object in `this.scene.start(key, data)` is passed directly to the target scene's `init` and `create` methods. This is suitable for one-time data injection.
    
2.  **Global Event Emitter (`this.game.events`)**: For more complex, decoupled communication, scenes can emit and listen for events on the global game event emitter. This is the recommended pattern for broadcasting game-wide events, such as `'playerDied'` or `'scoreUpdated'`.
    
3.  **Global Registry (`this.registry`)**: The registry is a global key-value data store accessible from any scene via `this.registry`. It is ideal for storing global game state that needs to persist across scenes, such as the player's total score or unlocked levels.
    

The architecture for "Time Oddity" will heavily leverage the global event emitter to communicate between the main `GameScene` and a decoupled `UIScene`, ensuring that the UI can react to game events without being tightly coupled to the game's logic.

### **1.3. Asset and Sprite Management**

Properly managing game assets is fundamental to both functionality and performance. Phaser provides robust systems for loading assets and creating game objects from them.

#### **Loading Assets**

All asset loading should occur within a scene's `preload()` method using the Loader Plugin, accessible via `this.load`. This ensures assets are available in the global cache before the `create()` method is called.

JavaScript

```
preload() {
    this.load.image('player', 'assets/sprites/player.png');
    this.load.spritesheet('explosion', 'assets/sprites/explosion.png', { frameWidth: 64, frameHeight: 64 });
    this.load.tilemapTiledJSON('level1', 'assets/tilemaps/level1.json');
    this.load.atlas('ui_atlas', 'assets/ui/atlas.png', 'assets/ui/atlas.json');
}

```

#### **Creating Game Objects**

Phaser distinguishes between the **GameObjectFactory** (`this.add`) and the **GameObjectCreator** (`this.make`). The factory is the standard choice for most use cases, as it not only creates the object but also automatically adds it to the scene's display list (for rendering) and update list (if applicable).

-   `this.add.sprite(x, y, 'player')`: The most common method for creating a sprite. A sprite is a game object designed for both static and animated images and can have a physics body.
    
-   `this.add.image(x, y, 'logo')`: Creates a static image. This is slightly more performant than a sprite if animation is not required.
    
-   `this.add.text(x, y, 'Hello', { font: '32px Arial', fill: '#ffffff' })`: Creates a standard text object. This can be performance-intensive if the text changes frequently.
    
-   `this.add.bitmapText(x, y, 'fontKey', 'Hello')`: Creates text using a pre-rendered bitmap font. This is significantly more performant for text that updates often, such as a score display.
    

#### **The Texture Manager**

When an image is loaded, Phaser processes it and stores it in the global Texture Manager, which is accessible via `this.textures`. This manager holds the image data that all sprites and images reference. This caching mechanism means that an image only needs to be loaded once, even if it is used by hundreds of sprites across multiple scenes.

### **1.4. Arcade Physics Engine**

For a 2D platformer like "Time Oddity," Phaser's built-in Arcade Physics engine provides a fast and reliable solution for collision detection and physics simulation. It is a lightweight, AABB (Axis-Aligned Bounding Box) based system.

#### **Setup and Configuration**

Arcade Physics is enabled in the main game configuration and is accessible within a scene via `this.physics`.

#### **Physics Bodies**

When a game object is enabled for physics, Phaser attaches a `body` property to it. This body contains all physics-related properties and methods.

-   **Key Properties:** `body.velocity`, `body.acceleration`, `body.gravity`, `body.bounce`, `body.immovable`, `body.collideWorldBounds`.
    
-   **Controlling Movement:** Movement is typically controlled by setting the body's velocity (e.g., `player.body.setVelocityX(200)`).
    

#### **Static vs. Dynamic Bodies**

A crucial distinction in Arcade Physics is between static and dynamic bodies.

-   **Dynamic Body:** A body that can move and is affected by forces like gravity and collisions. Players, enemies, and projectiles are dynamic.
    
-   **Static Body:** A body that does not move and is unaffected by collisions. Platforms, walls, and the ground are static. Creating a `staticGroup` is the most efficient way to manage multiple static platforms.
    

#### **Collision Detection**

Phaser provides two primary methods for handling interactions between physics bodies:

1.  **`this.physics.add.collider(object1, object2, callback, processCallback, context)`**: This method sets up a collision check between two objects or groups. When they collide, they will be separated, and the optional `callback` function will be invoked. This is used for physical interactions, like a player landing on a platform.
    
2.  **`this.physics.add.overlap(object1, object2, callback, processCallback, context)`**: This method detects when two bodies overlap but does _not_ produce a physical separation. It is used for trigger-like events, such as a player collecting a coin or entering a specific zone.
    

The `processCallback` is an optional function that can be used to conditionally enable or disable the collision/overlap for that specific interaction.

#### **Physics Groups**

For efficiency, it is essential to use Physics Groups (`this.physics.add.group()`) to manage collections of similar objects. Instead of setting up individual colliders for every enemy, you can set up a single collider between the player and the entire enemy group.

JavaScript

```
// In create()
const platforms = this.physics.add.staticGroup();
platforms.create(400, 680, 'ground').setScale(2).refreshBody();

const player = this.physics.add.sprite(100, 450, 'player');

this.physics.add.collider(player, platforms);

```

### **1.5. Input and Animation Systems**

Controlling the player and bringing characters to life are handled by Phaser's Input and Animation systems.

#### **Input Handling**

The Input Plugin (`this.input`) provides a unified API for handling various input methods.

-   **Keyboard:** The `KeyboardPlugin` is the most direct way to handle keyboard input.
    
    -   `this.input.keyboard.createCursorKeys()`: A convenient helper that returns an object with properties for the up, down, left, and right arrow keys, each with an `isDown` property.
        
    -   `this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)`: For listening to specific, individual keys.
        
-   **Mouse/Touch:** Pointer events can be handled globally on the scene or locally on a specific game object. To make a game object receive pointer events, it must first be made interactive: `gameObject.setInteractive()`.
    
    -   `this.input.on('pointerdown', (pointer) => {... })`: Listens for a click/touch anywhere on the canvas.
        
    -   `gameObject.on('pointerdown', (pointer) => {... })`: Listens for a click/touch specifically on that game object.
        
-   **Gamepad:** Phaser has built-in support for the Gamepad API, allowing for the detection and handling of input from connected gamepads.
    

#### **Animation Manager**

Phaser's Animation Manager (`this.anims`) is a global system for creating and managing frame-based animations from spritesheets or texture atlases.

1.  **Creating an Animation:** Animations are typically defined once in the `create()` method of a loading or game scene.
    
    JavaScript
    
    ```
    this.anims.create({
        key: 'player-walk',
        frames: this.anims.generateFrameNumbers('player_spritesheet', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1 // -1 means loop forever
    });
    
    ```
    
2.  **Playing an Animation:** Once created, an animation can be played on any sprite instance.
    
    JavaScript
    
    ```
    playerSprite.anims.play('player-walk', true); // The 'true' ignores playback if the animation is already playing
    
    ```
    

### **1.6. Camera Systems, Particles, and Effects**

Visual polish is achieved through Phaser's powerful camera and particle systems.

#### **Camera Manager (`Phaser.Cameras.Scene2D`)**

Each scene has its own Camera Manager, accessible via `this.cameras`. The default camera is `this.cameras.main`. Cameras can be used to create a variety of effects.

-   **`startFollow(target, roundPixels, lerpX, lerpY)`**: Makes the camera follow a game object, typically the player. `lerp` values control the smoothness of the follow.
    
-   **`setBounds(x, y, width, height)`**: Constrains the camera's movement within the boundaries of the game world.
    
-   **Effects:** The camera provides methods for cinematic effects like `zoomTo()`, `pan()`, `fade()`, and `shake()`.
    

#### **Particle Emitters**

Phaser includes a robust particle system for creating effects like explosions, fire, smoke, and weather. It is accessed via `this.add.particles()`. A particle emitter is configured with properties that define the behavior of the particles it emits, such as speed, scale, alpha, lifespan, and gravity.

A common pattern is to create a pre-configured emitter and then trigger it to explode at a specific location.

JavaScript

```
const particles = this.add.particles('red_particle');

const emitter = particles.createEmitter({
    speed: 100,
    scale: { start: 1, end: 0 },
    blendMode: 'ADD',
    lifespan: 600
});

// To trigger an explosion at the player's position
emitter.explode(200, player.x, player.y);

```

Custom particle behaviors, such as flipping particles randomly, can be achieved using the `onEmit` callback for properties like `scaleX`.

### **1.7. Advanced Topics & Best Practices**

This subsection addresses critical advanced topics that are essential for building a polished, production-ready game.

#### **Mobile Responsiveness**

Ensuring a game looks and plays well on a wide variety of screen sizes is a significant challenge. The recommended strategy involves using Phaser's Scale Manager in conjunction with a resize event listener.

1.  **Configuration:** In the game config, set the scale mode to `Phaser.Scale.FIT` and `autoCenter` to `Phaser.Scale.CENTER_BOTH`. `FIT` will scale the game canvas to fit within the available space while maintaining its aspect ratio.
    
2.  **Resize Handler:** In a scene's `create()` method, listen for the `resize` event from the Scale Manager.
    
    JavaScript
    
    ```
    this.scale.on('resize', (gameSize) => {
        const width = gameSize.width;
        const height = gameSize.height;
    
        // Reposition UI elements based on the new dimensions
        this.healthBar.setPosition(width - 100, 50);
        this.scoreText.setPosition(100, 50);
    });
    
    ```
    

The core pattern is to anchor UI elements to the corners or center of the screen, recalculating their positions whenever the screen size changes. For complex UI, using a separate UI scene (as discussed in Section 7.3) is the most robust approach.

#### **Performance Tuning**

Maintaining a high and stable framerate is crucial for player experience. Poor performance in web games is most often caused by excessive draw calls or garbage collection stalls.

-   **Object Pooling:** This is the single most important performance optimization for games that spawn and destroy many objects (like projectiles or enemies). Instead of destroying an object, it is deactivated (`setActive(false)`, `setVisible(false)`) and returned to a "pool" (a `Phaser.GameObjects.Group`). When a new object is needed, one is retrieved from the pool instead of being created from scratch. This completely avoids the memory allocation and subsequent garbage collection that causes framerate stutters. The game's architecture
    
    _must_ incorporate object pooling for any frequently created entities.
    
-   **WebGL vs. Canvas:** While WebGL is the default and generally more performant renderer due to hardware acceleration, some older or low-end mobile devices have poor WebGL drivers. In these rare cases, forcing the `Phaser.CANVAS` renderer can paradoxically result in better performance. It is a good practice to allow this to be a configurable setting.
    
-   **Texture Atlases:** The number of draw calls made by the renderer per frame has a direct impact on performance. A texture atlas is a single large image that contains many smaller images (e.g., all UI elements, all character frames). By loading one atlas instead of dozens of individual files, the renderer can batch draw calls much more efficiently, significantly improving performance. Tools like TexturePacker are standard for creating atlases.
    
-   **Graphics API vs. Images:** Dynamically drawing shapes using the `Graphics` object (`this.add.graphics()`) is computationally expensive and should be avoided in the main game loop. For simple shapes like health bars or backgrounds, it is far more performant to create them as images in an art tool and load them as sprites.
    

#### **Memory Management and Garbage Collection**

Phaser applications can suffer from memory leaks if not managed carefully. This is often observed when scenes are repeatedly stopped and restarted.

-   **The Problem:** JavaScript's garbage collector (GC) is non-deterministic. It runs when it decides to, which can make it difficult to distinguish between a true memory leak and the browser simply being lazy about freeing memory. When switching scenes, if event listeners or references to objects from the old scene are not properly cleaned up, the old scene and all its assets can be retained in memory, leading to a gradual increase in memory usage that eventually crashes the tab.
    
-   **Best Practices for Cleanup:**
    
    1.  **Use the `shutdown` Event:** Every scene emits a `shutdown` event when it is stopped. This is the correct place to perform all cleanup.
        
    2.  **Remove Listeners:** Explicitly remove all event listeners created within the scene, especially those on global objects like `this.game.events` or `this.scale`.
        
    3.  **Destroy Objects:** While Phaser attempts to destroy all children of a scene, it is good practice to explicitly call `destroy()` on complex objects or plugins created by the scene.
        
    4.  **Nullify References:** Clear any arrays or objects that hold references to game objects to ensure they are eligible for garbage collection.
        
-   **Debugging Memory Issues:** The Chrome DevTools are indispensable. Use the **Performance** tab to take heap snapshots before and after a scene transition. The **Memory** tab allows you to monitor memory usage over time, and crucially, it has a "Collect garbage" button (a trash can icon). Clicking this forces the GC to run, which immediately reveals whether memory is being truly leaked or just lazily held by the browser.
    

#### **Debugging Tools**

-   **Phaser's Built-in Debugging:** Enabling `debug: true` in the `arcade` physics configuration will draw the bounding boxes and velocity vectors for all physics bodies, which is invaluable for debugging collision issues.
    
-   **Phaser Debugger Extension:** This is an essential tool for development. It is a Chrome/Firefox extension that hooks into a running Phaser game and provides a panel to inspect and modify the scene graph in real-time. You can see a list of all game objects, change their properties (position, scale, visibility, etc.) on the fly, and see the results instantly. This dramatically speeds up UI positioning and debugging visual issues.
    

----------

## **Section 2: High-Performance Animation with GSAP (v3)**

This section details the integration of the GreenSock Animation Platform (GSAP) as the exclusive animation engine for "Time Oddity." The decision to use GSAP is architectural; it provides a more powerful, performant, and expressive API than Phaser's native tweening system. By standardizing on GSAP, the project ensures all programmatic animations are handled by a single, best-in-class library, avoiding the complexity of maintaining two separate animation systems.

### **2.1. GSAP Core API Reference**

The core of GSAP is its ability to animate any numeric property of a JavaScript object over time. This is accomplished through "tweens."

#### **Installation**

GSAP can be added to the project via a CDN link in the main `index.html` or, for a modern build process, installed via `npm`.

**Command:**

Bash

```
npm install gsap

```

**Usage:**

JavaScript

```
import { gsap } from "gsap";

```

#### **Tweens: The Building Blocks of Animation**

A "tween" is a single animation instance. GSAP provides three primary methods for creating tweens :

-   **`gsap.to(targets, vars)`**: The most common method. It animates the properties of the `targets` from their current state **to** the values specified in the `vars` object.
    
-   **`gsap.from(targets, vars)`**: Animates the properties of the `targets` **from** the values in the `vars` object to their current state.
    
-   **`gsap.fromTo(targets, fromVars, toVars)`**: Provides complete control by explicitly defining both the starting (`fromVars`) and ending (`toVars`) states of the animation.
    

The `targets` parameter can be a CSS selector string (e.g., `".my-class"`), a direct reference to an object, or an array of objects.

#### **The `vars` Object and Easing**

The `vars` object contains the properties to be animated and special properties that control the tween's behavior.

Common `vars` Properties :

Property

Type

Description

`duration`

`number`

The duration of the animation in seconds. Default is 0.5.

`delay`

`number`

The delay before the animation begins, in seconds.

`ease`

`string`

The easing function to control the rate of change. Examples: `"power2.out"`, `"elastic"`, `"bounce.inOut"`.

`repeat`

`number`

The number of times the animation should repeat. Use `-1` for an infinite loop.

`yoyo`

`boolean`

If `true`, the animation will reverse direction on each repeat.

`stagger`

`number` or `object`

Creates a staggered effect when animating multiple targets. A number specifies the delay between each target's animation start.

`onComplete`

`function`

A callback function that executes when the tween finishes.

Export to Sheets

**Easing Functions** control the "feel" of an animation by defining its acceleration and deceleration. GSAP provides a rich library of built-in eases, such as `"power1"`, `"power2"`, `"back"`, `"elastic"`, `"bounce"`, and `"circ"`, each with `.in`, `.out`, and `.inOut` variants. The Ease Visualizer on the GSAP website is an invaluable tool for selecting the appropriate ease.

### **2.2. Complex Choreography with Timelines**

While individual tweens are powerful, complex animation sequences require a **Timeline**. A timeline is a container for multiple tweens, allowing for precise choreography and control over the entire sequence as a single unit.

-   **Creating a Timeline:** `const tl = gsap.timeline({ defaults: { duration: 1, ease: 'power1.inOut' } });`
    
    -   The `defaults` object is a convenient way to apply common settings to all tweens added to that timeline.
        
-   **Sequencing Tweens:** Adding tweens to a timeline instance (e.g., `tl.to(...)`) automatically places them one after another.
    
    JavaScript
    
    ```
    const tl = gsap.timeline();
    tl.to('.box1', { x: 200 }); // Starts at time 0
    tl.to('.box2', { y: 100 }); // Starts after.box1 finishes
    tl.to('.box3', { rotation: 360 }); // Starts after.box2 finishes
    
    ```
    
-   **The Position Parameter:** The true power of timelines comes from the optional position parameter, which provides precise control over when a tween is placed on the timeline.
    
    -   **Absolute Time:** `tl.to('.box', { x: 100 }, 2);` // Starts at exactly 2 seconds.
        
    -   **Relative to End:** `tl.to('.box', { x: 100 }, "+=1");` // Starts 1 second after the end of the timeline.
        
    -   **Relative to Start of Previous Tween:** `tl.to('.box2', { y: 50 }, "<");` // Starts at the same time as the previous tween.
        
    -   **Relative with Offset:** `tl.to('.box3', { scale: 2 }, "<0.5");` // Starts 0.5 seconds after the start of the previous tween.
        
-   **Labels:** Labels act as bookmarks on the timeline, making complex sequences easier to manage and read.
    
    -   `tl.addLabel("scene_intro", 1.5);`
        
    -   `tl.to('.title', { alpha: 1 }, "scene_intro");` // Animate the title at the "scene_intro" label.
        

### **2.3. Definitive Integration Pattern: GSAP + Phaser**

To ensure perfect synchronization between GSAP's animations and Phaser's physics and logic updates, GSAP's internal update loop (ticker) must be slaved to Phaser's main game loop. This is a critical architectural pattern that prevents timing drift and ensures animations pause and resume correctly with the game state.

The integration process is as follows:

1.  **Disable GSAP's Ticker:** In the main game scene's `create()` method, remove GSAP's default update function from its ticker.
    
2.  **Update GSAP Manually:** In the scene's `update(time, delta)` method, manually call `gsap.updateRoot()` on every frame, passing in the total elapsed time from Phaser.
    

JavaScript

```
// In a Phaser Scene's create() method
create() {
    // It's good practice to disable lag smoothing for game loops
    gsap.ticker.lagSmoothing(false);
    // Remove GSAP's default update function from its ticker
    gsap.ticker.remove(gsap.updateRoot);
}

// In the same Phaser Scene's update() method
update(time, delta) {
    // Manually update the GSAP root timeline, converting Phaser's millisecond time to seconds
    gsap.updateRoot(time / 1000);

    //... rest of your game logic
}

```

With this pattern in place, GSAP can be used to animate any numeric property of a Phaser `GameObject` directly and reliably.

**Example: Animating a Phaser Sprite**

JavaScript

```
// Assuming 'player' is a Phaser.GameObjects.Sprite
gsap.to(player, {
    y: '-=100', // Move up by 100 pixels
    scale: 1.2,
    duration: 0.5,
    ease: 'power2.out',
    yoyo: true,
    repeat: 1
});

```

**Example: Animating a Sprite's Frames** GSAP can even control frame-by-frame animations by tweening the `frame` property of a sprite's animation component. The `roundProps` plugin is essential to ensure the frame index is always an integer.

JavaScript

```
// Animate a sprite through frames 0 to 10 over 1 second
gsap.to(sprite.anims, {
    frame: 10,
    duration: 1,
    ease: 'steps(10)', // Use steps ease for frame-by-frame animation
    roundProps: "frame" // Ensure the 'frame' property is always an integer
});

```

### **2.4. Game-Specific Use Cases for "Time Oddity"**

The power of GSAP timelines will be leveraged to create the sophisticated visual effects required for the "Time Oddity" mechanics.

-   **UI Animations:** All menu transitions, button feedback (scaling/color changes), and HUD element animations (e.g., a health bar smoothly decreasing) will be handled by GSAP for a polished and professional feel.
    
-   **Character Animations:** While base walk/run cycles will be standard spritesheet animations, special moves like dashes or the visual effect of activating a time power will be choreographed with GSAP timelines, tweening properties like `alpha`, `scale`, and tint.
    
-   **Time-Based Effects:** GSAP timelines are perfectly suited for visualizing the time manipulation mechanics.
    
    -   **Time Rewind:** A timeline can be created to control a post-processing shader's uniforms or a particle effect's emission rate. Playing this timeline in reverse (`tl.reverse()`) would visually represent time rewinding.
        
    -   **Time Freeze:** Pausing a GSAP timeline (`tl.pause()`) that controls visual effects will freeze them in place, providing clear feedback to the player that time is stopped.
        

----------

## **Section 3: Advanced Audio Management with Howler.js (v2.2.3+)**

For "Time Oddity," achieving reliable and high-performance audio across all target platforms, especially mobile, is a priority. While Phaser has a built-in audio system, it can exhibit inconsistencies across different browsers and devices. To mitigate this risk and gain finer control, this project will standardize on **Howler.js** as its sole audio engine. This architectural decision ensures robust, predictable audio behavior by leveraging a library specifically designed to solve the challenges of web audio.

### **3.1. Core API and Configuration**

Howler.js is a lightweight, dependency-free JavaScript library that simplifies web audio. It intelligently defaults to the Web Audio API for its advanced features and provides a seamless fallback to HTML5 Audio for older browsers, ensuring maximum compatibility from a single, clean API.

#### **Installation**

Howler.js can be included via a CDN or installed as an `npm` package.

**Command:**

Bash

```
npm install howler

```

**Usage:**

JavaScript

```
import { Howl, Howler } from 'howler';

```

#### **The `Howl` and `Howler` Objects**

The library's functionality is split between two main objects:

1.  **`Howl`**: An instance of `Howl` represents a single audio file or a collection of audio sprites. All playback controls (play, pause, seek, fade, etc.) are methods of a `Howl` object.
    
2.  **`Howler`**: A global singleton object used to manage properties that affect all sounds, such as the master volume (`Howler.volume()`), mute state (`Howler.mute()`), and 3D audio listener position (`Howler.pos()`).
    

**Example `Howl` Configuration:**

JavaScript

```
const sound = new Howl({
  src: ['sounds/effects.webm', 'sounds/effects.mp3'], // Provide multiple formats for cross-browser compatibility
  volume: 0.8,
  loop: false,
  sprite: {
    laser: ,       // A 'laser' sound from 0ms to 500ms
    explosion:  // An 'explosion' sound from 1000ms to 2200ms
  }
});

```

### **3.2. Implementation Patterns for Game Audio**

To effectively manage audio in a complex game, it is essential to establish clear architectural patterns.

#### **Global Audio Manager**

A singleton `AudioManager` class is the recommended pattern for encapsulating all audio logic. This approach provides a clean, centralized API for the rest of the game to interact with, abstracting away the specifics of the Howler.js implementation.

**Responsibilities of the `AudioManager`:**

-   **Loading and Caching:** On initialization, it should load all required audio files into `Howl` objects and store them in a `Map` or plain object for easy retrieval by a unique key (e.g., `'jumpSound'`).
    
-   **Playback Control:** It will expose simple, game-specific methods like `playSfx('explosion')`, `playMusic('level1_theme')`, and `stopMusic()`.
    
-   **Layer Management:** It should manage separate volume levels for different audio categories, such as background music (BGM), sound effects (SFX), and ambient loops. This allows for independent volume controls in an options menu.
    

#### **Audio Sprites for Efficiency**

For sound effects, using **audio sprites** is a critical performance optimization. Instead of loading dozens of small audio files, all SFX are combined into a single audio file. The `sprite` property in the `Howl` configuration then defines the start time and duration for each individual sound within that file. This dramatically reduces the number of HTTP requests on game load and lowers the memory footprint.

**Example Usage:**

JavaScript

```
// Assuming 'effectsSound' is a Howl object with sprite definitions
audioManager.effectsSound.play('laser');

```

#### **Spatial Audio (3D Sound)**

Howler.js provides robust support for 3D spatial audio, which can be used to enhance immersion. By setting the position of a sound source and the listener, the audio will be panned and attenuated automatically based on their relative positions. This is particularly effective for off-screen enemy cues or environmental sounds.

**Example:**

JavaScript

```
// Set the listener's position (e.g., the player)
Howler.pos(player.x, player.y, -0.5);

// Create a sound and play it at an enemy's position
const enemySound = new Howl({ src: ['enemy_roar.mp3'] });
const soundId = enemySound.play();
enemySound.pos(enemy.x, enemy.y, 0, soundId);

```

### **3.3. Integration with Phaser**

The integration of Howler.js requires explicitly disabling Phaser's own audio system to prevent conflicts and ensure Howler.js has exclusive control over the audio context.

1.  **Disable Phaser Audio:** In the main game `config` object, set `audio: { noAudio: true }`. This will prevent the `Phaser.Sound.SoundManager` from being initialized.
    
2.  **Instantiate the Audio Manager:** The global `AudioManager` should be instantiated once, typically as a property of the main `Game` instance or as an accessible singleton.
    
3.  **Triggering Sounds from Scenes:** From within any Phaser scene, calls to play audio are directed to the `AudioManager`.
    
    -   **Collision Callback Example:**
        
        JavaScript
        
        ```
        // In a collision callback between player and an enemy
        function onPlayerHit(player, enemy) {
            this.audioManager.playSfx('player_hurt');
            //... other logic
        }
        
        ```
        
    -   **Player Action Example:**
        

s // Inside the Player class's jump method jump() { this.scene.audioManager.playSfx('jump'); //... jump logic } ``` Note: Accessing the manager via `this.scene.audioManager` assumes it was attached to the scene, a common pattern.

#### **Reactive Sound Design for Time Manipulation**

Howler.js provides the necessary controls to create a soundscape that reacts to the core time manipulation mechanics of "Time Oddity."

-   **Time Slow/Fast:** The playback rate of any sound can be changed dynamically using the `rate()` method. `sound.rate(0.5)` would play the sound at half speed, while `sound.rate(2.0)` would play it at double speed. This can be applied to background music to reflect the current flow of time.
    
-   **Time Rewind:** While Howler.js does not natively support playing sounds in reverse, this effect can be achieved by playing a pre-reversed audio file. The `AudioManager` can manage both the forward and reverse versions of a sound and play the appropriate one based on the game's time state.
    
-   **Time Freeze:** The `pause()` and `play()` methods allow for precise control over stopping and starting sounds, which can be tied directly to the game's "time freeze" mechanic.
    

----------

## **Section 4: Backend Services with Node.js and Express.js**

The backend for "Time Oddity" serves as the authoritative foundation for multiplayer interactions, player data persistence, and authentication. The choice of Node.js with the Express.js framework is driven by Node's high-performance, non-blocking I/O model, which is exceptionally well-suited for handling a large number of concurrent connections from game clients with minimal resource overhead. The server architecture will be a hybrid system, combining a stateless RESTful API for traditional web requests with a stateful real-time layer for gameplay, which will be detailed in Section 5.

### **4.1. Node.js Essentials for Game Servers**

A solid understanding of modern Node.js principles is crucial for building a stable and maintainable game server.

-   **Asynchronous Programming:** All I/O operations in Node.js (e.g., database queries, file system access) are asynchronous to prevent blocking the main event loop. This project will exclusively use the modern `async/await` syntax with Promises, as it provides a clean and readable way to handle asynchronous code, avoiding the "callback hell" of older Node.js patterns.
    
-   **ES Modules:** The project will use the ECMAScript module system (`import`/`export`) for organizing code. This is the modern standard for JavaScript and is fully supported in current Node.js versions, offering better static analysis and a cleaner syntax than the legacy CommonJS (`require`/`module.exports`) system.
    

### **4.2. Express.js Framework: Structure and Middleware**

Express.js is a minimal and flexible web application framework that provides a robust set of features for building the server's API endpoints. A secure-by-default architecture is paramount; therefore, essential security middleware will be treated as a core part of the initial server setup, not as an afterthought.

#### **Server Setup and Routing**

The basic structure involves creating an Express application, defining middleware, and setting up modular routers.

JavaScript

```
// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import playerRoutes from './routes/playerRoutes.js';

const app = express();
const PORT = process.env.PORT |
| 3000;

// --- Core Middleware ---
app.use(helmet()); // Set secure HTTP headers
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON request bodies
app.use(express.static('dist')); // Serve the built Phaser client

// --- Session Middleware ---
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// --- API Routes ---
app.use('/api/player', playerRoutes);

// --- Start Server ---
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket.IO will be attached to this 'server' instance in the next section

```

-   **Routing (`express.Router`)**: To keep the API organized and scalable, routes will be defined in separate files using `express.Router`. For example, all player-related endpoints (`/login`, `/register`, `/progress`) will reside in a `routes/playerRoutes.js` file and be mounted under the `/api/player` path prefix.
    
-   **Middleware**: Middleware functions are the backbone of an Express application, processing requests sequentially.
    
    -   `express.json()`: Essential for parsing the body of `POST` and `PUT` requests that send JSON data.
        
    -   `cors`: Handles Cross-Origin Resource Sharing, which is necessary to allow the web-based game client (served from one origin) to make API requests to the server (potentially on another origin).
        
    -   `express.static('dist')`: Configures Express to serve the static files (HTML, CSS, JS) of the compiled Phaser game from the `dist` directory created by the Vite build process.
        

### **4.3. Game Server Use Cases and API Structure**

The RESTful API will handle all stateless interactions required by the game.

-   **Session Management**: The `express-session` middleware is used to track authenticated users. When a player successfully logs in, their user ID is stored in the session object (`req.session.userId`). A cookie containing a unique session ID is sent to the client's browser. On subsequent requests, this cookie is sent back, allowing the server to identify the user and retrieve their session data. For a production environment, the default in-memory session store is not suitable as it does not scale and is cleared on server restart. A persistent session store, such as
    
    `connect-redis`, is strongly recommended.
    
-   **Authentication**: A simple authentication flow will be implemented with endpoints for registration and login. Upon successful login, the session is established. A middleware function will protect sensitive routes by checking for a valid session (`if (!req.session.userId) { return res.status(401).send('Unauthorized'); }`).
    
-   **Progress Saving/Loading**:
    
    -   `POST /api/game/save`: An authenticated endpoint that accepts a JSON payload representing the player's current game state (e.g., level, inventory, character stats). The server validates this data and persists it to a database (e.g., MongoDB, PostgreSQL, or a simple file-based store like JSON for initial development).
        
    -   `GET /api/game/load`: An authenticated endpoint that retrieves the player's last saved state from the database and returns it as JSON.
        
-   **Logging**: A structured logging system is essential for debugging and monitoring. A dedicated logging middleware using a library like **Winston** or **Bunyan** will be implemented to record important API requests, errors, and game events (e.g., player login, level completion) to a file or a logging service.
    

### **4.4. Security Best Practices**

Securing the server is a critical, non-negotiable step. The following practices must be implemented from the project's inception.

-   **Helmet**: This middleware is a collection of smaller middleware functions that set various HTTP headers to help protect the app from well-known web vulnerabilities like XSS, clickjacking, and others. It should be the first middleware used.
    
-   **Rate Limiting**: To prevent brute-force attacks on authentication endpoints, `express-rate-limit` will be applied to the login and registration routes. This limits the number of requests a single IP address can make within a given time frame.
    
-   **Input Validation and Sanitization**: All data received from clients must be considered untrusted. A validation library like `express-validator` or `joi` will be used on all API routes to check that incoming data conforms to the expected format and to sanitize it, preventing SQL injection, NoSQL injection, and XSS attacks.
    
-   **Secure Cookies**: When configuring `express-session`, the `cookie.secure` option should be set to `true` in production. This ensures that the session cookie is only sent over HTTPS, protecting it from man-in-the-middle attacks. The `cookie.httpOnly` flag (enabled by default) prevents the cookie from being accessed by client-side JavaScript, mitigating XSS risks.
    
-   **Dependency Auditing**: The project's dependencies must be regularly audited for known vulnerabilities using `npm audit`. This should be part of the continuous integration pipeline.
    
-   **Environment Variables**: All secrets, including database connection strings, API keys, and session secrets, must be stored in environment variables (e.g., in a `.env` file loaded by a library like `dotenv`) and never be committed to the source code repository.
    

----------

## **Section 5: Real-Time Multiplayer with Socket.IO**

This section details the architecture of the real-time communication layer, which is essential for the multiplayer features of "Time Oddity." Socket.IO is the chosen library for this task due to its robust, event-driven API and its built-in reliability features, such as automatic reconnection and fallback to HTTP long-polling, which are crucial for handling the unstable network conditions often encountered by game clients.

### **5.1. Core Concepts and API**

Socket.IO enables bidirectional communication between the client and server, allowing the server to push data to clients without waiting for a request.

-   **Client-Server Connection:**
    
    -   **Server-Side:** The Socket.IO server is initialized by passing the Node.js HTTP server instance to its constructor. The primary entry point for handling clients is the `connection` event listener.
        
        JavaScript
        
        ```
        import { Server } from 'socket.io';
        // 'server' is the http.Server instance from Express
        const io = new Server(server, { /* options */ });
        
        io.on('connection', (socket) => {
          console.log(`A user connected: ${socket.id}`);
          //... handle events for this specific socket
        });
        
        ```
        
    -   **Client-Side:** In the Phaser game, the client connects to the server by calling the `io()` function.
        
        JavaScript
        
        ```
        // In the client's main scene or network manager
        import { io } from 'socket.io-client';
        const socket = io('http://localhost:3000');
        
        ```
        
-   **Connection Lifecycle:** It is vital to handle the entire connection lifecycle. The server must listen for the `disconnect` event on each socket to know when a player has left the game, allowing for proper cleanup of their state.
    
    JavaScript
    
    ```
    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.id} disconnected: ${reason}`);
      // Remove player from game state, notify others in the room
    });
    
    ```
    
-   **The Emit/Listen Model:** All communication is based on custom events. `socket.emit()` sends an event with an optional data payload, and `socket.on()` registers a listener to handle an incoming event.
    

### **5.2. Managing Player Groups: Rooms and Namespaces**

To manage multiple concurrent game sessions, Socket.IO provides **Rooms**.

-   **Rooms:** A room is a server-side channel that a socket can join or leave. They are the primary mechanism for isolating communication to a specific group of players, such as those in the same game instance or on the same team.
    
    -   **Joining a Room:** `socket.join('game-room-123');`
        
    -   **Broadcasting to a Room:** To send a message to all clients in a room, use the `to()` method.
        
        JavaScript
        
        ```
        // Send to everyone in the room
        io.to('game-room-123').emit('gameStateUpdate', newState);
        
        ```
        
    -   **Broadcasting from a Socket:** To send a message to everyone in a room _except_ the originating socket, chain `to()` from the socket object itself.
        
        JavaScript
        
        ```
        socket.to('game-room-123').emit('playerMoved', { id: socket.id, position: newPos });
        
        ```
        
-   **Namespaces:** Namespaces allow for multiplexing a single connection into separate communication channels (e.g., `/chat`, `/game`). For "Time Oddity," to maintain simplicity, all game-related communication will occur on the default (`/`) namespace, but the option exists for future expansion.
    

### **5.3. Game State Synchronization Patterns**

The method used to synchronize game state between clients and the server is the most critical architectural decision for a multiplayer game. A naive approach can lead to high bandwidth costs and scalability issues.

-   **Authoritative Server Model:** The server is the absolute source of truth for the game state. Clients send their _inputs_ to the server, but they never directly modify their own state. The server processes these inputs, updates its internal, authoritative state, and then broadcasts the _results_ of those changes to all relevant clients. This prevents cheating and ensures all players have a consistent view of the game world.
    
-   **Event-Based Synchronization (Recommended):** Instead of sending the entire game state every frame, the server sends small, discrete event messages that describe a specific change. This is a highly efficient and scalable pattern.
    
    -   **Client Action:** Player presses the right arrow key. Client emits: `socket.emit('playerInput', { action: 'move', direction: 'right' });`
        
    -   **Server Processing:** The server receives the `'playerInput'` event, validates it (e.g., is the player alive? can they move?), updates the player's position in its authoritative state, and then broadcasts the outcome.
        
    -   **Server Broadcast:** `io.to(room).emit('playerStateChanged', { playerId: socket.id, newPosition: { x: 150, y: 300 } });`
        
-   **Delta-Compression (Advanced):** For games with very high-frequency updates, an even more optimized approach is to send only the properties of the state that have changed since the last update (the "delta"). While this guide will focus on the event-based pattern, frameworks like **Colyseus** have built-in schema and binary delta-compression systems that represent a best-in-class solution for this problem.
    

### **5.4. Lag Compensation and Client-Side Prediction**

Network latency is an unavoidable reality of online gaming. A good user experience depends on effectively hiding this latency from the player through client-side techniques.

-   **The Problem:** If a player presses a key and has to wait for the server's response before their character moves, the game will feel sluggish and unresponsive. This round-trip time (RTT) can be hundreds of milliseconds.
    
-   **Client-Side Prediction:** To combat this, the client **predicts** the outcome of the player's actions and applies them locally _immediately_. When the player presses 'right', their character starts moving right on their screen instantly, without waiting for the server. The input is still sent to the server for validation.
    
-   **Server Reconciliation:** The server processes the input and broadcasts the new authoritative state. When the client receives this update, it compares its predicted position with the server's authoritative position. If there is a discrepancy (e.g., the player's prediction was wrong because they ran into a wall they didn't know about yet), the client must correct its local character's position to match the server's. This correction should be done smoothly (e.g., a quick interpolation) rather than an instant "snap" to avoid visual jarring.
    
-   **Entity Interpolation:** To smooth the movement of _other_ players, the client should not simply teleport their sprites to the new coordinates received in each state update. This would result in jittery movement. Instead, the client should maintain a buffer of recent state updates and smoothly **interpolate** the remote player's sprite from its previous position to its new position over the time interval between updates (e.g., 100-150ms). This creates the illusion of fluid motion, even with infrequent or delayed packets.
    

### **5.5. Scalability and Anti-Cheat**

-   **Scaling Horizontally:** A single Node.js process can only handle a finite number of connections. To scale to support more players, the application must be run on multiple server instances. For Socket.IO to broadcast events across these instances, a **Redis Adapter** (`socket.io-redis`) is required. It uses a Redis pub/sub mechanism to relay events between the different server processes.
    
-   **Anti-Cheat through Server Authority:** As stated in the authoritative server model, the server must _never_ trust the client. All client inputs must be rigorously validated. For example, the server should calculate movement based on elapsed time and known player speed, ignoring any position data sent directly from the client. This prevents common cheats like speed-hacking and teleporting.
    

----------

## **Section 6: Full-Stack Architecture and Development Tooling**

This section unifies the client-side and server-side components into a cohesive system. It defines the development environment, build pipeline, and overarching strategies for state management and error handling, ensuring a smooth and efficient workflow from development to production.

### **6.1. Build Pipeline and Development Server: Vite vs. Webpack**

The choice of a build tool and development server significantly impacts developer productivity. For this project, a comparison between the two leading options, Vite and Webpack, is necessary. The primary factors for consideration are developer experience (DX), performance, and configuration complexity.

**Table: Build Tool Comparison for a Phaser Project**

Feature

Vite

Webpack

**Dev Server Start**

Near-instantaneous

Can take several seconds to minutes

**Core Technology**

Native ES Modules (ESM)

Bundling-based approach

**Hot Module Replacement (HMR)**

Extremely fast and reliable

Slower, full-page reloads are common

**Configuration**

Minimal by default, "just works"

Requires extensive configuration (loaders, plugins)

**Production Build**

Uses Rollup, highly optimized

Highly optimized, vast plugin ecosystem

**Community & Ecosystem**

Modern and rapidly growing

Mature, extensive, but can be complex

Export to Sheets

**Recommendation: Vite**

For a modern project like "Time Oddity," **Vite is the unequivocally recommended choice**. Its architecture, built on top of native browser ES modules, provides a vastly superior developer experience. The near-instant server start and lightning-fast HMR mean that changes in the code are reflected in the browser almost immediately, dramatically speeding up the iteration cycle. While Webpack is powerful and mature, its configuration complexity and slower performance during development are significant drawbacks for a new project that does not require its extensive, and often legacy, plugin ecosystem.

#### **Vite Configuration (`vite.config.js`)**

A boilerplate Vite configuration will be established for the project to handle the specific needs of a full-stack Phaser application.

JavaScript

```
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // If using React for UI overlays

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the backend server
      '/api': 'http://localhost:3000',
      // Proxy Socket.IO connections
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist', // The output directory for the production build
    chunkSizeWarningLimit: 1000, // Adjust based on final asset sizes
  },
});

```

This configuration achieves several key goals:

-   **Development Proxy:** It transparently proxies API (`/api`) and Socket.IO (`/socket.io`) requests from the Vite dev server (e.g., running on port 5173) to the backend Express server (running on port 3000). This elegantly solves CORS issues during local development.
    
-   **Asset Processing:** Vite natively handles common asset types like images and JSON.
    
-   **Production Build:** It configures Vite to build the final, optimized, and minified client-side assets into a `dist` folder, ready for deployment.
    

### **6.2. Full-Stack Data Flow and State Management**

A clear understanding of where the "source of truth" resides for different data is crucial for a stable full-stack application.

-   **Data Flow Diagram:** A visual representation of the data flow for two key scenarios:
    
    1.  **Real-Time Player Movement:**
        
        -   Client (Input) -> Socket.IO Emit (`'playerInput'`) -> Server (Validation) -> Server (State Update) -> Socket.IO Broadcast (`'playerStateChanged'`) -> All Clients (Interpolation).
            
    2.  **Saving Game Progress:**
        
        -   Client (Player Action) -> HTTP POST (`/api/game/save`) -> Server (Auth Middleware) -> Server (Validation) -> Server (Database Write) -> Server (HTTP 200 OK) -> Client (Confirmation).
            
-   **Coordinated State Management:**
    
    -   **Server-Authoritative State:** Any data that affects gameplay fairness or needs to be persisted must be owned by the server. This includes player inventory, health, position, and game progress.
        
    -   **Client-Side State:** Purely cosmetic or transient data should be managed exclusively on the client. This includes particle effect states, UI animation states, and local input states. This separation prevents unnecessary network traffic and reduces server load.
        

### **6.3. Global Error Handling and Logging**

A unified strategy for error handling and logging is essential for debugging issues, especially in production.

-   **Client-Side Error Handling:** A global error handler will be set up in the main client-side script to catch any unhandled exceptions.
    
    JavaScript
    
    ```
    window.addEventListener('error', (event) => {
      // Send the error details to a server logging endpoint
      fetch('/api/log/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: event.message, stack: event.error.stack }),
      });
    });
    
    ```
    
-   **Server-Side Error Handling:** Express has a default error handler, but a custom error-handling middleware will be implemented as the last middleware in the chain. This ensures all errors are caught and logged consistently, and a generic error message is sent to the client, avoiding the leak of sensitive stack traces.
    
-   **Centralized Logging:** For production environments, both client-side and server-side logs should be sent to a dedicated, third-party logging service (e.g., Sentry, LogRocket, Datadog). This provides a single dashboard for monitoring the health of the entire application, correlating client errors with server logs, and setting up alerts for critical issues.
    

### **6.4. Production Deployment Setup**

The process for deploying the application involves building the client assets and configuring the server to serve them and run reliably.

1.  **Build the Client:** Run the build script defined in `package.json`.
    
    Bash
    
    ```
    npm run build
    
    ```
    
    This command will invoke Vite to create the optimized production assets in the `dist` folder.
    
2.  **Configure Express Server:** The Express server must be configured with `express.static('dist')` to serve the contents of the `dist` folder. It should also include a catch-all route that serves `index.html` for any non-API routes, which is necessary for client-side routing to work correctly.
    
3.  **Process Manager:** In a production environment, the Node.js server should not be run directly with `node server.js`. A process manager like **PM2** must be used. PM2 provides essential features like:
    
    -   **Automatic Restarts:** It will automatically restart the application if it crashes.
        
    -   **Clustering:** It can run the application in cluster mode, creating a worker process for each CPU core to maximize performance on a multi-core server.
        
    -   **Logging and Monitoring:** It provides built-in tools for managing and viewing application logs.
        
4.  **Deployment Environment:** The application can be deployed to any platform that supports Node.js, such as Heroku, DigitalOcean, AWS EC2, or Vercel. The deployment process will involve setting up environment variables (for secrets and configuration) and running the application with PM2.
    

----------

## **Section 7: Game Implementation Blueprints for "Time Oddity"**

This section provides the concrete, code-level implementation patterns for the unique mechanics that define "Time Oddity." These blueprints serve as the practical foundation for the game's core features, translating the architectural decisions from previous sections into actionable code.

### **7.1. The Time Control System: A Deep Dive**

The signature mechanic of "Time Oddity" is the player's ability to manipulate the timeline of specific game objects. A robust and performant implementation of this system is critical. The chosen approach is to record the state of "rewindable" objects at fixed intervals and then replay this history when the rewind mechanic is activated. The performance of this system is directly tied to the size and efficiency of the data structure used for recording history; therefore, a lightweight state object is essential.

#### **The `TemporalState` Object**

At the heart of the rewind system is the `TemporalState` object. This object must be as lightweight as possible to minimize memory consumption and the performance cost of recording. It will capture only the essential physics and animation properties of a game object at a single point in time.

**Table: `TemporalState` Object Definition**

Property

Type

Description

Rationale

`x`

`number`

The horizontal position of the object's body.

Essential for repositioning.

`y`

`number`

The vertical position of the object's body.

Essential for repositioning.

`vx`

`number`

The horizontal velocity of the object's body.

Required to restore motion state.

`vy`

`number`

The vertical velocity of the object's body.

Required to restore motion state.

`r`

`number`

The rotation (angle) of the object.

For objects that can rotate.

`av`

`number`

The angular velocity of the object's body.

To restore rotational motion.

`f`

`string`

The key of the current animation frame.

To restore the visual animation state.

`a`

`boolean`

The active/visible state of the object.

Crucial for handling object creation/destruction within the timeline.

Export to Sheets

#### **The `TimeManager` and Recording Logic**

A global `TimeManager` class will orchestrate the entire process.

1.  **Registration:** Rewindable objects must register themselves with the `TimeManager` upon creation.
    
2.  **State Recording:** The `TimeManager`'s `update` method, called from the main game scene's `update` loop, will iterate through all registered objects. For each object, it creates a new `TemporalState` and pushes it onto a history array associated with that object. To prevent unbounded memory growth, this history will be implemented as a fixed-size circular buffer, storing only the last N seconds of states.
    
3.  **Rewind Activation:** When the player activates the rewind, the `TimeManager` enters a "rewinding" state. In this state, instead of recording, its `update` loop will `pop` the most recent state from each object's history and apply it back to the object.
    
    JavaScript
    
    ```
    // Simplified logic for applying a rewind state
    const lastState = history.pop();
    if (lastState) {
        gameObject.body.reset(lastState.x, lastState.y); // Directly set position and reset forces
        gameObject.body.setVelocity(lastState.vx, lastState.vy); // Restore velocity
        gameObject.setAngle(lastState.r);
        gameObject.body.setAngularVelocity(lastState.av);
        gameObject.setActive(lastState.a).setVisible(lastState.a);
        gameObject.anims.setCurrentFrame(gameObject.anims.get(lastState.f).frames); // Restore frame
    }
    
    ```
    

#### **Handling Object Lifecycle: The "Echo" System**

A major challenge is handling objects that are created or destroyed within the rewindable time window. For example, if a bullet is fired and hits a wall, it gets destroyed. If the player then rewinds time, that bullet must reappear.

The solution is a **"soft-destroy"** or **"fake-destroy"** pattern. Instead of calling

`gameObject.destroy()`, which removes the object permanently, we will deactivate it by setting `gameObject.setActive(false)` and `gameObject.setVisible(false)`. The `TemporalState` object's `a` (active) property records this state change. When rewinding, if a historical state has `a: true`, the object is simply made active and visible again. This avoids the significant performance cost of destroying and recreating objects. The object can be truly destroyed later if it remains inactive for a period longer than the rewind buffer.

### **7.2. Platformer Character Controller: A State Machine Approach**

A robust character controller is the foundation of any good platformer. Attempting to manage a character's logic with a series of boolean flags (`isJumping`, `isDashing`, `isAttacking`) quickly leads to convoluted, buggy code. A **Finite State Machine (FSM)** is the industry-standard pattern for solving this problem. An FSM ensures that the character can only be in one well-defined state at a time, and it formalizes the transitions between states, making the code cleaner, more scalable, and easier to debug.

#### **State Machine Implementation**

A generic `StateMachine` class will be created, which can manage states for any game entity. The `Player` class will contain an instance of this state machine. Each state (e.g., `IdleState`, `RunState`, `JumpState`) will be its own class with three methods: `enter()`, `execute(time, delta)`, and `exit()`.

#### **Player State Machine Definition**

The following table defines the core states for the "Time Oddity" player character.

**Table: Player Character State Machine**

State

Enter Action

`execute()` Action (per frame)

Exit Condition(s) & New State

**`IdleState`**

`player.anims.play('idle')` `player.body.setVelocityX(0)`

Check for horizontal input.

`input detected` -> `RunState` `jump pressed` -> `JumpState`

**`RunState`**

`player.anims.play('run')`

Apply horizontal velocity based on input. Check for jump input. Check if `body.onFloor()`.

`no horizontal input` -> `IdleState` `jump pressed` -> `JumpState` `not on floor` -> `FallState`

**`JumpState`**

`player.anims.play('jump')` Apply initial upward velocity.

Apply gravity. Allow for variable jump height based on key hold duration.

`body.velocity.y >= 0` -> `FallState`

**`FallState`**

`player.anims.play('fall')`

Apply gravity.

`body.onFloor()` -> `IdleState` (or `RunState` if input held)

**`RewindState`**

`player.anims.play('rewind_effect')` Disable player input processing.

(State is controlled externally by `TimeManager`)

`TimeManager` signals end -> `IdleState`

Export to Sheets

### **7.3. UI/HUD Architecture and Implementation**

To create a flexible and performant UI, it must be decoupled from the main game logic and rendering.

#### **Decoupled UI Scene**

The standard and most effective pattern in Phaser 3 is to create a dedicated `UIScene` that runs in parallel with the main `GameScene`. The

`GameScene` is launched, and then the `UIScene` is launched on top of it (`this.scene.launch('UIScene')`). This architecture provides several key benefits:

-   **Independent Cameras:** The UI has its own camera, so zooming or shaking the game camera does not affect the HUD's position or scale.
    
-   **Independent Input:** The UI scene can have its own input handlers for buttons and menus without interfering with game input.
    
-   **Clear Separation of Concerns:** UI logic is cleanly separated from game logic, making both easier to manage and debug.
    

#### **HUD State Updates via Event Emitter**

The `GameScene` should never directly manipulate UI elements. Instead, it should communicate state changes through the global event emitter (`this.game.events`). The `UIScene` listens for these events and updates its own elements accordingly.

**Example Flow:**

1.  **GameScene:** Player collects a coin.
    
    JavaScript
    
    ```
    // In the coin collection callback
    this.score += 10;
    this.game.events.emit('scoreUpdated', this.score);
    
    ```
    
2.  **UIScene:** The HUD's score text updates.
    
    JavaScript
    
    ```
    // In UIScene's create() method
    this.scoreText = this.add.text(...);
    this.game.events.on('scoreUpdated', (newScore) => {
        this.scoreText.setText(`Score: ${newScore}`);
    }, this);
    
    ```
    

This one-way data flow from game to UI creates a robust, loosely coupled system.

#### **Interactive Menus and Responsive Layout**

-   **Buttons:** UI elements like buttons in the `UIScene` are made interactive with `button.setInteractive()`. Their `'pointerdown'` event listeners will emit events back to the global event emitter (e.g., `this.game.events.emit('pauseGame')`), which a central `GameManager` or the `GameScene` can listen for.
    
-   **Responsive Logic:** All UI elements must be positioned using the responsive layout patterns detailed in Section 1.7. This involves anchoring elements to the screen's corners or center and using the `resize` event to handle dynamic changes in screen size, ensuring the HUD looks correct on all devices.
    

----------

## **Section 8: AI-Assisted Development and LLM Integration**

A unique requirement of the "Time Oddity" project is to establish a development ecosystem that actively leverages Large Language Models (LLMs) to accelerate development, improve code quality, and assist in debugging. This requires a deliberate approach to documentation and workflow design, treating the LLM as a proficient but context-dependent development partner.

### **8.1. LLM-Friendly Documentation Principles**

The effectiveness of an LLM is directly proportional to the quality and structure of the context it is provided. LLMs have knowledge cut-off dates and perform poorly with ambiguous or unstructured information. This entire guide has been authored with the following principles to make it a high-quality, reliable knowledge base for an LLM assistant.

-   **Semantic Markdown Structure:** The use of clear, hierarchical headings (`#`, `##`, `###`), bulleted and numbered lists, and tables creates a machine-readable document structure. This allows an LLM to easily parse the document's hierarchy and understand the relationships between different sections.
    
-   **Tagged Code Blocks:** All code snippets are enclosed in markdown code blocks with explicit language identifiers (e.g., ` ```javascript`). This is a critical signal that tells the LLM how to interpret the block's content, enabling syntax highlighting, analysis, and generation of similar code.
    
-   **Self-Contained, Atomic Examples:** Each code example is designed to be as self-contained as possible. It includes necessary imports and comments to be understood without requiring the LLM to read the entire document. This makes the examples ideal for use in "few-shot" prompting, where the developer provides a few examples of a pattern and asks the LLM to generate a new one.
    
-   **The `llms.txt` Standard:** For larger projects, the emerging `llms.txt` standard provides a manifest file for LLM crawlers, pointing them to canonical, machine-readable versions of documentation. For this project, a similar principle will be applied internally: this guide serves as the central
    
    `llms.md` file, the primary source of truth to be fed into any LLM-based tool.
    

### **8.2. Generative Code and Testing Patterns**

By providing the LLM with the high-quality context from this guide, we can establish powerful generative workflows.

#### **Boilerplate Code Generation**

The patterns and architectural decisions in this guide can be used as templates for LLM-driven code generation.

**Example Prompt for Generating a New Scene:**

> "Using the established patterns from the Time Oddity technical guide, generate a new Phaser 3 Scene class named `BossScene`. It should extend a `BaseScene` class. In its `preload` method, it should load a spritesheet named 'boss-sprite' from 'assets/sprites/boss.png' with a frame size of 128x128, and a tilemap named 'boss-arena' from 'assets/tilemaps/boss_arena.json'. In the `create` method, it should log 'BossScene created' to the console."

#### **Automated Test Generation**

LLMs are particularly effective at generating unit and integration tests, especially when given a clear function and its expected behavior.

**Example Prompt for Generating Unit Tests:**

> "Here is the `Player` class from the Time Oddity project, which includes a `takeDamage(amount)` method. The player's initial health is 100. Write a suite of unit tests for this method using the Jest testing framework. The tests should verify that:
> 
> 1.  Calling `takeDamage(20)` correctly reduces health to 80.
>     
> 2.  The global event emitter fires a `'playerHealthChanged'` event with the new health value.
>     
> 3.  Health does not drop below 0.
>     
> 4.  A `'playerDied'` event is emitted exactly once when health drops to 0 or below."
>     

#### **LLM-Assisted Debugging Workflow**

A structured approach to debugging with an LLM can significantly reduce the time spent identifying the root cause of an issue.

**The Workflow:**

1.  **Capture the Error:** Obtain the full error message and stack trace from the browser console or server logs. The unified logging system from Section 6.3 is designed for this.
    
2.  **Isolate the Relevant Code:** Identify the function or module where the error occurred. Copy the relevant, self-contained code snippet from the project (which should follow the patterns in this guide).
    
3.  **Construct the Prompt:** Combine the context into a clear prompt for the LLM.
    

**Example Debugging Prompt:**

> "I am working on the 'Time Oddity' game, following the project's technical guide. I am encountering the following error in the browser console:
> 
> ```
> TypeError: Cannot read properties of undefined (reading 'play')
> at Player.jump (Player.js:45:18)
> 
> ```
> 
> Here is the relevant `Player.js` code, which uses the state machine pattern from the guide:
> 
> JavaScript
> 
> ```
> //
> 
> ```
> 
> Based on the error and the provided code, what is the likely cause of this `TypeError`? The error occurs on the line `this.scene.audioManager.play('jump')`."

By providing the error, the code, and the context that the project uses a specific `AudioManager` pattern, the LLM can quickly deduce that `this.scene.audioManager` is likely `undefined` and suggest checking if the `AudioManager` was correctly instantiated and passed to the scene. This is far more effective than simply asking "why is my code broken?"

----------

## **Conclusions**

This comprehensive guide establishes the definitive technical foundation for the "Time Oddity" game project. It synthesizes official documentation, community best practices, and expert analysis into a single, authoritative source of truth for the entire development lifecycle. The key architectural decisions and implementation patterns presented herein are designed to produce a high-quality, performant, and maintainable 2D platformer.

The core conclusions of this analysis are:

1.  **A Hybrid, Best-in-Class Stack is Optimal:** The chosen technology stack—Phaser 3 for rendering and physics, GSAP for animation, and Howler.js for audio—is deliberately specialized. By offloading animation and audio to dedicated, superior libraries, the architecture mitigates known weaknesses in Phaser's native systems, resulting in a more robust and performant client.
    
2.  **Performance and Security are Foundational, Not Optional:** The guide mandates proactive performance optimization patterns, such as object pooling for the time-rewind mechanic, and a "secure-by-default" server setup including Helmet, rate limiting, and input validation. These elements must be integrated from the project's inception, not as afterthoughts.
    
3.  **Decoupled, Event-Driven Architecture is Key to Scalability:** The recommended patterns—such as separating the UI into its own scene, using a global event emitter for communication, and employing an event-based model for real-time state synchronization—create a loosely coupled system. This modularity is essential for managing complexity as the game grows and for simplifying debugging and testing.
    
4.  **AI-Assisted Development Requires Deliberate Design:** The structure and content of this guide are intentionally formatted to be LLM-friendly. By providing clear, structured, and self-contained information, this document transforms from a passive reference into an active, high-quality context for AI development partners. This approach is designed to accelerate boilerplate generation, automate testing, and streamline the debugging process, fully embracing a modern, AI-augmented development workflow.
    

By adhering to the principles, patterns, and blueprints laid out in this guide, the "Time Oddity" development team is equipped to build the game efficiently, consistently, and to the highest technical standard.

# Testing and Mocking in Time Oddity

This document serves as the authoritative guide for writing and maintaining tests within the "Time Oddity" codebase. A robust testing strategy is crucial for our project's success, enabling confident refactoring, reducing regressions, and supporting our modular architecture. Adherence to these principles and patterns is essential for all contributors.

## General Principles of Testing in "Time Oddity"

Our testing philosophy is built on two core pillars: a commitment to Test-Driven Development (TDD) as a design practice and a clear classification of test types to ensure we apply the right tool for the right job.

### The Role of Test-Driven Development (TDD)

In this project, Test-Driven Development is not merely a testing strategy but a fundamental design methodology. We follow the "Red-Green-Refactor" cycle for all new features and bug fixes. This process involves:

1.  **Red:** Write a failing automated test that defines a new function or improvement.
    
2.  **Green:** Write the minimum amount of code necessary to make the test pass.
    
3.  **Refactor:** Clean up and optimize the code while ensuring all tests continue to pass.
    

Adopting TDD provides several critical benefits to the "Time Oddity" project:

-   **Supporting Modularity:** TDD naturally leads to cleaner, more modular, and loosely coupled code. By writing a test first, developers are forced to consider a component's public API and its dependencies upfront, which aligns perfectly with our modular architecture.
    
-   **Enabling Confident Refactoring:** The comprehensive test suite created through TDD acts as a safety net. This allows the team to improve and refactor the codebase without the fear of introducing breaking changes, which is vital for long-term maintainability and reducing technical debt.
    
-   **Reducing Regression and Bugs:** TDD provides a rapid feedback loop, catching defects at the earliest and least expensive stage of development. As the codebase grows, our automated test suite ensures the integrity of existing features and prevents unintended side effects from new code.
    
-   **Living Documentation:** The test suite serves as a form of executable documentation. A well-written test clearly articulates the intended behavior of a module, making it an invaluable resource for onboarding new contributors and understanding system functionality.
    

### Test Classification: Unit, Integration, and Beyond

To ensure our testing efforts are efficient and effective, we adhere to the principles of the testing pyramid. This means we prioritize a large base of fast, isolated unit tests, supplemented by a smaller, more focused layer of integration tests.

#### Unit Tests

-   **Definition:** A unit test verifies the smallest testable piece of our application—such as a single function, method, or class—in complete isolation from its dependencies. All external modules (Phaser, GSAP, etc.) and internal collaborators are replaced with mocks.
    
-   **Application in _Time Oddity_:** Unit tests are the default and most common type of test. They are required for all new business logic, including:
    
    -   Utility functions (e.g., math calculations, data transformations).
        
    -   State machine logic (transitions, guards, and actions).
        
    -   Individual classes or components where dependencies can be effectively mocked.
        
-   **Characteristics:** Unit tests are extremely fast, reliable, and easy to debug. A failing unit test points directly to the specific piece of code that is broken.
    

#### Integration Tests

-   **Definition:** An integration test verifies the interaction and data flow _between_ multiple modules. It ensures that different components of the game work together as a cohesive system.
    
-   **Application in _Time Oddity_:** Integration tests are used sparingly for critical workflows where mocking would be overly complex or would obscure potential interface bugs. Examples include:
    
    -   Verifying that a physics collision event correctly triggers a state transition in the player's state machine.
        
    -   Testing the full flow from a keyboard input event to a resulting change in player velocity.
        
-   **Characteristics:** Integration tests are slower and can be more brittle than unit tests. A failure might indicate an issue in any of the integrated components or in the interface between them.
    

Game development often blurs the line between unit and integration testing, as systems like physics and rendering are tightly coupled with game logic. Our strategy is to always favor **unit tests with high-fidelity mocks**. For instance, instead of running a full physics engine, we will unit test a player controller against a mock physics body that simulates the required API (`setVelocity`, `body.touching`, etc.). This provides the speed of a unit test while still verifying the logic against the physics system's _contract_. True integration tests are reserved for cases where we must validate the actual library integrations.

Test Type

Purpose

Scope

Speed

When to Use in "Time Oddity"

**Unit Test**

Verify a single function/class works correctly in isolation.

One module, all dependencies mocked.

Very Fast (<50ms)

State machine transitions, utility functions, component logic, time-based cooldowns.

**Integration Test**

Verify multiple modules interact correctly.

Two or more real or partially-mocked modules.

Slower (>100ms)

Physics collision callbacks, input-to-state-machine flow, complex animation sequences.

Export to Sheets

## Mocking External Libraries

Our tests run in a Node.js environment via Jest, which lacks the browser-specific APIs (like canvas rendering and audio playback) that our core libraries depend on. Therefore, effective mocking is not optional—it is essential for our entire testing strategy.

### Mocking Phaser 3

Phaser is a browser-native framework that requires a `<canvas>` element and a game loop to function. Direct instantiation of Phaser objects in Jest will fail. Our approach is to use manual mocks to provide lightweight, test-friendly fakes for Phaser's complex systems.

#### Initial Setup: `jest-canvas-mock`

The most common initial error when testing a Phaser project is `TypeError: getContext is not a function`. This is because `jsdom` does not implement the Canvas API. We solve this globally by using the `jest-canvas-mock` library, which is configured once in our `jest.setup.js` file.

#### Mocking Scenes and the Scene Lifecycle

A `Phaser.Scene` is the heart of any game screen, managing game objects and the core `preload`, `create`, and `update` lifecycle methods. To test a class that extends `Phaser.Scene`, we must provide mocks for the properties and methods it inherits. Our shared `phaserMock.js` provides a reusable mock scene object.

JavaScript

```
// tests/mocks/phaserMock.js

// A mock GameObject with chainable methods and mock properties
export const mockGameObject = {
  // Mock properties
  x: 0,
  y: 0,
  active: true,
  // Mock methods that return `this` to be chainable
  setOrigin: jest.fn().mockReturnThis(),
  setDepth: jest.fn().mockReturnThis(),
  // Mock animation and physics properties
  anims: {
    play: jest.fn(),
    isPlaying: false,
    currentAnim: null,
  },
  body: {
    setVelocityX: jest.fn(),
    setVelocityY: jest.fn(),
    setBounce: jest.fn(),
    setCollideWorldBounds: jest.fn(),
    setAllowGravity: jest.fn(),
    touching: { down: false, up: false, left: false, right: false },
    blocked: { down: false, up: false, left: false, right: false },
  },
  // Mock other common GameObject methods
  destroy: jest.fn(),
};

// A mock Scene with mock systems
export const mockScene = {
  add: {
    sprite: jest.fn(() => mockGameObject),
    text: jest.fn(() => ({...mockGameObject, setText: jest.fn() })),
  },
  physics: {
    add: {
      sprite: jest.fn(() => mockGameObject),
      collider: jest.fn(),
    },
    world: {
      enable: jest.fn(),
    },
  },
  input: {
    keyboard: {
      addKey: jest.fn(() => ({ isDown: false, isUp: true })),
      on: jest.fn(),
      keys:,
    },
    on: jest.fn(),
  },
  anims: {
    create: jest.fn(),
    generateFrameNumbers: jest.fn(),
  },
  time: {
    addEvent: jest.fn(),
  },
  // Lifecycle methods for spying
  preload: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

```

To use this in a test, you mock the `phaser` module and instruct it to use your mock implementation.

JavaScript

```
// In a test file, e.g., MyScene.test.js
import { Scene } from 'phaser';
import { mockScene } from '../mocks/phaserMock';
import MyScene from '../../src/scenes/MyScene';

// Mock the entire phaser module
jest.mock('phaser', () => ({
  Scene: jest.fn().mockImplementation(() => mockScene),
  // Add any other Phaser constants or classes needed
  Input: {
    Keyboard: {
      KeyCodes: {
        W: 87,
        A: 65,
        S: 83,
        D: 68,
        SPACE: 32,
      },
    },
  },
}));

describe('MyScene', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure isolation
    jest.clearAllMocks();
  });

  test('should create a player sprite on create', () => {
    const scene = new MyScene();
    scene.create();
    expect(mockScene.physics.add.sprite).toHaveBeenCalledWith(100, 100, 'player');
  });
});

```

#### Mocking the Physics System

Our game relies heavily on Arcade Physics. To test logic that controls movement or checks collisions, we need to simulate the physics body's API without running a full simulation. The `mockGameObject` in our `phaserMock.js` includes a `body` object with `jest.fn()` spies for methods like `setVelocityX` and properties like `touching.down` that can be manually set in tests to simulate different physical states.

#### Mocking Input Handlers

Input logic must be tested without requiring a physical keyboard or mouse. Our mock scene's `input.keyboard` object provides a mock `addKey` method. In a test, you can control the `isDown` property of the returned mock key to simulate a key press and verify that the `update` loop responds correctly.

#### Mocking the Animation Manager

We need to confirm that our code calls `sprite.anims.play()` with the correct animation key, not actually see the animation. The `anims` property on our `mockGameObject` contains a `play` spy, allowing for assertions like `expect(player.anims.play).toHaveBeenCalledWith('player-run', true);`.

### Mocking GSAP for Animation Testing

GSAP animations are asynchronous and time-dependent, making them unsuitable for direct execution in a test environment. Our strategy is to mock GSAP's API to test the _logic that initiates animations_ and to use Jest's fake timers to control the animation "timeline" deterministically.

#### Testing `gsap.to()` and Callbacks

A simple `gsap.to()` call can be mocked with a `jest.fn()`. For animations with `onComplete` callbacks, the mock implementation can be configured to invoke the callback immediately, allowing for verification of post-animation logic.

JavaScript

```
// tests/mocks/gsapMock.js
export const mockTimeline = {
  to: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  add: jest.fn().mockReturnThis(),
  play: jest.fn().mockReturnThis(),
  kill: jest.fn(),
  eventCallback: jest.fn((type, callback, params) => {
    if (type === 'onComplete' && callback) {
      callback(...(params ||));
    }
  }),
};

export const gsapMock = {
  to: jest.fn((target, vars) => {
    if (vars.onComplete) {
      vars.onComplete(...(vars.onCompleteParams ||));
    }
    return { kill: jest.fn() }; // Return a mock tween
  }),
  timeline: jest.fn(() => mockTimeline),
};

```

#### Mocking Timelines and Chained Calls

GSAP's timelines use a chainable API (e.g., `tl.to(...).to(...)`). Our mock timeline object must support this pattern by having its methods return `this`. Jest's `mockReturnThis()` is perfect for this.

JavaScript

```
// In a test file
import { gsap } from 'gsap';
import { gsapMock } from '../mocks/gsapMock';

jest.mock('gsap');

// Apply the mock implementation
gsap.to.mockImplementation(gsapMock.to);
gsap.timeline.mockImplementation(gsapMock.timeline);

describe('Animation Sequence', () => {
  test('should create a timeline with two sequential tweens', () => {
    const sequence = new MyAnimationSequence();
    sequence.start();

    expect(gsap.timeline).toHaveBeenCalled();
    // Assuming mockTimeline was returned and is accessible or spied upon
    expect(mockTimeline.to).toHaveBeenCalledTimes(2);
  });
});

```

### Mocking Howler.js for Audio Triggers

Audio playback is a browser-only feature that we must bypass in tests. The goal is to verify that our code attempts to create and play sounds correctly. We achieve this by mocking the `howler` module, specifically replacing the `Howl` class constructor with a spy that returns a mock instance.

JavaScript

```
// tests/mocks/howlerMock.js
export const mockHowlInstance = {
  play: jest.fn().mockReturnValue(Math.random()), // Return a unique sound ID
  stop: jest.fn(),
  volume: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  state: jest.fn().mockReturnValue('loaded'),
};

export const HowlMock = jest.fn().mockImplementation(() => mockHowlInstance);

```

This setup allows tests to assert that a `new Howl()` was called with the correct sound file and that the `.play()` method was subsequently invoked on the instance.

JavaScript

```
// In a test file
import { Howl } from 'howler';
import { HowlMock, mockHowlInstance } from '../mocks/howlerMock';

jest.mock('howler', () => ({
  Howl: HowlMock,
  Howler: { // Also mock the global Howler object if used
    volume: jest.fn(),
  },
}));

describe('Audio Triggers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create and play the jump sound', () => {
    const audioManager = new AudioManager();
    audioManager.playSound('jump');

    expect(HowlMock).toHaveBeenCalledWith({ src: ['sounds/jump.wav'] });
    expect(mockHowlInstance.play).toHaveBeenCalledTimes(1);
  });
});

```

## Testing Core Gameplay Systems

With robust mocking strategies in place, we can now effectively test our project's most complex internal systems: state machines and time-based mechanics.

### Testing Player and Enemy State Machines

Our state machines are designed to be deterministic: a given state receiving a specific event will always produce the same new state and side effects. This makes them ideal candidates for unit testing. We test them as pure logic, independent of the game loop.

#### Asserting State Transitions and Guard Conditions

We write tests to verify every possible transition from every state. This includes sending both valid events that should cause a transition and invalid events that should be ignored (often due to a guard condition).

JavaScript

```
import { playerMachine } from '../../src/entities/player/playerMachine';

describe('playerMachine', () => {
  describe('from "idle" state', () => {
    it('should transition to "running" on MOVE event', () => {
      const nextState = playerMachine.transition('idle', { type: 'MOVE' });
      expect(nextState.matches('running')).toBe(true);
    });

    it('should transition to "jumping" on JUMP event', () => {
      const nextState = playerMachine.transition('idle', { type: 'JUMP' });
      expect(nextState.matches('jumping')).toBe(true);
    });
  });

  describe('from "dashing" state', () => {
    it('should NOT transition to "jumping" on JUMP event due to guard', () => {
      // Force the machine into the 'dashing' state for the test
      const dashingState = playerMachine.transition('idle', 'DASH');
      
      // Attempt an invalid transition
      const nextState = playerMachine.transition(dashingState, { type: 'JUMP' });
      
      // Assert that the state has not changed
      expect(nextState.matches('dashing')).toBe(true);
      expect(nextState.changed).toBe(false);
    });
  });
});

```

#### Verifying Entry/Exit Side Effects

State machines trigger actions (side effects) upon entering or exiting a state, such as playing an animation or a sound. We test these by injecting mocked services into our state machine logic and asserting that the correct methods are called.

JavaScript

```
// Assume a factory function for the machine that accepts services
import { createPlayerMachine } from '../../src/entities/player/playerMachine';

describe('Player Machine Side Effects', () => {
  const mockAnimationManager = { play: jest.fn() };
  const mockAudioService = { playSound: jest.fn() };
  const machine = createPlayerMachine({
    animManager: mockAnimationManager,
    audioService: mockAudioService,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should play the "dash" sound and animation on entering "dashing" state', () => {
    // The transition triggers the 'entry' actions for the 'dashing' state
    machine.transition('idle', { type: 'DASH' });

    expect(mockAudioService.playSound).toHaveBeenCalledWith('dash');
    expect(mockAnimationManager.play).toHaveBeenCalledWith('player-dash');
  });
});

```

### Testing Time-Based Mechanics with Fake Timers

Game mechanics like ability cooldowns or our core time-rewind feature rely on timers. Using Jest's fake timers allows us to test this logic instantly and deterministically, without waiting for real time to pass.

#### Validating Cooldowns and Delays

To test a cooldown, we enable fake timers with `jest.useFakeTimers()`. After triggering the ability, we assert that it is on cooldown. We then use `jest.advanceTimersByTime(ms)` to fast-forward the clock and assert that the ability is available again.

JavaScript

```
// In a Player class test file
jest.useFakeTimers();

describe('Player Dash Cooldown', () => {
  it('should prevent dashing again until the 1-second cooldown has passed', () => {
    const player = new Player(); // Assume Player has a dash method with a 1000ms cooldown
    
    // First dash
    const didDash1 = player.dash();
    expect(didDash1).toBe(true); // The first dash should succeed
    expect(player.canDash()).toBe(false);

    // Advance time by less than the cooldown
    jest.advanceTimersByTime(999);
    expect(player.canDash()).toBe(false);
    const didDash2 = player.dash();
    expect(didDash2).toBe(false); // Second dash should fail

    // Advance time to exactly the cooldown duration
    jest.advanceTimersByTime(1);
    expect(player.canDash()).toBe(true);
    const didDash3 = player.dash();
    expect(didDash3).toBe(true); // Third dash should succeed
  });
});

```

#### Synchronizing GSAP Effects with Fake Timers

Fake timers are essential for testing GSAP animations that have a `delay`. By combining our GSAP mock with fake timers, we can precisely verify that animations start at the correct time.

JavaScript

```
jest.useFakeTimers();
jest.mock('gsap');
import { gsap } from 'gsap';

describe('Delayed Effects', () => {
  it('should trigger a fade-in animation after a 500ms delay', () => {
    const effect = new FadeInEffect(); // Assumes this calls gsap.to with a delay
    effect.trigger();

    // Immediately after, the animation should not have been called
    expect(gsap.to).not.toHaveBeenCalled();

    // Advance time just before the delay expires
    jest.advanceTimersByTime(499);
    expect(gsap.to).not.toHaveBeenCalled();

    // Advance time past the delay
    jest.advanceTimersByTime(1);
    expect(gsap.to).toHaveBeenCalledTimes(1);
    expect(gsap.to).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ opacity: 1 }));
  });
});

```

## Test Suite Architecture and Utilities

A well-organized test suite is scalable, maintainable, and easy for all contributors to navigate. We follow specific conventions for directory structure and the creation of reusable test utilities.

### Recommended Directory Structure

To balance discoverability with a clean separation of concerns, we use a hybrid approach: tests are co-located with the code they test, while shared mocks and utilities reside in a dedicated `tests` directory.

```
src/
└── components/
    └── Player/
        ├── Player.js
        └── Player.test.js      # Test file co-located with its source
tests/
├── mocks/                    # Centralized, reusable mocks
│   ├── phaserMock.js
│   ├── gsapMock.js
│   └── howlerMock.js
└── utils/
    ├── testHelpers.js        # Reusable helper functions
    └── setup.js              # Global Jest setup file (for jest-canvas-mock)

```

-   **Co-located Tests (`*.test.js`):** This is our default pattern. Placing a test file next to its source file makes it easy to find and encourages testing as an integral part of development.
    
-   **`tests/mocks/`:** This directory contains our manual mocks for external libraries. Centralizing them promotes reuse and ensures a consistent mock foundation across the entire test suite.
    
-   **`tests/utils/`:** This directory houses global setup files and reusable helper functions, such as a factory for creating a fully mocked player instance.
    

### Creating Reusable Test Utilities and Shared Mocks

To keep tests clean and avoid repetitive setup code, we create helper functions for common tasks. The `tests/utils/testHelpers.js` file is the designated location for these utilities.

Contributors should feel empowered to extend the shared mocks in `tests/mocks/` whenever new functionality from a library is introduced. This collaborative maintenance ensures our mocks evolve with the codebase.

## Automation and Continuous Integration

Our tests are automated to provide rapid feedback and act as a quality gate, ensuring that only high-quality, working code is merged into our main branches.

### Test Execution in the CI Pipeline

Our Continuous Integration (CI) pipeline, managed via GitHub Actions, executes the entire test suite in a headless Node.js environment on every push and pull request. This is made possible by our comprehensive mocking strategy, which removes dependencies on browser-specific rendering and audio engines.

The CI workflow (`.github/workflows/tests.yml`) executes the following core steps:

1.  **Checkout Code:** Fetches the latest version of the branch.
    
2.  **Setup Node.js:** Configures the correct Node.js version.
    
3.  **Install Dependencies:** Runs `npm install` to get all required packages.
    
4.  **Run Tests:** Executes the test suite with `npm test`.
    

For larger test suites, performance can be optimized by adjusting the number of parallel workers (`--maxWorkers`) or by sharding tests across multiple CI runners.

### Enforcing Quality with Pre-Commit Hooks (Husky & lint-staged)

To catch issues before they are even committed, we use Git hooks. This provides the fastest possible feedback loop for developers.

-   **Tooling:** We use **Husky** to manage the Git hooks and **lint-staged** to run commands only on files that have been staged for a commit.
    
-   **Configuration:** The `.husky/pre-commit` script is configured to run `npx lint-staged`. The `lint-staged` configuration in `package.json` is set to run our linter/formatter and execute Jest on the staged files. We use `jest --bail --findRelatedTests` to ensure maximum performance by only running tests relevant to the changed files and stopping immediately on the first failure.
    

## Troubleshooting and Common Gotchas

This section serves as a first-stop diagnostic guide for developers encountering common testing issues.

### Frequent Contributor Issues and Solutions

Cryptic error messages are a common source of frustration when working with a complex, mocked environment. The following table maps frequent errors to their likely causes and solutions.

Error Message

Likely Cause

Solution

`TypeError: Cannot read property 'add' of undefined`

The Phaser Scene mock is incomplete or not being used. The test is trying to call `scene.add` but `scene` is undefined.

Ensure your test file correctly mocks the `phaser` module. Verify that the mock scene object provides an `add` property which is an object containing mock methods (e.g., `sprite: jest.fn()`).

`TypeError: (0 , _gsap.gsap).to is not a function`

GSAP has not been mocked, or the mock is not being applied correctly. Jest is trying to call the real `gsap.to`.

Place `jest.mock('gsap');` at the top of your test file. Ensure you are providing a mock implementation for `gsap.to` if needed.

`Test suite failed to run: TypeError: Cannot read property 'position' of undefined`

A known issue with Phaser's Matter.js `Transform` component being accessed without a mock `body` object.

Ensure your mock `GameObject` (and any mock physics sprite) provides a default `body` object, even if it's empty, e.g., `body: { position: { x: 0, y: 0 } }`.

`Timeout - Async callback was not invoked`

An asynchronous test is not resolving. This is often due to a forgotten `await` or `return` statement for a promise-based assertion.

Always `await` promises within an `async` test function. If asserting a promise resolution/rejection, `return expect(myPromise)...`.

Export to Sheets

### Best Practices for Avoiding Flaky Tests

Flaky tests, which pass or fail intermittently, undermine confidence in the test suite. Follow these practices to ensure reliability:

-   **Isolate Tests:** Always reset mocks between tests. Use `jest.clearAllMocks()` in a global `afterEach` block (configured in `jest.setup.js`). For tests that mutate a module, use `jest.resetModules()` to ensure a clean state for the next test.
    
-   **Handle Asynchronous Code Correctly:** A test involving a promise that lacks `async/await` or a `return` statement will always pass synchronously, regardless of whether the promise resolves or rejects. This creates dangerous false positives.
    
-   **Avoid Barrel File Imports:** Do not use "barrel" files (`index.js` that re-export multiple modules) for imports within test files. This can dramatically slow down Jest's startup time by forcing it to resolve a large dependency graph, even for a simple test. Always favor direct imports: `import { Player } from '../components/Player/Player';`.

## New Testing Patterns (Phase 3.bis)

### Centralized Mocks
All manual mocks for Phaser, GSAP, and Howler.js are now located in `tests/mocks/`. Test files should import and use these mocks, not define their own or use inline mocks.

**Example:**
```js
import '../tests/mocks/phaserMock.js';
import '../tests/mocks/gsapMock.js';
import '../tests/mocks/howlerMock.js';
```

### Test Isolation
A global `afterEach` block in `tests/setup.js` ensures all Jest mocks are cleared and modules reset after every test, preventing test pollution and flaky results.

**Example:**
```js
afterEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});
```

### Fake Timers for Time-Based Logic
All tests for time-based logic (cooldowns, GSAP animations, etc.) use Jest fake timers for deterministic, fast, and reliable results.

**Example:**
```js
jest.useFakeTimers();
// ... test code that triggers time-based logic ...
jest.advanceTimersByTime(1000); // Fast-forward time
```