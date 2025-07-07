/**
 * @fileoverview Test setup configuration for level generation system
 * Configures Jest environment and global test utilities
 */

// Set up global test timeout
jest.setTimeout(10000);

// Global test utilities
global.testUtils = {
  /**
   * Creates a mock grid for testing
   * @param {number} width - Grid width
   * @param {number} height - Grid height
   * @returns {Object} Mock grid object
   */
  createMockGrid: (width, height) => {
    const ndarray = require('ndarray');
    const Uint8Array = require('typedarray').Uint8Array;
    
    const data = new Uint8Array(width * height);
    return ndarray(data, [width, height]);
  },

  /**
   * Creates a seeded random generator for testing
   * @param {string} seed - Random seed
   * @returns {Function} Seeded random function
   */
  createSeededRandom: (seed) => {
    const seedrandom = require('seedrandom');
    return new seedrandom(seed);
  },

  /**
   * Creates a mock pathfinding grid for testing
   * @param {Array<Array<number>>} matrix - Grid matrix
   * @returns {Object} Pathfinding grid object
   */
  createPathfindingGrid: (matrix) => {
    const PF = require('pathfinding');
    return new PF.Grid(matrix);
  }
};

// Suppress console output during tests unless explicitly needed
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  // Suppress console output during tests
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  // Restore console output
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
}); 