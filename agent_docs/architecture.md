# Time Oddity: Complete Architecture Documentation

## Overview

This document defines the complete architecture for the "Time Oddity" game, including file structure, component responsibilities, state management, and service connections. The architecture follows a modular, event-driven design optimized for AI-assisted development and maintainability.

---

## Project Structure

```
time-oddity/
├── client/                          # Frontend game client
│   ├── src/
│   │   ├── main.js                  # Entry point
│   │   ├── config/
│   │   │   ├── gameConfig.js        # Phaser game configuration
│   │   │   ├── audioConfig.js       # Howler.js audio configuration
│   │   │   └── constants.js         # Game constants and settings
│   │   ├── scenes/
│   │   │   ├── BaseScene.js         # Abstract base scene class
│   │   │   ├── BootScene.js         # Loading screen and asset preload
│   │   │   ├── MenuScene.js         # Main menu and navigation
│   │   │   ├── GameScene.js         # Main gameplay scene
│   │   │   ├── UIScene.js           # HUD and UI overlay
│   │   │   ├── PauseScene.js        # Pause menu
│   │   │   └── GameOverScene.js     # Game over screen
│   │   ├── entities/
│   │   │   ├── Entity.js            # Base entity class
│   │   │   ├── Player.js            # Player character (Echo)
│   │   │   ├── Enemy.js             # Base enemy class
│   │   │   ├── enemies/
│   │   │   │   ├── LoopHound.js     # Time-themed enemy
│   │   │   │   ├── ChronoLeach.js   # Time parasite enemy
│   │   │   │   └── Archivist.js     # Boss enemy
│   │   │   ├── collectibles/
│   │   │   │   ├── TimeShard.js     # Memory fragments
│   │   │   │   └── Coin.js          # Regular collectibles
│   │   │   └── effects/
│   │   │       ├── ParticleEffect.js # Base particle system
│   │   │       └── TimeEffect.js    # Time manipulation effects
│   │   ├── systems/
│   │   │   ├── StateMachine.js      # Finite state machine
│   │   │   ├── TimeManager.js       # Time manipulation system
│   │   │   ├── AudioManager.js      # Howler.js wrapper
│   │   │   ├── InputManager.js      # Input handling
│   │   │   ├── CollisionManager.js  # Collision detection
│   │   │   └── ObjectPool.js        # Object pooling system
│   │   ├── ui/
│   │   │   ├── components/
│   │   │   │   ├── Button.js        # Interactive button
│   │   │   │   ├── HealthBar.js     # Health display
│   │   │   │   ├── TimeMeter.js     # Time manipulation meter
│   │   │   │   └── ScoreDisplay.js  # Score and stats
│   │   │   └── menus/
│   │   │       ├── MainMenu.js      # Main menu layout
│   │   │       ├── PauseMenu.js     # Pause menu layout
│   │   │       └── OptionsMenu.js   # Settings menu
│   │   ├── utils/
│   │   │   ├── helpers.js           # Utility functions
│   │   │   ├── math.js              # Math utilities
│   │   │   └── debug.js             # Debug utilities
│   │   └── assets/
│   │       ├── sprites/             # Sprite assets
│   │       ├── audio/               # Audio assets
│   │       ├── tilemaps/            # Level data
│   │       └── ui/                  # UI assets
│   ├── public/
│   │   └── index.html               # Main HTML file
│   ├── dist/                        # Built client files
│   ├── package.json                 # Client dependencies
│   ├── vite.config.js               # Vite configuration
│   └── .env                         # Client environment variables
├── server/                          # Backend server
│   ├── src/
│   │   ├── server.js                # Main server entry point
│   │   ├── config/
│   │   │   ├── database.js          # Database configuration
│   │   │   ├── socket.js            # Socket.IO configuration
│   │   │   └── middleware.js        # Express middleware setup
│   │   ├── routes/
│   │   │   ├── auth.js              # Authentication routes
│   │   │   ├── game.js              # Game data routes
│   │   │   ├── player.js            # Player management routes
│   │   │   └── api.js               # API route aggregator
│   │   ├── controllers/
│   │   │   ├── authController.js    # Authentication logic
│   │   │   ├── gameController.js    # Game state management
│   │   │   └── playerController.js  # Player data management
│   │   ├── models/
│   │   │   ├── User.js              # User data model
│   │   │   ├── GameState.js         # Game state model
│   │   │   └── Session.js           # Session management
│   │   ├── services/
│   │   │   ├── gameService.js       # Game logic service
│   │   │   ├── authService.js       # Authentication service
│   │   │   └── socketService.js     # Socket.IO event handling
│   │   ├── middleware/
│   │   │   ├── auth.js              # Authentication middleware
│   │   │   ├── validation.js        # Input validation
│   │   │   ├── rateLimit.js         # Rate limiting
│   │   │   └── errorHandler.js      # Error handling
│   │   └── utils/
│   │       ├── logger.js            # Logging utility
│   │       ├── database.js          # Database utilities
│   │       └── security.js          # Security utilities
│   ├── package.json                 # Server dependencies
│   ├── .env                         # Server environment variables
│   └── ecosystem.config.js          # PM2 configuration
├── shared/                          # Shared code between client/server
│   ├── constants/
│   │   ├── gameConstants.js         # Shared game constants
│   │   ├── events.js                # Event definitions
│   │   └── types.js                 # TypeScript-like definitions
│   ├── utils/
│   │   ├── validation.js            # Shared validation logic
│   │   └── helpers.js               # Shared utility functions
│   └── package.json                 # Shared dependencies
├── docs/                            # Documentation
│   ├── api.md                       # API documentation
│   ├── deployment.md                # Deployment guide
│   └── development.md               # Development guide
├── scripts/                         # Build and deployment scripts
│   ├── build.sh                     # Build script
│   ├── deploy.sh                    # Deployment script
│   └── setup.sh                     # Environment setup
├── tests/                           # Test files
│   ├── client/                      # Client-side tests
│   ├── server/                      # Server-side tests
│   └── integration/                 # Integration tests
├── package.json                     # Root package.json
├── README.md                        # Project overview
└── .gitignore                       # Git ignore rules
```

