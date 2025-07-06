import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import { TileSelector } from '../../client/src/systems/TileSelector.js';

describe('SceneFactory Map Matrix Parsing', () => {
  let sceneMock;
  let sceneFactory;
  let mockPlatformsGroup;

  beforeEach(() => {
    sceneMock = createPhaserSceneMock();
    
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
      add: jest.fn(),
      getChildren: jest.fn(() => [])
    };

    // Mock the physics.add.group to return our mock groups
    sceneMock.physics.add.group = jest.fn(() => mockPlatformsGroup);
    
    sceneFactory = new SceneFactory(sceneMock);

    // Mock createGroundPlatform to return a mock platform object
    sceneFactory.createGroundPlatform = jest.fn((config, group) => ({
      x: config.x,
      y: config.y,
      width: config.width,
      frame: config.tilePrefix,
      type: 'ground',
    }));
    // Mock createDecorativePlatform to return a mock platform object
    sceneFactory.createDecorativePlatform = jest.fn((config) => ({
      x: config.x,
      y: config.y,
      frame: config.tilePrefix,
      type: 'decorative',
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMapMatrixFromConfig', () => {
    it('should parse 2x2 matrix with ground and decorative tiles', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ],
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'rock', type: 'decorative' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      expect(result).toBeDefined();
      expect(result.groundPlatforms).toHaveLength(2);
      expect(result.decorativePlatforms).toHaveLength(2);
    });

    it('should convert matrix coordinates to world positions correctly', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      // Check ground platform position: matrix[0][0] → world (0, 0)
      expect(result.groundPlatforms[0].x).toBe(0);
      expect(result.groundPlatforms[0].y).toBe(0);

      // Check decorative platform position: matrix[0][1] → world (64, 0)
      expect(result.decorativePlatforms[0].x).toBe(64);
      expect(result.decorativePlatforms[0].y).toBe(0);
    });

    it('should handle empty matrix', () => {
      const config = {
        map_matrix: []
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      expect(result).toBeNull();
    });

    it('should handle matrix with only ground tiles', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'terrain_grass_block', type: 'ground' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      // Should create one multi-tile platform with width 128
      expect(result.groundPlatforms).toHaveLength(1);
      expect(result.groundPlatforms[0].width).toBe(128);
      expect(result.groundPlatforms[0].x).toBe(0);
      expect(result.groundPlatforms[0].y).toBe(0);
      expect(result.decorativePlatforms).toHaveLength(0);
    });

    it('should handle matrix with only decorative tiles', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'bush', type: 'decorative' },
            { tileKey: 'rock', type: 'decorative' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      expect(result.groundPlatforms).toHaveLength(0);
      expect(result.decorativePlatforms).toHaveLength(2);
    });

    it('should create ground platforms with correct tileKey', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      expect(result.groundPlatforms[0].frame).toBe('terrain_grass_block');
    });

    it('should create decorative platforms with correct tileKey', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      expect(result.decorativePlatforms[0].frame).toBe('bush');
    });

    it('should handle large matrix with multiple rows and columns', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ],
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'rock', type: 'decorative' },
            { tileKey: 'cactus', type: 'decorative' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      // Should create one multi-tile platform for the first row, one single-tile for the second row
      expect(result.groundPlatforms).toHaveLength(2);
      expect(result.groundPlatforms[0].width).toBe(128); // first row: 2 ground tiles
      expect(result.groundPlatforms[0].x).toBe(0);
      expect(result.groundPlatforms[0].y).toBe(0);
      expect(result.groundPlatforms[1].width).toBe(64); // second row: 1 ground tile
      expect(result.groundPlatforms[1].x).toBe(0);
      expect(result.groundPlatforms[1].y).toBe(64);
      expect(result.decorativePlatforms).toHaveLength(3);
      // matrix[0][2] → (128, 0) - decorative
      expect(result.decorativePlatforms[0].x).toBe(128);
      expect(result.decorativePlatforms[0].y).toBe(0);
    });

    it('should return null when no map_matrix in configuration', () => {
      const config = {};

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      expect(result).toBeNull();
    });

    it('should return null when map_matrix is empty', () => {
      const config = {
        map_matrix: []
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      expect(result).toBeNull();
    });
  });

  describe('Tile Selection with TileSelector', () => {
    it('should use TileSelector.getTileKey for ground platform tile selection', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' }
          ]
        ]
      };

      // Mock TileSelector.getTileKey
      const originalGetTileKey = TileSelector.getTileKey;
      TileSelector.getTileKey = jest.fn((tilePrefix, position, totalTiles, tileIndex) => {
        return `${tilePrefix}_selected`;
      });

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      // Verify TileSelector.getTileKey was called
      expect(TileSelector.getTileKey).toHaveBeenCalledWith('terrain_grass_block', 0, 1, 0);
      
      // Verify the platform was created with the selected tile
      expect(sceneFactory.createGroundPlatform).toHaveBeenCalledWith(
        expect.objectContaining({
          tilePrefix: 'terrain_grass_block_selected'
        }),
        mockPlatformsGroup
      );

      // Restore original method
      TileSelector.getTileKey = originalGetTileKey;
    });

    it('should use TileSelector.getTileKey for decorative platform tile selection', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      // Mock TileSelector.getTileKey
      const originalGetTileKey = TileSelector.getTileKey;
      TileSelector.getTileKey = jest.fn((tilePrefix, position, totalTiles, tileIndex) => {
        return `${tilePrefix}_selected`;
      });

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      // Verify TileSelector.getTileKey was called
      expect(TileSelector.getTileKey).toHaveBeenCalledWith('bush', 0, 1, 0);
      
      // Verify the platform was created with the selected tile
      expect(sceneFactory.createDecorativePlatform).toHaveBeenCalledWith(
        expect.objectContaining({
          tilePrefix: 'bush_selected'
        })
      );

      // Restore original method
      TileSelector.getTileKey = originalGetTileKey;
    });
  });

  describe('Multi-Tile Platform Support', () => {
    it('should create multi-tile ground platform for adjacent ground tiles', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'terrain_grass_block', type: 'ground' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      // Should create one multi-tile platform instead of three single tiles
      expect(result.groundPlatforms).toHaveLength(1);
      expect(result.groundPlatforms[0].width).toBe(192); // 3 * 64
      expect(result.groundPlatforms[0].x).toBe(0);
      expect(result.groundPlatforms[0].y).toBe(0);
    });

    it('should create separate platforms when ground tiles are not adjacent', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' },
            { tileKey: 'terrain_grass_block', type: 'ground' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      // Should create two separate single-tile platforms
      expect(result.groundPlatforms).toHaveLength(2);
      expect(result.groundPlatforms[0].width).toBe(64);
      expect(result.groundPlatforms[0].x).toBe(0);
      expect(result.groundPlatforms[1].width).toBe(64);
      expect(result.groundPlatforms[1].x).toBe(128);
    });

    it('should handle multi-tile platforms with proper tile variants', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'terrain_grass_block', type: 'ground' }
          ]
        ]
      };

      // For multi-tile platforms, TileSelector.getTileKey is not called here; platform creation logic uses it internally
      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      // Should create one multi-tile platform with width 192
      expect(result.groundPlatforms).toHaveLength(1);
      expect(result.groundPlatforms[0].width).toBe(192);
      expect(result.groundPlatforms[0].x).toBe(0);
      expect(result.groundPlatforms[0].y).toBe(0);
    });

    it('should handle multi-tile platforms spanning multiple rows', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'terrain_grass_block', type: 'ground' }
          ],
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'terrain_grass_block', type: 'ground' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      // Should create two multi-tile platforms (one per row)
      expect(result.groundPlatforms).toHaveLength(2);
      expect(result.groundPlatforms[0].width).toBe(128); // 2 * 64
      expect(result.groundPlatforms[0].x).toBe(0);
      expect(result.groundPlatforms[0].y).toBe(0);
      expect(result.groundPlatforms[1].width).toBe(128); // 2 * 64
      expect(result.groundPlatforms[1].x).toBe(0);
      expect(result.groundPlatforms[1].y).toBe(64);
    });
  });

  describe('Coordinate System Validation', () => {
    it('should correctly map matrix coordinates to world positions', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },   // [0][0] → (0, 0)
            { tileKey: 'bush', type: 'decorative' }               // [0][1] → (64, 0)
          ],
          [
            { tileKey: 'rock', type: 'decorative' },              // [1][0] → (0, 64)
            { tileKey: 'cactus', type: 'decorative' }             // [1][1] → (64, 64)
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      // Verify coordinate mapping
      expect(result.groundPlatforms[0].x).toBe(0);   // matrix[0][0]
      expect(result.groundPlatforms[0].y).toBe(0);

      expect(result.decorativePlatforms[0].x).toBe(64);  // matrix[0][1]
      expect(result.decorativePlatforms[0].y).toBe(0);

      expect(result.decorativePlatforms[1].x).toBe(0);   // matrix[1][0]
      expect(result.decorativePlatforms[1].y).toBe(64);

      expect(result.decorativePlatforms[2].x).toBe(64);  // matrix[1][1]
      expect(result.decorativePlatforms[2].y).toBe(64);
    });
  });
}); 