/**
 * IdleState.js - The player's idle state.
 */
export class IdleState {
    constructor(player) {
        this.player = player;
    }

    enter() {
        console.log('Entering IdleState');
        this.player.anims.play('idle', true);
        this.player.setVelocityX(0);
    }

    execute() {
        if (this.player.inputManager.isJumpJustDown() && this.player.body.onFloor()) {
            this.player.stateMachine.changeState('jump');
            return;
        }

        if (this.player.inputManager.isLeft() || this.player.inputManager.isRight()) {
            this.player.stateMachine.changeState('run', { direction: this.player.inputManager.isLeft() ? 'left' : 'right' });
            return;
        }
        
        if (!this.player.body.onFloor()) {
            this.player.stateMachine.changeState('fall');
        }
    }

    exit() {
        console.log('Exiting IdleState');
    }
}

export default IdleState; 