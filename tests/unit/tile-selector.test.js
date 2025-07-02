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
}); 