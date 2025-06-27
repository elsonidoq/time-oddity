import BaseScene from './BaseScene.js';
import Player from '../entities/Player.js';
import InputManager from '../systems/InputManager.js';
import CollisionManager from '../systems/CollisionManager.js';
import Coin from '../entities/Coin.js';
import TimeManager from '../systems/TimeManager.js';
import { LoopHound } from '../entities/enemies/LoopHound.js';
import { SceneFactory } from '../systems/SceneFactory.js';
import testLevelConfig from '../config/test-level.json';

export default class GameScene extends BaseScene {
  constructor(mockScene = null) {
    super('GameScene', mockScene);
    this._mockScene = mockScene;
  }

  init(data) {
    // Initialize scene-specific variables
  }

  preload() {
    // Preload assets for the game scene if needed
  }

  create(data) {
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
      this.cameras.main.setZoom(0.5);
    }

    // Initialize physics groups with proper error handling
    if (this.physics && this.physics.add) {
      // Use a dynamic group for platforms to allow for custom hitbox sizes
      this.platforms = this.physics.add.group();
      this.players = this.physics.add.group();
      this.enemies = this.physics.add.group();
      this.coins = this.physics.add.group();
    }

    // Create parallax background layers
    this.createParallaxBackground();

    this.collisionManager = new CollisionManager(this, this._mockScene);
    this.timeManager = new TimeManager(this, this._mockScene);

    // Create platforms using SceneFactory
    this.createPlatformsWithFactory();

    // Create coins
    if (this.coins) {
        new Coin(this, 200, 450, 'tiles', this._mockScene);
        new Coin(this, 1000, 500, 'tiles', this._mockScene);
        new Coin(this, 640, 350, 'tiles', this._mockScene);
    }

    // --- Player Integration ---
    // The ground platform's visual top is at y=656.
    const groundY = 656;
    
    // Create player at logical starting position (on ground platform)
    // A small offset upwards (e.g., 2 pixels) ensures a clean initial collision.
    this.player = new Player(this, 100, groundY - 2, 'characters', 'character_beige_idle', 100, this._mockScene);
    this.player.inputManager = new InputManager(this);
    
    // Add player to physics group
    if (this.players && this.players.add) {
      this.players.add(this.player);
    }

    // Register player with TimeManager
    if (this.timeManager && this.player) {
        this.timeManager.register(this.player);
    }

    // Set up collision detection
    if (this.collisionManager && this.platforms && this.player && this.coins) {
      this.collisionManager.addCollider(this.player, this.platforms);
      this.collisionManager.addOverlap(this.player, this.coins, this.handlePlayerCoinOverlap, null, this);
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

    // Add LoopHound enemy for testing (only in non-test environment)
    if (!this._mockScene) {
      this.loophound = new LoopHound(this, 250, groundY, 'enemies', 'slime_normal_rest');
      
      // Register LoopHound with TimeManager for rewind
      if (this.timeManager && this.loophound) {
        this.timeManager.register(this.loophound);
      }
      
      // Activate the LoopHound to start its movement behavior
      this.loophound.activate();
      
      // Add collision detection for LoopHound with platforms
      if (this.collisionManager && this.platforms && this.loophound) {
        this.collisionManager.addCollider(this.loophound, this.platforms);
      }

      
      // Add LoopHound to enemies physics group
      if (this.enemies && this.enemies.add) {
        this.enemies.add(this.loophound);
      }

      // Set up player-enemy collision detection
      if (this.collisionManager && this.player && this.enemies) {
        this.collisionManager.setupPlayerEnemyCollision(
          this.player,
          this.enemies,
          (player, enemy) => {
            // Apply damage to enemy on collision
            const attackPower = player.attackPower || 20;
            if (enemy && typeof enemy.takeDamage === 'function' && !enemy.isDead()) {
              enemy.takeDamage(attackPower);
              console.log(`[Combat] Player dealt ${attackPower} damage to enemy. Enemy health: ${enemy.health}`);
              if (enemy.isDead()) {
                console.log('[Combat] Enemy defeated!');
              }
            }
          }
        );
      }
    }

    // Launch UIScene overlay for HUD elements
    if (this.scene && typeof this.scene.launch === 'function') {
      this.scene.launch('UIScene');
    }
  }

  /**
   * Creates platforms using SceneFactory instead of hardcoded creation
   */
  createPlatformsWithFactory() {
    if (!this.platforms) return;

    // Create SceneFactory instance
    const sceneFactory = new SceneFactory(this);
    
    // Load the test level configuration
    const configLoaded = sceneFactory.loadConfiguration(testLevelConfig);
    
    if (configLoaded) {
      // Create all platforms from configuration
      const createdPlatforms = sceneFactory.createPlatformsFromConfig(this.platforms);
      
      if (createdPlatforms.length === 0) {
        console.warn('[GameScene] No platforms were created by SceneFactory, falling back to hardcoded creation');
        this.createPlatformsHardcoded();
      } else {
        // Register MovingPlatform instances with TimeManager for time reversal
        this.registerMovingPlatformsWithTimeManager(createdPlatforms);
      }
    } else {
      console.warn('[GameScene] Failed to load level configuration, falling back to hardcoded creation');
      this.createPlatformsHardcoded();
    }
  }

