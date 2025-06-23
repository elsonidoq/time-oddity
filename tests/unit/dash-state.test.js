import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('Task 3.7: DashState Class', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const dashStatePath = join(__dirname, '../../client/src/entities/states/DashState.js');
  let DashState;
  let player;
  let state;

  beforeAll(async () => {
    if (existsSync(dashStatePath)) {
      const stateModule = await import(dashStatePath);
      DashState = stateModule.default;
    } else {
      DashState = class { constructor(p) { this.player = p; } enter() {} execute() {} };
    }
  });

  beforeEach(() => {
    player = {
      x: 100,
      y: 200,
      dashDistance: 150,
      dashCooldown: 500,
      dashTimer: 0,
      canDash: true,
      body: {
        onFloor: jest.fn().mockReturnValue(true),
        setVelocityX: jest.fn(),
        setVelocityY: jest.fn(),
        setAllowGravity: jest.fn(),
        blocked: { left: false, right: false },
      },
      inputManager: {
        isDashPressed: false,
      },
      stateMachine: { setState: jest.fn() },
      scene: {
        time: { now: 0 },
      },
      flipX: false,
    };
    state = new DashState(player);
  });

  test('DashState class file should exist', () => {
    expect(existsSync(dashStatePath)).toBe(true);
  });

  test('enter() should set dash timer and disable gravity', () => {
    state.enter();
    expect(player.dashTimer).toBeGreaterThan(0);
    expect(player.body.setAllowGravity).toHaveBeenCalledWith(false);
  });

  test('execute() should move player dashDistance instantly in facing direction', () => {
    player.flipX = false; // Facing right
    state.enter();
    state.execute();
    expect(player.x).toBe(100 + player.dashDistance);
    player.flipX = true; // Facing left
    player.x = 100;
    state.enter();
    state.execute();
    expect(player.x).toBe(100 - player.dashDistance);
  });

  test('should not dash through platforms (blocked)', () => {
    player.body.blocked.right = true;
    player.flipX = false;
    state.enter();
    state.execute();
    // Should not move if blocked
    expect(player.x).toBe(100);
  });

  test('should not allow dash again until cooldown expires', () => {
    state.enter();
    player.canDash = false;
    player.scene.time.now += player.dashCooldown - 1;
    state.execute();
    expect(player.canDash).toBe(false);
    player.scene.time.now += 2;
    state.execute();
    expect(player.canDash).toBe(true);
  });
}); 