export default class DashState {
  constructor(player) {
    this.player = player;
    this.dashSpeed = 1000; // px/sec
    this.dashDuration = 120; // ms
    this.dashStartTime = 0;
  }

  enter() {
    const direction = this.player.flipX ? -1 : 1;
    this.player.body.setAllowGravity(false);
    this.player.body.setVelocityY(0); // Prevent vertical movement during dash
    this.player.body.setVelocityX(direction * this.dashSpeed);
    this.dashStartTime = this.player.scene.time.now;
    this.player.canDash = false;
    this.hasDashed = true;
    this.player.isDashing = true;
    // Optionally play dash animation here
  }

  execute() {
    // Debug output
    const now = this.player.scene.time.now;
    const direction = this.player.flipX ? -1 : 1;
    const blocked = (direction === 1 && this.player.body.blocked.right) || (direction === -1 && this.player.body.blocked.left);
    if (now - this.dashStartTime >= this.dashDuration || blocked) {
      this.player.body.setVelocityX(0);
      this.player.body.setAllowGravity(true);
      this.player.canDash = false;
      this.player.dashTimer = now + this.player.dashCooldown;
      this.player.isDashing = false;
      this.player.stateMachine.setState('idle');
      return;
    }
    // If dash cooldown expired, allow dash again
    if (now >= this.player.dashTimer) {
      this.player.canDash = true;
    }
  }
} 