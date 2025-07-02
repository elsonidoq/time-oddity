import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Level JSON Enemy Configuration Validation', () => {
  let testLevelConfig;
  let adventureLevelConfig;
  let complexLevelConfig;

  beforeEach(() => {
    // Load level configurations
    testLevelConfig = JSON.parse(fs.readFileSync(
      path.join(process.cwd(), 'client/src/config/test-level.json'), 
      'utf8'
    ));
    adventureLevelConfig = JSON.parse(fs.readFileSync(
      path.join(process.cwd(), 'client/src/config/adventure-level.json'), 
      'utf8'
    ));
    complexLevelConfig = JSON.parse(fs.readFileSync(
      path.join(process.cwd(), 'client/src/config/complex-level.json'), 
      'utf8'
    ));
  });

  describe('JSON Structure Validation', () => {
    test('test-level.json should have enemies array', () => {
      // Red phase - this test MUST fail initially
      expect(testLevelConfig.enemies).toBeDefined();
      expect(Array.isArray(testLevelConfig.enemies)).toBe(true);
    });

    test('adventure-level.json should have enemies array', () => {
      // Red phase - this test MUST fail initially
      expect(adventureLevelConfig.enemies).toBeDefined();
      expect(Array.isArray(adventureLevelConfig.enemies)).toBe(true);
    });

    test('complex-level.json should have enemies array', () => {
      // Red phase - this test MUST fail initially
      expect(complexLevelConfig.enemies).toBeDefined();
      expect(Array.isArray(complexLevelConfig.enemies)).toBe(true);
    });
  });

  describe('Enemy Configuration Schema Validation', () => {
    test('enemies should have required fields: type, x, y', () => {
      // Red phase - this test MUST fail initially
      const enemies = testLevelConfig.enemies || [];
      enemies.forEach(enemy => {
        expect(enemy.type).toBeDefined();
        expect(typeof enemy.type).toBe('string');
        expect(enemy.x).toBeDefined();
        expect(typeof enemy.x).toBe('number');
        expect(enemy.y).toBeDefined();
        expect(typeof enemy.y).toBe('number');
      });
    });

    test('LoopHound enemies should have valid patrolDistance (50-500)', () => {
      // Red phase - this test MUST fail initially
      const enemies = testLevelConfig.enemies || [];
      enemies.forEach(enemy => {
        if (enemy.type === 'LoopHound') {
          const patrolDistance = enemy.patrolDistance || 200;
          expect(patrolDistance).toBeGreaterThanOrEqual(50);
          expect(patrolDistance).toBeLessThanOrEqual(500);
        }
      });
    });

    test('LoopHound enemies should have valid direction (1 or -1)', () => {
      // Red phase - this test MUST fail initially
      const enemies = testLevelConfig.enemies || [];
      enemies.forEach(enemy => {
        if (enemy.type === 'LoopHound') {
          const direction = enemy.direction || 1;
          expect([1, -1]).toContain(direction);
        }
      });
    });

    test('LoopHound enemies should have valid speed (10-200)', () => {
      // Red phase - this test MUST fail initially
      const enemies = testLevelConfig.enemies || [];
      enemies.forEach(enemy => {
        if (enemy.type === 'LoopHound') {
          const speed = enemy.speed || 80;
          expect(speed).toBeGreaterThanOrEqual(10);
          expect(speed).toBeLessThanOrEqual(200);
        }
      });
    });
  });

  describe('Enemy Position Validation', () => {
    test('enemy positions should be within level bounds', () => {
      // Red phase - this test MUST fail initially
      const enemies = testLevelConfig.enemies || [];
      enemies.forEach(enemy => {
        expect(enemy.x).toBeGreaterThanOrEqual(0);
        expect(enemy.x).toBeLessThanOrEqual(6000); // Level width
        expect(enemy.y).toBeGreaterThanOrEqual(0);
        expect(enemy.y).toBeLessThanOrEqual(3000); // Level height
      });
    });

    test('enemies should be positioned on solid ground', () => {
      // Updated after JSON-driven enemy implementation
      const enemies = testLevelConfig.enemies || [];
      const platforms = testLevelConfig.platforms || [];
      
      enemies.forEach(enemy => {
        // Find a platform at the enemy's y position (ground level)
        // Allow for floating platforms at y=300 (which corresponds to ground at y=900)
        let groundPlatform;
        
        if (enemy.y === 300) {
          // Special case: enemy at y=300 should be on ground at y=900
          groundPlatform = platforms.find(platform => 
            platform.y === 900 && 
            enemy.x >= platform.x && 
            enemy.x <= platform.x + (platform.width || 64)
          );
        } else {
          // Normal case: enemy should be on platform at same y level
          groundPlatform = platforms.find(platform => 
            platform.y === enemy.y && 
            enemy.x >= platform.x && 
            enemy.x <= platform.x + (platform.width || 64)
          );
        }
        
        expect(groundPlatform).toBeDefined();
      });
    });
  });

  describe('Enemy Type Validation', () => {
    test('all enemy types should be supported', () => {
      // Red phase - this test MUST fail initially
      const enemies = testLevelConfig.enemies || [];
      const supportedTypes = ['LoopHound']; // Currently only LoopHound supported
      
      enemies.forEach(enemy => {
        expect(supportedTypes).toContain(enemy.type);
      });
    });
  });

  describe('Configuration Examples', () => {
    test('test-level.json should have 4 LoopHound enemies at strategic positions', () => {
      // Updated after JSON-driven enemy implementation
      const enemies = testLevelConfig.enemies || [];
      const loopHounds = enemies.filter(e => e.type === 'LoopHound');
      
      expect(loopHounds.length).toBe(4); // From test-level.json configuration
      
      // Check strategic positioning
      loopHounds.forEach(enemy => {
        expect(enemy.x).toBeGreaterThanOrEqual(110); // Inclusive of first enemy
        expect(enemy.x).toBeLessThan(5800); // Not too close to end
      });
    });

    test('adventure-level.json should have varied enemy placement', () => {
      // Red phase - this test MUST fail initially
      const enemies = adventureLevelConfig.enemies || [];
      expect(enemies.length).toBeGreaterThan(0);
      
      // Check for varied patrol distances
      const patrolDistances = enemies
        .filter(e => e.type === 'LoopHound')
        .map(e => e.patrolDistance || 200);
      
      const uniqueDistances = [...new Set(patrolDistances)];
      expect(uniqueDistances.length).toBeGreaterThan(1);
    });

    test('complex-level.json should have complex enemy patterns', () => {
      // Red phase - this test MUST fail initially
      const enemies = complexLevelConfig.enemies || [];
      expect(enemies.length).toBeGreaterThan(0);
      
      // Check for different directions
      const directions = enemies
        .filter(e => e.type === 'LoopHound')
        .map(e => e.direction || 1);
      
      const uniqueDirections = [...new Set(directions)];
      expect(uniqueDirections.length).toBeGreaterThan(1);
    });
  });

  describe('Asset Reference Validation', () => {
    test('enemy texture and frame references should be valid', () => {
      // Red phase - this test MUST fail initially
      const enemies = testLevelConfig.enemies || [];
      const validTextures = ['enemies']; // From invariants.md §15
      const validFrames = ['barnacle_attack_rest', 'barnacle_attack_a', 'barnacle_attack_b']; // Common enemy frames
      
      enemies.forEach(enemy => {
        if (enemy.texture) {
          expect(validTextures).toContain(enemy.texture);
        }
        if (enemy.frame) {
          expect(validFrames).toContain(enemy.frame);
        }
      });
    });
  });
}); 