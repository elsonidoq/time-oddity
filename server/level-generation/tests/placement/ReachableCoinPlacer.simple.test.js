/**
 * @fileoverview Simple tests for ReachableCoinPlacer
 */

const ReachableCoinPlacer = require('../../src/placement/ReachableCoinPlacer');

// Use global.testUtils as provided by the test setup

describe('ReachableCoinPlacer - Simple Tests', () => {
  test('should create instance with default configuration', () => {
    const placer = new ReachableCoinPlacer();
    expect(placer.coinCount).toBe(10);
    expect(placer.deadEndWeight).toBe(0.4);
    expect(placer.explorationWeight).toBe(0.3);
    expect(placer.unreachableWeight).toBe(0.3);
    expect(placer.minDistance).toBe(2);
  });

  test('should validate configuration parameters', () => {
    expect(() => {
      new ReachableCoinPlacer({ coinCount: -1 });
    }).toThrow('coinCount must be positive');
  });

  test('should detect dead-end corridors', () => {
    const placer = new ReachableCoinPlacer();
    const grid = global.testUtils.createMockGrid(5, 5);
    // Initialize all to wall
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        grid.set(x, y, 1);
      }
    }
    // Carve out a corridor: (0,4) -> (1,4) -> (2,4)
    grid.set(0, 4, 0); // Start of corridor
    grid.set(1, 4, 0); // Middle of corridor
    grid.set(2, 4, 0); // Dead-end
    // Now (2,4) should be a dead-end
    const deadEnds = placer.detectDeadEnds(grid);
    expect(deadEnds).toContainEqual({ x: 2, y: 4 });
  });
}); 