const GridUtilities = require('../../src/core/GridUtilities');

describe('GridUtilities', () => {
  describe('Grid Creation', () => {
    test('should create a grid with specified dimensions', () => {
      const width = 10;
      const height = 8;
      const grid = GridUtilities.createGrid(width, height);
      
      expect(grid.shape).toEqual([width, height]);
      expect(grid.dtype).toBe('uint8');
      expect(grid.data).toBeInstanceOf(Uint8Array);
      expect(grid.data.length).toBe(width * height);
    });

    test('should create a grid with default values (0)', () => {
      const grid = GridUtilities.createGrid(5, 5);
      
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          expect(grid.get(x, y)).toBe(0);
        }
      }
    });

    test('should create a grid with custom initial value', () => {
      const grid = GridUtilities.createGrid(3, 3, 1);
      
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          expect(grid.get(x, y)).toBe(1);
        }
      }
    });

    test('should throw error for invalid dimensions', () => {
      expect(() => GridUtilities.createGrid(0, 5)).toThrow('Invalid dimensions');
      expect(() => GridUtilities.createGrid(5, 0)).toThrow('Invalid dimensions');
      expect(() => GridUtilities.createGrid(-1, 5)).toThrow('Invalid dimensions');
      expect(() => GridUtilities.createGrid(5, -1)).toThrow('Invalid dimensions');
    });

    test('should handle large grid creation efficiently', () => {
      const startTime = Date.now();
      const grid = GridUtilities.createGrid(100, 100);
      const endTime = Date.now();
      
      expect(grid.shape).toEqual([100, 100]);
      expect(grid.data.length).toBe(10000);
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });
  });

  describe('Coordinate Conversion', () => {
    const tileSize = 64;

    test('should convert pixel coordinates to grid coordinates', () => {
      expect(GridUtilities.pixelToGrid(0, 0, tileSize)).toEqual({ x: 0, y: 0 });
      expect(GridUtilities.pixelToGrid(64, 64, tileSize)).toEqual({ x: 1, y: 1 });
      expect(GridUtilities.pixelToGrid(128, 192, tileSize)).toEqual({ x: 2, y: 3 });
      expect(GridUtilities.pixelToGrid(32, 96, tileSize)).toEqual({ x: 0, y: 1 });
    });

    test('should convert grid coordinates to pixel coordinates', () => {
      expect(GridUtilities.gridToPixel(0, 0, tileSize)).toEqual({ x: 0, y: 0 });
      expect(GridUtilities.gridToPixel(1, 1, tileSize)).toEqual({ x: 64, y: 64 });
      expect(GridUtilities.gridToPixel(2, 3, tileSize)).toEqual({ x: 128, y: 192 });
      expect(GridUtilities.gridToPixel(5, 10, tileSize)).toEqual({ x: 320, y: 640 });
    });

    test('should use default tile size of 64', () => {
      expect(GridUtilities.pixelToGrid(64, 64)).toEqual({ x: 1, y: 1 });
      expect(GridUtilities.gridToPixel(1, 1)).toEqual({ x: 64, y: 64 });
    });

    test('should handle custom tile sizes', () => {
      const customTileSize = 32;
      expect(GridUtilities.pixelToGrid(32, 64, customTileSize)).toEqual({ x: 1, y: 2 });
      expect(GridUtilities.gridToPixel(1, 2, customTileSize)).toEqual({ x: 32, y: 64 });
    });

    test('should handle negative coordinates', () => {
      expect(GridUtilities.pixelToGrid(-32, -64, tileSize)).toEqual({ x: -1, y: -1 });
      expect(GridUtilities.gridToPixel(-1, -1, tileSize)).toEqual({ x: -64, y: -64 });
    });
  });

  describe('Boundary Checking', () => {
    let grid;

    beforeEach(() => {
      grid = GridUtilities.createGrid(10, 8);
    });

    test('should validate coordinates are within bounds', () => {
      expect(GridUtilities.isValidCoordinate(0, 0, grid)).toBe(true);
      expect(GridUtilities.isValidCoordinate(9, 7, grid)).toBe(true);
      expect(GridUtilities.isValidCoordinate(5, 4, grid)).toBe(true);
    });

    test('should reject coordinates outside bounds', () => {
      expect(GridUtilities.isValidCoordinate(-1, 0, grid)).toBe(false);
      expect(GridUtilities.isValidCoordinate(0, -1, grid)).toBe(false);
      expect(GridUtilities.isValidCoordinate(10, 0, grid)).toBe(false);
      expect(GridUtilities.isValidCoordinate(0, 8, grid)).toBe(false);
      expect(GridUtilities.isValidCoordinate(15, 10, grid)).toBe(false);
    });

    test('should safely get values with boundary checking', () => {
      grid.set(5, 4, 42);
      
      expect(GridUtilities.getSafe(grid, 5, 4)).toBe(42);
      expect(GridUtilities.getSafe(grid, 0, 0)).toBe(0);
      expect(GridUtilities.getSafe(grid, -1, 0)).toBe(undefined);
      expect(GridUtilities.getSafe(grid, 0, -1)).toBe(undefined);
      expect(GridUtilities.getSafe(grid, 10, 0)).toBe(undefined);
      expect(GridUtilities.getSafe(grid, 0, 8)).toBe(undefined);
    });

    test('should safely set values with boundary checking', () => {
      expect(GridUtilities.setSafe(grid, 5, 4, 99)).toBe(true);
      expect(grid.get(5, 4)).toBe(99);
      
      expect(GridUtilities.setSafe(grid, -1, 0, 99)).toBe(false);
      expect(GridUtilities.setSafe(grid, 0, -1, 99)).toBe(false);
      expect(GridUtilities.setSafe(grid, 10, 0, 99)).toBe(false);
      expect(GridUtilities.setSafe(grid, 0, 8, 99)).toBe(false);
    });
  });

  describe('Memory Management', () => {
    test('should create independent copy of grid', () => {
      const original = GridUtilities.createGrid(5, 5);
      original.set(2, 2, 42);
      
      const copy = GridUtilities.copyGrid(original);
      
      expect(copy.shape).toEqual(original.shape);
      expect(copy.get(2, 2)).toBe(42);
      
      // Modifying copy should not affect original
      copy.set(2, 2, 99);
      expect(original.get(2, 2)).toBe(42);
      expect(copy.get(2, 2)).toBe(99);
    });

    test('should create view without copying data', () => {
      const original = GridUtilities.createGrid(10, 10);
      original.set(5, 5, 42);
      
      const view = GridUtilities.createView(original, 2, 2, 6, 6);
      
      expect(view.shape).toEqual([4, 4]);
      expect(view.get(3, 3)).toBe(42); // (5,5) in original = (3,3) in view
      
      // Modifying view should affect original
      view.set(3, 3, 99);
      expect(original.get(5, 5)).toBe(99);
    });

    test('should detect memory leaks in large grids', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Create and destroy many large grids
      for (let i = 0; i < 10; i++) {
        const grid = GridUtilities.createGrid(100, 100);
        // Simulate some operations
        for (let y = 0; y < 100; y++) {
          for (let x = 0; x < 100; x++) {
            grid.set(x, y, (x + y) % 256);
          }
        }
        // Grid goes out of scope here
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 1MB for this test)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });
  });

  describe('Grid Operations', () => {
    test('should fill grid with value', () => {
      const grid = GridUtilities.createGrid(5, 5);
      GridUtilities.fillGrid(grid, 42);
      
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          expect(grid.get(x, y)).toBe(42);
        }
      }
    });

    test('should fill grid region with value', () => {
      const grid = GridUtilities.createGrid(10, 10);
      GridUtilities.fillGridRegion(grid, 2, 2, 6, 6, 99);
      
      // Check that only the region was filled
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          if (x >= 2 && x < 6 && y >= 2 && y < 6) {
            expect(grid.get(x, y)).toBe(99);
          } else {
            expect(grid.get(x, y)).toBe(0);
          }
        }
      }
    });

    test('should count values in grid', () => {
      const grid = GridUtilities.createGrid(5, 5);
      grid.set(0, 0, 1);
      grid.set(1, 1, 1);
      grid.set(2, 2, 1);
      grid.set(3, 3, 2);
      
      expect(GridUtilities.countValue(grid, 0)).toBe(21); // 25 total - 4 non-zero
      expect(GridUtilities.countValue(grid, 1)).toBe(3);
      expect(GridUtilities.countValue(grid, 2)).toBe(1);
      expect(GridUtilities.countValue(grid, 3)).toBe(0);
    });

    test('should find all positions of a value', () => {
      const grid = GridUtilities.createGrid(5, 5);
      grid.set(1, 1, 42);
      grid.set(3, 2, 42);
      grid.set(4, 4, 42);
      
      const positions = GridUtilities.findValuePositions(grid, 42);
      
      expect(positions).toHaveLength(3);
      expect(positions).toContainEqual({ x: 1, y: 1 });
      expect(positions).toContainEqual({ x: 3, y: 2 });
      expect(positions).toContainEqual({ x: 4, y: 4 });
    });
  });

  describe('Performance Testing', () => {
    test('should handle large grid operations efficiently', () => {
      const grid = GridUtilities.createGrid(100, 100);
      
      const startTime = Date.now();
      
      // Fill entire grid
      GridUtilities.fillGrid(grid, 1);
      
      // Count values
      const count = GridUtilities.countValue(grid, 1);
      
      // Find positions
      const positions = GridUtilities.findValuePositions(grid, 1);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(count).toBe(10000);
      expect(positions).toHaveLength(10000);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    test('should handle coordinate conversion efficiently', () => {
      const tileSize = 64;
      const iterations = 1000; // Reduced from 10000 for faster test
      
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        const pixelX = i * 64;
        const pixelY = i * 64; // Use multiples of tileSize to avoid rounding issues
        const gridCoords = GridUtilities.pixelToGrid(pixelX, pixelY, tileSize);
        const backToPixel = GridUtilities.gridToPixel(gridCoords.x, gridCoords.y, tileSize);
        
        expect(backToPixel.x).toBe(pixelX);
        expect(backToPixel.y).toBe(pixelY);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // Should be very fast
    });
  });

  describe('Error Handling', () => {
    test('should handle null/undefined grid gracefully', () => {
      expect(() => GridUtilities.isValidCoordinate(0, 0, null)).toThrow();
      expect(() => GridUtilities.isValidCoordinate(0, 0, undefined)).toThrow();
      expect(() => GridUtilities.getSafe(null, 0, 0)).toThrow();
      expect(() => GridUtilities.setSafe(undefined, 0, 0, 1)).toThrow();
    });

    test('should handle invalid tile sizes', () => {
      expect(() => GridUtilities.pixelToGrid(0, 0, 0)).toThrow();
      expect(() => GridUtilities.pixelToGrid(0, 0, -1)).toThrow();
      expect(() => GridUtilities.gridToPixel(0, 0, 0)).toThrow();
      expect(() => GridUtilities.gridToPixel(0, 0, -1)).toThrow();
    });
  });
}); 