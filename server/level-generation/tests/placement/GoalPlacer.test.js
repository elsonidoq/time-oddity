/**
 * @fileoverview Tests for GoalPlacer
 * Tests goal placement with comprehensive reachability validation
 */

const GoalPlacer = require('../../src/placement/GoalPlacer');
const GridUtilities = require('../../src/core/GridUtilities');
const RandomGenerator = require('../../src/core/RandomGenerator');
const PathfindingIntegration = require('../../src/pathfinding/PathfindingIntegration');

describe('GoalPlacer', () => {
  let placer;
  let rng;
  let pathfinding;
  let testGrid;
  let playerSpawn;

  beforeEach(() => {
    placer = new GoalPlacer();
    rng = global.testUtils.createSeededRandom('test-seed');
    pathfinding = new PathfindingIntegration();
    
    // Create a test grid with proper wall/floor structure
    // 0 = floor, 1 = wall
    testGrid = GridUtilities.createGrid(20, 20);
    
    // Create a simple cave structure with walls at the bottom
    // Top 18 rows are floor, bottom 2 rows are walls
    for (let y = 0; y < 18; y++) {
      for (let x = 0; x < 20; x++) {
        GridUtilities.setSafe(testGrid, x, y, 0); // Floor
      }
    }
    for (let y = 18; y < 20; y++) {
      for (let x = 0; x < 20; x++) {
        GridUtilities.setSafe(testGrid, x, y, 1); // Wall
      }
    }
    
    // Set player spawn at a valid position (floor tile above wall)
    playerSpawn = { x: 4, y: 17 }; // Floor tile with wall below
  });

  describe('constructor', () => {
    test('should create a GoalPlacer instance with default config', () => {
      expect(placer).toBeInstanceOf(GoalPlacer);
      expect(placer.minDistance).toBe(10);
      expect(placer.maxAttempts).toBe(100);
      expect(placer.visibilityRadius).toBe(3);
    });

    test('should create a GoalPlacer instance with custom config', () => {
      const customPlacer = new GoalPlacer({
        minDistance: 15,
        maxAttempts: 50,
        visibilityRadius: 5
      });
      
      expect(customPlacer.minDistance).toBe(15);
      expect(customPlacer.maxAttempts).toBe(50);
      expect(customPlacer.visibilityRadius).toBe(5);
    });

    test('should create a GoalPlacer instance with right-side constraint', () => {
      const rightSidePlacer = new GoalPlacer({
        minDistance: 10,
        maxAttempts: 100,
        visibilityRadius: 3,
        rightSideBoundary: 0.75 // Goal in right 25% of map
      });
      
      expect(rightSidePlacer.rightSideBoundary).toBe(0.75);
    });
  });

  describe('validateConfig', () => {
    test('should validate valid config', () => {
      const config = {
        minDistance: 15,
        maxAttempts: 50,
        visibilityRadius: 5,
        rightSideBoundary: 0.75
      };
      
      expect(() => placer.validateConfig(config)).not.toThrow();
    });

    test('should throw error for invalid minDistance', () => {
      const config = { minDistance: -1 };
      expect(() => placer.validateConfig(config)).toThrow('minDistance must be positive');
    });

    test('should throw error for invalid maxAttempts', () => {
      const config = { maxAttempts: 0 };
      expect(() => placer.validateConfig(config)).toThrow('maxAttempts must be positive');
    });

    test('should throw error for invalid visibilityRadius', () => {
      const config = { visibilityRadius: -1 };
      expect(() => placer.validateConfig(config)).toThrow('visibilityRadius must be positive');
    });

    test('should throw error for invalid rightSideBoundary', () => {
      const config = { rightSideBoundary: 1.5 };
      expect(() => placer.validateConfig(config)).toThrow('rightSideBoundary must be between 0 and 1');
    });

    test('should throw error for negative rightSideBoundary', () => {
      const config = { rightSideBoundary: -0.1 };
      expect(() => placer.validateConfig(config)).toThrow('rightSideBoundary must be between 0 and 1');
    });
  });

  describe('calculateDistance', () => {
    test('should calculate Euclidean distance correctly', () => {
      const point1 = { x: 0, y: 0 };
      const point2 = { x: 3, y: 4 };
      
      expect(placer.calculateDistance(point1, point2)).toBe(5);
    });

    test('should return 0 for same points', () => {
      const point = { x: 5, y: 5 };
      expect(placer.calculateDistance(point, point)).toBe(0);
    });
  });

  describe('isValidGoalPosition', () => {
    test('should return true for floor tiles above wall tiles', () => {
      // Minimal 3x3 grid: (1,1) is floor, (1,2) is wall
      const grid = GridUtilities.createGrid(3, 3);
      for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) GridUtilities.setSafe(grid, x, y, 0);
      GridUtilities.setSafe(grid, 1, 2, 1); // Wall below
      const validGoal = { x: 1, y: 1 };
      const farSpawn = { x: 0, y: 0 };
      const placerLocal = new GoalPlacer({ minDistance: 1 });
      expect(placerLocal.isValidGoalPosition(grid, validGoal, farSpawn)).toBe(true);
    });

    test('should return false for wall tiles', () => {
      const wallGoal = { x: 10, y: 18 };
      expect(placer.isValidGoalPosition(testGrid, wallGoal, playerSpawn)).toBe(false);
    });

    test('should return false for floor tiles not above wall tiles', () => {
      // Create a floor tile that doesn't have a wall below it
      GridUtilities.setSafe(testGrid, 10, 16, 0); // Floor
      GridUtilities.setSafe(testGrid, 10, 17, 0); // Floor (no wall below)
      const invalidGoal = { x: 10, y: 16 };
      expect(placer.isValidGoalPosition(testGrid, invalidGoal, playerSpawn)).toBe(false);
    });

    test('should return false for positions too close to player spawn', () => {
      const closeGoal = { x: 5, y: 17 }; // Too close to spawn at (4, 17)
      expect(placer.isValidGoalPosition(testGrid, closeGoal, playerSpawn)).toBe(false);
    });

    test('should return false for out of bounds coordinates', () => {
      const outOfBoundsGoal = { x: -1, y: 17 };
      expect(placer.isValidGoalPosition(testGrid, outOfBoundsGoal, playerSpawn)).toBe(false);
      
      const outOfBoundsGoal2 = { x: 20, y: 17 };
      expect(placer.isValidGoalPosition(testGrid, outOfBoundsGoal2, playerSpawn)).toBe(false);
    });

    test('should return false for positions outside right-side boundary', () => {
      const rightSidePlacer = new GoalPlacer({ rightSideBoundary: 0.75 });
      const leftSidePosition = { x: 10, y: 17 }; // In left 75% of 20-width grid
      expect(rightSidePlacer.isValidGoalPosition(testGrid, leftSidePosition, playerSpawn)).toBe(false);
    });

    test('should return true for positions within right-side boundary', () => {
      const rightSidePlacer = new GoalPlacer({ rightSideBoundary: 0.75 });
      const rightSidePosition = { x: 16, y: 17 }; // In right 25% of 20-width grid
      expect(rightSidePlacer.isValidGoalPosition(testGrid, rightSidePosition, playerSpawn)).toBe(true);
    });
  });

  describe('isCurrentlyUnreachable', () => {
    test('should return true for unreachable goals', () => {
      // Minimal 3x3 grid: (2,1) is floor, (2,2) is wall, playerSpawn at (0,1), wall at (1,0),(1,1),(1,2)
      const grid = GridUtilities.createGrid(3, 3);
      for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) GridUtilities.setSafe(grid, x, y, 0);
      GridUtilities.setSafe(grid, 2, 2, 1); // Wall below goal
      for (let y = 0; y < 3; y++) GridUtilities.setSafe(grid, 1, y, 1); // Block path
      const unreachableGoal = { x: 2, y: 1 };
      const playerSpawn = { x: 0, y: 1 };
      expect(placer.isCurrentlyUnreachable(grid, playerSpawn, unreachableGoal)).toBe(true);
    });

    test('should return false for reachable goals', () => {
      const reachableGoal = { x: 8, y: 17 };
      const result = placer.isCurrentlyUnreachable(testGrid, playerSpawn, reachableGoal);
      expect(result).toBe(false);
    });

    test('should return true for invalid coordinates', () => {
      const invalidGoal = { x: -1, y: 17 };
      const result = placer.isCurrentlyUnreachable(testGrid, playerSpawn, invalidGoal);
      expect(result).toBe(true);
    });
  });

  describe('findValidGoalPositions', () => {
    test('should find all valid goal positions', () => {
      const validPositions = placer.findValidGoalPositions(testGrid, playerSpawn);
      
      expect(validPositions.length).toBeGreaterThan(0);
      
      // All positions should be floor tiles above wall tiles
      for (const pos of validPositions) {
        expect(testGrid.get(pos.x, pos.y)).toBe(0); // Floor tile
        expect(testGrid.get(pos.x, pos.y + 1)).toBe(1); // Wall tile below
        
        // Should be at least minDistance away from player spawn
        const distance = placer.calculateDistance(playerSpawn, pos);
        expect(distance).toBeGreaterThanOrEqual(placer.minDistance);
      }
    });

    test('should return empty array when no valid positions found', () => {
      // Create a grid with no floor tiles above wall tiles
      const emptyGrid = GridUtilities.createGrid(5, 5);
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          GridUtilities.setSafe(emptyGrid, x, y, 1); // All walls
        }
      }
      
      const validPositions = placer.findValidGoalPositions(emptyGrid, playerSpawn);
      expect(validPositions).toEqual([]);
    });

    test('should throw error for null grid', () => {
      expect(() => placer.findValidGoalPositions(null, playerSpawn)).toThrow('Grid is required');
    });

    test('should throw error for null player spawn', () => {
      expect(() => placer.findValidGoalPositions(testGrid, null)).toThrow('Player spawn is required');
    });

    test('should find valid goal positions with right-side constraint', () => {
      const rightSidePlacer = new GoalPlacer({ rightSideBoundary: 0.75 });
      const positions = rightSidePlacer.findValidGoalPositions(testGrid, playerSpawn);
      
      expect(Array.isArray(positions)).toBe(true);
      expect(positions.length).toBeGreaterThan(0);
      
      // All returned positions should be in right side of map
      const rightSideBoundaryX = Math.floor(testGrid.shape[0] * 0.75);
      for (const pos of positions) {
        expect(pos.x).toBeGreaterThanOrEqual(rightSideBoundaryX);
        expect(rightSidePlacer.isValidGoalPosition(testGrid, pos, playerSpawn)).toBe(true);
      }
    });

    test('should return empty array when no valid right-side positions available', () => {
      // Create a grid where right side has no valid positions
      const smallGrid = GridUtilities.createGrid(10, 10);
      const centerSpawn = { x: 5, y: 8 };
      
      // Make right side all walls
      for (let x = 8; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          GridUtilities.setSafe(smallGrid, x, y, 1);
        }
      }
      
      const rightSidePlacer = new GoalPlacer({ rightSideBoundary: 0.8 });
      const positions = rightSidePlacer.findValidGoalPositions(smallGrid, centerSpawn);
      expect(positions.length).toBe(0);
    });
  });

  describe('optimizeGoalPlacement', () => {
    test('should return optimal position with maximum distance', () => {
      const validPositions = [
        { x: 5, y: 17 },
        { x: 15, y: 17 },
        { x: 10, y: 17 }
      ];
      
      const optimal = placer.optimizeGoalPlacement(validPositions, playerSpawn);
      
      expect(optimal).toEqual({ x: 15, y: 17 }); // Should be the farthest
    });

    test('should return single position when only one available', () => {
      const singlePosition = [{ x: 10, y: 17 }];
      const optimal = placer.optimizeGoalPlacement(singlePosition, playerSpawn);
      
      expect(optimal).toEqual({ x: 10, y: 17 });
    });

    test('should return null for empty array', () => {
      const optimal = placer.optimizeGoalPlacement([], playerSpawn);
      expect(optimal).toBeNull();
    });
  });

  describe('validateGoalVisibility', () => {
    test('should return true for visible goals', () => {
      const visibleGoal = { x: 10, y: 17 };
      const result = placer.validateGoalVisibility(testGrid, visibleGoal);
      expect(result).toBe(true);
    });

    test('should return false for goals surrounded by walls', () => {
      // Create a goal surrounded by walls
      GridUtilities.setSafe(testGrid, 10, 16, 1); // Wall above
      GridUtilities.setSafe(testGrid, 9, 17, 1);  // Wall left
      GridUtilities.setSafe(testGrid, 11, 17, 1); // Wall right
      GridUtilities.setSafe(testGrid, 10, 18, 1); // Wall below (already wall)
      
      const surroundedGoal = { x: 10, y: 17 };
      const result = placer.validateGoalVisibility(testGrid, surroundedGoal);
      expect(result).toBe(false);
    });
  });

  describe('placeGoal', () => {
    test('should place goal at valid position', () => {
      const result = placer.placeGoal(testGrid, playerSpawn, rng);
      
      expect(result.success).toBe(true);
      expect(result.position).toBeDefined();
      expect(result.position.x).toBeGreaterThanOrEqual(0);
      expect(result.position.y).toBeGreaterThanOrEqual(0);
      expect(placer.isValidGoalPosition(testGrid, result.position, playerSpawn)).toBe(true);
    });

    test('should return error when no valid positions found', () => {
      // Create a grid with no valid goal positions
      const smallGrid = GridUtilities.createGrid(5, 5);
      const centerSpawn = { x: 2, y: 2 };
      
      const result = placer.placeGoal(smallGrid, centerSpawn, rng);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should place goal in right side with constraint', () => {
      const rightSidePlacer = new GoalPlacer({ rightSideBoundary: 0.75 });
      const result = rightSidePlacer.placeGoal(testGrid, playerSpawn, rng);
      
      expect(result.success).toBe(true);
      expect(result.position).toBeDefined();
      
      // Goal should be in right side of map
      const rightSideBoundaryX = Math.floor(testGrid.shape[0] * 0.75);
      expect(result.position.x).toBeGreaterThanOrEqual(rightSideBoundaryX);
      expect(rightSidePlacer.isValidGoalPosition(testGrid, result.position, playerSpawn)).toBe(true);
    });

    test('should fail when no valid right-side positions available', () => {
      // Create a grid where right side has no valid positions
      const smallGrid = GridUtilities.createGrid(10, 10);
      const centerSpawn = { x: 5, y: 8 };
      
      // Make right side all walls
      for (let x = 8; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          GridUtilities.setSafe(smallGrid, x, y, 1);
        }
      }
      
      const rightSidePlacer = new GoalPlacer({ rightSideBoundary: 0.8 });
      const result = rightSidePlacer.placeGoal(smallGrid, centerSpawn, rng);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('placeGoalWithConfig', () => {
    test('should use custom configuration', () => {
      const config = {
        minDistance: 5,
        maxAttempts: 50,
        visibilityRadius: 2
      };
      
      const result = placer.placeGoalWithConfig(testGrid, playerSpawn, rng, config);
      
      expect(result.success).toBe(true);
      expect(result.position).toBeDefined();
    });

    test('should place goal with right-side constraint config', () => {
      const customConfig = {
        minDistance: 5,
        maxAttempts: 50,
        visibilityRadius: 2,
        rightSideBoundary: 0.75
      };
      
      const result = placer.placeGoalWithConfig(testGrid, playerSpawn, rng, customConfig);
      
      expect(result.success).toBe(true);
      expect(result.position).toBeDefined();
      
      // Goal should be in right side of map
      const rightSideBoundaryX = Math.floor(testGrid.shape[0] * 0.75);
      expect(result.position.x).toBeGreaterThanOrEqual(rightSideBoundaryX);
    });
  });

  describe('getGoalStatistics', () => {
    test('should return statistics for valid grid', () => {
      const stats = placer.getGoalStatistics(testGrid, playerSpawn);
      
      expect(stats).toBeDefined();
      expect(stats.totalPositions).toBeGreaterThan(0);
      expect(stats.validPositions).toBeGreaterThan(0);
      expect(stats.validityRatio).toBeGreaterThan(0);
    });

    test('should handle empty grid', () => {
      const emptyGrid = GridUtilities.createGrid(1, 1);
      GridUtilities.setSafe(emptyGrid, 0, 0, 1); // All walls
      const stats = placer.getGoalStatistics(emptyGrid, playerSpawn);
      
      expect(stats.totalPositions).toBe(1);
      expect(stats.validPositions).toBe(0);
      expect(stats.validityRatio).toBe(0);
    });

    test('should return right-side constraint statistics', () => {
      const rightSidePlacer = new GoalPlacer({ rightSideBoundary: 0.75 });
      const stats = rightSidePlacer.getGoalStatistics(testGrid, playerSpawn);
      
      expect(stats).toBeDefined();
      expect(stats.totalPositions).toBeGreaterThan(0);
      expect(stats.validPositions).toBeGreaterThan(0);
      expect(stats.rightSidePositions).toBeGreaterThan(0);
      expect(stats.rightSideBoundaryX).toBeDefined();
    });
  });

  describe('placeGoalAfterPlatforms', () => {
    test('should throw error when no reachable positions meet minimum distance', () => {
      // Create a small grid where all reachable positions are too close
      const smallGrid = GridUtilities.createGrid(5, 5);
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          GridUtilities.setSafe(smallGrid, x, y, 0); // All floor
        }
      }
      const centerSpawn = { x: 2, y: 2 };
      
      expect(() => {
        placer.placeGoalAfterPlatforms(smallGrid, centerSpawn, 10, rng);
      }).toThrow('No valid goal position found after platform placement');
    });

    test('should return a valid goal position from reachable tiles', () => {
      const result = placer.placeGoalAfterPlatforms(testGrid, playerSpawn, 5, rng);
      
      expect(result).toBeDefined();
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
      
      // Should be a floor tile with wall below
      expect(testGrid.get(result.x, result.y)).toBe(0);
      expect(testGrid.get(result.x, result.y + 1)).toBe(1);
    });

    test('should only call reachability analysis once', () => {
      const mockAnalyzer = {
        detectReachablePositionsFromStartingPoint: jest.fn().mockReturnValue([
          { x: 15, y: 17 },
          { x: 16, y: 17 },
          { x: 17, y: 17 }
        ])
      };
      
      placer.physicsAnalyzer = mockAnalyzer;
      
      placer.placeGoalAfterPlatforms(testGrid, playerSpawn, 5, rng);
      
      expect(mockAnalyzer.detectReachablePositionsFromStartingPoint).toHaveBeenCalledTimes(1);
    });

    test('should respect minimum distance constraint', () => {
      const result = placer.placeGoalAfterPlatforms(testGrid, playerSpawn, 8, rng);
      
      const distance = placer.calculateDistance(playerSpawn, result);
      expect(distance).toBeGreaterThanOrEqual(8);
    });

    test('should be deterministic with seeded RNG', () => {
      const rng1 = global.testUtils.createSeededRandom('same-seed');
      const rng2 = global.testUtils.createSeededRandom('same-seed');
      
      const result1 = placer.placeGoalAfterPlatforms(testGrid, playerSpawn, 5, rng1);
      const result2 = placer.placeGoalAfterPlatforms(testGrid, playerSpawn, 5, rng2);
      
      expect(result1).toEqual(result2);
    });

    test('should filter out positions inside colliding blocks', () => {
      // Create a grid where some reachable positions are on walls
      GridUtilities.setSafe(testGrid, 15, 17, 1); // Wall at reachable position
      
      const result = placer.placeGoalAfterPlatforms(testGrid, playerSpawn, 5, rng);
      
      // Result should not be on a wall
      expect(testGrid.get(result.x, result.y)).toBe(0);
    });

    test('should place goal in right side with constraint after platforms', () => {
      const rightSidePlacer = new GoalPlacer({ rightSideBoundary: 0.75 });
      const result = rightSidePlacer.placeGoalAfterPlatforms(testGrid, playerSpawn, 5, rng);
      
      expect(result).toBeDefined();
      
      // Goal should be in right side of map
      const rightSideBoundaryX = Math.floor(testGrid.shape[0] * 0.75);
      expect(result.x).toBeGreaterThanOrEqual(rightSideBoundaryX);
      expect(rightSidePlacer.isValidGoalPosition(testGrid, result, playerSpawn)).toBe(true);
    });
  });
}); 