import BaseScene from './BaseScene.js';
import InputManager from '../systems/InputManager.js';
import MapOverlay from '../ui/MapOverlay.js';

export default class UIScene extends BaseScene {
  constructor(mockScene = null) {
    super('UIScene', mockScene);
    this._mockScene = mockScene;
    this.isPaused = false;
  }

  init(data) {
    // Initialize UI scene with any passed data
    this.isPaused = data && data.showPause;
  }

  preload() {
    // Load UI-specific assets if needed
  }

  create(data) {
    // Store pause state
    this.isPaused = data && data.showPause;
    
    // Create UI elements
    // Draw health bar background (red)
    const barWidth = 200;
    const barHeight = 20;
    const x = 20;
    const y = 20;

    this.healthBarBackground = this.add.graphics();
    this.healthBarBackground.fillStyle(0xff0000, 1);
    this.healthBarBackground.fillRect(x, y, barWidth, barHeight);

    // Draw health bar foreground (green) - will be updated in update()
    this.healthBarForeground = this.add.graphics();
    this.healthBarForeground.fillStyle(0x00ff00, 1);
    this.healthBarForeground.fillRect(x, y, barWidth, barHeight);

    // ------------------------------------------------------------------
    // Subscribe to Player damage events from GameScene to update HUD ASAP
    // ------------------------------------------------------------------
    const gameScene = this.scene && this.scene.get ? this.scene.get('GameScene') : null;
    if (gameScene && gameScene.events && typeof gameScene.events.on === 'function') {
      gameScene.events.on('playerDamaged', (payload) => {
        const newHealth = payload && payload.health !== undefined ? payload.health : null;
        if (newHealth !== null) {
          if (this.registry && typeof this.registry.set === 'function') {
            this.registry.set('playerHealth', newHealth);
          }
          // Immediately refresh HUD rather than waiting for next update tick
          this.updateHealthDisplay(newHealth);
        }
      });
    }

    // Helper to draw health bar based on value 0-100
    this.updateHealthDisplay = (currentHealth) => {
      const clampedHealth = Math.max(0, Math.min(100, currentHealth));
      const currentWidth = Math.floor((clampedHealth / 100) * barWidth);
      this.healthBarForeground.clear();
      this.healthBarForeground.fillStyle(0x00ff00, 1);
      this.healthBarForeground.fillRect(x, y, currentWidth, barHeight);
    };

    // Ability cooldown placeholders
    const dashText = this.add.text(20, 50, 'Dash', { font: '16px Arial', fill: '#333333' });
    dashText.setOrigin(0, 0);
    const pulseText = this.add.text(100, 50, 'Pulse', { font: '16px Arial', fill: '#333333' });
    pulseText.setOrigin(0, 0);

    this.cooldownIcons = { dashText, pulseText };

    // Task 04.03: Coin counter display
    const coinCounter = this.add.text(180, 50, 'Coins: 0', { font: '16px Arial', fill: '#333333' });
    if (coinCounter && typeof coinCounter.setOrigin === 'function') {
      coinCounter.setOrigin(0, 0);
    }
    this.coinCounter = coinCounter;

    // Task 06.03.3: Create mute button
    if (this.add && this.add.image) {
      this.muteButton = this.add.image(1200, 50, 'mute_unmuted');
      this.muteButton.setInteractive({ useHandCursor: true });
      this.muteButton.setScale(0.5);
      this.muteButton.setDepth(10);
      this.muteButton.on('pointerdown', () => {
        this.events.emit('toggleMuteRequest');
      });
    }

    // Create pause menu if needed
    if (this.isPaused) {
      this.createPauseMenu();
    }

    // Initialize input manager for pause handling
    this.inputManager = new InputManager(this);

    // Task 04.06: Create and initialize MapOverlay
    this.mapOverlay = new MapOverlay(this);
    this.mapOverlay.create();
    this.mapVisible = false; // Start with map hidden
    
    // Initialize map with level data from GameScene
    const gameSceneForMap = this.scene && this.scene.get ? this.scene.get('GameScene') : null;
    if (gameSceneForMap) {
      // Calculate map scale first
      if (gameSceneForMap.levelWidth && gameSceneForMap.levelHeight) {
        this.mapOverlay.calculateMapScale(gameSceneForMap.levelWidth, gameSceneForMap.levelHeight);
      }
      
      // Render static level elements
      if (gameSceneForMap.platforms && gameSceneForMap.platforms.children) {
        this.mapOverlay.renderPlatforms(gameSceneForMap.platforms.children.entries);
      }
      if (gameSceneForMap.coins && gameSceneForMap.coins.children) {
        this.mapOverlay.renderCoins(gameSceneForMap.coins.children.entries);
      }
      if (gameSceneForMap.goalTiles && gameSceneForMap.goalTiles.children) {
        // Get the first active goal tile for rendering
        const activeGoalTile = gameSceneForMap.goalTiles.children.entries.find(goal => goal.active && goal.visible);
        if (activeGoalTile) {
          this.mapOverlay.renderGoal({ x: activeGoalTile.x, y: activeGoalTile.y });
        }
      }
    }

    // Listen for levelCompleted event from GameScene
    const gameSceneForLevelComplete = this.scene && this.scene.get ? this.scene.get('GameScene') : null;
    if (gameSceneForLevelComplete && gameSceneForLevelComplete.events && typeof gameSceneForLevelComplete.events.on === 'function') {
      gameSceneForLevelComplete.events.on('levelCompleted', this.onLevelCompleted, this);
    }
  }

