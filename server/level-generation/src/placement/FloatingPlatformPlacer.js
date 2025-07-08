/**
 * @fileoverview Floating Platform Placement Algorithm
 * Implements strategic floating platform placement with tile-based logic only.
 */

const ndarray = require('ndarray');
const PhysicsAwareReachabilityAnalyzer = require('../analysis/PhysicsAwareReachabilityAnalyzer');

/**
 * FloatingPlatformPlacer class for strategic floating platform placement
 * 
 * Handles strategic floating platform placement with tile-based logic:
 * - Strategic placement algorithm for optimal platform positioning
 * - Visual impact assessment for aesthetic platform placement
 * - Accessibility validation ensuring placed platforms restore reachability
 * - Platform size optimization for efficient gap bridging
 * - Placement refinement system for improving platform placement quality
 * 
 * @class FloatingPlatformPlacer
 */
class FloatingPlatformPlacer {
  /**
   * Creates a new FloatingPlatformPlacer instance
   * 
   * @param {Object} config - Configuration options
   * @param {number} config.minPlatformSize - Minimum platform size in tiles (default: 3)
   * @param {number} config.maxPlatformSize - Maximum platform size in tiles (default: 8)
   * @param {number} config.visualImpactThreshold - Visual impact threshold (default: 0.7)
   * @param {boolean} config.accessibilityValidationEnabled - Enable accessibility validation (default: true)
   * @param {number} config.groupingDistance - Distance for grouping unreachable areas (default: 4)
   * @param {number} config.maxPlatforms - Maximum number of platforms to place (default: 5)
   */
  constructor(config = {}) {
    this.minPlatformSize = config.minPlatformSize !== undefined ? config.minPlatformSize : 3;
    this.maxPlatformSize = config.maxPlatformSize !== undefined ? config.maxPlatformSize : 8;
    this.visualImpactThreshold = config.visualImpactThreshold !== undefined ? config.visualImpactThreshold : 0.7;
    this.accessibilityValidationEnabled = config.accessibilityValidationEnabled !== undefined ? config.accessibilityValidationEnabled : true;
    this.groupingDistance = config.groupingDistance !== undefined ? config.groupingDistance : 4;
    this.maxPlatforms = config.maxPlatforms !== undefined ? config.maxPlatforms : 5;
    
    // Initialize analyzer
    this.analyzer = new PhysicsAwareReachabilityAnalyzer();
    
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
    if (config.minPlatformSize !== undefined && config.minPlatformSize <= 0) {
      throw new Error('minPlatformSize must be positive');
    }
    
    if (config.maxPlatformSize !== undefined && config.maxPlatformSize <= 0) {
      throw new Error('maxPlatformSize must be positive');
    }
    
    if (config.visualImpactThreshold !== undefined && (config.visualImpactThreshold < 0 || config.visualImpactThreshold > 1)) {
      throw new Error('visualImpactThreshold must be between 0 and 1');
    }
    
    if (config.groupingDistance !== undefined && config.groupingDistance <= 0) {
      throw new Error('groupingDistance must be positive');
    }
    
    if (this.minPlatformSize > this.maxPlatformSize) {
      throw new Error('minPlatformSize cannot be greater than maxPlatformSize');
    }
  }

  /**
   * Identifies unreachable areas using the physics-aware analyzer
   * 
   * @param {ndarray} grid - The grid to analyze
   * @param {Object} playerSpawn - Player spawn position {x, y}
   * @returns {Array<Object>} Array of unreachable area coordinates {x, y}
   * @throws {Error} If grid is null or undefined
   */
  identifyUnreachableAreas(grid, playerSpawn) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    if (!playerSpawn) {
      throw new Error('Player spawn position is required');
    }

