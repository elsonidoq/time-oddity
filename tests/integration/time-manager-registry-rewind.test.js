import { jest } from '@jest/globals';
import TimeManager from '../../client/src/systems/TimeManager.js';
import Coin from '../../client/src/entities/Coin.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('TimeManager Registry Rewind Integration', () => {
  let timeManager;
  let mockScene;
  let coin1, coin2, coin3;

  beforeEach(() => {
    // Create comprehensive mock scene with registry
    mockScene = createPhaserSceneMock();
    mockScene.registry = {
      data: { coinsCollected: 0 },
      get: jest.fn((key) => mockScene.registry.data[key] || 0),
      set: jest.fn((key, value) => { 
        mockScene.registry.data[key] = value;
        console.log(`[Registry] Set ${key} to ${value}`);
      }),
      increment: jest.fn((key, amount) => {
        mockScene.registry.data[key] = (mockScene.registry.data[key] || 0) + amount;
        console.log(`[Registry] Incremented ${key} by ${amount} to ${mockScene.registry.data[key]}`);
      })
    };

    // Create coins physics group
    mockScene.coins = {
      add: jest.fn(),
      remove: jest.fn()
    };

    timeManager = new TimeManager(mockScene);
  });

  test('should record coinsCollected value in state snapshots', () => {
    // Arrange - Create coins and collect some
    coin1 = new Coin(mockScene, 100, 100, 'tiles');
    coin2 = new Coin(mockScene, 200, 200, 'tiles');
    coin3 = new Coin(mockScene, 300, 300, 'tiles');
    
    timeManager.register(coin1);
    timeManager.register(coin2);
    timeManager.register(coin3);

    // Collect first coin
    coin1.collect();
    expect(mockScene.registry.get('coinsCollected')).toBe(1);

    // Record a snapshot
    timeManager.handleRecord(1000);
    
    // Verify snapshot contains coinsCollected value
    expect(timeManager.stateBuffer.length).toBe(1);
    expect(timeManager.stateBuffer[0].coinsCollected).toBe(1);
  });

  test('should restore coinsCollected value during rewind', () => {
    // Arrange - Create coins and collect some
    coin1 = new Coin(mockScene, 100, 100, 'tiles');
    coin2 = new Coin(mockScene, 200, 200, 'tiles');
    coin3 = new Coin(mockScene, 300, 300, 'tiles');
    
    timeManager.register(coin1);
    timeManager.register(coin2);
    timeManager.register(coin3);

    // Collect first coin and record snapshot
    coin1.collect();
    timeManager.handleRecord(1000);
    
    // Collect second coin and record another snapshot
    coin2.collect();
    timeManager.handleRecord(1050);
    
    // Verify we have 2 coins collected
    expect(mockScene.registry.get('coinsCollected')).toBe(2);
    expect(timeManager.stateBuffer.length).toBe(2);
    expect(timeManager.stateBuffer[1].coinsCollected).toBe(2);

    // Act - Rewind to first snapshot
    timeManager.toggleRewind(true);
    timeManager.playbackTimestamp = 1000;
    timeManager.applyFrame(timeManager.stateBuffer[0]);

    // Assert - Registry should be restored to 1
    expect(mockScene.registry.get('coinsCollected')).toBe(1);
  });

  test('should handle multiple rewinds correctly', () => {
    // Arrange - Create coins and collect progressively
    coin1 = new Coin(mockScene, 100, 100, 'tiles');
    coin2 = new Coin(mockScene, 200, 200, 'tiles');
    coin3 = new Coin(mockScene, 300, 300, 'tiles');
    
    timeManager.register(coin1);
    timeManager.register(coin2);
    timeManager.register(coin3);

    // Record initial state (0 coins)
    timeManager.handleRecord(1000);
    
    // Collect first coin
    coin1.collect();
    timeManager.handleRecord(1050);
    
    // Collect second coin
    coin2.collect();
    timeManager.handleRecord(1100);
    
    // Collect third coin
    coin3.collect();
    timeManager.handleRecord(1150);

    // Verify final state
    expect(mockScene.registry.get('coinsCollected')).toBe(3);
    expect(timeManager.stateBuffer.length).toBe(4);

    // Act - Rewind to different points
    timeManager.toggleRewind(true);
    
    // Rewind to 2 coins collected
    timeManager.playbackTimestamp = 1100;
    timeManager.applyFrame(timeManager.stateBuffer[2]);
    expect(mockScene.registry.get('coinsCollected')).toBe(2);
    
    // Rewind to 1 coin collected
    timeManager.playbackTimestamp = 1050;
    timeManager.applyFrame(timeManager.stateBuffer[1]);
    expect(mockScene.registry.get('coinsCollected')).toBe(1);
    
    // Rewind to 0 coins collected
    timeManager.playbackTimestamp = 1000;
    timeManager.applyFrame(timeManager.stateBuffer[0]);
    expect(mockScene.registry.get('coinsCollected')).toBe(0);
  });

  test('should handle rewind when no coins are collected', () => {
    // Arrange - Create coins but don't collect any
    coin1 = new Coin(mockScene, 100, 100, 'tiles');
    coin2 = new Coin(mockScene, 200, 200, 'tiles');
    
    timeManager.register(coin1);
    timeManager.register(coin2);

    // Record snapshot with 0 coins
    timeManager.handleRecord(1000);
    
    // Manually set registry to simulate previous collection
    mockScene.registry.set('coinsCollected', 5);
    expect(mockScene.registry.get('coinsCollected')).toBe(5);

    // Act - Rewind to snapshot
    timeManager.toggleRewind(true);
    timeManager.playbackTimestamp = 1000;
    timeManager.applyFrame(timeManager.stateBuffer[0]);

    // Assert - Registry should be restored to 0
    expect(mockScene.registry.get('coinsCollected')).toBe(0);
  });
}); 