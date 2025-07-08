# Test Examples: Level Generation Testing Patterns

## Overview

This document provides concrete examples of proper level generation tests for each pipeline step. These examples demonstrate how to test data processing algorithms without game engine dependencies, using only the scientific JS ecosystem and server-side test utilities.

## Core Testing Principles

### 1. Pure Data Processing Focus
All tests focus on mathematical algorithms and data transformations, not game engine integration.

### 2. Deterministic Behavior
Every test uses seeded random number generators for reproducible results.

### 3. Small, Focused Tests
Each test verifies a single, specific behavior or algorithm step.

### 4. Proper Test Isolation
Tests don't depend on external state or game engine objects.

## Pipeline Step Examples

### Step 1: Grid Seeding Tests

```javascript
/**
 * @fileoverview Tests for GridSeeder - Step 1 of level generation pipeline
 */

const GridSeeder = require('../../src/core/GridSeeder');

describe('GridSeeder', () => {
  describe('seedGrid', () => {
    test('should create grid with correct dimensions', () => {
      const config = { width: 10, height: 15, seed: 'test' };
      const rng = testUtils.createSeededRandom('test');
      
      const grid = GridSeeder.seedGrid(config, rng);
      
      expect(grid.shape).toEqual([10, 15]);
      expect(grid.dtype).toBe('uint8');
    });

    test('should respect initialWallRatio parameter', () => {
      const config = { 
        width: 20, 
        height: 20, 
        initialWallRatio: 0.6, 
        seed: 'ratio-test' 
      };
      const rng = testUtils.createSeededRandom('ratio-test');
      
      const grid = GridSeeder.seedGrid(config, rng);
      
      // Count walls and floors
      let walls = 0;
      let floors = 0;
      for (let x = 0; x < 20; x++) {
        for (let y = 0; y < 20; y++) {
          if (grid.get(x, y) === 1) walls++;
          else floors++;
        }
      }
      
      const actualRatio = walls / (walls + floors);
      expect(actualRatio).toBeCloseTo(0.6, 1);
    });

    test('should produce same result with same seed', () => {
      const config = { width: 10, height: 10, seed: 'deterministic' };
      const rng1 = testUtils.createSeededRandom('deterministic');
      const rng2 = testUtils.createSeededRandom('deterministic');
      
      const grid1 = GridSeeder.seedGrid(config, rng1);
      const grid2 = GridSeeder.seedGrid(config, rng2);
      
      // Compare grid contents
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          expect(grid1.get(x, y)).toBe(grid2.get(x, y));
        }
      }
    });

    test('should throw error for invalid dimensions', () => {
      const config = { width: -1, height: 10, seed: 'test' };
      const rng = testUtils.createSeededRandom('test');
      
      expect(() => {
        GridSeeder.seedGrid(config, rng);
      }).toThrow('Invalid grid dimensions');
    });
  });
});
```

### Step 2: Cellular Automata Tests

```javascript
/**
 * @fileoverview Tests for CellularAutomata - Step 2 of level generation pipeline
 */

const CellularAutomata = require('../../src/generation/CellularAutomata');

describe('CellularAutomata', () => {
  describe('simulate', () => {
    test('should apply birth rule correctly', () => {
      const grid = testUtils.createMockGrid(5, 5);
      // Create pattern where center tile should become wall
      grid.set(1, 1, 0); // Center floor
      grid.set(0, 1, 1); // Surrounding walls
      grid.set(2, 1, 1);
      grid.set(1, 0, 1);
      grid.set(1, 2, 1);
      grid.set(0, 0, 1);
      grid.set(2, 0, 1);
      grid.set(0, 2, 1);
      grid.set(2, 2, 1);
      
      const config = { 
        simulationSteps: 1, 
        birthThreshold: 5, 
        survivalThreshold: 4 
      };
      
      const result = CellularAutomata.simulate(grid, config);
      
      // Center tile should become wall (5+ wall neighbors)
      expect(result.get(1, 1)).toBe(1);
    });

    test('should apply survival rule correctly', () => {
      const grid = testUtils.createMockGrid(5, 5);
      // Create isolated wall that should become floor
      grid.set(2, 2, 1); // Isolated wall
      
      const config = { 
        simulationSteps: 1, 
        birthThreshold: 5, 
        survivalThreshold: 4 
      };
      
      const result = CellularAutomata.simulate(grid, config);
      
      // Isolated wall should become floor (fewer than 4 neighbors)
      expect(result.get(2, 2)).toBe(0);
    });

    test('should run multiple simulation steps', () => {
      const grid = testUtils.createMockGrid(10, 10);
      const config = { 
        simulationSteps: 3, 
        birthThreshold: 5, 
        survivalThreshold: 4 
      };
      
      const result = CellularAutomata.simulate(grid, config);
      
      // Grid should be different after multiple steps
      expect(result).not.toEqual(grid);
      
      // Should have some walls and some floors
      let walls = 0;
      let floors = 0;
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          if (result.get(x, y) === 1) walls++;
          else floors++;
        }
      }
      
      expect(walls).toBeGreaterThan(0);
      expect(floors).toBeGreaterThan(0);
    });

    test('should handle edge cases gracefully', () => {
      const grid = testUtils.createMockGrid(1, 1);
      grid.set(0, 0, 0);
      
      const config = { 
        simulationSteps: 1, 
        birthThreshold: 5, 
        survivalThreshold: 4 
      };
      
      const result = CellularAutomata.simulate(grid, config);
      
      // Should not crash on single-tile grid
      expect(result.shape).toEqual([1, 1]);
    });
  });
});
```

