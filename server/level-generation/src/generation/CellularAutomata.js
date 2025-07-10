/**
 * @fileoverview CellularAutomata class for cave generation simulation
 * Implements cellular automata rules to transform noise into organic cave structures
 * 
 * @module CellularAutomata
 */

const GridUtilities = require('../core/GridUtilities');

/**
 * CellularAutomata provides the cellular automata simulation engine for cave generation
 * 
 * This class implements the second step of the cave generation pipeline:
 * transforming initial noise into organic cave structures using birth/survival rules.
 * The algorithm uses double-buffering to prevent race conditions and is optimized
 * for performance on large grids.
 * 
 * @example
 * const ca = new CellularAutomata();
 * const config = { simulationSteps: 4, birthThreshold: 5, survivalThreshold: 4 };
 * const result = ca.simulate(grid, config);
 * 
 * @class CellularAutomata
 */
class CellularAutomata {
  /**
   * Creates a new CellularAutomata instance
   */
  constructor() {
    // No initialization required
  }

  /**
   * Validates the configuration object for cellular automata simulation
   * 
   * @param {Object} config - Configuration object
   * @param {number} config.simulationSteps - Number of simulation iterations (must be positive)
   * @param {number} config.birthThreshold - Birth threshold for floor tiles (0-8)
   * @param {number} config.survivalThreshold - Survival threshold for wall tiles (0-8)
   * @param {number} config.smoothingPasses - Number of smoothing passes (optional, must be non-negative)
   * @throws {Error} If any parameter is invalid
   */
  validateConfig(config) {
    if (!config) {
      throw new Error('Config is required');
    }

    // Check for missing required parameters
    if (config.simulationSteps === undefined) {
      throw new Error('Missing required parameter: simulationSteps is required');
    }

    if (config.birthThreshold === undefined) {
      throw new Error('Missing required parameter: birthThreshold is required');
    }

    if (config.survivalThreshold === undefined) {
      throw new Error('Missing required parameter: survivalThreshold is required');
    }

    if (typeof config.simulationSteps !== 'number' || config.simulationSteps < 0) {
      throw new Error('Invalid simulationSteps: must be a positive number');
    }

    if (typeof config.birthThreshold !== 'number' || 
        config.birthThreshold < 0 || config.birthThreshold > 8) {
      throw new Error('Invalid birthThreshold: must be between 0 and 8');
    }

    if (typeof config.survivalThreshold !== 'number' || 
        config.survivalThreshold < 0 || config.survivalThreshold > 8) {
      throw new Error('Invalid survivalThreshold: must be between 0 and 8');
    }

    // Validate optional smoothingPasses parameter
    if (config.smoothingPasses !== undefined) {
      if (typeof config.smoothingPasses !== 'number' || config.smoothingPasses < 0) {
        throw new Error('Invalid smoothingPasses: must be a non-negative number');
      }
    }
  }

  /**
   * Counts the number of wall neighbors (8-neighbor) for a given cell
   * 
   * @param {ndarray} grid - The grid to analyze
   * @param {number} x - X coordinate of the cell
   * @param {number} y - Y coordinate of the cell
   * @returns {number} Number of wall neighbors (0-8)
   * @throws {Error} If grid is null or coordinates are invalid
   */
  countNeighbors(grid, x, y) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const [width, height] = grid.shape;
    let count = 0;

    // Check all 8 neighbors
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        // Skip the center cell itself
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;

