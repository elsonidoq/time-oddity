import TemporalState from './TemporalState.js';

/**
 * Core time manipulation system.
 * See Section 7.1 "The Time Control System: A Deep Dive" in the comprehensive documentation.
 */
export default class TimeManager {
  /**
   * @param {Phaser.Scene} scene The scene to which this manager belongs.
   */
  constructor(scene) {
    this.scene = scene;
    this.stateBuffer = [];
    this.isRewinding = false;
    this.managedObjects = new Set();
    this.lastRecordTime = 0;
    this.recordInterval = 100; // ms
  }

  /**
   * Registers a game object to be tracked by the TimeManager.
   * @param {Phaser.GameObjects.GameObject} object The object to manage.
   */
  register(object) {
    this.managedObjects.add(object);
  }

  /**
   * The update loop for the TimeManager, called by the scene.
   * @param {number} time - The current time.
   * @param {number} delta - The delta time in ms since the last frame.
   */
  update(time, delta) {
    if (time - this.lastRecordTime > this.recordInterval) {
      this.lastRecordTime = time;
      for (const object of this.managedObjects) {
        const state = new TemporalState({
          x: object.x,
          y: object.y,
          velocityX: object.body.velocity.x,
          velocityY: object.body.velocity.y,
          animation: object.anims.currentAnim ? object.anims.currentAnim.key : null,
          isAlive: object.active,
          isVisible: object.visible,
        });

        this.stateBuffer.push({
          timestamp: time,
          target: object,
          state: state,
        });
      }
    }
  }
} 