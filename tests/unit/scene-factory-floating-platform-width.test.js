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
      const config = {
        x: 100,
        y: 200,
        width: 192, // 3 tiles
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true
      };

      const platforms = sceneFactory.createFloatingPlatform(config, mockPlatformsGroup);

      expect(Array.isArray(platforms)).toBe(true);
      expect(platforms).toHaveLength(3);
      expect(mockPlatformsGroup.create).toHaveBeenCalledTimes(3);
    });

    test('should fall back to single tile when width is not specified', () => {
      const config = {
        x: 100,
        y: 200,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true
      };

      const platform = sceneFactory.createFloatingPlatform(config, mockPlatformsGroup);

      expect(platform).toBeDefined();
      expect(platform).not.toBeNull();
      expect(platform.frame).toBe('terrain_grass_block');
      expect(mockPlatformsGroup.create).toHaveBeenCalledTimes(1);
    });

    test('should handle width that is not a multiple of tile width', () => {
      const config = {
        x: 100,
        y: 200,
        width: 150, // Should round up to 3 tiles
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true
      };

      const platforms = sceneFactory.createFloatingPlatform(config, mockPlatformsGroup);

      expect(Array.isArray(platforms)).toBe(true);
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