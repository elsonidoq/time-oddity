import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('Task 2.8: JumpState Class', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const jumpStatePath = join(__dirname, '../../client/src/entities/states/JumpState.js');
  let JumpState;
  let player;
  let state;

  beforeAll(async () => {
    if (existsSync(jumpStatePath)) {
      const stateModule = await import(jumpStatePath);
      JumpState = stateModule.default;
    } else {
      JumpState = class { constructor(p) { this.player = p; } enter() {} execute() {} };
    }
  });

  beforeEach(() => {
    player = {
      anims: { play: jest.fn() },
      body: {
        setVelocityX: jest.fn(),
        setVelocityY: jest.fn(),
        setAllowGravity: jest.fn(),
        onFloor: jest.fn(() => false),
        velocity: { y: -1 },
      },
      inputManager: {},
      stateMachine: { setState: jest.fn() },
      flipX: false,
      speed: 200,
      canDash: true,
      dashTimer: 0,
      scene: { time: { now: 0 } },
      jumpPower: 400,
    };
    state = new JumpState(player);
  });

  test('JumpState class file should exist', () => {
    expect(existsSync(jumpStatePath)).toBe(true);
  });

  test('enter() should play jump animation and set Y velocity', () => {
    state.enter();
    expect(player.anims.play).toHaveBeenCalledWith('player-jump', true);
    expect(player.body.setVelocityY).toHaveBeenCalledWith(-player.jumpPower);
  });
  
  test('execute() should transition to FallState when velocity is non-negative', () => {
    player.body.velocity.y = 10;
    state.execute();
    expect(player.stateMachine.setState).toHaveBeenCalledWith('fall');
  });

  test('execute() should handle horizontal movement while jumping', () => {
    player.inputManager.isLeftPressed = true;
    state.execute();
    expect(player.body.setVelocityX).toHaveBeenCalledWith(-player.speed);
    expect(player.flipX).toBe(true);

    player.inputManager.isLeftPressed = false;
    player.inputManager.isRightPressed = true;
    state.execute();
    expect(player.body.setVelocityX).toHaveBeenCalledWith(player.speed);
    expect(player.flipX).toBe(false);
  });
}); 