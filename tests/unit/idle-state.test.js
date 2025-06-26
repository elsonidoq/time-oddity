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

// Patch global Phaser mock for Keyboard static methods
if (!globalThis.Phaser) globalThis.Phaser = {};
if (!globalThis.Phaser.Input) globalThis.Phaser.Input = {};
if (!globalThis.Phaser.Input.Keyboard) globalThis.Phaser.Input.Keyboard = {};
if (!globalThis.Phaser.Input.Keyboard.JustDown) globalThis.Phaser.Input.Keyboard.JustDown = jest.fn(() => false);
if (!globalThis.Phaser.Input.Keyboard.JustUp) globalThis.Phaser.Input.Keyboard.JustUp = jest.fn(() => false);

describe('Task 2.6: IdleState Class', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const idleStatePath = join(__dirname, '../../client/src/entities/states/IdleState.js');
  let IdleState;
  let player;
  let state;
  let scene;

  beforeAll(async () => {
    if (existsSync(idleStatePath)) {
      const stateModule = await import(idleStatePath);
      IdleState = stateModule.default;
    } else {
      IdleState = class { constructor(p) { this.player = p; } enter() {} execute() {} };
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
        setVelocityX: jest.fn(),
        setVelocityY: jest.fn(),
        setAllowGravity: jest.fn(),
        onFloor: jest.fn(() => true),
      },
      inputManager: new InputManager(scene),
      stateMachine: { setState: jest.fn() },
      flipX: false,
      speed: 200,
      canDash: true,
      dashTimer: 0,
      scene: { time: { now: 0 } },
    };
    // Attach key mocks for direct test access
    player.inputManager.left = left;
    player.inputManager.right = right;
    player.inputManager.up = up;
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
    player.inputManager.left.setDown();
    state.execute();
    expect(player.stateMachine.setState).toHaveBeenCalledWith('run');
  });

  test('execute() should transition to RunState if moving right', () => {
    player.inputManager.right.setDown();
    state.execute();
    expect(player.stateMachine.setState).toHaveBeenCalledWith('run');
  });

  test('execute() should transition to JumpState if jumping', () => {
    player.inputManager.up.setDown();
    state.execute();
    expect(player.stateMachine.setState).toHaveBeenCalledWith('jump');
  });

  test('execute() should transition to FallState if not on floor', () => {
    player.body.onFloor.mockReturnValue(false);
    state.execute();
    expect(player.stateMachine.setState).toHaveBeenCalledWith('fall');
  });
}); 