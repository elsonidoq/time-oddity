/**
 * @fileoverview Seeded pseudo-random number generator wrapper
 * Provides deterministic random number generation for the cave generation system
 * 
 * @module RandomGenerator
 */

const seedrandom = require('seedrandom');

/**
 * Seeded pseudo-random number generator wrapper
 * 
 * Provides deterministic random number generation using the seedrandom library.
 * Each instance maintains its own isolated state to prevent global pollution.
 * 
 * @example
 * const rng = new RandomGenerator('my-seed');
 * const value = rng.random(); // Deterministic value between 0 and 1
 * const int = rng.randomInt(1, 10); // Random integer between 1 and 10
 * 
 * @class RandomGenerator
 */
class RandomGenerator {
  /**
   * Creates a new RandomGenerator instance
   * 
   * @param {string|number} seed - The seed for deterministic generation
   * @throws {Error} If seed is invalid or empty
   */
  constructor(seed) {
    this._validateSeed(seed);
    this.seed = String(seed);
    
    // Create isolated seedrandom instance to prevent global state pollution
    // This follows the critical best practice from the documentation
    this._rng = seedrandom(this.seed);
  }

  /**
   * Validates the seed parameter
   * 
   * @param {any} seed - The seed to validate
   * @throws {Error} If seed is invalid
   * @private
   */
  _validateSeed(seed) {
    if (seed === null || seed === undefined) {
      throw new Error('Seed must be a string or number');
    }
    
    if (seed === '') {
      throw new Error('Seed cannot be empty');
    }
  }

  /**
   * Generates a random number between 0 (inclusive) and 1 (exclusive)
   * 
   * @returns {number} Random number between 0 and 1
   */
  random() {
    return this._rng();
  }

  /**
   * Generates a random integer between min and max (inclusive)
   * 
   * @param {number} min - Minimum value (inclusive)
   * @param {number} max - Maximum value (inclusive)
   * @returns {number} Random integer in the specified range
   * @throws {Error} If min > max or if min/max are not integers
   */
  randomInt(min, max) {
    this._validateIntRange(min, max);
    
    if (min === max) {
      return min;
    }
    
    // Generate random number between 0 and 1, then scale to range
    const random = this.random();
    return Math.floor(random * (max - min + 1)) + min;
  }

  /**
   * Generates a random float between min and max (inclusive)
   * 
   * @param {number} min - Minimum value (inclusive)
   * @param {number} max - Maximum value (inclusive)
   * @returns {number} Random float in the specified range
   * @throws {Error} If min > max
   */
  randomFloat(min, max) {
    this._validateFloatRange(min, max);
    
    if (min === max) {
      return min;
    }
    
    // Generate random number between 0 and 1, then scale to range
    const random = this.random();
    return random * (max - min) + min;
  }

  /**
   * Selects a random element from an array
   * 
   * @param {Array} choices - Array of choices to select from
   * @returns {any} Randomly selected element
   * @throws {Error} If choices is not an array or is empty
   */
  randomChoice(choices) {
    if (!Array.isArray(choices)) {
      throw new Error('Input must be an array');
    }
    
    if (choices.length === 0) {
      throw new Error('Array cannot be empty');
    }
    
    if (choices.length === 1) {
      return choices[0];
    }
    
    const index = this.randomInt(0, choices.length - 1);
    return choices[index];
  }

  /**
   * Selects a random element from an array based on weights
   * 
   * @param {Array} choices - Array of choices to select from
   * @param {Array<number>} weights - Array of weights corresponding to choices
   * @returns {any} Randomly selected element based on weights
   * @throws {Error} If inputs are invalid
   */
  randomWeightedChoice(choices, weights) {
    if (!Array.isArray(choices) || !Array.isArray(weights)) {
      throw new Error('Choices and weights must be arrays');
    }
    
    if (choices.length !== weights.length) {
      throw new Error('Choices and weights arrays must have same length');
    }
    
    if (choices.length === 0) {
      throw new Error('Arrays cannot be empty');
    }
    
    if (choices.length === 1) {
      return choices[0];
    }
    
    // Validate weights
    let totalWeight = 0;
    for (let i = 0; i < weights.length; i++) {
      if (weights[i] < 0) {
        throw new Error('All weights must be non-negative');
      }
      totalWeight += weights[i];
    }
    
    if (totalWeight === 0) {
      throw new Error('Total weight must be greater than zero');
    }
    
    // Generate random number and find corresponding choice
    const random = this.random() * totalWeight;
    let cumulativeWeight = 0;
    
    for (let i = 0; i < choices.length; i++) {
      cumulativeWeight += weights[i];
      if (random <= cumulativeWeight) {
        return choices[i];
      }
    }
    
    // Fallback (should never reach here due to floating point precision)
    return choices[choices.length - 1];
  }

  /**
   * Validates integer range parameters
   * 
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @throws {Error} If range is invalid
   * @private
   */
  _validateIntRange(min, max) {
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new Error('min and max must be integers');
    }
    
    if (min > max) {
      throw new Error('min must be less than or equal to max');
    }
  }

  /**
   * Validates float range parameters
   * 
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @throws {Error} If range is invalid
   * @private
   */
  _validateFloatRange(min, max) {
    if (typeof min !== 'number' || typeof max !== 'number') {
      throw new Error('min and max must be numbers');
    }
    
    if (min > max) {
      throw new Error('min must be less than or equal to max');
    }
  }

  /**
   * Resets the generator to its initial state
   * This creates a new seedrandom instance with the same seed
   */
  reset() {
    this._rng = seedrandom(this.seed);
  }

  /**
   * Gets the current state of the generator
   * 
   * @returns {Object} Current state information
   */
  getState() {
    return {
      seed: this.seed,
      // Note: seedrandom doesn't expose internal state for security reasons
      // This is intentional to prevent state manipulation
    };
  }
}

module.exports = RandomGenerator; 