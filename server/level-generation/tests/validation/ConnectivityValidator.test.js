/**
 * @fileoverview Tests for ConnectivityValidator class
 * Tests the connectivity validation and fallback system for cave generation
 */

const { ConnectivityValidator } = require('../../src/validation/ConnectivityValidator');
const GridUtilities = require('../../src/core/GridUtilities');
const RandomGenerator = require('../../src/core/RandomGenerator');
const RegionDetector = require('../../src/analysis/RegionDetector');
const CorridorCarver = require('../../src/analysis/CorridorCarver');

describe('ConnectivityValidator', () => {
  let validator;
  let mockGrid;
  let mockRng;

  beforeEach(() => {
    validator = new ConnectivityValidator();
    mockRng = new RandomGenerator('test-seed');
    
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
    test('should create ConnectivityValidator instance with default settings', () => {
      expect(validator).toBeInstanceOf(ConnectivityValidator);
      expect(validator.getSettings()).toEqual({
        maxFallbackAttempts: 3,
        fallbackTimeoutMs: 5000,
        minConnectivityScore: 0.8,
        enablePerformanceMonitoring: true,
        enableDetailedReporting: true
      });
    });

    test('should create validator with custom settings', () => {
      const customSettings = {
        maxFallbackAttempts: 5,
        fallbackTimeoutMs: 10000,
        minConnectivityScore: 0.9,
        enablePerformanceMonitoring: false,
        enableDetailedReporting: false
      };
      
      const customValidator = new ConnectivityValidator(customSettings);
      expect(customValidator.getSettings()).toEqual(customSettings);
    });
  });

  describe('Settings Validation', () => {
    test('should validate valid settings', () => {
      const validSettings = {
        maxFallbackAttempts: 3,
        fallbackTimeoutMs: 5000,
        minConnectivityScore: 0.8,
        enablePerformanceMonitoring: true,
        enableDetailedReporting: true
      };
      
      expect(() => validator.validateSettings(validSettings)).not.toThrow();
    });

    test('should reject invalid maxFallbackAttempts', () => {
      const invalidSettings = {
        maxFallbackAttempts: -1,
        fallbackTimeoutMs: 5000,
        minConnectivityScore: 0.8,
        enablePerformanceMonitoring: true,
        enableDetailedReporting: true
      };
      
      expect(() => validator.validateSettings(invalidSettings)).toThrow('Invalid maxFallbackAttempts');
    });

    test('should reject invalid fallbackTimeoutMs', () => {
      const invalidSettings = {
        maxFallbackAttempts: 3,
        fallbackTimeoutMs: -1000,
        minConnectivityScore: 0.8,
        enablePerformanceMonitoring: true,
        enableDetailedReporting: true
      };
      
      expect(() => validator.validateSettings(invalidSettings)).toThrow('Invalid fallbackTimeoutMs');
    });

    test('should reject invalid minConnectivityScore', () => {
      const invalidSettings = {
        maxFallbackAttempts: 3,
        fallbackTimeoutMs: 5000,
        minConnectivityScore: 1.5, // > 1.0
        enablePerformanceMonitoring: true,
        enableDetailedReporting: true
      };
      
      expect(() => validator.validateSettings(invalidSettings)).toThrow('Invalid minConnectivityScore');
    });
  });

  describe('Basic Connectivity Testing', () => {
    test('should validate connected cave successfully', () => {
      const result = validator.validateConnectivity(mockGrid);
      
      expect(result.isConnected).toBe(true);
      expect(result.connectivityScore).toBeGreaterThan(0.8);
      expect(result.regionCount).toBe(1);
      expect(result.fallbackAttempts).toBe(0);
    });

    test('should detect disconnected regions', () => {
      // Create a grid with disconnected regions
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
      
      const result = validator.validateConnectivity(disconnectedGrid);
      
      expect(result.isConnected).toBe(false);
      expect(result.regionCount).toBe(2);
      expect(result.connectivityScore).toBeLessThan(0.8);
    });

    test('should handle grid with no floor tiles', () => {
      const wallGrid = GridUtilities.createGrid(10, 10, 1);
      const result = validator.validateConnectivity(wallGrid);
      
      expect(result.isConnected).toBe(false);
      expect(result.regionCount).toBe(0);
      expect(result.connectivityScore).toBe(0);
    });
  });

  describe('Fallback Mechanisms', () => {
    test('should attempt corridor carving for disconnected regions', () => {
      // Create a grid with disconnected regions
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
      
      const result = validator.validateConnectivityWithFallback(disconnectedGrid, mockRng);
      
      expect(result.isConnected).toBe(true);
      expect(result.fallbackAttempts).toBeGreaterThan(0);
      expect(result.fallbackMethod).toBe('corridor_carving');
    });

    test('should respect maxFallbackAttempts setting', () => {
      const limitedValidator = new ConnectivityValidator({ maxFallbackAttempts: 1 });
      
      // Create a complex disconnected grid that might need multiple attempts
      const complexGrid = GridUtilities.createGrid(30, 30, 1);
      
      // Multiple small disconnected regions
      for (let i = 0; i < 5; i++) {
        const x = 5 + i * 6;
        const y = 5 + i * 6;
        for (let dy = 0; dy < 3; dy++) {
          for (let dx = 0; dx < 3; dx++) {
            GridUtilities.setSafe(complexGrid, x + dx, y + dy, 0);
          }
        }
      }
      
      const result = limitedValidator.validateConnectivityWithFallback(complexGrid, mockRng);
      
      expect(result.fallbackAttempts).toBeLessThanOrEqual(1);
    });

    test('should timeout if fallback takes too long', () => {
      const timeoutValidator = new ConnectivityValidator({ fallbackTimeoutMs: 1 });
      
      // Create a large grid that might take time to process
      const largeGrid = GridUtilities.createGrid(100, 100, 1);
      
      // Add some floor tiles
      for (let y = 10; y < 90; y += 20) {
        for (let x = 10; x < 90; x += 20) {
          for (let dy = 0; dy < 5; dy++) {
            for (let dx = 0; dx < 5; dx++) {
              GridUtilities.setSafe(largeGrid, x + dx, y + dy, 0);
            }
          }
        }
      }
      
      const result = timeoutValidator.validateConnectivityWithFallback(largeGrid, mockRng);
      
      expect(result.timedOut).toBe(true);
      expect(result.error).toContain('timed out');
    });
  });

  describe('Error Recovery', () => {
    test('should handle invalid grid gracefully', () => {
      expect(() => validator.validateConnectivity(null)).toThrow('Grid is required');
      expect(() => validator.validateConnectivity(undefined)).toThrow('Grid is required');
    });

    test('should handle invalid RNG gracefully', () => {
      expect(() => validator.validateConnectivityWithFallback(mockGrid, null)).toThrow('RNG is required');
    });

    test('should provide detailed error information', () => {
      const result = validator.validateConnectivityWithFallback(mockGrid, mockRng);
      
      expect(result.error).toBeUndefined();
      expect(result.warnings).toBeDefined();
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    test('should recover from corridor carving failures', () => {
      // Create a grid with disconnected regions that need fallback
      const problematicGrid = GridUtilities.createGrid(10, 10, 1);
      
      // First region
      GridUtilities.setSafe(problematicGrid, 1, 1, 0);
      GridUtilities.setSafe(problematicGrid, 1, 2, 0);
      
      // Second region (disconnected)
      GridUtilities.setSafe(problematicGrid, 8, 8, 0);
      GridUtilities.setSafe(problematicGrid, 8, 9, 0);
      
      const result = validator.validateConnectivityWithFallback(problematicGrid, mockRng);
      
      expect(result.isConnected).toBe(true);
      expect(result.fallbackAttempts).toBeGreaterThan(0);
    });
  });

  describe('Performance Monitoring', () => {
    test('should track validation performance', () => {
      const result = validator.validateConnectivity(mockGrid);
      
      expect(result.performance).toBeDefined();
      expect(result.performance.validationTime).toBeGreaterThan(0);
      expect(result.performance.memoryUsage).toBeDefined();
    });

    test('should track fallback performance', () => {
      const result = validator.validateConnectivityWithFallback(mockGrid, mockRng);
      
      expect(result.performance).toBeDefined();
      expect(result.performance.totalTime).toBeGreaterThan(0);
      expect(result.performance.fallbackTime).toBeDefined();
    });

    test('should disable performance monitoring when configured', () => {
      const noMonitoringValidator = new ConnectivityValidator({ enablePerformanceMonitoring: false });
      const result = noMonitoringValidator.validateConnectivity(mockGrid);
      
      expect(result.performance).toBeUndefined();
    });
  });

  describe('Detailed Reporting', () => {
    test('should generate detailed connectivity report', () => {
      const report = validator.generateConnectivityReport(mockGrid);
      
      expect(report.summary).toBeDefined();
      expect(report.details).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    test('should include region analysis in report', () => {
      const report = validator.generateConnectivityReport(mockGrid);
      
      expect(report.details.regionAnalysis).toBeDefined();
      expect(report.details.regionAnalysis.regionCount).toBe(1);
      expect(report.details.regionAnalysis.largestRegionSize).toBeGreaterThan(0);
    });

    test('should include performance metrics in report', () => {
      const report = validator.generateConnectivityReport(mockGrid);
      
      expect(report.details.performance).toBeDefined();
      expect(report.details.performance.validationTime).toBeGreaterThan(0);
    });

    test('should disable detailed reporting when configured', () => {
      const noReportingValidator = new ConnectivityValidator({ enableDetailedReporting: false });
      const report = noReportingValidator.generateConnectivityReport(mockGrid);
      
      expect(report.details).toBeUndefined();
      expect(report.recommendations).toBeUndefined();
    });
  });

  describe('Integration with Region Detection', () => {
    test('should work with RegionDetector output', () => {
      const { labelGrid, regionData } = RegionDetector.detectRegions(mockGrid);
      const result = validator.validateConnectivityWithRegions(mockGrid, labelGrid, regionData, mockRng);
      
      expect(result.isConnected).toBe(true);
      expect(result.regionCount).toBe(Object.keys(regionData).length);
    });

    test('should handle multiple regions from RegionDetector', () => {
      // Create a grid with multiple regions
      const multiRegionGrid = GridUtilities.createGrid(20, 20, 1);
      
      // First region
      for (let y = 2; y < 7; y++) {
        for (let x = 2; x < 7; x++) {
          GridUtilities.setSafe(multiRegionGrid, x, y, 0);
        }
      }
      
      // Second region
      for (let y = 12; y < 15; y++) {
        for (let x = 12; x < 15; x++) {
          GridUtilities.setSafe(multiRegionGrid, x, y, 0);
        }
      }
      
      const { labelGrid, regionData } = RegionDetector.detectRegions(multiRegionGrid);
      const result = validator.validateConnectivityWithRegions(multiRegionGrid, labelGrid, regionData, mockRng);
      
      expect(result.regionCount).toBe(2);
      expect(result.isConnected).toBe(false);
    });
  });

  describe('Integration with Corridor Carving', () => {
    test('should use CorridorCarver for fallback', () => {
      // Create a disconnected grid
      const disconnectedGrid = GridUtilities.createGrid(20, 20, 1);
      
      // First region
      for (let y = 2; y < 7; y++) {
        for (let x = 2; x < 7; x++) {
          GridUtilities.setSafe(disconnectedGrid, x, y, 0);
        }
      }
      
      // Second region
      for (let y = 12; y < 15; y++) {
        for (let x = 12; x < 15; x++) {
          GridUtilities.setSafe(disconnectedGrid, x, y, 0);
        }
      }
      
      const { labelGrid, regionData } = RegionDetector.detectRegions(disconnectedGrid);
      const result = validator.validateConnectivityWithFallback(disconnectedGrid, mockRng);
      
      expect(result.fallbackMethod).toBe('corridor_carving');
      expect(result.isConnected).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle single floor tile', () => {
      const singleTileGrid = GridUtilities.createGrid(10, 10, 1);
      GridUtilities.setSafe(singleTileGrid, 5, 5, 0);
      
      const result = validator.validateConnectivity(singleTileGrid);
      
      expect(result.isConnected).toBe(true);
      expect(result.regionCount).toBe(1);
      expect(result.connectivityScore).toBe(1.0);
    });

    test('should handle grid with only walls', () => {
      const wallOnlyGrid = GridUtilities.createGrid(10, 10, 1);
      
      const result = validator.validateConnectivity(wallOnlyGrid);
      
      expect(result.isConnected).toBe(false);
      expect(result.regionCount).toBe(0);
      expect(result.connectivityScore).toBe(0);
    });

    test('should handle very large grids efficiently', () => {
      const largeGrid = GridUtilities.createGrid(200, 200, 1);
      
      // Add floor tiles in a connected pattern
      for (let y = 50; y < 150; y++) {
        for (let x = 50; x < 150; x++) {
          GridUtilities.setSafe(largeGrid, x, y, 0);
        }
      }
      
      const startTime = Date.now();
      const result = validator.validateConnectivity(largeGrid);
      const endTime = Date.now();
      
      expect(result.isConnected).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
}); 