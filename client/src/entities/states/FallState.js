/**
 * Player Fall State.
 * See Section 7.2 "Player State Machine Definition" in the comprehensive documentation.
 */
export default class FallState {
  constructor(player) {
    this.player = player;
  }

  enter() {
    this.player.anims.play('player-fall', true);
  }

  execute() {
    const { inputManager, body, speed, stateMachine } = this.player;

    // Transition to IdleState when on the ground
    if (body.onFloor()) {
      stateMachine.setState('idle');
      return;
    }

    // Handle horizontal movement
    if (!this.player.isDashing) {
      if (inputManager && inputManager.isLeftPressed) {
        body.setVelocityX(-speed);
        this.player.flipX = true;
      } else if (inputManager && inputManager.isRightPressed) {
        body.setVelocityX(speed);
        this.player.flipX = false;
      } else {
        body.setVelocityX(0);
      }
    }
  }
} 