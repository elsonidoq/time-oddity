/**
 * @fileoverview Strategic Platform Placement Algorithm
 * Implements strategic platform placement to achieve 85% reachability target
 * using critical ring analysis for optimal placement locations
 */

const ndarray = require('ndarray');
const CriticalRingAnalyzer = require('../analysis/CriticalRingAnalyzer');
const PhysicsAwareReachabilityAnalyzer = require('../analysis/PhysicsAwareReachabilityAnalyzer');

/**
 * StrategicPlatformPlacer class for strategic platform placement
 * 
 * Implements the algorithm specified in the task:
 * - Tracks reachable area percentage
 * - Uses CriticalRingAnalyzer for optimal placement
 * - Samples platform types and sizes
 * - Validates that each platform increases reachability
 * - Achieves 85% reachability target
 * 
 * @class StrategicPlatformPlacer
 */
class StrategicPlatformPlacer {
  /**
   * Creates a new StrategicPlatformPlacer instance
   * 
   * @param {Object} config - Configuration options
   * @param {number} config.targetReachability - Target reachability percentage (default: 0.85)
   * @param {number} config.floatingPlatformProbability - Probability of floating platform (default: 0.4)
   * @param {number} config.movingPlatformProbability - Probability of moving platform (default: 0.6)
   * @param {number} config.minPlatformSize - Minimum platform size in tiles (default: 2)
   * @param {number} config.maxPlatformSize - Maximum platform size in tiles (default: 6)
   * @param {number} config.maxIterations - Maximum iterations to prevent infinite loops (default: 50)
   */
  constructor(config = {}) {
    this.targetReachability = config.targetReachability !== undefined ? config.targetReachability : 0.85;
    this.floatingPlatformProbability = config.floatingPlatformProbability !== undefined ? config.floatingPlatformProbability : 0.4;
    this.movingPlatformProbability = config.movingPlatformProbability !== undefined ? config.movingPlatformProbability : 0.6;
    this.minPlatformSize = config.minPlatformSize !== undefined ? config.minPlatformSize : 2;
    this.maxPlatformSize = config.maxPlatformSize !== undefined ? config.maxPlatformSize : 6;
    this.maxIterations = config.maxIterations !== undefined ? config.maxIterations : 50;
    
    // Initialize analyzers
    this.criticalRingAnalyzer = new CriticalRingAnalyzer();
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
    if (this.targetReachability < 0 || this.targetReachability > 1) {
      throw new Error('targetReachability must be between 0 and 1');
    }
    
    if (this.minPlatformSize <= 0) {
      throw new Error('minPlatformSize must be positive');
    }
    
    if (this.maxPlatformSize <= 0) {
      throw new Error('maxPlatformSize must be positive');
    }
    
    if (this.minPlatformSize > this.maxPlatformSize) {
      throw new Error('minPlatformSize cannot be greater than maxPlatformSize');
    }
    
    if (this.floatingPlatformProbability < 0 || this.floatingPlatformProbability > 1) {
      throw new Error('floatingPlatformProbability must be between 0 and 1');
    }
    
    if (this.movingPlatformProbability < 0 || this.movingPlatformProbability > 1) {
      throw new Error('movingPlatformProbability must be between 0 and 1');
    }
    
    const totalProbability = this.floatingPlatformProbability + this.movingPlatformProbability;
    if (Math.abs(totalProbability - 1.0) > 0.001) {
      throw new Error('Platform probabilities must sum to 1.0');
    }
  }

