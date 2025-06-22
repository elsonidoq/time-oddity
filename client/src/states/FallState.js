/**
 * FallState.js - The player's falling state.
 */
export class FallState {
    constructor(player) {
        this.player = player;
    }

    enter() {
        console.log('Entering FallState');
        this.player.anims.play('fall', true);
    }

    execute() {
        if (this.player.body.onFloor()) {
            if (this.player.inputManager.isLeft() || this.player.inputManager.isRight()) {
                this.player.stateMachine.changeState('run', { direction: this.player.inputManager.isLeft() ? 'left' : 'right' });
            } else {
                this.player.stateMachine.changeState('idle');
            }
        }
    }

    exit() {
        console.log('Exiting FallState');
    }
}

export default FallState; 