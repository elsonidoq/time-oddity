import Phaser from 'phaser';
import AnimationManager from '../systems/AnimationManager.js';

/**
 * BaseScene - Abstract base class for all game scenes
 * Provides common functionality and lifecycle methods
 */
export class BaseScene extends Phaser.Scene {
    constructor(key) {
        super(key);
        this.animationManager = null;
        this.isTransitioning = false;
    }

    /**
     * Initialize scene
     * @param {Object} data - Data passed to the scene
     */
    init(data = {}) {
        this.animationManager = new AnimationManager();
        this.sceneData = data;
        console.log(`Scene ${this.scene.key} initialized`);
    }

    /**
     * Preload assets
     */
    preload() {
        // Override in child classes
        console.log(`Scene ${this.scene.key} preload started`);
    }

    /**
     * Create scene objects
     */
    create() {
        // Override in child classes
        console.log(`Scene ${this.scene.key} create started`);
    }

    /**
     * Update scene (called every frame)
     * @param {number} time - Current time
     * @param {number} delta - Time since last frame
     */
    update(time, delta) {
        // Override in child classes
    }

    /**
     * Scene transition to another scene
     * @param {string} targetScene - Target scene key
     * @param {Object} data - Data to pass to target scene
     * @param {number} duration - Transition duration
     */
    transitionTo(targetScene, data = {}, duration = 1000) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Create fade out effect
        const fadeOut = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000);
        fadeOut.setOrigin(0, 0);
        fadeOut.setAlpha(0);
        
        this.tweens.add({
            targets: fadeOut,
            alpha: 1,
            duration: duration / 2,
            onComplete: () => {
                this.scene.start(targetScene, data);
            }
        });
    }

    /**
     * Fade in effect when scene starts
     * @param {number} duration - Fade duration
     */
    fadeIn(duration = 1000) {
        const fadeIn = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000);
        fadeIn.setOrigin(0, 0);
        fadeIn.setAlpha(1);
        
        this.tweens.add({
            targets: fadeIn,
            alpha: 0,
            duration: duration,
            onComplete: () => {
                fadeIn.destroy();
            }
        });
    }

    /**
     * Create a button with common styling
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Button text
     * @param {Function} callback - Click callback
     * @param {Object} options - Additional options
     */
    createButton(x, y, text, callback, options = {}) {
        const {
            width = 200,
            height = 50,
            backgroundColor = 0x4a90e2,
            textColor = '#ffffff',
            fontSize = '24px'
        } = options;

        const button = this.add.container(x, y);
        
        // Background
        const background = this.add.rectangle(0, 0, width, height, backgroundColor);
        background.setStrokeStyle(2, 0xffffff);
        
        // Text
        const buttonText = this.add.text(0, 0, text, {
            fontSize: fontSize,
            color: textColor,
            fontFamily: 'Arial'
        });
        buttonText.setOrigin(0.5);
        
        button.add([background, buttonText]);
        button.setSize(width, height);
        button.setInteractive();
        
        // Hover effects
        button.on('pointerover', () => {
            background.setFillStyle(0x5ba0f2);
        });
        
        button.on('pointerout', () => {
            background.setFillStyle(backgroundColor);
        });
        
        button.on('pointerdown', () => {
            background.setFillStyle(0x3a80d2);
        });
        
        button.on('pointerup', () => {
            background.setFillStyle(0x4a90e2);
            if (callback) callback();
        });
        
        return button;
    }

    /**
     * Create centered text
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Text content
     * @param {Object} options - Text options
     */
    createCenteredText(x, y, text, options = {}) {
        const {
            fontSize = '32px',
            color = '#ffffff',
            fontFamily = 'Arial'
        } = options;

        const textObject = this.add.text(x, y, text, {
            fontSize: fontSize,
            color: color,
            fontFamily: fontFamily
        });
        textObject.setOrigin(0.5);
        
        return textObject;
    }

    /**
     * Clean up scene resources
     */
    cleanup() {
        if (this.animationManager) {
            this.animationManager.killAll();
        }
        this.isTransitioning = false;
    }

    /**
     * Scene shutdown
     */
    shutdown() {
        this.cleanup();
        console.log(`Scene ${this.scene.key} shutdown`);
    }
}

export default BaseScene; 