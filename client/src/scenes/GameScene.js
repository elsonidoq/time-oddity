import BaseScene from './BaseScene.js';
import Player from '../entities/Player.js';
import InputManager from '../systems/InputManager.js';
import CollisionManager from '../systems/CollisionManager.js';
import { Coin } from '../entities/collectibles/Coin.js';

/**
 * GameScene - Main gameplay scene
 * Handles the core game mechanics and world
 */
export class GameScene extends BaseScene {
    constructor() {
        super('GameScene');
        this.backButton = null;
        this.gameObjects = [];
        this.player = null;
        this.inputManager = null;
        this.collisionManager = null;
        this.platforms = null;
        this.coins = null;
    }

    create() {
        super.create();
        
        // Fade in effect
        this.fadeIn(1000);
        
        // Create basic game world
        this.createGameWorld();
        
        // Setup input manager
        this.inputManager = new InputManager(this);
        
        // Setup collision manager
        this.collisionManager = new CollisionManager(this);

        // Add player to the scene
        this.player = new Player(this, 100, 450, this.inputManager);
        this.gameObjects.push(this.player);

        // Add coins
        this.coins = this.physics.add.group({ classType: Coin });
        this.coins.get(200, 400);
        this.coins.get(600, 350);
        this.coins.get(750, 150);

        // Setup collisions
        this.collisionManager.addCollider(this.player, this.platforms);
        this.collisionManager.addOverlap(this.player, this.coins, this.handlePlayerCoinOverlap, null, this);

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
        // Add a simple platform group
        this.platforms = this.physics.add.staticGroup();
        
        // Ground
        const ground = this.add.rectangle(400, 580, 800, 40, 0x4a90e2).setStrokeStyle(2, 0xffffff);
        this.platforms.add(ground, true);

        // Platforms
        const plat1 = this.add.rectangle(600, 450, 250, 20, 0x4a90e2).setStrokeStyle(2, 0xffffff);
        this.platforms.add(plat1, true);

        const plat2 = this.add.rectangle(250, 350, 250, 20, 0x4a90e2).setStrokeStyle(2, 0xffffff);
        this.platforms.add(plat2, true);
        
        const plat3 = this.add.rectangle(750, 250, 250, 20, 0x4a90e2).setStrokeStyle(2, 0xffffff);
        this.platforms.add(plat3, true);
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

    handlePlayerCoinOverlap(player, coin) {
        coin.collect();
    }
}

export default GameScene; 