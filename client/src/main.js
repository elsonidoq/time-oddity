import Phaser from 'phaser';
import game from './game.js';

try {
  // Initialize the Phaser game instance
  if (!game || !(game instanceof Phaser.Game)) {
    // If game.js exports a config object, create the game instance
    new Phaser.Game(game);
  }
} catch (error) {
  // Handle errors gracefully
  console.error('Failed to initialize the game:', error);
  // Optionally, display an error message to the user
} 