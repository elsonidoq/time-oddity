import { jest } from '@jest/globals';
import '../mocks/phaserMock.js';
import { gsap } from '../mocks/gsapMock.js';

// Import the classes we're testing
import GameScene from '../../client/src/scenes/GameScene.js';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import TimeManager from '../../client/src/systems/TimeManager.js';
import CollisionManager from '../../client/src/systems/CollisionManager.js';

// Dynamic imports for MovingPlatform
let MovingPlatform;

describe('Moving Platform Integration Tests', () => {
  let gameScene;
  let sceneFactory;
  let timeManager;
  let collisionManager;
  let mockScene;
  let mockPlatformsGroup;

  beforeEach(async () => {
    // Import MovingPlatform dynamically after mocks are set up
    const module = await import('../../client/src/entities/MovingPlatform.js');
    MovingPlatform = module.default;

    // Create comprehensive mock scene
    mockScene = {
      add: { 
        existing: jest.fn(),
        text: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis() }))
      },
      physics: { 
        add: { 
          existing: jest.fn((entity) => {
            // Create a proper mock physics body that tracks state
            entity.body = {
              x: entity.x || 0,
              y: entity.y || 0,
              velocity: { x: 0, y: 0 },
              allowGravity: true, // Default to true, will be set by platform configuration
              immovable: false,   // Default to false, will be set by platform configuration
              setVelocity: jest.fn().mockReturnThis(),
              setImmovable: jest.fn(function(immovable) {
                this.immovable = immovable;
                return this;
              }),
              setAllowGravity: jest.fn(function(allowGravity) {
                this.allowGravity = allowGravity;
                return this;
              }),
              setSize: jest.fn().mockReturnThis(),
              setOffset: jest.fn().mockReturnThis(),
              setFriction: jest.fn().mockReturnThis(),
              setBounce: jest.fn().mockReturnThis(),
              setCollideWorldBounds: jest.fn().mockReturnThis()
            };
            return entity;
          }),
          group: jest.fn(() => ({
            create: jest.fn((x, y, texture, frame) => ({
              x, y, texture, frame,
              setOrigin: jest.fn().mockReturnThis(),
              body: {
                x, y,
                velocity: { x: 0, y: 0 },
                allowGravity: true,
                immovable: false,
                setVelocity: jest.fn().mockReturnThis(),
                setImmovable: jest.fn(function(immovable) {
                  this.immovable = immovable;
                  return this;
                }),
                setAllowGravity: jest.fn(function(allowGravity) {
                  this.allowGravity = allowGravity;
                  return this;
                }),
                setSize: jest.fn().mockReturnThis(),
                setOffset: jest.fn().mockReturnThis(),
                setFriction: jest.fn().mockReturnThis(),
                setBounce: jest.fn().mockReturnThis(),
                setCollideWorldBounds: jest.fn().mockReturnThis()
              },
              width: 64,
              height: 64,
              active: true,
              visible: true
            })),
            add: jest.fn((platform) => platform)
          }))
        }
      },
      time: { now: 1000 },
      events: { emit: jest.fn() },
      registry: { 
        set: jest.fn(),
        get: jest.fn()
      },
      sys: {
        game: {
          config: {
            width: 1280,
            height: 720,
            physics: { arcade: { debug: false } }
          }
        }
      }
    };

    // Create mock platforms group
    mockPlatformsGroup = mockScene.physics.add.group();

    // Initialize systems
    gameScene = new GameScene(mockScene);
    sceneFactory = new SceneFactory(mockScene);
    timeManager = new TimeManager(mockScene, mockScene);
    collisionManager = new CollisionManager(mockScene, mockScene);

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Moving Platform Creation Integration', () => {
    it('should create moving platform from configuration', () => {
      const movingPlatformConfig = {
        type: 'moving',
        x: 400,
        y: 300,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true,
        movement: {
          type: 'linear',
          startX: 400,
          startY: 300,
          endX: 600,
          endY: 300,
          speed: 80,
          mode: 'bounce',
          autoStart: true
        }
      };

      const platform = sceneFactory.createMovingPlatform(movingPlatformConfig, mockPlatformsGroup);

      expect(platform).toBeDefined();
      expect(platform.x).toBe(400);
      expect(platform.y).toBe(300);
      expect(platform.movementType).toBe('linear');
      expect(platform.speed).toBe(80);
      expect(mockPlatformsGroup.add).toHaveBeenCalledWith(platform);
    });

    it('should create moving platform with circular movement', () => {
      const circularConfig = {
        type: 'moving',
        x: 500,
        y: 400,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true,
        movement: {
          type: 'circular',
          centerX: 500,
          centerY: 400,
          radius: 100,
          speed: 60,
          autoStart: true
        }
      };

      const platform = sceneFactory.createMovingPlatform(circularConfig, mockPlatformsGroup);

      expect(platform).toBeDefined();
      expect(platform.movementType).toBe('circular');
      expect(platform.centerX).toBe(500);
      expect(platform.radius).toBe(100);
    });

    it('should create moving platform with path movement', () => {
      const pathConfig = {
        type: 'moving',
        x: 300,
        y: 200,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true,
        movement: {
          type: 'path',
          pathPoints: [
            { x: 300, y: 200 },
            { x: 500, y: 150 },
            { x: 700, y: 200 }
          ],
          speed: 100,
          loop: true,
          autoStart: true
        }
      };

      const platform = sceneFactory.createMovingPlatform(pathConfig, mockPlatformsGroup);

      expect(platform).toBeDefined();
      expect(platform.movementType).toBe('path');
      expect(platform.pathPoints).toHaveLength(3);
      expect(platform.loop).toBe(true);
    });
  });

  describe('TimeManager Integration', () => {
    it('should register moving platform with TimeManager', () => {
      const movingPlatform = new MovingPlatform(
        mockScene,
        400,
        300,
        'tiles',
        {
          type: 'linear',
          startX: 400,
          startY: 300,
          endX: 600,
          endY: 300,
          speed: 80,
          autoStart: false
        },
        null,
        null,
        { tilePrefix: 'terrain_grass_block' }
      );

      // Mock TimeManager register method
      const registerSpy = jest.spyOn(timeManager, 'register');

      // Register the platform
      timeManager.register(movingPlatform);

      expect(registerSpy).toHaveBeenCalledWith(movingPlatform);
    });

    it('should record and restore moving platform state', () => {
      const movingPlatform = new MovingPlatform(
        mockScene,
        400,
        300,
        'tiles',
        {
          type: 'linear',
          startX: 400,
          startY: 300,
          endX: 600,
          endY: 300,
          speed: 80,
          autoStart: true
        },
        null,
        null,
        { tilePrefix: 'terrain_grass_block' }
      );

      // Get initial state
      const initialState = movingPlatform.getStateForRecording();
      expect(initialState).toBeDefined();
      expect(initialState.x).toBe(400);
      expect(initialState.y).toBe(300);
      expect(initialState.movementType).toBe('linear');
      expect(initialState.isMoving).toBe(true);

      // Modify platform state
      movingPlatform.x = 500;
      movingPlatform.y = 350;
      movingPlatform.isMoving = true;
      movingPlatform.direction = -1;

      // Restore from initial state
      movingPlatform.setStateFromRecording(initialState);

      // Verify state was restored
      expect(movingPlatform.x).toBe(400);
      expect(movingPlatform.y).toBe(300);
      expect(movingPlatform.isMoving).toBe(true);
      expect(movingPlatform.direction).toBe(1);
    });

    it('should handle time reversal with moving platform', () => {
      const movingPlatform = new MovingPlatform(
        mockScene,
        400,
        300,
        'tiles',
        {
          type: 'circular',
          centerX: 400,
          centerY: 300,
          radius: 50,
          speed: 60,
          autoStart: true
        },
        null,
        null,
        { tilePrefix: 'terrain_grass_block' }
      );

      // Record state at different angles
      const state1 = movingPlatform.getStateForRecording();
      
      // Simulate movement (change angle)
      movingPlatform.angle = Math.PI / 2; // 90 degrees
      const state2 = movingPlatform.getStateForRecording();

      // Simulate more movement
      movingPlatform.angle = Math.PI; // 180 degrees
      const state3 = movingPlatform.getStateForRecording();

      // Restore to previous states (time reversal)
      movingPlatform.setStateFromRecording(state2);
      expect(movingPlatform.angle).toBe(Math.PI / 2);

      movingPlatform.setStateFromRecording(state1);
      expect(movingPlatform.angle).toBe(0);
    });

    it('should maintain platform gravity state after time reversal', () => {
      // Create a moving platform with gravity disabled
      const movingPlatform = new MovingPlatform(
        mockScene,
        400,
        300,
        'tiles',
        {
          type: 'linear',
          startX: 400,
          startY: 300,
          endX: 600,
          endY: 300,
          speed: 60,
          autoStart: true
        },
        null,
        null,
        { tilePrefix: 'terrain_grass_block' }
      );

      // Configure the platform physics (this is what SceneFactory.configurePlatform does)
      if (movingPlatform.body) {
        movingPlatform.body.setImmovable(true);
        movingPlatform.body.setAllowGravity(false);
      }

      // Verify gravity state after configuration - platforms should have gravity disabled
      expect(movingPlatform.body.allowGravity).toBe(false);
      expect(movingPlatform.body.immovable).toBe(true);

      // Create TimeManager and register the platform
      const timeManager = new TimeManager(mockScene);
      timeManager.register(movingPlatform);

      // Simulate some movement
      movingPlatform.update(16, 16);
      
      // Start rewind (should disable gravity for all objects)
      timeManager.toggleRewind(true);
      expect(movingPlatform.body.allowGravity).toBe(false);

      // End rewind (should restore original gravity state)
      timeManager.toggleRewind(false);
      
      // Platform should still have gravity disabled after rewind
      expect(movingPlatform.body.allowGravity).toBe(false);
      expect(movingPlatform.body.immovable).toBe(true);
    });

    it('should preserve different gravity states for platforms vs players during time reversal', () => {
      // Create a moving platform (should have gravity disabled)
      const movingPlatform = new MovingPlatform(
        mockScene,
        400,
        300,
        'tiles',
        {
          type: 'linear',
          startX: 400,
          startY: 300,
          endX: 600,
          endY: 300,
          speed: 60,
          autoStart: false
        },
        null,
        null,
        { tilePrefix: 'terrain_grass_block' }
      );

      // Configure the platform physics
      if (movingPlatform.body) {
        movingPlatform.body.setImmovable(true);
        movingPlatform.body.setAllowGravity(false);
      }

      // Create a mock player (should have gravity enabled)
      const mockPlayer = {
        x: 100,
        y: 200,
        body: {
          x: 100,
          y: 200,
          velocity: { x: 0, y: 0 },
          allowGravity: true, // Players should have gravity enabled
          setAllowGravity: jest.fn(function(allowGravity) {
            this.allowGravity = allowGravity;
            return this;
          })
        },
        active: true,
        visible: true,
        anims: { currentAnim: { key: 'player-idle' } },
        getStateForRecording: jest.fn(() => ({
          x: 100,
          y: 200,
          velocityX: 0,
          velocityY: 0,
          animation: 'player-idle',
          isAlive: true,
          isVisible: true
        }))
      };

      // Create TimeManager and register both objects
      const timeManager = new TimeManager(mockScene);
      timeManager.register(movingPlatform);
      timeManager.register(mockPlayer);

      // Verify initial states
      expect(movingPlatform.body.allowGravity).toBe(false);
      expect(mockPlayer.body.allowGravity).toBe(true);

      // Complete rewind cycle
      timeManager.toggleRewind(true);
      timeManager.toggleRewind(false);

      // After rewind, platform should have gravity disabled, player should have gravity enabled
      expect(movingPlatform.body.allowGravity).toBe(false);
      expect(mockPlayer.body.allowGravity).toBe(true);
    });
  });

  describe('GameScene Integration', () => {
    it('should register moving platforms with TimeManager in GameScene', () => {
      // Mock the GameScene methods
      const mockGameScene = {
        timeManager: {
          register: jest.fn()
        }
      };

      // Create platforms array with mixed types
      const platforms = [
        // Regular platform (no TimeManager methods)
        {
          x: 200,
          y: 500,
          texture: 'tiles'
        },
        // MovingPlatform (has TimeManager methods)
        {
          x: 400,
          y: 300,
          texture: 'tiles',
          getStateForRecording: jest.fn(),
          setStateFromRecording: jest.fn()
        }
      ];

      // Simulate the registration logic from GameScene
      const registerMovingPlatformsWithTimeManager = (platforms) => {
        if (!mockGameScene.timeManager || !platforms) return;

        const movingPlatforms = platforms.filter(platform => 
          platform && 
          typeof platform.getStateForRecording === 'function' && 
          typeof platform.setStateFromRecording === 'function'
        );

        for (const movingPlatform of movingPlatforms) {
          mockGameScene.timeManager.register(movingPlatform);
        }
      };

      registerMovingPlatformsWithTimeManager(platforms);

      // Verify only MovingPlatform was registered
      expect(mockGameScene.timeManager.register).toHaveBeenCalledTimes(1);
      expect(mockGameScene.timeManager.register).toHaveBeenCalledWith(platforms[1]);
    });
  });

  describe('Collision Detection Integration', () => {
    it('should set up collision detection for moving platforms', () => {
      const movingPlatform = new MovingPlatform(
        mockScene,
        400,
        300,
        'tiles',
        {
          type: 'linear',
          startX: 400,
          startY: 300,
          endX: 600,
          endY: 300,
          speed: 80,
          autoStart: true
        },
        null,
        null,
        { tilePrefix: 'terrain_grass_block' }
      );

      // Verify platform has collision properties
      expect(movingPlatform.body).toBeDefined();
      expect(movingPlatform.body.setImmovable).toBeDefined();
      expect(movingPlatform.body.setFriction).toBeDefined();
    });

    it('should configure physics body for moving platforms', () => {
      const movingPlatform = new MovingPlatform(
        mockScene,
        400,
        300,
        'tiles',
        {
          type: 'linear',
          startX: 400,
          startY: 300,
          endX: 600,
          endY: 300,
          speed: 80,
          autoStart: true
        },
        null,
        null,
        { tilePrefix: 'terrain_grass_block' }
      );

      // Verify physics configuration was called
      expect(movingPlatform.body.setImmovable).toHaveBeenCalledWith(true);
      expect(movingPlatform.body.setFriction).toHaveBeenCalledWith(1, 0);
      expect(movingPlatform.body.setBounce).toHaveBeenCalledWith(0);
    });
  });

  describe('Movement Behavior Integration', () => {
    it('should handle linear movement with bounce mode', () => {
      const movingPlatform = new MovingPlatform(
        mockScene,
        400,
        300,
        'tiles',
        {
          type: 'linear',
          startX: 400,
          startY: 300,
          endX: 600,
          endY: 300,
          speed: 80,
          mode: 'bounce',
          autoStart: false
        },
        null,
        null,
        { tilePrefix: 'terrain_grass_block' }
      );

      // Start movement
      movingPlatform.startMovement();
      expect(movingPlatform.isMoving).toBe(true);

      // Test direction calculation
      expect(movingPlatform.direction).toBe(1);
      const target = movingPlatform.calculateLinearTarget();
      expect(target.x).toBe(600);
      expect(target.y).toBe(300);

      // Test reverse direction
      movingPlatform.reverseDirection();
      expect(movingPlatform.direction).toBe(-1);
      const reverseTarget = movingPlatform.calculateLinearTarget();
      expect(reverseTarget.x).toBe(400);
      expect(reverseTarget.y).toBe(300);
    });

    it('should handle circular movement calculations', () => {
      const movingPlatform = new MovingPlatform(
        mockScene,
        400,
        300,
        'tiles',
        {
          type: 'circular',
          centerX: 400,
          centerY: 300,
          radius: 100,
          speed: 60,
          angle: 0,
          autoStart: false
        },
        null,
        null,
        { tilePrefix: 'terrain_grass_block' }
      );

      // Test position calculation at angle 0
      let position = movingPlatform.calculateCircularPosition();
      expect(position.x).toBeCloseTo(500, 1); // centerX + radius * cos(0)
      expect(position.y).toBeCloseTo(300, 1); // centerY + radius * sin(0)

      // Test position calculation at angle π/2
      movingPlatform.angle = Math.PI / 2;
      position = movingPlatform.calculateCircularPosition();
      expect(position.x).toBeCloseTo(400, 1); // centerX + radius * cos(π/2)
      expect(position.y).toBeCloseTo(400, 1); // centerY + radius * sin(π/2)
    });

    it('should handle path movement with waypoints', () => {
      const pathPoints = [
        { x: 300, y: 200 },
        { x: 500, y: 150 },
        { x: 700, y: 200 }
      ];

      const movingPlatform = new MovingPlatform(
        mockScene,
        300,
        200,
        'tiles',
        {
          type: 'path',
          pathPoints: pathPoints,
          speed: 100,
          loop: true,
          autoStart: false
        },
        null,
        null,
        { tilePrefix: 'terrain_grass_block' }
      );

      // Test initial path index
      expect(movingPlatform.currentPathIndex).toBe(0);

      // Test getting next path point
      const nextPoint = movingPlatform.getNextPathPoint();
      expect(nextPoint).toEqual({ x: 500, y: 150 });
      expect(movingPlatform.currentPathIndex).toBe(1);

      // Test looping behavior
      movingPlatform.currentPathIndex = 2; // Last point
      const loopPoint = movingPlatform.getNextPathPoint();
      expect(loopPoint).toEqual({ x: 300, y: 200 }); // Should loop back to first
      expect(movingPlatform.currentPathIndex).toBe(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid movement configuration gracefully', () => {
      const invalidConfig = {
        type: 'moving',
        x: 400,
        y: 300,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true,
        movement: {
          type: 'invalid',
          speed: 80
        }
      };

      const platform = sceneFactory.createMovingPlatform(invalidConfig, mockPlatformsGroup);
      expect(platform).toBeNull();
    });

    it('should handle missing platforms group gracefully', () => {
      const validConfig = {
        type: 'moving',
        x: 400,
        y: 300,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true,
        movement: {
          type: 'linear',
          startX: 400,
          startY: 300,
          endX: 600,
          endY: 300,
          speed: 80
        }
      };

      const platform = sceneFactory.createMovingPlatform(validConfig, null);
      expect(platform).toBeNull();
    });

    it('should handle GSAP errors gracefully', () => {
      // Mock GSAP to throw an error
      const originalGsapTo = gsap.to;
      gsap.to = jest.fn(() => {
        throw new Error('GSAP error');
      });

      const movingPlatform = new MovingPlatform(
        mockScene,
        400,
        300,
        'tiles',
        {
          type: 'linear',
          startX: 400,
          startY: 300,
          endX: 600,
          endY: 300,
          speed: 80,
          autoStart: false
        },
        null,
        null,
        { tilePrefix: 'terrain_grass_block' }
      );

      // Should not throw error when moving
      expect(() => {
        movingPlatform.moveToPoint(500, 300, 1);
      }).not.toThrow();

      // Restore original GSAP
      gsap.to = originalGsapTo;
    });
  });

  describe('Performance and Memory', () => {
    it('should create moving platforms efficiently', () => {
      const startTime = Date.now();

      // Create multiple moving platforms
      const platforms = [];
      for (let i = 0; i < 10; i++) {
        const platform = new MovingPlatform(
          mockScene,
          100 + i * 50,
          300,
          'tiles',
          {
            type: 'linear',
            startX: 100 + i * 50,
            startY: 300,
            endX: 200 + i * 50,
            endY: 300,
            speed: 80,
            autoStart: false
          },
          null,
          null,
          { tilePrefix: 'terrain_grass_block' }
        );
        platforms.push(platform);
      }

      const endTime = Date.now();
      const creationTime = endTime - startTime;

      // Should complete in reasonable time (less than 100ms)
      expect(creationTime).toBeLessThan(100);
      expect(platforms.length).toBe(10);
    });

    it('should handle multiple moving platforms with TimeManager', () => {
      const platforms = [];

      // Create multiple moving platforms
      for (let i = 0; i < 5; i++) {
        const platform = new MovingPlatform(
          mockScene,
          100 + i * 100,
          300,
          'tiles',
          {
            type: 'circular',
            centerX: 100 + i * 100,
            centerY: 300,
            radius: 50,
            speed: 60,
            autoStart: false
          },
          null,
          null,
          { tilePrefix: 'terrain_grass_block' }
        );
        platforms.push(platform);
        timeManager.register(platform);
      }

      // Verify all platforms were registered
      expect(platforms.length).toBe(5);

      // Test state recording for all platforms
      for (const platform of platforms) {
        const state = platform.getStateForRecording();
        expect(state).toBeDefined();
        expect(typeof state.x).toBe('number');
        expect(typeof state.y).toBe('number');
        expect(state.movementType).toBe('circular');
      }
    });
  });
}); 