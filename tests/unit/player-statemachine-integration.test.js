import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Mock Phaser
jest.unstable_mockModule('phaser', () => ({
  default: {
    Physics: {
      Arcade: {
        Sprite: class {},
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
    const scene = {
      add: { existing: jest.fn() },
      physics: { add: { existing: jest.fn() } },
    };
    player = new Player(scene, 100, 100, 'player');
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
    const time = 123;
    const delta = 456;
    player.update(time, delta);
    expect(player.stateMachine.update).toHaveBeenCalledWith(time, delta);
  });
}); 