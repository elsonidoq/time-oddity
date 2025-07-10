import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('SceneFactory Map Matrix Validation', () => {
  let sceneMock;
  let sceneFactory;

  beforeEach(() => {
    sceneMock = createPhaserSceneMock();
    sceneFactory = new SceneFactory(sceneMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateMapMatrixConfiguration', () => {
    describe('Basic Structure Validation', () => {
      it('should return true for valid empty matrix', () => {
        const result = sceneFactory.validateMapMatrixConfiguration([]);
        expect(result).toBe(true);
      });

      it('should return false for non-array input', () => {
        const result = sceneFactory.validateMapMatrixConfiguration(null);
        expect(result).toBe(false);
      });

      it('should return false for non-array input (string)', () => {
        const result = sceneFactory.validateMapMatrixConfiguration('invalid');
        expect(result).toBe(false);
      });

      it('should return false for non-array input (object)', () => {
        const result = sceneFactory.validateMapMatrixConfiguration({});
        expect(result).toBe(false);
      });

      it('should return false when matrix contains non-array rows', () => {
        const matrix = [
          [{ tileKey: 'terrain_grass_block', type: 'ground' }],
          'invalid_row'
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });

      it('should return false when matrix contains null rows', () => {
        const matrix = [
          [{ tileKey: 'terrain_grass_block', type: 'ground' }],
          null
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });
    });

    describe('Tile Dictionary Validation', () => {
      it('should return false for null tile dictionary', () => {
        const matrix = [
          [null]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });

      it('should return false for non-object tile dictionary', () => {
        const matrix = [
          ['invalid_tile']
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });

      it('should return false for tile dictionary missing tileKey', () => {
        const matrix = [
          [{ type: 'ground' }]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });

      it('should return false for tile dictionary missing type', () => {
        const matrix = [
          [{ tileKey: 'terrain_grass_block' }]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });

      it('should return false for null tileKey', () => {
        const matrix = [
          [{ tileKey: null, type: 'ground' }]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });

      it('should return false for null type', () => {
        const matrix = [
          [{ tileKey: 'terrain_grass_block', type: null }]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });

      it('should return false for non-string tileKey', () => {
        const matrix = [
          [{ tileKey: 123, type: 'ground' }]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });

      it('should return false for non-string type', () => {
        const matrix = [
          [{ tileKey: 'terrain_grass_block', type: 123 }]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });
    });

    describe('TileKey Validation', () => {
      it('should return true for valid tileKey', () => {
        const matrix = [
          [{ tileKey: 'terrain_grass_block', type: 'ground' }]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(true);
      });

      it('should return false for invalid tileKey', () => {
        const matrix = [
          [{ tileKey: 'invalid_tile_key', type: 'ground' }]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });

      it('should return false for empty tileKey', () => {
        const matrix = [
          [{ tileKey: '', type: 'ground' }]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });

      it('should validate multiple tileKeys in matrix', () => {
        const matrix = [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ],
          [
            { tileKey: 'rock', type: 'decorative' },
            { tileKey: 'invalid_tile', type: 'ground' }
          ]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });
    });

    describe('Type Validation', () => {
      it('should return true for ground type', () => {
        const matrix = [
          [{ tileKey: 'terrain_grass_block', type: 'ground' }]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(true);
      });

      it('should return true for decorative type', () => {
        const matrix = [
          [{ tileKey: 'bush', type: 'decorative' }]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(true);
      });

      it('should return false for invalid type', () => {
        const matrix = [
          [{ tileKey: 'terrain_grass_block', type: 'invalid_type' }]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });

      it('should return false for empty type', () => {
        const matrix = [
          [{ tileKey: 'terrain_grass_block', type: '' }]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });

      it('should validate multiple types in matrix', () => {
        const matrix = [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ],
          [
            { tileKey: 'rock', type: 'invalid_type' },
            { tileKey: 'cactus', type: 'decorative' }
          ]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });
    });

    describe('Matrix Dimension Validation', () => {
      it('should return true for single cell matrix', () => {
        const matrix = [
          [{ tileKey: 'terrain_grass_block', type: 'ground' }]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(true);
      });

      it('should return true for 2x2 matrix', () => {
        const matrix = [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ],
          [
            { tileKey: 'rock', type: 'decorative' },
            { tileKey: 'cactus', type: 'decorative' }
          ]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(true);
      });

      it('should return false for matrix exceeding maximum rows (100)', () => {
        const matrix = Array(101).fill().map(() => [
          { tileKey: 'terrain_grass_block', type: 'ground' }
        ]);
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });

      it('should return false for matrix exceeding maximum columns (100)', () => {
        const matrix = [
          Array(101).fill().map(() => ({ tileKey: 'terrain_grass_block', type: 'ground' }))
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });

      it('should return true for matrix at maximum size (100x100)', () => {
        const matrix = Array(100).fill().map(() => 
          Array(100).fill().map(() => ({ tileKey: 'terrain_grass_block', type: 'ground' }))
        );
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(true);
      });

      it('should return false for matrix with inconsistent row lengths', () => {
        const matrix = [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ],
          [
            { tileKey: 'rock', type: 'decorative' }
          ]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });
    });

    describe('Complex Matrix Validation', () => {
      it('should return true for complex valid matrix', () => {
        const matrix = [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' },
            { tileKey: 'terrain_grass_block', type: 'ground' }
          ],
          [
            { tileKey: 'rock', type: 'decorative' },
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'cactus', type: 'decorative' }
          ],
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'terrain_grass_block', type: 'ground' }
          ]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(true);
      });

      it('should return false for complex matrix with multiple validation errors', () => {
        const matrix = [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'invalid_tile', type: 'decorative' },
            { tileKey: 'terrain_grass_block', type: 'ground' }
          ],
          [
            { tileKey: 'rock', type: 'decorative' },
            { tileKey: 'terrain_grass_block', type: 'invalid_type' },
            { tileKey: 'cactus', type: 'decorative' }
          ]
        ];
        const result = sceneFactory.validateMapMatrixConfiguration(matrix);
        expect(result).toBe(false);
      });
    });
  });

  describe('isValidTileKey', () => {
    it('should return true for valid tile keys', () => {
      const validTiles = [
        'terrain_grass_block',
        'bush',
        'rock',
        'cactus',
        'terrain_dirt_block',
        'terrain_stone_block'
      ];

      validTiles.forEach(tileKey => {
        expect(sceneFactory.isValidTileKey(tileKey)).toBe(true);
      });
    });

    it('should return false for invalid tile keys', () => {
      const invalidTiles = [
        'invalid_tile',
        'non_existent_tile',
        'terrain_grass_block_invalid',
        ''
      ];

      invalidTiles.forEach(tileKey => {
        expect(sceneFactory.isValidTileKey(tileKey)).toBe(false);
      });
    });

    it('should return false for null or undefined tile keys', () => {
      expect(sceneFactory.isValidTileKey(null)).toBe(false);
      expect(sceneFactory.isValidTileKey(undefined)).toBe(false);
    });

    it('should return false for non-string tile keys', () => {
      expect(sceneFactory.isValidTileKey(123)).toBe(false);
      expect(sceneFactory.isValidTileKey({})).toBe(false);
      expect(sceneFactory.isValidTileKey([])).toBe(false);
    });
  });
}); 