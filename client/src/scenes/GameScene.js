import BaseScene from './BaseScene.js';

/**
 * GameScene - Main gameplay scene
 * Handles the core game mechanics and world
 */
export class GameScene extends BaseScene {
    constructor() {
        super('GameScene');
        this.backButton = null;
        this.gameObjects = [];
    }

    create() {
        super.create();
        
        // Fade in effect
        this.fadeIn(1000);
        
        // Create basic game world
        this.createGameWorld();
        
        // Create UI elements
        this.createGameUI();
    }

    /**
     * Create basic game world
     */
    createGameWorld() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add background
        this.add.rectangle(width / 2, height / 2, width, height, 0x2c3e50);
        
        // Add some placeholder game elements
        this.createPlaceholderElements();
    }

    /**
     * Create placeholder game elements
     */
    createPlaceholderElements() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add a simple platform
        const platform = this.add.rectangle(width / 2, height - 100, 400, 20, 0x4a90e2);
        platform.setStrokeStyle(2, 0xffffff);
        
        // Add a placeholder player (will be replaced in Phase 2)
        const player = this.add.rectangle(width / 2, height - 150, 32, 32, 0xff6b6b);
        player.setStrokeStyle(2, 0xffffff);
        
        // Add some decorative elements
        for (let i = 0; i < 5; i++) {
            const decoration = this.add.rectangle(
                100 + i * 150, 
                height - 200, 
                20, 
                20, 
                0x95a5a6
            );
            decoration.setStrokeStyle(1, 0xffffff);
        }
        
        // Store game objects for cleanup
        this.gameObjects.push(platform, player);
    }

    /**
     * Create game UI elements
     */
    createGameUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Back to Menu button
        this.backButton = this.createButton(100, 50, 'Back to Menu', () => {
            this.goBackToMenu();
        }, {
            width: 150,
            height: 40,
            backgroundColor: 0x666666,
            textColor: '#ffffff',
            fontSize: '18px'
        });
        
        // Game title
        this.createCenteredText(width / 2, 30, 'Game Scene - Phase 1', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        
        // Instructions
        this.createCenteredText(width / 2, height - 30, 'This is the basic game scene. Player mechanics will be added in Phase 2.', {
            fontSize: '16px',
            color: '#cccccc',
            fontFamily: 'Arial'
        });
    }

    /**
     * Go back to menu
     */
    goBackToMenu() {
        // Disable button to prevent multiple clicks
        this.backButton.setInteractive(false);
        
        // Transition back to MenuScene
        this.transitionTo('MenuScene');
    }

    /**
     * Handle keyboard input
     */
    update() {
        // Allow Escape key to go back to menu
        if (this.input.keyboard.justPressed('Escape')) {
            this.goBackToMenu();
        }
        
        // Allow R key to restart scene (for testing)
        if (this.input.keyboard.justPressed('R')) {
            this.scene.restart();
        }
    }

    /**
     * Clean up game objects
     */
    cleanup() {
        super.cleanup();
        
        // Clean up game objects
        this.gameObjects.forEach(obj => {
            if (obj && obj.destroy) {
                obj.destroy();
            }
        });
        this.gameObjects = [];
    }
}

export default GameScene; 