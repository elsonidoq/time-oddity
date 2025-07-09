import BaseScene from './BaseScene.js';
import Player from '../entities/Player.js';
import InputManager from '../systems/InputManager.js';
import CollisionManager from '../systems/CollisionManager.js';
import Coin from '../entities/Coin.js';
import TimeManager from '../systems/TimeManager.js';
import { LoopHound } from '../entities/enemies/LoopHound.js';
import { SceneFactory } from '../systems/SceneFactory.js';
import AudioManager from '../systems/AudioManager.js';
import testLevelConfig from '../config/test-cave.json';

export default class GameScene extends BaseScene {
  // Camera follow constants for easy tuning
  static CAMERA_LERP_X = 0.1;
  static CAMERA_LERP_Y = 0.1;
  static CAMERA_DEADZONE_X = 0.3;
  static CAMERA_DEADZONE_Y = 0.25;


  constructor(mockScene = null, levelConfig = null) {
    super('GameScene', mockScene);
    this._mockScene = mockScene;
    this._injectedLevelConfig = levelConfig;
  }

  init(data) {
    // Initialize scene-specific variables
  }

  preload() {
    // Preload assets for the game scene if needed
    // Task 06.01.2: Pre-load placeholder music for background audio
    this.load.audio('background', ['assets/audio/cancion.ogg']);
  }

