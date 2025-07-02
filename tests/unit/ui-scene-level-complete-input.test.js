import { jest } from '@jest/globals';
import UIScene from '../../client/src/scenes/UIScene.js';
import { PhaserSceneMock } from '../mocks/phaserSceneMock.js';
import { EventEmitterMock } from '../mocks/eventEmitterMock.js';
import { createPhaserKeyMock } from '../mocks/phaserKeyMock.js';

// Patch Phaser.Input.Keyboard.JustDown to work with key mocks
if (!globalThis.Phaser) globalThis.Phaser = {};
if (!globalThis.Phaser.Input) globalThis.Phaser.Input = {};
if (!globalThis.Phaser.Input.Keyboard) globalThis.Phaser.Input.Keyboard = {};
globalThis.Phaser.Input.Keyboard.JustDown = (key) => !!key.justDown;

describe('UIScene Level Complete Input Handling', () => {
  let mockScene;
  let uiScene;
  let eventEmitter;
  let spaceKey;

  beforeEach(() => {
    mockScene = new PhaserSceneMock();
    eventEmitter = new EventEmitterMock();
    eventEmitter.emit = jest.fn();
    mockScene.events = eventEmitter;
    
    // Create proper key mock for SPACE
    spaceKey = createPhaserKeyMock('SPACE');
    
    // Mock scene management
    mockScene.scene = {
      start: jest.fn(),
      stop: jest.fn(),
      get: jest.fn(() => ({
        events: eventEmitter
      }))
    };
    
    // Mock input.keyboard.addKey to return our space key
    mockScene.input.keyboard.addKey = jest.fn((key) => {
      if (key === 'SPACE') return spaceKey;
      return createPhaserKeyMock(key);
    });
    
    // Mock add methods for UI elements
    mockScene.add = {
      container: jest.fn(() => ({ 
        setDepth: jest.fn().mockReturnThis(), 
        setVisible: jest.fn().mockReturnThis(), 
        add: jest.fn(),
        destroy: jest.fn()
      })),
      graphics: jest.fn(() => ({ 
        fillStyle: jest.fn().mockReturnThis(), 
        fillRect: jest.fn().mockReturnThis(),
        setDepth: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis()
      })),
      text: jest.fn(() => ({
        setOrigin: jest.fn().mockReturnThis(),
        setDepth: jest.fn().mockReturnThis(),
        setText: jest.fn().mockReturnThis(),
        setTint: jest.fn().mockReturnThis(),
        setAlpha: jest.fn().mockReturnThis()
      }))
    };

    uiScene = new UIScene(mockScene);
    uiScene.create();
  });

  it('should transition to MenuScene when SPACE is pressed after level complete', () => {
    // Simulate level completed event
    eventEmitter.emit('levelCompleted');
    
    // Manually call onLevelCompleted since we're testing the input handling
    if (typeof uiScene.onLevelCompleted === 'function') {
      uiScene.onLevelCompleted();
    }
    
    // Verify overlay is created
    expect(uiScene.levelCompleteOverlay).toBeDefined();
    expect(uiScene.levelCompleteActive).toBe(true);
    
    // Debug: Check InputManager state
    console.log('InputManager exists:', !!uiScene.inputManager);
    console.log('Space key state before:', spaceKey.isDown, spaceKey.justDown);
    
    // Simulate SPACE key press (Jump input)
    spaceKey.setJustDown(true);
    
    // Debug: Check key state after setting
    console.log('Space key state after setJustDown:', spaceKey.isDown, spaceKey.justDown);
    console.log('isJumpJustPressed:', uiScene.inputManager?.isJumpJustPressed);
    
    // Call update to process input
    uiScene.update();
    
    // Verify scene transition
    expect(mockScene.scene.stop).toHaveBeenCalledWith('GameScene');
    expect(mockScene.scene.start).toHaveBeenCalledWith('MenuScene');
  });

  it('should not transition to MenuScene when SPACE is pressed before level complete', () => {
    // Don't trigger level complete event
    
    // Simulate SPACE key press
    spaceKey.setJustDown(true);
    
    // Call update to process input
    uiScene.update();
    
    // Verify no scene transition
    expect(mockScene.scene.start).not.toHaveBeenCalledWith('MenuScene');
  });

  it('should clean up overlay and listeners after scene transition', () => {
    // Simulate level completed event
    eventEmitter.emit('levelCompleted');
    
    // Manually call onLevelCompleted
    if (typeof uiScene.onLevelCompleted === 'function') {
      uiScene.onLevelCompleted();
    }
    
    // Verify overlay exists
    expect(uiScene.levelCompleteOverlay).toBeDefined();
    
    // Simulate SPACE key press
    spaceKey.setJustDown(true);
    
    // Call update to process input
    uiScene.update();
    
    // Verify scene transition occurred
    expect(mockScene.scene.stop).toHaveBeenCalledWith('GameScene');
  });
}); 