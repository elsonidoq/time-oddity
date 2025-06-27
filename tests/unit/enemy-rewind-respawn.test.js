import Enemy from '../../client/src/entities/Enemy.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

/**
 * Unit test – Ensure dead enemies reappear when TimeManager restores state.
 */

describe('Enemy rewind resurrection', () => {
  it('should reactivate enemy when state before death is restored', () => {
    const scene = createPhaserSceneMock('GameScene');
    // Create enemy instance
    const enemy = new Enemy(scene, 0, 0, 'enemies');

    // Capture initial state snapshot
    const initialState = enemy.getStateForRecording();

    // Kill the enemy
    enemy.takeDamage(enemy.maxHealth);
    expect(enemy.isDead()).toBe(true);
    expect(enemy.active).toBe(false);

    // Simulate rewind by restoring snapshot
    enemy.setStateFromRecording(initialState);

    // Enemy should be alive and active again
    expect(enemy.isDead()).toBe(false);
    expect(enemy.active).toBe(true);
    expect(enemy.visible).toBe(true);
    expect(enemy.body.enable).toBe(true);
  });
}); 