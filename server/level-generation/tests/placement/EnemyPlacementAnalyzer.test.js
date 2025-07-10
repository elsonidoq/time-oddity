/**
 * @fileoverview Tests for EnemyPlacementAnalyzer - Strategic enemy placement analysis
 */

const EnemyPlacementAnalyzer = require('../../src/placement/EnemyPlacementAnalyzer');

describe('EnemyPlacementAnalyzer', () => {
  let analyzer;
  let mockGrid;
  let mockRng;

  beforeEach(() => {
    analyzer = new EnemyPlacementAnalyzer();
    mockRng = testUtils.createSeededRandom('test-seed');
  });

  describe('constructor', () => {
    test('should create analyzer with default configuration', () => {
      expect(analyzer).toBeDefined();
      expect(analyzer.config).toBeDefined();
      expect(analyzer.config.chokePointThreshold).toBe(3);
      expect(analyzer.config.minPatrolArea).toBe(5);
      expect(analyzer.config.maxPatrolArea).toBe(20);
    });

    test('should create analyzer with custom configuration', () => {
      const customConfig = {
        chokePointThreshold: 5,
        minPatrolArea: 10,
        maxPatrolArea: 30
      };
      const customAnalyzer = new EnemyPlacementAnalyzer(customConfig);
      
      expect(customAnalyzer.config.chokePointThreshold).toBe(5);
      expect(customAnalyzer.config.minPatrolArea).toBe(10);
      expect(customAnalyzer.config.maxPatrolArea).toBe(30);
    });
  });

  describe('detectChokePoints', () => {
    test('should detect narrow corridors as choke points', () => {
      // Create a grid with a narrow corridor
      mockGrid = testUtils.createMockGrid(10, 10);
      // Create a narrow corridor at y=5
      for (let x = 0; x < 10; x++) {
        mockGrid.set(x, 5, 0); // Floor corridor
      }
      // Add walls around the corridor
      for (let x = 0; x < 10; x++) {
        mockGrid.set(x, 4, 1); // Wall above
        mockGrid.set(x, 6, 1); // Wall below
      }
      
      const chokePoints = analyzer.detectChokePoints(mockGrid);
      
      expect(chokePoints.length).toBeGreaterThan(0);
      // Should detect points along the narrow corridor
      chokePoints.forEach(point => {
        expect(point.y).toBe(5);
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThan(10);
      });
    });

    test('should not detect wide areas as choke points', () => {
      // Create a grid with a wide open area
      mockGrid = testUtils.createMockGrid(10, 10);
      // Create a wide open area
      for (let x = 2; x < 8; x++) {
        for (let y = 2; y < 8; y++) {
          mockGrid.set(x, y, 0); // Floor area
        }
      }
      
      const chokePoints = analyzer.detectChokePoints(mockGrid);
      
      expect(chokePoints.length).toBe(0);
    });

    test('should handle edge cases gracefully', () => {
      // Single tile grid
      mockGrid = testUtils.createMockGrid(1, 1);
      mockGrid.set(0, 0, 0);
      
      const chokePoints = analyzer.detectChokePoints(mockGrid);
      
      expect(chokePoints.length).toBe(0);
    });

    test('DEBUG: should debug choke point detection', () => {
      // Create a grid with a narrow corridor
      mockGrid = testUtils.createMockGrid(10, 10);
      // Create a narrow corridor at y=5
      for (let x = 0; x < 10; x++) {
        mockGrid.set(x, 5, 0); // Floor corridor
      }
      // Add walls around the corridor
      for (let x = 0; x < 10; x++) {
        mockGrid.set(x, 4, 1); // Wall above
        mockGrid.set(x, 6, 1); // Wall below
      }
      
      // Debug: Check grid state
      let gridState = '';
      for (let y = 0; y < 10; y++) {
        let row = '';
        for (let x = 0; x < 10; x++) {
          row += mockGrid.get(x, y) === 0 ? '.' : '#';
        }
        gridState += row + '\n';
      }
      
      const chokePoints = analyzer.detectChokePoints(mockGrid);
      
      // Use assertion to show debug info
      expect({
        gridState,
        chokePointsCount: chokePoints.length,
        chokePoints: chokePoints,
        config: analyzer.config
      }).toEqual({
        gridState: expect.any(String),
        chokePointsCount: expect.any(Number),
        chokePoints: expect.any(Array),
        config: expect.any(Object)
      });
      
      expect(chokePoints.length).toBeGreaterThan(0);
    });
  });

  describe('identifyPatrolAreas', () => {
    test('should identify suitable patrol areas', () => {
      // Create a grid with a platform area
      mockGrid = testUtils.createMockGrid(15, 10);
      // Create a platform at y=5
      for (let x = 2; x < 13; x++) {
        mockGrid.set(x, 5, 0); // Platform floor
      }
      // Add walls around the platform
      for (let x = 2; x < 13; x++) {
        mockGrid.set(x, 4, 1); // Wall above
        mockGrid.set(x, 6, 1); // Wall below
      }
      
      const patrolAreas = analyzer.identifyPatrolAreas(mockGrid);
      
      expect(patrolAreas.length).toBeGreaterThan(0);
      patrolAreas.forEach(area => {
        expect(area.width).toBeGreaterThanOrEqual(analyzer.config.minPatrolArea);
        expect(area.width).toBeLessThanOrEqual(analyzer.config.maxPatrolArea);
        expect(area.y).toBe(5);
      });
    });

    test('should not identify areas that are too small', () => {
      // Create a grid with a small platform
      mockGrid = testUtils.createMockGrid(10, 10);
      // Create a small platform (too small for patrol)
      for (let x = 3; x < 6; x++) {
        mockGrid.set(x, 5, 0);
      }
      
      const patrolAreas = analyzer.identifyPatrolAreas(mockGrid);
      
      expect(patrolAreas.length).toBe(0);
    });

    test('should identify multiple patrol areas', () => {
      // Create a grid with multiple platforms
      mockGrid = testUtils.createMockGrid(20, 10);
      // Platform 1
      for (let x = 2; x < 8; x++) {
        mockGrid.set(x, 3, 0);
      }
      // Platform 2
      for (let x = 12; x < 18; x++) {
        mockGrid.set(x, 7, 0);
      }
      
      const patrolAreas = analyzer.identifyPatrolAreas(mockGrid);
      
      expect(patrolAreas.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('analyzePlatformPlacement', () => {
    test('should identify enemy positions on floating platforms', () => {
      // Create a grid with floating platforms
      mockGrid = testUtils.createMockGrid(15, 10);
      // Set all tiles to wall
      for (let x = 0; x < 15; x++) {
        for (let y = 0; y < 10; y++) {
          mockGrid.set(x, y, 1);
        }
      }
      // Floating platform at y=3
      for (let x = 3; x < 6; x++) {
        mockGrid.set(x, 3, 0);
      }
      
      // Print the grid row at y=3 for debug
      let row = '';
      for (let x = 0; x < mockGrid.shape[0]; x++) {
        row += mockGrid.get(x, 3) === 0 ? '.' : '#';
      }
      console.log('DEBUG grid row y=3:', row);
      const platformPositions = analyzer.analyzePlatformPlacement(mockGrid);
      console.log('DEBUG platformPositions x:', platformPositions.map(p => p.x));
      expect(platformPositions.length).toBeGreaterThan(0);
      platformPositions.forEach(pos => {
        expect(pos.y).toBe(3);
        expect(pos.x).toBeGreaterThanOrEqual(3);
        expect(pos.x).toBeLessThan(12);
        expect(pos.platformType).toBe('floating');
      });
    });

    test('should identify enemy positions on ground platforms', () => {
      // Create a grid with ground platform
      mockGrid = testUtils.createMockGrid(15, 10);
      // Ground platform at bottom
      for (let x = 0; x < 15; x++) {
        mockGrid.set(x, 9, 0);
      }
      
      const platformPositions = analyzer.analyzePlatformPlacement(mockGrid);
      
      expect(platformPositions.length).toBeGreaterThan(0);
      platformPositions.forEach(pos => {
        expect(pos.y).toBe(9);
        expect(pos.platformType).toBe('ground');
      });
    });

    test('should handle moving platforms', () => {
      // Create a grid with moving platform indicators
      mockGrid = testUtils.createMockGrid(15, 10);
      // Moving platform area
      for (let x = 5; x < 10; x++) {
        mockGrid.set(x, 4, 0);
      }
      
      const platformPositions = analyzer.analyzePlatformPlacement(mockGrid);
      
      expect(platformPositions.length).toBeGreaterThan(0);
      platformPositions.forEach(pos => {
        expect(pos.y).toBe(4);
        expect(pos.x).toBeGreaterThanOrEqual(5);
        expect(pos.x).toBeLessThan(10);
        expect(pos.platformType).toBe('moving');
      });
    });
  });

  describe('analyzeStrategicPositions', () => {
    test('should identify strategic positions near coins', () => {
      // Create a grid with coins and strategic positions
      mockGrid = testUtils.createMockGrid(15, 10);
      // Platform with coin
      for (let x = 3; x < 12; x++) {
        mockGrid.set(x, 5, 0);
      }
      // Coin at position (7, 5)
      const coins = [{ x: 7, y: 5 }];
      
      const strategicPositions = analyzer.analyzeStrategicPositions(mockGrid, coins);
      
      expect(strategicPositions.length).toBeGreaterThan(0);
      strategicPositions.forEach(pos => {
        // Should be near the coin
        const distance = Math.sqrt(Math.pow(pos.x - 7, 2) + Math.pow(pos.y - 5, 2));
        expect(distance).toBeLessThanOrEqual(5);
      });
    });

    test('should identify strategic positions near goal', () => {
      // Create a grid with goal and strategic positions
      mockGrid = testUtils.createMockGrid(15, 10);
      // Platform leading to goal
      for (let x = 8; x < 15; x++) {
        mockGrid.set(x, 6, 0);
      }
      const goal = { x: 12, y: 6 };
      
      const strategicPositions = analyzer.analyzeStrategicPositions(mockGrid, [], goal);
      
      expect(strategicPositions.length).toBeGreaterThan(0);
      strategicPositions.forEach(pos => {
        // Should be near the goal
        const distance = Math.sqrt(Math.pow(pos.x - 12, 2) + Math.pow(pos.y - 6, 2));
        expect(distance).toBeLessThanOrEqual(8);
      });
    });

    test('should prioritize choke points for strategic placement', () => {
      // Create a grid with choke point and strategic analysis
      mockGrid = testUtils.createMockGrid(15, 10);
      // Create a narrow corridor (choke point)
      for (let x = 0; x < 15; x++) {
        mockGrid.set(x, 5, 0);
      }
      for (let x = 0; x < 15; x++) {
        mockGrid.set(x, 4, 1);
        mockGrid.set(x, 6, 1);
      }
      
      const strategicPositions = analyzer.analyzeStrategicPositions(mockGrid, []);
      
      expect(strategicPositions.length).toBeGreaterThan(0);
      // Should prioritize positions along the choke point
      const chokePointPositions = strategicPositions.filter(pos => pos.y === 5);
      expect(chokePointPositions.length).toBeGreaterThan(0);
    });
  });

  describe('validateAccessibility', () => {
    test('should validate accessible enemy positions', () => {
      // Create a grid with accessible platform
      mockGrid = testUtils.createMockGrid(10, 10);
      // Accessible platform
      for (let x = 2; x < 8; x++) {
        mockGrid.set(x, 5, 0);
      }
      
      const candidatePositions = [
        { x: 3, y: 5 },
        { x: 5, y: 5 },
        { x: 7, y: 5 }
      ];
      
      const accessiblePositions = analyzer.validateAccessibility(mockGrid, candidatePositions);
      
      expect(accessiblePositions.length).toBe(3);
      accessiblePositions.forEach(pos => {
        expect(mockGrid.get(pos.x, pos.y)).toBe(0); // On floor
      });
    });

    test('should filter out inaccessible positions', () => {
      // Create a grid with inaccessible areas
      mockGrid = testUtils.createMockGrid(10, 10);
      // Platform with some inaccessible areas
      for (let x = 2; x < 8; x++) {
        mockGrid.set(x, 5, 0);
      }
      // Make some areas inaccessible
      mockGrid.set(4, 5, 1); // Wall in middle
      mockGrid.set(6, 5, 1); // Wall in middle
      
      const candidatePositions = [
        { x: 3, y: 5 },
        { x: 4, y: 5 }, // Inaccessible
        { x: 5, y: 5 },
        { x: 6, y: 5 }, // Inaccessible
        { x: 7, y: 5 }
      ];
      
      const accessiblePositions = analyzer.validateAccessibility(mockGrid, candidatePositions);
      
      expect(accessiblePositions.length).toBe(3);
      expect(accessiblePositions).toContainEqual({ x: 3, y: 5 });
      expect(accessiblePositions).toContainEqual({ x: 5, y: 5 });
      expect(accessiblePositions).toContainEqual({ x: 7, y: 5 });
    });

    test('should handle edge cases', () => {
      // Empty candidate list
      mockGrid = testUtils.createMockGrid(5, 5);
      const accessiblePositions = analyzer.validateAccessibility(mockGrid, []);
      
      expect(accessiblePositions.length).toBe(0);
    });
  });

  describe('generateEnemyPlacementCandidates', () => {
    test('should generate comprehensive placement candidates', () => {
      // Create a complex grid with multiple features
      mockGrid = testUtils.createMockGrid(20, 15);
      // Ground platform
      for (let x = 0; x < 20; x++) {
        mockGrid.set(x, 14, 0);
      }
      // Floating platform
      for (let x = 5; x < 15; x++) {
        mockGrid.set(x, 8, 0);
      }
      // Narrow corridor (choke point)
      for (let x = 0; x < 20; x++) {
        mockGrid.set(x, 5, 0);
      }
      for (let x = 0; x < 20; x++) {
        mockGrid.set(x, 4, 1);
        mockGrid.set(x, 6, 1);
      }
      
      const coins = [{ x: 7, y: 8 }, { x: 12, y: 8 }];
      const goal = { x: 18, y: 14 };
      
      const candidates = analyzer.generateEnemyPlacementCandidates(mockGrid, coins, goal);
      
      expect(candidates.length).toBeGreaterThan(0);
      
      // Should have different types of candidates
      const chokePointCandidates = candidates.filter(c => c.type === 'chokePoint');
      const patrolAreaCandidates = candidates.filter(c => c.type === 'patrolArea');
      const strategicCandidates = candidates.filter(c => c.type === 'strategic');
      const platformCandidates = candidates.filter(c => c.type === 'platform');
      
      expect(chokePointCandidates.length).toBeGreaterThan(0);
      expect(patrolAreaCandidates.length).toBeGreaterThan(0);
      expect(strategicCandidates.length).toBeGreaterThan(0);
      expect(platformCandidates.length).toBeGreaterThan(0);
    });

    test('should validate all candidates are accessible', () => {
      // Create a simple grid
      mockGrid = testUtils.createMockGrid(10, 10);
      // Single platform
      for (let x = 2; x < 8; x++) {
        mockGrid.set(x, 5, 0);
      }
      
      const coins = [{ x: 5, y: 5 }];
      const goal = { x: 7, y: 5 };
      
      const candidates = analyzer.generateEnemyPlacementCandidates(mockGrid, coins, goal);
      
      expect(candidates.length).toBeGreaterThan(0);
      candidates.forEach(candidate => {
        expect(mockGrid.get(candidate.x, candidate.y)).toBe(0); // On floor
        expect(candidate.x).toBeGreaterThanOrEqual(0);
        expect(candidate.x).toBeLessThan(10);
        expect(candidate.y).toBeGreaterThanOrEqual(0);
        expect(candidate.y).toBeLessThan(10);
      });
    });

    test('should handle empty grid gracefully', () => {
      mockGrid = testUtils.createMockGrid(5, 5);
      
      const candidates = analyzer.generateEnemyPlacementCandidates(mockGrid, [], null);
      
      expect(candidates.length).toBe(0);
    });
  });

  describe('getPlacementStatistics', () => {
    test('should return comprehensive placement statistics', () => {
      // Create a grid with various features
      mockGrid = testUtils.createMockGrid(15, 10);
      // Ground platform
      for (let x = 0; x < 15; x++) {
        mockGrid.set(x, 9, 0);
      }
      // Floating platform
      for (let x = 3; x < 12; x++) {
        mockGrid.set(x, 5, 0);
      }
      
      const coins = [{ x: 5, y: 5 }, { x: 8, y: 5 }];
      const goal = { x: 12, y: 9 };
      
      const stats = analyzer.getPlacementStatistics(mockGrid, coins, goal);
      
      expect(stats).toBeDefined();
      expect(stats.totalCandidates).toBeGreaterThan(0);
      expect(stats.chokePointCandidates).toBeGreaterThanOrEqual(0);
      expect(stats.patrolAreaCandidates).toBeGreaterThanOrEqual(0);
      expect(stats.strategicCandidates).toBeGreaterThanOrEqual(0);
      expect(stats.platformCandidates).toBeGreaterThanOrEqual(0);
      expect(stats.accessibleCandidates).toBeGreaterThanOrEqual(0);
    });
  });
}); 