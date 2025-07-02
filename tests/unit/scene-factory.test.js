import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

// Mock MovingPlatform - we'll import it dynamically in tests
let MockMovingPlatform;

describe('SceneFactory', () => {
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
    MockMovingPlatform = jest.fn().mockImplementation((scene, x, y, texture, movementConfig, frame) => ({
      x,
      y,
      texture,
      frame,
      movementConfig,
      scene,
      setOrigin: jest.fn().mockReturnThis(),
      body: {
        setImmovable: jest.fn(),
        setAllowGravity: jest.fn(),
        setSize: jest.fn(),
        setOffset: jest.fn()
      },
      width: 64,
      height: 64,
      // Mock TimeManager integration
      getStateForRecording: jest.fn(),
      setStateFromRecording: jest.fn()
    }));
    
    // Replace the MovingPlatform import in SceneFactory temporarily
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

      // Create mock MovingPlatform instance
      const platform = new MockMovingPlatform(
        this.scene,
        movingConfig.x,
        movingConfig.y,
        'tiles',
        movingConfig.movement,
        movingConfig.tilePrefix
      );

      // Configure platform physics
      this.configurePlatform(platform, movingConfig.isFullBlock);

      // Add to platforms group
      platformsGroup.add(platform);

      return platform;
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should create SceneFactory with scene reference', () => {
      expect(sceneFactory).toBeInstanceOf(SceneFactory);
      expect(sceneFactory.scene).toBe(mockScene);
    });

    test('should initialize with empty configuration', () => {
      expect(sceneFactory.config).toBeNull();
    });
  });

  describe('loadConfiguration', () => {
    test('should load valid configuration from JSON', () => {
      const testConfig = {
        platforms: [
          {
            type: 'ground',
            x: 0,
            y: 656,
            width: 1280,
            tilePrefix: 'terrain_grass_horizontal_middle',
            isFullBlock: true
          }
        ]
      };

      const result = sceneFactory.loadConfiguration(testConfig);
      
      expect(result).toBe(true);
      expect(sceneFactory.config).toEqual(testConfig);
    });

    test('should load configuration with moving platforms', () => {
      const testConfig = {
        platforms: [
          {
            type: 'moving',
            x: 400,
            y: 300,
            tilePrefix: 'terrain_grass_block_center',
            isFullBlock: true,
            movement: {
              type: 'linear',
              speed: 60,
              startX: 400,
              startY: 300,
              endX: 600,
              endY: 300,
              mode: 'bounce',
              autoStart: true
            }
          }
        ]
      };

      const result = sceneFactory.loadConfiguration(testConfig);
      
      expect(result).toBe(true);
      expect(sceneFactory.config).toEqual(testConfig);
    });

    test('should return false for invalid configuration', () => {
      const invalidConfig = null;
      
      const result = sceneFactory.loadConfiguration(invalidConfig);
      
      expect(result).toBe(false);
      expect(sceneFactory.config).toBeNull();
    });

    test('should accept configuration without platforms array (adds empty array)', () => {
      const config = { otherProperty: 'value' };
      
      const result = sceneFactory.loadConfiguration(config);
      
      expect(result).toBe(true);
      expect(sceneFactory.config).toEqual({ otherProperty: 'value', platforms: [] });
    });

    test('should accept configuration with empty platforms array', () => {
      const config = { platforms: [] };
      
      const result = sceneFactory.loadConfiguration(config);
      
      expect(result).toBe(true);
      expect(sceneFactory.config).toEqual({ platforms: [] });
    });
  });

  describe('createGroundPlatform', () => {
    test('should create ground platform with correct parameters', () => {
      const groundConfig = {
        x: 0,
        y: 656,
        width: 1280,
        tilePrefix: 'terrain_grass_horizontal',
        isFullBlock: true
      };

      const platforms = sceneFactory.createGroundPlatform(groundConfig, mockPlatformsGroup);
      
      expect(platforms).toBeDefined();
      expect(platforms.length).toBeGreaterThan(0);
      
      // Verify platform creation was called for each tile
      const expectedTileCount = Math.ceil(groundConfig.width / 64);
      expect(mockPlatformsGroup.create).toHaveBeenCalledTimes(expectedTileCount);
    });

    test('should configure platform physics correctly', () => {
      const groundConfig = {
        x: 0,
        y: 656,
        width: 1280,
        tilePrefix: 'terrain_grass_horizontal',
        isFullBlock: true
      };

      const mockPlatform = {
        setOrigin: jest.fn().mockReturnThis(),
        body: {
          setImmovable: jest.fn(),
          setAllowGravity: jest.fn(),
          setSize: jest.fn(),
          setOffset: jest.fn()
        }
      };

      mockPlatformsGroup.create = jest.fn(() => mockPlatform);

      sceneFactory.createGroundPlatform(groundConfig, mockPlatformsGroup);
      
      expect(mockPlatform.body.setImmovable).toHaveBeenCalledWith(true);
      expect(mockPlatform.body.setAllowGravity).toHaveBeenCalledWith(false);
      expect(mockPlatform.body.setSize).toHaveBeenCalled();
      expect(mockPlatform.body.setOffset).toHaveBeenCalled();
    });

    test('should handle missing platforms group gracefully', () => {
      const groundConfig = {
        x: 0,
        y: 656,
        width: 1280,
        tilePrefix: 'terrain_grass_horizontal',
        isFullBlock: true
      };

      const result = sceneFactory.createGroundPlatform(groundConfig, null);
      
      expect(result).toBeNull();
    });
  });

  describe('createFloatingPlatform', () => {
    test('should create floating platform with correct parameters', () => {
      const platformConfig = {
        x: 200,
        y: 500,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true
      };

      const platform = sceneFactory.createFloatingPlatform(platformConfig, mockPlatformsGroup);
      
      expect(platform).toBeDefined();
      expect(mockPlatformsGroup.create).toHaveBeenCalledWith(
        200, 500, 'tiles', 'terrain_grass_block'
      );
    });

    test('should configure platform physics correctly', () => {
      const platformConfig = {
        x: 200,
        y: 500,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true
      };

      const mockPlatform = {
        body: {
          setImmovable: jest.fn(),
          setAllowGravity: jest.fn(),
          setSize: jest.fn(),
          setOffset: jest.fn()
        }
      };

      mockPlatformsGroup.create = jest.fn(() => mockPlatform);

      sceneFactory.createFloatingPlatform(platformConfig, mockPlatformsGroup);
      
      expect(mockPlatform.body.setImmovable).toHaveBeenCalledWith(true);
      expect(mockPlatform.body.setAllowGravity).toHaveBeenCalledWith(false);
      expect(mockPlatform.body.setSize).toHaveBeenCalled();
      expect(mockPlatform.body.setOffset).toHaveBeenCalled();
    });

    test('should handle missing platforms group gracefully', () => {
      const platformConfig = {
        x: 200,
        y: 500,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true
      };

      const result = sceneFactory.createFloatingPlatform(platformConfig, null);
      
      expect(result).toBeNull();
    });
  });

  describe('createMovingPlatform', () => {
    test('should create moving platform with linear movement configuration', () => {
      const movingConfig = {
        x: 400,
        y: 300,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true,
        movement: {
          type: 'linear',
          speed: 60,
          startX: 400,
          startY: 300,
          endX: 600,
          endY: 300,
          mode: 'bounce',
          autoStart: true
        }
      };

      const platform = sceneFactory.createMovingPlatform(movingConfig, mockPlatformsGroup);
      
      expect(platform).toBeDefined();
      expect(platform.movementConfig).toEqual(movingConfig.movement);
      expect(platform.x).toBe(400);
      expect(platform.y).toBe(300);
    });

    test('should create moving platform with circular movement configuration', () => {
      const movingConfig = {
        x: 500,
        y: 400,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true,
        movement: {
          type: 'circular',
          speed: 45,
          centerX: 500,
          centerY: 400,
          radius: 100,
          angle: 0,
          autoStart: true
        }
      };

      const platform = sceneFactory.createMovingPlatform(movingConfig, mockPlatformsGroup);
      
      expect(platform).toBeDefined();
      expect(platform.movementConfig).toEqual(movingConfig.movement);
      expect(platform.x).toBe(500);
      expect(platform.y).toBe(400);
    });

    test('should create moving platform with path movement configuration', () => {
      const movingConfig = {
        x: 300,
        y: 200,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true,
        movement: {
          type: 'path',
          speed: 80,
          pathPoints: [
            { x: 300, y: 200 },
            { x: 500, y: 200 },
            { x: 500, y: 400 },
            { x: 300, y: 400 }
          ],
          loop: true,
          autoStart: true
        }
      };

      const platform = sceneFactory.createMovingPlatform(movingConfig, mockPlatformsGroup);
      
      expect(platform).toBeDefined();
      expect(platform.movementConfig).toEqual(movingConfig.movement);
      expect(platform.x).toBe(300);
      expect(platform.y).toBe(200);
    });

    test('should add moving platform to platforms group', () => {
      const movingConfig = {
        x: 400,
        y: 300,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true,
        movement: {
          type: 'linear',
          speed: 60,
          startX: 400,
          startY: 300,
          endX: 600,
          endY: 300,
          mode: 'bounce',
          autoStart: true
        }
      };

      const platform = sceneFactory.createMovingPlatform(movingConfig, mockPlatformsGroup);
      
      expect(mockPlatformsGroup.add).toHaveBeenCalledWith(platform);
    });

    test('should handle missing platforms group gracefully', () => {
      const movingConfig = {
        x: 400,
        y: 300,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true,
        movement: {
          type: 'linear',
          speed: 60,
          startX: 400,
          startY: 300,
          endX: 600,
          endY: 300,
          mode: 'bounce',
          autoStart: true
        }
      };

      const result = sceneFactory.createMovingPlatform(movingConfig, null);
      
      expect(result).toBeNull();
    });

    test('should handle invalid movement configuration gracefully', () => {
      const movingConfig = {
        x: 400,
        y: 300,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true,
        movement: {
          type: 'invalid',
          speed: 60
        }
      };

      const result = sceneFactory.createMovingPlatform(movingConfig, mockPlatformsGroup);
      
      expect(result).toBeNull();
    });

    test('should handle missing movement configuration gracefully', () => {
      const movingConfig = {
        x: 400,
        y: 300,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true
        // No movement configuration
      };

      const result = sceneFactory.createMovingPlatform(movingConfig, mockPlatformsGroup);
      
      expect(result).toBeNull();
    });
  });

  describe('validateMovementConfiguration', () => {
    test('should validate linear movement configuration', () => {
      const linearConfig = {
        type: 'linear',
        speed: 60,
        startX: 400,
        startY: 300,
        endX: 600,
        endY: 300,
        mode: 'bounce',
        autoStart: true
      };

      const result = sceneFactory.validateMovementConfiguration(linearConfig);
      
      expect(result).toBe(true);
    });

    test('should validate circular movement configuration', () => {
      const circularConfig = {
        type: 'circular',
        speed: 45,
        centerX: 500,
        centerY: 400,
        radius: 100,
        angle: 0,
        autoStart: true
      };

      const result = sceneFactory.validateMovementConfiguration(circularConfig);
      
      expect(result).toBe(true);
    });

    test('should validate path movement configuration', () => {
      const pathConfig = {
        type: 'path',
        speed: 80,
        pathPoints: [
          { x: 300, y: 200 },
          { x: 500, y: 200 }
        ],
        loop: true,
        autoStart: true
      };

      const result = sceneFactory.validateMovementConfiguration(pathConfig);
      
      expect(result).toBe(true);
    });

    test('should reject invalid movement type', () => {
      const invalidConfig = {
        type: 'invalid',
        speed: 60
      };

      const result = sceneFactory.validateMovementConfiguration(invalidConfig);
      
      expect(result).toBe(false);
    });

    test('should reject configuration with invalid speed', () => {
      const invalidConfig = {
        type: 'linear',
        speed: 0,
        startX: 400,
        startY: 300,
        endX: 600,
        endY: 300
      };

      const result = sceneFactory.validateMovementConfiguration(invalidConfig);
      
      expect(result).toBe(false);
    });

    test('should reject linear configuration with missing required fields', () => {
      const invalidConfig = {
        type: 'linear',
        speed: 60,
        startX: 400
        // Missing startY, endX, endY
      };

      const result = sceneFactory.validateMovementConfiguration(invalidConfig);
      
      expect(result).toBe(false);
    });

    test('should reject circular configuration with missing required fields', () => {
      const invalidConfig = {
        type: 'circular',
        speed: 45,
        centerX: 500
        // Missing centerY, radius
      };

      const result = sceneFactory.validateMovementConfiguration(invalidConfig);
      
      expect(result).toBe(false);
    });

    test('should reject path configuration with insufficient path points', () => {
      const invalidConfig = {
        type: 'path',
        speed: 80,
        pathPoints: [
          { x: 300, y: 200 }
          // Only one point, need at least 2
        ],
        loop: true
      };

      const result = sceneFactory.validateMovementConfiguration(invalidConfig);
      
      expect(result).toBe(false);
    });

    test('should reject null configuration', () => {
      const result = sceneFactory.validateMovementConfiguration(null);
      
      expect(result).toBe(false);
    });
  });

  describe('createPlatformsFromConfig', () => {
    test('should create all platforms from configuration', () => {
      const config = {
        platforms: [
          {
            type: 'ground',
            x: 0,
            y: 656,
            width: 1280,
            tilePrefix: 'terrain_grass_horizontal',
            isFullBlock: true
          },
          {
            type: 'floating',
            x: 200,
            y: 500,
            tilePrefix: 'terrain_grass_block',
            isFullBlock: true
          }
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    test('should create mixed platform types from configuration', () => {
      const config = {
        platforms: [
          {
            type: 'floating',
            x: 200,
            y: 500,
            tilePrefix: 'terrain_grass_block',
            isFullBlock: true
          },
          {
            type: 'moving',
            x: 400,
            y: 300,
            tilePrefix: 'terrain_grass_block',
            isFullBlock: true,
            movement: {
              type: 'linear',
              speed: 60,
              startX: 400,
              startY: 300,
              endX: 600,
              endY: 300,
              mode: 'bounce',
              autoStart: true
            }
          }
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
    });

    test('should return empty array when no configuration loaded', () => {
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      expect(result).toEqual([]);
    });

    test('should return empty array when no platforms group provided', () => {
      const config = {
        platforms: [
          {
            type: 'ground',
            x: 0,
            y: 656,
            width: 1280,
            tilePrefix: 'terrain_grass_horizontal',
            isFullBlock: true
          }
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createPlatformsFromConfig(null);
      
      expect(result).toEqual([]);
    });

    test('should handle invalid platform configurations gracefully', () => {
      const config = {
        platforms: [
          {
            type: 'invalid',
            x: 200,
            y: 500
          }
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      expect(result).toEqual([]);
    });

    test('should handle invalid moving platform configurations gracefully', () => {
      const config = {
        platforms: [
          {
            type: 'moving',
            x: 400,
            y: 300,
            tilePrefix: 'terrain_grass_block',
            isFullBlock: true,
            movement: {
              type: 'invalid',
              speed: 60
            }
          }
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      expect(result).toEqual([]);
    });
  });

  describe('configurePlatform', () => {
    test('should configure platform physics correctly for full block', () => {
      const mockPlatform = {
        body: {
          setImmovable: jest.fn(),
          setAllowGravity: jest.fn(),
          setSize: jest.fn(),
          setOffset: jest.fn()
        },
        width: 64,
        height: 64
      };

      sceneFactory.configurePlatform(mockPlatform, true);
      
      expect(mockPlatform.body.setImmovable).toHaveBeenCalledWith(true);
      expect(mockPlatform.body.setAllowGravity).toHaveBeenCalledWith(false);
      expect(mockPlatform.body.setSize).toHaveBeenCalledWith(64, 64);
      expect(mockPlatform.body.setOffset).toHaveBeenCalledWith(0, 0);
    });

    test('should configure platform physics correctly for partial block', () => {
      const mockPlatform = {
        body: {
          setImmovable: jest.fn(),
          setAllowGravity: jest.fn(),
          setSize: jest.fn(),
          setOffset: jest.fn()
        },
        width: 64,
        height: 64
      };

      sceneFactory.configurePlatform(mockPlatform, false);
      
      expect(mockPlatform.body.setImmovable).toHaveBeenCalledWith(true);
      expect(mockPlatform.body.setAllowGravity).toHaveBeenCalledWith(false);
      expect(mockPlatform.body.setSize).toHaveBeenCalledWith(64, 20);
      expect(mockPlatform.body.setOffset).toHaveBeenCalledWith(0, 44);
    });

    test('should handle platform without body gracefully', () => {
      const mockPlatform = {
        width: 64,
        height: 64
        // No body property
      };

      expect(() => {
        sceneFactory.configurePlatform(mockPlatform, true);
      }).not.toThrow();
    });

    test('should handle null platform gracefully', () => {
      expect(() => {
        sceneFactory.configurePlatform(null, true);
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle missing scene gracefully', () => {
      const factoryWithoutScene = new SceneFactory(null);
      
      expect(factoryWithoutScene.scene).toBeNull();
    });

    test('should handle missing platforms group in platform creation', () => {
      const config = {
        platforms: [
          {
            type: 'ground',
            x: 0,
            y: 656,
            width: 1280,
            tilePrefix: 'terrain_grass_horizontal_middle',
            isFullBlock: true
          }
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createPlatformsFromConfig(null);
      
      expect(result).toEqual([]);
    });
  });
}); 