import { jest } from '@jest/globals';
import { mockScene } from '../mocks/phaserMock.js';

// Mock GSAP
let createdTimelines = [];
function createMockTimeline() {
  return {
    to: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis(),
    play: jest.fn().mockReturnThis(),
    kill: jest.fn(),
    eventCallback: jest.fn((type, callback, params) => {
      if (type === 'onComplete' && callback) {
        callback(...(params || []));
      }
    }),
  };
}

await jest.unstable_mockModule('gsap', () => ({
  default: {
    to: jest.fn((target, vars) => {
      if (vars.onComplete) {
        vars.onComplete(...(vars.onCompleteParams || []));
      }
      return { kill: jest.fn() };
    }),
    timeline: jest.fn((config) => {
      const timeline = createMockTimeline();
      createdTimelines.push(timeline);
      return timeline;
    }),
    killTweensOf: jest.fn(),
  }
}));

const { default: gsap } = await import('gsap');

// Import the classes we need to test
import ChronoPulse from '../../client/src/entities/ChronoPulse.js';
import { Enemy } from '../../client/src/entities/Enemy.js';
import { LoopHound } from '../../client/src/entities/enemies/LoopHound.js';

describe('ChronoPulse Enemy Freezing Integration', () => {
  let testScene;
  let mockGraphics;
  let mockEnemyGroup;
  let chronoPulse;
  let enemy1, enemy2, enemy3;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    createdTimelines = [];

    // Create mock graphics object
    mockGraphics = {
      setOrigin: jest.fn().mockReturnThis(),
      setDepth: jest.fn().mockReturnThis(),
      destroy: jest.fn(),
      lineStyle: jest.fn().mockReturnThis(),
      strokeCircle: jest.fn().mockReturnThis(),
      setPosition: jest.fn().mockReturnThis(),
      fillStyle: jest.fn().mockReturnThis(),
      fillCircle: jest.fn().mockReturnThis(),
    };

    // Create mock enemy group with getChildren method
    mockEnemyGroup = {
      getChildren: jest.fn(() => [enemy1, enemy2, enemy3]),
      add: jest.fn(),
    };

    // Create test scene with proper enemy group setup
    testScene = {
      ...mockScene,
      time: { 
        now: 4000,
        add: jest.fn()
      },
      add: {
        ...mockScene.add,
        graphics: jest.fn(() => mockGraphics),
        existing: jest.fn()
      },
      physics: {
        ...mockScene.physics,
        add: {
          ...mockScene.physics.add,
          existing: jest.fn(),
          group: jest.fn(() => mockEnemyGroup)
        }
      },
      // Add enemies group to scene (this is what ChronoPulse expects)
      enemies: mockEnemyGroup
    };

    // Create mock enemies with freeze method
    enemy1 = {
      x: 120,
      y: 200,
      isActive: true,
      freeze: jest.fn(),
      isFrozen: false,
      freezeTimer: 0
    };

    enemy2 = {
      x: 260, // Out of range (160px away from 100,200)
      y: 200,
      isActive: true,
      freeze: jest.fn(),
      isFrozen: false,
      freezeTimer: 0
    };

    enemy3 = {
      x: 150,
      y: 180,
      isActive: true,
      freeze: jest.fn(),
      isFrozen: false,
      freezeTimer: 0
    };

    // Create ChronoPulse instance
    chronoPulse = new ChronoPulse(testScene, 100, 200, {
      cooldown: 3000,
      range: 150,
      duration: 2000
    }, gsap);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Enemy Detection and Freezing', () => {
    test('should detect enemies in scene.enemies group', () => {
      // This test should fail initially because ChronoPulse doesn't properly access scene.enemies
      const enemies = chronoPulse.detectOverlaps([enemy1, enemy2, enemy3]);
      
      // Should detect enemy1 and enemy3 (within 150px range)
      expect(enemies).toContain(enemy1);
      expect(enemies).toContain(enemy3);
      expect(enemies).not.toContain(enemy2); // Too far away
      expect(enemies.length).toBe(2);
    });

    test('should apply freeze effect to detected enemies when activated', () => {
      // This test should fail initially because applyFreezeEffect doesn't find enemies
      chronoPulse.activate();
      
      // Should call freeze on enemies within range
      expect(enemy1.freeze).toHaveBeenCalledWith(2000); // duration from config
      expect(enemy3.freeze).toHaveBeenCalledWith(2000);
      expect(enemy2.freeze).not.toHaveBeenCalled(); // Out of range
    });

    test('should handle multiple enemies with different distances', () => {
      // Create enemies at different distances
      const closeEnemy = { x: 110, y: 200, isActive: true, freeze: jest.fn() };
      const mediumEnemy = { x: 200, y: 200, isActive: true, freeze: jest.fn() };
      const farEnemy = { x: 300, y: 200, isActive: true, freeze: jest.fn() };

      // Update enemy group
      mockEnemyGroup.getChildren.mockReturnValue([closeEnemy, mediumEnemy, farEnemy]);

      chronoPulse.activate();

      // Only close and medium enemies should be frozen (within 150px range)
      expect(closeEnemy.freeze).toHaveBeenCalledWith(2000);
      expect(mediumEnemy.freeze).toHaveBeenCalledWith(2000);
      expect(farEnemy.freeze).not.toHaveBeenCalled();
    });

    test('should ignore inactive enemies', () => {
      const inactiveEnemy = { x: 120, y: 200, isActive: false, freeze: jest.fn() };
      mockEnemyGroup.getChildren.mockReturnValue([inactiveEnemy]);

      chronoPulse.activate();

      expect(inactiveEnemy.freeze).not.toHaveBeenCalled();
    });

    test('should handle empty enemy group gracefully', () => {
      mockEnemyGroup.getChildren.mockReturnValue([]);

      chronoPulse.activate();

      // Should not throw any errors and should not call any freeze methods
      expect(chronoPulse.isActive).toBe(true);
    });

    test('should handle missing enemy group gracefully', () => {
      // Remove enemies group from scene
      delete testScene.enemies;

      chronoPulse.activate();

      // Should not throw any errors and should still activate
      expect(chronoPulse.isActive).toBe(true);
    });
  });

  describe('Real Enemy Integration', () => {
    test('should work with actual LoopHound enemies', () => {
      // Create real LoopHound enemies
      const loophound1 = new LoopHound(testScene, 120, 200);
      const loophound2 = new LoopHound(testScene, 300, 200); // Out of range (200px away)
      
      // Mock the freeze method on LoopHound
      loophound1.freeze = jest.fn();
      loophound2.freeze = jest.fn();

      mockEnemyGroup.getChildren.mockReturnValue([loophound1, loophound2]);

      chronoPulse.activate();

      // Should freeze only the LoopHound within range
      expect(loophound1.freeze).toHaveBeenCalledWith(2000);
      expect(loophound2.freeze).not.toHaveBeenCalled();
    });

    test('should work with Enemy base class instances', () => {
      // Create real Enemy instances
      const enemy1 = new Enemy(testScene, 120, 200, 'enemies', 'slime_normal_rest');
      const enemy2 = new Enemy(testScene, 300, 200, 'enemies', 'slime_normal_rest'); // Out of range (200px away)

      // Mock the freeze method
      enemy1.freeze = jest.fn();
      enemy2.freeze = jest.fn();

      mockEnemyGroup.getChildren.mockReturnValue([enemy1, enemy2]);

      chronoPulse.activate();

      // Should freeze only the enemy within range
      expect(enemy1.freeze).toHaveBeenCalledWith(2000);
      expect(enemy2.freeze).not.toHaveBeenCalled();
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle large number of enemies efficiently', () => {
      // Create 100 enemies, only 10 within range
      const enemies = [];
      for (let i = 0; i < 100; i++) {
        const x = i < 10 ? 100 + i * 10 : 300 + i * 10; // First 10 within range
        enemies.push({
          x,
          y: 200,
          isActive: true,
          freeze: jest.fn()
        });
      }

      mockEnemyGroup.getChildren.mockReturnValue(enemies);

      const startTime = performance.now();
      chronoPulse.activate();
      const endTime = performance.now();

      // Should complete within reasonable time (< 5ms)
      expect(endTime - startTime).toBeLessThan(5);

      // Should only freeze enemies within range
      const frozenCount = enemies.filter(e => e.freeze.mock.calls.length > 0).length;
      expect(frozenCount).toBe(10);
    });

    test('should handle enemies at exact range boundary', () => {
      const enemyAtBoundary = { x: 250, y: 200, isActive: true, freeze: jest.fn() }; // Exactly 150px away
      const enemyJustInside = { x: 249, y: 200, isActive: true, freeze: jest.fn() }; // Just inside range
      const enemyJustOutside = { x: 251, y: 200, isActive: true, freeze: jest.fn() }; // Just outside range

      mockEnemyGroup.getChildren.mockReturnValue([enemyAtBoundary, enemyJustInside, enemyJustOutside]);

      chronoPulse.activate();

      // Should freeze enemies at or inside boundary
      expect(enemyAtBoundary.freeze).toHaveBeenCalledWith(2000);
      expect(enemyJustInside.freeze).toHaveBeenCalledWith(2000);
      expect(enemyJustOutside.freeze).not.toHaveBeenCalled();
    });

    test('should handle enemies with missing freeze method gracefully', () => {
      const enemyWithoutFreeze = { x: 120, y: 200, isActive: true }; // No freeze method
      const enemyWithFreeze = { x: 150, y: 200, isActive: true, freeze: jest.fn() };

      mockEnemyGroup.getChildren.mockReturnValue([enemyWithoutFreeze, enemyWithFreeze]);

      // Should not throw error when enemy doesn't have freeze method
      expect(() => chronoPulse.activate()).not.toThrow();

      // Should still freeze enemies that have the method
      expect(enemyWithFreeze.freeze).toHaveBeenCalledWith(2000);
    });
  });

  describe('Visual Feedback Integration', () => {
    test('should create visual shockwave effect when freezing enemies', () => {
      mockEnemyGroup.getChildren.mockReturnValue([enemy1]);

      chronoPulse.activate();

      // Should create graphics object for shockwave
      expect(testScene.add.graphics).toHaveBeenCalled();
      
      // Should create GSAP timeline for animation
      expect(gsap.timeline).toHaveBeenCalled();
      
      // Should call freeze on enemy
      expect(enemy1.freeze).toHaveBeenCalledWith(2000);
    });

    test('should create visual effect even when no enemies are frozen', () => {
      mockEnemyGroup.getChildren.mockReturnValue([]);

      chronoPulse.activate();

      // Should still create visual effect even if no enemies are frozen
      expect(testScene.add.graphics).toHaveBeenCalled();
      expect(gsap.timeline).toHaveBeenCalled();
    });
  });

  describe('Real Game Integration Debugging', () => {
    test('should debug enemy access patterns in GameScene', () => {
      // Create a mock GameScene with enemies group that matches ChronoPulse expectations
      const mockGameScene = {
        enemies: {
          getChildren: jest.fn(() => [enemy1, enemy2, enemy3]),
          add: jest.fn(),
          children: [enemy1, enemy2, enemy3]
        },
        time: { now: 1000 },
        add: { 
          graphics: jest.fn(() => ({ setPosition: jest.fn(), lineStyle: jest.fn(), strokeCircle: jest.fn(), fillStyle: jest.fn(), fillCircle: jest.fn(), destroy: jest.fn() })),
          existing: jest.fn()
        },
        physics: { add: { existing: jest.fn() } },
        events: { emit: jest.fn() }
      };

      // Create ChronoPulse with expanded range
      const chronoPulse = new ChronoPulse(mockGameScene, 100, 200, { range: 300, duration: 2000 }, gsap);
      
      // Test different access patterns
      expect(mockGameScene.enemies.getChildren).toBeDefined();
      expect(typeof mockGameScene.enemies.getChildren).toBe('function');
      expect(mockGameScene.enemies.children).toBeDefined();
      expect(Array.isArray(mockGameScene.enemies.children)).toBe(true);
      
      // Activate ChronoPulse - this should call applyFreezeEffect which accesses enemies
      chronoPulse.activate();
      
      // Verify enemies were accessed
      expect(mockGameScene.enemies.getChildren).toHaveBeenCalled();
      
      // Verify freeze was called on enemies in range
      expect(enemy1.freeze).toHaveBeenCalledWith(2000);
      expect(enemy2.freeze).toHaveBeenCalledWith(2000);
      expect(enemy3.freeze).toHaveBeenCalledWith(2000);
    });

    test('should handle GameScene enemies group structure correctly', () => {
      // Simulate the exact GameScene structure
      const mockGameScene = {
        enemies: {
          getChildren: jest.fn(() => [enemy1, enemy2]),
          add: jest.fn(),
          children: [enemy1, enemy2]
        },
        time: { now: 1000 },
        add: { 
          graphics: jest.fn(() => ({ setPosition: jest.fn(), lineStyle: jest.fn(), strokeCircle: jest.fn(), fillStyle: jest.fn(), fillCircle: jest.fn(), destroy: jest.fn() })),
          existing: jest.fn()
        },
        physics: { add: { existing: jest.fn() } },
        events: { emit: jest.fn() }
      };

      const chronoPulse = new ChronoPulse(mockGameScene, 100, 200, { range: 300, duration: 2000 }, gsap);
      
      // Test the applyFreezeEffect method directly
      chronoPulse.applyFreezeEffect();
      
      // Verify the correct access pattern was used
      expect(mockGameScene.enemies.getChildren).toHaveBeenCalled();
      
      // Verify enemies were frozen
      expect(enemy1.freeze).toHaveBeenCalledWith(2000);
      expect(enemy2.freeze).toHaveBeenCalledWith(2000);
    });

    test('should work with expanded 300px range', () => {
      // Create enemies at different distances with proper jest spies
      const enemyNear = { x: 150, y: 200, freeze: jest.fn(), isActive: true }; // 50px away
      const enemyMid = { x: 300, y: 200, freeze: jest.fn(), isActive: true }; // 200px away  
      const enemyFar = { x: 500, y: 200, freeze: jest.fn(), isActive: true }; // 400px away (out of range)
      
      const mockGameScene = {
        enemies: {
          getChildren: jest.fn(() => [enemyNear, enemyMid, enemyFar]),
          add: jest.fn()
        },
        time: { now: 1000 },
        add: { 
          graphics: jest.fn(() => ({ setPosition: jest.fn(), lineStyle: jest.fn(), strokeCircle: jest.fn(), fillStyle: jest.fn(), fillCircle: jest.fn(), destroy: jest.fn() })),
          existing: jest.fn()
        },
        physics: { add: { existing: jest.fn() } },
        events: { emit: jest.fn() }
      };

      const chronoPulse = new ChronoPulse(mockGameScene, 100, 200, { range: 300, duration: 2000 }, gsap);
      
      chronoPulse.activate();
      
      // All enemies within 300px should be frozen
      expect(enemyNear.freeze).toHaveBeenCalledWith(2000);
      expect(enemyMid.freeze).toHaveBeenCalledWith(2000);
      expect(enemyFar.freeze).not.toHaveBeenCalled(); // Out of range
    });

    test('should debug distance calculation with expanded range', () => {
      // Test various distances with 300px range
      const testCases = [
        { x: 100, y: 200, expected: true, description: 'Same position' },
        { x: 200, y: 200, expected: true, description: '100px away' },
        { x: 300, y: 200, expected: true, description: '200px away' },
        { x: 350, y: 200, expected: true, description: '250px away' },
        { x: 400, y: 200, expected: false, description: '300px away (exact boundary)' },
        { x: 450, y: 200, expected: false, description: '350px away (out of range)' }
      ];

      testCases.forEach(({ x, y, expected, description }) => {
        const testEnemy = { x, y, freeze: jest.fn(), isActive: true };
        const mockGameScene = {
          enemies: { getChildren: jest.fn(() => [testEnemy]), add: jest.fn() },
          time: { now: 1000 },
          add: { 
            graphics: jest.fn(() => ({ setPosition: jest.fn(), lineStyle: jest.fn(), strokeCircle: jest.fn(), fillStyle: jest.fn(), fillCircle: jest.fn(), destroy: jest.fn() })),
            existing: jest.fn()
          },
          physics: { add: { existing: jest.fn() } },
          events: { emit: jest.fn() }
        };

        const chronoPulse = new ChronoPulse(mockGameScene, 100, 200, { range: 300, duration: 2000 }, gsap);
        chronoPulse.activate();

        if (expected) {
          expect(testEnemy.freeze).toHaveBeenCalledWith(2000);
        } else {
          expect(testEnemy.freeze).not.toHaveBeenCalled();
        }
      });
    });

    test('should handle LoopHound enemy with freeze method', () => {
      // Create a mock LoopHound with proper freeze method
      const mockLoopHound = {
        x: 200,
        y: 200,
        isActive: true,
        freeze: jest.fn(),
        isFrozen: false,
        freezeTimer: 0,
        body: { setVelocity: jest.fn() },
        anims: { stop: jest.fn() }
      };

      const mockGameScene = {
        enemies: {
          getChildren: jest.fn(() => [mockLoopHound]),
          add: jest.fn()
        },
        time: { now: 1000 },
        add: { 
          graphics: jest.fn(() => ({ setPosition: jest.fn(), lineStyle: jest.fn(), strokeCircle: jest.fn(), fillStyle: jest.fn(), fillCircle: jest.fn(), destroy: jest.fn() })),
          existing: jest.fn()
        },
        physics: { add: { existing: jest.fn() } },
        events: { emit: jest.fn() }
      };

      const chronoPulse = new ChronoPulse(mockGameScene, 100, 200, { range: 300, duration: 2000 }, gsap);
      
      chronoPulse.activate();
      
      // Verify LoopHound was frozen
      expect(mockLoopHound.freeze).toHaveBeenCalledWith(2000);
    });

    test('should provide detailed logging for debugging', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const mockGameScene = {
        enemies: {
          getChildren: jest.fn(() => [enemy1, enemy2]),
          add: jest.fn()
        },
        time: { now: 1000 },
        add: { 
          graphics: jest.fn(() => ({ setPosition: jest.fn(), lineStyle: jest.fn(), strokeCircle: jest.fn(), fillStyle: jest.fn(), fillCircle: jest.fn(), destroy: jest.fn() })),
          existing: jest.fn()
        },
        physics: { add: { existing: jest.fn() } },
        events: { emit: jest.fn() }
      };

      const chronoPulse = new ChronoPulse(mockGameScene, 100, 200, { range: 300, duration: 2000 }, gsap);
      
      chronoPulse.activate();
      
      // Verify logging messages
      expect(consoleSpy).toHaveBeenCalledWith('[ChronoPulse] Found enemies:', 2);
      expect(consoleSpy).toHaveBeenCalledWith('[ChronoPulse] Frozen enemy at position: 120, 200');
      expect(consoleSpy).toHaveBeenCalledWith('[ChronoPulse] Frozen enemy at position: 260, 200');
      expect(consoleSpy).toHaveBeenCalledWith('[ChronoPulse] Frozen 2 enemy(ies)');
      
      consoleSpy.mockRestore();
    });
  });
}); 