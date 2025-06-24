# The Time Oddity Project: Condensed Technical Guide

### **Introduction**
This guide is the condensed technical reference for the "Time Oddity" project, outlining the full-stack architecture, key technologies, and implementation blueprints. It is the definitive source of truth for development, enriched with specific details for engineer LLMs. For in-depth explanations of testing methodologies and best practices, refer to `testing_best_practices.md`.

## **Section 1: Client-Side with Phaser 3**
The client is built on Phaser 3 (v3.90+), but key functionalities like animation and audio are delegated to specialized libraries (GSAP, Howler.js) for superior performance and reliability.

### **1.1. Project & Game Configuration**
Setup requires Node.js. The core of the game is the `Phaser.Game` configuration object.

**Key `config` Properties:**
- **`type`**: `Phaser.AUTO` (WebGL with Canvas fallback).
- **`width` & `height`**: Base resolution (e.g., 1280x720).
- **`parent`**: The HTML element ID for the game canvas.
- **`scene`**: An array of Scene classes.
- **`physics`**: Configured for `arcade` physics (e.g., `{ default: 'arcade', arcade: { gravity: { y: 980 }, debug: false } }`).
- **`scale`**: Handles responsiveness (`mode: Phaser.Scale.FIT`, `autoCenter: Phaser.Scale.CENTER_BOTH`).
- **`audio`**: **Crucially, set to `{ noAudio: true }`** to disable Phaser's audio system in favor of Howler.js.

A local web server (like the one Vite provides) is mandatory for development. For debugging, use the **Phaser Debugger Extension** for Chrome/Firefox to inspect the scene graph in real-time.

### **1.2. The Scene System**
Scenes are self-contained game modules (e.g., title screen, level).

**Core Lifecycle Methods:**
- **`init(data)`**: Called first; receives data and prepares the state.
- **`preload()`**: Loads all assets for the scene (`this.load`).
- **`create(data)`**: Called after `preload`; sets up game objects and logic.
- **`update(time, delta)`**: The main game loop for real-time logic.

**Scene Management (`this.scene`):** Use `this.scene.start(key, data)` to switch scenes and `this.scene.launch(key, data)` to run a scene in parallel (ideal for UI overlays).

**Communication:** Use the global event emitter (`this.game.events`) for decoupled communication between scenes (e.g., GameScene and UIScene).

### **1.3. Asset and Sprite Management**
- **Loading:** Load all assets in `preload()` using methods like `this.load.image()`, `this.load.spritesheet()`, and `this.load.atlas()`.
- **Creating:** Use the GameObjectFactory (`this.add`) to create objects. For text that updates frequently (like a score), use `this.add.bitmapText()` instead of `this.add.text()` for significantly better performance.

### **1.4. Arcade Physics**
A lightweight AABB physics system.
- **Bodies**: Game objects get a `body` property to control movement (`body.velocity`, `body.acceleration`).
- **Static vs. Dynamic**: Dynamic bodies move; static bodies don't. Use `this.physics.add.staticGroup()` for efficient static platforms.
- **Collision**:
  - `this.physics.add.collider()`: For physical separation.
  - `this.physics.add.overlap()`: For triggers.

### **1.5. Input and Animation**
- **Input**: Use `this.input.keyboard.createCursorKeys()` for easy arrow key handling.
- **Animation**: Create global animations once with `this.anims.create()`. Play them on sprites with `sprite.anims.play('anim-key', true)`.

### **1.6. Cameras, Particles, & Effects**
- **Camera**: Access via `this.cameras.main`. Use `camera.startFollow(player)` and `camera.setBounds()`.
- **Particles**: Use `this.add.particles()` to create emitters for effects.

### **1.7. Advanced Topics & Best Practices**
- **Mobile Responsiveness**: Use `Phaser.Scale.FIT` and the `this.scale.on('resize', ...)` event.
- **Performance Tuning**:
  - **Object Pooling**: Reuse objects from a `Phaser.GameObjects.Group` to avoid garbage collection stutters. This is mandatory for projectiles and other frequently spawned entities.
  - **Texture Atlases**: Combine images into a single sheet using a tool like TexturePacker.
