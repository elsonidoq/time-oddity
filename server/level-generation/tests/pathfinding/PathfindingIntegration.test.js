/**
 * @fileoverview Tests for PathfindingIntegration module
 * Tests A* pathfinding integration with ndarray grids
 */

const PathfindingIntegration = require('../../src/pathfinding/PathfindingIntegration');
const ndarray = require('ndarray');
const PF = require('pathfinding');

describe('PathfindingIntegration', () => {
  let pathfindingIntegration;
  let mockGrid;

  beforeEach(() => {
    pathfindingIntegration = new PathfindingIntegration();
    
    // Create a simple 5x5 test grid with a clear path
    const data = new Uint8Array([
      1, 1, 1, 1, 1,  // Row 0: wall
      1, 0, 0, 0, 1,  // Row 1: floor path
      1, 0, 1, 0, 1,  // Row 2: floor with wall
      1, 0, 0, 0, 1,  // Row 3: floor path
      1, 1, 1, 1, 1   // Row 4: wall
    ]);
    mockGrid = ndarray(data, [5, 5]);
  });

  describe('constructor', () => {
    test('should create instance with default configuration', () => {
      expect(pathfindingIntegration).toBeInstanceOf(PathfindingIntegration);
      expect(pathfindingIntegration.allowDiagonal).toBe(false);
      expect(pathfindingIntegration.dontCrossCorners).toBe(true);
    });

    test('should create instance with custom configuration', () => {
      const customIntegration = new PathfindingIntegration({
        allowDiagonal: true,
        dontCrossCorners: false
      });
      
      expect(customIntegration.allowDiagonal).toBe(true);
      expect(customIntegration.dontCrossCorners).toBe(false);
    });
  });

  describe('convertNdarrayToPathfindingGrid', () => {
    test('should convert ndarray to pathfinding grid correctly', () => {
      const pfGrid = pathfindingIntegration.convertNdarrayToPathfindingGrid(mockGrid);
      
      expect(pfGrid).toBeInstanceOf(PF.Grid);
      expect(pfGrid.width).toBe(5);
      expect(pfGrid.height).toBe(5);
    });

    test('should handle empty grid', () => {
      const emptyData = new Uint8Array(0);
      const emptyGrid = ndarray(emptyData, [0, 0]);
      
      expect(() => {
        pathfindingIntegration.convertNdarrayToPathfindingGrid(emptyGrid);
      }).toThrow('Grid dimensions must be positive');
    });

    test('should handle single tile grid', () => {
      const singleData = new Uint8Array([0]);
      const singleGrid = ndarray(singleData, [1, 1]);
      
      const pfGrid = pathfindingIntegration.convertNdarrayToPathfindingGrid(singleGrid);
      
      expect(pfGrid.width).toBe(1);
      expect(pfGrid.height).toBe(1);
    });

    test('should preserve walkable/unwalkable mapping', () => {
      const pfGrid = pathfindingIntegration.convertNdarrayToPathfindingGrid(mockGrid);
      
      // Check that floor tiles (0) are walkable
      expect(pfGrid.isWalkableAt(1, 1)).toBe(true);
      expect(pfGrid.isWalkableAt(2, 1)).toBe(true);
      expect(pfGrid.isWalkableAt(3, 1)).toBe(true);
      
      // Check that wall tiles (1) are unwalkable
      expect(pfGrid.isWalkableAt(0, 0)).toBe(false);
      expect(pfGrid.isWalkableAt(1, 0)).toBe(false);
      expect(pfGrid.isWalkableAt(2, 2)).toBe(false);
    });
  });

  describe('findPath', () => {
    test('should find valid path between two points', () => {
      const start = { x: 1, y: 1 };
      const end = { x: 3, y: 3 };
      
      const path = pathfindingIntegration.findPath(mockGrid, start, end);
      
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual([start.x, start.y]);
      expect(path[path.length - 1]).toEqual([end.x, end.y]);
    });

    test('should return empty array for unreachable points', () => {
      const start = { x: 0, y: 0 }; // Wall position
      const end = { x: 1, y: 1 };   // Floor position
      
      const path = pathfindingIntegration.findPath(mockGrid, start, end);
      
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBe(0);
    });

    test('should handle same start and end point', () => {
      const point = { x: 1, y: 1 };
      
      const path = pathfindingIntegration.findPath(mockGrid, point, point);
      
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBe(1);
      expect(path[0]).toEqual([point.x, point.y]);
    });

    test('should throw error for invalid coordinates', () => {
      const start = { x: -1, y: 1 };
      const end = { x: 1, y: 1 };
      
      expect(() => {
        pathfindingIntegration.findPath(mockGrid, start, end);
      }).toThrow('Invalid start coordinates');
    });

    test('should throw error for out of bounds coordinates', () => {
      const start = { x: 1, y: 1 };
      const end = { x: 10, y: 10 };
      
      expect(() => {
        pathfindingIntegration.findPath(mockGrid, start, end);
      }).toThrow('Coordinates out of bounds');
    });
  });

  describe('isReachable', () => {
    test('should return true for reachable points', () => {
      const start = { x: 1, y: 1 };
      const end = { x: 3, y: 3 };
      
      const isReachable = pathfindingIntegration.isReachable(mockGrid, start, end);
      
      expect(isReachable).toBe(true);
    });

    test('should return false for unreachable points', () => {
      const start = { x: 0, y: 0 }; // Wall position
      const end = { x: 1, y: 1 };   // Floor position
      
      const isReachable = pathfindingIntegration.isReachable(mockGrid, start, end);
      
      expect(isReachable).toBe(false);
    });

    test('should return true for same point', () => {
      const point = { x: 1, y: 1 };
      
      const isReachable = pathfindingIntegration.isReachable(mockGrid, point, point);
      
      expect(isReachable).toBe(true);
    });
  });

  describe('validatePath', () => {
    test('should validate correct path', () => {
      const start = { x: 1, y: 1 };
      const end = { x: 3, y: 3 };
      const path = [[1, 1], [2, 1], [3, 1], [3, 2], [3, 3]];
      
      const isValid = pathfindingIntegration.validatePath(mockGrid, path, start, end);
      
      expect(isValid).toBe(true);
    });

    test('should reject invalid path with wall collision', () => {
      const start = { x: 1, y: 1 };
      const end = { x: 3, y: 3 };
      const invalidPath = [[1, 1], [2, 2]]; // Goes through wall
      
      const isValid = pathfindingIntegration.validatePath(mockGrid, invalidPath, start, end);
      
      expect(isValid).toBe(false);
    });

    test('should reject path that does not start at start point', () => {
      const start = { x: 1, y: 1 };
      const end = { x: 3, y: 3 };
      const invalidPath = [[2, 1], [3, 1], [3, 2], [3, 3]];
      
      const isValid = pathfindingIntegration.validatePath(mockGrid, invalidPath, start, end);
      
      expect(isValid).toBe(false);
    });

    test('should reject path that does not end at end point', () => {
      const start = { x: 1, y: 1 };
      const end = { x: 3, y: 3 };
      const invalidPath = [[1, 1], [2, 1], [3, 1], [3, 2]];
      
      const isValid = pathfindingIntegration.validatePath(mockGrid, invalidPath, start, end);
      
      expect(isValid).toBe(false);
    });
  });

  describe('performance', () => {
    test('should handle large grids efficiently', () => {
      // Create a 50x50 grid
      const size = 50;
      const data = new Uint8Array(size * size);
      const largeGrid = ndarray(data, [size, size]);
      
      // Fill with a simple pattern
      for (let i = 0; i < size * size; i++) {
        data[i] = i % 2; // Alternating floor/wall
      }
      
      const start = { x: 1, y: 1 };
      const end = { x: size - 2, y: size - 2 };
      
      const startTime = Date.now();
      const path = pathfindingIntegration.findPath(largeGrid, start, end);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(Array.isArray(path)).toBe(true);
    });
  });

  describe('error handling', () => {
    test('should handle null grid gracefully', () => {
      expect(() => {
        pathfindingIntegration.convertNdarrayToPathfindingGrid(null);
      }).toThrow('Grid is required');
    });

    test('should handle undefined grid gracefully', () => {
      expect(() => {
        pathfindingIntegration.convertNdarrayToPathfindingGrid(undefined);
      }).toThrow('Grid is required');
    });

    test('should handle invalid grid shape', () => {
      const invalidData = new Uint8Array([0, 1, 2]);
      const invalidGrid = ndarray(invalidData, [3]); // 1D instead of 2D
      
      expect(() => {
        pathfindingIntegration.convertNdarrayToPathfindingGrid(invalidGrid);
      }).toThrow('Grid must be 2-dimensional');
    });
  });
}); 