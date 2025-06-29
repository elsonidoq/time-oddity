import Entity from './Entity.js';

/**
 * GoalTile - Static physics-enabled entity representing level exit points
 * 
 * A goal tile is a static, immovable entity that players can overlap to complete levels.
 * It extends the base Entity class and follows the established patterns for:
 * - Physics configuration ordering (invariants.md §13.3)
 * - Time reversal compatibility (invariants.md §7)
 * - Asset management using configurable tileKey
 * 
 * @extends Entity
 */
export default class GoalTile extends Entity {
  /**
   * Creates a new GoalTile instance
   * @param {Phaser.Scene} scene - The Phaser scene instance
   * @param {number} x - X position
   * @param {number} y - Y position  
   * @param {string} tileKey - The tile key from the tiles atlas (defaults to 'block_coin')
   * @param {Phaser.Scene} mockScene - Optional mock scene for testing
   */
  constructor(scene, x, y, tileKey = 'block_coin', mockScene = null) {
    // Use the 'tiles' atlas with the specified frame
    super(scene, x, y, 'tiles', tileKey, 100, mockScene);
    
    // Store the tileKey for reference
    this.tileKey = tileKey;
    
    // Ensure texture property is set correctly for both real and mock environments
    if (!this.texture || !this.texture.key) {
      this.texture = { key: 'tiles', frame: tileKey };
    }
    
    // Set the texture frame to the specified tileKey
    this.setTexture('tiles', tileKey);
    
    // Configure physics body as static (immovable, no gravity)
    // This follows invariants.md §13.3 - physics configuration AFTER adding to scene
    this.body.setImmovable(true);
    this.body.setAllowGravity(false);
    
    // Register with TimeManager for time reversal compatibility
    // Uses default TemporalState recording (no custom methods needed)
    if (this.scene.timeManager && typeof this.scene.timeManager.register === 'function') {
      this.scene.timeManager.register(this);
    }
  }
} 