- **Memory Management**: Use the scene's `shutdown` event to remove all custom event listeners and nullify references to prevent memory leaks.

## **Section 2: High-Performance Animation with GSAP**
GSAP is used for all programmatic animations.

### **2.1. Core API and Integration**
- **Core API**: `gsap.to(target, { property: value, duration: 1, ease: 'power2.out' })`.
- **Timelines**: Use `gsap.timeline()` for complex sequences.
- **Definitive Integration Pattern**: Manually update GSAP from Phaser's `update` loop for perfect synchronization.

```javascript
// In Scene create()
gsap.ticker.lagSmoothing(false);
gsap.ticker.remove(gsap.updateRoot);

// In Scene update(time, delta)
gsap.updateRoot(time / 1000);
```

- **Animating Sprite Frames**: Use `roundProps` to tween an animation's frame number.

```javascript
gsap.to(sprite, {
    frame: sprite.anims.currentAnim.frames.length - 1,
    duration: 1,
    ease: 'steps(' + (sprite.anims.currentAnim.frames.length - 1) + ')',
    roundProps: "frame"
});
```

### **2.2. Game-Specific Use Cases**
- **UI Animations:** All menu transitions, button feedback, and HUD element animations.
- **Character Animations:** Special moves like dashes or time power activation effects.
- **Time-Based Effects:** GSAP timelines for visualizing time manipulation mechanics.

## **Section 3: Advanced Audio with Howler.js**
Howler.js is the sole audio engine.

### **3.1. Core Implementation**
- **Core Objects**: `Howl` (a sound) and `Howler` (global controls).
- **Implementation Pattern**: A global `AudioManager` singleton loads all sounds on startup.
- **Audio Sprites**: Combine all SFX into a single file for a massive performance gain.
- **Integration**: **You must disable Phaser's audio system** with `audio: { noAudio: true }`.
- **Time Effects**: Manipulate sound for game mechanics. Use `sound.rate(0.5)` to slow down audio and `sound.rate(2.0)` to speed it up. For rewinding effects, play a pre-reversed audio file.

### **3.2. Spatial Audio and Advanced Features**
- **3D Spatial Audio**: Set listener position with `Howler.pos(player.x, player.y, -0.5)` and sound positions with `sound.pos(enemy.x, enemy.y, 0, soundId)`.
- **Audio Manager Pattern**: Centralized singleton for all audio operations with separate volume controls for BGM, SFX, and ambient loops.

## **Section 4: Backend with Node.js & Express.js**
The backend uses Node.js for its non-blocking I/O.

### **4.1. Server Setup and Security**
- **Structure**: A stateless RESTful API built with Express.js.
- **Essential Middleware**: `helmet()`, `cors()`, `express.json()`, `express.static('dist')`, `express-session`.
- **Security Best Practices**:
  - Use `express-rate-limit` to prevent brute-force attacks.
  - Validate and sanitize input with `express-validator`.
  - Store secrets in environment variables (`.env`).
- **Production**: The default in-memory session store is not suitable for production. Use a persistent store like `connect-redis`. Use a structured logger like **Winston** or **Bunyan**.

### **4.2. API Structure and Game Server Use Cases**
- **Session Management**: Use `express-session` middleware for authenticated users.
- **Authentication**: Simple flow with registration and login endpoints.
- **Progress Saving/Loading**: `POST /api/game/save` and `GET /api/game/load` endpoints.
- **Logging**: Structured logging system for debugging and monitoring.

## **Section 5: Real-Time Multiplayer with Socket.IO**
Socket.IO handles all real-time communication.

