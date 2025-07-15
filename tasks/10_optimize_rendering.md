# Task Title
Implement Phaser 3.87 Built-in Culling System for Large Level Rendering Optimization

## Objective
Implement Phaser 3.87's native culling mechanisms to dramatically improve rendering performance for large levels (500x100+ tiles) by only rendering sprites within the camera viewport, reducing draw calls and GPU load.

## Task ID: 
Task 10.01

## Pre-Implementation Analysis

### Documentation Dependencies
- [ ] **invariants.md sections to review**: §2 Phaser Game Configuration, §13 Level/Platform Geometry, §15 Asset & Animation Keys
- [ ] **testing_best_practices.md sections to apply**: Performance Testing, Integration Testing, Mock Requirements
- [ ] **comprehensive_documentation.md sections to reference**: §1.7 Performance Tuning, §1.3 Asset and Sprite Management

### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: Camera system, platform rendering, SceneFactory tile creation, centralized scaling system, physics body configurations
- [ ] **New states/invariants to create**: Culling configuration state, viewport bounds tracking, sprite visibility management
- [ ] **Time reversal compatibility**: Culling state must be preserved during TimeManager recording/restoration to maintain visual consistency

## Implementation Plan

### Files/Classes to Change
- **Create**: `client/src/systems/ViewportCullingManager.js` - Centralized culling management
- **Create**: `tests/unit/viewport-culling-manager.test.js` - Unit tests for culling logic
- **Create**: `tests/integration/large-level-culling.test.js` - Integration tests for large levels
- **Modify**: `client/src/systems/SceneFactory.js` - Add culling configuration to tile creation
- **Modify**: `client/src/scenes/GameScene.js` - Integrate culling manager and update loop
- **Modify**: `client/src/config/GameConfig.js` - Add culling configuration options

### Integration Points
- **Systems affected**: SceneFactory, GameScene, Camera system, Physics groups, TimeManager
- **State machines**: None (culling is stateless per frame)
- **External libraries**: Phaser 3.87 culling APIs (no additional dependencies)

### Testing Strategy
- **Test files to create/update**: `tests/unit/viewport-culling-manager.test.js`, `tests/integration/large-level-culling.test.js`
- **Key test cases**: Viewport bounds calculation, sprite visibility toggling, performance benchmarks, culling edge cases
- **Mock requirements**: Camera mock with worldView bounds, large sprite group mocks, performance timing mocks

## Task Breakdown & Acceptance Criteria

### Task 10.01.1: Create ViewportCullingManager Class
- [ ] Implement `ViewportCullingManager` with viewport bounds calculation
- [ ] Add sprite visibility management based on camera position
- [ ] Implement configurable cull distance (default: 200px beyond viewport)
- [ ] Add performance monitoring and metrics collection
- [ ] Verify tests pass for viewport bounds and sprite visibility logic

### Task 10.01.2: Integrate Culling with SceneFactory
- [ ] Modify `SceneFactory.createMapMatrixFromConfig()` to use tilemap layers instead of individual sprites
- [ ] Configure tilemap layer culling with `setCullPaddingX/Y()` and `skipCull = false`
- [ ] Maintain backward compatibility with existing platform creation methods
- [ ] Add culling configuration options to GameConfig.js
- [ ] Verify large level creation performance improvement

### Task 10.01.3: Update GameScene Integration
- [ ] Initialize ViewportCullingManager in GameScene.create()
- [ ] Add culling update loop in GameScene.update()
- [ ] Configure physics groups with culling-optimized settings
- [ ] Integrate with existing camera follow and bounds system
- [ ] Verify no performance impact on small levels

### Task 10.01.4: Add Performance Monitoring
- [ ] Implement frame rate monitoring during culling operations
- [ ] Add sprite count tracking (total vs visible)
- [ ] Create performance benchmarks for 500x100 level rendering
- [ ] Add console logging for performance metrics
- [ ] Verify performance improvements meet targets (60fps on large levels)

### Task 10.01.5: Comprehensive Testing
- [ ] Unit tests for ViewportCullingManager bounds calculation
- [ ] Integration tests for large level rendering performance
- [ ] Edge case tests for camera boundaries and sprite positioning
- [ ] Performance regression tests for existing functionality
- [ ] Verify all existing tests pass with culling system

## Expected Output
- Large levels (500x100+ tiles) render at 60fps without frame drops
- Console displays performance metrics: "Visible sprites: X/Total: Y, FPS: Z"
- No visual artifacts or missing sprites during camera movement
- Memory usage remains stable during large level gameplay
- All existing functionality preserved (physics, collisions, time reversal)

## Risk Assessment
- **Potential complexity**: Tilemap layer integration may conflict with existing sprite-based platform system
- **Dependencies**: Phaser 3.87 culling APIs, existing camera and physics systems
- **Fallback plan**: If tilemap culling causes issues, implement sprite-based culling as alternative approach

## Definition of Done
- [ ] All acceptance criteria are met
- [ ] Large levels render at 60fps with culling system active
- [ ] All project tests pass (locally and in CI)
- [ ] Code reviewed and approved
- [ ] **invariants.md updated with culling system requirements**
- [ ] No new linter or type errors
- [ ] No regressions in related features (physics, collisions, time reversal)
- [ ] Performance benchmarks documented and verified
- [ ] Task marked as complete in tracking system

