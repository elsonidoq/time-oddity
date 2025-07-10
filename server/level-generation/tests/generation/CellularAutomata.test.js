/**
 * @fileoverview Tests for CellularAutomata class
 * Tests the cellular automata simulation engine for cave generation
 * 
 * @module CellularAutomata.test
 */

const { CellularAutomata } = require('../../src/generation/CellularAutomata');
const GridUtilities = require('../../src/core/GridUtilities');

// Mock RandomGenerator for deterministic testing
class MockRandomGenerator {
  constructor() {
    this.calls = 0;
  }
  
  random() {
    this.calls++;
    return 0.5; // Deterministic value for testing
  }
}

describe('CellularAutomata', () => {
  let ca;
  let mockRng;

  beforeEach(() => {
    ca = new CellularAutomata();
    mockRng = new MockRandomGenerator();
  });

  describe('constructor', () => {
    it('should create a new CellularAutomata instance', () => {
      expect(ca).toBeInstanceOf(CellularAutomata);
    });
  });

  describe('validateConfig', () => {
    it('should accept valid configuration', () => {
      const config = {
        simulationSteps: 4,
        birthThreshold: 5,
        survivalThreshold: 4
      };
      
      expect(() => ca.validateConfig(config)).not.toThrow();
    });

    it('should reject missing config', () => {
      expect(() => ca.validateConfig(null)).toThrow('Config is required');
      expect(() => ca.validateConfig(undefined)).toThrow('Config is required');
    });

    it('should reject missing simulationSteps', () => {
      const config = {
        birthThreshold: 5,
        survivalThreshold: 4
      };
      
      expect(() => ca.validateConfig(config)).toThrow('Missing required parameter: simulationSteps is required');
    });

    it('should reject missing birthThreshold', () => {
      const config = {
        simulationSteps: 4,
        survivalThreshold: 4
      };
      
      expect(() => ca.validateConfig(config)).toThrow('Missing required parameter: birthThreshold is required');
    });

    it('should reject missing survivalThreshold', () => {
      const config = {
        simulationSteps: 4,
        birthThreshold: 5
      };
      
      expect(() => ca.validateConfig(config)).toThrow('Missing required parameter: survivalThreshold is required');
    });

    it('should reject invalid simulationSteps', () => {
      const config = {
        simulationSteps: -1,
        birthThreshold: 5,
        survivalThreshold: 4
      };
      
      expect(() => ca.validateConfig(config)).toThrow('Invalid simulationSteps: must be a positive number');
    });

    it('should reject invalid birthThreshold', () => {
      const config = {
        simulationSteps: 4,
        birthThreshold: 10,
        survivalThreshold: 4
      };
      
      expect(() => ca.validateConfig(config)).toThrow('Invalid birthThreshold: must be between 0 and 8');
    });

    it('should reject invalid survivalThreshold', () => {
      const config = {
        simulationSteps: 4,
        birthThreshold: 5,
        survivalThreshold: -1
      };
      
      expect(() => ca.validateConfig(config)).toThrow('Invalid survivalThreshold: must be between 0 and 8');
    });
  });

  describe('countNeighbors', () => {
    it('should count 8 neighbors correctly for center cell', () => {
      // Create a 3x3 grid with walls around center
      const grid = GridUtilities.createGrid(3, 3, 0);
      grid.set(0, 0, 1); grid.set(1, 0, 1); grid.set(2, 0, 1);
      grid.set(0, 1, 1); grid.set(1, 1, 0); grid.set(2, 1, 1);
      grid.set(0, 2, 1); grid.set(1, 2, 1); grid.set(2, 2, 1);
      
      const count = ca.countNeighbors(grid, 1, 1);
      expect(count).toBe(8);
    });

    it('should count neighbors correctly for edge cell', () => {
      // Create a 3x3 grid with walls in top-left corner
      const grid = GridUtilities.createGrid(3, 3, 0);
      grid.set(0, 0, 1); grid.set(1, 0, 1); grid.set(2, 0, 0);
      grid.set(0, 1, 1); grid.set(1, 1, 0); grid.set(2, 1, 0);
      grid.set(0, 2, 0); grid.set(1, 2, 0); grid.set(2, 2, 0);
      
      const count = ca.countNeighbors(grid, 0, 0);
      expect(count).toBe(2); // Fixed expectation
    });

    it('should handle boundary conditions correctly', () => {
      const grid = GridUtilities.createGrid(2, 2, 0);
      grid.set(0, 0, 1); grid.set(1, 0, 0);
      grid.set(0, 1, 0); grid.set(1, 1, 0);
      
      const count = ca.countNeighbors(grid, 0, 0);
      expect(count).toBe(0); // Fixed expectation
    });

    it('should return 0 for isolated cell', () => {
      const grid = GridUtilities.createGrid(3, 3, 0);
      grid.set(1, 1, 1); // Single wall in center
      
      const count = ca.countNeighbors(grid, 1, 1);
      expect(count).toBe(0);
    });
  });

  describe('applyRules', () => {
    it('should apply birth rule correctly', () => {
      // Create a grid where center floor cell has 6 wall neighbors
      const grid = GridUtilities.createGrid(3, 3, 0);
      grid.set(0, 0, 1); grid.set(1, 0, 1); grid.set(2, 0, 1);
      grid.set(0, 1, 1); grid.set(1, 1, 0); grid.set(2, 1, 1);
      grid.set(0, 2, 0); grid.set(1, 2, 0); grid.set(2, 2, 0);
      
      const result = ca.applyRules(grid, 1, 1, 5, 4);
      expect(result).toBe(1); // Should become wall (6 > 5)
    });

    it('should apply survival rule correctly', () => {
      // Create a grid where center wall cell has 2 wall neighbors
      const grid = GridUtilities.createGrid(3, 3, 0);
      grid.set(0, 0, 0); grid.set(1, 0, 0); grid.set(2, 0, 0);
      grid.set(0, 1, 0); grid.set(1, 1, 1); grid.set(2, 1, 1);
      grid.set(0, 2, 0); grid.set(1, 2, 1); grid.set(2, 2, 0);
      
      const result = ca.applyRules(grid, 1, 1, 5, 4);
      expect(result).toBe(0); // Should become floor (2 < 4)
    });

    it('should preserve floor cells with few neighbors', () => {
      const grid = GridUtilities.createGrid(3, 3, 0);
      grid.set(1, 1, 0); // Floor cell with few neighbors
      
      const result = ca.applyRules(grid, 1, 1, 5, 4);
      expect(result).toBe(0); // Should remain floor
    });

    it('should preserve wall cells with many neighbors', () => {
      // Create a grid where center wall cell has 7 wall neighbors
      const grid = GridUtilities.createGrid(3, 3, 1);
      grid.set(1, 1, 1); // Wall cell with many neighbors
      
      const result = ca.applyRules(grid, 1, 1, 5, 4);
      expect(result).toBe(1); // Should remain wall
    });
  });

  describe('simulate', () => {
    it('should perform single iteration correctly', () => {
      const config = {
        simulationSteps: 1,
        birthThreshold: 5,
        survivalThreshold: 4
      };
      
      // Create a simple test grid
      const grid = GridUtilities.createGrid(3, 3, 0);
      grid.set(0, 0, 1); grid.set(1, 0, 1); grid.set(2, 0, 1);
      grid.set(0, 1, 1); grid.set(1, 1, 0); grid.set(2, 1, 1);
      grid.set(0, 2, 1); grid.set(1, 2, 1); grid.set(2, 2, 1);
      
      const result = ca.simulate(grid, config);
      
      expect(result).toBeDefined();
      expect(result.shape).toEqual([3, 3]);
      // Center cell should become wall due to birth rule
      expect(result.get(1, 1)).toBe(1);
    });

    it('should perform multiple iterations', () => {
      const config = {
        simulationSteps: 3,
        birthThreshold: 5,
        survivalThreshold: 4
      };
      
      const grid = GridUtilities.createGrid(5, 5, 0);
      // Create a pattern that will change over iterations
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          if ((x + y) % 2 === 0) {
            grid.set(x, y, 1);
          }
        }
      }
      
      const result = ca.simulate(grid, config);
      
      expect(result).toBeDefined();
      expect(result.shape).toEqual([5, 5]);
    });

    it('should call progress callback for each iteration', () => {
      const config = {
        simulationSteps: 3,
        birthThreshold: 5,
        survivalThreshold: 4
      };
      
      const progressCalls = [];
      const progressCallback = (iteration, total) => {
        progressCalls.push({ iteration, total });
      };
      
      const grid = GridUtilities.createGrid(3, 3, 0);
      ca.simulate(grid, config, progressCallback);
      
      expect(progressCalls).toHaveLength(3);
      expect(progressCalls[0]).toEqual({ iteration: 1, total: 3 });
      expect(progressCalls[1]).toEqual({ iteration: 2, total: 3 });
      expect(progressCalls[2]).toEqual({ iteration: 3, total: 3 });
    });

    it('should handle zero iterations', () => {
      const config = {
        simulationSteps: 0,
        birthThreshold: 5,
        survivalThreshold: 4
      };
      
      const grid = GridUtilities.createGrid(3, 3, 0);
      const result = ca.simulate(grid, config);
      
      expect(result).toBeDefined();
      expect(result.shape).toEqual([3, 3]);
    });

    it('should preserve grid dimensions', () => {
      const config = {
        simulationSteps: 2,
        birthThreshold: 5,
        survivalThreshold: 4
      };
      
      const originalGrid = GridUtilities.createGrid(10, 15, 0);
      const result = ca.simulate(originalGrid, config);
      
      expect(result.shape).toEqual([10, 15]);
    });
  });

  describe('toAsciiArt', () => {
    it('should convert grid to ASCII art', () => {
      const grid = GridUtilities.createGrid(3, 3, 0);
      grid.set(0, 0, 1); grid.set(1, 0, 0); grid.set(2, 0, 1);
      grid.set(0, 1, 0); grid.set(1, 1, 1); grid.set(2, 1, 0);
      grid.set(0, 2, 1); grid.set(1, 2, 0); grid.set(2, 2, 1);
      
      const ascii = ca.toAsciiArt(grid);
      const lines = ascii.split('\n');
      
      expect(lines).toHaveLength(3);
      expect(lines[0]).toBe('#.#');
      expect(lines[1]).toBe('.#.');
      expect(lines[2]).toBe('#.#');
    });

    it('should handle empty grid', () => {
      const grid = GridUtilities.createGrid(2, 2, 0);
      const ascii = ca.toAsciiArt(grid);
      const lines = ascii.split('\n');
      
      expect(lines).toHaveLength(2);
      expect(lines[0]).toBe('..');
      expect(lines[1]).toBe('..');
    });

    it('should throw error for null grid', () => {
      expect(() => ca.toAsciiArt(null)).toThrow('Grid is required');
    });
  });

  describe('deterministic behavior', () => {
    it('should produce same result for same input', () => {
      const config = {
        simulationSteps: 2,
        birthThreshold: 5,
        survivalThreshold: 4
      };
      
      const grid1 = GridUtilities.createGrid(5, 5, 0);
      const grid2 = GridUtilities.createGrid(5, 5, 0);
      
      // Fill grids identically
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          const value = (x + y) % 2;
          grid1.set(x, y, value);
          grid2.set(x, y, value);
        }
      }
      
      const result1 = ca.simulate(grid1, config);
      const result2 = ca.simulate(grid2, config);
      
      // Compare results
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          expect(result1.get(x, y)).toBe(result2.get(x, y));
        }
      }
    });
  });

  describe('performance', () => {
    it('should handle large grids efficiently', () => {
      const config = {
        simulationSteps: 3,
        birthThreshold: 5,
        survivalThreshold: 4
      };
      
      const grid = GridUtilities.createGrid(50, 50, 0);
      
      // Fill with some pattern
      for (let y = 0; y < 50; y++) {
        for (let x = 0; x < 50; x++) {
          grid.set(x, y, (x + y) % 3 === 0 ? 1 : 0);
        }
      }
      
      const startTime = Date.now();
      const result = ca.simulate(grid, config);
      const endTime = Date.now();
      
      expect(result).toBeDefined();
      expect(result.shape).toEqual([50, 50]);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('microSmooth', () => {
    it('should preserve solid wall regions', () => {
      const config = {
        simulationSteps: 0,
        birthThreshold: 5,
        survivalThreshold: 4
      };
      
      // Create a solid wall region
      const grid = GridUtilities.createGrid(5, 5, 0);
      grid.set(1, 1, 1); grid.set(2, 1, 1); grid.set(3, 1, 1);
      grid.set(1, 2, 1); grid.set(2, 2, 1); grid.set(3, 2, 1);
      grid.set(1, 3, 1); grid.set(2, 3, 1); grid.set(3, 3, 1);
      
      const result = ca.microSmooth(grid, 1);
      
      // Solid wall region should be preserved
      expect(result.get(2, 2)).toBe(1);
      expect(result.get(1, 1)).toBe(1);
      expect(result.get(3, 3)).toBe(1);
    });

    it('should handle edge cases correctly', () => {
      const config = {
        simulationSteps: 0,
        birthThreshold: 5,
        survivalThreshold: 4
      };
      
      const grid = GridUtilities.createGrid(3, 3, 0);
      grid.set(1, 1, 1); // Single wall in center
      
      const result = ca.microSmooth(grid, 1);
      
      expect(result).toBeDefined();
      expect(result.shape).toEqual([3, 3]);
    });

    it('should be deterministic', () => {
      const config = {
        simulationSteps: 0,
        birthThreshold: 5,
        survivalThreshold: 4
      };
      
      const grid1 = GridUtilities.createGrid(5, 5, 0);
      const grid2 = GridUtilities.createGrid(5, 5, 0);
      
      // Fill grids identically
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          const value = (x + y) % 2;
          grid1.set(x, y, value);
          grid2.set(x, y, value);
        }
      }
      
      const result1 = ca.microSmooth(grid1, 2);
      const result2 = ca.microSmooth(grid2, 2);
      
      // Compare results
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          expect(result1.get(x, y)).toBe(result2.get(x, y));
        }
      }
    });
  });

  describe('simulateWithSmoothing', () => {
    it('should perform CA simulation followed by smoothing', () => {
      const config = {
        simulationSteps: 3,
        birthThreshold: 5,
        survivalThreshold: 4,
        smoothingPasses: 2
      };
      
      const grid = GridUtilities.createGrid(10, 10, 0);
      // Fill with some pattern
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          grid.set(x, y, (x + y) % 3 === 0 ? 1 : 0);
        }
      }
      
      const result = ca.simulateWithSmoothing(grid, config);
      
      expect(result).toBeDefined();
      expect(result.shape).toEqual([10, 10]);
    });

    it('should match Python reference parameters', () => {
      const config = {
        simulationSteps: 5,
        birthThreshold: 5,
        survivalThreshold: 4,
        smoothingPasses: 2
      };
      
      const grid = GridUtilities.createGrid(40, 40, 0);
      // Use a seeded RNG for deterministic results
      const RandomGenerator = require('../../src/core/RandomGenerator');
      const rng = new RandomGenerator('test-seed');
      for (let y = 0; y < 40; y++) {
        for (let x = 0; x < 40; x++) {
          grid.set(x, y, rng.random() < 0.45 ? 1 : 0);
        }
      }
      
      const result = ca.simulateWithSmoothing(grid, config);
      
      expect(result).toBeDefined();
      expect(result.shape).toEqual([40, 40]);
      
      // Should produce reasonable cave-like structure
      const wallRatio = GridUtilities.countValue(result, 1) / (40 * 40);
      expect(wallRatio).toBeGreaterThan(0.2);
      expect(wallRatio).toBeLessThan(0.6);
    });
  });
}); 