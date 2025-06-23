export default class DashState {
  constructor(player) {
    this.player = player;
    // Dash invariants:
    // - player.isDashing: true only during dash
    // - player.canDash: false during dash and cooldown, true after cooldown
    // - player.dashTimer: time when dash can be retried
  }

  enter() {
    const direction = this.player.flipX ? -1 : 1;
    this.player.body.setAllowGravity(false);
    this.player.body.setVelocityY(0); // Prevent vertical movement during dash
    this.dashStartTime = this.player.scene.time.now;
    this.player.canDash = false;
    this.hasDashed = true;
    this.player.isDashing = true;
    this.player.dashTimer = this.dashStartTime + this.player.dashCooldown;
    // Optionally play dash animation here
  }

  execute() {
    const now = this.player.scene.time.now;
    const direction = this.player.flipX ? -1 : 1;
    const elapsed = now - this.dashStartTime;
    const dashDuration = this.player.dashDuration;
    const dashSpeed = this.player.dashSpeed;
    const blocked = (direction === 1 && this.player.body.blocked.right) || (direction === -1 && this.player.body.blocked.left);
    // Quadratic velocity profile: v = Vmax * (1 - ((2t/T - 1)^2))
    // t = elapsed, T = dashDuration
    let velocity = 0;
    if (elapsed < dashDuration && !blocked) {
      const t = Math.max(0, Math.min(elapsed, dashDuration));
      const T = dashDuration;
      const norm = (2 * t / T) - 1; // -1 to 1
      const quad = 1 - norm * norm; // 0 at start/end, 1 at middle
      velocity = direction * dashSpeed * quad;
      this.player.body.setVelocityX(velocity);
    }
    // Dash end: restore all invariants
    if (elapsed >= dashDuration || blocked) {
      this.player.body.setVelocityX(0);
      this.player.body.setAllowGravity(true);
      this.player.isDashing = false; // invariant: not dashing after dash ends
      // canDash will be set to true after cooldown
      // dashTimer is already set in enter()
      this.player.stateMachine.setState('idle');
      return;
    }
    // Cooldown: allow dash again after timer
    if (now >= this.player.dashTimer) {
      this.player.canDash = true;
    }
  }
} 