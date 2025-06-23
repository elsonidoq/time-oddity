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
  }
} 