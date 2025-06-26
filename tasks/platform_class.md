# Platform Class Refactoring Plan

## Platform Interface Design

### Core Platform Abstraction
The `Platform` class will abstract all platform logic, providing a flexible and extensible structure for different platform types:

```javascript
/**
 * Platform Configuration Interface
 */
interface PlatformConfig {
  x: number;                    // X position
  y: number;                    // Y position
  width: number;                // Platform width (default: 64)
  height: number;               // Platform height (default: 64)
  textureKey: string;           // Atlas key (default: 'tiles')
  frameKey: string;             // Frame key from atlas
  isFullBlock: boolean;         // Whether to use full sprite hitbox
  platformType: PlatformType;   // Type of platform behavior
  movementConfig?: MovementConfig; // For moving platforms
  properties?: PlatformProperties; // Additional platform properties
}

/**
 * Platform Types
 */
enum PlatformType {
  STATIC = 'static',           // Standard static platform
  MOVING = 'moving',           // Platform that moves along a path
  BREAKABLE = 'breakable',     // Platform that can be destroyed
  BOUNCY = 'bouncy',           // Platform that bounces entities
  CONVEYOR = 'conveyor'        // Platform that moves entities
}

/**
 * Movement Configuration for Moving Platforms
 */
interface MovementConfig {
  path: Array<{x: number, y: number}>; // Movement path points
  speed: number;                        // Movement speed
  loop: boolean;                        // Whether to loop the path
  pingPong: boolean;                    // Whether to reverse at endpoints
  startDelay: number;                   // Initial delay before movement
}

/**
 * Platform Properties
 */
interface PlatformProperties {
  friction?: number;            // Surface friction (0-1)
  bounciness?: number;          // Bounce factor (0-1)
  damage?: number;              // Damage dealt on contact
  isOneWay?: boolean;           // Whether entities can pass through from below
}
```

### Platform Class Structure
```javascript
class Platform extends Entity {
  constructor(scene, config, mockScene = null)
  
  // Core properties
  platformType: PlatformType
  movementConfig?: MovementConfig
  properties: PlatformProperties
  
  // Movement state (for moving platforms)
  currentPathIndex: number
  pathProgress: number
  isMoving: boolean
  
  // Methods
  update(time, delta): void
  startMovement(): void
  stopMovement(): void
  resetPosition(): void
  
  // Time reversal compatibility
  getStateForRecording(): TemporalState
  setStateFromRecording(state: TemporalState): void
}
```

### Level Configuration Format
```json
{
  "platforms": [
    {
      "x": 200,
      "y": 500,
      "frameKey": "terrain_grass_block_center",
      "isFullBlock": true,
      "platformType": "static"
    },
    {
      "x": 400,
      "y": 300,
      "frameKey": "terrain_grass_block_center",
      "platformType": "moving",
      "movementConfig": {
        "path": [
          {"x": 400, "y": 300},
          {"x": 600, "y": 300}
        ],
        "speed": 50,
        "loop": true,
        "pingPong": true
      }
    }
  ]
}
```

---

## Phase 1: Introduce Platform Class and Refactor Existing Static Platforms

### Task 1.1: Create Platform Base Class
**Objective**: Create the foundational Platform class that extends Entity and provides basic platform functionality.

**Task Reference**: Phase 1, Task 1.1

**Pre-Implementation Analysis**:
- **invariants.md sections to review**: §17 State Structures, §12 Level/Platform Geometry
- **testing_best_practices.md sections to apply**: TDD/BDD methodology, State-Based Testing
- **small_comprehensive_documentation.md sections to reference**: §7.2 Platformer Character Controller, §8.1 Testing Philosophy

**State & Invariant Impact Assessment**:
- **Existing states to preserve**: All existing platform positions and behaviors must remain unchanged
- **New states/invariants to create**: Platform state structure for time reversal compatibility
- **Time reversal compatibility**: Platform must implement TemporalState recording/restoration

**Implementation Plan**:
- **Create**: `client/src/entities/Platform.js`
- **Modify**: None initially
- **Delete**: None

**Integration Points**:
- **Systems affected**: GameScene platform creation, CollisionManager
- **State machines**: None initially
- **External libraries**: Phaser physics, existing tile atlas

**Testing Strategy**:
- **Test files to create/update**: `tests/unit/platform.test.js`
- **Key test cases**: Platform creation, physics configuration, state recording/restoration
- **Mock requirements**: PhaserSceneMock, existing Entity mocks

