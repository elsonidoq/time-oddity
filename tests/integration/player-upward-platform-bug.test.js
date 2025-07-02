import { jest } from '@jest/globals';
import Player from '../../client/src/entities/Player.js';
import MovingPlatform from '../../client/src/entities/MovingPlatform.js';
import IdleState from '../../client/src/entities/states/IdleState.js';
import RunState from '../../client/src/entities/states/RunState.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import { createPhaserKeyMock } from '../mocks/phaserKeyMock.js';
import InputManager from '../../client/src/systems/InputManager.js';
import StateMachine from '../../client/src/systems/StateMachine.js';

// Mock Phaser Geom Rectangle for tests
const mockRectangle = class {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.left = x;
        this.top = y;
        this.right = x + width;
        this.bottom = y + height;
    }
};
global.Phaser = {
    Geom: {
        Rectangle: mockRectangle
    }
};

describe('Integration: Player on Upward Moving Platform Bug', () => {
  let scene;
  let player;
  let platform;
  let inputManager;
  let rightKey;

  beforeEach(() => {
    jest.useFakeTimers();
    scene = createPhaserSceneMock();
    scene.time = { now: 0, delta: 16 };
    
    rightKey = createPhaserKeyMock('RIGHT');
    inputManager = new InputManager(scene);
    inputManager.right = rightKey;

    platform = new MovingPlatform(scene, 100, 500, 'platform', {
        type: 'linear',
        startX: 100,
        startY: 500,
        endX: 100,
        endY: 200, // Moves upwards
        speed: 50,
        autoStart: true,
    });
    // Mock platform body
    platform.body = {
      x: 100, y: 500, top: 468,
      velocity: { x: 0, y: -50 },
      touching: { up: true },
      isPlayerStandingOnAnySprite: jest.fn().mockReturnValue(true),
    };
    platform.getBounds = () => new Phaser.Geom.Rectangle(100, 468, 64, 32); // Mocked bounds
    platform.sprites = [{ 
        body: platform.body,
        getBounds: () => new Phaser.Geom.Rectangle(100, 468, 64, 32)
    }];
    
    scene.platforms = { getChildren: () => [platform] };

    player = new Player(scene, 100, 468, 'player'); // Positioned on top of platform
    player.inputManager = inputManager;
    player.body = {
      x: 100, y: 468, bottom: 468, left: 84, right: 116,
      velocity: { x: 0, y: 0 },
      touching: { down: true },
      onFloor: () => player.body.touching.down,
      setAllowGravity: jest.fn(),
      setVelocityX: jest.fn((vx) => { player.body.velocity.x = vx; }),
      setVelocityY: jest.fn((vy) => { player.body.velocity.y = vy; }),
    };
    player.getBounds = () => new Phaser.Geom.Rectangle(84, 436, 32, 32); // Mocked bounds

    // Replace the real state machine with one we can track
    player.stateMachine = new StateMachine();
    // Spy on setState BEFORE any states are added or set
    const setStateSpy = jest.spyOn(player.stateMachine, 'setState');

    const stateInstances = {
        'idle': new IdleState(player),
        'run': new RunState(player),
        'fall': { enter: jest.fn(), execute: jest.fn() }
    };
    player.stateMachine
      .addState('idle', stateInstances.idle)
      .addState('run', stateInstances.run)
      .addState('fall', stateInstances.fall);
    player.stateMachine.setState('idle');
    
    // Restore the original spy subject
    setStateSpy.mockRestore();
    // Now, create the spy for the actual test assertions
    player.stateMachine.setState = jest.spyOn(player.stateMachine, 'setState');
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('should not flicker between states when on a platform moving upwards', () => {
    // Clear mock history from the initial setState('idle') call in setup
    player.stateMachine.setState.mockClear();

    // This is the failing test that reproduces the bug.
    // Simulate several frames of the platform moving up
    for (let i = 0; i < 10; i++) {
        // Simulate physics engine making touching.down unreliable
        player.body.touching.down = (i % 2 === 0); // Flicker the touching state
        platform.body.y -= 2; // Move platform up
        player.body.y = platform.body.y; // Player moves with platform
        player.update(scene.time.now, scene.time.delta);
        scene.time.now += 16;
    }

    // ASSERT: No NEW state transitions should occur.
    expect(player.stateMachine.setState).not.toHaveBeenCalled();
    expect(player.stateMachine.currentState.constructor.name).toBe('IdleState');
  });

  test('should process input correctly while on an upward moving platform', () => {
    player.stateMachine.setState.mockClear();
    rightKey.setDown(); // Hold down the right key

    // Simulate frames
    for (let i = 0; i < 5; i++) {
        player.body.touching.down = (i % 2 === 0);
        platform.body.y -= 2;
        player.body.y = platform.body.y;
        player.update(scene.time.now, scene.time.delta);
        scene.time.now += 16;
    }

    // ASSERT: Player should have transitioned to RunState and have horizontal velocity.
    // The bug prevents this transition.
    expect(player.stateMachine.setState).toHaveBeenCalledWith('run');
    expect(player.stateMachine.currentState.constructor.name).toBe('RunState');
    expect(player.body.velocity.x).toBe(player.speed);
  });
}); 