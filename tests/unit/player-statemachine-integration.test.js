import '../mocks/phaserMock.js';
import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Scene as MockScene } from '../mocks/phaserMock.js';

// Mock Phaser
jest.unstable_mockModule('phaser', () => ({
  default: {
    Physics: {
      Arcade: {
        Sprite: class {
          constructor(scene, x, y, texture, frame) {
            this.scene = scene;
            this.x = x;
            this.y = y;
            this.texture = texture;
            this.frame = frame;
            this.body = {
              setSize: jest.fn(),
              setOffset: jest.fn()
            };
            this.setOrigin = jest.fn();
            this.setActive = jest.fn();
            this.setVisible = jest.fn();
          }
        },
      },
    },
  },
}));

// Use unstable_mockModule for ESM support
jest.unstable_mockModule(join(dirname(fileURLToPath(import.meta.url)), '../../client/src/systems/StateMachine.js'), () => ({
  default: jest.fn().mockImplementation(() => {
    const mockInstance = {
      addState: jest.fn(),
      setState: jest.fn(),
      update: jest.fn(),
    };
    // Ensure addState is chainable
    mockInstance.addState.mockReturnThis();
    return mockInstance;
  }),
}));

describe('Task 2.10: Connect StateMachine to Player', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const playerPath = join(__dirname, '../../client/src/entities/Player.js');
  let Player;
  let StateMachine;
  let player;

  beforeAll(async () => {
    // Dynamically import modules after mocking
    const playerModule = await import(playerPath);
    Player = playerModule.default;
    const stateMachineModule = await import(join(__dirname, '../../client/src/systems/StateMachine.js'));
    StateMachine = stateMachineModule.default;
  });

  beforeEach(() => {
    // Clear mocks before each test
    StateMachine.mockClear();
    const scene = new MockScene('GameScene');
    scene.timeManager = { isRewinding: false };
    player = new Player(scene, 100, 100, 'player', undefined, undefined, scene);
    jest.spyOn(player.stateMachine, 'addState');
    jest.spyOn(player.stateMachine, 'setState');
    jest.spyOn(player.stateMachine, 'update');
  });

  test('Player should have a stateMachine instance', () => {
    expect(player.stateMachine).toBeDefined();
    expect(StateMachine).toHaveBeenCalledTimes(1);
  });

  test('Player constructor should initialize states in the state machine', () => {
    expect(player.stateMachine.addState).toHaveBeenCalledWith('idle', expect.any(Object));
    expect(player.stateMachine.addState).toHaveBeenCalledWith('run', expect.any(Object));
    expect(player.stateMachine.addState).toHaveBeenCalledWith('jump', expect.any(Object));
    expect(player.stateMachine.addState).toHaveBeenCalledWith('fall', expect.any(Object));
  });

  test('Player constructor should set the initial state to idle', () => {
    expect(player.stateMachine.setState).toHaveBeenCalledWith('idle');
  });

  test('Player update method should call stateMachine.update', () => {
    const player = new Player(scene, 0, 0, undefined, undefined, undefined, new MockScene());
    player.stateMachine.update = jest.fn();
    player.inputManager = {}; // Set inputManager so update doesn't return early
    const time = 123, delta = 456;
    player.update(time, delta);
    expect(player.stateMachine.update).toHaveBeenCalledWith(time, delta);
  });
});

describe('Task 8: Player state after rewind ends', () => {
  let Player;
  let StateMachine;
  let player;
  let scene;

  beforeAll(async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const playerPath = join(__dirname, '../../client/src/entities/Player.js');
    const playerModule = await import(playerPath);
    Player = playerModule.default;
    const stateMachineModule = await import(join(__dirname, '../../client/src/systems/StateMachine.js'));
    StateMachine = stateMachineModule.default;
  });

  beforeEach(() => {
    StateMachine.mockClear();
    scene = new MockScene('GameScene');
    scene.timeManager = { isRewinding: false };
    player = new Player(scene, 100, 100, 'player', undefined, undefined, scene);
    player.inputManager = {
      left: { isDown: false },
      right: { isDown: false },
      up: { isDown: false },
      down: { isDown: false },
    };
    jest.spyOn(player.stateMachine, 'setState');
    jest.spyOn(player.stateMachine, 'update');
  });

  test('should transition to idle after rewind ends if no movement keys are pressed', () => {
    // Simulate rewinding
    scene.timeManager.isRewinding = true;
    player.update(0, 16); // Should skip stateMachine.update
    expect(player.stateMachine.update).not.toHaveBeenCalled();
    // Rewind ends
    scene.timeManager.isRewinding = false;
    player.update(16, 16); // Should setState('idle'), but not call update
    expect(player.stateMachine.update).not.toHaveBeenCalled();
    expect(player.stateMachine.setState).toHaveBeenCalledWith('idle');
    // Next frame: normal update resumes
    player.update(32, 16);
    expect(player.stateMachine.update).toHaveBeenCalled();
  });

  test('should transition to run after rewind ends if movement key is pressed', () => {
    // Simulate rewinding
    scene.timeManager.isRewinding = true;
    player.update(0, 16);
    // Rewind ends, right key pressed
    scene.timeManager.isRewinding = false;
    player.inputManager.right.isDown = true;
    player.update(16, 16);
    expect(player.stateMachine.update).not.toHaveBeenCalled();
    expect(player.stateMachine.setState).toHaveBeenCalledWith('run');
    // Next frame: normal update resumes
    player.update(32, 16);
    expect(player.stateMachine.update).toHaveBeenCalled();
  });
}); 