**Task Breakdown & Acceptance Criteria**:
- [x] **Platform Class Creation**: Create Platform class extending Entity with basic platform properties
  - [x] Platform constructor accepts scene, x, y, texture, frame parameters
  - [x] Platform configures physics body as immovable with no gravity
  - [x] Platform supports isFullBlock configuration for hitbox sizing
  - [x] Platform implements getStateForRecording() and setStateFromRecording() for time reversal
- [x] **Physics Configuration**: Implement configurePlatform() method within Platform class
  - [x] Method sets body as immovable and disables gravity
  - [x] Method configures hitbox based on isFullBlock parameter
  - [x] Method matches existing configurePlatform() behavior exactly
- [x] **Unit Tests**: Create comprehensive test suite for Platform class
  - [x] Test platform creation with various configurations
  - [x] Test physics body configuration
  - [x] Test state recording and restoration
  - [x] Test time reversal compatibility
- [x] **Invariant Documentation**: Document new Platform state structure in invariants.md
  - [x] Add Platform state structure to §17 State Structures & Time Reversal Contracts
  - [x] Document Platform-specific state recording requirements
  - [x] Update any relevant asset/animation key references in §14

**Expected Output**: A working Platform class that can be instantiated and configured with the same behavior as existing hardcoded platforms.

**Risk Assessment**:
- **Potential complexity**: Ensuring exact compatibility with existing platform behavior
- **Dependencies**: Entity base class, Phaser physics system
- **Fallback plan**: If issues arise, maintain existing configurePlatform() method as fallback

**Definition of Done**:
- [x] Platform class created and functional
- [x] All unit tests pass
- [x] Platform behavior matches existing hardcoded platforms exactly
- [x] Time reversal compatibility verified
- [x] **invariants.md updated with new Platform state structure**
- [x] No regressions in existing functionality

---

### Task 1.2: Create Platform Factory
**Objective**: Create a factory pattern for platform creation to standardize platform instantiation.

**Task Reference**: Phase 1, Task 1.2

**Pre-Implementation Analysis**:
- **invariants.md sections to review**: §14 Asset & Animation Keys, §12 Level/Platform Geometry
- **testing_best_practices.md sections to apply**: Factory Pattern Testing, Mock Integration
- **small_comprehensive_documentation.md sections to reference**: §1.3 Asset and Sprite Management

**State & Invariant Impact Assessment**:
- **Existing states to preserve**: All existing platform creation patterns
- **New states/invariants to create**: Platform factory configuration patterns
- **Time reversal compatibility**: Factory-created platforms must be time reversal compatible

**Implementation Plan**:
- **Create**: `client/src/systems/PlatformFactory.js`
- **Modify**: None initially
- **Delete**: None

**Integration Points**:
- **Systems affected**: GameScene platform creation
- **State machines**: None
- **External libraries**: Phaser GameObjectFactory

**Testing Strategy**:
- **Test files to create/update**: `tests/unit/platform-factory.test.js`
- **Key test cases**: Factory creation with various configurations, error handling
- **Mock requirements**: PhaserSceneMock, Platform mock

**Task Breakdown & Acceptance Criteria**:
- [x] **Factory Class Creation**: Create PlatformFactory class with createPlatform method
  - [x] Factory accepts scene and platform configuration object
  - [x] Factory creates Platform instances with correct parameters
  - [x] Factory handles default values for optional configuration
  - [x] Factory validates configuration parameters
- [x] **Configuration Validation**: Implement configuration validation
  - [x] Validate required parameters (x, y, frameKey)
  - [x] Set sensible defaults for optional parameters
  - [x] Throw descriptive errors for invalid configurations
- [x] **Unit Tests**: Create comprehensive test suite for PlatformFactory
  - [x] Test platform creation with various configurations
  - [x] Test configuration validation and error handling
  - [x] Test default value assignment
- [x] **Invariant Documentation**: Document factory configuration patterns in invariants.md
  - [x] Add PlatformFactory configuration requirements to §14 Asset & Animation Keys
  - [x] Document required vs optional configuration parameters
  - [x] Update any relevant testing assumptions in §13

**Expected Output**: A PlatformFactory that can create Platform instances from configuration objects.

**Risk Assessment**:
- **Potential complexity**: Ensuring factory creates platforms identical to hardcoded versions
- **Dependencies**: Platform class, Phaser scene
- **Fallback plan**: Maintain direct Platform instantiation as alternative