### Step 3: Region Detection Tests

```javascript
/**
 * @fileoverview Tests for RegionDetector - Step 3 of level generation pipeline
 */

const RegionDetector = require('../../src/analysis/RegionDetector');

describe('RegionDetector', () => {
  describe('findRegions', () => {
    test('should identify single connected region', () => {
      const grid = testUtils.createMockGrid(5, 5);
      // Create L-shaped region
      grid.set(1, 1, 0);
      grid.set(2, 1, 0);
      grid.set(3, 1, 0);
      grid.set(1, 2, 0);
      grid.set(1, 3, 0);
      
      const regions = RegionDetector.findRegions(grid);
      
      expect(regions.length).toBe(1);
      expect(regions[0].area).toBe(5);
      expect(regions[0].label).toBe(2); // First region gets label 2
    });

    test('should identify multiple disconnected regions', () => {
      const grid = testUtils.createMockGrid(6, 6);
      // Create two separate regions
      grid.set(1, 1, 0);
      grid.set(2, 1, 0);
      grid.set(4, 4, 0);
      grid.set(5, 4, 0);
      
      const regions = RegionDetector.findRegions(grid);
      
      expect(regions.length).toBe(2);
      expect(regions[0].area).toBe(2);
      expect(regions[1].area).toBe(2);
    });

    test('should handle empty grid', () => {
      const grid = testUtils.createMockGrid(5, 5);
      
      const regions = RegionDetector.findRegions(grid);
      
      expect(regions.length).toBe(0);
    });

    test('should calculate region bounds correctly', () => {
      const grid = testUtils.createMockGrid(5, 5);
      // Create region in corner
      grid.set(0, 0, 0);
      grid.set(1, 0, 0);
      grid.set(0, 1, 0);
      
      const regions = RegionDetector.findRegions(grid);
      
      expect(regions.length).toBe(1);
      expect(regions[0].bounds).toEqual({
        minX: 0, maxX: 1,
        minY: 0, maxY: 1
      });
    });
  });
});
```

### Step 4: Pathfinding Integration Tests

```javascript
/**
 * @fileoverview Tests for PathfindingIntegration - Step 4 of level generation pipeline
 */

const PathfindingIntegration = require('../../src/pathfinding/PathfindingIntegration');

describe('PathfindingIntegration', () => {
  describe('findPath', () => {
    test('should find path in simple corridor', () => {
      const matrix = [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0]
      ];
      const pfGrid = testUtils.createPathfindingGrid(matrix);
      
      const path = PathfindingIntegration.findPath(pfGrid, 0, 0, 3, 2);
      
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual([0, 0]);
      expect(path[path.length - 1]).toEqual([3, 2]);
    });

    test('should return empty path when no path exists', () => {
      const matrix = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0]
      ];
      const pfGrid = testUtils.createPathfindingGrid(matrix);
      
      const path = PathfindingIntegration.findPath(pfGrid, 0, 0, 2, 2);
      
      expect(path.length).toBe(0);
    });

    test('should handle diagonal movement correctly', () => {
      const matrix = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ];
      const pfGrid = testUtils.createPathfindingGrid(matrix);
      
      const path = PathfindingIntegration.findPath(pfGrid, 0, 0, 2, 2, true);
      
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual([0, 0]);
      expect(path[path.length - 1]).toEqual([2, 2]);
    });

    test('should handle edge cases', () => {
      const matrix = [[0]];
      const pfGrid = testUtils.createPathfindingGrid(matrix);
      
      const path = PathfindingIntegration.findPath(pfGrid, 0, 0, 0, 0);
      
      expect(path.length).toBe(1);
      expect(path[0]).toEqual([0, 0]);
    });
  });

  describe('isSolvable', () => {
    test('should return true for solvable level', () => {
      const matrix = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
      ];
      const pfGrid = testUtils.createPathfindingGrid(matrix);
      
      const isSolvable = PathfindingIntegration.isSolvable(pfGrid, 0, 0, 2, 2);
      
      expect(isSolvable).toBe(true);
    });

    test('should return false for unsolvable level', () => {
      const matrix = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0]
      ];
      const pfGrid = testUtils.createPathfindingGrid(matrix);
      
      const isSolvable = PathfindingIntegration.isSolvable(pfGrid, 0, 0, 2, 2);
      
      expect(isSolvable).toBe(false);
    });
  });
});
```

