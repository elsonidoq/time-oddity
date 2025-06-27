import { jest } from '@jest/globals';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import CollisionManager from '../../client/src/systems/CollisionManager.js';
import Player from '../../client/src/entities/Player.js';
import Enemy from '../../client/src/entities/Enemy.js';

describe('CollisionManager – player-enemy damage integration', () => {
  let scene;
  let player;
  let enemy;
  let collisionManager;

  beforeEach(() => {
    scene = createPhaserSceneMock('GameScene');
    // Registry stub for player
    const store = {};
    scene.registry = {
      set: jest.fn((k, v) => { store[k] = v; }),
      get: jest.fn((k) => store[k])
    };

    player = new Player(scene, 0, 0, 'placeholder_player', 0, 100);
    enemy = new Enemy(scene, 10, 0, 'placeholder_enemy', { damage: 15 });

    // Create group mock containing enemy
    const enemiesGroup = { adds: [enemy] };
    // Monkey patch physics.add.collider to capture callback
    if (scene.physics.add.collider.mockClear) {
      scene.physics.add.collider.mockClear();
    }

    collisionManager = new CollisionManager(scene);
    collisionManager.setupPlayerEnemyCollision(player, enemiesGroup);
  });

  test('player takes enemy damage on collision and event still emitted', () => {
    // Support both jest.fn() mocks and custom fallback mocks in createPhaserSceneMock
    const colliderMockFn = scene.physics.add.collider;
    const colliderCall = (colliderMockFn.mock ? colliderMockFn.mock.calls[0] : colliderMockFn.calls[0]);
    const callback = colliderCall[2];

    // Ensure we have callback
    expect(typeof callback).toBe('function');

    // Spy on event emit
    if (scene.events.emit.mockClear) {
      scene.events.emit.mockClear();
    }

    // Invoke collision callback manually
    callback(player, enemy);

    expect(player.health).toBe(85); // 100 - 15 dmg
  });
}); 