import { Enemy } from '../Enemy.js';
import StateMachine from '../../systems/StateMachine.js';

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
    
    // Configure physics properly using parent method
    this.configurePhysics();
    
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
    // Call parent update first
    super.update(time, delta);
    
    // Handle freeze timer
    if (this.isFrozen) {
      if (this.freezeTimer > 0) {
        this.freezeTimer -= delta;
        if (this.freezeTimer <= 0) {
          this.unfreeze();
        }
        return; // Don't move while frozen
      } else {
        this.unfreeze();
      }
    }
    
    // Update state machine (movement is handled by patrol state)
    if (this.stateMachine && this.stateMachine.update && !this.isFrozen) {
      this.stateMachine.update(time, delta);
    }
  }
  
  takeDamage(amount) {
    super.takeDamage(amount);
    
    // LoopHound-specific damage handling
    if (this.health <= 0) {
      // Handle death
      this.sprite.setActive(false);
      this.sprite.setVisible(false);
    }
  }
  
  freeze(duration) {
    this.isFrozen = true;
    this.freezeTimer = duration;
    if (this.anims && this.anims.stop) {
      this.anims.stop();
    }
  }
  
  unfreeze() {
    this.isFrozen = false;
    this.freezeTimer = 0;
  }
  
  getStateForRecording() {
    return {
      x: this.x,
      y: this.y,
      vx: this.body ? this.body.velocity.x : 0,
      vy: this.body ? this.body.velocity.y : 0,
      direction: this.direction,
      isFrozen: this.isFrozen,
      state: this.stateMachine ? this.stateMachine.getCurrentState() : 'patrol',
      patrolStartX: this.patrolStartX,
      patrolEndX: this.patrolEndX
    };
  }
  
  setStateFromRecording(state) {
    if (state.x !== undefined) this.x = state.x;
    if (state.y !== undefined) this.y = state.y;
    if (state.vx !== undefined && this.body) this.body.setVelocityX(state.vx);
    if (state.vy !== undefined && this.body) this.body.setVelocityY(state.vy);
    if (state.direction !== undefined) this.direction = state.direction;
    if (state.isFrozen !== undefined) this.isFrozen = state.isFrozen;
    if (state.patrolStartX !== undefined) this.patrolStartX = state.patrolStartX;
    if (state.patrolEndX !== undefined) this.patrolEndX = state.patrolEndX;
  }
  
  respawn() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.health = this.maxHealth;
    this.isFrozen = false;
    this.freezeTimer = 0;
    this.direction = 1;
    if (this.body) {
      this.body.setVelocity(0, 0);
    }
  }
  
  destroy() {
    if (this.sprite && this.sprite.destroy) {
      this.sprite.destroy();
    }
    this.anims = null;
    super.destroy();
  }
} 