  create(data) {
    // Use injected config if present, otherwise default
    const levelConfig = this._injectedLevelConfig || testLevelConfig;
    this.levelConfig = levelConfig;
    // Enable and configure Arcade Physics with proper error handling
    if (this.physics && this.physics.world) {
      this.physics.world.gravity.y = 980;
      this.physics.world.tileBias = 32; // Add tileBias to prevent tunneling
      this.physics.config.debug = this.sys.game.config.physics.arcade.debug;

      // Set world boundaries with proper error handling
      if (this.physics.world.bounds) {
        this.physics.world.bounds.setTo(0, 0, this.sys.game.config.width, this.sys.game.config.height);
      }
    }

    // Set camera bounds with proper error handling
    if (this.cameras && this.cameras.main) {
      this.cameras.main.setBounds(0, 0, this.sys.game.config.width, this.sys.game.config.height);
      // Zoom out to make scene 2 times bigger
      this.cameras.main.setZoom(1);
    }

    // Initialize physics groups with proper error handling
    if (this.physics && this.physics.add) {
      // Use a dynamic group for platforms to allow for custom hitbox sizes
      this.platforms = this.physics.add.group();
      this.players = this.physics.add.group();
      this.enemies = this.physics.add.group();
      this.coins = this.physics.add.group();
      this.goalTiles = this.physics.add.group();
    }

    // === Determine level dimensions from configuration (width/height) ===
    let configLevelWidth = this.sys.game.config.width;
    let configLevelHeight = this.sys.game.config.height;

    if (levelConfig && Array.isArray(levelConfig.platforms) && levelConfig.platforms.length > 0) {
      for (const p of levelConfig.platforms) {
        const tileWidth = 64;
        const tileHeight = 64;
        const platWidth = p.width ? p.width : tileWidth;
        const maxX = p.x + platWidth;
        if (maxX > configLevelWidth) configLevelWidth = maxX;
      }
      // FIX: Level height should be max of (platform.y + tileHeight)
      configLevelHeight = Math.max(...levelConfig.platforms.map(p => (p.y + 64)));
    }

    this.levelWidth = configLevelWidth;
    this.levelHeight = configLevelHeight;

    // Initialize SceneFactory before background creation
    this.sceneFactory = new SceneFactory(this);
    this.sceneFactory.loadConfiguration(levelConfig);

    // Create parallax background layers using SceneFactory
    this.createBackgroundsWithFactory();

    // Create decorative platforms (background tiles) after backgrounds but before regular platforms
    this.createDecorativePlatformsWithFactory();

    this.collisionManager = new CollisionManager(this, this._mockScene);
    this.timeManager = new TimeManager(this, this._mockScene);

    // Task 06.01.3: Initialize AudioManager and start background music
    this.audioManager = new AudioManager();
    this.audioManager.playMusic('background');

    // Task 04.01.3: Initialize coin registry counter
    if (this.registry && typeof this.registry.set === 'function') {
      this.registry.set('coinsCollected', 0);
      console.log('[GameScene] coinsCollected registry initialized to 0');
    }

    // Create platforms using SceneFactory
    this.createPlatformsWithFactory();

    // Create coins using SceneFactory
    this.createCoinsWithFactory();

    // Create goal tiles using SceneFactory
    this.createGoalsWithFactory();

    // === Camera world bounds based on level configuration ===
    if (this.cameras && this.cameras.main && typeof this.cameras.main.setBounds === 'function') {
      this.cameras.main.setBounds(0, 0, this.levelWidth, this.levelHeight);
    }

    // --- Player Integration ---
    let spawnX = 100;
    let spawnY = 400;
    if (levelConfig.playerSpawn && typeof levelConfig.playerSpawn.x === 'number' && typeof levelConfig.playerSpawn.y === 'number') {
      spawnX = levelConfig.playerSpawn.x;
      spawnY = levelConfig.playerSpawn.y;
    } else if (levelConfig.platforms && levelConfig.platforms.length > 0) {
      // Find lowest ground platform
      const groundPlatforms = levelConfig.platforms.filter(p => p.type === 'ground');
      if (groundPlatforms.length > 0) {
        const lowestGroundY = Math.min(...groundPlatforms.map(p => p.y));
        spawnY = lowestGroundY - 2; // Small offset above ground
      } else {
        // If no ground platforms, use the minimum y of any platform
        const minY = Math.min(...levelConfig.platforms.map(p => p.y));
        spawnY = minY - 2;
      }
    }
    this.player = new Player(this, spawnX, spawnY, 'characters', 'character_beige_idle', 100, this._mockScene);
    this.player.inputManager = new InputManager(this);
    
    // Add player to physics group
    if (this.players && this.players.add) {
      this.players.add(this.player);
    }

    // Register player with TimeManager
    if (this.timeManager && this.player) {
        this.timeManager.register(this.player);
    }

    /* =========================
       Camera – Task 03.01
       Set world bounds (already set earlier), then follow player with smooth lerp and dead-zone.
       Order: bounds → follow → deadzone to respect Phaser contract.
    ========================== */
    if (this.cameras && this.cameras.main && this.player) {
      // Ensure bounds have been set; reuse existing dimensions
      const worldWidth  = this.levelWidth;
      const worldHeight = this.levelHeight;
      if (typeof this.cameras.main.setBounds === 'function') {
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
      }

      // Enable smooth follow with small lerp values (0.1 by default)
      if (typeof this.cameras.main.startFollow === 'function') {
        this.cameras.main.startFollow(this.player, true, GameScene.CAMERA_LERP_X, GameScene.CAMERA_LERP_Y);
      }

      // Dead-zone keeps player roughly centred
      const viewW = this.sys.game.config.width;
      const viewH = this.sys.game.config.height;
      if (typeof this.cameras.main.setDeadzone === 'function') {
        this.cameras.main.setDeadzone(viewW * GameScene.CAMERA_DEADZONE_X, viewH * GameScene.CAMERA_DEADZONE_Y);
      }
    }

    // Set up collision detection
    if (this.collisionManager && this.platforms && this.player && this.coins) {
      this.collisionManager.addCollider(this.player, this.platforms);
      this.collisionManager.addOverlap(this.player, this.coins, this.handlePlayerCoinOverlap, null, this);
    }
    
    // Set up enemy-platform collision (CRITICAL: prevents enemies falling through floor)
    // This collider ensures enemies can stand on platforms and don't fall through the world
    if (this.collisionManager && this.platforms && this.enemies) {
      this.collisionManager.addCollider(this.enemies, this.platforms);
    }
    
    // --- Task 05.01.3: GoalTile overlap detection ---
    if (this.players && this.goalTiles && this.physics && this.physics.add) {
      // Only emit levelCompleted once per level
      this._levelCompletedEmitted = false;
      this.physics.add.overlap(
        this.players,
        this.goalTiles,
        () => {
          if (!this._levelCompletedEmitted) {
            this._levelCompletedEmitted = true;
            if (this.physics.world && typeof this.physics.world.pause === 'function') {
              this.physics.world.pause();
            }
            if (this.events && typeof this.events.emit === 'function') {
              this.events.emit('levelCompleted');
            }
          }
        },
        null,
        this
      );
    }

    // Add a navigation button to return to MenuScene (top right, smaller)
    const menuButton = this.add.text(1200, 50, 'Back to Menu', { font: '16px Arial', fill: '#ff0', backgroundColor: '#222', padding: { x: 8, y: 4 } })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    menuButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // Example: store references for cleanup
    this._menuButton = menuButton;

    // Register shutdown event
    this.registerShutdown();

    // Create enemies using SceneFactory from JSON configuration
    this.createEnemiesWithFactory();

    // Launch UIScene overlay for HUD elements
    if (this.scene && typeof this.scene.launch === 'function') {
      this.scene.launch('UIScene');
    }

    // Task 06.03.4: Listen for toggleMuteRequest events from UIScene
    this.events.on('toggleMuteRequest', () => {
      if (this.audioManager) {
        this.audioManager.toggleMute();
      }
    });
  }

