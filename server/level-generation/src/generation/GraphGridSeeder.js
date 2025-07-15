/**
 * @fileoverview GraphGridSeeder class for graph-based cave generation seeding
 * Implements a graph-based algorithm that creates corridors between main points
 * 
 * @module GraphGridSeeder
 */

const GridUtilities = require('../core/GridUtilities');

/**
 * GraphGridSeeder provides a graph-based grid seeding algorithm for cave generation
 * 
 * This class implements the first step of the cave generation pipeline using a
 * graph-based approach that creates corridors between randomly distributed main points.
 * The algorithm is deterministic and optimized for performance.
 * 
 * @example
 * const seeder = new GraphGridSeeder(3, 0.3, 0.7);
 * const config = { width: 100, height: 60, initialWallRatio: 0.45 };
 * const rng = new RandomGenerator('my-seed');
 * const grid = seeder.seedGrid(config, rng);
 * 
 * @class GraphGridSeeder
 */
class GraphGridSeeder {
  /**
   * Creates a new GraphGridSeeder instance
   * 
   * @param {number} corridorHeight - Height of corridors in tiles (default: 3)
   * @param {number} corridorThreshold - Threshold for corridor tiles (0.0 to 1.0, default: 0.3)
   * @param {number} nonCorridorThreshold - Threshold for non-corridor tiles (0.0 to 1.0, default: 0.7)
   * @throws {Error} If parameters are invalid
   */
  constructor(corridorHeight = 3, corridorThreshold = 0.3, nonCorridorThreshold = 0.7) {
    this._validateConstructorParams(corridorHeight, corridorThreshold, nonCorridorThreshold);
    
    this.corridorHeight = corridorHeight;
    this.corridorThreshold = corridorThreshold;
    this.nonCorridorThreshold = nonCorridorThreshold;
    this.graph = new Map(); // Store graph as mapping of points to neighbors
  }

  /**
   * Validates constructor parameters
   * 
   * @param {number} corridorHeight - Height of corridors
   * @param {number} corridorThreshold - Threshold for corridor tiles
   * @param {number} nonCorridorThreshold - Threshold for non-corridor tiles
   * @throws {Error} If any parameter is invalid
   * @private
   */
  _validateConstructorParams(corridorHeight, corridorThreshold, nonCorridorThreshold) {
    if (typeof corridorHeight !== 'number' || corridorHeight <= 0) {
      throw new Error('Invalid corridor height: must be a positive number');
    }

    if (typeof corridorThreshold !== 'number' || corridorThreshold < 0 || corridorThreshold > 1) {
      throw new Error('Invalid corridor threshold: must be between 0.0 and 1.0');
    }

    if (typeof nonCorridorThreshold !== 'number' || nonCorridorThreshold < 0 || nonCorridorThreshold > 1) {
      throw new Error('Invalid non-corridor threshold: must be between 0.0 and 1.0');
    }
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
   * Seeds a grid with graph-based noise pattern for cave generation
   * 
   * This method creates a new grid and fills it with graph-based noise using
   * corridors between randomly distributed main points. The algorithm is deterministic
   * when using the same RandomGenerator instance.
   * 
   * @param {Object} config - Configuration object (see validateConfig)
   * @param {RandomGenerator} rng - Random number generator instance
   * @returns {ndarray} A new grid filled with graph-based noise (0 = floor, 1 = wall)
   * @throws {Error} If config or rng are invalid
   */
  seedGrid(config, rng) {
    // Validate inputs
    this.validateConfig(config);
    this._validateRng(rng);

    const { width, height, initialWallRatio } = config;

    // Create a new grid using GridUtilities
    const grid = GridUtilities.createGrid(width, height, 0);

    // Fill the grid with graph-based noise and store main points
    this.mainPoints = this._fillWithGraphNoise(grid, this.corridorHeight, this.corridorThreshold, this.nonCorridorThreshold, rng);

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
  }

  /**
   * Fills a grid with graph-based noise using corridor interpolation
   * 
   * This method implements the graph-based algorithm:
   * 1. Build a threshold matrix with corridor interpolation
   * 2. Sample wall placement based on thresholds
   * 
   * @param {ndarray} grid - The grid to fill
   * @param {number} corridorHeight - Height of corridors in tiles
   * @param {number} corridorThreshold - Threshold for corridor tiles
   * @param {number} nonCorridorThreshold - Threshold for non-corridor tiles
   * @param {RandomGenerator} rng - Random number generator
   * @returns {Array<{x: number, y: number}>} Array of main points used for generation
   * @private
   */
  _fillWithGraphNoise(grid, corridorHeight, corridorThreshold, nonCorridorThreshold, rng) {
    const [width, height] = grid.shape;

    // Step 1: Build threshold matrix
    const { thresholds, mainPoints } = this._buildThresholdMatrix(width, height, corridorHeight, rng);

    // Step 2: Sample wall placement
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const randomValue = rng.random();
        const threshold = thresholds[y][x];
        const isWall = randomValue > threshold;
        
        // Set the tile value (0 = floor, 1 = wall)
        grid.set(x, y, isWall ? 1 : 0);
      }
    }