**Definition of Done**:
- [x] PlatformFactory class created and functional
- [x] All unit tests pass
- [x] Factory creates platforms identical to hardcoded versions
- [x] Configuration validation working correctly
- [x] **invariants.md updated with factory configuration patterns**
- [x] No regressions in existing functionality

---

### Task 1.3: Refactor GameScene to Use Platform Class
**Objective**: Replace hardcoded platform creation in GameScene with Platform class instances.

**Task Reference**: Phase 1, Task 1.3

**Pre-Implementation Analysis**:
- **invariants.md sections to review**: §3 Scene Lifecycle, §12 Level/Platform Geometry
- **testing_best_practices.md sections to apply**: Integration Testing, State-Based Testing
- **small_comprehensive_documentation.md sections to reference**: §1.2 Scene System, §7.2 Platformer Character Controller

**State & Invariant Impact Assessment**:
- **Existing states to preserve**: All existing platform positions, behaviors, and collision detection
- **New states/invariants to create**: Platform instances in scene state
- **Time reversal compatibility**: All platforms must be registered with TimeManager

**Implementation Plan**:
- **Create**: None
- **Modify**: `client/src/scenes/GameScene.js`
- **Delete**: None

**Integration Points**:
- **Systems affected**: GameScene platform creation, CollisionManager, TimeManager
- **State machines**: None
- **External libraries**: Platform class, PlatformFactory

**Testing Strategy**:
- **Test files to create/update**: `tests/unit/game-scene-platforms.test.js`
- **Key test cases**: Platform creation, collision detection, time reversal registration
- **Mock requirements**: Platform mock, PlatformFactory mock

**Task Breakdown & Acceptance Criteria**:
- [ ] **Ground Platform Refactoring**: Replace hardcoded ground platform creation
  - [ ] Create ground platform using Platform class
  - [ ] Maintain exact same visual appearance and collision behavior
  - [ ] Register ground platform with TimeManager
  - [ ] Verify collision detection still works
- [ ] **Floating Platforms Refactoring**: Replace hardcoded floating platform creation
  - [ ] Create each floating platform using Platform class
  - [ ] Maintain exact same positions and configurations
  - [ ] Register all platforms with TimeManager
  - [ ] Verify all collision detection still works
- [ ] **Integration Testing**: Verify complete functionality
  - [ ] Test player-platform collisions
  - [ ] Test enemy-platform collisions
  - [ ] Test time reversal with platforms
  - [ ] Verify no visual or behavioral changes
- [ ] **Invariant Documentation**: Document scene platform management in invariants.md
  - [ ] Update §3 Scene Lifecycle to reflect Platform class usage
  - [ ] Document platform registration requirements with TimeManager
  - [ ] Update any relevant collision expectations in §10

**Expected Output**: GameScene using Platform class instances instead of hardcoded sprites, with identical behavior.

**Risk Assessment**:
- **Potential complexity**: Ensuring exact compatibility with existing collision detection
- **Dependencies**: Platform class, PlatformFactory, TimeManager
- **Fallback plan**: Maintain existing hardcoded platform creation as commented code

**Definition of Done**:
- [ ] All hardcoded platforms replaced with Platform class instances
- [ ] All existing functionality preserved exactly
- [ ] All integration tests pass
- [ ] Time reversal works correctly with platforms
- [ ] **invariants.md updated with scene platform management**
- [ ] No regressions in collision detection or physics

---

### Task 1.4: Remove configurePlatform Method
**Objective**: Remove the configurePlatform method from GameScene since it's now handled by Platform class.

**Task Reference**: Phase 1, Task 1.4

**Pre-Implementation Analysis**:
- **invariants.md sections to review**: §12 Level/Platform Geometry
- **testing_best_practices.md sections to apply**: Refactoring Testing, Regression Testing
- **small_comprehensive_documentation.md sections to reference**: §8.1 Testing Philosophy

**State & Invariant Impact Assessment**:
- **Existing states to preserve**: All platform physics behavior
- **New states/invariants to create**: None
- **Time reversal compatibility**: Platform physics must remain time reversal compatible

**Implementation Plan**:
- **Create**: None
- **Modify**: `client/src/scenes/GameScene.js`
- **Delete**: configurePlatform method from GameScene

**Integration Points**:
- **Systems affected**: GameScene only
- **State machines**: None
- **External libraries**: None

**Testing Strategy**:
- **Test files to create/update**: `tests/unit/game-scene.test.js`
- **Key test cases**: Verify no functionality is lost, all platforms still work correctly
- **Mock requirements**: Existing mocks

