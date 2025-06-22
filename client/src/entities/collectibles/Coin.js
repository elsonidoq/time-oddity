import Entity from '../Entity.js';

/**
 * Coin.js - A collectible coin.
 */
export class Coin extends Entity {
    constructor(scene, x, y) {
        // For now, we'll use a simple rectangle as a placeholder.
        // In a later phase, we would use a proper sprite.
        super(scene, x, y, null); // No texture for a shape
        
        const graphics = scene.add.graphics();
        graphics.fillStyle(0xffff00, 1);
        graphics.fillCircle(12, 12, 12);
        const texture = graphics.generateTexture('coin', 24, 24);
        graphics.destroy();

        this.setTexture('coin');
        this.body.setAllowGravity(false);
        this.body.isCircle = true;
    }

    collect() {
        // Play a sound, add to score, etc.
        console.log('Coin collected!');
        this.destroy();
    }
}

export default Coin; 