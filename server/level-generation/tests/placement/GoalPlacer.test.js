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
      
      const hiddenGoal = { x: 10, y: 17 };
      const result = placer.validateGoalVisibility(testGrid, hiddenGoal);
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
      expect(result.position.x).toBeLessThan(20);
      expect(result.position.y).toBeLessThan(20);
      
      // Verify the placed position is valid
      expect(testGrid.get(result.position.x, result.position.y)).toBe(0); // Floor tile
      expect(testGrid.get(result.position.x, result.position.y + 1)).toBe(1); // Wall tile below
      
      // Verify distance constraint
      const distance = placer.calculateDistance(playerSpawn, result.position);
      expect(distance).toBeGreaterThanOrEqual(placer.minDistance);
    });

    test('should return error when no valid positions found', () => {
      // Create a grid with no valid goal positions
      const invalidGrid = GridUtilities.createGrid(5, 5);
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          GridUtilities.setSafe(invalidGrid, x, y, 1); // All walls
        }
      }
      
      const result = placer.placeGoal(invalidGrid, playerSpawn, rng);
      
      expect(result.success).toBe(false);
      expect(result.position).toBeNull();
      expect(result.error).toBe('No valid goal positions found');
    });

    test('should include goal statistics in result', () => {
      const result = placer.placeGoal(testGrid, playerSpawn, rng);
      expect(result.success).toBe(true);
      expect(result.statistics).toBeDefined();
      expect(result.statistics.totalPositions).toBeGreaterThan(0);
      expect(result.statistics.validPositions).toBeGreaterThan(0);
    });
  });

  describe('placeGoalWithConfig', () => {
    test('should use custom configuration', () => {
      const customPlacer = new GoalPlacer({ minDistance: 5, maxAttempts: 50 });
      const result = customPlacer.placeGoal(testGrid, playerSpawn, rng);
      
      expect(result.success).toBe(true);
      expect(result.position).toBeDefined();
    });
  });

  describe('getGoalStatistics', () => {
    test('should return statistics for valid grid', () => {
      const stats = placer.getGoalStatistics(testGrid, playerSpawn);
      
      expect(stats.totalPositions).toBeGreaterThan(0);
      expect(stats.validPositions).toBeGreaterThan(0);
      expect(stats.validPositions).toBeLessThanOrEqual(stats.totalPositions);
      expect(stats.validityRatio).toBeGreaterThan(0);
      expect(stats.validityRatio).toBeLessThanOrEqual(1);
    });

    test('should handle empty grid', () => {
      const emptyGrid = GridUtilities.createGrid(1, 1);
      GridUtilities.setSafe(emptyGrid, 0, 0, 1); // All walls
      const stats = placer.getGoalStatistics(emptyGrid, playerSpawn);
      
      expect(stats.totalPositions).toBe(1);
      expect(stats.validPositions).toBe(0);
      expect(stats.validityRatio).toBe(0);
    });
  });

  describe('constructor', () => {
    test('should use default configuration', () => {
      const defaultPlacer = new GoalPlacer();
      expect(defaultPlacer.minDistance).toBe(10);
      expect(defaultPlacer.maxAttempts).toBe(100);
      expect(defaultPlacer.visibilityRadius).toBe(3);
    });

    test('should use custom configuration', () => {
      const customPlacer = new GoalPlacer({ 
        minDistance: 5, 
        maxAttempts: 50, 
        visibilityRadius: 2 
      });
      expect(customPlacer.minDistance).toBe(5);
      expect(customPlacer.maxAttempts).toBe(50);
      expect(customPlacer.visibilityRadius).toBe(2);
    });

    test('should throw error for invalid configuration', () => {
      expect(() => new GoalPlacer({ minDistance: -1 })).toThrow('minDistance must be positive');
      expect(() => new GoalPlacer({ maxAttempts: 0 })).toThrow('maxAttempts must be positive');
      expect(() => new GoalPlacer({ visibilityRadius: -1 })).toThrow('visibilityRadius must be positive');
    });
  });

  describe('placeGoalAfterPlatforms', () => {
    let physicsAnalyzer;

    beforeEach(() => {
      physicsAnalyzer = new (require('../../src/analysis/PhysicsAwareReachabilityAnalyzer'))();
    });

    test('should throw error when no reachable positions meet minimum distance', () => {
      // Create a small grid with limited reachable area
      const smallGrid = global.testUtils.createMockGrid(10, 10);
      
      // Create a simple cave structure
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 10; x++) {
          smallGrid.set(x, y, 0); // Floor
        }
      }
      for (let y = 8; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          smallGrid.set(x, y, 1); // Wall
        }
      }
      
      const playerSpawn = { x: 1, y: 7 };
      const minDistance = 15; // Too large for this small grid
      
      expect(() => {
        placer.placeGoalAfterPlatforms(smallGrid, playerSpawn, minDistance, rng);
      }).toThrow('No valid goal position found after platform placement');
    });

    test('should return a valid goal position from reachable tiles', () => {
      // Create a grid with platforms marked as walls
      const grid = global.testUtils.createMockGrid(20, 20);
      
      // Create floor structure
      for (let y = 0; y < 18; y++) {
        for (let x = 0; x < 20; x++) {
          grid.set(x, y, 0); // Floor
        }
      }
      // Create wall base
      for (let y = 18; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
          grid.set(x, y, 1); // Wall
        }
      }
      
      // Add some platforms (marked as walls)
      grid.set(5, 15, 1); // Platform tile
      grid.set(6, 15, 1); // Platform tile
      grid.set(7, 15, 1); // Platform tile
      
      const playerSpawn = { x: 2, y: 17 };
      const minDistance = 5;
      
      const result = placer.placeGoalAfterPlatforms(grid, playerSpawn, minDistance, rng);
      
      expect(result).toBeDefined();
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.x).toBeLessThan(20);
      expect(result.y).toBeLessThan(20);
      
      // Should be a floor tile
      expect(grid.get(result.x, result.y)).toBe(0);
      
      // Should be at least minDistance away
      const distance = placer.calculateDistance(playerSpawn, result);
      expect(distance).toBeGreaterThanOrEqual(minDistance);
    });

    test('should only call reachability analysis once', () => {
      // Mock the physics analyzer to spy on calls
      const mockPhysicsAnalyzer = {
        detectReachablePositionsFromStartingPoint: jest.fn().mockReturnValue([
          { x: 10, y: 12 } // Valid position (should be floor, wall below, far enough)
        ])
      };
      
      // Create a simple grid
      const grid = global.testUtils.createMockGrid(15, 15);
      for (let y = 0; y < 13; y++) {
        for (let x = 0; x < 15; x++) {
          grid.set(x, y, 0); // Floor
        }
      }
      for (let y = 13; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
          grid.set(x, y, 1); // Wall
        }
      }
      // Ensure wall below the mock position
      grid.set(10, 13, 1);
      
      const playerSpawn = { x: 2, y: 12 };
      const minDistance = 3;
      
      // Temporarily replace the physics analyzer
      const originalAnalyzer = placer.physicsAnalyzer;
      placer.physicsAnalyzer = mockPhysicsAnalyzer;
      
      try {
        placer.placeGoalAfterPlatforms(grid, playerSpawn, minDistance, rng);
        
        // Should only call reachability analysis once
        expect(mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint).toHaveBeenCalledTimes(1);
        expect(mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint).toHaveBeenCalledWith(
          grid, playerSpawn, null
        );
      } finally {
        // Restore original analyzer
        placer.physicsAnalyzer = originalAnalyzer;
      }
    });

    test('should respect minimum distance constraint', () => {
      // Create a grid with platforms
      const grid = global.testUtils.createMockGrid(20, 20);
      
      // Create floor structure
      for (let y = 0; y < 18; y++) {
        for (let x = 0; x < 20; x++) {
          grid.set(x, y, 0); // Floor
        }
      }
      // Create wall base
      for (let y = 18; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
          grid.set(x, y, 1); // Wall
        }
      }
      
      const playerSpawn = { x: 5, y: 17 };
      const minDistance = 8;
      
      const result = placer.placeGoalAfterPlatforms(grid, playerSpawn, minDistance, rng);
      
      const distance = placer.calculateDistance(playerSpawn, result);
      expect(distance).toBeGreaterThanOrEqual(minDistance);
    });

    test('should be deterministic with seeded RNG', () => {
      // Create a grid with platforms
      const grid = global.testUtils.createMockGrid(20, 20);
      
      // Create floor structure
      for (let y = 0; y < 18; y++) {
        for (let x = 0; x < 20; x++) {
          grid.set(x, y, 0); // Floor
        }
      }
      // Create wall base
      for (let y = 18; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
          grid.set(x, y, 1); // Wall
        }
      }
      
      const playerSpawn = { x: 3, y: 17 };
      const minDistance = 5;
      const seed = 'deterministic-test';
      
      const rng1 = global.testUtils.createSeededRandom(seed);
      const rng2 = global.testUtils.createSeededRandom(seed);
      
      const result1 = placer.placeGoalAfterPlatforms(grid, playerSpawn, minDistance, rng1);
      const result2 = placer.placeGoalAfterPlatforms(grid, playerSpawn, minDistance, rng2);
      
      expect(result1).toEqual(result2);
    });

    test('should filter out positions inside colliding blocks', () => {
      // Create a grid with platforms marked as walls
      const grid = global.testUtils.createMockGrid(15, 15);
      
      // Create floor structure
      for (let y = 0; y < 13; y++) {
        for (let x = 0; x < 15; x++) {
          grid.set(x, y, 0); // Floor
        }
      }
      // Create wall base
      for (let y = 13; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
          grid.set(x, y, 1); // Wall
        }
      }
      
      // Add a platform (marked as wall)
      grid.set(7, 10, 1); // Platform tile
      grid.set(8, 10, 1); // Platform tile
      grid.set(9, 10, 1); // Platform tile
      
      // Add a valid non-platform goal tile
      grid.set(5, 12, 0); // Floor
      grid.set(5, 13, 1); // Wall below
      
      const playerSpawn = { x: 2, y: 12 };
      const minDistance = 3;
      
      const result = placer.placeGoalAfterPlatforms(grid, playerSpawn, minDistance, (function() {
        // Wrap the RNG to log validGoalPositions
        const originalRng = rng;
        return function() {
          // Print the valid goal positions for debugging
          const validGoalPositions = [];
          for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 15; x++) {
              if (grid.get(x, y) === 0 && grid.get(x, y + 1) === 1 && Math.sqrt(Math.pow(playerSpawn.x - x, 2) + Math.pow(playerSpawn.y - y, 2)) >= minDistance) {
                validGoalPositions.push({ x, y });
              }
            }
          }
          console.log('Valid goal positions:', validGoalPositions);
          return originalRng();
        };
      })());
      
      // Should not be placed on the platform (which is marked as wall)
      expect(grid.get(result.x, result.y)).toBe(0); // Should be floor, not wall
      
      // Should not be on the platform tiles (7,10), (8,10), (9,10)
      expect(!(result.x === 7 && result.y === 10)).toBe(true);
      expect(!(result.x === 8 && result.y === 10)).toBe(true);
      expect(!(result.x === 9 && result.y === 10)).toBe(true);
      // Should have a wall below
      expect(grid.get(result.x, result.y + 1)).toBe(1);
    });
  });
}); 