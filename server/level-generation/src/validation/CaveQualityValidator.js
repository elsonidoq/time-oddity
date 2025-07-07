/**
 * @fileoverview Cave Quality Validator
 * Implements comprehensive cave quality validation system for connectivity, size, and shape
 */

const GridUtilities = require('../core/GridUtilities');

/**
 * CaveQualityValidator provides comprehensive quality validation for cave generation
 * with metrics for connectivity, size, shape, and playability.
 */
class CaveQualityValidator {
  /**
   * Creates a new CaveQualityValidator with default or custom thresholds.
   * 
   * @param {Object} thresholds - Optional custom validation thresholds
   */
  constructor(thresholds = {}) {
    this.thresholds = {
      minFloorRatio: 0.1,
      maxFloorRatio: 0.8,
      minConnectedFloorTiles: 50,
      maxIsolatedRegions: 3,
      minAverageRegionSize: 20,
      maxWallIslands: 5,
      ...thresholds
    };

    this.performanceStats = {
      totalValidations: 0,
      validationTimes: []
    };
  }

  /**
   * Gets the current validation thresholds.
   * 
   * @returns {Object} The current thresholds
   */
  getThresholds() {
    return { ...this.thresholds };
  }

  /**
   * Validates threshold configuration.
   * 
   * @param {Object} thresholds - Thresholds to validate
   * @throws {Error} If thresholds are invalid
   */
  validateThresholds(thresholds) {
    if (thresholds.minFloorRatio >= thresholds.maxFloorRatio) {
      throw new Error('Invalid floor ratio range');
    }

    const values = [
      thresholds.minFloorRatio, thresholds.maxFloorRatio,
      thresholds.minConnectedFloorTiles, thresholds.maxIsolatedRegions,
      thresholds.minAverageRegionSize, thresholds.maxWallIslands
    ];

    if (values.some(v => v < 0)) {
      throw new Error('Invalid threshold values');
    }
  }

  /**
   * Calculates the ratio of floor tiles to total tiles.
   * 
   * @param {ndarray} grid - The grid to analyze
   * @returns {number} Floor ratio (0.0 to 1.0)
   */
  calculateFloorRatio(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const totalTiles = grid.shape[0] * grid.shape[1];
    const floorTiles = GridUtilities.countValue(grid, 0);
    
    return floorTiles / totalTiles;
  }