**Task Breakdown & Acceptance Criteria**:
- [ ] **Method Removal**: Remove configurePlatform method from GameScene
  - [ ] Remove method implementation
  - [ ] Remove method documentation
  - [ ] Verify no references to method remain
- [ ] **Functionality Verification**: Ensure no functionality is lost
  - [ ] All platforms still have correct physics behavior
  - [ ] All collision detection still works
  - [ ] All tests still pass
- [ ] **Code Cleanup**: Clean up any related code
  - [ ] Remove any unused imports or variables
  - [ ] Update any related documentation
- [ ] **Invariant Documentation**: Update invariants.md to reflect method removal
  - [ ] Update §12 Level/Platform Geometry to reflect Platform class handling
  - [ ] Remove any references to GameScene.configurePlatform method
  - [ ] Document that platform configuration is now handled by Platform class

**Expected Output**: Clean GameScene code with configurePlatform functionality moved to Platform class.

**Risk Assessment**:
- **Potential complexity**: Ensuring no functionality is accidentally removed
- **Dependencies**: Platform class must handle all configuration
- **Fallback plan**: Keep method as deprecated if issues arise

**Definition of Done**:
- [ ] configurePlatform method removed from GameScene
- [ ] All platform functionality preserved
- [ ] All tests pass
- [ ] Code is cleaner and more maintainable
- [ ] **invariants.md updated to reflect method removal**
- [ ] No regressions in any functionality

---

## Phase 2: Add Support for Moving Platforms

### Task 2.1: Extend Platform Class for Movement
**Objective**: Add movement capabilities to Platform class for moving platforms.

**Task Reference**: Phase 2, Task 2.1

**Pre-Implementation Analysis**:
- **invariants.md sections to review**: §17 State Structures, §7 TimeManager Rewind System
- **testing_best_practices.md sections to apply**: State-Based Testing, Time-Based Testing
- **small_comprehensive_documentation.md sections to reference**: §7.1 Time Control System

**State & Invariant Impact Assessment**:
- **Existing states to preserve**: All existing static platform behavior
- **New states/invariants to create**: Movement state for time reversal
- **Time reversal compatibility**: Moving platforms must record and restore movement state

**Implementation Plan**:
- **Create**: None
- **Modify**: `client/src/entities/Platform.js`
- **Delete**: None

**Integration Points**:
- **Systems affected**: Platform class, TimeManager
- **State machines**: None
- **External libraries**: Phaser physics, GSAP for smooth movement

**Testing Strategy**:
- **Test files to create/update**: `tests/unit/platform-movement.test.js`
- **Key test cases**: Movement along paths, state recording/restoration, collision during movement
- **Mock requirements**: PhaserSceneMock, GSAP mock, TimeManager mock

**Task Breakdown & Acceptance Criteria**:
- [ ] **Movement Properties**: Add movement-related properties to Platform class
  - [ ] Add movementConfig property for path and speed configuration
  - [ ] Add currentPathIndex and pathProgress for tracking movement
  - [ ] Add isMoving flag for movement state
- [ ] **Movement Logic**: Implement movement update logic
  - [ ] Implement update() method for movement calculations
  - [ ] Support linear interpolation between path points
  - [ ] Support loop and pingPong movement patterns
  - [ ] Handle movement start/stop functionality
- [ ] **State Recording**: Extend state recording for movement
  - [ ] Record current path index and progress in getStateForRecording()
  - [ ] Restore movement state in setStateFromRecording()
  - [ ] Ensure smooth movement restoration during time reversal
- [ ] **Invariant Documentation**: Document moving platform state structure in invariants.md
  - [ ] Extend §17 State Structures to include moving platform state
  - [ ] Document movement state recording requirements
  - [ ] Update §7 TimeManager Rewind System with moving platform considerations

**Expected Output**: Platform class with movement capabilities that work with time reversal.

**Risk Assessment**:
- **Potential complexity**: Ensuring smooth movement during time reversal
- **Dependencies**: TimeManager, GSAP for smooth movement
- **Fallback plan**: Disable movement during time reversal if issues arise

**Definition of Done**:
- [ ] Platform class supports movement along configurable paths
- [ ] Movement state is properly recorded and restored
- [ ] All movement tests pass
- [ ] Time reversal works correctly with moving platforms
- [ ] **invariants.md updated with moving platform state structure**
- [ ] No regressions in static platform functionality

---

### Task 2.2: Create Moving Platform Factory Methods
**Objective**: Add factory methods for creating moving platforms with different movement patterns.

**Task Reference**: Phase 2, Task 2.2

