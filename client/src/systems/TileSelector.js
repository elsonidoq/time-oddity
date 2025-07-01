/**
 * TileSelector - Utility class for determining correct tile keys based on platform position and size
 * 
 * This class provides static methods for selecting the appropriate tile variant
 * based on the platform's structure (single-block vs multi-block).
 * 
 * Tile Naming Conventions:
 * - Block-style tiles: _left, _center, _right (e.g., terrain_grass_block_left)
 * - Horizontal-style tiles: _left, _middle, _right (e.g., terrain_grass_horizontal_left)
 * 
 * @class
 * @description Utility class for tile selection logic, following decoupled architecture principles
 */
export class TileSelector {
  /**
   * Determines the correct tile key based on platform position and size
   * 
   * @param {string} tilePrefix - The base tile prefix (e.g., 'terrain_grass_block')
   * @param {number} position - Platform position (currently unused, for future extensibility)
   * @param {number} totalTiles - Total number of tiles in the platform
   * @param {number} tileIndex - Index of the current tile (0-based)
   * @returns {string} The correct tile key for the given position
   * @throws {Error} If parameters are invalid
   */
  static getTileKey(tilePrefix, position, totalTiles, tileIndex) {
    // Input validation
    if (!tilePrefix || tilePrefix.trim() === '') {
      throw new Error('tilePrefix cannot be empty');
    }
    
    if (totalTiles <= 0) {
      throw new Error('totalTiles must be greater than 0');
    }
    
    if (tileIndex < 0 || tileIndex >= totalTiles) {
      throw new Error('tileIndex must be between 0 and totalTiles - 1');
    }
    
    // Detect tile style based on prefix
    const tileStyle = this.detectTileStyle(tilePrefix);
    
    // Handle single tile case
    if (totalTiles === 1) {
      return tileStyle === 'horizontal' 
        ? `${tilePrefix}_middle` 
        : `${tilePrefix}_center`;
    }
    
    // Handle multi-tile cases
    if (tileIndex === 0) {
      // First tile (left)
      return `${tilePrefix}_left`;
    } else if (tileIndex === totalTiles - 1) {
      // Last tile (right)
      return `${tilePrefix}_right`;
    } else {
      // Middle tiles
      return tileStyle === 'horizontal' 
        ? `${tilePrefix}_middle` 
        : `${tilePrefix}_center`;
    }
  }
  
  /**
   * Detects the tile style based on the prefix
   * 
   * @param {string} tilePrefix - The tile prefix to analyze
   * @returns {string} 'horizontal' or 'block'
   */
  static detectTileStyle(tilePrefix) {
    if (tilePrefix.includes('_horizontal')) {
      return 'horizontal';
    }
    return 'block'; // Default to block style
  }
} 