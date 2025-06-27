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
      
      // Should create 1 ground platform (which creates multiple tiles) + 5 floating platforms + 1 moving platform
      expect(platforms.length).toBeGreaterThan(5);
      
      // Verify ground platform tiles were created (moving platforms use mockPlatformsGroup.add, not create)
      const expectedGroundTiles = Math.ceil(1280 / 64); // 1280 width / 64 tile width
      const expectedFloatingPlatforms = 5;
      expect(mockPlatformsGroup.create).toHaveBeenCalledTimes(expectedGroundTiles + expectedFloatingPlatforms);
    });
  });

  describe('Platform Creation Integration', () => {
    test('should create ground platform with correct tile pattern', () => {
      const groundConfig = testLevelConfig.platforms.find(p => p.type === 'ground');
      const platforms = sceneFactory.createGroundPlatform(groundConfig, mockPlatformsGroup);
      
      expect(platforms).toBeDefined();
      expect(platforms.length).toBe(Math.ceil(1280 / 64));
      
      // Verify first and last tiles are positioned correctly
      expect(platforms[0].x).toBe(0);
      expect(platforms[0].y).toBe(656);
      expect(platforms[platforms.length - 1].x).toBe(1280 - 64);
    });

    test('should create floating platforms with correct positions', () => {
      const floatingConfigs = testLevelConfig.platforms.filter(p => p.type === 'floating');
      
      for (const config of floatingConfigs) {
        const platform = sceneFactory.createFloatingPlatform(config, mockPlatformsGroup);
        expect(platform).toBeDefined();
        expect(platform.x).toBe(config.x);
        expect(platform.y).toBe(config.y);
        expect(platform.texture).toBe('tiles');
        expect(platform.frame).toBe(config.tileKey);
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
        body: {
          setImmovable: jest.fn(),
          setAllowGravity: jest.fn(),
          setSize: jest.fn(),
          setOffset: jest.fn()
        }
      };
      
      mockPlatformsGroup.create = jest.fn(() => mockPlatform);
      
      sceneFactory.createFloatingPlatform(floatingConfig, mockPlatformsGroup);
      
      expect(mockPlatform.body.setImmovable).toHaveBeenCalledWith(true);
      expect(mockPlatform.body.setAllowGravity).toHaveBeenCalledWith(false);
      expect(mockPlatform.body.setSize).toHaveBeenCalled();
      expect(mockPlatform.body.setOffset).toHaveBeenCalled();
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
      
      // Current version creates: 20 ground tiles (1280/64) + 5 floating platforms + 1 moving platform = 26 total
      const expectedGroundTiles = Math.ceil(1280 / 64);
      const expectedFloatingPlatforms = 5;
      const expectedMovingPlatforms = 1;
      const expectedTotal = expectedGroundTiles + expectedFloatingPlatforms + expectedMovingPlatforms;
      
      expect(platforms.length).toBe(expectedTotal);
    });

    test('should maintain same platform positions as hardcoded version', () => {
      sceneFactory.loadConfiguration(testLevelConfig);
      const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      // Get the expected floating platform positions from the config
      const floatingConfigs = testLevelConfig.platforms.filter(p => p.type === 'floating');
      expect(floatingConfigs.length).toBe(5);
      
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