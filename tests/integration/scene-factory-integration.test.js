import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import testLevelConfig from '../../client/src/config/test-level.json';

describe('SceneFactory + GameScene Integration', () => {
  let mockScene;
  let sceneFactory;
  let mockPlatformsGroup;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    
    // Create a mock platforms group that matches GameScene's physics group
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
      add: jest.fn(),
      getChildren: jest.fn(() => [])
    };
    
    // Mock the physics.add.group to return our mock platforms group
    mockScene.physics.add.group = jest.fn(() => mockPlatformsGroup);
    
    // Patch mockScene.physics.add.sprite for MovingPlatform
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
    
    sceneFactory = new SceneFactory(mockScene);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Configuration Loading', () => {
    test('should load test level configuration successfully', () => {
      const result = sceneFactory.loadConfiguration(testLevelConfig);
      
      expect(result).toBe(true);
      expect(sceneFactory.config).toEqual(testLevelConfig);
    });

    test('should create all platforms from test level configuration', () => {
      sceneFactory.loadConfiguration(testLevelConfig);
      const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      // Should create 1 ground platform (which creates multiple tiles) + 16 floating platforms + 4 moving platforms
      // The first moving platform has width 300 (5 sprites), others are single sprites (3 sprites), so 4 extra sprites total
      expect(platforms.length).toBeGreaterThan(20);
      
      // Verify ground platform tiles were created (moving platforms use mockPlatformsGroup.add, not create)
      const expectedGroundTiles = Math.ceil(2600 / 64); // 2600 width / 64 tile width
      const expectedFloatingPlatforms = 16;
      const expectedMovingPlatformSprites = 5 + 1 + 1 + 1; // 5 for first (width 300), 1 each for others
      // Calculate expected floating platform tiles (sum Math.ceil(width/64) for each config)
      const floatingConfigs = testLevelConfig.platforms.filter(p => p.type === 'floating');
      const expectedFloatingPlatformTiles = floatingConfigs.reduce((sum, config) => {
        if (config.width) {
          return sum + Math.ceil(config.width / 64);
        }
        return sum + 1;
      }, 0);
      const expectedCreateCalls = expectedGroundTiles + expectedFloatingPlatformTiles;
      expect(mockPlatformsGroup.create).toHaveBeenCalledTimes(expectedCreateCalls);
    });
  });

  describe('Platform Creation Integration', () => {
    test('should create ground platform with correct tile pattern', () => {
      const groundConfig = testLevelConfig.platforms.find(p => p.type === 'ground');
      const platforms = sceneFactory.createGroundPlatform(groundConfig, mockPlatformsGroup);
      
      expect(platforms).toBeDefined();
      expect(platforms.length).toBe(Math.ceil(2600 / 64));
      
      // Verify first and last tiles are positioned correctly
      expect(platforms[0].x).toBe(0);
      expect(platforms[0].y).toBe(1400);
      expect(platforms[platforms.length - 1].x).toBe(2560); // 40 * 64 = 2560 (last tile position)
    });

    test('should create floating platforms with correct positions', () => {
      const floatingConfigs = testLevelConfig.platforms.filter(p => p.type === 'floating');
      
      for (const config of floatingConfigs) {
        const platform = sceneFactory.createFloatingPlatform(config, mockPlatformsGroup);
        expect(platform).toBeDefined();
        
        // Handle both single platform and array of platforms (when width is specified)
        if (Array.isArray(platform)) {
          // Multi-tile platform - check first tile
          expect(platform[0].x).toBe(config.x);
          expect(platform[0].y).toBe(config.y);
          expect(platform[0].texture).toBe('tiles');
          expect(platform[0].frame).toBe(config.tileKey);
        } else {
          // Single tile platform
          expect(platform.x).toBe(config.x);
          expect(platform.y).toBe(config.y);
          expect(platform.texture).toBe('tiles');
          expect(platform.frame).toBe(config.tileKey);
        }
      }
    });
  });

  describe('Physics Configuration Integration', () => {
    test('should configure ground platform physics correctly', () => {
      const groundConfig = testLevelConfig.platforms.find(p => p.type === 'ground');
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

    test('should configure floating platform physics correctly', () => {
      const floatingConfig = testLevelConfig.platforms.find(p => p.type === 'floating');
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
      
      const result = sceneFactory.createFloatingPlatform(floatingConfig, mockPlatformsGroup);
      
      // Handle both single platform and array of platforms
      if (Array.isArray(result)) {
        // Multi-tile platform - check that physics was configured for each tile
        expect(mockPlatform.body.setImmovable).toHaveBeenCalledWith(true);
        expect(mockPlatform.body.setAllowGravity).toHaveBeenCalledWith(false);
        expect(mockPlatform.body.setSize).toHaveBeenCalled();
        expect(mockPlatform.body.setOffset).toHaveBeenCalled();
      } else {
        // Single tile platform
        expect(mockPlatform.body.setImmovable).toHaveBeenCalledWith(true);
        expect(mockPlatform.body.setAllowGravity).toHaveBeenCalledWith(false);
        expect(mockPlatform.body.setSize).toHaveBeenCalled();
        expect(mockPlatform.body.setOffset).toHaveBeenCalled();
      }
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle missing platforms group gracefully', () => {
      const groundConfig = testLevelConfig.platforms.find(p => p.type === 'ground');
      const result = sceneFactory.createGroundPlatform(groundConfig, null);
      
      expect(result).toBeNull();
    });

    test('should handle invalid configuration gracefully', () => {
      const invalidConfig = { platforms: [{ type: 'invalid', x: 0, y: 0 }] };
      sceneFactory.loadConfiguration(invalidConfig);
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      expect(result).toEqual([]);
    });
  });

  describe('Backward Compatibility', () => {
    test('should maintain same platform count as hardcoded version', () => {
      sceneFactory.loadConfiguration(testLevelConfig);
      const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      // Current version creates: 41 ground tiles (2600/64) + 16 floating platforms + 8 moving platform sprites = 65 total
      // Moving platforms: 5 sprites (width 300) + 1 + 1 + 1 = 8 sprites total
      const expectedGroundTiles = Math.ceil(2600 / 64);
      const expectedFloatingPlatforms = 16;
      const expectedMovingPlatformSprites = 5 + 1 + 1 + 1; // 5 for first (width 300), 1 each for others
      const expectedTotal = expectedGroundTiles + expectedFloatingPlatforms + expectedMovingPlatformSprites;
      
      expect(platforms.length).toBe(expectedTotal);
    });

    test('should maintain same platform positions as hardcoded version', () => {
      sceneFactory.loadConfiguration(testLevelConfig);
      const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      // Get the expected floating platform positions from the config
      const floatingConfigs = testLevelConfig.platforms.filter(p => p.type === 'floating');
      expect(floatingConfigs.length).toBe(16);
      
      // Check that each floating platform was created at the correct position
      for (const config of floatingConfigs) {
        const found = platforms.find(p => p.x === config.x && p.y === config.y);
        expect(found).toBeDefined();
        expect(found.texture).toBe('tiles');
        expect(found.frame).toBe(config.tileKey);
      }
    });
  });
}); 