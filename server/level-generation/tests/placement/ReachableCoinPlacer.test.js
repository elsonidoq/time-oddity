/**
 * @fileoverview Tests for ReachableCoinPlacer
 * Tests strategic coin placement in reachable areas after platform placement
 */

const ReachableCoinPlacer = require('../../src/placement/ReachableCoinPlacer');
const PhysicsAwareReachabilityAnalyzer = require('../../src/analysis/PhysicsAwareReachabilityAnalyzer');
const testUtils = require('../setup');

describe('ReachableCoinPlacer', () => {
  let placer;
  let reachabilityAnalyzer;
  let mockRng;

  beforeEach(() => {
    reachabilityAnalyzer = new PhysicsAwareReachabilityAnalyzer();
    placer = new ReachableCoinPlacer({
      coinCount: 5,
      deadEndWeight: 0.4,
      explorationWeight: 0.3,
      unreachableWeight: 0.3,
      minDistance: 2
    });
    mockRng = testUtils.createSeededRandom('test-seed');
  });

  describe('constructor', () => {
    test('should create instance with default configuration', () => {
      const defaultPlacer = new ReachableCoinPlacer();
      expect(defaultPlacer.coinCount).toBe(10);
      expect(defaultPlacer.deadEndWeight).toBe(0.4);
      expect(defaultPlacer.explorationWeight).toBe(0.3);
      expect(defaultPlacer.unreachableWeight).toBe(0.3);
      expect(defaultPlacer.minDistance).toBe(2);
    });

    test('should create instance with custom configuration', () => {
      const customPlacer = new ReachableCoinPlacer({
        coinCount: 15,
        deadEndWeight: 0.5,
        explorationWeight: 0.3,
        unreachableWeight: 0.2,
        minDistance: 3
      });
      expect(customPlacer.coinCount).toBe(15);
      expect(customPlacer.deadEndWeight).toBe(0.5);
      expect(customPlacer.explorationWeight).toBe(0.3);
      expect(customPlacer.unreachableWeight).toBe(0.2);
      expect(customPlacer.minDistance).toBe(3);
    });

    test('should validate configuration parameters', () => {
      expect(() => {
        new ReachableCoinPlacer({ coinCount: -1 });
      }).toThrow('coinCount must be positive');

      expect(() => {
        new ReachableCoinPlacer({ deadEndWeight: 1.5 });
      }).toThrow('deadEndWeight must be between 0 and 1');

      expect(() => {
        new ReachableCoinPlacer({ minDistance: 0 });
      }).toThrow('minDistance must be positive');
    });

    test('should validate that weights sum to 1.0', () => {
      expect(() => {
        new ReachableCoinPlacer({
          deadEndWeight: 0.5,
          explorationWeight: 0.3,
          unreachableWeight: 0.1
        });
      }).toThrow('Weights must sum to 1.0');
    });
  });

  describe('placeCoins', () => {
    test('should place coins only in reachable areas', () => {
      // Create a simple grid with some reachable and unreachable areas
      const grid = testUtils.createMockGrid(10, 10);
      
      // Create a simple cave structure
      for (let x = 0; x < 10; x++) {
        grid.set(x, 9, 0); // Floor at bottom
      }
      grid.set(5, 8, 0); // One reachable platform
      grid.set(5, 7, 0); // Another reachable platform
      
      const playerPos = { x: 5, y: 9 };
      const platforms = [
        { x: 5, y: 8, width: 64, type: 'floating' },
        { x: 5, y: 7, width: 64, type: 'floating' }
      ];

      const coins = placer.placeCoins(grid, playerPos, platforms, mockRng);

      // All coins should be in reachable areas
      for (const coin of coins) {
        const isReachable = reachabilityAnalyzer.isReachableByJump(playerPos, coin, grid);
        expect(isReachable).toBe(true);
      }
    });

    test('should not place coins in colliding blocks', () => {
      const grid = testUtils.createMockGrid(10, 10);
      
      // Create floor areas
      for (let x = 0; x < 10; x++) {
        grid.set(x, 9, 0); // Floor at bottom
      }
      grid.set(5, 8, 0); // Reachable platform
      
      const playerPos = { x: 5, y: 9 };
      const platforms = [
        { x: 5, y: 8, width: 64, type: 'floating' }
      ];

      const coins = placer.placeCoins(grid, playerPos, platforms, mockRng);

      // No coin should be placed on a platform
      for (const coin of coins) {
        for (const platform of platforms) {
          const collision = placer.coinCollidesWithPlatform(coin, platform);
          expect(collision).toBe(false);
        }
      }
    });

    test('should place coins strategically in dead-ends', () => {
      const grid = testUtils.createMockGrid(10, 10);
      
      // Create a corridor with a dead-end
      for (let x = 0; x < 10; x++) {
        grid.set(x, 9, 0); // Floor at bottom
      }
      grid.set(9, 8, 0); // Dead-end corridor
      
      const playerPos = { x: 0, y: 9 };
      const platforms = [];

      const coins = placer.placeCoins(grid, playerPos, platforms, mockRng);

      // Should place at least one coin in the dead-end
      const deadEndCoin = coins.find(coin => coin.x === 9 && coin.y === 8);
      expect(deadEndCoin).toBeDefined();
    });

    test('should respect minimum distance between coins', () => {
      const grid = testUtils.createMockGrid(10, 10);
      
      // Create floor areas
      for (let x = 0; x < 10; x++) {
        grid.set(x, 9, 0); // Floor at bottom
      }
      
      const playerPos = { x: 5, y: 9 };
      const platforms = [];

      const coins = placer.placeCoins(grid, playerPos, platforms, mockRng);

      // Check minimum distance between all coin pairs
      for (let i = 0; i < coins.length; i++) {
        for (let j = i + 1; j < coins.length; j++) {
          const distance = Math.sqrt(
            Math.pow(coins[i].x - coins[j].x, 2) + 
            Math.pow(coins[i].y - coins[j].y, 2)
          );
          expect(distance).toBeGreaterThanOrEqual(placer.minDistance);
        }
      }
    });

    test('should handle empty reachable areas gracefully', () => {
      const grid = testUtils.createMockGrid(10, 10);
      
      // Only one reachable position
      grid.set(5, 9, 0);
      
      const playerPos = { x: 5, y: 9 };
      const platforms = [];

      const coins = placer.placeCoins(grid, playerPos, platforms, mockRng);

      // Should place at most one coin when only one position is available
      expect(coins.length).toBeLessThanOrEqual(1);
    });

    test('should distribute coins across different placement strategies', () => {
      const grid = testUtils.createMockGrid(15, 15);
      
      // Create a more complex cave structure
      for (let x = 0; x < 15; x++) {
        grid.set(x, 14, 0); // Floor at bottom
      }
      // Add some exploration areas
      grid.set(2, 13, 0);
      grid.set(12, 13, 0);
      grid.set(7, 12, 0);
      
      const playerPos = { x: 7, y: 14 };
      const platforms = [];

      const coins = placer.placeCoins(grid, playerPos, platforms, mockRng);

      // Should have coins from different strategies
      expect(coins.length).toBeGreaterThan(0);
      
      // Verify strategic placement by checking different areas
      const hasDeadEndCoins = coins.some(coin => coin.x === 2 || coin.x === 12);
      const hasExplorationCoins = coins.some(coin => coin.x === 7);
      
      expect(hasDeadEndCoins || hasExplorationCoins).toBe(true);
    });

    test('should work with existing platforms', () => {
      const grid = testUtils.createMockGrid(10, 10);
      
      // Create floor areas
      for (let x = 0; x < 10; x++) {
        grid.set(x, 9, 0); // Floor at bottom
      }
      grid.set(5, 8, 0); // Additional reachable area
      
      const playerPos = { x: 5, y: 9 };
      const platforms = [
        { x: 5, y: 8, width: 64, type: 'floating' }
      ];

      const coins = placer.placeCoins(grid, playerPos, platforms, mockRng);

      // Should place coins in reachable areas, avoiding platforms
      expect(coins.length).toBeGreaterThan(0);
      
      for (const coin of coins) {
        // Coin should not be on the platform
        expect(coin.x).not.toBe(5);
        expect(coin.y).not.toBe(8);
      }
    });
  });

  describe('detectDeadEnds', () => {
    test('should detect dead-end corridors', () => {
      const grid = testUtils.createMockGrid(5, 5);
      
      // Create a corridor with a dead-end
      grid.set(0, 4, 0); // Start of corridor
      grid.set(1, 4, 0); // Middle of corridor
      grid.set(2, 4, 0); // Dead-end
      
      const deadEnds = placer.detectDeadEnds(grid);
      
      expect(deadEnds).toContainEqual({ x: 2, y: 4 });
      expect(deadEnds).not.toContainEqual({ x: 0, y: 4 }); // Not a dead-end
      expect(deadEnds).not.toContainEqual({ x: 1, y: 4 }); // Not a dead-end
    });

    test('should not detect isolated floor tiles as dead-ends', () => {
      const grid = testUtils.createMockGrid(5, 5);
      
      // Create isolated floor tiles
      grid.set(2, 2, 0);
      grid.set(3, 3, 0);
      
      const deadEnds = placer.detectDeadEnds(grid);
      
      expect(deadEnds).not.toContainEqual({ x: 2, y: 2 });
      expect(deadEnds).not.toContainEqual({ x: 3, y: 3 });
    });
  });

  describe('analyzeExplorationAreas', () => {
    test('should analyze and score exploration areas', () => {
      const grid = testUtils.createMockGrid(10, 10);
      
      // Create floor areas at different distances from center
      grid.set(5, 9, 0); // Center area
      grid.set(1, 9, 0); // Far area
      grid.set(9, 9, 0); // Far area
      
      const analysis = placer.analyzeExplorationAreas(grid);
      
      expect(analysis.explorationAreas).toHaveLength(3);
      expect(analysis.scores).toBeDefined();
      
      // Far areas should have higher exploration scores
      const centerScore = analysis.scores['5,9'];
      const farScore1 = analysis.scores['1,9'];
      const farScore2 = analysis.scores['9,9'];
      
      expect(farScore1).toBeGreaterThan(centerScore);
      expect(farScore2).toBeGreaterThan(centerScore);
    });
  });

  describe('coinCollidesWithPlatform', () => {
    test('should detect coin-platform collisions', () => {
      const coin = { x: 5, y: 8 };
      const platform = { x: 5, y: 8, width: 64, type: 'floating' };
      
      const collision = placer.coinCollidesWithPlatform(coin, platform);
      expect(collision).toBe(true);
    });

    test('should not detect collision when coin is outside platform', () => {
      const coin = { x: 6, y: 8 };
      const platform = { x: 5, y: 8, width: 64, type: 'floating' };
      
      const collision = placer.coinCollidesWithPlatform(coin, platform);
      expect(collision).toBe(false);
    });

    test('should handle multi-tile platforms correctly', () => {
      const coin = { x: 6, y: 8 };
      const platform = { x: 5, y: 8, width: 128, type: 'floating' }; // 2 tiles
      
      const collision = placer.coinCollidesWithPlatform(coin, platform);
      expect(collision).toBe(true);
    });
  });

  describe('validateCoinPlacement', () => {
    test('should validate coin placement against all platforms', () => {
      const coin = { x: 5, y: 8 };
      const platforms = [
        { x: 5, y: 8, width: 64, type: 'floating' },
        { x: 10, y: 8, width: 64, type: 'floating' }
      ];
      
      const isValid = placer.validateCoinPlacement(coin, platforms);
      expect(isValid).toBe(false); // Should collide with first platform
    });

    test('should return true for valid coin placement', () => {
      const coin = { x: 7, y: 8 };
      const platforms = [
        { x: 5, y: 8, width: 64, type: 'floating' },
        { x: 10, y: 8, width: 64, type: 'floating' }
      ];
      
      const isValid = placer.validateCoinPlacement(coin, platforms);
      expect(isValid).toBe(true); // Should not collide with any platform
    });
  });

  describe('calculateDistributionMetrics', () => {
    test('should calculate distribution metrics', () => {
      const grid = testUtils.createMockGrid(10, 10);
      const playerPos = { x: 5, y: 9 };
      const coins = [
        { x: 1, y: 9 },
        { x: 3, y: 9 },
        { x: 7, y: 9 },
        { x: 9, y: 9 }
      ];
      
      const metrics = placer.calculateDistributionMetrics(coins, grid, playerPos);
      
      expect(metrics.totalCoins).toBe(4);
      expect(metrics.averageDistance).toBeGreaterThan(0);
      expect(metrics.coverage).toBeGreaterThan(0);
    });
  });
}); 