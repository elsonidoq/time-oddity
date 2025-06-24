/**
 * Centralized collision detection management system.
 * See Section 1.4 "Collision Detection" in the comprehensive documentation.
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