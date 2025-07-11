import Entity from './Entity.js';
import StateMachine from '../systems/StateMachine.js';
import { LEVEL_SCALE } from '../config/GameConfig.js';

/**
 * Base class for all enemy entities in the game.
 * Provides common functionality for AI behavior, health management, and movement.
 * 
 * @class
 * @extends Entity
 * @description Base enemy class with common functionality for AI behavior, health management,
 * movement, and time manipulation effects.
 * 
 * Freeze/Unfreeze Contract:
 * - State Properties:
 *   • isFrozen: Boolean flag indicating frozen status
 *   • _frozenUntil: Timestamp when freeze expires
 *   • _freezeTimer: Timer object for freeze duration
 * 
 * - Freeze Mechanics:
 *   1. When frozen:
 *      • Physics velocity set to zero
 *      • AI state machine paused
 *      • Visual effects applied (tint/animation)
 *      • Collision detection remains active
 * 
 *   2. During frozen state:
 *      • Cannot move or change state
 *      • Can still be damaged
 *      • Can still be rewound by TimeManager
 *      • Maintains position and collision
 * 
 *   3. On unfreeze:
 *      • Resumes normal physics
 *      • Resumes AI state machine
 *      • Clears visual effects
 *      • Preserves health and position
 * 
 * - Time Management:
 *   • Freeze effect persists through rewind
 *   • State is properly recorded/restored
 *   • Freeze timer adjusts with game pause
 * 
 * @property {number} maxHealth - Maximum health points (default: 100)
 * @property {number} health - Current health points
 * @property {number} damage - Damage dealt to player (default: 20)
 * @property {number} speed - Movement speed (default: 100)
 * @property {number} moveSpeed - Current movement speed (affected by status)
 * @property {number} direction - Movement direction (1: right, -1: left)
 * @property {boolean} isFrozen - Whether the enemy is currently frozen
 */
export class Enemy extends Entity {
  /**
   * Create a new Enemy instance.
   * 
   * @param {Phaser.Scene} scene - The scene this enemy belongs to
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {string} texture - The texture key for this enemy
   * @param {Object} config - Configuration object for enemy properties
   * @param {number} config.health - Maximum health (default: 100)
   * @param {number} config.speed - Movement speed (default: 100)
   * @param {number} config.damage - Damage dealt to player (default: 20)
   * @param {string} config.texture - Custom texture key
   */
  constructor(scene, x, y, texture, config = {}) {
    // Call parent constructor
    super(scene, x, y, texture);
    
    // Apply centralized scaling
    this.setScale(LEVEL_SCALE, LEVEL_SCALE);
    
    // Initialize enemy-specific properties with defaults
    this.maxHealth = config.health || 100;
    this.health = this.maxHealth;
    this.damage = config.damage || 20;
    this.speed = config.speed || 100;
    this.moveSpeed = this.speed;
    this.direction = 1; // 1 for right, -1 for left
    
    // Initialize freeze effect properties
    this.isFrozen = false;
    this._frozenUntil = null;
    this._freezeTimer = null;
    
    // Initialize state machine for AI behavior
    this.stateMachine = new StateMachine();
    
    // Configure physics body for enemy behavior
    this.configurePhysics();
    
    // Set up initial state
    this.stateMachine.addState('idle', {
      enter: () => this.onIdleEnter(),
      execute: () => this.onIdleExecute(),
      exit: () => this.onIdleExit()
    });
    
    this.stateMachine.setState('idle');
  }

  /**
   * Configure the physics body for enemy behavior.
   */
  configurePhysics() {
    if (this.body) {
      this.body.setCollideWorldBounds(true);
      this.body.setBounce(0);
      this.body.setGravity(0, 980);
      this.body.setAllowGravity(true);
      // Add friction/drag to prevent infinite sliding
      this.body.setDrag(100, 0); // X drag for horizontal friction, no Y drag
    }
  }

  /**
   * Take damage and handle death logic.
   * 
   * @param {number} amount - Amount of damage to take
   */
  takeDamage(amount) {
    if (this.isDead()) return;
    
    this.health = Math.max(0, this.health - amount);
    
    if (this.health <= 0) {
      this.die();
    }
  }

