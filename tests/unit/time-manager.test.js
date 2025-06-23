import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('Task 3.1: TimeManager Class', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const timeManagerPath = join(__dirname, '../../client/src/systems/TimeManager.js');
  let TimeManager;
  let sceneMock;
  let playerMock;

  beforeAll(async () => {
    if (existsSync(timeManagerPath)) {
      const module = await import(timeManagerPath);
      TimeManager = module.default;
    } else {
      TimeManager = class { constructor() {} register() {} update() {} };
    }
  });

  beforeEach(() => {
    sceneMock = {
        time: {
            now: Date.now()
        }
    };
    playerMock = {
      x: 100,
      y: 200,
      body: { velocity: { x: 10, y: -5 } },
      active: true,
      visible: true,
      anims: { currentAnim: { key: 'player-run' } }
    };
  });

  test('TimeManager.js class file should exist', () => {
    expect(existsSync(timeManagerPath)).toBe(true);
  });

  test('should be instantiated with a scene', () => {
    const manager = new TimeManager(sceneMock);
    expect(manager).toBeDefined();
    expect(manager.scene).toBe(sceneMock);
    expect(manager.stateBuffer).toBeInstanceOf(Array);
    expect(manager.isRewinding).toBe(false);
  });

  test('should register an object to be managed', () => {
    const manager = new TimeManager(sceneMock);
    manager.register(playerMock);
    expect(manager.managedObjects.has(playerMock)).toBe(true);
  });

  test('update() should record the state of registered objects', () => {
    const manager = new TimeManager(sceneMock);
    manager.register(playerMock);
    manager.update(sceneMock.time.now, 16); // Simulate one frame
    
    expect(manager.stateBuffer.length).toBe(1);
    const recordedState = manager.stateBuffer[0];
    expect(recordedState.target).toBe(playerMock);
    expect(recordedState.state.x).toBe(playerMock.x);
  });

  test('toggleRewind() should switch the isRewinding flag', () => {
    const manager = new TimeManager(sceneMock);
    expect(manager.isRewinding).toBe(false);
    manager.toggleRewind(true);
    expect(manager.isRewinding).toBe(true);
    manager.toggleRewind(false);
    expect(manager.isRewinding).toBe(false);
  });

  test('update() should apply the last state to the target when rewinding', () => {
    const manager = new TimeManager(sceneMock);
    // Manually add a state to the buffer for testing
    const testState = {
      x: 50, y: 150, velocityX: -10, velocityY: 5, 
      animation: 'player-idle', isAlive: true, isVisible: true
    };
    manager.stateBuffer.push({ target: playerMock, state: testState });

    // Enable rewind
    manager.toggleRewind(true);
    // Mock player's body methods
    playerMock.body.setAllowGravity = jest.fn();
    playerMock.body.setVelocity = jest.fn();
    playerMock.anims.play = jest.fn();

    manager.update(sceneMock.time.now, 16); // Simulate one frame

    expect(playerMock.x).toBe(testState.x);
    expect(playerMock.y).toBe(testState.y);
    expect(playerMock.body.setAllowGravity).toHaveBeenCalledWith(false);
    expect(playerMock.body.setVelocity).toHaveBeenCalledWith(testState.velocityX, testState.velocityY);
  });
}); 