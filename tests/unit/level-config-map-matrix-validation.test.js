import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('Map Matrix Validation', () => {
  let sceneMock;
  let sceneFactory;

  beforeEach(() => {
    sceneMock = createPhaserSceneMock();
    sceneFactory = new SceneFactory(sceneMock);
  });

  describe('Map Matrix Format Specification', () => {
    it('should accept valid map_matrix with ground and decorative tiles', () => {
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

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(true);
      expect(sceneFactory.config.map_matrix).toBeDefined();
    });

    it('should reject map_matrix with invalid tileKey', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'invalid_tile', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(false);
    });

    it('should reject map_matrix with invalid type', () => {
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

    it('should reject malformed map_matrix (not 2D array)', () => {
      const config = {
        map_matrix: [
          { tileKey: 'terrain_grass_block', type: 'ground' }
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(false);
    });

    it('should reject map_matrix with missing tileKey', () => {
      const config = {
        map_matrix: [
          [
            { type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(false);
    });

    it('should reject map_matrix with missing type', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block' },
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(false);
    });

    it('should accept empty map_matrix', () => {
      const config = {
        map_matrix: []
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(true);
    });

    it('should accept map_matrix with only ground tiles', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'terrain_grass_block', type: 'ground' }
          ]
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(true);
    });

    it('should accept map_matrix with only decorative tiles', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'bush', type: 'decorative' },
            { tileKey: 'rock', type: 'decorative' }
          ]
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(true);
    });

    it('should validate tileKey against available tiles list', () => {
      const validTiles = [
        'terrain_grass_block',
        'terrain_dirt_block', 
        'bush',
        'rock',
        'cactus',
        'mushroom_brown'
      ];

      validTiles.forEach(tileKey => {
        const config = {
          map_matrix: [
            [{ tileKey, type: 'ground' }]
          ]
        };

        const result = sceneFactory.loadConfiguration(config);
        expect(result).toBe(true);
      });
    });

    it('should reject invalid tileKey values', () => {
      const invalidTiles = [
        'invalid_tile',
        'nonexistent_tile',
        'terrain_invalid_block'
      ];

      invalidTiles.forEach(tileKey => {
        const config = {
          map_matrix: [
            [{ tileKey, type: 'ground' }]
          ]
        };

        const result = sceneFactory.loadConfiguration(config);
        expect(result).toBe(false);
      });
    });

    it('should only accept "ground" and "decorative" as valid types', () => {
      const invalidTypes = [
        'floating',
        'moving', 
        'invalid',
        'platform',
        'tile'
      ];

      invalidTypes.forEach(type => {
        const config = {
          map_matrix: [
            [{ tileKey: 'terrain_grass_block', type }]
          ]
        };

        const result = sceneFactory.loadConfiguration(config);
        expect(result).toBe(false);
      });
    });
  });

  describe('Map Matrix Coordinate System', () => {
    it('should define coordinate mapping from matrix to world positions', () => {
      // This test documents the expected coordinate system
      // matrix[row][col] maps to world position (col * 64, row * 64)
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

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(true);
      
      // The coordinate system should be:
      // matrix[0][0] -> world (0, 0)
      // matrix[0][1] -> world (64, 0) 
      // matrix[1][0] -> world (0, 64)
      // matrix[1][1] -> world (64, 64)
    });
  });

  describe('Map Matrix Edge Cases', () => {
    it('should handle non-string tileKey values', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 123, type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(false);
    });

    it('should handle non-string type values', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 123 },
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(false);
    });

    it('should handle null tileKey values', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: null, type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(false);
    });

    it('should handle null type values', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: null },
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(false);
    });

    it('should handle undefined tileKey values', () => {
      const config = {
        map_matrix: [
          [
            { type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(false);
    });

    it('should handle undefined type values', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block' },
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(false);
    });

    it('should handle non-object tile dictionaries', () => {
      const config = {
        map_matrix: [
          [
            'invalid_tile',
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(false);
    });

    it('should handle null tile dictionaries', () => {
      const config = {
        map_matrix: [
          [
            null,
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      const result = sceneFactory.loadConfiguration(config);
      expect(result).toBe(false);
    });
  });
}); 