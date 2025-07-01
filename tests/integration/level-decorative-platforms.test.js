import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import testLevelConfig from '../../client/src/config/test-level.json' with { type: 'json' };
import adventureLevelConfig from '../../client/src/config/adventure-level.json' with { type: 'json' };

describe('Level Decorative Platforms Integration', () => {
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

  describe('test-level.json decorative platforms', () => {
    test('should load test-level.json with decorative platform configuration', () => {
      // Act
      const result = sceneFactory.loadConfiguration(testLevelConfig);

      // Assert
      expect(result).toBe(true);
      expect(sceneFactory.config.decorativePlatforms).toBeDefined();
      expect(Array.isArray(sceneFactory.config.decorativePlatforms)).toBe(true);
    });

    test('should validate decorative tile prefixes match available asset keys', () => {
      // Arrange
      const validTilePrefixes = [
        'terrain_grass_block', 'terrain_dirt_block', 'terrain_stone_block', 
        'terrain_sand_block', 'terrain_snow_block', 'terrain_purple_block',
        'bush', 'cactus', 'mushroom_brown', 'mushroom_red', 'rock', 'hill', 'hill_top',
        'brick_brown', 'brick_grey', 'bricks_brown', 'bricks_grey', 'bridge', 'bridge_logs',
        'grass', 'grass_purple', 'snow', 'water', 'water_top', 'lava', 'lava_top'
      ];

      // Act
      const result = sceneFactory.loadConfiguration(testLevelConfig);

      // Assert
      expect(result).toBe(true);
      if (sceneFactory.config.decorativePlatforms) {
        for (const decorative of sceneFactory.config.decorativePlatforms) {
          expect(validTilePrefixes).toContain(decorative.tilePrefix);
        }
      }
    });

    test('should ensure decorative platforms have negative depth values', () => {
      // Act
      const result = sceneFactory.loadConfiguration(testLevelConfig);

      // Assert
      expect(result).toBe(true);
      if (sceneFactory.config.decorativePlatforms) {
        for (const decorative of sceneFactory.config.decorativePlatforms) {
          expect(decorative.depth).toBeLessThan(0);
        }
      }
    });

    test('should create decorative platforms from test-level.json configuration', () => {
      // Arrange
      sceneFactory.loadConfiguration(testLevelConfig);

      // Act
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig(
        sceneFactory.config.decorativePlatforms
      );

      // Assert
      expect(decoratives.length).toBeGreaterThan(0);
      expect(mockScene.add.image).toHaveBeenCalled();
    });

    test('should include both single-tile and multi-tile decorative examples', () => {
      // Act
      const result = sceneFactory.loadConfiguration(testLevelConfig);

      // Assert
      expect(result).toBe(true);
      if (sceneFactory.config.decorativePlatforms) {
        const hasSingleTile = sceneFactory.config.decorativePlatforms.some(
          d => !d.width || d.width <= 64
        );
        const hasMultiTile = sceneFactory.config.decorativePlatforms.some(
          d => d.width && d.width > 64
        );
        expect(hasSingleTile).toBe(true);
        expect(hasMultiTile).toBe(true);
      }
    });

    test('should showcase tile variety with different themes', () => {
      // Act
      const result = sceneFactory.loadConfiguration(testLevelConfig);

      // Assert
      expect(result).toBe(true);
      if (sceneFactory.config.decorativePlatforms) {
        const tilePrefixes = sceneFactory.config.decorativePlatforms.map(d => d.tilePrefix);
        const uniquePrefixes = [...new Set(tilePrefixes)];
        expect(uniquePrefixes.length).toBeGreaterThan(1); // Should have variety
      }
    });
  });

  describe('adventure-level.json decorative platforms', () => {
    test('should load adventure-level.json with decorative platform configuration', () => {
      // Act
      const result = sceneFactory.loadConfiguration(adventureLevelConfig);

      // Assert
      expect(result).toBe(true);
      expect(sceneFactory.config.decorativePlatforms).toBeDefined();
      expect(Array.isArray(sceneFactory.config.decorativePlatforms)).toBe(true);
    });

    test('should create themed decorative elements for adventure level', () => {
      // Arrange
      sceneFactory.loadConfiguration(adventureLevelConfig);

      // Act
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig(
        sceneFactory.config.decorativePlatforms
      );

      // Assert
      expect(decoratives.length).toBeGreaterThan(0);
      expect(mockScene.add.image).toHaveBeenCalled();
    });
  });

  describe('visual hierarchy and collision detection', () => {
    test('should ensure decorative platforms render behind gameplay elements', () => {
      // Arrange
      sceneFactory.loadConfiguration(testLevelConfig);

      // Act
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig(
        sceneFactory.config.decorativePlatforms
      );

      // Assert
      expect(decoratives.length).toBeGreaterThan(0);
      // Verify depth setting was called for each decorative platform
      expect(mockScene.add.image).toHaveBeenCalled();
      const mockImage = mockScene.add.image.mock.results[0].value;
      expect(mockImage.setDepth).toHaveBeenCalled();
    });

    test('should maintain visual hierarchy with gameplay elements clearly visible', () => {
      // Arrange
      sceneFactory.loadConfiguration(testLevelConfig);

      // Act
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig(
        sceneFactory.config.decorativePlatforms
      );

      // Assert
      expect(decoratives.length).toBeGreaterThan(0);
      // All decorative platforms should have negative depth (behind gameplay)
      decoratives.forEach((decorative, i) => {
        // Check that setDepth was called with a negative value
        expect(decorative.setDepth).toHaveBeenCalled();
        const depthArg = decorative.setDepth.mock.calls[0][0];
        expect(depthArg).toBeLessThan(0);
      });
    });

    test('should not create physics bodies for decorative platforms', () => {
      // Arrange
      // Ensure physics add methods are Jest mocks
      mockScene.physics.add.sprite = jest.fn();
      mockScene.physics.add.staticSprite = jest.fn();
      sceneFactory.loadConfiguration(testLevelConfig);

      // Act
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig(
        sceneFactory.config.decorativePlatforms
      );

      // Assert
      expect(decoratives.length).toBeGreaterThan(0);
      // Verify that no physics body methods were called
      expect(mockScene.physics.add.sprite).not.toHaveBeenCalled();
      expect(mockScene.physics.add.staticSprite).not.toHaveBeenCalled();
    });
  });

  describe('level loading integration', () => {
    test('should load complete level configuration including decorative platforms', () => {
      // Act
      const result = sceneFactory.loadConfiguration(testLevelConfig);

      // Assert
      expect(result).toBe(true);
      expect(sceneFactory.config.platforms).toBeDefined();
      expect(sceneFactory.config.coins).toBeDefined();
      expect(sceneFactory.config.enemies).toBeDefined();
      expect(sceneFactory.config.backgrounds).toBeDefined();
      expect(sceneFactory.config.decorativePlatforms).toBeDefined();
    });

    test('should handle level config without decorative platforms gracefully', () => {
      // Arrange
      const levelConfigWithoutDecoratives = {
        platforms: [],
        coins: [],
        enemies: []
      };

      // Act
      const result = sceneFactory.loadConfiguration(levelConfigWithoutDecoratives);

      // Assert
      expect(result).toBe(true);
      expect(sceneFactory.config.decorativePlatforms).toBeUndefined();
    });

    test('should validate decorative platform schema during loading', () => {
      // Arrange
      const invalidLevelConfig = {
        platforms: [],
        decorativePlatforms: [
          {
            type: 'decorative',
            x: 100,
            y: 200
            // Missing required fields: tilePrefix, depth
          }
        ]
      };

      // Act
      const result = sceneFactory.loadConfiguration(invalidLevelConfig);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('performance and memory', () => {
    test('should handle multiple decorative platforms efficiently', () => {
      // Arrange
      const levelWithManyDecoratives = {
        platforms: [],
        decorativePlatforms: Array.from({ length: 50 }, (_, i) => ({
          type: 'decorative',
          x: i * 100,
          y: 200,
          tilePrefix: 'terrain_grass_block',
          depth: -0.5
        }))
      };

      // Act
      const result = sceneFactory.loadConfiguration(levelWithManyDecoratives);
      const decoratives = sceneFactory.createDecorativePlatformsFromConfig(
        levelWithManyDecoratives.decorativePlatforms
      );

      // Assert
      expect(result).toBe(true);
      expect(decoratives.length).toBe(50);
      expect(mockScene.add.image).toHaveBeenCalledTimes(50);
    });
  });
}); 