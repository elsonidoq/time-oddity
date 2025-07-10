/**
 * @fileoverview Tests for RandomGenerator class
 * Tests deterministic random number generation using seedrandom
 */

const RandomGenerator = require('../../src/core/RandomGenerator');

describe('RandomGenerator', () => {
  describe('Constructor and Initialization', () => {
    test('should create instance with valid seed', () => {
      const rng = new RandomGenerator('test-seed');
      expect(rng).toBeInstanceOf(RandomGenerator);
      expect(rng.seed).toBe('test-seed');
    });

    test('should create instance with numeric seed', () => {
      const rng = new RandomGenerator(12345);
      expect(rng).toBeInstanceOf(RandomGenerator);
      expect(rng.seed).toBe('12345');
    });

    test('should throw error for invalid seed', () => {
      expect(() => new RandomGenerator(null)).toThrow('Seed must be a string or number');
      expect(() => new RandomGenerator(undefined)).toThrow('Seed must be a string or number');
      expect(() => new RandomGenerator('')).toThrow('Seed cannot be empty');
    });

    test('should create isolated instances', () => {
      const rng1 = new RandomGenerator('seed1');
      const rng2 = new RandomGenerator('seed2');
      
      // Different seeds should produce different sequences
      expect(rng1.random()).not.toBe(rng2.random());
    });
  });

  describe('Deterministic Behavior', () => {
    test('should produce same sequence for same seed', () => {
      const rng1 = new RandomGenerator('deterministic-test');
      const rng2 = new RandomGenerator('deterministic-test');
      
      const sequence1 = [];
      const sequence2 = [];
      
      for (let i = 0; i < 10; i++) {
        sequence1.push(rng1.random());
        sequence2.push(rng2.random());
      }
      
      expect(sequence1).toEqual(sequence2);
    });

    test('should produce different sequences for different seeds', () => {
      const rng1 = new RandomGenerator('seed1');
      const rng2 = new RandomGenerator('seed2');
      
      const sequence1 = [];
      const sequence2 = [];
      
      for (let i = 0; i < 10; i++) {
        sequence1.push(rng1.random());
        sequence2.push(rng2.random());
      }
      
      expect(sequence1).not.toEqual(sequence2);
    });

    test('should maintain state between calls', () => {
      const rng = new RandomGenerator('state-test');
      
      const first = rng.random();
      const second = rng.random();
      
      expect(first).not.toBe(second);
      
      // Creating new instance with same seed should start from beginning
      const rng2 = new RandomGenerator('state-test');
      expect(rng2.random()).toBe(first);
    });
  });

  describe('Random Number Generation', () => {
    let rng;

    beforeEach(() => {
      rng = new RandomGenerator('test-random');
    });

    test('should generate numbers between 0 and 1', () => {
      for (let i = 0; i < 100; i++) {
        const value = rng.random();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    test('should generate different numbers on subsequent calls', () => {
      const values = new Set();
      for (let i = 0; i < 100; i++) {
        values.add(rng.random());
      }
      // Should have generated many different values
      expect(values.size).toBeGreaterThan(50);
    });
  });

  describe('Range Methods', () => {
    let rng;

    beforeEach(() => {
      rng = new RandomGenerator('range-test');
    });

    describe('randomInt', () => {
      test('should generate integer in specified range', () => {
        for (let i = 0; i < 100; i++) {
          const value = rng.randomInt(1, 10);
          expect(Number.isInteger(value)).toBe(true);
          expect(value).toBeGreaterThanOrEqual(1);
          expect(value).toBeLessThanOrEqual(10);
        }
      });

      test('should handle single value range', () => {
        const value = rng.randomInt(5, 5);
        expect(value).toBe(5);
      });

      test('should throw error for invalid range', () => {
        expect(() => rng.randomInt(10, 5)).toThrow('min must be less than or equal to max');
        expect(() => rng.randomInt(1.5, 10)).toThrow('min and max must be integers');
        expect(() => rng.randomInt(1, 10.5)).toThrow('min and max must be integers');
      });
    });

    describe('randomFloat', () => {
      test('should generate float in specified range', () => {
        for (let i = 0; i < 100; i++) {
          const value = rng.randomFloat(1.5, 10.5);
          expect(typeof value).toBe('number');
          expect(value).toBeGreaterThanOrEqual(1.5);
          expect(value).toBeLessThanOrEqual(10.5);
        }
      });

      test('should handle single value range', () => {
        const value = rng.randomFloat(5.5, 5.5);
        expect(value).toBe(5.5);
      });

      test('should throw error for invalid range', () => {
        expect(() => rng.randomFloat(10.5, 5.5)).toThrow('min must be less than or equal to max');
      });
    });

    describe('randomChoice', () => {
      test('should select random element from array', () => {
        const choices = ['a', 'b', 'c', 'd'];
        const selected = rng.randomChoice(choices);
        expect(choices).toContain(selected);
      });

      test('should handle single element array', () => {
        const choices = ['single'];
        const selected = rng.randomChoice(choices);
        expect(selected).toBe('single');
      });

      test('should throw error for empty array', () => {
        expect(() => rng.randomChoice([])).toThrow('Array cannot be empty');
      });

      test('should throw error for non-array input', () => {
        expect(() => rng.randomChoice('not an array')).toThrow('Input must be an array');
      });
    });

    describe('randomWeightedChoice', () => {
      test('should select based on weights', () => {
        const choices = ['a', 'b', 'c'];
        const weights = [1, 2, 3]; // c should be selected most often
        
        const results = { a: 0, b: 0, c: 0 };
        for (let i = 0; i < 1000; i++) {
          const selected = rng.randomWeightedChoice(choices, weights);
          results[selected]++;
        }
        
        // c should have the highest count due to highest weight
        expect(results.c).toBeGreaterThan(results.a);
        expect(results.c).toBeGreaterThan(results.b);
      });

      test('should handle equal weights', () => {
        const choices = ['a', 'b'];
        const weights = [1, 1];
        
        const results = { a: 0, b: 0 };
        for (let i = 0; i < 100; i++) {
          const selected = rng.randomWeightedChoice(choices, weights);
          results[selected]++;
        }
        
        // Both should be selected roughly equally
        expect(results.a).toBeGreaterThan(0);
        expect(results.b).toBeGreaterThan(0);
      });

      test('should throw error for mismatched arrays', () => {
        expect(() => rng.randomWeightedChoice(['a', 'b'], [1])).toThrow('Choices and weights arrays must have same length');
      });

      test('should throw error for negative weights', () => {
        expect(() => rng.randomWeightedChoice(['a', 'b'], [1, -1])).toThrow('All weights must be non-negative');
      });

      test('should throw error for zero total weight', () => {
        expect(() => rng.randomWeightedChoice(['a', 'b'], [0, 0])).toThrow('Total weight must be greater than zero');
      });
    });
  });

  describe('Distribution Testing', () => {
    let rng;

    beforeEach(() => {
      rng = new RandomGenerator('distribution-test');
    });

    test('should have uniform distribution for random()', () => {
      const buckets = new Array(10).fill(0);
      const samples = 10000;
      
      for (let i = 0; i < samples; i++) {
        const value = rng.random();
        const bucket = Math.floor(value * 10);
        buckets[bucket]++;
      }
      
      // Each bucket should have roughly 1000 samples (allowing for some variance)
      const expected = samples / 10;
      const tolerance = expected * 0.2; // 20% tolerance
      
      buckets.forEach(count => {
        expect(count).toBeGreaterThan(expected - tolerance);
        expect(count).toBeLessThan(expected + tolerance);
      });
    });

    test('should have uniform distribution for randomInt()', () => {
      const buckets = new Array(10).fill(0);
      const samples = 10000;
      
      for (let i = 0; i < samples; i++) {
        const value = rng.randomInt(0, 9);
        buckets[value]++;
      }
      
      // Each bucket should have roughly 1000 samples
      const expected = samples / 10;
      const tolerance = expected * 0.2; // 20% tolerance
      
      buckets.forEach(count => {
        expect(count).toBeGreaterThan(expected - tolerance);
        expect(count).toBeLessThan(expected + tolerance);
      });
    });
  });

  describe('Performance Testing', () => {
    test('should generate random numbers quickly', () => {
      const rng = new RandomGenerator('performance-test');
      const start = Date.now();
      
      for (let i = 0; i < 100000; i++) {
        rng.random();
      }
      
      const end = Date.now();
      const duration = end - start;
      
      // Should complete 100k random numbers in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    test('should handle large ranges efficiently', () => {
      const rng = new RandomGenerator('large-range-test');
      const start = Date.now();
      
      for (let i = 0; i < 10000; i++) {
        rng.randomInt(0, 1000000);
      }
      
      const end = Date.now();
      const duration = end - start;
      
      // Should complete 10k large range integers in less than 50ms
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle very large seeds', () => {
      const largeSeed = 'a'.repeat(10000);
      expect(() => new RandomGenerator(largeSeed)).not.toThrow();
    });

    test('should handle special characters in seeds', () => {
      const specialSeed = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      expect(() => new RandomGenerator(specialSeed)).not.toThrow();
    });

    test('should handle unicode characters in seeds', () => {
      const unicodeSeed = '🎲🎯🎮测试';
      expect(() => new RandomGenerator(unicodeSeed)).not.toThrow();
    });

    test('should maintain determinism with special characters', () => {
      const specialSeed = '!@#$%^&*()';
      const rng1 = new RandomGenerator(specialSeed);
      const rng2 = new RandomGenerator(specialSeed);
      
      expect(rng1.random()).toBe(rng2.random());
    });
  });

  describe('Integration and Real-World Usage', () => {
    test('should work correctly in cave generation scenario', () => {
      const rng = new RandomGenerator('cave-level-1');
      
      // Simulate typical cave generation usage
      const width = rng.randomInt(50, 100);
      const height = rng.randomInt(30, 60);
      const initialWallRatio = rng.randomFloat(0.4, 0.55);
      
      // Verify deterministic behavior
      const rng2 = new RandomGenerator('cave-level-1');
      expect(rng2.randomInt(50, 100)).toBe(width);
      expect(rng2.randomInt(30, 60)).toBe(height);
      expect(rng2.randomFloat(0.4, 0.55)).toBe(initialWallRatio);
    });

    test('should handle weighted choice for enemy placement', () => {
      const rng = new RandomGenerator('enemy-placement');
      
      const enemyTypes = ['LoopHound', 'Patroller', 'Guard'];
      const weights = [0.6, 0.3, 0.1]; // LoopHound most common
      
      const results = { LoopHound: 0, Patroller: 0, Guard: 0 };
      for (let i = 0; i < 1000; i++) {
        const enemyType = rng.randomWeightedChoice(enemyTypes, weights);
        results[enemyType]++;
      }
      
      // LoopHound should be most common due to highest weight
      expect(results.LoopHound).toBeGreaterThan(results.Patroller);
      expect(results.LoopHound).toBeGreaterThan(results.Guard);
      expect(results.Patroller).toBeGreaterThan(results.Guard);
    });

    test('should maintain state across multiple operations', () => {
      const rng = new RandomGenerator('state-test');
      
      // Perform a sequence of operations
      const firstRandom = rng.random();
      const firstInt = rng.randomInt(1, 10);
      const firstFloat = rng.randomFloat(0.1, 0.9);
      const firstChoice = rng.randomChoice(['a', 'b', 'c']);
      
      // Reset and verify same sequence
      rng.reset();
      expect(rng.random()).toBe(firstRandom);
      expect(rng.randomInt(1, 10)).toBe(firstInt);
      expect(rng.randomFloat(0.1, 0.9)).toBe(firstFloat);
      expect(rng.randomChoice(['a', 'b', 'c'])).toBe(firstChoice);
    });

    test('should handle edge cases in real scenarios', () => {
      // Test with extreme values that might be used in generation
      const rng = new RandomGenerator('edge-case-test');
      
      // Very small ranges
      expect(rng.randomInt(1, 1)).toBe(1);
      expect(rng.randomFloat(0.5, 0.5)).toBe(0.5);
      
      // Single choice
      expect(rng.randomChoice(['single'])).toBe('single');
      
      // Large ranges
      const largeInt = rng.randomInt(0, 1000000);
      expect(largeInt).toBeGreaterThanOrEqual(0);
      expect(largeInt).toBeLessThanOrEqual(1000000);
      
      const largeFloat = rng.randomFloat(-1000, 1000);
      expect(largeFloat).toBeGreaterThanOrEqual(-1000);
      expect(largeFloat).toBeLessThanOrEqual(1000);
    });
  });
}); 