import { jest } from '@jest/globals';
import Player from '../../client/src/entities/Player.js';
import MovingPlatform from '../../client/src/entities/MovingPlatform.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import InputManager from '../../client/src/systems/InputManager.js';
import StateMachine from '../../client/src/systems/StateMachine.js';
import IdleState from '../../client/src/entities/states/IdleState.js';
import RunState from '../../client/src/entities/states/RunState.js';

// Local Rectangle mock for getBounds compatibility in this isolated test
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
if (!global.Phaser) global.Phaser = {};
if (!global.Phaser.Geom) global.Phaser.Geom = {};
global.Phaser.Geom.Rectangle = mockRectangle;


describe('Integration: Player carried on diagonal upward moving platform', () => {
  let scene;
  let platform;
  let player;

  beforeEach(() => {
    scene = createPhaserSceneMock();

    // Create diagonal moving platform (up-right)
    platform = new MovingPlatform(scene, 100, 500, 'platform', {
      type: 'linear',
      startX: 100,
      startY: 500,
      endX: 300,
      endY: 300, // Diagonal up-right
      speed: 100,
      autoStart: true,
    });

    // Mock platform body and bounds
    platform.body = {
      x: 100,
      y: 500,
      top: 468,
      velocity: { x: 0, y: -100 },
      touching: { up: true },
    };
    platform.getBounds = () => new mockRectangle(platform.x, platform.y - 32, 64, 32);
    platform.sprites = [{ body: platform.body, getBounds: platform.getBounds }];

    scene.platforms = { getChildren: () => [platform] };

    // Create player positioned on top of platform
    player = new Player(scene, 100, 468, 'player');
    player.inputManager = new InputManager(scene);
    player.body = {
      x: 100,
      y: 468,
      bottom: 468,
      top: 436,
      left: 84,
      right: 116,
      velocity: { x: 0, y: 0 },
      touching: { down: true },
      onFloor: () => player.body.touching.down,
      setVelocityX: jest.fn(),
      setVelocityY: jest.fn(),
    };

    // Simplified state machine to avoid side effects
    player.stateMachine = new StateMachine();
    player.stateMachine
      .addState('idle', new IdleState(player))
      .addState('run', new RunState(player));
    player.stateMachine.setState('idle');
  });

  test('player remains aligned with platform during diagonal upward movement', () => {
    const initialOffsetX = player.body.x - platform.x;
    const initialOffsetY = player.body.y - platform.y;

    // Simulate 10 frames
    for (let i = 0; i < 10; i++) {
      // Simulate platform movement manually
      platform.x += 2; // move right
      platform.y -= 2; // move up
      platform.body.x = platform.x;
      platform.body.y = platform.y;
      platform.body.top = platform.y - 32;
      platform.getBounds = () => new mockRectangle(platform.x, platform.body.top, 64, 32);

      // Update platform deltas like in normal update loop
      platform.deltaX = 2;
      platform.deltaY = -2;

      // Simulate touching flag flicker every other frame
      player.body.touching.down = i % 2 === 0;

      // Carry player
      platform.carryPlayerIfStanding(player.body);

      // Update player's record of bottom position for next frame comparisons
      player.body.bottom = player.body.y;

      // Update player body bounds
      player.body.left = player.body.x - 16;
      player.body.right = player.body.x + 16;
    }

    const finalOffsetX = player.body.x - platform.x;
    const finalOffsetY = player.body.y - platform.y;

    expect(finalOffsetX).toBe(initialOffsetX);
    expect(finalOffsetY).toBe(initialOffsetY);
  });

  test('player remains aligned with platform during diagonal downward movement', () => {
    // Reset platform and player positions for downward movement test
    platform.x = 100;
    platform.y = 300;
    platform.body.x = 100;
    platform.body.y = 300;
    platform.body.top = 268;
    player.body.x = 100;
    player.body.y = 268;
    player.body.bottom = 268;
    player.body.left = 84;
    player.body.right = 116;

    const initialOffsetX = player.body.x - platform.x;
    const initialOffsetY = player.body.y - platform.y;

    // Simulate 10 frames of down-right movement
    for (let i = 0; i < 10; i++) {
      platform.x += 2; // right
      platform.y += 2; // down
      platform.body.x = platform.x;
      platform.body.y = platform.y;
      platform.body.top = platform.y - 32;
      platform.getBounds = () => new mockRectangle(platform.x, platform.body.top, 64, 32);

      platform.deltaX = 2;
      platform.deltaY = 2;

      player.body.touching.down = i % 2 === 0;

      platform.carryPlayerIfStanding(player.body);

      player.body.bottom = player.body.y;
      player.body.left = player.body.x - 16;
      player.body.right = player.body.x + 16;
    }

    const finalOffsetX = player.body.x - platform.x;
    const finalOffsetY = player.body.y - platform.y;

    expect(finalOffsetX).toBe(initialOffsetX);
    expect(finalOffsetY).toBe(initialOffsetY);
  });
}); 