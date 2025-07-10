const RegionVisualizer = require('../../src/visualization/RegionVisualizer');
const ndarray = require('ndarray');
const RegionDetector = require('../../src/analysis/RegionDetector');

describe('RegionVisualizer', () => {
  describe('visualizeRegions', () => {
    it('should visualize regions with color coding', () => {
      // Create a simple grid with four disconnected regions
      const grid = ndarray(new Uint8Array([
        0, 0, 1, 0, 0,  // Region A: floor tiles
        0, 0, 1, 0, 0,
        1, 1, 1, 1, 1,  // Wall barrier
        0, 0, 1, 0, 0,  // Region B: floor tiles
        0, 0, 1, 0, 0
      ]), [5, 5]);

      const { labelGrid, regionData } = RegionDetector.detectRegions(grid);
      const visualization = RegionVisualizer.visualizeRegions(grid, labelGrid, regionData);

      expect(visualization).toBeDefined();
      expect(visualization.ascii).toContain('A'); // Region A
      expect(visualization.ascii).toContain('B'); // Region B
      expect(visualization.regionCount).toBe(4); // Four regions
      expect(visualization.regionData).toEqual(regionData);
    });

    it('should handle single connected region', () => {
      const grid = ndarray(new Uint8Array([
        0, 0, 0,
        0, 1, 0,
        0, 0, 0
      ]), [3, 3]);

      const { labelGrid, regionData } = RegionDetector.detectRegions(grid);
      const visualization = RegionVisualizer.visualizeRegions(grid, labelGrid, regionData);

      expect(visualization.regionCount).toBe(1);
      expect(visualization.ascii).toContain('A'); // Single region
      expect(visualization.ascii).not.toContain('B'); // No second region
    });

    it('should handle empty grid', () => {
      const grid = ndarray(new Uint8Array([]), [0, 0]);
      const labelGrid = ndarray(new Uint8Array([]), [0, 0]);
      const regionData = {};

      const visualization = RegionVisualizer.visualizeRegions(grid, labelGrid, regionData);

      expect(visualization.regionCount).toBe(0);
      expect(visualization.ascii).toBe('');
    });

    it('should throw on null/undefined inputs', () => {
      const grid = ndarray(new Uint8Array([0, 1]), [2, 1]);
      const labelGrid = ndarray(new Uint8Array([2, 1]), [2, 1]);
      const regionData = { 2: { area: 1 } };

      expect(() => RegionVisualizer.visualizeRegions(null, labelGrid, regionData)).toThrow();
      expect(() => RegionVisualizer.visualizeRegions(grid, null, regionData)).toThrow();
      expect(() => RegionVisualizer.visualizeRegions(grid, labelGrid, null)).toThrow();
    });
  });

  describe('visualizeConnectivity', () => {
    it('should visualize connectivity with corridor highlighting', () => {
      const grid = ndarray(new Uint8Array([
        0, 0, 1, 0, 0,  // Two regions separated by wall
        0, 0, 1, 0, 0,
        1, 1, 1, 1, 1,
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0
      ]), [5, 5]);

      const { labelGrid, regionData } = RegionDetector.detectRegions(grid);
      const connectivityResult = {
        isConnected: false,
        regionCount: 2,
        connectivityScore: 0.5
      };

      const visualization = RegionVisualizer.visualizeConnectivity(
        grid, labelGrid, regionData, connectivityResult
      );

      expect(visualization).toBeDefined();
      expect(visualization.ascii).toContain('A'); // Region A
      expect(visualization.ascii).toContain('B'); // Region B
      expect(visualization.connectivityInfo).toBeDefined();
      expect(visualization.connectivityInfo.isConnected).toBe(false);
      expect(visualization.connectivityInfo.regionCount).toBe(2);
    });

    it('should handle connected regions', () => {
      const grid = ndarray(new Uint8Array([
        0, 0, 0,
        0, 0, 0,
        0, 0, 0
      ]), [3, 3]);

      const { labelGrid, regionData } = RegionDetector.detectRegions(grid);
      const connectivityResult = {
        isConnected: true,
        regionCount: 1,
        connectivityScore: 1.0
      };

      const visualization = RegionVisualizer.visualizeConnectivity(
        grid, labelGrid, regionData, connectivityResult
      );

      expect(visualization.connectivityInfo.isConnected).toBe(true);
      expect(visualization.connectivityInfo.regionCount).toBe(1);
    });
  });

  describe('generateDebugReport', () => {
    it('should generate comprehensive debug report', () => {
      const grid = ndarray(new Uint8Array([
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0,
        1, 1, 1, 1, 1,
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0
      ]), [5, 5]);

      const { labelGrid, regionData } = RegionDetector.detectRegions(grid);
      const connectivityResult = {
        isConnected: false,
        regionCount: 4,
        connectivityScore: 0.4
      };

      const report = RegionVisualizer.generateDebugReport(
        grid, labelGrid, regionData, connectivityResult
      );

      expect(report).toBeDefined();
      expect(report.gridInfo).toBeDefined();
      expect(report.regionInfo).toBeDefined();
      expect(report.connectivityInfo).toBeDefined();
      expect(report.visualization).toBeDefined();
      expect(report.recommendations).toBeDefined();

      expect(report.gridInfo.width).toBe(5);
      expect(report.gridInfo.height).toBe(5);
      expect(report.regionInfo.regionCount).toBe(4); // Four regions
      expect(report.connectivityInfo.isConnected).toBe(false);
    });

    it('should include performance metrics when available', () => {
      const grid = ndarray(new Uint8Array([0, 1, 0, 1]), [2, 2]);
      const labelGrid = ndarray(new Uint8Array([2, 1, 0, 1]), [2, 2]);
      const regionData = { 2: { area: 1 } };
      const connectivityResult = {
        isConnected: true,
        regionCount: 1,
        performance: {
          validationTime: 5,
          memoryUsage: { heapUsed: 1024 }
        }
      };

      const report = RegionVisualizer.generateDebugReport(
        grid, labelGrid, regionData, connectivityResult
      );

      expect(report.performance).toBeDefined();
      expect(report.performance.validationTime).toBe(5);
    });
  });

  describe('visualizeCorridors', () => {
    it('should visualize corridors between regions', () => {
      const originalGrid = ndarray(new Uint8Array([
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0,
        1, 1, 1, 1, 1,
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0
      ]), [5, 5]);

      const modifiedGrid = ndarray(new Uint8Array([
        0, 0, 0, 0, 0,  // Corridor carved through wall
        0, 0, 0, 0, 0,
        1, 1, 0, 1, 1,  // Gap in wall
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0
      ]), [5, 5]);

      const corridorInfo = {
        corridors: [{ start: { x: 2, y: 1 }, end: { x: 2, y: 3 } }],
        connectionPoints: [{ x: 2, y: 2 }]
      };

      const visualization = RegionVisualizer.visualizeCorridors(
        originalGrid, modifiedGrid, corridorInfo
      );

      expect(visualization).toBeDefined();
      expect(visualization.ascii).toContain('C'); // Corridor marker
      expect(visualization.corridorInfo).toBeDefined();
      expect(visualization.corridorInfo.corridorCount).toBe(1);
    });

    it('should handle no corridors', () => {
      const grid = ndarray(new Uint8Array([0, 1, 0, 1]), [2, 2]);
      const corridorInfo = { corridors: [], connectionPoints: [] };

      const visualization = RegionVisualizer.visualizeCorridors(
        grid, grid, corridorInfo
      );

      expect(visualization.corridorInfo.corridorCount).toBe(0);
    });
  });

  describe('performance', () => {
    it('should handle large grids efficiently', () => {
      const size = 60;
      const data = new Uint8Array(size * size);
      for (let i = 0; i < data.length; i++) {
        data[i] = i % 3 === 0 ? 0 : 1; // Create some floor regions
      }
      const grid = ndarray(data, [size, size]);

      const { labelGrid, regionData } = RegionDetector.detectRegions(grid);
      const connectivityResult = {
        isConnected: true,
        regionCount: 1
      };

      const start = Date.now();
      const visualization = RegionVisualizer.visualizeRegions(grid, labelGrid, regionData);
      const connectivityViz = RegionVisualizer.visualizeConnectivity(
        grid, labelGrid, regionData, connectivityResult
      );
      const report = RegionVisualizer.generateDebugReport(
        grid, labelGrid, regionData, connectivityResult
      );
      const duration = Date.now() - start;

      expect(visualization).toBeDefined();
      expect(connectivityViz).toBeDefined();
      expect(report).toBeDefined();
      expect(duration).toBeLessThan(1000); // Should be fast for 60x60
    });
  });

  describe('interactive debugging', () => {
    it('should provide step-by-step analysis', () => {
      const grid = ndarray(new Uint8Array([
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0,
        1, 1, 1, 1, 1,
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0
      ]), [5, 5]);

      const steps = RegionVisualizer.generateStepByStepAnalysis(grid);

      expect(steps).toBeDefined();
      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBeGreaterThan(0);
      
      // Each step should have required properties
      steps.forEach(step => {
        expect(step.step).toBeDefined();
        expect(step.description).toBeDefined();
        expect(step.visualization).toBeDefined();
      });
    });

    it('should provide recommendations for disconnected regions', () => {
      const grid = ndarray(new Uint8Array([
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0,
        1, 1, 1, 1, 1,
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0
      ]), [5, 5]);

      const { labelGrid, regionData } = RegionDetector.detectRegions(grid);
      const connectivityResult = {
        isConnected: false,
        regionCount: 2
      };

      const recommendations = RegionVisualizer.generateRecommendations(
        grid, labelGrid, regionData, connectivityResult
      );

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      recommendations.forEach(rec => {
        expect(rec.type).toBeDefined();
        expect(rec.description).toBeDefined();
        expect(rec.priority).toBeDefined();
      });
    });
  });
}); 