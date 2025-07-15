/**
 * @fileoverview Reachable Coin Placement Algorithm
 * Implements strategic coin placement in reachable areas after platform placement
 */

const ndarray = require('ndarray');
const PhysicsAwareReachabilityAnalyzer = require('../analysis/PhysicsAwareReachabilityAnalyzer');
const GridUtilities = require('../core/GridUtilities');

/**
 * ReachableCoinPlacer class for strategic coin placement in reachable areas
 * 
 * Handles strategic coin placement with multiple placement strategies:
 * - Dead-end detection for exploration incentivization
 * - Exploration area analysis and scoring
 * - Collision prevention with platforms
 * - Distribution optimization for balanced placement
 * 
 * @class ReachableCoinPlacer
 */
class ReachableCoinPlacer {
  /**
   * Creates a new ReachableCoinPlacer instance
   * 
   * @param {Object} config - Configuration options
   * @param {number} config.coinCount - Number of coins to distribute (default: 10)
   * @param {number} config.deadEndWeight - Weight for dead-end placement (default: 0.4)
   * @param {number} config.explorationWeight - Weight for exploration placement (default: 0.3)
   * @param {number} config.unreachableWeight - Weight for unreachable placement (default: 0.3)
   * @param {number} config.minDistance - Minimum distance between coins (default: 2)
   */
  constructor(config = {}) {
    this.coinCount = config.coinCount !== undefined ? config.coinCount : 10;
    this.deadEndWeight = config.deadEndWeight !== undefined ? config.deadEndWeight : 0.4;
    this.explorationWeight = config.explorationWeight !== undefined ? config.explorationWeight : 0.3;
    this.unreachableWeight = config.unreachableWeight !== undefined ? config.unreachableWeight : 0.3;
    this.minDistance = config.minDistance !== undefined ? config.minDistance : 2;
    
    // Initialize reachability analyzer
    this.reachabilityAnalyzer = new PhysicsAwareReachabilityAnalyzer();
    
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
    if (config.coinCount !== undefined && config.coinCount <= 0) {
      throw new Error('coinCount must be positive');
    }
    
    if (config.deadEndWeight !== undefined && (config.deadEndWeight < 0 || config.deadEndWeight > 1)) {
      throw new Error('deadEndWeight must be between 0 and 1');
    }
    
    if (config.explorationWeight !== undefined && (config.explorationWeight < 0 || config.explorationWeight > 1)) {
      throw new Error('explorationWeight must be between 0 and 1');
    }
    
    if (config.unreachableWeight !== undefined && (config.unreachableWeight < 0 || config.unreachableWeight > 1)) {
      throw new Error('unreachableWeight must be between 0 and 1');
    }
    
    if (config.minDistance !== undefined && config.minDistance <= 0) {
      throw new Error('minDistance must be positive');
    }
    
    // Validate that weights sum to 1.0
    const totalWeight = this.deadEndWeight + this.explorationWeight + this.unreachableWeight;
    if (Math.abs(totalWeight - 1.0) > 0.001) {
      throw new Error('Weights must sum to 1.0');
    }
  }

