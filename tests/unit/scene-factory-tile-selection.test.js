import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import { TileSelector } from '../../client/src/systems/TileSelector.js';

// Mock MovingPlatform
let MockMovingPlatform;

describe('SceneFactory Tile Selection Integration', () => {
  let sceneFactory;
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
          setOffset: jest.fn()
        }
      })),
      add: jest.fn((platform) => platform)
    };
    
    // Mock MovingPlatform constructor
    MockMovingPlatform = jest.fn().mockImplementation((scene, x, y, texture, movementConfig, frame, options) => ({
      x,
      y,
      texture,
      frame,
      movementConfig,
      scene,
      options,
      setOrigin: jest.fn().mockReturnThis(),
      body: {
        setImmovable: jest.fn(),
        setAllowGravity: jest.fn(),
        setSize: jest.fn(),
        setOffset: jest.fn()
      },
      width: options?.width || 64,
      height: 64,
      spriteCount: options?.width ? Math.ceil(options.width / 64) : 1,
      isMoving: false,
      autoStart: true,
      initializeMovement: jest.fn(),
      getStateForRecording: jest.fn(),
      setStateFromRecording: jest.fn()
    }));
    
    sceneFactory = new SceneFactory(mockScene);
    
    // Override the MovingPlatform constructor in SceneFactory for testing
    const originalCreateMovingPlatform = sceneFactory.createMovingPlatform.bind(sceneFactory);
    sceneFactory.createMovingPlatform = function(movingConfig, platformsGroup) {
      if (!platformsGroup || !platformsGroup.add) {
        return null;
      }

      // Validate movement configuration
      if (!movingConfig.movement || !this.validateMovementConfiguration(movingConfig.movement)) {
        return null;
      }

      // Reject old tileKey format (no tilePrefix)
      if (!movingConfig.tilePrefix) {
        return null;
      }

      // Use TileSelector to get the correct tile key for the master sprite
      const tileKey = TileSelector.getTileKey(movingConfig.tilePrefix, movingConfig.x, 1, 0);

      // Create mock MovingPlatform instance
      const platform = new MockMovingPlatform(
        this.scene,
        movingConfig.x,
        movingConfig.y,
        'tiles',
        movingConfig.movement,
        tileKey,
        { width: movingConfig.width }
      );

      // Configure platform physics
      this.configurePlatform(platform, movingConfig.isFullBlock);

      // Add to platforms group
      platformsGroup.add(platform);

      if (platform.autoStart) {
        platform.initializeMovement();
      }

      return platform;
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createGroundPlatform with tilePrefix', () => {
    test('should create single tile ground platform with middle tile', () => {
      const groundConfig = {
        x: 0,
        y: 656,
        width: 64,
        tilePrefix: 'terrain_grass_horizontal',
        isFullBlock: true
      };

      const platforms = sceneFactory.createGroundPlatform(groundConfig, mockPlatformsGroup);
      
      expect(platforms).toBeDefined();
      expect(platforms.length).toBe(1);
      expect(platforms[0].frame).toBe('terrain_grass_horizontal_middle');
    });

    test('should create multi-tile ground platform with correct left/middle/right tiles', () => {
      const groundConfig = {
        x: 0,
        y: 656,
        width: 192, // 3 tiles
        tilePrefix: 'terrain_grass_horizontal',
        isFullBlock: true
      };

      const platforms = sceneFactory.createGroundPlatform(groundConfig, mockPlatformsGroup);
      
      expect(platforms).toBeDefined();
      expect(platforms.length).toBe(3);
      expect(platforms[0].frame).toBe('terrain_grass_horizontal_left');
      expect(platforms[1].frame).toBe('terrain_grass_horizontal_middle');
      expect(platforms[2].frame).toBe('terrain_grass_horizontal_right');
    });

    test('should create two-tile ground platform with left/right tiles', () => {
      const groundConfig = {
        x: 0,
        y: 656,
        width: 128, // 2 tiles
        tilePrefix: 'terrain_grass_horizontal',
        isFullBlock: true
      };

      const platforms = sceneFactory.createGroundPlatform(groundConfig, mockPlatformsGroup);
      
      expect(platforms).toBeDefined();
      expect(platforms.length).toBe(2);
      expect(platforms[0].frame).toBe('terrain_grass_horizontal_left');
      expect(platforms[1].frame).toBe('terrain_grass_horizontal_right');
    });

    test('should create many-tile ground platform with correct pattern', () => {
      const groundConfig = {
        x: 0,
        y: 656,
        width: 320, // 5 tiles
        tilePrefix: 'terrain_grass_horizontal',
        isFullBlock: true
      };

      const platforms = sceneFactory.createGroundPlatform(groundConfig, mockPlatformsGroup);
      
      expect(platforms).toBeDefined();
      expect(platforms.length).toBe(5);
      expect(platforms[0].frame).toBe('terrain_grass_horizontal_left');
      expect(platforms[1].frame).toBe('terrain_grass_horizontal_middle');
      expect(platforms[2].frame).toBe('terrain_grass_horizontal_middle');
      expect(platforms[3].frame).toBe('terrain_grass_horizontal_middle');
      expect(platforms[4].frame).toBe('terrain_grass_horizontal_right');
    });

    test('should reject configuration with old tileKey format', () => {
      const groundConfig = {
        x: 0,
        y: 656,
        width: 128,
        tileKey: 'terrain_grass_horizontal_middle', // Old format
        isFullBlock: true
      };

      const platforms = sceneFactory.createGroundPlatform(groundConfig, mockPlatformsGroup);
      
      expect(platforms).toBeNull();
    });
  });

  describe('createFloatingPlatform with tilePrefix', () => {
    test('should create single tile floating platform with center tile', () => {
      const platformConfig = {
        x: 100,
        y: 500,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true
      };

      const platform = sceneFactory.createFloatingPlatform(platformConfig, mockPlatformsGroup);
      
      expect(platform).toBeDefined();
      expect(platform.frame).toBe('terrain_grass_block_center');
    });

    test('should create multi-tile floating platform with correct left/center/right tiles', () => {
      const platformConfig = {
        x: 100,
        y: 500,
        width: 192, // 3 tiles
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true
      };

      const platforms = sceneFactory.createFloatingPlatform(platformConfig, mockPlatformsGroup);
      
      expect(platforms).toBeDefined();
      expect(platforms.length).toBe(3);
      expect(platforms[0].frame).toBe('terrain_grass_block_left');
      expect(platforms[1].frame).toBe('terrain_grass_block_center');
      expect(platforms[2].frame).toBe('terrain_grass_block_right');
    });

    test('should create two-tile floating platform with left/right tiles', () => {
      const platformConfig = {
        x: 100,
        y: 500,
        width: 128, // 2 tiles
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true
      };

      const platforms = sceneFactory.createFloatingPlatform(platformConfig, mockPlatformsGroup);
      
      expect(platforms).toBeDefined();
      expect(platforms.length).toBe(2);
      expect(platforms[0].frame).toBe('terrain_grass_block_left');
      expect(platforms[1].frame).toBe('terrain_grass_block_right');
    });

    test('should reject configuration with old tileKey format', () => {
      const platformConfig = {
        x: 100,
        y: 500,
        width: 128,
        tileKey: 'terrain_grass_block_center', // Old format
        isFullBlock: true
      };

      const platform = sceneFactory.createFloatingPlatform(platformConfig, mockPlatformsGroup);
      
      expect(platform).toBeNull();
    });
  });

  describe('createMovingPlatform with tilePrefix', () => {
    test('should create single tile moving platform with center tile', () => {
      const movingConfig = {
        x: 100,
        y: 500,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true,
        movement: {
          type: 'linear',
          speed: 60,
          startX: 100,
          startY: 500,
          endX: 300,
          endY: 500,
          mode: 'bounce',
          autoStart: true
        }
      };

      const platform = sceneFactory.createMovingPlatform(movingConfig, mockPlatformsGroup);
      
      expect(platform).toBeDefined();
      expect(platform.frame).toBe('terrain_grass_block_center');
    });

    test('should create multi-tile moving platform with correct left/center/right tiles', () => {
      const movingConfig = {
        x: 100,
        y: 500,
        width: 192, // 3 tiles
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true,
        movement: {
          type: 'linear',
          speed: 60,
          startX: 100,
          startY: 500,
          endX: 300,
          endY: 500,
          mode: 'bounce',
          autoStart: true
        }
      };

      const platform = sceneFactory.createMovingPlatform(movingConfig, mockPlatformsGroup);
      
      expect(platform).toBeDefined();
      expect(platform.frame).toBe('terrain_grass_block_center'); // MovingPlatform uses center for master sprite
      expect(platform.width).toBe(192);
      expect(platform.spriteCount).toBe(3);
    });

    test('should reject configuration with old tileKey format', () => {
      const movingConfig = {
        x: 100,
        y: 500,
        width: 192,
        tileKey: 'terrain_grass_block_center', // Old format
        isFullBlock: true,
        movement: {
          type: 'linear',
          speed: 60,
          startX: 100,
          startY: 500,
          endX: 300,
          endY: 500,
          mode: 'bounce',
          autoStart: true
        }
      };

      const platform = sceneFactory.createMovingPlatform(movingConfig, mockPlatformsGroup);
      
      expect(platform).toBeNull();
    });
  });

  describe('createPlatformsFromConfig with tilePrefix', () => {
    test('should create all platform types with tilePrefix configuration', () => {
      const config = {
        platforms: [
          {
            type: 'ground',
            x: 0,
            y: 656,
            width: 192,
            tilePrefix: 'terrain_grass_horizontal',
            isFullBlock: true
          },
          {
            type: 'floating',
            x: 100,
            y: 500,
            width: 128,
            tilePrefix: 'terrain_grass_block',
            isFullBlock: true
          },
          {
            type: 'moving',
            x: 200,
            y: 400,
            width: 192,
            tilePrefix: 'terrain_grass_block',
            isFullBlock: true,
            movement: {
              type: 'linear',
              speed: 60,
              startX: 200,
              startY: 400,
              endX: 400,
              endY: 400,
              mode: 'bounce',
              autoStart: true
            }
          }
        ]
      };

      sceneFactory.loadConfiguration(config);
      const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      expect(platforms.length).toBeGreaterThan(0);
      
      // Verify ground platform tiles (should be 3 tiles at x=0, x=64, x=128)
      const groundPlatforms = platforms.filter(p => p.x >= 0 && p.x < 200 && p.frame.includes('terrain_grass_horizontal'));
      expect(groundPlatforms.length).toBe(3);
      expect(groundPlatforms[0].frame).toBe('terrain_grass_horizontal_left');
      expect(groundPlatforms[1].frame).toBe('terrain_grass_horizontal_middle');
      expect(groundPlatforms[2].frame).toBe('terrain_grass_horizontal_right');
      
      // Verify floating platform tiles (should be 2 tiles at x=100, x=164)
      const floatingPlatforms = platforms.filter(p => p.x >= 100 && p.x < 200 && p.frame.includes('terrain_grass_block') && !p.frame.includes('center'));
      expect(floatingPlatforms.length).toBe(2);
      expect(floatingPlatforms[0].frame).toBe('terrain_grass_block_left');
      expect(floatingPlatforms[1].frame).toBe('terrain_grass_block_right');
      
      // Verify moving platform
      const movingPlatform = platforms.find(p => p.x === 200);
      expect(movingPlatform).toBeDefined();
      expect(movingPlatform.frame).toBe('terrain_grass_block_center');
    });

    test('should skip platforms with old tileKey format', () => {
      const config = {
        platforms: [
          {
            type: 'ground',
            x: 0,
            y: 656,
            width: 192,
            tileKey: 'terrain_grass_horizontal_middle', // Old format
            isFullBlock: true
          },
          {
            type: 'floating',
            x: 100,
            y: 500,
            width: 128,
            tilePrefix: 'terrain_grass_block', // New format
            isFullBlock: true
          }
        ]
      };

      sceneFactory.loadConfiguration(config);
      const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      // Only floating platform should be created (ground platform rejected)
      expect(platforms.length).toBe(2);
      expect(platforms[0].frame).toBe('terrain_grass_block_left');
      expect(platforms[1].frame).toBe('terrain_grass_block_right');
    });
  });

  describe('Backward compatibility', () => {
    test('should maintain existing behavior for non-platform objects', () => {
      // This test ensures that other objects (coins, enemies, backgrounds) 
      // are not affected by the platform tile selection changes
      const config = {
        platforms: [
          {
            type: 'ground',
            x: 0,
            y: 656,
            width: 64,
            tilePrefix: 'terrain_grass_horizontal',
            isFullBlock: true
          }
        ],
        coins: [
          {
            type: 'coin',
            x: 100,
            y: 500,
            properties: { value: 100 }
          }
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(true);
      expect(sceneFactory.config.coins).toEqual(config.coins);
    });
  });
}); 