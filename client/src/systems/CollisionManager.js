/**
 * Centralized collision detection management system.
 * See Section 1.4 "Collision Detection" in the comprehensive documentation.
 */
export default class CollisionManager {
  /**
   * @param {Phaser.Scene} scene The scene to which this manager belongs.
   */
  constructor(scene) {
    this.scene = scene;
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
} 