**Pre-Implementation Analysis**:
- **invariants.md sections to review**: §14 Asset & Animation Keys
- **testing_best_practices.md sections to apply**: Factory Pattern Testing
- **small_comprehensive_documentation.md sections to reference**: §1.3 Asset and Sprite Management

**State & Invariant Impact Assessment**:
- **Existing states to preserve**: All existing platform factory functionality
- **New states/invariants to create**: Moving platform configuration patterns
- **Time reversal compatibility**: Factory-created moving platforms must be time reversal compatible

**Implementation Plan**:
- **Create**: None
- **Modify**: `client/src/systems/PlatformFactory.js`
- **Delete**: None

**Integration Points**:
- **Systems affected**: PlatformFactory
- **State machines**: None
- **External libraries**: Platform class

**Testing Strategy**:
- **Test files to create/update**: `tests/unit/platform-factory-movement.test.js`
- **Key test cases**: Moving platform creation, configuration validation, movement pattern creation
- **Mock requirements**: Platform mock, PhaserSceneMock

**Task Breakdown & Acceptance Criteria**:
- [ ] **Moving Platform Creation**: Add createMovingPlatform method
  - [ ] Method accepts movement configuration
  - [ ] Method validates movement parameters
  - [ ] Method creates Platform with movement capabilities
- [ ] **Movement Pattern Helpers**: Add helper methods for common patterns
  - [ ] createHorizontalMovingPlatform for left-right movement
  - [ ] createVerticalMovingPlatform for up-down movement
  - [ ] createCircularMovingPlatform for circular paths
  - [ ] createPatrolMovingPlatform for complex patrol paths
- [ ] **Configuration Validation**: Extend validation for movement config
  - [ ] Validate path points are valid coordinates
  - [ ] Validate speed is positive number
  - [ ] Validate loop and pingPong flags are boolean
- [ ] **Invariant Documentation**: Document moving platform factory patterns in invariants.md
  - [ ] Extend §14 Asset & Animation Keys with moving platform configuration
  - [ ] Document movement pattern validation requirements
  - [ ] Update factory configuration patterns

**Expected Output**: PlatformFactory with methods for creating various types of moving platforms.

**Risk Assessment**:
- **Potential complexity**: Ensuring all movement patterns work correctly
- **Dependencies**: Platform class movement implementation
- **Fallback plan**: Provide simple linear movement as fallback

**Definition of Done**:
- [ ] PlatformFactory supports moving platform creation
- [ ] All movement pattern helpers implemented
- [ ] Configuration validation working correctly
- [ ] All tests pass
- [ ] **invariants.md updated with moving platform factory patterns**
- [ ] No regressions in static platform creation

---

### Task 2.3: Add Moving Platforms to GameScene
**Objective**: Add moving platforms to GameScene to demonstrate and test the new functionality.

**Task Reference**: Phase 2, Task 2.3

**Pre-Implementation Analysis**:
- **invariants.md sections to review**: §3 Scene Lifecycle, §7 TimeManager Rewind System
- **testing_best_practices.md sections to apply**: Integration Testing, State-Based Testing
- **small_comprehensive_documentation.md sections to reference**: §1.2 Scene System

**State & Invariant Impact Assessment**:
- **Existing states to preserve**: All existing static platform functionality
- **New states/invariants to create**: Moving platform instances in scene state
- **Time reversal compatibility**: Moving platforms must be registered with TimeManager

**Implementation Plan**:
- **Create**: None
- **Modify**: `client/src/scenes/GameScene.js`
- **Delete**: None

**Integration Points**:
- **Systems affected**: GameScene, CollisionManager, TimeManager
- **State machines**: None
- **External libraries**: PlatformFactory, Platform class

**Testing Strategy**:
- **Test files to create/update**: `tests/unit/game-scene-moving-platforms.test.js`
- **Key test cases**: Moving platform integration, collision during movement, time reversal
- **Mock requirements**: Platform mock, PlatformFactory mock, TimeManager mock

**Task Breakdown & Acceptance Criteria**:
- [ ] **Moving Platform Addition**: Add moving platforms to GameScene
  - [ ] Create horizontal moving platform
  - [ ] Create vertical moving platform
  - [ ] Create circular moving platform
  - [ ] Register all moving platforms with TimeManager
- [ ] **Collision Integration**: Ensure moving platforms work with collision detection
  - [ ] Player can stand on moving platforms
  - [ ] Enemies can interact with moving platforms
  - [ ] Collision detection works during movement
