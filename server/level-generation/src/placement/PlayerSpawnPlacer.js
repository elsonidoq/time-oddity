/**
 * @fileoverview Player Spawn Placement with Safety Validation
 * Implements player spawn placement system with comprehensive safety validation
 * ensuring the player spawns on wall tiles with safe landing zones.
 */

const GridUtilities = require('../core/GridUtilities');

/**
 * PlayerSpawnPlacer class for safe player spawn placement
 * 
 * Handles player spawn placement with comprehensive safety validation:
 * - Wall tile detection and validation
 * - Safe landing zone validation around spawn points
 * - Collision detection to prevent spawn inside walls
 * - Multiple placement attempts with intelligent fallback
 * 
 * @class PlayerSpawnPlacer
 */
class PlayerSpawnPlacer {
  /**
   * Creates a new PlayerSpawnPlacer instance
   * 
   * @param {Object} config - Configuration options
   * @param {number} config.maxAttempts - Maximum placement attempts (default: 100)
   * @param {number} config.safetyRadius - Safety radius for landing zone (default: 2)
   */
  constructor(config = {}) {
    this.maxAttempts = config.maxAttempts || 100;
    this.safetyRadius = config.safetyRadius || 2;
    
    // Validate configuration
    this.validateConfig(config);
  }

  /**
   * Validates configuration parameters
   * 
   * @param {Object} config - Configuration to validate
   * @throws {Error} If configuration is invalid
   */
  validateConfig(config) {
    if (config.maxAttempts !== undefined && config.maxAttempts <= 0) {
      throw new Error('maxAttempts must be positive');
    }
    
    if (config.safetyRadius !== undefined && config.safetyRadius <= 0) {
      throw new Error('safetyRadius must be positive');
    }
  }

  /**
   * Checks if a tile is a wall tile
   * 
   * @param {ndarray} grid - The grid to check
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} True if the tile is a wall (value 1)
   * @throws {Error} If grid is null or undefined
   */
  isWallTile(grid, x, y) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    // Check bounds first
    if (!GridUtilities.isValidCoordinate(x, y, grid)) {
      return false;
    }

    // Check if tile value is 1 (wall)
    return grid.get(x, y) === 1;
  }

  /**
   * Checks if a wall tile has a safe landing zone around it
   * 
   * A safe landing zone means there are floor tiles (value 0) within
   * the safety radius in the four cardinal directions (no diagonals)
   * where the player can safely land.
   * 
   * @param {ndarray} grid - The grid to check
   * @param {number} x - X coordinate of the wall tile
   * @param {number} y - Y coordinate of the wall tile
   * @param {number} safetyRadius - Radius to check for safe landing zones
   * @returns {boolean} True if there's a safe landing zone
   */
  hasSafeLandingZone(grid, x, y, safetyRadius) {
    if (!this.isWallTile(grid, x, y)) {
      return false;
    }
    const [width, height] = grid.shape;
    // Only check the four cardinal directions within the safety radius
    const directions = [
      { dx: 0, dy: -1 }, // up
      { dx: 0, dy: 1 },  // down
      { dx: -1, dy: 0 }, // left
      { dx: 1, dy: 0 }   // right
    ];
    for (const dir of directions) {
      for (let r = 1; r <= safetyRadius; r++) {
        const checkX = x + dir.dx * r;
        const checkY = y + dir.dy * r;
        if (checkX < 0 || checkX >= width || checkY < 0 || checkY >= height) {
          break; // Out of bounds in this direction
        }
        if (grid.get(checkX, checkY) === 0) {
          return true;
        }
        // If we hit another wall, stop searching in this direction
        if (grid.get(checkX, checkY) === 1) {
          break;
        }
      }
    }
    return false;
  }

  /**
   * Checks if a position is a valid spawn position
   * 
   * A valid spawn position must be:
   * 1. A floor tile (value 0) - the player spawns on empty space
   * 2. Have a wall tile directly below it (x,y+1) - preventing the player from falling
   * 3. Have a safe landing zone around the wall tile below
   * 
   * @param {ndarray} grid - The grid to check
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} True if the position is a valid spawn position
   */
  isValidSpawnPosition(grid, x, y) {
    // Check bounds first
    if (!GridUtilities.isValidCoordinate(x, y, grid)) {
      return false;
    }
    
    // Must be a floor tile (value 0) - player spawns on empty space
    if (grid.get(x, y) !== 0) {
      return false;
    }
    
    // Must have a wall tile directly below (x,y+1) - preventing player from falling
    const [width, height] = grid.shape;
    if (y + 1 >= height || grid.get(x, y + 1) !== 1) {
      return false;
    }
    
    // Must have a safe landing zone around the wall tile below
    return this.hasSafeLandingZone(grid, x, y + 1, this.safetyRadius);
  }

  /**
   * Finds all valid spawn positions in the grid
   * 
   * @param {ndarray} grid - The grid to search
   * @returns {Array<Object>} Array of valid spawn positions {x, y}
   * @throws {Error} If grid is null or undefined
   */
  findValidSpawnPositions(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const [width, height] = grid.shape;
    const validPositions = [];
    
    // Scan the entire grid for valid spawn positions
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (this.isValidSpawnPosition(grid, x, y)) {
          validPositions.push({ x, y });
        }
      }
    }
    
    return validPositions;
  }

  /**
   * Places a player spawn at a valid position using random selection
   * 
   * @param {ndarray} grid - The grid to place spawn in
   * @param {RandomGenerator} rng - Random number generator
   * @returns {Object} Result object with success status and position
   * @throws {Error} If grid or RNG is null
   */
  placeSpawn(grid, rng) {
    if (!grid) {
      throw new Error('Grid is required');
    }
    
    if (!rng) {
      throw new Error('RandomGenerator is required');
    }

    // Find all valid spawn positions
    const validPositions = this.findValidSpawnPositions(grid);
    
    if (validPositions.length === 0) {
      return {
        success: false,
        position: null,
        error: 'No valid spawn positions found'
      };
    }
    
    // Randomly select a valid position
    const selectedPosition = rng.randomChoice(validPositions);
    
    return {
      success: true,
      position: selectedPosition,
      error: null
    };
  }

  /**
   * Places a player spawn with custom configuration
   * 
   * @param {ndarray} grid - The grid to place spawn in
   * @param {RandomGenerator} rng - Random number generator
   * @param {Object} config - Custom configuration
   * @returns {Object} Result object with success status and position
   * @throws {Error} If configuration is invalid
   */
  placeSpawnWithConfig(grid, rng, config) {
    // Validate configuration
    this.validateConfig(config);
    
    // Create temporary placer with custom config
    const tempPlacer = new PlayerSpawnPlacer(config);
    
    return tempPlacer.placeSpawn(grid, rng);
  }

  /**
   * Gets spawn statistics for the grid
   * 
   * @param {ndarray} grid - The grid to analyze
   * @returns {Object} Statistics object with total positions, valid positions, and validity ratio
   */
  getSpawnStatistics(grid) {
    if (!grid) {
      return {
        totalPositions: 0,
        validPositions: 0,
        validityRatio: 0
      };
    }

    const [width, height] = grid.shape;
    const totalPositions = width * height;
    const validPositions = this.findValidSpawnPositions(grid).length;
    const validityRatio = totalPositions > 0 ? validPositions / totalPositions : 0;
    
    return {
      totalPositions,
      validPositions,
      validityRatio
    };
  }
}

module.exports = PlayerSpawnPlacer; 