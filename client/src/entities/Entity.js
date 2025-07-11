import Phaser from 'phaser';

/**
 * Base class for all game entities
 * Provides common functionality for health management, lifecycle, and physics
 * Extends Phaser.Physics.Arcade.Sprite for proper physics integration
 */
export default class Entity extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame, health = 100, mockScene = null) {
    const useScene = mockScene || scene;
    super(useScene, x, y, texture, frame);
    
    // Patch for test/mock compatibility: ensure scaleX/scaleY are always present and set by setScale
    this.scaleX = 1;
    this.scaleY = 1;
    const origSetScale = this.setScale;
    this.setScale = function(scaleX, scaleY) {
      this.scaleX = scaleX;
      this.scaleY = (scaleY !== undefined) ? scaleY : scaleX;
      return origSetScale ? origSetScale.apply(this, arguments) : this;
    };
    
    // An entity needs to be added to the scene's display list to be visible
    useScene.add.existing(this);
    // It also needs to be added to the physics world to have a body
    useScene.physics.add.existing(this);
    
    // Entity-specific properties
    this.health = health;
    this.maxHealth = health;
    this.isActive = true;

    // Explicitly bind methods for test/mock environments
    this.takeDamage = this.takeDamage.bind(this);
    this.heal = this.heal.bind(this);
    this.destroy = this.destroy.bind(this);
    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
  }

  /**
   * Take damage and reduce health
   * @param {number} amount - Amount of damage to take
   * @returns {boolean} - True if entity is dead (health <= 0)
   */
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    return this.health <= 0;
  }

  /**
   * Heal the entity
   * @param {number} amount - Amount of health to restore
   */
  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  /**
   * Destroy the entity (deactivate it)
   */
  destroy() {
    this.isActive = false;
    if (super.destroy) super.destroy();
  }

  /**
   * Activate the entity
   */
  activate() {
    this.isActive = true;
  }

  /**
   * Deactivate the entity
   */
  deactivate() {
    this.isActive = false;
  }
} 