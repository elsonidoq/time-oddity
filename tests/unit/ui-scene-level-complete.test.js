import { jest } from '@jest/globals';
import UIScene from '../../client/src/scenes/UIScene.js';
import { PhaserSceneMock } from '../mocks/phaserSceneMock.js';
import { EventEmitterMock } from '../mocks/eventEmitterMock.js';

describe('UIScene Level Complete Overlay', () => {
  let mockScene;
  let uiScene;
  let eventEmitter;

  beforeEach(() => {
    mockScene = new PhaserSceneMock();
    eventEmitter = new EventEmitterMock();
    eventEmitter.emit = jest.fn();
    mockScene.events = eventEmitter;
    mockScene.add = {
      container: jest.fn(() => ({ setDepth: jest.fn().mockReturnThis(), setVisible: jest.fn().mockReturnThis(), add: jest.fn() })),
      graphics: jest.fn(() => ({ fillStyle: jest.fn().mockReturnThis(), fillRect: jest.fn().mockReturnThis(), setDepth: jest.fn().mockReturnThis(), setAlpha: jest.fn().mockReturnThis() })),
      text: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis(), setDepth: jest.fn().mockReturnThis(), setAlpha: jest.fn().mockReturnThis() })),
    };
    mockScene.sys = { events: { on: jest.fn() } };
    uiScene = new UIScene(mockScene);
    uiScene.scene = { get: jest.fn(() => ({ events: eventEmitter })) };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should display a level complete overlay when levelCompleted is emitted', () => {
    // Simulate UIScene create
    uiScene.create();
    // Simulate event emission
    eventEmitter.emit('levelCompleted');
    // Call the handler directly (since eventEmitter is a mock)
    if (typeof uiScene.onLevelCompleted === 'function') {
      uiScene.onLevelCompleted();
    }
    // Assert overlay was created and set to correct depth
    expect(mockScene.add.container).toHaveBeenCalled();
    const overlay = uiScene.levelCompleteOverlay;
    expect(overlay).toBeDefined();
    expect(overlay.setDepth).toHaveBeenCalledWith(1002);
    expect(overlay.setVisible).toHaveBeenCalledWith(true);
  });

  it('should only show the overlay once per levelCompleted event', () => {
    uiScene.create();
    if (typeof uiScene.onLevelCompleted === 'function') {
      uiScene.onLevelCompleted();
      uiScene.onLevelCompleted();
    }
    // Overlay should only be created once
    expect(mockScene.add.container).toHaveBeenCalledTimes(1);
  });
}); 