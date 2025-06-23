import BaseScene from './BaseScene.js';
import Player from '../entities/Player.js';
import InputManager from '../systems/InputManager.js';
import CollisionManager from '../systems/CollisionManager.js';
import Coin from '../entities/Coin.js';
import TimeManager from '../systems/TimeManager.js';

export default class GameScene extends BaseScene {
  constructor() {
    super('GameScene');
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

    this.collisionManager = new CollisionManager(this);
    this.timeManager = new TimeManager(this);

    // Create a basic platform layout
    // Ground platform - using a looping tile
    if (this.platforms) {
      // The visual top of the ground should be at y=656 to be fully visible.
      const groundY = 656;
      for (let x = 0; x < this.sys.game.config.width; x += 64) {
          const groundTile = this.platforms.create(x, groundY, 'tiles', 'terrain_grass_horizontal_middle').setOrigin(0, 0);
          this.configurePlatform(groundTile, true); // `isFullBlock` = true
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

    // Create coins
    if (this.coins) {
        new Coin(this, 200, 450, 'tiles');
        new Coin(this, 1000, 500, 'tiles');
        new Coin(this, 640, 350, 'tiles');
    }

    // --- Player Integration ---
    // The ground platform's visual top is at y=656.
    const groundY = 656;
    
    // Create player at logical starting position (on ground platform)
    // A small offset upwards (e.g., 2 pixels) ensures a clean initial collision.
    this.player = new Player(this, 100, groundY - 2, 'characters', 'character_beige_idle');
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

    // Example: store references for cleanup
    this._menuButton = menuButton;

    // Register shutdown event
    this.registerShutdown();
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
    // Update game objects
    if (this.player) {
      this.player.update(time, delta);
    }
    if (this.timeManager) {
        this.timeManager.update(time, delta);
        // Toggle rewind based on input
        const isRewindActive = this.player.inputManager.isRewindPressed;
        if (isRewindActive !== this.timeManager.isRewinding) {
            this.timeManager.toggleRewind(isRewindActive);
        }
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