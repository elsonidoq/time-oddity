import { jest } from '@jest/globals';
import MovingPlatform from '../../client/src/entities/MovingPlatform.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('MovingPlatform - Width Support', () => {
  let mockScene;
  let mockPlatformsGroup;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    
    // Create a mock platforms group
    mockPlatformsGroup = {
      create: jest.fn((x, y, texture, frame) => ({
        x,
        y,
        texture,
        frame,
        setOrigin: jest.fn().mockReturnThis(),
        body: {
          setImmovable: jest.fn(),
          setAllowGravity: jest.fn(),
          setSize: jest.fn(),
          setOffset: jest.fn(),
          setFriction: jest.fn(),
          setBounce: jest.fn(),
          setCollideWorldBounds: jest.fn(),
          setVelocity: jest.fn(),
          velocity: { x: 0, y: 0 },
          touching: { up: false, down: false, left: false, right: false }
        },
        width: 64,
        height: 64,
        active: true,
        visible: true,
        anims: {
          currentAnim: { key: null },
          play: jest.fn()
        }
      })),
      add: jest.fn((platform) => platform)
    };

    // Patch mockScene.physics.add.sprite to return a mock sprite with a mock body
    mockScene.physics = mockScene.physics || {};
    mockScene.physics.add = mockScene.physics.add || {};
    mockScene.physics.add.sprite = jest.fn((x, y, texture, frame) => ({
      x,
      y,
      texture,
      frame,
      setOrigin: jest.fn().mockReturnThis(),
      body: {
        setImmovable: jest.fn(),
        setAllowGravity: jest.fn(),
        setSize: jest.fn(),
        setOffset: jest.fn(),
        setFriction: jest.fn(),
        setBounce: jest.fn(),
        setCollideWorldBounds: jest.fn(),
        setVelocity: jest.fn(),
        velocity: { x: 0, y: 0 },
        touching: { up: false, down: false, left: false, right: false }
      },
      width: 64,
      height: 64,
      active: true,
      visible: true,
      anims: {
        currentAnim: { key: null },
        play: jest.fn()
      }
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Multi-sprite creation', () => {
    test('should create multiple sprites when width is specified', () => {
      const movementConfig = {
        type: 'linear',
        speed: 60,
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        mode: 'bounce',
        autoStart: false
      };

      const platform = new MovingPlatform(
        mockScene,
        100,
        200,
        'tiles',
        movementConfig,
        null,
        null,
        { width: 192, tilePrefix: 'terrain_grass_block' }
      );

      // Should have an array of sprites
      expect(platform.sprites).toBeDefined();
      expect(Array.isArray(platform.sprites)).toBe(true);
      expect(platform.sprites.length).toBe(3);

      // Master sprite should be the first one
      expect(platform.masterSprite).toBe(platform.sprites[0]);
      expect(platform.masterSprite.x).toBe(100);
      expect(platform.masterSprite.y).toBe(200);

      // Other sprites should be positioned correctly
      expect(platform.sprites[1].x).toBe(164); // 100 + 64
      expect(platform.sprites[1].y).toBe(200);
      expect(platform.sprites[2].x).toBe(228); // 100 + 128
      expect(platform.sprites[2].y).toBe(200);
    });

    test('should create multiple sprites when width is specified', () => {
      const movementConfig = {
        type: 'linear',
        speed: 60,
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        mode: 'bounce',
        autoStart: false
      };

      const platform = new MovingPlatform(
        mockScene,
        100,
        200,
        'tiles',
        movementConfig,
        null,
        null,
        { width: 192, tilePrefix: 'terrain_grass_block' }
      );

      // Should have multiple sprites for 192px width (3 tiles)
      expect(platform.sprites).toBeDefined();
      expect(Array.isArray(platform.sprites)).toBe(true);
      expect(platform.sprites.length).toBe(3);

      // Master sprite should be the only sprite
      expect(platform.masterSprite).toBe(platform.sprites[0]);
      expect(platform.masterSprite.x).toBe(100);
      expect(platform.masterSprite.y).toBe(200);
    });

    test('should handle width that is not a multiple of tile width', () => {
      const movementConfig = {
        type: 'linear',
        speed: 60,
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        mode: 'bounce',
        autoStart: false
      };

      const platform = new MovingPlatform(
        mockScene,
        100,
        200,
        'tiles',
        movementConfig,
        null,
        null,
        { width: 150, tilePrefix: 'terrain_grass_block' }
      );

      expect(platform.sprites.length).toBe(3);
    });
  });

  describe('Synchronized movement', () => {
    test('should move all sprites together as a unit', () => {
      const movementConfig = {
        type: 'linear',
        speed: 60,
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        mode: 'bounce',
        autoStart: false
      };

      const platform = new MovingPlatform(
        mockScene,
        100,
        200,
        'tiles',
        movementConfig,
        null,
        null,
        { width: 192, tilePrefix: 'terrain_grass_block' }
      );

      // Simulate movement by updating master sprite position
      platform.masterSprite.x = 150;
      platform.masterSprite.y = 200;

      // Update other sprites to follow master
      platform.updateSpritePositions();

      // All sprites should maintain their relative positions
      expect(platform.sprites[0].x).toBe(150); // master
      expect(platform.sprites[1].x).toBe(214); // 150 + 64
      expect(platform.sprites[2].x).toBe(278); // 150 + 128
      expect(platform.sprites[0].y).toBe(200);
      expect(platform.sprites[1].y).toBe(200);
      expect(platform.sprites[2].y).toBe(200);
    });
  });

  describe('Player carrying mechanics', () => {
    test('should detect player standing on any sprite', () => {
      const movementConfig = {
        type: 'linear',
        speed: 60,
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        mode: 'bounce',
        autoStart: false
      };

      const platform = new MovingPlatform(
        mockScene,
        100,
        200,
        'tiles',
        movementConfig,
        null,
        null,
        { width: 192, tilePrefix: 'terrain_grass_block' }
      );

      // Mock player body
      const playerBody = {
        x: 150,
        y: 180,
        touching: { down: true, up: false, left: false, right: false }
      };

      // Mock collision detection for second sprite
      platform.sprites[1].body.touching.up = true;

      const isStanding = platform.isPlayerStandingOnAnySprite(playerBody);
      expect(isStanding).toBe(true);
    });

    test('should use master sprite delta for player movement', () => {
      const movementConfig = {
        type: 'linear',
        speed: 60,
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        mode: 'bounce',
        autoStart: false
      };

      const platform = new MovingPlatform(
        mockScene,
        100,
        200,
        'tiles',
        movementConfig,
        null,
        null,
        { width: 192, tilePrefix: 'terrain_grass_block' }
      );

      // Mock player body
      const playerBody = {
        x: 150,
        y: 180,
        touching: { down: true, up: false, left: false, right: false }
      };

      // Mock collision detection
      platform.sprites[1].body.touching.up = true;

      // Set delta on master sprite
      platform.deltaX = 10;
      platform.deltaY = 0;

      // Carry player
      platform.carryPlayerIfStanding(playerBody);

      // Player should be moved by master sprite's delta
      expect(playerBody.x).toBe(160); // 150 + 10
      expect(playerBody.y).toBe(180);
    });
  });

  describe('State recording and restoration', () => {
    test('should record state including sprite count and width', () => {
      const movementConfig = {
        type: 'linear',
        speed: 60,
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        mode: 'bounce',
        autoStart: false
      };

      const platform = new MovingPlatform(
        mockScene,
        100,
        200,
        'tiles',
        movementConfig,
        null,
        null,
        { width: 192, tilePrefix: 'terrain_grass_block' }
      );

      const state = platform.getStateForRecording();

      expect(state.spriteCount).toBe(3);
      expect(state.width).toBe(192);
      expect(state.masterX).toBe(100);
      expect(state.masterY).toBe(200);
    });

    test('should restore all sprites with correct positions', () => {
      const movementConfig = {
        type: 'linear',
        speed: 60,
        startX: 100,
        startY: 200,
        endX: 300,
        endY: 200,
        mode: 'bounce',
        autoStart: false
      };

      const platform = new MovingPlatform(
        mockScene,
        100,
        200,
        'tiles',
        movementConfig,
        null,
        null,
        { width: 192, tilePrefix: 'terrain_grass_block' }
      );

      const state = {
        spriteCount: 3,
        width: 192,
        masterX: 150,
        masterY: 200,
        movementType: 'linear',
        isMoving: true,
        direction: 1,
        angle: 0,
        currentPathIndex: 0,
        isMovingToTarget: true,
        targetX: 300,
        targetY: 200
      };

      platform.setStateFromRecording(state);

      // Master sprite should be restored
      expect(platform.masterSprite.x).toBe(150);
      expect(platform.masterSprite.y).toBe(200);

      // Other sprites should be positioned correctly
      expect(platform.sprites[1].x).toBe(214); // 150 + 64
      expect(platform.sprites[1].y).toBe(200);
      expect(platform.sprites[2].x).toBe(278); // 150 + 128
      expect(platform.sprites[2].y).toBe(200);
    });
  });
}); 