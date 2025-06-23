import Phaser from 'phaser';

class BaseScene extends Phaser.Scene {
  constructor(key, mockScene = null) {
    if (mockScene) {
      super(mockScene.key);
      Object.assign(this, mockScene);
      this.key = mockScene.key;
    } else {
      super(key);
      this.key = key;
    }
  }

  // Core lifecycle methods (to be overridden by subclasses)
  init(data) {}
  preload() {}
  create(data) {}
  update(time, delta) {}

  // Utility methods for scene management
  startScene(key, data) {
    this.scene.start(key, data);
  }

  stopScene(key) {
    this.scene.stop(key);
  }

  launchScene(key, data) {
    this.scene.launch(key, data);
  }
}

export default BaseScene; 