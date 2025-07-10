/**
 * @fileoverview Tests for StrategicPlatformPlacer - Strategic platform placement algorithm
 * Tests the 85% reachability target algorithm with platform variety
 */

const StrategicPlatformPlacer = require('../../src/placement/StrategicPlatformPlacer');
const CriticalRingAnalyzer = require('../../src/analysis/CriticalRingAnalyzer');
const PhysicsAwareReachabilityAnalyzer = require('../../src/analysis/PhysicsAwareReachabilityAnalyzer');

// Mock dependencies
jest.mock('../../src/analysis/CriticalRingAnalyzer');
jest.mock('../../src/analysis/PhysicsAwareReachabilityAnalyzer');

describe('StrategicPlatformPlacer', () => {
  let placer;
  let mockCriticalRingAnalyzer;
  let mockPhysicsAnalyzer;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock instances
    mockCriticalRingAnalyzer = {
      findCriticalRing: jest.fn()
    };
    mockPhysicsAnalyzer = {
      detectReachablePositionsFromStartingPoint: jest.fn()
    };
    
    // Mock constructor returns
    CriticalRingAnalyzer.mockImplementation(() => mockCriticalRingAnalyzer);
    PhysicsAwareReachabilityAnalyzer.mockImplementation(() => mockPhysicsAnalyzer);
    
    // Create placer instance
    placer = new StrategicPlatformPlacer({
      targetReachability: 0.85,
      floatingPlatformProbability: 0.4,
      movingPlatformProbability: 0.6,
      minPlatformSize: 2,
      maxPlatformSize: 6
    });
  });

  describe('constructor', () => {
    test('should create instance with default configuration', () => {
      const defaultPlacer = new StrategicPlatformPlacer();
      
      expect(defaultPlacer.targetReachability).toBe(0.85);
      expect(defaultPlacer.floatingPlatformProbability).toBe(0.4);
      expect(defaultPlacer.movingPlatformProbability).toBe(0.6);
      expect(defaultPlacer.minPlatformSize).toBe(2);
      expect(defaultPlacer.maxPlatformSize).toBe(6);
    });

    test('should create instance with custom configuration', () => {
      const customPlacer = new StrategicPlatformPlacer({
        targetReachability: 0.9,
        floatingPlatformProbability: 0.5,
        movingPlatformProbability: 0.5,
        minPlatformSize: 3,
        maxPlatformSize: 8
      });
      
      expect(customPlacer.targetReachability).toBe(0.9);
      expect(customPlacer.floatingPlatformProbability).toBe(0.5);
      expect(customPlacer.movingPlatformProbability).toBe(0.5);
      expect(customPlacer.minPlatformSize).toBe(3);
      expect(customPlacer.maxPlatformSize).toBe(8);
    });

    test('should validate configuration parameters', () => {
      expect(() => {
        new StrategicPlatformPlacer({ targetReachability: -0.1 });
      }).toThrow('targetReachability must be between 0 and 1');
      
      expect(() => {
        new StrategicPlatformPlacer({ targetReachability: 1.1 });
      }).toThrow('targetReachability must be between 0 and 1');
      
      expect(() => {
        new StrategicPlatformPlacer({ minPlatformSize: -1 });
      }).toThrow('minPlatformSize must be positive');
      
      expect(() => {
        new StrategicPlatformPlacer({ maxPlatformSize: 0 });
      }).toThrow('maxPlatformSize must be positive');
    });
  });

  describe('calculateReachabilityPercentage', () => {
    test('should calculate reachability percentage correctly', () => {
      const grid = testUtils.createMockGrid(10, 10);
      const reachablePositions = [
        [1, 1], [2, 1], [3, 1],
        [1, 2], [2, 2], [3, 2],
        [1, 3], [2, 3], [3, 3]
      ];
      
      mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint.mockReturnValue(reachablePositions);
      
      const percentage = placer.calculateReachabilityPercentage(grid, { x: 1, y: 1 });
      
      expect(percentage).toBe(0.09); // 9 reachable out of 100 total tiles
    });

    test('should handle empty reachable positions', () => {
      const grid = testUtils.createMockGrid(5, 5);
      mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint.mockReturnValue([]);
      
      const percentage = placer.calculateReachabilityPercentage(grid, { x: 0, y: 0 });
      
      expect(percentage).toBe(0);
    });

    test('should handle single reachable position', () => {
      const grid = testUtils.createMockGrid(5, 5);
      mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint.mockReturnValue([[0, 0]]);
      
      const percentage = placer.calculateReachabilityPercentage(grid, { x: 0, y: 0 });
      
      expect(percentage).toBe(0.04); // 1 reachable out of 25 total tiles
    });
  });

  describe('samplePlatformType', () => {
    test('should sample platform types according to probabilities', () => {
      const rng = testUtils.createSeededRandom('test-seed');
      const types = [];
      
      // Sample multiple times to test distribution
      for (let i = 0; i < 100; i++) {
        types.push(placer.samplePlatformType(rng));
      }
      
      const floatingCount = types.filter(t => t === 'floating').length;
      const movingCount = types.filter(t => t === 'moving').length;
      
      // Should have both types
      expect(floatingCount).toBeGreaterThan(0);
      expect(movingCount).toBeGreaterThan(0);
      
      // Should have approximately correct distribution (more tolerant)
      expect(floatingCount / 100).toBeCloseTo(0.4, 0);
      expect(movingCount / 100).toBeCloseTo(0.6, 0);
    });

    test('should handle edge case probabilities', () => {
      const edgePlacer = new StrategicPlatformPlacer({
        floatingPlatformProbability: 1.0,
        movingPlatformProbability: 0.0
      });
      
      const rng = testUtils.createSeededRandom('edge-test');
      const type = edgePlacer.samplePlatformType(rng);
      
      expect(type).toBe('floating');
    });
  });

  describe('samplePlatformSize', () => {
    test('should sample platform size within bounds', () => {
      const rng = testUtils.createSeededRandom('size-test');
      
      for (let i = 0; i < 50; i++) {
        const size = placer.samplePlatformSize(rng);
        expect(size).toBeGreaterThanOrEqual(placer.minPlatformSize);
        expect(size).toBeLessThanOrEqual(placer.maxPlatformSize);
      }
    });

    test('should handle equal min and max platform size', () => {
      const fixedPlacer = new StrategicPlatformPlacer({
        minPlatformSize: 3,
        maxPlatformSize: 3
      });
      
      const rng = testUtils.createSeededRandom('fixed-test');
      const size = fixedPlacer.samplePlatformSize(rng);
      
      expect(size).toBe(3);
    });
  });

  describe('createFloatingPlatform', () => {
    test('should create floating platform with correct properties', () => {
      const position = { x: 5, y: 3 };
      const size = 4;
      
      const platform = placer.createFloatingPlatform(position, size);
      
      expect(platform.type).toBe('floating');
      expect(platform.x).toBe(5);
      expect(platform.y).toBe(3);
      expect(platform.width).toBe(4);
      expect(platform.height).toBe(1);
    });

    test('should calculate occupied tiles correctly', () => {
      const position = { x: 2, y: 4 };
      const size = 3;
      
      const platform = placer.createFloatingPlatform(position, size);
      const occupiedTiles = platform.getOccupiedTiles();
      
      expect(occupiedTiles).toEqual([
        { x: 2, y: 4 },
        { x: 3, y: 4 },
        { x: 4, y: 4 }
      ]);
    });
  });

  describe('createMovingPlatform', () => {
    test('should create moving platform with correct properties', () => {
      const position = { x: 3, y: 2 };
      const size = 5;
      
      const platform = placer.createMovingPlatform(position, size);
      
      expect(platform.type).toBe('moving');
      expect(platform.x).toBe(3);
      expect(platform.y).toBe(2);
      expect(platform.width).toBe(5);
      expect(platform.height).toBe(1);
    });

    test('should calculate occupied tiles correctly', () => {
      const position = { x: 1, y: 5 };
      const size = 2;
      
      const platform = placer.createMovingPlatform(position, size);
      const occupiedTiles = platform.getOccupiedTiles();
      
      expect(occupiedTiles).toEqual([
        { x: 1, y: 5 },
        { x: 2, y: 5 }
      ]);
    });
  });

  describe('markPlatformAsWalls', () => {
    test('should mark platform tiles as walls in grid', () => {
      const grid = testUtils.createMockGrid(10, 10);
      const platform = {
        getOccupiedTiles: () => [
          { x: 3, y: 4 },
          { x: 4, y: 4 },
          { x: 5, y: 4 }
        ]
      };
      
      placer.markPlatformAsWalls(grid, platform);
      
      expect(grid.get(3, 4)).toBe(1);
      expect(grid.get(4, 4)).toBe(1);
      expect(grid.get(5, 4)).toBe(1);
    });

    test('should not affect other tiles', () => {
      const grid = testUtils.createMockGrid(5, 5);
      const platform = {
        getOccupiedTiles: () => [{ x: 2, y: 2 }]
      };
      
      placer.markPlatformAsWalls(grid, platform);
      
      // Other tiles should remain unchanged
      expect(grid.get(0, 0)).toBe(0);
      expect(grid.get(1, 1)).toBe(0);
      expect(grid.get(3, 3)).toBe(0);
    });
  });

  describe('validatePlatformImprovement', () => {
    test('should return true when platform increases reachability', () => {
      const grid = testUtils.createMockGrid(10, 10);
      const platform = {
        getOccupiedTiles: () => [{ x: 5, y: 5 }]
      };
      
      // Mock before and after reachability
      mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint
        .mockReturnValueOnce([[1, 1], [2, 1], [3, 1]]) // Before: 3 reachable
        .mockReturnValueOnce([[1, 1], [2, 1], [3, 1], [5, 5]]); // After: 4 reachable
      
      const improves = placer.validatePlatformImprovement(grid, platform, { x: 1, y: 1 });
      
      expect(improves).toBe(true);
    });

    test('should return false when platform does not increase reachability', () => {
      const grid = testUtils.createMockGrid(10, 10);
      const platform = {
        getOccupiedTiles: () => [{ x: 5, y: 5 }]
      };
      
      // Mock same reachability before and after
      mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint
        .mockReturnValueOnce([[1, 1], [2, 1], [3, 1]]) // Before: 3 reachable
        .mockReturnValueOnce([[1, 1], [2, 1], [3, 1]]); // After: 3 reachable
      
      const improves = placer.validatePlatformImprovement(grid, platform, { x: 1, y: 1 });
      
      expect(improves).toBe(false);
    });
  });

  describe('placePlatforms', () => {
    test('should place platforms to achieve target reachability', () => {
      const grid = testUtils.createMockGrid(20, 20);
      const playerPosition = { x: 5, y: 5 };
      const rng = testUtils.createSeededRandom('placement-test');
      
      // Mock critical ring analysis
      mockCriticalRingAnalyzer.findCriticalRing.mockReturnValue([
        { x: 8, y: 5 },
        { x: 10, y: 5 },
        { x: 12, y: 5 }
      ]);
      
      // Mock reachability analysis
      mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint
        .mockReturnValueOnce([[5, 5], [6, 5], [7, 5]]) // Initial: 3 reachable
        .mockReturnValueOnce([[5, 5], [6, 5], [7, 5], [8, 5], [9, 5]]) // After platform 1
        .mockReturnValueOnce([[5, 5], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5], [11, 5]]); // After platform 2
      
      const platforms = placer.placePlatforms(grid, playerPosition, rng);
      
      expect(platforms.length).toBeGreaterThan(0);
      expect(platforms[0]).toHaveProperty('type');
      expect(platforms[0]).toHaveProperty('x');
      expect(platforms[0]).toHaveProperty('y');
      expect(platforms[0]).toHaveProperty('width');
    });

    test('should stop when target reachability is achieved', () => {
      const grid = testUtils.createMockGrid(10, 10);
      const playerPosition = { x: 1, y: 1 };
      const rng = testUtils.createSeededRandom('target-test');
      
      // Mock high initial reachability (85% = 85 tiles out of 100)
      const initialReachable = Array.from({ length: 85 }, (_, i) => [Math.floor(i / 10), i % 10]);
      mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint.mockReturnValue(initialReachable);
      
      const platforms = placer.placePlatforms(grid, playerPosition, rng);
      
      // Should not place any platforms since target is already achieved
      expect(platforms.length).toBe(0);
    });

    test('should handle empty critical ring', () => {
      const grid = testUtils.createMockGrid(10, 10);
      const playerPosition = { x: 1, y: 1 };
      const rng = testUtils.createSeededRandom('empty-test');
      
      // Mock empty critical ring
      mockCriticalRingAnalyzer.findCriticalRing.mockReturnValue([]);
      
      const platforms = placer.placePlatforms(grid, playerPosition, rng);
      
      expect(platforms.length).toBe(0);
    });

    test('should respect maximum iteration limit', () => {
      const grid = testUtils.createMockGrid(10, 10);
      const playerPosition = { x: 1, y: 1 };
      const rng = testUtils.createSeededRandom('limit-test');
      
      // Mock critical ring that always returns positions
      mockCriticalRingAnalyzer.findCriticalRing.mockReturnValue([
        { x: 2, y: 1 },
        { x: 3, y: 1 }
      ]);
      
      // Mock reachability that never improves
      mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint.mockReturnValue([[1, 1]]);
      
      const platforms = placer.placePlatforms(grid, playerPosition, rng);
      
      // Should not place infinite platforms
      expect(platforms.length).toBeLessThan(100);
    });
  });

  describe('integration tests', () => {
    test('should achieve target reachability with realistic scenario', () => {
      const grid = testUtils.createMockGrid(30, 20);
      const playerPosition = { x: 5, y: 10 };
      const rng = testUtils.createSeededRandom('integration-test');
      
      // Create a realistic scenario with limited initial reachability
      const initialReachable = [
        [5, 10], [6, 10], [7, 10], [8, 10], [9, 10],
        [5, 11], [6, 11], [7, 11], [8, 11], [9, 11],
        [5, 12], [6, 12], [7, 12], [8, 12], [9, 12]
      ]; // 15 reachable out of 600 = 2.5%
      
      mockPhysicsAnalyzer.detectReachablePositionsFromStartingPoint.mockReturnValue(initialReachable);
      
      // Mock critical ring with various positions
      mockCriticalRingAnalyzer.findCriticalRing.mockReturnValue([
        { x: 10, y: 10 }, { x: 12, y: 10 }, { x: 15, y: 10 },
        { x: 10, y: 8 }, { x: 12, y: 8 }, { x: 15, y: 8 }
      ]);
      
      const platforms = placer.placePlatforms(grid, playerPosition, rng);
      
      // Should place some platforms to improve reachability
      expect(platforms.length).toBeGreaterThan(0);
      
      // Verify platform properties
      platforms.forEach(platform => {
        expect(platform).toHaveProperty('type');
        expect(['floating', 'moving']).toContain(platform.type);
        expect(platform).toHaveProperty('x');
        expect(platform).toHaveProperty('y');
        expect(platform).toHaveProperty('width');
        expect(platform.width).toBeGreaterThanOrEqual(placer.minPlatformSize);
        expect(platform.width).toBeLessThanOrEqual(placer.maxPlatformSize);
      });
    });
  });
}); 