  /**
   * Creates a simple 2-layer parallax background
   */
  createParallaxBackground() {
    // Calculate the new visible area based on camera zoom (0.5)
    const zoom = 0.5;
    const bgWidth = 1280 / zoom; // 2560
    const bgHeight = 720 / zoom; // 1440
    const centerX = bgWidth / 2;
    const centerY = bgHeight / 2;

    // Layer 1: Sky background (far background, no parallax)
    this.skyBackground = this.add.tileSprite(centerX, centerY, bgWidth, bgHeight, 'backgrounds', 'background_solid_sky');
    this.skyBackground.setDepth(-2); // Behind everything (negative depth)
    
    // Layer 2: Hills background (mid background, slow parallax)
    this.hillsBackground = this.add.tileSprite(centerX, centerY, bgWidth, bgHeight, 'backgrounds', 'background_color_hills');
    this.hillsBackground.setDepth(-1); // Behind platforms but in front of sky
    
    // Store initial positions for parallax calculation
    this.hillsBackground.setData('initialX', this.hillsBackground.x);
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

    console.log(`[GameScene] Found ${movingPlatforms.length} moving platforms to register`);
    console.log('[GameScene] All platforms:', platforms.map(p => ({ type: p.constructor.name, x: p.x, y: p.y, isMoving: p.isMoving })));

    for (const movingPlatform of movingPlatforms) {
      this.timeManager.register(movingPlatform);
      console.log(`[GameScene] Registered MovingPlatform at (${movingPlatform.x}, ${movingPlatform.y}) with TimeManager - isMoving: ${movingPlatform.isMoving}`);
    }
  }

  /**
   * Fallback method for hardcoded platform creation (maintains backward compatibility)
   */
  createPlatformsHardcoded() {
    if (!this.platforms) return;

    // The visual top of the ground should be at y=656 to be fully visible.
    const groundY = 656;
    for (let x = 0; x < this.sys.game.config.width; x += 64) {
        const groundTile = this.platforms.create(x, groundY, 'tiles', 'terrain_grass_horizontal_middle').setOrigin(0, 0);
        this.configurePlatform(groundTile, true); // Use full block for ground
    }

    // Floating platforms
    const platform1 = this.platforms.create(200, 500, 'tiles', 'terrain_grass_block_center');
    const platform2 = this.platforms.create(1000, 550, 'tiles', 'terrain_grass_block_center');
    const platform3 = this.platforms.create(640, 400, 'tiles', 'terrain_grass_block_center');
    const platform4 = this.platforms.create(350, 250, 'tiles', 'terrain_grass_block_center');
    const platform5 = this.platforms.create(800, 200, 'tiles', 'terrain_grass_block_center');
    this.configurePlatform(platform1, true); // `isFullBlock` = true
    this.configurePlatform(platform2, true); // `isFullBlock` = true
    this.configurePlatform(platform3, true); // `isFullBlock` = true
    this.configurePlatform(platform4, true);
    this.configurePlatform(platform5, true);
  }

  handlePlayerCoinOverlap(player, coinSprite) {
    if (coinSprite.parentCoin) {
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

    // Update game objects
    if (this.player) {
      this.player.update(time, delta);
      
      // Update registry with current player health for UI
      if (this.registry && this.player) {
        this.registry.set('playerHealth', this.player.health);
        this.registry.set('dashTimer', this.player.dashTimer);
      }
    }
    
    // Update parallax background movement
    if (this.player && this.hillsBackground) {
      // Simple parallax: hills move at 0.5x player speed
      const parallaxSpeed = 0.5;
      const playerVelocityX = this.player.body ? this.player.body.velocity.x : 0;
      this.hillsBackground.tilePositionX -= playerVelocityX * parallaxSpeed * (delta / 1000);
    }
    
    // Update all platforms (including moving platforms)
    if (this.platforms && this.platforms.getChildren) {
      console.log(`[GameScene] Updating ${this.platforms.getChildren().length} platforms`);
      
      this.platforms.getChildren().forEach((platform, index) => {
        console.log(`[GameScene] Platform ${index}: type=${platform?.constructor?.name}, hasUpdate=${typeof platform.update === 'function'}, isMoving=${platform?.isMoving}`);
        
        if (platform && typeof platform.update === 'function') {
          platform.update(time, delta);
        }
      });
    }
    
    // Handle player carrying by moving platforms
    if (this.player && this.player.body && this.platforms && this.platforms.getChildren) {
      console.log(`[GameScene] Checking ${this.platforms.getChildren().length} platforms for player carrying`);
      
      this.platforms.getChildren().forEach((platform, index) => {
        // Check if this is a MovingPlatform that can carry players
        if (platform && typeof platform.carryPlayerIfStanding === 'function') {
          console.log(`[GameScene] Platform ${index} is a MovingPlatform, calling carryPlayerIfStanding`);
          platform.carryPlayerIfStanding(this.player.body);
        } else {
          console.log(`[GameScene] Platform ${index} is not a MovingPlatform (type: ${platform?.constructor?.name})`);
        }
      });
    } else {
      console.log('[GameScene] Player carrying check skipped - missing player, player.body, platforms, or platforms.getChildren');
    }
    
    if (this.loophound) {
      this.loophound.update(time, delta);
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