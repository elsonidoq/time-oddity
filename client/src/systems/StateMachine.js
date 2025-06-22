/**
 * StateMachine.js - A simple state machine for managing entity states
 */
export class StateMachine {
    /**
     * @param {object} context - The context (e.g., player) this state machine belongs to
     */
    constructor(context) {
        this.context = context;
        this.states = new Map();
        this.currentState = null;
    }

    /**
     * Add a new state to the state machine
     * @param {string} name - The name of the state
     * @param {object} state - The state object with enter, execute, and exit methods
     */
    addState(name, state) {
        this.states.set(name, state);
    }

    /**
     * Change the current state
     * @param {string} name - The name of the state to transition to
     * @param {object} [data] - Optional data to pass to the new state's enter method
     */
    changeState(name, data) {
        if (this.currentState && this.currentState.exit) {
            this.currentState.exit();
        }

        const NewState = this.states.get(name);
        if (!NewState) {
            console.error(`State "${name}" not found.`);
            return;
        }

        this.currentState = new NewState(this.context);
        this.currentState.name = name;
        if (this.currentState.enter) {
            this.currentState.enter(data);
        }
    }

    /**
     * Update the current state
     * @param {number} delta - The time since the last frame
     */
    update(delta) {
        if (this.currentState && this.currentState.execute) {
            this.currentState.execute(delta);
        }
    }

    /**
     * Get the name of the current state
     * @returns {string|null}
     */
    getCurrentState() {
        return this.currentState ? this.currentState.name : null;
    }
}

export default StateMachine; 