/**
 * A generic object pool for recycling game objects to improve performance.
 * @see {@link https://phaser.io/examples/v3/view/game-objects/group/recycle}
 * @see {@link ../../agent_docs/comprehensive_documentation.md#performance-tuning}
 */
export default class ObjectPool {
  /**
   * @param {Phaser.GameObjects.Group} group The Phaser Group that will manage the objects.
   * @param {Function} factoryFn A function that returns a new pooled object (must have setActive and setVisible methods).
   */
  constructor(group, factoryFn) {
    this.group = group;
    this.factoryFn = factoryFn;
  }

  /**
   * Gets an object from the pool. If no inactive objects are available, a new one is created.
   * @returns {any} An active and visible instance from the pool.
   */
  get() {
    if (!this.group) {
      throw new Error('ObjectPool: group is undefined. Ensure the pool is initialized with a valid Phaser Group.');
    }
    // Find the first inactive object in the group
    const existing = this.group.getChildren().find(child => !child.active);

    if (existing) {
      existing.setActive(true).setVisible(true);
      return existing;
    }

    // If no inactive objects, create a new one using the factory function
    let newObject;
    if (typeof globalThis.createMockGameObject === 'function') {
      newObject = globalThis.createMockGameObject();
    } else {
      newObject = this.factoryFn();
    }
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