---

## Component Architecture

### 1. Client-Side Architecture

#### **Scene Hierarchy**
```
BootScene → MenuScene → GameScene + UIScene → PauseScene/GameOverScene
```

**Scene Responsibilities:**
- **BootScene**: Asset loading, progress tracking, initialization
- **MenuScene**: Navigation, settings, game start
- **GameScene**: Core gameplay, physics, entity management
- **UIScene**: HUD overlay, real-time UI updates
- **PauseScene**: Game pause, resume, quit options
- **GameOverScene**: Results display, restart options

#### **Entity System**
```
Entity (Base)
├── Player (Echo character)
├── Enemy (Base)
│   ├── LoopHound
│   ├── ChronoLeach
│   └── Archivist
├── Collectible
│   ├── TimeShard
│   └── Coin
└── Effect
    └── TimeEffect
```

#### **System Architecture**
```
GameScene
├── TimeManager (Time manipulation)
├── AudioManager (Sound management)
├── InputManager (Input handling)
├── CollisionManager (Physics)
├── ObjectPool (Performance)
└── StateMachine (Player states)
```

### 2. Server-Side Architecture

#### **API Layer**
```
Express App
├── Middleware Stack
│   ├── Helmet (Security)
│   ├── CORS (Cross-origin)
│   ├── Rate Limiting
│   ├── Authentication
│   └── Validation
├── Route Handlers
│   ├── Auth Routes
│   ├── Game Routes
│   └── Player Routes
└── Error Handler
```

#### **Service Layer**
```
Controllers
├── AuthController → AuthService
├── GameController → GameService
└── PlayerController → PlayerService
```

#### **Socket.IO Integration**
```
Socket.IO Server
├── Connection Management
├── Room Management
├── Event Handlers
└── Real-time Updates
```

---

## State Management

### 1. Client-Side State

#### **Global State (Game Registry)**
```javascript
// Stored in Phaser's global registry
{
  player: {
    health: 100,
    score: 0,
    timeShards: 0,
    currentLevel: 1,
    unlockedMemories: []
  },
  game: {
    isPaused: false,
    currentTime: 0,
    paradoxZoneActive: false,
    timeRules: []
  },
  audio: {
    masterVolume: 0.8,
    musicVolume: 0.6,
    sfxVolume: 0.7
  }
}
```

#### **Scene-Specific State**
```javascript
// GameScene state
{
  entities: {
    player: Player,
    enemies: Enemy[],
    collectibles: Collectible[],
    effects: Effect[]
  },
  systems: {
    timeManager: TimeManager,
    audioManager: AudioManager,
    inputManager: InputManager
  },
  world: {
    platforms: Platform[],
    boundaries: Boundary[],
    spawnPoints: Point[]
  }
}
```

#### **UI State (UIScene)**
```javascript
{
  elements: {
    healthBar: HealthBar,
    timeMeter: TimeMeter,
    scoreDisplay: ScoreDisplay,
    paradoxIndicator: ParadoxIndicator
  },
  animations: {
    activeTweens: GSAP.Timeline[]
  }
}
```

### 2. Server-Side State

#### **Session State**
```javascript
{
  userId: string,
  gameState: {
    level: number,
    score: number,
    timeShards: number,
    unlockedMemories: string[]
  },
  lastActivity: Date,
  socketId: string
}
```

#### **Game Room State**
```javascript
{
  roomId: string,
  players: {
    [socketId]: {
      position: { x: number, y: number },
      state: string,
      lastUpdate: Date
    }
  },
  gameState: {
    level: number,
    timeRules: string[],
    paradoxZones: Zone[]
  }
}
```

