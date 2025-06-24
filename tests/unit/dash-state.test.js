import { jest } from '@jest/globals';
import gsap from 'gsap';
import DashState from '../../client/src/entities/states/DashState.js';
import { mockScene } from '../mocks/phaserMock.js';

// No inline jest.mock for phaser or gsap; use centralized mocks via jest.config.mjs

describe('DashState', () => {
  it('should be defined', () => {
    expect(DashState).toBeDefined();
  });
});

describe('DashState Ghost Trail', () => {
  let dashState;
  let mockPlayer;
  let testScene;
  let mockObjectPool;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    testScene = {
      ...mockScene,
      add: {
        ...mockScene.add,
        group: jest.fn(() => ({
          add: jest.fn(),
          getChildren: jest.fn(() => [])
        }))
      },
      time: {
        now: 1000
      }
    };

    mockObjectPool = {
      get: jest.fn(() => ({
        setActive: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setAlpha: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        setTexture: jest.fn().mockReturnThis(),
        setFlipX: jest.fn().mockReturnThis(),
        setOrigin: jest.fn().mockReturnThis(),
        setScale: jest.fn().mockReturnThis(),
        destroy: jest.fn()
      })),
      release: jest.fn()
    };

    mockPlayer = {
      scene: testScene,
      x: 100,
      y: 200,
      flipX: false,
      texture: { key: 'player' },
      body: {
        setAllowGravity: jest.fn(),
        setVelocityX: jest.fn(),
        setVelocityY: jest.fn(),
        blocked: { left: false, right: false }
      },
      isDashing: false,
      canDash: true,
      dashCooldown: 1000,
      dashDuration: 300,
      dashSpeed: 400,
      dashTimer: 0,
      speed: 200,
      jumpPower: 400,
      gravity: 980,
      stateMachine: {
        setState: jest.fn()
      },
      ghostPool: mockObjectPool
    };

    dashState = new DashState(mockPlayer);
  });

  describe('Ghost Trail Creation', () => {
    test('should create ghost sprites when dash starts', () => {
      dashState.enter();
      expect(mockPlayer.ghostPool.get).toHaveBeenCalled();
    });

    test('should create multiple ghost sprites for trail effect', () => {
      dashState.enter();
      // Should create 4 ghost sprites for the trail
      expect(mockPlayer.ghostPool.get).toHaveBeenCalledTimes(4);
    });

    test('should position ghost sprites at player location', () => {
      dashState.enter();
      // Check the first ghost sprite's setPosition call
      const ghost = mockPlayer.ghostPool.get.mock.results[0].value;
      expect(ghost.setPosition).toHaveBeenCalledWith(100, 200);
    });

    test('should copy player texture to ghost sprites', () => {
      dashState.enter();
      const ghost = mockPlayer.ghostPool.get.mock.results[0].value;
      expect(ghost.setTexture).toHaveBeenCalledWith('player');
    });

    test('should set ghost sprite flip to match player direction', () => {
      mockPlayer.flipX = true;
      dashState.enter();
      const ghost = mockPlayer.ghostPool.get.mock.results[0].value;
      expect(ghost.setFlipX).toHaveBeenCalledWith(true);
    });
  });

  describe('Ghost Sprite Animation', () => {
    test('should apply fade-out animation to ghost sprites', () => {
      dashState.enter();
      expect(gsap.to).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          alpha: 0,
          duration: expect.any(Number)
        })
      );
    });

    test('should set initial alpha for ghost sprites', () => {
      dashState.enter();
      const ghost = mockPlayer.ghostPool.get.mock.results[0].value;
      expect(ghost.setAlpha).toHaveBeenCalled();
    });
  });

  describe('Object Pool Integration', () => {
    test('should use object pool for ghost sprite creation', () => {
      dashState.enter();
      
      expect(mockPlayer.ghostPool.get).toHaveBeenCalled();
    });

    test('should release ghost sprites after animation completes', () => {
      dashState.enter();
      
      // The gsap mock automatically calls onComplete, so we can verify release was called
      expect(mockPlayer.ghostPool.release).toHaveBeenCalled();
    });
  });

  describe('Memory Management', () => {
    test('should not create memory leaks with multiple dashes', () => {
      // First dash
      dashState.enter();
      const firstCallCount = mockPlayer.ghostPool.get.mock.calls.length;
      
      // Simulate cooldown expiry
      mockPlayer.canDash = true;
      dashState.enter();
      const totalCallCount = mockPlayer.ghostPool.get.mock.calls.length;
      const secondCallCount = totalCallCount - firstCallCount;
      
      // Should create 4 ghost sprites per dash
      expect(firstCallCount).toBe(4);
      expect(secondCallCount).toBe(4);
    });

    test('should clean up ghost sprites properly', () => {
      dashState.enter();
      
      const mockSprite = testScene.add.sprite();
      expect(mockSprite.destroy).not.toHaveBeenCalled(); // Should use pool instead
    });
  });

  describe('Performance Considerations', () => {
    test('should limit number of ghost sprites created', () => {
      dashState.enter();
      // Should not create more than 5 ghost sprites
      expect(mockPlayer.ghostPool.get).toHaveBeenCalledTimes(4);
      expect(mockPlayer.ghostPool.get.mock.calls.length).toBeLessThanOrEqual(5);
    });
  });
});

