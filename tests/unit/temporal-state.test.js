import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('Task 3.2: TemporalState Object', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const temporalStatePath = join(__dirname, '../../client/src/systems/TemporalState.js');
  let TemporalState;

  beforeAll(async () => {
    if (existsSync(temporalStatePath)) {
      const module = await import(temporalStatePath);
      TemporalState = module.default;
    } else {
      TemporalState = class { constructor() {} };
    }
  });

  test('TemporalState.js class file should exist', () => {
    expect(existsSync(temporalStatePath)).toBe(true);
  });

  test('should store state properties correctly', () => {
    const state = {
      x: 100,
      y: 200,
      velocityX: 10,
      velocityY: -5,
      animation: 'player-run',
      isAlive: true,
      isVisible: true,
    };
    const temporalState = new TemporalState(state);

    expect(temporalState.x).toBe(state.x);
    expect(temporalState.y).toBe(state.y);
    expect(temporalState.velocityX).toBe(state.velocityX);
    expect(temporalState.velocityY).toBe(state.velocityY);
    expect(temporalState.animation).toBe(state.animation);
    expect(temporalState.isAlive).toBe(state.isAlive);
    expect(temporalState.isVisible).toBe(state.isVisible);
  });
}); 