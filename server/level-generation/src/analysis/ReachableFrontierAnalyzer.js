/**
 * @fileoverview Reachable Frontier Analysis System
 * Implements reachable frontier analysis for optimal platform placement
 */

const PhysicsAwareReachabilityAnalyzer = require('./PhysicsAwareReachabilityAnalyzer');

/**
 * ReachableFrontierAnalyzer class for identifying the furthest reachable tiles
 * from the player position, which are optimal locations for platform placement
 */
class ReachableFrontierAnalyzer {
  /**
   * Creates a new ReachableFrontierAnalyzer instance
   * @param {Object} config - Configuration options for physics analyzer
   * @param {number} config.jumpHeight - Player jump height in pixels (default: 800)
   * @param {number} config.gravity - Gravity in pixels/s² (default: 980)
   */
  constructor(config = {}) {
    this.physicsAnalyzer = new PhysicsAwareReachabilityAnalyzer(config);
  }

  /**
   * Calculates Manhattan distance between two positions
   * @param {Object} playerPos - Player position {x, y}
   * @param {Object} tilePos - Tile position {x, y}
   * @returns {number} Manhattan distance
   * @private
   */
  calculateManhattanDistance(playerPos, tilePos) {
    return Math.abs(tilePos.x - playerPos.x) + Math.abs(tilePos.y - playerPos.y);
  }

  /**
   * Gets all valid neighboring tiles for a given position
   * @param {Object} tile - Tile position {x, y}
   * @param {ndarray} grid - The grid to check
   * @returns {Array<Object>} Array of neighboring tile positions
   * @private
   */
  getNeighboringTiles(tile, grid) {
    const [width, height] = grid.shape;
    const neighbors = [];
    
    // Check all 4 directions: up, down, left, right
    const directions = [
      { x: 0, y: -1 }, // up
      { x: 0, y: 1 },  // down
      { x: -1, y: 0 }, // left
      { x: 1, y: 0 }   // right
    ];
    
    for (const dir of directions) {
      const neighborX = tile.x + dir.x;
      const neighborY = tile.y + dir.y;
      
      // Check bounds
      if (neighborX >= 0 && neighborX < width && 
          neighborY >= 0 && neighborY < height) {
        neighbors.push({ x: neighborX, y: neighborY });
      }
    }
    
    return neighbors;
  }

  /**
   * Finds the reachable frontier - tiles that are reachable and have at least one non-reachable floor neighbor
   * @param {Object} playerPosition - Player position {x, y}
   * @param {ndarray} grid - The grid to analyze
   * @returns {Array<Object>} Array of frontier tile positions
   */
  findReachableFrontier(playerPosition, grid) {
    // Validate inputs
    if (!playerPosition) {
      throw new Error('Player position is required');
    }
    if (playerPosition.x === undefined || playerPosition.y === undefined) {
      throw new Error('Player position must have x and y coordinates');
    }
    if (!grid) {
      throw new Error('Grid is required');
    }

    // Get all reachable tiles from player position
    const reachableTiles = this.physicsAnalyzer.detectReachablePositionsFromStartingPoint(
      grid,
      playerPosition,
      null // maxMoves = null for unlimited exploration
    );
    if (reachableTiles.length === 0) {
      return [];
    }
    // Create a set of reachable positions for fast lookup
    const reachableSet = new Set();
    reachableTiles.forEach(tile => {
      reachableSet.add(`${tile.x},${tile.y}`);
    });
    // Find frontier tiles - reachable tiles with at least one non-reachable floor neighbor
    const frontier = [];
    for (const tile of reachableTiles) {
      const neighbors = this.getNeighboringTiles(tile, grid);
      let isFrontier = false;
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        // If neighbor is a floor tile (0) and not reachable, mark as frontier
        if (grid.get(neighbor.x, neighbor.y) === 0 && !reachableSet.has(neighborKey)) {
          isFrontier = true;
          break;
        }
      }
      if (isFrontier) {
        frontier.push(tile);
      }
    }
    return frontier;
  }
}

module.exports = ReachableFrontierAnalyzer; 