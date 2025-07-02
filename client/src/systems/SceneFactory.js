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
      const x = groundConfig.x + (i * tileWidth);
      const tileKey = TileSelector.getTileKey(groundConfig.tilePrefix, x, tileCount, i);
      const platform = platformsGroup.create(x, groundConfig.y, 'tiles', tileKey);
      
      platform.setOrigin(0, 0);
      this.configurePlatform(platform, groundConfig.isFullBlock);
      
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
        const x = platformConfig.x + (i * tileWidth);
        const tileKey = TileSelector.getTileKey(platformConfig.tilePrefix, x, tileCount, i);
        const platform = platformsGroup.create(x, platformConfig.y, 'tiles', tileKey);
        
        platform.setOrigin(0, 0);
        this.configurePlatform(platform, platformConfig.isFullBlock);
        
        platforms.push(platform);
      }

      return platforms;
    }

    // Default behavior: create single tile
    const tileKey = TileSelector.getTileKey(platformConfig.tilePrefix, platformConfig.x, 1, 0);
    const platform = platformsGroup.create(
      platformConfig.x,
      platformConfig.y,
      'tiles',
      tileKey
    );

    this.configurePlatform(platform, platformConfig.isFullBlock);
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
      movingConfig.x,
      movingConfig.y,
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
      coinConfig.x,
      coinConfig.y,
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

    return this.createGoalTile(goalConfig.x, goalConfig.y, tileKey, goalTilesGroup, isFullBlock);
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
   * @returns {Array} - Array of created decorative platform sprites
   */
  createDecorativePlatformsFromConfig(decorativeConfigs) {
    if (!decorativeConfigs || !Array.isArray(decorativeConfigs)) {
      return [];
    }

    if (decorativeConfigs.length === 0) {
      return [];
    }

    if (!this.scene || !this.scene.add || !this.scene.add.image) {
      return [];
    }

    const createdDecoratives = [];

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
        const x = decorativeConfig.x + (i * tileWidth);
        const tileKey = TileSelector.getTileKey(decorativeConfig.tilePrefix, x, tileCount, i);
        const decorative = this.scene.add.image(x, decorativeConfig.y, 'tiles', tileKey);
        
        decorative.setOrigin(0, 0);
        decorative.setDepth(decorativeConfig.depth);
        
        decoratives.push(decorative);
      }

      return decoratives;
    }

    // Default behavior: create single tile
    const tileKey = TileSelector.getTileKey(decorativeConfig.tilePrefix, decorativeConfig.x, 1, 0);
    const decorative = this.scene.add.image(
      decorativeConfig.x,
      decorativeConfig.y,
      'tiles',
      tileKey
    );

    decorative.setOrigin(0, 0);
    decorative.setDepth(decorativeConfig.depth);

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
          enemyConfig.x, 
          enemyConfig.y,
          enemyConfig.texture || 'enemies',
          enemyConfig.frame || 'barnacle_attack_rest'
        );
        
        // Configure patrol parameters if provided
        if (typeof enemyConfig.patrolDistance === 'number') {
          enemy.patrolDistance = enemyConfig.patrolDistance;
          enemy.patrolEndX = enemyConfig.x + enemyConfig.patrolDistance;
        }
        
        if (typeof enemyConfig.direction === 'number') {
          enemy.direction = enemyConfig.direction;
        }
        
        if (typeof enemyConfig.speed === 'number') {
          enemy.speed = enemyConfig.speed;
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