  /**
   * Counts the number of connected floor tiles (size of largest connected region).
   * 
   * @param {ndarray} grid - The grid to analyze
   * @returns {number} Number of connected floor tiles
   */
  countConnectedFloorTiles(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }
    const [width, height] = grid.shape;
    const visited = new Set();
    let maxConnectedSize = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid.get(x, y) === 0 && !visited.has(`${x},${y}`)) {
          const regionSize = this.floodFill(grid, x, y, visited, 0);
          maxConnectedSize = Math.max(maxConnectedSize, regionSize);
        }
      }
    }
    return maxConnectedSize;
  }

  /**
   * Performs flood fill to count connected floor tiles.
   * 
   * @param {ndarray} grid - The grid to analyze
   * @param {number} startX - Starting X coordinate
   * @param {number} startY - Starting Y coordinate
   * @param {Set} visited - Set of visited coordinates
   * @param {number} targetValue - Target value to fill (0 for floor, 1 for wall)
   * @returns {number} Size of connected region
   */
  floodFill(grid, startX, startY, visited, targetValue = 0) {
    const queue = [[startX, startY]];
    let size = 0;
    while (queue.length > 0) {
      const [x, y] = queue.shift();
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      visited.add(key);
      if (grid.get(x, y) !== targetValue) continue;
      size++;
      // Check 4 neighbors
      const neighbors = [
        [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
      ];
      for (const [nx, ny] of neighbors) {
        if (GridUtilities.isValidCoordinate(nx, ny, grid) && !visited.has(`${nx},${ny}`)) {
          queue.push([nx, ny]);
        }
      }
    }
    return size;
  }

  /**
   * Counts the number of isolated floor regions.
   * 
   * @param {ndarray} grid - The grid to analyze
   * @returns {number} Number of isolated regions
   */
  countIsolatedRegions(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }
    const [width, height] = grid.shape;
    const visited = new Set();
    let regionCount = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid.get(x, y) === 0 && !visited.has(`${x},${y}`)) {
          this.floodFill(grid, x, y, visited, 0);
          regionCount++;
        }
      }
    }
    return regionCount;
  }

  /**
   * Calculates the average size of floor regions.
   * 
   * @param {ndarray} grid - The grid to analyze
   * @returns {number} Average region size
   */
  calculateAverageRegionSize(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }
    const [width, height] = grid.shape;
    const visited = new Set();
    const regionSizes = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid.get(x, y) === 0 && !visited.has(`${x},${y}`)) {
          const regionSize = this.floodFill(grid, x, y, visited, 0);
          regionSizes.push(regionSize);
        }
      }
    }
    if (regionSizes.length === 0) return 0;
    return regionSizes.reduce((sum, size) => sum + size, 0) / regionSizes.length;
  }

  /**
   * Counts the number of wall islands (isolated wall regions).
   * 
   * @param {ndarray} grid - The grid to analyze
   * @returns {number} Number of wall islands
   */
  countWallIslands(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }
    const [width, height] = grid.shape;
    const visited = new Set();
    let islandCount = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid.get(x, y) === 1 && !visited.has(`${x},${y}`)) {
          this.floodFill(grid, x, y, visited, 1);
          islandCount++;
        }
      }
    }
    return islandCount;
  }

  /**
   * Calculates comprehensive quality metrics.
   * 
   * @param {ndarray} grid - The grid to analyze
   * @returns {Object} Quality metrics
   */
  calculateQualityMetrics(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const floorRatio = this.calculateFloorRatio(grid);
    const connectedFloorTiles = this.countConnectedFloorTiles(grid);
    const isolatedRegions = this.countIsolatedRegions(grid);
    const averageRegionSize = this.calculateAverageRegionSize(grid);
    const wallIslands = this.countWallIslands(grid);

    return {
      floorRatio,
      connectedFloorTiles,
      isolatedRegions,
      averageRegionSize,
      wallIslands
    };
  }

  /**
   * Calculates overall quality score for the cave.
   * 
   * @param {ndarray} grid - The grid to analyze
   * @returns {number} Quality score (0-100)
   */
  calculateQualityScore(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const metrics = this.calculateQualityMetrics(grid);
    let score = 100;

    // Penalize based on floor ratio
    if (metrics.floorRatio < this.thresholds.minFloorRatio) {
      score -= 30;
    } else if (metrics.floorRatio > this.thresholds.maxFloorRatio) {
      score -= 20;
    }

    // Penalize based on connected floor tiles
    if (metrics.connectedFloorTiles < this.thresholds.minConnectedFloorTiles) {
      score -= 25;
    }

    // Penalize based on isolated regions
    if (metrics.isolatedRegions > this.thresholds.maxIsolatedRegions) {
      score -= 15;
    }

    // Penalize based on average region size
    if (metrics.averageRegionSize < this.thresholds.minAverageRegionSize) {
      score -= 10;
    }

    // Penalize based on wall islands
    if (metrics.wallIslands > this.thresholds.maxWallIslands) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  /**
   * Validates cave quality and returns detailed results.
   * 
   * @param {ndarray} grid - The grid to validate
   * @returns {Object} Validation results
   */
  validateCave(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const [width, height] = grid.shape;
    if (width === 0 || height === 0) {
      throw new Error('Invalid grid');
    }

    const startTime = Date.now();
    const metrics = this.calculateQualityMetrics(grid);
    const score = this.calculateQualityScore(grid);
    const validationTime = Date.now() - startTime;

    // Update performance stats
    this.performanceStats.totalValidations++;
    this.performanceStats.validationTimes.push(validationTime);

    const issues = [];
    const suggestions = [];

    // Check floor ratio
    if (metrics.floorRatio < this.thresholds.minFloorRatio) {
      issues.push('Insufficient floor tiles');
      suggestions.push('Increase floor tile density');
    } else if (metrics.floorRatio > this.thresholds.maxFloorRatio) {
      issues.push('Too many floor tiles');
      suggestions.push('Reduce floor tile density');
    }

    // Check connected floor tiles
    if (metrics.connectedFloorTiles < this.thresholds.minConnectedFloorTiles) {
      issues.push('Insufficient connected floor tiles');
      suggestions.push('Improve region connectivity');
    }

    // Check isolated regions
    if (metrics.isolatedRegions > this.thresholds.maxIsolatedRegions) {
      issues.push('Too many isolated regions');
      suggestions.push('Connect fragmented regions');
    }

    // Check average region size
    if (metrics.averageRegionSize < this.thresholds.minAverageRegionSize) {
      issues.push('Regions too small');
      suggestions.push('Increase region sizes');
    }

    // Check wall islands
    if (metrics.wallIslands > this.thresholds.maxWallIslands) {
      issues.push('Too many wall islands');
      suggestions.push('Reduce wall fragmentation');
    }

    // Check grid size
    if (width < 10 || height < 10) {
      issues.push('Grid too small');
      suggestions.push('Increase grid dimensions');
    }

    const isValid = issues.length === 0;

    return {
      isValid,
      score,
      issues,
      suggestions,
      metrics,
      validationTime
    };
  }

  /**
   * Gets performance statistics.
   * 
   * @returns {Object} Performance statistics
   */
  getPerformanceStats() {
    const times = this.performanceStats.validationTimes;
    
    if (times.length === 0) {
      return {
        totalValidations: 0,
        averageValidationTime: 0,
        minValidationTime: 0,
        maxValidationTime: 0
      };
    }

    return {
      totalValidations: this.performanceStats.totalValidations,
      averageValidationTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      minValidationTime: Math.min(...times),
      maxValidationTime: Math.max(...times)
    };
  }

  /**
   * Generates a detailed quality report.
   * 
   * @param {ndarray} grid - The grid to analyze
   * @returns {Object} Quality report
   */
  generateQualityReport(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const validation = this.validateCave(grid);
    const metrics = validation.metrics;

    const summary = [
      `Quality Score: ${validation.score}/100`,
      `Floor Ratio: ${(metrics.floorRatio * 100).toFixed(1)}%`,
      `Connected Floor Tiles: ${metrics.connectedFloorTiles}`,
      `Isolated Regions: ${metrics.isolatedRegions}`,
      `Average Region Size: ${metrics.averageRegionSize.toFixed(1)}`,
      `Wall Islands: ${metrics.wallIslands}`,
      `Validation Time: ${validation.validationTime}ms`
    ].join('\n');

    return {
      summary,
      metrics,
      validation,
      recommendations: validation.suggestions
    };
  }

  /**
   * Generates ASCII visualization of the grid.
   * 
   * @param {ndarray} grid - The grid to visualize
   * @returns {string} ASCII representation
   */
  generateAsciiVisualization(grid) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    const [width, height] = grid.shape;
    let ascii = '';

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const value = grid.get(x, y);
        ascii += value === 0 ? '.' : '#';
      }
      ascii += '\n';
    }

    return ascii;
  }
}

module.exports = {
  CaveQualityValidator
}; 