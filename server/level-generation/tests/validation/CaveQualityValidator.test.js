/**
 * @fileoverview Tests for CaveQualityValidator class
 * Tests the cave quality validation system for connectivity, size, and shape
 */

const { CaveQualityValidator } = require('../../src/validation/CaveQualityValidator');
const GridUtilities = require('../../src/core/GridUtilities');

describe('CaveQualityValidator', () => {
  let validator;
  let mockGrid;

  beforeEach(() => {
    validator = new CaveQualityValidator();
    
    // Create a mock grid for testing (40x40 grid with some floor tiles)
    mockGrid = GridUtilities.createGrid(40, 40, 1); // Start with all walls
    
    // Add some floor tiles to create a basic cave structure
    for (let y = 10; y < 30; y++) {
      for (let x = 10; x < 30; x++) {
        GridUtilities.setSafe(mockGrid, x, y, 0); // Floor tiles
      }
    }
  });

  describe('Constructor', () => {
    test('should create CaveQualityValidator instance with default thresholds', () => {
      expect(validator).toBeInstanceOf(CaveQualityValidator);
      expect(validator.getThresholds()).toEqual({
        minFloorRatio: 0.1,
        maxFloorRatio: 0.8,
        minConnectedFloorTiles: 50,
        maxIsolatedRegions: 3,
        minAverageRegionSize: 20,
        maxWallIslands: 5
      });
    });

    test('should create validator with custom thresholds', () => {
      const customThresholds = {
        minFloorRatio: 0.2,
        maxFloorRatio: 0.7,
        minConnectedFloorTiles: 100,
        maxIsolatedRegions: 2,
        minAverageRegionSize: 30,
        maxWallIslands: 3
      };
      
      const customValidator = new CaveQualityValidator(customThresholds);
      expect(customValidator.getThresholds()).toEqual(customThresholds);
    });
  });

  describe('Config Validation', () => {
    test('should validate valid thresholds', () => {
      const validThresholds = {
        minFloorRatio: 0.1,
        maxFloorRatio: 0.8,
        minConnectedFloorTiles: 50,
        maxIsolatedRegions: 3,
        minAverageRegionSize: 20,
        maxWallIslands: 5
      };
      
      expect(() => validator.validateThresholds(validThresholds)).not.toThrow();
    });

    test('should reject invalid floor ratio range', () => {
      const invalidThresholds = {
        minFloorRatio: 0.8,
        maxFloorRatio: 0.1, // max < min
        minConnectedFloorTiles: 50,
        maxIsolatedRegions: 3,
        minAverageRegionSize: 20,
        maxWallIslands: 5
      };
      
      expect(() => validator.validateThresholds(invalidThresholds)).toThrow('Invalid floor ratio range');
    });

    test('should reject negative values', () => {
      const invalidThresholds = {
        minFloorRatio: -0.1,
        maxFloorRatio: 0.8,
        minConnectedFloorTiles: -50,
        maxIsolatedRegions: -3,
        minAverageRegionSize: -20,
        maxWallIslands: -5
      };
      
      expect(() => validator.validateThresholds(invalidThresholds)).toThrow('Invalid threshold values');
    });
  });

  describe('Floor Ratio Calculation', () => {
    test('should calculate floor ratio correctly', () => {
      const floorRatio = validator.calculateFloorRatio(mockGrid);
      
      // 20x20 floor tiles out of 40x40 = 400/1600 = 0.25
      expect(floorRatio).toBe(0.25);
    });

    test('should handle grid with no floor tiles', () => {
      const wallGrid = GridUtilities.createGrid(10, 10, 1);
      const floorRatio = validator.calculateFloorRatio(wallGrid);
      
      expect(floorRatio).toBe(0);
    });

    test('should handle grid with all floor tiles', () => {
      const floorGrid = GridUtilities.createGrid(10, 10, 0);
      const floorRatio = validator.calculateFloorRatio(floorGrid);
      
      expect(floorRatio).toBe(1);
    });
  });

  describe('Connected Floor Tile Analysis', () => {
    test('should count connected floor tiles correctly', () => {
      const connectedTiles = validator.countConnectedFloorTiles(mockGrid);
      
      // All floor tiles in our mock are connected (20x20 = 400)
      expect(connectedTiles).toBe(400);
    });

    test('should handle disconnected floor regions', () => {
      // Create a grid with disconnected floor regions
      const disconnectedGrid = GridUtilities.createGrid(20, 20, 1);
      
      // First region: 5x5 floor tiles
      for (let y = 2; y < 7; y++) {
        for (let x = 2; x < 7; x++) {
          GridUtilities.setSafe(disconnectedGrid, x, y, 0);
        }
      }
      
      // Second region: 3x3 floor tiles (disconnected)
      for (let y = 12; y < 15; y++) {
        for (let x = 12; x < 15; x++) {
          GridUtilities.setSafe(disconnectedGrid, x, y, 0);
        }
      }
      
      const connectedTiles = validator.countConnectedFloorTiles(disconnectedGrid);
      
      // Should return the size of the largest connected region (25 tiles)
      expect(connectedTiles).toBe(25);
    });
  });

  describe('Region Analysis', () => {
    test('should count isolated regions correctly', () => {
      // Create a grid with multiple disconnected regions
      const multiRegionGrid = GridUtilities.createGrid(20, 20, 1);
      
      // First region: 3x3 floor tiles
      for (let y = 2; y < 5; y++) {
        for (let x = 2; x < 5; x++) {
          GridUtilities.setSafe(multiRegionGrid, x, y, 0);
        }
      }
      
      // Second region: 2x2 floor tiles
      for (let y = 10; y < 12; y++) {
        for (let x = 10; x < 12; x++) {
          GridUtilities.setSafe(multiRegionGrid, x, y, 0);
        }
      }
      
      // Third region: 1x1 floor tile
      GridUtilities.setSafe(multiRegionGrid, 15, 15, 0);
      
      const regionCount = validator.countIsolatedRegions(multiRegionGrid);
      expect(regionCount).toBe(3);
    });

    test('should calculate average region size', () => {
      // Create a grid with multiple regions of known sizes
      const multiRegionGrid = GridUtilities.createGrid(20, 20, 1);
      
      // First region: 9 tiles (3x3)
      for (let y = 2; y < 5; y++) {
        for (let x = 2; x < 5; x++) {
          GridUtilities.setSafe(multiRegionGrid, x, y, 0);
        }
      }
      
      // Second region: 4 tiles (2x2)
      for (let y = 10; y < 12; y++) {
        for (let x = 10; x < 12; x++) {
          GridUtilities.setSafe(multiRegionGrid, x, y, 0);
        }
      }
      
      // Third region: 1 tile
      GridUtilities.setSafe(multiRegionGrid, 15, 15, 0);
      
      const avgSize = validator.calculateAverageRegionSize(multiRegionGrid);
      // (9 + 4 + 1) / 3 = 4.67
      expect(avgSize).toBeCloseTo(4.67, 1);
    });
  });

  describe('Wall Island Analysis', () => {
    test('should count wall islands correctly', () => {
      // Create a grid with wall islands
      const islandGrid = GridUtilities.createGrid(20, 20, 0); // Start with all floor
      
      // Add wall islands
      GridUtilities.setSafe(islandGrid, 5, 5, 1);
      GridUtilities.setSafe(islandGrid, 5, 6, 1);
      GridUtilities.setSafe(islandGrid, 6, 5, 1);
      GridUtilities.setSafe(islandGrid, 6, 6, 1);
      
      GridUtilities.setSafe(islandGrid, 15, 15, 1);
      GridUtilities.setSafe(islandGrid, 15, 16, 1);
      
      const islandCount = validator.countWallIslands(islandGrid);
      expect(islandCount).toBe(2);
    });

    test('should handle grid with no wall islands', () => {
      const floorGrid = GridUtilities.createGrid(10, 10, 0);
      const islandCount = validator.countWallIslands(floorGrid);
      expect(islandCount).toBe(0);
    });
  });

  describe('Quality Scoring', () => {
    test('should calculate overall quality score', () => {
      const qualityScore = validator.calculateQualityScore(mockGrid);
      
      expect(qualityScore).toBeGreaterThanOrEqual(0);
      expect(qualityScore).toBeLessThanOrEqual(100);
      expect(typeof qualityScore).toBe('number');
    });

    test('should provide detailed quality metrics', () => {
      const metrics = validator.calculateQualityMetrics(mockGrid);
      
      expect(metrics).toHaveProperty('floorRatio');
      expect(metrics).toHaveProperty('connectedFloorTiles');
      expect(metrics).toHaveProperty('isolatedRegions');
      expect(metrics).toHaveProperty('averageRegionSize');
      expect(metrics).toHaveProperty('wallIslands');
      
      expect(metrics.floorRatio).toBe(0.25);
      expect(metrics.connectedFloorTiles).toBe(400);
      expect(metrics.isolatedRegions).toBe(1);
      expect(metrics.wallIslands).toBe(1);
    });
  });

  describe('Validation', () => {
    test('should validate good quality cave', () => {
      const result = validator.validateCave(mockGrid);
      
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(50);
      expect(result.issues).toHaveLength(0);
    });

    test('should reject cave with too few floor tiles', () => {
      const sparseGrid = GridUtilities.createGrid(40, 40, 1);
      
      // Add only a few floor tiles
      for (let i = 0; i < 10; i++) {
        GridUtilities.setSafe(sparseGrid, i, i, 0);
      }
      
      const result = validator.validateCave(sparseGrid);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Insufficient floor tiles');
    });

    test('should reject cave with too many isolated regions', () => {
      const fragmentedGrid = GridUtilities.createGrid(20, 20, 1);
      
      // Create many small disconnected regions
      for (let i = 0; i < 10; i++) {
        GridUtilities.setSafe(fragmentedGrid, i * 2, i * 2, 0);
      }
      
      const result = validator.validateCave(fragmentedGrid);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Too many isolated regions');
    });

    test('should provide actionable feedback', () => {
      const badGrid = GridUtilities.createGrid(40, 40, 1);
      
      // Add only a few floor tiles
      for (let i = 0; i < 5; i++) {
        GridUtilities.setSafe(badGrid, i, i, 0);
      }
      
      const result = validator.validateCave(badGrid);
      
      expect(result.isValid).toBe(false);
      expect(result.suggestions).toContain('Increase floor tile density');
      expect(result.suggestions).toContain('Improve region connectivity');
    });
  });

  describe('Performance Monitoring', () => {
    test('should track validation performance', () => {
      const startTime = Date.now();
      const result = validator.validateCave(mockGrid);
      const endTime = Date.now();
      
      expect(result.validationTime).toBeGreaterThan(0);
      expect(result.validationTime).toBeLessThan(endTime - startTime + 10); // Allow some tolerance
    });

    test('should provide performance statistics', () => {
      // Run multiple validations
      for (let i = 0; i < 5; i++) {
        validator.validateCave(mockGrid);
      }
      
      const stats = validator.getPerformanceStats();
      
      expect(stats).toHaveProperty('totalValidations');
      expect(stats).toHaveProperty('averageValidationTime');
      expect(stats).toHaveProperty('minValidationTime');
      expect(stats).toHaveProperty('maxValidationTime');
      
      expect(stats.totalValidations).toBe(5);
      expect(stats.averageValidationTime).toBeGreaterThan(0);
    });
  });

  describe('Reporting', () => {
    test('should generate detailed quality report', () => {
      const report = validator.generateQualityReport(mockGrid);
      
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('metrics');
      expect(report).toHaveProperty('validation');
      expect(report).toHaveProperty('recommendations');
      
      expect(report.summary).toContain('Quality Score:');
      expect(report.metrics).toHaveProperty('floorRatio');
      expect(report.validation).toHaveProperty('isValid');
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    test('should generate ASCII visualization', () => {
      const ascii = validator.generateAsciiVisualization(mockGrid);
      
      expect(typeof ascii).toBe('string');
      expect(ascii.length).toBeGreaterThan(0);
      expect(ascii).toContain('#'); // Wall representation
      expect(ascii).toContain('.'); // Floor representation
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty grid', () => {
      expect(() => {
        GridUtilities.createGrid(0, 0);
      }).toThrow('Invalid dimensions: width and height must be positive');
    });

    test('should handle very small grid', () => {
      const smallGrid = GridUtilities.createGrid(1, 1, 0);
      
      const result = validator.validateCave(smallGrid);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Grid too small');
    });

    test('should handle null grid', () => {
      expect(() => validator.validateCave(null)).toThrow('Grid is required');
    });

    test('should handle undefined grid', () => {
      expect(() => validator.validateCave(undefined)).toThrow('Grid is required');
    });
  });
}); 