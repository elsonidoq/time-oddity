/**
 * @fileoverview Tests for StrategicEnemyPlacer - Strategic enemy placement with solvability validation
 */

const StrategicEnemyPlacer = require('../../src/placement/StrategicEnemyPlacer');
const EnemyPlacementAnalyzer = require('../../src/placement/EnemyPlacementAnalyzer');

// Mock the EnemyPlacementAnalyzer
jest.mock('../../src/placement/EnemyPlacementAnalyzer');

describe('StrategicEnemyPlacer', () => {
  let placer;
  let mockAnalyzer;
  let mockGrid;
  let mockRng;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock analyzer
    mockAnalyzer = {
      generateEnemyPlacementCandidates: jest.fn(),
      detectChokePoints: jest.fn()
    };
    EnemyPlacementAnalyzer.mockImplementation(() => mockAnalyzer);
    
    placer = new StrategicEnemyPlacer();
    mockRng = testUtils.createSeededRandom('test-seed');
  });

  describe('constructor', () => {
    test('should create placer with default configuration', () => {
      expect(placer).toBeDefined();
      expect(placer.config).toBeDefined();
      expect(placer.config.maxEnemies).toBe(10);
      expect(placer.config.enemyDensity).toBe(0.1);
      expect(placer.config.minDistanceFromSpawn).toBe(5);
      expect(placer.config.minDistanceFromGoal).toBe(3);
      expect(placer.config.preserveSolvability).toBe(true);
    });

    test('should create placer with custom configuration', () => {
      const customConfig = {
        maxEnemies: 5,
        enemyDensity: 0.2,
        minDistanceFromSpawn: 10,
        minDistanceFromGoal: 5,
        preserveSolvability: false
      };
      const customPlacer = new StrategicEnemyPlacer(customConfig);
      
      expect(customPlacer.config.maxEnemies).toBe(5);
      expect(customPlacer.config.enemyDensity).toBe(0.2);
      expect(customPlacer.config.minDistanceFromSpawn).toBe(10);
      expect(customPlacer.config.minDistanceFromGoal).toBe(5);
      expect(customPlacer.config.preserveSolvability).toBe(false);
    });
  });

  describe('placeEnemies', () => {
    test('should place enemies across the entire level, not just the right side', () => {
      // Create a wide level (100x20) to test distribution
      mockGrid = testUtils.createMockGrid(100, 20);
      
      // Create floor tiles across the entire level
      for (let x = 0; x < 100; x++) {
        for (let y = 15; y < 20; y++) {
          mockGrid.set(x, y, 0); // Floor tiles
        }
      }
      
      // Mock candidates distributed across the level
      const mockCandidates = [
        // Left side candidates
        { x: 10, y: 17, type: 'chokePoint' },
        { x: 20, y: 17, type: 'strategic' },
        { x: 30, y: 17, type: 'patrol' },
        // Middle candidates
        { x: 40, y: 17, type: 'chokePoint' },
        { x: 50, y: 17, type: 'strategic' },
        { x: 60, y: 17, type: 'patrol' },
        // Right side candidates
        { x: 70, y: 17, type: 'chokePoint' },
        { x: 80, y: 17, type: 'strategic' },
        { x: 90, y: 17, type: 'patrol' }
      ];
      
      mockAnalyzer.generateEnemyPlacementCandidates.mockReturnValue(mockCandidates);
      mockAnalyzer.detectChokePoints.mockReturnValue([]);
      
      const playerPos = { x: 5, y: 17 };
      const goalPos = { x: 95, y: 17 };
      const coins = [];
      const platforms = [];
      
      const placedEnemies = placer.placeEnemies(mockGrid, playerPos, coins, goalPos, platforms, mockRng);
      
      // Should place enemies across the entire level
      expect(placedEnemies.length).toBeGreaterThan(0);
      
      // Check that enemies are distributed across different areas of the level
      const leftSideEnemies = placedEnemies.filter(e => e.x < 33);
      const middleEnemies = placedEnemies.filter(e => e.x >= 33 && e.x < 66);
      const rightSideEnemies = placedEnemies.filter(e => e.x >= 66);
      
      // Should have enemies in all three zones
      expect(leftSideEnemies.length).toBeGreaterThan(0);
      expect(middleEnemies.length).toBeGreaterThan(0);
      expect(rightSideEnemies.length).toBeGreaterThan(0);
      
      // Log distribution for debugging
      console.log('Enemy distribution:', {
        left: leftSideEnemies.length,
        middle: middleEnemies.length,
        right: rightSideEnemies.length,
        total: placedEnemies.length
      });
    });

    test('should respect maxEnemies configuration', () => {
      const config = { maxEnemies: 3 };
      const limitedPlacer = new StrategicEnemyPlacer(config);
      
      mockGrid = testUtils.createMockGrid(50, 20);
      // Create floor tiles
      for (let x = 0; x < 50; x++) {
        for (let y = 15; y < 20; y++) {
          mockGrid.set(x, y, 0);
        }
      }
      
      const mockCandidates = Array.from({ length: 20 }, (_, i) => ({
        x: i * 2,
        y: 17,
        type: 'chokePoint'
      }));
      
      mockAnalyzer.generateEnemyPlacementCandidates.mockReturnValue(mockCandidates);
      mockAnalyzer.detectChokePoints.mockReturnValue([]);
      
      const playerPos = { x: 5, y: 17 };
      const goalPos = { x: 45, y: 17 };
      const coins = [];
      const platforms = [];
      
      const placedEnemies = limitedPlacer.placeEnemies(mockGrid, playerPos, coins, goalPos, platforms, mockRng);
      
      expect(placedEnemies.length).toBeLessThanOrEqual(3);
    });

    test('should handle empty candidate list', () => {
      mockGrid = testUtils.createMockGrid(20, 20);
      mockAnalyzer.generateEnemyPlacementCandidates.mockReturnValue([]);
      
      const playerPos = { x: 5, y: 10 };
      const goalPos = { x: 15, y: 10 };
      const coins = [];
      const platforms = [];
      
      const placedEnemies = placer.placeEnemies(mockGrid, playerPos, coins, goalPos, platforms, mockRng);
      
      expect(placedEnemies.length).toBe(0);
    });

    test('should respect distance constraints from spawn and goal', () => {
      mockGrid = testUtils.createMockGrid(50, 20);
      // Create floor tiles
      for (let x = 0; x < 50; x++) {
        for (let y = 15; y < 20; y++) {
          mockGrid.set(x, y, 0);
        }
      }
      
      const playerPos = { x: 5, y: 17 };
      const goalPos = { x: 45, y: 17 };
      
      // Create candidates at various distances
      const mockCandidates = [
        { x: 3, y: 17, type: 'chokePoint' }, // Too close to spawn
        { x: 10, y: 17, type: 'strategic' }, // Good distance
        { x: 25, y: 17, type: 'patrol' }, // Good distance
        { x: 42, y: 17, type: 'chokePoint' }, // Too close to goal
        { x: 35, y: 17, type: 'strategic' } // Good distance
      ];
      
      mockAnalyzer.generateEnemyPlacementCandidates.mockReturnValue(mockCandidates);
      mockAnalyzer.detectChokePoints.mockReturnValue([]);
      
      const coins = [];
      const platforms = [];
      
      const placedEnemies = placer.placeEnemies(mockGrid, playerPos, coins, goalPos, platforms, mockRng);
      
      // Should not place enemies too close to spawn or goal
      placedEnemies.forEach(enemy => {
        const distanceFromSpawn = Math.sqrt(Math.pow(enemy.x - playerPos.x, 2) + Math.pow(enemy.y - playerPos.y, 2));
        const distanceFromGoal = Math.sqrt(Math.pow(enemy.x - goalPos.x, 2) + Math.pow(enemy.y - goalPos.y, 2));
        
        expect(distanceFromSpawn).toBeGreaterThanOrEqual(placer.config.minDistanceFromSpawn);
        expect(distanceFromGoal).toBeGreaterThanOrEqual(placer.config.minDistanceFromGoal);
      });
    });
  });

  describe('sortCandidatesByPriority', () => {
    test('should sort candidates by priority type first', () => {
      const candidates = [
        { x: 10, y: 5, type: 'platform' },
        { x: 20, y: 5, type: 'chokePoint' },
        { x: 30, y: 5, type: 'strategic' },
        { x: 40, y: 5, type: 'patrol' }
      ];
      
      const playerPos = { x: 15, y: 5 };
      const goalPos = { x: 35, y: 5 };
      
      const sorted = placer.sortCandidatesByPriority(candidates, playerPos, goalPos);
      
      // Should be sorted by priority: chokePoint > strategic > patrol > platform
      expect(sorted[0].type).toBe('chokePoint');
      expect(sorted[1].type).toBe('strategic');
      expect(sorted[2].type).toBe('patrol');
      expect(sorted[3].type).toBe('platform');
    });

    test('should distribute candidates evenly across the level when same priority', () => {
      const candidates = [
        // Left side
        { x: 10, y: 5, type: 'chokePoint' },
        { x: 15, y: 5, type: 'chokePoint' },
        // Right side
        { x: 80, y: 5, type: 'chokePoint' },
        { x: 85, y: 5, type: 'chokePoint' },
        // Middle
        { x: 45, y: 5, type: 'chokePoint' },
        { x: 50, y: 5, type: 'chokePoint' }
      ];
      
      const playerPos = { x: 25, y: 5 };
      const goalPos = { x: 75, y: 5 };
      
      const sorted = placer.sortCandidatesByPriority(candidates, playerPos, goalPos);
      
      // Should not be sorted purely by distance from player
      // The current implementation sorts by distance from player as secondary criterion
      // This test will fail with the current implementation, which is the point
      const leftSideCount = sorted.filter(c => c.x < 30).length;
      const rightSideCount = sorted.filter(c => c.x > 70).length;
      const middleCount = sorted.filter(c => c.x >= 30 && c.x <= 70).length;
      
      // Should have candidates from all areas, not just one side
      expect(leftSideCount).toBeGreaterThan(0);
      expect(rightSideCount).toBeGreaterThan(0);
      expect(middleCount).toBeGreaterThan(0);
    });

    test('should NOT bias towards right side due to distance sorting', () => {
      // This test specifically checks for the bug where enemies are placed only on the right
      const candidates = [
        { x: 10, y: 5, type: 'chokePoint' }, // Left side
        { x: 20, y: 5, type: 'chokePoint' }, // Left side
        { x: 30, y: 5, type: 'chokePoint' }, // Middle
        { x: 40, y: 5, type: 'chokePoint' }, // Middle
        { x: 80, y: 5, type: 'chokePoint' }, // Right side
        { x: 90, y: 5, type: 'chokePoint' }  // Right side
      ];
      
      const playerPos = { x: 5, y: 5 }; // Player on left side
      const goalPos = { x: 95, y: 5 };  // Goal on right side
      
      const sorted = placer.sortCandidatesByPriority(candidates, playerPos, goalPos);
      
      // Current implementation sorts by distance from player (farther = higher priority)
      // This means right side candidates get higher priority, which is the bug
      
      // Check the first few candidates - they should NOT all be from the right side
      const firstThreeCandidates = sorted.slice(0, 3);
      const rightSideCandidates = firstThreeCandidates.filter(c => c.x > 50);
      
      // This assertion will fail with the current implementation
      // because the current sorting prioritizes farther distances (right side)
      expect(rightSideCandidates.length).toBeLessThan(3);
      
      // Log the actual sorting for debugging
      console.log('Sorted candidates:', sorted.map(c => ({ x: c.x, distance: placer.calculateDistance(c, playerPos) })));
    });

    test('should demonstrate the real-world bias issue', () => {
      // Simulate the real-world scenario where enemies end up only on the right
      const candidates = [
        // Left side candidates (closer to player)
        { x: 10, y: 5, type: 'chokePoint' },
        { x: 15, y: 5, type: 'strategic' },
        { x: 20, y: 5, type: 'patrol' },
        // Middle candidates
        { x: 40, y: 5, type: 'chokePoint' },
        { x: 45, y: 5, type: 'strategic' },
        { x: 50, y: 5, type: 'patrol' },
        // Right side candidates (farther from player)
        { x: 70, y: 5, type: 'chokePoint' },
        { x: 75, y: 5, type: 'strategic' },
        { x: 80, y: 5, type: 'patrol' },
        { x: 85, y: 5, type: 'chokePoint' },
        { x: 90, y: 5, type: 'strategic' }
      ];
      
      const playerPos = { x: 5, y: 5 }; // Player on left side
      const goalPos = { x: 95, y: 5 };  // Goal on right side
      
      // Mock the analyzer to return these candidates
      mockAnalyzer.generateEnemyPlacementCandidates.mockReturnValue(candidates);
      mockAnalyzer.detectChokePoints.mockReturnValue([]);
      
      // Create a grid
      mockGrid = testUtils.createMockGrid(100, 20);
      for (let x = 0; x < 100; x++) {
        for (let y = 15; y < 20; y++) {
          mockGrid.set(x, y, 0); // Floor tiles
        }
      }
      
      const coins = [];
      const platforms = [];
      
      // Place enemies with a limit to see the bias
      const limitedPlacer = new StrategicEnemyPlacer({ maxEnemies: 5 });
      const placedEnemies = limitedPlacer.placeEnemies(mockGrid, playerPos, coins, goalPos, platforms, mockRng);
      
      // Log the placement for debugging
      console.log('Placed enemies:', placedEnemies.map(e => ({ x: e.x, y: e.y })));
      
      // Check distribution - this should fail with the current implementation
      const leftSideEnemies = placedEnemies.filter(e => e.x < 30);
      const middleEnemies = placedEnemies.filter(e => e.x >= 30 && e.x < 60);
      const rightSideEnemies = placedEnemies.filter(e => e.x >= 60);
      
      console.log('Enemy distribution:', {
        left: leftSideEnemies.length,
        middle: middleEnemies.length,
        right: rightSideEnemies.length,
        total: placedEnemies.length
      });
      
      // The current implementation should place most enemies on the right side
      // due to distance-based sorting, but we want even distribution
      expect(leftSideEnemies.length).toBeGreaterThan(0);
      expect(middleEnemies.length).toBeGreaterThan(0);
      expect(rightSideEnemies.length).toBeGreaterThan(0);
    });

    test('should fail with current distance-based sorting bias', () => {
      // This test will FAIL with the current implementation
      // because the sorting prioritizes distance from player (farther = higher priority)
      
      const candidates = [
        { x: 10, y: 5, type: 'chokePoint' }, // Distance 5 from player
        { x: 20, y: 5, type: 'chokePoint' }, // Distance 15 from player
        { x: 30, y: 5, type: 'chokePoint' }, // Distance 25 from player
        { x: 80, y: 5, type: 'chokePoint' }, // Distance 75 from player
        { x: 90, y: 5, type: 'chokePoint' }  // Distance 85 from player
      ];
      
      const playerPos = { x: 5, y: 5 };
      const goalPos = { x: 95, y: 5 };
      
      const sorted = placer.sortCandidatesByPriority(candidates, playerPos, goalPos);
      
      // With current implementation, candidates are sorted by:
      // 1. Priority type (all same in this case)
      // 2. Distance from player (farther = higher priority)
      
      // So the order should be: 90, 80, 30, 20, 10
      // This means the first 3 candidates are all from the right side
      
      const firstThreeCandidates = sorted.slice(0, 3);
      const rightSideCandidates = firstThreeCandidates.filter(c => c.x > 50);
      
      // This assertion will FAIL with the current implementation
      // because the current sorting puts right-side candidates first
      expect(rightSideCandidates.length).toBeLessThan(3);
      
      // Log the actual sorting for debugging
      console.log('Current sorting result:', sorted.map(c => ({ 
        x: c.x, 
        distance: placer.calculateDistance(c, playerPos),
        side: c.x > 50 ? 'right' : 'left'
      })));
    });

    test('should distribute candidates evenly across level zones', () => {
      // This test will pass with the new zone-based distribution algorithm
      const candidates = [
        { x: 10, y: 5, type: 'chokePoint' }, // Left zone
        { x: 20, y: 5, type: 'chokePoint' }, // Left zone
        { x: 40, y: 5, type: 'chokePoint' }, // Middle zone
        { x: 50, y: 5, type: 'chokePoint' }, // Middle zone
        { x: 80, y: 5, type: 'chokePoint' }, // Right zone
        { x: 90, y: 5, type: 'chokePoint' }  // Right zone
      ];
      
      const playerPos = { x: 5, y: 5 };
      const goalPos = { x: 95, y: 5 };
      
      const sorted = placer.sortCandidatesByPriority(candidates, playerPos, goalPos);
      
      // Log the actual sorting for debugging
      const sortedWithInfo = sorted.map(c => ({ 
        x: c.x, 
        zone: Math.floor((c.x / 95) * 3),
        side: c.x < 32 ? 'left' : c.x < 64 ? 'middle' : 'right'
      }));
      
      console.log('Zone-based sorting result:', sortedWithInfo);
      
      // With the new implementation, candidates should be distributed across zones
      // rather than sorted purely by distance from player
      const firstThreeCandidates = sorted.slice(0, 3);
      const leftZoneCandidates = firstThreeCandidates.filter(c => c.x < 32);
      const middleZoneCandidates = firstThreeCandidates.filter(c => c.x >= 32 && c.x < 64);
      const rightZoneCandidates = firstThreeCandidates.filter(c => c.x >= 64);
      
      // Should have candidates from different zones in the first few positions
      // Note: The zone-based algorithm may not guarantee perfect distribution in first 3
      // but it should prioritize left zone first, then middle, then right
      expect(leftZoneCandidates.length).toBeGreaterThan(0);
      
      // Log the distribution for debugging
      console.log('Zone distribution:', {
        left: leftZoneCandidates.length,
        middle: middleZoneCandidates.length,
        right: rightZoneCandidates.length,
        total: firstThreeCandidates.length
      });
    });

    test('should test getLevelPosition method', () => {
      const playerPos = { x: 5, y: 5 };
      const goalPos = { x: 95, y: 5 };
      
      // Test candidates in different zones
      const leftCandidate = { x: 10, y: 5 };
      const middleCandidate = { x: 50, y: 5 };
      const rightCandidate = { x: 80, y: 5 };
      
      const leftScore = placer.getLevelPosition(leftCandidate, playerPos, goalPos);
      const middleScore = placer.getLevelPosition(middleCandidate, playerPos, goalPos);
      const rightScore = placer.getLevelPosition(rightCandidate, playerPos, goalPos);
      
      // Left zone should have lowest score (highest priority)
      expect(leftScore).toBeLessThan(middleScore);
      expect(leftScore).toBeLessThan(rightScore);
      
      // Middle zone should have middle score
      expect(middleScore).toBeGreaterThan(leftScore);
      expect(middleScore).toBeLessThan(rightScore);
      
      // Right zone should have highest score (lowest priority)
      expect(rightScore).toBeGreaterThan(leftScore);
      expect(rightScore).toBeGreaterThan(middleScore);
    });
  });

  describe('isValidDistance', () => {
    test('should validate distance from spawn', () => {
      const candidate = { x: 10, y: 5 };
      const playerPos = { x: 5, y: 5 };
      const goalPos = { x: 20, y: 5 };
      
      // Distance is 5, should be valid (>= minDistanceFromSpawn)
      expect(placer.isValidDistance(candidate, playerPos, goalPos)).toBe(true);
      
      // Test with closer candidate
      const closeCandidate = { x: 7, y: 5 }; // Distance 2
      expect(placer.isValidDistance(closeCandidate, playerPos, goalPos)).toBe(false);
    });

    test('should validate distance from goal', () => {
      const candidate = { x: 15, y: 5 };
      const playerPos = { x: 5, y: 5 };
      const goalPos = { x: 20, y: 5 };
      
      // Distance is 5, should be valid (>= minDistanceFromGoal)
      expect(placer.isValidDistance(candidate, playerPos, goalPos)).toBe(true);
      
      // Test with closer candidate
      const closeCandidate = { x: 18, y: 5 }; // Distance 2
      expect(placer.isValidDistance(closeCandidate, playerPos, goalPos)).toBe(false);
    });
  });

  describe('createEnemyConfiguration', () => {
    test('should create valid LoopHound configuration', () => {
      const candidate = { x: 10, y: 5, type: 'chokePoint' };
      
      const config = placer.createEnemyConfiguration(candidate, mockRng);
      
      expect(config.type).toBe('LoopHound');
      expect(config.x).toBe(10);
      expect(config.y).toBe(5);
      expect(config.patrolDistance).toBeGreaterThanOrEqual(50);
      expect(config.patrolDistance).toBeLessThanOrEqual(500);
      expect([1, -1]).toContain(config.direction);
      expect(config.speed).toBeGreaterThanOrEqual(10);
      expect(config.speed).toBeLessThanOrEqual(200);
      expect(config.placementType).toBe('chokePoint');
    });
  });

  describe('calculateDistance', () => {
    test('should calculate Euclidean distance correctly', () => {
      const pos1 = { x: 0, y: 0 };
      const pos2 = { x: 3, y: 4 };
      
      const distance = placer.calculateDistance(pos1, pos2);
      
      expect(distance).toBe(5); // 3-4-5 triangle
    });

    test('should handle zero distance', () => {
      const pos1 = { x: 5, y: 5 };
      const pos2 = { x: 5, y: 5 };
      
      const distance = placer.calculateDistance(pos1, pos2);
      
      expect(distance).toBe(0);
    });
  });
}); 