## Technical Implementation Details

### ViewportCullingManager Architecture
```javascript
// client/src/systems/ViewportCullingManager.js
export class ViewportCullingManager {
  constructor(scene, camera, options = {}) {
    this.scene = scene;
    this.camera = camera;
    this.cullDistance = options.cullDistance || 200;
    this.visibleSprites = new Set();
    this.performanceMetrics = {
      totalSprites: 0,
      visibleSprites: 0,
      cullTime: 0
    };
  }
  
  updateCulling(spriteGroup) {
    const startTime = performance.now();
    const cameraBounds = this.camera.worldView;
    const cullBounds = this.calculateCullBounds(cameraBounds);
    
    let visibleCount = 0;
    spriteGroup.getChildren().forEach(sprite => {
      const isVisible = this.isSpriteInBounds(sprite, cullBounds);
      sprite.setVisible(isVisible);
      sprite.setActive(isVisible);
      
      if (isVisible) {
        this.visibleSprites.add(sprite);
        visibleCount++;
      } else {
        this.visibleSprites.delete(sprite);
      }
    });
    
    this.updatePerformanceMetrics(spriteGroup.getChildren().length, visibleCount, performance.now() - startTime);
  }
  
  calculateCullBounds(cameraBounds) {
    return {
      left: cameraBounds.x - this.cullDistance,
      right: cameraBounds.right + this.cullDistance,
      top: cameraBounds.y - this.cullDistance,
      bottom: cameraBounds.bottom + this.cullDistance
    };
  }
  
  isSpriteInBounds(sprite, bounds) {
    return sprite.x >= bounds.left && 
           sprite.x <= bounds.right && 
           sprite.y >= bounds.top && 
           sprite.y <= bounds.bottom;
  }
}
```

### SceneFactory Culling Integration
```javascript
// Modified SceneFactory.createMapMatrixFromConfig()
createMapMatrixFromConfig(platformsGroup, decorativeGroup = null) {
  // ... existing validation code ...
  
  // Create tilemap for efficient culling
  const tilemap = this.scene.make.tilemap({
    tileWidth: 64,
    tileHeight: 64,
    width: mapMatrix[0].length,
    height: mapMatrix.length
  });
  
  const tileset = tilemap.addTilesetImage('tiles');
  const groundLayer = tilemap.createLayer(0, tileset, 0, 0);
  
  // Configure culling for optimal performance
  groundLayer.setCullPaddingX(2);
  groundLayer.setCullPaddingY(2);
  groundLayer.skipCull = false;
  groundLayer.setScale(LEVEL_SCALE, LEVEL_SCALE);
  
  // Add to platforms group for physics
  platformsGroup.add(groundLayer);
  
  return { groundPlatforms: [groundLayer], decorativePlatforms: [] };
}
```

### GameScene Integration
```javascript
// Modified GameScene.create()
create(data) {
  // ... existing initialization code ...
  
  // Initialize culling manager
  this.viewportCullingManager = new ViewportCullingManager(this, this.cameras.main, {
    cullDistance: 200
  });
  
  // Configure physics groups for culling
  this.platforms = this.physics.add.group({
    classType: Phaser.Physics.Arcade.Sprite,
    runChildUpdate: false,
    maxSize: 1000
  });
  
  this.decorativeTiles = this.physics.add.group({
    classType: Phaser.Physics.Arcade.Sprite,
    runChildUpdate: false,
    maxSize: 2000
  });
}

// Modified GameScene.update()
update(time, delta) {
  // ... existing update code ...
  
  // Update culling for all sprite groups
  if (this.viewportCullingManager) {
    this.viewportCullingManager.updateCulling(this.platforms);
    this.viewportCullingManager.updateCulling(this.decorativeTiles);
    
    // Log performance metrics every 60 frames
    if (this.time % 60 === 0) {
      const metrics = this.viewportCullingManager.performanceMetrics;
      console.log(`Culling: ${metrics.visibleSprites}/${metrics.totalSprites} sprites visible, ${Math.round(1000/delta)}fps`);
    }
  }
}
```

## Integration Points
1. **GameScene ↔ ViewportCullingManager**: Camera bounds and sprite group management
2. **SceneFactory ↔ Tilemap Culling**: Native Phaser culling configuration
3. **Physics Groups ↔ Culling**: Optimized group settings for large sprite counts
4. **TimeManager ↔ Culling State**: Preserve visibility state during time reversal
5. **Camera System ↔ Culling**: Real-time viewport bounds calculation

## Testing Strategy
- **Unit Tests**: Viewport bounds calculation, sprite visibility logic, performance metrics
- **Integration Tests**: Large level rendering performance, camera movement with culling
- **Performance Tests**: Frame rate benchmarks, memory usage monitoring
- **Regression Tests**: Existing functionality preservation, physics and collision systems

## Post-Mortem / Retrospective (fill in if needed)
- _If this task caused test breakage, required significant rework, or revealed process gaps, document what happened and how to avoid it in the future._ 