import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('Task 2.6: IdleState Class', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const idleStatePath = join(__dirname, '../../client/src/entities/states/IdleState.js');
  let IdleState;
  let player;
  let state;

  beforeAll(async () => {
    if (existsSync(idleStatePath)) {
      const stateModule = await import(idleStatePath);
      IdleState = stateModule.default;
    } else {
      IdleState = class { constructor(p) { this.player = p; } enter() {} execute() {} };
    }
  });

  beforeEach(() => {
    player = {
      anims: { play: jest.fn() },
      body: { 
        velocity: { x: 0, y: 0 }, 
        onFloor: jest.fn().mockReturnValue(true),
        setVelocityX: jest.fn(),
      },
      inputManager: {
        left: false,
        right: false,
        up: false,
      },
      stateMachine: { setState: jest.fn() },
    };
    state = new IdleState(player);
  });

  test('IdleState class file should exist', () => {
    expect(existsSync(idleStatePath)).toBe(true);
  });

  test('enter() should play idle animation', () => {
    state.enter();
    expect(player.anims.play).toHaveBeenCalledWith('player-idle', true);
  });

  test('execute() should transition to RunState if moving left', () => {
    player.inputManager.left = true;
    state.execute();
    expect(player.stateMachine.setState).toHaveBeenCalledWith('run');
  });

  test('execute() should transition to RunState if moving right', () => {
    player.inputManager.right = true;
    state.execute();
    expect(player.stateMachine.setState).toHaveBeenCalledWith('run');
  });

  test('execute() should transition to JumpState if jumping', () => {
    player.inputManager.up = true;
    state.execute();
    expect(player.stateMachine.setState).toHaveBeenCalledWith('jump');
  });

  test('execute() should transition to FallState if not on floor', () => {
    player.body.onFloor.mockReturnValue(false);
    state.execute();
    expect(player.stateMachine.setState).toHaveBeenCalledWith('fall');
  });
}); 