import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#2c3e50',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 980 },
            debug: false
        }
    },
    audio: {
        noAudio: true
    },
    scene: [
        BootScene,
        MenuScene,
        GameScene
    ]
};

// Create game instance
const game = new Phaser.Game(config);

// Export for debugging
window.game = game;

console.log('Time Oddity - Game initialized with Arcade Physics'); 