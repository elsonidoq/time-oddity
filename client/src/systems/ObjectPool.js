/**
 * A generic object pool for recycling game objects to improve performance.
 * @see {@link https://phaser.io/examples/v3/view/game-objects/group/recycle}
 * @see {@link ../../agent_docs/comprehensive_documentation.md#performance-tuning}
 */
export default class ObjectPool {
  /**
   * @param {Phaser.GameObjects.Group} group The Phaser Group that will manage the objects.
   * @param {Function} objectClass The class of the object to be pooled (must have setActive and setVisible methods).
   */
  constructor(group, objectClass) {
    this.group = group;
    this.objectClass = objectClass;
  }

  /**
   * Gets an object from the pool. If no inactive objects are available, a new one is created.
   * @returns {any} An active and visible instance of the objectClass.
   */
  get() {
    // Find the first inactive object in the group
    const existing = this.group.getChildren().find(child => !child.active);

    if (existing) {
      existing.setActive(true).setVisible(true);
      return existing;
    }

    // If no inactive objects, create a new one
    const newObject = new this.objectClass();
    this.group.add(newObject);
    newObject.setActive(true).setVisible(true);
    return newObject;
  }

  /**
   * Releases an object back to the pool, making it inactive and invisible.
   * @param {any} object The object to release.
   */
  release(object) {
    if (object) {
      object.setActive(false);
      object.setVisible(false);
    }
  }
} 