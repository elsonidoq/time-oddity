const ndarray = require('ndarray');

/**
 * GridUtilities provides efficient 2D grid operations using ndarray
 * with memory management and coordinate conversion capabilities.
 * 
 * This class implements the foundational grid operations needed for
 * the cave generation pipeline, providing high-performance grid
 * manipulation with proper memory management and boundary checking.
 */
class GridUtilities {
  /**
   * Creates a new 2D grid using ndarray with Uint8Array for memory efficiency.
   * 
   * @param {number} width - Grid width in tiles
   * @param {number} height - Grid height in tiles
   * @param {number} initialValue - Initial value for all tiles (default: 0)
   * @returns {ndarray} A new ndarray grid
   * @throws {Error} If dimensions are invalid
   */
  static createGrid(width, height, initialValue = 0) {
    if (width <= 0 || height <= 0) {
      throw new Error('Invalid dimensions: width and height must be positive');
    }

    // Create Uint8Array for optimal memory usage (1 byte per tile)
    const data = new Uint8Array(width * height);
    
    // Initialize with default value
    if (initialValue !== 0) {
      data.fill(initialValue);
    }

    // Create ndarray view over the data
    const grid = ndarray(data, [width, height]);
    
    return grid;
  }

  /**
   * Converts pixel coordinates to grid coordinates.
   * 
   * @param {number} pixelX - X coordinate in pixels
   * @param {number} pixelY - Y coordinate in pixels
   * @param {number} tileSize - Size of each tile in pixels (default: 64)
   * @returns {Object} Grid coordinates {x, y}
   * @throws {Error} If tileSize is invalid
   */
  static pixelToGrid(pixelX, pixelY, tileSize = 64) {
    if (tileSize <= 0) {
      throw new Error('Invalid tile size: must be positive');
    }

    return {
      x: Math.floor(pixelX / tileSize),
      y: Math.floor(pixelY / tileSize)
    };
  }

  /**
   * Converts grid coordinates to pixel coordinates.
   * 
   * @param {number} gridX - X coordinate in grid tiles
   * @param {number} gridY - Y coordinate in grid tiles
   * @param {number} tileSize - Size of each tile in pixels (default: 64)
   * @returns {Object} Pixel coordinates {x, y}
   * @throws {Error} If tileSize is invalid
   */
  static gridToPixel(gridX, gridY, tileSize = 64) {
    if (tileSize <= 0) {
      throw new Error('Invalid tile size: must be positive');
    }

    return {
      x: gridX * tileSize,
      y: gridY * tileSize
    };
  }

  /**
   * Checks if coordinates are within the grid bounds.
   * 
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {ndarray} grid - The grid to check against
   * @returns {boolean} True if coordinates are valid
   * @throws {Error} If grid is null or undefined
   */
  static isValidCoordinate(x, y, grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const [width, height] = grid.shape;
    return x >= 0 && x < width && y >= 0 && y < height;
  }

  /**
   * Safely gets a value from the grid with boundary checking.
   * 
   * @param {ndarray} grid - The grid to read from
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {number|undefined} The value at the coordinates, or undefined if out of bounds
   * @throws {Error} If grid is null or undefined
   */
  static getSafe(grid, x, y) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    if (!this.isValidCoordinate(x, y, grid)) {
      return undefined;
    }

