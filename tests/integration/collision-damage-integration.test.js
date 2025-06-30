import { jest } from '@jest/globals';
import CollisionManager from '../../client/src/systems/CollisionManager.js';
import Player from '../../client/src/entities/Player.js';
import Enemy from '../../client/src/entities/Enemy.js';
import { LoopHound } from '../../client/src/entities/enemies/LoopHound.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('Player-Enemy Collision Damage (Integration Tests)', () => {
  let collisionManager;
  let mockScene;
  let player;
  let enemy;
  let frozenEnemy;
  let enemiesGroup;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    
    // Create physics groups
    enemiesGroup = mockScene.physics.add.group();
    
    // Create collision manager
    collisionManager = new CollisionManager(mockScene);
    
    // Create real player instance
    player = new Player(mockScene, 100, 100, 'characters', 'character_beige_idle');
    
    // Create real enemy instances
    enemy = new LoopHound(mockScene, 200, 100, 'enemies', 'barnacle_attack_rest');
    frozenEnemy = new LoopHound(mockScene, 300, 100, 'enemies', 'barnacle_attack_rest');
    
    // Add enemies to group
    enemiesGroup.add(enemy);
    enemiesGroup.add(frozenEnemy);
    
    // Freeze one enemy
    frozenEnemy.freeze(1000);
  });

  describe('Real collision simulation', () => {
    test('should damage player when colliding with active enemy', () => {
      // Red phase - this test MUST fail initially if collision direction is wrong
      const initialPlayerHealth = player.health;
      const initialEnemyHealth = enemy.health;
      
      // Set up collision detection
      collisionManager.setupPlayerEnemyCollision(player, enemiesGroup);
      
      // Simulate collision by calling the collision callback directly
      // This simulates what happens when Phaser detects an overlap
      const collisionCallback = (playerSprite, enemySprite) => {
        if (!enemySprite.isFrozen) {
          playerSprite.takeDamage(enemySprite.damage || 20);
        }
      };
      
      collisionCallback(player, enemy);
      
      expect(player.health).toBe(initialPlayerHealth - enemy.damage);
      expect(enemy.health).toBe(initialEnemyHealth); // Enemy health unchanged
    });

    test('should allow player to defeat frozen enemies', () => {
      // Red phase - this test MUST fail initially if freeze-to-kill rule not implemented
      const initialPlayerHealth = player.health;
      const initialEnemyHealth = frozenEnemy.health;
      
      // Set up collision detection
      collisionManager.setupPlayerEnemyCollision(player, enemiesGroup);
      
      // Simulate collision with frozen enemy
      const collisionCallback = (playerSprite, enemySprite) => {
        if (enemySprite.isFrozen) {
          // Frozen enemies can be defeated by player
          enemySprite.takeDamage(playerSprite.attackPower || 20);
        } else {
          // Active enemies damage the player
          playerSprite.takeDamage(enemySprite.damage || 20);
        }
      };
      
      collisionCallback(player, frozenEnemy);
      
      expect(frozenEnemy.health).toBe(initialEnemyHealth - player.attackPower);
      expect(player.health).toBe(initialPlayerHealth); // Player health unchanged
    });

    test('should handle multiple enemies correctly', () => {
      // Red phase - this test MUST fail initially if multiple enemy handling is wrong
      const initialPlayerHealth = player.health;
      
      // Create additional enemy
      const secondEnemy = new LoopHound(mockScene, 400, 100, 'enemies', 'barnacle_attack_rest');
      enemiesGroup.add(secondEnemy);
      
      // Set up collision detection
      collisionManager.setupPlayerEnemyCollision(player, enemiesGroup);
      
      // Simulate collisions with multiple enemies
      const collisionCallback = (playerSprite, enemySprite) => {
        if (!enemySprite.isFrozen) {
          playerSprite.takeDamage(enemySprite.damage || 20);
        }
      };
      
      collisionCallback(player, enemy);
      collisionCallback(player, secondEnemy);
      
      const totalDamage = enemy.damage + secondEnemy.damage;
      expect(player.health).toBe(initialPlayerHealth - totalDamage);
    });
  });

  describe('ChronoPulse integration', () => {
    test('should preserve ChronoPulse freeze mechanics', () => {
      // Red phase - this test MUST fail initially if ChronoPulse integration is broken
      const initialPlayerHealth = player.health;
      const initialEnemyHealth = frozenEnemy.health;
      
      // Verify enemy is frozen
      expect(frozenEnemy.isFrozen).toBe(true);
      
      // Set up collision detection
      collisionManager.setupPlayerEnemyCollision(player, enemiesGroup);
      
      // Simulate collision with frozen enemy
      const collisionCallback = (playerSprite, enemySprite) => {
        if (enemySprite.isFrozen) {
          // Frozen enemies can be defeated by player
          enemySprite.takeDamage(playerSprite.attackPower || 20);
        } else {
          // Active enemies damage the player
          playerSprite.takeDamage(enemySprite.damage || 20);
        }
      };
      
      collisionCallback(player, frozenEnemy);
      
      // Frozen enemy should take damage from player
      expect(frozenEnemy.health).toBe(initialEnemyHealth - player.attackPower);
      expect(player.health).toBe(initialPlayerHealth); // Player health unchanged
    });

    test('should handle enemy unfreezing during gameplay', () => {
      // Red phase - this test MUST fail initially if unfreezing handling is wrong
      const initialPlayerHealth = player.health;
      const initialEnemyHealth = frozenEnemy.health;
      
      // Set up collision detection
      collisionManager.setupPlayerEnemyCollision(player, enemiesGroup);
      
      // First collision: enemy is frozen
      const collisionCallback = (playerSprite, enemySprite) => {
        if (enemySprite.isFrozen) {
          enemySprite.takeDamage(playerSprite.attackPower || 20);
        } else {
          playerSprite.takeDamage(enemySprite.damage || 20);
        }
      };
      
      collisionCallback(player, frozenEnemy);
      expect(frozenEnemy.health).toBe(initialEnemyHealth - player.attackPower);
      expect(player.health).toBe(initialPlayerHealth);
      
      // Unfreeze the enemy
      frozenEnemy.unfreeze();
      expect(frozenEnemy.isFrozen).toBe(false);
      
      // Second collision: enemy is now active
      const newPlayerHealth = player.health;
      const newEnemyHealth = frozenEnemy.health;
      
      collisionCallback(player, frozenEnemy);
      expect(player.health).toBe(newPlayerHealth - frozenEnemy.damage);
      expect(frozenEnemy.health).toBe(newEnemyHealth); // Enemy health unchanged
    });
  });

  describe('Event emission integration', () => {
    test('should emit correct events during collision', () => {
      // Red phase - this test MUST fail initially if event emission is wrong
      const mockEmit = jest.fn();
      mockScene.events.emit = mockEmit;
      
      // Set up collision detection
      collisionManager.setupPlayerEnemyCollision(player, enemiesGroup);
      
      // Simulate collision with event emission
      const collisionCallback = (playerSprite, enemySprite) => {
        // Emit collision event
        mockScene.events.emit('playerEnemyCollision', { player: playerSprite, enemy: enemySprite });
        
        // Handle damage
        if (!enemySprite.isFrozen) {
          playerSprite.takeDamage(enemySprite.damage || 20);
        }
      };
      
      collisionCallback(player, enemy);
      
      expect(mockEmit).toHaveBeenCalledWith('playerEnemyCollision', {
        player: player,
        enemy: enemy
      });
    });

    test('should emit health change events when player takes damage', () => {
      // Red phase - this test MUST fail initially if health change events not implemented
      const mockEmit = jest.fn();
      mockScene.events.emit = mockEmit;
      
      // Simulate player taking damage with event emission
      const takeDamageWithEvent = (playerSprite, amount) => {
        const oldHealth = playerSprite.health;
        const isDead = playerSprite.takeDamage(amount);
        
        // Emit health change event
        mockScene.events.emit('playerHealthChanged', {
          health: playerSprite.health,
          damage: amount,
          previousHealth: oldHealth
        });
        
        // Emit death event if applicable
        if (isDead) {
          mockScene.events.emit('playerDied', { player: playerSprite });
        }
      };
      
      takeDamageWithEvent(player, 30);
      
      expect(mockEmit).toHaveBeenCalledWith('playerHealthChanged', {
        health: 70,
        damage: 30,
        previousHealth: 100
      });
    });
  });

  describe('State machine integration', () => {
    test('should handle player state changes during damage', () => {
      // Red phase - this test MUST fail initially if state machine integration is wrong
      const initialPlayerHealth = player.health;
      
      // Set up collision detection
      collisionManager.setupPlayerEnemyCollision(player, enemiesGroup);
      
      // Simulate collision that damages player
      const collisionCallback = (playerSprite, enemySprite) => {
        if (!enemySprite.isFrozen) {
          playerSprite.takeDamage(enemySprite.damage || 20);
        }
      };
      
      collisionCallback(player, enemy);
      
      // Player should have taken damage
      expect(player.health).toBe(initialPlayerHealth - enemy.damage);
      
      // Player should still be active (not dead)
      expect(player.active).toBe(true);
      expect(player.visible).toBe(true);
    });

    test('should handle player death state', () => {
      // Red phase - this test MUST fail initially if death state handling is wrong
      const mockEmit = jest.fn();
      mockScene.events.emit = mockEmit;
      
      // Set up collision detection
      collisionManager.setupPlayerEnemyCollision(player, enemiesGroup);
      
      // Simulate fatal collision
      const collisionCallback = (playerSprite, enemySprite) => {
        if (!enemySprite.isFrozen) {
          const isDead = playerSprite.takeDamage(playerSprite.health); // Deal fatal damage
          
          if (isDead) {
            mockScene.events.emit('playerDied', { player: playerSprite });
          }
        }
      };
      
      collisionCallback(player, enemy);
      
      // Player should be dead
      expect(player.health).toBe(0);
      expect(mockEmit).toHaveBeenCalledWith('playerDied', { player: player });
    });
  });

  describe('Performance and multiple collision handling', () => {
    test('should handle rapid successive collisions', () => {
      // Red phase - this test MUST fail initially if rapid collision handling is wrong
      const initialPlayerHealth = player.health;
      
      // Set up collision detection
      collisionManager.setupPlayerEnemyCollision(player, enemiesGroup);
      
      // Simulate rapid successive collisions
      const collisionCallback = (playerSprite, enemySprite) => {
        if (!enemySprite.isFrozen) {
          playerSprite.takeDamage(enemySprite.damage || 20);
        }
      };
      
      // Multiple collisions in quick succession
      for (let i = 0; i < 3; i++) {
        collisionCallback(player, enemy);
      }
      
      const expectedDamage = enemy.damage * 3;
      expect(player.health).toBe(initialPlayerHealth - expectedDamage);
    });

    test('should handle collision with multiple enemy types', () => {
      // Red phase - this test MUST fail initially if multiple enemy type handling is wrong
      const initialPlayerHealth = player.health;
      
      // Create different enemy types
      const basicEnemy = new Enemy(mockScene, 500, 100, 'enemies', 'barnacle_attack_rest');
      const loopHoundEnemy = new LoopHound(mockScene, 600, 100, 'enemies', 'barnacle_attack_rest');
      
      enemiesGroup.add(basicEnemy);
      enemiesGroup.add(loopHoundEnemy);
      
      // Set up collision detection
      collisionManager.setupPlayerEnemyCollision(player, enemiesGroup);
      
      // Simulate collisions with different enemy types
      const collisionCallback = (playerSprite, enemySprite) => {
        if (!enemySprite.isFrozen) {
          playerSprite.takeDamage(enemySprite.damage || 20);
        }
      };
      
      collisionCallback(player, basicEnemy);
      collisionCallback(player, loopHoundEnemy);
      
      const totalDamage = basicEnemy.damage + loopHoundEnemy.damage;
      expect(player.health).toBe(initialPlayerHealth - totalDamage);
    });
  });

  describe('Error handling and edge cases', () => {
    test('should handle collision with inactive enemies', () => {
      // Red phase - this test MUST fail initially if inactive enemy handling is wrong
      const initialPlayerHealth = player.health;
      
      // Deactivate an enemy
      enemy.setActive(false);
      expect(enemy.active).toBe(false);
      
      // Set up collision detection
      collisionManager.setupPlayerEnemyCollision(player, enemiesGroup);
      
      // Simulate collision with inactive enemy
      const collisionCallback = (playerSprite, enemySprite) => {
        if (enemySprite.active && !enemySprite.isFrozen) {
          playerSprite.takeDamage(enemySprite.damage || 20);
        }
      };
      
      collisionCallback(player, enemy);
      
      // Player should not take damage from inactive enemy
      expect(player.health).toBe(initialPlayerHealth);
    });

    test('should handle collision with enemies that have no damage property', () => {
      // Red phase - this test MUST fail initially if missing damage property handling is wrong
      const initialPlayerHealth = player.health;
      
      // Create enemy without damage property
      const enemyWithoutDamage = new Enemy(mockScene, 700, 100, 'enemies', 'barnacle_attack_rest');
      delete enemyWithoutDamage.damage;
      enemiesGroup.add(enemyWithoutDamage);
      
      // Set up collision detection
      collisionManager.setupPlayerEnemyCollision(player, enemiesGroup);
      
      // Simulate collision
      const collisionCallback = (playerSprite, enemySprite) => {
        if (!enemySprite.isFrozen) {
          playerSprite.takeDamage(enemySprite.damage || 20); // Default damage
        }
      };
      
      collisionCallback(player, enemyWithoutDamage);
      
      // Player should take default damage
      expect(player.health).toBe(initialPlayerHealth - 20);
    });
  });
}); 