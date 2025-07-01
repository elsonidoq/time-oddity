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