import Entity from './Entity.js';
import StateMachine from '../systems/StateMachine.js';
import IdleState from './states/IdleState.js';
import RunState from './states/RunState.js';
import JumpState from './states/JumpState.js';
import FallState from './states/FallState.js';
import DashState from './states/DashState.js';
import ObjectPool from '../systems/ObjectPool.js';
import ChronoPulse from './ChronoPulse.js';
import gsap from 'gsap';

/**
 * Player class for the main player character
 * Extends Entity and adds player-specific properties and a state machine.
 */
export default class Player extends Entity {
  constructor(scene, x, y, texture, frame, health = 100, mockScene = null) {
    super(scene, x, y, texture, frame, health, mockScene);
    
    // Set origin to bottom-center for accurate positioning on platforms
    this.setOrigin(0.5, 1);
    
    // Adjust the physics body to be tighter around the player
    // This ignores some of the empty helmet space and makes for better collisions.
    this.body.setSize(this.width * 0.5, this.height * 0.7);
    this.body.setOffset(this.width * 0.25, this.height * 0.3);
    
    // Player-specific properties
    this.speed = 200;
    this.jumpPower = 800;
    this.gravity = 980; // This might be redundant if world gravity is set
    this.inputManager = null; // Will be set up later

    // Dash properties
    this.dashCooldown = 1000; // ms - 1 second default cooldown
    this.dashDuration = 120; // ms
    this.dashSpeed = 1000; // px/sec
    this.dashTimer = 0;
    this.canDash = true;
    this.isDashing = false;

    // Ghost trail properties
    this.ghostPool = null;
    this.setupGhostPool();

    // Chrono Pulse ability
    this.chronoPulse = new ChronoPulse(scene, x, y, { cooldown: 3000, range: 150, duration: 1000 }, gsap);

    // State Machine Setup
    this.stateMachine = new StateMachine();
    this.stateMachine
      .addState('idle', new IdleState(this))
      .addState('run', new RunState(this))
      .addState('jump', new JumpState(this))
      .addState('fall', new FallState(this))
      .addState('dash', new DashState(this));
      
    this.stateMachine.setState('idle');

    // Track previous rewind state
    this._wasRewinding = false;
  }

  /**
   * Sets up the ghost pool for dash trail effects
   */
  setupGhostPool() {
    if (!this.scene || !this.scene.add) return;
    
    // Create a group for ghost sprites
    const ghostGroup = this.scene.add.group();
    
    // Create initial ghost sprites (5 ghosts for the pool)
    for (let i = 0; i < 5; i++) {
      const ghost = this.scene.add.sprite(0, 0, this.texture.key);
      ghost.setActive(false).setVisible(false);
      ghost.setOrigin(0.5, 1); // Match player origin
      
      // Ensure ghost sprites don't have physics bodies enabled
      if (ghost.body) {
        ghost.body.enable = false;
      }
      
      ghostGroup.add(ghost);
    }
    
    // Factory function for creating new ghost sprites
    const ghostFactory = () => {
      const ghost = this.scene.add.sprite(0, 0, this.texture.key);
      ghost.setOrigin(0.5, 1);
      
      // Ensure new ghost sprites don't have physics bodies enabled
      if (ghost.body) {
        ghost.body.enable = false;
      }
      
      return ghost;
    };
    
    // Create the object pool
    this.ghostPool = new ObjectPool(ghostGroup, ghostFactory);
  }

  /**
   * The update loop for the player, called by the scene.
   * @param {number} time - The current time.
   * @param {number} delta - The delta time in ms since the last frame.
   */
  update(time, delta) {
    const isRewinding = this.scene.timeManager && this.scene.timeManager.isRewinding;
    let justEndedRewind = false;
    if (this._wasRewinding && !isRewinding) {
      justEndedRewind = true;
      if (this.inputManager) {
        const left = this.inputManager.left && this.inputManager.left.isDown;
        const right = this.inputManager.right && this.inputManager.right.isDown;
        if (left || right) {
          this.stateMachine.setState('run');
        } else {
          this.stateMachine.setState('idle');
        }
      }
    }
    this._wasRewinding = isRewinding;
    if (isRewinding) {
      return;
    }
    if (justEndedRewind) {
      // Skip normal update this frame to avoid overriding forced state
      return;
    }
    if (this.inputManager) {
      this.stateMachine.update(time, delta);
      
      // Update ChronoPulse position to follow player
      if (this.chronoPulse) {
        this.chronoPulse.setPosition(this.x, this.y);
      }
      
      // Handle Chrono Pulse input
      if (this.inputManager.isChronoPulseJustPressed && this.chronoPulse) {
        console.log('[Player] Chrono Pulse activated at position:', this.x, this.y);
        const activated = this.chronoPulse.activate();
        console.log('[Player] Chrono Pulse activation result:', activated);
      }
    }
  }

  // Testing helper method to simulate DashState.execute() cooldown logic
  simulateDashStateExecute() {
    const now = this.scene.time.now;
    // Cooldown check: allow dash again after timer expires
    if (now >= this.dashTimer) {
      this.canDash = true;
    }
  }
} 