import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('SceneFactory - Floating Platform Width Support', () => {
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
    
    sceneFactory = new SceneFactory(mockScene);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createFloatingPlatform with width parameter', () => {
    test('should create multiple tiles when width is specified', () => {
      const platformConfig = {
        x: 200,
        y: 1200,
        width: 192, // 3 tiles (192 / 64 = 3)
        tileKey: 'terrain_grass_block_center',
        isFullBlock: true
      };

      const platforms = sceneFactory.createFloatingPlatform(platformConfig, mockPlatformsGroup);
      
      // Should create exactly 3 platform sprites
      expect(platforms).toHaveLength(3);
      
      // Verify each platform was created with correct parameters
      expect(mockPlatformsGroup.create).toHaveBeenCalledTimes(3);
      
      // First tile at x=200
      expect(mockPlatformsGroup.create).toHaveBeenCalledWith(
        200, 1200, 'tiles', 'terrain_grass_block_center'
      );
      
      // Second tile at x=264 (200 + 64)
      expect(mockPlatformsGroup.create).toHaveBeenCalledWith(
        264, 1200, 'tiles', 'terrain_grass_block_center'
      );
      
      // Third tile at x=328 (200 + 128)
      expect(mockPlatformsGroup.create).toHaveBeenCalledWith(
        328, 1200, 'tiles', 'terrain_grass_block_center'
      );
    });

    test('should fall back to single tile when width is not specified', () => {
      const platformConfig = {
        x: 400,
        y: 1100,
        tileKey: 'terrain_grass_block_center',
        isFullBlock: true
      };

      const platform = sceneFactory.createFloatingPlatform(platformConfig, mockPlatformsGroup);
      
      // Should create exactly 1 platform sprite
      expect(platform).toBeDefined();
      expect(platform).not.toBeNull();
      
      // Verify platform was created with correct parameters
      expect(mockPlatformsGroup.create).toHaveBeenCalledTimes(1);
      expect(mockPlatformsGroup.create).toHaveBeenCalledWith(
        400, 1100, 'tiles', 'terrain_grass_block_center'
      );
      
      // Verify platform properties
      expect(platform.x).toBe(400);
      expect(platform.y).toBe(1100);
      expect(platform.texture).toBe('tiles');
      expect(platform.frame).toBe('terrain_grass_block_center');
    });

    test('should handle width that is not a multiple of tile width', () => {
      const platformConfig = {
        x: 300,
        y: 1000,
        width: 150, // 2.34 tiles, should round up to 3 tiles
        tileKey: 'terrain_grass_block_center',
        isFullBlock: true
      };

      const platforms = sceneFactory.createFloatingPlatform(platformConfig, mockPlatformsGroup);
      
      // Should create 3 tiles (Math.ceil(150 / 64) = 3)
      expect(platforms).toHaveLength(3);
      expect(mockPlatformsGroup.create).toHaveBeenCalledTimes(3);
    });

    test('should return null when platformsGroup is invalid', () => {
      const platformConfig = {
        x: 200,
        y: 1200,
        width: 192,
        tileKey: 'terrain_grass_block_center',
        isFullBlock: true
      };

      const platforms = sceneFactory.createFloatingPlatform(platformConfig, null);
      
      expect(platforms).toBeNull();
      expect(mockPlatformsGroup.create).not.toHaveBeenCalled();
    });
  });
}); 