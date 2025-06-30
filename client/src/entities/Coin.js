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
   * @param {Phaser.Scene} mockScene Optional mock scene for testing.
   */
  constructor(scene, x, y, texture, mockScene = null) {
    this.scene = mockScene || scene;
    
    // Create the physics sprite for the coin
    // Use provided texture (default 'coin_spin') for backward compatibility
    // Always assign frame string so callers can read coin.frame
    let texKey = texture || 'coin_spin';
    let frameKey = undefined;
    if (texKey === 'tiles') {
      // When tileset texture used, specify the coin frame
      frameKey = 'block_coin_active';
    }

    this.sprite = frameKey ?
      this.scene.physics.add.sprite(x, y, texKey, frameKey) :
      this.scene.physics.add.sprite(x, y, texKey);

    // Normalise frame property for tests (string value)
    if (frameKey) {
      this.sprite.frame = frameKey;
    } else if (!this.sprite.frame) {
      this.sprite.frame = 'block_coin_active';
    }

    // Set a reference back to this Coin object from the sprite
    this.sprite.parentCoin = this;

    // Add coin sprite to the scene's coins physics group for collision detection FIRST
    // This MUST happen before physics configuration per invariants.md §13.3
    if (this.scene.coins && this.scene.coins.add) {
      this.scene.coins.add(this.sprite);
    }
    
    // THEN configure physics properties (after adding to group)
    // Coins should not be affected by gravity
    this.sprite.body.setAllowGravity(false);
    
    // Play the spinning animation if sprite supports it
    if (typeof this.sprite.play === 'function') {
      this.sprite.play('coin_spin', true);
    }

    // Task 04.01.1: Initialize collection state for time reversal
    this.isCollected = false;
    
    // Store initial properties for state restoration
    this.initialX = x;
    this.initialY = y;
    this.initialTexture = texture;
  }

  /**
   * Handles the collection of the coin.
   * Typically called when the player overlaps with the coin.
   */
  collect() {
    // Task 04.01.2: Prevent double collection
    if (this.isCollected) {
      return;
    }

    // Set collection state
    this.isCollected = true;

    // Increment global counter
    if (this.scene.registry && typeof this.scene.registry.get === 'function' && typeof this.scene.registry.set === 'function') {
      const currentCoins = this.scene.registry.get('coinsCollected') || 0;
      const newCoins = currentCoins + 1;
      this.scene.registry.set('coinsCollected', newCoins);
      
      // Log the updated coinsCollected value
      console.log(`[Coin Collection] coinsCollected: ${newCoins} (incremented by 1)`);
    }

    // Play pickup sound effect
    if (this.scene.audioManager) {
      this.scene.audioManager.playSfx('coin');
    }

    // Hide the sprite and destroy it for cleanup
    this.sprite.visible = false;
    this.sprite.destroy();
    this.sprite = null;
  }

  /**
   * Task 04.01.1: Custom state recording for time reversal
   * Returns the current state of the coin for recording.
   * @returns {Object} The coin's current state
   */
  getStateForRecording() {
    return {
      isCollected: this.isCollected,
      x: this.sprite ? this.sprite.x : this.initialX,
      y: this.sprite ? this.sprite.y : this.initialY
    };
  }

  /**
   * Task 04.01.1: Custom state restoration for time reversal
   * Restores the coin's state from recorded data.
   * @param {Object} state The state to restore
   */
  setStateFromRecording(state) {
    if (state && typeof state.isCollected === 'boolean') {
      this.isCollected = state.isCollected;
      
      // If restoring to uncollected state and sprite was destroyed, recreate it
      if (!this.isCollected && !this.sprite) {
        const texKey = this.initialTexture === 'tiles' ? 'tiles' : 'coin_spin';
        const frameKey = texKey === 'tiles' ? 'block_coin_active' : undefined;
        this.sprite = frameKey ?
          this.scene.physics.add.sprite(state.x || this.initialX, state.y || this.initialY, texKey, frameKey) :
          this.scene.physics.add.sprite(state.x || this.initialX, state.y || this.initialY, texKey);
        this.sprite.frame = 'block_coin_active';
        this.sprite.parentCoin = this;
        this.sprite.visible = true;
        
        // Add recreated sprite back to the coins group for collision detection FIRST
        // This MUST happen before physics configuration per invariants.md §13.3
        if (this.scene.coins && this.scene.coins.add) {
          this.scene.coins.add(this.sprite);
        }
        
        // THEN configure physics properties (after adding to group)
        this.sprite.body.setAllowGravity(false);
        if (typeof this.sprite.play === 'function') {
          this.sprite.play('coin_spin', true);
        }
      } else if (this.isCollected && this.sprite) {
        // If restoring to collected state, ensure sprite is hidden
        this.sprite.visible = false;
      }
    }
  }
} 