  /**
   * Creates platforms using SceneFactory instead of hardcoded creation
   */
  createPlatformsWithFactory() {
    if (!this.platforms || !this.sceneFactory) return;

    // Create all platforms from configuration
    const createdPlatforms = this.sceneFactory.createPlatformsFromConfig(this.platforms);
    
    if (createdPlatforms.length === 0) {
      console.warn('[GameScene] No platforms were created by SceneFactory - level configuration may be missing or invalid');
    } else {
      // Register MovingPlatform instances with TimeManager for time reversal
      this.registerMovingPlatformsWithTimeManager(createdPlatforms);
      console.log(`[GameScene] Created ${createdPlatforms.length} platforms using SceneFactory`);
    }
  }

  /**
   * Creates coins using SceneFactory instead of hardcoded creation
   */
  createCoinsWithFactory() {
    if (!this.coins || !this.sceneFactory) return;

    if (this.levelConfig.coins && Array.isArray(this.levelConfig.coins)) {
      // Create all coins from configuration
      const createdCoins = this.sceneFactory.createCoinsFromConfig(this.levelConfig.coins, this.coins);
      
      if (createdCoins.length === 0) {
        console.warn('[GameScene] No coins were created by SceneFactory - coin configuration may be invalid');
      } else {
        // Register coins with TimeManager for time reversal support
        this.registerCoinsWithTimeManager(createdCoins);
        
        // Store references for cleanup and future use
        this.gameCoins = createdCoins.map(c => c.parentCoin || c);
        
        console.log(`[GameScene] Created ${createdCoins.length} coins using SceneFactory`);
      }
    } else {
      console.log('[GameScene] No coin configuration found - skipping coin creation');
    }
  }

  /**
   * Registers coin sprites with TimeManager for time reversal support
   * @param {Array} coins - Array of coin sprites
   */
  registerCoinsWithTimeManager(coins) {
    if (!this.timeManager || !coins) return;

    // Register each coin with TimeManager
    for (const coinSprite of coins) {
      if (coinSprite && coinSprite.parentCoin) {
        this.timeManager.register(coinSprite.parentCoin);
      }
    }
  }

  /**
   * Creates decorative platforms (background tiles) using SceneFactory
   * These are visual-only elements that don't interfere with gameplay
   */
  createDecorativePlatformsWithFactory() {
    if (!this.sceneFactory) {
      console.warn('[GameScene] SceneFactory not available, skipping decorative platform creation');
      return;
    }

    // Get decorative platforms configuration from SceneFactory
    const decorativeConfig = this.sceneFactory.config ? this.sceneFactory.config.decorativePlatforms : undefined;

    // Create decorative platforms from configuration
    const createdDecoratives = this.sceneFactory.createDecorativePlatformsFromConfig(decorativeConfig);
    
    if (createdDecoratives && createdDecoratives.length > 0) {
      console.log(`[GameScene] Created ${createdDecoratives.length} decorative platform tiles`);
      
      // Store references for cleanup (optional)
      this.decorativePlatforms = createdDecoratives;
    } else {
      console.log('[GameScene] No decorative platforms configured for this level');
    }
  }

  /**
   * Creates goal tiles using SceneFactory from level configuration
   */
  createGoalsWithFactory() {
    if (!this.goalTiles || !this.sceneFactory) return;

    // Create goal tile from configuration if it exists, passing physics group
    const createdGoalTile = this.sceneFactory.createGoalFromConfig(this.goalTiles);
    
    if (createdGoalTile) {        
      // Register with TimeManager for time reversal support
      if (this.timeManager) {
        this.timeManager.register(createdGoalTile);
      }
      
      console.log(`[GameScene] Created goal tile at (${createdGoalTile.x}, ${createdGoalTile.y})`);
    } else {
      console.warn('[GameScene] No goal tile configuration found - level may not have an exit');
    }
  }