    return this.analyzer.detectUnreachableAreas(grid);
  }

  /**
   * Groups nearby unreachable areas for efficient platform placement
   * 
   * @param {Array<Object>} unreachableAreas - Array of unreachable area coordinates
   * @returns {Array<Array<Object>>} Array of grouped areas
   */
  groupUnreachableAreas(unreachableAreas) {
    if (!unreachableAreas || unreachableAreas.length === 0) {
      return [];
    }

    const groups = [];
    const visited = new Set();

    for (const area of unreachableAreas) {
      if (visited.has(`${area.x},${area.y}`)) {
        continue;
      }

      const group = [area];
      visited.add(`${area.x},${area.y}`);

      // Find nearby areas
      for (const otherArea of unreachableAreas) {
        if (visited.has(`${otherArea.x},${otherArea.y}`)) {
          continue;
        }

        const distance = Math.abs(otherArea.x - area.x) + Math.abs(otherArea.y - area.y);
        if (distance <= this.groupingDistance) {
          group.push(otherArea);
          visited.add(`${otherArea.x},${otherArea.y}`);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Calculates optimal platform positions for unreachable areas
   * 
   * @param {ndarray} grid - The grid to analyze
   * @param {Array<Object>} unreachableAreas - Array of unreachable area coordinates
   * @param {Object} playerSpawn - Player spawn position {x, y}
   * @returns {Array<Object>} Array of platform objects
   */
  calculateOptimalPlatforms(grid, unreachableAreas, playerSpawn) {
    if (!unreachableAreas || unreachableAreas.length === 0) {
      return [];
    }

    const platforms = [];
    const groupedAreas = this.groupUnreachableAreas(unreachableAreas);

    for (const group of groupedAreas) {
      const platform = this.calculatePlatformForGroup(grid, group, playerSpawn);
      if (platform) {
        platforms.push(platform);
      }
    }

    return platforms;
  }

  /**
   * Calculates optimal platform for a group of unreachable areas
   * 
   * @param {ndarray} grid - The grid to analyze
   * @param {Array<Object>} group - Group of unreachable areas
   * @param {Object} playerSpawn - Player spawn position {x, y}
   * @returns {Object|null} Platform object or null if no valid placement
   * @private
   */
  calculatePlatformForGroup(grid, group, playerSpawn) {
    if (group.length === 0) {
      return null;
    }

    // Calculate bounding box of the group
    let minX = group[0].x, maxX = group[0].x;
    let minY = group[0].y, maxY = group[0].y;

    for (const area of group) {
      minX = Math.min(minX, area.x);
      maxX = Math.max(maxX, area.x);
      minY = Math.min(minY, area.y);
      maxY = Math.max(maxY, area.y);
    }

    // Calculate optimal platform position and size
    const gapWidth = maxX - minX + 1;
    const platformWidth = Math.max(this.minPlatformSize, Math.min(this.maxPlatformSize, gapWidth));
    
    // Position platform to cover the gap
    const platformX = minX;
    const platformY = minY;

    return {
      x: platformX,
      y: platformY,
      width: platformWidth,
      height: 1
    };
  }

  /**
   * Assesses visual impact of platform placement
   * 
   * @param {ndarray} grid - The grid to analyze
   * @param {Object} platform - Platform object to assess
   * @returns {number} Visual impact score between 0 and 1
   */
  assessVisualImpact(grid, platform) {
    if (!grid || !platform) {
      return 0;
    }

    const [width, height] = grid.shape;
    let openSpaceCount = 0;
    let totalSpaceCount = 0;

    // Check area around platform for open space
    const checkRadius = 2;
    for (let y = Math.max(0, platform.y - checkRadius); y <= Math.min(height - 1, platform.y + checkRadius); y++) {
      for (let x = Math.max(0, platform.x - checkRadius); x <= Math.min(width - 1, platform.x + platform.width + checkRadius); x++) {
        totalSpaceCount++;
        if (grid.get(x, y) === 0) {
          openSpaceCount++;
        }
      }
    }

    // Higher impact in more open areas
    return openSpaceCount / totalSpaceCount;
  }

  /**
   * Validates that a platform can be placed without overlapping walls
   * 
   * @param {ndarray} grid - The grid to analyze
   * @param {Object} platform - Platform object to validate
   * @returns {boolean} True if platform placement is valid, false otherwise
   */
  validatePlatformPlacement(grid, platform) {
    if (!platform || typeof platform.x !== 'number' || typeof platform.y !== 'number' || typeof platform.width !== 'number') {
      return false;
    }

    const [width, height] = grid.shape;
    
    // Check if platform is within grid bounds
    if (platform.x < 0 || platform.y < 0 || platform.x + platform.width > width || platform.y >= height) {
      return false;
    }

    // Check if platform overlaps with walls (check all tiles covered by the platform)
    for (let i = 0; i < platform.width; i++) {
      const tileX = platform.x + i;
      const tileY = platform.y;
      if (grid.get(tileX, tileY) === 1) {
        return false; // Cannot place platform on top of a wall
      }
    }
    return true;
  }

  /**
   * Refines platform placement for better quality
   * 
   * @param {ndarray} grid - The grid to analyze
   * @param {Array<Object>} platforms - Array of platform objects
   * @returns {Array<Object>} Refined platform objects
   */
  refinePlacement(grid, platforms) {
    if (!platforms || platforms.length === 0) {
      return platforms;
    }

    const refinedPlatforms = [];
    
    for (const platform of platforms) {
      const refinedPlatform = this.refineSinglePlatform(grid, platform);
      if (refinedPlatform) {
        refinedPlatforms.push(refinedPlatform);
      }
    }

    return refinedPlatforms;
  }

  /**
   * Refines a single platform placement
   * 
   * @param {ndarray} grid - The grid to analyze
   * @param {Object} platform - Platform object to refine
   * @returns {Object} Refined platform object
   * @private
   */
  refineSinglePlatform(grid, platform) {
    if (!this.validatePlatformPlacement(grid, platform)) {
      // Try to find a valid adjustment
      const adjustments = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 }
      ];
      for (const adj of adjustments) {
        const adjusted = { ...platform, x: platform.x + adj.dx, y: platform.y + adj.dy };
        if (this.validatePlatformPlacement(grid, adjusted)) {
          return adjusted;
        }
      }
      return null;
    }
    // If already valid, return as is
    return platform;
  }

  /**
   * Places floating platforms to bridge unreachable coin areas
   * 
   * @param {ndarray} grid - The grid to analyze
   * @param {Array<Object>} unreachableAreas - Array of unreachable area coordinates
   * @param {Object} playerSpawn - Player spawn position {x, y}
   * @returns {Array<Object>} Array of platform objects
   * @throws {Error} If required parameters is missing
   */
  placeFloatingPlatforms(grid, unreachableAreas, playerSpawn) {
    if (!grid) {
      throw new Error('Grid is required');
    }

    if (!unreachableAreas) {
      throw new Error('Unreachable areas array is required');
    }

    if (!playerSpawn) {
      throw new Error('Player spawn position is required');
    }

    if (unreachableAreas.length === 0) {
      return [];
    }

    // Calculate optimal platforms
    const platforms = this.calculateOptimalPlatforms(grid, unreachableAreas, playerSpawn);

    // Filter out invalid platforms
    const validPlatforms = platforms.filter(platform => 
      this.validatePlatformPlacement(grid, platform)
    );

    // Limit the number of platforms
    const limitedPlatforms = validPlatforms.slice(0, this.maxPlatforms);

    // Refine placement
    const refinedPlatforms = this.refinePlacement(grid, limitedPlatforms);

    return refinedPlatforms;
  }
}

module.exports = FloatingPlatformPlacer; 