/**
 * JumpState.js - The player's jumping state.
 */
export class JumpState {
    constructor(player) {
        this.player = player;
    }

    enter() {
        console.log('Entering JumpState');
        this.player.anims.play('jump', true);
        this.player.setVelocityY(-this.player.jumpPower);
    }

    execute() {
        if (this.player.inputManager.isJumpUp() && this.player.body.velocity.y < 0) {
            this.player.setVelocityY(this.player.body.velocity.y * 0.5);
        }

        if (this.player.body.velocity.y >= 0) {
            this.player.stateMachine.changeState('fall');
        }
    }

    exit() {
        console.log('Exiting JumpState');
    }
}

export default JumpState; 