/**
 * InputManager.js - A system for handling player input
 */
export class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = {
            w: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            a: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            s: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            d: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };
    }

    isLeft() {
        return this.cursors.left.isDown || this.keys.a.isDown;
    }

    isRight() {
        return this.cursors.right.isDown || this.keys.d.isDown;
    }

    isUp() {
        return this.cursors.up.isDown || this.keys.w.isDown;
    }

    isDown() {
        return this.cursors.down.isDown || this.keys.s.isDown;
    }
    
    isJumpJustDown() {
        return Phaser.Input.Keyboard.JustDown(this.cursors.space) || Phaser.Input.Keyboard.JustDown(this.keys.w) || Phaser.Input.Keyboard.JustDown(this.cursors.up);
    }
    
    isJumpUp() {
        return Phaser.Input.Keyboard.Up(this.cursors.space) || Phaser.Input.Keyboard.Up(this.keys.w) || Phaser.Input.Keyboard.Up(this.cursors.up);
    }
}

export default InputManager; 