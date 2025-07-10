/**
 * @fileoverview Tests for ReachableFrontierAnalyzer module
 * Tests reachable frontier analysis for optimal platform placement
 */

const ReachableFrontierAnalyzer = require('../../src/analysis/ReachableFrontierAnalyzer');
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

// Mock PhysicsAwareReachabilityAnalyzer
jest.mock('../../src/analysis/PhysicsAwareReachabilityAnalyzer');

describe('ReachableFrontierAnalyzer', () => {
  let analyzer;
  let mockPhysicsAnalyzer;
  let mockGrid;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock PhysicsAwareReachabilityAnalyzer
    mockPhysicsAnalyzer = {
      detectReachablePositionsFromStartingPoint: jest.fn()
    };
    PhysicsAwareReachabilityAnalyzer.mockImplementation(() => mockPhysicsAnalyzer);
    
    analyzer = new ReachableFrontierAnalyzer();
    
    // Create a test grid
    mockGrid = createGrid([
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],  // Row 0: wall
      [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],  // Row 1: floor with gap
      [1, 0, 1, 0, 1, 1, 0, 1, 0, 1],  // Row 2: floor with obstacles
      [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],  // Row 3: floor with gap
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]   // Row 4: wall
    ]);
  });

  describe('constructor', () => {
    test('should create analyzer with default configuration', () => {
      expect(analyzer).toBeDefined();
      expect(analyzer.physicsAnalyzer).toBeDefined();
    });

    test('should create analyzer with custom configuration', () => {
      const customConfig = {
        jumpHeight: 600,
        gravity: 1200
      };
      const customAnalyzer = new ReachableFrontierAnalyzer(customConfig);
      expect(customAnalyzer).toBeDefined();
      expect(PhysicsAwareReachabilityAnalyzer).toHaveBeenCalledWith(customConfig);
    });
  });

  describe('calculateManhattanDistance', () => {
    test('should calculate correct Manhattan distance', () => {
      const playerPos = { x: 1, y: 1 };
      const tilePos = { x: 3, y: 2 };
      const distance = analyzer.calculateManhattanDistance(playerPos, tilePos);
      expect(distance).toBe(3); // |3-1| + |2-1| = 2 + 1 = 3
    });

    test('should handle zero distance', () => {
      const playerPos = { x: 2, y: 2 };
      const tilePos = { x: 2, y: 2 };
      const distance = analyzer.calculateManhattanDistance(playerPos, tilePos);
      expect(distance).toBe(0);
    });

    test('should handle negative coordinates', () => {
      const playerPos = { x: 0, y: 0 };
      const tilePos = { x: 5, y: 3 };
      const distance = analyzer.calculateManhattanDistance(playerPos, tilePos);
      expect(distance).toBe(8); // |5-0| + |3-0| = 5 + 3 = 8
    });
  });

  describe('getNeighboringTiles', () => {
    test('should return all valid neighboring tiles', () => {
      const tile = { x: 2, y: 2 };
      const neighbors = analyzer.getNeighboringTiles(tile, mockGrid);
      
      // Should return 4 neighbors (up, down, left, right)
      expect(neighbors).toHaveLength(4);
      
      // Check that all neighbors are within grid bounds
      neighbors.forEach(neighbor => {
        expect(neighbor.x).toBeGreaterThanOrEqual(0);
        expect(neighbor.x).toBeLessThan(mockGrid.shape[0]);
        expect(neighbor.y).toBeGreaterThanOrEqual(0);
        expect(neighbor.y).toBeLessThan(mockGrid.shape[1]);
      });
    });

    test('should handle edge tiles', () => {
      const edgeTile = { x: 0, y: 0 };
      const neighbors = analyzer.getNeighboringTiles(edgeTile, mockGrid);
      
      // Should only return valid neighbors (not out of bounds)
      neighbors.forEach(neighbor => {
        expect(neighbor.x).toBeGreaterThanOrEqual(0);
        expect(neighbor.y).toBeGreaterThanOrEqual(0);
        expect(neighbor.x).toBeLessThan(mockGrid.shape[0]);
        expect(neighbor.y).toBeLessThan(mockGrid.shape[1]);
      });
    });

    test('should handle corner tiles', () => {
      const cornerTile = { x: 9, y: 4 };
      const neighbors = analyzer.getNeighboringTiles(cornerTile, mockGrid);
      
      // Should only return valid neighbors
      neighbors.forEach(neighbor => {
        expect(neighbor.x).toBeGreaterThanOrEqual(0);
        expect(neighbor.y).toBeGreaterThanOrEqual(0);
        expect(neighbor.x).toBeLessThan(mockGrid.shape[0]);
        expect(neighbor.y).toBeLessThan(mockGrid.shape[1]);
      });
    });
  });

  describe('findReachableFrontier (NEW DEFINITION: neighbor non-reachable floor)', () => {
    test('DEBUG: should understand why frontier detection is failing', () => {
      // Grid with non-reachable floor tiles:
      // 1 1 1 1 1 1
      // 1 0 0 1 0 1
      // 1 0 0 0 1 1
      // 1 1 1 1 1 1
      const grid = createGrid([
        [1, 1, 1, 1, 1, 1],
        [1, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 1, 1],
        [1, 1, 1, 1, 1, 1]
      ]);
      const playerPos = { x: 1, y: 1 };
      const reachableTiles = [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 3, y: 1 } // Add this tile to reachable list
      ];
      mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint.mockReturnValue(reachableTiles);
      
      // Check grid values
      expect(grid.get(1, 1)).toBe(0); // Should be floor
      expect(grid.get(2, 1)).toBe(0); // Should be floor
      expect(grid.get(1, 2)).toBe(0); // Should be floor
      expect(grid.get(2, 2)).toBe(0); // Should be floor
      expect(grid.get(3, 2)).toBe(0); // Should be floor
      
      // Debug: check what the grid actually contains around (1,1)
      expect(grid.get(1, 0)).toBe(1); // Should be wall above
      expect(grid.get(0, 1)).toBe(1); // Should be wall to left
      expect(grid.get(2, 1)).toBe(0); // Should be floor to right
      expect(grid.get(1, 2)).toBe(0); // Should be floor below
      
      // Check neighbors of (1,1) - should have wall neighbors
      const neighbors11 = analyzer.getNeighboringTiles({ x: 1, y: 1 }, grid);
      expect(neighbors11).toHaveLength(4);
      
      // Debug: print what neighbors (1,1) actually has
      const neighborDetails = [];
      for (const neighbor of neighbors11) {
        const neighborValue = grid.get(neighbor.x, neighbor.y);
        const isReachable = reachableTiles.some(rt => rt.x === neighbor.x && rt.y === neighbor.y);
        neighborDetails.push({ x: neighbor.x, y: neighbor.y, value: neighborValue, isReachable });
      }
      
      // Check if (1,1) has any non-reachable floor neighbors
      let hasNonReachableFloorNeighbor = false;
      for (const neighbor of neighbors11) {
        const neighborValue = grid.get(neighbor.x, neighbor.y);
        const isReachable = reachableTiles.some(rt => rt.x === neighbor.x && rt.y === neighbor.y);
        if (neighborValue === 0 && !isReachable) {
          hasNonReachableFloorNeighbor = true;
          break;
        }
      }
      
      // Debug: show neighbor details
      expect(neighborDetails).toEqual(neighborDetails); // This will show the actual values
      
      // (1,1) should NOT be frontier because all its floor neighbors are reachable
      expect(hasNonReachableFloorNeighbor).toBe(false);
      expect(neighborDetails).toHaveLength(4); // Debug: show the actual neighbor details
      
      // Check tile (3,1) - this should be frontier because it has non-reachable floor neighbor (4,1)
      const neighbors31 = analyzer.getNeighboringTiles({ x: 3, y: 1 }, grid);
      const neighborDetails31 = [];
      for (const neighbor of neighbors31) {
        const neighborValue = grid.get(neighbor.x, neighbor.y);
        const isReachable = reachableTiles.some(rt => rt.x === neighbor.x && rt.y === neighbor.y);
        neighborDetails31.push({ x: neighbor.x, y: neighbor.y, value: neighborValue, isReachable });
      }
      
      let hasNonReachableFloorNeighbor31 = false;
      for (const neighbor of neighbors31) {
        const neighborValue = grid.get(neighbor.x, neighbor.y);
        const isReachable = reachableTiles.some(rt => rt.x === neighbor.x && rt.y === neighbor.y);
        if (neighborValue === 0 && !isReachable) {
          hasNonReachableFloorNeighbor31 = true;
          break;
        }
      }
      
      // Debug: show neighbor details for (3,1)
      expect(neighborDetails31).toEqual(neighborDetails31); // This will show the actual values
      expect(hasNonReachableFloorNeighbor31).toBe(true);
      
      const frontier = analyzer.findReachableFrontier(playerPos, grid);
      expect(frontier.length).toBeGreaterThan(0);
    });

    test('should mark as frontier any reachable tile with at least one non-reachable floor neighbor', () => {
      // Grid:
      // 1 1 1 1 1
      // 1 0 0 1 1
      // 1 0 0 0 1
      // 1 1 1 1 1
      // Reachable: (1,1), (2,1), (1,2), (2,2), (3,2)
      // Only (2,2) is fully surrounded by reachable, others have at least one non-reachable floor neighbor
      const grid = createGrid([
        [1, 1, 1, 1, 1],
        [1, 0, 0, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1]
      ]);
      const playerPos = { x: 1, y: 1 };
      const reachableTiles = [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 }
      ];
      mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint.mockReturnValue(reachableTiles);
      // Under new definition:
      // (1,1): neighbor (1,0) is wall, (1,2) is reachable, (0,1) is wall, (2,1) is reachable
      // (2,1): neighbor (2,0) is wall, (2,2) is reachable, (1,1) is reachable, (3,1) is wall
      // (1,2): neighbor (1,1) is reachable, (1,3) is wall, (0,2) is wall, (2,2) is reachable
      // (2,2): neighbor (2,1) is reachable, (2,3) is wall, (1,2) is reachable, (3,2) is reachable
      // (3,2): neighbor (3,1) is wall, (3,3) is wall, (2,2) is reachable, (4,2) is wall
      // So (1,1), (2,1), (1,2), (3,2) should be frontier, (2,2) should NOT
      const frontier = analyzer.findReachableFrontier(playerPos, grid);
      expect(frontier).toContainEqual({ x: 1, y: 1 });
      expect(frontier).toContainEqual({ x: 2, y: 1 });
      expect(frontier).toContainEqual({ x: 1, y: 2 });
      expect(frontier).toContainEqual({ x: 3, y: 2 });
      expect(frontier).not.toContainEqual({ x: 2, y: 2 });
    });

    test('should not mark as frontier if all neighbors are reachable or walls', () => {
      // Grid:
      // 1 1 1
      // 1 0 1
      // 1 1 1
      // Only one reachable tile, all neighbors are walls
      const grid = createGrid([
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1]
      ]);
      const playerPos = { x: 1, y: 1 };
      const reachableTiles = [{ x: 1, y: 1 }];
      mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint.mockReturnValue(reachableTiles);
      const frontier = analyzer.findReachableFrontier(playerPos, grid);
      // Should be frontier, since all neighbors are walls (no non-reachable floor neighbor)
      expect(frontier).not.toContainEqual({ x: 1, y: 1 });
    });

    test('should mark edge reachable tiles as frontier if adjacent to non-reachable floor', () => {
      // Grid:
      // 1 1 1 1
      // 1 0 0 1
      // 1 0 1 1
      // 1 0 0 1
      // 1 1 1 1
      // Reachable: (1,1), (2,1), (1,2), (1,3), (2,3)
      // (2,1) is adjacent to (2,2) which is wall, but (2,2) is not a floor, so only (1,3), (2,3) are adjacent to non-reachable floor
      const grid = createGrid([
        [1, 1, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 1, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 1]
      ]);
      const playerPos = { x: 1, y: 1 };
      const reachableTiles = [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 2, y: 3 }
      ];
      mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint.mockReturnValue(reachableTiles);
      const frontier = analyzer.findReachableFrontier(playerPos, grid);
      // (1,3) and (2,3) are adjacent to (2,2) which is wall, but not a floor, so only (1,3) and (2,3) are adjacent to non-reachable floor
      expect(frontier).toContainEqual({ x: 1, y: 3 });
      expect(frontier).toContainEqual({ x: 2, y: 3 });
    });
  });

  describe('performance optimization', () => {
    test('should handle large grids efficiently', () => {
      const playerPos = { x: 50, y: 50 };
      
      // Create a large set of reachable tiles
      const reachableTiles = [];
      for (let x = 40; x < 60; x++) {
        for (let y = 40; y < 60; y++) {
          reachableTiles.push({ x, y });
        }
      }
      
      mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint.mockReturnValue(reachableTiles);
      
      const startTime = Date.now();
      const frontier = analyzer.findReachableFrontier(playerPos, mockGrid);
      const endTime = Date.now();
      
      // Should complete within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      
      // Should identify frontier tiles
      expect(frontier.length).toBeGreaterThan(0);
    });

    test('should avoid nested loops scanning pixel by pixel', () => {
      const playerPos = { x: 1, y: 1 };
      const reachableTiles = [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 }
      ];
      
      mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint.mockReturnValue(reachableTiles);
      
      // Spy on the method to ensure it's not doing pixel-by-pixel scanning
      const spy = jest.spyOn(analyzer, 'getNeighboringTiles');
      
      analyzer.findReachableFrontier(playerPos, mockGrid);
      
      // Should only call getNeighboringTiles for reachable tiles, not entire grid
      expect(spy).toHaveBeenCalledTimes(3); // Once for each reachable tile
      
      spy.mockRestore();
    });
  });

  describe('error handling', () => {
    test('should handle invalid player position', () => {
      expect(() => {
        analyzer.findReachableFrontier(null, mockGrid);
      }).toThrow('Player position is required');
      
      expect(() => {
        analyzer.findReachableFrontier({ x: 1 }, mockGrid);
      }).toThrow('Player position must have x and y coordinates');
    });

    test('should handle invalid grid', () => {
      const playerPos = { x: 1, y: 1 };
      
      expect(() => {
        analyzer.findReachableFrontier(playerPos, null);
      }).toThrow('Grid is required');
    });

    test('should handle physics analyzer errors', () => {
      const playerPos = { x: 1, y: 1 };
      
      mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint.mockImplementation(() => {
        throw new Error('Physics analysis failed');
      });
      
      expect(() => {
        analyzer.findReachableFrontier(playerPos, mockGrid);
      }).toThrow('Physics analysis failed');
    });
  });

  describe('integration with PhysicsAwareReachabilityAnalyzer', () => {
    test('should use physics analyzer for reachability detection', () => {
      const playerPos = { x: 1, y: 1 };
      const reachableTiles = [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 }
      ];
      
      mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint.mockReturnValue(reachableTiles);
      
      analyzer.findReachableFrontier(playerPos, mockGrid);
      
      expect(mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint).toHaveBeenCalledWith(
        mockGrid,
        playerPos,
        null // maxMoves = null for unlimited exploration
      );
    });
  });
}); 