import { jest } from '@jest/globals';
import Coin from '../../client/src/entities/Coin.js';
import TimeManager from '../../client/src/systems/TimeManager.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('Coin Time Reversal Integration', () => {
  let timeManager;
  let mockScene;
  let coin;

  beforeEach(() => {
    // Create mock scene with proper physics group and registry
    mockScene = createPhaserSceneMock();
    mockScene.registry = {
      data: { coinsCollected: 0 },
      get: jest.fn((key) => mockScene.registry.data[key] || 0),
      set: jest.fn((key, value) => { mockScene.registry.data[key] = value; }),
      increment: jest.fn((key, amount) => {
        mockScene.registry.data[key] = (mockScene.registry.data[key] || 0) + amount;
      })
    };
    
    // Create TimeManager
    timeManager = new TimeManager(mockScene);
    
    // Create a coins group for collision detection
    mockScene.coins = {
      add: jest.fn(),
      remove: jest.fn()
    };
  });

  test('should register coin with TimeManager for time reversal', () => {
    // Arrange
    coin = new Coin(mockScene, 100, 100, 'tiles');
    
    // Act - Manually register coin (simulating GameScene behavior)
    timeManager.register(coin);
    
    // Assert - Coin should now be registered with TimeManager
    expect(timeManager.managedObjects.has(coin)).toBe(true);
  });

  test('should record coin collection state during time snapshots', () => {
    // Arrange
    coin = new Coin(mockScene, 100, 100, 'tiles');
    timeManager.register(coin);
    
    // Simulate time passing and recording
    const currentTime = 1000;
    timeManager.handleRecord(currentTime);
    
    // Act - Collect the coin
    coin.collect();
    
    // Record new state after collection
    timeManager.handleRecord(currentTime + 100);
    
    // Assert
    expect(timeManager.stateBuffer.length).toBe(2);
    const beforeCollection = timeManager.stateBuffer[0].states.find(s => s.target === coin);
    const afterCollection = timeManager.stateBuffer[1].states.find(s => s.target === coin);
    
    expect(beforeCollection.state.isCollected).toBe(false);
    expect(afterCollection.state.isCollected).toBe(true);
  });

  test('should restore collected coins during time reversal', () => {
    // Arrange
    coin = new Coin(mockScene, 100, 100, 'tiles');
    timeManager.register(coin);
    
    // Record initial state
    timeManager.handleRecord(1000);
    
    // Collect coin
    coin.collect();
    expect(coin.isCollected).toBe(true);
    expect(coin.sprite).toBe(null); // Sprite destroyed on collection
    
    // Record collected state
    timeManager.handleRecord(1100);
    
    // Act - Rewind to before collection
    timeManager.toggleRewind(true);
    const firstFrame = timeManager.stateBuffer[0];
    timeManager.applyFrame(firstFrame);
    
    // Assert - Coin should be uncollected and sprite recreated
    expect(coin.isCollected).toBe(false);
    expect(coin.sprite).not.toBe(null);
    expect(coin.sprite.visible).toBe(true);
    expect(mockScene.coins.add).toHaveBeenCalledWith(coin.sprite);
  });

  test('should handle multiple coins during time reversal', () => {
    // Arrange
    const coin1 = new Coin(mockScene, 100, 100, 'tiles');
    const coin2 = new Coin(mockScene, 200, 100, 'tiles');
    
    timeManager.register(coin1);
    timeManager.register(coin2);
    
    // Record initial state
    timeManager.handleRecord(1000);
    
    // Collect only first coin
    coin1.collect();
    expect(coin1.isCollected).toBe(true);
    expect(coin2.isCollected).toBe(false);
    
    // Record state after partial collection
    timeManager.handleRecord(1100);
    
    // Act - Rewind to initial state
    timeManager.toggleRewind(true);
    const initialFrame = timeManager.stateBuffer[0];
    timeManager.applyFrame(initialFrame);
    
    // Assert - First coin restored, second coin unchanged
    expect(coin1.isCollected).toBe(false);
    expect(coin1.sprite).not.toBe(null);
    expect(coin2.isCollected).toBe(false);
    expect(coin2.sprite).not.toBe(null);
  });

  test('should restore coin registry counter during time reversal', () => {
    // Arrange
    coin = new Coin(mockScene, 100, 100, 'tiles');
    timeManager.register(coin);
    
    const initialCoinsCollected = mockScene.registry.get('coinsCollected');
    
    // Record initial state
    timeManager.handleRecord(1000);
    
    // Collect coin (should increment counter)
    coin.collect();
    expect(mockScene.registry.get('coinsCollected')).toBe(initialCoinsCollected + 1);
    
    // Record collected state
    timeManager.handleRecord(1100);
    
    // Act - Rewind (counter should be restored to initial value)
    timeManager.toggleRewind(true);
    const initialFrame = timeManager.stateBuffer[0];
    timeManager.applyFrame(initialFrame);
    
    // Assert - Coin state restored AND counter restored (registry IS rewound)
    expect(coin.isCollected).toBe(false);
    expect(mockScene.registry.get('coinsCollected')).toBe(initialCoinsCollected);
  });
}); 