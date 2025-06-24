import Entity from './Entity.js';

/**
 * ChronoPulse - Time manipulation ability that emits a shockwave
 * Extends Entity to provide common functionality and physics integration
 */
export default class ChronoPulse extends Entity {
  constructor(scene, x, y, config = {}, gsapLib) {
    // Use a placeholder texture for the entity base
    super(scene, x, y, 'placeholder', 0, 100);
    
    // Make the entity invisible since it's just a container for the ability
    this.setVisible(false);
    
    // Ability configuration with defaults
    this.cooldown = config.cooldown || 3000; // 3 seconds default
    this.range = config.range || 150; // Default range in pixels
    this.duration = config.duration || 1000; // 1 second duration
    
    // Cooldown tracking
    this.lastActivationTime = 0;
    
    // Animation timeline reference
    this.animationTimeline = null;
    
    // Shockwave graphics object
    this.shockwaveGraphics = null;

    // Use injected gsapLib for testability, or require real gsap at runtime
    if (gsapLib) {
      this.gsapLib = gsapLib;
    } else {
      // Dynamically require gsap only if not provided
      // eslint-disable-next-line global-require
      this.gsapLib = require('gsap');
    }
  }

  /**
   * Activate the Chrono Pulse ability
   * @returns {boolean} - True if ability was activated, false if on cooldown
   */
  activate() {
    if (!this.canActivate()) {
      return false;
    }

    // Update activation time
    this.lastActivationTime = this.scene.time.now;
    this.isActive = true;
    // Create shockwave visual effect
    this.createShockwaveEffect();
    
    return true;
  }

  /**
   * Check if the ability can be activated (not on cooldown)
   * @returns {boolean} - True if ability can be activated
   */
  canActivate() {
    if (this.cooldown === 0) return true;
    const currentTime = this.scene.time.now;
    return currentTime - this.lastActivationTime >= this.cooldown;
  }

  /**
   * Create the visual shockwave effect using GSAP
   */
  createShockwaveEffect() {
    // Clean up any previous animation before creating a new one
    this.cleanupAnimation();
    this.animationTimeline = null;
    
    // Create graphics object for the shockwave
    this.shockwaveGraphics = this.scene.add.graphics();
    
    // Set the origin point for the graphics object to match the pulse position
    this.shockwaveGraphics.setPosition(this.x, this.y);
    
    // Draw the initial shockwave circle with more visible styling
    this.shockwaveGraphics.lineStyle(4, 0x00ffff, 1); // Cyan color, thicker line
    this.shockwaveGraphics.strokeCircle(0, 0, 20); // Larger initial circle
    
    // Add a fill for better visibility
    this.shockwaveGraphics.fillStyle(0x00ffff, 0.3); // Semi-transparent cyan fill
    this.shockwaveGraphics.fillCircle(0, 0, 20);
    
    console.log('[ChronoPulse] Created shockwave at position:', this.x, this.y);
    
    // Create GSAP timeline for the shockwave animation
    this.animationTimeline = this.gsapLib.timeline({
      onComplete: () => {
        console.log('[ChronoPulse] Animation completed, cleaning up');
        this.cleanupAnimation();
      }
    });
    
    // Animate the shockwave expanding outward
    this.animationTimeline.to(this.shockwaveGraphics, {
      scale: this.range / 20, // Scale to match the range (adjusted for initial size)
      alpha: 0,
      duration: this.duration / 1000, // Convert to seconds for GSAP
      ease: 'power2.out'
    });
    
    console.log('[ChronoPulse] Animation timeline created with duration:', this.duration / 1000);
  }

  /**
   * Clean up animation resources
   */
  cleanupAnimation() {
    if (this.animationTimeline) {
      this.animationTimeline.kill();
      this.animationTimeline = null;
    }
    if (this.shockwaveGraphics) {
      this.shockwaveGraphics.destroy();
      this.shockwaveGraphics = null;
    }
  }

  /**
   * Detect enemies that overlap with the pulse range
   * @param {Array} enemies - Array of enemy objects to check
   * @returns {Array} - Array of enemies that overlap with the pulse
   */
  detectOverlaps(enemies) {
    if (!enemies || enemies.length === 0) {
      return [];
    }

    const overlappedEnemies = [];
    
    enemies.forEach(enemy => {
      if (!enemy.isActive) {
        return; // Skip inactive enemies
      }
      
      // Calculate distance between pulse center and enemy
      const distance = Math.sqrt(
        Math.pow(this.x - enemy.x, 2) + Math.pow(this.y - enemy.y, 2)
      );
      
      // Check if enemy is within range
      if (distance <= this.range) {
        overlappedEnemies.push(enemy);
      }
    });
    
    return overlappedEnemies;
  }

  /**
   * Override destroy method to clean up resources
   */
  destroy() {
    this.cleanupAnimation();
    super.destroy();
  }

  /**
   * Get the current cooldown status
   * @returns {Object} - Object with remaining cooldown time and percentage
   */
  getCooldownStatus() {
    const currentTime = this.scene.time.now;
    const timeSinceActivation = currentTime - this.lastActivationTime;
    const remainingCooldown = Math.max(0, this.cooldown - timeSinceActivation);
    const cooldownPercentage = (remainingCooldown / this.cooldown) * 100;
    
    return {
      remaining: remainingCooldown,
      percentage: cooldownPercentage,
      canActivate: remainingCooldown === 0
    };
  }
} 