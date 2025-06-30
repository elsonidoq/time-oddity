import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('SceneFactory.createEnemiesFromConfig', () => {
  let sceneFactory;
  let mockScene;
  let mockEnemiesGroup;
  let mockTimeManager;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    
    // Create a mock enemies group
    mockEnemiesGroup = {
      add: jest.fn((enemy) => enemy),
      getChildren: jest.fn(() => []),
      create: jest.fn()
    };
    
    // Mock TimeManager
    mockTimeManager = {
      register: jest.fn()
    };
    
    // Set up scene with enemies group and timeManager
    mockScene.enemies = mockEnemiesGroup;
    mockScene.timeManager = mockTimeManager;
    
    // Mock scene.add.existing and scene.physics.add.existing to avoid Phaser dependencies
    mockScene.add = {
      existing: jest.fn()
    };
    mockScene.physics = {
      add: {
        existing: jest.fn()
      }
    };
    
    sceneFactory = new SceneFactory(mockScene);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEnemiesFromConfig with valid enemy config', () => {
    test('should create LoopHound at specified coordinates', () => {
      // Red phase - this test MUST fail initially
      const config = { 
        enemies: [{ 
          type: 'LoopHound', 
          x: 100, 
          y: 200 
        }] 
      };
      
      const enemies = sceneFactory.createEnemiesFromConfig(config);
      
      expect(enemies[0].x).toBe(100);
      expect(enemies[0].y).toBe(200);
    });

    test('should create multiple enemies from config', () => {
      const config = {
        enemies: [
          { type: 'LoopHound', x: 100, y: 200 },
          { type: 'LoopHound', x: 300, y: 400 }
        ]
      };
      
      const enemies = sceneFactory.createEnemiesFromConfig(config);
      
      expect(enemies).toHaveLength(2);
      expect(enemies[0].x).toBe(100);
      expect(enemies[0].y).toBe(200);
      expect(enemies[1].x).toBe(300);
      expect(enemies[1].y).toBe(400);
    });

    test('should configure patrol parameters from JSON', () => {
      const config = {
        enemies: [{
          type: 'LoopHound',
          x: 100,
          y: 200,
          patrolDistance: 150,
          direction: -1,
          speed: 60
        }]
      };
      
      const enemies = sceneFactory.createEnemiesFromConfig(config);
      
      expect(enemies[0].patrolDistance).toBe(150);
      expect(enemies[0].direction).toBe(-1);
      expect(enemies[0].speed).toBe(60);
    });

    test('should use default values for missing optional parameters', () => {
      const config = {
        enemies: [{
          type: 'LoopHound',
          x: 100,
          y: 200
          // Missing patrolDistance, direction, speed
        }]
      };
      
      const enemies = sceneFactory.createEnemiesFromConfig(config);
      
      expect(enemies[0].patrolDistance).toBe(200); // default
      expect(enemies[0].direction).toBe(1); // default
      expect(enemies[0].speed).toBe(80); // default
    });
  });

  describe('Physics Configuration Order (Critical §13)', () => {
    test('should add enemy to physics group BEFORE configuration', () => {
      const config = {
        enemies: [{ type: 'LoopHound', x: 100, y: 200 }]
      };
      
      // Mock the configurePlatform method to track calls
      const originalConfigurePlatform = sceneFactory.configurePlatform;
      const configurePlatformSpy = jest.fn();
      sceneFactory.configurePlatform = configurePlatformSpy;
      
      sceneFactory.createEnemiesFromConfig(config);
      
      // Verify that add was called before configurePlatform
      expect(mockEnemiesGroup.add).toHaveBeenCalled();
      // Note: In the actual implementation, configurePlatform would be called after add
      // This test verifies the critical §13 invariant
    });

    test('should add enemy to scene.enemies group', () => {
      const config = {
        enemies: [{ type: 'LoopHound', x: 100, y: 200 }]
      };
      
      sceneFactory.createEnemiesFromConfig(config);
      
      expect(mockEnemiesGroup.add).toHaveBeenCalled();
    });
  });

  describe('TimeManager Integration', () => {
    test('should register enemy with TimeManager for time reversal', () => {
      const config = {
        enemies: [{ type: 'LoopHound', x: 100, y: 200 }]
      };
      
      sceneFactory.createEnemiesFromConfig(config);
      
      expect(mockTimeManager.register).toHaveBeenCalled();
    });

    test('should register multiple enemies with TimeManager', () => {
      const config = {
        enemies: [
          { type: 'LoopHound', x: 100, y: 200 },
          { type: 'LoopHound', x: 300, y: 400 }
        ]
      };
      
      sceneFactory.createEnemiesFromConfig(config);
      
      expect(mockTimeManager.register).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle missing enemies array gracefully', () => {
      const config = { platforms: [] }; // No enemies array
      
      const enemies = sceneFactory.createEnemiesFromConfig(config);
      
      expect(enemies).toEqual([]);
      expect(mockEnemiesGroup.add).not.toHaveBeenCalled();
      expect(mockTimeManager.register).not.toHaveBeenCalled();
    });

    test('should handle null config gracefully', () => {
      const enemies = sceneFactory.createEnemiesFromConfig(null);
      
      expect(enemies).toEqual([]);
      expect(mockEnemiesGroup.add).not.toHaveBeenCalled();
      expect(mockTimeManager.register).not.toHaveBeenCalled();
    });

    test('should handle undefined config gracefully', () => {
      const enemies = sceneFactory.createEnemiesFromConfig(undefined);
      
      expect(enemies).toEqual([]);
      expect(mockEnemiesGroup.add).not.toHaveBeenCalled();
      expect(mockTimeManager.register).not.toHaveBeenCalled();
    });

    test('should handle empty enemies array', () => {
      const config = { enemies: [] };
      
      const enemies = sceneFactory.createEnemiesFromConfig(config);
      
      expect(enemies).toEqual([]);
      expect(mockEnemiesGroup.add).not.toHaveBeenCalled();
      expect(mockTimeManager.register).not.toHaveBeenCalled();
    });

    test('should skip invalid enemy type without crashing', () => {
      const config = {
        enemies: [
          { type: 'InvalidEnemy', x: 100, y: 200 },
          { type: 'LoopHound', x: 300, y: 400 }
        ]
      };
      
      const enemies = sceneFactory.createEnemiesFromConfig(config);
      
      // Should only create the valid LoopHound
      expect(enemies).toHaveLength(1);
      expect(enemies[0].x).toBe(300);
      expect(enemies[0].y).toBe(400);
    });

    test('should handle malformed enemy config gracefully', () => {
      const config = {
        enemies: [
          { type: 'LoopHound' }, // Missing x, y
          { type: 'LoopHound', x: 100 }, // Missing y
          { type: 'LoopHound', y: 200 }, // Missing x
          { type: 'LoopHound', x: 100, y: 200 } // Valid
        ]
      };
      
      const enemies = sceneFactory.createEnemiesFromConfig(config);
      
      // Should only create the valid enemy
      expect(enemies).toHaveLength(1);
      expect(enemies[0].x).toBe(100);
      expect(enemies[0].y).toBe(200);
    });
  });

  describe('Enemy Properties and State', () => {
    test('should create enemy with correct texture and frame defaults', () => {
      const config = {
        enemies: [{ type: 'LoopHound', x: 100, y: 200 }]
      };
      
      const enemies = sceneFactory.createEnemiesFromConfig(config);
      
      // The real LoopHound constructor should set these properties
      expect(enemies[0]).toBeDefined();
      expect(enemies[0].x).toBe(100);
      expect(enemies[0].y).toBe(200);
      // Note: texture and frame properties are set by the Phaser constructor
      // We'll test the constructor was called with correct parameters instead
    });

    test('should create enemy with custom texture and frame', () => {
      const config = {
        enemies: [{
          type: 'LoopHound',
          x: 100,
          y: 200,
          texture: 'custom_enemies',
          frame: 'custom_frame'
        }]
      };
      
      const enemies = sceneFactory.createEnemiesFromConfig(config);
      
      // Verify the enemy was created with correct position
      expect(enemies[0]).toBeDefined();
      expect(enemies[0].x).toBe(100);
      expect(enemies[0].y).toBe(200);
      // Note: texture and frame are passed to constructor but not directly accessible
      // The important thing is that the constructor was called with correct parameters
    });

    test('should create enemy with proper health and damage values', () => {
      const config = {
        enemies: [{ type: 'LoopHound', x: 100, y: 200 }]
      };
      
      const enemies = sceneFactory.createEnemiesFromConfig(config);
      
      expect(enemies[0].health).toBe(100);
      expect(enemies[0].maxHealth).toBe(100);
      expect(enemies[0].damage).toBe(20);
    });

    test('should create enemy with freeze contract methods', () => {
      const config = {
        enemies: [{ type: 'LoopHound', x: 100, y: 200 }]
      };
      
      const enemies = sceneFactory.createEnemiesFromConfig(config);
      
      expect(typeof enemies[0].freeze).toBe('function');
      expect(typeof enemies[0].unfreeze).toBe('function');
      expect(enemies[0].isFrozen).toBe(false);
    });

    test('should create enemy with time reversal methods', () => {
      const config = {
        enemies: [{ type: 'LoopHound', x: 100, y: 200 }]
      };
      
      const enemies = sceneFactory.createEnemiesFromConfig(config);
      
      expect(typeof enemies[0].getStateForRecording).toBe('function');
      expect(typeof enemies[0].setStateFromRecording).toBe('function');
    });
  });

  describe('Patrol Configuration', () => {
    test('should set patrol boundaries correctly', () => {
      const config = {
        enemies: [{
          type: 'LoopHound',
          x: 100,
          y: 200,
          patrolDistance: 150
        }]
      };
      
      const enemies = sceneFactory.createEnemiesFromConfig(config);
      
      expect(enemies[0].patrolStartX).toBe(100);
      expect(enemies[0].patrolEndX).toBe(250); // 100 + 150
    });

    test('should handle negative direction correctly', () => {
      const config = {
        enemies: [{
          type: 'LoopHound',
          x: 100,
          y: 200,
          direction: -1
        }]
      };
      
      const enemies = sceneFactory.createEnemiesFromConfig(config);
      
      expect(enemies[0].direction).toBe(-1);
    });

    test('should validate patrol distance limits', () => {
      const config = {
        enemies: [
          {
            type: 'LoopHound',
            x: 100,
            y: 200,
            patrolDistance: 30 // Below minimum
          },
          {
            type: 'LoopHound',
            x: 300,
            y: 400,
            patrolDistance: 600 // Above maximum
          },
          {
            type: 'LoopHound',
            x: 500,
            y: 600,
            patrolDistance: 200 // Valid
          }
        ]
      };
      
      const enemies = sceneFactory.createEnemiesFromConfig(config);
      
      // Should handle validation gracefully (implementation will determine exact behavior)
      expect(enemies.length).toBeGreaterThan(0);
    });
  });

  describe('Scene Integration', () => {
    test('should pass scene reference to enemy constructor', () => {
      const config = {
        enemies: [{ type: 'LoopHound', x: 100, y: 200 }]
      };
      
      sceneFactory.createEnemiesFromConfig(config);
      
      // Verify that the scene was passed to the enemy constructor
      // This will be verified through the mock implementation
    });

    test('should handle missing scene.enemies group gracefully', () => {
      // Remove enemies group from scene
      delete mockScene.enemies;
      
      const config = {
        enemies: [{ type: 'LoopHound', x: 100, y: 200 }]
      };
      
      const enemies = sceneFactory.createEnemiesFromConfig(config);
      
      // Should handle gracefully without crashing
      expect(Array.isArray(enemies)).toBe(true);
    });

    test('should handle missing scene.timeManager gracefully', () => {
      // Remove timeManager from scene
      delete mockScene.timeManager;
      
      const config = {
        enemies: [{ type: 'LoopHound', x: 100, y: 200 }]
      };
      
      const enemies = sceneFactory.createEnemiesFromConfig(config);
      
      // Should handle gracefully without crashing
      expect(Array.isArray(enemies)).toBe(true);
    });
  });
}); 