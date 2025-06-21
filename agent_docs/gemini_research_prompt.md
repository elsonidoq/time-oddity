# Gemini Deep Research Prompt: Time Oddity Game Development Documentation

## Research Objective
Collect comprehensive documentation, API references, integration patterns, and best practices for all packages and libraries used in the Time Oddity game development project. This research will serve as a complete reference guide for AI-assisted development.

## Project Context
**Game:** Time Oddity - A 2D platformer with time manipulation mechanics
**Tech Stack:** Phaser 3, GSAP, Howler.js, Node.js, Express.js, Socket.IO
**Development Approach:** AI-assisted development with LLM agents
**Target:** Complete documentation for building a full game from scratch

---

## Research Tasks

### 1. PHASER 3 COMPREHENSIVE DOCUMENTATION

**Core Framework Documentation:**
- Complete API reference for Phaser 3.90.0
- Scene management patterns and lifecycle hooks
- Game configuration options and optimization settings
- Physics system (Arcade Physics) complete API
- Input handling for keyboard, mouse, touch, and gamepad
- Asset loading and management systems
- Camera controls and viewport management
- Particle systems and effects
- Audio integration and management
- Sprite and animation frame management
- Collision detection and response systems
- Game loop and update cycle management

**Advanced Features:**
- Multi-scene coordination and data passing
- Performance optimization techniques
- Mobile and responsive design patterns
- Debug tools and development utilities
- Plugin system and custom extensions
- Memory management and garbage collection
- Cross-browser compatibility considerations

**Integration Patterns:**
- How to integrate GSAP animations with Phaser GameObjects
- How to integrate Howler.js audio with Phaser scenes
- State management patterns with external stores
- Real-time multiplayer synchronization patterns

### 2. GSAP (GREENSOCK ANIMATION PLATFORM) COMPREHENSIVE DOCUMENTATION

**Core Animation API:**
- Complete Timeline API reference
- Tween methods (.to(), .from(), .fromTo(), .set())
- Easing functions and their visual characteristics
- Duration and delay management
- Animation control methods (play, pause, reverse, restart)
- Callback functions and event handling

**Advanced Features:**
- Complex animation sequences and choreography
- Performance optimization techniques
- Memory management and cleanup
- Cross-browser compatibility
- Mobile performance considerations
- Integration with game loops and frame rates

**Phaser Integration Specific:**
- Animating Phaser GameObject properties
- Coordinating GSAP timelines with Phaser's update cycle
- Performance implications of animating game objects
- Best practices for game-specific animations
- Error handling and fallback strategies

**Game-Specific Animation Patterns:**
- Character movement and idle animations
- UI transitions and effects
- Particle and visual effects
- Time manipulation visual effects
- Loading and transition animations

### 3. HOWLER.JS COMPREHENSIVE DOCUMENTATION

**Core Audio API:**
- Complete Howl and Howler API reference
- Audio loading and preloading strategies
- Playback control methods
- Volume and spatial audio management
- Audio sprite configuration and usage
- Cross-browser audio compatibility

**Advanced Features:**
- Audio streaming and memory management
- Performance optimization techniques
- Mobile audio considerations
- Background audio handling
- Audio format support and fallbacks

**Game Integration Patterns:**
- Integration with Phaser's audio system
- State-driven audio management
- Real-time audio parameter changes
- Audio for time manipulation effects
- Background music and sound effect coordination

**Game-Specific Audio Patterns:**
- Dynamic music layering
- Spatial audio for game world
- Audio feedback for player actions
- Ambient and environmental sounds
- Accessibility considerations

### 4. NODE.JS AND EXPRESS.JS COMPREHENSIVE DOCUMENTATION

**Node.js Core:**
- Event loop and asynchronous programming patterns
- Module system and ES6 imports
- File system operations
- Environment configuration management
- Performance monitoring and optimization
- Security best practices

**Express.js Framework:**
- Complete routing API reference
- Middleware patterns and custom middleware
- Request/response handling
- Error handling and logging
- CORS and security configurations
- Static file serving
- API design patterns

**Game Server Patterns:**
- Real-time game state management
- Player session management
- Save/load game progress systems
- Analytics and telemetry
- Multiplayer coordination
- Security and validation

