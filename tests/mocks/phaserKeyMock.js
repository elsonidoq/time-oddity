/**
 * Centralized Phaser Key Mock for Input Testing
 * 
 * This mock provides a complete simulation of Phaser keyboard input
 * for use across all input-related tests. It supports all required
 * keys and provides control methods for test manipulation.
 * 
 * @module phaserKeyMock
 */

/**
 * Creates a fresh Phaser key mock instance
 * @param {string} keyCode - The key code (e.g., 'A', 'LEFT', 'SPACE')
 * @returns {PhaserKeyMock} A new key mock instance
 */
export function createPhaserKeyMock(keyCode = 'A') {
  return new PhaserKeyMock(keyCode);
}

/**
 * Phaser Key Mock Class
 * Simulates Phaser keyboard input with full state management
 */
export class PhaserKeyMock {
  /**
   * @param {string} keyCode - The key code this mock represents
   */
  constructor(keyCode) {
    this.keyCode = keyCode;
    
    // Key state properties (boolean)
    this.isDown = false;
    this.isUp = true;
    this.justDown = false;
    this.justUp = false;
    
    // Frame management
    this._lastFrameDown = false;
    this._lastFrameUp = true;
  }

  /**
   * Set key to pressed state
   */
  setDown() {
    this.isDown = true;
    this.isUp = false;
    this.justDown = !this._lastFrameDown;
    this.justUp = false;
  }

  /**
   * Set key to released state
   */
  setUp() {
    this.isDown = false;
    this.isUp = true;
    this.justDown = false;
    this.justUp = !this._lastFrameUp;
  }

  /**
   * Set justDown to true for one frame
   */
  setJustDown() {
    this.isDown = true;
    this.isUp = false;
    this.justDown = true;
    this.justUp = false;
  }

  /**
   * Set justUp to true for one frame
   */
  setJustUp() {
    this.isDown = false;
    this.isUp = true;
    this.justDown = false;
    this.justUp = true;
  }

  /**
   * Reset all states to default (isUp: true, others: false)
   */
  reset() {
    this.isDown = false;
    this.isUp = true;
    this.justDown = false;
    this.justUp = false;
    this._lastFrameDown = false;
    this._lastFrameUp = true;
  }

  /**
   * Called each frame to reset justDown/justUp
   * This simulates Phaser's frame-based input processing
   */
  update() {
    this._lastFrameDown = this.isDown;
    this._lastFrameUp = this.isUp;
    
    // Reset justDown/justUp after one frame
    this.justDown = false;
    this.justUp = false;
  }

  /**
   * Get a string representation of the key mock
   * @returns {string} String representation
   */
  toString() {
    return `PhaserKeyMock(${this.keyCode})`;
  }
}

/**
 * Factory function to create multiple key mocks at once
 * @param {string[]} keyCodes - Array of key codes to create mocks for
 * @returns {Object} Object with key codes as properties and mocks as values
 */
export function createKeyMocks(keyCodes) {
  const mocks = {};
  keyCodes.forEach(keyCode => {
    mocks[keyCode] = createPhaserKeyMock(keyCode);
  });
  return mocks;
}

/**
 * Predefined set of all required keys for the Time Oddity project
 */
export const REQUIRED_KEYS = [
  'LEFT', 'RIGHT', 'UP', 'DOWN',  // Arrow keys
  'A', 'D', 'W', 'S',            // WASD keys
  'SPACE',                        // Spacebar
  'SHIFT',                        // Shift key
  'R', 'E', 'P'                  // R, E, P keys
];

/**
 * Create mocks for all required keys
 * @returns {Object} Object with all required key mocks
 */
export function createAllRequiredKeyMocks() {
  return createKeyMocks(REQUIRED_KEYS);
}

export default {
  createPhaserKeyMock,
  PhaserKeyMock,
  createKeyMocks,
  createAllRequiredKeyMocks,
  REQUIRED_KEYS
}; 