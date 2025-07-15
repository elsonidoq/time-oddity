/**
 * @fileoverview Strategic Coin Distribution Algorithm
 * Implements strategic coin distribution with dead-end detection,
 * exploration analysis, and distribution optimization.
 */

const ndarray = require('ndarray');
const GridUtilities = require('../core/GridUtilities');

/**
 * CoinDistributor class for strategic coin placement
 * 
 * Handles strategic coin distribution with multiple placement strategies:
 * - Dead-end detection for exploration incentivization
 * - Exploration area analysis and scoring
 * - Unreachable area placement to incentivize platform usage
 * - Distribution optimization for balanced placement
 * 
 * @class CoinDistributor
 */
class CoinDistributor {
  /**
   * Creates a new CoinDistributor instance
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
   * Detects dead-end corridors in the grid
   * 
   * @param {ndarray} grid - The grid to analyze
   * @returns {Array<Object>} Array of dead-end positions {x, y}
   * @throws {Error} If grid is null or undefined
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
    // This means it's at the end of a corridor
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
    
    // Score each area based on distance from main path
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
    const maxDistance = Math.max(width, height);
    
    // Calculate distance from main path (simplified: distance from center)
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const distance = Math.sqrt(
      Math.pow(position.x - centerX, 2) + Math.pow(position.y - centerY, 2)
    );
    
    // Normalize distance to 0-1 range
    return Math.min(distance / maxDistance, 1.0);
  }

  /**
   * Identifies areas that will require platforms to reach
   * 
   * @param {ndarray} grid - The grid to analyze
   * @param {Object} playerPos - Player position {x, y}
   * @returns {Array<Object>} Array of unreachable area positions {x, y}
   * @throws {Error} If player position is null
   */
  identifyUnreachableAreas(grid, playerPos) {
    if (!playerPos) {
      throw new Error('Player position is required');
    }

    if (!grid) {
      throw new Error('Grid is required');
    }

    const [width, height] = grid.shape;
    const unreachableAreas = [];
    
    // Very conservative heuristic: only mark areas that are clearly unreachable
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid.get(x, y) === 0) {
          const distance = Math.sqrt(
            Math.pow(x - playerPos.x, 2) + Math.pow(y - playerPos.y, 2)
          );
          
          // Only consider areas that are very far from player or require significant vertical movement
          const verticalDistance = Math.abs(y - playerPos.y);
          const horizontalDistance = Math.abs(x - playerPos.x);
          
          // Mark as unreachable if:
          // 1. Very far horizontally (> 10 tiles) OR
          // 2. Requires significant vertical movement (> 4 tiles) AND is not on same horizontal level
          if ((horizontalDistance > 10) || (verticalDistance > 4 && horizontalDistance > 4)) {
            unreachableAreas.push({ x, y });
          }
        }
      }
    }
    
    return unreachableAreas;
  }

  /**
   * Distributes coins according to strategic algorithm
   * 
   * @param {ndarray} grid - The grid to place coins in
   * @param {Object} playerPos - Player position {x, y}
   * @param {RandomGenerator} rng - Random number generator
   * @returns {Array<Object>} Array of coin objects
   * @throws {Error} If required parameters are missing
   */
  distributeCoins(grid, playerPos, rng) {
    if (!grid) {
      throw new Error('Grid is required');
    }
    
    if (!playerPos) {
      throw new Error('Player position is required');
    }
    
    if (!rng) {
      throw new Error('RandomGenerator is required');
    }

    const coins = [];
    const usedPositions = new Set();
    
    // Get candidate positions from different strategies
    const deadEnds = this.detectDeadEnds(grid);
    const explorationAnalysis = this.analyzeExplorationAreas(grid);
    const unreachableAreas = this.identifyUnreachableAreas(grid, playerPos);
    
    // Count total available floor tiles
    const [width, height] = grid.shape;
    let totalFloorTiles = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid.get(x, y) === 0) {
          totalFloorTiles++;
        }
      }
    }
    
    // Limit coin count to available floor tiles
    const maxCoins = Math.min(this.coinCount, totalFloorTiles);
    
    // Calculate number of coins for each strategy
    const deadEndCoins = Math.floor(maxCoins * this.deadEndWeight);
    const explorationCoins = Math.floor(maxCoins * this.explorationWeight);
    const unreachableCoins = maxCoins - deadEndCoins - explorationCoins;
    
    // Place coins in dead-ends
    this.placeCoinsFromCandidates(deadEnds, deadEndCoins, coins, usedPositions, rng);
    
    // Place coins in exploration areas
    const explorationCandidates = this.getTopScoredPositions(explorationAnalysis, explorationCoins);
    this.placeCoinsFromCandidates(explorationCandidates, explorationCoins, coins, usedPositions, rng);
    
    // Place coins in unreachable areas
    this.placeCoinsFromCandidates(unreachableAreas, unreachableCoins, coins, usedPositions, rng);
    
    return coins;
  }

  /**
   * Places coins from a list of candidates
   * 
   * @param {Array<Object>} candidates - Candidate positions
   * @param {number} targetCount - Target number of coins to place
   * @param {Array<Object>} coins - Array to add coins to
   * @param {Set} usedPositions - Set of already used positions
   * @param {RandomGenerator} rng - Random number generator
   * @private
   */
  placeCoinsFromCandidates(candidates, targetCount, coins, usedPositions, rng) {
    const shuffled = [...candidates].sort(() => rng.random() - 0.5);
    
    for (const candidate of shuffled) {
      if (coins.length >= targetCount) break;
      
      const key = `${candidate.x},${candidate.y}`;
      if (!usedPositions.has(key) && this.isValidCoinPosition(candidate, coins)) {
        coins.push({
          type: 'coin',
          x: candidate.x,
          y: candidate.y,
          properties: { value: 100 }
        });
        usedPositions.add(key);
      }
    }
  }

  /**
   * Gets top scored positions from exploration analysis
   * 
   * @param {Object} analysis - Exploration analysis result
   * @param {number} count - Number of positions to return
   * @returns {Array<Object>} Top scored positions
   * @private
   */
  getTopScoredPositions(analysis, count) {
    const scoredPositions = analysis.explorationAreas.map(pos => ({
      ...pos,
      score: analysis.scores[`${pos.x},${pos.y}`] || 0
    }));
    
    // Sort by score (descending) and take top positions
    return scoredPositions
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(pos => ({ x: pos.x, y: pos.y }));
  }

  /**
   * Checks if a position is valid for coin placement
   * 
   * @param {Object} position - Position to check {x, y}
   * @param {Array<Object>} existingCoins - Existing coins
   * @returns {boolean} True if position is valid
   * @private
   */
  isValidCoinPosition(position, existingCoins) {
    // Check minimum distance from existing coins
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
   * Calculates distribution quality metrics
   * 
   * @param {Array<Object>} coins - Array of placed coins
   * @param {ndarray} grid - The grid
   * @param {Object} playerPos - Player position
   * @returns {Object} Distribution metrics
   */
  calculateDistributionMetrics(coins, grid, playerPos) {
    const metrics = {
      totalCoins: coins.length,
      deadEndCoins: 0,
      explorationCoins: 0,
      unreachableCoins: 0,
      averageDistance: 0,
      coverageScore: 0
    };
    
    if (coins.length === 0) {
      return metrics;
    }
    
    // Categorize coins by placement strategy
    const deadEnds = this.detectDeadEnds(grid);
    const unreachableAreas = this.identifyUnreachableAreas(grid, playerPos);
    
    for (const coin of coins) {
      const pos = { x: coin.x, y: coin.y };
      
      if (deadEnds.some(de => de.x === pos.x && de.y === pos.y)) {
        metrics.deadEndCoins++;
      } else if (unreachableAreas.some(ua => ua.x === pos.x && ua.y === pos.y)) {
        metrics.unreachableCoins++;
      } else {
        metrics.explorationCoins++;
      }
    }
    
    // Calculate average distance from player
    let totalDistance = 0;
    for (const coin of coins) {
      const distance = Math.sqrt(
        Math.pow(coin.x - playerPos.x, 2) + Math.pow(coin.y - playerPos.y, 2)
      );
      totalDistance += distance;
    }
    metrics.averageDistance = totalDistance / coins.length;
    
    // Calculate coverage score (simplified)
    const [width, height] = grid.shape;
    const totalArea = width * height;
    metrics.coverageScore = coins.length / Math.min(totalArea, 100); // Normalize
    
    return metrics;
  }

  /**
   * Validates coin placement against collision detection and ensures all surrounding tiles at distance 1 are floor
   * 
   * @param {Object} coin - Coin position {x, y}
   * @param {Array<Object>} platforms - Array of platform objects
   * @param {ndarray} grid - The grid to check surrounding tiles
   * @returns {boolean} True if placement is valid
   */
  validateCoinPlacement(coin, platforms, grid) {
    if (!platforms || platforms.length === 0) {
      // Still need to check surrounding tiles even if no platforms
    }
    
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
   * Checks if a coin collides with a platform
   * 
   * @param {Object} coin - Coin position {x, y}
   * @param {Object} platform - Platform object
   * @returns {boolean} True if collision occurs
   * @private
   */
  coinCollidesWithPlatform(coin, platform) {
    // Convert tile coordinates to pixel coordinates
    const tileSize = 64;
    const coinPixelX = coin.x * tileSize;
    const coinPixelY = coin.y * tileSize;
    
    // Check if coin is inside platform bounds
    const platformRight = platform.x + platform.width;
    const platformBottom = platform.y + platform.height;
    
    return coinPixelX >= platform.x && 
           coinPixelX < platformRight &&
           coinPixelY >= platform.y && 
           coinPixelY < platformBottom;
  }
}

module.exports = CoinDistributor; 