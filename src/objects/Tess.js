export default class Tess extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y) {
        super(scene, x, y, 32, 48, 0x0066ff); // Blue rectangle, 32x48 pixels
        
        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set up physics body
        this.body.setBounce(0.2);
        this.body.setCollideWorldBounds(true);
        
        // Store reference to scene for input handling
        this.scene = scene;
        
        // Initialize movement properties
        this.moveSpeed = 160;
        this.jumpVelocity = -330;
        
        // Set up input
        this.cursors = scene.input.keyboard.createCursorKeys();
    }
    
    update() {
        // Handle horizontal movement
        if (this.cursors.left.isDown) {
            this.body.setVelocityX(-this.moveSpeed);
        } else if (this.cursors.right.isDown) {
            this.body.setVelocityX(this.moveSpeed);
        } else {
            this.body.setVelocityX(0);
        }
        
        // Handle jumping
        if (this.cursors.up.isDown && this.body.touching.down) {
            this.body.setVelocityY(this.jumpVelocity);
        }
    }
} 