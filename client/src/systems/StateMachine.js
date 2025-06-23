/**
 * A generic state machine for managing entity states (e.g., player, enemies).
 * See Section 7.2 "State Machine Implementation" in the comprehensive documentation.
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
      console.warn(`State '${name}' not found in state machine.`);
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
    if (this.currentState && typeof this.currentState.execute === 'function') {
      this.currentState.execute(time, delta);
    }
  }
} 