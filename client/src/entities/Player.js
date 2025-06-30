import Entity from './Entity.js';
import StateMachine from '../systems/StateMachine.js';
import IdleState from './states/IdleState.js';
import RunState from './states/RunState.js';
import JumpState from './states/JumpState.js';
import FallState from './states/FallState.js';
import DashState from './states/DashState.js';
import ObjectPool from '../systems/ObjectPool.js';
import ChronoPulse from './ChronoPulse.js';
import gsap from 'gsap';

/**
 * Player entity.
 *
 * Key behavioural invariants are listed in `agent_docs/invariants.md` §6.
 * Keep dash timing constants, body dimensions and state-machine names in sync with that list.
 * 
 * @class
 * @description The main player character with movement abilities and time manipulation powers.
 * 
 * Dash Mechanic:
 * - Properties:
 *   • dashCooldown: 1000ms (1 second) between dashes
 *   • dashDuration: 20ms of dash movement
 *   • dashSpeed: 1000 pixels/second during dash
 * 
 * - State Management:
 *   • canDash: Boolean flag indicating cooldown status
 *   • isDashing: Boolean flag for dash state
 *   • dashTimer: Timestamp for cooldown tracking
 * 
 * - Invariants:
 *   • Dash is only available when canDash is true
 *   • canDash becomes false on dash start
 *   • canDash becomes true after dashCooldown ms
 *   • isDashing is true only during dashDuration
 *   • Ghost trail effects only spawn during dash
 * 
 * ChronoPulse Ability:
 * - Configuration:
 *   • cooldown: 3000ms (3 seconds)
 *   • range: 300 pixels radius
 *   • duration: 2000ms freeze duration
 * 
 * - Activation Contract:
 *   • Only activates if cooldown has expired
 *   • Freezes all enemies within range
 *   • Creates visual shockwave effect
 *   • Enemies remain frozen for duration
 * 
 * - Integration:
 *   • Updates position with player movement
 *   • Managed by TimeManager for rewind
 *   • Interacts with CollisionManager for enemy detection
 */
export default class Player extends Entity {
  constructor(scene, x, y, texture, frame, health = 100, mockScene = null) {
    super(scene, x, y, texture, frame, health, mockScene);
    
    // Set origin to bottom-center for accurate positioning on platforms
    this.setOrigin(0.5, 1);
    
    // Adjust the physics body to be tighter around the player
    // This ignores some of the empty helmet space and makes for better collisions.
    this.body.setSize(this.width * 0.5, this.height * 0.7);
    this.body.setOffset(this.width * 0.25, this.height * 0.3);
    
    // Player-specific properties
    this.speed = 200;
    this.jumpPower = 800;
    this.gravity = 980; // This might be redundant if world gravity is set
    this.inputManager = null; // Will be set up later

    // Add default attack power for combat system
    this.attackPower = 20;

    // Dash properties
    this.dashCooldown = 1000; // ms - 1 second default cooldown
    this.dashDuration = 120; // ms
    this.dashSpeed = 1000; // px/sec
    this.dashTimer = 0;
    this.canDash = true;
    this.isDashing = false;

    // Ghost trail properties
    this.ghostPool = null;
    this.setupGhostPool();

    // Create ChronoPulse ability with expanded range for testing
    this.chronoPulse = new ChronoPulse(scene, x, y, { cooldown: 3000, range: 300, duration: 2000 }, gsap);

    // State Machine Setup
    this.stateMachine = new StateMachine();
    this.stateMachine
      .addState('idle', new IdleState(this))
      .addState('run', new RunState(this))
      .addState('jump', new JumpState(this))
      .addState('fall', new FallState(this))
      .addState('dash', new DashState(this));
      
    this.stateMachine.setState('idle');

    // Track previous rewind state
    this._wasRewinding = false;
  }

  /**
   * Sets up the ghost pool for dash trail effects
   */
  setupGhostPool() {
    if (!this.scene || !this.scene.add) return;
    
    // Create a group for ghost sprites
    const ghostGroup = this.scene.add.group();
    
    // Create initial ghost sprites (5 ghosts for the pool)
    for (let i = 0; i < 5; i++) {
      const ghost = this.scene.add.sprite(0, 0, this.texture.key);
      ghost.setActive(false).setVisible(false);
      ghost.setOrigin(0.5, 1); // Match player origin
      ghostGroup.add(ghost);
    }
    
    // Factory function for creating new ghost sprites
    const ghostFactory = () => {
      const ghost = this.scene.add.sprite(0, 0, this.texture.key);
      ghost.setOrigin(0.5, 1);
      return ghost;
    };
    // Create the object pool
    this.ghostPool = new ObjectPool(ghostGroup, ghostFactory);
  }

