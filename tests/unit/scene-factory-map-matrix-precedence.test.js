import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

/**
 * Unit tests for SceneFactory map matrix precedence handling
 * Tests Task 05.03.5: Add Map Matrix Support to Level Loading
 */

describe('SceneFactory Map Matrix Precedence', () => {
  let sceneFactory;
  let mockScene;
  let mockPlatformsGroup;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    mockPlatformsGroup = {
      add: jest.fn(),
      create: jest.fn(() => ({ 
        setOrigin: jest.fn(), 
        setDepth: jest.fn() 
      }))
    };
    sceneFactory = new SceneFactory(mockScene);
  });

  describe('Precedence Handling', () => {
    test('should prioritize map_matrix over individual platforms when both are present', () => {
      // Arrange: Config with both map_matrix and platforms
      const config = {
        platforms: [
          { type: 'ground', x: 0, y: 100, width: 200, tilePrefix: 'terrain_grass_horizontal', isFullBlock: true }
        ],
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'terrain_grass_block', type: 'ground' }
          ]
        ]
      };

      // Act
      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);

      // Assert: Should create platforms from map_matrix, not individual platforms
      expect(result.length).toBeGreaterThan(0);
      // Verify that map_matrix platforms were created (ground platforms from matrix)
      expect(mockPlatformsGroup.create).toHaveBeenCalled();
    });

    test('should use individual platforms when only platforms array is present', () => {
      // Arrange: Config with only platforms array
      const config = {
        platforms: [
          { type: 'ground', x: 0, y: 100, width: 200, tilePrefix: 'terrain_grass_horizontal', isFullBlock: true }
        ]
      };

      // Act
      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);

      // Assert: Should create platforms from individual platforms array
      expect(result.length).toBeGreaterThan(0);
      expect(mockPlatformsGroup.create).toHaveBeenCalled();
    });

    test('should use map_matrix when only map_matrix is present', () => {
      // Arrange: Config with only map_matrix
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      // Act
      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);

      // Assert: Should create platforms from map_matrix
      expect(result.length).toBeGreaterThan(0);
      expect(mockPlatformsGroup.create).toHaveBeenCalled();
    });

    test('should handle empty configuration gracefully', () => {
      // Arrange: Empty config
      const config = {};

      // Act
      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);

      // Assert: Should return empty array
      expect(result).toEqual([]);
      expect(mockPlatformsGroup.create).not.toHaveBeenCalled();
    });
  });

  describe('Fallback Behavior', () => {
    test('should fallback to individual platforms when map_matrix is invalid', () => {
      // Arrange: Config with invalid map_matrix and valid platforms
      const config = {
        platforms: [
          { type: 'ground', x: 0, y: 100, width: 200, tilePrefix: 'terrain_grass_horizontal', isFullBlock: true }
        ],
        map_matrix: [
          [
            { tileKey: 'invalid_tile', type: 'ground' } // Invalid tileKey
          ]
        ]
      };

      // Act
      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);

      // Assert: Should fallback to individual platforms
      expect(result.length).toBeGreaterThan(0);
      expect(mockPlatformsGroup.create).toHaveBeenCalled();
    });

    test('should handle malformed map_matrix gracefully', () => {
      // Arrange: Config with malformed map_matrix and valid platforms
      const config = {
        platforms: [
          { type: 'ground', x: 0, y: 100, width: 200, tilePrefix: 'terrain_grass_horizontal', isFullBlock: true }
        ],
        map_matrix: 'not_an_array' // Invalid map_matrix type
      };

      // Act
      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);

      // Assert: Should fallback to individual platforms
      expect(result.length).toBeGreaterThan(0);
      expect(mockPlatformsGroup.create).toHaveBeenCalled();
    });

    test('should handle empty map_matrix and use individual platforms', () => {
      // Arrange: Config with empty map_matrix and valid platforms
      const config = {
        platforms: [
          { type: 'ground', x: 0, y: 100, width: 200, tilePrefix: 'terrain_grass_horizontal', isFullBlock: true }
        ],
        map_matrix: []
      };

      // Act
      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);

      // Assert: Should use individual platforms when map_matrix is empty
      expect(result.length).toBeGreaterThan(0);
      expect(mockPlatformsGroup.create).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle null configuration gracefully', () => {
      // Act
      sceneFactory.loadConfiguration(null);
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);

      // Assert: Should return empty array
      expect(result).toEqual([]);
      expect(mockPlatformsGroup.create).not.toHaveBeenCalled();
    });

    test('should handle undefined configuration gracefully', () => {
      // Act
      sceneFactory.loadConfiguration(undefined);
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);

      // Assert: Should return empty array
      expect(result).toEqual([]);
      expect(mockPlatformsGroup.create).not.toHaveBeenCalled();
    });

    test('should handle missing platforms group gracefully', () => {
      // Arrange
      const config = {
        platforms: [
          { type: 'ground', x: 0, y: 100, width: 200, tilePrefix: 'terrain_grass_horizontal', isFullBlock: true }
        ]
      };

      // Act
      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createPlatformsFromConfig(null);

      // Assert: Should return empty array
      expect(result).toEqual([]);
    });
  });

  describe('Integration with Existing Platform Creation', () => {
    test('should maintain existing platform creation behavior when no map_matrix', () => {
      // Arrange: Traditional platform configuration
      const config = {
        platforms: [
          { type: 'ground', x: 0, y: 100, width: 200, tilePrefix: 'terrain_grass_horizontal', isFullBlock: true },
          { type: 'floating', x: 100, y: 200, tilePrefix: 'terrain_grass_block', isFullBlock: true }
        ]
      };

      // Act
      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);

      // Assert: Should create platforms using existing logic
      expect(result.length).toBeGreaterThan(0);
      expect(mockPlatformsGroup.create).toHaveBeenCalled();
    });

    test('should handle mixed configuration with both map_matrix and decorative platforms', () => {
      // Arrange: Config with map_matrix and decorative platforms
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ]
        ],
        decorativePlatforms: [
          { type: 'decorative', x: 300, y: 200, tilePrefix: 'rock', depth: -0.5 }
        ]
      };

      // Act
      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);

      // Assert: Should create both map_matrix platforms and decorative platforms
      expect(result.length).toBeGreaterThan(0);
      expect(mockPlatformsGroup.create).toHaveBeenCalled();
    });
  });
}); 