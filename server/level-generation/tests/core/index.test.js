/**
 * @fileoverview Core module tests
 * Tests for foundational components like grid utilities and random generation
 */

const core = require('../../src/core');

describe('Core Module', () => {
  test('should export RandomGenerator class', () => {
    expect(core.RandomGenerator).toBeDefined();
    expect(typeof core.RandomGenerator).toBe('function');
  });

  test('should create RandomGenerator instance', () => {
    const rng = new core.RandomGenerator('test-seed');
    expect(rng).toBeInstanceOf(core.RandomGenerator);
    expect(rng.seed).toBe('test-seed');
  });

  test('should generate deterministic random numbers', () => {
    const rng1 = new core.RandomGenerator('deterministic-test');
    const rng2 = new core.RandomGenerator('deterministic-test');
    
    expect(rng1.random()).toBe(rng2.random());
    expect(rng1.random()).toBe(rng2.random());
  });
}); 