  /**
   * The update loop for the player, called by the scene.
   * @param {number} time - The current time.
   * @param {number} delta - The delta time in ms since the last frame.
   */
  update(time, delta) {
    const isRewinding = this.scene.timeManager && this.scene.timeManager.isRewinding;
    let justEndedRewind = false;
    if (this._wasRewinding && !isRewinding) {
      justEndedRewind = true;
      if (this.inputManager) {
        const left = this.inputManager.left && this.inputManager.left.isDown;
        const right = this.inputManager.right && this.inputManager.right.isDown;
        if (left || right) {
          this.stateMachine.setState('run');
        } else {
          this.stateMachine.setState('idle');
        }
      }
    }
    this._wasRewinding = isRewinding;
    if (isRewinding) {
      return;
    }
    if (justEndedRewind) {
      // Skip normal update this frame to avoid overriding forced state
      return;
    }
    if (this.inputManager) {
      this.stateMachine.update(time, delta);
      
      // Update ChronoPulse position to follow player
      if (this.chronoPulse) {
        this.chronoPulse.setPosition(this.x, this.y);
      }
      
      // Handle Chrono Pulse input
      if (this.inputManager.isChronoPulseJustPressed && this.chronoPulse) {
        console.log('[Player] Chrono Pulse activated at position:', this.x, this.y);
        const activated = this.chronoPulse.activate();
        console.log('[Player] Chrono Pulse activation result:', activated);
      }
    }
  }

  // Testing helper method to simulate DashState.execute() cooldown logic
  simulateDashStateExecute() {
    const now = this.scene.time.now;
    // Cooldown check: allow dash again after timer expires
    if (now >= this.dashTimer) {
      this.canDash = true;
    }
  }

  /**
   * Enhanced floor detection for moving platform stability.
   * This method provides more reliable floor detection when standing on moving platforms
   * by checking both physics collision and platform-specific detection.
   * @returns {boolean} - True if player is on the floor or on a moving platform
   */
  isOnFloorEnhanced() {
    // First check normal physics collision
    if (this.body && this.body.onFloor && this.body.onFloor()) {
      return true;
    }

    // Check if standing on any moving platforms in the scene
    if (this.scene && this.scene.platforms) {
      const platforms = this.scene.platforms.getChildren ? this.scene.platforms.getChildren() : [];
      
      for (const platform of platforms) {
        if (platform && typeof platform.isPlayerStandingOnAnySprite === 'function') {
          if (platform.isPlayerStandingOnAnySprite(this.body)) {
            return true;
          }
        }
      }
    }

    // Fallback to basic touching.down check
    return this.body && this.body.touching && this.body.touching.down;
  }

  /**
   * Handle taking damage.
   * @param {number} amount - The amount of damage to take.
   * @returns {boolean} - True if the player died, false otherwise.
   */
  takeDamage(amount) {
    const previousHealth = this.health;
    const isDead = super.takeDamage(amount);

    // Task 02.06: Emit playerHealthChanged event for UI updates
    if (this.scene && this.scene.events && this.scene.events.emit) {
      this.scene.events.emit('playerHealthChanged', {
        health: this.health,
        damage: amount,
        previousHealth: previousHealth
      });
    }

    // Task 02.06: Emit playerDied event when player dies
    if (isDead && this.scene && this.scene.events && this.scene.events.emit) {
      this.scene.events.emit('playerDied', { player: this });
    }

    // Task 06.02.4: Play hurt sound effect
    if (this.scene.audioManager) {
      this.scene.audioManager.playSfx('playerHurt');
    }

    // Update player health in scene registry
    if (this.scene && this.scene.registry && this.scene.registry.set) {
      this.scene.registry.set('playerHealth', this.health);
    }

    // Optional: quick hit-flash feedback (harmless if scene.time undefined in mocks)
    if (this.setTint && this.scene && this.scene.time && typeof this.scene.time.delayedCall === 'function') {
      this.setTint(0xff0000);
      this.scene.time.delayedCall(100, () => {
        if (this.clearTint) this.clearTint();
      });
    }

    return isDead;
  }
} 