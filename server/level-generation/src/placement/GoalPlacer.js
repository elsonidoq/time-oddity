/**
 * @fileoverview Goal Placement with Reachability Validation
 * Implements goal placement system with comprehensive reachability validation,
 * distance constraints, and multiple path verification.
 */

const GridUtilities = require('../core/GridUtilities');
const PathfindingIntegration = require('../pathfinding/PathfindingIntegration');
const PhysicsAwareReachabilityAnalyzer = require('../analysis/PhysicsAwareReachabilityAnalyzer');

/**
 * GoalPlacer class for goal placement with comprehensive validation
 * 
 * Handles goal placement with comprehensive validation:
 * - Distance calculation and minimum distance constraints
 * - Goal placement in distinct regions from player spawn
 * - Unreachable goal verification (expected behavior until platform placement)
 * - Placement optimization for challenging but fair positioning
 * - Goal visibility and accessibility validation
 * 
 * @class GoalPlacer
 */
class GoalPlacer {
  /**
   * Creates a new GoalPlacer instance
   * 
   * @param {Object} config - Configuration options
   * @param {number} config.minDistance - Minimum distance from player spawn (default: 10)
   * @param {number} config.maxAttempts - Maximum placement attempts (default: 100)
   * @param {number} config.visibilityRadius - Visibility radius for goal validation (default: 3)
   */
  constructor(config = {}) {
    this.minDistance = config.minDistance || 10;
    this.maxAttempts = config.maxAttempts || 100;
    this.visibilityRadius = config.visibilityRadius || 3;
    
    // Create pathfinding integration for reachability testing
    this.pathfinding = new PathfindingIntegration();
    
    // Create physics-aware reachability analyzer
    this.physicsAnalyzer = new PhysicsAwareReachabilityAnalyzer();
    
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
    if (config.minDistance !== undefined && config.minDistance <= 0) {
      throw new Error('minDistance must be positive');
    }
    
    if (config.maxAttempts !== undefined && config.maxAttempts <= 0) {
      throw new Error('maxAttempts must be positive');
    }
    
    if (config.visibilityRadius !== undefined && config.visibilityRadius <= 0) {
      throw new Error('visibilityRadius must be positive');
    }
  }

  /**
   * Calculates Euclidean distance between two points
   * 
   * @param {Object} point1 - First point {x, y}
   * @param {Object} point2 - Second point {x, y}
   * @returns {number} Euclidean distance between points
   */
  calculateDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Checks if a position is a valid goal position
   * 
   * A valid goal position must be:
   * 1. A floor tile (value 0)
   * 2. Have a wall tile directly below it (x,y+1)
   * 3. At least minDistance away from player spawn
   * 
   * @param {ndarray} grid - The grid to check
   * @param {Object} position - Goal position {x, y}
   * @param {Object} playerSpawn - Player spawn position {x, y}
   * @returns {boolean} True if the position is a valid goal position
   */
  isValidGoalPosition(grid, position, playerSpawn) {
    // Check bounds
    if (!GridUtilities.isValidCoordinate(position.x, position.y, grid)) {
      return false;
    }
    // Must be a floor tile (value 0)
    if (grid.get(position.x, position.y) !== 0) {
      return false;
    }
    // Must have a wall tile directly below (x, y+1)
    const [width, height] = grid.shape;
    if (position.y + 1 >= height || grid.get(position.x, position.y + 1) !== 1) {
      return false;
    }
    // Must be at least minDistance away from player spawn
    const distance = this.calculateDistance(playerSpawn, position);
    if (distance < this.minDistance) {
      return false;
    }
    return true;
  }

  /**
   * Checks if a goal is currently unreachable from player spawn
   * 
   * This is expected behavior until platform placement is implemented.
   * Uses pathfinding to verify that no path exists between spawn and goal.
   * 
   * @param {ndarray} grid - The grid to check
   * @param {Object} playerSpawn - Player spawn position {x, y}
   * @param {Object} goal - Goal position {x, y}
   * @returns {boolean} True if goal is currently unreachable
   */
  isCurrentlyUnreachable(grid, playerSpawn, goal) {
    try {
      // Check if coordinates are valid
      if (!GridUtilities.isValidCoordinate(playerSpawn.x, playerSpawn.y, grid) ||
          !GridUtilities.isValidCoordinate(goal.x, goal.y, grid)) {
        return true; // Invalid coordinates are considered unreachable
      }
      
      // Use pathfinding to check if goal is reachable
      const isReachable = this.pathfinding.isReachable(grid, playerSpawn, goal);
      return !isReachable; // Return true if NOT reachable
    } catch (error) {
      // If pathfinding fails, consider goal unreachable
      return true;
    }
  }

