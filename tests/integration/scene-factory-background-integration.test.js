import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('SceneFactory Background Integration', () => {
  let mockScene;
  let sceneFactory;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    
    // Create proper Jest spies for the methods we want to test
    jest.spyOn(mockScene.add, 'tileSprite').mockReturnValue({
      setDepth: jest.fn().mockReturnThis(),
      setData: jest.fn().mockReturnThis(),
      x: 0,
      y: 0
    });
    
    sceneFactory = new SceneFactory(mockScene);
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('loadConfiguration with backgrounds', () => {
    test('should load level configuration with backgrounds section successfully', () => {
      // Arrange
      const levelConfig = {
        platforms: [
          {
            type: 'ground',
            x: 0,
            y: 656,
            width: 1280,
            tileKey: 'terrain_grass_horizontal_middle',
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
        ]
      };

      // Act
      const result = sceneFactory.loadConfiguration(levelConfig);

      // Assert
      expect(result).toBe(true);
      expect(sceneFactory.config).toEqual(levelConfig);
      expect(sceneFactory.config.backgrounds).toBeDefined();
      expect(sceneFactory.config.backgrounds.length).toBe(1);
    });

    test('should load level configuration without backgrounds section gracefully', () => {
      // Arrange
      const levelConfig = {
        platforms: [
          {
            type: 'ground',
            x: 0,
            y: 656,
            width: 1280,
            tileKey: 'terrain_grass_horizontal_middle',
            isFullBlock: true
          }
        ]
        // No backgrounds section
      };

      // Act
      const result = sceneFactory.loadConfiguration(levelConfig);

      // Assert
      expect(result).toBe(true);
      expect(sceneFactory.config).toEqual(levelConfig);
      expect(sceneFactory.config.backgrounds).toBeUndefined(); // Should remain undefined
    });

    test('should validate background configuration during loading', () => {
      // Arrange
      const levelConfigWithInvalidBackgrounds = {
        platforms: [],
        backgrounds: [
          {
            // Invalid - missing required fields
            type: 'layer',
            x: 640,
            y: 360
            // Missing width, height, spriteKey, depth
          }
        ]
      };

      // Act
      const result = sceneFactory.loadConfiguration(levelConfigWithInvalidBackgrounds);

      // Assert
      expect(result).toBe(false); // Should reject invalid background config
      expect(sceneFactory.config).toBeNull();
    });

    test('should handle empty backgrounds array during loading', () => {
      // Arrange
      const levelConfig = {
        platforms: [],
        backgrounds: [] // Empty array
      };

      // Act
      const result = sceneFactory.loadConfiguration(levelConfig);

      // Assert
      expect(result).toBe(true);
      expect(sceneFactory.config).toEqual(levelConfig);
      expect(sceneFactory.config.backgrounds).toEqual([]);
    });

    test('should reject non-array backgrounds section', () => {
      // Arrange
      const levelConfig = {
        platforms: [],
        backgrounds: "invalid" // Should be array
      };

      // Act
      const result = sceneFactory.loadConfiguration(levelConfig);

      // Assert
      expect(result).toBe(false);
      expect(sceneFactory.config).toBeNull();
    });

    test('should validate multiple background layers during loading', () => {
      // Arrange
      const levelConfig = {
        platforms: [],
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
          },
          {
            type: 'layer',
            x: 640,
            y: 360,
            width: 1280,
            height: 720,
            spriteKey: 'background_color_hills',
            depth: -1,
            scrollSpeed: 0.5
          }
        ]
      };

      // Act
      const result = sceneFactory.loadConfiguration(levelConfig);

      // Assert
      expect(result).toBe(true);
      expect(sceneFactory.config.backgrounds.length).toBe(2);
    });
  });

  describe('createBackgroundsFromConfig integration with loadConfiguration', () => {
    test('should create backgrounds from loaded configuration', async () => {
      // Arrange
      const levelConfig = {
        platforms: [],
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
          },
          {
            type: 'layer',
            x: 640,
            y: 360,
            width: 1280,
            height: 720,
            spriteKey: 'background_color_hills',
            depth: -1,
            scrollSpeed: 0.5
          }
        ]
      };

      const mockBackground1 = {
        setDepth: jest.fn(),
        setData: jest.fn(),
        tilePositionX: 0,
        tilePositionY: 0
      };
      const mockBackground2 = {
        setDepth: jest.fn(),
        setData: jest.fn(),
        tilePositionX: 0,
        tilePositionY: 0
      };
      mockScene.add.tileSprite
        .mockReturnValueOnce(mockBackground1)
        .mockReturnValueOnce(mockBackground2);

      // Act
      sceneFactory.loadConfiguration(levelConfig);
      const backgrounds = await sceneFactory.createBackgroundsFromConfig(levelConfig.backgrounds);

      // Assert
      expect(backgrounds.length).toBe(2);
      expect(mockScene.add.tileSprite).toHaveBeenCalledTimes(2);
      expect(mockScene.add.tileSprite).toHaveBeenNthCalledWith(1, 640, 360, 1280, 720, 'backgrounds', 'background_solid_sky');
      expect(mockScene.add.tileSprite).toHaveBeenNthCalledWith(2, 640, 360, 1280, 720, 'backgrounds', 'background_color_hills');
    });

    test('should handle loaded configuration without backgrounds', async () => {
      // Arrange
      const levelConfig = {
        platforms: []
        // No backgrounds section
      };

      // Act
      sceneFactory.loadConfiguration(levelConfig);
      const backgrounds = await sceneFactory.createBackgroundsFromConfig(levelConfig.backgrounds);

      // Assert
      expect(backgrounds).toEqual([]); // Should return empty array for undefined backgrounds
      expect(mockScene.add.tileSprite).not.toHaveBeenCalled();
    });

    test('should create backgrounds with proper validation from loaded config', async () => {
      // Arrange
      const config = {
        platforms: [],
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
          },
          {
            // Invalid config - missing required fields
            type: 'layer',
            x: 640,
            y: 360
            // Missing width, height, spriteKey, depth
          }
        ]
      };

      const mockBackground = {
        setDepth: jest.fn(),
        setData: jest.fn(),
        tilePositionX: 0,
        tilePositionY: 0
      };
      mockScene.add.tileSprite.mockReturnValue(mockBackground);

      // Act
      const loadResult = sceneFactory.loadConfiguration(config);
      
      // When loadConfiguration returns false, config should not be used
      let backgrounds = [];
      if (loadResult) {
        backgrounds = await sceneFactory.createBackgroundsFromConfig(config.backgrounds);
      }

      // Assert
      expect(loadResult).toBe(false); // Should reject config with invalid backgrounds
      expect(backgrounds.length).toBe(0); // No backgrounds should be created from invalid config
      expect(mockScene.add.tileSprite).not.toHaveBeenCalled();
    });
  });

  describe('backward compatibility', () => {
    test('should maintain backward compatibility with existing level configs', () => {
      // Arrange - Simulate existing test-level.json format without backgrounds
      const existingLevelConfig = {
        platforms: [
          {
            type: 'ground',
            x: 0,
            y: 656,
            width: 1280,
            tileKey: 'terrain_grass_horizontal_middle',
            isFullBlock: true
          },
          {
            type: 'floating',
            x: 200,
            y: 500,
            tileKey: 'terrain_grass_block_center',
            isFullBlock: true
          }
        ],
        coins: [
          {
            type: 'coin',
            x: 400,
            y: 450,
            properties: { value: 100 }
          }
        ]
      };

      // Act
      const result = sceneFactory.loadConfiguration(existingLevelConfig);

      // Assert
      expect(result).toBe(true);
      expect(sceneFactory.config).toEqual(existingLevelConfig);
      // Should work with existing platform and coin creation
      expect(sceneFactory.config.platforms.length).toBe(2);
      expect(sceneFactory.config.coins.length).toBe(1);
    });

    test('should handle mixed old and new configuration features', () => {
      // Arrange - Level config with both old features and new backgrounds
      const mixedLevelConfig = {
        platforms: [
          {
            type: 'ground',
            x: 0,
            y: 656,
            width: 1280,
            tileKey: 'terrain_grass_horizontal_middle',
            isFullBlock: true
          }
        ],
        coins: [
          {
            type: 'coin',
            x: 400,
            y: 450,
            properties: { value: 100 }
          }
        ],
        backgrounds: [
          {
            type: 'layer',
            x: 640,
            y: 360,
            width: 1280,
            height: 720,
            spriteKey: 'background_color_hills',
            depth: -1,
            scrollSpeed: 0.5
          }
        ]
      };

      // Act
      const result = sceneFactory.loadConfiguration(mixedLevelConfig);

      // Assert
      expect(result).toBe(true);
      expect(sceneFactory.config).toEqual(mixedLevelConfig);
      expect(sceneFactory.config.platforms.length).toBe(1);
      expect(sceneFactory.config.coins.length).toBe(1);
      expect(sceneFactory.config.backgrounds.length).toBe(1);
    });
  });
}); 