- [ ] **Time Reversal Integration**: Test time reversal with moving platforms
  - [ ] Moving platforms record and restore movement state
  - [ ] Player position is correctly updated during rewind
  - [ ] No visual glitches during time reversal
- [ ] **Invariant Documentation**: Document moving platform scene integration in invariants.md
  - [ ] Update §3 Scene Lifecycle with moving platform considerations
  - [ ] Document moving platform collision expectations in §10
  - [ ] Update any relevant runtime event names in §15

**Expected Output**: GameScene with moving platforms that work correctly with all game systems.

**Risk Assessment**:
- **Potential complexity**: Ensuring smooth collision detection during movement
- **Dependencies**: Platform movement implementation, TimeManager
- **Fallback plan**: Disable moving platforms if collision issues arise

**Definition of Done**:
- [ ] Moving platforms added to GameScene
- [ ] All collision detection works correctly
- [ ] Time reversal works with moving platforms
- [ ] All integration tests pass
- [ ] **invariants.md updated with moving platform scene integration**
- [ ] No regressions in existing functionality

---

## Phase 3: Enable Level Creation from External JSON Config

### Task 3.1: Create Level Configuration Parser
**Objective**: Create a system to parse level configurations from JSON files.

**Task Reference**: Phase 3, Task 3.1

**Pre-Implementation Analysis**:
- **invariants.md sections to review**: §14 Asset & Animation Keys, §12 Level/Platform Geometry
- **testing_best_practices.md sections to apply**: File I/O Testing, Configuration Testing
- **small_comprehensive_documentation.md sections to reference**: §1.3 Asset and Sprite Management

**State & Invariant Impact Assessment**:
- **Existing states to preserve**: All existing platform creation functionality
- **New states/invariants to create**: Level configuration state structure
- **Time reversal compatibility**: Config-created platforms must be time reversal compatible

**Implementation Plan**:
- **Create**: `client/src/systems/LevelLoader.js`
- **Modify**: None initially
- **Delete**: None

**Integration Points**:
- **Systems affected**: GameScene level creation
- **State machines**: None
- **External libraries**: PlatformFactory, JSON parsing

**Testing Strategy**:
- **Test files to create/update**: `tests/unit/level-loader.test.js`
- **Key test cases**: JSON parsing, configuration validation, platform creation from config
- **Mock requirements**: File system mocks, PlatformFactory mock

**Task Breakdown & Acceptance Criteria**:
- [ ] **LevelLoader Class**: Create LevelLoader class for parsing level configurations
  - [ ] Class can load JSON files from assets
  - [ ] Class validates JSON structure
  - [ ] Class converts JSON to platform configurations
- [ ] **Configuration Validation**: Implement comprehensive validation
  - [ ] Validate required platform properties
  - [ ] Validate movement configurations
  - [ ] Provide descriptive error messages for invalid configs
- [ ] **Platform Creation**: Convert configurations to Platform instances
  - [ ] Use PlatformFactory to create platforms from config
  - [ ] Handle all platform types (static, moving, etc.)
  - [ ] Support all movement patterns
- [ ] **Invariant Documentation**: Document level configuration structure in invariants.md
  - [ ] Add level configuration format to §14 Asset & Animation Keys
  - [ ] Document JSON schema requirements
  - [ ] Update any relevant testing assumptions in §13

**Expected Output**: LevelLoader that can parse JSON configurations and create Platform instances.

**Risk Assessment**:
- **Potential complexity**: Ensuring robust JSON validation and error handling
- **Dependencies**: PlatformFactory, file system access
- **Fallback plan**: Provide default level configuration if loading fails

**Definition of Done**:
- [ ] LevelLoader class created and functional
- [ ] JSON parsing and validation working correctly
- [ ] Platform creation from config working
- [ ] All tests pass
- [ ] **invariants.md updated with level configuration structure**
- [ ] Comprehensive error handling implemented

---

### Task 3.2: Create Sample Level Configuration Files
**Objective**: Create sample JSON configuration files for different level layouts.

**Task Reference**: Phase 3, Task 3.2

**Pre-Implementation Analysis**:
- **invariants.md sections to review**: §14 Asset & Animation Keys, §12 Level/Platform Geometry
- **testing_best_practices.md sections to apply**: Configuration Testing
- **small_comprehensive_documentation.md sections to reference**: §1.3 Asset and Sprite Management

**State & Invariant Impact Assessment**:
- **Existing states to preserve**: Current level layout and gameplay
- **New states/invariants to create**: Level configuration file format
- **Time reversal compatibility**: Config files must define time reversal compatible platforms

