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
    const { inputManager, body, dashTimer } = this.player;
    const now = this.player.scene.time.now;

    // Dash cooldown invariant: allow dash again after cooldown
    if (now >= dashTimer) {
      this.player.canDash = true;
    }

    // PRIORITIZE DASH
    if (inputManager && inputManager.isDashJustPressed && this.player.canDash) {
      this.player.stateMachine.setState('dash');
      return;
    }

    // Transition to FallState if not on the ground
    if (!body.onFloor()) {
      this.player.stateMachine.setState('fall');
      return;
    }

    // Transition to IdleState if not moving
    if (inputManager && !inputManager.isLeftPressed && !inputManager.isRightPressed) {
      this.player.stateMachine.setState('idle');
      return;
    }

    // Transition to JumpState if jump is pressed
    if (inputManager && inputManager.isUpPressed) {
      this.player.stateMachine.setState('jump');
      return;
    }

    // Handle horizontal movement
    if (!this.player.isDashing) {
      if (inputManager && inputManager.isLeftPressed) {
        body.setVelocityX(-this.player.speed);
        this.player.flipX = true;
      } else if (inputManager && inputManager.isRightPressed) {
        body.setVelocityX(this.player.speed);
        this.player.flipX = false;
      }
    }
  }
} 