        // Check bounds and count wall neighbors
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          if (grid.get(nx, ny) === 1) {
            count++;
          }
        }
      }
    }

    return count;
  }

  /**
   * Applies cellular automata rules to determine the new state of a cell
   * 
   * @param {ndarray} grid - The grid to analyze
   * @param {number} x - X coordinate of the cell
   * @param {number} y - Y coordinate of the cell
   * @param {number} birthThreshold - Birth threshold for floor tiles
   * @param {number} survivalThreshold - Survival threshold for wall tiles
   * @returns {number} New cell value (0 = floor, 1 = wall)
   * @throws {Error} If grid is null or coordinates are invalid
   */
  applyRules(grid, x, y, birthThreshold, survivalThreshold) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const currentValue = grid.get(x, y);
    const neighborCount = this.countNeighbors(grid, x, y);

    if (currentValue === 0) {
      // Floor cell: apply birth rule
      return neighborCount >= birthThreshold ? 1 : 0;
    } else {
      // Wall cell: apply survival rule
      return neighborCount >= survivalThreshold ? 1 : 0;
    }
  }

  /**
   * Performs cellular automata simulation on a grid
   * 
   * This method implements the double-buffering pattern to prevent race conditions.
   * It reads from the source grid and writes to a buffer grid, then swaps them
   * after each iteration.
   * 
   * @param {ndarray} grid - The input grid (0 = floor, 1 = wall)
   * @param {Object} config - Configuration object (see validateConfig)
   * @param {Function} progressCallback - Optional callback for progress tracking
   * @returns {ndarray} The transformed grid after simulation
   * @throws {Error} If config or grid are invalid
   */
  simulate(grid, config, progressCallback) {
    // Validate inputs
    this.validateConfig(config);
    this._validateGrid(grid);

    const { simulationSteps, birthThreshold, survivalThreshold } = config;

    // If no simulation steps, return a copy of the original grid
    if (simulationSteps === 0) {
      return GridUtilities.copyGrid(grid);
    }

    // Create double-buffering grids
    let sourceGrid = GridUtilities.copyGrid(grid);
    let bufferGrid = GridUtilities.createGrid(grid.shape[0], grid.shape[1], 0);

    // Perform simulation iterations
    for (let step = 1; step <= simulationSteps; step++) {
      // Apply rules to each cell
      for (let y = 0; y < grid.shape[1]; y++) {
        for (let x = 0; x < grid.shape[0]; x++) {
          const newValue = this.applyRules(sourceGrid, x, y, birthThreshold, survivalThreshold);
          bufferGrid.set(x, y, newValue);
        }
      }

      // Swap grids for next iteration
      const temp = sourceGrid;
      sourceGrid = bufferGrid;
      bufferGrid = temp;

      // Call progress callback if provided
      if (progressCallback && typeof progressCallback === 'function') {
        progressCallback(step, simulationSteps);
      }
    }

    return sourceGrid;
  }

  /**
   * Converts a grid to ASCII art for visual inspection
   *
   * @param {ndarray} grid - The grid to visualize
   * @returns {string} ASCII art string (rows separated by newlines)
   * @throws {Error} If grid is null or undefined
   */
  toAsciiArt(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const [width, height] = grid.shape;
    let lines = [];

    for (let y = 0; y < height; y++) {
      let line = '';
      for (let x = 0; x < width; x++) {
        const value = grid.get(x, y);
        line += value === 1 ? '#' : '.';
      }
      lines.push(line);
    }

    return lines.join('\n');
  }

  /**
   * Validates that the grid parameter is a valid ndarray
   * 
   * @param {any} grid - The grid to validate
   * @throws {Error} If grid is invalid
   * @private
   */
  _validateGrid(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    if (!grid.shape || grid.shape.length !== 2) {
      throw new Error('Invalid grid: must be a 2D ndarray');
    }

    const [width, height] = grid.shape;
    if (width <= 0 || height <= 0) {
      throw new Error('Invalid grid dimensions: width and height must be positive');
    }
  }

  /**
   * Applies micro-smoothing to reduce noise in the grid
   * 
   * This method implements the micro_smooth function from the Python reference.
   * It reduces noise by converting isolated walls to floors and isolated floors to walls.
   * 
   * @param {ndarray} grid - The grid to smooth
   * @param {number} passes - Number of smoothing passes to apply
   * @returns {ndarray} The smoothed grid
   * @throws {Error} If grid is null or passes is invalid
   */
  microSmooth(grid, passes = 1) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    if (passes < 0) {
      throw new Error('Passes must be non-negative');
    }

    if (passes === 0) {
      return GridUtilities.copyGrid(grid);
    }

    let currentGrid = GridUtilities.copyGrid(grid);
    const [width, height] = grid.shape;

    for (let pass = 0; pass < passes; pass++) {
      const newGrid = GridUtilities.createGrid(width, height, 0);

      // Apply micro-smoothing rules (skip edges)
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const neighborCount = this.countNeighbors(currentGrid, x, y);
          if (neighborCount > 5) {
            newGrid.set(x, y, 1); // Wall
          } else if (neighborCount < 3) {
            newGrid.set(x, y, 0); // Floor
          } else {
            newGrid.set(x, y, currentGrid.get(x, y));
          }
        }
      }

      currentGrid = newGrid;
    }

    return currentGrid;
  }

  /**
   * Performs cellular automata simulation followed by micro-smoothing
   * 
   * This method combines the main CA simulation with additional smoothing passes
   * to match the Python reference implementation exactly.
   * 
   * @param {ndarray} grid - The input grid (0 = floor, 1 = wall)
   * @param {Object} config - Configuration object with smoothingPasses
   * @param {Function} progressCallback - Optional callback for progress tracking
   * @returns {ndarray} The transformed grid after simulation and smoothing
   * @throws {Error} If config or grid are invalid
   */
  simulateWithSmoothing(grid, config, progressCallback) {
    // Validate inputs
    this.validateConfig(config);
    this._validateGrid(grid);

    const { simulationSteps, birthThreshold, survivalThreshold, smoothingPasses = 0 } = config;

    // If no simulation steps and no smoothing, return a copy of the original grid
    if (simulationSteps === 0 && smoothingPasses === 0) {
      return GridUtilities.copyGrid(grid);
    }

    let resultGrid = GridUtilities.copyGrid(grid);

    // Step 1: Perform cellular automata simulation
    if (simulationSteps > 0) {
      resultGrid = this.simulate(grid, {
        simulationSteps,
        birthThreshold,
        survivalThreshold
      }, progressCallback);
    }

    // Step 2: Apply micro-smoothing
    if (smoothingPasses > 0) {
      resultGrid = this.microSmooth(resultGrid, smoothingPasses);
    }

    return resultGrid;
  }
}

module.exports = {
  CellularAutomata
}; 