import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('Task 2.9: FallState Class', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const fallStatePath = join(__dirname, '../../client/src/entities/states/FallState.js');
  let FallState;
  let player;
  let state;

  beforeAll(async () => {
    if (existsSync(fallStatePath)) {
      const stateModule = await import(fallStatePath);
      FallState = stateModule.default;
    } else {
      FallState = class { constructor(p) { this.player = p; } enter() {} execute() {} };
    }
  });

  beforeEach(() => {
    player = {
      anims: { play: jest.fn() },
      body: { 
        velocity: { x: 0, y: 100 }, 
        onFloor: jest.fn().mockReturnValue(false),
        setVelocityX: jest.fn(),
      },
      inputManager: {
        left: false,
        right: false,
        get isLeftPressed() { return this.left; },
        get isRightPressed() { return this.right; },
      },
      stateMachine: { setState: jest.fn() },
      speed: 200,
      flipX: false,
    };
    state = new FallState(player);
  });

  test('FallState class file should exist', () => {
    expect(existsSync(fallStatePath)).toBe(true);
  });

  test('enter() should play fall animation', () => {
    state.enter();
    expect(player.anims.play).toHaveBeenCalledWith('player-fall', true);
  });
  
  test('execute() should transition to IdleState when on floor', () => {
    player.body.onFloor.mockReturnValue(true);
    state.execute();
    expect(player.stateMachine.setState).toHaveBeenCalledWith('idle');
  });

  test('execute() should handle horizontal movement while falling', () => {
    player.inputManager.left = true;
    state.execute();
    expect(player.body.setVelocityX).toHaveBeenCalledWith(-player.speed);
    expect(player.flipX).toBe(true);

    player.inputManager.left = false;
    player.inputManager.right = true;
    state.execute();
    expect(player.body.setVelocityX).toHaveBeenCalledWith(player.speed);
    expect(player.flipX).toBe(false);
  });
}); 