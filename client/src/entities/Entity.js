import Phaser from 'phaser';

/**
 * Entity - Base class for all game entities
 * Provides common functionality for game objects
 */
export class Entity extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Common properties
        this.health = 100;
        this.activeState = true;
    }

    /**
     * Apply damage to the entity
     * @param {number} damage - Damage amount
     */
    takeDamage(damage) {
        if (!this.activeState) return;

        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    }

    /**
     * Handle entity death
     */
    die() {
        this.activeState = false;
        // Can be overridden in child classes
        this.destroy();
    }

    /**
     * Pre-update method for entity logic
     * @param {number} time - Current time
     * @param {number} delta - Time since last frame
     */
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        // Add common entity logic here
    }
}

export default Entity; 