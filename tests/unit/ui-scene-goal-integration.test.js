// TDD Red Phase: UIScene Goal Integration
// Tests for integrating goal data from GameScene to MapOverlay

import '../mocks/phaserMock.js';
import { PhaserSceneMock } from '../mocks/phaserSceneMock.js';
import { jest } from '@jest/globals';
import UIScene from '../../client/src/scenes/UIScene.js';

describe('UIScene Goal Integration', () => {
  let uiScene;
  let mockScene;

  beforeEach(() => {
    mockScene = new PhaserSceneMock();
    
    // Mock GameScene with goal tiles
    const mockGameScene = {
      levelWidth: 2000,
      levelHeight: 1500,
      platforms: {
        children: {
          entries: [
            { x: 0, y: 2900, width: 6000, height: 64 }
          ]
        }
      },
      coins: {
        children: {
          entries: [
            { x: 400, y: 850 },
            { x: 500, y: 850 }
          ]
        }
      },
      goalTiles: {
        children: {
          entries: [
            { x: 4000, y: 850, active: true, visible: true }
          ]
        }
      },
      player: {
        x: 200,
        y: 870
      }
    };

    // Mock scene.get to return GameScene
    mockScene.scene.get = jest.fn((sceneName) => {
      if (sceneName === 'GameScene') {
        return mockGameScene;
      }
      return null;
    });

    uiScene = new UIScene(mockScene);
    uiScene.scene = mockScene.scene;
    uiScene.registry = mockScene.registry;
    uiScene.time = mockScene.time;
    uiScene.add = mockScene.add;
  });

  describe('Goal Data Integration in UIScene.create()', () => {
    test('should create map overlay with goal data access', () => {
      // Act
      uiScene.create();
      
      // Assert
      expect(uiScene.mapOverlay).toBeDefined();
      expect(mockScene.scene.get).toHaveBeenCalledWith('GameScene');
    });

    test('should handle missing goalTiles gracefully', () => {
      // Arrange
      const mockGameSceneWithoutGoals = {
        levelWidth: 2000,
        levelHeight: 1500,
        platforms: { children: { entries: [] } },
        coins: { children: { entries: [] } },
        player: { x: 200, y: 870 }
      };
      mockScene.scene.get = jest.fn((sceneName) => {
        if (sceneName === 'GameScene') {
          return mockGameSceneWithoutGoals;
        }
        return null;
      });
      
      // Act & Assert - should not throw
      expect(() => uiScene.create()).not.toThrow();
      expect(uiScene.mapOverlay).toBeDefined();
    });
  });
}); 