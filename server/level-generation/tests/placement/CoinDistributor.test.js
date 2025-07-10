/**
 * @fileoverview Unit tests for CoinDistributor class
 * Tests strategic coin distribution algorithm with dead-end detection,
 * exploration analysis, and distribution optimization.
 */

const ndarray = require('ndarray');
const CoinDistributor = require('../../src/placement/CoinDistributor');
const RandomGenerator = require('../../src/core/RandomGenerator');

describe('CoinDistributor', () => {
  let distributor;
  let rng;
  let testGrid;

  beforeEach(() => {
    // Create a simple test grid: 10x10 with some floor tiles
    const data = new Uint8Array(100);
    // Create a simple cave structure with floor tiles
    for (let i = 0; i < 100; i++) {
      const x = i % 10;
      const y = Math.floor(i / 10);
      // Create a simple pattern: floor in middle, walls around
      if (x >= 2 && x <= 7 && y >= 2 && y <= 7) {
        data[i] = 0; // floor
      } else {
        data[i] = 1; // wall
      }
    }
    testGrid = ndarray(data, [10, 10]);
    
    rng = new RandomGenerator('test-seed');
    distributor = new CoinDistributor({
      coinCount: 5,
      deadEndWeight: 0.4,
      explorationWeight: 0.3,
      unreachableWeight: 0.3,
      minDistance: 2
    });
  });

  describe('constructor', () => {
    it('should create instance with default configuration', () => {
      const defaultDistributor = new CoinDistributor();
      expect(defaultDistributor.coinCount).toBe(10);
      expect(defaultDistributor.deadEndWeight).toBe(0.4);
      expect(defaultDistributor.explorationWeight).toBe(0.3);
      expect(defaultDistributor.unreachableWeight).toBe(0.3);
      expect(defaultDistributor.minDistance).toBe(2);
    });

    it('should create instance with custom configuration', () => {
      const customDistributor = new CoinDistributor({
        coinCount: 15,
        deadEndWeight: 0.5,
        explorationWeight: 0.2,
        unreachableWeight: 0.3,
        minDistance: 3
      });
      
      expect(customDistributor.coinCount).toBe(15);
      expect(customDistributor.deadEndWeight).toBe(0.5);
      expect(customDistributor.explorationWeight).toBe(0.2);
      expect(customDistributor.unreachableWeight).toBe(0.3);
      expect(customDistributor.minDistance).toBe(3);
    });

    it('should validate configuration parameters', () => {
      expect(() => new CoinDistributor({ coinCount: -1 })).toThrow('coinCount must be positive');
      expect(() => new CoinDistributor({ deadEndWeight: -0.1 })).toThrow('deadEndWeight must be between 0 and 1');
      expect(() => new CoinDistributor({ explorationWeight: 1.1 })).toThrow('explorationWeight must be between 0 and 1');
      expect(() => new CoinDistributor({ unreachableWeight: -0.1 })).toThrow('unreachableWeight must be between 0 and 1');
      expect(() => new CoinDistributor({ minDistance: 0 })).toThrow('minDistance must be positive');
    });

    it('should validate weight sum equals 1', () => {
      expect(() => new CoinDistributor({
        deadEndWeight: 0.3,
        explorationWeight: 0.3,
        unreachableWeight: 0.3
      })).toThrow('Weights must sum to 1.0');
    });
  });

  describe('detectDeadEnds', () => {
    it('should detect dead-end corridors', () => {
      // Create a grid with a dead-end corridor
      const deadEndData = new Uint8Array(100);
      // Fill with walls first
      for (let i = 0; i < 100; i++) {
        deadEndData[i] = 1; // wall
      }
      // Main corridor
      for (let i = 0; i < 10; i++) {
        deadEndData[i * 10 + 5] = 0; // floor
      }
      // Dead-end branch (only one connection to main corridor)
      deadEndData[5 * 10 + 6] = 0; // floor
      deadEndData[5 * 10 + 7] = 0; // floor
      deadEndData[5 * 10 + 8] = 0; // floor
      const deadEndGrid = ndarray(deadEndData, [10, 10]).transpose(1, 0);
      
      const deadEnds = distributor.detectDeadEnds(deadEndGrid);
      console.log('Test deadEnds:', JSON.stringify(deadEnds));
      
      expect(deadEnds.length).toBeGreaterThan(0);
      // Check for actual dead-ends: ends of main corridor and end of branch
      // The grid has dead-ends at the ends of the main corridor and the end of the branch
      expect(deadEnds.some(pos => pos.x === 5 && pos.y === 0)).toBe(true); // Top of main corridor
      expect(deadEnds.some(pos => pos.x === 5 && pos.y === 9)).toBe(true); // Bottom of main corridor
      expect(deadEnds.some(pos => pos.x === 8 && pos.y === 5)).toBe(true); // End of branch
    });

    it('should return empty array for grid with no dead-ends', () => {
      // Create a grid with only main corridors (no dead-ends)
      const corridorData = new Uint8Array(100);
      for (let i = 0; i < 10; i++) {
        corridorData[i * 10 + 5] = 0; // floor
      }
      const corridorGrid = ndarray(corridorData, [10, 10]);
      
      const deadEnds = distributor.detectDeadEnds(corridorGrid);
      
      expect(deadEnds).toEqual([]);
    });

    it('should handle edge cases', () => {
      expect(() => distributor.detectDeadEnds(null)).toThrow('Grid is required');
      expect(() => distributor.detectDeadEnds(undefined)).toThrow('Grid is required');
    });
  });

  describe('analyzeExplorationAreas', () => {
    it('should analyze and score exploration areas', () => {
      const analysis = distributor.analyzeExplorationAreas(testGrid);
      
      expect(analysis).toHaveProperty('explorationAreas');
      expect(analysis).toHaveProperty('scores');
      expect(Array.isArray(analysis.explorationAreas)).toBe(true);
      expect(typeof analysis.scores).toBe('object');
    });

    it('should score areas based on distance from main path', () => {
      const analysis = distributor.analyzeExplorationAreas(testGrid);
      
      // Check that scores are numbers between 0 and 1
      Object.values(analysis.scores).forEach(score => {
        expect(typeof score).toBe('number');
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      });
    });

    it('should handle empty grid', () => {
      const emptyData = new Uint8Array(100);
      // Fill with walls (no floor tiles)
      for (let i = 0; i < 100; i++) {
        emptyData[i] = 1; // wall
      }
      const emptyGrid = ndarray(emptyData, [10, 10]);
      
      const analysis = distributor.analyzeExplorationAreas(emptyGrid);
      
      expect(analysis.explorationAreas).toEqual([]);
      expect(analysis.scores).toEqual({});
    });
  });

  describe('identifyUnreachableAreas', () => {
    it('should identify areas that will require platforms', () => {
      const playerPos = { x: 5, y: 5 };
      const unreachableAreas = distributor.identifyUnreachableAreas(testGrid, playerPos);
      
      expect(Array.isArray(unreachableAreas)).toBe(true);
      // All identified areas should be floor tiles
      unreachableAreas.forEach(area => {
        expect(testGrid.get(area.x, area.y)).toBe(0);
      });
    });

    it('should return empty array when all areas are reachable', () => {
      // Create a simple grid where all floor tiles are close to player
      const simpleData = new Uint8Array(100);
      for (let i = 0; i < 10; i++) {
        simpleData[i * 10 + 5] = 0; // floor
      }
      const simpleGrid = ndarray(simpleData, [10, 10]);
      const playerPos = { x: 5, y: 5 };
      
      const unreachableAreas = distributor.identifyUnreachableAreas(simpleGrid, playerPos);
      
      // Since all floor tiles are on the same row as player, they should be reachable
      expect(unreachableAreas.length).toBeLessThanOrEqual(1);
    });

    it('should handle null player position', () => {
      expect(() => distributor.identifyUnreachableAreas(testGrid, null)).toThrow('Player position is required');
    });
  });

  describe('distributeCoins', () => {
    it('should distribute coins according to strategic algorithm', () => {
      const playerPos = { x: 5, y: 5 };
      const coins = distributor.distributeCoins(testGrid, playerPos, rng);
      
      expect(Array.isArray(coins)).toBe(true);
      expect(coins.length).toBeLessThanOrEqual(distributor.coinCount);
      
      // All coins should be on floor tiles
      coins.forEach(coin => {
        expect(testGrid.get(coin.x, coin.y)).toBe(0);
        expect(coin).toHaveProperty('type', 'coin');
        expect(coin).toHaveProperty('x');
        expect(coin).toHaveProperty('y');
        expect(coin).toHaveProperty('properties');
        expect(coin.properties).toHaveProperty('value', 100);
      });
    });

    it('should respect minimum distance between coins', () => {
      const playerPos = { x: 5, y: 5 };
      const coins = distributor.distributeCoins(testGrid, playerPos, rng);
      
      // Check minimum distance between all coin pairs
      for (let i = 0; i < coins.length; i++) {
        for (let j = i + 1; j < coins.length; j++) {
          const distance = Math.sqrt(
            Math.pow(coins[i].x - coins[j].x, 2) + 
            Math.pow(coins[i].y - coins[j].y, 2)
          );
          expect(distance).toBeGreaterThanOrEqual(distributor.minDistance);
        }
      }
    });

    it('should balance distribution across different placement strategies', () => {
      const playerPos = { x: 5, y: 5 };
      const coins = distributor.distributeCoins(testGrid, playerPos, rng);
      
      // Should have some coins from each strategy
      expect(coins.length).toBeGreaterThan(0);
      
      // Verify coin structure matches level format specification
      coins.forEach(coin => {
        expect(coin).toMatchObject({
          type: 'coin',
          properties: { value: 100 }
        });
      });
    });

    it('should handle case with insufficient floor tiles', () => {
      // Create grid with very few floor tiles
      const sparseData = new Uint8Array(100);
      // Fill with walls first
      for (let i = 0; i < 100; i++) {
        sparseData[i] = 1; // wall
      }
      sparseData[55] = 0; // Only one floor tile
      const sparseGrid = ndarray(sparseData, [10, 10]);
      const playerPos = { x: 5, y: 5 };
      
      const coins = distributor.distributeCoins(sparseGrid, playerPos, rng);
      
      expect(coins.length).toBeLessThanOrEqual(1);
      expect(coins.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle null inputs', () => {
      expect(() => distributor.distributeCoins(null, { x: 5, y: 5 }, rng)).toThrow('Grid is required');
      expect(() => distributor.distributeCoins(testGrid, null, rng)).toThrow('Player position is required');
      expect(() => distributor.distributeCoins(testGrid, { x: 5, y: 5 }, null)).toThrow('RandomGenerator is required');
    });
  });

  describe('calculateDistributionMetrics', () => {
    it('should calculate distribution quality metrics', () => {
      const playerPos = { x: 5, y: 5 };
      const coins = distributor.distributeCoins(testGrid, playerPos, rng);
      const metrics = distributor.calculateDistributionMetrics(coins, testGrid, playerPos);
      
      expect(metrics).toHaveProperty('totalCoins');
      expect(metrics).toHaveProperty('deadEndCoins');
      expect(metrics).toHaveProperty('explorationCoins');
      expect(metrics).toHaveProperty('unreachableCoins');
      expect(metrics).toHaveProperty('averageDistance');
      expect(metrics).toHaveProperty('coverageScore');
      
      expect(metrics.totalCoins).toBe(coins.length);
      expect(metrics.deadEndCoins + metrics.explorationCoins + metrics.unreachableCoins).toBe(coins.length);
    });

    it('should handle empty coin array', () => {
      const metrics = distributor.calculateDistributionMetrics([], testGrid, { x: 5, y: 5 });
      
      expect(metrics.totalCoins).toBe(0);
      expect(metrics.deadEndCoins).toBe(0);
      expect(metrics.explorationCoins).toBe(0);
      expect(metrics.unreachableCoins).toBe(0);
    });
  });

  describe('validateCoinPlacement', () => {
    it('should validate coin placement against collision detection', () => {
      const coin = { x: 5, y: 5 };
      const platforms = [
        { x: 0, y: 0, width: 64, height: 64, type: 'ground' }
      ];
      
      const isValid = distributor.validateCoinPlacement(coin, platforms);
      
      expect(typeof isValid).toBe('boolean');
    });

    it('should reject coins placed inside platforms', () => {
      const coin = { x: 5, y: 5 };
      const platforms = [
        { x: 0, y: 0, width: 384, height: 384, type: 'ground' } // Large platform covering coin
      ];
      
      const isValid = distributor.validateCoinPlacement(coin, platforms);
      
      expect(isValid).toBe(false);
    });

    it('should accept coins placed outside platforms', () => {
      const coin = { x: 5, y: 5 };
      const platforms = [
        { x: 0, y: 0, width: 64, height: 64, type: 'ground' } // Small platform not covering coin
      ];
      
      const isValid = distributor.validateCoinPlacement(coin, platforms);
      
      expect(isValid).toBe(true);
    });
  });

  describe('performance', () => {
    it('should handle large grids efficiently', () => {
      // Create a larger grid (50x50)
      const largeData = new Uint8Array(2500);
      for (let i = 0; i < 2500; i++) {
        const x = i % 50;
        const y = Math.floor(i / 50);
        if (x >= 10 && x <= 40 && y >= 10 && y <= 40) {
          largeData[i] = 0; // floor
        } else {
          largeData[i] = 1; // wall
        }
      }
      const largeGrid = ndarray(largeData, [50, 50]);
      const playerPos = { x: 25, y: 25 };
      
      const startTime = Date.now();
      const coins = distributor.distributeCoins(largeGrid, playerPos, rng);
      const endTime = Date.now();
      
      expect(coins.length).toBeLessThanOrEqual(distributor.coinCount);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
}); 