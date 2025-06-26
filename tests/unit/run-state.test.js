import '../mocks/phaserMock.js';
import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createPhaserKeyMock } from '../mocks/phaserKeyMock.js';

let InputManager;

beforeAll(async () => {
  const { join, dirname } = await import('path');
  const { fileURLToPath } = await import('url');
  const { existsSync } = await import('fs');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const inputManagerPath = join(__dirname, '../../client/src/systems/InputManager.js');
  if (existsSync(inputManagerPath)) {
    const inputModule = await import(inputManagerPath);
    InputManager = inputModule.default;
  } else {
    InputManager = class { constructor(s) { this.scene = s; } update() {} };
  }
});

describe('Task 2.7: RunState Class', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const runStatePath = join(__dirname, '../../client/src/entities/states/RunState.js');
  let RunState;
  let player;
  let state;
  let scene;

  beforeAll(async () => {
    if (existsSync(runStatePath)) {
      const stateModule = await import(runStatePath);
      RunState = stateModule.default;
    } else {
      RunState = class { constructor(p) { this.player = p; } enter() {} execute() {} };
    }
  });

  beforeEach(() => {
    // Centralized key mocks
    const left = createPhaserKeyMock('LEFT');
    const right = createPhaserKeyMock('RIGHT');
    const up = createPhaserKeyMock('UP');
    // Minimal scene mock for InputManager
    scene = {
      input: {
        keyboard: {
          addKey: (key) => {
            if (key === 'LEFT') return left;
            if (key === 'RIGHT') return right;
            if (key === 'UP') return up;
            return createPhaserKeyMock(key);
          }
        }
      }
    };
    player = {
      anims: { play: jest.fn() },
      body: { 
        velocity: { x: 0, y: 0 }, 
        onFloor: jest.fn(() => true),
        setVelocityX: jest.fn(),
        setVelocityY: jest.fn(),
        setAllowGravity: jest.fn(),
      },
      inputManager: new InputManager(scene),
      stateMachine: { setState: jest.fn() },
      speed: 200,
      flipX: false,
      canDash: true,
      dashTimer: 0,
      scene: { time: { now: 0 } },
    };
    // Attach key mocks for direct test access
    player.inputManager.left = left;
    player.inputManager.right = right;
    player.inputManager.up = up;
    state = new RunState(player);
  });

  test('RunState class file should exist', () => {
    expect(existsSync(runStatePath)).toBe(true);
  });

  test('enter() should play run animation', () => {
    state.enter();
    expect(player.anims.play).toHaveBeenCalledWith('player-walk', true);
  });

  test('execute() should set velocity left and flip sprite', () => {
    player.inputManager.left.setDown();
    state.execute();
    expect(player.body.setVelocityX).toHaveBeenCalledWith(-player.speed);
    expect(player.flipX).toBe(true);
  });

  test('execute() should set velocity right and not flip sprite', () => {
    player.inputManager.right.setDown();
    state.execute();
    expect(player.body.setVelocityX).toHaveBeenCalledWith(player.speed);
    expect(player.flipX).toBe(false);
  });

  test('execute() should transition to IdleState if no horizontal input', () => {
    state.execute();
    expect(player.stateMachine.setState).toHaveBeenCalledWith('idle');
  });
  
  test('execute() should transition to JumpState if jumping', () => {
    player.inputManager.up.setDown();
    player.inputManager.right.setDown(); // ensure movement
    state.execute();
    expect(player.stateMachine.setState).toHaveBeenCalledWith('jump');
  });

  test('execute() should transition to FallState if not on floor', () => {
    player.body.onFloor.mockReturnValue(false);
    player.inputManager.right.setDown(); // ensure movement
    state.execute();
    expect(player.stateMachine.setState).toHaveBeenCalledWith('fall');
  });
}); 