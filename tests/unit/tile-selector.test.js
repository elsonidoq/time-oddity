import { TileSelector } from '../../client/src/systems/TileSelector.js';

describe('TileSelector', () => {
  describe('getTileKey', () => {
    describe('Block-style tiles (_left, _center, _right)', () => {
      test('should return base name for single tile', () => {
        const result = TileSelector.getTileKey('terrain_grass_block', 0, 1, 0);
        expect(result).toBe('terrain_grass_block');
      });

      test('should return left and right tiles for two tiles', () => {
        const leftTile = TileSelector.getTileKey('terrain_grass_block', 0, 2, 0);
        const rightTile = TileSelector.getTileKey('terrain_grass_block', 0, 2, 1);
        
        expect(leftTile).toBe('terrain_grass_block_left');
        expect(rightTile).toBe('terrain_grass_block_right');
      });

      test('should return left, center, right tiles for three tiles', () => {
        const leftTile = TileSelector.getTileKey('terrain_grass_block', 0, 3, 0);
        const centerTile = TileSelector.getTileKey('terrain_grass_block', 0, 3, 1);
        const rightTile = TileSelector.getTileKey('terrain_grass_block', 0, 3, 2);
        
        expect(leftTile).toBe('terrain_grass_block_left');
        expect(centerTile).toBe('terrain_grass_block_center');
        expect(rightTile).toBe('terrain_grass_block_right');
      });

      test('should return left, multiple centers, right tiles for many tiles', () => {
        const leftTile = TileSelector.getTileKey('terrain_grass_block', 0, 5, 0);
        const centerTile1 = TileSelector.getTileKey('terrain_grass_block', 0, 5, 1);
        const centerTile2 = TileSelector.getTileKey('terrain_grass_block', 0, 5, 2);
        const centerTile3 = TileSelector.getTileKey('terrain_grass_block', 0, 5, 3);
        const rightTile = TileSelector.getTileKey('terrain_grass_block', 0, 5, 4);
        
        expect(leftTile).toBe('terrain_grass_block_left');
        expect(centerTile1).toBe('terrain_grass_block_center');
        expect(centerTile2).toBe('terrain_grass_block_center');
        expect(centerTile3).toBe('terrain_grass_block_center');
        expect(rightTile).toBe('terrain_grass_block_right');
      });
    });

    describe('Horizontal-style tiles (_left, _middle, _right)', () => {
      test('should return base name for single tile', () => {
        const result = TileSelector.getTileKey('terrain_grass_horizontal', 0, 1, 0);
        expect(result).toBe('terrain_grass_horizontal');
      });

      test('should return left and right tiles for two tiles', () => {
        const leftTile = TileSelector.getTileKey('terrain_grass_horizontal', 0, 2, 0);
        const rightTile = TileSelector.getTileKey('terrain_grass_horizontal', 0, 2, 1);
        
        expect(leftTile).toBe('terrain_grass_horizontal_left');
        expect(rightTile).toBe('terrain_grass_horizontal_right');
      });

      test('should return left, middle, right tiles for three tiles', () => {
        const leftTile = TileSelector.getTileKey('terrain_grass_horizontal', 0, 3, 0);
        const middleTile = TileSelector.getTileKey('terrain_grass_horizontal', 0, 3, 1);
        const rightTile = TileSelector.getTileKey('terrain_grass_horizontal', 0, 3, 2);
        
        expect(leftTile).toBe('terrain_grass_horizontal_left');
        expect(middleTile).toBe('terrain_grass_horizontal_middle');
        expect(rightTile).toBe('terrain_grass_horizontal_right');
      });

      test('should return left, multiple middles, right tiles for many tiles', () => {
        const leftTile = TileSelector.getTileKey('terrain_grass_horizontal', 0, 5, 0);
        const middleTile1 = TileSelector.getTileKey('terrain_grass_horizontal', 0, 5, 1);
        const middleTile2 = TileSelector.getTileKey('terrain_grass_horizontal', 0, 5, 2);
        const middleTile3 = TileSelector.getTileKey('terrain_grass_horizontal', 0, 5, 3);
        const rightTile = TileSelector.getTileKey('terrain_grass_horizontal', 0, 5, 4);
        
        expect(leftTile).toBe('terrain_grass_horizontal_left');
        expect(middleTile1).toBe('terrain_grass_horizontal_middle');
        expect(middleTile2).toBe('terrain_grass_horizontal_middle');
        expect(middleTile3).toBe('terrain_grass_horizontal_middle');
        expect(rightTile).toBe('terrain_grass_horizontal_right');
      });
    });

    describe('Edge cases and validation', () => {
      test('should handle zero total tiles gracefully', () => {
        expect(() => {
          TileSelector.getTileKey('terrain_grass_block', 0, 0, 0);
        }).toThrow('Invalid parameters: totalTiles must be > 0, tileIndex must be >= 0 and < totalTiles');
      });

      test('should handle negative tile index', () => {
        expect(() => {
          TileSelector.getTileKey('terrain_grass_block', 0, 1, -1);
        }).toThrow('Invalid parameters: totalTiles must be > 0, tileIndex must be >= 0 and < totalTiles');
      });

      test('should handle tile index >= total tiles', () => {
        expect(() => {
          TileSelector.getTileKey('terrain_grass_block', 0, 2, 2);
        }).toThrow('Invalid parameters: totalTiles must be > 0, tileIndex must be >= 0 and < totalTiles');
      });

      test('should handle empty tile prefix', () => {
        const result = TileSelector.getTileKey('', 0, 1, 0);
        expect(result).toBe('');
      });

      test('should handle null/undefined tile prefix', () => {
        const result = TileSelector.getTileKey(null, 0, 1, 0);
        expect(result).toBe('');
      });
    });

    describe('Different tile prefixes', () => {
      test('should work with terrain_dirt_block prefix', () => {
        const result = TileSelector.getTileKey('terrain_dirt_block', 0, 1, 0);
        expect(result).toBe('terrain_dirt_block');
      });

      test('should work with terrain_purple_block prefix', () => {
        const result = TileSelector.getTileKey('terrain_purple_block', 0, 1, 0);
        expect(result).toBe('terrain_purple_block');
      });

      test('should work with terrain_sand_horizontal prefix', () => {
        const result = TileSelector.getTileKey('terrain_sand_horizontal', 0, 1, 0);
        expect(result).toBe('terrain_sand_horizontal');
      });
    });

    describe('Position parameter (for future extensibility)', () => {
      test('should ignore position parameter for current implementation', () => {
        const result1 = TileSelector.getTileKey('terrain_grass_block', 100, 1, 0);
        const result2 = TileSelector.getTileKey('terrain_grass_block', 200, 1, 0);
        expect(result1).toBe(result2);
        expect(result1).toBe('terrain_grass_block');
      });
    });
  });

  describe('isBlockStyle', () => {
    test('should detect block-style prefixes', () => {
      expect(TileSelector.isBlockStyle('terrain_grass_block')).toBe(true);
      expect(TileSelector.isBlockStyle('terrain_dirt_block')).toBe(true);
      expect(TileSelector.isBlockStyle('terrain_purple_block')).toBe(true);
      expect(TileSelector.isBlockStyle('terrain_sand_block')).toBe(true);
      expect(TileSelector.isBlockStyle('terrain_stone_block')).toBe(true);
    });

    test('should detect horizontal-style prefixes', () => {
      expect(TileSelector.isBlockStyle('terrain_grass_horizontal')).toBe(false);
      expect(TileSelector.isBlockStyle('terrain_dirt_horizontal')).toBe(false);
      expect(TileSelector.isBlockStyle('terrain_purple_horizontal')).toBe(false);
      expect(TileSelector.isBlockStyle('terrain_sand_horizontal')).toBe(false);
      expect(TileSelector.isBlockStyle('terrain_stone_horizontal')).toBe(false);
    });

    test('should handle edge cases', () => {
      expect(TileSelector.isBlockStyle('')).toBe(false);
      expect(TileSelector.isBlockStyle(null)).toBe(false);
      expect(TileSelector.isBlockStyle('some_other_prefix')).toBe(false);
    });
  });

  describe('matrixToWorldCoordinates', () => {
    test('should convert matrix position to world coordinates', () => {
      const result = TileSelector.matrixToWorldCoordinates(0, 0);
      expect(result).toEqual({ x: 0, y: 0 });
    });

    test('should convert matrix position with positive indices', () => {
      const result = TileSelector.matrixToWorldCoordinates(1, 2);
      expect(result).toEqual({ x: 128, y: 64 });
    });

    test('should handle larger matrix positions', () => {
      const result = TileSelector.matrixToWorldCoordinates(5, 10);
      expect(result).toEqual({ x: 640, y: 320 });
    });

    test('should use 64x64 tile size constant', () => {
      const result1 = TileSelector.matrixToWorldCoordinates(0, 1);
      const result2 = TileSelector.matrixToWorldCoordinates(1, 0);
      expect(result1).toEqual({ x: 64, y: 0 });
      expect(result2).toEqual({ x: 0, y: 64 });
    });

    test('should handle zero indices', () => {
      const result = TileSelector.matrixToWorldCoordinates(0, 0);
      expect(result).toEqual({ x: 0, y: 0 });
    });

    test('should handle negative indices (edge case)', () => {
      const result = TileSelector.matrixToWorldCoordinates(-1, -2);
      expect(result).toEqual({ x: -128, y: -64 });
    });
  });

  describe('getMatrixTileKey', () => {
    test('should return tile key for single tile in matrix', () => {
      const matrix = [
        [{ tileKey: 'terrain_grass_block', type: 'ground' }]
      ];
      const result = TileSelector.getMatrixTileKey(matrix, 0, 0);
      expect(result).toBe('terrain_grass_block');
    });

    test('should return appropriate tile key for left edge of multi-tile platform', () => {
      const matrix = [
        [
          { tileKey: 'terrain_grass_block', type: 'ground' },
          { tileKey: 'terrain_grass_block', type: 'ground' },
          { tileKey: 'terrain_grass_block', type: 'ground' }
        ]
      ];
      const result = TileSelector.getMatrixTileKey(matrix, 0, 0);
      expect(result).toBe('terrain_grass_block_left');
    });

    test('should return appropriate tile key for center of multi-tile platform', () => {
      const matrix = [
        [
          { tileKey: 'terrain_grass_block', type: 'ground' },
          { tileKey: 'terrain_grass_block', type: 'ground' },
          { tileKey: 'terrain_grass_block', type: 'ground' }
        ]
      ];
      const result = TileSelector.getMatrixTileKey(matrix, 0, 1);
      expect(result).toBe('terrain_grass_block_center');
    });

    test('should return appropriate tile key for right edge of multi-tile platform', () => {
      const matrix = [
        [
          { tileKey: 'terrain_grass_block', type: 'ground' },
          { tileKey: 'terrain_grass_block', type: 'ground' },
          { tileKey: 'terrain_grass_block', type: 'ground' }
        ]
      ];
      const result = TileSelector.getMatrixTileKey(matrix, 0, 2);
      expect(result).toBe('terrain_grass_block_right');
    });

    test('should handle horizontal-style tiles correctly', () => {
      const matrix = [
        [
          { tileKey: 'terrain_grass_horizontal', type: 'ground' },
          { tileKey: 'terrain_grass_horizontal', type: 'ground' },
          { tileKey: 'terrain_grass_horizontal', type: 'ground' }
        ]
      ];
      const leftResult = TileSelector.getMatrixTileKey(matrix, 0, 0);
      const middleResult = TileSelector.getMatrixTileKey(matrix, 0, 1);
      const rightResult = TileSelector.getMatrixTileKey(matrix, 0, 2);
      
      expect(leftResult).toBe('terrain_grass_horizontal_left');
      expect(middleResult).toBe('terrain_grass_horizontal_middle');
      expect(rightResult).toBe('terrain_grass_horizontal_right');
    });

    test('should handle two-tile platforms correctly', () => {
      const matrix = [
        [
          { tileKey: 'terrain_grass_block', type: 'ground' },
          { tileKey: 'terrain_grass_block', type: 'ground' }
        ]
      ];
      const leftResult = TileSelector.getMatrixTileKey(matrix, 0, 0);
      const rightResult = TileSelector.getMatrixTileKey(matrix, 0, 1);
      
      expect(leftResult).toBe('terrain_grass_block_left');
      expect(rightResult).toBe('terrain_grass_block_right');
    });

    test('should handle decorative tiles (no suffix)', () => {
      const matrix = [
        [{ tileKey: 'bush', type: 'decorative' }]
      ];
      const result = TileSelector.getMatrixTileKey(matrix, 0, 0);
      expect(result).toBe('bush');
    });

    test('should throw error for invalid matrix coordinates', () => {
      const matrix = [
        [{ tileKey: 'terrain_grass_block', type: 'ground' }]
      ];
      expect(() => {
        TileSelector.getMatrixTileKey(matrix, 1, 0);
      }).toThrow('Invalid matrix coordinates: row 1, col 0 out of bounds');
    });

    test('should throw error for negative coordinates', () => {
      const matrix = [
        [{ tileKey: 'terrain_grass_block', type: 'ground' }]
      ];
      expect(() => {
        TileSelector.getMatrixTileKey(matrix, -1, 0);
      }).toThrow('Invalid matrix coordinates: row -1, col 0 out of bounds');
    });

    test('should handle empty matrix', () => {
      const matrix = [];
      expect(() => {
        TileSelector.getMatrixTileKey(matrix, 0, 0);
      }).toThrow('Invalid matrix coordinates: row 0, col 0 out of bounds');
    });

    test('should handle matrix with empty rows', () => {
      const matrix = [[]];
      expect(() => {
        TileSelector.getMatrixTileKey(matrix, 0, 0);
      }).toThrow('Invalid matrix coordinates: row 0, col 0 out of bounds');
    });
  });

  describe('calculateGroundPlatformWidth', () => {
    test('should calculate width for single tile platform', () => {
      const matrix = [
        [{ tileKey: 'terrain_grass_block', type: 'ground' }]
      ];
      const result = TileSelector.calculateGroundPlatformWidth(matrix, 0, 0);
      expect(result).toBe(64);
    });

    test('should calculate width for multi-tile platform', () => {
      const matrix = [
        [
          { tileKey: 'terrain_grass_block', type: 'ground' },
          { tileKey: 'terrain_grass_block', type: 'ground' },
          { tileKey: 'terrain_grass_block', type: 'ground' }
        ]
      ];
      const result = TileSelector.calculateGroundPlatformWidth(matrix, 0, 0);
      expect(result).toBe(192);
    });

    test('should calculate width for platform starting at middle position', () => {
      const matrix = [
        [
          { tileKey: 'bush', type: 'decorative' },
          { tileKey: 'terrain_grass_block', type: 'ground' },
          { tileKey: 'terrain_grass_block', type: 'ground' },
          { tileKey: 'rock', type: 'decorative' }
        ]
      ];
      const result = TileSelector.calculateGroundPlatformWidth(matrix, 0, 1);
      expect(result).toBe(128);
    });

    test('should handle platform ending at matrix edge', () => {
      const matrix = [
        [
          { tileKey: 'terrain_grass_block', type: 'ground' },
          { tileKey: 'terrain_grass_block', type: 'ground' }
        ]
      ];
      const result = TileSelector.calculateGroundPlatformWidth(matrix, 0, 0);
      expect(result).toBe(128);
    });

    test('should handle single tile platform in middle of row', () => {
      const matrix = [
        [
          { tileKey: 'bush', type: 'decorative' },
          { tileKey: 'terrain_grass_block', type: 'ground' },
          { tileKey: 'rock', type: 'decorative' }
        ]
      ];
      const result = TileSelector.calculateGroundPlatformWidth(matrix, 0, 1);
      expect(result).toBe(64);
    });

    test('should throw error for invalid matrix coordinates', () => {
      const matrix = [
        [{ tileKey: 'terrain_grass_block', type: 'ground' }]
      ];
      expect(() => {
        TileSelector.calculateGroundPlatformWidth(matrix, 1, 0);
      }).toThrow('Invalid matrix coordinates: row 1, col 0 out of bounds');
    });

    test('should throw error when starting position is not ground type', () => {
      const matrix = [
        [{ tileKey: 'bush', type: 'decorative' }]
      ];
      expect(() => {
        TileSelector.calculateGroundPlatformWidth(matrix, 0, 0);
      }).toThrow('Cannot calculate width: position (0, 0) is not a ground tile');
    });
  });
}); 