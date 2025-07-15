const ndarray = require('ndarray');
const GridUtilities = require('../core/GridUtilities');

/**
 * CorridorCarver implements corridor carving functionality that connects 
 * disconnected cave regions with minimal visual impact while maintaining cave aesthetics.
 * 
 * This class provides methods for finding closest pairs between regions,
 * carving L-shaped corridors, and validating connectivity.
 */
class CorridorCarver {
  /**
   * Carves corridors between disconnected regions to create a single connected cave.
   * 
   * @param {ndarray} grid - The cave grid (0=floor, 1=wall)
   * @param {ndarray} labelGrid - The labeled grid from RegionDetector
   * @param {object} regionData - Region metadata from RegionDetector
   * @param {RandomGenerator} rng - Random number generator for deterministic behavior
   * @returns {ndarray} The modified grid with corridors carved
   * @throws {Error} If inputs are invalid
   */
  static carveCorridors(grid, labelGrid, regionData, rng) {
    this._validateInputs(grid, labelGrid, regionData, rng);
    
    // Create a copy of the grid to avoid mutating the input
    const result = ndarray(new Uint8Array(grid.data), grid.shape);
    
    // Get all region labels (excluding 0=floor, 1=wall)
    const regionLabels = Object.keys(regionData).map(Number).filter(label => label > 1);
    
    if (regionLabels.length <= 1) {
      // No corridors needed for single region
      return result;
    }
    
    // Find the largest region to connect others to
    let largestRegionLabel = regionLabels[0];
    let largestArea = regionData[largestRegionLabel].area;
    
    for (const label of regionLabels) {
      if (regionData[label].area > largestArea) {
        largestRegionLabel = label;
        largestArea = regionData[label].area;
      }
    }
    
    // Connect all other regions to the largest region
    for (const label of regionLabels) {
      if (label === largestRegionLabel) continue;
      
      const regionA = this.getRegionPoints(labelGrid, largestRegionLabel);
      const regionB = this.getRegionPoints(labelGrid, label);
      
      const closestPair = this.findClosestPair(regionA, regionB);
      this.carveLShapedCorridor(result, closestPair.pointA, closestPair.pointB, rng);
    }
    
    return result;
  }
  
  /**
   * Finds the closest pair of points between two regions using Manhattan distance.
   * 
   * @param {Array} regionA - Array of {x, y} points for first region
   * @param {Array} regionB - Array of {x, y} points for second region
   * @returns {object} Object with pointA, pointB, and distance
   * @throws {Error} If inputs are invalid
   */
  static findClosestPair(regionA, regionB) {
    if (!Array.isArray(regionA) || !Array.isArray(regionB)) {
      throw new Error('Both regions must be arrays');
    }
    
    if (regionA.length === 0 || regionB.length === 0) {
      throw new Error('Both regions must have at least one point');
    }
    
    let minDistance = Infinity;
    let bestPair = { pointA: regionA[0], pointB: regionB[0] };
    
    for (const pointA of regionA) {
      for (const pointB of regionB) {
        const distance = Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y);
        if (distance < minDistance) {
          minDistance = distance;
          bestPair = { pointA, pointB, distance };
        }
      }
    }
    
