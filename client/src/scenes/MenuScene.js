import BaseScene from './BaseScene.js';

export default class MenuScene extends BaseScene {
  constructor() {
    super('MenuScene');
  }

  init(data) {
    // Initialize menu scene
  }

  preload() {
    // Preload menu assets if needed
  }

  create(data) {
    // Create title text
    const title = this.add.text(640, 200, 'Time Oddity', {
      fontFamily: 'Arial',
      fontSize: '64px',
      color: '#ffffff',
      align: 'center',
      stroke: '#000',
      strokeThickness: 6
    });
    if (title.setOrigin) title.setOrigin(0.5, 0.5);

    // Create start button
    const startButton = this.add.text(640, 400, 'Start', {
      fontFamily: 'Arial',
      fontSize: '40px',
      color: '#ffcc00',
      backgroundColor: '#222',
      padding: { x: 20, y: 10 },
      align: 'center',
      stroke: '#000',
      strokeThickness: 4
    });
    if (startButton.setOrigin) startButton.setOrigin(0.5, 0.5);
    if (startButton.setInteractive) startButton.setInteractive({ useHandCursor: true });
    if (startButton.on) {
      startButton.on('pointerdown', () => {
        this.scene.start('GameScene');
      });
    }
  }

  update(time, delta) {
    // Update menu if needed
  }
} 