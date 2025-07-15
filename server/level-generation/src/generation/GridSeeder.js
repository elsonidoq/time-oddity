/**
 * @fileoverview GridSeeder class for initial cave generation seeding
 * Implements the initial noise generation algorithm for cellular automata processing
 * 
 * @module GridSeeder
 */

const GridUtilities = require('../core/GridUtilities');
const { toAsciiArt } = require('../core/VisualizationUtils');

/**
 * GridSeeder provides the initial grid seeding algorithm for cave generation
 * 
 * This class implements the first step of the cave generation pipeline:
 * creating an initial noise pattern using a configurable wall ratio.
 * The algorithm is deterministic and optimized for performance.
 * 
 * @example
 * const seeder = new GridSeeder();
 * const config = { width: 100, height: 60, initialWallRatio: 0.45 };
 * const rng = new RandomGenerator('my-seed');
 * const grid = seeder.seedGrid(config, rng);
 * 
 * @class GridSeeder
 */
class GridSeeder {
  /**
   * Creates a new GridSeeder instance
   */
  constructor() {
    // No initialization required
  }

  /**
   * Validates the configuration object for grid seeding
   * 
   * @param {Object} config - Configuration object
   * @param {number} config.width - Grid width (must be positive)
   * @param {number} config.height - Grid height (must be positive)
   * @param {number} config.initialWallRatio - Initial wall ratio (0.0 to 1.0)
   * @throws {Error} If any parameter is invalid
   */
  validateConfig(config) {
    if (!config) {
      throw new Error('Config is required');
    }

    // Check for missing required parameters first
    if (config.width === undefined || config.height === undefined || 
        config.initialWallRatio === undefined) {
      throw new Error('Missing required parameter: width, height, and initialWallRatio are required');
    }

    if (typeof config.width !== 'number' || config.width <= 0) {
      throw new Error('Invalid width: must be a positive number');
    }

    if (typeof config.height !== 'number' || config.height <= 0) {
      throw new Error('Invalid height: must be a positive number');
    }

    if (typeof config.initialWallRatio !== 'number' || 
        config.initialWallRatio < 0 || config.initialWallRatio > 1) {
      throw new Error('Invalid initialWallRatio: must be between 0.0 and 1.0');
    }
  }

  /**
   * Seeds a grid with initial noise pattern for cave generation
   * 
   * This method creates a new grid and fills it with random noise based on
   * the initialWallRatio parameter. The algorithm is deterministic when using
   * the same RandomGenerator instance.
   * 
   * @param {Object} config - Configuration object (see validateConfig)
   * @param {RandomGenerator} rng - Random number generator instance
   * @returns {ndarray} A new grid filled with noise (0 = floor, 1 = wall)
   * @throws {Error} If config or rng are invalid
   */
  seedGrid(config, rng) {
    // Validate inputs
    this.validateConfig(config);
    this._validateRng(rng);

    const { width, height, initialWallRatio } = config;

    // Create a new grid using GridUtilities
    const grid = GridUtilities.createGrid(width, height, 0);

    // Fill the grid with noise based on initialWallRatio
    this._fillWithNoise(grid, initialWallRatio, rng);

    return grid;
  }

  /**
   * Calculates the actual wall ratio of a grid
   * 
   * @param {ndarray} grid - The grid to analyze
   * @returns {number} The ratio of wall tiles (0.0 to 1.0)
   * @throws {Error} If grid is null or undefined
   */
  getWallRatio(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const totalTiles = grid.shape[0] * grid.shape[1];
    let wallCount = 0;

    // Count wall tiles (value = 1)
    for (let y = 0; y < grid.shape[1]; y++) {
      for (let x = 0; x < grid.shape[0]; x++) {
        if (grid.get(x, y) === 1) {
          wallCount++;
        }
      }
    }

    return wallCount / totalTiles;
  }

  /**
   * Validates that the RNG parameter is a valid RandomGenerator instance
   * 
   * @param {any} rng - The RNG to validate
   * @throws {Error} If rng is invalid
   * @private
   */
  _validateRng(rng) {
    if (!rng) {
      throw new Error('RandomGenerator is required');
    }

    // Check if it has the required methods
    if (typeof rng.random !== 'function') {
      throw new Error('Invalid RandomGenerator: missing random() method');
    }

    // Additional validation could check for other required methods
    // but for now we'll keep it simple and just check for random()
  }

  /**
   * Fills a grid with noise based on the wall ratio
   * 
   * This method efficiently fills the entire grid with random noise.
   * It uses a single pass through the grid to minimize performance overhead.
   * 
   * @param {ndarray} grid - The grid to fill
   * @param {number} wallRatio - Target wall ratio (0.0 to 1.0)
   * @param {RandomGenerator} rng - Random number generator
   * @private
   */
  _fillWithNoise(grid, wallRatio, rng) {
    const [width, height] = grid.shape;

    // Fill the grid with noise in a single pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Generate random number and compare with wall ratio
        const randomValue = rng.random();
        const isWall = randomValue < wallRatio;
        
        // Set the tile value (0 = floor, 1 = wall)
        grid.set(x, y, isWall ? 1 : 0);
      }
    }
  }

  /**
   * Converts a grid to ASCII art for visual inspection, with optional overlays.
   *
   * Delegates to the global VisualizationUtils.toAsciiArt function.
   *
   * @param {ndarray} grid - The grid to visualize
   * @param {Object} [options] - Optional overlays
   * @param {Array<{x:number, y:number}>} [options.reachableTiles] - Tiles to mark as 'X'
   * @param {Array<{x:number, y:number}>} [options.platforms] - Tiles to mark as 'l'
   * @param {Array<{x:number, y:number}>} [options.coins] - Tiles to mark as 'C'
   * @param {Array<{x:number, y:number}>} [options.enemies] - Tiles to mark as 'E'
   * @param {{x:number, y:number}} [options.player] - Player position to mark as 'P'
   * @param {{x:number, y:number}} [options.goal] - Goal position to mark as 'G'
   * @returns {string} ASCII art string (rows separated by newlines)
   * @throws {Error} If any overlay is placed on a wall tile (value = 1)
   */
  toAsciiArt(grid, options = {}) {
    return toAsciiArt(grid, options);
  }
}

module.exports = GridSeeder; 