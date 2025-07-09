/**
 * @fileoverview Critical Ring Analysis System
 * Implements critical ring analysis for optimal platform placement
 */

const ReachableFrontierAnalyzer = require('./ReachableFrontierAnalyzer');

/**
 * CriticalRingAnalyzer class for identifying optimal platform placement locations
 * Finds tiles that are one step closer to the player than the frontier
 */
class CriticalRingAnalyzer {
  /**
   * Creates a new CriticalRingAnalyzer instance
   * @param {Object} config - Configuration options for frontier analyzer
   * @param {number} config.jumpHeight - Player jump height in pixels (default: 800)
   * @param {number} config.gravity - Gravity in pixels/s² (default: 980)
   */
  constructor(config = {}) {
    this.frontierAnalyzer = new ReachableFrontierAnalyzer(config);
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
   * Finds the critical ring - tiles that are one step closer to the player than the frontier
   * @param {Object} playerPosition - Player position {x, y}
   * @param {ndarray} grid - The grid to analyze
   * @returns {Array<Object>} Array of critical ring tile positions
   */
  findCriticalRing(playerPosition, grid) {
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

    // Get frontier tiles using the frontier analyzer
    const frontierTiles = this.frontierAnalyzer.findReachableFrontier(playerPosition, grid);
    
    if (frontierTiles.length === 0) {
      return [];
    }

    // Create a set of frontier positions for fast lookup
    const frontierSet = new Set();
    frontierTiles.forEach(tile => {
      frontierSet.add(`${tile.x},${tile.y}`);
    });

    // Get all reachable tiles to find the critical ring
    const reachableTiles = this.frontierAnalyzer.physicsAnalyzer.detectReachablePositionsFromStartingPoint(
      grid,
      playerPosition,
      null // maxMoves = null for unlimited exploration
    );

    // Find critical ring tiles - reachable tiles that have at least one frontier neighbor
    const criticalRing = [];
    for (const tile of reachableTiles) {
      const tileKey = `${tile.x},${tile.y}`;
      // Exclude tiles that are in the frontier
      if (frontierSet.has(tileKey)) {
        continue;
      }
      const neighbors = this.getNeighboringTiles(tile, grid);
      let hasFrontierNeighbor = false;
      
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        // If neighbor is in the frontier, this tile is in the critical ring
        if (frontierSet.has(neighborKey)) {
          hasFrontierNeighbor = true;
          break;
        }
      }
      
      if (hasFrontierNeighbor) {
        criticalRing.push(tile);
      }
    }

    return criticalRing;
  }
}

module.exports = CriticalRingAnalyzer; 