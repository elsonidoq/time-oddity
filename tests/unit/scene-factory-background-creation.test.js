import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('SceneFactory Background Creation', () => {
  let sceneFactory;
  let mockScene;

  beforeEach(() => {
    // Create a proper mock scene with all required methods
    mockScene = {
      add: {
        tileSprite: jest.fn()
      }
    };

    sceneFactory = new SceneFactory(mockScene);
  });

  describe('createBackgroundsFromConfig', () => {
    test('should create single background layer with valid configuration', async () => {
      // Arrange
      const backgroundConfigs = [{
        type: 'layer',
        x: 640,
        y: 360,
        width: 1280,
        height: 720,
        spriteKey: 'background_solid_sky',
        depth: -2,
        scrollSpeed: 0.0
      }];

      // Create a proper mock background object with all required methods
      const mockBackground = {
        setDepth: jest.fn(),
        setData: jest.fn(),
        tilePositionX: 0,
        tilePositionY: 0
      };
      mockScene.add.tileSprite.mockReturnValue(mockBackground);

      // Act
      const backgrounds = await sceneFactory.createBackgroundsFromConfig(backgroundConfigs);

      // Assert
      expect(backgrounds.length).toBe(1);
      expect(mockScene.add.tileSprite).toHaveBeenCalledWith(640, 360, 1280, 720, 'backgrounds', 'background_solid_sky');
      expect(backgrounds[0].setDepth).toHaveBeenCalledWith(-2);
    });

    test('should create multiple background layers with correct depth ordering', async () => {
      // Arrange
      const backgroundConfigs = [
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
      ];

      // Create mock background objects
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
      const backgrounds = await sceneFactory.createBackgroundsFromConfig(backgroundConfigs);

      // Assert
      expect(backgrounds.length).toBe(2);
      
      // Check first background (sky)
      expect(mockScene.add.tileSprite).toHaveBeenNthCalledWith(1, 640, 360, 1280, 720, 'backgrounds', 'background_solid_sky');
      expect(backgrounds[0].setDepth).toHaveBeenCalledWith(-2);
      
      // Check second background (hills)
      expect(mockScene.add.tileSprite).toHaveBeenNthCalledWith(2, 640, 360, 1280, 720, 'backgrounds', 'background_color_hills');
      expect(backgrounds[1].setDepth).toHaveBeenCalledWith(-1);
    });

    test('should store scrollSpeed data for parallax calculation', async () => {
      // Arrange
      const backgroundConfigs = [{
        type: 'layer',
        x: 640,
        y: 360,
        width: 1280,
        height: 720,
        spriteKey: 'background_color_hills',
        depth: -1,
        scrollSpeed: 0.5
      }];

      const mockBackground = {
        setDepth: jest.fn(),
        setData: jest.fn(),
        tilePositionX: 0,
        tilePositionY: 0
      };
      mockScene.add.tileSprite.mockReturnValue(mockBackground);

      // Act
      const backgrounds = await sceneFactory.createBackgroundsFromConfig(backgroundConfigs);

      // Assert
      expect(backgrounds[0].setData).toHaveBeenCalledWith('scrollSpeed', 0.5);
    });

    test('should handle empty background configuration gracefully', async () => {
      // Act
      const backgrounds = await sceneFactory.createBackgroundsFromConfig([]);

      // Assert
      expect(backgrounds.length).toBe(0);
      expect(mockScene.add.tileSprite).not.toHaveBeenCalled();
    });

    test('should handle null/undefined background configuration gracefully', async () => {
      // Act
      const backgrounds1 = await sceneFactory.createBackgroundsFromConfig(null);
      const backgrounds2 = await sceneFactory.createBackgroundsFromConfig(undefined);

      // Assert
      expect(backgrounds1.length).toBe(0);
      expect(backgrounds2.length).toBe(0);
      expect(mockScene.add.tileSprite).not.toHaveBeenCalled();
    });

    test('should validate background configuration and skip invalid entries', async () => {
      // Arrange
      const backgroundConfigs = [
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
          // Invalid: missing required fields
          type: 'layer',
          x: 640,
          y: 360
          // Missing width, height, spriteKey, depth
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
      ];

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
      const backgrounds = await sceneFactory.createBackgroundsFromConfig(backgroundConfigs);

      // Assert
      expect(backgrounds.length).toBe(2); // Only valid configs processed
      expect(mockScene.add.tileSprite).toHaveBeenCalledTimes(2);
    });

    test('should handle invalid sprite keys gracefully', async () => {
      // Arrange
      const backgroundConfigs = [{
        type: 'layer',
        x: 640,
        y: 360,
        width: 1280,
        height: 720,
        spriteKey: 'invalid_sprite_key',
        depth: -2,
        scrollSpeed: 0.0
      }];

      // Mock scene.add.tileSprite to return null for invalid sprite keys
      mockScene.add.tileSprite.mockReturnValue(null);

      // Act
      const backgrounds = await sceneFactory.createBackgroundsFromConfig(backgroundConfigs);

      // Assert
      expect(backgrounds.length).toBe(0); // Invalid sprite key should be skipped
      expect(mockScene.add.tileSprite).not.toHaveBeenCalled();
    });

    test('should default scrollSpeed to 0.0 when not specified', async () => {
      // Arrange
      const backgroundConfigs = [{
        type: 'layer',
        x: 640,
        y: 360,
        width: 1280,
        height: 720,
        spriteKey: 'background_solid_sky',
        depth: -2
        // scrollSpeed not specified
      }];

      const mockBackground = {
        setDepth: jest.fn(),
        setData: jest.fn(),
        tilePositionX: 0,
        tilePositionY: 0
      };
      mockScene.add.tileSprite.mockReturnValue(mockBackground);

      // Act
      const backgrounds = await sceneFactory.createBackgroundsFromConfig(backgroundConfigs);

      // Assert
      expect(backgrounds[0].setData).toHaveBeenCalledWith('scrollSpeed', 0.0);
    });

    test('should validate depth is negative for background layers', async () => {
      // Arrange
      const backgroundConfigs = [
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
        },
        {
          type: 'layer',
          x: 640,
          y: 360,
          width: 1280,
          height: 720,
          spriteKey: 'background_color_trees',
          depth: -3, // Valid negative depth
          scrollSpeed: 0.3
        }
      ];

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
      const backgrounds = await sceneFactory.createBackgroundsFromConfig(backgroundConfigs);

      // Assert
      expect(backgrounds.length).toBe(2); // Only valid negative depth configs processed (depth -1 and -3)
      expect(mockScene.add.tileSprite).toHaveBeenCalledTimes(2);
      expect(backgrounds[0].setDepth).toHaveBeenCalledWith(-1);
    });

    test('should validate scrollSpeed is between 0.0 and 1.0', async () => {
      // Arrange
      const backgroundConfigs = [
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
      ];

      const mockBackground = {
        setDepth: jest.fn(),
        setData: jest.fn(),
        tilePositionX: 0,
        tilePositionY: 0
      };
      mockScene.add.tileSprite.mockReturnValue(mockBackground);

      // Act
      const backgrounds = await sceneFactory.createBackgroundsFromConfig(backgroundConfigs);

      // Assert
      expect(backgrounds.length).toBe(1); // Only valid scrollSpeed config processed
      expect(backgrounds[0].setData).toHaveBeenCalledWith('scrollSpeed', 0.5);
    });
  });
}); 