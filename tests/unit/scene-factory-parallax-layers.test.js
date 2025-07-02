import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('SceneFactory Parallax Layers', () => {
  let mockScene;
  let sceneFactory;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    
    // Create proper Jest spies for the methods we want to test
    jest.spyOn(mockScene.add, 'tileSprite').mockReturnValue({
      setDepth: jest.fn().mockReturnThis(),
      setData: jest.fn().mockReturnThis(),
      x: 0,
      y: 0,
      tilePositionX: 0,
      tilePositionY: 0
    });
    
    sceneFactory = new SceneFactory(mockScene);
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Multiple Parallax Layers with Different Scroll Speeds', () => {
    test('should create multiple parallax layers with different scroll speeds', () => {
      // Arrange - Multiple background layers with different scroll speeds
      const backgroundConfigs = [
        {
          type: 'layer',
          x: 3200,
          y: 1800,
          width: 6400,
          height: 3600,
          spriteKey: 'background_solid_sky',
          depth: -3,
          scrollSpeed: 0.0
        },
        {
          type: 'layer',
          x: 3200,
          y: 1800,
          width: 6400,
          height: 3600,
          spriteKey: 'background_clouds',
          depth: -2,
          scrollSpeed: 0.2
        },
        {
          type: 'layer',
          x: 3200,
          y: 1800,
          width: 6400,
          height: 3600,
          spriteKey: 'background_color_hills',
          depth: -1,
          scrollSpeed: 0.5
        }
      ];

      // Act
      const backgrounds = sceneFactory.createBackgroundsFromConfig(backgroundConfigs);

      // Assert
      expect(backgrounds).toBeDefined();
      expect(backgrounds.length).toBe(3);
      
      // Verify each background was created with correct parameters
      expect(mockScene.add.tileSprite).toHaveBeenCalledTimes(3);
      
      // Sky background (static)
      expect(mockScene.add.tileSprite).toHaveBeenNthCalledWith(1, 3200, 1800, 6400, 3600, 'backgrounds', 'background_solid_sky');
      expect(backgrounds[0].setDepth).toHaveBeenCalledWith(-3);
      expect(backgrounds[0].setData).toHaveBeenCalledWith('scrollSpeed', 0.0);
      
      // Clouds background (slow parallax)
      expect(mockScene.add.tileSprite).toHaveBeenNthCalledWith(2, 3200, 1800, 6400, 3600, 'backgrounds', 'background_clouds');
      expect(backgrounds[1].setDepth).toHaveBeenCalledWith(-2);
      expect(backgrounds[1].setData).toHaveBeenCalledWith('scrollSpeed', 0.2);
      
      // Hills background (medium parallax)
      expect(mockScene.add.tileSprite).toHaveBeenNthCalledWith(3, 3200, 1800, 6400, 3600, 'backgrounds', 'background_color_hills');
      expect(backgrounds[2].setDepth).toHaveBeenCalledWith(-1);
      expect(backgrounds[2].setData).toHaveBeenCalledWith('scrollSpeed', 0.5);
    });

    test('should handle layers without scrollSpeed configuration', () => {
      // Arrange - Background layer without scrollSpeed (should default to 0.0)
      const backgroundConfigs = [
        {
          type: 'layer',
          x: 3200,
          y: 1800,
          width: 6400,
          height: 3600,
          spriteKey: 'background_solid_sky',
          depth: -2
          // scrollSpeed omitted
        }
      ];

      // Act
      const backgrounds = sceneFactory.createBackgroundsFromConfig(backgroundConfigs);

      // Assert
      expect(backgrounds.length).toBe(1);
      expect(backgrounds[0].setData).toHaveBeenCalledWith('scrollSpeed', 0.0);
    });

    test('should validate scrollSpeed values are within valid range (0.0-1.0)', () => {
      // Arrange - Background layers with various scroll speeds
      const backgroundConfigs = [
        {
          type: 'layer',
          x: 3200,
          y: 1800,
          width: 6400,
          height: 3600,
          spriteKey: 'background_solid_sky',
          depth: -2,
          scrollSpeed: 0.0 // Valid
        },
        {
          type: 'layer',
          x: 3200,
          y: 1800,
          width: 6400,
          height: 3600,
          spriteKey: 'background_color_hills',
          depth: -1,
          scrollSpeed: 0.5 // Valid
        },
        {
          type: 'layer',
          x: 3200,
          y: 1800,
          width: 6400,
          height: 3600,
          spriteKey: 'background_clouds',
          depth: -1,
          scrollSpeed: 1.0 // Valid
        },
        {
          type: 'layer',
          x: 3200,
          y: 1800,
          width: 6400,
          height: 3600,
          spriteKey: 'background_solid_sky',
          depth: -2,
          scrollSpeed: 1.5 // Invalid - should be rejected
        }
      ];

      // Act
      const backgrounds = sceneFactory.createBackgroundsFromConfig(backgroundConfigs);

      // Assert - Only valid backgrounds should be created
      expect(backgrounds.length).toBe(3); // 4th one should be rejected
      expect(mockScene.add.tileSprite).toHaveBeenCalledTimes(3);
    });
  });

  describe('Layer Depth Ordering with Parallax Support', () => {
    test('should maintain correct depth ordering for multiple parallax layers', () => {
      // Arrange - Multiple layers with different depths
      const backgroundConfigs = [
        {
          type: 'layer',
          x: 3200,
          y: 1800,
          width: 6400,
          height: 3600,
          spriteKey: 'background_solid_sky',
          depth: -3,
          scrollSpeed: 0.0
        },
        {
          type: 'layer',
          x: 3200,
          y: 1800,
          width: 6400,
          height: 3600,
          spriteKey: 'background_clouds',
          depth: -2,
          scrollSpeed: 0.2
        },
        {
          type: 'layer',
          x: 3200,
          y: 1800,
          width: 6400,
          height: 3600,
          spriteKey: 'background_color_hills',
          depth: -1,
          scrollSpeed: 0.5
        }
      ];

      // Act
      const backgrounds = sceneFactory.createBackgroundsFromConfig(backgroundConfigs);

      // Assert - Verify depth ordering (lower numbers = further back)
      expect(backgrounds[0].setDepth).toHaveBeenCalledWith(-3); // Furthest back
      expect(backgrounds[1].setDepth).toHaveBeenCalledWith(-2); // Middle
      expect(backgrounds[2].setDepth).toHaveBeenCalledWith(-1); // Closest to gameplay
    });

    test('should reject layers with positive depth values', () => {
      // Arrange - Background layer with positive depth (invalid for backgrounds)
      const backgroundConfigs = [
        {
          type: 'layer',
          x: 3200,
          y: 1800,
          width: 6400,
          height: 3600,
          spriteKey: 'background_solid_sky',
          depth: 1, // Invalid - should be negative
          scrollSpeed: 0.0
        }
      ];

      // Act
      const backgrounds = sceneFactory.createBackgroundsFromConfig(backgroundConfigs);

      // Assert - Invalid background should be rejected
      expect(backgrounds.length).toBe(0);
      expect(mockScene.add.tileSprite).not.toHaveBeenCalled();
    });
  });

  describe('Performance Validation with Multiple Parallax Layers', () => {
    test('should handle large number of parallax layers efficiently', () => {
      // Arrange - Create many background layers to test performance
      const backgroundConfigs = [];
      for (let i = 0; i < 10; i++) {
        backgroundConfigs.push({
          type: 'layer',
          x: 3200,
          y: 1800,
          width: 6400,
          height: 3600,
          spriteKey: 'background_solid_sky',
          depth: -10 + i,
          scrollSpeed: i * 0.1
        });
      }

      // Act
      const startTime = performance.now();
      const backgrounds = sceneFactory.createBackgroundsFromConfig(backgroundConfigs);
      const endTime = performance.now();

      // Assert
      expect(backgrounds.length).toBe(10);
      
      // Performance check - should complete quickly (less than 50ms)
      const creationTime = endTime - startTime;
      expect(creationTime).toBeLessThan(50);
    });

    test('should validate background dimensions span full level', () => {
      // Arrange - Background layers that should span the full level
      const backgroundConfigs = [
        {
          type: 'layer',
          x: 3200, // Center of 6400 width level
          y: 1800, // Center of 3600 height level
          width: 6400, // Full level width
          height: 3600, // Full level height
          spriteKey: 'background_solid_sky',
          depth: -2,
          scrollSpeed: 0.0
        }
      ];

      // Act
      const backgrounds = sceneFactory.createBackgroundsFromConfig(backgroundConfigs);

      // Assert
      expect(backgrounds.length).toBe(1);
      expect(mockScene.add.tileSprite).toHaveBeenCalledWith(3200, 1800, 6400, 3600, 'backgrounds', 'background_solid_sky');
    });
  });

  describe('Background Configuration Validation', () => {
    test('should validate required fields for parallax layers', () => {
      // Arrange - Invalid configurations
      const invalidConfigs = [
        {
          // Missing type
          x: 3200,
          y: 1800,
          width: 6400,
          height: 3600,
          spriteKey: 'background_solid_sky',
          depth: -2,
          scrollSpeed: 0.0
        },
        {
          type: 'layer',
          // Missing x, y
          width: 6400,
          height: 3600,
          spriteKey: 'background_solid_sky',
          depth: -2,
          scrollSpeed: 0.0
        },
        {
          type: 'layer',
          x: 3200,
          y: 1800,
          // Missing width, height
          spriteKey: 'background_solid_sky',
          depth: -2,
          scrollSpeed: 0.0
        }
      ];

      // Act & Assert
      invalidConfigs.forEach((config, index) => {
        const backgrounds = sceneFactory.createBackgroundsFromConfig([config]);
        expect(backgrounds.length).toBe(0, `Config ${index} should be rejected`);
      });
    });

    test('should handle empty or null background configurations', () => {
      // Act & Assert
      expect(sceneFactory.createBackgroundsFromConfig([])).toEqual([]);
      expect(sceneFactory.createBackgroundsFromConfig(null)).toEqual([]);
      expect(sceneFactory.createBackgroundsFromConfig(undefined)).toEqual([]);
    });
  });
}); 