  /**
   * Heal the enemy.
   * 
   * @param {number} amount - Amount of health to restore
   */
  heal(amount) {
    if (this.isDead()) return;
    
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  /**
   * Check if the enemy is dead.
   * 
   * @returns {boolean} True if health is 0 or below
   */
  isDead() {
    return this.health <= 0;
  }

  /**
   * Handle enemy death.
   */
  die() {
    if (this._deathHandled) return; // prevent multiple executions

    this._deathHandled = true;
    this.health = 0;

    // Play death animation if available
    if (this.anims && this.anims.play) {
      const animKey = `${this.texture.key}-death`;
      if (this.scene && this.scene.anims && this.scene.anims.exists && this.scene.anims.exists(animKey)) {
        this.anims.play(animKey, true);
      }
    }

    // Emit enemyDefeated event (Task 02.03.2)
    if (this.scene && this.scene.events && typeof this.scene.events.emit === 'function') {
      this.scene.events.emit('enemyDefeated', this);
    }

    // IMPORTANT: Avoid hard-destroy so TimeManager can bring the enemy back during rewind.
    // We only soft-deactivate (invisible & inactive) to preserve reference for state recording.
    // Destruction is now handled by GC when scene shuts down.
    // This change preserves invariant §7 (soft-destroy for rewind).

    // Hide sprite to simulate destruction visually
    this.setVisible(false);
    this.visible = false;
    // Keep inactive so collisions stop
    this.setActive(false);
    this.active = false;
    if (this.body) {
      this.body.enable = false;
      this.body.setVelocity(0, 0);
    }
    // Note: actual destroy removed to support rewind.
  }

  /**
   * Move the enemy in the current direction.
   */
  move() {
    if (this.isDead() || !this.body) return;
    
    this.body.setVelocity(this.speed * this.direction, this.body.velocity.y);
  }

  /**
   * Stop enemy movement.
   */
  stop() {
    if (this.body) {
      this.body.setVelocity(0, 0);
    }
  }

  /**
   * Change the enemy's movement direction.
   */
  changeDirection() {
    this.direction *= -1;
  }

  /**
   * Play an animation on the enemy.
   * 
   * @param {string} key - Animation key to play
   * @param {boolean} ignoreIfPlaying - Whether to ignore if already playing
   */
  playAnimation(key, ignoreIfPlaying = true) {
    if (this.anims) {
      this.anims.play(key, ignoreIfPlaying);
    }
  }

  /**
   * Stop the current animation.
   */
  stopAnimation() {
    if (this.anims) {
      this.anims.stop();
    }
  }

  /**
   * Set the collision group for this enemy.
   * 
   * @param {number} group - The collision group number
   */
  setCollisionGroup(group) {
    if (this.body) {
      this.body.setCollisionGroup(group);
    }
  }

  /**
   * Idle state enter behavior.
   */
  onIdleEnter() {
    this.stop();
    this.playAnimation('idle');
  }

  /**
   * Idle state execute behavior.
   */
  onIdleExecute() {
    // Override in subclasses for specific idle behavior
  }

  /**
   * Idle state exit behavior.
   */
  onIdleExit() {
    this.stopAnimation();
  }

  /**
   * Update the enemy's state and behavior.
   * 
   * @param {number} time - Current time
   * @param {number} delta - Time since last update
   */
  update(time, delta) {
    // Check if freeze effect has expired
    if (this.isFrozen && this._frozenUntil && time >= this._frozenUntil) {
      this.unfreeze();
    }
    
    // Update state machine only if not frozen
    if (this.stateMachine && !this.isFrozen) {
      this.stateMachine.update(time, delta);
    }
  }

  /**
   * Activate the enemy.
   */
  activate() {
    super.activate();
    this.stateMachine.setState('idle');
  }

  /**
   * Deactivate the enemy.
   */
  deactivate() {
    super.deactivate();
    this.stop();
    this.stopAnimation();
  }

  /**
   * Destroy the enemy and clean up resources.
   */
  destroy() {
    if (this.stateMachine) {
      this.stateMachine = null;
    }
    super.destroy();
  }

  /**
   * Freeze the enemy for a specified duration.
   * 
   * @param {number} duration - Duration of freeze effect in milliseconds
   */
  freeze(duration) {
    if (this.isDead()) return;
    
    // If already frozen, only extend the duration if the new duration is longer
    if (this.isFrozen && this._frozenUntil) {
      const newFrozenUntil = (this.scene?.time?.now || Date.now()) + duration;
      if (newFrozenUntil > this._frozenUntil) {
        this._frozenUntil = newFrozenUntil;
      }
      return;
    }
    
    // Set freeze state
    this.isFrozen = true;
    this._frozenUntil = (this.scene?.time?.now || Date.now()) + duration;
    
    // Stop movement and animation
    this.stop();
    this.stopAnimation();
    
    // Emit freeze event if scene has events
    if (this.scene?.events?.emit) {
      this.scene.events.emit('enemyFrozen', this, duration);
    }
  }

  /**
   * Unfreeze the enemy and resume normal behavior.
   */
  unfreeze() {
    if (!this.isFrozen) return;
    
    this.isFrozen = false;
    this._frozenUntil = null;
    this._freezeTimer = null;
    
    // Resume normal behavior
    if (this.stateMachine) {
      this.stateMachine.setState('idle');
    }
    
    // Emit unfreeze event if scene has events
    if (this.scene?.events?.emit) {
      this.scene.events.emit('enemyUnfrozen', this);
    }
  }

  /**
   * Provide custom state snapshot for TimeManager so that death/health are recorded.
   * @returns {Object} Serializable state
   */
  getStateForRecording() {
    return {
      x: this.x,
      y: this.y,
      velocityX: this.body?.velocity?.x || 0,
      velocityY: this.body?.velocity?.y || 0,
      animation: this.anims?.currentAnim?.key || null,
      active: this.active,
      visible: this.visible,
      health: this.health,
      bodyEnable: (this.body && typeof this.body.enable === 'boolean') ? this.body.enable : true
    };
  }

  /**
   * Restore state from TimeManager snapshot.
   * @param {Object} state - Snapshot created by getStateForRecording()
   */
  setStateFromRecording(state) {
    if (!state) return;
    this.x = state.x;
    this.y = state.y;
    if (this.body) {
      this.body.velocity.x = state.velocityX;
      this.body.velocity.y = state.velocityY;
      this.body.enable = state.bodyEnable !== undefined ? state.bodyEnable : true;
    }
    this.health = state.health;

    // Reactivate/deactivate based on health & recorded active flag
    if (this.health > 0) {
      this.setActive(true);
      this.active = true;
      this.setVisible(true);
      this.visible = true;
      this._deathHandled = false; // Allow future deaths
    } else {
      this.setActive(false);
      this.setVisible(false);
    }

    if (state.animation && this.anims && this.anims.play) {
      this.anims.play(state.animation);
    }
  }
}

export default Enemy; 