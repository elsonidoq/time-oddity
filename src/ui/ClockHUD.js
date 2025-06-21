import Phaser from 'phaser';
import { store } from '../state/store.js';

export default class ClockHUD extends Phaser.Scene {
  constructor() {
    super({ key: 'ClockHUD' });
    this.cooldownIndicator = null;
  }

  create() {
    // Draw the HUD elements
    const width = this.cameras.main.width;
    const timerBackground = this.add.circle(width - 40, 40, 20, 0x000000, 0.5);
    timerBackground.setStrokeStyle(2, 0xffffff, 0.8);

    this.cooldownIndicator = this.add.arc(width - 40, 40, 18, 0, 360, false, 0x00bfff, 1);
    this.cooldownIndicator.setAngle(-90);
  }

  update() {
    const cooldownProgress = (Date.now() - store.lastPauseTimestamp) / store.pauseCooldown;
    const angle = -90 + (360 * Math.min(cooldownProgress, 1));
    this.cooldownIndicator.setEndAngle(angle);
  }
} 