import BaseScene from './BaseScene.js';
import Player from '../entities/Player.js';
import InputManager from '../systems/InputManager.js';
import CollisionManager from '../systems/CollisionManager.js';
import Coin from '../entities/Coin.js';
import TimeManager from '../systems/TimeManager.js';
import { LoopHound } from '../entities/enemies/LoopHound.js';
import PlatformFactory from '../systems/PlatformFactory.js';

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
    }

    // Initialize physics groups with proper error handling
    if (this.physics && this.physics.add) {
      // Use a dynamic group for platforms to allow for custom hitbox sizes
      this.platforms = this.physics.add.group();
      this.players = this.physics.add.group();
      this.enemies = this.physics.add.group();
      this.coins = this.physics.add.group();
    }

    this.collisionManager = new CollisionManager(this, this._mockScene);
    this.timeManager = new TimeManager(this, this._mockScene);

    // Create PlatformFactory for platform creation
    this.platformFactory = new PlatformFactory(this);

    // Create a basic platform layout using Platform class instances
    if (this.platforms) {
      // The visual top of the ground should be at y=656 to be fully visible.
      const groundY = 656;
      
      // Create ground platforms using Platform class
      for (let x = 0; x < this.sys.game.config.width; x += 64) {
        const groundPlatform = this.platformFactory.createPlatform({
          x: x,
          y: groundY,
          frameKey: 'terrain_grass_horizontal_middle',
          isFullBlock: true,
          platformType: 'static'
        });
        
        // Add to physics group using the existing group structure
        if (this.platforms.add) {
          this.platforms.add(groundPlatform);
        } else if (this.platforms.create) {
          // Fallback for test environment that expects create method
          this.platforms.create(x, groundY, 'tiles', 'terrain_grass_horizontal_middle');
        }
        
        // Register with TimeManager
        if (this.timeManager) {
          this.timeManager.register(groundPlatform);
        }
      }

      // Create floating platforms using Platform class
      const floatingPlatformConfigs = [
        { x: 200, y: 500, isFullBlock: true },
        { x: 1000, y: 550, isFullBlock: true },
        { x: 640, y: 400, isFullBlock: true },
        { x: 350, y: 250, isFullBlock: false },
        { x: 800, y: 200, isFullBlock: true }
      ];

      floatingPlatformConfigs.forEach(config => {
        const platform = this.platformFactory.createPlatform({
          ...config,
          frameKey: 'terrain_grass_block_center',
          platformType: 'static'
        });
        
        // Add to physics group using the existing group structure
        if (this.platforms.add) {
          this.platforms.add(platform);
        } else if (this.platforms.create) {
          // Fallback for test environment that expects create method
          this.platforms.create(config.x, config.y, 'tiles', 'terrain_grass_block_center');
        }
        
        // Register with TimeManager
        if (this.timeManager) {
          this.timeManager.register(platform);
        }
      });
    }

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
    
    // Add basic content (e.g., a label)
    this.add.text(640, 100, 'Game Scene', { font: '32px Arial', fill: '#fff' }).setOrigin(0.5);

    // Add a navigation button to return to MenuScene
    const menuButton = this.add.text(640, 600, 'Back to Menu', { font: '24px Arial', fill: '#ff0', backgroundColor: '#222', padding: { x: 16, y: 8 } })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    menuButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // Add a debug button to test ChronoPulse
    const debugButton = this.add.text(640, 650, 'Debug: Test ChronoPulse', { font: '16px Arial', fill: '#0f0', backgroundColor: '#222', padding: { x: 8, y: 4 } })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    debugButton.on('pointerdown', () => {
      console.log('[Debug] Testing ChronoPulse manually');
      if (this.player && this.player.chronoPulse) {
        console.log('[Debug] Player position:', this.player.x, this.player.y);
        console.log('[Debug] LoopHound position:', this.loophound ? this.loophound.x + ', ' + this.loophound.y : 'Not found');
        console.log('[Debug] Enemies group:', this.enemies);
        console.log('[Debug] Enemies count:', this.enemies ? this.enemies.getChildren().length : 0);
        this.player.chronoPulse.activate();
      } else {
        console.log('[Debug] ChronoPulse not found on player');
      }
    });

    // Example: store references for cleanup
    this._menuButton = menuButton;
    this._debugButton = debugButton;

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
      }
    }

    // Update TimeManager
    if (this.timeManager) {
      this.timeManager.update(time, delta);
    }

    // Update enemies
    if (this.enemies) {
      this.enemies.getChildren().forEach(enemy => {
        if (enemy && typeof enemy.update === 'function') {
          enemy.update(time, delta);
        }
      });
    }

    // Update platforms (for moving platforms)
    if (this.platforms) {
      if (this.platforms.getChildren && typeof this.platforms.getChildren === 'function') {
        this.platforms.getChildren().forEach(platform => {
          if (platform && typeof platform.update === 'function') {
            platform.update(time, delta);
          }
        });
      }
    }
  }

  onShutdown() {
    // Clean up event listeners
    if (this._menuButton) {
      this._menuButton.off('pointerdown');
      this._menuButton = null;
    }
    if (this._debugButton) {
      this._debugButton.off('pointerdown');
      this._debugButton = null;
    }

    // Clean up other references
    this.player = null;
    this.loophound = null;
    this.platforms = null;
    this.players = null;
    this.enemies = null;
    this.coins = null;
    this.collisionManager = null;
    this.timeManager = null;
    this.platformFactory = null;
  }

  registerShutdown() {
    this.events.on('shutdown', this.onShutdown, this);
  }
} 