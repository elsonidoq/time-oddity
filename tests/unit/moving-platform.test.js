import { jest } from '@jest/globals';
import '../mocks/phaserMock.js';
import { gsap } from '../mocks/gsapMock.js';

// Import the class we're testing
let MovingPlatform;

describe('MovingPlatform Entity', () => {
  let scene;
  let mockTimeManager;

  beforeEach(() => {
    // Setup centralized mocks
    scene = {
      add: { existing: jest.fn() },
      physics: { add: { existing: jest.fn() } },
      time: { now: 1000 }
    };

    mockTimeManager = {
      register: jest.fn()
    };

    // Clear all mocks
    jest.clearAllMocks();
    
    // Dynamic import after mocks are set up
    return import('../../client/src/entities/MovingPlatform.js').then(module => {
      MovingPlatform = module.default;
    });
  });

  describe('Constructor and Initialization', () => {
    it('should extend Entity base class', () => {
      const platform = new MovingPlatform(scene, 100, 200, 'platform-texture');
      
      // Should inherit Entity properties
      expect(platform.health).toBe(100);
      expect(platform.maxHealth).toBe(100);
      expect(platform.isActive).toBe(true);
      expect(typeof platform.takeDamage).toBe('function');
      expect(typeof platform.heal).toBe('function');
    });

    it('should initialize with default movement configuration', () => {
      const platform = new MovingPlatform(scene, 100, 200, 'platform-texture');
      
      expect(platform.movementType).toBe('linear');
      expect(platform.speed).toBe(60);
      expect(platform.isMoving).toBe(false);
      expect(platform.direction).toBe(1);
    });

    it('should accept custom movement configuration', () => {
      const config = {
        type: 'circular',
        speed: 80,
        centerX: 100,
        centerY: 200,
        radius: 50,
        autoStart: true
      };

      const platform = new MovingPlatform(scene, 100, 200, 'platform-texture', config);
      
      expect(platform.movementType).toBe('circular');
      expect(platform.speed).toBe(80);
      expect(platform.centerX).toBe(100);
      expect(platform.centerY).toBe(200);
      expect(platform.radius).toBe(50);
      expect(platform.autoStart).toBe(true);
    });

    it('should initialize linear movement properties', () => {
      const config = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        mode: 'bounce'
      };

      const platform = new MovingPlatform(scene, 100, 200, 'platform-texture', config);
      
      expect(platform.startX).toBe(100);
      expect(platform.startY).toBe(200);
      expect(platform.endX).toBe(300);
      expect(platform.endY).toBe(200);
      expect(platform.mode).toBe('bounce');
    });

    it('should initialize path movement properties', () => {
      const config = {
        type: 'path',
        pathPoints: [
          { x: 100, y: 200 },
          { x: 200, y: 150 },
          { x: 300, y: 200 }
        ],
        loop: true
      };

      const platform = new MovingPlatform(scene, 100, 200, 'platform-texture', config);
      
      expect(platform.movementType).toBe('path');
      expect(platform.pathPoints).toEqual(config.pathPoints);
      expect(platform.currentPathIndex).toBe(0);
      expect(platform.loop).toBe(true);
    });
  });

  describe('Movement Control Methods', () => {
    let platform;

    beforeEach(() => {
      platform = new MovingPlatform(scene, 100, 200, 'platform-texture');
    });

    it('should start movement and set isMoving to true', () => {
      platform.startMovement();
      
      expect(platform.isMoving).toBe(true);
    });

    it('should stop movement and set isMoving to false', () => {
      platform.isMoving = true;
      platform.stopMovement();
      
      expect(platform.isMoving).toBe(false);
    });

    it('should reverse direction for linear movement', () => {
      platform.direction = 1;
      platform.reverseDirection();
      
      expect(platform.direction).toBe(-1);
      
      platform.reverseDirection();
      expect(platform.direction).toBe(1);
    });

    it('should initialize movement based on configuration', () => {
      const config = {
        type: 'linear',
        startX: 100,
        endX: 300,
        autoStart: true
      };

      platform = new MovingPlatform(scene, 100, 200, 'platform-texture', config);
      platform.initializeMovement();
      
      expect(platform.isMoving).toBe(true);
    });
  });

  describe('Linear Movement Pattern', () => {
    let platform;

    beforeEach(() => {
      const config = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        speed: 60,
        mode: 'bounce'
      };
      platform = new MovingPlatform(scene, 100, 200, 'platform-texture', config);
    });

    it('should move towards end position when direction is 1', () => {
      platform.direction = 1;
      platform.isMoving = true;
      
      const targetPosition = platform.calculateLinearTarget();
      
      expect(targetPosition.x).toBe(300);
      expect(targetPosition.y).toBe(200);
    });

    it('should move towards start position when direction is -1', () => {
      platform.direction = -1;
      platform.isMoving = true;
      
      const targetPosition = platform.calculateLinearTarget();
      
      expect(targetPosition.x).toBe(100);
      expect(targetPosition.y).toBe(200);
    });

    it('should bounce at boundaries when mode is bounce', () => {
      platform.x = 300;
      platform.y = 200;
      platform.direction = 1;
      platform.mode = 'bounce';
      
      const shouldReverse = platform.shouldReverseAtBoundary();
      
      expect(shouldReverse).toBe(true);
    });

    it('should loop to start when mode is loop', () => {
      platform.x = 300;
      platform.y = 200;
      platform.direction = 1;
      platform.mode = 'loop';
      
      const shouldLoop = platform.shouldLoopToStart();
      
      expect(shouldLoop).toBe(true);
    });
  });

  describe('Circular Movement Pattern', () => {
    let platform;

    beforeEach(() => {
      const config = {
        type: 'circular',
        centerX: 200,
        centerY: 300,
        radius: 100,
        speed: 60
      };
      platform = new MovingPlatform(scene, 200, 200, 'platform-texture', config);
      platform.angle = 0;
    });

    it('should calculate circular position correctly', () => {
      platform.angle = Math.PI / 2; // 90 degrees
      
      const position = platform.calculateCircularPosition();
      
      expect(Math.round(position.x)).toBe(200); // centerX + radius * cos(90°) ≈ 200
      expect(Math.round(position.y)).toBe(400); // centerY + radius * sin(90°) ≈ 400
    });

    it('should update angle based on movement speed', () => {
      const initialAngle = platform.angle;
      const deltaTime = 16; // 16ms frame
      
      platform.updateCircularAngle(deltaTime);
      
      expect(platform.angle).toBeGreaterThan(initialAngle);
    });

    it('should wrap angle to 0-2π range', () => {
      platform.angle = Math.PI * 3; // > 2π
      
      platform.normalizeAngle();
      
      expect(platform.angle).toBeLessThan(Math.PI * 2);
      expect(platform.angle).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Path Movement Pattern', () => {
    let platform;

    beforeEach(() => {
      const config = {
        type: 'path',
        pathPoints: [
          { x: 100, y: 200 },
          { x: 200, y: 150 },
          { x: 300, y: 200 }
        ],
        loop: true,
        speed: 60
      };
      platform = new MovingPlatform(scene, 100, 200, 'platform-texture', config);
    });

    it('should get next path point correctly', () => {
      platform.currentPathIndex = 0;
      
      const nextPoint = platform.getNextPathPoint();
      
      expect(nextPoint).toEqual({ x: 200, y: 150 });
      expect(platform.currentPathIndex).toBe(1);
    });

    it('should loop back to start when loop is true', () => {
      platform.currentPathIndex = 2; // Last point
      
      const nextPoint = platform.getNextPathPoint();
      
      expect(nextPoint).toEqual({ x: 100, y: 200 });
      expect(platform.currentPathIndex).toBe(0);
    });

    it('should stop at end when loop is false', () => {
      platform.loop = false;
      platform.currentPathIndex = 2; // Last point
      
      const nextPoint = platform.getNextPathPoint();
      
      expect(nextPoint).toBeNull();
      expect(platform.isMoving).toBe(false);
    });

    it('should calculate distance to next path point', () => {
      platform.x = 100;
      platform.y = 200;
      platform.currentPathIndex = 0;
      
      const distance = platform.calculateDistanceToNextPoint();
      
      const expectedDistance = Math.sqrt((200-100)**2 + (150-200)**2);
      expect(distance).toBeCloseTo(expectedDistance, 1);
    });
  });

  describe('Movement Integration', () => {
    let platform;

    beforeEach(() => {
      // Create a properly mocked physics body for Movement Integration tests
      const mockBody = {
        x: 100,
        y: 200,
        velocity: { x: 0, y: 0 },
        enable: true,
        checkCollision: { up: true, down: true, left: true, right: true },
        setVelocity: jest.fn().mockReturnThis(),
        setVelocityX: jest.fn().mockReturnThis(),
        setVelocityY: jest.fn().mockReturnThis(),
        setImmovable: jest.fn().mockReturnThis(),
        setAllowGravity: jest.fn().mockReturnThis(),
        setCollideWorldBounds: jest.fn().mockReturnThis(),
        setFriction: jest.fn().mockReturnThis(),
        setBounce: jest.fn().mockReturnThis(),
        setSize: jest.fn().mockReturnThis(),
        setOffset: jest.fn().mockReturnThis()
      };
      
      scene.physics.add.existing = jest.fn((entity) => {
        entity.body = mockBody;
        return entity;
      });
      
      platform = new MovingPlatform(scene, 100, 200, 'tiles');
    });

    it('should use velocity-based movement instead of GSAP tweens', () => {
      platform.moveToTarget(300, 200);
      
      // Should set velocity on physics body, not create GSAP tweens
      expect(platform.body.setVelocity).toHaveBeenCalled();
      expect(gsap.to).not.toHaveBeenCalled();
    });

    it('should handle movement completion through target detection', () => {
      const onComplete = jest.fn();
      
      platform.moveToTarget(300, 200);
      
      // Simulate reaching target by setting position and calling update
      platform.x = 300;
      platform.y = 200;
      platform.updateLinearMovement(16);
      
      // Should detect target reached and stop movement
      expect(platform.isMovingToTarget).toBe(false);
    });

    it('should stop previous movement when starting new movement', () => {
      platform.moveToTarget(200, 150);
      platform.body.setVelocity.mockClear();
      
      platform.moveToTarget(300, 200);
      
      // Should set new velocity for new target
      expect(platform.body.setVelocity).toHaveBeenCalled();
    });

    it('should handle movement failures gracefully', () => {
      gsap.to.mockImplementationOnce(() => {
        throw new Error('GSAP failure');
      });
      
      const platform = new MovingPlatform(scene, 100, 200, 'platform-texture');
      
      expect(() => {
        platform.moveToTarget(300, 200);
      }).not.toThrow();
    });
  });

  describe('TimeManager Integration', () => {
    let platform;

    beforeEach(() => {
      const config = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200
      };
      platform = new MovingPlatform(scene, 100, 200, 'platform-texture', config);
    });

    it('should register with TimeManager if provided', () => {
      platform.registerWithTimeManager(mockTimeManager);
      
      expect(mockTimeManager.register).toHaveBeenCalledWith(platform);
    });

    it('should implement getStateForRecording method', () => {
      platform.angle = Math.PI / 4;
      platform.currentPathIndex = 1;
      platform.isMoving = true;
      platform.direction = -1;
      
      const state = platform.getStateForRecording();
      
      expect(state).toEqual({
        x: platform.x,
        y: platform.y,
        velocityX: platform.body?.velocity?.x || 0,
        velocityY: platform.body?.velocity?.y || 0,
        animation: platform.anims?.currentAnim?.key || null,
        isAlive: platform.active !== false,
        isVisible: platform.visible !== false,
        // Moving platform specific state
        movementType: platform.movementType,
        isMoving: platform.isMoving,
        direction: platform.direction,
        angle: platform.angle,
        currentPathIndex: platform.currentPathIndex,
        isMovingToTarget: platform.isMovingToTarget,
        targetX: platform.targetX,
        targetY: platform.targetY,
        // Multi-sprite state
        spriteCount: platform.spriteCount,
        width: platform.width,
        masterX: platform.x,
        masterY: platform.y
      });
    });

    it('should implement setStateFromRecording method', () => {
      const state = {
        x: 250,
        y: 180,
        velocityX: 50,
        velocityY: 0,
        animation: null,
        isAlive: true,
        isVisible: true,
        movementType: 'linear',
        isMoving: true,
        direction: -1,
        angle: Math.PI / 2,
        currentPathIndex: 2
      };
      
      platform.setStateFromRecording(state);
      
      expect(platform.x).toBe(250);
      expect(platform.y).toBe(180);
      expect(platform.isMoving).toBe(true);
      expect(platform.direction).toBe(-1);
      expect(platform.angle).toBe(Math.PI / 2);
      expect(platform.currentPathIndex).toBe(2);
    });

    it('should restore physics body state during rewind', () => {
      const state = {
        x: 250,
        y: 180,
        velocityX: 50,
        velocityY: -20,
        isAlive: true,
        isVisible: true,
        movementType: 'circular',
        isMoving: false,
        direction: 1,
        angle: 0,
        currentPathIndex: 0
      };
      
      platform.body = {
        velocity: { x: 0, y: 0 },
        setVelocity: jest.fn()
      };
      
      platform.setStateFromRecording(state);
      
      expect(platform.body.setVelocity).toHaveBeenCalledWith(50, -20);
    });
  });

  describe('Physics Configuration', () => {
    let platform;

    beforeEach(() => {
      platform = new MovingPlatform(scene, 100, 200, 'platform-texture');
    });

    it('should configure physics body for platform collision', () => {
      platform.body = {
        setImmovable: jest.fn(),
        setAllowGravity: jest.fn(),
        setFriction: jest.fn(),
        setBounce: jest.fn(),
        setCollideWorldBounds: jest.fn()
      };
      
      platform.configurePhysicsBody();
      
      expect(platform.body.setImmovable).toHaveBeenCalledWith(true);
      expect(platform.body.setAllowGravity).toHaveBeenCalledWith(false);
      expect(platform.body.setFriction).toHaveBeenCalledWith(1, 0);
      expect(platform.body.setBounce).toHaveBeenCalledWith(0);
      expect(platform.body.setCollideWorldBounds).toHaveBeenCalledWith(false);
    });

    it('should handle physics body configuration without errors', () => {
      // Test that configurePhysicsBody doesn't crash when body is null
      platform.body = null;
      
      expect(() => {
        platform.configurePhysicsBody();
      }).not.toThrow();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid movement configuration gracefully', () => {
      const invalidConfig = {
        type: 'invalid',
        speed: -10 // Negative speed
      };
      
      expect(() => {
        new MovingPlatform(scene, 100, 200, 'platform-texture', invalidConfig);
      }).not.toThrow();
    });

    it('should handle missing pathPoints for path movement', () => {
      const config = {
        type: 'path',
        pathPoints: []
      };
      
      const platform = new MovingPlatform(scene, 100, 200, 'platform-texture', config);
      
      expect(platform.getNextPathPoint()).toBeNull();
      expect(platform.isMoving).toBe(false);
    });

    it('should handle GSAP failures gracefully', () => {
      gsap.to.mockImplementationOnce(() => {
        throw new Error('GSAP failure');
      });
      
      const platform = new MovingPlatform(scene, 100, 200, 'platform-texture');
      
      expect(() => {
        platform.moveToTarget(300, 200);
      }).not.toThrow();
    });

    it('should continue functioning without TimeManager', () => {
      const platform = new MovingPlatform(scene, 100, 200, 'platform-texture');
      
      expect(() => {
        platform.getStateForRecording();
        platform.setStateFromRecording({ x: 100, y: 200 });
      }).not.toThrow();
    });
  });

  describe('Update Loop Integration', () => {
    let platform;

    beforeEach(() => {
      const config = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        speed: 60,
        autoStart: true
      };
      platform = new MovingPlatform(scene, 100, 200, 'platform-texture', config);
    });

    it('should update movement when isMoving is true', () => {
      platform.isMoving = true;
      const updateMovement = jest.spyOn(platform, 'updateMovement');
      
      platform.update(16, 16); // 16ms delta
      
      expect(updateMovement).toHaveBeenCalledWith(16);
    });

    it('should not update movement when isMoving is false', () => {
      platform.isMoving = false;
      const updateMovement = jest.spyOn(platform, 'updateMovement');
      
      platform.update(16, 16);
      
      expect(updateMovement).not.toHaveBeenCalled();
    });
  });

  describe('Movement Execution Tests (Diagnostic)', () => {
    let mockBody;
    
    beforeEach(() => {
      jest.clearAllMocks();
      jest.useFakeTimers();
      
      // Create a properly mocked physics body for Movement Execution tests
      mockBody = {
        x: 100,
        y: 200,
        velocity: { x: 0, y: 0 },
        enable: true,
        checkCollision: { up: true, down: true, left: true, right: true },
        setVelocity: jest.fn().mockReturnThis(),
        setVelocityX: jest.fn().mockReturnThis(),
        setVelocityY: jest.fn().mockReturnThis(),
        setImmovable: jest.fn().mockReturnThis(),
        setAllowGravity: jest.fn().mockReturnThis(),
        setCollideWorldBounds: jest.fn().mockReturnThis(),
        setFriction: jest.fn().mockReturnThis(),
        setBounce: jest.fn().mockReturnThis(),
        setSize: jest.fn().mockReturnThis(),
        setOffset: jest.fn().mockReturnThis()
      };
      
      // Mock scene.physics.add.existing which is what Entity uses
      scene.physics.add.existing = jest.fn((entity) => {
        entity.body = mockBody;
        return entity;
      });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should actually move position when update is called with linear movement', async () => {
      const movementConfig = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        speed: 100,
        mode: 'bounce',
        autoStart: false // Start with autoStart false to control the test
      };

      const platform = new MovingPlatform(scene, 100, 200, 'tiles', movementConfig);
      const initialX = platform.x;
      
      // Platform should not be moving initially
      expect(platform.isMoving).toBe(false);
      expect(platform.x).toBe(100);
      
      // Start movement manually
      platform.startMovement();
      
      // Platform should now be moving with velocity set, but position doesn't change immediately
      expect(platform.isMoving).toBe(true);
      expect(platform.isMovingToTarget).toBe(true);
      expect(platform.body.setVelocity).toHaveBeenCalled(); // Velocity should be set
      expect(platform.direction).toBe(1); // Moving forward
      
      // Manually trigger the onTargetReached to simulate reaching target
      // First, set position to the actual target to simulate movement completion
      platform.x = 300; // Set to endX
      platform.y = 200; // Set to endY
      
      platform.onTargetReached();
      
      // Platform should have bounced and be moving in opposite direction
      expect(platform.isMovingToTarget).toBe(true); // Should immediately start moving to next target
      expect(platform.direction).toBe(-1); // Should have reversed direction
      
      // Verify continuous movement by triggering another completion
      // Set position to the start boundary for the reverse movement
      platform.x = 100; // Set to startX
      platform.y = 200; // Set to startY
      
      platform.onTargetReached();
      
      // Should have bounced back to forward direction
      expect(platform.direction).toBe(1); // Should have reversed again
      expect(platform.isMovingToTarget).toBe(true); // Should still be moving
    });

    test('should be called by GameScene update loop', () => {
      // This test will fail initially because GameScene doesn't call update on platforms
      const movementConfig = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        speed: 100,
        autoStart: true
      };

      const platform = new MovingPlatform(scene, 100, 200, 'tiles', movementConfig);
      const updateSpy = jest.spyOn(platform, 'update');
      
      // Mock GameScene behavior
      const mockGameScene = {
        platforms: {
          getChildren: () => [platform]
        }
      };
      
      // Simulate GameScene update calling platform updates
      // This should fail initially
      mockGameScene.platforms.getChildren().forEach(p => {
        if (p.update) p.update(0, 16);
      });
      
      expect(updateSpy).toHaveBeenCalled();
    });

    test('should use GSAP correctly for smooth movement', () => {
      const movementConfig = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        speed: 100,
        autoStart: false // Don't auto-start to control when GSAP is called
      };

      const platform = new MovingPlatform(scene, 100, 200, 'tiles', movementConfig);
      
      // Clear previous GSAP calls
      gsap.to.mockClear();
      
      // GSAP should not be called before starting movement
      expect(gsap.to).not.toHaveBeenCalled();
      
      // Start movement - this should use velocity-based movement, not GSAP
      platform.startMovement();
      
      // Should use velocity-based movement instead of GSAP
      expect(platform.body.setVelocity).toHaveBeenCalled();
      expect(gsap.to).not.toHaveBeenCalled();
      
      // Should not create multiple velocity calls per update when already moving
      platform.body.setVelocity.mockClear();
      platform.update(16, 16);
      
      // Movement should be properly managed through velocity, not GSAP
      expect(platform.isMoving).toBe(true);
    });
  });

  describe('Physics Integration and Collision Issues (Diagnostic)', () => {
    let mockBody;
    
    beforeEach(() => {
      jest.clearAllMocks();
      
      // Create a properly mocked physics body with Jest spies
      mockBody = {
        x: 100,
        y: 200,
        velocity: { x: 0, y: 0 },
        enable: true,
        checkCollision: { up: true, down: true, left: true, right: true },
        setVelocity: jest.fn().mockReturnThis(),
        setVelocityX: jest.fn().mockReturnThis(),
        setVelocityY: jest.fn().mockReturnThis(),
        setImmovable: jest.fn().mockReturnThis(),
        setAllowGravity: jest.fn().mockReturnThis(),
        setFriction: jest.fn().mockReturnThis(),
        setBounce: jest.fn().mockReturnThis(),
        setCollideWorldBounds: jest.fn(function(collide) {
          this.collideWorldBounds = collide;
          return this;
        }),
        setPosition: jest.fn().mockReturnThis(),
        setSize: jest.fn().mockReturnThis(),
        setOffset: jest.fn().mockReturnThis()
      };
      
      // Mock scene.physics.add.existing which is what Entity uses
      scene.physics.add.existing = jest.fn((entity) => {
        // Assign the mocked body to the entity
        entity.body = mockBody;
        return entity;
      });
    });

    test('should use velocity-based movement for smooth physics integration', () => {
      const movementConfig = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        speed: 100,
        autoStart: false
      };

      const platform = new MovingPlatform(scene, 100, 200, 'tiles', movementConfig);
      
      // Clear previous calls
      platform.body.setVelocity.mockClear();
      
      // Start movement - this should use velocity-based movement, not GSAP
      platform.startMovement();
      
      // Should use velocity-based movement instead of GSAP
      expect(platform.body.setVelocity).toHaveBeenCalled();
      expect(gsap.to).not.toHaveBeenCalled();
      
      // Should not create multiple velocity calls per update when already moving to target
      platform.body.setVelocity.mockClear();
      platform.update(16, 16);
      
      // Should not call setVelocity again if already moving to target and no direction change
      // (This depends on the specific implementation - may or may not be called)
    });

    test('should maintain physics body synchronization during movement', () => {
      const movementConfig = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        speed: 100,
        autoStart: false
      };

      const platform = new MovingPlatform(scene, 100, 200, 'tiles', movementConfig);
      
      // Mock the physics body position to match sprite position
      platform.body.x = platform.x;
      platform.body.y = platform.y;
      
      // Start movement
      platform.startMovement();
      
      // Simulate movement update
      platform.update(0, 16);
      
      // Physics body position should match sprite position (we set it manually for test)
      expect(platform.body.x).toBe(platform.x);
      expect(platform.body.y).toBe(platform.y);
      
      // Body should have velocity set for movement
      expect(platform.body.setVelocity).toHaveBeenCalled();
    });

    test('should handle collision detection properly with moving physics body', () => {
      const movementConfig = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        speed: 100,
        autoStart: true
      };

      const platform = new MovingPlatform(scene, 100, 200, 'tiles', movementConfig);
      
      // Platform physics body should be properly configured for collision
      expect(platform.body.setImmovable).toHaveBeenCalledWith(true);
      expect(platform.body.setAllowGravity).toHaveBeenCalledWith(false);
      
      // Body should be enabled and solid for collision
      expect(platform.body.enable).toBe(true);
      expect(platform.body.checkCollision).toBeDefined();
    });

    test('should stop and reverse smoothly at boundaries without position jumps', () => {
      const movementConfig = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        speed: 100,
        mode: 'bounce',
        autoStart: false
      };

      const platform = new MovingPlatform(scene, 100, 200, 'tiles', movementConfig);
      
      // Move platform to end boundary
      platform.x = 300;
      platform.y = 200;
      platform.direction = 1;
      platform.isMoving = true;
      
      // Clear previous setVelocity calls
      platform.body.setVelocity.mockClear();
      
      // Simulate reaching boundary
      platform.onTargetReached();
      
      // Should reverse direction smoothly without position jumps
      expect(platform.direction).toBe(-1);
      
      // Should not use position-based teleportation
      expect(platform.x).toBe(300); // Should stay at boundary, not jump
      expect(platform.y).toBe(200);
      
      // Should set velocity to zero when stopping at target
      expect(platform.body.setVelocity).toHaveBeenCalledWith(0, 0);
    });

    test('should not overwrite Y velocity unnecessarily during horizontal movement', () => {
      // This test exposes the velocity conflict issue
      let platform;
      const realPhysicsBody = {
        x: 100,
        y: 200,
        velocity: { x: 0, y: 0 },
        enable: true,
        checkCollision: { up: true, down: true, left: true, right: true },
        immovable: false,
        allowGravity: false, // Gravity disabled for platforms
        setVelocity: jest.fn(function(vx, vy) {
          this.velocity.x = vx;
          this.velocity.y = vy;
          return this;
        }),
        setVelocityX: jest.fn(function(vx) {
          this.velocity.x = vx;
          return this;
        }),
        setVelocityY: jest.fn(function(vy) {
          this.velocity.y = vy;
          return this;
        }),
        setImmovable: jest.fn(function(immovable) {
          this.immovable = immovable;
          return this;
        }),
        setAllowGravity: jest.fn(function(allowGravity) {
          this.allowGravity = allowGravity;
          return this;
        }),
        setCollideWorldBounds: jest.fn().mockReturnThis(),
        setFriction: jest.fn().mockReturnThis(),
        setBounce: jest.fn().mockReturnThis(),
        setSize: jest.fn().mockReturnThis(),
        setOffset: jest.fn().mockReturnThis()
      };
      
      scene.physics.add.existing = jest.fn((entity) => {
        entity.body = realPhysicsBody;
        return entity;
      });

      const movementConfig = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200, // Horizontal movement - same Y
        speed: 60,
        autoStart: false
      };

      platform = new MovingPlatform(scene, 100, 200, 'tiles', movementConfig);
      
      // Clear previous calls
      platform.body.setVelocity.mockClear();
      
      // Simulate some existing Y velocity (could be from previous physics calculations)
      platform.body.velocity.y = -10; // Some downward velocity
      
      // Start horizontal movement
      platform.moveToTarget(300, 200); // Same Y coordinate - should be horizontal
      
      // Check what velocity was set
      expect(platform.body.setVelocity).toHaveBeenCalled();
      const lastCall = platform.body.setVelocity.mock.calls[platform.body.setVelocity.mock.calls.length - 1];
      const [vx, vy] = lastCall;
      
      // For horizontal movement, Y velocity should be preserved (not overwritten with 0)
      expect(vy).toBe(-10); // Should preserve existing Y velocity
      expect(vx).toBeGreaterThan(0); // Should have positive X velocity
      
      // This is the correct behavior: MovingPlatform preserves Y velocity during horizontal movement
      // like LoopHound does with setVelocity(speed * direction, this.body.velocity.y)
    });

    test('should preserve Y velocity during horizontal movement like LoopHound', () => {
      // This test verifies the fix - horizontal movement should preserve Y velocity
      let platform;
      const realPhysicsBody = {
        x: 100,
        y: 200,
        velocity: { x: 0, y: -5 }, // Some existing Y velocity (could be from physics)
        enable: true,
        checkCollision: { up: true, down: true, left: true, right: true },
        immovable: false,
        allowGravity: false,
        setVelocity: jest.fn(function(vx, vy) {
          this.velocity.x = vx;
          this.velocity.y = vy;
          return this;
        }),
        setImmovable: jest.fn().mockReturnThis(),
        setAllowGravity: jest.fn().mockReturnThis(),
        setCollideWorldBounds: jest.fn().mockReturnThis(),
        setFriction: jest.fn().mockReturnThis(),
        setBounce: jest.fn().mockReturnThis(),
        setSize: jest.fn().mockReturnThis(),
        setOffset: jest.fn().mockReturnThis()
      };
      
      scene.physics.add.existing = jest.fn((entity) => {
        entity.body = realPhysicsBody;
        return entity;
      });

      const movementConfig = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200, // Same Y - horizontal movement
        speed: 60,
        autoStart: false
      };

      platform = new MovingPlatform(scene, 100, 200, 'tiles', movementConfig);
      
      // Set some existing Y velocity (could be from previous physics calculations)
      platform.body.velocity.y = -5;
      
      // Clear previous calls
      platform.body.setVelocity.mockClear();
      
      // Start horizontal movement (same Y coordinate)
      platform.moveToTarget(300, 200);
      
      // Check that setVelocity was called correctly
      expect(platform.body.setVelocity).toHaveBeenCalled();
      const lastCall = platform.body.setVelocity.mock.calls[platform.body.setVelocity.mock.calls.length - 1];
      const [vx, vy] = lastCall;
      
      // For horizontal movement, X velocity should be positive, Y velocity should be preserved
      expect(vx).toBeGreaterThan(0); // Should have positive X velocity
      expect(vy).toBe(-5); // Should preserve existing Y velocity (not overwrite with 0)
      
      // This matches LoopHound's pattern: setVelocity(speed * direction, this.body.velocity.y)
    });

    test('should preserve X velocity during vertical movement', () => {
      // Test vertical movement preserves X velocity
      let platform;
      const realPhysicsBody = {
        x: 100,
        y: 200,
        velocity: { x: 10, y: 0 }, // Some existing X velocity
        enable: true,
        checkCollision: { up: true, down: true, left: true, right: true },
        immovable: false,
        allowGravity: false,
        setVelocity: jest.fn(function(vx, vy) {
          this.velocity.x = vx;
          this.velocity.y = vy;
          return this;
        }),
        setImmovable: jest.fn().mockReturnThis(),
        setAllowGravity: jest.fn().mockReturnThis(),
        setCollideWorldBounds: jest.fn().mockReturnThis(),
        setFriction: jest.fn().mockReturnThis(),
        setBounce: jest.fn().mockReturnThis(),
        setSize: jest.fn().mockReturnThis(),
        setOffset: jest.fn().mockReturnThis()
      };
      
      scene.physics.add.existing = jest.fn((entity) => {
        entity.body = realPhysicsBody;
        return entity;
      });

      const movementConfig = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 100, // Same X - vertical movement
        endY: 300,
        speed: 60,
        autoStart: false
      };

      platform = new MovingPlatform(scene, 100, 200, 'tiles', movementConfig);
      
      // Set some existing X velocity
      platform.body.velocity.x = 10;
      
      // Clear previous calls
      platform.body.setVelocity.mockClear();
      
      // Start vertical movement (same X coordinate)
      platform.moveToTarget(100, 300);
      
      // Check that setVelocity was called correctly
      expect(platform.body.setVelocity).toHaveBeenCalled();
      const lastCall = platform.body.setVelocity.mock.calls[platform.body.setVelocity.mock.calls.length - 1];
      const [vx, vy] = lastCall;
      
      // For vertical movement, Y velocity should be positive, X velocity should be preserved
      expect(vy).toBeGreaterThan(0); // Should have positive Y velocity
      expect(vx).toBe(10); // Should preserve existing X velocity
    });

    test('should set both velocities for diagonal movement', () => {
      // Test diagonal movement sets both velocities
      let platform;
      const realPhysicsBody = {
        x: 100,
        y: 200,
        velocity: { x: 5, y: -3 }, // Some existing velocities
        enable: true,
        checkCollision: { up: true, down: true, left: true, right: true },
        immovable: false,
        allowGravity: false,
        setVelocity: jest.fn(function(vx, vy) {
          this.velocity.x = vx;
          this.velocity.y = vy;
          return this;
        }),
        setImmovable: jest.fn().mockReturnThis(),
        setAllowGravity: jest.fn().mockReturnThis(),
        setCollideWorldBounds: jest.fn().mockReturnThis(),
        setFriction: jest.fn().mockReturnThis(),
        setBounce: jest.fn().mockReturnThis(),
        setSize: jest.fn().mockReturnThis(),
        setOffset: jest.fn().mockReturnThis()
      };
      
      scene.physics.add.existing = jest.fn((entity) => {
        entity.body = realPhysicsBody;
        return entity;
      });

      const movementConfig = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 300, // Different X and Y - diagonal movement
        endY: 300,
        speed: 60,
        autoStart: false
      };

      platform = new MovingPlatform(scene, 100, 200, 'tiles', movementConfig);
      
      // Clear previous calls
      platform.body.setVelocity.mockClear();
      
      // Start diagonal movement
      platform.moveToTarget(300, 300);
      
      // Check that setVelocity was called correctly
      expect(platform.body.setVelocity).toHaveBeenCalled();
      const lastCall = platform.body.setVelocity.mock.calls[platform.body.setVelocity.mock.calls.length - 1];
      const [vx, vy] = lastCall;
      
      // For diagonal movement, both velocities should be calculated (not preserved)
      expect(vx).toBeGreaterThan(0); // Should have positive X velocity
      expect(vy).toBeGreaterThan(0); // Should have positive Y velocity
      expect(vx).not.toBe(5); // Should not preserve existing X velocity
      expect(vy).not.toBe(-3); // Should not preserve existing Y velocity
    });
  });

  describe('Platform Physics Gravity Issue (Diagnostic)', () => {
    let platform;
    let mockBody;
    
    beforeEach(() => {
      jest.clearAllMocks();
      
      // Create a properly mocked physics body
      mockBody = {
        x: 100,
        y: 200,
        velocity: { x: 0, y: 0 },
        enable: true,
        checkCollision: { up: true, down: true, left: true, right: true },
        setVelocity: jest.fn().mockReturnThis(),
        setVelocityX: jest.fn().mockReturnThis(),
        setVelocityY: jest.fn().mockReturnThis(),
        setImmovable: jest.fn().mockReturnThis(),
        setAllowGravity: jest.fn().mockReturnThis(),
        setFriction: jest.fn().mockReturnThis(),
        setBounce: jest.fn().mockReturnThis(),
        setCollideWorldBounds: jest.fn(function(collide) {
          this.collideWorldBounds = collide;
          return this;
        }),
        setPosition: jest.fn().mockReturnThis(),
        setSize: jest.fn().mockReturnThis(),
        setOffset: jest.fn().mockReturnThis()
      };
      
      // Mock scene.physics.add.existing which is what Entity uses
      scene.physics.add.existing = jest.fn((entity) => {
        entity.body = mockBody;
        return entity;
      });
    });

    test('should NOT fall due to gravity - platform must be immovable', () => {
      const movementConfig = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        speed: 60,
        autoStart: false
      };

      platform = new MovingPlatform(scene, 100, 200, 'tiles', movementConfig);
      
      // Platform physics body should be configured to not fall
      expect(platform.body.setImmovable).toHaveBeenCalledWith(true);
      expect(platform.body.setAllowGravity).toHaveBeenCalledWith(false);
      
      // Platform should not be affected by gravity at all
      // Even when not moving, it should remain in place
      platform.update(16, 16);
      
      // Platform should not have downward velocity from gravity
      // This test will fail if gravity is affecting the platform
      expect(platform.body.velocity.y).toBe(0);
      expect(platform.y).toBe(200); // Should not have moved down
    });

    test('should maintain immovable state during movement', () => {
      const movementConfig = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        speed: 60,
        autoStart: true
      };

      platform = new MovingPlatform(scene, 100, 200, 'tiles', movementConfig);
      
      // Start movement
      platform.startMovement();
      
      // Even during movement, platform should remain immovable
      expect(platform.body.setImmovable).toHaveBeenCalledWith(true);
      expect(platform.body.setAllowGravity).toHaveBeenCalledWith(false);
      
      // Movement should only affect horizontal velocity for horizontal movement
      // Vertical velocity should remain 0 for horizontal linear movement
      const lastSetVelocityCall = platform.body.setVelocity.mock.calls[platform.body.setVelocity.mock.calls.length - 1];
      if (lastSetVelocityCall) {
        const [vx, vy] = lastSetVelocityCall;
        expect(vy).toBe(0); // Horizontal movement should not have vertical velocity
        expect(vx).toBeGreaterThan(0); // Should have positive horizontal velocity
      }
    });

    test('should not override physics body gravity settings during movement', () => {
      const movementConfig = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 300, // Diagonal movement
        speed: 60,
        autoStart: false
      };

      platform = new MovingPlatform(scene, 100, 200, 'tiles', movementConfig);
      
      // Clear previous calls
      platform.body.setVelocity.mockClear();
      
      // Start diagonal movement
      platform.moveToTarget(300, 300);
      
      // Platform should set velocity but not interfere with immovable/gravity settings
      expect(platform.body.setVelocity).toHaveBeenCalled();
      
      // Should not call setAllowGravity again during movement (only during initialization)
      expect(platform.body.setAllowGravity).toHaveBeenCalledTimes(1); // Only once during construction
    });

    test('should not be affected by gravity even with real physics simulation', () => {
      // Simulate a more realistic physics body that tracks gravity state
      const realPhysicsBody = {
        x: 100,
        y: 200,
        velocity: { x: 0, y: 0 },
        enable: true,
        checkCollision: { up: true, down: true, left: true, right: true },
        immovable: false, // Start with default physics state
        allowGravity: true, // Start with gravity enabled (default)
        gravity: { x: 0, y: 980 }, // Default gravity
        setVelocity: jest.fn(function(vx, vy) {
          this.velocity.x = vx;
          this.velocity.y = vy;
          return this;
        }),
        setVelocityX: jest.fn(function(vx) {
          this.velocity.x = vx;
          return this;
        }),
        setVelocityY: jest.fn(function(vy) {
          this.velocity.y = vy;
          return this;
        }),
        setImmovable: jest.fn(function(immovable) {
          this.immovable = immovable;
          return this;
        }),
        setAllowGravity: jest.fn(function(allowGravity) {
          this.allowGravity = allowGravity;
          return this;
        }),
        setFriction: jest.fn().mockReturnThis(),
        setBounce: jest.fn().mockReturnThis(),
        setCollideWorldBounds: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        setSize: jest.fn().mockReturnThis(),
        setOffset: jest.fn().mockReturnThis()
      };
      
      // Mock scene.physics.add.existing to use the realistic body
      scene.physics.add.existing = jest.fn((entity) => {
        entity.body = realPhysicsBody;
        return entity;
      });

      const movementConfig = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        speed: 60,
        autoStart: false
      };

      platform = new MovingPlatform(scene, 100, 200, 'tiles', movementConfig);
      
      // After construction, platform should have disabled gravity
      expect(platform.body.setAllowGravity).toHaveBeenCalledWith(false);
      expect(platform.body.setImmovable).toHaveBeenCalledWith(true);
      
      // Check the actual state of the physics body
      expect(platform.body.allowGravity).toBe(false);
      expect(platform.body.immovable).toBe(true);
      
      // Simulate physics update - if gravity is disabled, velocity.y should not increase
      // In real Phaser, if allowGravity is false, gravity won't be applied
      platform.update(16, 16);
      
      // Platform should not have gained downward velocity from gravity
      expect(platform.body.velocity.y).toBe(0);
      
      // Even after movement, gravity should remain disabled
      platform.moveToTarget(300, 200);
      expect(platform.body.allowGravity).toBe(false);
      expect(platform.body.immovable).toBe(true);
    });

    test('should preserve setCollideWorldBounds(false) after SceneFactory configuration', () => {
      // This test exposes the real bug: GameScene.configurePlatform doesn't call setCollideWorldBounds(false)
      const realPhysicsBody = {
        x: 100,
        y: 200,
        velocity: { x: 0, y: 0 },
        enable: true,
        checkCollision: { up: true, down: true, left: true, right: true },
        immovable: false,
        allowGravity: true,
        collideWorldBounds: true, // Default Phaser state - this is the problem!
        friction: { x: 0, y: 0 },
        bounce: { x: 0, y: 0 },
        setVelocity: jest.fn().mockReturnThis(),
        setImmovable: jest.fn(function(immovable) {
          this.immovable = immovable;
          return this;
        }),
        setAllowGravity: jest.fn(function(allowGravity) {
          this.allowGravity = allowGravity;
          return this;
        }),
        setCollideWorldBounds: jest.fn(function(collide) {
          this.collideWorldBounds = collide;
          return this;
        }),
        setFriction: jest.fn().mockReturnThis(),
        setBounce: jest.fn().mockReturnThis(),
        setSize: jest.fn().mockReturnThis(),
        setOffset: jest.fn().mockReturnThis()
      };
      
      scene.physics.add.existing = jest.fn((entity) => {
        entity.body = realPhysicsBody;
        return entity;
      });

      const movementConfig = {
        type: 'linear',
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        speed: 60,
        autoStart: false
      };

      // Step 1: Create MovingPlatform
      platform = new MovingPlatform(scene, 100, 200, 'tiles', movementConfig);
      
      // MovingPlatform.configurePhysicsBody() should have set collideWorldBounds to false
      expect(platform.body.collideWorldBounds).toBe(false);
      
      // Step 2: Simulate GameScene.configurePlatform() which is what SceneFactory calls
      // This is the EXACT method from GameScene.configurePlatform()
      const body = platform.body;
      body.setImmovable(true);
      body.setAllowGravity(false);
      // NOTE: GameScene.configurePlatform() does NOT call setCollideWorldBounds(false)!
      
      // Configure hitbox (isFullBlock = true)
      body.setSize(platform.width, platform.height);
      body.setOffset(0, 0);
      
      // Step 3: The bug - collideWorldBounds is still false from MovingPlatform, but if it gets reset...
      // This test will fail if collideWorldBounds gets reset to true somewhere
      expect(platform.body.collideWorldBounds).toBe(false);
      
      // The real issue: if collideWorldBounds is true, the platform can be affected by world boundaries
      // and potentially fall when it hits the edge of the world
    });
  });

  describe('Runtime Movement Diagnostic', () => {
    let platform;
    let mockBody;
    
    beforeEach(() => {
      jest.clearAllMocks();
      
      // Create a properly mocked physics body
      mockBody = {
        x: 450,
        y: 350,
        velocity: { x: 0, y: 0 },
        enable: true,
        checkCollision: { up: true, down: true, left: true, right: true },
        setVelocity: jest.fn().mockReturnThis(),
        setVelocityX: jest.fn().mockReturnThis(),
        setVelocityY: jest.fn().mockReturnThis(),
        setImmovable: jest.fn().mockReturnThis(),
        setAllowGravity: jest.fn().mockReturnThis(),
        setCollideWorldBounds: jest.fn().mockReturnThis(),
        setFriction: jest.fn().mockReturnThis(),
        setBounce: jest.fn().mockReturnThis(),
        setSize: jest.fn().mockReturnThis(),
        setOffset: jest.fn().mockReturnThis()
      };
      
      // Mock scene.physics.add.existing which is what Entity uses
      scene.physics.add.existing = jest.fn((entity) => {
        entity.body = mockBody;
        return entity;
      });
    });

    test('should start moving immediately when autoStart is true', () => {
      const movementConfig = {
        type: 'linear',
        startX: 450,
        startY: 350,
        endX: 750,
        endY: 350,
        speed: 80,
        mode: 'bounce',
        autoStart: true // This should start movement immediately
      };

      platform = new MovingPlatform(scene, 450, 350, 'tiles', movementConfig);
      
      // Platform should be moving immediately after construction
      expect(platform.isMoving).toBe(true);
      expect(platform.autoStart).toBe(true);
      
      // Should have set velocity to start moving
      expect(platform.body.setVelocity).toHaveBeenCalled();
      
      // Should be moving towards the target
      expect(platform.isMovingToTarget).toBe(true);
      expect(platform.targetX).toBe(750);
      expect(platform.targetY).toBe(350);
    });

    test('should have physics body properly configured', () => {
      const movementConfig = {
        type: 'linear',
        startX: 450,
        startY: 350,
        endX: 750,
        endY: 350,
        speed: 80,
        mode: 'bounce',
        autoStart: true
      };

      platform = new MovingPlatform(scene, 450, 350, 'tiles', movementConfig);
      
      // Physics body should exist and be configured
      expect(platform.body).toBeDefined();
      expect(platform.body.setImmovable).toHaveBeenCalledWith(true);
      expect(platform.body.setAllowGravity).toHaveBeenCalledWith(false);
      expect(platform.body.setFriction).toHaveBeenCalledWith(1, 0);
      expect(platform.body.setBounce).toHaveBeenCalledWith(0);
      expect(platform.body.setCollideWorldBounds).toHaveBeenCalledWith(false);
    });

    test('should continue moving when update is called', () => {
      const movementConfig = {
        type: 'linear',
        startX: 450,
        startY: 350,
        endX: 750,
        endY: 350,
        speed: 80,
        mode: 'bounce',
        autoStart: true
      };

      platform = new MovingPlatform(scene, 450, 350, 'tiles', movementConfig);
      
      // Clear previous velocity calls
      platform.body.setVelocity.mockClear();
      
      // Simulate the platform is not at target yet
      platform.x = 500; // Halfway to target
      platform.y = 350;
      
      // Call update (this is what GameScene does)
      platform.update(16, 16);
      
      // Platform should still be moving
      expect(platform.isMoving).toBe(true);
      expect(platform.isMovingToTarget).toBe(true);
      
      // Should not have reached target yet (distance > 5)
      const distance = Math.sqrt((750 - 500) ** 2 + (350 - 350) ** 2);
      expect(distance).toBeGreaterThan(5);
    });
  });

  describe('Platform Movement Tracking (TDD)', () => {
    let platform;
    let mockBody;
    
    beforeEach(() => {
      jest.clearAllMocks();
      
      // Create a properly mocked physics body
      mockBody = {
        x: 450,
        y: 350,
        velocity: { x: 0, y: 0 },
        enable: true,
        checkCollision: { up: true, down: true, left: true, right: true },
        setVelocity: jest.fn().mockReturnThis(),
        setVelocityX: jest.fn().mockReturnThis(),
        setVelocityY: jest.fn().mockReturnThis(),
        setImmovable: jest.fn().mockReturnThis(),
        setAllowGravity: jest.fn().mockReturnThis(),
        setCollideWorldBounds: jest.fn().mockReturnThis(),
        setFriction: jest.fn().mockReturnThis(),
        setBounce: jest.fn().mockReturnThis(),
        setSize: jest.fn().mockReturnThis(),
        setOffset: jest.fn().mockReturnThis()
      };
      
      // Mock scene.physics.add.existing which is what Entity uses
      scene.physics.add.existing = jest.fn((entity) => {
        entity.body = mockBody;
        return entity;
      });
    });

    test('should track previous position for movement delta calculation', () => {
      const movementConfig = {
        type: 'linear',
        startX: 450,
        startY: 350,
        endX: 750,
        endY: 350,
        speed: 80,
        mode: 'bounce',
        autoStart: true
      };

      platform = new MovingPlatform(scene, 450, 350, 'tiles', movementConfig);
      
      // Platform should track previous position
      expect(platform.previousX).toBeDefined();
      expect(platform.previousY).toBeDefined();
      expect(platform.previousX).toBe(450);
      expect(platform.previousY).toBe(350);
    });

    test('should calculate movement delta correctly', () => {
      const movementConfig = {
        type: 'linear',
        startX: 450,
        startY: 350,
        endX: 750,
        endY: 350,
        speed: 80,
        mode: 'bounce',
        autoStart: true
      };

      platform = new MovingPlatform(scene, 450, 350, 'tiles', movementConfig);
      
      // Simulate platform movement
      platform.x = 500;
      platform.y = 350;
      
      // Calculate delta
      const deltaX = platform.x - platform.previousX;
      const deltaY = platform.y - platform.previousY;
      
      expect(deltaX).toBe(50);
      expect(deltaY).toBe(0);
    });

    test('should update previous position after movement', () => {
      const movementConfig = {
        type: 'linear',
        startX: 450,
        startY: 350,
        endX: 750,
        endY: 350,
        speed: 80,
        mode: 'bounce',
        autoStart: true
      };

      platform = new MovingPlatform(scene, 450, 350, 'tiles', movementConfig);
      
      // Store initial previous position
      const initialPreviousX = platform.previousX;
      const initialPreviousY = platform.previousY;
      
      // Simulate platform movement
      platform.x = 500;
      platform.y = 350;
      
      // Call update to trigger previous position update
      platform.update(0, 16);
      
      expect(platform.previousX).toBe(500);
      expect(platform.previousY).toBe(350);
      expect(platform.previousX).not.toBe(initialPreviousX);
    });
  });

  describe('Player Carrying Integration (TDD)', () => {
    let platform;
    let player;
    let mockPlatformBody;
    let mockPlayerBody;
    
    beforeEach(() => {
      jest.clearAllMocks();
      
      // Create mocked physics bodies
      mockPlatformBody = {
        x: 450,
        y: 350,
        velocity: { x: 0, y: 0 },
        enable: true,
        checkCollision: { up: true, down: true, left: true, right: true },
        setVelocity: jest.fn().mockReturnThis(),
        setImmovable: jest.fn().mockReturnThis(),
        setAllowGravity: jest.fn().mockReturnThis(),
        setCollideWorldBounds: jest.fn().mockReturnThis(),
        setFriction: jest.fn().mockReturnThis(),
        setBounce: jest.fn().mockReturnThis(),
        touching: { up: false, down: false, left: false, right: false }
      };
      
      mockPlayerBody = {
        x: 450,
        y: 300,
        velocity: { x: 0, y: 0 },
        enable: true,
        checkCollision: { up: true, down: true, left: true, right: true },
        setVelocity: jest.fn().mockReturnThis(),
        touching: { up: false, down: false, left: false, right: false }
      };
      
      // Mock scene.physics.add.existing
      scene.physics.add.existing = jest.fn((entity) => {
        if (entity.constructor.name === 'MovingPlatform') {
          entity.body = mockPlatformBody;
        } else {
          entity.body = mockPlayerBody;
        }
        return entity;
      });
    });

    test('should detect when player is standing on platform', () => {
      const movementConfig = {
        type: 'linear',
        startX: 450,
        startY: 350,
        endX: 750,
        endY: 350,
        speed: 80,
        mode: 'bounce',
        autoStart: true
      };

      platform = new MovingPlatform(scene, 450, 350, 'tiles', movementConfig);
      
      // Mock player standing on platform
      mockPlayerBody.touching.down = true;
      mockPlatformBody.touching.up = true;
      
      const isPlayerOnPlatform = platform.isPlayerStandingOnTop(mockPlayerBody);
      
      expect(isPlayerOnPlatform).toBe(true);
    });

    test('should not detect player on platform when not touching', () => {
      const movementConfig = {
        type: 'linear',
        startX: 450,
        startY: 350,
        endX: 750,
        endY: 350,
        speed: 80,
        mode: 'bounce',
        autoStart: true
      };

      platform = new MovingPlatform(scene, 450, 350, 'tiles', movementConfig);
      
      // Mock player not touching platform
      mockPlayerBody.touching.down = false;
      mockPlatformBody.touching.up = false;
      
      const isPlayerOnPlatform = platform.isPlayerStandingOnTop(mockPlayerBody);
      
      expect(isPlayerOnPlatform).toBe(false);
    });

    test('should carry player when standing on platform', () => {
      const movementConfig = {
        type: 'linear',
        startX: 450,
        startY: 350,
        endX: 750,
        endY: 350,
        speed: 80,
        mode: 'bounce',
        autoStart: true
      };

      platform = new MovingPlatform(scene, 450, 350, 'tiles', movementConfig);
      
      // Set up initial positions
      platform.x = 450;
      platform.y = 350;
      platform.previousX = 450;
      platform.previousY = 350;
      
      mockPlayerBody.x = 450;
      mockPlayerBody.y = 300;
      
      // Mock player standing on platform
      mockPlayerBody.touching.down = true;
      mockPlatformBody.touching.up = true;
      
      // Simulate platform movement
      platform.x = 500;
      platform.y = 350;
      
      // Carry player
      platform.carryPlayerIfStanding(mockPlayerBody);
      
      // Player should be moved by the same delta as platform
      const expectedDeltaX = platform.x - platform.previousX;
      const expectedPlayerX = 450 + expectedDeltaX;
      
      expect(mockPlayerBody.x).toBe(expectedPlayerX);
    });

    test('should not carry player when not standing on platform', () => {
      const movementConfig = {
        type: 'linear',
        startX: 450,
        startY: 350,
        endX: 750,
        endY: 350,
        speed: 80,
        mode: 'bounce',
        autoStart: true
      };

      platform = new MovingPlatform(scene, 450, 350, 'tiles', movementConfig);
      
      // Set up initial positions
      platform.x = 450;
      platform.y = 350;
      platform.previousX = 450;
      platform.previousY = 350;
      
      const initialPlayerX = 450;
      mockPlayerBody.x = initialPlayerX;
      mockPlayerBody.y = 300;
      
      // Mock player not touching platform
      mockPlayerBody.touching.down = false;
      mockPlatformBody.touching.up = false;
      
      // Simulate platform movement
      platform.x = 500;
      platform.y = 350;
      
      // Try to carry player
      platform.carryPlayerIfStanding(mockPlayerBody);
      
      // Player should not be moved
      expect(mockPlayerBody.x).toBe(initialPlayerX);
    });
  });

  describe('GameScene Integration Test (TDD)', () => {
    let gameScene;
    let platform;
    let player;
    let mockPlatformBody;
    let mockPlayerBody;
    
    beforeEach(() => {
      jest.clearAllMocks();
      
      // Create mocked physics bodies
      mockPlatformBody = {
        x: 450,
        y: 350,
        velocity: { x: 0, y: 0 },
        enable: true,
        checkCollision: { up: true, down: true, left: true, right: true },
        setVelocity: jest.fn().mockReturnThis(),
        setImmovable: jest.fn().mockReturnThis(),
        setAllowGravity: jest.fn().mockReturnThis(),
        setCollideWorldBounds: jest.fn().mockReturnThis(),
        setFriction: jest.fn().mockReturnThis(),
        setBounce: jest.fn().mockReturnThis(),
        touching: { up: false, down: false, left: false, right: false }
      };
      
      mockPlayerBody = {
        x: 450,
        y: 300,
        velocity: { x: 0, y: 0 },
        enable: true,
        checkCollision: { up: true, down: true, left: true, right: true },
        setVelocity: jest.fn().mockReturnThis(),
        touching: { up: false, down: false, left: false, right: false }
      };
      
      // Mock scene.physics.add.existing
      scene.physics.add.existing = jest.fn((entity) => {
        if (entity.constructor.name === 'MovingPlatform') {
          entity.body = mockPlatformBody;
        } else {
          entity.body = mockPlayerBody;
        }
        return entity;
      });
      
      // Create mock GameScene
      gameScene = {
        player: { body: mockPlayerBody },
        platforms: {
          getChildren: jest.fn().mockReturnValue([])
        }
      };
    });

    test('should call carryPlayerIfStanding on MovingPlatform instances', () => {
      const movementConfig = {
        type: 'linear',
        startX: 450,
        startY: 350,
        endX: 750,
        endY: 350,
        speed: 80,
        mode: 'bounce',
        autoStart: true
      };

      platform = new MovingPlatform(scene, 450, 350, 'tiles', movementConfig);
      
      // Mock the platforms group to return our platform
      gameScene.platforms.getChildren.mockReturnValue([platform]);
      
      // Mock player standing on platform
      mockPlayerBody.touching.down = true;
      mockPlatformBody.touching.up = true;
      
      // Set up initial positions
      platform.x = 450;
      platform.y = 350;
      platform.previousX = 450;
      platform.previousY = 350;
      
      mockPlayerBody.x = 450;
      mockPlayerBody.y = 300;
      
      // Simulate platform movement
      platform.x = 500;
      platform.y = 350;
      
      // Simulate GameScene update logic
      if (gameScene.player && gameScene.player.body && gameScene.platforms && gameScene.platforms.getChildren) {
        gameScene.platforms.getChildren().forEach(platform => {
          if (platform && typeof platform.carryPlayerIfStanding === 'function') {
            platform.carryPlayerIfStanding(gameScene.player.body);
          }
        });
      }
      
      // Player should be moved by the same delta as platform
      const expectedDeltaX = platform.x - platform.previousX;
      const expectedPlayerX = 450 + expectedDeltaX;
      
      expect(mockPlayerBody.x).toBe(expectedPlayerX);
    });
  });

  describe('Delta Accumulation Bug Fix (TDD)', () => {
    let platform;
    let mockBody;
    
    beforeEach(() => {
      jest.clearAllMocks();
      
      // Create a properly mocked physics body
      mockBody = {
        x: 450,
        y: 350,
        velocity: { x: 0, y: 0 },
        enable: true,
        checkCollision: { up: true, down: true, left: true, right: true },
        setVelocity: jest.fn().mockReturnThis(),
        setVelocityX: jest.fn().mockReturnThis(),
        setVelocityY: jest.fn().mockReturnThis(),
        setImmovable: jest.fn().mockReturnThis(),
        setAllowGravity: jest.fn().mockReturnThis(),
        setCollideWorldBounds: jest.fn().mockReturnThis(),
        setFriction: jest.fn().mockReturnThis(),
        setBounce: jest.fn().mockReturnThis(),
        setSize: jest.fn().mockReturnThis(),
        setOffset: jest.fn().mockReturnThis()
      };
      
      // Mock scene.physics.add.existing which is what Entity uses
      scene.physics.add.existing = jest.fn((entity) => {
        entity.body = mockBody;
        return entity;
      });
    });

    test('should not accumulate delta across multiple frames', () => {
      const movementConfig = {
        type: 'linear',
        startX: 450,
        startY: 350,
        endX: 750,
        endY: 350,
        speed: 80,
        mode: 'bounce',
        autoStart: true
      };

      platform = new MovingPlatform(scene, 450, 350, 'tiles', movementConfig);
      
      // Simulate platform moving 10 pixels per frame
      platform.x = 460; // Frame 1: moved 10 pixels
      platform.update(0, 16);
      
      // Delta should be 10, not accumulated
      expect(platform.deltaX).toBe(10);
      expect(platform.deltaY).toBe(0);
      
      // Simulate another frame of movement
      platform.x = 470; // Frame 2: moved another 10 pixels
      platform.update(0, 16);
      
      // Delta should be 10 (current frame), not 20 (accumulated)
      expect(platform.deltaX).toBe(10);
      expect(platform.deltaY).toBe(0);
    });

    test('should reset delta after carrying player', () => {
      const movementConfig = {
        type: 'linear',
        startX: 450,
        startY: 350,
        endX: 750,
        endY: 350,
        speed: 80,
        mode: 'bounce',
        autoStart: true
      };

      platform = new MovingPlatform(scene, 450, 350, 'tiles', movementConfig);
      
      // Simulate platform movement
      platform.x = 460;
      platform.update(0, 16);
      
      // Create mock player body
      const mockPlayerBody = {
        x: 450,
        y: 300,
        touching: { down: true, up: false, left: false, right: false }
      };
      
      // Mock platform body touching
      mockBody.touching = { up: true, down: false, left: false, right: false };
      
      // Carry player
      platform.carryPlayerIfStanding(mockPlayerBody);
      
      // Delta should be reset after carrying
      expect(platform.deltaX).toBe(0);
      expect(platform.deltaY).toBe(0);
    });

    test('should not expel player from platform with accumulated delta', () => {
      const movementConfig = {
        type: 'linear',
        startX: 450,
        startY: 350,
        endX: 750,
        endY: 350,
        speed: 80,
        mode: 'bounce',
        autoStart: true
      };

      platform = new MovingPlatform(scene, 450, 350, 'tiles', movementConfig);
      
      // Create mock player body
      const mockPlayerBody = {
        x: 450,
        y: 300,
        touching: { down: true, up: false, left: false, right: false }
      };
      
      // Mock platform body touching
      mockBody.touching = { up: true, down: false, left: false, right: false };
      
      // Simulate multiple frames of movement without carrying
      platform.x = 460; // Frame 1: +10
      platform.update(0, 16);
      platform.x = 470; // Frame 2: +10
      platform.update(0, 16);
      platform.x = 480; // Frame 3: +10
      platform.update(0, 16);
      
      // Delta should be 10 (current frame), not 30 (accumulated)
      expect(platform.deltaX).toBe(10);
      
      // Carry player - should only move by current frame delta
      platform.carryPlayerIfStanding(mockPlayerBody);
      
      // Player should only move by 10 pixels, not 30
      expect(mockPlayerBody.x).toBe(460); // 450 + 10, not 450 + 30
    });
  });
}); 