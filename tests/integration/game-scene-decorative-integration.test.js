import { jest } from '@jest/globals';
import GameScene from '../../client/src/scenes/GameScene.js';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('GameScene Decorative Platform Integration', () => {
  let mockScene;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    jest.clearAllMocks();
  });

  describe('Integration verification', () => {
    test('should have createDecorativePlatformsWithFactory method', () => {
      // Act
      const gameScene = new GameScene(mockScene);
      
      // Assert - Verify the method exists
      expect(typeof gameScene.createDecorativePlatformsWithFactory).toBe('function');
    });

    test('should include decorative platform creation in create sequence', () => {
      // Arrange
      const gameScene = new GameScene(mockScene);
      
      // Spy on the decorative platform method to verify it gets called
      const decorativeSpy = jest.spyOn(gameScene, 'createDecorativePlatformsWithFactory');
      
      // Act - Call create method which should trigger decorative platform creation
      gameScene.create();
      
      // Assert - Verify the method was called during scene creation
      expect(decorativeSpy).toHaveBeenCalled();
      
      // Cleanup
      decorativeSpy.mockRestore();
    });

    test('should handle decorative platform creation gracefully when no config exists', () => {
      // This test verifies that the integration doesn't break when decorative platforms aren't configured
      const gameScene = new GameScene(mockScene);
      
      // Act & Assert - Should not throw when create is called
      expect(() => {
        gameScene.create();
      }).not.toThrow();
      
      // Verify SceneFactory has the decorative platform method
      expect(typeof gameScene.sceneFactory.createDecorativePlatformsFromConfig).toBe('function');
    });

    test('SceneFactory should have decorative platform creation method', () => {
      // Act
      const sceneFactory = new SceneFactory(mockScene);
      
      // Assert - Verify the method exists in SceneFactory
      expect(typeof sceneFactory.createDecorativePlatformsFromConfig).toBe('function');
    });
  });
}); 