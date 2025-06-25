import BaseScene from './BaseScene.js';
import InputManager from '../systems/InputManager.js';

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

    // Ability cooldown placeholders
    const dashText = this.add.text(20, 50, 'Dash', { font: '16px Arial', fill: '#ffffff' });
    dashText.setOrigin(0, 0);
    const pulseText = this.add.text(100, 50, 'Pulse', { font: '16px Arial', fill: '#ffffff' });
    pulseText.setOrigin(0, 0);

    this.cooldownIcons = { dashText, pulseText };

    // Create pause menu if needed
    if (this.isPaused) {
      this.createPauseMenu();
    }

    // Initialize input manager for pause handling
    this.inputManager = new InputManager(this);
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
  }
} 