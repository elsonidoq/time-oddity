export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Title
        const title = this.add.text(width / 2, height / 3, 'TIME ODDITY', {
            fontSize: '48px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        title.setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(width / 2, height / 3 + 60, 'A Temporal Adventure', {
            fontSize: '24px',
            fill: '#cccccc',
            fontFamily: 'Arial'
        });
        subtitle.setOrigin(0.5);

        // Start button
        const startButton = this.add.text(width / 2, height / 2 + 50, 'START GAME', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        });
        startButton.setOrigin(0.5);
        startButton.setInteractive();

        // Button hover effects
        startButton.on('pointerover', () => {
            startButton.setStyle({ fill: '#ffff00' });
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ fill: '#ffffff' });
        });

        startButton.on('pointerdown', () => {
            this.scene.start('Act1Scene');
        });

        // Instructions
        const instructions = this.add.text(width / 2, height - 100, 'Use ARROW KEYS to move, SPACE to jump', {
            fontSize: '16px',
            fill: '#888888',
            fontFamily: 'Arial'
        });
        instructions.setOrigin(0.5);

        // Add some visual flair with GSAP
        if (window.gsap) {
            window.gsap.from(title, { duration: 1, y: -50, alpha: 0, ease: "power2.out" });
            window.gsap.from(subtitle, { duration: 1, y: 50, alpha: 0, ease: "power2.out", delay: 0.3 });
            window.gsap.from(startButton, { duration: 0.8, scale: 0, ease: "back.out(1.7)", delay: 0.6 });
        }
    }
} 