  /**
   * Creates enemies using SceneFactory from level configuration
   */
  createEnemiesWithFactory() {
    if (!this.enemies || !this.sceneFactory) return;

    // Use injected levelConfig if present, otherwise fallback
    const levelConfig = this._injectedLevelConfig || testLevelConfig;

    let createdEnemies = [];
    // Always call createEnemiesFromConfig(levelConfig)
    createdEnemies = this.sceneFactory.createEnemiesFromConfig(levelConfig) || [];
    // Register and add each enemy
    createdEnemies.forEach(enemy => {
      if (this.timeManager && typeof this.timeManager.register === 'function') {
        this.timeManager.register(enemy);
      }
      if (this.enemies && typeof this.enemies.add === 'function') {
        this.enemies.add(enemy);
      }
      if (typeof enemy.activate === 'function') {
        enemy.activate();
      }
    });

    // Set up player-enemy collision detection
    if (this.collisionManager && this.player && this.enemies && typeof this.collisionManager.setupPlayerEnemyCollision === 'function') {
      this.collisionManager.setupPlayerEnemyCollision(
        this.player,
        this.enemies,
        (player, enemy) => {
          if (!enemy.isFrozen) {
            if (typeof player.takeDamage === 'function') {
              player.takeDamage(enemy.damage || 20);
            }
            if (this.events && typeof this.events.emit === 'function') {
              this.events.emit('playerEnemyCollision', { player, enemy });
            }
          } else {
            if (typeof enemy.takeDamage === 'function') {
              enemy.takeDamage(player.attackPower || 20);
            }
          }
        }
      );
    }

    // Patch freeze/unfreeze event emission for test mocks
    createdEnemies.forEach(enemy => {
      if (enemy && typeof enemy.freeze === 'function') {
        const originalFreeze = enemy.freeze;
        enemy.freeze = (...args) => {
          if (this.events && typeof this.events.emit === 'function') {
            this.events.emit('enemyFrozen', enemy);
          }
          return originalFreeze.apply(enemy, args);
        };
      }
      if (enemy && typeof enemy.unfreeze === 'function') {
        const originalUnfreeze = enemy.unfreeze;
        enemy.unfreeze = (...args) => {
          if (this.events && typeof this.events.emit === 'function') {
            this.events.emit('enemyUnfrozen', enemy);
          }
          return originalUnfreeze.apply(enemy, args);
        };
      }
    });
  }

  /**
   * Creates backgrounds using SceneFactory with graceful error handling
   */
  createBackgroundsWithFactory() {
    // Check if SceneFactory is available
    if (!this.sceneFactory) {
      console.warn('[GameScene] SceneFactory not available, skipping background creation');
      return;
    }

    // Ensure SceneFactory has loaded configuration
    if (!this.sceneFactory.config || !this.sceneFactory.config.backgrounds) {
      console.warn('[GameScene] SceneFactory configuration invalid or missing backgrounds - skipping background creation');
      return;
    }

    // Create backgrounds from configuration (synchronous)
    const backgrounds = this.sceneFactory.createBackgroundsFromConfig(this.sceneFactory.config.backgrounds);
    if (!backgrounds || backgrounds.length === 0) {
      console.warn('[GameScene] No backgrounds created from factory - background configuration may be invalid');
      return;
    }

    // Store all background layers for multi-parallax support
    this.backgroundLayers = backgrounds;

    // Assign background references for parallax calculation based on scrollSpeed
    // Maintain backward compatibility with existing skyBackground and hillsBackground references
    this.skyBackground = null;
    this.hillsBackground = null;

    for (const background of backgrounds) {
      const scrollSpeed = background.getData ? background.getData('scrollSpeed') : 0.0;
      // Ensure tilePositionX and tilePositionY properties exist for parallax calculation
      if (background.tilePositionX === undefined) {
        background.tilePositionX = 0;
      }
      if (background.tilePositionY === undefined) {
        background.tilePositionY = 0;
      }
      if (scrollSpeed === 0.0 && !this.skyBackground) {
        // This is the static sky background
        this.skyBackground = background;
      } else if (scrollSpeed > 0.0 && !this.hillsBackground) {
        // This is the parallax hills background
        this.hillsBackground = background;
        // Store initial position for parallax calculation
        this.hillsBackground.setData('initialX', this.hillsBackground.x);
      }
    }
    console.log('[GameScene] Backgrounds created successfully via SceneFactory');
  }

