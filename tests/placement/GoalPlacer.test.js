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
    rng = new RandomGenerator('test-seed');
    pathfinding = new PathfindingIntegration();
    
    // Create a simple test grid: 20x20 with cave-like structure
    testGrid = GridUtilities.createGrid(20, 20, 0); // Start with all floor
    
    // Create cave-like structure with walls
    for (let x = 0; x < 20; x++) {
      GridUtilities.setSafe(testGrid, x, 0, 1); // Top wall
      GridUtilities.setSafe(testGrid, x, 19, 1); // Bottom wall
    }
    for (let y = 0; y < 20; y++) {
      GridUtilities.setSafe(testGrid, 0, y, 1); // Left wall
      GridUtilities.setSafe(testGrid, 19, y, 1); // Right wall
    }
    
    // Add internal walls to create separate regions
    // Region 1 (left side)
    for (let x = 1; x < 8; x++) {
      GridUtilities.setSafe(testGrid, x, 10, 1);
    }
    
    // Region 2 (right side) - separated by walls
    for (let x = 12; x < 19; x++) {
      GridUtilities.setSafe(testGrid, x, 10, 1);
    }
    
    // Add some floor tiles in each region
    for (let x = 2; x < 7; x++) {
      for (let y = 2; y < 9; y++) {
        GridUtilities.setSafe(testGrid, x, y, 0);
      }
    }
    
    for (let x = 13; x < 18; x++) {
      for (let y = 12; y < 18; y++) {
        GridUtilities.setSafe(testGrid, x, y, 0);
      }
    }
    
    // Set player spawn in left region
    playerSpawn = { x: 4, y: 4 };
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
      
      const distance = placer.calculateDistance(point1, point2);
      expect(distance).toBe(5); // 3-4-5 triangle
    });

    test('should return 0 for same points', () => {
      const point = { x: 5, y: 5 };
      const distance = placer.calculateDistance(point, point);
      expect(distance).toBe(0);
    });

    test('should handle negative coordinates', () => {
      const point1 = { x: -3, y: -4 };
      const point2 = { x: 0, y: 0 };
      
      const distance = placer.calculateDistance(point1, point2);
      expect(distance).toBe(5);
    });
  });

  describe('isValidGoalPosition', () => {
    test('should return true for valid goal positions', () => {
      // Test position in right region (far from spawn)
      const validPosition = { x: 15, y: 15 };
      expect(placer.isValidGoalPosition(testGrid, validPosition, playerSpawn)).toBe(true);
    });

    test('should return false for positions too close to spawn', () => {
      // Test position too close to spawn
      const closePosition = { x: 5, y: 5 };
      expect(placer.isValidGoalPosition(testGrid, closePosition, playerSpawn)).toBe(false);
    });

    test('should return false for wall positions', () => {
      const wallPosition = { x: 0, y: 0 };
      expect(placer.isValidGoalPosition(testGrid, wallPosition, playerSpawn)).toBe(false);
    });

    test('should return false for out of bounds positions', () => {
      const outOfBoundsPosition = { x: 25, y: 25 };
      expect(placer.isValidGoalPosition(testGrid, outOfBoundsPosition, playerSpawn)).toBe(false);
    });

    test('should return false for positions outside right-side boundary', () => {
      const rightSidePlacer = new GoalPlacer({ rightSideBoundary: 0.75 });
      const leftSidePosition = { x: 10, y: 15 }; // In left 75% of 20-width grid
      expect(rightSidePlacer.isValidGoalPosition(testGrid, leftSidePosition, playerSpawn)).toBe(false);
    });

    test('should return true for positions within right-side boundary', () => {
      const rightSidePlacer = new GoalPlacer({ rightSideBoundary: 0.75 });
      const rightSidePosition = { x: 16, y: 15 }; // In right 25% of 20-width grid
      expect(rightSidePlacer.isValidGoalPosition(testGrid, rightSidePosition, playerSpawn)).toBe(true);
    });
  });

  describe('isCurrentlyUnreachable', () => {
    test('should return true for unreachable goals', () => {
      // Goal in right region should be unreachable from left region spawn
      const unreachableGoal = { x: 15, y: 15 };
      const result = placer.isCurrentlyUnreachable(testGrid, playerSpawn, unreachableGoal);
      expect(result).toBe(true);
    });

    test('should return false for reachable goals', () => {
      // Goal in same region as spawn should be reachable
      const reachableGoal = { x: 6, y: 6 };
      const result = placer.isCurrentlyUnreachable(testGrid, playerSpawn, reachableGoal);
      expect(result).toBe(false);
    });

    test('should handle invalid coordinates gracefully', () => {
      const invalidGoal = { x: -1, y: -1 };
      const result = placer.isCurrentlyUnreachable(testGrid, playerSpawn, invalidGoal);
      expect(result).toBe(true); // Invalid coordinates are considered unreachable
    });
  });

  describe('findValidGoalPositions', () => {
    test('should find valid goal positions', () => {
      const positions = placer.findValidGoalPositions(testGrid, playerSpawn);
      
      expect(Array.isArray(positions)).toBe(true);
      expect(positions.length).toBeGreaterThan(0);
      
      // All returned positions should be valid
      for (const pos of positions) {
        expect(placer.isValidGoalPosition(testGrid, pos, playerSpawn)).toBe(true);
      }
    });

    test('should return empty array when no valid positions available', () => {
      // Create a small grid with spawn in center
      const smallGrid = GridUtilities.createGrid(5, 5, 0);
      const centerSpawn = { x: 2, y: 2 };
      
      const positions = placer.findValidGoalPositions(smallGrid, centerSpawn);
      expect(positions.length).toBe(0);
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
      const smallGrid = GridUtilities.createGrid(10, 10, 0);
      const centerSpawn = { x: 5, y: 5 };
      
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
    test('should return null for empty positions array', () => {
      const result = placer.optimizeGoalPlacement([], playerSpawn);
      expect(result).toBeNull();
    });

    test('should return single position when only one available', () => {
      const singlePosition = { x: 15, y: 15 };
      const result = placer.optimizeGoalPlacement([singlePosition], playerSpawn);
      expect(result).toEqual(singlePosition);
    });

    test('should select position with maximum distance from spawn', () => {
      const positions = [
        { x: 10, y: 10 },
        { x: 15, y: 15 },
        { x: 12, y: 12 }
      ];
      
      const result = placer.optimizeGoalPlacement(positions, playerSpawn);
      expect(result).toEqual({ x: 15, y: 15 }); // Should be farthest from spawn at (4, 4)
    });
  });

  describe('validateGoalVisibility', () => {
    test('should return true for visible goals', () => {
      const visibleGoal = { x: 15, y: 15 };
      const result = placer.validateGoalVisibility(testGrid, visibleGoal);
      expect(result).toBe(true);
    });

    test('should return false for goals surrounded by walls', () => {
      // Create a goal surrounded by walls
      const surroundedGoal = { x: 5, y: 5 };
      // Add walls around the goal
      GridUtilities.setSafe(testGrid, 4, 5, 1);
      GridUtilities.setSafe(testGrid, 6, 5, 1);
      GridUtilities.setSafe(testGrid, 5, 4, 1);
      GridUtilities.setSafe(testGrid, 5, 6, 1);
      
      const result = placer.validateGoalVisibility(testGrid, surroundedGoal);
      expect(result).toBe(false);
    });
  });

  describe('placeGoal', () => {
    test('should place goal successfully', () => {
      const result = placer.placeGoal(testGrid, playerSpawn, rng);
      
      expect(result.success).toBe(true);
      expect(result.position).toBeDefined();
      expect(result.position.x).toBeGreaterThanOrEqual(0);
      expect(result.position.y).toBeGreaterThanOrEqual(0);
      expect(placer.isValidGoalPosition(testGrid, result.position, playerSpawn)).toBe(true);
    });

    test('should fail when no valid positions available', () => {
      // Create a grid with no valid goal positions
      const smallGrid = GridUtilities.createGrid(5, 5, 0);
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
      const smallGrid = GridUtilities.createGrid(10, 10, 0);
      const centerSpawn = { x: 5, y: 5 };
      
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
    test('should place goal with custom config', () => {
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
    test('should return goal statistics', () => {
      const stats = placer.getGoalStatistics(testGrid, playerSpawn);
      
      expect(stats).toBeDefined();
      expect(stats.totalValidPositions).toBeGreaterThanOrEqual(0);
      expect(stats.averageDistance).toBeGreaterThanOrEqual(0);
      expect(stats.maxDistance).toBeGreaterThanOrEqual(0);
      expect(stats.minDistance).toBeGreaterThanOrEqual(0);
    });

    test('should return right-side constraint statistics', () => {
      const rightSidePlacer = new GoalPlacer({ rightSideBoundary: 0.75 });
      const stats = rightSidePlacer.getGoalStatistics(testGrid, playerSpawn);
      
      expect(stats).toBeDefined();
      expect(stats.totalValidPositions).toBeGreaterThanOrEqual(0);
      expect(stats.rightSidePositions).toBeGreaterThanOrEqual(0);
      expect(stats.rightSideBoundaryX).toBeDefined();
    });
  });

  describe('placeGoalAfterPlatforms', () => {
    test('should place goal after platforms are placed', () => {
      const result = placer.placeGoalAfterPlatforms(testGrid, playerSpawn, 10, rng);
      
      expect(result).toBeDefined();
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(placer.isValidGoalPosition(testGrid, result, playerSpawn)).toBe(true);
    });

    test('should place goal in right side with constraint after platforms', () => {
      const rightSidePlacer = new GoalPlacer({ rightSideBoundary: 0.75 });
      const result = rightSidePlacer.placeGoalAfterPlatforms(testGrid, playerSpawn, 10, rng);
      
      expect(result).toBeDefined();
      
      // Goal should be in right side of map
      const rightSideBoundaryX = Math.floor(testGrid.shape[0] * 0.75);
      expect(result.x).toBeGreaterThanOrEqual(rightSideBoundaryX);
      expect(rightSidePlacer.isValidGoalPosition(testGrid, result, playerSpawn)).toBe(true);
    });
  });
}); 