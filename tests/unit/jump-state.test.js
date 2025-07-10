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

  // Task 05.02: Dash from Jump Tests
  describe('Task 05.02: Dash Input During Jump', () => {
    
    test('should transition to dash state when dash is pressed and can dash', () => {
      // Arrange
      player.inputManager.isDashJustPressed = true;
      player.canDash = true;
      
      // Act
      state.execute();
      
      // Assert
      expect(player.stateMachine.setState).toHaveBeenCalledWith('dash');
    });

    test('should NOT transition to dash when dash is pressed but cannot dash (on cooldown)', () => {
      // Arrange
      player.inputManager.isDashJustPressed = true;
      player.canDash = false;
      player.dashTimer = 1000; // Future time to keep canDash false
      player.scene.time.now = 500; // Current time before cooldown expires
      
      // Act
      state.execute();
      
      // Assert
      expect(player.stateMachine.setState).not.toHaveBeenCalledWith('dash');
    });

    test('should NOT transition to dash when can dash but dash is not pressed', () => {
      // Arrange
      player.inputManager.isDashJustPressed = false;
      player.canDash = true;
      
      // Act
      state.execute();
      
      // Assert
      expect(player.stateMachine.setState).not.toHaveBeenCalledWith('dash');
    });

    test('should prioritize dash over other inputs when dash is available', () => {
      // Arrange
      player.inputManager.isDashJustPressed = true;
      player.inputManager.isLeftPressed = true;
      player.inputManager.isRightPressed = true;
      player.canDash = true;
      
      // Act
      state.execute();
      
      // Assert
      expect(player.stateMachine.setState).toHaveBeenCalledWith('dash');
      // Should NOT set horizontal velocity since we transitioned to dash
      expect(player.body.setVelocityX).not.toHaveBeenCalledWith(-player.speed);
      expect(player.body.setVelocityX).not.toHaveBeenCalledWith(player.speed);
    });

    test('should update canDash when cooldown timer expires', () => {
      // Arrange
      player.canDash = false;
      player.dashTimer = 1000;
      player.scene.time.now = 1001; // After cooldown
      
      // Act
      state.execute();
      
      // Assert
      expect(player.canDash).toBe(true);
    });

    test('should maintain existing jump functionality when dash is not triggered', () => {
      // Arrange
      player.inputManager.isDashJustPressed = false;
      player.inputManager.isLeftPressed = true;
      player.canDash = true;
      
      // Act
      state.execute();
      
      // Assert
      expect(player.stateMachine.setState).not.toHaveBeenCalledWith('dash');
      expect(player.body.setVelocityX).toHaveBeenCalledWith(-player.speed);
    });

    test('should handle variable jump height when dash is not triggered', () => {
      // Arrange
      player.inputManager.isDashJustPressed = false;
      player.inputManager.isJumpJustReleased = true;
      player.body.velocity.y = -200;
      player.canDash = true;
      
      // Act
      state.execute();
      
      // Assert
      expect(player.stateMachine.setState).not.toHaveBeenCalledWith('dash');
      expect(player.body.setVelocityY).toHaveBeenCalledWith(-100); // 0.5 * -200
    });
  });
}); 