    return bestPair;
  }
  
  /**
   * Carves an L-shaped corridor between two points, randomly choosing orientation.
   * 
   * @param {ndarray} grid - The grid to modify
   * @param {object} pointA - Start point {x, y}
   * @param {object} pointB - End point {x, y}
   * @param {RandomGenerator} rng - Random number generator
   * @throws {Error} If inputs are invalid
   */
  static carveLShapedCorridor(grid, pointA, pointB, rng) {
    this._validatePoint(pointA);
    this._validatePoint(pointB);
    this._validateGrid(grid);
    this._validateRng(rng);
    
    // Randomly choose between horizontal-first or vertical-first
    const horizontalFirst = rng.random() < 0.5;
    
    if (horizontalFirst) {
      // Carve horizontal line first, then vertical
      this.carveHorizontalLine(grid, pointA.x, pointA.y, pointB.x);
      this.carveVerticalLine(grid, pointB.x, pointA.y, pointB.y);
    } else {
      // Carve vertical line first, then horizontal
      this.carveVerticalLine(grid, pointA.x, pointA.y, pointB.y);
      this.carveHorizontalLine(grid, pointA.x, pointB.y, pointB.x);
    }
  }
  
  /**
   * Carves a horizontal line from startX to endX at y coordinate.
   * 
   * @param {ndarray} grid - The grid to modify
   * @param {number} startX - Starting X coordinate
   * @param {number} y - Y coordinate
   * @param {number} endX - Ending X coordinate
   * @throws {Error} If inputs are invalid
   */
  static carveHorizontalLine(grid, startX, y, endX) {
    this._validateGrid(grid);
    this._validateCoordinate(startX, 'startX');
    this._validateCoordinate(y, 'y');
    this._validateCoordinate(endX, 'endX');
    
    const [width, height] = grid.shape;
    
    // Ensure coordinates are within bounds
    const safeStartX = Math.max(0, Math.min(startX, width - 1));
    const safeEndX = Math.max(0, Math.min(endX, width - 1));
    const safeY = Math.max(0, Math.min(y, height - 1));
    const safeY2 = Math.max(0, Math.min(y + 1, height - 1)); // Second row for two-tile height

    // Carve the horizontal line with two tiles height
    for (let x = Math.min(safeStartX, safeEndX); x <= Math.max(safeStartX, safeEndX); x++) {
      grid.set(x, safeY, 0);   // Set first row to floor
      grid.set(x, safeY2, 0);  // Set second row to floor
    }
  }
  
  /**
   * Carves a vertical line from startY to endY at x coordinate.
   * 
   * @param {ndarray} grid - The grid to modify
   * @param {number} x - X coordinate
   * @param {number} startY - Starting Y coordinate
   * @param {number} endY - Ending Y coordinate
   * @throws {Error} If inputs are invalid
   */
  static carveVerticalLine(grid, x, startY, endY) {
    this._validateGrid(grid);
    this._validateCoordinate(x, 'x');
    this._validateCoordinate(startY, 'startY');
    this._validateCoordinate(endY, 'endY');
    
    const [width, height] = grid.shape;
    
    // Ensure coordinates are within bounds
    const safeX = Math.max(0, Math.min(x, width - 1));
    const safeX2 = Math.max(0, Math.min(x + 1, width - 1)); // Second column for two-tile width
    const safeStartY = Math.max(0, Math.min(startY, height - 1));
    const safeEndY = Math.max(0, Math.min(endY, height - 1));
    
    // Carve the vertical line with two tiles width
    for (let y = Math.min(safeStartY, safeEndY); y <= Math.max(safeStartY, safeEndY); y++) {
      grid.set(safeX, y, 0);   // Set first column to floor
      grid.set(safeX2, y, 0);  // Set second column to floor
    }
  }
  
  /**
   * Gets all points for a specific region from the labeled grid.
   * 
   * @param {ndarray} labelGrid - The labeled grid from RegionDetector
   * @param {number} regionLabel - The region label to find
   * @returns {Array} Array of {x, y} points for the region
   * @throws {Error} If inputs are invalid
   */
  static getRegionPoints(labelGrid, regionLabel) {
    this._validateGrid(labelGrid);
    this._validateCoordinate(regionLabel, 'regionLabel');
    
    const [width, height] = labelGrid.shape;
    const points = [];
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (labelGrid.get(x, y) === regionLabel) {
          points.push({ x, y });
        }
      }
    }
    
    return points;
  }
  
  /**
   * Validates that regions are properly connected after carving.
   * 
   * @param {ndarray} grid - The grid to check
   * @param {ndarray} labelGrid - The labeled grid from RegionDetector
   * @param {object} regionData - Region metadata from RegionDetector
   * @returns {boolean} True if regions are connected
   * @throws {Error} If inputs are invalid
   */
  static validateConnection(grid, labelGrid, regionData) {
    this._validateGrid(grid);
    this._validateGrid(labelGrid);
    
    if (!regionData || typeof regionData !== 'object') {
      throw new Error('regionData must be an object');
    }
    
    // Re-detect regions in the modified grid to see if they're now connected
    const RegionDetector = require('./RegionDetector');
    const { regionData: newRegionData } = RegionDetector.detectRegions(grid);
    
    // If there's only one region left, they're connected
    return Object.keys(newRegionData).length === 1;
  }
  
  /**
   * Converts a grid to ASCII art for visual debugging.
   * 
   * @param {ndarray} grid - The grid to convert
   * @returns {string} ASCII art representation
   * @throws {Error} If grid is invalid
   */
  static toAsciiArt(grid) {
    this._validateGrid(grid);
    
    const [width, height] = grid.shape;
    let out = '';
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const v = grid.get(x, y);
        if (v === 1) out += '#'; // wall
        else out += '.'; // floor
      }
      out += '\n';
    }
    
    return out;
  }
  
  /**
   * Validates input parameters for corridor carving.
   * 
   * @param {ndarray} grid - The cave grid
   * @param {ndarray} labelGrid - The labeled grid
   * @param {object} regionData - Region metadata
   * @param {RandomGenerator} rng - Random number generator
   * @throws {Error} If any input is invalid
   * @private
   */
  static _validateInputs(grid, labelGrid, regionData, rng) {
    this._validateGrid(grid);
    this._validateGrid(labelGrid);
    
    if (!regionData || typeof regionData !== 'object') {
      throw new Error('regionData must be an object');
    }
    
    this._validateRng(rng);
  }
  
  /**
   * Validates a grid parameter.
   * 
   * @param {ndarray} grid - The grid to validate
   * @throws {Error} If grid is invalid
   * @private
   */
  static _validateGrid(grid) {
    if (!grid || !grid.shape || grid.shape.length !== 2) {
      throw new Error('grid must be a valid 2D ndarray');
    }
  }
  
  /**
   * Validates a point object.
   * 
   * @param {object} point - The point to validate
   * @throws {Error} If point is invalid
   * @private
   */
  static _validatePoint(point) {
    if (!point || typeof point !== 'object') {
      throw new Error('point must be an object');
    }
    
    if (typeof point.x !== 'number' || typeof point.y !== 'number') {
      throw new Error('point must have numeric x and y properties');
    }
  }
  
  /**
   * Validates a coordinate value.
   * 
   * @param {number} coord - The coordinate to validate
   * @param {string} name - The parameter name for error messages
   * @throws {Error} If coordinate is invalid
   * @private
   */
  static _validateCoordinate(coord, name) {
    if (typeof coord !== 'number' || !Number.isInteger(coord)) {
      throw new Error(`${name} must be an integer`);
    }
  }
  
  /**
   * Validates a random number generator.
   * 
   * @param {RandomGenerator} rng - The RNG to validate
   * @throws {Error} If RNG is invalid
   * @private
   */
  static _validateRng(rng) {
    if (!rng || typeof rng.random !== 'function') {
      throw new Error('rng must be a valid RandomGenerator instance');
    }
  }
}

module.exports = CorridorCarver; 