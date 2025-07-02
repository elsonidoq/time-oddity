import { jest } from '@jest/globals';
import Player from '../../client/src/entities/Player.js';
import MovingPlatform from '../../client/src/entities/MovingPlatform.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import InputManager from '../../client/src/systems/InputManager.js';
import { createPhaserKeyMock } from '../mocks/phaserKeyMock.js';
import StateMachine from '../../client/src/systems/StateMachine.js';
import IdleState from '../../client/src/entities/states/IdleState.js';
import FallState from '../../client/src/entities/states/FallState.js';

describe('Integration: Player on Moving Platform', () => {
  let scene;
  let player;
  let movingPlatform;
  let inputManager;

  beforeEach(() => {
    scene = createPhaserSceneMock();
    inputManager = new InputManager(scene);

    movingPlatform = new MovingPlatform(scene, 100, 500, 'platform', {
        type: 'linear',
        startX: 100,
        startY: 500,
        endX: 300,
        endY: 500,
        speed: 50,
        autoStart: true,
    });
    // The real moving platform has its own body from the Entity constructor,
    // but for testing we can provide a more detailed mock.
    movingPlatform.body = {
      x: 100, y: 500, top: 468,
      velocity: { x: 50, y: 0 },
      touching: { up: true, none: false, down: false, left: false, right: false },
      enable: true,
      setImmovable: jest.fn(),
      setAllowGravity: jest.fn(),
      setFriction: jest.fn(),
      setBounce: jest.fn(),
      setCollideWorldBounds: jest.fn(),
      setVelocity: jest.fn(),
    };
    
    scene.platforms = { getChildren: () => [movingPlatform] };

    player = new Player(scene, 100, 468, 'player'); // Positioned on top of platform
    player.inputManager = inputManager;
    // The player also gets a body from Entity constructor. Mock it for the test.
    player.body = {
      x: 100, y: 468, bottom: 468, left: 84, right: 116,
      velocity: { x: 0, y: 0 },
      touching: { down: true, none: false, up: false, left: false, right: false },
      onFloor: () => player.body.touching.down,
      setAllowGravity: jest.fn(),
      setVelocityX: jest.fn((vx) => { player.body.velocity.x = vx; }),
      setVelocityY: jest.fn((vy) => { player.body.velocity.y = vy; }),
    };

    // Use a real state machine to verify state transitions
    player.stateMachine = new StateMachine();
    player.stateMachine
      .addState('idle', new IdleState(player))
      .addState('fall', new FallState(player));
    
    player.stateMachine.setState('idle');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should remain in idle state while standing on a moving platform', () => {
    const setStateSpy = jest.spyOn(player.stateMachine, 'setState');

    // Simulate a few frames of movement
    for (let i = 0; i < 10; i++) {
        movingPlatform.update(i * 16, 16);
        player.update(i * 16, 16);
    }

    // The player state should not change
    expect(setStateSpy).not.toHaveBeenCalled();
    expect(player.stateMachine.currentState.constructor.name).toBe('IdleState');
  });
}); 