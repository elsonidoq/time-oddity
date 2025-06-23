/**
 * Represents a collectible coin in the game.
 * See Section 1.3 "Creating Game Objects" in the comprehensive documentation for collectible patterns.
 */
export default class Coin {
  /**
   * @param {Phaser.Scene} scene The scene to which this coin belongs.
   * @param {number} x The x-coordinate of the coin.
   * @param {number} y The y-coordinate of the coin.
   * @param {string} texture The texture key for the coin animation.
   */
  constructor(scene, x, y, texture) {
    this.scene = scene;
    
    // Create the physics sprite for the coin
    this.sprite = this.scene.physics.add.sprite(x, y, texture);
    
    // Coins should not be affected by gravity
    this.sprite.body.setAllowGravity(false);
    
    // Play the spinning animation
    this.sprite.play('coin_spin', true);

    // Set a reference back to this Coin object from the sprite
    this.sprite.parentCoin = this;
  }

  /**
   * Handles the collection of the coin.
   * Typically called when the player overlaps with the coin.
   */
  collect() {
    // For now, simply destroy the sprite.
    // Later, this could involve playing a sound, updating a score, etc.
    this.sprite.destroy();
  }
} 