**Implementation Plan**:
- **Create**: `client/src/assets/levels/level1.json`, `client/src/assets/levels/level2.json`
- **Modify**: None
- **Delete**: None

**Integration Points**:
- **Systems affected**: LevelLoader, GameScene
- **State machines**: None
- **External libraries**: None

**Testing Strategy**:
- **Test files to create/update**: `tests/unit/level-configs.test.js`
- **Key test cases**: Config file validation, platform creation from files
- **Mock requirements**: File system mocks

**Task Breakdown & Acceptance Criteria**:
- [ ] **Level 1 Configuration**: Create JSON config for current level layout
  - [ ] Define ground platform configuration
  - [ ] Define all floating platform configurations
  - [ ] Match exact current level layout
- [ ] **Level 2 Configuration**: Create JSON config for new level with moving platforms
  - [ ] Include static platforms
  - [ ] Include moving platforms with various patterns
  - [ ] Demonstrate all platform types and movement patterns
- [ ] **Configuration Validation**: Ensure all configs are valid
  - [ ] All required properties present
  - [ ] All movement configurations valid
  - [ ] All asset references valid
- [ ] **Invariant Documentation**: Document sample level configurations in invariants.md
  - [ ] Add sample level file references to §14 Asset & Animation Keys
  - [ ] Document level file naming conventions
  - [ ] Update any relevant directory structure references

**Expected Output**: Sample level configuration files that can be loaded by LevelLoader.

**Risk Assessment**:
- **Potential complexity**: Ensuring configs match exact current behavior
- **Dependencies**: LevelLoader implementation
- **Fallback plan**: Provide simple default configs if complex ones fail

**Definition of Done**:
- [ ] Sample level configuration files created
- [ ] All configurations are valid and loadable
- [ ] Configurations match intended level layouts
- [ ] All tests pass
- [ ] **invariants.md updated with sample level configurations**
- [ ] Documentation provided for config format

---

### Task 3.3: Integrate LevelLoader with GameScene
**Objective**: Modify GameScene to use LevelLoader for level creation instead of hardcoded platforms.

**Task Reference**: Phase 3, Task 3.3

**Pre-Implementation Analysis**:
- **invariants.md sections to review**: §3 Scene Lifecycle, §7 TimeManager Rewind System
- **testing_best_practices.md sections to apply**: Integration Testing, State-Based Testing
- **small_comprehensive_documentation.md sections to reference**: §1.2 Scene System

**State & Invariant Impact Assessment**:
- **Existing states to preserve**: All existing level functionality and appearance
- **New states/invariants to create**: Level loading state in GameScene
- **Time reversal compatibility**: All loaded platforms must be time reversal compatible

**Implementation Plan**:
- **Create**: None
- **Modify**: `client/src/scenes/GameScene.js`
- **Delete**: Hardcoded platform creation code

**Integration Points**:
- **Systems affected**: GameScene, LevelLoader, TimeManager, CollisionManager
- **State machines**: None
- **External libraries**: LevelLoader, PlatformFactory

**Testing Strategy**:
- **Test files to create/update**: `tests/unit/game-scene-level-loading.test.js`
- **Key test cases**: Level loading, platform creation, collision detection, time reversal
- **Mock requirements**: LevelLoader mock, PlatformFactory mock

**Task Breakdown & Acceptance Criteria**:
- [ ] **Level Loading Integration**: Integrate LevelLoader with GameScene
  - [ ] Load level configuration in create() method
  - [ ] Create platforms from loaded configuration
  - [ ] Register all platforms with TimeManager
  - [ ] Set up collision detection for all platforms
- [ ] **Fallback Mechanism**: Implement fallback for loading failures
  - [ ] Use default level if config loading fails
  - [ ] Provide error logging for debugging
  - [ ] Ensure game remains playable
- [ ] **Level Switching**: Support multiple level configurations
  - [ ] Load different levels based on scene data
  - [ ] Support level progression
  - [ ] Maintain state between level switches
- [ ] **Invariant Documentation**: Document level loading integration in invariants.md
  - [ ] Update §3 Scene Lifecycle with level loading process
  - [ ] Document level switching requirements
  - [ ] Update any relevant runtime event names in §15

**Expected Output**: GameScene that loads levels from JSON configuration files.

**Risk Assessment**:
- **Potential complexity**: Ensuring smooth level loading and error handling
- **Dependencies**: LevelLoader, PlatformFactory, TimeManager
- **Fallback plan**: Maintain hardcoded level creation as fallback option

