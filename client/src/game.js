import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';

/**
 * Phaser.Game configuration for Time Oddity.
 *
 * IMPORTANT: A table of **hard** assumptions that rely on the values declared here
 * lives in `agent_docs/invariants.md` §2.
 * Changing anything below (canvas size, gravity, audio.noAudio, etc.) **without**
 * updating that file and the dependent tests will break runtime logic and CI.
 */

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#000000',
  scene: [BootScene, MenuScene, GameScene, UIScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 980 },
      debug: true
    }
  },
  audio: {
    noAudio: true // Important: Disables Phaser's audio system
  }
};

const game = new Phaser.Game(config);

export default game; 