### **5.1. Core Concepts and Game State Synchronization**
- **Core Concept**: An event-based model (`socket.emit`, `socket.on`).
- **Rooms**: Use `socket.join('roomName')` to group players. Broadcast with `io.to('roomName').emit(...)`.
- **Game State Synchronization**:
  - **Authoritative Server Model**: The server is the source of truth. Clients send inputs, not state.
  - **Event-Based Synchronization**: Send small, discrete event messages instead of entire game state.
  - **Lag Compensation**: Use **Client-Side Prediction**, **Server Reconciliation**, and **Entity Interpolation**.

### **5.2. Lag Compensation and Anti-Cheat**
- **Client-Side Prediction**: Client predicts outcomes and applies them locally immediately.
- **Server Reconciliation**: Server validates and corrects client predictions smoothly.
- **Entity Interpolation**: Smooth remote player movement using buffered state updates.
- **Anti-Cheat**: Server must never trust the client. Validate all inputs and calculate movement server-side.

### **5.3. Scaling and Performance**
- **Scaling Horizontally**: Use **Redis Adapter** (`socket.io-redis`) for multiple server instances.
- **Delta-Compression**: Send only changed properties for high-frequency updates.

## **Section 6: Full-Stack Architecture & Tooling**
- **Build Tool**: **Vite is the recommended choice** over Webpack for its superior developer experience.
- **Development Proxy**: The `vite.config.js` file must proxy API and WebSocket requests to the backend.

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:3000',
    '/socket.io': {
      target: 'ws://localhost:3000',
      ws: true,
    },
  },
},
```

- **Production Deployment**: Build client assets with `npm run build` and run the Node.js server with a process manager like **PM2**.

### **6.1. Data Flow and State Management**
- **Server-Authoritative State**: Any data affecting gameplay fairness must be owned by the server.
- **Client-Side State**: Purely cosmetic or transient data managed exclusively on the client.
- **Coordinated State Management**: Clear separation prevents unnecessary network traffic.

### **6.2. Error Handling and Logging**
- **Client-Side Error Handling**: Global error handler with server logging endpoint.
- **Server-Side Error Handling**: Custom error-handling middleware for consistent logging.
- **Centralized Logging**: Third-party logging service (Sentry, LogRocket, Datadog) for production.

## **Section 7: Game Implementation Blueprints**

### **7.1. Time Control System**
Record an object's state into a history buffer. "Soft-destroy" objects (`setActive(false)`) instead of permanently destroying them to allow for rewinding.

**TemporalState Object:**
| Property | Type | Description |
|----------|------|-------------|
| `x` | `number` | The horizontal position. |
| `y` | `number` | The vertical position. |
| `vx` | `number` | The horizontal velocity. |
| `vy` | `number` | The vertical velocity. |
| `r` | `number` | The rotation (angle). |
| `av` | `number` | The angular velocity. |
| `f` | `string` | The key of the current animation frame. |
| `a` | `boolean` | The active/visible state of the object. |

### **7.2. Platformer Character Controller**
Use a **Finite State Machine (FSM)**.

| State | Enter Action | Exit Condition(s) & New State |
|-------|-------------|-------------------------------|
| **IdleState** | `player.anims.play('idle')` | `input detected` → `RunState` |
| **RunState** | `player.anims.play('run')` | `no horizontal input` → `IdleState` |
| **JumpState** | Apply upward velocity | `body.velocity.y >= 0` → `FallState` |
| **FallState** | `player.anims.play('fall')` | `body.onFloor()` → `IdleState` |
| **DashState** | `player.anims.play('dash')` | `dash duration expired` → `IdleState` |

### **7.3. UI/HUD Architecture**
Run a dedicated, decoupled `UIScene` in parallel with the `GameScene`. Communicate via the global event emitter.

## **Section 8: Testing and Mocking**
**For comprehensive testing methodologies, TDD/BDD practices, and advanced testing strategies, refer to `testing_best_practices.md`.**

### **8.1. Testing Philosophy**
- **Test-Driven Development (TDD)**: Follow "Red-Green-Refactor" cycle for all features.
- **Test Classification**: Prioritize unit tests with high-fidelity mocks over integration tests.
- **Performance**: Unit tests should be extremely fast (<50ms), integration tests slower (>100ms).
- **Test Pyramid**: 70-80% unit tests, 15-20% integration tests, 5-10% E2E tests.

### **8.2. Mocking External Libraries**
- **Phaser Mocking**: Use manual mocks for Scenes and GameObjects. Mock physics bodies, input handlers, and animation managers.
- **GSAP Mocking**: Mock `gsap.to()` and timelines. Use Jest fake timers for time-based animations.
- **Howler.js Mocking**: Mock `Howl` constructor and instance methods to verify audio triggers.

### **8.3. Testing Core Systems**
- **State Machines**: Test as pure logic, verifying transitions and side effects.
- **Time-Based Mechanics**: Use fake timers to test cooldowns and delays instantly.
- **CI/Automation**: Run full test suite on every push via CI pipeline. Use pre-commit hooks (`Husky`) for local quality gates.

### **8.4. Test Architecture and Utilities**
- **Directory Structure**: Co-located tests (`*.test.js`) with centralized mocks in `tests/mocks/`.
- **Test Isolation**: Global `afterEach` block ensures mocks are cleared and modules reset.
- **Fake Timers**: Use `jest.useFakeTimers()` for all time-based logic testing.

### **8.5. Advanced Testing Patterns**
- **Decoupled Architecture Testing**: Test core logic separately from engine dependencies.
- **Event-Driven Testing**: Verify event emissions and subscriptions.
- **State-Based Testing**: Test state changes rather than direct library calls.

## **Section 9: AI-Assisted Development**

### **9.1. LLM-Friendly Documentation Principles**
- **Semantic Markdown Structure**: Clear hierarchical headings and machine-readable lists.
- **Tagged Code Blocks**: Explicit language identifiers for syntax highlighting.
- **Self-Contained Examples**: Each code example includes necessary imports and comments.

### **9.2. Generative Code and Testing Patterns**
- **Boilerplate Code Generation**: Use established patterns as templates for LLM-driven generation.
- **Automated Test Generation**: Provide clear function behavior descriptions for test generation.
- **LLM-Assisted Debugging**: Structured approach combining error context, code snippets, and architectural patterns.
- **TDD-as-Prompting**: Use failing tests as precise specifications for LLM code generation.

### **9.3. Human-in-the-Loop (HITL) Workflow**
- **Human Role**: Architect, reviewer, and quality gatekeeper.
- **LLM Role**: Implementer focused on mechanical development tasks.
- **Test-Driven Collaboration**: Tests serve as specifications, prompts, and quality gates.

## **Section 10: Security Architecture**

### **10.1. Client-Side Security**
- **Input Validation**: All user inputs validated.
- **Anti-Cheat**: Client-side prediction only, server authority.
- **Asset Integrity**: Checksums for critical assets.

### **10.2. Server-Side Security**
- **Authentication**: JWT-based session management.
- **Authorization**: Role-based access control.
- **Input Sanitization**: All inputs sanitized and validated.
- **Rate Limiting**: Prevent abuse and DDoS.
- **HTTPS Only**: Secure communication in production.

### **10.3. Data Security**
- **Encryption**: Sensitive data encrypted at rest.
- **Backup**: Regular automated backups.
- **Audit Logging**: All actions logged for security.

## **Section 11: Performance Considerations**

### **11.1. Client-Side Optimization**
- **Object Pooling**: For frequently created/destroyed entities.
- **Texture Atlases**: Combined sprite sheets for reduced draw calls.
- **GSAP Integration**: Manual ticker control for frame-perfect timing.
- **LOD System**: Level-of-detail for distant objects.

### **11.2. Server-Side Optimization**
- **Connection Pooling**: Database connection management.
- **Caching**: Redis for session and game state.
- **Rate Limiting**: Prevent abuse and overload.
- **Horizontal Scaling**: Multiple server instances.

### **11.3. Network Optimization**
- **Delta Compression**: Send only changed data.
- **Client Prediction**: Immediate local updates.
- **Server Reconciliation**: Smooth correction of predictions.
- **Interpolation**: Smooth remote player movement.

## **Section 12: Development Workflow**

### **12.1. Local Development**
```
1. Clone repository
2. Run setup.sh script
3. Start development servers (client: 5173, server: 3000)
4. Vite proxies API calls to backend
5. Hot reload for both client and server
```

### **12.2. Testing Strategy**
```
Unit Tests: Individual components and functions
Integration Tests: API endpoints and database operations
E2E Tests: Complete user workflows
Performance Tests: Load testing for multiplayer
```

### **12.3. Deployment Pipeline**
```
1. Code commit triggers CI/CD
2. Run test suite
3. Build client assets
4. Deploy to staging environment
5. Run integration tests
6. Deploy to production
7. Health checks and monitoring
```

## **Section 13: Monitoring and Observability**

### **13.1. Client-Side Monitoring**
- **Error Tracking**: Global error handler with Sentry integration.
- **Performance Metrics**: FPS, load times, memory usage.
- **User Analytics**: Gameplay patterns and engagement.

### **13.2. Server-Side Monitoring**
- **Application Metrics**: Response times, error rates.
- **Infrastructure**: CPU, memory, network usage.
- **Business Metrics**: Active users, game completion rates.

### **13.3. Alerting**
- **Critical Errors**: Immediate notification.
- **Performance Degradation**: Automated scaling triggers.
- **Security Incidents**: Suspicious activity alerts.

## **Section 14: Project Structure and Architecture**

### **14.1. Directory Structure**
```
time-oddity/
├── client/                          # Frontend game client
│   ├── src/
│   │   ├── main.js                  # Entry point
│   │   ├── scenes/                  # Phaser scenes
│   │   ├── entities/                # Game objects
│   │   ├── systems/                 # Game systems
│   │   ├── ui/                      # UI components
│   │   └── assets/                  # Game assets
│   ├── dist/                        # Built client files
│   └── vite.config.js               # Vite configuration
├── server/                          # Backend server
│   ├── src/
│   │   ├── server.js                # Main server entry point
│   │   ├── routes/                  # API routes
│   │   ├── controllers/             # Business logic
│   │   ├── models/                  # Data models
│   │   └── middleware/              # Express middleware
│   └── package.json                 # Server dependencies
├── tests/                           # Test files
│   ├── mocks/                       # Centralized mocks
│   └── utils/                       # Test utilities
└── agent_docs/                      # Documentation
    ├── comprehensive_documentation.md
    ├── comprehensive_documentation_small.md
    └── testing_best_practices.md
