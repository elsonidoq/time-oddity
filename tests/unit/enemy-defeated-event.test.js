import { jest } from '@jest/globals';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import Enemy from '../../client/src/entities/Enemy.js';

describe('enemyDefeated event emission', () => {
  test('die() emits enemyDefeated once', () => {
    const scene = createPhaserSceneMock('GameScene');
    const enemy = new Enemy(scene, 0, 0, 'placeholder_enemy');

    const spy = jest.spyOn(scene.events, 'emit');
    enemy.die();

    expect(spy).toHaveBeenCalledWith('enemyDefeated', enemy);
  });
}); 