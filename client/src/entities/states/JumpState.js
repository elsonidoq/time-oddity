/**
 * Player Jump State.
 * See Section 7.2 "Player State Machine Definition" in the comprehensive documentation.
 */
export default class JumpState {
  constructor(player) {
    this.player = player;
  }

  enter() {
    this.player.anims.play('player-jump', true);
    this.player.body.setVelocityY(-this.player.jumpPower);
    
    // Task 06.02.2: Play jump sound effect
    if (this.player.scene.audioManager) {
      this.player.scene.audioManager.playSfx('jump');
    }
  }

  execute() {
    const { inputManager, body, speed, stateMachine, dashTimer } = this.player;
    const now = this.player.scene.time.now;

    // Dash cooldown invariant: allow dash again after cooldown
    if (now >= dashTimer) {
      this.player.canDash = true;
    }

    // Transition to FallState when moving downwards
    if (body.velocity.y >= 0) {
      stateMachine.setState('fall');
      return;
    }

    // Allow variable jump height by cutting velocity on jump key release
    if (inputManager && inputManager.isJumpJustReleased && body.velocity.y < 0) {
      body.setVelocityY(body.velocity.y * 0.5);
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