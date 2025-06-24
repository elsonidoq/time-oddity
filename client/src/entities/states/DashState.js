import { gsap } from 'gsap';

export default class DashState {
  constructor(player) {
    this.player = player;
    // Dash invariants:
    // - player.isDashing: true only during dash
    // - player.canDash: false during dash and cooldown, true after cooldown
    // - player.dashTimer: time when dash can be retried
  }

  enter() {
    // Guard condition: prevent dash if on cooldown
    if (!this.player.canDash) {
      // If we can't dash, transition back to idle state
      this.player.stateMachine.setState('idle');
      return;
    }
    
    const direction = this.player.flipX ? -1 : 1;
    this.player.body.setAllowGravity(false);
    this.player.body.setVelocityY(0); // Prevent vertical movement during dash
    this.dashStartTime = this.player.scene.time.now;
    this.player.canDash = false;
    this.hasDashed = true;
    this.player.isDashing = true;
    this.player.dashTimer = this.dashStartTime + this.player.dashCooldown;
    // Optionally play dash animation here

    // --- Ghost Trail Effect ---
    this.createGhostTrail();
  }

  /**
   * Creates the ghost trail effect using object pooling
   */
  createGhostTrail() {
    if (!this.player.ghostPool) return;
    
    // Create 3-5 ghost sprites with staggered timing
    const numGhosts = 4;
    const staggerDelay = 0.05; // 50ms between each ghost
    
    for (let i = 0; i < numGhosts; i++) {
      const ghost = this.player.ghostPool.get();
      if (!ghost) continue;
      
      // Ensure ghost sprite doesn't have physics body enabled
      if (ghost.body) {
        ghost.body.enable = false;
      }
      
      // Position ghost at player's current position
      ghost.setPosition(this.player.x, this.player.y)
        .setTexture(this.player.texture.key)
        .setFlipX(this.player.flipX)
        .setOrigin(0.5, 1) // Match player origin
        .setAlpha(0.7 - (i * 0.15)) // Fade each ghost slightly more
        .setScale(1.0 - (i * 0.05)); // Slightly scale down each ghost
      
      // Animate the ghost with staggered timing
      gsap.to(ghost, {
        alpha: 0,
        scale: 0.8,
        duration: 0.6,
        delay: i * staggerDelay,
        ease: 'power2.out',
        onComplete: () => {
          // Ensure proper cleanup when animation completes
          if (this.player.ghostPool && ghost) {
            // Double-check physics body is disabled before release
            if (ghost.body) {
              ghost.body.enable = false;
            }
            this.player.ghostPool.release(ghost);
          }
        }
      });
    }
  }

  execute() {
    const now = this.player.scene.time.now;
    const direction = this.player.flipX ? -1 : 1;
    const elapsed = now - this.dashStartTime;
    const dashDuration = this.player.dashDuration;
    const dashSpeed = this.player.dashSpeed;
    const blocked = (direction === 1 && this.player.body.blocked.right) || (direction === -1 && this.player.body.blocked.left);
    
    // Cooldown check: allow dash again after timer expires
    if (now >= this.player.dashTimer) {
      this.player.canDash = true;
    }
    
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
      // canDash will be set to true after cooldown in the check above
      // dashTimer is already set in enter()
      this.player.stateMachine.setState('idle');
      return;
    }
  }
} 