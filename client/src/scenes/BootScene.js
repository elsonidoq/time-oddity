import BaseScene from './BaseScene.js';

/**
 * BootScene - Initial loading scene
 * Handles asset preloading and transitions to MenuScene
 */
export class BootScene extends BaseScene {
    constructor() {
        super('BootScene');
        this.loadingBar = null;
        this.loadingText = null;
    }

    preload() {
        super.preload();
        
        // Create loading bar
        this.createLoadingBar();
        
        // Load Kenney assets
        this.loadKenneyAssets();
        
        // Load placeholder assets for now
        this.loadPlaceholderAssets();
    }

    create() {
        super.create();
        
        // Fade in effect
        this.fadeIn(1000);
        
        // Transition to MenuScene after a short delay
        this.time.delayedCall(2000, () => {
            this.transitionTo('MenuScene');
        });
    }

    /**
     * Create loading bar UI
     */
    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Loading bar background
        const barBg = this.add.rectangle(width / 2, height / 2 + 50, 400, 20, 0x333333);
        barBg.setStrokeStyle(2, 0xffffff);
        
        // Loading bar fill
        this.loadingBar = this.add.rectangle(width / 2 - 200, height / 2 + 50, 0, 16, 0x4a90e2);
        this.loadingBar.setOrigin(0, 0.5);
        
        // Loading text
        this.loadingText = this.createCenteredText(width / 2, height / 2 - 50, 'Loading Time Oddity...', {
            fontSize: '32px',
            color: '#ffffff'
        });
        
        // Progress text
        this.progressText = this.createCenteredText(width / 2, height / 2 + 100, '0%', {
            fontSize: '18px',
            color: '#cccccc'
        });
        
        // Update loading bar on progress
        this.load.on('progress', (value) => {
            this.loadingBar.width = 400 * value;
            this.progressText.setText(Math.round(value * 100) + '%');
        });
        
        // Complete loading
        this.load.on('complete', () => {
            this.progressText.setText('100%');
            this.loadingText.setText('Ready!');
        });
    }

    /**
     * Load Kenney assets
     */
    loadKenneyAssets() {
        // Load character spritesheet
        this.load.atlas(
            'characters',
            'src/assets/sprites/spritesheet-characters-default.png',
            'src/assets/sprites/spritesheet-characters-default.xml'
        );
        
        // Load tile spritesheet
        this.load.atlas(
            'tiles',
            'src/assets/sprites/spritesheet-tiles-default.png',
            'src/assets/sprites/spritesheet-tiles-default.xml'
        );
        
        // Load enemy spritesheet
        this.load.atlas(
            'enemies',
            'src/assets/sprites/spritesheet-enemies-default.png',
            'src/assets/sprites/spritesheet-enemies-default.xml'
        );
    }

    /**
     * Load placeholder assets
     */
    loadPlaceholderAssets() {
        // Create placeholder textures for testing
        this.createPlaceholderTextures();
    }

    /**
     * Create placeholder textures for testing
     */
    createPlaceholderTextures() {
        // Create a simple colored rectangle texture
        const graphics = this.add.graphics();
        graphics.fillStyle(0x4a90e2);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('placeholder', 32, 32);
        graphics.destroy();
        
        // Create a simple background texture
        const bgGraphics = this.add.graphics();
        bgGraphics.fillStyle(0x2c3e50);
        bgGraphics.fillRect(0, 0, 800, 600);
        bgGraphics.generateTexture('background', 800, 600);
        bgGraphics.destroy();
    }

    /**
     * Create character animations
     */
    createCharacterAnimations() {
        // Idle animation
        this.anims.create({
            key: 'character_idle',
            frames: this.anims.generateFrameNames('characters', {
                prefix: 'character_beige_',
                start: 1,
                end: 1,
                suffix: '.png'
            }),
            frameRate: 10,
            repeat: -1
        });

        // Walk animation
        this.anims.create({
            key: 'character_walk',
            frames: this.anims.generateFrameNames('characters', {
                prefix: 'character_beige_walk_',
                start: 1,
                end: 2,
                suffix: '.png'
            }),
            frameRate: 8,
            repeat: -1
        });

        // Jump animation
        this.anims.create({
            key: 'character_jump',
            frames: this.anims.generateFrameNames('characters', {
                prefix: 'character_beige_',
                start: 1,
                end: 1,
                suffix: '.png'
            }),
            frameRate: 10,
            repeat: 0
        });

        // Fall animation
        this.anims.create({
            key: 'character_fall',
            frames: this.anims.generateFrameNames('characters', {
                prefix: 'character_beige_',
                start: 1,
                end: 1,
                suffix: '.png'
            }),
            frameRate: 10,
            repeat: 0
        });
    }
}

export default BootScene; 