### Step 5: Entity Placement Tests

```javascript
/**
 * @fileoverview Tests for entity placement algorithms
 */

const CoinDistributor = require('../../src/placement/CoinDistributor');
const GoalPlacer = require('../../src/placement/GoalPlacer');

describe('Entity Placement', () => {
  describe('CoinDistributor', () => {
    test('should place coins in dead-end locations', () => {
      const grid = testUtils.createMockGrid(10, 10);
      // Create corridor with dead-end
      for (let x = 0; x < 8; x++) {
        grid.set(x, 5, 0); // Horizontal corridor
      }
      grid.set(7, 5, 0); // Dead-end
      
      const rng = testUtils.createSeededRandom('coin-test');
      const coins = CoinDistributor.distribute(grid, 3, rng);
      
      expect(coins.length).toBe(3);
      
      // Verify coins are placed on floor tiles
      coins.forEach(coin => {
        expect(grid.get(coin.x, coin.y)).toBe(0);
      });
    });

    test('should respect coin count parameter', () => {
      const grid = testUtils.createMockGrid(20, 20);
      // Create large open area
      for (let x = 5; x < 15; x++) {
        for (let y = 5; y < 15; y++) {
          grid.set(x, y, 0);
        }
      }
      
      const rng = testUtils.createSeededRandom('count-test');
      const coins = CoinDistributor.distribute(grid, 5, rng);
      
      expect(coins.length).toBe(5);
    });
  });

  describe('GoalPlacer', () => {
    test('should place goal at valid distance from start', () => {
      const grid = testUtils.createMockGrid(20, 20);
      // Create open area
      for (let x = 5; x < 15; x++) {
        for (let y = 5; y < 15; y++) {
          grid.set(x, y, 0);
        }
      }
      
      const startPos = { x: 6, y: 6 };
      const rng = testUtils.createSeededRandom('goal-test');
      const goalPos = GoalPlacer.placeGoal(grid, startPos, 8, rng);
      
      // Calculate distance
      const distance = Math.sqrt(
        Math.pow(goalPos.x - startPos.x, 2) + 
        Math.pow(goalPos.y - startPos.y, 2)
      );
      
      expect(distance).toBeGreaterThanOrEqual(8);
      expect(grid.get(goalPos.x, goalPos.y)).toBe(0); // On floor
    });

    test('should throw error when no valid goal position found', () => {
      const grid = testUtils.createMockGrid(5, 5);
      // Only one floor tile
      grid.set(0, 0, 0);
      
      const startPos = { x: 0, y: 0 };
      const rng = testUtils.createSeededRandom('goal-error-test');
      
      expect(() => {
        GoalPlacer.placeGoal(grid, startPos, 10, rng);
      }).toThrow('No valid goal position found');
    });
  });
});
```

### Step 6: Platform Placement Tests

