import BaseScene from './BaseScene.js';

/**
 * MenuScene - Main menu interface
 * Provides navigation to start the game
 */
export class MenuScene extends BaseScene {
    constructor() {
        super('MenuScene');
        this.titleText = null;
        this.startButton = null;
    }

    create() {
        super.create();
        
        // Fade in effect
        this.fadeIn(1000);
        
        // Create menu UI
        this.createMenuUI();
    }

    /**
     * Create menu user interface
     */
    createMenuUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Title
        this.titleText = this.createCenteredText(width / 2, height / 2 - 100, 'Time Oddity', {
            fontSize: '64px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        
        // Add subtitle
        this.createCenteredText(width / 2, height / 2 - 50, 'A Time-Manipulation Platformer', {
            fontSize: '24px',
            color: '#cccccc',
            fontFamily: 'Arial'
        });
        
        // Start Game button
        this.startButton = this.createButton(width / 2, height / 2 + 50, 'Start Game', () => {
            this.startGame();
        }, {
            width: 250,
            height: 60,
            backgroundColor: 0x4a90e2,
            textColor: '#ffffff',
            fontSize: '28px'
        });
        
        // Options button (placeholder for future)
        this.createButton(width / 2, height / 2 + 130, 'Options', () => {
            console.log('Options menu - to be implemented');
        }, {
            width: 250,
            height: 60,
            backgroundColor: 0x666666,
            textColor: '#ffffff',
            fontSize: '28px'
        });
        
        // Credits button (placeholder for future)
        this.createButton(width / 2, height / 2 + 210, 'Credits', () => {
            console.log('Credits - to be implemented');
        }, {
            width: 250,
            height: 60,
            backgroundColor: 0x666666,
            textColor: '#ffffff',
            fontSize: '28px'
        });
        
        // Version info
        this.createCenteredText(width / 2, height - 30, 'v1.0.0 - MVP', {
            fontSize: '14px',
            color: '#888888',
            fontFamily: 'Arial'
        });
    }

    /**
     * Start the game
     */
    startGame() {
        // Disable button to prevent multiple clicks
        this.startButton.setInteractive(false);
        
        // Transition to GameScene
        this.transitionTo('GameScene');
    }

    /**
     * Handle keyboard input
     */
    update() {
        // Allow Enter key to start game
        if (this.input.keyboard.justPressed('Enter')) {
            this.startGame();
        }
        
        // Allow Escape key to quit (in browser, this doesn't do much)
        if (this.input.keyboard.justPressed('Escape')) {
            console.log('Escape pressed - would quit in full game');
        }
    }
}

export default MenuScene; 