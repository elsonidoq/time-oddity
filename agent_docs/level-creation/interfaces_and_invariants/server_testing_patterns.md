# Server-Side Testing Patterns for Level Generation

## Overview

This document defines the proper testing patterns and utilities for server-side level generation tests. These patterns ensure deterministic, isolated, and efficient testing of data processing algorithms without any game engine dependencies.

## Core Test Utilities

### Available Utilities from `server/level-generation/tests/setup.js`

The test setup provides essential utilities for creating mock data structures and maintaining test isolation:

#### `testUtils.createMockGrid(width, height)`

Creates a mock ndarray grid for testing grid-based algorithms.

```javascript
const grid = testUtils.createMockGrid(10, 10);
// Returns: ndarray with shape [10, 10] filled with zeros
```

**Use Cases**:
- Testing cellular automata algorithms
- Testing grid manipulation functions
- Testing region detection algorithms
- Testing pathfinding integration

#### `testUtils.createSeededRandom(seed)`

Creates a deterministic random number generator for reproducible tests.

```javascript
const rng = testUtils.createSeededRandom('test-seed');
const value = rng(); // Deterministic value based on seed
```

**Use Cases**:
- Testing random placement algorithms
- Testing coin distribution
- Testing enemy placement
- Ensuring deterministic test results

#### `testUtils.createPathfindingGrid(matrix)`

Creates a pathfinding grid from a 2D matrix for A* testing.

```javascript
const matrix = [
  [0, 0, 1, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 0]
];
const pfGrid = testUtils.createPathfindingGrid(matrix);
```

**Use Cases**:
- Testing pathfinding algorithms
- Testing reachability analysis
- Testing solvability validation
- Testing platform placement logic

## Test Isolation Principles

### 1. Deterministic Behavior

All tests must be deterministic and reproducible:

```javascript
describe('CellularAutomata', () => {
  test('should produce same result with same seed', () => {
    const rng1 = testUtils.createSeededRandom('test-seed');
    const rng2 = testUtils.createSeededRandom('test-seed');
    
    const grid1 = testUtils.createMockGrid(5, 5);
    const grid2 = testUtils.createMockGrid(5, 5);
    
    // Apply same operations with same RNG
    const result1 = cellularAutomata(grid1, rng1);
    const result2 = cellularAutomata(grid2, rng2);
    
    expect(result1).toEqual(result2);
  });
});
```

### 2. Stateless Testing

Level generation tests should focus on pure data processing:

```javascript
describe('GridUtilities', () => {
  test('should calculate grid dimensions', () => {
    const grid = testUtils.createMockGrid(10, 15);
    const dimensions = GridUtilities.getDimensions(grid);
    
    expect(dimensions.width).toBe(10);
    expect(dimensions.height).toBe(15);
  });
});
```

### 3. Small, Focused Tests

Each test should verify a single, specific behavior:

```javascript
describe('RegionDetector', () => {
  test('should identify single region in simple grid', () => {
    const grid = testUtils.createMockGrid(3, 3);
    // Set up simple floor pattern
    grid.set(1, 1, 0); // Center floor tile
    
    const regions = RegionDetector.findRegions(grid);
    
    expect(regions.length).toBe(1);
    expect(regions[0].area).toBe(1);
  });
});
```

## Mock Data Creation Patterns

### Creating Test Grids

#### Simple Test Grids

```javascript
// Create empty grid
const emptyGrid = testUtils.createMockGrid(5, 5);

// Create grid with specific pattern
const grid = testUtils.createMockGrid(5, 5);
grid.set(1, 1, 1); // Wall at (1,1)
grid.set(2, 2, 1); // Wall at (2,2)
```

#### Complex Test Scenarios

```javascript
// Create corridor pattern
const corridorGrid = testUtils.createMockGrid(10, 5);
for (let x = 0; x < 10; x++) {
  corridorGrid.set(x, 2, 0); // Floor corridor
}

// Create room pattern
const roomGrid = testUtils.createMockGrid(8, 6);
for (let x = 1; x < 7; x++) {
  for (let y = 1; y < 5; y++) {
    roomGrid.set(x, y, 0); // Floor room
  }
}
```

### Creating Test Configurations

```javascript
const testConfig = {
  width: 10,
  height: 10,
  seed: 'test-seed',
  initialWallRatio: 0.45,
  simulationSteps: 4,
  birthThreshold: 5,
  survivalThreshold: 4,
  minRoomSize: 20,
  minStartGoalDistance: 5,
  coinCount: 5,
  enemyCount: 2
};
```

### Creating Test Entities

```javascript
const testEntities = {
  startPos: { x: 1, y: 1 },
  goalPos: { x: 8, y: 8 },
  coins: [
    { x: 2, y: 2 },
    { x: 3, y: 3 },
    { x: 4, y: 4 }
  ],
  enemies: [
    { x: 5, y: 5, type: 'patrol' },
    { x: 6, y: 6, type: 'stationary' }
  ]
};
```

## Testing Pipeline Steps

### Step 1: Grid Seeding

```javascript
describe('GridSeeder', () => {
  test('should create grid with correct dimensions', () => {
    const config = { width: 10, height: 15, seed: 'test' };
    const rng = testUtils.createSeededRandom('test');
    
    const grid = GridSeeder.seedGrid(config, rng);
    
    expect(grid.shape).toEqual([10, 15]);
  });
  
  test('should respect initialWallRatio', () => {
    const config = { width: 10, height: 10, initialWallRatio: 0.5, seed: 'test' };
    const rng = testUtils.createSeededRandom('test');
    
    const grid = GridSeeder.seedGrid(config, rng);
    
    // Count walls and floors
    let walls = 0;
    let floors = 0;
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        if (grid.get(x, y) === 1) walls++;
        else floors++;
      }
    }
    
    // Should be approximately 50% walls
    expect(walls / (walls + floors)).toBeCloseTo(0.5, 1);
  });
});
```

