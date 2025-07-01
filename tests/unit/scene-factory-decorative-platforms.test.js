import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('SceneFactory Decorative Platform Creation', () => {
  let sceneFactory;
  let mockScene;

  beforeEach(() => {
    // Create a proper mock scene with all required methods
    mockScene = {
      add: {
        image: jest.fn()
      }
    };

    sceneFactory = new SceneFactory(mockScene);
  });

  describe('createDecorativePlatformsFromConfig', () => {
    test('should create single decorative tile with valid configuration', () => {
      // Arrange
      const decorativeConfigs = [{
        type: 'decorative',
        x: 100,
        y: 200,
        tilePrefix: 'terrain_grass_block',
        depth: -0.5
      }];

      // Create a proper mock decorative platform object
      const mockDecorative = {
        setDepth: jest.fn(),
        setOrigin: jest.fn()
      };
      mockScene.add.image.mockReturnValue(mockDecorative);

      // Act
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig(decorativeConfigs);

      // Assert
      expect(decoratives.length).toBe(1);
      expect(mockScene.add.image).toHaveBeenCalledWith(100, 200, 'tiles', 'terrain_grass_block');
      expect(mockDecorative.setDepth).toHaveBeenCalledWith(-0.5);
      expect(mockDecorative.setOrigin).toHaveBeenCalledWith(0, 0);
    });

    test('should create multi-tile decorative platform with correct tile selection', () => {
      // Arrange
      const decorativeConfigs = [{
        type: 'decorative',
        x: 100,
        y: 200,
        width: 192, // 3 tiles × 64px
        tilePrefix: 'terrain_grass_block',
        depth: -0.5
      }];

      // Create mock decorative platform objects
      const mockLeft = { setDepth: jest.fn(), setOrigin: jest.fn() };
      const mockCenter = { setDepth: jest.fn(), setOrigin: jest.fn() };
      const mockRight = { setDepth: jest.fn(), setOrigin: jest.fn() };
      
      mockScene.add.image
        .mockReturnValueOnce(mockLeft)
        .mockReturnValueOnce(mockCenter)
        .mockReturnValueOnce(mockRight);

      // Act
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig(decorativeConfigs);

      // Assert
      expect(decoratives.length).toBe(3);
      
      // Check tile selection and positioning
      expect(mockScene.add.image).toHaveBeenNthCalledWith(1, 100, 200, 'tiles', 'terrain_grass_block_left');
      expect(mockScene.add.image).toHaveBeenNthCalledWith(2, 164, 200, 'tiles', 'terrain_grass_block_center');
      expect(mockScene.add.image).toHaveBeenNthCalledWith(3, 228, 200, 'tiles', 'terrain_grass_block_right');
      
      // Check depth setting for all tiles
      expect(mockLeft.setDepth).toHaveBeenCalledWith(-0.5);
      expect(mockCenter.setDepth).toHaveBeenCalledWith(-0.5);
      expect(mockRight.setDepth).toHaveBeenCalledWith(-0.5);
    });

    test('should create two-tile decorative platform correctly', () => {
      // Arrange
      const decorativeConfigs = [{
        type: 'decorative',
        x: 100,
        y: 200,
        width: 128, // 2 tiles × 64px
        tilePrefix: 'terrain_grass_block',
        depth: -0.3
      }];

      // Create mock decorative platform objects
      const mockLeft = { setDepth: jest.fn(), setOrigin: jest.fn() };
      const mockRight = { setDepth: jest.fn(), setOrigin: jest.fn() };
      
      mockScene.add.image
        .mockReturnValueOnce(mockLeft)
        .mockReturnValueOnce(mockRight);

      // Act
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig(decorativeConfigs);

      // Assert
      expect(decoratives.length).toBe(2);
      
      // Check tile selection and positioning
      expect(mockScene.add.image).toHaveBeenNthCalledWith(1, 100, 200, 'tiles', 'terrain_grass_block_left');
      expect(mockScene.add.image).toHaveBeenNthCalledWith(2, 164, 200, 'tiles', 'terrain_grass_block_right');
      
      // Check depth setting
      expect(mockLeft.setDepth).toHaveBeenCalledWith(-0.3);
      expect(mockRight.setDepth).toHaveBeenCalledWith(-0.3);
    });

    test('should handle decorative element with non-block tile prefix', () => {
      // Arrange
      const decorativeConfigs = [{
        type: 'decorative',
        x: 300,
        y: 150,
        tilePrefix: 'bush',
        depth: -0.3
      }];

      const mockDecorative = {
        setDepth: jest.fn(),
        setOrigin: jest.fn()
      };
      mockScene.add.image.mockReturnValue(mockDecorative);

      // Act
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig(decorativeConfigs);

      // Assert
      expect(decoratives.length).toBe(1);
      expect(mockScene.add.image).toHaveBeenCalledWith(300, 150, 'tiles', 'bush');
      expect(mockDecorative.setDepth).toHaveBeenCalledWith(-0.3);
    });

    test('should handle empty decorative configuration gracefully', () => {
      // Act
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig([]);

      // Assert
      expect(decoratives.length).toBe(0);
      expect(mockScene.add.image).not.toHaveBeenCalled();
    });

    test('should handle null/undefined decorative configuration gracefully', () => {
      // Act
      const decoratives1 = sceneFactory.createDecorativePlatformsFromConfig(null);
      const decoratives2 = sceneFactory.createDecorativePlatformsFromConfig(undefined);

      // Assert
      expect(decoratives1.length).toBe(0);
      expect(decoratives2.length).toBe(0);
      expect(mockScene.add.image).not.toHaveBeenCalled();
    });

    test('should validate decorative configuration and skip invalid entries', () => {
      // Arrange
      const decorativeConfigs = [
        {
          type: 'decorative',
          x: 100,
          y: 200,
          tilePrefix: 'terrain_grass_block',
          depth: -0.5
        },
        {
          // Invalid: missing required fields
          type: 'decorative',
          x: 100,
          y: 200
          // Missing tilePrefix and depth
        },
        {
          type: 'decorative',
          x: 300,
          y: 150,
          tilePrefix: 'bush',
          depth: -0.3
        }
      ];

      const mockDecorative1 = { setDepth: jest.fn(), setOrigin: jest.fn() };
      const mockDecorative2 = { setDepth: jest.fn(), setOrigin: jest.fn() };
      
      mockScene.add.image
        .mockReturnValueOnce(mockDecorative1)
        .mockReturnValueOnce(mockDecorative2);

      // Act
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig(decorativeConfigs);

      // Assert
      expect(decoratives.length).toBe(2);
      
      // Check that only valid configurations were processed
      expect(mockScene.add.image).toHaveBeenCalledTimes(2);
      expect(mockScene.add.image).toHaveBeenNthCalledWith(1, 100, 200, 'tiles', 'terrain_grass_block');
      expect(mockScene.add.image).toHaveBeenNthCalledWith(2, 300, 150, 'tiles', 'bush');
    });

    test('should handle invalid depth values (non-negative)', () => {
      // Arrange
      const decorativeConfigs = [{
        type: 'decorative',
        x: 100,
        y: 200,
        tilePrefix: 'terrain_grass_block',
        depth: 0.5 // Invalid: should be negative
      }];

      // Act
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig(decorativeConfigs);

      // Assert
      expect(decoratives.length).toBe(0);
      expect(mockScene.add.image).not.toHaveBeenCalled();
    });

    test('should handle invalid width values', () => {
      // Arrange
      const decorativeConfigs = [{
        type: 'decorative',
        x: 100,
        y: 200,
        width: -64, // Invalid: negative width
        tilePrefix: 'terrain_grass_block',
        depth: -0.5
      }];

      // Act
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig(decorativeConfigs);

      // Assert
      expect(decoratives.length).toBe(0);
      expect(mockScene.add.image).not.toHaveBeenCalled();
    });

    test('should handle missing scene or add.image method gracefully', () => {
      // Arrange
      const decorativeConfigs = [{
        type: 'decorative',
        x: 100,
        y: 200,
        tilePrefix: 'terrain_grass_block',
        depth: -0.5
      }];

      // Create scene factory without proper scene mock
      const invalidSceneFactory = new SceneFactory(null);

      // Act
      const decoratives = invalidSceneFactory.createDecorativePlatformsFromConfig(decorativeConfigs);

      // Assert
      expect(decoratives.length).toBe(0);
    });

    test('should handle scene without add.image method gracefully', () => {
      // Arrange
      const decorativeConfigs = [{
        type: 'decorative',
        x: 100,
        y: 200,
        tilePrefix: 'terrain_grass_block',
        depth: -0.5
      }];

      const invalidScene = { add: {} }; // Missing add.image method
      const invalidSceneFactory = new SceneFactory(invalidScene);

      // Act
      const decoratives = invalidSceneFactory.createDecorativePlatformsFromConfig(decorativeConfigs);

      // Assert
      expect(decoratives.length).toBe(0);
    });
  });
}); 