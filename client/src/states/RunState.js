/**
 * RunState.js - The player's running state.
 */
export class RunState {
    constructor(player) {
        this.player = player;
    }

    enter(data) {
        console.log('Entering RunState');
        this.player.anims.play('walk', true);
        this.direction = data.direction;
    }

    execute() {
        if (this.player.inputManager.isJumpJustDown() && this.player.body.onFloor()) {
            this.player.stateMachine.changeState('jump');
            return;
        }

        if (!this.player.inputManager.isLeft() && !this.player.inputManager.isRight()) {
            this.player.stateMachine.changeState('idle');
            return;
        }

        if (this.player.inputManager.isLeft()) {
            this.player.setVelocityX(-this.player.speed);
            this.player.flipX = true;
        } else if (this.player.inputManager.isRight()) {
            this.player.setVelocityX(this.player.speed);
            this.player.flipX = false;
        }
        
        if (!this.player.body.onFloor()) {
            this.player.stateMachine.changeState('fall');
        }
    }

    exit() {
        console.log('Exiting RunState');
        this.player.setVelocityX(0);
    }
}

export default RunState; 