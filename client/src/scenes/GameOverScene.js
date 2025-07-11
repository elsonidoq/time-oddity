import BaseScene from './BaseScene.js';

export default class GameOverScene extends BaseScene {
  constructor() {
    super('GameOverScene');
    this.rKey = null;
    this.mKey = null;
    this.player = null;
  }

  init(data) {
    // Initialize game over scene
  }

  preload() {
    // Preload any game over assets if needed
  }

  create(data) {
    // Get reference to the player from GameScene
    const gameScene = this.scene && this.scene.get ? this.scene.get('GameScene') : null;
    if (gameScene && gameScene.player) {
      this.player = gameScene.player;
      this.disablePlayerInputs();
    }

    // Create a semi-transparent overlay container
    const overlay = this.add.container(0, 0);
    overlay.setDepth(1002);
    overlay.setVisible(true);
    
    // Add a background graphics
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRect(0, 0, 1280, 720);
    bg.setDepth(1002);
    overlay.add(bg);
    
    // Create game over title text
    const title = this.add.text(640, 360, 'Game Over', { 
      font: '48px Arial', 
      fill: '#ffffff' 
    });
    title.setOrigin(0.5);
    title.setDepth(1002);
    overlay.add(title);

    // Store overlay reference
    this.gameOverOverlay = overlay;
    this.gameOverActive = true;

    // Add keyboard input for restart (R key)
    if (this.input && this.input.keyboard) {
      this.rKey = this.input.keyboard.addKey('R');
      if (this.rKey && this.rKey.on) {
        this.rKey.on('down', () => {
          this.restartGame();
        });
      }
    }

    // Add keyboard input for menu (M key)
    if (this.input && this.input.keyboard) {
      this.mKey = this.input.keyboard.addKey('M');
      if (this.mKey && this.mKey.on) {
        this.mKey.on('down', () => {
          this.returnToMenu();
        });
      }
    }
  }

  /**
   * Disable player inputs except for time reversal
   */
  disablePlayerInputs() {
    if (!this.player || !this.player.inputManager) return;

    // Add a disabled flag to the input manager
    this.player.inputManager.inputsDisabled = true;
  }

  /**
   * Restore player inputs to their original state
   */
  restorePlayerInputs() {
    if (!this.player || !this.player.inputManager) return;

    // Remove the disabled flag
    this.player.inputManager.inputsDisabled = false;
  }

  update(time, delta) {
    // Update game over scene if needed
  }

  restartGame() {
    if (this.gameOverActive) {
      // Restore player inputs before restarting
      this.restorePlayerInputs();
      
      // Stop the GameOverScene overlay
      this.scene.stop('GameOverScene');
      
      // Restart the GameScene
      this.scene.restart('GameScene');
      
      // Clean up overlay and reset flag
      if (this.gameOverOverlay) {
        this.gameOverOverlay.destroy();
        this.gameOverOverlay = null;
      }
      this.gameOverActive = false;
    }
  }

  returnToMenu() {
    if (this.gameOverActive) {
      // Restore player inputs before going to menu
      this.restorePlayerInputs();
      
      // Stop both GameOverScene and GameScene
      this.scene.stop('GameOverScene');
      this.scene.stop('GameScene');
      
      // Start MenuScene
      this.scene.start('MenuScene');
      
      // Clean up overlay and reset flag
      if (this.gameOverOverlay) {
        this.gameOverOverlay.destroy();
        this.gameOverOverlay = null;
      }
      this.gameOverActive = false;
    }
  }

  /**
   * Handle dismissal during rewind
   * Called when rewinding past death to dismiss the GameOverScene
   */
  handleRewindDismissal() {
    if (this.gameOverActive) {
      // Restore player inputs
      this.restorePlayerInputs();
      // Stop the GameOverScene
      this.scene.stop('GameOverScene');
      // Clean up overlay
      if (this.gameOverOverlay) {
        if (typeof this.gameOverOverlay.destroy === 'function') {
          this.gameOverOverlay.destroy();
        }
        this.gameOverOverlay = null;
      }
      // Reset active flag
      this.gameOverActive = false;
    } else {
      // Even if not active, ensure overlay is cleaned up and input is restored
      this.restorePlayerInputs();
      if (this.gameOverOverlay) {
        if (typeof this.gameOverOverlay.destroy === 'function') {
          this.gameOverOverlay.destroy();
        }
        this.gameOverOverlay = null;
      }
    }
  }

  shutdown() {
    // Restore player inputs if scene is shut down
    this.restorePlayerInputs();
    
    // Clean up any resources
    if (this.rKey && this.rKey.off) {
      this.rKey.off('down');
    }
    
    if (this.mKey && this.mKey.off) {
      this.mKey.off('down');
    }

    // Clean up overlay
    if (this.gameOverOverlay) {
      this.gameOverOverlay.destroy();
      this.gameOverOverlay = null;
    }
  }
} 