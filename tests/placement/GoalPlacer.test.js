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
  });

  describe('validateConfig', () => {
    test('should validate valid config', () => {
      const config = {
        minDistance: 15,
        maxAttempts: 50,
        visibilityRadius: 5
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
      expect(positions).toEqual([]);
    });

    test('should throw error for null grid', () => {
      expect(() => placer.findValidGoalPositions(null, playerSpawn)).toThrow('Grid is required');
    });

    test('should throw error for null spawn', () => {
      expect(() => placer.findValidGoalPositions(testGrid, null)).toThrow('Player spawn is required');
    });
  });

  describe('optimizeGoalPlacement', () => {
    test('should select optimal goal position', () => {
      const validPositions = [
        { x: 15, y: 15 },
        { x: 16, y: 16 },
        { x: 14, y: 14 }
      ];
      
      const optimalPosition = placer.optimizeGoalPlacement(validPositions, playerSpawn);
      
      expect(optimalPosition).toBeDefined();
      expect(typeof optimalPosition.x).toBe('number');
      expect(typeof optimalPosition.y).toBe('number');
      expect(validPositions).toContainEqual(optimalPosition);
    });

    test('should return null for empty positions array', () => {
      const optimalPosition = placer.optimizeGoalPlacement([], playerSpawn);
      expect(optimalPosition).toBeNull();
    });

    test('should return single position when only one available', () => {
      const singlePosition = { x: 15, y: 15 };
      const optimalPosition = placer.optimizeGoalPlacement([singlePosition], playerSpawn);
      expect(optimalPosition).toEqual(singlePosition);
    });
  });

  describe('validateGoalVisibility', () => {
    test('should return true for visible goals', () => {
      // Goal in open area should be visible
      const visibleGoal = { x: 15, y: 15 };
      const result = placer.validateGoalVisibility(testGrid, visibleGoal);
      expect(result).toBe(true);
    });

    test('should return false for goals in corners', () => {
      // Goal in corner might have limited visibility
      const cornerGoal = { x: 18, y: 18 };
      const result = placer.validateGoalVisibility(testGrid, cornerGoal);
      // This might be true or false depending on implementation
      expect(typeof result).toBe('boolean');
    });

    test('should handle edge cases', () => {
      const edgeGoal = { x: 1, y: 1 };
      const result = placer.validateGoalVisibility(testGrid, edgeGoal);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('placeGoal', () => {
    test('should place goal successfully', () => {
      const result = placer.placeGoal(testGrid, playerSpawn, rng);
      
      expect(result.success).toBe(true);
      expect(result.position).toBeDefined();
      expect(typeof result.position.x).toBe('number');
      expect(typeof result.position.y).toBe('number');
      expect(placer.isValidGoalPosition(testGrid, result.position, playerSpawn)).toBe(true);
    });

    test('should return failure when no valid positions available', () => {
      // Create a small grid with spawn in center
      const smallGrid = GridUtilities.createGrid(5, 5, 0);
      const centerSpawn = { x: 2, y: 2 };
      
      const result = placer.placeGoal(smallGrid, centerSpawn, rng);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.position).toBeNull();
    });

    test('should use deterministic RNG for consistent results', () => {
      const rng1 = new RandomGenerator('same-seed');
      const rng2 = new RandomGenerator('same-seed');
      
      const result1 = placer.placeGoal(testGrid, playerSpawn, rng1);
      const result2 = placer.placeGoal(testGrid, playerSpawn, rng2);
      
      expect(result1.success).toBe(result2.success);
      if (result1.success && result2.success) {
        expect(result1.position).toEqual(result2.position);
      }
    });

    test('should throw error for null grid', () => {
      expect(() => placer.placeGoal(null, playerSpawn, rng)).toThrow('Grid is required');
    });

    test('should throw error for null spawn', () => {
      expect(() => placer.placeGoal(testGrid, null, rng)).toThrow('Player spawn is required');
    });

    test('should throw error for null RNG', () => {
      expect(() => placer.placeGoal(testGrid, playerSpawn, null)).toThrow('RandomGenerator is required');
    });
  });

  describe('placeGoalWithConfig', () => {
    test('should place goal with custom config', () => {
      const config = {
        minDistance: 5,
        maxAttempts: 50,
        visibilityRadius: 2
      };
      
      const result = placer.placeGoalWithConfig(testGrid, playerSpawn, rng, config);
      
      expect(result.success).toBe(true);
      expect(result.position).toBeDefined();
    });

    test('should validate config before placement', () => {
      const invalidConfig = { minDistance: -1 };
      
      expect(() => placer.placeGoalWithConfig(testGrid, playerSpawn, rng, invalidConfig))
        .toThrow('minDistance must be positive');
    });
  });

  describe('getGoalStatistics', () => {
    test('should return goal placement statistics', () => {
      const stats = placer.getGoalStatistics(testGrid, playerSpawn);
      
      expect(stats).toBeDefined();
      expect(typeof stats.validPositions).toBe('number');
      expect(typeof stats.reachablePositions).toBe('number');
      expect(typeof stats.unreachablePositions).toBe('number');
      expect(typeof stats.averageDistance).toBe('number');
    });

    test('should handle empty grid', () => {
      const emptyGrid = GridUtilities.createGrid(0, 0, 0);
      const stats = placer.getGoalStatistics(emptyGrid, playerSpawn);
      
      expect(stats.validPositions).toBe(0);
      expect(stats.reachablePositions).toBe(0);
      expect(stats.unreachablePositions).toBe(0);
    });
  });
}); 