/**
 * Player Idle State.
 * See Section 7.2 "Player State Machine Definition" in the comprehensive documentation.
 */
export default class IdleState {
  constructor(player) {
    this.player = player;
  }

  enter() {
    // Stop any horizontal movement
    this.player.body.setVelocityX(0);
    // Play the idle animation
    this.player.anims.play('player-idle', true);
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
    // Use enhanced floor detection for moving platform stability
    const isOnFloor = this.player.isOnFloorEnhanced ? this.player.isOnFloorEnhanced() : body.onFloor();
    if (!isOnFloor) {
      this.player.stateMachine.setState('fall');
      return;
    }

    // Transition to JumpState if jump is pressed
    if (inputManager && inputManager.isUpPressed) {
      this.player.stateMachine.setState('jump');
      return;
    }
    
    // Transition to RunState if moving left or right
    if (inputManager && (inputManager.isLeftPressed || inputManager.isRightPressed)) {
      if (!this.player.isDashing) {
        this.player.stateMachine.setState('run');
      }
      return;
    }
  }
} 