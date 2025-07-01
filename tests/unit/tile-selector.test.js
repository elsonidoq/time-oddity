/**
 * TileSelector Unit Tests
 * 
 * Tests for the TileSelector utility class that determines correct tile keys
 * based on platform position and size.
 * 
 * Following TDD methodology - tests written before implementation.
 */

import { TileSelector } from '../../client/src/systems/TileSelector.js';

describe('TileSelector', () => {
  describe('getTileKey', () => {
    describe('Block-style tiles (terrain_grass_block)', () => {
      test('should return center tile for single tile platform', () => {
        const result = TileSelector.getTileKey('terrain_grass_block', 0, 1, 0);
        expect(result).toBe('terrain_grass_block_center');
      });

      test('should return left and right tiles for two-tile platform', () => {
        const leftTile = TileSelector.getTileKey('terrain_grass_block', 0, 2, 0);
        const rightTile = TileSelector.getTileKey('terrain_grass_block', 0, 2, 1);
        
        expect(leftTile).toBe('terrain_grass_block_left');
        expect(rightTile).toBe('terrain_grass_block_right');
      });

      test('should return left, center, right tiles for three-tile platform', () => {
        const leftTile = TileSelector.getTileKey('terrain_grass_block', 0, 3, 0);
        const centerTile = TileSelector.getTileKey('terrain_grass_block', 0, 3, 1);
        const rightTile = TileSelector.getTileKey('terrain_grass_block', 0, 3, 2);
        
        expect(leftTile).toBe('terrain_grass_block_left');
        expect(centerTile).toBe('terrain_grass_block_center');
        expect(rightTile).toBe('terrain_grass_block_right');
      });

      test('should return left, multiple centers, right tiles for large platform', () => {
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

    describe('Horizontal-style tiles (terrain_grass_horizontal)', () => {
      test('should return middle tile for single tile platform', () => {
        const result = TileSelector.getTileKey('terrain_grass_horizontal', 0, 1, 0);
        expect(result).toBe('terrain_grass_horizontal_middle');
      });

      test('should return left and right tiles for two-tile platform', () => {
        const leftTile = TileSelector.getTileKey('terrain_grass_horizontal', 0, 2, 0);
        const rightTile = TileSelector.getTileKey('terrain_grass_horizontal', 0, 2, 1);
        
        expect(leftTile).toBe('terrain_grass_horizontal_left');
        expect(rightTile).toBe('terrain_grass_horizontal_right');
      });

      test('should return left, middle, right tiles for three-tile platform', () => {
        const leftTile = TileSelector.getTileKey('terrain_grass_horizontal', 0, 3, 0);
        const middleTile = TileSelector.getTileKey('terrain_grass_horizontal', 0, 3, 1);
        const rightTile = TileSelector.getTileKey('terrain_grass_horizontal', 0, 3, 2);
        
        expect(leftTile).toBe('terrain_grass_horizontal_left');
        expect(middleTile).toBe('terrain_grass_horizontal_middle');
        expect(rightTile).toBe('terrain_grass_horizontal_right');
      });

      test('should return left, multiple middles, right tiles for large platform', () => {
        const leftTile = TileSelector.getTileKey('terrain_grass_horizontal', 0, 6, 0);
        const middleTile1 = TileSelector.getTileKey('terrain_grass_horizontal', 0, 6, 1);
        const middleTile2 = TileSelector.getTileKey('terrain_grass_horizontal', 0, 6, 2);
        const middleTile3 = TileSelector.getTileKey('terrain_grass_horizontal', 0, 6, 3);
        const middleTile4 = TileSelector.getTileKey('terrain_grass_horizontal', 0, 6, 4);
        const rightTile = TileSelector.getTileKey('terrain_grass_horizontal', 0, 6, 5);
        
        expect(leftTile).toBe('terrain_grass_horizontal_left');
        expect(middleTile1).toBe('terrain_grass_horizontal_middle');
        expect(middleTile2).toBe('terrain_grass_horizontal_middle');
        expect(middleTile3).toBe('terrain_grass_horizontal_middle');
        expect(middleTile4).toBe('terrain_grass_horizontal_middle');
        expect(rightTile).toBe('terrain_grass_horizontal_right');
      });
    });

    describe('Edge cases and validation', () => {
      test('should handle zero totalTiles gracefully', () => {
        expect(() => {
          TileSelector.getTileKey('terrain_grass_block', 0, 0, 0);
        }).toThrow('totalTiles must be greater than 0');
      });

      test('should handle negative totalTiles gracefully', () => {
        expect(() => {
          TileSelector.getTileKey('terrain_grass_block', 0, -1, 0);
        }).toThrow('totalTiles must be greater than 0');
      });

      test('should handle negative tileIndex gracefully', () => {
        expect(() => {
          TileSelector.getTileKey('terrain_grass_block', 0, 3, -1);
        }).toThrow('tileIndex must be between 0 and totalTiles - 1');
      });

      test('should handle tileIndex >= totalTiles gracefully', () => {
        expect(() => {
          TileSelector.getTileKey('terrain_grass_block', 0, 3, 3);
        }).toThrow('tileIndex must be between 0 and totalTiles - 1');
      });

      test('should handle empty tilePrefix gracefully', () => {
        expect(() => {
          TileSelector.getTileKey('', 0, 3, 1);
        }).toThrow('tilePrefix cannot be empty');
      });

      test('should handle null tilePrefix gracefully', () => {
        expect(() => {
          TileSelector.getTileKey(null, 0, 3, 1);
        }).toThrow('tilePrefix cannot be empty');
      });

      test('should handle undefined tilePrefix gracefully', () => {
        expect(() => {
          TileSelector.getTileKey(undefined, 0, 3, 1);
        }).toThrow('tilePrefix cannot be empty');
      });
    });

    describe('Different tile prefixes', () => {
      test('should work with terrain_dirt_block prefix', () => {
        const result = TileSelector.getTileKey('terrain_dirt_block', 0, 1, 0);
        expect(result).toBe('terrain_dirt_block_center');
      });

      test('should work with terrain_sand_horizontal prefix', () => {
        const result = TileSelector.getTileKey('terrain_sand_horizontal', 0, 1, 0);
        expect(result).toBe('terrain_sand_horizontal_middle');
      });

      test('should work with terrain_stone_block prefix', () => {
        const leftTile = TileSelector.getTileKey('terrain_stone_block', 0, 3, 0);
        const centerTile = TileSelector.getTileKey('terrain_stone_block', 0, 3, 1);
        const rightTile = TileSelector.getTileKey('terrain_stone_block', 0, 3, 2);
        
        expect(leftTile).toBe('terrain_stone_block_left');
        expect(centerTile).toBe('terrain_stone_block_center');
        expect(rightTile).toBe('terrain_stone_block_right');
      });
    });

    describe('Position parameter usage', () => {
      test('should ignore position parameter (for future extensibility)', () => {
        const result1 = TileSelector.getTileKey('terrain_grass_block', 0, 1, 0);
        const result2 = TileSelector.getTileKey('terrain_grass_block', 100, 1, 0);
        const result3 = TileSelector.getTileKey('terrain_grass_block', -50, 1, 0);
        
        expect(result1).toBe('terrain_grass_block_center');
        expect(result2).toBe('terrain_grass_block_center');
        expect(result3).toBe('terrain_grass_block_center');
      });
    });
  });

  describe('detectTileStyle', () => {
    test('should detect block-style tiles', () => {
      expect(TileSelector.detectTileStyle('terrain_grass_block')).toBe('block');
      expect(TileSelector.detectTileStyle('terrain_dirt_block')).toBe('block');
      expect(TileSelector.detectTileStyle('terrain_stone_block')).toBe('block');
    });

    test('should detect horizontal-style tiles', () => {
      expect(TileSelector.detectTileStyle('terrain_grass_horizontal')).toBe('horizontal');
      expect(TileSelector.detectTileStyle('terrain_dirt_horizontal')).toBe('horizontal');
      expect(TileSelector.detectTileStyle('terrain_sand_horizontal')).toBe('horizontal');
    });

    test('should default to block-style for unknown patterns', () => {
      expect(TileSelector.detectTileStyle('unknown_tile')).toBe('block');
      expect(TileSelector.detectTileStyle('custom_tile')).toBe('block');
    });
  });
}); 