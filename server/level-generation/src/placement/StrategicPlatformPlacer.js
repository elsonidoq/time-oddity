/**
 * @fileoverview Strategic Platform Placement Algorithm
 * Implements strategic platform placement to achieve 85% reachability target
 * using critical ring analysis for optimal placement locations
 */

const ndarray = require('ndarray');
const CriticalRingAnalyzer = require('../analysis/CriticalRingAnalyzer');
const PhysicsAwareReachabilityAnalyzer = require('../analysis/PhysicsAwareReachabilityAnalyzer');
const { toAsciiArt } = require('../core/VisualizationUtils');

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
    this.maxIterations = config.maxIterations !== undefined ? config.maxIterations : 500;
    
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
  calculateReachabilityPercentage(grid, playerPosition, reachableTiles = null) {
    if (!grid || !playerPosition) {
      return 0;
    }

    // If reachableTiles is provided, use it; otherwise compute it
    const reachablePositions = reachableTiles || this.physicsAnalyzer.detectReachablePositionsFromStartingPoint(
      grid, playerPosition, null
    );

    if (!reachablePositions) {
      return 0;
    }

    const totalTiles = grid.shape[0] * grid.shape[1];
    // Subtract all wall tiles from the denominator
    let wallCount = 0;
    for (let x = 0; x < grid.shape[0]; x++) {
      for (let y = 0; y < grid.shape[1]; y++) {
        if (grid.get(x, y) === 1) {
          wallCount++;
        }
      }
    }
    const nonWallTiles = totalTiles - wallCount;
    // Avoid division by zero
    if (nonWallTiles === 0) return 0;
    return reachablePositions.length / nonWallTiles;
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
   * Gets all valid platform sizes within configured bounds
   * 
   * @param {Object} referencePosition - Reference position {x, y}
   * @param {number} direction - Direction (-1 for left, 1 for right)
   * @param {ndarray} grid - The grid to check for wall overlaps
   * @returns {Array<number>} Array of valid platform sizes in tiles
   */
  getAllValidPlatformSizes(referencePosition, direction, grid) {
    const [width, height] = grid.shape;
    const validSizes = [];
    
    // Check all possible sizes from min to max
    for (let size = this.minPlatformSize; size <= this.maxPlatformSize; size++) {
      let isValid = true;
      
      // Check each tile that would be occupied by this platform size
      for (let i = 0; i < size; i++) {
        let checkX;
        if (direction === -1) {
          // Platform extends to the left from reference position
          checkX = referencePosition.x - i;
        } else {
          // Platform extends to the right from reference position
          checkX = referencePosition.x + i;
        }
        
        // Check bounds
        if (checkX < 0 || checkX >= width || referencePosition.y < 0 || referencePosition.y >= height) {
          isValid = false;
          break;
        }
        
        // Check for wall overlap
        const tileValue = grid.get(checkX, referencePosition.y);
        if (tileValue === 1) {
          isValid = false;
          break;
        }
      }
      
      if (isValid) {
        validSizes.push(size);
      }
    }
    
    // Return all valid sizes
    return validSizes;
  }

  /**
   * Creates a floating platform object
   * 
   * @param {Object} position - Platform position {x, y}
   * @param {number} size - Platform size in tiles
   * @param {number} direction - Direction (-1 for left, 1 for right)
   * @returns {Object} Floating platform object
   */
  createFloatingPlatform(position, size, direction) {
    return {
      type: 'floating',
      x: position.x,
      y: position.y,
      width: size,
      height: 1,
      direction: direction,
      getOccupiedTiles: () => {
        const tiles = [];
        for (let i = 0; i < size; i++) {
          let tileX;
          if (direction === -1) {
            // Platform extends to the left from position
            tileX = position.x - i;
          } else {
            // Platform extends to the right from position
            tileX = position.x + i;
          }
          tiles.push({ x: tileX, y: position.y });
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
   * @param {number} direction - Direction (-1 for left, 1 for right)
   * @returns {Object} Moving platform object
   */
  createMovingPlatform(position, size, direction) {
    return {
      type: 'moving',
      x: position.x,
      y: position.y,
      width: size,
      height: 1,
      direction: direction,
      getOccupiedTiles: () => {
        const tiles = [];
        for (let i = 0; i < size; i++) {
          let tileX;
          if (direction === -1) {
            // Platform extends to the left from position
            tileX = position.x - i;
          } else {
            // Platform extends to the right from position
            tileX = position.x + i;
          }
          tiles.push({ x: tileX, y: position.y });
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
  validatePlatformImprovement(grid, platform, playerPosition, beforeReachable) {
    
    // Create a copy of the grid for testing
    const testGrid = this._copyGrid(grid);
    
    // Mark platform as walls in test grid
    this.markPlatformAsWalls(testGrid, platform);

    // Get reachability after platform placement
    const afterReachable = this.physicsAnalyzer.detectReachablePositionsFromStartingPoint(
      testGrid, playerPosition, null
    );
    
    if (!afterReachable) {
      throw new Error('afterReachable is null');
      return false;
    }
    
    // Platform improves reachability if after > before
    const improvesReachability = afterReachable.length > beforeReachable.length;
    if (improvesReachability) {
      const [width, height] = grid.shape;
      let wallCount = 0;
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          wallCount += grid.get(x, y) === 1;
        }
      }

      const percentage = (afterReachable.length / (width * height - wallCount)) * 100;
      console.log(`Platform improves reachability to the percentage of ${percentage.toFixed(2)}%`);
    } else {
      // console.log('Platform does not improve reachability');
      // console.log(toAsciiArt(grid, { 
      //   reachableTiles: beforeReachable, 
      //   player: playerPosition, 
      //   platforms: [platform] 
      // }));
      debugger;
    }
    return improvesReachability;
  }

  /**
   * Validates that a platform is valid for placement
   * 
   * Checks that:
   * 1. Platform does not overlap with walls
   * 2. Platform does not overlap with the player (player has 2 tiles height)
   * 3. Platform does not overlap with forbidden tiles
   * 
   * @param {ndarray} grid - The grid to analyze
   * @param {Object} platform - Platform object with getOccupiedTiles method
   * @param {Object} playerPosition - Player position {x, y}
   * @param {Set} forbiddenSet - Set of forbidden tile positions as strings "x,y"
   * @returns {boolean} True if platform is valid for placement
   */
  validatePlatform(grid, platform, playerPosition, forbiddenSet = new Set()) {
    if (!grid || !platform || !playerPosition) {
      return false;
    }

    const [width, height] = grid.shape;
    const occupiedTiles = platform.getOccupiedTiles();

    // Check each occupied tile
    for (const tile of occupiedTiles) {
      // Check bounds
      if (tile.x < 0 || tile.x >= width || tile.y < 0 || tile.y >= height) {
        return false;
      }

      // 1. Check for wall overlap
      if (grid.get(tile.x, tile.y) === 1) {
        return false;
      }

      // 2. Check for player overlap (player has 2 tiles height)
      // Player occupies (playerPosition.x, playerPosition.y) and (playerPosition.x, playerPosition.y - 1)
      if (tile.x === playerPosition.x && 
          (tile.y === playerPosition.y || tile.y === playerPosition.y - 1)) {
        return false;
      }

      // 3. Check for forbidden tiles overlap
      if (forbiddenSet.has(`${tile.x},${tile.y}`)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Scores critical ring points based on unreachable tiles in their vicinity
   * 
   * @param {Array} criticalRing - Array of critical ring points
   * @param {ndarray} grid - The grid to analyze
   * @param {Array} reachableTiles - Array of currently reachable tile positions
   * @param {number} window - Window size for scoring (default: 5)
   * @returns {Object} Object with candidate points and their scores
   */
  scoreCriticalRingPoints(criticalRing, grid, reachableTiles, window = 7) {
    if (!criticalRing || criticalRing.length === 0) {
      return { candidatePoints: [], scores: {} };
    }

    const [width, height] = grid.shape;
    const scores = {};
    
    // Create a set of reachable positions for efficient lookup
    const reachableSet = new Set();
    for (const tile of reachableTiles) {
      reachableSet.add(`${tile.x},${tile.y}`);
    }

    // Score each point in the critical ring
    for (const point of criticalRing) {
      const pointKey = `${point.x},${point.y}`;
      scores[pointKey] = 0;
      const x = point.x;
      const y = point.y;
      
      // Check window around the point
      for (let dx = -window; dx <= window; dx++) {
        for (let dy = -window; dy <= window; dy++) {
          const checkX = x + dx;
          const checkY = y + dy;
          
          // Check bounds
          if (checkX >= 0 && checkX < width && checkY >= 0 && checkY < height) {
            // Check if this position is unreachable (not in reachableSet)
            if (!reachableSet.has(`${checkX},${checkY}`) && grid.get(checkX, checkY) === 0) {
              scores[pointKey]++;
            }
          }
        }
      }
    }

    // Sort all points by score descending, return all points
    const sortedPointKeys = Object.keys(scores)
      .sort((a, b) => scores[b] - scores[a]);

    // Convert all sorted point keys back to point objects
    const candidatePoints = sortedPointKeys.map(pointKey => {
      const [x, y] = pointKey.split(',').map(Number);
      return { x, y };
    });

    return { candidatePoints, scores };
  }

  /**
   * Shuffles an array using Fisher-Yates algorithm
   * 
   * @param {Array} array - Array to shuffle
   * @param {Function} rng - Random number generator function
   * @returns {Array} Shuffled array
   */
  shuffleArray(array, rng) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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
   * @param {Array<Object>} forbiddenTiles - Optional array of forbidden tile positions {x, y} where no platform can be placed
   * @returns {Array<Object>} Array of placed platform objects
   */
  placePlatforms(grid, playerPosition, rng, forbiddenTiles = []) {
    if (!grid || !playerPosition || !rng) {
      return [];
    }

    const platforms = [];
    let iterations = 0;
    
    // Compute initial reachable tiles and reachability
    let reachableTiles = this.physicsAnalyzer.detectReachablePositionsFromStartingPoint(
      grid, playerPosition, null
    );
    let currentReachability = this.calculateReachabilityPercentage(grid, playerPosition, reachableTiles);

    // Determine direction based on reachable tiles
    // Create a set of reachable positions for efficient lookup
    let reachableSet = new Set();
    for (const tile of reachableTiles) {
      reachableSet.add(`${tile.x},${tile.y}`);
    }

    // Create a set of forbidden positions for efficient lookup
    const forbiddenSet = new Set();
    for (const tile of forbiddenTiles) {
      forbiddenSet.add(`${tile.x},${tile.y}`);
    }

    
    // Continue placing platforms until target is achieved or max iterations reached
    let changed = true;
    while (currentReachability < this.targetReachability && iterations < this.maxIterations && changed) {
      changed = false;
      iterations++;
      
      // Find critical ring for optimal placement
      const referenceCriticalRing = this.criticalRingAnalyzer.findCriticalRing(playerPosition, grid);
      // Perform a second pass to find the critical ring, using the reference critical ring as a starting point
      // This is to ensure the player can always reach the critical ring
      // const criticalRing = this.criticalRingAnalyzer.findCriticalRing(playerPosition, grid, referenceCriticalRing);
      const criticalRing = referenceCriticalRing;
      
      if (!referenceCriticalRing || referenceCriticalRing.length === 0) {
        // No critical ring found, cannot place more platforms
        break;
      }
      
      // Score critical ring points and select best candidate
      const { candidatePoints, scores } = this.scoreCriticalRingPoints(criticalRing, grid, reachableTiles);
      
      if (candidatePoints.length === 0) {
        // No valid candidates found, cannot place more platforms
        break;
      }
      
      // Choose a random candidate from the best scoring points
      // Iterate all candidate points (already sorted by score) to find a valid placement
      let platform = null;
      let placementPosition = null;
      let platformType = null;
      let platformSize = null;
      let platformPlaced = false;

      for (let i = 0; i < candidatePoints.length && !platformPlaced; i++) {
        const referencePlacementPosition = candidatePoints[i];

        for (let direction = -1; direction <= 1 && !platformPlaced; direction += 2) {

          // Sample platform type
          platformType = this.samplePlatformType(rng);
          
          // Get all valid platform sizes and shuffle them
          const validSizes = this.getAllValidPlatformSizes(referencePlacementPosition, direction, grid);
          const shuffledSizes = this.shuffleArray(validSizes, rng);

          // Try each size
          for (let j = 0; j < shuffledSizes.length && !platformPlaced; j++) {
            platformSize = shuffledSizes[j];

            // Compute initial placement position based on direction
            if (direction === -1) {
              placementPosition = {
                x: Math.max(0, referencePlacementPosition.x - platformSize + 1),
                y: referencePlacementPosition.y
              };
            } else {
              placementPosition = {
                x: referencePlacementPosition.x,
                y: referencePlacementPosition.y
              };
            }

            // Create platform based on type
            if (platformType === 'floating') {
              platform = this.createFloatingPlatform(placementPosition, platformSize, 1);
            } else if (platformType === 'moving') {
              platform = this.createMovingPlatform(placementPosition, platformSize, 1);
            } else {
              throw new Error('Invalid platform type');
              // Skip invalid platform type
              continue;
            }

            // // Make sure the platform has at least one non reachable up tile
            // There are cases where the platform has all reachable neighbours and it still contributes to reachability
            // let hasNonReachableUpTile = false;
            // for (const tile of platform.getOccupiedTiles()) {
            //   const neighbor = { x: tile.x, y: tile.y - 1 };
            //   if (!reachableSet.has(`${neighbor.x},${neighbor.y}`)) {
            //     hasNonReachableUpTile = true;
            //     continue;
            //   }
            // }
            // if (!hasNonReachableUpTile) {
            //   continue;
            // }

            // Check that the platform is valid
            if (!this.validatePlatform(grid, platform, playerPosition, forbiddenSet)) {
              // console.log(`Discarded platform at ${referencePlacementPosition.x}, ${referencePlacementPosition.y} because it overlaps with the player or forbidden tiles`);
              continue;
            }

            // Validate that platform improves reachability
            if (this.validatePlatformImprovement(grid, platform, playerPosition, reachableTiles)) {
              changed = true;
              platformPlaced = true;
              console.log('Found valid platform');
              console.log(`platform: ${platform.x}, ${platform.y}, ${platform.width}, ${platform.height}`);
              console.log(toAsciiArt(grid, { 
                reachableTiles: reachableTiles, 
                player: playerPosition, 
                platforms: [platform] 
              }));
              
              // Mark platform as walls in the actual grid
              this.markPlatformAsWalls(grid, platform);
              
              // Add platform to results
              platforms.push(platform);
              
              // Update reachable tiles and reachability
              reachableTiles = this.physicsAnalyzer.detectReachablePositionsFromStartingPoint(
                grid, playerPosition, null
              );
              currentReachability = this.calculateReachabilityPercentage(grid, playerPosition, reachableTiles);

              // Update reachable set
              reachableSet = new Set();
              for (const tile of reachableTiles) {
                reachableSet.add(`${tile.x},${tile.y}`);
              }
            }
          }
        }
      }

    }
    
    return platforms;
  }
}

module.exports = StrategicPlatformPlacer; 