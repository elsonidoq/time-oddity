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
    
    this.body.setVelocityX(this.speed * this.direction);
  }

  /**
   * Stop enemy movement.
   */
  stop() {
    if (this.body) {
      this.body.setVelocityX(0);
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
    super.update(time, delta);
    
    // Update state machine
    if (this.stateMachine) {
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
}

export default Enemy; 