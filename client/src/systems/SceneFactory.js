/**
 * SceneFactory - Configuration-driven level generation system
 * 
 * This class provides a clean abstraction for creating game platforms from JSON configuration,
 * replacing hardcoded platform creation in GameScene. It follows the Humble Object pattern
 * by keeping engine-specific logic separate from configuration logic.
 * 
 * Supported Platform Types:
 * - ground: Looping ground tiles across a specified width
 * - floating: Single floating platform tiles
 * - moving: MovingPlatform entities with configurable movement patterns
 */

import MovingPlatform from '../entities/MovingPlatform.js';

export class SceneFactory {
  /**
   * Creates a new SceneFactory instance
   * @param {Phaser.Scene} scene - The Phaser scene instance
   */
  constructor(scene) {
    this.scene = scene;
    this.config = null;
  }

  /**
   * Loads a level configuration from JSON data
   * @param {Object} config - The level configuration object
   * @returns {boolean} - True if configuration is valid and loaded, false otherwise
   */
  loadConfiguration(config) {
    if (!config || !config.platforms || !Array.isArray(config.platforms) || config.platforms.length === 0) {
      return false;
    }

    this.config = config;
    return true;
  }

  // ========================================
  // Platform Creation Methods
  // ========================================

  /**
   * Creates a ground platform using looping tiles
   * @param {Object} groundConfig - Ground platform configuration
   * @param {number} groundConfig.x - Starting X position
   * @param {number} groundConfig.y - Y position (ground top)
   * @param {number} groundConfig.width - Total width of ground platform
   * @param {string} groundConfig.tileKey - Tile atlas key for ground tiles
   * @param {boolean} groundConfig.isFullBlock - Whether to use full block hitbox
   * @param {Phaser.Physics.Arcade.Group} platformsGroup - The physics group to add platforms to
   * @returns {Array|null} - Array of created platform sprites or null if creation failed
   */
  createGroundPlatform(groundConfig, platformsGroup) {
    if (!platformsGroup || !platformsGroup.create) {
      return null;
    }

    const platforms = [];
    const tileWidth = 64; // Standard tile width
    const tileCount = Math.ceil(groundConfig.width / tileWidth);

    for (let i = 0; i < tileCount; i++) {
      const x = groundConfig.x + (i * tileWidth);
      const platform = platformsGroup.create(x, groundConfig.y, 'tiles', groundConfig.tileKey);
      
      platform.setOrigin(0, 0);
      this.configurePlatform(platform, groundConfig.isFullBlock);
      
      platforms.push(platform);
    }

    return platforms;
  }

  /**
   * Creates a single floating platform
   * @param {Object} platformConfig - Platform configuration
   * @param {number} platformConfig.x - X position
   * @param {number} platformConfig.y - Y position
   * @param {string} platformConfig.tileKey - Tile atlas key
   * @param {boolean} platformConfig.isFullBlock - Whether to use full block hitbox
   * @param {Phaser.Physics.Arcade.Group} platformsGroup - The physics group to add platform to
   * @returns {Phaser.Physics.Arcade.Sprite|null} - Created platform sprite or null if creation failed
   */
  createFloatingPlatform(platformConfig, platformsGroup) {
    if (!platformsGroup || !platformsGroup.create) {
      return null;
    }

    const platform = platformsGroup.create(
      platformConfig.x,
      platformConfig.y,
      'tiles',
      platformConfig.tileKey
    );

    this.configurePlatform(platform, platformConfig.isFullBlock);
    return platform;
  }

  /**
   * Creates a moving platform with configurable movement patterns
   * @param {Object} movingConfig - Moving platform configuration
   * @param {number} movingConfig.x - X position
   * @param {number} movingConfig.y - Y position
   * @param {string} movingConfig.tileKey - Tile atlas key
   * @param {boolean} movingConfig.isFullBlock - Whether to use full block hitbox
   * @param {Object} movingConfig.movement - Movement configuration
   * @param {string} movingConfig.movement.type - Movement type: 'linear', 'circular', or 'path'
   * @param {number} movingConfig.movement.speed - Movement speed (10-200 pixels/second)
   * @param {Phaser.Physics.Arcade.Group} platformsGroup - The physics group to add platform to
   * @returns {MovingPlatform|null} - Created moving platform or null if creation failed
   */
  createMovingPlatform(movingConfig, platformsGroup) {
    console.log('[SceneFactory] Creating moving platform with config:', movingConfig);
    
    if (!platformsGroup || !platformsGroup.add) {
      console.warn('[SceneFactory] Invalid platforms group provided');
      return null;
    }

    // Validate movement configuration
    if (!movingConfig.movement || !this.validateMovementConfiguration(movingConfig.movement)) {
      console.warn('[SceneFactory] Invalid movement configuration:', movingConfig.movement);
      return null;
    }

    // Create MovingPlatform instance
    const platform = new MovingPlatform(
      this.scene,
      movingConfig.x,
      movingConfig.y,
      'tiles',
      movingConfig.movement,
      movingConfig.tileKey
    );

    console.log(`[SceneFactory] Created MovingPlatform at (${platform.x}, ${platform.y}) - isMoving: ${platform.isMoving}, autoStart: ${platform.autoStart}`);

    // Add to platforms group
    platformsGroup.add(platform);

    // Configure platform physics
    this.configurePlatform(platform, movingConfig.isFullBlock);

    if (platform.autoStart) {
      platform.initializeMovement();
    }
    console.log('[SceneFactory] MovingPlatform added to platforms group and configured');

    return platform;
  }

