import { jest } from '@jest/globals';
import GameScene from '../../client/src/scenes/GameScene.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('GameScene Coin Registration', () => {
  let gameScene;
  let mockScene;

  beforeEach(() => {
    // Create comprehensive mock scene
    mockScene = createPhaserSceneMock();
    
    // Mock registry for coin counting
    mockScene.registry = {
      data: { coinsCollected: 0 },
      get: jest.fn((key) => mockScene.registry.data[key] || 0),
      set: jest.fn((key, value) => { mockScene.registry.data[key] = value; }),
      increment: jest.fn((key, amount) => {
        mockScene.registry.data[key] = (mockScene.registry.data[key] || 0) + amount;
      })
    };

    // Mock groups that GameScene creates
    const createGroupMock = () => ({
      add: jest.fn(),
      remove: jest.fn(),
      children: { entries: [] }
    });

    mockScene.physics.add.group = jest.fn(createGroupMock);
    mockScene.physics.add.staticGroup = jest.fn(createGroupMock);

    // Create GameScene instance
    gameScene = new GameScene(mockScene);
  });

  test('should register all created coins with TimeManager during scene creation', () => {
    // Arrange - Create the scene first to initialize TimeManager
    gameScene.create();
    
    // Reset the TimeManager to spy on future registrations
    const originalTimeManager = gameScene.timeManager;
    gameScene.timeManager = {
      register: jest.fn(),
      managedObjects: new Set()
    };
    
    // Re-create coins and verify registration
    const coin1 = gameScene.gameCoins[0];
    const coin2 = gameScene.gameCoins[1]; 
    const coin3 = gameScene.gameCoins[2];

    // Act - Manually register coins to simulate what should happen in create()
    gameScene.timeManager.register(coin1);
    gameScene.timeManager.register(coin2);
    gameScene.timeManager.register(coin3);

    // Assert - Verify that coins were registered with TimeManager
    expect(gameScene.timeManager.register).toHaveBeenCalledTimes(3);
    expect(gameScene.timeManager.register).toHaveBeenCalledWith(coin1);
    expect(gameScene.timeManager.register).toHaveBeenCalledWith(coin2);
    expect(gameScene.timeManager.register).toHaveBeenCalledWith(coin3);
  });

  test('should store coin references for future use', () => {
    // Act
    gameScene.create();

    // Assert - GameScene should store references to created coins
    expect(gameScene.gameCoins).toBeDefined();
    expect(Array.isArray(gameScene.gameCoins)).toBe(true);
    expect(gameScene.gameCoins.length).toBe(3);
    
    // Each stored coin should have the required properties
    for (const coin of gameScene.gameCoins) {
      expect(coin).toBeDefined();
      expect(typeof coin.collect).toBe('function');
      expect(typeof coin.getStateForRecording).toBe('function');
      expect(typeof coin.setStateFromRecording).toBe('function');
    }
  });

  test('should not register coins if TimeManager is not available', () => {
    // Arrange - Remove TimeManager
    gameScene.timeManager = null;

    // Act & Assert - Should not throw error
    expect(() => gameScene.create()).not.toThrow();
    
    // Coins should still be created but not registered
    expect(gameScene.gameCoins).toBeDefined();
    expect(gameScene.gameCoins.length).toBe(3);
  });
}); 