  createPauseMenu() {
    // Create semi-transparent overlay
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x000000, 0.5);
    this.pauseOverlay.fillRect(0, 0, 1280, 720);

    // Create resume button
    this.resumeButton = this.add.text(640, 360, 'Resume', { 
      font: '32px Arial', 
      fill: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    });
    this.resumeButton.setOrigin(0.5);
    this.resumeButton.setInteractive({ useHandCursor: true });
    this.resumeButton.on('pointerdown', () => {
      this.resumeGame();
    });
  }

  resumeGame() {
    // Resume the game scene
    this.scene.resume('GameScene');
    
    // Hide pause menu elements
    if (this.pauseOverlay) {
      this.pauseOverlay.setVisible(false);
    }
    if (this.resumeButton) {
      this.resumeButton.setVisible(false);
    }
    
    // Reset pause state
    this.isPaused = false;
    
    // Emit resume event
    this.events.emit('gameResumed');
  }

  /**
   * Update mute button texture based on mute state
   * @param {boolean} isMuted - Whether audio is currently muted
   */
  updateMuteButtonState(isMuted) {
    if (this.muteButton && this.muteButton.setTexture) {
      const textureKey = isMuted ? 'mute_muted' : 'mute_unmuted';
      this.muteButton.setTexture(textureKey);
    }
  }

  update(time, delta) {
    // Handle pause key while paused
    if (this.isPaused && this.inputManager && this.inputManager.isPauseJustPressed) {
      this.resumeGame();
      return;
    }

    // Update health bar based on player health
    if (this.healthBarForeground) {
      // Get player health from registry (0-100)
      const playerHealth = this.registry ? this.registry.get('playerHealth') : 100;
      
      // Clamp health to valid range (0-100), but allow 0 to remain 0
      const clampedHealth = Math.max(0, Math.min(100, playerHealth !== undefined ? playerHealth : 100));
      
      // Calculate health bar width (percentage of max width)
      const maxWidth = 200;
      const currentWidth = Math.floor((clampedHealth / 100) * maxWidth);
      
      // Clear and redraw foreground bar
      this.healthBarForeground.clear();
      this.healthBarForeground.fillStyle(0x00ff00, 1);
      this.healthBarForeground.fillRect(20, 20, currentWidth, 20);
    }

    // Update cooldown indicators
    if (this.cooldownIcons && this.cooldownIcons.dashText && this.cooldownIcons.pulseText) {
      const currentTime = this.time ? this.time.now : 0;
      
      // Update dash cooldown indicator
      const dashTimer = this.registry ? this.registry.get('dashTimer') : 0;
      const isDashOnCooldown = dashTimer !== undefined && currentTime < dashTimer;
      
      if (isDashOnCooldown) {
        this.cooldownIcons.dashText.setTint(0x888888); // Grey
        this.cooldownIcons.dashText.setAlpha(0.5);
      } else {
        this.cooldownIcons.dashText.setTint(0xffffff); // White
        this.cooldownIcons.dashText.setAlpha(1.0);
      }
      
      // Update chrono pulse cooldown indicator
      const chronoPulseLastActivation = this.registry ? this.registry.get('chronoPulseLastActivation') : 0;
      const chronoPulseCooldown = 3000; // From invariants
      const isPulseOnCooldown = chronoPulseLastActivation !== undefined && 
                               (currentTime - chronoPulseLastActivation) < chronoPulseCooldown;
      
      if (isPulseOnCooldown) {
        this.cooldownIcons.pulseText.setTint(0x888888); // Grey
        this.cooldownIcons.pulseText.setAlpha(0.5);
      } else {
        this.cooldownIcons.pulseText.setTint(0xffffff); // White
        this.cooldownIcons.pulseText.setAlpha(1.0);
      }
    }

    // Task 04.03: Update coin counter display
    if (this.coinCounter && typeof this.coinCounter.setText === 'function') {
      const coinsCollected = this.registry ? (this.registry.get('coinsCollected') || 0) : 0;
      this.coinCounter.setText(`Coins: ${coinsCollected}`);
    }

    // Task 04.06: Handle map toggle via T key
    if (this.inputManager && this.inputManager.isMapToggleJustPressed) {
      this.mapVisible = !this.mapVisible;
      if (this.mapOverlay) {
        this.mapOverlay.setVisible(this.mapVisible);
      }
    }
    
    // Task 04.06: Update player position when map is visible
    if (this.mapVisible && this.mapOverlay) {
      const gameSceneForMapUpdate = this.scene && this.scene.get ? this.scene.get('GameScene') : null;
      if (gameSceneForMapUpdate && gameSceneForMapUpdate.player) {
        this.mapOverlay.updatePlayerPosition(gameSceneForMapUpdate.player.x, gameSceneForMapUpdate.player.y);
      }
    }

    // --- Task 05.02.2: Handle SPACE key to return to menu ---
    this.handleLevelCompleteInput();
  }

  onLevelCompleted() {
    if (this.levelCompleteOverlay) return;
    // Create a semi-transparent overlay container
    const overlay = this.add.container(0, 0);
    overlay.setDepth(1002);
    overlay.setVisible(true);
    // Optionally add a background graphics and text
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRect(0, 0, 1280, 720);
    bg.setDepth(1002);
    overlay.add(bg);
    const text = this.add.text(640, 360, 'Level Completed', { font: '48px Arial', fill: '#ffffff' });
    text.setOrigin(0.5);
    text.setDepth(1002);
    overlay.add(text);
    this.levelCompleteOverlay = overlay;
    
    // Set flag to indicate level complete overlay is active
    this.levelCompleteActive = true;
  }

  // --- Task 05.02.2: Handle SPACE key to return to menu ---
  handleLevelCompleteInput() {
    if (this.levelCompleteActive && this.inputManager && this.inputManager.isJumpJustPressed) {
      // Stop GameScene and start MenuScene
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
      
      // Clean up overlay and reset flag
      if (this.levelCompleteOverlay) {
        this.levelCompleteOverlay.destroy();
        this.levelCompleteOverlay = null;
      }
      this.levelCompleteActive = false;
    }
  }

  /**
   * Cleanup method for map overlay resources
   */
  onShutdown() {
    if (this.mapOverlay) {
      this.mapOverlay.destroy();
      this.mapOverlay = null;
    }
  }
} 