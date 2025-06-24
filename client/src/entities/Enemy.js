import Entity from './Entity.js';
import StateMachine from '../systems/StateMachine.js';

/**
 * Base class for all enemy entities in the game.
 * Provides common functionality for AI behavior, health management, and movement.
 * 
 * @extends Entity
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
    this.health = 0;
    this.deactivate();
    // Override in subclasses for specific death behavior
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
}

export default Enemy; 