# Moving Platform Architecture Design

## Executive Summary

This document defines the complete architecture for implementing moving platforms in the Time Oddity project. The design ensures seamless integration with existing systems (SceneFactory, TimeManager, CollisionManager) while maintaining strict compliance with time reversal requirements and decoupled architecture patterns.

## 1. Moving Platform Entity Class Structure

### 1.1 MovingPlatform Class Design

**File**: `client/src/entities/MovingPlatform.js`

The MovingPlatform class extends Entity to provide time-rewindable moving platform functionality with support for linear, circular, and custom path movement patterns.

**Core Properties**:
- `movementType`: 'linear', 'circular', or 'path'
- `speed`: Movement speed in pixels per second
- `isMoving`: Current movement state
- `pathPoints`: Array of waypoints for path movement
- `currentPathIndex`: Current position in path
- `startX/startY/endX/endY`: Linear movement boundaries
- `centerX/centerY/radius/angle`: Circular movement parameters

### 1.2 Core Methods

#### Movement Control
- `initializeMovement()` - Sets up initial movement based on configuration
- `startMovement()` - Begins or resumes movement
- `stopMovement()` - Pauses movement
- `reverseDirection()` - Reverses current movement direction

#### Path Management
- `setPath(pathPoints)` - Updates the movement path
- `getNextPathPoint()` - Calculates next target position
- `moveToPoint(x, y, duration)` - Moves to specific coordinates

#### Physics Integration
- `updatePhysicsBody()` - Synchronizes physics body with movement
- `handleCollisionDuringMovement()` - Manages collisions while moving

## 2. Platform Movement System Architecture

### 2.1 PlatformMovement System Design

**File**: `client/src/systems/PlatformMovement.js`

Pure logic class that calculates movement without engine dependencies. Supports multiple movement patterns and provides deterministic calculations for time reversal compatibility.

**Key Features**:
- Decoupled from Phaser engine for testability
- Deterministic position calculations
- Support for multiple movement patterns
- Time-based movement calculations

### 2.2 Movement Pattern Implementations

#### Linear Movement
- Moves between two points with configurable speed
- Supports bounce (reverse direction) or loop (teleport) modes
- Deterministic position calculation for time reversal

#### Circular Movement
- Moves in circular or elliptical paths
- Uses angle-based positioning for smooth motion
- Configurable radius, center point, and angular velocity

#### Path Movement
- Follows pre-defined waypoints
- Supports closed loops and one-way paths
- Smooth transitions between path segments

## 3. Moving Platform Configuration Schema

### 3.1 JSON Configuration Extension

Extended Level Configuration Schema supporting moving platforms:

```json
{
  "platforms": [
    {
      "type": "moving",
      "x": 400,
      "y": 300,
      "tileKey": "terrain_grass_block_center",
      "isFullBlock": true,
      "movement": {
        "type": "linear",
        "speed": 60,
        "startX": 400,
        "startY": 300,
        "endX": 600,
        "endY": 300,
        "mode": "bounce",
        "autoStart": true
      }
    }
  ]
}
```

### 3.2 Configuration Validation Schema

**Schema Validation Rules**:
- Required fields: `type`, `x`, `y`, `movement.type`
- Movement type validation: `linear`, `circular`, `path`
- Speed constraints: 10-200 pixels per second
- Path validation: minimum 2 points for path movement

## 4. TimeManager Integration for State Recording

### 4.1 Custom State Recording Implementation

MovingPlatform implements custom state recording methods for perfect time reversal:

**getStateForRecording()**: Records position, movement state, path progress, and timing
**setStateFromRecording()**: Restores all movement state and resumes from exact position

### 4.2 Deterministic Movement Restoration

The movement system ensures deterministic behavior during time reversal:
- Position calculation based on absolute time and movement parameters
- State preservation of all movement parameters
- Smooth transitions prevent jarring movement changes
- GSAP integration with proper timeline management

## 5. Collision Handling for Moving Platforms

### 5.1 Player-Platform Collision

