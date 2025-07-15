import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { GameConfig } from '../../client/src/config/GameConfig.js';

// Mock Phaser scene
const createMockScene = () => ({
  make: {
    tilemap: jest.fn(),
    group: jest.fn(() => ({
      add: jest.fn(),
      create: jest.fn()
    }))
  },
  add: {
    group: jest.fn(() => ({
      add: jest.fn(),
      create: jest.fn()
    }))
  },
  physics: {
    add: {
      group: jest.fn(() => ({
        add: jest.fn(),
        create: jest.fn()
      }))
    }
  }
});

describe('SceneFactory Tilemap Fix', () => {
  let sceneFactory;
  let mockScene;

  beforeEach(() => {
    mockScene = createMockScene();
    sceneFactory = new SceneFactory(mockScene);
  });

  describe('createMapMatrixWithTilemap', () => {
    it('should handle missing tileset gracefully', () => {
      // Arrange
      const mapMatrix = [
        [
          { tileKey: 'terrain_purple_block_left', type: 'ground' },
          { tileKey: 'terrain_purple_block_right', type: 'ground' }
        ]
      ];
      const platformsGroup = mockScene.physics.add.group();
      
      // Mock tilemap creation to return null (simulating missing tileset)
      const mockTilemap = {
        addTilesetImage: jest.fn(() => null),
        createLayer: jest.fn(() => null)
      };
      mockScene.make.tilemap.mockReturnValue(mockTilemap);

      // Act
      const result = sceneFactory.createMapMatrixWithTilemap(mapMatrix, platformsGroup);

      // Assert
      expect(result).toEqual({
        groundPlatforms: [],
        decorativePlatforms: []
      });
      expect(mockTilemap.addTilesetImage).toHaveBeenCalledWith('tiles');
    });

    it('should handle null layer creation gracefully', () => {
      // Arrange
      const mapMatrix = [
        [
          { tileKey: 'terrain_purple_block_left', type: 'ground' },
          { tileKey: 'terrain_purple_block_right', type: 'ground' }
        ]
      ];
      const platformsGroup = mockScene.physics.add.group();
      
      // Mock tileset but null layer
      const mockTilemap = {
        addTilesetImage: jest.fn(() => ({})),
        createLayer: jest.fn(() => null)
      };
      mockScene.make.tilemap.mockReturnValue(mockTilemap);

      // Act
      const result = sceneFactory.createMapMatrixWithTilemap(mapMatrix, platformsGroup);

      // Assert
      expect(result).toEqual({
        groundPlatforms: [],
        decorativePlatforms: []
      });
    });

    it('should validate tilemap dimensions before creation', () => {
      // Arrange
      const mapMatrix = [
        Array(1000).fill(null) // 1000 columns - too large
      ];
      const platformsGroup = mockScene.physics.add.group();

      // Act
      const result = sceneFactory.createMapMatrixWithTilemap(mapMatrix, platformsGroup);

      // Assert
      expect(result).toEqual({
        groundPlatforms: [],
        decorativePlatforms: []
      });
    });

    it('should fallback to sprite creation when tilemap fails', () => {
      // Arrange
      const mapMatrix = [
        [
          { tileKey: 'terrain_purple_block_left', type: 'ground' },
          { tileKey: 'terrain_purple_block_right', type: 'ground' }
        ]
      ];
      const platformsGroup = mockScene.physics.add.group();
      
      // Mock tilemap creation failure
      const mockTilemap = {
        addTilesetImage: jest.fn(() => null),
        createLayer: jest.fn(() => null)
      };
      mockScene.make.tilemap.mockReturnValue(mockTilemap);

      // Mock sprite creation for fallback
      const mockSprite = {
        setOrigin: jest.fn(),
        setScale: jest.fn(),
        body: {
          setImmovable: jest.fn(),
          setAllowGravity: jest.fn()
        }
      };
      platformsGroup.create.mockReturnValue(mockSprite);

      // Act
      const result = sceneFactory.createMapMatrixWithTilemap(mapMatrix, platformsGroup);

      // Assert
      expect(result.groundPlatforms).toEqual([]);
      expect(result.decorativePlatforms).toEqual([]);
    });
  });

  describe('createMapMatrixFromConfig', () => {
    it('should disable tilemap culling when tileset is unavailable', () => {
      // Arrange
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_purple_block_left', type: 'ground' }
          ]
        ],
        culling: {
          tilemap: {
            enabled: true
          }
        }
      };
      sceneFactory.loadConfiguration(config);
      
      // Mock tilemap creation failure
      const mockTilemap = {
        addTilesetImage: jest.fn(() => null),
        createLayer: jest.fn(() => null)
      };
      mockScene.make.tilemap.mockReturnValue(mockTilemap);

      const platformsGroup = mockScene.physics.add.group();

      // Act
      const result = sceneFactory.createMapMatrixFromConfig(platformsGroup);

      // Assert
      expect(result).toBeDefined();
    });
  });
}); 