  /**
   * Creates a copy of an ndarray grid
   * 
   * @param {ndarray} grid - The grid to copy
   * @returns {ndarray} A copy of the grid
   * @private
   */
  _copyGrid(grid) {
    const [width, height] = grid.shape;
    // Use native Uint8Array
    const copy = ndarray(new Uint8Array(width * height), [width, height]);
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        copy.set(x, y, grid.get(x, y));
      }
    }
    return copy;
  }

  /**
   * Calculates the percentage of reachable tiles in the grid
   * 
   * @param {ndarray} grid - The grid to analyze
   * @param {Object} playerPosition - Player position {x, y}
   * @returns {number} Reachability percentage (0.0 to 1.0)
   */
  calculateReachabilityPercentage(grid, playerPosition) {
    if (!grid || !playerPosition) {
      return 0;
    }

    const reachablePositions = this.physicsAnalyzer.detectReachablePositionsFromStartingPoint(
      grid, playerPosition, null
    );

    if (!reachablePositions) {
      return 0;
    }

    const totalTiles = grid.shape[0] * grid.shape[1];
    return reachablePositions.length / totalTiles;
  }

  /**
   * Samples platform type based on configured probabilities
   * 
   * @param {Function} rng - Random number generator function
   * @returns {string} Platform type ('floating' or 'moving')
   */
  samplePlatformType(rng) {
    const randomValue = rng();
    
    if (randomValue < this.floatingPlatformProbability) {
      return 'floating';
    } else {
      return 'moving';
    }
  }

  /**
   * Samples platform size within configured bounds
   * 
   * @param {Function} rng - Random number generator function
   * @returns {number} Platform size in tiles
   */
  samplePlatformSize(rng) {
    const range = this.maxPlatformSize - this.minPlatformSize + 1;
    const randomIndex = Math.floor(rng() * range);
    const res = this.minPlatformSize + randomIndex;
    return res;
  }

  /**
   * Creates a floating platform object
   * 
   * @param {Object} position - Platform position {x, y}
   * @param {number} size - Platform size in tiles
   * @returns {Object} Floating platform object
   */
  createFloatingPlatform(position, size) {
    return {
      type: 'floating',
      x: position.x,
      y: position.y,
      width: size,
      height: 1,
      getOccupiedTiles: () => {
        const tiles = [];
        for (let i = 0; i < size; i++) {
          tiles.push({ x: position.x + i, y: position.y });
        }
        return tiles;
      }
    };
  }

  /**
   * Creates a moving platform object
   * 
   * @param {Object} position - Platform position {x, y}
   * @param {number} size - Platform size in tiles
   * @returns {Object} Moving platform object
   */
  createMovingPlatform(position, size) {
    return {
      type: 'moving',
      x: position.x,
      y: position.y,
      width: size,
      height: 1,
      getOccupiedTiles: () => {
        const tiles = [];
        for (let i = 0; i < size; i++) {
          tiles.push({ x: position.x + i, y: position.y });
        }
        return tiles;
      }
    };
  }

  /**
   * Marks platform tiles as walls in the grid
   * 
   * @param {ndarray} grid - The grid to modify
   * @param {Object} platform - Platform object with getOccupiedTiles method
   */
  markPlatformAsWalls(grid, platform) {
    const occupiedTiles = platform.getOccupiedTiles();
    
    for (const tile of occupiedTiles) {
      // Debug log
      // eslint-disable-next-line no-console
      if (typeof console !== 'undefined' && console.log) {
        console.log('markPlatformAsWalls', { x: tile.x, y: tile.y, width: grid.shape[0], height: grid.shape[1] });
      }
      if (tile.x >= 0 && tile.x < grid.shape[0] && 
          tile.y >= 0 && tile.y < grid.shape[1]) {
        grid.set(tile.x, tile.y, 1); // Mark as wall
      }
    }
  }

  /**
   * Validates that a platform improves reachability
   * 
   * @param {ndarray} grid - The grid to analyze
   * @param {Object} platform - Platform object to validate
   * @param {Object} playerPosition - Player position {x, y}
   * @returns {boolean} True if platform improves reachability
   */
  validatePlatformImprovement(grid, platform, playerPosition) {
    // Get reachability before platform placement
    const beforeReachable = this.physicsAnalyzer.detectReachablePositionsFromStartingPoint(
      grid, playerPosition, null
    );
    
    if (!beforeReachable) {
      return false;
    }
    
    // Create a copy of the grid for testing
    const testGrid = this._copyGrid(grid);
    
    // Mark platform as walls in test grid
    this.markPlatformAsWalls(testGrid, platform);
    
    // Get reachability after platform placement
    const afterReachable = this.physicsAnalyzer.detectReachablePositionsFromStartingPoint(
      testGrid, playerPosition, null
    );
    
    if (!afterReachable) {
      return false;
    }
    
    // Platform improves reachability if after > before
    return afterReachable.length > beforeReachable.length;
  }

  /**
   * Assess the visual impact of a platform (stub for compatibility)
   * @param {ndarray} grid
   * @param {Object} platform
   * @returns {number}
   */
  assessVisualImpact(grid, platform) {
    // TODO: Implement real visual impact calculation if needed
    return 1.0;
  }

  /**
   * Places platforms strategically to achieve target reachability
   * 
   * @param {ndarray} grid - The grid to modify
   * @param {Object} playerPosition - Player position {x, y}
   * @param {Function} rng - Random number generator function
   * @returns {Array<Object>} Array of placed platform objects
   */
  placePlatforms(grid, playerPosition, rng) {
    if (!grid || !playerPosition || !rng) {
      return [];
    }

    const platforms = [];
    let iterations = 0;
    
    // Check initial reachability
    let currentReachability = this.calculateReachabilityPercentage(grid, playerPosition);
    
    // Continue placing platforms until target is achieved or max iterations reached
    while (currentReachability < this.targetReachability && iterations < this.maxIterations) {
      iterations++;
      
      // Find critical ring for optimal placement
      const referenceCriticalRing = this.criticalRingAnalyzer.findCriticalRing(playerPosition, grid);
      // Perform a second pass to find the critical ring, using the reference critical ring as a starting point
      // This is to ensure the player can always reach the critical ring
      const criticalRing = this.criticalRingAnalyzer.findCriticalRing(playerPosition, grid, referenceCriticalRing);
      
      if (!referenceCriticalRing || referenceCriticalRing.length === 0) {
        // No critical ring found, cannot place more platforms
        break;
      }
      
      // Sample a random position from critical ring
      const randomIndex = Math.floor(rng() * criticalRing.length);
      const placementPosition = criticalRing[randomIndex];
      
      // Sample platform type and size
      const platformType = this.samplePlatformType(rng);
      const platformSize = this.samplePlatformSize(rng);
      
      // Create platform based on type
      let platform;
      if (platformType === 'floating') {
        platform = this.createFloatingPlatform(placementPosition, platformSize);
      } else if (platformType === 'moving') {
        platform = this.createMovingPlatform(placementPosition, platformSize);
      } else {
        // Skip invalid platform type
        continue;
      }
      
      // Validate that platform improves reachability
      if (this.validatePlatformImprovement(grid, platform, playerPosition)) {
        // Mark platform as walls in the actual grid
        this.markPlatformAsWalls(grid, platform);
        
        // Add platform to results
        platforms.push(platform);
        
        // Update reachability
        currentReachability = this.calculateReachabilityPercentage(grid, playerPosition);
      }
    }
    
    return platforms;
  }
}

module.exports = StrategicPlatformPlacer; 