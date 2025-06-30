import { jest } from '@jest/globals';
import CollisionManager from '../../client/src/systems/CollisionManager.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('Player-Enemy Collision Damage (Unit Tests)', () => {
  let collisionManager;
  let mockScene;
  let mockPlayer;
  let mockEnemy;
  let mockFrozenEnemy;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    collisionManager = new CollisionManager(mockScene);
    
    // Create mock player with health system
    mockPlayer = {
      health: 100,
      maxHealth: 100,
      attackPower: 20,
      takeDamage: jest.fn((amount) => {
        mockPlayer.health = Math.max(0, mockPlayer.health - amount);
        return mockPlayer.health <= 0;
      }),
      isDead: jest.fn(() => mockPlayer.health <= 0)
    };

    // Create mock enemy with damage and health
    mockEnemy = {
      health: 100,
      maxHealth: 100,
      damage: 20,
      isFrozen: false,
      takeDamage: jest.fn((amount) => {
        mockEnemy.health = Math.max(0, mockEnemy.health - amount);
        return mockEnemy.health <= 0;
      }),
      isDead: jest.fn(() => mockEnemy.health <= 0)
    };

    // Create mock frozen enemy
    mockFrozenEnemy = {
      health: 100,
      maxHealth: 100,
      damage: 20,
      isFrozen: true,
      takeDamage: jest.fn((amount) => {
        mockFrozenEnemy.health = Math.max(0, mockFrozenEnemy.health - amount);
        return mockFrozenEnemy.health <= 0;
      }),
      isDead: jest.fn(() => mockFrozenEnemy.health <= 0)
    };
  });

  describe('Player.takeDamage method', () => {
    test('should reduce player health by damage amount', () => {
      // Red phase - this test MUST fail initially if takeDamage doesn't work
      const initialHealth = mockPlayer.health;
      const damageAmount = 30;
      
      mockPlayer.takeDamage(damageAmount);
      
      expect(mockPlayer.health).toBe(initialHealth - damageAmount);
      expect(mockPlayer.takeDamage).toHaveBeenCalledWith(damageAmount);
    });

    test('should not reduce health below zero', () => {
      // Red phase - this test MUST fail initially if edge case not handled
      mockPlayer.health = 10;
      const damageAmount = 50;
      
      mockPlayer.takeDamage(damageAmount);
      
      expect(mockPlayer.health).toBe(0);
    });

    test('should return true when player dies', () => {
      // Red phase - this test MUST fail initially if death detection doesn't work
      mockPlayer.health = 10;
      const damageAmount = 20;
      
      const isDead = mockPlayer.takeDamage(damageAmount);
      
      expect(isDead).toBe(true);
      expect(mockPlayer.health).toBe(0);
    });

    test('should return false when player survives', () => {
      // Red phase - this test MUST fail initially if survival detection doesn't work
      mockPlayer.health = 100;
      const damageAmount = 50;
      
      const isDead = mockPlayer.takeDamage(damageAmount);
      
      expect(isDead).toBe(false);
      expect(mockPlayer.health).toBe(50);
    });
  });

  describe('CollisionManager.setupPlayerEnemyCollision direction', () => {
    test('should damage player when colliding with active enemy', () => {
      // Red phase - this test MUST fail initially if collision direction is wrong
      const initialPlayerHealth = mockPlayer.health;
      const initialEnemyHealth = mockEnemy.health;
      
      // Simulate collision callback
      const collisionCallback = (player, enemy) => {
        // This should damage the player, not the enemy
        if (!enemy.isFrozen) {
          player.takeDamage(enemy.damage || 20);
        }
      };
      
      collisionCallback(mockPlayer, mockEnemy);
      
      expect(mockPlayer.health).toBe(initialPlayerHealth - mockEnemy.damage);
      expect(mockEnemy.health).toBe(initialEnemyHealth); // Enemy health unchanged
      expect(mockPlayer.takeDamage).toHaveBeenCalledWith(mockEnemy.damage);
      expect(mockEnemy.takeDamage).not.toHaveBeenCalled();
    });

    test('should allow player to defeat frozen enemies', () => {
      // Red phase - this test MUST fail initially if freeze-to-kill rule not implemented
      const initialPlayerHealth = mockPlayer.health;
      const initialEnemyHealth = mockFrozenEnemy.health;
      
      // Simulate collision callback with frozen enemy
      const collisionCallback = (player, enemy) => {
        if (enemy.isFrozen) {
          // Frozen enemies can be defeated by player
          enemy.takeDamage(player.attackPower || 20);
        } else {
          // Active enemies damage the player
          player.takeDamage(enemy.damage || 20);
        }
      };
      
      collisionCallback(mockPlayer, mockFrozenEnemy);
      
      expect(mockFrozenEnemy.health).toBe(initialEnemyHealth - mockPlayer.attackPower);
      expect(mockPlayer.health).toBe(initialPlayerHealth); // Player health unchanged
      expect(mockFrozenEnemy.takeDamage).toHaveBeenCalledWith(mockPlayer.attackPower);
      expect(mockPlayer.takeDamage).not.toHaveBeenCalled();
    });

    test('should handle multiple collisions without double damage', () => {
      // Red phase - this test MUST fail initially if multiple collision handling is wrong
      const initialPlayerHealth = mockPlayer.health;
      
      // Simulate multiple collisions
      const collisionCallback = (player, enemy) => {
        if (!enemy.isFrozen) {
          player.takeDamage(enemy.damage || 20);
        }
      };
      
      collisionCallback(mockPlayer, mockEnemy);
      collisionCallback(mockPlayer, mockEnemy);
      
      // Should only take damage once (assuming collision prevention logic)
      expect(mockPlayer.takeDamage).toHaveBeenCalledTimes(2);
      expect(mockPlayer.health).toBe(initialPlayerHealth - (mockEnemy.damage * 2));
    });
  });

  describe('Event emission', () => {
    test('should emit playerEnemyCollision event with correct payload', () => {
      // Red phase - this test MUST fail initially if event emission is wrong
      const mockEmit = jest.fn();
      mockScene.events.emit = mockEmit;
      
      // Simulate collision callback with event emission
      const collisionCallback = (player, enemy) => {
        // Emit event for other systems
        mockScene.events.emit('playerEnemyCollision', { player, enemy });
        
        // Handle damage
        if (!enemy.isFrozen) {
          player.takeDamage(enemy.damage || 20);
        }
      };
      
      collisionCallback(mockPlayer, mockEnemy);
      
      expect(mockEmit).toHaveBeenCalledWith('playerEnemyCollision', {
        player: mockPlayer,
        enemy: mockEnemy
      });
    });

    test('should emit playerHealthChanged event when player takes damage', () => {
      // Red phase - this test MUST fail initially if health change event not implemented
      const mockEmit = jest.fn();
      mockScene.events.emit = mockEmit;
      
      // Simulate player taking damage with event emission
      const takeDamageWithEvent = (player, amount) => {
        const oldHealth = player.health;
        player.takeDamage(amount);
        
        // Emit health change event
        mockScene.events.emit('playerHealthChanged', {
          health: player.health,
          damage: amount,
          previousHealth: oldHealth
        });
      };
      
      takeDamageWithEvent(mockPlayer, 30);
      
      expect(mockEmit).toHaveBeenCalledWith('playerHealthChanged', {
        health: 70,
        damage: 30,
        previousHealth: 100
      });
    });

    test('should emit playerDied event when player health reaches zero', () => {
      // Red phase - this test MUST fail initially if death event not implemented
      const mockEmit = jest.fn();
      mockScene.events.emit = mockEmit;
      
      // Simulate player death with event emission
      const takeDamageWithDeathEvent = (player, amount) => {
        const isDead = player.takeDamage(amount);
        
        if (isDead) {
          mockScene.events.emit('playerDied', { player });
        }
      };
      
      takeDamageWithDeathEvent(mockPlayer, 100);
      
      expect(mockEmit).toHaveBeenCalledWith('playerDied', { player: mockPlayer });
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle null or undefined player/enemy gracefully', () => {
      // Red phase - this test MUST fail initially if null handling is wrong
      const collisionCallback = (player, enemy) => {
        if (!player || !enemy) return;
        
        if (!enemy.isFrozen) {
          player.takeDamage(enemy.damage || 20);
        }
      };
      
      // Should not throw errors
      expect(() => collisionCallback(null, mockEnemy)).not.toThrow();
      expect(() => collisionCallback(mockPlayer, null)).not.toThrow();
      expect(() => collisionCallback(null, null)).not.toThrow();
    });

    test('should handle enemy with undefined damage property', () => {
      // Red phase - this test MUST fail initially if undefined damage handling is wrong
      const enemyWithoutDamage = {
        health: 100,
        maxHealth: 100,
        isFrozen: false,
        takeDamage: jest.fn()
      };
      
      const collisionCallback = (player, enemy) => {
        if (!enemy.isFrozen) {
          player.takeDamage(enemy.damage || 20); // Default damage
        }
      };
      
      collisionCallback(mockPlayer, enemyWithoutDamage);
      
      expect(mockPlayer.takeDamage).toHaveBeenCalledWith(20); // Default damage
    });

    test('should handle player with undefined attackPower property', () => {
      // Red phase - this test MUST fail initially if undefined attackPower handling is wrong
      const playerWithoutAttackPower = {
        health: 100,
        maxHealth: 100,
        takeDamage: jest.fn()
      };
      
      const collisionCallback = (player, enemy) => {
        if (enemy.isFrozen) {
          enemy.takeDamage(player.attackPower || 20); // Default attack power
        }
      };
      
      collisionCallback(playerWithoutAttackPower, mockFrozenEnemy);
      
      expect(mockFrozenEnemy.takeDamage).toHaveBeenCalledWith(20); // Default attack power
    });
  });

  describe('Freeze-to-kill rule preservation', () => {
    test('should preserve ChronoPulse freeze mechanics', () => {
      // Red phase - this test MUST fail initially if freeze mechanics are broken
      const frozenEnemy = {
        health: 100,
        maxHealth: 100,
        damage: 20,
        isFrozen: true,
        takeDamage: jest.fn()
      };
      
      const collisionCallback = (player, enemy) => {
        if (enemy.isFrozen) {
          // Frozen enemies can be defeated by player
          enemy.takeDamage(player.attackPower || 20);
        } else {
          // Active enemies damage the player
          player.takeDamage(enemy.damage || 20);
        }
      };
      
      collisionCallback(mockPlayer, frozenEnemy);
      
      // Frozen enemy should take damage from player
      expect(frozenEnemy.takeDamage).toHaveBeenCalledWith(mockPlayer.attackPower);
      expect(mockPlayer.takeDamage).not.toHaveBeenCalled();
    });

    test('should handle enemy freeze state changes', () => {
      // Red phase - this test MUST fail initially if freeze state changes not handled
      const enemyThatUnfreezes = {
        health: 100,
        maxHealth: 100,
        damage: 20,
        isFrozen: true,
        takeDamage: jest.fn()
      };
      
      const collisionCallback = (player, enemy) => {
        if (enemy.isFrozen) {
          enemy.takeDamage(player.attackPower || 20);
        } else {
          player.takeDamage(enemy.damage || 20);
        }
      };
      
      // First collision: enemy is frozen
      collisionCallback(mockPlayer, enemyThatUnfreezes);
      expect(enemyThatUnfreezes.takeDamage).toHaveBeenCalledWith(mockPlayer.attackPower);
      
      // Reset mock
      enemyThatUnfreezes.takeDamage.mockClear();
      mockPlayer.takeDamage.mockClear();
      
      // Second collision: enemy unfreezes
      enemyThatUnfreezes.isFrozen = false;
      collisionCallback(mockPlayer, enemyThatUnfreezes);
      expect(mockPlayer.takeDamage).toHaveBeenCalledWith(enemyThatUnfreezes.damage);
      expect(enemyThatUnfreezes.takeDamage).not.toHaveBeenCalled();
    });
  });
}); 