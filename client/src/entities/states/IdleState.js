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
    const { inputManager, body } = this.player;

    // Transition to FallState if not on the ground
    if (!body.onFloor()) {
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
      this.player.stateMachine.setState('run');
      return;
    }
  }
} 