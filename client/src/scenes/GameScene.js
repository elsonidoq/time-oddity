import BaseScene from './BaseScene.js';

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
    // Enable and configure Arcade Physics
    this.physics.world.gravity.y = 980;
    this.physics.config.debug = this.sys.game.config.physics.arcade.debug;

    // Set world boundaries
    this.physics.world.bounds.setTo(0, 0, this.sys.game.config.width, this.sys.game.config.height);
    this.cameras.main.setBounds(0, 0, this.sys.game.config.width, this.sys.game.config.height);

    // Initialize physics groups
    this.platforms = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });
    this.players = this.physics.add.group();
    this.enemies = this.physics.add.group();

    // Create a basic platform layout
    // Ground platform - using a looping tile
    for (let x = 0; x < this.sys.game.config.width; x += 64) {
        this.platforms.create(x, 700, 'tiles', 'terrain_grass_horizontal_middle').setOrigin(0, 0).refreshBody();
    }

    // Floating platforms
    this.platforms.create(200, 550, 'tiles', 'terrain_grass_block_center').refreshBody();
    this.platforms.create(1000, 550, 'tiles', 'terrain_grass_block_center').refreshBody();
    this.platforms.create(640, 400, 'tiles', 'terrain_grass_block_center').refreshBody();

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

  update(time, delta) {
    // Main game loop logic
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