```

### **14.2. Component Architecture**
- **Scene Hierarchy**: BootScene → MenuScene → GameScene + UIScene → PauseScene/GameOverScene
- **Entity System**: Entity (Base) → Player, Enemy, Collectible, Effect
- **System Architecture**: TimeManager, AudioManager, InputManager, CollisionManager, ObjectPool, StateMachine

### **14.3. State Management**
- **Global State**: Stored in Phaser's registry for cross-scene data
- **Scene-Specific State**: Local to each scene for temporary data
- **UI State**: Managed in parallel UIScene for HUD elements

## **Conclusions**
This guide establishes the definitive technical foundation for the "Time Oddity" game project. The key architectural decisions are:
1. **A Hybrid, Best-in-Class Stack is Optimal**: Phaser 3 for rendering/physics, GSAP for animation, Howler.js for audio.
2. **Performance and Security are Foundational**: Proactive optimization patterns and secure-by-default server setup.
3. **Decoupled, Event-Driven Architecture is Key**: Modular design for scalability and maintainability.
4. **AI-Assisted Development Requires Deliberate Design**: LLM-friendly documentation structure for accelerated development.
5. **Testing is Integral to Quality**: Comprehensive testing strategy with TDD/BDD methodologies (see `testing_best_practices.md`).

**For detailed testing methodologies, advanced mocking strategies, and LLM-assisted development workflows, refer to `testing_best_practices.md`.**
