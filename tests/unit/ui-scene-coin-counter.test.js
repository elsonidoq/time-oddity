import { jest } from '@jest/globals';
import UIScene from '../../client/src/scenes/UIScene.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

function setupSceneMocks(scene) {
  scene.add = {
    graphics: jest.fn(() => ({
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis(),
      clear: jest.fn().mockReturnThis()
    })),
    text: jest.fn(() => ({
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    }))
  };
  
  scene.registry = {
    get: jest.fn(() => 0),
    set: jest.fn()
  };
  
  scene.time = { now: 100 };
  scene.input = { 
    keyboard: { 
      addKey: jest.fn(() => ({ isDown: false, isUp: true })) 
    } 
  };
  scene.scene = { get: jest.fn(() => null) };
  scene.events = { emit: jest.fn() };
}

describe('Task 04.03: UIScene Coin Counter', () => {
  let scene;
  let mockCoinText;

  beforeEach(() => {
    scene = new UIScene();
    setupSceneMocks(scene);
    
    // Create a mock text object for coin counter
    mockCoinText = {
      setOrigin: jest.fn().mockReturnThis(),
      setText: jest.fn().mockReturnThis(),
      text: 'Coins: 0'
    };
    
    // Mock text creation to return our mock coin text for the coin counter
    scene.add.text = jest.fn((x, y, text, style) => {
      if (text && text.includes('Coins')) {
        return mockCoinText;
      }
      return {
        setOrigin: jest.fn().mockReturnThis(),
        setTint: jest.fn().mockReturnThis(),
        setAlpha: jest.fn().mockReturnThis()
      };
    });
  });

  test('should create coin counter text in create() method', () => {
    // Act
    scene.create();

    // Assert - Verify coin counter text was created at correct position with correct initial text
    expect(scene.add.text).toHaveBeenCalledWith(
      180, 50, 'Coins: 0', 
      { font: '16px Arial', fill: '#333333' }
    );
    
    // Verify the coin counter is stored as a property
    expect(scene.coinCounter).toBeDefined();
  });

  test('should update coin counter display when coinsCollected registry changes', () => {
    // Arrange
    scene.registry.get = jest.fn((key) => {
      if (key === 'coinsCollected') return 5;
      return 0;
    });
    
    scene.create();

    // Act
    scene.update();

    // Assert - Verify coin counter text was updated to show 5 coins
    expect(mockCoinText.setText).toHaveBeenCalledWith('Coins: 5');
  });

  test('should handle missing coinsCollected registry gracefully', () => {
    // Arrange
    scene.registry.get = jest.fn(() => undefined);
    
    scene.create();

    // Act
    scene.update();

    // Assert - Should default to 0 when registry value is undefined
    expect(mockCoinText.setText).toHaveBeenCalledWith('Coins: 0');
  });

  test('should handle null registry gracefully', () => {
    // Arrange
    scene.registry = null;
    
    scene.create();

    // Act
    scene.update();

    // Assert - Should not throw error and default to 0
    expect(mockCoinText.setText).toHaveBeenCalledWith('Coins: 0');
  });

  test('should update coin counter every frame during update cycle', () => {
    // Arrange
    let coinCount = 0;
    scene.registry.get = jest.fn(() => coinCount);
    
    scene.create();

    // Act - Simulate multiple update cycles with changing coin count
    scene.update();
    expect(mockCoinText.setText).toHaveBeenCalledWith('Coins: 0');

    coinCount = 3;
    scene.update();
    expect(mockCoinText.setText).toHaveBeenCalledWith('Coins: 3');

    coinCount = 10;
    scene.update();
    expect(mockCoinText.setText).toHaveBeenCalledWith('Coins: 10');

    // Assert - Verify setText was called for each update
    expect(mockCoinText.setText).toHaveBeenCalledTimes(3);
  });

  test('should position coin counter correctly relative to other UI elements', () => {
    // Act
    scene.create();

    // Assert - Verify positioning is consistent with existing pattern
    const textCalls = scene.add.text.mock.calls;
    const coinCounterCall = textCalls.find(call => call[2] && call[2].includes('Coins'));
    
    expect(coinCounterCall).toBeDefined();
    expect(coinCounterCall[0]).toBe(180); // x coordinate
    expect(coinCounterCall[1]).toBe(50);  // y coordinate (same as dash/pulse)
  });

  test('should use consistent styling with other text elements', () => {
    // Act
    scene.create();

    // Assert - Verify styling matches dash/pulse indicators
    const textCalls = scene.add.text.mock.calls;
    const coinCounterCall = textCalls.find(call => call[2] && call[2].includes('Coins'));
    
    expect(coinCounterCall[3]).toEqual({
      font: '16px Arial',
      fill: '#333333'
    });
  });

  test('should not break when coinCounter text object is missing', () => {
    // Arrange
    scene.create();
    scene.coinCounter = null; // Simulate missing coin counter object

    // Act & Assert - Should not throw error
    expect(() => scene.update()).not.toThrow();
  });
}); 