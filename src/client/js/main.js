import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import Act1Scene from './scenes/Act1Scene';
import ClockHUD from '../../ui/ClockHUD.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, Act1Scene, ClockHUD],
};

const game = new Phaser.Game(config);

export default game;