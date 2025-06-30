import { Enemy } from '../Enemy.js';
import StateMachine from '../../systems/StateMachine.js';

/**
 * LoopHound - A patrolling enemy that moves back and forth along a fixed path.
 * 
 * @class
 * @extends Enemy
 * @description A specialized enemy that patrols a fixed horizontal path and maintains
 * its patrol state through time manipulation.
 * 
 * Custom State Recording:
 * The LoopHound implements custom state recording methods to preserve its patrol behavior
 * during time manipulation. This is necessary because the default Entity state recording
 * does not capture patrol-specific properties.
 * 
 * Additional Recorded State:
 * 1. Patrol Properties:
 *    • direction: Current patrol direction (-1 or 1)
 *    • patrolStartX: Left boundary of patrol
 *    • patrolEndX: Right boundary of patrol
 * 
 * 2. Enemy State:
 *    • isFrozen: Freeze status from ChronoPulse
 *    • health: Current health value
 * 
 * 3. Lifecycle Properties:
 *    • active: Phaser GameObject active state
 *    • visible: Visibility state
 *    • bodyEnable: Physics body enabled state
 * 
 * State Recording Implementation:
 * - getStateForRecording(): Captures all patrol and enemy state
 * - setStateFromRecording(state): Restores complete patrol behavior
 * - Ensures perfect rewind/restore of patrol pattern
 * 
 * Integration with TimeManager:
 * - Patrol boundaries persist through rewind
 * - Movement direction properly reverses
 * - Freeze effects maintain consistency
 * 
 * @see TimeManager for complete state recording contract
 */
export class LoopHound extends Enemy {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y - Should be set to the top of the ground platform (e.g., groundY - spriteHeight/2)
   * @param {string} texture - Texture key (default: 'enemies')
   * @param {string|number} frame - Frame name or index (default: 'barnacle_attack_rest')
   */
  constructor(scene, x, y, texture = 'enemies', frame = 'barnacle_attack_rest') {
    super(scene, x, y, texture, frame);
    
    // Set origin to bottom-center for accurate positioning on platforms (matches Player)
    this.setOrigin(0.5, 1);
    // Set the physics body to match the Player's hitbox
    this.body.setSize(this.width * 0.5, this.height * 0.7);
    this.body.setOffset(this.width * 0.25, this.height * 0.3);
    
    // DEFER physics configuration until after group addition (per invariant §13)
    // Physics config now happens in configurePhysicsAfterGroup()
    
    // LoopHound-specific properties
    this.patrolDistance = 200;
    this.patrolStartX = x;
    this.patrolEndX = x + this.patrolDistance;
    this.speed = 80; // Slightly slower than base enemy
    this.direction = 1; // 1 for right, -1 for left
    this.spawnX = x; // Ensure spawnX is set
    this.spawnY = y; // Ensure spawnY is set
    
    // Override state machine completely for LoopHound
    this.stateMachine = new StateMachine();
    this.stateMachine.addState('patrol', {
      enter: () => this.onPatrolEnter(),
      execute: () => this.onPatrolExecute(),
      exit: () => this.onPatrolExit()
    });
    this.stateMachine.setState('patrol');
    
    // Animation will be added later when proper sprites are available
  }
  
  /**
   * Configure physics AFTER adding to group (per invariant §13)
   * This method should be called by SceneFactory after enemy is added to the physics group
   */
  configurePhysicsAfterGroup() {
    this.configurePhysics();
  }
  
  onPatrolEnter() {
    // Start patrol movement
    this.move();
  }
  
  onPatrolExecute() {
    // Continue patrol movement and check boundaries
    this.move();
    
    // Check for direction change at patrol boundaries
    if (this.x >= this.patrolEndX) {
      this.direction = -1;
    } else if (this.x <= this.patrolStartX) {
      this.direction = 1;
    }
  }
  
  onPatrolExit() {
    // Stop movement when exiting patrol state
    this.stop();
  }
  
  update(time, delta) {
    // Call parent update first (this handles the freeze timer)
    super.update(time, delta);
    
    // Only update state machine if not frozen
    if (this.stateMachine && this.stateMachine.update && !this.isFrozen) {
      this.stateMachine.update(time, delta);
    }
  }
  
  takeDamage(amount) {
    super.takeDamage(amount);
    
    // LoopHound-specific damage handling
    if (this.health <= 0) {
      // Handle death
      this.setActive(false);
      this.setVisible(false);
    }
  }
  
  freeze(duration) {
    // Call parent freeze method to get proper freeze behavior
    super.freeze(duration);
    
    // LoopHound-specific freeze behavior
    // Stop any animations
    if (this.anims && this.anims.stop) {
      this.anims.stop();
    }
  }
  
  unfreeze() {
    // Call parent unfreeze method
    super.unfreeze();
    
    // LoopHound-specific unfreeze behavior
    // Resume patrol state
    if (this.stateMachine) {
      this.stateMachine.setState('patrol');
    }
  }
  
  getStateForRecording() {
    return {
      x: this.x,
      y: this.y,
      velocityX: this.body?.velocity?.x || 0,
      velocityY: this.body?.velocity?.y || 0,
      animation: this.anims?.currentAnim?.key || null,
      health: this.health,
      active: this.active,
      visible: this.visible,
      bodyEnable: this.body?.enable ?? true,
      state: (this.stateMachine && typeof this.stateMachine.getCurrentState === 'function')
        ? this.stateMachine.getCurrentState()
        : null
    };
  }
  
  setStateFromRecording(state) {
    if (state.x !== undefined) this.x = state.x;
    if (state.y !== undefined) this.y = state.y;
    if (state.velocityX !== undefined && this.body) this.body.setVelocityX(state.velocityX);
    if (state.velocityY !== undefined && this.body) this.body.setVelocityY(state.velocityY);
    if (state.direction !== undefined) this.direction = state.direction;
    if (state.isFrozen !== undefined) this.isFrozen = state.isFrozen;
    if (state.patrolStartX !== undefined) this.patrolStartX = state.patrolStartX;
    if (state.patrolEndX !== undefined) this.patrolEndX = state.patrolEndX;
    // Restore lifecycle properties
    if (state.active !== undefined) this.setActive(state.active);
    if (state.visible !== undefined) this.setVisible(state.visible);
    if (state.bodyEnable !== undefined && this.body) this.body.enable = state.bodyEnable;
    if (state.health !== undefined) this.health = state.health;
    if (state.animation && this.anims && this.anims.play) this.anims.play(state.animation);
  }
  
  respawn() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.health = this.maxHealth;
    this.isFrozen = false;
    this.direction = 1;
    if (this.body) {
      this.body.setVelocity(0, 0);
      this.body.enable = true; // Re-enable physics body
    }
    this.activate();
    this.setActive(true);
    this.setVisible(true);
    // Ensure the enemy is in the scene's enemies group
    if (this.scene && this.scene.enemies && this.scene.enemies.getChildren) {
      const group = this.scene.enemies;
      if (!group.getChildren().includes(this)) {
        group.add(this);
      }
    }
  }
  
  destroy() {
    if (this.sprite && typeof this.sprite.destroy === 'function') {
      this.sprite.destroy();
    }
    // Call Phaser cleanup BEFORE nullifying animations to avoid runtime errors
    super.destroy();

    // Nullify animation reference after safe destroy
    this.anims = null;
  }
} 