    return mainPoints;
  }

  /**
   * Builds a threshold matrix with corridor interpolation and stores the graph
   * 
   * @param {number} width - Grid width
   * @param {number} height - Grid height
   * @param {number} corridorHeight - Height of corridors
   * @param {RandomGenerator} rng - Random number generator
   * @returns {Object} Object containing thresholds matrix and mainPoints array
   * @private
   */
  _buildThresholdMatrix(width, height, corridorHeight, rng) {
    // Initialize threshold matrix with non-corridor threshold
    const thresholds = [];
    for (let y = 0; y < height; y++) {
      thresholds[y] = [];
      for (let x = 0; x < width; x++) {
        thresholds[y][x] = this.nonCorridorThreshold;
      }
    }

    // Clear the graph for this generation
    this.graph.clear();

    // Randomly select number of regions (2-5)
    const nRegions = rng.randomInt(2, 6);

    // Choose main points distributed across the grid using uniform distribution
    const mainPoints = this._selectMainPoints(width, height, nRegions, rng);

    // LOG: nRegions and mainPoints
    console.log(`[GraphGridSeeder] nRegions: ${nRegions}`);
    console.log(`[GraphGridSeeder] mainPoints:`, mainPoints);

    // Initialize graph with all main points
    for (const point of mainPoints) {
      this.graph.set(this._pointToKey(point), []);
    }

    // For each point, create corridors to closest points
    for (let i = 0; i < mainPoints.length; i++) {
      const point = mainPoints[i];
      
      // Select random K ∈ {1, 2} closest points
      const k = rng.randomInt(1, 2);
      // LOG: k for this main point
      console.log(`[GraphGridSeeder] mainPoint[${i}] k: ${k}`);
      const closestPoints = this._findClosestPoints(point, mainPoints, k, i);

      // Create corridors to each closest point and build graph
      for (const closestPoint of closestPoints) {
        this._createCorridor(point, closestPoint, corridorHeight, thresholds, rng);
        
        // Add edge to graph (bidirectional)
        const pointKey = this._pointToKey(point);
        const closestPointKey = this._pointToKey(closestPoint);
        
        if (!this.graph.get(pointKey).some(p => this._pointToKey(p) === closestPointKey)) {
          this.graph.get(pointKey).push(closestPoint);
        }
        if (!this.graph.get(closestPointKey).some(p => this._pointToKey(p) === pointKey)) {
          this.graph.get(closestPointKey).push(point);
        }
      }
    }

    // Mark all tiles within a 5-tile radius of each main point with threshold = 0
    const radius = 5;
    for (const pt of mainPoints) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (dx * dx + dy * dy > radius * radius) continue;
          const x = pt.x + dx;
          const y = pt.y + dy;
          // Bounds check
          if (x >= 0 && x < width && y >= 0 && y < height) {
            thresholds[y][x] = 0;
          }
        }
      }
    }
    return { thresholds, mainPoints };
  }

  /**
   * Selects main points distributed across the grid using uniform distribution
   * 
   * @param {number} width - Grid width
   * @param {number} height - Grid height
   * @param {number} nRegions - Number of regions to create
   * @param {RandomGenerator} rng - Random number generator
   * @returns {Array<{x: number, y: number}>} Array of main points
   * @private
   */
  _selectMainPoints(width, height, nRegions, rng) {
    const points = [];

    for (let i = 0; i < nRegions; i++) {
      // Draw points from uniform distribution x~(3, width-3), y~(3, height-3)
      const x = rng.randomInt(3, width - 3);
      const y = rng.randomInt(3, height - 3);

      points.push({ x, y });
    }

    return points;
  }

  /**
   * Finds the K closest points to a given point
   * 
   * @param {Object} point - The reference point {x, y}
   * @param {Array<Object>} allPoints - All available points
   * @param {number} k - Number of closest points to find
   * @param {number} excludeIndex - Index to exclude from search
   * @returns {Array<Object>} Array of closest points
   * @private
   */
  _findClosestPoints(point, allPoints, k, excludeIndex) {
    const distances = [];

    for (let i = 0; i < allPoints.length; i++) {
      if (i === excludeIndex) continue;

      const otherPoint = allPoints[i];
      const distance = Math.sqrt(
        Math.pow(point.x - otherPoint.x, 2) + 
        Math.pow(point.y - otherPoint.y, 2)
      );

      distances.push({ point: otherPoint, distance, index: i });
    }

    // Sort by distance and take top K
    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k).map(d => d.point);
  }

  /**
   * Creates a corridor between two points using linear interpolation
   * 
   * @param {Object} point1 - First point {x, y}
   * @param {Object} point2 - Second point {x, y}
   * @param {number} corridorHeight - Height of corridor
   * @param {Array<Array<number>>} thresholds - Threshold matrix to modify
   * @param {RandomGenerator} rng - Random number generator
   * @private
   */
  _createCorridor(point1, point2, corridorHeight, thresholds, rng) {
    const steps = Math.max(
      Math.abs(point2.x - point1.x),
      Math.abs(point2.y - point1.y)
    ) + 1;

    for (let step = 0; step <= steps; step++) {
      const alpha = step / steps;
      
      // Linear interpolation: P*α + Q*(1-α)
      const interpolatedX = point1.x * alpha + point2.x * (1 - alpha);
      const interpolatedY = point1.y * alpha + point2.y * (1 - alpha);

      // Add corridor height offset
      for (let d = 0; d < corridorHeight; d++) {
        const offsetY = interpolatedY + d;
        
        // Round using both floor() and ceil() to find affected grid indices
        const floorX = Math.floor(interpolatedX);
        const ceilX = Math.ceil(interpolatedX);
        const floorY = Math.floor(offsetY);
        const ceilY = Math.ceil(offsetY);

        // Set thresholds for all affected indices
        const indices = [
          { x: floorX, y: floorY },
          { x: ceilX, y: floorY },
          { x: floorX, y: ceilY },
          { x: ceilX, y: ceilY }
        ];

        for (const index of indices) {
          if (index.x >= 0 && index.x < thresholds[0].length &&
              index.y >= 0 && index.y < thresholds.length) {
            thresholds[index.y][index.x] = this.corridorThreshold;
          }
        }
      }
    }
  }

  /**
   * Converts a point object to a string key for Map storage
   * 
   * @param {Object} point - Point object with x, y coordinates
   * @returns {string} String key representation of the point
   * @private
   */
  _pointToKey(point) {
    return `${point.x},${point.y}`;
  }

  /**
   * Converts a grid to ASCII art for visual inspection
   *
   * @param {ndarray} grid - The grid to visualize
   * @returns {string} ASCII art string (rows separated by newlines)
   */
  toAsciiArt(grid) {
    if (!grid) throw new Error('Grid is required');
    const [width, height] = grid.shape;
    let lines = [];
    for (let y = 0; y < height; y++) {
      let line = '';
      for (let x = 0; x < width; x++) {
        const v = grid.get(x, y);
        line += v === 1 ? '#' : '.';
      }
      lines.push(line);
    }
    return lines.join('\n');
  }
}

module.exports = {
  GraphGridSeeder
}; 