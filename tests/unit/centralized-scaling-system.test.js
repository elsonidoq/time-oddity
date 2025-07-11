/**
 * Unit tests for centralized scaling system
 * 
 * Tests the centralized scale configuration and ensures it's properly
 * accessible across the application.
 */

import { LEVEL_SCALE, GameConfig } from '../../client/src/config/GameConfig.js';

describe('Centralized Scaling System', () => {
  describe('GameConfig Scale Configuration', () => {
    test('should export LEVEL_SCALE constant', () => {
      expect(LEVEL_SCALE).toBeDefined();
      expect(typeof LEVEL_SCALE).toBe('number');
    });

    test('should have LEVEL_SCALE set to 0.25', () => {
      expect(LEVEL_SCALE).toBe(0.25);
    });

    test('should export GameConfig object', () => {
      expect(GameConfig).toBeDefined();
      expect(typeof GameConfig).toBe('object');
    });

    test('should have levelScale property in GameConfig', () => {
      expect(GameConfig.levelScale).toBeDefined();
      expect(GameConfig.levelScale).toBe(LEVEL_SCALE);
    });

    test('should have immutable exports', () => {
      // Test that the exports are frozen/immutable
      expect(() => {
        LEVEL_SCALE = 0.5;
      }).toThrow();
      
      expect(() => {
        GameConfig.levelScale = 0.5;
      }).toThrow();
    });
  });

  describe('Scale Value Properties', () => {
    test('should be a valid scale value for sprite scaling', () => {
      expect(LEVEL_SCALE).toBeGreaterThan(0);
      expect(LEVEL_SCALE).toBeLessThanOrEqual(1);
    });

    test('should maintain visual consistency with previous camera zoom', () => {
      // 0.25 scale should provide the same visual appearance as 0.25 camera zoom
      expect(LEVEL_SCALE).toBe(0.25);
    });
  });
}); 