  /**
   * Registers MovingPlatform instances with TimeManager for time reversal support
   * @param {Array} platforms - Array of all created platforms
   */
  registerMovingPlatformsWithTimeManager(platforms) {
    if (!this.timeManager || !platforms) return;

    // Filter for MovingPlatform instances and register them with TimeManager
    const movingPlatforms = platforms.filter(platform => 
      platform && 
      typeof platform.getStateForRecording === 'function' && 
      typeof platform.setStateFromRecording === 'function'
    );

    // Debug logs removed for production cleanliness

    for (const movingPlatform of movingPlatforms) {
      this.timeManager.register(movingPlatform);
    }
  }

  handlePlayerCoinOverlap(player, coinSprite) {
    if (coinSprite.parentCoin) {
        console.log('[Coin Overlap] Player overlapped with coin, triggering collection');
        coinSprite.parentCoin.collect();
    }
  }

  /**
   * Configures a platform tile with a custom hitbox.
   * @param {Phaser.Physics.Arcade.Sprite} platform The platform sprite to configure.
   * @param {boolean} isFullBlock If true, the hitbox will cover the entire sprite frame.
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

  update(time, delta) {
    // Handle pause input
    if (this.player && this.player.inputManager && this.player.inputManager.isPauseJustPressed) {
      // Pause the game scene
      this.scene.pause('GameScene');
      
      // Launch UIScene with pause menu
      this.scene.launch('UIScene', { showPause: true });
      
      // Pause TimeManager recording if it exists
      if (this.timeManager && typeof this.timeManager.pauseRecording === 'function') {
        this.timeManager.pauseRecording();
      }
      
      // Emit pause event
      this.events.emit('gamePaused');
      
      return; // Don't continue with normal update logic when pausing
    }

    // Task 06.03.4: Handle mute key input
    if (this.player && this.player.inputManager && this.player.inputManager.isMutePressed) {
      if (this.audioManager) {
        this.audioManager.toggleMute();
      }
    }

    // Update game objects
    if (this.player) {
      this.player.update(time, delta);
      
      // Update registry with current player health for UI
      if (this.registry && this.player) {
        this.registry.set('playerHealth', this.player.health);
        this.registry.set('dashTimer', this.player.dashTimer);
      }
    }
    
    // Update parallax background movement for all layers
    if (this.player && this.backgroundLayers && this.backgroundLayers.length > 0) {
      const playerVelocityX = this.player.body ? this.player.body.velocity.x : 0;
      
      // Calculate parallax for each background layer based on its scroll speed
      this.backgroundLayers.forEach(background => {
        const scrollSpeed = background.getData ? background.getData('scrollSpeed') : 0.0;
        if (scrollSpeed > 0.0) {
          background.tilePositionX -= playerVelocityX * scrollSpeed * (delta / 1000);
        }
      });
    }
    
    // Update all platforms (including moving platforms)
    if (this.platforms && this.platforms.getChildren) {
      this.platforms.getChildren().forEach((platform, index) => {
        if (platform && typeof platform.update === 'function') {
          platform.update(time, delta);
        }
      });
    }
    
    // Handle player carrying by moving platforms
    if (this.player && this.player.body && this.platforms && this.platforms.getChildren) {
      this.platforms.getChildren().forEach((platform, index) => {
        // Check if this is a MovingPlatform that can carry players
        if (platform && typeof platform.carryPlayerIfStanding === 'function') {
          platform.carryPlayerIfStanding(this.player.body);
        }
      });
    } else {
      // Skip carrying if requirements missing
    }
    
    // Update all enemies
    if (this.enemies && this.enemies.getChildren) {
      this.enemies.getChildren().forEach(enemy => {
        if (enemy && typeof enemy.update === 'function') {
          enemy.update(time, delta);
        }
      });
    }
    if (this.timeManager) {
        this.timeManager.update(time, delta);
        // Toggle rewind based on input
        const isRewindActive = this.player.inputManager.isRewindPressed;
        if (isRewindActive !== this.timeManager.isRewinding) {
            this.timeManager.toggleRewind(isRewindActive);
        }
    }
    
    // Update registry with chrono pulse cooldown data
    if (this.registry && this.player && this.player.chronoPulse) {
      this.registry.set('chronoPulseLastActivation', this.player.chronoPulse.lastActivationTime);
    }
  }

  // Cleanup resources on shutdown
  onShutdown() {
    if (this._menuButton) {
      this._menuButton.off('pointerdown');
      this._menuButton.destroy();
      this._menuButton = null;
    }
  }

  // Register shutdown event
  // (Phaser will call this when the scene is stopped)
  registerShutdown() {
    this.events.on('shutdown', this.onShutdown, this);
  }
} 