import { jest } from '@jest/globals';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import Enemy from '../../client/src/entities/Enemy.js';

describe('Enemy.die()', () => {
  let scene;
  let enemy;

  beforeEach(() => {
    jest.useFakeTimers();
    scene = createPhaserSceneMock('GameScene');
    enemy = new Enemy(scene, 0, 0, 'placeholder_enemy');
    // spy on destroy
    enemy.destroy = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('sets active false and schedules destroy after 300ms', () => {
    scene.time.delayedCall = jest.fn();
    enemy.die();

    expect(enemy.isActive).toBe(false);
    expect(scene.time.delayedCall).toHaveBeenCalledWith(300, expect.any(Function));
  });

  test('destroy called after timer', () => {
    scene.time.delayedCall = jest.fn((delay, cb) => {
      expect(delay).toBe(300);
      // simulate time elapse
      cb();
    });
    enemy.die();
    expect(enemy.destroy).toHaveBeenCalled();
  });
}); 