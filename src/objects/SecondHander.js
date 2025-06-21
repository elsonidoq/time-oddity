import Phaser from 'phaser';
import { store } from '../state/store.js';

export default class SecondHander extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y) {
    // A purple rectangle: 20x60
    super(scene, x, y, 20, 60, 0x8e44ad);
    scene.add.existing(this);
  }

  update() {
    if (!store.isPaused) {
      this.body.setVelocityX(100);
    } else {
      this.body.setVelocityX(0);
    }
  }
} 