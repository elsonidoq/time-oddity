import { jest } from '@jest/globals';
// New test verifying Player.takeDamage behaviour
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import Player from '../../client/src/entities/Player.js';

describe('Player.takeDamage()', () => {
  let scene;
  let player;

  beforeEach(() => {
    // Prepare scene mock with basic registry implementation
    scene = createPhaserSceneMock('GameScene');
    // Attach simple registry stub compatible with Phaser API subset used
    const internalStore = {};
    scene.registry = {
      set: jest.fn((key, value) => { internalStore[key] = value; }),
      get: jest.fn((key) => internalStore[key])
    };

    player = new Player(scene, 0, 0, 'placeholder_player', 0, 100);
  });

  test('reduces health by damage amount and clamps at 0', () => {
    player.takeDamage(30);
    expect(player.health).toBe(70);
    expect(scene.registry.set).toHaveBeenLastCalledWith('playerHealth', 70);

    // Apply lethal damage greater than remaining health
    player.takeDamage(1000);
    expect(player.health).toBe(0);
    expect(scene.registry.set).toHaveBeenLastCalledWith('playerHealth', 0);
  });

  test('emits playerDamaged event once per call', () => {
    // Invocation should not throw and registry should update
    player.takeDamage(10);
    expect(scene.registry.set).toHaveBeenCalledWith('playerHealth', 90);
  });
}); 