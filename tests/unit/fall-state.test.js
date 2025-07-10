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
        onFloor: jest.fn(() => false),
        setVelocityX: jest.fn(),
        setVelocityY: jest.fn(),
        setAllowGravity: jest.fn(),
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
      canDash: true,
      dashTimer: 0,
      scene: { time: { now: 0 } },
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

  // Task 05.02: Dash from Fall Tests
  describe('Task 05.02: Dash Input During Fall', () => {
    test('should transition to dash state when dash is pressed and can dash', () => {
      player.inputManager.isDashJustPressed = true;
      player.canDash = true;
      state.execute();
      expect(player.stateMachine.setState).toHaveBeenCalledWith('dash');
    });

    test('should NOT transition to dash when dash is pressed but cannot dash (on cooldown)', () => {
      player.inputManager.isDashJustPressed = true;
      player.canDash = false;
      player.dashTimer = 1000;
      player.scene.time.now = 500;
      state.execute();
      expect(player.stateMachine.setState).not.toHaveBeenCalledWith('dash');
    });

    test('should NOT transition to dash when can dash but dash is not pressed', () => {
      player.inputManager.isDashJustPressed = false;
      player.canDash = true;
      state.execute();
      expect(player.stateMachine.setState).not.toHaveBeenCalledWith('dash');
    });

    test('should prioritize dash over other inputs when dash is available', () => {
      player.inputManager.isDashJustPressed = true;
      player.inputManager.left = true;
      player.inputManager.right = true;
      player.canDash = true;
      state.execute();
      expect(player.stateMachine.setState).toHaveBeenCalledWith('dash');
      expect(player.body.setVelocityX).not.toHaveBeenCalledWith(-player.speed);
      expect(player.body.setVelocityX).not.toHaveBeenCalledWith(player.speed);
    });

    test('should update canDash when cooldown timer expires', () => {
      player.canDash = false;
      player.dashTimer = 1000;
      player.scene.time.now = 1001;
      state.execute();
      expect(player.canDash).toBe(true);
    });
  });
}); 