  /**
   * Places coins strategically in reachable areas after platform placement
   * 
   * @param {ndarray} grid - The grid to analyze
   * @param {Object} playerPos - Player position {x, y}
   * @param {Array} platforms - Array of platform objects
   * @param {Function} rng - Random number generator function
   * @returns {Array<Object>} Array of coin positions {x, y}
   */
  placeCoins(grid, playerPos, platforms, rng) {
    if (!grid) {
      throw new Error('Grid is required');
    }
    
    if (!playerPos) {
      throw new Error('Player position is required');
    }
    
    if (!platforms) {
      platforms = [];
    }
    
    if (!rng) {
      throw new Error('Random number generator is required');
    }

    // Get all reachable positions from player
    const reachablePositions = this.reachabilityAnalyzer.detectReachablePositionsFromStartingPoint(grid, playerPos);

    // Assert that at least 60% of the grid is reachable from the player position
    const totalGridSpaces = grid.shape[0] * grid.shape[1];
    let wallCount = 0;
    for (let x = 0; x < grid.shape[0]; x++) {
      for (let y = 0; y < grid.shape[1]; y++) {
        if (grid.get(x, y) === 1) {
          wallCount++;
        }
      }
    }

    const reachableRatio = reachablePositions.length / (totalGridSpaces - wallCount);
    if (reachableRatio < 0.6) {
      throw new Error(
        `Reachable area too low: only ${(reachableRatio * 100).toFixed(2)}% of grid is reachable from player (expected at least 60%).`
      );
    }
    
    if (reachablePositions.length === 0) {
      return [];
    }

    // Filter out positions that collide with platforms
    const validPositions = reachablePositions.filter(pos => 
      this.validateCoinPlacement(pos, platforms, grid)
    );

    if (validPositions.length === 0) {
      return [];
    }

    // Analyze different placement strategies
    const deadEnds = this.detectDeadEnds(grid);
    const explorationAnalysis = this.analyzeExplorationAreas(grid);
    
    // Create candidate lists for each strategy
    const deadEndCandidates = validPositions.filter(pos => 
      deadEnds.some(deadEnd => deadEnd.x === pos.x && deadEnd.y === pos.y)
    );
    
    const explorationCandidates = validPositions.filter(pos => 
      explorationAnalysis.explorationAreas.some(area => area.x === pos.x && area.y === pos.y)
    );
    
    const generalCandidates = validPositions.filter(pos => 
      !deadEndCandidates.some(candidate => candidate.x === pos.x && candidate.y === pos.y) &&
      !explorationCandidates.some(candidate => candidate.x === pos.x && candidate.y === pos.y)
    );

    // Calculate target counts for each strategy
    const totalTarget = Math.min(this.coinCount, validPositions.length);
    const deadEndTarget = Math.floor(totalTarget * this.deadEndWeight);
    const explorationTarget = Math.floor(totalTarget * this.explorationWeight);
    const generalTarget = totalTarget - deadEndTarget - explorationTarget;

    // Place coins using each strategy
    const coins = [];
    const usedPositions = new Set();

    // Place dead-end coins
    this.placeCoinsFromCandidates(deadEndCandidates, deadEndTarget, coins, usedPositions, rng);
    
    // Place exploration coins
    this.placeCoinsFromCandidates(explorationCandidates, explorationTarget, coins, usedPositions, rng);
    
    // Place general coins
    this.placeCoinsFromCandidates(generalCandidates, generalTarget, coins, usedPositions, rng);

    return coins;
  }

