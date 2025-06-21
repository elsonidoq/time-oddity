import Tess from '../../../objects/Tess.js';
import TimeManager from '../../../systems/TimeManager.js';
import SecondHander from '../../../objects/SecondHander.js';

export default class Act1Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Act1Scene' });
        this.tess = null;
        this.ground = null;
        this.platforms = null;
        this.timeManager = null;
        this.secondHander = null;
    }

    create() {
        console.log('Act1Scene loaded');
        this.scene.launch('ClockHUD');
        this.timeManager = new TimeManager(this);
        
        // Create platforms group
        this.platforms = this.physics.add.staticGroup();
        
        // Create ground platform
        this.ground = this.add.rectangle(400, 550, 800, 100, 0x8B4513); // Brown ground
        this.physics.add.existing(this.ground, true); // true = static body
        this.platforms.add(this.ground);
        
        // Add additional platform for collision testing
        const testPlatform = this.add.rectangle(600, 400, 200, 20, 0x228B22); // Green platform
        this.physics.add.existing(testPlatform, true);
        this.platforms.add(testPlatform);
        
        // Add wall platform
        const wallPlatform = this.add.rectangle(200, 300, 20, 200, 0x8B0000); // Red wall
        this.physics.add.existing(wallPlatform, true);
        this.platforms.add(wallPlatform);
        
        // Create Tess character
        this.tess = new Tess(this, 100, 100);

        // Create SecondHander enemy
        this.secondHander = new SecondHander(this, 400, 300);
        
        // Set up collision between Tess and all platforms
        this.physics.add.collider(this.tess, this.platforms);

        // Set up physics for the enemy
        this.physics.add.existing(this.secondHander);
        this.physics.add.collider(this.secondHander, this.platforms);
        
        // Add placeholder object (red square)
        this.add.rectangle(500, 200, 50, 50, 0xFF0000); // Red square placeholder
        
        // Add scene title
        this.add.text(16, 16, 'Act 1 Scene', {
            fontSize: '32px',
            fill: '#ffffff'
        });

        // Listen for 'P' key press to toggle pause
        this.input.keyboard.on('keydown-P', () => {
            const success = this.timeManager.togglePause();
            if (success) {
                this.tweens.add({
                    targets: this.tess,
                    alpha: 0.5,
                    duration: 100,
                    yoyo: true
                });
            }
        });
    }
    
    update() {
        // Update Tess movement
        if (this.tess) {
            this.tess.update();
        }

        // Update SecondHander movement
        if (this.secondHander) {
            this.secondHander.update();
        }
    }
} 