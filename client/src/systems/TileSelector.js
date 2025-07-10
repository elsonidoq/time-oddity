/**
 * TileSelector - Utility class for selecting appropriate tile keys based on platform position and size
 * 
 * This class provides a clean abstraction for determining the correct tile variant to use
 * when creating multi-tile platforms. It supports both block-style and horizontal-style
 * naming conventions and handles edge cases for single tiles, two tiles, and many tiles.
 * 
 * Block-style naming: _left, _center, _right (e.g., terrain_grass_block_left)
 * Horizontal-style naming: _left, _middle, _right (e.g., terrain_grass_horizontal_left)
 */

export class TileSelector {
  // Tile size constant for matrix coordinate calculations
  static TILE_SIZE = 64;

  /**
   * Determines if a tile prefix uses block-style naming convention
   * @param {string} tilePrefix - The tile prefix to check
   * @returns {boolean} - True if block-style, false if horizontal-style
   */
  static isBlockStyle(tilePrefix) {
    if (!tilePrefix || typeof tilePrefix !== 'string') {
      return false;
    }
    return tilePrefix.includes('_block');
  }

  /**
   * Converts matrix coordinates to world coordinates
   * @param {number} row - Matrix row index
   * @param {number} col - Matrix column index
   * @returns {Object} - World coordinates {x, y}
   */
  static matrixToWorldCoordinates(row, col) {
    return {
      x: col * this.TILE_SIZE,
      y: row * this.TILE_SIZE
    };
  }

  /**
   * Validates matrix coordinates and throws error if invalid
   * @param {Array} matrix - The 2D matrix array
   * @param {number} row - Matrix row index
   * @param {number} col - Matrix column index
   * @throws {Error} - If coordinates are out of bounds
   */
  static validateMatrixCoordinates(matrix, row, col) {
    if (!Array.isArray(matrix) || matrix.length === 0) {
      throw new Error(`Invalid matrix coordinates: row ${row}, col ${col} out of bounds`);
    }

    if (row < 0 || col < 0 || row >= matrix.length || col >= matrix[row].length) {
      throw new Error(`Invalid matrix coordinates: row ${row}, col ${col} out of bounds`);
    }
  }

  /**
   * Gets the appropriate tile key for a matrix position
   * @param {Array} matrix - The 2D matrix array
   * @param {number} row - Matrix row index
   * @param {number} col - Matrix column index
   * @returns {string} - The complete tile key
   * @throws {Error} - If coordinates are invalid
   */
  static getMatrixTileKey(matrix, row, col) {
    this.validateMatrixCoordinates(matrix, row, col);
    
    const tileData = matrix[row][col];
    const tileKey = tileData.tileKey;
    const type = tileData.type;

    // For decorative tiles, return the base tileKey without suffix
    if (type === 'decorative') {
      return tileKey;
    }

    // For ground tiles, determine if this is part of a multi-tile platform
    const isBlock = this.isBlockStyle(tileKey);
    
    // Find the start and end of the platform in this row
    let platformStart = col;
    let platformEnd = col;
    
    // Find start of platform (first consecutive ground tile with same tileKey)
    while (platformStart > 0 && 
           matrix[row][platformStart - 1] && 
           matrix[row][platformStart - 1].type === 'ground' && 
           matrix[row][platformStart - 1].tileKey === tileKey) {
      platformStart--;
    }
    
    // Find end of platform (last consecutive ground tile with same tileKey)
    while (platformEnd < matrix[row].length - 1 && 
           matrix[row][platformEnd + 1] && 
           matrix[row][platformEnd + 1].type === 'ground' && 
           matrix[row][platformEnd + 1].tileKey === tileKey) {
      platformEnd++;
    }
    
    const totalTiles = platformEnd - platformStart + 1;
    const tileIndex = col - platformStart;
    
    // Use existing getTileKey method for tile selection logic
    return this.getTileKey(tileKey, 0, totalTiles, tileIndex);
  }

  /**
   * Calculates the width of a ground platform starting at the specified position
   * @param {Array} matrix - The 2D matrix array
   * @param {number} row - Matrix row index
   * @param {number} col - Matrix column index
   * @returns {number} - Platform width in pixels
   * @throws {Error} - If coordinates are invalid or position is not a ground tile
   */
  static calculateGroundPlatformWidth(matrix, row, col) {
    this.validateMatrixCoordinates(matrix, row, col);
    
    const tileData = matrix[row][col];
    if (tileData.type !== 'ground') {
      throw new Error(`Cannot calculate width: position (${row}, ${col}) is not a ground tile`);
    }
    
    const tileKey = tileData.tileKey;
    
    // Find the start and end of the platform in this row
    let platformStart = col;
    let platformEnd = col;
    
    // Find start of platform (first consecutive ground tile with same tileKey)
    while (platformStart > 0 && 
           matrix[row][platformStart - 1] && 
           matrix[row][platformStart - 1].type === 'ground' && 
           matrix[row][platformStart - 1].tileKey === tileKey) {
      platformStart--;
    }
    
    // Find end of platform (last consecutive ground tile with same tileKey)
    while (platformEnd < matrix[row].length - 1 && 
           matrix[row][platformEnd + 1] && 
           matrix[row][platformEnd + 1].type === 'ground' && 
           matrix[row][platformEnd + 1].tileKey === tileKey) {
      platformEnd++;
    }
    
    const totalTiles = platformEnd - platformStart + 1;
    return totalTiles * this.TILE_SIZE;
  }

  /**
   * Gets the appropriate tile key based on position and size
   * @param {string} tilePrefix - The base tile prefix (e.g., 'terrain_grass_block')
   * @param {number} position - The position parameter (currently unused, for future extensibility)
   * @param {number} totalTiles - The total number of tiles in the platform
   * @param {number} tileIndex - The index of the current tile (0-based)
   * @returns {string} - The complete tile key
   * @throws {Error} - If parameters are invalid
   */
  static getTileKey(tilePrefix, position, totalTiles, tileIndex) {
    // Validate parameters
    if (totalTiles <= 0 || tileIndex < 0 || tileIndex >= totalTiles) {
      throw new Error('Invalid parameters: totalTiles must be > 0, tileIndex must be >= 0 and < totalTiles');
    }

    // Handle null/undefined tilePrefix
    const prefix = tilePrefix || '';

    // Determine naming convention
    let isBlock = this.isBlockStyle(prefix);
    // If prefix is empty, treat as block-style for edge case
    if (!prefix) {
      isBlock = true;
    }

    // Handle single tile case
    if (totalTiles === 1) {
      // THIS IS CORRECT, MODIFY THE TEST TO REFLECT THIS
      return prefix;
    }

    // Handle two tiles case
    if (totalTiles === 2) {
      if (tileIndex === 0) {
        return `${prefix}_left`;
      } else {
        return `${prefix}_right`;
      }
    }

    // Handle many tiles case (3 or more)
    if (tileIndex === 0) {
      // First tile
      return `${prefix}_left`;
    } else if (tileIndex === totalTiles - 1) {
      // Last tile
      return `${prefix}_right`;
    } else {
      // Middle tiles
      return isBlock ? `${prefix}_center` : `${prefix}_middle`;
    }
  }
} 