  /**
   * Finds all valid goal positions in the grid
   * 
   * @param {ndarray} grid - The grid to search
   * @param {Object} playerSpawn - Player spawn position {x, y}
   * @returns {Array<Object>} Array of valid goal positions {x, y}
   * @throws {Error} If grid or playerSpawn is null
   */
  findValidGoalPositions(grid, playerSpawn) {
    if (!grid) {
      throw new Error('Grid is required');
    }
    
    if (!playerSpawn) {
      throw new Error('Player spawn is required');
    }

    const [width, height] = grid.shape;
    const validPositions = [];
    
    // Scan the entire grid for valid goal positions
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const position = { x, y };
        if (this.isValidGoalPosition(grid, position, playerSpawn)) {
          validPositions.push(position);
        }
      }
    }
    
    return validPositions;
  }

  /**
   * Optimizes goal placement by selecting the best position from valid candidates
   * 
   * Currently selects the position with the maximum distance from player spawn
   * to ensure maximum challenge. This can be enhanced with more sophisticated
   * optimization algorithms in the future.
   * 
   * @param {Array<Object>} validPositions - Array of valid goal positions
   * @param {Object} playerSpawn - Player spawn position {x, y}
   * @returns {Object|null} Optimal goal position or null if no positions available
   */
  optimizeGoalPlacement(validPositions, playerSpawn) {
    if (validPositions.length === 0) {
      return null;
    }
    
    if (validPositions.length === 1) {
      return validPositions[0];
    }
    
    // Find position with maximum distance from player spawn
    let optimalPosition = validPositions[0];
    let maxDistance = this.calculateDistance(playerSpawn, optimalPosition);
    
    for (let i = 1; i < validPositions.length; i++) {
      const distance = this.calculateDistance(playerSpawn, validPositions[i]);
      if (distance > maxDistance) {
        maxDistance = distance;
        optimalPosition = validPositions[i];
      }
    }
    
    return optimalPosition;
  }

  /**
   * Validates goal visibility (simple version: not surrounded by walls)
   * Returns true if at least one adjacent tile is not a wall
   * @param {ndarray} grid
   * @param {Object} goal {x, y}
   * @returns {boolean}
   */
  validateGoalVisibility(grid, goal) {
    if (!grid || !goal) return false;
    const [width, height] = grid.shape;
    const { x, y } = goal;
    // Check 4 cardinal directions
    const directions = [
      { dx: 0, dy: -1 }, // up
      { dx: 0, dy: 1 },  // down
      { dx: -1, dy: 0 }, // left
      { dx: 1, dy: 0 }   // right
    ];
    for (const dir of directions) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        if (grid.get(nx, ny) !== 1) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Places a goal at a valid position using random selection and optimization
   * Always includes statistics in the result
   * @param {ndarray} grid
   * @param {Object} playerSpawn
   * @param {RandomGenerator} rng
   * @returns {Object}
   */
  placeGoal(grid, playerSpawn, rng) {
    const statistics = this.getGoalStatistics(grid, playerSpawn);
    if (!grid) {
      return { success: false, position: null, error: 'Grid is required', statistics };
    }
    if (!playerSpawn) {
      return { success: false, position: null, error: 'Player spawn is required', statistics };
    }
    if (!rng) {
      return { success: false, position: null, error: 'RandomGenerator is required', statistics };
    }
    const validPositions = this.findValidGoalPositions(grid, playerSpawn);
    if (validPositions.length === 0) {
      return { success: false, position: null, error: 'No valid goal positions found', statistics };
    }
    const optimalPosition = this.optimizeGoalPlacement(validPositions, playerSpawn);
    if (!optimalPosition) {
      return { success: false, position: null, error: 'No optimal goal position found', statistics };
    }
    const distance = this.calculateDistance(playerSpawn, optimalPosition);
    const isUnreachable = this.isCurrentlyUnreachable(grid, playerSpawn, optimalPosition);
    const isVisible = this.validateGoalVisibility(grid, optimalPosition);
    return {
      success: true,
      position: optimalPosition,
      distance,
      isUnreachable,
      isVisible,
      statistics
    };
  }

  /**
   * Places a goal with custom configuration
   * 
   * @param {ndarray} grid - The grid to place goal in
   * @param {Object} playerSpawn - Player spawn position {x, y}
   * @param {RandomGenerator} rng - Random number generator
   * @param {Object} config - Custom configuration
   * @returns {Object} Result object with success status and position
   * @throws {Error} If configuration is invalid
   */
  placeGoalWithConfig(grid, playerSpawn, rng, config) {
    // Validate custom configuration
    this.validateConfig(config);
    
    // Create temporary placer with custom config
    const tempPlacer = new GoalPlacer(config);
    
    // Use temporary placer to place goal
    return tempPlacer.placeGoal(grid, playerSpawn, rng);
  }

  /**
   * Returns statistics for goal placement
   * @param {ndarray} grid
   * @param {Object} playerSpawn
   * @returns {Object}
   */
  getGoalStatistics(grid, playerSpawn) {
    if (!grid) return { totalPositions: 0, validPositions: 0, validityRatio: 0 };
    const [width, height] = grid.shape;
    let total = 0;
    let valid = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        total++;
        if (this.isValidGoalPosition(grid, { x, y }, playerSpawn)) {
          valid++;
        }
      }
    }
    return {
      totalPositions: total,
      validPositions: valid,
      validityRatio: total > 0 ? valid / total : 0
    };
  }

  /**
   * Places a goal after platform placement using reachability analysis
   * 
   * This method implements the algorithm specified in Task CG-04.10.A:
   * 1. Run reachability analysis from player spawn (call detectReachablePositionsFromStartingPoint ONCE)
   * 2. Filter reachable positions by minimum distance from player spawn
   * 3. Randomly select a valid goal position from the filtered list
   * 4. Return the selected position or throw if none found
   * 
   * @param {ndarray} grid - The grid with platforms marked as walls
   * @param {Object} playerSpawn - Player spawn position {x, y}
   * @param {number} minDistance - Minimum distance from player spawn
   * @param {Function} rng - Random number generator function
   * @returns {Object} Goal position {x, y}
   * @throws {Error} If no valid goal position found after platform placement
   */
  placeGoalAfterPlatforms(grid, playerSpawn, minDistance, rng) {
    if (!grid) {
      throw new Error('Grid is required');
    }
    
    if (!playerSpawn) {
      throw new Error('Player spawn is required');
    }
    
    if (!rng) {
      throw new Error('Random number generator is required');
    }
    
    if (minDistance <= 0) {
      throw new Error('Minimum distance must be positive');
    }

    // Step 1: Run reachability analysis from player spawn (ONCE)
    const reachablePositions = this.physicsAnalyzer.detectReachablePositionsFromStartingPoint(
      grid, playerSpawn, null
    );

    // Step 2: Filter reachable positions by minimum distance and floor tiles
    const validGoalPositions = [];
    
    for (const position of reachablePositions) {
      const { x, y } = position;
      
      // Check if position is a floor tile (not a platform/wall)
      if (grid.get(x, y) !== 0) {
        continue; // Skip wall/platform tiles
      }
      // Skip positions on the left side of the map
      if (x < 4*width / 5) {
        continue;
      }

      
      // Check if position has a wall below it (required for goal placement)
      const [width, height] = grid.shape;
      if (y + 1 >= height || grid.get(x, y + 1) !== 1) {
        continue; // No wall below
      }
      
      // Check minimum distance constraint
      const distance = this.calculateDistance(playerSpawn, { x, y });
      if (distance < minDistance) {
        continue; // Too close to player spawn
      }
      
      validGoalPositions.push({ x, y });
    }

    // Step 3: Randomly select a valid goal position
    if (validGoalPositions.length === 0) {
      throw new Error('No valid goal position found after platform placement');
    }

    // Use seeded RNG to select a random position
    const randomIndex = Math.floor(rng() * validGoalPositions.length);
    const selectedPosition = validGoalPositions[randomIndex];

    return selectedPosition;
  }
}

module.exports = GoalPlacer; 