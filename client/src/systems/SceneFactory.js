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
 * 
 * Supported Collectible Types:
 * - coin: Collectible coins with configurable value
 * 
 * Supported Background Types:
 * - layer: Background layers with parallax scrolling support
 */

import MovingPlatform from '../entities/MovingPlatform.js';
import Coin from '../entities/Coin.js';
import GoalTile from '../entities/GoalTile.js';
import { LoopHound } from '../entities/enemies/LoopHound.js';
import { TileSelector } from './TileSelector.js';
import { LEVEL_SCALE } from '../config/GameConfig.js';

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
    if (!config || typeof config !== 'object') {
      this.config = null;
      return false;
    }

    // Ensure platforms is an array (can be empty)
    if (!config.platforms) {
      config.platforms = [];
    } else if (!Array.isArray(config.platforms)) {
      this.config = null;
      return false;
    }

    // Validate backgrounds section if present
    if (config.backgrounds !== undefined) {
      if (!Array.isArray(config.backgrounds)) {
        this.config = null;
        return false;
      }
      for (const backgroundConfig of config.backgrounds) {
        if (!backgroundConfig || typeof backgroundConfig !== 'object') {
          this.config = null;
          return false;
        }
        const criticalFields = ['type', 'x', 'y', 'width', 'height', 'depth'];
        for (const field of criticalFields) {
          if (backgroundConfig[field] === undefined || backgroundConfig[field] === null) {
            this.config = null;
            return false;
          }
        }
        if (backgroundConfig.type !== 'layer') {
          this.config = null;
          return false;
        }
        const numericFields = ['x', 'y', 'width', 'height', 'depth'];
        for (const field of numericFields) {
          if (typeof backgroundConfig[field] !== 'number') {
            this.config = null;
            return false;
          }
        }
      }
    }

    // Validate decorativePlatforms section if present
    if (config.decorativePlatforms !== undefined) {
      if (!Array.isArray(config.decorativePlatforms)) {
        this.config = null;
        return false;
      }
      for (const decorativeConfig of config.decorativePlatforms) {
        if (!this.validateDecorativeConfiguration(decorativeConfig)) {
          this.config = null;
          return false;
        }
      }
    }

    // Validate map_matrix section if present
    if (config.map_matrix !== undefined) {
      if (!this.validateMapMatrixConfiguration(config.map_matrix)) {
        // Remove invalid map_matrix and warn, but do not set config to null
        console.warn('[SceneFactory] map_matrix is invalid, falling back to platforms array');
        delete config.map_matrix;
        // Return false to indicate validation failure
        this.config = null;
        return false;
      }
    }

    this.config = config;
    return true;
  }

  // ========================================
  // Background Creation Methods
  // ========================================

  /**
   * Creates background layers from configuration array
   * @param {Array} backgroundConfigs - Array of background layer configurations
   * @returns {Array} - Array of created background sprites
   */
  createBackgroundsFromConfig(backgroundConfigs) {
    if (!backgroundConfigs || !Array.isArray(backgroundConfigs)) {
      return [];
    }

    if (backgroundConfigs.length === 0) {
      return [];
    }

    const createdBackgrounds = [];

    for (const backgroundConfig of backgroundConfigs) {
      const background = this.createBackgroundLayer(backgroundConfig);
      if (background) {
        createdBackgrounds.push(background);
      }
    }

    return createdBackgrounds;
  }

  /**
   * Creates a single background layer from configuration
   * @param {Object} backgroundConfig - Background layer configuration
   * @param {string} backgroundConfig.type - Always "layer" for background layers
   * @param {number} backgroundConfig.x - X position for layer positioning
   * @param {number} backgroundConfig.y - Y position for layer positioning
   * @param {number} backgroundConfig.width - Width for tileSprite creation
   * @param {number} backgroundConfig.height - Height for tileSprite creation
   * @param {string} backgroundConfig.spriteKey - Background sprite frame name from backgrounds atlas
   * @param {number} backgroundConfig.depth - Z-index for layer ordering (must be negative)
   * @param {number} [backgroundConfig.scrollSpeed=0.0] - Parallax scrolling speed multiplier (0.0-1.0)
   * @param {Object} [backgroundConfig.animation] - Animation configuration
   * @returns {Phaser.GameObjects.TileSprite|null} - Created background sprite or null if validation failed
   */
  createBackgroundLayer(backgroundConfig) {
    // Validate configuration
    if (!this.validateBackgroundConfiguration(backgroundConfig)) {
      return null;
    }

    if (!this.scene || !this.scene.add || !this.scene.add.tileSprite) {
      return null;
    }

    // Create the background layer using tileSprite
    const background = this.scene.add.tileSprite(
      backgroundConfig.x,
      backgroundConfig.y,
      backgroundConfig.width,
      backgroundConfig.height,
      'backgrounds',
      backgroundConfig.spriteKey
    );

    // Set depth for proper layering
    background.setDepth(backgroundConfig.depth);

    // Store scrollSpeed for parallax calculation
    const scrollSpeed = backgroundConfig.scrollSpeed !== undefined ? backgroundConfig.scrollSpeed : 0.0;
    background.setData('scrollSpeed', scrollSpeed);

    // Animation support
    const anim = backgroundConfig.animation;
    if (anim && typeof anim === 'object') {
      // Validate animation config
      const validTypes = ['fade', 'move'];
      const validType = validTypes.includes(anim.animationType);
      const validDuration = typeof anim.duration === 'number' && anim.duration > 0;
      const validEase = typeof anim.ease === 'string';
      
      if (validType && validDuration && validEase) {
        try {
          // Import GSAP dynamically to avoid issues in test environment
          const gsap = require('gsap');
          
          // Create timeline for the animation
          const timeline = gsap.timeline();
          
          // Configure animation based on type
          if (anim.animationType === 'fade') {
            timeline.to(background, {
              alpha: 0.5,
              duration: anim.duration,
              ease: anim.ease,
              repeat: anim.repeat || 0,
              yoyo: anim.repeat > 0
            });
          } else if (anim.animationType === 'move') {
            timeline.to(background, {
              x: background.x + 50,
              y: background.y + 20,
              duration: anim.duration,
              ease: anim.ease,
              repeat: anim.repeat || 0,
              yoyo: anim.repeat > 0
            });
          }
          
          // Attach timeline to background for external control
          background.animationTimeline = timeline;
          
        } catch (error) {
          console.warn('GSAP not available for background animation:', error.message);
        }
      }
    }

    return background;
  }

  /**
   * Validates a background layer configuration for creation
   * @param {Object} backgroundConfig - Background configuration to validate
   * @returns {boolean} - True if configuration is valid for creation, false otherwise
   */
  validateBackgroundConfiguration(backgroundConfig) {
    // Basic structure check (should already be validated in loadConfiguration)
    if (!backgroundConfig || typeof backgroundConfig !== 'object') {
      return false;
    }

    // Critical fields check (should already be validated in loadConfiguration)
    const requiredFields = ['type', 'x', 'y', 'width', 'height', 'spriteKey', 'depth'];
    for (const field of requiredFields) {
      if (backgroundConfig[field] === undefined || backgroundConfig[field] === null) {
        return false;
      }
    }

    // Type validation (should already be validated in loadConfiguration)
    if (backgroundConfig.type !== 'layer') {
      return false;
    }

    // Numeric fields validation (should already be validated in loadConfiguration for critical fields)
    const numericFields = ['x', 'y', 'width', 'height', 'depth'];
    for (const field of numericFields) {
      if (typeof backgroundConfig[field] !== 'number') {
        return false;
      }
    }

    // Validate width and height are positive
    if (backgroundConfig.width <= 0 || backgroundConfig.height <= 0) {
      return false;
    }

    // Validate depth is negative (background layers should be behind gameplay elements)
    if (backgroundConfig.depth >= 0) {
      return false;
    }

    // Validate sprite key (this is the main validation during creation)
    if (typeof backgroundConfig.spriteKey !== 'string') {
      return false;
    }

    // Validate sprite key is from available background sprites
    const validBackgroundSprites = [
      'background_solid_sky', 'background_solid_cloud', 'background_solid_dirt', 
      'background_solid_grass', 'background_solid_sand',
      'background_color_desert', 'background_color_hills', 'background_color_mushrooms', 
      'background_color_trees',
      'background_fade_desert', 'background_fade_hills', 'background_fade_mushrooms', 
      'background_fade_trees',
      'background_clouds'
    ];

    if (!validBackgroundSprites.includes(backgroundConfig.spriteKey)) {
      return false;
    }

    // Validate scrollSpeed if provided
    if (backgroundConfig.scrollSpeed !== undefined) {
      if (typeof backgroundConfig.scrollSpeed !== 'number') {
        return false;
      }
      if (backgroundConfig.scrollSpeed < 0.0 || backgroundConfig.scrollSpeed > 1.0) {
        return false;
      }
    }

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

    // Require tilePrefix for ground platforms (no backward compatibility)
    if (!groundConfig.tilePrefix) {
      return null;
    }

    const platforms = [];
    const tileWidth = 64; // Standard tile width
    const tileCount = Math.ceil(groundConfig.width / tileWidth);

    for (let i = 0; i < tileCount; i++) {
      const x = groundConfig.x * LEVEL_SCALE + (i * tileWidth * LEVEL_SCALE);
      const tileKey = TileSelector.getTileKey(groundConfig.tilePrefix, x, tileCount, i);
      const platform = platformsGroup.create(x, groundConfig.y * LEVEL_SCALE, 'tiles', tileKey);
      
      platform.setOrigin(0, 0);
      this.configurePlatform(platform, groundConfig.isFullBlock);
      
      // Apply centralized scaling
      platform.setScale(LEVEL_SCALE, LEVEL_SCALE);
      
      platforms.push(platform);
    }

    return platforms;
  }

  /**
   * Creates a floating platform (optionally multi-tile wide)
   * @param {Object} platformConfig - Platform configuration
   * @param {number} platformConfig.x - X position (leftmost tile)
   * @param {number} platformConfig.y - Y position
   * @param {number} [platformConfig.width] - Optional width in pixels (creates multiple tiles if > 64)
   * @param {string} platformConfig.tileKey - Tile atlas key
   * @param {boolean} platformConfig.isFullBlock - Whether to use full block hitbox
   * @param {Phaser.Physics.Arcade.Group} platformsGroup - The physics group to add platform(s) to
   * @returns {Array<Phaser.Physics.Arcade.Sprite>|Phaser.Physics.Arcade.Sprite|null} - Array of created platform sprites (if width specified), single sprite, or null if creation failed
   *
   * If width is specified and > 64, creates multiple adjacent tiles starting at x, each 64px wide.
   * If width is omitted, creates a single tile at (x, y).
   */
  createFloatingPlatform(platformConfig, platformsGroup) {
    if (!platformsGroup || !platformsGroup.create) {
      return null;
    }

    // Require tilePrefix for floating platforms (no backward compatibility)
    if (!platformConfig.tilePrefix) {
      return null;
    }

    // If width is specified and greater than tile width, create multiple tiles like ground platform
    if (platformConfig.width && platformConfig.width > 64) {
      const platforms = [];
      const tileWidth = 64; // Standard tile width
      const tileCount = Math.ceil(platformConfig.width / tileWidth);

      for (let i = 0; i < tileCount; i++) {
        const x = platformConfig.x * LEVEL_SCALE + (i * tileWidth * LEVEL_SCALE);
        const tileKey = TileSelector.getTileKey(platformConfig.tilePrefix, x, tileCount, i);
        const platform = platformsGroup.create(x, platformConfig.y * LEVEL_SCALE, 'tiles', tileKey);
        
        platform.setOrigin(0, 0);
        this.configurePlatform(platform, platformConfig.isFullBlock);
        
        // Apply centralized scaling
        platform.setScale(LEVEL_SCALE, LEVEL_SCALE);
        
        platforms.push(platform);
      }

      return platforms;
    }

    // Default behavior: create single tile
    const tileKey = TileSelector.getTileKey(platformConfig.tilePrefix, platformConfig.x, 1, 0);
    const platform = platformsGroup.create(
      platformConfig.x * LEVEL_SCALE,
      platformConfig.y * LEVEL_SCALE,
      'tiles',
      tileKey
    );

    this.configurePlatform(platform, platformConfig.isFullBlock);
    
    // Apply centralized scaling
    platform.setScale(LEVEL_SCALE, LEVEL_SCALE);
    
    return platform;
  }

  /**
   * Creates a moving platform with configurable movement patterns and width
   * @param {Object} movingConfig - Moving platform configuration
   * @param {number} movingConfig.x - X position
   * @param {number} movingConfig.y - Y position
   * @param {number} [movingConfig.width] - Optional width in pixels (creates multiple sprites if > 64)
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

    // Require tilePrefix for moving platforms (no backward compatibility)
    if (!movingConfig.tilePrefix) {
      console.warn('[SceneFactory] Missing tilePrefix for moving platform');
      return null;
    }

    // Validate movement configuration
    if (!movingConfig.movement || !this.validateMovementConfiguration(movingConfig.movement)) {
      console.warn('[SceneFactory] Invalid movement configuration:', movingConfig.movement);
      return null;
    }

    // Create MovingPlatform instance with width support
    const platform = new MovingPlatform(
      this.scene,
      movingConfig.x * LEVEL_SCALE,
      movingConfig.y * LEVEL_SCALE,
      'tiles',
      movingConfig.movement,
      null, // frame parameter should be null for new tilePrefix system
      null, // mockScene
      { 
        width: movingConfig.width,
        tilePrefix: movingConfig.tilePrefix
      }
    );

    console.log(`[SceneFactory] Created MovingPlatform at (${platform.x}, ${platform.y}) - isMoving: ${platform.isMoving}, autoStart: ${platform.autoStart}, width: ${platform.width}, spriteCount: ${platform.spriteCount}`);

    // Add to platforms group
    platformsGroup.add(platform);

    // Configure platform physics for master sprite
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
   * @param {Phaser.Physics.Arcade.Group} [decorativeGroup] - The decorative group to add decorative tiles to
   * @returns {Array} - Array of all created platform sprites
   */
  createPlatformsFromConfig(platformsGroup, decorativeGroup = null) {
    if (!this.config || !platformsGroup) {
      return [];
    }

    const allPlatforms = [];

    // Precedence: If map_matrix is present and valid, use only map_matrix
    if (this.config.map_matrix && Array.isArray(this.config.map_matrix) && this.config.map_matrix.length > 0) {
      const mapMatrixResult = this.createMapMatrixFromConfig(platformsGroup, decorativeGroup);
      if (mapMatrixResult && mapMatrixResult.groundPlatforms && Array.isArray(mapMatrixResult.groundPlatforms) && mapMatrixResult.groundPlatforms.length > 0) {
        allPlatforms.push(...mapMatrixResult.groundPlatforms);
        // Note: Decorative platforms are handled separately
        return allPlatforms;
      } else {
        // If map_matrix is present but empty or failed to create platforms, fallback to platforms
        console.warn('[SceneFactory] map_matrix present but produced no platforms, falling back to platforms array');
      }
    }

    // Fallback: Use platforms array if present
    if (this.config.platforms && Array.isArray(this.config.platforms)) {
      for (const platformConfig of this.config.platforms) {
        let platforms = null;

        switch (platformConfig.type) {
          case 'ground':
            platforms = this.createGroundPlatform(platformConfig, platformsGroup);
            break;
          case 'floating':
            const floatingResult = this.createFloatingPlatform(platformConfig, platformsGroup);
            platforms = floatingResult ? (Array.isArray(floatingResult) ? floatingResult : [floatingResult]) : [];
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
    }

    return allPlatforms;
  }

  // ========================================
  // Coin Creation Methods
  // ========================================

  /**
   * Creates a single coin from configuration
   * @param {Object} coinConfig - Coin configuration
   * @param {number} coinConfig.x - X position
   * @param {number} coinConfig.y - Y position
   * @param {Object} [coinConfig.properties] - Optional coin properties
   * @param {number} [coinConfig.properties.value] - Coin value (defaults to 100)
   * @param {Phaser.Physics.Arcade.Group} coinsGroup - The physics group to add coin to
   * @returns {Coin|null} - Created coin or null if creation failed
   */
  createCoin(coinConfig, coinsGroup) {
    if (!coinConfig || typeof coinConfig.x !== 'number' || typeof coinConfig.y !== 'number') {
      return null;
    }

    if (!coinsGroup || !coinsGroup.add) {
      return null;
    }

    // Temporarily set this.scene.coins so Coin constructor adds to the correct group
    const prevCoinsGroup = this.scene.coins;
    this.scene.coins = coinsGroup;
    const coin = new Coin(
      this.scene,
      coinConfig.x * LEVEL_SCALE,
      coinConfig.y * LEVEL_SCALE,
      'coin_spin',
      this.scene._mockScene // Pass mock scene for testing
    );
    this.scene.coins = prevCoinsGroup; // Restore previous value

    // Return the coin sprite (not the coin object) for consistency with other create methods
    return coin.sprite;
  }

  /**
   * Creates multiple coins from configuration array
   * @param {Array} coinConfigs - Array of coin configurations
   * @param {Phaser.Physics.Arcade.Group} coinsGroup - The physics group to add coins to
   * @returns {Array} - Array of created coin sprites
   */
  createCoinsFromConfig(coinConfigs, coinsGroup) {
    if (!coinConfigs || !Array.isArray(coinConfigs) || !coinsGroup) {
      return [];
    }

    const coins = [];

    for (const coinConfig of coinConfigs) {
      const coin = this.createCoin(coinConfig, coinsGroup);
      if (coin) {
        coins.push(coin);
      }
    }

    return coins;
  }

  // ========================================
  // Goal Tile Creation Methods
  // ========================================

  /**
   * Creates a goal tile entity through physics group (follows invariants.md §13.3)
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} tileKey - The tile key from the tiles atlas (defaults to 'block_coin')
   * @param {Phaser.Physics.Arcade.Group} goalTilesGroup - The physics group to add goal tile to
   * @param {boolean} isFullBlock - Whether to use full block hitbox (defaults to true for goal tiles)
   * @returns {Phaser.Physics.Arcade.Sprite} - Created goal tile sprite
   */
  createGoalTile(x, y, tileKey = 'block_coin', goalTilesGroup, isFullBlock = true) {
    if (typeof x !== 'number' || typeof y !== 'number') {
      console.warn('[SceneFactory] Invalid coordinates for goal tile:', { x, y });
      return null;
    }

    if (!tileKey || typeof tileKey !== 'string') {
      console.warn('[SceneFactory] Invalid tileKey for goal tile, using default:', tileKey);
      tileKey = 'block_coin';
    }

    if (!goalTilesGroup || !goalTilesGroup.create) {
      console.warn('[SceneFactory] Invalid goalTilesGroup provided for goal tile creation');
      return null;
    }

    try {
      // Create goal tile through physics group (correct ordering per invariants.md §13.3)
      const goalTile = goalTilesGroup.create(x, y, 'tiles', tileKey);
      
      // Set origin for proper positioning
      goalTile.setOrigin(0, 0);
      
      // Configure physics AFTER adding to group to prevent configuration loss
      this.configurePlatform(goalTile, isFullBlock);
      
      // Apply centralized scaling
      goalTile.setScale(LEVEL_SCALE, LEVEL_SCALE);
      
      console.log(`[SceneFactory] Created GoalTile at (${x}, ${y}) with tileKey: ${tileKey}`);
      return goalTile;
    } catch (error) {
      console.error('[SceneFactory] Failed to create GoalTile:', error);
      return null;
    }
  }

  /**
   * Creates a goal tile from the loaded configuration
   * @param {Phaser.Physics.Arcade.Group} goalTilesGroup - The physics group to add goal tile to
   * @returns {Phaser.Physics.Arcade.Sprite|null} - Created goal tile sprite or null if no goal in config
   */
  createGoalFromConfig(goalTilesGroup) {
    if (!this.config || !this.config.goal) {
      return null;
    }

    const goalConfig = this.config.goal;

    // Validate coordinates
    if (typeof goalConfig.x !== 'number' || typeof goalConfig.y !== 'number') {
      console.warn('[SceneFactory] Invalid goal coordinates in config');
      return null;
    }

    // Handle missing or invalid tileKey
    let tileKey = goalConfig.tileKey;
    if (!tileKey || typeof tileKey !== 'string') {
      console.warn('[SceneFactory] Goal tileKey missing, using default');
      tileKey = 'block_coin';
    }

    // Handle isFullBlock configuration (defaults to true for goal tiles)
    const isFullBlock = goalConfig.isFullBlock !== undefined ? goalConfig.isFullBlock : true;

    return this.createGoalTile(goalConfig.x * LEVEL_SCALE, goalConfig.y * LEVEL_SCALE, tileKey, goalTilesGroup, isFullBlock);
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

  // ========================================
  // Decorative Platform Creation Methods
  // ========================================

  /**
   * Creates decorative platforms from configuration array
   * @param {Array} decorativeConfigs - Array of decorative platform configurations
   * @param {Phaser.Physics.Arcade.Group} [decorativeGroup] - The decorative group to add decorative tiles to
   * @returns {Array} - Array of created decorative platform sprites
   */
  createDecorativePlatformsFromConfig(decorativeConfigs, decorativeGroup = null) {
    const createdDecoratives = [];

    // Handle traditional decorativePlatforms array
    if (decorativeConfigs && Array.isArray(decorativeConfigs)) {
      if (decorativeConfigs.length > 0) {
        if (!this.scene || !this.scene.add || !this.scene.add.image) {
          return [];
        }
        for (const decorativeConfig of decorativeConfigs) {
          const decoratives = this.createDecorativePlatform(decorativeConfig);
          if (decoratives) {
            if (Array.isArray(decoratives)) {
              createdDecoratives.push(...decoratives);
            } else {
              createdDecoratives.push(decoratives);
            }
          }
        }
      }
    }

    // Handle map_matrix decorative platforms if present
    if (this.config && this.config.map_matrix) {
      const mapMatrixResult = this.createMapMatrixFromConfig(null, decorativeGroup); // Pass decorativeGroup for proper separation
      if (mapMatrixResult && mapMatrixResult.decorativePlatforms && Array.isArray(mapMatrixResult.decorativePlatforms)) {
        createdDecoratives.push(...mapMatrixResult.decorativePlatforms);
      }
    }

    return createdDecoratives;
  }

  /**
   * Creates a single decorative platform from configuration
   * @param {Object} decorativeConfig - Decorative platform configuration
   * @param {string} decorativeConfig.type - Always "decorative"
   * @param {number} decorativeConfig.x - X position
   * @param {number} decorativeConfig.y - Y position
   * @param {string} decorativeConfig.tilePrefix - Base tile prefix for automatic tile selection
   * @param {number} [decorativeConfig.width] - Optional span in pixels (default 64)
   * @param {number} decorativeConfig.depth - Z-index for rendering order (must be negative)
   * @returns {Phaser.GameObjects.Image|Array|null} - Created decorative sprite(s) or null if validation failed
   */
  createDecorativePlatform(decorativeConfig) {
    // Validate configuration
    if (!this.validateDecorativeConfiguration(decorativeConfig)) {
      return null;
    }

    if (!this.scene || !this.scene.add || !this.scene.add.image) {
      return null;
    }

    // If width is specified, create multiple tiles like floating platform
    if (decorativeConfig.width && decorativeConfig.width > 64) {
      const decoratives = [];
      const tileWidth = 64; // Standard tile width
      const tileCount = Math.ceil(decorativeConfig.width / tileWidth);

      for (let i = 0; i < tileCount; i++) {
        const x = decorativeConfig.x * LEVEL_SCALE + (i * tileWidth * LEVEL_SCALE);
        const tileKey = TileSelector.getTileKey(decorativeConfig.tilePrefix, x, tileCount, i);
        const decorative = this.scene.add.image(x, decorativeConfig.y * LEVEL_SCALE, 'tiles', tileKey);
        
        decorative.setOrigin(0, 0);
        decorative.setDepth(decorativeConfig.depth);
        
        // Apply centralized scaling
        decorative.setScale(LEVEL_SCALE, LEVEL_SCALE);
        
        decoratives.push(decorative);
      }

      return decoratives;
    }

    // Default behavior: create single tile
    const tileKey = TileSelector.getTileKey(decorativeConfig.tilePrefix, decorativeConfig.x, 1, 0);
    const decorative = this.scene.add.image(
      decorativeConfig.x * LEVEL_SCALE,
      decorativeConfig.y * LEVEL_SCALE,
      'tiles',
      tileKey
    );

    decorative.setOrigin(0, 0);
    decorative.setDepth(decorativeConfig.depth);
    
    // Apply centralized scaling
    decorative.setScale(LEVEL_SCALE, LEVEL_SCALE);

    return decorative;
  }

  /**
   * Validates a decorative platform configuration for creation
   * @param {Object} decorativeConfig - Decorative configuration to validate
   * @returns {boolean} - True if configuration is valid for creation, false otherwise
   */
  validateDecorativeConfiguration(decorativeConfig) {
    // Basic structure check
    if (!decorativeConfig || typeof decorativeConfig !== 'object') {
      return false;
    }

    // Critical fields check
    const requiredFields = ['type', 'x', 'y', 'tilePrefix', 'depth'];
    for (const field of requiredFields) {
      if (decorativeConfig[field] === undefined || decorativeConfig[field] === null) {
        return false;
      }
    }

    // Ensure type is correct
    if (decorativeConfig.type !== 'decorative') {
      return false;
    }

    // Validate numeric fields
    const numericFields = ['x', 'y', 'depth'];
    for (const field of numericFields) {
      if (typeof decorativeConfig[field] !== 'number') {
        return false;
      }
    }

    // Validate tilePrefix is a string
    if (typeof decorativeConfig.tilePrefix !== 'string') {
      return false;
    }

    // Validate depth is negative for background rendering
    if (decorativeConfig.depth >= 0) {
      return false;
    }

    // Validate width if specified
    if (decorativeConfig.width !== undefined) {
      if (typeof decorativeConfig.width !== 'number' || decorativeConfig.width <= 0) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validates a map_matrix configuration
   * @param {Array} mapMatrix - 2D array of tile dictionaries
   * @returns {boolean} - True if configuration is valid, false otherwise
   */
  validateMapMatrixConfiguration(mapMatrix) {
    // Basic structure check - must be an array
    if (!Array.isArray(mapMatrix)) {
      return false;
    }

    // Handle empty matrix
    if (mapMatrix.length === 0) {
      return true;
    }

    // Validate matrix dimensions (maximum 100x100 for performance)
    if (mapMatrix.length > 100) {
      return false;
    }

    // Validate each row is an array and check for consistent column count
    let expectedColumnCount = null;
    for (let rowIndex = 0; rowIndex < mapMatrix.length; rowIndex++) {
      const row = mapMatrix[rowIndex];
      if (!Array.isArray(row)) {
        return false;
      }

      // Check column count consistency
      if (expectedColumnCount === null) {
        expectedColumnCount = row.length;
      } else if (row.length !== expectedColumnCount) {
        return false;
      }

      // Validate column count limit
      if (row.length > 1000) {
        return false;
      }

      // Validate each tile dictionary in the row
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const tileDict = row[colIndex];
        if (!tileDict) {
          continue;
        }
        
        // Validate tile dictionary structure
        if (!tileDict || typeof tileDict !== 'object') {
          return false;
        }

        // Validate required fields
        if (tileDict.tileKey === undefined || tileDict.tileKey === null) {
          return false;
        }
        if (tileDict.type === undefined || tileDict.type === null) {
          return false;
        }

        // Validate tileKey is a string
        if (typeof tileDict.tileKey !== 'string') {
          return false;
        }

        // Validate type is a string
        if (typeof tileDict.type !== 'string') {
          return false;
        }

        // Validate tileKey against available tiles
        if (!this.isValidTileKey(tileDict.tileKey)) {
          return false;
        }

        // Validate type is either "ground" or "decorative"
        if (tileDict.type !== 'ground' && tileDict.type !== 'decorative') {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Validates if a tileKey is in the list of available tiles
   * @param {string} tileKey - The tile key to validate
   * @returns {boolean} - True if tileKey is valid, false otherwise
   */
  isValidTileKey(tileKey) {
    // List of all available tiles from available_tiles.md
    const availableTiles = [
      'block_blue', 'block_coin', 'block_coin_active', 'block_empty', 'block_empty_warning',
      'block_exclamation', 'block_exclamation_active', 'block_green', 'block_plank', 'block_planks',
      'block_red', 'block_spikes', 'block_strong_coin', 'block_strong_coin_active', 'block_strong_danger',
      'block_strong_danger_active', 'block_strong_empty', 'block_strong_empty_active', 'block_strong_exclamation',
      'block_strong_exclamation_active', 'block_yellow', 'bomb', 'bomb_active', 'brick_brown',
      'brick_brown_diagonal', 'brick_grey', 'brick_grey_diagonal', 'bricks_brown', 'bricks_grey',
      'bridge', 'bridge_logs', 'bush', 'cactus', 'chain', 'coin_bronze', 'coin_bronze_side',
      'coin_gold', 'coin_gold_side', 'coin_silver', 'coin_silver_side', 'conveyor', 'door_closed',
      'door_closed_top', 'door_open', 'door_open_top', 'fence', 'fence_broken', 'fireball',
      'flag_blue_a', 'flag_blue_b', 'flag_green_a', 'flag_green_b', 'flag_off', 'flag_red_a',
      'flag_red_b', 'flag_yellow_a', 'flag_yellow_b', 'gem_blue', 'gem_green', 'gem_red', 'gem_yellow',
      'grass', 'grass_purple', 'heart', 'hill', 'hill_top', 'hill_top_smile', 'hud_character_0',
      'hud_character_1', 'hud_character_2', 'hud_character_3', 'hud_character_4', 'hud_character_5',
      'hud_character_6', 'hud_character_7', 'hud_character_8', 'hud_character_9', 'hud_character_multiply',
      'hud_character_percent', 'hud_coin', 'hud_heart', 'hud_heart_empty', 'hud_heart_half',
      'hud_key_blue', 'hud_key_green', 'hud_key_red', 'hud_key_yellow', 'hud_player_beige',
      'hud_player_green', 'hud_player_helmet_beige', 'hud_player_helmet_green', 'hud_player_helmet_pink',
      'hud_player_helmet_purple', 'hud_player_helmet_yellow', 'hud_player_pink', 'hud_player_purple',
      'hud_player_yellow', 'key_blue', 'key_green', 'key_red', 'key_yellow', 'ladder_bottom',
      'ladder_middle', 'ladder_top', 'lava', 'lava_top', 'lava_top_low', 'lever', 'lever_left',
      'lever_right', 'lock_blue', 'lock_green', 'lock_red', 'lock_yellow', 'mushroom_brown',
      'mushroom_red', 'ramp', 'rock', 'rop_attached', 'rope', 'saw', 'sign', 'sign_exit',
      'sign_left', 'sign_right', 'snow', 'spikes', 'spring', 'spring_out', 'star', 'switch_blue',
      'switch_blue_pressed', 'switch_green', 'switch_green_pressed', 'switch_red', 'switch_red_pressed',
      'switch_yellow', 'switch_yellow_pressed', 'terrain_dirt_block', 'terrain_dirt_block_bottom',
      'terrain_dirt_block_bottom_left', 'terrain_dirt_block_bottom_right', 'terrain_dirt_block_center',
      'terrain_dirt_block_left', 'terrain_dirt_block_right', 'terrain_dirt_block_top',
      'terrain_dirt_block_top_left', 'terrain_dirt_block_top_right', 'terrain_dirt_cloud',
      'terrain_dirt_cloud_background', 'terrain_dirt_cloud_left', 'terrain_dirt_cloud_middle',
      'terrain_dirt_cloud_right', 'terrain_dirt_horizontal_left', 'terrain_dirt_horizontal_middle',
      'terrain_dirt_horizontal_overhang_left', 'terrain_dirt_horizontal_overhang_right',
      'terrain_dirt_horizontal_right', 'terrain_dirt_ramp_long_a', 'terrain_dirt_ramp_long_b',
      'terrain_dirt_ramp_long_c', 'terrain_dirt_ramp_short_a', 'terrain_dirt_ramp_short_b',
      'terrain_dirt_vertical_bottom', 'terrain_dirt_vertical_middle', 'terrain_dirt_vertical_top',
      'terrain_grass_block', 'terrain_grass_block_bottom', 'terrain_grass_block_bottom_left',
      'terrain_grass_block_bottom_right', 'terrain_grass_block_center', 'terrain_grass_block_left',
      'terrain_grass_block_right', 'terrain_grass_block_top', 'terrain_grass_block_top_left',
      'terrain_grass_block_top_right', 'terrain_grass_cloud', 'terrain_grass_cloud_background',
      'terrain_grass_cloud_left', 'terrain_grass_cloud_middle', 'terrain_grass_cloud_right',
      'terrain_grass_horizontal_left', 'terrain_grass_horizontal_middle', 'terrain_grass_horizontal_overhang_left',
      'terrain_grass_horizontal_overhang_right', 'terrain_grass_horizontal_right', 'terrain_grass_ramp_long_a',
      'terrain_grass_ramp_long_b', 'terrain_grass_ramp_long_c', 'terrain_grass_ramp_short_a',
      'terrain_grass_ramp_short_b', 'terrain_grass_vertical_bottom', 'terrain_grass_vertical_middle',
      'terrain_grass_vertical_top', 'terrain_purple_block', 'terrain_purple_block_bottom',
      'terrain_purple_block_bottom_left', 'terrain_purple_block_bottom_right', 'terrain_purple_block_center',
      'terrain_purple_block_left', 'terrain_purple_block_right', 'terrain_purple_block_top',
      'terrain_purple_block_top_left', 'terrain_purple_block_top_right', 'terrain_purple_cloud',
      'terrain_purple_cloud_background', 'terrain_purple_cloud_left', 'terrain_purple_cloud_middle',
      'terrain_purple_cloud_right', 'terrain_purple_horizontal_left', 'terrain_purple_horizontal_middle',
      'terrain_purple_horizontal_overhang_left', 'terrain_purple_horizontal_overhang_right',
      'terrain_purple_horizontal_right', 'terrain_purple_ramp_long_a', 'terrain_purple_ramp_long_b',
      'terrain_purple_ramp_long_c', 'terrain_purple_ramp_short_a', 'terrain_purple_ramp_short_b',
      'terrain_purple_vertical_bottom', 'terrain_purple_vertical_middle', 'terrain_purple_vertical_top',
      'terrain_sand_block', 'terrain_sand_block_bottom', 'terrain_sand_block_bottom_left',
      'terrain_sand_block_bottom_right', 'terrain_sand_block_center', 'terrain_sand_block_left',
      'terrain_sand_block_right', 'terrain_sand_block_top', 'terrain_sand_block_top_left',
      'terrain_sand_block_top_right', 'terrain_sand_cloud', 'terrain_sand_cloud_background',
      'terrain_sand_cloud_left', 'terrain_sand_cloud_middle', 'terrain_sand_cloud_right',
      'terrain_sand_horizontal_left', 'terrain_sand_horizontal_middle', 'terrain_sand_horizontal_overhang_left',
      'terrain_sand_horizontal_overhang_right', 'terrain_sand_horizontal_right', 'terrain_sand_ramp_long_a',
      'terrain_sand_ramp_long_b', 'terrain_sand_ramp_long_c', 'terrain_sand_ramp_short_a',
      'terrain_sand_ramp_short_b', 'terrain_sand_vertical_bottom', 'terrain_sand_vertical_middle',
      'terrain_sand_vertical_top', 'terrain_snow_block', 'terrain_snow_block_bottom',
      'terrain_snow_block_bottom_left', 'terrain_snow_block_bottom_right', 'terrain_snow_block_center',
      'terrain_snow_block_left', 'terrain_snow_block_right', 'terrain_snow_block_top',
      'terrain_snow_block_top_left', 'terrain_snow_block_top_right', 'terrain_snow_cloud',
      'terrain_snow_cloud_background', 'terrain_snow_cloud_left', 'terrain_snow_cloud_middle',
      'terrain_snow_cloud_right', 'terrain_snow_horizontal_left', 'terrain_snow_horizontal_middle',
      'terrain_snow_horizontal_overhang_left', 'terrain_snow_horizontal_overhang_right',
      'terrain_snow_horizontal_right', 'terrain_snow_ramp_long_a', 'terrain_snow_ramp_long_b',
      'terrain_snow_ramp_long_c', 'terrain_snow_ramp_short_a', 'terrain_snow_ramp_short_b',
      'terrain_snow_vertical_bottom', 'terrain_snow_vertical_middle', 'terrain_snow_vertical_top',
      'terrain_stone_block', 'terrain_stone_block_bottom', 'terrain_stone_block_bottom_left',
      'terrain_stone_block_bottom_right', 'terrain_stone_block_center', 'terrain_stone_block_left',
      'terrain_stone_block_right', 'terrain_stone_block_top', 'terrain_stone_block_top_left',
      'terrain_stone_block_top_right', 'terrain_stone_cloud', 'terrain_stone_cloud_background',
      'terrain_stone_cloud_left', 'terrain_stone_cloud_middle', 'terrain_stone_cloud_right',
      'terrain_stone_horizontal_left', 'terrain_stone_horizontal_middle', 'terrain_stone_horizontal_overhang_left',
      'terrain_stone_horizontal_overhang_right', 'terrain_stone_horizontal_right', 'terrain_stone_ramp_long_a',
      'terrain_stone_ramp_long_b', 'terrain_stone_ramp_long_c', 'terrain_stone_ramp_short_a',
      'terrain_stone_ramp_short_b', 'terrain_stone_vertical_bottom', 'terrain_stone_vertical_middle',
      'terrain_stone_vertical_top', 'torch_off', 'torch_on_a', 'torch_on_b', 'water', 'water_top',
      'water_top_low', 'weight', 'window'
    ];

    return availableTiles.includes(tileKey);
  }

  // ========================================
  // Map Matrix Parsing Methods
  // ========================================

  /**
   * Creates platforms from map_matrix configuration
   * @param {Phaser.GameObjects.Group} platformsGroup - The platforms group to add ground platforms to
   * @param {Phaser.GameObjects.Group} [decorativeGroup] - The decorative group to add decorative tiles to
   * @returns {Object|null} - Object with groundPlatforms and decorativePlatforms arrays, or null if no map_matrix or empty
   */
  createMapMatrixFromConfig(platformsGroup, decorativeGroup = null) {
    if (!this.config || !this.config.map_matrix) {
      return null;
    }

    const mapMatrix = this.config.map_matrix;
    if (!Array.isArray(mapMatrix) || mapMatrix.length === 0) {
      return null;
    }
    if (!platformsGroup) {
      return null;
    }

    const groundPlatforms = [];
    const decorativePlatforms = [];

    // Iterate over each cell in the map matrix
    for (let rowIndex = 0; rowIndex < mapMatrix.length; rowIndex++) {
      const row = mapMatrix[rowIndex];
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const tileDict = row[colIndex];
        if (!tileDict) {
          continue;
        }

        const worldX = colIndex * 64 * LEVEL_SCALE;
        const worldY = rowIndex * 64 * LEVEL_SCALE;
        if (tileDict.type === 'ground') {
          // Create ground tile sprite in platforms group (collision-enabled)
          if (!platformsGroup) {
            console.warn('[SceneFactory] No valid platforms group provided for ground tile creation');
            continue;
          }
          const sprite = platformsGroup.create(worldX, worldY, 'tiles', tileDict.tileKey);
          sprite.setOrigin(0, 0);
          if (sprite.body) {
            sprite.body.setImmovable(true);
            sprite.body.setAllowGravity(false);
          }
          
          // Apply centralized scaling
          sprite.setScale(LEVEL_SCALE, LEVEL_SCALE);
          
          groundPlatforms.push(sprite);
        } else if (tileDict.type === 'decorative') {
          // Create decorative tile sprite in decorative group (no collision)
          const targetGroup = decorativeGroup || platformsGroup; // Fallback to platformsGroup if no decorativeGroup
          if (!targetGroup) {
            console.warn('[SceneFactory] No valid group provided for decorative tile creation');
            continue;
          }
          const sprite = targetGroup.create(worldX, worldY, 'tiles', tileDict.tileKey);
          sprite.setOrigin(0, 0);
          if (sprite.body) {
            sprite.body.setAllowGravity(false);
            // Do not setImmovable or enable collision for decorative
          }
          
          // Apply centralized scaling
          sprite.setScale(LEVEL_SCALE, LEVEL_SCALE);
          
          decorativePlatforms.push(sprite);
        }
      }
    }

    return {
      groundPlatforms,
      decorativePlatforms
    };
  }

  // ========================================
  // Enemy Creation Methods
  // ========================================

  /**
   * Creates enemies from configuration array
   * @param {Object} config - Configuration object containing enemies array
   * @param {Array} config.enemies - Array of enemy configurations
   * @returns {Array} - Array of created enemy instances
   */
  createEnemiesFromConfig(config) {
    if (!config || !config.enemies || !Array.isArray(config.enemies)) {
      return []; // Graceful fallback
    }
    
    const enemies = [];
    
    config.enemies.forEach(enemyConfig => {
      if (enemyConfig.type === 'LoopHound') {
        // Validate required fields
        if (typeof enemyConfig.x !== 'number' || typeof enemyConfig.y !== 'number') {
          return; // Skip invalid config
        }
        
        // Create LoopHound with configurable parameters
        const enemy = new LoopHound(
          this.scene, 
          enemyConfig.x * LEVEL_SCALE, 
          enemyConfig.y * LEVEL_SCALE,
          enemyConfig.texture || 'enemies',
          enemyConfig.frame || 'barnacle_attack_rest'
        );
        
        // Configure patrol parameters if provided
        if (typeof enemyConfig.patrolDistance === 'number') {
          enemy.patrolDistance = enemyConfig.patrolDistance * LEVEL_SCALE;
          enemy.patrolEndX = enemyConfig.x * LEVEL_SCALE + enemyConfig.patrolDistance * LEVEL_SCALE;
        }
        
        if (typeof enemyConfig.direction === 'number') {
          enemy.direction = enemyConfig.direction;
        }
        
        if (typeof enemyConfig.speed === 'number') {
          enemy.speed = enemyConfig.speed * LEVEL_SCALE;
        }
        
        // CRITICAL: Add to group BEFORE configuration (§13)
        if (this.scene.enemies && this.scene.enemies.add) {
          this.scene.enemies.add(enemy);
        }
        
        // Configure physics AFTER adding to group (per invariant §13)
        if (typeof enemy.configurePhysicsAfterGroup === 'function') {
          enemy.configurePhysicsAfterGroup();
        }
        
        // Register with TimeManager for time reversal
        if (this.scene.timeManager && this.scene.timeManager.register) {
          this.scene.timeManager.register(enemy);
        }
        
        enemies.push(enemy);
      }
    });
    
    return enemies;
  }
} 