### Step 2: Cellular Automata

```javascript
describe('CellularAutomata', () => {
  test('should smooth grid after simulation steps', () => {
    const grid = testUtils.createMockGrid(5, 5);
    // Set up noisy pattern
    grid.set(1, 1, 1);
    grid.set(3, 3, 1);
    
    const config = { simulationSteps: 2, birthThreshold: 5, survivalThreshold: 4 };
    const result = CellularAutomata.simulate(grid, config);
    
    // Grid should be different after simulation
    expect(result).not.toEqual(grid);
  });
});
```

### Step 3: Region Detection

```javascript
describe('RegionDetector', () => {
  test('should identify connected regions', () => {
    const grid = testUtils.createMockGrid(5, 5);
    // Create two separate regions
    grid.set(1, 1, 0);
    grid.set(1, 2, 0);
    grid.set(3, 3, 0);
    grid.set(3, 4, 0);
    
    const regions = RegionDetector.findRegions(grid);
    
    expect(regions.length).toBe(2);
    expect(regions[0].area).toBe(2);
    expect(regions[1].area).toBe(2);
  });
});
```

### Step 4: Pathfinding Integration

```javascript
describe('PathfindingIntegration', () => {
  test('should find path between start and goal', () => {
    const matrix = [
      [0, 0, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ];
    const pfGrid = testUtils.createPathfindingGrid(matrix);
    
    const path = PathfindingIntegration.findPath(pfGrid, 0, 0, 3, 2);
    
    expect(path.length).toBeGreaterThan(0);
    expect(path[0]).toEqual([0, 0]);
    expect(path[path.length - 1]).toEqual([3, 2]);
  });
});
```

## Performance Testing Patterns

### Memory Usage Testing

```javascript
describe('MemoryUsage', () => {
  test('should not leak memory during grid operations', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    for (let i = 0; i < 100; i++) {
      const grid = testUtils.createMockGrid(100, 100);
      // Perform grid operations
      const processed = GridProcessor.process(grid);
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
```

### Execution Time Testing

```javascript
describe('Performance', () => {
  test('should complete grid generation within time limit', () => {
    const startTime = Date.now();
    
    const config = { width: 100, height: 60, seed: 'perf-test' };
    const rng = testUtils.createSeededRandom('perf-test');
    
    const result = LevelGenerator.generate(config, rng);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within 100ms
    expect(duration).toBeLessThan(100);
    expect(result).toBeDefined();
  });
});
```

## Error Handling Testing

### Invalid Input Testing

```javascript
describe('ErrorHandling', () => {
  test('should throw error for invalid grid dimensions', () => {
    expect(() => {
      testUtils.createMockGrid(-1, 5);
    }).toThrow('Invalid grid dimensions');
  });
  
  test('should throw error for invalid seed', () => {
    expect(() => {
      testUtils.createSeededRandom(null);
    }).toThrow('Seed must be provided');
  });
});
```

### Edge Case Testing

```javascript
describe('EdgeCases', () => {
  test('should handle empty grid', () => {
    const grid = testUtils.createMockGrid(0, 0);
    const regions = RegionDetector.findRegions(grid);
    
    expect(regions.length).toBe(0);
  });
  
  test('should handle single tile grid', () => {
    const grid = testUtils.createMockGrid(1, 1);
    grid.set(0, 0, 0); // Floor tile
    
    const regions = RegionDetector.findRegions(grid);
    
    expect(regions.length).toBe(1);
    expect(regions[0].area).toBe(1);
  });
});
```

## Integration Testing Patterns

### Full Pipeline Testing

```javascript
describe('LevelGenerationPipeline', () => {
  test('should generate complete level from config', () => {
    const config = {
      width: 20,
      height: 15,
      seed: 'integration-test',
      initialWallRatio: 0.45,
      simulationSteps: 3,
      birthThreshold: 5,
      survivalThreshold: 4,
      minRoomSize: 10,
      minStartGoalDistance: 8,
      coinCount: 3,
      enemyCount: 1
    };
    
    const rng = testUtils.createSeededRandom('integration-test');
    const result = LevelGenerator.generate(config, rng);
    
    // Verify all required components are present
    expect(result.grid).toBeDefined();
    expect(result.startPos).toBeDefined();
    expect(result.goalPos).toBeDefined();
    expect(result.coins).toBeDefined();
    expect(result.enemies).toBeDefined();
    
    // Verify level is solvable
    expect(result.isSolvable).toBe(true);
  });
});
```

## Best Practices Summary

### ✅ DO

1. **Use provided test utilities** from `setup.js`
2. **Create deterministic tests** with seeded RNG
3. **Test pure data processing** without game engine dependencies
4. **Use small, focused test cases** for specific behaviors
5. **Maintain test isolation** between different components
6. **Test error conditions** and edge cases
7. **Verify performance characteristics** for critical operations

### ❌ DON'T

1. **Import phaserMock** or any client-side mocks
2. **Use game engine state** in data processing tests
3. **Mix module systems** (ESM and CommonJS)
4. **Create non-deterministic tests** without proper seeding
5. **Test multiple behaviors** in a single test case
6. **Depend on external state** or file system
7. **Ignore performance implications** of algorithms

---

This document provides the definitive patterns for server-side level generation testing, ensuring reliable, maintainable, and efficient test suites. 