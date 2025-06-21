import BaseScene from './BaseScene';

export default class BootScene extends BaseScene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load minimal assets needed for loading screen
        // this.load.image('loading-bg', 'assets/images/loading-bg.png');
        // this.load.image('loading-bar', 'assets/images/loading-bar.png');
    }

    create() {
        // Set up any global game settings
        this.scale.setGameSize(800, 600);
        
        // Start the menu scene directly
        this.scene.start('MenuScene');
    }
} 