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
    this.lastRewindTime = 0;
  }

  /**
   * Registers a game object to be tracked by the TimeManager.
   * @param {Phaser.GameObjects.GameObject} object The object to manage.
   */
  register(object) {
    this.managedObjects.add(object);
  }

  /**
   * Toggles the rewind state.
   * @param {boolean} isRewinding Whether to enable or disable rewind.
   */
  toggleRewind(isRewinding) {
    this.isRewinding = isRewinding;

    // Announce the state change globally
    this.scene.game.events.emit('rewindStateChanged', { isRewinding: this.isRewinding });

    if (!isRewinding) {
      for (const object of this.managedObjects) {
        if (object.body) {
          object.body.setAllowGravity(true);
        }
      }
    }
  }

  /**
   * The update loop for the TimeManager, called by the scene.
   * @param {number} time - The current time.
   * @param {number} delta - The delta time in ms since the last frame.
   */
  update(time, delta) {
    if (this.isRewinding) {
      if (time - this.lastRewindTime > this.recordInterval) {
        this.lastRewindTime = time;

        if (this.stateBuffer.length > 0) {
          const record = this.stateBuffer.pop();
          const { target, state } = record;

          target.x = state.x;
          target.y = state.y;
          
          if (target.body) {
            target.body.setAllowGravity(false);
            target.body.setVelocity(state.velocityX, state.velocityY);
          }
          
          if (target.anims && state.animation) {
            target.anims.play(state.animation, true);
          }
          
          target.setActive(state.isAlive);
          target.setVisible(state.isVisible);
        }
      }
    } else {
        // When not rewinding, ensure lastRewindTime is reset for the next rewind activation.
        this.lastRewindTime = 0;

        if (time - this.lastRecordTime > this.recordInterval) {
        this.lastRecordTime = time;
        for (const object of this.managedObjects) {
          // Re-enable physics for objects that were being rewound
          if (object.body && !object.body.allowGravity) {
            object.body.setAllowGravity(true);
          }

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
} 