  /**
   * Creates all platforms from the loaded configuration
   * @param {Phaser.Physics.Arcade.Group} platformsGroup - The physics group to add platforms to
   * @returns {Array} - Array of all created platform sprites
   */
  createPlatformsFromConfig(platformsGroup) {
    if (!this.config || !this.config.platforms || !platformsGroup) {
      return [];
    }

    const allPlatforms = [];

    for (const platformConfig of this.config.platforms) {
      let platforms = null;

      switch (platformConfig.type) {
        case 'ground':
          platforms = this.createGroundPlatform(platformConfig, platformsGroup);
          break;
        case 'floating':
          const platform = this.createFloatingPlatform(platformConfig, platformsGroup);
          platforms = platform ? [platform] : [];
          break;
        case 'moving':
          const movingPlatform = this.createMovingPlatform(platformConfig, platformsGroup);
          platforms = movingPlatform ? [movingPlatform] : [];
          break;
        default:
          // Skip invalid platform types
          continue;
      }

      if (platforms) {
        allPlatforms.push(...platforms);
      }
    }

    return allPlatforms;
  }

  // ========================================
  // Configuration Validation Methods
  // ========================================

  /**
   * Validates movement configuration for moving platforms
   * @param {Object} movementConfig - Movement configuration to validate
   * @returns {boolean} - True if configuration is valid, false otherwise
   */
  validateMovementConfiguration(movementConfig) {
    if (!movementConfig || typeof movementConfig !== 'object') {
      return false;
    }

    const { type, speed } = movementConfig;

    // Validate required fields
    if (!type || typeof speed !== 'number' || speed <= 0 || speed > 200) {
      return false;
    }

    // Validate type-specific requirements
    switch (type) {
      case 'linear':
        return this.validateLinearMovement(movementConfig);
      case 'circular':
        return this.validateCircularMovement(movementConfig);
      case 'path':
        return this.validatePathMovement(movementConfig);
      default:
        return false;
    }
  }

  /**
   * Validates linear movement configuration
   * @param {Object} config - Linear movement configuration
   * @param {number} config.startX - Start X position
   * @param {number} config.startY - Start Y position  
   * @param {number} config.endX - End X position
   * @param {number} config.endY - End Y position
   * @returns {boolean} - True if valid, false otherwise
   */
  validateLinearMovement(config) {
    const { startX, startY, endX, endY } = config;
    return typeof startX === 'number' && 
           typeof startY === 'number' && 
           typeof endX === 'number' && 
           typeof endY === 'number';
  }

  /**
   * Validates circular movement configuration
   * @param {Object} config - Circular movement configuration
   * @param {number} config.centerX - Center X position
   * @param {number} config.centerY - Center Y position
   * @param {number} config.radius - Circle radius (must be > 0)
   * @returns {boolean} - True if valid, false otherwise
   */
  validateCircularMovement(config) {
    const { centerX, centerY, radius } = config;
    return typeof centerX === 'number' && 
           typeof centerY === 'number' && 
           typeof radius === 'number' && 
           radius > 0;
  }

  /**
   * Validates path movement configuration
   * @param {Object} config - Path movement configuration
   * @param {Array} config.pathPoints - Array of {x, y} waypoints (minimum 2 points)
   * @returns {boolean} - True if valid, false otherwise
   */
  validatePathMovement(config) {
    const { pathPoints } = config;
    return Array.isArray(pathPoints) && 
           pathPoints.length >= 2 && 
           pathPoints.every(point => 
             typeof point.x === 'number' && typeof point.y === 'number'
           );
  }

  // ========================================
  // Platform Configuration Methods
  // ========================================

  /**
   * Configures a platform sprite with physics properties
   * This method replicates the behavior of GameScene.configurePlatform()
   * @param {Phaser.Physics.Arcade.Sprite} platform - The platform sprite to configure
   * @param {boolean} isFullBlock - If true, the hitbox will cover the entire sprite frame
   */
  configurePlatform(platform, isFullBlock = false) {
    if (!platform || !platform.body) return;

    const body = platform.body;
    body.setImmovable(true);
    body.setAllowGravity(false);

    if (isFullBlock) {
      // Use the full size of the sprite's frame for the hitbox
      body.setSize(platform.width, platform.height);
      body.setOffset(0, 0);
    } else {
      // Adjust the hitbox to match the visual part of the tile
      const frameHeight = platform.height;
      const visibleHeight = 20; // Estimated visible height of the grass/dirt
      
      body.setSize(platform.width, visibleHeight);
      body.setOffset(0, frameHeight - visibleHeight);
    }
  }
} 