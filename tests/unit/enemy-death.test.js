import { jest } from '@jest/globals';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import Enemy from '../../client/src/entities/Enemy.js';

describe('Enemy.die()', () => {
  let scene;
  let enemy;

  beforeEach(() => {
    scene = createPhaserSceneMock('GameScene');
    enemy = new Enemy(scene, 0, 0, 'placeholder_enemy');
    enemy.body = {
        enable: true,
        setVelocity: jest.fn()
    };
    scene.events.emit = jest.fn();
  });

  test('should set enemy to inactive and invisible', () => {
    enemy.die();
    expect(enemy.active).toBe(false);
    expect(enemy.visible).toBe(false);
  });

  test('should disable physics body', () => {
    enemy.die();
    expect(enemy.body.enable).toBe(false);
    expect(enemy.body.setVelocity).toHaveBeenCalledWith(0, 0);
  });
  
  test('should emit enemyDefeated event', () => {
    enemy.die();
    expect(scene.events.emit).toHaveBeenCalledWith('enemyDefeated', enemy);
  });

  test('should not call destroy', () => {
    enemy.destroy = jest.fn();
    enemy.die();
    expect(enemy.destroy).not.toHaveBeenCalled();
  });
}); 