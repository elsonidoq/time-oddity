/**
 * @fileoverview Tests for CriticalRingAnalyzer module
 * Tests critical ring analysis for optimal platform placement
 */

const CriticalRingAnalyzer = require('../../src/analysis/CriticalRingAnalyzer');
const ReachableFrontierAnalyzer = require('../../src/analysis/ReachableFrontierAnalyzer');
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

// Mock ReachableFrontierAnalyzer
jest.mock('../../src/analysis/ReachableFrontierAnalyzer');

describe('CriticalRingAnalyzer', () => {
  let analyzer;
  let mockFrontierAnalyzer;
  let mockGrid;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock ReachableFrontierAnalyzer with nested physics analyzer
    mockFrontierAnalyzer = {
      findReachableFrontier: jest.fn(),
      physicsAnalyzer: {
        detectReachablePositionsFromStartingPoint: jest.fn()
      }
    };
    ReachableFrontierAnalyzer.mockImplementation(() => mockFrontierAnalyzer);
    
    analyzer = new CriticalRingAnalyzer();
    
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
      expect(analyzer.frontierAnalyzer).toBeDefined();
    });

    test('should create analyzer with custom configuration', () => {
      const customConfig = {
        jumpHeight: 600,
        gravity: 1200
      };
      const customAnalyzer = new CriticalRingAnalyzer(customConfig);
      expect(customAnalyzer).toBeDefined();
      expect(ReachableFrontierAnalyzer).toHaveBeenCalledWith(customConfig);
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

  describe('findCriticalRing', () => {
    test('should find critical ring tiles with frontier neighbors', () => {
      const playerPosition = { x: 1, y: 1 };
      
      // Mock reachable tiles (all floor tiles in the area)
      const reachableTiles = [
        { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
        { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 },
        { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }
      ];
      
      // Mock frontier tiles (tiles with non-reachable floor neighbors)
      const frontierTiles = [
        { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 } // Right edge tiles
      ];
      
      mockFrontierAnalyzer.findReachableFrontier.mockReturnValue(frontierTiles);
      mockFrontierAnalyzer.physicsAnalyzer.detectReachablePositionsFromStartingPoint.mockReturnValue(reachableTiles);
      
      const criticalRing = analyzer.findCriticalRing(playerPosition, mockGrid);
      
      // Critical ring should contain tiles that have frontier neighbors
      // In this case, tiles at x=2 should be in critical ring (they neighbor frontier at x=3)
      expect(criticalRing).toContainEqual({ x: 2, y: 1 });
      expect(criticalRing).toContainEqual({ x: 2, y: 2 });
      expect(criticalRing).toContainEqual({ x: 2, y: 3 });
      
      // Tiles at x=1 should not be in critical ring (they don't neighbor frontier)
      expect(criticalRing).not.toContainEqual({ x: 1, y: 1 });
      expect(criticalRing).not.toContainEqual({ x: 1, y: 2 });
      expect(criticalRing).not.toContainEqual({ x: 1, y: 3 });
    });

    test('should handle empty frontier', () => {
      const playerPosition = { x: 1, y: 1 };
      mockFrontierAnalyzer.findReachableFrontier.mockReturnValue([]);
      
      const criticalRing = analyzer.findCriticalRing(playerPosition, mockGrid);
      
      expect(criticalRing).toEqual([]);
    });

    test('should handle isolated frontier tiles', () => {
      const playerPosition = { x: 1, y: 1 };
      
      // Mock reachable tiles including the isolated area
      const reachableTiles = [
        { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
        { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 },
        { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 },
        { x: 5, y: 1 }, { x: 5, y: 3 }, // Add these to reachable tiles
        { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }
      ];
      
      // Mock frontier with isolated tiles
      const frontierTiles = [
        { x: 5, y: 2 } // Isolated frontier tile
      ];
      
      mockFrontierAnalyzer.findReachableFrontier.mockReturnValue(frontierTiles);
      mockFrontierAnalyzer.physicsAnalyzer.detectReachablePositionsFromStartingPoint.mockReturnValue(reachableTiles);
      
      const criticalRing = analyzer.findCriticalRing(playerPosition, mockGrid);
      
      // Should find tiles that neighbor the isolated frontier tile
      expect(criticalRing).toContainEqual({ x: 4, y: 2 });
      expect(criticalRing).toContainEqual({ x: 6, y: 2 });
      expect(criticalRing).toContainEqual({ x: 5, y: 1 });
      expect(criticalRing).toContainEqual({ x: 5, y: 3 });
    });

    test('should validate input parameters', () => {
      // Test missing player position
      expect(() => {
        analyzer.findCriticalRing(null, mockGrid);
      }).toThrow('Player position is required');
      
      // Test invalid player position
      expect(() => {
        analyzer.findCriticalRing({}, mockGrid);
      }).toThrow('Player position must have x and y coordinates');
      
      // Test missing grid
      expect(() => {
        analyzer.findCriticalRing({ x: 1, y: 1 }, null);
      }).toThrow('Grid is required');
    });

    test('should handle complex frontier patterns', () => {
      const playerPosition = { x: 1, y: 1 };
      
      // Mock reachable tiles for complex pattern
      const reachableTiles = [
        { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
        { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 },
        { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }
      ];
      
      // Mock complex frontier pattern
      const frontierTiles = [
        { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
        { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }
      ];
      
      mockFrontierAnalyzer.findReachableFrontier.mockReturnValue(frontierTiles);
      mockFrontierAnalyzer.physicsAnalyzer.detectReachablePositionsFromStartingPoint.mockReturnValue(reachableTiles);
      
      const criticalRing = analyzer.findCriticalRing(playerPosition, mockGrid);
      
      // Should find tiles that neighbor any frontier tile
      expect(criticalRing).toContainEqual({ x: 2, y: 1 });
      expect(criticalRing).toContainEqual({ x: 2, y: 2 });
      expect(criticalRing).toContainEqual({ x: 1, y: 2 });
      expect(criticalRing).toContainEqual({ x: 2, y: 2 });
    });

    test('should handle edge case with single reachable tile', () => {
      const playerPosition = { x: 1, y: 1 };
      
      // Mock single reachable tile that is also frontier
      const reachableTiles = [
        { x: 1, y: 1 }
      ];
      
      const frontierTiles = [
        { x: 1, y: 1 }
      ];
      
      mockFrontierAnalyzer.findReachableFrontier.mockReturnValue(frontierTiles);
      mockFrontierAnalyzer.physicsAnalyzer.detectReachablePositionsFromStartingPoint.mockReturnValue(reachableTiles);
      
      const criticalRing = analyzer.findCriticalRing(playerPosition, mockGrid);
      
      // Should return empty array since the single tile has no neighbors in reachable area
      expect(criticalRing).toEqual([]);
    });
  });

  describe('integration with frontier analyzer', () => {
    test('should call frontier analyzer with correct parameters', () => {
      const playerPosition = { x: 1, y: 1 };
      mockFrontierAnalyzer.findReachableFrontier.mockReturnValue([]);
      
      analyzer.findCriticalRing(playerPosition, mockGrid);
      
      expect(mockFrontierAnalyzer.findReachableFrontier).toHaveBeenCalledWith(
        playerPosition,
        mockGrid
      );
    });
  });
}); 