Moving platforms require special collision handling for smooth player movement when riding platforms.

### 5.2 Platform-Environment Collision

Moving platforms interact with other game objects:
- Static platform collision
- Enemy collision and riding
- Boundary and obstacle collision

### 5.3 Collision State Management

During time reversal, collision states are preserved and platform-rider relationships maintained.

## 6. Comprehensive Test Plan for Moving Platforms

### 6.1 Unit Test Strategy

**Test Files**:
- `tests/unit/moving-platform.test.js` - Core functionality tests
- `tests/unit/platform-movement.test.js` - Movement system tests

**Test Categories**:
- Core functionality and configuration
- Movement pattern implementations
- Time reversal integration
- Physics and collision behavior

### 6.2 Integration Test Strategy

**Test File**: `tests/integration/moving-platform-integration.test.js`

**Integration Tests**:
- SceneFactory integration
- TimeManager integration
- CollisionManager integration
- Scene lifecycle management

### 6.3 Mock Requirements

#### GSAP Mocking Strategy
- Module mocking for timeline and tween methods
- Timeline tracking for animation verification
- State-based testing without animation execution

#### Phaser Mocking Requirements
- Enhanced physics mocks for moving objects
- Scene mock extensions for platform creation
- Enhanced collision detection mocks

## 7. Architecture Decisions and Integration Points

### 7.1 Key Architecture Decisions

1. **Extend Entity Base Class**: Maintains consistency with existing entity architecture
2. **Separate Movement Logic System**: Follows decoupled architecture pattern
3. **Custom State Recording**: Required for perfect time reversal
4. **GSAP Integration**: Consistent with existing animation patterns

### 7.2 Integration Points

#### SceneFactory Integration
- Add 'moving' platform type to factory
- Extend configuration loading for movement parameters
- New `createMovingPlatform()` method

#### TimeManager Integration
- Automatic registration with TimeManager
- Custom state recording/restoration methods
- Respect for rewind visual overlay

#### CollisionManager Integration
- Enhanced collision setup for moving platforms
- Rider physics for objects on platforms
- Collision state preservation during rewind

### 7.3 Performance Considerations

- Efficient movement calculations
- GSAP performance optimizations
- Memory management for timelines and state
- Update throttling for optimization

## 8. Implementation Roadmap

### Phase 1: Core Implementation (Tasks 2.2-2.3)
1. Implement MovingPlatform entity class
2. Create PlatformMovement system
3. Extend SceneFactory for moving platforms
4. Write comprehensive unit tests

### Phase 2: Integration (Task 2.4)
1. Add moving platform to test scene configuration
2. Integrate with TimeManager and CollisionManager
3. Write integration tests
4. Performance optimization

### Phase 3: Validation (Task 2.5)
1. Comprehensive testing and validation
2. Edge case handling
3. Performance benchmarking
4. Documentation completion

## 9. Risk Mitigation

### Technical Risks
1. **Time Reversal Complexity**: Mitigated by comprehensive state recording
2. **Performance Impact**: Addressed through efficient algorithms
3. **Collision Edge Cases**: Handled by enhanced collision detection

### Integration Risks
1. **Existing System Disruption**: Minimized by extending core systems
2. **Test Suite Stability**: Addressed by proper mocking
3. **Configuration Complexity**: Mitigated by validation and fallbacks

## 10. Success Criteria

### Functional Requirements
- Moving platforms move smoothly along configured paths
- Time reversal works perfectly with moving platforms
- Collision detection works correctly
- Configuration-driven platform creation

### Technical Requirements
- All unit tests pass (target: >95% coverage)
- All integration tests pass
- Performance impact <5% compared to static platforms
- Zero regressions in existing functionality

### Architecture Requirements
- Follows established decoupled architecture patterns
- Maintains compatibility with existing mocking systems
- Integrates seamlessly with existing systems
- Supports future extensibility

---

This architecture provides a comprehensive foundation for implementing moving platforms while maintaining strict compliance with the project's architectural patterns and time reversal requirements. 