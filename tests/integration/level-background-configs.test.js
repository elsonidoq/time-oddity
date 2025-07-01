import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('Level Background Configurations', () => {
  let sceneFactory;
  let mockScene;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    // Patch tileSprite to always be a Jest mock
    mockScene.add.tileSprite = jest.fn();
    sceneFactory = new SceneFactory(mockScene);
  });

  describe('test-level.json background configuration', () => {
    test('should load test-level.json with background configurations successfully', async () => {
      // Arrange
      const testLevelConfig = {
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
        enemies: [
          {
            type: 'LoopHound',
            x: 300,
            y: 450,
            patrolDistance: 150,
            direction: 1,
            speed: 80
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

      const mockSkyBackground = {
        setDepth: jest.fn(),
        setData: jest.fn(),
        tilePositionX: 0,
        tilePositionY: 0
      };
      const mockHillsBackground = {
        setDepth: jest.fn(),
        setData: jest.fn(),
        tilePositionX: 0,
        tilePositionY: 0
      };
      mockScene.add.tileSprite
        .mockReturnValueOnce(mockSkyBackground)
        .mockReturnValueOnce(mockHillsBackground);

      // Act
      const loadResult = sceneFactory.loadConfiguration(testLevelConfig);
      const backgrounds = await sceneFactory.createBackgroundsFromConfig(testLevelConfig.backgrounds);

      // Assert
      expect(loadResult).toBe(true);
      expect(backgrounds.length).toBe(2);
      expect(mockScene.add.tileSprite).toHaveBeenCalledTimes(2);
      
      // Verify sky background (far background)
      expect(mockScene.add.tileSprite).toHaveBeenNthCalledWith(1, 640, 360, 1280, 720, 'backgrounds', 'background_solid_sky');
      expect(mockSkyBackground.setDepth).toHaveBeenCalledWith(-2);
      expect(mockSkyBackground.setData).toHaveBeenCalledWith('scrollSpeed', 0.0);
      
      // Verify hills background (mid background)
      expect(mockScene.add.tileSprite).toHaveBeenNthCalledWith(2, 640, 360, 1280, 720, 'backgrounds', 'background_color_hills');
      expect(mockHillsBackground.setDepth).toHaveBeenCalledWith(-1);
      expect(mockHillsBackground.setData).toHaveBeenCalledWith('scrollSpeed', 0.5);
    });

    test('should validate background sprite keys against available assets', async () => {
      // Arrange
      const testLevelConfig = {
        platforms: [],
        backgrounds: [
          {
            type: 'layer',
            x: 640,
            y: 360,
            width: 1280,
            height: 720,
            spriteKey: 'background_solid_sky', // Valid sprite key
            depth: -2,
            scrollSpeed: 0.0
          },
          {
            type: 'layer',
            x: 640,
            y: 360,
            width: 1280,
            height: 720,
            spriteKey: 'invalid_sprite_key', // Invalid sprite key
            depth: -1,
            scrollSpeed: 0.5
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
      const loadResult = sceneFactory.loadConfiguration(testLevelConfig);
      const backgrounds = await sceneFactory.createBackgroundsFromConfig(testLevelConfig.backgrounds);

      // Assert
      expect(loadResult).toBe(true); // Config loads successfully
      expect(backgrounds.length).toBe(1); // Only valid background created
      expect(mockScene.add.tileSprite).toHaveBeenCalledTimes(1);
      expect(mockScene.add.tileSprite).toHaveBeenCalledWith(640, 360, 1280, 720, 'backgrounds', 'background_solid_sky');
    });

    test('should maintain visual hierarchy with background depth ordering', async () => {
      // Arrange
      const testLevelConfig = {
        platforms: [
          {
            type: 'floating',
            x: 200,
            y: 500,
            tileKey: 'terrain_grass_block_center',
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
            depth: -2, // Far background
            scrollSpeed: 0.0
          },
          {
            type: 'layer',
            x: 640,
            y: 360,
            width: 1280,
            height: 720,
            spriteKey: 'background_color_hills',
            depth: -1, // Mid background
            scrollSpeed: 0.5
          }
        ]
      };

      const mockSkyBackground = {
        setDepth: jest.fn(),
        setData: jest.fn(),
        tilePositionX: 0,
        tilePositionY: 0
      };
      const mockHillsBackground = {
        setDepth: jest.fn(),
        setData: jest.fn(),
        tilePositionX: 0,
        tilePositionY: 0
      };
      mockScene.add.tileSprite
        .mockReturnValueOnce(mockSkyBackground)
        .mockReturnValueOnce(mockHillsBackground);

      // Act
      const loadResult = sceneFactory.loadConfiguration(testLevelConfig);
      const backgrounds = await sceneFactory.createBackgroundsFromConfig(testLevelConfig.backgrounds);

      // Assert
      expect(loadResult).toBe(true);
      expect(backgrounds.length).toBe(2);
      
      // Verify depth ordering: sky (-2) behind hills (-1)
      expect(mockSkyBackground.setDepth).toHaveBeenCalledWith(-2);
      expect(mockHillsBackground.setDepth).toHaveBeenCalledWith(-1);
      
      // Verify platforms will render above backgrounds (depth 0 or higher)
      // This is implicit in the SceneFactory platform creation
    });

    test('should handle level configuration without backgrounds gracefully', async () => {
      // Arrange
      const testLevelConfig = {
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
        ]
        // No backgrounds section
      };

      // Act
      const loadResult = sceneFactory.loadConfiguration(testLevelConfig);
      const backgrounds = await sceneFactory.createBackgroundsFromConfig(testLevelConfig.backgrounds);

      // Assert
      expect(loadResult).toBe(true);
      expect(backgrounds).toEqual([]); // Empty array for undefined backgrounds
      expect(mockScene.add.tileSprite).not.toHaveBeenCalled();
    });

    test('should validate background depth is negative for proper layering', async () => {
      // Arrange
      const testLevelConfig = {
        platforms: [],
        backgrounds: [
          {
            type: 'layer',
            x: 640,
            y: 360,
            width: 1280,
            height: 720,
            spriteKey: 'background_solid_sky',
            depth: -1, // Valid negative depth
            scrollSpeed: 0.0
          },
          {
            type: 'layer',
            x: 640,
            y: 360,
            width: 1280,
            height: 720,
            spriteKey: 'background_color_hills',
            depth: 1, // Invalid positive depth
            scrollSpeed: 0.5
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
      const loadResult = sceneFactory.loadConfiguration(testLevelConfig);
      const backgrounds = await sceneFactory.createBackgroundsFromConfig(testLevelConfig.backgrounds);

      // Assert
      expect(loadResult).toBe(true);
      expect(backgrounds.length).toBe(1); // Only valid negative depth background created
      expect(mockScene.add.tileSprite).toHaveBeenCalledTimes(1);
      expect(mockScene.add.tileSprite).toHaveBeenCalledWith(640, 360, 1280, 720, 'backgrounds', 'background_solid_sky');
    });

    test('should validate scrollSpeed is within valid range (0.0 to 1.0)', async () => {
      // Arrange
      const testLevelConfig = {
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
            scrollSpeed: 0.5 // Valid scrollSpeed
          },
          {
            type: 'layer',
            x: 640,
            y: 360,
            width: 1280,
            height: 720,
            spriteKey: 'background_color_hills',
            depth: -1,
            scrollSpeed: 1.5 // Invalid scrollSpeed > 1.0
          },
          {
            type: 'layer',
            x: 640,
            y: 360,
            width: 1280,
            height: 720,
            spriteKey: 'background_color_trees',
            depth: -3,
            scrollSpeed: -0.1 // Invalid scrollSpeed < 0.0
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
      const loadResult = sceneFactory.loadConfiguration(testLevelConfig);
      const backgrounds = await sceneFactory.createBackgroundsFromConfig(testLevelConfig.backgrounds);

      // Assert
      expect(loadResult).toBe(true);
      expect(backgrounds.length).toBe(1); // Only valid scrollSpeed background created
      expect(mockScene.add.tileSprite).toHaveBeenCalledTimes(1);
      expect(mockScene.add.tileSprite).toHaveBeenCalledWith(640, 360, 1280, 720, 'backgrounds', 'background_solid_sky');
      expect(mockBackground.setData).toHaveBeenCalledWith('scrollSpeed', 0.5);
    });
  });
}); 