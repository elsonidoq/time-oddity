/**
 * CollisionManager.js - A system for managing collisions between game objects.
 */
export class CollisionManager {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Adds a collider between two objects or groups.
     * @param {Phaser.Types.Physics.Arcade.GameObjectWithBody|Phaser.GameObjects.Group} object1 - The first object or group.
     * @param {Phaser.Types.Physics.Arcade.GameObjectWithBody|Phaser.GameObjects.Group} object2 - The second object or group.
     * @param {Phaser.Types.Physics.Arcade.ArcadePhysicsCallback} [callback=null] - The callback function, if any.
     * @param {Function} [processCallback=null] - The process callback function, if any.
     * @param {object} [callbackContext=null] - The context for the callbacks.
     */
    addCollider(object1, object2, callback = null, processCallback = null, callbackContext = null) {
        this.scene.physics.add.collider(
            object1,
            object2,
            callback,
            processCallback,
            callbackContext || this.scene
        );
    }

    /**
     * Adds an overlap check between two objects or groups.
     * @param {Phaser.Types.Physics.Arcade.GameObjectWithBody|Phaser.GameObjects.Group} object1 - The first object or group.
     * @param {Phaser.Types.Physics.Arcade.GameObjectWithBody|Phaser.GameObjects.Group} object2 - The second object or group.
     * @param {Phaser.Types.Physics.Arcade.ArcadePhysicsCallback} [callback=null] - The callback function, if any.
     * @param {Function} [processCallback=null] - The process callback function, if any.
     * @param {object} [callbackContext=null] - The context for the callbacks.
     */
    addOverlap(object1, object2, callback = null, processCallback = null, callbackContext = null) {
        this.scene.physics.add.overlap(
            object1,
            object2,
            callback,
            processCallback,
            callbackContext || this.scene
        );
    }
}

export default CollisionManager; 