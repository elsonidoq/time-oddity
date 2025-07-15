/**
 * ViewportCullingManager - Performance optimization for large level rendering
 * 
 * This class implements viewport-based culling to improve rendering performance
 * for large levels by only rendering sprites within the camera viewport bounds.
 * It reduces draw calls and GPU load by setting sprites to invisible/active=false
 * when they are outside the cull bounds.
 * 
 * Key Features:
 * - Configurable cull distance (default: 200px beyond viewport)
 * - Real-time viewport bounds calculation based on camera position
 * - Performance metrics collection and monitoring
 * - Time reversal compatible state management
 * 
 * Integration Points:
 * - GameScene: Camera bounds and sprite group management
 * - TimeManager: Preserve visibility state during time reversal
 * - SceneFactory: Optimized tilemap layer culling
 */

export class ViewportCullingManager {
  /**
   * Creates a new ViewportCullingManager instance
   * @param {Phaser.Scene} scene - The Phaser scene instance
   * @param {Phaser.Cameras.Scene2D.Camera} camera - The camera to track for viewport bounds
   * @param {Object} options - Configuration options
   * @param {number} options.cullDistance - Distance beyond viewport to keep sprites visible (default: 200)
   */
  constructor(scene, camera, options = {}) {
    this.scene = scene;
    this.camera = camera;
    this.cullDistance = options.cullDistance || 200;
    
    /**
     * Set of currently visible sprites for tracking and time reversal compatibility
     * @type {Set<Phaser.GameObjects.Sprite>}
     */
    this.visibleSprites = new Set();
    
    /**
     * Performance metrics for monitoring culling effectiveness
     * @type {Object}
     */
    this.performanceMetrics = {
      totalSprites: 0,
      visibleSprites: 0,
      cullTime: 0
    };
  }

  /**
   * Updates culling for a sprite group based on current camera viewport
   * @param {Phaser.GameObjects.Group} spriteGroup - The sprite group to cull
   */
  updateCulling(spriteGroup) {
    const startTime = performance.now();
    const cameraBounds = this.camera.worldView;
    const cullBounds = this.calculateCullBounds(cameraBounds);
    
    let visibleCount = 0;
    const sprites = spriteGroup.getChildren();
    
    sprites.forEach(sprite => {
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
    
    this.updatePerformanceMetrics(sprites.length, visibleCount, performance.now() - startTime);
  }

  /**
   * Calculates culling bounds based on camera viewport and cull distance
   * @param {Object} cameraBounds - Camera worldView bounds {x, y, right, bottom}
   * @returns {Object} Culling bounds {left, right, top, bottom}
   */
  calculateCullBounds(cameraBounds) {
    return {
      left: cameraBounds.x - this.cullDistance,
      right: cameraBounds.right + this.cullDistance,
      top: cameraBounds.y - this.cullDistance,
      bottom: cameraBounds.bottom + this.cullDistance
    };
  }

  /**
   * Checks if a sprite is within the specified bounds
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite to check
   * @param {Object} bounds - Bounds object {left, right, top, bottom}
   * @returns {boolean} True if sprite is within bounds
   */
  isSpriteInBounds(sprite, bounds) {
    return sprite.x >= bounds.left && 
           sprite.x <= bounds.right && 
           sprite.y >= bounds.top && 
           sprite.y <= bounds.bottom;
  }

  /**
   * Updates performance metrics with current culling operation data
   * @param {number} totalSprites - Total number of sprites processed
   * @param {number} visibleSprites - Number of sprites currently visible
   * @param {number} cullTime - Time taken for culling operation in milliseconds
   */
  updatePerformanceMetrics(totalSprites, visibleSprites, cullTime) {
    this.performanceMetrics.totalSprites = totalSprites;
    this.performanceMetrics.visibleSprites = visibleSprites;
    this.performanceMetrics.cullTime = cullTime;
  }

  /**
   * Gets current performance metrics for monitoring and debugging
   * @returns {Object} Current performance metrics
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  /**
   * Gets the set of currently visible sprites for time reversal compatibility
   * @returns {Set<Phaser.GameObjects.Sprite>} Set of visible sprites
   */
  getVisibleSprites() {
    return new Set(this.visibleSprites);
  }

  /**
   * Resets the culling manager state (useful for testing and scene transitions)
   */
  reset() {
    this.visibleSprites.clear();
    this.performanceMetrics = {
      totalSprites: 0,
      visibleSprites: 0,
      cullTime: 0
    };
  }
} 