import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('Task 2.7: RunState Class', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const runStatePath = join(__dirname, '../../client/src/entities/states/RunState.js');
  let RunState;
  let player;
  let state;

  beforeAll(async () => {
    if (existsSync(runStatePath)) {
      const stateModule = await import(runStatePath);
      RunState = stateModule.default;
    } else {
      RunState = class { constructor(p) { this.player = p; } enter() {} execute() {} };
    }
  });

  beforeEach(() => {
    player = {
      anims: { play: jest.fn() },
      body: { 
        velocity: { x: 0, y: 0 }, 
        onFloor: jest.fn(() => true),
        setVelocityX: jest.fn(),
        setVelocityY: jest.fn(),
        setAllowGravity: jest.fn(),
      },
      inputManager: {
        left: false,
        right: false,
        up: false,
        get isLeftPressed() { return this.left; },
        get isRightPressed() { return this.right; },
        get isUpPressed() { return this.up; },
      },
      stateMachine: { setState: jest.fn() },
      speed: 200,
      flipX: false,
      canDash: true,
      dashTimer: 0,
      scene: { time: { now: 0 } },
    };
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
    player.inputManager.left = true;
    state.execute();
    expect(player.body.setVelocityX).toHaveBeenCalledWith(-player.speed);
    expect(player.flipX).toBe(true);
  });

  test('execute() should set velocity right and not flip sprite', () => {
    player.inputManager.right = true;
    state.execute();
    expect(player.body.setVelocityX).toHaveBeenCalledWith(player.speed);
    expect(player.flipX).toBe(false);
  });

  test('execute() should transition to IdleState if no horizontal input', () => {
    state.execute();
    expect(player.stateMachine.setState).toHaveBeenCalledWith('idle');
  });
  
  test('execute() should transition to JumpState if jumping', () => {
    player.inputManager.up = true;
    player.inputManager.right = true; // ensure movement
    state.execute();
    expect(player.stateMachine.setState).toHaveBeenCalledWith('jump');
  });

  test('execute() should transition to FallState if not on floor', () => {
    player.body.onFloor.mockReturnValue(false);
    player.inputManager.right = true; // ensure movement
    state.execute();
    expect(player.stateMachine.setState).toHaveBeenCalledWith('fall');
  });
}); 