  /**
   * Detects dead-end corridors in the grid
   * 
   * @param {ndarray} grid - The grid to analyze
   * @returns {Array<Object>} Array of dead-end positions {x, y}
   */
  detectDeadEnds(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const [width, height] = grid.shape;
    const deadEnds = [];
    
    // Scan the grid for dead-end corridors
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid.get(x, y) === 0 && this.isDeadEnd(grid, x, y)) {
          deadEnds.push({ x, y });
        }
      }
    }
    
    return deadEnds;
  }

  /**
   * Checks if a position is a dead-end corridor
   * 
   * @param {ndarray} grid - The grid to check
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} True if the position is a dead-end
   * @private
   */
  isDeadEnd(grid, x, y) {
    const [width, height] = grid.shape;
    let floorNeighbors = 0;

    // Only check 4 cardinal directions
    const directions = [
      { dx: 0, dy: -1 }, // N
      { dx: -1, dy: 0 }, // W
      { dx: 1, dy: 0 },  // E
      { dx: 0, dy: 1 }   // S
    ];

    for (const dir of directions) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        if (grid.get(nx, ny) === 0) {
          floorNeighbors++;
        }
      }
    }

    // A dead-end has exactly one floor neighbor (the path leading to it)
    return floorNeighbors === 1;
  }

  /**
   * Analyzes exploration areas and scores them
   * 
   * @param {ndarray} grid - The grid to analyze
   * @returns {Object} Analysis result with exploration areas and scores
   */
  analyzeExplorationAreas(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const [width, height] = grid.shape;
    const explorationAreas = [];
    const scores = {};
    
    // Find all floor tiles
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid.get(x, y) === 0) {
          explorationAreas.push({ x, y });
        }
      }
    }
    
    // If no floor tiles found, return empty result
    if (explorationAreas.length === 0) {
      return {
        explorationAreas: [],
        scores: {}
      };
    }
    
    // Score each area based on distance from center
    for (const area of explorationAreas) {
      const score = this.calculateExplorationScore(grid, area);
      scores[`${area.x},${area.y}`] = score;
    }
    
    return {
      explorationAreas,
      scores
    };
  }

  /**
   * Calculates exploration score for a position
   * 
   * @param {ndarray} grid - The grid to analyze
   * @param {Object} position - Position to score {x, y}
   * @returns {number} Score between 0 and 1
   * @private
   */
  calculateExplorationScore(grid, position) {
    const [width, height] = grid.shape;
    
    // Calculate distance from center
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const distance = Math.sqrt(
      Math.pow(position.x - centerX, 2) + Math.pow(position.y - centerY, 2)
    );
    
    // Normalize distance to 0-1 range
    const maxDistance = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
    return distance / maxDistance;
  }

  /**
   * Places coins from a list of candidates
   * 
   * @param {Array} candidates - List of candidate positions
   * @param {number} targetCount - Target number of coins to place
   * @param {Array} coins - Array to add placed coins to
   * @param {Set} usedPositions - Set of already used positions
   * @param {Function} rng - Random number generator
   * @private
   */
  placeCoinsFromCandidates(candidates, targetCount, coins, usedPositions, rng) {
    const availableCandidates = candidates.filter(pos => 
      !usedPositions.has(`${pos.x},${pos.y}`)
    );
    
    const actualCount = Math.min(targetCount, availableCandidates.length);
    
    for (let i = 0; i < actualCount; i++) {
      const randomIndex = Math.floor(rng() * availableCandidates.length);
      const selectedPos = availableCandidates.splice(randomIndex, 1)[0];
      
      // Check minimum distance from existing coins
      if (this.isValidCoinPosition(selectedPos, coins)) {
        coins.push(selectedPos);
        usedPositions.add(`${selectedPos.x},${selectedPos.y}`);
      }
    }
  }

  /**
   * Checks if a coin position is valid (respects minimum distance)
   * 
   * @param {Object} position - Position to check {x, y}
   * @param {Array} existingCoins - Array of existing coin positions
   * @returns {boolean} True if position is valid
   * @private
   */
  isValidCoinPosition(position, existingCoins) {
    for (const coin of existingCoins) {
      const distance = Math.sqrt(
        Math.pow(position.x - coin.x, 2) + Math.pow(position.y - coin.y, 2)
      );
      if (distance < this.minDistance) {
        return false;
      }
    }
    return true;
  }

  /**
   * Checks if a coin collides with a platform
   * 
   * @param {Object} coin - Coin position {x, y}
   * @param {Object} platform - Platform object
   * @returns {boolean} True if collision detected
   */
  coinCollidesWithPlatform(coin, platform) {
    const tileSize = 64; // Standard tile size
    const platformTiles = Math.ceil(platform.width / tileSize);
    
    // Check if coin is within platform bounds
    for (let i = 0; i < platformTiles; i++) {
      const platformX = platform.x / tileSize + i;
      const platformY = platform.y / tileSize;
      
      if (coin.x === platformX && coin.y === platformY) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Validates coin placement against all platforms and ensures all surrounding tiles at distance 1 are floor
   * 
   * @param {Object} coin - Coin position {x, y}
   * @param {Array} platforms - Array of platform objects
   * @param {ndarray} grid - The grid to check surrounding tiles
   * @returns {boolean} True if placement is valid
   */
  validateCoinPlacement(coin, platforms, grid) {
    // Check platform collisions
    for (const platform of platforms) {
      if (this.coinCollidesWithPlatform(coin, platform)) {
        return false;
      }
    }
    
    // Check that all surrounding tiles at distance 1 are floor (value = 0)
    const [width, height] = grid.shape;
    const x = coin.x;
    const y = coin.y;
    
    // Check all 8 surrounding tiles (including diagonals)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        // Skip the coin's own position
        if (dx === 0 && dy === 0) {
          continue;
        }
        
        const checkX = x + dx;
        const checkY = y + dy;
        
        // Check bounds
        if (checkX >= 0 && checkX < width && checkY >= 0 && checkY < height) {
          // If any surrounding tile is not floor (value != 0), the placement is invalid
          if (grid.get(checkX, checkY) !== 0) {
            return false;
          }
        } else {
          // If the surrounding tile is out of bounds, consider it invalid
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Calculates distribution metrics for placed coins
   * 
   * @param {Array} coins - Array of coin positions
   * @param {ndarray} grid - The grid
   * @param {Object} playerPos - Player position
   * @returns {Object} Distribution metrics
   */
  calculateDistributionMetrics(coins, grid, playerPos) {
    if (coins.length === 0) {
      return {
        totalCoins: 0,
        averageDistance: 0,
        coverage: 0
      };
    }

    // Calculate average distance from player
    let totalDistance = 0;
    for (const coin of coins) {
      const distance = Math.sqrt(
        Math.pow(coin.x - playerPos.x, 2) + Math.pow(coin.y - playerPos.y, 2)
      );
      totalDistance += distance;
    }
    const averageDistance = totalDistance / coins.length;

    // Calculate coverage (percentage of reachable area with coins)
    const reachablePositions = this.reachabilityAnalyzer.detectReachablePositionsFromStartingPoint(grid, playerPos);
    const coverage = coins.length / reachablePositions.length;

    return {
      totalCoins: coins.length,
      averageDistance,
      coverage
    };
  }
}

module.exports = ReachableCoinPlacer; 