import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('SceneFactory Decorative Platform Integration', () => {
  let mockScene;
  let sceneFactory;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    // Add image spy for decorative platform creation
    if (!mockScene.add.image) {
      mockScene.add.image = jest.fn().mockReturnValue({
        setDepth: jest.fn().mockReturnThis(),
        setOrigin: jest.fn().mockReturnThis(),
        x: 0,
        y: 0
      });
    } else {
      jest.spyOn(mockScene.add, 'image').mockReturnValue({
        setDepth: jest.fn().mockReturnThis(),
        setOrigin: jest.fn().mockReturnThis(),
        x: 0,
        y: 0
      });
    }
    sceneFactory = new SceneFactory(mockScene);
    jest.clearAllMocks();
  });

  describe('loadConfiguration with decorative platforms', () => {
    test('should load level configuration with decorative platforms section successfully', () => {
      // Arrange
      const levelConfig = {
        platforms: [],
        decorativePlatforms: [
          {
            type: 'decorative',
            x: 100,
            y: 200,
            tilePrefix: 'terrain_grass_block',
            depth: -0.5
          }
        ]
      };

      // Act
      const result = sceneFactory.loadConfiguration(levelConfig);

      // Assert
      expect(result).toBe(true);
      expect(sceneFactory.config).toEqual(levelConfig);
      expect(sceneFactory.config.decorativePlatforms).toBeDefined();
      expect(sceneFactory.config.decorativePlatforms.length).toBe(1);
    });

    test('should load level configuration without decorative platforms section gracefully', () => {
      // Arrange
      const levelConfig = {
        platforms: []
        // No decorativePlatforms section
      };

      // Act
      const result = sceneFactory.loadConfiguration(levelConfig);

      // Assert
      expect(result).toBe(true);
      expect(sceneFactory.config).toEqual(levelConfig);
      expect(sceneFactory.config.decorativePlatforms).toBeUndefined();
    });

    test('should validate decorative platform configuration during loading', () => {
      // Arrange
      const levelConfigWithInvalidDecoratives = {
        platforms: [],
        decorativePlatforms: [
          {
            // Invalid - missing required fields
            type: 'decorative',
            x: 100,
            y: 200
            // Missing tilePrefix and depth
          }
        ]
      };

      // Act
      const result = sceneFactory.loadConfiguration(levelConfigWithInvalidDecoratives);

      // Assert
      expect(result).toBe(false); // Should reject invalid decorative platform config
      expect(sceneFactory.config).toBeNull();
    });

    test('should handle empty decorative platforms array during loading', () => {
      // Arrange
      const levelConfig = {
        platforms: [],
        decorativePlatforms: [] // Empty array
      };

      // Act
      const result = sceneFactory.loadConfiguration(levelConfig);

      // Assert
      expect(result).toBe(true);
      expect(sceneFactory.config).toEqual(levelConfig);
      expect(sceneFactory.config.decorativePlatforms).toEqual([]);
    });

    test('should reject non-array decorative platforms section', () => {
      // Arrange
      const levelConfig = {
        platforms: [],
        decorativePlatforms: "invalid" // Should be array
      };

      // Act
      const result = sceneFactory.loadConfiguration(levelConfig);

      // Assert
      expect(result).toBe(false);
      expect(sceneFactory.config).toBeNull();
    });

    test('should validate multiple decorative platforms during loading', () => {
      // Arrange
      const levelConfig = {
        platforms: [],
        decorativePlatforms: [
          {
            type: 'decorative',
            x: 100,
            y: 200,
            tilePrefix: 'terrain_grass_block',
            depth: -0.5
          },
          {
            type: 'decorative',
            x: 300,
            y: 150,
            tilePrefix: 'bush',
            depth: -0.3
          }
        ]
      };

      // Act
      const result = sceneFactory.loadConfiguration(levelConfig);

      // Assert
      expect(result).toBe(true);
      expect(sceneFactory.config.decorativePlatforms.length).toBe(2);
    });

    test('should validate decorative platform type field', () => {
      // Arrange
      const levelConfigWithWrongType = {
        platforms: [],
        decorativePlatforms: [
          {
            type: 'invalid', // Wrong type
            x: 100,
            y: 200,
            tilePrefix: 'terrain_grass_block',
            depth: -0.5
          }
        ]
      };

      // Act
      const result = sceneFactory.loadConfiguration(levelConfigWithWrongType);

      // Assert
      expect(result).toBe(false);
      expect(sceneFactory.config).toBeNull();
    });

    test('should validate decorative platform depth is negative', () => {
      // Arrange
      const levelConfigWithInvalidDepth = {
        platforms: [],
        decorativePlatforms: [
          {
            type: 'decorative',
            x: 100,
            y: 200,
            tilePrefix: 'terrain_grass_block',
            depth: 0.5 // Invalid: should be negative
          }
        ]
      };

      // Act
      const result = sceneFactory.loadConfiguration(levelConfigWithInvalidDepth);

      // Assert
      expect(result).toBe(false);
      expect(sceneFactory.config).toBeNull();
    });

    test('should validate decorative platform width if specified', () => {
      // Arrange
      const levelConfigWithInvalidWidth = {
        platforms: [],
        decorativePlatforms: [
          {
            type: 'decorative',
            x: 100,
            y: 200,
            width: -64, // Invalid: negative width
            tilePrefix: 'terrain_grass_block',
            depth: -0.5
          }
        ]
      };

      // Act
      const result = sceneFactory.loadConfiguration(levelConfigWithInvalidWidth);

      // Assert
      expect(result).toBe(false);
      expect(sceneFactory.config).toBeNull();
    });
  });

  describe('createDecorativePlatformsFromConfig integration with loadConfiguration', () => {
    test('should create decorative platforms from loaded configuration', () => {
      // Arrange
      const levelConfig = {
        platforms: [],
        decorativePlatforms: [
          {
            type: 'decorative',
            x: 100,
            y: 200,
            tilePrefix: 'terrain_grass_block',
            depth: -0.5
          },
          {
            type: 'decorative',
            x: 300,
            y: 150,
            tilePrefix: 'bush',
            depth: -0.3
          }
        ]
      };

      sceneFactory.loadConfiguration(levelConfig);

      // Act
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig(levelConfig.decorativePlatforms);

      // Assert
      expect(decoratives.length).toBe(2);
      expect(mockScene.add.image).toHaveBeenCalledTimes(2);
      expect(mockScene.add.image).toHaveBeenNthCalledWith(1, 100, 200, 'tiles', 'terrain_grass_block');
      expect(mockScene.add.image).toHaveBeenNthCalledWith(2, 300, 150, 'tiles', 'bush');
    });

    test('should create multi-tile decorative platforms from loaded configuration', () => {
      // Arrange
      const levelConfig = {
        platforms: [],
        decorativePlatforms: [
          {
            type: 'decorative',
            x: 100,
            y: 200,
            width: 192, // 3 tiles
            tilePrefix: 'terrain_grass_block',
            depth: -0.5
          }
        ]
      };

      sceneFactory.loadConfiguration(levelConfig);

      // Act
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig(levelConfig.decorativePlatforms);

      // Assert
      expect(decoratives.length).toBe(3);
      expect(mockScene.add.image).toHaveBeenCalledTimes(3);
      expect(mockScene.add.image).toHaveBeenNthCalledWith(1, 100, 200, 'tiles', 'terrain_grass_block_left');
      expect(mockScene.add.image).toHaveBeenNthCalledWith(2, 164, 200, 'tiles', 'terrain_grass_block_center');
      expect(mockScene.add.image).toHaveBeenNthCalledWith(3, 228, 200, 'tiles', 'terrain_grass_block_right');
    });

    test('should handle empty decorative platforms array gracefully', () => {
      // Arrange
      const levelConfig = {
        platforms: [],
        decorativePlatforms: []
      };

      sceneFactory.loadConfiguration(levelConfig);

      // Act
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig(levelConfig.decorativePlatforms);

      // Assert
      expect(decoratives.length).toBe(0);
      expect(mockScene.add.image).not.toHaveBeenCalled();
    });

    test('should skip invalid decorative platform configurations', () => {
      // Arrange
      const levelConfig = {
        platforms: [],
        decorativePlatforms: [
          {
            type: 'decorative',
            x: 100,
            y: 200,
            tilePrefix: 'terrain_grass_block',
            depth: -0.5
          },
          {
            // Invalid - missing required fields
            type: 'decorative',
            x: 300,
            y: 150
            // Missing tilePrefix and depth
          },
          {
            type: 'decorative',
            x: 500,
            y: 250,
            tilePrefix: 'bush',
            depth: -0.3
          }
        ]
      };

      sceneFactory.loadConfiguration(levelConfig);

      // Act
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig(levelConfig.decorativePlatforms);

      // Assert
      expect(decoratives.length).toBe(2); // Only valid ones created
      expect(mockScene.add.image).toHaveBeenCalledTimes(2);
      expect(mockScene.add.image).toHaveBeenNthCalledWith(1, 100, 200, 'tiles', 'terrain_grass_block');
      expect(mockScene.add.image).toHaveBeenNthCalledWith(2, 500, 250, 'tiles', 'bush');
    });
  });

  describe('backward compatibility', () => {
    test('should maintain backward compatibility with existing level configs', () => {
      // Arrange - existing level config without decorative platforms
      const existingLevelConfig = {
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
        ],
        coins: [
          {
            type: 'coin',
            x: 400,
            y: 300
          }
        ]
      };

      // Act
      const result = sceneFactory.loadConfiguration(existingLevelConfig);

      // Assert
      expect(result).toBe(true);
      expect(sceneFactory.config).toEqual(existingLevelConfig);
      expect(sceneFactory.config.decorativePlatforms).toBeUndefined();
    });

    test('should handle mixed configuration with existing and new sections', () => {
      // Arrange - level config with both existing and new sections
      const mixedLevelConfig = {
        platforms: [
          {
            type: 'ground',
            x: 0,
            y: 656,
            width: 1280,
            tilePrefix: 'terrain_grass_horizontal',
            isFullBlock: true
          }
        ],
        backgrounds: [
          {
            type: 'layer',
            x: 640,
            y: 360,
            width: 1280,
            height: 720,
            spriteKey: 'background_solid_sky',
            depth: -2,
            scrollSpeed: 0.0
          }
        ],
        decorativePlatforms: [
          {
            type: 'decorative',
            x: 100,
            y: 200,
            tilePrefix: 'terrain_grass_block',
            depth: -0.5
          }
        ]
      };

      // Act
      const result = sceneFactory.loadConfiguration(mixedLevelConfig);

      // Assert
      expect(result).toBe(true);
      expect(sceneFactory.config.platforms.length).toBe(1);
      expect(sceneFactory.config.backgrounds.length).toBe(1);
      expect(sceneFactory.config.decorativePlatforms.length).toBe(1);
    });
  });

  describe('error handling', () => {
    test('should handle null decorative platform config gracefully', () => {
      // Act
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig(null);

      // Assert
      expect(decoratives.length).toBe(0);
      expect(mockScene.add.image).not.toHaveBeenCalled();
    });

    test('should handle undefined decorative platform config gracefully', () => {
      // Act
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig(undefined);

      // Assert
      expect(decoratives.length).toBe(0);
      expect(mockScene.add.image).not.toHaveBeenCalled();
    });

    test('should handle missing scene methods gracefully', () => {
      // Arrange
      const invalidSceneFactory = new SceneFactory(null);
      const decorativeConfigs = [
        {
          type: 'decorative',
          x: 100,
          y: 200,
          tilePrefix: 'terrain_grass_block',
          depth: -0.5
        }
      ];

      // Act
      const decoratives = invalidSceneFactory.createDecorativePlatformsFromConfig(decorativeConfigs);

      // Assert
      expect(decoratives.length).toBe(0);
    });
  });
}); 