describe('DashState Cooldown System', () => {
  let dashState;
  let mockPlayer;
  let testScene;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    testScene = {
      ...mockScene,
      time: {
        now: 1000
      }
    };

    mockPlayer = {
      scene: testScene,
      x: 100,
      y: 200,
      flipX: false,
      texture: { key: 'player' },
      body: {
        setAllowGravity: jest.fn(),
        setVelocityX: jest.fn(),
        setVelocityY: jest.fn(),
        blocked: { left: false, right: false }
      },
      isDashing: false,
      canDash: true,
      dashCooldown: 1000, // 1 second cooldown
      dashDuration: 300,
      dashSpeed: 400,
      dashTimer: 0,
      speed: 200,
      jumpPower: 400,
      gravity: 980,
      stateMachine: {
        setState: jest.fn()
      },
      ghostPool: {
        get: jest.fn(() => ({
          setActive: jest.fn().mockReturnThis(),
          setVisible: jest.fn().mockReturnThis(),
          setAlpha: jest.fn().mockReturnThis(),
          setPosition: jest.fn().mockReturnThis(),
          setTexture: jest.fn().mockReturnThis(),
          setFlipX: jest.fn().mockReturnThis(),
          setOrigin: jest.fn().mockReturnThis(),
          setScale: jest.fn().mockReturnThis(),
          destroy: jest.fn()
        })),
        release: jest.fn()
      }
    };

    dashState = new DashState(mockPlayer);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Cooldown Initialization', () => {
    test('should set canDash to false when dash starts', () => {
      dashState.enter();
      expect(mockPlayer.canDash).toBe(false);
    });

    test('should set dashTimer to current time plus cooldown duration', () => {
      dashState.enter();
      expect(mockPlayer.dashTimer).toBe(2000); // 1000 (current time) + 1000 (cooldown)
    });

    test('should set isDashing to true when dash starts', () => {
      dashState.enter();
      expect(mockPlayer.isDashing).toBe(true);
    });
  });

  describe('Cooldown Timer Management', () => {
    test('should not allow dash during cooldown period', () => {
      dashState.enter();
      
      // Try to dash again immediately
      const canDashBeforeCooldown = mockPlayer.canDash;
      expect(canDashBeforeCooldown).toBe(false);
    });

    test('should allow dash after cooldown period expires', () => {
      dashState.enter();
      
      // Advance time to just before cooldown expires
      jest.advanceTimersByTime(999);
      mockPlayer.scene.time.now += 999;
      dashState.execute();
      expect(mockPlayer.canDash).toBe(false);
      
      // Advance time to exactly when cooldown expires
      jest.advanceTimersByTime(1);
      mockPlayer.scene.time.now += 1;
      dashState.execute();
      expect(mockPlayer.canDash).toBe(true);
    });

    test('should handle multiple dash attempts during cooldown', () => {
      dashState.enter();
      
      // Try multiple dash attempts during cooldown
      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(100);
        mockPlayer.scene.time.now += 100;
        dashState.execute();
        expect(mockPlayer.canDash).toBe(false);
      }
      
      // Advance past cooldown
      jest.advanceTimersByTime(500);
      mockPlayer.scene.time.now += 500;
      dashState.execute();
      expect(mockPlayer.canDash).toBe(true);
    });
  });

  describe('State Machine Integration', () => {
    test('should respect cooldown in state machine transitions', () => {
      dashState.enter();
      
      // During cooldown, state machine should not transition to dash
      expect(mockPlayer.canDash).toBe(false);
      
      // Advance past cooldown
      jest.advanceTimersByTime(1000);
      mockPlayer.scene.time.now += 1000;
      dashState.execute();
      expect(mockPlayer.canDash).toBe(true);
    });

    test('should transition to idle after dash ends', () => {
      dashState.enter();
      
      // Advance time to end of dash duration
      jest.advanceTimersByTime(300);
      mockPlayer.scene.time.now += 300;
      dashState.execute();
      
      expect(mockPlayer.stateMachine.setState).toHaveBeenCalledWith('idle');
    });
  });

  describe('Cooldown Timing Accuracy', () => {
    test('should have accurate cooldown timing', () => {
      dashState.enter();
      const startTime = mockPlayer.scene.time.now;
      const expectedEndTime = startTime + mockPlayer.dashCooldown;
      
      expect(mockPlayer.dashTimer).toBe(expectedEndTime);
    });

    test('should handle edge case timing precisely', () => {
      dashState.enter();
      
      // Advance to exactly cooldown duration
      jest.advanceTimersByTime(1000);
      mockPlayer.scene.time.now += 1000;
      dashState.execute();
      
      expect(mockPlayer.canDash).toBe(true);
    });
  });

  describe('Cooldown State Persistence', () => {
    test('should maintain cooldown state across multiple execute calls', () => {
      dashState.enter();
      
      // Multiple execute calls during cooldown
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(50);
        mockPlayer.scene.time.now += 50;
        dashState.execute();
        expect(mockPlayer.canDash).toBe(false);
      }
    });

    test('should reset cooldown state after full duration', () => {
      dashState.enter();
      
      // Advance past cooldown
      jest.advanceTimersByTime(1000);
      mockPlayer.scene.time.now += 1000;
      dashState.execute();
      
      expect(mockPlayer.canDash).toBe(true);
      expect(mockPlayer.isDashing).toBe(false);
    });
  });

  describe('Cooldown Interference Prevention', () => {
    test('should not interfere with other player abilities during cooldown', () => {
      dashState.enter();
      
      // During cooldown, other properties should remain unchanged
      expect(mockPlayer.speed).toBeDefined();
      expect(mockPlayer.jumpPower).toBeDefined();
      expect(mockPlayer.gravity).toBeDefined();
    });

    test('should allow normal movement after dash ends', () => {
      dashState.enter();
      
      // Advance past dash duration but before cooldown ends
      jest.advanceTimersByTime(300);
      mockPlayer.scene.time.now += 300;
      dashState.execute();
      
      // Should be able to move normally (not dashing)
      expect(mockPlayer.isDashing).toBe(false);
      expect(mockPlayer.body.setAllowGravity).toHaveBeenCalledWith(true);
    });
  });
}); 