import Entity from './Entity.js';
import StateMachine from '../systems/StateMachine.js';
import IdleState from './states/IdleState.js';
import RunState from './states/RunState.js';
import JumpState from './states/JumpState.js';
import FallState from './states/FallState.js';

/**
 * Player class for the main player character
 * Extends Entity and adds player-specific properties and a state machine.
 */
export default class Player extends Entity {
  constructor(scene, x, y, texture, frame, health = 100) {
    super(scene, x, y, texture, frame, health);
    
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

    // State Machine Setup
    this.stateMachine = new StateMachine();
    this.stateMachine
      .addState('idle', new IdleState(this))
      .addState('run', new RunState(this))
      .addState('jump', new JumpState(this))
      .addState('fall', new FallState(this));
      
    this.stateMachine.setState('idle');
  }

  /**
   * The update loop for the player, called by the scene.
   * @param {number} time - The current time.
   * @param {number} delta - The delta time in ms since the last frame.
   */
  update(time, delta) {
    if (this.scene.timeManager && this.scene.timeManager.isRewinding) {
      return;
    }
    this.stateMachine.update(time, delta);
  }
} 