**Definition of Done**:
- [ ] GameScene loads levels from JSON configuration
- [ ] All existing functionality preserved
- [ ] Error handling and fallback mechanisms working
- [ ] All integration tests pass
- [ ] **invariants.md updated with level loading integration**
- [ ] No regressions in gameplay or time reversal

---

### Task 3.4: Add Level Configuration Documentation
**Objective**: Create comprehensive documentation for the level configuration format.

**Task Reference**: Phase 3, Task 3.4

**Pre-Implementation Analysis**:
- **invariants.md sections to review**: §14 Asset & Animation Keys, §12 Level/Platform Geometry
- **testing_best_practices.md sections to apply**: Documentation Testing
- **small_comprehensive_documentation.md sections to reference**: §14.1 Directory Structure

**State & Invariant Impact Assessment**:
- **Existing states to preserve**: All existing documentation structure
- **New states/invariants to create**: Level configuration documentation
- **Time reversal compatibility**: Documentation must cover time reversal considerations

**Implementation Plan**:
- **Create**: `agent_docs/level_configuration.md`
- **Modify**: `agent_docs/small_comprehensive_documentation.md`
- **Delete**: None

**Integration Points**:
- **Systems affected**: Documentation system
- **State machines**: None
- **External libraries**: None

**Testing Strategy**:
- **Test files to create/update**: `tests/unit/level-configuration-docs.test.js`
- **Key test cases**: Documentation accuracy, example validation
- **Mock requirements**: None

**Task Breakdown & Acceptance Criteria**:
- [ ] **Configuration Format Documentation**: Document complete JSON schema
  - [ ] Document all platform properties and their types
  - [ ] Document movement configuration options
  - [ ] Provide examples for all platform types
- [ ] **Usage Examples**: Provide practical examples
  - [ ] Simple static platform examples
  - [ ] Complex moving platform examples
  - [ ] Complete level configuration examples
- [ ] **Best Practices**: Document configuration best practices
  - [ ] Performance considerations
  - [ ] Time reversal compatibility guidelines
  - [ ] Common pitfalls and solutions
- [ ] **Invariant Documentation**: Update invariants.md with documentation references
  - [ ] Add reference to level configuration documentation in §14
  - [ ] Document any new invariants discovered during documentation
  - [ ] Update any relevant testing assumptions in §13

**Expected Output**: Comprehensive documentation for level configuration format.

**Risk Assessment**:
- **Potential complexity**: Ensuring documentation is accurate and complete
- **Dependencies**: Level configuration implementation
- **Fallback plan**: Provide basic documentation with links to code examples

**Definition of Done**:
- [ ] Complete level configuration documentation created
- [ ] All examples validated and working
- [ ] Best practices documented
- [ ] Documentation integrated with existing docs
- [ ] **invariants.md updated with documentation references**
- [ ] All documentation tests pass

---

## Post-Implementation Validation

### Final Integration Testing
- [ ] **Complete Level Loading**: Test loading of all sample levels
- [ ] **Time Reversal Compatibility**: Verify all platforms work with time reversal
- [ ] **Performance Testing**: Ensure no performance degradation
- [ ] **Cross-Platform Testing**: Test on different browsers and devices

### Documentation Updates
- [ ] **invariants.md**: Add new platform-related invariants
- [ ] **small_comprehensive_documentation.md**: Update with platform abstraction details
- [ ] **testing_best_practices.md**: Add platform testing guidelines

### Code Quality Assurance
- [ ] **Code Review**: Complete code review of all new files
- [ ] **Test Coverage**: Ensure adequate test coverage for all new functionality
- [ ] **Performance Analysis**: Verify no performance regressions
- [ ] **Security Review**: Ensure no security vulnerabilities introduced

---

## Success Criteria

The refactoring is successful when:

1. **Functionality Preserved**: All existing platform behavior is maintained exactly
2. **New Capabilities**: Moving platforms and level configuration are fully functional
3. **Time Reversal Compatible**: All platforms work correctly with the time reversal system
4. **Performance Maintained**: No performance degradation compared to hardcoded platforms
5. **Test Coverage**: Comprehensive test coverage for all new functionality
6. **Documentation Complete**: All new features are properly documented
7. **Code Quality**: Clean, maintainable code following project standards

This plan provides a complete roadmap for transforming the hardcoded platform system into a flexible, configurable platform abstraction while maintaining all existing functionality and adding powerful new capabilities. 