/**
 * @fileoverview Tests for GraphGridSeeder class
 * Tests the graph-based grid seeding algorithm for cave generation
 */

const { GraphGridSeeder } = require('../../src/generation/GraphGridSeeder');
const RandomGenerator = require('../../src/core/RandomGenerator');
const GridUtilities = require('../../src/core/GridUtilities');

describe('GraphGridSeeder', () => {
  let seeder;
  let rng;

  beforeEach(() => {
    seeder = new GraphGridSeeder(3, 0.3, 0.7);
    rng = new RandomGenerator('test-seed');
  });

  describe('Constructor', () => {
    test('should create GraphGridSeeder instance with valid parameters', () => {
      const seeder = new GraphGridSeeder(2, 0.2, 0.8);
      expect(seeder).toBeInstanceOf(GraphGridSeeder);
      expect(seeder.corridorHeight).toBe(2);
      expect(seeder.corridorThreshold).toBe(0.2);
      expect(seeder.nonCorridorThreshold).toBe(0.8);
    });

    test('should use default parameters when not provided', () => {
      const seeder = new GraphGridSeeder();
      expect(seeder.corridorHeight).toBe(3);
      expect(seeder.corridorThreshold).toBe(0.3);
      expect(seeder.nonCorridorThreshold).toBe(0.7);
    });

    test('should validate corridor height parameter', () => {
      expect(() => new GraphGridSeeder(0, 0.3, 0.7)).toThrow('Invalid corridor height');
      expect(() => new GraphGridSeeder(-1, 0.3, 0.7)).toThrow('Invalid corridor height');
    });

    test('should validate threshold parameters', () => {
      expect(() => new GraphGridSeeder(3, -0.1, 0.7)).toThrow('Invalid corridor threshold');
      expect(() => new GraphGridSeeder(3, 1.1, 0.7)).toThrow('Invalid corridor threshold');
      expect(() => new GraphGridSeeder(3, 0.3, -0.1)).toThrow('Invalid non-corridor threshold');
      expect(() => new GraphGridSeeder(3, 0.3, 1.1)).toThrow('Invalid non-corridor threshold');
    });
  });

  describe('Config Validation', () => {
    test('should validate valid config', () => {
      const config = {
        width: 100,
        height: 60,
        initialWallRatio: 0.45
      };
      
      expect(() => seeder.validateConfig(config)).not.toThrow();
    });

    test('should reject invalid width', () => {
      const config = {
        width: 0,
        height: 60,
        initialWallRatio: 0.45
      };
      
      expect(() => seeder.validateConfig(config)).toThrow('Invalid width');
    });

    test('should reject invalid height', () => {
      const config = {
        width: 100,
        height: -1,
        initialWallRatio: 0.45
      };
      
      expect(() => seeder.validateConfig(config)).toThrow('Invalid height');
    });

    test('should reject invalid wall ratio', () => {
      const config = {
        width: 100,
        height: 60,
        initialWallRatio: 1.5
      };
      
      expect(() => seeder.validateConfig(config)).toThrow('Invalid initialWallRatio');
    });

    test('should reject missing required parameters', () => {
      const config = {
        width: 100,
        height: 60
        // missing initialWallRatio
      };
      
      expect(() => seeder.validateConfig(config)).toThrow('Missing required parameter');
    });
  });

  describe('Deterministic Seeding', () => {
    test('should produce identical grids with same seed', () => {
      const config = {
        width: 50,
        height: 30,
        initialWallRatio: 0.45
      };

      const rng1 = new RandomGenerator('deterministic-seed');
      const rng2 = new RandomGenerator('deterministic-seed');

      const grid1 = seeder.seedGrid(config, rng1);
      const grid2 = seeder.seedGrid(config, rng2);

      // Compare grid data
      expect(grid1.shape).toEqual(grid2.shape);
      expect(grid1.data).toEqual(grid2.data);
    });

    test('should produce different grids with different seeds', () => {
      const config = {
        width: 50,
        height: 30,
        initialWallRatio: 0.45
      };

      const rng1 = new RandomGenerator('seed-1');
      const rng2 = new RandomGenerator('seed-2');

      const grid1 = seeder.seedGrid(config, rng1);
      const grid2 = seeder.seedGrid(config, rng2);

      // Grids should be different
      expect(grid1.data).not.toEqual(grid2.data);
    });

    test('should maintain determinism across multiple calls', () => {
      const config = {
        width: 20,
        height: 20,
        initialWallRatio: 0.5
      };

      // Use a new RNG with the same seed for each call
      const grid1a = seeder.seedGrid(config, new RandomGenerator('repeat-seed'));
      const grid1b = seeder.seedGrid(config, new RandomGenerator('repeat-seed'));
      const grid2a = seeder.seedGrid(config, new RandomGenerator('repeat-seed'));

      expect(grid1a.data).toEqual(grid1b.data);
      expect(grid1a.data).toEqual(grid2a.data);
    });
  });

  describe('Graph-Based Algorithm Properties', () => {
    test('should create corridors between main points', () => {
      const config = {
        width: 30,
        height: 20,
        initialWallRatio: 0.45
      };

      const grid = seeder.seedGrid(config, rng);

      // Should have some wall tiles (corridors)
      const wallCount = GridUtilities.countValue(grid, 1);
      expect(wallCount).toBeGreaterThan(0);

      // Should have some floor tiles (non-corridors)
      const floorCount = GridUtilities.countValue(grid, 0);
      expect(floorCount).toBeGreaterThan(0);
    });

    test('should respect corridor height parameter', () => {
      const lowHeightSeeder = new GraphGridSeeder(1, 0.3, 0.7);
      const highHeightSeeder = new GraphGridSeeder(5, 0.3, 0.7);

      const config = {
        width: 40,
        height: 25,
        initialWallRatio: 0.45
      };

      const rng1 = new RandomGenerator('height-test-1');
      const rng2 = new RandomGenerator('height-test-2');

      const grid1 = lowHeightSeeder.seedGrid(config, rng1);
      const grid2 = highHeightSeeder.seedGrid(config, rng2);

      // Different corridor heights should produce different patterns
      expect(grid1.data).not.toEqual(grid2.data);
    });

    test('should respect threshold parameters', () => {
      const lowThresholdSeeder = new GraphGridSeeder(3, 0.1, 0.9);
      const highThresholdSeeder = new GraphGridSeeder(3, 0.5, 0.5);

      const config = {
        width: 35,
        height: 20,
        initialWallRatio: 0.45
      };

      const rng1 = new RandomGenerator('threshold-test-1');
      const rng2 = new RandomGenerator('threshold-test-2');

      const grid1 = lowThresholdSeeder.seedGrid(config, rng1);
      const grid2 = highThresholdSeeder.seedGrid(config, rng2);

      // Different thresholds should produce different wall ratios
      const ratio1 = lowThresholdSeeder.getWallRatio(grid1);
      const ratio2 = highThresholdSeeder.getWallRatio(grid2);

      expect(ratio1).not.toBe(ratio2);
    });
  });

  describe('Grid Properties', () => {
    test('should create grid with correct dimensions', () => {
      const config = {
        width: 75,
        height: 45,
        initialWallRatio: 0.45
      };

      const grid = seeder.seedGrid(config, rng);

      expect(grid.shape).toEqual([75, 45]);
      expect(grid.dtype).toBe('uint8');
      expect(grid.data).toBeInstanceOf(Uint8Array);
    });

    test('should only contain 0 and 1 values', () => {
      const config = {
        width: 50,
        height: 50,
        initialWallRatio: 0.45
      };

      const grid = seeder.seedGrid(config, rng);

      for (let y = 0; y < grid.shape[1]; y++) {
        for (let x = 0; x < grid.shape[0]; x++) {
          const value = grid.get(x, y);
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1);
          expect(Number.isInteger(value)).toBe(true);
        }
      }
    });

    test('should handle boundary tiles correctly', () => {
      const config = {
        width: 10,
        height: 10,
        initialWallRatio: 0.5
      };

      const grid = seeder.seedGrid(config, rng);

      // Check that boundary tiles are properly set
      for (let x = 0; x < grid.shape[0]; x++) {
        const topValue = grid.get(x, 0);
        const bottomValue = grid.get(x, grid.shape[1] - 1);
        expect(topValue).toBeGreaterThanOrEqual(0);
        expect(topValue).toBeLessThanOrEqual(1);
        expect(bottomValue).toBeGreaterThanOrEqual(0);
        expect(bottomValue).toBeLessThanOrEqual(1);
      }

      for (let y = 0; y < grid.shape[1]; y++) {
        const leftValue = grid.get(0, y);
        const rightValue = grid.get(grid.shape[0] - 1, y);
        expect(leftValue).toBeGreaterThanOrEqual(0);
        expect(leftValue).toBeLessThanOrEqual(1);
        expect(rightValue).toBeGreaterThanOrEqual(0);
        expect(rightValue).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Performance Validation', () => {
    test('should seed large grids efficiently', () => {
      const config = {
        width: 200,
        height: 150,
        initialWallRatio: 0.45
      };

      const startTime = Date.now();
      const grid = seeder.seedGrid(config, rng);
      const endTime = Date.now();

      expect(grid.shape).toEqual([200, 150]);
      expect(endTime - startTime).toBeLessThan(200); // Should be fast
    });

    test('should handle very large grids', () => {
      const config = {
        width: 500,
        height: 300,
        initialWallRatio: 0.45
      };

      const startTime = Date.now();
      const grid = seeder.seedGrid(config, rng);
      const endTime = Date.now();

      expect(grid.shape).toEqual([500, 300]);
      expect(grid.data.length).toBe(500 * 300);
      expect(endTime - startTime).toBeLessThan(1000); // Should still be reasonable
    });

    test('should not cause memory leaks with repeated seeding', () => {
      const config = {
        width: 100,
        height: 100,
        initialWallRatio: 0.45
      };

      const initialMemory = process.memoryUsage().heapUsed;

      // Create many grids
      for (let i = 0; i < 50; i++) {
        const rng = new RandomGenerator(`seed-${i}`);
        const grid = seeder.seedGrid(config, rng);
        // Grid goes out of scope here
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });
  });

  describe('Integration with Core Components', () => {
    test('should work with GridUtilities', () => {
      const config = {
        width: 50,
        height: 50,
        initialWallRatio: 0.45
      };

      const grid = seeder.seedGrid(config, rng);

      // Verify grid can be used with GridUtilities
      expect(GridUtilities.isValidCoordinate(0, 0, grid)).toBe(true);
      expect(GridUtilities.isValidCoordinate(49, 49, grid)).toBe(true);
      expect(GridUtilities.isValidCoordinate(50, 50, grid)).toBe(false);

      // Verify grid can be copied
      const copy = GridUtilities.copyGrid(grid);
      expect(copy.shape).toEqual(grid.shape);
      expect(copy.data).toEqual(grid.data);
    });

    test('should work with RandomGenerator consistently', () => {
      const config = {
        width: 30,
        height: 30,
        initialWallRatio: 0.45
      };

      // Create multiple grids with same RNG instance
      const grid1 = seeder.seedGrid(config, rng);
      const grid2 = seeder.seedGrid(config, rng);

      // Grids should be different because RNG state changes
      expect(grid1.data).not.toEqual(grid2.data);

      // But should be deterministic with new RNG instance
      const newRng = new RandomGenerator('test-seed');
      const grid3 = seeder.seedGrid(config, newRng);
      expect(grid1.data).toEqual(grid3.data);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for null config', () => {
      expect(() => seeder.seedGrid(null, rng)).toThrow('Config is required');
    });

    test('should throw error for null RNG', () => {
      const config = {
        width: 50,
        height: 50,
        initialWallRatio: 0.45
      };

      expect(() => seeder.seedGrid(config, null)).toThrow('RandomGenerator is required');
    });

    test('should throw error for invalid RNG type', () => {
      const config = {
        width: 50,
        height: 50,
        initialWallRatio: 0.45
      };

      expect(() => seeder.seedGrid(config, {})).toThrow('Invalid RandomGenerator');
    });
  });

  describe('Wall Ratio Calculation', () => {
    test('should calculate wall ratio correctly', () => {
      const grid = GridUtilities.createGrid(4, 4);
      
      // Set some walls manually
      grid.set(0, 0, 1);
      grid.set(1, 0, 1);
      grid.set(0, 1, 1);
      // 3 walls out of 16 tiles = 0.1875

      const ratio = seeder.getWallRatio(grid);
      expect(ratio).toBe(3 / 16);
    });

    test('should handle all walls', () => {
      const grid = GridUtilities.createGrid(3, 3);
      GridUtilities.fillGrid(grid, 1);

      const ratio = seeder.getWallRatio(grid);
      expect(ratio).toBe(1.0);
    });

    test('should handle no walls', () => {
      const grid = GridUtilities.createGrid(3, 3);
      GridUtilities.fillGrid(grid, 0);

      const ratio = seeder.getWallRatio(grid);
      expect(ratio).toBe(0.0);
    });
  });

  describe('Visual Output', () => {
    test('should generate ASCII art for seeded grid', () => {
      const config = {
        width: 8,
        height: 4,
        initialWallRatio: 0.5
      };
      const grid = seeder.seedGrid(config, new RandomGenerator('ascii-seed'));
      const ascii = seeder.toAsciiArt(grid);
      // Should be 4 lines of 8 characters
      const lines = ascii.split('\n');
      expect(lines.length).toBe(4);
      lines.forEach(line => {
        expect(line.length).toBe(8);
        expect(line).toMatch(/^[#.]+$/);
      });
      // Optionally print for manual inspection
      console.log('\n' + ascii);
    });
  });

  describe('Drop-in Replacement Compatibility', () => {
    test('should have same interface as GridSeeder', () => {
      const { GridSeeder } = require('../../src/generation/GridSeeder');
      const gridSeeder = new GridSeeder();
      
      // Check that GraphGridSeeder has all the same methods
      expect(typeof seeder.validateConfig).toBe('function');
      expect(typeof seeder.seedGrid).toBe('function');
      expect(typeof seeder.getWallRatio).toBe('function');
      expect(typeof seeder.toAsciiArt).toBe('function');
      
      // Check that GraphGridSeeder has the same method signatures
      expect(seeder.validateConfig.length).toBe(gridSeeder.validateConfig.length);
      expect(seeder.seedGrid.length).toBe(gridSeeder.seedGrid.length);
      expect(seeder.getWallRatio.length).toBe(gridSeeder.getWallRatio.length);
      expect(seeder.toAsciiArt.length).toBe(gridSeeder.toAsciiArt.length);
    });

    test('should accept same config format as GridSeeder', () => {
      const config = {
        width: 50,
        height: 30,
        initialWallRatio: 0.45
      };

      expect(() => seeder.seedGrid(config, rng)).not.toThrow();
      
      const grid = seeder.seedGrid(config, rng);
      expect(grid.shape).toEqual([50, 30]);
    });
  });
}); 