```javascript
/**
 * @fileoverview Tests for platform placement algorithms
 */

const FloatingPlatformPlacer = require('../../src/placement/FloatingPlatformPlacer');
const PhysicsAwareReachabilityAnalyzer = require('../../src/analysis/PhysicsAwareReachabilityAnalyzer');

describe('Platform Placement', () => {
  describe('PhysicsAwareReachabilityAnalyzer', () => {
    test('should detect reachable positions from start', () => {
      const grid = testUtils.createMockGrid(10, 10);
      // Create simple level with ground and gap
      for (let x = 0; x < 10; x++) {
        grid.set(x, 8, 0); // Ground floor
      }
      grid.set(4, 7, 0); // Small platform
      
      const startPos = { x: 1, y: 7 };
      const reachable = PhysicsAwareReachabilityAnalyzer.detectReachablePositionsFromStartingPoint(
        grid, startPos, null
      );
      
      expect(reachable.length).toBeGreaterThan(0);
      expect(reachable).toContainEqual([1, 7]); // Start position
      expect(reachable).toContainEqual([4, 6]); // Platform above
    });

    test('should respect jump distance constraints', () => {
      const grid = testUtils.createMockGrid(10, 10);
      // Create gap too wide to jump
      for (let x = 0; x < 3; x++) {
        grid.set(x, 8, 0); // Left ground
      }
      for (let x = 7; x < 10; x++) {
        grid.set(x, 8, 0); // Right ground
      }
      
      const startPos = { x: 1, y: 7 };
      const reachable = PhysicsAwareReachabilityAnalyzer.detectReachablePositionsFromStartingPoint(
        grid, startPos, null
      );
      
      // Should not reach right side
      const rightSideReachable = reachable.some(pos => pos[0] >= 7);
      expect(rightSideReachable).toBe(false);
    });
  });

  describe('FloatingPlatformPlacer', () => {
    test('should place platforms to bridge unreachable areas', () => {
      const grid = testUtils.createMockGrid(15, 10);
      // Create level with unreachable coins
      for (let x = 0; x < 15; x++) {
        grid.set(x, 8, 0); // Ground floor
      }
      
      const coins = [
        { x: 5, y: 5 }, // Unreachable coin
        { x: 10, y: 5 }  // Another unreachable coin
      ];
      
      const startPos = { x: 1, y: 7 };
      const platforms = FloatingPlatformPlacer.placePlatforms(grid, coins, startPos);
      
      expect(platforms.length).toBeGreaterThan(0);
      
      // Verify platforms are placed to reach coins
      const reachableAfter = PhysicsAwareReachabilityAnalyzer.detectReachablePositionsFromStartingPoint(
        grid, startPos, null
      );
      
      coins.forEach(coin => {
        const coinReachable = reachableAfter.some(pos => 
          pos[0] === coin.x && pos[1] === coin.y
        );
        expect(coinReachable).toBe(true);
      });
    });
  });
});
```

### Step 7: Integration Testing Examples

```javascript
/**
 * @fileoverview Integration tests for complete level generation pipeline
 */

const LevelGenerator = require('../../src/index');

describe('Level Generation Pipeline Integration', () => {
  test('should generate complete level with all components', () => {
    const config = {
      width: 30,
      height: 20,
      seed: 'integration-test',
      initialWallRatio: 0.45,
      simulationSteps: 4,
      birthThreshold: 5,
      survivalThreshold: 4,
      minRoomSize: 15,
      minStartGoalDistance: 10,
      coinCount: 5,
      enemyCount: 2
    };
    
    const rng = testUtils.createSeededRandom('integration-test');
    const result = LevelGenerator.generate(config, rng);
    
    // Verify all required components
    expect(result.grid).toBeDefined();
    expect(result.startPos).toBeDefined();
    expect(result.goalPos).toBeDefined();
    expect(result.coins).toBeDefined();
    expect(result.enemies).toBeDefined();
    expect(result.platforms).toBeDefined();
    
    // Verify grid dimensions
    expect(result.grid.shape).toEqual([30, 20]);
    
    // Verify entity counts
    expect(result.coins.length).toBe(5);
    expect(result.enemies.length).toBe(2);
    
    // Verify start/goal are on floor tiles
    expect(result.grid.get(result.startPos.x, result.startPos.y)).toBe(0);
    expect(result.grid.get(result.goalPos.x, result.goalPos.y)).toBe(0);
    
    // Verify level is solvable
    expect(result.isSolvable).toBe(true);
  });

  test('should produce deterministic results with same seed', () => {
    const config = {
      width: 20,
      height: 15,
      seed: 'deterministic-test',
      initialWallRatio: 0.5,
      simulationSteps: 3,
      birthThreshold: 5,
      survivalThreshold: 4,
      minRoomSize: 10,
      minStartGoalDistance: 8,
      coinCount: 3,
      enemyCount: 1
    };
    
    const rng1 = testUtils.createSeededRandom('deterministic-test');
    const rng2 = testUtils.createSeededRandom('deterministic-test');
    
    const result1 = LevelGenerator.generate(config, rng1);
    const result2 = LevelGenerator.generate(config, rng2);
    
    // Verify identical results
    expect(result1.startPos).toEqual(result2.startPos);
    expect(result1.goalPos).toEqual(result2.goalPos);
    expect(result1.coins).toEqual(result2.coins);
    expect(result1.enemies).toEqual(result2.enemies);
    
    // Verify grid contents are identical
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 15; y++) {
        expect(result1.grid.get(x, y)).toBe(result2.grid.get(x, y));
      }
    }
  });

  test('should handle edge case configurations', () => {
    const config = {
      width: 5,
      height: 5,
      seed: 'edge-test',
      initialWallRatio: 0.3,
      simulationSteps: 1,
      birthThreshold: 3,
      survivalThreshold: 2,
      minRoomSize: 1,
      minStartGoalDistance: 2,
      coinCount: 1,
      enemyCount: 0
    };
    
    const rng = testUtils.createSeededRandom('edge-test');
    const result = LevelGenerator.generate(config, rng);
    
    // Should still produce valid level
    expect(result.grid.shape).toEqual([5, 5]);
    expect(result.startPos).toBeDefined();
    expect(result.goalPos).toBeDefined();
    expect(result.isSolvable).toBe(true);
  });
});
```

