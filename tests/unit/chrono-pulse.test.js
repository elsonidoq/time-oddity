// GSAP mock and timeline tracking at the very top
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

import { jest } from '@jest/globals';
import ChronoPulse from '../../client/src/entities/ChronoPulse.js';
import { mockScene } from '../mocks/phaserMock.js';

let testScene;
let mockGraphics;

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

  // Create test scene with proper time mocking and Entity support
  testScene = {
    ...mockScene,
    time: { 
      now: 4000,
      add: jest.fn()
    },
    add: {
      ...mockScene.add,
      graphics: jest.fn(() => mockGraphics),
      existing: jest.fn() // Required by Entity constructor
    },
    physics: {
      ...mockScene.physics,
      add: {
        ...mockScene.physics.add,
        existing: jest.fn() // Required by Entity constructor
      }
    }
  };
});

afterEach(() => {
  jest.useRealTimers();
});

describe('ChronoPulse', () => {
  describe('Instantiation', () => {
    test('should create ChronoPulse with correct properties', () => {
      const chronoPulse = new ChronoPulse(testScene, 100, 200, {}, gsap);
      expect(chronoPulse.x).toBe(100);
      expect(chronoPulse.y).toBe(200);
      expect(chronoPulse.cooldown).toBe(3000); // 3 seconds default
      expect(chronoPulse.range).toBe(150); // Default range
      expect(chronoPulse.duration).toBe(1000); // 1 second duration
    });

    test('should extend Entity base class', () => {
      const chronoPulse = new ChronoPulse(testScene, 100, 200, {}, gsap);
      expect(chronoPulse.health).toBeDefined();
      expect(chronoPulse.takeDamage).toBeDefined();
      expect(chronoPulse.destroy).toBeDefined();
    });

    test('should accept custom configuration', () => {
      const config = {
        cooldown: 5000,
        range: 200,
        duration: 1500
      };
      
      const chronoPulse = new ChronoPulse(testScene, 100, 200, config, gsap);
      
      expect(chronoPulse.cooldown).toBe(5000);
      expect(chronoPulse.range).toBe(200);
      expect(chronoPulse.duration).toBe(1500);
    });
  });

  describe('Ability Activation', () => {
    test('should activate pulse ability successfully', () => {
      const chronoPulse = new ChronoPulse(testScene, 100, 200, {}, gsap);
      console.log('Before activate - canActivate:', chronoPulse.canActivate());
      console.log('Before activate - scene:', !!chronoPulse.scene);
      console.log('Before activate - scene.add:', !!chronoPulse.scene.add);
      console.log('Before activate - scene.add.graphics:', !!chronoPulse.scene.add.graphics);
      
      const result = chronoPulse.activate();
      console.log('After activate - result:', result);
      console.log('After activate - isActive:', chronoPulse.isActive);
      
      expect(result).toBe(true);
      expect(chronoPulse.isActive).toBe(true);
      // Debug: Check if timeline was created
      console.log('createdTimelines length:', createdTimelines.length);
      console.log('gsap.timeline calls:', gsap.timeline.mock.calls.length);
      expect(createdTimelines.length).toBeGreaterThan(0);
      expect(createdTimelines[0].to).toHaveBeenCalled();
    });

    test('should not activate if on cooldown', () => {
      // Set cooldown
      const chronoPulse = new ChronoPulse(testScene, 100, 200, {}, gsap);
      chronoPulse.lastActivationTime = testScene.time.now;
      
      const result = chronoPulse.activate();
      
      expect(result).toBe(false);
      expect(gsap.timeline).not.toHaveBeenCalled();
    });

    test('should update last activation time when activated', () => {
      const chronoPulse = new ChronoPulse(testScene, 100, 200, {}, gsap);
      const initialTime = testScene.time.now;
      chronoPulse.activate();
      
      expect(chronoPulse.lastActivationTime).toBe(initialTime);
    });

    test('should allow activation after cooldown expires', () => {
      const chronoPulse = new ChronoPulse(testScene, 100, 200, {}, gsap);
      chronoPulse.activate();
      testScene.time.now += 4000;
      const result = chronoPulse.activate();
      expect(result).toBe(true);
      expect(gsap.timeline).toHaveBeenCalledTimes(2);
      expect(createdTimelines[1].to).toHaveBeenCalled();
    });
  });

  describe('GSAP Animation', () => {
    test('should create shockwave animation with correct properties', () => {
      const chronoPulse = new ChronoPulse(testScene, 100, 200, {}, gsap);
      chronoPulse.activate();
      expect(gsap.timeline).toHaveBeenCalled();
      expect(createdTimelines.length).toBeGreaterThan(0);
      expect(createdTimelines[0].to).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          scale: expect.any(Number),
          alpha: 0,
          duration: expect.any(Number),
          ease: 'power2.out',
        })
      );
    });

    test('should create graphics object for shockwave', () => {
      const chronoPulse = new ChronoPulse(testScene, 100, 200, {}, gsap);
      chronoPulse.activate();
      
      expect(testScene.add.graphics).toHaveBeenCalled();
    });

    test('should clean up animation after completion', () => {
      const chronoPulse = new ChronoPulse(testScene, 100, 200, {}, gsap);
      chronoPulse.activate();
      chronoPulse.cleanupAnimation();
      expect(createdTimelines[0].kill).toHaveBeenCalled();
    });
  });

  describe('Cooldown Management', () => {
    test('should track cooldown state correctly', () => {
      const chronoPulse = new ChronoPulse(testScene, 100, 200, {}, gsap);
      expect(chronoPulse.canActivate()).toBe(true);
      
      chronoPulse.activate();
      expect(chronoPulse.canActivate()).toBe(false);
    });

    test('should reset cooldown after duration expires', () => {
      const chronoPulse = new ChronoPulse(testScene, 100, 200, {}, gsap);
      chronoPulse.activate();
      
      // Advance time past cooldown
      jest.advanceTimersByTime(chronoPulse.cooldown + 100);
      testScene.time.now += chronoPulse.cooldown + 100;
      
      expect(chronoPulse.canActivate()).toBe(true);
    });

    test('should handle zero cooldown configuration', () => {
      const chronoPulse = new ChronoPulse(testScene, 100, 200, { cooldown: 0 }, gsap);
      expect(chronoPulse.canActivate()).toBe(true);
      expect(chronoPulse.activate()).toBe(true);
    });

    test('should not create memory leaks with multiple activations', () => {
      const chronoPulse = new ChronoPulse(testScene, 100, 200, {}, gsap);
      const createdTimelines = [];
      
      // Mock gsap.timeline to track created timelines
      const originalTimeline = gsap.timeline;
      gsap.timeline = jest.fn((config) => {
        const timeline = {
          to: jest.fn().mockReturnThis(),
          kill: jest.fn(),
          ...config
        };
        createdTimelines.push(timeline);
        return timeline;
      });
      
      for (let i = 0; i < 5; i++) {
        // Simulate cooldown expiry
        chronoPulse.lastActivationTime = testScene.time.now - chronoPulse.cooldown;
        chronoPulse.activate();
      }
      
      // Restore original timeline
      gsap.timeline = originalTimeline;
      
      // Should create 5 timelines (one per activation)
      expect(createdTimelines.length).toBe(5);
      // Each timeline should have been created but not killed yet (they're cleaned up on next activation)
      createdTimelines.forEach(timeline => {
        expect(timeline.to).toHaveBeenCalled();
      });
    });

    test('should clean up resources on destroy', () => {
      // Patch the destroy method on the graphics prototype before activation
      const destroyMock = jest.fn();
      testScene.add.graphics = jest.fn(() => ({
        setPosition: jest.fn().mockReturnThis(),
        lineStyle: jest.fn().mockReturnThis(),
        strokeCircle: jest.fn().mockReturnThis(),
        fillStyle: jest.fn().mockReturnThis(),
        fillCircle: jest.fn().mockReturnThis(),
        destroy: destroyMock,
        scale: 1,
        alpha: 1,
      }));
      const chronoPulse = new ChronoPulse(testScene, 100, 200, {}, gsap);
      chronoPulse.activate();
      chronoPulse.cleanupAnimation();
      expect(destroyMock).toHaveBeenCalled();
    });
  });

  describe('Overlap Detection', () => {
    test('should detect overlap with enemy objects', () => {
      const chronoPulse = new ChronoPulse(testScene, 100, 200, {}, gsap);
      const mockEnemy = {
        x: 150,
        y: 200,
        isActive: true
      };
      
      const enemies = [mockEnemy];
      const overlappedEnemies = chronoPulse.detectOverlaps(enemies);
      
      expect(overlappedEnemies).toContain(mockEnemy);
    });

    test('should not detect overlap with distant enemies', () => {
      const chronoPulse = new ChronoPulse(testScene, 100, 200, {}, gsap);
      const mockEnemy = {
        x: 300, // Too far away
        y: 200,
        isActive: true
      };
      
      const enemies = [mockEnemy];
      const overlappedEnemies = chronoPulse.detectOverlaps(enemies);
      
      expect(overlappedEnemies).not.toContain(mockEnemy);
    });

    test('should ignore inactive enemies', () => {
      const chronoPulse = new ChronoPulse(testScene, 100, 200, {}, gsap);
      const mockEnemy = {
        x: 150,
        y: 200,
        isActive: false,
        active: false
      };
      
      const enemies = [mockEnemy];
      const overlappedEnemies = chronoPulse.detectOverlaps(enemies);
      
      expect(overlappedEnemies).not.toContain(mockEnemy);
    });

    test('should detect enemy when Phaser active flag is false but custom isActive is true', () => {
      const chronoPulse = new ChronoPulse(testScene, 100, 200, {}, gsap);
      const mockEnemy = {
        x: 120,
        y: 200,
        isActive: true,
        active: false
      };

      const overlappedEnemies = chronoPulse.detectOverlaps([mockEnemy]);

      expect(overlappedEnemies).toContain(mockEnemy);
    });

    test('should handle empty enemy list', () => {
      const chronoPulse = new ChronoPulse(testScene, 100, 200, {}, gsap);
      const overlappedEnemies = chronoPulse.detectOverlaps([]);
      
      expect(overlappedEnemies).toEqual([]);
    });
  });

  describe('Integration with Player', () => {
    test('should be instantiable by Player class', () => {
      // Mock Player class for integration test
      class MockPlayer {
        constructor(scene, x, y) {
          this.scene = scene;
          this.x = x;
          this.y = y;
          this.chronoPulse = new ChronoPulse(scene, x, y, {}, gsap);
        }
      }
      
      const player = new MockPlayer(testScene, 100, 200);
      
      expect(player.chronoPulse).toBeInstanceOf(ChronoPulse);
      expect(player.chronoPulse.x).toBe(100);
      expect(player.chronoPulse.y).toBe(200);
    });
  });

  describe('ChronoPulse Freeze Effect', () => {
    let chronoPulse;
    let freezeDuration = 2000;
    let mockEnemyInRange, mockEnemyOutOfRange;
    let enemies;

    beforeEach(() => {
      chronoPulse = new ChronoPulse(testScene, 100, 200, { duration: freezeDuration }, gsap);
      chronoPulse.range = 100;
      mockEnemyInRange = { x: 120, y: 210, freeze: jest.fn(), isActive: true };
      mockEnemyOutOfRange = { x: 400, y: 500, freeze: jest.fn(), isActive: true };
      enemies = [mockEnemyInRange, mockEnemyOutOfRange];
    });

    test('should call freeze on enemies within range when activated', () => {
      jest.spyOn(chronoPulse, 'detectOverlaps').mockReturnValue([mockEnemyInRange]);
      chronoPulse.activate();
      expect(mockEnemyInRange.freeze).toHaveBeenCalledWith(freezeDuration);
      expect(mockEnemyOutOfRange.freeze).not.toHaveBeenCalled();
    });

    test('should not call freeze on enemies out of range', () => {
      jest.spyOn(chronoPulse, 'detectOverlaps').mockReturnValue([]);
      chronoPulse.activate();
      expect(mockEnemyInRange.freeze).not.toHaveBeenCalled();
      expect(mockEnemyOutOfRange.freeze).not.toHaveBeenCalled();
    });

    test('should use correct freeze duration for enemies', () => {
      jest.spyOn(chronoPulse, 'detectOverlaps').mockReturnValue([mockEnemyInRange]);
      chronoPulse.activate();
      expect(mockEnemyInRange.freeze).toHaveBeenCalledWith(freezeDuration);
    });

    test('should handle enemies without freeze method gracefully', () => {
      const enemyWithoutFreeze = { x: 120, y: 210, isActive: true }; // No freeze method
      jest.spyOn(chronoPulse, 'detectOverlaps').mockReturnValue([enemyWithoutFreeze]);
      
      // Should not throw error
      expect(() => chronoPulse.activate()).not.toThrow();
    });

    test('should handle multiple enemies with different freeze methods', () => {
      const enemy1 = { x: 110, y: 200, freeze: jest.fn(), isActive: true };
      const enemy2 = { x: 150, y: 200, freeze: jest.fn(), isActive: true };
      const enemy3 = { x: 300, y: 200, freeze: jest.fn(), isActive: true }; // Out of range
      
      jest.spyOn(chronoPulse, 'detectOverlaps').mockReturnValue([enemy1, enemy2]);
      chronoPulse.activate();
      
      expect(enemy1.freeze).toHaveBeenCalledWith(freezeDuration);
      expect(enemy2.freeze).toHaveBeenCalledWith(freezeDuration);
      expect(enemy3.freeze).not.toHaveBeenCalled();
    });

    test('should handle scene.enemies as array', () => {
      const enemyArray = [
        { x: 120, y: 200, freeze: jest.fn(), isActive: true },
        { x: 300, y: 200, freeze: jest.fn(), isActive: true } // Out of range
      ];
      
      // Mock scene.enemies as array
      chronoPulse.scene.enemies = enemyArray;
      
      chronoPulse.activate();
      
      expect(enemyArray[0].freeze).toHaveBeenCalledWith(freezeDuration);
      expect(enemyArray[1].freeze).not.toHaveBeenCalled();
    });

    test('should handle scene.enemies with children property', () => {
      const enemyChildren = [
        { x: 120, y: 200, freeze: jest.fn(), isActive: true },
        { x: 300, y: 200, freeze: jest.fn(), isActive: true } // Out of range
      ];
      
      // Mock scene.enemies with children property
      chronoPulse.scene.enemies = { children: enemyChildren };
      
      chronoPulse.activate();
      
      expect(enemyChildren[0].freeze).toHaveBeenCalledWith(freezeDuration);
      expect(enemyChildren[1].freeze).not.toHaveBeenCalled();
    });

    test('should handle missing scene.enemies gracefully', () => {
      // Remove enemies from scene
      delete chronoPulse.scene.enemies;
      
      // Should not throw error and should still activate
      expect(() => chronoPulse.activate()).not.toThrow();
      expect(chronoPulse.isActive).toBe(true);
    });

    test('should handle empty enemies array', () => {
      // Mock empty enemies array
      chronoPulse.scene.enemies = [];
      
      chronoPulse.activate();
      
      // Should not throw error and should still activate
      expect(chronoPulse.isActive).toBe(true);
    });
  });
}); 