---

## Service Connections

### 1. Client-Server Communication

#### **HTTP API Endpoints**
```
POST /api/auth/login          # User authentication
POST /api/auth/register       # User registration
GET  /api/game/state          # Load game state
POST /api/game/save           # Save game state
GET  /api/player/profile      # Get player profile
PUT  /api/player/settings     # Update player settings
```

#### **Socket.IO Events**
```
Client → Server:
- 'playerInput'               # Player movement/actions
- 'timeManipulation'          # Time power activation
- 'collectItem'               # Item collection
- 'enterParadoxZone'          # Paradox zone entry

Server → Client:
- 'gameStateUpdate'           # World state changes
- 'playerStateChanged'        # Player state updates
- 'timeRuleActivated'         # New time rule
- 'paradoxZoneEffect'         # Paradox zone effects
```

### 2. Internal Service Communication

#### **Client-Side Event System**
```javascript
// Global event emitter (this.game.events)
'playerHealthChanged'         // Health updates
'scoreUpdated'                // Score changes
'timeShardCollected'          // Time shard collection
'paradoxZoneEntered'          // Paradox zone entry
'gamePaused'                  // Pause state
'levelCompleted'              // Level completion
```

#### **Server-Side Event System**
```javascript
// Internal event bus
'userAuthenticated'           // User login
'gameStateSaved'              // State persistence
'playerDisconnected'          // Player disconnect
'roomCreated'                 // New game room
```

---

## Data Flow Patterns

### 1. Player Input Flow
```
Input → InputManager → Player State Machine → Physics → Collision → Event Emission → UI Update
```

### 2. Time Manipulation Flow
```
Time Power Activation → TimeManager → State Recording → Effect Application → Visual Feedback → Audio Feedback
```

### 3. Multiplayer Synchronization Flow
```
Client Input → Socket.IO → Server Validation → State Update → Broadcast → Client Reconciliation → Visual Update
```

### 4. Save/Load Flow
```
Game State → Validation → HTTP Request → Server Processing → Database → Response → Client Update
```

---

## Performance Considerations

### 1. Client-Side Optimization
- **Object Pooling**: For frequently created/destroyed entities
- **Texture Atlases**: Combined sprite sheets for reduced draw calls
- **GSAP Integration**: Manual ticker control for frame-perfect timing
- **LOD System**: Level-of-detail for distant objects

### 2. Server-Side Optimization
- **Connection Pooling**: Database connection management
- **Caching**: Redis for session and game state
- **Rate Limiting**: Prevent abuse and overload
- **Horizontal Scaling**: Multiple server instances

### 3. Network Optimization
- **Delta Compression**: Send only changed data
- **Client Prediction**: Immediate local updates
- **Server Reconciliation**: Smooth correction of predictions
- **Interpolation**: Smooth remote player movement

---

## Security Architecture

### 1. Client-Side Security
- **Input Validation**: All user inputs validated
- **Anti-Cheat**: Client-side prediction only, server authority
- **Asset Integrity**: Checksums for critical assets

### 2. Server-Side Security
- **Authentication**: JWT-based session management
- **Authorization**: Role-based access control
- **Input Sanitization**: All inputs sanitized and validated
- **Rate Limiting**: Prevent abuse and DDoS
- **HTTPS Only**: Secure communication in production

### 3. Data Security
- **Encryption**: Sensitive data encrypted at rest
- **Backup**: Regular automated backups
- **Audit Logging**: All actions logged for security

---

## Development Workflow

### 1. Local Development
```
1. Clone repository
2. Run setup.sh script
3. Start development servers (client: 5173, server: 3000)
4. Vite proxies API calls to backend
5. Hot reload for both client and server
```

### 2. Testing Strategy
```
Unit Tests: Individual components and functions
Integration Tests: API endpoints and database operations
E2E Tests: Complete user workflows
Performance Tests: Load testing for multiplayer
```

### 3. Deployment Pipeline
```
1. Code commit triggers CI/CD
2. Run test suite
3. Build client assets
4. Deploy to staging environment
5. Run integration tests
6. Deploy to production
7. Health checks and monitoring
```

---

## Monitoring and Observability

### 1. Client-Side Monitoring
- **Error Tracking**: Global error handler with Sentry integration
- **Performance Metrics**: FPS, load times, memory usage
- **User Analytics**: Gameplay patterns and engagement

### 2. Server-Side Monitoring
- **Application Metrics**: Response times, error rates
- **Infrastructure**: CPU, memory, network usage
- **Business Metrics**: Active users, game completion rates

### 3. Alerting
- **Critical Errors**: Immediate notification
- **Performance Degradation**: Automated scaling triggers
- **Security Incidents**: Suspicious activity alerts

---

This architecture provides a solid foundation for building the Time Oddity game with clear separation of concerns, scalable design, and robust state management. The modular structure supports AI-assisted development while maintaining code quality and performance. 