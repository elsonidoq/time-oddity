/**
 * @fileoverview A* Pathfinding Integration with ndarray grids
 * Provides comprehensive pathfinding capabilities for level generation
 */

const PF = require('pathfinding');
const ndarrayUnpack = require('ndarray-unpack');

/**
 * PathfindingIntegration class for A* pathfinding with ndarray grids
 * Handles grid conversion, pathfinding, and validation
 */
class PathfindingIntegration {
  /**
   * Creates a new PathfindingIntegration instance
   * @param {Object} config - Configuration options
   * @param {boolean} config.allowDiagonal - Allow diagonal movement
   * @param {boolean} config.dontCrossCorners - Don't allow cutting corners
   */
  constructor(config = {}) {
    this.allowDiagonal = config.allowDiagonal || false;
    this.dontCrossCorners = config.dontCrossCorners !== false; // Default to true
    
    // Create A* finder with configuration
    this.finder = new PF.AStarFinder({
      allowDiagonal: this.allowDiagonal,
      dontCrossCorners: this.dontCrossCorners
    });
  }

  /**
   * Converts ndarray grid to pathfinding.js grid format
   * @param {ndarray} grid - The ndarray grid to convert
   * @returns {PF.Grid} Pathfinding grid
   * @throws {Error} If grid is invalid or empty
   */
  convertNdarrayToPathfindingGrid(grid) {
    // Validate input
    if (!grid) {
      throw new Error('Grid is required');
    }

    if (!grid.shape || grid.shape.length !== 2) {
      throw new Error('Grid must be 2-dimensional');
    }

    const [width, height] = grid.shape;
    
    if (width <= 0 || height <= 0) {
      throw new Error('Grid dimensions must be positive');
    }

    // Convert ndarray to 2D array using ndarray-unpack
    const matrix = ndarrayUnpack(grid);
    
    // Create pathfinding grid
    // Note: pathfinding.js uses 0 for walkable, 1 for unwalkable
    // Our ndarray uses 0 for floor (walkable), 1 for wall (unwalkable)
    // So the mapping is already correct
    return new PF.Grid(matrix);
  }

  /**
   * Finds path between two points using A* algorithm
   * @param {ndarray} grid - The ndarray grid
   * @param {Object} start - Start coordinates {x, y}
   * @param {Object} end - End coordinates {x, y}
   * @returns {Array<Array<number>>} Array of coordinate pairs [[x, y], ...]
   * @throws {Error} If coordinates are invalid or out of bounds
   */
  findPath(grid, start, end) {
    // Validate coordinates
    this._validateCoordinates(grid, start, 'start');
    this._validateCoordinates(grid, end, 'end');

    // Convert grid to pathfinding format
    const pfGrid = this.convertNdarrayToPathfindingGrid(grid);
    
    // CRITICAL: Clone the grid to prevent state mutation
    // The pathfinding algorithm modifies the grid during search
    const clonedGrid = pfGrid.clone();
    
    // Find path using A* algorithm
    const path = this.finder.findPath(
      start.x, start.y,
      end.x, end.y,
      clonedGrid
    );

    return path;
  }

  /**
   * Checks if two points are reachable
   * @param {ndarray} grid - The ndarray grid
   * @param {Object} start - Start coordinates {x, y}
   * @param {Object} end - End coordinates {x, y}
   * @returns {boolean} True if reachable, false otherwise
   */
  isReachable(grid, start, end) {
    try {
      const path = this.findPath(grid, start, end);
      return path.length > 0;
    } catch (error) {
      // If pathfinding fails, points are not reachable
      return false;
    }
  }

  /**
   * Validates a path against the grid
   * @param {ndarray} grid - The ndarray grid
   * @param {Array<Array<number>>} path - Array of coordinate pairs
   * @param {Object} start - Expected start coordinates {x, y}
   * @param {Object} end - Expected end coordinates {x, y}
   * @returns {boolean} True if path is valid, false otherwise
   */
  validatePath(grid, path, start, end) {
    // Check if path is an array
    if (!Array.isArray(path)) {
      return false;
    }

    // Check if path is empty
    if (path.length === 0) {
      return false;
    }

    // Check if path starts at start point
    if (path[0][0] !== start.x || path[0][1] !== start.y) {
      return false;
    }

    // Check if path ends at end point
    const lastPoint = path[path.length - 1];
    if (lastPoint[0] !== end.x || lastPoint[1] !== end.y) {
      return false;
    }

    // Check if all path points are walkable
    for (const [x, y] of path) {
      if (x < 0 || y < 0 || x >= grid.shape[0] || y >= grid.shape[1]) {
        return false; // Out of bounds
      }
      
      if (grid.get(x, y) !== 0) {
        return false; // Not walkable (not a floor tile)
      }
    }

    // Check if path is continuous (adjacent points)
    for (let i = 0; i < path.length - 1; i++) {
      const [x1, y1] = path[i];
      const [x2, y2] = path[i + 1];
      
      const dx = Math.abs(x2 - x1);
      const dy = Math.abs(y2 - y1);
      
      // Points must be adjacent (manhattan distance <= 1)
      if (dx + dy > 1) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validates coordinates against grid bounds
   * @param {ndarray} grid - The ndarray grid
   * @param {Object} coords - Coordinates {x, y}
   * @param {string} name - Name for error message
   * @throws {Error} If coordinates are invalid
   * @private
   */
  _validateCoordinates(grid, coords, name) {
    if (!coords || typeof coords.x !== 'number' || typeof coords.y !== 'number') {
      throw new Error(`Invalid ${name} coordinates`);
    }

    if (coords.x < 0 || coords.y < 0) {
      throw new Error(`Invalid ${name} coordinates`);
    }

    if (coords.x >= grid.shape[0] || coords.y >= grid.shape[1]) {
      throw new Error(`Coordinates out of bounds`);
    }
  }
}

module.exports = PathfindingIntegration; 