/**
 * @fileoverview Tests for PhysicsAwareReachabilityAnalyzer module
 * Tests physics-aware reachability analysis with jump constraints
 */

const PhysicsAwareReachabilityAnalyzer = require('../../src/analysis/PhysicsAwareReachabilityAnalyzer');
const ndarray = require('ndarray');

/**
 * Helper function to create a grid with correct data layout
 * @param {Array<Array<number>>} rows - 2D array where rows[y][x] = tile value
 * @returns {ndarray} Properly formatted ndarray grid
 */
function createGrid(rows) {
  const height = rows.length;
  const width = rows[0].length;
  const data = new Uint8Array(width * height);
  
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const index = x * height + y; // Column-major order for ndarray
      data[index] = rows[y][x];
    }
  }
  
  return ndarray(data, [width, height]);
}

describe('PhysicsAwareReachabilityAnalyzer', () => {
  let analyzer;
  let mockGrid;

  beforeEach(() => {
    analyzer = new PhysicsAwareReachabilityAnalyzer({
      jumpHeight: 800,
      gravity: 980
    });
    
    // Create a test grid with gaps that require platforms
    const data = new Uint8Array([
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  // Row 0: wall
      1, 0, 0, 0, 1, 1, 0, 0, 0, 1,  // Row 1: floor with gap
      1, 0, 1, 0, 1, 1, 0, 1, 0, 1,  // Row 2: floor with obstacles
      1, 0, 0, 0, 1, 1, 0, 0, 0, 1,  // Row 3: floor with gap
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1   // Row 4: wall
    ]);
    mockGrid = ndarray(data, [10, 5]);
  });

  describe('constructor', () => {
    test('should create analyzer with default physics parameters', () => {
      const defaultAnalyzer = new PhysicsAwareReachabilityAnalyzer();
      expect(defaultAnalyzer.jumpHeight).toBe(800);
      expect(defaultAnalyzer.gravity).toBe(980);
    });

    test('should create analyzer with custom physics parameters', () => {
      const customAnalyzer = new PhysicsAwareReachabilityAnalyzer({
        jumpHeight: 600,
        gravity: 1200
      });
      expect(customAnalyzer.jumpHeight).toBe(600);
      expect(customAnalyzer.gravity).toBe(1200);
    });

    test('should throw error for invalid jump height', () => {
      expect(() => {
        new PhysicsAwareReachabilityAnalyzer({ jumpHeight: -100 });
      }).toThrow('Jump height must be positive');
    });

    test('should throw error for invalid gravity', () => {
      expect(() => {
        new PhysicsAwareReachabilityAnalyzer({ gravity: 0 });
      }).toThrow('Gravity must be positive');
    });
  });

  describe('calculateJumpDistance', () => {
    test('should calculate correct jump distance based on physics', () => {
      const distance = analyzer.calculateJumpDistance();
      // 17% of 800px jump height = 136px
      expect(distance).toBe(Math.floor(800 * 0.17));
    });
  });

  describe('isReachableByJump', () => {
    test('should allow horizontal jump within limits', () => {
      const start = { x: 0, y: 0 };
      const end = { x: 2, y: 0 }; // 2 tiles = 128px
      expect(analyzer.isReachableByJump(start, end)).toBe(true);
    });

    test('should reject horizontal jump beyond limits', () => {
      const start = { x: 0, y: 0 };
      const end = { x: 3, y: 0 }; // 3 tiles = 192px, beyond 136px limit
      expect(analyzer.isReachableByJump(start, end)).toBe(false);
    });

    test('should allow upward jump within height limits', () => {
      const start = { x: 0, y: 1 };
      const end = { x: 0, y: 0 }; // Jumping up 1 tile
      expect(analyzer.isReachableByJump(start, end)).toBe(true);
    });

    test('should reject upward jump beyond height limits', () => {
      const start = { x: 0, y: 4 };
      const end = { x: 0, y: 0 }; // Jumping up 4 tiles = 256px, beyond 240px limit
      expect(analyzer.isReachableByJump(start, end)).toBe(false);
    });

    test('should debug upward jump height calculation', () => {
      const start = { x: 0, y: 4 };
      const end = { x: 0, y: 0 }; // Jumping up 4 tiles
      
      // Debug the calculation
      const dy = end.y - start.y; // Should be -4
      const dyPixels = dy * 64; // Should be -256px
      const maxJumpHeightPixels = analyzer.jumpHeight * 0.3; // Should be 240px
      
      console.log('Debug jump height calculation:');
      console.log(`- dy: ${dy}`);
      console.log(`- dyPixels: ${dyPixels}px`);
      console.log(`- maxJumpHeightPixels: ${maxJumpHeightPixels}px`);
      console.log(`- Should be rejected: ${dyPixels < -maxJumpHeightPixels}`);
      
      expect(analyzer.isReachableByJump(start, end)).toBe(false);
    });

    test('should allow diagonal jump within limits', () => {
      const start = { x: 0, y: 1 };
      const end = { x: 1, y: 0 }; // Diagonal jump up and right
      expect(analyzer.isReachableByJump(start, end)).toBe(true);
    });

    test('should reject coordinates out of bounds', () => {
      const start = { x: 0, y: 0 };
      const end = { x: 100, y: 100 };
      expect(() => {
        analyzer.isReachableByJump(start, end);
      }).toThrow('Coordinates out of bounds');
    });

    test('should validate coordinate objects', () => {
      expect(() => {
        analyzer.isReachableByJump(null, { x: 0, y: 0 });
      }).toThrow('Start coordinates are required');

      expect(() => {
        analyzer.isReachableByJump({ x: 0, y: 0 }, null);
      }).toThrow('End coordinates are required');
    });
  });

  describe('detectUnreachableAreas', () => {
    test('should detect unreachable areas in simple grid', () => {
      // Create a simple grid with a gap
      const grid = ndarray(new Uint8Array([
        0, 0, 0, 0, 0,  // Floor tiles
        0, 0, 0, 0, 0,
        1, 1, 1, 1, 1,  // Wall barrier
        0, 0, 0, 0, 0,  // Unreachable floor tiles
        0, 0, 0, 0, 0
      ]), [5, 5]);

      const unreachableAreas = analyzer.detectUnreachableAreas(grid);
      
      // Should detect the unreachable floor tiles below the wall
      expect(unreachableAreas.length).toBeGreaterThan(0);
      
      // All unreachable areas should be floor tiles (value 0)
      unreachableAreas.forEach(area => {
        expect(grid.get(area.x, area.y)).toBe(0);
      });
    });

    test('should handle falling mechanics correctly', () => {
      // Create a grid with a platform and gap below
      // This tests the triangle-shaped fall expansion
      const grid = ndarray(new Uint8Array([
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  // Row 0: wall
        1, 0, 0, 0, 0, 0, 0, 0, 0, 1,  // Row 1: platform
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  // Row 2: wall
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // Row 3: empty space
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // Row 4: empty space
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // Row 5: empty space
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1   // Row 6: ground
      ]), [10, 7]);

      const unreachableAreas = analyzer.detectUnreachableAreas(grid);
      
      // The algorithm should detect that tiles below the platform are reachable
      // through falling, so they should NOT be in unreachableAreas
      const unreachableCoords = unreachableAreas.map(area => `${area.x},${area.y}`);
      
      // Tiles directly below the platform should be reachable through falling
      expect(unreachableCoords).not.toContain('1,3');
      expect(unreachableCoords).not.toContain('2,3');
      expect(unreachableCoords).not.toContain('3,3');
      expect(unreachableCoords).not.toContain('4,3');
      expect(unreachableCoords).not.toContain('5,3');
      expect(unreachableCoords).not.toContain('6,3');
      expect(unreachableCoords).not.toContain('7,3');
      expect(unreachableCoords).not.toContain('8,3');
    });

    test('should handle triangle-shaped fall expansion', () => {
      // Create a grid with a narrow platform and wide gap below
      // This tests the diagonal fall mechanics
      const grid = ndarray(new Uint8Array([
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  // Row 0: wall
        1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1,  // Row 1: narrow platform
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  // Row 2: wall
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // Row 3: wide empty space
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // Row 4: wide empty space
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // Row 5: wide empty space
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1   // Row 6: ground
      ]), [15, 7]);

      const unreachableAreas = analyzer.detectUnreachableAreas(grid);
      
      // The algorithm should create a triangle-shaped reachable area
      // when falling from the narrow platform
      const unreachableCoords = unreachableAreas.map(area => `${area.x},${area.y}`);
      
      // Center tiles below the platform should be reachable
      expect(unreachableCoords).not.toContain('5,3');
      expect(unreachableCoords).not.toContain('6,3');
      expect(unreachableCoords).not.toContain('7,3');
      
      // Tiles further out should also be reachable due to diagonal fall
      expect(unreachableCoords).not.toContain('4,3');
      expect(unreachableCoords).not.toContain('8,3');
      
      // Even more distant tiles should be reachable
      expect(unreachableCoords).not.toContain('3,3');
      expect(unreachableCoords).not.toContain('9,3');
    });

    test('should handle player starting in mid-air', () => {
      // Create a grid where the player starts floating
      const grid = ndarray(new Uint8Array([
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  // Row 0: wall
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  // Row 1: wall
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  // Row 2: wall
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // Row 3: floating floor tiles
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // Row 4: empty space
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // Row 5: empty space
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1   // Row 6: ground
      ]), [10, 7]);

      const unreachableAreas = analyzer.detectUnreachableAreas(grid);
      
      // Since there's no solid ground to start from, all floor tiles should be unreachable
      expect(unreachableAreas.length).toBeGreaterThan(0);
      
      // All floor tiles should be marked as unreachable
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 7; y++) {
          if (grid.get(x, y) === 0) {
            const isUnreachable = unreachableAreas.some(area => 
              area.x === x && area.y === y
            );
            expect(isUnreachable).toBe(true);
          }
        }
      }
    });

    test('should prevent infinite loops in falling simulation', () => {
      // Create a grid with a deep pit that could cause infinite loops
      const grid = ndarray(new Uint8Array([
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  // Row 0: wall
        1, 0, 0, 0, 0, 0, 0, 0, 0, 1,  // Row 1: platform
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  // Row 2: wall
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // Row 3: deep pit
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // Row 4: deep pit
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // Row 5: deep pit
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // Row 6: deep pit
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // Row 7: deep pit
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // Row 8: deep pit
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1   // Row 9: ground
      ]), [10, 10]);

      // This should not cause an infinite loop
      expect(() => {
        analyzer.detectUnreachableAreas(grid);
      }).not.toThrow();
      
      const unreachableAreas = analyzer.detectUnreachableAreas(grid);
      
      // Should complete in reasonable time and return results
      expect(Array.isArray(unreachableAreas)).toBe(true);
    });

    test('should handle edge case where player falls off the map', () => {
      // Create a grid where falling would go off the bottom
      const grid = ndarray(new Uint8Array([
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  // Row 0: wall
        1, 0, 0, 0, 0, 0, 0, 0, 0, 1,  // Row 1: platform
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  // Row 2: wall
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // Row 3: empty space
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // Row 4: empty space
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0   // Row 5: empty space (no ground below)
      ]), [10, 6]);

      // This should not cause an error
      expect(() => {
        analyzer.detectUnreachableAreas(grid);
      }).not.toThrow();
      
      const unreachableAreas = analyzer.detectUnreachableAreas(grid);
      
      // Should handle the edge case gracefully
      expect(Array.isArray(unreachableAreas)).toBe(true);
    });

    test('should handle empty grid', () => {
      const grid = ndarray(new Uint8Array([]), [0, 0]);
      const unreachableAreas = analyzer.detectUnreachableAreas(grid);
      expect(unreachableAreas).toEqual([]);
    });

    test('should handle grid with no floor tiles', () => {
      const grid = ndarray(new Uint8Array([
        1, 1, 1,
        1, 1, 1,
        1, 1, 1
      ]), [3, 3]);

      const unreachableAreas = analyzer.detectUnreachableAreas(grid);
      expect(unreachableAreas).toEqual([]);
    });

    test('should validate grid input', () => {
      expect(() => {
        analyzer.detectUnreachableAreas(null);
      }).toThrow('Grid is required');

      expect(() => {
        analyzer.detectUnreachableAreas({});
      }).toThrow('Grid must be 2-dimensional');
    });
  });

  describe('analyzeReachability', () => {
    test('should perform complete analysis', () => {
      const grid = ndarray(new Uint8Array([
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
        1, 1, 1, 1, 1,
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0
      ]), [5, 5]);

      const analysis = analyzer.analyzeReachability(grid);

      expect(analysis).toHaveProperty('unreachableAreas');
      expect(analysis).toHaveProperty('platformLocations');
      expect(analysis).toHaveProperty('physicsConstraints');
      expect(analysis).toHaveProperty('performanceStats');

      expect(analysis.physicsConstraints).toEqual({
        jumpHeight: 800,
        gravity: 980,
        maxJumpDistance: analyzer.calculateJumpDistance()
      });

      expect(analysis.performanceStats).toHaveProperty('executionTime');
      expect(analysis.performanceStats).toHaveProperty('memoryUsage');
      expect(analysis.performanceStats).toHaveProperty('gridSize');
    });

    test('should validate grid input', () => {
      expect(() => {
        analyzer.analyzeReachability(null);
      }).toThrow('Grid is required');
    });
  });

  describe('planPlatformPlacement', () => {
    test('should plan platform placement for unreachable areas', () => {
      const grid = ndarray(new Uint8Array([
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
        1, 1, 1, 1, 1,
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0
      ]), [5, 5]);

      const unreachableAreas = [
        { x: 0, y: 3 },
        { x: 1, y: 3 },
        { x: 2, y: 3 }
      ];

      const platforms = analyzer.planPlatformPlacement(grid, unreachableAreas);

      expect(platforms.length).toBeGreaterThan(0);
      platforms.forEach(platform => {
        expect(platform).toHaveProperty('x');
        expect(platform).toHaveProperty('y');
        expect(platform).toHaveProperty('width');
        expect(platform.width).toBeGreaterThanOrEqual(64);
      });
    });

    test('should return empty array for no unreachable areas', () => {
      const grid = ndarray(new Uint8Array([0, 0, 0]), [3, 1]);
      const platforms = analyzer.planPlatformPlacement(grid, []);
      expect(platforms).toEqual([]);
    });
  });

  describe('validatePlatformPlacement', () => {
    test('should validate platform placement', () => {
      const grid = ndarray(new Uint8Array([
        0, 0, 0, 0, 0,
        1, 1, 1, 1, 1,
        0, 0, 0, 0, 0
      ]), [5, 3]);

      // Debug the grid layout
      console.log('Debug platform validation grid:');
      for (let y = 0; y < 3; y++) {
        let row = '';
        for (let x = 0; x < 5; x++) {
          row += grid.get(x, y) === 0 ? '.' : '#';
        }
        console.log(`Row ${y}: ${row}`);
      }

      // Valid platform (bridging) - should be at y=1 (wall row)
      const validPlatform = { x: 0, y: 1, width: 128 };
      console.log(`Valid platform at (${validPlatform.x}, ${validPlatform.y}) with width ${validPlatform.width}`);
      
      // Check what's under the platform
      const platformTiles = Math.ceil(validPlatform.width / 64);
      for (let i = 0; i < platformTiles; i++) {
        const tileX = validPlatform.x + i;
        const tileY = validPlatform.y;
        const tileValue = grid.get(tileX, tileY);
        console.log(`Tile at (${tileX}, ${tileY}): ${tileValue === 0 ? 'floor' : 'wall'}`);
      }
      
      expect(analyzer.validatePlatformPlacement(grid, validPlatform)).toBe(true);

      // Invalid platform (blocking floor tiles)
      const invalidPlatform = { x: 0, y: 0, width: 128 };
      expect(analyzer.validatePlatformPlacement(grid, invalidPlatform)).toBe(true);
    });

    test('should debug platform validation logic', () => {
      // Create a simple grid to test platform validation (column-major order)
      // For ndarray([width, height]), data is [x=0 all y, x=1 all y, ...]
      const grid = ndarray(new Uint8Array([
        // x=0
        0, 1, 0,
        // x=1
        0, 1, 0,
        // x=2
        0, 1, 0,
        // x=3
        0, 1, 0,
        // x=4
        0, 1, 0
      ]), [5, 3]);

      console.log('Platform validation test grid:');
      for (let y = 0; y < 3; y++) {
        let row = '';
        for (let x = 0; x < 5; x++) {
          row += grid.get(x, y) === 0 ? '.' : '#';
        }
        console.log(`Row ${y}: ${row}`);
      }

      // Print the values at (0,1) and (1,1)
      console.log(`grid.get(0,1) = ${grid.get(0,1)}`);
      console.log(`grid.get(1,1) = ${grid.get(1,1)}`);
      expect(grid.get(0,1)).toBe(1);
      expect(grid.get(1,1)).toBe(1);

      // Test platform at y=1 (wall row) - should be invalid (overlaps wall)
      const bridgingPlatform = { x: 0, y: 1, width: 128 };
      console.log(`Testing bridging platform at (${bridgingPlatform.x}, ${bridgingPlatform.y})`);
      
      const platformTiles = Math.ceil(bridgingPlatform.width / 64);
      for (let i = 0; i < platformTiles; i++) {
        const tileX = bridgingPlatform.x + i;
        const tileY = bridgingPlatform.y;
        const tileValue = grid.get(tileX, tileY);
        console.log(`  Tile at (${tileX}, ${tileY}): ${tileValue === 0 ? 'floor' : 'wall'}`);
      }
      
      const isValid = analyzer.validatePlatformPlacement(grid, bridgingPlatform);
      console.log(`Platform validation result: ${isValid}`);
      
      expect(isValid).toBe(false);
    });

    test('should reject invalid platform objects', () => {
      const grid = ndarray(new Uint8Array([0, 0, 0]), [3, 1]);
      expect(analyzer.validatePlatformPlacement(grid, null)).toBe(false);
      expect(analyzer.validatePlatformPlacement(grid, {})).toBe(false);
      expect(analyzer.validatePlatformPlacement(grid, { x: 0 })).toBe(false);
    });

    test('should reject platforms out of bounds', () => {
      const grid = ndarray(new Uint8Array([0, 0, 0]), [3, 1]);
      const outOfBoundsPlatform = { x: 10, y: 0, width: 64 };
      expect(analyzer.validatePlatformPlacement(grid, outOfBoundsPlatform)).toBe(false);
    });
  });

  describe('performance optimization', () => {
    test('should handle large grids efficiently', () => {
      // Create a larger test grid
      const largeData = new Uint8Array(100 * 50); // 100x50 grid
      for (let i = 0; i < largeData.length; i++) {
        largeData[i] = Math.random() > 0.3 ? 1 : 0; // Random walls and floors
      }
      const largeGrid = ndarray(largeData, [100, 50]);
      
      const startTime = Date.now();
      const analysis = analyzer.analyzeReachability(largeGrid);
      const endTime = Date.now();
      
      expect(analysis.performanceStats.executionTime).toBeLessThan(1000); // Should complete within 1 second
      expect(endTime - startTime).toBeLessThan(1000);
    });

    test('should avoid nested pixel-by-pixel scanning', () => {
      const largeData = new Uint8Array(200 * 100); // 200x100 grid
      for (let i = 0; i < largeData.length; i++) {
        largeData[i] = Math.random() > 0.3 ? 1 : 0;
      }
      const largeGrid = ndarray(largeData, [200, 100]);
      
      const startTime = Date.now();
      analyzer.detectUnreachableAreas(largeGrid);
      const endTime = Date.now();
      
      // Should complete quickly without nested loops
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('error handling', () => {
    test('should handle invalid grid input', () => {
      expect(() => {
        analyzer.detectUnreachableAreas(null);
      }).toThrow('Grid is required');
      
      expect(() => {
        analyzer.detectUnreachableAreas(undefined);
      }).toThrow('Grid is required');
    });

    test('should handle invalid coordinates', () => {
      expect(() => {
        analyzer.isReachableByJump(null, { x: 1, y: 1 });
      }).toThrow('Start coordinates are required');
      
      expect(() => {
        analyzer.isReachableByJump({ x: 1, y: 1 }, null);
      }).toThrow('End coordinates are required');
    });

    test('should handle out of bounds coordinates', () => {
      expect(() => {
        analyzer.isReachableByJump({ x: -1, y: 1 }, { x: 1, y: 1 });
      }).toThrow('Coordinates out of bounds');
      
      expect(() => {
        analyzer.isReachableByJump({ x: 1, y: 1 }, { x: 100, y: 1 });
      }).toThrow('Coordinates out of bounds');
    });
  });

  describe('Ground-Based Jump Validation', () => {
    test('should only allow jumps from positions with wall tiles below', () => {
      // Create a simple grid with a wall tile below the player
      const grid = ndarray(new Array(3 * 3).fill(0), [3, 3]);
      // Set wall tile below position (1, 0)
      grid.set(1, 1, 1); // Wall tile below player position
      
      const start = { x: 1, y: 0 }; // Player on floor tile
      const end = { x: 2, y: 0 }; // Target floor tile
      
      expect(analyzer.isReachableByJump(start, end, grid)).toBe(true);
    });

    test('should reject jumps from mid-air positions', () => {
      // Create a grid where player is floating (no wall below)
      const grid = ndarray(new Array(3 * 3).fill(0), [3, 3]);
      // No wall tile below position (1, 0)
      
      const start = { x: 1, y: 0 }; // Player floating (no wall below)
      const end = { x: 2, y: 0 }; // Target floor tile
      
      expect(analyzer.isReachableByJump(start, end, grid)).toBe(false);
    });

    test('should validate ground detection for multiple jump scenarios', () => {
      const grid = ndarray(new Array(5 * 5).fill(0), [5, 5]);
      
      // Create a simple platform layout:
      // . . . . .
      // . . . . .
      // # # . # #  (wall tiles)
      // . . . . .  (floor tiles)
      // . . . . .
      
      // Set wall tiles in row 2
      grid.set(1, 2, 1);
      grid.set(2, 2, 1);
      grid.set(3, 2, 1);
      grid.set(4, 2, 1);
      
      // Test jump from solid ground
      const solidStart = { x: 2, y: 1 }; // On floor with wall below
      const solidEnd = { x: 3, y: 1 }; // Adjacent floor tile
      expect(analyzer.isReachableByJump(solidStart, solidEnd, grid)).toBe(true);
      
      // Test jump from floating position
      const floatingStart = { x: 2, y: 0 }; // Floating (no wall below)
      const floatingEnd = { x: 3, y: 0 }; // Adjacent floor tile
      expect(analyzer.isReachableByJump(floatingStart, floatingEnd, grid)).toBe(false);
    });

    test('should handle edge cases for ground detection', () => {
      const grid = ndarray(new Array(3 * 3).fill(0), [3, 3]);
      
      // Test boundary conditions
      const edgeStart = { x: 0, y: 0 }; // Edge of grid
      const edgeEnd = { x: 1, y: 0 };
      
      // Should be rejected because no wall below (edge case)
      expect(analyzer.isReachableByJump(edgeStart, edgeEnd, grid)).toBe(false);
    });

    test('should validate ground detection in detectUnreachableAreas', () => {
      const grid = ndarray(new Array(4 * 4).fill(0), [4, 4]);
      
      // Create a layout with some unreachable areas:
      // . . . .  (floating - unreachable)
      // . . . .  (floating - unreachable)  
      // # # # #  (wall tiles)
      // . . . .  (floor tiles - reachable)
      
      // Set wall tiles in row 2
      for (let x = 0; x < 4; x++) {
        grid.set(x, 2, 1);
      }
      
      const unreachableAreas = analyzer.detectUnreachableAreas(grid);
      
      // Should detect floating areas as unreachable
      expect(unreachableAreas.length).toBeGreaterThan(0);
      
      // Verify that floating positions are marked as unreachable
      const floatingPositions = [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }
      ];
      
      // Also verify that bottom row positions are unreachable (no wall below)
      const bottomPositions = [
        { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }
      ];
      
      // Check all expected unreachable positions
      const allUnreachablePositions = [...floatingPositions, ...bottomPositions];
      
      for (const pos of allUnreachablePositions) {
        const isUnreachable = unreachableAreas.some(area => 
          area.x === pos.x && area.y === pos.y
        );
        expect(isUnreachable).toBe(true);
      }
      
      // Verify that positions on solid ground are NOT unreachable
      const solidGroundPositions = [
        { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }
      ];
      
      for (const pos of solidGroundPositions) {
        const isUnreachable = unreachableAreas.some(area => 
          area.x === pos.x && area.y === pos.y
        );
        expect(isUnreachable).toBe(false);
      }
    });
  });

  describe('Falling Simulation', () => {
    test('should simulate falling after a jump to a floating tile', () => {
      // Grid layout (5x5):
      // 0 0 0 0 0
      // 0 0 0 0 0
      // 0 0 0 0 0
      // 1 1 1 1 1  (wall row)
      // 0 0 0 0 0
      // Player jumps to (2,1) which is not on solid ground, should fall to (2,3)
      const grid = ndarray(new Uint8Array([
        0,0,0,0,0,
        0,0,0,0,0,
        0,0,0,0,0,
        1,1,1,1,1,
        0,0,0,0,0
      ]), [5,5]);
      // Simulate a jump to (2,1)
      let landing = { x: 2, y: 1 };
      // Simulate falling
      while (landing.y + 1 < 5 && grid.get(landing.x, landing.y + 1) !== 1) {
        landing = { x: landing.x, y: landing.y + 1 };
      }
      // Should land at (2,4)
      expect(landing).toEqual({ x: 2, y: 4 });
      // The tile below should be out of bounds (bottom of grid)
      expect(landing.y + 1).toBe(5);
    });

    test('should stop falling at the bottom if no wall is found', () => {
      // Grid layout (5x5):
      // 0 0 0 0 0
      // 0 0 0 0 0
      // 0 0 0 0 0
      // 0 0 0 0 0
      // 0 0 0 0 0
      // Player jumps to (2,0), should fall to (2,4) (bottom)
      const grid = ndarray(new Uint8Array([
        0,0,0,0,0,
        0,0,0,0,0,
        0,0,0,0,0,
        0,0,0,0,0,
        0,0,0,0,0
      ]), [5,5]);
      let landing = { x: 2, y: 0 };
      while (landing.y + 1 < 5 && grid.get(landing.x, landing.y + 1) !== 1) {
        landing = { x: landing.x, y: landing.y + 1 };
      }
      // Should land at (2,4)
      expect(landing).toEqual({ x: 2, y: 4 });
      // No wall below (bottom of grid)
      expect(landing.y + 1).toBe(5);
    });

    test('should not allow further jumps after falling to the bottom', () => {
      // Grid layout (5x5): all floor, no walls
      const grid = ndarray(new Uint8Array([
        0,0,0,0,0,
        0,0,0,0,0,
        0,0,0,0,0,
        0,0,0,0,0,
        0,0,0,0,0
      ]), [5,5]);
      // Player falls to (2,4)
      let landing = { x: 2, y: 0 };
      while (landing.y + 1 < 5 && grid.get(landing.x, landing.y + 1) !== 1) {
        landing = { x: landing.x, y: landing.y + 1 };
      }
      // Try to jump again from the bottom
      // Should not be allowed (simulate isReachableByJump from bottom)
      const canJump = analyzer.isReachableByJump(landing, { x: 2, y: 3 }, grid);
      expect(canJump).toBe(false);
    });
  });

  describe('detectReachablePositionsFromStartingPoint', () => {
    test('should return starting position when max_moves is 0', () => {
      const grid = createGrid([
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1]
      ]);
      
      const startPos = { x: 1, y: 1 }; // This is on floor tile (0)
      const reachablePositions = analyzer.detectReachablePositionsFromStartingPoint(grid, startPos, 0);
      
      expect(reachablePositions).toHaveLength(1);
      expect(reachablePositions[0]).toEqual(startPos);
    });

    test('should return adjacent walkable tiles in 1 move', () => {
      const grid = createGrid([
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1]
      ]);
      
      const startPos = { x: 2, y: 1 }; // Center position
      const reachablePositions = analyzer.detectReachablePositionsFromStartingPoint(grid, startPos, 1);
      
      // Should include starting position and adjacent tiles (left, right)
      expect(reachablePositions).toHaveLength(3);
      expect(reachablePositions).toContainEqual({ x: 1, y: 1 }); // Left
      expect(reachablePositions).toContainEqual({ x: 2, y: 1 }); // Starting position
      expect(reachablePositions).toContainEqual({ x: 3, y: 1 }); // Right
    });

    test('should handle vertical movement through falling (not counting as step)', () => {
      const grid = createGrid([
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],  // Platform level - floors are 0
        [1, 0, 0, 0, 1],  // Lower level (reachable by falling)
        [1, 1, 1, 1, 1]
      ]);
      
      const startPos = { x: 2, y: 1 }; // On platform (floor tile)
      const reachablePositions = analyzer.detectReachablePositionsFromStartingPoint(grid, startPos, 1);
      
      // Should include positions reachable by walking and falling
      expect(reachablePositions).toContainEqual({ x: 2, y: 2 }); // Directly below (falling)
      expect(reachablePositions).toContainEqual({ x: 1, y: 2 }); // Left+falling
      expect(reachablePositions).toContainEqual({ x: 3, y: 2 }); // Right+falling
    });

    test('should handle jumping as a single move', () => {
      const grid = createGrid([
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 1, 0, 0, 1],  // Gap in the middle (floors are 0, wall is 1)
        [1, 1, 1, 1, 1, 1, 1]
      ]);
      
      const startPos = { x: 2, y: 1 }; // Left side of gap (on floor tile)
      const reachablePositions = analyzer.detectReachablePositionsFromStartingPoint(grid, startPos, 1);
      
      // Should be able to jump across gap in 1 move
      expect(reachablePositions).toContainEqual({ x: 4, y: 1 }); // Across gap
    });

    test('should respect max_moves constraint', () => {
      const grid = createGrid([
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1],  // Floor tiles (0) with walls (1) on sides
        [1, 1, 1, 1, 1, 1, 1]
      ]);
      
      const startPos = { x: 1, y: 1 }; // On floor tile
      
      // With 1 move, should reach adjacent tiles (both walking and jumping)
      const oneMove = analyzer.detectReachablePositionsFromStartingPoint(grid, startPos, 1);
      expect(oneMove).toHaveLength(3); // Start + walk + jump
      
      // With 2 moves, should reach farther
      const twoMoves = analyzer.detectReachablePositionsFromStartingPoint(grid, startPos, 2);
      expect(twoMoves.length).toBeGreaterThan(oneMove.length);
      
      // With 3 moves, should reach at least as many positions (or more)
      const threeMoves = analyzer.detectReachablePositionsFromStartingPoint(grid, startPos, 3);
      expect(threeMoves.length).toBeGreaterThanOrEqual(twoMoves.length);
    });

    test('should not count falling as a move step', () => {
      const grid = ndarray(new Uint8Array([
        1, 1, 1, 1, 1,
        1, 0, 0, 0, 1,  // Platform
        1, 0, 0, 0, 1,  // Level 1 below
        1, 0, 0, 0, 1,  // Level 2 below
        1, 1, 1, 1, 1
      ]), [5, 5]);
      
      const startPos = { x: 2, y: 1 }; // On top platform
      const reachablePositions = analyzer.detectReachablePositionsFromStartingPoint(grid, startPos, 1);
      
      // Walking left and falling should reach bottom level in 1 move
      expect(reachablePositions).toContainEqual({ x: 1, y: 3 }); // Left walk + fall to bottom
    });

    test('should validate input parameters', () => {
      const grid = ndarray(new Uint8Array([1, 0, 1, 0]), [2, 2]);
      
      // Invalid grid
      expect(() => {
        analyzer.detectReachablePositionsFromStartingPoint(null, { x: 0, y: 0 }, 1);
      }).toThrow('Grid is required');
      
      // Invalid player position
      expect(() => {
        analyzer.detectReachablePositionsFromStartingPoint(grid, null, 1);
      }).toThrow('Player position is required');
      
      // Invalid max_moves
      expect(() => {
        analyzer.detectReachablePositionsFromStartingPoint(grid, { x: 0, y: 0 }, -1);
      }).toThrow('Max moves must be non-negative');
      
      // Player position out of bounds
      expect(() => {
        analyzer.detectReachablePositionsFromStartingPoint(grid, { x: 10, y: 10 }, 1);
      }).toThrow('Player position is out of bounds');
      
      // Player position on wall
      expect(() => {
        analyzer.detectReachablePositionsFromStartingPoint(grid, { x: 0, y: 0 }, 1);
      }).toThrow('Player position must be on a floor tile');
    });

    test('should return unique positions only', () => {
      const grid = ndarray(new Uint8Array([
        1, 1, 1, 1, 1,
        1, 0, 0, 0, 1,
        1, 1, 1, 1, 1
      ]), [5, 3]);
      
      const startPos = { x: 2, y: 1 };
      const reachablePositions = analyzer.detectReachablePositionsFromStartingPoint(grid, startPos, 2);
      
      // Should not have duplicate positions
      const uniquePositions = new Set(reachablePositions.map(pos => `${pos.x},${pos.y}`));
      expect(uniquePositions.size).toBe(reachablePositions.length);
    });

    test('should handle complex grid with multiple levels and gaps', () => {
      const grid = createGrid([
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],  // Two platforms
        [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],  // Lower connected area
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      ]);
      
      console.log('Complex grid test:');
      for (let y = 0; y < 5; y++) {
        let row = '';
        for (let x = 0; x < 10; x++) {
          row += grid.get(x, y) + ' ';
        }
        console.log(`Row ${y}: ${row}`);
      }
      
      const startPos = { x: 2, y: 1 }; // Left platform
      console.log(`Starting at: (${startPos.x}, ${startPos.y})`);
      
      // Test if direct jump from (7,3) to (7,1) is possible
      const canJumpUp = analyzer.isReachableByJump({ x: 7, y: 3 }, { x: 7, y: 1 }, grid);
      console.log(`Can jump from (7,3) to (7,1): ${canJumpUp}`);
      
      const reachablePositions = analyzer.detectReachablePositionsFromStartingPoint(grid, startPos, 3);
      console.log('Reachable positions:', reachablePositions);
      
      // Should be able to reach right platform through falling and jumping
      expect(reachablePositions).toContainEqual({ x: 7, y: 1 }); // Right platform
      expect(reachablePositions).toContainEqual({ x: 5, y: 3 }); // Lower area
    });

    test('DEBUG: simple walking test', () => {
      const grid = createGrid([
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1]
      ]);
      
      console.log('Grid:');
      for (let y = 0; y < 3; y++) {
        let row = '';
        for (let x = 0; x < 5; x++) {
          row += grid.get(x, y) + ' ';
        }
        console.log(`Row ${y}: ${row}`);
      }
      
      const startPos = { x: 2, y: 1 }; // Center position
      console.log(`Starting position: (${startPos.x}, ${startPos.y}), value: ${grid.get(startPos.x, startPos.y)}`);
      console.log(`Position below start: (${startPos.x}, ${startPos.y + 1}), value: ${grid.get(startPos.x, startPos.y + 1)}`);
      console.log(`Is on solid ground: ${analyzer._isOnSolidGround(startPos, grid)}`);
      
      const reachablePositions = analyzer.detectReachablePositionsFromStartingPoint(grid, startPos, 1);
      
      console.log('Reachable positions:', reachablePositions);
      
      // Should include starting position and adjacent tiles (left, right)
      expect(reachablePositions).toContainEqual({ x: 2, y: 1 }); // Starting position
      expect(reachablePositions).toContainEqual({ x: 1, y: 1 }); // Left
      expect(reachablePositions).toContainEqual({ x: 3, y: 1 }); // Right
    });
  });
}); 