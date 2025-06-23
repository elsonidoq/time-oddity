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
    manager.update(sceneMock.time.now, 16);
    expect(manager.stateBuffer.length).toBe(1);
    const recordedState = manager.stateBuffer[0];
    expect(recordedState.states[0].target).toBe(playerMock);
    expect(recordedState.states[0].state.x).toBe(playerMock.x);
  });

  test('toggleRewind() should switch the isRewinding flag', () => {
    const manager = new TimeManager(sceneMock);
    expect(manager.isRewinding).toBe(false);
    manager.toggleRewind(true);
    expect(manager.isRewinding).toBe(true);
    manager.toggleRewind(false);
    expect(manager.isRewinding).toBe(false);
  });

  // test('update() should apply the last state to the target when rewinding', () => {
  //   manager.register(playerMock);
  //   // Simulate two recorded states for interpolation
  //   const testStateA = {
  //     x: 100,
  //     y: 200,
  //     velocityX: 0,
  //     velocityY: 0,
  //     animation: 'player-idle',
  //     isAlive: true,
  //     isVisible: true
  //   };
  //   const testStateB = {
  //     x: 50,
  //     y: 75,
  //     velocityX: 10,
  //     velocityY: -5,
  //     animation: 'player-run',
  //     isAlive: true,
  //     isVisible: true
  //   };
  //   const tA = sceneMock.time.now - 16;
  //   const tB = sceneMock.time.now;
  //   manager.stateBuffer.push({
  //     timestamp: tA,
  //     states: [{ target: playerMock, state: testStateA }]
  //   });
  //   manager.stateBuffer.push({
  //     timestamp: tB,
  //     states: [{ target: playerMock, state: testStateB }]
  //   });
  //   // Ensure setAllowGravity is mocked
  //   playerMock.body.setAllowGravity = jest.fn();
  //   playerMock.body.setVelocity = jest.fn();
  //   playerMock.anims.play = jest.fn();
  //   playerMock.setActive = jest.fn();
  //   playerMock.setVisible = jest.fn();
  //   manager.isRewinding = true;
  //   // Set playbackTimestamp between tA and tB for interpolation
  //   manager.playbackTimestamp = tA + (tB - tA) / 2;
  //   manager.update(sceneMock.time.now, 16); // Simulate one frame
  //   // The player's x/y should be between testStateA and testStateB
  //   expect(playerMock.x).toBeGreaterThan(testStateB.x);
  //   expect(playerMock.x).toBeLessThan(testStateA.x);
  //   expect(playerMock.y).toBeGreaterThan(testStateB.y);
  //   expect(playerMock.y).toBeLessThan(testStateA.y);
  //   expect(playerMock.body.setAllowGravity).toHaveBeenCalledWith(false);
  //   expect(playerMock.body.setVelocity).toHaveBeenCalledWith(
  //     expect.any(Number),
  //     expect.any(Number)
  //   );
  // });
}); 