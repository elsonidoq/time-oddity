/**
 * Player Run State.
 * See Section 7.2 "Player State Machine Definition" in the comprehensive documentation.
 */
export default class RunState {
  constructor(player) {
    this.player = player;
  }

  enter() {
    this.player.anims.play('player-walk', true);
  }

  execute() {
    const { inputManager, body, speed, stateMachine } = this.player;

    // Transition to FallState if not on the ground
    if (!body.onFloor()) {
      stateMachine.setState('fall');
      return;
    }

    // Transition to JumpState if jump is pressed
    if (inputManager && inputManager.isUpPressed) {
      stateMachine.setState('jump');
      return;
    }

    // Handle horizontal movement
    if (inputManager && inputManager.isLeftPressed) {
      body.setVelocityX(-speed);
      this.player.flipX = true;
    } else if (inputManager && inputManager.isRightPressed) {
      body.setVelocityX(speed);
      this.player.flipX = false;
    } else {
      // Transition to IdleState if no horizontal movement
      stateMachine.setState('idle');
    }
  }
} 