## Performance Testing Examples

```javascript
/**
 * @fileoverview Performance tests for level generation components
 */

describe('Performance Tests', () => {
  test('should generate large level within time limit', () => {
    const config = {
      width: 100,
      height: 60,
      seed: 'perf-test',
      initialWallRatio: 0.45,
      simulationSteps: 4,
      birthThreshold: 5,
      survivalThreshold: 4,
      minRoomSize: 20,
      minStartGoalDistance: 30,
      coinCount: 15,
      enemyCount: 5
    };
    
    const rng = testUtils.createSeededRandom('perf-test');
    const startTime = Date.now();
    
    const result = LevelGenerator.generate(config, rng);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within 500ms
    expect(duration).toBeLessThan(500);
    expect(result.isSolvable).toBe(true);
  });

  test('should not leak memory during repeated generation', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    for (let i = 0; i < 10; i++) {
      const config = {
        width: 50,
        height: 30,
        seed: `memory-test-${i}`,
        initialWallRatio: 0.45,
        simulationSteps: 3,
        birthThreshold: 5,
        survivalThreshold: 4,
        minRoomSize: 10,
        minStartGoalDistance: 15,
        coinCount: 5,
        enemyCount: 2
      };
      
      const rng = testUtils.createSeededRandom(`memory-test-${i}`);
      const result = LevelGenerator.generate(config, rng);
      
      // Verify result is valid
      expect(result.isSolvable).toBe(true);
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});
```

## Error Handling Examples

```javascript
/**
 * @fileoverview Error handling tests for level generation
 */

describe('Error Handling', () => {
  test('should throw error for invalid configuration', () => {
    const invalidConfig = {
      width: -1,
      height: 10,
      seed: 'test'
    };
    
    const rng = testUtils.createSeededRandom('test');
    
    expect(() => {
      LevelGenerator.generate(invalidConfig, rng);
    }).toThrow('Invalid configuration');
  });

  test('should handle unsolvable level gracefully', () => {
    const config = {
      width: 10,
      height: 10,
      seed: 'unsolvable-test',
      initialWallRatio: 0.8, // Very dense, might create unsolvable level
      simulationSteps: 2,
      birthThreshold: 5,
      survivalThreshold: 4,
      minRoomSize: 5,
      minStartGoalDistance: 8,
      coinCount: 3,
      enemyCount: 1
    };
    
    const rng = testUtils.createSeededRandom('unsolvable-test');
    
    // Should either generate solvable level or throw appropriate error
    try {
      const result = LevelGenerator.generate(config, rng);
      expect(result.isSolvable).toBe(true);
    } catch (error) {
      expect(error.message).toContain('Unable to generate solvable level');
    }
  });
});
```

## Best Practices Summary

### ✅ Proper Test Patterns

1. **Use server test utilities** - `testUtils.createMockGrid()`, `testUtils.createSeededRandom()`
2. **Test pure data processing** - Focus on algorithms, not game engine integration
3. **Create deterministic tests** - Use seeded RNG for reproducible results
4. **Test single behaviors** - Each test verifies one specific aspect
5. **Verify invariants** - Check that generated levels meet requirements
6. **Test edge cases** - Handle boundary conditions and error scenarios
7. **Measure performance** - Ensure algorithms meet time/space requirements

### ❌ Anti-Patterns to Avoid

1. **Import phaserMock** - Never use client-side mocks in server tests
2. **Test game engine state** - Level generation is stateless data processing
3. **Mix module systems** - Use CommonJS consistently in server tests
4. **Create non-deterministic tests** - Always use seeded RNG
5. **Test multiple behaviors** - Each test should verify one specific thing
6. **Depend on external state** - Tests should be completely isolated
7. **Ignore performance** - Critical algorithms must meet performance requirements

---

This document provides concrete examples of proper level generation testing patterns, ensuring reliable, maintainable, and efficient test suites that focus on data processing algorithms without game engine dependencies. 