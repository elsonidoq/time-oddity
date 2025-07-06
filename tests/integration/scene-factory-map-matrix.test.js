import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import { TileSelector } from '../../client/src/systems/TileSelector.js';

describe('SceneFactory Map Matrix Integration Tests', () => {
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

  describe('Basic Matrix Parsing', () => {
    it('should parse simple 2x2 matrix with ground and decorative tiles', () => {
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

    it('should handle large matrix with complex level definition', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' },
            { tileKey: 'terrain_grass_block', type: 'ground' }
          ],
          [
            { tileKey: 'rock', type: 'decorative' },
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'cactus', type: 'decorative' },
            { tileKey: 'terrain_grass_block', type: 'ground' }
          ],
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'terrain_grass_block', type: 'ground' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      expect(result).toBeDefined();
      expect(result.groundPlatforms).toHaveLength(5); // 5 ground platform groups (2 in row 0, 2 in row 1, 1 in row 2)
      expect(result.decorativePlatforms).toHaveLength(3); // 3 decorative tiles
    });
  });

  describe('Mixed Configurations', () => {
    it('should handle level with both map_matrix and individual platforms', () => {
      const config = {
        platforms: [
          {
            type: 'ground',
            x: 0,
            y: 2900,
            width: 6000,
            tilePrefix: 'terrain_grass_horizontal',
            isFullBlock: true
          }
        ],
        decorativePlatforms: [
          {
            type: 'decorative',
            x: 310,
            y: 850,
            tilePrefix: 'terrain_grass_block',
            depth: -0.2
          }
        ],
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      expect(result).toBeDefined();
      expect(result.groundPlatforms).toHaveLength(1);
      expect(result.decorativePlatforms).toHaveLength(1);
    });

    it('should prioritize map_matrix over individual platforms when both present', () => {
      const config = {
        platforms: [
          {
            type: 'ground',
            x: 0,
            y: 2900,
            width: 6000,
            tilePrefix: 'terrain_grass_horizontal',
            isFullBlock: true
          }
        ],
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);

      // Should only create platforms from map_matrix, not from platforms array
      expect(result).toHaveLength(1);
      expect(result[0].x).toBe(0);
      expect(result[0].y).toBe(0);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle invalid tileKey in map_matrix', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'invalid_tile_key', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(false);
    });

    it('should handle invalid type in map_matrix', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'invalid_type' },
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(false);
    });

    it('should handle malformed matrix structure', () => {
      const config = {
        map_matrix: [
          { tileKey: 'terrain_grass_block', type: 'ground' }
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(false);
    });

    it('should handle inconsistent row lengths', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ],
          [
            { tileKey: 'rock', type: 'decorative' }
          ]
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(false);
    });
  });

  describe('Coordinate Mapping', () => {
    it('should correctly map matrix positions to world coordinates', () => {
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

    it('should handle multi-tile ground platforms with correct width calculation', () => {
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

      // Should create one platform with width 192 (3 tiles * 64px)
      expect(result.groundPlatforms).toHaveLength(1);
      expect(result.groundPlatforms[0].width).toBe(192);
      expect(result.groundPlatforms[0].x).toBe(0);
      expect(result.groundPlatforms[0].y).toBe(0);
    });
  });

  describe('Tile Selection and Platform Creation', () => {
    it('should use TileSelector for ground platform tile selection', () => {
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

    it('should use TileSelector for decorative platform tile selection', () => {
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

  describe('Integration with Existing Level Loading', () => {
    it('should integrate with createPlatformsFromConfig method', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);

      expect(result).toHaveLength(1); // One ground platform
      expect(result[0].type).toBe('ground');
    });

    it('should integrate with createDecorativePlatformsFromConfig method', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      
      // Debug: Check if config is loaded properly
      console.log('Config loaded:', sceneFactory.config);
      console.log('Map matrix:', sceneFactory.config.map_matrix);
      
      const result = sceneFactory.createDecorativePlatformsFromConfig([]);
      
      // Debug: Check the result
      console.log('Result:', result);
      console.log('Result length:', result.length);

      expect(result).toHaveLength(1); // One decorative platform from map_matrix
      expect(result[0].type).toBe('decorative');
    });
  });

  describe('Error Handling and Graceful Degradation', () => {
    it('should fallback to traditional platforms when map_matrix is invalid', () => {
      const config = {
        platforms: [
          {
            type: 'ground',
            x: 0,
            y: 2900,
            width: 6000,
            tilePrefix: 'terrain_grass_horizontal',
            isFullBlock: true
          }
        ],
        map_matrix: [
          [
            { tileKey: 'invalid_tile_key', type: 'ground' }
          ]
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(false); // Should fail due to invalid map_matrix
    });

    it('should handle empty map_matrix gracefully', () => {
      const config = {
        map_matrix: []
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      expect(result).toBeNull();
    });

    it('should handle null map_matrix gracefully', () => {
      const config = {};

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      expect(result).toBeNull();
    });
  });
}); 