    return grid.get(x, y);
  }

  /**
   * Safely sets a value in the grid with boundary checking.
   * 
   * @param {ndarray} grid - The grid to write to
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} value - Value to set
   * @returns {boolean} True if the value was set, false if out of bounds
   * @throws {Error} If grid is null or undefined
   */
  static setSafe(grid, x, y, value) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    if (!this.isValidCoordinate(x, y, grid)) {
      return false;
    }

    grid.set(x, y, value);
    return true;
  }

  /**
   * Creates an independent copy of a grid.
   * This allocates new memory and copies all data.
   * 
   * @param {ndarray} grid - The grid to copy
   * @returns {ndarray} A new grid with the same data
   * @throws {Error} If grid is null or undefined
   */
  static copyGrid(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const [width, height] = grid.shape;
    const newData = new Uint8Array(grid.data.slice());
    return ndarray(newData, [width, height]);
  }

  /**
   * Creates a view of a grid region without copying data.
   * The view shares the same underlying data as the original grid.
   * 
   * @param {ndarray} grid - The source grid
   * @param {number} startX - Starting X coordinate
   * @param {number} startY - Starting Y coordinate
   * @param {number} endX - Ending X coordinate (exclusive)
   * @param {number} endY - Ending Y coordinate (exclusive)
   * @returns {ndarray} A view of the specified region
   * @throws {Error} If grid is null or invalid region
   */
  static createView(grid, startX, startY, endX, endY) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const [width, height] = grid.shape;
    
    // Validate region bounds
    if (startX < 0 || startY < 0 || endX > width || endY > height || 
        startX >= endX || startY >= endY) {
      throw new Error('Invalid region bounds');
    }

    // Create view using ndarray's lo/hi methods
    return grid.lo(startX, startY).hi(endX - startX, endY - startY);
  }

  /**
   * Fills an entire grid with a specified value.
   * 
   * @param {ndarray} grid - The grid to fill
   * @param {number} value - The value to fill with
   * @throws {Error} If grid is null or undefined
   */
  static fillGrid(grid, value) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const [width, height] = grid.shape;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        grid.set(x, y, value);
      }
    }
  }

  /**
   * Fills a region of the grid with a specified value.
   * 
   * @param {ndarray} grid - The grid to fill
   * @param {number} startX - Starting X coordinate
   * @param {number} startY - Starting Y coordinate
   * @param {number} endX - Ending X coordinate (exclusive)
   * @param {number} endY - Ending Y coordinate (exclusive)
   * @param {number} value - The value to fill with
   * @throws {Error} If grid is null or invalid region
   */
  static fillGridRegion(grid, startX, startY, endX, endY, value) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const [width, height] = grid.shape;
    
    // Validate region bounds
    if (startX < 0 || startY < 0 || endX > width || endY > height || 
        startX >= endX || startY >= endY) {
      throw new Error('Invalid region bounds');
    }

    // Fill the region
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        grid.set(x, y, value);
      }
    }
  }

  /**
   * Counts the number of tiles with a specific value.
   * 
   * @param {ndarray} grid - The grid to count in
   * @param {number} value - The value to count
   * @returns {number} The count of tiles with the specified value
   * @throws {Error} If grid is null or undefined
   */
  static countValue(grid, value) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    let count = 0;
    const [width, height] = grid.shape;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid.get(x, y) === value) {
          count++;
        }
      }
    }
    
    return count;
  }

  /**
   * Finds all positions of a specific value in the grid.
   * 
   * @param {ndarray} grid - The grid to search
   * @param {number} value - The value to find
   * @returns {Array} Array of positions {x, y} where the value was found
   * @throws {Error} If grid is null or undefined
   */
  static findValuePositions(grid, value) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const positions = [];
    const [width, height] = grid.shape;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid.get(x, y) === value) {
          positions.push({ x, y });
        }
      }
    }
    
    return positions;
  }

  /**
   * Gets the dimensions of a grid.
   * 
   * @param {ndarray} grid - The grid
   * @returns {Object} Dimensions {width, height}
   * @throws {Error} If grid is null or undefined
   */
  static getGridDimensions(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const [width, height] = grid.shape;
    return { width, height };
  }

  /**
   * Checks if a grid is empty (all values are 0).
   * 
   * @param {ndarray} grid - The grid to check
   * @returns {boolean} True if the grid is empty
   * @throws {Error} If grid is null or undefined
   */
  static isEmpty(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const [width, height] = grid.shape;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid.get(x, y) !== 0) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Gets the memory usage of a grid in bytes.
   * 
   * @param {ndarray} grid - The grid to measure
   * @returns {number} Memory usage in bytes
   * @throws {Error} If grid is null or undefined
   */
  static getMemoryUsage(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    return grid.data.byteLength;
  }
}

module.exports = GridUtilities; 