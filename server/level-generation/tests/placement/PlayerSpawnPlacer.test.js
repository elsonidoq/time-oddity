/**
 * @fileoverview Tests for PlayerSpawnPlacer
 * Tests player spawn placement with comprehensive safety validation
 */

const PlayerSpawnPlacer = require('../../src/placement/PlayerSpawnPlacer');
const GridUtilities = require('../../src/core/GridUtilities');
const RandomGenerator = require('../../src/core/RandomGenerator');

describe('PlayerSpawnPlacer', () => {
  let placer;
  let rng;
  let testGrid;

  beforeEach(() => {
    placer = new PlayerSpawnPlacer();
    rng = new RandomGenerator('test-seed');
    
    // Create a test grid with proper wall/floor structure
    // 0 = floor, 1 = wall
    testGrid = GridUtilities.createGrid(10, 10);
    
    // Create a simple cave structure with walls at the bottom
    // Top 8 rows are floor, bottom 2 rows are walls
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 10; x++) {
        GridUtilities.setSafe(testGrid, x, y, 0); // Floor
      }
    }
    for (let y = 8; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        GridUtilities.setSafe(testGrid, x, y, 1); // Wall
      }
    }
  });

  describe('isWallTile', () => {
    test('should return true for wall tiles', () => {
      expect(placer.isWallTile(testGrid, 0, 8)).toBe(true);
      expect(placer.isWallTile(testGrid, 5, 9)).toBe(true);
    });

    test('should return false for floor tiles', () => {
      expect(placer.isWallTile(testGrid, 0, 0)).toBe(false);
      expect(placer.isWallTile(testGrid, 5, 7)).toBe(false);
    });

    test('should return false for out of bounds coordinates', () => {
      expect(placer.isWallTile(testGrid, -1, 0)).toBe(false);
      expect(placer.isWallTile(testGrid, 10, 0)).toBe(false);
      expect(placer.isWallTile(testGrid, 0, -1)).toBe(false);
      expect(placer.isWallTile(testGrid, 0, 10)).toBe(false);
    });

    test('should throw error for null grid', () => {
      expect(() => placer.isWallTile(null, 0, 0)).toThrow('Grid is required');
    });
  });

  describe('hasSafeLandingZone', () => {
    test('should return true for wall tiles with floor tiles nearby', () => {
      // Wall tile at (5, 8) with floor tiles around it
      expect(placer.hasSafeLandingZone(testGrid, 5, 8, 2)).toBe(true);
    });

    test('should return false for floor tiles', () => {
      expect(placer.hasSafeLandingZone(testGrid, 5, 7, 2)).toBe(false);
    });

    test('should return false for wall tiles without nearby floor tiles', () => {
      // Create a wall tile surrounded by other walls
      GridUtilities.setSafe(testGrid, 5, 7, 1); // Wall
      GridUtilities.setSafe(testGrid, 4, 8, 1); // Wall
      GridUtilities.setSafe(testGrid, 6, 8, 1); // Wall
      expect(placer.hasSafeLandingZone(testGrid, 5, 8, 2)).toBe(false);
    });
  });

  describe('isValidSpawnPosition', () => {
    test('should return true for floor tiles above wall tiles', () => {
      // Floor tile at (5, 7) with wall tile below at (5, 8)
      expect(placer.isValidSpawnPosition(testGrid, 5, 7)).toBe(true);
    });

    test('should return false for wall tiles', () => {
      expect(placer.isValidSpawnPosition(testGrid, 5, 8)).toBe(false);
    });

    test('should return false for floor tiles not above wall tiles', () => {
      // Create a floor tile that doesn't have a wall below it
      GridUtilities.setSafe(testGrid, 5, 6, 0); // Floor
      GridUtilities.setSafe(testGrid, 5, 7, 0); // Floor (no wall below)
      expect(placer.isValidSpawnPosition(testGrid, 5, 6)).toBe(false);
    });

    test('should return false for out of bounds coordinates', () => {
      expect(placer.isValidSpawnPosition(testGrid, -1, 7)).toBe(false);
      expect(placer.isValidSpawnPosition(testGrid, 10, 7)).toBe(false);
      expect(placer.isValidSpawnPosition(testGrid, 5, -1)).toBe(false);
      expect(placer.isValidSpawnPosition(testGrid, 5, 10)).toBe(false);
    });
  });

  describe('findValidSpawnPositions', () => {
    test('should find all valid spawn positions', () => {
      const validPositions = placer.findValidSpawnPositions(testGrid);
      
      // Should find positions in the bottom floor row (y=7) that have walls below (y=8)
      expect(validPositions.length).toBeGreaterThan(0);
      
      // All positions should be floor tiles above wall tiles
      for (const pos of validPositions) {
        expect(testGrid.get(pos.x, pos.y)).toBe(0); // Floor tile
        expect(testGrid.get(pos.x, pos.y + 1)).toBe(1); // Wall tile below
      }
    });

    test('should return empty array for grid with no valid positions', () => {
      // Create a grid with no floor tiles above wall tiles
      const emptyGrid = GridUtilities.createGrid(5, 5);
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          GridUtilities.setSafe(emptyGrid, x, y, 1); // All walls
        }
      }
      
      const validPositions = placer.findValidSpawnPositions(emptyGrid);
      expect(validPositions).toEqual([]);
    });

    test('should throw error for null grid', () => {
      expect(() => placer.findValidSpawnPositions(null)).toThrow('Grid is required');
    });
  });

  describe('placeSpawn', () => {
    test('should place spawn at valid position', () => {
      const result = placer.placeSpawn(testGrid, rng);
      
      expect(result.success).toBe(true);
      expect(result.position).toBeDefined();
      expect(result.position.x).toBeGreaterThanOrEqual(0);
      expect(result.position.y).toBeGreaterThanOrEqual(0);
      expect(result.position.x).toBeLessThan(10);
      expect(result.position.y).toBeLessThan(10);
      
      // Verify the placed position is valid
      expect(testGrid.get(result.position.x, result.position.y)).toBe(0); // Floor tile
      expect(testGrid.get(result.position.x, result.position.y + 1)).toBe(1); // Wall tile below
    });

    test('should return error when no valid positions found', () => {
      // Create a grid with no valid spawn positions
      const invalidGrid = GridUtilities.createGrid(5, 5);
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          GridUtilities.setSafe(invalidGrid, x, y, 1); // All walls
        }
      }
      
      const result = placer.placeSpawn(invalidGrid, rng);
      
      expect(result.success).toBe(false);
      expect(result.position).toBeNull();
      expect(result.error).toBe('No valid spawn positions found');
    });

    test('should throw error for null grid', () => {
      expect(() => placer.placeSpawn(null, rng)).toThrow('Grid is required');
    });

    test('should throw error for null RNG', () => {
      expect(() => placer.placeSpawn(testGrid, null)).toThrow('RandomGenerator is required');
    });
  });

  describe('placeSpawnWithConfig', () => {
    test('should use custom configuration', () => {
      const customPlacer = new PlayerSpawnPlacer({ maxAttempts: 50, safetyRadius: 3 });
      const result = customPlacer.placeSpawn(testGrid, rng);
      
      expect(result.success).toBe(true);
      expect(result.position).toBeDefined();
    });
  });

  describe('getSpawnStatistics', () => {
    test('should return statistics for valid grid', () => {
      const stats = placer.getSpawnStatistics(testGrid);
      
      expect(stats.totalPositions).toBeGreaterThan(0);
      expect(stats.validPositions).toBeGreaterThan(0);
      expect(stats.validPositions).toBeLessThanOrEqual(stats.totalPositions);
      expect(stats.validityRatio).toBeGreaterThan(0);
      expect(stats.validityRatio).toBeLessThanOrEqual(1);
    });

    test('should handle empty grid', () => {
      const emptyGrid = GridUtilities.createGrid(1, 1);
      GridUtilities.setSafe(emptyGrid, 0, 0, 1); // All walls
      const stats = placer.getSpawnStatistics(emptyGrid);
      
      expect(stats.totalPositions).toBe(1);
      expect(stats.validPositions).toBe(0);
      expect(stats.validityRatio).toBe(0);
    });
  });

  describe('constructor', () => {
    test('should use default configuration', () => {
      const defaultPlacer = new PlayerSpawnPlacer();
      expect(defaultPlacer.maxAttempts).toBe(100);
      expect(defaultPlacer.safetyRadius).toBe(2);
    });

    test('should use custom configuration', () => {
      const customPlacer = new PlayerSpawnPlacer({ 
        maxAttempts: 50, 
        safetyRadius: 3 
      });
      expect(customPlacer.maxAttempts).toBe(50);
      expect(customPlacer.safetyRadius).toBe(3);
    });

    test('should throw error for invalid configuration', () => {
      expect(() => new PlayerSpawnPlacer({ maxAttempts: -1 })).toThrow('maxAttempts must be positive');
      expect(() => new PlayerSpawnPlacer({ safetyRadius: 0 })).toThrow('safetyRadius must be positive');
    });
  });

  // NEW TESTS FOR LEFT-SIDE CONSTRAINT FUNCTIONALITY
  describe('left-side constraint functionality', () => {
    test('should use default leftSideBoundary of 25%', () => {
      const placer = new PlayerSpawnPlacer();
      expect(placer.leftSideBoundary).toBe(0.25);
    });

    test('should accept custom leftSideBoundary configuration', () => {
      const placer = new PlayerSpawnPlacer({ leftSideBoundary: 0.3 });
      expect(placer.leftSideBoundary).toBe(0.3);
    });

    test('should throw error for invalid leftSideBoundary', () => {
      expect(() => new PlayerSpawnPlacer({ leftSideBoundary: -0.1 })).toThrow('leftSideBoundary must be between 0 and 1');
      expect(() => new PlayerSpawnPlacer({ leftSideBoundary: 1.1 })).toThrow('leftSideBoundary must be between 0 and 1');
    });

    test('should find valid spawn positions only in left side of grid', () => {
      // Create a larger grid (20x10) to test left-side constraint
      const largeGrid = GridUtilities.createGrid(20, 10);
      
      // Create floor tiles in top 8 rows
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 20; x++) {
          GridUtilities.setSafe(largeGrid, x, y, 0); // Floor
        }
      }
      // Create wall tiles in bottom 2 rows
      for (let y = 8; y < 10; y++) {
        for (let x = 0; x < 20; x++) {
          GridUtilities.setSafe(largeGrid, x, y, 1); // Wall
        }
      }

      const placer = new PlayerSpawnPlacer({ leftSideBoundary: 0.25 });
      const validPositions = placer.findValidSpawnPositions(largeGrid);
      
      // All positions should be in the left 25% of the grid (x < 5)
      for (const pos of validPositions) {
        expect(pos.x).toBeLessThan(5); // 25% of 20 = 5
      }
    });

    test('should fallback to full grid search when no left-side positions found', () => {
      // Create a grid where only the right side has valid spawn positions
      const grid = GridUtilities.createGrid(10, 10);
      
      // Create floor tiles in top 8 rows, but only in right half
      for (let y = 0; y < 8; y++) {
        for (let x = 5; x < 10; x++) { // Only right half
          GridUtilities.setSafe(grid, x, y, 0); // Floor
        }
      }
      // Create wall tiles in bottom 2 rows, but only in right half
      for (let y = 8; y < 10; y++) {
        for (let x = 5; x < 10; x++) { // Only right half
          GridUtilities.setSafe(grid, x, y, 1); // Wall
        }
      }

      const placer = new PlayerSpawnPlacer({ leftSideBoundary: 0.25 });
      const validPositions = placer.findValidSpawnPositions(grid);
      
      // Should find positions in the right half (fallback behavior)
      expect(validPositions.length).toBeGreaterThan(0);
      for (const pos of validPositions) {
        expect(pos.x).toBeGreaterThanOrEqual(5); // Right half
      }
    });

    test('should place spawn in left side when valid positions exist', () => {
      // Create a grid with valid positions in both left and right sides
      const grid = GridUtilities.createGrid(20, 10);
      
      // Create floor tiles in top 8 rows
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 20; x++) {
          GridUtilities.setSafe(grid, x, y, 0); // Floor
        }
      }
      // Create wall tiles in bottom 2 rows
      for (let y = 8; y < 10; y++) {
        for (let x = 0; x < 20; x++) {
          GridUtilities.setSafe(grid, x, y, 1); // Wall
        }
      }

      const placer = new PlayerSpawnPlacer({ leftSideBoundary: 0.25 });
      const result = placer.placeSpawn(grid, rng);
      
      expect(result.success).toBe(true);
      expect(result.position.x).toBeLessThan(5); // Should be in left 25%
    });

    test('should include fallback warning in result when using fallback', () => {
      // Create a grid where only the right side has valid spawn positions
      const grid = GridUtilities.createGrid(10, 10);
      
      // Create floor tiles in top 8 rows, but only in right half
      for (let y = 0; y < 8; y++) {
        for (let x = 5; x < 10; x++) { // Only right half
          GridUtilities.setSafe(grid, x, y, 0); // Floor
        }
      }
      // Create wall tiles in bottom 2 rows, but only in right half
      for (let y = 8; y < 10; y++) {
        for (let x = 5; x < 10; x++) { // Only right half
          GridUtilities.setSafe(grid, x, y, 1); // Wall
        }
      }

      const placer = new PlayerSpawnPlacer({ leftSideBoundary: 0.25 });
      const result = placer.placeSpawn(grid, rng);
      
      expect(result.success).toBe(true);
      expect(result.fallbackUsed).toBe(true);
      expect(result.warning).toContain('No valid left-side spawn positions found');
    });
  });
}); 