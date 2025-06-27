/**
 * Centralized collision detection management system.
 * See Section 1.4 "Collision Detection" in the comprehensive documentation.
 * 
 * @class
 * @description Manages all collision detection and event emission for game entities.
 * Uses Phaser's built-in collision system and emits standardized events for game logic.
 * 
 * Emitted Events:
 * 1. 'playerEnemyCollision'
 *    - Emitted when player collides with any enemy
 *    - Payload: { player: Player, enemy: Enemy }
 *    - Used for: Damage calculation, knockback effects
 * 
 * 2. 'playerPlatformCollision'
 *    - Emitted when player lands on or touches a platform
 *    - Payload: { player: Player, platform: MovingPlatform }
 *    - Used for: Platform carrying logic, movement synchronization
 * 
 * 3. 'playerCoinCollision'
 *    - Emitted when player collects a coin
 *    - Payload: { player: Player, coin: Coin }
 *    - Used for: Score updates, coin collection effects
 * 
 * 4. 'enemyPlatformCollision'
 *    - Emitted when an enemy collides with a platform
 *    - Payload: { enemy: Enemy, platform: MovingPlatform }
 *    - Used for: Enemy movement boundaries, platform interaction
 * 
 * 5. 'chronoPulseEnemyOverlap'
 *    - Emitted when ChronoPulse ability affects enemies
 *    - Payload: { pulse: ChronoPulse, enemies: Enemy[] }
 *    - Used for: Time freeze effects, visual feedback
 * 
 * Event Handling Contract:
 * - All events include the relevant game objects as payload
 * - Objects in payloads are guaranteed to be active and exist in the scene
 * - Events are emitted before physics resolution to allow for custom handling
 * - Multiple listeners can be attached to each event type
 */
export default class CollisionManager {
  /**
   * @param {Phaser.Scene} scene The scene to which this manager belongs.
   * @param {Phaser.Scene} [mockScene=null] The mock scene to use for testing.
   */
  constructor(scene, mockScene = null) {
    this.scene = mockScene || scene;
  }

  /**
   * Adds a collider between two objects.
   * @param {Phaser.Types.Physics.Arcade.GameObjectWithBody|Phaser.GameObjects.Group} object1 The first object or group.
   * @param {Phaser.Types.Physics.Arcade.GameObjectWithBody|Phaser.GameObjects.Group} object2 The second object or group.
   * @param {ArcadePhysicsCallback} [callback=null] The callback to invoke when the two objects collide.
   * @param {ArcadePhysicsCallback} [processCallback=null] The callback to invoke when the two objects collide. Must return true for the callback to be called.
   * @param {object} [context=null] The context in which to run the callbacks.
   */
  addCollider(object1, object2, callback = null, processCallback = null, context = null) {
    this.scene.physics.add.collider(object1, object2, callback, processCallback, context);
  }

  /**
   * Adds an overlap check between two objects.
   * @param {Phaser.Types.Physics.Arcade.GameObjectWithBody|Phaser.GameObjects.Group} object1 The first object or group.
   * @param {Phaser.Types.Physics.Arcade.GameObjectWithBody|Phaser.GameObjects.Group} object2 The second object or group.
   * @param {ArcadePhysicsCallback} [callback=null] The callback to invoke when the two objects overlap.
   * @param {ArcadePhysicsCallback} [processCallback=null] The callback to invoke when the two objects overlap. Must return true for the callback to be called.
   * @param {object} [context=null] The context in which to run the callbacks.
   */
  addOverlap(object1, object2, callback = null, processCallback = null, context = null) {
    this.scene.physics.add.overlap(object1, object2, callback, processCallback, context);
  }

  /**
   * Sets up collision detection between player and enemies group.
   * @param {Phaser.Physics.Arcade.Sprite} player The player sprite.
   * @param {Phaser.Physics.Arcade.Group} enemiesGroup The group containing enemy sprites.
   * @param {Function} [collisionCallback=null] Optional callback function to handle collision events.
   */
  setupPlayerEnemyCollision(player, enemiesGroup, collisionCallback = null) {
    // Validate inputs
    if (!player || !enemiesGroup) {
      console.warn('CollisionManager: Invalid player or enemies group provided for collision setup');
      return;
    }

    // Create a wrapper callback that handles both the custom callback and event emission
    const handleCollision = (playerSprite, enemySprite) => {
      // Emit collision event for other systems to listen to
      if (this.scene.events && this.scene.events.emit) {
        this.scene.events.emit('playerEnemyCollision', playerSprite, enemySprite);
      }

      // Call the custom collision callback if provided
      if (collisionCallback && typeof collisionCallback === 'function') {
        collisionCallback(playerSprite, enemySprite);
      }

      // Log collision for debugging (can be removed in production)
      console.log('Player-Enemy collision detected:', {
        player: { x: playerSprite.x, y: playerSprite.y },
        enemy: { x: enemySprite.x, y: enemySprite.y }
      });
    };

    // Set up the collider between player and enemies group
    this.addCollider(player, enemiesGroup, handleCollision, null, this);
  }
} 