### 5. SOCKET.IO COMPREHENSIVE DOCUMENTATION

**Core Socket.IO API:**
- Complete client and server API reference
- Connection management and lifecycle
- Event emission and listening patterns
- Room management and broadcasting
- Error handling and reconnection strategies
- Performance optimization

**Game-Specific Patterns:**
- Real-time player synchronization
- Game state broadcasting
- Latency compensation techniques
- Scalability considerations
- Security and validation patterns
- Cross-platform compatibility

### 6. INTEGRATION AND ARCHITECTURE PATTERNS

**System Integration:**
- How all libraries work together in a game context
- State management patterns across all systems
- Performance optimization across the entire stack
- Error handling and debugging strategies
- Testing patterns for integrated systems

**Development Workflow:**
- Build system configuration (Webpack/Vite)
- Development server setup
- Hot reloading and debugging
- Asset pipeline management
- Deployment strategies

**AI-Assisted Development Patterns:**
- Code generation patterns for each library
- Testing strategies for AI-generated code
- Documentation patterns for AI consumption
- Error recovery and debugging strategies

### 7. GAME-SPECIFIC IMPLEMENTATION GUIDES

**Time Manipulation Mechanics:**
- Pause mechanic implementation patterns
- Echo/replay system architecture
- Portal/fold system design
- State management for time effects
- Visual feedback for time manipulation

**Platformer Game Patterns:**
- Character movement and physics
- Level design and collision systems
- Enemy AI and behavior patterns
- Power-up and ability systems
- Checkpoint and save systems

**UI and HUD Systems:**
- Game interface design patterns
- HUD element management
- Menu systems and navigation
- Accessibility features
- Mobile-responsive design

---

## Research Requirements

### Documentation Format
- **API References:** Complete method signatures, parameters, return values, and examples
- **Code Examples:** Practical, working code snippets for common use cases
- **Integration Examples:** How libraries work together in real scenarios
- **Best Practices:** Performance, security, and maintainability guidelines
- **Troubleshooting:** Common issues and solutions
- **Performance Guidelines:** Optimization techniques and benchmarks

### Research Depth
- **Primary Sources:** Official documentation, API references, and developer guides
- **Secondary Sources:** Community tutorials, blog posts, and case studies
- **Practical Examples:** Real-world implementations and open-source projects
- **Version-Specific:** Focus on current stable versions of all packages
- **Cross-Reference:** How different libraries complement each other

### Output Organization
Organize the research into clear sections:
1. **Quick Reference:** Essential APIs and patterns
2. **Detailed Documentation:** Complete API references
3. **Integration Guides:** How libraries work together
4. **Best Practices:** Performance and maintainability
5. **Troubleshooting:** Common issues and solutions
6. **Game-Specific Patterns:** Implementation guides for game features

### Quality Standards
- **Accuracy:** Verify all information against official sources
- **Completeness:** Cover all major features and use cases
- **Practicality:** Focus on real-world implementation patterns
- **Clarity:** Clear, well-structured documentation
- **Examples:** Include working code examples for all major features

---

## Expected Output

Create a comprehensive documentation file that includes:

1. **Complete API references** for all libraries
2. **Integration patterns** showing how libraries work together
3. **Game-specific implementation guides**
4. **Performance optimization strategies**
5. **Best practices and common pitfalls**
6. **Code examples** for all major features
7. **Troubleshooting guides** for common issues
8. **AI-assisted development patterns**

This documentation should serve as a complete reference for building the Time Oddity game from scratch, with enough detail for AI agents to generate functional code and for human developers to understand and maintain the system.

---

## Research Scope Notes

- Focus on **current stable versions** of all packages
- Prioritize **practical implementation** over theoretical concepts
- Include **performance considerations** for real-time games
- Emphasize **cross-browser compatibility** and mobile support
- Consider **scalability** for potential multiplayer features
- Include **security best practices** for web-based games
- Provide **accessibility guidelines** for inclusive design

This research should result in a comprehensive, actionable documentation set that enables both AI-assisted and human development of the complete Time Oddity game. 