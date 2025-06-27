/**
 * A generic state machine for managing entity states (e.g., player, enemies).
 * See Section 7.2 "State Machine Implementation" in the comprehensive documentation.
 * 
 * @class
 * @description Provides a flexible state machine implementation for game entities.
 * Each state must implement a specific interface to ensure proper state transitions
 * and execution.
 * 
 * Required State Interface:
 * Each state object must implement the following methods:
 * 
 * 1. enter(): void
 *    - Called when entering the state
 *    - Should set up initial conditions (e.g., play animations, set velocities)
 *    - Must handle cleanup of previous state's effects if needed
 * 
 * 2. execute(time?: number, delta?: number): void
 *    - Called every frame while the state is active
 *    - Handles state-specific logic and checks for transitions
 *    - Parameters:
 *      - time: Current game time in ms
 *      - delta: Time since last frame in ms
 * 
 * 3. exit(): void
 *    - Called when leaving the state
 *    - Should clean up any state-specific effects or timers
 *    - Must ensure clean transition to next state
 * 
 * Example State Implementation:
 * ```javascript
 * {
 *   enter() {
 *     entity.anims.play('idle');
 *     entity.setVelocityX(0);
 *   },
 *   execute(time, delta) {
 *     if (entity.inputManager.isJumpPressed) {
 *       entity.stateMachine.setState('jump');
 *     }
 *   },
 *   exit() {
 *     entity.anims.stop();
 *   }
 * }
 * ```
 */
export default class StateMachine {
  constructor() {
    this.states = new Map();
    this.currentState = null;
  }

  /**
   * Adds a new state to the state machine.
   * @param {string} name - The name of the state.
   * @param {object} state - An object with enter(), execute(), and exit() methods.
   */
  addState(name, state) {
    this.states.set(name, state);
    return this;
  }

  /**
   * Sets the current state of the machine.
   * @param {string} name - The name of the state to switch to.
   */
  setState(name) {
    if (!this.states.has(name)) {
      return;
    }

    if (this.currentState && typeof this.currentState.exit === 'function') {
      this.currentState.exit();
    }

    this.currentState = this.states.get(name);

    if (this.currentState && typeof this.currentState.enter === 'function') {
      this.currentState.enter();
    }
  }

  /**
   * Calls the execute method of the current state.
   * @param {number} time - The current time.
   * @param {number} delta - The delta time in ms since the last frame.
   */
  update(time, delta) {
    if (this.currentState && this.currentState.execute) {
      this.currentState.execute(time, delta);
    }
  }
} 